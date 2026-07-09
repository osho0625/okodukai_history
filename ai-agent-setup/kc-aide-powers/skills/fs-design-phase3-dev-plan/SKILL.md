---
name: fs-design-phase3-dev-plan
description: "Use when Phase 2 (system requirements) is complete and user has agreed. Verify requirements consistency and create development plan."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| development-plan.md | `.aide/specs/{feature_name}/development-plan.md` | 開発計画書（ユーザー要件・システム要件との整合性検証済み） |
| fs-design-phase3-report.txt | .aide/tmp/fs-design-phase3-report.txt | fs-design-phase3-dev-planの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase3-report.txt以外のファイルの書き出しは禁止。

- 設計書ゲート（design-gate 相当の本質的 HARD-GATE）以外の品質判断は、サブスキル・サブエージェント側の責務である
- REJECTED を受けて修正した場合、再QAレビューを省略してはならない（修正の単純さ・ユーザー合意・時間的制約は省略の根拠にならない）

# レポート運用ルール

fs-design-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase3-report.txt

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
fs-design-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 3）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜2: ユーザー要件定義・システム要件定義が未完了）。ユーザーに報告し、該当する前フェーズスキル（`fs-design-phase2-system-req (aide-powers skill)` / `fs-design-phase1-user-req (aide-powers skill)`）に差し戻す
　・`RESUME_FROM N`（N==3、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>3、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<3、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、該当する前フェーズスキル（`fs-design-phase2-system-req (aide-powers skill)` / `fs-design-phase1-user-req (aide-powers skill)`）に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase3-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する。

## Step 1: 前フェーズ成果物の確認

### 成果物
fs-design-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/user-requirements.md` と `.aide/specs/{feature_name}/system-requirements.md` の存在を確認した結果を、次の項目で記載する
　前フェーズ成果物の存在確認(Step1):（user-requirements.md / system-requirements.md がそれぞれ存在するか）

### 完了条件
fs-design-phase3-report.txtに"前フェーズ成果物の存在確認(Step1):"が記載されており、user-requirements.md / system-requirements.md がともに存在する

### 状態判定
完了条件を満たしていればStep2へ遷移する。いずれかの前フェーズ成果物が存在しない場合、ユーザーに報告し、該当する前フェーズ（フェーズ1: ユーザー要件定義 / フェーズ2: システム要件定義）へ差し戻す

## Step 2: 開発計画書の作成・整合性検証

### 成果物
fs-design-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　開発計画書の出力ファイルパス(Step2):（例: `.aide/specs/{feature_name}/development-plan.md`）
・本スキルディレクトリの `development-planner-prompt.md`（mode: phase3）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"開発計画策定エージェントの出力(Step2):"として記載する
・整合性チェックで矛盾・過不足が検出された場合は、エージェントの報告に基づきユーザーに修正方針を確認した結果を記載する
　整合性チェック結果(Step2):
　要件整合性に関するユーザー確認内容(Step2):

### 完了条件
fs-design-phase3-report.txtの"開発計画策定エージェントの出力(Step2):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/development-plan.md` がファイルサイズ1byte以上で存在し、エージェントが「要求分析完了」を明示しユーザー合意を得ている

### 状態判定
完了条件を満たしていればStep3へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

・NEEDS_CONTEXT の場合 → 不足情報を補い `development-planner-prompt.md`（mode: phase3）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → 段階的対応（コンテキスト追加 → タスク分割 → ユーザーエスカレーション）を行う
・整合性チェックでユーザー要件側・システム要件側の問題が検出された場合 → 開発計画書で吸収せず、該当する前フェーズスキル（fs-design-phase1-user-req / fs-design-phase2-system-req）の fix モードで修正し、修正後に再度整合性チェックを行う

## Step 3: QAレビュー（ゲート1: 要件定義レビュー）

### 成果物
fs-design-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: requirements-qa-agent、doc_index_path）、出力を"design-qa-dispatch（ゲート1）の出力(Step3):"として記載する（requirements-qa-agent によるレビュー。レビュー対象: user-requirements.md / system-requirements.md / development-plan.md / dev-environment.md、8つの検証項目）。その記載内容から、次の項目を判断して記載する
　QAレビュー結果(Step3):（APPROVED / REJECTED）
　QA指摘内容要約(Step3):
　QA修正回数(Step3):
　修正担当の振り分け(Step3):（REJECTED 時、user-requirements.md / system-requirements.md・dev-environment.md / development-plan.md のどれを誰が修正したか）

### 完了条件
fs-design-phase3-report.txtの"QAレビュー結果(Step3):"が APPROVED である

### 状態判定
完了条件を満たしていればStep4へ遷移する。fs-design-phase3-report.txtの"QAレビュー結果(Step3):"が REJECTED の場合、修正ループに入る。修正担当に応じて、いずれも **fix モード・fix 対象・QA指摘内容（qa_feedback）を渡して** 修正する:
・user-requirements.md の問題 → `fs-design-phase1-user-req (aide-powers skill)` を mode=fix（fix対象: user-requirements.md、qa_feedback: 該当指摘）で activate して実行し修正する（当該フェーズは fix モードで再開判定をスキップし、修正後コミットせず本ゲートに制御を戻す）
・system-requirements.md / dev-environment.md の問題 → `fs-design-phase2-system-req (aide-powers skill)` を mode=fix（fix対象: system-requirements.md / dev-environment.md、qa_feedback: 該当指摘）で activate して実行し修正する（同上、fix モードで再開判定をスキップし、修正後コミットせず本ゲートに制御を戻す）
・development-plan.md の問題 → `development-planner-prompt.md`（mode: fix、QA指摘内容を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し修正する
修正完了後:
1. 修正内容をユーザーに提示して合意を得る
2. コミットは行わず、再度 design-qa-dispatch (aide-powers skill)（mode: design-workflow、target_reviewer: requirements-qa-agent、doc_index_path）経由で requirements-qa-agent に再QAレビューを依頼する（再QAの省略は禁止）
3. 再QAが APPROVED になるまで修正ループを繰り返す
4. APPROVED 確定後のコミットは後処理（phase-report-check(write) の後）で行う（再QA前にコミットしない）

## Step 4: QAレビュー結果のユーザー共有

### 成果物
fs-design-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・APPROVED となったQAレビュー結果（REJECTED があった場合は修正経緯を含む）をユーザーに共有した結果を、次の項目で記載する
　ユーザー共有内容要約(Step4):

### 完了条件
fs-design-phase3-report.txtに"ユーザー共有内容要約(Step4):"が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-design-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。コミット対象:
　- 本フェーズの成果物（development-plan.md / doc-index.md）
　- ゲート1（Step3）の fix 委譲で修正された上流成果物（user-requirements.md / system-requirements.md / dev-environment.md）がある場合はそれも含める（各 fix 委譲先は fix モードでコミットせず本ゲートに制御を戻す契約のため未コミットのまま残っている）
　推奨プレフィックス: docs:
　その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):（development-plan.md / doc-index.md、およびゲート1 fix で修正された上流成果物を含む。fix がなかった場合はその旨を記載）
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase3-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-design-phase3-report.txtの"フェーズ完了検証結果(後処理):"が PASS であることを確認したら `fs-design-phase4-architecture (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型であり、本フェーズの後処理で phase-report-check(write) による進捗ファイル更新の後に git コミットを行う。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase4-architecture (aide-powers skill)`

**Called by:** 設計ワークフロー（fs-design-phase2-system-req (aide-powers skill) 完了後に遷移）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-qa-dispatch (aide-powers skill)` — Step 3（ゲート1: 要件定義レビュー。requirements-qa-agent を呼び出す）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（phase-report-check(write) の後。REJECTED 修正時は再QA APPROVED 確定後に後処理でコミットする）
- `fs-design-phase1-user-req (aide-powers skill)` — Step 3（REJECTED 時の user-requirements.md 修正。mode=fix、qa_feedback を渡す）
- `fs-design-phase2-system-req (aide-powers skill)` — Step 3（REJECTED 時の system-requirements.md / dev-environment.md 修正。mode=fix、qa_feedback を渡す）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `development-planner-prompt.md` — Step 2（mode: phase3）/ Step 3（mode: fix）

**Input from caller:**
- `feature_name`: プロジェクト名
- `fs-design-phase2-system-req (aide-powers skill)` の完了ステータス

**Output to next phase:**
- `development-plan.md`: 整合性検証済みの開発計画書

**Global rules:** `.aide/references/global-rules.md` を厳守
