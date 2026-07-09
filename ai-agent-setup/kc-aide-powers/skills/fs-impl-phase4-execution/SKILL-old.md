---
name: fs-impl-phase4-execution
description: "Use when implementation task list is ready and tasks need to be executed with the three-agent review loop"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 実装実行

## Overview

タスクリストの全タスクを、1タスクごとに「実装 → 2段階レビュー → [修正 → 再レビュー] → テスト作成 → 2段階テストレビュー → [修正 → 再レビュー] → テスト実行」のサイクルで実行する。ワークフローの核心部分であり、最も複雑なフェーズスキル。

**Core principle:** Fresh subagent per task + two-stage review (spec compliance then quality) + test execution = high quality, fast iteration. 1タスク内の全ステップを完遂してから次のタスクに進む。

## The Iron Law

```
1. NEVER SKIP A STEP WITHIN A TASK
   — 実装→設計レビュー→品質レビュー→[修正→再レビュー]→テスト作成→テスト設計レビュー→テスト品質レビュー→[修正→再レビュー]→テスト実行
   — この順序を1ステップたりとも飛ばしてはならない
   — 例外: 非プログラム成果物の場合は「実装→設計準拠レビュー→完了」が全ステップとなる（後述）
   — 「並列実行のため」「効率化のため」「タスクが単純だから」はステップ省略の理由にならない
   — micro-impl-agent に実装とテストを一括で委譲し、レビューを飛ばすことを絶対に禁止する

2. NEVER BATCH MULTIPLE TASKS
   — 1タスクの全サイクルを完遂してから次のタスクに進む
   — 複数タスクをまとめて実装してからまとめてレビューすることを禁止する

3. NEVER PROCEED WITHOUT BOTH REVIEWS PASSING
   — 設計準拠レビューと品質レビューの両方がPASSしない限り、次のステップに進まない
   — テスト設計レビューとテスト品質レビューの両方がPASSしない限り、テストを実行しない
   — 例外: 非プログラム成果物の場合は設計準拠レビューのPASSのみで次ステップに進める

4. ONE SUBTASK = ONE INVOCATION = ONE FILE
   — 1回の micro-impl-agent 呼び出しで実装するのはサブタスク1つ（またはサブタスクなしの親タスク1つ）
   — 1回の呼び出しで変更する**実装対象ファイル**は1つだけ
   — ただし工程チェック表（impl-process-checklist.md）の更新は報告義務であり、実装対象ファイル数に含めない
     サブエージェントは本業（実装/レビュー）完了後に、同じ呼び出し内でチェック表を更新すること

5. PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP BY THE EXECUTING SUBAGENT
   — 工程チェック表（impl-process-checklist.md）の該当セルを各ステップ完了時に必ず更新する
   — チェック表が未更新のまま次のステップに進むことを禁止する
   — チェック表に未完了のステップがあるタスクを「完了」にすることを禁止する
   — セルを更新するのは実作業を行ったサブエージェントのみ。オーケストレーターによる更新を禁止する
   — 工程チェック表は成果物種別（プログラムコード/非プログラム成果物/ドキュメント編集）に関わらず
     必ず生成し、各ステップ完了時に更新すること。
   — steering ルールの「テストは〇〇に置き換える」「リグレッションテストは動作確認チェックリストに
     読み替える」等の記述は、テスト手法の代替を述べているだけであり、工程チェック表の省略を
     許可するものではない。工程チェック表とテスト手法は独立した概念である。
   — 工程チェック表なしにタスクを「完了」にすることを禁止する。
   — セルを更新するのは実作業を行ったサブエージェントのみ。オーケストレーターによる更新を禁止する

6. AGENT WHITELIST IS ABSOLUTE — ONLY 3 AGENTS ALLOWED
   — 実装ステップで呼び出せるエージェントは以下の3つのみ:
     ・micro-impl-agent（実装・修正・テスト作成・テスト修正・テスト実行）
     ・design-review-agent（設計準拠レビュー）
     ・code-review-agent（コード品質レビュー）
   — それ以外のエージェントの使用を絶対禁止する。違反例（全て禁止）:
     ・general-task-execution（ビルトイン汎用エージェント）
     ・context-gatherer（ビルトイン調査エージェント）
     ・自作の汎用エージェント / 自己チェックエージェント
     ・任意の名前で新規作成したエージェント
   — 「実作業を行ったサブエージェント」「名前付きエージェント」という表現を口実に
     汎用エージェントを使うことは詐欺行為とみなす
   — このIron Lawは1呼び出しごとに適用される。実装フェーズで上記3エージェント以外を
     呼び出した時点でルール違反

7. ONE INVOCATION = ONE STEP
   — 1回のエージェント呼び出しで実行できるのは1ステップのみ
   — 「実装 + 設計レビュー + 品質レビュー + チェック記入」のような複数ステップの一括実行を絶対禁止する
   — 「実装 + テスト作成」「設計レビュー + 品質レビュー」のような複合実行も禁止する
   — ただし「チェック記入」は本業完了後の報告義務であり、本業を実行したサブエージェント自身が
     同じ呼び出し内で実施すること。禁止されているのは「実装+レビュー」等の異なる本業の一括実行。
   — 各ステップごとに別のエージェント呼び出しを行うこと（micro-impl-agent → 完了 →
     design-review-agent → 完了 → code-review-agent → 完了 のように分離）
   — 効率化のため、コンテキスト節約のため、シンプルだから — いかなる理由も一括実行の根拠にならない

8. NO IMPLEMENTATION WITHOUT PROCESS CHECKLIST — HARD GATE
   — 工程チェック表（impl-process-checklist.md）が存在しない状態で、いかなる実装作業も開始してはならない
   — メインプロセスの最初のステップで存在確認を行い、存在しない場合は前の計画フェーズ
     （fs-impl-phase2-preparation）に差し戻す。差し戻し時はユーザーに報告し、ワークフローを中断する
```

コンテキストの大きさ、タスクの単純さ、時間的制約 — いかなる理由もステップ省略の根拠にならない。
ただし、非プログラム成果物に対しては成果物種別に応じた適切なサイクル（後述の簡略サイクル）を適用する。これはステップ省略ではなく、成果物種別に応じた正しいサイクルの選択である。

### 並列実装の義務（重要）

**[並列可] タスクは、複数のサブエージェントを同時に起動して並列実装すること。**
タスクプランで [並列可] と指定されたタスクを順番に1つずつ実行することを禁止する。

> **誤解防止:** 「1サブエージェント=1タスク」「ONE INVOCATION = ONE STEP」は
> 「1つのサブエージェントに複数タスクをまとめて渡すな」という意味である。
> 「独立したタスクを別々のサブエージェントで同時に実行するな」という意味ではない。
> 並列可能なタスクは、それぞれ別のサブエージェントに委譲し、同時に起動すること。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | 設計書で定義されたパス | タスクリストに基づく実装コード |
| テストコード | 設計書で定義されたパス | 各実装に対応するテストコード |
| impl-progress.md | {ワークスペース}/.aide/specs/ 配下 | 実装進捗記録 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。
タスク実装ループでは個別タスクごとではなくレベル/Step 完了時に1回記録する。

呼び出しパラメータ:
- skill_name: fs-impl-phase4-execution
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 工程チェック表存在確認 HARD-GATE

**Step 1-1:** `impl-process-checklist.md` の存在を確認する
**Step 1-2:** 存在する → 次のステップへ進む
**Step 1-3:** 存在しない → **ワークフロー中断**
- ユーザーに「工程チェック表（impl-process-checklist.md）が存在しません。前の計画フェーズ（fs-impl-phase2-preparation (aide-powers skill)）に戻って作成してください。工程チェック表なしでの実装作業は Iron Law により絶対禁止です。」と報告する
- ワークフローを中断する（実装作業を一切開始しない）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `step1`, step_title: `工程チェック表存在確認 HARD-GATE`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 初期化

**Step 2-1:** `impl-task-list.md` を Read で読み込む
**Step 2-2:** `impl-progress.md` を確認し、途中再開の場合は最後に完了したタスクの次から再開する
**Step 2-3:** `doc-index.md` を Read で読み込み、設計書ファイルパスを把握する
**Step 2-4:** `dev-environment.md` を Read で読み込み、開発環境情報を把握する
**Step 2-5:** `impl-process-checklist.md` を Read で読み込む（工程チェック表）
- 存在しない場合はエラー: impl-task-planning (aide-powers skill) が生成していないため、fs-impl-phase2-preparation (aide-powers skill) に差し戻す
**Step 2-6:** 実行可能タスクの判定手順（impl-task-planning (aide-powers skill) 参照）:
- 依存先がないタスク → すぐに実装できる
- 依存先があるタスク → その全ての依存先の実装が完了したら実装できる
- 実行可能なタスクは全て同時に起動する（順番に1つずつ実行することを禁止）
- タスクが完了するたびに、新たに実行可能になったタスクを起動する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `step2`, step_title: `初期化`, artifact_dir: `.aide/specs/{feature_name}`

### 工程チェック表の使用ルール

`impl-process-checklist.md` は impl-task-planning (aide-powers skill) が生成する工程チェック表である。全タスク × 全ステップの進捗を表形式で管理する。

**更新タイミング:**
- 各ステップ完了時に該当セルを `[ ]` → `[x]` に更新する
- レビューFAIL時は修正列に `[!]` を記入し、再レビューPASS後に `[x]` に更新する

**チェック記入主体の制限（ホワイトリスト方式・絶対）:**
- セルを更新できるのは以下のホワイトリスト3エージェントのみ:
  - **micro-impl-agent (aide-powers agent)**: 「実装」「修正/再レビュー」「テスト作成」「テスト修正/再レビュー」「テスト実行」列
  - **design-review-agent (aide-powers agent)**: 「設計レビュー」「テストレビュー」列（設計準拠観点）
  - **code-review-agent (aide-powers agent)**: 「品質レビュー」「テストレビュー」列（コード品質観点）
- 上記3エージェント以外（オーケストレーター含む）が記入することを絶対禁止する
- 違反例（全て絶対禁止）:
  - `general-task-execution` に実装+レビュー+チェック記入を一括依頼
  - `context-gatherer` にチェック記入させる
  - 自作の「自己チェックエージェント」を作って記入させる
  - 任意の汎用サブエージェント名でチェック記入
  - オーケストレーター自身が記入する
- 「サブエージェント」「名前付きエージェント」「実作業を行ったエージェント」という表現を口実に汎用エージェントを使うことを禁止する。条文の文字どおりホワイトリスト3エージェントのみ許可

**オーケストレーターの責務:**
- サブエージェントを呼び出す際、プロンプトに以下を必ず含めること:
  1. チェック表のファイルパス（impl-process-checklist.md）
  2. 更新対象のセル位置（タスク番号 × ステップ列）
  3. 更新ルール（完了時 `[x]`、FAIL時 `[!]`）
  4. 「作業完了後にチェック表の該当セルを更新してください」という明示的な依頼
- サブエージェントがチェック記入を忘れた場合でも、オーケストレーター自身がセルを更新することは厳禁
- チェック記入漏れを発見した場合は、次の作業に進まず即座に同じサブエージェントを再呼び出しして記入させること
- チェック表が未更新のまま次のステップに進むことを絶対禁止する

**チェック表の検証:**
- タスク完了（ステップ9）時に、該当タスクの全セルが `[x]` であることを確認する
- 未完了セルがある場合はタスクを完了にしてはならない

### Step 3: タスク実行ループ

タスクリストのフェーズ0（共通基盤）→ フェーズ1〜N（ユースケース別）の順に、各フェーズ内のタスクを依存レベル順に実行する。

#### 並列実行ルール（依存グラフベース・最大並列度）

| ルール | 内容 |
|---|---|
| 即時起動 | 依存先が全て ✅ done のタスクは即座に起動する。他の無関係なタスクの完了を待たない |
| 最大並列度 | 起動可能なタスクが複数ある場合は全て同時に並列起動する |
| 依存先完了の確認 | タスクの全ての依存先が ✅ done になった時点で起動可能になる |
| レベルの概念は不使用 | 「レベル1が全部完了してからレベル2」のような一括待機をしない |
| ファイル競合の回避 | 依存グラフで同一ファイルを変更するタスク同士は依存関係で繋がっているため、自動的に逐次実行される |
| 設計同期時の一時停止 | 並列実行中にいずれかのタスクで設計同期が必要になった場合、他の並列タスクを一時停止し、設計同期完了後に再開する |

**実行アルゴリズム:**
1. 全タスクの依存先を確認する
2. 依存先が全て ✅ done（または依存先なし）のタスクを「起動可能」とする
3. 起動可能なタスクを全て同時に並列起動する
4. いずれかのタスクが完了したら、ステップ2に戻り新たに起動可能になったタスクを起動する
5. 全タスクが ✅ done になるまで繰り返す

#### 成果物種別の判定（タスクサイクル開始前に実施）

各タスクのサイクルを開始する前に、成果物がプログラムコードか非プログラム成果物かを判定する。

**判定基準（内容ベース）:**

| 種別 | 定義 | 例 |
|---|---|---|
| プログラムコード | プログラミング言語で書かれた、コンパイルまたはインタプリタで実行されるソースコード | .py, .ts, .js, .java, .go 等のソースファイル |
| 非プログラム成果物 | 実行されるロジックを含まないファイル | 設定ファイル(.json, .yaml, .toml)、ドキュメント(.md, .html)、データ定義、テンプレート、静的ファイル(.css, .ico) |

**判定方法:**
1. タスクの設計書参照セクションから対象ファイルの種別を確認する
2. 実際のファイル内容から、実行されるロジックを含むかを確認する
3. 判断に迷う場合はプログラムコードとして扱う（安全側に倒す）

**非プログラム成果物と判定した場合:**
- 簡略サイクルを適用する: 実装 → 設計準拠レビューのみ → 完了
- 品質レビュー（code-review-agent (aide-powers agent)）: スキップ
- テスト作成: スキップ
- テストレビュー: スキップ
- テスト実行: スキップ
- 判定理由を impl-progress.md に明記する（理由なき簡略化を禁止）

**報告例:**
```
[非プログラム成果物判定] タスク 0.3: config.json
理由: JSON形式の設定データであり、実行されるロジックを含まない
適用サイクル: 実装 → 設計準拠レビュー → 完了
```

**注意:**
- 拡張子だけで判定しない。内容を確認すること（例: .json でもスクリプト的な処理定義を含む場合はプログラムコードとして扱う）
- 判断に迷う場合は必ずプログラムコードとして扱い、フルサイクルを適用する

#### 1タスクごとのサイクル（順序厳守）

**通常サイクル（プログラムコード）:**

**Step 1:** 成果物種別判定（ステップ0）
- impl-task-list.md の該当タスクのステータス列を `⬜ todo` → `🔄 in-progress` に更新
- 上記「成果物種別の判定」に従い、プログラムコードか非プログラム成果物かを判定
- 分岐:
  - 非プログラム成果物の場合 → 簡略サイクルへ（後述）
  - プログラムコードの場合 → 通常サイクル（Step 2〜Step 10）へ

**Step 2:** pre-dispatch-checklist の実行（ステップ1）
- pre-dispatch-checklist.md の全項目を確認
- 1つでも NG なら呼び出し中止、指示内容を修正

**Step 3:** 実装（ステップ2）
- micro-impl-agent (aide-powers agent)（mode: implement）に Task で委譲
- implementer-prompt.md テンプレートで指示を構築
- 4ステータス（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）で報告を受領

**Step 4:** 2段階実装レビュー（ステップ3）
- multi-stage-code-review (aide-powers skill) の Stage 1 を実行
- design-review-agent (aide-powers agent)（mode: implementation）— spec-reviewer-prompt.md で指示
- code-review-agent (aide-powers agent)（mode: implementation）— code-quality-reviewer-prompt.md で指示
- 2つのレビューは並行起動可

**Step 5:** レビュー結果の判断フロー（ステップ4）
- 4ステップチェックリスト（後述）を実行
- 分岐:
  - FAIL → Step 5a（修正）→ Step 4（再レビュー）
  - 合理的乖離 → design-sync (aide-powers skill) 起動
  - WARNING → 対応要否判断
  - 全チェック通過 → Step 6へ
- **実装修正（Step 5a）:**
  - micro-impl-agent (aide-powers agent)（mode: fix）に Task で委譲
  - implementer-prompt.md テンプレート（fix モード）で指示
  - レビュー指摘内容をそのまま転記（要約・省略しない）
  - 修正完了後、Step 4 に戻り再レビュー

**Step 6:** テスト作成（ステップ5）
- micro-impl-agent (aide-powers agent)（mode: write_test）に Task で委譲
- implementer-prompt.md テンプレート（write_test モード）で指示

**Step 7:** 2段階テストレビュー（ステップ6）
- multi-stage-code-review (aide-powers skill) の Stage 2 を実行
- design-review-agent (aide-powers agent)（mode: test）— spec-reviewer-prompt.md（test モード）で指示
- code-review-agent (aide-powers agent)（mode: test）— code-quality-reviewer-prompt.md（test モード）で指示
- 2つのレビューは並行起動可

**Step 8:** テストレビュー結果の判断フロー（ステップ7）
- Step 5 と同じ4ステップチェックリストを実行
- 分岐:
  - FAIL → Step 8a（テスト修正）→ Step 7（再レビュー）
  - 全チェック通過 → Step 9へ
- **テスト修正（Step 8a）:**
  - micro-impl-agent (aide-powers agent)（mode: fix_test）に Task で委譲
  - implementer-prompt.md テンプレート（fix_test モード）で指示
  - 修正完了後、Step 7 に戻り再レビュー

**Step 9:** テスト実行（ステップ8）
- micro-impl-agent (aide-powers agent)（mode: run_test）に Task で委譲
- implementer-prompt.md テンプレート（run_test モード）で指示
- 対象テスト + 全体リグレッションテストを実行
- 分岐:
  - 全パス → impl-progress.md を更新
  - 失敗 → 原因特定 → 修正 → 該当レビュー再実行 → テスト再実行
  - 3回修正しても解決しない場合はユーザーに報告

**Step 10:** タスク完了（ステップ9）
- impl-task-list.md の該当タスクのステータス列を `🔄 in-progress` → `✅ done` に更新
- impl-progress.md にタスク完了を記録
- 次のタスクへ（Step 1 に戻る）

#### 非プログラム成果物の簡略サイクル

成果物種別判定で「非プログラム成果物」と判定された場合、以下の簡略サイクルを適用する:

**Step 1:** 成果物種別判定（ステップ0）
- 非プログラム成果物と判定（理由を記録）

**Step 2:** pre-dispatch-checklist の実行（ステップ1）
- pre-dispatch-checklist.md の全項目を確認

**Step 3:** 実装（ステップ2）
- micro-impl-agent (aide-powers agent)（mode: implement）に Task で委譲

**Step 4:** 設計準拠レビューのみ（ステップ3）
- design-review-agent (aide-powers agent)（mode: implementation）に Task で委譲
- 分岐:
  - PASS → Step 5へ
  - FAIL → micro-impl-agent (aide-powers agent)（mode: fix）で修正 → Step 4 再実行

**Step 5:** タスク完了（ステップ4）
- impl-task-list.md の該当タスクのステータス列を `🔄 in-progress` → `✅ done` に更新
- impl-progress.md にタスク完了を記録（非プログラム成果物判定の理由を含む）
- 次のタスクへ

**スキップされるステップ（理由）:**
- 品質レビュー: 非プログラム成果物にはコーディング規約・SOLID原則等のコード品質観点が適用不可
- テスト作成・テストレビュー・テスト実行: 非プログラム成果物は実行されるロジックを含まないため、ユニットテストの対象外

#### 親タスク完了チェック（サブタスクがある親タスクのみ）

全サブタスク完了後、以下を実行する:

**Step 1:** 親タスクの設計書セクション全体を指定して micro-impl-agent (aide-powers agent)（mode: implement / 親タスク完了チェック）を Task で呼び出す
**Step 2:** 指示内容: 「設計書の該当セクション全体を読み、実装済みコードと照合して、漏れがあれば追加実装してください。漏れがなければ『漏れなし』と報告してください」
**Step 3:** 漏れ検出時: 追加実装 → 通常通りレビュー（Step 4〜5）→ テスト（Step 6〜9）のサイクルを実行
**Step 4:** 「漏れなし」報告時: impl-task-list.md の親タスクのステータス列を `🔄 in-progress` → `✅ done` に更新し、次の親タスクに進む

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `step3`, step_title: `タスク実行ループ`, artifact_dir: `.aide/specs/{feature_name}`
>
> ※ タスク実装ループでは個別タスクごとに記録せず、依存レベル/Step 完了時に1回記録する。

### Step 4: フェーズ完了処理

各フェーズ（フェーズ0〜N）の全タスク完了時に以下を実行する:

**Step 4-1:** **ユーザー動作検証依頼**: 動作可能な状態になっている場合、ユーザーにGUI/CLI動作検証を依頼する
- 起動コマンド
- 動作可能なユースケース（何ができるか）
- まだ未実装の機能（何ができないか）
- 確認してほしいポイント
**Step 4-2:** **フィードバック対応**: ユーザーからのフィードバックがあれば修正対応する
**Step 4-3:** **gitコミット**: `git-commit-workflow` (aide-powers skill) を呼び出してコミットする
**Step 4-4:** **gitコミット忘れ禁止**: gitコミットを忘れて次のフェーズに進むことを禁止する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `step4`, step_title: `フェーズ完了処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: 全タスク完了

全フェーズの全タスクが完了したら、後処理に進む。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `step5`, step_title: `全タスク完了`, artifact_dir: `.aide/specs/{feature_name}`

### レビュー結果受領後の判断フロー（4ステップチェックリスト）

レビュー結果を受け取ったら、次のステップに進む前に必ず以下を順にチェックする:

**Step 1:** **FAIL があるか？**
- YES: micro-impl-agent (aide-powers agent)（mode: fix / fix_test）で修正 → 再レビュー
- NO: 次へ

**Step 2:** **「合理的乖離（要承認）」があるか？**
- YES: design-sync (aide-powers skill) を起動する
  - ※ 実装側が正しい場合でも、設計書を実装に合わせて修正する必要がある
  - ※ 「承認して次へ進む」だけでは不十分。設計書 = 実装の正 を維持する
- NO: 次へ

**Step 3:** **WARNING があるか？**
- YES: micro-impl-agent (aide-powers agent)（mode: fix / fix_test）で修正 → 再レビュー
  - ※ ERROR と同様、全指摘を修正 + 再レビュー必須
  - ※ 例外: 修正困難（外部ライブラリの制約、プラットフォーム固有の制限等、実装者の努力では解決できないもの）かつ WARNING レベルの場合のみ、ユーザーに理由を提示し承認を得てスキップ可能
  - ※ 「軽微だから記録して次へ」は禁止。誤記であっても修正する
- NO: 次へ

**Step 4:** **全チェック通過 → 次のステップへ進む**

**絶対に守ること:**
- 「合理的乖離」を「実質PASS」として扱い、設計書修正をスキップしてはならない
- 設計書と実装の乖離は、どちらが正しいかに関わらず、必ず `design-sync` (aide-powers skill) で同期する
- このチェックリストを飛ばして次のステップに進んではならない

### 設計不備発覚時の処理（随時）

以下のいずれかが発生した場合、`design-sync` (aide-powers skill) を起動する:

- micro-impl-agent (aide-powers agent) が「設計通りに実装できない」と報告した場合
- テストが設計の期待と矛盾する結果を返した場合
- 外部ライブラリのAPIが設計時の想定と異なる場合
- レビューエージェントが設計自体の不備を指摘した場合
- レビューで「合理的乖離（要承認）」が報告された場合

`design-sync` (aide-powers skill) が設計書修正 + タスクリスト再構築を行い、修正後のタスクから再開する。

### 作業中の問題記録（随時）

以下のいずれかが発生した場合、`pending-issues-management` (aide-powers skill: record) で問題を記録する:

- 設計書の考慮漏れが発覚した場合（設計同期で対応しきれない範囲の問題）
- 実装中に動作不良・不具合が発見された場合
- テスト実行で設計の期待と矛盾する結果が出た場合（設計同期で対応した後も残る問題）
- レビューで設計自体の根本的な不備が指摘された場合

**絶対禁止**: 実装ワークフロー作業中に、pending-issues.md の内容を理由として変更・バグ修正・リファクタリングワークフローを起動すること。

### 後処理
1. phase-compliance-check (aide-powers skill: write)
2. 次フェーズ遷移（fs-impl-phase5-final-check (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase4-execution`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

## 実装タスクの粒度ルール

| ルール | 内容 |
|---|---|
| 基本単位 | プランナーが生成したサブタスク1つ（= 1つのpublicメソッドとその関連コード） |
| メソッドのないクラス | サブタスクなしの親タスク1つが実装単位 |
| 最大単位 | 1ファイルに収まる範囲。1回の呼び出しで複数ファイルに手を入れることを禁止 |
| タスクリスト遵守 | ワークフローが独自にタスクを細分化・統合することを原則禁止 |

**複数ファイルにまたがる場合の分割ルール:**
1. まず別ファイルの必要なメソッドを先に別タスクとして実装する
2. そのタスクのレビュー・テストを完了させる
3. その後、本体のpublicメソッドを実装する

「依存先を先に実装してから本体を実装する」順序を必ず守ること。

**「粗い」の判断基準（プランナーのタスクリスト検証用）:**
以下のいずれかに該当するタスクは「粗い」と判断し、サブタスクに分割してから実行する:
- 1タスクに複数のpublicメソッドの実装が含まれている
- 1タスクで複数ファイルへの変更が必要
- 1タスクの設計参照セクションが複数クラスにまたがっている
- 「〇〇クラス全体を実装」のような記述になっている

## テンプレート運用ルール

1. **必須フィールドの省略禁止**: テンプレートの全フィールドを埋めること。情報がない場合は「なし」と明記する
2. **余計な情報の追加禁止**: テンプレートに定義されていない情報（他レイヤーの設計書、未実装クラスの情報等）は渡さない
3. **設計書セクションの絞り込み**: 設計書ファイルパスには必ず「→ セクション:」で参照範囲を指定する。ファイル全体を渡さない
4. **レビュー指摘の転記**: fix / fix_test モードでは、レビューエージェントの出力をそのまま転記する。要約・省略しない
5. **2段階レビューの並行起動可**: 設計準拠レビューとコード品質レビューは同じ対象ファイルに対して同時に呼び出してよい
6. **doc-index.md の参照**: テンプレートのファイルパスを埋める前に `doc-index.md` を確認し、正しいファイルを選択する

## Handling Implementer Status（4ステータス管理）

micro-impl-agent (aide-powers agent) は以下の4ステータスのいずれかで報告する:

| ステータス | 対応 |
|---|---|
| **DONE** | レビューに進む（ステップ3 / ステップ6） |
| **DONE_WITH_CONCERNS** | 懸念事項を確認する。正確性・スコープに関する懸念は対処してからレビューへ。観察的な懸念（「ファイルが大きくなってきた」等）は記録してレビューへ |
| **NEEDS_CONTEXT** | 不足している情報を提供し、同じタスクで再度 micro-impl-agent (aide-powers agent) を呼び出す |
| **BLOCKED** | 段階的に対応する: ①コンテキスト追加で再呼び出し ②タスクを分割 ③ユーザーにエスカレーション。同じ条件で再試行しない |

## 完了条件

以下の全てを満たすこと:

- [ ] impl-task-list.md の全タスクが完了している
- [ ] 全タスクの実装レビュー（設計準拠 + 品質）がPASSしている
- [ ] 全タスクのテストレビュー（テスト網羅性 + テスト方針準拠）がPASSしている
- [ ] 全テストが実行され、全パスしている
- [ ] 各フェーズ完了時にgitコミット済みである
- [ ] impl-progress.md に全タスクの完了が記録されている

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。Iron Law を逸脱しようとしている。

| # | Red Flag | 正しい対応 |
|---|---|---|
| 1 | 「レビューは省略して次のタスクに進もう」 | STOP。Iron Law 違反。必ず2段階レビューを通す |
| 2 | 「複数タスクをまとめて実装してからまとめてレビューしよう」 | STOP。Iron Law 違反。1タスクずつ完遂する |
| 3 | 「テストが通っているからレビューは不要」 | STOP。テスト通過とレビュー通過は別の品質軸 |
| 4 | 「設計準拠レビューだけ通せば品質レビューは省略できる」 | STOP。「外を見る」と「中を見る」は独立した観点。両方必須 |
| 5 | 「修正が1行だけだから再レビューは不要」 | STOP。修正の妥当性はレビュアーが判断する |
| 6 | 「合理的乖離だから設計書は後で直せばいい」 | STOP。`design-sync` (aide-powers skill) を今すぐ起動する |
| 7 | 「このファイル全体を実装して」と指示しようとした | STOP。粒度ルール違反。サブタスク1つずつ指示する |
| 8 | 「クラスが小さいからまとめてよい」 | STOP。粒度の基準はpublicメソッド単位。サイズは関係ない |
| 9 | 「コンテキストが大きいからステップを省略する」 | STOP。コンテキスト管理はステップ省略の理由にならない |
| 10 | 「gitコミットは全フェーズ完了後にまとめてやる」 | STOP。各フェーズ完了時にコミットする |
| 11 | 「致命的な不具合だからすぐバグ修正ワークフローを起動する」 | STOP。pending-issues.md に記録し、実装ワークフローを最後まで完遂する |
| 12 | 「general-task-execution に実装を依頼しよう」 | STOP。Iron Law #6 違反。ホワイトリスト3エージェント（micro-impl-agent (aide-powers agent) / design-review-agent (aide-powers agent) / code-review-agent (aide-powers agent)）のみ使用可 |
| 13 | 「1回の呼び出しで実装とレビューを両方やってもらおう」 | STOP。Iron Law #7 違反。1呼び出し1ステップ。各ステップごとに別エージェント呼び出し |
| 14 | 「効率化のためチェック記入も同じエージェントに任せよう」 | OK。チェック記入は本業を実行したサブエージェント自身の報告義務。同じ呼び出し内で実施すること。別エージェントに委譲するのは禁止 |
| 15 | 「自作の自己チェックエージェントを作ろう」 | STOP。詐欺行為。ホワイトリスト3エージェントのみ |
| 16 | 「context-gatherer で実装してもらおう」 | STOP。context-gatherer はビルトイン調査用。実装は micro-impl-agent (aide-powers agent) のみ |
| 17 | 「実装とテスト作成を一括で依頼しよう」 | STOP。Iron Law #7 違反。実装ステップとテスト作成ステップは別呼び出し |
| 18 | 「工程チェック表がないまま実装を開始しようとしている」 | 工程チェック表は実装の品質管理に不可欠。存在しない状態での作業は Iron Law 違反。前の計画フェーズに差し戻すこと |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| 「シンプルなタスクだからレビューは形式的」 | シンプルなタスクでもバグは入る。レビューの手間は小さいが、見逃しのリスクは大きい |
| 「テストが全部通っているから品質は問題ない」 | テストはプログラム変更と同時に変更される。テスト通過は品質の証拠にならない |
| 「時間がないからレビューを1回で済ませたい」 | 品質ゲートは時間的制約で省略できない。レビュー省略で生まれた技術的負債は、後でより多くの時間を消費する |
| 「並列実行すれば速くなるから全タスク並列にしよう」 | 並列実行は `[並列可]` マーカーのタスクのみ。依存関係を無視した並列実行はバグの温床 |
| 「設計書のセクション指定が面倒だからファイル全体を渡す」 | コンテキスト汚染の原因。必要なセクションだけを絞り込んで渡す |
| 「レビュー指摘を要約して渡した方が効率的」 | 要約は情報の欠落を招く。レビュー指摘はそのまま転記する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前のフェーズスキル:**
- `fs-impl-phase3-gui-mockup` (aide-powers skill)（GUIモックアップ確認）→ **fs-impl-phase4-execution**

**次のフェーズスキル:**
- **fs-impl-phase4-execution** → `fs-impl-phase5-final-check` (aide-powers skill)（最終チェック）

**呼び出す共通スキル:**
- `multi-stage-code-review` (aide-powers skill) — 各タスクの実装直後（implementation モード）、テスト作成直後（test モード）
- `design-sync` (aide-powers skill) — 設計不備発覚時（レビューで合理的乖離が報告された場合、実装中に設計通りに実装できない場合等）
- `git-commit-workflow` (aide-powers skill) — 各フェーズ（フェーズ0〜N）の全タスク完了時
- `pending-issues-management` (aide-powers skill) — 作業中に発見した問題の記録
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**呼び出す名前付きエージェント（agents/ 配下）:**
- `micro-impl-agent` (aide-powers agent) — 実装・修正・テスト作成・テスト修正・テスト実行
- `design-review-agent` (aide-powers agent) — 設計準拠レビュー + テスト網羅性レビュー
- `code-review-agent` (aide-powers agent) — コード品質レビュー + テスト方針レビュー

**Input from caller:**
- `impl-task-list.md` のパス
- `impl-progress.md` のパス
- `doc-index.md` のパス
- `dev-environment.md` のパス

**Global rules:** `.aide/references/global-rules.md` を厳守
