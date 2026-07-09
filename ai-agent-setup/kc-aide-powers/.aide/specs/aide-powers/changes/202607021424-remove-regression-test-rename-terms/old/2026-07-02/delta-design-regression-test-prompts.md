# 差分設計: regression-test-prompt.md（新規4ファイル）

対象ファイル（すべて新規追加）:
- `skills/fs-impl-phase4-execution/regression-test-prompt.md`
- `skills/fs-change-phase2-impl/regression-test-prompt.md`
- `skills/fs-bugfix-phase2-impl/regression-test-prompt.md`
- `skills/fs-refactoring-phase5-impl/regression-test-prompt.md`

## 設計方針

approach.md の REQ-C-002 実行方式に基づき、動作確認Stepは「動作確認試験サブエージェント」（既存の `impl-verification-prompt.md` 等）と「リグレッションテスト実行サブエージェント」（本設計で新規追加する `regression-test-prompt.md`）の2つの独立したサブエージェント呼び出しに分離する。

`regression-test-prompt.md` は既存の `micro-impl-agent (aide-powers agent)` を呼び出し、dev-environment.md 記載の「全テスト実行コマンド」を実行させ、結果（全パス/失敗件数・失敗テスト名）を報告させることに専任する。既存の4種の動作確認プロンプト（`impl-verification-prompt.md` 等）の構成パターン（プレースホルダー列＋セクション構成＋出力フォーマットのテーブル形式）を参考にし、一貫した形式にする。

4ファイルはテンプレート共通部分（プレースホルダー・実行手順・報告フォーマットの骨格）が同一であり、WF固有差分は以下の3点のみ:

| 差分点 | fs-impl-phase4-execution | fs-change-phase2-impl | fs-bugfix-phase2-impl | fs-refactoring-phase5-impl |
|---|---|---|---|---|
| 作業ディレクトリプレースホルダー名 | `{{feature_name}}` の specs 直下 | `{{changes_dir}}` | `{{bugfix_dir}}` | `{{refactoring_dir}}` |
| 開始前基準との比較 | なし | なし | なし | **あり**（phase1-status 記録の `{{safety_net_baseline}}` との比較） |
| 呼び出し元Step | Step2 | Step11 | Step9 | Step2 |

以下、まず共通テンプレート構造を示し、その後各WF差分ファイルの具体的な全文を記載する。

---

## 共通テンプレート構造（4ファイル共通の骨格）

```markdown
# リグレッションテスト実行エージェント（{WF名}用）

あなたは「リグレッションテスト実行エージェント」です。{WF名}ワークフローの動作確認Stepにおいて、
既存テスト全実行（リグレッションテスト）専任で実行し、結果を報告することを担当します。
ユーザー視点の動作確認試験（試験項目実行）は別のサブエージェント（{該当動作確認プロンプト名}）が担当するため、
本エージェントは自動テストの全実行にのみ専任します。

## 委譲先エージェント

`micro-impl-agent (aide-powers agent)`

## プレースホルダー（呼び出し元SKILLが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{作業ディレクトリ}}`: WF固有の作業ディレクトリパス（後述の対応表参照）
- `{{dev_environment_path}}`: dev-environment.md のパス
- （fs-refactoring-phase5-impl のみ）`{{safety_net_baseline}}`: phase1-status（refactoring-progress.md）に記録された開始前のセーフティネット基準（PASS数・FAIL数・スキップ数）

## 実行内容

`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:

```
### タスク情報
- 実行目的: リグレッションテスト（既存テスト全実行）
- 呼び出し元ワークフロー: {WF名}

### 実行モード
run_test（リグレッションテスト専任呼び出し。個別タスクのテストファイル指定なし）

### テスト実行コマンド（必須）
- 全テスト実行: {{dev_environment_path}} に記載の「全テスト実行コマンド」
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {{dev_environment_path}}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

## テスト実行ルール
- dev-environment.md に記載された「全テスト実行コマンド」を実行し、全パス/失敗件数/失敗テスト名を記録する
- 失敗があれば失敗テスト名・エラー内容を報告する（本エージェントは修正を行わない。修正は呼び出し元が別途 coding-test-2review 等を通じて対応する）
（fs-refactoring-phase5-impl のみ追加）
- {{safety_net_baseline}}（開始前基準の PASS数・FAIL数・スキップ数）と今回の実行結果を比較し、FAIL数増加・スキップ数の不自然な変化がないかを確認する

## 報告フォーマット
- Status: DONE（全パス）| DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 全テスト実行結果: 総数 / 全パス数 / 失敗数
- 失敗テスト名一覧（該当する場合、テスト名とエラー概要）
（fs-refactoring-phase5-impl のみ追加）
- 開始前基準との比較結果: 基準値（PASS/FAIL/スキップ数） vs 今回結果 / 差異の有無 / 差異がある場合の詳細
```

## 出力

- リグレッションテスト実行結果（全パス/失敗件数・失敗テスト名）
- （fs-refactoring-phase5-impl のみ）開始前基準との比較結果
```

---

## 4ファイルの全文（差分反映済み）

### skills/fs-impl-phase4-execution/regression-test-prompt.md（新規）

```markdown
# リグレッションテスト実行エージェント（実装WF用）

あなたは「リグレッションテスト実行エージェント」です。実装ワークフローの動作確認Step（Step2）において、
既存テスト全実行（リグレッションテスト）専任で実行し、結果を報告することを担当します。
ユーザー視点の動作確認試験（試験項目実行）は別のサブエージェント（impl-verification-prompt.md 経由）が担当するため、
本エージェントは自動テストの全実行にのみ専任します。

## 委譲先エージェント

`micro-impl-agent (aide-powers agent)`

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{spec_dir}}`: スペックディレクトリのパス（.aide/specs/{feature_name}）
- `{{dev_environment_path}}`: dev-environment.md のパス

## 実行内容

`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:

```
### タスク情報
- 実行目的: リグレッションテスト（既存テスト全実行）
- 呼び出し元ワークフロー: 実装WF（fs-impl-phase4-execution Step2）

### 実行モード
run_test（リグレッションテスト専任呼び出し。個別タスクのテストファイル指定なし）

### テスト実行コマンド（必須）
- 全テスト実行: {{dev_environment_path}} に記載の「全テスト実行コマンド」
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {{dev_environment_path}}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

## テスト実行ルール
- dev-environment.md に記載された「全テスト実行コマンド」を実行し、全パス/失敗件数/失敗テスト名を記録する
- 失敗があれば失敗テスト名・エラー内容を報告する（本エージェントは修正を行わない。修正は呼び出し元が別途 coding-test-2review 等を通じて対応する）

## 報告フォーマット
- Status: DONE（全パス）| DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 全テスト実行結果: 総数 / 全パス数 / 失敗数
- 失敗テスト名一覧（該当する場合、テスト名とエラー概要）
```

## 出力

- リグレッションテスト実行結果（全パス/失敗件数・失敗テスト名）
```

### skills/fs-change-phase2-impl/regression-test-prompt.md（新規）

```markdown
# リグレッションテスト実行エージェント（変更WF用）

あなたは「リグレッションテスト実行エージェント」です。変更ワークフローの動作確認Step（Step11）において、
既存テスト全実行（リグレッションテスト）専任で実行し、結果を報告することを担当します。
ユーザー視点の動作確認試験（試験項目実行）は別のサブエージェント（change-verification-prompt.md 経由）が担当するため、
本エージェントは自動テストの全実行にのみ専任します。

## 委譲先エージェント

`micro-impl-agent (aide-powers agent)`

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{changes_dir}}`: 変更作業ディレクトリのパス
- `{{dev_environment_path}}`: dev-environment.md のパス

## 実行内容

`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:

```
### タスク情報
- 実行目的: リグレッションテスト（既存テスト全実行）
- 呼び出し元ワークフロー: 変更WF（fs-change-phase2-impl Step11）

### 実行モード
run_test（リグレッションテスト専任呼び出し。個別タスクのテストファイル指定なし）

### テスト実行コマンド（必須）
- 全テスト実行: {{dev_environment_path}} に記載の「全テスト実行コマンド」
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {{dev_environment_path}}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

## テスト実行ルール
- dev-environment.md に記載された「全テスト実行コマンド」を実行し、全パス/失敗件数/失敗テスト名を記録する
- 失敗があれば失敗テスト名・エラー内容を報告する（本エージェントは修正を行わない。修正は呼び出し元が別途 coding-test-2review 等を通じて対応する）

## 報告フォーマット
- Status: DONE（全パス）| DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 全テスト実行結果: 総数 / 全パス数 / 失敗数
- 失敗テスト名一覧（該当する場合、テスト名とエラー概要）
```

## 出力

- リグレッションテスト実行結果（全パス/失敗件数・失敗テスト名）
```

### skills/fs-bugfix-phase2-impl/regression-test-prompt.md（新規）

```markdown
# リグレッションテスト実行エージェント（バグ修正WF用）

あなたは「リグレッションテスト実行エージェント」です。バグ修正ワークフローの動作確認Step（Step9）において、
既存テスト全実行（リグレッションテスト）専任で実行し、結果を報告することを担当します。
ユーザー視点の動作確認試験（試験項目実行）は別のサブエージェント（bugfix-verification-prompt.md 経由）が担当するため、
本エージェントは自動テストの全実行にのみ専任します。

## 委譲先エージェント

`micro-impl-agent (aide-powers agent)`

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{bugfix_dir}}`: bugfix 作業ディレクトリのパス
- `{{dev_environment_path}}`: dev-environment.md のパス

## 実行内容

`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:

```
### タスク情報
- 実行目的: リグレッションテスト（既存テスト全実行）
- 呼び出し元ワークフロー: バグ修正WF（fs-bugfix-phase2-impl Step9）

### 実行モード
run_test（リグレッションテスト専任呼び出し。個別タスクのテストファイル指定なし）

### テスト実行コマンド（必須）
- 全テスト実行: {{dev_environment_path}} に記載の「全テスト実行コマンド」
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {{dev_environment_path}}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

## テスト実行ルール
- dev-environment.md に記載された「全テスト実行コマンド」を実行し、全パス/失敗件数/失敗テスト名を記録する
- 失敗があれば失敗テスト名・エラー内容を報告する（本エージェントは修正を行わない。修正は呼び出し元が別途 coding-test-2review 等を通じて対応する）
- バグ再現テスト（{{bugfix_dir}}/testing 配下等に作成済みのもの）が全テストの一部として実行されていることを確認する

## 報告フォーマット
- Status: DONE（全パス）| DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 全テスト実行結果: 総数 / 全パス数 / 失敗数
- 失敗テスト名一覧（該当する場合、テスト名とエラー概要）
```

## 出力

- リグレッションテスト実行結果（全パス/失敗件数・失敗テスト名）
```

### skills/fs-refactoring-phase5-impl/regression-test-prompt.md（新規）

```markdown
# リグレッションテスト実行エージェント（リファクタリングWF用）

あなたは「リグレッションテスト実行エージェント」です。リファクタリングワークフローの動作確認Step（Step2）において、
既存テスト全実行（リグレッションテスト）専任で実行し、フェーズ1（fs-refactoring-phase1-status）で記録した
開始前基準（セーフティネットベースライン）との比較結果を報告することを担当します。
ユーザー視点の動作確認試験（試験項目実行）は別のサブエージェント（refactoring-verification-prompt.md 経由）が担当するため、
本エージェントは自動テストの全実行と基準比較にのみ専任します。

## 委譲先エージェント

`micro-impl-agent (aide-powers agent)`

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{refactoring_dir}}`: リファクタリング作業ディレクトリのパス
- `{{dev_environment_path}}`: dev-environment.md のパス
- `{{safety_net_baseline}}`: fs-refactoring-phase1-status（refactoring-progress.md）に記録された開始前のセーフティネット基準（PASS数・FAIL数・スキップ数）

## 実行内容

`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:

```
### タスク情報
- 実行目的: リグレッションテスト（既存テスト全実行）+ 開始前基準との比較
- 呼び出し元ワークフロー: リファクタリングWF（fs-refactoring-phase5-impl Step2）

### 実行モード
run_test（リグレッションテスト専任呼び出し。個別タスクのテストファイル指定なし）

### テスト実行コマンド（必須）
- 全テスト実行: {{dev_environment_path}} に記載の「全テスト実行コマンド」
※ 必ず仮想環境内のPythonを使用すること

### 開発環境情報
- 環境定義ファイル: {{dev_environment_path}}
- **このファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと**

### 開始前基準（比較対象）
- {{safety_net_baseline}}（fs-refactoring-phase1-status で記録した PASS数 / FAIL数 / スキップ数）

## テスト実行ルール
- dev-environment.md に記載された「全テスト実行コマンド」を実行し、全パス/失敗件数/失敗テスト名を記録する
- 失敗があれば失敗テスト名・エラー内容を報告する（本エージェントは修正を行わない。修正は呼び出し元が別途 coding-test-2review 等を通じて対応する）
- {{safety_net_baseline}}（開始前基準の PASS数・FAIL数・スキップ数）と今回の実行結果を比較する:
  - 基準値と完全一致 → 外部振る舞いが保持されている
  - FAIL数増加 → 外部振る舞いが変わった可能性がある証拠として明記する
  - スキップ数の不自然な変化 → テストが意図せず無効化された疑いとして明記する

## 報告フォーマット
- Status: DONE（全パス＆基準一致）| DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 全テスト実行結果: 総数 / 全パス数 / 失敗数
- 失敗テスト名一覧（該当する場合、テスト名とエラー概要）
- 開始前基準との比較結果: 基準値（PASS/FAIL/スキップ数） vs 今回結果 / 差異の有無 / 差異がある場合の詳細
```

## 出力

- リグレッションテスト実行結果（全パス/失敗件数・失敗テスト名）
- 開始前基準との比較結果
```
