/**
 * Unit tests for Blokus score calculation and turn management
 * Validates: Task 1.5 - calculateScore, calculateTeamScore, advanceTurn, isGameOver, determineWinner
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load the blokus.html and extract the script
const html = readFileSync(resolve(__dirname, '../../pages/blokus.html'), 'utf-8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const win = dom.window;

// Extract functions from the window context
const {
  calculateScore,
  calculateTeamScore,
  isGameOver,
  advanceTurn,
  determineWinner
} = win;

// Helper: create a player with all pieces unused
function makePlayer(overrides = {}) {
  return {
    color: 'blue',
    name: 'test',
    pieces: Array(21).fill(true), // all unused
    passed: false,
    lastPieceSize: 0,
    ...overrides
  };
}

// Helper: create a game state
function makeGameState(overrides = {}) {
  return {
    mode: 4,
    currentTurn: 0,
    players: [
      makePlayer({ color: 'blue' }),
      makePlayer({ color: 'red' }),
      makePlayer({ color: 'green' }),
      makePlayer({ color: 'yellow' })
    ],
    ...overrides
  };
}

describe('calculateScore', () => {
  it('should return negative total cells when all pieces unused', () => {
    const player = makePlayer();
    // Total cells: 1+2+3+3+4+4+4+4+4+5+5+5+5+5+5+5+5+5+5+5+5 = 89
    expect(calculateScore(player)).toBe(-89);
  });

  it('should return 0 minus remaining cells for partially used pieces', () => {
    const player = makePlayer();
    // Mark first piece (I1, 1 cell) as used
    player.pieces[0] = false;
    // Remaining = 89 - 1 = 88
    expect(calculateScore(player)).toBe(-88);
  });

  it('should give +15 bonus when all pieces placed', () => {
    const player = makePlayer({ pieces: Array(21).fill(false), lastPieceSize: 5 });
    expect(calculateScore(player)).toBe(15);
  });

  it('should give +15 +5 bonus when all pieces placed and last piece is 1 cell', () => {
    const player = makePlayer({ pieces: Array(21).fill(false), lastPieceSize: 1 });
    expect(calculateScore(player)).toBe(20);
  });

  it('should NOT give bonus when not all pieces placed even if lastPieceSize is 1', () => {
    const player = makePlayer({ lastPieceSize: 1 });
    // Still has all pieces unused, no bonus. Total = 89
    expect(calculateScore(player)).toBe(-89);
  });
});

describe('calculateTeamScore', () => {
  it('should return sum of two player scores', () => {
    const p1 = makePlayer({ pieces: Array(21).fill(false), lastPieceSize: 5 });
    const p2 = makePlayer({ pieces: Array(21).fill(false), lastPieceSize: 1 });
    // p1 = 15, p2 = 20
    expect(calculateTeamScore(p1, p2)).toBe(35);
  });

  it('should handle mixed used/unused pieces', () => {
    const p1 = makePlayer(); // all unused
    const p2 = makePlayer({ pieces: Array(21).fill(false), lastPieceSize: 3 }); // all placed
    expect(calculateTeamScore(p1, p2)).toBe(calculateScore(p1) + calculateScore(p2));
  });
});

describe('isGameOver', () => {
  it('should return false when not all players have passed (4-player)', () => {
    const gs = makeGameState();
    gs.players[0].passed = true;
    gs.players[1].passed = true;
    gs.players[2].passed = true;
    expect(isGameOver(gs)).toBe(false);
  });

  it('should return true when all 4 players passed (4-player)', () => {
    const gs = makeGameState();
    gs.players.forEach(p => p.passed = true);
    expect(isGameOver(gs)).toBe(true);
  });

  it('should return true when first 3 players passed (3-player mode)', () => {
    const gs = makeGameState({ mode: 3 });
    gs.players[0].passed = true;
    gs.players[1].passed = true;
    gs.players[2].passed = true;
    // player[3] doesn't matter in 3-player mode
    expect(isGameOver(gs)).toBe(true);
  });

  it('should return false when only 2 of 3 players passed (3-player mode)', () => {
    const gs = makeGameState({ mode: 3 });
    gs.players[0].passed = true;
    gs.players[1].passed = true;
    gs.players[2].passed = false;
    expect(isGameOver(gs)).toBe(false);
  });

  it('should check all 4 players in 2-player mode', () => {
    const gs = makeGameState({ mode: 2 });
    gs.players[0].passed = true;
    gs.players[1].passed = true;
    gs.players[2].passed = true;
    gs.players[3].passed = false;
    expect(isGameOver(gs)).toBe(false);
  });
});

describe('advanceTurn', () => {
  it('should advance from 0 to 1 when no one is passed', () => {
    const gs = makeGameState({ currentTurn: 0 });
    expect(advanceTurn(gs)).toBe(1);
    expect(gs.currentTurn).toBe(1);
  });

  it('should wrap around from 3 to 0', () => {
    const gs = makeGameState({ currentTurn: 3 });
    expect(advanceTurn(gs)).toBe(0);
    expect(gs.currentTurn).toBe(0);
  });

  it('should skip passed players', () => {
    const gs = makeGameState({ currentTurn: 0 });
    gs.players[1].passed = true;
    expect(advanceTurn(gs)).toBe(2);
  });

  it('should skip multiple passed players', () => {
    const gs = makeGameState({ currentTurn: 0 });
    gs.players[1].passed = true;
    gs.players[2].passed = true;
    expect(advanceTurn(gs)).toBe(3);
  });

  it('should skip index 3 in 3-player mode', () => {
    const gs = makeGameState({ mode: 3, currentTurn: 2 });
    expect(advanceTurn(gs)).toBe(0);
  });

  it('should skip passed + inactive in 3-player mode', () => {
    const gs = makeGameState({ mode: 3, currentTurn: 1 });
    gs.players[2].passed = true;
    // skip 2 (passed) and 3 (inactive), go to 0
    expect(advanceTurn(gs)).toBe(0);
  });
});

describe('determineWinner', () => {
  it('should pick the player with highest score (4-player)', () => {
    const gs = makeGameState();
    // Give player 2 the best score (all pieces placed)
    gs.players[2].pieces = Array(21).fill(false);
    gs.players[2].lastPieceSize = 3;
    const result = determineWinner(gs);
    expect(result.isDraw).toBe(false);
    expect(result.winnerIndices).toEqual([2]);
  });

  it('should detect a draw when scores are tied (4-player)', () => {
    const gs = makeGameState();
    // All players same state = same score
    const result = determineWinner(gs);
    expect(result.isDraw).toBe(true);
    expect(result.winnerIndices).toEqual([0, 1, 2, 3]);
  });

  it('should compare team scores in 2-player mode', () => {
    const gs = makeGameState({ mode: 2 });
    // Team 1 (players[2]+players[3]) has better score
    gs.players[2].pieces = Array(21).fill(false);
    gs.players[2].lastPieceSize = 5;
    gs.players[3].pieces = Array(21).fill(false);
    gs.players[3].lastPieceSize = 5;
    const result = determineWinner(gs);
    expect(result.isDraw).toBe(false);
    expect(result.winnerIndices).toEqual([1]); // team index 1
  });

  it('should detect a draw when team scores are equal (2-player mode)', () => {
    const gs = makeGameState({ mode: 2 });
    // All same → both teams have same score
    const result = determineWinner(gs);
    expect(result.isDraw).toBe(true);
    expect(result.winnerIndices).toEqual([0, 1]);
  });

  it('should work correctly in 3-player mode', () => {
    const gs = makeGameState({ mode: 3 });
    // Player 0 has all pieces placed
    gs.players[0].pieces = Array(21).fill(false);
    gs.players[0].lastPieceSize = 1;
    const result = determineWinner(gs);
    expect(result.isDraw).toBe(false);
    expect(result.winnerIndices).toEqual([0]);
  });
});
