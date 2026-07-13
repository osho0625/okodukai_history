# Implementer Prompt Template（coding-test-2review 用）

micro-impl-agent（agents/ 配下の名前付きエージェント）を呼び出す際のプロンプト構築テンプレート。
5つのモード（implement, fix, write_test, fix_test, run_test）に対応する。

coding-test-2review 固有: 各モードで **工程チェック表（impl-process-checklist.md）の自分が担当した工程行（`{task_id}::{工程キー}`）の 3 段階更新（CF-5）** も micro-impl-agent に依頼する。

---

## 共通ルール（全モード）

- 設計参照は **セクションを絞って** 渡す（設計書全体を渡さない）
- 工程チェック表（1 工程 = 1 行）は **自分が担当した工程の行（行キー `{task_id}::{工程キー}`）のみ** を最小編集で更新する（他工程・他タスクの行に触れない。更新前に Read で読み直す）。更新は CF-5 の 3 段階で行う:
  - 【作業開始直後】 自分の工程行の状態を `⬜ todo → 🔄 in-progress`、実行エージェントを自分の名前に
  - 【完了（PASS）】 `🔄 → ✅ done`、output に結果サマリ
  - 【失敗（FAIL）】 `🔄 → ❌ failed`、output にエラー／指摘内容
- 同一タスクの「実装（implement）」と「テスト実装（write_test）」は並列起動されうる。各モードは独立した 1 工程として実行し、自分の工程行のみを更新する（他工程の行に依存・干渉しない）
- 報告 Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED

---

## mode: implement（新規実装）

```
### タスク情報
- タスク番号: {task_id}
- タスク内容: {task_title}

### 実行モード
implement

### 対象ファイル
- 実装ファイル: {target_file}
- テストファイル: {test_file}（なし の場合もある）

### 設計書（読むべきファイルとセクション）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}
- {プログラム構成書ファイルパス} → セクション: ファイル配置・importルール

### テスト観点
{test_perspectives: 設計書から抽出したテストケース一覧をそのまま転記}

### 依存先（実装済みファイル）
- {dependencies}（依存がない場合は「なし」）

### 参照ファイル（既存規約）
- {reference_files: 同レイヤーの既存コードファイル}（命名・エラーハンドリング・スタイルの参考）

### 開発環境情報
- 環境定義ファイル: {dev_environment}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::implement`（工程「実装」）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## 実装ルール
- 設計書を読んでから実装を始めること（設計書を読まずに実装を始めることは禁止）
- 1回の呼び出しで実装するのは1つのpublicメソッド（+ 関連private・ヘルパー）が最大単位
- 1回の呼び出しで変更するファイルは1つだけ
- 設計定義にないメソッド/プロパティを追加しない、設計定義と異なるシグネチャで実装しない

## 報告フォーマット
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- 実装内容 / 変更ファイル / 工程チェック表の更新内容 / 懸念事項（該当時）
```

---

## mode: write_test（テスト作成）

```
### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）

### 実行モード
write_test

### 対象ファイル
- 実装ファイル: {target_file}
- テストファイル: {test_file}

### 設計書（テスト観点の参照元）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}

### テスト観点
{test_perspectives: 設計書から抽出したテストケース一覧をそのまま転記}

### 開発環境情報
- 環境定義ファイル: {dev_environment}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::write_test`（工程「テスト実装」）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## テスト作成ルール
- 設計書のテスト観点の全ケースをカバー、全パブリックメソッドにテスト
- モック・スタブ禁止（unittest.mock は使わない）
- 境界値テスト・異常系テストを含める

## 報告フォーマット
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- テスト内容 / 変更ファイル / 工程チェック表の更新内容 / 懸念事項（該当時）
```

---

## mode: fix（実装のレビュー指摘修正）

```
### タスク情報
- タスク番号: {task_id}

### 実行モード
fix

### 対象ファイル
- 実装ファイル: {target_file}

### レビュー指摘内容
{design-review-agent または code-review-agent の指摘内容をそのまま転記（要約・省略しない）}

### 開発環境情報
- 環境定義ファイル: {dev_environment}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: fix 対象の工程行（再実行で `⬜ todo` に戻された `{task_id}::implement`）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## 修正ルール
- レビュー指摘内容に従って修正、指摘されていない箇所を変更しない

## 報告フォーマット
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- 修正内容 / 変更ファイル / 懸念事項（該当時）
```

---

## mode: fix_test（テストのレビュー指摘修正）

```
### タスク情報
- タスク番号: {task_id}

### 実行モード
fix_test

### 対象ファイル
- テストファイル: {test_file}

### レビュー指摘内容
{レビュー指摘内容をそのまま転記}

### 開発環境情報
- 環境定義ファイル: {dev_environment}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: 再実行で `⬜ todo` に戻された `{task_id}::write_test`
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## 修正ルール
- レビュー指摘内容に従って修正、指摘されていない箇所を変更しない

## 報告フォーマット
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- 修正内容 / 変更ファイル / 懸念事項（該当時）
```

---

## mode: run_test（テスト実行）

```
### タスク情報
- タスク番号: {task_id}

### 実行モード
run_test

### 対象ファイル
- テストファイル: {test_file}

### テスト実行コマンド（必須）
- ユニットテスト: {dev-environment.md に記載のテスト実行コマンド} {test_file}
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {dev_environment}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::run_test`（工程「テスト実行」）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## テスト実行ルール
- **前提（維持）**: テスト実行は、同一タスクの「実装」と「テスト実装」の両工程行が `✅ done`（テスト実装の後）になってから実施する。テスト実行は並列対象外
- ユニットテストを実行し全パスを確認
- 失敗があれば原因特定 → 修正、外部ライブラリ起因は即報告、3回で解決しなければ報告
- **テスト実行結果をもとにテスト構成をチェックする**: 実行されたテスト数・パス/失敗が、設計書のテスト観点（境界値・異常系含む）を実際に網羅・実行できているかを確認する。観点に対してテストが実行されていない・空振りしている等の構成不備があれば報告する（テスト構成不備は FAIL 扱い）

## 報告フォーマット
- Status: DONE（全パス＆テスト構成妥当）/ DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- テスト実行結果（パス数/失敗数）/ テスト構成チェック結果（観点網羅の妥当性）/ 失敗・構成不備の詳細（該当時）/ 工程チェック表の更新内容
```
