# 共通エージェントを追加する手順

`agents/` 配下の名前付きサブエージェント（`micro-impl-agent`, `design-review-agent`, `code-review-agent`, 各QAレビューアーと同列）を追加する場合の作業手順をまとめる。

機構の説明（共通エージェントとサブエージェント委譲の関係、4ステータス運用の意味等）は本書では扱わない。次を参照。

- 共通エージェントの責務分担と委譲フロー → [第1章 アーキテクチャ](../01-system-platform/00-architecture.md)
- 共通エージェント一覧と中身 → [第2章 04-agents](../02-ai-agent/04-agents/)
- 多段階コードレビューの呼び出し関係 → `skills/multi-stage-code-review/SKILL.md`

本書は「やり方」だけを書く。

## 1. 成果物

1共通エージェント追加で必ず作成・更新するもの:

- 新規: `agents/{agent-name}.md`
- 更新: 呼び出し元スキル（フェーズスキル / 共通スキル）の `Integration` セクション（`Required agents:` に新エージェントを追記）
- 更新: 呼び出し元スキルのメインプロセス（委譲ステップに新エージェント名を記載）
- 必要に応じて新規: 呼び出し元スキル直下のプロンプトテンプレート `{purpose}-prompt.md`
- 更新: `AGENTS.md`（プロジェクトルート）の「カスタムエージェント一覧」表
- 更新: `docs-dev/02-ai-agent/04-agents/` の章責務範囲（一覧・解説は第2章担当）

## 2. 配置先・命名規則

| 項目 | ルール | 例 |
|---|---|---|
| 配置先 | `agents/{agent-name}.md`（フォルダではなく単一ファイル） | `agents/micro-impl-agent.md` |
| エージェント名（ファイル名 = `name`） | 役割を表す小文字ケバブケース。`-agent` または `-reviewer` 等の接尾辞で人格を示す | `micro-impl-agent`, `design-review-agent`, `code-review-agent`, `requirements-qa-agent` |
| QAレビューアー | `{対象}-qa-agent` 形式に統一 | `architecture-qa-agent`, `object-design-qa-agent`, `delta-design-qa-agent`, `final-design-qa-agent` |
| 禁止接尾辞 | `Manager`, `Handler`, `Util` 等の汎用接尾辞は禁止 | ✗ `code-handler` → ✓ `code-review-agent` |

ファイル名と frontmatter の `name` は完全一致させる。プラットフォームによってはこの一致でエージェントを発見する。

## 3. agent.md の必須セクション

`agents/micro-impl-agent.md` が代表例。下記のセクションを **すべて** 持つこと。

### 3-1. frontmatter（必須）

```yaml
---
name: {エージェント名（ファイル名と完全一致）}
description: |
  {このエージェントが何者で、いつ呼び出すべきかを2〜4行で説明する。}
  {呼び出し時に渡すべき入力情報を明示する。}
  Examples: <example>Context: {状況}. user: "{ユーザー発話}" assistant: "{エージェント呼び出し}" <commentary>{委譲理由}</commentary></example>
tools: ["@builtin"]
---
```

`description` は呼び出し側プラットフォームがエージェント選択に使う重要メタデータ。Examples ブロックは Kiro / Claude Code 系で活性化判定に効くため省略しないこと。

`tools` はエージェントが使えるツール群を制限する。基本は `["@builtin"]`、特殊な制限が必要な場合のみ列挙する。

### 3-2. 役割宣言

```markdown
あなたは「{エージェントの役割名}」です。{何に専念するか}に専念します。
{担当外の役割（他エージェントに任せる範囲）}は行いません。
```

エージェントは「人格」を持つため、宣言は1人称・専任宣言の形式で書く。

### 3-3. REQUIRED SUB-SKILL

このエージェントが必ず参照すべき共通スキルを列挙する。`micro-impl-agent` の `aide-powers:impl-coding-standards` 参照が好例。

```markdown
## REQUIRED SUB-SKILL

本エージェントは、タスクを処理する全モードで以下の共通スキルを必ず参照すること:

**aide-powers:{skill-name}** — {何を提供するか}
```

### 3-4. 担当範囲 / 担当外

```markdown
## 担当範囲
- {このエージェントが行うこと}

## 担当外
- {他エージェントに任せること}（{担当エージェント名} の担当）
```

責務境界を明文化することで、呼び出し側が誤った委譲をしないようにする。

### 3-5. 入力

呼び出し元から受け取る情報の一覧を列挙する。

- タスク番号 / タスク内容
- 対象ファイルパス
- 設計参照セクション
- 依存先（既に実装済みの関連クラス / モジュール）
- 開発環境情報
- 実行モード（複数モードを持つ場合）

### 3-6. プロセス（モード別）

複数の実行モードを持つエージェント（`micro-impl-agent` の `implement` / `fix` / `write_test` / `fix_test` / `run_test` 等）の場合、モードごとに `### mode: {mode-name}` のサブセクションでプロセスを書く。

各モード共通で含めるべき要素:

- 入力読み込み（設計書 / プログラム構成書 / 依存先コード）
- 実作業手順（ステップ単位）
- 完了報告フォーマット

### 3-7. 出力

成果物のパスと形式を明記する。`micro-impl-agent` の「実装コード（対象ファイルパスに書き込み）」「テストコード（テストファイルパスに書き込み）」「各モードの完了報告」が好例。

### 3-8. 完了報告フォーマット（4ステータス）

すべてのエージェントは以下の4ステータスのいずれかを返すこと。

| Status | 意味 |
|---|---|
| `DONE` | 完了。後続処理に進める |
| `DONE_WITH_CONCERNS` | 完了したが懸念あり。呼び出し元に判断を求める |
| `NEEDS_CONTEXT` | 入力情報が不足。追加情報を要求する |
| `BLOCKED` | 進行不能。原因と推奨対応を返す |

### 3-9. 行動規範

エージェントが守るルールを箇条書きで列挙する（`micro-impl-agent` の9項目が好例）。最低限以下は含めること。

- 設計書を読まずに作業を始めない
- 1回の呼び出しで変更するファイルを限定する（実装系のみ）
- 担当外作業を勝手に行わない
- 開発環境情報が渡されていない場合は実装を開始せず報告する
- 50 行超のファイルを書く場合は分割書き込み（Write + Append）

## 4. 全体への登録手順（チェックリスト）

新規共通エージェントを aide-powers に組み込むための更新作業。順番に潰すこと。

- [ ] `agents/{agent-name}.md` を作成（§3 の全セクションを満たす）
- [ ] **呼び出し元のスキル**（フェーズスキル / 共通スキル）の `Integration` の `Required agents:` に新エージェントを追記
- [ ] **呼び出し元スキルのメインプロセス**で「{役割}サブエージェントに委譲する。エージェント: `agents/{agent-name}`」と明記
- [ ] 必要なら呼び出し元スキル直下に `{purpose}-prompt.md` を作成（パラメータの渡し方を定義）
- [ ] **`AGENTS.md`**（プロジェクトルート）の「カスタムエージェント一覧」表に新エージェント行を追加
- [ ] `docs-dev/02-ai-agent/04-agents/` に解説ファイルを追加（一覧・中身解説は第2章責務）
- [ ] 50 行超の `agent.md` を書く場合は Write（先頭50行）+ Append（残り）で分割書き込み

ハブスキル（`using-aide-powers` / `aide-powers-guide`）と global-rules.md の更新は **不要**。共通エージェントは Quick Routing の対象外。

## 5. 動作確認手順

- [ ] `setup.bat` / `setup.sh` を再実行し、対象プラットフォームに新エージェントがコピーされたことを目視確認
  - Kiro: `%USERPROFILE%\.kiro\agents\{agent-name}.md` が存在
  - Claude Code: `%USERPROFILE%\.claude\agents\{agent-name}.md` が存在
  - Copilot: `%USERPROFILE%\.copilot\agents\{agent-name}.md` が存在
  - Codex: `%USERPROFILE%\.agents\agents\aide-powers\{agent-name}.md` が存在
- [ ] 該当プラットフォームで新規セッションを開始し、呼び出し元スキルから `invokeSubAgent(name: "{agent-name}", ...)` 等で起動できることを確認
- [ ] frontmatter の `tools` 制限が効いていることを確認（許可外ツールが呼べないこと）
- [ ] エージェントが Status: `DONE` を返した後、呼び出し元スキルが次ステップに進むことを確認
- [ ] エージェントが Status: `BLOCKED` を返したケースの分岐も最低1回は実機確認

## 6. 注意事項・落とし穴

- **共通エージェントとサブエージェント定義の混同**: フェーズスキル内の「プロンプトテンプレート + 任意名のサブエージェント」と、`agents/` 配下の「名前付き共通エージェント」は別物。複数ワークフローで再利用する役割人格のみ `agents/` に置く。1ワークフロー固有なら呼び出し元スキル直下のプロンプトテンプレートで十分。
- **ビルトインエージェントとの混同**: `general-task-execution` や `context-gatherer` はビルトイン。ここに `agents/{agent-name}.md` の frontmatter は適用されない（プロジェクトルート `AGENTS.md` 参照）。新エージェントを呼ぶ際は必ず `name: "{agent-name}"` を直接指定する。
- **責務分担の重複禁止**: 既存エージェントと役割が被るものを追加しない（例: `code-review-agent` がいるのに `quality-checker-agent` を作る等）。役割境界は `agents/` の Overview と「担当外」セクションで吸収する。
- **`tools` の絞りすぎ**: ファイル書き込みが必要なエージェントから Write 系ツールを除外すると `BLOCKED` を量産する。実装系は `["@builtin"]` を基本とし、レビュー専任のみ読み取り系に限定する。
- **`AGENTS.md` の同期忘れ**: ルートの `AGENTS.md` は呼び出し時の name 指定ルールを定義している。一覧表を更新しないと、AI Agent が新エージェントを発見できないか、誤って `general-task-execution` で呼んでしまう。
- **設計書を読まずに作業させる構造**: 入力欄に設計書ファイルパスを含めず呼ぶと、エージェントが設計書を読まずに作業し、後続のレビューで FAIL を量産する。呼び出し元スキルのプロンプトテンプレートで設計書パス受け渡しを必ず定義する。
- **第2章のドキュメント**: エージェントの責務解説は第2章。本書（第3章）に解説を書かない。
