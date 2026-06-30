-- お手伝い一覧（親が登録するタスクリスト）
CREATE TABLE chore_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points INT NOT NULL DEFAULT 1,
  priority INT NOT NULL DEFAULT 0,
  assign_to TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'archived')),
  done_by TEXT,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS無効（既存テーブルと同様）
ALTER TABLE chore_tasks DISABLE ROW LEVEL SECURITY;

-- インデックス
CREATE INDEX idx_chore_tasks_status ON chore_tasks(status) WHERE status = 'active';
