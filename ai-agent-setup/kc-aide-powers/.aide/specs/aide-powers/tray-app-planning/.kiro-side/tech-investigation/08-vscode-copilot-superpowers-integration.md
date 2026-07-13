# 調査: VSCode GitHub Copilot の superpowers 構成への追加可否

## 調査概要

- **調査対象**: VSCode GitHub Copilot を superpowers 構成（スキルシステム + サブエージェント + プラグイン配布）に追加できるか
- **調査日**: 2025年（Web検索による最新情報確認済み）
- **調査の背景**: aide-for-claude-code プロジェクトで、superpowers の既存6プラットフォームに加えて VSCode GitHub Copilot を追加対応する

## 要約

VSCode GitHub Copilot は superpowers 構成への追加が **可能** である。VSCode Copilot は Agent Skills 標準（agentskills.io）をネイティブサポートし、SKILL.md 形式のスキルをそのまま利用できる。サブエージェント機構（`runSubagent` ツール）も充実しており、カスタムエージェント（`.agent.md`）による専門エージェントの定義・派遣が可能。さらに、Agent Plugins（Preview）によるプラグイン配布の仕組みがあり、superpowers の `.claude-plugin/` に相当する配布方式が利用できる。SessionStart フックによるコンテキスト注入も対応済み。superpowers の全機能（スキル・サブエージェント・フック・プラグイン配布）が VSCode Copilot でネイティブに利用可能であり、最も統合しやすいプラットフォームの一つである。

---

## 調査結果

### 1. VSCode Copilot のエージェントモード

**結論: Agent mode でサブエージェントを派遣する仕組みがある**

- VSCode Copilot の Agent mode は 2025年2月に導入され、2025年4月に GA（一般提供）となった
- Agent mode は自律的なペアプログラマーとして動作し、コードベースの分析、ファイル編集、ターミナルコマンド実行を自律的に行う
- **4種類のエージェント**:
  1. **Local Agent**: VS Code 内でインタラクティブに動作。全ツール・MCP サーバーにアクセス可能
  2. **Background Agent（Copilot CLI）**: バックグラウンドで自律的に動作。複数セッションの並列実行が可能
  3. **Cloud Agent（Coding Agent）**: GitHub 上でクラウド実行。Issue からの自動実装が可能
  4. **Sub-Agents**: 独立したコンテキストで特定タスクを実行する委譲エージェント

**superpowers への影響**:
- superpowers のスキルが想定する「メインエージェント + サブエージェント」パターンが VSCode Copilot でネイティブに動作する
- Background Agent（Copilot CLI）を使えば、superpowers の `executing-plans` スキル（並列セッション実行）にも対応可能

**情報源**:
- [VSCode Copilot Agent Mode ブログ](https://code.visualstudio.com/blogs/2025/04/07/agentMode) — 2025年4月7日公開
- [GitHub Copilot: The agent awakens](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) — 2025年2月6日公開
- [VSCode Copilot Subagents ドキュメント](https://code.visualstudio.com/docs/copilot/agents/subagents) — 確認日: 調査時点

---

### 2. VSCode Copilot のカスタム指示

**結論: 複数のカスタム指示ファイル形式をサポート**

- **カスタム指示ファイル**:
  - `.github/copilot-instructions.md`: プロジェクト固有のコーディングガイドライン（常時適用）
  - `.github/agents/*.agent.md`: カスタムエージェント定義
  - `.github/skills/*/SKILL.md`: スキル定義
  - `.github/hooks/*.json`: フック設定
- **Claude 形式との互換性**:
  - `.claude/agents/*.md`: Claude 形式のエージェント定義も検出される
  - `.claude/skills/*/SKILL.md`: Claude 形式のスキルも検出される
  - `.claude/settings.json`: Claude Code のフック設定も読み込まれる
- **ユーザーレベル**:
  - `~/.copilot/agents/`: ユーザーレベルのカスタムエージェント
  - `~/.copilot/skills/`: ユーザーレベルのスキル
  - `~/.copilot/hooks/`: ユーザーレベルのフック

**superpowers への影響**:
- VSCode Copilot は `.claude/agents/` と `.claude/skills/` を自動検出するため、superpowers の既存ファイル構造がそのまま動作する可能性が高い
- `.github/agents/` と `.github/skills/` にも配置可能で、GitHub リポジトリとの統合が容易

**情報源**:
- [VSCode Custom Instructions ドキュメント](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) — 確認日: 調査時点
- [VSCode Custom Agents ドキュメント](https://code.visualstudio.com/docs/copilot/chat/chat-modes) — 確認日: 調査時点

---

### 3. VSCode Copilot のスキルシステム

**結論: Agent Skills 標準（agentskills.io）をネイティブサポート。SKILL.md 形式がそのまま使える**

- VSCode Copilot は [Agent Skills 標準](https://agentskills.io/) をサポートしている
- スキルの仕組み:
  - **自動発見**: 起動時にスキルの `name` と `description` を読み込み
  - **オンデマンド読み込み**: リクエストが description にマッチした場合、または `/` スラッシュコマンドで呼び出した場合に全文を読み込み
  - **プログレッシブ・ディスクロージャー**: 参照ファイルは必要時のみ読み込み
- スキルの配置場所:
  - ワークスペース: `.github/skills/`, `.claude/skills/`, `.agents/skills/`
  - ユーザー: `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`
  - 追加パス: `chat.skillsLocations` 設定でカスタマイズ可能
- SKILL.md のフロントマター:
  - `name`（必須）: フォルダ名と一致する必要あり
  - `description`（必須）: いつ使うかの説明
  - `argument-hint`（任意）: スラッシュコマンド時のヒントテキスト
  - `user-invocable`（任意）: スラッシュコマンドメニューに表示するか（デフォルト: true）
  - `disable-model-invocation`（任意）: エージェントによる自動読み込みを無効にするか（デフォルト: false）
- **VSCode 拡張機能からのスキル提供**: `package.json` の `chatSkills` コントリビューションポイントでスキルを提供可能
- **AI によるスキル生成**: `/create-skill` コマンドで AI にスキルを生成させることが可能

**superpowers への影響**:
- superpowers の `skills/` ディレクトリをそのまま `.github/skills/superpowers/` にコピーすれば動作する
- Agent Plugins 経由での配布も可能（後述）
- Claude Code と同じ SKILL.md 形式がそのまま使えるため、移植コストが最も低い

**情報源**:
- [VSCode Agent Skills ドキュメント](https://code.visualstudio.com/docs/copilot/customization/agent-skills) — 確認日: 調査時点
- [Agent Skills 標準](https://agentskills.io/) — 確認日: 調査時点

---

### 4. VSCode Copilot のセッション開始フック

**結論: SessionStart フックでコンテキスト注入が可能。Claude Code のフック形式との互換性あり**

- VSCode Copilot のフック機能（Preview）:
  - **8種類のライフサイクルイベント**: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, SubagentStart, SubagentStop, Stop
  - **SessionStart フック**: 新しいエージェントセッション開始時に発火。`additionalContext` でコンテキストを注入可能
  - **SubagentStart フック**: サブエージェント生成時に発火。サブエージェントへのコンテキスト注入が可能
- フック設定ファイルの配置場所:
  - ワークスペース: `.github/hooks/*.json`
  - Claude 形式: `.claude/settings.json`, `.claude/settings.local.json`
  - ユーザー: `~/.copilot/hooks/`, `~/.claude/settings.json`
  - カスタムエージェント内: `.agent.md` のフロントマターに `hooks` フィールド
  - プラグイン内: `hooks.json` または `hooks/hooks.json`
- **Claude Code フック形式との互換性**:
  - VSCode は `.claude/settings.json` のフック設定を読み込む
  - ただし、ツール名やプロパティ名の違いに注意（Claude Code は snake_case、VSCode は camelCase）
  - matcher は現在無視される（全ツール呼び出しでフックが実行される）

**SessionStart フックの出力形式**:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Project: my-app v2.1.0 | Branch: main"
  }
}
```

**superpowers への影響**:
- superpowers の `hooks/session-start` スクリプトは、VSCode Copilot の SessionStart フックとして動作する
- superpowers の `hooks/hooks.json` 形式がそのまま使える可能性が高い
- `session-start` スクリプトの出力形式（`hookSpecificOutput.additionalContext`）は VSCode Copilot でもサポートされている
- 実際に superpowers の `hooks/session-start` スクリプトは既に VSCode Copilot（Copilot CLI）を考慮した出力分岐を含んでいる

**情報源**:
- [VSCode Copilot Hooks ドキュメント](https://code.visualstudio.com/docs/copilot/customization/hooks) — 確認日: 調査時点

---

### 5. VSCode Copilot のツール名

**結論: Claude Code のツール名との対応表が存在。一部は自動マッピングされる**

VSCode Copilot は Claude 形式のエージェントファイル（`.claude/agents/*.md`）を検出し、Claude 固有のツール名を VSCode のツールに自動マッピングする。

| superpowers（Claude Code）ツール名 | VSCode Copilot ツール名 | 備考 |
|---|---|---|
| `Read` | `read` / ファイル読み取りツール | 自動マッピング |
| `Write` | `create` / `create_file` | 自動マッピング |
| `Edit` | `edit` / `replace_string_in_file` | 自動マッピング |
| `Bash` | `terminal` / ターミナルツール | 自動マッピング |
| `Grep` | `search` / コード検索ツール | |
| `Glob` | `search` | |
| `Task` (subagent) | `runSubagent` / `agent` | サブエージェント派遣 |
| `Skill` | スキルは自動読み込み / `/` コマンド | |
| `TodoWrite` | 要確認 | |
| `WebSearch` | `web` ツール | |
| `WebFetch` | `web/fetch` | `#tool:web/fetch` で参照 |
| `EnterPlanMode` / `ExitPlanMode` | Plan エージェント | 別エージェントとして実装 |

**superpowers への影響**:
- VSCode Copilot は Claude 形式のツール名を自動マッピングするため、多くのスキルがそのまま動作する可能性がある
- ただし、完全な互換性は保証されないため、`references/vscode-copilot-tools.md` を作成してマッピングを明示するのが望ましい
- superpowers の既存の `references/copilot-tools.md`（Copilot CLI 向け）を参考に、VSCode Copilot 向けのマッピングを作成する

**情報源**:
- [VSCode Custom Agents ドキュメント — Claude agent format](https://code.visualstudio.com/docs/copilot/chat/chat-modes) — 確認日: 調査時点
- superpowers の `skills/using-superpowers/references/copilot-tools.md` — 既存の Copilot CLI ツールマッピング

---

### 6. VSCode Copilot での配布方法

**結論: Agent Plugins（Preview）による配布が最適。`.github/` 配下のファイルとしても配布可能**

#### 方法1: Agent Plugins（推奨）

VSCode Copilot の Agent Plugins（Preview）は、superpowers の `.claude-plugin/` に最も近い配布方式:

- **プラグインマニフェスト**: `.github/plugin.json`（注: 現時点では `.github/` サブディレクトリに配置する必要あり）
  ```json
  {
    "name": "superpowers",
    "description": "Core skills library for VSCode Copilot",
    "version": "5.0.7",
    "skills": ["../../skills/brainstorming", "../../skills/test-driven-development"],
    "agents": ["../../agents/code-reviewer.md"],
    "hooks": "../../hooks/hooks.json"
  }
  ```
- **マーケットプレイス**: Git リポジトリベースのマーケットプレイス（`.github/plugin/marketplace.json`）
- **インストール方法**:
  - VSCode: Extensions ビューで `@agentPlugins` 検索
  - Copilot CLI: `copilot plugin install superpowers@marketplace-name`
- **デフォルトマーケットプレイス**: `github/copilot-plugins` と `github/awesome-copilot`

#### 方法2: `.github/` 配下のファイルとして配布

- `.github/skills/*/SKILL.md`: スキルファイル
- `.github/agents/*.agent.md`: カスタムエージェント
- `.github/hooks/*.json`: フック設定
- リポジトリに直接コミットして配布

#### 方法3: ユーザーレベルのインストール

- `~/.copilot/skills/`: グローバルスキル
- `~/.copilot/agents/`: グローバルエージェント
- `~/.copilot/hooks/`: グローバルフック

**superpowers への影響**:
- superpowers は既に `.claude-plugin/plugin.json` を持っているため、`.github/plugin.json` を追加するだけで VSCode Copilot の Agent Plugins として配布可能
- マーケットプレイス（`github/copilot-plugins` 等）への登録も可能
- superpowers の既存の `hooks/hooks.json` がそのまま使える可能性が高い

**情報源**:
- [VSCode Agent Plugins ドキュメント](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) — 確認日: 調査時点
- [Creating Agent Plugins for VS Code and Copilot CLI](https://www.kenmuse.com/blog/creating-agent-plugins-for-vs-code-and-copilot-cli/) — 2025年公開

---

### 7. VSCode Copilot のサブエージェント機構

**結論: 充実したサブエージェント機構がある。カスタムエージェントをサブエージェントとして派遣可能**

- **`runSubagent` ツール**: メインエージェントがサブエージェントを派遣するためのツール
- **カスタムエージェントをサブエージェントとして実行**（Experimental）:
  - `.agent.md` ファイルで定義したカスタムエージェントをサブエージェントとして呼び出し可能
  - 各サブエージェントは独自のモデル、ツール、指示を持てる
  - `user-invocable: false` でサブエージェント専用のエージェントを作成可能
  - `agents` プロパティで使用可能なサブエージェントを制限可能
- **並列実行**: 複数のサブエージェントを並列で実行可能
- **ネストされたサブエージェント**: `chat.subagents.allowInvocationsFromSubagents` 設定で再帰的なサブエージェント呼び出しが可能（最大深度5）
- **オーケストレーションパターン**:
  - **Coordinator and Worker パターン**: コーディネーターエージェントが専門ワーカーエージェントにタスクを委譲
  - **Multi-perspective Code Review**: 複数の視点からの並列コードレビュー
- **モデル選択**: サブエージェントごとに異なるモデルを指定可能

**superpowers への影響**:
- superpowers の `subagent-driven-development` スキルが VSCode Copilot でネイティブに動作する
- superpowers の `dispatching-parallel-agents` スキルも並列サブエージェント実行で対応可能
- superpowers の `agents/code-reviewer.md` を `.agent.md` 形式に変換すれば、カスタムサブエージェントとして利用可能
- VSCode Copilot の Coordinator and Worker パターンは superpowers の設計思想と完全に一致する

**情報源**:
- [VSCode Copilot Subagents ドキュメント](https://code.visualstudio.com/docs/copilot/agents/subagents) — 確認日: 調査時点
- [VSCode Custom Agents ドキュメント](https://code.visualstudio.com/docs/copilot/chat/chat-modes) — 確認日: 調査時点

---

## 代替手段

| 方式 | メリット | デメリット |
|---|---|---|
| Agent Plugins（推奨） | 公式配布方式、マーケットプレイス対応、一括インストール | Preview 機能、仕様変更の可能性 |
| `.github/` 配下のファイル | シンプル、リポジトリに直接コミット | プロジェクトごとにコピーが必要 |
| ユーザーレベルインストール | 全ワークスペースで利用可能 | 手動セットアップが必要 |
| VSCode 拡張機能 | Marketplace で配布可能 | 開発コストが高い |

---

## リスク

### 技術的リスク
- **Agent Plugins は Preview**: 仕様変更の可能性がある。ただし、スキルとエージェントの基本形式（SKILL.md, .agent.md）は安定している
- **Claude 形式の自動マッピングの限界**: VSCode Copilot は Claude 形式のツール名を自動マッピングするが、完全な互換性は保証されない。特に `matcher` は現在無視される

### 将来の継続性リスク
- **Agent Skills 標準への準拠**: VSCode Copilot は agentskills.io 標準をサポートしており、標準が安定すれば互換性は維持される見込み
- **GitHub の積極的な開発**: VSCode Copilot は GitHub が積極的に開発しており、機能追加が頻繁。互換性の維持には継続的な確認が必要

### ライセンスリスク
- 特になし。superpowers は MIT ライセンスであり、VSCode Copilot への配布に制約はない

### コストリスク
- **GitHub Copilot の料金体系**:
  - Free: 月50回のエージェントモード/チャットリクエスト、月2,000回のコード補完
  - Pro: 月額 $10/ユーザー（無制限のコード補完、月500回のプレミアムリクエスト）
  - Pro+: 月額 $39/ユーザー（月1,500回のプレミアムリクエスト）
  - Business: 月額 $19/ユーザー
  - Enterprise: 月額 $39/ユーザー
- サブエージェントの実行はプレミアムリクエストを消費する

---

## 実現可能性の総合評価

| 項目 | 評価 | 理由 |
|---|---|---|
| 実現可能性 | **可能** | スキル・サブエージェント・フック・プラグイン配布の全てがネイティブサポート |
| 実装の難易度 | **低〜中** | Agent Skills 標準の互換性が高く、Claude 形式の自動マッピングもある。プラグインマニフェストの作成が主な作業 |
| 既存パターンとの類似性 | **Claude Code パターンに最も近い** | `.claude-plugin/` → `.github/plugin.json`、スキル・エージェント・フックの全てが対応 |
| コスト | **有料**（GitHub Copilot のサブスクリプションが必要） | Free プランでも基本機能は利用可能だが、エージェントモードの利用回数に制限あり |

---

## superpowers の既存プラットフォームとの比較

| 機能 | Claude Code | Cursor | Codex | OpenCode | Gemini CLI | Copilot CLI | **Kiro** | **VSCode Copilot** |
|---|---|---|---|---|---|---|---|---|
| スキル（SKILL.md） | ✅ ネイティブ | ✅ プラグイン | ✅ symlink | ✅ プラグイン | ✅ activate_skill | ✅ skill | ✅ ネイティブ | ✅ ネイティブ |
| サブエージェント | ✅ Task | ✅ Task | ✅ spawn_agent | ✅ @mention | ❌ なし | ✅ task | ✅ invokeSubAgent/subagent | ✅ runSubagent |
| セッション開始フック | ✅ hooks.json | ✅ hooks-cursor.json | ❌ | ❌ | ❌ | ✅ hooks.json | ⚠️ ステアリングで代替 | ✅ SessionStart |
| プラグイン配布 | ✅ .claude-plugin | ✅ .cursor-plugin | ✅ symlink | ✅ opencode.json | ✅ gemini-extension.json | ✅ plugin install | ⚠️ git clone + symlink | ✅ Agent Plugins |
| ツールマッピング | 基準 | 同一 | codex-tools.md | 自動 | gemini-tools.md | copilot-tools.md | **要作成** | **一部自動** |
