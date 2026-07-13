---
name: fs-design-phase11-final-check
description: "Use when design workflow's phase 10 (program structure) is complete. Final integrity check of the entire workflow execution."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fs-design-phase11-report.txt | .aide/tmp/fs-design-phase11-report.txt | fs-design-phase11-final-checkの実行レポート |

注: 本フェーズは検証のみで設計の成果物は作成しない。進捗ファイル（{specs_dir}/design-progress.md）の最終フェーズ行更新は progress-final-checker が行う。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。

- **検証は委譲**: 本スキル自体は進捗確認・進捗更新の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は progress-final-checker が行う。本スキルから phase-report-check (write) を呼び出してはならない。自フェーズのステータス更新は行わない（ただし `fix_open` / `fix_close` モードの呼び出しは許可される。これらは write ではなく、進捗表への修正起票/クローズを行うものである）
- **一時ファイル（レポート）の確実な削除**: 検証完了後（PASS の場合）、本ワークフローのフェーズレポート `.aide/tmp/fs-design-phase*-report.txt` を確実に削除する。加えて想定外残ファイルはユーザー確認の上で削除する。残存させると `.aide/tmp/` が散らかり、次回ワークフロー実行時の混乱の原因となる
- **FAIL 時の修正起票**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase について `phase-report-check (fix_open)` で修正起票する（進捗表の該当フェーズ行を 🔧 修正中 にする）。⬜ 未着手 へのリセットは行わない（完了実績が失われるため）
- **中止モード**: mode=abort で起動された場合は、ユーザー確認のうえ作業成果物を削除して終了する。src/ 配下等の実コードは自動削除しない

# レポート運用ルール

fs-design-phase11-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase11-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `想定外残ファイルの有無と対応: なし（想定外ファイル0件）`）
- 本フェーズの自レポート（fs-design-phase11-report.txt）は、後処理の最終アクションで削除する。それまでは生かして更新し続ける
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

**実行モード判定（前処理の冒頭・最初に行う）:** 起動パラメータに `mode=abort`（abort_reason 付き）が渡された場合、本フェーズは中止モードで動作する。この場合、以下の通常の前処理（progress-resume-check / phase-report-check(verify) / user-profile-management(apply) 等）と Step1（progress-final-checker による進捗確認）をスキップし、「## 中止クリーンアップ（mode=abort 時）」へ直行する。`mode` 未指定（通常起動）の場合は従来どおり以下の前処理を実行する。

### 成果物
fs-design-phase11-report.txt

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
・下記「状態判定」の Step途中再開判定の結果を記載する
　再開Step(前処理):

### 完了条件
fs-design-phase11-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 直前フェーズが正常に完了していない可能性がある。現フェーズの実行を阻止し、直前フェーズを前処理からやり直すことを前提に、その旨をユーザーに確認する。最終的な対応方針はユーザーが決定する（後段の遷移には進まない）
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 11）
　・`START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase10-program (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==11、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N<11、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase10-program (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了
　（本フェーズは設計ワークフロー最終フェーズのため、N>11 の後続フェーズは存在しない）

**Step途中再開判定（本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase11-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する。

## 中止クリーンアップ（mode=abort 時）

前処理の「実行モード判定」で mode=abort と判定された場合のみ実行する（通常起動ではスキップ）。通常の前処理（progress-resume-check / phase-report-check(verify) 等）と Step1（progress-final-checker による進捗確認）は実行しない。

### 成果物
fs-design-phase11-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:（中止クリーンアップ）
・中止理由(中止クリーンアップ):（起動時に渡された abort_reason をそのまま記載する）
・進捗確認（progress-final-checker）は実行しない（フェーズ未完了のため）。この方針をレポートに明記する
・本WFの作業成果物を列挙し、削除候補としてユーザーに提示する（本WFのフェーズレポート `.aide/tmp/fs-design-phase*-report.txt`、進捗ファイル `{specs_dir}/design-progress.md`、本WFが `{specs_dir}` 配下に作成した設計ドキュメント群等の成果物）。**`src/` 配下等の実装コードは自動削除しない**（削除はユーザーが確認したものに限る）
・番号付き選択肢（1. すべて削除する / 2. 一部を残す（指定） / 3. 削除しない / 4. その他（自由記述））でユーザーに確認し、選択に従って成果物を削除する
　削除した成果物(中止クリーンアップ):（実際に削除したファイル/フォルダの一覧。削除なしの場合は「なし（ユーザー選択: ...）」）
・git status を確認し、コミットが必要なら（各フェーズコミット型では前フェーズが既にコミット済みのため、成果物削除を記録するコミットが必要な場合が多い）git-commit-workflow (aide-powers skill) を実行し、出力を"git-commit-workflowの出力(中止クリーンアップ):"として記載する（コミットメッセージに abort_reason を含める）。不要ならスキップする
　中止時コミット(中止クリーンアップ):（コミット結果。スキップした場合はその理由）

### 完了条件
fs-design-phase11-report.txtに、中止理由(中止クリーンアップ)・削除した成果物(中止クリーンアップ)・中止時コミット(中止クリーンアップ)が記載され、ユーザー確認に基づく成果物削除と（必要なら）コミットが完了している

### 状態判定
完了条件を満たしたら、最終アクションとして本WFのフェーズレポート `.aide/tmp/fs-design-phase*-report.txt`（自フェーズの fs-design-phase11-report.txt を含む）をグロブで一括削除し、abort_reason と削除内容をユーザーに報告して設計ワークフローを中止終了する（次フェーズなし。通常完了フローには進まない）

## Step 1: 全前フェーズの進捗確認と進捗ファイル更新

### 成果物
fs-design-phase11-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動し、出力を"progress-final-checkerの出力(Step1):"として記載する。呼び出し時に次を渡す: workflow_name=`design`, total_phases=`10`（自フェーズを除く前フェーズ数）, progress_file_path=`{specs_dir}/design-progress.md`。progress-final-checker は全前フェーズが ✅ 完了 であることを確認し、自フェーズを ✅ 完了 に更新する。その記載内容から、次の項目を判断して記載する
　検証結果(Step1):（PASS / FAIL）
　problem_phase(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　FAIL理由(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　自フェーズステータス更新(Step1):（✅ 完了 に更新済み / 未更新（FAIL のため））
　修正起票結果(fix_id)(Step1):（FAIL 時のみ。PASS 時は "N/A（PASS）"）
　修正履歴クローズ結果(Step1):（PASS 時。修正中エントリがなければ N/A）

### 完了条件
fs-design-phase11-report.txtに、progress-final-checker を実行して得た検証結果(Step1)（PASS / FAIL）が記載されている

### 状態判定
完了条件を満たしたうえで、fs-design-phase11-report.txtの"検証結果(Step1):"を確認する:

・PASS の場合（progress-final-checker が自フェーズを ✅ 完了 に更新済み）→ 本WFの進捗ファイル（`{specs_dir}/design-progress.md`）の「## 修正履歴」に 🔧 修正中 のエントリがあれば、各 fix_id について `phase-report-check (aide-powers skill: fix_close)` を activate して実行し、出力を"phase-report-check(fix_close)の出力(Step1):"として記載する。✅ 修正完了 にする。結果を "修正履歴クローズ結果(Step1):" に記載する（🔧 修正中 エントリがなければ "N/A（修正なし）"）。その後 Step2 へ遷移する
・FAIL の場合 → ユーザーに問題内容（problem_phase / FAIL理由）を通知し、ユーザーの承認を得て、problem_phase について `phase-report-check (aide-powers skill: fix_open)` を activate して実行し、出力を"phase-report-check(fix_open)の出力(Step1):"として記載する（引数: progress_file_path=`{specs_dir}/design-progress.md`, fix_phase=problem_phase, fix_reason=FAIL理由, fix_content=要修正内容, requester_skill_name=本フェーズのスキル名）。返り値の fix_id を "修正起票結果(fix_id)(Step1):" に記載したうえで、problem_phase のフェーズスキルに制御を戻す（⬜ 未着手 リセットはしない。後段の遷移には進まない）

## Step 2: 想定外残ファイルの確認

### 成果物
fs-design-phase11-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/tmp/` 配下に残っているファイルを一覧取得し、本ワークフローのフェーズレポート（`fs-design-phase*-report.txt`）以外の「想定外ファイル」を抽出した結果を記載する。想定外ファイルが1件以上ある場合はユーザーへ一覧（ファイル名・サイズ等）を提示し、番号付き選択肢（1. すべて削除する / 2. 残置する / 3. その他（自由記述））で削除可否を確認し、選択に従って処理する
　想定外残ファイルの有無と対応(Step2):（なし（0件） / あり → ユーザー確認結果と処理内容）

注: 本ステップでは本ワークフローのフェーズレポート（グロブ `fs-design-phase*-report.txt` にマッチする全 design フェーズレポート。自フェーズの `fs-design-phase11-report.txt` を含む）は削除しない。これらの削除は後処理の最終アクションでまとめて行う（自レポートは後処理完了まで生かす必要があるため）。本確認は検証フロー（Step 1）の判定結果に一切影響しない。

### 完了条件
fs-design-phase11-report.txtに、想定外残ファイルの有無と対応(Step2)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-design-phase11-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。設計ワークフロー最終フェーズの最終進捗更新（progress-final-checker による最終フェーズ行 ✅ 完了）を含めてコミットする（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（設計ワークフロー最終フェーズ））

注: phase-report-check (write) は実行しない（progress-final-checker がステータス更新を行う）。

### 完了条件
fs-design-phase11-report.txtに、doc-index-maintenanceの出力(後処理) / user-profile-management(update)の出力(後処理) / git-commit-workflowの出力(後処理) / pending-issues-management(check)の出力(後処理) / pending-issues-management(present)の出力(後処理) を実行して得た項目と完了ステータス(後処理)が記載され、コミットが完了している

### 状態判定
完了条件を満たし、fs-design-phase11-report.txtの"完了ステータス(後処理):"を確認したら、最終アクションとして本ワークフローのフェーズレポートをグロブ `.aide/tmp/fs-design-phase*-report.txt` で全 design フェーズレポート（phase1〜phase11。フェーズによりサフィックスが異なる実ファイル名 — 例: `fs-design-phase6-usecase-report.txt` / `fs-design-phase7-ddd-report.txt` / `fs-design-phase9-infra-report.txt` / `fs-design-phase10-program-report.txt` 等 — を含む。自フェーズの `fs-design-phase11-report.txt` を含む）を一括削除し、設計ワークフローを終了する（次フェーズなし）。個別ファイル名の列挙はせず、グロブで全件削除すること（実ファイル名のサフィックス差異による削除漏れ防止）

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill: verify)` — 前処理（verify のみ。write は呼ばない）

**前フェーズ:** fs-design-phase10-program (aide-powers skill)

**次フェーズ:** なし（設計ワークフロー最終フェーズ。完全性チェック後、実装ワークフローへ案内）

**Called by:**
- `fs-design-phase10-program (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-design-phase11-final-check`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（最終進捗更新後のコミット。設計WFは各フェーズコミット型のため、最終フェーズ行 ✅ 完了 の取りこぼし防止に必須）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）

**呼び出す名前付きエージェント:**
- `progress-final-checker (aide-powers agent)` — Step 1（全前フェーズの進捗確認と進捗ファイル更新）

**Input from caller:**
- `feature_name`: プロジェクト名
- `specs_dir`: `.aide/specs/{feature_name}`
- `doc_index_path`: doc-index.md のパス
- `mode`: 任意。`abort` で中止モード（未指定なら通常モード）
- `abort_reason`: 中止モード時の中止理由

**Global rules:** `.aide/references/global-rules.md` を厳守
