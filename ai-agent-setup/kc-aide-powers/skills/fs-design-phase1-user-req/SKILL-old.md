---
name: fs-design-phase1-user-req
description: "Use when starting the design workflow to define user requirements, or when QA gate 1 rejects and user-requirements.md needs revision."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# ユーザー要件定義（設計ワークフロー フェーズ1）

## Overview

設計ワークフローの先頭フェーズスキル。企画ワークフローからの引き継ぎ確認を行った後、ユーザーからの情報収集を通じて要件を整理する。要望を「目的」と「手段」に分離し、手段については代替案を提示して必須か一例かを確認する。要件をMoSCoW分類し、EARS構文で構造化する。

**Core principle:** ユーザーの要望を「目的」と「手段」に分離し、目的を要件として整理せよ。AIが勝手に要件を決めるな。必ずヒアリングしてから決定しろ。

## The Iron Law

### 設計ワークフロー固有 Iron Law

```
1. NO REQUIREMENT WITHOUT HEARING.
   ユーザーへのヒアリングなしに、要件を決定してはならない。
   成果物を作る前に必ずヒアリングする。

2. NO MEANS WITHOUT SEPARATION.
   ユーザーの要望を「目的」と「手段」に分離せずに、要件として記載してはならない。
   手段については代替案を提示し、必須か一例かを確認する。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| user-requirements.md | `.aide/specs/{feature_name}/user-requirements.md` | ユーザー要件定義書（MoSCoW分類・EARS構文） |
| user-hints.md | `.aide/specs/{feature_name}/tech-references/user-hints.md` | 一例として分離した手段の記録 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase1-user-req
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
   - 入力:
     - progress_file_path: `.aide/specs/{feature_name}/design-progress.md`
     - workflow_name: `design`
   - 戻り値に基づく分岐:
     - `RESUME_FROM N` → 進捗ファイルは既存。N が本フェーズなら Step 1 から再開、N が後続フェーズなら該当フェーズスキルへ遷移
     - `START_FRESH` → 進捗ファイルが存在しない。`.aide/references/progress-file-format.md` §6.1 および §7.2 の初期状態テンプレートに従い、進捗ファイルを新規作成する。その後 Step 1 へ
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase1-user-req`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 開始前チェック — 企画ワークフローからの引き継ぎ確認
- handover-notes.md が存在する場合:
  1. Read で handover-notes.md を読み込む
  2. Read で planning-proposal.md を読み込む
  3. 引き継ぎ内容をユーザーに簡潔に共有する
  4. 特に注意すべき点、未解決の課題を把握する
  5. Step 2 へ進む
- handover-notes.md が存在しない場合:
  - Step 2 へ進む（通常通り開始）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase1-user-req`, step_id: `step1`, step_title: `開始前チェック — 企画ワークフローからの引き継ぎ確認`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: フェーズ1メイン処理 — サブエージェントディスパッチ
- Task で user-requirements-architect-prompt.md に基づきサブエージェントをディスパッチする
  - phase1 モード: 通常のユーザー要件定義
  - fix モード: QA指摘修正
- サブエージェントが以下を実行する:
  1. ユーザーから情報を収集する（質問は1つずつ）
  2. 収集した情報を「目的」と「手段」に分離する
  3. 手段について必須か一例かをユーザーに確認する（代替案を提示）
  4. 要件をMoSCoW（Must/Should/Could/Won't）で分類する
  5. EARS構文で要件文を構造化する
  6. 手段・ロジック・パラメータを抽象表現で記載する
  7. 一例として分離した手段を tech-references/user-hints.md に記載する
  8. `.aide/specs/{feature_name}/user-requirements.md` に成果物を作成する
  9. ユーザーに提示し合意を得る

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase1-user-req`, step_id: `step2`, step_title: `フェーズ1メイン処理 — サブエージェントディスパッチ`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: ユーザー承認
- 合意あり → Step後処理を実行し、後処理へ
- 合意なし → サブエージェントに修正を指示し、Step 2 に戻る

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase1-user-req`, step_id: `step3`, step_title: `ユーザー承認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase2-system-req (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase1-user-req`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

- ユーザーが `user-requirements.md` の内容に合意していること
- `tech-references/user-hints.md` が作成されていること（一例として分離した手段がある場合）
- doc-index-maintenance (aide-powers skill) が完了していること
- git-commit-workflow (aide-powers skill) が完了していること
- 進捗ファイル（design-progress.md）が `progress-resume-check (aide-powers skill)` の戻り値に応じて適切に取り扱われている
  - START_FRESH の場合: progress-file-format.md §6.1 / §7.2 に従って新規作成済み
  - RESUME_FROM N / ALL_COMPLETED の場合: 既存進捗ファイルを上書きせず、戻り値に応じた分岐処理が実行済み

### ユーザーとの対話ポイント

| # | 対話ポイント | タイミング | 内容 |
|---|---|---|---|
| 1 | 引き継ぎ内容の共有 | 開始前チェック完了後 | 「企画段階でこのような情報がまとまっています」と引き継ぎ資料の要約を共有する |
| 2 | ヒアリング | フェーズ1メイン処理 | 何を実現したいか、なぜ必要か、誰が使うか等を1つずつ質問する |
| 3 | 目的と手段の分離確認 | ヒアリング中 | 「こういった方法もありますが、別の手段でも構いませんか？」と代替案を提示して確認する |
| 4 | 要件の合意 | 成果物作成後 | user-requirements.md の内容に過不足がないか確認し、合意を得る |

### 共通スキル呼び出しタイミング

| 共通スキル | 呼び出しタイミング | 用途 |
|---|---|---|
| `doc-index-maintenance (aide-powers skill)` | 後処理 | user-requirements.md, user-hints.md を doc-index.md に登録する |
| `git-commit-workflow (aide-powers skill)` | 後処理 | 成果物（user-requirements.md, user-hints.md）のgitコミット |
| `pending-issues-management (aide-powers skill)` | 問題発見時に随時 | 設計上の懸念事項や未解決の課題を記録する |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。フェーズ1のルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「ユーザーの要望をそのまま要件として書こう」 | 目的と手段の分離をせずに記載すると、不要な制約が要件に混入する |
| 「この手段は明らかに必須だから確認不要」 | ユーザーは素人の可能性がある。思い込みで「必須」と言っている場合もある。必ず代替案を提示して確認する |
| 「技術的な内容だからフェーズ2に回そう」 | 技術的な内容でも目的/手段の分離で判断する。目的であれば要件になるし、必須手段であればそれも要件になる |
| 「ヒアリングは面倒だから企画書の内容をそのまま使おう」 | 企画書は一次資料であり、そのまま要件にはならない。ヒアリング済みの情報を再度聞く必要はないが、要件としての整理は必要 |
| 「要件が少ないからMoSCoW分類は不要」 | 要件の数に関わらず、MoSCoW分類は必須。優先度の明確化は後続フェーズの判断基準になる |
| 「EARS構文は形式的すぎるから省略しよう」 | EARS構文は要件の曖昧さを排除するための手法。省略すると後続フェーズで解釈の揺れが生じる |
| 「開始前チェックは省略してフェーズ1から始めよう」 | 引き継ぎ資料がある場合、それを活用しないとヒアリング済みの情報を再度聞くことになる |
| 「このフェーズは簡単だからスキップしよう」 | Iron Law 違反。いかなる理由もフェーズ省略の根拠にならない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ユーザーが技術者だから目的と手段の分離は不要」 | 技術者でも目的と手段を混同することがある。分離プロセスは全ユーザーに適用する |
| 「企画書に全て書いてあるからヒアリングは不要」 | 企画書は一次資料。設計フェーズでの要件整理（MoSCoW分類、EARS構文）は別の作業 |
| 「要件が明確だからEARS構文は形式的すぎる」 | EARS構文はQAゲート1の検証項目。準拠していないとREJECTEDになる |
| 「Won't（対象外）は書かなくてよい」 | スコープ外の要件を明示的に記録することで、後続フェーズでの誤解を防ぐ |
| 「手段の代替案を提示するのは時間の無駄」 | 代替案の提示は、本当に必須かどうかを見極めるための重要なプロセス。省略すると不要な制約が要件に混入する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- 設計ワークフロー（先頭フェーズとして呼び出される）
- QAゲート1（REJECTED時にfixモードで再呼び出し）

**Completion:**
1. ユーザー合意を確認する
2. **REQUIRED SUB-SKILL:** Use doc-index-maintenance (aide-powers skill)
3. **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill)
4. **REQUIRED SUB-SKILL:** Use fs-design-phase2-system-req (aide-powers skill)

**Related skills:**
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること
- `pending-issues-management (aide-powers skill)` — 設計上の懸念事項や未解決の課題の記録
- `design-qa-dispatch (aide-powers skill)` — QAゲート1でのレビュー（本フェーズの成果物を検証する）

**Global rules:** `.aide/references/global-rules.md` を厳守
