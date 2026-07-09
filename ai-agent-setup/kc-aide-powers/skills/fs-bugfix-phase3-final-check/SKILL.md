---
name: fs-bugfix-phase3-final-check
description: "Use when bugfix workflow's phase 2 (implementation) is complete. Final integrity check of the entire workflow execution."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| fs-bugfix-phase3-report.txt | .aide/tmp/fs-bugfix-phase3-report.txt | fs-bugfix-phase3-final-checkの実行レポート |

注: 本フェーズは検証のみで設計・実装の成果物は作成しない。進捗ファイル（{bugfix_dir}/bugfix-progress.md）の最終フェーズ行更新は progress-final-checker が行う。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。

- **検証は委譲**: 本スキル自体は進捗確認・進捗更新の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は progress-final-checker が行う。本スキルから phase-report-check (write) を呼び出してはならない。自フェーズのステータス更新は行わない（ただし `fix_open` / `fix_close` モードの呼び出しは許可される。これらは write ではなく、進捗表への修正起票/クローズを行うものである）
- **一時ファイル（レポート）の確実な削除**: 検証完了後（PASS の場合）、本ワークフローのフェーズレポート `.aide/tmp/fs-bugfix-phase*-report.txt` を確実に削除する。加えて想定外残ファイルはユーザー確認の上で削除する。残存させると `.aide/tmp/` が散らかり、次回ワークフロー実行時の混乱の原因となる
- **FAIL 時の修正起票**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase について `phase-report-check (fix_open)` で修正起票する（進捗表の該当フェーズ行を 🔧 修正中 にする）。⬜ 未着手 へのリセットは行わない（完了実績が失われるため）
- **中止モード**: mode=abort で起動された場合は、ユーザー確認のうえ作業成果物を削除して終了する。src/ 配下等の実コードは自動削除しない

# レポート運用ルール

fs-bugfix-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-bugfix-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `想定外残ファイルの有無と対応(Step2): なし（想定外ファイル0件）`）
- 本フェーズの自レポート（fs-bugfix-phase3-report.txt）は、後処理の最終アクションで削除する。それまでは生かして更新し続ける
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

**実行モード判定（最初に必ず実施）**: 起動パラメータに `mode=abort` が渡された場合、以下の通常前処理項目（progress-resume-check / phase-report-check(verify) / user-profile-management(apply) 等）および Step1（progress-final-checker による進捗確認）・Step2 をスキップし、後述の「## 中止クリーンアップ（mode=abort 時）」へ直行する。`mode` 未指定（通常起動）の場合は以下の前処理を従来どおり実行する。

### 成果物
fs-bugfix-phase3-report.txt

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
・本フェーズを `RESUME_FROM N`（N==本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（`.aide/tmp/fs-bugfix-phase3-report.txt`）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無い場合は Step1 とする。判定結果を次の項目で記載する
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
fs-bugfix-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 直前フェーズが正常に完了していない可能性がある。現フェーズの実行を阻止し、直前フェーズを前処理からやり直すことを前提に、その旨をユーザーに確認する。最終的な対応方針はユーザーが決定する（後段の遷移には進まない）
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号。本フェーズは phase3＝3）
　・`RESUME_FROM N`（N==3：本フェーズ）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>3：後続フェーズ）→ 該当フェーズスキルへ遷移する（最終フェーズのため通常該当なし）
　・`RESUME_FROM N`（N<3：前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-bugfix-phase2-impl (aide-powers skill)` に差し戻す
　・`START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-bugfix-phase2-impl (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## 中止クリーンアップ（mode=abort 時）

このセクションは前処理の「実行モード判定」で `mode=abort` と判定された場合にのみ実行する。通常起動（mode 未指定）では実行しない。進捗確認（progress-final-checker）・Step1・Step2・通常の後処理は実行しない。

### 成果物
fs-bugfix-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:（中止クリーンアップ）
・中止理由(中止クリーンアップ):（起動時に渡された abort_reason をそのまま記載する）
・進捗確認スキップの確認(中止クリーンアップ):（フェーズ未完了のため progress-final-checker による進捗確認は実行しない旨を記載する）
・本WFの作業成果物を列挙した結果(中止クリーンアップ):（削除候補として、作業フォルダ {bugfix_dir} 配下のファイル・本WFのフェーズレポート `.aide/tmp/fs-bugfix-phase*-report.txt`・進捗ファイル {bugfix_dir}/bugfix-progress.md・タスクリスト・ドラフト設計書等を列挙する。src/ 配下等の実コードは削除候補に含めない）
・ユーザーへの削除可否確認(中止クリーンアップ):（上記列挙を提示し、番号付き選択肢「1. すべて削除 / 2. 一部を残す（指定） / 3. 削除しない / 4. その他（自由記述）」で確認する。**src/ 配下等の実コードは自動削除しない。削除はユーザーが確認したものに限る**）
　中止時のユーザー選択結果(中止クリーンアップ):
・削除した成果物(中止クリーンアップ):（ユーザー選択に従って実際に削除したファイル一覧。削除しない選択の場合はその旨と理由を記載する。実コードを自動削除していないことを明記する）
・git status 確認結果(中止クリーンアップ):（前フェーズで既にコミット済みの成果物を削除した等によりコミットが必要か否かを判定した結果）
・コミットが必要な場合は git-commit-workflow (aide-powers skill) を activate して実行し、出力を"git-commit-workflowの出力(中止クリーンアップ):"として記載する。その記載内容から、次の項目を判断して記載する
　中止時コミット(中止クリーンアップ):（コミットメッセージに abort_reason を含める。不要な場合は「不要（理由）」と記載する）

### 完了条件
fs-bugfix-phase3-report.txt に、中止理由(中止クリーンアップ)・削除した成果物(中止クリーンアップ)・中止時コミット(中止クリーンアップ)を含む上記項目が記載され、ユーザー確認のうえで成果物の削除（またはユーザー判断による不削除）が完了している

### 状態判定
完了条件を満たしたら、最終アクションとして本WFのフェーズレポート `.aide/tmp/fs-bugfix-phase*-report.txt` を削除し、abort_reason と削除内容をユーザーに報告してバグ修正ワークフローを中止終了する（Step1・Step2・通常の後処理には進まない）

## Step 1: 全前フェーズの進捗確認と進捗ファイル更新

### 成果物
fs-bugfix-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動し、出力を"progress-final-checkerの出力(Step1):"として記載する。呼び出し時に次を渡す: workflow_name=`bugfix`, total_phases=`2`（自フェーズを除く前フェーズ数）, progress_file_path=`{bugfix_dir}/bugfix-progress.md`。progress-final-checker は全前フェーズが ✅ 完了 であることを確認し、自フェーズを ✅ 完了 に更新する。その記載内容から、次の項目を判断して記載する
　進捗確認結果(Step1):（PASS / FAIL）
　problem_phase(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　FAIL理由(Step1):（FAIL 時のみ。PASS 時は「N/A（PASS）」）
　自フェーズステータス更新(Step1):（✅ 完了 に更新済み / 未更新（FAIL のため））
　修正起票結果(fix_id)(Step1):（FAIL 時のみ。PASS 時は "N/A（PASS）"）
　修正履歴クローズ結果(Step1):（PASS 時。修正中エントリがなければ N/A）

### 完了条件
fs-bugfix-phase3-report.txtに、progress-final-checker を実行して得た進捗確認結果(Step1)（PASS / FAIL）が記載されている

### 状態判定
完了条件を満たし、fs-bugfix-phase3-report.txtの"進捗確認結果(Step1):"で分岐する
・PASS の場合（progress-final-checker が自フェーズを ✅ 完了 に更新済み）→ 以下を順に実行する:
　1. 本WFの進捗ファイルの「## 修正履歴」に 🔧 修正中 のエントリがあれば、各 fix_id について `phase-report-check (aide-powers skill: fix_close)` を activate して実行し、出力を"phase-report-check(fix_close)の出力(Step1):"として記載する。✅ 修正完了 にする
　2. 結果を "修正履歴クローズ結果(Step1):" に記載する（🔧 修正中 エントリがなければ "N/A（修正なし）"）
　3. Step2 へ遷移する
・FAIL の場合 → 以下を順に実行する:
　1. ユーザーに問題内容（problem_phase(Step1) / FAIL理由(Step1)）を通知し、ユーザーの承認を得る
　2. problem_phase について `phase-report-check (aide-powers skill: fix_open)` を activate して実行し、出力を"phase-report-check(fix_open)の出力(Step1):"として記載する（引数: progress_file_path=`{bugfix_dir}/bugfix-progress.md`, fix_phase=problem_phase, fix_reason=FAIL理由, fix_content=要修正内容, requester_skill_name=本フェーズのスキル名）
　3. 返り値の fix_id を "修正起票結果(fix_id)(Step1):" に記載する
　4. problem_phase のフェーズスキルに制御を戻す（⬜ 未着手 リセットはしない。後段の遷移には進まない）

## Step 2: 想定外残ファイルの確認

### 成果物
fs-bugfix-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/tmp/` 配下に残っているファイルを一覧取得し、本ワークフローのフェーズレポート（`fs-bugfix-phase*-report.txt`）以外の「想定外ファイル」を抽出した結果を記載する。想定外ファイルが1件以上ある場合はユーザーへ一覧（ファイル名・サイズ等）を提示し、番号付き選択肢（1. すべて削除する / 2. 残置する / 3. その他（自由記述））で削除可否を確認し、選択に従って処理する
　想定外残ファイルの有無と対応(Step2):（なし（0件） / あり → ユーザー確認結果と処理内容）

注: 本ステップでは本ワークフローのフェーズレポート（`fs-bugfix-phase1-report.txt` / `fs-bugfix-phase2-report.txt` / 自フェーズの `fs-bugfix-phase3-report.txt`）は削除しない。これらの削除は後処理の最終アクションでまとめて行う（自レポートは後処理完了まで生かす必要があるため）。本確認は検証フロー（Step 1）の判定結果に一切影響しない。

### 完了条件
fs-bugfix-phase3-report.txtに、想定外残ファイルの有無と対応(Step2)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-bugfix-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。バグ修正ワークフロー全体の成果物をまとめてコミットする（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（バグ修正ワークフロー最終フェーズ））

注: phase-report-check (write) は実行しない。自フェーズのステータス更新は progress-final-checker が行う。

### 完了条件
fs-bugfix-phase3-report.txtに、doc-index-maintenanceの出力(後処理) / user-profile-management(update)の出力(後処理) / git-commit-workflowの出力(後処理) / pending-issues-management(check)の出力(後処理) / pending-issues-management(present)の出力(後処理) を実行して得た項目と完了ステータス(後処理)が記載され、コミットが完了している

### 状態判定
完了条件を満たし、fs-bugfix-phase3-report.txtの"完了ステータス(後処理):"を確認したら、最終アクションとして本ワークフローのフェーズレポート `.aide/tmp/fs-bugfix-phase1-report.txt` / `.aide/tmp/fs-bugfix-phase2-report.txt` / `.aide/tmp/fs-bugfix-phase3-report.txt` を削除し、バグ修正ワークフローを終了する（次フェーズなし）

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill: verify)` — 前処理（verify のみ。write は呼ばない）

**次フェーズ:** なし（バグ修正ワークフロー最終フェーズ）

**Called by:**
- `fs-bugfix-phase2-impl (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-bugfix-phase3-final-check`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（バグ修正WF全体のコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）

**呼び出す名前付きエージェント:**
- `progress-final-checker (aide-powers agent)` — Step 1（全前フェーズの進捗確認と進捗ファイル更新）

**Input from caller:**
- `bugfix_dir`: 確定済みの bugfix_dir
- `doc_index_path`: doc-index.md のパス
- `mode`: 任意。`abort` を渡すと中止モードで起動する（通常前処理・Step1 をスキップし「中止クリーンアップ」へ直行する）
- `abort_reason`: 中止モード時に渡される中止理由

**Global rules:** `.aide/references/global-rules.md` を厳守
