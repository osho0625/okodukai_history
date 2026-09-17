# 漢字合体 -カンジニオン-（kanji-blast）引き継ぎメモ

最終更新: 2026/09/16

## これは何

ゲームセンター（pages/arcade.html）に追加した、縦スクロールSTG × 漢字合体パズル。
漢字パーツを集めて合体・分解し、読み仮名を図鑑登録して強くなる教育系ゲーム。
対象は小学1・3・5年生（漢字範囲の縛りなし）。子供（player）ごとにデータ分離。

- 表示タイトル: **漢字合体 -カンジニオン-**
- 内部ID・ファイル名・テーブル名は `kanji-blast` / `game_kanji_blast` / `kanji_*` のまま
  （既存データとの整合のため変更しない方針）

## 現在の状態（どこまで終わっているか）

### 実装済み（main にマージ済み・push 済み）
- `pages/kanji-blast.html` … 画面（プレイヤー選択/メニュー/STG/合体・手持ち/図鑑）
- `js/kanji-blast.js` … ゲームロジック全体
- `pages/arcade.html` … カード追加（data-game="game_kanji_blast"）
- `.github/workflows/backup.yml` … 5テーブルのバックアップ追加
- SQL: `sql/create_kanji_blast_tables.sql` / `seed_kanji_blast_data.sql` /
  `alter_kanji_recipes_three_parts.sql` / `alter_kanji_plus_enhancement.sql`
- リリース済みバージョン: v2.46.0 → v2.46.1 → v2.47.0（SW v347）

実装済み機能:
- STG（ドラッグ移動・自動連射・必殺技ボタン・残機3・スコア/ステージ保存）
- 5ステージごとのフロアボス（王）。撃破で plus_cap +1、合成漢字を +1 付きでドロップ
- 合体（2〜3素材・順不同・選択式）／分解（画数大パーツ優先）
- +値（エンハンス）: 合成=素材+合計+1（cap クリップ）、分解=floor((結果+ -1)/素材数)
- 読み仮名判定（音訓/送り仮名/活用ゆらぎ/最長一致/ひらカナ両対応）→ 図鑑登録＆強化
- 強さ = round(画数 × 漢検級係数 × (1+読み数×0.1) × (1+図鑑種類数×0.02) × (1+plus×0.05))
- 数字 1〜9 を基本パーツに追加（数字も合成・分解可）
- 削除（プレイヤー削除・にがす）は作成端末（created_by_device === push_device_id）のみ

### 名称統一（「漢字合体 -カンジニオン-」）
呼称は UI・ドキュメントとも「漢字合体 -カンジニオン-」に統一済み
（内部ID・ファイル名・テーブル名は `kanji-blast` / `kanji_*` のまま）。当初変更した箇所:
- pages/kanji-blast.html: `<title>` / ヘッダー `<h1>` / メニュー見出し（menu-title）
- pages/arcade.html: カードタイトル（game-title）
- ※内部ID・ファイル名・SQLコメント・steering・CONTEXT 等のドキュメント呼称は
  「UI表示のみ変更」の方針により現状維持（あえて変えていない）

## 未完了・次にやること

### 1. DBマイグレーションの適用（要確認）
本番Supabase（ref: ynecezxnltigplrfzzoh、LINKED済み）に対して、以下が適用済みか未確認。
CLI（`supabase db query --linked -f <file>`）で実行できることは確認済み。
セッション中断のため、以下の適用状況を必ず確認すること:
- [ ] `sql/alter_kanji_recipes_three_parts.sql`（part_c追加・UNIQUE撤廃）
- [ ] `sql/alter_kanji_plus_enhancement.sql`（plus / 装備plus / plus_cap 追加）
- [ ] `sql/seed_kanji_blast_data.sql` の再実行（数字マスタ・全レシピ入れ替え）

確認用クエリ（文字化けする場合あり。列名 part_c / plus / plus_cap の有無を見る）:
```
supabase db query --linked "SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('kanji_recipes','kanji_inventory','kanji_players') ORDER BY table_name, ordinal_position;"
```
seed の DELETE はレシピ（共通データ）のみ対象で、プレイヤーデータ
（players/inventory/dex）には触れない設計。実行前は players=0 だった。

### 2. UIタイトル変更のリリース記録（未実施なら）
タイトル変更のバージョン記録がまだなら:
- [ ] pages/release-notes.html に v2.47.1 相当のエントリ追加（表示名変更）
- [ ] sw.js の CACHE_NAME を v348 に
- [ ] index.html のバージョン表示を更新
- [ ] TSJ260916 系ブランチで push → main に `--no-ff` マージ

### 3. スペック（.kiro/specs/kanji-blast/）
- [x] requirements.md 作成済み（EARS形式・12要件、実装挙動を正として文書化）
- [ ] design.md 未作成 ← 次のフェーズ。設計フェーズに進む
- [ ] tasks.md 未作成

## スペック作成の進め方（重要）

- ワークフロー: Requirements-First（.config.kiro に記録済み）
- この機能は実装済み。スペックは新規発明ではなく、既存コードを「正」として文書化する。
- 次は design.md。requirements.md と実装（js/kanji-blast.js、SQL群）を読み込み、
  以下を設計として起こす:
  - データモデル（5テーブルの関係、part_c、plus/plus_cap）
  - 強さ計算式、+値の合成/分解ルール、読み判定アルゴリズム（matchScore/resolveReading）
  - STGループ、フロアボス、ドロップ抽選ロジック
  - 端末制限（created_by_device）とバックアップによるデータ保全
- design.md 完了後に tasks.md。ただし実装済みのため、タスクは「検証・DB適用・
  ドキュメント整合」中心になる想定。

## 設計・規約メモ（プロジェクト共通）

- 構成: GitHub Pages + Supabase。フロントは anon(publishable) キーで REST。
- RLS は他ゲーム同様「有効＋Allow all」。削除の端末制限はアプリ層で制御。
- 共通: js/common.js の `client` / `isAdmin` / `isNightTime()` / `getTodayJST()` を利用。
- 端末識別は `localStorage.push_device_id` を流用（common.js と共用）。
- 夜間制限（isNightTime）対応済み。
- 詳細仕様は `.kiro/steering/kanji-blast.md` に集約（`*kanji-blast*` を開くと自動読込）。

## Git / push 運用の注意

- credential.helper が global で AWS CodeCommit 用に設定されており、GitHub push で
  詰まることがある。過去に GCM のトークンが失効し、ユーザーが手動で PAT を入れ直して
  復旧した経緯あり。push が `Invalid username or token` で失敗したら、ユーザーに
  手元ターミナルからの push（PAT 再入力）を依頼する。
- main へのマージは必ず `git merge --no-ff`。
- 作業ツリーに無関係な変更（career/配下、node_modules の vitest 結果、alexa テスト
  ファイル）が混ざっている。コミット時は kanji-blast 関連ファイルのみを選択的に
  `git add` すること（`git add .` は使わない）。
