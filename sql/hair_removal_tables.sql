-- 脱毛周期管理: 施術記録テーブル
CREATE TABLE IF NOT EXISTS hair_removal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person TEXT NOT NULL CHECK (person IN ('りょうすけ', 'めぐみ')),
  zone_id TEXT NOT NULL,
  date DATE NOT NULL,
  intensity INT NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  memo TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_hair_removal_person ON hair_removal_records (person);
CREATE INDEX IF NOT EXISTS idx_hair_removal_person_zone ON hair_removal_records (person, zone_id);
CREATE INDEX IF NOT EXISTS idx_hair_removal_person_date ON hair_removal_records (person, date DESC);

-- RLS無効（既存テーブルと同様）
ALTER TABLE hair_removal_records DISABLE ROW LEVEL SECURITY;

-- 脱毛周期管理: 設定テーブル（人物ごと）
CREATE TABLE IF NOT EXISTS hair_removal_settings (
  person TEXT PRIMARY KEY CHECK (person IN ('りょうすけ', 'めぐみ')),
  default_cycle_days INT NOT NULL DEFAULT 30,
  color_threshold_days INT NOT NULL DEFAULT 30,
  zone_cycles JSONB NOT NULL DEFAULT '{}',
  group_cycles JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hair_removal_settings DISABLE ROW LEVEL SECURITY;

-- デフォルト設定を挿入
INSERT INTO hair_removal_settings (person) VALUES ('りょうすけ'), ('めぐみ')
ON CONFLICT (person) DO NOTHING;
