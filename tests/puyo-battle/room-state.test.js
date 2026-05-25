/**
 * Unit tests for RoomStateManager — state machine, stateId, getAvailableActions
 *
 * Validates: Requirements Room State Model, 1.7, 4.4, 4.5
 */
import { describe, it, expect } from 'vitest';
import { createRoomStateManager, STATES } from '../../js/puyo-room-state.js';

describe('RoomStateManager: State Machine', () => {
  it('initializes in LOBBY state', () => {
    const mgr = createRoomStateManager();
    expect(mgr.getState()).toBe(STATES.LOBBY);
  });

  it('initializes with correct default state structure', () => {
    const mgr = createRoomStateManager();
    const snap = mgr.getSnapshot();
    expect(snap.seatA).toBeNull();
    expect(snap.seatB).toBeNull();
    expect(snap.spectators).toEqual([]);
    expect(snap.queue).toEqual([]);
    expect(snap.rematchVotes).toEqual({ seatA: false, seatB: false });
    expect(snap.battleId).toBe(0);
    expect(snap.spectatorOnly).toBe(false);
    expect(snap.ownerId).toBeNull();
    expect(snap.stateId).toEqual({ epoch: 0, version: 0 });
    expect(snap.joinCounter).toBe(0);
    expect(snap.queueCounter).toBe(0);
    expect(snap.winStreaks).toEqual({});
    expect(snap.deadlines).toEqual({
      rematchTimeout: null,
      reconnectTimeouts: {},
      rotatingEnd: null,
    });
  });

  it('accepts config overrides', () => {
    const mgr = createRoomStateManager({ spectatorOnly: true, ownerId: 'owner-1' });
    const snap = mgr.getSnapshot();
    expect(snap.spectatorOnly).toBe(true);
    expect(snap.ownerId).toBe('owner-1');
  });

  describe('canTransition', () => {
    it('LOBBY → PLAYING is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.LOBBY, STATES.PLAYING)).toBe(true);
    });

    it('PLAYING → RESULT is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.PLAYING, STATES.RESULT)).toBe(true);
    });

    it('RESULT → REMATCH_WAIT is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.RESULT, STATES.REMATCH_WAIT)).toBe(true);
    });

    it('RESULT → ROTATING is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.RESULT, STATES.ROTATING)).toBe(true);
    });

    it('REMATCH_WAIT → PLAYING is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.REMATCH_WAIT, STATES.PLAYING)).toBe(true);
    });

    it('REMATCH_WAIT → LOBBY is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.REMATCH_WAIT, STATES.LOBBY)).toBe(true);
    });

    it('ROTATING → PLAYING is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.ROTATING, STATES.PLAYING)).toBe(true);
    });

    it('ROTATING → REMATCH_WAIT is valid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.ROTATING, STATES.REMATCH_WAIT)).toBe(true);
    });

    it('LOBBY → RESULT is invalid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.LOBBY, STATES.RESULT)).toBe(false);
    });

    it('PLAYING → LOBBY is invalid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.PLAYING, STATES.LOBBY)).toBe(false);
    });

    it('RESULT → LOBBY is invalid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.RESULT, STATES.LOBBY)).toBe(false);
    });

    it('ROTATING → LOBBY is invalid', () => {
      const mgr = createRoomStateManager();
      expect(mgr.canTransition(STATES.ROTATING, STATES.LOBBY)).toBe(false);
    });
  });

  describe('transition', () => {
    it('transitions LOBBY → PLAYING and increments version', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      expect(mgr.getState()).toBe(STATES.PLAYING);
      expect(mgr.getSnapshot().stateId.version).toBe(1);
    });

    it('transitions through full game flow', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      mgr.transition(STATES.RESULT);
      mgr.transition(STATES.REMATCH_WAIT);
      mgr.transition(STATES.PLAYING);
      expect(mgr.getState()).toBe(STATES.PLAYING);
      expect(mgr.getSnapshot().stateId.version).toBe(4);
    });

    it('transitions RESULT → ROTATING → PLAYING', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      mgr.transition(STATES.RESULT);
      mgr.transition(STATES.ROTATING);
      mgr.transition(STATES.PLAYING);
      expect(mgr.getState()).toBe(STATES.PLAYING);
    });

    it('transitions ROTATING → REMATCH_WAIT when queue empties', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      mgr.transition(STATES.RESULT);
      mgr.transition(STATES.ROTATING);
      mgr.transition(STATES.REMATCH_WAIT);
      expect(mgr.getState()).toBe(STATES.REMATCH_WAIT);
    });

    it('transitions REMATCH_WAIT → LOBBY on timeout', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      mgr.transition(STATES.RESULT);
      mgr.transition(STATES.REMATCH_WAIT);
      mgr.transition(STATES.LOBBY);
      expect(mgr.getState()).toBe(STATES.LOBBY);
    });

    it('throws on invalid transition', () => {
      const mgr = createRoomStateManager();
      expect(() => mgr.transition(STATES.RESULT)).toThrow('Invalid transition: LOBBY → RESULT');
    });

    it('throws on invalid transition from PLAYING to LOBBY', () => {
      const mgr = createRoomStateManager();
      mgr.transition(STATES.PLAYING);
      expect(() => mgr.transition(STATES.LOBBY)).toThrow('Invalid transition: PLAYING → LOBBY');
    });
  });
});

describe('RoomStateManager: stateId', () => {
  it('version increments on transition', () => {
    const mgr = createRoomStateManager();
    expect(mgr.getSnapshot().stateId.version).toBe(0);
    mgr.transition(STATES.PLAYING);
    expect(mgr.getSnapshot().stateId.version).toBe(1);
  });

  it('version increments on incrementVersion (non-transition mutation)', () => {
    const mgr = createRoomStateManager();
    mgr.incrementVersion();
    expect(mgr.getSnapshot().stateId.version).toBe(1);
    mgr.incrementVersion();
    expect(mgr.getSnapshot().stateId.version).toBe(2);
  });

  it('epoch increments on incrementEpoch and resets version', () => {
    const mgr = createRoomStateManager();
    mgr.incrementVersion();
    mgr.incrementVersion();
    expect(mgr.getSnapshot().stateId).toEqual({ epoch: 0, version: 2 });
    mgr.incrementEpoch();
    expect(mgr.getSnapshot().stateId).toEqual({ epoch: 1, version: 0 });
  });

  it('epoch and version track independently', () => {
    const mgr = createRoomStateManager();
    mgr.transition(STATES.PLAYING); // version 1
    mgr.incrementVersion(); // version 2
    mgr.incrementEpoch(); // epoch 1, version 0
    mgr.transition(STATES.RESULT); // version 1
    expect(mgr.getSnapshot().stateId).toEqual({ epoch: 1, version: 1 });
  });
});

describe('RoomStateManager: getAvailableActions', () => {
  it('returns all falsy for unknown client in LOBBY', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    const actions = mgr.getAvailableActions('unknown-client');
    expect(actions.canRematch).toBeFalsy();
    expect(actions.canQueue).toBeFalsy();
    expect(actions.canSwitchRole).toBeFalsy();
    expect(actions.canStartBattle).toBeFalsy();
    expect(actions.isPlaying).toBeFalsy();
    expect(actions.isSpectating).toBeFalsy();
  });

  it('canStartBattle is true for owner when both seats filled in LOBBY', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'owner-1', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-2', name: 'B', joinOrder: 1 };
    const actions = mgr.getAvailableActions('owner-1');
    expect(actions.canStartBattle).toBe(true);
  });

  it('canStartBattle is false for non-owner even when seats filled', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'owner-1', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-2', name: 'B', joinOrder: 1 };
    const actions = mgr.getAvailableActions('player-2');
    expect(actions.canStartBattle).toBe(false);
  });

  it('canStartBattle is false when only one seat filled', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'owner-1', name: 'A', joinOrder: 0 };
    const actions = mgr.getAvailableActions('owner-1');
    expect(actions.canStartBattle).toBe(false);
  });

  it('isPlaying is true for active player in PLAYING state', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'player-a', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-b', name: 'B', joinOrder: 1 };
    mgr.transition(STATES.PLAYING);
    expect(mgr.getAvailableActions('player-a').isPlaying).toBe(true);
    expect(mgr.getAvailableActions('player-b').isPlaying).toBe(true);
  });

  it('isPlaying is false for spectator in PLAYING state', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'player-a', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-b', name: 'B', joinOrder: 1 };
    mgr._state.spectators.push({ clientId: 'spec-1', name: 'S', joinOrder: 2 });
    mgr.transition(STATES.PLAYING);
    expect(mgr.getAvailableActions('spec-1').isPlaying).toBe(false);
    expect(mgr.getAvailableActions('spec-1').isSpectating).toBe(true);
  });

  it('isSpectating is true for queue player', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.queue.push({ clientId: 'queue-1', name: 'Q', joinOrder: 3, queueOrder: 0 });
    const actions = mgr.getAvailableActions('queue-1');
    expect(actions.isSpectating).toBe(true);
  });

  it('canRematch is true for active player in REMATCH_WAIT who has not voted', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'player-a', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-b', name: 'B', joinOrder: 1 };
    mgr.transition(STATES.PLAYING);
    mgr.transition(STATES.RESULT);
    mgr.transition(STATES.REMATCH_WAIT);
    expect(mgr.getAvailableActions('player-a').canRematch).toBe(true);
    expect(mgr.getAvailableActions('player-b').canRematch).toBe(true);
  });

  it('canRematch is false for active player who already voted', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'player-a', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-b', name: 'B', joinOrder: 1 };
    mgr.transition(STATES.PLAYING);
    mgr.transition(STATES.RESULT);
    mgr.transition(STATES.REMATCH_WAIT);
    mgr._state.rematchVotes.seatA = true;
    expect(mgr.getAvailableActions('player-a').canRematch).toBe(false);
    expect(mgr.getAvailableActions('player-b').canRematch).toBe(true);
  });

  it('canRematch is false for spectator in REMATCH_WAIT', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.seatA = { clientId: 'player-a', name: 'A', joinOrder: 0 };
    mgr._state.seatB = { clientId: 'player-b', name: 'B', joinOrder: 1 };
    mgr._state.spectators.push({ clientId: 'spec-1', name: 'S', joinOrder: 2 });
    mgr.transition(STATES.PLAYING);
    mgr.transition(STATES.RESULT);
    mgr.transition(STATES.REMATCH_WAIT);
    expect(mgr.getAvailableActions('spec-1').canRematch).toBe(false);
  });

  it('canQueue is true for spectator when spectatorOnly is false', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1', spectatorOnly: false });
    mgr._state.spectators.push({ clientId: 'spec-1', name: 'S', joinOrder: 2 });
    expect(mgr.getAvailableActions('spec-1').canQueue).toBe(true);
  });

  it('canQueue is false for spectator when spectatorOnly is true', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1', spectatorOnly: true });
    mgr._state.spectators.push({ clientId: 'spec-1', name: 'S', joinOrder: 2 });
    expect(mgr.getAvailableActions('spec-1').canQueue).toBe(false);
  });

  it('canSwitchRole is true for queue player (can switch to spectator)', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1' });
    mgr._state.queue.push({ clientId: 'queue-1', name: 'Q', joinOrder: 3, queueOrder: 0 });
    expect(mgr.getAvailableActions('queue-1').canSwitchRole).toBe(true);
  });

  it('canSwitchRole is false for spectator when spectatorOnly is true', () => {
    const mgr = createRoomStateManager({ ownerId: 'owner-1', spectatorOnly: true });
    mgr._state.spectators.push({ clientId: 'spec-1', name: 'S', joinOrder: 2 });
    expect(mgr.getAvailableActions('spec-1').canSwitchRole).toBe(false);
  });
});
