---
inclusion: fileMatch
fileMatchPattern: "*tetris*,*blast*,*olimar*,*arcade*"
---

# テトリス・ブロックブラスト・オリマーの冒険・ゲームセンター

## ファイル構成

- `pages/tetris.html` — テトリス風ゲーム（Hold/ハードドロップ/ボタン設定対応）
- `pages/tetris-ranking.html` — テトリスランキング
- `pages/blast.html` — ブロックブラスト風ゲーム（ドラッグ配置/ライン消去演出）
- `pages/blast-ranking.html` — ブロックブラストランキング
- `pages/olimar.html` — オリマーの冒険（探索RPG）
- `pages/arcade.html` — ゲームセンター（ゲーム一覧）
- `pages/memory-game.html` — 神経衰弱（カードめくり記憶力ゲーム）
- `js/olimar-scenario.js` — オリマーの冒険シナリオデータ（62ノード）
- `images/olimar.png` — オリマー画像（透過PNG、完了枚数表示用）

## テトリス（tetris.html）

- タイトル画面（ゲーム開始/ランキング/設定）
- 10×20グリッド、ゴースト表示、NEXT表示
- Hold機能（💾ボタン、1ターン1回、Cキー/Shift対応）
- ソフトドロップ（↓）とハードドロップ（⏬）
- 操作ボタン配置カスタマイズ＋ボタン表示/非表示設定
- ランキングTOP10（tetris_rankings）

## ブロックブラスト（blast.html）

- タイトル画面（ゲーム開始/ランキング）
- 8×8グリッド、3ピースから選んで配置
- ドラッグ＆ドロップまたはタップで配置（プレビュー表示）
- 行/列が揃ったら消去（フラッシュ＋パーティクル演出）
- ランキングTOP10（blast_rankings）

## オリマーの冒険（olimar.html + js/olimar-scenario.js）

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

### 章構成
| 章 | エリア | 入手ピクミン | ギミック |
|----|--------|-------------|---------|
| 1 | 不時着地点・森・洞窟 | 赤(火に強い) | 炎、暗闘、敵 |
| 2 | 水辺の谷 | 青(水中OK) | 水流、滝の裏 |
| 3 | 雷鳴の丘 | 黄(電気耐性) | 電気柵 |
| 4 | 毒の沼地 | 白(毒耐性+小さい) | 毒霧、小さな穴 |
| 5 | 凍てつく洞窟 | 紫(力強い)+氷(凍らせる) | 重い氷塊、氷を溶かす。エンジニア救出 |
| 6 | 岩山の砦 | 岩(壁破壊) | 崩れた壁、敵の巣。パイロット救出 |
| 7 | 天空の庭 | 羽(飛べる)+光(闇を照らす) | 浮島、暗い通路 |

### シーン描画（Canvas水彩風）
crash, forest, sprout, pond, rock, cave, river, hill, swamp, ice, sky

### テキストルール
- セリフ・心理描写なし（状況説明のみ）。他キャラのセリフはOK
- 全テキストにrubyタグでふりがな
- 2行ずつタップ送り、全テキスト表示後に選択肢出現

### ピクミンインデックス（PUYO_IMGS）
0=紫, 1=赤, 2=青, 3=黄, 4=白, 5=氷, 6=岩, 7=羽, 8=光

## ゲームセンター（arcade.html）

- TOP画面の🕹️アイコンからアクセス
- ぷよ、テトリス、ブロックブラスト、オリマーの冒険、すいかが食べたい、すいか原作Java版、算数オリンピック、漢字50問テスト、クトゥルフTRPG、ごきぶりポーカー、クアルト、神経衰弱をカード形式で表示
- game_settings.game_publish で各ゲームの公開/非公開を制御
- クトゥルフTRPGはadmin限定（data-admin-only属性で非admin時は非表示）

## 神経衰弱（memory-game.html）

- 3難易度（かんたん6ペア/ふつう8ペア/むずい12ペア）
- カードをめくって同じ絵柄のペアを見つける記憶力ゲーム
- 3Dフリップアニメーション、手数・タイマー表示
- ペア成立時に緑ハイライト演出
- 結果画面でタイム・手数・難易度を表示

## DBテーブル

### tetris_rankings（テトリスランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

### blast_rankings（ブロックブラストランキング）
- id: UUID (PK), name: TEXT, score: INT, created_at: TIMESTAMPTZ

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| tetrisCtrlOrder | テトリス操作ボタン並び順 | 永続 |
| tetrisHiddenBtns | テトリス非表示ボタン | 永続 |
| olimar_device_id | オリマーの冒険端末ID | 永続 |
| olimar_save_{deviceId} | オリマーの冒険セーブデータ | 永続 |
| olimar_achievements | オリマーの冒険実績 | 永続 |
