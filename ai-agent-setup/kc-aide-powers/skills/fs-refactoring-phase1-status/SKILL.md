---
name: fs-refactoring-phase1-status
description: "Use when starting the refactoring workflow to establish safety net baseline before code changes."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-progress.md | {refactoring_dir}/refactoring-progress.md | セーフティネット基準（既存テスト全実行結果）を記録した進捗ファイル（Step2 でサブエージェントが記録） |
| fs-refactoring-phase1-report.txt | .aide/tmp/fs-refactoring-phase1-report.txt | fs-refactoring-phase1-status の実行レポート |

> このフェーズは設計成果物（design ドキュメント）を新規作成しない。セーフティネット基準は Step2 のサブエージェントが refactoring-progress.md に記録する。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase1-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-refactoring-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（refactoring_dir）
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
・progress-resume-check (aide-powers skill)を activate して実行し、出力を"progress-resume-checkの出力(前処理):"として記載する。呼び出し時の progress_file_path は以下で決定する:
　- `.aide/specs/{feature_name}/session-handover.md` が存在する場合: session-handover.md から refactoring_dir を復元し、`{refactoring_dir}/refactoring-progress.md` を渡す
　- session-handover.md が存在しない場合: 進捗ファイル不在として START_FRESH を期待する（progress_file_path に存在しないパスを渡すと START_FRESH が返る）
　progress_file_path(前処理):
　その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase1-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
　再開Step(前処理):（中断 Step から再開（Step番号と根拠を併記） / Step1 から（新規））
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):

### 完了条件
fs-refactoring-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
・PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`START_FRESH`（新規開始）→ Step1 へ遷移する
　・`RESUME_FROM N`（N==本フェーズ番号＝1）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ phase1 は最初のフェーズのため通常発生しない（万一検出した場合はユーザーに報告する）
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: HARD-GATE: 設計書ゲート

### 成果物
fs-refactoring-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-gate (aide-powers skill)を activate して実行し、出力を"design-gateの出力(Step1):"として記載する。その記載内容から、次の項目を判断して記載する
　必須ドキュメントが存在するか(Step1):
　設計逆引きが必要か(Step1):
　必須ドキュメントが存在しないのに設計逆引きしない理由(Step1):
　pending-issues.mdに追記した項目(Step1):

### 完了条件
fs-refactoring-phase1-report.txtに、design-gateを実行して得た判定結果が記載されている

### 状態判定
完了条件を満たし、fs-refactoring-phase1-report.txtの"設計逆引きが必要か(Step1):"が必要（design-gate が FAIL）の場合、design-gate が pending-issues への issue 登録（2件）とユーザーへの案内を実行済みであることを確認し、ワークフローを終了する。不要（PASS）の場合、Step2へ遷移する

## Step 2: セーフティネット基準の記録

### 成果物
fs-refactoring-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に refactoring_dir を確定する。**refactoring_dir の確定（命名・フォルダ作成）は本フェーズ（phase1）で1回だけ行い、phase2〜7 はこの値を Input from caller で引き継ぐ（後続フェーズで新規確定してはならない）。** 引き継ぎ起動（refactoring-request.md あり）・通常起動のいずれの経路でも本フェーズで refactoring_dir を確定する
　refactoring_dir の命名規則: `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`
　確定したrefactoring_dir(Step2):（本フェーズで確定した値。Step2 でサブエージェントがこのフォルダ配下に refactoring-progress.md を作成し、セーフティネット基準を記録する）
・確定した refactoring_dir から出力ファイルパスを組み立てて記載する
　セーフティネット基準の出力ファイルパス(Step2):（例: {refactoring_dir}/refactoring-progress.md）
・本スキルディレクトリの `refactoring-status-checker-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"セーフティネット基準記録エージェントの出力(Step2):"として記載する
・サブエージェントが既存テストを全実行した結果（総数・パス・失敗・スキップ）と、テスト失敗時にユーザーへ確認した対応方針を、次の項目で記載する
　テスト実行結果サマリ(Step2):
　セーフティネット基準のユーザー判断(Step2):（全パス / 元から落ちているとして記録 / 修正後に再実行 等）

### 完了条件
fs-refactoring-phase1-report.txtの"セーフティネット基準記録エージェントの出力(Step2):"の内容を確認し、{refactoring_dir}/refactoring-progress.md がファイルサイズ1byte以上で存在し、セーフティネット基準（テスト実行結果）が記録されている。テスト失敗がある場合は"セーフティネット基準のユーザー判断(Step2):"に対応方針が記載されている

### 状態判定
完了条件を満たしたうえで、以下の分岐で遷移先を決める:
- 完了条件を満たしている → Step3 へ遷移する
- テストが失敗しており"セーフティネット基準のユーザー判断(Step2):"が未確定の場合 → ユーザーに対応方針（番号付き選択肢）を確認してから Step3 へ遷移する
- サブエージェントの出力に不足情報がある場合 → 不足情報を補い `refactoring-status-checker-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する

## Step 3: 引き継ぎ判定

### 成果物
fs-refactoring-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/changes/` 配下に refactoring-request.md が存在するか機械的に確認した結果を、次の項目で記載する
　引き継ぎファイル有無(Step3):（refactoring-request.md あり / なし）
　引き継ぎ判定結果(Step3):（変更ワークフローからの引き継ぎ / 通常起動）
　引き継ぎ判定による次フェーズ(Step3):（通常起動・引き継ぎとも fs-refactoring-phase2-candidates。引き継ぎ時は phase2 を素通り通過させる）

### 完了条件
fs-refactoring-phase1-report.txtに、引き継ぎファイル有無(Step3)と引き継ぎ判定による次フェーズ(Step3)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する。判定結果は次の通り
・refactoring-request.md あり → 変更ワークフローからの引き継ぎ。フェーズ2（対象特定）を素通り通過させる（スキップせず phase2 を起動し、前処理→即後処理（完了記録のみ）で通過させる）ため、後処理完了後に fs-refactoring-phase2-candidates (aide-powers skill) へ遷移する
・refactoring-request.md なし → 通常起動。後処理完了後に fs-refactoring-phase2-candidates (aide-powers skill) へ遷移する

## 後処理

### 成果物
fs-refactoring-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（Step 2 で確定した refactoring_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・完了ステータス(後処理):（A:通常完了（次フェーズ phase2-candidates） / B:引き継ぎ完了（次フェーズ phase2-candidates・phase2 を素通り通過） / C:設計書ゲートFAIL（ワークフロー終了））
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase1-report.txtに、phase-report-check(write) を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-refactoring-phase1-report.txtの"完了ステータス(後処理):"を確認したら次フェーズへ遷移する
・A:通常完了 → `fs-refactoring-phase2-candidates (aide-powers skill)` を activate して実行する
・B:引き継ぎ完了 → `fs-refactoring-phase2-candidates (aide-powers skill)` を activate して実行する（phase2 を素通り通過させる）
・C:設計書ゲートFAIL → ワークフロー終了（Step1 で終了済みのため後処理に到達しない）

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（通常起動時）:**
- `fs-refactoring-phase2-candidates (aide-powers skill)` — 次フェーズ: リファクタリング候補一覧

**REQUIRED SUB-SKILL（引き継ぎ時: refactoring-request.md あり）:**
- `fs-refactoring-phase2-candidates (aide-powers skill)` — 次フェーズ: 候補特定を素通り通過（refactoring-request.md を対象とする）

**Called by:**
- リファクタリングワークフロー（ワークフロー開始時の最初のフェーズスキル）
- 変更ワークフロー（refactoring-request.md 経由での引き継ぎ）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `design-gate (aide-powers skill)` — Step 1（FAIL 時の pending-issues 登録とワークフロー終了も design-gate 内部で実行される）
- `phase-report-check (aide-powers skill: write)` — 後処理

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `refactoring-status-checker-prompt.md` — Step 2

**Related skills:**
- `user-profile-management (aide-powers skill)` — ユーザーとやり取りが発生する場面では activate して user-profile.md を確認し、説明粒度・選択肢の提示方法を調整する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**Input from caller:**
- `feature_name`: プロジェクト名
- （`refactoring_dir` は本フェーズ Step2 で確定する。通常起動・引き継ぎ（refactoring-request.md あり）のいずれの経路でも本フェーズが唯一の確定点となり、phase2〜7 はこの値を引き継ぐ）

**Output to next phase:**
- `refactoring_dir`: 本フェーズ Step2 で確定したリファクタリング成果物フォルダパス（phase2〜7 はこの値を引き継ぐ。phase2 のフォルダ統合で変わる場合は phase2 が成果物ごと移設する）
- セーフティネット基準（{refactoring_dir}/refactoring-progress.md に記録済み）
- 引き継ぎ判定結果（次フェーズ遷移先）

**Global rules:** `.aide/references/global-rules.md` を厳守
