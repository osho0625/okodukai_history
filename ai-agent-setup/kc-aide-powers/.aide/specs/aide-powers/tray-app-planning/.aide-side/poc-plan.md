# PoC計画書: 企画・設計・実装オーケストレーターのsuperpowers形式変換

## 1. PoCの目的

- kiro版AIDEの企画・設計・実装の3つのオーケストレーターをsuperpowers形式のスキルチェーンに再構成できるか検証する
- superpowersのメインフロー（brainstorming → writing-plans → subagent-driven-development / executing-plans）に対応する3つのオーケストレーターを通しで検証し、新規プロジェクトの企画→設計→実装の一連のフローが機能することを確認する
- スキルチェーン間の遷移（企画完了→設計開始、設計完了→実装開始）が正しく機能するかを検証する
- この結果から、aide-powers全体の変換工程と開発専用Agent/SKILLの定義を確定する

## 2. PoC対象

- **変換元**: kiro版AIDEの企画オーケストレーター + 設計オーケストレーター + 実装オーケストレーター（+ 関連サブエージェント + ステアリング）
- **変換先**: superpowers形式のスキルチェーン3セット

### superpowersとの対応関係

| kiro版AIDEオーケストレーター | superpowersスキル | 備考 |
|---|---|---|
| 企画オーケストレーター（agent-planning-orchestrator.md） | brainstorming | AIDEの企画プロセス（ヒアリング→技術調査→企画書作成）をbrainstormingの構造で再構成 |
| 設計オーケストレーター（agent-design-orchestrator.md） | writing-plans | superpowersのwriting-plansの構造を参考にしつつ、AIDEの設計品質保証（DDD、SOLID、QAゲート等）で大幅に補強 |
| 実装オーケストレーター（agent-impl-orchestrator.md） | subagent-driven-development / executing-plans | AIDEの実装プロセス（タスク分解→実装ループ→レビュー）をSDDの構造で再構成 |

## 3. 評価環境

- **プラットフォーム**: VSCode GitHub Copilot
- **選定理由**: 技術調査08で「最も統合しやすいプラットフォーム」と確認済み。Agent Skills標準の互換性が高く、Claude形式のツール名を一部自動マッピングする機能あり

## 4. 成果物

### 4.1 スキルチェーン（3セット）

#### 企画オーケストレーターのスキルチェーン

kiro版AIDEの企画オーケストレーター（[agent-planning-orchestrator.md](../../references/kiro-agents/steering/agent-planning-orchestrator.md)）をベースに、superpowersのbrainstormingスキルの構造を参考にして設計する。

- ハブスキル（planning-orchestrator）: フェーズ管理 + 遷移ルール
- フェーズ0スキル（planning-phase0-intake）: 初期情報収集
- フェーズ1スキル（planning-phase1-init）: 企画書テンプレート初期化
- フェーズ2スキル（planning-phase2-explore）: 探索サイクル（対話 + 技術調査 + 企画書更新 + レビュー）
- フェーズ3スキル（planning-phase3-finalize）: 完了判定・最終化
- 遷移: 企画完了 → 設計オーケストレーターへ引き継ぎ（handover-notes.md経由）

#### 設計オーケストレーターのスキルチェーン

kiro版AIDEの設計オーケストレーター（[agent-design-orchestrator.md](../../references/kiro-agents/steering/agent-design-orchestrator.md)）をベースに、superpowersのwriting-plansスキルの構造を参考にしつつ、AIDEの設計品質保証（DDD、SOLID、QAゲート等）で補強する。

- ハブスキル（design-orchestrator）: フェーズ管理 + 設計書ゲート + QAゲート管理 + 遷移ルール
- フェーズ1スキル（design-phase1-user-req）: ユーザー要件定義
- フェーズ2スキル（design-phase2-system-req）: システム要件定義 + 開発環境
- フェーズ3スキル（design-phase3-dev-plan）: 開発計画書
- フェーズ4スキル（design-phase4-architecture）: システム構成設計
- フェーズ5スキル（design-phase5-gui）: GUI設計
- フェーズ6スキル（design-phase6-usecase）: ユースケース分析
- フェーズ7スキル（design-phase7-ddd）: レイヤードアーキテクチャ + ユビキタス言語
- フェーズ8スキル（design-phase8-object）: オブジェクト設計
- フェーズ9スキル（design-phase9-infra）: インフラ/インターフェース設計
- フェーズ10スキル（design-phase10-program）: プログラム構成
- QAゲートスキル（design-qa-gate）: 設計品質検証（DDD、SOLID、レイヤー間依存、テスト容易性）
- 遷移: 設計完了 → 実装オーケストレーターへ引き継ぎ

#### 実装オーケストレーターのスキルチェーン

kiro版AIDEの実装オーケストレーター（[agent-impl-orchestrator.md](../../references/kiro-agents/steering/agent-impl-orchestrator.md)）をベースに、superpowersのsubagent-driven-development / executing-plansスキルの構造を参考にする。

- ハブスキル（impl-orchestrator）: タスク管理 + 設計書ゲート + レビュー管理 + 遷移ルール
- タスク分解スキル（impl-task-planning）: 設計書からの実装タスク分解（依存関係グラフ、フェーズ別分割）
- 実装ループスキル（impl-execution）: サブエージェント駆動の実装ループ（4ステータス管理、2段階レビュー）
- ドキュメント生成スキル（impl-doc-generation）: README、docs/配下のドキュメント生成
- 遷移: 実装完了 → ドキュメント生成 → 完了

### 4.2 関連サブエージェント定義

#### エージェントの種類と使い分け

superpowersのサブエージェントライフサイクル設計に基づき、以下の基準で汎用エージェントと名前付きエージェントを使い分ける:

- **名前付きエージェント（agents/*.md）**: 人格・役割が固定されているエージェント。どのタスクでも同じ観点・同じ判断基準で動作する。例: design-qa-agent（常にDDD・SOLID等の設計品質を検証する）、code-review-agent（常にコード品質を検証する）
- **汎用エージェント（プロンプトテンプレート）**: タスクごとに指示内容が変わるエージェント。オーケストレーターがテンプレートに変数を埋めて派遣する。例: micro-impl-agent（タスクごとに実装対象・設計書参照セクションが異なる）
- **使い分け基準**: 「人格が固定か、タスクごとに変わるか」（参照: [tech-ref-subagent-lifecycle.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-subagent-lifecycle.md)）

#### 報告形式: 4ステータス管理

全サブエージェントは、タスク完了時に以下の4ステータスのいずれかで報告する:

| ステータス | 意味 | オーケストレータの対応 |
|---|---|---|
| `DONE` | 完了 | レビューへ進む |
| `DONE_WITH_CONCERNS` | 完了だが懸念あり | 懸念を読む。正確性・スコープの問題なら対処後レビューへ。観察的な懸念ならメモしてレビューへ |
| `NEEDS_CONTEXT` | 情報不足 | 不足情報を提供して再派遣（※aide-powersではフォアグラウンドモードのため、サブエージェントが直接ユーザーに質問可能） |
| `BLOCKED` | 完了不能 | 段階的対応: ①コンテキスト追加→同モデルで再派遣 ②高性能モデルで再派遣 ③タスク分割 ④ユーザーにエスカレーション |

- **重要ルール**: 「Never ignore an escalation or force the same model to retry without changes.」
- **参照**: [subagent-driven-development/SKILL.md](../../references/superpowers/skills/subagent-driven-development/SKILL.md)

#### レビュー体制: 2段階レビュー

サブエージェントの成果物は、以下の2段階でレビューする:

1. **第1段階: スペック準拠レビュー（「何を作ったか」の検証）**
   - 核心: 「Do Not Trust the Report」— 実装者の報告を信用せず独立検証
   - 検証観点: Missing requirements / Extra/unneeded work / Misunderstandings
   - 出力: `✅ Spec compliant` または `❌ Issues found`

2. **第2段階: コード品質レビュー（「どう作ったか」の検証）**
   - 前提: スペック準拠レビューが合格してからでないと実行不可
   - 検証観点: Code Quality / Architecture / Testing / Requirements
   - 出力: Ready to merge? Yes/No/With fixes

- **不合格時**: 修正用サブエージェントを新規派遣（オーケストレータ自身が修正することは「context pollution」として禁止）
- **参照**: [tech-ref-multi-agent-orchestration.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md)

#### エージェント一覧

##### 企画プロセス専用エージェント
- source-material-organizer: ユーザー提供資料の構造化
- tech-investigator: 技術調査の実施
- proposal-writer: 企画書の作成・更新
- proposal-reviewer: 企画書のレビュー

##### 設計プロセス専用エージェント
- user-requirements-architect: ユーザー要件定義
- system-requirements-architect: システム要件定義
- development-planner: 開発計画書作成
- system-architecture-designer: システム構成設計
- object-designer: オブジェクト設計
- ddd-modeler: レイヤードアーキテクチャ + ユビキタス言語
- design-qa-agent: 設計品質検証（DDD、SOLID、レイヤー間依存、テスト容易性）
- usecase-lister: ユースケース一覧作成
- usecase-process-analyzer: ユースケース実現プロセス分析
- usecase-usability-evaluator: ユースケースユーザビリティ評価
- usecase-improver: ユースケース改善提案

##### 実装プロセス専用エージェント
- micro-impl-agent: タスク単位の実装（タスクごとに実装対象・設計書参照セクションが異なる）
- design-review-agent: 設計書との整合性チェック
- code-review-agent: コード内部品質チェック

##### 共通エージェント
- git-committer: gitコミット操作（コミットメッセージルール、ユーザー承認取得）

### 4.3 開発専用Agent/SKILLの定義
- PoCの結果から確定する。aide-powers全体の開発に使う開発方法論を定義する

### 4.4 サイクル4の分析結果の反映

PoCの設計・実装にあたり、以下のサイクル4の分析結果を前提知識として活用する:

- **superpowersメインフロー分析**: superpowersの7スキルによるメインフロー（using-superpowers → brainstorming → using-git-worktrees → writing-plans → subagent-driven-development / executing-plans → finishing-a-development-branch）の全体像と各ステップの詳細を把握済み。aide-powersの企画・設計・実装スキルチェーンの設計に、superpowersのフェーズ間入出力・接続点の設計パターンを適用する → [superpowers-main-flow-analysis.md](./superpowers-main-flow-analysis.md)
- **構成要素判定表**: superpowersの全84ファイルを「そのまま使う(25件) / 中身を差し替える(30件) / 新規作成(1件) / 不要(28件)」に分類済み。PoCで作成するスキル・エージェントが、どのsuperpowersファイルをベースにするかの判断に活用する → [poc-framework-analysis.md](./poc-framework-analysis.md)
- **フロー詳細資料**: superpowersの各ステップの詳細（入力/出力、使われるフレームワーク機能）を22ファイルで文書化済み。特にsubagent-driven-developmentの4段階パイプライン（実装→スペック準拠レビュー→コード品質レビュー→最終レビュー）の詳細は、aide-powersの実装オーケストレーターの実装ループスキル（impl-execution）の設計に直接適用する → [superpowers-flow-details/](./superpowers-flow-details/)

## 5. 採用するsuperpowersの手法

### 5.1 スキル作成方法
- **writing-skillsのTDDアプローチ**: RED（ベースラインテスト）→ GREEN（最小限のスキル作成）→ REFACTOR（抜け穴を塞ぐ）
- **参照**: superpowers writing-skills/SKILL.md, writing-skills/testing-skills-with-subagents.md

### 5.2 ワークフローチェーン
- **遷移パターン**: REQUIRED SUB-SKILL形式でフェーズ間を連携
- **リニアチェーン**: フェーズ0 → フェーズ1 → ... → フェーズ9
- **分岐チェーン**: フェーズ3でリファクタリングへの分岐あり
- **HARD-GATE**: 設計書ゲート（フェーズ0前の必須チェック）
- **参照**: superpowers tech-ref-workflow-chaining.md

### 5.3 Iron Lawパターン（規律スキル）
- 変更オーケストレーター全体を貫く1つの核心的なIron Law（「Xなしに、Yしてはならない」形式）を定義する
- 多層防御: 精神条項、Red Flags、Common Rationalizations、Gate Function
- **精神条項**: 「Violating the letter of this rule is violating the spirit of this rule.」— ルールの文言を技術的に回避する行為も違反とみなす。ゲート関数パターン（§5.8）のverification-before-completion/SKILL.mdで定義されている精神条項をaide-powersの全Iron Lawに適用する
- **参照**: superpowers tech-ref-discipline-skills.md, [verification-before-completion/SKILL.md](../../references/superpowers/skills/verification-before-completion/SKILL.md)

### 5.4 説得原理
- Authority + Commitment + Social Proofを規律部分に組み込む
- **具体的な適用方法**:
  - **Authority（権威）**: 規律スキルの核心部分に命令的言語を使用する。「YOU MUST」「No exceptions」「Never」「Always」等で判断疲労と合理化を排除する
  - **Commitment（コミットメント）**: スキル使用の宣言義務を課す。サブエージェントは作業開始時に「I'm using [Skill Name]」と宣言し、明示的にスキルへのコミットメントを表明する
  - **Social Proof（社会的証明）**: 普遍的パターンで規範を確立する。「Every time」「Always」等の普遍的表現と、失敗モード「X without Y = failure」の形式で、ルール遵守が当然であることを示す
  - **Liking（好意）は使用禁止**: 追従性を生み、正直なフィードバック文化と矛盾するため、規律スキルでは絶対に使用しない
- **研究基盤**: Meincke et al. (2025) — N=28,000のAI会話で説得テクニックの適用により遵守率が33%→72%に倍増（p < .001）
- **参照**: superpowers tech-ref-skill-creation.md セクション5, [persuasion-principles.md](../../references/superpowers/skills/writing-skills/persuasion-principles.md)

### 5.5 並列実行
- フェーズ8（差分実装）でdispatching-parallel-agentsパターンを取り入れる
- **Execution Handoff（分岐点）**: superpowersのwriting-plansスキルでは、計画完了後にユーザーに実行方式を選択させる分岐点（Execution Handoff）を設けている。aide-powersのフェーズ8でも同様の分岐を設ける:
  - 選択肢1: サブエージェント駆動（推奨）— dispatching-parallel-agentsパターンで並列実装
  - 選択肢2: インライン実行 — サブエージェント非対応環境向けの代替フロー（executing-plansパターン）
- **参照**: superpowers dispatching-parallel-agents/SKILL.md, [tech-ref-end-to-end-flow.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-end-to-end-flow.md)

### 5.6 CSO（Claude Search Optimization）
- 各フェーズスキルのdescriptionは「Use when...」形式でトリガー条件のみ記述する
- ワークフローの要約をdescriptionに書かない
- **参照**: superpowers tech-ref-skill-creation.md セクション4.1

### 5.7 4ステータス管理（サブエージェント報告形式）

サブエージェントの報告形式として、superpowersのsubagent-driven-developmentで定義されている4ステータス管理を採用する。

- **4ステータス**: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- **2段階レビュー**: スペック準拠レビュー（「何を作ったか」）→ コード品質レビュー（「どう作ったか」）の順序で実施。スペック準拠レビューが合格しないとコード品質レビューに進めない
- **信頼しない原則（Do Not Trust the Report）**: 実装者サブエージェントの報告を信用せず、レビュアーサブエージェントが独立検証する
- **BLOCKED時の段階的対応**: ①コンテキスト追加→同モデルで再派遣 ②高性能モデルで再派遣 ③タスク分割 ④ユーザーにエスカレーション
- **コンテキスト汚染防止**: 不合格時はオーケストレータ自身が修正せず、修正用サブエージェントを新規派遣する
- **aide-powersでのカスタマイズ**: aide-powersのQAゲート（design-qa-agent）はDDD・SOLID等の設計品質も検証するため、レビュー観点を拡張する。また、フォアグラウンドモードのため、NEEDS_CONTEXTの処理フローが異なる（サブエージェントが直接ユーザーに質問可能）
- **参照**: [subagent-driven-development/SKILL.md](../../references/superpowers/skills/subagent-driven-development/SKILL.md), [tech-ref-multi-agent-orchestration.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md)

### 5.8 ゲート関数パターン（フェーズ完了判定）

全フェーズの完了判定に、superpowersのverification-before-completionスキルで定義されているゲート関数パターンを適用する。

- **5ステップ**: IDENTIFY（何で検証するか特定）→ RUN（検証手段を実行）→ READ（結果を完全に読む）→ VERIFY（結果が主張を裏付けるか判定）→ CLAIM（証拠付きで主張）
- **Iron Law**: `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE`
- **精神条項**: 「Violating the letter of this rule is violating the spirit of this rule.」— ステップを1つでもスキップすることは「検証ではなく嘘」
- **aide-powersでの一般化**: superpowersでは「command」（テスト実行コマンド等）が検証手段だが、aide-powersでは設計書の整合性検証（DDD、SOLID準拠等）も「検証手段」に含まれる。IDENTIFYステップの「What command proves this claim?」を「What verification method proves this claim?」に一般化する
- **Common Failures（よくある失敗）の適用**: 「Tests pass」→テストコマンド出力が必要、「Agent completed」→VCS diffで変更確認が必要、「Requirements met」→行ごとのチェックリストが必要。aide-powersの各フェーズ完了判定にも同様の証拠基準を設ける
- **Red Flags**: 「should」「probably」「seems to」等の曖昧な表現が完了報告に含まれている場合は、検証が不十分であることを示す
- **参照**: [verification-before-completion/SKILL.md](../../references/superpowers/skills/verification-before-completion/SKILL.md)

### 5.9 ルール注入の段階的コンテキスト投入

superpowersのルール注入パターン（6パターン）に基づき、aide-powersのルールを段階的にコンテキストに投入する。

- **段階1: セッション開始時** — ハブスキル（using-aide-powers）のみ注入。オーケストレーター選択ロジックと最小限のグローバルルールのみ
- **段階2: タスク開始時** — ユーザーのリクエストに応じて関連するフェーズスキルを読み込む。不要なスキルは読み込まない（1%ルール: 1%でも関係しそうならスキルを呼ぶ義務がある）
- **段階3: サブエージェント派遣時** — プロンプトテンプレートで必要最小限のコンテキストを構築。セッション履歴は渡さず、タスクに必要な情報のみをテンプレート変数として埋め込む
- **ルールの3カテゴリ分類**: aide-powersのルールを以下の3カテゴリに分類し、適切な注入パターンを選択する:
  - **常時適用**: フェーズスキップ禁止、敬語ルール等 → CLAUDE.md / セッション開始フック
  - **条件付き適用**: 各フェーズスキルの手順・ルール → オンデマンドスキル読み込み
  - **サブエージェント向け**: 実装ルール、レビュー観点等 → プロンプトテンプレート構築
- **参照**: [tech-ref-agent-rule-injection.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-agent-rule-injection.md), [tech-ref-skill-system-architecture.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-system-architecture.md)

### 5.10 コンテキスト汚染防止

superpowersのマルチエージェント・オーケストレーション設計に基づき、オーケストレータのコンテキスト汚染を防止する。

- **核心原則**: オーケストレータ自身が修正を行うことの明確な禁止。成果物の作成・編集・コード変更は全てサブエージェントに委譲する
- **理由**: オーケストレータが修正を行うと、修正内容がオーケストレータのコンテキストに蓄積し、後続のフェーズ管理判断に悪影響を与える（context pollution）
- **aide-powersとの整合**: kiro版AIDEの「オーケストレーターの実作業禁止」ルール（global-rules.md）と完全に一致する。superpowersでも同じ原則が採用されていることが確認できた
- **不合格時のフロー**: レビューで不合格の場合、オーケストレータは修正用サブエージェントを新規派遣する。オーケストレータ自身が「ちょっとした修正だから」と直接修正することは禁止
- **参照**: [tech-ref-multi-agent-orchestration.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md)

### 5.11 `<SUBAGENT-STOP>`タグ

superpowersのサブエージェントライフサイクル設計に基づき、サブエージェントがハブスキルを不要に読み込むことを防止する。

- **問題**: サブエージェントがusing-aide-powers（ハブスキル）を読み込むと、オーケストレーター選択ロジックが不要にコンテキストを消費する
- **解決策**: using-aide-powersスキルに`<SUBAGENT-STOP>`タグを配置し、サブエージェントとして起動された場合はハブスキルの読み込みを停止させる
- **適用箇所**: using-aide-powers/SKILL.mdの冒頭付近に配置
- **参照**: [tech-ref-subagent-lifecycle.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-subagent-lifecycle.md)

### 5.12 体系的デバッグ4フェーズ + 3回失敗ルール（参照）

superpowersのsystematic-debuggingスキルで定義されている体系的デバッグ手法。PoCの変更オーケストレーターでは直接使わないが、将来のバグ修正オーケストレーター変換時に採用する。

- **Iron Law**: `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`
- **4フェーズ**: 根本原因調査 → パターン分析 → 仮説テスト → 実装
- **3回失敗ルール**: 3回修正に失敗したらアーキテクチャの問題と判断し、ユーザーにエスカレーション。「DON'T attempt Fix #4 without architectural discussion」
- **aide-powersでの統合方針**: aide-powersのバグ修正オーケストレーターは既に6フェーズ（ヒアリング→原因分析→修正方針→差分設計→実装→ドキュメント反映）を持つ。systematic-debuggingの4フェーズはPhase 2（原因分析）とPhase 3（修正方針）に統合する形で採用する。3回失敗ルールのエスカレーション先は、リファクタリングオーケストレーターへの引き継ぎ（refactoring-request.md経由）として設計する
- **参照**: [systematic-debugging/SKILL.md](../../references/superpowers/skills/systematic-debugging/SKILL.md)

## 6. 評価基準

1. **3つのオーケストレーターの通しフロー**: 作成した3つのスキルチェーン（企画・設計・実装）をVSCode GitHub Copilotで使って、新規プロジェクトの企画→設計→実装の一連のフローを完遂できること
2. **スキルチェーン間の遷移**: 企画完了→設計開始、設計完了→実装開始のスキルチェーン間遷移が正しく機能すること（handover-notes.md等の引き継ぎ情報が正しく受け渡されること）
3. **各オーケストレーターの品質**: 各スキルチェーンが、既存のkiro版AIDEの対応するオーケストレーターと同等以上の成果物を生成できること
4. **開発専用Agent/SKILLの有効性**: 作成した開発専用Agent/SKILLを使って、同等のスキルチェーンを作成・修正できること

## 7. スケジュール

未定

## 8. 参照資料

### superpowers tech-references
- [tech-ref-skill-creation.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-creation.md): スキル作成のTDDアプローチ、CSO、説得原理
- [tech-ref-workflow-chaining.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-workflow-chaining.md): スキル間遷移パターン、ワークフロー制御の設計パターン
- [tech-ref-discipline-skills.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-discipline-skills.md): Iron Lawパターン、合理化防止テクニック、多層防御
- [tech-ref-agent-rule-injection.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-agent-rule-injection.md): ルール注入の6パターン、段階的コンテキスト投入、合理化防止テクニック
- [tech-ref-end-to-end-flow.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-end-to-end-flow.md): 7フェーズフローの入出力・接続点、規律スキルの横断的発動、Execution Handoff
- [tech-ref-multi-agent-orchestration.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md): SDDの4段階パイプライン、2段階レビューゲート、BLOCKED時の段階的対応、コンテキスト汚染防止
- [tech-ref-skill-system-architecture.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-system-architecture.md): ハブスキル→個別スキルの2段階構造、スキル発見メカニズム（1%ルール）、スキルの公式分類（Rigid/Flexible）
- [tech-ref-subagent-lifecycle.md](../../references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-subagent-lifecycle.md): 汎用 vs 名前付きエージェントの使い分け、プロンプトテンプレート設計、`<SUBAGENT-STOP>`タグ

### superpowers skills
- [writing-skills/SKILL.md](../../references/superpowers/skills/writing-skills/SKILL.md): スキル作成スキル本体
- [writing-skills/testing-skills-with-subagents.md](../../references/superpowers/skills/writing-skills/testing-skills-with-subagents.md): プレッシャーテスト方法論
- [writing-skills/persuasion-principles.md](../../references/superpowers/skills/writing-skills/persuasion-principles.md): Cialdiniの7原則のLLMへの適用方法、スキル種類別の推奨組み合わせ
- [dispatching-parallel-agents/SKILL.md](../../references/superpowers/skills/dispatching-parallel-agents/SKILL.md): 並列エージェント派遣
- [subagent-driven-development/SKILL.md](../../references/superpowers/skills/subagent-driven-development/SKILL.md): 4ステータス管理、2段階レビュー、信頼しない原則
- [verification-before-completion/SKILL.md](../../references/superpowers/skills/verification-before-completion/SKILL.md): ゲート関数パターン（IDENTIFY→RUN→READ→VERIFY→CLAIM）、精神条項
- [systematic-debugging/SKILL.md](../../references/superpowers/skills/systematic-debugging/SKILL.md): 体系的デバッグ4フェーズ、3回失敗ルール、Iron Law

### aide-powers技術調査
- [08-vscode-copilot-superpowers-integration.md](./tech-investigation/08-vscode-copilot-superpowers-integration.md): VSCode GitHub Copilotの評価環境としての適合性
- [14-superpowers-tech-refs-remaining.md](./tech-investigation/14-superpowers-tech-refs-remaining.md): superpowers tech-references残り8ファイル + 良い仕組み5つの詳細調査

### aide-powers分析資料
- [superpowers-main-flow-analysis.md](./superpowers-main-flow-analysis.md): superpowersメインフロー分析（7スキルの全体フロー + 各ステップ詳細資料22ファイル）
- [poc-framework-analysis.md](./poc-framework-analysis.md): 構成要素判定表（全84ファイルの分類）
- [superpowers-flow-details/](./superpowers-flow-details/): フロー詳細資料（各ステップの入力/出力/フレームワーク機能）

### kiro版AIDE（変換元）
- [agent-planning-orchestrator.md](../../references/kiro-agents/steering/agent-planning-orchestrator.md): 企画オーケストレーター本体
- [agent-design-orchestrator.md](../../references/kiro-agents/steering/agent-design-orchestrator.md): 設計オーケストレーター本体
- [agent-impl-orchestrator.md](../../references/kiro-agents/steering/agent-impl-orchestrator.md): 実装オーケストレーター本体
