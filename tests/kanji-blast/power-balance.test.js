import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { kenteiBoost, plusBoost } from '../../js/kanji-blast.pure.js';

// ============================================================
// 強さ再設計（kanji-blast-balance-danmaku）
//  kenteiBoost / plusBoost の単体・境界・範囲プロパティ
// ============================================================

// ---- 2.1 kenteiBoost ----
//   kenteiBoost(level) = 1 + 0.5×(F-1)/4  （Fmin=1.0, Fmax=5.0）
//   Requirements(balance): 2.2, 2.3, 2.4
describe('2.1 kenteiBoost', () => {
  it('10級=1.00 / 5級=1.125 / 2級=1.325 / 1級=1.50', () => {
    expect(kenteiBoost('10')).toBeCloseTo(1.0, 10);   // F=1.0
    expect(kenteiBoost('5')).toBeCloseTo(1.125, 10);  // F=2.0 → 1+0.5×1/4
    expect(kenteiBoost('2')).toBeCloseTo(1.325, 10);  // F=3.6 → 1+0.5×2.6/4
    expect(kenteiBoost('1')).toBeCloseTo(1.5, 10);    // F=5.0
  });

  it('未定義級は 1.00（kenteiFactor フォールバック 1.0）', () => {
    expect(kenteiBoost('0')).toBeCloseTo(1.0, 10);
    expect(kenteiBoost(undefined)).toBeCloseTo(1.0, 10);
    expect(kenteiBoost('あ')).toBeCloseTo(1.0, 10);
  });
});

// ---- 2.2 plusBoost ----
//   plusBoost(plus,cap) = 1 + 0.5×clamp(plus,0,cap)/max(cap,1)
//   Requirements(balance): 2.5, 2.6, 2.6a
describe('2.2 plusBoost', () => {
  it('plus=0 → 1.0、plus=cap → 1.5', () => {
    expect(plusBoost(0, 3)).toBeCloseTo(1.0, 10);
    expect(plusBoost(3, 3)).toBeCloseTo(1.5, 10);
    expect(plusBoost(2, 4)).toBeCloseTo(1.25, 10); // 1+0.5×2/4
  });

  it('plus>cap は 1.5 で頭打ち', () => {
    expect(plusBoost(10, 3)).toBeCloseTo(1.5, 10);
  });

  it('負数 plus は 0 扱いで 1.0', () => {
    expect(plusBoost(-5, 3)).toBeCloseTo(1.0, 10);
    expect(plusBoost(-1, 10)).toBeCloseTo(1.0, 10);
  });

  it('cap=0 / 未取得でも 0除算せず 1.0', () => {
    expect(plusBoost(0, 0)).toBeCloseTo(1.0, 10);
    expect(plusBoost(5, 0)).toBeCloseTo(1.0, 10);   // clamp(5,0,0)=0
    expect(plusBoost(5, undefined)).toBeCloseTo(1.0, 10);
    expect(plusBoost(undefined, undefined)).toBeCloseTo(1.0, 10);
  });
});

// ---- 2.4 範囲プロパティ ----
//   任意入力で kenteiBoost / plusBoost は [1.0, 1.5] に収まる
//   Requirements(balance): 2.3, 2.6
describe('2.4 property: ブーストは [1.0, 1.5] に収まる', () => {
  it('kenteiBoost は任意の級文字列で 1.0〜1.5', () => {
    fc.assert(
      fc.property(fc.string(), (lvl) => {
        const b = kenteiBoost(lvl);
        expect(b).toBeGreaterThanOrEqual(1.0);
        expect(b).toBeLessThanOrEqual(1.5);
      }),
      { numRuns: 300 }
    );
  });

  it('plusBoost は任意の plus/cap（負数・巨大値・0含む）で 1.0〜1.5', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (plus, cap) => {
          const b = plusBoost(plus, cap);
          expect(b).toBeGreaterThanOrEqual(1.0);
          expect(b).toBeLessThanOrEqual(1.5);
        }
      ),
      { numRuns: 300 }
    );
  });
});
