-- ポーカーチップ管理テーブル
CREATE TABLE poker_chips (
  id SERIAL PRIMARY KEY,
  player_name TEXT NOT NULL UNIQUE,
  chips INT NOT NULL DEFAULT 2000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 初期データ
INSERT INTO poker_chips (player_name, chips) VALUES
  ('りょうすけ', 2000),
  ('めぐみ', 2000),
  ('はるちか', 2000),
  ('いろは', 2000),
  ('かいせい', 2000);

-- 履歴テーブル
CREATE TABLE poker_chips_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  amount INT NOT NULL,
  chips_after INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS無効（他テーブルと同様）
ALTER TABLE poker_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE poker_chips_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON poker_chips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON poker_chips_history FOR ALL USING (true) WITH CHECK (true);
