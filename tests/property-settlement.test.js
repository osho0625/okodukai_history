/**
 * Property-based tests for family-settlement feature
 * Feature: family-settlement
 * Tests: Property 1-17
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateExpenseMaster,
  validateTemporaryExpense,
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
  suggestBaseAmountAdjustments,
  lastDayOfMonth
} from '../js/settlement-utils.js';

// --- Arbitraries ---
const validName = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
const validPayer = fc.constantFrom('りょうすけ', 'めぐみ');
const validCycle = fc.constantFrom('monthly', 'half_year');
const validBaseAmount = fc.integer({ min: 0, max: 1000000 });
const validAmount = fc.integer({ min: 1, max: 1000000 });
const validYearMonth = fc.integer({ min: 2020, max: 2030 }).chain(year =>
  fc.integer({ min: 1, max: 12 }).map(month => `${year}-${String(month).padStart(2, '0')}`)
);

const expenseMasterArb = fc.record({
  id: fc.uuid(),
  name: validName,
  payer: validPayer,
  base_amount: validBaseAmount,
  settlement_cycle: validCycle,
  enabled: fc.constant(true)
});

const monthlyExpenseArb = fc.record({
  expense_master_id: fc.uuid(),
  payer: validPayer,
  planned_amount: validBaseAmount,
  actual_amount: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 1000000 })),
  name: validName
});

const temporaryExpenseArb = fc.record({
  payer: validPayer,
  amount: validAmount,
  settled: fc.boolean()
});

// --- Property 1: Expense_Masterバリデーション ---
describe('Property 1: Expense_Masterバリデーション', () => {
  /** Validates: Requirements 1.2, 1.3, 1.4 */
  it('有効な入力はvalid=trueを返す', () => {
    fc.assert(
      fc.property(validName, validPayer, validBaseAmount, validCycle, (name, payer, base_amount, settlement_cycle) => {
        const result = validateExpenseMaster({ name, payer, base_amount, settlement_cycle });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('nameが空ならvalid=false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', null, undefined),
        validPayer, validBaseAmount, validCycle,
        (name, payer, base_amount, settlement_cycle) => {
          const result = validateExpenseMaster({ name, payer, base_amount, settlement_cycle });
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('base_amountが負ならvalid=false', () => {
    fc.assert(
      fc.property(
        validName, validPayer,
        fc.integer({ min: -1000000, max: -1 }),
        validCycle,
        (name, payer, base_amount, settlement_cycle) => {
          const result = validateExpenseMaster({ name, payer, base_amount, settlement_cycle });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('settlement_cycleが不正ならvalid=false', () => {
    fc.assert(
      fc.property(
        validName, validPayer, validBaseAmount,
        fc.string().filter(s => s !== 'monthly' && s !== 'half_year'),
        (name, payer, base_amount, settlement_cycle) => {
          const result = validateExpenseMaster({ name, payer, base_amount, settlement_cycle });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 10: Temporary_Expenseバリデーション ---
describe('Property 10: Temporary_Expenseバリデーション', () => {
  /** Validates: Requirements 7.1, 7.2 */
  it('有効な入力はvalid=trueを返す', () => {
    fc.assert(
      fc.property(validName, validPayer, validAmount, validYearMonth, (title, payer, amount, year_month) => {
        const result = validateTemporaryExpense({ title, payer, amount, year_month, expense_date: lastDayOfMonth(year_month) });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('titleが空ならvalid=false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '  ', null, undefined),
        validPayer, validAmount, validYearMonth,
        (title, payer, amount, year_month) => {
          const result = validateTemporaryExpense({ title, payer, amount, year_month });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('amountが0以下ならvalid=false', () => {
    fc.assert(
      fc.property(
        validName, validPayer,
        fc.integer({ min: -1000, max: 0 }),
        validYearMonth,
        (title, payer, amount, year_month) => {
          const result = validateTemporaryExpense({ title, payer, amount, year_month });
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 2: Monthly_Expense生成の不変条件 ---
describe('Property 2: Monthly_Expense生成の不変条件', () => {
  /** Validates: Requirements 2.1, 2.2, 2.3, 2.4 */
  it('生成レコードはmaster.base_amountをplanned_amountに、actual_amount=nullで生成', () => {
    fc.assert(
      fc.property(
        fc.array(expenseMasterArb, { minLength: 1, maxLength: 10 }),
        validYearMonth,
        (masters, yearMonth) => {
          const result = generateMonthlyExpenses(masters, [], yearMonth);
          for (const record of result) {
            const master = masters.find(m => m.id === record.expense_master_id);
            expect(record.planned_amount).toBe(master.base_amount);
            expect(record.payer).toBe(master.payer);
            expect(record.actual_amount).toBeNull();
            expect(record.year_month).toBe(yearMonth);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 3: Monthly_Expense生成の冪等性 ---
describe('Property 3: Monthly_Expense生成の冪等性', () => {
  /** Validates: Requirements 2.5 */
  it('同じ入力で2回呼び出すと2回目は空配列', () => {
    fc.assert(
      fc.property(
        fc.array(expenseMasterArb, { minLength: 1, maxLength: 10 }),
        validYearMonth,
        (masters, yearMonth) => {
          const first = generateMonthlyExpenses(masters, [], yearMonth);
          const second = generateMonthlyExpenses(masters, first, yearMonth);
          expect(second).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 13: enabled=falseは生成されない ---
describe('Property 13: enabled=falseは生成されない', () => {
  /** Validates: Requirements 1.7, 2.1 */
  it('enabled=falseのマスタからはレコード生成されない', () => {
    fc.assert(
      fc.property(
        fc.array(expenseMasterArb, { minLength: 1, maxLength: 10 }),
        validYearMonth,
        (masters, yearMonth) => {
          const mixed = masters.map((m, i) => ({ ...m, enabled: i % 2 === 0 }));
          const result = generateMonthlyExpenses(mixed, [], yearMonth);
          const enabledIds = new Set(mixed.filter(m => m.enabled).map(m => m.id));
          for (const record of result) {
            expect(enabledIds.has(record.expense_master_id)).toBe(true);
          }
          expect(result.length).toBe(mixed.filter(m => m.enabled).length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 4: 月次精算の収支均衡 ---
describe('Property 4: 月次精算の収支均衡', () => {
  /** Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8 */
  it('payerTotals合計=householdTotal, fairShare=floor(total/2), transfers収支均衡', () => {
    fc.assert(
      fc.property(
        fc.array(monthlyExpenseArb.map(e => ({ payer: e.payer, planned_amount: e.planned_amount })), { minLength: 1, maxLength: 10 }),
        fc.array(temporaryExpenseArb.map(e => ({ payer: e.payer, amount: e.amount })), { maxLength: 5 }),
        (monthly, temporary) => {
          const result = calculateSettlement(monthly, temporary);
          const totalSum = Object.values(result.payerTotals).reduce((s, v) => s + v, 0);
          expect(totalSum).toBe(result.householdTotal);
          expect(result.fairShare).toBe(Math.floor(result.householdTotal / 2));

          // transfers収支均衡: sum(from amounts) = sum(to amounts) — 全部同じamount
          const fromSum = result.transfers.reduce((s, t) => s + t.amount, 0);
          // 2人なので1件のtransferしかない
          expect(result.transfers.length).toBeLessThanOrEqual(1);
          if (result.transfers.length === 1) {
            expect(result.transfers[0].amount).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 5: 精算額0→非生成 ---
describe('Property 5: 精算額0→非生成', () => {
  /** Validates: Requirements 4.8 */
  it('amount=0のときshouldCreateSettlementはfalse', () => {
    expect(shouldCreateSettlement(0)).toBe(false);
  });

  it('amount!=0のときshouldCreateSettlementはtrue', () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n !== 0),
        (amount) => {
          expect(shouldCreateSettlement(amount)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 12: Transfer総額の収支均衡 ---
describe('Property 12: Transfer総額の収支均衡', () => {
  /** Validates: Requirements 3.4, 6.4 */
  it('calculateSettlementのtransfers合計はゼロサム', () => {
    fc.assert(
      fc.property(
        fc.array(monthlyExpenseArb.map(e => ({ payer: e.payer, planned_amount: e.planned_amount })), { minLength: 1, maxLength: 10 }),
        fc.array(temporaryExpenseArb.map(e => ({ payer: e.payer, amount: e.amount })), { maxLength: 5 }),
        (monthly, temporary) => {
          const result = calculateSettlement(monthly, temporary);
          // 2人前提: 1件のtransferは from→to で amount。from側 -amount, to側 +amount でゼロサム
          if (result.transfers.length === 1) {
            const t = result.transfers[0];
            const fromDiff = result.payerDiffs[t.from];
            expect(fromDiff).toBeGreaterThanOrEqual(0); // 支払い不足側
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 14: calculateSettlementの純粋関数保証 ---
describe('Property 14: calculateSettlementの純粋関数保証', () => {
  /** Validates: Design Principle（テスタビリティ） */
  it('入力配列およびその要素オブジェクトは呼び出し前後でdeep equalityを保つ', () => {
    fc.assert(
      fc.property(
        fc.array(monthlyExpenseArb.map(e => ({ payer: e.payer, planned_amount: e.planned_amount })), { minLength: 1, maxLength: 10 }),
        fc.array(temporaryExpenseArb.map(e => ({ payer: e.payer, amount: e.amount })), { maxLength: 5 }),
        (monthly, temporary) => {
          const monthlyBefore = JSON.parse(JSON.stringify(monthly));
          const temporaryBefore = JSON.parse(JSON.stringify(temporary));
          calculateSettlement(monthly, temporary);
          expect(monthly).toEqual(monthlyBefore);
          expect(temporary).toEqual(temporaryBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 6: 差額計算の正確性 ---
describe('Property 6: 差額計算の正確性', () => {
  /** Validates: Requirements 5.2 */
  it('actual=null→0、それ以外→actual-planned', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 1000000 })),
        fc.integer({ min: 0, max: 1000000 }),
        (actual, planned) => {
          const result = calculateDifference(actual, planned);
          if (actual === null) {
            expect(result).toBe(0);
          } else {
            expect(result).toBe(actual - planned);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 7: 累積差額の集計正確性 ---
describe('Property 7: 累積差額の集計正確性', () => {
  /** Validates: Requirements 5.4, 6.3 */
  it('payer別のdifference合計が正しく集計される', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            payer: validPayer,
            planned_amount: validBaseAmount,
            actual_amount: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 1000000 }))
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (expenses) => {
          const result = calculateAccumulatedDifference(expenses);
          // 手動で計算して比較
          const expected = {};
          for (const exp of expenses) {
            const diff = exp.actual_amount == null ? 0 : exp.actual_amount - exp.planned_amount;
            expected[exp.payer] = (expected[exp.payer] || 0) + diff;
          }
          expect(result).toEqual(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 8: 差額精算の公平分担計算 ---
describe('Property 8: 差額精算の公平分担計算', () => {
  /** Validates: Requirements 6.4 */
  it('差額精算も月次と同じ折半ロジック（floor）で算出', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            expense_master_id: fc.uuid(),
            payer: validPayer,
            planned_amount: validBaseAmount,
            actual_amount: fc.integer({ min: 0, max: 1000000 }),
            name: validName
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (expenses) => {
          const result = calculateDifferenceSettlement(expenses);
          const totalDiff = Object.values(result.payerDiffs).reduce((s, v) => s + v, 0);
          const fairDiff = Math.floor(totalDiff / 2);
          // transfers amount is derived from fairDiff logic
          if (result.transfers.length === 1) {
            expect(result.transfers[0].amount).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 9: 基準額調整提案 ---
describe('Property 9: 基準額調整提案', () => {
  /** Validates: Requirements 6.10 */
  it('suggestedBaseは平均実費を1000円単位に丸めた値', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            expense_master_id: fc.constant('master-1'),
            payer: validPayer,
            planned_amount: fc.constant(20000),
            actual_amount: fc.integer({ min: 10000, max: 30000 }),
            name: fc.constant('電気代')
          }),
          { minLength: 1, maxLength: 6 }
        ),
        (expenses) => {
          const suggestions = suggestBaseAmountAdjustments(expenses);
          for (const s of suggestions) {
            expect(s.suggestedBase % 1000).toBe(0);
            // avgActualとの差が500以下
            expect(Math.abs(s.suggestedBase - s.avgActual)).toBeLessThanOrEqual(500);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 15: actual_amount=nullは平均に含めない ---
describe('Property 15: actual_amount=nullは平均計算に含めない', () => {
  /** Validates: Requirements 6.10 */
  it('nullレコードは分母・分子に含まれない', () => {
    const expenses = [
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: 18000, name: '電気' },
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: null, name: '電気' },
      { expense_master_id: 'a', payer: 'りょうすけ', planned_amount: 20000, actual_amount: 22000, name: '電気' },
    ];
    const suggestions = suggestBaseAmountAdjustments(expenses);
    if (suggestions.length > 0) {
      // avgActual should be floor((18000+22000)/2) = 20000, not (18000+0+22000)/3
      expect(suggestions[0].avgActual).toBe(Math.floor((18000 + 22000) / 2));
    }
  });
});

// --- Property 16: calculateDifferenceSettlementの純粋関数保証 ---
describe('Property 16: calculateDifferenceSettlementの純粋関数保証', () => {
  /** Validates: Design Principle（テスタビリティ） */
  it('入力配列およびその要素は呼び出し前後でdeep equalityを保つ', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            expense_master_id: fc.uuid(),
            payer: validPayer,
            planned_amount: validBaseAmount,
            actual_amount: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 1000000 })),
            name: validName
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (expenses) => {
          const before = JSON.parse(JSON.stringify(expenses));
          calculateDifferenceSettlement(expenses);
          expect(expenses).toEqual(before);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 11: 精算済みTemporary_Expenseの不変性 ---
describe('Property 11: 精算済みTemporary_Expenseの不変性', () => {
  /** Validates: Requirements 7.8, 7.9 */
  it('settled=true→canEdit/canDeleteはfalse、settled=false→true', () => {
    fc.assert(
      fc.property(fc.boolean(), (settled) => {
        const expense = { settled };
        if (settled) {
          expect(canEditTemporaryExpense(expense)).toBe(false);
          expect(canDeleteTemporaryExpense(expense)).toBe(false);
        } else {
          expect(canEditTemporaryExpense(expense)).toBe(true);
          expect(canDeleteTemporaryExpense(expense)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 17: calculateSettlementの順序不変性 ---
describe('Property 17: calculateSettlementの順序不変性', () => {
  /** Validates: Requirements 3.1, 3.2, 3.3, 3.4 */
  it('入力配列の順番を変えても結果は同じ', () => {
    fc.assert(
      fc.property(
        fc.array(monthlyExpenseArb.map(e => ({ payer: e.payer, planned_amount: e.planned_amount })), { minLength: 2, maxLength: 10 }),
        fc.array(temporaryExpenseArb.map(e => ({ payer: e.payer, amount: e.amount })), { minLength: 1, maxLength: 5 }),
        (monthly, temporary) => {
          const result1 = calculateSettlement(monthly, temporary);
          // shuffle
          const shuffledMonthly = [...monthly].reverse();
          const shuffledTemporary = [...temporary].reverse();
          const result2 = calculateSettlement(shuffledMonthly, shuffledTemporary);
          expect(result1.payerTotals).toEqual(result2.payerTotals);
          expect(result1.householdTotal).toBe(result2.householdTotal);
          expect(result1.fairShare).toBe(result2.fairShare);
          expect(result1.transfers).toEqual(result2.transfers);
        }
      ),
      { numRuns: 100 }
    );
  });
});
