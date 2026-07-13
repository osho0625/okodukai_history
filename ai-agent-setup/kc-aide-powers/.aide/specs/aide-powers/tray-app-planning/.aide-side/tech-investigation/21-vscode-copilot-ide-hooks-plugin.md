# VSCode GitHub Copilot（IDE版）: Hooks・スキル自動注入・プラグイン配布

## 要約

VSCode GitHub Copilot（IDE版）は、2026年5月時点で非常に充実したカスタマイズ機構を備えている。セッション開始時のスキル自動注入は **Hooks（SessionStart イベント）** と **Agent Skills（SKILL.md）** の組み合わせで実現可能。プラグイン配布は **Agent Plugins（Preview）** 機能により、Git リポジトリベースのマーケットプレイスから配布可能。`.github/agents/*.agent.md` によるカスタムエージェント定義、`.github/skills/` 配下の SKILL.md によるスキル定義が標準的な方法であり、Claude Code 互換の `.claude/` 形式もサポートされている。

---

## 調査概要

- **調査対象**: VSCode GitHub Copilot（IDE版）のセッション開始時スキル自動注入とプラグイン配布設定
- **調査日**: 2025年7月（公式ドキュメント最終更新: 2026年5月6日）
- **調査の背景**: aide-powers フレームワークの VSCode Copilot 対応設計のため

---

## 調査対象1: セッション開始時にスキル（SKILL.md）を自動注入する仕組み

### 1.1 Hooks（Agent Hooks）

**実現可能性: 可能（Preview機能）**

VSCode Copilot の Agent モードで Hooks が使用可能。Hooks はエージェントセッションのライフサイクルの特定ポイントでシェルコマンドを実行する仕組み。

#### サポートされるフックイベント

| イベント | 発火タイミング | 用途 |
|---|---|---|
| **SessionStart** | 新しいセッションの最初のプロンプト送信時 | リソース初期化、セッション開始ログ、プロジェクト状態検証 |
| UserPromptSubmit | ユーザーがプロンプトを送信した時 | ユーザーリクエストの監査、システムコンテキスト注入 |
| PreToolUse | エージェントがツールを呼び出す前 | 危険な操作のブロック、承認要求、ツール入力の変更 |
| PostToolUse | ツールが正常完了した後 | フォーマッター実行、結果ログ、フォローアップアクション |
| PreCompact | 会話コンテキストが圧縮される前 | 重要なコンテキストのエクスポート |
| SubagentStart | サブエージェントが生成された時 | ネストされたエージェント使用の追跡 |
| SubagentStop | サブエージェントが完了した時 | 結果の集約、クリーンアップ |
| Stop | エージェントセッション終了時 | レポート生成、リソースクリーンアップ |

#### SessionStart フックによるコンテキスト注入

SessionStart フックは `additionalContext` フィールドを通じてエージェントの会話にコンテキストを注入できる:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Project: my-app v2.1.0 | Branch: main | Node: v20.11.0"
  }
}
```

#### フック設定ファイルの配置場所

| スコープ | デフォルトの配置場所 |
|---|---|
| ワークスペース | `.github/hooks/*.json` |
| ワークスペース（Claude形式） | `.claude/settings.json`, `.claude/settings.local.json` |
| ユーザー | `~/.copilot/hooks`, `~/.claude/settings.json` |
| カスタムエージェント | `.agent.md` の frontmatter 内 `hooks` フィールド |
| プラグイン | `hooks.json` または `hooks/hooks.json` |

#### エージェントスコープのフック

カスタムエージェントの frontmatter 内に直接フックを定義可能。そのエージェントがアクティブな時のみ実行される:

```yaml
---
name: "Strict Formatter"
description: "Agent that auto-formats code after every edit"
hooks:
  PostToolUse:
    - type: command
      command: "./scripts/format-changed-files.sh"
---
```

**設定**: `chat.useCustomAgentHooks` を `true` に設定する必要あり。

#### 関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `chat.hookFilesLocations` | `{".github/hooks": true, ".claude/settings.local.json": true, ".claude/settings.json": true, "~/.claude/settings.json": true}` | フックファイルの検索場所。**注意: `~/.copilot/hooks` はデフォルトに含まれない。** setup スクリプトで追加する必要がある |
| `chat.useCustomAgentHooks` | `false` | エージェント frontmatter 内のフックを有効化（ワークスペース/ユーザーレベルのフックには不要） |

---

### 1.2 .github/copilot-instructions.md（常時適用カスタムインストラクション）

**実現可能性: 可能（安定機能）**

ワークスペースルートの `.github/copilot-instructions.md` に記述した内容は、すべてのチャットリクエストに自動的に適用される。

#### 特徴
- Markdown 形式で記述
- すべてのチャットリクエストに自動適用（Always-on）
- プロジェクト全体のコーディング規約、アーキテクチャ決定、セキュリティ要件に最適
- `/init` コマンドで AI が自動生成可能

#### 関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `github.copilot.chat.codeGeneration.useInstructionFiles` | `true` | copilot-instructions.md の自動適用 |

---

### 1.3 AGENTS.md ファイル

**実現可能性: 可能（安定機能）**

ワークスペースルートの `AGENTS.md` ファイルも常時適用のインストラクションとして機能する。

#### 特徴
- 複数の AI エージェントで共通のインストラクションを使いたい場合に有用
- サブフォルダに配置して部分適用も可能（実験的機能: `chat.useNestedAgentsMdFiles`）
- `CLAUDE.md` も同様に認識される（`chat.useClaudeMdFile` 設定）

#### 関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `chat.useAgentsMdFile` | `true` | AGENTS.md の使用を有効化 |
| `chat.useNestedAgentsMdFiles` | `false` | サブフォルダの AGENTS.md を有効化（実験的） |
| `chat.useClaudeMdFile` | `true` | CLAUDE.md の使用を有効化 |

---

### 1.4 Agent Skills（SKILL.md）

**実現可能性: 可能（安定機能）**

Agent Skills はフォルダ単位で定義されるインストラクション・スクリプト・リソースのバンドル。Copilot が関連性を判断して自動的にロードする。

#### スキルの配置場所

| スキルタイプ | 配置場所 |
|---|---|
| プロジェクトスキル | `.github/skills/`, `.claude/skills/`, `.agents/skills/` |
| パーソナルスキル | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` |

#### SKILL.md のフォーマット

```yaml
---
name: skill-name
description: Description of what the skill does and when to use it
argument-hint: "[options]"
user-invocable: true
disable-model-invocation: false
context: inline  # or "fork" (experimental)
---

# Skill Instructions

Your detailed instructions, guidelines, and examples go here...
```

#### スキルの自動ロード動作

1. **Discovery**: Copilot が YAML frontmatter の `name` と `description` を読み取る
2. **Instructions loading**: ユーザーのプロンプトに関連すると判断した場合、SKILL.md の本文をコンテキストにロード
3. **Resource access**: インストラクション内で参照されたファイルのみアクセス

#### スキルの呼び出し方法

- **自動**: Copilot がプロンプトの内容から関連性を判断して自動ロード
- **手動**: `/skill-name` としてスラッシュコマンドで呼び出し
- `user-invocable: false` で `/` メニューから非表示にしつつ自動ロードのみ許可
- `disable-model-invocation: true` で手動呼び出しのみに制限

#### skills/ ディレクトリの自動認識

**あり**。デフォルトで以下のディレクトリが自動認識される:

```json
"chat.agentSkillsLocations": {
  ".github/skills": true,
  ".claude/skills": true,
  "~/.copilot/skills": true,
  "~/.claude/skills": true
}
```

追加のディレクトリは `chat.agentSkillsLocations` 設定で指定可能。

#### Agent Skills のクロスツール互換性

Agent Skills はオープンスタンダード（agentskills.io）であり、以下で動作:
- GitHub Copilot in VS Code
- GitHub Copilot CLI
- GitHub Copilot cloud agent

---

### 1.5 Custom Agents（.agent.md）

**実現可能性: 可能（安定機能）**

カスタムエージェントは `.agent.md` ファイルで定義され、特定のペルソナ・ツール制限・モデル設定を持つ。

#### 配置場所

| スコープ | デフォルトの配置場所 |
|---|---|
| ワークスペース | `.github/agents/` フォルダ |
| ワークスペース（Claude形式） | `.claude/agents/` フォルダ |
| ユーザープロファイル | `~/.copilot/agents/` |

#### .agent.md のフォーマット

```yaml
---
description: Generate an implementation plan
name: Planner
tools: ['web/fetch', 'search/codebase', 'search/usages']
model: ['Claude Opus 4.5', 'GPT-5.2']
agents: ['Researcher', 'Implementer']
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
hooks:
  PostToolUse:
    - type: command
      command: "./scripts/format.sh"
---

# Planning instructions
You are in planning mode...
```

#### 主要な frontmatter フィールド

| フィールド | 説明 |
|---|---|
| `description` | エージェントの説明 |
| `name` | エージェント名（省略時はファイル名） |
| `tools` | 利用可能なツールのリスト |
| `agents` | サブエージェントとして利用可能なエージェント |
| `model` | 使用する AI モデル（配列で優先順位指定可） |
| `handoffs` | 他のエージェントへの引き継ぎ定義 |
| `hooks` | エージェントスコープのフック定義 |
| `user-invocable` | ドロップダウンに表示するか（デフォルト: true） |
| `disable-model-invocation` | サブエージェントとしての呼び出しを禁止するか |

#### 関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `chat.agentFilesLocations` | `{".github/agents": true}` | エージェントファイルの検索場所 |
| `github.copilot.chat.organizationCustomAgents.enabled` | `true` | 組織レベルのカスタムエージェント検出 |

---

### 1.6 File-based Instructions（*.instructions.md）

**実現可能性: 可能（安定機能）**

ファイルパターンに基づいて条件付きで適用されるインストラクション。

#### 配置場所

| スコープ | デフォルトの配置場所 |
|---|---|
| ワークスペース | `.github/instructions/` フォルダ |
| ワークスペース（Claude形式） | `.claude/rules/` フォルダ |
| ユーザープロファイル | `~/.copilot/instructions/`, `~/.claude/rules/` |

#### フォーマット

```yaml
---
name: 'Python Standards'
description: 'Coding conventions for Python files'
applyTo: '**/*.py'
---
# Python coding standards
- Follow the PEP 8 style guide.
```

---

### 1.7 .vscode/settings.json の関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `chat.agent.enabled` | `true` | エージェント機能の有効化 |
| `chat.useAgentSkills` | `true` | Agent Skills のサポート |
| `chat.useCustomizationsInParentRepositories` | `false` | 親リポジトリからのカスタマイズ検出 |
| `chat.instructionsFilesLocations` | `{".github/instructions": true, ...}` | インストラクションファイルの検索場所 |
| `chat.agentSkillsLocations` | 上記参照 | スキルの検索場所 |
| `chat.agentFilesLocations` | `{".github/agents": true}` | エージェントファイルの検索場所 |
| `chat.hookFilesLocations` | `{".github/hooks": true, ...}` | フックファイルの検索場所 |

---

## 調査対象2: プラグイン配布設定

### 2.1 Agent Plugins（Preview）

**実現可能性: 条件付き可能（Preview機能、組織レベルで管理）**

Agent Plugins は、スラッシュコマンド・スキル・カスタムエージェント・フック・MCP サーバーをバンドルしたパッケージ。

#### プラグインの構成

```
my-testing-plugin/
  plugin.json              # プラグインメタデータ
  skills/
    test-runner/
      SKILL.md             # テストスキル
      run-tests.sh         # サポートスクリプト
  agents/
    test-reviewer.agent.md # コードレビューエージェント
  hooks/
    hooks.json             # フック設定
  scripts/
    validate-tests.sh      # フックスクリプト
  .mcp.json                # MCP サーバー定義
```

#### plugin.json の必須フィールド

```json
{
  "name": "my-dev-tools",
  "description": "React development utilities",
  "version": "1.2.0",
  "author": {
    "name": "Jane Doe"
  },
  "skills": "skills/",
  "agents": "agents/",
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

#### プラグインの配布方法

##### 1. Git リポジトリベースのマーケットプレイス

デフォルトのマーケットプレイス:
- `github/copilot-plugins`
- `github/awesome-copilot`

追加マーケットプレイスの設定:
```json
"chat.plugins.marketplaces": [
  "anthropics/claude-code",
  "your-org/plugin-marketplace"
]
```

マーケットプレイスの参照形式:
- **Shorthand**: `owner/repo`（公開 GitHub リポジトリ）
- **HTTPS git remote**: `https://github.com/org/repo.git`
- **SCP-style git remote**: `git@github.com:org/repo.git`
- **file URI**: `file:///path/to/marketplace`（ローカルクローン）

プライベートリポジトリもサポート。

##### 2. Git リポジトリ URL から直接インストール

コマンドパレットから `Chat: Install Plugin From Source` を実行し、Git リポジトリ URL を入力:
```
https://github.com/rwoll/markdown-review
```

##### 3. ローカルプラグインの登録

```json
"chat.pluginLocations": {
  "/path/to/my-plugin": true,
  "/path/to/another-plugin": false
}
```

##### 4. ワークスペースプラグイン推奨

`.claude/settings.json` または `.github/copilot/settings.json` で推奨プラグインを設定:
```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/plugin-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true
  }
}
```

#### VSCode Marketplace 経由での配布

**直接的なプラグイン配布は不可**。ただし、VSCode 拡張機能（Extension）として以下を提供可能:

- **Language Model Tool**: `package.json` の `contributes` で定義し、Marketplace で配布
- **Chat Participant**: `package.json` の `contributes` で定義し、Marketplace で配布
- **chatSkills**: 拡張機能の `package.json` で `chatSkills` contribution point を使用してスキルを提供

```json
{
  "contributes": {
    "chatSkills": [
      {
        "path": "./skills/my-skill/SKILL.md"
      }
    ]
  }
}
```

#### 関連設定

| 設定 | デフォルト | 説明 |
|---|---|---|
| `chat.plugins.enabled` | `false` | Agent Plugins の有効化（組織管理） |
| `chat.plugins.marketplaces` | `["github/copilot-plugins", "github/awesome-copilot"]` | マーケットプレイスリポジトリ |
| `chat.pluginLocations` | `{}` | ローカルプラグインの登録 |

---

### 2.2 .agent.md ファイルの配置場所と認識方法

| 配置場所 | 認識 | 備考 |
|---|---|---|
| `.github/agents/*.agent.md` | ✅ 認識される | デフォルトの配置場所 |
| `.github/agents/*.md` | ✅ 認識される | `.github/agents/` 内の `.md` ファイルはすべてエージェントとして検出 |
| `.claude/agents/*.md` | ✅ 認識される | Claude 形式互換。Claude Code と共有可能 |
| `~/.copilot/agents/` | ✅ 認識される | ユーザーレベル（全ワークスペース共通） |
| `~/.claude/agents/` | ❌ 未確認 | ドキュメントに明記なし |

#### Claude 形式との互換性

`.claude/agents/` フォルダ内の `.md` ファイルは Claude サブエージェント形式として認識される。Claude 固有の frontmatter プロパティもサポート:

| フィールド | 説明 |
|---|---|
| `name` | エージェント名（必須） |
| `description` | エージェントの説明 |
| `tools` | カンマ区切りのツール文字列（例: "Read, Grep, Glob, Bash"） |
| `disallowedTools` | ブロックするツールのカンマ区切り文字列 |

VSCode は Claude 固有のツール名を対応する VSCode ツールにマッピングする。

---

### 2.3 プラグインのクロスツール互換性

プラグイン形式は VSCode、GitHub Copilot CLI、Claude Code で共有される。

#### plugin.json の自動検出順序

1. `.plugin/plugin.json`
2. `plugin.json`（プラグインルート）
3. `.github/plugin/plugin.json`
4. `.claude-plugin/plugin.json`

#### プラグインルートトークン

| プラグイン形式 | トークン |
|---|---|
| Claude | `${CLAUDE_PLUGIN_ROOT}` |
| Copilot | （未定義） |
| OpenPlugin | `${PLUGIN_ROOT}` |

#### ⚠️ 手動インストール時の注意事項（実機検証済み 2025-07-08）

- `${CLAUDE_PLUGIN_ROOT}` は Claude Code のプラグインシステムでインストールされた場合のみ展開される
- VSCode の hooks で `command` に `${CLAUDE_PLUGIN_ROOT}` を含む hooks.json をそのまま配置しても、変数が展開されずコマンドが失敗する
- **解決策**: setup スクリプトで hooks.json を動的生成し、`%USERPROFILE%` を展開した絶対パスを `command` に埋め込む
- VSCode は Claude Code の `matcher` 構文をパースするが無視する（全 SessionStart で発火する）
- hooks.json と同じディレクトリの `run-hook.cmd` を絶対パスで呼べば正しく動作する

#### ⚠️ VSCode hooks の実行環境（実機検証済み 2025-07-12）

- **VSCode は hooks の command を PowerShell で実行する**（CMD ではない）
- `run-hook.cmd` は CMD バッチ構文のため、PowerShell では `ParserError: UnexpectedToken` になる
- **解決策**: hooks.json に `windows` プロパティを追加し、`cmd /c "\"パス\run-hook.cmd\" session-start"` で CMD 経由実行する
- プラグインとして `%APPDATA%\Code\agentPlugins\` に配置すれば `${CLAUDE_PLUGIN_ROOT}` が展開され、`windows` プロパティで `cmd /c` ラップすれば動作する

#### ⚠️ VSCode の additionalContext の優先度（実機検証済み 2025-07-12）

- SessionStart hook の `additionalContext` は注入されるが、**GPT 系モデルはこれを軽視する傾向がある**
- hooks 経由の注入だけではルールに従わない場合がある
- **解決策**: `~/.copilot/instructions/aide-powers.instructions.md` にルールを配置する（File-based Instructions）
- `applyTo: '**'` で全ファイルに常時適用される
- これはシステムプロンプトレベルで注入されるため、`additionalContext` より強制力が高い
- **結論**: VSCode Copilot では hooks + instructions の二重構成が必要

---

## 実装の難易度

### スキル自動注入: 低〜中

- `.github/copilot-instructions.md` による常時適用: **低**（ファイル配置のみ）
- Agent Skills（SKILL.md）: **低**（ファイル配置のみ、自動認識）
- Hooks（SessionStart）: **中**（シェルスクリプトの作成が必要）
- Custom Agents（.agent.md）: **低**（ファイル配置のみ）

### プラグイン配布: 中

- Git リポジトリからのインストール: **低**（URL 指定のみ）
- マーケットプレイス作成: **中**（Git リポジトリの構成が必要）
- VSCode Extension としての配布: **高**（Extension API の実装が必要）

---

## 制約事項・制限事項

1. **Agent Plugins は Preview 機能**: `chat.plugins.enabled` はデフォルト `false`、組織レベルで管理される
2. **Agent-scoped hooks は Preview 機能**: `chat.useCustomAgentHooks` はデフォルト `false`
3. **スキルの `context: fork` は実験的機能**: `github.copilot.chat.skillTool.enabled` が必要
4. **カスタムインストラクションはインライン補完には適用されない**: チャットリクエストのみ
5. **プラグインのフックと MCP サーバーはマシン上でコードを実行する**: セキュリティレビューが必要
6. **スキル名は kebab-case のみ**: スラッシュ、コロン、ドット、名前空間プレフィックスは使用不可（サイレントに失敗）
7. **マーケットプレイスは Git リポジトリベース**: npm/PyPI のような中央レジストリではない
8. **組織レベルの設定が個人設定を上書きする場合がある**: `chat.plugins.enabled` 等

---

## コスト

- **無料**: すべてのカスタマイズ機能（instructions, agents, skills, hooks, plugins）は追加コストなし
- **GitHub Copilot サブスクリプション**: 基盤となる Copilot サブスクリプションが必要
  - Copilot Free: 月間制限あり
  - Copilot Pro/Pro+: 2026年4月20日以降、新規登録一時停止中
  - Copilot Business/Enterprise: 組織向け

---

## リスク

### 技術的リスク

- **Preview 機能の変更リスク**: Agent Plugins、Agent-scoped hooks は Preview であり、設定形式や動作が将来変更される可能性がある
- **互換性リスク**: Claude 形式との互換性は維持されているが、将来的に乖離する可能性
- **スキルのサイレント失敗**: 名前の形式が不正な場合、エラーなしでロードに失敗する

### ライセンスリスク

- **GitHub Copilot のライセンス**: 商用利用には適切なサブスクリプションが必要
- **プラグインのライセンス**: サードパーティプラグインのライセンスは個別に確認が必要

### 将来の継続性リスク

- **積極的な開発中**: VSCode Copilot のカスタマイズ機能は急速に進化しており、API の安定性は高い
- **オープンスタンダード**: Agent Skills は agentskills.io としてオープンスタンダード化されており、ベンダーロックインリスクは低い
- **Claude Code との互換性維持**: GitHub/Microsoft と Anthropic の両方がサポートしており、エコシステムの持続性は高い

---

## aide-powers への適用方針（参考）

### SKILL.md による自動注入（推奨）

aide-powers のスキルを `.github/skills/` に配置すれば、VSCode Copilot が自動的に認識・ロードする:

```
.github/skills/
  aide-powers-design/
    SKILL.md
  aide-powers-impl/
    SKILL.md
  aide-powers-review/
    SKILL.md
```

### .agent.md によるエージェント定義

aide-powers のオーケストレーター・サブエージェントを `.github/agents/` に配置:

```
.github/agents/
  design-orchestrator.agent.md
  impl-orchestrator.agent.md
  code-reviewer.agent.md
```

### Hooks による初期化

SessionStart フックでプロジェクト固有のコンテキストを注入:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "./scripts/aide-powers-init.sh"
      }
    ]
  }
}
```

### プラグインとしての配布

aide-powers 全体を Agent Plugin として配布:

```
aide-powers-plugin/
  plugin.json
  skills/
    design/SKILL.md
    impl/SKILL.md
  agents/
    orchestrator.agent.md
  hooks/
    hooks.json
```

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| VSCode Copilot Customization Overview | https://code.visualstudio.com/docs/copilot/copilot-customization | 2025-07-08 |
| VSCode Copilot Custom Agents | https://code.visualstudio.com/docs/copilot/customization/custom-agents | 2025-07-08 |
| VSCode Copilot Agent Skills | https://code.visualstudio.com/docs/copilot/customization/agent-skills | 2025-07-08 |
| VSCode Copilot Agent Plugins | https://code.visualstudio.com/docs/copilot/customization/agent-plugins | 2025-07-08 |
| VSCode Copilot Hooks | https://code.visualstudio.com/docs/copilot/customization/hooks | 2025-07-08 |
| VSCode Copilot Custom Instructions | https://code.visualstudio.com/docs/copilot/customization/custom-instructions | 2025-07-08 |
| VSCode Copilot Settings Reference | https://code.visualstudio.com/docs/copilot/copilot-settings | 2025-07-08 |
| VSCode Copilot Extensibility Overview | https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview | 2025-07-08 |
| VSCode Copilot Best Practices | https://code.visualstudio.com/docs/copilot/prompt-crafting | 2025-07-08 |
| GitHub Docs - Repository Custom Instructions | https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot | 2025-07-08 |

※ 公式ドキュメントの最終更新日は 2026年5月6日（ドキュメント内記載）
