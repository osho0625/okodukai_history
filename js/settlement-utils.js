// settlement-utils.js — 家庭内精算ユーティリティ関数（純粋関数）

/**
 * Expense_Master バリデーション
 * @param {object} data - {name, payer, base_amount, settlement_cycle}
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateExpenseMaster(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('項目名は必須です');
  }
  if (!data.payer || typeof data.payer !== 'string' || data.payer.trim() === '') {
    errors.push('支払担当者は必須です');
  }
  if (data.base_amount == null || !Number.isInteger(data.base_amount) || data.base_amount < 0) {
    errors.push('基準額は0以上の整数で入力してください');
  }
  if (!data.settlement_cycle || !['monthly', 'half_year'].includes(data.settlement_cycle)) {
    errors.push('精算周期は monthly または half_year を選択してください');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Temporary_Expense バリデーション
 * @param {object} data - {title, payer, amount, year_month, note?}
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateTemporaryExpense(data) {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('タイトルは必須です');
  }
  if (!data.payer || typeof data.payer !== 'string' || data.payer.trim() === '') {
    errors.push('支払担当者は必須です');
  }
  if (data.amount == null || !Number.isInteger(data.amount) || data.amount <= 0) {
    errors.push('金額は1以上の整数で入力してください');
  }
  if (!data.year_month || typeof data.year_month !== 'string' || !/^\d{4}-\d{2}$/.test(data.year_month)) {
    errors.push('年月はYYYY-MM形式で入力してください');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Monthly_Expenseレコードを生成（既存レコードと重複しない分のみ）
 * enabled=trueのマスタのみ対象
 * @param {Array} enabledMasters - 有効なExpense_Master配列 [{id, name, payer, base_amount, settlement_cycle}]
 * @param {Array} existingRecords - 既に存在するMonthly_Expense配列 [{expense_master_id, ...}]
 * @param {string} yearMonth - "YYYY-MM"
 * @returns {Array} 新規生成すべきMonthly_Expenseレコード配列
 */
function generateMonthlyExpenses(enabledMasters, existingRecords, yearMonth) {
  const existingMasterIds = new Set(existingRecords.map(r => r.expense_master_id));
  return enabledMasters
    .filter(m => m.enabled !== false && !existingMasterIds.has(m.id))
    .map(m => ({
      year_month: yearMonth,
      expense_master_id: m.id,
      payer: m.payer,
      planned_amount: m.base_amount,
      actual_amount: null
    }));
}

/**
 * 月次精算計算（2人前提）
 * @param {Array} monthlyExpenses - 当月のMonthly_Expense配列 [{payer, planned_amount}]
 * @param {Array} temporaryExpenses - 当月の未精算Temporary_Expense配列 [{payer, amount}]
 * @returns {{payerTotals: Object, payerDiffs: Object, householdTotal: number, fairShare: number, transfers: Array}}
 */
function calculateSettlement(monthlyExpenses, temporaryExpenses) {
  const payerTotals = {};

  // 固定費の基準額を各payerに加算
  for (const exp of monthlyExpenses) {
    payerTotals[exp.payer] = (payerTotals[exp.payer] || 0) + exp.planned_amount;
  }

  // 一時立替金を各payerに加算
  for (const temp of temporaryExpenses) {
    payerTotals[temp.payer] = (payerTotals[temp.payer] || 0) + temp.amount;
  }

  const payers = Object.keys(payerTotals);
  const householdTotal = Object.values(payerTotals).reduce((sum, v) => sum + v, 0);
  const fairShare = Math.floor(householdTotal / 2);

  // payerDiffs: fairShare - total（プラス=支払い不足、マイナス=支払い超過）
  const payerDiffs = {};
  for (const payer of payers) {
    payerDiffs[payer] = fairShare - payerTotals[payer];
  }

  // transfers算出（2人前提）
  const transfers = [];
  const sorted = payers.slice().sort((a, b) => payerTotals[a] - payerTotals[b]);
  if (sorted.length >= 2) {
    const payerFrom = sorted[0]; // 少なく払った人（支払い不足）
    const payerTo = sorted[1];   // 多く払った人（支払い超過）
    const amount = fairShare - payerTotals[payerFrom];
    if (amount > 0) {
      transfers.push({ from: payerFrom, to: payerTo, amount });
    }
  }

  return { payerTotals, payerDiffs, householdTotal, fairShare, transfers };
}

/**
 * Settlement_History作成判定（amount=0なら作成しない）
 * @param {number} amount
 * @returns {boolean}
 */
function shouldCreateSettlement(amount) {
  return amount !== 0;
}

/**
 * Temporary_Expenseの編集可否判定
 * @param {{settled: boolean}} expense
 * @returns {boolean}
 */
function canEditTemporaryExpense(expense) {
  return expense.settled === false;
}

/**
 * Temporary_Expenseの削除可否判定
 * @param {{settled: boolean}} expense
 * @returns {boolean}
 */
function canDeleteTemporaryExpense(expense) {
  return expense.settled === false;
}

/**
 * 差額計算（UI即時表示用）
 * DB側ではGenerated Columnで同じ計算をしている
 * @param {number|null} actualAmount
 * @param {number} plannedAmount
 * @returns {number}
 */
function calculateDifference(actualAmount, plannedAmount) {
  if (actualAmount == null) return 0;
  return actualAmount - plannedAmount;
}

/**
 * 累積差額計算（未精算分の合計、payer別）
 * @param {Array} monthlyExpenses - difference_settled=falseのhalf_yearレコード配列
 * @returns {{[payer: string]: number}}
 */
function calculateAccumulatedDifference(monthlyExpenses) {
  const result = {};
  for (const exp of monthlyExpenses) {
    const diff = calculateDifference(exp.actual_amount, exp.planned_amount);
    result[exp.payer] = (result[exp.payer] || 0) + diff;
  }
  return result;
}

/**
 * year_monthから差額精算期間を判定
 * @param {string} yearMonth - "YYYY-MM"
 * @returns {"first_half" | "second_half"}
 */
function getDifferenceSettlementPeriod(yearMonth) {
  const month = parseInt(yearMonth.split('-')[1], 10);
  return month <= 6 ? 'first_half' : 'second_half';
}

/**
 * 差額精算期間のyear_month範囲を返す
 * @param {number} year
 * @param {"first_half" | "second_half"} period
 * @returns {string[]}
 */
function getPeriodMonths(year, period) {
  const startMonth = period === 'first_half' ? 1 : 7;
  const endMonth = period === 'first_half' ? 6 : 12;
  const months = [];
  for (let m = startMonth; m <= endMonth; m++) {
    months.push(`${year}-${String(m).padStart(2, '0')}`);
  }
  return months;
}

/**
 * 差額精算計算（2人前提）
 * @param {Array} monthlyExpenses - 対象期間のhalf_year & difference_settled=falseレコード
 * @returns {{payerDiffs: Object, transfers: Array, suggestions: Array}}
 */
function calculateDifferenceSettlement(monthlyExpenses) {
  // payer別の累積差額
  const payerDiffs = {};
  for (const exp of monthlyExpenses) {
    const diff = calculateDifference(exp.actual_amount, exp.planned_amount);
    payerDiffs[exp.payer] = (payerDiffs[exp.payer] || 0) + diff;
  }

  const payers = Object.keys(payerDiffs);
  const householdDiffTotal = Object.values(payerDiffs).reduce((sum, v) => sum + v, 0);
  const fairDiff = Math.floor(householdDiffTotal / 2);

  // transfers（月次と同じロジック）
  const transfers = [];
  if (payers.length >= 2) {
    const sorted = payers.slice().sort((a, b) => payerDiffs[a] - payerDiffs[b]);
    const payerFrom = sorted[0];
    const payerTo = sorted[1];
    const amount = fairDiff - payerDiffs[payerFrom];
    if (amount > 0) {
      transfers.push({ from: payerFrom, to: payerTo, amount });
    } else if (amount < 0) {
      transfers.push({ from: payerTo, to: payerFrom, amount: Math.abs(amount) });
    }
  }

  // 基準額調整提案
  const suggestions = suggestBaseAmountAdjustments(monthlyExpenses);

  return { payerDiffs, transfers, suggestions };
}

/**
 * 基準額調整提案を計算
 * actual_amount=nullは平均計算に含めない
 * @param {Array} monthlyExpenses - 対象期間のhalf_yearレコード
 * @returns {Array<{expense_master_id, name, currentBase, suggestedBase, avgActual}>}
 */
function suggestBaseAmountAdjustments(monthlyExpenses) {
  // expense_master_id別にグループ化
  const grouped = {};
  for (const exp of monthlyExpenses) {
    const key = exp.expense_master_id;
    if (!grouped[key]) {
      grouped[key] = { name: exp.name || '', currentBase: exp.planned_amount, records: [] };
    }
    grouped[key].records.push(exp);
  }

  const suggestions = [];
  for (const [masterId, group] of Object.entries(grouped)) {
    const validRecords = group.records.filter(r => r.actual_amount != null);
    if (validRecords.length > 0) {
      const total = validRecords.reduce((sum, r) => sum + r.actual_amount, 0);
      const avgActual = Math.floor(total / validRecords.length);
      const suggestedBase = Math.round(avgActual / 1000) * 1000;
      if (suggestedBase !== group.currentBase) {
        suggestions.push({
          expense_master_id: masterId,
          name: group.name,
          currentBase: group.currentBase,
          suggestedBase,
          avgActual
        });
      }
    }
  }

  return suggestions;
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
    suggestBaseAmountAdjustments
  };
}
