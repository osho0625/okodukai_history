---
name: fs-planning-phase1-intake-and-init
description: "Use when starting a planning workflow to collect initial information from the user, structure existing materials, and initialize the planning proposal template."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 構造化済み資料 | `.aide/specs/{feature_name}/source-materials/{資料名}.md` | ユーザー提供資料の構造化結果（資料がある場合のみ） |
| session-notes.md | `.aide/specs/{feature_name}/session-notes.md` | ヒアリング内容の構造化記録 |
| planning-proposal.md | `.aide/specs/{feature_name}/planning-proposal.md` | 開発企画書テンプレート初期版 |
| doc-index.md | `.aide/specs/{feature_name}/doc-index.md` | 成果物のインデックス |
| planning-progress.md | `.aide/specs/{feature_name}/planning-progress.md` | フェーズ進捗状態 |
| fs-planning-phase1-report.txt | `.aide/tmp/fs-planning-phase1-report.txt` | fs-planning-phase1-intake-and-initの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること（ヒアリング・承認取得を含む）。結果レポートを作成すること。fs-planning-phase1-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-planning-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-planning-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `資料構造化エージェントの出力: N/A（ユーザーが資料を提供しなかったため未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}`）
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
・フェーズ内 Step 途中再開判定: "再開ポイント(前処理):" が `RESUME_FROM N`（N==本フェーズ番号）または `START_FRESH`（本フェーズが起点）で本フェーズを実行する場合、`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-planning-phase1-report.txt）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を記載する
　再開Step(前処理):
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する（未作成なら会話から技術レベルを推定して作成する）
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-planning-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
・PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズの番号は 1）
　・`START_FRESH`（新規開始）→ 本フェーズは企画ワークフローの起点のため Step1 へ遷移する
　・`RESUME_FROM N`（N==1＝本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「フェーズ内 Step 途中再開判定」で決めた "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>1＝後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<1）→ 該当なし（本フェーズは最初のフェーズのため N<1 は存在しない）
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 初期ヒアリング（7項目を1つずつ）

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・以下の7項目を1つずつユーザーにヒアリングし、得た回答を"初期ヒアリング結果(Step1):"として記載する（質問は user-profile-management(apply) のスコアに応じた平易な言葉で行い、1回の応答で複数質問をまとめて投げない。AIが勝手にアイデアや方針を決定せず、必ずヒアリングしてから決定する）
  1. 何を作りたいのか（ざっくりとした目的）
  2. どんな出来上がりをイメージしているか
  3. なぜそれが必要なのか（背景・動機）
  4. 誰が使うのか（対象ユーザー）
  5. どんな仕事やシーンで使うものか（企画書では「関連ビジネスロジック」として記載。ユーザーには専門用語を使わない）
  6. 誰かから依頼されたものか（依頼者がいる場合、会話内容や議事録の有無を確認）
  7. 具体的にどんな機能が必要か（思いつく範囲で）
  初期ヒアリング結果(Step1):
　資料提供の有無(Step1):（ユーザーが既存資料を提供したか。Step2 の条件分岐に使用）

### 完了条件
fs-planning-phase1-report.txtに、7項目すべての初期ヒアリング結果と資料提供の有無が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: 既存資料の構造化（条件付き）

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step1 の"資料提供の有無(Step1):"が「あり」の場合、本スキルディレクトリの `source-material-organizer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"資料構造化エージェントの出力(Step2):"として記載する。構造化結果は `.aide/specs/{feature_name}/source-materials/` に格納される
・「なし」の場合はサブエージェントを呼び出さず、"資料構造化エージェントの出力(Step2):"にスキップ理由（例: N/A（ユーザーが資料を提供しなかったため未実行））を記載する
　資料構造化エージェントの出力(Step2):

### 完了条件
fs-planning-phase1-report.txtに、資料構造化エージェントの出力（資料ありの場合はステータスが DONE / DONE_WITH_CONCERNS かつ `.aide/specs/{feature_name}/source-materials/` 配下に構造化済み資料がファイルサイズ1byte以上で存在、資料なしの場合はスキップ理由）が記載されている

### 状態判定
完了条件を満たしていればStep3へ遷移する。

- DONE_WITH_CONCERNS の場合:
  - Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `source-material-organizer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 3: session-notes.md の作成

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　session-notesの出力ファイルパス(Step3):（例: `.aide/specs/{feature_name}/session-notes.md`）
・本スキルディレクトリの `session-notes-writer-prompt.md`（mode: create。feature_name と初期ヒアリング7項目の回答を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"session-notes作成エージェントの出力(Step3):"として記載する。記録結果は `.aide/specs/{feature_name}/session-notes.md` に格納される

### 完了条件
fs-planning-phase1-report.txtの"session-notes作成エージェントの出力(Step3):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/session-notes.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep4へ遷移する。

- DONE_WITH_CONCERNS の場合:
  - Step4 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `session-notes-writer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 4: 企画書テンプレート初期化

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　企画書の出力ファイルパス(Step4):（例: `.aide/specs/{feature_name}/planning-proposal.md`）
・本スキルディレクトリの `proposal-writer-init-prompt.md`（mode: init。session-notes.md と構造化済み資料を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"企画書初期化エージェントの出力(Step4):"として記載する

### 完了条件
fs-planning-phase1-report.txtの"企画書初期化エージェントの出力(Step4):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/planning-proposal.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep5へ遷移する。

- DONE_WITH_CONCERNS の場合:
  - Step5 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `proposal-writer-init-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 5: ユーザー承認

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/planning-proposal.md` の内容をユーザーに提示し、「この方向性で進めてよいか」を確認して承認を得た結果を、次の項目で記載する
　企画書のユーザー判断(Step5):
　企画書の修正回数(Step5):
　企画書の修正内容要約(Step5):

### 完了条件
fs-planning-phase1-report.txtの"企画書のユーザー判断(Step5):"が承認である

### 状態判定
完了条件を満たしていれば後処理へ遷移する。

- 修正要求の場合:
  - `proposal-writer-init-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して planning-proposal.md を修正し、修正後 Step5 を再実行する

## 後処理

### 成果物
fs-planning-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（コミット対象: 本フェーズの成果物、プレフィックス: `docs:`）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-planning-phase1-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータスが記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-planning-phase1-report.txtの"完了ステータス(後処理):"を確認したら `fs-planning-phase2-explore (aide-powers skill)` を activate して実行する

注: 企画ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) の後に git コミットを行う。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-planning-phase2-explore (aide-powers skill)`

**Called by:** 企画ワークフロー（using-aide-powers (aide-powers skill) から遷移する最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（フェーズ完了時のコミット）
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示が有効な場面で活用
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスクが必要な場面で活用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `source-material-organizer-prompt.md` — Step 2（ユーザーが資料を提供した場合）
- `session-notes-writer-prompt.md` — Step 3（mode: create）
- `proposal-writer-init-prompt.md` — Step 4（mode: init）

**Input from caller:**
- `feature_name`: 成果物パスの構築に使用
- ユーザーのアイデア（漠然としたもの）

**Output to next phase:**
- `planning-proposal.md`（初期版）
- `session-notes.md`
- `source-materials/*.md`（資料がある場合）
- `doc-index.md`

**Global rules:** `.aide/references/global-rules.md` を厳守
