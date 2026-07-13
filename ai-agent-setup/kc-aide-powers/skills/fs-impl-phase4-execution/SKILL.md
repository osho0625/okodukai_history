---
name: fs-impl-phase4-execution
description: "Use when implementation task list is ready and tasks need to be executed with the three-agent review loop"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | 設計書で定義されたパス | impl-task-list.md に基づく実装コード |
| テストコード | 設計書で定義されたパス | 各実装に対応するテストコード |
| impl-task-list.md | .aide/specs/{feature_name}/impl-task-list.md | タスクリスト（全タスク完了状態に更新） |
| impl-process-checklist.md | .aide/specs/{feature_name}/impl-process-checklist.md | 工程チェック表（1工程1行。全工程行が ✅ done／➖ skip） |
| verification-report.md | .aide/specs/{feature_name}/verification-report.md | 動作確認試験書（動作確認試験サブエージェントが出力）＋リグレッションテスト結果（リグレッションテスト実行サブエージェントが出力） |
| impl-progress.md | .aide/specs/{feature_name}/impl-progress.md | 実装ワークフローの進捗ファイル（phase-report-check が更新） |
| fs-impl-phase4-report.txt | .aide/tmp/fs-impl-phase4-report.txt | fs-impl-phase4-execution の実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase4-report.txt以外のファイルの書き出しは禁止。

- **HARD-GATE: 工程チェック表なしに実装開始禁止**: impl-process-checklist.md が存在しない状態で、いかなる実装作業（coding-test-2review の呼び出し）も開始してはならない。存在しない場合はワークフローを中断し、前の計画フェーズ `fs-impl-phase2-preparation (aide-powers skill)` に差し戻す。
- **実装系エージェントはすべて coding-test-2review 経由**: 実装・テスト・テスト実行・設計準拠レビュー・コード品質レビュー・設計同期の一切は `coding-test-2review (aide-powers skill)` への1回の呼び出しに委ねる。`micro-impl-agent` / `design-review-agent` / `code-review-agent` / `multi-stage-code-review` / `design-sync` を本スキルから直接呼び出してはならない。coding-test-2review が内部でウェーブを繰り返すため、オーケストレータ側でループしてはならない（呼び出しは1回）。
- **gitコミット忘れ禁止**: 後処理で `git-commit-workflow (aide-powers skill)` を呼ばずにフェーズを終了してはならない（実装ワークフローは各フェーズコミット型）。

# レポート運用ルール

fs-impl-phase4-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase4-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `動作確認結果(Step2): N/A（動作可能な状態に至っていないため未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase4-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase4-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
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
fs-impl-phase4-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-checkの出力(前処理) / phase-report-check(verify)の出力(前処理) / user-profile-management(apply)の出力(前処理) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する。

- **FAIL の場合** → ユーザーに即通知し、対応方針はユーザーが決定する
- **PASS の場合** → 次に "再開ポイント(前処理):" の内容で遷移先を決める
  - `RESUME_FROM N`（N==本フェーズ番号=4）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
  - `RESUME_FROM N`（N>本フェーズ番号=4）→ 該当する後続フェーズスキルへ遷移する
  - `RESUME_FROM N`（N<本フェーズ番号=4）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
  - `START_FRESH`（新規開始）→ 異常（タスクリスト・工程チェック表が未作成）。ユーザーに報告し、前フェーズスキル `fs-impl-phase2-preparation (aide-powers skill)` に差し戻す
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: タスク実装ループ（coding-test-2review 経由）

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・実装ループ開始前に、HARD-GATE として工程チェック表の存在を確認した結果を記載する
　工程チェック表存在確認(Step1):（存在する / 存在しない → ワークフロー中断し fs-impl-phase2-preparation に差し戻す）
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step1):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`.aide/specs/{feature_name}/impl-task-list.md`
　　- process_checklist_path=`.aide/specs/{feature_name}/impl-process-checklist.md`
　　- design_doc_paths=`object-design-domain.md / object-design-application.md / object-design-infrastructure.md / object-design-presentation.md / infra-interface-design.md / program-structure.md 等`（doc_index_path から特定する、実装の根拠となる設計書群）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step1):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない。依存先が全て完了したタスクから実行し、依存先のない複数タスクは複数のサブエージェントを同時に起動して並列実装する）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行（対象テスト＋全体リグレッション）→ 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で該当工程行を未PASS（⬜ todo）に戻して fix→再レビューが PASS まで回る。成果物種別（プログラム / 非プログラム）の判定と簡略サイクル（非プログラムは ➖ skip 行）、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も coding-test-2review 内部で実行される。

### 完了条件
fs-impl-phase4-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、`.aide/specs/{feature_name}/impl-task-list.md` の全タスクが完了状態に更新され、`.aide/specs/{feature_name}/impl-process-checklist.md` の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）

### 状態判定
まず "工程チェック表存在確認(Step1):" を確認する。

- **「存在しない」の場合** → ワークフローを中断し、ユーザーに「工程チェック表（impl-process-checklist.md）が存在しません。前の計画フェーズ `fs-impl-phase2-preparation (aide-powers skill)` に戻って作成してください。工程チェック表なしでの実装作業は Iron Law により絶対禁止です。」と報告して差し戻す（coding-test-2review を呼び出さない）。
- **「存在する」かつ完了条件を満たし、coding-test-2review が status: DONE を返した場合** → Step2 へ遷移する。
- **status: BLOCKED を返した場合**（デッドロック等）→ ユーザーに報告し対応方針を確認する。

## Step 2: 動作確認Step（動作確認試験＋リグレッションテスト）

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: リグレッションテスト実行（先行・ブロッキング）】本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を行う。**本工程は工程②〜④（動作確認試験）より先に実行し、全パスを確認できるまで工程②〜④に進まない**。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step2-①):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step2-①):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧）

・【工程②: 試験書作成】工程①で全パスを確認した後、本スキルディレクトリの `impl-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step2-②):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step2-②):
　作成された試験書パス(Step2-②):

・【工程③: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `impl`
　- 試験書パス: 工程②で受領したパス
　- WF固有入力: usecase-analysis.md, user-requirements.md
　レビュー結果を"試験書レビュー結果(Step2-③):"として即時記載する
　- **APPROVED の場合** → 工程④へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `impl-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step2-③):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step2-③):

・【工程④: 試験実行】工程③で APPROVED となった試験書に基づき、`impl-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、実際の動作確認（試験実行）を行う。試験結果を"試験実行サブエージェントの出力(Step2-④):"として記載する
　試験実行サブエージェントの出力(Step2-④):

・動作確認結果（工程④）が全てOK の場合（リグレッションテスト結果〔工程①〕は既に全パス確認済み）、ユーザーに実装内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）と、リグレッションテスト結果（全パス/失敗件数）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step2):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step2):

### 完了条件
fs-impl-phase4-report.txtに以下が全て満たされていること:
- リグレッションテスト実行サブエージェントの出力(Step2-①)が全パスである
- 試験書レビュー結果(Step2-③)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step2-④)が「OK」である
- ユーザー承認結果(Step2)が「承認」である（エビデンス付き報告済み）
- .aide/specs/{feature_name}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- リグレッションテスト結果(Step2-①)に失敗がある場合 → 工程②〜④に進まず、Step1（coding-test-2review）へ差し戻し、失敗テストの原因を修正するタスクを impl-task-list.md に追記してから再実装し、再度Step2（工程①から）を実行する
- 工程③で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程④に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程③が APPROVED かつ動作確認結果(Step2-④)が「OK」かつユーザー承認結果(Step2)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step2-④)が「NG」の場合 → 問題の内容を分析し、以下に遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを impl-task-list.md に追記してから再実装する
- ユーザー承認結果(Step2)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step2)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う

## 後処理

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し（実装ワークフローは各フェーズコミット型のため、本フェーズの進捗ファイル更新後にコミットする。コミット対象＝実装コード/テストコード（src/・tests/）+ impl-task-list.md / impl-process-checklist.md + impl-progress.md）、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase4-report.txtに、phase-report-check(write)の出力(後処理) / user-profile-management(update)の出力(後処理) / git-commit-workflowの出力(後処理) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:

- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-impl-phase4-report.txtの"完了ステータス(後処理):"を確認したら `fs-impl-phase5-final-check (aide-powers skill)` を activate して実行する。

注: 実装ワークフローは各フェーズコミット型である。本フェーズは後処理の phase-report-check(write)（進捗ファイル更新）の**後**に git-commit-workflow でコミットする。最終フェーズ（fs-impl-phase7-final-check）でも進捗ファイルの最終更新後にコミットされる。


# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。内部で実装→テスト→テスト実行→2段階レビューを完結）

**参照元スキル（直接 activate しない）:**
- `impl-task-planning (aide-powers skill)` — 実行可能タスク判定（依存先ベース）ルールの参照元。タスク分解は前フェーズ `fs-impl-phase2-preparation`、実装は `coding-test-2review` 内部で行うため、本フェーズからは直接 activate しない

**前のフェーズスキル:**
- `fs-impl-phase3-gui-mockup (aide-powers skill)`（GUIモックアップ確認）→ **fs-impl-phase4-execution**

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase5-final-check (aide-powers skill)`（最終チェック）

**Called by:**
- `fs-impl-phase3-gui-mockup (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-impl-phase4-execution`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。phase-report-check(write) の後にコミット）
- `pending-issues-management (aide-powers skill)` — 作業中に発見した問題の記録（record）。実装中の問題は coding-test-2review 内部および本スキルから随時記録する
- `visual-companion (aide-powers skill)` — 動作検証依頼時の視覚的提示に活用
- `task-orchestration (aide-powers skill)` — 量が多い場合の分割処理に活用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `regression-test-prompt.md` — Step 2（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
- `impl-verification-prompt.md` — Step 2（工程②: 試験書作成モード / 工程④: 試験実行モード）

**呼び出すサブエージェント（Step 2 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 2 工程①: リグレッションテスト実行。工程②〜④より先行）

**呼び出す名前付きエージェント（Step 2 工程③）:**
- `manual-test-review-agent (aide-powers agent)` — Step 2 工程③（試験書品質レビュー。wf_type=impl）

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 1）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。本スキルから直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**Input from caller:**
- `feature_name`: プロジェクト名
- `impl-task-list.md` のパス（`.aide/specs/{feature_name}/impl-task-list.md`）
- `impl-process-checklist.md` のパス（`.aide/specs/{feature_name}/impl-process-checklist.md`）
- `impl-progress.md` のパス（`.aide/specs/{feature_name}/impl-progress.md`）
- `doc-index.md` のパス
- `dev-environment.md` のパス

**Output to next phase:**
- 全タスク実装完了・全レビュー PASS・全テスト PASS の実装コード／テストコード

**Global rules:** `.aide/references/global-rules.md` を厳守
