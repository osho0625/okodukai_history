---
name: fs-refactoring-phase2-candidates
description: "fs-refactoring-phase1-status 完了後に実行。引き継ぎ（refactoring-request.md あり）時は候補特定を素通りで通過する。通常起動（refactoring-request.md なし）時はリファクタリング候補を特定する。"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-candidates.md | {refactoring_dir}/refactoring-candidates.md | リファクタリング候補一覧（優先順位付き、ユーザー選択結果含む） |
| fs-refactoring-phase2-report.txt | .aide/tmp/fs-refactoring-phase2-report.txt | fs-refactoring-phase2-candidatesの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase2-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-refactoring-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `起因元フォルダ: なし（Docs: フッターなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase2-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase2-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
　再開Step(前処理):（中断 Step から再開（Step番号と根拠を併記） / Step1 から（新規））
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):
・`.aide/specs/{feature_name}/changes/` 配下に refactoring-request.md が存在するか機械的に確認し、起動経路を判定した結果を次の項目で記載する
　起動経路判定(前処理):（通常経路（refactoring-request.md なし。候補特定を実施）/ 引き継ぎ経路（refactoring-request.md あり。候補特定を素通りで通過））

### 完了条件
fs-refactoring-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目、および起動経路判定(前処理)がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`START_FRESH`（新規開始）→ 非初フェーズのため異常（前フェーズ=phase1の成果物が未確定）。ユーザーに報告し前フェーズスキル `fs-refactoring-phase1-status (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: リファクタリング候補の特定

### 成果物
fs-refactoring-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・前処理で判定した「起動経路判定(前処理)」を確認し、経路に応じて以下のいずれかを実施する

【引き継ぎ経路（素通り）の場合】候補特定の実作業（サブエージェント実行・候補一覧作成・ユーザーへの提示と選択）を全てスキップする。phase1 で引き継いだ refactoring-request.md を対象とするため、本フェーズでは候補特定を行わない。次の項目を記載する
　候補特定の実施(Step1):（引き継ぎにより候補特定を省略（refactoring-request.md を候補とする））
　refactoring_dir(Step1):（phase1 Step2 で確定した値を引き継ぐ。命名規則 `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`）
　候補一覧の出力ファイルパス(Step1): N/A（引き継ぎにより候補特定省略。refactoring-candidates.md は作成しない）
　リファクタリング対象特定エージェントの出力(Step1): N/A（引き継ぎにより候補特定省略）
　選択されたリファクタリング候補(Step1): N/A（引き継ぎにより候補特定省略。refactoring-request.md を対象とする）

【通常経路の場合】以下の候補特定作業を実施する
・サブエージェント実行前に、phase1 Step2 で確定済みの refactoring_dir（Input from caller で引き継いだ値）から出力ファイルパスを組み立てて記載する。**本フェーズで refactoring_dir を新規確定してはならない**（確定点は phase1 に一本化されている）
　候補特定の実施(Step1):（通常経路。候補特定を実施）
　refactoring_dir(Step1):（phase1 Step2 で確定した値を引き継ぐ。命名規則 `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`）
　候補一覧の出力ファイルパス(Step1):（例: {refactoring_dir}/refactoring-candidates.md）
・本スキルディレクトリの `refactoring-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"リファクタリング対象特定エージェントの出力(Step1):"として記載する
　- サブエージェントの担当範囲:
　　1. 設計ドキュメント読み込み
　　2. ユーザー希望確認
　　3. 6観点のコード分析
　　4. 効果/コスト/リスクの優先順位付け
　　5. git blame による起因元ドキュメントフォルダ特定
　　6. refactoring-candidates.md 作成
　　7. ユーザーへの提示と選択
・サブエージェントがユーザーに提示して得た選択結果を記載する
　選択されたリファクタリング候補(Step1):

### 完了条件
fs-refactoring-phase2-report.txt の「候補特定の実施(Step1)」に経路（通常経路 / 引き継ぎによる省略）が記載されている。引き継ぎ経路の場合は候補特定省略の旨と各項目に N/A（理由付き）が記載されていればよい。通常経路の場合はリファクタリング対象特定エージェントの出力(Step1)のステータスが DONE / DONE_WITH_CONCERNS であり、{refactoring_dir}/refactoring-candidates.md がファイルサイズ1byte以上で存在し、"選択されたリファクタリング候補(Step1):" にユーザーが選択した候補が記載されている

### 状態判定
- 引き継ぎ経路（素通り）の場合は、候補特定（Step1）およびフォルダ統合判定（Step2）の実作業をスキップし、Step2 の項目をレポートに「N/A（引き継ぎにより候補特定省略）」と記録したうえで直ちに後処理へ遷移する。
- 通常経路で完了条件を満たしていればStep2へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。
- fs-refactoring-phase2-report.txtのリファクタリング対象特定エージェントの出力(Step1)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `refactoring-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する。
- BLOCKED の場合、ユーザーに報告し対応方針を確認する。
- ユーザーが候補をまだ選択していない場合、選択を得るまで Step1 を完了としない

## Step 2: フォルダ統合判定

### 成果物
fs-refactoring-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本Stepは通常経路でのみ実行する。引き継ぎ経路（素通り）では Step1 から後処理へ直行するため本Stepは実行されない（Step1 で各項目を「N/A（引き継ぎにより候補特定省略）」と記録済み。refactoring-candidates.md が存在せず起因元フォルダ判定の入力がないため、folder-merge も行わず refactoring_dir は phase1 確定値のまま）
・{refactoring_dir}/refactoring-candidates.md の「起因元ドキュメントフォルダ」セクションを読み取った結果を、次の項目で記載する
　起因元フォルダ(Step2):
　統合判定結果(Step2):
　確定refactoring_dir(Step2):
・起因元フォルダがありの場合、`folder-merge-check (aide-powers skill)` を activate して実行する（引数: origin_folder_path=起因元フォルダ / current_dir=現在の refactoring_dir / workflow_type=リファクタリング）。出力を"folder-merge-checkの出力(Step2):"として記載する。folder-merge-check は統合承認時に current_dir 内の全成果物（phase1 が作成した refactoring-progress.md、refactoring-candidates.md 等）を統合先フォルダへ移動し、空になった current_dir を削除する。その出力の result_dir を「確定refactoring_dir(Step2):」に記載し、以降の {refactoring_dir} として確定する（起因元フォルダなし、または統合拒否の場合は現在の refactoring_dir をそのまま確定値とする）
・folder-merge-check の移設により refactoring-progress.md を含む成果物が確定 refactoring_dir 配下へ移動されるため、phase7 の progress-final-checker が読む `{確定refactoring_dir}/refactoring-progress.md` と phase1 が記録した progress.md が同一フォルダになることが担保される（**FS自身はファイル移動・削除を行わない。移設は folder-merge-check の責務**）。folder-merge-check の出力から、移設結果を次の項目に記録する
　成果物の移設結果(Step2):（移設なし（refactoring_dir 不変） / 移設あり → folder-merge-check が移動したファイル一覧）

### 完了条件
fs-refactoring-phase2-report.txtに"確定refactoring_dir(Step2):"が記録されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-refactoring-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する（引き継ぎ経路で更新対象がない場合は「N/A（引き継ぎ素通りのため候補/統合の更新なし）」と記載する）
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（Step 2 で確定した refactoring_dir を使用。引き継ぎ経路（Step2実行なし）の場合は phase1 Step2 で確定した refactoring_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了（候補特定を実施）/ B:引き継ぎ完了（候補特定を素通り通過））
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
- phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
  - ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
  - 最終的な実行内容はユーザー指示に従う
- 完了条件を満たし、fs-refactoring-phase2-report.txtの"完了ステータス(後処理):"を確認したら `fs-refactoring-phase3-plan (aide-powers skill)` を activate して実行する

注: リファクタリングワークフローでは全フェーズ完了後（phase7: 最終チェック）に1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase3-plan (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase1-status (aide-powers skill)` — REQUIRED SUB-SKILL として遷移される（通常起動時・引き継ぎ時とも。引き継ぎ時は本フェーズを素通り通過する）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `folder-merge-check (aide-powers skill)` — Step 2（起因元フォルダがある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `refactoring-analyzer-prompt.md` — Step 1

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーのリファクタリング希望（あれば）

**Output to next phase:**
- `refactoring_dir`: 確定した refactoring_dir
- `refactoring-candidates.md`: ユーザーが選択した候補を含む候補一覧

**Global rules:** `.aide/references/global-rules.md` を厳守
