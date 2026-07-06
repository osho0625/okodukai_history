-- temporary_expenses に beneficiaries カラム追加
-- 受益者（誰の分を立て替えたか）。デフォルトは両名。
ALTER TABLE temporary_expenses
  ADD COLUMN IF NOT EXISTS beneficiaries TEXT[] NOT NULL DEFAULT ARRAY['めぐみ','涼介'];
