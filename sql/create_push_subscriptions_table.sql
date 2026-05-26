-- push_subscriptions テーブル
-- Web Push通知のサブスクリプション情報を端末ごとに保存
-- RLS無効（既存テーブルと同様）

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  child_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- device_id で高速検索
CREATE INDEX idx_push_subscriptions_device_id ON push_subscriptions(device_id);
