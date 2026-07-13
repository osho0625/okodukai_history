---
name: doc-sync
description: "Use when a workflow's final phase requires merging delta design documents into existing design documents — synchronize design documentation after implementation is complete"
---

# Doc Sync（設計書反映）

## Overview

差分設計書の内容を既存設計書にマージせよ。ワークフロー完了時に設計書を最新状態に保て。

**Core principle:** ワークフローの最終フェーズで、差分設計書（delta-design.md / fix-design.md / refactoring-design.md）の内容を既存の設計書にマージする。差分設計書は作業中の一時的なドキュメントであり、その内容が正式な設計書に反映されて初めてドキュメント駆動開発の整合性が保たれる。反映を省略したまま作業を終了することは、設計書と実装の乖離を生む。

## The Iron Law

```
NO WORKFLOW COMPLETION WITHOUT DOCUMENT SYNCHRONIZATION.
— 設計書反映なしに、ワークフローを完了してはならない。
```

種別: **Rigid**（厳密遵守）

## Process

### Phase 0: doc-index.md の読み込み（必須・最初に実行）

**Step 1:** `doc-index.md` を読み込む
- パス: `.aide/specs/{feature_name}/doc-index.md`
- 存在しない → ワークフローに報告（反映不可）→ 終了
- 存在する → 記載されたドキュメント一覧を把握 → Step 2へ

**Step 2:** 必須ドキュメントの内容を読み込む
- `object-design-*.md`（反映先の既存クラス設計）
- `user-requirements.md`（反映先の既存要件）
- `program-structure.md`（反映先の既存ファイル構成）
- `gui-design.md`（該当する場合）
- `infra-interface-design.md`（該当する場合）
- `ubiquitous-language.md`（該当する場合）

**Step 3:** Phase 1 へ

**重要:** doc-index.md のパスだけでなく、必須ドキュメントの**内容まで読み込む**こと。

### Phase 1: 入力の確認

**Step 1:** ワークフローから渡された差分設計書を読み込む
- 変更WF: `delta-design.md`, `change-requirements.md`, `impact-analysis.md`
- バグ修正WF: `fix-design.md`, `fix-plan.md`
- リファクタリングWF: `refactoring-design.md`, `refactoring-plan.md`

**Step 2:** Phase 2 へ

### Phase 2: 反映計画の作成

**Step 1:** 差分設計書の内容を設計書ごとに整理する
- `object-design-*.md`:
  - 新規クラスの追加 → 該当レイヤーの設計書に追記
  - 既存クラスの変更 → before を after に書き換え
  - メソッドの追加・変更 → 該当クラスのセクションを更新
- `user-requirements.md`:
  - 新規要件の追加 → 適切なセクションに追記
  - 既存要件の変更 → 該当箇所を更新
- `program-structure.md`:
  - 新規ファイルの追加 → ファイル一覧に追記
  - ファイルの移動・削除 → 該当箇所を更新
- `gui-design.md`（該当する場合）
- `infra-interface-design.md`（該当する場合）
- `ubiquitous-language.md`（該当する場合）

**Step 2:** Phase 3 へ

### Phase 3: 設計書の更新

**Step 1:** 反映計画に従い、各設計書を更新する
- 差分設計書の before → after に従い、既存設計書の該当箇所を更新する
- 新規追加の場合は、既存設計書の適切なセクションに追記する
- 既存の記述と矛盾しないように注意する

**Step 2:** Phase 4 へ

### Phase 4: 一貫性チェック

**Step 1:** 更新した設計書について以下を確認する
- □ 差分設計の内容がすべて反映されているか
- □ 既存の記述と矛盾していないか
- □ フォーマットが既存の設計書と統一されているか
- 問題あり → Phase 3 に戻り修正
- 問題なし → Phase 5 へ

### Phase 5: ユーザー確認

**Step 1:** 反映内容のサマリーをユーザーに提示する
- 更新した設計書の一覧
- 各設計書の主な変更点

**Step 2:** ユーザーの確認を得る
- 修正要求あり → Phase 3 に戻り修正
- 確認OK → Phase 6 へ

### Phase 6: history.md の管理

**Step 1:** ワークフローの指示を確認する
- history.md の指示なし → 終了
- 初期作成の指示あり（変更WF）:
  - ドキュメントフォルダ内に `history.md` を新規作成
  - 「初回変更」セクションを記載
- 追記の指示あり（バグ修正WF・フォルダ統合済み）:
  - 既存 `history.md` の最大通番を確認
  - +1 した通番で「不具合修正 #N」セクションを追記
  - `history.md` が存在しない場合は新規作成

## history.md Management

### 変更WF: 初期作成テンプレート

```markdown
# 変更・不具合対応履歴

## 初回変更
- 日付: {YYYY-MM-DD}
- 依頼内容: {change-requirements.md の要求概要}
- 変更概要: {delta-design.md の変更内容の要約}
- 関連ドキュメント: change-requirements.md, delta-design.md
```

### バグ修正WF: 追記テンプレート（フォルダ統合済みの場合）

```markdown
---

## 不具合修正 #{通番}
- 報告日: {bug-report.md の報告日}
- 症状: {bug-report.md のバグの症状の要約}
- 原因: {bug-analysis.md の原因の説明の要約}
- 修正概要: {fix-design.md の変更内容の要約}
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
```

- 通番は既存の「不具合修正 #N」の最大値 + 1 とする
- history.md が存在しない場合は「初回変更」セクション + 「不具合修正 #1」で新規作成する

### リファクタリングWF

- history.md の作成・更新は行わない

## Red Flags — STOP

以下の思考パターンを検出したら **STOP** — doc-sync スキルを発動せよ:

| # | Red Flag | 正しい対応 |
|---|---|---|
| 1 | 「差分が小さいから設計書反映は不要」 | 差分の大小に関わらず、反映は必須。小さな差分の蓄積が大きな乖離を生む |
| 2 | 「設計書は後でまとめて更新する」 | ワークフロー完了時に反映する。後回しにすると忘れる |
| 3 | 「コンテキストが大きくなったので反映を省略する」 | コンテキスト管理は省略の理由にならない |
| 4 | 「実装が正しく動いているから設計書は古くてもいい」 | 設計書が古いと、次の変更時に間違った設計に基づいて作業する |
| 5 | 「doc-index.md を読まずに直接設計書を更新する」 | doc-index.md を必ず読み、反映先を正確に特定する |
| 6 | 「一貫性チェックは目視で十分」 | 差分設計の全項目が反映されているか、既存記述と矛盾していないか、体系的に確認する |
| 7 | 「ユーザー確認は省略して先に進む」 | 反映内容のサマリーを必ずユーザーに提示し、確認を得る |
| 8 | 「history.md は重要でないから省略する」 | ワークフローの指示に history.md の記載がある場合は必ず作成・更新する |
| 9 | 「ドキュメントフォルダ（changes/bugfix/refactoring/）を削除して整理する」 | ドキュメントフォルダは履歴として残す。削除は revert 時のみ |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| 「差分設計書があるから既存設計書は更新しなくてよい」 | 差分設計書は作業中の一時ドキュメント。正式な設計書に反映されて初めて整合性が保たれる |
| 「反映は次のワークフローの最初にやればいい」 | 反映は現在のワークフローの最終フェーズで行う。次のワークフローに持ち越さない |
| 「object-design-*.md だけ更新すれば十分」 | user-requirements.md, program-structure.md 等、差分設計書に関連する全ての設計書を更新する |
| 「before → after の before が見つからないから反映できない」 | doc-index.md から正しい設計書を特定し、内容を読み込んで該当箇所を探す。見つからない場合はワークフローに報告する |
| 「フォーマットが多少違っても内容が合っていればよい」 | フォーマットの統一は一貫性の一部。既存設計書のスタイルに合わせる |
| 「history.md は誰も読まないから不要」 | history.md はフォルダ統合時の経緯把握に使用される。ワークフローの指示がある場合は必ず作成する |

## Integration

**Required workflow skills（doc-sync が呼び出される元）:**
- 変更ワークフローのフェーズ9（設計書反映フェーズスキル）
- バグ修正ワークフローのフェーズ6（ドキュメント反映フェーズスキル）
- リファクタリングワークフローのフェーズ5（ドキュメント反映フェーズスキル）

**Related skills:**
- **design-sync (aide-powers skill)**: 実装中の設計同期（doc-sync の前段。design-sync の結果が doc-sync の入力になる）
- **design-gate (aide-powers skill)**: 設計書の存在確認（doc-sync の前提条件として設計書が存在すること）
- **doc-index-maintenance (aide-powers skill)**: doc-index.md の更新（doc-sync 完了後にワークフローが呼び出す）
- **git-commit-workflow (aide-powers skill)**: doc-sync 完了後にワークフローが git-committer を呼び出す

**Called by（doc-sync を起動するタイミング）:**
- 変更ワークフロー: フェーズ8（差分実装）完了後 → フェーズ9で doc-sync を実行
- バグ修正ワークフロー: フェーズ5（実装）完了後 → フェーズ6で doc-sync を実行
- リファクタリングワークフロー: フェーズ4（実装）完了後 → フェーズ5で doc-sync を実行
