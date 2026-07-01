-- ============================================================
-- リマインダー 繰り返し型(repeat)対応 - ALTER
-- ============================================================
-- Supabase SQL Editorで手動実行してください。
--
-- 変更内容:
--   - type CHECK制約に 'repeat' を追加
--   - repeat_days カラム追加（JSONB、曜日配列 [0-6], 0=日, 1=月, ..., 6=土）
--   - chk_repeat_days 制約（repeat型はrepeat_days必須）
-- ============================================================

-- 1. 既存のtype CHECK制約を削除して再作成
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_type_check;
ALTER TABLE reminders ADD CONSTRAINT reminders_type_check
  CHECK (type IN ('memo', 'event', 'repeat'));

-- 2. repeat_days カラム追加
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS repeat_days JSONB;

-- 3. repeat型はrepeat_days必須
ALTER TABLE reminders ADD CONSTRAINT chk_repeat_days
  CHECK (type != 'repeat' OR (repeat_days IS NOT NULL AND jsonb_typeof(repeat_days) = 'array'));

-- 4. chk_event_date を更新（repeat型もevent_date不要）
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS chk_event_date;
ALTER TABLE reminders ADD CONSTRAINT chk_event_date
  CHECK (type IN ('memo', 'repeat') OR event_date IS NOT NULL);
