-- 今日のサイエンス管理者指定用カラム追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS science_override JSONB DEFAULT NULL;
-- 例: {"date":"2026-06-03","id":"台風ってなに"}
