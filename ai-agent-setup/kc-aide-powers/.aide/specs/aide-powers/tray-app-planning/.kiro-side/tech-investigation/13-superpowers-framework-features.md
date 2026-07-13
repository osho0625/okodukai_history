# superpowers フレームワーク機能一覧

## 概要

既存の技術調査資料（01〜12）から抽出した、superpowersのフレームワーク機能（aide-claudeでも採用できる仕組み・パターン・手法）の統合リスト。

全12ソースから抽出された延べ200+項目を重複排除・統合し、7カテゴリに分類した。

---

## カテゴリ別フレームワーク機能

### 1. ワークフロー

#### F-WF-01: フラット委譲構造

- **説明**: オーケストレーターがサブエージェントを直接呼び出すフラットな構造。深いネストを避け、制御の見通しを良くする
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md)

#### F-WF-02: 計画書駆動実行パイプライン

- **説明**: 計画書（plan.md等）を作成し、その計画に基づいてサブエージェントが順次実行するパイプライン方式。Do/Verify構造を含む
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-WF-03: always/manualの二分類変換パターン

- **説明**: スキルの読み込みモードをalways（常時読み込み）とmanual（必要時のみ）の2種類に分類し、コンテキスト効率を最適化する
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-WF-04: スラッシュコマンドによるワークフロー起動

- **説明**: `/command` 形式のスラッシュコマンドでワークフローを明示的に起動する仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-WF-05: メタスキルによるスキル自動選択

- **説明**: メタスキル（ハブスキル）がユーザー入力を解析し、適切なスキルを自動的にルーティングする仕組み
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-06: 対話フェーズと作業フェーズの分離

- **説明**: ユーザーとの対話（ヒアリング・合意取得）フェーズと、実際の作業（コード生成・ファイル操作）フェーズを明確に分離する設計パターン
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-WF-07: フォアグラウンド実行によるフェーズ管理

- **説明**: サブエージェントをフォアグラウンドで順次実行し、各フェーズの完了を確認してから次に進む制御方式
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-WF-08: エスカレーションパターン（3分類）

- **説明**: サブエージェントからオーケストレーターへの問い合わせを、ヒアリング型・合意取得型・承認型の3種類に分類して制御するパターン
- **出典**: [05-askuserquestion-subagent-constraint.md](./05-askuserquestion-subagent-constraint.md), [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-WF-09: ユーザー対話パターンの3分類体系

- **説明**: ユーザーとの対話を「ヒアリング」「合意取得」「承認」の3パターンに体系化し、各パターンに適した対話フローを定義する
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-WF-10: 変換優先順位の使用頻度ベース決定

- **説明**: 複数の変換候補がある場合、使用頻度に基づいて優先順位を決定する方式
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-WF-11: pending-issues.mdによる横断的課題管理

- **説明**: フェーズ横断的な課題・未解決事項をpending-issues.mdファイルで一元管理し、適切なタイミングで対処する仕組み
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-WF-12: キーワードベース動的アクティベーション

- **説明**: ユーザー入力のキーワードに基づいて、関連するスキルやワークフローを動的にアクティベートする仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-WF-13: セッション開始時ブートストラップ

- **説明**: セッション開始時に必要なコンテキスト（設定、スキル一覧、プロジェクト情報等）を自動的に読み込むブートストラップ処理
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md), [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-WF-14: Coordinator and Workerパターン

- **説明**: Coordinatorが全体を統括し、Workerが個別タスクを実行する分業パターン。オーケストレーターとサブエージェントの関係に対応
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-WF-15: ライフサイクルフック（8種類）

- **説明**: セッション開始・終了、サブエージェント開始・終了等のライフサイクルイベントにフックを定義し、自動処理を挿入する仕組み
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-WF-16: Multi-perspective Code Reviewパターン

- **説明**: 複数の観点（設計準拠、コード品質、テスト等）から並列にコードレビューを実施するパターン
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-WF-17: プロンプト→期待スキルのマッピングテスト構造

- **説明**: 特定のプロンプト入力に対して期待されるスキルが呼び出されるかを検証するテスト構造
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-WF-18: 9ステップチェックリスト駆動の設計プロセス

- **説明**: 設計作業を9ステップのチェックリストに分解し、各ステップの完了を確認しながら進める方式
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-19: bite-sizedタスク分解

- **説明**: 大きなタスクを小さな実行可能単位（bite-sized）に分解し、段階的に実行する手法
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-20: 実行方法の選択提示

- **説明**: タスク実行時に複数の実行方法（自動実行、手動確認付き等）をユーザーに提示し、選択させるパターン
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-21: 一方向チェーンワークフロー

- **説明**: フェーズを一方向に順次進行させ、前のフェーズに戻らないチェーン型ワークフロー
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-22: Scope Check

- **説明**: タスク実行前にスコープ（対象範囲）を確認し、範囲外の作業を防止するチェック機構
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-WF-23: ブランチ完了時の4択オプション提示パターン

- **説明**: ブランチの作業完了時に次のアクション（マージ、追加作業、レビュー依頼等）を4択で提示するパターン
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-WF-24: ワークフローチェーン

- **説明**: 複数のワークフローを連鎖的に実行し、前のワークフローの出力を次の入力とするパターン
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-WF-25: Red-Green-Refactorサイクル

- **説明**: TDDのRed-Green-Refactorサイクルをワークフローとして組み込み、テスト駆動で開発を進める手法
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-WF-26: 4フェーズ体系的デバッグプロセス

- **説明**: デバッグを「再現→原因特定→修正→検証」の4フェーズに体系化し、各フェーズの手順を明確にするプロセス
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-WF-27: Defense in Depth

- **説明**: 複数の防御層（バリデーション、型チェック、テスト等）を重ねて品質を担保する多層防御アプローチ
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-WF-28: TDDをスキル作成に適用するメタ手法

- **説明**: スキル自体の作成にTDDを適用し、テストファーストでスキルを開発するメタ手法
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-WF-29: エージェント定義とプロンプトテンプレートの分離

- **説明**: エージェントの定義（メタデータ）とプロンプトテンプレート（実行指示）を別ファイルに分離する設計パターン
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-WF-30: CLAUDE.mdとスキルの役割分担パターン

- **説明**: CLAUDE.md（基盤ルール）とスキル（専門知識）の役割を明確に分担し、それぞれの責務を限定する設計パターン
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-WF-31: 200行制限に対する3層分割戦略

- **説明**: CLAUDE.mdの200行制限に対し、基盤ルール・スキル・サブエージェントの3層に分割してコンテキストを管理する戦略
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-WF-32: CLAUDE.md記載内容の優先順位付け

- **説明**: CLAUDE.mdに記載する内容に優先順位を付け、最も重要なルールを上位に配置する方式
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-WF-33: compaction後のCLAUDE.md再読み込み活用

- **説明**: コンテキストcompaction後にCLAUDE.mdが再読み込みされる特性を活用し、重要ルールの永続化を図る手法
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)


---

### 2. サブエージェント

#### F-SA-01: コンテキスト完全注入パターン

- **説明**: サブエージェント起動時に必要なコンテキスト（ファイル内容、設計情報等）を完全に注入し、サブエージェントが自律的に作業できるようにするパターン
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md)

#### F-SA-02: カスタムサブエージェント定義（ファイルベース）

- **説明**: サブエージェントの定義をYAMLフロントマター付きのMarkdownファイルで行い、再利用可能な形で管理する方式
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md), [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-03: 実装者ステータスプロトコル（4ステータス）

- **説明**: サブエージェントの応答をステータスコード（成功・失敗・エスカレーション・部分完了等）で体系化し、オーケストレーターが適切にハンドリングするプロトコル
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [05-askuserquestion-subagent-constraint.md](./05-askuserquestion-subagent-constraint.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-SA-04: モデル選択戦略

- **説明**: タスクの複雑度や種類に応じて、サブエージェントごとに使用するLLMモデルを選択する戦略。inherit指定による親モデル継承を含む
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md), [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-05: 並列サブエージェントディスパッチ

- **説明**: 独立したタスクを複数のサブエージェントに並列で委譲し、効率的に処理する方式。プロンプト設計3原則と適用判断フローを含む
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-SA-06: プロンプトテンプレート方式

- **説明**: サブエージェントへの指示をテンプレート化し、{role}-prompt.md等の命名規約で管理する方式
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md), [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-07: サブエージェントへのスキル事前注入

- **説明**: サブエージェント起動時に必要なスキル（専門知識）を事前に注入し、サブエージェントが適切な知識を持って作業できるようにするパターン
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SA-08: ステアリング→サブエージェント統合パターン

- **説明**: ステアリングファイル（指示書）の内容をサブエージェントの定義に統合し、エージェント定義＋ステアリングを一体化するパターン
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-SA-09: オーケストレーターの対話代行パターン

- **説明**: サブエージェントが直接ユーザーと対話できない場合に、オーケストレーターが対話を代行し、結果をサブエージェントに伝達するパターン
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SA-10: サブエージェントのツールホワイトリスト制限

- **説明**: サブエージェントが使用できるツールをホワイトリストで制限し、意図しない操作を防止する仕組み
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-SA-11: コンテキスト節約のためのサブエージェント委譲

- **説明**: オーケストレーターのコンテキストウィンドウを節約するため、詳細な作業をサブエージェントに委譲する戦略
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SA-12: サブエージェント起動前の事前質問プロンプト

- **説明**: サブエージェント起動前に必要な情報をユーザーから収集するための事前質問プロンプトを定義するパターン
- **出典**: [05-askuserquestion-subagent-constraint.md](./05-askuserquestion-subagent-constraint.md)

#### F-SA-13: fileMatchステアリングのレビューエージェント統合

- **説明**: ファイルパターンマッチングに基づくステアリングをレビューエージェントに統合し、ファイル種別に応じたレビューを自動化するパターン
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-SA-14: 複数ステアリングのモード別統合

- **説明**: 複数のステアリングファイルをモード（always/manual等）別に統合し、効率的に管理するパターン
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-SA-15: invokeSubAgent呼び出しテンプレートのTask変換

- **説明**: invokeSubAgent呼び出しをTask形式のテンプレートに変換し、再利用可能な形で管理する方式
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-SA-16: SubagentStartフック

- **説明**: サブエージェント起動時に自動的に実行されるフック。コンテキスト注入や初期化処理に使用
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-SA-17: descriptionフィールドによるエージェント自動ルーティング

- **説明**: エージェント定義のdescriptionフィールドを基に、タスク内容に最適なエージェントを自動的にルーティングする仕組み
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-18: agents/とskills/の2層エージェント配置パターン

- **説明**: エージェント定義をagents/ディレクトリとskills/ディレクトリの2層に配置し、役割に応じて管理するパターン
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-19: Task tool typeによるエージェント指定パターン

- **説明**: Task toolのtype指定により、特定のエージェントを明示的に呼び出すパターン
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-SA-20: 3段階サブエージェントパイプライン

- **説明**: 設計→実装→レビューの3段階でサブエージェントを順次実行するパイプラインパターン
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-SA-21: コンテキスト隔離

- **説明**: 並列実行するサブエージェント間でコンテキストを隔離し、相互干渉を防止する仕組み
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)


---

### 3. スキル

#### F-SK-01: プログレッシブ・ディスクロージャー

- **説明**: スキルの内容を段階的に開示し、必要な時に必要な情報だけをコンテキストに読み込む方式。コンテキストウィンドウの効率的利用を実現
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-SK-02: スキルのオンデマンド読み込み

- **説明**: スキルを事前に全て読み込むのではなく、必要になった時点で動的に読み込む方式
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-SK-03: スキルのdescriptionベース自動選択トリガー

- **説明**: スキルのdescriptionフィールドに記載されたキーワードや説明文を基に、ユーザー入力に最適なスキルを自動的に選択・トリガーする仕組み
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SK-04: スキルのディレクトリ構造規約

- **説明**: スキルファイルの配置ディレクトリに規約を設け、自動検出・分類を可能にする構造設計
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-SK-05: スキルのフロントマターによるメタデータ定義

- **説明**: スキルファイルの先頭にYAMLフロントマターでメタデータ（description、alwaysApply、disallowedTools等）を定義する方式
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-SK-06: スキルの自動発見・強制適用

- **説明**: ディレクトリ規約に基づいてスキルを自動発見し、条件に合致する場合は強制的に適用する仕組み。言語パターンによる強制呼び出しを含む
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SK-07: Agent Skills標準

- **説明**: スキルの定義・配置・読み込み・選択に関する標準仕様。複数プラットフォームで共通利用可能な形式
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-SK-08: 複数配置パスによるスキル検索

- **説明**: スキルファイルを複数のディレクトリパスから検索し、プロジェクト・ユーザー・グローバルの各レベルで管理する仕組み
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md), [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-SK-09: disallowedToolsによるスキル内ツール制限

- **説明**: スキルのフロントマターでdisallowedToolsを指定し、そのスキルが有効な間に使用できないツールを制限する仕組み
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-SK-10: オーケストレーターのスキル化

- **説明**: オーケストレーターの機能自体をスキルとして定義し、再利用可能な形で管理するパターン
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-SK-11: ペアスキルパターン

- **説明**: 2つのスキルをペアで使用する設計パターン。一方が作業を行い、もう一方がレビュー・検証を行う
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-SK-12: Red Flags / Common Mistakesパターン（スキル内）

- **説明**: スキル内にRed Flags（危険信号）やCommon Mistakes（よくある間違い）のリストを埋め込み、AIが自己チェックできるようにするパターン
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-SK-13: CSO（Cognitive Style Override）

- **説明**: スキル内でAIの認知スタイル（思考パターン、判断基準等）を上書きし、特定の振る舞いを強制する手法
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-SK-14: LLM説得原則

- **説明**: LLMに特定の行動を取らせるための説得原則。理由の明示、具体例の提示、禁止事項の明確化等のテクニック
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-SK-15: Anthropicベストプラクティス

- **説明**: Anthropic社が推奨するプロンプトエンジニアリングのベストプラクティスをスキル設計に適用する手法
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)


---

### 4. 規律

#### F-DS-01: 完了前検証の鉄則（Iron Law）

- **説明**: タスク完了を宣言する前に必ず検証（テスト実行、ビルド確認等）を行うことを絶対ルールとして強制する仕組み。Common Rationalizationsテーブルで言い訳パターンも封じる
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-DS-02: 2段階レビューパターン

- **説明**: セルフレビュー（自己検証）とサブエージェントレビュー（第三者検証）の2段階でレビューを実施するパターン
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-DS-03: レビューループ

- **説明**: レビュー→修正→再レビューのループを、品質基準を満たすまで繰り返す仕組み
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md)

#### F-DS-04: 設定ファイルの多階層マージ

- **説明**: プロジェクト・ユーザー・グローバルの各階層の設定ファイルをマージし、優先順位に基づいて最終設定を決定する仕組み
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-DS-05: 優先順位の3層モデル

- **説明**: 指示の優先順位をプロジェクト > ユーザー > グローバルの3層で管理し、競合時の解決ルールを明確にするモデル
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md), [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-DS-06: CLAUDE.md基盤ルール圧縮

- **説明**: CLAUDE.mdに記載する基盤ルールを最小限に圧縮し、詳細はスキルに委譲する設計パターン
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md), [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-DS-07: オーケストレーター実作業禁止の仕組み

- **説明**: オーケストレーターがファイル書き込み・コード変更等の実作業を行うことを禁止し、全てサブエージェントに委譲させる仕組み
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-DS-08: QAゲートによるフェーズ遷移制御

- **説明**: フェーズ間の遷移にQA（品質保証）ゲートを設け、品質基準を満たさない場合は次のフェーズに進めない制御機構
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-DS-09: フェーズ省略絶対禁止ルール

- **説明**: いかなる理由（緊急度、単純さ、時間制約等）があってもフェーズの省略を認めない絶対ルール
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-DS-10: ドキュメント駆動開発の配置規約

- **説明**: ドキュメント駆動開発におけるドキュメントの配置場所・命名規則・更新タイミングを規約として定義する仕組み
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md)

#### F-DS-11: Rigid/Flexibleスキル分類

- **説明**: スキルをRigid（厳格に従うべき）とFlexible（状況に応じて柔軟に適用）の2種類に分類し、適用の厳格度を制御する仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-DS-12: Red Flagsテーブル

- **説明**: AIが陥りやすい危険な行動パターン（フェーズスキップ、検証省略等）をテーブル形式でリスト化し、自己チェックに使用する仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md), [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md), [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-DS-13: Gate Function（HARD-GATE）

- **説明**: 特定の条件を満たさない限り次のステップに進めないゲート関数。プロンプト内で明示的に定義し、AIの自己判断による省略を防止
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md), [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-DS-14: プレースホルダー禁止ルール

- **説明**: コード生成時に「TODO」「後で実装」等のプレースホルダーを残すことを禁止し、完全な実装を強制するルール
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-DS-15: 計画の批判的レビュー後実行

- **説明**: 計画を作成した後、批判的な視点でレビューしてから実行に移す規律。計画の欠陥を事前に発見する
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-DS-16: ユーザー指示のWHAT/HOW分離

- **説明**: ユーザーの指示を「何をするか（WHAT）」と「どうやるか（HOW）」に分離し、WHATを優先してHOWは柔軟に対応する規律
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-DS-17: 構造化レビューチェックリスト＋判定出力形式

- **説明**: レビュー時にチェックリスト形式で項目を検証し、PASS/FAIL等の判定を構造化された形式で出力する仕組み
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-18: レビュー受領時の技術的検証ファーストパターン

- **説明**: レビュー指摘を受けた際に、まず技術的に正しいかを検証してから対応する規律。盲目的な修正を防止
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-19: YAGNIチェック

- **説明**: 実装時に「You Aren't Gonna Need It」の原則に基づき、不要な機能・抽象化の追加を防止するチェック
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-20: レビュー指摘の優先順実装

- **説明**: レビューで指摘された項目を優先度順に並べ、重要度の高いものから順に対応する規律
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-21: テスト通過ゲート

- **説明**: テストが全て通過しない限り次のステップに進めないゲート。CI/CDパイプラインのゲートに相当
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-22: レビュー依頼のMandatory/Optionalタイミング定義

- **説明**: レビュー依頼のタイミングを必須（Mandatory）と任意（Optional）に分類し、各タイミングを明確に定義する仕組み
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-23: Source-Specific Handling

- **説明**: 情報ソースの種類（ユーザー指示、設計書、コード等）に応じて、異なる処理ルールを適用する規律
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-DS-24: Common Rationalizationsテーブル

- **説明**: AIが規律を破る際に使いがちな合理化パターン（「シンプルだから」「時間がないから」等）をテーブル化し、事前に封じる仕組み
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-DS-25: premature action検出

- **説明**: 十分な情報収集・計画なしに早まった行動を取ることを検出し、防止する仕組み
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-DS-26: Spec Compliance検証

- **説明**: 実装が仕様書（Spec）に準拠しているかを自動的に検証する仕組み
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-DS-27: プロンプトベースのツール制限

- **説明**: プロンプト内の指示でツールの使用を制限する方式。フロントマターのdisallowedToolsとは別に、プロンプト文中で制限を記述
- **出典**: [04-aide-features-detailed-verification.md](./04-aide-features-detailed-verification.md)

#### F-DS-28: システムプロンプトの3部構成パターン

- **説明**: システムプロンプトを「役割定義」「行動規則」「出力形式」の3部で構成する標準パターン
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-DS-29: 問題重要度の3段階分類

- **説明**: 発見された問題をCritical/Major/Minorの3段階で分類し、対応の優先順位を決定する仕組み
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-DS-30: ゼロ依存原則

- **説明**: スキルやプラグインが外部依存を持たず、単体で動作することを原則とする設計方針
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-DS-31: 意図的な用語選択の保護

- **説明**: 設計書やスキルで意図的に選択された用語（技術用語、ドメイン用語等）をAIが勝手に言い換えることを防止する規律
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-DS-32: 不受理カテゴリの明示的分類

- **説明**: AIが対応すべきでないリクエストのカテゴリを明示的に分類し、適切に拒否する仕組み
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-DS-33: AIエージェント向けルール記述パターン

- **説明**: AIエージェントが確実に従うルールの記述パターン。「絶対禁止」「必ず〜すること」等の強い表現と具体例の組み合わせ
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-DS-34: Human Partner's Signals

- **説明**: ユーザー（Human Partner）の発言パターンから意図や感情を読み取り、適切に対応するためのシグナル定義
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)


---

### 5. テスト

#### F-TS-01: 2段階レビューゲート

- **説明**: セルフレビューとサブエージェントレビューの2段階でゲートを設け、両方を通過しないと次に進めない仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-TS-02: 自前テストランナーパターン

- **説明**: 既存のテストフレームワークに依存せず、自前のテストランナーを構築してスキルやエージェントの振る舞いをテストするパターン
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-03: CLIヘッドレス実行によるスキル振る舞いテスト

- **説明**: CLIの非対話モード（ヘッドレス）でスキルを実行し、期待通りの振る舞いをするかテストする方式
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-04: テストヘルパーライブラリパターン

- **説明**: テスト用のヘルパー関数・ユーティリティをライブラリとして整備し、テストコードの重複を削減するパターン
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-05: Fast/Integrationテスト分離

- **説明**: 高速に実行できるテスト（Fast）とLLM呼び出しを含む統合テスト（Integration）を分離し、開発サイクルに応じて使い分ける方式
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md), [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-06: スキル知識テスト

- **説明**: スキルが正しい知識（ルール、手順等）を保持しているかを検証するテスト。スキルの内容の正確性を担保
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-07: セッションJSONL解析によるツール呼び出し検証

- **説明**: セッションログ（JSONL形式）を解析し、期待通りのツールが呼び出されたかを検証するテスト手法
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-08: 意図的欠陥テスト

- **説明**: 意図的にコードに欠陥を埋め込み、AIがそれを検出・修正できるかをテストする手法
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-09: プロセスライフサイクル管理テストパターン

- **説明**: サブエージェントやプロセスの起動・実行・終了のライフサイクルが正しく管理されるかをテストするパターン
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-10: クロスプラットフォームテスト

- **説明**: 複数のプラットフォーム（OS、エディタ等）でスキルやプラグインが正しく動作するかを検証するテスト
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-11: テストランナーの設計パターン

- **説明**: テストランナー自体の設計パターン。テスト発見・実行・結果集計・レポート生成の各機能を含む
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md), [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-12: 暗黙的スキルトリガーテスト

- **説明**: ユーザーがスキル名を明示せずに入力した場合に、適切なスキルが暗黙的にトリガーされるかを検証するテスト
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TS-13: 明示的スキルリクエストテスト

- **説明**: ユーザーがスキル名を明示的に指定した場合に、正しいスキルが呼び出されるかを検証するテスト
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TS-14: マルチターン会話でのスキル呼び出し安定性テスト

- **説明**: 複数ターンの会話を通じて、スキルの呼び出しが安定して行われるかを検証するテスト
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TS-15: モデル差テスト

- **説明**: 異なるLLMモデル間でスキルの振る舞いに差異がないかを検証するテスト
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TS-16: AI自身が説明した後の呼び出しスキップ問題の検出テスト

- **説明**: AIがスキルの内容を説明した後に、実際のスキル呼び出しをスキップしてしまう問題を検出するテスト
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TS-17: 隔離テスト環境構築パターン

- **説明**: テスト実行用の隔離された環境（一時ディレクトリ、独立設定等）を構築し、テスト間の干渉を防止するパターン
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-18: マーカー文字列による出力検証パターン

- **説明**: 出力に特定のマーカー文字列を埋め込み、その存在を確認することで正しい処理が行われたかを検証するパターン
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-19: スキル優先度解決テストパターン

- **説明**: 複数のスキルが競合する場合に、優先度に基づいて正しいスキルが選択されるかを検証するテストパターン
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-20: design.md + plan.md + scaffold.shの3点セットE2Eテスト

- **説明**: 設計書・計画書・初期化スクリプトの3点セットでE2E（エンドツーエンド）テストを構成する方式
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-21: LLM非対話実行によるE2Eテスト

- **説明**: LLMを非対話モードで実行し、入力から出力までの全体フローをE2Eテストする方式
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-22: トークン使用量の追跡・測定パターン

- **説明**: テスト実行時のトークン使用量を追跡・測定し、コスト効率やコンテキスト使用量を分析するパターン
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md), [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TS-23: LLM呼び出しのタイムアウト設定

- **説明**: LLM呼び出しにタイムアウトを設定し、無限待ちを防止する仕組み
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-24: scaffold.shによるプロジェクト初期化パターン

- **説明**: テスト用プロジェクトの初期化をscaffold.shスクリプトで自動化するパターン
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-25: テストプロジェクトの技術スタック多様性

- **説明**: 複数の技術スタック（Python、TypeScript等）でテストプロジェクトを用意し、スキルの汎用性を検証する方式
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-26: 権限設定のプロジェクト別カスタマイズ

- **説明**: テストプロジェクトごとに権限設定をカスタマイズし、異なる権限環境での動作を検証する仕組み
- **出典**: [09c-superpowers-tests-integration.md](./09c-superpowers-tests-integration.md)

#### F-TS-27: 仕様準拠レビューの独立検証原則

- **説明**: 仕様への準拠を検証するレビューを、実装者とは独立した検証者が行う原則
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-TS-28: 並列結果の統合検証手順

- **説明**: 並列実行されたサブエージェントの結果を統合し、整合性を検証する手順
- **出典**: [10b-superpowers-skills-collaboration.md](./10b-superpowers-skills-collaboration.md)

#### F-TS-29: プレッシャーテストによるスキル検証

- **説明**: スキルに対して意図的に困難な状況（曖昧な指示、矛盾する要求等）を与え、適切に対応できるかを検証するテスト
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-TS-30: Testing Anti-Patterns

- **説明**: テストにおけるアンチパターン（脆いテスト、過度なモック等）をリスト化し、回避するためのガイドライン
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-TS-31: CLAUDE.md A/Bテストプロトコル

- **説明**: CLAUDE.mdの異なるバージョンをA/Bテストし、どちらがより効果的かを検証するプロトコル
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-TS-32: スキル変更時のevaluation必須パターン

- **説明**: スキルを変更した際に必ず評価（evaluation）を実行し、変更の影響を確認することを必須とするパターン
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)


---

### 6. 配布

#### F-DT-01: 配置場所の優先順位

- **説明**: スキル・設定ファイルの配置場所に優先順位（プロジェクト > ユーザー > グローバル）を設け、検索・マージの順序を定義する仕組み
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md)

#### F-DT-02: スキルの3階層スコープ配置

- **説明**: スキルをプロジェクトスコープ・ユーザースコープ・グローバルスコープの3階層に配置し、適用範囲を制御する仕組み
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md)

#### F-DT-03: シンボリックリンクによるスキル配布

- **説明**: git clone + シンボリックリンクでスキルを配布し、更新時はgit pullだけで反映される方式
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [03-plugin-distribution.md](./03-plugin-distribution.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-DT-04: プラグインパッケージング構造

- **説明**: スキル・エージェント・設定をプラグインとしてパッケージングし、配布可能な形にまとめる構造
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-05: プライベートマーケットプレイス

- **説明**: 社内向けのプライベートマーケットプレイスでプラグインを配布・管理する仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-06: プロジェクト設定による自動インストールプロンプト

- **説明**: プロジェクト設定ファイルに必要なプラグインを記載し、未インストール時に自動的にインストールを促す仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-07: ベンダリング

- **説明**: プラグインの依存関係をプロジェクト内にベンダリング（同梱）し、外部依存を排除する方式
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-08: ref指定による鮮度管理

- **説明**: gitのref（ブランチ、タグ、コミットハッシュ）を指定してプラグインのバージョンを固定し、鮮度を管理する方式
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-09: シードディレクトリによるプラグイン自動読み込み

- **説明**: 特定のシードディレクトリにプラグインを配置するだけで自動的に読み込まれる仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-10: Strictモードによるコンポーネント権限制御

- **説明**: Strictモードを有効にすることで、プラグインのコンポーネントが使用できる権限を制限する仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-DT-11: ツール名マッピングファイル

- **説明**: プラットフォーム間でツール名が異なる場合に、マッピングファイルで対応関係を定義し、移植性を確保する仕組み
- **出典**: [06-full-mapping-table.md](./06-full-mapping-table.md), [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-DT-12: Knowledge Base Power

- **説明**: ナレッジベース（知識ベース）をPower（プラグイン）として配布し、プロジェクト横断で知識を共有する仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-DT-13: オンボーディングセクション

- **説明**: プラグインやスキルにオンボーディング（導入ガイド）セクションを設け、初回利用時のセットアップを支援する仕組み
- **出典**: [07-kiro-superpowers-integration.md](./07-kiro-superpowers-integration.md)

#### F-DT-14: Agent Pluginsによるプラグイン配布

- **説明**: エージェント定義をプラグインとしてパッケージングし、マーケットプレイス等で配布する仕組み
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-DT-15: Claude形式ファイルの自動検出・互換

- **説明**: CLAUDE.md等のClaude形式ファイルを自動検出し、他プラットフォームでも互換性を持って利用できる仕組み
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-DT-16: 規約ベースディレクトリ自動検出

- **説明**: 規約に基づいたディレクトリ名（agents/、skills/等）を自動検出し、設定なしでプラグインを認識する仕組み
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-DT-17: プラットフォーム別plugin.json分離

- **説明**: プラットフォームごとにplugin.jsonを分離し、各プラットフォーム固有の設定を管理する方式
- **出典**: [11-superpowers-agents-detail.md](./11-superpowers-agents-detail.md)

#### F-DT-18: AGENTS.mdによるマルチプラットフォーム対応

- **説明**: AGENTS.md形式でエージェント定義を記述し、複数のAIプラットフォームで共通利用可能にする方式
- **出典**: [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

---

### 7. ツール

#### F-TL-01: Git Worktreeによる作業隔離

- **説明**: Git Worktreeを使用して作業ディレクトリを隔離し、並列作業やテスト実行時の干渉を防止する仕組み
- **出典**: [01-subagent-task-tool.md](./01-subagent-task-tool.md)

#### F-TL-02: @インポート構文によるファイル参照

- **説明**: @import構文でCLAUDE.mdやスキルファイルから他のファイルを参照・読み込みする仕組み
- **出典**: [02-skills-and-claude-md.md](./02-skills-and-claude-md.md), [03-plugin-distribution.md](./03-plugin-distribution.md), [12-superpowers-claude-md-detail.md](./12-superpowers-claude-md-detail.md)

#### F-TL-03: ライフサイクルフックの宣言的定義

- **説明**: プラグインのライフサイクルフック（インストール時、更新時等）を宣言的に定義する仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-TL-04: プラグインルート変数

- **説明**: プラグイン内のファイルパスを解決するためのルート変数（$PLUGIN_ROOT等）を提供する仕組み
- **出典**: [03-plugin-distribution.md](./03-plugin-distribution.md)

#### F-TL-05: ツール名の自動マッピング

- **説明**: プラットフォーム間でツール名を自動的にマッピングし、スキルの移植性を向上させる仕組み
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-TL-06: AIによるスキル生成

- **説明**: AIを使ってスキルファイルを自動生成する仕組み。テンプレートやベストプラクティスに基づいて生成
- **出典**: [08-vscode-copilot-superpowers-integration.md](./08-vscode-copilot-superpowers-integration.md)

#### F-TL-07: 非対話CLIモードによるテスト自動化基盤

- **説明**: CLIの非対話モードを活用し、テストの自動化基盤を構築する仕組み。CI/CDパイプラインへの統合を可能にする
- **出典**: [09b-superpowers-tests-prompt-based.md](./09b-superpowers-tests-prompt-based.md)

#### F-TL-08: トークン使用量分析ユーティリティ

- **説明**: トークン使用量を分析するユーティリティツール。コスト最適化やコンテキスト効率の改善に活用
- **出典**: [09a-superpowers-tests-unit.md](./09a-superpowers-tests-unit.md)

#### F-TL-09: タスク複雑度ベースのモデル選択

- **説明**: タスクの複雑度を自動判定し、適切なLLMモデルを選択するユーティリティ
- **出典**: [10a-superpowers-skills-hub-workflow.md](./10a-superpowers-skills-hub-workflow.md)

#### F-TL-10: Root Cause Tracing技法

- **説明**: 問題の根本原因を体系的に追跡するための技法・ツール
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-TL-11: Condition-Based Waitingパターン

- **説明**: 特定の条件が満たされるまで待機するパターン。非同期処理やプロセス完了待ちに使用
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-TL-12: テスト汚染二分探索

- **説明**: テスト間の汚染（副作用）を二分探索で特定する手法。テストの実行順序を変えながら原因を絞り込む
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

---

### その他

#### F-OT-01: スキル間参照関係マップ

- **説明**: スキル間の参照・依存関係をマップとして可視化し、影響範囲の把握や変更時の影響分析に活用する仕組み
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

#### F-OT-02: CREATION-LOG

- **説明**: スキルやエージェントの作成履歴（作成日、作成理由、変更履歴等）を記録するログ
- **出典**: [10c-superpowers-skills-discipline-meta.md](./10c-superpowers-skills-discipline-meta.md)

---

## カテゴリ別集計

| カテゴリ | 略号 | 機能数 |
|---|---|---|
| ワークフロー | WF | 33 |
| サブエージェント | SA | 21 |
| スキル | SK | 15 |
| 規律 | DS | 34 |
| テスト | TS | 32 |
| 配布 | DT | 18 |
| ツール | TL | 12 |
| その他 | OT | 2 |
| **合計** | | **167** |

### 重複排除の統合実績

| 統合パターン | 統合元 | 統合先 |
|---|---|---|
| 完了前検証の鉄則 / 完了前検証の強制 / Iron Lawパターン | 01-09, 04-11, 07-11, 10c-01 | F-DS-01 |
| 並列サブエージェントディスパッチ / 独立タスクの並列サブエージェント実行 / 並列エージェント派遣パターン | 01-08, 04-14, 07-04, 10b-08 | F-SA-05 |
| スキルのdescription自動選択 / スキルdescriptionによる自動選択トリガー | 02-03, 04-09 | F-SK-03 |
| サブエージェントへのスキル事前注入（2ソース） | 02-07, 04-07 | F-SA-07 |
| 計画書駆動実行 / 計画駆動実行パイプライン / Do/Verify構造 | 01-11, 07-16, 09c-11 | F-WF-02 |
| メタスキル自動選択 / ハブスキルパターン / スキルルーティングハブ | 04-01, 07-02, 10a-01 | F-WF-05 |
| 実装者ステータスプロトコル / 応答ステータスコード体系 / 4ステータスハンドリング | 01-06, 05-02, 07-18, 10a-13 | F-SA-03 |
| モデル選択戦略 / サブエージェントごとのモデル選択 / inherit指定 | 01-07, 07-19, 08-11, 11-03 | F-SA-04 |
| プロンプトテンプレート方式 / プロンプトテンプレート分離 / {role}-prompt.md命名規約 | 01-10, 07-20, 10b-01, 11-07 | F-SA-06 |
| Red Flagsテーブル / Red Flagsリスト | 07-14, 10a-16, 10c-02 | F-DS-12 |
| Rigid/Flexibleスキル分類（2ソース） | 07-13, 10a-03 | F-DS-11 |
| 体系的デバッグプロセス（2ソース） | 07-12, 10c-06 | F-WF-26 |
| 2段階レビューパターン / 仕様書セルフレビュー + サブエージェントレビュー | 01-05, 10a-05 | F-DS-02 |
| git clone + symlink方式（3ソース） | 02-11, 03-06, 07-09 | F-DT-03 |
| @インポート構文（3ソース） | 02-14, 03-12, 12-08 | F-TL-02 |
| セッション開始時ブートストラップ / SessionStartフック / ハブスキルによるセッション初期化 | 07-10, 08-07, 12-03 | F-WF-13 |
| CLAUDE.md基盤ルール圧縮 / CLAUDE.md最小化+スキル委譲パターン | 04-05, 06-01 | F-DS-06 |
| エスカレーションパターン / 3分類体系 | 05-01, 06-04, 06-05, 06-06 | F-WF-08 |
| カスタムサブエージェント定義 / カスタムエージェント定義 / YAML frontmatter定義 | 01-03, 08-04, 11-01 | F-SA-02 |
| Fast/Integrationテスト分離 / 単体テストと統合テストの分離管理 | 09a-04, 09c-02 | F-TS-05 |
| トークン使用量分析 / トークン使用量の追跡・測定 | 09a-08, 09c-08 | F-TS-22 |
| テストランナーの設計パターン / 結果集計・レポート構造 | 09a-12, 09c-05 | F-TS-11 |
| Gate Function / HARD-GATE | 10a-04, 10c-04 | F-DS-13 |
| 優先順位の3層モデル / 指示優先順位の明示 / Instruction Priority | 02-10, 10a-02, 12-02 | F-DS-05 |
| disallowedToolsによるツール制限（2ソース） | 02-13, 04-15 | F-SK-09 |
| ステアリング→サブエージェント統合 / エージェント定義＋ステアリング統合 | 02-12, 06-03 | F-SA-08 |
| スキルの3階層スコープ配置 / 複数配置パスによるスキル検索 | 02-04, 08-03 | F-DT-02, F-SK-08 |
| ツール名マッピングファイル / ツール名読み替え | 06-17, 07-06 | F-DT-11 |
