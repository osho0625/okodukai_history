/**
 * RoomStateManager — Pure state machine for puyo-battle multiplayer rooms.
 * No DOM or Supabase dependencies. Testable in isolation.
 *
 * @module puyo-room-state
 */

// Valid room states
export const STATES = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT',
  REMATCH_WAIT: 'REMATCH_WAIT',
  ROTATING: 'ROTATING',
};

// Valid state transitions: from → [to, ...]
const VALID_TRANSITIONS = {
  [STATES.LOBBY]: [STATES.PLAYING],
  [STATES.PLAYING]: [STATES.RESULT],
  [STATES.RESULT]: [STATES.REMATCH_WAIT, STATES.ROTATING],
  [STATES.REMATCH_WAIT]: [STATES.PLAYING, STATES.LOBBY],
  [STATES.ROTATING]: [STATES.PLAYING, STATES.REMATCH_WAIT],
};

/**
 * Factory function to create a RoomStateManager instance.
 * @param {object} [config] - Optional configuration overrides
 * @returns {object} RoomStateManager instance
 */
export function createRoomStateManager(config = {}) {
  // Internal room state
  const roomState = {
    state: STATES.LOBBY,
    seatA: null,
    seatB: null,
    spectators: [],
    queue: [],
    rematchVotes: { seatA: false, seatB: false },
    battleId: 0,
    spectatorOnly: config.spectatorOnly || false,
    ownerId: config.ownerId || null,
    stateId: { epoch: 0, version: 0 },
    joinCounter: 0,
    queueCounter: 0,
    winStreaks: {},
    deadlines: {
      rematchTimeout: null,
      reconnectTimeouts: {},
      rotatingEnd: null,
    },
  };

  /**
   * Check if a transition from one state to another is valid.
   * @param {string} from - Current state
   * @param {string} to - Target state
   * @returns {boolean}
   */
  function canTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed) return false;
    return allowed.includes(to);
  }

  /**
   * Perform a state transition. Throws if the transition is invalid.
   * Increments stateId.version on success.
   * @param {string} newState - Target state
   * @returns {string} The new state
   */
  function transition(newState) {
    if (!canTransition(roomState.state, newState)) {
      throw new Error(
        `Invalid transition: ${roomState.state} → ${newState}`
      );
    }
    roomState.state = newState;
    roomState.stateId.version++;
    return roomState.state;
  }

  /**
   * Increment stateId.version for any authoritative mutation
   * (not just state transitions).
   */
  function incrementVersion() {
    roomState.stateId.version++;
  }

  /**
   * Increment epoch (called on ownership change).
   */
  function incrementEpoch() {
    roomState.stateId.epoch++;
    roomState.stateId.version = 0;
  }

  /**
   * Get the current state.
   * @returns {string}
   */
  function getState() {
    return roomState.state;
  }

  /**
   * Get the full room state (read-only snapshot).
   * @returns {object}
   */
  function getSnapshot() {
    return { ...roomState };
  }

  /**
   * Determine what actions a given client can perform based on current state and role.
   * @param {string} clientId - The client to check
   * @returns {object} Available actions
   */
  function getAvailableActions(clientId) {
    const isSeatA = roomState.seatA && roomState.seatA.clientId === clientId;
    const isSeatB = roomState.seatB && roomState.seatB.clientId === clientId;
    const isActivePlayer = isSeatA || isSeatB;
    const isSpectator = roomState.spectators.some(s => s.clientId === clientId);
    const isInQueue = roomState.queue.some(q => q.clientId === clientId);
    const isPlaying = isActivePlayer && roomState.state === STATES.PLAYING;
    const isSpectating = isSpectator || isInQueue;

    // canRematch: active player in REMATCH_WAIT state, hasn't voted yet
    let canRematch = false;
    if (isActivePlayer && roomState.state === STATES.REMATCH_WAIT) {
      if (isSeatA && !roomState.rematchVotes.seatA) canRematch = true;
      if (isSeatB && !roomState.rematchVotes.seatB) canRematch = true;
    }

    // canQueue: spectator can join queue (if not spectatorOnly)
    const canQueue = isSpectator && !roomState.spectatorOnly;

    // canSwitchRole: spectator can join queue, or queue player can become spectator
    const canSwitchRole = (isSpectator && !roomState.spectatorOnly) || isInQueue;

    // canStartBattle: in LOBBY state, both seats filled, client is owner
    const canStartBattle =
      roomState.state === STATES.LOBBY &&
      roomState.seatA !== null &&
      roomState.seatB !== null &&
      roomState.ownerId === clientId;

    return {
      canRematch,
      canQueue,
      canSwitchRole,
      canStartBattle,
      isPlaying,
      isSpectating,
    };
  }

  // --- Task 1.2: Participant tracking and seat management ---

  const MAX_PARTICIPANTS = 6;

  /**
   * Get total participant count (seats + spectators + queue).
   * @returns {number}
   */
  function getParticipantCount() {
    let count = 0;
    if (roomState.seatA) count++;
    if (roomState.seatB) count++;
    count += roomState.spectators.length;
    count += roomState.queue.length;
    return count;
  }

  /**
   * Add a participant to the room as a spectator by default.
   * Assigns joinOrder from joinCounter++.
   * Enforces max 6 participant limit.
   * @param {string} clientId
   * @param {string} name
   * @returns {object} The participant info created
   */
  function addParticipant(clientId, name) {
    if (getParticipantCount() >= MAX_PARTICIPANTS) {
      throw new Error('Room is full (max 6 participants)');
    }
    // Check if already in room
    if (findParticipant(clientId)) {
      throw new Error(`Participant ${clientId} already in room`);
    }
    const joinOrder = roomState.joinCounter++;
    const participant = { clientId, name, joinOrder };
    roomState.spectators.push(participant);
    incrementVersion();
    return participant;
  }

  /**
   * Find a participant anywhere in the room.
   * @param {string} clientId
   * @returns {object|null} { location, participant, index? }
   */
  function findParticipant(clientId) {
    if (roomState.seatA && roomState.seatA.clientId === clientId) {
      return { location: 'seatA', participant: roomState.seatA };
    }
    if (roomState.seatB && roomState.seatB.clientId === clientId) {
      return { location: 'seatB', participant: roomState.seatB };
    }
    const specIdx = roomState.spectators.findIndex(s => s.clientId === clientId);
    if (specIdx !== -1) {
      return { location: 'spectator', participant: roomState.spectators[specIdx], index: specIdx };
    }
    const queueIdx = roomState.queue.findIndex(q => q.clientId === clientId);
    if (queueIdx !== -1) {
      return { location: 'queue', participant: roomState.queue[queueIdx], index: queueIdx };
    }
    return null;
  }

  /**
   * Assign a participant to a seat (seatA or seatB).
   * Moves them from spectators or queue.
   * @param {string} clientId
   * @param {'seatA'|'seatB'} seat
   * @returns {object} The seated participant info
   */
  function assignSeat(clientId, seat) {
    if (seat !== 'seatA' && seat !== 'seatB') {
      throw new Error(`Invalid seat: ${seat}`);
    }
    if (roomState[seat] !== null) {
      throw new Error(`Seat ${seat} is already occupied`);
    }
    const found = findParticipant(clientId);
    if (!found) {
      throw new Error(`Participant ${clientId} not found in room`);
    }
    if (found.location === 'seatA' || found.location === 'seatB') {
      throw new Error(`Participant ${clientId} is already seated`);
    }
    // Remove from current location
    if (found.location === 'spectator') {
      roomState.spectators.splice(found.index, 1);
    } else if (found.location === 'queue') {
      roomState.queue.splice(found.index, 1);
    }
    // Assign to seat
    const seatInfo = { clientId: found.participant.clientId, name: found.participant.name, joinOrder: found.participant.joinOrder };
    roomState[seat] = seatInfo;
    incrementVersion();
    return seatInfo;
  }

  /**
   * Vacate a seat, returning the player info that was removed.
   * @param {'seatA'|'seatB'} seat
   * @returns {object|null} The player info that was in the seat, or null if empty
   */
  function vacateSeat(seat) {
    if (seat !== 'seatA' && seat !== 'seatB') {
      throw new Error(`Invalid seat: ${seat}`);
    }
    const player = roomState[seat];
    if (!player) return null;
    roomState[seat] = null;
    incrementVersion();
    return player;
  }

  // --- Task 1.3: Queue management ---

  /**
   * Move a participant from spectators to queue with queueCounter++ as queueOrder.
   * @param {string} clientId
   * @returns {object} The queue entry created
   */
  function enqueue(clientId) {
    if (roomState.spectatorOnly) {
      throw new Error('Cannot join queue: room is spectator-only');
    }
    const found = findParticipant(clientId);
    if (!found) {
      throw new Error(`Participant ${clientId} not found in room`);
    }
    if (found.location !== 'spectator') {
      throw new Error(`Participant ${clientId} is not a spectator (currently: ${found.location})`);
    }
    // Remove from spectators
    roomState.spectators.splice(found.index, 1);
    // Add to queue with queueOrder
    const queueOrder = roomState.queueCounter++;
    const entry = { clientId: found.participant.clientId, name: found.participant.name, joinOrder: found.participant.joinOrder, queueOrder };
    roomState.queue.push(entry);
    // Keep queue sorted by queueOrder ascending
    roomState.queue.sort((a, b) => a.queueOrder - b.queueOrder);
    incrementVersion();
    return entry;
  }

  /**
   * Remove and return the first player in the queue (lowest queueOrder).
   * @returns {object|null} The dequeued entry, or null if queue is empty
   */
  function dequeue() {
    if (roomState.queue.length === 0) return null;
    const entry = roomState.queue.shift();
    incrementVersion();
    return entry;
  }

  /**
   * Remove a specific player from the queue, preserving order.
   * @param {string} clientId
   * @returns {object|null} The removed entry, or null if not found
   */
  function removeFromQueue(clientId) {
    const idx = roomState.queue.findIndex(q => q.clientId === clientId);
    if (idx === -1) return null;
    const entry = roomState.queue.splice(idx, 1)[0];
    incrementVersion();
    return entry;
  }

  // --- Task 1.4: Role switching ---

  /**
   * Switch a spectator to queue (spectator → queue).
   * @param {string} clientId
   * @returns {object} The queue entry created
   */
  function switchToQueue(clientId) {
    // enqueue already validates spectator status and spectatorOnly
    return enqueue(clientId);
  }

  /**
   * Switch a queue player to spectator (queue → spectator).
   * @param {string} clientId
   * @returns {object} The spectator entry
   */
  function switchToSpectator(clientId) {
    const found = findParticipant(clientId);
    if (!found) {
      throw new Error(`Participant ${clientId} not found in room`);
    }
    if (found.location !== 'queue') {
      throw new Error(`Participant ${clientId} is not in queue (currently: ${found.location})`);
    }
    // Remove from queue
    roomState.queue.splice(found.index, 1);
    // Add to spectators
    const spectatorEntry = { clientId: found.participant.clientId, name: found.participant.name, joinOrder: found.participant.joinOrder };
    roomState.spectators.push(spectatorEntry);
    incrementVersion();
    return spectatorEntry;
  }

  // --- Task 1.5: Winner-stays rotation ---

  /**
   * Perform winner-stays rotation.
   * Winner → seatA, queue[0] → seatB, loser → queue tail.
   * Updates winStreaks.
   * @param {string} winnerClientId
   * @param {string} loserClientId
   * @returns {object} { winner, nextOpponent, loser }
   */
  function rotate(winnerClientId, loserClientId) {
    // Validate winner and loser are in seats
    const winnerInSeatA = roomState.seatA && roomState.seatA.clientId === winnerClientId;
    const winnerInSeatB = roomState.seatB && roomState.seatB.clientId === winnerClientId;
    if (!winnerInSeatA && !winnerInSeatB) {
      throw new Error(`Winner ${winnerClientId} is not in a seat`);
    }
    const loserInSeatA = roomState.seatA && roomState.seatA.clientId === loserClientId;
    const loserInSeatB = roomState.seatB && roomState.seatB.clientId === loserClientId;
    if (!loserInSeatA && !loserInSeatB) {
      throw new Error(`Loser ${loserClientId} is not in a seat`);
    }
    if (roomState.queue.length === 0) {
      throw new Error('Cannot rotate: queue is empty');
    }

    const queueLengthBefore = roomState.queue.length;

    // Get winner and loser info
    const winnerInfo = winnerInSeatA ? roomState.seatA : roomState.seatB;
    const loserInfo = loserInSeatA ? roomState.seatA : roomState.seatB;

    // Dequeue next opponent (don't call incrementVersion via dequeue — we'll do it once at end)
    const nextOpponent = roomState.queue.shift();

    // Place loser at queue tail with new queueOrder
    const queueOrder = roomState.queueCounter++;
    roomState.queue.push({
      clientId: loserInfo.clientId,
      name: loserInfo.name,
      joinOrder: loserInfo.joinOrder,
      queueOrder,
    });

    // Winner → seatA
    roomState.seatA = { clientId: winnerInfo.clientId, name: winnerInfo.name, joinOrder: winnerInfo.joinOrder };
    // Next opponent → seatB
    roomState.seatB = { clientId: nextOpponent.clientId, name: nextOpponent.name, joinOrder: nextOpponent.joinOrder };

    // Update win streaks
    roomState.winStreaks[winnerClientId] = (roomState.winStreaks[winnerClientId] || 0) + 1;
    roomState.winStreaks[loserClientId] = 0;

    // Queue length invariant: should remain unchanged
    if (roomState.queue.length !== queueLengthBefore) {
      throw new Error('Queue length invariant violated after rotation');
    }

    incrementVersion();
    return { winner: roomState.seatA, nextOpponent: roomState.seatB, loser: roomState.queue[roomState.queue.length - 1] };
  }

  // --- Task 1.6: Rematch vote logic ---

  /**
   * Record a rematch vote for the given client.
   * Rejects if battleId doesn't match current roomState.battleId.
   * @param {string} clientId
   * @param {number} battleId
   * @returns {boolean} true if vote was accepted
   */
  function voteRematch(clientId, battleId) {
    if (battleId !== roomState.battleId) {
      return false; // stale vote rejected
    }
    if (roomState.seatA && roomState.seatA.clientId === clientId) {
      roomState.rematchVotes.seatA = true;
      incrementVersion();
      return true;
    }
    if (roomState.seatB && roomState.seatB.clientId === clientId) {
      roomState.rematchVotes.seatB = true;
      incrementVersion();
      return true;
    }
    return false; // not an active player
  }

  /**
   * Check if both players have voted for rematch.
   * @returns {boolean}
   */
  function checkRematchReady() {
    return roomState.rematchVotes.seatA && roomState.rematchVotes.seatB;
  }

  /**
   * Reset state for a new battle: increment battleId, reset rematchVotes, set deadline.
   * @param {number} [deadlineMs] - Optional absolute timestamp for rematch timeout
   * @returns {number} The new battleId
   */
  function resetForNewBattle(deadlineMs = null) {
    roomState.battleId++;
    roomState.rematchVotes = { seatA: false, seatB: false };
    roomState.deadlines.rematchTimeout = deadlineMs;
    incrementVersion();
    return roomState.battleId;
  }

  // --- Task 1.7: SpectatorOnly mode enforcement ---
  // (Enforcement is built into enqueue and switchToQueue — they throw when spectatorOnly=true)
  // The RESULT → REMATCH_WAIT transition is always valid when queue is empty,
  // which is guaranteed when spectatorOnly=true since no one can join the queue.

  // --- Task 1.8: Participant removal and room closure ---

  /**
   * Remove a participant from any list (seat/spectator/queue).
   * Preserves other participants' positions.
   * @param {string} clientId
   * @returns {object|null} The removed participant info, or null if not found
   */
  function removeParticipant(clientId) {
    const found = findParticipant(clientId);
    if (!found) return null;

    if (found.location === 'seatA') {
      roomState.seatA = null;
    } else if (found.location === 'seatB') {
      roomState.seatB = null;
    } else if (found.location === 'spectator') {
      roomState.spectators.splice(found.index, 1);
    } else if (found.location === 'queue') {
      roomState.queue.splice(found.index, 1);
    }
    incrementVersion();
    return found.participant;
  }

  /**
   * Check if the room is empty (no participants remain).
   * @returns {boolean}
   */
  function isEmpty() {
    return getParticipantCount() === 0;
  }

  return {
    // State machine
    canTransition,
    transition,
    getState,
    getSnapshot,
    incrementVersion,
    incrementEpoch,

    // Actions
    getAvailableActions,

    // Task 1.2: Participant & seat management
    addParticipant,
    findParticipant,
    assignSeat,
    vacateSeat,
    getParticipantCount,

    // Task 1.3: Queue management
    enqueue,
    dequeue,
    removeFromQueue,

    // Task 1.4: Role switching
    switchToQueue,
    switchToSpectator,

    // Task 1.5: Winner-stays rotation
    rotate,

    // Task 1.6: Rematch vote logic
    voteRematch,
    checkRematchReady,
    resetForNewBattle,

    // Task 1.8: Participant removal
    removeParticipant,
    isEmpty,

    // Direct access to internal state for testing
    _state: roomState,
  };
}
