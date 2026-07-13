---
name: fs-reverse-phase1-program
description: "Use when reverse-engineering program structure from an existing codebase as the first phase of the reverse-design workflow"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| program-structure.md | .aide/specs/{feature_name}/program-structure.md | 3パス解析によるプログラム構成記録（パス1+パス2+パス3） |
| pass3-survey-plan.md | .aide/specs/{feature_name}/pass3-survey-plan.md | パス3ディレクトリ単位解析の調査計画 |
| fs-reverse-phase1-report.txt | .aide/tmp/fs-reverse-phase1-report.txt | fs-reverse-phase1-programの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-reverse-phase1-report.txt以外のファイルの書き出しは禁止。

3パス解析の順序保証（オーケストレータの呼び出し制御）は維持する。パス1+パス2 → パス3調査計画 → パス3ディレクトリ単位解析（全ディレクトリ）→ パス3整合性チェックの順序を、Step の順序と各 Step の完了条件によって担保する。前 Step の完了条件を満たさずに次 Step へ進んではならない。

# レポート運用ルール

fs-reverse-phase1-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-reverse-phase1-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): N/A（初回フェーズのため前フェーズなし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}`）
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
・本フェーズを `RESUME_FROM`（N == 本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-reverse-phase1-report.txt。前回セッションのものが残っていれば）の "現在のStep:" を読み、中断していた Step があればその Step から、判定材料がなければ Step1 から再開すると判定し、結果を記載する。本フェーズは3パス解析のループを持つため、program-structure.md に既にセクションがあるディレクトリ等の実成果物も再開判定の材料とする
　再開Step(前処理):

### 完了条件
fs-reverse-phase1-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目（再開Step(前処理)含む）がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

- FAIL の場合 → 本フェーズは起点のため前フェーズがなく進捗確認はN/A。この分岐は通常発生しない。万一FAILを検出した場合はユーザーに即通知し、対応方針はユーザーが決定する
- PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（N はフェーズ番号。本フェーズ番号＝1）
  - `RESUME_FROM N`（N == 本フェーズ番号＝1）→ 本フェーズを実行する。フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う（3パス解析のループ途中再開を含む）
  - `RESUME_FROM N`（N > 本フェーズ番号）→ 後続フェーズスキル（`fs-reverse-phase2-dev-env (aide-powers skill)` 等）へ遷移する
  - `START_FRESH`（新規開始）→ Step1 へ遷移する
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: パス1+パス2解析

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・パス1+パス2解析の出力ファイルパス(Step1):（`.aide/specs/{feature_name}/program-structure.md`）
・本スキルディレクトリの `reverse-program-structure-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"パス1+パス2解析エージェントの出力(Step1):"として記載する。本エージェントは既存コードベースを解析し、ユーザーと直接対話してパス1+パス2の内容に合意を得る
　パス1+パス2合意結果(Step1):

### 完了条件
fs-reverse-phase1-report.txtのパス1+パス2解析エージェントの出力(Step1)の内容を確認し、「パス1+パス2完了」が明示され（＝ユーザー合意済み）、`.aide/specs/{feature_name}/program-structure.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep2へ遷移する。サブエージェントの出力で合意が未取得・内容が不十分な場合は、不足情報を補い `reverse-program-structure-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する。BLOCKED（解析不能等）の場合、ユーザーに報告し対応方針を確認する

## Step 2: パス3調査計画

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・パス3調査計画の出力ファイルパス(Step2):（`.aide/specs/{feature_name}/pass3-survey-plan.md`）
・本スキルディレクトリの `reverse-program-structure-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"パス3調査計画エージェントの出力(Step2):"として記載する。本エージェントはパス2までの解析結果をもとに調査計画を立て、ユーザーと直接対話して合意を得る
　パス3調査計画合意結果(Step2):

### 完了条件
fs-reverse-phase1-report.txtのパス3調査計画エージェントの出力(Step2)の内容を確認し、「パス3調査計画完了」が明示され（＝ユーザー合意済み）、`.aide/specs/{feature_name}/pass3-survey-plan.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep3へ遷移する。サブエージェントの出力で合意が未取得・内容が不十分な場合は、不足情報を補い `reverse-program-structure-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する。BLOCKED の場合、ユーザーに報告し対応方針を確認する

## Step 3: パス3ディレクトリ単位解析（ループ）

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/pass3-survey-plan.md` を読み取り、調査対象ディレクトリ一覧（総ステップ数 M）とパス2解析済みファイル一覧を抽出した結果を記載する
　調査対象ディレクトリ一覧(Step3):
　総ステップ数 M(Step3):
・調査計画の各ディレクトリについて、`.aide/specs/{feature_name}/program-structure.md` に当該ディレクトリのセクションが未記載のものを対象に、本スキルディレクトリの `pass3-directory-analysis-prompt.md` のプレースホルダー（対象ディレクトリ・出力先ファイル・パス2解析済みファイル一覧）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行する。依存先のない複数ディレクトリは複数のサブエージェントを同時に起動して並列解析してよい。各ディレクトリのサブエージェント実行結果を"パス3ディレクトリ解析エージェントの出力({ディレクトリ名})(Step3):"として記載する（{ディレクトリ名} は実際のディレクトリ名に置換する。進捗 N/M は下記「解析済みディレクトリ一覧(N/M)(Step3):」で管理する）
　解析済みディレクトリ一覧(N/M)(Step3):

### 完了条件
fs-reverse-phase1-report.txtに、調査計画の全ディレクトリ（M件）について解析エージェントの出力が記載され、`.aide/specs/{feature_name}/program-structure.md` に全ディレクトリのセクションが追記され（ファイルサイズ1byte以上）、未解析ディレクトリが残っていない

### 状態判定
完了条件を満たしていればStep4へ遷移する。あるディレクトリの追記が不十分な場合（セクション欠落・役割説明やimport情報の欠落）、同じディレクトリに対して `pass3-directory-analysis-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する（最大1回のリトライ）。リトライ後も不十分な場合はユーザーに報告し判断を仰ぐ。再開時は program-structure.md に既にセクションがあるディレクトリを解析済みとみなし、未解析ディレクトリからループを再開する

## Step 4: パス3整合性チェック

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・パス3整合性チェックの出力ファイルパス(Step4):（`.aide/specs/{feature_name}/program-structure.md`）
・本スキルディレクトリの `reverse-program-structure-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"パス3整合性チェックエージェントの出力(Step4):"として記載する。本エージェントは成果物全体の整合性（importルール統合・未到達ファイル整理・命名規則補完）を検証・補完し、ユーザーと直接対話して最終版に合意を得る
　最終版合意結果(Step4):

### 完了条件
fs-reverse-phase1-report.txtのパス3整合性チェックエージェントの出力(Step4)の内容を確認し、「プログラム構成逆引き完了」が明示され（＝ユーザー最終合意済み）、`.aide/specs/{feature_name}/program-structure.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていれば後処理へ遷移する。サブエージェントの出力で合意が未取得・内容が不十分な場合は、不足情報を補い `reverse-program-structure-reviewer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する。BLOCKED の場合、ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-reverse-phase1-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-reverse-phase1-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先(後処理)が記載されている

### 状態判定
完了条件を満たし、"フェーズ完了検証結果(後処理):" を確認する

- PASS の場合 → `fs-reverse-phase2-dev-env (aide-powers skill)` を activate して実行する
- FAIL の場合 → ユーザーに即通知し、本フェーズの未実行 Process を再実行する

注: 設計逆引きワークフローは各フェーズの後処理で git コミットを行う（各フェーズコミット型）。本フェーズでは phase-report-check(write) による進捗ファイル更新の**後**にコミットする。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-reverse-phase2-dev-env (aide-powers skill)`

**Called by:** 設計逆引きワークフロー（先頭フェーズとして）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理（進捗ファイル再開チェック）
- `phase-report-check (aide-powers skill: verify)` — 前処理（前フェーズ進捗確認）
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理（program-structure.md を doc-index.md に登録）
- `phase-report-check (aide-powers skill: write)` — 後処理（記載項目漏れ検証＋進捗更新）
- `git-commit-workflow (aide-powers skill)` — 後処理（フェーズ1全体の成果物をコミット。phase-report-check(write) の後に実行）
- `visual-companion (aide-powers skill)` — フォルダツリー・依存関係図・importツリーの視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ディレクトリの一括解析・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**呼び出さない共通スキル:**
- `design-gate (aide-powers skill)` — 設計逆引きワークフローは設計書を生成する側であり、設計書の存在確認は不要
- `design-sync (aide-powers skill)` — 逆引きは「現実の記録」であり、実装と設計書の同期は不要
- `coding-test-2review (aide-powers skill)` — コード変更を行わないため不要
- `usecase-analysis (aide-powers skill)` — ユースケース分析は設計ワークフローの担当
- `doc-sync (aide-powers skill)` — 逆引きは新規生成であり、既存設計書との同期は不要
- `pending-issues-management (aide-powers skill)` — フェーズ1単体では pending-issues の操作は不要

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `reverse-program-structure-prompt.md` — Step 1（パス1+パス2）
- `reverse-program-structure-planner-prompt.md` — Step 2（パス3調査計画）
- `pass3-directory-analysis-prompt.md` — Step 3（パス3ディレクトリ単位解析）
- `reverse-program-structure-reviewer-prompt.md` — Step 4（パス3整合性チェック）

**Input from caller:**
- `feature_name`: スペックディレクトリ名
- プロジェクトルートパス

**Output to next phase:**
- `.aide/specs/{feature_name}/program-structure.md`（パス1+パス2+パス3の全内容）

**Global rules:** `.aide/references/global-rules.md` を厳守
