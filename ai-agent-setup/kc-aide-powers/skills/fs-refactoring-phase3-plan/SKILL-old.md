---
name: fs-refactoring-phase3-plan
description: "Use when refactoring candidates have been identified (refactoring-candidates.md) or a refactoring request has been handed over (refactoring-request.md)."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# フェーズ3: リファクタリング方針確定

## Overview

**Core principle:** リファクタリング方針は、ユーザーが「何がどう変わるのか」「どこに影響するのか」「何がリスクか」を十分に理解した上で合意するものである。専門用語を並べるのではなく、日常的な言葉で before → after のイメージを伝え、ユーザーが自信を持って判断できるようにせよ。

## The Iron Law

```
1. NO CHANGE TO EXTERNAL BEHAVIOR.
   外部振る舞いを変えてはならない。既存テストが落ちたら、それは外部振る舞いが変わった証拠である。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-plan.md | `{refactoring_dir}/refactoring-plan.md` | リファクタリング方針書（before→after、メリット、影響範囲、リスク） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase3-plan
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. `phase-compliance-check (aide-powers skill: verify)` を activate し、前フェーズの署名を検証する
   - フェーズ1の場合は署名検証スキップで自動 PASS
   - フェーズ2以降で FAIL の場合は前フェーズの後処理が未実行と判断し、前フェーズに戻って後処理を再実行する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase3-plan`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: 入力の分岐判定

- refactoring-candidates.md が存在する（通常起動）
  - → refactoring-candidates.md を入力として使用
- refactoring-request.md が存在する（引き継ぎ）
  - → refactoring-request.md を入力として使用

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase3-plan`, step_id: `step1`, step_title: `入力の分岐判定`, artifact_dir: `{refactoring_dir}`

### Step 2: refactoring-planner サブエージェントに方針確定を委譲する

- プロンプトテンプレート: refactoring-planner-prompt.md
- Task でサブエージェントをディスパッチし、以下を委譲する:
  - 2-1. 設計ドキュメントの読み込み（doc-index.md → 必須ドキュメントの内容読み込み）
    - program-structure.md — 既存ファイル構成の把握
    - object-design-*.md — 既存クラス設計の把握
  - 2-2. 入力の確認（refactoring-candidates.md or refactoring-request.md）
  - 2-3. 対象の確認（ユーザーが選んだ候補、実際のコード確認）
  - 2-4. 変更方針の説明（before → after）
    - 今の状態（before）: 問題点を日常的な言葉で説明
    - 変更後の状態（after）: 変更のイメージを具体的に説明
    - メリット: リファクタリング後のメリットを日常的な言葉で説明
    - 影響範囲: どのファイル・クラスが変わるか、テストへの影響、import関係の変更
    - リスク: テストでカバーされていない部分、手動確認が必要な箇所
  - 2-5. 成果物作成（refactoring-plan.md）
  - 2-6. ユーザー合意

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase3-plan`, step_id: `step2`, step_title: `refactoring-planner サブエージェントに方針確定を委譲する`, artifact_dir: `{refactoring_dir}`

### Step 3: 完了確認

- refactoring-plan.md が作成されていることを確認する
- ユーザーの合意が得られていることを確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase3-plan`, step_id: `step3`, step_title: `完了確認`, artifact_dir: `{refactoring_dir}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase4-design (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase3-plan`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

※ リファクタリングワークフローでは全フェーズ完了後に1回のみgitコミットを行う（フェーズ6で実施）。途中フェーズでのコミットは行わない。

### 完了条件

以下の全てが満たされた状態:

1. 入力の分岐判定が完了している（refactoring-candidates.md or refactoring-request.md のいずれかを使用）
2. リファクタリング対象の現状が正確に把握されている
3. 変更方針（before → after、メリット、影響範囲、リスク）がユーザーに説明されている
4. `{refactoring_dir}/refactoring-plan.md` が作成されている
5. ユーザーがリファクタリング方針に合意している
6. 進捗ファイル（refactoring-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
7. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
8. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
9. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### サブエージェントへの委譲ルール

- プロンプトテンプレート `refactoring-planner-prompt.md` を使用する
- 以下のパラメータを渡す:
  - `feature_name`: 対象フィーチャー名
  - `specs_dir`: `.aide/specs/{feature_name}`
  - `refactoring_dir`: `.aide/specs/{feature_name}/refactoring/{YYYY-MM-DD}`
  - 入力ファイル: 通常起動時は `{refactoring_dir}/refactoring-candidates.md`、引き継ぎ時は `{changes_dir}/refactoring-request.md`

### ビジュアルコンパニオン活用

以下の場面では `visual-companion` (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- before→after の構造変化（クラス関係・モジュール依存の変化）を図示
- 影響範囲の可視化

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。プロセスを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「対象が明確だから方針確定は不要。すぐに差分設計に進もう」 | 方針確定はユーザーの理解と合意を得るためのフェーズ。対象が明確でも、影響範囲やリスクの説明は必須 |
| 「引き継ぎ時は refactoring-request.md に方針が書いてあるから、そのまま差分設計に進めばよい」 | refactoring-request.md は変更ワークフローからの依頼書であり、リファクタリング方針書ではない。before → after の詳細説明とユーザー合意は必須 |
| 「専門用語で説明した方が正確だから、平易な言い換えは不要」 | ユーザーが理解できない説明は合意の根拠にならない。専門用語を使う場合は必ず平易な言い換えを添える |
| 「ユーザーが急いでいるから、方針書の作成を省略して口頭合意で進めよう」 | refactoring-plan.md は後続フェーズ（差分設計・実装）の基準となる。口頭合意では基準が曖昧になる |
| 「差分設計の詳細まで方針書に書いた方が効率的」 | 方針確定と差分設計はフェーズが異なる。方針書に差分設計の詳細を含めると、フェーズの責務が混在する |
| 「AIが最適な方針を判断できるから、ユーザーへのヒアリングは不要」 | 方針はユーザーが判断するもの。AIが勝手に方針を決めてはならない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「リファクタリングの方針は技術的な判断だから、ユーザーに説明しても意味がない」 | ユーザーはコードの利用者であり、影響範囲やリスクを理解する権利がある。平易な言葉で説明すれば理解できる |
| 「before → after のイメージは差分設計で詳しく書くから、方針書では概要だけでよい」 | 方針書の before → after はユーザーが判断するための情報。差分設計の before → after は実装者が作業するための情報。目的が異なる |
| 「影響範囲が小さいからリスク説明は不要」 | 影響範囲が小さくても、テストでカバーされていない部分や手動確認が必要な箇所は存在しうる。リスク説明は常に必要 |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL:**
- `fs-refactoring-phase4-design` (aide-powers skill) — 方針確定完了後、差分設計フェーズに遷移する

**Called by:**
- `fs-refactoring-phase2-candidates` (aide-powers skill)（通常起動時: REQUIRED SUB-SKILL として呼び出される）
- `fs-refactoring-phase1-status` (aide-powers skill)（引き継ぎ時: refactoring-request.md あり → フェーズ2スキップ → REQUIRED SUB-SKILL として呼び出される）

**Related skills:**
- `fs-refactoring-phase2-candidates` (aide-powers skill) — 前フェーズ。リファクタリング候補の特定と選択
- `fs-refactoring-phase4-design` (aide-powers skill) — 次フェーズ。確定した方針に基づく差分設計
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
