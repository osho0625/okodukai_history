-- ============================================================
-- 家庭内精算機能 (family-settlement) - データベーススキーマ
-- ============================================================
-- 作成順序: expense_master → monthly_expenses → settlement_history → temporary_expenses
-- ============================================================

-- 固定費マスタ
CREATE TABLE IF NOT EXISTS expense_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  payer TEXT NOT NULL,
  base_amount INTEGER NOT NULL DEFAULT 0,
  settlement_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (settlement_cycle IN ('monthly', 'half_year')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expense_master DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_expense_master_enabled ON expense_master (enabled);
CREATE INDEX idx_expense_master_payer ON expense_master (payer);

-- 毎月の精算データ
-- difference は Generated Column: actual_amount未入力(NULL)→0、入力済み→actual-planned
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL,
  expense_master_id UUID NOT NULL REFERENCES expense_master(id) ON DELETE CASCADE,
  payer TEXT NOT NULL,
  planned_amount INTEGER NOT NULL DEFAULT 0,
  actual_amount INTEGER,
  difference INTEGER GENERATED ALWAYS AS (
    CASE WHEN actual_amount IS NULL THEN 0
         ELSE actual_amount - planned_amount
    END
  ) STORED,
  difference_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE monthly_expenses DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_monthly_expenses_unique ON monthly_expenses (year_month, expense_master_id);
CREATE INDEX idx_monthly_expenses_year_month ON monthly_expenses (year_month);
CREATE INDEX idx_monthly_expenses_payer ON monthly_expenses (payer);
CREATE INDEX idx_monthly_expenses_difference_settled ON monthly_expenses (difference_settled) WHERE difference_settled = false;

-- 精算履歴
-- target_period: monthly→'YYYY-MM' (例: 2026-07), difference→'YYYY-H1'/'YYYY-H2' (例: 2026-H1)
CREATE TABLE IF NOT EXISTS settlement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_period TEXT NOT NULL,
  payer_from TEXT NOT NULL,
  payer_to TEXT NOT NULL,
  amount INTEGER NOT NULL,
  settlement_type TEXT NOT NULL DEFAULT 'monthly' CHECK (settlement_type IN ('monthly', 'difference')),
  settlement_period TEXT CHECK (settlement_period IN ('first_half', 'second_half')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  memo TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE settlement_history DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_settlement_history_target_period ON settlement_history (target_period);
CREATE INDEX idx_settlement_history_status ON settlement_history (status);
CREATE INDEX idx_settlement_history_type ON settlement_history (settlement_type);
CREATE UNIQUE INDEX idx_settlement_history_unique_monthly ON settlement_history (target_period, settlement_type) WHERE settlement_type = 'monthly';
CREATE UNIQUE INDEX idx_settlement_history_unique_difference ON settlement_history (target_period, settlement_type) WHERE settlement_type = 'difference';

-- 一時的な立替金
CREATE TABLE IF NOT EXISTS temporary_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  payer TEXT NOT NULL,
  amount INTEGER NOT NULL,
  beneficiaries TEXT[] NOT NULL DEFAULT ARRAY['めぐみ','涼介'],
  year_month TEXT NOT NULL,
  note TEXT,
  settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE temporary_expenses DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_temporary_expenses_year_month ON temporary_expenses (year_month);
CREATE INDEX idx_temporary_expenses_settled ON temporary_expenses (settled) WHERE settled = false;
