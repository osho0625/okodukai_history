---
name: fs-design-phase4-architecture
description: "Use when Phase 3 (development plan) is complete and approved, to design system architecture diagrams and software block diagrams."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-architecture.md | {specs_dir}/system-architecture.md | システム構成設計書（アーキテクチャ図・アクティビティ図・ブロック図・設計判断・技術参考資料一覧） |
| tech-references/*.md | {specs_dir}/tech-references/*.md | 技術参考資料（観点ごとに分割。該当情報がある場合のみ） |
| fs-design-phase4-report.txt | .aide/tmp/fs-design-phase4-report.txt | fs-design-phase4-architectureの実行レポート |

> `{specs_dir}` は `.aide/specs/{feature_name}` を指す。

# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase4-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-design-phase4-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase4-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase4-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase4）/ fix（QAゲート4 REJECTED差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
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
fs-design-phase4-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート4 REJECTED差し戻し）の場合** → 以下を実行する:
　1. progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
　2. QAゲート4から渡された fix 対象と qa_feedback を用いて Step1（システム構成設計の修正、fixモード）を直接実行する
　3. fix 完了後は後続フェーズへ前進遷移しない（後処理・コミットも実行しない）
　4. 呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため。コミットは再QA APPROVED 後にQAゲート4側で行う）
- **実行モードが通常の場合** → 以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 4）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜3の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase3-dev-plan (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==4、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>4、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<4、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase3-dev-plan (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase4-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: システム構成設計サブエージェント派遣

### 成果物
fs-design-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　system-architecture.md出力ファイルパス(Step1):（例: {specs_dir}/system-architecture.md）
　tech-references格納先(Step1):（例: {specs_dir}/tech-references/）
・本スキルディレクトリの `system-architecture-designer-prompt.md`（mode: phase4）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"システム構成設計エージェントの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　作成した図の種類（アーキテクチャ図/アクティビティ図/ブロック図）(Step1):
　作成した技術参考資料一覧(Step1):
　ユーザー合意結果(Step1):
　フェーズ1〜4レビュー依頼結果(Step1):
　ユーザー指摘事項(Step1):

### 完了条件
fs-design-phase4-report.txtの"システム構成設計エージェントの出力(Step1):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{specs_dir}/system-architecture.md がファイルサイズ1byte以上で存在し、"ユーザー合意結果(Step1):"が合意である

### 状態判定
- **完了条件を満たしている場合** → 後処理へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- **ステータスが NEEDS_CONTEXT の場合** → 不足情報を補い `system-architecture-designer-prompt.md`（mode: phase4）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- **ステータスが BLOCKED の場合** → 段階的対応（コンテキスト追加 → タスク分割 → ユーザーエスカレーション）を行い、解決するまで後処理へ進まない
- **"ユーザー合意結果(Step1):"が修正要求、または "ユーザー指摘事項(Step1):" がある場合** → 指摘内容を補い `system-architecture-designer-prompt.md`（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して system-architecture.md / tech-references/*.md を修正し、修正後 Step1 を再実行する
- **実行モードが fix（QAゲート4 REJECTED 差し戻し）の場合** → ユーザー合意取得後に後続フェーズへ前進遷移せず、後処理・コミットを行わずに呼び出し元の QAゲート4（fs-design-phase10-program）へ制御を戻す（前処理の実行モード判定に従う。再QAレビューのため）

> 注: QA指摘（ゲート4 等）またはユーザー指摘による本フェーズへの fix モード再入時も、本 Step で `system-architecture-designer-prompt.md`（mode: fix）に指摘内容（qa_feedback）を渡してサブエージェントを再実行し、ユーザー合意取得後は後続フェーズへ前進遷移せず（後処理・コミットも実行せず）、呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため）。

## 後処理

### 成果物
fs-design-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（system-architecture.md と tech-references/*.md をコミット。推奨プレフィックス: docs:）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase4-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たしたら `fs-design-phase5-gui (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズも後処理で phase-report-check(write) による進捗ファイル更新の後に git-commit-workflow を実行し、進捗の最新状態をコミットに含める。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase5-gui (aide-powers skill)`

**Called by:** 設計ワークフロー（fs-design-phase3-dev-plan (aide-powers skill) 完了後に遷移）。QAゲート4（fs-design-phase10-program）が system-architecture.md の REJECTED 時に mode=fix で再呼び出しする

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理（system-architecture.md と tech-references/*.md をインデックスに追加）
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（phase-report-check(write) の後に実行）

**Available on demand:**
- `pending-issues-management (aide-powers skill)` — 設計中に発見した問題を記録する場合
- `tech-investigation (aide-powers skill)` — 技術調査が必要な場合（特に外部IF仕様やフレームワーク制約の調査）
- `visual-companion (aide-powers skill)` — システム構成図・ブロック図・アクティビティ図の Mermaid 図をブラウザでレンダリング表示し、レイヤー構成・コンポーネント間の依存関係を視覚的に提示する。文字だけの説明より図で見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `system-architecture-designer-prompt.md` — Step 1（mode: phase4 / fix）

**Input from caller:**
- `feature_name`: プロジェクト名
- `specs_dir`: `.aide/specs/{feature_name}`
- `user-requirements.md` のパス
- `system-requirements.md` のパス
- `dev-environment.md` のパス
- `development-plan.md` のパス
- `mode`: phase4（通常）/ fix（QAゲート4 REJECTED 修正）
- `qa_feedback`: QA指摘内容（fix モードの場合）
- `fix対象`: 修正対象成果物（fix モードの場合。system-architecture.md）

**Output to next phase:**
- `{specs_dir}/system-architecture.md`（システム構成設計書）
- `{specs_dir}/tech-references/*.md`（技術参考資料。該当情報がある場合）

**Global rules:** `.aide/references/global-rules.md` を厳守
