/**
 * Unit tests for RoomStateManager — Tasks 1.2-1.8
 * Participant tracking, seat management, queue, role switching,
 * rotation, rematch, spectatorOnly, removal.
 */
import { describe, it, expect } from 'vitest';
import { createRoomStateManager, STATES } from '../../js/puyo-room-state.js';

describe('Task 1.2: Participant tracking and seat management', () => {
  describe('addParticipant', () => {
    it('adds a participant as spectator with incrementing joinOrder', () => {
      const mgr = createRoomStateManager({ ownerId: 'owner-1' });
      const p1 = mgr.addParticipant('c1', 'Alice');
      expect(p1).toEqual({ clientId: 'c1', name: 'Alice', joinOrder: 0 });
      expect(mgr.getSnapshot().spectators).toHaveLength(1);

      const p2 = mgr.addParticipant('c2', 'Bob');
      expect(p2.joinOrder).toBe(1);
      expect(mgr.getSnapshot().spectators).toHaveLength(2);
    });

    it('increments version on addParticipant', () => {
      const mgr = createRoomStateManager();
      const v0 = mgr.getSnapshot().stateId.version;
      mgr.addParticipant('c1', 'Alice');
      expect(mgr.getSnapshot().stateId.version).toBe(v0 + 1);
    });

    it('enforces max 6 participants', () => {
      const mgr = createRoomStateManager();
      for (let i = 0; i < 6; i++) {
        mgr.addParticipant(`c${i}`, `P${i}`);
      }
      expect(() => mgr.addParticipant('c6', 'P6')).toThrow('Room is full');
    });

    it('rejects duplicate clientId', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      expect(() => mgr.addParticipant('c1', 'Alice2')).toThrow('already in room');
    });
  });

  describe('getParticipantCount', () => {
    it('counts all locations', () => {
      const mgr = createRoomStateManager();
      expect(mgr.getParticipantCount()).toBe(0);
      mgr.addParticipant('c1', 'A');
      mgr.addParticipant('c2', 'B');
      expect(mgr.getParticipantCount()).toBe(2);
      mgr.assignSeat('c1', 'seatA');
      expect(mgr.getParticipantCount()).toBe(2);
      mgr.assignSeat('c2', 'seatB');
      expect(mgr.getParticipantCount()).toBe(2);
    });
  });

  describe('assignSeat', () => {
    it('moves spectator to seatA', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const seated = mgr.assignSeat('c1', 'seatA');
      expect(seated.clientId).toBe('c1');
      expect(mgr.getSnapshot().seatA.clientId).toBe('c1');
      expect(mgr.getSnapshot().spectators).toHaveLength(0);
    });

    it('moves spectator to seatB', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatB');
      expect(mgr.getSnapshot().seatB.clientId).toBe('c1');
    });

    it('moves queue player to seat', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.enqueue('c1');
      mgr.assignSeat('c1', 'seatA');
      expect(mgr.getSnapshot().seatA.clientId).toBe('c1');
      expect(mgr.getSnapshot().queue).toHaveLength(0);
    });

    it('throws if seat is occupied', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.assignSeat('c1', 'seatA');
      expect(() => mgr.assignSeat('c2', 'seatA')).toThrow('already occupied');
    });

    it('throws if participant not found', () => {
      const mgr = createRoomStateManager();
      expect(() => mgr.assignSeat('unknown', 'seatA')).toThrow('not found');
    });

    it('throws if participant already seated', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      expect(() => mgr.assignSeat('c1', 'seatB')).toThrow('already seated');
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const v = mgr.getSnapshot().stateId.version;
      mgr.assignSeat('c1', 'seatA');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });

  describe('vacateSeat', () => {
    it('removes player from seat and returns info', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      const removed = mgr.vacateSeat('seatA');
      expect(removed.clientId).toBe('c1');
      expect(mgr.getSnapshot().seatA).toBeNull();
    });

    it('returns null for empty seat', () => {
      const mgr = createRoomStateManager();
      expect(mgr.vacateSeat('seatA')).toBeNull();
    });

    it('increments version when seat was occupied', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      const v = mgr.getSnapshot().stateId.version;
      mgr.vacateSeat('seatA');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });

    it('throws for invalid seat name', () => {
      const mgr = createRoomStateManager();
      expect(() => mgr.vacateSeat('seatC')).toThrow('Invalid seat');
    });
  });
});


describe('Task 1.3: Queue management', () => {
  describe('enqueue', () => {
    it('moves spectator to queue with queueOrder', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const entry = mgr.enqueue('c1');
      expect(entry.clientId).toBe('c1');
      expect(entry.queueOrder).toBe(0);
      expect(mgr.getSnapshot().spectators).toHaveLength(0);
      expect(mgr.getSnapshot().queue).toHaveLength(1);
    });

    it('assigns incrementing queueOrder', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      const e1 = mgr.enqueue('c1');
      const e2 = mgr.enqueue('c2');
      expect(e1.queueOrder).toBe(0);
      expect(e2.queueOrder).toBe(1);
    });

    it('keeps queue sorted by queueOrder ascending', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.addParticipant('c3', 'Charlie');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      mgr.enqueue('c3');
      const q = mgr.getSnapshot().queue;
      expect(q[0].queueOrder).toBeLessThan(q[1].queueOrder);
      expect(q[1].queueOrder).toBeLessThan(q[2].queueOrder);
    });

    it('throws if not a spectator', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      expect(() => mgr.enqueue('c1')).toThrow('not a spectator');
    });

    it('throws if participant not found', () => {
      const mgr = createRoomStateManager();
      expect(() => mgr.enqueue('unknown')).toThrow('not found');
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const v = mgr.getSnapshot().stateId.version;
      mgr.enqueue('c1');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });

  describe('dequeue', () => {
    it('removes and returns first queue entry', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      const entry = mgr.dequeue();
      expect(entry.clientId).toBe('c1');
      expect(mgr.getSnapshot().queue).toHaveLength(1);
      expect(mgr.getSnapshot().queue[0].clientId).toBe('c2');
    });

    it('returns null for empty queue', () => {
      const mgr = createRoomStateManager();
      expect(mgr.dequeue()).toBeNull();
    });

    it('increments version when dequeuing', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.enqueue('c1');
      const v = mgr.getSnapshot().stateId.version;
      mgr.dequeue();
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });

  describe('removeFromQueue', () => {
    it('removes specific player from queue', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.addParticipant('c3', 'Charlie');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      mgr.enqueue('c3');
      const removed = mgr.removeFromQueue('c2');
      expect(removed.clientId).toBe('c2');
      const q = mgr.getSnapshot().queue;
      expect(q).toHaveLength(2);
      expect(q[0].clientId).toBe('c1');
      expect(q[1].clientId).toBe('c3');
    });

    it('preserves order of remaining entries', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'A');
      mgr.addParticipant('c2', 'B');
      mgr.addParticipant('c3', 'C');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      mgr.enqueue('c3');
      mgr.removeFromQueue('c1');
      const q = mgr.getSnapshot().queue;
      expect(q[0].clientId).toBe('c2');
      expect(q[1].clientId).toBe('c3');
      expect(q[0].queueOrder).toBeLessThan(q[1].queueOrder);
    });

    it('returns null if not in queue', () => {
      const mgr = createRoomStateManager();
      expect(mgr.removeFromQueue('unknown')).toBeNull();
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.enqueue('c1');
      const v = mgr.getSnapshot().stateId.version;
      mgr.removeFromQueue('c1');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });
});


describe('Task 1.4: Role switching', () => {
  describe('switchToQueue', () => {
    it('moves spectator to queue', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const entry = mgr.switchToQueue('c1');
      expect(entry.clientId).toBe('c1');
      expect(mgr.getSnapshot().spectators).toHaveLength(0);
      expect(mgr.getSnapshot().queue).toHaveLength(1);
    });

    it('throws if spectatorOnly is true', () => {
      const mgr = createRoomStateManager({ spectatorOnly: true });
      mgr.addParticipant('c1', 'Alice');
      expect(() => mgr.switchToQueue('c1')).toThrow('spectator-only');
    });
  });

  describe('switchToSpectator', () => {
    it('moves queue player to spectator', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.enqueue('c1');
      const entry = mgr.switchToSpectator('c1');
      expect(entry.clientId).toBe('c1');
      expect(mgr.getSnapshot().queue).toHaveLength(0);
      expect(mgr.getSnapshot().spectators).toHaveLength(1);
    });

    it('preserves queue order of remaining players', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'A');
      mgr.addParticipant('c2', 'B');
      mgr.addParticipant('c3', 'C');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      mgr.enqueue('c3');
      mgr.switchToSpectator('c2');
      const q = mgr.getSnapshot().queue;
      expect(q).toHaveLength(2);
      expect(q[0].clientId).toBe('c1');
      expect(q[1].clientId).toBe('c3');
    });

    it('throws if not in queue', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      expect(() => mgr.switchToSpectator('c1')).toThrow('not in queue');
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.enqueue('c1');
      const v = mgr.getSnapshot().stateId.version;
      mgr.switchToSpectator('c1');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });
});


describe('Task 1.5: Winner-stays rotation', () => {
  function setupRotation(mgr) {
    mgr.addParticipant('winner', 'Winner');
    mgr.addParticipant('loser', 'Loser');
    mgr.addParticipant('next', 'Next');
    mgr.assignSeat('winner', 'seatA');
    mgr.assignSeat('loser', 'seatB');
    mgr.enqueue('next');
  }

  it('winner goes to seatA, queue[0] to seatB, loser to queue tail', () => {
    const mgr = createRoomStateManager();
    setupRotation(mgr);
    const result = mgr.rotate('winner', 'loser');
    expect(result.winner.clientId).toBe('winner');
    expect(result.nextOpponent.clientId).toBe('next');
    expect(result.loser.clientId).toBe('loser');
    expect(mgr.getSnapshot().seatA.clientId).toBe('winner');
    expect(mgr.getSnapshot().seatB.clientId).toBe('next');
    expect(mgr.getSnapshot().queue[0].clientId).toBe('loser');
  });

  it('queue length remains unchanged after rotation', () => {
    const mgr = createRoomStateManager();
    setupRotation(mgr);
    const qLenBefore = mgr.getSnapshot().queue.length;
    mgr.rotate('winner', 'loser');
    expect(mgr.getSnapshot().queue.length).toBe(qLenBefore);
  });

  it('works when winner is in seatB', () => {
    const mgr = createRoomStateManager();
    mgr.addParticipant('p1', 'P1');
    mgr.addParticipant('p2', 'P2');
    mgr.addParticipant('next', 'Next');
    mgr.assignSeat('p1', 'seatA');
    mgr.assignSeat('p2', 'seatB');
    mgr.enqueue('next');
    // p2 wins, p1 loses
    mgr.rotate('p2', 'p1');
    expect(mgr.getSnapshot().seatA.clientId).toBe('p2');
    expect(mgr.getSnapshot().seatB.clientId).toBe('next');
    expect(mgr.getSnapshot().queue[0].clientId).toBe('p1');
  });

  it('updates winStreaks: winner increments, loser resets', () => {
    const mgr = createRoomStateManager();
    setupRotation(mgr);
    mgr.rotate('winner', 'loser');
    expect(mgr.getSnapshot().winStreaks['winner']).toBe(1);
    expect(mgr.getSnapshot().winStreaks['loser']).toBe(0);
  });

  it('accumulates win streaks across multiple rotations', () => {
    const mgr = createRoomStateManager();
    mgr.addParticipant('w', 'Winner');
    mgr.addParticipant('l1', 'Loser1');
    mgr.addParticipant('l2', 'Loser2');
    mgr.assignSeat('w', 'seatA');
    mgr.assignSeat('l1', 'seatB');
    mgr.enqueue('l2');
    mgr.rotate('w', 'l1');
    mgr.rotate('w', 'l2');
    expect(mgr.getSnapshot().winStreaks['w']).toBe(2);
  });

  it('throws if queue is empty', () => {
    const mgr = createRoomStateManager();
    mgr.addParticipant('c1', 'A');
    mgr.addParticipant('c2', 'B');
    mgr.assignSeat('c1', 'seatA');
    mgr.assignSeat('c2', 'seatB');
    expect(() => mgr.rotate('c1', 'c2')).toThrow('queue is empty');
  });

  it('throws if winner not in seat', () => {
    const mgr = createRoomStateManager();
    mgr.addParticipant('c1', 'A');
    mgr.addParticipant('c2', 'B');
    mgr.addParticipant('c3', 'C');
    mgr.assignSeat('c1', 'seatA');
    mgr.assignSeat('c2', 'seatB');
    mgr.enqueue('c3');
    expect(() => mgr.rotate('c3', 'c2')).toThrow('not in a seat');
  });

  it('increments version', () => {
    const mgr = createRoomStateManager();
    setupRotation(mgr);
    const v = mgr.getSnapshot().stateId.version;
    mgr.rotate('winner', 'loser');
    expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
  });
});


describe('Task 1.6: Rematch vote logic', () => {
  function setupRematch(mgr) {
    mgr.addParticipant('pA', 'PlayerA');
    mgr.addParticipant('pB', 'PlayerB');
    mgr.assignSeat('pA', 'seatA');
    mgr.assignSeat('pB', 'seatB');
  }

  describe('voteRematch', () => {
    it('accepts vote from seatA with matching battleId', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      const accepted = mgr.voteRematch('pA', 0);
      expect(accepted).toBe(true);
      expect(mgr.getSnapshot().rematchVotes.seatA).toBe(true);
    });

    it('accepts vote from seatB with matching battleId', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      const accepted = mgr.voteRematch('pB', 0);
      expect(accepted).toBe(true);
      expect(mgr.getSnapshot().rematchVotes.seatB).toBe(true);
    });

    it('rejects vote with stale battleId', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      const accepted = mgr.voteRematch('pA', 999);
      expect(accepted).toBe(false);
      expect(mgr.getSnapshot().rematchVotes.seatA).toBe(false);
    });

    it('rejects vote from non-active player', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      mgr.addParticipant('spec', 'Spectator');
      const accepted = mgr.voteRematch('spec', 0);
      expect(accepted).toBe(false);
    });

    it('increments version on accepted vote', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      const v = mgr.getSnapshot().stateId.version;
      mgr.voteRematch('pA', 0);
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });

  describe('checkRematchReady', () => {
    it('returns false when no votes', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      expect(mgr.checkRematchReady()).toBe(false);
    });

    it('returns false when only one voted', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      mgr.voteRematch('pA', 0);
      expect(mgr.checkRematchReady()).toBe(false);
    });

    it('returns true when both voted', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      mgr.voteRematch('pA', 0);
      mgr.voteRematch('pB', 0);
      expect(mgr.checkRematchReady()).toBe(true);
    });
  });

  describe('resetForNewBattle', () => {
    it('increments battleId and resets votes', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      mgr.voteRematch('pA', 0);
      mgr.voteRematch('pB', 0);
      const newBattleId = mgr.resetForNewBattle(Date.now() + 30000);
      expect(newBattleId).toBe(1);
      expect(mgr.getSnapshot().rematchVotes).toEqual({ seatA: false, seatB: false });
      expect(mgr.getSnapshot().battleId).toBe(1);
    });

    it('sets rematch deadline', () => {
      const mgr = createRoomStateManager();
      const deadline = Date.now() + 30000;
      mgr.resetForNewBattle(deadline);
      expect(mgr.getSnapshot().deadlines.rematchTimeout).toBe(deadline);
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      const v = mgr.getSnapshot().stateId.version;
      mgr.resetForNewBattle();
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });

    it('old battleId votes are rejected after reset', () => {
      const mgr = createRoomStateManager();
      setupRematch(mgr);
      mgr.resetForNewBattle();
      // battleId is now 1, voting with 0 should fail
      expect(mgr.voteRematch('pA', 0)).toBe(false);
      // voting with 1 should succeed
      expect(mgr.voteRematch('pA', 1)).toBe(true);
    });
  });
});


describe('Task 1.7: SpectatorOnly mode enforcement', () => {
  it('enqueue throws when spectatorOnly is true', () => {
    const mgr = createRoomStateManager({ spectatorOnly: true });
    mgr.addParticipant('c1', 'Alice');
    expect(() => mgr.enqueue('c1')).toThrow('spectator-only');
  });

  it('switchToQueue throws when spectatorOnly is true', () => {
    const mgr = createRoomStateManager({ spectatorOnly: true });
    mgr.addParticipant('c1', 'Alice');
    expect(() => mgr.switchToQueue('c1')).toThrow('spectator-only');
  });

  it('queue is always empty in spectatorOnly mode', () => {
    const mgr = createRoomStateManager({ spectatorOnly: true });
    mgr.addParticipant('c1', 'Alice');
    mgr.addParticipant('c2', 'Bob');
    // Cannot enqueue
    expect(() => mgr.enqueue('c1')).toThrow();
    expect(mgr.getSnapshot().queue).toHaveLength(0);
  });

  it('RESULT transitions to REMATCH_WAIT when queue is empty (spectatorOnly guarantees this)', () => {
    const mgr = createRoomStateManager({ spectatorOnly: true });
    mgr.addParticipant('c1', 'A');
    mgr.addParticipant('c2', 'B');
    mgr.assignSeat('c1', 'seatA');
    mgr.assignSeat('c2', 'seatB');
    mgr.transition(STATES.PLAYING);
    mgr.transition(STATES.RESULT);
    // queue is empty, so REMATCH_WAIT is the correct transition
    expect(mgr.canTransition(STATES.RESULT, STATES.REMATCH_WAIT)).toBe(true);
    mgr.transition(STATES.REMATCH_WAIT);
    expect(mgr.getState()).toBe(STATES.REMATCH_WAIT);
  });
});


describe('Task 1.8: Participant removal and room closure', () => {
  describe('removeParticipant', () => {
    it('removes from spectators', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      const removed = mgr.removeParticipant('c1');
      expect(removed.clientId).toBe('c1');
      expect(mgr.getSnapshot().spectators).toHaveLength(1);
      expect(mgr.getSnapshot().spectators[0].clientId).toBe('c2');
    });

    it('removes from seatA', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      const removed = mgr.removeParticipant('c1');
      expect(removed.clientId).toBe('c1');
      expect(mgr.getSnapshot().seatA).toBeNull();
    });

    it('removes from seatB', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatB');
      const removed = mgr.removeParticipant('c1');
      expect(removed.clientId).toBe('c1');
      expect(mgr.getSnapshot().seatB).toBeNull();
    });

    it('removes from queue', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.enqueue('c1');
      mgr.enqueue('c2');
      const removed = mgr.removeParticipant('c1');
      expect(removed.clientId).toBe('c1');
      expect(mgr.getSnapshot().queue).toHaveLength(1);
      expect(mgr.getSnapshot().queue[0].clientId).toBe('c2');
    });

    it('preserves other participants positions on removal', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'A');
      mgr.addParticipant('c2', 'B');
      mgr.addParticipant('c3', 'C');
      mgr.addParticipant('c4', 'D');
      mgr.assignSeat('c1', 'seatA');
      mgr.assignSeat('c2', 'seatB');
      mgr.enqueue('c3');
      // c4 is spectator
      mgr.removeParticipant('c3');
      expect(mgr.getSnapshot().seatA.clientId).toBe('c1');
      expect(mgr.getSnapshot().seatB.clientId).toBe('c2');
      expect(mgr.getSnapshot().spectators[0].clientId).toBe('c4');
    });

    it('returns null if not found', () => {
      const mgr = createRoomStateManager();
      expect(mgr.removeParticipant('unknown')).toBeNull();
    });

    it('increments version', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      const v = mgr.getSnapshot().stateId.version;
      mgr.removeParticipant('c1');
      expect(mgr.getSnapshot().stateId.version).toBe(v + 1);
    });
  });

  describe('isEmpty', () => {
    it('returns true when no participants', () => {
      const mgr = createRoomStateManager();
      expect(mgr.isEmpty()).toBe(true);
    });

    it('returns false when participants exist', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      expect(mgr.isEmpty()).toBe(false);
    });

    it('returns true after all participants removed', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.addParticipant('c2', 'Bob');
      mgr.removeParticipant('c1');
      mgr.removeParticipant('c2');
      expect(mgr.isEmpty()).toBe(true);
    });

    it('returns true after seated player removed', () => {
      const mgr = createRoomStateManager();
      mgr.addParticipant('c1', 'Alice');
      mgr.assignSeat('c1', 'seatA');
      mgr.removeParticipant('c1');
      expect(mgr.isEmpty()).toBe(true);
    });
  });
});
