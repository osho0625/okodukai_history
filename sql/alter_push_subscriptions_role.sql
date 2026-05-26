-- push_subscriptions に role カラムを追加
-- admin端末のみにリマインダーPush通知を送るためのフィルタ用
ALTER TABLE push_subscriptions ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- admin→user Push通知用のメッセージキューテーブル
CREATE TABLE push_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_role TEXT NOT NULL DEFAULT 'user' CHECK (target_role IN ('admin', 'user', 'all')),
  target_child_name TEXT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_messages_unsent ON push_messages(sent) WHERE sent = false;
