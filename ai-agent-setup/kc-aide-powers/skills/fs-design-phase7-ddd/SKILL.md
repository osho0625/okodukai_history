---
name: fs-design-phase7-ddd
description: "Use when designing layered architecture and making DDD adoption decisions in the design workflow, after usecase analysis (phase 6) is complete."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| layered-architecture.md | `.aide/specs/{feature_name}/layered-architecture.md` | レイヤードアーキテクチャ設計書（DDD採用判断・レイヤー構成・依存ルール・テスト用ダミー実装方針） |
| ubiquitous-language.md | `.aide/specs/{feature_name}/ubiquitous-language.md` | ユビキタス言語辞書の初期版（常に作成。DDD不採用時は軽量な用語集） |
| fs-design-phase7-ddd-report.txt | .aide/tmp/fs-design-phase7-ddd-report.txt | fs-design-phase7-ddd の実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase7-ddd-report.txt以外のファイルの書き出しは禁止。

- DDD採用可否の判断・アーキテクチャ設計・成果物の中身作成は、ddd-modeler サブエージェント（ddd-modeling スキル）の責務である。オーケストレータが設計内容を自前で作成してはならない
- QA APPROVED なしに次フェーズへ進んではならない
- REJECTED を受けて修正した場合、再QAレビューを省略してはならない（修正の単純さ・ユーザー合意・時間的制約は省略の根拠にならない）

# レポート運用ルール

fs-design-phase7-ddd-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase7-ddd-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `修正回数(Step2): 0（初回 APPROVED）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase7-ddd-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase7）/ fix（QAゲート4 REJECTED差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
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
・通常モードで本フェーズを実行する場合は、下記「状態判定」の Step途中再開判定の結果を記載する（fix モード時は理由とともに N/A）
　再開Step(前処理):

### 完了条件
fs-design-phase7-ddd-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート4 REJECTED差し戻し）の場合:**
  - progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - QAゲート4から渡された fix 対象（layered-architecture.md）と qa_feedback を用いて Step1（`ddd-modeler-prompt.md` の fix モードによる layered-architecture.md の修正とユーザー合意）を直接実行する
  - ゲート4 経由の fix 対象は layered-architecture.md に限られ、ubiquitous-language.md はゲート4 から本フェーズへ送られない（ゲート4 の ubiquitous-language.md fix は phase8 に一意化済み）
  - 本フェーズ内のゲート2（Step2）は再実行しない
  - fix 完了後は後続フェーズへ前進遷移せず（後処理・コミットも実行しない）、呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため。コミットは再QA APPROVED 後にQAゲート4側で行う）

- **実行モードが通常の場合:**
  以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 7）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜6の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase6-usecase (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==7、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>7、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<7、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase6-usecase (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase7-ddd-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: レイヤードアーキテクチャ設計の作成（ddd-modeler create モード）

### 成果物
fs-design-phase7-ddd-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　アーキテクチャ設計出力ファイルパス(Step1):（例: `.aide/specs/{feature_name}/layered-architecture.md`、`.aide/specs/{feature_name}/ubiquitous-language.md`（常に））
・本スキルディレクトリの `ddd-modeler-prompt.md`（mode: create、scope: architecture）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"DDDモデリングエージェントの出力(Step1):"として記載する（サブエージェントは内部で ddd-modeling スキルに従い、DDD採用可否の3観点判断・アーキテクチャパターン選択・依存ルール定義・テスト用ダミー実装方針定義・ユビキタス言語辞書初期版作成（DDD採用時はドメインのユビキタス言語、不採用時は軽量な用語集として常に作成）・成果物作成・ユーザーへの提示と合意取得まで実行する）。その記載内容から、次の項目を判断して記載する
　DDD採用判断結果(Step1):（採用 / 不採用）
　アーキテクチャ設計ユーザー判断(Step1):（合意 / 修正要求）
　アーキテクチャ設計修正回数(Step1):
　アーキテクチャ設計修正内容要約(Step1):

> レイヤー構成図・レイヤー間依存方向図・アーキテクチャパターン比較は文字だけより図で見せた方がわかりやすい。`visual-companion (aide-powers skill)` を activate してブラウザでイメージ表示し、ユーザー確認に活用してよい。変更容易性についてユーザーの合意を得ること。

### 完了条件
fs-design-phase7-ddd-report.txtのDDDモデリングエージェントの出力(Step1)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/layered-architecture.md` がファイルサイズ1byte以上で存在する。DDD採用/不採用に関わらず `.aide/specs/{feature_name}/ubiquitous-language.md` がファイルサイズ1byte以上で存在する（不採用時は軽量な用語集として作成）。かつ"アーキテクチャ設計ユーザー判断(Step1):"が合意である

### 状態判定
- **完了条件を満たしている場合** → Step2へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- **"アーキテクチャ設計ユーザー判断(Step1):"が修正要求の場合** → `ddd-modeler-prompt.md`（mode: fix、ユーザーの修正指示を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step1 を再実行する（合意が得られるまで繰り返す）
- **ステータスが NEEDS_CONTEXT の場合** → 不足情報を補い `ddd-modeler-prompt.md`（mode: create）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- **BLOCKED の場合** → ユーザーに報告し対応方針を確認する
- **実行モードが fix（QAゲート4 REJECTED 差し戻し）の場合** → ユーザー合意取得後、Step2（ゲート2）へ進まず、後処理・コミットを行わずに呼び出し元のQAゲート4（fs-design-phase10-program）へ制御を戻す（前処理の実行モード判定に従う）

## Step 2: QAレビュー（ゲート2: アーキテクチャレビュー）

### 成果物
fs-design-phase7-ddd-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: architecture-qa-agent、doc_index_path: .aide/specs/{feature_name}/doc-index.md）、出力を"design-qa-dispatch(ゲート2)の出力(Step2):"として記載する（architecture-qa-agent によるレビュー。レビュー対象: gui-design.md / layered-architecture.md、前提成果物: user-requirements.md / system-requirements.md。検証項目: GUI設計の要件充足 / DDD採用判断とアーキテクチャパターン選択の妥当性 / レイヤー間依存方向 / ドメイン層の独立性 / 依存性逆転の適用）。その記載内容から、次の項目を判断して記載する
　QAレビュー結果(Step2):（APPROVED / REJECTED）
　QA指摘内容要約(Step2):
　QA修正回数(Step2):
　修正担当の振り分け(Step2):（REJECTED 時、layered-architecture.md（ddd-modeler が修正）/ gui-design.md（gui-designer が修正）のどちらを誰が修正したか）

### 完了条件
fs-design-phase7-ddd-report.txtの"QAレビュー結果(Step2):"が APPROVED である

### 状態判定
完了条件を満たしていれば後処理へ遷移する。fs-design-phase7-ddd-report.txtの"QAレビュー結果(Step2):"が REJECTED の場合、修正ループに入る:

**差し戻しルーティング判定（修正ループ開始時に最初に実施）:**
- FAIL項目の修正指示に「差し戻し先」列の値が「—」以外のものがある場合:
  - 差し戻し先フェーズスキルを fixモード（mode=fix、fix_target=不足観点、qa_feedback=QAレビュー結果全文）で activate して実行する
  - fix完了後、本Step（QAレビュー）を再実行する（再度 design-qa-dispatch で再QAレビュー）
- 全ての「差し戻し先」が「—」の場合:
  - 従来通り以下の修正担当振り分けで修正する

**修正担当の振り分け（差し戻し先が全て「—」の場合）:**
・DDD/レイヤー構成の問題 → `ddd-modeler-prompt.md`（mode: fix、QA指摘内容を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し layered-architecture.md / ubiquitous-language.md を修正する
・GUI設計の問題 → `fs-design-phase5-gui (aide-powers skill)` ディレクトリの `gui-designer-prompt.md`（mode: fix、QA指摘内容を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し gui-design.md を修正する

修正完了後、修正内容をユーザーに提示して合意を得たうえで、コミットは行わず、再度 design-qa-dispatch (aide-powers skill)（mode: design-workflow、target_reviewer: architecture-qa-agent、doc_index_path: .aide/specs/{feature_name}/doc-index.md）経由で architecture-qa-agent に再QAレビューを依頼する（再QAの省略は禁止）。再QAが APPROVED になるまで修正ループを繰り返す。

APPROVED 確定後のコミットは後処理（phase-report-check(write) の後）で行う（再QA前にコミットしない）

## 後処理

### 成果物
fs-design-phase7-ddd-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する（対象: layered-architecture.md、ubiquitous-language.md も登録（常に））。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（layered-architecture.md / ubiquitous-language.md / doc-index.md、およびゲート2の修正で gui-design.md を修正した場合は gui-design.md も、の更新をコミットする。推奨プレフィックス: docs:）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase7-ddd-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-design-phase7-ddd-report.txtの"フェーズ完了検証結果(後処理):"が PASS であることを確認したら `fs-design-phase8-object (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) により進捗ファイルを ✅ 完了 に更新した後、git-commit-workflow で当該フェーズのコミットを行い、進捗の最新状態をコミットに含める。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase8-object (aide-powers skill)`（QA APPROVED 後）

**Called by:** 設計ワークフロー（`fs-design-phase6-usecase (aide-powers skill)` 完了後に遷移）。QAゲート4（fs-design-phase10-program）が layered-architecture.md の REJECTED 時に mode=fix で再呼び出しする

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `ddd-modeling (aide-powers skill)` — Step 1（DDD/レイヤードアーキテクチャ設計の手法・ルール・品質基準。ddd-modeler サブエージェント内で使用）
- `design-qa-dispatch (aide-powers skill)` — Step 2（ゲート2: アーキテクチャレビュー。architecture-qa-agent を呼び出す。doc_index_path を渡す）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（phase-report-check(write) の後。REJECTED 修正時は再QA APPROVED 確定後に後処理でコミットする）
- `visual-companion (aide-powers skill)` — Step 1（レイヤー構成図・依存方向図・アーキテクチャパターン比較の視覚的提示。イメージで見せた方がわかりやすい場面で活用）
- `pending-issues-management (aide-powers skill)` — 設計中に発見された問題の記録（随時）
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート:**
- `ddd-modeler-prompt.md`（本スキルディレクトリ配下） — Step 1（mode: create）/ Step 2（mode: fix）
- `gui-designer-prompt.md`（`fs-design-phase5-gui (aide-powers skill)` ディレクトリ配下） — Step 2（mode: fix、GUI設計の問題が指摘された場合のみ）

**Input from caller:**
- `feature_name`: プロジェクト名
- `specs_dir`: `.aide/specs/{feature_name}`
- `mode`: phase7（通常）/ fix（QAゲート4 REJECTED 修正）
- `qa_feedback`: QA指摘内容（fix モードの場合）
- `fix対象`: 修正対象成果物（fix モードの場合。layered-architecture.md。ゲート4 経由の fix 対象は layered-architecture.md のみ。ubiquitous-language.md はゲート4 からは送られず phase8 で fix する）

**Output to next phase:**
- `layered-architecture.md`: レイヤードアーキテクチャ設計書
- `ubiquitous-language.md`: ユビキタス言語辞書の初期版（常に）

**Global rules:** `.aide/references/global-rules.md` を厳守
