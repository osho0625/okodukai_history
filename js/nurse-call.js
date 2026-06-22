// ナースコール メインロジック
// - 呼び出しボタン + Edge Function呼び出し
// - クールダウン制御
// - Realtime応答受信
// - オフラインキュー
// - 親側: いくよ + 対応完了

(function() {
  'use strict';

  // ============================================================
  // 設定
  // ============================================================
  const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/push-nurse-call`;
  const OFFLINE_QUEUE_KEY = 'nurse_call_offline_queue';
  const CURRENT_CALL_KEY = 'nurse_call_current_call_id';

  // ============================================================
  // 純粋関数（テスト可能）
  // ============================================================

  function buildChannelName(childId, callId) {
    return `nurse-call:${childId}:${callId}`;
  }

  function buildNotifyUrl(childId, callId) {
    return `/pages/nurse-call.html?child_id=${childId}&call_id=${callId}`;
  }

  function shouldAcceptMessage(msg, localState) {
    return msg.child_id === localState.childId && msg.call_id === localState.callId;
  }

  function isCacheValid(cache, now) {
    if (!cache || !cache.updated_at) return false;
    const TTL = 5 * 60 * 1000;
    return (now - new Date(cache.updated_at).getTime()) < TTL;
  }

  function shouldRedirect(nurseCallMode, currentPath) {
    return nurseCallMode === true && !currentPath.includes('nurse-call.html');
  }

  // ============================================================
  // オフラインキュー
  // ============================================================

  const offlineQueue = {
    push(payload) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(payload));
    },
    peek() {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    clear() {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  };

  // ============================================================
  // 状態
  // ============================================================

  let state = {
    childId: null,
    childName: null,
    callId: null,
    selectedReason: null,
    channel: null,
    isParent: false,
    authSession: null
  };

  // ============================================================
  // DOM参照
  // ============================================================

  const callBtn = document.getElementById('callBtn');
  const reasonBtns = document.querySelectorAll('.reason-btn');
  const statusMsg = document.getElementById('statusMsg');
  const parentSection = document.getElementById('parentSection');
  const ikuyoBtn = document.getElementById('ikuyoBtn');
  const modeBadge = document.getElementById('modeBadge');

  // ============================================================
  // 初期化
  // ============================================================

  const NURSE_CALL_NAME_KEY = 'nurse_call_child_name';

  async function init() {
    // URLパラメータ確認
    const params = new URLSearchParams(location.search);
    const childId = params.get('child_id');
    const callId = params.get('call_id');

    if (isAdmin) {
      // 親側モード（admin端末は常に親画面）
      state.isParent = true;
      if (childId && callId) {
        state.childId = childId;
        state.callId = callId;
      } else {
        // URLにcall_idなし → 最新のactive callを取得
        const { data: latestCall } = await client.from('nurse_calls')
          .select('id, child_id, child_name')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestCall) {
          state.childId = latestCall.child_id;
          state.childName = latestCall.child_name;
          state.callId = latestCall.id;
        }
      }
      // 子供名をDBから取得（childIdがある場合）
      if (state.childId && !state.childName) {
        const { data } = await client.from('children').select('name').eq('id', state.childId).maybeSingle();
        state.childName = data?.name || '';
      }
      initParentMode();
      await continueInit();
    } else {
      // 子供側: 名前ベースで特定
      const savedName = localStorage.getItem(NURSE_CALL_NAME_KEY);

      if (savedName) {
        // 保存済み名前あり → そのまま使用
        await resolveChildByName(savedName);
        showNameDisplay(savedName);
      } else {
        // 初回: 名前選択モーダル表示
        await showNamePicker();
        // 名前選択後にcontinueInitが呼ばれる
        return;
      }
    }

    await continueInit();
  }

  async function continueInit() {
    // push_device_id確保
    if (!localStorage.getItem('push_device_id')) {
      const newId = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      localStorage.setItem('push_device_id', newId);
    }

    // ナースコールモード表示
    const cache = JSON.parse(localStorage.getItem('device_lock_cache') || 'null');
    if (cache && cache.nurse_call_mode) {
      modeBadge.style.display = 'inline-block';
    }

    // Anonymous Auth セッション確立
    await ensureAuthSession();

    // 既存のactive call_idがあればチャネル購読
    if (!state.callId) {
      state.callId = localStorage.getItem(CURRENT_CALL_KEY) || null;
    }
    if (state.callId && state.childId) {
      subscribeChannel(state.callId);
    }

    // オフラインキュー自動送信
    window.addEventListener('online', flushOfflineQueue);
    if (navigator.onLine) flushOfflineQueue();

    // 子供側UI設定
    if (!state.isParent) {
      initChildMode();
    }

    // 初期化完了
  }

  // 名前から子供を特定
  async function resolveChildByName(name) {
    const { data } = await client.from('children')
      .select('id, name')
      .eq('name', name)
      .maybeSingle();
    if (data) {
      state.childId = data.id;
      state.childName = data.name;
    } else {
      // 名前がDB内に見つからない → フリー入力の名前をそのまま使う
      state.childName = name;
      // child_id無しでもEdge Functionは動く（child_nameで通知）
      // childrenテーブルに存在しない場合は最初の子供のIDを仮使用
      const { data: first } = await client.from('children')
        .select('id').order('sort_order', { ascending: true }).limit(1).maybeSingle();
      if (first) state.childId = first.id;
    }
    // device_settings更新
    const deviceId = localStorage.getItem('push_device_id');
    if (deviceId && state.childId) {
      await client.from('device_settings').upsert({
        device_id: deviceId,
        child_id: state.childId,
        nurse_call_mode: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'device_id' }).then(() => {}).catch(() => {});
    }
  }

  // 名前選択モーダル（ハードコード: はるちか、いろは、かいせい）
  const NURSE_CALL_CHILDREN = [
    { name: 'はるちか' },
    { name: 'いろは' },
    { name: 'かいせい' }
  ];

  async function showNamePicker() {
    const overlay = document.getElementById('nameOverlay');
    const btnsContainer = document.getElementById('nameButtons');

    btnsContainer.innerHTML = NURSE_CALL_CHILDREN.map(c =>
      `<button class="name-pick-btn" data-name="${c.name}" style="padding:16px; border:2px solid #ff8a65; border-radius:12px; background:#fff; font-size:1.2em; font-weight:600; cursor:pointer;">${c.name}</button>`
    ).join('');

    overlay.style.display = 'flex';

    btnsContainer.querySelectorAll('.name-pick-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const name = btn.dataset.name;
        localStorage.setItem(NURSE_CALL_NAME_KEY, name);
        overlay.style.display = 'none';
        await resolveChildByName(name);
        showNameDisplay(name);
        await continueInit();
      });
    });
  }

  // 名前表示（タップで変更）
  function showNameDisplay(name) {
    const display = document.getElementById('nameDisplay');
    const label = document.getElementById('nameLabel');
    display.style.display = 'block';
    label.textContent = name;

    label.onclick = async () => {
      localStorage.removeItem(NURSE_CALL_NAME_KEY);
      await showNamePicker();
    };
    // ✏️もクリック対象
    display.querySelector('span:last-child').onclick = label.onclick;
  }


  // ============================================================
  // Anonymous Auth
  // ============================================================

  async function ensureAuthSession() {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
      state.authSession = session;
      return;
    }
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      console.error('Anonymous auth failed:', error);
      return;
    }
    state.authSession = data.session;
  }

  function getAccessToken() {
    return state.authSession?.access_token || '';
  }

  // ============================================================
  // 子供側モード
  // ============================================================

  function initChildMode() {
    if (!state.isParent) {
      parentSection.style.display = 'none';
    }

    // 理由ボタン: タップで即座に送信（はきそうはサブ選択表示）
    reasonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.hasSub) {
          // モーダル表示
          const modal = document.getElementById('hakisoModal');
          modal.style.display = 'flex';
        } else {
          sendCall(btn.dataset.reason);
        }
      });
    });

    // はきそうサブ選択ボタン
    document.querySelectorAll('.reason-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('hakisoModal').style.display = 'none';
        sendCall(btn.dataset.reason);
      });
    });

    // モーダル背景タップで閉じる
    document.getElementById('hakisoModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('hakisoModal')) {
        document.getElementById('hakisoModal').style.display = 'none';
      }
    });

    // 🔔ボタン: 理由なしで送信
    callBtn.addEventListener('click', () => sendCall(null));
  }

  // ============================================================
  // 呼び出し実行
  // ============================================================

  async function sendCall(reason) {
    if (!state.childId && !state.childName) {
      showStatus('設定がまだだよ', 'error');
      return;
    }

    // オフライン時
    if (!navigator.onLine) {
      offlineQueue.push({
        child_id: state.childId || '',
        child_name: state.childName || '',
        reason: reason || null,
        device_id: localStorage.getItem('push_device_id') || '',
        queued_at: new Date().toISOString()
      });
      showStatus('ネットがつながっていないけど、つながったらおくるね', 'info');
      return;
    }

    // Edge Function呼び出し
    callBtn.disabled = true;
    reasonBtns.forEach(btn => btn.disabled = true);
    showStatus('おくっているよ...', 'info');

    try {
      const token = getAccessToken();
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
          child_id: state.childId || '',
          child_name: state.childName || '',
          reason: reason || null,
          device_id: localStorage.getItem('push_device_id') || ''
        })
      });

      const data = await res.json();

      if (res.status === 200) {
        state.callId = data.call_id;
        localStorage.setItem(CURRENT_CALL_KEY, data.call_id);
        subscribeChannel(data.call_id);

        if (data.notification_status === 'sent' || data.notification_status === 'partial') {
          showStatus('おくったよ！', 'success');
        } else {
          showStatus('おくったけど、とどかなかったかも', 'info');
        }
      } else if (res.status === 429) {
        showStatus('まだおくれないよ。すこしまってね', 'info');
      } else if (res.status === 401) {
        await ensureAuthSession();
        showStatus('おくれなかったよ。もういちどおしてね', 'error');
      } else {
        showStatus('おくれなかったよ。もういちどおしてね', 'error');
      }
    } catch (e) {
      if (!navigator.onLine) {
        offlineQueue.push({
          child_id: state.childId || '',
          child_name: state.childName || '',
          reason: reason || null,
          device_id: localStorage.getItem('push_device_id') || '',
          queued_at: new Date().toISOString()
        });
        showStatus('ネットがつながっていないけど、つながったらおくるね', 'info');
      } else {
        showStatus('おくれなかったよ。もういちどおしてね', 'error');
      }
    }

    // ボタン即再有効化（クールダウンなし）
    callBtn.disabled = false;
    reasonBtns.forEach(btn => btn.disabled = false);
  }

  // ============================================================
  // オフラインキュー送信
  // ============================================================

  async function flushOfflineQueue() {
    const queued = offlineQueue.peek();
    if (!queued || !navigator.onLine) return;

    try {
      const token = getAccessToken();
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify(queued)
      });

      if (res.ok) {
        const data = await res.json();
        offlineQueue.clear();
        state.callId = data.call_id;
        localStorage.setItem(CURRENT_CALL_KEY, data.call_id);
        subscribeChannel(data.call_id);
        showStatus('おくったよ！', 'success');
      }
    } catch (e) {
      // リトライは次のonlineイベントで
    }
  }

  // ============================================================
  // Realtimeチャネル
  // ============================================================

  function subscribeChannel(callId) {
    // 既存チャネルがあれば解除
    if (state.channel) {
      client.removeChannel(state.channel);
    }

    const channelName = buildChannelName(state.childId, callId);
    state.channel = client.channel(channelName);

    state.channel
      .on('broadcast', { event: 'response' }, (payload) => {
        const msg = payload.payload;
        if (msg.action === 'iku_yo' && !state.isParent) {
          showResponseOverlay(msg.text || '今行くよ💨');
        }
      })
      .on('broadcast', { event: 'session' }, (payload) => {
        const msg = payload.payload;
        if (msg.action === 'resolved') {
          showStatus('おわったよ！おだいじにね', 'success');
          localStorage.removeItem(CURRENT_CALL_KEY);
        }
      })
      .subscribe();
  }

  // ============================================================
  // 親側モード
  // ============================================================

  function initParentMode() {
    // ホームビューを完全に非表示にして親セクションだけ表示
    document.getElementById('viewHome').innerHTML = '';
    parentSection.classList.add('visible');
    parentSection.style.display = 'block';
    document.getElementById('viewHome').appendChild(parentSection);

    // active callがない場合
    if (!state.callId) {
      showStatus('呼び出しはまだありません', 'info');
      ikuyoBtn.disabled = true;
      pollForNewCalls();
    } else {
      // 呼び出し元の名前を表示
      if (state.childName) {
        showStatus(`📳 ${state.childName}から呼ばれています`, 'info');
      }
    }

    subscribeChannel(state.callId);

    ikuyoBtn.addEventListener('click', async () => {
      // Realtime broadcast
      const channelName = buildChannelName(state.childId, state.callId);
      const channel = client.channel(channelName);
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'response',
        payload: { action: 'iku_yo', text: 'すぐ行くよ💨' }
      });

      // DB更新
      await client.from('nurse_calls')
        .update({ responded_at: new Date().toISOString() })
        .eq('id', state.callId);

      ikuyoBtn.disabled = true;
      ikuyoBtn.textContent = 'おくったよ！';
      showStatus('✅ いくよ！をおくりました', 'success');
      // 3秒後に再有効化
      setTimeout(() => {
        ikuyoBtn.disabled = false;
        ikuyoBtn.textContent = 'いくよ！';
      }, 3000);
    });

    // 親側: 返信ボタン（1分待って、3分待って、5分待って、電話かけて）
    document.querySelectorAll('.parent-reply-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const msg = btn.dataset.msg;
        // Realtimeで子供にポップ通知
        if (state.channel) {
          state.channel.send({ type: 'broadcast', event: 'response', payload: { action: 'iku_yo', text: msg } });
        }
        // チャットにも投稿
        if (window.NurseCallChat) NurseCallChat.sendMessage(msg);
        btn.style.opacity = '0.5';
        setTimeout(() => { btn.style.opacity = '1'; }, 2000);
      });
    });

    // 親側: チャットボタン
    const parentChatBtn = document.getElementById('parentChatBtn');
    if (parentChatBtn) {
      parentChatBtn.addEventListener('click', () => {
        // チャットセクションを表示/非表示トグル
        let chatSection = document.getElementById('parentChatSection');
        if (!chatSection) {
          // チャットUIを親セクションに追加
          const html = `<div id="parentChatSection" style="margin-top:16px; background:#fff; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <div id="chatMessages" style="height:200px; overflow-y:auto; margin-bottom:10px;"></div>
            <div style="display:flex; gap:8px;">
              <input type="text" id="chatInput" placeholder="メッセージ..." maxlength="500" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:1em;">
              <button id="chatSendBtn" style="padding:10px 16px; border:none; border-radius:8px; background:#1976d2; color:#fff; font-weight:600; cursor:pointer;">送信</button>
            </div>
          </div>`;
          parentSection.insertAdjacentHTML('beforeend', html);
          chatSection = document.getElementById('parentChatSection');
          // チャット初期化
          if (window.NurseCallChat) {
            NurseCallChat.init(state.callId || 'default', state.childId || '', 'parent');
          }
          document.getElementById('chatSendBtn').addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            if (input.value.trim()) { NurseCallChat.sendMessage(input.value); input.value = ''; }
          });
          document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); document.getElementById('chatSendBtn').click(); }
          });
        } else {
          chatSection.style.display = chatSection.style.display === 'none' ? 'block' : 'none';
        }
      });
    }

    // 親側: でんわするボタン
    const parentCallBtn = document.getElementById('parentCallBtn');
    if (parentCallBtn) {
      parentCallBtn.addEventListener('click', async () => {
        parentCallBtn.style.display = 'none';
        const endBtn = document.getElementById('parentEndCallBtn');
        const statusEl = document.getElementById('parentVoiceStatus');
        if (endBtn) endBtn.style.display = 'block';
        if (statusEl) statusEl.textContent = '📳 呼び出し中...';
        // 発信（init済みなのでstartCallのみ）
        if (window.NurseCallVoice) {
          await NurseCallVoice.startCall();
        }
      });
    }

    // 親側: 音声通話初期化（ページ読み込み時に1回だけ。チャネル重複防止）
    if (window.NurseCallVoice) {
      NurseCallVoice.init(state.callId || 'default', state.childId || '', 'parent');
      NurseCallVoice.onStateChange((voiceState) => {
        const statusEl = document.getElementById('parentVoiceStatus');
        const acceptBtn = document.getElementById('parentAcceptCallBtn');
        const endBtn = document.getElementById('parentEndCallBtn');
        const videoBtn = document.getElementById('parentVideoBtn');
        if (voiceState === 'ringing') {
          if (acceptBtn) acceptBtn.style.display = 'block';
          if (parentCallBtn) parentCallBtn.style.display = 'none';
          if (videoBtn) videoBtn.style.display = 'none';
          if (statusEl) statusEl.textContent = '📳 電話がきています...';
        } else if (voiceState === 'connected') {
          if (acceptBtn) acceptBtn.style.display = 'none';
          if (endBtn) endBtn.style.display = 'block';
          if (parentCallBtn) parentCallBtn.style.display = 'none';
          if (videoBtn) videoBtn.style.display = 'block';
          if (statusEl) statusEl.textContent = '📞 通話中';
        } else if (voiceState === 'idle') {
          if (acceptBtn) acceptBtn.style.display = 'none';
          if (endBtn) endBtn.style.display = 'none';
          if (videoBtn) videoBtn.style.display = 'none';
          if (parentCallBtn) parentCallBtn.style.display = 'block';
          if (statusEl) statusEl.textContent = '';
        }
      });
    }

    // でんわにでるボタン
    const parentAcceptBtn = document.getElementById('parentAcceptCallBtn');
    if (parentAcceptBtn) {
      parentAcceptBtn.addEventListener('click', async () => {
        parentAcceptBtn.style.display = 'none';
        const endBtn = document.getElementById('parentEndCallBtn');
        const statusEl = document.getElementById('parentVoiceStatus');
        if (endBtn) endBtn.style.display = 'block';
        if (statusEl) statusEl.textContent = '📞 通話中';
        if (window.NurseCallVoice) await NurseCallVoice.acceptCall();
      });
    }

    // きるボタン
    const parentEndBtn = document.getElementById('parentEndCallBtn');
    if (parentEndBtn) {
      parentEndBtn.addEventListener('click', () => {
        parentEndBtn.style.display = 'none';
        if (parentCallBtn) parentCallBtn.style.display = 'block';
        const statusEl = document.getElementById('parentVoiceStatus');
        if (statusEl) statusEl.textContent = '';
        if (window.NurseCallVoice) NurseCallVoice.endCall();
      });
    }
  }

  // ============================================================
  // 親側: 新しい呼び出しをポーリングで待機
  // ============================================================

  function pollForNewCalls() {
    const pollInterval = setInterval(async () => {
      const { data } = await client.from('nurse_calls')
        .select('id, child_id, child_name')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        clearInterval(pollInterval);
        state.childId = data.child_id;
        state.childName = data.child_name;
        state.callId = data.id;
        showStatus(`📳 ${data.child_name}から呼ばれています`, 'info');
        ikuyoBtn.disabled = false;
        subscribeChannel(data.id);
      }
    }, 5000); // 5秒毎にチェック
  }

  // ============================================================
  // UI ヘルパー
  // ============================================================

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
  }

  function showResponseOverlay(text) {
    const container = document.getElementById('ikuyoPopupContainer');
    if (!container) return;

    const popup = document.createElement('div');
    popup.style.cssText = 'background:#fff; border-radius:16px; padding:14px 20px; box-shadow:0 4px 16px rgba(0,0,0,0.15); font-size:1.2em; font-weight:600; color:#333; cursor:pointer; animation:popIn 0.3s ease-out; transition:all 0.3s ease;';
    popup.textContent = text || '今行くよ💨';
    popup.addEventListener('click', () => {
      popup.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => popup.remove(), 300);
    });
    container.insertBefore(popup, container.firstChild);
  }

  // ============================================================
  // 起動
  // ============================================================

  init();

  // グローバル公開（テスト用）
  window.NurseCall = {
    buildChannelName,
    buildNotifyUrl,
    shouldAcceptMessage,
    isCacheValid,
    shouldRedirect,
    offlineQueue,
    getAccessToken,
    state
  };

})();
