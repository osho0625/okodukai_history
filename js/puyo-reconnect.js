/**
 * ReconnectionManager — Disconnect detection, role preservation,
 * reconnection validation, and timeout handling for puyo-battle multiplayer rooms.
 * No DOM or Supabase dependencies. Testable in isolation.
 *
 * @module puyo-reconnect
 */

/**
 * Factory function to create a ReconnectionManager instance.
 * @param {object} [config]
 * @param {number} [config.gracePeriod=30000] - Grace period in ms before timeout
 * @param {function} [config.now] - Optional clock function for testability (defaults to Date.now)
 * @returns {object} ReconnectionManager instance
 */
export function createReconnectionManager(config = {}) {
  const gracePeriod = config.gracePeriod ?? 30000;
  const now = config.now || (() => Date.now());

  // Map of clientId → { role, seatData, queuePosition, deadline, inputFrozen }
  const disconnected = new Map();

  // --- Task 3.1: Disconnect detection and role preservation ---

  /**
   * Handle a player disconnect. Stores their role info and sets a deadline.
   * For active players (seatA/seatB), sets inputFrozen=true.
   * @param {string} clientId - The disconnected player's ID
   * @param {string} role - 'seatA' | 'seatB' | 'spectator' | 'queue'
   * @param {object|null} seatData - Seat-specific data (e.g., game state) or null
   * @param {number|null} queuePosition - Queue position index if role is 'queue', else null
   */
  function onDisconnect(clientId, role, seatData, queuePosition) {
    const isActivePlayer = role === 'seatA' || role === 'seatB';
    const deadline = now() + gracePeriod;

    disconnected.set(clientId, {
      role,
      seatData: seatData || null,
      queuePosition: queuePosition ?? null,
      deadline,
      inputFrozen: isActivePlayer,
    });
  }

  /**
   * Get stored disconnection info for a client.
   * @param {string} clientId
   * @returns {object|null} Disconnection info or null if not disconnected
   */
  function getDisconnected(clientId) {
    return disconnected.get(clientId) || null;
  }

  /**
   * Check if a client is currently in the disconnected map.
   * @param {string} clientId
   * @returns {boolean}
   */
  function isDisconnected(clientId) {
    return disconnected.has(clientId);
  }

  /**
   * Check if input is frozen for a given client (active player who disconnected).
   * @param {string} clientId
   * @returns {boolean}
   */
  function getInputFrozen(clientId) {
    const info = disconnected.get(clientId);
    if (!info) return false;
    return info.inputFrozen;
  }

  // --- Task 3.2: Reconnection with identity validation and role restoration ---

  /**
   * Handle a player reconnection. Validates clientId exists in disconnected map,
   * returns stored role/position info, clears from disconnected map, clears input freeze.
   * @param {string} clientId - The reconnecting player's ID
   * @returns {{ role: string, seatData: object|null, queuePosition: number|null }|null}
   *   Returns restoration info or null if clientId not found in disconnected map
   */
  function onReconnect(clientId) {
    const info = disconnected.get(clientId);
    if (!info) return null;

    const result = {
      role: info.role,
      seatData: info.seatData,
      queuePosition: info.queuePosition,
    };

    // Clear from disconnected map (reconnection successful)
    disconnected.delete(clientId);

    return result;
  }

  // --- Task 3.3: Timeout handling ---

  /**
   * Check all disconnected players against their deadlines.
   * Returns an array of timeout actions for players whose deadline has passed.
   * Active players (seatA/seatB) → action: 'forfeit'
   * Spectators/Queue → action: 'remove'
   * Does NOT remove from the map — caller should use clearDisconnected() after handling.
   * @returns {Array<{ clientId: string, role: string, action: 'forfeit'|'remove' }>}
   */
  function checkTimeouts() {
    const currentTime = now();
    const timedOut = [];

    for (const [clientId, info] of disconnected) {
      if (currentTime >= info.deadline) {
        const isActivePlayer = info.role === 'seatA' || info.role === 'seatB';
        timedOut.push({
          clientId,
          role: info.role,
          action: isActivePlayer ? 'forfeit' : 'remove',
        });
      }
    }

    return timedOut;
  }

  /**
   * Remove a client from the disconnected map after timeout is handled.
   * @param {string} clientId
   */
  function clearDisconnected(clientId) {
    disconnected.delete(clientId);
  }

  /**
   * Get the number of currently disconnected players.
   * @returns {number}
   */
  function getDisconnectedCount() {
    return disconnected.size;
  }

  /**
   * Check if there are any pending reconnection timers.
   * @returns {boolean}
   */
  function hasPendingReconnections() {
    return disconnected.size > 0;
  }

  return {
    // Task 3.1: Disconnect detection
    onDisconnect,
    getDisconnected,
    isDisconnected,
    getInputFrozen,

    // Task 3.2: Reconnection
    onReconnect,

    // Task 3.3: Timeout handling
    checkTimeouts,
    clearDisconnected,

    // Utility
    getDisconnectedCount,
    hasPendingReconnections,
  };
}
