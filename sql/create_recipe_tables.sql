-- ============================================================
-- 家族レシピ管理機能 - データベーススキーマ
-- ============================================================
-- 作成順序: recipes → recipe_ingredients → recipe_steps → recipe_photos
--           → recipe_tags → recipe_favorites → recipe_cook_history
--           → shopping_list → meal_plans
-- ============================================================

-- pg_trgm拡張を有効化（gin_trgm_opsインデックスに必要）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author TEXT NOT NULL,
  category TEXT DEFAULT '',
  cook_time_minutes INT,
  servings TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipes_title ON recipes USING gin (title gin_trgm_ops);
CREATE INDEX idx_recipes_description ON recipes USING gin (description gin_trgm_ops);
CREATE INDEX idx_recipes_updated_at ON recipes (updated_at DESC);
CREATE INDEX idx_recipes_category ON recipes (category);
CREATE INDEX idx_recipes_status ON recipes (status);

-- 材料テーブル
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '',
  memo TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_name ON recipe_ingredients USING gin (name gin_trgm_ops);

-- 手順テーブル（step_numberは廃止、sort_orderの昇順で画面上に1,2,3...と番号を振る）
CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE recipe_steps DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps (recipe_id);

-- 写真テーブル（recipe_steps の後に定義 ← step_id参照のため）
CREATE TABLE IF NOT EXISTS recipe_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_id UUID REFERENCES recipe_steps(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '完成写真' CHECK (type IN ('完成写真', '途中写真', '材料写真')),
  sort_order INT NOT NULL DEFAULT 0,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_photos DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_photos_recipe_id ON recipe_photos (recipe_id);
CREATE INDEX idx_recipe_photos_step_id ON recipe_photos (step_id);

-- タグテーブル
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

ALTER TABLE recipe_tags DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags (recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags (tag);
CREATE UNIQUE INDEX idx_recipe_tags_unique ON recipe_tags (recipe_id, tag);

-- お気に入りテーブル（ユーザーごと）
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_favorites DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_recipe_favorites_unique ON recipe_favorites (recipe_id, user_name);
CREATE INDEX idx_recipe_favorites_user ON recipe_favorites (user_name);

-- 調理履歴テーブル（ユーザーごと）
CREATE TABLE IF NOT EXISTS recipe_cook_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_cook_history DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_cook_history_recipe_id ON recipe_cook_history (recipe_id);
CREATE INDEX idx_recipe_cook_history_user ON recipe_cook_history (user_name);
CREATE INDEX idx_recipe_cook_history_created_at ON recipe_cook_history (created_at DESC);
CREATE INDEX idx_recipe_cook_history_recipe_created ON recipe_cook_history (recipe_id, created_at DESC);

-- 買い物リストテーブル
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT DEFAULT '',
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shopping_list DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_shopping_list_checked ON shopping_list (checked);

-- 献立テーブル（朝・昼・夜対応）
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('朝', '昼', '夜')),
  main_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  side_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  soup_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE meal_plans DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_meal_plans_date_type ON meal_plans (plan_date, meal_type);

-- ============================================================
-- Supabase Storage バケット設定手順
-- ============================================================
-- 以下はSupabaseダッシュボードまたはSupabase CLIで手動設定する。
--
-- バケット名: recipe-photos
-- 設定:
--   - 公開アクセス (public): true（URLを知っている人はアクセス可能）
--   - ファイルサイズ上限: 3MB (3145728 bytes)
--   - 許可するMIMEタイプ: image/jpeg, image/png, image/webp
--
-- パス構造: {recipe_id}/{uuid}.{ext}
--   例: 550e8400-e29b-41d4-a716-446655440000/a1b2c3d4.jpg
--
-- Supabase SQL でバケット作成する場合:
--   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   VALUES (
--     'recipe-photos',
--     'recipe-photos',
--     true,
--     3145728,
--     ARRAY['image/jpeg', 'image/png', 'image/webp']
--   );
--
-- Storage Policy（全ユーザーに読み取り許可、認証済みユーザーに書き込み許可）:
--   CREATE POLICY "Public read access" ON storage.objects
--     FOR SELECT USING (bucket_id = 'recipe-photos');
--
--   CREATE POLICY "Authenticated upload" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'recipe-photos');
--
--   CREATE POLICY "Authenticated delete" ON storage.objects
--     FOR DELETE USING (bucket_id = 'recipe-photos');
-- ============================================================
