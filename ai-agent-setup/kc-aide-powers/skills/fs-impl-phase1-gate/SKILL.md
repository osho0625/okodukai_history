---
name: fs-impl-phase1-gate
description: "Use when starting the implementation workflow. Ensures design documents are complete before any implementation begins."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fs-impl-phase1-report.txt | .aide/tmp/fs-impl-phase1-report.txt | fs-impl-phase1-gate の実行レポート |

> このフェーズは設計成果物（design ドキュメント）・コードを新規作成しない。実装ワークフローの入口に位置する HARD-GATE であり、設計書の完了状態を design-gate で機械的に確認することが責務である。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase1-report.txt以外のファイルの書き出しは禁止。

NO FAKE SIGNATURE: 内容を読まずに署名する行為は詐欺行為とみなす。署名・完了検証は phase-report-check (write) 経由で phase-report-checker サブエージェントに委譲し、オーケストレータが進捗ファイルを直接編集したり署名を自前で行ったりしてはならない。虚偽署名検出時はワークフロー全体をやり直す。

# レポート運用ルール

fs-impl-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（.aide/specs/{feature_name}）
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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase1-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
　再開Step(前処理):
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):

### 完了条件
fs-impl-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
・PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`START_FRESH`（新規開始）→ Step1 へ遷移する
　・`RESUME_FROM N`（N==本フェーズ番号=1）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>本フェーズ番号=1）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<1）→ 本フェーズは先頭フェーズのため発生しない（万一検出時はユーザーに報告）
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: ワークフロー共通 Iron Law の適用宣言

### 成果物
fs-impl-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・実装ワークフローの全フェーズスキルに適用される共通 Iron Law（フェーズ省略禁止・フェーススキル実作業禁止・サブエージェント委譲義務・ワークフロー実行中の別ワークフロー起動禁止・NO FAKE SIGNATURE）を本ワークフロー全体に適用することを宣言した結果を、次の項目で記載する
　ワークフロー共通Iron Law適用宣言(Step1):

### 完了条件
fs-impl-phase1-report.txtに"ワークフロー共通Iron Law適用宣言(Step1)"が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: HARD-GATE: 設計書ゲート

### 成果物
fs-impl-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-gate (aide-powers skill)を activate して実行し、出力を"design-gateの出力(Step2):"として記載する。その記載内容から、次の項目を判断して記載する
　必須ドキュメントが存在するか(Step2):
　設計逆引きが必要か(Step2):
　必須ドキュメントが存在しないのに設計逆引きしない理由(Step2):
　pending-issues.mdに追記した項目(Step2):

### 完了条件
fs-impl-phase1-report.txtに、design-gateを実行して得た判定結果が記載されている

### 状態判定
完了条件を満たし、fs-impl-phase1-report.txtの"設計逆引きが必要か(Step2)"が必要（design-gate が FAIL）の場合、design-gate が pending-issues への issue 登録（2件）とユーザーへの案内を実行済みであることを確認し、ワークフローを終了する。不要（PASS）の場合、後処理へ遷移する

## 後処理

### 成果物
fs-impl-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・フェーズ完了ステータス(後処理):（A:PASS（次フェーズ phase2-preparation） / B:設計書ゲートFAIL（ワークフロー終了））
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase1-report.txtに、phase-report-check(write) を実行して得た項目とフェーズ完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-impl-phase1-report.txtの"フェーズ完了ステータス(後処理)"を確認したら次フェーズへ遷移する
・A:PASS → `fs-impl-phase2-preparation (aide-powers skill)` を activate して実行する
・B:設計書ゲートFAIL → ワークフロー終了（Step2 で終了済みのため後処理に到達しない）

注: 実装ワークフローは各フェーズコミット型だが、本フェーズは成果物（設計ドキュメント・コード）を作成しないためコミット対象がなく、git-commit-workflow を呼ばない（後続フェーズが自フェーズの後処理でコミットする）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（PASS時の遷移先）:**
- `fs-impl-phase2-preparation (aide-powers skill)` — 次フェーズ: 環境確認 + タスクリスト生成 + 動作確認試験書初期化

**FAIL時:**
ワークフローを終了する。次フェーズスキルへの遷移は行わない（FAIL 処理は design-gate 内部で完結）。

**Called by:**
- 実装ワークフロー（using-aide-powers (aide-powers skill) メタスキルから遷移する最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `design-gate (aide-powers skill)` — Step 2（FAIL 時の pending-issues 登録（2件）とワークフロー終了も design-gate 内部で実行される）
- `phase-report-check (aide-powers skill: write)` — 後処理

**Related skills:**
- `pending-issues-management (aide-powers skill)` — FAIL時の issue 登録に使用する共通スキル（design-gate 経由で呼ばれる）
- `user-profile-management (aide-powers skill)` — ユーザーとやり取りが発生する場面では activate して user-profile.md を確認し、説明粒度・選択肢の提示方法を調整する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**Input from caller:**
- `feature_name`: プロジェクト名

**Output to next phase:**
- 設計書ゲート判定結果（PASS）
- 進捗ファイル: `.aide/specs/{feature_name}/impl-progress.md`（後処理の phase-report-check(write) で作成・更新）

**Global rules:** `.aide/references/global-rules.md` を厳守
