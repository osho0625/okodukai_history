# Skill: Task Planning

## 手順

1. design.md のファイル構成・処理フローを参照する
2. タスクに分割する（1タスク = 1コミット、DB→ロジック→UIの順）
3. `docs/specs/{feature-name}/tasks.md` を作成する
4. ユーザー確認 → OKで実装へ

## 出力フォーマット

```markdown
# {機能名} - 実装タスク

<!-- metadata
status: draft
version: 1.0
-->

## 共通 Definition of Done
- [ ] 完了条件を満たしている
- [ ] Build/実行エラーなし
- [ ] 既存テストが壊れていない
- [ ] デバッグコードが残っていない

## タスク一覧

### Task 1: {タスク名}
- [ ] Status: 未着手
- 対象ファイル: ...
- やること: ...
- 追加DoD（あれば）: ...

## 実装順序
Task 1 → Task 2 → Task 3
```

## 禁止事項

- 1タスクに複数責務を詰め込まない
- 設計にない作業を含めない
