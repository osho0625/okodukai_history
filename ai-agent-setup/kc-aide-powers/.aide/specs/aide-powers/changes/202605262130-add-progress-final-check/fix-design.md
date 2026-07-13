# バグ修正差分設計書

## 概要
PI-014: 4つの最終フェーズスキルの後処理セクションに final-check への遷移指示を追加する

## 変更内容

### D-001: skills/fs-impl-phase6-doc-generation/SKILL.md

#### before
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)（docs/ 配下のファイルを doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: README.md + docs/ + impl-progress.md）
4. 実装ワークフロー完了をユーザーに報告
```

#### after
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)（docs/ 配下のファイルを doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: README.md + docs/ + impl-progress.md）
4. 実装ワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase7-final-check (aide-powers skill)）
```

---

### D-002: skills/fs-change-phase9-completion/SKILL.md

#### before
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)

※ 変更ワークフロー完了（最終フェーズのため次フェーズ遷移なし）
```

#### after
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-change-phase10-final-check (aide-powers skill)）
```

---

### D-003: skills/fs-bugfix-phase6-doc/SKILL.md

#### before
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. バグ修正ワークフロー完了
```

#### after
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. バグ修正ワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-bugfix-phase7-final-check (aide-powers skill)）
```

---

### D-004: skills/fs-refactoring-phase6-doc/SKILL.md

#### before
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. リファクタリングワークフロー完了
```

#### after
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. リファクタリングワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check (aide-powers skill)）
```

---

## リグレッションテスト設計

### 手動確認手順
1. 各ファイルの後処理セクションが正しい Markdown 構文であること
2. 番号付きリストの連番が正しいこと
3. REQUIRED SUB-SKILL の参照先スキル名が正しいこと（fs-impl-phase7-final-check, fs-change-phase10-final-check, fs-bugfix-phase7-final-check, fs-refactoring-phase7-final-check）
4. Integration セクションの「次フェーズスキル」と後処理の遷移先が一致すること
5. 後処理の既存項目（1〜3 or 4）が変更されていないこと

## 更新が必要な設計資料
なし

## タスク分解

| タスクID | 対象ファイル | 依存先 | 説明 |
|---|---|---|---|
| D-001 | skills/fs-impl-phase6-doc-generation/SKILL.md | なし | 後処理に final-check 遷移追加 |
| D-002 | skills/fs-change-phase9-completion/SKILL.md | なし | 後処理の「※」行削除 + final-check 遷移追加 |
| D-003 | skills/fs-bugfix-phase6-doc/SKILL.md | なし | 後処理に final-check 遷移追加 |
| D-004 | skills/fs-refactoring-phase6-doc/SKILL.md | なし | 後処理に final-check 遷移追加 |

全タスク並列実行可能（依存関係なし）
