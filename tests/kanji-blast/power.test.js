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
// 3.2 kanjiPowerPure
//   Requirements: 9.1
//   round(strokes × kenteiFactor × (1+読み数×0.1) × (1+図鑑種類数×0.02) × (1+plus×0.05))
// ============================================================
describe('3.2 kanjiPowerPure', () => {
  const master = {
    '生': { char: '生', strokes: 5, kentei_level: '10' },
    '一': { char: '一', strokes: 1, kentei_level: '10' }
  };

  it('Dex が空・plus 0 の基本ケース', () => {
    // 5 × 1.0 × (1+0) × (1+0) × (1+0) = 5
    expect(kanjiPowerPure(master, [], '生', 0)).toBe(5);
  });

  it('plus 省略時は 0 扱い', () => {
    expect(kanjiPowerPure(master, [], '生')).toBe(5);
  });

  it('マスタに無い char は 0', () => {
    expect(kanjiPowerPure(master, [], '無', 3)).toBe(0);
  });

  it('読み数・図鑑種類数・plus を反映する', () => {
    // Dex: 生に2読み、別charも1つ登録 → 種類数=2、生の読み数=2
    const dex = [
      { char: '生', reading: 'セイ' },
      { char: '生', reading: '生まれる' },
      { char: '一', reading: 'いち' }
    ];
    // base = 5 × 1.0 × (1 + 2×0.1) = 5 × 1.2 = 6
    // overall = 1 + 2×0.02 = 1.04
    // plus=3 → (1 + 3×0.05) = 1.15
    // 6 × 1.04 × 1.15 = 7.176 → round = 7
    expect(kanjiPowerPure(master, dex, '生', 3)).toBe(7);
  });

  it('級係数を反映する（準1級）', () => {
    const m = { '龍': { char: '龍', strokes: 16, kentei_level: '準1' } };
    // 16 × 4.2 × 1 × 1 × 1 = 67.2 → round = 67
    expect(kanjiPowerPure(m, [], '龍', 0)).toBe(67);
  });
});
