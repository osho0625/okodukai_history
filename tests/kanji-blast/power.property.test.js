import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { kanjiPowerPure } from '../../js/kanji-blast.pure.js';

// ============================================================
// 3.3 プロパティ: plus 増加で Final_Power は減らない（単調非減少）
//   Requirements: 9.1
//   他項（strokes/級/Dex）を固定し、plus を増やしたとき
//   kanjiPowerPure は減少しない（Math.round のため厳密増加ではなく非減少）。
// ============================================================
describe('3.3 property: plus について単調非減少', () => {
  const level = fc.constantFrom('10', '9', '8', '7', '6', '5', '4', '3', '準2', '2', '準1', '1');

  it('plus を増やすと Final_Power は減らない', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }), // strokes
        level,
        fc.integer({ min: 0, max: 50 }),  // dexCharCount 相当（別charの種類数）
        fc.integer({ min: 0, max: 10 }),  // 対象charの読み数
        fc.integer({ min: 0, max: 20 }),  // plus
        fc.integer({ min: 0, max: 20 }),  // 追加分 delta
        (strokes, lvl, otherChars, selfReadings, plus, delta) => {
          const char = '対';
          const master = { [char]: { char, strokes, kentei_level: lvl } };

          // Dex を構築: 対象char に selfReadings 件、別charを otherChars 種類
          const dex = [];
          for (let i = 0; i < selfReadings; i++) dex.push({ char, reading: 'r' + i });
          for (let i = 0; i < otherChars; i++) dex.push({ char: 'x' + i, reading: 'y' });

          const low = kanjiPowerPure(master, dex, char, plus);
          const high = kanjiPowerPure(master, dex, char, plus + delta);

          expect(high).toBeGreaterThanOrEqual(low);
        }
      ),
      { numRuns: 300 }
    );
  });
});
