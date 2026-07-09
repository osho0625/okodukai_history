# 差分設計: 全フェーズスキル（fs-*）の step-history-writer 呼び出し改修

> 対象: step-history-writer を呼び出す全 fs-*（34 スキル・計 281 出現箇所）
> 関連 REQ: REQ-C-007（呼び出し箇所への `artifact_dir` 引数追加のみ）
> 親索引: [delta-design.md](./delta-design.md)
> スコープ厳守: 改修は step-history-writer 呼び出しへの引数追加に限定。フェーズ構成・Process 手順・各フェーズの責務変更は一切伴わない（AC-007-5）。

## 設計方針

REQ-C-003 で step-history-writer の入力に `artifact_dir`（汎用名）が追加されることに伴い、step-history-writer を呼び出す全 fs-* の呼び出し記述に、各 WF の成果物フォルダパスを `artifact_dir` 引数として追加する。

- **同一パターンの機械適用:** 全 34 スキルは共通の呼び出しパターンを持つため、同一の引数追加パターンを全件に適用する。漏れなく全件へ同一の汎用名 `artifact_dir` を適用することが重要（AC-007-1/AC-007-4）。実装工程では task-orchestration で並列適用する（approach.md）。
- **既存引数の維持:** `skill_name` / `step_id` / `step_title` は維持し、`artifact_dir` を末尾に追加する（AC-007-3）。
- **2 種類の記述箇所に適用:** fs-* には (X) 冒頭の「step-history-writer について／呼び出しルール」見出しでパラメータを定義する箇所と、(Y) 各 Step 末尾の個別呼び出し指示行の 2 種類がある。両方に `artifact_dir` を追加する。

## WF 種別ごとに渡す成果物フォルダパス（artifact_dir の値）

各 WF が `artifact_dir` に渡す値を以下に定義する（AC-007-2）。いずれもプロジェクトルートからの相対パス形式で、compliance-checker の `changes_dir` と文字列照合可能にする（REQ-C-003 AC-003-2）。

| WF 種別 | 対象スキル接頭辞 | artifact_dir に渡す値 | 備考 |
|---|---|---|---|
| 変更 | fs-change-* | `{changes_dir}` | 各スキルが既に保持する `changes_dir`（`.aide/specs/{feature_name}/changes/{timestamp}-{name}`） |
| バグ修正 | fs-bugfix-* | `{bugfix_dir}` | `.aide/specs/{feature_name}/bugfix/{YYYYMMDDHHmm}-{対処概略}(-{番号})`。変更WF の changes_dir 相当 |
| リファクタリング | fs-refactoring-* | `{refactoring_dir}` | `.aide/specs/{feature_name}/refactoring/{refactoring_dir}`。変更WF の changes_dir 相当 |
| 設計 | fs-design-* | `.aide/specs/{feature_name}` | 成果物が `.aide/specs/{feature_name}/` 直下に置かれるため、feature フォルダを成果物フォルダパスとする |
| 実装 | fs-impl-* | `.aide/specs/{feature_name}` | 同上（feature フォルダ） |
| 企画 | fs-planning-* | `.aide/specs/{feature_name}` | 同上（feature フォルダ） |
| 逆引き | fs-reverse-* | `.aide/specs/{feature_name}` | 同上（feature フォルダ） |

> **設計判断（changes_dir 相当がない WF）:** 設計/企画/実装/逆引きの各 WF は `changes_dir` 相当の作業別サブフォルダを持たず、成果物を `.aide/specs/{feature_name}/` 直下（およびその配下）に置く。したがってこれらの WF は **feature フォルダ `.aide/specs/{feature_name}` を成果物フォルダパスとして渡す**。これにより、これらの WF の履歴は feature 単位で絞り込まれる（同一 feature の design/impl/planning/reverse 履歴は同一 artifact_dir になる）。compliance-checker 側は、これらの WF では `progress_file_path`・`skill_name` から feature フォルダパスを**自身で導出**して照合キーとする（REQ-C-004 / AC-004-5。後述）。
>
> ※ step-history-writer が `artifact_dir` に記録する成果物フォルダパスと、compliance-checker が決定する照合キーとが**一致**することで、REQ-C-004 の絞り込み（W4-0）が機能する。両者の一致は WF 種別によって次のように担保される（**fs-* 側の改修は不要**）。

#### artifact_dir と compliance-checker が決定する照合キーの一致対応表

| WF 種別 | step-history-writer に渡す `artifact_dir` | compliance-checker が決定する照合キー | 一致根拠（fs-* 側改修は不要） |
|---|---|---|---|
| 変更 | `{changes_dir}` | write 入力の `{changes_dir}`（既存） | 同一コンテキスト変数。既に各スキルが保持し、phase-compliance-check(write) も既存の `changes_dir` を渡す |
| バグ修正 | `{bugfix_dir}` | write 入力の `{bugfix_dir}`（既存） | 同一コンテキスト変数。変更WF の changes_dir 相当 |
| リファクタリング | `{refactoring_dir}` | write 入力の `{refactoring_dir}`（既存） | 同一コンテキスト変数。変更WF の changes_dir 相当 |
| 設計 | `.aide/specs/{feature_name}` | `progress_file_path`・`skill_name` から compliance-checker が導出する `.aide/specs/{feature_name}` | compliance-checker 側の導出（REQ-C-004 / AC-004-5）。fs-* の phase-compliance-check 呼び出しは変更しない |
| 実装 | `.aide/specs/{feature_name}` | 同上（compliance-checker が導出） | 同上 |
| 企画 | `.aide/specs/{feature_name}` | 同上（compliance-checker が導出） | 同上 |
| 逆引き | `.aide/specs/{feature_name}` | 同上（compliance-checker が導出） | 同上 |

> **設計判断（changes_dir 相当がない 4 WF も fs-* 側改修は不要）:** 変更/バグ修正/リファクタリングの 3 WF は `changes_dir`/`bugfix_dir`/`refactoring_dir` という既存コンテキスト変数を artifact_dir として渡し、phase-compliance-check(write) も同じ既存変数を渡すため、定義上一致が担保される。一方、設計/実装/企画/逆引きの 4 WF は `changes_dir` 相当の作業別サブフォルダを持たないが、**これらの WF では compliance-checker が `progress_file_path`（`.aide/specs/{feature_name}/{wf}-progress.md`）の親ディレクトリ、または `skill_name` から feature フォルダパス `.aide/specs/{feature_name}` を機械的に導出して照合キーとする**（REQ-C-004 / AC-004-5〜7）。step-history-writer がこれらの WF で `artifact_dir` に渡す feature フォルダパス（`.aide/specs/{feature_name}`）と、この導出される照合キーが一致することで絞り込みが成立する。
>
> **fs-* の phase-compliance-check 呼び出しには一切手を入れない:** 照合キーの導出は compliance-checker 側のロジックで完結するため（REQ-C-004 / AC-004-7）、設計/実装/企画/逆引きの各 WF のフェーズスキルが phase-compliance-check を write モードで呼ぶ際の引数（`changes_dir` 等）を新たに揃える・明記する改修は**不要**であり、本変更ではこれらの WF の phase-compliance-check 呼び出しを**変更しない**。これにより、前回 QA レビューで FAIL となった「設計/実装/企画/逆引き 4 WF の phase-compliance-check(write) へ渡す changes_dir 値を feature フォルダパスに揃える整合作業を本変更スコープ内とする」という記述は撤回され、要件スコープ（fs-* 本体改修はスコープ外。REQ-C-007 は step-history-writer 呼び出しへの `artifact_dir` 引数追加に限定）と矛盾しなくなる。
>
> **本変更で fs-* に行う改修の範囲（再確認）:** 本ファイルが扱う改修は、REQ-C-007 のとおり **step-history-writer 呼び出しへの `artifact_dir` 引数追加のみ**である。各 WF が `artifact_dir` に渡す値は上表のとおり（変更=changes_dir / バグ修正=bugfix_dir / リファクタ=refactoring_dir / 設計・実装・企画・逆引き=`.aide/specs/{feature_name}`）。compliance-checker が受領する照合キーとの一致は、上記のとおり既存入力（changes_dir 相当）または compliance-checker 側の導出（feature フォルダパス）で担保され、**fs-* 側の追加改修を要しない**。

## 代表 before → after

### 代表例1: 各 Step 末尾の個別呼び出し指示行（最も多いパターン／逆引き・設計・実装・企画・リファクタリング系）

対象例: `fs-reverse-phase4-user-req` Step 1。

#### before

```markdown
> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step1`, step_title: `サブエージェント委譲（コード解析 + ヒアリング + 成果物作成）`
```

#### after

```markdown
> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step1`, step_title: `サブエージェント委譲（コード解析 + ヒアリング + 成果物作成）`, artifact_dir: `.aide/specs/{feature_name}`
```

### 代表例2: 冒頭の「step-history-writer について」見出しのパラメータ定義（設計・逆引き系）

対象例: `fs-design-phase1-user-req` / `fs-reverse-phase4-user-req` 冒頭。

#### before

```markdown
## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase1-user-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
```

#### after

```markdown
## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase1-user-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）
```

### 代表例3: 「呼び出しルール（全Step共通）」見出し＋ Step 末尾の括弧付き呼び出し（変更系）

対象例: `fs-change-phase1-analysis`。本スキルは冒頭に共通ルール見出しを持ち、各 Step 後処理で括弧付きで呼び出す 2 段構成。

#### before（冒頭の共通ルール）

```markdown
## step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。前処理完了時も同様。

呼び出しパラメータ:
- skill_name: `fs-change-phase1-analysis`
- step_id: `前処理` / `step1` / `step2` ...
- step_title: Step のタイトル文字列
```

#### after（冒頭の共通ルール）

```markdown
## step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。前処理完了時も同様。

呼び出しパラメータ:
- skill_name: `fs-change-phase1-analysis`
- step_id: `前処理` / `step1` / `step2` ...
- step_title: Step のタイトル文字列
- artifact_dir: `{changes_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）
```

#### before（各 Step 後処理の括弧付き呼び出し）

```markdown
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `前処理`, step_title: `前処理`）
```

#### after（各 Step 後処理の括弧付き呼び出し）

```markdown
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{changes_dir}`）
```

## 対象スキル一覧（grep 結果・呼び出しを持つ 34 スキル）

> 集計は `skills/fs-*/SKILL.md` 内の `step-history-writer (aide-powers skill)` 出現行数（見出し説明行を含む）。実呼び出し指示行のみの再カウントは実装工程のタスク分解で行う。
> 実スキル行は #1〜#34（= 改修対象 34 スキル）。最終行は行番号を持たない「合計」行とし、#1〜#34 の各出現数の総和（281）と一致させている。

| # | スキル | 出現箇所 | artifact_dir に渡す値 |
|---|---|---|---|
| 1 | fs-bugfix-phase1-analysis | 14 | `{bugfix_dir}` |
| 2 | fs-bugfix-phase2-impl | 20 | `{bugfix_dir}` |
| 3 | fs-change-phase1-analysis | 13 | `{changes_dir}` |
| 4 | fs-change-phase2-impl | 22 | `{changes_dir}` |
| 5 | fs-design-phase1-user-req | 6 | `.aide/specs/{feature_name}` |
| 6 | fs-design-phase2-system-req | 6 | `.aide/specs/{feature_name}` |
| 7 | fs-design-phase3-dev-plan | 7 | `.aide/specs/{feature_name}` |
| 8 | fs-design-phase4-architecture | 6 | `.aide/specs/{feature_name}` |
| 9 | fs-design-phase5-gui | 6 | `.aide/specs/{feature_name}` |
| 10 | fs-design-phase6-usecase | 10 | `.aide/specs/{feature_name}` |
| 11 | fs-design-phase7-ddd | 5 | `.aide/specs/{feature_name}` |
| 12 | fs-design-phase8-object | 10 | `.aide/specs/{feature_name}` |
| 13 | fs-design-phase9-infra | 6 | `.aide/specs/{feature_name}` |
| 14 | fs-design-phase10-program | 7 | `.aide/specs/{feature_name}` |
| 15 | fs-impl-phase1-gate | 5 | `.aide/specs/{feature_name}` |
| 16 | fs-impl-phase2-preparation | 8 | `.aide/specs/{feature_name}` |
| 17 | fs-impl-phase3-gui-mockup | 11 | `.aide/specs/{feature_name}` |
| 18 | fs-impl-phase4-execution | 8 | `.aide/specs/{feature_name}` |
| 19 | fs-impl-phase5-final-check | 6 | `.aide/specs/{feature_name}` |
| 20 | fs-impl-phase6-doc-generation | 7 | `.aide/specs/{feature_name}` |
| 21 | fs-planning-phase1-intake-and-init | 8 | `.aide/specs/{feature_name}` |
| 22 | fs-planning-phase2-explore | 10 | `.aide/specs/{feature_name}` |
| 23 | fs-planning-phase3-finalize | 7 | `.aide/specs/{feature_name}` |
| 24 | fs-refactoring-phase1-status | 6 | `{refactoring_dir}` |
| 25 | fs-refactoring-phase2-candidates | 7 | `{refactoring_dir}` |
| 26 | fs-refactoring-phase3-plan | 6 | `{refactoring_dir}` |
| 27 | fs-refactoring-phase4-design | 8 | `{refactoring_dir}` |
| 28 | fs-refactoring-phase5-impl | 8 | `{refactoring_dir}` |
| 29 | fs-refactoring-phase6-doc | 7 | `{refactoring_dir}` |
| 30 | fs-reverse-phase1-program | 7 | `.aide/specs/{feature_name}` |
| 31 | fs-reverse-phase2-dev-env | 5 | `.aide/specs/{feature_name}` |
| 32 | fs-reverse-phase3-system-req | 5 | `.aide/specs/{feature_name}` |
| 33 | fs-reverse-phase4-user-req | 7 | `.aide/specs/{feature_name}` |
| 34 | fs-reverse-phase5-optional-phases | 7 | `.aide/specs/{feature_name}` |
| — | **合計（34 スキル）** | **281** | — |

> 補足: `fs-refactoring-phase5-impl` は本文で `{changes_dir}` という表記を使う箇所があるが（grep 結果）、リファクタリング WF の成果物フォルダは `{refactoring_dir}` であるため、artifact_dir に渡す値は `{refactoring_dir}`（= 当該 WF のコンテキスト変数）とする。実装工程で当該スキルが保持する変数名を確認し、その成果物フォルダパスを渡すこと。

## 対象外スキル（step-history-writer 呼び出しを持たない 7 スキル）

以下の final-check 系は step-history-writer を呼ばないため改修対象外。逆に `.aide/tmp/session-history-*.txt` を削除する側（overview 2.4 参照）。

- fs-bugfix-phase3-final-check
- fs-change-phase3-final-check
- fs-design-phase11-final-check
- fs-impl-phase7-final-check
- fs-planning-phase4-final-check
- fs-refactoring-phase7-final-check
- fs-reverse-phase6-final-check

> 注: 上記 7 スキルはいずれも各 WF 末尾の final-check 系であり、step-history-writer 呼び出しを持たない（grep 実数 0 件）。名称に「final-check」を含む `fs-impl-phase5-final-check`（実装WF中間の検証フェーズ）は step-history-writer を呼ぶ（6 出現）ため改修対象（#19）に含まれ、この 7 スキルには入らない。改修対象は grep で呼び出し実数が確認できた 34 スキルとする。

## 変更理由

- REQ-C-007 AC-007-1〜AC-007-5。step-history-writer の入力に `artifact_dir` が追加されたことに伴い、全呼び出し箇所が成果物フォルダパスを渡さないと、当該スキルから書き出した履歴に成果物フォルダパスが記録されず、REQ-C-004 の絞り込み（compliance-checker W4-0）が効かなくなる（フォールバック `(未指定)` 扱いとなり絞り込みで除外される）。全件に漏れなく適用する必要がある。
- 引数追加のみに限定する理由（AC-007-5）: 各スキルの責務・構造・フェーズ構成・Process 手順は変更しない非破壊な機械的変更とし、波及を最小化する（approach.md OCP 評価）。
- **スコープの確定（要件で fs-* 改修は正式にスコープ内）:** REQ-C-007（fs-* の step-history-writer 呼び出しへの `artifact_dir` 引数追加）は、change-requirements.md「対象外」節および approach.md で**正式にスコープ内**と確定している。したがって本ファイルでスコープ逸脱を自己宣言する必要はない。一方、これを超える fs-* 本体改修（フェーズ構成・Process 手順・責務変更）はスコープ外である。
- **phase-compliance-check 呼び出しには手を入れない（前回 FAIL の解消）:** 設計/実装/企画/逆引きの 4 WF では、compliance-checker が `progress_file_path`・`skill_name` から feature フォルダパスを導出して照合キーとするため（REQ-C-004 / AC-004-5〜7）、これらの WF の phase-compliance-check 呼び出しに `changes_dir` を渡す/揃える改修は一切不要であり、本変更では変更しない。前回 fix で記述した「4 WF の phase-compliance-check(write) へ渡す changes_dir 値を feature フォルダパスに揃える整合作業を本スコープ内とする」という記述、および「スコープに関する懸念」ブロックは撤回・削除した。これにより前回 QA レビューの FAIL（fs-* スコープ拡張の自己宣言・overview §2.2 との矛盾）は解消する。

## 受入基準カバレッジ

| AC | 充足箇所 |
|---|---|
| AC-007-1 | 「対象スキル一覧」全 34 スキルへの引数追加 |
| AC-007-2 | 「WF 種別ごとに渡す成果物フォルダパス」表 |
| AC-007-3 | 代表 before→after（既存 skill_name/step_id/step_title 維持・末尾追加） |
| AC-007-4 | 設計方針（全件同一の汎用名 `artifact_dir`） |
| AC-007-5 | スコープ厳守注記（引数追加のみ・フェーズ構成不変） |
