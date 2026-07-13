# お小遣い手帳 - 開発者ガイド

このドキュメントは、新たにこのプロジェクトに参加する開発者向けのスタートアップガイドです。

## プロジェクト概要

家族向けお小遣い管理PWA。GitHub Pages（フロントエンド） + Supabase（BaaS）で構成されたサーバーレスアーキテクチャ。

- 公開URL: https://osho0625.github.io/okodukai_history/
- リポジトリ: https://github.com/osho0625/okodukai_history
- Supabase Project ID: `ynecezxnltigplrfzzoh`

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | HTML / CSS / Vanilla JavaScript（フレームワークなし） |
| BaaS | Supabase（PostgreSQL + Auth + Realtime） |
| ホスティング | GitHub Pages |
| PWA | Service Worker (`sw.js`) + `manifest.json` |
| CI/CD | GitHub Actions（cron系バッチ処理） |
| テスト | Vitest + jsdom + fast-check |
| Push通知 | Web Push (VAPID) |

ビルドステップなし。HTML/JS/CSSを直接編集してpushすればデプロイ完了。

## ローカル開発セットアップ

```bash
# 1. クローン
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history

# 2. 依存インストール（テスト・Push通知スクリプト用）
npm install

# 3. ローカルサーバー起動（任意のHTTPサーバーでOK）
npx http-server . -p 8080
# または
python -m http.server 8080
```

ブラウザで `http://localhost:8080` を開く。Supabaseへの接続はインターネット接続が必要。

## ディレクトリ構成

```
/
├── index.html           # TOPページ（エントリーポイント）
├── manifest.json        # PWA設定
├── sw.js                # Service Worker（キャッシュ管理）
├── css/                 # スタイルシート
├── pages/               # 各機能ページ（38ファイル）
├── js/                  # 共通・機能別JSモジュール
├── data/                # 静的データ（算数問題、ポーカー戦略等）
├── dict/                # kuromoji辞書（ひらがな変換用）
├── images/              # アイコン・ゲーム画像
├── suika/               # すいかRPG（別アプリアセット）
├── scripts/             # GitHub Actions用バッチスクリプト
├── sql/                 # DBマイグレーションSQL
├── backups/             # 自動バックアップJSON（日次）
├── tests/               # テストファイル
├── .kiro/steering/      # AI向けドキュメント（仕様の詳細はここ）
├── .github/workflows/   # GitHub Actions定義
└── docs/                # ドキュメント
```

## 主要ファイルの役割

| ファイル | 説明 |
|----------|------|
| `index.html` | TOP画面。アカウント一覧、リマインダー、ゲーム導線 |
| `pages/child.html` | 個人ページ。残高表示、ポイント表、入出金、演出 |
| `pages/admin.html` | 管理者ページ。全機能の設定・管理 |
| `js/common.js` | Supabaseクライアント初期化、共通ユーティリティ |
| `sw.js` | キャッシュ戦略（ネットワーク優先）、バージョン管理 |

## Supabase接続

Supabaseクライアントは各HTMLファイル内で直接初期化。`js/common.js`に共通設定あり。
RLSは基本無効化済み（認証なしで全操作可能）。

## 端末権限モデル

`localStorage.deviceRole` で制御:
- `admin`: 全機能アクセス可、演出スキップ、ポイント即承認
- `user`（デフォルト）: 通常操作、ポイント申請は承認待ち

管理者ページ（`pages/admin.html`）から設定変更可能。管理者パスワードはSupabase `game_settings`テーブルに保存。

## テスト

```bash
npm test          # 全テスト実行（vitest --run）
```

## 開発フロー

### Git 基本操作（初心者向け）

#### 初回セットアップ（最初の1回だけ）

```bash
# リポジトリをクローン
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history

# ユーザー名とメールアドレスを設定（初回のみ）
git config user.name "あなたの名前"
git config user.email "your-email@example.com"
```

#### 作業開始（毎回やること）

```bash
# 1. mainブランチに移動して最新を取得
git checkout main
git pull origin main

# 2. 作業用ブランチを作成して移動
#    命名規則: 自分のイニシャル + 日付（例: MGM260710）
git checkout -b MGM260710
```

これで `MGM260710` という自分専用の作業ブランチができます。ここで自由に編集してOK。mainには影響しません。

#### 作業中のこまめな保存（コミット）

```bash
# 変更したファイルを確認
git status

# 変更をステージング（保存対象にする）
git add ファイル名
# 例: git add pages/child.html js/common.js

# まとめて全部追加する場合（注意して使う）
git add .

# コミット（変更の記録を作る）
git commit -m "feat: ○○機能を追加"
```

コミットメッセージの例:
- `feat: ○○機能を追加` — 新機能
- `fix: ○○のバグを修正` — バグ修正
- `style: CSSの調整` — 見た目の変更
- `docs: READMEを更新` — ドキュメントのみ

#### リモートにpush

```bash
# 作業ブランチをGitHubに送信
git push -u origin MGM260710
```

初回pushは `-u` をつける。2回目以降は `git push` だけでOK。

#### mainへのマージ（作業完了時）

```bash
# mainに移動
git checkout main

# 最新を取得
git pull origin main

# 作業ブランチをマージ（--no-ff 必須）
git merge --no-ff MGM260710

# mainをpush
git push origin main
```

`--no-ff` を忘れないこと。マージコミットが残り、履歴で作業単位が分かりやすくなります。

#### よくあるトラブル

| 状況 | 対処 |
|------|------|
| 間違ったブランチで作業してしまった | `git stash` → 正しいブランチへ移動 → `git stash pop` |
| コミットメッセージを間違えた | `git commit --amend -m "正しいメッセージ"`（push前のみ） |
| 今どのブランチにいるか分からない | `git branch` で確認（*がついてるのが現在地） |
| mainが進んでて競合した | `git checkout main` → `git pull` → `git checkout 自分のブランチ` → `git merge main` → 競合を手動解決 |

### ブランチ運用ルール

- `main`: 本番ブランチ（GitHub Pages公開対象）。直接コミットしない。
- 作業ブランチ: イニシャル + 日付（例: `MGM260710`、`TSJ260702`）
- mainへのマージは必ず `git merge --no-ff`（fast-forward禁止）
- 作業は必ず作業ブランチで行い、完了したらmainにマージ

### コード変更時の必須チェックリスト

**変更をmainにマージする前に、以下をすべて確認・更新すること:**

| # | 対象ファイル | やること |
|---|-------------|----------|
| 1 | `pages/release-notes.html` | バージョン番号を上げてリリース内容を先頭に追記 |
| 2 | `sw.js` | `CACHE_NAME` のバージョン番号を +1（例: `okozukai-v272` → `okozukai-v273`） |
| 3 | `index.html` | 末尾のバージョン表示テキストを新バージョンに更新 |
| 4 | `.kiro/steering/` | 該当機能のsteeringファイルに仕様変更を反映 |
| 5 | `CONTEXT.md` | steeringやページの追加・変更があればインデックス更新 |

⚠️ 特に sw.js のキャッシュバージョン更新は絶対忘れないこと。これを忘れるとユーザーのPWAに変更が届きません。

### リリースノートの書き方

`pages/release-notes.html` に以下の形式で追記:

```html
<div class="release">
  <h3>v2.30.0 <span class="date">2026/07/10</span></h3>
  <ul>
    <li><span class="tag feat">feat</span> ○○機能を追加</li>
    <li><span class="tag fix">fix</span> △△のバグを修正</li>
  </ul>
</div>
```

タグの種類:
- `feat`（緑）: 新機能
- `fix`（オレンジ）: バグ修正
- `fun`（紫）: 遊び要素の追加
- `infra`（グレー）: インフラ・設定変更

### バージョニング

`x.y.z` 形式:
- x: 構造変更（破壊的変更）
- y: 機能追加
- z: 小修正・バグ修正

現在: v2.29.0

## GitHub Actions（自動バッチ）

| ワークフロー | 概要 |
|-------------|------|
| `auto-chore-points.yml` | お手伝いポイント自動付与 |
| `auto-chore-tasks.yml` | 定型お手伝いタスクの毎朝自動追加 |
| `backup.yml` | 日次バックアップ（JSONをbackups/に保存） |
| `reminder-notify.yml` | リマインダーDiscord通知 |

## ドキュメント構成

このプロジェクトのドキュメントは `.kiro/steering/` にAI向けsteering filesとして管理されています。各機能の詳細仕様はそちらを参照してください。

主要なsteering files:
- `project-overview.md` — テーブル構成・機能一覧・開発ルール全体
- 各機能ごとに個別ファイル（`kanji-test.md`, `puyo-battle.md` 等）

一覧は `CONTEXT.md` を参照。

## コーディング規約

- フレームワーク不使用。Vanilla JS + inline `<script>` が基本
- 絵文字はHTMLエンティティで記述（`index.html`内）
- パスワード・APIキーはソースにハードコードしない（Supabaseテーブルで管理）
- 返済用アカウントは名前が「が返すお金」で終わるものとして汎用判定
- ゲーム系のSupabaseクライアント変数名は `sbClient`（他ページは `client`）

## 注意点

- 全画面の ← ボタンは `history.back()`、🏠は `index.html` へ直帰
- Service Worker はネットワーク優先戦略。PWA起動時に自動更新チェック
- Supabaseテーブルは基本RLS無効（セキュリティは端末権限モデルで簡易制御）
- 小学生が使うアプリなので、UIは大きめ・遊び心重視
