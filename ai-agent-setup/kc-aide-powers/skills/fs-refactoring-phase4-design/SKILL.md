---
name: fs-refactoring-phase4-design
description: "Use when refactoring plan is approved and detailed delta design with QA review is needed before implementation"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-design.md | {refactoring_dir}/refactoring-design.md | リファクタリング差分設計書（before→after形式、外部振る舞い保持・過去不具合修正保持確認、タスク一覧含む） |
| impl-process-checklist.md | {refactoring_dir}/impl-process-checklist.md | 工程チェック表 |
| delta-{領域名}.md | {refactoring_dir}/delta-{領域名}.md | 設計系共通スキル（mode: delta）の差分設計（パターンB/C/D の場合のみ） |
| fs-refactoring-phase4-report.txt | .aide/tmp/fs-refactoring-phase4-report.txt | fs-refactoring-phase4-designの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-refactoring-phase4-report.txt以外のファイルの書き出しは禁止。

QA承認（design-qa-dispatch 経由のレビューが APPROVED）なしに次フェーズ（実装）へ遷移してはならない。修正後の再QAレビュー省略は絶対禁止。「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」等はいずれも再QA省略の根拠にならない。

# レポート運用ルール

fs-refactoring-phase4-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-refactoring-phase4-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `差分設計修正エージェントの出力(Step4): N/A（QA APPROVEDのため修正ループ未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-refactoring-phase4-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（直近のセッション引き継ぎファイル。存在する場合）と自フェーズの phase report（`.aide/tmp/fs-refactoring-phase4-report.txt`）の "現在のStep:" を読み、中断していた Step があればその Step から、なければ Step1 から再開すると判定し、結果を次の項目で記載する
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
fs-refactoring-phase4-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「再開Step(前処理):」判定に従う）
　・`RESUME_FROM N`（N>本フェーズ番号）→ 後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（リファクタリング方針が未確定）。ユーザーに報告し、前フェーズスキル `fs-refactoring-phase3-plan (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

（上記いずれの異常もなく新規実行の場合は Step1 へ遷移する）

## Step 1: 設計系共通スキル呼び出し判定

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・参照元ファイルを起動経路に応じて決定し、影響を受ける設計領域を特定した結果を、次の項目で記載する。
　- {refactoring_dir}/refactoring-candidates.md が存在する場合（通常起動経路）→ refactoring-candidates.md と {refactoring_dir}/refactoring-plan.md を読み込む
　- {refactoring_dir}/refactoring-candidates.md が存在しない場合（変更WFからの引き継ぎ経路。phase2 が候補特定を素通り通過したため candidates.md は作成されない）→ {refactoring_dir}/refactoring-plan.md を主たる参照元とし、必要に応じて引き継ぎ元の {changes_dir}/refactoring-request.md を補助参照する
　参照したファイル(Step1):（実際に読み込んだファイルパスと、選択した経路（通常起動 / 引き継ぎ）を記載）
　影響を受ける設計領域(Step1):（レイヤー構造 / オブジェクト設計 / ドメインモデル（ユビキタス言語） / インフラIF設計 / プログラム構成 / ユーザー要件 / システム要件 / GUI設計 から該当するもの）
　パターン判定(Step1):（A:コード構造改善のみ / B:レイヤー構造変更 / C:ドメインモデル再設計 / D:インフラIF変更）
・パターンB/C/D の場合、影響を受ける各設計系共通スキルを **mode: delta** で activate して実行し、出力を"設計系共通スキル(mode:delta)の出力(Step1):"として記載する。各スキルが `{refactoring_dir}/delta-{領域名}.md` に差分を出力する。実行したスキルと出力ファイルを次の項目で記載する
　呼び出した設計系共通スキルと出力ファイル(Step1):
・パターンA の場合は設計系共通スキルを呼び出さず、refactoring-designer のみで作成する旨を「呼び出した設計系共通スキルと出力ファイル(Step1):」に理由として記載する

設計系共通スキル対応表（パターンB/C/D 時に mode: delta で呼び出す）:

| パターン | 呼び出す共通スキル（mode: delta） | 出力ファイル |
|---|---|---|
| B（レイヤー構造変更） | `object-design (aide-powers skill)`（必須） / `ddd-modeling (aide-powers skill)`（DDD採用時） / `program-structure-design (aide-powers skill)`（ファイル配置変更時） | `{refactoring_dir}/delta-object-design.md` 他 |
| C（ドメインモデル再設計） | `object-design (aide-powers skill)`（必須） / `ddd-modeling (aide-powers skill)`（必須） | `{refactoring_dir}/delta-object-design.md`, `{refactoring_dir}/delta-ddd-modeling.md` |
| D（インフラIF変更） | `object-design (aide-powers skill)`（必須） / `infra-interface-design (aide-powers skill)`（必須） | `{refactoring_dir}/delta-object-design.md`, `{refactoring_dir}/delta-infra-interface.md` |

### 完了条件
fs-refactoring-phase4-report.txtに、影響を受ける設計領域・パターン判定が記載され、パターンB/C/D 時は呼び出した設計系共通スキルの出力と出力ファイルが記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: 差分設計の作成

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの refactoring_dir から出力ファイルパスを組み立てて記載する
　差分設計の出力ファイルパス(Step2):（例: {refactoring_dir}/refactoring-design.md）
・本スキルディレクトリの `refactoring-designer-prompt.md`（mode: phase3。Step 1 がパターンB/C/D の場合は設計系共通スキルの差分設計結果 `{refactoring_dir}/delta-{領域名}.md` も渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分設計作成エージェントの出力(Step2):"として記載する（サブエージェントは内部で差分設計の作成・ユーザーへの提示と合意取得まで実行する）。その記載内容から、次の項目を判断して記載する
　差分設計承認のユーザー判断(Step2):（承認 / 修正要求 / 却下・リファクタリング中止）
　差分設計承認の修正回数(Step2):
　差分設計承認の修正内容要約(Step2):

### 完了条件
fs-refactoring-phase4-report.txtの差分設計作成エージェントの出力(Step2)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{refactoring_dir}/refactoring-design.md がファイルサイズ1byte以上で存在し、かつ"差分設計承認のユーザー判断(Step2)"が承認である

### 状態判定
完了条件を満たし、fs-refactoring-phase4-report.txtの"差分設計承認のユーザー判断(Step2)"が以下の場合に分岐する。ただしステータスが DONE_WITH_CONCERNS の場合は、遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

・承認 → Step3 へ遷移する
・修正要求 → `refactoring-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step2 を再実行する
・却下・リファクタリング中止 → `fs-refactoring-phase7-final-check (aide-powers skill)` を mode=abort（abort_reason=リファクタリング却下・中止）で activate して中止クリーンアップに委ねる（自フェーズで終了処理はしない。後段の Step・後処理には進まない）
・ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `refactoring-designer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: 設計QAレビュー

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し、出力を"design-qa-dispatchの出力(Step3):"として記載する
　- 呼び出し時に渡す引数:
　　- affected_domains: Step 1 で特定した影響を受ける設計領域のリスト
　　- review_perspectives: 「過去不具合修正の保持確認」観点を含める（`{specs_dir}/bugfix/` 配下の過去バグ修正が差分設計で元に戻されていないこと・外部振る舞いが保持されることをQAレビューアーが検証するよう指示する）
　　- doc_index_path: `{specs_dir}/doc-index.md`
　- bugfix/ 配下が存在しない場合は「過去不具合修正なし」として扱う
　- その記載内容から、次の項目を判断して記載する
　呼び出されたQAレビューアー(Step3):
　QAレビュー結果(Step3):（APPROVED / REJECTED）
　過去不具合修正の保持確認結果(Step3):（保持確認OK / 要修正 / 過去不具合修正なし）
　WARNING内容(Step3):（APPROVED（WARNINGのみ）の場合に記載。なければ理由を記載）

QAレビューアー呼び分け対応表（design-qa-dispatch 経由）:

| 影響範囲 | 呼び出すQAレビューアー |
|---|---|
| 差分設計全体（常に呼び出し） | delta-design-qa-agent (aide-powers agent) |
| オブジェクト設計に影響 | object-design-qa-agent (aide-powers agent) |
| レイヤー構造変更を伴う | architecture-qa-agent (aide-powers agent) |

### 完了条件
fs-refactoring-phase4-report.txtに、design-qa-dispatch を実行して得たQAレビュー結果（APPROVED / REJECTED）が記載されている

### 状態判定
完了条件を満たし、fs-refactoring-phase4-report.txtの"QAレビュー結果(Step3)"を確認する

・APPROVED（FAIL 0件）→ Step5 へ遷移する
・APPROVED（WARNING のみ）→ WARNING内容をユーザーに共有した上で Step5 へ遷移する
・REJECTED（FAIL 1件以上）→ Step4 へ遷移する

## Step 4: QA REJECTED 修正ループ

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `refactoring-designer-prompt.md`（fixモード。QA指摘内容をそのまま転記し、refactoring-design.md のパスを渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"差分設計修正エージェントの出力(Step4):"として記載する（サブエージェントは内部で修正内容のユーザー提示まで実行する）
　QA REJECTED修正の修正回数(Step4):

> **修正後の再QAレビュー省略禁止。** 「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」「前回のQAで指摘された箇所だけ修正したので部分レビューで十分」等は全て省略の根拠にならない。修正の妥当性はQAエージェントが判断する。

### 完了条件
fs-refactoring-phase4-report.txtの差分設計修正エージェントの出力(Step4)の内容を確認し、ステータスが DONE であり、修正後の {refactoring_dir}/refactoring-design.md が存在する

### 状態判定
完了条件を満たしていれば Step3 へ戻り再QAレビューする（APPROVED になるまで繰り返す）。

・NEEDS_CONTEXT の場合 → 不足情報を補い `refactoring-designer-prompt.md`（fixモード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 5: タスク分解

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、確定済みの refactoring_dir から出力ファイルパスを組み立てて記載する
　タスク分解の出力ファイルパス(Step5):（例: {refactoring_dir}/refactoring-design.md（タスク一覧追記）, {refactoring_dir}/impl-process-checklist.md）
・impl-task-planning (aide-powers skill)を activate して実行し、出力を"impl-task-planningの出力(Step5):"として記載する
　- refactoring-design.md の差分設計を依存関係グラフ解析の上でタスク（1タスク=1ファイル単位、各タスクに既存テスト全実行の注記）に分解する
　- タスク一覧を refactoring-design.md に追記する
　- 「工程チェック表の生成（必須）」に従い {refactoring_dir}/impl-process-checklist.md を生成する
　- 依存先が全て完了したタスクから実行可能となるよう、各タスクに依存先を明記する（レベル/[並列可]マーカーは使わない）

### 完了条件
fs-refactoring-phase4-report.txtに impl-task-planningの出力(Step5) が記載され、refactoring-design.md に依存関係（依存先）付きのタスク一覧が追記され、{refactoring_dir}/impl-process-checklist.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-refactoring-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・完了ステータス(後処理):（A:通常完了 / B:却下・リファクタリング中止（Step2 で終了したため後処理未到達））
・次フェーズ遷移先(後処理):

### 完了条件
fs-refactoring-phase4-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) を実行して得た項目と完了ステータスが記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:

- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-refactoring-phase4-report.txtの"完了ステータス(後処理):"を確認したら `fs-refactoring-phase5-impl (aide-powers skill)` を activate して実行する

注: リファクタリングワークフローでは全フェーズ完了後（phase7: 最終チェック）に1回のみ git コミットを行う。本フェーズではコミットしない。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `impl-task-planning (aide-powers skill)` — Step 5 のタスク分解（依存関係グラフ解析・工程チェック表の生成）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase5-impl (aide-powers skill)` — 本スキル完了後に遷移

**Called by:**
- `fs-refactoring-phase3-plan (aide-powers skill)` — REQUIRED SUB-SKILL として本スキルに遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-qa-dispatch (aide-powers skill)` — Step 3（QAレビュー）
- `object-design (aide-powers skill)`（mode: delta）— Step 1（パターンB/C/D の場合）
- `ddd-modeling (aide-powers skill)`（mode: delta）— Step 1（パターンB/C の場合・DDD採用時）
- `infra-interface-design (aide-powers skill)`（mode: delta）— Step 1（パターンD の場合）
- `program-structure-design (aide-powers skill)`（mode: delta）— Step 1（パターンB の場合・ファイル配置変更時）
- `impl-task-planning (aide-powers skill)` — Step 5（タスク分解）
- `pending-issues-management (aide-powers skill)` — 設計中に別ワークフローで対応すべき問題を発見した場合
- `doc-index-maintenance (aide-powers skill)` — 後処理

**呼び出すQAレビューアー（design-qa-dispatch 経由・Step 3）:**
- `delta-design-qa-agent (aide-powers agent)` — 常に呼び出し（必須）
- `object-design-qa-agent (aide-powers agent)` — オブジェクト設計に影響がある場合
- `architecture-qa-agent (aide-powers agent)` — レイヤー構造変更を伴う場合

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `refactoring-designer-prompt.md` — Step 2（mode: phase3）、Step 4（mode: fix）

**Input from caller:**
- `feature_name`: 対象フィーチャー名
- `specs_dir`: `.aide/specs/{feature_name}`
- `refactoring_dir`: `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})`

**Output to next phase:**
- `refactoring_dir`: 確定済みの refactoring_dir

**Global rules:** `.aide/references/global-rules.md` を厳守
