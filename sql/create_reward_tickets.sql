-- reward_tickets: おやつチケット・お茶チケット（チップ交換所で獲得）
-- 作成日: 2026/07/07

CREATE TABLE reward_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('snack', 'tea')),
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reward_tickets_owner_status ON reward_tickets(owner, status);
ALTER TABLE reward_tickets DISABLE ROW LEVEL SECURITY;
