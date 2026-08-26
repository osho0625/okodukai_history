-- ============================================================
-- LaQ美術館: テーブル定義SQL
-- ============================================================
-- Supabase SQL Editor にそのまま貼り付けて実行可能。
-- ============================================================

-- ============================================================
-- 1. laq_works テーブル（作品メイン）
-- ============================================================
CREATE TABLE IF NOT EXISTS laq_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT '',
  author TEXT NOT NULL,
  thumbnail_photo_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laq_works DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_laq_works_author ON laq_works (author);
CREATE INDEX IF NOT EXISTS idx_laq_works_created_at ON laq_works (created_at DESC);

-- ============================================================
-- 2. laq_photos テーブル（作品写真）
-- ============================================================
CREATE TABLE IF NOT EXISTS laq_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES laq_works(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laq_photos DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_laq_photos_work_id ON laq_photos (work_id);

-- ============================================================
-- 3. laq_delete_requests テーブル（削除リクエスト）
-- ============================================================
CREATE TABLE IF NOT EXISTS laq_delete_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES laq_works(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laq_delete_requests DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_laq_delete_requests_status ON laq_delete_requests (status);
CREATE INDEX IF NOT EXISTS idx_laq_delete_requests_work_id ON laq_delete_requests (work_id);

-- ============================================================
-- 4. Storage バケット（laq-photos）
-- ============================================================
-- Supabaseダッシュボードの Storage > Create bucket から手動作成:
--   バケット名: laq-photos
--   公開: true
--   ファイルサイズ上限: 5MB
--   許可MIME: image/jpeg, image/png, image/webp, image/heic
