# 工程チェック表: リグレッションテスト用語・番号の残存修正

> 本変更は非プログラム成果物（既存ドキュメント/スキル定義ファイル内の文字列修正のみ、実行ロジックなし）であり、
> aide-powers は自動テストフレームワークを持たない（dev-environment.md §1, §7）。
> 全6タスクがサブタスクなし（1親タスク=1ファイル=実装単位）のため、行キーは親タスクID単位で生成する。
> 実工程は「実装」「設計準拠レビュー」のみとし、「テスト実装」「テスト実行」「コード品質レビュー」は ➖ skip とする。

## 状態凡例
- ⬜ todo : 未着手（初期状態）
- 🔄 in-progress : 実行中（担当本人が作業開始直後に設定）
- ✅ done : 完了（PASS。担当本人が output に結果サマリを記入）
- ❌ failed : 失敗（FAIL。担当本人が output にエラー／指摘を記入）
- ➖ skip : 対象外（生成時に確定。非プログラム成果物でスキップする工程。output に判定理由）

## 工程チェック表

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| D-001::implement | D-001 | impl-coding-standards/SKILL.md 用語修正 | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | skills/impl-coding-standards/SKILL.md のステータス運用ルール表DONE行を「テスト全パス（対象 + 全体リグレッション）」→「テスト全パス（対象ユニットテスト）」に修正。他箇所への影響なし |
| D-001::write_test | D-001 | impl-coding-standards/SKILL.md 用語修正 | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-001::run_test | D-001 | impl-coding-standards/SKILL.md 用語修正 | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-001::spec_review | D-001 | impl-coding-standards/SKILL.md 用語修正 | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（検査項目数: 1, 差分: 0）。ステータス運用ルール表DONE行の該当セルが delta-design.md 修正1のafter文言と完全一致。他箇所への変更なし（git diff で該当1行のみの変更を確認） |
| D-001::quality_review | D-001 | impl-coding-standards/SKILL.md 用語修正 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-002::implement | D-002 | fs-bugfix-phase2-impl/SKILL.md Step番号修正 | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | Integration節「呼び出す共通スキル」の doc-sync行をStep11→Step10、pending-issues-management行をStep12/13→Step11/12に文字列修正。本文Step定義は変更なし |
| D-002::write_test | D-002 | fs-bugfix-phase2-impl/SKILL.md Step番号修正 | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-002::run_test | D-002 | fs-bugfix-phase2-impl/SKILL.md Step番号修正 | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-002::spec_review | D-002 | fs-bugfix-phase2-impl/SKILL.md Step番号修正 | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。Integration節「呼び出す共通スキル」のdoc-sync行をStep11→Step10、pending-issues-management行をStep12/13→Step11/12に修正済みでafterと完全一致。git diffで本ファイルの変更が当該2行のみであることを確認し、本文Step定義（Step10=設計書反映, Step11=pending-issues書き込み忘れチェック, Step12=バグ修正完了の案内）との整合も確認済み |
| D-002::quality_review | D-002 | fs-bugfix-phase2-impl/SKILL.md Step番号修正 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-003::implement | D-003 | bugfix-task-planner-prompt.md 表現修正 | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 運用ルール節のbefore2行をafter1行に統合修正完了。他行・他セクションへの変更なし |
| D-003::write_test | D-003 | bugfix-task-planner-prompt.md 表現修正 | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-003::run_test | D-003 | bugfix-task-planner-prompt.md 表現修正 | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-003::spec_review | D-003 | bugfix-task-planner-prompt.md 表現修正 | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | 判定: PASS（検査項目1, 差分: 0）。運用ルール節のbefore2行「リグレッションテストタスクを『既存カバー範囲』と『追加必要部分』の2系統で必ず分けること」「各リグレッションテストタスクに『目的（防ぐバグ）』を必ず記載すること」がafter1行「バグ再現テストを対象実装タスクのテスト観点に『目的（防ぐバグ）』を明記して含めること」と文字列完全一致で置換されている。旧用語（2系統、既存カバー範囲、追加必要部分）の残存なし。他セクション（Red Flags表、Common Rationalizations表、報告フォーマット等）への変更なし。 |
| D-003::quality_review | D-003 | bugfix-task-planner-prompt.md 表現修正 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-004::implement | D-004 | docs-dev/02-phase-skills/refactoring.md 表現修正 | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 冒頭一覧表のphase5行を「実装 + 各タスクごとのセーフティネット全実行」→「実装 + 動作確認Stepでセーフティネット全実行（1回）」に修正。他行・他記述は無変更。 |
| D-004::write_test | D-004 | docs-dev/02-phase-skills/refactoring.md 表現修正 | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-004::run_test | D-004 | docs-dev/02-phase-skills/refactoring.md 表現修正 | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-004::spec_review | D-004 | docs-dev/02-phase-skills/refactoring.md 表現修正 | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | 判定: PASS（検査項目: 修正4のbefore→after完全一致、他行への変更なし。差分: 0） |
| D-004::quality_review | D-004 | docs-dev/02-phase-skills/refactoring.md 表現修正 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-005::implement | D-005 | docs-dev/01-workflows/07-refactoring.md 表現修正 | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 箇所1（ワークフローの目的）「各タスク完了ごとに既存テスト全実行」→「全タスク完了後の動作確認Stepで既存テスト全実行し」に修正。箇所2（フェーズ一覧テーブルphase5行）「1 タスクごとに 3エージェント体制で実装 + 既存テスト全実行」→「3エージェント体制で実装 + 動作確認Stepでセーフティネット全実行（1回）」に修正。他箇所は変更なし |
| D-005::write_test | D-005 | docs-dev/01-workflows/07-refactoring.md 表現修正 | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-005::run_test | D-005 | docs-dev/01-workflows/07-refactoring.md 表現修正 | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-005::spec_review | D-005 | docs-dev/01-workflows/07-refactoring.md 表現修正 | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | 判定: PASS（検査項目数: 2, 差分: 0）。箇所1・箇所2ともにdelta-design.md修正5のafter文言と完全一致。修正箇所以外への変更なし（git diffで確認） |
| D-005::quality_review | D-005 | docs-dev/01-workflows/07-refactoring.md 表現修正 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-006::implement | D-006 | regression-test-prompt.md 用語統一（4箇所） | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 箇所1〜4（開始前基準記述/報告フォーマット比較記述/テンプレート変数説明/比較判定セクション）を「PASS数・FAIL数・スキップ数」等の旧表記から「総テスト数・パス数・失敗数・スキップ数」に統一。4箇所以外（比較判定ルール本文の「FAIL数増加」等）はスコープ外のため無変更。旧表記の残存なしを確認済み |
| D-006::write_test | D-006 | regression-test-prompt.md 用語統一（4箇所） | テスト実装 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-006::run_test | D-006 | regression-test-prompt.md 用語統一（4箇所） | テスト実行 | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |
| D-006::spec_review | D-006 | regression-test-prompt.md 用語統一（4箇所） | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | 判定: PASS（検査項目数: 4, 差分: 0）。4箇所（開始前基準記述/報告フォーマット比較記述/テンプレート変数説明/比較判定セクション）すべてdelta-design.md修正6のafter文言と完全一致。旧表記（PASS数・FAIL数の単独表記）の残存なしをgrepで確認。git diffで該当4行のみの変更を確認し、修正箇所以外への変更なし |
| D-006::quality_review | D-006 | regression-test-prompt.md 用語統一（4箇所） | コード品質レビュー | ➖ skip | — | 非プログラム成果物（文字列修正のみ、実行ロジックなし）のため対象外 |

## 工程キーと担当エージェント（固定対応）

| 工程キー | 工程名（表示） | 担当エージェント | 前提工程（✅ done で起動可） |
|---|---|---|---|
| `implement` | 実装 | micro-impl-agent (aide-powers agent) | なし |
| `spec_review` | 設計準拠レビュー | design-review-agent (aide-powers agent) | implement |

> 本変更は非プログラム成果物のため `write_test` / `run_test` / `quality_review` は全タスクで ➖ skip とする。

## 担当本人による3段階更新（衝突回避）

各工程の担当サブエージェント本人が、**自分の工程行（1物理行）のみ**を str_replace で更新する。

1. 【作業開始直後】自分の行の 状態 `⬜ todo → 🔄 in-progress`、実行エージェントを自分の名前に
2. 【完了（PASS）】状態 `🔄 in-progress → ✅ done`、output に結果サマリ
3. 【失敗（FAIL）】状態 `🔄 in-progress → ❌ failed`、output にエラー／指摘内容

オーケストレータ（起動元）が代理で `✅ done` を書くことは禁止。更新前に本ファイルを Read で読み直し、自分の行のみ最小編集する。

## 監査ルール（ホワイトリスト強制）

- 各工程行の「実行エージェント」は、状態が `🔄/✅/❌` のとき、その工程キーに対応する担当エージェント（上表）かつホワイトリスト（micro-impl-agent (aide-powers agent) / design-review-agent (aide-powers agent)）のいずれかでなければならない。
- 工程キーと実行エージェントの対応が不一致、またはホワイトリスト以外の場合は ❌ FAIL 扱いとする。
- ➖ skip 行は監査対象外（生成時に確定済みのため実行エージェントの記入は不要）。

## 完了条件

- 全6タスク（D-001〜D-006）の `implement` 行・`spec_review` 行が `✅ done` であること。
- `write_test` / `run_test` / `quality_review` 行はすべて ➖ skip のまま（本変更のスコープでは実行しない）。
