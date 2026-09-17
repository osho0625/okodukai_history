import { describe, it, expect } from 'vitest';
import {
  recipeParts, partKey, partsMaxStrokePure, chooseSplitRecipePure,
  mergedPlusPure, splitPlus
} from '../../js/kanji-blast.pure.js';

// ============================================================
// 5.1 recipeParts / partKey
//   Requirements: 6.1, 6.2, 10.4, 10.6
// ============================================================
describe('5.1 recipeParts / partKey', () => {
  describe('recipeParts', () => {
    it('part_c が NULL なら2要素', () => {
      expect(recipeParts({ part_a: '木', part_b: '木', part_c: null })).toEqual(['木', '木']);
    });
    it('part_c 値ありで3要素', () => {
      expect(recipeParts({ part_a: '木', part_b: '木', part_c: '木' })).toEqual(['木', '木', '木']);
    });
    it('part_c が undefined でも2要素（filter(Boolean)）', () => {
      expect(recipeParts({ part_a: '口', part_b: '十' })).toEqual(['口', '十']);
    });
  });

  describe('partKey', () => {
    it('ソート済み | 連結キー（順不同一致）', () => {
      expect(partKey(['木', '林'])).toBe(partKey(['林', '木']));
    });
    it('重複素材は区別される（木+木 ≠ 木+木+木）', () => {
      expect(partKey(['木', '木'])).not.toBe(partKey(['木', '木', '木']));
    });
    it('境界: 空配列は空文字を返す（現行実装の挙動を正とする）', () => {
      // [].slice().sort().join('|') === ''
      expect(partKey([])).toBe('');
    });
    it('境界: 1要素はその要素そのもの', () => {
      expect(partKey(['火'])).toBe('火');
    });
  });
});

// ============================================================
// 5.3 partsMaxStrokePure / chooseSplitRecipePure
//   Requirements: 7.1, 7.2, 10.5
// ============================================================
describe('5.3 partsMaxStrokePure / chooseSplitRecipePure', () => {
  const master = {
    '木': { char: '木', strokes: 4 },
    '林': { char: '林', strokes: 8 },
    '森': { char: '森', strokes: 12 }
  };

  describe('partsMaxStrokePure', () => {
    it('素材の最大画数を返す', () => {
      expect(partsMaxStrokePure(master, ['木', '林'])).toBe(8);
      expect(partsMaxStrokePure(master, ['木', '木', '木'])).toBe(4);
    });
    it('マスタに無い素材は 0 扱い', () => {
      expect(partsMaxStrokePure(master, ['木', '未知'])).toBe(4);
      expect(partsMaxStrokePure(master, [])).toBe(0);
    });
  });

  describe('chooseSplitRecipePure', () => {
    it('画数最大パーツを含むレシピを優先する（森→木+林 を 木+木+木 より優先）', () => {
      const recipeByResult = {
        '森': [['木', '木', '木'], ['木', '林']]
      };
      // 木+林 は最大画数8、木+木+木 は最大画数4 → 木+林 が選ばれる
      expect(chooseSplitRecipePure(master, recipeByResult, '森')).toEqual(['木', '林']);
    });
    it('分解先が無ければ null', () => {
      expect(chooseSplitRecipePure(master, {}, '木')).toBeNull();
      expect(chooseSplitRecipePure(master, { '木': [] }, '木')).toBeNull();
    });
  });
});

// ============================================================
// 5.4 mergedPlusPure / splitPlus
//   Requirements: 6.6, 7.5
// ============================================================
describe('5.4 mergedPlusPure / splitPlus', () => {
  describe('mergedPlusPure', () => {
    it('素材+合計 + 1', () => {
      expect(mergedPlusPure([{ plus: 1 }, { plus: 2 }], 10)).toBe(4); // 1+2+1
    });
    it('plus_cap で上限クリップ', () => {
      expect(mergedPlusPure([{ plus: 2 }, { plus: 2 }], 3)).toBe(3); // 2+2+1=5 → cap 3
    });
    it('plus 未設定は 0 扱い', () => {
      expect(mergedPlusPure([{}, {}], 10)).toBe(1); // 0+0+1
    });
    it('plusCap 未指定はデフォルト 3', () => {
      expect(mergedPlusPure([{ plus: 5 }, { plus: 5 }])).toBe(3);
    });
  });

  describe('splitPlus', () => {
    it('floor((結果+ - 1) / 素材数)', () => {
      expect(splitPlus(5, 3)).toBe(1); // floor(4/3)=1
      expect(splitPlus(4, 3)).toBe(1); // floor(3/3)=1
      expect(splitPlus(7, 2)).toBe(3); // floor(6/2)=3
    });
    it('0未満は0に切り上げ', () => {
      expect(splitPlus(0, 2)).toBe(0); // floor(-1/2)=-1 → 0
      expect(splitPlus(1, 3)).toBe(0); // floor(0/3)=0
    });
    it('結果+ 未設定は 0 扱い', () => {
      expect(splitPlus(undefined, 2)).toBe(0);
    });
  });
});
