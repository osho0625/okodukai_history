-- ブロックスランキングテーブル
CREATE TABLE IF NOT EXISTS blokus_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  wins INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS有効 + Allow all policy（他のランキングテーブルと同じ）
ALTER TABLE blokus_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON blokus_rankings FOR ALL USING (true) WITH CHECK (true);
