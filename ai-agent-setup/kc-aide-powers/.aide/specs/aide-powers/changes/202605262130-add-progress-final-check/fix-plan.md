# 修正方針書

## 原因サマリー

コミット a795e70 で4つの最終フェーズスキルの Integration セクション（メタデータ）は正しく更新されたが、Process > 後処理セクション（AI Agent が実行時に従う手順）の遷移指示が未更新のまま残った。AI Agent は後処理セクションに従って動作するため、final-check フェーズへの遷移が実行されない。

## 修正方法

### 対象ファイル1: skills/fs-impl-phase6-doc-generation/SKILL.md

- **before:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)（docs/ 配下のファイルを doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: README.md + docs/ + impl-progress.md）
4. 実装ワークフロー完了をユーザーに報告
```

- **after:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)（docs/ 配下のファイルを doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: README.md + docs/ + impl-progress.md）
4. 実装ワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase7-final-check (aide-powers skill)）
```

---

### 対象ファイル2: skills/fs-change-phase9-completion/SKILL.md

- **before:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)

※ 変更ワークフロー完了（最終フェーズのため次フェーズ遷移なし）
```

- **after:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-change-phase10-final-check (aide-powers skill)）
```

---

### 対象ファイル3: skills/fs-bugfix-phase6-doc/SKILL.md

- **before:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. バグ修正ワークフロー完了
```

- **after:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. バグ修正ワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-bugfix-phase7-final-check (aide-powers skill)）
```

---

### 対象ファイル4: skills/fs-refactoring-phase6-doc/SKILL.md

- **before:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. リファクタリングワークフロー完了
```

- **after:**
```markdown
### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. リファクタリングワークフロー完了をユーザーに報告
5. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check (aide-powers skill)）
```

---

## 対策種別

**根本対策**

判定理由: AI Agent が実行時に従う Process > 後処理セクションに遷移指示を直接追記するため、バグの根本原因（後処理セクションの遷移指示欠落）を完全に解消する。Integration セクションのメタデータとの整合性も確保される。

## 副作用リスク分析

| リスク項目 | 評価 | 理由 |
|---|---|---|
| 既存フェーズの動作への影響 | なし | 後処理の既存項目（1〜3 or 4）は変更しない。末尾に項目を追加するのみ |
| final-check スキル自体の動作 | なし | final-check スキル（phase7/phase10）は既に作成済みで正常動作する前提 |
| progress-resume-check への影響 | なし | progress-file-format.md は既に正しく更新済み |
| 他のワークフロー（企画WF・設計WF・逆引きWF）への影響 | なし | これらは既に正しく遷移指示が設定されている |
| 後処理の番号ずれ | 低リスク | fs-change-phase9-completion のみ「※」行を削除して番号付き項目に変更するため、既存の番号体系が変わる。ただし AI Agent は番号ではなく内容で判断するため実質的な影響なし |

**総合評価:** 副作用リスクは極めて低い。修正は既存動作を変更せず、末尾に遷移指示を追加するのみ。

## リグレッションテスト方針

このプロジェクトはスキル定義ファイル群であり、自動テストは存在しない。以下の手動確認手順でリグレッションを防止する。

### 手動確認手順

1. **修正後の構文確認**
   - 各ファイルの後処理セクションが正しい Markdown 構文であること
   - 番号付きリストの連番が正しいこと
   - REQUIRED SUB-SKILL の参照先スキル名が正しいこと

2. **Integration セクションとの整合性確認**
   - 後処理の遷移先スキル名が Integration セクションの「次フェーズスキル」と一致すること
   - 4ファイル全てで整合性が取れていること

3. **正常パターンとの比較確認**
   - `fs-planning-phase3-finalize/SKILL.md` の後処理パターンと同じ構造であること
   - 「次フェーズ遷移（REQUIRED SUB-SKILL: ...）」の記述形式が統一されていること

4. **既存動作の非破壊確認**
   - 後処理の項目1〜3（doc-index-maintenance, phase-compliance-check, git-commit-workflow）が変更されていないこと
   - 完了条件セクションが変更されていないこと

## ユーザー合意チェックリスト

- [ ] 原因の理解
- [ ] 対策種別の受容
- [ ] 修正方針の承認
