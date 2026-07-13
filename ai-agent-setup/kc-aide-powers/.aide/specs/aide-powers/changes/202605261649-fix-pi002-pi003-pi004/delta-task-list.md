# 差分タスクリスト

## タスク一覧

| # | タスク | 対象ファイル | 対応REQ | 依存先 | ステータス |
|---|---|---|---|---|---|
| D-001 | レベル概念削除 + 工程チェック表生成追加 | skills/fs-change-phase7-task-planning/SKILL.md | C-001, C-003 | なし | ⬜ todo |
| D-002 | レベル概念削除 + 工程チェック表生成追加 | skills/fs-change-phase6-task-planning/SKILL.md | C-001, C-003 | なし | ⬜ todo |
| D-003 | レベル概念削除 + 工程チェック表生成追加 | skills/fs-bugfix-phase4-design/SKILL.md | C-001, C-003 | なし | ⬜ todo |
| D-004 | レベル概念削除 + 工程チェック表生成追加 | skills/fs-refactoring-phase4-design/SKILL.md | C-001, C-003 | なし | ⬜ todo |
| D-005 | 非プログラム成果物の簡略サイクル追加 | skills/fs-change-phase8-impl/SKILL.md | C-002 | なし | ⬜ todo |
| D-006 | 非プログラム成果物の簡略サイクル追加 | skills/fs-change-phase7-impl/SKILL.md | C-002 | なし | ⬜ todo |
| D-007 | 非プログラム成果物の簡略サイクル追加 | skills/fs-bugfix-phase5-impl/SKILL.md | C-002 | なし | ⬜ todo |
| D-008 | 非プログラム成果物の簡略サイクル追加 | skills/fs-refactoring-phase5-impl/SKILL.md | C-002 | なし | ⬜ todo |
| D-009 | 出力成果物に impl-process-checklist.md 追加（既に定義済みか確認） | skills/impl-task-planning/SKILL.md | C-003 | なし | ⬜ todo |
| D-010 | 工程チェック表生成手順追加 | skills/fs-change-phase5-delta-design/SKILL.md | C-003 | なし | ⬜ todo |
| D-011 | 工程チェック表生成手順追加 | skills/fs-change-phase4-delta-design/SKILL.md | C-003 | なし | ⬜ todo |
| D-012 | 工程チェック表生成手順追加 | skills/fs-impl-phase2-preparation/SKILL.md | C-003 | なし | ⬜ todo |
| D-013 | history.md 条件削除（常に必須化） | skills/fs-bugfix-phase6-doc/SKILL.md | C-004 | なし | ⬜ todo |

## 依存関係グラフ

全タスクの依存先が「なし」のため、全て並列実行可能。

```mermaid
graph TD
  D-001 & D-002 & D-003 & D-004 & D-005 & D-006 & D-007 & D-008 & D-009 & D-010 & D-011 & D-012 & D-013
```

## 網羅性チェック

- delta-design.md の修正対象ファイル: 12ファイル（重複除去）
- タスクリストのファイル数: 13タスク（D-009 は impl-task-planning の確認タスク）
- 漏れ: なし

## 成果物種別

全タスクが非プログラム成果物（Markdownスキルファイルのテキスト修正）。
簡略サイクル（実装 → 設計準拠レビュー → 完了）を適用する。
