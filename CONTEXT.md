# お小遣い手帳 - 開発コンテキスト引継ぎ

最終更新: 2026/04/30 v1.8.4

## プロジェクト概要

家族向けお小遣い管理PWAアプリ。GitHub Pages + Supabaseで構成。
小学生の子供たちが使うことを想定した、遊び心のあるアプリ。

- リポジトリ: https://github.com/osho0625/okodukai_history
- 公開URL: https://osho0625.github.io/okodukai_history/
- Supabase Project ID: ynecezxnltigplrfzzoh

## ファイル構成

```
/
├── index.html          # TOPページ（ルート必須）
├── manifest.json       # PWA設定
├── sw.js               # Service Worker (v3)
├── CONTEXT.md          # この引継ぎドキュメント
├── pages/
│   ├── child.html      # 個別アカウントページ（残高・履歴・追加/使用）
│   ├── settings.html   # アカウント設定（残高表示ON/OFF、パスワード、表示順）
│   ├── admin.html      # 管理者ページ（アカウント管理・履歴編集・バックアップ・イタズラ設定）
│   ├── allowance.html  # お手伝いポイントページ（ワンタップ入金）
│   ├── game.html       # ぷよぷよ風パズルゲーム
│   ├── ranking.html    # ゲームスコアランキングTOP10
│   └── release-notes.html # リリースノート
├── images/
│   ├── 2728.png        # アプリアイコン（PWA用）
│   └── puyo_1〜5.avif  # ぷよ画像（ゲーム＋畑演出用）
├── js/
│   ├── roach.js        # ゴキブリ演出（管理者PW5回ミスで発動）
│   └── garden.js       # ぷよ畑演出（植木鉢アイコンで発動）
├── backups/            # 自動バックアップJSON
└── .github/workflows/
    └── backup.yml      # 毎日AM3:00 JST自動バックアップ + Discord通知
```

## Supabaseテーブル構成

### children（アカウント）
- id: UUID (PK)
- name: TEXT
- balance: INT
- show_balance_on_top: BOOLEAN (default true)
- require_password: BOOLEAN (default false)
- password: TEXT (nullable)
- sort_order: INT (default 0)

### transactions（入出金履歴）
- id: UUID (PK)
- child_id: UUID (FK → children.id)
- type: TEXT ('add' or 'use')
- amount: INT
- memo: TEXT
- created_at: TIMESTAMPTZ

### puyo_counts（ぷよ引き抜きカウント）
- id: INT (PK, 1-5)
- name: TEXT ('puyo_1'〜'puyo_5')
- count: INT

### roach_counts（ゴキブリ退治カウント）
- id: INT (PK, 1)
- count: INT

### activity_log（アクティビティログ）
- id: UUID (PK)
- type: TEXT ('puyo' or 'roach')
- name: TEXT
- created_at: TIMESTAMPTZ

### game_rankings（ゲームランキング）
- id: UUID (PK)
- name: TEXT
- score: INT
- created_at: TIMESTAMPTZ

### game_settings（ゲーム設定）
- id: INT (PK, 1)
- night_password: TEXT (default '299792458')
- night_limit_enabled: BOOLEAN

## 主要機能

### お小遣い管理
- TOPページにアカウント一覧（sort_order順）
- パスワード付きアカウントは残高非表示（****円）、🔒アイコン表示
- パスワード認証はTOP画面のモーダルUI（prompt()は使わない）
- 個別ページで追加/使用 → Discord通知
- 設定ページで残高表示ON/OFF、パスワード設定、表示順

### お手伝いポイント（allowance.html）
- TOPの🧹アイコンから遷移
- アカウント選択 → 40/100/200/300/400円のボタンでワンタップ入金
- メモは自動で「お手伝いポイント」

### 管理者ページ（admin.html）
- 管理者PW: mgmlv（TOPの🔧アイコンから認証）
- アカウント一覧・残高（全員分、PW付き含む）
- アカウント追加/削除、PW解除
- 履歴管理（ボタンでアカウント選択 → 編集/削除、残高自動再計算）
- バックアップ（手動DL + GitHub自動バックアップからの復元 + ファイル復元）
- イタズラ設定（トグルスイッチUI、ON=緑/OFF=灰）
  - ぷよコケやすさ10倍
  - 夜間ゲーム制限ON/OFF（localStorage、リロードで戻る）
  - 夜間制限解除パスワード変更（Supabase保存）
  - カウントリセット（ぷよ/ゴキブリ/ランキング）
- アクティビティログ（ぷよ/ゴキブリのフィルタ付き）

### ゴキブリ演出（js/roach.js）
- 管理者PW5回ミスで15匹出現（normal/shy/big/huge/fast）
- 画面操作ロック、クリック/タップで退治
- 30秒後にスプレー🧴出現 → 全滅演出（ミスト+もがき）
- shy個体はマウス/指から逃げる
- 退治数をSupabaseに記録 + activity_log

### ぷよ畑演出（js/garden.js）
- TOP画面の🪴アイコンで発動（クリック=5個追加、長押し=全引き抜き）
- 🌱の芽をタップ → 土煙 → ぷよが飛び出して着地 → 画面端まで歩いて退場
- 種類別の歩行速度: puyo_1(80), puyo_2(60), puyo_3(110), puyo_4(80), puyo_5(70)
- コケる処理: 距離×速度×種類補正で確率計算、puyo_5(白)は8倍コケやすい
- コケモーション: バタン(0.12s) → もぞもぞ → 起き上がり → 駆け足退場
- 引き抜きカウントをSupabaseに記録 + activity_log + リアルタイム表示

### ぷよぷよ風ゲーム（game.html）
- 2個1組で落下、同色4つ以上つながると消える、連鎖対応
- 本家風スコア計算（連鎖ボーナス+連結ボーナス+色数ボーナス）
- ぷよ画像（puyo_1〜5.avif）を使用
- 着地後の回転猶予（回転操作中のみ最大2秒、回転なしは0.3秒）
- スコアランキングTOP10（Supabase保存、名前登録モーダル）
- 夜間制限: 日〜木21時、金土22時〜4時（段階的お叱り、10回で完全ロック）
- 錠前アイコンでパスワード解除可能（PW5回ミスでロック+Discord通知）
- 夜間制限発動時にDiscord通知

### その他
- PWA対応（manifest.json + sw.js）
- GitHub Actions自動バックアップ（毎日AM3:00 JST、14日保持、Discord通知）
- 隠しボタン（TOP左上、2秒以内に5回タップでゴキブリ退治数表示）
- バージョン表示（TOP右下、タップでリリースノートへ）

## 外部サービス

- Supabase: データベース + リアルタイム（puyo_countsテーブル）
- Discord Webhook: 各種通知
  - URL: https://discord.com/api/webhooks/1498552364905529355/6I3vultTaQcYNRjPP76ZtyyyGLG1JWdU7eX3IfMtpGCUWR3sdw2Gn3_pNxHgaS-z9iyG
- GitHub Pages: ホスティング
- GitHub Actions: 自動バックアップ（Secrets: SUPABASE_URL, SUPABASE_KEY, DISCORD_WEBHOOK）

## 開発ルール

- バージョニング: x.y.z（大機能=y、小修正=z、節目=x）
- 現在: v1.8.4
- 修正のたびにindex.htmlのバージョン表示とpages/release-notes.htmlを更新
- リリースノートのタグ: feat(緑), fix(オレンジ), fun(紫), infra(グレー)
- index.htmlの絵文字はHTMLエンティティ（&#x...;）で記述（文字化け防止）
- strReplaceで絵文字を含む行を操作する場合はPowerShellの行番号置換を使う

## 既知の注意点

- Supabaseの全テーブルはRLS無効化済み（DISABLE ROW LEVEL SECURITY）
- SW v3でPOSTリクエストはキャッシュしない（GETのみ）
- puyo_countsのリアルタイム更新には `ALTER PUBLICATION supabase_realtime ADD TABLE puyo_counts;` が必要
- ゲームのSupabaseクライアントは `sbClient`（index.htmlの `client` とは別名）
