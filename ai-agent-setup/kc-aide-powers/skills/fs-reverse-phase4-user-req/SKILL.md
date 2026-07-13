---
name: fs-reverse-phase4-user-req
description: "Use when extracting user requirements from existing codebase by analyzing code behavior and conducting user hearings to generate user-requirements.md. This phase marks CORE COMPLETION of the reverse design workflow."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| user-requirements.md | .aide/specs/{feature_name}/user-requirements.md | ユーザー要件（コード解析 + ユーザーヒアリング） |
| fs-reverse-phase4-report.txt | .aide/tmp/fs-reverse-phase4-report.txt | fs-reverse-phase4-user-reqの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-reverse-phase4-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-reverse-phase4-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-reverse-phase4-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): PASS（前フェーズ fs-reverse-phase3-system-req の進捗確認済み）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-reverse-phase4-report.txt

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
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):
・本フェーズを `RESUME_FROM`（N == 本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-reverse-phase4-report.txt。前回セッションのものが残っていれば）の "現在のStep:" を読み、中断していた Step があればその Step から、判定材料がなければ Step1 から再開すると判定し、結果を記載する
　再開Step(前処理):

### 完了条件
fs-reverse-phase4-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目（再開Step(前処理)含む）がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

- FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
- PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（N はフェーズ番号。本フェーズ番号＝4）
  - `RESUME_FROM N`（N == 本フェーズ番号＝4）→ 本フェーズを実行する。フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う
  - `RESUME_FROM N`（N > 本フェーズ番号）→ 後続フェーズスキル（`fs-reverse-phase5-optional-phases (aide-powers skill)` 等）へ遷移する
  - `RESUME_FROM N`（N < 本フェーズ番号）→ 異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase3-system-req (aide-powers skill)` に差し戻す
  - `START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase3-system-req (aide-powers skill)` に差し戻す
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: ユーザー要件逆引き（サブエージェント委譲）

### 成果物
fs-reverse-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　ユーザー要件の出力ファイルパス(Step1):（.aide/specs/{feature_name}/user-requirements.md）
・本スキルディレクトリの `reverse-user-requirements-prompt.md` のプレースホルダー（{feature_name} / {specs_dir} / {program_structure_path} / {dev_environment_path} / {system_requirements_path}）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"ユーザー要件逆引きエージェントの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザー合意の有無(Step1):
　ヒアリングで判明した特記事項(Step1):

### 完了条件
fs-reverse-phase4-report.txtのユーザー要件逆引きエージェントの出力(Step1)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、ユーザー合意が得られており、.aide/specs/{feature_name}/user-requirements.md がファイルサイズ1byte以上で存在する、かつ必須セクション（プロジェクト概要 / 要件一覧（MoSCoW分類）/ 前提条件・制約）が含まれ、各要件に情報源（トレーサビリティ）が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- fs-reverse-phase4-report.txtのユーザー要件逆引きエージェントの出力(Step1)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `reverse-user-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- 必須セクション（プロジェクト概要 / 要件一覧（MoSCoW分類）/ 前提条件・制約）またはトレーサビリティ記載が不足している場合、不足内容を補い `reverse-user-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して user-requirements.md を補完し、再度 Step1 を実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

なお、サブエージェントの再実行（リトライ）は最大2回までとし、それを超えても完了条件を満たさない場合はユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-reverse-phase4-report.txt

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
・コア完了宣言（完了シーケンス完了後の最終案内）を行い、結果を記載する。ユーザーに以下を案内する
  - コアドキュメント（program-structure.md / dev-environment.md / system-requirements.md / user-requirements.md の4件）が全て揃ったこと
  - 他のワークフロー（実装・変更・バグ修正・リファクタリング）が利用可能になったこと
  - 続いてオプションフェーズ（アーキテクチャ・オブジェクト設計・インフラIF・GUI設計）の実行判定に進むこと
　コア完了宣言の提示有無(後処理):
・次フェーズ遷移先(後処理):（fs-reverse-phase5-optional-phases）

### 完了条件
fs-reverse-phase4-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目とコア完了宣言の提示有無(後処理)・次フェーズ遷移先(後処理)が記載されている

### 状態判定
完了条件を満たし、fs-reverse-phase4-report.txtの"次フェーズ遷移先(後処理):"を確認し、さらに "フェーズ完了検証結果(後処理):" が PASS であることを確認したうえで、`fs-reverse-phase5-optional-phases (aide-powers skill)` を activate して実行する

- FAIL の場合はユーザーに即通知し、本フェーズの未実行 Process を再実行する

注: 逆引きワークフローは各フェーズコミット型である。本フェーズの後処理では phase-report-check(write) による進捗ファイル ✅ 完了 更新の後に git-commit-workflow を実行する。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-reverse-phase5-optional-phases (aide-powers skill)`（フェーズ4完了後に遷移）

**Called by:** `fs-reverse-phase3-system-req (aide-powers skill)`（REQUIRED SUB-SKILL として遷移）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `reverse-user-requirements-prompt.md` — Step 1（コード解析 + ヒアリング + user-requirements.md 作成 + ユーザー合意取得）

**Input from caller:**
- `feature_name`: スペックディレクトリ名
- `specs_dir`: `.aide/specs/{feature_name}`

**Output to next phase:**
- コア完了（4つのコアドキュメントが揃った状態）

**Global rules:** `.aide/references/global-rules.md` を厳守
