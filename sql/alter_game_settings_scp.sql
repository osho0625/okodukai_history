-- 今日のSCP管理者指定用カラム追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS scp_override JSONB DEFAULT NULL;
-- 例: {"date":"2026-06-04","id":"scp-173"}
