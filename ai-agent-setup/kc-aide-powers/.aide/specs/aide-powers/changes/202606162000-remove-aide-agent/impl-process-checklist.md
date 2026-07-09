# 工程チェック表

> 非プログラム成果物のため工程を簡略化。テストフレームワーク不在（ユーザー承認済み）。

| タスク | 実装 | テスト | 設計レビュー | コードレビュー |
|---|---|---|---|---|
| D-001: aide-agent 関連ファイル削除 | ✅ done | ➖ skip | ✅ done | ➖ skip |
| D-002: SKILL.md ガードセクション削除 | ✅ done | ➖ skip | ✅ done | ✅ done |
| D-003: steering/aide-powers-bootstrap.md 修正 | ✅ done | ➖ skip | ✅ done | ✅ done |
| D-004: ブートストラップファイル修正（3PF） | ✅ done | ➖ skip | ✅ done | ✅ done |
| D-005: setup.bat コピー処理削除 | ✅ done | ➖ skip | ✅ done | ✅ done |
| D-006: program-structure.md 更新 | ✅ done | ➖ skip | ✅ done | ➖ skip |

## 凡例

| 記号 | 意味 |
|---|---|
| ⬜ todo | 未着手 |
| ✅ done | 完了 |
| ➖ skip | スキップ（該当なし） |

## スキップ理由

| 工程 | スキップ対象 | 理由 |
|---|---|---|
| テスト | 全タスク | テストフレームワーク不在。手動確認項目は delta-task-list.md に記載（T-001〜T-006） |
| コードレビュー | D-001 | ファイル削除のみ。レビュー対象のコード変更なし |
| コードレビュー | D-006 | 設計ドキュメント更新。設計レビューでカバー |
