# Implementation Plan: 家族レシピ管理機能 (family-recipe)

## Overview

既存のお小遣い手帳PWAに家族レシピ管理機能を追加する。画面駆動で実装し、早期に画面が動く状態を目指す。Repositoryは必要になった時点でUIと同じタスク内に追加する方式。マイルストーンで区切り、各タスクは1コミットで完結する粒度とする。

実装順序: DB → HTML(空) → Router → 一覧UI → 詳細UI → 編集UI → 検索 → 買い物 → 献立 → 印刷 → PWA

---

## Milestone 1: MVP（レシピを登録して見れる状態）

- [x] 1. データベースセットアップ
  - [x] 1.1 SQLマイグレーションファイル作成（sql/create_recipe_tables.sql）
    - recipes, recipe_ingredients, recipe_steps, recipe_photos, recipe_tags, recipe_favorites, recipe_cook_history, shopping_list, meal_plans の9テーブル作成SQL
    - gin_trgm_opsインデックス、UNIQUE制約、CHECK制約を含む
    - 全テーブルRLS無効化
    - _Requirements: 1.6, 1.9, 2.1, 3.2, 4.5, 5.2, 6.5, 7.4, 8.7_
  - [x] 1.2 Supabase Storageバケット設定手順をSQLコメントに記載
    - recipe-photosバケット作成（公開アクセス、3MB上限、image/jpeg,png,webp対応）
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 2. HTMLページ作成（空の画面構造）
  - [x] 2.1 pages/recipe.html の基本構造作成
    - head（meta viewport, common CSS読み込み, inline style）
    - ナビゲーション（←戻る / 🏠ホーム）
    - タブバー（レシピ / 素材検索 / 献立 / 買い物）
    - 各view用コンテナ（view-list, view-detail, view-edit, view-ingredient-search, view-meal-plan, view-shopping, view-print）
    - 空のコンテナのみ配置（ロジックは後続タスクで実装）
    - script読み込み順序: common.js → recipe-utils.js → recipe-search.js → recipe-api.js → recipe-shopping.js → recipe-meal-plan.js → recipe-ui.js → recipe-router.js
    - _Requirements: 11.2, 11.3_

- [x] 3. ルーターの実装（js/recipe-router.js）
  - [x] 3.1 initRouter, navigateTo, handleRoute, parseRoute を実装
    - hashchangeイベントリスナー登録
    - ルート解析: #list, #detail/{id}, #edit, #edit/{id}, #print/{id}
    - 不正ハッシュ時は#listにフォールバック
    - view-*コンテナの表示/非表示切替
    - _Requirements: 11.2_

- [x] 4. ユーティリティ関数の実装（js/recipe-utils.js）— 一覧・詳細で必要な分
  - [x] 4.1 recipeCardData, computeCookStats, getTopRecipes を実装
    - recipeCardData(recipe): レシピカード用データオブジェクト生成（title, author, category, cook_time_minutes, servings, お気に入り状態, thumbnail URL）
    - computeCookStats(historyRecords): cook_count = レコード数、last_cooked_at = MAX(created_at)
    - getTopRecipes(recipes, stats, mode, limit): よく作る(cook_count DESC)/最近作った(last_cooked_at DESC) 上位N件
    - getCurrentUserName(): common.jsの既存パターンでユーザー名取得
    - _Requirements: 2.2, 4.13, 5.6, 5.7, 9.5, 9.6_
  - [x] 4.2 プロパティテスト: レシピカードデータ完全性
    - **Property 3: レシピカードデータ完全性**
    - **Validates: Requirements 2.2, 4.13**
  - [x] 4.3 プロパティテスト: 調理回数・最終日時集計
    - **Property 13: 調理回数・最終日時集計**
    - **Validates: Requirements 5.6**
  - [x] 4.4 プロパティテスト: よく作る/最近作ったセクション順序
    - **Property 14: よく作る/最近作ったセクション順序**
    - **Validates: Requirements 5.7, 9.5, 9.6**


- [x] 5. レシピ一覧画面の実装
  - [x] 5.1 RecipeRepository.getAll, RecipeRepository.getById を実装（js/recipe-api.js）
    - common.jsのclientを使用してSupabaseアクセス
    - getAll: status/sort/limit対応、recipe_photos/recipe_tags/recipe_favoritesをJOIN
    - getById: レシピ＋材料＋手順＋写真＋タグ一括取得
    - _Requirements: 2.1, 1.6_
  - [x] 5.2 FavoriteRepository.getByUser, FavoriteRepository.getCountsForRecipes を実装
    - getByUser: 指定ユーザーのお気に入りレシピID一覧
    - getCountsForRecipes: 複数レシピのお気に入り数一括取得
    - _Requirements: 5.2, 5.3_
  - [x] 5.3 CookHistoryRepository.getStats を実装
    - getStats: {recipeId: {count, lastCookedAt}} 一括取得
    - _Requirements: 5.6_
  - [x] 5.4 レシピカード描画（renderRecipeCard）を実装（js/recipe-ui.js）
    - DocumentFragment返却（XSS安全）
    - title, thumbnail(sort_order=0), author, cook_time, servings, ⭐, category表示
    - _Requirements: 2.2, 4.13_
  - [x] 5.5 レシピ一覧ロード（loadRecipeList, loadTopSections）を実装
    - よく作る/お気に入り/最近作ったセクション描画
    - カード一覧描画（updated_at DESC）
    - _Requirements: 2.1, 5.7, 9.5, 9.6, 9.7_

- [x] 6. レシピ詳細画面の実装
  - [x] 6.1 CookHistoryRepository.getByRecipeId, CookHistoryRepository.add を実装
    - getByRecipeId: 指定レシピの調理履歴一覧
    - add: 調理記録追加（user_name + timestamp）
    - _Requirements: 5.5, 5.8_
  - [x] 6.2 FavoriteRepository.toggle を実装
    - upsert / delete パターン
    - _Requirements: 5.2_
  - [x] 6.3 レシピ詳細表示（loadRecipeDetail, renderIngredients, renderSteps）を実装
    - 材料リスト・手順リスト（sort_order昇順で番号付与）・写真ギャラリー
    - タグ表示＋タップでフィルタ遷移
    - アレルギー⚠️表示（詳細上部サマリ）
    - _Requirements: 2.4, 4.7, 4.8, 6.2, 6.3, 13.2, 13.5_
  - [x] 6.4 アクションバー実装（⭐トグル / 作った！ / 編集 / 削除）
    - ⭐: 楽観的更新＋ロールバック
    - 作った！: cook_history INSERT
    - 削除: 確認ダイアログ＋CASCADE削除
    - 調理履歴表示（誰がいつ作ったか）
    - _Requirements: 5.1, 5.4, 5.6, 5.8, 1.12, 1.15, 1.16_
  - [x] 6.5 プロパティテスト: お気に入りトグル冪等性
    - **Property 11: お気に入りトグル冪等性**
    - **Validates: Requirements 5.2**
  - [x] 6.6 プロパティテスト: ユーザー別お気に入り独立性
    - **Property 12: ユーザー別お気に入り独立性**
    - **Validates: Requirements 5.3**

- [ ] 7. レシピ登録/編集画面の実装
  - [-] 7.1 validateRecipeForm, validateImageFile を実装（js/recipe-utils.js）
    - validateRecipeForm: published時はtitle必須＋材料1件以上、draft時はtitle不要
    - validateImageFile: MIME type（jpeg/png/webp）＋サイズ3MBチェック
    - resizeImage(file): Promise<Blob> — Canvas API使用、max 1200px、アスペクト比保持
    - _Requirements: 1.5, 4.2, 4.3, 4.4, 12.2_
  - [ ] 7.2 プロパティテスト: レシピフォームバリデーション
    - **Property 1: レシピフォームバリデーション**
    - **Validates: Requirements 1.5, 12.2**
  - [ ] 7.3 プロパティテスト: 画像アップロードバリデーション
    - **Property 9: 画像アップロードバリデーション**
    - **Validates: Requirements 4.2, 4.3**
  - [ ] 7.4 プロパティテスト: 画像リサイズ制約
    - **Property 10: 画像リサイズ制約**
    - **Validates: Requirements 4.4**
  - [ ] 7.5 RecipeRepository.save, RecipeRepository.delete を実装
    - save: idの有無でINSERT/UPDATE判定、updated_at自動更新
    - delete: CASCADE削除（Storage写真も削除）
    - _Requirements: 1.6, 1.15_
  - [ ] 7.6 IngredientRepository.saveAll, TagRepository.saveAll, PhotoRepository.upload/delete を実装
    - IngredientRepository.saveAll: 全削除＋全挿入（sort_order付き）
    - TagRepository.saveAll: 正規化済みタグを全削除＋全挿入
    - TagRepository.getSuggestions: オートコンプリート候補
    - PhotoRepository.upload: リサイズ済みBlobをStorageアップロード＋recipe_photos INSERT
    - PhotoRepository.delete: Storage＋DBから削除
    - _Requirements: 1.2, 1.3, 4.5, 4.10, 6.4, 6.5_
  - [ ] 7.7 登録/編集フォームUI（loadEditForm, addIngredientRow, addStepRow, saveRecipe）を実装
    - title, description, category(SELECT), cook_time_minutes, servings 入力フィールド
    - 材料: 名前＋分量＋メモ行、「＋材料を追加」大ボタン
    - 手順: 説明＋写真、「＋手順を追加」大ボタン
    - タグ入力（オートコンプリート）、アレルギーチェックボックス（卵/乳/小麦/えび/かに）
    - 写真アップロード（カメラ/フォトライブラリ、プレビュー、削除）
    - 保存ボタン群: 公開保存 / 下書き保存 / 公開・非公開トグル
    - バリデーションエラー表示（フィールド赤ハイライト＋メッセージ）
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 4.1, 4.6, 4.9, 4.12, 4.14, 6.1, 12.1, 12.2, 12.3, 12.4, 13.1_
  - [ ]* 7.8 ドラッグ&ドロップ並び替え（initDragDrop）を実装
    - 材料・手順の並び替え（sort_order更新）
    - _Requirements: 1.14_

- [ ] 8. Checkpoint — Milestone 1 完了確認
  - ESLint OK（エラー0件）
  - Property Test OK（Property 1, 3, 9, 10, 11, 12, 13, 14 全パス）
  - 手動確認: レシピ登録 → 一覧表示 → 詳細表示 → 編集 → 削除が動作すること
  - `git commit -m "feat: Milestone 1 - レシピ登録・一覧・詳細・編集"`

---

## Milestone 2: テキスト検索・ソート・お気に入り・調理記録

- [ ] 9. テキスト検索・ソートの実装
  - [ ] 9.1 matchesTextSearch, sortRecipes を実装（js/recipe-search.js）
    - matchesTextSearch: title/description/category/author/tags部分一致(case-insensitive)
    - sortRecipes: 新しい順/古い順/名前順/お気に入り順/最近作った順
    - _Requirements: 2.3, 2.6_
  - [ ] 9.2 プロパティテスト: テキスト検索部分一致
    - **Property 4: テキスト検索部分一致**
    - **Validates: Requirements 2.3**
  - [ ] 9.3 プロパティテスト: ソート正確性
    - **Property 5: ソート正確性**
    - **Validates: Requirements 2.6**
  - [ ] 9.4 一覧画面に検索バー＋ソートドロップダウンを追加（js/recipe-ui.js）
    - テキスト入力→リアルタイムフィルタ
    - ソートモード切替→再描画
    - 検索結果0件時「レシピが見つかりません」表示
    - _Requirements: 2.3, 2.5, 2.6_

- [ ] 10. お気に入りフィルタ・可視性ルールの実装
  - [ ] 10.1 filterVisibleRecipes, filterFavorites を実装（js/recipe-search.js）
    - filterVisibleRecipes: published全表示 + 自分のdraft/private表示
    - filterFavorites: 指定ユーザーのお気に入りレシピのみ抽出
    - _Requirements: 2.7, 12.5, 12.6, 12.8, 9.7_
  - [ ] 10.2 プロパティテスト: レシピ可視性ルール
    - **Property 2: レシピ可視性ルール**
    - **Validates: Requirements 2.1, 12.5, 12.6, 12.8**
  - [ ] 10.3 プロパティテスト: お気に入りフィルタ正確性
    - **Property 23: お気に入りフィルタ正確性**
    - **Validates: Requirements 2.7, 9.7**
  - [ ] 10.4 一覧画面にお気に入りフィルタボタン＋下書き/非公開セクション表示を追加
    - お気に入りフィルタ切替ボタン
    - 自分の下書き📝/非公開🔒レシピを別セクション表示
    - _Requirements: 2.7, 12.6, 12.7, 9.7_

- [ ] 11. Checkpoint — Milestone 2 完了確認
  - ESLint OK（エラー0件）
  - Property Test OK（Property 2, 4, 5, 23 全パス）
  - 手動確認: テキスト検索 → ソート切替 → お気に入りフィルタが動作すること
  - `git commit -m "feat: Milestone 2 - 検索・ソート・お気に入りフィルタ"`

---

## Milestone 3: 素材逆引き・冷蔵庫検索・タグ


- [ ] 12. タグ関連ユーティリティの実装
  - [ ] 12.1 normalizeTag, isAllergyTag, filterAllergyTags, filterGeneralTags を実装（js/recipe-utils.js）
    - normalizeTag: trim + lowercase
    - isAllergyTag: "allergy:"プレフィックス判定
    - filterAllergyTags: アレルギータグのみ抽出
    - filterGeneralTags: 一般タグのみ抽出（allergy:除外）
    - _Requirements: 6.6, 13.4, 13.6_
  - [ ] 12.2 プロパティテスト: タグ正規化
    - **Property 16: タグ正規化**
    - **Validates: Requirements 6.6**
  - [ ] 12.3 プロパティテスト: アレルギータグ分離
    - **Property 21: アレルギータグ分離**
    - **Validates: Requirements 13.4, 13.6**

- [ ] 13. タグフィルタ・アレルギー除外の実装
  - [ ] 13.1 filterByTag, filterExcludeAllergy を実装（js/recipe-search.js）
    - filterByTag: タグtを持つレシピのみ抽出
    - filterExcludeAllergy: 指定アレルゲンタグを持つレシピを除外
    - _Requirements: 6.3, 13.3_
  - [ ] 13.2 プロパティテスト: タグフィルタ正確性
    - **Property 15: タグフィルタ正確性**
    - **Validates: Requirements 6.3**
  - [ ] 13.3 プロパティテスト: アレルギー除外フィルタ
    - **Property 22: アレルギー除外フィルタ**
    - **Validates: Requirements 13.3**

- [ ] 14. 素材逆引き検索の実装
  - [ ] 14.1 searchByIngredientsLogic を実装（js/recipe-search.js）
    - AND/OR検索、部分一致
    - ORモード時はマッチ数降順ソート
    - _Requirements: 3.2, 3.4, 3.6_
  - [ ] 14.2 プロパティテスト: 材料検索 AND/OR ロジック
    - **Property 6: 材料検索 AND/OR ロジック**
    - **Validates: Requirements 3.2, 3.4**
  - [ ] 14.3 プロパティテスト: OR検索一致数順ソート
    - **Property 7: OR検索一致数順ソート**
    - **Validates: Requirements 3.6**
  - [ ] 14.4 IngredientRepository.searchByNames を実装（js/recipe-api.js）
    - 部分一致検索（ilike）
    - _Requirements: 3.2, 3.4_

- [ ] 15. 冷蔵庫検索の実装
  - [ ] 15.1 searchFridgeLogic, computeDeficiencyRatio を実装（js/recipe-search.js / js/recipe-utils.js）
    - 不足2品以内のレシピのみ返却
    - 不足率（不足数/全材料数）昇順ソート
    - _Requirements: 3.7_
  - [ ] 15.2 プロパティテスト: 冷蔵庫検索（不足品数＋不足率ソート）
    - **Property 8: 冷蔵庫検索（不足品数＋不足率ソート）**
    - **Validates: Requirements 3.7**

- [ ] 16. 素材検索タブUIの実装
  - [ ] 16.1 材料入力フィールド＋AND/OR切替UIを実装（js/recipe-ui.js）
    - 材料名入力（カンマ/スペース区切り）
    - AND/ORトグルボタン
    - _Requirements: 3.1, 3.3_
  - [ ] 16.2 冷蔵庫検索モードUI＋検索結果カード表示を実装
    - 冷蔵庫検索モードスイッチ
    - 検索結果: レシピカード＋マッチ材料名ハイライト＋不足材料表示
    - _Requirements: 3.5, 3.7_
  - [ ] 16.3 一覧画面にタグタップ→フィルタ＋アレルギー除外UIを追加
    - タグタップ→一覧画面にフィルタ適用
    - アレルギー除外フィルタUI（卵なし/乳なし等）
    - _Requirements: 6.3, 13.3_

- [ ] 17. Checkpoint — Milestone 3 完了確認
  - ESLint OK（エラー0件）
  - Property Test OK（Property 6, 7, 8, 15, 16, 21, 22 全パス）
  - 手動確認: 素材逆引きAND/OR → 冷蔵庫検索 → タグフィルタ → アレルギー除外が動作すること
  - `git commit -m "feat: Milestone 3 - 素材逆引き・冷蔵庫検索・タグ"`

---

## Milestone 4: 買い物リスト・献立

- [ ] 18. 買い物リスト数量合算ロジックの実装
  - [ ] 18.1 parseQuantity, mergeQuantities を実装（js/recipe-utils.js）
    - parseQuantity(str): "300g"→{value:300,unit:"g"}, "適量"→{value:null,unit:null,raw:"適量"}, "1/2個"→{value:0.5,unit:"個"}
    - mergeQuantities(items): 同名＋同単位の数値合算、単位不一致・非数値は別項目
    - ※mergeQuantitiesは汎用純粋関数としてrecipe-utils.jsに配置
    - _Requirements: 7.6, 7.7_
  - [ ] 18.2 プロパティテスト: parseQuantity 解析正確性
    - **Property 18: parseQuantity 解析正確性**
    - **Validates: Requirements 7.6, 7.7**
  - [ ] 18.3 プロパティテスト: 買い物リスト数量合算ルール
    - **Property 17: 買い物リスト数量合算ルール**
    - **Validates: Requirements 7.6, 7.7**

- [ ] 19. 買い物リスト機能の実装
  - [ ] 19.1 ShoppingListRepository を実装（js/recipe-api.js）
    - getAll: recipes.title JOIN、created_at昇順
    - addItems: [{ingredient_name, quantity}]をINSERT
    - toggleChecked: チェック状態トグル
    - deleteChecked: チェック済み一括削除
    - deleteItem: 個別削除
    - _Requirements: 7.4, 7.8, 7.9_
  - [ ] 19.2 addToShoppingList, loadShoppingList を実装（js/recipe-shopping.js）
    - addToShoppingList: 選択材料をDB追加
    - loadShoppingList: 取得＋レシピ別グループ化＋mergeQuantities適用
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.10_
  - [ ] 19.3 買い物リストタブUI — リスト表示＋チェックオフを実装（js/recipe-ui.js）
    - レシピ別グループ化表示
    - チェックオフ（取り消し線表示）
    - 個別削除＋チェック済み一括削除ボタン
    - _Requirements: 7.4, 7.5, 7.8, 7.9, 7.10_
  - [ ] 19.4 詳細画面に「買い物リストに追加」ボタン＋材料チェックボックスモーダルを追加
    - 材料一覧チェックボックス表示
    - 選択→addToShoppingList呼出
    - _Requirements: 7.1, 7.2, 7.3, 7.11_

- [ ] 20. 献立機能の実装
  - [ ] 20.1 MealPlanRepository を実装（js/recipe-api.js）
    - getByDate: 指定日の朝・昼・夜取得（recipes JOIN）
    - getByDateRange: 期間取得
    - save: UPSERT（plan_date, meal_type 一意制約）
    - clearSlot: スロットクリア
    - _Requirements: 8.2, 8.5, 8.6, 8.7_
  - [ ] 20.2 loadMealPlan, saveMealPlan を実装（js/recipe-meal-plan.js）
    - loadMealPlan: 指定日の朝・昼・夜取得
    - saveMealPlan: UPSERT
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ] 20.3 献立タブUI — 日付選択＋朝昼夜グリッドを実装（js/recipe-ui.js）
    - 日付ピッカー
    - 朝・昼・夜 × 主菜/副菜/汁物 グリッド表示
    - 各スロットにレシピ選択ドロップダウン
    - 当日献立を目立たせて表示
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 21. Checkpoint — Milestone 4 完了確認
  - ESLint OK（エラー0件）
  - Property Test OK（Property 17, 18 全パス）
  - 手動確認: 買い物リスト追加・チェック・削除 → 献立登録・表示が動作すること
  - `git commit -m "feat: Milestone 4 - 買い物リスト・献立"`

---

## Milestone 5: ランダム・複製・印刷・下書き/非公開・アレルギー・PWA

- [ ] 22. ランダムレシピの実装
  - [ ] 22.1 RecipeRepository.getRandom を実装（js/recipe-api.js）
    - カテゴリフィルタ対応のランダム1件取得
    - _Requirements: 9.2, 9.3_
  - [ ] 22.2 ランダムボタンUI（🎲 + カテゴリフィルタ + もう一回ボタン）を実装
    - カテゴリ選択→🎲タップ→ランダム表示→「もう一回」
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ] 22.3 プロパティテスト: ランダムレシピのカテゴリフィルタ
    - **Property 19: ランダムレシピのカテゴリフィルタ**
    - **Validates: Requirements 9.3**

- [ ] 23. レシピ複製の実装
  - [ ] 23.1 duplicateRecipeData を実装（js/recipe-utils.js）
    - title末尾に"のコピー"付加
    - ingredients, steps, tags, category, cook_time_minutes, servings をコピー
    - photosは複製しない
    - _Requirements: 10.2, 10.4_
  - [ ] 23.2 RecipeRepository.duplicate を実装 + 詳細画面に「複製」ボタン追加
    - 複製後に編集画面（#edit/{newId}）に遷移
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ] 23.3 プロパティテスト: レシピ複製データ保持
    - **Property 20: レシピ複製データ保持**
    - **Validates: Requirements 10.2, 10.4**

- [ ] 24. 印刷モードの実装
  - [ ] 24.1 showPrintView を実装（js/recipe-ui.js）
    - 1ページ表示、大きい文字、材料と手順を見やすく配置
    - ナビゲーション・非必須UIを非表示
    - ブラウザ印刷ダイアログ自動トリガー
    - 詳細画面に「🖨️ 印刷」ボタン追加
    - _Requirements: 10.5, 10.6, 10.7_
  - [ ]* 24.2 印刷モードのスナップショットテスト
    - ナビゲーション非表示確認
    - _Requirements: 10.7_

- [ ] 25. 下書き/非公開ステータスの仕上げ
  - [ ] 25.1 編集画面の公開/非公開トグル＋下書き保存のステータス管理を確認・修正
    - status='published'/'draft'/'private' の遷移ロジック最終確認
    - 一覧での📝/🔒アイコン表示
    - 他ユーザーからのdraft/private詳細アクセス拒否
    - _Requirements: 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 26. アレルギー表示の仕上げ
  - [ ] 26.1 アレルギータグ⚠️表示＋詳細上部サマリーの最終確認・修正
    - レシピカードへの⚠️アイコン表示
    - 詳細画面上部にアレルギーサマリ表示
    - _Requirements: 13.2, 13.5_

- [ ] 27. TOPページ連携とPWA更新
  - [ ] 27.1 index.htmlに🍳アイコン追加
    - 既存アイコン列に `&#x1F373;` アイコンリンクを追加（pages/recipe.htmlへ遷移）
    - _Requirements: 11.1_
  - [ ] 27.2 sw.jsのキャッシュ対象にレシピ関連ファイルを追加
    - pages/recipe.html, js/recipe-*.js をキャッシュリストに追加
    - CACHE_NAMEバージョン +1

- [ ] 28. Checkpoint — Milestone 5 完了確認
  - ESLint OK（エラー0件）
  - Property Test OK（全23 Property パス）
  - 手動確認: ランダム → 複製 → 印刷 → 下書き/非公開 → アレルギー表示が動作すること
  - `git commit -m "feat: Milestone 5 - ランダム・複製・印刷・PWA"`

---

## リリース準備

- [ ] 29. リリース準備（バージョン更新・リリースノート）
  - [ ] 29.1 release-notes.html に「🍳家族レシピ機能追加」をfeat(緑)タグで追記
  - [ ] 29.2 sw.js の CACHE_NAME バージョン +1
  - [ ] 29.3 index.html 末尾のバージョン表示を新バージョンに更新（例: v2.18.0）
  - [ ] 29.4 最終コミット＋プッシュ
    - `git commit -m "release: v2.18.0 - 家族レシピ機能"`
    - `git push`

---

## Notes

- Property Testは必須（`*`なし）。対応する関数実装の直後に実施する
- UIテスト（ドラッグ&ドロップ、印刷スナップショット等）はオプショナル（`*`付き）
- Property番号はdesign.mdのCorrectness Properties番号と完全一致
- Repositoryは対応するUI実装と同じタスク内で実装する（全Repository一括実装はしない）
- mergeQuantities() は recipe-utils.js に配置（汎用純粋関数）
- recipeCardData() は recipe-utils.js に配置
- resizeImage(file): Promise<Blob> を返す
- 各タスクは1コミットで完結する粒度
- Checkpointは各マイルストーン末尾に配置し、Lint / PBT / 手動確認 / コミットを含む
- getCurrentUserName() はcommon.jsの既存パターン（push_subscriptions.child_name）で実装
