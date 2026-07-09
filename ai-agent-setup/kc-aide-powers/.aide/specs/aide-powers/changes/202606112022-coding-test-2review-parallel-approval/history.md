# 変更履歴

## 変更概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606292100-task-list-row-key-subtask-rule |
| 変更名 | 工程チェック表の行キー生成ルール明示追記・冗長プロンプト解消 |
| 実施日 | 2026-06-29 |

## 依頼内容

タスクプランナー系プロンプトテンプレートに行キー生成ルールが明示されていないため、AIエージェントがサブタスクIDではなく親タスクIDで行キーを生成してしまう問題を防止する。また、`fs-impl-phase2-preparation` スキルに存在する冗長なプロンプトコピー（`impl-planner-prompt.md`）を削除し、共通スキル配下の正本を参照するように切り替える。

## 変更内容

### CR-001: 行キー生成ルール追記

以下の3ファイルのプロンプトテンプレートに、工程チェック表の行キー生成ルール（サブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る）を追記。

- `skills/fs-change-phase2-impl/change-task-planner-prompt.md`（ステップ6）
- `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md`（ステップ6）
- `skills/impl-task-planning/impl-planner-prompt.md`（ステップ7）

### CR-002: 冗長コピー削除・参照切り替え

- `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` を削除
- `skills/fs-impl-phase2-preparation/SKILL.md` の4箇所（A/B/C/D）でプロンプト参照先を `skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）に変更
- `program-structure.md` の `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行を更新

## 更新した設計資料

| 設計書 | 更新内容 |
|---|---|
| `program-structure.md` | `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行を更新（`impl-planner-prompt.md` を本スキルディレクトリ配下から共通スキル参照に変更） |

## 備考

- 本変更はMarkdownファイル（プロンプトテンプレート/スキル定義）のテキスト追記・参照パス変更・ファイル削除のみで構成される
- `.kiro/skills/` 配下のミラーコピーは setup.bat 再実行で反映される

---

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
