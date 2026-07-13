# バグ原因分析

## 分析日
2026-07-06

## 現状把握

### 設計書の状態
- doc-index.md: 存在する（コア4ファイル全て ✅ 完了）
- program-structure.md: 存在する。regression-test-prompt.md の構造は未記載（プロンプトテンプレートの内部構造まではカバーしていない）
- 設計書との乖離: regression-test-prompt.md の「委譲先エージェント」構造は、他のプロンプトテンプレートの設計パターン（プロンプト内容のみを持つ）と不整合

### 既存テストの状態
- N/A（本バグはMarkdownのスキル定義ファイルの設計不具合であり、プログラムコードの不具合ではない。自動テストの対象外）

## 原因分析

### 原因箇所
- ファイル: skills/fs-change-phase2-impl/regression-test-prompt.md（+ 他3ファイル同一構造）
- セクション: 「## 委譲先エージェント」および「## 実行内容」
- 問題箇所1: `## 委譲先エージェント` セクションに `micro-impl-agent (aide-powers agent)` が記載
- 問題箇所2: `## 実行内容` に `micro-impl-agent (aide-powers agent) を以下のプロンプトで起動する:` が記載

### 原因の説明
regression-test-prompt.md は「サブエージェントに渡されるプロンプト」であるにもかかわらず、2つの設計上の問題を含んでいる:

1. **エージェント責務の違反**: micro-impl-agent は「実装コードとテストコードを書く」実装専任エージェントである。「テストコマンドを実行して結果を報告するだけ」のリグレッションテスト実行は、実装行為を伴わないため micro-impl-agent の責務外。

2. **プロンプトテンプレートの構造不整合**: 他の全プロンプトテンプレート（bugfix-reporter-prompt.md, bugfix-analyzer-prompt.md, bugfix-planner-prompt.md 等）はプロンプト内容のみを持ち、「委譲先エージェント」セクションを持たない。委譲先の決定はFSスキル（SKILL.md）の責務。regression-test-prompt.md だけが「委譲先エージェント」という独自セクションを持ち、テンプレート内で委譲先を指定する異質な構造になっている。

### 技術的な詳細
- regression-test-prompt.md は2026-07-02の変更WF（202607021424-remove-regression-test-rename-terms）で作成された
- 作成時に、coding-test-2review の run_test 工程（micro-impl-agent が担当）のパターンを流用して、リグレッションテスト用プロンプトにも micro-impl-agent を指定してしまった
- coding-test-2review の run_test は implement→write_test→run_test の連続した工程の一部であるため micro-impl-agent が担当するのが正当だが、regression-test-prompt.md の用途は「単独でのテスト全実行+結果報告」であり、実装工程とは独立した別のタスク

## 影響範囲
- skills/fs-change-phase2-impl/regression-test-prompt.md
- skills/fs-bugfix-phase2-impl/regression-test-prompt.md
- skills/fs-impl-phase4-execution/regression-test-prompt.md
- skills/fs-refactoring-phase5-impl/regression-test-prompt.md
- 各WFのSKILL.md内でregression-test-prompt.mdを呼び出す箇所（呼び出し方法の変更が必要な場合）

## 起因元ドキュメントフォルダ
- パス: .aide/specs/aide-powers/changes/202607021424-remove-regression-test-rename-terms/
- コミットハッシュ: 該当WFのコミット（regression-test-prompt.md 新規作成時）
- 備考: 当該変更WFの delta-design-regression-test-prompts.md で設計された構造がそのまま実装された結果

## テストカバレッジ
- 原因箇所のテスト: なし（Markdownのスキル定義ファイルに対する自動テストは存在しない）
- 影響範囲のテスト: なし（同上）
