---
name: fs-design-phase8-object
description: "Use when fs-design-phase7-ddd (and gate2) is complete and object design for all layers needs to be created. Orchestrates 5 sub-phases: domain → app → infra → pres → summary, then triggers gate3 QA review."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| object-design-domain.md | .aide/specs/{feature_name}/object-design-domain.md | ドメイン層オブジェクト設計 |
| object-design-application.md | .aide/specs/{feature_name}/object-design-application.md | アプリケーション層オブジェクト設計 |
| object-design-infrastructure.md | .aide/specs/{feature_name}/object-design-infrastructure.md | インフラ層オブジェクト設計 |
| object-design-presentation.md | .aide/specs/{feature_name}/object-design-presentation.md | プレゼンテーション層オブジェクト設計 |
| object-design.md | .aide/specs/{feature_name}/object-design.md | オブジェクト設計概要（全レイヤー俯瞰） |
| ubiquitous-language.md | .aide/specs/{feature_name}/ubiquitous-language.md | ユビキタス言語辞書（phase7 から引き継ぎ。DDD不採用時は軽量な用語集が前提） |
| fs-design-phase8-report.txt | .aide/tmp/fs-design-phase8-report.txt | fs-design-phase8-objectの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase8-report.txt以外のファイルの書き出しは禁止。

本フェーズは domain → app → infra → pres → summary の5サブフェーズを順序通りに実行し、gate3（object-design-qa-agent によるオブジェクト設計QA）まで進めるオーケストレーションである。サブフェーズの実行順序（前のサブフェーズの成果物が次のサブフェーズの入力となる依存順序）は崩してはならない。各サブフェーズは1つのサブエージェントに委譲する（NEVER MERGE: 複数サブフェーズを1サブエージェントに束ねない）。QA REJECTED 後の修正は、修正後の再QAレビューを省略してはならない（APPROVED になるまで繰り返す）。

# レポート運用ルール

fs-design-phase8-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase8-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `QA再レビュー結果: N/A（QA APPROVEDのため修正ループ未実行）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（.aide/specs/{feature_name}）
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase8）/ fix（QAゲート4 REJECTED差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
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
fs-design-phase8-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート4 REJECTED差し戻し）の場合:**
  - progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - QAゲート4から渡された fix 対象と qa_feedback を用いて Step8 の修正処理（QA指摘対象レイヤーの object-design-*.md / ubiquitous-language.md を `domain-layer-object-designer-prompt.md` / `object-designer-prompt.md` の fix モードで修正）を直接実行する
  - 本フェーズ内のゲート3（Step7）は再実行しない
  - fix 完了後:
    - 後続フェーズへ前進遷移しない
    - 後処理・コミットも実行しない
    - 呼び出し元の QAゲート4（fs-design-phase10-program）に制御を戻す（再QAレビューのため）
    - コミットは再QA APPROVED 後にQAゲート4側で行う

- **実行モードが通常の場合:**
  以下の再開判定を行う。まず "進捗確認結果(前処理):" を確認する
  - FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
  - PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 8）
　  - `START_FRESH`（新規開始）→ 異常（前フェーズ1〜7の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase7-ddd (aide-powers skill)` に差し戻す
　  - `RESUME_FROM N`（N==8、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　  - `RESUME_FROM N`（N>8、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　  - `RESUME_FROM N`（N<8、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase7-ddd (aide-powers skill)` に差し戻す
　  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase8-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。


## Step 1: domain — ドメイン層設計

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・ドメイン層設計出力ファイルパス(Step1):（.aide/specs/{feature_name}/object-design-domain.md, .aide/specs/{feature_name}/ubiquitous-language.md）
・本スキルディレクトリの `domain-layer-object-designer-prompt.md`（mode: phase8_domain）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"ドメイン層設計エージェントの出力(Step1):"として記載する
　ドメイン層設計のユーザー合意(Step1):

### 完了条件
fs-design-phase8-report.txtの"ドメイン層設計エージェントの出力(Step1):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{feature_name}に対するユーザー合意が得られ、.aide/specs/{feature_name}/object-design-domain.md と .aide/specs/{feature_name}/ubiquitous-language.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep2へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合: 不足情報を補い `domain-layer-object-designer-prompt.md`（mode: phase8_domain）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- "ドメイン層設計のユーザー合意(Step1):"が修正要求の場合: 修正内容を補い `domain-layer-object-designer-prompt.md`（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して合意を得る
- BLOCKED の場合: ユーザーに報告し対応方針を確認する

## Step 2: 非ドメイン層の設計順序決定

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/layered-architecture.md` を読み込み、レイヤー構成（ドメイン層以外）を確認する。上位レイヤー（依存先）から下位レイヤー（依存元）の順に設計順序を定義する
　レイヤーリスト(Step2): {layered-architecture.md に定義された非ドメイン層のレイヤー名リスト。依存先→依存元の順}
　設計順序(Step2): {レイヤー名1（最上位=他に依存されるが他に依存しない）→ レイヤー名2 → ... → レイヤー名N（最下位=他に依存する）}
　各レイヤーの出力ファイル(Step2): {レイヤー名: object-design-{layer-name}.md の対応表}
・以降の Step 3〜(2+2N) は、ここで決定した設計順序に従って動的に構成される。各レイヤーに対して「設計 Step」と「レビュー Step」の2ステップをペアで実行する

### 完了条件
fs-design-phase8-report.txtに、layered-architecture.md から抽出したレイヤーリスト(Step2)・設計順序(Step2)・各レイヤーの出力ファイル(Step2)が記載されている

### 状態判定
完了条件を満たしていれば、設計順序の最初のレイヤーの設計 Step（Step 3）へ遷移する

## Step 3〜(2+2N): 各レイヤーの設計＋レビュー（動的 Step）

Step 2 で決定したレイヤーリストに対し、各レイヤーについて以下の2ステップをペアで繰り返す。レイヤー数を N とすると、Step 3 から Step (2+2N) まで使用する。

**命名規則:**
- 奇数番 Step (3, 5, 7, ...): レイヤー設計
- 偶数番 Step (4, 6, 8, ...): レイヤーレビュー

例: レイヤーリストが [application, infrastructure, presentation] の場合:
- Step 3: application 層設計
- Step 4: application 層レビュー
- Step 5: infrastructure 層設計
- Step 6: infrastructure 層レビュー
- Step 7: presentation 層設計
- Step 8: presentation 層レビュー

### 各レイヤーの設計 Step テンプレート

#### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{レイヤー名}層設計出力ファイルパス(Step N):（.aide/specs/{feature_name}/object-design-{layer-name}.md）
・本スキルディレクトリの `object-designer-prompt.md`（mode: phase8_{layer-name}）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"{レイヤー名}層設計エージェントの出力(Step N):"として記載する
　{レイヤー名}層設計のユーザー合意(Step N):

#### 完了条件
fs-design-phase8-report.txtの"{レイヤー名}層設計エージェントの出力(Step N):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、ユーザー合意が得られ、.aide/specs/{feature_name}/object-design-{layer-name}.md がファイルサイズ1byte以上で存在する

#### 状態判定
完了条件を満たしていれば次の Step（当該レイヤーのレビュー Step）へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、次 Step へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合: 不足情報を補い `object-designer-prompt.md`（mode: phase8_{layer-name}）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ユーザー合意が修正要求の場合: 修正内容を補い `object-designer-prompt.md`（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して合意を得る
- BLOCKED の場合: ユーザーに報告し対応方針を確認する

### 各レイヤーのレビュー Step テンプレート

#### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: object-design-qa-agent、review_scope: {レイヤー名}層のみ（object-design-{layer-name}.md 単体レビュー））、出力を"object-design-qa-agent({レイヤー名}層)の出力(Step N):"として記載する
　{レイヤー名}層レビュー結果(Step N):（APPROVED / REJECTED）

#### 完了条件
fs-design-phase8-report.txtに、{レイヤー名}層のレビュー結果（APPROVED / REJECTED）が記載されている

#### 状態判定
- APPROVED の場合: 次のレイヤーの設計 Step へ遷移する（全レイヤー完了時は summary Step へ遷移する）
- REJECTED の場合: QA指摘内容を確認し、当該レイヤーの設計を `object-designer-prompt.md`（mode: fix。QA指摘内容と修正対象ファイルを渡す）で修正する。修正後、ユーザー合意を得てから当該レイヤーのレビュー Step を再実行する（APPROVED になるまで繰り返す。最大3回で収束しない場合はユーザーに報告）

> **修正後の再レビュー省略禁止。** 「シンプルだから」「指摘通り直したから」等は全て省略の根拠にならない。

## Step (3+2N): summary — オブジェクト設計概要

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・オブジェクト設計概要出力ファイルパス:（.aide/specs/{feature_name}/object-design.md）
・本スキルディレクトリの `object-designer-prompt.md`（mode: phase8_summary）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"オブジェクト設計概要エージェントの出力:"として記載する
　オブジェクト設計概要のユーザー合意:

### 完了条件
fs-design-phase8-report.txtの"オブジェクト設計概要エージェントの出力:"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、ユーザー合意が得られ、.aide/specs/{feature_name}/object-design.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていれば品質基準確認 Step へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、次 Step へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合: 不足情報を補い `object-designer-prompt.md`（mode: phase8_summary）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ユーザー合意が修正要求の場合: 修正内容を補い `object-designer-prompt.md`（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して合意を得る
- BLOCKED の場合: ユーザーに報告し対応方針を確認する

## Step (4+2N): オブジェクト設計の品質基準確認（object-design 共通スキル）

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・object-design (aide-powers skill)を新規作成モードで activate して実行し、出力を"object-designの出力:"として記載する。その記載内容から、次の項目を判断して記載する（SOLID原則の適用状況・テスタビリティの確保・ドメインモデル貧血症の防止・レイヤー間依存の正しさ）
　品質基準確認結果:

### 完了条件
fs-design-phase8-report.txtに、object-design を実行して得た品質基準確認結果が記載されている

### 状態判定
完了条件を満たしていれば全体整合性レビュー Step へ遷移する

## Step (5+2N): 全体整合性QAレビュー（gate3: object-design-qa-agent）

## Step (5+2N): 全体整合性QAレビュー（gate3: object-design-qa-agent）

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: object-design-qa-agent、review_scope: 全体整合性レビュー（全レイヤー横断）。レイヤー間の整合性確認に限定する）、出力を"design-qa-dispatch(全体整合性)の出力:"として記載する。design-qa-dispatch 経由で object-design-qa-agent (aide-powers agent) が呼び出される。その記載内容から、次の項目を判断して記載する
　呼び出されたQAレビューアー:
　全体整合性QAレビュー結果:（APPROVED / REJECTED）

全体整合性レビューの検証項目（個別レイヤーレビューで検証済みの項目は除外し、横断的な整合性のみ検証）:

| カテゴリ | 検証内容 |
|---|---|
| B | レイヤー間依存違反チェック（全レイヤー横断） |
| E | ユビキタス言語の整合性チェック（全レイヤー横断） |
| — | レイヤー間インターフェースの整合性（引数型・戻り値型の一致） |

### 完了条件
fs-design-phase8-report.txtに、全体整合性QAレビュー結果（APPROVED / REJECTED）が記載されている

### 状態判定
完了条件を満たし、"全体整合性QAレビュー結果:"が APPROVED の場合 後処理へ遷移する。REJECTED の場合 修正ループ Step へ遷移する

## Step (6+2N): 全体整合性 QA REJECTED 修正ループ

### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・QA指摘内容から修正対象レイヤーを特定した結果を、次の項目で記載する
　修正対象レイヤー:（ドメイン層 / 非ドメイン層（レイヤー名を明記））
・修正対象がドメイン層の問題（貧血症、ユビキタス言語、集約境界、技術浸食）の場合、本スキルディレクトリの `domain-layer-object-designer-prompt.md`（mode: fix。QA指摘内容と修正対象ファイルを渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行する
・修正対象が非ドメイン層の問題（SOLID違反、レイヤー依存、テスト容易性、オブジェクト品質）の場合、本スキルディレクトリの `object-designer-prompt.md`（mode: fix。QA指摘内容と修正対象ファイルを渡す）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行する
・サブエージェントの出力を"修正エージェントの出力:"として記載する
　QA修正回数:
　修正のユーザー合意:

> **修正後の再QAレビュー省略禁止。** 「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」「前回のQAで指摘された箇所だけ修正したので部分レビューで十分」等は全て省略の根拠にならない。

> **再QA前にコミットしない。** 本 Step では修正コミットを行わない。コミットは全体整合性QAが APPROVED で確定した後、後処理（phase-report-check(write) の後）でフェーズ完了コミットとして1回行う。

### 完了条件
fs-design-phase8-report.txtの"修正エージェントの出力:"の内容を確認し、ステータスが DONE であり、修正後の対象成果物が存在し、ユーザー合意が得られている

### 状態判定
完了条件を満たしていれば修正内容をユーザーに報告し、Step (5+2N)（全体整合性QAレビュー）へ戻り再QAレビューする（APPROVED になるまで繰り返す）。

- **実行モードが fix（QAゲート4 REJECTED 差し戻し）の場合:**
  - 全体整合性QAレビューへ戻らない
  - 後処理・コミットを行わない
  - 呼び出し元のQAゲート4（fs-design-phase10-program）へ制御を戻す（前処理の実行モード判定に従う）
- NEEDS_CONTEXT の場合: 不足情報を補い該当プロンプト（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合: ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-design-phase8-report.txt

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
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase8-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータス・次フェーズ遷移先（fs-design-phase9-infra）が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-design-phase8-report.txtの"完了ステータス(後処理):"を確認したら `fs-design-phase9-infra (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズでは後処理で phase-report-check(write) により進捗ファイルを ✅ 完了 に更新した後に git-commit-workflow でフェーズ完了コミットを行う。QA REJECTED 修正（Step8）があった場合も、コミットは再QA APPROVED 確定後の本後処理で1回のみ行う（再QA前にはコミットしない）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase9-infra (aide-powers skill)` — QA APPROVED 後に遷移

**Called by:**
- `fs-design-phase7-ddd (aide-powers skill)`（ゲート2 APPROVED 後に REQUIRED SUB-SKILL で遷移）
- QAゲート4（fs-design-phase10-program）が object-design-*.md / ubiquitous-language.md の REJECTED 時に mode=fix で再呼び出しする

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `object-design (aide-powers skill)` — Step 6（新規作成モードでの品質基準確認）
- `design-qa-dispatch (aide-powers skill)` — Step 7（gate3 QAレビュー）/ Step 8（再QAレビュー）
- `git-commit-workflow (aide-powers skill)` — 後処理（フェーズ完了コミット。QA REJECTED 修正があった場合も再QA APPROVED 確定後に後処理で1回のみコミットする）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `visual-companion (aide-powers skill)` — クラス図・レイヤー間関連図・ドメインモデル図の視覚的提示
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用
- `tech-investigation (aide-powers skill)` — 技術調査が必要な場合に利用可能（1%ルール自動発動）

**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `object-design-qa-agent (aide-powers agent)` — Step 7 / Step 8（gate3）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `domain-layer-object-designer-prompt.md` — Step 1（mode: phase8_domain）、Step 8（mode: fix、ドメイン層の問題）
- `object-designer-prompt.md` — Step 2（mode: phase8_app）、Step 3（mode: phase8_infra）、Step 4（mode: phase8_pres）、Step 5（mode: phase8_summary）、Step 8（mode: fix、非ドメイン層の問題）

**Input from caller:**
- `feature_name`: プロジェクト名
- `doc_index_path`: doc-index.md のパス
- `mode`: phase8（通常）/ fix（QAゲート4 REJECTED 修正）
- `qa_feedback`: QA指摘内容（fix モードの場合）
- `fix対象`: 修正対象成果物（fix モードの場合。object-design-*.md / ubiquitous-language.md）

**Output to next phase:**
- 全レイヤーの object-design-*.md、object-design.md、ubiquitous-language.md（QA APPROVED 済み）

**Global rules:** `.aide/references/global-rules.md` を厳守
