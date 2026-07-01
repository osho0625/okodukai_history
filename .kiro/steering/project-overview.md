---
inclusion: auto
---

# お小遣い手帳 - プロジェクト概要

最終更新: 2026/07/01 v2.16.0

## 🔴 Steering Files 運用ルール

このプロジェクトはドキュメントが分割されています。ユーザーが特定のアプリ/機能について質問・変更依頼をした場合、**対応するsteering fileを `readFile` で自分で読み込んでください**。

| ユーザーが言及した内容 | 読むべきファイル |
|----------------------|----------------|
| 漢字テスト、kanji | `.kiro/steering/kanji-test.md` |
| ぴくぴく、ぷよ、対戦、puyo | `.kiro/steering/puyo-battle.md` |
| 算数、オリンピック、バトル、math | `.kiro/steering/math-olympiad.md` |
| すいか、suika、RPG | `.kiro/steering/suika-rpg.md` |
| チケット、ticket | `.kiro/steering/tickets.md` |
| TRPG、クトゥルフ | `.kiro/steering/trpg.md` |
| テトミン、ブラスト、オリマー、ゲームセンター | `.kiro/steering/games-misc.md` |
| ごきぶりポーカー、クアルト、コリドール、神経衰弱、ブロックス | `.kiro/steering/board-games.md` |
| サイエンス、science | `.kiro/steering/today-science.md` |
| SCP、scp | `.kiro/steering/today-scp.md` |
| ナースコール、nurse、通話、体温 | `.kiro/steering/nurse-call.md` |
| お手伝いリスト、chore_tasks | `.kiro/steering/chores.md` |
| メモ帳、family-notes、ドキュメント | `.kiro/steering/family-notes.md` |

対象ファイルがエディタで開かれていれば自動で読み込まれますが、チャットのみの場合は上記テーブルを参照して自分で読み込んでください。

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
├── sw.js               # Service Worker (v5, Push通知対応)
├── pages/              # 各機能ページ
├── js/                 # JavaScript モジュール
├── images/             # アプリアイコン・ゲーム画像
├── css/                # スタイルシート
├── data/               # ゲームデータ（算数オリンピック問題等）
├── dict/               # kuromoji辞書ファイル（ひらがな変換用）
├── suika/              # すいかが食べたい（原作アセット+HTML5移植）
├── scripts/            # Cron/ユーティリティスクリプト
│   ├── auto-chore-points.js  # 自動お手伝いポイント付与
│   ├── auto-chore-tasks.js   # 定型業務の毎朝自動追加
│   ├── reminder-notify.js    # リマインダーDiscord通知
│   └── generate-vapid-keys.js
├── sql/                # DBマイグレーション
├── backups/            # 自動バックアップJSON
├── .kiro/specs/today-science/ # 今日のサイエンス機能データ
└── .github/workflows/  # GitHub Actions (auto-chore-points, auto-chore-tasks, backup, push-notify)
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

### chore_tasks（お手伝いリスト）
- id: UUID (PK), title: TEXT, description: TEXT (nullable), checklist: JSONB (nullable)
- points: INT (default 1)
- priority: INT (default 0: ふつう/1: 大事/2: とても大事)
- assign_to: TEXT (nullable、特定の子供名。nullなら全員向け)
- status: TEXT ('active'/'done'/'archived'), done_by: TEXT (nullable), done_at: TIMESTAMPTZ (nullable)
- created_at: TIMESTAMPTZ
- INDEX: idx_chore_tasks_status (status='active')
- RLS無効

### game_rankings（ゲームランキング共通）
- id: UUID, name: TEXT, score: INT, difficulty: TEXT (default 'normal'), created_at: TIMESTAMPTZ

### activity_log
- 既存テーブル（変更なし）

### game_settings（各種設定、id=1の1行）
- night_password: TEXT, night_limit_enabled: BOOLEAN
- allowance_password: TEXT, admin_password: TEXT
- game_publish: JSONB (各ゲームの公開フラグ、例: {"game_pikupiku":true,"game_tetris":false,"game_math_olympiad":true,...})
- chore_templates: JSONB (定型業務テンプレート配列、default '[]')

### pending_effects（演出待ちデータ）
- id: UUID (PK), child_id: UUID (FK→children), type: TEXT ('points'/'deposit'), data: JSONB, created_at: TIMESTAMPTZ

### push_subscriptions（Web Push通知サブスクリプション）
- id: UUID (PK), device_id: TEXT UNIQUE, subscription: JSONB NOT NULL
- child_name: TEXT (nullable), role: TEXT NOT NULL DEFAULT 'user' CHECK IN ('admin','user')
- created_at: TIMESTAMPTZ, updated_at: TIMESTAMPTZ
- INDEX: idx_push_subscriptions_device_id
- RLS無効

### push_messages（Push通知メッセージキュー）
- id: UUID (PK), target_role: TEXT NOT NULL DEFAULT 'user' CHECK IN ('admin','user','all')
- target_child_name: TEXT (nullable), title: TEXT NOT NULL (1-100文字), body: TEXT NOT NULL (1-500文字)
- sent: BOOLEAN NOT NULL DEFAULT false, created_at: TIMESTAMPTZ
- INDEX: idx_push_messages_unsent (sent=false)
- RLS無効
- 全Discord通知トリガー（バックアップ除く）から投入 → GitHub Actions cron（5分毎）で配信

### reminders（リマインダー）
- id: UUID (PK), type: TEXT ('memo'|'event'|'repeat')
- child_id: UUID (FK→children), child_name: TEXT (非正規化、通知用)
- message: TEXT (1-200文字), event_date: DATE (nullable、event型のみ)
- repeat_days: JSONB (nullable、repeat型のみ。曜日配列 [0-6], 0=日, 1=月, ..., 6=土)
- creator_user_id: TEXT NOT NULL (端末識別子), creator_role: TEXT ('admin'|'user')
- custom_schedule: JSONB (nullable、例: ["06:00","21:00"])
- snooze_until: DATE (nullable、通知再開日。current_jst_date < snooze_until で通知停止)
- created_at: TIMESTAMPTZ (UTC), deleted_at: TIMESTAMPTZ (nullable、soft delete)
- CHECK: chk_event_date (type IN ('memo','repeat') OR event_date IS NOT NULL), chk_custom_schedule (NULL OR jsonb array), chk_repeat_days (type != 'repeat' OR repeat_days IS NOT NULL AND array)
- INDEX: idx_reminders_child_id, idx_reminders_type_event_date, idx_reminders_snooze (全てWHERE deleted_at IS NULL)
- RLS無効（既存テーブルと同様）
- soft delete方式: 削除時はdeleted_atにUTCタイムスタンプを設定

## 主要機能

### TOP画面（index.html）
- アカウント一覧（sort_order順）、ポイント数・次のお小遣い情報表示
- 完了枚数に応じてぷよアイコン（5つでオリマーに変換）
- 🔬 今日のサイエンス（日替わり科学tips）
- 🔔 リマインダー通知バナー（タイトル下に表示）
  - メモ型: 全件表示（created_at降順）、admin時×ボタン＋スヌーズボタン
  - くりかえし型: 今日の曜日がrepeat_daysに含まれるもの表示
  - 行事型: event_dateが7日以内のもの表示（event_date昇順）
  - スヌーズ中も表示（Discord通知のみ停止）
- 未読入金: 🔔アイコン＋入金前残高表示
- 承認待ち: ✅アイコン（全ユーザーに表示）
- admin用: 🧹（入出金ページ）、⚙️（設定モーダル＝表示順変更）
- 🪴（ぷよ畑）、🕹️（ゲームセンター）、📋（お手伝いリスト）、🔧（管理者認証）

### 個別アカウントページ（child.html）
- 残高表示＋入金演出（フルスクリーンオーバーレイ＋カウントアップ＋紙吹雪）
- ✅ ポイント承認（admin権限のみ、承認待ちがあればデフォルト開）
- ⭐ お手伝いポイント表（20×20=400マス、複数枚対応、○枚目表示）
  - マスに日付表示、タップで家事名ポップアップ
  - マイルストーン行の右に金額ラベル、達成済みにぷよシール
  - 20ptごとにお小遣い自動入金（40円/300円/200円/400円）
  - 返済用アカウント（「〇〇が返すお金」）には半額振り分け
- 🔔 リマインダー（アコーディオンセクション）
  - 登録フォーム: テキスト(1-200文字) + ラジオ切替（📅日付指定/📝毎日通知/🔁くりかえし）+ 日付入力 or 曜日チェックボックス
  - 日付指定→行事型（7日前から通知）、毎日→メモ型、くりかえし→repeat型（指定曜日に毎週通知）
  - 登録時にDiscord通知送信（3秒タイムアウト）
  - 一覧表示: 自分が作成したリマインダーのみ削除ボタン表示（creator_user_id照合）
  - 3秒デバウンスで重複送信防止
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
- 🔑 AIキー設定（Gemini/Groq/OpenAI APIキーの確認・保存・テスト、app_configテーブル管理）
- 😈 イタズラ設定（コケやすさ10倍=sessionStorage、夜間制限ON/OFF、カウントリセット、未読通知全消去）
- 📊 アクティビティログ
- 💾 バックアップ（手動DL/GitHub復元/ファイル復元）
- 🔔 リマインダー管理（全リマインダー一覧、削除、スヌーズ設定、通知時間カスタマイズ）
  - 通知時間カスタマイズ: `<input type="time">`で複数時間追加/削除、JSONB配列保存
  - スヌーズ: 1-365日、snooze_until日まで通知停止
  - 登録機能なし（登録はchild.htmlからのみ）
- 🔬 今日のサイエンス指定（当日表示する画像を手動選択、Supabase science_overrideに保存、全端末反映）
- 📋 今日のSCP指定（当日表示するSCPを手動選択、Supabase scp_overrideに保存、全端末反映）

## 端末権限（deviceRole）

localStorageに`deviceRole`を保存。管理者ページから設定。
- `admin`: パスワードスキップ、🧹⚙️アイコン表示、入金UI表示、承認可能、演出スキップ
- `user`（デフォルト）: 通常動作、ポイント申請は承認待ち、演出あり
- 管理者ページへのログインは常にパスワード必要

## localStorage 共通キー

| キー | 用途 | 永続性 |
|------|------|--------|
| deviceRole | 端末権限(admin/user) | 永続 |
| pending_deposit_{childId} | 未読入金演出データ | 消化で削除 |
| last_deposit_{childId} | 直前の入金演出（リプレイ用） | 永続 |
| pending_points_{childId} | 未読ポイント演出データ | 消化で削除 |
| last_points_{childId} | 直前のポイント演出（リプレイ用） | 永続 |
| nightLimitOff | 夜間制限OFF | 永続 |
| nightUnlocked | 夜間制限解除済み | 永続 |
| push_device_id | Web Push通知端末識別子（UUID） | 永続 |
| push_subscribed | Web Push購読済みフラグ | 永続 |
| push_banner_dismissed | Push通知バナー非表示タイムスタンプ | 永続 |
| reminder_device_id | リマインダー作成者識別子（UUID、端末ごと） | 永続 |
| science_viewed | 今日のサイエンス閲覧済みIDリスト（JSON配列） | 永続 |
| science_today | 今日のサイエンス当日固定ID（{date,id}） | 日替わり |
| scp_viewed | 今日のSCP閲覧済みIDリスト（JSON配列） | 永続 |
| scp_today | 今日のSCP当日固定ID（{date,id}） | 日替わり |
| neko_infected_date | SCP-040-JP既読日（汚染進行計算用） | 永続 |
| chore_hiragana | お手伝いリストひらがなモード状態 | 永続 |

## sessionStorage 共通キー

| キー | 用途 |
|------|------|
| tripBoost | コケやすさ10倍（タブ閉じでリセット） |

## 開発ルール

- バージョニング: x.y.z（構造変更=x、機能追加=y、小修正=z）
- 現在: v2.16.0
- 修正のたびにindex.htmlのバージョン表示とrelease-notes.htmlを更新
- リリースノートのタグ: feat(緑), fix(オレンジ), fun(紫), infra(グレー)
- index.htmlの絵文字はHTMLエンティティで記述
- パスワード類はすべてSupabase game_settingsに保存（ソースにハードコードしない）
- 返済用アカウントは名前が「が返すお金」で終わるもの（汎用パターン）

### 🔴 毎回必ずやること（絶対に忘れないこと）

**コードに変更を加えたら、作業の最後に以下を必ず更新してからGitプッシュすること：**

1. **`pages/release-notes.html`** — 変更内容をリリースノートの先頭に追記（バージョン番号を上げる）
2. **`sw.js`** — `CACHE_NAME` のバージョン番号を +1 する（例: `okozukai-v7` → `okozukai-v8`）
3. **`index.html`** — 末尾のバージョン表示テキストを新バージョンに更新
4. **`git push`** — 作業ブランチにコミット＆プッシュ（ユーザーに確認不要、自動で行う）

**⚠️ これを省略・忘却してはならない。ユーザーに「プッシュして」と言われる前に自発的に実行すること。**
**⚠️ キャッシュ更新されないとユーザーに変更が届かない。**

## Git ブランチ

| ブランチ | 状態 | 内容 |
|----------|------|------|
| main | 最新 | TSJ260512までマージ済み |
| TSJ260512 | マージ済み | すいかHTML5移植、ぷよHard拡張、けんかチャット等 |
| TSJ260519 | 作業中 | あそびチケット機能、算数オリンピック実装完了、ぴくぴく対戦追加、リマインダー機能、Web Push通知 |
| TSJ260603 | 作業中 | Discord通知トリガーにWeb Push通知キュー追加、自動お手伝いポイント付与cron追加、サイエンス/SCP日付判定JST修正、SCP管理者指定Supabase化 |
| TSJ260618 | 作業中 | お手伝いリスト機能（チェックリスト、定型業務テンプレート、自動追加cron、ひらがなモード、完了→ポイント承認フロー） |

## 既知の注意点

- 全画面の←ボタンはhistory.back()（一つ前の画面に戻る）、🏠は右上でホーム（index.html）に直帰
- ぴくぴくの難易度選択画面・カスタムモード画面に「タイトルに戻る」ボタンはない（←で戻る）
- Supabaseの全テーブルはRLS無効化済み（game_rankings, tetris_rankings, blast_rankingsはRLS有効＋Allow all policy）
- SW v5、ネットワーク優先＋PWA起動時に自動更新チェック＋リロード
- ゲームのSupabaseクライアントは `sbClient`（他ページの `client` とは別名）
- コケやすさ10倍はsessionStorage（タブ閉じでリセット）
- chore_typesのsort_orderカラムがない場合はidでフォールバック
- 個人ページパスワード5回間違い→ゴキブリ発生（管理者PW5回間違いと同様）
- game_rankingsのdifficultyカラムがnullの既存データはnormal扱い

## 詳細ドキュメント（manual steering files）

各アプリ・機能の詳細は以下のsteering filesを参照:

- `kanji-test.md` — 漢字50問テスト
- `puyo-battle.md` — ぴくぴく対戦 + ぷよゲーム
- `math-olympiad.md` — 算数オリンピック + 算数バトル
- `suika-rpg.md` — すいかが食べたい
- `tickets.md` — あそびチケット
- `trpg.md` — クトゥルフTRPG
- `games-misc.md` — テトミン・ピクミンブラスト・オリマーの冒険・ゲームセンター
- `board-games.md` — ごきぶりポーカー・クアルト・コリドール・神経衰弱・ブロックス
- `today-science.md` — 今日のサイエンス
- `today-scp.md` — 今日のSCP
- `family-notes.md` — 家族メモ帳
- `chores.md` — お手伝いリスト
