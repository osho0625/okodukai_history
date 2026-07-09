---
name: fs-design-phase2-system-req
description: "Use when user requirements are confirmed and system requirements need to be defined. Collects technical constraints, tools, platform limitations and creates system-requirements.md and dev-environment.md."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# システム要件定義（設計ワークフロー フェーズ2）

## Overview

**Core principle:** ユーザーにヒアリングしてから決定する。AIが勝手にシステム要件を決めない。

システム要件定義フェーズは、ユーザー要件（user-requirements.md）のMust要件すべてに対応するシステム要件を定義する。開発環境の制約、利用可能なツール・ライブラリ、プラットフォームの制限事項を収集し、システム要件として整理する。開発環境情報は別ファイル（dev-environment.md）として作成し、コンテキスト汚染を防止する。

**Announce at start:** 「fs-design-phase2-system-req スキルを使用して、システム要件定義を行います。」

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| system-requirements.md | `.aide/specs/{feature_name}/system-requirements.md` | システム要件定義書 |
| dev-environment.md | `.aide/specs/{feature_name}/dev-environment.md` | 開発環境定義書 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase2-system-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase2-system-req`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 共通スキル呼び出し
- Skill で `system-requirements-definition (aide-powers skill)` を呼び出す（新規作成モード）
- システム要件定義の標準プロセスを適用
- 以下の Step 2〜3 はこの共通スキル内で実行される

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase2-system-req`, step_id: `step1`, step_title: `共通スキル呼び出し`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: サブエージェント起動（mode: phase2）
- system-requirements-architect-prompt.md テンプレートを使用して Task でサブエージェントをディスパッチする

委譲する情報:

| パラメータ | 値 |
|---|---|
| feature_name | スペックディレクトリ名 |
| specs_dir | `.aide/specs/{feature_name}` |
| mode | phase2 |
| 前フェーズ成果物 | user-requirements.md のパス |
| 引き継ぎ | 企画オーケストレーターからの引き継ぎ（tech-investigation/ が存在する場合） |

サブエージェントが実行する処理:
- user-requirements.md を Read で読み込み、Must要件を把握
- ユーザーにヒアリング（質問は1つずつ、10項目）
  1. アプリケーション形態
  2. プログラミング言語・フレームワーク
  3. 対象OS・プラットフォーム
  4. データの保存形式
  5. 開発環境（言語バージョン、仮想環境利用有無）
  6. 外部サービスへの依存（ネットワーク経由のAPI・クラウドサービス）
  7. 外部パッケージの利用（pip等でインストールするライブラリ）
     ※ 外部サービスとは別に確認すること
  8. パフォーマンス・セキュリティの要求レベル
  9. 利用可能なツール・ライブラリ・サービス
  10. 開発環境の制限事項
- 実現手段の検討（選定理由を明記）
- 制限事項・セキュリティ要件・非機能要件の整理
- ログ出力方針の定義（必須記載ルール6項目厳守）
- 開発環境の標準化（仮想環境利用有無をユーザーに確認）
- system-requirements.md の作成（Write）
- dev-environment.md の作成（Write、別ファイルとして必ず作成）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase2-system-req`, step_id: `step2`, step_title: `サブエージェント起動（mode: phase2）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: ユーザー承認
- system-requirements.md と dev-environment.md をユーザーに提示し、合意を得る
- 修正点があれば修正 → 合意を得る

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase2-system-req`, step_id: `step3`, step_title: `ユーザー承認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
   - system-requirements.md, dev-environment.md を doc-index.md に登録
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
   - コミット対象: system-requirements.md, dev-environment.md
   - コミットメッセージプレフィックス: docs:
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase3-dev-plan (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase2-system-req`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### fix モードのフロー

QAゲートでREJECTEDとなった場合に実行する。

**Step 1:** サブエージェント起動（mode: fix）
- system-requirements-architect-prompt.md テンプレートを使用して Task でサブエージェントを fix モードでディスパッチする

委譲する情報:

| パラメータ | 値 |
|---|---|
| feature_name | スペックディレクトリ名 |
| specs_dir | スペックディレクトリパス |
| mode | fix |
| qa_feedback | QA指摘内容 |

サブエージェントが実行する処理:
- QA指摘内容を確認
- system-requirements.md / dev-environment.md を Read で読み込み
- 指摘箇所を Edit で修正
- 修正内容をユーザーに報告

**Step 2:** ユーザー合意
- 修正内容をユーザーに提示し、合意を得る

**Step 3:** 完了処理
- REQUIRED SUB-SKILL: git-commit-workflow (aide-powers skill)

### 完了条件

以下の全てを満たすこと:

| # | 条件 | 確認方法 |
|---|---|---|
| 1 | 成果物の存在 | `.aide/specs/{feature_name}/system-requirements.md` が作成されている |
| 2 | dev-environment.md の存在 | `.aide/specs/{feature_name}/dev-environment.md` が別ファイルとして作成されている |
| 3 | Must要件への対応 | user-requirements.md のMust要件すべてに対応するシステム要件が定義されている |
| 4 | ログ出力方針 | ログ出力方針の6項目すべてが具体的に記載されている |
| 5 | ユーザー合意 | ユーザーが技術的な方針に合意している |
| 6 | doc-index 更新 | doc-index-maintenance が完了している |
| 7 | git コミット | git-commit-workflow が完了している |
| 8 | 進捗ファイル更新 | 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている |
| 9 | 完了日時記録 | 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている |
| 10 | 成果物記録 | 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている |
| 11 | 整合性確認 | ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「個人利用だからログ方針は簡易でよい」 | ログ出力方針の必須記載ルールに違反。個人利用でも6項目すべてを具体的に記載する |
| 「printで十分だからloggingは不要」 | 言語標準のログライブラリを使用すること。print によるログ出力は禁止 |
| 「外部サービスへの依存なし = 外部パッケージも使わない」 | 外部パッケージと外部サービスは別概念。それぞれ個別にユーザーに確認する |
| 「ユーザーが技術に詳しいからヒアリングは省略」 | ヒアリングは必須。AIが勝手にシステム要件を決めない |
| 「dev-environment.md は system-requirements.md に含めれば十分」 | 別ファイルとして必ず作成する。コンテキスト汚染の防止のため |
| 「Must要件の一部はシステム要件で対応不要」 | Must要件すべてに対応するシステム要件を定義する義務がある |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「標準的なログ出力で十分」 | 曖昧な記述は禁止。具体的なライブラリ名、レベル定義、出力先を明記する |
| 「オーバーエンジニアリングになる」 | 要件に見合った技術選定を行うが、ログ方針等の必須項目は省略できない |
| 「ユーザーが決めてくれるから質問は不要」 | ヒアリングは必須プロセス。質問を通じて要件を明確化する |
| 「前のプロジェクトと同じ構成でよい」 | プロジェクトごとに要件は異なる。必ずヒアリングして確認する |
| 「小さなプロジェクトだからシステム要件は不要」 | プロジェクトの規模に関わらず、技術スタックとエラーハンドリング方針は定義する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- `fs-design-phase3-dev-plan (aide-powers skill)` — ユーザー合意 + git-commit-workflow 完了後、開発計画書フェーズに進む

**Called by:**
- `fs-design-phase1-user-req (aide-powers skill)`（REQUIRED SUB-SKILL として呼び出される）

**Common skills used:**
- `system-requirements-definition (aide-powers skill)`（新規作成モード）— システム要件定義の標準プロセスを提供
- `doc-index-maintenance (aide-powers skill)` — 成果物（system-requirements.md, dev-environment.md）の登録
- `git-commit-workflow (aide-powers skill)` — フェーズ完了時のコミット
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `tech-investigation (aide-powers skill)` — 技術調査が必要な場合に利用可能（1%ルール自動発動）
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `mode` — phase2（通常）/ fix（QA指摘修正）
- `qa_feedback` — QA指摘内容（fix モードの場合）

**Global rules:** `.aide/references/global-rules.md` を厳守
