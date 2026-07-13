---
name: fs-reverse-phase3-system-req
description: "Use when extracting system requirements (tech stack, non-functional requirements, error handling policies) from existing codebase during reverse design workflow phase 3."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# システム要件逆引き（フェーズ3）

## Overview

**Core principle:** コードの現実を記録する。理想のシステム要件ではなく、実際に実装されている技術的な構成をそのまま記録する。

既存コードベースから技術スタック・非機能要件・エラーハンドリング方針等を抽出し、`system-requirements.md` を逆生成するフェーズスキル。前フェーズの成果物（`program-structure.md`、`dev-environment.md`）を入力として、コードの実態を正確に反映したシステム要件ドキュメントを作成する。

## The Iron Law

```
NO IDEAL DESIGN IN REVERSE-ENGINEERED DOCUMENTS — ONLY WHAT THE CODE ACTUALLY IMPLEMENTS.
コードに実装されていない要件を記載してはならない。逆引きは現実の記録である。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-requirements.md | `.aide/specs/{feature_name}/system-requirements.md` | システム要件（技術スタック・非機能要件） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-reverse-phase3-system-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase3-system-req`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: サブエージェント委譲
- reverse-system-requirements-prompt.md テンプレートを使用して Task でサブエージェントをディスパッチする
- 委譲する情報:
  - feature_name
  - 前フェーズの成果物パス（program-structure.md, dev-environment.md）
  - 解析対象の指示
  - 運用ルール
- サブエージェントが実行する処理:
  1. アプリケーション形態の特定
  2. 技術スタックの抽出
  3. データ管理方式の抽出
  4. エラーハンドリング方針の抽出
  5. ログ出力方針の抽出
  6. セキュリティ要件の抽出
  7. 非機能要件の推定
  8. 成果物作成 → ユーザーに提示 → 合意取得

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase3-system-req`, step_id: `step1`, step_title: `サブエージェント委譲`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 成果物の検証
- サブエージェント完了後、Read で成果物ファイルを確認する
  - system-requirements.md が正しく作成されているか
  - 必須セクション（システム構成概要、技術スタック、データ管理、エラーハンドリング方針、ログ出力方針）が含まれているか

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase3-system-req`, step_id: `step2`, step_title: `成果物の検証`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase4-user-req (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase3-system-req`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下の全てが満たされた場合にフェーズ3完了とする:

| # | 条件 | 確認方法 |
|---|---|---|
| 1 | 成果物の存在 | `.aide/specs/{feature_name}/system-requirements.md` が作成されている |
| 2 | 必須セクションの存在 | システム構成概要、技術スタック、データ管理、エラーハンドリング方針、ログ出力方針の各セクションが含まれている |
| 3 | ユーザー合意 | ユーザーが「システム要件逆引き完了」に合意している |
| 4 | doc-index.md 更新 | doc-index-maintenance (aide-powers skill) によりインデックスが更新されている |
| 5 | git コミット | git-commit-workflow (aide-powers skill) により成果物がコミットされている |
| 6 | 進捗記録 | reverse-progress.md にフェーズ3完了が記録されている |

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- システム構成概要図（技術スタックの関係図、データフロー図）の表示
- 外部サービス連携図の視覚的提示

## Red Flags - STOP

| Red Flag | なぜ危険か |
|---|---|
| 「コードにログ出力が print のみだが、logging を使うべきと記載しよう」 | 現実の記録に反する。print のみならそのまま記録し、改善提案は別途コメントとして記載する |
| 「エラーハンドリングが不十分だが、理想的なパターンを記載しよう」 | 逆引きは現実の記録。実装されていないパターンを記載してはならない |
| 「dev-environment.md と重複する内容は省略しよう」 | 参照で済ませてよいが、技術スタックの全体像は system-requirements.md で完結させる |
| 「外部パッケージと外部サービスを同じカテゴリにまとめよう」 | 外部パッケージ（pip install するもの）と外部サービス（API呼び出し先）は明確に区別する |
| 「コードに実装されていない将来の計画も記載しよう」 | コードに実装されていない要件は記載しない。逆引きはコードの現実を記録する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「セキュリティ要件がないから省略する」 | セキュリティ要件がないこと自体を記録する。「認証・認可の実装なし」「機密情報のハードコードあり」等 |
| 「非機能要件は推定だから書かなくてよい」 | コードから読み取れる範囲で推定し、推定であることを明記して記載する |
| 「小さなプロジェクトだからシステム要件は不要」 | プロジェクトの規模に関わらず、技術スタックとエラーハンドリング方針は記録する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- `fs-reverse-phase4-user-req (aide-powers skill)`

**Called by:**
- `fs-reverse-phase2-dev-env (aide-powers skill)`（REQUIRED SUB-SKILL として呼び出される）

**Related skills:**
- `doc-index-maintenance (aide-powers skill)` — 成果物作成後のインデックス更新
- `git-commit-workflow (aide-powers skill)` — 成果物のコミット
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
