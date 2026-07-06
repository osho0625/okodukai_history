-- 同月に複数回の月次精算を許可する（精算後の追加立替対応）
DROP INDEX IF EXISTS idx_settlement_history_unique_monthly;

-- RPCの重複チェックも削除した新バージョン
CREATE OR REPLACE FUNCTION execute_monthly_settlement(
  p_year_month TEXT,
  p_payer_from TEXT,
  p_payer_to TEXT,
  p_amount INTEGER,
  p_temporary_expense_ids UUID[] DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_settlement_id UUID;
  v_count INTEGER;
  v_expected INTEGER;
BEGIN
  -- 1. settlement_history を作成
  INSERT INTO settlement_history (target_period, payer_from, payer_to, amount, settlement_type, status)
  VALUES (p_year_month, p_payer_from, p_payer_to, p_amount, 'monthly', 'pending')
  RETURNING id INTO v_settlement_id;

  -- 2. 対象の temporary_expenses を精算済みに（指定IDがある場合のみ件数チェック）
  v_expected := COALESCE(array_length(p_temporary_expense_ids, 1), 0);
  IF v_expected > 0 THEN
    UPDATE temporary_expenses
    SET settled = true
    WHERE id = ANY(p_temporary_expense_ids) AND settled = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count != v_expected THEN
      RAISE EXCEPTION 'temporary_expenses update mismatch: expected %, got % (some may already be settled)', v_expected, v_count;
    END IF;
  END IF;

  RETURN v_settlement_id;
END;
$$ LANGUAGE plpgsql;
