# Codex CLI / VSCode GitHub Copilot: Hooks とプラグイン配布設定 調査報告

## 調査概要

- **調査対象**: OpenAI Codex CLI および VSCode GitHub Copilot における hooks（セッション開始時スキル注入）とプラグイン配布設定
- **調査日**: 2025-07-14
- **調査の背景**: aide-powers のスキル（SKILL.md）を Codex CLI および VSCode Copilot で自動注入・配布するための技術的実現方法を確認する

## 要約

1. **Codex CLI**: hooks 機能（`SessionStart` イベント）でセッション開始時にスキルを注入可能。プラグインシステム（`.codex-plugin/plugin.json`）で配布可能。スキルは `$HOME/.agents/skills/` に配置するか、プラグインとしてマーケットプレイス経由でインストールする。
2. **VSCode GitHub Copilot**: hooks 機能（`sessionStart`）でセッション開始時にスクリプト実行可能。Agent Plugins（プレビュー）でスキル・エージェント・hooks をバンドル配布可能。`.github/skills/` にスキルを配置するか、プラグインマーケットプレイス経由でインストールする。
3. **GitHub Copilot CLI**: Codex CLI と同様のプラグインシステムを持ち、`.claude-plugin/` や `.github/plugin/` のマニフェストを認識する。hooks は `hooks.json` で定義する。
4. **共通点**: superpowers は `.codex/INSTALL.md`、`.claude-plugin/plugin.json`、`.cursor-plugin/plugin.json` を同一リポジトリに配置し、マルチプラットフォーム対応を実現している。

---

## プラットフォーム1: OpenAI Codex CLI

### 1.1 セッション開始時にスキル（SKILL.md）を自動注入する仕組み

#### 実現可能性: **可能**

#### 方法A: hooks（SessionStart イベント）

Codex CLI は hooks 機能を持ち、`SessionStart` イベントでセッション開始時にスクリプトを実行できる。

**有効化方法:**
```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

**hooks.json の設定例:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/session-start-script",
            "async": false
          }
        ]
      }
    ]
  }
}
```

**出力形式（スキル注入）:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "ここにスキルの内容を注入"
  }
}
```

- `additionalContext` に記載した内容が「追加の開発者コンテキスト」としてセッションに注入される
- superpowers はこの仕組みで `using-superpowers/SKILL.md` の全文をセッション開始時に注入している

**配置場所:**
- ユーザーレベル: `~/.codex/hooks.json` または `~/.codex/config.toml` 内の `[[hooks.SessionStart]]`
- プロジェクトレベル: `<repo>/.codex/hooks.json`（プロジェクトが信頼されている場合のみ読み込み）

#### 方法B: AGENTS.md（カスタムインストラクション）

- `~/.codex/AGENTS.md`（グローバル）またはプロジェクトルートの `AGENTS.md` に記載した内容がセッション開始時に自動読み込みされる
- 優先順位: `AGENTS.override.md` > `AGENTS.md` > `project_doc_fallback_filenames` で指定したファイル
- 制限: `project_doc_max_bytes`（デフォルト 32KiB）まで

#### 方法C: スキルシステム（ネイティブ）

Codex CLI はネイティブのスキルシステムを持つ:
- スキルは `SKILL.md` ファイルを含むディレクトリ
- 配置場所（優先順位順）:
  1. `$CWD/.agents/skills/`（リポジトリ内、CWD）
  2. `$REPO_ROOT/.agents/skills/`（リポジトリルート）
  3. `$HOME/.agents/skills/`（ユーザーレベル）
  4. `/etc/codex/skills`（管理者レベル）
  5. システムバンドル（OpenAI提供）
- スキルは **プログレッシブディスクロージャー** で管理: 名前・説明・パスのみ初期コンテキストに含まれ、使用時に全文読み込み
- 暗黙的呼び出し（タスクに合致する場合自動選択）と明示的呼び出し（`$skill-name`）の両方をサポート

#### 実装の難易度: **低**

- hooks は bash スクリプトで実装可能
- スキルシステムは SKILL.md を所定のディレクトリに配置するだけ
- superpowers の実装が参考になる

#### 制約事項

- hooks は feature flag で有効化が必要（`codex_hooks = true`）
- プロジェクトローカルの hooks はプロジェクトが「信頼」されている場合のみ読み込まれる
- スキルの初期リストはコンテキストウィンドウの約2%（または8,000文字）に制限される
- `AGENTS.md` は 32KiB まで

---

### 1.2 プラグイン配布設定

#### 実現可能性: **可能**

#### プラグインシステムの概要

Codex CLI はプラグインシステムを持ち、スキル・hooks・MCP サーバー・アプリ統合をバンドルして配布できる。

**プラグインの構造:**
```
my-plugin/
├── .codex-plugin/
│   └── plugin.json        # 必須: プラグインマニフェスト
├── skills/
│   └── my-skill/
│       └── SKILL.md       # スキル定義
├── hooks/
│   └── hooks.json         # ライフサイクル設定
├── .mcp.json              # MCP サーバー設定（オプション）
├── .app.json              # アプリ統合（オプション）
└── assets/                # アイコン等（オプション）
```

**plugin.json の例:**
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "プラグインの説明",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "短い説明",
    "category": "Productivity"
  }
}
```

#### マーケットプレイスによる配布

1. **リポジトリマーケットプレイス**: `$REPO_ROOT/.agents/plugins/marketplace.json`
2. **個人マーケットプレイス**: `~/.agents/plugins/marketplace.json`
3. **Claude 互換マーケットプレイス**: `$REPO_ROOT/.claude-plugin/marketplace.json`（Codex も認識する）
4. **公式プラグインディレクトリ**: Codex アプリ内のプラグインブラウザ

**インストール方法:**
```bash
# マーケットプレイスの追加
codex plugin marketplace add owner/repo

# プラグインのインストール
codex plugin install plugin-name@marketplace-name
```

#### superpowers の Codex 向け配布方法

superpowers は `.codex/INSTALL.md` に以下の手順を記載:

1. リポジトリを `~/.codex/superpowers` にクローン
2. `~/.agents/skills/superpowers` にシンボリックリンクを作成
3. Codex を再起動

```bash
git clone https://github.com/obra/superpowers.git ~/.codex/superpowers
mkdir -p ~/.agents/skills
ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers
```

- これはネイティブスキルディスカバリーを利用した方法
- 以前は `~/.codex/AGENTS.md` にブートストラップコードを記載する方法だったが、現在は非推奨

#### コスト: **無料**（Codex CLI はオープンソース、Apache-2.0 ライセンス）

---

## プラットフォーム2: VSCode GitHub Copilot

### 2.1 セッション開始時にスキル（SKILL.md）を自動注入する仕組み

#### 実現可能性: **可能**

#### 方法A: hooks（sessionStart イベント）

VSCode Copilot は hooks 機能をサポートしている。

**hooks の設定ファイル:**
- プロジェクトレベル: `.github/hooks.json` または `.vscode/hooks.json`
- プラグインバンドル: `hooks/hooks.json`

**hooks.json の設定例（Cursor 互換形式）:**
```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "command": "./hooks/session-start"
      }
    ]
  }
}
```

**GitHub Copilot CLI の hooks 設定:**
```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "./scripts/session-start.sh",
        "powershell": "./scripts/session-start.ps1",
        "timeoutSec": 30
      }
    ]
  }
}
```

- `sessionStart` hook の出力は無視される（GitHub Copilot CLI の場合）
- ただし、superpowers の session-start スクリプトは `additional_context`（Cursor）/ `hookSpecificOutput.additionalContext`（Claude Code）/ `additionalContext`（Copilot CLI）の3形式で出力しており、プラットフォームごとに異なる形式を使い分けている

**注意**: GitHub Copilot CLI の公式ドキュメントでは sessionStart hook の出力は "Ignored (no return value processed)" と記載されているが、superpowers は `additionalContext` 形式で出力しており、Copilot CLI v1.0.11+ で対応している可能性がある（要追加調査）。

#### 方法B: .github/copilot-instructions.md（カスタムインストラクション）

- `.github/copilot-instructions.md` にプロジェクト全体のルール・規約を記載
- VSCode で `/init` コマンドを実行すると自動生成される
- すべてのリクエストに自動的に適用される（always-on）
- AGENTS.md、CLAUDE.md も認識される

#### 方法C: Agent Skills（スキルシステム）

VSCode Copilot はエージェントスキルをサポート:
- `/create-skill` コマンドでスキルを生成可能
- スキルの配置場所（GitHub Copilot CLI の優先順位）:
  1. `<project>/.github/skills/`（プロジェクト）
  2. `<project>/.agents/skills/`（プロジェクト）
  3. `<project>/.claude/skills/`（プロジェクト）
  4. 親ディレクトリの上記パス（モノレポ対応）
  5. `~/.copilot/skills/`（個人、Copilot 固有）
  6. `~/.agents/skills/`（個人、共通）
  7. プラグインの skills/ ディレクトリ
  8. `COPILOT_SKILLS_DIRS` 環境変数 + config

#### 方法D: Custom Agents（.agent.md ファイル）

- `.github/agents/` に `*.agent.md` ファイルを配置
- YAML frontmatter で tools、description、MCP サーバー等を定義
- エージェントは特定のペルソナ（セキュリティレビュアー、DB管理者等）を定義可能

#### 実装の難易度: **低〜中**

- カスタムインストラクション（copilot-instructions.md）は最も簡単
- スキルシステムは SKILL.md を配置するだけ
- hooks は bash/PowerShell スクリプトの実装が必要

#### 制約事項

- VSCode Copilot の hooks は Agent Customizations editor（プレビュー）から管理
- `chat.useCustomizationsInParentRepositories` 設定を有効にしないとモノレポでの親ディレクトリ検出が機能しない
- Agent Plugins はプレビュー段階

---

### 2.2 プラグイン配布設定

#### 実現可能性: **可能（プレビュー段階）**

#### Agent Plugins（VSCode）

VSCode Copilot は Agent Plugins をサポート（プレビュー）:
- プラグインマーケットプレイスからインストール可能
- 1つのプラグインで以下をバンドル可能:
  - スラッシュコマンド
  - スキル
  - カスタムエージェント
  - hooks
  - MCP サーバー

#### GitHub Copilot CLI のプラグインシステム

**プラグインの構造:**
```
my-plugin/
├── plugin.json            # マニフェスト（.plugin/ 内も可）
├── agents/                # エージェント定義
│   └── *.agent.md
├── skills/                # スキル定義
│   └── my-skill/
│       └── SKILL.md
├── hooks.json             # hooks 設定
└── .mcp.json              # MCP サーバー設定
```

**plugin.json の例:**
```json
{
  "name": "my-dev-tools",
  "description": "React development utilities",
  "version": "1.2.0",
  "author": { "name": "Jane Doe" },
  "license": "MIT",
  "agents": "agents/",
  "skills": ["skills/", "extra-skills/"],
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

**マニフェストの検索順序:**
1. `.plugin/plugin.json`
2. `plugin.json`（ルート）
3. `.github/plugin/plugin.json`
4. `.claude-plugin/plugin.json`

**マーケットプレイスの検索順序:**
1. `marketplace.json`（ルート）
2. `.plugin/marketplace.json`
3. `.github/plugin/marketplace.json`
4. `.claude-plugin/marketplace.json`

#### .cursor-plugin/ 形式の互換性

- **Copilot CLI は `.claude-plugin/` を認識する**（公式ドキュメントに明記）
- `.cursor-plugin/` は Copilot CLI では直接認識されない（未確認）
- ただし、superpowers は `.cursor-plugin/plugin.json` と `.claude-plugin/plugin.json` を別々に配置しており、プラットフォームごとに異なるマニフェストを使用している

#### インストール方法（Copilot CLI）

```bash
# マーケットプレイスの追加
copilot plugin marketplace add owner/repo

# プラグインのインストール
copilot plugin install plugin-name@marketplace-name

# ローカルプラグインのインストール
copilot plugin install ./my-plugin
```

**インストール先:**
- マーケットプレイス経由: `~/.copilot/installed-plugins/MARKETPLACE/PLUGIN-NAME/`
- 直接インストール: `~/.copilot/installed-plugins/_direct/SOURCE-ID/`

#### コスト: **無料**（GitHub Copilot のサブスクリプションは別途必要）

---

## 比較表: プラットフォーム間の対応関係

| 機能 | Codex CLI | VSCode Copilot / Copilot CLI |
|------|-----------|------------------------------|
| セッション開始 hook | `SessionStart`（additionalContext で注入） | `sessionStart`（出力は公式には Ignored だが SDK 標準形式あり） |
| カスタムインストラクション | `~/.codex/AGENTS.md` + プロジェクト `AGENTS.md` | `.github/copilot-instructions.md` + `AGENTS.md` |
| スキル配置 | `~/.agents/skills/` / `$REPO/.agents/skills/` | `~/.copilot/skills/` / `~/.agents/skills/` / `$REPO/.github/skills/` |
| プラグインマニフェスト | `.codex-plugin/plugin.json` | `.plugin/plugin.json` / `.github/plugin/plugin.json` / `.claude-plugin/plugin.json` |
| マーケットプレイス | `.agents/plugins/marketplace.json` | `.github/plugin/marketplace.json` / `.claude-plugin/marketplace.json` |
| hooks 設定ファイル | `hooks.json` / `config.toml` 内 `[[hooks.*]]` | `hooks.json` / `hooks/hooks.json` |
| エージェント定義 | AGENTS.md（階層的） | `.github/agents/*.agent.md` |

---

## 代替手段

### AGENTS.md による簡易注入（両プラットフォーム共通）

最もシンプルな方法として、`AGENTS.md` にスキルの要約や参照指示を記載する方法がある:
- Codex CLI: `~/.codex/AGENTS.md` または `$REPO/AGENTS.md`
- VSCode Copilot: `$REPO/AGENTS.md`（認識される）
- メリット: 設定不要、ファイル配置のみ
- デメリット: サイズ制限あり（32KiB）、プログレッシブディスクロージャーなし

### シンボリックリンクによるスキル共有

`~/.agents/skills/` は Codex CLI と Copilot CLI の両方で認識されるため、シンボリックリンクで共有可能。

---

## リスク

### 技術的リスク

- **VSCode Copilot の Agent Plugins はプレビュー段階**: API が変更される可能性がある
- **sessionStart hook の出力処理**: Copilot CLI では公式に "Ignored" とされているが、superpowers は出力しており、バージョンによって動作が異なる可能性がある
- **プラットフォーム間の差異**: マニフェスト形式・配置場所が微妙に異なり、完全な統一は困難

### ライセンスリスク

- Codex CLI: Apache-2.0（問題なし）
- GitHub Copilot: プロプライエタリ（プラグイン配布自体は自由）

### 将来の継続性リスク

- **Codex CLI**: OpenAI が積極的に開発中。プラグインシステムは比較的新しく、公式プラグインディレクトリの公開は "coming soon"
- **VSCode Copilot**: GitHub/Microsoft が積極的に開発中。Agent Plugins はプレビューだが、カスタムインストラクションとスキルシステムは安定
- **共通パス `~/.agents/skills/`**: Codex CLI と Copilot CLI の両方で認識されるため、この共通パスを使う戦略は比較的安全

---

## aide-powers への適用方針（推奨）

### Codex CLI 向け

1. **スキル配布**: `.codex-plugin/plugin.json` を作成し、`skills/` を指定
2. **セッション開始注入**: `hooks/hooks.json` で `SessionStart` hook を定義し、コアスキルを `additionalContext` として注入
3. **AGENTS.md**: プロジェクトルートに配置し、スキルシステムの使い方を記載
4. **インストール手順**: `.codex/INSTALL.md` に記載（superpowers と同様のパターン）

### VSCode Copilot / Copilot CLI 向け

1. **スキル配布**: `.github/plugin/plugin.json` または `.claude-plugin/plugin.json` を作成
2. **カスタムインストラクション**: `.github/copilot-instructions.md` にプロジェクト規約を記載
3. **エージェント定義**: `.github/agents/` に `*.agent.md` ファイルを配置
4. **hooks**: `hooks/hooks.json` で sessionStart hook を定義

### マルチプラットフォーム対応（superpowers パターン）

```
aide-powers/
├── .codex-plugin/
│   └── plugin.json          # Codex CLI 用マニフェスト
├── .codex/
│   └── INSTALL.md           # Codex CLI インストール手順
├── .claude-plugin/
│   ├── plugin.json          # Claude Code / Copilot CLI 用マニフェスト
│   └── marketplace.json     # マーケットプレイス定義
├── .cursor-plugin/
│   └── plugin.json          # Cursor 用マニフェスト
├── .github/
│   ├── copilot-instructions.md
│   └── agents/
│       └── *.agent.md
├── hooks/
│   ├── hooks.json           # Claude Code / Codex 用
│   ├── hooks-cursor.json    # Cursor 用
│   └── session-start        # セッション開始スクリプト
├── skills/
│   └── */SKILL.md           # スキル定義
├── agents/
│   └── *.agent.md           # エージェント定義
├── AGENTS.md                # Codex / Copilot 共通
└── CLAUDE.md                # Claude Code 用
```

---

## 情報源

| ソース | URL | 確認日 |
|--------|-----|--------|
| Codex CLI 公式ドキュメント - Advanced Configuration | https://developers.openai.com/codex/config-advanced | 2025-07-14 |
| Codex CLI 公式ドキュメント - Hooks | https://developers.openai.com/codex/hooks | 2025-07-14 |
| Codex CLI 公式ドキュメント - Skills | https://developers.openai.com/codex/skills | 2025-07-14 |
| Codex CLI 公式ドキュメント - AGENTS.md | https://developers.openai.com/codex/guides/agents-md | 2025-07-14 |
| Codex CLI 公式ドキュメント - Plugins | https://developers.openai.com/codex/plugins | 2025-07-14 |
| Codex CLI 公式ドキュメント - Build Plugins | https://developers.openai.com/codex/plugins/build | 2025-07-14 |
| GitHub Copilot CLI - Plugin Reference | https://docs.github.com/en/copilot/reference/cli-plugin-reference | 2025-07-14 |
| GitHub Copilot - Hooks Configuration | https://docs.github.com/en/copilot/reference/hooks-configuration | 2025-07-14 |
| GitHub Copilot - Custom Agents Configuration | https://docs.github.com/en/copilot/reference/custom-agents-configuration | 2025-07-14 |
| GitHub Copilot - Repository Custom Instructions | https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot | 2025-07-14 |
| VSCode Copilot - Customization | https://code.visualstudio.com/docs/copilot/copilot-customization | 2025-07-14 |
| VSCode Copilot - AI Extensibility | https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview | 2025-07-14 |
| superpowers リポジトリ（ローカル参照） | references/superpowers/ | 2025-07-14 |
| superpowers README.md | https://github.com/obra/superpowers | 2025-07-14 |
| Codex CLI GitHub リポジトリ | https://github.com/openai/codex | 2025-07-14 |
