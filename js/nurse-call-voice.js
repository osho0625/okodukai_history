// ナースコール 音声通話モジュール (WebRTC)
// - Supabase Realtime Broadcastでシグナリング
// - STUN/TURNでNAT越え
// - 状態機械: idle → ringing → connected → ended

(function() {
  'use strict';

  // ============================================================
  // 状態機械
  // ============================================================

  const VALID_TRANSITIONS = {
    idle: ['ringing'],
    ringing: ['connected', 'ended'],
    connected: ['ended'],
    ended: ['idle']
  };

  function createStateMachine() {
    let state = 'idle';
    const listeners = [];

    return {
      getState() { return state; },
      transition(newState) {
        const valid = VALID_TRANSITIONS[state];
        if (!valid || !valid.includes(newState)) {
          return false;
        }
        state = newState;
        listeners.forEach(fn => fn(state));
        // ended→idle自動復帰
        if (state === 'ended') {
          setTimeout(() => {
            state = 'idle';
            listeners.forEach(fn => fn(state));
          }, 2000);
        }
        return true;
      },
      onStateChange(fn) { listeners.push(fn); },
      reset() { state = 'idle'; }
    };
  }

  // ============================================================
  // 音声通話
  // ============================================================

  let voiceState = {
    callId: null,
    childId: null,
    role: null, // 'parent' | 'child'
    channel: null,
    peerConnection: null,
    localStream: null,
    stateMachine: createStateMachine(),
    callTimer: null,
    callStartTime: null,
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // ============================================================
  // 初期化
  // ============================================================

  async function init(callId, childId, role) {
    voiceState.callId = callId;
    voiceState.childId = childId;
    voiceState.role = role;

    // ICE設定をgame_settingsから取得
    try {
      const { data } = await client.from('game_settings')
        .select('nurse_call_ice_servers')
        .eq('id', 1).single();
      if (data?.nurse_call_ice_servers) {
        voiceState.iceServers = data.nurse_call_ice_servers;
      }
    } catch (e) {}

    // シグナリングチャネル購読
    const channelName = `nurse-call:${childId}:${callId}`;
    voiceState.channel = client.channel(channelName);

    voiceState.channel
      .on('broadcast', { event: 'voice_state' }, (payload) => {
        handleVoiceStateEvent(payload.payload);
      })
      .on('broadcast', { event: 'signal' }, (payload) => {
        handleSignalEvent(payload.payload);
      })
      .subscribe();
  }

  // ============================================================
  // 発信（かけた側は自動接続）
  // ============================================================

  async function startCall() {
    const currentState = voiceState.stateMachine.getState();
    if (currentState === 'ringing' || currentState === 'connected') {
      showVoiceStatus('いま通話中です', 'error');
      return false;
    }

    // マイク取得（発信側は自動）
    try {
      voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      showVoiceStatus('マイクが使えないよ', 'error');
      return false;
    }

    if (!voiceState.stateMachine.transition('ringing')) return false;

    // broadcast ringing（相手に着信通知）
    broadcastVoiceState('ringing');
    showVoiceStatus('よびだし中...', 'info');
    updateVoiceUI();

    // 発信側はPeerConnectionを先に作成して待機
    createPeerConnection();
    return true;
  }

  // ============================================================
  // 応答（子供側）
  // ============================================================

  async function acceptCall() {
    // マイクパーミッション取得
    try {
      voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      showVoiceStatus('マイクが使えないよ', 'error');
      voiceState.stateMachine.transition('ended');
      broadcastVoiceState('ended');
      updateVoiceUI();
      return false;
    }

    if (!voiceState.stateMachine.transition('connected')) return false;
    broadcastVoiceState('connected');

    // PeerConnection作成（子供側=answerer）
    createPeerConnection();

    // 親側がofferを送ってくるのを待つ（既にringing中にoffer来ている可能性あり）
    showVoiceStatus('つなげているよ...', 'info');
    updateVoiceUI();
    startCallTimer();
    return true;
  }

  // ============================================================
  // 通話終了
  // ============================================================

  function endCall() {
    voiceState.stateMachine.transition('ended');
    broadcastVoiceState('ended');
    cleanup();
    showVoiceStatus('つうわおわり', 'info');
    updateVoiceUI();
  }

  // ============================================================
  // WebRTC PeerConnection
  // ============================================================

  function createPeerConnection() {
    const pc = new RTCPeerConnection({ iceServers: voiceState.iceServers });
    voiceState.peerConnection = pc;

    // ローカルストリーム追加
    if (voiceState.localStream) {
      voiceState.localStream.getTracks().forEach(track => {
        pc.addTrack(track, voiceState.localStream);
      });
    }

    // リモートストリーム処理
    pc.ontrack = (event) => {
      const audio = document.getElementById('voiceRemoteAudio');
      if (audio && event.streams[0]) {
        audio.srcObject = event.streams[0];
      }
    };

    // ICE候補送信
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        broadcastSignal('ice', null, event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      const connEl = document.getElementById('voiceConnectionState');
      if (connEl) {
        const stateMap = {
          'new': '🔄 せつぞくじゅんび...',
          'connecting': '🔄 つなげているよ...',
          'connected': '✅ つながったよ！',
          'disconnected': '⚠️ せつぞくがきれた',
          'failed': '❌ つながらなかった',
          'closed': '⏹️ おわり'
        };
        connEl.textContent = stateMap[pc.connectionState] || pc.connectionState;
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        showVoiceStatus('きれちゃったよ', 'error');
        endCall();
      }
    };

    pc.oniceconnectionstatechange = () => {
      const connEl = document.getElementById('voiceConnectionState');
      if (connEl && pc.connectionState !== 'connected') {
        const iceMap = {
          'checking': '🔍 あいてをさがしているよ...',
          'connected': '✅ つながったよ！',
          'completed': '✅ つながったよ！',
          'failed': '❌ つながらなかった',
          'disconnected': '⚠️ きれちゃった'
        };
        if (iceMap[pc.iceConnectionState]) {
          connEl.textContent = iceMap[pc.iceConnectionState];
        }
      }
    };

    // 親側: offer作成＆送信
    if (voiceState.role === 'parent') {
      createAndSendOffer(pc);
    }
  }

  async function createAndSendOffer(pc) {
    // 親側/発信側: localStreamは既にstartCallで取得済みの場合あり
    if (!voiceState.localStream) {
      try {
        voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (e) {
        showVoiceStatus('マイクが使えないよ', 'error');
        endCall();
        return;
      }
    }

    // トラックがまだ追加されていなければ追加
    const senders = pc.getSenders();
    if (senders.length === 0) {
      voiceState.localStream.getTracks().forEach(track => {
        pc.addTrack(track, voiceState.localStream);
      });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    broadcastSignal('offer', offer.sdp);
  }

  // ============================================================
  // シグナリングイベント処理
  // ============================================================

  async function handleSignalEvent(data) {
    const pc = voiceState.peerConnection;

    if (data.signal_type === 'offer' && voiceState.role === 'child') {
      if (!pc) createPeerConnection();
      await voiceState.peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
      const answer = await voiceState.peerConnection.createAnswer();
      await voiceState.peerConnection.setLocalDescription(answer);
      broadcastSignal('answer', answer.sdp);
    }

    if (data.signal_type === 'answer' && voiceState.role === 'parent') {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
      }
    }

    if (data.signal_type === 'ice') {
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {}
      }
    }
  }

  function handleVoiceStateEvent(data) {
    if (data.state === 'ringing' && voiceState.role === 'child') {
      voiceState.stateMachine.transition('ringing');
      showVoiceStatus('でんわがきているよ！', 'info');
      updateVoiceUI();
    }

    if (data.state === 'connected' && voiceState.role === 'parent') {
      voiceState.stateMachine.transition('connected');
      createPeerConnection();
      showVoiceStatus('つながったよ！', 'success');
      updateVoiceUI();
      startCallTimer();
    }

    if (data.state === 'ended') {
      voiceState.stateMachine.transition('ended');
      cleanup();
      showVoiceStatus('つうわおわり', 'info');
      updateVoiceUI();
    }
  }

  // ============================================================
  // ブロードキャスト
  // ============================================================

  function broadcastVoiceState(state) {
    if (voiceState.channel) {
      voiceState.channel.send({
        type: 'broadcast',
        event: 'voice_state',
        payload: { state, call_id: voiceState.callId }
      });
    }
  }

  function broadcastSignal(signalType, sdp, candidate) {
    if (voiceState.channel) {
      voiceState.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { signal_type: signalType, sdp: sdp || null, candidate: candidate || null }
      });
    }
  }

  // ============================================================
  // ヘルパー
  // ============================================================

  function cleanup() {
    if (voiceState.peerConnection) {
      voiceState.peerConnection.close();
      voiceState.peerConnection = null;
    }
    if (voiceState.localStream) {
      voiceState.localStream.getTracks().forEach(t => t.stop());
      voiceState.localStream = null;
    }
    stopCallTimer();
  }

  function startCallTimer() {
    voiceState.callStartTime = Date.now();
    const timerEl = document.getElementById('voiceTimer');
    voiceState.callTimer = setInterval(() => {
      if (!timerEl) return;
      const elapsed = Math.floor((Date.now() - voiceState.callStartTime) / 1000);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      timerEl.textContent = `${min}:${String(sec).padStart(2, '0')}`;
    }, 1000);
  }

  function stopCallTimer() {
    if (voiceState.callTimer) {
      clearInterval(voiceState.callTimer);
      voiceState.callTimer = null;
    }
    voiceState.callStartTime = null;
  }

  function showVoiceStatus(text, type) {
    const el = document.getElementById('voiceStatus');
    if (el) {
      el.textContent = text;
      el.className = `voice-status ${type}`;
    }
  }

  function updateVoiceUI() {
    const state = voiceState.stateMachine.getState();
    const callBtn = document.getElementById('voiceCallBtn');
    const acceptBtn = document.getElementById('voiceAcceptBtn');
    const endBtn = document.getElementById('voiceEndBtn');
    const timerEl = document.getElementById('voiceTimer');
    const connEl = document.getElementById('voiceConnectionState');

    if (callBtn) callBtn.style.display = (state === 'idle') ? 'block' : 'none';
    if (acceptBtn) acceptBtn.style.display = (voiceState.role === 'child' && state === 'ringing') ? 'block' : 'none';
    if (endBtn) endBtn.style.display = (state === 'ringing' || state === 'connected') ? 'block' : 'none';
    if (timerEl) timerEl.style.display = (state === 'connected') ? 'block' : 'none';

    // 状態テキスト
    if (connEl) {
      const stateText = {
        'idle': '📵 たいき中',
        'ringing': '📳 よびだし中...',
        'connected': '📞 つうわ中',
        'ended': '⏹️ おわり'
      };
      if (!voiceState.peerConnection) {
        connEl.textContent = stateText[state] || '';
      }
    }
  }

  function destroy() {
    cleanup();
    if (voiceState.channel) {
      client.removeChannel(voiceState.channel);
      voiceState.channel = null;
    }
    voiceState.stateMachine.reset();
  }

  // ============================================================
  // 公開
  // ============================================================

  window.NurseCallVoice = {
    init,
    startCall,
    acceptCall,
    endCall,
    getState() { return voiceState.stateMachine.getState(); },
    onStateChange(fn) { voiceState.stateMachine.onStateChange(fn); },
    destroy,
    // テスト用
    _stateMachine: voiceState.stateMachine,
    _VALID_TRANSITIONS: VALID_TRANSITIONS
  };

})();
