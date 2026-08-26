-- ============================================================
-- LaQ美術館: テーブル定義SQL
-- ============================================================
-- Supabase SQL Editor にそのまま貼り付けて実行可能。
-- 認証不要の家族内部アプリ前提のため RLS は無効化している。
-- ============================================================

-- ============================================================
-- 1. laq_works テーブル（作品メイン）
-- ============================================================
CREATE TABLE IF NOT EXISTS laq_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
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
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laq_delete_requests DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_laq_delete_requests_status ON laq_delete_requests (status);
CREATE INDEX IF NOT EXISTS idx_laq_delete_requests_work_id ON laq_delete_requests (work_id);

-- ============================================================
-- 4. family_albums テーブル（家族アルバム）
-- ============================================================
CREATE TABLE IF NOT EXISTS family_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  date_start DATE,
  date_end DATE,
  added_by TEXT NOT NULL DEFAULT '',
  thumbnail_photo_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE family_albums DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_family_albums_created_at ON family_albums (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_albums_added_by ON family_albums (added_by);

-- ============================================================
-- 5. family_album_photos テーブル（家族アルバム写真）
-- ============================================================
CREATE TABLE IF NOT EXISTS family_album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES family_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  added_by TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE family_album_photos DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_family_album_photos_album_id ON family_album_photos (album_id);

-- ============================================================
-- 6. Storage バケット（laq-photos）
-- ============================================================
-- Supabaseダッシュボードの Storage > Create bucket から手動作成:
--   バケット名: laq-photos
--   公開: true
--   ファイルサイズ上限: 5MB
--   許可MIME: image/jpeg, image/png, image/webp, image/heic

-- ============================================================
-- 7. FK制約追加（テーブル作成後に追加）
-- ============================================================
ALTER TABLE laq_works
  ADD CONSTRAINT fk_laq_works_thumbnail
  FOREIGN KEY (thumbnail_photo_id) REFERENCES laq_photos(id)
  ON DELETE SET NULL;

ALTER TABLE family_albums
  ADD CONSTRAINT fk_family_albums_thumbnail
  FOREIGN KEY (thumbnail_photo_id) REFERENCES family_album_photos(id)
  ON DELETE SET NULL;

-- ============================================================
-- 8. updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laq_works_updated_at
  BEFORE UPDATE ON laq_works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_family_albums_updated_at
  BEFORE UPDATE ON family_albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
