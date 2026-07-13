# 工程チェック表

## メタ情報

| 項目 | 値 |
|---|---|
| feature_name | aide-powers |
| changes_dir | .aide/specs/aide-powers/changes/202606022049-folder-merge-check-rules |
| 成果物種別 | 非プログラム成果物（スキル定義テキストファイル） |
| テスト方針 | 手動検証（dev-environment.md §7.4） |

---

## タスク1: skills/folder-merge-check/SKILL.md への退避ルール追記

### 実装工程

| # | 工程 | 状態 | 備考 |
|---|---|---|---|
| 1 | write_code | ✅ done | Step 4-事前サブステップ挿入 + 完了条件リナンバリング完了 |
| 2 | write_test | ➖ skip | 非プログラム成果物（自動テストなし） |
| 3 | run_test | ➖ skip | 非プログラム成果物（自動テストなし） |
| 4 | quality_review | ➖ skip | 非プログラム成果物 |

### 実装チェックリスト

- [ ] delta-design.md 変更対象1 の before 箇所を特定した
- [ ] Step 4 セクションに「Step 4-事前」サブステップを挿入した
- [ ] 退避対象の検出ルール（5項目）が正確に記載されている
- [ ] 既存の移動ルールが「移動ルール（既存処理、変更なし）:」ラベル付きで保持されている
- [ ] delta-design.md 変更対象2 の before 箇所を特定した
- [ ] 完了条件に条件1・2を追加した
- [ ] 既存条件1〜5が条件3〜7にリナンバリングされている
- [ ] 変更後の内容が delta-design.md の after と一致する

---

## 全体完了チェック

| # | チェック項目 | 状態 |
|---|---|---|
| 1 | 全タスクの write_code が完了している | ✅ |
| 2 | delta-design.md の全変更対象が反映されている | ✅ |
| 3 | 既存処理（移動ルール a/b）に意図しない変更がない | ✅ |
| 4 | Input/Output インターフェースに変更がない | ✅ |
| 5 | 設計準拠レビュー | ✅ done — PASS（検査セクション数: 2, 差分: 0） |
