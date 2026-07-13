-- ============================================================
-- monthly_expenses: 手動追加項目対応（expense_master_id NULLable + name カラム追加）
-- ============================================================

-- expense_master_id を NULL許可に変更（手動追加項目はマスタ紐付けなし）
ALTER TABLE monthly_expenses ALTER COLUMN expense_master_id DROP NOT NULL;

-- 項目名カラム追加（マスタ紐付けがない場合に使用）
ALTER TABLE monthly_expenses ADD COLUMN IF NOT EXISTS name TEXT;

-- UNIQUE制約はexpense_master_idがNULLの場合は適用されないため変更不要
-- (PostgreSQLのUNIQUE INDEXはNULLを重複とみなさない)
