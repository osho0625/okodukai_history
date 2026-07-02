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
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS chk_repeat_days;
ALTER TABLE reminders ADD CONSTRAINT chk_repeat_days
  CHECK (type != 'repeat' OR (repeat_days IS NOT NULL AND jsonb_typeof(repeat_days) = 'array'));

-- 4. chk_event_date を更新（repeat型もevent_date不要）
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS chk_event_date;
ALTER TABLE reminders ADD CONSTRAINT chk_event_date
  CHECK (type IN ('memo', 'repeat') OR event_date IS NOT NULL);

-- ============================================================
-- ゴミ出しリマインダー初期データ投入
-- りょうすけに紐づけ
-- 通知曜日 = ゴミの日の「前日」
-- ============================================================

-- 燃えるゴミ = 金(5)・月(1)
INSERT INTO reminders (type, child_id, child_name, message, repeat_days, creator_user_id, creator_role)
VALUES ('repeat', '6ff3a8f1-e3eb-4168-a4c0-b97b5e0b573c', 'りょうすけ', '燃えるゴミの日🗑️', '[5, 1]'::jsonb, 'system', 'admin');

-- プラごみ = 土(6)
INSERT INTO reminders (type, child_id, child_name, message, repeat_days, creator_user_id, creator_role)
VALUES ('repeat', '6ff3a8f1-e3eb-4168-a4c0-b97b5e0b573c', 'りょうすけ', 'プラごみの日♻️', '[6]'::jsonb, 'system', 'admin');

-- ペットボトル・びん・かん = 日(0)
INSERT INTO reminders (type, child_id, child_name, message, repeat_days, creator_user_id, creator_role)
VALUES ('repeat', '6ff3a8f1-e3eb-4168-a4c0-b97b5e0b573c', 'りょうすけ', 'ペットボトル・びん・かんの日🫙', '[0]'::jsonb, 'system', 'admin');
