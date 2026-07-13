# 差分設計書

## 設計方針

本変更は `.aide/specs/aide-powers/program-structure.md` のフェーズスキル詳細セクションにおけるプロセス定義行（Step名一覧）の誤記修正である。各 SKILL.md の実体（正）に設計書の記載（誤）を合わせる。

- 変更対象は3箇所のプロセス行テキストのみ
- 各行の書式パターン `- プロセス: 前処理 → Step1: ... → 後処理` を維持
- SKILL.md の `## Step N: タイトル` と完全一致させる

---

## 既存変更

### 変更1: fs-impl-phase4-execution プロセス行（L2291）

**対象ファイル**: `.aide/specs/aide-powers/program-structure.md`

**before:**
```markdown
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: 全タスク完了確認 → 後処理
```

**after:**
```markdown
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作検証・ユーザー確認 → 後処理
```

**変更理由:**
- Step1: 「coding-test-2review」→「coding-test-2review 経由」— SKILL.md の Step タイトルと表記を一致させる（半角スペース+「経由」の追加）
- Step2: 「全タスク完了確認」→「動作検証・ユーザー確認」— SKILL.md の実際の Step2 タイトルと一致させる

---

### 変更2: fs-change-phase2-impl プロセス行（L2377）

**対象ファイル**: `.aide/specs/aide-powers/program-structure.md`

**before:**
```markdown
- プロセス: 前処理 → Step1: 差分設計の前段階更新 → Step2: 差分設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: ユーザー確認 → Step7: タスク分解 → Step8: タスクリスト確認 → Step9: 工程チェック表 → Step10: 実装ループ → Step11: 全テスト → Step12: doc-sync → Step13: 動作確認試験書更新 → Step14: history.md → Step15: pending-issues確認 → 後処理
```

**after:**
```markdown
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: リグレッションテスト結果の確認・報告（セーフティネット） → Step12: 動作検証・ユーザー確認 → Step13: 設計書反映 → Step14: pending-issues 書き込み忘れチェック → Step15: 変更完了の案内 → 後処理
```

**変更理由:**
全15 Step の名称が SKILL.md の実体と不一致であったため、全 Step 名を SKILL.md の `## Step N: タイトル` と完全一致させる。Step 数（15）は変わらないが、各 Step の名称・内容が正しいプロセスフローを反映するよう修正する。

---

### 変更3: fs-bugfix-phase2-impl プロセス行（L2401）

**対象ファイル**: `.aide/specs/aide-powers/program-structure.md`

**before:**
```markdown
- プロセス: 前処理 → Step1: 差分設計前段階更新 → Step2: 修正設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: タスク分解 → Step7: タスクリスト確認 → Step8: 実装ループ → Step9: 全テスト → Step10: セーフティネット → Step11: doc-sync → Step12: history.md → Step13: pending-issues確認 → 後処理
```

**after:**
```markdown
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: リグレッションテスト結果の確認・報告（セーフティネット） → Step10: 動作検証・ユーザー確認 → Step11: 設計書反映 → Step12: pending-issues 書き込み忘れチェック → Step13: バグ修正完了の案内 → 後処理
```

**変更理由:**
全13 Step の名称が SKILL.md の実体と不一致であったため、全 Step 名を SKILL.md の `## Step N: タイトル` と完全一致させる。Step 数（13）は変わらないが、各 Step の名称・内容が正しいプロセスフローを反映するよう修正する。

---

## 新規追加

なし

---

## インターフェース影響サマリ

- **シグネチャ変更**: なし（ドキュメント内テキスト修正のみ）
- **公開API変更**: なし
- **データスキーマ変更**: なし
- **依存関係変更**: なし
- **他スキルへの波及**: なし（プロセス定義セクションを直接参照するスキルは存在しない）

---

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 更新タイミング |
|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` | 上記3箇所のプロセス行を修正 | 本変更WF実装時 |

※ 他の設計資料（object-design-*.md, gui-design.md, user-requirements.md 等）への影響なし
