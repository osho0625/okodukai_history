# 差分設計: 下流フォロワー（工程チェック表フォーマット追従・直接変更対象へ格上げ）

> メインファイル: [delta-design.md](./delta-design.md) の「修正対象の差分設計」より分割
> 新フォーマットの正準定義はメインファイルの「共通仕様（CF-1〜CF-9）」を参照。本ファイルは、当初「フォーマット依存だが直接対象外（更新が必要な設計資料）」として整理していた下流ファイル群を **直接変更対象へ格上げ** し、before→after を設計する（生成側・読み取り側はセットで直す方針の踏襲）。
> 関連要求: REQ-C-001 / REQ-C-002（並列化）/ 案A（1工程1行）

## 本ファイルの位置づけ

メインの「共通仕様（CF-1〜CF-9）」を**唯一の正準定義**とし、下流の各ファイルがそれに一致するよう before→after を示す（フォーマット定義の重複記述はしない。各 after は CF を参照する）。下流ファイルは次の 3 区分で整理する。

- **区分A（直接変更対象 = before→after を設計）**: チェック表のフォーマット／完了判定／追記構造に依存する記述を持つファイル。
- **区分B（変更不要 ＋ 根拠）**: チェック表更新手順をプロンプト側から渡される設計、または生成を impl-task-planning へ委譲するのみで、旧フォーマット前提をハードコードしていないファイル。
- **区分C（フォーマット非依存 = 影響なし）**: メインの「インターフェース影響サマリ」に既出。本ファイルでは再掲のみ。

対象ファイルと区分:

| # | ファイル / 箇所 | 区分 | 概要 |
|---|---|---|---|
| A-1 | skills/fs-impl-phase4-execution/SKILL.md | A | 成果物表記・Step1完了条件・内部挙動の注記を CF-9／並列化へ整合 |
| A-2 | agents/final-design-audit-agent.md [5-2] | A | ❌検出時のチェック表追記を「8列/3列」→ CF-1/CF-2/CF-3/CF-4/CF-7 の工程行一式へ |
| A-3 | skills/fs-refactoring-phase5-impl/SKILL.md | A | Step1完了条件・内部挙動の注記を CF-9／並列化へ整合 |
| A-4 | skills/fs-refactoring-phase6-doc/SKILL.md Step3 | A | 「テスト実行工程の結果」読み取りを `run_test` 工程行（CF-2）へ |
| A-5 | skills/fs-change-phase2-impl/SKILL.md Step10 | A | Step10完了条件・内部挙動の注記を CF-9／並列化へ整合（grep 漏れ防止で追加検出） |
| A-6 | skills/fs-bugfix-phase2-impl/SKILL.md Step8 | A | Step8完了条件・内部挙動の注記を CF-9／並列化へ整合（grep 漏れ防止で追加検出） |
| B-1 | skills/fs-impl-phase5-final-check/SKILL.md | B | チェック表追記は final-design-audit-agent[5-2]（A-2）が持つ。SKILL は非フォーマット依存の委譲記述のみ |
| B-2 | agents/micro-impl-agent.md | B | チェック表更新手順をハードコードせず。手順はプロンプト（CF-5）が渡す |
| B-3 | agents/design-review-agent.md | B | 同上 |
| B-4 | agents/code-review-agent.md | B | 同上 |
| B-5 | skills/fs-impl-phase2-preparation/SKILL.md Step3 | B | 生成を impl-planner-prompt.md（G2）へ委譲。SKILL に列構成のハードコードなし |
| B-6 | skills/fs-change-phase2-impl/SKILL.md タスク計画Step8 ＋ change-task-planner-prompt.md ステップ6 | B | 生成を impl-task-planning へ委譲。列構成のハードコードなし |
| B-7 | skills/fs-bugfix-phase2-impl/SKILL.md タスク計画Step6 ＋ bugfix-task-planner-prompt.md ステップ6 | B | 同上 |
| B-8 | skills/fs-refactoring-phase4-design/SKILL.md Step5 | B | 生成を impl-task-planning「工程チェック表の生成（必須）」へ委譲。列構成のハードコードなし |

---

# 区分A: 直接変更対象（before→after）

## A-1: skills/fs-impl-phase4-execution/SKILL.md

### A-1-(1) 成果物テーブルの工程チェック表説明

#### before

```markdown
| impl-process-checklist.md | .aide/specs/{feature_name}/impl-process-checklist.md | 工程チェック表（全タスク・全工程 PASS） |
```

#### after

```markdown
| impl-process-checklist.md | .aide/specs/{feature_name}/impl-process-checklist.md | 工程チェック表（1工程1行。全工程行が ✅ done／➖ skip） |
```

### A-1-(2) Step 1 完了条件

#### before

```markdown
### 完了条件
fs-impl-phase4-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、`.aide/specs/{feature_name}/impl-task-list.md` の全タスクが完了状態に更新され、`.aide/specs/{feature_name}/impl-process-checklist.md` の全タスク・全工程が PASS である
```

#### after

```markdown
### 完了条件
fs-impl-phase4-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、`.aide/specs/{feature_name}/impl-task-list.md` の全タスクが完了状態に更新され、`.aide/specs/{feature_name}/impl-process-checklist.md` の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```

### A-1-(3) Step 1 注記（coding-test-2review 内部挙動の要約）

#### before

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない。依存先が全て完了したタスクから実行し、依存先のない複数タスクは複数のサブエージェントを同時に起動して並列実装する）→ 最大6タスクを 1タスク=1サブエージェント で並列に 実装→テスト実装→テスト実行（対象テスト＋全体リグレッション）→設計準拠レビュー→コード品質レビュー → 工程チェック表更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で fix→再レビューが PASS まで回る。成果物種別（プログラム / 非プログラム）の判定と簡略サイクル、合理的乖離検出時の design-sync も coding-test-2review 内部で実行される。
```

#### after

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない。依存先が全て完了したタスクから実行し、依存先のない複数タスクは複数のサブエージェントを同時に起動して並列実装する）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行（対象テスト＋全体リグレッション）→ 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で該当工程行を未PASS（⬜ todo）に戻して fix→再レビューが PASS まで回る。成果物種別（プログラム / 非プログラム）の判定と簡略サイクル（非プログラムは ➖ skip 行）、合理的乖離検出時の design-sync も coding-test-2review 内部で実行される。
```

### 変更理由（A-1）

- (1)(2) 案A により完了判定の対象が「全タスク・全工程 PASS」（列前提）から「全工程行が ✅ done／➖ skip」（1工程1行）へ変わる。読み取り側の完了判定を CF-9 に一致させないと、生成（1工程1行）と判定（旧列前提）が不整合になり完了判定が破綻する。
- (3) coding-test-2review の内部挙動を要約した注記が「1タスク=1サブエージェント」「実装→テスト実装→…」の逐次前提のままだと、並列化（REQ-C-001/002）された本体（delta-design-coding-test-2review-skill.md）と矛盾する。要約を 実装∥テスト実装・2レビュー並列・工程行3段階更新へ整合させる（フォーマット定義は CF を参照し、ここでは重複定義しない）。

---

## A-2: agents/final-design-audit-agent.md [5-2] impl-process-checklist.md への追記

### before

```markdown
#### [5-2] impl-process-checklist.md への追記

追記した各タスクについて、工程チェック表に行を追加する:

- プログラムコードタスク → フルサイクル（8列）。各セルは未実施 `[ ] / —`
- 非プログラム成果物タスク → 簡略サイクル（3列）。各セルは未実施 `[ ] / —`
```

### after

```markdown
#### [5-2] impl-process-checklist.md への追記

工程チェック表は「1 工程 = 1 行」構造（impl-task-planning スキルの「工程チェック表の生成（必須）」が定義する正準フォーマット）である。追記した各タスクについて、**そのタスクの工程行一式**を追加する（行キーは `{task_id}::{工程キー}`、状態の初期値は `⬜ todo`／実行エージェントは `—`／output は `—`）:

- プログラムコードタスク → 5 工程行を追加する: `implement`（実装）/ `write_test`（テスト実装）/ `run_test`（テスト実行）/ `spec_review`（設計準拠レビュー）/ `quality_review`（コード品質レビュー）。各行の初期状態は `⬜ todo`
- 非プログラム成果物タスク → `implement`（実装）/ `spec_review`（設計準拠レビュー）を実工程行として初期状態 `⬜ todo` で追加し、`write_test`／`run_test`／`quality_review` は `➖ skip` 行として追加する（output に成果物種別の判定理由を記入。理由なき簡略化を禁止）

> 状態記号・工程キーと担当エージェントの対応・行キー採番は impl-task-planning スキルの「工程チェック表の生成（必須）」セクションに従う（旧「フルサイクル8列 / 簡略3列」「`[ ] / —`」形式は廃止）。
```

### 変更理由（A-2）

- 本エージェント定義は、チェック表の**生成フォーマットを直接ハードコードしている唯一のエージェント定義**（「フルサイクル8列 / 簡略3列」「各セルは `[ ] / —`」）。案A で生成側（impl-task-planning）を 1工程1行へ変えた以上、ここを変えないと、最終チェックでの追記だけが旧フォーマット（列）で行われ、生成と追記が不整合になる（読み取り側 coding-test-2review が工程行を見つけられず完了判定・工程実行が破綻する）。
- 追記内容を CF-1（行キー）/ CF-2（工程キーと担当）/ CF-3（状態記号・初期値 ⬜ todo・➖ skip）/ CF-4（列スキーマ）/ CF-7（非プログラム成果物の skip 行）に一致させる。フォーマットの正準定義は impl-task-planning 側（メイン CF）に一元化したまま、本エージェントはそれに従う旨を記述する。
- 出力フォーマットの「### ❌ 検出時のタスク化結果」テーブルの列見出し「impl-process-checklist 追記」は追記の有無（済/—）を表すメタ列でありフォーマット非依存のため不変。

---

## A-3: skills/fs-refactoring-phase5-impl/SKILL.md

### A-3-(1) Step 1 完了条件

#### before

```markdown
### 完了条件
fs-refactoring-phase5-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、{refactoring_dir}/refactoring-design.md の全タスクが完了状態に更新され、{refactoring_dir}/impl-process-checklist.md の全タスク・全工程が PASS である
```

#### after

```markdown
### 完了条件
fs-refactoring-phase5-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、{refactoring_dir}/refactoring-design.md の全タスクが完了状態に更新され、{refactoring_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```

### A-3-(2) Step 1 注記（coding-test-2review 内部挙動の要約）

#### before

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念・並列可/逐次マーカーは使わない）→ 最大6タスクを 1タスク=1サブエージェント で並列に 実装→テスト実装→テスト実行→設計準拠レビュー→コード品質レビュー → 工程チェック表更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

#### after

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念・並列可/逐次マーカーは使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

### 変更理由（A-3）

- (1) リファクタリングWF の完了判定も「全タスク・全工程 PASS」（列前提）のままだと、1工程1行構造で生成されたチェック表に対して判定が成立しない。CF-9 に整合させる。
- (2) 内部挙動の注記の逐次・1タスク=1サブエージェント前提を、並列化（REQ-C-001/002）＋工程行3段階更新へ整合させる（A-1-(3) と同趣旨）。テスト実行のセーフティネット（全体リグレッション）と preservation check の記述（後続の箇条書き）はフォーマット非依存のため不変。

---

## A-4: skills/fs-refactoring-phase6-doc/SKILL.md Step 3（テスト実行結果の代替読み取り）

### before

```markdown
  - テスト実行結果
    - `.aide/tmp/fs-refactoring-phase5-report.txt` の「リグレッション結果」から最終テスト結果を読み取り、全既存テストがパスしていることを確認・報告
    - phase5 レポートが参照できない場合は {refactoring_dir}/impl-process-checklist.md のテスト実行工程の結果で代替する
    - ※レポート方式では最終テスト結果は phase5 のレポートに記録される。refactoring-progress.md にはフェーズ1で記録したセーフティネット基準が入っている
```

### after

```markdown
  - テスト実行結果
    - `.aide/tmp/fs-refactoring-phase5-report.txt` の「リグレッション結果」から最終テスト結果を読み取り、全既存テストがパスしていることを確認・報告
    - phase5 レポートが参照できない場合は {refactoring_dir}/impl-process-checklist.md の **`run_test`（テスト実行）工程行（行キー `{task_id}::run_test`）の状態（`✅ done`）と output（結果サマリ）** で代替する（1工程1行構造。共通仕様 CF-2）
    - ※レポート方式では最終テスト結果は phase5 のレポートに記録される。refactoring-progress.md にはフェーズ1で記録したセーフティネット基準が入っている
```

### 変更理由（A-4）

- 案A により「テスト実行工程」は列ではなく `run_test` 工程行（CF-2）として存在する。代替読み取りの所在を「テスト実行工程の結果（列セル）」から「`run_test` 工程行の状態・output」へ読み替えないと、新構造のチェック表からテスト実行結果を取得できない。フォーマット正準定義は CF-2 を参照する。

---

## A-5: skills/fs-change-phase2-impl/SKILL.md Step 10（grep 漏れ防止で追加検出）

> 当初の delta-design ではこの SKILL は「生成委譲のみ（タスク計画Step）」として整理していたが、grep で **Step10（coding-test-2review 呼び出し）の完了条件と内部挙動注記が読み取り側のフォーマット依存表現を含む**ことを確認した。読み取り側として item A-1/A-3 と同じ追従が必要なため直接対象に格上げする。

### A-5-(1) Step 10 完了条件

#### before

```markdown
### 完了条件
fs-change-phase2-report.txtに coding-test-2reviewの出力(Step10)が記載され、status: DONE であり、{changes_dir}/delta-task-list.md の全タスクが完了状態に更新され、{changes_dir}/impl-process-checklist.md の全タスク・全工程が PASS である
```

#### after

```markdown
### 完了条件
fs-change-phase2-report.txtに coding-test-2reviewの出力(Step10)が記載され、status: DONE であり、{changes_dir}/delta-task-list.md の全タスクが完了状態に更新され、{changes_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```

### A-5-(2) Step 10 注記（coding-test-2review 内部挙動の要約・該当部分）

#### before

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ 最大6タスクを 1タスク=1サブエージェント で並列に 実装→テスト実装→テスト実行→設計準拠レビュー→コード品質レビュー → 工程チェック表更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

#### after

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

### 変更理由（A-5）

- Step10 の完了条件「全タスク・全工程が PASS」は item A-1/A-3 と同一の読み取り側フォーマット依存であり、CF-9 へ整合させないと変更WFの実装ループ完了判定が新構造で成立しない。
- 内部挙動注記の逐次・1タスク=1サブエージェント前提も並列化（REQ-C-001/002）＋工程行3段階更新へ整合させる。注記後段の task_kind=change / preservation check 等の記述はフォーマット非依存のため不変。

---

## A-6: skills/fs-bugfix-phase2-impl/SKILL.md Step 8（grep 漏れ防止で追加検出）

> A-5 と同様、当初「生成委譲のみ」だったが Step8（coding-test-2review 呼び出し）の完了条件・内部挙動注記が読み取り側フォーマット依存を含むため直接対象に格上げする。

### A-6-(1) Step 8 完了条件

#### before

```markdown
### 完了条件
fs-bugfix-phase2-report.txtに coding-test-2reviewの出力(Step8)が記載され、status: DONE であり、{bugfix_dir}/delta-task-list.md の全タスクが完了状態に更新され、{bugfix_dir}/impl-process-checklist.md の全タスク・全工程が PASS である
```

#### after

```markdown
### 完了条件
fs-bugfix-phase2-report.txtに coding-test-2reviewの出力(Step8)が記載され、status: DONE であり、{bugfix_dir}/delta-task-list.md の全タスクが完了状態に更新され、{bugfix_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```

### A-6-(2) Step 8 注記（coding-test-2review 内部挙動の要約・該当部分）

#### before

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ 最大6タスクを 1タスク=1サブエージェント で並列に 実装→テスト実装→テスト実行→設計準拠レビュー→コード品質レビュー → 工程チェック表更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

#### after

```markdown
注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
```

### 変更理由（A-6）

- A-5 と同一理由（バグ修正WF版）。完了判定を CF-9 へ、内部挙動注記を並列化＋工程行3段階更新へ整合。注記後段の task_kind=bugfix / preservation check の記述はフォーマット非依存のため不変。

---

# 区分B: 変更不要（判断結果＋根拠）

> 後続のタスク分解・実装・レビューが「追従漏れ」と誤認しないよう、変更不要の判断と根拠を明記する。いずれも Read で現状を確認した結果に基づく。

## B-1: skills/fs-impl-phase5-final-check/SKILL.md

- **判定: 変更不要**
- **根拠**: 本 SKILL の Step1 は、❌検出時のチェック表追記を `final-design-audit-agent` に委ねており、SKILL 本体の記述は「`impl-process-checklist.md` に新規タスクとして追記（タスク化）する」という **非フォーマット依存の委譲記述のみ**である。完了条件「全項目照合結果(Step1)が全項目✅（❌0件）」は監査の ✅/❌ 判定（設計項目単位）を指し、チェック表の列/行フォーマットには依存しない。フォーマットを直接持つ追記ロジックは `final-design-audit-agent.md` [5-2]（本ファイル A-2 で before→after 済み）にあるため、ユーザー指示の「item 2: ❌検出時のチェック表追記を CF-1/CF-4 の行構造へ整合」は A-2 で充足される。
- **補足**: SKILL のレポート記載項目「❌検出時のタスク化結果(Step1)」「対象設計書パス一覧(Step1)」等もフォーマット非依存（追記の有無・対象を記録するメタ項目）。

## B-2: agents/micro-impl-agent.md

- **判定: 変更不要**
- **根拠**: grep（`チェック表|checklist|セル|process_checklist|impl-process|工程`）の結果、本エージェント定義に工程チェック表の更新手順・列セル前提・状態記号のハードコードは**存在しない**。各工程の担当が「どの行をどう更新するか」は呼び出し元プロンプト（coding-test-2review の implementer-prompt.md）が渡す設計であり、その 3 段階更新（CF-5）への追従は [delta-design-coding-test-2review-prompts.md](./delta-design-coding-test-2review-prompts.md) で設計済み。エージェント定義は新フォーマットに非依存のまま機能する。

## B-3: agents/design-review-agent.md

- **判定: 変更不要**
- **根拠**: B-2 と同じ。チェック表更新手順のハードコードなし（grep 確認済み）。更新手順は spec-reviewer-prompt.md（CF-5 の `{task_id}::spec_review` 行 3 段階更新）が渡す。追従は delta-design-coding-test-2review-prompts.md で設計済み。

## B-4: agents/code-review-agent.md

- **判定: 変更不要**
- **根拠**: B-2 と同じ。チェック表更新手順のハードコードなし（grep 確認済み）。更新手順は code-quality-reviewer-prompt.md（CF-5 の `{task_id}::quality_review` 行 3 段階更新）が渡す。追従は delta-design-coding-test-2review-prompts.md で設計済み。

## B-5: skills/fs-impl-phase2-preparation/SKILL.md Step 3

- **判定: 変更不要**
- **根拠**: Step3 はチェック表の生成を `impl-task-planning` スキルと `impl-planner-prompt.md`（G2）へ委譲しており、SKILL 本体には列構成（8列/3列）・記号・テーブル例などの旧フォーマット前提を**ハードコードしていない**（記述は「工程チェック表出力ファイルパス」「工程チェック表生成結果」等のパス・結果項目のみ）。生成側（impl-task-planning SKILL ＝ G1、impl-planner-prompt.md ＝ G2）が 1工程1行へ変われば、本 Step が生成する成果物も自動的に新構造になる。生成側の before→after は [delta-design-impl-task-planning.md](./delta-design-impl-task-planning.md) で設計済み。

## B-6: skills/fs-change-phase2-impl/SKILL.md タスク計画Step 8 ＋ change-task-planner-prompt.md ステップ6

- **判定: 変更不要（生成委譲部分）**
- **根拠**: `change-task-planner-prompt.md` ステップ6 は「タスクリストの全タスクに対して工程チェック表を生成する。フォーマットは impl-task-planning スキルの『工程チェック表の生成』セクションに従う」と**委譲のみ**を記述し、列構成・記号をハードコードしていない（Read 確認済み）。生成側（impl-task-planning）が新構造になれば生成物も新構造になる。
- **注意**: 同 SKILL の **Step10（実装ループ）の完了条件・内部挙動注記は読み取り側のフォーマット依存**であり、こちらは本ファイル **A-5 で before→after 済み**（タスク計画Step とは別箇所）。
- **補足（対象外）**: `SKILL-old.md` には旧フォーマット（8列・`[ ]`・各ステップでセル更新）の記述があるが、現役スキルではない退避ファイルのため変更対象外（区分C）。

## B-7: skills/fs-bugfix-phase2-impl/SKILL.md タスク計画Step 6 ＋ bugfix-task-planner-prompt.md ステップ6

- **判定: 変更不要（生成委譲部分）**
- **根拠**: `bugfix-task-planner-prompt.md` ステップ6 も「フォーマットは impl-task-planning スキルの『工程チェック表の生成』セクションに従う」と委譲のみ（Read 確認済み）。列構成のハードコードなし。
- **注意**: 同 SKILL の **Step8（実装ループ）の完了条件・内部挙動注記は読み取り側のフォーマット依存**であり、本ファイル **A-6 で before→after 済み**。
- **補足（対象外）**: `SKILL-old.md` の旧フォーマット記述は退避ファイルのため変更対象外。

## B-8: skills/fs-refactoring-phase4-design/SKILL.md Step 5

- **判定: 変更不要**
- **根拠**: Step5 は「`impl-task-planning` スキルを activate して『工程チェック表の生成（必須）』に従い {refactoring_dir}/impl-process-checklist.md を生成する」と**委譲のみ**を記述し、列構成・記号をハードコードしていない（Read 確認済み）。完了条件も「impl-process-checklist.md がファイルサイズ1byte以上で存在する」という存在確認のみでフォーマット非依存。生成側が新構造になれば生成物も新構造になる。

---

# 区分C: フォーマット非依存（影響なし・再掲）

メインの「インターフェース影響サマリ > フォーマット非依存（影響なし）」に既出。本ファイルでは一覧のみ再掲する（before→after なし）。

| ファイル / 箇所 | 理由 |
|---|---|
| skills/using-aide-powers/references/progress-file-format.md | impl-process-checklist.md へのリンク参照のみ（表構造の記述なし） |
| agents/test-coverage-audit-agent.md | user-requirements.md × manual-test-plan.md の照合が責務でチェック表非依存 |
| skills/fs-reverse-phase1-program ／ fs-reverse-phase2-dev-env | 「不要」と明記のみで生成／呼び出ししない |
| `*-SKILL-old.md`（fs-impl-phase4-execution / fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase5-impl 等の退避ファイル） | 現役スキルではない履歴ファイル（変更対象外）。旧フォーマット（8列・`[ ]`）の記述が残るが参照されない |

---

# 適用順序の留意（生成側・読み取り側のセット適用）

本ファイルの区分A は全て**読み取り側 or 追記側**の追従であり、生成側（[delta-design-impl-task-planning.md](./delta-design-impl-task-planning.md)）・読み取り本体（[delta-design-coding-test-2review-skill.md](./delta-design-coding-test-2review-skill.md)）・3プロンプト（[delta-design-coding-test-2review-prompts.md](./delta-design-coding-test-2review-prompts.md)）と**同時に**適用しなければならない。片側だけ適用すると、改修途中の中間状態で生成（1工程1行）と読み取り（旧列前提）が不整合になり、工程の取りこぼし・完了判定の破綻を招く。全ファイルを 1 つの整合単位として適用すること（メイン delta-design の最重要整合制約に従う）。
