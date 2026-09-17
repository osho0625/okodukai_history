import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { partKey, mergedPlusPure, splitPlus } from '../../js/kanji-blast.pure.js';

// ============================================================
// 5.2 プロパティ: partKey の順不同不変性と重複区別
//   Requirements: 6.2
//   生成条件: 1〜3要素（空配列は 5.1 の境界テストで別途固定）
// ============================================================
describe('5.2 property: partKey 順不同不変・重複区別', () => {
  const kanji = fc.constantFrom('木', '林', '森', '火', '口', '十', '一', '二');
  const parts = fc.array(kanji, { minLength: 1, maxLength: 3 });

  it('並べ替えても同一キー（順不同不変）', () => {
    fc.assert(
      fc.property(parts, (arr) => {
        const shuffled = [...arr].reverse();
        expect(partKey(shuffled)).toBe(partKey(arr));
      }),
      { numRuns: 300 }
    );
  });

  it('要素の多重集合が異なればキーも異なる（重複区別）', () => {
    fc.assert(
      fc.property(parts, parts, (a, b) => {
        const sortedA = [...a].sort().join('|');
        const sortedB = [...b].sort().join('|');
        // 多重集合（ソート済み列）が同じ ⇔ キーが同じ
        if (sortedA === sortedB) {
          expect(partKey(a)).toBe(partKey(b));
        } else {
          expect(partKey(a)).not.toBe(partKey(b));
        }
      }),
      { numRuns: 300 }
    );
  });
});

// ============================================================
// 5.5 プロパティ: 合体→分解の往復で Plus_Value は増えない
//   Requirements: 7.6
//   前提: n === items.length（2〜3）、各 plus は 0〜plus_cap、plus_cap >= 1
// ============================================================
describe('5.5 property: 合体→分解の往復で Plus は増えない', () => {
  it('Σ splitPlus(mergedPlus(items), n) ≤ Σ items.plus', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // plus_cap（1以上）
        fc.integer({ min: 2, max: 3 }),  // 素材数 n
        (plusCap, n) => {
          // 各素材の plus を 0〜plusCap で生成し、items.length === n を固定
          return fc.assert(
            fc.property(
              fc.array(fc.integer({ min: 0, max: plusCap }), { minLength: n, maxLength: n }),
              (plusArr) => {
                const items = plusArr.map(p => ({ plus: p }));
                const merged = mergedPlusPure(items, plusCap);      // 合体後の+
                const each = splitPlus(merged, n);                  // 分解後の各素材+
                const totalAfter = each * n;                        // 分解後の合計
                const totalBefore = plusArr.reduce((s, p) => s + p, 0);
                expect(totalAfter).toBeLessThanOrEqual(totalBefore);
              }
            ),
            { numRuns: 50 }
          );
        }
      ),
      { numRuns: 40 }
    );
  });
});
