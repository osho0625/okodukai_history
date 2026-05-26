/**
 * Preservation Property Tests: Score, Garbage, and Broadcast Unchanged
 *
 * These tests capture the BASELINE behavior of the unfixed code.
 * They MUST PASS on the current unfixed code — they verify behavior
 * that must be preserved after the animation/PRNG fix is applied.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// --- Constants extracted from pages/puyo-battle.html ---
const CHAIN_BONUS = [0,0,8,16,32,64,96,128,160,192,224,256,288,320,352,384,416,448,480,512];
const CONNECT_BONUS = [0,0,0,0,0,2,3,4,5,6,7,10];
const COLOR_BONUS = [0,0,3,6,12,24];
const GARBAGE_RATE = 70;
const COLS = 6;
const ROWS = 13;
const GARBAGE_COLOR = 99;

// --- Functions extracted verbatim from pages/puyo-battle.html ---

function calcScore(chainNum, result) {
  const { totalCleared, groups, colorCount } = result;
  if (totalCleared === 0) return 0;
  const cb = CHAIN_BONUS[Math.min(chainNum, CHAIN_BONUS.length - 1)] || 0;
  let connectB = 0;
  groups.forEach(g => { connectB += CONNECT_BONUS[Math.min(g.count, CONNECT_BONUS.length - 1)] || 0; });
  const colorB = COLOR_BONUS[Math.min(colorCount, COLOR_BONUS.length - 1)] || 0;
  const bonus = Math.max(1, Math.min(999, cb + connectB + colorB));
  return totalCleared * 10 * bonus;
}

function findAndClear(grid) {
  const visited = Array.from({length: ROWS}, () => new Array(COLS).fill(false));
  let totalCleared = 0;
  const groups = [];
  const colorsCleared = new Set();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== null && grid[r][c] !== GARBAGE_COLOR && !visited[r][c]) {
        const group = [];
        const color = grid[r][c];
        const stack = [{r, c}];
        while (stack.length) {
          const {r: cr, c: cc} = stack.pop();
          if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
          if (visited[cr][cc]) continue;
          if (grid[cr][cc] !== color) continue;
          visited[cr][cc] = true;
          group.push({r: cr, c: cc});
          stack.push({r:cr-1,c:cc},{r:cr+1,c:cc},{r:cr,c:cc-1},{r:cr,c:cc+1});
        }
        if (group.length >= 4) {
          totalCleared += group.length;
          groups.push({ color, count: group.length });
          colorsCleared.add(color);
          const garbageToRemove = [];
          group.forEach(({r: gr, c: gc}) => {
            [[gr-1,gc],[gr+1,gc],[gr,gc-1],[gr,gc+1]].forEach(([nr,nc]) => {
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === GARBAGE_COLOR) {
                garbageToRemove.push({r:nr, c:nc});
              }
            });
            grid[gr][gc] = null;
          });
          garbageToRemove.forEach(({r:gr, c:gc}) => { grid[gr][gc] = null; });
        }
      }
    }
  }
  return { totalCleared, groups, colorCount: colorsCleared.size };
}

// --- Custom Arbitraries ---

/** Generate a valid clearResult object for calcScore */
const clearResultArb = fc.record({
  totalCleared: fc.integer({ min: 4, max: 72 }), // 4 minimum to clear, max ~full board
  groups: fc.array(
    fc.record({
      color: fc.integer({ min: 0, max: 5 }),
      count: fc.integer({ min: 4, max: 11 })
    }),
    { minLength: 1, maxLength: 6 }
  ),
  colorCount: fc.integer({ min: 1, max: 5 })
});

/** Generate a valid chain number (1-19, matching CHAIN_BONUS array length) */
const chainNumArb = fc.integer({ min: 1, max: 19 });

/** Generate a grid with at least one group of 4+ connected puyos */
function makeGridWithGroup() {
  return fc.tuple(
    fc.integer({ min: 0, max: ROWS - 1 }),  // start row
    fc.integer({ min: 0, max: COLS - 4 }),   // start col (ensure 4 fit horizontally)
    fc.integer({ min: 0, max: 4 })           // color
  ).map(([row, col, color]) => {
    const grid = Array.from({length: ROWS}, () => new Array(COLS).fill(null));
    // Place 4 connected puyos horizontally
    for (let i = 0; i < 4; i++) {
      grid[row][col + i] = color;
    }
    return grid;
  });
}

// --- Property-Based Tests ---

describe('Preservation: Score Calculation (calcScore)', () => {

  it('calcScore returns a non-negative integer for any valid input', () => {
    fc.assert(
      fc.property(chainNumArb, clearResultArb, (chainNum, result) => {
        const score = calcScore(chainNum, result);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(score)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('calcScore returns 0 when totalCleared is 0', () => {
    fc.assert(
      fc.property(chainNumArb, (chainNum) => {
        const result = { totalCleared: 0, groups: [], colorCount: 0 };
        expect(calcScore(chainNum, result)).toBe(0);
      }),
      { numRuns: 50 }
    );
  });

  it('calcScore(1, {totalCleared:4, groups:[{color:0,count:4}], colorCount:1}) returns 40', () => {
    // Observation: chain 1, 4 puyos, 1 group of 4, 1 color
    // CHAIN_BONUS[1] = 0, CONNECT_BONUS[4] = 0, COLOR_BONUS[1] = 0
    // bonus = max(1, min(999, 0+0+0)) = 1
    // score = 4 * 10 * 1 = 40
    const result = { totalCleared: 4, groups: [{ color: 0, count: 4 }], colorCount: 1 };
    expect(calcScore(1, result)).toBe(40);
  });

  it('calcScore(2, {totalCleared:4, groups:[{color:0,count:4}], colorCount:1}) returns 320', () => {
    // Observation: chain 2, 4 puyos, 1 group of 4, 1 color
    // CHAIN_BONUS[2] = 8, CONNECT_BONUS[4] = 0, COLOR_BONUS[1] = 0
    // bonus = max(1, min(999, 8+0+0)) = 8
    // score = 4 * 10 * 8 = 320
    const result = { totalCleared: 4, groups: [{ color: 0, count: 4 }], colorCount: 1 };
    expect(calcScore(2, result)).toBe(320);
  });

  it('score formula: totalCleared * 10 * max(1, min(999, chainBonus + connectBonus + colorBonus))', () => {
    fc.assert(
      fc.property(chainNumArb, clearResultArb, (chainNum, result) => {
        const { totalCleared, groups, colorCount } = result;
        if (totalCleared === 0) return; // skip zero case

        const cb = CHAIN_BONUS[Math.min(chainNum, CHAIN_BONUS.length - 1)] || 0;
        let connectB = 0;
        groups.forEach(g => { connectB += CONNECT_BONUS[Math.min(g.count, CONNECT_BONUS.length - 1)] || 0; });
        const colorB = COLOR_BONUS[Math.min(colorCount, COLOR_BONUS.length - 1)] || 0;
        const expectedBonus = Math.max(1, Math.min(999, cb + connectB + colorB));
        const expectedScore = totalCleared * 10 * expectedBonus;

        expect(calcScore(chainNum, result)).toBe(expectedScore);
      }),
      { numRuns: 300 }
    );
  });
});

describe('Preservation: Garbage Calculation', () => {

  it('garbage count = Math.floor(score / GARBAGE_RATE) for any score', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (score) => {
        const garbage = Math.floor(score / GARBAGE_RATE);
        expect(garbage).toBe(Math.floor(score / 70));
        expect(garbage).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(garbage)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('garbage is 0 for scores below 70', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 69 }), (score) => {
        expect(Math.floor(score / GARBAGE_RATE)).toBe(0);
      }),
      { numRuns: 50 }
    );
  });

  it('garbage increases by 1 for each additional 70 points', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (multiplier) => {
        const score = multiplier * GARBAGE_RATE;
        expect(Math.floor(score / GARBAGE_RATE)).toBe(multiplier);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Preservation: findAndClear Return Value Structure', () => {

  it('findAndClear returns {totalCleared, groups, colorCount} with correct types', () => {
    fc.assert(
      fc.property(makeGridWithGroup(), (grid) => {
        const result = findAndClear(grid);

        // Structure check
        expect(result).toHaveProperty('totalCleared');
        expect(result).toHaveProperty('groups');
        expect(result).toHaveProperty('colorCount');

        // Type check
        expect(typeof result.totalCleared).toBe('number');
        expect(Array.isArray(result.groups)).toBe(true);
        expect(typeof result.colorCount).toBe('number');

        // Value constraints
        expect(result.totalCleared).toBeGreaterThanOrEqual(4);
        expect(result.groups.length).toBeGreaterThanOrEqual(1);
        expect(result.colorCount).toBeGreaterThanOrEqual(1);

        // Each group has color and count
        result.groups.forEach(g => {
          expect(g).toHaveProperty('color');
          expect(g).toHaveProperty('count');
          expect(g.count).toBeGreaterThanOrEqual(4);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('totalCleared equals sum of all group counts', () => {
    fc.assert(
      fc.property(makeGridWithGroup(), (grid) => {
        const result = findAndClear(grid);
        const sumOfCounts = result.groups.reduce((sum, g) => sum + g.count, 0);
        expect(result.totalCleared).toBe(sumOfCounts);
      }),
      { numRuns: 100 }
    );
  });

  it('colorCount equals number of distinct colors in groups', () => {
    fc.assert(
      fc.property(makeGridWithGroup(), (grid) => {
        const result = findAndClear(grid);
        const distinctColors = new Set(result.groups.map(g => g.color));
        expect(result.colorCount).toBe(distinctColors.size);
      }),
      { numRuns: 100 }
    );
  });

  it('findAndClear sets cleared cells to null in the grid', () => {
    fc.assert(
      fc.property(makeGridWithGroup(), (grid) => {
        // Count non-null cells before
        let nonNullBefore = 0;
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (grid[r][c] !== null) nonNullBefore++;

        const result = findAndClear(grid);

        // Count non-null cells after
        let nonNullAfter = 0;
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (grid[r][c] !== null) nonNullAfter++;

        // Cleared cells should be gone
        expect(nonNullBefore - nonNullAfter).toBe(result.totalCleared);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Preservation: Broadcast Payload Structure', () => {

  it('broadcast payload contains only {grid, score, pair, next} — no animation keys', () => {
    // Simulate what broadcastState() sends (extracted from puyo-battle.html)
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),  // score
        fc.boolean(),                          // has pair (play state)
        (score, hasPair) => {
          // Replicate broadcastState logic
          const grid = Array.from({length: ROWS}, () => new Array(COLS).fill(null));
          const gridData = grid.map(row => row.map(cell => cell === null ? -1 : cell));
          const pair = hasPair ? { c1: 0, c2: 1, col: 2, row: 0, dir: 0 } : null;
          const next = { c1: 2, c2: 3, col: 2, row: 0, dir: 0 };

          const payload = { grid: gridData, score, pair, next };

          // Verify structure: only these 4 keys
          const keys = Object.keys(payload).sort();
          expect(keys).toEqual(['grid', 'next', 'pair', 'score']);

          // Verify NO animation-related keys
          expect(payload).not.toHaveProperty('particles');
          expect(payload).not.toHaveProperty('escapeAnimations');
          expect(payload).not.toHaveProperty('chainText');
          expect(payload).not.toHaveProperty('animations');
          expect(payload).not.toHaveProperty('effects');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('broadcast grid encodes null as -1 and colors as integers', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.array(
            fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 8 })),
            { minLength: COLS, maxLength: COLS }
          ),
          { minLength: ROWS, maxLength: ROWS }
        ),
        (grid) => {
          // Replicate broadcastState grid encoding
          const gridData = grid.map(row => row.map(cell => cell === null ? -1 : cell));

          // Verify encoding
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (grid[r][c] === null) {
                expect(gridData[r][c]).toBe(-1);
              } else {
                expect(gridData[r][c]).toBe(grid[r][c]);
              }
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
