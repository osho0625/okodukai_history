import { describe, it, expect } from 'vitest';
import {
  toHira, normInput, readingParts, matchScore, resolveReadingPure
} from '../../js/kanji-blast.pure.js';

// ============================================================
// 2.1 toHira / normInput / readingParts
//   Requirements: 8.1, 8.2, 8.3
// ============================================================
describe('2.1 正規化ユーティリティ', () => {
  describe('toHira', () => {
    it('カタカナをひらがなに変換する', () => {
      expect(toHira('セイ')).toBe('せい');
      expect(toHira('ショウ')).toBe('しょう');
    });
    it('ひらがなはそのまま', () => {
      expect(toHira('うまれる')).toBe('うまれる');
    });
    it('非かな（漢字・記号）はそのまま', () => {
      expect(toHira('生まれる')).toBe('生まれる');
      expect(toHira('A1・')).toBe('A1・');
    });
  });

  describe('normInput', () => {
    it('前後の空白を除去する', () => {
      expect(normInput('  うまれる  ')).toBe('うまれる');
    });
    it('内部の空白も全て除去する', () => {
      expect(normInput('う まれ る')).toBe('うまれる');
    });
    it('区切り点（・ ･）を除去する', () => {
      expect(normInput('う・まれ･る')).toBe('うまれる');
    });
    it('null/undefined は空文字になる', () => {
      expect(normInput(undefined)).toBe('');
      expect(normInput(null)).toBe('');
    });
  });

  describe('readingParts', () => {
    it('"." ありは stem/okuri に分割する', () => {
      expect(readingParts('う.まれる')).toEqual({ stem: 'う', okuri: 'まれる' });
      expect(readingParts('か.える')).toEqual({ stem: 'か', okuri: 'える' });
      expect(readingParts('お.く')).toEqual({ stem: 'お', okuri: 'く' });
    });
    it('"." なしは全体が stem、okuri は空', () => {
      expect(readingParts('せい')).toEqual({ stem: 'せい', okuri: '' });
    });
  });
});

// ============================================================
// 2.2 matchScore
//   Requirements: 8.2, 8.3, 8.4
// ============================================================
describe('2.2 matchScore', () => {
  describe('送り仮名なし（音読み）', () => {
    it('完全一致で len+100', () => {
      // "セイ"(len2) と入力「せい」→ ひらがな化して一致
      expect(matchScore('せい', 'セイ', '生')).toBe(2 + 100);
    });
    it('不一致は -1', () => {
      expect(matchScore('しょう', 'セイ', '生')).toBe(-1);
    });
  });

  describe('送り仮名あり（訓読み）', () => {
    it('かな完全一致で fullHira長+100', () => {
      // stem="う" okuri="まれる" → full="うまれる"(len4)
      expect(matchScore('うまれる', 'う.まれる', '生')).toBe(4 + 100);
    });
    it('漢字表記入力（生まれる→うまれる）完全一致で fullHira長+100', () => {
      expect(matchScore('生まれる', 'う.まれる', '生')).toBe(4 + 100);
    });
    it('活用ゆらぎ（語幹で始まり語幹より長い）で stem長', () => {
      // 「うまれた」は stem「う」(len1)で始まりより長い
      expect(matchScore('うまれた', 'う.まれる', '生')).toBe(1);
    });
    it('語幹で始まらない・語幹と同長は -1', () => {
      expect(matchScore('いきる', 'う.まれる', '生')).toBe(-1);
      expect(matchScore('う', 'う.まれる', '生')).toBe(-1); // 語幹と同長（より長くない）
    });
  });
});

// ============================================================
// 2.3 resolveReadingPure（スコア最大・同点は配列先頭優先）
//   Requirements: 8.5, 8.6, 8.7, 8.8
// ============================================================
describe('2.3 resolveReadingPure', () => {
  // 「生」の読みを模したマスタ（実データの JSONB シェイプに合わせる）
  const master = {
    '生': {
      char: '生', strokes: 5, kentei_level: '10',
      readings: [
        { type: '音', kana: 'セイ', display: 'セイ' },
        { type: '音', kana: 'ショウ', display: 'ショウ' },
        { type: '訓', kana: 'い.きる', display: 'いきる' },
        { type: '訓', kana: 'う.まれる', display: '生まれる' },
        { type: '訓', kana: 'う.む', display: '生む' },
        { type: '訓', kana: 'なま', display: 'なま' }
      ]
    }
  };

  it('複数読みから最大スコアの display を返す', () => {
    expect(resolveReadingPure(master, '生', 'せい')).toBe('セイ');
    expect(resolveReadingPure(master, '生', 'なま')).toBe('なま');
  });

  it('「うむ」→「生む」、「うまれる」→「生まれる」に解決され両者が区別される (8.5)', () => {
    expect(resolveReadingPure(master, '生', 'うむ')).toBe('生む');
    expect(resolveReadingPure(master, '生', 'うまれる')).toBe('生まれる');
  });

  it('漢字表記入力でも display を返す (8.7)', () => {
    expect(resolveReadingPure(master, '生', '生まれる')).toBe('生まれる');
  });

  it('該当なしは null (8.8 の前段)', () => {
    expect(resolveReadingPure(master, '生', 'ぜんぜんちがう')).toBeNull();
    expect(resolveReadingPure(master, '生', '')).toBeNull();
  });

  it('マスタに無い char は null', () => {
    expect(resolveReadingPure(master, '不明', 'せい')).toBeNull();
  });
});

// ============================================================
// 2.5 matchScore の回帰テスト（うむ vs う.まれる の区別）
//   既知の回帰ケースを固定する（2.4 と方向性は重複するが削除しない）
//   Requirements: 8.5
// ============================================================
describe('2.5 回帰: うむ vs う.まれる の区別', () => {
  it('「うむ」は "う.む" に完全一致し、"う.まれる" の活用ゆらぎ扱いにならない', () => {
    // "う.む" への完全一致スコア = full("うむ")長2 + 100
    expect(matchScore('うむ', 'う.む', '生')).toBe(2 + 100);
    // "う.まれる" に対しては、活用ゆらぎ（stem="う"長1）扱いに留まり、完全一致(104)にならない
    expect(matchScore('うむ', 'う.まれる', '生')).toBe(1);
    // したがって完全一致(102) > 活用ゆらぎ(1) で "う.む" が選ばれる
    expect(2 + 100).toBeGreaterThan(1);
  });
});
