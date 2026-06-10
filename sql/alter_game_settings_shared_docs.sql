-- game_settingsにドキュメント公開管理用カラム追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS shared_docs JSONB DEFAULT '[]'::jsonb;
