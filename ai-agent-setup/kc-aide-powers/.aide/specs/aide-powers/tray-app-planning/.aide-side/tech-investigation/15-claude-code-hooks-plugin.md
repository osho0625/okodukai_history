# Claude Code Hooks & Plugin 配布設定 技術調査

## 調査概要

- **調査対象**: Claude Code の hooks（セッション開始時スキル注入）と plugin 配布設定
- **調査日**: 2025年7月
- **調査の背景**: aide-powers を Claude Code プラグインとして配布する際に、セッション開始時にスキル（SKILL.md）を自動注入する仕組みと、プラグインとしてのパッケージング方法を把握する必要がある

## 要約

Claude Code は `hooks/hooks.json` で `SessionStart` イベントにフックを登録し、セッション開始時にシェルスクリプトを実行してスキル内容をコンテキストに注入できる。プラグインは `.claude-plugin/plugin.json` にメタデータを定義し、`skills/`・`agents/`・`hooks/` を標準ディレクトリに配置すれば自動認識される。配布は marketplace 経由（`/plugin install`）またはローカル（`--plugin-dir`）で行う。superpowers は SessionStart フックで `using-superpowers` スキルの全文を `additionalContext` として注入し、以降のスキルは Claude の `Skill` ツール経由で読み込む方式を採用している。

---

## 調査対象1: SessionStart hooks によるスキル自動注入

### 実現可能性

**可能**（公式サポート機能）

### 仕組みの概要

Claude Code の hooks は、セッションのライフサイクルの特定ポイントで自動実行されるシェルコマンド。`SessionStart` イベントを使うことで、セッション開始時にスキル内容を Claude のコンテキストに注入できる。

### hooks.json のフォーマット

#### 配置場所

| 場所 | スコープ | 共有可能 |
|------|----------|----------|
| `~/.claude/settings.json` | 全プロジェクト | No |
| `.claude/settings.json` | 単一プロジェクト | Yes（リポジトリにコミット可） |
| `.claude/settings.local.json` | 単一プロジェクト | No（gitignore） |
| Plugin の `hooks/hooks.json` | プラグイン有効時 | Yes（プラグインにバンドル） |

#### プラグイン用 hooks.json の基本構造

```json
{
  "description": "オプション: フックの説明",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

#### SessionStart の matcher 値

| matcher | 発火タイミング |
|---------|---------------|
| `startup` | 新規セッション開始 |
| `resume` | `--resume`, `--continue`, `/resume` |
| `clear` | `/clear` |
| `compact` | 自動/手動コンパクション |

### SessionStart フックの出力形式

フックスクリプトは JSON を stdout に出力する。`hookSpecificOutput.additionalContext` にテキストを設定すると、Claude のコンテキストウィンドウに注入される。

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "ここに注入したいテキスト（スキル内容等）"
  }
}
```

**重要な制約:**
- `additionalContext` は **10,000文字** が上限。超過分はファイルに保存され、プレビュー+ファイルパスに置換される
- SessionStart では `type: "command"` と `type: "mcp_tool"` のみサポート（`prompt`、`agent`、`http` は不可）
- plain stdout（JSON でないテキスト）もコンテキストとして追加される

### 環境変数

| 変数 | 説明 |
|------|------|
| `${CLAUDE_PLUGIN_ROOT}` | プラグインのインストールディレクトリ（更新ごとに変わる） |
| `${CLAUDE_PLUGIN_DATA}` | プラグインの永続データディレクトリ（更新後も維持） |
| `$CLAUDE_PROJECT_DIR` | プロジェクトルート |
| `$CLAUDE_ENV_FILE` | 環境変数永続化用ファイルパス |

### superpowers の実装方式（参考）

superpowers は以下の方式でスキルを注入している:

#### hooks/hooks.json
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

#### hooks/session-start（bash スクリプト）

1. `${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md` を読み込む
2. 内容を JSON エスケープする
3. `<EXTREMELY_IMPORTANT>` タグで囲んだコンテキストとして出力
4. プラットフォーム判定（Claude Code / Cursor / Copilot CLI）に応じて出力形式を変える

```bash
# Claude Code 向け出力
printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context"
```

#### hooks/run-hook.cmd（クロスプラットフォーム対応）

polyglot スクリプト（CMD と bash の両方で有効）:
- **Windows**: CMD が batch 部分を実行し、Git Bash を探して bash スクリプトを実行
- **Unix**: `:` を no-op として解釈し、直接 bash スクリプトを実行

### 実装の難易度

**低〜中**

- hooks.json の設定自体は単純
- Windows 対応（polyglot wrapper）が若干複雑
- JSON エスケープ処理が必要（bash の文字列置換で対応可能）

### 制約事項

1. **10,000文字制限**: additionalContext の上限。大きなスキルファイルは全文注入できない可能性がある
2. **SessionStart は command と mcp_tool のみ**: prompt/agent/http フックは使えない
3. **Windows 対応**: bash が必要（Git for Windows が前提）
4. **実行速度**: SessionStart は毎セッション実行されるため、高速に保つ必要がある
5. **resume 時の挙動**: SessionStart は resume 時にも再実行される（matcher で制御可能）

---

## 調査対象2: プラグイン配布設定

### 実現可能性

**可能**（公式サポート機能）

### .claude-plugin/plugin.json のフォーマット

```json
{
  "name": "aide-powers",
  "version": "1.0.0",
  "description": "プラグインの説明",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "homepage": "https://github.com/...",
  "repository": "https://github.com/...",
  "license": "MIT",
  "keywords": ["skills", "workflow", "development"]
}
```

#### 必須フィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `name` | string | プラグイン識別子（kebab-case、スペース不可） |

#### オプションフィールド（メタデータ）

| フィールド | 型 | 説明 |
|-----------|------|------|
| `version` | string | セマンティックバージョン |
| `description` | string | プラグインの説明 |
| `author` | object | 作者情報（name, email, url） |
| `homepage` | string | ドキュメントURL |
| `repository` | string | ソースコードURL |
| `license` | string | ライセンス識別子 |
| `keywords` | array | 検索用タグ |

#### コンポーネントパスフィールド（オプション）

| フィールド | 型 | 説明 | デフォルト |
|-----------|------|------|-----------|
| `skills` | string\|array | スキルディレクトリ | `skills/` |
| `commands` | string\|array | コマンド（フラット .md） | `commands/` |
| `agents` | string\|array | エージェント定義 | `agents/` |
| `hooks` | string\|object | フック設定 | `hooks/hooks.json` |
| `mcpServers` | string\|object | MCP サーバー設定 | `.mcp.json` |
| `lspServers` | string\|object | LSP サーバー設定 | `.lsp.json` |

**重要**: `plugin.json` はオプション。省略した場合、Claude Code はデフォルトの場所からコンポーネントを自動検出する。

### プラグインのディレクトリ構造

```
aide-powers/
├── .claude-plugin/
│   └── plugin.json          ← メタデータのみ
├── skills/                  ← スキル（自動検出）
│   ├── using-aide-powers/
│   │   └── SKILL.md
│   ├── brainstorming/
│   │   └── SKILL.md
│   └── ...
├── agents/                  ← エージェント（自動検出）
│   ├── code-reviewer.md
│   └── ...
├── hooks/                   ← フック（自動検出）
│   ├── hooks.json
│   ├── run-hook.cmd
│   └── session-start
├── commands/                ← コマンド（フラット .md）
│   └── ...
├── scripts/                 ← フック用スクリプト
│   └── ...
├── bin/                     ← PATH に追加される実行ファイル
│   └── ...
├── settings.json            ← デフォルト設定（agent, subagentStatusLine のみ）
├── CLAUDE.md                ← ※プラグインでは読み込まれない
└── README.md
```

**注意点:**
- `CLAUDE.md` はプラグインルートに置いてもコンテキストとして読み込まれない
- コンテキスト注入は skills、agents、hooks 経由で行う
- コンポーネントはプラグインルート直下に配置（`.claude-plugin/` 内ではない）

### skills/ の認識方法

- `skills/<name>/SKILL.md` の構造で配置
- SKILL.md に YAML frontmatter を含める:

```yaml
---
name: skill-name
description: スキルの説明。Claude がいつこのスキルを使うべきか記述
---

スキルの本文（指示内容）
```

- インストール後、`/plugin-name:skill-name` で呼び出し可能
- Claude は `Skill` ツールで自動的にスキルを読み込む

### agents/ の認識方法

- `agents/<name>.md` として配置
- YAML frontmatter でエージェント設定:

```yaml
---
name: agent-name
description: エージェントの説明
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---

エージェントのシステムプロンプト
```

- サポートされるフィールド: `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`
- **セキュリティ制限**: プラグインのエージェントでは `hooks`, `mcpServers`, `permissionMode` は使用不可

### プラグインのインストール方法

#### 1. 公式マーケットプレイス経由

```bash
/plugin install aide-powers@claude-plugins-official
```

#### 2. カスタムマーケットプレイス経由

```bash
# マーケットプレイスを登録
/plugin marketplace add owner/marketplace-repo

# プラグインをインストール
/plugin install aide-powers@marketplace-name
```

#### 3. ローカルテスト（開発時）

```bash
claude --plugin-dir ./aide-powers
```

#### 4. CLI コマンド

```bash
# インストール
claude plugin install aide-powers@marketplace-name

# アンインストール
claude plugin uninstall aide-powers

# 更新
claude plugin update aide-powers

# 有効化/無効化
claude plugin enable aide-powers
claude plugin disable aide-powers

# 一覧
claude plugin list
```

### マーケットプレイスの作成

`.claude-plugin/marketplace.json` を作成:

```json
{
  "name": "aide-powers-marketplace",
  "description": "aide-powers プラグインマーケットプレイス",
  "owner": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "plugins": [
    {
      "name": "aide-powers",
      "description": "開発ワークフロー支援スキルライブラリ",
      "version": "1.0.0",
      "source": "./",
      "author": {
        "name": "Author Name"
      }
    }
  ]
}
```

### superpowers の実装方式（参考）

#### .claude-plugin/plugin.json
```json
{
  "name": "superpowers",
  "description": "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques",
  "version": "5.0.7",
  "author": {
    "name": "Jesse Vincent",
    "email": "jesse@fsck.com"
  },
  "homepage": "https://github.com/obra/superpowers",
  "repository": "https://github.com/obra/superpowers",
  "license": "MIT",
  "keywords": ["skills", "tdd", "debugging", "collaboration", "best-practices", "workflows"]
}
```

#### .claude-plugin/marketplace.json
```json
{
  "name": "superpowers-dev",
  "description": "Development marketplace for Superpowers core skills library",
  "owner": {
    "name": "Jesse Vincent",
    "email": "jesse@fsck.com"
  },
  "plugins": [
    {
      "name": "superpowers",
      "description": "Core skills library for Claude Code...",
      "version": "5.0.7",
      "source": "./",
      "author": {
        "name": "Jesse Vincent"
      }
    }
  ]
}
```

### 実装の難易度

**低**

- ディレクトリ構造に従ってファイルを配置するだけ
- plugin.json は最小限で良い（name のみ必須）
- skills/ と agents/ は標準ディレクトリに置けば自動認識

### コスト

**無料**（Claude Code のプラグインシステムは追加料金なし）

---

## 代替手段

### スキル注入の代替手段

| 方式 | メリット | デメリット |
|------|----------|-----------|
| **SessionStart hook（推奨）** | セッション開始時に確実に注入、プラグインとしてバンドル可能 | 10,000文字制限、bash 必要 |
| **CLAUDE.md** | 設定不要、静的コンテキスト向き | プラグインでは読み込まれない、スクリプト実行不可 |
| **skills/ ディレクトリ** | Claude が自動的に必要時に読み込む | セッション開始時の強制注入はできない |
| **settings.json の agent 設定** | メインスレッドのエージェントを変更可能 | スキル注入とは異なる用途 |

### 配布の代替手段

| 方式 | メリット | デメリット |
|------|----------|-----------|
| **マーケットプレイス（推奨）** | 標準的な配布方法、バージョン管理、自動更新 | マーケットプレイスリポジトリの管理が必要 |
| **--plugin-dir** | 開発時に便利、即座にテスト可能 | セッション限定、永続化されない |
| **--plugin-url** | ZIP アーカイブで配布可能 | セッション限定 |
| **プロジェクト設定** | チーム共有が容易 | プロジェクト固有 |

---

## リスク

### 技術的リスク

1. **10,000文字制限**: 大きなスキルファイルの全文注入ができない可能性。superpowers は `using-superpowers` スキルのみ注入し、他は `Skill` ツール経由で読み込む方式で回避
2. **Windows 互換性**: bash が必要。Git for Windows がインストールされていない環境では動作しない
3. **プラグインキャッシュ**: プラグインはキャッシュディレクトリにコピーされるため、外部ファイル参照（`../`）は動作しない

### ライセンスリスク

- Claude Code のプラグインシステム自体にライセンス制約はない
- 配布するプラグインのライセンスは自由に設定可能

### 将来の継続性リスク

1. **API の安定性**: hooks と plugin の仕様は活発に開発中。新しいイベントやフィールドが追加される可能性が高い
2. **破壊的変更**: プラグインシステムは比較的新しい機能であり、将来的に仕様変更の可能性がある
3. **experimental フラグ**: monitors、themes は experimental 扱い。hooks と skills は安定版

---

## aide-powers への適用方針（参考）

superpowers の方式を参考に、以下の構成が推奨される:

```
aide-powers/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   ├── using-aide-powers/
│   │   └── SKILL.md          ← SessionStart で注入するメインスキル
│   ├── design-workflow/
│   │   └── SKILL.md
│   └── ...
├── agents/
│   ├── code-reviewer.md
│   └── ...
├── hooks/
│   ├── hooks.json
│   ├── run-hook.cmd           ← クロスプラットフォーム wrapper
│   └── session-start          ← スキル注入スクリプト
└── README.md
```

**注入戦略:**
1. SessionStart で `using-aide-powers` スキル（ナビゲーション用）のみ注入（10,000文字以内）
2. 個別スキルは Claude の `Skill` ツール経由でオンデマンド読み込み
3. エージェントは `agents/` に配置して自動認識

---

## 情報源

| ソース | URL / パス | 確認日 |
|--------|-----------|--------|
| Claude Code Hooks リファレンス（公式） | https://docs.anthropic.com/en/docs/claude-code/hooks | 2025年7月 |
| Claude Code Plugins 作成ガイド（公式） | https://docs.anthropic.com/en/docs/claude-code/plugins | 2025年7月 |
| Claude Code Plugins リファレンス（公式） | https://docs.anthropic.com/en/docs/claude-code/plugins-reference | 2025年7月 |
| Claude Code Plugin Marketplaces（公式） | https://docs.anthropic.com/en/docs/claude-code/plugin-marketplaces | 2025年7月 |
| superpowers hooks/hooks.json | `references/superpowers/hooks/hooks.json` | ローカル |
| superpowers hooks/session-start | `references/superpowers/hooks/session-start` | ローカル |
| superpowers hooks/run-hook.cmd | `references/superpowers/hooks/run-hook.cmd` | ローカル |
| superpowers .claude-plugin/plugin.json | `references/superpowers/.claude-plugin/plugin.json` | ローカル |
| superpowers .claude-plugin/marketplace.json | `references/superpowers/.claude-plugin/marketplace.json` | ローカル |
| superpowers README.md | `references/superpowers/README.md` | ローカル |
| superpowers polyglot-hooks ドキュメント | `references/superpowers/docs/windows/polyglot-hooks.md` | ローカル |
