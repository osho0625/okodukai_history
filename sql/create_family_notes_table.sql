-- 家族共有メモ帳テーブル
CREATE TABLE IF NOT EXISTS family_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS無効（既存テーブルと同様）
ALTER TABLE family_notes DISABLE ROW LEVEL SECURITY;

-- インデックス
CREATE INDEX idx_family_notes_is_admin ON family_notes (is_admin);
