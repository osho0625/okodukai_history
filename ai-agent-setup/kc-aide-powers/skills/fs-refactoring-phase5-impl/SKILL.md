---
name: fs-refactoring-phase5-impl
description: "Use when refactoring design is approved and ready for implementation with safety-net testing"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | refactoring-design.md で指定されたパス | リファクタリング対象の実装コード |
| テストコード | refactoring-design.md で指定されたパス | リファクタリングに伴うテストコード |
| test-function-list.md | {refactoring_dir}/testing/test-function-list.md | 動作確認対象機能リスト（Step 3 で出力） |
| test-{機能名}-test-plan.md | {refactoring_dir}/testing/test-{機能名}-test-plan.md | 機能別動作確認試験書（Step 3 で出力） |
| fs-refactoring-phase5-report.txt | .aide/tmp/fs-refactoring-phase5-report.txt | fs-refactoring-phase5-implの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase5-report.txt以外のファイルの書き出しは禁止。

- **NEVER MERGE TASKS**: タスク実装ループは coding-test-2review を1回だけ呼び出す。オーケストレータ側でタスクを束ねたり、ループ・工程順序を制御してはならない（タスクごとの 1呼び出し=1サブタスク 制御、依存先ベースの並列実行は coding-test-2review 内部の責務）

# レポート運用ルール

fs-refactoring-phase5-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase5-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `引継ぎファイルがあれば内容の要約: N/A（新規実行のため引き継ぎなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase5-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase5-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
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
fs-refactoring-phase5-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（リファクタリング差分設計・タスク分解・工程チェック表が未完了）。ユーザーに報告し、前フェーズスキル `fs-refactoring-phase4-design (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了
　（上記いずれの異常もなく新規実行の場合は Step1 へ遷移する）

## Step 1: タスク実装ループ（coding-test-2review 経由）

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・**事前ガード**: `{refactoring_dir}/impl-process-checklist.md` と `{refactoring_dir}/refactoring-design.md`（タスク一覧を含む）がファイルサイズ1byte以上で存在するか確認した結果を記載する。存在しない場合は実装ループに入らず、前フェーズ `fs-refactoring-phase4-design (aide-powers skill)` へ差し戻す
　事前ガード確認結果(Step1):（OK（両ファイル存在） / NG（不在ファイル名）→ fs-refactoring-phase4-design へ差し戻し）
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step1):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{refactoring_dir}/refactoring-design.md`（タスク一覧と依存先・状態を持つ）
　　- process_checklist_path=`{refactoring_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{refactoring_dir}/refactoring-design.md`（実装の根拠となるリファクタリング差分設計書）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`refactoring`
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step1):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念・並列可/逐次マーカーは使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
- テスト実行工程ではユニットテスト（対象タスクのテストファイル）のみを実行する。既存テスト全実行（外部振る舞いの保持確認）は本Step内では実施せず、後続の動作確認Step（Step2）で1回実施する設計に統一されている
- 成果物種別（プログラム / 非プログラム）の判定も内部で行う
- 実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う
- レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される

### 完了条件
fs-refactoring-phase5-report.txtに coding-test-2reviewの出力(Step1) が記載され、status: DONE であり、{refactoring_dir}/refactoring-design.md の全タスクが完了状態に更新され、{refactoring_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）

### 状態判定
まず "事前ガード確認結果(Step1):" を確認する。NG（impl-process-checklist.md または refactoring-design.md が不在）の場合、実装ループに入らず前フェーズ `fs-refactoring-phase4-design (aide-powers skill)` へ差し戻す。OK の場合のみ以下を実行する。
- coding-test-2review が status: DONE を返した場合 → Step2 へ遷移する
- coding-test-2review が status: BLOCKED を返した場合 → ユーザーに報告し対応方針を確認する

## Step 2: リグレッションテスト結果の確認・報告（セーフティネット）

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を実際に実行させ、フェーズ1（fs-refactoring-phase1-status）で記録した開始前基準（セーフティネットベースライン）との比較結果を確認・報告させる。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step2):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step2):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧、開始前基準との比較結果）

### 完了条件
当該レポートに、リグレッションテスト実行サブエージェントの出力(Step2)が全パスかつ開始前基準との比較で差異なしであることが記載されている

### 状態判定
リグレッションテスト実行サブエージェントの出力(Step2)が全パスかつ開始前基準との比較で差異ないことを確認しユーザーに報告したら、Step3 へ遷移する。失敗がある場合は Step1（coding-test-2review）へ差し戻し、失敗テストの原因を修正するタスクを refactoring-design.md に追記してから再実装し、再度 Step2 を実行する

## Step 3: 動作確認試験

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: 試験書作成】本スキルディレクトリの `refactoring-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step3-①):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step3-①):
　作成された試験書パス(Step3-①):

・【工程②: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `refactoring`
　- 試験書パス: 工程①で受領したパス
　- WF固有入力: refactoring-plan.md（外部振る舞い基準）
　レビュー結果を"試験書レビュー結果(Step3-②):"として即時記載する
　- **APPROVED の場合** → 工程③へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `refactoring-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step3-②):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step3-②):

・【工程③: 試験実行】工程②で APPROVED となった試験書に基づき、`refactoring-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、リファクタリングされた機能の外部振る舞いが変わっていないことを実際に動作確認（試験実行）する。試験結果を"試験実行サブエージェントの出力(Step3-③):"として記載する
　試験実行サブエージェントの出力(Step3-③):

・動作確認結果が全てOK の場合、ユーザーにリファクタリング内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step3):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step3):

### 完了条件
fs-refactoring-phase5-report.txtに以下が全て満たされていること:
- 試験書レビュー結果(Step3-②)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step3)が「OK」である
- ユーザー承認結果(Step3)が「承認」である（エビデンス付き報告済み）
- {refactoring_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 工程②で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程③に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程②が APPROVED かつ動作確認結果(Step3)が「OK」かつユーザー承認結果(Step3)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step3)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを refactoring-design.md に追記してから再実装する
　- 設計の問題（リファクタリング設計自体に問題）→ Phase4（fs-refactoring-phase4-design）へ差し戻す
- ユーザー承認結果(Step3)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step3)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う

## 後処理

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase5-report.txtに、phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-refactoring-phase5-report.txtの"完了ステータス(後処理):"を確認したら `fs-refactoring-phase6-doc (aide-powers skill)` を activate して実行する

注: リファクタリングワークフローでは全フェーズ完了後に phase7（最終チェック）で1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。内部で実装→テスト→レビュー→既存テスト全実行のセーフティネットを完結）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase6-doc (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase4-design (aide-powers skill)` → 設計QA APPROVED 後に本スキルに遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）

**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `regression-test-prompt.md` — Step 2 専任（工程番号なし・単独の呼び出し。汎用のサブエージェント用。新規。phase1-statusのセーフティネット基準との比較報告を含む）
- `refactoring-verification-prompt.md` — Step 3（工程①: 試験書作成モード / 工程③: 試験実行モード。プレースホルダーを実データで置換してサブエージェントに渡す。元のStep番号・工程番号のまま）

**呼び出すサブエージェント（Step 2）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 2: リグレッションテスト実行。開始前基準〔セーフティネットベースライン〕との比較報告を含む）

**呼び出す名前付きエージェント（Step 3 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 3 工程②（試験書品質レビュー。wf_type=refactoring。元のまま）

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 1）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。本フェーズから直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**Input from caller:**
- `feature_name`: プロジェクト名
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ（phase1 Step2 で確定。phase2 のフォルダ統合で移設される場合あり。phase1〜4 を通じて引き継がれた値）
- `doc_index_path`: doc-index.md のパス

**Output to next phase:**
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ

**Global rules:** `.aide/references/global-rules.md` を厳守
