---
name: fs-design-phase3-dev-plan
description: "Use when Phase 2 (system requirements) is complete and user has agreed. Verify requirements consistency and create development plan."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 実現性検討・開発計画書（fs-design-phase3-dev-plan）

## Overview

**Core principle:** 要件の整合性なしに、開発計画を立てるな。

ユーザー要件とシステム要件の整合性を検証し、矛盾や過不足がない状態で開発計画書を作成する。3つの成果物（ユーザー要件・システム要件・開発計画書）の整合性を常に保つ。完了後にゲート1（要件定義レビュー）を通過し、フェーズ1〜3の品質を保証する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| development-plan.md | `.aide/specs/{feature_name}/development-plan.md` | 開発計画書（整合性検証済み） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase3-dev-plan
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Never:**
- フェーズ1（ユーザー要件定義）が未完了の場合
- フェーズ2（システム要件定義）が未完了の場合

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 前フェーズ成果物の読み込み
- Read で以下を読み込む:
  - `.aide/specs/{feature_name}/user-requirements.md`
  - `.aide/specs/{feature_name}/system-requirements.md`

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `step1`, step_title: `前フェーズ成果物の読み込み`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: development-planner サブエージェントの呼び出し（phase3 モード）
- `./development-planner-prompt.md` を Read で読み込み、テンプレート変数を埋めて Task でサブエージェントをディスパッチする
- サブエージェントに渡す情報:
  - feature_name
  - 実行モード: phase3
- サブエージェントの処理:
  - (a) 整合性チェック（要件網羅性、矛盾検出、過不足確認）
  - (b) 問題がある場合 → ユーザーに報告し修正案を提示 → 該当フェーズスキルを fix モードで呼び出し修正 → 修正後、再度整合性チェック
  - (c) 開発計画書（development-plan.md）の作成
  - (d) ユーザーへの説明と合意取得
  - (e) 完全合意を得た時点で「要求分析完了」と明示
- サブエージェントのステータス判定:
  - DONE → Step後処理を実行し、Step 3 へ
  - DONE_WITH_CONCERNS → 懸念事項を確認し、必要に応じて対処してから Step 3 へ
  - NEEDS_CONTEXT → 不足情報を提供して再派遣
  - BLOCKED → 段階的対応（コンテキスト追加 → タスク分割 → ユーザーエスカレーション）

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `step2`, step_title: `development-planner サブエージェントの呼び出し（phase3 モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: QAレビュー（ゲート1: 要件定義レビュー）
- **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill)
  - requirements-qa-agent (aide-powers agent) を呼び出す
  - レビュー対象: user-requirements.md, system-requirements.md, development-plan.md, dev-environment.md
  - 8つの検証項目を全て実行（下記参照）
- APPROVED の場合 → Step後処理を実行し、Step 4 へ
- REJECTED の場合 → Step 3r（修正ループ）へ

  **Step 3r:** 修正ループ（REJECTED 時）
  1. 修正指示の内容を分析し、修正対象を特定する
  2. 該当するフェーズスキル/サブエージェントを fix モードで呼び出す
     - user-requirements.md の問題 → **REQUIRED SUB-SKILL:** Use fs-design-phase1-user-req (aide-powers skill) (fix)
     - system-requirements.md / dev-environment.md の問題 → **REQUIRED SUB-SKILL:** Use fs-design-phase2-system-req (aide-powers skill) (fix)
     - development-plan.md の問題 → development-planner サブエージェント（fix モード）
  3. 修正完了後、ユーザー合意を得る
  4. **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill)
  5. **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill) → requirements-qa-agent (aide-powers agent) に再QAレビューを依頼
     - APPROVED → Step 4 へ
     - REJECTED → 修正ループを繰り返す

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `step3`, step_title: `QAレビュー（ゲート1: 要件定義レビュー）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: QA APPROVED 後の処理
- QAレビュー結果をユーザーに共有する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `step4`, step_title: `QA APPROVED 後の処理`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase4-architecture (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase3-dev-plan`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### QAレビュー検証項目（ゲート1: 要件定義レビュー）

| # | 検証項目 | 内容 |
|---|---|---|
| 1-1 | 要件の網羅性 | Must項目とシステム要件の1対1突き合わせ |
| 1-2 | 矛盾の検出 | 同一概念に対する異なる制約がないか |
| 1-3 | EARS構文の準拠 | 要件文がEARS構文で構造化されているか |
| 1-4 | MoSCoW分類の妥当性 | 優先度分類が適切か |
| 1-5 | エラーハンドリング方針 | エラー分類・伝播ルール・ログ方針の全定義確認 |
| 1-6 | 開発環境定義 | dev-environment.md の存在、venvパス・Pythonバージョン・テスト実行コマンド |
| 1-7 | ユーザー要件作成ルール準拠 | 目的と手段の分離、必須手段の要件記載、抽象表現での記載、否定された手段が残っていないか |
| 1-8 | 開発計画書の整合性 | 成果物定義・フェーズ分割・リスク項目の妥当性 |

### 修正担当の振り分けルール

| 修正対象 | 呼び出すフェーズスキル |
|---|---|
| user-requirements.md の問題（要件網羅性、EARS構文、MoSCoW、目的と手段の分離等） | fs-design-phase1-user-req (aide-powers skill: fix) |
| system-requirements.md / dev-environment.md の問題（エラーハンドリング方針、開発環境定義等） | fs-design-phase2-system-req (aide-powers skill: fix) |
| development-plan.md の問題（整合性、リスク項目等） | development-planner サブエージェント（fix モード） |

### 再QA省略の絶対禁止ルール

REJECTED を受けて修正を行った場合、**必ず** design-qa-dispatch (aide-powers skill) 経由で再QAレビューを実施すること。以下の理由による再QA省略は一切認めない:

- 「修正内容がシンプルだから再QAは不要」→ 禁止
- 「前回のQAで他の項目はPASSだったから、修正箇所だけ確認すればよい」→ 禁止
- 「ユーザーが合意したから再QAは不要」→ 禁止
- 「時間がないから再QAをスキップする」→ 禁止

### 完了条件

以下の全てを満たした場合にフェーズ3を完了とする:

1. development-plan.md が作成されていること
2. ユーザーの合意を得ていること（「要求分析完了」が明示されていること）
3. doc-index-maintenance (aide-powers skill) で doc-index.md が更新されていること
4. git-commit-workflow (aide-powers skill) でコミットが完了していること
5. design-qa-dispatch (aide-powers skill) 経由の requirements-qa-agent (aide-powers agent) によるQAレビューで APPROVED を得ていること
6. REJECTED → fix → 再QA のループが完了していること（REJECTED があった場合）
7. 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
8. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
9. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
10. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

## ユーザーとの対話ポイント

| # | 対話ポイント | タイミング | 内容 |
|---|---|---|---|
| 1 | 整合性チェック結果の報告 | Step 2(a)完了後 | 矛盾・過不足がある場合、問題の内容と影響を説明し、修正方針を確認する |
| 2 | 開発計画書の説明と合意 | Step 2(c)完了後 | 開発計画書の内容をわかりやすく説明し、合意を得る。技術的な内容は噛み砕いて伝える |
| 3 | 「要求分析完了」の明示 | Step 2(e)完了後 | ユーザーから完全合意を得た時点で「要求分析完了」と明示する |
| 4 | QAレビュー結果の共有 | Step 3完了後 | APPROVED/REJECTED の結果をユーザーに共有する。REJECTED の場合は修正内容を説明する |
| 5 | 修正後の再合意 | Step 3r(3) | fix モードでの修正結果をユーザーに提示し、再合意を得る |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。

| Red Flag | なぜ危険か |
|---|---|
| 「整合性チェックは形式的だから省略してよい」 | 整合性チェックは開発計画の基盤。矛盾を見逃すと後工程で大きな手戻りが発生する |
| 「ユーザーが急いでいるからQAレビューをスキップする」 | QAレビューはフェーズ1〜3の品質保証。スキップすると設計フェーズ全体の品質が保証できない |
| 「修正がシンプルだから再QAは不要」 | 修正の複雑さに関わらず、再QAは必須。修正が他の検証項目に影響する可能性がある |
| 「AIが判断して開発計画を決めればよい」 | 開発計画はユーザーとの合意が必須。AIが勝手に計画を決めてはならない |
| 「前フェーズの成果物に問題があるが、開発計画書で吸収できる」 | 前フェーズの問題は前フェーズで修正する。開発計画書で問題を隠蔽してはならない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「要件は明確だから整合性チェックは不要」 | 明確に見えても矛盾が潜んでいることがある。機械的にチェックすることで見落としを防ぐ |
| 「開発計画書は後で修正できるから仮で進める」 | 開発計画書はフェーズ1〜3の集大成。仮の状態でQAゲートを通過することはできない |
| 「QAで指摘されたのは軽微な問題だから修正だけで再QAは不要」 | 軽微に見える問題でも、修正が他の検証項目に波及する可能性がある。再QAは必須 |
| 「ユーザーが合意したから品質は十分」 | ユーザー合意とQA品質は別の観点。ユーザーは技術的な品質基準を判断できない場合がある |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前フェーズからの遷移:**
- `fs-design-phase2-system-req (aide-powers skill)` → **REQUIRED SUB-SKILL:** `fs-design-phase3-dev-plan`

**次フェーズへの遷移（QA APPROVED 後）:**
- **REQUIRED SUB-SKILL:** Use fs-design-phase4-architecture (aide-powers skill)

**Called by:**
- 設計ワークフロー（fs-design-phase2-system-req (aide-powers skill) 完了後に遷移）

**Related skills:**
- `doc-index-maintenance (aide-powers skill)` — development-plan.md 作成後の doc-index.md 更新
- `git-commit-workflow (aide-powers skill)` — フェーズ完了時、QA APPROVED 後のコミット
- `design-qa-dispatch (aide-powers skill)` — ゲート1（要件定義レビュー）の実行
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `tech-investigation (aide-powers skill)` — 技術的な実現性に疑問がある場合（1%ルール自動発動）
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること
- `fs-design-phase1-user-req (aide-powers skill)` — REJECTED 時の user-requirements.md 修正（fix モード）
- `fs-design-phase2-system-req (aide-powers skill)` — REJECTED 時の system-requirements.md 修正（fix モード）

**Input from caller:**
- feature_name（プロジェクト名）
- fs-design-phase2-system-req (aide-powers skill) の完了ステータス

**Global rules:** `.aide/references/global-rules.md` を厳守
