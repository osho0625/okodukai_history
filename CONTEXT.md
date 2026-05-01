# お小遣い手帳 - 開発コンテキスト引継ぎ

最終更新: 2026/05/01 v1.16.7

## プロジェクト概要

家族向けお小遣い管理PWAアプリ。GitHub Pages + Supabaseで構成。
小学生の子供たちが使うことを想定した、遊び心のあるアプリ。

- リポジトリ: https://github.com/osho0625/okodukai_history
- 公開URL: https://osho0625.github.io/okodukai_history/
- Supabase Project ID: ynecezxnltigplrfzzoh

## ファイル構成

```
/
├── index.html          # TOPページ（アカウント一覧、admin用🧹⚙️アイコン）
├── manifest.json       # PWA設定
├── sw.js               # Service Worker (v5)
├── CONTEXT.md          # この引継ぎドキュメント
├── pages/
│   ├── child.html      # 個別アカウントページ（残高・承認・ポイント表・家事選択・入出金・履歴）
│   ├── settings.html   # アカウント設定（残高表示ON/OFF、パスワード）
│   ├── admin.html      # 管理者ページ
│   ├── allowance.html  # お小遣い入出金ページ（admin専用）
│   ├── game.html       # ぷよぷよ風パズルゲーム
│   ├── ranking.html    # ゲームスコアランキングTOP10
│   └── release-notes.html # リリースノート
├── images/
│   ├── 2728.png        # アプリアイコン（PWA用）
│   ├── olimar.png      # オリマー画像（透過PNG、完了枚数表示用）
│   └── puyo_1〜5.avif  # ぷよ画像
├── js/
│   ├── roach.js        # ゴキブリ演出
│   └── garden.js       # ぷよ畑演出
├── backups/            # 自動バックアップJSON
└── .github/workflows/
    └── backup.yml      # 毎日AM3:00 JST自動バックアップ
```

## Supabaseテーブル構成

### children（アカウント）
- id: UUID (PK), name: TEXT, balance: INT
- show_balance_on_top: BOOLEAN (default true)
- require_password: BOOLEAN (default false), password: TEXT (nullable)
- sort_order: INT (default 0)

### transactions（入出金履歴）
- id: UUID (PK), child_id: UUID (FK), type: TEXT ('add'/'use'), amount: INT, memo: TEXT, created_at: TIMESTAMPTZ

### chore_types（家事マスタ）
- id: SERIAL (PK), name: TEXT, default_points: INT, sort_order: INT (default 0)

### chore_points（ポイント履歴）
- id: UUID (PK), child_id: UUID (FK), chore_name: TEXT, points: INT, status: TEXT ('approved'/'pending'), created_at: TIMESTAMPTZ

### puyo_counts / roach_counts / activity_log / game_rankings
- 既存テーブル（変更なし）

### game_settings（各種設定、id=1の1行）
- night_password: TEXT, night_limit_enabled: BOOLEAN
- allowance_password: TEXT, admin_password: TEXT

### pending_effects（演出待ちデータ）
- id: UUID (PK), child_id: UUID (FK→children), type: TEXT ('points'/'deposit'), data: JSONB, created_at: TIMESTAMPTZ

## 端末権限（deviceRole）

localStorageに`deviceRole`を保存。管理者ページから設定。
- `admin`: パスワードスキップ、🧹⚙️アイコン表示、入金UI表示、承認可能、演出スキップ
- `user`（デフォルト）: 通常動作、ポイント申請は承認待ち、演出あり
- 管理者ページへのログインは常にパスワード必要

## 主要機能

### TOP画面（index.html）
- アカウント一覧（sort_order順）、ポイント数・次のお小遣い情報表示
- 完了枚数に応じてぷよアイコン（5つでオリマーに変換）
- 未読入金: 🔔アイコン＋入金前残高表示
- 承認待ち: ✅アイコン（全ユーザーに表示）
- admin用: 🧹（入出金ページ）、⚙️（設定モーダル＝表示順変更）
- 🪴（ぷよ畑）、💴（ぷよゲーム）、🔧（管理者認証）

### 個別アカウントページ（child.html）
- 残高表示＋入金演出（フルスクリーンオーバーレイ＋カウントアップ＋紙吹雪）
- ✅ ポイント承認（admin権限のみ、承認待ちがあればデフォルト開）
- ⭐ お手伝いポイント表（20×20=400マス、複数枚対応、○枚目表示）
  - マスに日付表示、タップで家事名ポップアップ
  - マイルストーン行の右に金額ラベル、達成済みにぷよシール
  - 20ptごとにお小遣い自動入金（40円/300円/200円/400円）
  - 返済用アカウント（「〇〇が返すお金」）には半額振り分け
- 🧹 家事選択→ポイント追加（admin=即承認、user=承認待ち）
- 💰 入出金（出金=全ユーザー、入金=adminのみ）
- 📋 履歴
- 演出: ポイント追加スタンプアニメーション→お金演出の連続再生（userのみ）
- 🎉 リプレイ（残高5回タップで出現、ポイント演出→お金演出の順で再生）
- 返済用アカウントではポイント表・家事選択・承認UIを非表示

### お小遣い入出金（allowance.html）
- admin専用、アカウント選択→金額＋メモ→入金/出金
- 返済用アカウントへの半額振り分け対応

### 管理者ページ（admin.html）
- 管理者PW: Supabase game_settings.admin_password
- 👤 アカウント一覧（残高・PW表示・PW解除・削除・追加）
- 📋 おこづかい履歴個別管理（編集/削除、残高自動再計算）
- 🧹 家事マスタ管理（追加/編集/削除/▲▼並べ替え）
- ⭐ ポイント直接設定（お小遣い発生なし、合計ポイント指定、枚数表示）
- 🔓 端末権限設定（admin/user切り替え）
- 🔑 パスワード設定（管理者PW、夜間制限PW）
- 😈 イタズラ設定（コケやすさ10倍=sessionStorage、夜間制限ON/OFF、カウントリセット）
- 📊 アクティビティログ
- 💾 バックアップ（手動DL/GitHub復元/ファイル復元）

### ぷよゲーム（game.html）
- タイトル画面（ぷよ表示＋芽→引き抜き演出、ゲーム開始/ランキング）
- 3秒カウントダウン後にゲーム開始
- 本家風スコア計算、ランキングTOP10
- 夜間制限（日〜木21時、金土22時〜4時）

## localStorage使用一覧

| キー | 用途 | 永続性 |
|------|------|--------|
| deviceRole | 端末権限(admin/user) | 永続 |
| pending_deposit_{childId} | 未読入金演出データ | 消化で削除 |
| last_deposit_{childId} | 直前の入金演出（リプレイ用） | 永続 |
| pending_points_{childId} | 未読ポイント演出データ | 消化で削除 |
| last_points_{childId} | 直前のポイント演出（リプレイ用） | 永続 |
| nightLimitOff | 夜間制限OFF | 永続 |
| nightUnlocked | 夜間制限解除済み | 永続 |

## sessionStorage使用

| キー | 用途 |
|------|------|
| tripBoost | コケやすさ10倍（タブ閉じでリセット） |

## 開発ルール

- バージョニング: x.y.z（構造変更=x、機能追加=y、小修正=z）
- 現在: v1.16.7
- 修正のたびにindex.htmlのバージョン表示とrelease-notes.htmlを更新
- リリースノートのタグ: feat(緑), fix(オレンジ), fun(紫), infra(グレー)
- index.htmlの絵文字はHTMLエンティティで記述
- パスワード類はすべてSupabase game_settingsに保存（ソースにハードコードしない）
- 返済用アカウントは名前が「が返すお金」で終わるもの（汎用パターン）

## 既知の注意点

- Supabaseの全テーブルはRLS無効化済み
- SW v5、ネットワーク優先＋PWA起動時に自動更新チェック＋リロード
- ゲームのSupabaseクライアントは `sbClient`（他ページの `client` とは別名）
- コケやすさ10倍はsessionStorage（タブ閉じでリセット）
- chore_typesのsort_orderカラムがない場合はidでフォールバック
