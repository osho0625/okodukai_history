# superpowers コラボレーション系スキル 詳細調査

## 調査概要

| 項目 | 内容 |
|---|---|
| 調査対象 | superpowers skills/ 配下のコラボレーション系5スキル |
| 調査日 | 2025-07-27 |
| 調査の背景 | aide-claude での置き換え設計の基礎資料。poc-framework-analysis.md の skills/ セクション詳細補完 |

## 要約

superpowers のコラボレーション系5スキルは、**ワークフローの開始（worktree）→ 実行中（並列エージェント・コードレビュー）→ 完了（ブランチ統合）** という開発ライフサイクルをカバーする。requesting-code-review と receiving-code-review はペアで機能し、code-reviewer.md というサブエージェント用プロンプトテンプレートを持つ。dispatching-parallel-agents は独立した問題を並列処理するパターンを定義する。aide-claude では、これらの機能は kiro-agents の git-committer / code-review-agent / micro-impl-agent に分散して対応する。

---

## 1. requesting-code-review（コードレビュー依頼）

### ファイル構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `SKILL.md` | 約107行 | レビュー依頼のタイミング・手順・ワークフロー統合 |
| `code-reviewer.md` | 約120行 | サブエージェント用プロンプトテンプレート（レビュー実行者の指示書） |

### SKILL.md セクション構成

| セクション | 概要 |
|---|---|
| frontmatter | name, description（完了時・主要機能実装後・マージ前に使用） |
| 冒頭説明 | superpowers:code-reviewer サブエージェントを派遣してレビューする方針 |
| When to Request Review | Mandatory（タスク完了後・主要機能後・マージ前）/ Optional（行き詰まり時・リファクタ前・複雑バグ修正後） |
| How to Request | git SHA取得 → code-reviewer サブエージェント派遣 → フィードバック対応 |
| Example | Task完了後のレビュー依頼フロー例 |
| Integration with Workflows | subagent-driven-development / executing-plans / Ad-Hoc での使い分け |
| Red Flags | スキップ禁止・Critical/Important 無視禁止・正当な技術的反論は可 |

### code-reviewer.md の構造

サブエージェント（Task ツールで派遣される）が受け取るプロンプトテンプレート。プレースホルダ方式で動的に内容を注入する。

| プレースホルダ | 用途 |
|---|---|
| `{WHAT_WAS_IMPLEMENTED}` | 実装内容の説明 |
| `{PLAN_OR_REQUIREMENTS}` | 要件・計画への参照 |
| `{BASE_SHA}` / `{HEAD_SHA}` | git diff の範囲指定 |
| `{DESCRIPTION}` | 概要説明 |

レビューチェックリスト: Code Quality / Architecture / Testing / Requirements / Production Readiness の5カテゴリ。
出力形式: Strengths → Issues（Critical / Important / Minor）→ Recommendations → Assessment（Ready to merge? Yes/No/With fixes）。

### スキル間参照

- **参照元**: subagent-driven-development（Required workflow skills として参照）
- **参照先**: なし（末端スキル）
- **ペアスキル**: receiving-code-review（レビュー受領側）

---

## 2. receiving-code-review（コードレビュー受領）

### ファイル構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `SKILL.md` | 約210行 | レビューフィードバック受領時の行動規範・技術的評価プロセス |

### SKILL.md セクション構成

| セクション | 概要 |
|---|---|
| frontmatter | name, description（レビュー受領時、特に不明確・技術的に疑問がある場合に使用） |
| Overview | 技術的評価が必要、感情的パフォーマンスは不要 |
| The Response Pattern | READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT の6ステップ |
| Forbidden Responses | 「You're absolutely right!」等の迎合的応答を禁止 |
| Handling Unclear Feedback | 不明確な項目がある場合は全項目の実装を停止し、先に確認 |
| Source-Specific Handling | human partner（信頼・即実装）vs External Reviewers（懐疑的に検証） |
| YAGNI Check | 「proper に実装せよ」→ 実際に使われているか grep で確認 |
| Implementation Order | Blocking → Simple fixes → Complex fixes の順 |
| When To Push Back | 既存機能破壊・コンテキスト不足・YAGNI違反・技術的誤り等 |
| Acknowledging Correct Feedback | 感謝表現禁止、修正内容を事実として述べるのみ |
| Gracefully Correcting Your Pushback | 反論が誤りだった場合の訂正パターン |
| Common Mistakes | 表形式で7パターン |
| Real Examples | 4つの具体例（Performative Agreement / Technical Verification / YAGNI / Unclear Item） |
| GitHub Thread Replies | `gh api` でインラインコメントスレッドに返信する方法 |

### 主要な設計思想

- **技術的厳密さ > 社交的快適さ**: 迎合的応答を明示的に禁止
- **検証ファースト**: 実装前に必ずコードベースで検証
- **YAGNI原則の徹底**: 使われていない機能の「proper な実装」を拒否

### スキル間参照

- **参照元**: なし（明示的な REQUIRED SUB-SKILL 参照はない）
- **参照先**: なし
- **ペアスキル**: requesting-code-review（レビュー依頼側）

---

## 3. finishing-a-development-branch（開発ブランチ完了）

### ファイル構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `SKILL.md` | 約145行 | 開発完了時のテスト検証・統合オプション提示・クリーンアップ |

### SKILL.md セクション構成

| セクション | 概要 |
|---|---|
| frontmatter | name, description（実装完了・テスト通過後の統合判断に使用） |
| Overview | Verify tests → Present options → Execute choice → Clean up |
| Step 1: Verify Tests | テスト失敗時は停止、通過時のみ次へ |
| Step 2: Determine Base Branch | main/master の自動検出またはユーザー確認 |
| Step 3: Present Options | 4択固定: ①ローカルマージ ②PR作成 ③保留 ④破棄 |
| Step 4: Execute Choice | 各オプションの具体的な git/gh コマンド手順 |
| Step 5: Cleanup Worktree | オプション1,4はクリーンアップ、2,3は保持 |
| Quick Reference | オプション別の操作マトリクス表 |
| Common Mistakes | テスト省略・オープンエンド質問・自動クリーンアップ・確認なし破棄 |
| Red Flags | Never/Always リスト |
| Integration | Called by: subagent-driven-development, executing-plans / Pairs with: using-git-worktrees |

### ワークフローチェーンでの位置づけ

**ワークフロー終端スキル**。実装完了後に必ず呼ばれ、ブランチの統合方法を決定する。

```
brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch
                              → executing-plans            → finishing-a-development-branch
```

### スキル間参照

- **参照元（REQUIRED SUB-SKILL）**: executing-plans, subagent-driven-development
- **参照先**: なし（終端スキル）
- **ペアスキル**: using-git-worktrees（worktree のクリーンアップを担当）

---

## 4. dispatching-parallel-agents（並列エージェント派遣）

### ファイル構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `SKILL.md` | 約175行 | 独立した複数タスクを並列サブエージェントで処理するパターン |

### SKILL.md セクション構成

| セクション | 概要 |
|---|---|
| frontmatter | name, description（2+の独立タスクがある場合に使用） |
| Overview | 独立した問題ドメインごとに1エージェントを派遣、並行実行 |
| When to Use | dotグラフによる判断フロー + 使用条件/非使用条件 |
| The Pattern | ①独立ドメイン特定 → ②フォーカスされたタスク作成 → ③並列派遣 → ④レビュー統合 |
| Agent Prompt Structure | 良いプロンプトの3要素: Focused / Self-contained / Specific about output |
| Common Mistakes | 広すぎるスコープ / コンテキスト不足 / 制約なし / 曖昧な出力要求 |
| When NOT to Use | 関連する障害 / 全体コンテキスト必要 / 探索的デバッグ / 共有状態 |
| Real Example from Session | 6テスト失敗を3エージェントで並列解決した実例 |
| Key Benefits | 並列化・集中・独立性・速度 |
| Verification | 統合後の検証手順（サマリー確認・競合チェック・全テスト・スポットチェック） |
| Real-World Impact | 2025-10-03 のデバッグセッション実績 |

### 主要な設計思想

- **問題ドメインの分離**: 各エージェントは1つの問題ドメインのみ担当
- **コンテキスト隔離**: セッション履歴を継承せず、必要な情報のみ構築して渡す
- **統合検証**: 並列結果の競合チェックと全体テストが必須

### スキル間参照

- **参照元**: なし（明示的な REQUIRED SUB-SKILL 参照はない。汎用パターンとして独立）
- **参照先**: なし
- **補足**: subagent-driven-development の「1タスク1サブエージェント」パターンと思想が共通

---

## 5. using-git-worktrees（Git Worktree 使用）

### ファイル構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `SKILL.md` | 約220行 | 隔離されたワークスペースの作成・セットアップ・検証 |

### SKILL.md セクション構成

| セクション | 概要 |
|---|---|
| frontmatter | name, description（機能開発の隔離が必要な場合・実装計画実行前に使用） |
| Overview | git worktree で隔離ワークスペースを作成 |
| Directory Selection Process | 優先順位: ①既存ディレクトリ確認 → ②CLAUDE.md確認 → ③ユーザーに質問 |
| Safety Verification | プロジェクトローカル: .gitignore 確認必須 / グローバル: 不要 |
| Creation Steps | ①プロジェクト名検出 → ②worktree作成 → ③プロジェクトセットアップ → ④テスト検証 → ⑤レポート |
| Quick Reference | 状況別アクション表 |
| Common Mistakes | ignore検証省略 / ディレクトリ位置の仮定 / テスト失敗時の続行 / セットアップコマンドのハードコード |
| Example Workflow | 完全なワークフロー例 |
| Red Flags | Never/Always リスト |
| Integration | Called by: brainstorming(Phase4), subagent-driven-development, executing-plans / Pairs with: finishing-a-development-branch |

### 主要な設計思想

- **安全性ファースト**: worktree ディレクトリが .gitignore に含まれているか必ず検証
- **自動検出**: プロジェクトのビルドツールを自動検出してセットアップ
- **クリーンベースライン**: テスト通過を確認してから作業開始

### ワークフローチェーンでの位置づけ

**ワークフロー開始スキル**。実装作業の前に隔離環境を構築する。

```
using-git-worktrees → [実装作業] → finishing-a-development-branch
```

### スキル間参照

- **参照元**: brainstorming(Phase4), subagent-driven-development(REQUIRED), executing-plans(REQUIRED)
- **参照先**: なし
- **ペアスキル**: finishing-a-development-branch（worktree のクリーンアップを担当）

---

## スキル間参照関係マップ

```
brainstorming (Phase 4)
  └─→ using-git-worktrees ←── subagent-driven-development (REQUIRED)
                           ←── executing-plans (REQUIRED)

subagent-driven-development
  ├─→ using-git-worktrees (REQUIRED)
  ├─→ requesting-code-review (Required workflow skills)
  └─→ finishing-a-development-branch (Required workflow skills)

executing-plans
  ├─→ using-git-worktrees (REQUIRED)
  └─→ finishing-a-development-branch (REQUIRED SUB-SKILL)

requesting-code-review ←→ receiving-code-review (ペア関係、明示的参照なし)

dispatching-parallel-agents (独立、他スキルからの明示的参照なし)
```

---

## aide-claude での対応関係

| superpowers スキル | aide-claude 対応先 | 対応方針 |
|---|---|---|
| requesting-code-review | `code-review-agent` | code-reviewer.md テンプレート方式 → aide-claude の code-review-agent プロンプトに統合 |
| receiving-code-review | オーケストレーター共通ルール | レビュー受領の行動規範は global-rules.md またはオーケストレーター指示に組み込み |
| finishing-a-development-branch | `git-committer` + オーケストレーター | 4択オプション提示はオーケストレーターが担当、git操作は git-committer に委譲 |
| dispatching-parallel-agents | `invokeSubAgent`（並列呼び出し） | Kiro の invokeSubAgent で並列派遣。プロンプト設計パターンは設計ガイドラインに反映 |
| using-git-worktrees | 対応不要（Kiro環境では不要） | Kiro はファイルシステム直接操作のため worktree 隔離は不要。ブランチ管理のみ git-committer で対応 |

### 対応方針の補足

1. **requesting-code-review + code-reviewer.md**: superpowers では Task ツールでサブエージェントを派遣し、code-reviewer.md をプロンプトテンプレートとして使用する。aide-claude では `invokeSubAgent` で code-review-agent を呼び出す形に置き換え。レビューチェックリストと出力形式は code-review-agent のプロンプトに組み込む。

2. **receiving-code-review**: superpowers 固有の文化的要素（感謝表現禁止等）は aide-claude では不要。技術的検証ファーストの原則と YAGNI チェックは global-rules.md に反映可能。

3. **finishing-a-development-branch**: superpowers では worktree クリーンアップが主要機能だが、aide-claude では worktree を使わないため、テスト検証 → 統合オプション提示 → git操作 の流れに簡略化。

4. **dispatching-parallel-agents**: aide-claude の invokeSubAgent は並列呼び出しをサポートしているため、プロンプト設計パターン（Focused / Self-contained / Specific about output）を設計ガイドラインとして取り込む。

5. **using-git-worktrees**: Kiro 環境ではファイルシステムを直接操作するため、git worktree による隔離は不要。ブランチ作成・切り替えのみ git-committer エージェントで対応。

---

## 情報源

| ファイルパス | 確認内容 |
|---|---|
| `references/superpowers/skills/requesting-code-review/SKILL.md` | 全文読み込み |
| `references/superpowers/skills/requesting-code-review/code-reviewer.md` | 全文読み込み |
| `references/superpowers/skills/receiving-code-review/SKILL.md` | 全文読み込み |
| `references/superpowers/skills/finishing-a-development-branch/SKILL.md` | 全文読み込み |
| `references/superpowers/skills/dispatching-parallel-agents/SKILL.md` | 全文読み込み |
| `references/superpowers/skills/using-git-worktrees/SKILL.md` | 全文読み込み |
| `references/superpowers/skills/subagent-driven-development/SKILL.md` (Integration部) | 参照関係の確認 |
| `references/superpowers/skills/executing-plans/SKILL.md` (Step3, Integration部) | 参照関係の確認 |
