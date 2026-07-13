---
name: fs-design-phase2-system-req
description: "Use when user requirements are confirmed and system requirements need to be defined. Collects technical constraints, tools, platform limitations and creates system-requirements.md and dev-environment.md."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-requirements.md | {specs_dir}/system-requirements.md | システム要件定義書 |
| dev-environment.md | {specs_dir}/dev-environment.md | 開発環境定義書（別ファイルとして必ず作成） |
| fs-design-phase2-report.txt | .aide/tmp/fs-design-phase2-report.txt | fs-design-phase2-system-reqの実行レポート |

> `{specs_dir}` は `.aide/specs/{feature_name}` を指す。

# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase2-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-design-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase2-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase2-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase2）/ fix（QAゲートREJECTED差し戻し: 呼び出し元 mode=fix、qa_feedback あり））
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
fs-design-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート1 REJECTED差し戻し）の場合:**
  - progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - QAゲート1から渡された fix 対象と qa_feedback を用いて Step1（システム要件の修正と合意取得、fixモード）を直接実行する
  - fix 完了後は後続フェーズへ前進遷移せず（後処理・コミットも実行しない）、呼び出し元の QAゲート1（fs-design-phase3-dev-plan）に制御を戻す（再QAレビューのため。コミットは再QA APPROVED 後にQAゲート1側で行う）

- **実行モードが通常の場合:**
  以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
  - FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
  - PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 2）
    - `START_FRESH`（新規開始）→ 異常（前フェーズ1: ユーザー要件定義が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase1-user-req (aide-powers skill)` に差し戻す
    - `RESUME_FROM N`（N==2、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
    - `RESUME_FROM N`（N>2、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
    - `RESUME_FROM N`（N<2、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに即通知し前フェーズスキル `fs-design-phase1-user-req (aide-powers skill)` に差し戻す
    - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase2-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: システム要件定義の実行

### 成果物
fs-design-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェントが作成する成果物の出力ファイルパスを記載する
　システム要件定義の出力ファイルパス(Step1):（{specs_dir}/system-requirements.md, {specs_dir}/dev-environment.md）
・前フェーズ成果物 {specs_dir}/user-requirements.md のパスと、企画オーケストレーターからの引き継ぎ（{specs_dir}/tech-investigation/ が存在する場合）の有無を記載する
　前フェーズ成果物パス(Step1):
　技術調査引き継ぎの有無(Step1):
・`system-requirements-definition (aide-powers skill)` を activate して実行し、出力を"system-requirements-definitionの出力(Step1):"として記載する
　- 実行モード: 前処理で確定した実行モードに従い、create（通常）または fix（QA差し戻し時、qa_feedback を渡す）で呼び出す
　- その記載内容から、次の項目を判断して記載する
　システム要件定義エージェントの出力(Step1):
　ヒアリング実施結果(Step1):
　作成ファイル(Step1):（system-requirements.md / dev-environment.md）
　システム要件のユーザー合意結果(Step1):（合意 / 修正要求）
　システム要件修正回数(Step1):
　システム要件修正内容要約(Step1):

### 完了条件
fs-design-phase2-report.txtに system-requirements-definition の出力とサブエージェントの出力が記載されており、{specs_dir}/system-requirements.md と {specs_dir}/dev-environment.md がそれぞれファイルサイズ1byte以上で**別ファイルとして**存在し、かつ"システム要件のユーザー合意結果(Step1):"が合意である

### 状態判定
- 完了条件を満たし、かつ通常モードの場合 → 後処理へ遷移する
- 完了条件を満たし、かつ実行モードが fix（QAゲート1差し戻し）の場合 → 後処理・コミットを実行せず、呼び出し元の QAゲート1（fs-design-phase3-dev-plan）に制御を戻す（再QAレビューのため）
- "システム要件のユーザー合意結果(Step1):"が修正要求の場合 → 修正内容を補い `system-requirements-definition (aide-powers skill)`（fixモード、qa_feedback に修正要求内容を渡す）を activate して実行し system-requirements.md / dev-environment.md を修正し、修正後 Step1 を再実行する
- system-requirements.md または dev-environment.md が未作成、もしくはヒアリングが未実施の場合は、不足を補い `system-requirements-definition (aide-powers skill)` を該当モードで再実行する（dev-environment.md が system-requirements.md に統合されている場合も別ファイル化のため再実行する）
- BLOCKED 等で続行不能の場合、ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-design-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する（system-requirements.md, dev-environment.md を doc-index.md に登録）。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（コミット対象: system-requirements.md, dev-environment.md。推奨プレフィックス: docs:）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たしたら `fs-design-phase3-dev-plan (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) の**後**に git-commit-workflow を実行する（フェーズ完了時の進捗更新後にコミットする）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `system-requirements-definition (aide-powers skill)` — Step 1（システム要件定義の標準プロセス。内部で system-requirements-architect-prompt.md のサブエージェントを起動）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase3-dev-plan (aide-powers skill)` — ユーザー合意 + git-commit-workflow 完了後、開発計画書フェーズに進む

**Called by:**
- `fs-design-phase1-user-req (aide-powers skill)`（REQUIRED SUB-SKILL として呼び出される）
- QAゲート1（fs-design-phase3-dev-plan）が system-requirements.md / dev-environment.md の REJECTED 時に mode=fix で再呼び出しする

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `system-requirements-definition (aide-powers skill)` — Step 1（create モード（通常）/ fix モード（QA差し戻し時））
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（フェーズ完了コミット）
- `tech-investigation (aide-powers skill)` — 技術調査が必要な場合に利用可能（1%ルール自動発動）
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示が有効な場面で活用
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスク分解が必要な場面で活用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `system-requirements-architect-prompt.md` — Step 1（mode: phase2 / fix。system-requirements-definition 経由で起動される）

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `mode` — phase2（通常）/ fix（QA指摘修正）
- `qa_feedback` — QA指摘内容（fix モードの場合）

**Output to next phase:**
- `{specs_dir}/system-requirements.md`（システム要件定義書）
- `{specs_dir}/dev-environment.md`（開発環境定義書）

**Global rules:** `.aide/references/global-rules.md` を厳守
