-- ============================================================
-- 差額精算確定（月単位版）
-- ============================================================
-- 月次精算の差額精算を月単位で行うためのRPC
-- target_period は YYYY-MM 形式で保存
-- ============================================================

CREATE OR REPLACE FUNCTION execute_difference_settlement_monthly(
  p_year_month TEXT,
  p_payer_from TEXT,
  p_payer_to TEXT,
  p_amount INTEGER,
  p_monthly_expense_ids UUID[] DEFAULT '{}'
) RETURNS UUID AS $
DECLARE
  v_settlement_id UUID;
  v_count INTEGER;
  v_expected INTEGER;
BEGIN
  -- 重複実行チェック
  IF EXISTS (
    SELECT 1 FROM settlement_history
    WHERE target_period = p_year_month AND settlement_type = 'difference'
  ) THEN
    RAISE EXCEPTION 'Already settled: difference settlement for % already exists', p_year_month;
  END IF;

  -- 1. settlement_history を作成
  INSERT INTO settlement_history (target_period, payer_from, payer_to, amount, settlement_type, status)
  VALUES (p_year_month, p_payer_from, p_payer_to, p_amount, 'difference', 'paid')
  RETURNING id INTO v_settlement_id;

  -- 2. 対象の monthly_expenses を差額精算済みに（件数チェック）
  v_expected := COALESCE(array_length(p_monthly_expense_ids, 1), 0);
  IF v_expected > 0 THEN
    UPDATE monthly_expenses
    SET difference_settled = true
    WHERE id = ANY(p_monthly_expense_ids) AND difference_settled = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count != v_expected THEN
      RAISE EXCEPTION 'monthly_expenses update mismatch: expected %, got % (some may already be settled)', v_expected, v_count;
    END IF;
  END IF;

  RETURN v_settlement_id;
END;
$ LANGUAGE plpgsql;
