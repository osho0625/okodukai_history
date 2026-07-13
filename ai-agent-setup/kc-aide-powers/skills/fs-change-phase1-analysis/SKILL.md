---
name: fs-change-phase1-analysis
description: "Use when starting the change workflow. Performs design gate, requirements definition, impact analysis, and approach planning."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| change-requirements.md | {changes_dir}/change-requirements.md | 構造化された変更要求定義ドキュメント |
| impact-analysis.md | {changes_dir}/impact-analysis.md | アクター視点・プログラム構成視点の影響範囲分析結果 |
| approach.md | {changes_dir}/approach.md | 対応方針書（OCP検討結果、変更方針の詳細） |
| refactoring-request.md | {changes_dir}/refactoring-request.md | リファクタリング依頼書（リファクタリング委譲時のみ） |
| fs-change-phase1-report.txt | .aide/tmp/fs-change-phase1-report.txt | fs-change-phase1-analysisの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-change-phase1-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-change-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-change-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-change-phase1-report.txt

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
・progress-resume-check (aide-powers skill)を activate して実行し、出力を"progress-resume-checkの出力(前処理):"として記載する。呼び出し時の progress_file_path は以下で決定する:
　- `.aide/specs/{feature_name}/session-handover.md` が存在する場合: session-handover.md から changes_dir を復元し、`{changes_dir}/change-progress.md` を渡す
　- session-handover.md が存在しない場合: 進捗ファイル不在として START_FRESH を期待する（progress_file_path に存在しないパスを渡すと START_FRESH が返る）
　progress_file_path(前処理):
　その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・上記の判定で本フェーズを実行すると確定した場合、フェーズ内のどの Step から再開するかを判定する。progress-resume-check はフェーズ単位の再開ポイントしか返さないため、`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（`.aide/tmp/fs-change-phase1-report.txt`）の "現在のStep:" を読み、中断された Step が判明すればその Step から、判明しなければ Step1 から再開する。判定結果を次の項目で記載する
　再開Step(前処理):（Step1から / StepN から再開＋根拠）
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-change-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
・PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号であり、Step 番号ではない。本フェーズ番号は 1）
　・`RESUME_FROM N`（N == 1 = 本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から始めるかは前処理の "再開Step(前処理):" 判定に従う）
　・`RESUME_FROM N`（N > 1 = 後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N < 1 = 前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し前フェーズへ差し戻す（本フェーズは先頭フェーズのため通常この分岐は発生しない）
　・`START_FRESH`（新規開始）→ 先頭フェーズのため Step1 へ遷移する（前処理の "再開Step(前処理):" は Step1 となる）
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: HARD-GATE: 設計書ゲート

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-gate (aide-powers skill)を activate して実行し、出力を"design-gateの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　必須ドキュメントが存在するか(Step1):
　設計逆引きが必要か(Step1):
　必須ドキュメントが存在しないのに設計逆引きしない理由(Step1):
　pending-issues.mdに追記した項目(Step1):

design-gate 結果と「設計逆引きが必要か(Step1)」のマッピング: design-gate が PASS（必須ドキュメントが揃っている）の場合は「設計逆引きが必要か(Step1): 不要」となり Step2 へ進む。design-gate が FAIL（必須ドキュメントが不足している）の場合は「設計逆引きが必要か(Step1): 必要」となり、ユーザーに設計逆引きワークフロー（`fs-reverse-phase1-program (aide-powers skill)`）の実行を提案し、pending-issues.md に未解決問題として登録した上でワークフローを終了する。

### 完了条件
fs-change-phase1-report.txtに、design-gateを実行して得た判定結果が記載されている

### 状態判定
完了条件を満たし、fs-change-phase1-report.txtの"設計逆引きが必要か(Step1)"が必要の場合、後処理を経由せず（phase-report-check(write) を実行せず）ワークフローを終了する。終了前に fs-change-phase1-report.txt の「完了ステータス(後処理):」に `C:設計書ゲートFAIL` を記載する。不要の場合、Step2へ遷移する

## Step 2: 変更要件の作成

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、ユーザーの変更要求内容から changes_dir を確定し、出力ファイルパスを記載する
　changes_dir の命名規則: `.aide/specs/{feature_name}/changes/{YYYYMMDDHHmm}-{対処概略}(-{番号})`
　変更要件の出力ファイルパス(Step2):（例: {changes_dir}/change-requirements.md）
・本スキルディレクトリの `change-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"変更要件作成エージェントの出力(Step2):"として記載する

### 完了条件
fs-change-phase1-report.txtの変更要件作成エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/change-requirements.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep3へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

・NEEDS_CONTEXT の場合 → 不足情報を補い `change-requirements-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: 変更要件のユーザー承認

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/change-requirements.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　変更要件のユーザー判断(Step3):
　変更要件の修正回数(Step3):
　変更要件の修正内容要約(Step3):

### 完了条件
fs-change-phase1-report.txtの"変更要件のユーザー判断(Step3)"が承認である

### 状態判定
完了条件を満たしていればStep4へ遷移する。fs-change-phase1-report.txtの"変更要件のユーザー判断(Step3)"が修正要求の場合、`change-requirements-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step3 を再実行する

## Step 4: 影響範囲分析

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの changes_dir から出力ファイルパスを組み立てて記載する
　影響分析の出力ファイルパス(Step4):（例: {changes_dir}/impact-analysis.md）
・本スキルディレクトリの `change-impact-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"影響範囲分析エージェントの出力(Step4):"として記載する
・サブエージェントの出力に含まれる網羅性確認結果（completeness_check）を読み取り、影響を受ける全モジュール/レイヤー/設計書が洗い出されているかを確認した結果を記載する。確認観点はアクター視点の影響（関連ユースケース・アクター）／プログラム構成視点の影響（関連ファイル・依存関係・シグネチャ変更箇所）／起因元ドキュメントフォルダがそれぞれ記載されているか
　影響分析網羅性チェック結果(Step4):（PASS / FAIL + 不足セクション名）

### 完了条件
fs-change-phase1-report.txtの影響範囲分析エージェントの出力(Step4)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、"影響分析網羅性チェック結果(Step4)"が PASS（影響を受ける全モジュール/レイヤー/設計書が洗い出されている）であり、{changes_dir}/impact-analysis.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep5へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step5 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

・影響分析網羅性チェック結果(Step4) が FAIL の場合 → 不足セクションを指定して `change-impact-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する（PASS になるまで繰り返す）
・NEEDS_CONTEXT の場合 → 不足情報を補い `change-impact-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 5: 影響分析結果のユーザー承認

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/impact-analysis.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　影響分析のユーザー判断(Step5):
　影響分析の修正回数(Step5):
　影響分析の修正内容要約(Step5):

### 完了条件
fs-change-phase1-report.txtの"影響分析のユーザー判断(Step5)"が承認である

### 状態判定
完了条件を満たしていればStep6へ遷移する。fs-change-phase1-report.txtの"影響分析のユーザー判断(Step5)"が修正要求の場合、修正内容を補い `change-impact-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step5 を再実行する

## Step 6: フォルダ統合判定

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/impact-analysis.md の「起因元ドキュメントフォルダ」セクションを読み取った結果を、次の項目で記載する
　起因元フォルダ(Step6):
　統合判定結果(Step6):
　確定changes_dir(Step6):
・起因元フォルダがありの場合、`folder-merge-check (aide-powers skill)` を activate して実行し、出力を"folder-merge-checkの出力(Step6):"として記載する。その記載内容から changes_dir を判断して「確定changes_dir(Step6):」に記載し、以降の {changes_dir} として確定する。なしの場合は現在の changes_dir をそのまま「確定changes_dir(Step6):」に記載する
・統合により changes_dir が変わった場合、Step2〜5 で生成済みのファイル（change-requirements.md / impact-analysis.md 等）は folder-merge-check が新フォルダへ移設する（または移設済みであることを確認する）。

### 完了条件
fs-change-phase1-report.txtに"確定changes_dir(Step6):"が記録されている

### 状態判定
完了条件を満たしていればStep7へ遷移する

## Step 7: 対応方針の作成

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの changes_dir から出力ファイルパスを組み立てて記載する
　対応方針の出力ファイルパス(Step7):（例: {changes_dir}/approach.md）
・本スキルディレクトリの `change-approach-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"対応方針策定エージェントの出力(Step7):"として記載する
・リファクタリング推奨時はユーザーに提案し、許可された場合のみ {changes_dir}/refactoring-request.md を作成する（許可されなければ作成しない）。提案結果を"リファクタリング提案結果(Step7):"として記載する

### 完了条件
fs-change-phase1-report.txtの対応方針策定エージェントの出力(Step7)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/approach.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep8へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step8 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

・NEEDS_CONTEXT の場合 → 不足情報を補い `change-approach-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 8: 対応方針のレビュー

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `change-approach-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"対応方針レビューエージェントの出力(Step8):"として記載する

### 完了条件
fs-change-phase1-report.txtの対応方針レビューエージェントの出力(Step8)の内容を確認し、レビュー結果が PASS である

### 状態判定
完了条件を満たしていればStep9へ遷移する。fs-change-phase1-report.txtの対応方針レビューエージェントの出力(Step8)のレビュー結果が FAIL の場合、指摘内容を補い `change-approach-planner-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して approach.md を修正し、再度 Step8 へ

## Step 9: 対応方針のユーザー承認

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{changes_dir}/approach.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　対応方針のユーザー判断(Step9):
　対応方針の修正回数(Step9):
　対応方針の修正内容要約(Step9):

### 完了条件
fs-change-phase1-report.txtの"対応方針のユーザー判断(Step9)"が「承認（通常続行）」または「承認（リファクタリング委譲）」である

### 状態判定
完了条件を満たし、fs-change-phase1-report.txtの"対応方針のユーザー判断(Step9)"が以下の場合に分岐する
・承認（通常続行）→ 後処理へ遷移する（完了ステータス A:通常完了）
・承認（リファクタリング委譲）→ 後処理を経由せず（phase-report-check(write) を実行せず）ワークフローを終了する。終了前に fs-change-phase1-report.txt の「完了ステータス(後処理):」に `B:リファクタリング委譲` を記載し、リファクタリングワークフロー（`fs-refactoring-phase1-status (aide-powers skill)`）起動を案内する
・修正要求 → `change-approach-planner-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step8 へ戻る

## 後処理

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{changes_dir}/change-progress.md`（Step 6 で確定した changes_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（本後処理は通常完了パターン＝`A:通常完了` でのみ到達・実行される。`B:リファクタリング委譲` は Step9、`C:設計書ゲートFAIL` は Step1 で、いずれも後処理を経由せずワークフローを終了し、その時点でレポートの「完了ステータス(後処理):」に記載済みである）
・次フェーズ遷移先(後処理):

### 完了条件
fs-change-phase1-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-change-phase1-report.txtの"完了ステータス(後処理):"を確認したら `fs-change-phase2-impl (aide-powers skill)` を activate して実行する

注: 変更ワークフローでは最終フェーズの進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-change-phase2-impl (aide-powers skill)`

**Called by:** 変更ワークフロー（最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-gate (aide-powers skill)` — Step 1
- `folder-merge-check (aide-powers skill)` — Step 6（起因元フォルダがある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-requirements-prompt.md` — Step 2（mode: create / fix）
- `change-impact-analyzer-prompt.md` — Step 4
- `change-approach-planner-prompt.md` — Step 7（mode: create / fix）
- `change-approach-reviewer-prompt.md` — Step 8

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーの最初の発言（変更要求の内容）

**Output to next phase:**
- `changes_dir`: 確定した changes_dir

**リファクタリング委譲時:**
- `fs-refactoring-phase1-status (aide-powers skill)` を案内

**Global rules:** `.aide/references/global-rules.md` を厳守
