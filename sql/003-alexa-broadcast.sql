-- alexa_messages: アプリ→Alexa読み上げ & Alexa→アプリ返事
CREATE TABLE IF NOT EXISTS alexa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL CHECK (direction IN ('to_alexa', 'from_alexa')),
  message TEXT NOT NULL,
  replied BOOLEAN NOT NULL DEFAULT false,
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 未読メッセージ検索用
CREATE INDEX IF NOT EXISTS idx_alexa_messages_pending
  ON alexa_messages (direction, replied, created_at DESC)
  WHERE replied = false;

-- RLS無効（既存テーブルと同様）
ALTER TABLE alexa_messages DISABLE ROW LEVEL SECURITY;
