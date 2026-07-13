# superpowers skills/ ハブ・ワークフロー系5スキル 詳細調査

## 調査概要

| 項目 | 内容 |
|---|---|
| 調査対象 | superpowers の skills/ 配下 ハブ・ワークフロー系5スキル |
| 調査日 | 2025-07-15 |
| 調査背景 | aide-claude は superpowers のフレームワークに AIDE の具象ロジックを載せる構成をとる。各スキルの詳細を把握し、aide-claude での置き換え設計の基礎資料とする |

## 要約

superpowers のワークフローは **using-superpowers（ハブ）→ brainstorming（企画・設計）→ writing-plans（計画）→ executing-plans or subagent-driven-development（実行）** という一方向チェーンで構成される。using-superpowers がスキルルーティングの入口、brainstorming がユーザー対話による設計、writing-plans が TDD ベースの実装計画作成、executing-plans / subagent-driven-development が計画の実行を担う。aide-claude では、using-superpowers → orchestrator-index.md、brainstorming → 企画/設計オーケストレーター群、writing-plans → 実装オーケストレーター（impl-task-list.md 生成）、executing-plans / subagent-driven-development → 実装オーケストレーター（micro-impl-agent 委譲）に対応する。

---

## 1. using-superpowers（ハブスキル）

### 概要

全会話の入口となるスキルルーティングハブ。ユーザーメッセージ受信時に「どのスキルを適用すべきか」を判定し、該当スキルを呼び出す。

### SKILL.md 構造

| セクション | 概要 |
|---|---|
| frontmatter | name, description（全会話開始時に使用） |
| SUBAGENT-STOP | サブエージェントとして呼ばれた場合はスキップ |
| EXTREMELY-IMPORTANT | 1%でも該当可能性があればスキルを呼ぶ強制ルール |
| Instruction Priority | ユーザー指示 > スキル > デフォルトプロンプト の優先順位 |
| How to Access Skills | CC / Copilot / Gemini / その他 のプラットフォーム別アクセス方法 |
| Platform Adaptation | references/ 配下のツールマッピング参照指示 |
| The Rule | スキル呼び出しフロー（graphviz図）。brainstorming を最優先で判定 |
| Red Flags | スキル呼び出しを回避する思考パターン11個の警告テーブル |
| Skill Priority | プロセス系（brainstorming, debugging）→ 実装系の優先順序 |
| Skill Types | Rigid（TDD等、厳密遵守）vs Flexible（パターン適用） |
| User Instructions | ユーザー指示は WHAT であり HOW ではない |

### 補助ファイル（references/）

| ファイル | 役割 |
|---|---|
| `references/codex-tools.md` | Codex 環境でのツール名マッピング（Task→spawn_agent 等） |
| `references/copilot-tools.md` | Copilot CLI 環境でのツール名マッピング（Read→view 等） |
| `references/gemini-tools.md` | Gemini CLI 環境でのツール名マッピング（Task→非対応 等） |

### スキル間参照

- brainstorming を最優先で判定（EnterPlanMode 前に brainstorming 済みか確認）
- 全スキルへのルーティングを担当

### aide-claude での対応

**orchestrator-index.md** に対応。ユーザーリクエストに応じて適切なオーケストレーターを選択するルーティングハブ。ただし aide-claude では「スキル」ではなく「オーケストレーター」単位でルーティングする点が異なる。プラットフォーム抽象化（references/）は aide-claude では不要（Kiro 専用のため）。

---

## 2. brainstorming（企画・設計スキル）

### 概要

アイデアを設計仕様書に変換する対話型スキル。プロジェクトコンテキスト探索 → 質問 → アプローチ提案 → 設計提示 → 仕様書作成 → セルフレビュー → ユーザー承認 → writing-plans 呼び出し、の9ステップチェックリスト。

### SKILL.md 構造

| セクション | 概要 |
|---|---|
| frontmatter | name, description（創造的作業の前に必須使用） |
| HARD-GATE | 設計承認前の実装行為を絶対禁止 |
| Anti-Pattern | 「シンプルだから設計不要」を否定 |
| Checklist | 9項目の必須チェックリスト（探索→質問→提案→設計→仕様書→レビュー→承認→計画） |
| Process Flow | graphviz によるフロー図 |
| The Process | 理解→探索→提示→設計の各段階の詳細指示 |
| After the Design | 仕様書保存先、セルフレビュー手順、ユーザーレビューゲート |
| Key Principles | YAGNI、1問ずつ、選択肢提示、段階的検証 |
| Visual Companion | ブラウザベースのビジュアルコンパニオン（モックアップ・図表表示） |

### 補助ファイル

| ファイル | 役割 |
|---|---|
| `spec-document-reviewer-prompt.md` | 仕様書レビュー用サブエージェントのプロンプトテンプレート。完全性・一貫性・明確性・スコープ・YAGNI をチェック |
| `visual-companion.md` | ブラウザベースビジュアルコンパニオンの詳細ガイド。サーバー起動方法、HTMLフラグメント記述方法、CSSクラス一覧、イベント形式 |
| `scripts/server.cjs` | Node.js HTTP/WebSocket サーバー（RFC 6455 手実装）。コンテンツディレクトリ監視、自動リロード、30分アイドルタイムアウト |
| `scripts/start-server.sh` | サーバー起動スクリプト。--project-dir, --host, --foreground 等のオプション。OS自動検出 |
| `scripts/stop-server.sh` | サーバー停止スクリプト。graceful shutdown → SIGKILL フォールバック |
| `scripts/helper.js` | クライアント側 JS。WebSocket 接続、クリックイベント送信、選択状態管理 |
| `scripts/frame-template.html` | HTMLフレームテンプレート。ダーク/ライトテーマ対応、options/cards/mockup/split/pros-cons 等の CSS クラス |

### スキル間参照

- **出力先**: writing-plans（唯一の遷移先。他の実装スキルへの直接遷移を禁止）
- **参照**: spec-document-reviewer（サブエージェント派遣）

### aide-claude での対応

**企画オーケストレーター + 設計オーケストレーター（フェーズ1〜6）** に対応。brainstorming の「アイデア→仕様書」フローは、aide-claude では企画オーケストレーター（ヒアリング→技術調査→企画書）と設計オーケストレーター（要件定義→設計）に分割されている。Visual Companion は aide-claude に対応物なし（Kiro の UI 機能で代替可能性あり）。spec-document-reviewer は aide-claude の design-qa-agent / proposal-reviewer に対応。

---

## 3. writing-plans（計画作成スキル）

### 概要

仕様書から TDD ベースの実装計画を作成するスキル。ファイル構造の設計 → bite-sized タスク分解 → コード付きステップ → セルフレビュー → 実行方法の選択提示。

### SKILL.md 構造

| セクション | 概要 |
|---|---|
| frontmatter | name, description（仕様書がある場合、コード着手前に使用） |
| Overview | 「エンジニアがコンテキストゼロ」前提の計画作成。DRY/YAGNI/TDD/頻繁コミット |
| Scope Check | 複数サブシステムの場合は分割を提案 |
| File Structure | ファイル構成の事前設計。責務分離、変更の局所性 |
| Bite-Sized Task Granularity | 各ステップ2〜5分（テスト記述→失敗確認→実装→成功確認→コミット） |
| Plan Document Header | 必須ヘッダーテンプレート（REQUIRED SUB-SKILL 指示を含む） |
| Task Structure | タスクテンプレート（Files, Step 1〜5 のチェックボックス形式） |
| No Placeholders | TBD/TODO/「後で実装」等のプレースホルダー禁止ルール |
| Remember | 正確なファイルパス、完全なコード、正確なコマンド |
| Self-Review | 仕様カバレッジ、プレースホルダースキャン、型一貫性チェック |
| Execution Handoff | Subagent-Driven（推奨）vs Inline Execution の選択提示 |

### 補助ファイル

| ファイル | 役割 |
|---|---|
| `plan-document-reviewer-prompt.md` | 計画書レビュー用サブエージェントのプロンプトテンプレート。完全性・仕様整合・タスク分解・実装可能性をチェック |

### スキル間参照

- **入力元**: brainstorming（仕様書を受け取る）
- **出力先**: subagent-driven-development（推奨）または executing-plans（代替）
- **参照**: using-git-worktrees（REQUIRED: 作業前にワークツリー設定）

### aide-claude での対応

**実装オーケストレーター（impl-task-list.md 生成フェーズ）** に対応。aide-claude では development-planner エージェントがタスクリスト（impl-task-list.md）を生成する。superpowers の「コード付き bite-sized ステップ」に対し、aide-claude は「設計書ベースのタスク依存関係グラフ」を生成する点が異なる。plan-document-reviewer は aide-claude の impl-planner 内のレビュー機構に対応。

---

## 4. executing-plans（計画実行スキル）

### 概要

writing-plans が作成した計画を別セッションで実行するスキル。計画読み込み → 批判的レビュー → タスク順次実行 → finishing-a-development-branch 呼び出し。subagent-driven-development の代替（サブエージェント非対応環境向け）。

### SKILL.md 構造

| セクション | 概要 |
|---|---|
| frontmatter | name, description（計画を別セッションで実行する場合に使用） |
| Overview | 計画読み込み→レビュー→実行→完了。サブエージェント対応環境では subagent-driven-development を推奨 |
| The Process | Step 1: 計画読み込み・レビュー → Step 2: タスク順次実行 → Step 3: finishing-a-development-branch |
| When to Stop | ブロッカー発生時・計画ギャップ・指示不明時は即停止して質問 |
| When to Revisit | 計画更新時・アプローチ再考時に Step 1 へ戻る |
| Remember | 計画を批判的にレビュー、ステップ厳守、検証スキップ禁止 |
| Integration | 必須: using-git-worktrees, writing-plans, finishing-a-development-branch |

### 補助ファイル

なし（SKILL.md のみ）

### スキル間参照

- **入力元**: writing-plans（計画を受け取る）
- **参照**: using-git-worktrees（REQUIRED）、finishing-a-development-branch（完了時 REQUIRED）
- **代替関係**: subagent-driven-development と相互代替

### aide-claude での対応

**実装オーケストレーター（タスク実行フェーズ）** の一部に対応。aide-claude では micro-impl-agent がタスク単位で実装を実行する。executing-plans の「計画ステップ厳守」は aide-claude の「設計書ベース実装 + レビュー」に対応。finishing-a-development-branch は aide-claude の git-committer エージェントに部分対応。

---

## 5. subagent-driven-development（サブエージェント駆動開発スキル）

### 概要

計画をサブエージェント派遣で実行するスキル。タスクごとに「実装サブエージェント → 仕様準拠レビュー → コード品質レビュー」の3段階パイプラインを実行。executing-plans の上位互換。

### SKILL.md 構造

| セクション | 概要 |
|---|---|
| frontmatter | name, description（独立タスクの計画を同一セッションで実行する場合に使用） |
| When to Use | 判定フロー図（計画あり→タスク独立→同一セッション→本スキル） |
| The Process | graphviz による詳細フロー図。実装→仕様レビュー→品質レビュー→次タスク→最終レビュー→ブランチ完了 |
| Model Selection | タスク複雑度に応じたモデル選択指針（安価/標準/高性能） |
| Handling Implementer Status | DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED の4ステータス対応 |
| Prompt Templates | 3つのプロンプトテンプレートファイルへの参照 |
| Example Workflow | 5タスクの実行例（質問→実装→仕様レビュー→品質レビュー→修正ループ） |
| Advantages | 手動実行・executing-plans との比較。効率性・品質ゲート・コスト分析 |
| Red Flags | 禁止事項リスト（レビュースキップ、並列実装、計画ファイル読み込み委譲等） |
| Integration | 必須: using-git-worktrees, writing-plans, requesting-code-review, finishing-a-development-branch |

### 補助ファイル

| ファイル | 役割 |
|---|---|
| `implementer-prompt.md` | 実装サブエージェントのプロンプトテンプレート。タスク記述・コンテキスト・質問促進・コード組織化・エスカレーション基準・セルフレビュー・レポート形式（4ステータス） |
| `spec-reviewer-prompt.md` | 仕様準拠レビューのプロンプトテンプレート。実装者レポートを信用せず、実コードを読んで仕様と照合。過不足・誤解を検出 |
| `code-quality-reviewer-prompt.md` | コード品質レビューのプロンプトテンプレート。仕様準拠レビュー通過後に実行。責務分離・独立テスト可能性・ファイルサイズ・計画整合性をチェック |

### スキル間参照

- **入力元**: writing-plans（計画を受け取る）
- **参照**: using-git-worktrees（REQUIRED）、requesting-code-review（レビューテンプレート）、finishing-a-development-branch（完了時）、test-driven-development（サブエージェントが使用）
- **代替関係**: executing-plans と相互代替

### aide-claude での対応

**実装オーケストレーター（micro-impl-agent + レビュー機構）** に対応。aide-claude の実装フローは「micro-impl-agent（実装）→ impl-review-design（設計整合レビュー）→ impl-review-quality（品質レビュー）→ impl-review-tests（テストレビュー）→ impl-review-errors（エラーレビュー）→ impl-review-imports（import レビュー）」の多段レビューパイプライン。superpowers の3段階（実装→仕様→品質）に対し、aide-claude は5段階の専門レビューに分化している。implementer-prompt は micro-impl-agent に、spec-reviewer-prompt は impl-review-design に、code-quality-reviewer-prompt は impl-review-quality に対応。

---

## ワークフローチェーン全体像

```
using-superpowers（ルーティングハブ）
  │
  ├─→ brainstorming（企画・設計）
  │     │
  │     └─→ writing-plans（計画作成）
  │           │
  │           ├─→ subagent-driven-development（推奨: サブエージェント実行）
  │           │     ├── implementer-prompt.md（実装）
  │           │     ├── spec-reviewer-prompt.md（仕様レビュー）
  │           │     └── code-quality-reviewer-prompt.md（品質レビュー）
  │           │
  │           └─→ executing-plans（代替: 単一セッション実行）
  │
  └─→ [その他スキル: debugging, TDD, git-worktrees 等]
```

### aide-claude との対応マッピング

| superpowers スキル | aide-claude 対応 | 対応の性質 |
|---|---|---|
| using-superpowers | orchestrator-index.md | ルーティングハブ。スキル→オーケストレーター単位に変更 |
| brainstorming | 企画オーケストレーター + 設計オーケストレーター | 1スキル→2オーケストレーターに分割。Visual Companion は対応なし |
| writing-plans | 実装オーケストレーター（計画フェーズ） | bite-sized ステップ→設計書ベースタスクグラフに変更 |
| executing-plans | 実装オーケストレーター（実行フェーズ） | 単一セッション実行。aide-claude では常にサブエージェント委譲 |
| subagent-driven-development | 実装オーケストレーター（実行フェーズ） | 3段階→5段階レビューに拡張。モデル選択指針は aide-claude に対応なし |

---

## 設計上の注目点（aide-claude 置き換え時の考慮事項）

### 1. brainstorming の HARD-GATE

superpowers は「設計承認前の実装行為を絶対禁止」する HARD-GATE を持つ。aide-claude では「オーケストレーターの厳守事項」（フェーズ省略禁止）と「設計書ゲート」が同等の役割を果たす。

### 2. subagent-driven-development のステータスハンドリング

4ステータス（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）の体系的なハンドリングは、aide-claude の micro-impl-agent には明示的に定義されていない。エスカレーション機構の追加を検討する価値がある。

### 3. Model Selection（コスト最適化）

superpowers はタスク複雑度に応じてモデルを使い分ける指針を持つ。aide-claude は現状モデル選択の指針を持たない。Kiro 環境でのモデル選択可否に依存。

### 4. Visual Companion

brainstorming の Visual Companion（ブラウザベースモックアップ表示）は aide-claude に対応物がない。Kiro の UI 拡張機能で代替可能かは要調査。

### 5. プラットフォーム抽象化の不要性

using-superpowers の references/（CC/Copilot/Gemini ツールマッピング）は、aide-claude が Kiro 専用のため不要。この分の複雑性を削減できる。

---

## 参照ファイル一覧

| ファイルパス | 種別 |
|---|---|
| `references/superpowers/skills/using-superpowers/SKILL.md` | SKILL.md |
| `references/superpowers/skills/using-superpowers/references/codex-tools.md` | 補助ファイル |
| `references/superpowers/skills/using-superpowers/references/copilot-tools.md` | 補助ファイル |
| `references/superpowers/skills/using-superpowers/references/gemini-tools.md` | 補助ファイル |
| `references/superpowers/skills/brainstorming/SKILL.md` | SKILL.md |
| `references/superpowers/skills/brainstorming/spec-document-reviewer-prompt.md` | 補助ファイル |
| `references/superpowers/skills/brainstorming/visual-companion.md` | 補助ファイル |
| `references/superpowers/skills/brainstorming/scripts/server.cjs` | スクリプト |
| `references/superpowers/skills/brainstorming/scripts/start-server.sh` | スクリプト |
| `references/superpowers/skills/brainstorming/scripts/stop-server.sh` | スクリプト |
| `references/superpowers/skills/brainstorming/scripts/helper.js` | スクリプト |
| `references/superpowers/skills/brainstorming/scripts/frame-template.html` | テンプレート |
| `references/superpowers/skills/writing-plans/SKILL.md` | SKILL.md |
| `references/superpowers/skills/writing-plans/plan-document-reviewer-prompt.md` | 補助ファイル |
| `references/superpowers/skills/executing-plans/SKILL.md` | SKILL.md |
| `references/superpowers/skills/subagent-driven-development/SKILL.md` | SKILL.md |
| `references/superpowers/skills/subagent-driven-development/implementer-prompt.md` | 補助ファイル |
| `references/superpowers/skills/subagent-driven-development/spec-reviewer-prompt.md` | 補助ファイル |
| `references/superpowers/skills/subagent-driven-development/code-quality-reviewer-prompt.md` | 補助ファイル |
