import { describe, it, expect } from 'vitest';
import * as pure from '../../js/kanji-blast.pure.js';

// タスク1の疎通確認: pure.js が唯一の実体として import でき、
// 対象13関数（純粋コア含む）が全て公開されていること。
describe('kanji-blast.pure.js 疎通', () => {
  it('対象関数が export されている', () => {
    const names = [
      'toHira', 'normInput', 'readingParts', 'matchScore', 'resolveReadingPure',
      'recipeParts', 'partKey', 'partsMaxStrokePure', 'chooseSplitRecipePure',
      'mergedPlusPure', 'splitPlus', 'kenteiFactor', 'kanjiPowerPure'
    ];
    for (const n of names) {
      expect(typeof pure[n], n).toBe('function');
    }
  });
});
