-- ============================================================
-- リマインダー (Reminder) - reminders テーブル作成
-- ============================================================
-- このSQLファイルはSupabase SQL Editorで手動実行してください。
-- 実行順序: 上から順にすべて実行（トランザクション内で実行推奨）
--
-- 作成されるオブジェクト:
--   - TABLE: reminders（リマインダーデータ本体）
--   - CONSTRAINT: chk_event_date（event型はevent_date必須）
--   - CONSTRAINT: chk_custom_schedule（custom_scheduleはNULLまたはJSON配列）
--   - INDEX: idx_reminders_child_id, idx_reminders_type_event_date, idx_reminders_snooze
-- ============================================================

-- 1. remindersテーブル本体
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('memo', 'event')),
  child_id UUID NOT NULL REFERENCES children(id),
  -- child_name is denormalized. Source of truth is children.name
  child_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 200),
  event_date DATE,
  creator_user_id TEXT NOT NULL,
  creator_role TEXT NOT NULL CHECK (creator_role IN ('admin', 'user')),
  custom_schedule JSONB,
  -- notifications suppressed while current_jst_date < snooze_until
  snooze_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. event型はevent_date必須
ALTER TABLE reminders ADD CONSTRAINT chk_event_date
  CHECK (type = 'memo' OR event_date IS NOT NULL);

-- 3. custom_schedule は NULL または JSON array であること
ALTER TABLE reminders ADD CONSTRAINT chk_custom_schedule
  CHECK (
    custom_schedule IS NULL
    OR jsonb_typeof(custom_schedule) = 'array'
  );

-- 4. パフォーマンス用インデックス
CREATE INDEX idx_reminders_child_id ON reminders(child_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reminders_type_event_date ON reminders(type, event_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_reminders_snooze ON reminders(snooze_until) WHERE deleted_at IS NULL;

-- 5. RLS設定
-- RLS disabled intentionally for consistency with existing app tables
-- TODO: Evaluate RLS before production
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
