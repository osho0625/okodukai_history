-- ブロックスランキングテーブル
CREATE TABLE IF NOT EXISTS blokus_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  wins INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
