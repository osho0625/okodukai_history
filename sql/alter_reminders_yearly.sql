-- ============================================================
-- リマインダー 記念日型(yearly)対応 - ALTER
-- ============================================================
-- Supabase SQL Editorで手動実行してください。
--
-- 変更内容:
--   - type CHECK制約に 'yearly' を追加
--   - chk_event_date を更新（yearly型もevent_date必須）
-- ============================================================

-- 1. type CHECK制約を更新
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_type_check;
ALTER TABLE reminders ADD CONSTRAINT reminders_type_check
  CHECK (type IN ('memo', 'event', 'repeat', 'yearly'));

-- 2. chk_event_date を更新（yearly型もevent_date必須）
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS chk_event_date;
ALTER TABLE reminders ADD CONSTRAINT chk_event_date
  CHECK (type IN ('memo', 'repeat') OR event_date IS NOT NULL);
