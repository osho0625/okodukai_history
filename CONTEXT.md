# お小遣い手帳 - 開発コンテキスト引継ぎ

最終更新: 2026/05/12 v1.47.0

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
│   ├── tetris.html     # テトリス風ゲーム（Hold/ハードドロップ/ボタン設定対応）
│   ├── blast.html      # ブロックブラスト風ゲーム（ドラッグ配置/ライン消去演出）
│   ├── olimar.html     # オリマーの冒険（探索RPG）
│   ├── suika.html      # すいかが食べたい（3D RPG HTML5移植）
│   ├── suika-original.html # すいかが食べたい（原作Java版 CheerpJ）
│   ├── ranking.html    # ぷよランキング（難易度別タブ）
│   ├── tetris-ranking.html  # テトリスランキング
│   ├── blast-ranking.html   # ブロックブラストランキング
│   └── release-notes.html # リリースノート
├── images/
│   ├── 2728.png        # アプリアイコン（PWA用）
│   ├── olimar.png      # オリマー画像（透過PNG、完了枚数表示用）
│   └── puyo_1〜9.avif  # ピクミン画像（1:紫, 2:赤, 3:青, 4:黄, 5:白, 6:氷, 7:岩, 8:羽, 9:光）
├── js/
│   ├── common.js       # 共通設定・ユーティリティ（Supabaseクライアント、Discord通知等）
│   ├── olimar-scenario.js # オリマーの冒険シナリオデータ（62ノード）
│   ├── puyo-escape.js  # ぷよ逃走アニメーション共通処理
│   ├── roach.js        # ゴキブリ演出
│   └── garden.js       # ぷよ畑演出
├── backups/            # 自動バックアップJSON
├── suika/              # すいかが食べたい（原作アセット+HTML5移植）
│   ├── web/            # HTML5版エンジン（main.js + engine/21モジュール）
│   ├── data/           # ゲームデータ（モデル/ステージ/イベント/パラメータ）
│   ├── image00-31.gif  # スプライト/UI画像
│   ├── efc_00-29.au    # 効果音
│   ├── decompiled/     # 逆コンパイル済みJavaソース（参考用）
│   └── ANALYSIS.md     # 解析ドキュメント
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
- game_rankings: id UUID, name TEXT, score INT, difficulty TEXT (default 'normal'), created_at TIMESTAMPTZ

### tetris_rankings（テトリスランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### blast_rankings（ブロックブラストランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### game_settings（各種設定、id=1の1行）
- night_password: TEXT, night_limit_enabled: BOOLEAN
- allowance_password: TEXT, admin_password: TEXT
- game_publish: JSONB (各ゲームの公開フラグ、例: {"game_pikupiku":true,"game_tetris":false,...})

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

### ゲームセンター（arcade.html）
- TOP画面の🕹️アイコンからアクセス
- ぷよ、テトリス、ブロックブラスト、オリマーの冒険、すいかが食べたい、すいか原作Java版の6ゲームをカード形式で表示
- game_settings.game_publish で各ゲームの公開/非公開を制御

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
- イベントスクリプト75コマンド完全対応
- 戦闘: ターン制、スキル5種、状態異常5種、敵AI5カテゴリ、クリティカル
- ショップ: 道具屋/武器屋/勾玉屋/土産屋/合成屋（14レシピ）
- 初期状態: area 0, pos(16,35), 主人公1人, 1000G, 回復草×3（原作CInitGame準拠）

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

## sessionStorage使用

| キー | 用途 |
|------|------|
| tripBoost | コケやすさ10倍（タブ閉じでリセット） |

## 開発ルール

- バージョニング: x.y.z（構造変更=x、機能追加=y、小修正=z）
- 現在: v1.47.0
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
