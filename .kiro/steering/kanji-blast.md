---
inclusion: fileMatch
fileMatchPattern: "*kanji-blast*,*kanji_blast*"
---

# 漢字合体 -カンジニオン-（縦STG + 漢字合体パズル）

漢字のパーツを集めて合体させ、より複雑で強い漢字を作る縦スクロールSTG。
漢字の成り立ちと読み仮名を遊びながら学べる教育要素つき。対象は小学1・3・5年生
（漢字範囲の縛りなし）。

> 名称は「**漢字合体 -カンジニオン-**」に統一（UI・ドキュメント呼称とも）。
> ただし内部ID・ファイル名・テーブル名はデータ整合のため `kanji-blast` / `kanji_*` のまま。

## ファイル構成

- `pages/kanji-blast.html` — 画面（プレイヤー選択/メニュー/STG/合体・手持ち/図鑑）
- `js/kanji-blast.pure.js` — 純粋関数の**唯一の実体**（読み判定・強さ計算・合体/分解の+値など）。
  classic script でグローバル公開し、`kanji-blast.js` より前に読み込む。vitest からは import して同一実体を検証（`tests/kanji-blast/`）
- `js/kanji-blast.js` — ゲームロジック全体（STG本体・合体/分解・読み判定・図鑑）。純粋関数は pure.js の薄いラッパー
- `sql/create_kanji_blast_tables.sql` — テーブル定義5つ
- `sql/seed_kanji_blast_data.sql` — 漢字マスタ・合体レシピ初期データ

## コアループ

1. 縦STGで敵・ボスを倒す（自機ドラッグ移動＋自動連射、必殺技ボタン）
2. ボス撃破で基本パーツ漢字がドロップ、取ると手持ち（最大10枠）に追加
3. 合体パートでレシピに沿って漢字を合成（2〜3素材。例: 木+木=林、口+口+口=品）
4. 分解で合体漢字を素材（2〜3個）に戻せる（画数が大きいパーツを含むレシピを優先）
5. 不要な漢字は「にがす」で手持ちを空ける
6. 漢字を「ショット」「必殺技」に1つずつ装備
7. 読み仮名を入力→正解なら図鑑登録＆強化
8. 図鑑の登録数が増えると全体が強くなる

## 強さ計算式

```
最終パワー = round(
  画数 × 漢検級係数
  × (1 + 解放読み数 × 0.1)
  × (1 + 図鑑登録漢字の種類数 × 0.02)
  × (1 + plus × 0.05)                 // +値（エンハンス）バフ
)
```

- 漢検級係数（KENTEI_FACTOR）: 10級=1.0 … 5級=2.0 … 準1級=4.2 … 1級=5.0
- plus は漢字1枚ごとの強化値（+0〜plus_cap）。+1ごとに×1.05
- ショット威力 = 装備ショットの最終パワー（未装備は5）
- 必殺威力 = 装備必殺の最終パワー × 6（未装備は30）。全体攻撃＋敵弾消し、CD 5秒

## +値（エンハンス）機構

- 漢字1枚ごとに +0〜plus_cap の強化値を持つ（kanji_inventory.plus）
- 合成: 結果の+ = 素材の+の合計 + 1。plus_cap で上限クリップ（超過分は切り捨て）
  - 例: 林(+1) + 木(+1) → 森(+3) / 木(+2) + 林(+0) → 森(+3)
- 分解: 各素材の+ = floor((結果の+ - 1) / 素材数)（端数切り捨て、0未満は0）
  - 例: 森(+3) → 林(+1) + 木(+1) / 品(+2) → 口(+1)+口(+0)+口(+0)
- plus_cap: デフォルト 3。フロアボス撃破ごとに +1（kanji_players.plus_cap）
- 装備は char と +値の両方を保存（equipped_shot_plus / equipped_special_plus）

## フロアボス

- 5ステージごと（5,10,15…）にフロアボス（描画は紫「王」、HP約2.2倍）
- 撃破で plus_cap +1
- ドロップは合成漢字（is_part=false）。ステージが進むほど画数の高い漢字を落とす
  （strokeCap = 6 + floor(stage/5)*4 以下から上位1/3を抽選）。ドロップは +1 付き
- 通常ボスは基本パーツ（is_part=true）を +0 でドロップ

## 合体の選択式

- 同じ素材の組み合わせが複数の結果を持つ場合、合成時に番号入力で選ばせる
  （例: 一+一 → 「二」or「十」）。RECIPE_BY_PARTS は結果の配列を保持

## 読み仮名の判定（実体は js/kanji-blast.pure.js の resolveReadingPure。kanji-blast.js の resolveReading はラッパー）

- readings は音・訓・特殊読みの配列。kana の「.」が送り仮名の境界（例: `う.まれる`）
- display が図鑑に登録される正規形（例: 生まれる / いきる / セイ / ショウ）
- 判定ルール:
  - 音読み（送り仮名なし）: 完全一致のみ。ひらがな/カタカナ両対応（せい=セイ）
  - 訓読み（送り仮名あり）: 「かな全体」または「漢字表記」の完全一致 → 正規形登録
    （うまれる / 生まれる どちらもOK）
  - 活用ゆらぎ: 語幹＋送り1文字以上を許容（うまれた/うまれ/うむ 等も正解）
  - 最長語幹一致を優先（「うむ」→生む、「うまれる」→生まれる を区別）
- 音・訓・特殊読みはすべて解放対象。送り仮名を含めて入力しても正解にする

## データ分離と削除・バックアップ

- プレイデータは **子供（player）ごと** に分離（kanji_players.id で紐付け）
- 端末識別は `localStorage.push_device_id`（common.js と共用）を流用
- 削除（プレイヤー削除・にがす等）は `created_by_device === この端末` の場合のみ
  UIで許可（アプリ層で制御。DBは他ゲーム同様 RLS有効＋Allow all）
- 5テーブルとも `.github/workflows/backup.yml` で毎日バックアップ（ロールバック可能）

## DBテーブル（sql/create_kanji_blast_tables.sql）

### kanji_master（漢字マスタ・共通）
- char TEXT (PK), strokes INT, kentei_level TEXT, readings JSONB, is_part BOOLEAN
- is_part=true が敵ドロップ対象の基本パーツ

### kanji_recipes（合体レシピ・共通）
- id UUID (PK), result_char / part_a / part_b / part_c（すべて kanji_master への FK）
- part_c は NULL 可（2素材レシピ）。2〜3素材の合体に対応
- 同じ result_char に複数レシピ可（例: 森=木+林 / 森=木+木+木）
- 合体は素材の順不同一致（partKey でソート）。分解は「画数が大きいパーツを
  含むレシピ」を優先（chooseSplitRecipe）
- seed は冪等性のため `DELETE FROM kanji_recipes` 後に再投入する
  （part_c=NULL 行は ON CONFLICT で重複検知できないため）

### kanji_players（子供ごとのセーブ）
- id UUID (PK), name, equipped_shot, equipped_shot_plus, equipped_special,
  equipped_special_plus, best_score, max_stage, plus_cap, created_by_device

### kanji_inventory（手持ち・最大10、同じ漢字を複数可）
- id UUID (PK), player_id (FK, ON DELETE CASCADE), char (FK), plus, created_by_device

### kanji_dex（図鑑＝読み解放記録）
- id UUID (PK), player_id (FK, ON DELETE CASCADE), char (FK), reading, created_by_device
- UNIQUE(player_id, char, reading)。reading は正規形（display）

## localStorage キー

| キー | 用途 |
|------|------|
| kanjiblast_player_id | 最後に選んだプレイヤーID（次回自動選択） |
| push_device_id | 端末識別（common.js と共用、削除制御に使用） |

## 初期データ（seed）

- 基本パーツ27（一〜九の数字9 ＋ 口/日/月/木/火/水/田/力/人/目/土/女/子/大/山/石/鳥）
  ※数字も is_part=true だが合成・分解の対象
- 合体漢字14（林/森/炎/明/男/相/好/休/畑/岩/品/晶/鳴/唱）
- 2素材レシピ: 一+一=十、一+一=二、二+一=三、口+八=四、口+一=日、木+木=林、
  木+林=森、火+火=炎、日+月=明、田+力=男、木+目=相、女+子=好、人+木=休、
  火+田=畑、山+石=岩、口+鳥=鳴
- 3素材レシピ: 口+口+口=品、日+日+日=晶、木+木+木=森、口+日+日=唱、
  一+一+一=三、一+一+八=六
- 一+一 は「二」と「十」の両方を持つ → 合成時に選択式
- レシピの part_a/part_b/part_c/result_char は必ず kanji_master に存在させること（FK制約）

## 注意点

- 夜間制限（isNightTime）に対応。夜は「今日はおしまい」表示
- arcade.html のカードは `data-game="game_kanji_blast"`。game_publish で公開制御
- テーブル未作成時も白画面にならず「データがまだ準備できてない」トーストを出す
- 実行順（新規DB）: create_kanji_blast_tables.sql → seed_kanji_blast_data.sql
- 既存DBへの追加マイグレーション（Dashboard SQL Editor）:
  1. alter_kanji_recipes_three_parts.sql（part_c追加・UNIQUE撤廃）
  2. alter_kanji_plus_enhancement.sql（plus / 装備plus / plus_cap 追加）
  3. seed_kanji_blast_data.sql を再実行（数字マスタ・レシピを反映）
