---
name: fs-refactoring-phase7-final-check
description: "Use when refactoring workflow's phase 6 (doc sync) is complete. Final integrity check of the entire workflow execution."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fs-refactoring-phase7-report.txt | .aide/tmp/fs-refactoring-phase7-report.txt | fs-refactoring-phase7-final-checkの実行レポート |

注: 本フェーズは検証のみで設計・実装の成果物は作成しない。進捗ファイル（{refactoring_dir}/refactoring-progress.md）の最終フェーズ行更新は progress-final-checker が行う。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。

- **検証は委譲**: 本スキル自体は進捗確認・進捗更新の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は progress-final-checker が行う。本スキルから phase-report-check (write) を呼び出してはならない。自フェーズのステータス更新は行わない（ただし `fix_open` / `fix_close` モードの呼び出しは許可される。これらは write ではなく、進捗表への修正起票/クローズを行うものである）
- **一時ファイル（レポート）の確実な削除**: 検証完了後（PASS の場合）、本ワークフローのフェーズレポート `.aide/tmp/fs-refactoring-phase*-report.txt` を確実に削除する。加えて想定外残ファイルはユーザー確認の上で削除する。残存させると `.aide/tmp/` が散らかり、次回ワークフロー実行時の混乱の原因となる
- **FAIL 時の修正起票**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase について `phase-report-check (fix_open)` で修正起票する（進捗表の該当フェーズ行を 🔧 修正中 にする）。⬜ 未着手 へのリセットは行わない（完了実績が失われるため）
- **中止モード**: mode=abort で起動された場合は、ユーザー確認のうえ作業成果物を削除して終了する。src/ 配下等の実コードは自動削除しない

# レポート運用ルール

fs-refactoring-phase7-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase7-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `想定外残ファイルの有無と対応(Step2): なし（想定外ファイル0件）`）
- 本フェーズの自レポート（fs-refactoring-phase7-report.txt）は、後処理の最終アクションで削除する。それまでは生かして更新し続ける
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

**実行モード判定（最初に必ず実施）**: 起動パラメータに `mode=abort` が渡された場合、以下の通常前処理項目および Step1・Step2 をスキップし、後述の「## 中止クリーンアップ（mode=abort 時）」へ直行する。`mode` 未指定（通常起動）の場合は以下の前処理を従来どおり実行する。

### 成果物
fs-refactoring-phase7-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase7-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
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
fs-refactoring-phase7-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 直前フェーズが正常に完了していない可能性がある。現フェーズの実行を阻止し、直前フェーズを前処理からやり直すことを前提に、その旨をユーザーに確認する。最終的な対応方針はユーザーが決定する（後段の遷移には進まない）
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号＝7）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号＝N>7）→ phase7 は最終フェーズのため通常発生しない（万一検出した場合はユーザーに報告する）
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-refactoring-phase6-doc (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了
　（上記いずれの異常もなく新規実行の場合は Step1 へ遷移する）

## 中止クリーンアップ（mode=abort 時）

このセクションは前処理の「実行モード判定」で `mode=abort` と判定された場合にのみ実行する。通常起動（mode 未指定）では実行しない。通常の前処理・Step1・Step2・通常の後処理は実行しない。任意フェーズでのユーザー中止、または明示的中止Step（phase3 Step2 / phase4 Step2 のリファクタリング中止）から本フェーズが mode=abort で起動された場合に到達する。

### 成果物
fs-refactoring-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:（中止クリーンアップ）
・中止理由(中止クリーンアップ):（起動時に渡された abort_reason をそのまま記載する）
・進捗確認スキップの確認(中止クリーンアップ):（フェーズ未完了のため progress-final-checker による進捗確認は実行しない旨を記載する）
・本WFの作業成果物を列挙した結果(中止クリーンアップ):（削除候補として、作業フォルダ {refactoring_dir} 配下のファイル・本WFのフェーズレポート `.aide/tmp/fs-refactoring-phase*-report.txt`・進捗ファイル {refactoring_dir}/refactoring-progress.md・タスクリスト・ドラフト設計書（refactoring-plan.md / refactoring-design.md / delta-{領域名}.md 等）を列挙する。src/ 配下等の実コードは削除候補に含めない）
・ユーザーへの削除可否確認(中止クリーンアップ):（上記列挙を提示し、番号付き選択肢「1. すべて削除 / 2. 一部を残す（指定） / 3. 削除しない / 4. その他（自由記述）」で確認する。**src/ 配下等の実コードは自動削除しない。削除はユーザーが確認したものに限る**）
　中止削除のユーザー選択結果(中止クリーンアップ):
・削除した成果物(中止クリーンアップ):（ユーザー選択に従って実際に削除したファイル一覧。削除しない選択の場合はその旨と理由を記載する。実コードを自動削除していないことを明記する）
・git status 確認結果(中止クリーンアップ):（前フェーズで既にコミット済みの成果物を削除した等によりコミットが必要か否かを判定した結果）
・コミットが必要な場合は git-commit-workflow (aide-powers skill) を activate して実行し、出力を"git-commit-workflowの出力(中止クリーンアップ):"として記載する。コミットメッセージに abort_reason を含める。不要な場合は「不要（理由）」と記載する
　git-commit-workflowの出力(中止クリーンアップ):
・中止時コミット(中止クリーンアップ):（上記git-commit-workflowの出力から判断したコミット結果。不要な場合は「不要（理由）」と記載する）

### 完了条件
fs-refactoring-phase7-report.txt に、中止理由(中止クリーンアップ)・削除した成果物(中止クリーンアップ)・中止時コミット(中止クリーンアップ)を含む上記項目が記載され、ユーザー確認のうえで成果物の削除（またはユーザー判断による不削除）が完了している

### 状態判定
完了条件を満たしたら、最終アクションとして本WFのフェーズレポート `.aide/tmp/fs-refactoring-phase*-report.txt` を削除し、abort_reason と削除内容をユーザーに報告してリファクタリングワークフローを中止終了する（Step1・Step2・通常の後処理には進まない）

## Step 1: 全前フェーズの進捗確認と進捗ファイル更新

### 成果物
fs-refactoring-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動し、出力を"progress-final-checkerの出力(Step1):"として記載する。呼び出し時に次を渡す: workflow_name=`refactoring`, total_phases=`6`（自フェーズを除く前フェーズの番号範囲の最大値。検証ループは 1〜total_phases を走査する）, skipped_phases=`[]`（全前フェーズが実行・完了される。引き継ぎ経路でも phase2 は素通りで通過し ✅完了・完了記録ありとなるため、スキップ前フェーズはない）, progress_file_path=`{refactoring_dir}/refactoring-progress.md`。progress-final-checker は 1〜total_phases の全前フェーズが ✅ 完了 であることを確認し、全て正当かつ全て ✅ 完了 なら自フェーズを ✅ 完了 に更新する。その記載内容から、次の項目を判断して記載する
　進捗確認結果(Step1):（PASS / FAIL）
　problem_phase(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　FAIL理由(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　自フェーズステータス更新(Step1):（✅ 完了 に更新済み / 未更新（FAIL のため））
　修正起票結果(fix_id)(Step1):（FAIL 時のみ。PASS 時は "N/A（PASS）"）
　修正履歴クローズ結果(Step1):（PASS 時。修正中エントリがなければ N/A）

> **設計意図（phase2 素通り方針）:** 旧方針では引き継ぎ経路で phase2（候補特定）を実行せず完了記録が欠落するため、skipped_phases=`[2]` で phase2 を検証対象から除外していた。新方針では引き継ぎ経路でも phase2 を「素通り通過」（前処理→即後処理（完了記録のみ））させるため、phase2 は通常起動・引き継ぎ経路のいずれでも必ず ✅完了・完了記録ありとなる。したがって全前フェーズ（1〜6）が連続して完了記録される状態が常に保証され、skipped_phases による特殊処理は不要となる。total_phases=`6`（前フェーズ番号の最大値）・skipped_phases=`[]` の単純な連続走査で、両経路とも final-check が正しく PASS 判定できる。

### 完了条件
fs-refactoring-phase7-report.txtに、progress-final-checker を実行して得た進捗確認結果(Step1)（PASS / FAIL）が記載されている

### 状態判定
完了条件を満たし、fs-refactoring-phase7-report.txtの"進捗確認結果(Step1):"を確認する:

- **PASS の場合**（progress-final-checker が自フェーズを ✅ 完了 に更新済み）:
  - 本WFの進捗ファイルの「## 修正履歴」に 🔧 修正中 のエントリがあれば、各 fix_id について `phase-report-check (aide-powers skill: fix_close)` を activate して実行し、出力を"phase-report-check(fix_close)の出力(Step1):"として記載する。✅ 修正完了 にする
  - 結果を "修正履歴クローズ結果(Step1):" に記載する（🔧 修正中 エントリがなければ "N/A（修正なし）"）
  - その後 Step2 へ遷移する
- **FAIL の場合**:
  - ユーザーに問題内容（problem_phase(Step1) / FAIL理由(Step1)）を通知し、ユーザーの承認を得る
  - problem_phase について `phase-report-check (aide-powers skill: fix_open)` を activate して実行し、出力を"phase-report-check(fix_open)の出力(Step1):"として記載する（引数: progress_file_path=`{refactoring_dir}/refactoring-progress.md`, fix_phase=problem_phase, fix_reason=FAIL理由, fix_content=要修正内容, requester_skill_name=本フェーズのスキル名）
  - 返り値の fix_id を "修正起票結果(fix_id)(Step1):" に記載したうえで、problem_phase のフェーズスキルに制御を戻す（⬜ 未着手 リセットはしない。後段の遷移には進まない）

## Step 2: 想定外残ファイルの確認

### 成果物
fs-refactoring-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/tmp/` 配下に残っているファイルを一覧取得し、本ワークフローのフェーズレポート（`fs-refactoring-phase*-report.txt`）以外の「想定外ファイル」を抽出した結果を記載する。想定外ファイルが1件以上ある場合はユーザーへ一覧（ファイル名・サイズ等）を提示し、番号付き選択肢（1. すべて削除する / 2. 残置する / 3. その他（自由記述））で削除可否を確認し、選択に従って処理する
　想定外残ファイルの有無と対応(Step2):（なし（0件） / あり → ユーザー確認結果と処理内容）

注: 本ステップでは本ワークフローのフェーズレポート（`fs-refactoring-phase1-report.txt` 〜 `fs-refactoring-phase6-report.txt` / 自フェーズの `fs-refactoring-phase7-report.txt`）は削除しない。これらの削除は後処理の最終アクションでまとめて行う（自レポートは後処理完了まで生かす必要があるため）。本確認は検証フロー（Step 1）の判定結果に一切影響しない。

### 完了条件
fs-refactoring-phase7-report.txtに、想定外残ファイルの有無と対応(Step2)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-refactoring-phase7-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。リファクタリングワークフロー全フェーズの成果物（前フェーズ phase6 までの doc-sync 反映・doc-index 更新を含む）と、本フェーズ Step1 で progress-final-checker が更新した進捗表の最終状態（最終フェーズ ✅完了）をまとめてコミットする（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　最終進捗更新のコミット結果(後処理):
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（リファクタリングワークフロー最終フェーズ））

注: 本フェーズの git-commit-workflow が、リファクタリングワークフロー唯一のコミットである（まとめコミット型）。**progress-final-checker（Step1）が進捗表の最終フェーズ行を ✅完了 に更新した後にコミットすることで、進捗表の最終状態がコミットに含まれる。** doc-index-maintenance / user-profile-management(update) は前フェーズ fs-refactoring-phase6-doc で実施済みのため本フェーズでは呼ばない。pending-issues-management は本フェーズの後処理でコミット完了後に実行する（WF実行中の書き込み忘れ最終確認と既存issues提示のため）。phase-report-check (write) は実行しない（progress-final-checker がステータス更新を行う）。

### 完了条件
fs-refactoring-phase7-report.txtに、git-commit-workflow を実行して得た最終進捗更新のコミット結果(後処理) / pending-issues-management(check)の出力(後処理) / pending-issues-management(present)の出力(後処理) と完了ステータス(後処理)が記載され、コミットが完了している

### 状態判定
完了条件を満たし、fs-refactoring-phase7-report.txtの"完了ステータス(後処理):"を確認したら、最終アクションとして本ワークフローのフェーズレポート `.aide/tmp/fs-refactoring-phase1-report.txt` 〜 `.aide/tmp/fs-refactoring-phase6-report.txt` および `.aide/tmp/fs-refactoring-phase7-report.txt` を削除し、リファクタリングワークフローを終了する（次フェーズなし）

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill: verify)` — 前処理（verify のみ。write は呼ばない）

**次フェーズ:** なし（リファクタリングワークフロー最終フェーズ）

**Called by:**
- `fs-refactoring-phase6-doc (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-refactoring-phase7-final-check`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill: apply)` — 前処理
- `git-commit-workflow (aide-powers skill)` — 後処理（リファクタリングWF唯一のまとめコミット。progress-final-checker の最終進捗更新後に実行）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）

**呼び出す名前付きエージェント:**
- `progress-final-checker (aide-powers agent)` — Step 1（全前フェーズの進捗確認と進捗ファイル更新）。通常起動・引き継ぎ経路のいずれも skipped_phases=`[]` を渡し全6前フェーズを検証する（引き継ぎ経路でも phase2 は素通りで通過し ✅完了・完了記録ありとなるため、スキップ前フェーズはない）

**Input from caller:**
- `refactoring_dir`: 確定済みの refactoring_dir
- `doc_index_path`: doc-index.md のパス
- `mode`: 任意。`abort` を渡すと中止モードで起動する（通常前処理・Step1 をスキップし「中止クリーンアップ」へ直行する）
- `abort_reason`: 中止モード時に渡される中止理由

**Global rules:** `.aide/references/global-rules.md` を厳守
