# 工程チェック表

## 凡例
- ⬜ pending — 未着手
- 🔄 in-progress — 作業中
- ✅ done — 完了

---

## Wave 1（並列実行可・依存先なし）

| タスクID | 工程 | ステータス |
|---|---|---|
| D-001 | implement | ✅ done |
| D-001 | review | ✅ done |
| D-002 | implement | ✅ done |
| D-002 | review | ✅ done |
| D-003 | implement | ✅ done |
| D-003 | review | ✅ done |
| D-004 | implement | ✅ done |
| D-004 | review | ✅ done |
| D-008 | implement | ✅ done |
| D-008 | review | ✅ done |
| D-009 | implement | ✅ done |
| D-009 | review | ✅ done |
| D-010 | implement | ✅ done |
| D-010 | review | ✅ done |
| D-011 | implement | ✅ done |
| D-011 | review | ✅ done |
| D-012 | implement | ✅ done |
| D-012 | review | ✅ done |
| D-014 | implement | ✅ done |
| D-014 | review | ✅ done |
| D-015 | implement | ✅ done |
| D-015 | review | ✅ done |
| D-016 | implement | ✅ done |
| D-016 | review | ✅ done |
| D-017 | implement | ✅ done |
| D-017 | review | ✅ done |

## Wave 2（D-001〜003 完了後）

| タスクID | 工程 | ステータス |
|---|---|---|
| D-005 | implement | ✅ done |
| D-005 | review | ✅ done |
| D-006 | implement | ✅ done |
| D-006 | review | ✅ done |
| D-007 | implement | ✅ done |
| D-007 | review | ✅ done |

## Wave 3（D-005 完了後）

| タスクID | 工程 | ステータス |
|---|---|---|
| D-013 | implement | ✅ done |
| D-013 | review | ✅ done |

---

## 工程定義

| 工程 | 内容 |
|---|---|
| implement | マークダウンファイルの編集（差分設計のbefore→afterに従って変更を適用） |
| review | 差分設計書との整合確認（変更内容が設計通りか、漏れ・矛盾がないか確認） |

## 完了基準

- 全タスクの implement + review が ✅ done であること
- impact-analysis.md「テスト対象機能」の手動確認項目は、setup.bat 実行後のグローバル反映 + 実際のワークフロー実行時に確認する（本工程チェック表の範囲外）
