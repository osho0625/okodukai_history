---
name: fs-design-phase10-program
description: "Use when Phase 9 (infrastructure interface design) is complete and user has agreed. Finalize program structure (folder layout, file naming, import rules) and pass Gate 4 (final design review with completeness check)."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| program-structure.md | `.aide/specs/{feature_name}/program-structure.md` | フォルダ構成・ファイル配置・importルール・命名規則を定義 |
| fs-design-phase10-program-report.txt | .aide/tmp/fs-design-phase10-program-report.txt | fs-design-phase10-programの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase10-program-report.txt以外のファイルの書き出しは禁止。

- 設計書ゲート（design-gate 相当の本質的 HARD-GATE）以外の品質判断は、サブスキル・サブエージェント側の責務である
- ゲート4（最終設計レビュー）で REJECTED を受けて修正した場合、再QAレビューを省略してはならない（修正の単純さ・ユーザー合意・時間的制約・設計WF最終フェーズであること、いずれも省略の根拠にならない）

# レポート運用ルール

fs-design-phase10-program-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase10-program-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}/`）
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
fs-design-phase10-program-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 10）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜9の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase9-infra (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==10、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>10、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<10、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase9-infra (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase10-program-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する。

## Step 1: 前フェーズ成果物の存在確認

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・以下の前フェーズ成果物の存在を確認した結果を、次の項目で記載する（プログラム構成設計はオブジェクト設計・インフラIF設計を前提とするため、これらの欠落は実行不可）
　前フェーズ成果物の存在確認(Step1):（`.aide/specs/{feature_name}/layered-architecture.md` / `object-design-domain.md` / `object-design-application.md` / `object-design-infrastructure.md` / `object-design-presentation.md` / `infra-interface-design.md` / `system-architecture.md` / `gui-design.md` / `user-requirements.md` / `system-requirements.md` がそれぞれ存在するか）

### 完了条件
fs-design-phase10-program-report.txtに"前フェーズ成果物の存在確認(Step1):"が記載されており、上記の前フェーズ成果物がすべて存在する

### 状態判定
完了条件を満たしていればStep2へ遷移する。前フェーズ成果物が1つでも存在しない場合、ユーザーに報告し、該当する前フェーズへ差し戻す（infra-interface-design.md 欠落 → フェーズ9 / object-design-*.md 欠落 → フェーズ8 / layered-architecture.md 欠落 → フェーズ7）

## Step 2: プログラム構成設計（program-structure-designer サブエージェント）

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　プログラム構成設計出力ファイルパス(Step2):（`.aide/specs/{feature_name}/program-structure.md`）
・本スキルディレクトリの `program-structure-designer-prompt.md`（mode: phase10）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"プログラム構成設計エージェントの出力(Step2):"として記載する
・サブエージェントがユーザーと直接対話して得たプログラム構成（フォルダ構成・ファイル命名規則・importルール）の合意結果を、次の項目で記載する
　プログラム構成のユーザー合意結果(Step2):（「プログラム構成確定」が明示されたか）

### 完了条件
fs-design-phase10-program-report.txtのプログラム構成設計エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、プログラム構成のユーザー合意結果(Step2)が「合意（プログラム構成確定）」であり、`.aide/specs/{feature_name}/program-structure.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep3へ遷移する。ただし以下の場合は対応が必要:
- ステータスが DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ユーザー合意が得られていない場合 → 合意が得られるまで Step2 内でサブエージェントとユーザーの対話を継続する
- プログラム構成設計エージェントの出力(Step2)のステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `program-structure-designer-prompt.md`（mode: phase10）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: QAレビュー（ゲート4: 最終設計レビュー）

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し、出力を"design-qa-dispatch(ゲート4)の出力(Step3):"として記載する（mode: design-workflow、target_reviewer: final-design-qa-agent によるレビュー、doc_index_path。レビュー対象: infra-interface-design.md / program-structure.md、前提成果物: object-design-*.md / layered-architecture.md / user-requirements.md / gui-design.md / system-architecture.md）。その記載内容から、次の項目を判断して記載する
　QAレビュー結果(Step3):（APPROVED / REJECTED）
　QA指摘内容要約(Step3):
　設計網羅性確認結果(Step3):（user-requirements.md の全項目・gui-design.md の全画面/全コンポーネント・system-architecture.md の全コンポーネントが設計書群で考慮・反映されているか。未考慮があれば REJECTED 扱い）
　QA修正回数(Step3):
　修正担当の振り分け(Step3):（REJECTED 時、program-structure.md / infra-interface-design.md / object-design-*.md / ubiquitous-language.md / layered-architecture.md / gui-design.md / user-requirements.md / system-architecture.md のどれを誰が修正したか）

### 完了条件
fs-design-phase10-program-report.txtの"QAレビュー結果(Step3):"が APPROVED であり、"設計網羅性確認結果(Step3):"に未考慮なしが記載されている

### 状態判定
完了条件を満たしていればStep4へ遷移する。

fs-design-phase10-program-report.txtの"QAレビュー結果(Step3):"が REJECTED の場合（設計網羅性確認で未考慮が検出された場合を含む）、修正ループに入る。final-design-qa-agent の修正指示の対象に応じて該当箇所を fix モードで修正する。フェーズスキルへ委譲する場合はいずれも **mode=fix・fix対象・QA指摘内容（qa_feedback）を渡す**（委譲先は fix モードで前処理の再開判定をスキップし、修正・ユーザー合意後にコミットせず本ゲートに制御を戻す）:
・program-structure.md の問題 → `program-structure-designer-prompt.md`（mode: fix、QA指摘内容を渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し修正する。出力を"program-structure修正(fix)の出力(Step3):"として記載する
・infra-interface-design.md の問題 → `fs-design-phase9-infra (aide-powers skill)` を mode=fix（fix対象: infra-interface-design.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"infra-interface-design修正(fix)の出力(Step3):"として記載する
・object-design-*.md の問題 → `fs-design-phase8-object (aide-powers skill)` を mode=fix（fix対象: object-design-*.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"object-design修正(fix)の出力(Step3):"として記載する
・ubiquitous-language.md の問題 → `fs-design-phase8-object (aide-powers skill)` を mode=fix（fix対象: ubiquitous-language.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"ubiquitous-language修正(fix)の出力(Step3):"として記載する（ユビキタス言語辞書は phase7 で初版、phase8 で確定版を保持するため、本ゲートからの fix 修正担当は phase8 に一意化する。phase7 へは振り分けない）
・layered-architecture.md の問題 → `fs-design-phase7-ddd (aide-powers skill)` を mode=fix（fix対象: layered-architecture.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"layered-architecture修正(fix)の出力(Step3):"として記載する
・gui-design.md の問題 → `fs-design-phase5-gui (aide-powers skill)` を mode=fix（fix対象: gui-design.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"gui-design修正(fix)の出力(Step3):"として記載する
・user-requirements.md の問題 → `fs-design-phase1-user-req (aide-powers skill)` を mode=fix（fix対象: user-requirements.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"user-requirements修正(fix)の出力(Step3):"として記載する
・system-architecture.md の問題 → `fs-design-phase4-architecture (aide-powers skill)` を mode=fix（fix対象: system-architecture.md、qa_feedback: 該当指摘）で activate して実行し修正する。出力を"system-architecture修正(fix)の出力(Step3):"として記載する
修正完了後:
- 修正内容をユーザーに提示して合意を得る
- コミットは行わず、再度 design-qa-dispatch (aide-powers skill)（mode: design-workflow、target_reviewer: final-design-qa-agent、doc_index_path）経由で final-design-qa-agent に再QAレビューを依頼し、出力を"design-qa-dispatch(再QA)の出力(Step3):"として記載する（再QAの省略は禁止）
- 再QAが APPROVED になるまで修正ループを繰り返す
- APPROVED 確定後のコミットは後処理（phase-report-check(write) の後）で行う（再QA前にコミットしない）

## Step 4: QAレビュー結果のユーザー共有・設計完了宣言

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・APPROVED となったQAレビュー結果（設計網羅性確認結果を含む。REJECTED があった場合は修正経緯を含む）をユーザーに共有し、「設計完了」を宣言した結果を、次の項目で記載する
　ユーザー共有内容要約(Step4):
　設計完了宣言(Step4):（ユーザーへ設計完了を宣言した旨）

### 完了条件
fs-design-phase10-program-report.txtに"ユーザー共有内容要約(Step4):"と"設計完了宣言(Step4):"が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-design-phase10-program-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する（対象: program-structure.md）
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。本フェーズの成果物（program-structure.md / doc-index.md）に加え、ゲート4（Step3）の fix 委譲で修正された上流設計成果物（system-architecture.md / gui-design.md / layered-architecture.md / object-design-*.md / infra-interface-design.md / user-requirements.md / ubiquitous-language.md 等。各 fix 委譲先は fix モードでコミットせず本ゲートに制御を戻す契約のため未コミットのまま残っている）も含めて、本フェーズのコミットでまとめてコミットする（ゲート4修正分のコミット漏れ防止）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):（program-structure.md / doc-index.md、およびゲート4 fix で修正された上流設計成果物を含む。fix がなかった場合はその旨を記載）
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase10-program-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-design-phase10-program-report.txtの"フェーズ完了検証結果(後処理):"が PASS であることを確認したら `fs-design-phase11-final-check (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) により進捗ファイルを ✅ 完了 に更新した後、git-commit-workflow で当該フェーズの成果物（program-structure.md / doc-index.md）に加え、ゲート4（Step3）の fix 委譲で修正された上流設計成果物（system-architecture.md / gui-design.md / layered-architecture.md / object-design-*.md / infra-interface-design.md / user-requirements.md / ubiquitous-language.md 等。fix モードでコミットせず本ゲートに制御を戻ったもの）もまとめてコミットする。各フェーズコミット型の整合を保ちつつ、ゲート4修正分の取りこぼし（コミット漏れ）を防ぐ。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase11-final-check (aide-powers skill)`（完全性チェック後、実装ワークフローへ案内）

**Called by:** 設計ワークフロー（fs-design-phase9-infra (aide-powers skill) 完了後に遷移）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-qa-dispatch (aide-powers skill)` — Step 3（ゲート4: 最終設計レビュー。final-design-qa-agent を呼び出す）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（phase-report-check(write) の後。program-structure.md / doc-index.md に加え、ゲート4 fix で修正された上流設計成果物（fix モードでコミットせず戻ったもの）もまとめてコミットする。REJECTED 修正時は再QA APPROVED 確定後に後処理でコミットする）
- `fs-design-phase9-infra (aide-powers skill)` — Step 3（REJECTED 時の infra-interface-design.md 修正。mode=fix、qa_feedback を渡す）
- `fs-design-phase8-object (aide-powers skill)` — Step 3（REJECTED 時の object-design-*.md / ubiquitous-language.md 修正。mode=fix、qa_feedback を渡す。ubiquitous-language.md の fix 担当は phase8 に一意化）
- `fs-design-phase7-ddd (aide-powers skill)` — Step 3（REJECTED 時の layered-architecture.md 修正。mode=fix、qa_feedback を渡す）
- `fs-design-phase5-gui (aide-powers skill)` — Step 3（REJECTED 時の gui-design.md 修正。mode=fix、qa_feedback を渡す）
- `fs-design-phase1-user-req (aide-powers skill)` — Step 3（REJECTED 時の user-requirements.md 修正。mode=fix、qa_feedback を渡す）
- `fs-design-phase4-architecture (aide-powers skill)` — Step 3（REJECTED 時の system-architecture.md 修正。mode=fix、qa_feedback を渡す）
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録

**Available on demand:**
- `visual-companion (aide-powers skill)` — フォルダ構成ツリー図・importルール依存方向図の視覚的提示。イメージで見せた方がわかりやすい場面で活用
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `program-structure-designer-prompt.md` — Step 2（mode: phase10）/ Step 3（mode: fix）

**QA reviewer:**
- `final-design-qa-agent (aide-powers agent)` — design-qa-dispatch 経由で呼び出し（ゲート4: 最終設計レビュー）

**Input from caller:**
- `feature_name`: プロジェクト名
- `specs_dir`: `.aide/specs/{feature_name}`

**Output to next phase:**
- `program-structure.md`: 確定したプログラム構成書

**Global rules:** `.aide/references/global-rules.md` を厳守
