---
name: fs-reverse-phase2-dev-env
description: "Use when fs-reverse-phase1-program completes and program-structure.md is ready. Extract development environment information from existing project configuration files."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 開発環境逆引き（設計逆引きフェーズ2）

## Overview

**Core principle:** 設定ファイルから読み取れる事実だけを記録せよ。推測は明示し、ユーザーに確認せよ。

既存プロジェクトの設定ファイル群（`pyproject.toml`, `requirements.txt`, `.python-version` 等）を解析し、開発環境の実態を `dev-environment.md` として記録する。「あるべき開発環境」ではなく「現在使われている開発環境」を正確に記録することが目的である。

**Announce at start:** 「fs-reverse-phase2-dev-env スキルを使用して、開発環境の逆引きを開始します。」

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| dev-environment.md | `.aide/specs/{feature_name}/dev-environment.md` | 開発実行環境（Python・venv・依存管理）の記録 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-reverse-phase2-dev-env
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase2-dev-env`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: サブエージェントへの委譲
- reverse-dev-environment-prompt.md テンプレートを Read で読み込み、変数を埋めて Task でサブエージェントをディスパッチする
- 委譲する情報:
  - feature_name
  - program-structure.md のパス
  - プロジェクトルートパス
  - specs_path（.aide/specs/{feature_name}）
  - 解析対象ファイル一覧
  - 運用ルール（質問は1つずつ、現実の記録、敬語、選択肢形式）
- サブエージェントが実行する処理:
  1. Python環境の特定（バージョン、仮想環境）
  2. 依存管理方式の特定（管理方式、パッケージ分類）
  3. テスト実行方式の特定（フレームワーク、実行コマンド）
  4. リンター・フォーマッターの特定
  5. その他の開発ツール（CI/CD、Docker、Makefile等）
  6. 成果物（dev-environment.md）の作成
  7. ユーザーへの提示と合意取得

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase2-dev-env`, step_id: `step1`, step_title: `サブエージェントへの委譲`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: サブエージェント完了後の検証
- dev-environment.md が正しく作成されたことを Read で確認する
- 作成されていない場合:
  - サブエージェントを再ディスパッチする（最大1回のリトライ）
  - リトライ後も作成されていない → ユーザーに報告し判断を仰ぐ
- 作成されている場合 → Step後処理を実行し、後処理へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-reverse-phase2-dev-env`, step_id: `step2`, step_title: `サブエージェント完了後の検証`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase3-system-req (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase2-dev-env`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下のすべてが満たされた場合にフェーズ2完了とする:

1. **成果物の存在**: `.aide/specs/{feature_name}/dev-environment.md` が作成されている
2. **ユーザー合意**: ユーザーが「開発環境逆引き完了」に合意している（サブエージェント内で取得）
3. **doc-index.md 更新**: doc-index-maintenance (aide-powers skill) スキルにより `dev-environment.md` のエントリが登録されている
4. **gitコミット**: git-commit-workflow (aide-powers skill) スキルにより成果物がコミットされている
5. **進捗記録**: reverse-progress.md にフェーズ2完了が記録されている

## Red Flags - STOP

以下の思考パターンに気づいたら即座に停止すること:

| Red Flag | なぜ危険か |
|---|---|
| 「設定ファイルが見つからないので、一般的な構成を書いておこう」 | 現実の記録が原則。設定ファイルがない場合はユーザーに確認する |
| 「依存管理方式が複数混在しているが、主要なものだけ記録すればよい」 | 混在している事実を全て記録する。どれが主要かはユーザーに確認する |
| 「ユーザー合意を得る前に doc-index.md を更新しよう」 | ユーザー合意 → doc-index-maintenance (aide-powers skill) → git-commit-workflow (aide-powers skill) の順序を厳守する |
| 「dev-environment.md の作成を確認せずに次のフェーズに進もう」 | サブエージェント完了後に必ず Read で成果物の存在を検証する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「設定ファイルを見れば全部わかる」 | 設定ファイルだけでは実行コマンドやOS別パスは確定しない。ユーザー確認が必要 |
| 「前フェーズで十分な情報がある」 | program-structure.md はファイル構成のみ。開発環境の詳細（バージョン、依存管理方式）は別途抽出が必要 |
| 「一般的な構成だから推測で書ける」 | 推測は明示し、ユーザーに確認する。Core principle に従う |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- `fs-reverse-phase3-system-req (aide-powers skill)` — フェーズ2完了後、システム要件逆引きフェーズに遷移する

**呼び出す共通スキル:**
- `doc-index-maintenance (aide-powers skill)` — フェーズ完了後、dev-environment.md を doc-index.md に登録
- `git-commit-workflow (aide-powers skill)` — doc-index-maintenance (aide-powers skill) 完了後、成果物をコミット

**Called by:**
- `fs-reverse-phase1-program (aide-powers skill)` — REQUIRED SUB-SKILL として呼び出される

**呼び出さない共通スキル:**
- `design-gate (aide-powers skill)` — 設計逆引きワークフローは設計書を生成する側であり、設計書の存在確認は不要
- `design-sync (aide-powers skill)` — 逆引きは「現実の記録」であり、実装と設計書の同期は不要
- `multi-stage-code-review (aide-powers skill)` — コード変更を行わないため不要
- `usecase-analysis (aide-powers skill)` — ユースケース分析は設計ワークフローの担当
- `doc-sync (aide-powers skill)` — 逆引きは新規生成であり、既存設計書との同期は不要
- `pending-issues-management (aide-powers skill)` — フェーズ2単体では pending-issues の操作は不要
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `project_root` — プロジェクトルートパス

**Global rules:** `.aide/references/global-rules.md` を厳守
