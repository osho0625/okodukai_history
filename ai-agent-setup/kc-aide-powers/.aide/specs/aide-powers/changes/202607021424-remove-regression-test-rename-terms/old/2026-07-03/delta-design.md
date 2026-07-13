# 差分設計書

## 設計方針

前回変更WF（202607021424-remove-regression-test-rename-terms）のdelta-designスコープ外に残存した旧用語/旧番号を、前回WFで定義された新用語/新番号に文字列修正する。構造的変更は一切行わない。

## 修正対象の差分設計

### 修正1: impl-coding-standards/SKILL.md（REQ-C-001対応）

#### before

```
| **DONE** | 完全に完了、懸念なし | 依頼された全作業を実行し、結果に懸念事項がない場合 | 実装完了・試験書更新完了・全レビュー観点を自己チェック済み / テスト全パス（対象 + 全体リグレッション）/ 外部ライブラリ問題なし |
```

#### after

```
| **DONE** | 完全に完了、懸念なし | 依頼された全作業を実行し、結果に懸念事項がない場合 | 実装完了・試験書更新完了・全レビュー観点を自己チェック済み / テスト全パス（対象ユニットテスト）/ 外部ライブラリ問題なし |
```

#### 変更理由

PI-056: ステータス運用ルール表のDONE行の例に旧用語「対象 + 全体リグレッション」が残存。前回WFで`run_test`モードは対象タスクのユニットテストのみ実行する設計に統一され、全体リグレッションテストは動作確認Step（regression-test-prompt.md）で1回実施する設計となったため、`run_test`の文脈で「全体リグレッション」を含めるのは不正確。「対象ユニットテスト」に修正する。

### 修正2: fs-bugfix-phase2-impl/SKILL.md Integration節（REQ-C-002対応）

#### before

```
- `doc-sync (aide-powers skill)` — Step 11（設計書反映）
- `pending-issues-management (aide-powers skill)` — Step 12 (check) / Step 13 (present)
```

#### after

```
- `doc-sync (aide-powers skill)` — Step 10（設計書反映）
- `pending-issues-management (aide-powers skill)` — Step 11 (check) / Step 12 (present)
```

#### 変更理由

PI-057: Integration節の「呼び出す共通スキル」リストのStep番号がリナンバリング未追随。前回WFで旧Step9（リグレッションテスト結果確認）と旧Step10（動作検証・ユーザー確認）が1つの動作確認Step（Step9）に統合され、以降のStepが1つずつ前倒しでリナンバリングされた（旧Step11→新Step10、旧Step12→新Step11、旧Step13→新Step12）。本文のStep定義は正しく更新されているが、Integration節の共通スキル参照表が旧番号のまま残存していた。

### 修正3: fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md（REQ-C-003対応）

#### before

```
- リグレッションテストタスクを「既存カバー範囲」と「追加必要部分」の2系統で必ず分けること
- 各リグレッションテストタスクに「目的（防ぐバグ）」を必ず記載すること
```

#### after

```
- バグ再現テストを対象実装タスクのテスト観点に「目的（防ぐバグ）」を明記して含めること
```

#### 変更理由

PI-058: 運用ルール節に旧用語「リグレッションテストタスクを…2系統で…分ける」等が残存。前回WFでリグレッションテスト（既存テスト全実行）はタスクリスト上の個別タスクとして計画せず動作確認Step（regression-test-prompt.md）で1回実施する設計に統一された。バグ再現テスト（バグ再発防止テスト）は通常の実装タスクのテストファイルに含める形に変更された。「2系統で分ける」という旧表現は廃止された構造を参照しており、新構造に合わせた記述に修正する。

### 修正4: docs-dev/02-ai-agent/02-phase-skills/refactoring.md（REQ-C-004対応）

#### before

```
| 5 | `fs-refactoring-phase5-impl` | 実装 + 各タスクごとのセーフティネット全実行 |
```

#### after

```
| 5 | `fs-refactoring-phase5-impl` | 実装 + 動作確認Stepでセーフティネット全実行（1回） |
```

#### 変更理由

PI-059: 冒頭一覧表に旧表現「各タスクごとのセーフティネット全実行」残存。前回WFでセーフティネット（既存テスト全実行）は各タスク完了ごとではなく、全タスク完了後の動作確認Stepで1回実行する設計に変更された。

### 修正5: docs-dev/02-ai-agent/01-workflows/07-refactoring.md（REQ-C-005対応）

#### before（箇所1: ワークフローの目的セクション）

```
- 各タスク完了ごとに既存テスト全実行で外部振る舞いの保持を確認する
```

#### after（箇所1）

```
- 全タスク完了後の動作確認Stepで既存テスト全実行し外部振る舞いの保持を確認する
```

#### before（箇所2: フェーズ一覧テーブルのphase5行）

```
| 5 | `fs-refactoring-phase5-impl` | 1 タスクごとに 3エージェント体制で実装 + 既存テスト全実行 |
```

#### after（箇所2）

```
| 5 | `fs-refactoring-phase5-impl` | 3エージェント体制で実装 + 動作確認Stepでセーフティネット全実行（1回） |
```

#### 変更理由

PI-060: 複数節に旧表現「各タスク完了ごと」「1 タスクごとに…既存テスト全実行」等が残存。前回WFでセーフティネット（既存テスト全実行）は全タスク完了後の動作確認Stepで1回実行する設計に変更された。

### 修正6: fs-refactoring-phase5-impl/regression-test-prompt.md の用語統一（REQ-C-006対応）

> **Note:** impact-analysis.md では本修正の対象ファイルを `skills/fs-refactoring-phase1-status/SKILL.md` と記載しているが、実際に旧用語が残存しているのは `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` である。impact-analysis.md の記載不整合の修正は本差分設計のスコープ外とする。

#### before（箇所1: regression-test-prompt.md の開始前基準記述）

```
- `{{safety_net_baseline}}`: fs-refactoring-phase1-status（refactoring-progress.md）に記録された開始前のセーフティネット基準（PASS数・FAIL数・スキップ数）
```

#### after（箇所1）

```
- `{{safety_net_baseline}}`: fs-refactoring-phase1-status（refactoring-progress.md）に記録された開始前のセーフティネット基準（総テスト数・パス数・失敗数・スキップ数）
```

#### before（箇所2: regression-test-prompt.md の報告フォーマット内、開始前基準比較記述）

```
- 開始前基準との比較結果: 基準値（PASS/FAIL/スキップ数） vs 今回結果 / 差異の有無 / 差異がある場合の詳細
```

#### after（箇所2）

```
- 開始前基準との比較結果: 基準値（総テスト数/パス数/失敗数/スキップ数） vs 今回結果 / 差異の有無 / 差異がある場合の詳細
```

#### before（箇所3: regression-test-prompt.md のテンプレート変数説明内、baseline記述）

```
{{safety_net_baseline}}（fs-refactoring-phase1-status で記録した PASS数 / FAIL数 / スキップ数）
```

#### after（箇所3）

```
{{safety_net_baseline}}（fs-refactoring-phase1-status で記録した 総テスト数 / パス数 / 失敗数 / スキップ数）
```

#### before（箇所4: regression-test-prompt.md の比較判定セクション内、baseline比較記述）

```
{{safety_net_baseline}}（開始前基準の PASS数・FAIL数・スキップ数）と今回の実行結果を比較する:
```

#### after（箇所4）

```
{{safety_net_baseline}}（開始前基準の 総テスト数・パス数・失敗数・スキップ数）と今回の実行結果を比較する:
```

#### 変更理由

PI-061: refactoring-status-checker-prompt.md（phase1で記録する側）は4項目（総テスト数・パス数・失敗数・スキップ数）を記録するのに対し、regression-test-prompt.md（phase5で比較する側）は3項目（PASS数・FAIL数・スキップ数）としか記述しておらず「総テスト数」が欠落している。また表記も「PASS数・FAIL数」（英語）vs「パス数・失敗数」（日本語）で不統一。記録側（refactoring-status-checker-prompt.md）の表記「総テスト数・パス数・失敗数・スキップ数」に合わせて統一する。regression-test-prompt.md 内の全4箇所を修正対象とする。

## 新規追加の設計

なし（全て既存ファイルの文字列修正のみ）

## GUI差分

なし（GUI変更なし）

## インターフェース影響サマリ

シグネチャ変更なし。全6件は設計書・ドキュメント内の用語/番号の文字列修正であり、メソッド/関数のインターフェースには一切影響しない。

## 更新が必要な設計資料

なし（本変更はスキル定義・ドキュメント内の用語修正のみであり、program-structure.md 等の恒久的設計書への変更は不要）
