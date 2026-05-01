# お小遣い手帳 - 開発コンテキスト引継ぎ

最終更新: 2026/05/01 v1.11.1

## プロジェクト概要

家族向けお小遣い管理PWAアプリ。GitHub Pages + Supabaseで構成。
小学生の子供たちが使うことを想定した、遊び心のあるアプリ。

- リポジトリ: https://github.com/osho0625/okodukai_history
- 公開URL: https://osho0625.github.io/okodukai_history/
- Supabase Project ID: ynecezxnltigplrfzzoh

## ファイル構成

```
/
├── index.html          # TOPページ（アカウント一覧、admin用🧹アイコン）
├── manifest.json       # PWA設定
├── sw.js               # Service Worker (v4)
├── CONTEXT.md          # この引継ぎドキュメント
├── pages/
│   ├── child.html      # 個別アカウントページ（残高・ポイント表・家事選択・履歴）
│   ├── settings.html   # アカウント設定（残高表示ON/OFF、パスワード、表示順）
│   ├── admin.html      # 管理者ページ（アカウント管理・履歴編集・家事マスタ・権限・バックアップ・イタズラ設定）
│   ├── allowance.html  # お小遣い入金ページ（admin専用、ワンタップ入金）
│   ├── game.html       # ぷよぷよ風パズルゲーム（タイトル画面＋カウントダウン付き）
│   ├── ranking.html    # ゲームスコアランキングTOP10
│   └── release-notes.html # リリースノート
├── images/
│   ├── 2728.png        # アプリアイコン（PWA用）
│   └── puyo_1〜5.avif  # ぷよ画像（ゲーム＋畑演出＋タイトル画面用）
├── js/
│   ├── roach.js        # ゴキブリ演出（管理者PW5回ミスで発動）
│   └── garden.js       # ぷよ畑演出（植木鉢アイコンで発動）
├── backups/            # 自動バックアップJSON
└── .github/workflows/
    └── backup.yml      # 毎日AM3:00 JST自動バックアップ + Discord通知
```

## Supabaseテーブル構成

### children（アカウント）
- id: UUID (PK), name: TEXT, balance: INT
- show_balance_on_top: BOOLEAN (default true)
- require_password: BOOLEAN (default false), password: TEXT (nullable)
- sort_order: INT (default 0)

### transactions（入出金履歴）
- id: UUID (PK), child_id: UUID (FK → children.id)
- type: TEXT ('add' or 'use'), amount: INT, memo: TEXT
- created_at: TIMESTAMPTZ

### chore_types（家事マスタ）
- id: SERIAL (PK), name: TEXT, default_points: INT

### chore_points（ポイント履歴）
- id: UUID (PK), child_id: UUID (FK → children.id)
- chore_name: TEXT, points: INT, created_at: TIMESTAMPTZ

### puyo_counts（ぷよ引き抜きカウント）
- id: INT (PK, 1-5), name: TEXT ('puyo_1'〜'puyo_5'), count: INT

### roach_counts（ゴキブリ退治カウント）
- id: INT (PK, 1), count: INT

### activity_log（アクティビティログ）
- id: UUID (PK), type: TEXT ('puyo' or 'roach'), name: TEXT, created_at: TIMESTAMPTZ

### game_rankings（ゲームランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### game_settings（各種設定、id=1の1行）
- night_password: TEXT, night_limit_enabled: BOOLEAN
- allowance_password: TEXT, admin_password: TEXT

## 端末権限（deviceRole）

localStorageに`deviceRole`を保存。管理者ページから設定。
- `admin`: パスワード入力スキップ、🧹アイコン表示、全機能解放
- `user`（デフォルト）: 通常動作（パスワード必要）
- 管理者ページへのログインは権限に関係なく常にパスワード必要

## 主要機能

### TOP画面（index.html）
- アカウント一覧（sort_order順）、タップで個別ページへ
- パスワード付きアカウント: user→🔒+残高非表示+モーダル認証、admin→直接遷移
- 未読入金がある場合: 🔔アイコン＋入金前残高を表示
- 🧹アイコン（admin権限のみ表示）→ お小遣い入金ページ
- 🪴アイコン → ぷよ畑演出
- 💴アイコン → ぷよゲーム
- 🔧アイコン → 管理者認証 → 管理者ページ
- PWA起動時にSW更新チェック＋自動リロード

### 個別アカウントページ（child.html）
- 残高表示＋入金演出（フルスクリーンオーバーレイ＋カウントアップ＋紙吹雪）
- ⭐ お手伝いポイント表（20×20=400マス、日付表示、タップで家事名ポップアップ）
- 家事選択 → ±ボタンでポイント調整 → 追加
- 20ptごとにお小遣い自動入金（40円/300円/200円/400円）
- いろはの場合: いろは＋いろはの借金に半額ずつ振り分け
- 📋 入出金履歴
- 残高5回タップで🎉リプレイボタン（直前の入金演出を再生）

### お小遣い入金（allowance.html）
- admin専用（パスワード認証 or admin権限でスキップ）
- アカウント選択 → 40/100/200/300/400円ワンタップ入金
- いろは選択時: いろは＋いろはの借金に半額ずつ自動振り分け
- 入金時にlocalStorageに未読情報保存（演出用）

### 管理者ページ（admin.html）
- 管理者PW: Supabase game_settings.admin_password
- アカウント一覧・残高・パスワード表示
- アカウント追加/削除、PW解除
- 履歴管理（編集/削除、残高自動再計算）
- 🧹 家事マスタ管理（追加/編集/削除）
- 🔓 端末権限設定（admin/user切り替え）
- パスワード管理（管理者PW/夜間制限PW/お手伝いPW）
- イタズラ設定（コケやすさ10倍=sessionStorage、夜間制限ON/OFF）
- カウントリセット（ぷよ/ゴキブリ/ランキング）
- アクティビティログ
- バックアップ（手動DL/GitHub復元/ファイル復元）

### ぷよゲーム（game.html）
- タイトル画面（ぷよ表示＋芽→引き抜き演出、ゲーム開始/ランキングボタン）
- 3秒カウントダウン後にゲーム開始
- 2個1組で落下、同色4つ以上で消える、連鎖対応
- 本家風スコア計算、ランキングTOP10
- 夜間制限（日〜木21時、金土22時〜4時）

## 外部サービス

- Supabase: データベース + リアルタイム
- Discord Webhook: 各種通知
- GitHub Pages: ホスティング
- GitHub Actions: 自動バックアップ（毎日AM3:00 JST、14日保持）

## 開発ルール

- バージョニング: x.y.z（大機能/構造変更=x、機能追加=y、小修正=z）
- 現在: v1.11.6
- 修正のたびにindex.htmlのバージョン表示とpages/release-notes.htmlを更新
- リリースノートのタグ: feat(緑), fix(オレンジ), fun(紫), infra(グレー)
- index.htmlの絵文字はHTMLエンティティ（&#x...;）で記述
- パスワード類はすべてSupabase game_settingsに保存（ソースにハードコードしない）

## 既知の注意点

- Supabaseの全テーブルはRLS無効化済み
- SW v4、ネットワーク優先＋PWA起動時に自動更新チェック
- puyo_countsのリアルタイム更新には `ALTER PUBLICATION supabase_realtime ADD TABLE puyo_counts;` が必要
- ゲームのSupabaseクライアントは `sbClient`（index.htmlの `client` とは別名）
- コケやすさ10倍はsessionStorage（タブ閉じでリセット）
- 夜間制限ON/OFFはlocalStorage（リロードで戻る）
