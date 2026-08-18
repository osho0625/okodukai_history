-- recipe_ingredients に group_label カラムを追加（材料グループ化用: A, B, C...）
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS group_label TEXT DEFAULT '';
