-- ============================================================
-- 家庭内精算機能 (family-settlement) - RPC Functions
-- ============================================================
-- Transaction化された精算確定処理
-- エラー時は自動的にROLLBACKされる
-- ============================================================

-- 月次精算確定
-- 1. 重複実行チェック（Already settled）
-- 2. settlement_history INSERT
-- 3. temporary_expenses UPDATE (settled=true) + ROW_COUNT検証
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
  -- 重複実行チェック
  IF EXISTS (
    SELECT 1 FROM settlement_history
    WHERE target_period = p_year_month AND settlement_type = 'monthly'
  ) THEN
    RAISE EXCEPTION 'Already settled: monthly settlement for % already exists', p_year_month;
  END IF;

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

-- 差額精算確定
-- 1. 重複実行チェック（Already settled）
-- 2. settlement_history INSERT
-- 3. monthly_expenses UPDATE (difference_settled=true) + ROW_COUNT検証
CREATE OR REPLACE FUNCTION execute_difference_settlement(
  p_year TEXT,
  p_period TEXT,  -- 'first_half' | 'second_half'
  p_payer_from TEXT,
  p_payer_to TEXT,
  p_amount INTEGER,
  p_monthly_expense_ids UUID[] DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_settlement_id UUID;
  v_count INTEGER;
  v_expected INTEGER;
  v_target TEXT;
BEGIN
  v_target := p_year || '-' || CASE WHEN p_period = 'first_half' THEN 'H1' ELSE 'H2' END;

  -- 重複実行チェック
  IF EXISTS (
    SELECT 1 FROM settlement_history
    WHERE target_period = v_target AND settlement_type = 'difference'
  ) THEN
    RAISE EXCEPTION 'Already settled: difference settlement for % already exists', v_target;
  END IF;

  -- 1. settlement_history を作成
  INSERT INTO settlement_history (target_period, payer_from, payer_to, amount, settlement_type, settlement_period, status)
  VALUES (v_target, p_payer_from, p_payer_to, p_amount, 'difference', p_period, 'pending')
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
$$ LANGUAGE plpgsql;
