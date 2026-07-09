---
name: fs-refactoring-phase4-design
description: "Use when refactoring plan is approved and detailed delta design with QA review is needed before implementation"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# リファクタリング差分設計（フェーズ4）

## Overview

**Core principle:** リファクタリングの差分設計は、既存設計書を基準に before→after で明記し、外部振る舞いの保持と過去不具合修正の保持を設計レベルで確認せよ。QA承認なしに実装に進むな。

## The Iron Law

```
NO IMPLEMENTATION WITHOUT QA-APPROVED DESIGN.
QA承認なしに、実装フェーズに進んではならない。

COROLLARY: NO QA SKIP AFTER FIX.
修正後の再QAを省略してはならない。いかなる理由も再QA省略の根拠にならない。

NEVER MODIFY EXISTING DESIGN DOCUMENTS DURING DELTA DESIGN PHASE.
差分設計フェーズ中に既存の設計書を直接変更してはならない。
既存設計書の更新が必要な場合は、refactoring-design.md の「更新が必要な設計資料」セクションに
「実装後に更新すること」として記載すること。実装フェーズ完了後に更新する。
```

**再QA省略の絶対禁止（具体的な禁止パターン）:**
- 「修正内容がシンプルだから再QAは不要」→ 禁止
- 「QAの指摘通りに修正したから問題ないはず」→ 禁止
- 「コンテキストが大きくなってきたので再QAを省略する」→ 禁止
- 「ユーザーが急いでいるので再QAをスキップする」→ 禁止
- 「修正後にユーザー合意を得たから再QAは不要」→ 禁止
- 修正の妥当性はQAエージェントが判断するものであり、フェーズスキルが「修正したから大丈夫」と自己判断してはならない

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-design.md | {ワークフローフォルダ}/refactoring-design.md | リファクタリング差分設計書（before→after形式、タスク分解含む） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase4-design
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: 設計系共通スキル呼び出し判定
- refactoring-candidates.md + refactoring-plan.md を Read で読む
- 影響範囲を分析し、パターンA/B/C/D を判定する
- パターンA → refactoring-designer のみ
- パターンB/C/D → refactoring-designer + 設計系共通スキル（mode: delta）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `step1`, step_title: `設計系共通スキル呼び出し判定`, artifact_dir: `{refactoring_dir}`

### Step 2: 差分設計の作成
- refactoring-designer サブエージェント（mode: phase3）に Task でディスパッチ
- ※ パターンB/C/D の場合は、先に設計系共通スキルを Skill で呼び出し（mode: delta）、その結果を refactoring-designer に渡す

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `step2`, step_title: `差分設計の作成`, artifact_dir: `{refactoring_dir}`

### Step 3: ユーザー承認
- 差分設計をユーザーに提示し、合意を得る
- 修正点があれば修正して再提示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `step3`, step_title: `ユーザー承認`, artifact_dir: `{refactoring_dir}`

### Step 4: 設計QAレビュー
- design-qa-dispatch (aide-powers skill) を呼び出す
- 影響範囲に応じて必要なQAレビューアーを呼び分ける:
  - delta-design-qa-agent (aide-powers agent)（必須: 差分設計の品質検証）
  - object-design-qa-agent (aide-powers agent)（オブジェクト設計に影響がある場合）
  - architecture-qa-agent (aide-powers agent)（レイヤー構造変更を伴う場合）
- APPROVED（FAIL 0件）→ Step後処理を実行し、Step 5 へ
- APPROVED（WARNING のみ）→ WARNING内容をユーザーに共有 → Step後処理を実行し、Step 5 へ
- REJECTED（FAIL 1件以上）→ Step 4a へ

  **4a. REJECTED→fix→再QAループ**
  - a. QA指摘内容を refactoring-designer（mode: fix）に Task でディスパッチ
  - b. refactoring-designer が refactoring-design.md を修正
  - c. 修正後、ユーザーに修正内容を提示
  - d. design-qa-dispatch (aide-powers skill) を呼び出し再QA
  - e. APPROVED になるまで a〜d を繰り返す
  - ※ 再QAの省略は絶対禁止（Iron Law）

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `step4`, step_title: `設計QAレビュー`, artifact_dir: `{refactoring_dir}`

### Step 5: タスク分解
- impl-task-planning (aide-powers skill) を呼び出す
- refactoring-design.md の差分設計をタスクに分解する:
  - 依存関係グラフ解析
  - 1タスク = 1ファイル単位
  - 各タスクに「既存テスト全実行」の注記
  - 並列実行可能なタスクに [並列可] マーカー
- タスク一覧を refactoring-design.md に追記
- impl-task-planning (aide-powers skill) の「工程チェック表の生成（必須）」に従い、`impl-process-checklist.md` を生成する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `step5`, step_title: `タスク分解`, artifact_dir: `{refactoring_dir}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase5-impl (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase4-design`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

※ リファクタリングワークフローでは全フェーズ完了後に1回のみgitコミットを行う（フェーズ6で実施）。途中フェーズでのコミットは行わない。

### Step 1: 設計系共通スキル呼び出し判定ロジック（詳細）

フェーズ4の開始時に、refactoring-candidates.md と refactoring-plan.md を Read で読み、影響が及ぶ設計領域を特定する。

#### 判定フロー

refactoring-candidates.md + refactoring-plan.md を読み、以下のパターンに分類する:

- **パターンA**: メソッド抽出、クラス分割、重複コード統合、メソッド名変更、引数変更 等のコード構造改善のみ
  - → refactoring-designer のみで差分設計を作成
- **パターンB**: レイヤー構造の変更を伴う（例: ドメイン層のクラスをアプリケーション層に移動、新しいレイヤーの追加、レイヤー間依存方向の変更）
  - → refactoring-designer + 以下の設計系共通スキル（mode: delta）:
    - object-design (aide-powers skill)（必須: クラス配置の変更）
    - ddd-modeling (aide-powers skill)（DDD採用プロジェクトの場合: ユビキタス言語・集約境界の変更）
    - program-structure-design (aide-powers skill)（ファイル配置の変更）
- **パターンC**: ドメインモデルの再設計を伴う（例: エンティティの統合・分割、値オブジェクトの追加・削除、集約境界の変更、ドメインサービスの責務移動）
  - → refactoring-designer + 以下の設計系共通スキル（mode: delta）:
    - object-design (aide-powers skill)（必須: クラス定義の変更）
    - ddd-modeling (aide-powers skill)（必須: ドメインモデルの変更）
- **パターンD**: インフラ層のインターフェース変更を伴う（例: リポジトリインターフェースの変更、外部API連携の変更）
  - → refactoring-designer + 以下の設計系共通スキル（mode: delta）:
    - object-design (aide-powers skill)（必須: インターフェース定義の変更）
    - infra-interface-design (aide-powers skill)（必須: インフラIF設計の変更）

#### 判定の入力と基準

| 判定入力 | 確認内容 | パターンA判定 | パターンB/C/D判定 |
|---|---|---|---|
| refactoring-plan.md の「影響範囲」 | 影響を受けるレイヤー数 | 1レイヤー内に収まる | 複数レイヤーにまたがる |
| refactoring-plan.md の「変更方針（before→after）」 | クラスの移動・新設・削除の有無 | 既存クラス内の変更のみ | クラスの移動・新設・削除あり |
| refactoring-candidates.md の「問題」 | 問題の種類 | 重複コード、長すぎるメソッド、責務の混在（同一クラス内） | 密結合（レイヤー間）、テスタビリティ（DI構造変更）、拡張性（アーキテクチャ変更） |
| 既存設計書の構造 | DDD採用の有無 | — | DDD採用時は ddd-modeling (aide-powers skill) も呼び出し |

#### 設計系共通スキル（mode: delta）の呼び出し対応表

| 設計系共通スキル | 呼び出し条件 | mode: delta での役割 |
|---|---|---|
| `object-design (aide-powers skill)` | パターンB/C/D（クラス定義の変更がある場合） | object-design-*.md の差分設計 |
| `ddd-modeling (aide-powers skill)` | パターンB/C（DDD採用プロジェクトでドメインモデル変更がある場合） | ubiquitous-language.md, layered-architecture.md の差分設計 |
| `infra-interface-design (aide-powers skill)` | パターンD（インフラIF変更がある場合） | infra-interface-design.md の差分設計 |
| `program-structure-design (aide-powers skill)` | パターンB（ファイル配置変更がある場合） | program-structure.md の差分設計 |
| `user-requirements-definition (aide-powers skill)` | 稀（外部振る舞いに影響する場合のみ） | user-requirements.md の差分設計 |
| `system-requirements-definition (aide-powers skill)` | 稀（非機能要件に影響する場合のみ） | system-requirements.md の差分設計 |
| `gui-design (aide-powers skill)` | 稀（GUI関連のリファクタリングの場合のみ） | gui-design.md の差分設計 |

**重要**: パターンAが最も一般的なケースであり、多くのリファクタリングは refactoring-designer のみで完結する。設計系共通スキルの mode: delta は、レイヤー構造やドメインモデルに影響が及ぶ場合にのみ呼び出す。

### 完了条件

以下の全てを満たすこと:

1. refactoring-design.md が作成されている
2. 差分設計が before→after 形式で全変更箇所について記述されている
3. 過去不具合修正の保持確認セクションが存在し、全件チェックされている
4. 外部振る舞い保持の確認セクションが存在する
5. 既存設計書の更新が必要な場合、refactoring-design.md に「更新が必要な設計資料」セクションが存在すること（更新不要の場合はセクション自体不要）
6. ユーザーが差分設計に合意している
6. design-qa-dispatch (aide-powers skill) 経由のQAレビューが APPROVED である
7. タスク分解が完了し、依存関係グラフ付きのタスク一覧が refactoring-design.md に含まれている

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` スキルを使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- レイヤー構造変更・クラス移動・ドメインモデル再設計の before→after 図
- 依存関係グラフ付きタスク一覧の可視化

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。Iron Law に違反しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「QAの指摘通りに修正したから再QAは不要」 | 修正の妥当性はQAエージェントが判断する。自己判断で再QAを省略してはならない |
| 「リファクタリングがシンプルだからQAは省略」 | リファクタリングの規模に関わらずQAは必須。シンプルな変更でも設計の整合性確認が必要 |
| 「過去のバグ修正はテストでカバーされているから確認不要」 | テストはプログラム変更と同時に変更される。テストの存在を保持の根拠としてはならない |
| 「コード構造改善だけだから設計系共通スキルは不要」 | 判定ロジックに従って判断する。「だけ」という思い込みで判定をスキップしない |
| 「コンテキストが大きいのでQAループを打ち切る」 | コンテキスト管理はQA省略の理由にならない。APPROVEDまでループを継続する |
| 「ユーザーが合意したからQAは形式的」 | ユーザー合意とQA承認は独立した品質ゲート。両方必須 |
| 「既存設計書を今すぐ直しておこう」 | 差分設計フェーズ中の既存設計書の直接変更は Iron Law 違反。refactoring-design.md の「更新が必要な設計資料」セクションに記載し、実装後に更新すること |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「メソッド抽出だけだから差分設計は簡単でいい」 | メソッド抽出でも呼び出し元の変更、import関係の変更、テストの変更が発生する。全て設計に含める |
| 「過去のバグ修正は関係ない箇所だから確認不要」 | 関係ないかどうかは確認して初めてわかる。全件チェックが必須 |
| 「外部振る舞いは変わらないはず」 | 「はず」ではなく、設計レベルで確認する。公開インターフェースの変更有無を明示的に検証する |
| 「QAで指摘された箇所だけ直せば十分」 | 指摘箇所の修正が他の箇所に影響する可能性がある。再QAで全体の整合性を確認する |
| 「タスク分解は実装フェーズでやればいい」 | タスク分解は設計フェーズの責務。実装フェーズでは設計に基づいてタスクを実行するだけ |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase5-impl (aide-powers skill)` — 本スキル完了後に遷移

**Called by:**
- `fs-refactoring-phase3-plan (aide-powers skill)` — REQUIRED SUB-SKILL として本スキルに遷移

**呼び出す共通スキル:**
- `design-qa-dispatch (aide-powers skill)` — QAレビューの実行（必要なQAレビューアーの呼び分け）
- `impl-task-planning (aide-powers skill)` — タスク分解（依存関係グラフ解析、2層構造: 親タスク=クラス/ファイル単位、サブタスク=publicメソッド単位）
- `object-design (aide-powers skill)`（mode: delta）— パターンB/C/D の場合
- `ddd-modeling (aide-powers skill)`（mode: delta）— パターンB/C の場合（DDD採用時）
- `infra-interface-design (aide-powers skill)`（mode: delta）— パターンD の場合
- `program-structure-design (aide-powers skill)`（mode: delta）— パターンB の場合
- `pending-issues-management (aide-powers skill)` — 設計中に別ワークフローで対応すべき問題を発見した場合
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**呼び出す名前付きエージェント（agents/ 配下）:**
- `delta-design-qa-agent (aide-powers agent)` — design-qa-dispatch 経由で呼び出し（必須）
- `object-design-qa-agent (aide-powers agent)` — design-qa-dispatch 経由で呼び出し（オブジェクト設計に影響がある場合）
- `architecture-qa-agent (aide-powers agent)` — design-qa-dispatch 経由で呼び出し（レイヤー構造変更を伴う場合）

**Global rules:** `.aide/references/global-rules.md` を厳守
