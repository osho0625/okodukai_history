# Requirements Document

## Introduction

家族向けレシピ管理機能。クックパッド風のレシピ登録・検索・素材逆引き・買い物リスト・献立・ランダムレシピ機能を提供する。既存のお小遣い手帳PWAアプリ内の1ページとして動作し、Supabaseにデータを保存して家族間で共有する。写真・画像の登録にも対応する。小学生の子供たちも使うため、シンプルで直感的なUI（大きいボタン、ドラッグ並び替え）を心がける。

## Glossary

- **Recipe_App**: 家族レシピ管理機能全体
- **Recipe**: レシピ1件のデータ（タイトル、説明、材料リスト、手順リスト、写真、カテゴリ、調理時間、人数を持つ）
- **Ingredient**: 材料1件のデータ（名前、分量、切り方メモを持つ）。レシピに紐づく
- **Step**: 調理手順1件のデータ（順番、説明文、写真を持つ）。レシピに紐づく
- **Recipe_Photo**: レシピまたは手順に紐づく写真データ。type（完成写真/途中写真/材料写真）で分類。Supabase Storageに保存
- **Ingredient_Search**: 材料名からレシピを逆引きする検索機能
- **Shopping_List**: レシピから材料をチェックして追加する買い物リスト
- **Meal_Plan**: 今日の献立（主菜/副菜/汁物）を登録する機能
- **Tag**: レシピに付与するラベル（#鶏肉 #豚肉 #10分 #子供向け #辛くない #節約 #冷凍OK）

## Requirements

### Requirement 1: レシピ登録

**User Story:** As a family member, I want to レシピを登録できる, so that 家族の料理レシピを保存・共有できる。

#### Acceptance Criteria

1. WHEN a user opens the recipe registration form, THE Recipe_App SHALL display input fields for recipe title, description, category, cook_time_minutes, servings, ingredients, steps, tags, and photos.
2. THE Recipe_App SHALL allow the user to add multiple Ingredient entries, each with a name field, a quantity field, and a memo field (例: 「玉ねぎ」「1玉」「みじん切り」).
3. THE Recipe_App SHALL allow the user to add multiple Step entries with sequential numbering and optional photo attachment per step.
4. THE Recipe_App SHALL display large "＋材料を追加" and "＋手順を追加" buttons suitable for children to tap easily.
5. WHEN the user submits a recipe, THE Recipe_App SHALL validate that title is not empty and at least one Ingredient exists.
6. WHEN validation passes, THE Recipe_App SHALL save the recipe, ingredients, steps, tags, and photos to the Supabase database.
7. THE Recipe_App SHALL record the author name and creation timestamp for each recipe.
8. IF the save operation fails, THEN THE Recipe_App SHALL display an error message and retain the form data.
9. THE Recipe_App SHALL allow selecting a category from predefined options: 主菜, 副菜, 汁物, デザート, お弁当, お菓子.
10. THE Recipe_App SHALL allow selecting cook_time_minutes from predefined options: 5分, 15分, 30分, 60分.
11. THE Recipe_App SHALL allow entering servings as text (例: 2人前, 4人前, 6人前).

### Requirement 2: レシピ編集・削除

**User Story:** As a family member, I want to 登録済みレシピを編集・削除できる, so that レシピ内容を修正したり不要なレシピを整理できる。

#### Acceptance Criteria

1. WHEN a user views a recipe detail, THE Recipe_App SHALL display edit and delete buttons.
2. WHEN the user taps the edit button, THE Recipe_App SHALL display the registration form pre-filled with existing data.
3. THE Recipe_App SHALL allow adding, removing, and reordering Ingredient and Step entries during editing via drag-and-drop.
4. WHEN the user confirms deletion, THE Recipe_App SHALL remove the recipe and all associated ingredients, steps, photos, and tags from the database.
5. THE Recipe_App SHALL display a confirmation dialog before deleting a recipe.
6. THE Recipe_App SHALL support drag-and-drop reordering of ingredients and steps.

### Requirement 3: レシピ一覧・検索

**User Story:** As a family member, I want to 登録されたレシピを一覧表示・検索できる, so that 食べたい料理のレシピをすぐに見つけられる。

#### Acceptance Criteria

1. WHEN a user opens the recipe page, THE Recipe_App SHALL display all recipes as a card list ordered by updated_at descending.
2. THE Recipe_App SHALL display each recipe card with the title, a thumbnail photo (if available), author name, cook_time_minutes, servings, favorite status (⭐), and category.
3. WHEN a user enters text in the search field, THE Recipe_App SHALL filter recipes by partial match (case-insensitive) on title, description, category, and author.
4. WHEN a user taps a recipe card, THE Recipe_App SHALL navigate to the recipe detail view showing all ingredients, steps, and photos.
5. IF no recipes match the search query, THEN THE Recipe_App SHALL display a "レシピが見つかりません" message.
6. THE Recipe_App SHALL provide sort options: 新しい順, 古い順, 名前順, お気に入り順, 最近作った順.
7. THE Recipe_App SHALL allow filtering to show only favorite (⭐) recipes.

### Requirement 4: 素材逆引き検索・冷蔵庫検索

**User Story:** As a family member, I want to 材料名からレシピを検索できる, so that 冷蔵庫にある食材で作れる料理を見つけられる。

#### Acceptance Criteria

1. THE Recipe_App SHALL provide an ingredient search tab separate from the title search.
2. WHEN a user enters one or more ingredient names (comma or space separated), THE Recipe_App SHALL return recipes based on the selected search mode (AND or OR).
3. THE Recipe_App SHALL provide AND/OR toggle for ingredient search: AND mode returns recipes containing all specified ingredients, OR mode returns recipes containing any of the specified ingredients.
4. THE Recipe_App SHALL perform partial match on ingredient names (例: 「玉ねぎ」で「新玉ねぎ」も一致).
5. THE Recipe_App SHALL display search results as recipe cards with matched ingredient names highlighted.
6. WHEN multiple ingredients are specified in OR mode, THE Recipe_App SHALL sort results by the number of matched ingredients descending (多く一致するレシピを上位に表示).
7. THE Recipe_App SHALL provide a "冷蔵庫検索" mode that displays recipes achievable with the specified ingredients, including recipes where only 1-2 additional ingredients are needed (例: 「あと卵だけあれば作れる」).

### Requirement 5: 写真登録

**User Story:** As a family member, I want to レシピに写真を登録できる, so that 完成イメージや調理工程を視覚的に記録できる。

#### Acceptance Criteria

1. THE Recipe_App SHALL allow uploading photos from the device's camera or photo library during recipe registration and editing.
2. THE Recipe_App SHALL accept image files in JPEG, PNG, and WebP formats.
3. THE Recipe_App SHALL compress images to a maximum width of 1200px before uploading to reduce storage usage.
4. THE Recipe_App SHALL store uploaded images in Supabase Storage and save the reference in the recipe_photos table.
5. THE Recipe_App SHALL allow multiple photos per recipe (up to 10 photos).
6. THE Recipe_App SHALL categorize each photo by type: 完成写真, 途中写真, 材料写真.
7. THE Recipe_App SHALL allow attaching a photo to a specific step (step_id reference).
8. WHEN a photo is uploaded, THE Recipe_App SHALL display a thumbnail preview in the form.
9. THE Recipe_App SHALL allow removing uploaded photos during editing.
10. THE Recipe_App SHALL allow reordering photos via sort_order.
11. THE Recipe_App SHALL allow adding an optional caption to each photo.
12. IF the upload fails, THEN THE Recipe_App SHALL display an error message and allow the user to retry.

### Requirement 6: お気に入り・調理記録

**User Story:** As a family member, I want to お気に入りレシピをマークし調理回数を記録できる, so that よく作る料理や最近作ってない料理が分かる。

#### Acceptance Criteria

1. THE Recipe_App SHALL display a ⭐ toggle button on each recipe detail and recipe card.
2. WHEN the user taps the ⭐ button, THE Recipe_App SHALL toggle the favorite status of the recipe.
3. THE Recipe_App SHALL provide a "作った！" button on the recipe detail view.
4. WHEN the user taps "作った！", THE Recipe_App SHALL update last_cooked_at to current timestamp and increment cook_count by 1.
5. THE Recipe_App SHALL display cook_count and last_cooked_at on the recipe detail view.
6. THE Recipe_App SHALL display a "よく作る" section on the top page showing recipes sorted by cook_count descending.

### Requirement 7: タグ

**User Story:** As a family member, I want to レシピにタグを付けられる, so that 食材や特徴で素早くレシピを絞り込める。

#### Acceptance Criteria

1. THE Recipe_App SHALL allow adding multiple tags to a recipe during registration and editing (例: #鶏肉 #豚肉 #10分 #子供向け #辛くない #節約 #冷凍OK).
2. THE Recipe_App SHALL display tags on the recipe detail view and recipe card.
3. WHEN a user taps a tag, THE Recipe_App SHALL filter the recipe list to show only recipes with that tag.
4. THE Recipe_App SHALL provide tag autocomplete suggestions based on existing tags in the database.
5. THE Recipe_App SHALL store tags in a separate recipe_tags table for efficient querying.

### Requirement 8: 買い物リスト

**User Story:** As a family member, I want to レシピから材料を買い物リストに追加できる, so that 必要な材料を忘れずに買い物できる。

#### Acceptance Criteria

1. THE Recipe_App SHALL provide a "買い物リストに追加" button on the recipe detail view.
2. WHEN the user taps "買い物リストに追加", THE Recipe_App SHALL display a checklist of all ingredients in that recipe with checkboxes.
3. THE Recipe_App SHALL allow the user to select specific ingredients to add to the shopping list.
4. THE Recipe_App SHALL maintain a persistent shopping list accessible from the recipe top page.
5. THE Recipe_App SHALL display shopping list items with ingredient name and quantity.
6. THE Recipe_App SHALL allow checking off items as purchased (strikethrough display).
7. THE Recipe_App SHALL allow removing individual items or clearing all checked items from the shopping list.
8. THE Recipe_App SHALL group shopping list items by recipe name for clarity.

### Requirement 9: 献立

**User Story:** As a family member, I want to 今日の献立を登録できる, so that 主菜・副菜・汁物の組み合わせを計画できる。

#### Acceptance Criteria

1. THE Recipe_App SHALL provide a "献立" tab/section on the recipe page.
2. THE Recipe_App SHALL allow registering a meal plan for a specific date with slots for 主菜, 副菜, and 汁物.
3. THE Recipe_App SHALL allow selecting recipes from the registered recipe list for each slot.
4. THE Recipe_App SHALL display the current day's meal plan prominently.
5. THE Recipe_App SHALL allow viewing past meal plans by date.
6. THE Recipe_App SHALL allow clearing or changing individual slots in a meal plan.

### Requirement 10: ランダムレシピ

**User Story:** As a family member, I want to ランダムにレシピを表示できる, so that 今日何作るか迷った時にアイデアを得られる。

#### Acceptance Criteria

1. THE Recipe_App SHALL display a 🎲 button on the recipe top page.
2. WHEN the user taps the 🎲 button, THE Recipe_App SHALL select and display a random recipe from the database.
3. THE Recipe_App SHALL allow filtering the random selection by category (主菜のみ, etc.) before tapping 🎲.
4. THE Recipe_App SHALL display the randomly selected recipe as a card with a "もう一回" button to re-roll.

### Requirement 11: よく作る・人気レシピ表示

**User Story:** As a family member, I want to よく作るレシピや人気レシピをTOP表示できる, so that 頻繁に使うレシピにすぐアクセスできる。

#### Acceptance Criteria

1. THE Recipe_App SHALL display a "よく作る" section at the top of the recipe list page.
2. THE Recipe_App SHALL populate "よく作る" with recipes sorted by cook_count descending (top 5).
3. THE Recipe_App SHALL display a "最近作った" section showing recipes sorted by last_cooked_at descending (top 5).
4. THE Recipe_App SHALL display a "お気に入り" section showing all recipes where favorite is true.

### Requirement 12: レシピ複製

**User Story:** As a family member, I want to 既存レシピを複製して新レシピを作れる, so that 似たレシピのバリエーションを簡単に作れる。

#### Acceptance Criteria

1. THE Recipe_App SHALL display a "複製" button on the recipe detail view.
2. WHEN the user taps "複製", THE Recipe_App SHALL create a new recipe pre-filled with all data from the original recipe (title with "のコピー" suffix, ingredients, steps, tags, category, cook_time, servings).
3. THE Recipe_App SHALL open the duplicated recipe in edit mode for the user to modify before saving.
4. THE Recipe_App SHALL NOT copy photos to the duplicated recipe (user must re-upload if needed).

### Requirement 13: 印刷モード

**User Story:** As a family member, I want to レシピを印刷用に表示できる, so that キッチンで紙を見ながら料理できる。

#### Acceptance Criteria

1. THE Recipe_App SHALL display a "🖨️ 印刷" button on the recipe detail view.
2. WHEN the user taps "🖨️ 印刷", THE Recipe_App SHALL display the recipe in a printer-friendly layout (1ページ表示、大きい文字、材料と手順を見やすく配置).
3. THE Recipe_App SHALL trigger the browser print dialog automatically in print mode.
4. THE Recipe_App SHALL hide navigation elements and non-essential UI in print mode.

### Requirement 14: アクセス制御

**User Story:** As a system operator, I want to お小遣い手帳ユーザーだけがレシピ機能にアクセスできる, so that レシピが家族以外に公開されない。

#### Acceptance Criteria

1. THE Recipe_App SHALL be accessible from the TOP page (index.html) via a 🍳 icon link.
2. THE Recipe_App SHALL function as a page within the existing PWA (pages/recipe.html).
3. THE Recipe_App SHALL use the same Supabase client configuration as other pages in the app.
4. THE Recipe_App SHALL not require additional authentication beyond the existing app access (GitHub Pages + Supabase).


## Database Schema

```sql
-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author TEXT NOT NULL,
  category TEXT DEFAULT '',
  cook_time_minutes INT,
  servings TEXT DEFAULT '',
  favorite BOOLEAN NOT NULL DEFAULT false,
  last_cooked_at TIMESTAMPTZ,
  cook_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipes_title ON recipes USING gin (title gin_trgm_ops);
CREATE INDEX idx_recipes_description ON recipes USING gin (description gin_trgm_ops);
CREATE INDEX idx_recipes_updated_at ON recipes (updated_at DESC);
CREATE INDEX idx_recipes_category ON recipes (category);
CREATE INDEX idx_recipes_favorite ON recipes (favorite) WHERE favorite = true;
CREATE INDEX idx_recipes_cook_count ON recipes (cook_count DESC);
CREATE INDEX idx_recipes_last_cooked_at ON recipes (last_cooked_at DESC NULLS LAST);

-- 写真テーブル（recipe_photos として独立）
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

-- 手順テーブル
CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE recipe_steps DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps (recipe_id);

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

-- 献立テーブル
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  main_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  side_dish_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  soup_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE meal_plans DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_meal_plans_date ON meal_plans (plan_date);
```

## Supabase Storage

```
-- バケット: recipe-photos
-- パス: {recipe_id}/{filename}
-- 公開アクセス: true（URLを知っている人はアクセス可能）
-- ファイルサイズ上限: 5MB
-- 対応形式: image/jpeg, image/png, image/webp
```

## Screens (画面一覧)

| 画面 | パス | 説明 |
|------|------|------|
| レシピ一覧 | pages/recipe.html | レシピカード一覧（よく作る/お気に入り/最近作ったセクション）、検索、素材逆引き、献立、買い物リストのタブ切替 |
| レシピ詳細 | pages/recipe.html#detail | レシピの材料・手順・写真・タグ表示、お気に入り⭐・作った！ボタン・複製・印刷 |
| レシピ登録/編集 | pages/recipe.html#edit | レシピ登録・編集フォーム（大きいボタン、ドラッグ並び替え対応） |
| 印刷モード | pages/recipe.html#print | 1ページ印刷用レイアウト |
| TOPアイコン | index.html | 🍳アイコンで recipe.html へ遷移 |

## 関連ファイル

- #[[file:pages/recipe.html]]
- #[[file:js/recipe.js]]
- #[[file:sql/create_recipe_tables.sql]]
