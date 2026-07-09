# Gemini CLI: Hooks によるスキル注入 & Extensions による配布

## 要約

Gemini CLI は **Agent Skills** システムと **Extensions** システムの2つの仕組みでスキル配布・注入を実現できる。`.gemini/skills/` に `SKILL.md` を配置すれば自動発見され、`activate_skill` ツールでオンデマンド注入される。セッション開始時の自動注入は `SessionStart` フック（hooks.json）で実現可能。Extensions として GitHub リポジトリから `gemini extensions install` でインストールでき、`gemini-extension.json` がマニフェストとなる。superpowers は実際にこの仕組みで配布されており、`gemini extensions link` によるローカル開発（symlink方式）も公式サポートされている。

---

## 調査概要

- **調査対象**: Gemini CLI での (1) セッション開始時スキル自動注入、(2) Extensions による配布
- **調査日**: 2025年7月（公式ドキュメント最終更新: 2026年4月17日表記あり — Gemini CLI は活発に更新中）
- **調査の背景**: aide-powers を Gemini CLI 向けに配布する方法の技術的裏付け

---

## 調査対象1: セッション開始時にスキル（SKILL.md）を自動注入する仕組み

### 1.1 Agent Skills の自動発見メカニズム

Gemini CLI は **Agent Skills** を以下の優先順位（低→高）で自動発見する:

| 優先度 | ティア | パス |
|---|---|---|
| 1（最低） | Built-in skills | Gemini CLI 同梱 |
| 2 | Extension skills | インストール済み Extensions の `skills/` |
| 3 | User skills | `~/.gemini/skills/` または `~/.agents/skills/` |
| 4（最高） | Workspace skills | `.gemini/skills/` または `.agents/skills/` |

**重要**: `.gemini/skills/<skill-name>/SKILL.md` を配置するだけで自動発見される。ただし:
- SKILL.md の frontmatter に `name:` と `description:` が必須
- frontmatter はファイルの先頭に `---` で囲んで記述
- ディレクトリは1階層まで（`.gemini/skills/<name>/SKILL.md`）

### 1.2 Skills のライフサイクル

1. **Discovery**: セッション開始時にスキルの `name` と `description` がシステムプロンプトに注入される
2. **Activation**: モデルがタスクに合致するスキルを判断し `activate_skill` ツールを呼ぶ
3. **Consent**: ユーザーに確認プロンプトが表示される
4. **Injection**: 承認後、SKILL.md の本文とフォルダ構造が会話履歴に追加される
5. **Execution**: スキルの専門知識がアクティブな状態で処理が進む

**つまり**: スキルのメタデータ（name + description）は常にセッション開始時に注入されるが、本文の注入はオンデマンド（activate_skill 呼び出し時）。

### 1.3 SessionStart フックによる強制注入

セッション開始時にスキル本文を強制的に注入するには、`SessionStart` フックを使用する。

#### hooks.json のフォーマット（`.gemini/settings.json` 内）

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "name": "inject-skill",
            "type": "command",
            "command": "node .gemini/hooks/inject-skill.js",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

#### フックスクリプトの出力フォーマット

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "ここにスキル本文を注入"
  }
}
```

- `additionalContext` の内容は:
  - **インタラクティブモード**: 会話履歴の最初のターンとして注入
  - **非インタラクティブモード**: ユーザーのプロンプトに前置

#### superpowers の実装例

superpowers は以下の方式で SessionStart フックを実装:

1. `hooks/hooks.json` でフック定義
2. `hooks/session-start` (bash スクリプト) で `skills/using-superpowers/SKILL.md` を読み込み
3. JSON エスケープして `hookSpecificOutput.additionalContext` として出力
4. プラットフォーム判定（Claude Code / Cursor / Copilot CLI）で出力形式を切り替え

**Gemini CLI 向けの出力形式**:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<スキル本文>"
  }
}
```

### 1.4 GEMINI.md による代替

`GEMINI.md` はプロジェクトコンテキストとして**毎回のプロンプトに自動付与**される。

```markdown
# GEMINI.md の例（@import 構文でモジュール化可能）
@./skills/using-superpowers/SKILL.md
@./skills/using-superpowers/references/gemini-tools.md
```

- **メリット**: フックスクリプト不要、シンプル
- **デメリット**: 毎ターンのコンテキストに含まれるためトークン消費が大きい
- **用途**: 短い指示やツールマッピング情報の注入に適する

#### settings.json でコンテキストファイル名をカスタマイズ可能

```json
{
  "context": {
    "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
  }
}
```

### 1.5 `.gemini/skills/` に配置するだけで自動認識されるか

**はい、自動認識される。** ただし以下の条件を満たす必要がある:

1. `SKILL.md` ファイルが存在する（大文字小文字厳密）
2. frontmatter に `name:` と `description:` が両方ある
3. ワークスペースが trusted フォルダとしてマークされている（workspace skills の場合）
4. ディレクトリ深度は1まで（`.gemini/skills/SKILL.md` または `.gemini/skills/<name>/SKILL.md`）

---

## 調査対象2: プラグイン配布設定（Extensions）

### 2.1 gemini-extension.json のフォーマット

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "Extension の説明",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}/my-server.js"],
      "cwd": "${extensionPath}"
    }
  },
  "excludeTools": ["run_shell_command(rm -rf)"],
  "settings": [
    {
      "name": "API Key",
      "envVar": "MY_API_KEY",
      "sensitive": true
    }
  ],
  "plan": {
    "directory": ".gemini/plans"
  }
}
```

#### 主要フィールド

| フィールド | 必須 | 説明 |
|---|---|---|
| `name` | ○ | Extension 名（小文字・ハイフン区切り） |
| `version` | ○ | セマンティックバージョニング |
| `description` | ○ | 説明文 |
| `contextFileName` | × | コンテキストファイル名（デフォルト: GEMINI.md） |
| `mcpServers` | × | MCP サーバー定義 |
| `excludeTools` | × | 除外ツール一覧 |
| `settings` | × | ユーザー設定（API キー等） |

#### Extension が提供できるもの

- **Context file** (GEMINI.md): プロジェクトコンテキスト
- **Hooks** (`hooks/hooks.json`): ライフサイクルフック
- **Skills** (`skills/`): Agent Skills
- **Commands** (`commands/`): カスタムスラッシュコマンド
- **Agents** (`agents/`): サブエージェント定義
- **MCP Servers**: ツール提供
- **Themes**: UI テーマ
- **Policies** (`policies/`): ポリシールール

### 2.2 superpowers の配布方式

superpowers の `gemini-extension.json`:

```json
{
  "name": "superpowers",
  "description": "Core skills library: TDD, debugging, collaboration patterns, and proven techniques",
  "version": "5.0.7",
  "contextFileName": "GEMINI.md"
}
```

superpowers のディレクトリ構成:
```
superpowers/
├── gemini-extension.json    # マニフェスト
├── GEMINI.md                # コンテキスト（@import でスキル参照）
├── hooks/
│   ├── hooks.json           # SessionStart フック定義
│   ├── session-start        # bash スクリプト
│   └── run-hook.cmd         # Windows 互換ラッパー
├── skills/                  # Agent Skills
│   ├── using-superpowers/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── test-driven-development/
│   ├── systematic-debugging/
│   └── ...
├── agents/                  # サブエージェント定義
├── commands/                # カスタムコマンド
└── ...
```

### 2.3 インストール方法

```bash
# GitHub リポジトリからインストール
gemini extensions install https://github.com/obra/superpowers

# 特定ブランチ/タグを指定
gemini extensions install https://github.com/obra/superpowers --ref v5.0.7

# 自動更新を有効化
gemini extensions install https://github.com/obra/superpowers --auto-update
```

### 2.4 git clone + symlink 方式（`gemini extensions link`）

**公式サポートされている。**

```bash
# ローカルディレクトリをリンク
cd my-extension
gemini extensions link .

# または任意のパスを指定
gemini extensions link /path/to/my-extension
```

- `~/.gemini/extensions/` にシンボリックリンクが作成される
- コード変更後はセッション再起動で反映（再インストール不要）
- 開発中のイテレーションに最適

#### インタラクティブセッション内でのリンク

```
/skills link <path> [--scope user|workspace]
```

### 2.5 Extension の格納場所

Extensions は `~/.gemini/extensions/` に格納される。各 Extension は独立したディレクトリとして管理される。

### 2.6 変数置換

`gemini-extension.json` と `hooks/hooks.json` で以下の変数が使用可能:

| 変数 | 説明 |
|---|---|
| `${extensionPath}` | Extension ディレクトリの絶対パス |
| `${workspacePath}` | 現在のワークスペースの絶対パス |
| `${/}` | プラットフォーム固有のパス区切り文字 |

---

## 代替手段の比較

| 方式 | スキル注入タイミング | トークン効率 | 配布容易性 | 制御粒度 |
|---|---|---|---|---|
| Agent Skills（自動発見） | オンデマンド（activate_skill） | ◎（必要時のみ） | ○ | スキル単位 |
| SessionStart フック | セッション開始時 | △（毎セッション） | ○ | 自由 |
| GEMINI.md | 毎ターン | ×（毎回消費） | ◎（最も簡単） | ファイル単位 |
| Extension（統合） | 上記全てを組み合わせ可能 | ◎ | ◎ | 最も柔軟 |

---

## リスク

### 技術的リスク
- Gemini CLI は活発に開発中であり、API やフック仕様が変更される可能性がある
- `SessionStart` フックの `additionalContext` 出力形式はプラットフォーム間で異なる（Claude Code / Cursor / Gemini CLI で分岐が必要）
- Workspace skills は trusted フォルダでないと読み込まれない

### ライセンスリスク
- Gemini CLI 自体は Apache 2.0 ライセンス
- Extensions ギャラリーに公開する場合、ライセンス明記が必要

### 将来の継続性リスク
- Gemini CLI は Google 公式プロジェクトであり、継続性は高い
- Extensions ギャラリーが公式に運営されており、エコシステムは活発（500+ Extensions が登録済み）
- Agent Skills 仕様は「Agent Skills open standard」として標準化が進んでいる

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Gemini CLI 公式ドキュメント（トップ） | https://geminicli.com/docs | 2025-07 |
| Hooks ドキュメント | https://geminicli.com/docs/hooks | 2025-07 |
| Hooks Reference | https://geminicli.com/docs/hooks/reference | 2025-07 |
| Writing Hooks | https://geminicli.com/docs/hooks/writing-hooks | 2025-07 |
| Agent Skills | https://geminicli.com/docs/cli/skills | 2025-07 |
| Skills Getting Started | https://geminicli.com/docs/cli/tutorials/skills-getting-started | 2025-07 |
| GEMINI.md (Project Context) | https://geminicli.com/docs/cli/gemini-md | 2025-07 |
| Extensions トップ | https://geminicli.com/docs/extensions | 2025-07 |
| Extension Reference | https://geminicli.com/docs/extensions/reference | 2025-07 |
| Extension Best Practices | https://geminicli.com/docs/extensions/best-practices | 2025-07 |
| Extensions Gallery | https://geminicli.com/extensions | 2025-07 |
| Settings Reference | https://geminicli.com/docs/cli/settings | 2025-07 |
| GitHub リポジトリ | https://github.com/google-gemini/gemini-cli | 2025-07 |
| superpowers gemini-extension.json | ローカル: references/superpowers/gemini-extension.json | 2025-07 |
| superpowers GEMINI.md | ローカル: references/superpowers/GEMINI.md | 2025-07 |
| superpowers hooks/ | ローカル: references/superpowers/hooks/ | 2025-07 |
| superpowers skills/ | ローカル: references/superpowers/skills/ | 2025-07 |

---

## aide-powers への適用方針（参考）

aide-powers を Gemini CLI 向けに配布する場合、以下の構成が推奨される:

```
aide-powers/
├── gemini-extension.json       # マニフェスト
├── GEMINI.md                   # @import でスキル参照
├── hooks/
│   ├── hooks.json              # SessionStart フック
│   └── session-start           # スキル注入スクリプト
├── skills/
│   ├── <skill-name>/
│   │   ├── SKILL.md            # frontmatter + 本文
│   │   └── references/         # 参照資料
│   └── ...
├── agents/                     # サブエージェント定義（.md）
└── commands/                   # カスタムコマンド（.toml）
```

インストール:
```bash
gemini extensions install https://github.com/<org>/aide-powers
```

ローカル開発:
```bash
gemini extensions link /path/to/aide-powers
```
