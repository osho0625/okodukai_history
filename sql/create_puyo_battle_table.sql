-- ぷよぷよ対戦ルーム管理テーブル
CREATE TABLE IF NOT EXISTS puyo_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  player1_name TEXT NOT NULL,
  player2_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  winner TEXT, -- player1_name or player2_name
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- インデックス
CREATE INDEX idx_puyo_battles_room_code ON puyo_battles(room_code);
CREATE INDEX idx_puyo_battles_status ON puyo_battles(status);

-- 古いルームを自動削除（1時間以上前のwaitingルーム）
-- → アプリ側で作成時に古いルームを削除する方式で対応

-- RLS無効（他テーブルと同様）
ALTER TABLE puyo_battles DISABLE ROW LEVEL SECURITY;
