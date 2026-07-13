# 技術調査11: superpowers agents/code-reviewer.md 詳細調査

## 要約

superpowersの `agents/code-reviewer.md` は、YAML frontmatter（name, description, model の3フィールド）+ Markdown本文（システムプロンプト）で構成されるエージェント定義ファイルである。agents/ ディレクトリには現在このファイル1つのみが配置されており、「複数スキルから共通利用されるエージェント」を配置する場所として機能している。一方、特定スキル固有のサブエージェント指示は `{role}-prompt.md` としてスキルディレクトリ内に配置される。Claude Codeでは agents/ を規約ベースで自動検出し、Cursorでは plugin.json の `"agents"` フィールドでパスを明示指定する。

---

## 調査概要

- **調査対象**: superpowers の `agents/code-reviewer.md` およびエージェント定義の仕組み全般
- **調査日**: 2025-07-19
- **調査の背景**: aide-claudeはsuperpowersのフレームワークにAIDEの具象ロジックを載せる構成をとる。AIDEの共通エージェント（design-review-agent, code-review-agent, design-qa-agent, git-committer, micro-impl-agent等）を agents/ に配置する際の設計指針を得るため、superpowersのエージェント定義の詳細を調査する。

---

## 1. agents/code-reviewer.md の全内容分析

### 1.1 ファイル基本情報

| 項目 | 値 |
|---|---|
| ファイルパス | `agents/code-reviewer.md` |
| 行数 | 約50行（frontmatter含む） |
| 文字数 | 約2,200文字（英語） |
| 構成 | YAML frontmatter + Markdown本文 |

### 1.2 YAML frontmatter の全フィールド

```yaml
---
name: code-reviewer
description: |
  Use this agent when a major project step has been completed and needs to be reviewed against the original plan and coding standards. Examples: <example>Context: The user is creating a code-review agent that should be called after a logical chunk of code is written. user: "I've finished implementing the user authentication system as outlined in step 3 of our plan" assistant: "Great work! Now let me use the code-reviewer agent to review the implementation against our plan and coding standards" <commentary>Since a major project step has been completed, use the code-reviewer agent to validate the work against the plan and identify any issues.</commentary></example> <example>Context: User has completed a significant feature implementation. user: "The API endpoints for the task management system are now complete - that covers step 2 from our architecture document" assistant: "Excellent! Let me have the code-reviewer agent examine this implementation to ensure it aligns with our plan and follows best practices" <commentary>A numbered step from the planning document has been completed, so the code-reviewer agent should review the work.</commentary></example>
model: inherit
---
```

#### フィールド詳細

| フィールド | 型 | 値 | 役割 |
|---|---|---|---|
| `name` | string | `code-reviewer` | エージェントの識別名。ケバブケース |
| `description` | string (multiline) | 上記参照 | エージェントの使用条件を記述。`<example>` タグによる使用例を含む |
| `model` | string | `inherit` | 使用するモデル。`inherit` はホストエージェントと同じモデルを使用する意味 |

#### description フィールドの構造分析

`description` は単なる説明文ではなく、**エージェントの自動選択（ルーティング）のためのメタデータ**として機能している:

1. **使用条件の記述**: 「major project step has been completed and needs to be reviewed」
2. **`<example>` タグによる使用例**: 2つの具体例を含む
   - 各例は `Context:`, `user:`, `assistant:`, `<commentary>` の構造
   - プラットフォーム（Claude Code / Cursor）がこの description を読み、ユーザーの発言に対して適切なエージェントを自動選択する際の判断材料にする
3. **YAML multiline（`|`）**: 改行を保持するブロックスカラー形式

### 1.3 Markdown本文の全体構造

本文はエージェントのシステムプロンプトとして機能する。セクション構成は以下の通り:

| # | セクション | 内容 |
|---|---|---|
| 冒頭 | ロール定義 | 「You are a Senior Code Reviewer with expertise in software architecture, design patterns, and best practices.」 |
| 1 | Plan Alignment Analysis | 計画との整合性チェック（4項目） |
| 2 | Code Quality Assessment | コード品質評価（5項目） |
| 3 | Architecture and Design Review | アーキテクチャ・設計レビュー（4項目） |
| 4 | Documentation and Standards | ドキュメント・標準準拠チェック（3項目） |
| 5 | Issue Identification and Recommendations | 問題の分類と推奨事項（5項目） |
| 6 | Communication Protocol | コミュニケーション規約（4項目） |

#### 本文の特徴

- **番号付きリスト + 太字見出し**: 各セクションは `1. **Plan Alignment Analysis**:` の形式
- **サブ項目はハイフンリスト**: 各セクション内の具体的な指示は `- Compare the implementation against...` の形式
- **問題の重要度分類を定義**: Critical (must fix) / Important (should fix) / Suggestions (nice to have) の3段階
- **出力形式の指示**: 「Your output should be structured, actionable, and focused on helping maintain high code quality」
- **トーンの指示**: 「Always acknowledge what was done well before highlighting issues」（良い点を先に認める）

---

## 2. agents/ フォルダに入れるべきファイルの特徴

### 2.1 agents/ に配置されているファイル

agents/ ディレクトリには `code-reviewer.md` の **1ファイルのみ** が配置されている。

### 2.2 agents/ に1ファイルのみの理由

superpowersのスキル構成を分析すると、code-reviewer は以下の **2つのスキルから共通利用** されている:

| 呼び出し元スキル | 呼び出し方 |
|---|---|
| `requesting-code-review` | SKILL.md の手順で「Dispatch superpowers:code-reviewer subagent」と指示。テンプレートは `code-reviewer.md`（スキル内） |
| `subagent-driven-development` | `code-quality-reviewer-prompt.md` 内で「Task tool (superpowers:code-reviewer): Use template at requesting-code-review/code-reviewer.md」と指示 |

つまり、**複数スキルから共通で呼ばれるエージェントが agents/ に配置される**。superpowersでは code-reviewer 以外に複数スキルから共通利用されるエージェントが存在しないため、1ファイルのみとなっている。

### 2.3 agents/code-reviewer.md とスキル内 code-reviewer.md の関係

superpowersには「code-reviewer」に関連するファイルが **2つ** 存在する:

| ファイル | パス | 役割 |
|---|---|---|
| エージェント定義 | `agents/code-reviewer.md` | エージェントの**アイデンティティ**を定義（ロール、能力、行動規範） |
| プロンプトテンプレート | `skills/requesting-code-review/code-reviewer.md` | エージェントへの**具体的な指示**を定義（レビュー対象、チェックリスト、出力形式） |

#### 両者の違い

| 観点 | agents/code-reviewer.md | skills/.../code-reviewer.md |
|---|---|---|
| **ファイル形式** | YAML frontmatter + Markdown本文 | Markdown のみ（frontmatter なし） |
| **役割** | エージェントの「人格」定義（システムプロンプト） | タスク実行時の「指示書」（プロンプトテンプレート） |
| **プレースホルダ** | なし（汎用的な記述） | あり（`{WHAT_WAS_IMPLEMENTED}`, `{BASE_SHA}` 等） |
| **呼び出しタイミング** | エージェント起動時に自動読み込み | スキル実行時にテンプレートとして手動読み込み |
| **スコープ** | エージェントの全セッションに適用 | 特定のレビュータスクに適用 |
| **内容の抽象度** | 高い（「Plan Alignment Analysis を行え」等の方針レベル） | 低い（「git diff {BASE_SHA}..{HEAD_SHA} を実行せよ」等の具体的手順） |

#### 呼び出しの流れ

```
1. スキル（requesting-code-review/SKILL.md）が「superpowers:code-reviewer subagent を dispatch せよ」と指示
2. プラットフォームが agents/code-reviewer.md を読み込み、エージェントを起動
   → agents/code-reviewer.md の本文がシステムプロンプトとして設定される
3. スキル内の code-reviewer.md（プロンプトテンプレート）のプレースホルダを埋めて、タスク指示として渡す
   → エージェントは「システムプロンプト（人格）+ タスク指示（具体的な作業）」の2層で動作する
```

### 2.4 スキル内プロンプトテンプレート（*-prompt.md）との構造の違い

superpowersには以下のプロンプトテンプレートが存在する:

| ファイル | 所属スキル | 命名パターン |
|---|---|---|
| `implementer-prompt.md` | subagent-driven-development | `{role}-prompt.md` |
| `spec-reviewer-prompt.md` | subagent-driven-development | `{role}-prompt.md` |
| `code-quality-reviewer-prompt.md` | subagent-driven-development | `{role}-prompt.md` |
| `spec-document-reviewer-prompt.md` | brainstorming | `{role}-prompt.md` |
| `plan-document-reviewer-prompt.md` | writing-plans | `{role}-prompt.md` |
| `code-reviewer.md` | requesting-code-review | 例外的命名（`-prompt` サフィックスなし） |

#### プロンプトテンプレートの共通構造

全プロンプトテンプレートに共通する構造パターン:

1. **冒頭に目的の説明**: 「Use this template when dispatching a ... subagent.」
2. **コードブロック内にプロンプト本文**: ` ```Task tool (...): ``` ` の形式
3. **プレースホルダ**: `[FULL TEXT of task requirements]`, `{BASE_SHA}` 等
4. **YAML frontmatter なし**: プロンプトテンプレートには frontmatter がない

#### agents/ のエージェント定義との構造比較

| 観点 | agents/ エージェント定義 | スキル内プロンプトテンプレート |
|---|---|---|
| YAML frontmatter | **あり**（name, description, model） | **なし** |
| プラットフォーム自動検出 | **対象**（agents/ 配下は自動検出される） | **対象外**（スキル内のファイルは自動検出されない） |
| 呼び出し方 | プラットフォームが自動的にエージェントとして認識 | SKILL.md の手順内で明示的にファイルを読み込んで使用 |
| 再利用性 | 複数スキルから共通利用可能 | 所属スキル内でのみ使用（原則） |
| プレースホルダ | なし（汎用的） | あり（タスク固有の値を埋める） |

### 2.5 agents/ に配置する基準

上記の分析から導出される配置基準:

| 基準 | agents/ に配置 | スキル内に配置 |
|---|---|---|
| 複数スキルから共通利用される | ✅ | - |
| 特定スキル固有のサブエージェント | - | ✅ |
| プラットフォームにエージェントとして認識させたい | ✅ | - |
| タスク実行時のプロンプトテンプレート | - | ✅ |
| YAML frontmatter（name, description, model）が必要 | ✅ | - |
| プレースホルダを含む指示書 | - | ✅ |

---

## 3. Claude Code でのエージェント自動検出の仕組み

### 3.1 規約ベース自動検出

Claude Code の `.claude-plugin/plugin.json` には `agents` パスフィールドが **存在しない**:

```json
{
  "name": "superpowers",
  "description": "Core skills library for Claude Code: ...",
  "version": "5.0.7",
  "author": { "name": "Jesse Vincent", "email": "jesse@fsck.com" },
  "homepage": "https://github.com/obra/superpowers",
  "repository": "https://github.com/obra/superpowers",
  "license": "MIT",
  "keywords": ["skills", "tdd", "debugging", "collaboration", "best-practices", "workflows"]
}
```

tech-ref-project-anatomy.md セクション2.2 に以下の記載がある:

> 注目点: `skills`, `agents`, `commands`, `hooks` のパスフィールドが**存在しない**。Claude Codeはこれらを規約ベースで自動検出する（`skills/`, `agents/`, `commands/`, `hooks/hooks.json`）。

つまり、Claude Code は以下のディレクトリ/ファイルを **規約ベースで自動検出** する:

| 対象 | 検出パス |
|---|---|
| スキル | `skills/` |
| エージェント | `agents/` |
| コマンド | `commands/` |
| フック | `hooks/hooks.json` |

### 3.2 plugin.json との関係

Claude Code の plugin.json は **メタデータのみ** を含み、コンテンツの場所を指定しない。エージェントの検出は plugin.json とは独立して、ディレクトリ名の規約に基づいて行われる。

---

## 4. Cursor でのエージェント指定方法

### 4.1 明示的パス指定

Cursor の `.cursor-plugin/plugin.json` には `agents` パスフィールドが **明示的に指定** されている:

```json
{
  "name": "superpowers",
  "displayName": "Superpowers",
  "description": "Core skills library: ...",
  "version": "5.0.7",
  "skills": "./skills/",
  "agents": "./agents/",
  "commands": "./commands/",
  "hooks": "./hooks/hooks-cursor.json"
}
```

| フィールド | 値 | 備考 |
|---|---|---|
| `skills` | `"./skills/"` | スキルディレクトリへの相対パス |
| `agents` | `"./agents/"` | エージェントディレクトリへの相対パス |
| `commands` | `"./commands/"` | コマンドディレクトリへの相対パス |
| `hooks` | `"./hooks/hooks-cursor.json"` | Cursor用フック設定ファイルへの相対パス |

### 4.2 Claude Code との違い

| 観点 | Claude Code | Cursor |
|---|---|---|
| エージェント検出 | 規約ベース自動検出（`agents/`） | plugin.json の `"agents"` フィールドで明示指定 |
| パス指定の必要性 | 不要 | 必須 |
| フック設定 | `hooks/hooks.json`（規約ベース） | `hooks/hooks-cursor.json`（明示指定、別ファイル） |

---

## 5. aide-claude への示唆

### 5.1 agents/ に配置すべきAIDEエージェント

AIDEの共通エージェントのうち、複数のオーケストレーターから呼ばれるものを agents/ に配置する:

| AIDEエージェント | 呼び出し元（複数） | agents/ 配置の根拠 |
|---|---|---|
| design-review-agent | 設計オーケストレーター、変更オーケストレーター | 設計レビューは複数フローで共通 |
| code-review-agent | 実装オーケストレーター、変更オーケストレーター、バグ修正オーケストレーター | コードレビューは複数フローで共通 |
| design-qa-agent | 設計オーケストレーター、変更オーケストレーター | QAゲートは複数フローで共通 |
| git-committer | 全オーケストレーター | gitコミットは全フローで共通 |
| micro-impl-agent | 実装オーケストレーター、変更オーケストレーター、バグ修正オーケストレーター、リファクタリングオーケストレーター | 実装作業は複数フローで共通 |

一方、特定オーケストレーター固有のエージェント（change-status-checker, change-requirements, change-impact-analyzer 等）は、対応するスキルディレクトリ内にプロンプトテンプレートとして配置する。

### 5.2 frontmatter の設計指針

superpowersの code-reviewer.md の frontmatter を参考に、aide-claude のエージェント定義の frontmatter を設計する:

#### 必須フィールド

| フィールド | 型 | 設計指針 |
|---|---|---|
| `name` | string | ケバブケース。AIDEのエージェント名をそのまま使用（例: `design-review-agent`） |
| `description` | string (multiline) | エージェントの使用条件を記述。`<example>` タグによる使用例を含めることで、プラットフォームの自動ルーティング精度を向上させる |
| `model` | string | `inherit`（ホストと同じモデル）を基本とする。特定のエージェントで異なるモデルが必要な場合のみ変更 |

#### description フィールドの書き方

superpowersの code-reviewer.md の description は以下の構造を持つ:

```
1. 使用条件の1文要約
2. <example> タグ × N個
   - Context: 状況説明
   - user: ユーザーの発言例
   - assistant: アシスタントの応答例
   - <commentary>: なぜこのエージェントを使うべきかの解説
```

この構造は、プラットフォームがユーザーの発言を見て「どのエージェントを使うべきか」を判断する際の材料となる。aide-claude でも同じ構造を採用すべきである。

### 5.3 本文（システムプロンプト）の書き方パターン

superpowersの code-reviewer.md の本文から抽出できるパターン:

#### パターン1: ロール定義（冒頭1文）

```markdown
You are a Senior Code Reviewer with expertise in software architecture, design patterns, and best practices.
```

- 「You are a [ロール名] with expertise in [専門分野]」の形式
- 1文で簡潔にロールを定義

#### パターン2: 行動指示（番号付きリスト）

```markdown
When reviewing completed work, you will:

1. **Plan Alignment Analysis**:
   - Compare the implementation against the original planning document
   - Identify any deviations from the planned approach
   ...
```

- 「When [トリガー条件], you will:」で開始
- 番号付きリスト + 太字見出し + ハイフンリストのサブ項目

#### パターン3: 出力形式の指示（末尾）

```markdown
Your output should be structured, actionable, and focused on helping maintain high code quality...
```

- 出力の品質基準を明示
- トーンの指示（「Always acknowledge what was done well before highlighting issues」）

#### aide-claude への適用

AIDEのエージェントは日本語で記述する可能性があるが、本文の構造パターンは同じものを採用できる:

1. **冒頭**: ロール定義（1文）
2. **中盤**: 行動指示（番号付きリスト + サブ項目）
3. **末尾**: 出力形式・品質基準・トーンの指示

### 5.4 agents/ エージェント定義 vs スキル内プロンプトテンプレートの使い分け

| 配置場所 | 用途 | aide-claude での例 |
|---|---|---|
| `agents/{name}.md` | エージェントの「人格」定義。複数スキルから共通利用。frontmatter あり | `agents/design-review-agent.md`, `agents/code-review-agent.md` |
| `skills/{skill-name}/{role}-prompt.md` | タスク実行時の「指示書」。特定スキル固有。プレースホルダあり | 変更オーケストレーターの `change-impact-analysis-prompt.md` 等 |

superpowersの code-reviewer の例に倣い、agents/ のエージェント定義は **汎用的な行動規範** を記述し、具体的なタスク指示（プレースホルダ付き）はスキル内のプロンプトテンプレートに分離する。

---

## 6. 補足: プロンプトテンプレートの全一覧

superpowersに存在する全プロンプトテンプレート（スキル内の *-prompt.md および類似ファイル）:

| ファイル | 所属スキル | Task tool 指定 | 用途 |
|---|---|---|---|
| `implementer-prompt.md` | subagent-driven-development | `(general-purpose)` | 実装サブエージェントへの指示 |
| `spec-reviewer-prompt.md` | subagent-driven-development | `(general-purpose)` | スペック準拠レビュー |
| `code-quality-reviewer-prompt.md` | subagent-driven-development | `(superpowers:code-reviewer)` | コード品質レビュー（agents/code-reviewer を使用） |
| `spec-document-reviewer-prompt.md` | brainstorming | `(general-purpose)` | スペックドキュメントレビュー |
| `plan-document-reviewer-prompt.md` | writing-plans | `(general-purpose)` | 計画ドキュメントレビュー |
| `code-reviewer.md` | requesting-code-review | N/A（テンプレート自体がプロンプト） | コードレビューの具体的指示 |

注目点: `code-quality-reviewer-prompt.md` は Task tool の type に `(superpowers:code-reviewer)` を指定しており、agents/code-reviewer.md のエージェント定義を使用してサブエージェントを起動する。一方、`implementer-prompt.md` や `spec-reviewer-prompt.md` は `(general-purpose)` を指定しており、特定のエージェント定義を使用しない。

この違いは、**コードレビューは専門的なロール定義（agents/ のシステムプロンプト）が必要だが、実装やスペックレビューは汎用的なサブエージェントで十分** という設計判断を反映している。

---

## 情報源

| # | 参照ファイル | 確認内容 |
|---|---|---|
| 1 | `references/superpowers/agents/code-reviewer.md` | エージェント定義の全内容（frontmatter + 本文） |
| 2 | `references/superpowers/skills/requesting-code-review/code-reviewer.md` | スキル内プロンプトテンプレートの全内容 |
| 3 | `references/superpowers/skills/requesting-code-review/SKILL.md` | code-reviewer の呼び出し方 |
| 4 | `references/superpowers/skills/subagent-driven-development/implementer-prompt.md` | プロンプトテンプレートの構造（比較用） |
| 5 | `references/superpowers/skills/subagent-driven-development/spec-reviewer-prompt.md` | プロンプトテンプレートの構造（比較用） |
| 6 | `references/superpowers/skills/subagent-driven-development/code-quality-reviewer-prompt.md` | agents/code-reviewer を参照するプロンプトテンプレート |
| 7 | `references/superpowers/skills/brainstorming/spec-document-reviewer-prompt.md` | プロンプトテンプレートの構造（比較用） |
| 8 | `references/superpowers/skills/writing-plans/plan-document-reviewer-prompt.md` | プロンプトテンプレートの構造（比較用） |
| 9 | `references/superpowers/.claude-plugin/plugin.json` | Claude Code プラグイン設定（パスフィールドなし） |
| 10 | `references/superpowers/.cursor-plugin/plugin.json` | Cursor プラグイン設定（agents パス明示指定） |
| 11 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-project-anatomy.md` | セクション2.5（エージェント定義の構造）、セクション2.2（規約ベース自動検出） |

全ファイルの内容を実際に読んで確認済み。Web検索は不要（ローカルファイルの調査のため）。
