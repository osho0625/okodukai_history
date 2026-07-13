# 調査5: サブエージェントにおける AskUserQuestion の制約 — 技術的制限 vs ポリシー的制限

## 要約

サブエージェントで `AskUserQuestion` が使えない問題は、**技術的制限（コードレベルでのフィルタリング）** であり、単なるポリシー的制限ではない。`AskUserQuestion` はサブエージェント生成時にツールリストから明示的に除外されており、`tools:` フィールドに指定しても、`permissionMode` を変更しても回避できない。公式ドキュメントには「フォアグラウンドサブエージェントではパススルーされる」と記載されているが、Issue #34592 の報告によれば実際には動作しない（ドキュメントと実装の不一致）。superpowers プロジェクトは「サブエージェントが質問を返答テキストとして返し、親エージェントが回答して再ディスパッチする」エスカレーションパターンで回避している。v2.1.85 で追加された PreToolUse フックによる `updatedInput` 返却は、ヘッドレス環境向けの新しいワークアラウンドだが、サブエージェント内での直接利用は未確認。

---

## 調査概要

- **調査対象**: Claude Code サブエージェントにおける `AskUserQuestion` ツールの利用制約の詳細
- **調査日**: 2025-07-13
- **調査の背景**: 前回の調査で「サブエージェントでは AskUserQuestion が利用不可」と報告したが、ユーザーから「本当に技術的に不可能なのか、ルールとして制限しているだけなのか」という質問があり、詳細調査が必要になった

---

## 調査結果

### 結論: 技術的制限（コードレベルのフィルタリング）

`AskUserQuestion` がサブエージェントで使えないのは、**Claude Code のソースコード内でサブエージェント生成時にツールリストから明示的にフィルタリングされている**ためである。設定やワークアラウンドで回避する方法は、2025年7月時点では存在しない。

---

### 1. GitHub Issue の最新状況

#### Issue #12890: [BUG] AskUserQuestion tool not available to subagents regardless of configuration
- **ステータス**: オープン（2025年7月時点）
- **報告内容**: カスタムエージェントの `tools:` フィールドに `AskUserQuestion` を明示的に指定しても、サブエージェント起動時にフィルタリングされて利用できない
- **報告者の検証**: `tools: Bash, BashOutput, Read, AskUserQuestion` と指定 → サブエージェントが利用可能なツールを列挙すると `Bash, BashOutput, Read` のみ。`AskUserQuestion` は除外されている
- **リグレッション報告**: v2.0.55 までは動作していたが、v2.0.56 で動作しなくなったとの報告あり
- **報告者のコメント**: 「AskUserQuestion appears to be explicitly filtered out when spawning subagents at the system level, regardless of configuration」
- **Anthropic の公式コメント**: 確認できず（未回答）
- **情報源**: https://github.com/anthropics/claude-code/issues/12890

#### Issue #34592: AskUserQuestion unavailable in all sub-agent contexts despite docs stating foreground pass-through
- **ステータス**: オープン（2025年7月時点）
- **報告内容**: 公式ドキュメントの記載と実装が矛盾している。ドキュメントには「Foreground subagents block the main conversation until complete. Permission prompts and clarifying questions (like AskUserQuestion) are passed through to you.」と記載されているが、実際にはフォアグラウンドサブエージェントでも `AskUserQuestion` は利用不可
- **詳細な検証結果**:
  - Test 1: Agent tool（フォアグラウンド）→ AskUserQuestion は direct tools にも deferred tools にも存在しない。ToolSearch でも見つからない
  - Test 2: Skill with `context: fork` + `tools: AskUserQuestion` → 「AskUserQuestion unavailable — the tool is not provided in the current environment」
  - Test 3: メインセッション（対照実験）→ 正常に動作
- **サブエージェントで欠落しているツール一覧**:
  - `AskUserQuestion` ❌
  - `EnterPlanMode` ❌
  - `ExitPlanMode` ❌
- **リグレッション報告**: v2.1.61 頃までは動作していた可能性あり。v2.1.70 の changelog に「AskUserQuestion performance fix」の記載があり、その時点では機能していた可能性を示唆
- **Claude Code バージョン**: v2.1.76 で確認
- **Anthropic の公式コメント**: 確認できず（未回答）
- **情報源**: https://github.com/anthropics/claude-code/issues/34592

#### Issue #18721: [DOCS] Missing warning and workflow guidance for AskUserQuestion limitation in Subagents
- **ステータス**: オープン（2025年7月時点）
- **報告内容**: ドキュメント改善要求。サブエージェントが `AskUserQuestion` を使えないことの警告と、エスカレーションパターンのワークフローガイダンスが不足している
- **Agent SDK ドキュメントの記載**: 「Subagents: AskUserQuestion is not currently available in subagents spawned via the Task tool.」と明記されている
- **提案されている回避策**: サブエージェントが曖昧さに遭遇した場合、構造化された結果を親エージェントに返し、親エージェントが `AskUserQuestion` でユーザーに確認する「エスカレーションパターン」
- **Anthropic の公式コメント**: 確認できず（未回答）
- **情報源**: https://github.com/anthropics/claude-code/issues/18721

#### 関連 Issue #14786: [Bug] Agent mode missing AskUserQuestion tool availability
- **ステータス**: オープン
- **報告内容**: `--agent` フラグで起動した場合も `AskUserQuestion` が利用できない
- **情報源**: https://github.com/anthropics/claude-code/issues/14786

---

### 2. フォアグラウンド vs バックグラウンドの違い

#### 公式ドキュメントの記載（docs.claude.com）

> Foreground subagents block the main conversation until complete. Permission prompts and clarifying questions (like AskUserQuestion) are passed through to you.

> Background subagents run concurrently while you continue working. [...] If a background subagent needs to ask clarifying questions, that tool call fails but the subagent continues.

#### 実際の動作（Issue #34592 の検証結果に基づく）

| 実行モード | パーミッションプロンプト | AskUserQuestion |
|---|---|---|
| フォアグラウンド | パススルーされる ✅ | **利用不可** ❌（ドキュメントと矛盾） |
| バックグラウンド | 事前承認が必要 | **利用不可** ❌（ドキュメント通り） |

**事実**: フォアグラウンドサブエージェントでは「パーミッションプロンプト」はパススルーされるが、`AskUserQuestion` はツールリスト自体から除外されているため、パススルー以前の問題として利用できない。ドキュメントの「clarifying questions (like AskUserQuestion) are passed through」という記載は、**現在の実装と矛盾している**。

---

### 3. `tools` フィールドでの明示的指定

#### 検証結果（Issue #12890 に基づく）

```yaml
---
name: test-agent
tools: Bash, BashOutput, Read, AskUserQuestion
---
```

上記のように `AskUserQuestion` を明示的に指定しても、**サブエージェント起動時にシステムレベルでフィルタリングされる**。サブエージェントが利用可能なツールを列挙すると、`AskUserQuestion` は含まれない。

**結論**: `tools` フィールドでの明示的指定では回避できない。

---

### 4. `permissionMode` の設定による影響

#### 各モードでの AskUserQuestion の動作

| permissionMode | メインセッション | サブエージェント |
|---|---|---|
| default | ✅ 正常動作 | ❌ ツール自体が存在しない |
| acceptEdits | ✅ 正常動作 | ❌ ツール自体が存在しない |
| auto | ✅ 正常動作 | ❌ ツール自体が存在しない |
| dontAsk | ❌ 空の回答が返る | ❌ ツール自体が存在しない |
| bypassPermissions | ❌ 空の回答が返る（Issue #10400） | ❌ ツール自体が存在しない |

**重要な発見**: `bypassPermissions` モードでは、メインセッションでも `AskUserQuestion` が正常に動作しない。ユーザーにプロンプトを表示せず、空の回答を返して「ユーザーが回答した」と偽る動作が報告されている（Issue #10400）。

**結論**: `permissionMode` の変更では回避できない。問題はパーミッションではなく、ツールリストからの除外にある。

---

### 5. Claude Code 最新バージョン（2025年7月時点）での状況

#### CHANGELOG の AskUserQuestion 関連エントリ

| バージョン | 変更内容 | サブエージェント対応 |
|---|---|---|
| v2.0.55 | AskUserQuestion の auto-submit 改善 | 対応なし |
| v2.1.70 | AskUserQuestion のパフォーマンスリグレッション修正 | 対応なし |
| v2.1.69 | AskUserQuestion の「Other」入力で外部エディタ対応 | 対応なし |
| v2.1.69 | interactive tools が skill の allowed-tools で空回答になるバグ修正 | スキル内の修正のみ |
| v2.1.85 | **PreToolUse フックで AskUserQuestion に `updatedInput` を返却可能に** | ヘッドレス向け（後述） |

#### v2.1.85 の新機能: PreToolUse フックによる AskUserQuestion 応答

CHANGELOG の記載:
> PreToolUse hooks can now satisfy AskUserQuestion by returning updatedInput alongside permissionDecision: "allow", enabling headless integrations that collect answers via their own UI

これは、PreToolUse フックが `AskUserQuestion` の呼び出しをインターセプトし、外部UIで収集した回答を `updatedInput` として返却できる仕組み。**ヘッドレス環境（CI/CD等）向け**の機能であり、サブエージェント内での `AskUserQuestion` 利用を直接解決するものではない。

ただし、理論的には以下のワークアラウンドが考えられる（**未検証**）:
1. サブエージェントの `hooks` フィールドに PreToolUse フックを定義
2. フックが `AskUserQuestion` をインターセプト
3. フックスクリプトが何らかの方法でユーザーに質問し、回答を `updatedInput` として返却

**問題点**: サブエージェントのツールリストに `AskUserQuestion` が存在しないため、そもそもサブエージェントが `AskUserQuestion` を呼び出すことができず、フックが発火しない可能性が高い。

---

### 6. superpowers プロジェクトでの対応

#### subagent-driven-development スキルの仕組み

superpowers の `subagent-driven-development` スキルは、**サブエージェントが直接ユーザーに質問するのではなく、「エスカレーションパターン」を採用**している。

##### implementer-prompt.md の該当部分

```
## Before You Begin

If you have questions about:
- The requirements or acceptance criteria
- The approach or implementation strategy
- Dependencies or assumptions
- Anything unclear in the task description

**Ask them now.** Raise any concerns before starting work.
```

##### 実際の動作メカニズム

1. **サブエージェント（implementer）が質問がある場合**: `AskUserQuestion` ツールは使わない。代わりに、Task ツールの**応答テキスト**として質問を返す
2. **親エージェント（controller）が質問を受け取る**: サブエージェントの応答を読み、質問内容を把握する
3. **親エージェントがユーザーに質問**: 親エージェントは `AskUserQuestion` を使える（メインセッションだから）ので、ユーザーに質問を伝える
4. **回答を含めて再ディスパッチ**: ユーザーの回答を含めた新しいプロンプトでサブエージェントを再起動する

##### SKILL.md のフロー図から抜粋

```
"Implementer subagent asks questions?" [shape=diamond];
"Answer questions, provide context" [shape=box];
→ yes → "Answer questions, provide context"
→ "Dispatch implementer subagent (./implementer-prompt.md)" (再ディスパッチ)
```

##### ステータスコードによる制御

implementer は以下の4つのステータスで応答する:
- **DONE**: 完了。レビューに進む
- **DONE_WITH_CONCERNS**: 完了だが懸念あり
- **NEEDS_CONTEXT**: 情報不足。親エージェントがコンテキストを提供して再ディスパッチ
- **BLOCKED**: 完了不可。親エージェントが判断

**結論**: superpowers は `AskUserQuestion` の制約を認識した上で、「サブエージェントの応答テキスト → 親エージェントが仲介 → 再ディスパッチ」というパターンで回避している。これは `AskUserQuestion` を使わない設計であり、制約の回避ではなく制約を前提とした設計である。

---

### 7. 他のプロジェクトでの回避策

#### jwilger/sdlc プラグインの user-input-protocol スキル

ClaudePluginHub の説明:
> Defines a pattern for subagents (background tasks, delegated agents) to request user input when they cannot directly call AskUserQuestion.

このスキルも superpowers と同様のエスカレーションパターンを採用していると推測される（スキルの詳細内容は取得できなかったが、説明文から判断）。

---

## 技術的制限 vs ポリシー的制限の分析

### 制限の性質

| 観点 | 分析 |
|---|---|
| **実装レベル** | コードレベルでのフィルタリング（サブエージェント生成時にツールリストから除外） |
| **設定での回避** | 不可能（`tools` フィールド、`permissionMode` いずれも効果なし） |
| **ドキュメントとの整合性** | 不整合あり（フォアグラウンドでパススルーされると記載されているが実際は不可） |
| **意図的な設計か** | 意図的と推測される。`EnterPlanMode`, `ExitPlanMode` も同様に除外されており、「メインセッション専用ツール」として分類されている可能性が高い |
| **将来の変更可能性** | 不明。複数のIssueがオープンだがAnthropicからの公式回答なし |

### なぜ技術的制限と判断するか

1. **ツールリストからの除外**: `AskUserQuestion` はサブエージェントのツールリストに含まれない。これは設定で上書きできない
2. **`tools` フィールドの無視**: カスタムエージェント定義で明示的に指定しても除外される
3. **システムレベルのフィルタリング**: Issue #12890 の報告者が「system level」でのフィルタリングと表現
4. **複数バージョンで一貫**: v2.0.56 以降、複数のバージョンで一貫して動作しない

### ポリシー的制限の要素

一方で、以下の点からポリシー的判断が背景にある可能性もある:

1. **v2.0.55 以前は動作していた**: リグレッションとして報告されており、意図的に無効化された可能性
2. **ドキュメントに「パススルー」と記載**: 設計意図としてはパススルーを想定していた可能性
3. **Agent SDK のドキュメントでは明示的に制限を記載**: 「AskUserQuestion is not currently available in subagents spawned via the Task tool」の「currently」は将来の対応を示唆

**総合判断**: 技術的にはコードレベルのフィルタリングだが、その背景にはアーキテクチャ上の設計判断（ポリシー）がある。「技術的に不可能」ではなく「意図的に無効化されている」が正確な表現。

---

## 代替手段

### 1. エスカレーションパターン（推奨）

superpowers が採用している方法。サブエージェントが質問を応答テキストとして返し、親エージェントが仲介する。

**メリット**:
- 現在のClaude Codeで確実に動作する
- superpowers、jwilger/sdlc 等の実績あり
- サブエージェントのコンテキスト分離を維持できる

**デメリット**:
- 質問のたびにサブエージェントを再ディスパッチする必要がある（コスト増）
- 対話のリアルタイム性が失われる
- 親エージェントの実装が複雑になる

### 2. 事前ヒアリング方式

サブエージェント起動前に、親エージェントが必要な情報をすべてヒアリングしてからサブエージェントに渡す。

**メリット**:
- サブエージェントの再ディスパッチが不要
- シンプルな実装

**デメリット**:
- 事前にすべての質問を予測する必要がある
- サブエージェントが作業中に発見した疑問に対応できない

### 3. PreToolUse フック方式（v2.1.85+、未検証）

v2.1.85 で追加された PreToolUse フックの `updatedInput` 機能を活用する方法。

**メリット**:
- フックで外部UIからの回答を注入できる
- ヘッドレス環境でも動作する可能性

**デメリット**:
- サブエージェントのツールリストに `AskUserQuestion` が存在しないため、そもそもフックが発火しない可能性が高い（**未検証**）
- 外部UIの実装が必要
- 実験的な機能

### 4. ファイルベースの質問・回答方式

サブエージェントが質問をファイルに書き出し、親エージェントがファイルを監視して回答を書き込む。

**メリット**:
- サブエージェントの再ディスパッチが不要
- 非同期的な対話が可能

**デメリット**:
- ファイル監視の仕組みが必要
- 実装が複雑
- サブエージェントがファイルの更新を待つ仕組みが必要

---

## リスク

### 技術的リスク

- **ドキュメントと実装の不一致**: 公式ドキュメントには「フォアグラウンドでパススルー」と記載されているが実際は動作しない。将来のバージョンで修正される可能性があるが、時期は不明
- **リグレッションの可能性**: v2.0.55 以前は動作していたとの報告があり、意図しないリグレッションの可能性もある。修正されれば状況が変わる
- **エスカレーションパターンのコスト**: サブエージェントの再ディスパッチはトークンコストが増加する

### 将来の継続性リスク

- 複数のIssue（#12890, #34592, #18721, #14786）がオープンだが、Anthropicからの公式回答がない
- 「currently not available」という表現は将来の対応を示唆するが、ロードマップは不明
- エスカレーションパターンは Claude Code の仕様変更に依存しないため、比較的安定

---

## AIDE への影響と推奨事項

### 現状の制約

AIDEのサブエージェントがユーザーと直接対話する（`AskUserQuestion` を使う）ことは、現在の Claude Code では不可能。

### 推奨アプローチ

**エスカレーションパターンの採用**（superpowers と同じ方式）:

1. サブエージェントのプロンプトに「質問がある場合は応答テキストとして返すこと」を明記
2. サブエージェントの応答にステータスコード（DONE / NEEDS_CONTEXT / BLOCKED 等）を含める
3. オーケストレーター（親エージェント）が `NEEDS_CONTEXT` を検出したら、`AskUserQuestion` でユーザーに質問を仲介
4. ユーザーの回答を含めてサブエージェントを再ディスパッチ

この方式は、superpowers プロジェクトで実績があり、Claude Code の制約を前提とした堅実な設計である。

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| GitHub Issue #12890: AskUserQuestion not available to subagents | https://github.com/anthropics/claude-code/issues/12890 | 2025-07-13 |
| GitHub Issue #34592: AskUserQuestion unavailable in all sub-agent contexts | https://github.com/anthropics/claude-code/issues/34592 | 2025-07-13 |
| GitHub Issue #18721: Missing warning for AskUserQuestion limitation | https://github.com/anthropics/claude-code/issues/18721 | 2025-07-13 |
| GitHub Issue #14786: Agent mode missing AskUserQuestion | https://github.com/anthropics/claude-code/issues/14786 | 2025-07-13 |
| GitHub Issue #10400: AskUserQuestion returns empty with bypass permissions | https://github.com/anthropics/claude-code/issues/10400 | 2025-07-13 |
| GitHub Issue #29547: AskUserQuestion empty in plugin skills | https://github.com/anthropics/claude-code/issues/29547 | 2025-07-13 |
| GitHub Issue #5027: Missing Question Generation in Planning Mode | https://github.com/anthropics/claude-code/issues/5027 | 2025-07-13 |
| Claude Code 公式ドキュメント: Create custom subagents | https://docs.claude.com/en/docs/claude-code/sub-agents | 2025-07-13 |
| Claude Code 公式ドキュメント: Tools reference | https://code.claude.com/docs/en/tools-reference | 2025-07-13 |
| Claude Code CHANGELOG | https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md | 2025-07-13 |
| claudefa.st: All Release Notes (2026) | https://claudefa.st/blog/guide/changelog | 2025-07-13 |
| Piebald-AI: AskUserQuestion tool description | https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-askuserquestion.md | 2025-07-13 |
| ClaudePluginHub: jwilger/sdlc user-input-protocol | https://www.claudepluginhub.com/skills/jwilger-sdlc-sdlc-2/user-input-protocol | 2025-07-13 |
| superpowers: subagent-driven-development/SKILL.md | ローカルファイル参照 | 2025-07-13 |
| superpowers: subagent-driven-development/implementer-prompt.md | ローカルファイル参照 | 2025-07-13 |

Content was rephrased for compliance with licensing restrictions.
