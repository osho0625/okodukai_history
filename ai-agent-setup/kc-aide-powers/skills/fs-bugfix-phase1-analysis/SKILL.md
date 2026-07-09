---
name: fs-bugfix-phase1-analysis
description: "Use when starting the bugfix workflow. Performs bug report hearing, design gate, root cause analysis, folder merge check, and fix plan establishment."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| bug-report.md | {bugfix_dir}/bug-report.md | バグの症状・再現手順・期待動作 |
| bug-analysis.md | {bugfix_dir}/bug-analysis.md | 原因分析結果（原因箇所・影響範囲・起因元フォルダ） |
| fix-plan.md | {bugfix_dir}/fix-plan.md | 修正方針書（原因・対策・対策種別・副作用リスク・テスト方針） |
| fs-bugfix-phase1-report.txt | .aide/tmp/fs-bugfix-phase1-report.txt | fs-bugfix-phase1-analysisの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-bugfix-phase1-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-bugfix-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-bugfix-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-bugfix-phase1-report.txt

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
　- `.aide/specs/{feature_name}/session-handover.md` が存在する場合: session-handover.md から changes_dir を復元し、`{changes_dir}/bugfix-progress.md` を渡す
　- session-handover.md が存在しない場合: 進捗ファイル不在として START_FRESH を期待する（progress_file_path に存在しないパスを渡すと START_FRESH が返る）
　progress_file_path(前処理):
　その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・本フェーズを `RESUME_FROM N`（N==本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（`.aide/tmp/fs-bugfix-phase1-report.txt`）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無い／`START_FRESH` の場合は Step1 とする。判定結果を次の項目で記載する
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
fs-bugfix-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
・PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号。本フェーズは phase1＝1）
　・`START_FRESH`（新規開始）→ Step1 へ遷移する
　・`RESUME_FROM N`（N==1：本フェーズ）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>1：後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<1：前フェーズ）→ 異常（前フェーズ未完了）。初回フェーズのため通常該当なしだが、検出時はユーザーに報告する
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: バグ報告ヒアリング

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、ユーザーのバグ報告内容から bugfix_dir を確定し、出力ファイルパスを記載する
　bugfix_dir の命名規則: `.aide/specs/{feature_name}/bugfix/{YYYYMMDDHHmm}-{対処概略}(-{番号})`
　バグ報告の出力ファイルパス(Step1):（例: {bugfix_dir}/bug-report.md）
・本スキルディレクトリの `bugfix-reporter-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"バグ報告ヒアリングエージェントの出力(Step1):"として記載する

### 完了条件
fs-bugfix-phase1-report.txtのバグ報告ヒアリングエージェントの出力(Step1)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/bug-report.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep2へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-bugfix-phase1-report.txtのバグ報告ヒアリングエージェントの出力(Step1)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `bugfix-reporter-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 2: バグ報告のユーザー承認

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/bug-report.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　バグ報告承認のユーザー判断(Step2):
　バグ報告の修正回数(Step2):
　バグ報告の修正内容要約(Step2):

### 完了条件
fs-bugfix-phase1-report.txtの"バグ報告承認のユーザー判断(Step2)"が承認である

### 状態判定
- 完了条件を満たしていればStep3へ遷移する
- fs-bugfix-phase1-report.txtの"バグ報告承認のユーザー判断(Step2)"が修正要求の場合、`bugfix-reporter-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step2 を再実行する

## Step 3: HARD-GATE: 設計書ゲート

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-gate (aide-powers skill)を activate して実行し、出力を"design-gateの出力(Step3):"として記載する。その記載内容から、次の項目を判断して記載する
　必須ドキュメントが存在するか(Step3):
　設計逆引きが必要か(Step3):
　設計逆引きWF提案結果(Step3):
　pending-issues.mdに追記した項目(Step3):

### 完了条件
fs-bugfix-phase1-report.txtに、design-gateを実行して得た判定結果が記載されている

### 状態判定
完了条件を満たし、fs-bugfix-phase1-report.txtの"設計逆引きが必要か(Step3)"を確認する
- 必要（design-gate FAIL）の場合 → ユーザーに設計書が不足している旨を報告し、設計逆引きワークフロー（`fs-reverse-phase1-program (aide-powers skill)`）の実行を提案する。pending-issues.md に未解決問題として登録する。終了前に fs-bugfix-phase1-report.txt の「完了ステータス(後処理):」に `B:設計書ゲートFAIL` を記載し、後処理を経由せず（phase-report-check(write) を実行せず）ワークフローを終了する
- 不要（design-gate PASS）の場合 → ユーザーに PASS の事実を報告し、Step4へ遷移する

## Step 4: 再現性確認・原因特定

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの bugfix_dir から出力ファイルパスを組み立てて記載する
　再現性確認結果の出力先(Step4): fs-bugfix-phase1-report.txt への記載のみ（別ファイル出力なし。再現性確認結果は後続の原因分析Step（Step5）に {investigation_result} として情報引き渡しする）
・本スキルディレクトリの `bugfix-investigator-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"再現性確認・原因特定エージェントの出力(Step4):"として記載する
・サブエージェントの出力から以下の項目を抽出して記載する:
　再現性判定結果(Step4):（あり／なし）
　再現環境(Step4):（開発環境／本番環境／両方）
　環境情報収集結果(Step4):（再現性なしの場合に記載。収集した環境要因のサマリー）
　仮実装ブランチ名(Step4):（仮実装を実施した場合のブランチ名。未実施の場合は"未実施"）
　仮実装検証結果(Step4):（改善確認できた／できなかった／未実施）
　原因候補(Step4):（特定された原因箇所の要約）

### 完了条件
fs-bugfix-phase1-report.txtの"再現性確認・原因特定エージェントの出力(Step4):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、"再現性判定結果(Step4):"と"原因候補(Step4):"が記載されている

### 状態判定
- 完了条件を満たしていればStep5へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step5 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-bugfix-phase1-report.txtの"再現性確認・原因特定エージェントの出力(Step4):"のステータスがNEEDS_CONTEXT の場合、不足情報を補い `bugfix-investigator-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

### 仮実装コードの扱いについて

#### ⚠️ 仮実装コード流用禁止（絶対厳守）

本Stepで行う仮実装は **調査目的のみ** であり、以下を厳守すること:
- 仮実装コードはデバッグコード・ルール違反コードを含む前提
- 後続Step（原因分析・修正方針・差分設計・実装）に引き継ぐのは
  「特定された原因箇所」と「仮実装で改善が確認されたポイント（知見）」のみ
- 仮実装のコード差分・変更内容自体の流用を **絶対禁止** する
- fix ブランチの仮実装コードを参照してそのまま実装に流用してはならない



## Step 5: 原因分析

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの bugfix_dir から出力ファイルパスを組み立てて記載する
　原因分析の出力ファイルパス(Step5):（例: {bugfix_dir}/bug-analysis.md）
・本スキルディレクトリの `bugfix-investigator-prompt.md` の実行結果（"再現性確認・原因特定エージェントの出力(Step4):" から再現性判定結果・原因候補等を抽出した情報）を {investigation_result} プレースホルダーに設定し、`bugfix-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"原因分析エージェントの出力(Step5):"として記載する

### 完了条件
fs-bugfix-phase1-report.txtの原因分析エージェントの出力(Step5)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/bug-analysis.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep6へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step6 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-bugfix-phase1-report.txtの原因分析エージェントの出力(Step5)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `bugfix-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 6: 原因分析のユーザー承認

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/bug-analysis.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　原因分析承認のユーザー判断(Step6):
　原因分析の修正回数(Step6):
　原因分析の修正内容要約(Step6):

### 完了条件
fs-bugfix-phase1-report.txtの"原因分析承認のユーザー判断(Step6)"が承認である

### 状態判定
- 完了条件を満たしていればStep7へ遷移する
- fs-bugfix-phase1-report.txtの"原因分析承認のユーザー判断(Step6)"が修正要求の場合、修正内容を補い `bugfix-analyzer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step6 を再実行する

## Step 7: フォルダ統合判定

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/bug-analysis.md の「起因元ドキュメントフォルダ」セクションを読み取った結果を、次の項目で記載する
　起因元フォルダ(Step7):
　統合判定結果(Step7):
　確定bugfix_dir(Step7):
・起因元フォルダがありの場合、`folder-merge-check (aide-powers skill)` を activate して実行し、出力を"folder-merge-checkの出力(Step7):"として記載する。その記載内容から bugfix_dir を判断して「確定bugfix_dir(Step7):」に記載し、以降の {bugfix_dir} として確定する。なしの場合は現在の bugfix_dir をそのまま「確定bugfix_dir(Step7):」に記載する

### 完了条件
fs-bugfix-phase1-report.txtに"確定bugfix_dir(Step7):"が記録されている

### 状態判定
完了条件を満たしていればStep8へ遷移する

## Step 8: 修正方針の作成

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの bugfix_dir から出力ファイルパスを組み立てて記載する
　修正方針の出力ファイルパス(Step8):（例: {bugfix_dir}/fix-plan.md）
・本スキルディレクトリの `bugfix-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"修正方針策定エージェントの出力(Step8):"として記載する

### 完了条件
fs-bugfix-phase1-report.txtの修正方針策定エージェントの出力(Step8)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{bugfix_dir}/fix-plan.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep9へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step9 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-bugfix-phase1-report.txtの修正方針策定エージェントの出力(Step8)のステータスがNEEDS_CONTEXT の場合、不足情報を補い `bugfix-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 9: 修正方針のレビュー

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `bugfix-plan-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"修正方針レビューエージェントの出力(Step9):"として記載する。その記載内容から、次の項目を判断して記載する
　レビュー結果(Step9):（PASS / FAIL）

### 完了条件
fs-bugfix-phase1-report.txtの修正方針レビューエージェントの出力(Step9)の内容を確認し、"レビュー結果(Step9)"が PASS である

### 状態判定
- 完了条件を満たしていればStep10へ遷移する
- fs-bugfix-phase1-report.txtの"レビュー結果(Step9)"が FAIL の場合、指摘内容を補い `bugfix-planner-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して fix-plan.md を修正し、再度 Step9 へ

## Step 10: 修正方針のユーザー承認

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{bugfix_dir}/fix-plan.md の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　修正方針承認のユーザー判断(Step10):
　修正方針の修正回数(Step10):
　修正方針の修正内容要約(Step10):

### 完了条件
fs-bugfix-phase1-report.txtの"修正方針承認のユーザー判断(Step10)"が承認である

### 状態判定
- 完了条件を満たしていれば後処理へ遷移する
- fs-bugfix-phase1-report.txtの"修正方針承認のユーザー判断(Step10)"が修正要求の場合、`bugfix-planner-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step9 へ戻る

## 後処理

### 成果物
fs-bugfix-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{bugfix_dir}/bugfix-progress.md`（Step 7 で確定した bugfix_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（本後処理は通常完了パターン＝`A:通常完了` でのみ到達・実行される。`B:設計書ゲートFAIL` は Step3 で後処理を経由せずワークフローを終了し、その時点でレポートの「完了ステータス(後処理):」に記載済みである）
・次フェーズ遷移先(後処理):

### 完了条件
fs-bugfix-phase1-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-bugfix-phase1-report.txtの"完了ステータス(後処理):"を確認したら `fs-bugfix-phase2-impl (aide-powers skill)` を activate して実行する

注: バグ修正ワークフローでは最終フェーズの進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-bugfix-phase2-impl (aide-powers skill)`

**Called by:** バグ修正ワークフロー（最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-gate (aide-powers skill)` — Step 3
- `folder-merge-check (aide-powers skill)` — Step 7（起因元フォルダがある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `bugfix-reporter-prompt.md` — Step 1（mode: create / fix）
- `bugfix-investigator-prompt.md` — Step 4（再現性確認・原因特定）
- `bugfix-analyzer-prompt.md` — Step 5（mode: create / fix）
- `bugfix-planner-prompt.md` — Step 8（mode: create / fix）
- `bugfix-plan-reviewer-prompt.md` — Step 9

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーの最初の発言（バグ報告の内容）

**Output to next phase:**
- `bugfix_dir`: 確定した bugfix_dir

**設計書ゲート FAIL 時:**
- `fs-reverse-phase1-program (aide-powers skill)` を案内

**Global rules:** `.aide/references/global-rules.md` を厳守
