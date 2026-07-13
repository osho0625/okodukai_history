---
name: fs-reverse-phase4-user-req
description: "Use when extracting user requirements from existing codebase by analyzing code behavior and conducting user hearings to generate user-requirements.md. This phase marks CORE COMPLETION of the reverse design workflow."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# ユーザー要件逆引き（フェーズ4）

## Overview

**Core principle:** コードから推測した要件をユーザーに提示し、補完・修正してもらう。AIが勝手に要件を決定しない。

既存コードの振る舞い・機能を4つの情報源（ユースケース/コマンド、テストケース、README/ドキュメント、エントリポイント処理フロー）から解析し、要件のドラフトを作成する。ゼロからヒアリングするのではなく、コードから読み取った情報をベースにユーザーに確認・修正してもらう形式を取る。このフェーズ完了で**コア完了**となり、他のワークフローが利用可能になる。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| user-requirements.md | .aide/specs/{feature_name}/user-requirements.md | ユーザー要件（コード解析 + ユーザーヒアリング） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-reverse-phase4-user-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: サブエージェント委譲（コード解析 + ヒアリング + 成果物作成）
- reverse-user-requirements-prompt.md テンプレートを Read で読み込み、プレースホルダーを実際の値に置換してから Task でサブエージェントをディスパッチする
- 渡すプレースホルダー:
  - {feature_name}: スペックディレクトリ名
  - {specs_dir}: .aide/specs/{feature_name}
  - {program_structure_path}: .aide/specs/{feature_name}/program-structure.md
  - {dev_environment_path}: .aide/specs/{feature_name}/dev-environment.md
  - {system_requirements_path}: .aide/specs/{feature_name}/system-requirements.md
- サブエージェントが実行する処理:
  1. 機能の抽出（コード解析）
     - (a) ユースケース/コマンドの特定
     - (b) テストケースからの機能推定
     - (c) README/ドキュメントからの情報
     - (d) エントリポイントからの処理フロー
  2. 要件の構造化（ドラフト作成）
     - プロジェクト概要（推定）
     - 機能一覧（根拠付き）
  3. ユーザーへのヒアリング（質問は1つずつ）
     - (1) プロジェクト概要の確認
     - (2) 対象ユーザーの確認
     - (3) 機能一覧の確認
     - (4) 優先順位の確認（MoSCoW分類）
     - (5) スコープ外の確認
  4. user-requirements.md の作成
  5. ユーザーに提示して合意を得る
     - 合意を得たら「ユーザー要件逆引き完了」と明示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step1`, step_title: `サブエージェント委譲（コード解析 + ヒアリング + 成果物作成）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: サブエージェント報告ステータスの処理
- サブエージェントの報告ステータスに応じて分岐:
  - DONE → Step後処理を実行し、完了シーケンスに進む
  - DONE_WITH_CONCERNS → 懸念事項を確認し、問題なければ完了シーケンスに進む
  - NEEDS_CONTEXT → 不足情報を補完して再委譲する
  - BLOCKED → ブロッカーを評価し、対処する

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step2`, step_title: `サブエージェント報告ステータスの処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: 成果物の検証
- Read で user-requirements.md を確認する
  - ファイルが正しく作成されているか
  - 必須セクション（プロジェクト概要、要件一覧（MoSCoW分類）、前提条件・制約）が含まれているか
  - 各要件に情報源（トレーサビリティ）が記載されているか

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step3`, step_title: `成果物の検証`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: ★ コア完了宣言 ★
- ユーザーに以下を案内する:
  - 「コアドキュメント（4件）が全て揃いました」
  - 「他のワークフロー（実装・変更・バグ修正・リファクタリング）が利用可能です」
  - 「オプションフェーズ（アーキテクチャ・オブジェクト設計等）に進みます」

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `step4`, step_title: `★ コア完了宣言 ★`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase5-optional-phases (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase4-user-req`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

フェーズ4の完了は以下の全条件を満たした場合に宣言する:

| # | 条件 | 検証方法 |
|---|---|---|
| 1 | user-requirements.md が作成されている | ファイルの存在確認 |
| 2 | ユーザーが成果物に合意している | サブエージェントからの合意報告 |
| 3 | doc-index.md に user-requirements.md が登録されている | doc-index-maintenance (aide-powers skill) 共通スキルの完了 |
| 4 | gitコミットが完了している | git-commit-workflow (aide-powers skill) 共通スキルの完了 |
| 5 | reverse-progress.md にフェーズ4完了が記録されている | ファイルの内容確認 |

### コア完了宣言

コア完了宣言は、完了シーケンス（phase-compliance-check (write) → doc-index-maintenance (aide-powers skill) → git-commit-workflow (aide-powers skill)）が全て完了した後に実行する。

**宣言内容:**

```
★ コア完了 ★

設計逆引きワークフローのコアフェーズが完了しました。
以下の4つのコアドキュメントが生成されています:

1. program-structure.md — プログラム構成（ファイル構成・依存関係）
2. dev-environment.md — 開発実行環境
3. system-requirements.md — システム要件（技術スタック・非機能要件）
4. user-requirements.md — ユーザー要件

これにより、以下のワークフローが利用可能になりました:
- 実装ワークフロー: 設計書に基づく実装
- 変更ワークフロー: 機能追加・仕様変更
- バグ修正ワークフロー: バグ修正
- リファクタリングワークフロー: 内部構造改善

続いて、オプションフェーズ（アーキテクチャ・オブジェクト設計・インフラIF・GUI設計）の実行判定に進みます。
```

### コアドキュメント一覧

| # | コアドキュメント | 生成フェーズ |
|---|---|---|
| 1 | program-structure.md | フェーズ1 |
| 2 | dev-environment.md | フェーズ2 |
| 3 | system-requirements.md | フェーズ3 |
| 4 | user-requirements.md | フェーズ4（本フェーズ） |

コア完了後、他のワークフロー（実装・変更・バグ修正・リファクタリング）が利用可能になる。オプションフェーズ（フェーズ5〜8）は、コードの構造に応じて追加で実行される。

### 制約（プロセス全体に適用）

NO REQUIREMENT DECISION WITHOUT USER CONFIRMATION.
ユーザーの確認なしに、要件を確定してはならない。

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「コードから読み取った要件をそのまま確定しよう」 | ユーザーの確認なしに要件を確定してはならない。コードから推測した要件は必ずユーザーに提示して確認・修正を求める |
| 「ユーザーが忙しそうだからヒアリングを省略しよう」 | ヒアリングは本フェーズの核心。省略するとユーザーの意図と乖離した要件書が生成される |
| 「機能が多いのでまとめて確認しよう」 | 質問は1つずつ行う。まとめて確認するとユーザーが見落とす |
| 「テストケースに書かれているが未実装の機能は無視しよう」 | 未実装の機能もユーザーに確認する。今後の開発計画に関わる重要な情報 |
| 「コア完了宣言を省略して次に進もう」 | コア完了宣言はユーザーに現在の状態を正確に伝える重要なステップ。省略禁止 |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「コードを読めば要件は明らか」 | コードは「何をしているか」を示すが「なぜそうしているか」「何が重要か」は示さない。ユーザーヒアリングで補完が必要 |
| 「MoSCoW分類はユーザーに任せればよい」 | コードに実装済みの機能はデフォルトMustとして提示し、ユーザーに変更の余地を与える。ゼロから分類させない |
| 「README に書いてあるからヒアリング不要」 | README は古い可能性がある。コードの実態と README の記載を照合し、差異があればユーザーに確認する |
| 「スコープ外の確認は不要」 | スコープ外の明示は、今後の変更ワークフローで「対象外」と判断する根拠になる。必ず確認する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- `fs-reverse-phase3-system-req` (aide-powers skill)（REQUIRED SUB-SKILL として遷移）

**REQUIRED SUB-SKILL:**
- `fs-reverse-phase5-optional-phases` (aide-powers skill)（フェーズ4完了後に遷移）

**Common skills used:**
- `doc-index-maintenance` (aide-powers skill)（user-requirements.md の doc-index.md 登録）
- `git-commit-workflow` (aide-powers skill)（フェーズ4成果物のコミット）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`

**Global rules:** `.aide/references/global-rules.md` を厳守
