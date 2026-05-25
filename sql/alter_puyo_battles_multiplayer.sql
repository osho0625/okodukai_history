-- puyo_battles テーブル拡張: マルチプレイヤー対応
-- 実行前に既存テーブルが存在することを確認

-- status CHECK制約を拡張（lobby, rotating を追加）
ALTER TABLE puyo_battles DROP CONSTRAINT IF EXISTS puyo_battles_status_check;
ALTER TABLE puyo_battles ADD CONSTRAINT puyo_battles_status_check
  CHECK (status IN ('waiting', 'playing', 'finished', 'lobby', 'rotating'));

-- 新規カラム追加
ALTER TABLE puyo_battles ADD COLUMN IF NOT EXISTS max_players INT DEFAULT 6;
ALTER TABLE puyo_battles ADD COLUMN IF NOT EXISTS spectator_only BOOLEAN DEFAULT false;
ALTER TABLE puyo_battles ADD COLUMN IF NOT EXISTS owner_client_id TEXT;
ALTER TABLE puyo_battles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_puyo_battles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_puyo_battles_updated_at ON puyo_battles;
CREATE TRIGGER trg_puyo_battles_updated_at
  BEFORE UPDATE ON puyo_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_puyo_battles_updated_at();

-- インデックス
CREATE INDEX IF NOT EXISTS idx_puyo_battles_status ON puyo_battles(status);
CREATE INDEX IF NOT EXISTS idx_puyo_battles_updated_at ON puyo_battles(updated_at);
