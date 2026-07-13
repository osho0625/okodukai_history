# 工程チェック表

## D-001: SKILL.md の変更（新Step挿入 + 番号繰り下げ + 遷移ロジック更新）

| 工程 | ステータス | 担当 | 備考 |
|---|---|---|---|
| 実装 | ✅ done | micro-impl-agent | サブタスク 1.1〜1.6 完了。新Step4挿入、Step5〜10繰り下げ、レポート項目名更新、遷移ロジック更新、Integration更新、サブエージェント呼び出し記述更新 |
| テスト実装 | ➖ skip | — | 非プログラム成果物のためスキップ |
| テスト実行 | ➖ skip | — | 非プログラム成果物のためスキップ |
| 設計準拠レビュー | ✅ done | design-review-agent | 合理的乖離1件（出力先記述）→ 設計書修正で解消。全検証ポイントPASS |
| コード品質レビュー | ✅ done | code-review-agent | APPROVED（ERROR: 0, WARNING: 0） |

## D-002: bugfix-investigator-prompt.md の新規作成

| 工程 | ステータス | 担当 | 備考 |
|---|---|---|---|
| 実装 | ✅ done | micro-impl-agent | delta-design.md §2 のプロンプト全文（163行）を忠実に新規作成完了 |
| テスト実装 | ➖ skip | — | 非プログラム成果物のためスキップ |
| テスト実行 | ➖ skip | — | 非プログラム成果物のためスキップ |
| 設計準拠レビュー | ✅ done | design-review-agent | PASS（設計書§2と完全一致確認） |
| コード品質レビュー | ✅ done | code-review-agent | WARNING1件（ステップ9/報告フォーマット不一致）→ 設計書＋実装修正で解消 |

## D-003: bugfix-analyzer-prompt.md の変更（入力パラメータ追加）

| 工程 | ステータス | 担当 | 備考 |
|---|---|---|---|
| 実装 | ✅ done | micro-impl-agent | delta-design.md 変更5 の after に従い入力情報セクション拡張完了（investigation_result + 説明サブセクション + 仮実装コード流用禁止警告） |
| テスト実装 | ➖ skip | — | 非プログラム成果物のためスキップ |
| テスト実行 | ➖ skip | — | 非プログラム成果物のためスキップ |
| 設計準拠レビュー | ✅ done | design-review-agent | PASS（変更5のafter と完全一致確認） |
| コード品質レビュー | ✅ done | code-review-agent | APPROVED（ERROR: 0, WARNING: 0） |

## D-R-001: リグレッションテスト観点確認

| 工程 | ステータス | 担当 | 備考 |
|---|---|---|---|
| テスト観点確認 | ✅ done | design-review-agent | T-1〜T-6, R-1〜R-7 の観点がdelta-task-list.mdに記載されており、SKILL.mdの遷移ロジックと整合確認済み |

## D-004: ドキュメント更新

| 工程 | ステータス | 担当 | 備考 |
|---|---|---|---|
| 実装 | ✅ done | micro-impl-agent | 4.1: bugfix.md Phase1責務に再現性確認・原因特定追加+プロンプト一覧更新。4.2: 06-bugfix.md フェーズ一覧+目的更新。4.3: program-structure.md Phase1プロセス・プロンプトテンプレート一覧更新 |
| テスト実装 | ➖ skip | — | 非プログラム成果物のためスキップ |
| テスト実行 | ➖ skip | — | 非プログラム成果物のためスキップ |
| 設計準拠レビュー | ✅ done | design-review-agent | PASS（3ファイル全てdelta-design.md「更新が必要な設計資料」要件を満たす） |
| コード品質レビュー | ✅ done | code-review-agent | ERROR 1件（一覧テーブル記載漏れ）→ 修正済み。3ファイル間整合PASS |
