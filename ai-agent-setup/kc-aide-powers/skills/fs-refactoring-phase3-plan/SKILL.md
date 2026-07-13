---
name: fs-refactoring-phase3-plan
description: "Use when refactoring candidates have been identified (refactoring-candidates.md) or a refactoring request has been handed over (refactoring-request.md)."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-plan.md | {refactoring_dir}/refactoring-plan.md | リファクタリング方針書（before→after、メリット、影響範囲、リスク） |
| fs-refactoring-phase3-report.txt | .aide/tmp/fs-refactoring-phase3-report.txt | fs-refactoring-phase3-planの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase3-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-refactoring-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `リファクタリング方針のユーザー合意結果(Step2): N/A（修正要求なしのため再実行未発生）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase3-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase3-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
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
fs-refactoring-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`START_FRESH`（新規開始）→ 異常（前フェーズ未完了）。ユーザーに報告し前フェーズスキル `fs-refactoring-phase2-candidates (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 入力の分岐判定

### 成果物
fs-refactoring-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本フェーズの起動経路に応じて、使用する入力ファイルを判定した結果を、次の項目で記載する
　入力ファイル種別(Step1):（通常起動=refactoring-candidates.md / 引き継ぎ=refactoring-request.md）
　入力ファイルパス(Step1):（通常起動時: `{refactoring_dir}/refactoring-candidates.md` / 引き継ぎ時: `{changes_dir}/refactoring-request.md`）
　refactoring_dir(Step1):（phase1 Step2 で確定済みの refactoring_dir をそのまま使う。通常起動・引き継ぎのいずれの経路でも phase1 は実行済みであり refactoring_dir は確定済みのため、**本フェーズで新規確定してはならない**。通常起動時は phase2 のフォルダ統合で確定した値を引き継ぐ。命名規則 `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`）

### 完了条件
fs-refactoring-phase3-report.txtに"入力ファイル種別(Step1):"と"入力ファイルパス(Step1):"と"refactoring_dir(Step1):"が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: リファクタリング方針確定

### 成果物
fs-refactoring-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの refactoring_dir から出力ファイルパスを組み立てて記載する
　リファクタリング方針の出力ファイルパス(Step2):（例: {refactoring_dir}/refactoring-plan.md）
・本スキルディレクトリの `refactoring-planner-prompt.md` のプレースホルダーを実データ（Step1で確定した入力ファイルパスを含む）で置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"リファクタリング方針確定エージェントの出力(Step2):"として記載する
・リファクタリング方針確定エージェントは設計ドキュメントの読み込み・before→afterの説明・影響範囲・リスクの提示・refactoring-plan.md の作成・ユーザー合意の取得までを担う。エージェント内で得たユーザー合意の結果を、次の項目で記載する
　リファクタリング方針のユーザー合意結果(Step2):（合意 / 修正要求 / リファクタリング中止）

### 完了条件
fs-refactoring-phase3-report.txtのリファクタリング方針確定エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、"リファクタリング方針のユーザー合意結果(Step2):"が「合意」であり、{refactoring_dir}/refactoring-plan.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていれば後処理へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- "リファクタリング方針のユーザー合意結果(Step2):"が「修正要求」の場合、修正内容を補い `refactoring-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して refactoring-plan.md を修正し、再度ユーザー合意を得る。
- "リファクタリング方針のユーザー合意結果(Step2):"が「リファクタリング中止」の場合、`fs-refactoring-phase7-final-check (aide-powers skill)` を mode=abort（abort_reason=リファクタリング中止）で activate して中止クリーンアップに委ねる（自フェーズで終了処理はしない。後段の後処理には進まない）。
- エージェントのステータスが NEEDS_CONTEXT の場合、不足情報を補い `refactoring-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する。
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-refactoring-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了 / B:リファクタリング中止（中止は phase7 中止モードへ委譲するため後処理には到達しない。通常 B にはならない））
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase3-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-refactoring-phase3-report.txtの"完了ステータス(後処理):"を確認したら `fs-refactoring-phase4-design (aide-powers skill)` を activate して実行する

注: リファクタリングワークフローでは全フェーズ完了後に1回のみ git コミットを行う（phase7: 最終チェックで実施）。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase4-design (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase2-candidates (aide-powers skill)`（通常起動・引き継ぎとも REQUIRED SUB-SKILL として呼び出される。引き継ぎ時は phase2 が候補特定を素通り通過したうえで本フェーズを呼び出す）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `visual-companion (aide-powers skill)` — before→after の構造変化・影響範囲を図示する場面で活用（任意）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `refactoring-planner-prompt.md` — Step 2（方針確定・ユーザー合意。修正時も同テンプレートを再実行）

**Input from caller:**
- `feature_name`: 対象フィーチャー名
- `refactoring_dir`: `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`
- `changes_dir`: `.aide/specs/{feature_name}/changes/`（引き継ぎ経路でのみ使用。refactoring-request.md の所在）
- 入力ファイル: 通常起動時は `{refactoring_dir}/refactoring-candidates.md`、引き継ぎ時は `{changes_dir}/refactoring-request.md`

**Output to next phase:**
- `refactoring_dir`: phase1 Step2 で確定済みの refactoring_dir（本フェーズでは引き継ぐのみ。新規確定しない）
- `{refactoring_dir}/refactoring-plan.md`: 確定したリファクタリング方針書

**Global rules:** `.aide/references/global-rules.md` を厳守
