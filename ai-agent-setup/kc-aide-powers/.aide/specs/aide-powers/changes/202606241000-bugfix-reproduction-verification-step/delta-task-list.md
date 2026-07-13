# 差分タスクリスト

## 変更概要

バグ修正WF Phase1（fs-bugfix-phase1-analysis）に「再現性確認・原因特定」Step を新規挿入し、既存Step番号を繰り下げる。

## 依存関係図

```
D-001 ──────────────┐
                    ├──→ D-003 ──→ D-R-001 ──→ D-004
D-002 ──────────────┘         ↗
                    └─────────┘
```

- D-001（SKILL.md 変更）: 依存先なし
- D-002（bugfix-investigator-prompt.md 新規作成）: 依存先なし（D-001 と並列可能）
- D-003（bugfix-analyzer-prompt.md 変更）: 依存先 D-001
- D-R-001（手動シナリオテスト確認）: 依存先 D-001, D-002, D-003
- D-004（ドキュメント更新）: 依存先 D-001, D-002, D-003

---

## D-001: SKILL.md の変更（新Step挿入 + 番号繰り下げ + 遷移ロジック更新）

### 対象ファイル
`skills/fs-bugfix-phase1-analysis/SKILL.md`

### サブタスク

| # | サブタスク | 変更項目（delta-design.md対応） | 概要 |
|---|---|---|---|
| 1.1 | 新Step 4 セクション挿入 | 新規追加 §1 | Step 3 と 現Step 4 の間に「## Step 4: 再現性確認・原因特定」セクション全体（成果物・完了条件・状態判定）を挿入 |
| 1.2 | 既存 Step 4〜9 タイトル番号繰り下げ | 変更1 | `## Step 4:` → `## Step 5:` 〜 `## Step 9:` → `## Step 10:` のタイトル行変更 |
| 1.3 | レポート記載項目の Step 番号更新 | 変更2 | 各Step内の `(StepN)` 表記を新番号に一括更新 |
| 1.4 | 遷移ロジックの Step 番号更新 | 変更3 | 状態判定セクション内の遷移先Step番号を全件更新 |
| 1.5 | Integration セクション更新 | 変更4 | プロンプトテンプレート一覧に `bugfix-investigator-prompt.md` 追加、既存テンプレートのStep番号更新 |
| 1.6 | 新Step 5 のサブエージェント呼び出し記述更新 | 変更6 | 旧Step 4 の呼び出し記述を `investigation_result` 引き渡し形式に変更 |

### 設計参照
- delta-design.md: 「新規追加の設計 §1」「修正対象の差分設計 変更1〜4, 6」
- 現行 SKILL.md: `skills/fs-bugfix-phase1-analysis/SKILL.md`

### テスト観点（手動シナリオ）
- impact-analysis.md R-1: Step 3 PASS → 新Step 4 への遷移が正しいこと
- impact-analysis.md R-2: 新Step 5（旧Step 4: 原因分析）のサブエージェント呼び出し・完了判定が正常動作すること
- impact-analysis.md R-3: 新Step 6（旧Step 5: ユーザー承認）→ Step 7 遷移が正しいこと
- impact-analysis.md R-4: 新Step 9（旧Step 8: レビュー）FAIL時の再実行遷移が正しいこと
- impact-analysis.md R-5: 新Step 10（旧Step 9: ユーザー承認）修正要求時の遷移が正しいこと
- impact-analysis.md R-6: Step 10 完了後 → 後処理への遷移が正しいこと
- impact-analysis.md T-1: 新Step 4 の bugfix-investigator-prompt.md 呼び出しとレポート記録が正常であること
- impact-analysis.md T-4: investigation_result が bugfix-analyzer-prompt.md に正しく渡されること

### 実装順序の注意
- サブタスク 1.1（新Step挿入）→ 1.2（タイトル繰り下げ）→ 1.3（記載項目番号）→ 1.4（遷移ロジック）→ 1.5（Integration）→ 1.6（呼び出し更新）の順で実施すること
- 番号繰り下げは機械的だが漏れに注意。全Step（4→5, 5→6, 6→7, 7→8, 8→9, 9→10）を確実に変更する

---

## D-002: bugfix-investigator-prompt.md の新規作成

### 対象ファイル
`skills/fs-bugfix-phase1-analysis/bugfix-investigator-prompt.md`（新規作成）

### サブタスク

| # | サブタスク | 変更項目（delta-design.md対応） | 概要 |
|---|---|---|---|
| 2.1 | プロンプトテンプレート全文の作成 | 新規追加 §2 | delta-design.md「2. bugfix-investigator-prompt.md の設計」のプロンプト構造に従い、全文を新規作成 |

### 設計参照
- delta-design.md: 「新規追加の設計 §2」（プロンプト構造のMarkdownブロック全文）

### テスト観点（手動シナリオ）
- impact-analysis.md T-1: bugfix-investigator-prompt.md が正しく呼び出され、再現性判定結果・原因候補がレポートに記録されること
- impact-analysis.md T-2: 再現性あり → 仮実装検証フロー（fix ブランチ作成→仮実装→元ブランチ復帰）が正しく動作すること
- impact-analysis.md T-3: 再現性なし → 環境要因収集フローで DONE_WITH_CONCERNS 完了し環境情報が記録されること
- impact-analysis.md T-5: NEEDS_CONTEXT 時にサブエージェントが再実行されること
- impact-analysis.md T-6: BLOCKED 時にユーザーに報告され対応方針確認が行われること

### 実装上の注意
- ファイルは50行を超えるため、Write + Append で分割書き込みすること（dev-environment.md ファイル書き込みルール準拠）
- delta-design.md のプロンプト構造（Markdownブロック内容）をそのまま忠実に再現すること

---

## D-003: bugfix-analyzer-prompt.md の変更（入力パラメータ追加）

### 対象ファイル
`skills/fs-bugfix-phase1-analysis/bugfix-analyzer-prompt.md`

### 依存先
- D-001 完了後に実施（SKILL.md の新Step構造が確定してから整合を取るため）

### サブタスク

| # | サブタスク | 変更項目（delta-design.md対応） | 概要 |
|---|---|---|---|
| 3.1 | 入力情報セクションに investigation_result プレースホルダー追加 | 変更5 | `## 入力情報` セクションに `- **investigation_result**: {investigation_result}` を追加 |
| 3.2 | 再現性確認結果の説明サブセクション追加 | 変更5 | `### 再現性確認・原因特定Stepの結果（investigation_result）` サブセクション全文を追加 |
| 3.3 | 仮実装コード流用禁止警告の追加 | 変更5 | `⚠️ **仮実装コード流用禁止**` 警告テキストを追加 |

### 設計参照
- delta-design.md: 「修正対象の差分設計 変更5」（before/after が明示されている）

### テスト観点（手動シナリオ）
- impact-analysis.md T-4: investigation_result が bugfix-analyzer-prompt.md に正しく渡されること
- impact-analysis.md R-2: 新Step 5（原因分析）のサブエージェント呼び出しが正常動作すること（入力パラメータ増加後も既存機能が壊れないこと）

---

## D-R-001: リグレッションテスト観点（手動シナリオテスト）

### 依存先
- D-001, D-002, D-003 全て完了後

### テスト観点一覧

以下は impact-analysis.md のテスト対象機能セクションに基づく手動シナリオテスト観点である。本変更はスキル定義（Markdown）の変更のため、自動テストは存在しない。

#### 新規テスト

| # | テスト観点 | 確認方法 |
|---|---|---|
| T-1 | 新Step 4 正常フロー: bugfix-investigator-prompt.md 呼び出し → レポート記録 | バグ修正WF実行時に Step 4 でサブエージェントが起動し、再現性判定結果・原因候補がレポートに記載されることを確認 |
| T-2 | 再現性あり → 仮実装検証フロー | fix ブランチ作成→仮実装→検証→元ブランチ復帰の一連フローを確認 |
| T-3 | 再現性なし → 環境要因収集フロー | DONE_WITH_CONCERNS で完了し、環境情報収集結果がレポートに記録されることを確認 |
| T-4 | 知見引き継ぎ: Step 4 → Step 5 | investigation_result が bugfix-analyzer-prompt.md に渡されることを確認 |
| T-5 | NEEDS_CONTEXT 時の再実行 | 不足情報補完後にサブエージェントが再実行されることを確認 |
| T-6 | BLOCKED 時のユーザー通知 | ユーザーに報告・対応方針確認が行われることを確認 |

#### リグレッションテスト

| # | テスト観点 | リスク |
|---|---|---|
| R-1 | Step 3 PASS → Step 4 遷移 | 低 |
| R-2 | Step 5（旧Step 4: 原因分析）正常動作 | 中 |
| R-3 | Step 6（旧Step 5）→ Step 7 遷移 | 低 |
| R-4 | Step 9（旧Step 8）FAIL → Step 9 再実行 | 中 |
| R-5 | Step 10（旧Step 9）修正要求 → Step 9 戻り | 中 |
| R-6 | Step 10 完了 → 後処理遷移 | 低 |
| R-7 | Phase間インターフェース（Phase1→Phase2）正常起動 | 低 |

---

## D-004: ドキュメント更新

### 依存先
- D-001, D-002, D-003 全て完了後

### サブタスク

| # | サブタスク | 対象ファイル | 概要 |
|---|---|---|---|
| 4.1 | Phase1 Step構成記述の更新 | `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | 新Step追加・番号繰り下げに合わせてStep構成記述を更新 |
| 4.2 | WF全体のStep概要記述の更新 | `docs-dev/02-ai-agent/01-workflows/06-bugfix.md` | 新Step追加に合わせてワークフロー概要を更新 |
| 4.3 | プログラム構成書の整合更新 | `.aide/specs/aide-powers/program-structure.md` | プロンプトテンプレート一覧に bugfix-investigator-prompt.md 追記、Step番号更新 |

### 設計参照
- delta-design.md: 「更新が必要な設計資料」セクション

### テスト観点
- ドキュメント間の Step 番号・プロンプトテンプレート名の整合性確認（目視レビュー）

---

## 実装順序サマリー

| 順序 | タスク | 並列可否 |
|---|---|---|
| 1 | D-001（SKILL.md 変更） | ✅ D-002 と並列可能 |
| 1 | D-002（bugfix-investigator-prompt.md 新規作成） | ✅ D-001 と並列可能 |
| 2 | D-003（bugfix-analyzer-prompt.md 変更） | ❌ D-001 完了後 |
| 3 | D-R-001（手動シナリオテスト確認） | ❌ D-001, D-002, D-003 完了後 |
| 4 | D-004（ドキュメント更新） | ❌ D-001, D-002, D-003 完了後 |

---

## 変更項目網羅性チェック

| delta-design.md 変更項目 | 対応タスク | ステータス |
|---|---|---|
| 新規追加 §1: 新Step 4 セクション | D-001 (1.1) | ✅ |
| 新規追加 §2: bugfix-investigator-prompt.md | D-002 (2.1) | ✅ |
| 変更1: Step番号繰り下げ | D-001 (1.2) | ✅ |
| 変更2: レポート記載項目のStep番号更新 | D-001 (1.3) | ✅ |
| 変更3: 遷移ロジックの更新 | D-001 (1.4) | ✅ |
| 変更4: Integrationセクション更新 | D-001 (1.5) | ✅ |
| 変更5: bugfix-analyzer-prompt.md 入力追加 | D-003 (3.1, 3.2, 3.3) | ✅ |
| 変更6: 新Step 5 サブエージェント呼び出し更新 | D-001 (1.6) | ✅ |
| ドキュメント更新: bugfix.md (phase-skills) | D-004 (4.1) | ✅ |
| ドキュメント更新: 06-bugfix.md (workflows) | D-004 (4.2) | ✅ |
| ドキュメント更新: program-structure.md | D-004 (4.3) | ✅ |
