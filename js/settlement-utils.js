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
 * @param {object} data - {title, payer, amount, year_month, beneficiaries?, note?}
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
  if (data.beneficiaries && (!Array.isArray(data.beneficiaries) || data.beneficiaries.length === 0)) {
    errors.push('受益者は少なくとも1人選択してください');
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
 * @param {Array} temporaryExpenses - 当月の未精算Temporary_Expense配列 [{payer, amount, beneficiaries?}]
 * @returns {{payerTotals: Object, payerDiffs: Object, householdTotal: number, fairShare: number, transfers: Array}}
 */
function calculateSettlement(monthlyExpenses, temporaryExpenses, payers) {
  // 2人前提: payersが渡された場合はそれを使う、なければデータから推定
  const allPayerSet = new Set(payers || []);
  for (const exp of monthlyExpenses) allPayerSet.add(exp.payer);
  for (const temp of temporaryExpenses) allPayerSet.add(temp.payer);
  const allPayerNames = [...allPayerSet];

  const payerPaid = {}; // 各人が実際に支払った総額
  const payerOwes = {}; // 各人が負担すべき総額

  // 固定費: 各payerの支払いかつ折半対象（両者の負担）
  for (const exp of monthlyExpenses) {
    payerPaid[exp.payer] = (payerPaid[exp.payer] || 0) + exp.planned_amount;
    // 固定費は全員で折半（2人前提）
    const perPerson = Math.floor(exp.planned_amount / allPayerNames.length);
    for (const p of allPayerNames) {
      payerOwes[p] = (payerOwes[p] || 0) + perPerson;
    }
  }

  // 一時立替: payerが実際に支払い、受益者が按分で負担
  for (const temp of temporaryExpenses) {
    const beneficiaries = (temp.beneficiaries && temp.beneficiaries.length > 0) ? temp.beneficiaries : allPayerNames;
    payerPaid[temp.payer] = (payerPaid[temp.payer] || 0) + temp.amount;
    const perPerson = Math.floor(temp.amount / beneficiaries.length);
    for (const b of beneficiaries) {
      payerOwes[b] = (payerOwes[b] || 0) + perPerson;
    }
  }

  // payerTotals = 各人が実際に支払った額（互換性のため残す）
  const payerTotals = {};
  for (const p of allPayerNames) {
    payerPaid[p] = payerPaid[p] || 0;
    payerOwes[p] = payerOwes[p] || 0;
    payerTotals[p] = payerPaid[p];
  }

  const householdTotal = Object.values(payerPaid).reduce((sum, v) => sum + v, 0);
  const fairShare = Math.floor(householdTotal / 2);

  // payerDiffs: fairShare - paid（プラス=支払い不足、マイナス=支払い超過）
  const payerDiffs = {};
  for (const payer of allPayerNames) {
    payerDiffs[payer] = fairShare - payerPaid[payer];
  }

  // transfers: 受益者ベースの計算
  // 各人の net = paid - owes（プラスなら払い過ぎ、マイナスなら払い不足）
  const transfers = [];
  if (allPayerNames.length >= 2) {
    const nets = {};
    for (const p of allPayerNames) {
      nets[p] = payerPaid[p] - payerOwes[p];
    }
    // net < 0 の人が net > 0 の人に支払う
    const sorted = allPayerNames.slice().sort((a, b) => nets[a] - nets[b]);
    const debtor = sorted[0]; // 払い不足
    const creditor = sorted[1]; // 払い超過
    const amount = Math.abs(Math.min(nets[debtor], 0));
    if (amount > 0) {
      transfers.push({ from: debtor, to: creditor, amount });
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
function calculateDifferenceSettlement(monthlyExpenses, payers) {
  // payer別の累積差額
  const allPayers = payers || ['めぐみ', '涼介'];
  const payerDiffs = {};
  for (const p of allPayers) {
    payerDiffs[p] = 0;
  }
  for (const exp of monthlyExpenses) {
    const diff = calculateDifference(exp.actual_amount, exp.planned_amount);
    payerDiffs[exp.payer] = (payerDiffs[exp.payer] || 0) + diff;
  }

  const householdDiffTotal = Object.values(payerDiffs).reduce((sum, v) => sum + v, 0);
  const fairDiff = Math.floor(householdDiffTotal / allPayers.length);

  // transfers: 差額を折半して差し引き
  const transfers = [];
  if (allPayers.length >= 2) {
    const sorted = allPayers.slice().sort((a, b) => payerDiffs[a] - payerDiffs[b]);
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
