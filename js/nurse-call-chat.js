// ナースコール チャットモジュール
// - Supabase Realtime Broadcastでリアルタイムメッセージング
// - nurse_call_messagesテーブルに永続化
// - Quick Reply対応

(function() {
  'use strict';

  const QUICK_REPLIES = {
    ok: 'だいじょうぶ',
    thanks: 'ありがとう',
    still_sick: 'まだつらい',
    hungry: 'おなかすいた'
  };

  let chatState = {
    callId: null,
    childId: null,
    senderRole: null, // 'parent' | 'child'
    channel: null,
    messages: [],
    onMessage: null
  };

  // ============================================================
  // 初期化
  // ============================================================

  function init(callId, childId, senderRole, containerId) {
    chatState.callId = callId;
    chatState.childId = childId;
    chatState.senderRole = senderRole;
    chatState.containerId = containerId || 'chatMessages';

    // 既存チャネルがあれば解除してから再購読
    if (chatState.channel) {
      client.removeChannel(chatState.channel);
      chatState.channel = null;
    }

    // Realtimeチャネル購読（全員共有の固定チャネル）
    const channelName = `nurse-chat-shared`;
    chatState.channel = client.channel(channelName);

    chatState.channel
      .on('broadcast', { event: 'chat' }, (payload) => {
        const msg = payload.payload;
        addMessageToUI(msg);
        if (chatState.onMessage) chatState.onMessage(msg);
      })
      .subscribe();

    // 履歴読み込み
    loadHistory(callId);
  }

  // ============================================================
  // メッセージ送信
  // ============================================================

  const CHAT_NOTIFY_KEY = 'nurse_call_last_chat_notify';
  const CHAT_NOTIFY_INTERVAL = 60000; // 1分

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    const trimmed = text.trim().slice(0, 500);

    const msg = {
      call_id: chatState.callId,
      child_id: chatState.childId,
      sender_role: chatState.senderRole,
      sender_name: chatState.senderRole === 'parent' ? 'お父さん' : (localStorage.getItem('nurse_call_child_name') || ''),
      message_text: trimmed,
      created_at: new Date().toISOString()
    };

    // Realtime broadcast
    if (chatState.channel) {
      chatState.channel.send({
        type: 'broadcast',
        event: 'chat',
        payload: msg
      });
    }

    // DB保存（call_idが有効なUUIDの場合のみFK制約付きinsert、それ以外はcall_id無しで保存）
    const isValidUUID = chatState.callId && chatState.callId !== 'default' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatState.callId);
    const isValidChildId = chatState.childId && chatState.childId !== 'default' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatState.childId);
    if (isValidChildId) {
      const insertData = {
        child_id: chatState.childId,
        sender_role: chatState.senderRole,
        sender_name: msg.sender_name || null,
        message_text: trimmed
      };
      if (isValidUUID) {
        insertData.call_id = chatState.callId;
      }
      await client.from('nurse_call_messages').insert(insertData);
    }

    // 子供からのメッセージ時、1分以上経過ならPush即時通知
    if (chatState.senderRole === 'child') {
      const lastNotify = parseInt(localStorage.getItem(CHAT_NOTIFY_KEY) || '0');
      if (Date.now() - lastNotify > CHAT_NOTIFY_INTERVAL) {
        localStorage.setItem(CHAT_NOTIFY_KEY, String(Date.now()));
        // Edge Function経由で即時Push配信
        try {
          const token = window.NurseCall?.getAccessToken?.() || '';
          await fetch(`${SUPABASE_URL}/functions/v1/push-nurse-call`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': SUPABASE_KEY
            },
            body: JSON.stringify({
              child_id: chatState.childId || '',
              child_name: (localStorage.getItem('nurse_call_child_name') || '') + '💬',
              reason: trimmed.slice(0, 50),
              device_id: localStorage.getItem('push_device_id') || ''
            })
          });
        } catch(e) {}
      }
    }

    // ローカルUI追加
    addMessageToUI(msg);
  }

  async function sendQuickReply(presetKey) {
    const text = QUICK_REPLIES[presetKey];
    if (text) await sendMessage(text);
  }

  // ============================================================
  // 履歴読み込み
  // ============================================================

  async function loadHistory(callId, limit = 50) {
    // 全メッセージ共有（家庭内グループチャット）
    const { data } = await client.from('nurse_call_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    chatState.messages = data || [];
    renderMessages();
  }

  // ============================================================
  // UI描画
  // ============================================================

  function renderMessages() {
    const container = document.getElementById(chatState.containerId || 'chatMessages');
    if (!container) return;

    container.innerHTML = chatState.messages.map(msg => {
      const myName = chatState.senderRole === 'parent' ? 'お父さん' : (localStorage.getItem('nurse_call_child_name') || '');
      const senderName = msg.sender_name || (msg.sender_role === 'parent' ? 'お父さん' : '');
      const isMe = senderName === myName;
      const align = isMe ? 'right' : 'left';
      const bgColor = isMe ? '#dcf8c6' : '#fff';
      const time = new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      return `<div style="display:flex; justify-content:${align === 'right' ? 'flex-end' : 'flex-start'}; margin-bottom:8px;">
        <div style="max-width:75%; background:${bgColor}; border-radius:12px; padding:10px 14px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          ${!isMe && senderName ? `<div style="font-size:0.7em; color:#1976d2; font-weight:600; margin-bottom:2px;">${escapeHtml(senderName)}</div>` : ''}
          <div style="font-size:0.95em; word-wrap:break-word;">${escapeHtml(msg.message_text)}</div>
          <div style="font-size:0.7em; color:#999; margin-top:4px; text-align:right;">${time}</div>
        </div>
      </div>`;
    }).join('');

    scrollToBottom();
  }

  function addMessageToUI(msg) {
    // 重複防止（broadcast + ローカル追加）
    if (chatState.messages.find(m => m.created_at === msg.created_at && m.message_text === msg.message_text && m.sender_role === msg.sender_role && m.sender_name === msg.sender_name)) {
      return;
    }
    chatState.messages.push(msg);
    renderMessages();
  }

  function scrollToBottom() {
    const container = document.getElementById(chatState.containerId || 'chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function clearMessages() {
    chatState.messages = [];
    renderMessages();
  }

  // ============================================================
  // 破棄
  // ============================================================

  function destroy() {
    if (chatState.channel) {
      client.removeChannel(chatState.channel);
      chatState.channel = null;
    }
  }

  // ============================================================
  // 公開
  // ============================================================

  window.NurseCallChat = {
    init,
    sendMessage,
    sendQuickReply,
    loadHistory,
    clearMessages,
    destroy,
    QUICK_REPLIES,
    onMessageReceived(cb) { chatState.onMessage = cb; }
  };

})();
