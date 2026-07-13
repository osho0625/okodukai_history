---
name: fs-impl-phase2-preparation
description: "Use when starting the implementation workflow after the design gate has passed, before writing any implementation code."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# fs-impl-phase2-preparation（実装準備）

## Overview

実装ワークフローの2番目のフェーズスキル（fs-impl-phase1-gate (aide-powers skill) の次）。開発環境の確認・構築、設計書からの依存関係解析に基づくタスクリスト生成、動作確認試験書の空テンプレート作成までを1つのフェーズとして実行する。

**Core principle:** 実装に着手する前に、開発環境・タスクリスト・試験書テンプレートの3つを確実に準備せよ。準備が完了するまでコードの実装には進まない。

タスク分解には共通スキル `impl-task-planning (aide-powers skill)` を使用し、変更・バグ修正・リファクタリングワークフローと統一されたルールでタスクを分解する。

## The Iron Law

```
NO IMPLEMENTATION BEFORE PREPARATION.
環境構築が完了し、タスクリストが生成され、ユーザーが確認し、
試験書テンプレートが作成されるまで、コードの実装に着手してはならない。
```

ワークフロー共通の Iron Law は先頭フェーズスキル `fs-impl-phase1-gate/SKILL.md` に配置されている。本スキルはフェーズ固有の Iron Law のみを定義する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| impl-task-list.md | .aide/specs/{feature_name}/impl-task-list.md | 依存関係解析に基づく実装タスクリスト |
| manual-test-plan.md | .aide/specs/{feature_name}/testing/manual-test-plan.md | 動作確認試験書の空テンプレート |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-impl-phase2-preparation
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Skip conditions:**
- `impl-progress.md` が存在し、このフェーズが完了済みの場合 → 次のフェーズスキル（fs-impl-phase3-gui-mockup (aide-powers skill)）に遷移

**前提:** fs-impl-phase1-gate (aide-powers skill) が PASS → fs-impl-phase2-preparation に遷移

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
   - 入力:
     - progress_file_path: .aide/specs/{feature_name}/impl-progress.md
     - workflow_name: impl
   - 戻り値に基づく分岐:
     - RESUME_FROM N → 進捗ファイルは既存。N が本フェーズなら Step 1 から再開、N が後続フェーズなら該当フェーズスキルへ遷移
     - START_FRESH → 進捗ファイルが存在しない。Step 1 へ進む
     - ALL_COMPLETED → 全フェーズ完了済み。ユーザーに案内し終了
3. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 開発環境の確認
1. doc-index.md を Read し、dev-environment.md のパスを取得する
2. dev-environment.md を Read する
3. 記載された環境要件を把握する:
   - 対象OS
   - Pythonバージョン
   - 仮想環境（venv）の設定
   - 依存管理方針（requirements.txt / pyproject.toml 等）
   - テストフレームワーク
   - テスト実行コマンド
   - コミットメッセージ言語
   - その他の環境固有設定

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `step1`, step_title: `開発環境の確認`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 開発環境の構築
- Task でサブエージェントに委譲して以下を実行する:
  1. venv の存在確認
     - 存在する → パッケージの整合性を確認
     - 存在しない → venv を作成
  2. venv を有効化
     - Windows: .venv/Scripts/Activate.ps1
     - WSL/Linux: source .venv/bin/activate
  3. 依存パッケージのインストール
     - requirements.txt が存在する場合: pip install -r requirements.txt
     - pyproject.toml が存在する場合: pip install -e .
     - dev-environment.md に記載された追加パッケージがある場合: 個別インストール
  4. インストール結果の確認
     - pip list で確認
     - 問題がある場合はユーザーに報告（対話ポイント D1）
- ※ 環境構築で問題が発生した場合:
  - → ユーザーに問題を報告し、対処方法を確認する
  - → ユーザーの指示に従って対処する
  - → 解決するまで次のステップに進まない

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `step2`, step_title: `開発環境の構築`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: タスクリスト生成
1. Skill で共通スキル `impl-task-planning (aide-powers skill)` を呼び出す → タスク分解のルール・手順を適用
2. Task でサブエージェントに委譲する（impl-planner-prompt.md を使用）
   - 以下の設計書を渡す:
     - object-design-*.md（全クラスの依存関係）
     - program-structure.md（ファイル配置・importルール）
     - layered-architecture.md（レイヤー間依存ルール）
     - infra-interface-design.md（外部サービス連携）
   - impl-planner が以下を実行:
     - a. 全クラス/モジュールの依存関係を抽出
     - b. ユースケース単位でグループ化
     - c. 各グループ内で依存レベルを算出（Lv1〜Lv4）
     - d. 同一レベル内の並列実行可能性を判定
     - e. タスクリストを生成（フェーズ0: 共通基盤 → フェーズ1〜N: ユースケース別）
     - f. 設計書との網羅性チェック（漏れゼロになるまでループ）
- fs-impl-phase2-preparation 固有の追加ルール（impl-task-planning (aide-powers skill) 共通ルールに加えて適用）:
  - ユースケース単位グループ化: 共通基盤（フェーズ0）+ ユースケース別（フェーズ1〜N）の構成
  - 依存レベル算出: Lv1〜Lv4 の4段階レベル
  - 並列実行可能性判定: `[並列可]` / `[逐次]` マーカーの付与
  - ユーザー試験マイルストーン: 各フェーズ末尾に配置
  - GUI/CLI実装のタイミング: 各ユースケースフェーズの最後に対応するGUI/CLIコンポーネントを実装
3. 生成された impl-task-list.md を Read して確認する
4. impl-task-planning (aide-powers skill) の「工程チェック表の生成（必須）」に従い、`impl-process-checklist.md` を生成する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `step3`, step_title: `タスクリスト生成`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: タスクリストのユーザー確認
- 生成されたタスクリストをユーザーに提示する
- → 「この実装順序で進めてよいですか？」と確認
- → ユーザーの合意を得る
- → フィードバックがあれば修正対応する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `step4`, step_title: `タスクリストのユーザー確認`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: 動作確認試験書の空テンプレート作成
- Task でサブエージェントに委譲して以下のテンプレートで作成する:
- → .aide/specs/{feature_name}/testing/manual-test-plan.md
- テンプレート内容:
  ```markdown
  # 動作確認試験書
  
  ## 試験概要
  - プロジェクト: {feature_name}
  - 作成日: {YYYY-MM-DD}
  - 最終更新: {YYYY-MM-DD}
  
  ## 試験項目
  
  | # | 試験ID | 追加タスク | 操作手順 | 期待結果 | 結果 | 備考 |
  |---|---|---|---|---|---|---|
  | （マイクロエージェントが逐次追記） |
  
  ## 試験結果サマリ
  - 総項目数: 0
  - PASS: 0
  - FAIL: 0
  - 未実施: 0
  - 別項目で確認済み: 0
  ```

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `step5`, step_title: `動作確認試験書の空テンプレート作成`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（環境構築で requirements.txt 等のファイルが変更された場合。推奨プレフィックス: chore:）
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase3-gui-mockup (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase2-preparation`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下のすべてを満たすこと:

1. **環境構築完了**: dev-environment.md に記載された環境要件に従い、venv が作成され、依存パッケージがインストールされていること
2. **タスクリスト生成完了**: `.aide/specs/{feature_name}/impl-task-list.md` が生成されていること
3. **網羅性チェック完了**: タスクリストの網羅性チェックで漏れゼロが確認されていること
4. **ユーザー確認完了**: ユーザーがタスクリストの実装順序を確認していること
5. **試験書テンプレート作成完了**: `.aide/specs/{feature_name}/testing/manual-test-plan.md` が作成されていること
- 進捗ファイル（impl-progress.md）が `progress-resume-check (aide-powers skill)` の戻り値に応じて適切に取り扱われている
  - START_FRESH の場合: phase-compliance-check (aide-powers skill: write) により新規作成済み
  - RESUME_FROM N / ALL_COMPLETED の場合: 既存進捗ファイルを上書きせず、戻り値に応じた分岐処理が実行済み

### 環境確認プロセスの詳細

#### dev-environment.md から読み取る情報

| 項目 | 説明 | 例 |
|---|---|---|
| 対象OS | 開発対象のOS | Windows 11, WSL (Ubuntu), macOS |
| Pythonバージョン | 使用するPythonのバージョン | Python 3.12 |
| 仮想環境 | venv の設定 | `.venv/` ディレクトリ |
| 依存管理 | パッケージ管理方針 | requirements.txt, pyproject.toml |
| テストフレームワーク | 使用するテストフレームワーク | unittest, pytest |
| テスト実行コマンド | テスト実行時のコマンド | `.venv/Scripts/python -m pytest -v` |
| コミットメッセージ言語 | gitコミットメッセージの言語 | 日本語, 英語 |
| その他 | プロジェクト固有の設定 | 環境変数、外部サービス設定等 |

#### 環境構築の実行手順（OS別）

**Windows の場合:**
```
1. python -m venv .venv
2. .venv/Scripts/Activate.ps1
3. pip install -r requirements.txt（存在する場合）
4. pip list で確認
```

**WSL / Linux の場合:**
```
1. python3 -m venv .venv
2. source .venv/bin/activate
3. pip install -r requirements.txt（存在する場合）
4. pip list で確認
```

#### 環境構築で問題が発生した場合の対処

| 問題 | 対処 |
|---|---|
| Python のバージョンが異なる | ユーザーに正しいバージョンのインストールを案内する |
| venv の作成に失敗 | エラーメッセージを確認し、ユーザーに報告する |
| パッケージのインストールに失敗 | 依存関係の競合を確認し、ユーザーに報告する |
| 外部サービスへの接続に失敗 | dev-environment.md の設定を確認し、ユーザーに報告する |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。fs-impl-phase2-preparation のルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「環境構築は後でいい、先にタスクリストを作ろう」 | 環境構築はタスクリスト生成の前提条件。環境が整っていないと正しいタスクリストが作れない |
| 「dev-environment.md がないが、推測で環境を構築しよう」 | dev-environment.md は必須の入力。存在しない場合は fs-impl-phase1-gate (aide-powers skill) で FAIL になるはず |
| 「タスクリストのユーザー確認は省略しよう」 | ユーザー確認はフェーズ完了条件。省略禁止 |
| 「試験書テンプレートは実装中に作ればいい」 | 試験書テンプレートは実装開始前に作成する。マイクロ実装エージェントが逐次追記する基盤 |
| 「タスクリストを自分で作ろう（impl-planner に委譲しない）」 | タスクリスト生成は impl-planner サブエージェントの責務。ワークフローが直接作成しない |
| 「網羅性チェックで漏れがあるが、後で追加すればいい」 | 漏れゼロになるまでループする。漏れがある状態でユーザーに提示しない |
| 「環境構築でエラーが出たが、無視して進もう」 | 環境構築の問題は実装中に深刻な障害になる。解決するまで次のステップに進まない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「環境は前回のセッションで構築済みだから確認不要」 | 前回のセッションから変更がある可能性がある。毎回 dev-environment.md を確認する |
| 「タスクリストはシンプルだから impl-planner は不要」 | タスクリストの複雑さに関わらず、依存関係グラフ解析・網羅性チェックは impl-planner の責務 |
| 「試験書テンプレートは1ファイルだから直接作れる」 | 成果物の作成はサブエージェントに委譲する（ワークフロー共通 Iron Law） |
| 「ユーザーが急いでいるからタスクリスト確認を省略しよう」 | ユーザー確認はフェーズ完了条件。省略は品質への脅威 |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**次フェーズスキルへの遷移:**

```
REQUIRED SUB-SKILL: fs-impl-phase3-gui-mockup (aide-powers skill)
```

フェーズ完了後、fs-impl-phase3-gui-mockup (aide-powers skill)（GUIモックアップ確認）に遷移する。遷移時に以下の成果物が存在していること:
- `.aide/specs/{feature_name}/impl-task-list.md`
- `.aide/specs/{feature_name}/testing/manual-test-plan.md`（空テンプレート）
- 構築済みの開発環境（venv、パッケージインストール済み）

**ワークフロー共通ルールの参照:**

```
Workflow-wide rules defined in: fs-impl-phase1-gate (aide-powers skill)
（Iron Law、運用ルールは先頭フェーズスキルを参照）
```

**Called by:**
- 実装ワークフロー（fs-impl-phase1-gate (aide-powers skill) PASS 後に遷移）

**Related skills:**
- `impl-task-planning (aide-powers skill)` — タスク分解のルール・手順を提供する共通スキル
- `git-commit-workflow (aide-powers skill)` — 環境構築完了後のgitコミットに使用
- `fs-impl-phase1-gate (aide-powers skill)` — ワークフロー共通 Iron Law の定義元
- `fs-impl-phase3-gui-mockup (aide-powers skill)` — 次フェーズスキル（GUIモックアップ確認）
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
