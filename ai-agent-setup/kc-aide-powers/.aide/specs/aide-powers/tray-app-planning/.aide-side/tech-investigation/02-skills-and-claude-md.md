# 調査2: Claude Code のスキルシステムと CLAUDE.md の仕様

## 要約

Claude Code のスキルシステムは、SKILL.md ファイルのフロントマター（name, description）に基づいてオンデマンドで読み込まれる仕組みであり、AIDEのステアリングファイル（58ファイル）をスキルとして再構成することが可能。CLAUDE.md は5階層（Enterprise → User → Project → Subdirectory → Local）で読み込まれ、全レベルがマージされる。スキルは `Skill` ツールで明示的に呼び出すか、タスクの文脈に基づいて自動的に呼び出される。AIDEの `inclusion: always` ステアリングファイルは CLAUDE.md に、`inclusion: manual` ファイルはスキルに変換するのが適切。

---

## 調査概要

- **調査対象**: Claude Code のスキルシステム（SKILL.md、Skill ツール）、CLAUDE.md の読み込み仕組み
- **調査日**: 2025-07-06
- **調査の背景**: AIDEの58のステアリングファイルとカスタムエージェント定義をClaude Codeのスキル/CLAUDE.md体系にマッピングする方法を検討する

---

## 調査結果

### 実現可能性: **可能**

AIDEのステアリングファイル体系はClaude Codeのスキル + CLAUDE.md + カスタムサブエージェントの組み合わせで実現可能。

### 1. スキルシステムの仕様

#### スキルの基本構造

スキルは、SKILL.md ファイルを含むディレクトリとして定義される。

```
my-skill/
├── SKILL.md          # コア（必須）
├── reference.md      # 補足資料（任意）
├── scripts/          # 実行可能スクリプト（任意）
└── prompt-template.md # プロンプトテンプレート（任意）
```

#### SKILL.md のフロントマター

```yaml
---
name: my-skill-name
description: Use when [条件] - [何をするか]
dependencies: package1, package2  # 任意
effort: thorough                  # 任意: 推論努力レベル
maxTurns: 30                      # 任意: 最大エージェントターン数
disallowedTools: Edit, Write      # 任意: 禁止ツール
---

# スキルの本文（Markdown）
スキルの指示内容をここに記述する。
```

**必須フィールド:**
- `name`: スキル名（64文字以内）
- `description`: スキルの用途と使用条件の説明。Claudeがスキルを自動選択する際の判断基準になる

**任意フィールド:**
- `dependencies`: 必要なソフトウェアパッケージ
- `effort`: 推論努力レベル
- `maxTurns`: 最大エージェントターン数
- `disallowedTools`: 禁止ツール

#### スキルの配置場所

| 場所 | スコープ | 用途 |
|---|---|---|
| `.claude/skills/` | プロジェクト固有 | プロジェクト専用のスキル |
| `~/.claude/skills/` | ユーザーレベル | 全プロジェクトで使用するスキル |
| プラグインの `skills/` | プラグインスコープ | プラグインとして配布されるスキル |

#### スキルの発見と読み込みの仕組み

1. **メタデータの発見**: Claude Code は起動時にスキルディレクトリをスキャンし、各 SKILL.md のフロントマター（name, description）を読み取る
2. **プログレッシブ・ディスクロージャー**: フロントマターが第1レベル、SKILL.md の本文が第2レベル、追加ファイルが第3レベルとして段階的に読み込まれる
3. **オンデマンド読み込み**: スキルの全内容はタスクに関連する場合にのみ読み込まれる。常にコンテキストに含まれるわけではない

#### Skill ツールによるオンデマンド読み込み

- Claude Code では `Skill` ツールを使ってスキルを明示的に呼び出す
- スキルを呼び出すと、その内容がコンテキストに読み込まれ、指示に従って実行される
- スキルファイルを `Read` ツールで直接読むのではなく、`Skill` ツールを使うことが推奨されている
- スラッシュコマンド `/skill-name` でも呼び出し可能

#### スキルの自動呼び出し

Claudeは以下の条件でスキルを自動的に呼び出す:
- ユーザーがスキル名を言及した場合
- タスクがスキルの description に合致する場合
- 別のスキル（例: using-superpowers）がスキルの使用を指示した場合

#### Codex CLI でのスキル

- Codex CLI はネイティブスキル発見機能を持つ
- `~/.agents/skills/` ディレクトリを起動時にスキャンし、SKILL.md のフロントマターを解析する
- スキルはオンデマンドで読み込まれる（`Skill` ツールに相当する機能はネイティブ）
- superpowers の Codex 向けインストールでは、`~/.agents/skills/superpowers` へのシンボリックリンクで配布している

### 2. CLAUDE.md の読み込み仕組み

#### 5階層の読み込み順序（低優先度 → 高優先度）

| レベル | パス | スコープ | コミット対象 |
|---|---|---|---|
| 1. Enterprise | `/etc/claude-code/CLAUDE.md` | 組織全体のポリシー | N/A（システム） |
| 2. User | `~/.claude/CLAUDE.md` | 個人のデフォルト設定 | No |
| 3. Project | `./CLAUDE.md` | プロジェクトルート（メイン） | Yes |
| 4. Subdirectory | `./subdir/CLAUDE.md` | 特定ディレクトリのスコープ | Yes |
| 5. Local | `./CLAUDE.local.md` | 個人のオーバーライド | No（.gitignore） |

#### 重要な特性

- **全レベルがマージされる**（上書きではない）。Enterprise とUser がベースライン、Project が追加、Subdirectory がスコープ付き詳細、Local が個人設定
- 後から読み込まれるファイルが高い優先度を持つ（コンテキストウィンドウ内で後に出現する指示により注意が払われるため）
- サブディレクトリの CLAUDE.md は、そのディレクトリ内のファイルを操作する場合にのみ読み込まれる
- `@` インポート構文でファイルを参照可能（例: `@docs/architecture.md`）

#### AGENTS.md との関係

- Claude Code はネイティブには CLAUDE.md のみを読み込む
- AGENTS.md を使用するには、CLAUDE.md に `@AGENTS.md` と記述するか、シンボリックリンクを作成する
- superpowers プロジェクトでは `AGENTS.md` の内容を `CLAUDE.md` としている

### 3. スキルと CLAUDE.md の優先順位

superpowers の `using-superpowers` スキルで定義されている優先順位:

1. **ユーザーの明示的な指示**（CLAUDE.md, AGENTS.md, 直接のリクエスト）— 最高優先度
2. **スキル** — デフォルトのシステム動作を上書き
3. **デフォルトのシステムプロンプト** — 最低優先度

### 4. サブエージェントへのスキル注入

カスタムサブエージェント定義の `skills` フィールドでスキルを事前ロードできる:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
```

- スキルの全内容がサブエージェントのコンテキストに注入される（呼び出し可能になるだけではない）
- **サブエージェントは親の会話からスキルを継承しない**。明示的にリストする必要がある

---

## AIDEのステアリングファイルのマッピング方針

### AIDEの現在の構成

| 種類 | ファイル数 | 読み込み方式 |
|---|---|---|
| `inclusion: always` ステアリング | 2（orchestrator-index.md, global-rules.md） | 常に読み込み |
| `inclusion: manual` ステアリング | 56（agent-*.md） | 必要時に読み込み |
| カスタムエージェント定義 | 43（agents/*.md） | サブエージェント呼び出し時 |

### Claude Code への推奨マッピング

| AIDEの構成要素 | Claude Code での実現方法 |
|---|---|
| `inclusion: always` ステアリング | CLAUDE.md に記述（常にコンテキストに含まれる） |
| オーケストレーター（agent-*-orchestrator.md） | スキル（`.claude/skills/`）として定義。フェーズ管理ロジックを含む |
| サブエージェント手順書（agent-*.md） | カスタムサブエージェント定義（`.claude/agents/`）のシステムプロンプトとして使用 |
| カスタムエージェント定義（agents/*.md） | カスタムサブエージェント定義（`.claude/agents/`）に統合 |

### 具体的な変換例

#### orchestrator-index.md → CLAUDE.md

```markdown
# CLAUDE.md

## オーケストレーター選択ガイド
（orchestrator-index.md の内容をここに記述）

## グローバルルール
（global-rules.md の内容をここに記述）

## スキル参照
- 企画プロセス: @.claude/skills/planning-orchestrator/SKILL.md
- 設計プロセス: @.claude/skills/design-orchestrator/SKILL.md
...
```

#### agent-design-orchestrator.md → スキル

```
.claude/skills/design-orchestrator/
├── SKILL.md          # フェーズ管理ロジック
├── phase-guide.md    # 各フェーズの詳細手順
└── qa-gate.md        # QAゲートの基準
```

#### agents/bugfix-analyzer.md + steering/agent-bugfix-analyzer.md → サブエージェント

```
.claude/agents/bugfix-analyzer.md
```

```yaml
---
name: bugfix-analyzer
description: バグの原因箇所を特定し、影響範囲を調査する。バグ修正プロセスのフェーズ2で使用。
tools: Read, Grep, Glob, Bash
model: inherit
---

（agents/bugfix-analyzer.md と steering/agent-bugfix-analyzer.md の内容を統合）
```

---

## 制約事項・制限事項

1. **CLAUDE.md のサイズ制限**: 200行以下が推奨。AIDEの orchestrator-index.md + global-rules.md は合計で数百行あるため、要約・圧縮が必要
2. **スキルのコンテキスト消費**: スキルが読み込まれるとコンテキストウィンドウを消費する。58のステアリングファイルを全てスキルにすると、必要時の読み込みでもコンテキスト圧迫の可能性がある
3. **サブエージェントはスキルを継承しない**: 各サブエージェント定義で必要なスキルを明示的に指定する必要がある
4. **サブエージェントは CLAUDE.md を読み込む**: サブエージェントはCLAUDE.mdとプロジェクトメモリを通常のメッセージフローで読み込むが、フルのClaude Codeシステムプロンプトは受け取らない

---

## リスク

### 技術的リスク

- CLAUDE.md のサイズが大きすぎると、毎セッションのコンテキスト消費が増大し、実作業に使えるコンテキストが減少する
- スキルの自動呼び出しが意図しないタイミングで発動する可能性がある（description の記述精度に依存）
- 43のサブエージェント定義の変換作業量が大きい

### 将来の継続性リスク

- スキルシステムは2025年10月にローンチされた比較的新しい機能だが、Anthropic公式として安定的に提供されている
- Agent Skills 標準（agentskills.io）としてクロスプラットフォーム互換性が推進されている

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Claude Code 公式: How to create custom Skills | https://support.claude.com/en/articles/12512198-how-to-create-custom-skills | 2025-07-06 |
| Claude Code 公式: Create custom subagents | https://docs.claude.com/en/docs/claude-code/sub-agents | 2025-07-06 |
| Wil.Dev: CLAUDE.md and Settings | https://wil.dev/guides/claude-md-and-settings/ | 2025-07-06 |
| dotclaude.com: Plugins | https://dotclaude.com/plugins | 2025-07-06 |
| superpowers: using-superpowers/SKILL.md | ローカルファイル参照 | 2025-07-06 |
| superpowers: docs/README.codex.md | ローカルファイル参照 | 2025-07-06 |
| fp8.co: Claude Code Skills Complete Developer Guide | https://fp8.co/articles/Claude-Code-Skills-Complete-Developer-Guide | 2025-07-06 |

Content was rephrased for compliance with licensing restrictions.
