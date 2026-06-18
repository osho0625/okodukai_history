/**
 * puyo-battle-main.js — Multiplayer puyo battle logic
 * Loaded as ES module from puyo-battle.html
 * Integrates RoomStateManager, OwnershipManager, ReconnectionManager
 */

import { createRoomStateManager, STATES } from './puyo-room-state.js';
import { createOwnershipManager } from './puyo-ownership.js';
import { createReconnectionManager } from './puyo-reconnect.js';

// ============================================================
// Task 7.1: Client ID persistence (localStorage)
// ============================================================
const myClientId = localStorage.getItem('puyo_client_id') || (() => {
  const id = crypto.randomUUID();
  localStorage.setItem('puyo_client_id', id);
  return id;
})();

// ============================================================
// Supabase setup
// ============================================================
const SUPABASE_URL = 'https://ynecezxnltigplrfzzoh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// Global state
// ============================================================
let channel = null;
let roomId = null;
let roomCode = null;
let playerName = '';
let myJoinOrder = -1;
let isOwner = false;
let roomManager = null;
let ownershipMgr = null;
let reconnectMgr = null;
let currentDifficulty = { type: 'normal' };
let spectatorOnlyRoom = false;
let myRole = null; // 'seatA' | 'seatB' | 'spectator' | 'queue'

// Spectator animation state
let spectatorMode = false;           // true when role is 'spectator' or 'queue'
let seatAClientId = null;            // Player on left board
let seatBClientId = null;            // Player on right board
let spectatorParticles = [];         // Particle array for spectator overlay
let spectatorParticleCanvas = null;  // Overlay canvas element
let spectatorAnimFrame = null;       // Animation frame ID

// Game state
let gameRunning = false;
let gameLoop = null;
let grid = [];
let oppGrid = [];
let score = 0;
let oppScore = 0;
let currentPair = null;
let oppPair = null;
let pendingGarbage = 0;
let puyoSeq = [];
let puyoSeqIndex = 0;
let dropInterval = null;
let dropSpeed = 800;
let minSpeed = 200;
let speedDecay = 0.995;
let cols = 6;
let rows = 13;
let numColors = 5;
let seed = 0;

// Rematch state
let rematchTimerId = null;
let rematchCountdown = 30;

// Rotation state
let rotatingTimerId = null;

// Heartbeat
let heartbeatTimerId = null;
let dbUpdateTimerId = null;

// ============================================================
// PRNG (seeded random for puyo sequence sync)
// ============================================================
function createPRNG(s) {
  let state = s;
  return function() {
    state = (state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (state >>> 0) / 4294967296;
  };
}

function generatePuyoSequence(s, count, colors) {
  const rng = createPRNG(s);
  const seq = [];
  for (let i = 0; i < count; i++) {
    seq.push(Math.floor(rng() * colors));
  }
  return seq;
}

// ============================================================
// DOM references
// ============================================================
const $ = id => document.getElementById(id);

// Lobby
const lobbyEl = $('lobby');
const lobbyMain = $('lobbyMain');
const lobbyCreate = $('lobbyCreate');
const lobbyWaiting = $('lobbyWaiting');
const lobbyJoin = $('lobbyJoin');
const lobbyError = $('lobbyError');
const playerNameInput = $('playerName');
const roomCodeDisplay = $('roomCodeDisplay');
const waitingMsg = $('waitingMsg');
const roomListEl = $('roomList');
const spectatorOnlyCheck = $('spectatorOnlyCheck');

// Battle
const battleArea = $('battleArea');
const myCanvas = $('myCanvas');
const oppCanvas = $('oppCanvas');
const p1Name = $('p1Name');
const p2Name = $('p2Name');
const p1Score = $('p1Score');
const p2Score = $('p2Score');
const controlsEl = $('controls');
const spectatorBanner = $('spectatorBanner');
const rotatingBanner = $('rotatingBanner');

// Result overlay
const resultOverlay = $('resultOverlay');
const resultTitle = $('resultTitle');
const resultMsg = $('resultMsg');
const resultBtnRematch = $('resultBtnRematch');
const resultRematchStatus = $('resultRematchStatus');
const resultRematchTimer = $('resultRematchTimer');
const resultRotatingMsg = $('resultRotatingMsg');

// Rematch area
const rematchArea = $('rematchArea');
const btnRematch = $('btnRematch');
const rematchStatus = $('rematchStatus');
const rematchTimer = $('rematchTimer');

// Role selection
const roleSelectModal = $('roleSelectModal');
const btnRoleQueue = $('btnRoleQueue');

// Participant panel
const participantPanel = $('participantPanel');
const participantToggle = $('participantToggle');
const participantTitle = $('participantTitle');
const participantList = $('participantList');
const roleSwitchArea = $('roleSwitchArea');

// ============================================================
// Difficulty presets
// ============================================================
const DIFFICULTIES = {
  easy: { label: 'Easy', colors: 4, cols: 6, rows: 13, minSpeed: 400 },
  normal: { label: 'Normal', colors: 5, cols: 6, rows: 13, minSpeed: 200 },
  hard: { label: 'Hard', colors: 6, cols: 7, rows: 13, minSpeed: 150 },
  special: { label: 'Special', colors: 9, cols: 8, rows: 16, minSpeed: 100 },
};

// ============================================================
// Expose functions to window for onclick handlers in HTML
// ============================================================
window.showCreateUI = showCreateUI;
window.showJoinUI = showJoinUI;
window.createRoom = createRoom;
window.backToMain = backToMain;
window.cancelRoom = cancelRoom;
window.togglePasscodeInput = togglePasscodeInput;
window.voteRematch = voteRematch;
window.backToLobby = backToLobby;
window.chooseRole = chooseRole;
window.toggleParticipantPanel = toggleParticipantPanel;
window.doRotate = doRotate;
window.doLeft = doLeft;
window.doRight = doRight;
window.doDrop = doDrop;


// ============================================================
// Lobby UI functions
// ============================================================
function showCreateUI() {
  playerName = playerNameInput.value.trim();
  if (!playerName) { showError('なまえを入力してください'); return; }
  lobbyMain.style.display = 'none';
  lobbyCreate.style.display = 'block';
  initDifficultyButtons();
}

function showJoinUI() {
  playerName = playerNameInput.value.trim();
  if (!playerName) { showError('なまえを入力してください'); return; }
  lobbyMain.style.display = 'none';
  lobbyJoin.style.display = 'block';
  loadRoomList();
}

function backToMain() {
  lobbyCreate.style.display = 'none';
  lobbyJoin.style.display = 'none';
  lobbyWaiting.style.display = 'none';
  lobbyMain.style.display = 'block';
  lobbyError.textContent = '';
}

function togglePasscodeInput() {
  const inp = $('passcodeInput');
  inp.style.display = $('usePasscode').checked ? 'block' : 'none';
}

function showError(msg) {
  lobbyError.textContent = msg;
  setTimeout(() => { lobbyError.textContent = ''; }, 4000);
}

function initDifficultyButtons() {
  const container = $('difficultyBtns');
  container.innerHTML = '';
  const available = ['easy', 'normal'];
  if (localStorage.getItem('puyo_hard_unlocked') === 'true') available.push('hard');
  if (localStorage.getItem('puyo_special_unlocked') === 'true') available.push('special');
  if (localStorage.getItem('puyo_custom_unlocked') === 'true') available.push('custom');

  available.forEach(key => {
    const btn = document.createElement('button');
    btn.textContent = key === 'custom' ? 'カスタム' : DIFFICULTIES[key]?.label || key;
    btn.style.cssText = 'padding:8px 14px;border:1px solid #555;border-radius:8px;background:#2a2a4e;color:#fff;cursor:pointer;font-size:0.85em;';
    if (key === 'normal') btn.style.borderColor = '#4caf50';
    btn.onclick = () => selectDifficulty(key, container);
    container.appendChild(btn);
  });
}

function selectDifficulty(key, container) {
  Array.from(container.children).forEach(b => b.style.borderColor = '#555');
  event.target.style.borderColor = '#4caf50';
  if (key === 'custom') {
    currentDifficulty = { type: 'custom', settings: { colors: 5, cols: 6, rows: 13, minSpeed: 200 } };
  } else {
    currentDifficulty = { type: key };
  }
}

// ============================================================
// Task 7.2: Room creation with spectator_only
// ============================================================
async function createRoom() {
  const code = generateRoomCode();
  spectatorOnlyRoom = spectatorOnlyCheck.checked;
  const passcode = $('usePasscode').checked ? $('passcodeInput').value.trim() : null;

  if (passcode && !/^\d{4}$/.test(passcode)) {
    showError('パスコードは数字4桁で入力してください');
    return;
  }

  const diffSettings = getDifficultySettings();

  try {
    const { data, error } = await supabase.from('puyo_battles').insert({
      room_code: code,
      player1_name: playerName,
      status: 'waiting',
      passcode: passcode || null,
      difficulty: currentDifficulty,
      spectator_only: spectatorOnlyRoom,
      owner_client_id: myClientId,
      max_players: 6,
    }).select().single();

    if (error) throw error;

    roomId = data.id;
    roomCode = code;
    isOwner = true;

    // Initialize managers
    initManagers(true);

    // Subscribe to channel
    subscribeToChannel(code);

    // Show waiting UI
    lobbyCreate.style.display = 'none';
    lobbyWaiting.style.display = 'block';
    roomCodeDisplay.textContent = code;
    waitingMsg.textContent = '相手を待っています...';

  } catch (e) {
    showError('ルーム作成に失敗しました: ' + e.message);
  }
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getDifficultySettings() {
  if (currentDifficulty.type === 'custom') {
    return currentDifficulty.settings;
  }
  const preset = DIFFICULTIES[currentDifficulty.type] || DIFFICULTIES.normal;
  return { colors: preset.colors, cols: preset.cols, rows: preset.rows, minSpeed: preset.minSpeed };
}

// ============================================================
// Task 7.2: Room list with 👁 icon for spectator-only rooms
// ============================================================
async function loadRoomList() {
  roomListEl.innerHTML = '<div style="color:#aaa;font-size:0.9em;">読み込み中...</div>';
  try {
    const { data, error } = await supabase
      .from('puyo_battles')
      .select('*')
      .in('status', ['waiting', 'playing', 'lobby'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!data || data.length === 0) {
      roomListEl.innerHTML = '<div style="color:#aaa;font-size:0.9em;">待機中のルームがありません</div>';
      return;
    }

    roomListEl.innerHTML = '';
    data.forEach(room => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:10px;margin-bottom:8px;background:#2a2a4e;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;';
      const spectatorIcon = room.spectator_only ? ' 👁' : '';
      const statusLabel = room.status === 'waiting' ? '待機中' : '対戦中';
      div.innerHTML = `
        <div>
          <span style="font-weight:700;color:#ffd700;">${room.room_code}</span>${spectatorIcon}
          <span style="font-size:0.8em;color:#aaa;margin-left:8px;">${room.player1_name}</span>
        </div>
        <span style="font-size:0.75em;color:#888;">${statusLabel}</span>
      `;
      div.onclick = () => joinRoom(room);
      roomListEl.appendChild(div);
    });
  } catch (e) {
    roomListEl.innerHTML = '<div style="color:#e53935;font-size:0.9em;">読み込みに失敗しました</div>';
  }
}

// ============================================================
// Join room
// ============================================================
async function joinRoom(room) {
  if (room.passcode) {
    const input = prompt('パスコードを入力してください（数字4桁）');
    if (input !== room.passcode) {
      showError('パスコードが違います');
      return;
    }
  }

  roomId = room.id;
  roomCode = room.room_code;
  spectatorOnlyRoom = room.spectator_only || false;
  currentDifficulty = room.difficulty || { type: 'normal' };
  isOwner = false;

  // Initialize managers
  initManagers(false);

  // Subscribe to channel — join event will be sent after subscription is confirmed
  subscribeToChannel(room.room_code, () => {
    // Send join event only after channel is subscribed
    sendAction('player_join', { clientId: myClientId, name: playerName });
  });

  // Show waiting state (lobby stays visible until room_state_sync arrives)
  lobbyJoin.style.display = 'none';
  lobbyWaiting.style.display = 'block';
  waitingMsg.textContent = 'ルームに接続中...';
}

// ============================================================
// Initialize managers
// ============================================================
function initManagers(asOwner) {
  roomManager = createRoomStateManager({
    spectatorOnly: spectatorOnlyRoom,
    ownerId: asOwner ? myClientId : null,
  });

  ownershipMgr = createOwnershipManager({
    myClientId,
    myJoinOrder: 0,
    isOwner: asOwner,
  });

  reconnectMgr = createReconnectionManager({ gracePeriod: 30000 });

  if (asOwner) {
    // Add self as first participant and assign to seatA
    const me = roomManager.addParticipant(myClientId, playerName);
    myJoinOrder = me.joinOrder;
    roomManager.assignSeat(myClientId, 'seatA');
    myRole = 'seatA';
  }
}

// ============================================================
// Task 8.3: Broadcast wrapper functions
// ============================================================
function broadcastRoomState() {
  if (!channel || !isOwner) return;
  const snapshot = roomManager.getSnapshot();
  roomManager.incrementVersion();
  const stateId = { epoch: snapshot.stateId.epoch, version: snapshot.stateId.version };
  channel.send({
    type: 'broadcast',
    event: 'room_state_sync',
    payload: { ...snapshot, stateId, ownerId: myClientId, seed },
  });
}

function sendAction(event, payload) {
  if (!channel) return;
  const retries = 3;
  let attempt = 0;
  function trySend() {
    channel.send({ type: 'broadcast', event, payload }).then(() => {}).catch(() => {
      attempt++;
      if (attempt < retries) setTimeout(trySend, 500 * attempt);
    });
  }
  trySend();
}

function broadcastHeartbeat() {
  if (!channel || !isOwner) return;
  const payload = ownershipMgr.getHeartbeatPayload();
  channel.send({ type: 'broadcast', event: 'heartbeat', payload });
}

// ============================================================
// Task 8.1 & 8.2: Channel subscription and event wiring
// ============================================================
function subscribeToChannel(code, onSubscribed) {
  channel = supabase.channel(`battle_${code}`, {
    config: { broadcast: { self: false } },
  });

  // Listen for all broadcast events
  channel.on('broadcast', { event: 'player_join' }, ({ payload }) => handlePlayerJoin(payload));
  channel.on('broadcast', { event: 'player_leave' }, ({ payload }) => handlePlayerLeave(payload));
  channel.on('broadcast', { event: 'role_choice' }, ({ payload }) => handleRoleChoice(payload));
  channel.on('broadcast', { event: 'role_switch' }, ({ payload }) => handleRoleSwitch(payload));
  channel.on('broadcast', { event: 'rematch_vote' }, ({ payload }) => handleRematchVote(payload));
  channel.on('broadcast', { event: 'rematch_cancel' }, ({ payload }) => handleRematchCancel(payload));
  channel.on('broadcast', { event: 'gameover' }, ({ payload }) => handleGameover(payload));
  channel.on('broadcast', { event: 'room_state_sync' }, ({ payload }) => handleRoomStateSync(payload));
  channel.on('broadcast', { event: 'heartbeat' }, ({ payload }) => handleHeartbeat(payload));
  channel.on('broadcast', { event: 'ownership_transfer' }, ({ payload }) => handleOwnershipTransfer(payload));
  channel.on('broadcast', { event: 'ownership_claim' }, ({ payload }) => handleOwnershipClaim(payload));
  channel.on('broadcast', { event: 'new_battle_start' }, ({ payload }) => handleNewBattleStart(payload));
  channel.on('broadcast', { event: 'rotating_ready' }, ({ payload }) => handleRotatingReady(payload));
  channel.on('broadcast', { event: 'state' }, ({ payload }) => handleStateUpdate(payload));
  channel.on('broadcast', { event: 'garbage' }, ({ payload }) => handleGarbageReceived(payload));
  channel.on('broadcast', { event: 'seed' }, ({ payload }) => handleSeed(payload));
  channel.on('broadcast', { event: 'chain_animation' }, ({ payload }) => handleChainAnimation(payload));
  channel.on('broadcast', { event: 'disconnect_notice' }, ({ payload }) => handleDisconnectNotice(payload));
  channel.on('broadcast', { event: 'reconnect_success' }, ({ payload }) => handleReconnectSuccess(payload));
  channel.on('broadcast', { event: 'reconnect_request' }, ({ payload }) => handleReconnectRequest(payload));
  channel.on('broadcast', { event: 'room_dissolved' }, ({ payload }) => handleRoomDissolved(payload));

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      // Start heartbeat if owner
      if (isOwner) startOwnerHeartbeat();
      // Start miss detection if not owner
      if (!isOwner) startMissDetection();
      // Call onSubscribed callback (e.g., send player_join)
      if (onSubscribed) onSubscribed();
    }
  });
}


// ============================================================
// Task 8.1: Owner-side event handlers
// ============================================================
function handlePlayerJoin(payload) {
  if (!isOwner) return;
  const { clientId, name } = payload;
  if (!clientId || !name) return;

  // Check if reconnecting
  if (reconnectMgr.isDisconnected(clientId)) {
    const restored = reconnectMgr.onReconnect(clientId);
    if (restored) {
      // Restore role
      restoreParticipantRole(clientId, name, restored);
      broadcastRoomState();
      channel.send({ type: 'broadcast', event: 'reconnect_success', payload: { clientId, role: restored.role } });
      return;
    }
  }

  // Task 11.1: Room full rejection
  if (roomManager.getParticipantCount() >= 6) {
    // Can't add — silently ignore (client will timeout)
    return;
  }

  // Task 11.1: Name collision — append suffix
  const uniqueName = resolveNameCollision(name);

  try {
    const participant = roomManager.addParticipant(clientId, uniqueName);

    // First 2 players auto-assign to seats
    const count = roomManager.getParticipantCount();
    if (count <= 2) {
      if (!roomManager.getSnapshot().seatA) {
        roomManager.assignSeat(clientId, 'seatA');
      } else if (!roomManager.getSnapshot().seatB) {
        roomManager.assignSeat(clientId, 'seatB');
        // Both seats filled — update DB and start battle
        updateDBStatus('playing');
        startBattleAsOwner();
      }
    }
    // 3rd+ player stays as spectator — client will show role selection modal

    broadcastRoomState();
  } catch (e) {
    // Participant already exists or room full
    console.warn('handlePlayerJoin error:', e.message);
  }
}

function handlePlayerLeave(payload) {
  if (!isOwner) return;
  const { clientId } = payload;
  if (!clientId) return;

  const found = roomManager.findParticipant(clientId);
  if (!found) return;

  // If active player leaves during game, handle as disconnect
  if ((found.location === 'seatA' || found.location === 'seatB') && roomManager.getState() === STATES.PLAYING) {
    reconnectMgr.onDisconnect(clientId, found.location, null, null);
    channel.send({ type: 'broadcast', event: 'disconnect_notice', payload: { clientId, role: found.location, timeout: 30000 } });
    broadcastRoomState();
    return;
  }

  roomManager.removeParticipant(clientId);

  // Check if room is empty
  if (roomManager.isEmpty() && !reconnectMgr.hasPendingReconnections()) {
    closeRoom();
    return;
  }

  broadcastRoomState();
}

function handleRoleChoice(payload) {
  if (!isOwner) return;
  const { clientId, role } = payload;
  if (!ownershipMgr.validateAction('role_choice', payload, clientId, roomManager.getSnapshot())) return;

  if (role === 'queue') {
    try {
      roomManager.enqueue(clientId);
    } catch (e) { /* spectatorOnly or not a spectator */ }
  }
  // 'spectator' — already a spectator by default, no action needed

  broadcastRoomState();
}

function handleRoleSwitch(payload) {
  if (!isOwner) return;
  const { clientId, newRole } = payload;
  if (!ownershipMgr.validateAction('role_switch', payload, clientId, roomManager.getSnapshot())) return;

  try {
    if (newRole === 'queue') {
      roomManager.switchToQueue(clientId);
    } else if (newRole === 'spectator') {
      roomManager.switchToSpectator(clientId);
    }
  } catch (e) { /* invalid switch */ }

  broadcastRoomState();
}

function handleRematchVote(payload) {
  if (!isOwner) return;
  const { clientId, vote, battleId } = payload;
  if (!ownershipMgr.validateAction('rematch_vote', payload, clientId, roomManager.getSnapshot())) return;

  if (vote) {
    const accepted = roomManager.voteRematch(clientId, battleId);
    if (accepted && roomManager.checkRematchReady()) {
      // Both voted — start new battle
      clearRematchTimer();
      startNewBattle();
    }
  }
  broadcastRoomState();
}

function handleRematchCancel(payload) {
  if (!isOwner) return;
  const { clientId } = payload;

  // Player chose to go back to lobby — transition to LOBBY
  clearRematchTimer();
  try {
    roomManager.transition(STATES.LOBBY);
  } catch (e) { /* already in lobby or invalid transition */ }
  broadcastRoomState();
}

function handleGameover(payload) {
  if (!isOwner) return;
  const { loserClientId } = payload;
  if (!loserClientId) return;

  const snapshot = roomManager.getSnapshot();
  // Determine winner
  let winnerClientId = null;
  if (snapshot.seatA && snapshot.seatA.clientId === loserClientId) {
    winnerClientId = snapshot.seatB ? snapshot.seatB.clientId : null;
  } else if (snapshot.seatB && snapshot.seatB.clientId === loserClientId) {
    winnerClientId = snapshot.seatA ? snapshot.seatA.clientId : null;
  }

  // Transition to RESULT
  try {
    roomManager.transition(STATES.RESULT);
  } catch (e) { return; }

  // Decide next state based on queue
  const queue = roomManager.getSnapshot().queue;
  if (queue.length > 0 && winnerClientId) {
    // Task 9.2: Winner-stays rotation
    try {
      roomManager.transition(STATES.ROTATING);
      roomManager.rotate(winnerClientId, loserClientId);
      broadcastRoomState();
      // 5s countdown then start new battle
      startRotationCountdown();
    } catch (e) {
      // Fallback to rematch wait
      try { roomManager.transition(STATES.REMATCH_WAIT); } catch (e2) {}
      startRematchTimer();
      broadcastRoomState();
    }
  } else {
    // No queue — rematch wait
    try {
      roomManager.transition(STATES.REMATCH_WAIT);
    } catch (e) {}
    roomManager.resetForNewBattle(Date.now() + 30000);
    startRematchTimer();
    broadcastRoomState();
  }
}

// ============================================================
// Task 8.2: Non-owner event handlers
// ============================================================
function handleRoomStateSync(payload) {
  if (isOwner) return; // Owner doesn't apply its own sync

  const incoming = payload.stateId;
  const currentStateId = ownershipMgr.getStateId();

  // Epoch check — accept higher epoch (new owner)
  if (incoming.epoch > currentStateId.epoch) {
    ownershipMgr.setStateId(incoming);
    ownershipMgr.setOwnerId(payload.ownerId);
    applyRoomState(payload);
    return;
  }

  // Same epoch — must be from current owner
  if (payload.ownerId !== ownershipMgr.getOwnerId()) return;
  if (incoming.epoch === currentStateId.epoch && incoming.version <= currentStateId.version) return;

  ownershipMgr.setStateId(incoming);
  applyRoomState(payload);
}

function handleHeartbeat(payload) {
  if (isOwner) return;
  ownershipMgr.receiveHeartbeat(payload);
}

function handleOwnershipTransfer(payload) {
  ownershipMgr.receiveTransfer(payload);
  if (payload.newOwnerId === myClientId) {
    isOwner = true;
    // Inherit room state
    if (payload.roomStateSnapshot) {
      applyRoomStateToManager(payload.roomStateSnapshot);
    }
    startOwnerHeartbeat();
    stopMissDetection();
  } else {
    isOwner = false;
    stopOwnerHeartbeat();
    startMissDetection();
  }
}

function handleOwnershipClaim(payload) {
  // Evaluate claim
  const allParticipants = getAllParticipantsList();
  const result = ownershipMgr.receiveClaim(payload, allParticipants);

  if (result.accepted && payload.candidateId === myClientId) {
    // I won the claim — perform transfer
    const snapshot = roomManager.getSnapshot();
    const transferPayload = ownershipMgr.performTransfer(snapshot);
    isOwner = true;
    channel.send({ type: 'broadcast', event: 'ownership_transfer', payload: transferPayload });
    startOwnerHeartbeat();
    stopMissDetection();
  }
}

function handleNewBattleStart(payload) {
  const { seed: newSeed, seatA, seatB } = payload;
  seed = newSeed;
  startBattleForAll(seatA, seatB);
}

function handleRotatingReady(payload) {
  const { nextSeatB, countdown } = payload;
  showRotatingUI(nextSeatB, countdown);
}

function handleStateUpdate(payload) {
  // Receive opponent's board state
  if (!gameRunning) return;
  if (payload.clientId === myClientId) return;
  oppGrid = payload.grid || oppGrid;
  oppScore = payload.score || oppScore;
  oppPair = payload.pair || null;
  renderOppBoard();
  p2Score.textContent = oppScore;
}

function handleGarbageReceived(payload) {
  if (!gameRunning) return;
  if (payload.targetClientId !== myClientId) return;
  pendingGarbage += payload.amount || 0;
  renderGarbageBar();
}

function handleSeed(payload) {
  seed = payload.seed;
}

function handleDisconnectNotice(payload) {
  // Show disconnect indicator in participant list
  updateParticipantPanel();
}

function handleReconnectSuccess(payload) {
  updateParticipantPanel();
}

function handleReconnectRequest(payload) {
  if (!isOwner) return;
  // Owner handles reconnection
  handlePlayerJoin(payload);
}

function handleRoomDissolved(payload) {
  // Room was dissolved by owner — show notification and return to lobby
  gameRunning = false;
  clearDropLoop();
  clearStateBroadcast();
  if (channel) {
    channel.unsubscribe();
    channel = null;
  }
  stopOwnerHeartbeat();
  stopMissDetection();
  roomId = null;
  roomCode = null;

  // Show lobby with dissolution message
  resultOverlay.style.display = 'none';
  battleArea.style.display = 'none';
  roleSelectModal.style.display = 'none';
  participantPanel.style.display = 'none';
  lobbyEl.style.display = 'block';
  lobbyMain.style.display = 'block';
  lobbyWaiting.style.display = 'none';
  lobbyJoin.style.display = 'none';
  lobbyCreate.style.display = 'none';
  showError(payload.reason || 'ルームが解散されました');
}


// ============================================================
// Task 8.5: Apply room_state_sync to UI
// ============================================================
function applyRoomState(payload) {
  const state = payload.state || payload;

  // Update local room manager state for non-owners
  if (!isOwner && roomManager) {
    applyRoomStateToManager(payload);
  }

  // Determine my role
  const snapshot = roomManager ? roomManager.getSnapshot() : payload;
  updateMyRole(snapshot);

  // Task 1.2: Update spectator seat clientIds on room_state_sync
  if (spectatorMode) {
    seatAClientId = snapshot.seatA ? snapshot.seatA.clientId : null;
    seatBClientId = snapshot.seatB ? snapshot.seatB.clientId : null;
  }

  // Update UI based on state
  const roomState = snapshot.state || payload.state;

  switch (roomState) {
    case STATES.LOBBY:
      showLobbyState();
      break;
    case STATES.PLAYING:
      // If I'm an active player and game isn't running, start it
      if ((myRole === 'seatA' || myRole === 'seatB') && !gameRunning) {
        const snap = roomManager ? roomManager.getSnapshot() : payload;
        // If seed is available in the payload, start the game
        if (payload.seed) {
          seed = payload.seed;
          startBattleForAll(snap.seatA, snap.seatB);
        } else {
          // Show battle UI, wait for new_battle_start event with seed
          lobbyEl.style.display = 'none';
          battleArea.style.display = 'block';
          spectatorBanner.style.display = 'none';
          controlsEl.style.display = 'flex';
          participantToggle.style.display = 'block';
          if (snap.seatA) p1Name.textContent = snap.seatA.name;
          if (snap.seatB) p2Name.textContent = snap.seatB.name;
        }
      }
      // If spectator/queue, show spectator view
      if (myRole === 'spectator' || myRole === 'queue') {
        showSpectatorView();
      }
      break;
    case STATES.RESULT:
      // Result handled by gameover flow
      break;
    case STATES.REMATCH_WAIT:
      showRematchWaitUI(snapshot);
      break;
    case STATES.ROTATING:
      showRotatingState(snapshot);
      break;
  }

  // Always update participant panel
  updateParticipantPanel();

  // Task 7.3: Show role selection for 3rd+ participant who just joined
  if (myRole === 'spectator' && roomState !== STATES.LOBBY && !gameRunning) {
    const count = getParticipantCountFromSnapshot(snapshot);
    if (count > 2) {
      showRoleSelectionIfNeeded(snapshot);
    }
  }
}

function applyRoomStateToManager(payload) {
  // Overwrite local manager state with authoritative state
  if (!roomManager) return;
  const rs = roomManager._state;
  rs.state = payload.state || rs.state;
  rs.seatA = payload.seatA || null;
  rs.seatB = payload.seatB || null;
  rs.spectators = payload.spectators || [];
  rs.queue = payload.queue || [];
  rs.rematchVotes = payload.rematchVotes || { seatA: false, seatB: false };
  rs.battleId = payload.battleId ?? rs.battleId;
  rs.spectatorOnly = payload.spectatorOnly ?? rs.spectatorOnly;
  rs.ownerId = payload.ownerId || rs.ownerId;
  rs.stateId = payload.stateId || rs.stateId;
  rs.joinCounter = payload.joinCounter ?? rs.joinCounter;
  rs.queueCounter = payload.queueCounter ?? rs.queueCounter;
  rs.winStreaks = payload.winStreaks || {};
  rs.deadlines = payload.deadlines || rs.deadlines;
}

function updateMyRole(snapshot) {
  if (snapshot.seatA && snapshot.seatA.clientId === myClientId) {
    myRole = 'seatA';
  } else if (snapshot.seatB && snapshot.seatB.clientId === myClientId) {
    myRole = 'seatB';
  } else if (snapshot.queue && snapshot.queue.some(q => q.clientId === myClientId)) {
    myRole = 'queue';
  } else if (snapshot.spectators && snapshot.spectators.some(s => s.clientId === myClientId)) {
    myRole = 'spectator';
  }
}

function getParticipantCountFromSnapshot(snapshot) {
  let count = 0;
  if (snapshot.seatA) count++;
  if (snapshot.seatB) count++;
  count += (snapshot.spectators || []).length;
  count += (snapshot.queue || []).length;
  return count;
}

// ============================================================
// Task 7.3: Role selection UI for 3rd+ participants
// ============================================================
let roleSelected = false;

function showRoleSelectionIfNeeded(snapshot) {
  if (roleSelected) return;
  // Hide queue button if spectatorOnly
  if (snapshot.spectatorOnly) {
    btnRoleQueue.style.display = 'none';
  } else {
    btnRoleQueue.style.display = 'block';
  }
  roleSelectModal.style.display = 'flex';
}

function chooseRole(role) {
  roleSelected = true;
  roleSelectModal.style.display = 'none';
  sendAction('role_choice', { clientId: myClientId, role });

  if (role === 'queue') {
    myRole = 'queue';
  } else {
    myRole = 'spectator';
  }

  // Show spectator view
  showSpectatorView();
}

// ============================================================
// Task 7.4: Participant list panel
// ============================================================
function toggleParticipantPanel() {
  const visible = participantPanel.style.display === 'block';
  participantPanel.style.display = visible ? 'none' : 'block';
}

function updateParticipantPanel() {
  if (!roomManager) return;
  const snapshot = roomManager.getSnapshot();
  const count = getParticipantCountFromSnapshot(snapshot);

  participantTitle.textContent = `参加者 (${count}/6)`;
  participantList.innerHTML = '';

  // Show toggle button when in battle
  if (snapshot.state !== STATES.LOBBY) {
    participantToggle.style.display = 'block';
  }

  // SeatA
  if (snapshot.seatA) {
    addParticipantItem(snapshot.seatA, '🎮', snapshot.ownerId, snapshot.winStreaks);
  }
  // SeatB
  if (snapshot.seatB) {
    addParticipantItem(snapshot.seatB, '🎮', snapshot.ownerId, snapshot.winStreaks);
  }
  // Spectators
  (snapshot.spectators || []).forEach(s => {
    addParticipantItem(s, '👁', snapshot.ownerId, snapshot.winStreaks);
  });
  // Queue
  (snapshot.queue || []).forEach((q, i) => {
    addParticipantItem(q, '⏳', snapshot.ownerId, snapshot.winStreaks, i + 1);
  });

  // Role switch buttons
  updateRoleSwitchButtons(snapshot);
}

function addParticipantItem(participant, icon, ownerId, winStreaks, queuePos) {
  const div = document.createElement('div');
  div.className = 'p-item';
  const ownerBadge = participant.clientId === ownerId ? ' 👑' : '';
  const streak = winStreaks && winStreaks[participant.clientId] ? ` (${winStreaks[participant.clientId]}連勝)` : '';
  const posLabel = queuePos ? ` (${queuePos}番目)` : '';
  const isMe = participant.clientId === myClientId ? ' ★' : '';
  div.innerHTML = `
    <span class="p-icon">${icon}</span>
    <span class="p-name">${participant.name}${isMe}${ownerBadge}${posLabel}</span>
    <span class="p-streak">${streak}</span>
  `;
  participantList.appendChild(div);
}

function updateRoleSwitchButtons(snapshot) {
  roleSwitchArea.innerHTML = '';
  if (myRole === 'spectator' && !snapshot.spectatorOnly) {
    const btn = document.createElement('button');
    btn.textContent = '🎮 順番待ちに入る';
    btn.style.cssText = 'width:100%;padding:8px;border:none;border-radius:8px;background:#1976d2;color:#fff;cursor:pointer;font-size:0.85em;';
    btn.onclick = () => sendAction('role_switch', { clientId: myClientId, newRole: 'queue' });
    roleSwitchArea.appendChild(btn);
  } else if (myRole === 'queue') {
    const btn = document.createElement('button');
    btn.textContent = '👁 順番待ちをやめる';
    btn.style.cssText = 'width:100%;padding:8px;border:none;border-radius:8px;background:#ff9800;color:#fff;cursor:pointer;font-size:0.85em;';
    btn.onclick = () => sendAction('role_switch', { clientId: myClientId, newRole: 'spectator' });
    roleSwitchArea.appendChild(btn);
  }
}

// ============================================================
// Task 7.5: Spectator view (read-only dual board display)
// ============================================================
function showSpectatorView() {
  lobbyEl.style.display = 'none';
  battleArea.style.display = 'block';
  spectatorBanner.style.display = 'block';
  controlsEl.style.display = 'none'; // No controls for spectators
  participantToggle.style.display = 'block';

  // Set player names from room state
  const snapshot = roomManager ? roomManager.getSnapshot() : null;
  if (snapshot) {
    p1Name.textContent = snapshot.seatA ? snapshot.seatA.name : 'P1';
    p2Name.textContent = snapshot.seatB ? snapshot.seatB.name : 'P2';
    // Task 1.2: Initialize spectator seat clientIds for animation targeting
    seatAClientId = snapshot.seatA ? snapshot.seatA.clientId : null;
    seatBClientId = snapshot.seatB ? snapshot.seatB.clientId : null;
  }
  spectatorMode = true;

  initCanvases();
}

// ============================================================
// Task 9.1: Rematch button and vote status
// ============================================================
function showRematchWaitUI(snapshot) {
  resultOverlay.style.display = 'flex';

  // Show rematch button only when queue is empty and not spectatorOnly
  const canRematch = (myRole === 'seatA' || myRole === 'seatB') &&
    (snapshot.queue || []).length === 0;

  if (canRematch) {
    resultBtnRematch.style.display = 'inline-block';
  } else {
    resultBtnRematch.style.display = 'none';
  }

  // Show vote status
  if (snapshot.rematchVotes) {
    if (snapshot.rematchVotes.seatA || snapshot.rematchVotes.seatB) {
      resultRematchStatus.textContent = '相手の応答を待っています...';
    } else {
      resultRematchStatus.textContent = '';
    }
  }
}

function voteRematch() {
  const snapshot = roomManager ? roomManager.getSnapshot() : null;
  const battleId = snapshot ? snapshot.battleId : 0;
  sendAction('rematch_vote', { clientId: myClientId, vote: true, battleId });
  resultBtnRematch.style.display = 'none';
  resultRematchStatus.textContent = '相手の応答を待っています...';
}

function startRematchTimer() {
  if (!isOwner) return;
  rematchCountdown = 30;
  clearRematchTimer();
  rematchTimerId = setInterval(() => {
    rematchCountdown--;
    if (rematchCountdown <= 0) {
      clearRematchTimer();
      // Timeout — back to lobby
      try { roomManager.transition(STATES.LOBBY); } catch (e) {}
      broadcastRoomState();
    }
  }, 1000);
}

function clearRematchTimer() {
  if (rematchTimerId) {
    clearInterval(rematchTimerId);
    rematchTimerId = null;
  }
}

// ============================================================
// Task 9.2: Winner-stays rotation flow
// ============================================================
function startRotationCountdown() {
  if (!isOwner) return;
  const snapshot = roomManager.getSnapshot();
  const nextSeatB = snapshot.seatB;

  // Broadcast rotating_ready
  channel.send({
    type: 'broadcast',
    event: 'rotating_ready',
    payload: { nextSeatB, countdown: 5 },
  });

  let countdown = 5;
  rotatingTimerId = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(rotatingTimerId);
      rotatingTimerId = null;
      startNewBattle();
    }
  }, 1000);
}

function showRotatingState(snapshot) {
  resultOverlay.style.display = 'flex';
  resultBtnRematch.style.display = 'none';
  const nextOpp = snapshot.seatB ? snapshot.seatB.name : '???';
  resultRotatingMsg.style.display = 'block';
  resultRotatingMsg.textContent = `次の対戦まで 5秒... (vs ${nextOpp})`;
}

function showRotatingUI(nextSeatB, countdown) {
  resultOverlay.style.display = 'flex';
  resultBtnRematch.style.display = 'none';
  const name = nextSeatB ? nextSeatB.name : '???';
  resultRotatingMsg.style.display = 'block';
  resultRotatingMsg.textContent = `次の対戦まで ${countdown}秒... (vs ${name})`;
}

// ============================================================
// Battle start logic
// ============================================================
function startBattleAsOwner() {
  // Generate new seed
  seed = Math.floor(Math.random() * 2147483647);
  const snapshot = roomManager.getSnapshot();

  // Transition to PLAYING
  try {
    roomManager.transition(STATES.PLAYING);
  } catch (e) { return; }

  // Broadcast new_battle_start
  channel.send({
    type: 'broadcast',
    event: 'new_battle_start',
    payload: { seed, seatA: snapshot.seatA, seatB: snapshot.seatB },
  });

  // Start battle locally
  startBattleForAll(snapshot.seatA, snapshot.seatB);
  broadcastRoomState();
}

function startNewBattle() {
  if (!isOwner) return;
  seed = Math.floor(Math.random() * 2147483647);
  const snapshot = roomManager.getSnapshot();

  roomManager.resetForNewBattle(null);

  // Transition to PLAYING
  try {
    if (snapshot.state !== STATES.PLAYING) {
      roomManager.transition(STATES.PLAYING);
    }
  } catch (e) {
    // Try from current state
    try { roomManager.transition(STATES.PLAYING); } catch (e2) { return; }
  }

  channel.send({
    type: 'broadcast',
    event: 'new_battle_start',
    payload: { seed, seatA: snapshot.seatA, seatB: snapshot.seatB },
  });

  startBattleForAll(snapshot.seatA, snapshot.seatB);
  broadcastRoomState();
}

function startBattleForAll(seatA, seatB) {
  // Hide result overlay
  resultOverlay.style.display = 'none';
  resultRotatingMsg.style.display = 'none';
  rotatingBanner.style.display = 'none';

  // Determine if I'm playing
  const amPlaying = (seatA && seatA.clientId === myClientId) || (seatB && seatB.clientId === myClientId);

  if (amPlaying) {
    // I'm an active player
    lobbyEl.style.display = 'none';
    battleArea.style.display = 'block';
    spectatorBanner.style.display = 'none';
    controlsEl.style.display = 'flex';
    participantToggle.style.display = 'block';

    // Set names
    if (seatA && seatA.clientId === myClientId) {
      p1Name.textContent = seatA.name;
      p2Name.textContent = seatB ? seatB.name : 'P2';
      myRole = 'seatA';
    } else {
      p1Name.textContent = seatB ? seatB.name : 'P2';
      p2Name.textContent = seatA ? seatA.name : 'P1';
      myRole = 'seatB';
    }

    startGame();
  } else {
    // I'm spectating
    showSpectatorView();
    if (seatA) p1Name.textContent = seatA.name;
    if (seatB) p2Name.textContent = seatB.name;
  }
}


// ============================================================
// Game engine (simplified puyo battle)
// ============================================================
function startGame() {
  const settings = getDifficultySettings();
  cols = settings.cols;
  rows = settings.rows;
  numColors = settings.colors;
  minSpeed = settings.minSpeed;
  dropSpeed = 800;
  score = 0;
  oppScore = 0;
  pendingGarbage = 0;
  gameRunning = true;

  // Generate puyo sequence from seed
  puyoSeq = generatePuyoSequence(seed, 1000, numColors);
  puyoSeqIndex = 0;

  // Initialize grid
  grid = Array.from({ length: rows }, () => Array(cols).fill(-1));
  oppGrid = Array.from({ length: rows }, () => Array(cols).fill(-1));

  initCanvases();
  spawnPair();
  startDropLoop();
  startStateBroadcast();

  p1Score.textContent = '0';
  p2Score.textContent = '0';
}

function initCanvases() {
  const settings = getDifficultySettings();
  const cellSize = Math.min(28, Math.floor(180 / (settings.cols || 6)));
  const w = cellSize * (settings.cols || 6);
  const h = cellSize * (settings.rows || 13);
  myCanvas.width = w;
  myCanvas.height = h;
  oppCanvas.width = w;
  oppCanvas.height = h;
}

const PUYO_COLORS = ['#e53935', '#43a047', '#1e88e5', '#fdd835', '#8e24aa', '#ff8f00', '#00acc1', '#6d4c41', '#78909c'];

// Puyo images preload
const PUYO_IMGS_SRC = [
  '../images/puyo_1.avif','../images/puyo_2.avif','../images/puyo_3.avif',
  '../images/puyo_4.avif','../images/puyo_5.avif','../images/puyo_6.avif',
  '../images/puyo_7.avif','../images/puyo_8.avif','../images/puyo_9.avif',
  '../images/puyo_10.avif'
];
const loadedImgs = [];
let imgsReady = false;
(function preloadImages() {
  let loaded = 0;
  PUYO_IMGS_SRC.forEach((src, i) => {
    const img = new Image();
    img.onload = img.onerror = () => { loaded++; if (loaded === PUYO_IMGS_SRC.length) imgsReady = true; };
    img.src = src;
    loadedImgs[i] = img;
  });
})();

function spawnPair() {
  if (!gameRunning) return;
  const c1 = puyoSeq[puyoSeqIndex % puyoSeq.length];
  const c2 = puyoSeq[(puyoSeqIndex + 1) % puyoSeq.length];
  puyoSeqIndex += 2;

  currentPair = {
    x: Math.floor(cols / 2) - 1,
    y: 0,
    color1: c1,
    color2: c2,
    rotation: 0, // 0=up, 1=right, 2=down, 3=left
  };

  // Check game over (only colored puyo block spawn, not garbage)
  if (grid[0][currentPair.x] >= 0 || grid[1][currentPair.x] >= 0) {
    gameOver();
    return;
  }

  renderMyBoard();
}

function startDropLoop() {
  clearDropLoop();
  dropInterval = setInterval(() => {
    if (!gameRunning || !currentPair) return;
    if (canDrop()) {
      currentPair.y++;
      renderMyBoard();
    } else {
      lockPair();
    }
  }, dropSpeed);
}

function clearDropLoop() {
  if (dropInterval) {
    clearInterval(dropInterval);
    dropInterval = null;
  }
}

function canDrop() {
  if (!currentPair) return false;
  const positions = getPairPositions(currentPair);
  return positions.every(([r, c]) => {
    const nr = r + 1;
    return nr < rows && grid[nr][c] === -1;
  });
}

function getPairPositions(pair) {
  const { x, y, rotation } = pair;
  const offsets = [[0, 0], [-1, 0], [0, 0], [1, 0]]; // dy, dx for second puyo based on rotation
  const dx2 = [0, 1, 0, -1][rotation];
  const dy2 = [-1, 0, 1, 0][rotation];
  return [[y, x], [y + dy2, x + dx2]];
}

function lockPair() {
  if (!currentPair) return;
  const positions = getPairPositions(currentPair);
  const colors = [currentPair.color1, currentPair.color2];

  positions.forEach(([r, c], i) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = colors[i];
    }
  });

  currentPair = null;

  // Apply gravity, check chains
  applyGravity();
  const chainCount = resolveChains();

  // Drop pending garbage after chains resolve
  if (pendingGarbage > 0 && chainCount === 0) {
    dropGarbage();
  }

  // Speed up
  dropSpeed = Math.max(minSpeed, dropSpeed * speedDecay);
  clearDropLoop();
  startDropLoop();

  spawnPair();
}

function applyGravity() {
  for (let c = 0; c < cols; c++) {
    let writeRow = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][c] !== -1) {
        if (writeRow !== r) {
          grid[writeRow][c] = grid[r][c];
          grid[r][c] = -1;
        }
        writeRow--;
      }
    }
  }
}

function resolveChains() {
  let totalChains = 0;
  let chainPower = 0;

  while (true) {
    const groups = findConnectedGroups();
    if (groups.length === 0) break;

    totalChains++;
    let clearedCount = 0;
    const clears = [];

    groups.forEach(group => {
      clearedCount += group.length;
      group.forEach(([r, c]) => {
        // Collect cleared Color_Puyo positions before clearing (colorIdx >= 0 only)
        const colorIdx = grid[r][c];
        if (colorIdx >= 0) {
          clears.push({ col: c, row: r, colorIdx });
        }
        // Clear adjacent garbage (color -2)
        [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr, nc]) => {
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -2) {
            grid[nr][nc] = -1;
          }
        });
        grid[r][c] = -1;
      });
    });

    // Broadcast chain animation event for spectators
    if (clears.length > 0) {
      sendAction('chain_animation', {
        clientId: myClientId,
        chainNum: totalChains,
        clears
      });

      // Local chain animations for active player (own board)
      playLocalChainAnimation(clears, totalChains);
    }

    // Score calculation (simplified puyo scoring)
    chainPower = totalChains === 1 ? 0 : [8, 16, 32, 64, 96, 128, 160, 192, 224, 256][Math.min(totalChains - 2, 9)];
    const groupBonus = groups.reduce((sum, g) => sum + (g.length > 4 ? (g.length - 3) * 2 : 0), 0);
    const multiplier = Math.max(1, chainPower + groupBonus);
    const points = clearedCount * 10 * multiplier;
    score += points;

    // Send garbage to opponent
    const garbageAmount = Math.floor(points / 70);
    if (garbageAmount > 0) {
      if (pendingGarbage > 0) {
        // Offset
        pendingGarbage = Math.max(0, pendingGarbage - garbageAmount);
      } else {
        sendGarbage(garbageAmount);
      }
    }

    applyGravity();
  }

  p1Score.textContent = score;
  renderMyBoard();
  return totalChains;
}

// ============================================================
// Local Chain Animation for Active Players
// ============================================================

function playLocalChainAnimation(clears, chainNum) {
  if (!myCanvas || !myCanvas.width) return;

  const canvasRect = myCanvas.getBoundingClientRect();
  const cellW = myCanvas.width / cols;
  const cellH = myCanvas.height / rows;

  // Enforce DOM element cap
  enforceEscapeCap();

  clears.forEach(({ col, row, colorIdx }) => {
    if (colorIdx < 0) return;

    const startX = canvasRect.left + col * cellW + cellW / 2 - 14;
    const startY = canvasRect.top + row * cellH + cellH / 2 - 14;
    const imgSrc = PUYO_IMGS_SRC[colorIdx];
    const groundY = canvasRect.bottom + 10;

    if (typeof spawnPuyoEscape === 'function') {
      spawnPuyoEscape(startX, startY, imgSrc, colorIdx, {
        size: Math.min(28, cellW),
        groundY
      });
    }
  });

  // Particles for active player
  clears.forEach(({ col, row, colorIdx }) => {
    if (colorIdx < 0 && colorIdx !== -2) return;
    const px = canvasRect.left + col * cellW + cellW / 2;
    const py = canvasRect.top + row * cellH + cellH / 2;
    const pColor = colorIdx >= 0 ? (PUYO_COLORS[colorIdx] || '#999') : '#999';
    for (let i = 0; i < 3; i++) {
      spectatorParticles.push({
        x: px, y: py,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: pColor,
        size: 2 + Math.random() * 2,
        life: 0.6
      });
    }
  });

  if (spectatorParticles.length > 0 && !spectatorAnimFrame) {
    startSpectatorParticleLoop();
  }

  // Chain text for active player
  if (chainNum >= 2) {
    showSpectatorChainText(myCanvas, chainNum);
  }
}

// ============================================================
// Spectator Chain Animation System
// ============================================================

const SPECTATOR_ESCAPE_CAP = 60;

function handleChainAnimation(payload) {
  // Active players ignore (they have local animations)
  if (myRole === 'seatA' || myRole === 'seatB') return;
  if (!spectatorMode) return;

  // Payload validation
  if (!payload || typeof payload.clientId !== 'string') return;
  if (typeof payload.chainNum !== 'number' || payload.chainNum < 1) return;
  if (!Array.isArray(payload.clears) || payload.clears.length === 0) return;

  // Guard against uninitialized canvases
  if (!myCanvas || !myCanvas.width || !oppCanvas || !oppCanvas.width) return;

  const { clientId, chainNum, clears } = payload;

  // Board targeting: map clientId to correct canvas
  let targetCanvas;
  if (clientId === seatAClientId) {
    targetCanvas = myCanvas;
  } else if (clientId === seatBClientId) {
    targetCanvas = oppCanvas;
  } else {
    return; // Unknown clientId, ignore
  }

  const canvasRect = targetCanvas.getBoundingClientRect();
  const cellW = targetCanvas.width / cols;
  const cellH = targetCanvas.height / rows;

  // Enforce DOM element cap before spawning
  enforceEscapeCap();

  // Spawn escape animations for cleared color puyos
  clears.forEach(({ col, row, colorIdx }) => {
    // Validate individual clear
    if (typeof col !== 'number' || typeof row !== 'number') return;
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    if (typeof colorIdx !== 'number') return;

    // Particles for all puyos (including garbage)
    if (colorIdx >= 0 || colorIdx === -2) {
      const px = canvasRect.left + col * cellW + cellW / 2;
      const py = canvasRect.top + row * cellH + cellH / 2;
      const pColor = colorIdx >= 0 ? (PUYO_COLORS[colorIdx] || '#999') : '#999';
      for (let i = 0; i < 3; i++) {
        spectatorParticles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: pColor,
          size: 2 + Math.random() * 2,
          life: 0.6
        });
      }
    }

    // Escape animation only for color puyos
    if (colorIdx < 0) return;

    const startX = canvasRect.left + col * cellW + cellW / 2 - 14;
    const startY = canvasRect.top + row * cellH + cellH / 2 - 14;
    const imgSrc = PUYO_IMGS_SRC[colorIdx];
    const groundY = canvasRect.bottom + 10;

    if (typeof spawnPuyoEscape === 'function') {
      spawnPuyoEscape(startX, startY, imgSrc, colorIdx, {
        size: Math.min(28, cellW),
        groundY
      });
    }
  });

  // Show chain text for chainNum >= 2
  if (chainNum >= 2) {
    showSpectatorChainText(targetCanvas, chainNum);
  }

  // Start particle render loop if not running
  if (spectatorParticles.length > 0 && !spectatorAnimFrame) {
    startSpectatorParticleLoop();
  }
}

function showSpectatorChainText(targetCanvas, chainNum) {
  const side = (targetCanvas === myCanvas) ? 'left' : 'right';
  const existingId = 'spec-chain-text-' + side;
  let el = document.getElementById(existingId);

  if (!el) {
    el = document.createElement('div');
    el.id = existingId;
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:35;'
      + 'font-size:24px;font-weight:bold;color:#fff;text-shadow:2px 2px 4px #000;'
      + 'transition:opacity 0.3s;';
    document.body.appendChild(el);
  }

  const rect = targetCanvas.getBoundingClientRect();
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = (rect.top - 30) + 'px';
  el.style.transform = 'translateX(-50%)';
  el.textContent = `${chainNum}連鎖!`;
  el.style.opacity = '1';

  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.style.opacity = '0';
  }, 1500);
}

function getOrCreateParticleOverlay() {
  if (spectatorParticleCanvas) return spectatorParticleCanvas;

  const container = battleArea || document.body;
  const canvas = document.createElement('canvas');
  canvas.id = 'spectator-particle-overlay';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:30;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);
  spectatorParticleCanvas = canvas;
  return canvas;
}

function startSpectatorParticleLoop() {
  if (spectatorAnimFrame) return;

  const overlay = getOrCreateParticleOverlay();
  const ctx = overlay.getContext('2d');

  function loop() {
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    spectatorParticles = spectatorParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 0.025;
      if (p.life <= 0) return false;

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    ctx.globalAlpha = 1;

    if (spectatorParticles.length > 0) {
      spectatorAnimFrame = requestAnimationFrame(loop);
    } else {
      spectatorAnimFrame = null;
    }
  }

  spectatorAnimFrame = requestAnimationFrame(loop);
}

function enforceEscapeCap() {
  // Query all fixed-position escape-style elements (created by spawnPuyoEscape)
  const escapeEls = document.querySelectorAll('div[style*="position:fixed"][style*="border-radius:50%"][style*="z-index:30"]');
  if (escapeEls.length >= SPECTATOR_ESCAPE_CAP) {
    // Remove oldest elements (first in DOM order)
    const toRemove = escapeEls.length - SPECTATOR_ESCAPE_CAP + 10; // Remove 10 extra for headroom
    for (let i = 0; i < toRemove && i < escapeEls.length; i++) {
      escapeEls[i].remove();
    }
  }
}

function findConnectedGroups() {
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const groups = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] >= 0 && !visited[r][c]) {
        const color = grid[r][c];
        const group = [];
        const stack = [[r, c]];
        while (stack.length > 0) {
          const [cr, cc] = stack.pop();
          if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
          if (visited[cr][cc] || grid[cr][cc] !== color) continue;
          visited[cr][cc] = true;
          group.push([cr, cc]);
          stack.push([cr-1, cc], [cr+1, cc], [cr, cc-1], [cr, cc+1]);
        }
        if (group.length >= 4) {
          groups.push(group);
        }
      }
    }
  }
  return groups;
}

function dropGarbage() {
  const amount = Math.min(pendingGarbage, cols * 5); // Max 5 rows at once
  pendingGarbage -= amount;
  const fullRows = Math.floor(amount / cols);
  const remainder = amount % cols;

  for (let i = 0; i < fullRows; i++) {
    // Shift grid down
    grid.pop();
    const newRow = Array(cols).fill(-2); // -2 = garbage
    const hole = Math.floor(Math.random() * cols);
    newRow[hole] = -1;
    grid.unshift(newRow);
  }

  if (remainder > 0) {
    grid.pop();
    const newRow = Array(cols).fill(-1);
    const positions = [];
    for (let c = 0; c < cols; c++) positions.push(c);
    // Shuffle and pick 'remainder' positions for garbage
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    const hole = positions[0]; // Keep one hole
    for (let i = 1; i <= remainder; i++) {
      if (positions[i] !== hole) newRow[positions[i]] = -2;
    }
    grid.unshift(newRow);
  }

  renderMyBoard();
}

function sendGarbage(amount) {
  const snapshot = roomManager ? roomManager.getSnapshot() : null;
  let targetId = null;
  if (snapshot) {
    if (myRole === 'seatA' && snapshot.seatB) targetId = snapshot.seatB.clientId;
    else if (myRole === 'seatB' && snapshot.seatA) targetId = snapshot.seatA.clientId;
  }
  if (targetId) {
    sendAction('garbage', { clientId: myClientId, targetClientId: targetId, amount });
  }
}

function gameOver() {
  gameRunning = false;
  clearDropLoop();
  clearStateBroadcast();

  // Notify gameover
  sendAction('gameover', { loserClientId: myClientId });

  // Show result
  resultOverlay.style.display = 'flex';
  resultTitle.textContent = '😢 まけ...';
  resultMsg.textContent = `スコア: ${score}`;

  // If owner, handle gameover logic
  if (isOwner) {
    handleGameover({ loserClientId: myClientId });
  }
}

function showWin() {
  gameRunning = false;
  clearDropLoop();
  clearStateBroadcast();

  resultOverlay.style.display = 'flex';
  resultTitle.textContent = '🎉 かち！';
  resultMsg.textContent = `スコア: ${score}`;
}

// ============================================================
// Rendering
// ============================================================
function drawPuyoCell(ctx, x, y, cellW, cellH, colorIdx, ghost) {
  const cx = x + cellW / 2;
  const cy = y + cellH / 2;
  const r = cellW * 0.45;
  ctx.globalAlpha = ghost ? 0.3 : 1;
  ctx.save();
  ctx.translate(cx, cy);

  if (colorIdx === -2) {
    // Garbage puyo — use puyo_10 image
    const gImg = loadedImgs[9];
    if (imgsReady && gImg && gImg.complete && gImg.naturalWidth > 0) {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
      const s = r * 2.2;
      ctx.drawImage(gImg, -s/2, -s/2, s, s);
    } else {
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    const img = loadedImgs[colorIdx];
    if (imgsReady && img && img.complete && img.naturalWidth > 0) {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
      const s = r * 2.2;
      ctx.drawImage(img, -s/2, -s/2, s, s);
    } else {
      ctx.fillStyle = PUYO_COLORS[colorIdx] || '#888';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function renderMyBoard() {
  const ctx = myCanvas.getContext('2d');
  const cellW = myCanvas.width / cols;
  const cellH = myCanvas.height / rows;

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  // Draw grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] >= 0) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, grid[r][c], false);
      } else if (grid[r][c] === -2) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, -2, false);
      }
    }
  }

  // Draw current pair
  if (currentPair) {
    const positions = getPairPositions(currentPair);
    const colors = [currentPair.color1, currentPair.color2];
    positions.forEach(([r, c], i) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, colors[i], false);
      }
    });
  }
}

function renderOppBoard() {
  const ctx = oppCanvas.getContext('2d');
  const cellW = oppCanvas.width / cols;
  const cellH = oppCanvas.height / rows;

  ctx.clearRect(0, 0, oppCanvas.width, oppCanvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (oppGrid[r] && oppGrid[r][c] >= 0) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, oppGrid[r][c], false);
      } else if (oppGrid[r] && oppGrid[r][c] === -2) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, -2, false);
      }
    }
  }

  // Draw opponent's current pair
  if (oppPair) {
    const positions = getPairPositions(oppPair);
    const colors = [oppPair.color1, oppPair.color2];
    positions.forEach(([r, c], i) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        drawPuyoCell(ctx, c * cellW, r * cellH, cellW, cellH, colors[i], false);
      }
    });
  }
}

function renderGarbageBar() {
  const bar = $('myGarbage');
  bar.innerHTML = '';
  let remaining = pendingGarbage;
  // Rock = 30, big = 6, small = 1
  while (remaining >= 30) { bar.innerHTML += '<span class="g-icon">🪨</span>'; remaining -= 30; }
  while (remaining >= 6) { bar.innerHTML += '<span class="g-icon">🔴</span>'; remaining -= 6; }
  while (remaining >= 1) { bar.innerHTML += '<span class="g-icon">⚪</span>'; remaining -= 1; }
}


// ============================================================
// Controls
// ============================================================
function doRotate() {
  if (!gameRunning || !currentPair) return;
  const newRotation = (currentPair.rotation + 1) % 4;
  const testPair = { ...currentPair, rotation: newRotation };
  const positions = getPairPositions(testPair);
  if (positions.every(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === -1)) {
    currentPair.rotation = newRotation;
    renderMyBoard();
  }
}

function doLeft() {
  if (!gameRunning || !currentPair) return;
  const testPair = { ...currentPair, x: currentPair.x - 1 };
  const positions = getPairPositions(testPair);
  if (positions.every(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === -1)) {
    currentPair.x--;
    renderMyBoard();
  }
}

function doRight() {
  if (!gameRunning || !currentPair) return;
  const testPair = { ...currentPair, x: currentPair.x + 1 };
  const positions = getPairPositions(testPair);
  if (positions.every(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === -1)) {
    currentPair.x++;
    renderMyBoard();
  }
}

function doDrop() {
  if (!gameRunning || !currentPair) return;
  while (canDrop()) {
    currentPair.y++;
  }
  lockPair();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  switch (e.key) {
    case 'ArrowLeft': doLeft(); break;
    case 'ArrowRight': doRight(); break;
    case 'ArrowUp': doRotate(); break;
    case 'ArrowDown': doDrop(); break;
  }
});

// ============================================================
// State broadcast (send my board state to others)
// ============================================================
let stateBroadcastId = null;

function startStateBroadcast() {
  clearStateBroadcast();
  stateBroadcastId = setInterval(() => {
    if (!gameRunning) return;
    sendAction('state', {
      clientId: myClientId,
      grid,
      score,
      pair: currentPair,
    });
  }, 200);
}

function clearStateBroadcast() {
  if (stateBroadcastId) {
    clearInterval(stateBroadcastId);
    stateBroadcastId = null;
  }
}

// ============================================================
// Task 8.6: Heartbeat wiring
// ============================================================
function startOwnerHeartbeat() {
  stopOwnerHeartbeat();
  // Broadcast heartbeat every 5s
  heartbeatTimerId = setInterval(() => {
    broadcastHeartbeat();
    // Also update DB updated_at
    updateDBTimestamp();
  }, 5000);
}

function stopOwnerHeartbeat() {
  if (heartbeatTimerId) {
    clearInterval(heartbeatTimerId);
    heartbeatTimerId = null;
  }
}

function startMissDetection() {
  ownershipMgr.startMissDetection(
    () => {
      // Claim ownership
      const claim = ownershipMgr.createClaim();
      channel.send({ type: 'broadcast', event: 'ownership_claim', payload: claim });
    },
    () => getAllParticipantsList()
  );
}

function stopMissDetection() {
  ownershipMgr.stopMissDetection();
}

// ============================================================
// Task 8.4: Reconnection wiring
// ============================================================
window.addEventListener('beforeunload', () => {
  if (channel && roomCode) {
    sendAction('player_leave', { clientId: myClientId });
  }
});

// On page load — check for reconnection
(function checkReconnection() {
  const lastRoom = sessionStorage.getItem('puyo_last_room');
  if (lastRoom && myClientId) {
    // Attempt reconnect on next page load
    // For now, just store room code on join
  }
})();

// ============================================================
// Task 8.7: Simultaneous join handling
// (Owner assigns joinOrder sequentially — handled by addParticipant's joinCounter)
// ============================================================

// ============================================================
// Task 10.1: Update cleanupStaleRooms to use updated_at
// ============================================================
async function cleanupStaleRooms() {
  const now = new Date();
  const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
  const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();

  try {
    // Delete waiting rooms older than 5 min (nobody joined)
    await supabase
      .from('puyo_battles')
      .delete()
      .eq('status', 'waiting')
      .lt('updated_at', fiveMinAgo);

    // Delete finished rooms older than 5 min
    await supabase
      .from('puyo_battles')
      .delete()
      .eq('status', 'finished')
      .lt('updated_at', fiveMinAgo);

    // Delete playing/lobby/rotating rooms older than 30 min (likely orphaned)
    await supabase
      .from('puyo_battles')
      .delete()
      .in('status', ['playing', 'lobby', 'rotating'])
      .lt('updated_at', thirtyMinAgo);
  } catch (e) {
    console.warn('cleanupStaleRooms error:', e);
  }
}

// Run cleanup on page load
cleanupStaleRooms();

// ============================================================
// Task 11.1: Edge cases
// ============================================================
function resolveNameCollision(name) {
  const snapshot = roomManager.getSnapshot();
  const allNames = [];
  if (snapshot.seatA) allNames.push(snapshot.seatA.name);
  if (snapshot.seatB) allNames.push(snapshot.seatB.name);
  snapshot.spectators.forEach(s => allNames.push(s.name));
  snapshot.queue.forEach(q => allNames.push(q.name));

  if (!allNames.includes(name)) return name;

  let suffix = 2;
  while (allNames.includes(`${name}(${suffix})`)) suffix++;
  return `${name}(${suffix})`;
}

function restoreParticipantRole(clientId, name, restored) {
  // Re-add participant and restore their role
  try {
    roomManager.addParticipant(clientId, name);
  } catch (e) { /* already exists */ }

  if (restored.role === 'seatA') {
    try { roomManager.assignSeat(clientId, 'seatA'); } catch (e) {}
  } else if (restored.role === 'seatB') {
    try { roomManager.assignSeat(clientId, 'seatB'); } catch (e) {}
  } else if (restored.role === 'queue') {
    try { roomManager.enqueue(clientId); } catch (e) {}
  }
  // spectator is default — no action needed
}

// ============================================================
// DB helpers
// ============================================================
async function updateDBStatus(status) {
  if (!roomId) return;
  try {
    await supabase.from('puyo_battles').update({ status }).eq('id', roomId);
  } catch (e) { /* ignore */ }
}

async function updateDBTimestamp() {
  if (!roomId || !isOwner) return;
  try {
    // The trigger auto-updates updated_at on any UPDATE
    await supabase.from('puyo_battles').update({ status: roomManager.getState().toLowerCase() === 'lobby' ? 'lobby' : 'playing' }).eq('id', roomId);
  } catch (e) { /* ignore */ }
}

async function closeRoom() {
  // Notify all participants that room is dissolved
  if (channel) {
    try {
      channel.send({ type: 'broadcast', event: 'room_dissolved', payload: { reason: 'オーナーが退出しました' } });
    } catch (e) { /* ignore */ }
  }
  // Delete the DB row (not just mark finished)
  if (roomId) {
    try {
      await supabase.from('puyo_battles').delete().eq('id', roomId);
    } catch (e) { /* ignore */ }
  }
  if (channel) {
    channel.unsubscribe();
    channel = null;
  }
  stopOwnerHeartbeat();
  stopMissDetection();
  roomId = null;
  roomCode = null;
}

// ============================================================
// Lobby state helpers
// ============================================================
function showLobbyState() {
  resultOverlay.style.display = 'none';
  battleArea.style.display = 'none';
  lobbyEl.style.display = 'block';
  lobbyMain.style.display = 'none';
  lobbyWaiting.style.display = 'block';
  waitingMsg.textContent = 'ロビーに戻りました';
}

function backToLobby() {
  // Send leave or cancel
  sendAction('rematch_cancel', { clientId: myClientId });
  resultOverlay.style.display = 'none';
  gameRunning = false;
  clearDropLoop();
  clearStateBroadcast();

  if (isOwner) {
    handleRematchCancel({ clientId: myClientId });
  }
}

function cancelRoom() {
  // Notify participants that room is dissolved
  if (channel) {
    try {
      channel.send({ type: 'broadcast', event: 'room_dissolved', payload: { reason: 'ルームがキャンセルされました' } });
    } catch (e) { /* ignore */ }
    channel.unsubscribe();
    channel = null;
  }
  if (roomId) {
    supabase.from('puyo_battles').delete().eq('id', roomId).then(() => {});
  }
  stopOwnerHeartbeat();
  roomId = null;
  roomCode = null;
  backToMain();
}

// ============================================================
// Utility: get all participants as flat array
// ============================================================
function getAllParticipantsList() {
  if (!roomManager) return [];
  const snapshot = roomManager.getSnapshot();
  const list = [];
  if (snapshot.seatA) list.push(snapshot.seatA);
  if (snapshot.seatB) list.push(snapshot.seatB);
  (snapshot.spectators || []).forEach(s => list.push(s));
  (snapshot.queue || []).forEach(q => list.push(q));
  return list;
}

// ============================================================
// Store room code in session for reconnection
// ============================================================
function storeRoomForReconnect() {
  if (roomCode) {
    sessionStorage.setItem('puyo_last_room', roomCode);
  }
}
