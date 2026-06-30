-- お手伝いリスト 定型業務テンプレート
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS chore_templates JSONB DEFAULT '[]'::jsonb;
