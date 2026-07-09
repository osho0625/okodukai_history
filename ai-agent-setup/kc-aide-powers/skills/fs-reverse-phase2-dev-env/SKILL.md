---
name: fs-reverse-phase2-dev-env
description: "Use when fs-reverse-phase1-program completes and program-structure.md is ready. Extract development environment information from existing project configuration files."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| dev-environment.md | `.aide/specs/{feature_name}/dev-environment.md` | 開発実行環境（Python・venv・依存管理）の記録 |
| fs-reverse-phase2-report.txt | .aide/tmp/fs-reverse-phase2-report.txt | fs-reverse-phase2-dev-envの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-reverse-phase2-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-reverse-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-reverse-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): PASS（前フェーズ fs-reverse-phase1-program の進捗確認済み）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-reverse-phase2-report.txt

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
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):
・本フェーズを `RESUME_FROM`（N == 本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-reverse-phase2-report.txt。前回セッションのものが残っていれば）の "現在のStep:" を読み、中断していた Step があればその Step から、判定材料がなければ Step1 から再開すると判定し、結果を記載する
　再開Step(前処理):

### 完了条件
fs-reverse-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目（再開Step(前処理)含む）がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（N はフェーズ番号。本フェーズ番号＝2）
　・`RESUME_FROM N`（N == 本フェーズ番号＝2）→ 本フェーズを実行する。フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う
　・`RESUME_FROM N`（N > 本フェーズ番号）→ 後続フェーズスキル（`fs-reverse-phase3-system-req (aide-powers skill)` 等）へ遷移する
　・`RESUME_FROM N`（N < 本フェーズ番号）→ 異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase1-program (aide-powers skill)` に差し戻す
　・`START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase1-program (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 開発環境逆引き

### 成果物
fs-reverse-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　dev-environment.mdの出力ファイルパス(Step1):（例: `.aide/specs/{feature_name}/dev-environment.md`）
・本スキルディレクトリの `reverse-dev-environment-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"開発環境逆引きエージェントの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　dev-environment.md作成有無(Step1):
　開発環境逆引きのユーザー合意(Step1):
　特記事項(設定ファイル不在・ユーザー確認事項等)(Step1):

### 完了条件
fs-reverse-phase2-report.txtの開発環境逆引きエージェントの出力(Step1)の内容を確認し、dev-environment.md が作成されかつ開発環境逆引きのユーザー合意(Step1)（「開発環境逆引き完了」）が取得されており、`.aide/specs/{feature_name}/dev-environment.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていれば後処理へ遷移する。dev-environment.md が作成されていない、または開発環境逆引きのユーザー合意(Step1)が未取得の場合は、不足情報を補い `reverse-dev-environment-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する（リトライは最大1回）。リトライ後も完了条件を満たさない場合は、ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-reverse-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-reverse-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先(後処理)が記載されている

### 状態判定
完了条件を満たし、"フェーズ完了検証結果(後処理):" が PASS であることを確認したうえで（FAIL の場合はユーザーに即通知し、本フェーズの未実行 Process を再実行する）、`fs-reverse-phase3-system-req (aide-powers skill)` を activate して実行する

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-reverse-phase3-system-req (aide-powers skill)` — フェーズ2完了後、システム要件逆引きフェーズに遷移する

**Called by:**
- `fs-reverse-phase1-program (aide-powers skill)` — REQUIRED SUB-SKILL として呼び出される

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理（dev-environment.md を doc-index.md に登録）
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（doc-index-maintenance / phase-report-check(write) 完了後、成果物をコミット）
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**呼び出さない共通スキル:**
- `design-gate (aide-powers skill)` — 設計逆引きワークフローは設計書を生成する側であり、設計書の存在確認は不要
- `design-sync (aide-powers skill)` — 逆引きは「現実の記録」であり、実装と設計書の同期は不要
- `coding-test-2review (aide-powers skill)` — コード変更を行わないため不要
- `usecase-analysis (aide-powers skill)` — ユースケース分析は設計ワークフローの担当
- `doc-sync (aide-powers skill)` — 逆引きは新規生成であり、既存設計書との同期は不要
- `pending-issues-management (aide-powers skill)` — フェーズ2単体では pending-issues の操作は不要

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `reverse-dev-environment-prompt.md` — Step 1（設定ファイル解析・dev-environment.md 作成・ユーザー合意取得）

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `project_root` — プロジェクトルートパス

**Global rules:** `.aide/references/global-rules.md` を厳守
