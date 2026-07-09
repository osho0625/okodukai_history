---
name: fs-impl-phase6-doc-generation
description: "Use when all implementation tasks are complete and final checks have passed. Generate README.md and docs/ for the project."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| README.md | プロジェクトルート/README.md | プロジェクトの概説・実行方法・使い方等 |
| docs/ | プロジェクトルート/docs/ | 開発者向けドキュメント（architecture.md, design-decisions.md 等） |
| fs-impl-phase6-report.txt | .aide/tmp/fs-impl-phase6-report.txt | fs-impl-phase6-doc-generation の実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase6-report.txt以外のファイルの書き出しは禁止。

- **ユーザー承認を経ずにコミットしない**: README.md / docs/ の内容はユーザーの確認・承認を経てからコミットする。自動生成だからという理由で承認を省略してはならない。
- **gitコミット忘れ禁止**: 後処理で `git-commit-workflow (aide-powers skill)` を呼ばずにフェーズを終了してはならない（実装ワークフローは各フェーズコミット型）。

# レポート運用ルール

fs-impl-phase6-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase6-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `ドキュメント修正回数(Step3): 0（フィードバックなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase6-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase6-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
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
fs-impl-phase6-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号=6）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>本フェーズ番号=6）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号=6）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（実装・最終チェックが未完了）。ユーザーに報告し、前フェーズスキル `fs-impl-phase5-final-check (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 前提条件確認（doc-index.md の読み込み）

### 成果物
fs-impl-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/doc-index.md` を読み込み、全設計ドキュメントのパスと各ステータスを確認した結果を、次の項目で記載する
　doc-index.mdパス(Step1):
　全設計ドキュメントのパス一覧(Step1):
　全ドキュメントステータス確認結果(Step1):（全て ✅ 完了 / 未完了あり → 未完了ドキュメント名）

### 完了条件
fs-impl-phase6-report.txtに、doc-index.mdパス(Step1)・全設計ドキュメントのパス一覧(Step1)・全ドキュメントステータス確認結果(Step1)が記載されている

### 状態判定
完了条件を満たしたうえで、"全ドキュメントステータス確認結果(Step1):" を確認する:

- 「全て ✅ 完了」の場合 → Step2 へ遷移する
- 「未完了あり」の場合 → 前提条件（全ドキュメントが ✅ 完了）を満たさないため、ユーザーに未完了ドキュメントを報告し対応方針を確認する

## Step 2: README・ドキュメント生成

### 成果物
fs-impl-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、生成対象の出力ファイルパスを記載する
　ドキュメント生成の出力ファイルパス(Step2):（例: プロジェクトルート/README.md, プロジェクトルート/docs/architecture.md, プロジェクトルート/docs/design-decisions.md）
・本スキルディレクトリの `readme-generator-prompt.md`（Mode A: 初回生成モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"README・ドキュメント生成エージェントの出力(Step2):"として記載する

### 完了条件
fs-impl-phase6-report.txtのREADME・ドキュメント生成エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、プロジェクトルートに README.md が、docs/ 配下に architecture.md と design-decisions.md がそれぞれファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、ステータスを確認する:

- DONE の場合 → Step3 へ遷移する
- DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 不足情報を補い `readme-generator-prompt.md`（Mode A）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: 生成結果のユーザー承認

### 成果物
fs-impl-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・生成された README.md の内容、docs/ 配下のファイル一覧と各ファイルの概要（1〜2行）をユーザーに提示し、内容に問題がないか・追加修正したい箇所があるか・不要なセクションがあるかの確認を依頼し、承認を得た結果を、次の項目で記載する
　ドキュメント承認のユーザー判断(Step3):（承認 / 修正要求）
　ドキュメント修正回数(Step3):
　ドキュメント修正内容要約(Step3):

### 完了条件
fs-impl-phase6-report.txtの"ドキュメント承認のユーザー判断(Step3)"が承認である

### 状態判定
完了条件を満たしたうえで、"ドキュメント承認のユーザー判断(Step3):" を確認する:

- 承認の場合 → 後処理へ遷移する
- 修正要求の場合 → 修正対象ファイルとフィードバック内容を補い `readme-generator-prompt.md`（Mode B: 修正モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step3 を再実行する。修正ループは最大3回まで。3回を超える場合は打ち切らず、ユーザーに「修正が3回を超えました。方針を相談させてください」と伝え、方針（部分承認・方針変更等）を確認する

## 後処理

### 成果物
fs-impl-phase6-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し（docs/ 配下のファイルを doc-index.md に登録）、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し（実装ワークフローは各フェーズコミット型のため、本フェーズの進捗ファイル更新後にコミットする。コミット対象: README.md + docs/ + impl-progress.md）、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・本フェーズ（ドキュメント生成）の完了をもって実装ワークフローの実質作業は完了するため、実装ワークフローの完了をユーザーに報告した結果を記載する
　- 報告内容:
　　1. 生成物サマリ（実装コード・テストコード・生成ドキュメント）
　　2. README.md・docs/ の生成結果
　　3. 全体テスト結果
　　4. 次に利用可能なワークフロー（変更・リファクタリング・バグ修正等）の案内
　- 後続の最終チェックフェーズ `fs-impl-phase7-final-check` は進捗ファイルの最終整合性検証・コミット・一時ファイル削除に徹する終了処理フェーズであり、完了報告は行わない。そのためワークフロー完了報告は本フェーズで行う
　ワークフロー完了報告(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase6-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) の結果を確認する:

- FAIL を返した場合（記載項目漏れ検出）→ ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する。最終的な実行内容はユーザー指示に従う
- PASS の場合 → 完了条件を満たし、fs-impl-phase6-report.txtの"完了ステータス(後処理):"を確認したら `fs-impl-phase7-final-check (aide-powers skill)` を activate して実行する

注: 実装ワークフローは各フェーズコミット型である。本フェーズは後処理の phase-report-check(write)（進捗ファイル更新）の**後**に git-commit-workflow でコミットする。最終フェーズ（fs-impl-phase7-final-check）でも進捗ファイルの最終更新後にコミットされる。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase7-final-check (aide-powers skill)`（進捗ファイル完全性チェック）

**前のフェーズスキル:**
- `fs-impl-phase5-final-check (aide-powers skill)` → REQUIRED SUB-SKILL → **fs-impl-phase6-doc-generation**

**Called by:**
- `fs-impl-phase5-final-check (aide-powers skill)` — REQUIRED SUB-SKILL として遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理（docs/ 配下のファイルの doc-index.md への登録）
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。phase-report-check(write) の後にコミット）
- `visual-companion (aide-powers skill)` — 生成結果の提示時の視覚的提示に活用
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・量が多い場合の分割処理に活用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `readme-generator-prompt.md` — Step 2（Mode A: 初回生成）/ Step 3（Mode B: 修正）

**Input from caller:**
- `feature_name`: プロジェクト名
- `doc-index.md` のパス（`.aide/specs/{feature_name}/doc-index.md`）
- `impl-progress.md` のパス（`.aide/specs/{feature_name}/impl-progress.md`）

**Output to next phase:**
- README.md（プロジェクトルート）と docs/ 配下の開発者向けドキュメント（ユーザー承認済み・コミット済み）

**Global rules:** `.aide/references/global-rules.md` を厳守
