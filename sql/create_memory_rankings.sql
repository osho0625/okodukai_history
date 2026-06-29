-- 神経衰弱ランキングテーブル
CREATE TABLE IF NOT EXISTS memory_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  score INT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- スコア（手数）昇順で取得するためのインデックス
CREATE INDEX IF NOT EXISTS idx_memory_rankings_score ON memory_rankings (difficulty, score ASC);
