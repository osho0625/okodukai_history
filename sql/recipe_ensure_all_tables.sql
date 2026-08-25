-- ============================================================
-- レシピ機能: 全テーブル・カラムの整合性確保SQL
-- ============================================================
-- 途中で保存形式を変更した場合に不足するテーブルやカラムを補完する。
-- 全て IF NOT EXISTS / IF NOT EXISTS 付きなので、既に存在する場合は無視される。
-- Supabase SQL Editor にそのまま貼り付けて実行可能。
-- ============================================================

-- pg_trgm拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. recipes テーブル（メイン）
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT '',
  cook_time_minutes INT,
  servings TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;

-- status カラムが無い古いテーブルへの対応
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_time_minutes INT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS servings TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- インデックス（既存なら無視）
CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON recipes (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes (category);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes (status);

-- ============================================================
-- 2. recipe_ingredients テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '',
  memo TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  group_label TEXT DEFAULT ''
);

ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;

-- 後から追加されたカラム
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS memo TEXT DEFAULT '';
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS group_label TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id);

-- ============================================================
-- 3. recipe_steps テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE recipe_steps DISABLE ROW LEVEL SECURITY;

ALTER TABLE recipe_steps ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps (recipe_id);

-- ============================================================
-- 4. recipe_photos テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_id UUID,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '完成写真',
  sort_order INT NOT NULL DEFAULT 0,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_photos DISABLE ROW LEVEL SECURITY;

ALTER TABLE recipe_photos ADD COLUMN IF NOT EXISTS step_id UUID;
ALTER TABLE recipe_photos ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
ALTER TABLE recipe_photos ADD COLUMN IF NOT EXISTS caption TEXT DEFAULT '';
ALTER TABLE recipe_photos ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT '完成写真';

CREATE INDEX IF NOT EXISTS idx_recipe_photos_recipe_id ON recipe_photos (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_photos_step_id ON recipe_photos (step_id);

-- ============================================================
-- 5. recipe_tags テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

ALTER TABLE recipe_tags DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag ON recipe_tags (tag);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_tags_unique ON recipe_tags (recipe_id, tag);

-- ============================================================
-- 6. recipe_favorites テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_favorites DISABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_favorites_unique ON recipe_favorites (recipe_id, user_name);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user ON recipe_favorites (user_name);

-- ============================================================
-- 7. recipe_cook_history テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_cook_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipe_cook_history DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_recipe_cook_history_recipe_id ON recipe_cook_history (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cook_history_user ON recipe_cook_history (user_name);

-- ============================================================
-- 8. shopping_list テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT DEFAULT '',
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shopping_list DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. meal_plans テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  main_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  side_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  soup_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE meal_plans DISABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_date_type ON meal_plans (plan_date, meal_type);

-- ============================================================
-- 10. game_settings に recipe_categories カラムを追加
-- ============================================================
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS recipe_categories JSONB DEFAULT '["主菜","副菜","汁物","デザート","お弁当","お菓子"]'::jsonb;

-- ============================================================
-- 11. 既存データの正規化: statusがNULLのレシピをpublishedに更新
-- ============================================================
UPDATE recipes SET status = 'published' WHERE status IS NULL;

-- ============================================================
-- 12. Storage バケット（recipe-photos）
-- ============================================================
-- Supabaseダッシュボードの Storage > Create bucket から手動作成してください:
--   バケット名: recipe-photos
--   公開: true
--   ファイルサイズ上限: 3MB
--   許可MIME: image/jpeg, image/png, image/webp
