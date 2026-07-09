---
name: fs-impl-phase5-final-check
description: "Use when all implementation tasks are complete and the implementation loop has finished."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 追加実装コード | 設計書で定義されたパス | Step1 で ❌ が発見された場合の追加実装コード（coding-test-2review 経由で更新） |
| 追加テストコード | 設計書で定義されたパス | 追加実装に対応するテストコード（coding-test-2review 経由で更新） |
| manual-test-plan.md | .aide/specs/{feature_name}/testing/manual-test-plan.md | 動作確認試験書（試験項目漏れがあった場合に追記） |
| impl-progress.md | .aide/specs/{feature_name}/impl-progress.md | 実装ワークフローの進捗ファイル（phase-report-check が更新） |
| fs-impl-phase5-report.txt | .aide/tmp/fs-impl-phase5-report.txt | fs-impl-phase5-final-check の実行レポート |

注: 本フェーズは検証フェーズである。設計準拠・試験網羅性の照合結果はフェーズレポートに記録する。
- Step1 の全設計書横断照合と未実装項目のタスク化は `final-design-audit-agent` が担う
- タスク化された未実装項目の追加実装は coding-test-2review を通じて行う
- Step2 の試験網羅性照合と試験項目漏れの追記は `test-coverage-audit-agent` が担う


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase5-report.txt以外のファイルの書き出しは禁止。

- **最終チェック2項目の省略禁止**: 「最終設計準拠チェック」「動作確認試験書の網羅性チェック」のいずれも省略してはならない。「実装ループが通ったから大丈夫」は理由にならない。
- **実装系エージェントはすべて coding-test-2review 経由**: Step1 で発見された未実装項目の追加実装・テスト・テスト実行・設計準拠レビュー・コード品質レビュー・設計同期の一切は `coding-test-2review (aide-powers skill)` への呼び出しに委ねる。`micro-impl-agent` / `design-review-agent` / `code-review-agent` / `multi-stage-code-review` / `design-sync` を本スキルから直接呼び出してはならない。ただし最終監査を担う `final-design-audit-agent`（Step1 の全設計書横断照合）と `test-coverage-audit-agent`（Step2 の試験網羅性照合）は本フェーズが正規に直接呼び出すエージェントであり、この直接呼び出し禁止の対象には含まれない。
- **Step2 の差し戻し原則**: 動作確認試験書の網羅性チェックで未カバー要件（❌）が発見された場合、安易に「試験項目漏れ」と判断せず、まず実装漏れの可能性を確認し、実装漏れがあれば Step1 に差し戻す。
- **gitコミット忘れ禁止**: 後処理で `git-commit-workflow (aide-powers skill)` を呼ばずにフェーズを終了してはならない（実装ワークフローは各フェーズコミット型）。

# レポート運用ルール

fs-impl-phase5-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase5-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `coding-test-2reviewの出力(Step1): N/A（❌項目なしのため追加実装不要）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase5-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（例: .aide/specs/{feature_name}）
・現在のPhase:
・現在のStep:
・`.aide/references/phase-skill-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　phase-skill-rules重要ポイント1(前処理):
　phase-skill-rules重要ポイント2(前処理):
　phase-skill-rules重要ポイント3(前処理):
・`.aide/references/global-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　global-rules重要ポイント1(前処理):
　global-rules重要ポイント2(前処理):
　global-rules重要ポイント3(前処理):
・progress-resume-check (aide-powers skill)を activate して実行し、出力を"progress-resume-checkの出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase5-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
　再開Step(前処理):
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-impl-phase5-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

- FAIL の場合
  - 直前フェーズが正常に完了していない可能性がある
  - 現フェーズの実行を阻止し、直前フェーズを前処理からやり直すことを前提に、その旨をユーザーに確認する
  - 最終的な対応方針はユーザーが決定する（後段の遷移には進まない）
- PASS の場合
  - 次に "再開ポイント(前処理):" の内容で遷移先を決める
  - `RESUME_FROM N`（N==本フェーズ番号=5）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
  - `RESUME_FROM N`（N>本フェーズ番号=5）→ 該当する後続フェーズスキルへ遷移する
  - `RESUME_FROM N`（N<本フェーズ番号=5）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
  - `START_FRESH`（新規開始）→ 異常（実装ループが未完了）。ユーザーに報告し、前フェーズスキル `fs-impl-phase4-execution (aide-powers skill)` に差し戻す
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 最終設計準拠チェック

### 成果物
fs-impl-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index.md から全設計書を特定し、全項目（全クラス定義・全メソッドシグネチャ・全不変条件・全テスト観点）が実装コードで対応されているかを横断的に照合（holistic 監査）するため、`final-design-audit-agent (aide-powers agent)` を呼び出し、出力を"最終設計準拠監査エージェントの出力(Step1):"として記載する。呼び出し時に次を渡す: feature_name, doc_index_path（`.aide/specs/{feature_name}/doc-index.md`）, task_list_path（`.aide/specs/{feature_name}/impl-task-list.md`）, process_checklist_path（`.aide/specs/{feature_name}/impl-process-checklist.md`）。本エージェントは doc-index から照合対象の全設計書を特定し、全項目を1項目ずつ ✅/❌ で照合する。❌（未実装項目）を検出した場合は本エージェント自身が impl-task-list.md（2層構造）＋ impl-process-checklist.md に新規タスクとして追記（タスク化）する。その記載内容から、次の項目を判断して記載する
　対象設計書パス一覧(Step1):（監査エージェントが doc-index から特定した全設計書）
　全項目照合結果(Step1):（全項目✅ / ❌項目一覧）
　❌検出時のタスク化結果(Step1):（追記タスク番号一覧 / N/A（❌0件のため追記なし））
・❌項目がある場合（= 監査エージェントが impl-task-list.md / impl-process-checklist.md に追記済み）、`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step1):"として記載する。呼び出し時に次を渡す: task_list_path=`.aide/specs/{feature_name}/impl-task-list.md`, process_checklist_path=`.aide/specs/{feature_name}/impl-process-checklist.md`, design_doc_paths=`object-design-*.md / gui-design.md / infra-interface-design.md / program-structure.md 等`（doc_index_path から特定する実装の根拠となる設計書群）, doc_index_path, pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）。追加実装中に設計不備が発覚した場合の設計書同期（design-sync）は coding-test-2review 内部で行われる。❌項目がない場合は理由を記載する
　coding-test-2reviewの出力(Step1):

### 完了条件
fs-impl-phase5-report.txtの"全項目照合結果(Step1)"が全項目✅（❌0件）であり、❌があった場合は監査エージェントによるタスク化を経て coding-test-2review が status: DONE を返している

### 状態判定
完了条件を満たし"全項目照合結果(Step1)"が全項目✅の場合 Step2 へ遷移する。

- ❌ありの場合
  - 本スキルディレクトリの `design-impl-gap-process.md` を Read で読み込み、漏れ種別（設計漏れ / 実装漏れ）に応じた対策プロセスに従う
  - 実装漏れ → プロセス A に従い、タスクリスト再作成 → coding-test-2review → 再監査を全項目✅になるまで繰り返す
  - 設計漏れ → プロセス B に従い、該当設計FSの再実行 → 差分タスクリスト追加 → coding-test-2review → 再監査を全項目✅になるまで繰り返す
  - 10回繰り返しても解消しない場合 → プロセス C に従いユーザーに相談する
- coding-test-2review が status: BLOCKED を返した場合
  - ユーザーに報告し対応方針を確認する

## Step 2: 動作確認試験書の網羅性チェック

### 成果物
fs-impl-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`user-requirements.md` の全要件項目と `manual-test-plan.md` の全試験項目を照合し、各要件に対応する試験項目が存在するかを監査するため、`test-coverage-audit-agent (aide-powers agent)` を呼び出し、出力を"動作確認試験書網羅性監査エージェントの出力(Step2):"として記載する。呼び出し時に次を渡す: feature_name, user_requirements_path（`.aide/specs/{feature_name}/user-requirements.md`）, manual_test_plan_path（`.aide/specs/{feature_name}/testing/manual-test-plan.md`）。本エージェントは全要件を1件ずつ照合し、❌（未カバー要件）を検出した場合は原因を判定する（試験項目漏れ → manual-test-plan.md に試験項目を追記 / 実装漏れの疑い → 「実装漏れの可能性あり（Step1差し戻し推奨）」と報告）。その記載内容から、次の項目を判断して記載する
　網羅性チェック結果(Step2):（全要件カバー / ❌未カバー要件一覧）
・❌（未カバー要件）がある場合、監査エージェントの原因判定をユーザーに提示し確認した結果を記載する
　原因判定と対応(Step2):（実装漏れの可能性あり → ユーザー確認の上 Step1 へ差し戻し / 試験項目漏れ → 監査エージェントが manual-test-plan.md に試験項目を追記済み）

> 監査エージェントは安易に「試験項目漏れ」と判断せず、まず実装漏れの可能性を確認する（Step1 差し戻しが原則）。実装漏れの可能性ありと報告された場合は、ユーザー確認の上で Step1 へ差し戻す。

### 完了条件
fs-impl-phase5-report.txtの"網羅性チェック結果(Step2)"が全要件カバー（❌0件）である

### 状態判定
完了条件を満たし"網羅性チェック結果(Step2)"が全要件カバーの場合 後処理へ遷移する。

- ❌ありの場合
  - 監査エージェントの原因判定（実装漏れの可能性あり / 試験項目漏れ）をユーザーに確認する
  - 実装漏れであれば Step1 へ差し戻す
  - 試験項目漏れであれば監査エージェントが manual-test-plan.md に試験項目を追記済みのため再照合し、全要件カバーになるまで繰り返す

## 後処理

### 成果物
fs-impl-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡し、下記「レポート記載項目リスト」を required_items として渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
　進捗更新結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し（実装ワークフローは各フェーズコミット型のため、本フェーズの進捗ファイル更新後にコミットする。コミット対象＝追加実装コード/テストコード + manual-test-plan.md（試験項目追記分）+ impl-progress.md）、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase5-report.txtに、phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:

- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-impl-phase5-report.txtの"完了ステータス(後処理)"を確認したら `fs-impl-phase6-doc-generation (aide-powers skill)` を activate して実行する

注: 実装ワークフローは各フェーズコミット型である。
- 本フェーズは後処理の phase-report-check(write)（進捗ファイル更新）の**後**に git-commit-workflow でコミットする
- 最終フェーズ（fs-impl-phase7-final-check）でも進捗ファイルの最終更新後にコミットされる

# レポート記載項目リスト

後処理で phase-report-check (write) を呼び出す際、required_items として渡す必須項目リスト。
phase-report-checker はこのリストと fs-impl-phase5-report.txt を突き合わせ、記載項目漏れ（項目欠落、または値が空で理由記載もない）を検証する。

- 成果物出力先フォルダ(前処理):
- 現在のPhase:
- 現在のStep:
- phase-skill-rules重要ポイント1(前処理):
- phase-skill-rules重要ポイント2(前処理):
- phase-skill-rules重要ポイント3(前処理):
- global-rules重要ポイント1(前処理):
- global-rules重要ポイント2(前処理):
- global-rules重要ポイント3(前処理):
- progress-resume-checkの出力(前処理):
- 再開ポイント(前処理):
- 再開ポイント判定理由(前処理):
- 引継ぎファイルがあれば内容の要約(前処理):
- 再開Step(前処理):
- phase-report-check(verify)の出力(前処理):
- 前のフェーズ(前処理):
- 前のフェーズ完了日時(前処理):
- 進捗確認結果(前処理):
- user-profile-management(apply)の出力(前処理):
- ユーザーのドメイン知識レベル(前処理):
- ユーザーのプログラムスキルレベル(前処理):
- やり取り上の注意点要約(前処理):
- 対象設計書パス一覧(Step1):
- 最終設計準拠監査エージェントの出力(Step1):
- 全項目照合結果(Step1):
- ❌検出時のタスク化結果(Step1):
- coding-test-2reviewの出力(Step1):
- 動作確認試験書網羅性監査エージェントの出力(Step2):
- 網羅性チェック結果(Step2):
- 原因判定と対応(Step2):
- phase-report-check(write)の出力(後処理):
- フェーズ完了検証結果(後処理):
- 進捗更新結果(後処理):
- user-profile-management(update)の出力(後処理):
- プロフィール更新内容(後処理):
- git-commit-workflowの出力(後処理):
- コミット結果(後処理):
- 完了ステータス(後処理):
- 次フェーズ遷移先(後処理):

> 注: 分岐により実行されない処理（例: Step1 で ❌ がなく coding-test-2review を呼び出さない場合、Step2 で ❌ がなく原因判定を行わない場合）の項目は、required_items から除外して渡すか、レポートに理由（例: `coding-test-2reviewの出力(Step1): N/A（❌項目なしのため追加実装不要）`）を記載すること。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 1（❌項目の追加実装。内部で実装→テスト→テスト実行→2段階レビュー→設計漏れ時の設計同期を完結）

**前のフェーズスキル:**
- `fs-impl-phase4-execution (aide-powers skill)`（タスク実装ループ）→ **fs-impl-phase5-final-check**

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase6-doc-generation (aide-powers skill)` — ドキュメント生成フェーズ

**Called by:**
- `fs-impl-phase4-execution (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-impl-phase5-final-check`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（追加実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。phase-report-check(write) の後にコミット）
- `visual-companion (aide-powers skill)` — ユーザー提示時の視覚的提示に活用
- `task-orchestration (aide-powers skill)` — 量が多い場合の分割処理に活用

**呼び出す名前付きエージェント:**
- `final-design-audit-agent (aide-powers agent)` — Step 1（最終設計準拠監査: doc-index から全設計書を特定し全項目を横断照合する holistic 監査。❌検出時は impl-task-list.md（2層構造）＋ impl-process-checklist.md へのタスク化も担う）
- `test-coverage-audit-agent (aide-powers agent)` — Step 2（動作確認試験書の網羅性監査: user-requirements.md × manual-test-plan.md の照合。試験項目漏れは manual-test-plan.md へ追記、実装漏れの疑いは Step1差し戻し推奨を報告）
- `micro-impl-agent (aide-powers agent)` — Step 1 の追加実装（すべて coding-test-2review 経由。本スキルから直接呼び出さない）
- `code-review-agent (aide-powers agent)` — Step 1 の追加実装サイクル内コード品質レビュー（すべて coding-test-2review 経由。直接呼び出し禁止）
- `design-review-agent (aide-powers agent)` — Step 1 の追加実装サイクル内設計準拠レビュー（すべて coding-test-2review 経由。本スキルから直接呼び出さない。乖離種別判定（FAIL_IMPL / FAIL_DESIGN）を担う。最終監査の横断照合は final-design-audit-agent が担う）

**Input from caller:**
- `feature_name`: プロジェクト名
- `impl-progress.md` のパス（`.aide/specs/{feature_name}/impl-progress.md`）
- `user-requirements.md` のパス（`.aide/specs/{feature_name}/user-requirements.md`）
- `manual-test-plan.md` のパス（`.aide/specs/{feature_name}/testing/manual-test-plan.md`）
- `doc-index.md` のパス

**Output to next phase:**
- 全設計書全項目 ✅・全要件試験カバー済みの状態

**異常系プロセス定義（❌検出時に参照）:**
- `design-impl-gap-process.md`（本スキルディレクトリ内）— 設計漏れ・実装漏れ発見時の対策プロセス（プロセスA: 実装漏れ対策 / プロセスB: 設計漏れ対策 / プロセスC: 10回繰り返しユーザー相談）

**Global rules:** `.aide/references/global-rules.md` を厳守
