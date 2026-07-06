# Implementation Plan: 家族レシピ管理機能 (family-recipe)

## Overview

既存のお小遣い手帳PWAに家族レシピ管理機能を追加する。Supabase（PostgreSQL + Storage）にデータを保存し、Vanilla JSでフロントエンドを構築する。ハッシュルーティングで画面切替を行い、JSは7ファイルに責務分割する。

## Tasks

- [ ] 1. データベースとストレージのセットアップ
  - [ ] 1.1 SQLマイグレーションファイル作成（sql/create_recipe_tables.sql）
    - recipes, recipe_ingredients, recipe_steps, recipe_photos, recipe_tags, recipe_favorites, recipe_cook_history, shopping_list, meal_plans の9テーブル作成SQL
    - gin_trgm_opsインデックス、UNIQUE制約、CHECK制約を含む
    - 全テーブルRLS無効化
    - _Requirements: 1.6, 1.9, 2.1, 3.2, 4.5, 5.2, 6.5, 7.4, 8.7_
  - [ ] 1.2 Supabase Storageバケット設定手順をSQLコメントに記載
    - recipe-photosバケット作成（公開アクセス、3MB上限、image/jpeg,png,webp対応）
    - _Requirements: 4.2, 4.3, 4.5_

- [ ] 2. ユーティリティ関数の実装（js/recipe-utils.js）
  - [ ] 2.1 parseQuantity, normalizeTag, isAllergyTag, filterAllergyTags, filterGeneralTags を実装
    - parseQuantity: "300g"→{value:300,unit:"g"}, "適量"→{value:null,unit:null,raw:"適量"}, "1/2個"→{value:0.5,unit:"個"}
    - normalizeTag: trim + lowercase
    - isAllergyTag: "allergy:"プレフィックス判定
    - _Requirements: 6.6, 7.6, 7.7, 13.4, 13.6_
  - [ ]* 2.2 プロパティテスト: parseQuantity解析正確性
    - **Property 18: parseQuantity 解析正確性**
    - **Validates: Requirements 7.6, 7.7**
  - [ ]* 2.3 プロパティテスト: タグ正規化
    - **Property 16: タグ正規化**
    - **Validates: Requirements 6.6**
  - [ ]* 2.4 プロパティテスト: アレルギータグ分離
    - **Property 21: アレルギータグ分離**
    - **Validates: Requirements 13.4, 13.6**
  - [ ] 2.5 validateRecipeForm, validateImageFile を実装
    - validateRecipeForm: published時はtitle必須＋材料1件以上、draft時はtitle不要
    - validateImageFile: MIME type＋サイズ3MBチェック
    - _Requirements: 1.5, 4.2, 4.3, 12.2_
  - [ ]* 2.6 プロパティテスト: レシピフォームバリデーション
    - **Property 1: レシピフォームバリデーション**
    - **Validates: Requirements 1.5, 12.2**
  - [ ]* 2.7 プロパティテスト: 画像アップロードバリデーション
    - **Property 9: 画像アップロードバリデーション**
    - **Validates: Requirements 4.2, 4.3**
  - [ ] 2.8 computeCookStats, getTopRecipes, duplicateRecipeData, recipeCardData, resizeImage を実装
    - computeCookStats: cook_count = レコード数、last_cooked_at = MAX(created_at)
    - getTopRecipes: よく作る(cook_count DESC)/最近作った(last_cooked_at DESC) 上位N件
    - duplicateRecipeData: 写真除外＋title末尾に"のコピー"
    - recipeCardData: レシピカード用データオブジェクト生成
    - resizeImage: Canvas API使用、max 1200px、アスペクト比保持
    - _Requirements: 5.6, 5.7, 9.5, 9.6, 10.2, 10.4, 4.4, 2.2, 4.13_
  - [ ]* 2.9 プロパティテスト: 調理回数・最終日時集計
    - **Property 13: 調理回数・最終日時集計**
    - **Validates: Requirements 5.6**
  - [ ]* 2.10 プロパティテスト: よく作る/最近作ったセクション順序
    - **Property 14: よく作る/最近作ったセクション順序**
    - **Validates: Requirements 5.7, 9.5, 9.6**
  - [ ]* 2.11 プロパティテスト: レシピ複製データ保持
    - **Property 20: レシピ複製データ保持**
    - **Validates: Requirements 10.2, 10.4**
  - [ ]* 2.12 プロパティテスト: レシピカードデータ完全性
    - **Property 3: レシピカードデータ完全性**
    - **Validates: Requirements 2.2, 4.13**

- [ ] 3. 検索ロジックの実装（js/recipe-search.js）
  - [ ] 3.1 matchesTextSearch, sortRecipes, filterByTag, filterVisibleRecipes, filterFavorites, filterExcludeAllergy を実装
    - matchesTextSearch: title/description/category/author/tags部分一致(case-insensitive)
    - sortRecipes: 新しい順/古い順/名前順/お気に入り順/最近作った順
    - filterVisibleRecipes: published全表示 + 自分のdraft/private
    - _Requirements: 2.3, 2.6, 2.7, 6.3, 12.5, 12.6, 12.8, 13.3_
  - [ ]* 3.2 プロパティテスト: テキスト検索部分一致
    - **Property 4: テキスト検索部分一致**
    - **Validates: Requirements 2.3**
  - [ ]* 3.3 プロパティテスト: ソート正確性
    - **Property 5: ソート正確性**
    - **Validates: Requirements 2.6**
  - [ ]* 3.4 プロパティテスト: レシピ可視性ルール
    - **Property 2: レシピ可視性ルール**
    - **Validates: Requirements 2.1, 12.5, 12.6, 12.8**
  - [ ]* 3.5 プロパティテスト: タグフィルタ正確性
    - **Property 15: タグフィルタ正確性**
    - **Validates: Requirements 6.3**
  - [ ]* 3.6 プロパティテスト: お気に入りフィルタ正確性
    - **Property 23: お気に入りフィルタ正確性**
    - **Validates: Requirements 2.7, 9.7**
  - [ ]* 3.7 プロパティテスト: アレルギー除外フィルタ
    - **Property 22: アレルギー除外フィルタ**
    - **Validates: Requirements 13.3**
  - [ ] 3.8 searchByIngredientsLogic, searchFridgeLogic を実装
    - searchByIngredientsLogic: AND/OR検索、部分一致、OR時はマッチ数降順ソート
    - searchFridgeLogic: 不足2品以内、不足率(不足数/全材料数)昇順ソート
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 3.7_
  - [ ]* 3.9 プロパティテスト: 材料検索 AND/OR ロジック
    - **Property 6: 材料検索 AND/OR ロジック**
    - **Validates: Requirements 3.2, 3.4**
  - [ ]* 3.10 プロパティテスト: OR検索一致数順ソート
    - **Property 7: OR検索一致数順ソート**
    - **Validates: Requirements 3.6**
  - [ ]* 3.11 プロパティテスト: 冷蔵庫検索
    - **Property 8: 冷蔵庫検索（不足品数＋不足率ソート）**
    - **Validates: Requirements 3.7**

- [ ] 4. Checkpoint - ユーティリティ＋検索ロジック確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Repository層の実装（js/recipe-api.js）
  - [ ] 5.1 RecipeRepository（getAll, getById, save, delete, getByCategory, getRandom, duplicate）を実装
    - common.jsのclientを使用してSupabaseアクセス
    - getAll: status/sort/limit対応、recipe_photos/recipe_tags/recipe_favoritesをJOIN
    - save: idの有無でINSERT/UPDATE判定、updated_at自動更新
    - delete: CASCADE削除（Storage写真も削除）
    - duplicate: 写真除外、titleに"のコピー"付加
    - _Requirements: 1.6, 1.15, 2.1, 9.2, 10.2_
  - [ ] 5.2 IngredientRepository, TagRepository, PhotoRepository を実装
    - IngredientRepository: saveAll（全削除＋全挿入、sort_order付き）、searchByNames（部分一致）
    - TagRepository: saveAll（正規化済み全削除＋全挿入）、getSuggestions（prefix部分一致）、getAllUnique（allergy:除外）
    - PhotoRepository: upload（Storage＋recipe_photos INSERT）、delete、updateSortOrder
    - _Requirements: 1.2, 1.3, 3.2, 4.5, 4.10, 4.11, 6.4, 6.5_
  - [ ] 5.3 FavoriteRepository, CookHistoryRepository を実装
    - FavoriteRepository: toggle（upsert/delete）、getByUser、getCountsForRecipes
    - CookHistoryRepository: add、getByRecipeId、getStats（count + lastCookedAt一括取得）
    - _Requirements: 5.2, 5.5, 5.6_
  - [ ] 5.4 ShoppingListRepository, MealPlanRepository を実装
    - ShoppingListRepository: getAll（recipes.title JOIN）、addItems、toggleChecked、deleteChecked、deleteItem
    - MealPlanRepository: getByDate、getByDateRange、save（UPSERT）、clearSlot
    - _Requirements: 7.4, 7.8, 7.9, 8.2, 8.6, 8.7_

- [ ] 6. 買い物リストロジックの実装（js/recipe-shopping.js）
  - [ ] 6.1 mergeQuantities, addToShoppingList, loadShoppingList を実装
    - mergeQuantities: 同名＋同単位の数値合算、単位不一致・非数値は別項目
    - addToShoppingList: 選択材料をDB追加
    - loadShoppingList: 取得＋レシピ別グループ化＋mergeQuantities適用
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.10_
  - [ ]* 6.2 プロパティテスト: 買い物リスト数量合算ルール
    - **Property 17: 買い物リスト数量合算ルール**
    - **Validates: Requirements 7.6, 7.7**

- [ ] 7. 献立ロジックの実装（js/recipe-meal-plan.js）
  - [ ] 7.1 loadMealPlan, saveMealPlan を実装
    - loadMealPlan: 指定日の朝・昼・夜取得（recipes JOIN）
    - saveMealPlan: UPSERT（plan_date, meal_type 一意制約）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 8. ルーターの実装（js/recipe-router.js）
  - [ ] 8.1 initRouter, navigateTo, handleRoute, parseRoute を実装
    - hashchangeイベントリスナー登録
    - ルート解析: #list, #detail/{id}, #edit, #edit/{id}, #print/{id}
    - 不正ハッシュ時は#listにフォールバック
    - getCurrentUserName()呼出＋ユーザー名選択フロー管理
    - _Requirements: 11.2_

- [ ] 9. Checkpoint - バックエンド＋ロジック層確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. HTMLページ作成（pages/recipe.html）
  - [ ] 10.1 pages/recipe.html の基本構造作成
    - head（meta viewport, common CSS読み込み, inline style）
    - ナビゲーション（←戻る / 🏠ホーム）
    - タブバー（レシピ / 素材検索 / 献立 / 買い物）
    - 各view用コンテナ（view-list, view-detail, view-edit, view-ingredient-search, view-meal-plan, view-shopping, view-print）
    - script読み込み（common.js, recipe-utils.js, recipe-api.js, recipe-search.js, recipe-shopping.js, recipe-meal-plan.js, recipe-ui.js, recipe-router.js）
    - _Requirements: 11.2, 11.3_

- [ ] 11. UI層の実装（js/recipe-ui.js）— レシピ一覧・詳細
  - [ ] 11.1 レシピ一覧画面（loadRecipeList, renderRecipeCard, loadTopSections）を実装
    - レシピカード: title, thumbnail(sort_order=0), author, cook_time, servings, ⭐, category表示
    - よく作る/お気に入り/最近作ったセクション描画
    - 検索バー＋ソートドロップダウン
    - 🎲ランダムボタン＋カテゴリフィルタ
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 5.7, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [ ] 11.2 レシピ詳細画面（loadRecipeDetail, renderIngredients, renderSteps）を実装
    - 材料リスト・手順リスト（sort_order昇順で番号付与）・写真ギャラリー
    - タグ表示＋タップでフィルタ遷移
    - アレルギー⚠️表示（詳細上部サマリ）
    - アクションバー: ⭐/作った！/複製/🖨️印刷/編集/削除
    - 調理履歴（誰がいつ作ったか）
    - 削除確認ダイアログ
    - _Requirements: 2.4, 4.7, 4.8, 5.1, 5.4, 5.6, 5.8, 6.2, 6.3, 10.1, 1.12, 1.15, 1.16, 13.2, 13.5_
  - [ ]* 11.3 プロパティテスト: ランダムレシピのカテゴリフィルタ
    - **Property 19: ランダムレシピのカテゴリフィルタ**
    - **Validates: Requirements 9.3**

- [ ] 12. UI層の実装（js/recipe-ui.js）— レシピ登録/編集・印刷
  - [ ] 12.1 レシピ登録/編集画面（loadEditForm, addIngredientRow, addStepRow, initDragDrop, saveRecipe）を実装
    - title, description, category(SELECT), cook_time_minutes, servings 入力フィールド
    - 材料: 名前＋分量＋メモ行、「＋材料を追加」大ボタン、ドラッグ並び替え
    - 手順: 説明＋写真、「＋手順を追加」大ボタン、ドラッグ並び替え
    - タグ入力（オートコンプリート）、アレルギーチェックボックス（卵/乳/小麦/えび/かに）
    - 写真アップロード（カメラ/フォトライブラリ、プレビュー、削除、並び替え）
    - 保存ボタン群: 公開保存 / 下書き保存 / 公開・非公開トグル
    - バリデーションエラー表示（フィールド赤ハイライト＋メッセージ）
    - 楽観的更新＋ロールバックパターン
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.13, 1.14, 4.1, 4.6, 4.9, 4.10, 4.11, 4.12, 4.14, 6.1, 6.4, 12.1, 12.2, 12.3, 12.4, 13.1_
  - [ ] 12.2 印刷モード（showPrintView）を実装
    - 1ページ表示、大きい文字、材料と手順を見やすく配置
    - ナビゲーション・非必須UIを非表示
    - ブラウザ印刷ダイアログ自動トリガー
    - _Requirements: 10.5, 10.6, 10.7_

- [ ] 13. UI層の実装（js/recipe-ui.js）— 素材検索・買い物・献立タブ
  - [ ] 13.1 素材検索タブUI（材料入力フィールド、AND/OR切替、冷蔵庫検索モード、検索結果表示）を実装
    - 材料名入力（カンマ/スペース区切り）
    - AND/ORトグルボタン
    - 冷蔵庫検索モードスイッチ
    - 検索結果: レシピカード＋マッチ材料名ハイライト
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [ ] 13.2 買い物リストタブUI（リスト表示、チェックオフ、削除、レシピ別グループ表示）を実装
    - レシピ別グループ化表示
    - チェックオフ（取り消し線表示）
    - 個別削除＋チェック済み一括削除ボタン
    - 「買い物リストに追加」→材料チェックボックスモーダル
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9, 7.10, 7.11_
  - [ ] 13.3 献立タブUI（日付選択、朝・昼・夜グリッド、レシピ選択、表示）を実装
    - 日付ピッカー
    - 朝・昼・夜 × 主菜/副菜/汁物 グリッド表示
    - 各スロットにレシピ選択ドロップダウン
    - 当日献立を目立たせて表示
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14. Checkpoint - 全画面UI統合確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. TOPページ連携とPWA更新
  - [ ] 15.1 index.htmlに🍳アイコン追加
    - 既存アイコン列に `&#x1F373;` アイコンリンクを追加（pages/recipe.htmlへ遷移）
    - _Requirements: 11.1_
  - [ ] 15.2 sw.jsのキャッシュ対象にレシピ関連ファイルを追加
    - pages/recipe.html, js/recipe-*.js をキャッシュリストに追加
    - CACHE_NAMEバージョン +1
  - [ ] 15.3 release-notes.html更新、sw.jsバージョン+1、index.htmlバージョン更新
    - feat(緑)タグで「🍳家族レシピ機能追加」を記載
    - sw.js CACHE_NAME バージョン +1
    - index.html末尾バージョン表示を更新

- [ ] 16. Final checkpoint - 全体動作確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- recipe-utils.js と recipe-search.js の純粋関数を先に実装し、PBTで正確性を検証してからUI統合を行う
- getCurrentUserName() はcommon.jsの既存パターン（push_subscriptions.child_name）で実装
