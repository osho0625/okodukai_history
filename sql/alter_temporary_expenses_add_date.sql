-- ============================================================
-- temporary_expenses に立替日(expense_date)を追加
-- ============================================================
-- 目的:
--   建て替え入力に「日付」を持たせる。
--   既存データは year_month の「月末日」に一括で固定して埋める。
-- 冪等性:
--   IF NOT EXISTS / 既存NULLのみ更新 で複数回実行しても安全。
-- ============================================================

-- 1. カラム追加（NULL許可で追加してから既存データを埋める）
ALTER TABLE temporary_expenses
  ADD COLUMN IF NOT EXISTS expense_date DATE;

-- 2. 既存データを year_month の月末日で一括補完（未設定のものだけ）
--    月初日(YYYY-MM-01) + 1ヶ月 - 1日 = その月の月末日
UPDATE temporary_expenses
SET expense_date = (
      (to_date(year_month || '-01', 'YYYY-MM-DD') + INTERVAL '1 month' - INTERVAL '1 day')::date
    )
WHERE expense_date IS NULL;

-- 3. 以後は必須にする
ALTER TABLE temporary_expenses
  ALTER COLUMN expense_date SET NOT NULL;

-- 4. 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_temporary_expenses_expense_date
  ON temporary_expenses (expense_date);
