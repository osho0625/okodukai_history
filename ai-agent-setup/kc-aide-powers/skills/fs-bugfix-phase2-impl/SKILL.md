---
name: fs-bugfix-phase2-impl
description: "Use when fs-bugfix-phase1-analysis completes and design/implementation/completion processing is needed."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fix-design.md | {bugfix_dir}/fix-design.md | before→after形式の修正設計書（規模が大きい場合は索引+分割ファイル構成） |
| fix-design-{name}.md | {bugfix_dir}/fix-design-{name}.md | 大規模時のみ。fix-design.md から参照される分割ファイル（クラス名/テーマ名でファイル分割） |
| delta-task-list.md | {bugfix_dir}/delta-task-list.md | 差分タスクリスト |
| impl-process-checklist.md | {bugfix_dir}/impl-process-checklist.md | 工程チェック表 |
| 実装コード | src/ 配下 | delta-task-list.md に基づく修正実装 |
| テストコード | tests/ 配下 | 各タスクに対応するテスト |
| test-function-list.md | {bugfix_dir}/testing/test-function-list.md | 動作確認対象機能リスト（サブエージェントが出力） |
| test-{機能名}-test-plan.md | {bugfix_dir}/testing/test-{機能名}-test-plan.md | 機能別動作確認試験書（動作確認試験サブエージェントが出力）＋リグレッションテスト結果（リグレッションテスト実行サブエージェントが出力） |
| history.md | {bugfix_dir}/history.md | バグ修正履歴（doc-sync経由で初期作成） |
| fs-bugfix-phase2-report.txt | .aide/tmp/fs-bugfix-phase2-report.txt | fs-bugfix-phase2-implの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-bugfix-phase2-report.txt以外のファイルの書き出しは禁止。

- **修正後の再QAレビュー省略禁止**: QA REJECTED 修正ループ後は必ず再QAレビューを行う（Step5 → Step4）。「指摘通り直したから」「部分レビューで十分」等は省略の根拠にならない
- **NEVER MERGE TASKS**: タスク実装ループは coding-test-2review を1回だけ呼び出す。オーケストレータ側でタスクを束ねたり、ループ・工程順序を制御してはならない（タスクごとの 1呼び出し=1サブタスク 制御は coding-test-2review 内部の責務）

# レポート運用ルール

fs-bugfix-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-bugfix-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `修正設計修正エージェントの出力(Step5): N/A（QA APPROVEDのため修正ループ未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
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
・本フェーズを `RESUME_FROM N`（N==本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（`.aide/tmp/fs-bugfix-phase2-report.txt`）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無い場合は Step1 とする。判定結果を次の項目で記載する
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
fs-bugfix-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号。本フェーズは phase2＝2）
　・`RESUME_FROM N`（N==2：本フェーズ）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>2：後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<2：前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-bugfix-phase1-analysis (aide-powers skill)` に差し戻す
　・`START_FRESH`（新規開始）→ 異常（バグ報告・原因分析・修正方針が未完了）。ユーザーに報告し、前フェーズスキル `fs-bugfix-phase1-analysis (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 設計系共通スキル呼び出し判定

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/fix-plan.md と {bugfix_dir}/bug-analysis.md を読み込み、影響を受ける設計領域を特定した結果を、次の項目で記載する
　影響を受ける設計領域(Step1):（ユーザー要件 / システム要件 / GUI設計 / オブジェクト設計 / ユビキタス言語 / インフラIF設計 / プログラム構成 から該当するもの）
　変更規模判定(Step1):（局所的修正（1〜2ファイル） / 広範囲修正（複数領域））
・広範囲修正の場合、影響を受ける各設計系共通スキルを **mode: delta** で activate して実行し、出力を"設計系共通スキル(mode:delta)の出力(Step1):"として記載する。各スキルが `{bugfix_dir}/delta-{領域名}.md` に差分を出力する。実行したスキルと出力ファイルを次の項目で記載する
　呼び出した設計系共通スキルと出力ファイル(Step1):
・局所的修正の場合は設計系共通スキルを呼び出さず、bugfix-designer のみで作成する旨を「呼び出した設計系共通スキルと出力ファイル(Step1):」に理由として記載する

設計系共通スキル対応表（広範囲修正時に mode: delta で呼び出す）:

| 影響を受ける設計領域 | 呼び出す共通スキル（mode: delta） | 出力ファイル |
|---|---|---|
| ユーザー要件 | `user-requirements-definition (aide-powers skill)` | `{bugfix_dir}/delta-user-requirements.md` |
| システム要件 | `system-requirements-definition (aide-powers skill)` | `{bugfix_dir}/delta-system-requirements.md` |
| GUI設計 | `gui-design (aide-powers skill)` | `{bugfix_dir}/delta-gui-design.md` |
| オブジェクト設計 | `object-design (aide-powers skill)` | `{bugfix_dir}/delta-object-design.md` |
| ユビキタス言語 | `ddd-modeling (aide-powers skill)` | `{bugfix_dir}/delta-ddd-modeling.md` |
| インフラIF設計 | `infra-interface-design (aide-powers skill)` | `{bugfix_dir}/delta-infra-interface.md` |
| プログラム構成 | `program-structure-design (aide-powers skill)` | `{bugfix_dir}/delta-program-structure.md` |

### 完了条件
fs-bugfix-phase2-report.txtに、影響を受ける設計領域(Step1)・変更規模判定(Step1)が記載され、広範囲修正時は呼び出した設計系共通スキルの出力と出力ファイルが記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: 修正設計の作成

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの bugfix_dir から出力ファイルパスを組み立てて記載する
　修正設計の出力ファイルパス(Step2):（例: {bugfix_dir}/fix-design.md。規模が大きい場合は加えて {bugfix_dir}/fix-design-{name}.md）
・本スキルディレクトリの `bugfix-designer-prompt.md`（mode: design。Step 1 が広範囲修正の場合は設計系共通スキルの差分設計結果も渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"修正設計作成エージェントの出力(Step2):"として記載する

### 完了条件
fs-bugfix-phase2-report.txtの修正設計作成エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/fix-design.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの修正設計作成エージェントの出力(Step2)のステータスで遷移先を決める
- DONE の場合 → Step3 へ遷移する
- DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 不足情報を補い `bugfix-designer-prompt.md`（mode: design）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: 修正設計のユーザー承認

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/fix-design.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する。fix-design.md の「修正対象の差分設計」「新規追加の設計」が分割ファイル索引（リンク一覧）になっている場合は、各分割ファイル {bugfix_dir}/fix-design-{name}.md も読み込み、メイン+全分割ファイルをセットで提示する
　修正設計承認のユーザー判断(Step3):
　修正設計承認の修正回数(Step3):
　修正設計承認の修正内容要約(Step3):

### 完了条件
fs-bugfix-phase2-report.txtの"修正設計承認のユーザー判断(Step3)"が承認である

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの"修正設計承認のユーザー判断(Step3)"で遷移先を決める
- 承認の場合 → Step4 へ遷移する
- 修正要求の場合 → `bugfix-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step3 を再実行する

## Step 4: 修正設計のQAレビュー

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: delta-design、affected_domains: Step 1 で特定した影響を受ける設計領域のリスト、doc_index_path）、出力を"design-qa-dispatchの出力(Step4):"として記載する。その記載内容から、次の項目を判断して記載する
　呼び出されたQAレビューアー(Step4):
　QAレビュー結果(Step4):（APPROVED / REJECTED）

QAレビューアー呼び分け対応表（design-qa-dispatch 経由）:

| 影響範囲 | 呼び出すQAレビューアー |
|---|---|
| 差分設計全体（常に呼び出し） | delta-design-qa-agent (aide-powers agent) |
| ユーザー要件に影響 | requirements-qa-agent (aide-powers agent) |
| アーキテクチャに影響 | architecture-qa-agent (aide-powers agent) |
| オブジェクト設計に影響 | object-design-qa-agent (aide-powers agent) |
| プログラム構成に影響 | final-design-qa-agent (aide-powers agent) |

### 完了条件
fs-bugfix-phase2-report.txtに、design-qa-dispatch を実行して得たQAレビュー結果(Step4)（APPROVED / REJECTED）が記載されている

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの"QAレビュー結果(Step4)"で遷移先を決める
- APPROVED の場合 → Step6 へ遷移する
- REJECTED の場合 → Step5 へ遷移する

## Step 5: QA REJECTED 修正ループ

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `bugfix-designer-prompt.md`（fixモード。QA指摘内容と fix_design_path を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"修正設計修正エージェントの出力(Step5):"として記載する
　QA REJECTED修正の修正回数(Step5):

> **修正後の再QAレビュー省略禁止。** 「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」「前回のQAで指摘された箇所だけ修正したので部分レビューで十分」等は全て省略の根拠にならない。

### 完了条件
fs-bugfix-phase2-report.txtの修正設計修正エージェントの出力(Step5)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、修正後の fix-design.md が存在する

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの修正設計修正エージェントの出力(Step5)のステータスで遷移先を決める
- DONE の場合 → 修正内容をユーザーに報告し、Step4 へ戻り再QAレビューする（APPROVED になるまで繰り返す）
- DONE_WITH_CONCERNS の場合 → Step4 へ戻る前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 不足情報を補い `bugfix-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 6: 差分タスクリストの作成

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの bugfix_dir から出力ファイルパスを組み立てて記載する
　差分タスクリストの出力ファイルパス(Step6):（例: {bugfix_dir}/delta-task-list.md, {bugfix_dir}/impl-process-checklist.md）
・本スキルディレクトリの `bugfix-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分タスクリスト作成エージェントの出力(Step6):"として記載する

注: リグレッションテスト（既存テスト全実行）はタスクリスト上の個別タスクとして計画しない。動作確認Step（Step9 工程①・regression-test-prompt.md）で1回実施する設計に統一されている。バグ再現テスト自体（bug-report.md の再現手順を再現するテスト）は通常の実装タスクの一部として delta-task-list.md に含める。

### 完了条件
fs-bugfix-phase2-report.txtの差分タスクリスト作成エージェントの出力(Step6)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/delta-task-list.md と {bugfix_dir}/impl-process-checklist.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの差分タスクリスト作成エージェントの出力(Step6)のステータスで遷移先を決める
- DONE の場合 → Step7 へ遷移する
- DONE_WITH_CONCERNS の場合 → Step7 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 追加情報を補い `bugfix-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 7: タスクリストのユーザー承認

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/delta-task-list.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　タスクリスト承認のユーザー判断(Step7):
　タスクリスト承認の修正回数(Step7):
　タスクリスト承認の修正内容要約(Step7):

### 完了条件
fs-bugfix-phase2-report.txtの"タスクリスト承認のユーザー判断(Step7)"が承認である

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの"タスクリスト承認のユーザー判断(Step7)"で遷移先を決める
- 承認の場合 → Step8 へ遷移する
- 修正要求の場合 → `bugfix-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step7 を再実行する

## Step 8: タスク実装ループ（coding-test-2review 経由）

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・**事前ガード**: `{bugfix_dir}/impl-process-checklist.md` と `{bugfix_dir}/delta-task-list.md` がファイルサイズ1byte以上で存在するか確認した結果を記載する。存在しない場合は実装ループに入らず Step6（差分タスクリストの作成）へ差し戻す
　事前ガード確認結果(Step8):（OK（両ファイル存在） / NG（不在ファイル名）→ Step6 へ差し戻し）
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step8):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{bugfix_dir}/delta-task-list.md`
　　- process_checklist_path=`{bugfix_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{bugfix_dir}/fix-design.md`（実装の根拠となる修正設計書。分割構成の場合はメイン+全分割ファイル）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`bugfix`
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step8):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。成果物種別（プログラム / 非プログラム）の判定も内部で行う。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。リグレッションテスト（既存テスト全実行）は本Step内では実施せず、後続の動作確認Step（Step9）で1回実施する設計に統一されている。

### 完了条件
fs-bugfix-phase2-report.txtに coding-test-2reviewの出力(Step8)が記載され、status: DONE であり、{bugfix_dir}/delta-task-list.md の全タスクが完了状態に更新され、{bugfix_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）

### 状態判定
まず "事前ガード確認結果(Step8):" を確認する
- NG（impl-process-checklist.md または delta-task-list.md が不在）の場合 → 実装ループに入らず Step6（差分タスクリストの作成）へ差し戻す
- OK の場合のみ以下を実行する

coding-test-2review のステータスで遷移先を決める
- status: DONE の場合 → Step9 へ遷移する
- status: BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 9: 動作確認Step（動作確認試験＋リグレッションテスト）

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: リグレッションテスト実行（先行・ブロッキング）】本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を行う。**本工程は工程②〜④（動作確認試験）より先に実行し、全パスを確認できるまで工程②〜④に進まない**。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step9-①):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step9-①):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧）

・【工程②: 試験書作成】工程①で全パスを確認した後、本スキルディレクトリの `bugfix-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。試験書パスを受領する
　試験書作成サブエージェントの出力(Step9-②):
　作成された試験書パス(Step9-②):

・【工程③: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `bugfix`
　- 試験書パス: 工程②で受領したパス
　- WF固有入力: bug-report.md（再現手順）, fix-plan.md（受入基準）
　レビュー結果を"試験書レビュー結果(Step9-③):"として即時記載する
　- **APPROVED の場合** → 工程④へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき試験書を修正させ、再度レビュー。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
　試験書レビュー結果(Step9-③):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step9-③):

・【工程④: 試験実行】工程③で APPROVED となった試験書に基づき、`bugfix-verification-prompt.md` の「試験実行」セクションをモード指定し、サブエージェントを起動して実際の動作確認を行う
　試験実行サブエージェントの出力(Step9-④):

・動作確認結果（工程④）が全てOK の場合（リグレッションテスト結果〔工程①〕は既に全パス確認済み）、ユーザーに修正内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段〕／コードレビュー代替）と、リグレッションテスト結果（全パス/失敗件数）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step9):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step9):

### 完了条件
fs-bugfix-phase2-report.txtに以下が全て満たされていること:
- リグレッションテスト実行サブエージェントの出力(Step9-①)が全パスである
- 試験書レビュー結果(Step9-③)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step9-④)が「OK」である
- ユーザー承認結果(Step9)が「承認」である（エビデンス付き報告済み）
- {bugfix_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- リグレッションテスト結果(Step9-①)に失敗がある場合 → 工程②〜④に進まず、Step8（タスク実装ループ）へ差し戻し、失敗テストの原因を修正するタスクを delta-task-list.md に追記してから再実装し、再度Step9（工程①から）を実行する
- 工程③で NEEDS_FIX の場合 → 試験書修正→再レビューへループ（プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程③が APPROVED かつ動作確認結果「OK」かつユーザー承認「承認」→ Step10 へ遷移する
- 動作確認結果(Step9-④)が「NG」の場合 → 問題の内容を分析し差し戻しフローに従う（既存と同一）
- ユーザー承認結果(Step9)が「追加確認要求」/「NG」の場合 → 既存と同一のフロー

## Step 10: 設計書反映

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `bugfix-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計書反映エージェントの出力(Step10):"として記載する。fix-design.md の内容を既存設計書にマージし、バグ修正履歴（{bugfix_dir}/history.md）を初期作成する
　更新された設計書一覧(Step10):

### 完了条件
fs-bugfix-phase2-report.txtの設計書反映エージェントの出力(Step10)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/history.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-bugfix-phase2-report.txtの設計書反映エージェントの出力(Step10)のステータスで遷移先を決める
- DONE の場合 → Step11 へ遷移する
- DONE_WITH_CONCERNS の場合 → Step11 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 追加情報を補い `bugfix-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 11: バグ修正完了の案内

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・バグ修正内容サマリーを作成・提示した結果を記載する（バグ報告＝bug-report.md の概要／原因分析＝bug-analysis.md の概要／修正方針＝fix-plan.md の概要: 対策種別含む／修正内容＝fix-design.md の概要／実装タスク＝delta-task-list.md のタスク一覧）
　バグ修正内容サマリー(Step11):
・更新設計書一覧を提示する
　バグ修正完了案内の更新設計書一覧(Step11):
・テスト実行結果を提示する（ユニットテスト・リグレッションテスト）
　テスト実行結果(Step11):
・bugfix/ 配下のバグ修正履歴を提示する（bugfix_dir パス + 格納ドキュメント一覧）
　バグ修正履歴提示結果(Step11):（提示した bugfix_dir パスと格納ドキュメント一覧）

### 完了条件
fs-bugfix-phase2-report.txtに、バグ修正内容サマリー(Step11)・バグ修正完了案内の更新設計書一覧(Step11)・テスト実行結果(Step11)・バグ修正履歴提示結果(Step11)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{bugfix_dir}/bugfix-progress.md`（phase1 Step 7 で確定した bugfix_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-bugfix-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) の結果で遷移先を決める
- FAIL の場合（記載項目漏れ検出）→ ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する。最終的な実行内容はユーザー指示に従う
- PASS の場合 → fs-bugfix-phase2-report.txtの"完了ステータス(後処理):"を確認し、`fs-bugfix-phase3-final-check (aide-powers skill)` を activate して実行する

注: バグ修正ワークフローでは最終フェーズ（Phase 3 final-check）の進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 8（タスク実装ループ。内部で実装→テスト→レビューを完結）
- `impl-task-planning (aide-powers skill)` — Step 6 のタスク分解ルールの参照元

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-bugfix-phase3-final-check (aide-powers skill)`

**Called by:**
- `fs-bugfix-phase1-analysis (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-bugfix-phase2-impl`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-qa-dispatch (aide-powers skill)` — Step 4（QAレビュー）
- `user-requirements-definition (aide-powers skill)`（差分モード）— Step 1（ユーザー要件に影響時）
- `system-requirements-definition (aide-powers skill)`（差分モード）— Step 1（システム要件に影響時）
- `gui-design (aide-powers skill)`（差分モード）— Step 1（GUI設計に影響時）
- `object-design (aide-powers skill)`（差分モード）— Step 1（オブジェクト設計に影響時）
- `ddd-modeling (aide-powers skill)`（差分モード）— Step 1（ユビキタス言語に影響時）
- `infra-interface-design (aide-powers skill)`（差分モード）— Step 1（インフラIF設計に影響時）
- `program-structure-design (aide-powers skill)`（差分モード）— Step 1（プログラム構成に影響時）
- `coding-test-2review (aide-powers skill)` — Step 8（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
- `doc-sync (aide-powers skill)` — Step 10（設計書反映）
- `doc-index-maintenance (aide-powers skill)` — 後処理

**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `delta-design-qa-agent (aide-powers agent)` — 常に呼び出し
- `requirements-qa-agent (aide-powers agent)` — 要件に影響時
- `architecture-qa-agent (aide-powers agent)` — アーキテクチャに影響時
- `object-design-qa-agent (aide-powers agent)` — オブジェクト設計に影響時
- `final-design-qa-agent (aide-powers agent)` — プログラム構成に影響時

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 8）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。phase2 から直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `bugfix-designer-prompt.md` — Step 2（mode: design / fix）、Step 5（fix）
- `bugfix-task-planner-prompt.md` — Step 6
- `regression-test-prompt.md` — Step 9（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
- `bugfix-verification-prompt.md` — Step 9（工程②: 試験書作成モード / 工程④: 試験実行モード）
- `bugfix-doc-syncer-prompt.md` — Step 10

**呼び出すサブエージェント（Step 9 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 9 工程①: リグレッションテスト実行。工程②〜④より先行）

**呼び出す名前付きエージェント（Step 9 工程③）:**
- `manual-test-review-agent (aide-powers agent)` — Step 9 工程③（試験書品質レビュー。wf_type=bugfix）

**Input from caller:**
- `feature_name`: プロジェクト名
- `bugfix_dir`: 確定済みの bugfix_dir（Phase 1 で確定）
- `doc_index_path`: doc-index.md のパス

**Output to next phase:**
- `bugfix_dir`: 確定済みの bugfix_dir

**Global rules:** `.aide/references/global-rules.md` を厳守
