# 新スキル詳細設計: fs-change-phase2-impl

> このファイルは delta-design.md の付属設計書。新スキル `fs-change-phase2-impl` の SKILL.md を実装するための完全仕様。
> 実装フェーズではこのファイルの「SKILL.md 全文」セクションをそのままコピーすればよい。

## スキルファイル配置

- パス: `skills/fs-change-phase2-impl/SKILL.md`
- frontmatter:
  - name: `fs-change-phase2-impl`
  - description: `Use when fs-change-phase1-analysis completes and design/implementation/completion processing is needed.`
- 配置するプロンプトテンプレート（同ディレクトリ）:
  - `change-delta-designer-prompt.md`
  - `change-impact-reviewer-prompt.md`
  - `change-task-planner-prompt.md`
  - `change-doc-syncer-prompt.md`

## SKILL.md 全文

````markdown
---
name: fs-change-phase2-impl
description: "Use when fs-change-phase1-analysis completes and design/implementation/completion processing is needed."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。

# 設計・実装・完了処理フェーズ（fs-change-phase2-impl）

変更ワークフローの Phase 2。差分設計、影響範囲再検討、タスク計画、差分実装、設計書反映を実行する。

## The Iron Laws

- **担当外に踏み込まない**: 変更要件のヒアリング、影響分析、対応方針の策定をしてはならない。Phase 1（変更要件定義・影響分析・対応方針）の範囲に踏み込んではならない
- **既存設計書の直接変更禁止**: 既存設計書を直接変更してはならない。更新が必要な場合は delta-design.md の「更新が必要な設計資料」セクションに記載し、完了処理で doc-sync 経由で反映する
- **大規模設計時の分割対応**: 差分設計の規模が大きい場合（目安: 全体 300〜500 行超、または個別項目で 50 行超が複数）、サブエージェントは delta-design.md を「メイン（索引）+ 分割ファイル群」構成で作成する。後続 Step（影響範囲再精査 / タスク計画 / doc-sync / design-sync）では、メインの索引から分割ファイルを発見し、すべて入力として読み込むこと。索引のみ読んで本文を読み忘れることは厳禁

## step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。前処理完了時も同様。

呼び出しパラメータ:
- skill_name: `fs-change-phase2-impl`
- step_id: `前処理` / `step1` / `step2` ...
- step_title: Step のタイトル文字列

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| delta-design.md | {changes_dir}/delta-design.md | before→after形式の差分設計書（規模が大きい場合は索引+分割ファイル構成） |
| delta-design-{name}.md | {changes_dir}/delta-design-{name}.md | 大規模時のみ。delta-design.md から参照される分割ファイル（クラス名/テーマ名でファイル分割） |
| impact-analysis.md | {changes_dir}/impact-analysis.md | 設計内容ベースの精密な影響範囲分析（更新版） |
| delta-task-list.md | {changes_dir}/delta-task-list.md | 差分タスクリスト |
| impl-process-checklist.md | {changes_dir}/impl-process-checklist.md | 工程チェック表 |
| 実装コード | src/ 配下 | delta-task-list.md に基づく変更実装 |
| テストコード | tests/ 配下 | 各タスクに対応するテスト |
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |

## Process

### 前処理（フェーズ全体で1回のみ）

1. **progress-resume-check (aide-powers skill)** を activate して実行する
   - 入力: progress_file_path: `{changes_dir}/change-progress.md`, workflow_name: `change`
   - 戻り値による分岐:
     - `RESUME_FROM N` → N が本フェーズの Step 範囲内なら該当 Step から再開
     - `START_FRESH` → 異常。要件定義・影響分析・対応方針が未完了。前フェーズスキルに差し戻す
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了
2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する — 前フェーズ署名検証。FAIL の場合は前フェーズスキルに戻って後処理を再実行
3. **user-profile-management (aide-powers skill: apply)** を activate して実行する
4. `.aide/references/global-rules.md` を読み込み、内容に従う
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `前処理`, step_title: `前処理`）

### 差分設計区画

#### Step 1: 設計系共通スキル呼び出し判定

**処理:**

1. impact-analysis.md + approach.md を読み込む
2. 影響を受ける設計領域を特定する:
   - ユーザー要件 / システム要件 / GUI設計 / オブジェクト設計 / ユビキタス言語 / インフラIF設計 / プログラム構成
3. 変更規模による分岐:
   - **局所的変更（1〜2ファイル）** → Step 2 へ（change-delta-designer のみで作成）
   - **広範囲変更（複数領域）** → 影響を受ける各設計系共通スキルを **`mode: delta`** で activate して実行。各スキルが `{changes_dir}/delta-{領域名}.md` に差分を出力 → Step 2 で統合
4. 設計系共通スキル対応表:

| 影響を受ける設計領域 | 呼び出す共通スキル（mode: delta） | 出力ファイル |
|---|---|---|
| ユーザー要件 | `user-requirements-definition (aide-powers skill)` | `{changes_dir}/delta-user-requirements.md` |
| システム要件 | `system-requirements-definition (aide-powers skill)` | `{changes_dir}/delta-system-requirements.md` |
| GUI設計 | `gui-design (aide-powers skill)` | `{changes_dir}/delta-gui-design.md` |
| オブジェクト設計 | `object-design (aide-powers skill)` | `{changes_dir}/delta-object-design.md` |
| ユビキタス言語 | `ddd-modeling (aide-powers skill)` | `{changes_dir}/delta-ddd-modeling.md` |
| インフラIF設計 | `infra-interface-design (aide-powers skill)` | `{changes_dir}/delta-infra-interface.md` |
| プログラム構成 | `program-structure-design (aide-powers skill)` | `{changes_dir}/delta-program-structure.md` |

5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step1`, step_title: `設計系共通スキル呼び出し判定`）

#### Step 2: 差分設計の作成（サブエージェント委譲）

本スキルディレクトリの `change-delta-designer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 対応方針に基づき、新規追加・既存変更の具体的な差分設計を before→after 形式で作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| mode | `phase4` を指定 |
| doc_index_path | ワークフローコンテキスト |
| change_requirements_path | changes_dir から構築 |
| impact_analysis_path | changes_dir から構築 |
| approach_path | changes_dir から構築 |
| 設計系共通スキルの差分設計結果 | Step 1 の結果（広範囲変更時のみ） |

**Output:** `{changes_dir}/delta-design.md`（規模が大きい場合は加えて `{changes_dir}/delta-design-{name}.md` を分割ファイルとして作成）

**ステータス分岐:**
- `DONE` → Step 3 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 3 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step2`, step_title: `差分設計の作成`）

#### Step 3: 差分設計のユーザー承認

**処理:**

1. `{changes_dir}/delta-design.md` の内容を確認する
   - メインファイルの「修正対象の差分設計」「新規追加の設計」が分割ファイル索引（リンク一覧）になっている場合、各分割ファイル `{changes_dir}/delta-design-{name}.md` も読み込み、ユーザー提示時にメイン+全分割ファイルをセットで提示する
   - 分割されていない場合はメインファイルのみ提示する
2. ユーザーの判断による分岐:
   - **承認** → Step 4 へ進む
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 3 を再実行する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step3`, step_title: `差分設計のユーザー承認`）

#### Step 4: 差分設計のQAレビュー

**処理:**

1. `design-qa-dispatch (aide-powers skill)` を activate して実行する
   - 入力: mode: `delta-design`, affected_domains: Step 1 で特定した影響を受ける設計領域のリスト
2. QAレビューアー呼び分け対応表（design-qa-dispatch 経由）:

| 影響範囲 | 呼び出すQAレビューアー |
|---|---|
| 差分設計全体（常に呼び出し） | delta-design-qa-agent (aide-powers agent) |
| ユーザー要件に影響 | requirements-qa-agent (aide-powers agent) |
| アーキテクチャに影響 | architecture-qa-agent (aide-powers agent) |
| オブジェクト設計に影響 | object-design-qa-agent (aide-powers agent) |
| プログラム構成に影響 | final-design-qa-agent (aide-powers agent) |

3. 戻り値による分岐:
   - **APPROVED** → Step 6 へ
   - **REJECTED** → Step 5 へ
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step4`, step_title: `差分設計のQAレビュー`）

#### Step 5: QA REJECTED 修正ループ

> **修正後の再QAレビュー省略禁止。** 「シンプルだから」「指摘通り直したから」「コンテキストが大きいから」「ユーザーが急いでいるから」「修正後にユーザー合意を得たから」「前回のQAで指摘された箇所だけ修正したので部分レビューで十分」等は全て省略の根拠にならない。

本スキルディレクトリの `change-delta-designer-prompt.md` を Read で読み込み、fix モードでサブエージェントをディスパッチする。

**タスク:** QAレビューからの指摘に基づいて delta-design.md を修正する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| mode | `fix` を指定 |
| QA指摘内容 | QAレビュー結果（そのまま転記） |
| delta_design_path | changes_dir から構築（メインファイル。分割ファイルが存在する場合はサブエージェントが索引から特定して該当の分割ファイルを Edit する） |

**ステータス分岐:**
- `DONE` → 修正内容をユーザーに報告し、Step 4 へ戻り再QAレビュー（APPROVED になるまで繰り返し）
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step5`, step_title: `QA REJECTED 修正ループ`）

### 影響範囲再検討区画

#### Step 6: 影響範囲再精査（サブエージェント委譲）

> **シグネチャ変更全件追跡必須。** delta-design.md の before→after で変更されたシグネチャは、変更要件のスコープ内外を問わず Grep で全呼び出し元を検索して依存関係テーブルに記載する。「スコープ外だから追跡不要」は禁止。
> **セット提示必須。** 差分設計と影響分析を個別にユーザーに提示してはならない。必ずセットで提示し合意を得る。

本スキルディレクトリの `change-impact-reviewer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 差分設計の内容を踏まえて影響範囲を再調査し、シグネチャ変更全件追跡・既存要件矛盾確認・テスト対象機能特定を行い、impact-analysis.md（更新版）を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| delta_design_path | changes_dir から構築（メインファイル。サブエージェントは索引判定をして分割ファイル群も全て Read で読み込む） |
| impact_analysis_path | changes_dir から構築（Phase 1 版） |
| change_requirements_path | changes_dir から構築 |

**Output:** `{changes_dir}/impact-analysis.md`（更新版）

**ステータス分岐:**
- `DONE` → Step 7 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 7 へ
- `NEEDS_CONTEXT` → 追加情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step6`, step_title: `影響範囲再精査`）

#### Step 7: 影響範囲再検討のユーザー承認

> **セット提示必須。** 差分設計と影響分析を個別にユーザーに提示してはならない。必ずセットで提示し合意を得る。

**処理:**

1. `{changes_dir}/delta-design.md` と `{changes_dir}/impact-analysis.md`（更新版）をセットでユーザーに提示する。delta-design.md が分割構成（メイン+索引+分割ファイル群）の場合は、メインと全分割ファイルを含めて提示する
2. 提示時に特に以下を強調する:
   - テスト対象機能の一覧（新規テスト対象とリグレッションテスト対象を区別）
   - 既存要件との矛盾の有無
   - シグネチャ変更追跡結果（Phase 1 で未検出だった呼び出し元がある場合は特に強調）
   - Phase 1 からの変更点
3. ユーザーの判断による分岐:
   - **承認** → Step 8 へ進む
   - **影響分析に修正要求** → サブエージェントを再ディスパッチし、修正後 Step 7 を再実行する
   - **差分設計に修正要求** → Step 2 に差し戻す
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step7`, step_title: `影響範囲再検討のユーザー承認`）

### タスク計画区画

#### Step 8: 差分タスクリストの作成（サブエージェント委譲）

> **リグレッションテスト必須。** impact-analysis.md の「テスト対象機能」が空でない限り、リグレッションテストタスクは必ず存在する。

本スキルディレクトリの `change-task-planner-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 差分設計と影響分析をもとに、依存関係を考慮した実装タスクリストと工程チェック表を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| program_structure_path | doc-index.md から取得 |
| dev_environment_path | doc-index.md から取得 |
| delta_design_path | changes_dir から構築（メインファイル。サブエージェントは索引判定をして分割ファイル群も全て Read で読み込む） |
| impact_analysis_path | changes_dir から構築 |
| approach_path | changes_dir から構築 |

**Output:** `{changes_dir}/delta-task-list.md`, `{changes_dir}/impl-process-checklist.md`

**ステータス分岐:**
- `DONE` → Step 9 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 9 へ
- `NEEDS_CONTEXT` → 追加情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step8`, step_title: `差分タスクリストの作成`）

#### Step 9: タスクリストのユーザー承認

**処理:**

1. `{changes_dir}/delta-task-list.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認** → Step 10 へ進む
   - **修正要求** → サブエージェントを再ディスパッチして修正後 Step 9 を再実行する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step9`, step_title: `タスクリストのユーザー承認`）

### 差分実装区画

#### Step 10: 工程チェック表存在確認 HARD-GATE

> **工程チェック表（impl-process-checklist.md）が存在しない状態でいかなる実装作業も開始してはならない。**

**処理:**

1. `{changes_dir}/impl-process-checklist.md` の存在を確認する
2. 存在する → Step 11 へ
3. 存在しない → ワークフロー中断。ユーザーに「工程チェック表が存在しません。Step 8（タスク計画）に戻って作成してください」と報告し、実装作業を一切開始しない
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step10`, step_title: `工程チェック表存在確認 HARD-GATE`）

#### Step 11: 実行計画策定

**処理:**

1. `{changes_dir}/delta-task-list.md` を読み込む
2. 依存関係グラフに基づいてレベル別の実行順序を確定する
3. `dev-environment.md` を読み込み、テスト実行コマンドを確認する
4. `doc-index.md` を読み込み、設計書ファイルパスを把握する
5. 実行可能タスクの判定:
   - 依存先がない/全完了したタスク → 実行可能
   - 実行可能なタスクは全て同時に起動する
6. 各タスクの成果物種別を判定（プログラムコード / 非プログラム成果物）:
   - 判断に迷う場合はプログラムコードとして扱う（安全側）
   - 非プログラム成果物 → 簡略サイクル（実装 → 設計準拠レビューのみ）
7. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step11`, step_title: `実行計画策定`）

#### Step 12: タスク実装ループ（multi-stage-code-review 経由）

> **NEVER MERGE TASKS:** delta-task-list.md のタスク1つにつき multi-stage-code-review を1回呼び出す。複数タスクの統合は絶対禁止。
> **AGENT WHITELIST:** 呼び出せるエージェントは micro-impl-agent / design-review-agent / code-review-agent の3つのみ。
> **ONE INVOCATION = ONE STEP:** 1回のエージェント呼び出しで1ステップのみ。
> **PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP:** 各ステップ完了時に impl-process-checklist.md の該当セルを必ず更新する。
> **並列実装の義務:** `[並列可]` タスクは複数のサブエージェントを同時に起動して並列実装する。

##### サブエージェント呼び出しの基本原則（必読）

> **AI が省略しがちな失敗パターン**: 「複数タスクをまとめて1サブエージェントに依頼すれば速い」「1サブエージェントに『これらを並列でやって』と書けば並列になる」「依存関係のない独立タスクは束ねていい」— **全て誤り**。

**1呼び出し = 1サブタスク（厳格）**

`delta-task-list.md` のサブタスク1つにつき、サブエージェント（multi-stage-code-review 経由の micro-impl-agent / design-review-agent / code-review-agent）を1回呼び出す。1呼び出しで複数サブタスクを束ねてはならない。

**柔軟ルール例外（限定的）:**

以下に該当する場合のみ、同一サブエージェント呼び出しで複数 publicMethod を扱うことを許容する:

- 同一クラスかつ同一ファイル内の publicMethod 群で、各メソッドが極小（10行以下）かつ独立性が極めて低い（例: 値オブジェクトの getter / コンストラクタヘルパー）
- 例外として束ねる場合は、依頼時に「親タスクID（`parent_task_id`）」「対象 publicMethod 一覧（`target_public_methods`）」を明記し、各 publicMethod が個別に検証できるよう情報を渡す

**この例外の適用は限定的。原則は 1呼び出し = 1サブタスク。** 「効率」「速度」「コンテキスト節約」を理由とした束ねは例外として認めない。

**なぜ細かく呼び出すのか（理由）:**

| 理由 | 説明 |
|---|---|
| 精度向上（コンテキスト最小化） | AI はコンテキストが小さいほど推論精度が高い。1サブタスク分の情報だけ渡せば、サブエージェントは無関係な情報に惑わされず、設計書の該当セクション・対象ファイル・テスト観点を正確に処理できる |
| 並列実行による高速化 | 依存関係のない複数サブタスクは、それぞれ独立サブエージェントとして同時起動できる。1呼び出しで束ねると逐次実行となり、結局遅くなる |
| 失敗の局所化 | 1呼び出しが複数サブタスクを抱えると、1つのサブタスクが失敗した場合の切り戻し範囲が大きくなる。1呼び出し=1サブタスクなら失敗はそのサブタスクに局所化される |
| レビュー精度の向上 | design-review-agent / code-review-agent は1ファイル/1メソッドに集中するほど検証精度が上がる |

##### サブエージェント呼び出しの具体手順

各サブタスクのサイクルで、以下の手順をこの順で実行する:

**処理:**

レベル1から順に実行。同一レベル内の全タスク（並列・逐次とも）が完了するまで次のレベルに進まない。

各タスクのサイクル:

1. 呼び出し前チェックリスト実行:
   - **粒度チェック（最重要）:**
     - 1呼び出し = 1サブタスクになっているか
     - 複数サブタスクを束ねていないか
     - 「並列でやって」「これらを順番にやって」のような複数指示が含まれていないか
     - 柔軟ルール例外を使う場合: 同一クラス/同一ファイル/極小（10行以下）の publicMethod のみか、親タスクID（`parent_task_id`）・対象 publicMethod 一覧（`target_public_methods`）を明記しているか
   - 設計書チェック（doc-index.md から取得 / セクション絞り込み済み / テスト観点を差分設計から転記）
   - テンプレートチェック（必須フィールド全埋め / 余計なフィールドなし / dev-environment.md 含めた）
   - 1つでも NG → 呼び出し中止、指示内容修正
2. **サブエージェント呼び出しのペイロードテンプレート（必須項目）:**
   - **task_id**: delta-task-list.md のサブタスクID（例: D-001-1）
   - **task_title**: サブタスクのタイトル（例: OrderRepository.find_by_id の実装）
   - **target_file**: 対象ファイル（1ファイルのみ）
   - **test_file**: テストファイル（プログラムコードの場合）
   - **design_refs**: 設計書ファイルパス + セクション名（delta-design.md の該当セクション、分割構成の場合は該当分割ファイル）
   - **test_perspectives**: テスト観点（リグレッションテスト観点含む）
   - **dependencies**: 依存先（既に完了済みのクラス/モジュールのファイルパス）
   - **dev_environment**: dev-environment.md のパス
   - **task_kind**: タスク種別（normal / bugfix / change / refactoring）
   - **bugfix_dir**: bugfix/ ディレクトリパス（過去不具合修正の保持検証用。task_kind が bugfix 以外でも、設計準拠レビュー時に過去不具合修正の喪失検出のため任意項目として渡す。bugfix/ ディレクトリが存在しない場合は省略可）
3. `multi-stage-code-review (aide-powers skill)` を activate して実行する:
   - 渡すコンテキスト: 上記ペイロードテンプレートの全項目
   - 内部で実行される Stage:
     - Stage 1: 実装コードレビュー（micro-impl-agent → design-review-agent → code-review-agent → FAIL なら fix → 全PASS）
     - Stage 2: テストコードレビュー（プログラムコードのみ）
     - Stage 3: テスト実行（プログラムコードのみ）
   - multi-stage-code-review 内部で「依頼内容チェック」が実行され、複数サブタスク統合等の違反がある場合 BLOCKED で返される
4. 非プログラム成果物の場合は簡略サイクル: 実装 → 設計準拠レビューのみ → 完了
5. レビュー結果受領後の判断フロー実行（Step 13）
6. タスク完了 → 次のタスクへ
7. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step12`, step_title: `タスク実装ループ`）

注: step-history-writer は各タスク完了時ではなく、全タスクのレベル完了時または Step 12 全体完了時に1回呼び出す。

#### Step 13: レビュー結果受領後の判断フロー

**処理:**

各タスクの multi-stage-code-review 完了時に実行:

1. multi-stage-code-review の報告ステータスを確認する:
   - `ALL_PASS` → タスク完了。次のタスクへ
   - `PASS_WITH_DEVIATION` → design-sync 起動（下記2へ）
   - `PASS_WITH_WARNING` → WARNING 内容を記録し、次のタスクへ
2. `PASS_WITH_DEVIATION`（合理的乖離検出）の場合:
   - `design-sync (aide-powers skill)` を activate して実行する
   - delta-design.md を修正、必要に応じて delta-task-list.md を再構築（delta-design.md が分割構成になっている場合は、該当の分割ファイル側を修正する）
   - 並列実行中なら他タスクを一時停止
   - 設計同期完了後、修正後のタスクから再開
3. 注: FAIL は multi-stage-code-review 内部で修正→再レビューが完了しているため、オーケストレータに FAIL が返ることはない
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step13`, step_title: `レビュー結果受領後の判断フロー`）

注: Step 13 は Step 12 の各タスクサイクル内で実行されるため、step-history-writer は Step 12 完了時にまとめて記録する。

#### Step 14: リグレッションテスト

**処理:**

1. 全タスク完了後、既存テスト全実行する
2. 結果による分岐:
   - **全パス** → Step 15 へ
   - **失敗あり** → 原因特定 → 修正 → 再実行（最大3回）
   - **3回失敗** → ユーザーに報告し対応方針を確認
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step14`, step_title: `リグレッションテスト`）

#### Step 15: ユーザー動作検証依頼

**処理:**

1. 変更した機能が動作可能な状態になったことをユーザーに報告する
2. 動作検証を依頼する。伝える内容:
   - 変更した機能の概要
   - 動作確認の手順
   - 確認してほしいポイント
   - 影響がある既存機能
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step15`, step_title: `ユーザー動作検証依頼`）

### 完了処理区画

#### Step 16: 設計書反映（サブエージェント委譲）

本スキルディレクトリの `change-doc-syncer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** delta-design.md の内容を既存設計書にマージし、変更履歴（history.md）を初期作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| delta_design_path | changes_dir から構築（メインファイル。サブエージェントは索引判定をして分割ファイル群も全て Read で読み込む） |
| change_requirements_path | changes_dir から構築 |
| impact_analysis_path | changes_dir から構築（更新版） |

**Output:** 既存設計書の更新、`{changes_dir}/history.md`

**ステータス分岐:**
- `DONE` → Step 17 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 17 へ
- `NEEDS_CONTEXT` → 追加情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step16`, step_title: `設計書反映`）

#### Step 17: pending-issues 書き込み忘れチェック

**処理:**

1. `pending-issues-management (aide-powers skill: check)` を activate して実行する
   - 入力: progress_file_path: `{changes_dir}/change-progress.md`, pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`
2. 共通スキルが進捗ファイルを遡り、書き込み漏れパターンを検索する
3. 戻り値による分岐:
   - **書き込み漏れなし** → Step 18 へ
   - **書き込み漏れあり** → ユーザーに確認の上で pending-issues.md に追記 → Step 18 へ
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step17`, step_title: `pending-issues 書き込み忘れチェック`）

注: pending-issues.md の有無に関わらず実行する（進捗ファイル遡り照合が目的）。

#### Step 18: 変更完了の案内

**処理:**

1. 変更内容サマリーを作成・提示する:
   - 変更要求（change-requirements.md の概要）
   - 変更内容（delta-design.md の概要）
   - 実装タスク（delta-task-list.md のタスク一覧）
2. 更新設計書一覧を提示する
3. テスト実行結果を提示する（全テスト・リグレッションテスト）
4. changes/ 配下の変更履歴を提示する（changes_dir パス + 格納ドキュメント一覧）
5. pending-issues 対応方針確認:
   - pending-issues.md が存在 → `pending-issues-management (aide-powers skill: present)` で問題一覧を重要度順に提示し、各問題の対応方針を確認
   - pending-issues.md が存在しない → 「未対応の問題はありません」と報告
6. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `step18`, step_title: `変更完了の案内`）

### 後処理（フェーズ全体で1回のみ）

1. **doc-index-maintenance (aide-powers skill)** を activate して実行する
2. **phase-compliance-check (aide-powers skill: write)** を activate して実行する — フェーズ完了検証と進捗ファイル更新
3. **user-profile-management (aide-powers skill: update)** を activate して実行する
4. **次フェーズ遷移:** `fs-change-phase3-final-check (aide-powers skill)` を activate して実行する

注: 変更ワークフローでは最終フェーズ（Phase 3 final-check）の進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase2-impl`, step_id: `後処理`, step_title: `後処理`）

## 完了条件

以下の全てを満たした状態:

1. delta-design.md が作成され、ユーザー承認 + QA APPROVED 済み（規模により分割構成の場合はメイン+全分割ファイルを含む）
2. impact-analysis.md が更新版として作成され、ユーザー承認済み（差分設計とセット提示）
3. delta-task-list.md が作成され、ユーザー承認済み
4. impl-process-checklist.md が作成され、全タスク・全ステップが完了済み
5. delta-task-list.md の全タスクが実装完了し、レビュー全PASS、テスト全PASS、リグレッションテスト全パス
6. ユーザーに動作検証を依頼済み
7. delta-design.md の内容が既存設計書にマージされ、history.md が初期作成されている
8. pending-issues 書き込み忘れチェックが完了している
9. 変更完了の案内がユーザーに提示されている
10. 進捗ファイル（change-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
11. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
12. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
13. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `step-history-writer (aide-powers skill)` — 各 Step 末尾で実行
- `multi-stage-code-review (aide-powers skill)` — Step 12 の各タスクで必ず実行
- `impl-task-planning (aide-powers skill)` — Step 8 のタスク分解ルールの参照元

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-change-phase3-final-check (aide-powers skill)`

**Called by:**
- `fs-change-phase1-analysis (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-change-phase2-impl`

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理1
- `phase-compliance-check (aide-powers skill: verify)` — 前処理2
- `user-profile-management (aide-powers skill)` — 前処理3 (apply) / 後処理3 (update)
- `design-qa-dispatch (aide-powers skill)` — Step 4（QAレビュー）
- `user-requirements-definition (aide-powers skill)`（差分モード）— Step 1（ユーザー要件に影響時）
- `system-requirements-definition (aide-powers skill)`（差分モード）— Step 1（システム要件に影響時）
- `gui-design (aide-powers skill)`（差分モード）— Step 1（GUI設計に影響時）
- `object-design (aide-powers skill)`（差分モード）— Step 1（オブジェクト設計に影響時）
- `ddd-modeling (aide-powers skill)`（差分モード）— Step 1（ユビキタス言語に影響時）
- `infra-interface-design (aide-powers skill)`（差分モード）— Step 1（インフラIF設計に影響時）
- `program-structure-design (aide-powers skill)`（差分モード）— Step 1（プログラム構成に影響時）
- `design-sync (aide-powers skill)` — Step 13（合理的乖離検出時）
- `doc-sync (aide-powers skill)` — Step 16（設計書反映）
- `pending-issues-management (aide-powers skill)` — Step 17 (check) / Step 18 (present)
- `doc-index-maintenance (aide-powers skill)` — 後処理1

**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `delta-design-qa-agent (aide-powers agent)` — 常に呼び出し
- `requirements-qa-agent (aide-powers agent)` — 要件に影響時
- `architecture-qa-agent (aide-powers agent)` — アーキテクチャに影響時
- `object-design-qa-agent (aide-powers agent)` — オブジェクト設計に影響時
- `final-design-qa-agent (aide-powers agent)` — プログラム構成に影響時

**呼び出す名前付きエージェント（multi-stage-code-review 経由のみ。直接呼び出し禁止）:**
- `micro-impl-agent (aide-powers agent)`
- `design-review-agent (aide-powers agent)`
- `code-review-agent (aide-powers agent)`

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `change-doc-syncer-prompt.md` — Step 16

**Input from caller:**
- `feature_name`: プロジェクト名
- `changes_dir`: 確定済みの changes_dir（Phase 1 で確定）
- `doc_index_path`: doc-index.md のパス

**Global rules:** `.aide/references/global-rules.md` を厳守
````

---

## サブエージェントプロンプトテンプレート

プロンプトテンプレートの全文は以下の別ファイルを参照:

→ [delta-design-fs-change-phase2-prompts.md](./delta-design-fs-change-phase2-prompts.md)

含まれるプロンプト:
- `change-delta-designer-prompt.md`（mode: phase4 / fix）
- `change-impact-reviewer-prompt.md`
- `change-task-planner-prompt.md`
- `change-doc-syncer-prompt.md`
