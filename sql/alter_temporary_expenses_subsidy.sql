-- ============================================================
-- temporary_expenses に補助金対応カラム追加
-- ============================================================
-- expense_type: 'expense'（立替金）/ 'subsidy'（補助金）
-- 補助金の場合: payerが受取人。折半して相手に半額渡す方向で精算。

ALTER TABLE temporary_expenses
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'expense' CHECK (expense_type IN ('expense', 'subsidy'));

COMMENT ON COLUMN temporary_expenses.expense_type IS '種別: expense=立替金, subsidy=補助金（受取人が折半して相手に渡す）';
