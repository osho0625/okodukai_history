# 差分設計: coding-test-2review（本体＋3プロンプト）

対象ファイル: `skills/coding-test-2review/SKILL.md`, `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`（計4件、すべて既存変更）

## 1. skills/coding-test-2review/SKILL.md

### 1-1. 入力パラメータ表から bugfix_dir を削除

**before:**
```
# 入力

| パラメータ | 説明 |
|---|---|
| task_list_path | タスクリストのパス（例: `{changes_dir}/delta-task-list.md`）。各タスクの「依存先」「状態」を持つ |
| process_checklist_path | 工程チェック表のパス（例: `{changes_dir}/impl-process-checklist.md`） |
| design_doc_paths | **実装の根拠となる設計書群のパス**（呼び出し元のワークフローに応じて渡す。変更WF: `delta-design.md`／実装WF: `object-design-*.md` 等／バグ修正WF: `fix-design.md`／リファクタリングWF: `refactoring-design.md`）。各タスクの `design_refs` はここから**該当セクションを絞って**渡す元になる |
| doc_index_path | doc-index.md のパス（dev-environment.md・program-structure.md・既存設計書・既存コード規約の所在把握用） |
| pending_issues_path | pending-issues.md のパス（記録先）。実装・テスト・レビュー中にサブエージェントが発見したスコープ外の問題・設計欠陥・別件不具合を随時記録する先（呼び出し元のワークフローが渡す） |
| bugfix_dir | 過去不具合履歴ディレクトリのパス（任意。task_kind が bugfix / refactoring のとき呼び出し元が渡す）。過去に修正したバグの再混入（regression）検出に使用する。normal/change では渡されない（その場合 preservation check はスキップ） |

> 設計書を渡さずに実装させてはならない。design_doc_paths は必須入力である。
```

**after:**
```
# 入力

| パラメータ | 説明 |
|---|---|
| task_list_path | タスクリストのパス（例: `{changes_dir}/delta-task-list.md`）。各タスクの「依存先」「状態」を持つ |
| process_checklist_path | 工程チェック表のパス（例: `{changes_dir}/impl-process-checklist.md`） |
| design_doc_paths | **実装の根拠となる設計書群のパス**（呼び出し元のワークフローに応じて渡す。変更WF: `delta-design.md`／実装WF: `object-design-*.md` 等／バグ修正WF: `fix-design.md`／リファクタリングWF: `refactoring-design.md`）。各タスクの `design_refs` はここから**該当セクションを絞って**渡す元になる |
| doc_index_path | doc-index.md のパス（dev-environment.md・program-structure.md・既存設計書・既存コード規約の所在把握用） |
| pending_issues_path | pending-issues.md のパス（記録先）。実装・テスト・レビュー中にサブエージェントが発見したスコープ外の問題・設計欠陥・別件不具合を随時記録する先（呼び出し元のワークフローが渡す） |

> 設計書を渡さずに実装させてはならない。design_doc_paths は必須入力である。
```

**変更理由**: REQ-C-001（実装ステップ内リグレッションテスト廃止）に基づき、preservation check 用の `bugfix_dir` パラメータを入力定義から削除する。リグレッションテストは動作確認Step（REQ-C-002）に一本化され、taskごとの実装ステップでは過去バグの再混入検出（preservation check）を行わなくなるため、本パラメータは不要になる。

### 1-2. 「工程: テスト実装」の preservation check 記述を削除

**before:**
```
### 工程: テスト実装
- エージェント: `micro-impl-agent (aide-powers agent)`（mode: write_test）
- プロンプト: `implementer-prompt.md`（mode: write_test）。テスト観点は設計書から転記
- **起動タイミング**: 前提工程なし（設計書のテスト観点起点で実装非依存）。同一タスクの「実装」と並列起動してよい
- **preservation check（過去不具合の再混入検出）**: task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、bugfix_dir 配下の修正済みバグ記録に対するリグレッションテストを含める（過去バグが再発しないことを保証する）
- 工程チェック表: micro-impl-agent に **自分の `write_test` 工程行** を 3 段階で更新させる
- 判定: DONE / DONE_WITH_CONCERNS → PASS
```

**after:**
```
### 工程: テスト実装
- エージェント: `micro-impl-agent (aide-powers agent)`（mode: write_test）
- プロンプト: `implementer-prompt.md`（mode: write_test）。テスト観点は設計書から転記
- **起動タイミング**: 前提工程なし（設計書のテスト観点起点で実装非依存）。同一タスクの「実装」と並列起動してよい
- 工程チェック表: micro-impl-agent に **自分の `write_test` 工程行** を 3 段階で更新させる
- 判定: DONE / DONE_WITH_CONCERNS → PASS
```

**変更理由**: REQ-C-001。過去不具合の再混入検出（preservation check）は実装ステップ内の毎回実行に相当するため廃止する。バグ修正WFのリグレッションテスト（既存テスト全実行）は動作確認Stepの `regression-test-prompt.md` に一本化される。

### 1-3. 「工程: 設計準拠レビュー」「工程: コード品質レビュー」の preservation check 記述を削除

**before（設計準拠レビュー）:**
```
### 工程: 設計準拠レビュー（実装＋テストをまとめてレビュー）
- エージェント: `design-review-agent (aide-powers agent)`
- プロンプト: 本スキルディレクトリの `spec-reviewer-prompt.md`
- **実装コードとテストコードをまとめて1回でレビューする**（工程効率化）。実装の設計準拠（クラス/メソッドシグネチャ/内部ロジック意図/不変条件/import ルール）と、テストの網羅性（設計書のテスト観点を全てカバーしているか）を一括で検証する。target_file と test_file の両方を渡す
- **起動タイミング**: 対象タスクの「テスト実行」工程行が `✅ done` の後（＝実装・テストが揃っている）。**「コード品質レビュー」と並列起動する**
- **preservation check（過去不具合の再混入検出）**: task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、過去に修正したバグが再混入していないこと、および過去バグに対するリグレッションテストが存在することを検証観点に加える
- 工程チェック表: design-review-agent に **自分の `spec_review` 工程行** を 3 段階で更新させる
```

**after（設計準拠レビュー）:**
```
### 工程: 設計準拠レビュー（実装＋テストをまとめてレビュー）
- エージェント: `design-review-agent (aide-powers agent)`
- プロンプト: 本スキルディレクトリの `spec-reviewer-prompt.md`
- **実装コードとテストコードをまとめて1回でレビューする**（工程効率化）。実装の設計準拠（クラス/メソッドシグネチャ/内部ロジック意図/不変条件/import ルール）と、テストの網羅性（設計書のテスト観点を全てカバーしているか）を一括で検証する。target_file と test_file の両方を渡す
- **起動タイミング**: 対象タスクの「テスト実行」工程行が `✅ done` の後（＝実装・テストが揃っている）。**「コード品質レビュー」と並列起動する**
- 工程チェック表: design-review-agent に **自分の `spec_review` 工程行** を 3 段階で更新させる
```

**before（コード品質レビュー）:**
```
### 工程: コード品質レビュー（実装＋テストをまとめてレビュー）
- エージェント: `code-review-agent (aide-powers agent)`
- プロンプト: 本スキルディレクトリの `code-quality-reviewer-prompt.md`
- **実装コードとテストコードをまとめて1回でレビューする**（工程効率化）。実装のコード品質・エラーハンドリングと、テストの方針準拠（命名規則・独立性・モック禁止・境界値・異常系）を一括で検証する。target_file と test_file の両方を渡す
- **起動タイミング**: 対象タスクの「テスト実行」工程行が `✅ done` の後（＝実装・テストが揃っている）。**「設計準拠レビュー」と並列起動する**
- **preservation check（過去不具合の再混入検出）**: task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、過去に修正したバグが再混入していないこと、および過去バグに対するリグレッションテストが存在することを検証観点に加える
- 工程チェック表: code-review-agent に **自分の `quality_review` 工程行** を 3 段階で更新させる
```

**after（コード品質レビュー）:**
```
### 工程: コード品質レビュー（実装＋テストをまとめてレビュー）
- エージェント: `code-review-agent (aide-powers agent)`
- プロンプト: 本スキルディレクトリの `code-quality-reviewer-prompt.md`
- **実装コードとテストコードをまとめて1回でレビューする**（工程効率化）。実装のコード品質・エラーハンドリングと、テストの方針準拠（命名規則・独立性・モック禁止・境界値・異常系）を一括で検証する。target_file と test_file の両方を渡す
- **起動タイミング**: 対象タスクの「テスト実行」工程行が `✅ done` の後（＝実装・テストが揃っている）。**「設計準拠レビュー」と並列起動する**
- 工程チェック表: code-review-agent に **自分の `quality_review` 工程行** を 3 段階で更新させる
```

**変更理由**: REQ-C-001。両レビューの preservation check 観点（過去バグの再混入・リグレッションテスト存在確認）は実装ステップ内の毎タスク実行にあたるため廃止する。

### 1-4. エージェント呼び出しペイロード表から bugfix_dir 行を削除

**before:**
```
## エージェント呼び出しペイロード（全工程共通の必須項目）

各サブエージェントには、対象タスク1つ分の以下の情報だけを渡す（最小化）:

- **task_id**: タスクリストのサブタスクID
- **task_title**: サブタスクのタイトル
- **target_file**: 対象ファイル（1ファイルのみ）
- **test_file**: テストファイル（プログラムコードの場合）
- **design_refs**: **design_doc_paths の該当設計書ファイルパス + セクション名**（doc_index_path で所在を確認し、該当タスクのセクションだけに絞る。設計書全体を渡さない）
- **test_perspectives**: テスト観点（設計書から転記。リグレッションテスト観点含む）
- **dependencies**: 依存先（既に完了済みのクラス/モジュールのファイルパス）
- **reference_files**: 参照ファイル（既存規約。同レイヤーの既存コード。命名・エラーハンドリング・スタイルの参考。doc_index_path / program-structure.md から特定）
- **dev_environment**: dev-environment.md のパス（doc_index_path から特定）
- **process_checklist_path**: 工程チェック表のパス（**自分が担当した工程行**の 3 段階更新用。行キーは `{task_id}::{工程キー}`）
- **process_row_key**: 当該サブエージェントが更新すべき工程行の行キー（例: `1.1::implement`）。担当本人はこの行のみを最小編集する
- **pending_issues_path**: pending-issues.md のパス（工程中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
- **task_kind**: タスク種別（normal / bugfix / change / refactoring）
- **bugfix_dir**: 過去不具合履歴ディレクトリのパス（task_kind が bugfix / refactoring のときのみ。それ以外は省略）
```

**after:**
```
## エージェント呼び出しペイロード（全工程共通の必須項目）

各サブエージェントには、対象タスク1つ分の以下の情報だけを渡す（最小化）:

- **task_id**: タスクリストのサブタスクID
- **task_title**: サブタスクのタイトル
- **target_file**: 対象ファイル（1ファイルのみ）
- **test_file**: テストファイル（プログラムコードの場合）
- **design_refs**: **design_doc_paths の該当設計書ファイルパス + セクション名**（doc_index_path で所在を確認し、該当タスクのセクションだけに絞る。設計書全体を渡さない）
- **test_perspectives**: テスト観点（設計書から転記）
- **dependencies**: 依存先（既に完了済みのクラス/モジュールのファイルパス）
- **reference_files**: 参照ファイル（既存規約。同レイヤーの既存コード。命名・エラーハンドリング・スタイルの参考。doc_index_path / program-structure.md から特定）
- **dev_environment**: dev-environment.md のパス（doc_index_path から特定）
- **process_checklist_path**: 工程チェック表のパス（**自分が担当した工程行**の 3 段階更新用。行キーは `{task_id}::{工程キー}`）
- **process_row_key**: 当該サブエージェントが更新すべき工程行の行キー（例: `1.1::implement`）。担当本人はこの行のみを最小編集する
- **pending_issues_path**: pending-issues.md のパス（工程中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
- **task_kind**: タスク種別（normal / bugfix / change / refactoring）
```

**変更理由**: REQ-C-001・REQ-C-003。preservation check 廃止に伴い bugfix_dir 受け渡しが不要になる。test_perspectives の説明文からも「リグレッションテスト観点含む」を削除する（実装ステップ内でのリグレッションテスト観点収集は不要になるため）。

### 1-5. Red Flags 表から bugfix_dir 関連行を削除

**before:**
```
| 「設計書全体をエージェントに渡そう」と考えた | STOP。design_refs はセクションを絞って渡す（※親タスク完了チェックは例外で、当該親タスクのセクション全体を渡す） |
| 「全サブタスクが PASS したから親タスクをそのまま完了にしよう」と考えた | STOP。親タスク完了チェック（セクション全体 vs 実装の holistic 照合）を通すまで親タスクを完了にしてはならない |
| 「親タスク完了チェックで漏れが見つかったが軽微だから記録だけして完了にしよう」と考えた | STOP。漏れは新規サブタスクとして task_list と工程チェック表に追加し、次ウェーブで通常工程を通す |
| 「スコープ外の問題を見つけたが現在のタスクで直してしまおう」と考えた | STOP。pending_issues_path に記録し、現在の実装を完遂する。別ワークフロー起動も禁止 |
| task_kind=bugfix/refactoring なのに過去不具合の再混入確認を省略しようとした | STOP。bugfix_dir の過去バグ記録に対する再混入検出（preservation check）を必ず実施する |
```

**after:**
```
| 「設計書全体をエージェントに渡そう」と考えた | STOP。design_refs はセクションを絞って渡す（※親タスク完了チェックは例外で、当該親タスクのセクション全体を渡す） |
| 「全サブタスクが PASS したから親タスクをそのまま完了にしよう」と考えた | STOP。親タスク完了チェック（セクション全体 vs 実装の holistic 照合）を通すまで親タスクを完了にしてはならない |
| 「親タスク完了チェックで漏れが見つかったが軽微だから記録だけして完了にしよう」と考えた | STOP。漏れは新規サブタスクとして task_list と工程チェック表に追加し、次ウェーブで通常工程を通す |
| 「スコープ外の問題を見つけたが現在のタスクで直してしまおう」と考えた | STOP。pending_issues_path に記録し、現在の実装を完遂する。別ワークフロー起動も禁止 |
```

**変更理由**: REQ-C-001。preservation check 廃止に伴い該当の Red Flag 行が不要になる。

### 1-6. Integration 節: Global rules の直前にある補足なし（変更なし）。Called by の直下の Required agents 節も変更なし（preservation check 記述がないため）

**確認結果**: Integration 節には preservation check・bugfix_dir に関する直接記述がないため、この節自体の変更は不要。

---

## 2. skills/coding-test-2review/implementer-prompt.md

### 2-1. mode: write_test — task_kind/bugfix_dir 見出し行と preservation check ルールを削除

**before:**
```
## mode: write_test（テスト作成）

```
### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）
- 過去不具合履歴ディレクトリ: {bugfix_dir}（task_kind が bugfix / refactoring のときのみ。それ以外は「なし」）

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
- **preservation check（過去不具合の再混入検出）**: task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、bugfix_dir 配下の過去修正済みバグ記録を確認し、それらのバグが再発しないことを保証するリグレッションテストを追加する

## 報告フォーマット
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- テスト内容 / 変更ファイル / 工程チェック表の更新内容 / 懸念事項（該当時）
```
```

**after:**
```
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
```

**変更理由**: REQ-C-001。preservation check 記述・bugfix_dir 見出し行を削除する。task_kind 見出し行自体はタスク種別の識別に使われる可能性があるため維持する（例: 動作確認Step側のリグレッションテストで task_kind を参照するケースはないが、他の観点で参照される可能性を排除しないため、task_kind 行は残す。bugfix_dir 行のみ削除）。

### 2-2. mode: run_test — テスト実行コマンドから全体リグレッションを削除し「ユニットテスト」に統一

**before:**
```
## mode: run_test（テスト実行）

```
### タスク情報
- タスク番号: {task_id}

### 実行モード
run_test

### 対象ファイル
- テストファイル: {test_file}

### テスト実行コマンド（必須）
- 対象テスト: {dev-environment.md に記載のテスト実行コマンド} {test_file}
- 全体リグレッション: {dev-environment.md に記載のテスト実行コマンド}
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {dev_environment}

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::run_test`（工程「テスト実行」）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）

## テスト実行ルール
- **前提（維持）**: テスト実行は、同一タスクの「実装」と「テスト実装」の両工程行が `✅ done`（テスト実装の後）になってから実施する。テスト実行は並列対象外
- 対象テスト + 全体リグレッションを実行し全パスを確認
- 失敗があれば原因特定 → 修正、外部ライブラリ起因は即報告、3回で解決しなければ報告
- **テスト実行結果をもとにテスト構成をチェックする**: 実行されたテスト数・パス/失敗が、設計書のテスト観点（境界値・異常系含む）を実際に網羅・実行できているかを確認する。観点に対してテストが実行されていない・空振りしている等の構成不備があれば報告する（テスト構成不備は FAIL 扱い）

## 報告フォーマット
- Status: DONE（全パス＆テスト構成妥当）/ DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- テスト実行結果（パス数/失敗数）/ テスト構成チェック結果（観点網羅の妥当性）/ 失敗・構成不備の詳細（該当時）/ 工程チェック表の更新内容
```
```

**after:**
```
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
```

**変更理由**: REQ-C-001・REQ-C-003。実装ステップ内での全体リグレッション実行を廃止し、対象タスクのユニットテストのみ実行する設計に変更する。用語も「対象テスト」→「ユニットテスト」に統一する（REQ-C-003）。全体リグレッション（既存テスト全実行）は動作確認Stepの `regression-test-prompt.md` に一本化される。

---

## 3. skills/coding-test-2review/spec-reviewer-prompt.md

### 3-1. mode: combined — task_kind/bugfix_dir 見出し行、preservation check セクション、出力フォーマット行を削除

**before:**
```
## mode: combined（実装＋テスト一括レビュー）※coding-test-2review で使用

```
### レビューモード
combined（実装の設計準拠 + テストの網羅性を一括でレビューする）

### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）
- 過去不具合履歴ディレクトリ: {bugfix_dir}（task_kind が bugfix / refactoring のときのみ。それ以外は「なし」）

### 対象ファイル
- 実装ファイル: {target_file}
- テストファイル: {test_file}

### 設計書（照合元）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}
- {プログラム構成書ファイルパス} → セクション: importルール

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::spec_review`（工程「設計準拠レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）

## CRITICAL: Do Not Trust the Report
実装者の報告を信用しない。設計書・実装コード・テストコードを自分の目で照合すること。

## レビュー観点（実装コード — 設計準拠）
1. 内部ロジック意図検証（最優先）
2. クラス存在 / メソッドシグネチャ / コンストラクタ / 処理フロー / 不変条件チェック
3. 設計書全項目チェック（設計書該当セクションの全項目が実装で対応されているか。1つでも ❌ なら FAIL）
4. 過去不具合修正の保持検証（bugfix/ 配下があれば目視確認）
5. 設計書にないものの検出
6. importルールチェック（レイヤー間依存方向）

## レビュー観点（テストコード — 網羅性）
7. パブリックメソッドのテスト必須
8. テストケース網羅性（設計書テスト観点の全ケースをカバーしているか）
9. 境界値テスト / 異常系テスト（Raises 全例外）

## preservation check（過去不具合の再混入検出）
task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、bugfix_dir 配下の過去修正済みバグ記録を確認し、(a) 今回の実装が過去に修正したバグを再混入させていないか、(b) 過去バグに対するリグレッションテストが存在するか、を検証する。再混入またはリグレッションテスト欠落を検出したら FAIL とする。

## 乖離種別判定ルール
差分を検出した場合、以下の二択で判定する:
- **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
- **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新
importルール違反は設計漏れ判定の対象外（常に FAIL_IMPL として実装修正が必要）。

## 判定 / 報告フォーマット
- 設計準拠（実装）: PASS / FAIL（差分N件）
- importルール: PASS / FAIL（違反N件）
- テスト網羅性: PASS / FAIL（未カバーN件）
- preservation check: PASS / FAIL（再混入・リグレッションテスト欠落N件）/ N/A（task_kind が normal/change、または bugfix_dir 未指定）
- 差分・未カバーの詳細（FAILの場合。各差分に FAIL_IMPL / FAIL_DESIGN を付記）/ サマリ
- 実装の差分・テストの未カバー・preservation check 違反が合計0件 → PASS、1件以上 → FAIL_IMPL または FAIL_DESIGN
```
```

**after:**
```
## mode: combined（実装＋テスト一括レビュー）※coding-test-2review で使用

```
### レビューモード
combined（実装の設計準拠 + テストの網羅性を一括でレビューする）

### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）

### 対象ファイル
- 実装ファイル: {target_file}
- テストファイル: {test_file}

### 設計書（照合元）
- {design_refs: 設計書ファイルパス} → セクション: {該当変更項目/クラス名}
- {プログラム構成書ファイルパス} → セクション: importルール

### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::spec_review`（工程「設計準拠レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）

## CRITICAL: Do Not Trust the Report
実装者の報告を信用しない。設計書・実装コード・テストコードを自分の目で照合すること。

## レビュー観点（実装コード — 設計準拠）
1. 内部ロジック意図検証（最優先）
2. クラス存在 / メソッドシグネチャ / コンストラクタ / 処理フロー / 不変条件チェック
3. 設計書全項目チェック（設計書該当セクションの全項目が実装で対応されているか。1つでも ❌ なら FAIL）
4. 過去不具合修正の保持検証（bugfix/ 配下があれば目視確認）
5. 設計書にないものの検出
6. importルールチェック（レイヤー間依存方向）

## レビュー観点（テストコード — 網羅性）
7. パブリックメソッドのテスト必須
8. テストケース網羅性（設計書テスト観点の全ケースをカバーしているか）
9. 境界値テスト / 異常系テスト（Raises 全例外）

## 乖離種別判定ルール
差分を検出した場合、以下の二択で判定する:
- **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
- **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新
importルール違反は設計漏れ判定の対象外（常に FAIL_IMPL として実装修正が必要）。

## 判定 / 報告フォーマット
- 設計準拠（実装）: PASS / FAIL（差分N件）
- importルール: PASS / FAIL（違反N件）
- テスト網羅性: PASS / FAIL（未カバーN件）
- 差分・未カバーの詳細（FAILの場合。各差分に FAIL_IMPL / FAIL_DESIGN を付記）/ サマリ
- 実装の差分・テストの未カバーが合計0件 → PASS、1件以上 → FAIL_IMPL または FAIL_DESIGN
```
```

**変更理由**: REQ-C-001。過去不具合の再混入検出（preservation check）は動作確認Stepのリグレッションテスト実行エージェントに一本化されるため、実装ステップ内の毎タスクレビューからは廃止する。「過去不具合修正の保持検証」（レビュー観点4）自体は preservation check とは異なる観点（設計書全項目チェックの一部として、既存の修正済みバグ関連コードが実装から欠落していないかの目視確認）であり、REQ-C-001 の対象外のため維持する（過去バグの再混入を「実行して検出」するのが preservation check、「実装コードを読んで検出」するのがレビュー観点4であり、後者は今回廃止対象に含まれない）。

> **注記**: `mode: implementation` と `mode: test`（観点の内訳セクション）には元々 preservation check の直接記述がないため変更不要。

---

## 4. skills/coding-test-2review/code-quality-reviewer-prompt.md

### 4-1. mode: combined — task_kind/bugfix_dir 見出し行、preservation check セクション、出力フォーマット行を削除

**before:**
```
## mode: combined（実装＋テスト一括レビュー）※coding-test-2review で使用

```
### レビューモード
combined（実装のコード品質・エラーハンドリング + テストの方針準拠を一括でレビューする）

### タスク情報
- タスク番号: {task_id}
- タスク種別: {task_kind}（normal / bugfix / change / refactoring）
- 過去不具合履歴ディレクトリ: {bugfix_dir}（task_kind が bugfix / refactoring のときのみ。それ以外は「なし」）

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

## preservation check（過去不具合の再混入検出）
task_kind が bugfix / refactoring かつ bugfix_dir が渡された場合、bugfix_dir 配下の過去修正済みバグに対するリグレッションテストが網羅されているかを検証し、欠落していれば ERROR とする。

## 判定 / 報告フォーマット
- コード品質（実装）: PASS / FAIL（ERROR N件, WARNING N件）
- エラーハンドリング（実装）: PASS / FAIL（ERROR N件）
- テスト方針準拠（テスト）: PASS / FAIL（違反N件）
- preservation check: PASS / FAIL（リグレッションテスト欠落 ERROR N件）/ N/A（task_kind が normal/change、または bugfix_dir 未指定）
- 詳細（FAILの場合）/ サマリ
- ERROR・違反が合計0件 → PASS、1件以上 → FAIL（WARNING も修正対象。詳細は code-review-agent のルールに従う）
```
```

**after:**
```
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
```

**変更理由**: REQ-C-001。過去修正済みバグへのリグレッションテスト網羅性検証（preservation check）は動作確認Stepのリグレッションテスト実行エージェントに一本化されるため廃止する。「過去不具合再発チェック」（レビュー観点「品質」欄）はコード品質観点としての静的チェック（ダミー実装検出と同種の目視確認）であり、動的なテスト実行結果を扱う preservation check とは異なるため維持する。

> **注記**: `mode: implementation` と `mode: test`（観点の内訳セクション）には元々 preservation check の直接記述がないため変更不要。
