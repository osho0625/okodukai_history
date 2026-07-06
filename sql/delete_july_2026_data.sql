-- 2026年7月の精算データを削除
BEGIN;

-- 精算履歴
DELETE FROM settlement_history WHERE target_period = '2026-07';

-- 一時立替金
DELETE FROM temporary_expenses WHERE year_month = '2026-07';

-- 月次精算データ
DELETE FROM monthly_expenses WHERE year_month = '2026-07';

-- はるちかスマホ代マスタ削除（CASCADE で関連monthly_expensesも消える）
DELETE FROM expense_master WHERE name LIKE '%はるちか%スマホ%';

COMMIT;
