---
name: fs-refactoring-phase5-impl
description: "Use when refactoring design is approved and ready for implementation with safety-net testing"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# フェーズ5: リファクタリング実装フェーズ（セーフティネット付き）

## Overview

**Core principle:** 3エージェント体制で実装し、各タスク完了ごとに既存テスト全実行（セーフティネット）で外部振る舞いの保持を確認する。テストが落ちたら外部振る舞いが変わった証拠として即座に修正する。

## The Iron Law

```
NO TASK ACCEPTED WITHOUT FULL EXISTING TEST SUITE PASSING.
既存テスト全実行をパスしない限り、タスクを完了として受け入れてはならない。

PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP.
工程チェック表（impl-process-checklist.md）の該当セルを各ステップ完了時に必ず更新する。
チェック表が未更新のまま次のステップに進むことを禁止する。
全タスクの全チェックが埋まるまでワークフローを完了にしてはならない。
セルを更新するのは当該ステップで定義された名前付きエージェント（micro-impl-agent / design-review-agent / code-review-agent）のみ。オーケストレーターによる更新を禁止する。
自己チェック用サブエージェントの新規作成・使用を禁止する（詐欺行為とみなす）。
サブエージェント呼び出し時にチェック表パス・更新対象セル・更新ルール・記入依頼を必ず含めること。
サブエージェントが記入を忘れた場合でも自分で記入は厳禁。次の作業に進めず即座に再呼び出しで記入させること。
工程チェック表は成果物種別（プログラムコード/非プログラム成果物/ドキュメント編集）に関わらず
必ず生成し、各ステップ完了時に更新すること。
steering ルールの「テストは〇〇に置き換える」「リグレッションテストは動作確認チェックリストに
読み替える」等の記述は、テスト手法の代替を述べているだけであり、工程チェック表の省略を
許可するものではない。工程チェック表とテスト手法は独立した概念である。
工程チェック表なしにタスクを「完了」にすることを禁止する。

NO IMPLEMENTATION WITHOUT PROCESS CHECKLIST — HARD GATE
工程チェック表（impl-process-checklist.md）が存在しない状態で、いかなる実装作業も開始してはならない。
メインプロセスの最初のステップで存在確認を行い、存在しない場合は前の計画フェーズ
（fs-refactoring-phase4-design）に差し戻す。差し戻し時はユーザーに報告し、ワークフローを中断する。

AGENT WHITELIST IS ABSOLUTE — ONLY 3 AGENTS ALLOWED
実装ステップで呼び出せるエージェントは micro-impl-agent / design-review-agent / code-review-agent の3つのみ。
general-task-execution / context-gatherer / 自作汎用エージェントの使用を絶対禁止する。

ONE INVOCATION = ONE STEP
1回のエージェント呼び出しで実行できるのは1ステップのみ。
「実装+レビュー+チェック記入」の一括実行を絶対禁止する。各ステップごとに別エージェント呼び出し。
※ ただし「チェック記入」は本業完了後の報告義務であり、本業を実行したサブエージェント自身が
  同じ呼び出し内で実施すること。禁止されているのは「実装+レビュー」等の異なる本業の一括実行。
```

このIron Lawは、リファクタリングの本質（外部振る舞いを変えずに内部構造を改善する）を保証するセーフティネットである。既存テストが全パスしていることが、外部振る舞いが保持されている唯一の客観的証拠となる。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | refactoring-design.md で指定されたパス | リファクタリング対象の実装コード |
| テストコード | refactoring-design.md で指定されたパス | リファクタリングに伴うテストコード |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。
タスク実装ループでは個別タスクごとではなくレベル/Step 完了時に1回記録する。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase5-impl
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: 工程チェック表存在確認 HARD-GATE

1. `{changes_dir}/impl-process-checklist.md` の存在を確認する
2. 存在する → Step 2 へ進む
3. 存在しない → **ワークフロー中断**
   - ユーザーに「工程チェック表（impl-process-checklist.md）が存在しません。前の計画フェーズ（fs-refactoring-phase4-design (aide-powers skill)）に戻って作成してください。工程チェック表なしでの実装作業は Iron Law により絶対禁止です。」と報告する
   - ワークフローを中断する（実装作業を一切開始しない）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `step1`, step_title: `工程チェック表存在確認 HARD-GATE`, artifact_dir: `{refactoring_dir}`

### Step 2: タスク読み込み

1. `refactoring-design.md` のタスク一覧を Read で読み込む
2. 依存グラフ（Mermaid + 実行リンク）に従って実行順序を決定する。並列スタートから開始し、依存先完了で次タスクを起動
3. タスクの実行順序、依存関係を把握する
4. `doc-index.md` を Read で読み込み、設計書ファイルパスを確認する
5. `dev-environment.md` を Read で読み込み、テスト実行コマンドを確認する
6. 実行可能タスクの判定手順（impl-task-planning (aide-powers skill) 参照）:
   - 依存先がないタスク → すぐに実装できる
   - 依存先があるタスク → その全ての依存先の実装が完了したら実装できる
   - 実行可能なタスクは全て同時に起動する（順番に1つずつ実行することを禁止）
   - タスクが完了するたびに、新たに実行可能になったタスクを起動する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `step2`, step_title: `タスク読み込み`, artifact_dir: `{refactoring_dir}`

### Step 3: タスク実行ループ

各タスクについて、以下のサイクルを実行する（1タスクが完了するまで次に進まない）。

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
- 判定理由を refactoring-progress.md に明記する（理由なき簡略化を禁止）

**報告例:**
```
[非プログラム成果物判定] タスク 0.3: config.json
理由: JSON形式の設定データであり、実行されるロジックを含まない
適用サイクル: 実装 → 設計準拠レビュー → 完了
```

**注意:**
- 拡張子だけで判定しない。内容を確認すること（例: .json でもスクリプト的な処理定義を含む場合はプログラムコードとして扱う）
- 判断に迷う場合は必ずプログラムコードとして扱い、フルサイクルを適用する

#### Step A: 実装

1. `implementer-prompt.md` を使用して micro-impl-agent (aide-powers agent)（implement モード）を Task でディスパッチする
   - `refactoring-design.md` の該当セクションのみを渡す
   - テスト観点をリファクタリング設計書から転記して渡す
   - 依存先ファイル、既存規約参照ファイル、過去不具合修正履歴を渡す

2. 実装完了後、2つのレビューを**並行して** Task でディスパッチする:
   - `spec-reviewer-prompt.md` を使用して design-review-agent (aide-powers agent)（implementation モード）を起動
   - `code-quality-reviewer-prompt.md` を使用して code-review-agent (aide-powers agent)（implementation モード）を起動

3. レビュー結果判断フロー（4ステップチェックリスト）:
   a. FAIL があるか？ → YES: `implementer-prompt.md`（fix モード）で修正 → 再レビュー
   b. 合理的乖離があるか？ → YES: `design-sync (aide-powers skill)` を起動
   c. WARNING があるか？ → YES: 対応要否を判断
   d. 全チェック通過 → Step B へ

#### Step B: テスト

1. `implementer-prompt.md` を使用して micro-impl-agent (aide-powers agent)（write_test モード）を Task でディスパッチする
   - テスト観点をリファクタリング設計書から転記して渡す

2. テストコード完了後、2つのレビューを**並行して** Task でディスパッチする:
   - `spec-reviewer-prompt.md` を使用して design-review-agent (aide-powers agent)（test モード）を起動
   - `code-quality-reviewer-prompt.md` を使用して code-review-agent (aide-powers agent)（test モード）を起動

3. テストレビュー結果判断フロー:
   a. FAIL があるか？ → YES: `implementer-prompt.md`（fix_test モード）で修正 → 再レビュー
   b. 全チェック通過 → Step C へ

#### Step C: テスト実行 + セーフティネット

1. `implementer-prompt.md` を使用して micro-impl-agent (aide-powers agent)（run_test モード）を Task でディスパッチする
   - 対象テストを実行する
2. **セーフティネット: 既存テスト全実行**（Iron Law）
   - プロジェクトの全テストを Bash で実行する
   - テスト実行コマンドは `dev-environment.md` の記載を優先する
3. テスト失敗時の対応:
   - 失敗したテストを特定する
   - 外部振る舞いが変わった可能性があるため、即座に修正する
   - 修正後、該当レビューを再実行 → テスト再実行（全パスまで）
4. 全パス確認後、`refactoring-progress.md` を Edit で更新する

#### Step D: 次のタスクへ

- 現在のタスクが完了（全テストパス）
- 次のタスクに進む（Step 3 の先頭に戻る）

#### 非プログラム成果物の簡略サイクル

成果物種別判定で「非プログラム成果物」と判定された場合、以下の簡略サイクルを適用する:

**Step 1:** 成果物種別判定
- 非プログラム成果物と判定（理由を記録）

**Step 2:** 実装
- micro-impl-agent (aide-powers agent)（mode: implement）に Task で委譲

**Step 3:** 設計準拠レビューのみ
- design-review-agent (aide-powers agent)（mode: implementation）に Task で委譲
- 分岐:
  - PASS → Step 4へ
  - FAIL → micro-impl-agent (aide-powers agent)（mode: fix）で修正 → Step 3 再実行

**Step 4:** タスク完了
- refactoring-progress.md にタスク完了を記録（非プログラム成果物判定の理由を含む）
- 次のタスクへ

**スキップされるステップ（理由）:**
- 品質レビュー: 非プログラム成果物にはコーディング規約・SOLID原則等のコード品質観点が適用不可
- テスト作成・テストレビュー・テスト実行: 非プログラム成果物は実行されるロジックを含まないため、ユニットテストの対象外

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `step3`, step_title: `タスク実行ループ`（個別タスクごとではなく、レベル/Step 完了時に1回記録する）, artifact_dir: `{refactoring_dir}`

### Step 4: 並列実行制御

- `[並列可]` マーカーのタスクは同一レベル内で同時実行可能
- 各並列タスクは独立して Step A〜C のサイクルを完遂する
- 同一レベル内の全タスクが完了するまで、次のレベルに進まない
- `[逐次]` マーカーのタスクは記載順に1つずつ実行する
- **並列実行中に設計同期が必要になった場合**: 他の並列タスクを一時停止し、設計同期完了後に再開する

### 並列実装の義務（重要）

**[並列可] タスクは、複数のサブエージェントを同時に起動して並列実装すること。**
タスクプランで [並列可] と指定されたタスクを順番に1つずつ実行することを禁止する。

> **誤解防止:** 「1サブエージェント=1タスク」「ONE INVOCATION = ONE STEP」は
> 「1つのサブエージェントに複数タスクをまとめて渡すな」という意味である。
> 「独立したタスクを別々のサブエージェントで同時に実行するな」という意味ではない。
> 並列可能なタスクは、それぞれ別のサブエージェントに委譲し、同時に起動すること。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `step4`, step_title: `並列実行制御`, artifact_dir: `{refactoring_dir}`

### Step 5: 完了

- 全タスクが完了し、全既存テストがパスしている状態
- ユーザーに動作検証を依頼する:
  - 起動コマンド
  - 変更内容
  - 確認ポイント
  - テスト実行結果

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `step5`, step_title: `完了`, artifact_dir: `{refactoring_dir}`

### 後処理
1. phase-compliance-check (aide-powers skill: write)
2. 次フェーズ遷移（REQUIRED SUB-SKILL: `fs-refactoring-phase6-doc (aide-powers skill)`）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase5-impl`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

### 完了条件

以下の全てを満たすこと:
1. `refactoring-design.md` の全タスクが完了している
2. 全既存テストがパスしている（セーフティネット最終確認）
3. `refactoring-progress.md` に全タスクの完了が記録されている
4. ユーザーに動作検証を依頼済み

## レビュー結果判断フロー（必須チェックリスト）

レビュー結果を受け取ったら、次のステップに進む前に必ず以下を順にチェックする。

```
1. FAIL があるか？
   → YES: micro-impl-agent（mode: fix / fix_test）で修正 → 再レビュー
   → NO: 次へ

2. 「合理的乖離（要承認）」があるか？
   → YES: design-sync (aide-powers skill) を起動する
          - refactoring-design.md を修正する（既存設計書は変更しない）
          - タスクリストを再構築する
          - 「承認して次へ進む」だけでは不十分。設計書 = 実装の正 を維持する
   → NO: 次へ

3. WARNING があるか？
   → YES: 内容を確認し、対応要否を判断する
          - 軽微（コーディングスタイル等）: 記録して次へ進む
          - 設計に関わる WARNING: design-sync (aide-powers skill) の起動を検討する
   → NO: 次へ

4. 全チェック通過 → セーフティネット（既存テスト全実行）→ 次のタスクへ
```

## micro-impl-agent (aide-powers agent) 呼び出し前チェックリスト（必須）

```
□ 粒度チェック
  - refactoring-design.md のタスク1つだけを指示しているか？
  - 複数のタスクをまとめて指示していないか？
  - 「コンテキストが大きいからまとめる」という判断をしていないか？（絶対禁止）

□ 設計書チェック
  - 設計書ファイルパスは doc-index.md から取得したか？
  - 設計書のセクション指定は該当クラス/メソッドに絞り込んでいるか？
  - テスト観点はリファクタリング設計書から転記したか？（自分で作っていないか？）

□ テンプレートチェック
  - テンプレートの全必須フィールドを埋めたか？
  - テンプレートにないフィールドを追加していないか？
  - 開発環境情報（dev-environment.md）を含めたか？
```

## 実装フェーズ進行チェックリスト

各タスクの実行ステップチェックリスト:

```
□ Step A-1: micro-impl-agent（mode: implement）を呼び出した
□ Step A-2: design-review-agent（mode: implementation）を呼び出した
□ Step A-3: code-review-agent（mode: implementation）を呼び出した
□ Step A-4: レビュー結果判断 → FAIL があれば fix → 再レビュー → 全PASS確認
□ Step B-1: micro-impl-agent（mode: write_test）を呼び出した
□ Step B-2: design-review-agent（mode: test）を呼び出した
□ Step B-3: code-review-agent（mode: test）を呼び出した
□ Step B-4: テストレビュー結果判断 → FAIL があれば fix_test → 再レビュー → 全PASS確認
□ Step C-1: micro-impl-agent（mode: run_test）を呼び出した
□ Step C-2: 既存テスト全実行 → 全パス確認（セーフティネット — Iron Law）
□ Step C-3: テスト失敗があれば修正 → 再レビュー → 再実行 → 全パス確認
□ Step D: refactoring-progress.md を更新した
□ 次のタスクに進む
```

## ユーザーとの対話ポイント

| # | 対話ポイント | タイミング | 内容 |
|---|---|---|---|
| 1 | 合理的乖離の承認 | レビューで合理的乖離が検出された時 | 乖離内容・理由・影響範囲を提示し、承認/却下を確認 |
| 2 | 設計同期の承認 | design-sync (aide-powers skill) が修正案を作成した時 | 修正案・影響範囲を提示し、承認を確認 |
| 3 | 動作検証の依頼 | 全タスク完了後 | 起動コマンド、変更内容、確認ポイント、テスト実行結果を伝える |
| 4 | テスト失敗時の対応確認 | セーフティネットでテストが落ちた場合 | 失敗内容を報告し、修正方針を確認（通常は即座に修正） |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。Iron Law またはプロセスを逸脱しようとしている。

| Red Flag | 対処 |
|---|---|
| 「既存テスト全実行は時間がかかるから、対象テストだけ実行すれば十分」と考えた | STOP。Iron Law 違反。既存テスト全実行はセーフティネットとして必須。省略は外部振る舞い変更の見逃しにつながる |
| 「テストが落ちたが、元から落ちていたテストだろう」と推測した | STOP。フェーズ1で記録したセーフティネット基準と照合する。基準にないテスト失敗は即座に修正 |
| 「コンテキストが大きくなってきたので、残りのタスクをまとめて実行しよう」と考えた | STOP。タスク統合は絶対禁止。コンテキスト管理はサブエージェントへの情報量の絞り込みで対応する |
| 「レビューは省略して次のタスクに進もう」と考えた | STOP。`multi-stage-code-review (aide-powers skill)` の Iron Law 違反。設計準拠レビューと品質レビューの両方が必須 |
| 「合理的乖離だから設計書は後で直せばいい」と考えた | STOP。`design-sync (aide-powers skill)` を即座に起動する。設計書 = 実装の正を維持する |
| 「修正がシンプルだから再レビューは不要」と考えた | STOP。修正の妥当性はレビュアーが判断する。必ず再レビューを実行する |
| 「並列実行中だが、設計同期は後でまとめてやろう」と考えた | STOP。他の並列タスクを一時停止し、設計同期を即座に実行する |
| 「工程チェック表がないまま実装を開始しようとしている」 | 工程チェック表は実装の品質管理に不可欠。存在しない状態での作業は Iron Law 違反。前の計画フェーズに差し戻すこと |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| 「対象テストだけ通れば外部振る舞いは変わっていない」 | リファクタリングの影響は予測困難。既存テスト全実行でしか網羅的に確認できない |
| 「テスト全実行に時間がかかるので、最後にまとめて実行する」 | タスクごとに実行しないと、どのタスクで外部振る舞いが変わったか特定できない |
| 「残り2タスクだからまとめて実装しよう」 | タスク統合はレビュー品質の低下と問題特定の困難化を招く |
| 「テストが通っているから修正は保持されている」 | テストはプログラム変更と同時に変更される。設計書とコードの目視確認で判断する |
| 「リファクタリングだから新しいテストは不要」 | テストコードのリファクタリングが必要な場合がある。設計書のテスト観点に従う |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前フェーズスキル（呼び出し元）:**
- `fs-refactoring-phase4-design (aide-powers skill)` → 設計QA APPROVED 後に本スキルに遷移

**REQUIRED SUB-SKILL:**
- `fs-refactoring-phase6-doc (aide-powers skill)` — 全タスク完了後、ドキュメント反映 + gitコミットフェーズに遷移

**利用する共通スキル:**
- `multi-stage-code-review (aide-powers skill)` — 3エージェント体制のレビューパイプライン
- `design-sync (aide-powers skill)` — 合理的乖離発生時の設計書同期
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**利用するカスタムサブAgent:**
- `micro-impl-agent (aide-powers agent)` — 実装コード作成、レビュー指摘修正、テスト作成・修正・実行
- `design-review-agent (aide-powers agent)` — 設計準拠レビュー（「外を見る」視点）
- `code-review-agent (aide-powers agent)` — コード品質レビュー（「中を見る」視点）

**Global rules:** `.aide/references/global-rules.md` を厳守
