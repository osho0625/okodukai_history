---
name: fs-reverse-phase3-system-req
description: "Use when extracting system requirements (tech stack, non-functional requirements, error handling policies) from existing codebase during reverse design workflow phase 3."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-requirements.md | .aide/specs/{feature_name}/system-requirements.md | システム要件（技術スタック・非機能要件・データ管理・エラーハンドリング方針・ログ出力方針・セキュリティ要件） |
| fs-reverse-phase3-report.txt | .aide/tmp/fs-reverse-phase3-report.txt | fs-reverse-phase3-system-reqの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-reverse-phase3-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-reverse-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-reverse-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): PASS（前フェーズ fs-reverse-phase2-dev-env の進捗確認済み）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-reverse-phase3-report.txt

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
・本フェーズを `RESUME_FROM`（N == 本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-reverse-phase3-report.txt。前回セッションのものが残っていれば）の "現在のStep:" を読み、中断していた Step があればその Step から、判定材料がなければ Step1 から再開すると判定し、結果を記載する
　再開Step(前処理):

### 完了条件
fs-reverse-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目（再開Step(前処理)含む）がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（N はフェーズ番号。本フェーズ番号＝3）
　・`RESUME_FROM N`（N == 本フェーズ番号＝3）→ 本フェーズを実行する。フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う
　・`RESUME_FROM N`（N > 本フェーズ番号）→ 後続フェーズスキル（`fs-reverse-phase4-user-req (aide-powers skill)` 等）へ遷移する
　・`RESUME_FROM N`（N < 本フェーズ番号）→ 異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase2-dev-env (aide-powers skill)` に差し戻す
　・`START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase2-dev-env (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: システム要件逆引きのサブエージェント委譲

### 成果物
fs-reverse-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　システム要件逆引きの出力ファイルパス(Step1):（例: .aide/specs/{feature_name}/system-requirements.md）
・本スキルディレクトリの `reverse-system-requirements-prompt.md` のプレースホルダー（feature_name、前フェーズ成果物パス program-structure.md / dev-environment.md 等）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"システム要件逆引きエージェントの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザー合意取得結果(Step1):（サブエージェントがユーザーから「システム要件逆引き完了」の合意を得たか）

### 完了条件
fs-reverse-phase3-report.txtのシステム要件逆引きエージェントの出力(Step1)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、ユーザー合意取得結果(Step1)が「合意済み」であり、.aide/specs/{feature_name}/system-requirements.md がファイルサイズ1byte以上で存在する、かつ必須セクション（システム構成概要 / 技術スタック / データ管理 / エラーハンドリング方針 / ログ出力方針 / セキュリティ要件 / 非機能要件）が含まれている

### 状態判定
完了条件を満たしていれば後処理へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合 → 不足情報を補い `reverse-system-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- 必須セクションが不足している場合 → 不足セクションを補う指示を加えて `reverse-system-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

なお、サブエージェントの再実行（リトライ）は最大2回までとし、それを超えても完了条件を満たさない場合はユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-reverse-phase3-report.txt

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
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-reverse-phase3-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータス(後処理)と次フェーズ遷移先(後処理)が記載されている

### 状態判定
完了条件を満たし、fs-reverse-phase3-report.txtの"完了ステータス(後処理):"を確認し、さらに "フェーズ完了検証結果(後処理):" が PASS であることを確認したうえで、`fs-reverse-phase4-user-req (aide-powers skill)` を activate して実行する。

- FAIL の場合 → ユーザーに即通知し、本フェーズの未実行 Process を再実行する

注: 逆引きワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) による進捗ファイル ✅ 完了 更新の**後**に git-commit-workflow でコミットする（最終フェーズの ✅ 完了 取りこぼし防止のため、最終フェーズ fs-reverse-phase6-final-check でも progress-final-checker の後にコミットする）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-reverse-phase4-user-req (aide-powers skill)`

**Called by:**
- `fs-reverse-phase2-dev-env (aide-powers skill)`（REQUIRED SUB-SKILL として呼び出される）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（phase-report-check(write) による進捗更新の後にコミット）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `reverse-system-requirements-prompt.md` — Step 1（コードから system-requirements.md を逆生成し、ユーザー合意を取得）

**Input from caller:**
- `feature_name`: プロジェクト名
- 前フェーズの成果物: `.aide/specs/{feature_name}/program-structure.md`, `.aide/specs/{feature_name}/dev-environment.md`

**Output to next phase:**
- `.aide/specs/{feature_name}/system-requirements.md`: システム要件ドキュメント

**Global rules:** `.aide/references/global-rules.md` を厳守
