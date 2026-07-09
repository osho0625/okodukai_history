---
name: fs-refactoring-phase6-doc
description: "Use when refactoring implementation (phase 5) is complete and design documents need to be synchronized with the refactored code."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# リファクタリングフェーズ6: ドキュメント反映・完了

## Overview

リファクタリングワークフローの最終フェーズ。リファクタリング完了後、差分設計書の内容を既存設計書にマージし、gitコミットで変更を確定する。

**Core principle:** リファクタリング完了後、差分設計書の内容を既存設計書にマージし、gitコミットで変更を確定せよ。設計書反映とコミットを省略したまま作業を終了することは、設計書と実装の乖離を生む。

## The Iron Law

```
NO WORKFLOW COMPLETION WITHOUT DOCUMENT SYNC AND GIT COMMIT.
設計書反映とgitコミットなしに、リファクタリングワークフローを完了してはならない。
```

## 成果物

このフェーズでは新規成果物を作成しない。既存設計書の更新とgitコミットを行う。

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase6-doc
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill) （進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify) （前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: doc-sync (aide-powers skill) 共通スキルを呼び出す（ドキュメント反映）

- doc-sync (aide-powers skill) を呼び出す
- Task でサブエージェントをディスパッチし、doc-syncer-prompt.md の内容で実行する
- 入力:
  - 反映元: refactoring-design.md, refactoring-plan.md
  - 反映先: doc-index.md から特定した既存設計書
- doc-sync (aide-powers skill) の6フェーズを実行:
  - Phase 0: doc-index.md の読み込み（必須ドキュメントの内容まで読み込む）
  - Phase 1: 入力の確認（refactoring-design.md, refactoring-plan.md）
  - Phase 2: 反映計画の作成（設計書ごとに反映内容を整理）
  - Phase 3: 設計書の更新（before → after に従い既存設計書を更新）
  - Phase 4: 一貫性チェック（全項目反映済み、矛盾なし、フォーマット統一）
  - Phase 5: ユーザー確認（反映サマリーを提示し確認を得る）
- ※ Phase 6（history.md）: リファクタリングWFでは history.md の作成・更新は不要
- 反映ルール:
  - refactoring/ 配下のドキュメントはそのまま残す（リファクタリング履歴として）
  - 差分設計書の before → after に従い、既存設計書の該当箇所を更新する
  - 新規追加の場合は、既存設計書の適切なセクションに追記する
  - 既存の記述と矛盾しないように注意する
  - 反映後の設計書が一貫性を保っていることを確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `step1`, step_title: `doc-sync 共通スキルを呼び出す（ドキュメント反映）`, artifact_dir: `{refactoring_dir}`

### Step 2: pending-issues-management (aide-powers skill) 共通スキルを呼び出す（書き込み忘れチェック）

- pending-issues-management (aide-powers skill) を呼び出す
- ※ モード: check
- ※ チェック対象: refactoring-progress.md、レビュー結果、テスト実行ログ
- 検索パターン:
  - 「pending-issues に記録する」
  - 「後で対応する」
  - 「スコープ外」
  - 「別途対応」
  - サブエージェントからの問題報告の内容
- 漏れなし → Step 3 へ
- 漏れあり → ユーザーに確認の上で追記 → Step 3 へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `step2`, step_title: `pending-issues-management 共通スキルを呼び出す（書き込み忘れチェック）`, artifact_dir: `{refactoring_dir}`

### Step 3: リファクタリング完了案内をユーザーに提示する

- 案内内容:
  1. リファクタリング内容のサマリー
     - 対象: refactoring-candidates.md で選択された候補
     - 方針: refactoring-plan.md の before → after の要約
     - 変更概要: refactoring-design.md の変更一覧の要約
  2. 更新された設計書一覧
     - Step 1 で更新した設計書のファイル名と主な変更点
  3. テスト実行結果
     - refactoring-progress.md から最終テスト結果を読み取る
     - 全既存テストがパスしていることを確認・報告
  4. refactoring/ 配下の履歴
     - refactoring-candidates.md（候補一覧）
     - refactoring-plan.md（方針書）
     - refactoring-design.md（差分設計書）
     - refactoring-progress.md（進捗管理）
     - 「これらは履歴として残されています」と案内
  5. 変更ワークフローからの引き継ぎの場合
     - 「変更ワークフローを再起動してください」と案内

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `step3`, step_title: `リファクタリング完了案内をユーザーに提示する`, artifact_dir: `{refactoring_dir}`

### Step 4: ユーザー承認
- 完了案内の内容についてユーザーの合意を得る
- 合意なし → 修正して再提示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `step4`, step_title: `ユーザー承認`, artifact_dir: `{refactoring_dir}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. リファクタリングワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase6-doc`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

### 完了条件

以下の全てが満たされた状態:

1. 工程チェック表（impl-process-checklist.md）の全タスク・全ステップが `[x]` または `[-]` であること
2. doc-sync (aide-powers skill) 共通スキルにより、リファクタリング設計書の内容が既存設計書にマージされている
3. ユーザーが反映内容を確認・承認している
4. doc-index-maintenance (aide-powers skill) 共通スキルにより、doc-index.md が更新されている
5. pending-issues-management (aide-powers skill: check) 共通スキルにより、書き込み忘れチェックが完了している
6. git-commit-workflow (aide-powers skill) 共通スキルにより、全フェーズの成果物がgitコミットされている
7. リファクタリング完了案内がユーザーに提示されている

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。プロセスを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「差分が小さいから設計書反映は不要」 | 差分の大小に関わらず、反映は必須。小さな差分の蓄積が大きな乖離を生む |
| 「設計書は後でまとめて更新する」 | ワークフロー完了時に反映する。後回しにすると忘れる |
| 「コンテキストが大きくなったので反映を省略する」 | コンテキスト管理は省略の理由にならない |
| 「実装が正しく動いているから設計書は古くてもいい」 | 設計書が古いと、次の変更時に間違った設計に基づいて作業する |
| 「gitコミットは後でまとめてやる」 | リファクタリングWFはまとめコミット型だが、ワークフロー完了時に必ずコミットする。次のワークフローに持ち越さない |
| 「書き込み忘れチェックは時間がかかるから省略する」 | チェックの省略は記録漏れの原因。ワークフロー完了時に必ず実行する |
| 「完了案内は不要。ユーザーは結果を見ればわかる」 | 完了案内はリファクタリングの全体像を伝える重要なステップ。省略しない |
| 「refactoring/ 配下のドキュメントを削除して整理する」 | refactoring/ 配下は履歴として残す。削除は revert 時のみ |
| 「doc-index.md を doc-sync (aide-powers skill) の中で更新してしまおう」 | doc-index.md の更新はワークフロー側の責務。doc-sync (aide-powers skill) は更新しない |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| 「リファクタリング設計書があるから既存設計書は更新しなくてよい」 | リファクタリング設計書は作業中の一時ドキュメント。正式な設計書に反映されて初めて整合性が保たれる |
| 「object-design-*.md だけ更新すれば十分」 | program-structure.md 等、差分設計書に関連する全ての設計書を更新する |
| 「ユーザー確認は省略して先に進む」 | 反映内容のサマリーを必ずユーザーに提示し、確認を得る |
| 「Docs: フッターは今回は不要だろう」 | リファクタリングWFでは Docs: フッターは必須。トレーサビリティの確保に不可欠 |
| 「コミット前の書き込み忘れチェックは形式的なもの」 | 書き込み忘れチェックはワークフロー品質の最終防衛線。省略は品質劣化に直結する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前フェーズスキル:**
- `fs-refactoring-phase5-impl` (aide-powers skill) → `fs-refactoring-phase6-doc`

**呼び出す共通スキル:**
- `doc-sync` (aide-powers skill) — ドキュメント反映（Step 1）
- `doc-index-maintenance` (aide-powers skill) — doc-index.md 更新（後処理）
- `pending-issues-management` (aide-powers skill) — 書き込み忘れチェック（Step 2）
- `git-commit-workflow` (aide-powers skill) — gitコミット（後処理）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- リファクタリングワークフロー（フェーズ5完了後に呼び出される）

**次フェーズスキル:**
- REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check (aide-powers skill)（進捗ファイル完全性チェック）

**Related skills:**
- `doc-sync` (aide-powers skill) — リファクタリング設計書の内容を既存設計書にマージする
- `doc-index-maintenance` (aide-powers skill) — doc-index.md の管理
- `pending-issues-management` (aide-powers skill) — 書き込み忘れチェック（check モード）
- `git-commit-workflow` (aide-powers skill) — gitコミット（まとめコミット型）

**Global rules:** `.aide/references/global-rules.md` を厳守
