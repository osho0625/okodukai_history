---
name: fs-impl-phase5-final-check
description: "Use when all implementation tasks are complete and the implementation loop has finished."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 最終品質確認

## Overview

実装ループが完了しても、それは「実装が終わった」ことを意味しない。全設計書の全項目が実装されていること、全要件が動作確認試験書でカバーされていること、作業中に発見した問題が漏れなく記録されていることを確認して初めて「実装完了」と宣言できる。

**Core principle:** 全設計書の全項目照合、全要件の試験カバレッジ確認、pending-issues の書き込み漏れチェックの3ステップを全て完了するまで「実装完了」を宣言してはならない。

## The Iron Law

```
IMPLEMENTATION WORKFLOW IRON LAW — APPLIES TO ALL PHASE SKILLS IN THIS WORKFLOW:

1. NO FINAL CHECK SHALL BE SKIPPED.
   全設計書の全項目照合、全要件の試験カバレッジ確認、pending-issues チェックの
   いずれも省略してはならない。「実装ループが通ったから大丈夫」は理由にならない。

2. NO WORKFLOW SHALL COMPLETE WITHOUT CALLING git-commit-workflow.
   ワークフロー完了時に git-commit-workflow を呼ばずに終了してはならない。
   ワークフロー1件 = コミット1回。複数ワークフローのまとめコミットを禁止する。
```

## 成果物

このフェーズでは成果物を作成しない。

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-impl-phase5-final-check
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

以下の3ステップを **必ずこの順序で** 実行する。ステップ2で ❌ が発見された場合はステップ1に差し戻す（ステップ3に進まない）。全ステップが完了するまで次のフェーズスキル（fs-impl-phase6-doc-generation (aide-powers skill)）に遷移しない。

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase5-final-check`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 最終設計準拠チェック

- 全設計書の全項目を実装コードと照合
- ❌ あり → 追加実装サイクル → 再チェック（全項目 ✅ までループ）

#### [1.1] 設計書パスの取得

doc-index.md を Read で読み込み、全設計書のパスを取得する。

#### [1.2] 設計書ごとに design-review-agent (aide-powers agent) を呼び出す

対象設計書:
- object-design-domain.md（全クラス・全メソッド・全不変条件）
- object-design-application.md（全ユースケース・全メソッド）
- object-design-infrastructure.md（全リポジトリ具象・全メソッド）
- object-design-presentation.md（全GUI/CLIクラス・全メソッド）
- gui-design.md（GUI配置・配色・レイアウト）
- infra-interface-design.md（外部サービス連携・ファイルI/O）
- program-structure.md（ファイル配置・importルール）

呼び出し方法:
- `design-review-agent (aide-powers agent)`（agents/ 配下の名前付きエージェント）を Task で直接呼び出す
- 設計書の **全項目** を対象に、実装コードとの照合を指示する
- 確認結果を ✅/❌ 形式で報告させる

呼び出し時の指示内容:

```
## 最終設計準拠チェック依頼

### レビューモード
implementation（最終チェック）

### 対象設計書
- {設計書ファイルパス}（全セクション）

### チェック指示
設計書の**全項目**（全クラス定義、全メソッドシグネチャ、全不変条件、全テスト観点）について、
実装コードで対応されているかを1項目ずつ確認すること。

確認結果を以下の形式で報告すること:
- ✅ {設計書} > {クラス名}.{メソッド名}: 実装済み — {対応ファイルパス}
- ❌ {設計書} > {クラス名}.{メソッド名}: 未実装（理由: {理由}）

1つでも ❌ がある場合は FAIL とする。
```

#### [1.3] 結果を impl-progress.md に記録する

フォーマット:

```markdown
## 最終設計準拠チェック結果

| 設計書 | セクション/項目 | 実装状況 | 対応ファイル |
|---|---|---|---|
| object-design-domain.md | {クラス名}.{メソッド名} | ✅ / ❌ | {ファイルパス} |
| ... | ... | ... | ... |
```

#### [1.4] ❌ の有無を判定する

- **❌ なし** → Step 2へ進む
- **❌ あり** → [1.5] 追加実装サイクルへ

#### [1.5] 追加実装サイクル

❌ の各項目について `multi-stage-code-review (aide-powers skill)` の implementation モードで追加実装→レビュー→テストサイクルを実行する。

具体的な手順:
1. `micro-impl-agent (aide-powers agent)`（implement モード）で未実装項目を実装
2. `multi-stage-code-review (aide-powers skill)`（implementation モード）でレビュー
   - design-review-agent (aide-powers agent) + code-review-agent (aide-powers agent) の2段階レビュー
   - FAIL → micro-impl-agent (aide-powers agent)（fix モード）→ 再レビュー
3. `micro-impl-agent (aide-powers agent)`（write_test モード）でテスト作成
4. `multi-stage-code-review (aide-powers skill)`（test モード）でテストレビュー
   - FAIL → micro-impl-agent (aide-powers agent)（fix_test モード）→ 再レビュー
5. `micro-impl-agent (aide-powers agent)`（run_test モード）でテスト実行
6. 動作確認試験書（manual-test-plan.md）に試験項目を追記

**注意:** 追加実装中に設計不備が発覚した場合は `design-sync (aide-powers skill)` で設計書の同期更新を行う。

#### [1.6] 再チェック

追加実装完了後、[1.2] に戻り再度全項目チェックを実行する。全項目 ✅ になるまでループする。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase5-final-check`, step_id: `step1`, step_title: `最終設計準拠チェック`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 動作確認試験書の網羅性チェック

#### [2.1] 要件の一覧化

user-requirements.md を Read で読み込み、全要件項目を一覧化する。

#### [2.2] 試験項目の一覧化

testing/manual-test-plan.md を Read で読み込み、全試験項目を一覧化する。

#### [2.3] 照合

各要件項目について、対応する試験項目が存在するか照合する。

#### [2.4] 結果を impl-progress.md に記録する

フォーマット:

```markdown
## 動作確認試験書 網羅性チェック結果

| 要件ID | 要件名 | 対応する試験項目 | 状況 |
|---|---|---|---|
| UR-001 | {要件名} | MT-XXX | ✅ カバー済み / ❌ 試験項目なし |
| ... | ... | ... | ... |
```

#### [2.5] ❌ の有無を判定する

- **❌ なし** → Step 3へ進む
- **❌ あり** → [2.6] 原因の判定へ

#### [2.6] 原因の判定

❌ の各項目について原因を判定する:

| 原因 | 対応 |
|---|---|
| 対応する機能が実装されていない可能性がある | **Step 1に差し戻し**。実装漏れがあれば追加実装→レビュー→テスト→試験項目追記のサイクルを実行する |
| 実装済みだが試験項目が漏れていただけ | 試験項目を manual-test-plan.md に追記する。[2.3] に戻り再度照合する |

**重要:** 安易に「試験項目漏れ」と判断せず、まず実装漏れの可能性を確認する。Step 1への差し戻しが原則。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase5-final-check`, step_id: `step2`, step_title: `動作確認試験書の網羅性チェック`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: pending-issues の確認と書き込み忘れチェック

#### [3.1] 書き込み忘れチェック

`pending-issues-management (aide-powers skill)` を **check モード** で呼び出す。

入力:
- feature_name
- 進捗ファイルパス: impl-progress.md

処理内容:
- impl-progress.md やレビュー結果を遡り、以下のパターンを検索:
  - 「pending-issues に記録する」
  - 「後で対応する」
  - 「スコープ外」
  - 「別途対応」
  - サブエージェントからの問題報告（DONE_WITH_CONCERNS の concerns 内容）
- pending-issues.md と照合
- 書き込み漏れがあればユーザーに確認の上で追記

**重要:** このステップは pending-issues.md の有無に関わらず実行する。進捗ファイルの遡り照合が目的。

#### [3.2] pending-issues.md の存在確認

- **存在しない** → [3.4] 完了へ
- **存在する** → [3.3] ユーザーへの提示へ

#### [3.3] ユーザーへの提示

`pending-issues-management (aide-powers skill)` を **present モード** で呼び出す。

提示メッセージ:
> 「実装ワークフローの作業は完了しました。以下の問題が記録されています。実装完了後に、適切なワークフロー（変更・バグ修正・リファクタリング）で対応いたします。」

提示内容:
- 🚨設計書未完了がある場合は最優先で提示
- 重要度順（高→中→低）で問題を一覧表示
- 各問題について推奨対応ワークフローを提示

ユーザーに確認を取る。

#### [3.4] 完了

全ステップ完了。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase5-final-check`, step_id: `step3`, step_title: `pending-issues の確認と書き込み忘れチェック`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. phase-compliance-check (aide-powers skill: write)
2. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase6-doc-generation (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase5-final-check`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

---

## 完了条件

以下の **全て** を満たすこと:

| # | 条件 | 確認方法 |
|---|---|---|
| 1 | 全設計書の全項目が ✅（❌ が0件） | impl-progress.md の最終設計準拠チェック結果 |
| 2 | 全要件項目が ✅（❌ が0件） | impl-progress.md の動作確認試験書網羅性チェック結果 |
| 3 | 書き込み忘れチェック完了 | pending-issues-management (aide-powers skill) の check モード実行済み |
| 4 | pending-issues.md が存在する場合はユーザー確認済み | pending-issues-management (aide-powers skill) の present モード実行済み |
| 5 | impl-progress.md に結果が記録済み | 最終設計準拠チェック結果 + 動作確認試験書網羅性チェック結果 |
| 6 | git-commit-workflow (aide-powers skill) でコミット済み | コミット完了 |

## ユーザーとの対話ポイント

| # | 対話ポイント | タイミング | 内容 |
|---|---|---|---|
| 1 | 未実装項目の発見時 | Step 1で ❌ が発見された場合 | 追加実装の方針をユーザーに確認する |
| 2 | 試験項目の不足発見時 | Step 2で ❌ が発見された場合 | 実装漏れか試験項目漏れかをユーザーに確認する |
| 3 | 書き込み漏れの追記確認 | Step 3の check モードで漏れが発見された場合 | ユーザーに確認の上で追記する |
| 4 | pending-issues の提示 | Step 3で pending-issues.md が存在する場合 | 記録された全問題をユーザーに提示し、確認を取る |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。最終品質確認のルールに違反しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「実装ループで全タスク完了したから最終チェックは形式的」 | 実装ループはタスク単位のチェック。最終チェックは全体を横断する網羅性チェック。観点が異なる |
| 「設計準拠チェックで ❌ が少しだけだから次に進もう」 | ❌ が1つでもあれば追加実装サイクルを実行する。「少し」は主観的判断 |
| 「試験項目が足りないだけだから追記すれば済む」 | 試験項目の不足は実装漏れの兆候。まずStep 1に差し戻して実装漏れがないか確認する |
| 「pending-issues の書き込み忘れチェックは時間がかかるから省略」 | 書き込み忘れチェックは品質の最終防衛線。省略は記録漏れに直結する |
| 「pending-issues が空だからStep 3は不要」 | 書き込み忘れチェック（check モード）は pending-issues.md の有無に関わらず実行する。進捗ファイルの遡り照合が目的 |
| 「Step 2で ❌ が出たが試験項目追記だけで済むはず」 | 安易に「試験項目漏れ」と判断せず、まず実装漏れの可能性を確認する。Step 1への差し戻しが原則 |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「全タスクのレビューが通っているから最終チェックは冗長」 | タスク単位のレビューは局所的。最終チェックは全設計書を横断する全体整合性の確認。冗長ではなく補完的 |
| 「動作確認試験書は手動テスト用だから厳密でなくてよい」 | 動作確認試験書はユーザー要件の網羅性を保証する最終手段。自動テストでカバーできない操作手順を含む |
| 「pending-issues は実装ループ中に全部記録したはず」 | 「はず」は証拠にならない。進捗ファイルを遡って照合し、漏れがないことを確認する |
| 「Step 1の追加実装は小さいからレビューは省略」 | 追加実装の規模に関わらず、`multi-stage-code-review (aide-powers skill)` の全パイプラインを通す。レビュー省略は品質崩壊の始まり |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- `fs-impl-phase4-execution (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-impl-phase5-final-check`

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase6-doc-generation (aide-powers skill)` — ドキュメント生成フェーズ

**Related skills:**
- `multi-stage-code-review (aide-powers skill)` — Step 1の追加実装サイクルで使用（implementation モード / test モード）
- `pending-issues-management (aide-powers skill)` — Step 3の書き込み忘れチェック（check モード）とユーザー提示（present モード）
- `git-commit-workflow (aide-powers skill)` — 全ステップ完了後のコミット
- `design-sync (aide-powers skill)` — Step 1の追加実装中に設計不備が発覚した場合の設計書同期更新
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Named agents（agents/ 配下）:**
- `design-review-agent (aide-powers agent)` — Step 1の全設計書全項目照合
- `micro-impl-agent (aide-powers agent)` — Step 1の追加実装（multi-stage-code-review 経由）
- `code-review-agent (aide-powers agent)` — Step 1の追加実装サイクル内レビュー（multi-stage-code-review 経由）

**Global rules:** `.aide/references/global-rules.md` を厳守
