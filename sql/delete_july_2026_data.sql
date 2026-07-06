-- 2026年7月・8月の精算データを削除 + 2026-06より前のデータも全削除
BEGIN;

-- 精算履歴（2026-06より前 + 2026-07 + 2026-08）
DELETE FROM settlement_history WHERE target_period < '2026-06' OR target_period IN ('2026-07', '2026-08');

-- 一時立替金
DELETE FROM temporary_expenses WHERE year_month < '2026-06' OR year_month IN ('2026-07', '2026-08');

-- 月次精算データ
DELETE FROM monthly_expenses WHERE year_month < '2026-06' OR year_month IN ('2026-07', '2026-08');

-- はるちかスマホ代マスタ削除（CASCADE で関連monthly_expensesも消える）
DELETE FROM expense_master WHERE name LIKE '%はるちか%スマホ%';

COMMIT;
