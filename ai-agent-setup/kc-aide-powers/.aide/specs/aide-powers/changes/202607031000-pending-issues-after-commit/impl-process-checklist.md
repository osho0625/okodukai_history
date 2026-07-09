# 工程チェック表

本チェック表は delta-task-list.md の全11タスク（D-001〜D-011、全て既存変更）について、タスク×工程（implement, write_test, run_test, spec_review, quality_review）ごとに1行を生成する（1工程1行構造）。

**成果物種別の判定:** 本プロジェクトは aide-powers フレームワーク自体であり、変更対象は全てスキル定義テキストファイル（SKILL.md）である。dev-environment.md §1・§7.4 の確定方針により、リポジトリに自動テストフレームワークは導入されていない。したがって全11タスクは「非プログラム成果物タスク」として扱い、`write_test`（テスト実装）・`run_test`（テスト実行）・`quality_review`（コード品質レビュー）の3工程は生成時点で `➖ skip` とする。`implement`（実装）・`spec_review`（設計準拠レビュー）の2工程のみを実工程行として生成する。

**行キー生成ルール:** delta-task-list.md の全タスクにサブタスクがない（1ファイル=1親タスクでサブタスクを設けない設計）ため、行キーは親タスクIDで生成する（例: D-001::implement）。

## 状態凡例
- ⬜ todo : 未着手（初期状態）
- 🔄 in-progress : 実行中（担当本人が作業開始直後に設定）
- ✅ done : 完了（PASS。担当本人が output に結果サマリを記入）
- ❌ failed : 失敗（FAIL。担当本人が output にエラー／指摘を記入）
- ➖ skip : 対象外（生成時に確定。非プログラム成果物でスキップする工程。output に判定理由）

## チェック表（非プログラム成果物タスク）

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| D-001::implement | D-001 | fs-change-phase2-impl/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | Step13削除+Step14→13リナンバリング(見出し・本文中Step14→Step13)+pending-issues present呼び出し削除+完了条件項目9削除・後続繰り上げ(9→13)+Integration行削除 完了 |
| D-001::write_test | D-001 | fs-change-phase2-impl/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-001::run_test | D-001 | fs-change-phase2-impl/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-001::spec_review | D-001 | fs-change-phase2-impl/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（検査項目6, 差分: 0）。delta-design.md A-1節の6項目（Step13削除/Step14→13見出しリナンバリング/本文中(Step14)→(Step13)全変更/present呼び出し削除/完了条件before→after一致/Integration行削除/完了条件セクション項目9削除・後続繰り上げ）全て実装ファイルに正確に反映を確認 |
| D-001::quality_review | D-001 | fs-change-phase2-impl/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-002::implement | D-002 | fs-bugfix-phase2-impl/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | Step11(pending-issues書き込み忘れチェック)セクション全体を削除。旧Step12(バグ修正完了の案内)を新Step11にリナンバリングし本文中の(Step12)表記を全て(Step11)に変更。新Step11内のpending-issues-management(present)呼び出しと完了条件の関連項目を削除。Integrationセクションのpending-issues-management行を削除 |
| D-002::write_test | D-002 | fs-bugfix-phase2-impl/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-002::run_test | D-002 | fs-bugfix-phase2-impl/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-002::spec_review | D-002 | fs-bugfix-phase2-impl/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | 判定: PASS（検査項目数: 4, 差分: 0）。delta-design.md A-2節の全項目（Step11セクション全体削除/Step12→11リナンバリング+本文中Step12→Step11全置換/present呼び出し削除+完了条件2項目除去/Integration行削除）がgit diffと実ファイル照合で確認済み。トップレベル「# 完了条件」セクションは本ファイルに存在せず対象外である旨も確認済み |
| D-002::quality_review | D-002 | fs-bugfix-phase2-impl/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-003::implement | D-003 | fs-refactoring-phase6-doc/SKILL.md | 実装 | ✅ done | micro-impl-agent | Step2(pending-issues書き込み忘れチェック)削除、旧Step3→Step2/旧Step4→Step3にリナンバリング（見出し・本文中の(Step3)/(Step4)表記を全て更新）、Integrationのpending-issues-management行削除 |
| D-003::write_test | D-003 | fs-refactoring-phase6-doc/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-003::run_test | D-003 | fs-refactoring-phase6-doc/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-003::spec_review | D-003 | fs-refactoring-phase6-doc/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md A-3節の全項目（Step2削除・Step3→2/Step4→3リナンバリング・旧Step1状態判定不変・Integration行削除）を実装後ファイルとgit HEAD差分で照合し完全一致を確認 |
| D-003::quality_review | D-003 | fs-refactoring-phase6-doc/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-004::implement | D-004 | fs-impl-phase5-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 3回目FAIL修正完了。delta-design.md A-4節「付随変更: レポート記載項目リスト直下の注記（design-sync反映・2026-07-03・3回目）」のbefore/afterに従い、「レポート記載項目リスト」直下の注記文から「、pending-issues.md が存在せず present を実行しない場合」の句（旧Step3由来の死んだ参照）を削除。1回目実装（Step3削除/Step2状態判定変更/Integration行削除/レポート項目4件削除）・2回目design-sync対応（Iron Laws「最終チェック2項目の省略禁止」/Integration「Output to next phase」）は既に正確に反映済みで今回の変更なし。指摘箇所以外は変更していない |
| D-004::write_test | D-004 | fs-impl-phase5-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-004::run_test | D-004 | fs-impl-phase5-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-004::spec_review | D-004 | fs-impl-phase5-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（検査項目7, 差分: 0）。4回目レビュー（3回目design-sync対応後の再レビュー）。delta-design.md A-4節の全7項目（Step3セクション全体削除/Step2状態判定「後処理へ遷移する」変更/Integration行削除/レポート記載項目リスト4項目削除/Iron Laws「最終チェック2項目の省略禁止」修正/Integration「Output to next phase」修正/レポート記載項目リスト直下の注記修正）を実ファイルと一字一句照合し完全一致を確認。特に今回の3回目修正対象（注記文から「、pending-issues.md が存在せず present を実行しない場合」の句が削除されていること）を重点確認し反映済みを確認。ファイル全文を再スキャンし「pending-issues」「Step3」の残留参照が皆無であることも確認済み。設計書にない追加変更なし |
| D-004::quality_review | D-004 | fs-impl-phase5-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-005::implement | D-005 | fs-change-phase3-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | delta-design.md B-1節に従い後処理へpending-issues check/present手順(2件)追加。完了条件・Integrationセクションも更新。実行順序(git-commit-workflow→check→present)確認済み |
| D-005::write_test | D-005 | fs-change-phase3-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-005::run_test | D-005 | fs-change-phase3-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-005::spec_review | D-005 | fs-change-phase3-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-1節のbefore/after全文と実ファイルをgit diffで一字一句照合。後処理へのpending-issues check/present追加位置（git-commit-workflow直後・完了ステータス直前）、完了条件2項目追加、Integration「呼び出す共通スキル」1行追加すべて設計通り。実行順序(doc-index→profile→commit→check→present→完了ステータス)も設計通り。bugfix/配下に本ファイル関連の過去修正履歴なし（5.5対象外）。設計書にない追加なし |
| D-005::quality_review | D-005 | fs-change-phase3-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-006::implement | D-006 | fs-bugfix-phase3-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 後処理にpending-issues check→present手順を追加（git-commit-workflow直後、完了ステータス直前）+完了条件にcheck/presentの出力2項目追加+Integration「呼び出す共通スキル」にpending-issues-management行追加。B-1/B-2差分（レポートファイル名・コミット結果項目名等）通りに実装完了 |
| D-006::write_test | D-006 | fs-bugfix-phase3-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-006::run_test | D-006 | fs-bugfix-phase3-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-006::spec_review | D-006 | fs-bugfix-phase3-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-2節（B-1と同一パターン、差分: レポートファイル名fs-bugfix-phase3-report.txt/コミット結果項目名「コミット結果(後処理):」等）とgit diffで一字一句照合。pending-issues check/present追加位置（git-commit-workflow直後・完了ステータス直前）、完了条件2項目追加、Integration「呼び出す共通スキル」1行追加すべて設計通り。実行順序(git-commit-workflow→check→present→完了ステータス)も設計通り。設計書にない追加なし |
| D-006::quality_review | D-006 | fs-bugfix-phase3-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-007::implement | D-007 | fs-refactoring-phase7-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | delta-design.md B-3節に従い後処理へpending-issues check/present手順(2件)をgit-commit-workflow直後・完了ステータス直前に追加。既存注記の直後にpending-issues-management実行タイミングの注記を追加。完了条件・Integration「呼び出す共通スキル」（git-commit-workflow行の直後）も更新。B-1/B-3差分（doc-index-maintenance/user-profile-management不使用構造）通りに実装完了 |
| D-007::write_test | D-007 | fs-refactoring-phase7-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-007::run_test | D-007 | fs-refactoring-phase7-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-007::spec_review | D-007 | fs-refactoring-phase7-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（検査項目6, 差分: 0）。delta-design.md B-3節の全項目（後処理へのpending-issues check/present追加位置=git-commit-workflow直後・完了ステータス直前/既存注記直後へのpending-issues注記追加/完了条件2項目追加/Integration「呼び出す共通スキル」1行追加=git-commit-workflow行直後/doc-index-maintenance・user-profile-management不使用構造の維持）をgit diffと実ファイルで一字一句照合し完全一致を確認。bugfix/配下3件に本ファイル対象の修正履歴なし（5.5対象外） |
| D-007::quality_review | D-007 | fs-refactoring-phase7-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-008::implement | D-008 | fs-impl-phase7-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | delta-design.md B-4節に従い後処理へpending-issues check/present手順(2件)をgit-commit-workflow直後・完了ステータス直前に追加。完了条件にcheck/presentの出力2項目追加。注記にpending-issues有無に関わらずcheck実行/presentは未対応時「未対応の問題はありません」の記述を追加。Integration「呼び出す共通スキル」にpending-issues-management行追加。B-3/B-4差分（doc-index-maintenance/user-profile-managementを呼ばない構造）通りに実装完了 |
| D-008::write_test | D-008 | fs-impl-phase7-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-008::run_test | D-008 | fs-impl-phase7-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-008::spec_review | D-008 | fs-impl-phase7-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-4節の全項目（後処理へのpending-issues check/present手順2件追加をgit-commit-workflow直後・完了ステータス直前に挿入/完了条件2項目追加/既存注記末尾へのpending-issues注記追加/Integration「呼び出す共通スキル」1行追加）をgit diff全文（7行追加・2行削除）と実ファイルで一字一句照合し完全一致を確認。doc-index-maintenance/user-profile-management(update)を呼ばない構造は維持。bugfix/配下に本ファイル関連の過去修正履歴なし（5.5対象外）。設計書にない追加なし |
| D-008::quality_review | D-008 | fs-impl-phase7-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-009::implement | D-009 | fs-planning-phase4-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | delta-design.md B-5節（B-1と同一パターン）に従い後処理へpending-issues check/present手順(2件)をgit-commit-workflow出力直後・完了ステータス直前に追加。完了条件にcheck/presentの出力2項目追加。Integration「呼び出す共通スキル」にpending-issues-management行追加 |
| D-009::write_test | D-009 | fs-planning-phase4-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-009::run_test | D-009 | fs-planning-phase4-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-009::spec_review | D-009 | fs-planning-phase4-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-5節（B-1と同一パターン、差分: レポートファイル名fs-planning-phase4-report.txt/コミット結果項目名「コミット結果(後処理):」）とgit diffで一字一句照合。pending-issues check/present追加位置（git-commit-workflow直後・完了ステータス直前）、完了条件2項目追加、Integration「呼び出す共通スキル」1行追加すべて設計通り。実行順序(git-commit-workflow→check→present→完了ステータス)も設計通り。bugfix/配下に本ファイル関連の過去修正履歴なし（5.5対象外）。設計書にない追加なし |
| D-009::quality_review | D-009 | fs-planning-phase4-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-010::implement | D-010 | fs-design-phase11-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | delta-design.md B-6節に従い後処理へpending-issues check/present手順(2件)追加。完了条件・Integrationセクションも更新。実行順序(git-commit-workflow→check→present)確認済み |
| D-010::write_test | D-010 | fs-design-phase11-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-010::run_test | D-010 | fs-design-phase11-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-010::spec_review | D-010 | fs-design-phase11-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-6節（B-1と同一パターン、差分: レポートファイル名fs-design-phase11-report.txt/コミット結果項目名「コミット結果(後処理):」）とgit diffで一字一句照合。pending-issues check/present追加位置（git-commit-workflow直後・完了ステータス直前）、完了条件2項目追加、Integration「呼び出す共通スキル」1行追加すべて設計通り。実行順序(git-commit-workflow→check→present→完了ステータス)も設計通り。bugfix/配下に本ファイル関連の過去修正履歴なし（5.5対象外）。設計書にない追加なし |
| D-010::quality_review | D-010 | fs-design-phase11-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |
| D-011::implement | D-011 | fs-reverse-phase6-final-check/SKILL.md | 実装 | ✅ done | micro-impl-agent (aide-powers agent) | 後処理にpending-issues check→present手順を追加（git-commit-workflow直後、完了ステータス直前）+完了条件にcheck/presentの出力2項目追加+Integration「呼び出す共通スキル」にpending-issues-management行追加。B-1/B-7差分（レポートファイル名・コミット結果項目名`最終進捗更新のコミット結果`等）通りに実装完了 |
| D-011::write_test | D-011 | fs-reverse-phase6-final-check/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実装工程は対象外 |
| D-011::run_test | D-011 | fs-reverse-phase6-final-check/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためテスト実行工程は対象外 |
| D-011::spec_review | D-011 | fs-reverse-phase6-final-check/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent (aide-powers agent) | PASS（差分0件）。delta-design.md B-7節（B-1と同一パターン、差分: レポートファイル名fs-reverse-phase6-report.txt/最終コミット結果項目名「最終進捗更新のコミット結果(後処理):」等）とgit diffで一字一句照合。pending-issues check/present追加位置（git-commit-workflow直後・完了ステータス直前）、完了条件2項目追加、Integration「呼び出す共通スキル」1行追加すべて設計通り。実行順序(git-commit-workflow→check→present→完了ステータス)も設計通り。bugfix/配下に本ファイル関連の過去修正履歴なし（5.5対象外）。設計書にない追加なし |
| D-011::quality_review | D-011 | fs-reverse-phase6-final-check/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物（スキル定義テキストファイル）のためコード品質レビュー工程は対象外 |

## Wave 別実行ガイド

| Wave | タスク | 並列可否 | 前提条件 |
|---|---|---|---|
| Wave 1 | D-001, D-002, D-003, D-004, D-005, D-006, D-007, D-008, D-009, D-010, D-011 | ✅ 並列可（全11タスク独立） | なし |

## 監査ルール（ホワイトリスト強制）

- `implement` 工程の実行エージェントは `micro-impl-agent (aide-powers agent)` であること
- `spec_review` 工程の実行エージェントは `design-review-agent (aide-powers agent)` であること
- 工程キーと実行エージェントの対応が不一致、またはホワイトリスト（micro-impl-agent / design-review-agent / code-review-agent）以外の場合は ❌ FAIL 扱いとする
- オーケストレータ（起動元）が代理で `✅ done` を書くこと（実施していない工程をやったことにする）は禁止。担当本人が自分の工程行のみを str_replace で更新する

## 集計

- 総行数: 55行（11タスク × 5工程）
- ➖ skip 行数: 33行（write_test 11行 + run_test 11行 + quality_review 11行。全タスクが非プログラム成果物〔スキル定義テキストファイル〕のため）
- ⬜ todo 行数: 22行（implement 11行 + spec_review 11行。未着手）
- ✅ done 行数: 0行（未実施）
