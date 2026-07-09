---
name: fs-impl-phase1-gate
description: "Use when starting the implementation workflow. Ensures design documents are complete before any implementation begins."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# fs-impl-phase1-gate（実装ワークフロー: 設計書ゲート）

## Overview

実装ワークフローの入口に位置する HARD-GATE。2つの責務を持つ:
1. **ワークフロー共通 Iron Law の宣言** — 全フェーズスキルに適用される絶対ルール（フェーズ省略禁止、実作業禁止、サブエージェント委譲義務）を宣言する
2. **設計書ゲートの実行** — design-gate (aide-powers skill) を呼び出し、設計書の完了状態を機械的に確認する。PASS なら次フェーズへ、FAIL なら pending-issues に記録してワークフローを終了する

**Core principle:** 設計書なしに実装を始めるな。ワークフローのルールを破るな。

---

## The Iron Law（実装ワークフロー固有）

```
NO FAKE SIGNATURE.
内容を読まずに署名する行為は詐欺行為とみなす。
署名する場合は必ず Read で該当ファイルを読み込み、主要ルール3つ以上を引用する。
引用なしの署名は無効。虚偽署名検出時はワークフロー全体をやり直す。
```

---

## 成果物

このフェーズでは成果物を作成しない。

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-impl-phase1-gate
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill) （進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify) （前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase1-gate`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: ワークフロー共通 Iron Law の適用宣言
- 上記 Iron Law（5項目）を宣言する
- 以降の全フェーズスキルに適用される

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase1-gate`, step_id: `step1`, step_title: `ワークフロー共通 Iron Law の適用宣言`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 設計書ゲート実行
- design-gate (aide-powers skill) を呼び出す
- 分岐:
  - PASS → 後処理へ進む
  - FAIL → design-gate が pending-issues 登録とユーザーへの案内を実行し、ワークフローを終了する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase1-gate`, step_id: `step2`, step_title: `設計書ゲート実行`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. phase-compliance-check (aide-powers skill: write)
2. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase2-preparation (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase1-gate`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

| 結果 | 完了条件 |
|---|---|
| PASS | design-gate (aide-powers skill) が PASS を返し、REQUIRED SUB-SKILL: fs-impl-phase2-preparation (aide-powers skill) への遷移指示が発行された |
| FAIL | design-gate (aide-powers skill) の FAIL 処理（pending-issues 登録 + ユーザー案内 + ワークフロー終了）が完了した |

---

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。ワークフローのルールを破ろうとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「設計書は揃っているはず」 | 「はず」ではなく、design-gate (aide-powers skill) で機械的に確認する。思い込みによるスキップは品質劣化の原因 |
| 「変更がシンプルだから設計書は不要」 | 変更の複雑さに関わらず、設計書は必要。設計書なしでは影響範囲の分析ができない |
| 「ユーザーが急いでいるから設計書チェックを省略する」 | 時間的制約は設計書ゲートの省略理由にならない。設計書なしの実装は後で大きな手戻りを生む |
| 「doc-index.md を自分で読んで判断すればよい」 | 設計書チェックは design-gate (aide-powers skill) の手順で機械的に実行する。独自判断による省略を防ぐため |
| 「前回のワークフローで確認済みだから再確認は不要」 | ワークフロー起動のたびに確認する。前回以降に設計書が変更されている可能性がある |
| 「このフェーズはシンプルだからサブエージェントに委譲しなくてよい」 | Iron Law 2: 実作業禁止。シンプルさは委譲省略の理由にならない |
| 「レビューは後でまとめてやればよい」 | Iron Law 1: フェーズ省略禁止。各ステップを順序通りに実行する |
| 「ユーザーが『設計書なしで進めてよい』と言った」 | ユーザーの指示であっても設計書ゲートをスキップすることは不可。設計書完成を先に行うことを説明する |

---

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「1行の修正だから設計書は不要」 | 1行の修正でも設計書との整合性確認が必要。設計書がなければ影響範囲が不明 |
| 「設計書を作る時間がない」 | 設計書なしの実装は手戻りリスクが高く、結果的に時間がかかる。設計書作成は投資 |
| 「テストがあるから設計書は不要」 | テストは振る舞いの検証であり、設計の記録ではない。設計書とテストは補完関係 |
| 「サブエージェントを呼ぶほどの作業ではない」 | Iron Law 2 に例外はない。全ての実作業はサブエージェントに委譲する |
| 「致命的な不具合だから今すぐ別ワークフローで対応する」 | Iron Law 4: ワークフロー実行中に別ワークフローを起動してはならない。pending-issues に記録して完遂する |

---

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（PASS時の遷移先）:**
```
REQUIRED SUB-SKILL: fs-impl-phase2-preparation
```
設計書ゲートが PASS した場合、次のフェーズスキル fs-impl-phase2-preparation (aide-powers skill)（環境確認 + タスクリスト生成 + 動作確認試験書初期化）に遷移する。

**FAIL時:**
ワークフローを終了する。次フェーズスキルへの遷移は行わない。

**Required workflow skills:**
- `design-gate` (aide-powers skill) — 設計書の完了状態を機械的に確認する共通スキル
- `pending-issues-management` (aide-powers skill) — FAIL時の issue 登録に使用する共通スキル（record モード）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- 実装ワークフロー（using-aide-powers (aide-powers skill) メタスキルから遷移）

**Next phase skill:**
- `fs-impl-phase2-preparation` (aide-powers skill) — PASS時に REQUIRED SUB-SKILL として遷移

**Global rules:** `.aide/references/global-rules.md` を厳守
