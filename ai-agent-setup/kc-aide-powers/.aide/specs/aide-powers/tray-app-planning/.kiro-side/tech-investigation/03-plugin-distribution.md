# 調査3: Claude Code プラグインの社内配布方法

## 要約

Claude Code のプラグインシステムは、スキル・サブエージェント・フック・MCPサーバーをバンドルして配布する仕組みを提供しており、AIDEの全構成要素（ステアリング、エージェント定義、スキル）を1つのプラグインとしてパッケージ化・配布できる。プライベートGitリポジトリからの配布は `/plugin install` で直接可能であり、プライベートマーケットプレイスの構築も可能。Codex CLI 向けには git clone + symlink 方式が標準的。AIDEの配布には「プラグイン方式」が最も適している。

---

## 調査概要

- **調査対象**: Claude Code プラグインの配布方法（プライベートリポジトリ対応、マーケットプレイス、symlink方式）
- **調査日**: 2025-07-06
- **調査の背景**: AIDEの構成ファイル群（ステアリング58ファイル + エージェント定義43ファイル）を社内チームに配布する方法を検討する

---

## 調査結果

### 実現可能性: **可能**

複数の配布方法が利用可能であり、社内配布に適した方法を選択できる。

### 1. Claude Code プラグインの基本構造

#### ディレクトリレイアウト

```
aide-plugin/
├── .claude-plugin/
│   └── plugin.json          # プラグインメタデータ（必須）
├── commands/                # カスタムスラッシュコマンド
│   ├── planning.md
│   └── design.md
├── agents/                  # サブエージェント定義
│   ├── bugfix-analyzer.md
│   ├── bugfix-designer.md
│   └── ... (43ファイル)
├── skills/                  # スキル
│   ├── planning-orchestrator/
│   │   └── SKILL.md
│   ├── design-orchestrator/
│   │   └── SKILL.md
│   └── ... (7つのオーケストレーター)
├── hooks/
│   └── hooks.json          # ライフサイクルフック（任意）
└── README.md
```

#### plugin.json の形式

```json
{
  "name": "aide",
  "description": "AI-Driven Engineering - 設計から実装までを高精度に遂行するマルチエージェントフレームワーク",
  "version": "1.0.0",
  "author": {
    "name": "Your Team",
    "email": "[email]"
  },
  "repository": "https://your-git-server.com/team/aide-plugin",
  "license": "Proprietary",
  "keywords": ["aide", "multi-agent", "design", "orchestrator"]
}
```

#### プラグインが含められるコンポーネント

| コンポーネント | ディレクトリ/ファイル | AIDEでの対応 |
|---|---|---|
| スキル | `skills/` | オーケストレーターのフェーズ管理 |
| サブエージェント | `agents/` | 43のサブエージェント定義 |
| コマンド | `commands/` | スラッシュコマンド（/planning, /design 等） |
| フック | `hooks/hooks.json` | ライフサイクルフック |
| MCPサーバー | `.mcp.json` | 外部ツール連携 |

### 2. プライベートリポジトリからの配布方法

#### 方法A: `/plugin install` で直接インストール（推奨）

```bash
# Git リポジトリURLを直接指定
claude /plugin install https://your-git-server.com/team/aide-plugin.git

# ブランチ/タグを指定してインストール
claude /plugin install https://your-git-server.com/team/aide-plugin#main
claude /plugin install https://your-git-server.com/team/aide-plugin#v1.0.0

# GitHub プライベートリポジトリ
claude /plugin install https://github.com/your-org/aide-plugin
```

**認証方法:**
- 手動インストール・更新: 既存のgit認証情報ヘルパーを使用。`git clone` が動作するなら Claude Code でも動作する
- 一般的な認証ヘルパー: `gh auth login`（GitHub）、macOS Keychain、`git-credential-store`
- バックグラウンド自動更新: 環境変数でトークンを設定する必要がある

| プロバイダー | 環境変数 | 備考 |
|---|---|---|
| GitHub | `GITHUB_TOKEN` or `GH_TOKEN` | Personal access token or GitHub App token |
| GitLab | `GITLAB_TOKEN` or `GL_TOKEN` | Personal access token or project token |
| Bitbucket | `BITBUCKET_TOKEN` | App password or repository access token |

#### 方法B: プライベートマーケットプレイスの構築

マーケットプレイスリポジトリを作成し、`.claude-plugin/marketplace.json` を配置:

```json
{
  "name": "company-tools",
  "owner": {
    "name": "DevTools Team",
    "email": "[email]"
  },
  "plugins": [
    {
      "name": "aide",
      "source": {
        "source": "url",
        "url": "https://your-git-server.com/team/aide-plugin.git"
      },
      "description": "AI-Driven Engineering マルチエージェントフレームワーク",
      "version": "1.0.0"
    }
  ]
}
```

チームメンバーの利用手順:
```bash
# マーケットプレイスを追加
claude /plugin marketplace add https://your-git-server.com/team/marketplace.git

# プラグインをインストール
claude /plugin install aide@company-tools
```

#### 方法C: プロジェクト設定による自動プロンプト

`.claude/settings.json` にプラグインを宣言すると、チームメンバーがプロジェクトを開いた際に自動的にインストールを促される:

```json
{
  "plugins": [
    {
      "source": "https://your-git-server.com/team/aide-plugin",
      "enabled": true
    }
  ]
}
```

#### 方法D: ベンダリング（リポジトリ内に直接配置）

プラグインをプロジェクトリポジトリ内に直接配置:

```
.claude/
├── settings.json
└── plugins/
    └── aide/
        ├── .claude-plugin/
        │   └── plugin.json
        ├── agents/
        ├── skills/
        └── commands/
```

`.claude/plugins/` 内のプラグインは全チームメンバーに自動的に読み込まれる。

#### 方法E: ローカルパスからのインストール

```bash
# ローカルディレクトリからインストール
claude /plugin install /path/to/aide-plugin
```

### 3. Codex CLI 向けの配布方法

Codex CLI にはプラグインシステムがないため、git clone + symlink 方式を使用する（superpowers と同じ方式）。

#### インストール手順

```bash
# 1. リポジトリをクローン
git clone https://your-git-server.com/team/aide-plugin.git ~/.codex/aide

# 2. スキルのシンボリックリンクを作成
mkdir -p ~/.agents/skills
ln -s ~/.codex/aide/skills ~/.agents/skills/aide

# 3. multi_agent を有効化（config.toml）
# [features]
# multi_agent = true

# 4. Codex を再起動
```

#### Windows の場合

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\aide" "$env:USERPROFILE\.codex\aide\skills"
```

#### 更新

```bash
cd ~/.codex/aide && git pull
# シンボリックリンク経由で即座に反映
```

### 4. CLAUDE.md にプラグインのパスを指定する方法

CLAUDE.md 自体にプラグインパスを直接指定する機能はない。ただし、以下の代替方法がある:

1. **`@` インポート構文**: CLAUDE.md からプラグイン内のファイルを参照可能
   ```markdown
   @.claude/plugins/aide/docs/orchestrator-guide.md
   ```

2. **`--plugin-dir` フラグ**: CLI起動時にプラグインディレクトリを指定
   ```bash
   claude --plugin-dir /path/to/aide-plugin
   ```

3. **`CLAUDE_CODE_PLUGIN_SEED_DIR` 環境変数**: シードディレクトリを指定してプラグインを自動読み込み
   ```bash
   export CLAUDE_CODE_PLUGIN_SEED_DIR="/opt/company-plugins"
   ```

4. **`.claude/settings.json` の `extraKnownMarketplaces`**: プロジェクト設定でマーケットプレイスを自動登録
   ```json
   {
     "extraKnownMarketplaces": {
       "company-tools": {
         "source": {
           "source": "url",
           "url": "https://your-git-server.com/team/marketplace.git"
         }
       }
     }
   }
   ```

### 5. プラグインの Strict モード

| 値 | 動作 |
|---|---|
| `true`（デフォルト） | plugin.json がコンポーネント定義の権限を持つ。マーケットプレイスエントリは追加コンポーネントを補足可能 |
| `false` | マーケットプレイスエントリが全体の定義。プラグイン自体の plugin.json は不要 |

### 6. プラグインの鮮度管理

- ref（ブランチ、タグ、コミット）を指定してインストールしたプラグインは、読み込みのたびに再クローンされる
- これにより常に最新バージョンが使用される
- 安定したオフライン対応が必要な場合は、ref を省略するかローカルパスを使用する

---

## AIDEの配布方式の推奨

### 推奨: プラグイン方式（方法A + 方法C の組み合わせ）

| 観点 | 推奨方法 |
|---|---|
| 初回配布 | `/plugin install` でプライベートGitリポジトリから直接インストール |
| チーム展開 | `.claude/settings.json` にプラグインソースを宣言し、自動プロンプト |
| 更新 | ref 指定で自動更新、または手動で `/plugin marketplace update` |
| Codex CLI | git clone + symlink 方式（superpowers と同じ） |

### プラグイン構成案

```
aide-for-claude-code/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json    # 自己マーケットプレイス（任意）
├── agents/                  # 43のサブエージェント定義
│   ├── bugfix-analyzer.md
│   ├── bugfix-designer.md
│   ├── ...
│   └── user-requirements-architect.md
├── skills/                  # 7つのオーケストレーター + 共通スキル
│   ├── planning-orchestrator/
│   │   └── SKILL.md
│   ├── design-orchestrator/
│   │   └── SKILL.md
│   ├── impl-orchestrator/
│   │   └── SKILL.md
│   ├── change-orchestrator/
│   │   └── SKILL.md
│   ├── bugfix-orchestrator/
│   │   └── SKILL.md
│   ├── refactoring-orchestrator/
│   │   └── SKILL.md
│   ├── reverse-design-orchestrator/
│   │   └── SKILL.md
│   └── aide-core/
│       └── SKILL.md         # global-rules + orchestrator-index 相当
├── commands/                # スラッシュコマンド
│   ├── aide-planning.md
│   ├── aide-design.md
│   └── aide-status.md
├── CLAUDE.md                # プラグインレベルのCLAUDE.md
├── .codex/
│   └── INSTALL.md           # Codex CLI 向けインストール手順
└── README.md
```

---

## コスト

- Claude Code プラグインシステム自体は**無料**
- プライベートGitリポジトリのホスティングコストのみ（既存のGit基盤を使用する場合は追加コストなし）
- マーケットプレイスの構築・運用も追加コストなし

---

## 制約事項・制限事項

1. **プラグインキャッシュ**: プラグインはインストール時に `~/.claude/plugins/cache` にコピーされる。プラグインディレクトリ外のファイルへの参照（`../shared-utils` 等）は動作しない
2. **`${CLAUDE_PLUGIN_ROOT}`**: フック・MCPサーバー設定でプラグイン内のファイルを参照する場合はこの変数を使用する必要がある
3. **Codex CLI にはプラグインシステムがない**: git clone + symlink 方式で対応する必要がある。将来的に `RawPluginManifest` に `agents` フィールドが追加される可能性がある
4. **オフライン環境**: ref 指定のプラグインはロードのたびにネットワークアクセスが必要。オフライン環境では `CLAUDE_CODE_PLUGIN_SEED_DIR` を使用する

---

## リスク

### 技術的リスク

- プラグインシステムは比較的新しい機能であり、APIが変更される可能性がある
- 大量のファイル（43エージェント + 7スキル + コマンド）を含むプラグインのパフォーマンスは未検証
- プライベートリポジトリの認証設定がチームメンバーごとに必要

### ライセンスリスク

- AIDEは京セラ株式会社社内限定ライセンス。プラグインとして配布する場合もライセンス制約を維持する必要がある
- プライベートリポジトリでの配布であれば問題ないが、誤って公開リポジトリに配置しないよう注意が必要

### 将来の継続性リスク

- Claude Code のプラグインシステムは活発に開発されており、機能追加が続いている
- Codex CLI のスキル発見機能も安定的に提供されている
- 両プラットフォームの互換性は Agent Skills 標準（agentskills.io）で推進されている

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Claude Code 公式: Plugin Marketplaces | https://code.claude.com/docs/en/plugin-marketplaces | 2025-07-06 |
| dotclaude.com: Plugins | https://dotclaude.com/plugins | 2025-07-06 |
| linuxbeast.com: How to Build and Deploy a Custom Claude Code Plugin | https://linuxbeast.com/blog/how-to-build-and-deploy-a-custom-claude-code-plugin/ | 2025-07-06 |
| dominic-boettger.com: Building a Private Claude Code Plugin Marketplace | https://dominic-boettger.com/blog/claude-code-private-plugin-marketplace-guide/ | 2025-07-06 |
| superpowers: .codex/INSTALL.md | ローカルファイル参照 | 2025-07-06 |
| superpowers: .claude-plugin/plugin.json | ローカルファイル参照 | 2025-07-06 |
| superpowers: docs/README.codex.md | ローカルファイル参照 | 2025-07-06 |

Content was rephrased for compliance with licensing restrictions.
