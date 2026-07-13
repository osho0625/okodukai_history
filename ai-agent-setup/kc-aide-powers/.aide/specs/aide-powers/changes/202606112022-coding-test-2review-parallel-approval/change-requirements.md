# 変更要求定義書

## 変更概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606292100-task-list-row-key-subtask-rule |
| 変更名 | 工程チェック表の行キー生成ルール明示追記・冗長プロンプト解消 |
| 起票日 | 2026-06-29 |
| 起票理由 | タスクプランナー系プロンプトテンプレートに行キー生成ルールが明示されていないため、サブタスクIDではなく親タスクIDで行キーを作ってしまう不具合が発生する |

---

## 1. 変更の目的

工程チェック表（impl-process-checklist.md）の行キー生成ルールがタスクプランナー系プロンプトに明示されていないため、AIエージェントがサブタスクIDではなく親タスクIDで行キーを生成してしまう問題を防止する。

`impl-task-planning` スキル本体（SKILL.md）には「行キーは `{task_id}::{工程キー}`」と記載されているが、各WFのタスクプランナープロンプトテンプレートには以下のルールが明示されていない:

> 工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る

---

## 2. 変更要求内容

### CR-001: タスクプランナー系プロンプトテンプレートへの行キー生成ルール追記

以下のプロンプトテンプレートに「工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る」ルールを追記する。

**変更対象ファイル:**

| # | ファイルパス | WF | 備考 |
|---|---|---|---|
| 1 | `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | 変更WF | ステップ6（impl-process-checklist.md 生成）セクション |
| 2 | `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | バグ修正WF | ステップ6（impl-process-checklist.md 生成）セクション |
| 3 | `skills/impl-task-planning/impl-planner-prompt.md` | 実装WF（共通スキル） | ステップ7（工程チェック表の生成）セクション |

**追記するルール:**

```
工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る。
- サブタスクがある親タスク: 各サブタスクのIDで行キーを生成する（例: 1.1::implement, 1.2::implement）
  - 親タスクID（例: 1）単体では行キーを作らない
- サブタスクがない親タスク: 親タスクIDで行キーを生成する（例: 0.3::implement）
```

### CR-002: `fs-impl-phase2-preparation` の冗長プロンプトコピー解消

`skills/fs-impl-phase2-preparation/impl-planner-prompt.md` は `skills/impl-task-planning/impl-planner-prompt.md` とほぼ同一内容の冗長コピーである。`fs-impl-phase2-preparation` は `impl-task-planning` スキルを activate してルールを注入した上で独自コピーのプロンプトでサブエージェントを実行しているが、共通スキル配下のプロンプトを直接参照すべきである。

**変更内容:**

1. `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` を削除する
2. `skills/fs-impl-phase2-preparation/SKILL.md` の Step 3 における「本スキルディレクトリの `impl-planner-prompt.md`」への参照を、`skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）への参照に変更する
3. `skills/fs-impl-phase2-preparation/SKILL.md` の Integration セクションのプロンプトテンプレート一覧から `impl-planner-prompt.md` を削除し、共通スキル参照である旨を記載する

**変更対象ファイル:**

| # | ファイルパス | 操作 | 備考 |
|---|---|---|---|
| 1 | `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` | 削除 | 冗長コピーの除去 |
| 2 | `skills/fs-impl-phase2-preparation/SKILL.md` | 修正 | Step 3 のプロンプト参照先を共通スキルに変更、Integration セクション更新 |

---

## 3. 受入基準

| # | 基準 | 検証方法 |
|---|---|---|
| AC-1 | `change-task-planner-prompt.md` の工程チェック表生成セクションに行キー生成ルールが明記されていること | ファイル読み取りで確認 |
| AC-2 | `bugfix-task-planner-prompt.md` の工程チェック表生成セクションに行キー生成ルールが明記されていること | ファイル読み取りで確認 |
| AC-3 | `skills/impl-task-planning/impl-planner-prompt.md` の工程チェック表生成セクションに行キー生成ルールが明記されていること | ファイル読み取りで確認 |
| AC-4 | 追記されたルールが `impl-task-planning` スキル本体（SKILL.md）の既存定義と矛盾しないこと | SKILL.md との整合性確認 |
| AC-5 | `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` が削除されていること | ファイル不存在を確認 |
| AC-6 | `skills/fs-impl-phase2-preparation/SKILL.md` の Step 3 が `skills/impl-task-planning/impl-planner-prompt.md` を参照していること | ファイル読み取りで確認 |
| AC-7 | `fs-impl-phase2-preparation` のタスクリスト生成機能が共通スキルのプロンプト参照で従来通り動作すること（参照パスが正しいこと） | SKILL.md の記述整合性確認 |

---

## 4. スコープ

### スコープ内

- CR-001: 3ファイルのプロンプトテンプレートへの行キー生成ルール追記（変更WF・バグ修正WF・共通スキル）
- CR-002: `fs-impl-phase2-preparation` の冗長プロンプトコピー削除と共通スキル参照への切り替え

### スコープ外

- `impl-task-planning` スキル本体（SKILL.md）の変更
- `coding-test-2review` スキルの変更
- 実行時の動作変更（ランタイム挙動は変更しない）
- 工程チェック表のフォーマット変更
- 行キー以外のルール追加・変更
- `fs-impl-phase2-preparation/SKILL.md` のプロンプト参照先以外のロジック変更

---

## 5. 前提条件

| # | 前提条件 |
|---|---|
| 1 | タスクプランナー系プロンプトテンプレートがリポジトリ内で参照可能であること |
| 2 | `impl-task-planning` スキル本体に行キー生成ルールの正式定義が存在すること（`{task_id}::{工程キー}` 形式） |

---

## 6. リスク・考慮事項

| # | 考慮事項 |
|---|---|
| 1 | `.kiro/skills/` 配下にもミラーコピーが存在する（setup.bat でコピーされる）が、ソースは `skills/` 配下が正本であり、setup.bat 再実行で反映される |

---

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
