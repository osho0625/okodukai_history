-- game_settingsにrecipe_categoriesカラムを追加
ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS recipe_categories JSONB DEFAULT '["主菜", "副菜", "汁物", "デザート", "お弁当", "お菓子"]'::jsonb;
