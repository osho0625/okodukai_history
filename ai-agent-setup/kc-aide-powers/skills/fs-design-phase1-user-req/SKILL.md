---
name: fs-design-phase1-user-req
description: "Use when starting the design workflow to define user requirements, or when QA gate 1 rejects and user-requirements.md needs revision."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| user-requirements.md | .aide/specs/{feature_name}/user-requirements.md | ユーザー要件定義書（MoSCoW分類・EARS構文） |
| user-hints.md | .aide/specs/{feature_name}/tech-references/user-hints.md | 一例として分離した手段の記録（該当時のみ） |
| fs-design-phase1-report.txt | .aide/tmp/fs-design-phase1-report.txt | fs-design-phase1-user-reqの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase1-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-design-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase1、または設計ワークフロー先頭フェーズとして起動）/ fix（QAゲート REJECTED差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり）。ゲート1=fs-design-phase3-dev-plan または ゲート4=fs-design-phase10-program から委譲される））
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
fs-design-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート REJECTED差し戻し）の場合:**
  - progress-resume-check / 進捗確認による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - 呼び出し元のQAゲート（ゲート1: fs-design-phase3-dev-plan、またはゲート4: fs-design-phase10-program）から渡された fix 対象と qa_feedback を用いて Step2（ユーザー要件の修正と合意取得）を直接実行する
  - fix 完了後は後続フェーズへ前進遷移せず（後処理・コミットも実行しない）、呼び出し元のQAゲートに制御を戻す（再QAレビューのため。コミットは再QA APPROVED 後にQAゲート側で行う）

- **実行モードが通常（設計ワークフロー先頭フェーズとしての新規実行）の場合:**
  - 以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
  - FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
  - PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 1）
    - `START_FRESH`（新規開始）→ Step1 へ遷移する
    - `RESUME_FROM N`（N==1、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
    - `RESUME_FROM N`（N>1、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
    - `RESUME_FROM N`（N<1、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに即通知し前フェーズスキルへ差し戻す（本フェーズは先頭フェーズのため通常は発生しない）
    - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase1-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: 企画ワークフローからの引き継ぎ確認

### 成果物
fs-design-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/handover-notes.md` の存在を確認し、結果を記載する
　handover-notes.md存在(Step1):
・handover-notes.md が存在する場合、handover-notes.md と planning-proposal.md の引き継ぎ内容をユーザーに簡潔に共有し、特に注意すべき点・未解決の課題を把握した結果を記載する。存在しない場合は理由を記載する（例: `引き継ぎ内容の共有結果(Step1): N/A（handover-notes.md なし。通常開始）`）
　引き継ぎ内容の共有結果(Step1):
　未解決の課題(Step1):

### 完了条件
fs-design-phase1-report.txtに、handover-notes.md の存在有無と、（存在する場合は）引き継ぎ内容の共有結果・未解決の課題が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: ユーザー要件定義

### 成果物
fs-design-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、feature_name から出力ファイルパスを組み立てて記載する
　ユーザー要件定義の出力ファイルパス(Step2):（例: .aide/specs/{feature_name}/user-requirements.md, .aide/specs/{feature_name}/tech-references/user-hints.md）
・本スキルディレクトリの `user-requirements-architect-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし（QAゲート1差し戻し時は fix モード、それ以外は phase1 モード）、サブエージェントを実行し、サブエージェントの出力を"ユーザー要件定義エージェントの出力(Step2):"として記載する（サブエージェントは内部で user-requirements.md 作成・ユーザーへの提示と合意取得まで実行する）。その記載内容から、次の項目を判断して記載する
　ユーザー要件のユーザー合意結果(Step2):（合意 / 修正要求）
　ユーザー要件修正回数(Step2):
　ユーザー要件修正内容要約(Step2):

### 完了条件
fs-design-phase1-report.txtの"ユーザー要件定義エージェントの出力(Step2):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、.aide/specs/{feature_name}/user-requirements.md がファイルサイズ1byte以上で存在し（一例として分離した手段がある場合は .aide/specs/{feature_name}/tech-references/user-hints.md も1byte以上で存在する）、かつ"ユーザー要件のユーザー合意結果(Step2):"が合意である

### 状態判定
完了条件を満たしている場合:

- **通常モードの場合** → 後処理へ遷移する
- **実行モードが fix（QAゲート差し戻し）の場合** → 後処理・コミットを実行せず、呼び出し元のQAゲート（ゲート1: fs-design-phase3-dev-plan、またはゲート4: fs-design-phase10-program）に制御を戻す（再QAレビューのため）

ただしステータスが DONE_WITH_CONCERNS の場合は、遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

完了条件を満たしていない場合:

- fs-design-phase1-report.txtの"ユーザー要件のユーザー合意結果(Step2):"が修正要求の場合、`user-requirements-architect-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step2 を再実行する
- ステータスがNEEDS_CONTEXT の場合、不足情報を補い `user-requirements-architect-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-design-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase1-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:

- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たしたら `fs-design-phase2-system-req (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) による進捗ファイル更新の後に git-commit-workflow でコミットする。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase2-system-req (aide-powers skill)`

**Called by:**
- 設計ワークフロー（先頭フェーズとして呼び出される）
- QAゲート1（fs-design-phase3-dev-plan）が user-requirements.md の REJECTED 時に mode=fix で再呼び出し
- QAゲート4（fs-design-phase10-program）が user-requirements.md の REJECTED 時に mode=fix で再呼び出し

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理
- `pending-issues-management (aide-powers skill)` — 設計上の懸念事項や未解決の課題を発見した場合に随時

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `user-requirements-architect-prompt.md` — Step 2（mode: phase1 / fix）

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーの最初の発言（要望の内容）
- `mode`: phase1（通常）/ fix（QAゲート1 または QAゲート4 REJECTED 修正）
- `qa_feedback`: QA指摘内容（fix モードの場合）
- `fix対象`: 修正対象成果物（fix モードの場合。user-requirements.md）

**Output to next phase:**
- `feature_name`: プロジェクト名（成果物は `.aide/specs/{feature_name}/` 配下）

**Related skills:**
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解
- `design-qa-dispatch (aide-powers skill)` — QAゲート1でのレビュー（本フェーズの成果物を検証する）

**Global rules:** `.aide/references/global-rules.md` を厳守
