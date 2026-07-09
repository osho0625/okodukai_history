---
name: fs-refactoring-phase1-status
description: "Use when starting the refactoring workflow to establish safety net baseline before code changes."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# リファクタリング フェーズ1: 現状把握

## Overview

リファクタリングワークフローの入口。設計書の完了状態を確認し、既存テストを全実行してセーフティネットの基準を記録し、リファクタリング開始前の準備状態を確立する。

**Core principle:** リファクタリングを始める前に、設計書の完了状態を確認し、既存テストの基準を記録せよ。テストが落ちたら外部振る舞いが変わった証拠である。

## The Iron Law

### リファクタリングワークフロー固有 Iron Law

```
1. NO CHANGE TO EXTERNAL BEHAVIOR.
   外部振る舞いを変えてはならない。既存テストが落ちたら、それは外部振る舞いが変わった証拠である。

2. NO REFACTORING WITHOUT SAFETY NET BASELINE.
   セーフティネット基準（既存テスト全実行結果）の記録なしに、リファクタリングに着手してはならない。
```

## 成果物

このフェーズでは成果物を作成しない。

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase1-status
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）

   - 入力:
     - progress_file_path: `.aide/specs/{feature_name}/refactoring/{refactoring_dir}/refactoring-progress.md`
     - workflow_name: refactoring
   - 戻り値に基づく分岐:
     - RESUME_FROM N → 進捗ファイルは既存。N が本フェーズなら Step 1 から再開、N が後続フェーズなら該当フェーズスキルへ遷移
     - START_FRESH → 進捗ファイルが存在しない。Step 1 へ
     - ALL_COMPLETED → 全フェーズ完了済み。ユーザーに案内し終了

3. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase1-status`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: design-gate 共通スキル呼び出し
- design-gate (aide-powers skill) を実行する
- FAIL の場合:
  - design-gate (aide-powers skill) が pending-issues への issue 登録（2件）とユーザーへの案内・ワークフロー終了を実行する。本スキルもここで終了する。
  - ※ 登録内容（issue 名・重要度等）は design-gate 側の手順（Step 5 + pending-issues 登録テンプレート）に従う。ここでは再掲しない（DRY）。
- PASS の場合: → Step後処理を実行し、Step 2 へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-refactoring-phase1-status`, step_id: `step1`, step_title: `design-gate 共通スキル呼び出し`, artifact_dir: `{refactoring_dir}`

### Step 2: セーフティネット基準の記録（サブエージェントに委譲）
- Task でサブエージェントをディスパッチする
- プロンプトテンプレート: `refactoring-status-checker-prompt.md`
- サブエージェントが実行する内容:
  - 2-1. 既存テストの全実行と結果記録: テスト結果を refactoring-progress.md に記録する
  - 2-2. 結果報告とユーザー確認:
    - テスト失敗 → ユーザーに対応方針を確認
    - 全て問題なし → リファクタリング開始準備完了を報告
- ※ 設計ドキュメントの充実度チェックとコードとの整合性チェックは Step 1 の design-gate で完了済みのため、ここでは実行しない

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase1-status`, step_id: `step2`, step_title: `セーフティネット基準の記録`, artifact_dir: `{refactoring_dir}`

### Step 3: 引き継ぎ判定
- Glob で `.aide/specs/{feature_name}/changes/` 配下に refactoring-request.md が存在するか確認する
- refactoring-request.md あり →
  - 変更ワークフローからの引き継ぎ
  - フェーズ2（対象特定）をスキップし、fs-refactoring-phase3-plan (aide-powers skill) へ遷移する
- refactoring-request.md なし →
  - 通常起動。fs-refactoring-phase2-candidates (aide-powers skill) へ遷移する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase1-status`, step_id: `step3`, step_title: `引き継ぎ判定`, artifact_dir: `{refactoring_dir}`

### 後処理
1. phase-compliance-check (aide-powers skill: write)
2. 次フェーズ遷移
   - 通常起動時: REQUIRED SUB-SKILL: fs-refactoring-phase2-candidates (aide-powers skill)
   - 引き継ぎ時（refactoring-request.md あり）: REQUIRED SUB-SKILL: fs-refactoring-phase3-plan (aide-powers skill)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase1-status`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

### 完了条件

以下の全てが満たされた状態:

1. design-gate が PASS を返している
2. 設計書の状態とテスト結果がユーザーに報告されている
3. テスト失敗がある場合、ユーザーの対応方針が合意されている
4. セーフティネット基準（テスト結果）が refactoring-progress.md に記録されている
5. 引き継ぎ判定が完了し、次フェーズスキルへの遷移先が確定している
- 進捗ファイル（refactoring-progress.md）が `progress-resume-check (aide-powers skill)` の戻り値に応じて適切に取り扱われている
  - START_FRESH の場合: progress-file-format.md §6.1 / §7.7 に従って新規作成済み
  - RESUME_FROM N / ALL_COMPLETED の場合: 既存進捗ファイルを上書きせず、戻り値に応じた分岐処理が実行済み

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。プロセスを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「リファクタリングがシンプルだから設計書チェックは不要」 | 変更の複雑さに関わらず、設計書は必要。設計書なしでは影響範囲の分析ができない |
| 「テストが全パスしているはずだから全実行は省略してよい」 | 「はず」ではなく、機械的に確認する。セーフティネット基準の記録はリファクタリングの生命線 |
| 「前回のワークフローで確認済みだから再確認は不要」 | ワークフロー起動のたびに確認する。前回以降にコードやテストが変更されている可能性がある |
| 「テストが落ちているが、リファクタリングとは無関係だから無視してよい」 | テスト失敗の対応方針はユーザーが判断する。エージェントが独自に「無関係」と判断してはならない |
| 「引き継ぎ判定は不要。ユーザーに聞けばよい」 | refactoring-request.md の有無は機械的に確認する。ユーザーへの確認は不要 |
| 「設計書ゲートを自分で doc-index.md を読んで判断すればよい」 | 設計書チェックは design-gate (aide-powers skill) 共通スキルに委譲する。独自判断による省略を防ぐため |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「テスト全実行に時間がかかるから省略する」 | テスト全実行はセーフティネットの基準記録であり、リファクタリングの前提条件。省略すると外部振る舞いの変化を検出できない |
| 「設計書が古くて使えないから設計書チェックは無意味」 | 古い設計書は更新すべきであり、設計書なしで進める理由にはならない。逆引きワークフローで最新化する |
| 「変更ワークフローからの引き継ぎだから現状把握は不要」 | 引き継ぎ時もフェーズ1（現状把握 + テスト確認）は必ず実行する。スキップするのはフェーズ2（対象特定）のみ |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（通常起動時）:**
- `fs-refactoring-phase2-candidates (aide-powers skill)` — 次フェーズ: リファクタリング候補一覧

**REQUIRED SUB-SKILL（引き継ぎ時: refactoring-request.md あり）:**
- `fs-refactoring-phase3-plan (aide-powers skill)` — 次フェーズ: リファクタリング方針書

**Called by:**
- リファクタリングワークフロー（ワークフロー開始時の最初のフェーズスキル）
- 変更ワークフロー（refactoring-request.md 経由での引き継ぎ）

**Related skills:**
- `design-gate (aide-powers skill)` — 設計書の完了状態確認（STEP 1 で呼び出す）。FAIL 時の pending-issues 登録とワークフロー終了も design-gate 内部で実行される
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
