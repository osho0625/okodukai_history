-- AI採点用APIキーカラムを追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS groq_api_key TEXT;

-- APIキーを設定（実際のキーに置き換えてください）
-- UPDATE game_settings SET gemini_api_key = 'YOUR_GEMINI_KEY', groq_api_key = 'YOUR_GROQ_KEY' WHERE id = 1;
