-- ============================================================
-- 家庭内精算機能 (family-settlement) - 精算取消 RPC Functions
-- ============================================================
-- 確定済み精算を処理前の状態に戻す
-- ============================================================

-- 月次精算取消
-- 1. settlement_history 存在チェック
-- 2. temporary_expenses UPDATE (settled=false) — 対象年月の精算済み立替を戻す
-- 3. settlement_history DELETE
CREATE OR REPLACE FUNCTION revert_monthly_settlement(
  p_settlement_id UUID
) RETURNS VOID AS $$
DECLARE
  v_year_month TEXT;
  v_type TEXT;
BEGIN
  -- 対象レコード取得＆存在チェック
  SELECT target_period, settlement_type INTO v_year_month, v_type
  FROM settlement_history
  WHERE id = p_settlement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Settlement not found: %', p_settlement_id;
  END IF;

  IF v_type != 'monthly' THEN
    RAISE EXCEPTION 'Not a monthly settlement: %', p_settlement_id;
  END IF;

  -- 1. 対象月の settled=true の temporary_expenses を戻す
  UPDATE temporary_expenses
  SET settled = false
  WHERE year_month = v_year_month AND settled = true;

  -- 2. settlement_history を削除
  DELETE FROM settlement_history WHERE id = p_settlement_id;
END;
$$ LANGUAGE plpgsql;

-- 差額精算取消
-- 1. settlement_history 存在チェック
-- 2. monthly_expenses UPDATE (difference_settled=false) — 対象期間のレコードを戻す
-- 3. settlement_history DELETE
CREATE OR REPLACE FUNCTION revert_difference_settlement(
  p_settlement_id UUID
) RETURNS VOID AS $$
DECLARE
  v_target_period TEXT;
  v_type TEXT;
  v_year TEXT;
  v_period TEXT;
  v_start_month INT;
  v_end_month INT;
BEGIN
  -- 対象レコード取得＆存在チェック
  SELECT target_period, settlement_type INTO v_target_period, v_type
  FROM settlement_history
  WHERE id = p_settlement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Settlement not found: %', p_settlement_id;
  END IF;

  IF v_type != 'difference' THEN
    RAISE EXCEPTION 'Not a difference settlement: %', p_settlement_id;
  END IF;

  -- target_period: "2026-H1" or "2026-H2" → 年と期間を分解
  v_year := split_part(v_target_period, '-', 1);
  v_period := split_part(v_target_period, '-', 2);

  IF v_period = 'H1' THEN
    v_start_month := 1;
    v_end_month := 6;
  ELSE
    v_start_month := 7;
    v_end_month := 12;
  END IF;

  -- 1. 対象期間の difference_settled=true の monthly_expenses を戻す
  UPDATE monthly_expenses
  SET difference_settled = false
  WHERE year_month >= v_year || '-' || LPAD(v_start_month::text, 2, '0')
    AND year_month <= v_year || '-' || LPAD(v_end_month::text, 2, '0')
    AND difference_settled = true;

  -- 2. settlement_history を削除
  DELETE FROM settlement_history WHERE id = p_settlement_id;
END;
$$ LANGUAGE plpgsql;
