# 調査4: AIDEの特徴のClaude Code / Codex CLI実現可能性 詳細検証

## 要約

AIDEの3つの特徴（オーケストレーター+サブエージェント構成、7つのオーケストレーター自動選択、ステアリングによるルール定義と選択的読み込み）は、Claude Codeで**条件付きで実現可能**だが、重大な制約が3つある。(1) サブエージェントはユーザーと対話できない（AskUserQuestionが利用不可）、(2) サブエージェントのネストは不可能、(3) CLAUDE.mdの推奨サイズ（100〜200行）にAIDEのグローバルルール全量は収まらない。Kiro固有の機能（`invokeSubAgent`の名前指定、`userInput`の選択肢付き質問、ステアリングの`inclusion`制御、サブエージェントのツール制限）に対するClaude Codeの代替手段は存在するが、完全な等価ではなく設計変更が必要。

---

## 調査概要

- **調査対象**: AIDEの3つの特徴のClaude Code / Codex CLI実現可能性、Kiroでできるがsuperpowersではできないことの洗い出し
- **調査日**: 2025-07-07
- **調査の背景**: 前回の調査（01〜03）で基本的な実現可能性は確認済み。今回はAIDEの具体的な特徴に焦点を当て、移植時の技術的な課題と対応策を明確にする

---

## 調査A: オーケストレーター + サブエージェント構成の実現可能性

### 実現可能性: **条件付き可能（重大な制約あり）**
### 実装の難易度: **高**

### 検証ポイント1: オーケストレーターの「ツール制限」（読み取りのみ許可）

#### AIDEの構成
- オーケストレーターは `readFile`, `listDirectory`, `fileSearch`, `grepSearch`, `userInput`, `invokeSubAgent`, `taskStatus` のみ許可
- `fsWrite`, `fsAppend`, `strReplace`, `deleteFile`, `executePwsh` 等の書き込み・実行系ツールは禁止

#### Claude Codeでの実現方法

**方法1: スキルの `disallowedTools` フィールド（部分的に可能）**

SKILL.md のフロントマターで `disallowedTools` を指定できる:
```yaml
---
name: planning-orchestrator
description: ...
disallowedTools: Edit, Write, Bash
---
```

ただし、これはスキルが読み込まれた際にメインエージェントのツールを制限するものであり、サブエージェントのツール制限とは異なる。

**方法2: カスタムサブエージェント定義の `tools` フィールド（サブエージェント側で可能）**

Claude Code のカスタムサブエージェント定義では `tools` フィールドでホワイトリスト方式のツール制限が可能:
```yaml
---
name: orchestrator
tools: Read, Grep, Glob
---
```

しかし、AIDEのオーケストレーターは「メインエージェント」として動作するため、サブエージェント定義のツール制限は直接適用できない。

**方法3: `permissionMode: plan` の活用（近似的に可能）**

Claude Code の `plan` パーミッションモードは読み取り専用操作を指示するが、実際には完全な読み取り専用ではないことが報告されている（GitHub Issue #43777）。Plan modeの制約はサブエージェントに伝播しないという問題もある。

**方法4: プロンプトベースの制約（推奨）**

CLAUDE.md またはスキル内で「オーケストレーターとして動作する場合、ファイルの読み取り・検索・ユーザーへの質問・サブエージェント委譲のみを行い、直接のファイル編集やコマンド実行は行わない」と明記する。これはAIDEの `global-rules.md` の「禁止ツール一覧」と同等のアプローチ。

#### 結論
- Claude Codeにはオーケストレーターレベルでのツール制限を強制する仕組みがない
- プロンプトベースの制約（AIDEの `global-rules.md` と同じアプローチ）が最も実用的
- Kiro CLIのカスタムエージェントでは `tools` フィールドでホワイトリスト方式の制限が可能（後述の調査Dで詳述）

---

### 検証ポイント2: サブエージェントがユーザーと対話できるか

#### AIDEの構成
- サブエージェント（bugfix-reporter, bugfix-analyzer等）がユーザーに質問を投げ、回答を受け取る
- `userInput` ツールで選択肢付き質問を提示する
- 「質問は1つずつ投げる」ルールで対話を制御する

#### Claude Codeでの状況

**結論: 不可能（2025年7月時点）**

Claude Code のサブエージェントでは `AskUserQuestion` ツールが利用できない。これは複数のGitHub Issueで報告されている重大な制約:

- **Issue #12890**: `AskUserQuestion` がサブエージェントの `tools` に明示的にリストされていても、システムレベルでフィルタリングされる
- **Issue #34592**: フォアグラウンドサブエージェントでも `AskUserQuestion` が利用不可。公式ドキュメントには「フォアグラウンドサブエージェントではパススルーされる」と記載されているが、実際には動作しない
- **Issue #18721**: サブエージェントでの `AskUserQuestion` 制限に関するドキュメント不備

関連する問題パターン:
- Co-workチームメイトが `AskUserQuestion` を呼ぶとサイレントにストールする（Issue #29393）
- Agent SDKプログラマティックモードで `AskUserQuestion` が空の回答を返す（Issue #30983）
- Skillツール内で `AskUserQuestion` が空を返す（Issue #30523）

#### AIDEへの影響と対応策

**影響: 致命的** — AIDEのサブエージェントの多くはユーザーとの対話（ヒアリング）を行う。特にバグ修正オーケストレーターのフェーズ1（bugfix-reporter）はユーザーヒアリングが主目的。

**対応策A: オーケストレーターが対話を代行する（推奨）**
1. オーケストレーター（メインエージェント）がユーザーとの対話を行う
2. 対話結果をサブエージェントのプロンプトに含めて委譲する
3. サブエージェントは対話結果に基づいて成果物を作成する

```
ユーザー ←→ オーケストレーター（メイン） → サブエージェント（成果物作成のみ）
```

**対応策B: 対話フェーズと作業フェーズを分離する**
1. 対話フェーズ: メインエージェントがユーザーとヒアリングを行い、結果をファイルに保存
2. 作業フェーズ: サブエージェントがファイルを読んで成果物を作成

**対応策C: 将来の修正を待つ**
- Issue #34592 は2025年7月時点でオープン。Anthropicが修正する可能性はあるが時期は不明

---

### 検証ポイント3: サブエージェントが成果物ファイルを作成・編集できるか

#### 結論: **可能**

Claude Code のサブエージェントは `Write`, `Edit`, `Bash` 等のツールにアクセスでき、ファイルの作成・編集が可能。カスタムサブエージェント定義で `tools` を指定しない場合、全ツールが継承される。

```yaml
---
name: bugfix-designer
description: バグ修正の差分設計書を作成する
tools: Read, Grep, Glob, Write, Edit, Bash
---
```

AIDEの `tools: ["read", "write", "shell"]` に相当する制限も `tools` フィールドで実現可能。

---

### 検証ポイント4: オーケストレーターがサブエージェントの完了を待って次のフェーズに進む制御

#### 結論: **可能**

Claude Code の Task ツール（フォアグラウンド実行）はサブエージェントの完了を待ってから結果を返す。オーケストレーターは結果を受け取ってから次のフェーズに進むことができる。

superpowers の `subagent-driven-development` スキルがまさにこのパターンを実装している:
1. タスクリストを作成
2. 各タスクについてサブエージェントを起動
3. サブエージェントの完了を待つ
4. レビューサブエージェントを起動
5. 全タスク完了後に次のステップへ

AIDEのフェーズ管理（フェーズ1完了 → フェーズ2開始 → ... → フェーズN完了）は、このパターンで実現可能。

---

## 調査B: 7つのオーケストレーター自動選択の実現可能性

### 実現可能性: **条件付き可能**
### 実装の難易度: **中**

### AIDEの構成
- `orchestrator-index.md`（`inclusion: always`）が常に読み込まれる
- ユーザーのリクエスト内容に応じて、7つのオーケストレーターから適切なものを自動選択
- 選択されたオーケストレーターのステアリングファイルを読み込んでフェーズ管理を開始

### 方法1: CLAUDE.md にオーケストレーター選択ロジックを記述する

#### 実現方法
CLAUDE.md に `orchestrator-index.md` の内容（オーケストレーター一覧 + 選択ガイド）を記述し、Claudeが適切なスキルを自動選択する。

```markdown
# CLAUDE.md

## オーケストレーター選択ガイド
ユーザーのリクエストに応じて、以下のスキルを呼び出すこと:

| リクエスト種別 | スキル |
|---|---|
| アイデア段階の新規プロジェクト | planning-orchestrator |
| 要件定義から始める新規プロジェクト | design-orchestrator |
| 設計書に基づく実装 | impl-orchestrator |
| 既存コードから設計書を逆生成 | reverse-design-orchestrator |
| 機能追加・仕様変更 | change-orchestrator |
| バグ修正 | bugfix-orchestrator |
| 内部構造改善 | refactoring-orchestrator |
```

#### 評価
- **メリット**: シンプルで直感的。CLAUDE.md は毎セッション読み込まれるため、常に選択ガイドが利用可能
- **デメリット**: CLAUDE.md のサイズ制限（推奨100〜200行）に対して、`orchestrator-index.md` の内容（約200行）+ `global-rules.md` の内容（約200行）を含めると400行以上になり、推奨サイズを大幅に超過する
- **対策**: 選択ガイドのみをCLAUDE.mdに記述し（約30行）、詳細なフェーズ管理はスキルに委譲する

### 方法2: using-superpowers のようなメタスキルで選択する

#### 実現方法
superpowers の `using-superpowers` スキルと同様に、「AIDEの使い方」を定義するメタスキルを作成する。

```yaml
---
name: using-aide
description: Use when starting any conversation - establishes how to select the appropriate AIDE orchestrator
---

# Using AIDE

## オーケストレーター選択ルール
ユーザーのリクエストを受けたら、以下の判断基準で適切なオーケストレータースキルを呼び出すこと:
...
```

#### 評価
- **メリット**: CLAUDE.md のサイズを抑えられる。スキルの `description` でClaude が自動的にメタスキルを呼び出す
- **デメリット**: メタスキルが呼び出されない可能性がある（Claudeの判断に依存）。superpowers では `using-superpowers` の呼び出しを強制するために非常に強い言語（"EXTREMELY-IMPORTANT", "This is not negotiable"）を使用している
- **対策**: CLAUDE.md に「全てのリクエストに対して、まず `using-aide` スキルを呼び出すこと」と記述する

### 方法3: スキルの description フィールドだけで7つのオーケストレーターを正確に選択する

#### 実現方法
各オーケストレータースキルの `description` を十分に具体的に記述し、Claudeが自動的に適切なスキルを選択する。

```yaml
# planning-orchestrator/SKILL.md
---
name: planning-orchestrator
description: Use when the user has a vague idea and wants to create a development proposal. Handles idea hearing, tech investigation, and proposal writing.
---

# design-orchestrator/SKILL.md
---
name: design-orchestrator
description: Use when starting requirements definition for a new project. Handles user requirements, system requirements, architecture, GUI design, use cases, DDD modeling, object design, and program structure.
---
```

#### 評価
- **メリット**: 各スキルが独立して選択可能。CLAUDE.md への記述が最小限で済む
- **デメリット**: 7つのスキルの description が類似する場合（例: change-orchestrator と bugfix-orchestrator）、誤選択のリスクがある
- **対策**: description に具体的なトリガーワードを含める（例: "bug", "fix", "error" → bugfix-orchestrator）

### 方法4: SessionStart フックで選択ロジックを注入する

#### 実現方法
Claude Code の hooks で `SessionStart` イベントにオーケストレーター選択ロジックを注入する。

#### 評価
- **実現不可**: Claude Code の hooks は `PreToolUse`, `PostToolUse`, `Notification`, `Stop` 等のイベントをサポートするが、セッション開始時に自動的にスキルを読み込む仕組みはない
- Kiro CLI の hooks は `agentSpawn`, `userPromptSubmit`, `preToolUse`, `postToolUse`, `stop` をサポートするが、これもスキル選択の自動化には直接使えない

### 推奨方法: 方法1 + 方法2 の組み合わせ

1. CLAUDE.md に簡潔な選択ガイド（30行程度）を記述
2. `using-aide` メタスキルに詳細な選択ロジックを配置
3. 各オーケストレータースキルの description を十分に具体的に記述
4. CLAUDE.md に「AIDEのプロセスに従う場合は、まず `using-aide` スキルを呼び出すこと」と記述

### 選択後の長時間作業の継続性

#### 結論: **可能だが注意が必要**

- Claude Code のスキルが読み込まれると、その内容はコンテキストに含まれ続ける
- 長時間の作業（10フェーズ以上のオーケストレーション）では、コンテキストウィンドウの圧迫が問題になる可能性がある
- 自動コンパクション（約95%容量で発動）により、古い情報が圧縮される
- サブエージェントへの委譲により、メインエージェントのコンテキストを節約できる（superpowers の設計思想と同じ）

---

## 調査C: ステアリングによるルール定義と選択的読み込みの実現可能性

### 実現可能性: **条件付き可能**
### 実装の難易度: **中**

### 検証ポイント1: CLAUDE.md のサイズ制限に対して orchestrator-index.md + global-rules.md の内容が収まるか

#### AIDEの構成
- `orchestrator-index.md`（`inclusion: always`）: 約200行（オーケストレーター一覧 + 選択ガイド + 生成ドキュメント一覧）
- `global-rules.md`（`inclusion: always`）: 約200行（フェーズ省略禁止、実作業禁止、敬語ルール、選択肢提示ルール、gitコミットルール、OS判定ルール等）
- 合計: 約400行

#### CLAUDE.md のサイズ制限
- Anthropic公式推奨: 200行以下
- 実務的な上限: 100〜300行（100行を超えるとコンプライアンス低下が報告されている）
- 絶対的な上限: 約300行（これを超えるとClaudeがシグナルを見失う）

#### 結論: **収まらない。圧縮・分割が必要**

#### 対応策

**対応策A: CLAUDE.md を最小限にし、詳細はスキルに委譲（推奨）**

CLAUDE.md（約50〜80行）:
```markdown
# AIDE - AI-Driven Engineering

## 基本原則
- ドキュメント駆動開発。フェーズ省略禁止
- オーケストレーターは読み取り・検索・対話・委譲のみ。実作業禁止
- 質問は1つずつ。選択肢は番号付き。敬語で対応

## オーケストレーター選択
ユーザーのリクエストに応じて適切なスキルを呼び出すこと:
- 企画: planning-orchestrator
- 設計: design-orchestrator
- 実装: impl-orchestrator
- 逆引き: reverse-design-orchestrator
- 変更: change-orchestrator
- バグ修正: bugfix-orchestrator
- リファクタリング: refactoring-orchestrator

## 詳細ルール
@.claude/skills/aide-core/SKILL.md を参照
```

aide-core スキル（global-rules.md の全内容）:
```yaml
---
name: aide-core
description: AIDE framework core rules. Always invoke when using any AIDE orchestrator.
---
（global-rules.md の全内容）
```

**対応策B: `@` インポート構文でファイルを参照**

CLAUDE.md から外部ファイルを参照:
```markdown
@.claude/docs/orchestrator-index.md
@.claude/docs/global-rules.md
```

ただし、`@` インポートされたファイルもコンテキストに含まれるため、サイズ問題は解決しない。

**対応策C: Kiro CLI の場合はステアリングファイルをそのまま使用**

Kiro CLI ではステアリングファイルの `inclusion: always` がネイティブにサポートされているため、CLAUDE.md のサイズ制限は問題にならない。ただし、Kiro CLI のカスタムエージェントではステアリングファイルが自動的に含まれないため、`resources` フィールドで明示的に指定する必要がある:

```json
{
  "resources": ["file://.kiro/steering/**/*.md"]
}
```

### 検証ポイント2: サブエージェント定義にステアリングの全内容を含めた場合のコンテキストサイズ

#### AIDEの構成
- 各サブエージェント定義（agents/*.md）: 50〜200行
- 対応するステアリング（steering/agent-*.md）: 100〜500行（バグ修正オーケストレーターは約500行）
- 合計: 150〜700行/エージェント

#### Claude Code のサブエージェントのコンテキスト
- 各サブエージェントは独立したコンテキストウィンドウで動作
- サブエージェント定義のシステムプロンプト + CLAUDE.md + プロジェクトメモリが読み込まれる
- 自動コンパクション（約95%容量で発動）をサポート

#### 結論: **問題なし**

サブエージェントは独立したコンテキストウィンドウを持つため、700行程度のシステムプロンプトは問題にならない。AIDEの `agents/*.md` と `steering/agent-*.md` を統合してClaude Codeのサブエージェント定義にすることは実用的。

ただし、AIDEのバグ修正オーケストレーター（`agent-bugfix-orchestrator.md`）のように500行以上のステアリングをスキルとして読み込む場合、メインエージェントのコンテキストを圧迫する可能性がある。

### 検証ポイント3: サブエージェントが `skills` フィールドで追加のスキルを読み込む方法

#### Claude Code での実現方法

カスタムサブエージェント定義の `skills` フィールドでスキルを事前ロードできる:

```yaml
---
name: bugfix-analyzer
description: バグの原因箇所を特定し、影響範囲を調査する
tools: Read, Grep, Glob, Bash, Write, Edit
skills: aide-core, bugfix-analysis-guide
---
```

- スキルの全内容がサブエージェントのコンテキストに注入される
- サブエージェントは親の会話からスキルを継承しない（明示的にリストする必要がある）

#### Kiro CLI での実現方法

Kiro CLI のカスタムエージェントでは `resources` フィールドでスキルを指定:

```json
{
  "resources": [
    "skill://.kiro/skills/aide-core/SKILL.md",
    "file://.kiro/steering/agent-bugfix-analyzer.md"
  ]
}
```

#### 結論: **実用的**

両プラットフォームともサブエージェントへのスキル注入をサポートしている。AIDEの「サブエージェントは自分の手順書を読んでから実行する」パターンは、`skills` フィールド（Claude Code）または `resources` フィールド（Kiro CLI）で実現可能。

---

## 調査D: Kiroでできるがsuperpowers/Claude Codeではできないことの洗い出し

### 1. `invokeSubAgent` の名前指定 vs Claude Code の Task ツール

| 観点 | Kiro（AIDE） | Claude Code | 差分 |
|---|---|---|---|
| サブエージェント呼び出し | `invokeSubAgent` で `name` パラメータを指定 | Task ツールで `description` と `prompt` を指定 | Kiroは名前で直接指定、Claude Codeはプロンプトベース |
| カスタムエージェント選択 | `name: bugfix-analyzer` で確実に特定のエージェントを呼び出し | `.claude/agents/bugfix-analyzer.md` を配置し、description に基づいてClaude が自動選択、または明示的に指定 | Claude Codeでも明示的な指定は可能 |
| エージェント定義の参照 | `~/.kiro/agents/` のMarkdownファイル | `.claude/agents/` のMarkdownファイル | ほぼ同等 |

**結論**: 機能的にはほぼ等価。Claude Code でもカスタムサブエージェントを名前で明示的に呼び出すことが可能（公式ドキュメントの "Invoke subagents explicitly" セクション）。

### 2. `userInput` ツール（選択肢付き質問）vs Claude Code の対話機能

| 観点 | Kiro（AIDE） | Claude Code | 差分 |
|---|---|---|---|
| メインエージェントの対話 | `userInput` ツールで選択肢付き質問を提示 | `AskUserQuestion` ツールで質問を提示 | 機能的に同等 |
| 選択肢の提示 | `userInput` で番号付き選択肢をネイティブにサポート | `AskUserQuestion` はフリーテキスト。選択肢はプロンプトで表現 | **Kiroが優位**: ネイティブな選択肢UI |
| サブエージェントからの対話 | サブエージェントが `userInput` を使用可能 | **サブエージェントでは `AskUserQuestion` が利用不可** | **Kiroが大幅に優位**: サブエージェントからの対話が可能 |

**結論**: **重大な差分あり**。Kiroではサブエージェントがユーザーと直接対話できるが、Claude Codeではできない。AIDEのサブエージェントの多くがユーザーとのヒアリングを行うため、この差分は移植時の最大の課題。

### 3. `taskStatus` ツール vs Claude Code のタスク管理

| 観点 | Kiro（AIDE） | Claude Code | 差分 |
|---|---|---|---|
| タスクステータス管理 | `taskStatus` ツールでフェーズ進捗を管理 | `TodoWrite` ツールでTODOリストを管理 | 名称は異なるが機能的に類似 |
| 進捗の可視化 | Kiro IDEのUIでタスクステータスを表示 | Claude Code のTODOリストとして表示 | Kiro IDEの方がリッチなUI |

**結論**: 機能的にはほぼ等価。`TodoWrite` で代替可能。

### 4. ステアリングファイルの `inclusion` 制御 vs Claude Code の設定体系

| 観点 | Kiro（AIDE） | Claude Code | Kiro CLI | 差分 |
|---|---|---|---|---|
| 常時読み込み | `inclusion: always` | CLAUDE.md に記述 | ステアリングファイル（デフォルトで常時読み込み） | 機能的に同等 |
| 手動読み込み | `inclusion: manual` | スキルとして定義（オンデマンド読み込み） | `inclusion: manual` をネイティブサポート | Kiro IDE/CLIが優位: ネイティブサポート |
| ファイルマッチ | `inclusion: fileMatch` で特定ファイル操作時に自動読み込み | サブディレクトリ CLAUDE.md で近似的に実現 | `inclusion: fileMatch` をネイティブサポート | **Kiroが優位**: ファイルパターンに基づく条件付き読み込み |
| サイズ制限 | ステアリングファイルに実質的なサイズ制限なし | CLAUDE.md は100〜200行推奨 | ステアリングファイルに実質的なサイズ制限なし | **Kiroが優位**: 大量のルールを記述可能 |

**結論**: **差分あり**。Kiroの `inclusion: fileMatch` はClaude Codeに直接的な等価機能がない。`inclusion: manual` はClaude Codeのスキルで代替可能だが、Kiroのネイティブサポートの方がシンプル。最大の差分はサイズ制限で、Kiroではステアリングファイルに大量のルールを記述できるが、Claude CodeのCLAUDE.mdは100〜200行が推奨。

### 5. `discloseContext` ツール（スキル読み込み）vs Claude Code の Skill ツール

| 観点 | Kiro（AIDE） | Claude Code | 差分 |
|---|---|---|---|
| スキル読み込み | `discloseContext` でステアリングファイルを読み込み | `Skill` ツールでスキルを読み込み | 機能的に同等 |
| 読み込みタイミング | エージェントが明示的に呼び出し | Claudeが自動的に、またはユーザーが明示的に呼び出し | Claude Codeの方が自動選択が強い |

**結論**: 機能的にほぼ等価。

### 6. `createHook` ツール vs Claude Code の hooks

| 観点 | Kiro（AIDE） | Claude Code | Kiro CLI | 差分 |
|---|---|---|---|---|
| フック定義 | `createHook` ツールで動的にフックを作成 | `.claude/settings.json` の `hooks` セクション、またはサブエージェント定義の `hooks` フィールド | エージェント設定の `hooks` フィールド | Kiroは動的作成が可能、Claude Code/Kiro CLIは静的定義 |
| トリガー種別 | ファイル保存時、ファイル作成時等 | `PreToolUse`, `PostToolUse`, `Notification`, `Stop` | `agentSpawn`, `userPromptSubmit`, `preToolUse`, `postToolUse`, `stop` | トリガーの種類が異なる |
| フックの実行 | Kiro IDEが自動実行 | Claude Code が自動実行 | Kiro CLI が自動実行 | 機能的に同等 |

**結論**: フックの仕組みは各プラットフォームで異なるが、基本的な機能（ツール実行前後のカスタム処理）は共通。Kiro IDEの `createHook` は動的にフックを作成できる点が独自。

### 7. サブエージェントのツール制限

| 観点 | Kiro（AIDE） | Claude Code | Kiro CLI | 差分 |
|---|---|---|---|---|
| ツールホワイトリスト | `tools: ["read", "write", "shell"]` | `tools: Read, Grep, Glob, Write, Edit, Bash` | `"tools": ["read", "write", "shell"]` | 機能的に同等 |
| ツールブラックリスト | 未確認（ホワイトリスト方式が主） | `disallowedTools` フィールド | 未確認 | Claude Codeはブラックリスト方式もサポート |
| ツール設定の粒度 | ツール名レベル | ツール名 + パス制限（`allowedPaths`）+ コマンド制限（`allowedCommands`, `deniedCommands`） | ツール名 + パス制限（`allowedPaths`）+ コマンド制限（`allowedCommands`, `deniedCommands`） | **Claude Code / Kiro CLIが優位**: より細かい粒度の制限が可能 |
| MCP ツールの制限 | 未確認 | `@server_name/tool_name` で個別指定可能 | `@server_name/tool_name` で個別指定可能 | Claude Code / Kiro CLIが優位 |

**結論**: ツール制限の基本機能は同等。Claude Code / Kiro CLI はパスレベル・コマンドレベルの細かい制限が可能で、AIDEの移植時にはより精密な制御が実現できる。

---

## 総合評価: Kiroでできるがsuperpowers/Claude Codeではできないこと

### 致命的な差分（移植時に設計変更が必要）

| # | Kiroの機能 | Claude Codeの状況 | 影響度 | 対応策 |
|---|---|---|---|---|
| 1 | サブエージェントからのユーザー対話 | `AskUserQuestion` がサブエージェントで利用不可 | **致命的** | オーケストレーターが対話を代行し、結果をサブエージェントに渡す |
| 2 | サブエージェントのネスト | サブエージェントからサブエージェントを呼べない | **高** | フラット構造に変更（オーケストレーターが全サブエージェントを直接管理） |

### 重要な差分（回避策あり）

| # | Kiroの機能 | Claude Codeの状況 | 影響度 | 対応策 |
|---|---|---|---|---|
| 3 | ステアリングの `inclusion: always` で大量ルール | CLAUDE.md は100〜200行推奨 | **中** | ルールを圧縮してCLAUDE.mdに記述 + 詳細はスキルに委譲 |
| 4 | ステアリングの `inclusion: fileMatch` | 直接的な等価機能なし | **低** | サブディレクトリ CLAUDE.md で近似的に実現 |
| 5 | `userInput` の選択肢付き質問UI | `AskUserQuestion` はフリーテキスト | **低** | プロンプトで番号付き選択肢を表現（AIDEと同じアプローチ） |

### 差分なし（そのまま移植可能）

| # | 機能 | 備考 |
|---|---|---|
| 6 | サブエージェントの名前指定呼び出し | Claude Code でも明示的な指定が可能 |
| 7 | サブエージェントのツール制限 | `tools` フィールドで同等の制限が可能 |
| 8 | サブエージェントへのスキル注入 | `skills` フィールドで同等の注入が可能 |
| 9 | タスクステータス管理 | `TodoWrite` で代替可能 |
| 10 | フェーズ管理（完了待ち→次フェーズ） | Task ツールのフォアグラウンド実行で実現可能 |

---

## 代替手段の比較

### AIDEのサブエージェント対話パターンの代替

| 方法 | メリット | デメリット | 推奨度 |
|---|---|---|---|
| A: オーケストレーターが対話を代行 | シンプル。メインエージェントの対話機能を活用 | オーケストレーターのコンテキストが増大。対話と作業の分離が不完全 | ★★★★☆ |
| B: 対話フェーズと作業フェーズを分離 | 明確な分離。サブエージェントは作業に集中 | 対話結果のファイル化が必要。フェーズ数が増加 | ★★★★★ |
| C: 将来の修正を待つ | 理想的な解決 | 時期不明。移植を遅延させる | ★☆☆☆☆ |

### CLAUDE.md サイズ問題の代替

| 方法 | メリット | デメリット | 推奨度 |
|---|---|---|---|
| A: 圧縮 + スキル委譲 | CLAUDE.md を小さく保てる | ルールの一部がオンデマンド読み込みになり、見落としリスク | ★★★★★ |
| B: `@` インポート | ファイル分割が可能 | コンテキストサイズは変わらない | ★★★☆☆ |
| C: Kiro CLI を使用 | ステアリングファイルをそのまま使用可能 | Claude Code との互換性がない | ★★★☆☆ |

---

## リスク

### 技術的リスク

1. **AskUserQuestion の修正時期が不明**: サブエージェントでの `AskUserQuestion` 利用不可は複数のGitHub Issueで報告されているが、修正時期は不明。AIDEの移植はこの制約を前提に設計する必要がある
2. **CLAUDE.md のサイズ制限の厳格化**: 将来的にCLAUDE.mdのサイズ制限がより厳格になる可能性がある
3. **スキルの自動選択の精度**: 7つのオーケストレーターの自動選択はClaude の判断に依存するため、誤選択のリスクがある
4. **長時間セッションでのコンテキスト圧迫**: AIDEの設計オーケストレーター（10フェーズ以上）のような長時間セッションでは、コンテキストウィンドウの圧迫が問題になる可能性がある

### ライセンスリスク

- 特になし（Claude Code / Kiro CLI のプラグイン・スキルシステムは無料で利用可能）

### 将来の継続性リスク

1. **Claude Code のサブエージェント機構は安定版**: 基本的な機能は安定しているが、`AskUserQuestion` のサブエージェント対応は未実装
2. **Kiro CLI のカスタムエージェント機構は活発に開発中**: 機能追加が続いており、AIDEの移植に有利な機能が追加される可能性がある
3. **Agent Skills 標準（agentskills.io）**: クロスプラットフォーム互換性が推進されており、将来的にはClaude Code / Kiro CLI / Codex CLI 間でスキルの互換性が向上する可能性がある

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Claude Code 公式: Create custom subagents | https://docs.claude.com/en/docs/claude-code/sub-agents | 2025-07-07 |
| GitHub Issue #12890: AskUserQuestion not available to subagents | https://github.com/anthropics/claude-code/issues/12890 | 2025-07-07 |
| GitHub Issue #34592: AskUserQuestion unavailable in all sub-agent contexts | https://github.com/anthropics/claude-code/issues/34592 | 2025-07-07 |
| GitHub Issue #18721: Missing warning for AskUserQuestion limitation in Subagents | https://github.com/anthropics/claude-code/issues/18721 | 2025-07-07 |
| GitHub Issue #16003: Enable Task tool for subagents with depth limit | https://github.com/anthropics/claude-code/issues/16003 | 2025-07-07 |
| GitHub Issue #6005: Add disallowed-tools to sub-agent frontmatter | https://github.com/anthropics/claude-code/issues/6005 | 2025-07-07 |
| GitHub Issue #43777: Plan mode constraint not propagated to subagents | https://github.com/anthropics/claude-code/issues/43777 | 2025-07-07 |
| Claude Code 公式: Tools reference | https://code.claude.com/docs/en/tools-reference | 2025-07-07 |
| Claude Code 公式: Permission modes | https://code.claude.com/docs/en/permission-modes | 2025-07-07 |
| Kiro CLI: Agent configuration reference | https://kiro.dev/docs/cli/custom-agents/configuration-reference | 2025-07-07 |
| Kiro CLI: Steering | https://kiro.dev/docs/cli/steering/ | 2025-07-07 |
| Kiro CLI: Custom Subagents changelog | https://kiro.dev/changelog/ide/0-9 | 2025-07-07 |
| Kiro CLI: Subagents changelog | https://kiro.dev/changelog/cli/1-23/ | 2025-07-07 |
| turbodocx.com: CLAUDE.md Best Practices | https://www.turbodocx.com/blog/how-to-write-claude-md-best-practices | 2025-07-07 |
| bswen.com: CLAUDE.md Compliance Degradation Past 100 Lines | https://docs.bswen.com/blog/2026-03-20-claude-md-compliance-degradation | 2025-07-07 |
| superpowers: using-superpowers/SKILL.md | ローカルファイル参照 | 2025-07-07 |
| superpowers: subagent-driven-development/SKILL.md | ローカルファイル参照 | 2025-07-07 |
| kiro-agents: steering/orchestrator-index.md | ローカルファイル参照 | 2025-07-07 |
| kiro-agents: steering/global-rules.md | ローカルファイル参照 | 2025-07-07 |
| kiro-agents: steering/agent-bugfix-orchestrator.md | ローカルファイル参照 | 2025-07-07 |
| kiro-agents: agents/bugfix-analyzer.md | ローカルファイル参照 | 2025-07-07 |

Content was rephrased for compliance with licensing restrictions.
