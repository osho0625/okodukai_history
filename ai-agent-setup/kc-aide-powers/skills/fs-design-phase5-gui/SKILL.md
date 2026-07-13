---
name: fs-design-phase5-gui
description: "Use when fs-design-phase4-architecture is complete and user has agreed to the system architecture."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| gui-design.md | {specs_dir}/gui-design.md | GUI設計書（画面一覧・構成・遷移・共通UIルール）。GUIスキップ時は作成しない |
| fs-design-phase5-report.txt | .aide/tmp/fs-design-phase5-report.txt | fs-design-phase5-guiの実行レポート |

> `{specs_dir}` は `.aide/specs/{feature_name}` を指す。

# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase5-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-design-phase5-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase5-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase5-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase5）/ fix（QAゲート4 REJECTED差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
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
fs-design-phase5-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート4 REJECTED差し戻し）の場合** → 以下を実行する:
　1. progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
　2. QAゲート4から渡された fix 対象と qa_feedback を用いて Step1（GUI設計の修正と合意取得、gui-design の fix モード）を直接実行する
　3. fix 完了後は後続フェーズへ前進遷移しない（後処理・コミットも実行しない）
　4. 呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため。コミットは再QA APPROVED 後にQAゲート4側で行う）
- **実行モードが通常の場合** → 以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 5）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜4の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase4-architecture (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==5、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>5、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<5、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase4-architecture (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase5-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: GUI設計の作成（GUI要否判定を含む）

> GUI必要性の判定は gui-design (aide-powers skill) が内部で行う（FS自身は判定しない）。gui-design は user-requirements.md / system-requirements.md / system-architecture.md を踏まえて GUI 要否を判定し、GUI不要ならユーザーに報告・確認のうえ SKIPPED を返す。これによりオーケストレータ（本フェーズ）はファイル解析・要否判定という実作業を行わず、判定を gui-design に一本化する。

### 成果物
fs-design-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブスキル実行前に、出力ファイルパスを記載する
　GUI設計の出力ファイルパス(Step1):（例: {specs_dir}/gui-design.md）
・gui-design (aide-powers skill)を **create モード** で activate して実行し、出力を"gui-designの出力(Step1):"として記載する。gui-design は内部で GUI 要否判定（GUI不要時はユーザーに報告・確認のうえ SKIPPED を返す）と、GUI必要時の画面一覧の洗い出し・各画面構成設計・画面遷移定義・共通UIルール定義・gui-design.md 作成・ユーザーへの提示と合意取得まで実行する。その記載内容から、次の項目を判断して記載する
　gui-design実行ステータス(Step1):（DONE / SKIPPED / BLOCKED）
　GUI設計のユーザー合意結果(Step1):（合意 / 修正要求。SKIPPED 時は N/A）
　GUI設計修正回数(Step1):
　GUI設計修正内容要約(Step1):

> fix再入（ゲート4 REJECTED差し戻し）時は gui-design を fix モードで起動し、ピンポイント修正する（create で一から再生成しない）。

> モックアップ・画面遷移図・配色等は文字だけより図で見せた方がわかりやすい。`visual-companion (aide-powers skill)` を activate してブラウザでイメージ表示し、ユーザー確認に活用してよい。画面構成・画面遷移は視覚的に提示し、使い勝手についてユーザーの合意を得ること。

### 完了条件
fs-design-phase5-report.txtの"gui-design実行ステータス(Step1):"が DONE であり、{specs_dir}/gui-design.md がファイルサイズ1byte以上で存在し、かつ"GUI設計のユーザー合意結果(Step1):"が合意である（SKIPPED の場合は gui-design.md は作成されず、合意結果は N/A）

### 状態判定
完了条件を満たし、"gui-design実行ステータス(Step1):"と"GUI設計のユーザー合意結果(Step1):"で分岐する

- **DONE かつ合意の場合:**
  - 通常モード → 後処理へ遷移する
  - 実行モードが fix（QAゲート4差し戻し）の場合 → 後処理・コミットを実行せず、呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため）
- **DONE だが "GUI設計のユーザー合意結果(Step1):" が修正要求の場合** → gui-design (aide-powers skill)を **fix モード**（ユーザーの修正指示または QA指摘内容（qa_feedback）を fix_instructions として渡す）で activate して再実行し、修正後 Step1 を再実行する（合意が得られるまで繰り返す）
- **SKIPPED（gui-design 側でGUI不要と判定された場合）** → GUIスキップとして後処理へ遷移する（gui-design.md は作成しない。doc-index への「⏭️ スキップ」記録は後処理で行う）
- **BLOCKED** → ユーザーに状況を報告し対応方針を確認する

## 後処理

### 成果物
fs-design-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。GUI設計実施時は gui-design.md を「✅ 完了」ステータスで、GUIスキップ時は gui-design.md を「⏭️ スキップ」ステータスで記録する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する（GUI設計実施時は gui-design.md、GUIスキップ時は doc-index.md の更新をコミットする。推奨プレフィックス: docs:）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了（GUI設計実施） / B:GUIスキップ）
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase5-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と"完了ステータス(後処理):"・"次フェーズ遷移先(後処理):"が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-design-phase5-report.txtの"完了ステータス(後処理):"を確認したら `fs-design-phase6-usecase (aide-powers skill)` を activate して実行する

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**前フェーズ:**
- `fs-design-phase4-architecture (aide-powers skill)`（システム構成設計）から REQUIRED SUB-SKILL として遷移

**次フェーズ:**
- REQUIRED SUB-SKILL → `fs-design-phase6-usecase (aide-powers skill)`（ユースケース分析）

**Called by:** 設計ワークフロー（`fs-design-phase4-architecture (aide-powers skill)` 完了後）。QAゲート4（fs-design-phase10-program）が gui-design.md の REJECTED 時に mode=fix で再呼び出しする

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `gui-design (aide-powers skill)` — Step 1（GUI要否判定＋GUI設計の実作業。create モード / fix モード）
- `visual-companion (aide-powers skill)` — Step 1（モックアップ・画面遷移図・配色等の視覚的提示。イメージで見せた方がわかりやすい場面で活用）
- `doc-index-maintenance (aide-powers skill)` — 後処理（gui-design.md を「✅ 完了」または「⏭️ スキップ」で記録）
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（gui-design.md / doc-index.md のコミット）
- `pending-issues-management (aide-powers skill)` — GUI設計中に発見された問題の記録（随時）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `gui-designer-prompt.md` — gui-design (aide-powers skill) が内部で gui-designer サブエージェントを起動する際に使用する設計エージェント用プロンプト

**Input from caller:**
- `feature_name`: スペックディレクトリ名
- `specs_dir`: `.aide/specs/{feature_name}`
- `mode`: phase5（通常）/ fix（QAゲート4 REJECTED 修正）
- `qa_feedback`: QA指摘内容（fix モードの場合）
- `fix対象`: 修正対象成果物（fix モードの場合。gui-design.md）

**Output to next phase:**
- `{specs_dir}/gui-design.md`（GUI設計実施時）。GUIスキップ時は doc-index.md に「⏭️ スキップ」記録

**Global rules:** `.aide/references/global-rules.md` を厳守
