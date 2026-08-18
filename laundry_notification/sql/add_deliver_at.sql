-- push_messages テーブルに deliver_at カラムを追加
-- 既存レコードは created_at = deliver_at として即時配信扱い
ALTER TABLE push_messages
  ADD COLUMN IF NOT EXISTS deliver_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 既存データのdeliver_atをcreated_atに合わせる
UPDATE push_messages SET deliver_at = created_at WHERE deliver_at IS NULL;

-- インデックス更新: 未送信 AND 配信時刻到来済み
DROP INDEX IF EXISTS idx_push_messages_unsent;
CREATE INDEX idx_push_messages_unsent ON push_messages(sent, deliver_at) WHERE sent = false;
