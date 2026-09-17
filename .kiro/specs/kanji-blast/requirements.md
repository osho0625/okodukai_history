# Requirements Document

## Introduction

漢字合体 -カンジニオン-（内部ID: kanji-blast）は、縦スクロールSTGと漢字合体パズルを組み合わせた
教育向けゲームです。プレイヤーはSTGで敵・ボスを倒して漢字パーツを集め、レシピに沿って
合体させ、より画数の多い強い漢字を作ります。集めた漢字の読み仮名を入力して図鑑に登録すると
全体が強化されます。対象は小学1・3・5年生（漢字範囲の縛りなし）で、GitHub Pages +
Supabase 構成の個人・家族向けPWAの1ゲームとして提供されます。

本ドキュメントは、既に実装済みの挙動（`pages/kanji-blast.html`、`js/kanji-blast.js`、
`sql/` のテーブル定義・シード・マイグレーション、`.github/workflows/backup.yml`、
`pages/arcade.html`）を「正」として文書化したものです。

## Glossary

- **Kanji_Blast**: 本ゲーム全体（STG本体・合体/分解・読み判定・図鑑を含む）を指すシステム。
- **STG_Engine**: 縦スクロールSTG部分（自機移動・連射・敵/ボス・必殺技・スコア）を担う構成要素。
- **Merge_System**: 手持ちの漢字をレシピに沿って合体・分解する構成要素。
- **Reading_Resolver**: 読み仮名入力を判定し正規形を返す構成要素（`resolveReading`）。
- **Dex**: 図鑑。プレイヤーごとの読み解放記録（`kanji_dex`）。
- **Player**: 子供1人分のセーブデータ（`kanji_players` の1レコード）。プレイヤーとも呼ぶ。
- **Hand**: 手持ち。プレイヤーが所持する漢字（`kanji_inventory`）。最大10枠。
- **Basic_Part**: 敵ドロップ対象の基本パーツ漢字（`kanji_master.is_part=true`）。
- **Compound_Kanji**: 合成漢字（`kanji_master.is_part=false`）。
- **Plus_Value**: 漢字1枚ごとの強化値（`kanji_inventory.plus`、+0〜plus_cap）。
- **Plus_Cap**: Plus_Value の上限（`kanji_players.plus_cap`）。DB デフォルトは 3（新規 Player の初期値も 3）。Floor_Boss 撃破ごとに +1 され、初回撃破で 4 になる。アプリ側で値が未取得のときのフォールバックも 3。
- **Reading_Stem / Reading_Okuri**: 読み（kana）を送り仮名境界 "." で分割した語幹と送り仮名。"." がある場合は "." の前が Reading_Stem、後ろが Reading_Okuri（例 "う.まれる" → stem="う", okuri="まれる"／"か.える" → stem="か", okuri="える"／"お.く" → stem="お", okuri="く"）。"." が無い場合は読み全体が Reading_Stem で Reading_Okuri は空（音読み等）。実装の `readingParts` に対応する。
- **Floor_Boss**: 5ステージごと（5,10,15…）に出現する強ボス。
- **Final_Power**: 漢字の最終パワー。強さ計算式で算出（`kanjiPower`）。
- **Recipe**: 合体レシピ（`kanji_recipes`）。2〜3素材と結果の対応。
- **Device_ID**: 端末識別子（`localStorage.push_device_id`、common.js と共用）。端末そのものの永続 ID ではなく、そのブラウザの localStorage に保存された識別子であり、localStorage 消去・別ブラウザ・シークレットモード・端末初期化などで変わりうる。無ければ起動時に新規生成して保存する。
- **Reading_Display**: 読みの正規表記（`kanji_master.readings[].display`）。正解と判定されたときに図鑑（Dex）へ表示・保存する文字列。かな入力・漢字表記入力・活用ゆらぎのいずれで正解しても、図鑑に登録・表示されるのはこの display である。
- **Kentei_Factor**: 漢検級係数。`kanji_master.kentei_level`（"10"〜"1"、"準2"/"準1" を含む）を、実装内の係数表（KENTEI_FACTOR）で数値に変換したもの。未定義の級は 1.0。係数表: 10級=1.0 / 9級=1.2 / 8級=1.4 / 7級=1.6 / 6級=1.8 / 5級=2.0 / 4級=2.4 / 3級=2.8 / 準2級=3.2 / 2級=3.6 / 準1級=4.2 / 1級=5.0。
- **Night_Mode**: 夜間制限状態（common.js の `isNightTime()` が真）。
- **Data_Store**: Supabase 上の5テーブル（kanji_master / kanji_recipes / kanji_players /
  kanji_inventory / kanji_dex）。
- **Backup_Job**: `.github/workflows/backup.yml` による毎日のバックアップ処理。

## Requirements

### Requirement 1: プレイヤー（子供）の管理

**User Story:** 保護者・子供として、子供ごとにセーブデータを分けて遊びたい。兄弟で同じ端末を使っても混ざらないようにしたい。

#### Acceptance Criteria

1. WHEN プレイヤー選択画面が表示される, THE Kanji_Blast SHALL 既存の Player 一覧を `created_at` 昇順（作成が古い順）に表示する。
2. WHEN ユーザーが名前を入力してプレイヤー作成を実行する, THE Kanji_Blast SHALL 入力名と Device_ID を `created_by_device` に記録した新規 Player を作成する。
3. IF プレイヤー作成時に名前が空である, THEN THE Kanji_Blast SHALL Player を作成せず「なまえを入れてね」を通知する。
4. WHEN 新規 Player を作成する, THE Kanji_Blast SHALL 初期パーツとして口・十・木・火（kanji_master に存在するもの）を Hand に配布する。
5. WHEN ユーザーが Player を選択する, THE Kanji_Blast SHALL 選択した Player の Hand と Dex を読み込み、メニュー画面を表示する。
6. WHEN Player が選択される, THE Kanji_Blast SHALL その Player の ID を `kanjiblast_player_id` として localStorage に保存する。
7. WHEN ゲーム起動時に `kanjiblast_player_id` が保存されている, THE Kanji_Blast SHALL 該当 Player を自動選択する。
8. IF 自動選択・選択対象の Player が Data_Store に存在しない, THEN THE Kanji_Blast SHALL `kanjiblast_player_id` を削除しプレイヤー選択画面を表示する。
9. THE Kanji_Blast SHALL Player 名の一意性を要求せず、Player を `id`（player_id）で識別する（同名の Player を作成できる）。

### Requirement 2: プレイヤー削除の端末制限（誤操作防止）

**User Story:** 保護者として、通常のゲーム画面からは、そのデータを作成した端末（作成時と同じ Device_ID）以外で子供のデータを削除できないようにして、他端末からの誤削除を防ぎたい。

**Note:** 本要件は「他端末からの削除を技術的に不可能にする（保証する）」ものではない。Data_Store の RLS は Allow all（Requirement 12 参照）のため、Supabase REST を直接呼び出せば削除は起こりうる。本要件が定めるのは、あくまで Kanji_Blast のゲーム画面（アプリ層）を通じた削除操作に対する Device_ID 照合による誤操作防止である。

#### Acceptance Criteria

1. WHERE Player の `created_by_device` が現在の Device_ID と一致する, THE Kanji_Blast SHALL その Player に削除ボタンを表示する。
2. WHERE Player の `created_by_device` が現在の Device_ID と一致しない, THE Kanji_Blast SHALL その Player に削除ボタンを表示しない。
3. WHEN ユーザーが Player 削除を確認して実行する, THE Kanji_Blast SHALL DELETE 条件に `created_by_device = 現在の Device_ID` を付与して該当 Player を削除する。
4. WHEN Player が削除される, THE Data_Store SHALL 該当 Player の Hand と Dex を ON DELETE CASCADE で連動削除する。
5. IF 削除対象 Player の `created_by_device` が現在の Device_ID と一致しない, THEN THE Kanji_Blast SHALL 削除操作を実行せず「この端末では消せないよ」を通知する。

### Requirement 3: STG プレイ

**User Story:** 子供として、自機を動かして敵やボスを倒す縦STGを遊びたい。

#### Acceptance Criteria

1. THE `max_stage`（DB デフォルト1）SHALL Player が到達済みで、かつ次回 STG 開始時に始めるステージ番号を表す（「到達最大ステージ」＝「次回開始ステージ」）。例: 初期状態 `max_stage=1` で Stage 1 をクリアすると `max_stage=2` となり、次回は Stage 2 から始まる。
2. THE STG_Engine SHALL プレイ中の現在ステージをセッション内変数（実装の `stg.stage`）で管理し、`max_stage` は永続化される到達ステージとして別に保持する。
3. WHEN STG が開始される, THE STG_Engine SHALL セッションの現在ステージを Player の `max_stage` で初期化して開始する。
4. WHILE STG がプレイ中である, THE STG_Engine SHALL ドラッグ操作（タッチ/マウス）に追従して自機を移動させる。
5. WHILE STG がプレイ中である, THE STG_Engine SHALL 自機から弾を自動連射する。
6. WHERE 必殺技用の漢字が装備されている, THE STG_Engine SHALL 必殺技ボタンを有効にする。
7. WHEN 必殺技が発動可能な状態でボタンが押される, THE STG_Engine SHALL 画面上の全敵とボスに必殺威力のダメージを与え、敵弾を消去する。
8. WHEN 必殺技が発動する, THE STG_Engine SHALL 必殺技を5秒間クールダウン状態にする。
9. WHEN 自機が敵または敵弾に被弾する, THE STG_Engine SHALL 残機を1減らし、一定時間の無敵状態を付与する。
10. WHEN 残機が0以下になる, THE STG_Engine SHALL STG を終了しスコアを表示する。
11. WHEN STG が終了する, IF そのスコアが Player の `best_score` を超える, THEN THE STG_Engine SHALL `best_score` を更新して保存する。
12. THE STG_Engine SHALL 各ステージを「雑魚全滅 → ボス出現 → ボス撃破 → ドロップ落下 → 自機がドロップを取得完了」までの一連の流れで構成する。ステージクリアの成立条件は「ボス撃破後にドロップした漢字を自機が取得したこと」とする（詳細は Requirement 4-7/4-8）。
13. WHEN ステージクリアが成立する（ドロップ取得が完了する）, THE STG_Engine SHALL セッションの現在ステージを1つ進め、進めた番号が `max_stage` を超える場合は `max_stage` を更新して永続化する。
14. THE STG_Engine SHALL `max_stage` の永続化を、成功可否を待たない非同期更新（fire-and-forget）として実行する。（Note: 現行実装は保存の完了・失敗を待たずセッションのステージを進めるため、DB 保存が失敗するとセッション上のステージと `max_stage` が一時的に不整合になりうる。次回起動時は保存済みの `max_stage` が正となる。保存失敗時にクリアを取り消す挙動は未実装であり、堅牢化は設計上の未解決事項とする。）

### Requirement 4: フロアボスとドロップ

**User Story:** 子供として、ボスを倒すと漢字が手に入り、5ステージごとの強ボスでは強い漢字と強化上限アップの報酬をもらいたい。

#### Acceptance Criteria

1. WHERE ステージ番号が5の倍数である, THE STG_Engine SHALL そのステージのボスを Floor_Boss（HP約2.2倍）として出現させる。
2. WHEN 通常ボスが撃破される, THE STG_Engine SHALL Basic_Part（is_part=true）からランダムに1つを Plus_Value 0 でドロップする。
3. WHEN Floor_Boss が撃破される, THE STG_Engine SHALL Compound_Kanji（is_part=false）から抽選した1つを Plus_Value `min(1, Plus_Cap)` でドロップする。
4. WHEN Floor_Boss のドロップ候補を抽選する, THE STG_Engine SHALL 画数上限 `6 + floor(stage/5)*4` 以下の Compound_Kanji を候補とし、候補を画数の降順に並べた上位 `max(1, ceil(候補数 / 3))` 件を抽選対象として、その中から一様ランダムに1つを選ぶ。
5. IF 上記の画数上限以下の Compound_Kanji が0件である, THEN THE STG_Engine SHALL Compound_Kanji 全体（画数上限フィルタなし）を候補とし、それも0件なら Basic_Part を候補とする。
6. WHEN Floor_Boss が撃破される, THE STG_Engine SHALL Player の Plus_Cap を1増やして保存する。
7. WHEN ボス撃破でドロップした漢字を自機が取得する, IF Hand が最大10枠に達している, THEN THE STG_Engine SHALL その漢字を Hand に追加せず、手持ちが一杯である旨（実装トースト「手持ちがいっぱい！ ○ はにげちゃった」）を通知し、ステージを進めない（クリア未成立）。
8. WHEN ボス撃破でドロップした漢字を自機が取得し Hand に空きがある, THE STG_Engine SHALL その漢字を Plus_Value 付きで Hand に追加し、ステージクリアを成立させてステージを進める（Requirement 3-13）。
9. WHERE Hand 満杯によりドロップを取得できずステージが進まない状況が起こりうる, THE Kanji_Blast SHALL 合体・手持ち画面で不要な漢字を「にがす」ことで Hand を空け、再挑戦で先へ進める導線を提供する（Requirement 5-3 の「にがす」）。（Note: プレイヤーが行き詰まらないよう、満杯通知の文言に手放しを促す案内を含めることが望ましい。）

### Requirement 5: 手持ち管理と装備

**User Story:** 子供として、集めた漢字を手持ちで管理し、ショットと必殺技に装備したい。不要な漢字は逃がして枠を空けたい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL Hand の上限を10枠とし、同一の漢字を複数所持できる。
2. WHEN ユーザーが Hand から1つの漢字を選んでショットまたは必殺技に装備する, THE Kanji_Blast SHALL 装備スロットに漢字の char と Plus_Value の両方を保存する。
3. WHEN ユーザーが Hand から1つの漢字を選んで「にがす」を確認する, THE Kanji_Blast SHALL その漢字を Hand から削除する。
4. WHEN 逃がした漢字と同一の char かつ同一 Plus_Value の在庫が他に無く、その漢字が装備中である, THE Kanji_Blast SHALL 該当する装備スロットを解除する。

### Requirement 6: 合体（マージ）

**User Story:** 子供として、パーツを組み合わせてレシピ通りに新しい漢字を作りたい。同じ組み合わせで複数の結果があるときは選びたい。

#### Acceptance Criteria

1. WHEN 2〜3個の漢字が選択され、その素材の組み合わせに一致する Recipe が存在する, THE Merge_System SHALL 合体を実行可能にする。
2. THE Merge_System SHALL 素材の組み合わせを順不同で判定する（ソート済みキーで一致確認する）。
3. WHEN 合体が実行され結果が1種類である, THE Merge_System SHALL 素材を Hand から削除し、結果の漢字1つを Hand に追加する。
4. WHEN 選択した素材の組み合わせが複数の結果を持つ, THE Merge_System SHALL ユーザーに番号入力で作成する結果を選ばせる。
5. IF 結果選択でユーザーが範囲外の番号を入力する, THEN THE Merge_System SHALL 合体を実行せず「番号がちがうよ」を通知する。
6. WHEN 合体が実行される, THE Merge_System SHALL 結果の Plus_Value を「素材の Plus_Value 合計 + 1」とし、Plus_Cap を超える分は Plus_Cap に切り詰める。
7. THE Merge_System SHALL 合体を「素材の削除（DELETE）→ 結果の追加（INSERT）」の順で Data_Store に反映する。（Note: 現行実装はこの2操作を別々の REST 呼び出しで行い、トランザクションではない。DELETE 成功後に INSERT が失敗すると素材だけが失われる不整合が起こりうる。素材だけ消える状態を発生させない原子性の担保は設計上の未解決事項とする。）

### Requirement 7: 分解（スプリット）

**User Story:** 子供として、合体した漢字を素材に戻して別の組み合わせを試したい。

#### Acceptance Criteria

1. WHEN 1つの漢字が選択され、その漢字を結果とする Recipe が存在する, THE Merge_System SHALL 分解を実行可能にする。
2. WHEN 複数の分解先レシピが存在する, THE Merge_System SHALL 画数が大きいパーツを含むレシピを優先して選ぶ。
3. IF 分解によって増える素材数ぶんの空き枠が Hand に無い, THEN THE Merge_System SHALL 分解を実行せず不足を通知する。
4. WHEN 分解が実行される, THE Merge_System SHALL 元の漢字を Hand から削除し、レシピの素材（2〜3個）を Hand に追加する。
5. WHEN 分解が実行される, THE Merge_System SHALL 各素材の Plus_Value を `max(0, floor((結果のPlus_Value - 1) / 素材数))` とする（整数除算による切り捨て）。
6. THE Merge_System SHALL 分解時の Plus_Value 配分で生じる端数（切り捨てられた余剰）を復元しない。したがって合体→分解は Plus_Value について可逆ではなく、往復すると Plus_Value が減りうる（例: +5 を3素材に分解すると各素材は +1 になり、合計 +3 相当に減る）。
7. THE Merge_System SHALL 分解を「元の漢字の削除（DELETE）→ 素材の追加（INSERT）」の順で Data_Store に反映する。（Note: 合体と同様に2操作は別々の REST 呼び出しで非トランザクションであり、DELETE 成功後に INSERT が失敗すると元の漢字だけが失われる不整合が起こりうる。原子性の担保は設計上の未解決事項とする。）

### Requirement 8: 読み仮名の判定と図鑑登録

**User Story:** 子供として、漢字の読み仮名を入力して正解なら図鑑に登録し、遊びながら読みを覚えたい。

#### Acceptance Criteria

1. THE Reading_Resolver SHALL 入力とマスタ側の読み（kana）を同一のかな種別（ひらがな）に正規化してから照合する（入力・kana の双方を toHira でひらがなに揃える）。入力からは前後の空白・全角/半角の区切り点（「・」「･」）を除去する。
2. WHERE 読み（kana）に送り仮名の境界（"."）が無い（音読み等）, THE Reading_Resolver SHALL 入力（ひらがな正規化後）が読み全体と完全一致する場合のみ正解と判定する。
3. WHERE 読み（kana）に送り仮名の境界がある（訓読み。例 "う.まれる"）, THE Reading_Resolver SHALL 読みを Reading_Stem と Reading_Okuri に分割し（Glossary 参照。例 stem="う", okuri="まれる"）、次のいずれかを正解と判定する: (a) 入力のかな全体が「Reading_Stem + Reading_Okuri」（例「うまれる」）に完全一致する, (b) 漢字表記入力の対象漢字を Reading_Stem に置換した結果が「Reading_Stem + Reading_Okuri」に完全一致する（例「生まれる」→「うまれる」）。
4. WHERE 読み（kana）に送り仮名の境界がある, THE Reading_Resolver SHALL 入力（かな、または漢字表記を Reading_Stem に置換したもの）が「Reading_Stem で始まり、かつ Reading_Stem より長い」場合を活用ゆらぎとして正解と判定する（例「うまれた」は stem「う」で始まりより長いので可）。この判定は Reading_Stem への前方一致のみで行い、続く文字が正しい活用形かどうかは検証しない。
5. WHILE 別の辞書読みとして登録された読み（例「生」の「う.む」）は, THE Reading_Resolver SHALL それぞれ独立した読みとして照合する（「うむ」は「う.む」の読みに一致するのであって、「う.まれる」の活用ゆらぎとして扱われるのではない）。
6. WHEN 入力が複数の読みに一致する, THE Reading_Resolver SHALL 一致スコアが最大の読みを採用する。スコアは、完全一致（送り仮名なし/あり）を「一致かな長 + 100」、活用ゆらぎ一致を「語幹の長さ」とし、これにより完全一致 > 活用ゆらぎ、活用ゆらぎ同士では語幹が長い読みが優先される。
7. WHEN 読みが正解と判定される, THE Kanji_Blast SHALL 採用した読みの Reading_Display（display）を Dex に登録する。
8. IF 入力がいずれの読みにも一致しない, THEN THE Kanji_Blast SHALL Dex に登録せず「ちがうみたい」を通知する。
9. IF 採用した Reading_Display が既に Dex に登録済みである, THEN THE Kanji_Blast SHALL 重複登録せず登録済みである旨を通知する。
10. THE Data_Store SHALL Dex の (player_id, char, reading) を一意に保つ（UNIQUE 制約違反時はアプリ層で「登録ずみ」として扱う）。

### Requirement 9: 強さ計算

**User Story:** 子供として、集めた漢字や図鑑の進み具合に応じて自機が強くなる手ごたえがほしい。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL 漢字の Final_Power を `round(画数 × Kentei_Factor × (1 + 解放読み数 × 0.1) × (1 + 図鑑登録種類数 × 0.02) × (1 + Plus_Value × 0.05))` で算出する。ここで各項は次を指す:
   - 画数: `kanji_master.strokes`。
   - Kentei_Factor: `kanji_master.kentei_level` を Glossary の係数表で変換した値（未定義級は 1.0）。
   - 解放読み数: 現在の Player の Dex に登録済みの、その char に対する distinct な reading 件数（Dex の UNIQUE(player_id, char, reading) により同一読みは1件）。
   - 図鑑登録種類数: 現在の Player の Dex に登録された distinct な char の種類数（Dex 全体の母集団。図鑑を埋めるほど所持する全漢字が一律に強化される）。
   - Plus_Value: 対象の1枚（または装備スロット）の Plus_Value。図鑑表示など枚を特定しない箇所では Plus_Value を 0 として算出する。
2. WHERE ショットに漢字が装備されている, THE STG_Engine SHALL ショット威力を装備ショットの Final_Power とする。
3. WHERE ショットに漢字が装備されていない, THE STG_Engine SHALL ショット威力を5とする。
4. WHERE 必殺技に漢字が装備されている, THE STG_Engine SHALL 必殺威力を装備必殺の Final_Power × 6 とする。
5. WHERE 必殺技に漢字が装備されていない, THE STG_Engine SHALL 必殺威力を30とする。

### Requirement 10: マスタとレシピの読み込み

**User Story:** 開発者として、漢字マスタと合体レシピを共通データとして管理し、マスタデータが取得できない（テーブル未作成や0件を含む）場合でも画面が壊れないようにしたい。

#### Acceptance Criteria

1. WHEN ゲームが起動する, THE Kanji_Blast SHALL kanji_master と kanji_recipes を Data_Store から読み込む。
2. IF 読み込み時に例外が発生する（テーブル未作成等）, THEN THE Kanji_Blast SHALL 例外を捕捉してマスタ・レシピを空として扱い、処理を継続する。
3. IF 読み込み後の kanji_master が0件である（取得失敗による空を含む）, THEN THE Kanji_Blast SHALL 白画面にせず「データがまだ準備できてないみたい（テーブル未作成）」を通知する。
4. WHEN レシピを読み込む, THE Kanji_Blast SHALL 同一素材の組み合わせが複数の結果を持つ場合に全結果を保持する。
5. WHEN レシピを読み込む, THE Kanji_Blast SHALL 同一結果に対する複数の分解先レシピを保持する。
6. THE Data_Store SHALL kanji_recipes の part_c を NULL 可とし、2素材および3素材のレシピを表現できる。

### Requirement 11: 夜間制限とアーケード公開制御

**User Story:** 保護者として、夜は遊べないようにし、アーケードのカードから公開制御したい。

#### Acceptance Criteria

1. WHILE Night_Mode である, THE Kanji_Blast SHALL ゲームを開始せず「今日はおしまい」表示と戻るリンクを表示する。
2. THE Kanji_Blast SHALL アーケード画面のカードに `data-game="game_kanji_blast"` を持たせ、公開制御の対象とする。

### Requirement 12: データ分離・保全・バックアップ

**User Story:** 開発者・保護者として、子供ごとのデータを分離し、毎日バックアップして必要なら復元できるようにしたい。

**Note:** 本ゲームは家庭内・個人/家族向け PWA として Supabase の匿名（publishable）アクセスを前提とする。RLS は「テーブルアクセスを拒否するため」ではなく、Supabase 上で RLS 無効状態を避ける目的で有効化し、実際のアクセスは Allow all とする。アクセス制御・端末制限はアプリ層で行う（Requirement 2 参照）。

#### Acceptance Criteria

1. THE Kanji_Blast SHALL Hand・Dex・セーブデータを Player の ID（player_id）で分離する。
2. THE Data_Store SHALL 5テーブル（kanji_master / kanji_recipes / kanji_players / kanji_inventory / kanji_dex）で RLS を有効化し「Allow all」ポリシーを適用する（上記 Note の意図による）。
3. THE Kanji_Blast SHALL 削除操作の端末制限を、`created_by_device` と Device_ID の照合によりアプリ層で制御する（Requirement 2）。この制御は誤操作防止であり、REST 直接呼び出しに対する保証ではない。
4. THE Backup_Job SHALL 毎日 AM3:00 JST（cron `0 18 * * *`）に実行されるスケジュールを持ち、手動実行（workflow_dispatch）も可能とする。
5. WHEN Backup_Job が実行される, THE Backup_Job SHALL 5テーブル（kanji_master / kanji_recipes / kanji_players / kanji_inventory / kanji_dex）を REST（`select=*`）で取得し、テーブルごとに `backups/<table>_YYYYMMDD.json`（各テーブルへ復元可能な生 JSON）として保存し、`backups/` にコミット・push する。
6. THE Backup_Job SHALL 保存後、14日より古いバックアップ JSON を削除する。
7. WHERE Backup_Job が成功した, THE Backup_Job SHALL Discord に完了通知を送る。（Note: 取得は `curl -s` で行い個別リクエスト失敗を明示的にジョブ失敗へは昇格させていない。取得失敗時の堅牢化は今後の設計課題とする。）
8. THE Kanji_Blast SHALL 本要件の範囲をバックアップ（取得・保存）のみとする。保存済み JSON からの復元は自動化された要件・API を持たず、必要時の手動作業とする（各テーブルへ JSON を再投入することで復元可能）。
