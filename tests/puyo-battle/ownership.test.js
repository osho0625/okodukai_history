/**
 * Unit tests for OwnershipManager — Tasks 2.1-2.5
 * Heartbeat broadcasting, miss detection, claim protocol,
 * ownership transfer, and command validation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOwnershipManager } from '../../js/puyo-ownership.js';

describe('Task 2.1: Heartbeat broadcasting with monotonic sequence number', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getHeartbeatPayload returns ownerId, stateId, and seq', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    const payload = mgr.getHeartbeatPayload();
    expect(payload).toEqual({
      ownerId: 'owner-1',
      stateId: { epoch: 0, version: 0 },
      seq: 0,
    });
  });

  it('startHeartbeat broadcasts every 5s with incrementing seq', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    const sendFn = vi.fn();
    mgr.startHeartbeat(sendFn);

    expect(sendFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(sendFn).toHaveBeenCalledTimes(1);
    expect(sendFn).toHaveBeenCalledWith(expect.objectContaining({ seq: 1 }));

    vi.advanceTimersByTime(5000);
    expect(sendFn).toHaveBeenCalledTimes(2);
    expect(sendFn).toHaveBeenLastCalledWith(expect.objectContaining({ seq: 2 }));

    vi.advanceTimersByTime(5000);
    expect(sendFn).toHaveBeenCalledTimes(3);
    expect(sendFn).toHaveBeenLastCalledWith(expect.objectContaining({ seq: 3 }));

    mgr.stopHeartbeat();
  });

  it('stopHeartbeat stops broadcasting', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    const sendFn = vi.fn();
    mgr.startHeartbeat(sendFn);

    vi.advanceTimersByTime(5000);
    expect(sendFn).toHaveBeenCalledTimes(1);

    mgr.stopHeartbeat();

    vi.advanceTimersByTime(15000);
    expect(sendFn).toHaveBeenCalledTimes(1); // no more calls
  });

  it('startHeartbeat is idempotent (calling twice does not create duplicate intervals)', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    const sendFn = vi.fn();
    mgr.startHeartbeat(sendFn);
    mgr.startHeartbeat(sendFn); // second call should be no-op

    vi.advanceTimersByTime(5000);
    expect(sendFn).toHaveBeenCalledTimes(1); // not 2
    mgr.stopHeartbeat();
  });

  it('heartbeat payload includes current stateId', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    mgr.setStateId({ epoch: 2, version: 5 });
    const payload = mgr.getHeartbeatPayload();
    expect(payload.stateId).toEqual({ epoch: 2, version: 5 });
  });
});

describe('Task 2.2: Heartbeat miss detection with wall-clock timeout + jitter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('receiveHeartbeat updates lastHeartbeatTime', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 1,
      isOwner: false,
    });

    const timeBefore = mgr.getLastHeartbeatTime();
    vi.advanceTimersByTime(1000);
    mgr.receiveHeartbeat({ ownerId: 'owner-1', stateId: { epoch: 0, version: 1 }, seq: 1 });
    expect(mgr.getLastHeartbeatTime()).toBeGreaterThan(timeBefore);
  });

  it('receiveHeartbeat updates ownerId and stateId', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 1,
      isOwner: false,
    });
    mgr.receiveHeartbeat({ ownerId: 'owner-1', stateId: { epoch: 1, version: 3 }, seq: 5 });
    expect(mgr.getOwnerId()).toBe('owner-1');
    expect(mgr.getStateId()).toEqual({ epoch: 1, version: 3 });
  });

  it('triggers claimFn when timeout exceeded and participant is oldest', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0, // lowest joinOrder = oldest
      isOwner: false,
    });
    const claimFn = vi.fn();
    const participants = [
      { clientId: 'client-2', joinOrder: 0 },
      { clientId: 'client-3', joinOrder: 1 },
    ];

    mgr.startMissDetection(claimFn, () => participants);

    // Advance past 15s timeout + max jitter (6s)
    vi.advanceTimersByTime(22000);

    expect(claimFn).toHaveBeenCalled();
    mgr.stopMissDetection();
  });

  it('does NOT trigger claimFn when participant is not oldest', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-3',
      myJoinOrder: 2, // not the oldest
      isOwner: false,
    });
    const claimFn = vi.fn();
    const participants = [
      { clientId: 'client-2', joinOrder: 0 },
      { clientId: 'client-3', joinOrder: 2 },
    ];

    mgr.startMissDetection(claimFn, () => participants);

    vi.advanceTimersByTime(22000);

    expect(claimFn).not.toHaveBeenCalled();
    mgr.stopMissDetection();
  });

  it('does NOT trigger claimFn when heartbeats are received within timeout', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: false,
    });
    const claimFn = vi.fn();
    const participants = [{ clientId: 'client-2', joinOrder: 0 }];

    mgr.startMissDetection(claimFn, () => participants);

    // Receive heartbeats every 5s (within 15s timeout)
    vi.advanceTimersByTime(5000);
    mgr.receiveHeartbeat({ ownerId: 'owner-1', stateId: { epoch: 0, version: 0 }, seq: 1 });
    vi.advanceTimersByTime(5000);
    mgr.receiveHeartbeat({ ownerId: 'owner-1', stateId: { epoch: 0, version: 0 }, seq: 2 });
    vi.advanceTimersByTime(5000);
    mgr.receiveHeartbeat({ ownerId: 'owner-1', stateId: { epoch: 0, version: 0 }, seq: 3 });

    expect(claimFn).not.toHaveBeenCalled();
    mgr.stopMissDetection();
  });

  it('does NOT trigger claimFn when this client is the owner', () => {
    const mgr = createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
    const claimFn = vi.fn();
    const participants = [{ clientId: 'owner-1', joinOrder: 0 }];

    mgr.startMissDetection(claimFn, () => participants);

    vi.advanceTimersByTime(22000);

    expect(claimFn).not.toHaveBeenCalled();
    mgr.stopMissDetection();
  });

  it('stopMissDetection stops the check loop', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: false,
    });
    const claimFn = vi.fn();
    const participants = [{ clientId: 'client-2', joinOrder: 0 }];

    mgr.startMissDetection(claimFn, () => participants);
    mgr.stopMissDetection();

    vi.advanceTimersByTime(30000);
    expect(claimFn).not.toHaveBeenCalled();
  });
});

describe('Task 2.3: Ownership claim protocol with deterministic tie-break', () => {
  it('createClaim returns correct payload', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 1,
      isOwner: false,
    });
    mgr.setStateId({ epoch: 3, version: 10 });
    const claim = mgr.createClaim();
    expect(claim).toEqual({
      candidateId: 'client-2',
      joinOrder: 1,
      nextEpoch: 4,
    });
  });

  it('receiveClaim accepts claim from participant with lowest joinOrder', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-3',
      myJoinOrder: 2,
      isOwner: false,
    });
    const participants = [
      { clientId: 'client-1', joinOrder: 0 },
      { clientId: 'client-2', joinOrder: 1 },
      { clientId: 'client-3', joinOrder: 2 },
    ];
    const claim = { candidateId: 'client-1', joinOrder: 0, nextEpoch: 1 };
    const result = mgr.receiveClaim(claim, participants);
    expect(result).toEqual({ accepted: true, winnerId: 'client-1' });
  });

  it('receiveClaim rejects claim from non-oldest participant', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-3',
      myJoinOrder: 2,
      isOwner: false,
    });
    const participants = [
      { clientId: 'client-1', joinOrder: 0 },
      { clientId: 'client-2', joinOrder: 1 },
      { clientId: 'client-3', joinOrder: 2 },
    ];
    const claim = { candidateId: 'client-2', joinOrder: 1, nextEpoch: 1 };
    const result = mgr.receiveClaim(claim, participants);
    expect(result).toEqual({ accepted: false, winnerId: 'client-1' });
  });

  it('tie-break uses lexicographic clientId when joinOrder is equal', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-c',
      myJoinOrder: 0,
      isOwner: false,
    });
    const participants = [
      { clientId: 'client-b', joinOrder: 0 },
      { clientId: 'client-a', joinOrder: 0 }, // same joinOrder, 'a' < 'b'
    ];
    const claim = { candidateId: 'client-a', joinOrder: 0, nextEpoch: 1 };
    const result = mgr.receiveClaim(claim, participants);
    expect(result).toEqual({ accepted: true, winnerId: 'client-a' });

    // Claim from 'b' should be rejected
    const claim2 = { candidateId: 'client-b', joinOrder: 0, nextEpoch: 1 };
    const result2 = mgr.receiveClaim(claim2, participants);
    expect(result2).toEqual({ accepted: false, winnerId: 'client-a' });
  });

  it('amIOldestParticipant returns true when myJoinOrder is lowest', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-1',
      myJoinOrder: 0,
      isOwner: false,
    });
    const participants = [
      { clientId: 'client-1', joinOrder: 0 },
      { clientId: 'client-2', joinOrder: 1 },
      { clientId: 'client-3', joinOrder: 2 },
    ];
    expect(mgr.amIOldestParticipant(participants)).toBe(true);
  });

  it('amIOldestParticipant returns false when not oldest', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 1,
      isOwner: false,
    });
    const participants = [
      { clientId: 'client-1', joinOrder: 0 },
      { clientId: 'client-2', joinOrder: 1 },
    ];
    expect(mgr.amIOldestParticipant(participants)).toBe(false);
  });

  it('amIOldestParticipant returns false for empty participants', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-1',
      myJoinOrder: 0,
      isOwner: false,
    });
    expect(mgr.amIOldestParticipant([])).toBe(false);
  });
});

describe('Task 2.4: Ownership transfer with roomState snapshot and deadline reconstruction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('performTransfer sets this client as owner and increments epoch', () => {
    const onTransfer = vi.fn();
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: false,
      onTransfer,
    });
    mgr.setStateId({ epoch: 1, version: 5 });

    const roomState = { state: 'PLAYING', seatA: { clientId: 'a' }, seatB: { clientId: 'b' } };
    const result = mgr.performTransfer(roomState);

    expect(result.newOwnerId).toBe('client-2');
    expect(result.epoch).toBe(2);
    expect(result.roomStateSnapshot).toBe(roomState);
    expect(mgr.getIsOwner()).toBe(true);
    expect(mgr.getOwnerId()).toBe('client-2');
    expect(mgr.getStateId()).toEqual({ epoch: 2, version: 0 });
    expect(onTransfer).toHaveBeenCalledWith(roomState);
  });

  it('receiveTransfer updates ownerId and epoch for non-owner', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-3',
      myJoinOrder: 2,
      isOwner: false,
    });

    mgr.receiveTransfer({
      newOwnerId: 'client-2',
      epoch: 3,
      roomStateSnapshot: {},
    });

    expect(mgr.getOwnerId()).toBe('client-2');
    expect(mgr.getStateId().epoch).toBe(3);
    expect(mgr.getStateId().version).toBe(0);
    expect(mgr.getIsOwner()).toBe(false);
  });

  it('receiveTransfer sets isOwner=true when newOwnerId matches myClientId', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: false,
    });

    mgr.receiveTransfer({
      newOwnerId: 'client-2',
      epoch: 1,
      roomStateSnapshot: {},
    });

    expect(mgr.getIsOwner()).toBe(true);
  });

  it('reconstructTimers creates timeouts from deadlines', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: true,
    });

    const now = Date.now();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const deadlines = {
      rematchTimeout: now + 10000,
      rotatingEnd: now + 5000,
    };
    const callbacks = {
      rematchTimeout: cb1,
      rotatingEnd: cb2,
    };

    const timers = mgr.reconstructTimers(deadlines, callbacks);

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(cb1).toHaveBeenCalledTimes(1);
  });

  it('reconstructTimers executes immediately when deadline has passed', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: true,
    });

    const now = Date.now();
    const cb = vi.fn();

    const deadlines = { expired: now - 5000 };
    const callbacks = { expired: cb };

    mgr.reconstructTimers(deadlines, callbacks);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('reconstructTimers skips null deadlines', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: true,
    });

    const cb = vi.fn();
    const deadlines = { rematchTimeout: null };
    const callbacks = { rematchTimeout: cb };

    const timers = mgr.reconstructTimers(deadlines, callbacks);
    vi.advanceTimersByTime(30000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('reconstructTimers skips deadlines without matching callback', () => {
    const mgr = createOwnershipManager({
      myClientId: 'client-2',
      myJoinOrder: 0,
      isOwner: true,
    });

    const deadlines = { rematchTimeout: Date.now() + 5000 };
    const callbacks = {}; // no matching callback

    const timers = mgr.reconstructTimers(deadlines, callbacks);
    vi.advanceTimersByTime(10000);
    // No error thrown, no callback called
  });
});

describe('Task 2.5: Owner command validation (validateAction)', () => {
  function createTestManager() {
    return createOwnershipManager({
      myClientId: 'owner-1',
      myJoinOrder: 0,
      isOwner: true,
    });
  }

  function createRoomState() {
    return {
      seatA: { clientId: 'player-a', name: 'Alice', joinOrder: 0 },
      seatB: { clientId: 'player-b', name: 'Bob', joinOrder: 1 },
      spectators: [{ clientId: 'spectator-1', name: 'Charlie', joinOrder: 2 }],
      queue: [{ clientId: 'queue-1', name: 'Dave', joinOrder: 3, queueOrder: 0 }],
      battleId: 5,
    };
  }

  it('rejects spoofed sender (payload.clientId !== senderClientId)', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'rematch_vote',
      { clientId: 'player-a', vote: true, battleId: 5 },
      'attacker-id', // sender doesn't match payload
      roomState
    );
    expect(result).toBe(false);
  });

  it('accepts valid rematch_vote from active player with correct battleId', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'rematch_vote',
      { clientId: 'player-a', vote: true, battleId: 5 },
      'player-a',
      roomState
    );
    expect(result).toBe(true);
  });

  it('rejects rematch_vote from non-active player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'rematch_vote',
      { clientId: 'spectator-1', vote: true, battleId: 5 },
      'spectator-1',
      roomState
    );
    expect(result).toBe(false);
  });

  it('rejects rematch_vote with stale battleId', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'rematch_vote',
      { clientId: 'player-a', vote: true, battleId: 4 }, // stale
      'player-a',
      roomState
    );
    expect(result).toBe(false);
  });

  it('accepts role_choice from spectator', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'role_choice',
      { clientId: 'spectator-1', role: 'queue' },
      'spectator-1',
      roomState
    );
    expect(result).toBe(true);
  });

  it('accepts role_switch from queue player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'role_switch',
      { clientId: 'queue-1', newRole: 'spectator' },
      'queue-1',
      roomState
    );
    expect(result).toBe(true);
  });

  it('rejects role_choice from active player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'role_choice',
      { clientId: 'player-a', role: 'queue' },
      'player-a',
      roomState
    );
    expect(result).toBe(false);
  });

  it('rejects role_switch from active player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'role_switch',
      { clientId: 'player-b', newRole: 'spectator' },
      'player-b',
      roomState
    );
    expect(result).toBe(false);
  });

  it('accepts game state event from active player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'state',
      { clientId: 'player-a', grid: [] },
      'player-a',
      roomState
    );
    expect(result).toBe(true);
  });

  it('rejects game state event from spectator', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'state',
      { clientId: 'spectator-1', grid: [] },
      'spectator-1',
      roomState
    );
    expect(result).toBe(false);
  });

  it('accepts garbage event from active player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'garbage',
      { clientId: 'player-b', amount: 3 },
      'player-b',
      roomState
    );
    expect(result).toBe(true);
  });

  it('rejects garbage event from queue player', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'garbage',
      { clientId: 'queue-1', amount: 3 },
      'queue-1',
      roomState
    );
    expect(result).toBe(false);
  });

  it('allows unknown events to pass through (player_join, player_leave)', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'player_join',
      { clientId: 'new-player', name: 'Eve' },
      'new-player',
      roomState
    );
    expect(result).toBe(true);
  });

  it('rejects role_choice from unknown participant (not in any list)', () => {
    const mgr = createTestManager();
    const roomState = createRoomState();

    const result = mgr.validateAction(
      'role_choice',
      { clientId: 'unknown-id', role: 'queue' },
      'unknown-id',
      roomState
    );
    expect(result).toBe(false);
  });
});
