# Kiro IDE: Hooks・Steering・Skills・Powers 調査結果

## 要約

Kiro IDE には「セッション開始時」に自動発火する専用の Hook イベントは存在しない。ただし、**Prompt Submit** Hook（ユーザーが最初のプロンプトを送信した時点で発火）を擬似的なセッション開始トリガーとして利用できる。スキル（SKILL.md）の自動注入には **Steering ファイル（inclusion: always）** または **Skills（description ベースの自動アクティベーション）** が最適な仕組みである。配布には **Kiro Powers**（POWER.md + steering/ + mcp.json のパッケージ）が公式の方法であり、GitHub リポジトリ経由のワンクリックインストールが可能。git clone + `.kiro/` 配置方式も Steering/Skills/Hooks のバージョン管理として有効。

---

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査対象 | Kiro IDE の Hooks・Steering・Skills・Powers 機能 |
| 調査日 | 2025年7月（公式ドキュメント最終更新: 2026年2月〜4月） |
| 調査の背景 | aide-powers プロジェクトにおいて、セッション開始時にスキル（SKILL.md）を自動注入する仕組みと、プラグイン配布方法を確定するため |

---

## 調査対象1: セッション開始時にスキル（SKILL.md）を自動注入する仕組み

### 1. Hooks 機能の詳細

#### 概要
Agent Hooks は `.kiro/hooks/` 配下に JSON ファイルとして配置する自動化トリガー。特定のイベント発生時に、エージェントプロンプトまたはシェルコマンドを自動実行する。

#### イベント種別一覧

| イベント | 説明 | セッション開始に使えるか |
|----------|------|--------------------------|
| **Prompt Submit** | ユーザーがプロンプトを送信した時 | ⚠️ 擬似的に可能（初回プロンプト時に発火） |
| **Agent Stop** | エージェントがターンを完了した時 | ❌ |
| **Pre Tool Use** | エージェントがツールを呼び出す直前 | ❌ |
| **Post Tool Use** | エージェントがツールを呼び出した直後 | ❌ |
| **File Create** | ファイルが作成された時 | ❌ |
| **File Save** | ファイルが保存された時 | ❌ |
| **File Delete** | ファイルが削除された時 | ❌ |
| **Pre Task Execution** | Spec タスクの実行開始前 | ❌ |
| **Post Task Execution** | Spec タスクの実行完了後 | ❌ |
| **Manual Trigger (userTriggered)** | ユーザーが手動で実行 | ❌（手動のため） |

#### 「セッション開始時」に相当するイベントの有無

**結論: 専用のイベントは存在しない。**

- `sessionStart` や `workspaceOpen` のようなイベントは公式ドキュメントに記載されていない
- 最も近いのは **Prompt Submit** で、ユーザーが最初のプロンプトを送信した時点で発火する
- Prompt Submit の場合、`USER_PROMPT` 環境変数でユーザーのプロンプト内容にアクセス可能
- ただし、Prompt Submit は**毎回のプロンプト送信時**に発火するため、「初回のみ」の制御は Hook 単体ではできない

#### Hook のアクション種別

| アクション | 説明 | クレジット消費 |
|------------|------|----------------|
| **Ask Kiro（Agent Prompt）** | エージェントにプロンプトを送信 | あり |
| **Run Command（Shell Command）** | シェルコマンドを実行 | なし |

- Prompt Submit + Ask Kiro の組み合わせで「Add to prompt」として動作（ユーザープロンプトに追記される）
- Shell Command は exit code 0 で stdout がコンテキストに追加、非0で stderr がエージェントに通知

#### Hook ファイルの形式（JSON）

```json
{
  "enabled": true,
  "name": "Hook名",
  "description": "説明",
  "version": "1",
  "when": {
    "type": "promptSubmit"
  },
  "then": {
    "type": "askAgent",
    "prompt": "エージェントへの指示"
  }
}
```

---

### 2. Steering ファイルの仕組み

#### 概要
`.kiro/steering/*.md`（ワークスペース）または `~/.kiro/steering/*.md`（グローバル）に配置するマークダウンファイル。エージェントに永続的な知識を提供する。

#### Inclusion モード

| モード | 説明 | スキル自動注入に適するか |
|--------|------|--------------------------|
| **always**（デフォルト） | すべてのインタラクションで常に読み込まれる | ✅ **最適** |
| **fileMatch** | 指定パターンに一致するファイル操作時のみ読み込み | △ 条件付き |
| **manual** | `#steering-file-name` で明示的に指定した場合のみ | ❌ 手動 |
| **auto** | リクエスト内容が description に一致した場合に自動読み込み | ✅ 適切 |

#### Frontmatter 形式

```yaml
---
inclusion: always
---
```

```yaml
---
inclusion: auto
name: api-design
description: REST API design patterns and conventions. Use when creating or modifying API endpoints.
---
```

```yaml
---
inclusion: fileMatch
fileMatchPattern: "components/**/*.tsx"
---
```

#### スコープ

| スコープ | 配置場所 | 適用範囲 |
|----------|----------|----------|
| Workspace | `.kiro/steering/` | そのワークスペースのみ |
| Global | `~/.kiro/steering/` | 全ワークスペース |
| Team | `~/.kiro/steering/`（MDM/Group Policy配布） | チーム全体 |

#### AGENTS.md サポート
- `AGENTS.md` ファイルも Steering として認識される
- Inclusion モードは非対応（常に読み込まれる）
- ワークスペースルートまたは `~/.kiro/steering/` に配置可能

#### ファイル参照機能
```markdown
#[[file:api/openapi.yaml]]
```
- Steering ファイル内から他のワークスペースファイルを参照可能

---

### 3. Skills（Agent Skills）の仕組み

#### 概要
Skills は [Agent Skills](https://agentskills.io/) オープン標準に準拠したポータブルな命令パッケージ。`.kiro/skills/`（ワークスペース）または `~/.kiro/skills/`（グローバル）に配置する。

#### ディレクトリ構造

```
my-skill/
├── SKILL.md           # 必須（メタデータ + 命令）
├── scripts/           # オプション: 実行可能コード
├── references/        # オプション: ドキュメント
└── assets/            # オプション: テンプレート
```

#### SKILL.md フォーマット

```yaml
---
name: pr-review
description: Review pull requests for code quality, security issues, and test coverage. Use when reviewing PRs or preparing code for review.
---

## Review process
1. Check for security vulnerabilities
2. Verify error handling
...
```

#### Progressive Disclosure（段階的開示）

1. **Discovery（起動時）**: name と description のみ読み込み（〜100トークン）
2. **Activation（マッチ時）**: SKILL.md 全体を読み込み（< 5000トークン推奨）
3. **Resources（必要時）**: scripts/, references/, assets/ を必要に応じて読み込み

#### アクティベーション方法

- **自動**: ユーザーのリクエストが description にマッチした場合に自動アクティベート
- **手動**: `/` スラッシュコマンドで明示的に呼び出し

#### スコープ

| スコープ | 配置場所 | 適用範囲 |
|----------|----------|----------|
| Workspace | `.kiro/skills/` | そのワークスペースのみ |
| Global | `~/.kiro/skills/` | 全ワークスペース |

#### インポート方法
- GitHub URL からインポート（公開リポジトリ）
- ローカルフォルダからインポート

---

### 4. セッション開始時のスキル自動注入: 推奨方法

#### 方法A: Steering（inclusion: always）を使う ★推奨

```yaml
---
inclusion: always
---

# プロジェクト固有のスキル情報
（ここにスキルの内容を記載）
```

- **メリット**: 確実に毎回読み込まれる。設定不要。
- **デメリット**: コンテキストを常に消費する。大量の内容は非推奨。

#### 方法B: Steering（inclusion: auto）を使う

```yaml
---
inclusion: auto
name: design-orchestrator
description: 設計オーケストレーター。要件定義、設計、レビューを行う場合に使用。
---
```

- **メリット**: 必要な時だけ読み込まれる。コンテキスト効率が良い。
- **デメリット**: description のマッチング精度に依存。

#### 方法C: Skills（SKILL.md）を使う

```yaml
---
name: design-workflow
description: ドキュメント駆動開発の設計ワークフロー。設計、レビュー、品質管理を行う場合に使用。
---
```

- **メリット**: オープン標準。Progressive Disclosure でコンテキスト効率が良い。scripts/ で実行可能コードも含められる。
- **デメリット**: description マッチングに依存。確実な注入は保証されない。

#### 方法D: Prompt Submit Hook + Add to prompt

```json
{
  "enabled": true,
  "name": "Inject skill context",
  "version": "1",
  "when": { "type": "promptSubmit" },
  "then": {
    "type": "askAgent",
    "prompt": "以下のスキル定義に従って作業してください: ..."
  }
}
```

- **メリット**: 毎回のプロンプトに追記される。
- **デメリット**: クレジット消費あり。毎回発火するため冗長。

---

## 調査対象2: プラグイン配布設定

### 1. Kiro Powers としてパッケージングする方法

#### Powers の概要
Powers は MCP ツール + Steering + Hooks を統合パッケージとしてバンドルし、キーワードベースで動的にアクティベートする仕組み。

#### ディレクトリ構造

```
my-power/
├── POWER.md              # 必須: メタデータ + オンボーディング + Steering マッピング
├── mcp.json              # オプション: MCP サーバー設定
└── steering/             # オプション: ワークフロー固有のガイダンス
    ├── workflow-a.md
    └── workflow-b.md
```

#### POWER.md フォーマット

```yaml
---
name: "my-power"
displayName: "My Custom Power"
description: "説明文"
keywords: ["keyword1", "keyword2"]
author: "Author Name"
---

# Onboarding
## Step 1: ...

# When to Load Steering Files
- ワークフローA → `workflow-a.md`
- ワークフローB → `workflow-b.md`
```

#### インストール方法

| 方法 | 手順 |
|------|------|
| kiro.dev からワンクリック | kiro.dev/powers でブラウズ → Install ボタン |
| IDE 内から | Powers パネル → Ghosty アイコン → Install |
| GitHub URL から | Powers パネル → Add power from GitHub → URL入力 |
| ローカルパスから | Powers パネル → Add power from Local Path → ディレクトリ選択 |

#### MCP サーバー設定（mcp.json）

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/mcp-server"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

- インストール時に自動的に `~/.kiro/settings/mcp.json` に登録される
- サーバー名は自動的にネームスペース化される（例: `server-name` → `power-my-power-server-name`）

#### 動的アクティベーション
- キーワードベースで自動アクティベート/デアクティベート
- 使用していない Power は自動的にアンロードされる
- コンテキストウィンドウの効率的な利用

---

### 2. .kiro/ ディレクトリの構造

```
.kiro/
├── steering/          # Steering ファイル（inclusion モード付き .md）
├── skills/            # Agent Skills（SKILL.md を含むフォルダ群）
├── hooks/             # Agent Hooks（.kiro.hook JSON ファイル）
├── agents/            # カスタムエージェント定義（.md）
├── specs/             # Spec ファイル（要件・設計・タスク）
└── settings/          # 設定ファイル
    └── mcp.json       # MCP サーバー設定
```

#### グローバル設定（~/.kiro/）

```
~/.kiro/
├── steering/          # グローバル Steering
├── skills/            # グローバル Skills
└── settings/
    └── mcp.json       # グローバル MCP 設定
```

---

### 3. git clone + .kiro/ 配置方式

**結論: 有効な方法である。**

- `.kiro/steering/`, `.kiro/skills/`, `.kiro/hooks/` はすべてファイルベース
- バージョン管理（git）との親和性が高い
- チームで共有する場合:
  - ワークスペースの `.kiro/` をリポジトリに含める → チーム全員に適用
  - `~/.kiro/steering/` にグローバル設定を配布 → MDM/Group Policy 経由
- Powers の場合:
  - GitHub リポジトリに POWER.md + steering/ を push
  - 他のユーザーは「Add power from GitHub」でインストール
  - または git clone してローカルパスからインストール

---

### 4. Skills と Powers と Steering の使い分け

| 機能 | 用途 | 配布方法 | 動的ロード |
|------|------|----------|------------|
| **Steering** | プロジェクト標準・規約 | .kiro/ に配置（git管理） | inclusion モードで制御 |
| **Skills** | 再利用可能なワークフロー | GitHub/ローカルからインポート | description マッチで自動 |
| **Powers** | MCP + Steering + Hooks の統合パッケージ | GitHub/kiro.dev/ローカル | キーワードで動的アクティベート |

---

## リスク

### 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 「セッション開始」イベントが存在しない | 中 | Steering（always）で代替。確実に注入される |
| Steering の always モードでコンテキスト圧迫 | 中 | 内容を簡潔に保つ。詳細は auto/fileMatch に分離 |
| Skills の description マッチング精度 | 低 | キーワードを具体的に記述。スラッシュコマンドで手動呼び出しも可能 |
| Powers のクロスプラットフォーム対応は「coming soon」 | 低 | 現時点では Kiro IDE 専用。将来的に他ツールでも利用可能になる予定 |

### ライセンスリスク

- Agent Skills 標準はオープン標準（ライセンス制約なし）
- Kiro Powers リポジトリ: 個別 Power のライセンスに従う。デフォルトでは非独占的ライセンスで個人・ビジネス利用可能

### 将来の継続性リスク

- Kiro IDE は AWS が開発・運営（安定性高い）
- Agent Skills 標準は複数ツールが採用（Claude Code, Kiro 等）
- Powers は Kiro 0.7+ で利用可能（2025年12月リリース）
- Powers のクロスプラットフォーム対応（Cursor, Claude Code 等）は将来計画として言及されているが未実装

---

## 情報源

| ソース | URL | 確認日 |
|--------|-----|--------|
| Kiro Docs: Steering | https://kiro.dev/docs/steering | 2025-07-14 |
| Kiro Docs: Hooks | https://kiro.dev/docs/hooks | 2025-07-14 |
| Kiro Docs: Hook Types | https://kiro.dev/docs/hooks/types | 2025-07-14 |
| Kiro Docs: Hook Actions | https://kiro.dev/docs/hooks/actions | 2025-07-14 |
| Kiro Docs: Hook Examples | https://kiro.dev/docs/hooks/examples | 2025-07-14 |
| Kiro Docs: Hook Best Practices | https://kiro.dev/docs/hooks/best-practices | 2025-07-14 |
| Kiro Docs: Hook Management | https://kiro.dev/docs/hooks/management | 2025-07-14 |
| Kiro Docs: Agent Skills | https://kiro.dev/docs/skills | 2025-07-14 |
| Kiro Docs: Powers | https://kiro.dev/docs/powers | 2025-07-14 |
| Kiro Docs: Install Powers | https://kiro.dev/docs/powers/installation | 2025-07-14 |
| Kiro Docs: Create Powers | https://kiro.dev/docs/powers/create | 2025-07-14 |
| Kiro Blog: Introducing Powers | https://kiro.dev/blog/introducing-powers | 2025-07-14 |
| kiro.dev/powers（カタログ） | https://kiro.dev/powers | 2025-07-14 |
| GitHub: kirodotdev/powers | https://github.com/kirodotdev/powers | 2025-07-14 |
| Agent Skills Specification | https://agentskills.io/specification | 2025-07-14 |

---

## 補足: aide-powers プロジェクトへの適用方針（参考）

### スキル自動注入の推奨構成

```
aide-powers/
├── POWER.md                    # Power メタデータ + オンボーディング
├── steering/                   # ワークフロー別 Steering
│   ├── design-orchestrator.md
│   ├── impl-orchestrator.md
│   └── ...
└── skills/                     # ※ Powers 内に Skills は含められない
    └── （別途 .kiro/skills/ に配置）
```

### 注意事項
- Powers は Skills を内包する仕組みではない（別の概念）
- Powers = MCP + Steering + Hooks のバンドル
- Skills = Agent Skills 標準に準拠した命令パッケージ
- 両方を組み合わせて使うことが可能
- aide-powers の場合、Steering（always/auto）+ Skills の組み合わせが最も柔軟
