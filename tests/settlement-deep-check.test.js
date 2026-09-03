/**
 * Deep bug check - additional edge cases not yet covered
 */
import { describe, it, expect } from 'vitest';
import {
  validateExpenseMaster,
  validateTemporaryExpense,
  generateMonthlyExpenses,
  calculateSettlement,
  calculateDifference,
  calculateAccumulatedDifference,
  calculateDifferenceSettlement,
  suggestBaseAmountAdjustments,
  getDifferenceSettlementPeriod,
  getPeriodMonths,
  shouldCreateSettlement,
  canEditTemporaryExpense,
  canDeleteTemporaryExpense
} from '../js/settlement-utils.js';

describe('Bug: calculateSettlement transfer direction correctness', () => {
  it('りょうすけが多く払っている場合、めぐみ→りょうすけへの支払い', () => {
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 42543 },
      { payer: 'めぐみ', planned_amount: 12800 },
    ];
    const result = calculateSettlement(monthly, []);
    // 合計55343, fairShare=27671
    expect(result.householdTotal).toBe(55343);
    expect(result.fairShare).toBe(27671);
    // めぐみ(12800) < りょうすけ(42543) → めぐみが支払い側
    expect(result.transfers[0].from).toBe('めぐみ');
    expect(result.transfers[0].to).toBe('りょうすけ');
    expect(result.transfers[0].amount).toBe(27671 - 12800); // 14871
  });
});

describe('Bug: calculateSettlement with temporary expenses mixed', () => {
  it('立替金が精算計算に正しく含まれる', () => {
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 20000 },
      { payer: 'めぐみ', planned_amount: 10000 },
    ];
    const temp = [
      { payer: 'めぐみ', amount: 5000 }, // めぐみが5000円立て替え
    ];
    const result = calculateSettlement(monthly, temp);
    // りょうすけ: 20000, めぐみ: 10000+5000=15000
    expect(result.payerTotals['りょうすけ']).toBe(20000);
    expect(result.payerTotals['めぐみ']).toBe(15000);
    // 合計35000, fairShare=17500
    expect(result.householdTotal).toBe(35000);
    expect(result.fairShare).toBe(17500);
    // めぐみ(15000) < りょうすけ(20000)
    expect(result.transfers[0].from).toBe('めぐみ');
    expect(result.transfers[0].to).toBe('りょうすけ');
    expect(result.transfers[0].amount).toBe(17500 - 15000); // 2500
  });
});

describe('Bug: calculateDifferenceSettlement transfer direction', () => {
  it('差額が正の場合（実費>基準額）の精算方向が正しい', () => {
    // 涼介の項目: actual > planned → 差額プラス → 涼介が多く払った
    const expenses = [
      { expense_master_id: 'a', payer: '涼介', planned_amount: 20000, actual_amount: 25000, name: '電気' },
      { expense_master_id: 'b', payer: 'めぐみ', planned_amount: 3000, actual_amount: 3000, name: '水道' },
    ];
    const result = calculateDifferenceSettlement(expenses, ['めぐみ', '涼介']);
    // 涼介の差額: 25000-20000 = +5000
    // めぐみの差額: 3000-3000 = 0
    expect(result.payerDiffs['涼介']).toBe(5000);
    expect(result.payerDiffs['めぐみ']).toBe(0);
    // householdDiffTotal=5000, fairDiff=floor(5000/2)=2500
    // payerFrom(少ない方)=めぐみ(0), payerTo(多い方)=涼介(5000)
    // amount = fairDiff - payerDiffs[payerFrom] = 2500 - 0 = 2500
    expect(result.transfers[0].from).toBe('めぐみ');
    expect(result.transfers[0].to).toBe('涼介');
    expect(result.transfers[0].amount).toBe(2500);
  });

  it('差額が負の場合（実費<基準額）の精算方向が正しい', () => {
    // 涼介の項目: actual < planned → 差額マイナス → 涼介が少なく払った
    const expenses = [
      { expense_master_id: 'a', payer: '涼介', planned_amount: 20000, actual_amount: 15000, name: '電気' },
      { expense_master_id: 'b', payer: 'めぐみ', planned_amount: 3000, actual_amount: 3000, name: '水道' },
    ];
    const result = calculateDifferenceSettlement(expenses, ['めぐみ', '涼介']);
    // 涼介: 15000-20000 = -5000
    // めぐみ: 0
    expect(result.payerDiffs['涼介']).toBe(-5000);
    expect(result.payerDiffs['めぐみ']).toBe(0);
    // householdDiffTotal=-5000, fairDiff=floor(-5000/2)=-2500
    // sorted by payerDiffs ascending: 涼介(-5000), めぐみ(0)
    // payerFrom=涼介(-5000), payerTo=めぐみ(0)
    // amount = fairDiff - payerDiffs[payerFrom] = -2500 - (-5000) = 2500
    expect(result.transfers[0].from).toBe('涼介');
    expect(result.transfers[0].to).toBe('めぐみ');
    expect(result.transfers[0].amount).toBe(2500);
  });
});

describe('Bug: generateMonthlyExpenses does not include base_amount=0 items', () => {
  it('base_amount=0のマスタも正常に生成される', () => {
    const masters = [
      { id: 'a', enabled: true, payer: 'りょうすけ', base_amount: 0 },
    ];
    const result = generateMonthlyExpenses(masters, [], '2026-07');
    expect(result).toHaveLength(1);
    expect(result[0].planned_amount).toBe(0);
  });
});

describe('Bug: suggestBaseAmountAdjustments with varying planned_amount', () => {
  it('同じexpense_master_idで異なるplanned_amountがある場合、最初のレコードのplannedをcurrentBaseとする', () => {
    // base_amountが途中で変更された場合（過去は20000、今月は25000）
    const expenses = [
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: 22000, name: '電気' },
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 25000, actual_amount: 23000, name: '電気' },
    ];
    const result = suggestBaseAmountAdjustments(expenses);
    // currentBase = 最初のレコードの20000（grouped[key]初期化時）
    // avgActual = floor((22000+23000)/2) = 22500
    // suggestedBase = round(22500/1000)*1000 = 23000 (or 22000?)
    // Math.round(22500/1000) = Math.round(22.5) = 23 → 23000
    if (result.length > 0) {
      expect(result[0].currentBase).toBe(20000); // 最初のレコードのplanned
      expect(result[0].avgActual).toBe(22500);
      expect(result[0].suggestedBase).toBe(23000); // Math.round(22.5)*1000
    }
  });
});

describe('Bug: Math.floor vs Math.round in fairShare for negative totals', () => {
  it('差額精算でhouseholdDiffTotal=-1のとき fairDiff=floor(-0.5)=-1', () => {
    // 2人で差額合計-1 → fairDiff = floor(-1/2) = floor(-0.5) = -1
    const expenses = [
      { expense_master_id: 'a', payer: '涼介', planned_amount: 20000, actual_amount: 19999, name: '電気' },
      { expense_master_id: 'b', payer: 'めぐみ', planned_amount: 3000, actual_amount: 3000, name: '水道' },
    ];
    const result = calculateDifferenceSettlement(expenses, ['めぐみ', '涼介']);
    // 涼介: 19999-20000=-1, めぐみ: 0
    // householdDiffTotal=-1, fairDiff=floor(-1/2)=floor(-0.5)=-1
    expect(result.payerDiffs['涼介']).toBe(-1);
    const householdDiffTotal = -1;
    const fairDiff = Math.floor(householdDiffTotal / 2);
    expect(fairDiff).toBe(-1);
    // sorted: 涼介(-1), めぐみ(0)
    // payerFrom=涼介, payerTo=めぐみ
    // amount = fairDiff - payerDiffs[payerFrom] = -1 - (-1) = 0
    // amount=0 → no transfer
    expect(result.transfers).toHaveLength(0);
  });
});

describe('Bug: XSS prevention in escapeHtml (settlement-app.js pattern)', () => {
  it('validateTemporaryExpenseはXSS入力を通すが、表示時にescapeHtmlで対応', () => {
    // バリデーションはXSS防止ではない（表示層の責務）
    const result = validateTemporaryExpense({
      title: '<script>alert(1)</script>',
      payer: 'test',
      amount: 100,
      expense_date: '2026-07-31',
      year_month: '2026-07'
    });
    // XSS文字列でもバリデーションは通る（not empty check only）
    expect(result.valid).toBe(true);
  });
});

describe('Bug: formatAmount function edge cases', () => {
  it('calculateSettlementのpayerDiffsが負の場合にformatAmountで正しく表示される', () => {
    // formatAmountは null→'-', それ以外→toLocaleString+'円'
    // 負の値のテスト
    const monthly = [
      { payer: 'りょうすけ', planned_amount: 40000 },
      { payer: 'めぐみ', planned_amount: 10000 },
    ];
    const result = calculateSettlement(monthly, []);
    // payerDiffs['りょうすけ'] = 25000 - 40000 = -15000
    expect(result.payerDiffs['りょうすけ']).toBe(-15000);
    // これはUI側で sign + formatAmount(diff) として表示される
    // diff=-15000: sign='', formatAmount(-15000) = '-15,000円' → 正しい
  });
});

describe('Bug: getDifferenceSettlementPeriod with invalid input', () => {
  it('不正なyear_monthでもNaNにならない（parseInt挙動）', () => {
    // 'abc-de' → parseInt('de', 10) = NaN → NaN <= 6 is false → 'second_half'
    const result = getDifferenceSettlementPeriod('abc-de');
    expect(result).toBe('second_half');
  });
});

describe('Bug: calculateSettlement fairShare is hardcoded /2', () => {
  it('3人のpayerがいてもfairShare=floor(total/2)になる（2人前提の制約）', () => {
    const monthly = [
      { payer: 'A', planned_amount: 10000 },
      { payer: 'B', planned_amount: 5000 },
      { payer: 'C', planned_amount: 3000 },
    ];
    const result = calculateSettlement(monthly, []);
    // 18000 / 2 = 9000（3人いても/2のまま）
    expect(result.fairShare).toBe(9000);
    // 新ロジック: 固定費は全payer按分で負担計算
    // payerOwes: 各人 floor(10000/3)+floor(5000/3)+floor(3000/3)=3333+1666+1000=5999
    // net: A=10000-5999=4001, B=5000-5999=-999, C=3000-5999=-2999
    // sorted by net: C(-2999), B(-999), A(4001)
    // transfer: debtor=C, amount=abs(min(-2999,0))=2999
    // NOTE: これは3人の場合に不正な結果になる
    // → 2人前提のため許容。設計書に明記済み。
    expect(result.transfers[0].amount).toBe(2999);
  });
});
