/**
 * Integration tests for family-settlement
 * Edge cases and potential bug detection
 */
import { describe, it, expect } from 'vitest';
import {
  validateExpenseMaster,
  validateTemporaryExpense,
  yearMonthFromDate,
  lastDayOfMonth,
  generateMonthlyExpenses,
  calculateSettlement,
  shouldCreateSettlement,
  canEditTemporaryExpense,
  canDeleteTemporaryExpense,
  calculateDifference,
  calculateAccumulatedDifference,
  getDifferenceSettlementPeriod,
  getPeriodMonths,
  calculateDifferenceSettlement,
  suggestBaseAmountAdjustments
} from '../js/settlement-utils.js';

describe('Edge Case: calculateSettlement with single payer', () => {
  it('全項目が1人のpayerだけの場合でもクラッシュしない', () => {
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 20000 },
      { payer: 'りょうすけ', planned_amount: 10000 },
    ];
    const result = calculateSettlement(monthly, []);
    // 1人しかいない場合、transfersは空（fairShare = total自体）
    expect(result.transfers).toHaveLength(0);
    expect(result.householdTotal).toBe(30000);
    expect(result.fairShare).toBe(15000);
    // payerDiffsが正しいか
    expect(result.payerDiffs['りょうすけ']).toBe(15000 - 30000); // -15000
  });
});

describe('Edge Case: calculateSettlement with empty inputs', () => {
  it('空配列でもクラッシュしない', () => {
    const result = calculateSettlement([], []);
    expect(result.householdTotal).toBe(0);
    expect(result.fairShare).toBe(0);
    expect(result.transfers).toHaveLength(0);
    expect(result.payerTotals).toEqual({});
    expect(result.payerDiffs).toEqual({});
  });
});

describe('Edge Case: calculateSettlement with odd total', () => {
  it('奇数合計（10001円）で端数処理が正しい', () => {
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 7001 },
      { payer: 'めぐみ', planned_amount: 3000 },
    ];
    const result = calculateSettlement(monthly, []);
    expect(result.householdTotal).toBe(10001);
    expect(result.fairShare).toBe(5000); // floor(10001/2) = 5000
    // めぐみ→りょうすけ: 5000 - 3000 = 2000
    expect(result.transfers[0].from).toBe('めぐみ');
    expect(result.transfers[0].to).toBe('りょうすけ');
    expect(result.transfers[0].amount).toBe(2000);
  });
});

describe('Edge Case: calculateSettlement equal amounts', () => {
  it('両者同額ならtransfers空', () => {
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 10000 },
      { payer: 'めぐみ', planned_amount: 10000 },
    ];
    const result = calculateSettlement(monthly, []);
    expect(result.householdTotal).toBe(20000);
    expect(result.fairShare).toBe(10000);
    expect(result.transfers).toHaveLength(0);
  });
});

describe('Edge Case: generateMonthlyExpenses with mixed enabled', () => {
  it('enabled=undefinedのマスタは生成される（デフォルトtrue扱い）', () => {
    const masters = [
      { id: 'a', payer: 'りょうすけ', base_amount: 1000 }, // enabled未定義
    ];
    const result = generateMonthlyExpenses(masters, [], '2026-07');
    // enabled !== false なので生成される
    expect(result).toHaveLength(1);
  });

  it('enabled=trueは生成、enabled=falseは除外', () => {
    const masters = [
      { id: 'a', enabled: true, payer: 'りょうすけ', base_amount: 1000 },
      { id: 'b', enabled: false, payer: 'めぐみ', base_amount: 2000 },
    ];
    const result = generateMonthlyExpenses(masters, [], '2026-07');
    expect(result).toHaveLength(1);
    expect(result[0].expense_master_id).toBe('a');
  });
});

describe('Edge Case: calculateDifferenceSettlement with all null actuals', () => {
  it('全てactual_amount=nullならtransfersは空', () => {
    const expenses = [
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: null, name: '電気' },
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: null, name: '電気' },
    ];
    const result = calculateDifferenceSettlement(expenses);
    // All diffs are 0 (since actual=null → diff=0)
    expect(result.transfers).toHaveLength(0);
  });
});

describe('Edge Case: getDifferenceSettlementPeriod boundary', () => {
  it('6月は上半期、7月は下半期', () => {
    expect(getDifferenceSettlementPeriod('2026-06')).toBe('first_half');
    expect(getDifferenceSettlementPeriod('2026-07')).toBe('second_half');
  });

  it('1月は上半期、12月は下半期', () => {
    expect(getDifferenceSettlementPeriod('2026-01')).toBe('first_half');
    expect(getDifferenceSettlementPeriod('2026-12')).toBe('second_half');
  });
});

describe('Edge Case: getPeriodMonths', () => {
  it('上半期は1〜6月', () => {
    const months = getPeriodMonths(2026, 'first_half');
    expect(months).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
  });

  it('下半期は7〜12月', () => {
    const months = getPeriodMonths(2026, 'second_half');
    expect(months).toEqual(['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12']);
  });
});

describe('Edge Case: suggestBaseAmountAdjustments', () => {
  it('全てnullなら提案なし', () => {
    const expenses = [
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: null, name: '電気' },
    ];
    const result = suggestBaseAmountAdjustments(expenses);
    expect(result).toHaveLength(0);
  });

  it('suggestedBase=currentBaseなら提案しない', () => {
    const expenses = [
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: 20100, name: '電気' },
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: 19900, name: '電気' },
    ];
    // avg = floor((20100+19900)/2) = 20000 → suggestedBase = 20000 = currentBase → no suggestion
    const result = suggestBaseAmountAdjustments(expenses);
    expect(result).toHaveLength(0);
  });
});

describe('Edge Case: validateExpenseMaster edge values', () => {
  it('base_amount=0は有効', () => {
    const result = validateExpenseMaster({ name: 'テスト', payer: 'りょうすけ', base_amount: 0, settlement_cycle: 'monthly' });
    expect(result.valid).toBe(true);
  });

  it('base_amount=小数は無効', () => {
    const result = validateExpenseMaster({ name: 'テスト', payer: 'りょうすけ', base_amount: 1.5, settlement_cycle: 'monthly' });
    expect(result.valid).toBe(false);
  });

  it('base_amount=NaNは無効', () => {
    const result = validateExpenseMaster({ name: 'テスト', payer: 'りょうすけ', base_amount: NaN, settlement_cycle: 'monthly' });
    expect(result.valid).toBe(false);
  });
});

describe('Edge Case: validateTemporaryExpense year_month format', () => {
  it('YYYY-MM形式以外は無効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-01', year_month: '2026-7' }).valid).toBe(false);
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-01', year_month: '202607' }).valid).toBe(false);
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-01', year_month: '2026/07' }).valid).toBe(false);
  });

  it('YYYY-MM形式は有効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-15', year_month: '2026-07' }).valid).toBe(true);
  });
});

describe('validateTemporaryExpense expense_date', () => {
  it('expense_dateが無いと無効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100 }).valid).toBe(false);
  });
  it('YYYY-MM-DD形式以外は無効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07' }).valid).toBe(false);
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026/07/15' }).valid).toBe(false);
  });
  it('expense_dateのみ（year_month省略）でも有効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-15' }).valid).toBe(true);
  });
  it('year_monthとexpense_dateの月が一致しないと無効', () => {
    expect(validateTemporaryExpense({ title: 'a', payer: 'b', amount: 100, expense_date: '2026-07-15', year_month: '2026-08' }).valid).toBe(false);
  });
});

describe('yearMonthFromDate / lastDayOfMonth', () => {
  it('yearMonthFromDateは日付から年月を取り出す', () => {
    expect(yearMonthFromDate('2026-07-15')).toBe('2026-07');
    expect(yearMonthFromDate('2026-07')).toBe('');
    expect(yearMonthFromDate('')).toBe('');
  });
  it('lastDayOfMonthは月末日を返す', () => {
    expect(lastDayOfMonth('2026-07')).toBe('2026-07-31');
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2024-02')).toBe('2024-02-29');
    expect(lastDayOfMonth('2026-04')).toBe('2026-04-30');
    expect(lastDayOfMonth('bad')).toBe('');
  });
});

describe('Edge Case: calculateDifferenceSettlement single payer', () => {
  it('1人だけの差額データでもクラッシュしない', () => {
    const expenses = [
      { expense_master_id: 'a', payer: '涼介', planned_amount: 20000, actual_amount: 25000, name: '電気' },
    ];
    const result = calculateDifferenceSettlement(expenses, ['涼介']);
    expect(result.payerDiffs['涼介']).toBe(5000);
    // 1人しかいないのでtransferは生成されない（payers.length < 2）
    expect(result.transfers).toHaveLength(0);
  });
});

describe('Bug check: shouldCreateSettlement with negative amount', () => {
  it('負の金額もtrue（差額精算では負もありえる）', () => {
    expect(shouldCreateSettlement(-1000)).toBe(true);
    expect(shouldCreateSettlement(1000)).toBe(true);
    expect(shouldCreateSettlement(0)).toBe(false);
  });
});

describe('Bug check: canEdit/canDelete edge cases', () => {
  it('settled=undefinedはfalse扱いではなくfalsy', () => {
    // settled === false のみtrue。undefined/null/0はfalseではないので注意
    expect(canEditTemporaryExpense({ settled: undefined })).toBe(false);
    expect(canEditTemporaryExpense({ settled: null })).toBe(false);
    expect(canDeleteTemporaryExpense({ settled: 0 })).toBe(false);
  });
});
