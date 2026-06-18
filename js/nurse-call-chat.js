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

  function init(callId, childId, senderRole) {
    chatState.callId = callId;
    chatState.childId = childId;
    chatState.senderRole = senderRole;

    // Realtimeチャネル購読
    const channelName = `nurse-call:${childId}:${callId}`;
    chatState.channel = client.channel(channelName);

    chatState.channel
      .on('broadcast', { event: 'chat' }, (payload) => {
        const msg = payload.payload;
        if (msg.call_id === callId) {
          addMessageToUI(msg);
          if (chatState.onMessage) chatState.onMessage(msg);
        }
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

    // DB保存
    await client.from('nurse_call_messages').insert({
      call_id: chatState.callId,
      child_id: chatState.childId,
      sender_role: chatState.senderRole,
      message_text: trimmed
    });

    // 子供からのメッセージ時、1分以上経過ならPush通知
    if (chatState.senderRole === 'child') {
      const lastNotify = parseInt(localStorage.getItem(CHAT_NOTIFY_KEY) || '0');
      if (Date.now() - lastNotify > CHAT_NOTIFY_INTERVAL) {
        localStorage.setItem(CHAT_NOTIFY_KEY, String(Date.now()));
        // push_messagesキューに追加（5分毎のcronで配信）
        try {
          await client.from('push_messages').insert({
            title: '💬 チャット',
            body: trimmed.slice(0, 100),
            target_role: 'admin',
            target_child_name: null
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
    const { data } = await client.from('nurse_call_messages')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: true })
      .limit(limit);

    chatState.messages = data || [];
    renderMessages();
  }

  // ============================================================
  // UI描画
  // ============================================================

  function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = chatState.messages.map(msg => {
      const isMe = msg.sender_role === chatState.senderRole;
      const align = isMe ? 'right' : 'left';
      const bgColor = isMe ? '#e3f2fd' : '#fff';
      const time = new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      return `<div style="display:flex; justify-content:${align === 'right' ? 'flex-end' : 'flex-start'}; margin-bottom:8px;">
        <div style="max-width:75%; background:${bgColor}; border-radius:12px; padding:10px 14px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <div style="font-size:0.95em; word-wrap:break-word;">${escapeHtml(msg.message_text)}</div>
          <div style="font-size:0.7em; color:#999; margin-top:4px; text-align:right;">${time}</div>
        </div>
      </div>`;
    }).join('');

    scrollToBottom();
  }

  function addMessageToUI(msg) {
    // 重複防止（broadcast + ローカル追加）
    if (chatState.messages.find(m => m.created_at === msg.created_at && m.message_text === msg.message_text && m.sender_role === msg.sender_role)) {
      return;
    }
    chatState.messages.push(msg);
    renderMessages();
  }

  function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
    destroy,
    QUICK_REPLIES,
    onMessageReceived(cb) { chatState.onMessage = cb; }
  };

})();
