# お小遣い手帳 - 開発コンテキスト引継ぎ

最終更新: 2026/05/25 v1.83.2

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
│   ├── arcade.html     # ゲームセンター（ゲーム一覧）
│   ├── game.html       # ぷよぷよ風パズルゲーム（難易度選択対応）
│   ├── puyo-battle.html # ぴくぴく対戦（オンライン2人対戦、お邪魔ぷよ）
│   ├── tetris.html     # テトリス風ゲーム（Hold/ハードドロップ/ボタン設定対応）
│   ├── blast.html      # ブロックブラスト風ゲーム（ドラッグ配置/ライン消去演出）
│   ├── olimar.html     # オリマーの冒険（探索RPG）
│   ├── suika.html      # すいかが食べたい（3D RPG HTML5移植）
│   ├── suika-original.html # すいかが食べたい（原作Java版 CheerpJ）
│   ├── ranking.html    # ぷよランキング（難易度別タブ）
│   ├── tetris-ranking.html  # テトリスランキング
│   ├── blast-ranking.html   # ブロックブラストランキング
│   ├── release-notes.html # リリースノート
│   ├── ticket.html    # あそびチケット（一覧・使用・履歴）
│   ├── math-olympiad.html # 算数オリンピック（思考力チャレンジ）
│   └── trpg-cthulhu.html # クトゥルフTRPGシナリオリーダー（KP用・admin限定）
├── images/
│   ├── 2728.png        # アプリアイコン（PWA用）
│   ├── olimar.png      # オリマー画像（透過PNG、完了枚数表示用）
│   └── puyo_1〜9.avif  # ピクミン画像（1:紫, 2:赤, 3:青, 4:黄, 5:白, 6:氷, 7:岩, 8:羽, 9:光）
├── js/
│   ├── common.js       # 共通設定・ユーティリティ（Supabaseクライアント、Discord通知等）
│   ├── olimar-scenario.js # オリマーの冒険シナリオデータ（62ノード）
│   ├── trpg-poisoned-soup-scenario.js # クトゥルフTRPG「毒入りスープ」シナリオデータ（10ノード）
│   ├── puyo-escape.js  # ぷよ逃走アニメーション共通処理
│   ├── roach.js        # ゴキブリ演出
│   └── garden.js       # ぷよ畑演出
├── css/
│   └── puyo-escape.css # ぷよ逃走アニメーション共通CSS（game.html, puyo-battle.htmlで共有）
├── backups/            # 自動バックアップJSON
├── data/
│   └── math-olympiad-problems.json # 算数オリンピック問題データ（小5:170問、小3:40問、小1:40問）
├── suika/              # すいかが食べたい（原作アセット+HTML5移植）
│   ├── web/            # HTML5版エンジン（main.js + engine/21モジュール）
│   ├── data/           # ゲームデータ（モデル/ステージ/イベント/パラメータ）
│   ├── image00-31.gif  # スプライト/UI画像
│   ├── efc_00-29.au    # 効果音
│   ├── decompiled/     # 逆コンパイル済みJavaソース（参考用）
│   └── ANALYSIS.md     # 解析ドキュメント
├── sql/
│   ├── create_tickets_table.sql # ticketsテーブルマイグレーション
│   └── math_olympiad_answers.sql # 算数オリンピックテーブルマイグレーション
├── .github/workflows/
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
- game_rankings: id UUID, name TEXT, score INT, difficulty TEXT (default 'normal'), created_at TIMESTAMPTZ

### tetris_rankings（テトリスランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### blast_rankings（ブロックブラストランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### math_olympiad_answers（算数オリンピック回答）
- id: UUID (PK), user_id: UUID NOT NULL, user_name: TEXT NOT NULL
- problem_id: INT NOT NULL, answer_text: TEXT NOT NULL, thinking_note: TEXT DEFAULT ''
- elapsed_seconds: INT NOT NULL, hints_used: INT DEFAULT 0
- status: TEXT DEFAULT 'pending' CHECK IN ('pending', 'reviewed')
- score: INT (nullable), admin_comment: TEXT (nullable)
- submitted_at: TIMESTAMPTZ DEFAULT now(), reviewed_at: TIMESTAMPTZ (nullable)
- UNIQUE(user_id, problem_id)
- INDEX: idx_math_answers_user_id, idx_math_answers_status
- RLS有効: SELECT/INSERT全許可、UPDATE=status='pending'のみ

### puyo_battles（ぷよ対戦ルーム）
- id: UUID (PK), room_code: TEXT UNIQUE, player1_name: TEXT, player2_name: TEXT
- passcode: TEXT (nullable、数字4桁、NULLならパスコードなし)
- difficulty: JSONB DEFAULT '{"type":"normal"}' (type: easy/normal/hard/special/custom、custom時はsettingsオブジェクト含む)
- status: TEXT DEFAULT 'waiting' CHECK IN ('waiting', 'playing', 'finished')
- winner: TEXT, created_at: TIMESTAMPTZ, finished_at: TIMESTAMPTZ
- RLS無効

### game_settings（各種設定、id=1の1行）
- night_password: TEXT, night_limit_enabled: BOOLEAN
- allowance_password: TEXT, admin_password: TEXT
- game_publish: JSONB (各ゲームの公開フラグ、例: {"game_pikupiku":true,"game_tetris":false,"game_math_olympiad":true,...})

### pending_effects（演出待ちデータ）
- id: UUID (PK), child_id: UUID (FK→children), type: TEXT ('points'/'deposit'), data: JSONB, created_at: TIMESTAMPTZ

### tickets（あそびチケット）
- id: UUID (PK), ticket_no: BIGINT UNIQUE (sequence), owner: TEXT CHECK IN ('かいせい','はるちか','いろは')
- duration_minutes: INT CHECK 5-480, status: TEXT DEFAULT 'unused' CHECK IN ('unused','pending','approved','used')
- created_at: TIMESTAMPTZ, used_at: TIMESTAMPTZ, reserved_at: TIMESTAMPTZ
- CONSTRAINT chk_ticket_status_consistency (status/used_at/reserved_at整合性)
- INDEX: idx_tickets_owner_status, idx_tickets_used_at, idx_tickets_status_ticket_no, idx_tickets_status_reserved
- RLS無効（deviceRole制御のみ）
- 予約フロー: unused→pending(予約申請)→approved(承認)→used(予約日時到来で自動消化)
- 却下/取消: pending→unused / approved→unused（予約日時前のみ）

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
- 🪴（ぷよ畑）、�️（ゲームセンター）、🔧（管理者認証）

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
- 🔑 AIキー設定（Gemini/Groq/OpenAI APIキーの確認・保存・テスト、app_configテーブル管理）
- 😈 イタズラ設定（コケやすさ10倍=sessionStorage、夜間制限ON/OFF、カウントリセット、未読通知全消去）
- 📊 アクティビティログ
- 💾 バックアップ（手動DL/GitHub復元/ファイル復元）

### ぷよゲーム（game.html）
- タイトル画面（ぷよ表示＋芽→引き抜き演出、ゲーム開始→難易度選択/ランキング）
- 難易度選択: Easy(4色/遅い/最速400ms), Normal(5色/普通/最速200ms), Hard(6色/速い/最速150ms), Special(9色/速い/最速100ms/8×16盤面)
- Hard/Specialはロック制（localStorage管理、Normal3万点→Hard解除、Hard3万点→Special解除）
- ロック中の難易度タップで解除条件モーダル表示
- ロック解除時に鍵揺れ→壊れ→解放演出（難易度選択画面を開いた時に再生）
- 再ロック: 「難易度を選択」テキスト10回タップで確認ダイアログ
- admin限定🧪デバッグモード（解除閾値を10点に一時変更、sessionStorage）
- 難易度選択画面にフレーバーテキスト表示（アイコンなし）
- 難易度比較表はランキングページにadmin限定で表示
- 加速はEasy以外すべて同じ（accel:25）、初期速度のみ差別化
- 2段階加速: 150msまでは通常ペース、150ms以下は緩やかに加速（50000点で最速到達）
- Hard最速150ms、Special最速100ms
- 3秒カウントダウン後にゲーム開始
- 本家風スコア計算、ランキングTOP10（難易度別）
- 操作ボタン配置カスタマイズ（⚙️アイコン、タップ入れ替え方式、localStorage保存）
- 夜間制限（日〜木21時、金土22時〜4時）

### あそびチケット（ticket.html）
- 紙の「あそびチケット」をデジタル化。管理者（つじ）が発行、子供が使用
- child.htmlの🎫アイコンからアクセス（?owner=名前）
- admin/user両方閲覧・予約可能（ownerパラメータで表示対象を決定）
- 未使用タブ: チケットカード一覧（紙デザインCSS再現）、Admin=Owner別グループ表示
- 予約中タブ: pending/approvedチケット一覧
- 履歴タブ: 使用済みチケット（used_at降順）
- 予約フロー: 「予約する」→日付選択→時間帯選択（朝/昼/夜ごはんのあと or 時間指定）→pending状態に
- 時間帯選択: 曜日制限なし（朝/昼/夜すべて選択可能）
- 発行: admin.htmlの「🎫 チケット発行」セクション（Owner選択、時間5-480分、枚数1-100）
- 承認/却下/取消: admin権限のみ
- オフライン: localStorageキャッシュ表示、操作ボタン無効化
- Discord通知: 予約時・承認時（3秒タイムアウト、失敗してもUX止めない）
- XSSエスケープ: esc()関数で全DB値をサニタイズ
- URL改ざん対策: VALID_OWNERSチェック

### ゲームセンター（arcade.html）
- TOP画面の🕹️アイコンからアクセス
- ぷよ、テトリス、ブロックブラスト、オリマーの冒険、すいかが食べたい、すいか原作Java版、算数オリンピック、クトゥルフTRPGの8ゲームをカード形式で表示
- game_settings.game_publish で各ゲームの公開/非公開を制御
- クトゥルフTRPGはadmin限定（data-admin-only属性で非admin時は非表示）

### 算数オリンピック（pages/math-olympiad.html）
- 思考力育成アプリ。算数オリンピック風の問題を1問ずつ提示
- 単一HTML内6ビュー切り替え（SPA風）: 登録/問題一覧/回答/提出完了/結果/管理者採点
- 問題データ: data/math-olympiad-problems.json（70問、5ジャンル×難易度4段階）
- ジャンル: number_pattern/geometry/logic/combinatorics/word_problem
- 難易度: Lv1(10分)/Lv2(20分)/Lv3(30分+)
- ユーザー識別: user_id(UUID) + user_name（表示用）、localStorage管理
- 回答提出: select→insert/update分離（upsert不使用）、pending中は上書き可、reviewed後は不可
- 段階ヒント: 最大3段階、sessionStorage永続化
- タイマー: バックグラウンド計測、sessionStorage永続化（6時間で期限切れ）
- ドラフト保存: answer/thinking入力をsessionStorageに自動保存
- 管理者採点: deviceRole=admin限定、テンプレートコメント5種
- DOMPurify: rubyタグ対応（ALLOWED_TAGS: ruby, rt, br）
- オフライン: sw.jsでHTML+JSONキャッシュ、提出はオンライン時のみ
- game_settings.game_publish.game_math_olympiad で公開制御

### クトゥルフTRPG シナリオリーダー（pages/trpg-cthulhu.html + js/trpg-poisoned-soup-scenario.js）
- KP（管理者）向けTRPGシナリオ進行ツール。admin限定アクセス
- ゲームブック方式ではなく、KPが自由にシーン間を移動する設計
- SPA風ビュー切り替え: シナリオ選択 → シーン表示 + オーバーレイ（目次/マップ/NPC）
- シナリオ選択画面: SCENARIO_REGISTRY配列からカード描画、続きから/クリア済み表示
- Dynamic script load: window.TRPG_SCENARIOS[id]方式、5000msタイムアウト、連打防止
- シーン自由遷移: TOC/マップ/関連シーンから任意のシーンへ移動可能
- KPメモ: 折りたたみ表示、判定値・NPC指針・演出ヒント
- マップ: SVG描画、場所ノード＋接続線、現在地ハイライト、タップで遷移
- NPC一覧: 折りたたみ式詳細（秘密表示）
- フェーズ別目次: キーワードフィルタ付き
- 進行状態: localStorage保存（シナリオごと独立）、Back/Reset対応
- フォントサイズ: CSS custom property方式（小/中/大）
- セッション終了: endingフェーズでボタン表示、Completion_State保存
- ダークテーマ（クトゥルフ風: deep green/purple系）
- game_settings.game_publish.game_trpg_cthulhu で公開制御
- 初回シナリオ「毒入りスープ」: 10ノード、3NPC、5ロケーション、4フェーズ
- localStorage keys: trpg_cthulhu_progress_{id}, trpg_cthulhu_completed_{id}, trpg_cthulhu_font_size

### すいかが食べたい（pages/suika.html + suika/web/）
- Java Applet RPG「すいかが食べたい」(2002-2008 くろすけ)のHTML5/Canvas完全移植
- ソフトウェア3Dレンダラ（Canvas 2D）、400×320px、約11FPS
- game_settings.game_publish.game_suika で公開制御
- 原作Java版: pages/suika-original.html（CheerpJ 4.3、PC専用）
  - game_settings.game_publish.game_suika_java で公開制御
- セーブ: localStorage `suika_save`（オートセーブ+手動セーブ）
- スマホ: タッチUI自動表示（アナログスティック+A/B/◀▶/≡ボタン）
- 原作アセット: suika/ 配下（モデル204個、画像32枚、SE30個、ステージ/イベント/パラメータ）
- エンジン構成: suika/web/engine/ に21モジュール
- イベントスクリプト75コマンド完全対応（再帰深度制限50）
- 戦闘: ターン制、スキル5種、状態異常5種、敵AI20プロファイル、クリティカル、剣技コンボ
- 戦闘コマンド: こうげき/まほう/アイテム/ぼうぎょ/にげる/盗む/ぶん取る
- 14種スキルアニメーション（炎/氷/雷/風/聖/闇/回復/バフ/デバフ/毒/ドレイン/斬撃/爆発/連撃）
- ショップ: 道具屋/武器屋/勾玉屋/土産屋/合成屋（14レシピ）、購入確認ダイアログ付き
- 勾玉: 17種、AP管理、7スキル習得、砕散、キャラ専用制限
- パスワード: 生成+読込（原作CPassCode完全準拠318文字）
- 名前入力: ひらがな/カタカナ切替、デフォルト「西瓜太郎」
- キャラ名: 主人公=西瓜太郎、仲間1=うな、仲間2=かるび（原作準拠）
- システムメニュー: アイテム/特技/装備/勾玉/ステータス/コマンド/設定/マップ/セーブ/じゅもん
- 設定: SE音量(デフォルトOFF)/戦闘速度(4段階)/エンカウント率(4段階)
- 宇宙背景（CCosmo）: フラグ330/331でフィールド+戦闘に星空表示
- 船移動: ワールドマップ上で方向キー移動+着陸
- 忍び足/猫目: スキル/アイテムで発動
- 壁越しNPC会話防止（ライン上の壁チェック）
- EXP: 累積方式、原作公式 lv*lv*(lv+1)*10
- レベルアップ: 乗算方式（prmUpsテーブル準拠）
- 逃走: AGI+DEX比較方式（原作準拠）
- 初期状態: area 0, pos(16,35), 主人公1人, 1000G, 回復草×3（原作CInitGame準拠）
- 唯一の未実装: CEfcWork（3Dエフェクト120パターン）→ 2Dスキルアニメーションで代替

### ぴくぴく対戦（puyo-battle.html）
- ぴくぴく(game.html)タイトル画面の「2人であそぶ」から遷移
- Supabase Realtimeによるオンラインマルチプレイヤー対戦（最大6人）
- マッチング: ルーム一覧から選んで参加（コード入力不要）
- パスコード: 任意で数字4桁を設定可能（デフォルトなし）
- 難易度: ルーム作成時に選択（Easy/Normal/Hard/Special/カスタム）
  - 解放済みの難易度のみ選択可能（localStorage参照）
  - カスタムモード: 色数/盤面サイズ/速度を自由設定
- 再戦機能: 「もういちど」ボタンで同じ相手と連戦（両者同意制、30秒タイムアウト）
- 3人以上入室: 先に入った2人が対戦、3人目以降は観戦/順番待ちを選択
- 勝ち残り方式: 勝者が残り、順番待ち先頭と対戦。敗者は待ちリスト末尾へ。5秒インターバル後に自動開始
- 観戦のみ制限: ルーム作成時チェックボックスで順番待ちを無効化（👁アイコン表示）
- 参加者パネル: 全参加者の役割（🎮対戦/👁観戦/⏳順番待ち/👑オーナー）・連勝数表示
- 再接続: 30秒grace period、役割保持、Active_Playerのinput即時freeze
- オーナーシップ: heartbeat 5秒間隔、15秒タイムアウトで最古参に自動移譲、claim tie-break
- 状態管理: Owner権威モデル、stateId={epoch,version}、epoch++でsplit-brain防止
- お邪魔ぷよ: 連鎖スコア÷70個を相手に送信、相殺あり
- お邪魔ぷよ仕様: puyo_10画像で表示、連鎖に参加しない、隣接消去で消える、1行に1穴
- 予告表示: 岩(30個)/大(6個)/小(1個)
- 連鎖演出: ノーマルモードと同等の逃走アニメーション（4段階: burst→scatter→getup→run）
- 落下アニメーション: 連鎖消去後の重力落下を補間描画（ノーマルモードと同じ `y += (targetY - y) * 0.12`）
- 連鎖テキスト: 2連鎖以上で「N連鎖!」をローカル盤面上部に表示
- パーティクル: 消去時に破片エフェクト（ローカルcanvasのみ）
- 特殊ぷよモーション: puyo_8(羽)=飛行、puyo_9(光)=浮遊（puyo-escape.js共通処理）
- ぷよ出現順序同期: seeded PRNG（mulberry32）で両者同一のぷよ色列を生成
  - シード: crypto.getRandomValues生成、ルーム参加時にbroadcast共有
  - お邪魔ぷよ穴位置: 別系列PRNG（seed ^ 0xDEADBEEF）
  - 再接続: PRNG内部state直接復元
- 通信: Supabase Realtime Broadcast（room_state_sync権威モデル + 個別イベント）
- アニメーションはローカル表示のみ（通信同期しない）
- 相手の落下中ぷよ・NEXTぷよもリアルタイム描画
- モジュール構成: js/puyo-room-state.js, js/puyo-ownership.js, js/puyo-reconnect.js, js/puyo-battle-main.js
- DB: puyo_battlesテーブル（room_code, status, passcode, difficulty, spectator_only, owner_client_id, max_players, updated_at）
- game_settings.game_publish不要（ぴくぴくタイトルから直接遷移）

### テトリス（tetris.html）
- タイトル画面（ゲーム開始/ランキング/設定）
- 10×20グリッド、ゴースト表示、NEXT表示
- Hold機能（💾ボタン、1ターン1回、Cキー/Shift対応）
- ソフトドロップ（↓）とハードドロップ（⏬）
- 操作ボタン配置カスタマイズ＋ボタン表示/非表示設定
- ランキングTOP10（tetris_rankings）

### ブロックブラスト（blast.html）
- タイトル画面（ゲーム開始/ランキング）
- 8×8グリッド、3ピースから選んで配置
- ドラッグ＆ドロップまたはタップで配置（プレビュー表示）
- 行/列が揃ったら消去（フラッシュ＋パーティクル演出）
- ランキングTOP10（blast_rankings）

### オリマーの冒険（olimar.html + js/olimar-scenario.js）
- Ruina風ゲームブック形式RPG（テキスト＋選択肢で物語進行）
- スマホ向けUI、ふりがな付き全テキスト
- シナリオデータは `js/olimar-scenario.js` に分離（Object.assign方式）
- 全7章＋脱出パート、62ノード、エンディングまで実装済み
- セーブ: localStorage、端末ごと1スロット、自動セーブ（S&L不可）
- 実績: 10種（端末ごと管理）
- マップ: Canvas描画、探検キット入手後に使用可能
- 9種ピクミン全入手、仲間2人（エンジニア・パイロット）救出
- 脱出パート: 4パーツ集め（通信モジュール/推進コイル/耐熱シールド/エネルギーセル）→修理→エンディング
- オリマーのロケットは修理不能。仲間のロケットを修理して脱出。通信モジュールだけ再利用

#### 章構成
| 章 | エリア | 入手ピクミン | ギミック |
|----|--------|-------------|---------|
| 1 | 不時着地点・森・洞窟 | 赤(火に強い) | 炎、暗闘、敵 |
| 2 | 水辺の谷 | 青(水中OK) | 水流、滝の裏 |
| 3 | 雷鳴の丘 | 黄(電気耐性) | 電気柵 |
| 4 | 毒の沼地 | 白(毒耐性+小さい) | 毒霧、小さな穴 |
| 5 | 凍てつく洞窟 | 紫(力強い)+氷(凍らせる) | 重い氷塊、氷を溶かす。エンジニア救出 |
| 6 | 岩山の砦 | 岩(壁破壊) | 崩れた壁、敵の巣。パイロット救出 |
| 7 | 天空の庭 | 羽(飛べる)+光(闇を照らす) | 浮島、暗い通路 |

#### シーン描画（Canvas水彩風）
crash, forest, sprout, pond, rock, cave, river, hill, swamp, ice, sky

#### テキストルール
- セリフ・心理描写なし（状況説明のみ）。他キャラのセリフはOK
- 全テキストにrubyタグでふりがな
- 2行ずつタップ送り、全テキスト表示後に選択肢出現

#### ピクミンインデックス（PUYO_IMGS）
0=紫, 1=赤, 2=青, 3=黄, 4=白, 5=氷, 6=岩, 7=羽, 8=光

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
| puyoCtrlOrder | ぷよ操作ボタン並び順 | 永続 |
| tetrisCtrlOrder | テトリス操作ボタン並び順 | 永続 |
| tetrisHiddenBtns | テトリス非表示ボタン | 永続 |
| puyo_hard_unlocked | ぷよHard解除フラグ | 永続 |
| puyo_special_unlocked | ぷよSpecial解除フラグ | 永続 |
| puyo_hard_unlock_pending | Hard解除演出待ち | 消化で削除 |
| puyo_special_unlock_pending | Special解除演出待ち | 消化で削除 |
| olimar_device_id | オリマーの冒険端末ID | 永続 |
| olimar_save_{deviceId} | オリマーの冒険セーブデータ | 永続 |
| olimar_achievements | オリマーの冒険実績 | 永続 |
| suika_save | すいかが食べたいセーブデータ（JSON） | 永続 |
| suika_se_volume | すいかSE音量（0〜1） | 永続 |
| suika_battle_speed | すいか戦闘速度（0〜3） | 永続 |
| suika_encounter_rate | すいかエンカウント率（0〜3） | 永続 |
| ticketCache_unused | オフライン表示用キャッシュ（未使用チケット） | 永続 |
| ticketCache_used | オフライン表示用キャッシュ（使用済みチケット） | 永続 |
| ticketCache_reserved | オフライン表示用キャッシュ（予約中チケット） | 永続 |
| math_olympiad_user | 算数オリンピック ユーザー名（表示用） | 永続 |
| math_olympiad_user_id | 算数オリンピック ユーザーUUID（DB識別子） | 永続 |
| math_hint_history | 算数オリンピック ヒント使用履歴（問題ID→使用回数） | 永続 |
| trpg_cthulhu_progress_{scenarioId} | TRPGシナリオ進行状態（JSON） | 永続 |
| trpg_cthulhu_completed_{scenarioId} | TRPGシナリオ完了状態（JSON） | 永続 |
| trpg_cthulhu_font_size | TRPGフォントサイズ設定（small/medium/large） | 永続 |

## sessionStorage使用

| キー | 用途 |
|------|------|
| tripBoost | コケやすさ10倍（タブ閉じでリセット） |
| math_timer_start | 算数オリンピック タイマー開始時刻 |
| math_current_problem | 算数オリンピック 現在の問題ID |
| math_hints_revealed | 算数オリンピック 表示済みヒント数 |
| math_answer_draft | 算数オリンピック 回答ドラフト |
| math_thinking_draft | 算数オリンピック 考え方メモドラフト |

## 開発ルール

- バージョニング: x.y.z（構造変更=x、機能追加=y、小修正=z）
- 現在: v1.83.3
- 修正のたびにindex.htmlのバージョン表示とrelease-notes.htmlを更新
- リリースノートのタグ: feat(緑), fix(オレンジ), fun(紫), infra(グレー)
- index.htmlの絵文字はHTMLエンティティで記述
- パスワード類はすべてSupabase game_settingsに保存（ソースにハードコードしない）
- 返済用アカウントは名前が「が返すお金」で終わるもの（汎用パターン）

### 🔴 毎回必ずやること（絶対に忘れないこと）

**コードに変更を加えたら、作業の最後に以下3つを必ず更新すること：**

1. **`pages/release-notes.html`** — 変更内容をリリースノートの先頭に追記（バージョン番号を上げる）
2. **`sw.js`** — `CACHE_NAME` のバージョン番号を +1 する（例: `okozukai-v7` → `okozukai-v8`）
3. **`index.html`** — 末尾のバージョン表示テキストを新バージョンに更新

**これを忘れると本番反映時にキャッシュが更新されず、ユーザーに変更が届かない。**

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


## Git ブランチ

| ブランチ | 状態 | 内容 |
|----------|------|------|
| main | 最新 | TSJ260512までマージ済み |
| TSJ260512 | マージ済み | すいかHTML5移植、ぷよHard拡張、けんかチャット等 |
| TSJ260519 | 作業中 | あそびチケット機能、算数オリンピック実装完了、ぴくぴく対戦追加 |
