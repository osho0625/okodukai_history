/**
 * OwnershipManager — Heartbeat, claim protocol, transfer, and command validation
 * for puyo-battle multiplayer rooms.
 * No DOM or Supabase dependencies. Testable in isolation.
 *
 * @module puyo-ownership
 */

/**
 * Factory function to create an OwnershipManager instance.
 * @param {object} config
 * @param {string} config.myClientId - This client's UUID
 * @param {number} config.myJoinOrder - This client's join order
 * @param {boolean} config.isOwner - Whether this client is the current owner
 * @param {function} [config.onTransfer] - Callback when ownership transfers to this client
 * @param {function} [config.onClaimWin] - Callback when this client wins an ownership claim
 * @returns {object} OwnershipManager instance
 */
export function createOwnershipManager(config) {
  const {
    myClientId,
    myJoinOrder,
    isOwner: initialIsOwner,
    onTransfer,
    onClaimWin,
  } = config;

  // --- Internal state ---
  let isOwner = initialIsOwner;
  let heartbeatSeq = 0;
  let heartbeatIntervalId = null;
  let ownerId = isOwner ? myClientId : null;
  let stateId = { epoch: 0, version: 0 };

  // Miss detection state
  let lastHeartbeatTime = Date.now();
  let missDetectionIntervalId = null;

  // --- Task 2.1: Heartbeat broadcasting ---

  const HEARTBEAT_INTERVAL = 5000;

  /**
   * Get the current heartbeat payload.
   * @returns {{ ownerId: string, stateId: { epoch: number, version: number }, seq: number }}
   */
  function getHeartbeatPayload() {
    return { ownerId, stateId: { ...stateId }, seq: heartbeatSeq };
  }

  /**
   * Start broadcasting heartbeats (owner only).
   * @param {function} sendFn - Function to broadcast the heartbeat payload
   */
  function startHeartbeat(sendFn) {
    if (heartbeatIntervalId !== null) return;
    heartbeatIntervalId = setInterval(() => {
      heartbeatSeq++;
      sendFn(getHeartbeatPayload());
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop broadcasting heartbeats.
   */
  function stopHeartbeat() {
    if (heartbeatIntervalId !== null) {
      clearInterval(heartbeatIntervalId);
      heartbeatIntervalId = null;
    }
  }

  // --- Task 2.2: Heartbeat miss detection ---

  const HEARTBEAT_TIMEOUT = 15000;
  const JITTER_MIN = 4000;
  const JITTER_MAX = 6000;

  /**
   * Update lastHeartbeatTime when a heartbeat is received.
   * @param {{ ownerId: string, stateId: object, seq: number }} payload
   */
  function receiveHeartbeat(payload) {
    lastHeartbeatTime = Date.now();
    if (payload.ownerId) {
      ownerId = payload.ownerId;
    }
    if (payload.stateId) {
      stateId = { ...payload.stateId };
    }
  }

  /**
   * Start miss detection with jittered check interval.
   * When timeout detected AND this participant is oldest, calls claimFn.
   * @param {function} claimFn - Function to call when ownership claim should be initiated
   * @param {function} [getParticipants] - Function returning current participants array
   */
  function startMissDetection(claimFn, getParticipants) {
    if (missDetectionIntervalId !== null) return;

    function scheduleCheck() {
      const jitter = JITTER_MIN + Math.random() * (JITTER_MAX - JITTER_MIN);
      missDetectionIntervalId = setTimeout(() => {
        const elapsed = Date.now() - lastHeartbeatTime;
        if (elapsed > HEARTBEAT_TIMEOUT && !isOwner) {
          const participants = getParticipants ? getParticipants() : [];
          if (amIOldestParticipant(participants)) {
            claimFn();
          }
        }
        scheduleCheck();
      }, jitter);
    }

    scheduleCheck();
  }

  /**
   * Stop miss detection.
   */
  function stopMissDetection() {
    if (missDetectionIntervalId !== null) {
      clearTimeout(missDetectionIntervalId);
      missDetectionIntervalId = null;
    }
  }

  // --- Task 2.3: Ownership claim protocol ---

  /**
   * Check if this client is the oldest participant (lowest joinOrder).
   * @param {Array<{ clientId: string, joinOrder: number }>} participants
   * @returns {boolean}
   */
  function amIOldestParticipant(participants) {
    if (!participants || participants.length === 0) return false;
    const oldest = participants.reduce((min, p) => {
      if (p.joinOrder < min.joinOrder) return p;
      if (p.joinOrder === min.joinOrder) {
        return p.clientId < min.clientId ? p : min;
      }
      return min;
    }, participants[0]);
    return oldest.clientId === myClientId;
  }

  /**
   * Create an ownership claim payload.
   * @returns {{ candidateId: string, joinOrder: number, nextEpoch: number }}
   */
  function createClaim() {
    return {
      candidateId: myClientId,
      joinOrder: myJoinOrder,
      nextEpoch: stateId.epoch + 1,
    };
  }

  /**
   * Receive and evaluate an ownership claim.
   * Determines if the claim wins using deterministic tie-break:
   * lowest joinOrder wins, then lexicographic clientId.
   * @param {{ candidateId: string, joinOrder: number, nextEpoch: number }} claimPayload
   * @param {Array<{ clientId: string, joinOrder: number }>} allParticipants
   * @returns {{ accepted: boolean, winnerId: string }}
   */
  function receiveClaim(claimPayload, allParticipants) {
    const { candidateId, joinOrder } = claimPayload;

    // Find the deterministic winner among all participants (excluding current owner if disconnected)
    // The winner is the participant with lowest joinOrder, tie-break by lexicographic clientId
    let winner = null;
    for (const p of allParticipants) {
      if (winner === null) {
        winner = p;
        continue;
      }
      if (p.joinOrder < winner.joinOrder) {
        winner = p;
      } else if (p.joinOrder === winner.joinOrder && p.clientId < winner.clientId) {
        winner = p;
      }
    }

    const winnerId = winner ? winner.clientId : candidateId;
    const accepted = candidateId === winnerId;

    return { accepted, winnerId };
  }

  // --- Task 2.4: Ownership transfer ---

  /**
   * Perform ownership transfer — new owner takes over.
   * Increments epoch, resets version.
   * @param {object} roomState - The full room state snapshot to inherit
   * @returns {{ newOwnerId: string, epoch: number, roomStateSnapshot: object }}
   */
  function performTransfer(roomState) {
    isOwner = true;
    ownerId = myClientId;
    stateId.epoch++;
    stateId.version = 0;

    if (onTransfer) {
      onTransfer(roomState);
    }

    return {
      newOwnerId: myClientId,
      epoch: stateId.epoch,
      roomStateSnapshot: roomState,
    };
  }

  /**
   * Receive an ownership transfer (non-owner accepting new owner).
   * @param {{ newOwnerId: string, epoch: number, roomStateSnapshot: object }} payload
   */
  function receiveTransfer(payload) {
    ownerId = payload.newOwnerId;
    stateId.epoch = payload.epoch;
    stateId.version = 0;
    isOwner = (payload.newOwnerId === myClientId);

    // Reset heartbeat tracking for new owner
    lastHeartbeatTime = Date.now();
  }

  /**
   * Reconstruct timers from absolute deadline timestamps.
   * Creates setTimeout for each deadline. If deadline has passed, executes immediately.
   * @param {Record<string, number|null>} deadlines - Map of name → absolute timestamp (ms)
   * @param {Record<string, function>} callbacks - Map of name → callback function
   * @returns {Record<string, number>} Map of name → timer ID
   */
  function reconstructTimers(deadlines, callbacks) {
    const timers = {};
    for (const [name, deadline] of Object.entries(deadlines)) {
      if (deadline === null || deadline === undefined) continue;
      if (!callbacks[name]) continue;

      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        // Deadline already passed — execute immediately
        callbacks[name]();
        timers[name] = -1; // sentinel for "executed immediately"
      } else {
        timers[name] = setTimeout(callbacks[name], remaining);
      }
    }
    return timers;
  }

  // --- Task 2.5: Owner command validation ---

  /**
   * Validate an incoming action event.
   * @param {string} event - Event type (e.g., 'rematch_vote', 'role_choice', 'garbage', 'state')
   * @param {object} payload - Event payload
   * @param {string} senderClientId - Actual sender's client ID
   * @param {object} roomState - Current room state snapshot
   * @returns {boolean} Whether the action is valid
   */
  function validateAction(event, payload, senderClientId, roomState) {
    // CRITICAL: verify sender identity matches payload.clientId (spoof rejection)
    if (payload.clientId !== senderClientId) return false;

    // Helper: check if clientId is an active player
    function isActivePlayer(clientId) {
      return (
        (roomState.seatA && roomState.seatA.clientId === clientId) ||
        (roomState.seatB && roomState.seatB.clientId === clientId)
      );
    }

    // Helper: check if clientId is a spectator or queue player
    function isSpectatorOrQueue(clientId) {
      const inSpectators = roomState.spectators && roomState.spectators.some(s => s.clientId === clientId);
      const inQueue = roomState.queue && roomState.queue.some(q => q.clientId === clientId);
      return inSpectators || inQueue;
    }

    switch (event) {
      case 'rematch_vote':
        // Only active players can vote, and battleId must match
        if (!isActivePlayer(payload.clientId)) return false;
        if (payload.battleId !== roomState.battleId) return false;
        break;

      case 'role_choice':
      case 'role_switch':
        // Only spectators/queue players can switch roles
        if (isActivePlayer(payload.clientId)) return false;
        if (!isSpectatorOrQueue(payload.clientId)) return false;
        break;

      case 'garbage':
      case 'state':
        // Only active players can send game state
        if (!isActivePlayer(payload.clientId)) return false;
        break;

      default:
        // Other events pass through (player_join, player_leave, etc.)
        break;
    }

    return true;
  }

  // --- Getters ---

  function getOwnerId() {
    return ownerId;
  }

  function getStateId() {
    return { ...stateId };
  }

  function getIsOwner() {
    return isOwner;
  }

  function setOwnerId(id) {
    ownerId = id;
  }

  function setStateId(newStateId) {
    stateId = { ...newStateId };
  }

  function setIsOwner(value) {
    isOwner = value;
  }

  function getLastHeartbeatTime() {
    return lastHeartbeatTime;
  }

  function getHeartbeatSeq() {
    return heartbeatSeq;
  }

  return {
    // Task 2.1: Heartbeat broadcasting
    startHeartbeat,
    stopHeartbeat,
    getHeartbeatPayload,

    // Task 2.2: Miss detection
    receiveHeartbeat,
    startMissDetection,
    stopMissDetection,

    // Task 2.3: Claim protocol
    createClaim,
    receiveClaim,
    amIOldestParticipant,

    // Task 2.4: Transfer
    performTransfer,
    receiveTransfer,
    reconstructTimers,

    // Task 2.5: Validation
    validateAction,

    // Getters/setters
    getOwnerId,
    getStateId,
    getIsOwner,
    setOwnerId,
    setStateId,
    setIsOwner,
    getLastHeartbeatTime,
    getHeartbeatSeq,
  };
}
