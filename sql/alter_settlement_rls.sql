-- 家庭内精算機能 - RLS無効化（再実行用）
-- テーブル作成後にRLSエラーが出た場合はこのファイルだけ実行する

ALTER TABLE expense_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_expenses DISABLE ROW LEVEL SECURITY;
