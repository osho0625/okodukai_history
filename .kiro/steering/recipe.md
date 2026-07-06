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

## 主要機能

- レシピ登録/編集/削除（タイトル/説明/カテゴリ/調理時間/人数/材料/調味料/手順/写真/タグ/アレルギー）
- カテゴリ: 動的管理（game_settings.recipe_categories JSONB）、＋ボタンで追加、admin⚙️で削除
- 材料/調味料分離: 調味料はボタン入力（大さじ/小さじ/カップ ±0.5）対応
- タグ: pill形式UI、既存タグのワンタップ追加
- テキスト検索（タイトル/説明/カテゴリ/作者/タグ）+ 5種ソート
- 素材逆引き検索（AND/OR切替）+ 冷蔵庫検索（不足率ソート）
- お気に入り（recipe_favorites、ユーザー別独立管理）
- 調理記録（recipe_cook_history、誰がいつ作ったか）
- 買い物リスト（数量合算/チェックオフ/レシピ別グループ化）
- 献立（朝/昼/夜 × 主菜/副菜/汁物、UPSERT）
- ランダムレシピ（🎲 + カテゴリフィルタ）
- レシピ複製 + 印刷モード
- 下書き/非公開（authorのみ閲覧可）
- アレルギータグ（allergy:プレフィックス、⚠️表示、除外フィルタ）

## Design Principles

- DOM操作はUI層（recipe-ui.js）のみ
- SupabaseアクセスはRepository層（recipe-api.js）経由のみ
- Business LogicはPure Function（recipe-search.js, recipe-utils.js）
- sort_orderのみを表示順の唯一のソース
- 画像は必ず1200px以下へ圧縮してから送信
- 楽観的更新（状態変更後はローカル更新→失敗時ロールバック）
- ファイル間依存: router → ui → api → Supabase（逆方向禁止）

## DBテーブル

| テーブル | 概要 |
|----------|------|
| recipes | レシピ本体（title, description, author, category, cook_time_minutes, servings, status） |
| recipe_ingredients | 材料（name, quantity, memo, sort_order） |
| recipe_steps | 手順（description, sort_order） |
| recipe_photos | 写真（url, type, sort_order, caption, step_id） |
| recipe_tags | タグ（tag）UNIQUE(recipe_id, tag) |
| recipe_favorites | お気に入り（user_name）UNIQUE(recipe_id, user_name) |
| recipe_cook_history | 調理履歴（user_name, created_at） |
| shopping_list | 買い物リスト（ingredient_name, quantity, checked, recipe_id ON DELETE SET NULL） |
| meal_plans | 献立（plan_date, meal_type, main_dish_id, side_dish_id, soup_id）UNIQUE(plan_date, meal_type) |

## テスト

- Vitest + fast-check (PBT)
- 11テストファイル、98テスト、23プロパティ
- テスト対象: recipe-utils.js, recipe-search.js の純粋関数
