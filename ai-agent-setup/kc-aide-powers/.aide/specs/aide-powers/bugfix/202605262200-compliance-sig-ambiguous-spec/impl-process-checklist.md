# 工程チェック表

## 対象ワークフロー
bugfix / compliance-sig-ambiguous-spec

## タスク一覧

| # | タスク | 実装 | 設計レビュー | 品質レビュー | テスト実行 | 完了 |
|---|---|---|---|---|---|---|
| 1 | compliance-sig.ps1 に verify-phase / sign-phase 追加 | ✅ | ✅ | ✅ | ✅ | ⬜ |
| 2 | compliance-sig.bat に verify-phase / sign-phase 追加 | ✅ | ✅ | ✅ | ✅ | ⬜ |
| 3 | compliance-sig.sh に verify-phase / sign-phase 追加 | ✅ | ✅ | ✅ | ✅ | ⬜ |
| 4 | SKILL.md の verify/write モード説明書き換え | ✅ | ✅ | ✅ | ✅ | ⬜ |
| 5 | compliance-checker.md の署名関連セクション書き換え | ✅ | ✅ | ✅ | ✅ | ⬜ |

## 依存関係

```
タスク1 → タスク2 [並列可]
タスク1 → タスク3 [並列可]
タスク1 → タスク4 [並列可]
タスク1 → タスク5 [並列可]
```

## 記入ルール

- 各セルは担当エージェントのみが更新する
  - 実装: micro-impl-agent
  - 設計レビュー: design-review-agent
  - 品質レビュー: code-review-agent
  - テスト実行: micro-impl-agent
  - 完了: オーケストレータ（全セルが ✅ の場合のみ）
- ⬜ → ✅ への更新のみ許可
- オーケストレータによる直接更新を禁止
