---
inclusion: fileMatch
fileMatchPattern: "*recipe*"
---

# 家族レシピ管理機能

## 概要

クックパッド風の家族向けレシピ管理機能。Supabase（PostgreSQL + Storage）にデータを保存し、家族間で共有する。

- ページ: pages/recipe.html
- JS: js/recipe-router.js, js/recipe-api.js, js/recipe-ui.js, js/recipe-search.js, js/recipe-shopping.js, js/recipe-meal-plan.js, js/recipe-utils.js
- DB: recipes, recipe_ingredients, recipe_steps, recipe_photos, recipe_tags, recipe_favorites, recipe_cook_history, shopping_list, meal_plans (9テーブル)
- Storage: recipe-photos バケット
- SQL: sql/create_recipe_tables.sql, sql/add_ingredient_group_label.sql

## 画面構成（6タブ）

1. レシピ — 一覧（よく作る/お気に入り/最近作った/ランダム/全レシピ）+ 検索 + ソート
2. 素材検索 — 材料逆引き（AND/OR）+ 冷蔵庫検索
3. 献立 — 日付選択 + 朝昼夜 × 主菜/副菜/汁物
4. 買い物 — レシピ別グループ化 + チェックオフ
5. 設定 — メンバー管理、カテゴリ管理、一時保存データ削除
6. 詳細/編集/印刷（ハッシュルーティング: #detail/{id}, #edit/{id}, #print/{id}）

## 主要機能

- レシピ登録/編集/削除（タイトル/説明/カテゴリ/調理時間/人数/材料/手順/写真/タグ/アレルギー）
- 作者選択: 編集フォーム最上部に「だれのレシピ？」ボタン（デフォルト: りょうすけ、めぐみ、いろは + ＋ボタンで追加）
- メンバー管理: localStorage保存（recipe_members）、設定タブで追加/削除
- カテゴリ: localStorage管理（recipe_categories）、デフォルト: 主菜/副菜/汁物/デザート/お弁当/お菓子、設定タブで追加/削除
- 材料統合入力: 材料・調味料を分離せず統一リストで管理。各材料は行分離レイアウト（グループ→材料名→分量→メモ）
- 材料グループ化: ボタンタップでA〜Dグループを選択可能。「なし」で無所属。グループ追加UIで任意のラベルを追加可能（localStorage: recipe_ingredient_groups）
- 材料並べ替え: ドラッグ&ドロップ（PC: ドラッグ、モバイル: ☰タッチドラッグ）で順序変更
- 工程別写真: 各手順に「📷 写真追加」ボタン。保存時にstep_idに紐付けてアップロード。詳細表示では手順の下に表示
- タグ: pill形式UI、既存タグのワンタップ追加
- 保存ボタン: 「保存」（公開）+ 「下書き保存」の2つ
- 自動保存: 新規作成時、入力内容を1秒デバウンスでlocalStorage（recipe_draft_form）に保存。次回起動時に復元
- テキスト検索（タイトル/説明/カテゴリ/作者/タグ）+ 5種ソート（新しい順/古い順/名前順/お気に入り順/最近作った順）
- 素材逆引き検索（AND/OR切替）+ 冷蔵庫検索（不足2品以内、不足率ソート）
- お気に入り（recipe_favorites、ユーザー別独立管理、楽観的更新）
- 調理記録（recipe_cook_history、誰がいつ作ったか）
- 買い物リスト（数量合算/チェックオフ/レシピ別グループ化/個別削除/一括削除）
- 献立（朝/昼/夜 × 主菜/副菜/汁物、UPSERT）
- ランダムレシピ（🎲 + カテゴリフィルタ + もう一回ボタン）
- レシピ複製（タイトル+"のコピー"、写真除く）+ 印刷モード
- 下書き/非公開（authorのみ閲覧可、📝/🔒アイコン）
- アレルギータグ（allergy:プレフィックス、⚠️表示、除外フィルタ）

## Design Principles

- DOM操作はUI層（recipe-ui.js）のみ
- SupabaseアクセスはRepository層（recipe-api.js）経由のみ
- Business LogicはPure Function（recipe-search.js, recipe-utils.js）
- sort_orderのみを表示順の唯一のソース
- 画像は必ず1200px以下へ圧縮してから送信
- 楽観的更新（状態変更後はローカル更新→失敗時ロールバック）
- ファイル間依存: router → ui → api → Supabase（逆方向禁止）
- getCurrentUserName()にtry-catch（DB接続失敗時はnullを返す）
- saveRecipe全体をtry-catchで囲み、エラー時トースト表示
- DB新カラムfallback: group_labelなどの新カラムが未追加の場合、クエリ失敗時に自動でカラム無しのクエリに切り替え

## Repository層（recipe-api.js）

| Repository | 主要メソッド |
|-----------|-------------|
| RecipeRepository | getAll(options), getById(id), save(data), delete(id), getRandom(category), duplicate(id) |
| IngredientRepository | saveAll(recipeId, ingredients), searchByNames(names) |
| StepRepository | saveAll(recipeId, steps) |
| TagRepository | saveAll(recipeId, tags), getSuggestions(prefix) |
| PhotoRepository | upload(params), delete(photoId), updateSortOrder(photoId, sortOrder) |
| FavoriteRepository | getByUser(userName), getCountsForRecipes(recipeIds), toggle(recipeId, userName) |
| CookHistoryRepository | getStats(recipeIds), getByRecipeId(recipeId), add(recipeId, userName) |
| ShoppingListRepository | getAll(), addItems(recipeId, items), toggleChecked(id, checked), deleteChecked(), deleteItem(id) |
| MealPlanRepository | getByDate(date), getByDateRange(start, end), save(date, mealType, slots), clearSlot(id, slotName) |

## DBテーブル

| テーブル | 概要 |
|----------|------|
| recipes | レシピ本体（title, description, author, category, cook_time_minutes, servings, status） |
| recipe_ingredients | 材料（name, quantity, memo, sort_order, group_label） |
| recipe_steps | 手順（description, sort_order） |
| recipe_photos | 写真（url, type, sort_order, caption, step_id） |
| recipe_tags | タグ（tag）UNIQUE(recipe_id, tag) |
| recipe_favorites | お気に入り（user_name）UNIQUE(recipe_id, user_name) |
| recipe_cook_history | 調理履歴（user_name, created_at） |
| shopping_list | 買い物リスト（ingredient_name, quantity, checked, recipe_id ON DELETE SET NULL） |
| meal_plans | 献立（plan_date, meal_type, main_dish_id, side_dish_id, soup_id）UNIQUE(plan_date, meal_type) |

## localStorage キー

| キー | 用途 |
|------|------|
| recipe_members | メンバー一覧（JSON配列） |
| recipe_categories | カテゴリ一覧（JSON配列） |
| recipe_ingredient_groups | 材料グループラベル一覧（JSON配列、デフォルト: ["A","B","C","D"]） |
| recipe_draft_form | 入力途中のフォームデータ（自動保存、保存成功で削除） |

## テスト

- Vitest + fast-check (PBT)
- 11テストファイル、98テスト、23プロパティ
- テスト対象: recipe-utils.js, recipe-search.js の純粋関数
- テスト実行: `npx vitest --run tests/property-recipe-*.js tests/property-ingredient-search.test.js tests/property-image-validation.test.js tests/property-favorite-logic.test.js tests/property-cook-stats.test.js tests/property-tag-logic.test.js tests/property-shopping-merge.test.js tests/property-random-recipe.test.js`
