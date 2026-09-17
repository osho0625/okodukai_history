# 実装計画: 漢字合体 -カンジニオン-（kanji-blast）

## 概要

本機能は **すでに実装され main にマージ・push 済み**（`pages/kanji-blast.html` / `js/kanji-blast.js` / `pages/arcade.html` / `sql/*.sql` / `.github/workflows/backup.yml`）です。したがって本計画はゼロからの構築ではなく、以下を中心に構成します。

1. **検証（必須）**: `js/kanji-blast.js` の純粋関数に対するユニットテスト・プロパティベーステストを追加し、requirements.md / design.md の挙動が「正」であることをコードで裏付ける。稼働中の挙動は変更しない。
2. **DB マイグレーション適用確認（必須・一部ユーザー実行）**: 本番 Supabase へのマイグレーション/シード適用状況を検証クエリで確認する。本番アクセスを要する手順はユーザー実行。
3. **ドキュメント/リリース整合（必須・一部ユーザー実行）**: UI タイトル変更（漢字合体 -カンジニオン-）に伴うリリースノート・SW キャッシュ名・バージョン表示・steering/CONTEXT の整合を取る。push を要する手順はユーザー実行。
4. **未解決事項への対応（任意）**: design.md「未解決事項」#0〜#3 のうち、コードを変更する堅牢化は稼働中の挙動を変えるため任意（`*`）とし、着手前にユーザーの明示的な合意を得る。

### 前提・ツール

- テスト基盤: リポジトリルートの `package.json` に vitest（`^3.1.3`）と fast-check（`^3.22.0`）を既に導入済み。テストは `npm test`（= `vitest --run`、単発実行）で回す。watch モードは使わない。
- テスト対象は DB 非依存の純粋関数。`js/kanji-blast.js` は現状モジュール未分割のため、テストからの参照方法（下記タスク1）を最初に整える。
- 対象純粋関数（design.md「テスト戦略」）: `toHira` / `normInput` / `readingParts` / `matchScore` / `resolveReading` / `partKey` / `recipeParts` / `partsMaxStroke` / `chooseSplitRecipe` / `mergedPlus` / `splitPlus` / `kenteiFactor` / `kanjiPower`。

### 大原則（この計画で最も重要）

- **テスト対象と本番実装は同一の関数実体でなければならない。** 純粋関数を1か所（`js/kanji-blast.pure.js`）に置き、本番（`js/kanji-blast.js`）とテストの双方がそれを import する。**テスト用にロジックを写経した「ミラー実装」は禁止**（本番修正時にテストが追従せず、検証にならないため）。
- **稼働中の挙動を一切変えない。** 抽出に伴い、純粋関数のロジック、ブラウザ側の実行方式・グローバル API・スクリプトのロード順・HTML との依存関係・DOM 初期化タイミングを変更してはならない。
- 抽出が技術的に困難な場合でも、ミラー実装で回避しない。代わりにユーザーに相談し、抽出方針（例: `<script type="module">` 化の可否）を決める。

### タスクの読み方

- `*` 付きサブタスク = 任意（スキップ可）。コーディングエージェントは実装しない。
- 「【ユーザー実行】」= 本番 Supabase アクセスや GitHub への push を伴い、コーディングエージェントだけでは完結しない手順。HANDOVER.md の運用注意（選択的 `git add`、`--no-ff` マージ、PAT push はユーザー手元）に従う。
- 各タスクは検証対象の Requirement 番号を明記する。

---

## タスク

- [ ] 1. テスト環境の整備（純粋関数を単一実体として切り出す）
  - 純粋関数を本番コードから共通モジュールとして切り出し、本番コードとテストコードの双方が同一モジュールを参照する構成にする（「大原則」を厳守）:
    - 対象13関数を `js/kanji-blast.pure.js` に移し、`export` する
    - `js/kanji-blast.js` はそれらを `import` して従来どおり利用する（実体は pure.js の1か所のみ）
    - テストは `js/kanji-blast.pure.js` を import する
  - **ミラー実装（テスト側での関数写経）は採用しない。**
  - **抽出に伴うロジック変更は禁止**（関数の入出力・分岐・定数を1文字も変えない。純粋な移動のみ）。
  - **ブラウザ側の実行方式・公開API・スクリプトのロード順・HTML依存・DOM初期化タイミングを変更しない**。もし `import` 導入のために `pages/kanji-blast.html` の `<script>` を `type="module"` 化する必要がある場合は、挙動変更リスクがあるためタスクを止めてユーザーに相談する（勝手に module 化しない）。
  - `tests/kanji-blast/` ディレクトリを作成する
  - 切り出した経緯と「pure.js が唯一の実体」である旨を pure.js 冒頭コメントに明記する
  - _Requirements: 8.1, 8.2, 8.3, 9.1_

- [x] 2. 読み判定（Reading_Resolver）の検証
  - [x] 2.1 `toHira` / `normInput` / `readingParts` のユニットテスト
    - `toHira`: カタカナ→ひらがな変換（例「セイ」→「せい」）、非かなはそのまま
    - `normInput`: 前後空白・全空白・区切り点（「・」「･」）除去
    - `readingParts`: `"."` あり（"う.まれる" → stem="う"/okuri="まれる"）／なし（"せい" → stem 全体/okuri="")
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 2.2 `matchScore` のユニットテスト
    - 送り仮名なし（音読み）: 完全一致で `len+100`、不一致で -1
    - 送り仮名あり: かな完全一致・漢字表記置換（"生まれる"→"うまれる"）完全一致で `fullHira長+100`
    - 活用ゆらぎ: 語幹で始まり語幹より長いとき `stem長`、それ以外 -1
    - _Requirements: 8.2, 8.3, 8.4_
  - [x] 2.3 `resolveReading` のユニットテスト（スコア最大・同点は配列先頭優先）
    - 複数読みから最大スコアの display を返す。該当なしは null
    - 「うむ」→「う.む」、「うまれる」→「う.まれる」に解決され両者が区別される（Requirement 8.5）
    - 正解時に登録される文字列は display であること（Requirement 8.7）
    - _Requirements: 8.5, 8.6, 8.7, 8.8_
  - [x]* 2.4 `resolveReading` のプロパティテスト（スコア順序）
    - **Property: 完全一致 > 活用ゆらぎ**（design.md テスト戦略「resolveReading のスコア順序」）
    - 任意の char/読みに対し、完全一致する入力は活用ゆらぎのみ一致する入力より必ず採用される
    - **Validates: Requirements 8.6**
  - [x]* 2.5 `matchScore` の回帰テスト（うむ vs う.まれる の区別）
    - **既知の回帰ケースを固定するテスト**。2.4（一般的なスコア順序）と方向性は重複するが、過去に問題になりうる具体ケースを固定するため**削除せず残す**
    - 「うむ」は "う.む" に完全一致し、"う.まれる" の活用ゆらぎ扱いにならない（具体例ベースの回帰テストで可）
    - **Validates: Requirements 8.5**

- [x] 3. 強さ計算（Final_Power）の検証
  - [x] 3.1 `kenteiFactor` のユニットテスト
    - 係数表の全級（10=1.0 … 1=5.0、準2=3.2、準1=4.2）を検証
    - 未定義級は 1.0 にフォールバック
    - _Requirements: 9.1_
  - [x] 3.2 `kanjiPower` のユニットテスト
    - `round(strokes × kenteiFactor × (1+読み数×0.1) × (1+図鑑種類数×0.02) × (1+plus×0.05))` を境界値で検証
    - マスタに char が無い場合 0、plus 省略時は 0 扱い
    - _Requirements: 9.1_
  - [x]* 3.3 `kanjiPower` のプロパティテスト（単調性）
    - **Property: plus 増加で Final_Power は減らない**（他項固定のとき plus について単調非減少）
    - **Validates: Requirements 9.1**

- [x] 4. チェックポイント — ここまでのテストが通ることを確認
  - `npm test` を実行し、読み判定・強さ計算のテストが全て緑であることを確認する。問題があればユーザーに相談する。

- [x] 5. レシピ索引と合体/分解の +値ロジックの検証
  - [x] 5.1 `recipeParts` / `partKey` のユニットテスト
    - `recipeParts`: part_c が NULL なら2要素、値ありで3要素（Requirement 10.6）
    - `partKey`: ソート済み `|` 連結キー（順不同一致）
    - 境界: `partKey([])`（空配列）と1要素配列の戻り値を実装挙動どおりに固定する（空配列が正常系として空文字を返すのか等を明示。現行実装の挙動を「正」とする）
    - _Requirements: 6.1, 6.2, 10.4, 10.6_
  - [x]* 5.2 `partKey` のプロパティテスト（順不同不変・重複区別）
    - **Property: 順不同不変性と重複素材の区別**（design.md テスト戦略）
    - 並べ替えても同一キー（木+林 == 林+木）、重複は区別（木+木 ≠ 木+木+木）
    - 生成条件: 1〜3要素の配列を対象とする（空配列は 5.1 の境界テストで別途固定）
    - **Validates: Requirements 6.2**
  - [x] 5.3 `partsMaxStroke` / `chooseSplitRecipe` のユニットテスト
    - `partsMaxStroke`: 素材の最大画数を返す
    - `chooseSplitRecipe`: 画数最大パーツを含むレシピを優先選択（Requirement 7.2）
    - _Requirements: 7.1, 7.2, 10.5_
  - [x] 5.4 `mergedPlus` / `splitPlus` のユニットテスト
    - `mergedPlus`: `min(Σ素材plus + 1, plus_cap)`、cap クリップ（Requirement 6.6）
    - `splitPlus`: `max(0, floor((結果plus - 1) / 素材数))`（Requirement 7.5）
    - _Requirements: 6.6, 7.5_
  - [x]* 5.5 `splitPlus(mergedPlus(...))` のプロパティテスト（非可逆性）
    - **Property: 合体→分解の往復で Plus_Value は増えない**（design.md テスト戦略）
    - `Σ splitPlus(mergedPlus(items), n) ≤ Σ items.plus`
    - **前提条件（生成条件で固定する）**: 素材数 `n === items.length`（合体した素材数と分解先素材数を一致させる。異なる n は意味が違うので混ぜない）、`items.length` は 2〜3、各 plus は 0〜plus_cap の非負整数、plus_cap は 1 以上
    - **Validates: Requirements 7.6**

- [x] 6. チェックポイント — 純粋関数テストの完了確認
  - `npm test` で純粋関数（読み判定・強さ計算・レシピ/+値）のテストが全て通ることを確認する。
  - 下記の13関数 → テストタスク対応表で抜けがないか点検する（各関数に最低1つのテストがあること）。可能なら `vitest run --coverage` でカバレッジを計測し、対象13関数が網羅されているか確認する:

    | 関数 | テスト |
    |---|---|
    | toHira | 2.1 |
    | normInput | 2.1 |
    | readingParts | 2.1 |
    | matchScore | 2.2 / 2.5 |
    | resolveReading | 2.3 / 2.4 |
    | partKey | 5.1 / 5.2 |
    | recipeParts | 5.1 |
    | partsMaxStroke | 5.3 |
    | chooseSplitRecipe | 5.3 |
    | mergedPlus | 5.4 / 5.5 |
    | splitPlus | 5.4 / 5.5 |
    | kenteiFactor | 3.1 |
    | kanjiPower | 3.2 / 3.3 |

  - 問題があればユーザーに相談する。

- [x] 7. DB マイグレーション適用確認【ユーザー実行】
  方針: 「未適用かどうか」を推測せず、**期待する最終スキーマ・最終データと現状を突き合わせ、不足時のみ適用し、適用後に再検証する（最終状態ベース）**。列が存在するだけでは適用済みと断定しない。

  - [x] 7.1 スキーマ・制約確認（列存在 + 型/NULL可否 + UNIQUE制約）
    - LINKED 済みプロジェクト（HANDOVER 記載）に対し実行する。
    - (1) 列存在・型・NULL可否・デフォルト:
      ```
      supabase db query --linked "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name IN ('kanji_recipes','kanji_inventory','kanji_players') ORDER BY table_name, ordinal_position;"
      ```
      - 確認観点: `kanji_recipes.part_c`（NULL可）、`kanji_inventory.plus`（NOT NULL default 0）、`kanji_players` の `plus_cap`（NOT NULL default 3）/ `equipped_shot_plus` / `equipped_special_plus`（NOT NULL default 0）
    - (2) UNIQUE 制約の確認（列存在だけでは分からないため別途）:
      ```
      supabase db query --linked "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'kanji_recipes'::regclass AND contype IN ('u','p');"
      ```
      - 確認観点: UNIQUE が `(result_char, part_a, part_b, part_c)` であること、旧 `UNIQUE(result_char)` 相当が**残っていない**こと
    - _Requirements: 10.6, 6.6, 7.5, 4.6_
  - [x] 7.2 データ（seed）現状確認【ユーザー実行】
    - seed 適用の要否を「未適用推測」ではなくデータ期待値で判断するため、適用前に現状を確認する:
      ```
      supabase db query --linked "SELECT count(*) AS recipes FROM kanji_recipes;"
      supabase db query --linked "SELECT count(*) AS number_masters FROM kanji_master WHERE char IN ('1','2','3','4','5','6','7','8','9');"
      supabase db query --linked "SELECT count(*) AS three_part_recipes FROM kanji_recipes WHERE part_c IS NOT NULL;"
      ```
    - 確認観点: レシピ総件数・数字マスタ（1〜9）の件数・3素材レシピの有無が、`sql/seed_kanji_blast_data.sql` の期待値と一致するか。不足していれば 7.3 で適用する
    - _Requirements: 10.4, 10.5, 10.6_
  - [x] 7.3 不足しているマイグレーション/シードのみ適用する【ユーザー実行】
    - 7.1 で列/制約が不足 → 対応する alter を適用:
      - `sql/alter_kanji_recipes_three_parts.sql`（part_c 追加・UNIQUE 変更）
      - `sql/alter_kanji_plus_enhancement.sql`（plus / plus_cap / equipped_*_plus 追加）
    - 7.2 でデータが期待値に満たない → `sql/seed_kanji_blast_data.sql` を再実行（数字マスタ・全レシピ入れ替え）
      - **重要**: seed の `DELETE` 対象は `kanji_recipes`（共通データ）のみ。`kanji_players` / `kanji_inventory` / `kanji_dex`（子供のプレイデータ）には触れない
      - 実行前後で 7.2 の件数クエリを取り、**差分（実行前→実行後）を確認**してから完了とする
    - 適用は `supabase db query --linked -f <file>`。**適用済み（7.1/7.2 が期待どおり）なら再実行しない**
    - _Requirements: 10.6, 6.6, 7.5_
  - [x] 7.4 適用後の再検証【ユーザー実行】
    - 7.1（スキーマ・制約）と 7.2（データ件数）を再実行し、期待する最終状態に一致することを確認する
    - _Requirements: 10.4, 10.5, 10.6, 6.6, 7.5_

- [x] 8. ドキュメント/リリース整合
  - [x] 8.1 リリースノートに UI タイトル変更エントリを追加
    - `pages/release-notes.html` に v2.47.1 相当（表示名「漢字合体 -カンジニオン-」への変更）のエントリを追記する
    - _Requirements: 11.2_
  - [x] 8.2 SW キャッシュ名とバージョン表示を更新
    - **バージョン体系は2つあり別物である**ことに注意（同一番号ではない）:
      - アプリ表示バージョン: `v2.47.x` 系（`index.html` / `pages/release-notes.html`）
      - Service Worker キャッシュ: `v348` 系（`sw.js` の `CACHE_NAME`）
    - 作業前に現行値を確認する: `sw.js` の現在の `CACHE_NAME`、`index.html` の現在のバージョン表示、`pages/release-notes.html` の最新エントリ
    - `sw.js` の `CACHE_NAME` を現在値+1（HANDOVER 記載では v348 想定だが、実ファイルの現在値を確認して +1 する）へ bump する
    - `index.html` のバージョン表示を 8.1 で追記したアプリ表示バージョン（`v2.47.1` 相当）と一致させる
    - _Requirements: 11.2_
  - [x] 8.3 steering / CONTEXT の呼称整合を点検
    - `.kiro/steering/kanji-blast.md` と `CONTEXT.md` を確認し、UI 表示名の方針（内部 ID・ファイル名・テーブル名は `kanji-blast` のまま、UI 表示のみ変更）に矛盾がないか点検する。矛盾があれば注記を追加する
    - _Requirements: 11.2_
  - [x] 8.4 変更の確認とコミット候補提示（エージェント）→ 反映【ユーザー実行】
    - エージェントの範囲: 変更作成 → `npm test`（緑を確認）→ `git diff` で kanji-blast 関連ファイルのみが変更されていることを確認 → ステージ対象ファイルの一覧（コミット候補）とコミットメッセージ案をユーザーに提示するところまで
    - 【ユーザー実行】: kanji-blast 関連ファイルのみを選択的に `git add`（`git add .` は使わない）→ 作業ブランチへ commit → main へ `git merge --no-ff` → push
    - push が `Invalid username or token` で失敗する場合は、ユーザー手元ターミナルからの PAT 再入力による push を行う
    - _Requirements: 11.2_

- [ ] 9. ブラウザ回帰スモークテスト【ユーザー実行（手動）】
  - 本計画の大前提「稼働中の挙動を変更しない」を、実画面で最終確認する。特にタスク1の抽出（pure.js 化）でブラウザ動作が壊れていないことを確かめる。自動 E2E までは不要で、以下の手動スモークで足りる:
    - `pages/kanji-blast.html` が正常表示され、コンソールにエラーが出ない（module 化した場合は特に import 解決エラーの有無）
    - プレイヤー選択/作成 → メニュー表示
    - しゅつげき（STG 開始）→ 自機のドラッグ追従 → 敵撃破 → ボス撃破 → 漢字ドロップ取得 → ステージ進行
    - 合体（2〜3素材）／分解ができ、+値表示が出る
    - 図鑑で読み入力 → 正解登録 → Power 表示が更新される
    - セーブ/ロード（リロードして自動選択・手持ち/図鑑が復元）
    - `pages/arcade.html` のカードから起動できる（導線）
    - Service Worker 更新（`CACHE_NAME` bump 後、更新が反映される）
  - 問題があれば、タスク1の抽出方法（module 化の副作用等）を見直す
  - _Requirements: 3, 4, 5, 6, 7, 8, 9, 11_

- [ ] 10. チェックポイント — 検証・適用・整合の完了確認
  - 純粋関数テストが全て通り（タスク6）、DB スキーマ・データ確認（7.1/7.2/7.4）が期待どおりで、ドキュメント/リリース整合（8.x）が済み、ブラウザスモーク（タスク9）で回帰がないことを確認する。問題があればユーザーに相談する。

- [ ] 11. 未解決事項への対応（任意・稼働中挙動の変更を伴う）
  - Note: 以下はいずれも **現行の稼働中挙動を変更** する。requirements.md / design.md は「現行挙動を正」として文書化しているため、着手は仕様からの意図的な逸脱となる。**実施前に必ずユーザーの明示的な合意を得ること。** 各タスクは任意（`*`）。
  - [ ]* 11.1 【最重要・要判断】今後の個人情報漏洩防止（未解決事項 #0 のうち A: 予防）
    - `kanji_players.name`（子供の表示名）と `created_by_device` が今後 `backups/kanji_players_YYYYMMDD.json` にコミットされ続ける問題への、**これから先の**漏洩防止策
    - まず方針をユーザーと決定する（`.github/workflows/backup.yml` で name を jq マスク/除外する / バックアップを非公開リポジトリ・別ストレージへ隔離する / リポジトリ自体を非公開化する）
    - コード変更（backup.yml のマスク実装等）は方針決定後に着手する
    - _Requirements: 12.5, 12.7（現行はマスク未実装）_
  - [ ]* 11.2 【最重要・要判断】既に Git 履歴に存在する個人情報への対応（未解決事項 #0 のうち B: 既存履歴）
    - 11.1 とは別問題。**既にコミット済み**の `backups/kanji_players_*.json` に含まれる子供の名前等は、作業ツリーの14日削除では Git 履歴から消えない
    - 対応の要否と方法をユーザーと判断する（履歴を調査 → 履歴書き換え（filter-repo 等）が必要か、リポジトリ非公開化で十分か、そのまま許容か）
    - 履歴書き換えは影響が大きく不可逆な操作を含むため、**実施可否・手順はユーザーが最終決定**する
    - _Requirements: 12.5, 12.7_
  - [ ]* 11.3 合体/分解の非トランザクション化（素材消失リスク・未解決事項 #1）への対処
    - `doMerge` / `doSplit` の DELETE→INSERT を Supabase RPC（PL/pgSQL）で1トランザクション化、または失敗時の補償（再 INSERT）を実装する
    - _Requirements: 6.7, 7.7（現行は非トランザクションを正として文書化）_
  - [ ]* 11.4 `max_stage` の fire-and-forget 見直し（未解決事項 #2）
    - `clearStageAdvance` の `max_stage` 更新を await + リトライ/失敗通知に変更し、セッションと DB の乖離を抑える
    - _Requirements: 3.14（現行は fire-and-forget を正として文書化）_
  - [ ]* 11.5 バックアップ curl の堅牢化（未解決事項 #3）
    - `.github/workflows/backup.yml` の各取得を `curl --fail`（`-f`）+ HTTP ステータス検査・JSON 妥当性チェックに変更し、取得失敗をジョブ失敗へ昇格する
    - _Requirements: 12.7（現行は `curl -s` で失敗を昇格しないことを正として文書化）_

## 注記

- `*` 付きサブタスクは任意（スキップ可）。特にタスク11は稼働中挙動を変更するため、着手前にユーザー合意が必須。
- 「【ユーザー実行】」タスクは本番 Supabase アクセス・GitHub push を伴うため、コーディングエージェント単独では完結しない。HANDOVER.md の運用注意（選択的 `git add`、`--no-ff`、PAT push はユーザー手元）に従う。
- タスク1〜6・9の検証系は稼働中の挙動を変えず、requirements.md / design.md の仕様をコードで裏付ける。
- プロパティテストは design.md「テスト戦略」のプロパティベース候補に対応し、ユニットテストは具体例・境界値を補完する。
