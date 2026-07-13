---
name: fs-impl-phase7-final-check
description: "Use when implementation workflow's phase 6 (doc generation) is complete. Final integrity check of the entire workflow execution."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fs-impl-phase7-report.txt | .aide/tmp/fs-impl-phase7-report.txt | fs-impl-phase7-final-checkの実行レポート |

注: 本フェーズは検証のみで設計・実装の成果物は作成しない。進捗ファイル（`.aide/specs/{feature_name}/impl-progress.md`）の最終フェーズ行更新は progress-final-checker が行う。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase7-report.txt以外のファイルの書き出しは禁止。

- **検証は委譲**: 本スキル自体は進捗確認・進捗更新の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は progress-final-checker が行う。本スキルから phase-report-check (write) を呼び出してはならない。自フェーズのステータス更新は行わない（ただし `fix_open` / `fix_close` モードの呼び出しは許可される。これらは write ではなく、進捗表への修正起票/クローズを行うものである）
- **gitコミット忘れ禁止**: 実装ワークフローは各フェーズコミット型である。後処理で `git-commit-workflow (aide-powers skill)` を、progress-final-checker による進捗ファイルの最終更新（最終フェーズ行 ✅ 完了）の**後**に必ず実行する。これを省略してフェーズを終了してはならない（最終進捗更新のコミット取りこぼし防止）
- **一時ファイル（レポート）の確実な削除**: 検証完了後（PASS の場合）、本ワークフローのフェーズレポート `.aide/tmp/fs-impl-phase*-report.txt` を確実に削除する。加えて想定外残ファイルはユーザー確認の上で削除する。残存させると `.aide/tmp/` が散らかり、次回ワークフロー実行時の混乱の原因となる
- **FAIL 時の修正起票**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase について `phase-report-check (fix_open)` で修正起票する（進捗表の該当フェーズ行を 🔧 修正中 にする）。⬜ 未着手 へのリセットは行わない（完了実績が失われるため）
- **中止モード**: mode=abort で起動された場合は、ユーザー確認のうえ作業成果物を削除して終了する。src/ 配下等の実コードは自動削除しない

# レポート運用ルール

fs-impl-phase7-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase7-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `想定外残ファイルの有無と対応(Step2): なし（想定外ファイル0件）`）
- 本フェーズの自レポート（fs-impl-phase7-report.txt）は、後処理の最終アクションで削除する。それまでは生かして更新し続ける
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

**実行モード判定（前処理の冒頭・最初に行う）:** 起動パラメータに `mode=abort`（abort_reason 付き）が渡された場合、本フェーズは中止モードで動作する。この場合、以下の通常の前処理（progress-resume-check / phase-report-check(verify) / user-profile-management(apply) 等）と Step1（progress-final-checker による進捗確認）をスキップし、「## 中止クリーンアップ（mode=abort 時）」へ直行する。`mode` 未指定（通常起動）の場合は従来どおり以下の前処理を実行する。

### 成果物
fs-impl-phase7-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase7-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。本フェーズは Step1 のみのため再開 Step は Step1 となる。判定結果を次の項目で記載する
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
fs-impl-phase7-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

- FAIL の場合 → 直前フェーズが正常に完了していない可能性がある。現フェーズの実行を阻止し、直前フェーズを前処理からやり直すことを前提に、その旨をユーザーに確認する。最終的な対応方針はユーザーが決定する（後段の遷移には進まない）
- PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
  - `RESUME_FROM N`（N==本フェーズ番号=7）→ 本フェーズを実行する（Step1 へ遷移する。本フェーズは Step1 のみのため再開 Step は Step1 固定）
  - `RESUME_FROM N`（N>7）→ 本フェーズは最終フェーズのため発生しない（万一検出時はユーザーに報告）
  - `RESUME_FROM N`（N<本フェーズ番号=7）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
  - `START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-impl-phase6-doc-generation (aide-powers skill)` に差し戻す
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## 中止クリーンアップ（mode=abort 時）

前処理の「実行モード判定」で mode=abort と判定された場合のみ実行する（通常起動ではスキップ）。通常の前処理（progress-resume-check / phase-report-check(verify) 等）と Step1（progress-final-checker による進捗確認）は実行しない。

### 成果物
fs-impl-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:（中止クリーンアップ）
・中止理由(中止クリーンアップ):（起動時に渡された abort_reason をそのまま記載する）
・進捗確認（progress-final-checker）は実行しない（フェーズ未完了のため）。この方針をレポートに明記する
・本WFの作業成果物を列挙し、削除候補としてユーザーに提示する（本WFのフェーズレポート `.aide/tmp/fs-impl-phase*-report.txt`、進捗ファイル `.aide/specs/{feature_name}/impl-progress.md`、本WFが作成した設計ドキュメント/タスクリスト等の成果物）。**`src/` 配下等の実装コードは自動削除しない**（中止時も実コードは保持し、削除はユーザーが確認したものに限る）
・番号付き選択肢（1. すべて削除する / 2. 一部を残す（指定） / 3. 削除しない / 4. その他（自由記述））でユーザーに確認し、選択に従って成果物を削除する
　削除した成果物(中止クリーンアップ):（実際に削除したファイル/フォルダの一覧。削除なしの場合は「なし（ユーザー選択: ...）」）
・git status を確認し、コミットが必要なら（各フェーズコミット型では前フェーズが既にコミット済みのため、成果物削除を記録するコミットが必要な場合が多い）git-commit-workflow (aide-powers skill) を activate して実行し、出力を"git-commit-workflowの出力(中止クリーンアップ):"として記載する（コミットメッセージに abort_reason を含める）。不要ならスキップする。その記載内容から、次の項目を判断して記載する
　中止時コミット(中止クリーンアップ):（コミット結果。スキップした場合はその理由）

### 完了条件
fs-impl-phase7-report.txtに、中止理由(中止クリーンアップ)・削除した成果物(中止クリーンアップ)・中止時コミット(中止クリーンアップ)が記載され、ユーザー確認に基づく成果物削除と（必要なら）コミットが完了している

### 状態判定
完了条件を満たしたら、最終アクションとして以下を実行する:

- 本WFのフェーズレポート `.aide/tmp/fs-impl-phase*-report.txt`（自フェーズの fs-impl-phase7-report.txt を含む）を削除する
- abort_reason と削除内容をユーザーに報告して実装ワークフローを中止終了する（次フェーズなし。通常完了フローには進まない）

## Step 1: 全前フェーズの進捗確認と進捗ファイル更新

### 成果物
fs-impl-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動し、出力を"progress-final-checkerの出力(Step1):"として記載する。呼び出し時に次を渡す: workflow_name=`impl`, total_phases=`6`（自フェーズを除く前フェーズ数）, progress_file_path=`.aide/specs/{feature_name}/impl-progress.md`。progress-final-checker は全前フェーズが ✅ 完了 であることを確認し、自フェーズを ✅ 完了 に更新する。その記載内容から、次の項目を判断して記載する
　進捗確認結果(Step1):（PASS / FAIL）
　problem_phase(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　FAIL理由(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　自フェーズステータス更新(Step1):（✅ 完了 に更新済み / 未更新（FAIL のため））
　修正起票結果(fix_id)(Step1):（FAIL 時のみ。PASS 時は "N/A（PASS）"）
　修正履歴クローズ結果(Step1):（PASS 時。修正中エントリがなければ N/A）

### 完了条件
fs-impl-phase7-report.txtに、progress-final-checker を実行して得た進捗確認結果(Step1)（PASS / FAIL）が記載されている

### 状態判定
完了条件を満たし、fs-impl-phase7-report.txtの"進捗確認結果(Step1)"を確認する。

- PASS の場合（progress-final-checker が自フェーズを ✅ 完了 に更新済み）→ 本WFの進捗ファイルの「## 修正履歴」に 🔧 修正中 のエントリがあれば、各 fix_id について `phase-report-check (aide-powers skill: fix_close)` を activate して実行し ✅ 修正完了 にする。結果を "修正履歴クローズ結果(Step1):" に記載する（🔧 修正中 エントリがなければ "N/A（修正なし）"）。その後 Step2 へ遷移する
- FAIL の場合 → ユーザーに問題内容（problem_phase(Step1) / FAIL理由(Step1)）を通知し、ユーザーの承認を得て、problem_phase について `phase-report-check (aide-powers skill: fix_open)` を activate して実行する（引数: progress_file_path=`.aide/specs/{feature_name}/impl-progress.md`, fix_phase=problem_phase, fix_reason=FAIL理由, fix_content=要修正内容, requester_skill_name=本フェーズのスキル名）。返り値の fix_id を "修正起票結果(fix_id)(Step1):" に記載したうえで、problem_phase のフェーズスキルに制御を戻す（⬜ 未着手 リセットはしない。後段の遷移には進まない）

## Step 2: 想定外残ファイルの確認

### 成果物
fs-impl-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/tmp/` 配下に残っているファイルを一覧取得し、本ワークフローのフェーズレポート（`fs-impl-phase*-report.txt`）以外の「想定外ファイル」を抽出した結果を記載する。想定外ファイルが1件以上ある場合はユーザーへ一覧（ファイル名・サイズ等）を提示し、番号付き選択肢（1. すべて削除する / 2. 残置する / 3. その他（自由記述））で削除可否を確認し、選択に従って処理する
　想定外残ファイルの有無と対応(Step2):（なし（0件） / あり → ユーザー確認結果と処理内容）

注: 本ステップでは本ワークフローのフェーズレポート（`fs-impl-phase1-report.txt` 〜 `fs-impl-phase6-report.txt` / 自フェーズの `fs-impl-phase7-report.txt`）は削除しない。これらの削除は後処理の最終アクションでまとめて行う（自レポートは後処理完了まで生かす必要があるため）。本確認は検証フロー（Step 1）の判定結果に一切影響しない。

### 完了条件
fs-impl-phase7-report.txtに、想定外残ファイルの有無と対応(Step2)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-impl-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。実装ワークフローは各フェーズコミット型であり、Step1 の progress-final-checker による進捗ファイルの最終更新（最終フェーズ行 ✅ 完了）の**後**にコミットすることで、最終進捗更新の取りこぼしを防ぐ。コミット対象は進捗ファイル `.aide/specs/{feature_name}/impl-progress.md` の最終更新（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　最終進捗更新のコミット結果(後処理):
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（実装ワークフロー最終フェーズ））

注: phase-report-check (write) は実行しない。自フェーズのステータス更新は行わない（progress-final-checker がステータス更新を行う）。doc-index-maintenance / user-profile-management(update) は本フェーズの後処理では実行しない（実装ワークフローでは前フェーズ fs-impl-phase6-doc-generation の後処理で実施済みであり、本フェーズは進捗ファイルの最終更新とそのコミットに徹する）。pending-issues.md の有無に関わらず check は実行する（進捗ファイル遡り照合が目的）。present は pending-issues.md が存在しない場合は「未対応の問題はありません」と報告するのみ。

### 完了条件
fs-impl-phase7-report.txtに、git-commit-workflow を実行して得た最終進捗更新のコミット結果(後処理) / pending-issues-management(check)の出力(後処理) / pending-issues-management(present)の出力(後処理) と完了ステータス(後処理)が記載され、コミットが完了している

### 状態判定
完了条件を満たし、fs-impl-phase7-report.txtの"完了ステータス(後処理)"を確認したら、最終アクションとして以下を実行する:

- 本ワークフローのフェーズレポート `.aide/tmp/fs-impl-phase1-report.txt` 〜 `.aide/tmp/fs-impl-phase6-report.txt` および自フェーズの `.aide/tmp/fs-impl-phase7-report.txt` を削除する
- 実装ワークフローを終了する（次フェーズなし）

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill: verify)` — 前処理（verify のみ。write は呼ばない）

**前のフェーズスキル:**
- `fs-impl-phase6-doc-generation (aide-powers skill)`（実装ドキュメント生成）→ **fs-impl-phase7-final-check**

**次フェーズ:** なし（実装ワークフロー最終フェーズ）

**Called by:**
- `fs-impl-phase6-doc-generation (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-impl-phase7-final-check`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply)
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。progress-final-checker による最終進捗更新の後にコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）

**呼び出す名前付きエージェント:**
- `progress-final-checker (aide-powers agent)` — Step 1（全前フェーズの進捗確認と進捗ファイル更新）

**Input from caller:**
- `feature_name`: プロジェクト名
- `impl-progress.md` のパス（`.aide/specs/{feature_name}/impl-progress.md`）
- `mode`: 任意。`abort` で中止モード（未指定なら通常モード）
- `abort_reason`: 中止モード時の中止理由

**Global rules:** `.aide/references/global-rules.md` を厳守
