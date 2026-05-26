/**
 * Unit tests for ReconnectionManager — Tasks 3.1-3.3, 3.5
 * Disconnect detection, role preservation, reconnection validation,
 * timeout handling, and ROTATING state behavior.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReconnectionManager } from '../../js/puyo-reconnect.js';

describe('Task 3.1: Disconnect detection and role preservation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('onDisconnect stores disconnected player info with deadline', () => {
    vi.setSystemTime(1000);
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => Date.now() });

    mgr.onDisconnect('player-1', 'seatA', { grid: [[]] }, null);

    const info = mgr.getDisconnected('player-1');
    expect(info).not.toBeNull();
    expect(info.role).toBe('seatA');
    expect(info.seatData).toEqual({ grid: [[]] });
    expect(info.queuePosition).toBeNull();
    expect(info.deadline).toBe(31000); // 1000 + 30000
    expect(info.inputFrozen).toBe(true);
  });

  it('onDisconnect sets inputFrozen=true for seatA', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'seatA', null, null);
    expect(mgr.getInputFrozen('player-1')).toBe(true);
  });

  it('onDisconnect sets inputFrozen=true for seatB', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'seatB', null, null);
    expect(mgr.getInputFrozen('player-1')).toBe(true);
  });

  it('onDisconnect sets inputFrozen=false for spectator', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'spectator', null, null);
    expect(mgr.getInputFrozen('player-1')).toBe(false);
  });

  it('onDisconnect sets inputFrozen=false for queue player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'queue', null, 2);
    expect(mgr.getInputFrozen('player-1')).toBe(false);
  });

  it('onDisconnect stores queue position for queue players', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'queue', null, 3);
    const info = mgr.getDisconnected('player-1');
    expect(info.queuePosition).toBe(3);
  });

  it('isDisconnected returns true for disconnected player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'spectator', null, null);
    expect(mgr.isDisconnected('player-1')).toBe(true);
  });

  it('isDisconnected returns false for unknown player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    expect(mgr.isDisconnected('unknown')).toBe(false);
  });

  it('getDisconnected returns null for unknown player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    expect(mgr.getDisconnected('unknown')).toBeNull();
  });

  it('getInputFrozen returns false for non-disconnected player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    expect(mgr.getInputFrozen('unknown')).toBe(false);
  });
});

describe('Task 3.2: Reconnection with identity validation and role restoration', () => {
  it('onReconnect returns stored role/position info for valid clientId', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'seatA', { grid: [[1, 2]] }, null);

    const result = mgr.onReconnect('player-1');
    expect(result).toEqual({
      role: 'seatA',
      seatData: { grid: [[1, 2]] },
      queuePosition: null,
    });
  });

  it('onReconnect clears player from disconnected map', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'seatB', null, null);

    mgr.onReconnect('player-1');
    expect(mgr.isDisconnected('player-1')).toBe(false);
    expect(mgr.getDisconnected('player-1')).toBeNull();
  });

  it('onReconnect clears input freeze', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'seatA', null, null);
    expect(mgr.getInputFrozen('player-1')).toBe(true);

    mgr.onReconnect('player-1');
    expect(mgr.getInputFrozen('player-1')).toBe(false);
  });

  it('onReconnect returns null for unknown clientId', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    const result = mgr.onReconnect('unknown');
    expect(result).toBeNull();
  });

  it('onReconnect restores queue position for queue player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'queue', null, 5);

    const result = mgr.onReconnect('player-1');
    expect(result).toEqual({
      role: 'queue',
      seatData: null,
      queuePosition: 5,
    });
  });

  it('onReconnect restores spectator role', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    mgr.onDisconnect('player-1', 'spectator', null, null);

    const result = mgr.onReconnect('player-1');
    expect(result).toEqual({
      role: 'spectator',
      seatData: null,
      queuePosition: null,
    });
  });
});

describe('Task 3.3: Timeout handling (forfeit for active, removal for others)', () => {
  it('checkTimeouts returns empty array when no timeouts', () => {
    let currentTime = 1000;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatA', null, null);

    // Still within grace period
    currentTime = 15000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([]);
  });

  it('checkTimeouts returns forfeit action for active player after deadline', () => {
    let currentTime = 1000;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatA', null, null);

    // Past deadline
    currentTime = 31001;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'player-1', role: 'seatA', action: 'forfeit' },
    ]);
  });

  it('checkTimeouts returns forfeit for seatB player after deadline', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatB', null, null);

    currentTime = 30000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'player-1', role: 'seatB', action: 'forfeit' },
    ]);
  });

  it('checkTimeouts returns remove action for spectator after deadline', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'spectator', null, null);

    currentTime = 30000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'player-1', role: 'spectator', action: 'remove' },
    ]);
  });

  it('checkTimeouts returns remove action for queue player after deadline', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'queue', null, 2);

    currentTime = 30000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'player-1', role: 'queue', action: 'remove' },
    ]);
  });

  it('checkTimeouts handles multiple disconnected players', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatA', null, null);

    currentTime = 5000;
    mgr.onDisconnect('player-2', 'spectator', null, null);

    // Only player-1 has timed out
    currentTime = 30000;
    const result1 = mgr.checkTimeouts();
    expect(result1).toEqual([
      { clientId: 'player-1', role: 'seatA', action: 'forfeit' },
    ]);

    // Both have timed out
    currentTime = 35000;
    const result2 = mgr.checkTimeouts();
    expect(result2).toHaveLength(2);
    expect(result2).toContainEqual({ clientId: 'player-1', role: 'seatA', action: 'forfeit' });
    expect(result2).toContainEqual({ clientId: 'player-2', role: 'spectator', action: 'remove' });
  });

  it('clearDisconnected removes player from map after timeout handled', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatA', null, null);

    currentTime = 31000;
    mgr.clearDisconnected('player-1');
    expect(mgr.isDisconnected('player-1')).toBe(false);
    expect(mgr.getDisconnectedCount()).toBe(0);
  });

  it('checkTimeouts does not remove from map (caller responsibility)', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });
    mgr.onDisconnect('player-1', 'seatA', null, null);

    currentTime = 31000;
    mgr.checkTimeouts();
    // Still in map until clearDisconnected is called
    expect(mgr.isDisconnected('player-1')).toBe(true);
  });
});

describe('Task 3.5: Reconnection during ROTATING state', () => {
  it('queue player disconnect during ROTATING returns remove action on timeout', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });

    // Queue player disconnects during ROTATING
    mgr.onDisconnect('queue-player', 'queue', null, 0);

    // After timeout
    currentTime = 30000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'queue-player', role: 'queue', action: 'remove' },
    ]);
  });

  it('active player disconnect during ROTATING returns forfeit action on timeout', () => {
    let currentTime = 0;
    const mgr = createReconnectionManager({ gracePeriod: 30000, now: () => currentTime });

    // Active player (winner in seatA) disconnects during ROTATING
    mgr.onDisconnect('winner', 'seatA', { grid: [[1]] }, null);

    // After timeout
    currentTime = 30000;
    const result = mgr.checkTimeouts();
    expect(result).toEqual([
      { clientId: 'winner', role: 'seatA', action: 'forfeit' },
    ]);
  });

  it('reconnect during ROTATING restores correct role for queue player', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });

    // Queue player at position 2 disconnects during ROTATING
    mgr.onDisconnect('queue-player', 'queue', null, 2);

    // Reconnects within grace period
    const result = mgr.onReconnect('queue-player');
    expect(result).toEqual({
      role: 'queue',
      seatData: null,
      queuePosition: 2,
    });
  });

  it('reconnect during ROTATING restores correct role for active player (seatA)', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });

    // Winner in seatA disconnects during ROTATING
    mgr.onDisconnect('winner', 'seatA', { grid: [[1, 2, 3]] }, null);

    // Reconnects within grace period
    const result = mgr.onReconnect('winner');
    expect(result).toEqual({
      role: 'seatA',
      seatData: { grid: [[1, 2, 3]] },
      queuePosition: null,
    });
  });

  it('reconnect during ROTATING restores spectator role', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });

    mgr.onDisconnect('spectator-1', 'spectator', null, null);

    const result = mgr.onReconnect('spectator-1');
    expect(result).toEqual({
      role: 'spectator',
      seatData: null,
      queuePosition: null,
    });
  });
});

describe('Utility methods', () => {
  it('getDisconnectedCount returns correct count', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    expect(mgr.getDisconnectedCount()).toBe(0);

    mgr.onDisconnect('p1', 'seatA', null, null);
    expect(mgr.getDisconnectedCount()).toBe(1);

    mgr.onDisconnect('p2', 'spectator', null, null);
    expect(mgr.getDisconnectedCount()).toBe(2);

    mgr.onReconnect('p1');
    expect(mgr.getDisconnectedCount()).toBe(1);
  });

  it('hasPendingReconnections returns correct boolean', () => {
    const mgr = createReconnectionManager({ gracePeriod: 30000 });
    expect(mgr.hasPendingReconnections()).toBe(false);

    mgr.onDisconnect('p1', 'seatA', null, null);
    expect(mgr.hasPendingReconnections()).toBe(true);

    mgr.clearDisconnected('p1');
    expect(mgr.hasPendingReconnections()).toBe(false);
  });
});
