-- ============================================================
-- expense_master に補助金対応カラム追加
-- ============================================================
-- expense_type: 'expense'（固定費）/ 'subsidy'（補助金）
-- 補助金: 受取人(payer)が毎月受給。折半して相手に半額渡す方向で精算。

ALTER TABLE expense_master
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'expense' CHECK (expense_type IN ('expense', 'subsidy'));

COMMENT ON COLUMN expense_master.expense_type IS '種別: expense=固定費, subsidy=補助金（受取人が折半して相手に渡す）';

-- monthly_expenses にも expense_type を追加（マスタからコピー）
ALTER TABLE monthly_expenses
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'expense' CHECK (expense_type IN ('expense', 'subsidy'));
