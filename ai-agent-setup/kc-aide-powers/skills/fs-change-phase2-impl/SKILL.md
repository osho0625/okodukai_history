---
name: fs-change-phase2-impl
description: "Use when fs-change-phase1-analysis completes and design/implementation/completion processing is needed."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| delta-design.md | {changes_dir}/delta-design.md | before→after形式の差分設計書（規模が大きい場合は索引+分割ファイル構成） |
| delta-design-{name}.md | {changes_dir}/delta-design-{name}.md | 大規模時のみ。delta-design.md から参照される分割ファイル（クラス名/テーマ名でファイル分割。ユーザー提示・承認の対象） |
| impact-analysis.md | {changes_dir}/impact-analysis.md | 設計内容ベースの精密な影響範囲分析（更新版） |
| delta-task-list.md | {changes_dir}/delta-task-list.md | 差分タスクリスト |
| impl-process-checklist.md | {changes_dir}/impl-process-checklist.md | 工程チェック表 |
| 実装コード | src/ 配下 | delta-task-list.md に基づく変更実装 |
| テストコード | tests/ 配下 | 各タスクに対応するテスト |
| test-function-list.md | {changes_dir}/testing/test-function-list.md | 動作確認対象機能リスト（サブエージェントが出力） |
| test-{機能名}-test-plan.md | {changes_dir}/testing/test-{機能名}-test-plan.md | 機能別動作確認試験書（動作確認試験サブエージェントが出力）＋リグレッションテスト結果（リグレッションテスト実行サブエージェントが出力） |
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |
| fs-change-phase2-report.txt | .aide/tmp/fs-change-phase2-report.txt | fs-change-phase2-implの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-change-phase2-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-change-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-change-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `差分設計修正エージェントの出力(Step5): N/A（QA APPROVEDのため修正ループ未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-change-phase2-report.txt

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
・上記の判定で本フェーズを実行すると確定した場合、フェーズ内のどの Step から再開するかを判定する。progress-resume-check はフェーズ単位の再開ポイントしか返さないため、`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（`.aide/tmp/fs-change-phase2-report.txt`）の "現在のStep:" を読み、中断された Step が判明すればその Step から、判明しなければ Step1 から再開する。判定結果を次の項目で記載する
　再開Step(前処理):（Step1から / StepN から再開＋根拠）
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-change-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号であり、Step 番号ではない。本フェーズ番号は 2）
　・`RESUME_FROM N`（N == 2 = 本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から始めるかは前処理の "再開Step(前処理):" 判定に従う）
　・`RESUME_FROM N`（N > 2 = 後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N < 2 = 前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-change-phase1-analysis (aide-powers skill)` に差し戻す
　・`START_FRESH`（新規開始）→ 中間フェーズのため異常（要件定義・影響分析・対応方針が未完了）。ユーザーに報告し、前フェーズスキル `fs-change-phase1-analysis (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 設計系共通スキル呼び出し判定

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/impact-analysis.md と {changes_dir}/approach.md を読み込み、影響を受ける設計領域を特定した結果を、次の項目で記載する
　影響を受ける設計領域(Step1):（ユーザー要件 / システム要件 / GUI設計 / オブジェクト設計 / ユビキタス言語 / インフラIF設計 / プログラム構成 から該当するもの）
　変更規模判定(Step1):（局所的変更（1〜2ファイル） / 広範囲変更（複数領域））
・広範囲変更の場合、影響を受ける各設計系共通スキルを **mode: delta** で activate して実行し、出力を"設計系共通スキル(mode:delta)の出力(Step1):"として記載する。各スキルが `{changes_dir}/delta-{領域名}.md` に差分を出力する。実行したスキルと出力ファイルを次の項目で記載する
　呼び出した設計系共通スキルと出力ファイル(Step1):
・局所的変更の場合は設計系共通スキルを呼び出さず、change-delta-designer のみで作成する旨を「呼び出した設計系共通スキルと出力ファイル(Step1):」に理由として記載する

設計系共通スキル対応表（広範囲変更時に mode: delta で呼び出す）:

| 影響を受ける設計領域 | 呼び出す共通スキル（mode: delta） | 出力ファイル |
|---|---|---|
| ユーザー要件 | `user-requirements-definition (aide-powers skill)` | `{changes_dir}/delta-user-requirements.md` |
| システム要件 | `system-requirements-definition (aide-powers skill)` | `{changes_dir}/delta-system-requirements.md` |
| GUI設計 | `gui-design (aide-powers skill)` | `{changes_dir}/delta-gui-design.md` |
| オブジェクト設計 | `object-design (aide-powers skill)` | `{changes_dir}/delta-object-design.md` |
| ユビキタス言語 | `ddd-modeling (aide-powers skill)` | `{changes_dir}/delta-ddd-modeling.md` |
| インフラIF設計 | `infra-interface-design (aide-powers skill)` | `{changes_dir}/delta-infra-interface.md` |
| プログラム構成 | `program-structure-design (aide-powers skill)` | `{changes_dir}/delta-program-structure.md` |

### 完了条件
fs-change-phase2-report.txtに、影響を受ける設計領域(Step1)・変更規模判定(Step1)が記載され、広範囲変更時は呼び出した設計系共通スキルと出力ファイル(Step1)が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: 差分設計の作成

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの changes_dir から出力ファイルパスを組み立てて記載する
　差分設計の出力ファイルパス(Step2):（例: {changes_dir}/delta-design.md）
・本スキルディレクトリの `change-delta-designer-prompt.md`（mode: phase4。Step 1 が広範囲変更の場合は設計系共通スキルの差分設計結果も渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分設計作成エージェントの出力(Step2):"として記載する

### 完了条件
fs-change-phase2-report.txtの差分設計作成エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/delta-design.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep3へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの差分設計作成エージェントの出力(Step2)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `change-delta-designer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 3: 差分設計のユーザー承認

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/delta-design.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する。delta-design.md が分割構成（メイン＝索引 + 分割ファイル群）の場合は、メインの索引から分割ファイル {changes_dir}/delta-design-{name}.md を全て特定し、メイン＋全分割ファイルをセットで提示する
　差分設計の提示形態(Step3):（単一ファイル / 分割構成（メイン＋分割ファイルN件））
　差分設計のユーザー判断(Step3):
　差分設計の修正回数(Step3):
　差分設計の修正内容要約(Step3):

> **分割本文の提示必須。** delta-design.md が分割構成の場合、索引（メイン）だけを提示して承認を取ってはならない。索引から全分割ファイルを特定し、メイン＋全分割本文をセットで提示してから承認を得る。

### 完了条件
fs-change-phase2-report.txtの"差分設計のユーザー判断(Step3)"が承認である

### 状態判定
- 完了条件を満たしていればStep4へ遷移する
- fs-change-phase2-report.txtの"差分設計のユーザー判断(Step3)"が修正要求の場合、`change-delta-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step3 を再実行する

## Step 4: 差分設計のQAレビュー

### 成果物
fs-change-phase2-report.txt

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
fs-change-phase2-report.txtに、design-qa-dispatch を実行して得たQAレビュー結果(Step4)（APPROVED / REJECTED）が記載されている

### 状態判定
完了条件を満たし、fs-change-phase2-report.txtの"QAレビュー結果(Step4)"を確認する
- APPROVED の場合 → Step6 へ遷移する
- REJECTED の場合 → Step5 へ遷移する

## Step 5: QA REJECTED 修正ループ

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `change-delta-designer-prompt.md`（fixモード。QA指摘内容と delta_design_path を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分設計修正エージェントの出力(Step5):"として記載する
　差分設計修正の修正回数(Step5):

> **修正後の再QAレビュー省略禁止。** 「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」「前回のQAで指摘された箇所だけ修正したので部分レビューで十分」等は全て省略の根拠にならない。

### 完了条件
fs-change-phase2-report.txtの差分設計修正エージェントの出力(Step5)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、修正後の delta-design.md が存在する

### 状態判定
- 完了条件を満たしていれば修正内容をユーザーに報告し、Step4 へ戻り再QAレビューする（APPROVED になるまで繰り返す）
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step4 へ戻る前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの差分設計修正エージェントの出力(Step5)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `change-delta-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 6: 影響範囲再精査

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの changes_dir から出力ファイルパスを組み立てて記載する
　影響範囲再精査の出力ファイルパス(Step6):（例: {changes_dir}/impact-analysis.md（更新版））
・本スキルディレクトリの `change-impact-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"影響範囲再精査エージェントの出力(Step6):"として記載する
　シグネチャ変更追跡結果(Step6):

> **シグネチャ変更全件追跡必須。** delta-design.md の before→after で変更されたシグネチャは、変更要件のスコープ内外を問わず全呼び出し元を検索して依存関係テーブルに記載する。「スコープ外だから追跡不要」は禁止。

### 完了条件
fs-change-phase2-report.txtの影響範囲再精査エージェントの出力(Step6)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/impact-analysis.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep7へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step7 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの影響範囲再精査エージェントの出力(Step6)のステータスがNEEDS_CONTEXT の場合、追加情報を補い `change-impact-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 7: 影響範囲再検討のユーザー承認

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/delta-design.md と {changes_dir}/impact-analysis.md（更新版）を**セットで**ユーザーに提示し、承認を得た結果を、次の項目で記載する。delta-design.md が分割構成（メイン＝索引 + 分割ファイル群）の場合は、メインの索引から分割ファイル {changes_dir}/delta-design-{name}.md を全て特定し、メイン＋全分割ファイルを含めて提示する。提示時に特に以下を強調する: テスト対象機能の一覧（新規テスト対象とリグレッションテスト対象を区別）／既存要件との矛盾の有無／シグネチャ変更追跡結果（Phase 1 で未検出だった呼び出し元がある場合は特に強調）／Phase 1 からの変更点
　影響分析の提示形態(Step7):（単一ファイル / 分割構成（メイン＋分割ファイルN件））
　影響分析のユーザー判断(Step7):
　影響分析の修正回数(Step7):
　影響分析の修正内容要約(Step7):

> **セット提示必須。** 差分設計と影響分析を個別にユーザーに提示してはならない。必ずセットで提示し合意を得る。差分設計が分割構成の場合は索引（メイン）だけでなく全分割本文も併せて提示する。

### 完了条件
fs-change-phase2-report.txtの"影響分析のユーザー判断(Step7)"が承認である

### 状態判定
完了条件を満たしていればStep8へ遷移する。fs-change-phase2-report.txtの"影響分析のユーザー判断(Step7)"が以下の場合に分岐する
- 影響分析に修正要求 → `change-impact-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step7 を再実行する
- 差分設計に修正要求 → Step2 に差し戻す

## Step 8: 差分タスクリストの作成

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの changes_dir から出力ファイルパスを組み立てて記載する
　差分タスクリストの出力ファイルパス(Step8):（例: {changes_dir}/delta-task-list.md, {changes_dir}/impl-process-checklist.md）
・本スキルディレクトリの `change-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分タスクリスト作成エージェントの出力(Step8):"として記載する

> **リグレッションテスト必須。** impact-analysis.md の「テスト対象機能」が空でない限り、リグレッションテストタスクは必ず存在する。

### 完了条件
fs-change-phase2-report.txtの差分タスクリスト作成エージェントの出力(Step8)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/delta-task-list.md と {changes_dir}/impl-process-checklist.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep9へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step9 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの差分タスクリスト作成エージェントの出力(Step8)のステータスがNEEDS_CONTEXT の場合、追加情報を補い `change-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 9: タスクリストのユーザー承認

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/delta-task-list.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　タスクリストのユーザー判断(Step9):
　タスクリストの修正回数(Step9):
　タスクリストの修正内容要約(Step9):

### 完了条件
fs-change-phase2-report.txtの"タスクリストのユーザー判断(Step9)"が承認である

### 状態判定
- 完了条件を満たしていればStep10へ遷移する
- fs-change-phase2-report.txtの"タスクリストのユーザー判断(Step9)"が修正要求の場合、`change-task-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step9 を再実行する

## Step 10: タスク実装ループ（coding-test-2review経由）

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・**事前ガード**: `{changes_dir}/impl-process-checklist.md` と `{changes_dir}/delta-task-list.md` がファイルサイズ1byte以上で存在するか確認した結果を記載する。存在しない場合は実装ループに入らず Step8（差分タスクリストの作成）へ差し戻す
　事前ガード確認結果(Step10):（OK（両ファイル存在） / NG（不在ファイル名）→ Step8 へ差し戻し）
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step10):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{changes_dir}/delta-task-list.md`
　　- process_checklist_path=`{changes_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{changes_dir}/delta-design.md`（実装の根拠となる差分設計書。分割構成の場合はメイン+全分割ファイル）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`change`
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step10):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。成果物種別（プログラム / 非プログラム）の判定も内部で行う。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。リグレッションテスト（既存テスト全実行）は本Step内では実施せず、後続の動作確認Step（Step11）で1回実施する設計に統一されている。

### 完了条件
fs-change-phase2-report.txtに coding-test-2reviewの出力(Step10)が記載され、status: DONE であり、{changes_dir}/delta-task-list.md の全タスクが完了状態に更新され、{changes_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）

### 状態判定
まず "事前ガード確認結果(Step10):" を確認する。NG（impl-process-checklist.md または delta-task-list.md が不在）の場合、実装ループに入らず Step8（差分タスクリストの作成）へ差し戻す。OK の場合のみ以下を実行する。
- 完了条件を満たし、coding-test-2review が status: DONE を返したら Step11 へ遷移する
- status: BLOCKED を返した場合、ユーザーに報告し対応方針を確認する

## Step 11: 動作確認Step（動作確認試験＋リグレッションテスト）

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: リグレッションテスト実行（先行・ブロッキング）】本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を行う。**本工程は工程②〜④（動作確認試験）より先に実行し、全パスを確認できるまで工程②〜④に進まない**。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step11-①):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step11-①):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧）

・【工程②: 試験書作成】工程①で全パスを確認した後、本スキルディレクトリの `change-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step11-②):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step11-②):
　作成された試験書パス(Step11-②):

・【工程③: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `change`
　- 試験書パス: 工程②で受領したパス
　- WF固有入力: change-requirements.md（受入基準）
　レビュー結果を"試験書レビュー結果(Step11-③):"として即時記載する
　- **APPROVED の場合** → 工程④へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `change-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step11-③):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step11-③):

・【工程④: 試験実行】工程③で APPROVED となった試験書に基づき、`change-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、実際の動作確認（試験実行）を行う。試験結果を"試験実行サブエージェントの出力(Step11-④):"として記載する
　試験実行サブエージェントの出力(Step11-④):

・動作確認結果（工程④）が全てOK の場合（リグレッションテスト結果〔工程①〕は既に全パス確認済み）、ユーザーに変更内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）と、リグレッションテスト結果（全パス/失敗件数）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step11):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step11):

### 完了条件
fs-change-phase2-report.txtに以下が全て満たされていること:
- リグレッションテスト実行サブエージェントの出力(Step11-①)が全パスである
- 試験書レビュー結果(Step11-③)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step11-④)が「OK」である
- ユーザー承認結果(Step11)が「承認」である（エビデンス付き報告済み）
- {changes_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- リグレッションテスト結果(Step11-①)に失敗がある場合 → 工程②〜④に進まず、Step10（タスク実装ループ）へ差し戻し、失敗テストの原因を修正するタスクを delta-task-list.md に追記してから再実装し、再度Step11（工程①から）を実行する
- 工程③で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程④に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程③が APPROVED かつ動作確認結果(Step11-④)が「OK」かつユーザー承認結果(Step11)が「承認」の場合 → Step12 へ遷移する
- 動作確認結果(Step11-④)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step10（タスク実装ループ）へ差し戻し、追加修正タスクを delta-task-list.md に追記してから再実装する
　- 設計の問題（差分設計自体に問題）→ Step2（差分設計の作成）へ差し戻す
- ユーザー承認結果(Step11)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step11)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う

## Step 12: 設計書反映

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計書反映エージェントの出力(Step12):"として記載する。delta-design.md の内容を既存設計書にマージし、変更履歴（{changes_dir}/history.md）を初期作成する
　更新された設計書一覧(Step12):

### 完了条件
fs-change-phase2-report.txtの設計書反映エージェントの出力(Step12)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/history.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep13へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step13 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの設計書反映エージェントの出力(Step12)のステータスがNEEDS_CONTEXT の場合、追加情報を補い `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 13: 変更完了の案内

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・変更内容サマリーを作成・提示した結果を記載する（変更要求＝change-requirements.md の概要／変更内容＝delta-design.md の概要／実装タスク＝delta-task-list.md のタスク一覧）
　変更内容サマリー(Step13):
・更新設計書一覧を提示する
　変更完了案内の更新設計書一覧(Step13):
・テスト実行結果を提示する（ユニットテスト・リグレッションテスト）
　テスト実行結果(Step13):
・changes/ 配下の変更履歴を提示する（changes_dir パス + 格納ドキュメント一覧）
　変更履歴提示結果(Step13):（提示した changes_dir パスと格納ドキュメント一覧）

### 完了条件
fs-change-phase2-report.txtに、変更内容サマリー(Step13)・変更完了案内の更新設計書一覧(Step13)・テスト実行結果(Step13)・変更履歴提示結果(Step13)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{changes_dir}/change-progress.md`（phase1 Step 6 で確定した changes_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-change-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-change-phase2-report.txtの"完了ステータス(後処理):"を確認したら `fs-change-phase3-final-check (aide-powers skill)` を activate して実行する

注: 変更ワークフローでは最終フェーズ（Phase 3 final-check）の進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

# 完了条件

以下の全てを満たした状態:

1. delta-design.md が作成され、ユーザー承認 + QA APPROVED 済み（規模により分割構成の場合はメイン+全分割ファイルを含む）
2. impact-analysis.md が更新版として作成され、ユーザー承認済み（差分設計とセット提示）
3. delta-task-list.md が作成され、ユーザー承認済み
4. impl-process-checklist.md が作成され、全タスク・全ステップが完了済み
5. delta-task-list.md の全タスクが実装完了し、レビュー全PASS、ユニットテスト全PASS
6. 動作確認Stepでリグレッションテスト（既存テスト全実行）が1回実施され、全パスであること
7. ユーザーに動作検証を依頼済み
8. delta-design.md の内容が既存設計書にマージされ、history.md が初期作成されている
9. 変更完了の案内がユーザーに提示されている
10. 進捗ファイル（change-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
11. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
12. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
13. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 10（タスク実装ループ。内部で実装→テスト→レビューを完結）
- `impl-task-planning (aide-powers skill)` — Step 8 のタスク分解ルールの参照元

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-change-phase3-final-check (aide-powers skill)`

**Called by:**
- `fs-change-phase1-analysis (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-change-phase2-impl`

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
- `coding-test-2review (aide-powers skill)` — Step 10（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
- `doc-sync (aide-powers skill)` — Step 12（設計書反映）
- `doc-index-maintenance (aide-powers skill)` — 後処理

**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `delta-design-qa-agent (aide-powers agent)` — 常に呼び出し
- `requirements-qa-agent (aide-powers agent)` — 要件に影響時
- `architecture-qa-agent (aide-powers agent)` — アーキテクチャに影響時
- `object-design-qa-agent (aide-powers agent)` — オブジェクト設計に影響時
- `final-design-qa-agent (aide-powers agent)` — プログラム構成に影響時

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 10）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。phase2 から直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `regression-test-prompt.md` — Step 11（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
- `change-verification-prompt.md` — Step 11（工程②: 試験書作成モード / 工程④: 試験実行モード）
- `change-doc-syncer-prompt.md` — Step 12

**呼び出すサブエージェント（Step 11 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 11 工程①: リグレッションテスト実行。工程②〜④より先行）

**呼び出す名前付きエージェント（Step 11 工程③）:**
- `manual-test-review-agent (aide-powers agent)` — Step 11 工程③（試験書品質レビュー。wf_type=change）

**Input from caller:**
- `feature_name`: プロジェクト名
- `changes_dir`: 確定済みの changes_dir（Phase 1 で確定）
- `doc_index_path`: doc-index.md のパス

**Output to next phase:**
- `changes_dir`: 確定済みの changes_dir

**Global rules:** `.aide/references/global-rules.md` を厳守
