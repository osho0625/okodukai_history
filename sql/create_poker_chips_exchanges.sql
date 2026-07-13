-- poker_chips_exchanges: チップ交換履歴
-- 作成日: 2026/07/07

CREATE TABLE poker_chips_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  cost INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poker_chips_exchanges_player ON poker_chips_exchanges(player_name, created_at DESC);
