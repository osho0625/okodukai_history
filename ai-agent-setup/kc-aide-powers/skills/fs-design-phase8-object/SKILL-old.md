---
name: fs-design-phase8-object
description: "Use when fs-design-phase7-ddd (and gate2) is complete and object design for all layers needs to be created. Orchestrates 5 sub-phases: domain → app → infra → pres → summary, then triggers gate3 QA review."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# オブジェクト設計（フェーズ8）

## Overview

**Core principle:** レイヤー別にオブジェクトを設計し、SOLID原則とテスタビリティを全クラスに適用する。ドメイン層は ddd-modeler が、他の層は object-designer が担当する。5サブフェーズを順序通りに実行し、前のサブフェーズの成果物を次のサブフェーズの入力とする。

## The Iron Law

```
NO OBJECT DESIGN WITHOUT LAYERED-ARCHITECTURE APPROVAL FIRST.
レイヤードアーキテクチャ設計（ゲート2）の承認なしに、オブジェクト設計に着手してはならない。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| object-design-domain.md | `.aide/specs/{feature_name}/object-design-domain.md` | ドメイン層オブジェクト設計 |
| object-design-application.md | `.aide/specs/{feature_name}/object-design-application.md` | アプリケーション層オブジェクト設計 |
| object-design-infrastructure.md | `.aide/specs/{feature_name}/object-design-infrastructure.md` | インフラ層オブジェクト設計 |
| object-design-presentation.md | `.aide/specs/{feature_name}/object-design-presentation.md` | プレゼンテーション層オブジェクト設計 |
| object-design.md | `.aide/specs/{feature_name}/object-design.md` | オブジェクト設計概要（全レイヤー俯瞰） |
| ubiquitous-language.md | `.aide/specs/{feature_name}/ubiquitous-language.md` | ユビキタス言語辞書 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase8-object
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: domain — ドメイン層設計
- テンプレート: `ddd-modeler-prompt.md`（mode: phase8_domain）
- Task でサブエージェントをディスパッチする
- 入力:
  - `.aide/specs/{feature_name}/user-requirements.md`
  - `.aide/specs/{feature_name}/system-requirements.md`
  - `.aide/specs/{feature_name}/development-plan.md`
  - `.aide/specs/{feature_name}/system-architecture.md`
  - `.aide/specs/{feature_name}/layered-architecture.md`
- 出力:
  - `.aide/specs/{feature_name}/object-design-domain.md`
  - `.aide/specs/{feature_name}/ubiquitous-language.md`
- 処理:
  1. ddd-modeler-prompt.md を mode: phase8_domain で Task ディスパッチする
  2. サブエージェントがユーザーと対話しながらドメイン層を設計する
  3. ユーザー合意を確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step1`, step_title: `domain — ドメイン層設計`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: app — アプリケーション層設計
- テンプレート: `object-designer-prompt.md`（mode: phase8_app）
- Task でサブエージェントをディスパッチする
- 入力:
  - 前フェーズ全成果物
  - `.aide/specs/{feature_name}/object-design-domain.md`
  - `.aide/specs/{feature_name}/ubiquitous-language.md`
  - `.aide/specs/{feature_name}/usecases/` 配下のユースケースファイル
- 出力:
  - `.aide/specs/{feature_name}/object-design-application.md`
- 処理:
  1. object-designer-prompt.md を mode: phase8_app で Task ディスパッチする
  2. サブエージェントがユーザーと対話しながらアプリケーション層を設計する
  3. ユーザー合意を確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step2`, step_title: `app — アプリケーション層設計`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: infra — インフラ層設計
- テンプレート: `object-designer-prompt.md`（mode: phase8_infra）
- Task でサブエージェントをディスパッチする
- 入力:
  - 前フェーズ全成果物
  - `.aide/specs/{feature_name}/object-design-domain.md`
  - `.aide/specs/{feature_name}/object-design-application.md`
- 出力:
  - `.aide/specs/{feature_name}/object-design-infrastructure.md`
- 処理:
  1. object-designer-prompt.md を mode: phase8_infra で Task ディスパッチする
  2. サブエージェントがユーザーと対話しながらインフラ層を設計する
  3. ユーザー合意を確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step3`, step_title: `infra — インフラ層設計`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: pres — プレゼンテーション層設計
- テンプレート: `object-designer-prompt.md`（mode: phase8_pres）
- Task でサブエージェントをディスパッチする
- 入力:
  - 前フェーズ全成果物
  - `.aide/specs/{feature_name}/object-design-domain.md`
  - `.aide/specs/{feature_name}/object-design-application.md`
  - `.aide/specs/{feature_name}/object-design-infrastructure.md`
  - `.aide/specs/{feature_name}/gui-design.md`
- 出力:
  - `.aide/specs/{feature_name}/object-design-presentation.md`
- 処理:
  1. object-designer-prompt.md を mode: phase8_pres で Task ディスパッチする
  2. サブエージェントがユーザーと対話しながらプレゼンテーション層を設計する
  3. ユーザー合意を確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step4`, step_title: `pres — プレゼンテーション層設計`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: summary — オブジェクト設計概要
- テンプレート: `object-designer-prompt.md`（mode: phase8_summary）
- Task でサブエージェントをディスパッチする
- 入力:
  - `.aide/specs/{feature_name}/object-design-domain.md`
  - `.aide/specs/{feature_name}/object-design-application.md`
  - `.aide/specs/{feature_name}/object-design-infrastructure.md`
  - `.aide/specs/{feature_name}/object-design-presentation.md`
- 出力:
  - `.aide/specs/{feature_name}/object-design.md`
- 処理:
  1. object-designer-prompt.md を mode: phase8_summary で Task ディスパッチする
  2. サブエージェントが全レイヤーの概要をまとめる
  3. ユーザー合意を確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step5`, step_title: `summary — オブジェクト設計概要`, artifact_dir: `.aide/specs/{feature_name}`

### Step 6: 共通スキル呼び出し: object-design（新規作成モード）
- **REQUIRED SUB-SKILL:** Use object-design (aide-powers skill)
- 新規作成モードで呼び出し、成果物の品質基準を最終確認する:
  - SOLID原則の適用状況
  - テスタビリティの確保
  - ドメインモデル貧血症の防止
  - レイヤー間依存の正しさ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step6`, step_title: `共通スキル呼び出し: object-design（新規作成モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 7: QAレビュー: design-qa-dispatch 経由で object-design-qa-agent (aide-powers agent) を呼び出し
- **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill)
- パラメータ: 設計領域 = object-design
- → object-design-qa-agent (aide-powers agent) が呼び出される
- レビュー対象成果物:
  - object-design-domain.md
  - object-design-application.md
  - object-design-infrastructure.md
  - object-design-presentation.md
  - ubiquitous-language.md
- 前提成果物（照合用）:
  - user-requirements.md
  - system-requirements.md
  - gui-design.md
  - layered-architecture.md
- 検証項目（8カテゴリ）:
  - A. ドメイン層への技術浸食チェック
  - B. レイヤー間依存違反チェック
  - C. ドメインモデル貧血症チェック
  - D. テスト容易性チェック
  - E. ユビキタス言語の整合性チェック
  - F. SOLID原則チェック
  - G. 集約と整合性の境界チェック
  - H. オブジェクト定義の品質チェック
- APPROVED → Step後処理を実行し、後処理へ
- REJECTED → Step 8（修正ループ）へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `step7`, step_title: `QAレビュー: design-qa-dispatch 経由で object-design-qa-agent を呼び出し`, artifact_dir: `.aide/specs/{feature_name}`

### Step 8: 修正ループ（QA REJECTED時のみ）
1. QA指摘内容から修正対象サブフェーズを特定する:
   - ドメイン層の問題（貧血症、ユビキタス言語、集約境界、技術浸食） → ddd-modeler-prompt.md を mode: fix で Task ディスパッチする
   - 非ドメイン層の問題（SOLID違反、レイヤー依存、テスト容易性、オブジェクト品質） → object-designer-prompt.md を mode: fix で Task ディスパッチする
2. 修正後、ユーザー合意を確認する
3. **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill) — 修正内容をコミットする
4. **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill) — 設計領域 = object-design で再QAを実行する
5. APPROVED になるまで 1→4 を繰り返す（※ 再QAの省略は絶対禁止）

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase9-infra (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase8-object`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### サブフェーズ別テンプレート呼び出し一覧

| ステップ | サブフェーズ | テンプレート | モード | 担当 |
|---|---|---|---|---|
| 1 | domain | ddd-modeler-prompt.md | phase8_domain | ドメイン層設計（エンティティ、VO、集約、ドメインサービス、リポジトリIF）+ ユビキタス言語辞書 |
| 2 | app | object-designer-prompt.md | phase8_app | アプリケーション層設計（ユースケースクラス、DTO、例外、DI、設定） |
| 3 | infra | object-designer-prompt.md | phase8_infra | インフラ層設計（リポジトリ具象、アダプタ、ダミー実装、データマッピング） |
| 4 | pres | object-designer-prompt.md | phase8_pres | プレゼンテーション層設計（画面クラス、UIイベント、スレッド管理、エントリーポイント） |
| 5 | summary | object-designer-prompt.md | phase8_summary | オブジェクト設計概要（設計方針サマリ、クラス一覧、関連図） |
| 8（fix） | domain修正 | ddd-modeler-prompt.md | fix | ドメイン層の問題修正（貧血症、ユビキタス言語、集約境界、技術浸食） |
| 8（fix） | 非ドメイン層修正 | object-designer-prompt.md | fix | 非ドメイン層の問題修正（SOLID違反、レイヤー依存、テスト容易性、オブジェクト品質） |

### 完了条件

以下の全てを満たすこと:

1. 5サブフェーズの全成果物が作成されている
   - object-design-domain.md
   - object-design-application.md
   - object-design-infrastructure.md
   - object-design-presentation.md
   - object-design.md
   - ubiquitous-language.md
2. 各サブフェーズでユーザー合意を得ている
3. doc-index-maintenance (aide-powers skill) で doc-index.md を更新済み
4. git-commit-workflow (aide-powers skill) でコミット済み
5. design-qa-dispatch (aide-powers skill) 経由で object-design-qa-agent (aide-powers agent) が APPROVED を返している
6. 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
7. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
8. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
9. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- クラス図・レイヤー間関連図・ドメインモデル図の表示
- クラス間の依存関係・継承関係の視覚的提示

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。

| Red Flag | なぜ危険か |
|---|---|
| 「ドメイン層が単純だから domain サブフェーズを省略する」 | DDD不採用でもドメイン層の設計は必要。省略するとレイヤー間の依存関係が曖昧になる |
| 「前のサブフェーズの成果物を読まずに次のサブフェーズを始める」 | 各サブフェーズは前のサブフェーズの成果物を入力とする。読まずに設計すると整合性が崩れる |
| 「QAでREJECTEDされたが修正したから再QAは不要」 | 修正内容の妥当性はQAエージェントが判断する。再QAの省略は絶対禁止 |
| 「summary サブフェーズは概要だけだから省略する」 | object-design.md は全レイヤーの俯瞰図であり、ゲート3のレビューで必要 |
| 「テスト用ダミー実装は実装フェーズで考える」 | ダミー実装の設計はインフラ層設計の責務。設計フェーズで定義しないと実装時に設計漏れが発生する |
| 「全レイヤーを一度に設計した方が効率的」 | 順序依存の設計を一度にやると整合性が崩れる。domain → app → infra → pres → summary の順序を守る |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「エンティティにメソッドがなくてもデータクラスとして十分」 | ドメインモデル貧血症。ビジネスルール（振る舞い）をドメインオブジェクト自身に持たせる |
| 「ドメイン層から外部ライブラリを直接使った方が効率的」 | ドメイン層への技術浸食。インターフェース経由で依存性を逆転させる |
| 「全レイヤーを一度に設計した方が効率的」 | 順序依存の設計を一度にやると整合性が崩れる。domain → app → infra → pres → summary の順序を守る |
| 「ユビキタス言語辞書は後で作る」 | ドメイン層設計と同時に作成しないと、用語の揺れが全レイヤーに波及する |
| 「テスト用ダミー実装は本番コードではない」 | テスト用ダミー実装は src/infrastructure/ に配置する本番コード。DIで切り替え可能にする設計が必要 |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキル）:**
- `fs-design-phase9-infra (aide-powers skill)` — QA APPROVED 後に遷移

**呼び出す共通スキル:**
- `object-design (aide-powers skill)` — オブジェクト設計の新規作成モード（Step 6）
- `doc-index-maintenance (aide-powers skill)` — 成果物作成後の doc-index.md 更新（後処理）
- `git-commit-workflow (aide-powers skill)` — フェーズ完了時のコミット（後処理、Step 8）
- `design-qa-dispatch (aide-powers skill)` — ゲート3（object-design-qa-agent (aide-powers agent)）の呼び出し（Step 7、Step 8）
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること
- `tech-investigation (aide-powers skill)` — 技術調査が必要な場合に利用可能（1%ルール自動発動）

**Called by:**
- `fs-design-phase7-ddd (aide-powers skill)`（ゲート2 APPROVED 後に REQUIRED SUB-SKILL で遷移）

**Global rules:** `.aide/references/global-rules.md` を厳守
