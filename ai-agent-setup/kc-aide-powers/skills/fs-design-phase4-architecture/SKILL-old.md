---
name: fs-design-phase4-architecture
description: "Use when Phase 3 (development plan) is complete and approved, to design system architecture diagrams and software block diagrams."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# システム構成設計（フェーズ4）

## Overview

要件確定後に、システム全体のアーキテクチャ図・アクティビティ図と、開発ターゲットのソフトウェア抽象構造（ブロック図）を設計するフェーズスキル。

**Core principle:** 全ての図はMermaid記法で記述し、テキストベースで差分管理可能にする。クラス名・メソッド名レベルの詳細には踏み込まず、「何がどう繋がるか」を示すことに集中する。

## The Iron Law

```
NO INDEPENDENT TECHNOLOGY SELECTION BEYOND system-requirements.md.
system-requirements.md で決定された技術スタックに基づかずに、独自の技術選定を行ってはならない。
```

技術選定はフェーズ2の範囲であり、フェーズ4では既に確定した技術スタックに基づいて設計する。矛盾がある場合はユーザーに報告し、system-requirements.md の修正を提案する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-architecture.md | {specs_dir}/system-architecture.md | システム構成設計書（アーキテクチャ図・アクティビティ図・ブロック図・設計判断・技術参考資料一覧） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase4-architecture
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase4-architecture`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: サブエージェント派遣（phase4 モード）
- `system-architecture-designer-prompt.md` に基づきサブエージェントを Task でディスパッチする
- 入力: user-requirements.md, system-requirements.md, dev-environment.md, development-plan.md
- サブエージェントがユーザーと直接対話して以下を実行:
  1. 前フェーズ成果物の読み込みと分析
  2. ユーザーに提供資料がないか確認
  3. アーキテクチャ図の設計（Mermaid記法）
  4. アクティビティ図の設計（Mermaid記法、スイムレーン使用）
  5. ブロック図の設計（Mermaid記法）
  6. 設計判断の記録
  7. 技術参考資料の整理（tech-references/ に格納）
  8. system-architecture.md の作成
  9. ユーザーへの提示と合意取得
  10. フェーズ1〜4全成果物のレビュー依頼

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase4-architecture`, step_id: `step1`, step_title: `サブエージェント派遣（phase4 モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: サブエージェント報告の評価
- DONE → Step後処理を実行し、Step 3 へ
- DONE_WITH_CONCERNS → 懸念事項を確認し、必要に応じて対処後 Step 3 へ
- NEEDS_CONTEXT → 不足情報を補完して Step 1 を再実行
- BLOCKED → 段階的対応（コンテキスト追加 → タスク分割 → ユーザーエスカレーション）

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase4-architecture`, step_id: `step2`, step_title: `サブエージェント報告の評価`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: 成果物の確認
- system-architecture.md が作成されていることを Read で確認する
- tech-references/ 配下のファイルが作成されていることを Glob で確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase4-architecture`, step_id: `step3`, step_title: `成果物の確認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase5-gui (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase4-architecture`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### fix モード（QA指摘修正 / ユーザー指摘修正）

**Step 1:** サブエージェント派遣（fix モード）
- `system-architecture-designer-prompt.md` に基づきサブエージェントを fix モードで Task ディスパッチする
- 入力: QA指摘内容 or ユーザー指摘内容、修正対象ファイル
- サブエージェントが修正を実行
- 修正後、ユーザー合意を取得

**Step 2:** 共通スキル呼び出し
- **REQUIRED SUB-SKILL:** git-commit-workflow (aide-powers skill)

### 完了条件

以下の全てを満たすこと:

- [ ] `system-architecture.md` が作成されている
- [ ] system-architecture.md に以下のセクションが含まれている:
  - §1.1 アーキテクチャ図（Mermaid記法）
  - §1.2 アクティビティ図（Mermaid記法、スイムレーン使用）
  - §2 ソフトウェア抽象構造（ブロック図、Mermaid記法）
  - §3 設計判断の記録
  - §4 技術参考資料一覧
- [ ] 技術参考資料が `tech-references/` に格納されている（該当する情報がある場合）
- [ ] 全ての図がMermaid記法で記述されている
- [ ] ユーザーが system-architecture.md の内容に合意している
- [ ] フェーズ1〜4の全成果物のレビューをユーザーに依頼している
- [ ] doc-index-maintenance (aide-powers skill) が完了している
- [ ] git-commit-workflow (aide-powers skill) が完了している
- [ ] 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
- [ ] 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
- [ ] 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
- [ ] ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### ビジュアルコンパニオン活用

以下の場面では visual-companion (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- システム構成図・ブロック図・アクティビティ図のMermaid図をブラウザでレンダリング表示
- レイヤー構成・コンポーネント間の依存関係を視覚的に提示

## Red Flags - STOP

| Red Flag | なぜ危険か |
|---|---|
| 「クラス名やメソッド名を定義しよう」と考えた | STOP — フェーズ4は抽象構造の設計。クラス・メソッドレベルの詳細はフェーズ8の範囲 |
| 「system-requirements.md にない技術を使おう」と考えた | STOP — 技術選定はフェーズ2の範囲。矛盾がある場合はユーザーに報告 |
| 「Mermaid以外の記法で図を書こう」と考えた | STOP — 全ての図はMermaid記法で記述する（テキストベースで差分管理可能にするため） |
| 「ユーザーに確認せずに進めよう」と考えた | STOP — 合意なしに次のフェーズに進まない |
| 「プログラムの処理フロー（関数呼び出し順序等）をアクティビティ図に書こう」と考えた | STOP — アクティビティ図はビジネスフロー/システムフローを対象とする |
| 「技術参考資料は後で整理しよう」と考えた | STOP — フェーズ4で整理する。後続フェーズで参照すべき情報を今整理する |
| 「レイヤー構成を詳細に定義しよう」と考えた | STOP — レイヤードアーキテクチャの詳細設計はフェーズ7の範囲 |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ブロック図にクラス名を入れた方がわかりやすい」 | 抽象度を保つことが目的。クラス名はフェーズ8で定義する。ブロック名は責務ベースにする |
| 「技術参考資料は少ないから1ファイルにまとめよう」 | 項目ごとにファイル分割する。1ファイルに複数の無関係な情報を詰め込まない |
| 「アクティビティ図にプログラムの処理フローを書いた方が実装時に役立つ」 | アクティビティ図はビジネスフロー/システムフローを対象とする。プログラム処理フローは実装時に設計する |
| 「ドキュメントレビュー依頼は省略してもよい」 | フェーズ4完了後のレビュー依頼は必須。ユーザーがフェーズ1〜4の全成果物を確認する重要な機会 |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- `design-phase3`（開発計画書フェーズ）— REQUIRED SUB-SKILL として遷移

**Next:**
- fs-design-phase5-gui (aide-powers skill) — REQUIRED SUB-SKILL として遷移

**呼び出す共通スキル:**
- doc-index-maintenance (aide-powers skill) — 成果物作成後に system-architecture.md と tech-references/*.md をインデックスに追加
- git-commit-workflow (aide-powers skill) — フェーズ完了時（ユーザー合意後）に system-architecture.md と tech-references/*.md をコミット

**Available on demand:**
- pending-issues-management (aide-powers skill) — 設計中に発見した問題を記録する場合
- tech-investigation (aide-powers skill) — 技術調査が必要な場合（1%ルール自動発動。特に外部IF仕様やフレームワーク制約の調査で利用される可能性がある）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Input from caller:**
- feature_name
- specs_dir（`.aide/specs/{feature_name}/`）
- user-requirements.md のパス
- system-requirements.md のパス
- dev-environment.md のパス
- development-plan.md のパス

**Global rules:** `.aide/references/global-rules.md` を厳守
