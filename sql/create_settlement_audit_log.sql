-- ============================================================
-- 精算操作ログテーブル
-- ============================================================
-- 月次精算・差額精算における操作履歴を記録する

CREATE TABLE IF NOT EXISTS settlement_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,          -- 操作種別: settlement_confirm, settlement_revert, temp_add, temp_edit, temp_delete, monthly_expense_edit, monthly_expense_add, monthly_expense_delete, actual_amount_edit, monthly_data_generate
  target_type TEXT NOT NULL,     -- 対象種別: monthly_settlement, difference_settlement, temporary_expense, monthly_expense
  target_id UUID,                -- 対象レコードID（任意）
  year_month TEXT,               -- 対象年月
  detail TEXT,                   -- 操作詳細（例: "涼介→めぐみ: 47,553円 確定"）
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS無効
ALTER TABLE settlement_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON settlement_audit_log;
CREATE POLICY "Allow all" ON settlement_audit_log FOR ALL USING (true) WITH CHECK (true);
