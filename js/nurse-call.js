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
  const COOLDOWN_SEC = 30;
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
    cooldownRemaining: 0,
    cooldownInterval: null,
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
  const responseOverlay = document.getElementById('responseOverlay');
  const parentSection = document.getElementById('parentSection');
  const ikuyoBtn = document.getElementById('ikuyoBtn');
  const resolveBtn = document.getElementById('resolveBtn');
  const modeBadge = document.getElementById('modeBadge');

  // ============================================================
  // 初期化
  // ============================================================

  async function init() {
    // URLパラメータ確認
    const params = new URLSearchParams(location.search);
    const childId = params.get('child_id');
    const callId = params.get('call_id');

    if (childId && callId && isAdmin) {
      // 親側モード
      state.isParent = true;
      state.childId = childId;
      state.callId = callId;
      initParentMode();
    } else if (childId) {
      // 子供側（child_id指定あり）
      state.childId = childId;
      state.childName = params.get('name') || '';
      if (callId) state.callId = callId;
    } else {
      // child_id未指定 → localStorageやdevice_settingsから取得
      const deviceId = localStorage.getItem('push_device_id');
      if (deviceId) {
        const { data } = await client.from('device_settings')
          .select('child_id')
          .eq('device_id', deviceId)
          .single();
        if (data && data.child_id) {
          state.childId = data.child_id;
          // 子供名取得
          const { data: childData } = await client.from('children')
            .select('name')
            .eq('id', data.child_id)
            .single();
          if (childData) state.childName = childData.name;
        } else {
          // device_settingsにレコードなし → 子供一覧から最初の子供を使用
          // (家庭内利用なので子供が1-2人の想定)
          const { data: children } = await client.from('children')
            .select('id, name')
            .order('sort_order', { ascending: true });
          if (children && children.length > 0) {
            // 子供が1人ならそのまま使う、複数ならpush_subscriptionsのchild_nameで照合
            const pushSub = await client.from('push_subscriptions')
              .select('child_name')
              .eq('device_id', deviceId)
              .single();
            const matched = pushSub?.data?.child_name
              ? children.find(c => c.name === pushSub.data.child_name)
              : null;
            const child = matched || children[0];
            state.childId = child.id;
            state.childName = child.name;
            // device_settingsに自動登録
            await client.from('device_settings').upsert({
              device_id: deviceId,
              child_id: child.id,
              nurse_call_mode: false,
              updated_at: new Date().toISOString()
            }, { onConflict: 'device_id' });
          }
        }
      } else {
        // push_device_idもない → 生成してchildrenから取得
        let newDeviceId = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        localStorage.setItem('push_device_id', newDeviceId);
        const { data: children } = await client.from('children')
          .select('id, name')
          .order('sort_order', { ascending: true });
        if (children && children.length > 0) {
          state.childId = children[0].id;
          state.childName = children[0].name;
          await client.from('device_settings').upsert({
            device_id: newDeviceId,
            child_id: children[0].id,
            nurse_call_mode: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'device_id' });
        }
      }
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

    // body表示
    document.body.style.visibility = 'visible';
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

    // 理由選択
    reasonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reasonBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedReason = btn.dataset.reason;
      });
    });

    // 呼び出しボタン
    callBtn.addEventListener('click', () => sendCall(state.selectedReason));
  }

  // ============================================================
  // 呼び出し実行
  // ============================================================

  async function sendCall(reason) {
    if (state.cooldownRemaining > 0) return;
    if (!state.childId) {
      showStatus('設定がまだだよ', 'error');
      return;
    }

    // オフライン時
    if (!navigator.onLine) {
      offlineQueue.push({
        child_id: state.childId,
        child_name: state.childName || '',
        reason: reason || null,
        device_id: localStorage.getItem('push_device_id') || '',
        queued_at: new Date().toISOString()
      });
      showStatus('ネットがつながっていないけど、つながったらおくるね', 'info');
      startCooldown();
      return;
    }

    // Edge Function呼び出し
    callBtn.disabled = true;
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
          child_id: state.childId,
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

        if (data.notification_status === 'sent') {
          showStatus('おくったよ！', 'success');
        } else if (data.notification_status === 'partial') {
          showStatus('おくったよ！', 'success');
        } else {
          showStatus('おくったけど、とどかなかったかも', 'info');
        }
      } else if (res.status === 429) {
        showStatus('まだおくれないよ。すこしまってね', 'info');
      } else if (res.status === 401) {
        // JWT期限切れ → 再認証してリトライ
        await ensureAuthSession();
        showStatus('おくれなかったよ。もういちどおしてね', 'error');
      } else {
        showStatus('おくれなかったよ。もういちどおしてね', 'error');
      }
    } catch (e) {
      if (!navigator.onLine) {
        offlineQueue.push({
          child_id: state.childId,
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

    startCooldown();
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
  // クールダウン
  // ============================================================

  function startCooldown() {
    state.cooldownRemaining = COOLDOWN_SEC;
    callBtn.disabled = true;
    updateCooldownDisplay();

    state.cooldownInterval = setInterval(() => {
      state.cooldownRemaining--;
      if (state.cooldownRemaining <= 0) {
        clearInterval(state.cooldownInterval);
        state.cooldownInterval = null;
        callBtn.disabled = false;
        callBtn.textContent = 'よんで！';
      } else {
        updateCooldownDisplay();
      }
    }, 1000);
  }

  function updateCooldownDisplay() {
    callBtn.textContent = `${state.cooldownRemaining}`;
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
        if (msg.action === 'iku_yo') {
          showResponseOverlay();
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
    document.getElementById('callSection').style.display = 'none';
    parentSection.classList.add('visible');
    subscribeChannel(state.callId);

    ikuyoBtn.addEventListener('click', async () => {
      // Realtime broadcast
      const channelName = buildChannelName(state.childId, state.callId);
      const channel = client.channel(channelName);
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'response',
        payload: { action: 'iku_yo' }
      });

      // DB更新
      await client.from('nurse_calls')
        .update({ responded_at: new Date().toISOString() })
        .eq('id', state.callId);

      ikuyoBtn.disabled = true;
      ikuyoBtn.textContent = 'おくったよ！';
    });

    resolveBtn.addEventListener('click', async () => {
      // DB更新
      await client.from('nurse_calls')
        .update({ status: 'resolved' })
        .eq('id', state.callId);

      // Realtime通知
      const channelName = buildChannelName(state.childId, state.callId);
      const channel = client.channel(channelName);
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'session',
        payload: { action: 'resolved' }
      });

      resolveBtn.disabled = true;
      resolveBtn.textContent = '完了しました';
      localStorage.removeItem(CURRENT_CALL_KEY);
    });
  }

  // ============================================================
  // UI ヘルパー
  // ============================================================

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
  }

  function showResponseOverlay() {
    responseOverlay.classList.add('visible');
    setTimeout(() => {
      responseOverlay.classList.remove('visible');
    }, 5000);
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
    state
  };

})();
