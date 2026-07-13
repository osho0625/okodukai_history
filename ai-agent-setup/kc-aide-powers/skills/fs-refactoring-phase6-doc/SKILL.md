---
name: fs-refactoring-phase6-doc
description: "Use when refactoring implementation (phase 5) is complete and design documents need to be synchronized with the refactored code."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 既存設計書（更新） | doc-index.md から特定した既存設計書 | refactoring-design.md / refactoring-plan.md の内容を反映した既存設計書 |
| fs-refactoring-phase6-report.txt | .aide/tmp/fs-refactoring-phase6-report.txt | fs-refactoring-phase6-docの実行レポート |

注: 本フェーズでは新規成果物ファイルは作成しない。doc-sync による既存設計書の更新を行う（git コミットは本フェーズでは行わず、phase7 の後処理でまとめて1回実行する）。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase6-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-refactoring-phase6-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase6-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `書き込み漏れの有無と対応: 漏れなし`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase6-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase6-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
　再開Step(前処理):（中断 Step から再開（Step番号と根拠を併記） / Step1 から（新規））
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-refactoring-phase6-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（リファクタリング実装・テストが未完了）。ユーザーに報告し、前フェーズスキル `fs-refactoring-phase5-impl (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 設計書反映（doc-sync）

### 成果物
fs-refactoring-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-sync (aide-powers skill)を activate して実行し、出力を"doc-syncの出力(Step1):"として記載する
・本スキルディレクトリの `doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計書反映エージェントの出力(Step1):"として記載する
　- {refactoring_dir}/refactoring-design.md および {refactoring_dir}/refactoring-plan.md の内容を doc-index.md から特定した既存設計書にマージする
　- リファクタリングWFでは history.md の作成・更新は不要
　更新された設計書一覧(Step1):

### 完了条件
fs-refactoring-phase6-report.txtの"設計書反映エージェントの出力(Step1):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、"更新された設計書一覧(Step1):"に1件以上の既存設計書が記載されている

### 状態判定
- 完了条件を満たしていればStep2へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-refactoring-phase6-report.txtの"設計書反映エージェントの出力(Step1):"のステータスがNEEDS_CONTEXT の場合、不足情報を補い `doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 2: リファクタリング完了案内

### 成果物
fs-refactoring-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・リファクタリング完了案内を作成・提示した結果を記載する。伝える内容:
  - リファクタリング内容のサマリー
    - 対象: 通常起動経路では {refactoring_dir}/refactoring-candidates.md で選択された候補／変更WFからの引き継ぎ経路（candidates.md が存在しない）では {refactoring_dir}/refactoring-plan.md および引き継ぎ元の {changes_dir}/refactoring-request.md に記載された対象を参照する
    - 方針: {refactoring_dir}/refactoring-plan.md の before → after の要約
    - 変更概要: {refactoring_dir}/refactoring-design.md の変更一覧の要約
  - 更新された設計書一覧（Step 1 で更新した設計書のファイル名と主な変更点）
  - テスト実行結果
    - `.aide/tmp/fs-refactoring-phase5-report.txt` の「リグレッション結果」から最終テスト結果を読み取り、全既存テストがパスしていることを確認・報告
    - phase5 レポートが参照できない場合は {refactoring_dir}/impl-process-checklist.md の **`run_test`（テスト実行）工程行（行キー `{task_id}::run_test`）の状態（`✅ done`）と output（結果サマリ）** で代替する（1工程1行構造。共通仕様 CF-2）
    - ※レポート方式では最終テスト結果は phase5 のレポートに記録される。refactoring-progress.md にはフェーズ1で記録したセーフティネット基準が入っている
  - refactoring/ 配下の履歴
    - refactoring-plan.md / refactoring-design.md / refactoring-progress.md、および通常起動経路では refactoring-candidates.md が履歴として残る旨を案内
    - 引き継ぎ経路では candidates.md は存在しない
  - 変更ワークフローからの引き継ぎの場合は「変更ワークフローを再起動してください」と案内
　リファクタリング完了案内(Step2):

### 完了条件
fs-refactoring-phase6-report.txtに、リファクタリング完了案内(Step2)が記載されている

### 状態判定
完了条件を満たしていればStep3へ遷移する

## Step 3: 完了案内のユーザー承認

### 成果物
fs-refactoring-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step 2 の完了案内をユーザーに提示し、合意を得た結果を、次の項目で記載する
　完了案内のユーザー判断(Step3):
　完了案内の修正回数(Step3):
　完了案内の修正内容要約(Step3):

### 完了条件
fs-refactoring-phase6-report.txtの"完了案内のユーザー判断(Step3):"が承認である

### 状態判定
- 完了条件を満たしていれば後処理へ遷移する
- fs-refactoring-phase6-report.txtの"完了案内のユーザー判断(Step3):"が修正要求の場合、完了案内を修正して再提示し、Step3 を再実行する

## 後処理

### 成果物
fs-refactoring-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・リファクタリングワークフロー完了をユーザーに報告した結果を記載する
　ワークフロー完了報告(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase6-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-refactoring-phase6-report.txtの"完了ステータス(後処理):"を確認したら `fs-refactoring-phase7-final-check (aide-powers skill)` を activate して実行する

注: git コミットは本フェーズでは行わない。リファクタリングワークフロー全体のコミットは、進捗表の最終更新（progress-final-checker による最終フェーズ ✅完了 更新）の後に行う必要があるため、最終チェックフェーズ `fs-refactoring-phase7-final-check` の後処理で1回のみ実行する（まとめコミット型）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `doc-sync (aide-powers skill)` — Step 1（リファクタリング設計書の内容を既存設計書にマージ）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase7-final-check (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase5-impl (aide-powers skill)` → リファクタリング実装完了後に本スキルに遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-sync (aide-powers skill)` — Step 1（ドキュメント反映）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `doc-syncer-prompt.md` — Step 1

**Input from caller:**
- `feature_name`: プロジェクト名
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ（phase1 Step2 で確定。phase2 のフォルダ統合で移設される場合あり）
- `doc_index_path`: doc-index.md のパス

**Output to next phase:**
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ

**Global rules:** `.aide/references/global-rules.md` を厳守
