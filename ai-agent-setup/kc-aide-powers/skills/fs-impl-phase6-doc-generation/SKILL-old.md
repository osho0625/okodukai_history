---
name: fs-impl-phase6-doc-generation
description: "Use when all implementation tasks are complete and final checks have passed. Generate README.md and docs/ for the project."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 実装ドキュメント生成

## Overview

実装が完了したプロジェクトに対して、README.md と開発者向けドキュメント（docs/）を生成する。設計書の内容を「開発者が読みやすい形」に再構成し、ユーザーの確認を経てコミットする。

**Core principle:** 設計書をそのままコピーするのではなく、開発者が読みやすい形に再構成してプロジェクトの「顔」を整える。

## 前提条件

以下の全てが満たされていること:

- 全実装タスクが完了していること（fs-impl-phase5-final-check (aide-powers skill) が完了済み）
- 設計ドキュメントが `.aide/specs/{feature_name}/` に存在すること
- テストが全パスしていること
- doc-index.md が存在し、全ドキュメントが ✅ 完了 であること

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| README.md | プロジェクトルート | プロジェクトの概説・実行方法・使い方等 |
| docs/ | プロジェクトルート/docs/ | 開発者向けドキュメント（architecture.md, design-decisions.md 等） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-impl-phase6-doc-generation
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: doc-index.md の読み込み

**Step 1a:** Read で `.aide/specs/{feature_name}/doc-index.md` を読み込む
**Step 1b:** 全設計ドキュメントのパスを把握する
**Step 1c:** 各ドキュメントのステータスが ✅ 完了 であることを確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `step1`, step_title: `doc-index.md の読み込み`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: readme-generator サブエージェントの起動

**Step 2a:** `readme-generator-prompt.md` の内容を Read で読み込む
**Step 2b:** Mode A（初回生成モード）のテンプレートを使用する
**Step 2c:** 以下のプレースホルダを埋める:
- `{feature_name}`: 対象プロジェクトの feature_name
- `{.aide/specs/feature_name/doc-index.md}`: doc-index.md のパス
**Step 2d:** Task でサブエージェントをディスパッチする

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `step2`, step_title: `readme-generator サブエージェントの起動`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: 生成結果のユーザー提示

**Step 3a:** 生成された README.md の内容を表示する
**Step 3b:** docs/ 配下のファイル一覧を表示する
**Step 3c:** 各ファイルの概要（1〜2行）を添える
**Step 3d:** ユーザーに以下の確認を依頼する:
- 内容に問題がないか
- 追加・修正したい箇所があるか
- 不要なセクションがあるか

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `step3`, step_title: `生成結果のユーザー提示`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: フィードバック対応

**Step 4a:** ユーザーからのフィードバックを収集する
**Step 4b:** フィードバックがない場合（承認）→ Step後処理を実行し、後処理へ進む
**Step 4c:** フィードバックがある場合:
- `readme-generator-prompt.md` の Mode B（修正モード）を使用する
- 以下のプレースホルダを埋める:
  - `{feature_name}`: 対象プロジェクトの feature_name
  - `{修正対象のファイルパス一覧}`: 修正が必要なファイルのパス
  - `{フィードバック内容をそのまま転記}`: ユーザーのフィードバック原文
- Task でサブエージェントをディスパッチする
- 修正後、Step 3に戻る
**Step 4d:** フィードバックループは最大3回まで
**Step 4e:** 3回を超える場合はユーザーに「修正が3回を超えました。方針を相談させてください」と伝える

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `step4`, step_title: `フィードバック対応`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)（docs/ 配下のファイルを doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: README.md + docs/ + impl-progress.md）
4. 実装ワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase7-final-check (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase6-doc-generation`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

## 完了条件

以下の全てを満たすこと:

- [ ] README.md がプロジェクトルートに生成されていること
- [ ] docs/ 配下のドキュメント（最低限 architecture.md, design-decisions.md）が生成されていること
- [ ] ユーザーが README.md と docs/ の内容を確認・承認済みであること
- [ ] doc-index-maintenance で doc-index.md が更新済みであること（docs/ 配下のファイルが登録されている場合）
- [ ] git-commit-workflow でコミット済みであること
- [ ] impl-progress.md にフェーズ6完了が記録されていること

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。ルールに違反しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「README.md は後で書けばいい」 | 実装ワークフローの一部として必ず生成する。後回しにすると忘れる |
| 「設計書をそのまま docs/ にコピーすればいい」 | docs/ は設計書の内容を「開発者が読みやすい形」に再構成する。設計書のコピーは読みにくく、メンテナンスの二重管理になる |
| 「ユーザー確認は不要、自動生成だから問題ない」 | 自動生成されたドキュメントにも誤りや不足がある可能性がある。必ずユーザーの確認を経る |
| 「コミットは次の作業と一緒にやればいい」 | ドキュメント生成完了後に必ずコミットする。コミット忘れは禁止 |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「docs/ は誰も読まないから最低限でいい」 | 開発者向けドキュメントは将来の保守・変更時に不可欠。最低限 architecture.md と design-decisions.md は必須 |
| 「README.md は短ければ短いほどいい」 | 100〜200行目安。概説・実行方法・使い方・プログラムについて・制限事項の5セクションは必須 |
| 「フィードバックが3回を超えたから打ち切ろう」 | 打ち切りではなくユーザーに相談する。方針を変えるか、部分的に承認するか確認する |
| 「設計書に書いてないことも README に書いていい」 | 設計書に記載されていない情報を捏造しない。設計書の内容を再構成するのみ |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- fs-impl-phase7-final-check (aide-powers skill)（進捗ファイル完全性チェック）

**Called by:**
- `fs-impl-phase5-final-check` (aide-powers skill) — REQUIRED SUB-SKILL として遷移

**Related skills:**
- `doc-index-maintenance` (aide-powers skill) — docs/ 配下のファイルの doc-index.md への登録
- `git-commit-workflow` (aide-powers skill) — ドキュメント生成完了後のコミット
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
