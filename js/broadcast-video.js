// おうちビデオ通話モジュール (WebRTC)
// - nurse-call-voice.js を流用した独立モジュール
// - シグナリングチャネルは 'broadcast-video-call'（ナースコールと分離）
// - 通話開始時から音声+映像を両方有効
// - ?mode=raspi で着信自動応答（ラズパイ受信端末モード）
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
  // ビデオ通話状態
  // ============================================================

  let vcState = {
    role: null,          // 'parent' | 'raspi'
    isRaspi: false,      // ラズパイ受信端末モード（自動応答）
    channel: null,
    peerConnection: null,
    localStream: null,
    stateMachine: createStateMachine(),
    callTimer: null,
    callStartTime: null,
    // デフォルトはSTUNのみ（同一Wi-Fi内で動作）。
    // 外出先接続には game_settings.broadcast_ice_servers にTURNを登録する。
    // 無料TURN推奨: metered.ca Open Relay（無料20GB/月）。setup手順は docs/video-call-turn-setup.md 参照。
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    // 合言葉（認証）。game_settings.broadcast_call_secret から取得。
    // ラズパイは合言葉が一致した着信だけ自動応答する（第三者の発信ではカメラを起動しない）。
    secret: null,
    senderId: Math.random().toString(36).slice(2, 10)
  };

  const CHANNEL_NAME = 'broadcast-video-call';
  // 映像+音声を最初から取得する制約
  const MEDIA_CONSTRAINTS = { audio: true, video: { facingMode: 'user' } };

  // ============================================================
  // 初期化
  // ============================================================

  async function init(role, isRaspi) {
    if (vcState.channel) {
      client.removeChannel(vcState.channel);
      vcState.channel = null;
    }

    vcState.role = role;
    vcState.isRaspi = !!isRaspi;
    // 発信側は端末ローカルに保存した合言葉を使う（admin端末で1回設定。DBの秘密は直接読めない）
    vcState.secret = localStorage.getItem('broadcast_call_secret') || null;

    // ICE設定はEdge Function経由で取得（TURN認証を隠蔽）
    try {
      if (typeof getIceServers === 'function') {
        vcState.iceServers = await getIceServers();
      }
    } catch (e) {}
    // 合言葉はクライアントに保持せず、着信時にverifySecretでサーバー照合する（下記handleCallStateEvent）

    vcState.channel = client.channel(CHANNEL_NAME);

    await new Promise((resolve) => {
      vcState.channel
        .on('broadcast', { event: 'call_state' }, (payload) => {
          if (payload.payload.sender === vcState.senderId) return;
          handleCallStateEvent(payload.payload);
        })
        .on('broadcast', { event: 'signal' }, (payload) => {
          if (payload.payload.sender === vcState.senderId) return;
          handleSignalEvent(payload.payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve();
        });
      setTimeout(resolve, 5000);
    });
  }

  // ============================================================
  // 発信（親側）
  // ============================================================

  async function startCall() {
    const currentState = vcState.stateMachine.getState();
    if (currentState === 'ringing' || currentState === 'connected') {
      showStatus('いま通話中です', 'error');
      return false;
    }

    try {
      vcState.localStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    } catch (e) {
      showStatus('カメラ/マイクが使えないよ', 'error');
      return false;
    }

    if (!vcState.stateMachine.transition('ringing')) {
      if (vcState.localStream) {
        vcState.localStream.getTracks().forEach(t => t.stop());
        vcState.localStream = null;
      }
      return false;
    }

    attachLocalPreview();
    broadcastCallState('ringing');
    await acquireWakeLock();

    let ringingRetry = 0;
    const ringingInterval = setInterval(() => {
      ringingRetry++;
      if (vcState.stateMachine.getState() !== 'ringing' || ringingRetry > 20) {
        clearInterval(ringingInterval);
        if (vcState.stateMachine.getState() === 'ringing') {
          vcState.stateMachine.transition('ended');
          cleanup();
          showStatus('つながらなかったよ', 'error');
          updateUI();
        }
        return;
      }
      broadcastCallState('ringing');
    }, 3000);
    showStatus('よびだし中...', 'info');
    updateUI();
    return true;
  }

  // ============================================================
  // 応答（受信側 / ラズパイ自動応答）
  // ============================================================

  async function acceptCall() {
    if (!vcState.localStream) {
      try {
        vcState.localStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      } catch (e) {
        showStatus('カメラ/マイクが使えないよ', 'error');
        vcState.stateMachine.transition('ended');
        broadcastCallState('ended');
        updateUI();
        return false;
      }
    }

    if (!vcState.stateMachine.transition('connected')) {
      if (vcState.localStream) {
        vcState.localStream.getTracks().forEach(t => t.stop());
        vcState.localStream = null;
      }
      return false;
    }
    attachLocalPreview();
    broadcastCallState('connected');
    await acquireWakeLock();
    showStatus('つなげているよ...', 'info');
    updateUI();
    startCallTimer();
    return true;
  }

  // ============================================================
  // 通話終了
  // ============================================================

  function endCall() {
    vcState.stateMachine.transition('ended');
    broadcastCallState('ended');
    cleanup();
    showStatus('つうわおわり', 'info');
    updateUI();
  }

  // ============================================================
  // WebRTC PeerConnection
  // ============================================================

  function createPeerConnection() {
    if (vcState.peerConnection) return vcState.peerConnection;

    const pc = new RTCPeerConnection({ iceServers: vcState.iceServers });
    vcState.peerConnection = pc;

    if (vcState.localStream) {
      vcState.localStream.getTracks().forEach(track => pc.addTrack(track, vcState.localStream));
    }

    pc.ontrack = (event) => {
      const track = event.track;
      if (track.kind === 'video') {
        const video = document.getElementById('vcRemoteVideo');
        if (video) {
          video.srcObject = event.streams[0];
          video.style.display = 'block';
        }
      } else {
        const audio = document.getElementById('vcRemoteAudio');
        if (audio && event.streams[0]) audio.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) broadcastSignal('ice', null, event.candidate);
    };

    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        broadcastSignal('offer', offer.sdp);
      } catch(e) {}
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        showStatus('つながったよ！', 'success');
      }
      if (pc.connectionState === 'failed') {
        showStatus('きれちゃったよ', 'error');
        endCall();
      }
      if (pc.connectionState === 'disconnected') {
        showStatus('接続が不安定...', 'info');
      }
    };

    return pc;
  }

  // ============================================================
  // ローカルプレビュー
  // ============================================================

  function attachLocalPreview() {
    const localVideo = document.getElementById('vcLocalVideo');
    if (localVideo && vcState.localStream) {
      localVideo.srcObject = vcState.localStream;
      localVideo.style.display = 'block';
    }
  }

  // ============================================================
  // シグナリングイベント処理
  // ============================================================

  let pendingIceCandidates = [];

  async function handleSignalEvent(data) {
    try {
      const pc = vcState.peerConnection;

      if (data.signal_type === 'offer') {
        if (pc && pc.signalingState === 'have-local-offer') return;
        const newPc = createPeerConnection();
        await newPc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await newPc.createAnswer();
        await newPc.setLocalDescription(answer);
        broadcastSignal('answer', answer.sdp);
        for (const candidate of pendingIceCandidates) {
          await newPc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingIceCandidates = [];
      }

      if (data.signal_type === 'answer') {
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
          for (const candidate of pendingIceCandidates) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingIceCandidates = [];
        }
      }

      if (data.signal_type === 'ice') {
        if (data.candidate) {
          const currentPc = vcState.peerConnection;
          if (currentPc && currentPc.remoteDescription) {
            await currentPc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            pendingIceCandidates.push(data.candidate);
          }
        }
      }
    } catch (e) {}
  }

  async function handleCallStateEvent(data) {
    if (data.state === 'ringing' && vcState.stateMachine.getState() === 'idle') {
      if (vcState.isRaspi) {
        // ラズパイ受信端末: 着信の合言葉をサーバー側(verify-secret)で照合。
        // フェイルセーフ: 合言葉なし or 不一致は完全に無視（カメラを起動しない）。
        const candidate = typeof data.secret === 'string' ? data.secret : '';
        let ok = false;
        if (candidate && typeof verifySecret === 'function') {
          ok = await verifySecret('broadcast_call_secret', candidate);
        }
        if (!ok) return;
        // 照合中に状態が変わっていないか再確認
        if (vcState.stateMachine.getState() !== 'idle') return;
        vcState.stateMachine.transition('ringing');
        showStatus('でんわがきているよ！', 'info');
        updateUI();
        acceptCall();
      } else {
        // 親側など手動応答する端末: 着信表示のみ（応答は手動ボタン）
        vcState.stateMachine.transition('ringing');
        showStatus('でんわがきているよ！', 'info');
        updateUI();
      }
    }

    if (data.state === 'connected' && vcState.stateMachine.getState() === 'ringing') {
      // 発信側: 相手が接続完了 → offer送信
      vcState.stateMachine.transition('connected');
      const pc = createPeerConnection();
      showStatus('つながったよ！', 'success');
      updateUI();
      startCallTimer();
      (async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        broadcastSignal('offer', offer.sdp);
      })();
    }

    if (data.state === 'ended') {
      vcState.stateMachine.transition('ended');
      cleanup();
      showStatus('つうわおわり', 'info');
      updateUI();
    }
  }

  // ============================================================
  // ブロードキャスト
  // ============================================================

  function broadcastCallState(state) {
    if (vcState.channel) {
      const payload = { state, sender: vcState.senderId };
      // 発信(ringing)時のみ合言葉を載せる。ラズパイ側で照合する。
      if (state === 'ringing' && vcState.secret) payload.secret = vcState.secret;
      vcState.channel.send({
        type: 'broadcast',
        event: 'call_state',
        payload
      }).catch(() => {});
    }
  }

  function broadcastSignal(signalType, sdp, candidate) {
    if (vcState.channel) {
      vcState.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { signal_type: signalType, sdp: sdp || null, candidate: candidate || null, sender: vcState.senderId }
      }).catch(() => {});
    }
  }

  // ============================================================
  // バックグラウンド維持（Wake Lock + 無音オーディオ）
  // ============================================================

  let wakeLock = null;
  let keepAliveAudio = null;

  async function acquireWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch(e) {}

    if (!keepAliveAudio) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      keepAliveAudio = { ctx, oscillator, gain };
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
    if (keepAliveAudio) {
      keepAliveAudio.oscillator.stop();
      keepAliveAudio.ctx.close().catch(() => {});
      keepAliveAudio = null;
    }
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && vcState.stateMachine.getState() === 'connected') {
      await acquireWakeLock();
    }
  });

  // ============================================================
  // ヘルパー
  // ============================================================

  function cleanup() {
    releaseWakeLock();
    if (vcState.peerConnection) {
      vcState.peerConnection.close();
      vcState.peerConnection = null;
    }
    if (vcState.localStream) {
      vcState.localStream.getTracks().forEach(t => t.stop());
      vcState.localStream = null;
    }
    pendingIceCandidates = [];
    const localVideo = document.getElementById('vcLocalVideo');
    const remoteVideo = document.getElementById('vcRemoteVideo');
    if (localVideo) { localVideo.srcObject = null; localVideo.style.display = 'none'; }
    if (remoteVideo) { remoteVideo.srcObject = null; remoteVideo.style.display = 'none'; }
    stopCallTimer();
  }

  function startCallTimer() {
    vcState.callStartTime = Date.now();
    const timerEl = document.getElementById('vcTimer');
    if (!timerEl) return;
    timerEl.style.display = 'block';
    vcState.callTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - vcState.callStartTime) / 1000);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      timerEl.textContent = `${min}:${String(sec).padStart(2, '0')}`;
    }, 1000);
  }

  function stopCallTimer() {
    if (vcState.callTimer) {
      clearInterval(vcState.callTimer);
      vcState.callTimer = null;
    }
    vcState.callStartTime = null;
  }

  function showStatus(text, type) {
    const el = document.getElementById('vcStatus');
    if (el) {
      el.textContent = text;
      el.className = `vc-status ${type}`;
    }
  }

  function updateUI() {
    const state = vcState.stateMachine.getState();
    const callBtn = document.getElementById('vcCallBtn');
    const acceptBtn = document.getElementById('vcAcceptBtn');
    const endBtn = document.getElementById('vcEndBtn');
    const timerEl = document.getElementById('vcTimer');

    // ラズパイモードは操作ボタン非表示（自動応答）
    if (callBtn) callBtn.style.display = (!vcState.isRaspi && state === 'idle') ? 'block' : 'none';
    // 手動応答ボタン: 非ラズパイ端末が着信中(ringing)のときだけ表示
    if (acceptBtn) acceptBtn.style.display = (!vcState.isRaspi && state === 'ringing') ? 'block' : 'none';
    if (endBtn) endBtn.style.display = (!vcState.isRaspi && (state === 'ringing' || state === 'connected')) ? 'block' : 'none';
    if (timerEl) timerEl.style.display = (state === 'connected') ? 'block' : 'none';
  }

  function destroy() {
    cleanup();
    if (vcState.channel) {
      client.removeChannel(vcState.channel);
      vcState.channel = null;
    }
    vcState.stateMachine.reset();
  }

  // ============================================================
  // 公開
  // ============================================================

  window.BroadcastVideo = {
    init,
    startCall,
    acceptCall,
    endCall,
    getState() { return vcState.stateMachine.getState(); },
    onStateChange(fn) { vcState.stateMachine.onStateChange(fn); },
    destroy,
    _stateMachine: vcState.stateMachine,
    _VALID_TRANSITIONS: VALID_TRANSITIONS
  };

})();
