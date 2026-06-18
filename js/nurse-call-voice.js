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
        // ended→idle即時復帰
        if (state === 'ended') {
          state = 'idle';
          listeners.forEach(fn => fn(state));
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
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    senderId: Math.random().toString(36).slice(2, 10) // 自分のbroadcastを識別
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
    // 家庭内利用: 固定チャネル名（同時通話は1つだけ）
    const channelName = `nurse-voice-call`;
    voiceState.channel = client.channel(channelName);

    await new Promise((resolve) => {
      voiceState.channel
        .on('broadcast', { event: 'voice_state' }, (payload) => {
          if (payload.payload.sender === voiceState.senderId) return; // 自分のは無視
          handleVoiceStateEvent(payload.payload);
        })
        .on('broadcast', { event: 'signal' }, (payload) => {
          if (payload.payload.sender === voiceState.senderId) return; // 自分のは無視
          handleSignalEvent(payload.payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve();
        });
      // タイムアウト: 5秒以内にsubscribeできなくても続行
      setTimeout(resolve, 5000);
    });
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

    // マイク取得
    try {
      voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      showVoiceStatus('マイクが使えないよ', 'error');
      return false;
    }

    if (!voiceState.stateMachine.transition('ringing')) return false;

    broadcastVoiceState('ringing');
    // 相手が接続するまで3秒間隔でringingをリトライ（最大1分）
    let ringingRetry = 0;
    const ringingInterval = setInterval(() => {
      ringingRetry++;
      if (voiceState.stateMachine.getState() !== 'ringing' || ringingRetry > 20) {
        clearInterval(ringingInterval);
        // タイムアウト: まだringing状態なら切断
        if (voiceState.stateMachine.getState() === 'ringing') {
          voiceState.stateMachine.transition('ended');
          cleanup();
          showVoiceStatus('つながらなかったよ', 'error');
          updateVoiceUI();
          const callBtn = document.getElementById('voiceCallBtn');
          if (callBtn) callBtn.style.display = 'block';
        }
        return;
      }
      broadcastVoiceState('ringing');
    }, 3000);
    showVoiceStatus('よびだし中...', 'info');
    updateVoiceUI();
    return true;
  }

  // ============================================================
  // 応答（受信側 - 自動呼び出し）
  // ============================================================

  async function acceptCall() {
    // マイク取得
    if (!voiceState.localStream) {
      try {
        voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (e) {
        showVoiceStatus('マイクが使えないよ', 'error');
        voiceState.stateMachine.transition('ended');
        broadcastVoiceState('ended');
        updateVoiceUI();
        return false;
      }
    }

    if (!voiceState.stateMachine.transition('connected')) return false;
    broadcastVoiceState('connected');
    showVoiceStatus('つなげているよ...', 'info');
    updateVoiceUI();
    startCallTimer();
    // PeerConnectionは作らない。offerを受信した時にhandleSignalEventで作る。
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
    // ボタンを明示的にリセット（インラインスクリプトで手動非表示された場合の復旧）
    const callBtn = document.getElementById('voiceCallBtn');
    if (callBtn) callBtn.style.display = 'block';
  }

  // ============================================================
  // WebRTC PeerConnection
  // ============================================================

  function createPeerConnection() {
    if (voiceState.peerConnection) return voiceState.peerConnection;

    const pc = new RTCPeerConnection({ iceServers: voiceState.iceServers });
    voiceState.peerConnection = pc;

    if (voiceState.localStream) {
      voiceState.localStream.getTracks().forEach(track => pc.addTrack(track, voiceState.localStream));
    }

    pc.ontrack = (event) => {
      const audio = document.getElementById('voiceRemoteAudio');
      if (audio && event.streams[0]) audio.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) broadcastSignal('ice', null, event.candidate);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        showVoiceStatus('つながったよ！', 'success');
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        showVoiceStatus('きれちゃったよ', 'error');
        endCall();
      }
    };

    return pc;
  }

  // ============================================================
  // シグナリングイベント処理
  // ============================================================

  async function handleSignalEvent(data) {
    try {
      const pc = voiceState.peerConnection;

      if (data.signal_type === 'offer') {
        // 自分が発信側（既にoffer送った側）なら無視
        if (pc && pc.signalingState === 'have-local-offer') return;
        // 受信側: offer受信 → PeerConnection作成 → answer返信
        const newPc = createPeerConnection();
        await newPc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await newPc.createAnswer();
        await newPc.setLocalDescription(answer);
        broadcastSignal('answer', answer.sdp);
      }

      if (data.signal_type === 'answer') {
        // 自分がoffer送信済みの場合のみ処理
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
        }
      }

      if (data.signal_type === 'ice') {
        if (pc && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
    } catch (e) {
      // エラーは無視（タイミング競合）
    }
  }

  function handleVoiceStateEvent(data) {
    if (data.state === 'ringing' && voiceState.stateMachine.getState() === 'idle') {
      voiceState.stateMachine.transition('ringing');
      showVoiceStatus('でんわがきているよ！', 'info');
      updateVoiceUI();
      // 受信側は自動応答
      acceptCall();
    }

    if (data.state === 'connected' && voiceState.stateMachine.getState() === 'ringing') {
      // 発信側: 相手が接続完了 → offer送信
      voiceState.stateMachine.transition('connected');
      const pc = createPeerConnection();
      showVoiceStatus('つながったよ！', 'success');
      updateVoiceUI();
      startCallTimer();
      // offer作成＆送信
      (async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        broadcastSignal('offer', offer.sdp);
      })();
    }

    if (data.state === 'ended') {
      voiceState.stateMachine.transition('ended');
      cleanup();
      showVoiceStatus('つうわおわり', 'info');
      updateVoiceUI();
      const callBtn = document.getElementById('voiceCallBtn');
      if (callBtn) callBtn.style.display = 'block';
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
        payload: { state, sender: voiceState.senderId }
      }).catch(() => {});
    }
  }

  function broadcastSignal(signalType, sdp, candidate) {
    if (voiceState.channel) {
      voiceState.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { signal_type: signalType, sdp: sdp || null, candidate: candidate || null, sender: voiceState.senderId }
      }).catch(() => {});
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
    if (acceptBtn) acceptBtn.style.display = (state === 'ringing') ? 'block' : 'none';
    if (endBtn) endBtn.style.display = (state === 'ringing' || state === 'connected') ? 'block' : 'none';
    if (timerEl) timerEl.style.display = (state === 'connected') ? 'block' : 'none';
    if (connEl) connEl.textContent = ''; // 二重表示防止: voiceStatusだけで管理
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
