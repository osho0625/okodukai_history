-- 対戦モード: 採点異議申し立て（スコア変更リクエスト）テーブル
CREATE TABLE IF NOT EXISTS math_battle_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES math_battle_rooms(id) ON DELETE CASCADE,
  answer_id UUID NOT NULL REFERENCES math_battle_answers(id) ON DELETE CASCADE,
  requester_user_id TEXT NOT NULL,
  requester_user_name TEXT NOT NULL,
  original_score INT NOT NULL,
  proposed_score INT NOT NULL,
  reason TEXT NOT NULL, -- AIチャットの要約
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 承認投票テーブル
CREATE TABLE IF NOT EXISTS math_battle_dispute_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES math_battle_disputes(id) ON DELETE CASCADE,
  voter_user_id TEXT NOT NULL,
  voter_user_name TEXT NOT NULL,
  vote TEXT NOT NULL, -- 'approve' or 'reject'
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispute_id, voter_user_id)
);

-- RLS
ALTER TABLE math_battle_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_battle_dispute_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "math_battle_disputes_all" ON math_battle_disputes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "math_battle_dispute_votes_all" ON math_battle_dispute_votes FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE math_battle_disputes;
ALTER PUBLICATION supabase_realtime ADD TABLE math_battle_dispute_votes;
