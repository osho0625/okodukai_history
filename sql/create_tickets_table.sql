-- ============================================================
-- あそびチケット (Play Ticket) - tickets テーブル作成
-- ============================================================
-- このSQLファイルはSupabase SQL Editorで手動実行してください。
-- 実行順序: 上から順にすべて実行（トランザクション内で実行推奨）
--
-- 作成されるオブジェクト:
--   - SEQUENCE: tickets_ticket_no_seq（チケット番号の連番採番用）
--   - TABLE: tickets（チケットデータ本体）
--   - CONSTRAINT: chk_used_ticket_consistency（status/used_at整合性）
--   - INDEX: idx_tickets_owner_status, idx_tickets_used_at, idx_tickets_status_ticket_no
-- ============================================================

-- 1. チケット番号用シーケンス
CREATE SEQUENCE tickets_ticket_no_seq;

-- 2. ticketsテーブル本体
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_no BIGINT UNIQUE DEFAULT nextval('tickets_ticket_no_seq'),
  owner TEXT NOT NULL CHECK (owner IN ('かいせい','はるちか','いろは')),
  duration_minutes INT NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- 3. used_at と status の整合性制約
--    unused → used_at は NULL であること
--    used   → used_at は NOT NULL であること
ALTER TABLE tickets ADD CONSTRAINT chk_used_ticket_consistency CHECK (
  (status = 'unused' AND used_at IS NULL)
  OR
  (status = 'used' AND used_at IS NOT NULL)
);

-- 4. シーケンスのオーナーシップ設定（テーブルDROP時にシーケンスも追従削除）
ALTER SEQUENCE tickets_ticket_no_seq OWNED BY tickets.ticket_no;

-- 5. パフォーマンス用インデックス
CREATE INDEX idx_tickets_owner_status ON tickets(owner, status);
CREATE INDEX idx_tickets_used_at ON tickets(used_at DESC);
CREATE INDEX idx_tickets_status_ticket_no ON tickets(status, ticket_no);

-- 6. RLS無効化（既存アプリの方針に合わせる。deviceRole制御のみで統一）
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
