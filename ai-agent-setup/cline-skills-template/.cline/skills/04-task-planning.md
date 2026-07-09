# Skill: Task Planning（タスク分割）

## トリガー

Designが確定した後。

## 手順

1. 前フェーズのサマリを整理する:
   - 目的: {採用した設計案}
   - 決定事項: {ファイル構成、データ変更}
   - 未決事項: {実装中に決めること}
   - 制約: {設計上の制約}
2. 実装を小さなタスクに分割する
3. `docs/specs/{feature-name}/tasks.md` を作成する
4. ユーザーに確認し、OKなら実装フェーズに進む

## 分割の基準

- 1タスク = 1つの論理的な単位（1コミットで完結するサイズ）
- 依存関係の順序で並べる
- DB/インフラ変更は最初、UIは最後

## タスクサイズの目安

- 小さすぎ: 「変数名を変える」→ 他タスクに含める
- 適切: 「○○テーブルを作成しCRUD関数を実装する」
- 大きすぎ: 「バックエンド全部作る」→ 分割する

## 出力フォーマット

```markdown
# {機能名} - 実装タスク

## サマリ
- 目的: ...
- 決定事項: ...
- 未決事項: ...
- 制約: ...

## タスク一覧

### Task 1: {タスク名}
- [ ] Status: 未着手
- Priority: High / Medium / Low
- Risk: High / Medium / Low
- Estimate: {目安時間}
- Dependencies: なし / Task N
- 対象ファイル: ...
- やること: ...
- Definition of Done:
  - [ ] 完了条件を満たしている
  - [ ] Build/実行エラーなし
  - [ ] 既存テストが壊れていない
  - [ ] Requirementと矛盾なし
  - [ ] Designに準拠

### Task 2: {タスク名}
- [ ] Status: 未着手
- Priority: ...
- Risk: ...
- Estimate: ...
- Dependencies: Task 1
- 対象ファイル: ...
- やること: ...
- Definition of Done:
  - [ ] ...

## 実装順序と依存関係
Task 1 → Task 2 → Task 3
```

## 禁止事項

- 1タスクに複数の責務を詰め込まない
- 設計にない作業をタスクに含めない
- Priority / Risk / Estimate を省略しない
- Definition of Done を省略しない
