---
name: fs-design-phase7-ddd
description: "Use when designing layered architecture and making DDD adoption decisions in the design workflow, after usecase analysis (phase 6) is complete."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# レイヤードアーキテクチャ設計（fs-design-phase7-ddd）

## Overview

**Core principle:** プロジェクトのドメイン特性を正確に分析し、DDD採用可否を根拠に基づいて判断した上で、変更に強いレイヤードアーキテクチャを設計する。

fs-design-phase7-ddd は設計ワークフローのフェーズ7として、ユースケース分析（フェーズ6）完了後に実行される。DDD採用可否の判断、アーキテクチャパターンの選択・設計、テスト用ダミー実装の設計方針定義、ユビキタス言語辞書の初期版作成を行う。完了後にゲート2（アーキテクチャレビュー）を通過する必要がある。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| layered-architecture.md | `.aide/specs/{feature_name}/layered-architecture.md` | レイヤードアーキテクチャ設計書（DDD採用判断・レイヤー構成・依存ルール） |
| ubiquitous-language.md | `.aide/specs/{feature_name}/ubiquitous-language.md` | ユビキタス言語辞書の初期版（DDD採用時のみ） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase7-ddd
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase7-ddd`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: ddd-modeler サブエージェントの呼び出し（create モード）
- `./ddd-modeler-prompt.md` を Read で読み込み、テンプレート変数を埋めて Task でサブエージェントをディスパッチする
- サブエージェントに渡す情報:
  - feature_name
  - scope: architecture
  - mode: create
  - 前フェーズ成果物のパス
- サブエージェントの処理:
  1. ddd-modeling (aide-powers skill)（新規作成モード: architecture スコープ）を読み込む
  2. DDD採用可否を3観点で判断する
     - (1) ドメインルール・振る舞いの有無
     - (2) ルール変更の主体（自チーム判断か外部依存か）
     - (3) 変更の可能性
  3. DDD採用時: アーキテクチャパターンを選択・設計する（レイヤード/ヘキサゴナル/オニオン/クリーンから選択）
     DDD不採用時: プロジェクト特性に適したアーキテクチャを設計する
  4. 共通設計原則を適用する:
     - ドメイン層は他のどの層にも依存しない
     - インフラ層はドメイン層のインターフェースを実装（依存性逆転）
     - 層をまたぐ依存はインターフェース経由
     - 新しいユースケース追加時に既存のドメインオブジェクトを再利用できる構造にする
  5. テスト用ダミー実装の設計方針を定義する
  6. DDD採用時: ユビキタス言語辞書の初期版を作成する
  7. `.aide/specs/{feature_name}/layered-architecture.md` に成果物を作成
  8. DDD採用時: `.aide/specs/{feature_name}/ubiquitous-language.md` を作成
  9. ユーザーに提示し合意を得る
- ユーザー合意 → Step後処理を実行し、Step 2 へ
- ユーザーが修正を要求 → サブエージェントがユーザーと対話して修正 → 再提示

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase7-ddd`, step_id: `step1`, step_title: `ddd-modeler サブエージェントの呼び出し（create モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: QAレビュー（ゲート2）
- **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill)
- パラメータ:
  - ゲート: gate2（アーキテクチャレビュー）
  - レビュー対象: gui-design.md, layered-architecture.md
  - 前提成果物: user-requirements.md, system-requirements.md
  - QAレビューアー: architecture-qa-agent (aide-powers agent)
- 検証項目:
  - 2-1. GUI設計の要件充足（Must要件ごとに対応する画面・UI要素が存在するか）
  - 2-2. DDD採用判断とアーキテクチャパターン選択の妥当性
  - 2-3. レイヤー間依存方向（逆方向の依存が1つでもあればFAIL）
  - 2-4. ドメイン層の独立性（外部ライブラリへの直接参照がないか）
  - 2-5. 依存性逆転の適用（DIによる依存注入の方針が定義されているか）
- APPROVED → Step後処理を実行し、後処理へ
- REJECTED → Step 2r（修正ループ）へ

  **Step 2r:** REJECTED→fix→再QAループ
  1. architecture-qa-agent (aide-powers agent) の修正指示を受け取る
  2. 修正指示の対象に応じてサブエージェントを fix モードで呼び出す:
     - DDD/レイヤー構成の問題 → ddd-modeler-prompt.md（mode: fix）で Task ディスパッチ
     - GUI設計の問題 → gui-designer-prompt.md（mode: fix）で Task ディスパッチ（fs-design-phase5-gui (aide-powers skill) のプロンプトテンプレートを使用）
  3. 修正後、ユーザーに修正内容を提示
  4. **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill)
  5. **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill) で再QA（省略絶対禁止）
  6. APPROVED になるまで 1〜5 を繰り返す

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase7-ddd`, step_id: `step2`, step_title: `QAレビュー（ゲート2）`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)（layered-architecture.md, ubiquitous-language.md を登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase8-object (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase7-ddd`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下の全てを満たすこと:

1. `layered-architecture.md` が作成されている
2. DDD採用可否の判断結果（分析観点・結論・理由）が記載されている
3. レイヤー構成図、各レイヤーの責務定義、依存ルールが記載されている
4. テスト用ダミー実装の設計方針が記載されている
5. DDD採用時: `ubiquitous-language.md`（初期版）が作成されている
6. ユーザーが layered-architecture.md の内容に合意している
7. doc-index-maintenance (aide-powers skill) が完了している
8. git-commit-workflow (aide-powers skill) が完了している
9. design-qa-dispatch (aide-powers skill) 経由のQAレビュー（ゲート2）が APPROVED である
10. 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
11. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
12. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
13. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### 厳守ルール

- **QA APPROVED なしに次フェーズへ進んではならない**
- **REJECTED 後の修正を行った場合、再QA を省略してはならない**

### ビジュアルコンパニオン活用

以下の場面では visual-companion (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- レイヤードアーキテクチャ構成図・レイヤー間依存方向図の表示
- DDD採用判断時のアーキテクチャパターン比較を視覚的に提示

## Red Flags - STOP

以下の思考パターンに気づいたら、即座に停止して正しいプロセスに戻ること:

| Red Flag | なぜ危険か |
|---|---|
| 「プロジェクトが小さいからDDD判断は不要」 | プロジェクト規模に関わらず、DDD採用可否の判断プロセスは必須。判断結果が「不採用」であっても、判断プロセス自体を省略してはならない |
| 「レイヤードアーキテクチャは定番だから4層で固定」 | アーキテクチャパターンはプロジェクト特性に応じて選択する。4層レイヤードに固定せず、ヘキサゴナル/オニオン/クリーンも検討すること |
| 「DDD不採用だからアーキテクチャ設計は簡単でよい」 | DDD不採用でも、レイヤー構成・依存ルール・変更容易性の確保は必要。手を抜いてはならない |
| 「QAレビューで指摘されたが、修正したから再QAは不要」 | 修正後の再QAは絶対に省略できない。修正の妥当性はQAエージェントが判断する |
| 「ユビキタス言語辞書はフェーズ8で作ればよい」 | DDD採用時は、フェーズ7でユビキタス言語辞書の初期版を作成する。フェーズ8で詳細化するが、初期版の作成を省略してはならない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ドメインルールが単純だからDDD不要」 | 単純に見えても、3観点の分析を行った上で判断する。分析なしの「不要」判断は根拠がない |
| 「テスト用ダミー実装は実装フェーズで考える」 | テスト用ダミー実装の設計方針はアーキテクチャ設計の一部。実装フェーズに先送りすると、テスタビリティが確保できない設計になるリスクがある |
| 「依存性逆転は過剰設計」 | DDD採用時の依存性逆転は必須の設計原則。「過剰」と感じるのは、ドメイン層の独立性の重要性を過小評価している |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Required workflow skills:**
- `doc-index-maintenance` (aide-powers skill) — 成果物作成後のドキュメントインデックス更新
- `git-commit-workflow` (aide-powers skill) — フェーズ完了時のgitコミット
- `design-qa-dispatch` (aide-powers skill) — ゲート2（アーキテクチャレビュー）の実行
- `ddd-modeling` (aide-powers skill) — DDD/レイヤードアーキテクチャ設計の手法・ルール・品質基準（サブエージェント内で使用）
- `pending-issues-management` (aide-powers skill) — 問題発見時の記録
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- `fs-design-phase6-usecase` (aide-powers skill)（REQUIRED SUB-SKILL として）

**Next phase:**
- **REQUIRED SUB-SKILL:** `fs-design-phase8-object` (aide-powers skill)（QA APPROVED 後）

**Input from caller:**
- feature_name（プロジェクト名）
- specs_dir（`.aide/specs/{feature_name}`）

**Global rules:** `.aide/references/global-rules.md` を厳守
