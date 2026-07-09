---
name: fs-impl-phase2-preparation
description: "Use when starting the implementation workflow after the design gate has passed, before writing any implementation code."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| impl-task-list.md | {specs_dir}/impl-task-list.md | 依存関係解析に基づく実装タスクリスト |
| impl-process-checklist.md | {specs_dir}/impl-process-checklist.md | 各タスクの工程漏れを防ぐ工程チェック表 |
| manual-test-plan.md | {specs_dir}/testing/manual-test-plan.md | 動作確認試験書の空テンプレート |
| fs-impl-phase2-report.txt | .aide/tmp/fs-impl-phase2-report.txt | fs-impl-phase2-preparationの実行レポート |

> `{specs_dir}` は `.aide/specs/{feature_name}` を指す。

# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase2-report.txt以外のファイルの書き出しは禁止。

加えて、本フェーズ固有のガードを守る:
- **NO IMPLEMENTATION BEFORE PREPARATION**: 環境構築・タスクリスト生成・ユーザー確認・試験書テンプレート作成が完了するまで、コードの実装に着手してはならない。
- **タスクリストはサブエージェントが生成する**: オーケストレータが直接タスクリストを作成してはならない。impl-planner サブエージェントに委譲する。

# レポート運用ルール

fs-impl-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `コミット結果(後処理): コミット対象の変更なし`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase2-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase2-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
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
fs-impl-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号=2）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>本フェーズ番号=2）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号=2）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（設計書ゲートが未完了）。ユーザーに報告し、前フェーズスキル `fs-impl-phase1-gate (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 開発環境の確認

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index.md を読み取り、dev-environment.md のパスを取得した結果を記載する
　dev-environmentパス(Step1):
・dev-environment.md を読み取り、記載された環境要件を把握した結果を、次の項目で記載する
　対象OS(Step1):
　Pythonバージョン(Step1):
　仮想環境設定(Step1):
　依存管理方針(Step1):
　テストフレームワーク(Step1):
　テスト実行コマンド(Step1):
　コミットメッセージ言語(Step1):
　その他の環境固有設定(Step1):

### 完了条件
fs-impl-phase2-report.txtに、dev-environment.md から把握した上記の環境要件項目が記載されている

### 状態判定
- 完了条件を満たしていれば → Step2へ遷移する
- dev-environment.md が存在しない場合 → ユーザーに即通知し対応方針を確認する（fs-impl-phase1-gate の設計書ゲートで本来 FAIL になるべきため）

## Step 2: 開発環境の構築

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `env-builder-prompt.md` のプレースホルダー（{feature_name} / {specs_dir} / {dev_environment_path}）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し（dev-environment.md の環境要件＝Step1で把握＝に従い、venv の作成・有効化・依存パッケージのインストール・インストール結果確認を実行する）、サブエージェントの出力を"環境構築エージェントの出力(Step2):"として記載する。その記載内容から、次の項目を判断して記載する
　venv構築結果(Step2):
　依存パッケージインストール結果(Step2):
　環境構築で発生した問題(Step2):

### 完了条件
fs-impl-phase2-report.txtの"環境構築エージェントの出力(Step2):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、venv が作成され依存パッケージがインストールされている

### 状態判定
- 完了条件を満たしていれば → Step3へ遷移する
- ステータスが DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- 環境構築で問題が発生（NEEDS_CONTEXT / BLOCKED、またはインストール失敗）の場合 → ユーザーに問題を報告し対応方針を確認し、解決するまでStep3へ進まない

## Step 3: タスクリスト生成

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・impl-task-planning (aide-powers skill)を activate して実行し、出力を"impl-task-planningの出力(Step3):"として記載する（タスク分解のルール・手順を適用する）
・サブエージェント実行前に、出力ファイルパスを記載する
　タスクリスト出力ファイルパス(Step3):（例: {specs_dir}/impl-task-list.md）
　工程チェック表出力ファイルパス(Step3):（例: {specs_dir}/impl-process-checklist.md）
・`skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"タスクリスト生成エージェントの出力(Step3):"として記載する。その記載内容から、次の項目を判断して記載する
　網羅性チェック結果(Step3):
　工程チェック表生成結果(Step3):

### 完了条件
fs-impl-phase2-report.txtの"タスクリスト生成エージェントの出力(Step3):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{specs_dir}/impl-task-list.md と {specs_dir}/impl-process-checklist.md がそれぞれファイルサイズ1byte以上で存在し、網羅性チェックが漏れゼロである

### 状態判定
- 完了条件を満たしていれば → Step4へ遷移する
- ステータスが DONE_WITH_CONCERNS の場合 → Step4 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- 網羅性チェックに漏れがある場合 → 漏れゼロになるまでサブエージェントを再実行する
- BLOCKED（循環依存検出等）の場合 → ユーザーに報告し対応方針を確認する

## Step 4: タスクリストのユーザー確認

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{specs_dir}/impl-task-list.md の内容をユーザーに提示し、「この実装順序で進めてよいか」の承認を得た結果を、次の項目で記載する
　タスクリスト承認のユーザー判断(Step4):
　タスクリスト修正回数(Step4):
　タスクリスト修正内容要約(Step4):

### 完了条件
fs-impl-phase2-report.txtの"タスクリスト承認のユーザー判断(Step4):"が承認である

### 状態判定
- 完了条件を満たしていれば → Step5へ遷移する
- "タスクリスト承認のユーザー判断(Step4):"が修正要求の場合 → フィードバック内容を補い `skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行してタスクリストを修正し、修正後 Step4 を再実行する
- 修正ループは最大3回まで。3回を超える場合 → 打ち切らず、ユーザーに「タスクリストの修正が3回を超えました。方針を相談させてください」と伝え、方針（部分承認・方針変更等）を確認する

## Step 5: 動作確認試験書の空テンプレート作成

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　動作確認試験書出力ファイルパス(Step5):（例: {specs_dir}/testing/manual-test-plan.md）
・動作確認試験書の空テンプレート（試験概要・試験項目テーブル・試験結果サマリの枠組み）を作成するため、本スキルディレクトリの `test-doc-initializer-prompt.md` のプレースホルダー（{feature_name} / {specs_dir}）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し（{specs_dir}/testing/manual-test-plan.md に作成）、サブエージェントの出力を"試験書テンプレート作成エージェントの出力(Step5):"として記載する

### 完了条件
fs-impl-phase2-report.txtの"試験書テンプレート作成エージェントの出力(Step5):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{specs_dir}/testing/manual-test-plan.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていれば → 後処理へ遷移する
- ステータスが DONE_WITH_CONCERNS の場合 → 後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 不足情報を補いサブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-impl-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（全更新の完了後に最後にコミットする。コミット対象: 本フェーズ生成物 impl-task-list.md / impl-process-checklist.md / manual-test-plan.md + doc-index.md + impl-progress.md。加えて環境構築で requirements.txt 等が変更された場合はそれも含める。推奨プレフィックス: chore:）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たしたら `fs-impl-phase3-gui-mockup (aide-powers skill)` を activate して実行する

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase3-gui-mockup (aide-powers skill)`

**Called by:** 実装ワークフロー（fs-impl-phase1-gate (aide-powers skill) PASS 後に遷移）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `impl-task-planning (aide-powers skill)` — Step 3（タスク分解のルール・手順を提供）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（環境構築でファイル変更があった場合）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `env-builder-prompt.md` — Step 2（開発環境の構築）
- `test-doc-initializer-prompt.md` — Step 5（動作確認試験書の空テンプレート作成）

**プロンプトテンプレート（共通スキル参照）:**
- `skills/impl-task-planning/impl-planner-prompt.md` — Step 3（タスクリスト生成・工程チェック表生成）

**Input from caller:**
- `feature_name`: プロジェクト名
- `specs_dir`: `.aide/specs/{feature_name}`

**Output to next phase:**
- `{specs_dir}/impl-task-list.md`（タスクリスト）
- `{specs_dir}/impl-process-checklist.md`（工程チェック表）
- `{specs_dir}/testing/manual-test-plan.md`（試験書の空テンプレート）
- 構築済みの開発環境（venv、パッケージインストール済み）

**ワークフロー共通ルールの参照:** `fs-impl-phase1-gate (aide-powers skill)`（ワークフロー共通 Iron Law の定義元）

**Global rules:** `.aide/references/global-rules.md` を厳守
