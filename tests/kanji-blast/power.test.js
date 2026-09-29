import { describe, it, expect } from 'vitest';
import { kenteiFactor, kanjiPowerPure } from '../../js/kanji-blast.pure.js';

// ============================================================
// 3.1 kenteiFactor
//   Requirements: 9.1
// ============================================================
describe('3.1 kenteiFactor', () => {
  it('係数表の全級を返す', () => {
    expect(kenteiFactor('10')).toBe(1.0);
    expect(kenteiFactor('9')).toBe(1.2);
    expect(kenteiFactor('8')).toBe(1.4);
    expect(kenteiFactor('7')).toBe(1.6);
    expect(kenteiFactor('6')).toBe(1.8);
    expect(kenteiFactor('5')).toBe(2.0);
    expect(kenteiFactor('4')).toBe(2.4);
    expect(kenteiFactor('3')).toBe(2.8);
    expect(kenteiFactor('準2')).toBe(3.2);
    expect(kenteiFactor('2')).toBe(3.6);
    expect(kenteiFactor('準1')).toBe(4.2);
    expect(kenteiFactor('1')).toBe(5.0);
  });
  it('未定義の級は 1.0 にフォールバック', () => {
    expect(kenteiFactor('0')).toBe(1.0);
    expect(kenteiFactor(undefined)).toBe(1.0);
    expect(kenteiFactor('あ')).toBe(1.0);
  });
});

// ============================================================
// 3.2 kanjiPowerPure（強さ再設計版 / kanji-blast-balance-danmaku）
//   Requirements(balance): 2.1, 2.8
//   round(strokes × kenteiBoost × plusBoost(plus,cap) × (1+読み数×0.1) × (1+図鑑種類数×0.02))
//   kenteiBoost(level) = 1 + 0.5×(F-1)/4  （F=kenteiFactor, Fmin=1,Fmax=5）
//   plusBoost(plus,cap) = 1 + 0.5×clamp(plus,0,cap)/max(cap,1)
// ============================================================
describe('3.2 kanjiPowerPure（新式・画数主軸）', () => {
  const master = {
    '生': { char: '生', strokes: 5, kentei_level: '10' },
    '一': { char: '一', strokes: 1, kentei_level: '10' }
  };

  it('Dex が空・plus 0 の基本ケース', () => {
    // 5 × 1.0(10級) × 1.0(+0) × 1 × 1 = 5
    expect(kanjiPowerPure(master, [], '生', 0, 3)).toBe(5);
  });

  it('plus 省略時は 0 扱い（plusBoost=1.0）', () => {
    expect(kanjiPowerPure(master, [], '生')).toBe(5);
  });

  it('マスタに無い char は 0', () => {
    expect(kanjiPowerPure(master, [], '無', 3, 3)).toBe(0);
  });

  it('読み数・図鑑種類数・plus を反映する', () => {
    // Dex: 生に2読み、別charも1つ登録 → 種類数=2、生の読み数=2
    const dex = [
      { char: '生', reading: 'セイ' },
      { char: '生', reading: '生まれる' },
      { char: '一', reading: 'いち' }
    ];
    // base = 5 × 1.0(10級) × plusBoost(3,3)=1.5 × (1+2×0.1)=1.2 × (1+2×0.02)=1.04
    //      = 5 × 1.5 × 1.2 × 1.04 = 9.36 → round = 9
    expect(kanjiPowerPure(master, dex, '生', 3, 3)).toBe(9);
  });

  it('級ブーストを反映する（準1級・画数主軸で穏やか）', () => {
    const m = { '龍': { char: '龍', strokes: 16, kentei_level: '準1' } };
    // kenteiBoost(準1: F=4.2) = 1 + 0.5×(4.2-1)/4 = 1.4
    // 16 × 1.4 × 1.0(+0) × 1 × 1 = 22.4 → round = 22
    expect(kanjiPowerPure(m, [], '龍', 0, 3)).toBe(22);
  });
});
