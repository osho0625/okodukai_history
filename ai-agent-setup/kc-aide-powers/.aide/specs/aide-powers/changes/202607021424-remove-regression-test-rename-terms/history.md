# バグ修正・追加対応履歴

## 初回バグ修正
- 日付: 2026-07-06
- バグ概要: micro-impl-agent（実装専任エージェント）が、実装以外の目的（リグレッションテスト実行）で呼び出されている。regression-test-prompt.md 4ファイル（fs-bugfix-phase2-impl / fs-change-phase2-impl / fs-impl-phase4-execution / fs-refactoring-phase5-impl）に不正な委譲先指定があり、その呼び出し元であるSKILL.md 4ファイルのIntegration節（および fs-refactoring-phase5-impl のStep本文）にも同様の具体名指定が存在していた。
- 原因: regression-test-prompt.md は「サブエージェントに渡されるプロンプト」であるにもかかわらず、(1) micro-impl-agent の責務外（テスト実行のみで実装を伴わない）の用途で使用されていた、(2) 他のプロンプトテンプレートにはない「委譲先エージェント」という独自セクションを持つ構造不整合があった。作成時に coding-test-2review の run_test パターンを誤って流用したことが原因であり、呼び出し元のSKILL.md側にも同じ誤った委譲先指定がそのまま伝播していた。
- 対策種別: 根本対策
- 修正方針: regression-test-prompt.md 4ファイルから「委譲先エージェント」セクションと「プレースホルダー」セクションを削除し、コードブロックを解放してファイル全体を他のプロンプトテンプレートと同型の構造に統一する。呼び出し元のSKILL.md 4ファイルのIntegration節も「呼び出す名前付きエージェント」から「呼び出すサブエージェント」に見出しを変更し、`micro-impl-agent (aide-powers agent)` という具体名指定を、委譲先を固定しない汎用的な記述に変更する。委譲先の具体的なエージェント種別は各AIプラットフォームのツールマップに委ねる（新しい名前付きエージェントは新設しない）。
- 修正概要: regression-test-prompt.md 4ファイル（fs-bugfix-phase2-impl, fs-change-phase2-impl, fs-impl-phase4-execution, fs-refactoring-phase5-impl）から委譲先エージェント宣言・プレースホルダー宣言・コードブロック入れ子構造を除去し、プロンプト本文をトップレベルに引き上げた。対応するSKILL.md 4ファイルのIntegration節・プロンプトテンプレート欄の `micro-impl-agent` 具体名指定を「汎用のサブエージェント」に置き換え、fs-refactoring-phase5-impl のStep2本文中の `micro-impl-agent` 直接記述も「サブエージェントを起動し」という汎用表現に統一した。プロンプト本文（テスト実行指示の内容）自体は変更していない。本反映では、これらの実装済み変更に整合させて program-structure.md の fs-impl-phase4-execution / fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase5-impl の各節にある「呼び出しエージェント」欄・「プロンプトテンプレート」欄の `micro-impl-agent` 具体名指定を「汎用のサブエージェント」表現に更新した。
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
