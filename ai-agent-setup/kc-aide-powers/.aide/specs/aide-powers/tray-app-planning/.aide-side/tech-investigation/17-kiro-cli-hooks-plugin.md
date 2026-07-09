# Kiro CLI: Hooks・スキル注入・プラグイン配布の実現方法

## 要約

Kiro CLI では、**AgentSpawn フック**を使ってセッション開始時にコマンドを実行し、その出力をエージェントのコンテキストに注入できる。ただし、SKILL.md の「内容」を直接注入する仕組みではなく、**resources フィールドの `skill://` URI** で SKILL.md を登録するのが正式な方法である。steering ファイル（`.kiro/steering/*.md`）はデフォルトエージェントでは自動読み込みされるが、カスタムエージェントでは明示的に resources に追加する必要がある。プラグイン配布は `.kiro/` ディレクトリにファイルを配置する方式（git clone + 手動配置）で実現可能であり、公式のパッケージマネージャーは現時点で存在しない。

---

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査対象 | Kiro CLI の Hooks 機能、Skills 機能、Custom Agents 設定、プラグイン配布方法 |
| 調査日 | 2025-07-15 |
| 調査の背景 | aide-powers フレームワークを Kiro CLI 上で動作させるための技術的裏付け |

---

## 調査対象1: セッション開始時にスキル（SKILL.md）を自動注入する仕組み

### 1.1 AgentSpawn フックによるコンテキスト注入

**実現可能性: 条件付き可能**

Kiro CLI の Hooks 機能には `agentSpawn` イベントがあり、エージェント起動時にコマンドを実行し、その **STDOUT をエージェントのコンテキストに追加** できる。

#### フォーマット（エージェント設定ファイル内）

```json
{
  "hooks": {
    "agentSpawn": [
      {
        "command": "cat .kiro/skills/my-skill/SKILL.md",
        "timeout_ms": 5000
      }
    ]
  }
}
```

#### Hook イベントの入力（STDIN で受け取る JSON）

```json
{
  "hook_event_name": "agentSpawn",
  "cwd": "/current/working/directory",
  "session_id": "abc123-def456-789"
}
```

#### 終了コードの挙動

| 終了コード | 挙動 |
|-----------|------|
| 0 | 成功。STDOUT がエージェントのコンテキストに追加される |
| その他 | 失敗。STDERR がユーザーに警告として表示される |

#### 制約事項

- デフォルトタイムアウト: 30秒（`timeout_ms` で変更可能）
- AgentSpawn フックはキャッシュされない（`cache_ttl_seconds` を設定しても無効）
- STDOUT の出力がそのままコンテキストに入るため、大きなファイルはコンテキストウィンドウを圧迫する

### 1.2 resources フィールドの `skill://` URI（推奨方法）

**実現可能性: 可能（公式推奨）**

カスタムエージェントの `resources` フィールドに `skill://` URI を指定することで、SKILL.md を自動認識させることができる。

```json
{
  "resources": [
    "skill://.kiro/skills/**/SKILL.md",
    "skill://~/.kiro/skills/**/SKILL.md"
  ]
}
```

#### Skills の動作原理

1. エージェント起動時に SKILL.md の **メタデータ（name, description）のみ** を読み込む
2. ユーザーのリクエストに応じて、関連するスキルの **全文を遅延読み込み** する
3. スラッシュコマンド（`/skill-name`）で直接呼び出しも可能

#### SKILL.md のフォーマット

```markdown
---
name: my-skill-name
description: このスキルの説明。Kiro がリクエストとマッチングする際に使用される。
---

## スキルの内容

ここに指示を記述...
```

#### フロントマターの必須フィールド

| フィールド | 必須 | 制約 |
|-----------|------|------|
| name | Yes | 小文字英数字とハイフンのみ。最大64文字 |
| description | Yes | 最大1024文字。活性化条件の判定に使用される |

#### Skills の配置場所

| パス | スコープ | 用途 |
|------|---------|------|
| `.kiro/skills/` | ワークスペース | プロジェクト固有のワークフロー |
| `~/.kiro/skills/` | グローバル | 全プロジェクト共通のワークフロー |

#### デフォルトエージェントでの自動認識

- **デフォルトエージェント**: `.kiro/skills/` と `~/.kiro/skills/` の両方から自動的にスキルを読み込む。設定不要。
- **カスタムエージェント**: `resources` フィールドに明示的に `skill://` URI を追加する必要がある。

### 1.3 steering ファイル（`.kiro/steering/*.md`）での代替

**実現可能性: 可能（ただし用途が異なる）**

#### steering の特徴

- `.kiro/steering/*.md` に Markdown ファイルを配置するだけで自動認識される
- **デフォルトエージェント**: 全ての steering ファイルが自動的にコンテキストに含まれる
- **カスタムエージェント**: `resources` に明示的に追加が必要

```json
{
  "resources": ["file://.kiro/steering/**/*.md"]
}
```

#### steering と skills の違い

| 観点 | steering | skills |
|------|----------|--------|
| 読み込みタイミング | セッション開始時に全文読み込み | メタデータのみ読み込み、必要時に全文読み込み |
| コンテキスト消費 | 常に全文がコンテキストを消費 | 遅延読み込みで効率的 |
| 活性化条件 | 常に有効 | description に基づくマッチング |
| スラッシュコマンド | なし | `/skill-name` で直接呼び出し可能 |
| 用途 | プロジェクト規約・標準の定義 | 特定ワークフローの手順書 |
| グローバルスコープ | `~/.kiro/steering/` | `~/.kiro/skills/` |

#### AGENTS.md の活用

- `AGENTS.md` ファイルはワークスペースルートまたは `~/.kiro/steering/` に配置すると **常に** 読み込まれる
- カスタムエージェントでも自動的に含まれる（steering とは異なる）

### 1.4 skills/ ディレクトリに SKILL.md を配置するだけで自動認識されるか

**回答: デフォルトエージェントでは Yes、カスタムエージェントでは No**

- デフォルトエージェント（`kiro_default`）: `.kiro/skills/*/SKILL.md` を自動的に検出・読み込みする
- カスタムエージェント: `resources` フィールドに `skill://` URI を明示的に指定する必要がある

---

## 調査対象2: プラグイン配布設定

### 2.1 Kiro CLI でスキルやエージェントを配布する方法

**実現可能性: 可能（ファイル配置方式）**

Kiro CLI には公式のパッケージマネージャーやマーケットプレイスは存在しない（2025年7月時点）。配布は以下の方法で行う:

#### 方法1: git リポジトリ + 手動配置

```bash
# グローバルスキルとして配布
git clone https://github.com/org/my-skills.git ~/.kiro/skills/my-skills

# ワークスペーススキルとして配布
git clone https://github.com/org/project-skills.git .kiro/skills/
```

#### 方法2: プロジェクトリポジトリに同梱

`.kiro/` ディレクトリをプロジェクトリポジトリに含めてバージョン管理する。

```
my-project/
├── .kiro/
│   ├── agents/
│   │   └── my-agent.json
│   ├── skills/
│   │   └── my-skill/
│   │       └── SKILL.md
│   └── steering/
│       └── conventions.md
└── src/
```

#### 方法3: グローバル配置（MDM / Group Policy）

チーム全体に配布する場合、`~/.kiro/steering/` や `~/.kiro/skills/` にファイルを配置する。公式ドキュメントでは MDM ソリューションや Group Policy での配布が言及されている。

### 2.2 `.kiro/` ディレクトリにファイルを配置するだけで認識されるか

**回答: 条件付き Yes**

| ファイル種別 | 配置場所 | デフォルトエージェントでの自動認識 | カスタムエージェントでの自動認識 |
|-------------|---------|-------------------------------|-------------------------------|
| steering ファイル | `.kiro/steering/*.md` | ✅ Yes | ❌ No（resources に追加が必要） |
| SKILL.md | `.kiro/skills/*/SKILL.md` | ✅ Yes | ❌ No（resources に追加が必要） |
| エージェント設定 | `.kiro/agents/*.json` | ✅ Yes（選択可能になる） | N/A |
| AGENTS.md | ワークスペースルート | ✅ Yes（常に含まれる） | ✅ Yes（常に含まれる） |

### 2.3 git clone + symlink 方式は使えるか

**実現可能性: 条件付き可能**

- **git clone**: 問題なく使用可能。`.kiro/skills/` や `~/.kiro/skills/` にクローンすればよい
- **symlink**: 公式ドキュメントに明示的な言及はないが、ファイルシステムレベルで解決されるため動作する可能性が高い。ただし、Windows 環境では symlink の権限問題に注意が必要
- **git submodule**: プロジェクトの `.kiro/` 配下に submodule として追加する方法も有効

#### 推奨パターン

```bash
# グローバルスキルの配布
git clone https://github.com/org/aide-powers-skills.git ~/.kiro/skills/aide-powers

# ワークスペースへの配布（submodule）
git submodule add https://github.com/org/aide-powers.git .kiro/aide-powers
```

### 2.4 Kiro CLI の Custom Agents 設定方法

#### エージェント設定ファイルの配置場所

| パス | スコープ | 優先度 |
|------|---------|--------|
| `.kiro/agents/*.json` | ローカル（ワークスペース固有） | 高（優先） |
| `~/.kiro/agents/*.json` | グローバル（全ワークスペース共通） | 低 |

同名のエージェントが両方に存在する場合、ローカルが優先される（警告メッセージ付き）。

#### エージェント設定ファイルの完全な構造

```json
{
  "name": "aide-powers-agent",
  "description": "aide-powers フレームワークのオーケストレーター",
  "prompt": "file://./prompts/orchestrator.md",
  "tools": ["*"],
  "allowedTools": ["read", "write", "shell"],
  "resources": [
    "file://.kiro/steering/**/*.md",
    "skill://.kiro/skills/**/SKILL.md"
  ],
  "hooks": {
    "agentSpawn": [
      {
        "command": "cat .kiro/steering/orchestrator-index.md"
      }
    ]
  },
  "model": "claude-sonnet-4",
  "keyboardShortcut": "ctrl+a",
  "welcomeMessage": "aide-powers オーケストレーターです。何をお手伝いしましょうか？"
}
```

#### エージェントの切り替え方法

1. `/agent swap` コマンドで一覧から選択
2. `kiro-cli --agent my-agent` で起動時に指定
3. `keyboardShortcut` で設定したキーボードショートカットで切り替え

#### エージェントの作成方法

1. `/agent create` スラッシュコマンド（AI アシスト付き）
2. `/agent create --manual` で手動作成
3. `kiro-cli agent create agent-name` でターミナルから作成
4. JSON ファイルを直接 `.kiro/agents/` に配置

---

## aide-powers フレームワークへの適用方針

### 推奨構成

```
.kiro/
├── agents/
│   └── aide-powers.json          # カスタムエージェント設定
├── skills/
│   ├── design-orchestrator/
│   │   ├── SKILL.md              # 設計オーケストレーター
│   │   └── references/
│   │       └── design-process.md
│   ├── impl-orchestrator/
│   │   └── SKILL.md              # 実装オーケストレーター
│   └── ...
├── steering/
│   ├── orchestrator-index.md     # オーケストレーター選択ガイド
│   ├── global-rules.md           # グローバルルール
│   └── AGENTS.md                 # 常に読み込まれる基本ルール
└── specs/
    └── ...
```

### AgentSpawn フックの活用例

```json
{
  "hooks": {
    "agentSpawn": [
      {
        "command": "cat .kiro/steering/orchestrator-index.md",
        "timeout_ms": 5000
      }
    ]
  }
}
```

これにより、セッション開始時にオーケストレーターインデックスが自動的にコンテキストに注入される。

---

## リスク

### 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| コンテキストウィンドウの圧迫 | 中 | steering は最小限に、詳細は skills の遅延読み込みを活用 |
| AgentSpawn フックのタイムアウト | 低 | timeout_ms を適切に設定（デフォルト30秒） |
| symlink が Windows で動作しない可能性 | 中 | 直接配置または git submodule を使用 |
| カスタムエージェントでの steering 未読み込み | 中 | resources に明示的に追加する |

### ライセンスリスク

- Kiro CLI 自体のライセンス: AWS のサービスとして提供（利用規約に従う）
- Agent Skills 仕様: オープンスタンダード（agentskills.io）

### 将来の継続性リスク

| 観点 | 評価 |
|------|------|
| Kiro CLI の開発活発さ | 高（AWS が開発、定期的なドキュメント更新あり） |
| Agent Skills 仕様の安定性 | 中（オープンスタンダードだが比較的新しい） |
| 破壊的変更の可能性 | 中（CLI はまだ進化中、設定フォーマットが変わる可能性あり） |

---

## 情報源

| ソース | URL | 確認日 |
|--------|-----|--------|
| Kiro CLI Hooks ドキュメント | https://kiro.dev/docs/cli/hooks/ | 2025-07-15 |
| Kiro CLI Custom Agents 概要 | https://kiro.dev/docs/cli/custom-agents/ | 2025-07-15 |
| Kiro CLI Custom Agents 作成方法 | https://kiro.dev/docs/cli/custom-agents/creating/ | 2025-07-15 |
| Kiro CLI Agent Configuration Reference | https://kiro.dev/docs/cli/custom-agents/configuration-reference/ | 2025-07-15 |
| Kiro CLI Agent Examples | https://kiro.dev/docs/cli/custom-agents/examples/ | 2025-07-15 |
| Kiro CLI Steering ドキュメント | https://kiro.dev/docs/cli/steering/ | 2025-07-15 |
| Kiro CLI Agent Skills ドキュメント | https://kiro.dev/docs/cli/skills/ | 2025-07-15 |

---

## 実装難易度

| 項目 | 難易度 | 理由 |
|------|--------|------|
| AgentSpawn フックでのコンテキスト注入 | 低 | JSON 設定ファイルに command を追加するだけ |
| SKILL.md による遅延読み込み | 低 | フロントマター付き Markdown を配置するだけ |
| steering ファイルによる常時注入 | 低 | Markdown ファイルを配置するだけ |
| カスタムエージェント設定 | 低〜中 | JSON 設定ファイルの作成。フィールドが多いが明確 |
| git clone による配布 | 低 | 標準的な git 操作 |
| チーム全体への配布（MDM等） | 中 | 組織のインフラに依存 |

---

## コスト

- Kiro CLI 自体: 有料サービス（Kiro のサブスクリプションに含まれる）
- Hooks / Skills / Steering / Custom Agents 機能: 追加料金なし（Kiro CLI の標準機能）
- 配布インフラ: git リポジトリのホスティング費用のみ（GitHub, GitLab 等）
