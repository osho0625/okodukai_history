# aide-claude 構成要素判定表

## 概要

superpowersの全ファイルを「そのまま使う / 中身を差し替える / 不要」に分類し、aide-claudeを作る際の作業指針とする。

## 判定基準

| 分類 | 定義 | aide-claudeでの作業 |
|---|---|---|
| **そのまま使う** | aide-claudeでもファイルをコピーしてそのまま使える | コピーのみ |
| **中身を差し替える** | ファイルの構造・形式は使うが、中身をAIDEのロジックに書き換える | コピー後に中身を書き換え |
| **不要** | aide-claudeでは使わない（superpowers開発者向け、または非推奨） | コピーしない |

---

## 1. skills/ — スキル（14スキル）

### 1.1 メインフロースキル（7つ）

ユーザーが使う際のメインワークフローを構成するスキル。

| # | スキル | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|---|
| 1 | using-superpowers | `skills/using-superpowers/SKILL.md` | 中身を差し替える | ハブスキル。superpowersの14スキルへの振り分けロジック（ユーザー意図の分類→スキル選択→チェーン実行）が書かれている。aide-claudeではAIDEの7つのオーケストレーターへの振り分けロジックに変わるため、振り分け先とルーティング条件を全面書き換えする | `using-aide-powers/SKILL.md` として書き換え |
| 2 | using-superpowers | `skills/using-superpowers/references/codex-tools.md` | 中身を差し替える | Codex CLI向けのツール名マッピング表（Claude Codeのツール名→Codexの`spawn_agent`/`update_plan`等への変換ルール）。aide-claudeは8プラットフォーム対応のため、Codex CLI上で動作する際にスキルが参照するツール名を正しく変換するために必要。マッピング内容をaide-claudeのスキルが使うツール名に合わせて差し替える | aide-claudeのCodex向けツールマッピングに書き換え |
| 3 | using-superpowers | `skills/using-superpowers/references/copilot-tools.md` | 中身を差し替える | Copilot CLI向けのツール名マッピング表（Claude Codeのツール名→Copilotの`view`/`create`/`task`等への変換ルール）。aide-claudeは8プラットフォーム対応のため、Copilot CLI上で動作する際にスキルが参照するツール名を正しく変換するために必要。マッピング内容をaide-claudeのスキルが使うツール名に合わせて差し替える | aide-claudeのCopilot向けツールマッピングに書き換え |
| 4 | using-superpowers | `skills/using-superpowers/references/gemini-tools.md` | 中身を差し替える | Gemini CLI向けのツール名マッピング表（Claude Codeのツール名→Geminiの`read_file`/`write_file`/`activate_skill`等への変換ルール）。aide-claudeは8プラットフォーム対応のため、Gemini CLI上で動作する際にスキルが参照するツール名を正しく変換するために必要。マッピング内容をaide-claudeのスキルが使うツール名に合わせて差し替える | aide-claudeのGemini向けツールマッピングに書き換え |
| 5 | using-superpowers | （新規作成）`skills/using-superpowers/references/kiro-tools.md` | 新規作成 | Kiro向けのツール名マッピング表。aide-claudeは8プラットフォーム対応であり、Kiroはその対象プラットフォームの1つ。Kiro固有のツール名（`readFile`/`fsWrite`/`strReplace`/`invokeSubAgent`等）へのマッピングが必要。superpowersには存在しないファイルのため新規作成する | aide-claudeのKiro向けツールマッピングを新規作成 |
| 6 | brainstorming | `skills/brainstorming/SKILL.md` | 中身を差し替える | 設計フェーズのメインスキル。superpowersの設計フロー（明確化質問→アプローチ提案→設計ドキュメント作成）が書かれている。aide-claudeではAIDEの企画/設計オーケストレーターのスキルチェーン（ヒアリング→技術調査→企画書→要件定義→設計10フェーズ）に変わるため、フロー全体を書き換える | AIDEの企画/設計フローに書き換え |
| 7 | brainstorming | `skills/brainstorming/spec-document-reviewer-prompt.md` | 中身を差し替える | Spec Self-Reviewのプロンプトテンプレート。superpowersの設計書形式（spec document）に対するレビュー観点が書かれている。aide-claudeではAIDEの設計書形式（object-design-*.md等）に対するdesign-qa-agentのレビュー観点に変わるため、チェック項目を全面書き換えする | AIDEのdesign-qa-agentの観点に書き換え |
| 8 | brainstorming | `skills/brainstorming/visual-companion.md` | そのまま使う | ブラウザでモックアップを表示するビジュアルコンパニオン機能の説明。AIDE固有のロジックを含まず、HTML/WebSocket経由の汎用プレビュー機能のためプラットフォーム非依存 | そのままコピー |
| 9 | brainstorming | `skills/brainstorming/scripts/frame-template.html` | そのまま使う | ビジュアルコンパニオンのHTMLテンプレート。純粋なHTML/CSSのみで構成されており、superpowers固有のロジックを含まないためそのまま利用可能 | そのままコピー |
| 10 | brainstorming | `skills/brainstorming/scripts/helper.js` | そのまま使う | ビジュアルコンパニオンのJSヘルパー。WebSocket通信とDOM操作のみで構成されており、superpowers固有のロジックを含まないためそのまま利用可能 | そのままコピー |
| 11 | brainstorming | `skills/brainstorming/scripts/server.cjs` | そのまま使う | ビジュアルコンパニオンのWebSocketサーバー。Node.jsの標準モジュールのみで構成されており、superpowers固有のロジックを含まないためそのまま利用可能 | そのままコピー |
| 12 | brainstorming | `skills/brainstorming/scripts/start-server.sh` | そのまま使う | サーバー起動スクリプト。node実行コマンドのみで構成されており、superpowers固有のロジックを含まないためそのまま利用可能 | そのままコピー |
| 13 | brainstorming | `skills/brainstorming/scripts/stop-server.sh` | そのまま使う | サーバー停止スクリプト。プロセスkillコマンドのみで構成されており、superpowers固有のロジックを含まないためそのまま利用可能 | そのままコピー |
| 14 | writing-plans | `skills/writing-plans/SKILL.md` | 中身を差し替える | 計画フェーズのメインスキル。superpowersのbite-sizedタスク作成・Self-Review・実行方法選択（サブエージェント/インライン）のフローが書かれている。aide-claudeではAIDEの設計/実装オーケストレーターのタスク分解ロジック（impl-task-list.md生成、依存関係グラフ作成）に変わるため、タスク分解の手順と出力形式を書き換える | AIDEのタスク分解フローに書き換え |
| 15 | writing-plans | `skills/writing-plans/plan-document-reviewer-prompt.md` | 中身を差し替える | 計画書Self-Reviewのプロンプトテンプレート。superpowersの計画書形式（plan document）に対するレビュー観点が書かれている。aide-claudeではAIDEのタスクリスト形式（impl-task-list.md）に対するレビュー観点に変わるため、チェック項目を書き換える | AIDEのタスクリストレビュー観点に書き換え |
| 16 | subagent-driven-development | `skills/subagent-driven-development/SKILL.md` | 中身を差し替える | サブエージェント駆動実行のメインスキル。superpowersのタスク抽出→実装派遣→レビュー→完了のフローが書かれている。aide-claudeではAIDEの実装オーケストレーターのフロー（タスク選択→micro-impl-agent派遣→design-review + code-review→完了判定）に変わるため、派遣先エージェントとフロー全体を書き換える | AIDEの実装フローに書き換え |
| 17 | subagent-driven-development | `skills/subagent-driven-development/implementer-prompt.md` | 中身を差し替える | 実装サブエージェントのプロンプトテンプレート。superpowersの汎用実装指示が書かれている。aide-claudeではAIDEのmicro-impl-agentの指示（設計書参照セクション、テスト観点、依存先情報の受け渡し）に変わるため、プロンプト内容を書き換える | AIDEのmicro-impl-agent指示に書き換え |
| 18 | subagent-driven-development | `skills/subagent-driven-development/spec-reviewer-prompt.md` | 中身を差し替える | Spec Complianceレビューのプロンプトテンプレート。superpowersのspec document形式に対する準拠チェック指示が書かれている。aide-claudeではAIDEの設計書形式（object-design-*.md等）に対するdesign-review-agentの準拠チェック指示に変わるため、チェック対象と観点を書き換える | AIDEのdesign-review-agent指示に書き換え |
| 19 | subagent-driven-development | `skills/subagent-driven-development/code-quality-reviewer-prompt.md` | 中身を差し替える | Code Qualityレビューのプロンプトテンプレート。superpowersの汎用コード品質チェック指示が書かれている。aide-claudeではAIDEのcode-review-agentの指示（SOLID原則、レイヤー間import違反、テスト方針準拠等のAIDE固有の品質基準）に変わるため、チェック観点を書き換える | AIDEのcode-review-agent指示に書き換え |
| 20 | executing-plans | `skills/executing-plans/SKILL.md` | 中身を差し替える | サブエージェント非対応環境（Gemini CLI等）向けの代替実行フロー。superpowersのインライン実行ルールが書かれている。aide-claudeでもサブエージェント非対応プラットフォーム向けの代替フローとして残すが、AIDEのタスク実行ルール（設計書参照必須、レビュー手順等）に合わせて書き換える | AIDEのインライン実行ルールに書き換え |
| 21 | finishing-a-development-branch | `skills/finishing-a-development-branch/SKILL.md` | 中身を差し替える | ブランチ完成フロー。superpowersのテスト検証→4択提示→worktreeクリーンアップのフローが書かれている。aide-claudeではAIDEのgit-committerフロー（コミットメッセージルール、ユーザー承認取得、ドキュメント反映確認）に合わせて書き換える | AIDEのgit-committer連携フローに書き換え |
| 22 | using-git-worktrees | `skills/using-git-worktrees/SKILL.md` | そのまま使う | git worktreeによるワークスペース隔離。AIDE固有のロジックを含まず、gitの標準機能のみを使用するプラットフォーム非依存の汎用機能のためそのまま利用可能 | そのままコピー |

### 1.2 規律スキル（3つ）

実装サブエージェント内部で適用される品質規律スキル。

| # | スキル | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|---|
| 23 | test-driven-development | `skills/test-driven-development/SKILL.md` | そのまま使う | RED→GREEN→REFACTORサイクルの規律。AIDE固有のロジックを含まず、言語・フレームワーク非依存の汎用テストプラクティスのためそのまま利用可能 | そのままコピー |
| 24 | test-driven-development | `skills/test-driven-development/testing-anti-patterns.md` | そのまま使う | テストのアンチパターン集。AIDE固有のロジックを含まず、一般的なテスト品質の知見をまとめた汎用ドキュメントのためそのまま利用可能 | そのままコピー |
| 25 | systematic-debugging | `skills/systematic-debugging/SKILL.md` | そのまま使う | 根本原因特定→仮説→検証の4フェーズデバッグ規律。AIDE固有のロジックを含まず、汎用的なデバッグ手法のためそのまま利用可能 | そのままコピー |
| 26 | systematic-debugging | `skills/systematic-debugging/root-cause-tracing.md` | そのまま使う | 根本原因追跡の補助ドキュメント。AIDE固有のロジックを含まず、汎用的なトレース手法のためそのまま利用可能 | そのままコピー |
| 27 | systematic-debugging | `skills/systematic-debugging/defense-in-depth.md` | そのまま使う | 多層防御の補助ドキュメント。AIDE固有のロジックを含まず、汎用的な防御設計パターンのためそのまま利用可能 | そのままコピー |
| 28 | systematic-debugging | `skills/systematic-debugging/condition-based-waiting.md` | そのまま使う | 条件ベース待機の補助ドキュメント。AIDE固有のロジックを含まず、非同期処理の汎用パターンのためそのまま利用可能 | そのままコピー |
| 29 | systematic-debugging | `skills/systematic-debugging/condition-based-waiting-example.ts` | そのまま使う | 条件ベース待機のTypeScriptコード例。AIDE固有のロジックを含まず、汎用的な実装サンプルのためそのまま利用可能 | そのままコピー |
| 30 | systematic-debugging | `skills/systematic-debugging/find-polluter.sh` | そのまま使う | テスト汚染元特定スクリプト。AIDE固有のロジックを含まず、テスト順序依存を検出する汎用シェルスクリプトのためそのまま利用可能 | そのままコピー |
| 31 | systematic-debugging | `skills/systematic-debugging/CREATION-LOG.md` | 不要 | スキル作成時のログ。superpowers開発チームの内部メタ情報であり、aide-claudeのユーザーには不要 | — |
| 32 | systematic-debugging | `skills/systematic-debugging/test-academic.md` | 不要 | スキルのテストケース。superpowersのスキル品質検証用であり、aide-claudeのユーザーには不要 | — |
| 33 | systematic-debugging | `skills/systematic-debugging/test-pressure-1.md` | 不要 | スキルのテストケース。superpowersのスキル品質検証用であり、aide-claudeのユーザーには不要 | — |
| 34 | systematic-debugging | `skills/systematic-debugging/test-pressure-2.md` | 不要 | スキルのテストケース。superpowersのスキル品質検証用であり、aide-claudeのユーザーには不要 | — |
| 35 | systematic-debugging | `skills/systematic-debugging/test-pressure-3.md` | 不要 | スキルのテストケース。superpowersのスキル品質検証用であり、aide-claudeのユーザーには不要 | — |
| 36 | verification-before-completion | `skills/verification-before-completion/SKILL.md` | そのまま使う | 完了前検証の規律。AIDE固有のロジックを含まず、タスク完了前のチェックリスト実行という汎用プラクティスのためそのまま利用可能 | そのままコピー |

### 1.3 コラボレーションスキル（2つ）

コードレビューの依頼・受領に関するスキル。

| # | スキル | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|---|
| 37 | requesting-code-review | `skills/requesting-code-review/SKILL.md` | 中身を差し替える | レビュー依頼フロー。superpowersのcode-reviewer.mdエージェント（単一レビュアー）への派遣ロジックが書かれている。aide-claudeではAIDEの2段階レビュー（design-review-agent + code-review-agent）への派遣に変わるため、派遣先と手順を書き換える | AIDEのレビューエージェント派遣フローに書き換え |
| 38 | requesting-code-review | `skills/requesting-code-review/code-reviewer.md` | 中身を差し替える | レビュアーのプロンプトテンプレート。superpowersの汎用レビュー指示が書かれている。aide-claudeではAIDEのcode-review-agentの指示（SOLID原則、レイヤー間import違反、テスト方針準拠等のAIDE固有の品質基準）に変わるため、レビュー観点を書き換える | AIDEのcode-review-agent指示に書き換え |
| 39 | receiving-code-review | `skills/receiving-code-review/SKILL.md` | そのまま使う | レビュー指摘の受領・対応フロー。AIDE固有のロジックを含まず、指摘の分類→対応→再レビュー依頼という汎用プロセスのためそのまま利用可能 | そのままコピー |

### 1.4 ユーティリティスキル（2つ）

| # | スキル | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|---|
| 40 | dispatching-parallel-agents | `skills/dispatching-parallel-agents/SKILL.md` | そのまま使う | 並列サブエージェント派遣の汎用パターン。AIDE固有のロジックを含まず、Task/spawn_agent呼び出しの並列化という汎用テクニックのためそのまま利用可能 | そのままコピー |
| 41 | writing-skills | `skills/writing-skills/SKILL.md` | 中身を差し替える | スキル作成ガイド。superpowersのスキル構造規約（SKILL.md形式、トリガー条件、参照ファイル配置ルール等）が書かれている。aide-claudeではAIDEのスキル構造規約（オーケストレーター連携、エージェント定義形式等）に合わせて書き換える | AIDEのスキル作成ガイドに書き換え |
| 42 | writing-skills | `skills/writing-skills/anthropic-best-practices.md` | そのまま使う | Anthropicのプロンプトベストプラクティス。AIDE固有のロジックを含まず、LLMプロンプト設計の汎用知見のためそのまま利用可能 | そのままコピー |
| 43 | writing-skills | `skills/writing-skills/graphviz-conventions.dot` | そのまま使う | Graphviz記法の規約。AIDE固有のロジックを含まず、グラフ描画の汎用フォーマット定義のためそのまま利用可能 | そのままコピー |
| 44 | writing-skills | `skills/writing-skills/persuasion-principles.md` | そのまま使う | 説得原則の補助ドキュメント。AIDE固有のロジックを含まず、スキル設計時の汎用ガイドラインのためそのまま利用可能 | そのままコピー |
| 45 | writing-skills | `skills/writing-skills/render-graphs.js` | そのまま使う | グラフ描画スクリプト。AIDE固有のロジックを含まず、Graphvizレンダリングの汎用ユーティリティのためそのまま利用可能 | そのままコピー |
| 46 | writing-skills | `skills/writing-skills/testing-skills-with-subagents.md` | 不要 | スキルテストの方法論。superpowers開発チーム向けのテスト手順であり、aide-claudeのユーザーには不要 | — |
| 47 | writing-skills | `skills/writing-skills/examples/CLAUDE_MD_TESTING.md` | 不要 | テスト用CLAUDE.mdの例。superpowers開発チーム向けのテストフィクスチャであり、aide-claudeのユーザーには不要 | — |

---

## 2. agents/ — エージェント定義（1ファイル）

| # | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|
| 48 | `agents/code-reviewer.md` | 中身を差し替える | superpowersの汎用コードレビューエージェント（単一エージェントで設計準拠+コード品質を両方チェック）。aide-claudeではAIDEの2段階レビュー体制（design-review-agent: 設計書との整合性チェック + code-review-agent: コード内部品質チェック）に分離するため、エージェント定義を分割・書き換えする | AIDEのレビューエージェント定義に書き換え。agents/に複数エージェント（design-review-agent.md, code-review-agent.md等）を配置 |

---

## 3. hooks/ — セッション開始フック（4ファイル）

| # | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|
| 49 | `hooks/hooks.json` | 中身を差し替える | Claude Code向けフック定義。セッション開始時にusing-superpowersスキルを注入する設定が書かれている。aide-claudeではusing-aide-powersスキルを注入する設定に変えるため、パス参照を書き換える | パス参照をusing-aide-powersに変更 |
| 50 | `hooks/hooks-cursor.json` | 中身を差し替える | Cursor向けフック定義。superpowersのCursor用セッション開始設定が書かれている。aide-claudeは8プラットフォーム対応のため、Cursor上で動作する際のフック設定として必要。パス参照をaide-claudeに合わせて差し替える | パス参照をusing-aide-powersに変更 |
| 51 | `hooks/session-start` | 中身を差し替える | セッション開始スクリプト。using-superpowers/SKILL.mdを読み込んでJSON出力するロジックが書かれている。aide-claudeではusing-aide-powers/SKILL.mdを読み込むようにパス参照を書き換える | パス参照をusing-aide-powersに変更 |
| 52 | `hooks/run-hook.cmd` | そのまま使う | Windows向けフック実行ラッパー。AIDE固有のロジックを含まず、bashスクリプトをcmd.exe経由で実行する汎用ラッパーのためそのまま利用可能 | そのままコピー |

---

## 4. プラットフォーム固有設定

| # | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|
| 53 | `.claude-plugin/plugin.json` | 中身を差し替える | Claude Codeプラグイン定義。名前・説明・スキルパス等がsuperpowersになっている。aide-claudeでは名前・説明をaide-claudeに変更し、スキルパスをaide-claude構成に合わせる | 名前・説明をaide-claudeに変更 |
| 54 | `.claude-plugin/marketplace.json` | 不要 | Claude Codeマーケットプレイス公開用メタデータ（公開名、カテゴリ、スクリーンショット等）。aide-claudeは社内限定配布でマーケットプレイス公開しないため不要 | — |
| 55 | `.cursor-plugin/plugin.json` | 中身を差し替える | Cursor向けプラグイン定義。superpowersのCursor用プラグインメタデータが書かれている。aide-claudeは8プラットフォーム対応のため、Cursor上で動作する際のプラグイン定義として必要。名前・説明・スキルパスをaide-claudeに合わせて差し替える | 名前・説明をaide-claudeに変更 |
| 56 | `.codex/INSTALL.md` | 中身を差し替える | Codex CLI向けインストールガイド。superpowersのCodex用セットアップ手順が書かれている。aide-claudeは8プラットフォーム対応のため、Codex CLI上でaide-claudeをセットアップする手順として必要。インストール手順をaide-claudeに合わせて差し替える | aide-claudeのCodexインストールガイドに書き換え |
| 57 | `.opencode/INSTALL.md` | 中身を差し替える | OpenCode向けインストールガイド。superpowersのOpenCode用セットアップ手順が書かれている。aide-claudeは8プラットフォーム対応のため、OpenCode上でaide-claudeをセットアップする手順として必要。インストール手順をaide-claudeに合わせて差し替える | aide-claudeのOpenCodeインストールガイドに書き換え |
| 58 | `.opencode/plugins/superpowers.js` | 中身を差し替える | OpenCode向けプラグインスクリプト。superpowersのOpenCode用プラグインロジックが書かれている。aide-claudeは8プラットフォーム対応のため、OpenCode上で動作する際のプラグインとして必要。プラグイン名・参照パスをaide-claudeに合わせて差し替える | aide-claudeのOpenCodeプラグインに書き換え |
| 59 | `GEMINI.md` | 中身を差し替える | Gemini CLI向け設定。superpowersのGemini用グローバル設定（スキル読み込み、ツールマッピング参照等）が書かれている。aide-claudeは8プラットフォーム対応のため、Gemini CLI上で動作する際の設定として必要。参照先をaide-claudeに合わせて差し替える | aide-claudeのGemini設定に書き換え |
| 60 | `gemini-extension.json` | 中身を差し替える | Gemini CLI向け拡張定義。superpowersのGemini用拡張メタデータが書かれている。aide-claudeは8プラットフォーム対応のため、Gemini CLI上で動作する際の拡張定義として必要。名前・説明をaide-claudeに合わせて差し替える | aide-claudeのGemini拡張定義に書き換え |

---

## 5. ルートファイル

| # | ファイル | 判定 | 理由 | aide-claudeでの対応 |
|---|---|---|---|---|
| 61 | `AGENTS.md` | 中身を差し替える | マルチプラットフォーム対応のエージェント設定（CLAUDE.mdへの参照を含む）。superpowersのグローバルルールが書かれている。aide-claudeではAIDEのグローバルルール（フェーズ省略禁止、敬語ルール、オーケストレーター実作業禁止等）を記載するため、ルール内容を全面書き換えする | AIDEのグローバルルール（フェーズ省略禁止、敬語等）に書き換え |
| 62 | `CLAUDE.md` | 不要 | superpowersリポジトリ自体のコントリビューターガイドライン（PR要件、受入基準、スキル変更ルール）。aide-claudeのプラグインとして配布する際にはこのファイルは動作しない（ユーザーのプロジェクトのCLAUDE.mdとは別物） | — |
| 63 | `package.json` | 不要 | superpowersのnpmパッケージ定義（バージョン管理・依存関係）。aide-claudeはnpmパッケージとして配布しないため不要 | — |
| 64 | `.version-bump.json` | 不要 | バージョン番号同期の対象ファイル定義（plugin.json等への一括反映）。aide-claudeは独自のバージョン管理を行うため不要 | — |
| 65 | `README.md` | 中身を差し替える | プロジェクト説明。superpowersの概要・インストール手順・使い方が書かれている。aide-claudeの概要・8プラットフォーム対応のインストール手順・AIDEの使い方に書き換える | aide-claudeのREADMEに書き換え |
| 66 | `.gitignore` | そのまま使う | git除外設定。AIDE固有のロジックを含まず、node_modules等の標準的な除外パターンのためそのまま利用可能 | そのままコピー |
| 67 | `.gitattributes` | そのまま使う | git属性設定。AIDE固有のロジックを含まず、改行コード等の標準的なgit属性設定のためそのまま利用可能 | そのままコピー |

---

## 6. 開発者向けファイル（不要）

superpowersの開発・運用に使われるファイル。aide-claudeのユーザーが使う際には動かない。

| # | ファイル | 判定 | 理由 |
|---|---|---|---|
| 68 | `CHANGELOG.md` | 不要 | superpowersの変更履歴。aide-claudeは独自の変更履歴を管理するため不要 |
| 69 | `RELEASE-NOTES.md` | 不要 | superpowersのリリースノート。aide-claudeは独自のリリースノートを管理するため不要 |
| 70 | `CODE_OF_CONDUCT.md` | 不要 | superpowersの行動規範。aide-claudeは社内限定配布のため不要 |
| 71 | `LICENSE` | 不要 | superpowersのライセンス。aide-claudeは独自ライセンスを適用するため不要 |
| 72 | `scripts/bump-version.sh` | 不要 | バージョン番号同期ユーティリティ。aide-claudeは独自のバージョン管理を行うため不要 |
| 73 | `commands/brainstorm.md` | 不要 | 非推奨（deprecated）スラッシュコマンド。superpowers自体で非推奨のため不要 |
| 74 | `commands/execute-plan.md` | 不要 | 非推奨（deprecated）スラッシュコマンド。superpowers自体で非推奨のため不要 |
| 75 | `commands/write-plan.md` | 不要 | 非推奨（deprecated）スラッシュコマンド。superpowers自体で非推奨のため不要 |
| 76 | `.github/FUNDING.yml` | 不要 | GitHubスポンサー設定。aide-claudeは社内限定配布のため不要 |
| 77 | `.github/PULL_REQUEST_TEMPLATE.md` | 不要 | superpowersのPRテンプレート。aide-claudeは独自のPRテンプレートを使用するため不要 |
| 78 | `.github/ISSUE_TEMPLATE/bug_report.md` | 不要 | superpowersのバグ報告テンプレート。aide-claudeは独自のIssue管理を行うため不要 |
| 79 | `.github/ISSUE_TEMPLATE/config.yml` | 不要 | superpowersのIssueテンプレート設定。aide-claudeは独自のIssue管理を行うため不要 |
| 80 | `.github/ISSUE_TEMPLATE/feature_request.md` | 不要 | superpowersの機能要望テンプレート。aide-claudeは独自のIssue管理を行うため不要 |
| 81 | `.github/ISSUE_TEMPLATE/platform_support.md` | 不要 | superpowersのプラットフォームサポート要望テンプレート。aide-claudeは独自のIssue管理を行うため不要 |
| 82 | `.kiro/specs/superpowers/` （全ファイル） | 不要 | superpowers自体の設計ドキュメント（user-requirements.md, system-requirements.md等）。aide-claudeは独自の設計ドキュメントを作成するため不要 |
| 83 | `tests/` （全ファイル） | 不要 | superpowersのスキルテスト（brainstorm-server/, claude-code/等）。aide-claudeは独自のテストを作成するため不要 |
| 84 | `docs/` （全ファイル） | 不要 | superpowersのドキュメント・計画書（plans/, superpowers/等）。aide-claudeは独自のドキュメントを作成するため不要 |

---

## 集計

| 分類 | 件数 | ファイル数（概算） |
|---|---|---|
| **そのまま使う** | 25件 | #8-13, 22-30, 36, 39-40, 42-45, 52, 66-67 |
| **中身を差し替える** | 30件 | #1-4, 6-7, 14-21, 37-38, 41, 48-51, 53, 55-61, 65 |
| **新規作成** | 1件 | #5（kiro-tools.md） |
| **不要** | 28件 | #31-35, 46-47, 54, 62-64, 68-84 |

### 分類別の作業量見積もり

- **そのまま使う（25件）**: コピーするだけ。作業コストほぼゼロ
- **中身を差し替える（30件）**: aide-claudeの中核作業。AIDEのオーケストレーター/エージェント体系に合わせた書き換えが必要
  - 最も作業量が大きいのは: using-superpowers, brainstorming, subagent-driven-development, writing-plans の各SKILL.md（メインフローの書き換え）
  - 中程度の作業量: プラットフォーム固有設定（#55-60）のaide-claude対応（名前・パス・手順の差し替え）、ツールマッピングファイル（#2-4）のaide-claudeスキル対応
  - 比較的軽いのは: hooks/hooks.json, hooks/session-start, .claude-plugin/plugin.json（パス参照やメタデータの変更のみ）
- **新規作成（1件）**: kiro-tools.md — Kiro向けツールマッピング表の新規作成
- **不要（28件）**: 無視してよい。大半はsuperpowers開発者向けファイル
