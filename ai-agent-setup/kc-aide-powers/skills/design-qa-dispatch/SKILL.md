---
name: design-qa-dispatch
description: "Use when a design artifact needs QA review. Dispatches to the appropriate QA reviewer agent(s) based on the design domain affected by the change."
---

# design-qa-dispatch

## Overview

設計成果物のQAレビューを実行するディスパッチャー。呼び出し元フェーズスキルから受け取った情報（レビュー対象、影響を受ける設計領域）に基づき、対応表に従って必要なQAレビューアーエージェントを特定・呼び出し、レビュー結果を集約して返す。

**Core principle:** 変更の影響範囲に基づいて、必要なQAレビューアーを漏れなく呼び出し、全てのレビューアーが APPROVED を返すまで APPROVED を宣言しない。

## The Iron Law

```
NO QA REVIEWER SHALL EVER BE OMITTED WHEN ITS DOMAIN IS AFFECTED.
影響を受ける設計領域に対応するQAレビューアーの呼び出しを省略してはならない。
```

対応表に基づき、影響を受ける設計領域が特定された場合、対応するQAレビューアーは**必ず**呼び出す。以下の理由による省略は一切認めない:

- 「影響が軽微だからこのレビューアーは不要」→ 禁止
- 「前回のレビューで PASS だったから今回は省略」→ 禁止
- 「コンテキストが大きくなるのでレビューアーを減らす」→ 禁止
- 「差分設計が小さいから delta-design-qa-agent (aide-powers agent) だけで十分」→ 禁止

## Process

**入力:**
- mode: `"design-workflow"` / `"delta-design"`
- affected_domains: 影響を受ける設計領域のリスト（delta-design モードの場合）
- target_reviewer: 呼び出すQAレビューアー名（design-workflow モードの場合）。「設計領域 → QAレビューアー 対応表」に記載されたQAレビューアーのいずれかを指定する:
  - `requirements-qa-agent` — 要件定義レビュー（ゲート1）
  - `architecture-qa-agent` — アーキテクチャレビュー（ゲート2）
  - `object-design-qa-agent` — オブジェクト設計レビュー（ゲート3）
  - `final-design-qa-agent` — 最終設計レビュー（ゲート4）
- review_target_files: レビュー対象ファイルパスのリスト
- prerequisite_files: 前提成果物ファイルパスのリスト
- feature_name: フィーチャー名
- doc_index_path: doc-index.md のパス（QAレビューアーが全設計ドキュメントを参照するために使用）
- review_scope:（オプション）レビュー範囲の限定指示（例: 特定レイヤーのみ、全体整合性のみ）

**Step 1:** モード判定
- mode: `"design-workflow"` → Step 2aへ（設計WFからの呼び出し: 指定されたQAレビューアーを直接呼び出す）
- mode: `"delta-design"` → Step 2bへ（差分設計WFからの呼び出し: 対応表に基づいてQAレビューアーを選択）

**Step 2a:** 設計WFモード: 指定QAレビューアーの呼び出し
- `target_reviewer` で指定されたQAレビューアーエージェントを Task で呼び出す
- → Step 4へ

**Step 2b:** 差分設計モード: QAレビューアーの選択
- `delta-design-qa-agent (aide-powers agent)` を必ず呼び出しリストに追加する（常に呼ぶ）
- `affected_domains` を対応表と照合し、追加で呼び出すQAレビューアーを特定する
- 重複を除去する（同じQAレビューアーが複数回選択された場合は1回のみ呼ぶ）

**Step 3:** QAレビューアーの呼び出し（差分設計モード）
- 選択された全てのQAレビューアーエージェントを Task で呼び出す
- 各QAレビューアーに以下を渡す:
  - レビュー対象ファイル（review_target_files）
  - 前提成果物ファイル（prerequisite_files）
  - feature_name
  - doc_index_path（QAレビューアーが関連設計ドキュメントを自律的に参照するため）
  - review_scope（指定されている場合）

**Step 4:** レビュー結果の集約
- 全QAレビューアーのレビュー結果を集約する
- 総合判定ロジック:
  - 全QAレビューアーが APPROVED → 総合判定: APPROVED
  - 1つでも REJECTED → 総合判定: REJECTED（全QAレビューアーの指摘を統合して返す）
  - WARNING が 1件以上 → 総合判定: REJECTED（WARNING内容を含めて修正指示を返す）

**Step 5:** 結果の返却
- 呼び出し元フェーズスキルに以下を返す:
  - 総合判定: APPROVED / REJECTED
  - 各QAレビューアーの個別結果（判定 + 指摘内容）
  - REJECTED の場合: 修正指示の一覧（どのQAレビューアーが何を指摘したか）

### 設計領域 → QAレビューアー 対応表

| 設計領域（affected_domains の値） | QAレビューアー |
|---|---|
| `user-requirements-definition` | requirements-qa-agent (aide-powers agent) |
| `system-requirements-definition` | requirements-qa-agent (aide-powers agent) |
| `gui-design` | architecture-qa-agent (aide-powers agent) |
| `ddd-modeling` | architecture-qa-agent (aide-powers agent) |
| `object-design` | object-design-qa-agent (aide-powers agent) |
| `infra-interface-design` | final-design-qa-agent (aide-powers agent) |
| `program-structure-design` | final-design-qa-agent (aide-powers agent) |
| 差分設計全体（delta-design モードでは常に） | delta-design-qa-agent (aide-powers agent) |

### ワークフロー別呼び出しパターン

#### 設計WFモード（mode: design-workflow）

| 呼び出し元フェーズスキル | target_reviewer | レビュー対象 |
|---|---|---|
| fs-design-phase3-dev-plan (aide-powers skill) | requirements-qa-agent (aide-powers agent) | user-requirements.md, system-requirements.md, development-plan.md, dev-environment.md |
| fs-design-phase7-ddd (aide-powers skill) | architecture-qa-agent (aide-powers agent) | gui-design.md, layered-architecture.md |
| fs-design-phase8-object (aide-powers skill) | object-design-qa-agent (aide-powers agent) | object-design-*.md, ubiquitous-language.md |
| fs-design-phase10-program (aide-powers skill) | final-design-qa-agent (aide-powers agent) | infra-interface-design.md, program-structure.md |

特徴:
- 呼び出すQAレビューアーは1つに固定（target_reviewer で指定）
- ディスパッチロジック（対応表照合）は不要
- delta-design-qa-agent (aide-powers agent) は呼ばない（差分設計ではないため）

#### 差分設計モード（mode: delta-design）

| ワークフロー | affected_domains の決定元 | review_target_files |
|---|---|---|
| 変更WF | impact-analysis.md + approach.md | delta-design.md, approach.md, change-requirements.md |
| バグ修正WF | bug-analysis.md + fix-plan.md | fix-design.md, fix-plan.md |
| リファクタリングWF | refactoring-candidates.md + refactoring-plan.md | refactoring-design.md, refactoring-plan.md |

特徴:
- delta-design-qa-agent (aide-powers agent) は常に呼ぶ
- affected_domains に基づいて追加のQAレビューアーを選択
- 複数のQAレビューアーが呼ばれる可能性がある

### 完了条件

以下の全てを満たすこと:

1. 必要なQAレビューアーが全て特定されていること
2. 特定された全てのQAレビューアーが呼び出されていること（省略なし）
3. 全QAレビューアーのレビュー結果が集約されていること
4. 総合判定（APPROVED / REJECTED）が決定されていること
5. 結果が呼び出し元フェーズスキルに返却されていること

### 責務範囲

**やること:**
- 呼び出し元から受け取った情報に基づき、必要なQAレビューアーエージェントを特定する
- 特定したQAレビューアーエージェントを呼び出し、レビューを実行する
- 複数のQAレビューアーを呼ぶ場合、全てのレビュー結果を集約して返す
- 総合判定（APPROVED / REJECTED）を決定する

**やらないこと:**
- REJECTED後の修正指示の実行（呼び出し元フェーズスキルの責務）
- 修正→再QAループの制御（呼び出し元フェーズスキルの責務）
- 修正担当の振り分け（呼び出し元フェーズスキルの責務）
- レビュー結果のユーザーへの報告（呼び出し元フェーズスキルの責務）

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。Iron Law に違反しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「影響が軽微だからこのQAレビューアーは不要」 | 影響の軽重はQAレビューアーが判断する。ディスパッチャーが自己判断で省略してはならない |
| 「前回のレビューで PASS だったから今回は省略」 | 修正により新たな問題が生じている可能性がある。毎回全対象を呼び出す |
| 「コンテキストが大きくなるのでレビューアーを減らす」 | コンテキストの大きさは品質保証の省略理由にならない |
| 「差分設計が小さいから delta-design-qa-agent (aide-powers agent) だけで十分」 | 差分が小さくても影響範囲が広い場合がある。対応表に従って機械的に判定する |
| 「同じ領域のレビューアーだから1つにまとめてよい」 | 各QAレビューアーは異なる観点を持つ。統合・省略は禁止 |
| 「呼び出し元が affected_domains を指定していないから全部呼ばなくてよい」 | affected_domains が空の場合でも delta-design-qa-agent (aide-powers agent) は必ず呼ぶ |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「requirements-qa-agent (aide-powers agent) は設計WF専用だから差分設計では不要」 | 差分設計で要件に影響がある場合は requirements-qa-agent (aide-powers agent) を呼ぶ。WF種別は関係ない |
| 「architecture-qa-agent (aide-powers agent) はレイヤー構造変更時のみ必要」 | GUI設計やDDDモデリングに影響がある場合も呼ぶ。対応表に従う |
| 「object-design-qa-agent (aide-powers agent) を呼ぶとレビューが長くなる」 | レビューの長さは品質保証の省略理由にならない |
| 「delta-design-qa-agent (aide-powers agent) が全体を見るから他は不要」 | delta-design-qa-agent (aide-powers agent) は差分設計の整合性を見る。各領域の専門的な検証は各QAレビューアーの責務 |
| 「修正が1箇所だけだから再レビュー時はそのレビューアーだけでよい」 | 再レビュー時も同じ affected_domains に基づいて全対象を呼び出す。部分レビューは禁止 |

## Integration

**Called by:**
- `fs-design-phase3-dev-plan (aide-powers skill)` — ゲート1（requirements-qa-agent (aide-powers agent)）
- `fs-design-phase7-ddd (aide-powers skill)` — ゲート2（architecture-qa-agent (aide-powers agent)）
- `fs-design-phase8-object (aide-powers skill)` — ゲート3（object-design-qa-agent (aide-powers agent)）
- `fs-design-phase10-program (aide-powers skill)` — ゲート4（final-design-qa-agent (aide-powers agent)）
- `fs-change-phase2-impl (aide-powers skill)` — 差分設計QAレビュー
- `fs-bugfix-phase2-impl (aide-powers skill)` — 修正差分設計QAレビュー
- `fs-refactoring-phase4-design (aide-powers skill)` — リファクタリング差分設計QAレビュー

**Dispatches to（呼び出すQAレビューアーエージェント）:**
- `requirements-qa-agent (aide-powers agent)` — 要件定義レビュー
- `architecture-qa-agent (aide-powers agent)` — アーキテクチャレビュー
- `object-design-qa-agent (aide-powers agent)` — オブジェクト設計レビュー
- `final-design-qa-agent (aide-powers agent)` — 最終設計レビュー（インフラIF + プログラム構成）
- `delta-design-qa-agent (aide-powers agent)` — 差分設計QAレビュー

**Related skills:**
- `design-gate (aide-powers skill)` — 設計書の存在確認（design-qa-dispatch はレビュー品質の検証）
- `design-sync (aide-powers skill)` — 設計書と実装の同期（design-qa-dispatch は設計書自体の品質検証）

**Input from caller:**
- mode（"design-workflow" / "delta-design"）
- affected_domains（影響を受ける設計領域のリスト、delta-design モードの場合）
- target_reviewer（呼び出すQAレビューアー名、design-workflow モードの場合。許容値: requirements-qa-agent / architecture-qa-agent / object-design-qa-agent / final-design-qa-agent）
- review_target_files（レビュー対象ファイルパスのリスト）
- prerequisite_files（前提成果物ファイルパスのリスト）
- feature_name（フィーチャー名）
- doc_index_path（doc-index.md のパス。QAレビューアーが全設計ドキュメントを確認するために使用）
- review_scope（オプション。レビュー範囲の限定指示）
