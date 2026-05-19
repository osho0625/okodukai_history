-- ============================================================
-- あそびチケット - 予約制対応マイグレーション
-- ============================================================
-- このSQLファイルはSupabase SQL Editorで手動実行してください。
-- 既存の tickets テーブルに予約機能を追加します。
--
-- 変更内容:
--   - status に 'pending', 'approved' を追加
--   - reserved_at カラム追加（予約日時）
--   - CHECK制約の更新（整合性）
-- ============================================================

-- 1. 既存のCHECK制約を削除
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS chk_used_ticket_consistency;

-- 2. status に pending, approved を追加
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('unused', 'pending', 'approved', 'used'));

-- 3. reserved_at カラム追加（予約日時）
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;

-- 4. 新しい整合性制約
--    unused   → used_at IS NULL, reserved_at IS NULL
--    pending  → used_at IS NULL, reserved_at IS NOT NULL
--    approved → used_at IS NULL, reserved_at IS NOT NULL
--    used     → used_at IS NOT NULL, reserved_at IS NOT NULL
ALTER TABLE tickets ADD CONSTRAINT chk_ticket_status_consistency CHECK (
  (status = 'unused' AND used_at IS NULL AND reserved_at IS NULL)
  OR
  (status = 'pending' AND used_at IS NULL AND reserved_at IS NOT NULL)
  OR
  (status = 'approved' AND used_at IS NULL AND reserved_at IS NOT NULL)
  OR
  (status = 'used' AND used_at IS NOT NULL AND reserved_at IS NOT NULL)
);

-- 5. 予約関連インデックス
CREATE INDEX IF NOT EXISTS idx_tickets_status_reserved ON tickets(status, reserved_at);
