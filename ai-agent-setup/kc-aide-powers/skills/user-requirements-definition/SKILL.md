---
name: user-requirements-definition
description: "Use when defining or updating user requirements through hearing, reverse-engineering from code, or delta updates."
---

# ユーザー要件定義

## Overview

**Core principle:** ユーザーの要望を「目的」と「手段」に分離し、目的を要件として整理せよ。AIが勝手に要件を決めるな。必ずヒアリングしてから決定しろ。

ユーザー要件の定義・更新を担当する共通スキルである。3つのモード（create / reverse / delta）を持ち、設計ワークフロー・設計逆引きワークフロー・変更ワークフローから呼び出される。全モードに共通する核心は「目的と手段の分離」と「ユーザーへの確認」である。

## The Iron Law

```
NO REQUIREMENT WITHOUT USER HEARING.
ユーザーへのヒアリングなしに、要件を確定してはならない。
```

```
NO MEANS WITHOUT SEPARATION.
目的と手段を分離せずに、ユーザーの要望をそのまま要件として記載してはならない。
```

## Process

### モード判定

呼び出し元から渡された `mode` パラメータに基づき、以下のいずれかのモードで実行する。

### create モード（新規作成）

**Step 1:** user-requirements-architect-prompt.md に基づきサブエージェントを起動
- Task でサブエージェントをディスパッチする
- サブエージェントが以下を実行:
  1. ユーザーから情報を収集する（質問は1つずつ）
  2. 収集した情報を「目的」と「手段」に分離する
  3. 手段について必須か一例かをユーザーに確認する（代替案を提示）
  4. 要件をMoSCoW（Must/Should/Could/Won't）で分類する
  5. EARS構文で要件文を構造化する
  6. 手段・ロジック・パラメータを抽象表現で記載する
  7. 一例として分離した手段を tech-references/user-hints.md に記載する
  8. .aide/specs/{feature_name}/user-requirements.md に成果物を作成する
  9. ユーザーに提示し合意を得る

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### reverse モード（逆引き）

**Step 1:** reverse-user-requirements-prompt.md に基づきサブエージェントを起動
- Task でサブエージェントをディスパッチする
- サブエージェントが以下を実行:
  1. コード解析（4つの情報源から機能を抽出）
     - ユースケース/コマンド
     - テストケース
     - README/ドキュメント
     - エントリポイント
  2. 要件の構造化（ドラフト作成）
  3. ユーザーヒアリング（5つの確認事項を1つずつ）
     - 概要
     - 対象ユーザー
     - 機能一覧
     - 優先順位
     - スコープ外
  4. user-requirements.md の作成（MoSCoW分類 + トレーサビリティ）
  5. ユーザーに提示し合意を得る

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### delta モード（差分更新）

**Step 1:** 既存の user-requirements.md を Read で読み込む

**Step 2:** 変更要求（change-requirements.md）、影響分析（impact-analysis.md）、対応方針（approach.md）を Read で読み込む

**Step 3:** ユーザー要件への影響を特定する
- 追加すべき要件（EARS構文で記述、MoSCoW分類を付与）
- 変更すべき要件（before → after。変更後もEARS構文・MoSCoW分類を維持）
- 削除すべき要件

**Step 4:** 差分設計結果を返す（delta-design.md に統合される）

### fix サブモード（QA指摘修正、create/reverse 共通）

**Step 1:** QA指摘内容を受け取る

**Step 2:** user-requirements-architect-prompt.md に基づきサブエージェントを起動（fix モード）
- サブエージェントが user-requirements.md の該当箇所を修正する

**Step 3:** ユーザーに提示し合意を得る
- 合意あり → 完了
- 合意なし → 修正を再実行

### 完了条件

**create モード:**
- ユーザーが `user-requirements.md` の内容に合意していること
- `tech-references/user-hints.md` が作成されていること（一例として分離した手段がある場合）

**reverse モード:**
- ユーザーが `user-requirements.md` の内容に合意していること
- 各要件に情報源（トレーサビリティ）が記載されていること

**delta モード:**
- 差分設計結果が返されていること（追加・変更・削除の一覧）

**fix サブモード:**
- QA指摘事項が全て対応されていること
- ユーザーが修正内容に合意していること

### ステータス返却方針

本スキルは明示的なステータス（DONE/SKIPPED）を返さない。完了条件の達成をもって呼び出し元フェーズスキルが完了を判断する。

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「ユーザーの要望をそのまま要件として書こう」 | 目的と手段の分離をせずに記載すると、不要な制約が要件に混入する |
| 「この手段は明らかに必須だから確認不要」 | ユーザーは素人の可能性がある。思い込みで「必須」と言っている場合もある。必ず代替案を提示して確認する |
| 「技術的な内容だから排除しよう」 | 技術的な内容でも目的/手段の分離で判断する。目的であれば要件になるし、必須手段であればそれも要件になる |
| 「ヒアリングは面倒だから企画書の内容をそのまま使おう」 | 企画書は一次資料であり、そのまま要件にはならない。要件としての整理（MoSCoW分類、EARS構文）は必要 |
| 「要件が少ないからMoSCoW分類は不要」 | 要件の数に関わらず、MoSCoW分類は必須。優先度の明確化は後続フェーズの判断基準になる |
| 「EARS構文は形式的すぎるから省略しよう」 | EARS構文は要件の曖昧さを排除するための手法。省略すると後続フェーズで解釈の揺れが生じる |
| 「コードから読み取った要件をそのまま確定しよう」（reverse モード） | ユーザーの確認なしに要件を確定してはならない。コードから推測した要件は必ずユーザーに提示して確認・修正を求める |
| 「差分が小さいから既存要件との整合性確認は不要」（delta モード） | 小さな差分でも既存要件との矛盾が生じる可能性がある。必ず既存要件を読み込んでから差分設計する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ユーザーが技術者だから目的と手段の分離は不要」 | 技術者でも目的と手段を混同することがある。分離プロセスは全ユーザーに適用する |
| 「企画書に全て書いてあるからヒアリングは不要」 | 企画書は一次資料。設計フェーズでの要件整理（MoSCoW分類、EARS構文）は別の作業 |
| 「要件が明確だからEARS構文は形式的すぎる」 | EARS構文はQAゲートの検証項目。準拠していないとREJECTEDになる |
| 「Won't（対象外）は書かなくてよい」 | スコープ外の要件を明示的に記録することで、後続フェーズでの誤解を防ぐ |
| 「手段の代替案を提示するのは時間の無駄」 | 代替案の提示は、本当に必須かどうかを見極めるための重要なプロセス |
| 「コードを読めば要件は明らか」（reverse モード） | コードは「何をしているか」を示すが「なぜそうしているか」は示さない。ユーザーヒアリングで補完が必要 |
| 「MoSCoW分類はユーザーに任せればよい」（reverse モード） | コードに実装済みの機能はデフォルトMustとして提示し、ユーザーに変更の余地を与える |

## Integration

**Called by:**
- `fs-design-phase1-user-req` (aide-powers skill)（設計WF: create モード）
- `fs-reverse-phase4-user-req` (aide-powers skill)（設計逆引きWF: reverse モード）
- `fs-change-phase2-impl` (aide-powers skill)（変更WF: delta モード）

**Common skills used internally:**
- なし（このスキル自体が共通スキルであり、内部で他の共通スキルは呼び出さない）

**Related skills:**
- `doc-index-maintenance` (aide-powers skill) — 呼び出し元フェーズスキルが成果物作成後に呼び出す（本スキルの責務外）
- `git-commit-workflow` (aide-powers skill) — 呼び出し元フェーズスキルがフェーズ完了時に呼び出す（本スキルの責務外）

**Input from caller:**
- `mode` — create / reverse / delta / fix
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `user_info` — ユーザーの要望・回答（create モード）
- `planning_proposal_path` — 企画書パス（create モード、オプション）
- `handover_notes_path` — ことづけパス（create モード、オプション）
- `program_structure_path` — program-structure.md のパス（reverse モード）
- `dev_environment_path` — dev-environment.md のパス（reverse モード）
- `system_requirements_path` — system-requirements.md のパス（reverse モード）
- `qa_feedback` — QA指摘内容（fix モード）
- `change_requirements_path` — 変更要求定義書パス（delta モード）
- `impact_analysis_path` — 影響分析パス（delta モード）
- `approach_path` — 対応方針パス（delta モード）
- `existing_user_requirements_path` — 既存 user-requirements.md パス（delta モード）
