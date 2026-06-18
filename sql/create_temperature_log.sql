-- 体温記録テーブル
-- 作成日: 2026/06/18

CREATE TABLE temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name TEXT NOT NULL,
  temperature NUMERIC(3,1) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_id TEXT
);

CREATE INDEX idx_temperature_logs_child ON temperature_logs(child_name);
CREATE INDEX idx_temperature_logs_date ON temperature_logs(measured_at DESC);

-- RLS無効
ALTER TABLE temperature_logs DISABLE ROW LEVEL SECURITY;
