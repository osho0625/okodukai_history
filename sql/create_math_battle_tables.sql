-- 算数オリンピック対戦モード用テーブル

-- 対戦ルーム
CREATE TABLE IF NOT EXISTS math_battle_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  grade TEXT NOT NULL, -- 'grade1', 'grade3', 'grade5'
  problem_ids JSONB NOT NULL DEFAULT '[]', -- 10問のID配列
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- 対戦参加者
CREATE TABLE IF NOT EXISTS math_battle_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES math_battle_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  current_problem_index INT DEFAULT 0,
  total_score INT DEFAULT 0,
  total_elapsed_seconds INT DEFAULT 0,
  finished BOOLEAN DEFAULT FALSE,
  finished_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 対戦中の個別回答
CREATE TABLE IF NOT EXISTS math_battle_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES math_battle_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  problem_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  score INT, -- AI採点結果 0-10
  ai_comment TEXT,
  elapsed_seconds INT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id, problem_id)
);

-- RLS policies (全許可 - 既存パターンに合わせる)
ALTER TABLE math_battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_battle_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_battle_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "math_battle_rooms_all" ON math_battle_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "math_battle_players_all" ON math_battle_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "math_battle_answers_all" ON math_battle_answers FOR ALL USING (true) WITH CHECK (true);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE math_battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE math_battle_players;
ALTER PUBLICATION supabase_realtime ADD TABLE math_battle_answers;
