# 差分タスクリスト

## 変更概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606292100-task-list-row-key-subtask-rule |
| 総タスク数 | 6 |
| CR-001 タスク数 | 3（並列可） |
| CR-002 タスク数 | 3（依存あり） |

---

## 依存関係グラフ

```
CR-001（並列実行可能）:
  D-001 ─┐
  D-002 ─┼─ 相互独立
  D-003 ─┘

CR-002（直列依存あり）:
  D-004 → D-005 → D-006
```

---

## タスク一覧

### CR-001: 行キー生成ルール追記

#### D-001: change-task-planner-prompt.md に行キー生成ルール追記

| 項目 | 内容 |
|---|---|
| タスクID | D-001 |
| 対象ファイル | `skills/fs-change-phase2-impl/change-task-planner-prompt.md` |
| 変更種別 | 既存変更 |
| 依存先タスク | なし |
| 設計参照 | delta-design.md > CR-001 > 変更1-1 |
| 変更内容 | ステップ6（impl-process-checklist.md 生成）セクション末尾に行キー生成ルールを追記 |
| 成果物種別 | 非プログラム成果物 |

---

#### D-002: bugfix-task-planner-prompt.md に行キー生成ルール追記

| 項目 | 内容 |
|---|---|
| タスクID | D-002 |
| 対象ファイル | `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` |
| 変更種別 | 既存変更 |
| 依存先タスク | なし |
| 設計参照 | delta-design.md > CR-001 > 変更1-2 |
| 変更内容 | ステップ6（impl-process-checklist.md 生成）セクション末尾に行キー生成ルールを追記 |
| 成果物種別 | 非プログラム成果物 |

---

#### D-003: impl-planner-prompt.md に行キー生成ルール追記

| 項目 | 内容 |
|---|---|
| タスクID | D-003 |
| 対象ファイル | `skills/impl-task-planning/impl-planner-prompt.md` |
| 変更種別 | 既存変更 |
| 依存先タスク | なし |
| 設計参照 | delta-design.md > CR-001 > 変更1-3 |
| 変更内容 | ステップ7（工程チェック表の生成）セクション末尾に行キー生成ルールを追記 |
| 成果物種別 | 非プログラム成果物 |

---

### CR-002: 冗長コピー削除・参照切り替え

#### D-004: fs-impl-phase2-preparation/impl-planner-prompt.md 削除

| 項目 | 内容 |
|---|---|
| タスクID | D-004 |
| 対象ファイル | `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` |
| 変更種別 | 削除 |
| 依存先タスク | なし |
| 設計参照 | delta-design.md > CR-002 > 変更2-1 |
| 変更内容 | 冗長コピーファイルの削除（共通スキル impl-task-planning 配下に一本化） |
| 成果物種別 | 非プログラム成果物 |

---

#### D-005: fs-impl-phase2-preparation/SKILL.md 参照先変更（4箇所）

| 項目 | 内容 |
|---|---|
| タスクID | D-005 |
| 対象ファイル | `skills/fs-impl-phase2-preparation/SKILL.md` |
| 変更種別 | 既存変更 |
| 依存先タスク | D-004 |
| 設計参照 | delta-design.md > CR-002 > 変更2-2（変更箇所A/B/C/D） |
| 変更内容 | Step 3 のプロンプト参照先変更（箇所A）、Step 4 修正ループ時参照先変更（箇所B）、Step 3 NEEDS_CONTEXT時参照先変更（箇所C）、Integration セクション更新（箇所D） |
| 成果物種別 | 非プログラム成果物 |

---

#### D-006: program-structure.md プロンプトテンプレート行更新

| 項目 | 内容 |
|---|---|
| タスクID | D-006 |
| 対象ファイル | `.aide/specs/aide-powers/program-structure.md` |
| 変更種別 | 既存変更 |
| 依存先タスク | D-005 |
| 設計参照 | delta-design.md > 更新が必要な設計資料 |
| 変更内容 | `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行を更新（`impl-planner-prompt.md` を本スキルディレクトリ配下から共通スキル参照に変更） |
| 成果物種別 | 非プログラム成果物 |

---

## 実装順序

| 順序 | タスク | 備考 |
|---|---|---|
| 1（並列） | D-001, D-002, D-003 | CR-001: 相互独立、並列実行可 |
| 2 | D-004 | CR-002: ファイル削除（後続の参照変更の前提） |
| 3 | D-005 | CR-002: SKILL.md 4箇所変更（D-004 完了後） |
| 4 | D-006 | CR-002: 設計資料更新（D-005 完了後） |

---

## 網羅性チェック

| delta-design 変更項目 | タスク | 状態 |
|---|---|---|
| CR-001 > 変更1-1 | D-001 | ✅ |
| CR-001 > 変更1-2 | D-002 | ✅ |
| CR-001 > 変更1-3 | D-003 | ✅ |
| CR-002 > 変更2-1 | D-004 | ✅ |
| CR-002 > 変更2-2（A/B/C/D） | D-005 | ✅ |
| 更新が必要な設計資料 > program-structure.md | D-006 | ✅ |

**結論: delta-design.md の全変更項目がタスクに反映済み。漏れなし。**

---

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
