-- ナースコール機能: テーブル定義
-- 作成日: 2026/06/18

-- ============================================================
-- nurse_calls: 呼び出し履歴
-- ============================================================
CREATE TABLE nurse_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  notification_status TEXT NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'partial', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_nurse_calls_child_id ON nurse_calls(child_id);
CREATE INDEX idx_nurse_calls_created_at ON nurse_calls(created_at DESC);
CREATE INDEX idx_nurse_calls_active ON nurse_calls(status) WHERE status = 'active';

-- ============================================================
-- nurse_call_messages: チャットメッセージ
-- ============================================================
CREATE TABLE nurse_call_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES nurse_calls(id),
  child_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'child')),
  message_text TEXT NOT NULL CHECK (char_length(message_text) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nurse_call_messages_call_id ON nurse_call_messages(call_id);

-- ============================================================
-- device_settings: デバイス状態管理
-- ============================================================
CREATE TABLE device_settings (
  device_id TEXT PRIMARY KEY,
  child_id UUID,
  nurse_call_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- pg_cron: 30分無活動で自動resolve
-- ============================================================
SELECT cron.schedule(
  'auto-resolve-nurse-calls',
  '*/5 * * * *',
  $$
    UPDATE nurse_calls
    SET status = 'resolved'
    WHERE status = 'active'
      AND GREATEST(
        COALESCE(responded_at, created_at),
        created_at,
        COALESCE(
          (SELECT MAX(created_at) FROM nurse_call_messages WHERE call_id = nurse_calls.id),
          created_at
        )
      ) < now() - interval '30 minutes';
  $$
);

-- ============================================================
-- pg_cron: 90日超過メッセージ自動削除
-- ============================================================
SELECT cron.schedule(
  'cleanup-nurse-call-messages',
  '0 3 * * *',
  $$
    DELETE FROM nurse_call_messages
    WHERE created_at < now() - interval '90 days';
  $$
);
