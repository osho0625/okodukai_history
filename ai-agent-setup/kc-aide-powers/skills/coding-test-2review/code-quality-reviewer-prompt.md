# Code Quality Reviewer Prompt Template（coding-test-2review 用）

code-review-agent（agents/ 配下の名前付きエージェント）を呼び出す際のプロンプト構築テンプレート。

coding-test-2review では **combined モード（実装＋テストを一括レビュー）** を使う。下記の mode: implementation / mode: test は観点の内訳であり、combined では両方を1回のレビューで適用する。

coding-test-2review 固有: レビューは「設計準拠レビュー」と**並列起動**される独立工程である（前提: 対象タスクの実装・テスト実装・テスト実行が PASS していること）。code-review-agent は**自分が担当した工程行（`{task_id}::quality_review`）のみ**を CF-5 の 3 段階（開始 🔄 / 完了 ✅＋output / 失敗 ❌＋output）で更新する（他工程・他タスクの行に触れない。更新前に Read で読み直す）。

---

## mode: combined（実装＋テスト一括レビュー）※coding-test-2review で使用

```
### レビューモード
combined（実装のコード品質・エラーハンドリング + テストの方針準拠を一括でレビューする）

### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）

### 対象ファイル
- 実装ファイル: {target_file}
- テストファイル: {test_file}

### 設計書（Raisesセクション参照用）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}

### 参照ファイル（既存規約）
- {reference_files: 同レイヤーの既存コードファイル}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::quality_review`（工程「コード品質レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）

## CRITICAL: Do Not Trust the Report
実装者の報告を信用しない。コードを自分の目で確認すること。

## レビュー観点（実装コード — 品質）
命名規約 / ファイルサイズ / 1ファイル1クラス / 型ヒント / docstring / コメント品質 / SOLID原則 / マジックナンバー・過度なネスト・未使用import / if-elif-else網羅性 / 過去不具合再発チェック / ダミー実装検出 / デッドコード排除

## レビュー観点（実装コード — エラーハンドリング）
レイヤー間例外変換 / 例外ラップの正確性（cause） / Raises仕様一致 / try-exceptの適切性（bare except禁止・もみ消し防止） / ログ品質 / エラーメッセージ品質

## レビュー観点（テストコード — 方針準拠）
パブリックメソッドのテスト必須 / テスト命名規則 / テスト独立性 / モック・スタブ使用禁止（unittest.mock の import があれば即 ERROR） / 境界値テスト / 異常系テスト（assertRaises）

## 判定 / 報告フォーマット
- コード品質（実装）: PASS / FAIL（ERROR N件, WARNING N件）
- エラーハンドリング（実装）: PASS / FAIL（ERROR N件）
- テスト方針準拠（テスト）: PASS / FAIL（違反N件）
- 詳細（FAILの場合）/ サマリ
- ERROR・違反が合計0件 → PASS、1件以上 → FAIL（WARNING も修正対象。詳細は code-review-agent のルールに従う）
```

---

## mode: implementation（実装コードレビュー）※観点の内訳

```
### レビューモード
implementation

### タスク情報
- タスク番号: {task_id}

### 対象ファイル
- {target_file}

### 設計書（Raisesセクション参照用）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}

### 参照ファイル（既存規約）
- {reference_files: 同レイヤーの既存コードファイル}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::quality_review`（工程「コード品質レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）

## CRITICAL: Do Not Trust the Report
実装者の報告を信用しない。コードを自分の目で確認すること。

## レビュー観点（コード品質）
命名規約 / ファイルサイズ / 1ファイル1クラス / 型ヒント / docstring / コメント品質 / SOLID原則 / マジックナンバー・過度なネスト・未使用import / if-elif-else網羅性 / 過去不具合再発チェック / ダミー実装検出 / デッドコード排除

## レビュー観点（エラーハンドリング）
レイヤー間例外変換 / 例外ラップの正確性（cause） / Raises仕様一致 / try-exceptの適切性（bare except禁止・もみ消し防止） / ログ品質 / エラーメッセージ品質

## 判定 / 報告フォーマット
- コード品質: PASS / FAIL（ERROR N件, WARNING N件）
- エラーハンドリング: PASS / FAIL（ERROR N件）
- 詳細（FAILの場合）/ サマリ
- ERROR 0件 → PASS、1件以上 → FAIL（WARNING も修正対象。詳細は code-review-agent のルールに従う）
```

---

## mode: test（テストコードレビュー）

```
### レビューモード
test

### タスク情報
- タスク番号: {task_id}

### 対象ファイル
- {test_file}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::quality_review`（工程「コード品質レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）

## レビュー観点
0. パブリックメソッドのテスト必須
1. テスト命名規則
2. テスト独立性
3. モック・スタブ使用禁止（unittest.mock の import があれば即 ERROR）
4. 境界値テスト
5. 異常系テスト（assertRaises）

## 判定
違反0件 → PASS、1件以上 → FAIL
```
