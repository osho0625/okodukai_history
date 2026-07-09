# 調査1: Claude Code のサブエージェント（Task ツール）の仕様と制約

## 要約

Claude Code の Task ツール（サブエージェント）は、独立したコンテキストウィンドウで動作する軽量なClaude Codeインスタンスであり、AIDEのオーケストレーター→サブエージェント委譲パターンの実現に適している。ただし、**サブエージェントからさらにサブエージェントを呼ぶ入れ子（ネスト）は不可能**という重大な制約がある。また、サブエージェントはユーザーとの対話が可能（フォアグラウンド実行時）だが、バックグラウンド実行時は対話不可。Codex CLI の multi_agent 機能も同様のパターンを提供するが、spawn_agent/wait/close_agent という異なるAPIを使用する。

---

## 調査概要

- **調査対象**: Claude Code の Task ツールによるサブエージェント機構、Codex CLI の multi_agent 機能
- **調査日**: 2025-07-06
- **調査の背景**: AIDEの7つのオーケストレーター + 43のサブエージェント構成をClaude Code / Codex CLIに移植するため、サブエージェント機構の仕様と制約を把握する必要がある

---

## 調査結果

### 実現可能性: **条件付き可能**

AIDEのオーケストレーター→サブエージェント委譲パターンは基本的に実現可能だが、入れ子制約への対応が必要。

### 1. Claude Code Task ツールの仕様

#### プロンプトの渡し方

- Task ツールは `description`（タスクの説明）と `prompt`（詳細な指示）を受け取る
- プロンプトはMarkdown形式で記述可能
- サブエージェントは親のコンテキストを継承しない。必要な情報はすべてプロンプトに含める必要がある
- superpowersプロジェクトの実装例では、タスクのフルテキスト、コンテキスト（依存関係、アーキテクチャ背景）、作業ディレクトリをプロンプトに含めている

#### コンテキストの制御方法

- 各サブエージェントは**独立したコンテキストウィンドウ**で動作する
- 親の会話履歴、ツール呼び出し結果、推論過程はサブエージェントに渡らない
- サブエージェントは完了時に最終テキスト応答のみを親に返す
- これはAIDEの「独立したコンテキストで実行（コンテキスト溢れ防止）」と完全に一致する

#### サブエージェントがユーザーと対話できるか

- **フォアグラウンド実行時**: 可能。パーミッションプロンプトや `AskUserQuestion` ツールによる質問がユーザーに表示される
- **バックグラウンド実行時**: 不可。`AskUserQuestion` ツール呼び出しは失敗するが、サブエージェント自体は継続する
- AIDEのサブエージェントはユーザーとのヒアリングを行うため、**フォアグラウンド実行が必須**

#### サブエージェントの入れ子（ネスト）

- **不可能**。サブエージェントからさらにサブエージェントを呼ぶことはできない
- Task ツールはサブエージェントのツールリストから意図的に除外されている
- GitHub Issue #4182, #16003, #6941 で機能リクエストが出ているが、2025年7月時点で未実装
- 公式ドキュメントにも「Subagents cannot spawn other subagents」と明記されている
- **AIDEへの影響**: オーケストレーターがサブエージェントを呼び、そのサブエージェントがさらに別のエージェントを呼ぶパターン（例: 変更オーケストレーター → change-impact-analyzer → 内部で別エージェント呼び出し）は直接実現できない。オーケストレーターが全てのサブエージェント呼び出しを直接管理する「フラット構造」に変更する必要がある

#### サブエージェントに特定のファイルを読ませる方法

1. **プロンプトにファイル内容を埋め込む**: 親エージェントがファイルを読み、その内容をプロンプトに含める（superpowersの推奨方法）
2. **ファイルパスを指示する**: サブエージェントにRead ツールでファイルを読むよう指示する
3. **skills フィールドでスキルを注入**: サブエージェント定義の `skills` フィールドでスキルを事前ロードできる
4. **カスタムサブエージェント定義**: `.claude/agents/` にMarkdownファイルを配置し、システムプロンプトとして使用する

#### サブエージェントのコンテキスト分離の仕組み

- 各サブエージェントは独自のコンテキストウィンドウ、カスタムシステムプロンプト、独立したパーミッションを持つ
- サブエージェントは基本的な環境情報（作業ディレクトリ等）のみ受け取り、Claude Codeのフルシステムプロンプトは受け取らない
- CLAUDE.md ファイルとプロジェクトメモリは通常のメッセージフローで読み込まれる
- サブエージェントのトランスクリプトは `~/.claude/projects/{project}/{sessionId}/subagents/` に保存される
- 自動コンパクション（約95%容量で発動）をサポート

### 2. Claude Code カスタムサブエージェントの定義方法

#### ファイルベースの定義

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: default
maxTurns: 50
skills: skill1, skill2
memory: project
---

サブエージェントのシステムプロンプト（Markdown本文）
```

#### 配置場所と優先順位（高い順）

1. マネージド設定（組織全体）
2. `--agents` CLIフラグ（セッション限定）
3. `.claude/agents/`（プロジェクトレベル）
4. `~/.claude/agents/`（ユーザーレベル）
5. プラグインの `agents/` ディレクトリ

#### 主要な設定フィールド

| フィールド | 必須 | 説明 |
|---|---|---|
| name | Yes | 一意の識別子（小文字+ハイフン） |
| description | Yes | Claudeがいつ委譲すべきかの説明 |
| tools | No | 使用可能なツール（省略時は全ツール継承） |
| disallowedTools | No | 拒否するツール |
| model | No | sonnet, opus, haiku, inherit, またはフルモデルID |
| permissionMode | No | default, acceptEdits, auto, dontAsk, bypassPermissions, plan |
| maxTurns | No | 最大エージェントターン数 |
| skills | No | 起動時に注入するスキル |
| mcpServers | No | サブエージェント専用のMCPサーバー |
| hooks | No | ライフサイクルフック |
| memory | No | 永続メモリスコープ（user, project, local） |
| background | No | バックグラウンド実行（true/false） |
| isolation | No | worktree で隔離されたgit worktreeで実行 |

### 3. Codex CLI の multi_agent 機能

#### 有効化方法

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

#### ツールマッピング（Claude Code → Codex CLI）

| Claude Code | Codex CLI |
|---|---|
| Task ツール（サブエージェント起動） | `spawn_agent` |
| Task の結果取得 | `wait` |
| Task 完了 | `close_agent` |
| TodoWrite（タスク追跡） | `update_plan` |
| Skill ツール | ネイティブスキル読み込み |

#### ビルトインエージェントロール

| ロール | 用途 |
|---|---|
| default | 汎用フォールバック |
| worker | 実装・修正 |
| explorer | 読み取り専用のコードベース探索 |
| monitor | 長時間実行コマンドの監視 |

#### カスタムエージェントロール

`config.toml` の `[agents]` セクションで定義。各ロールにモデル、サンドボックスモード、指示、MCPサーバーを設定可能。

#### 制約事項

- **実験的機能**。APIとスキーマは変更される可能性がある
- CLI のみ。デスクトップアプリやIDE拡張では未対応
- サブエージェント間の直接メッセージングは不可（Claude Code の Agent Teams とは異なる）
- **ネストはデフォルトで深さ1**。子エージェントはさらにサブエージェントを生成できない
- トークンコストはエージェント数に比例して線形に増加

---

## AIDEの移植への影響

### 対応が必要な点

1. **入れ子制約への対応**: AIDEのオーケストレーターは全てのサブエージェント呼び出しを直接管理する「フラット構造」に変更する必要がある。サブエージェントが内部で別のサブエージェントを呼ぶパターンは使えない

2. **ユーザー対話の制約**: サブエージェントがユーザーとヒアリングを行うAIDEのパターンは、フォアグラウンド実行であれば実現可能。ただし、バックグラウンド実行では対話不可

3. **コンテキスト管理**: サブエージェントは親のコンテキストを継承しないため、オーケストレーターが必要な情報（設計書の内容、前フェーズの成果物等）をプロンプトに明示的に含める必要がある

4. **Codex CLI対応**: Claude Code と Codex CLI でツール名が異なるため、スキル内でプラットフォーム検出と分岐が必要

### 実装の難易度: **中〜高**

- サブエージェント機構自体は十分な機能を持つが、入れ子制約への対応でアーキテクチャ変更が必要
- 43のサブエージェント定義をClaude Code形式に変換する作業量が大きい
- オーケストレーターのフェーズ管理ロジックをCLAUDE.md + スキルで表現する設計が必要

---

## リスク

### 技術的リスク

- サブエージェントの入れ子が将来サポートされる可能性はあるが、時期は不明
- サブエージェントのコンテキストウィンドウサイズに制限がある（自動コンパクションで対応可能）
- 大量のサブエージェント呼び出しによるトークンコスト増加

### 将来の継続性リスク

- Claude Code のサブエージェント機構は安定版として提供されている
- Codex CLI の multi_agent は実験的機能であり、APIが変更される可能性がある

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Claude Code 公式ドキュメント: Create custom subagents | https://docs.claude.com/en/docs/claude-code/sub-agents | 2025-07-06 |
| dotclaude.com: Sub-Agents | https://dotclaude.com/agents | 2025-07-06 |
| GitHub Issue #4182: Sub-Agent Task Tool Not Exposed | https://github.com/anthropics/claude-code/issues/4182 | 2025-07-06 |
| GitHub Issue #16003: Enable Task tool for subagents | https://github.com/anthropics/claude-code/issues/16003 | 2025-07-06 |
| Morph: Codex CLI Multi-Agent Guide | https://www.morphllm.com/codex-multi-agent | 2025-07-06 |
| superpowers: codex-tools.md | ローカルファイル参照 | 2025-07-06 |
| superpowers: subagent-driven-development/SKILL.md | ローカルファイル参照 | 2025-07-06 |
| superpowers: dispatching-parallel-agents/SKILL.md | ローカルファイル参照 | 2025-07-06 |

Content was rephrased for compliance with licensing restrictions.
