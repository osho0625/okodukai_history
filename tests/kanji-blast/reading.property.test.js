import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { matchScore } from '../../js/kanji-blast.pure.js';

// ============================================================
// 2.4 プロパティ: 完全一致 > 活用ゆらぎ
//   Requirements: 8.6
//   訓読み（送り仮名あり）の kana に対し、
//   「完全一致する入力（stem+okuri）」のスコアは、
//   「活用ゆらぎのみ一致する入力（stem + 別の送り）」のスコアより必ず大きい。
// ============================================================
describe('2.4 property: 完全一致 > 活用ゆらぎ', () => {
  // ひらがな1文字
  const hira = fc.integer({ min: 0x3041, max: 0x3096 }).map(c => String.fromCharCode(c));
  const hiraStr = (min, max) =>
    fc.array(hira, { minLength: min, maxLength: max }).map(a => a.join(''));

  it('stem+okuri の完全一致は、stem+別送り(≠okuri) の活用ゆらぎより高スコア', () => {
    fc.assert(
      fc.property(
        hiraStr(1, 3), // stem
        hiraStr(1, 3), // okuri
        hiraStr(1, 3), // 別の送り仮名候補
        (stem, okuri, otherOkuri) => {
          const kana = stem + '.' + okuri;
          // ダミー char（入力中に出現しない記号にして表記置換の影響を無くす）
          const char = '〇';

          const exactInput = stem + okuri;              // 完全一致
          const wobbleInput = stem + otherOkuri;        // 活用ゆらぎ候補

          const exactScore = matchScore(exactInput, kana, char);
          const wobbleScore = matchScore(wobbleInput, kana, char);

          // 完全一致は常に成立（fullHira長 + 100）
          expect(exactScore).toBe((stem + okuri).length + 100);

          // wobbleInput が偶然 stem+okuri と同一（otherOkuri === okuri）なら
          // それも完全一致になるので、その場合は等しくてよい。
          if (wobbleInput === exactInput) {
            expect(wobbleScore).toBe(exactScore);
          } else {
            // それ以外は必ず 完全一致 > 活用ゆらぎ（またはゆらぎ不成立=-1）
            expect(exactScore).toBeGreaterThan(wobbleScore);
          }
        }
      ),
      { numRuns: 300 }
    );
  });
});
