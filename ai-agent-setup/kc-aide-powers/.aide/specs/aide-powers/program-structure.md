# プログラム構成書 — aide-powers

## プロジェクト概要

aide-powers は **AIエージェントにドキュメント駆動開発を教えるフレームワーク**である。「AI-Driven Engineering」の略で、要件確認 → 設計 → 実装 → レビューという規律ある工学的プロセスを AIエージェントに踏ませることを目的とする。

本プロジェクトはPythonアプリケーションではなく、**AIエージェント用のスキル・エージェント・ステアリング・ルールの集合体**であり、複数のAIプラットフォーム（Kiro IDE/CLI、Claude Code、GitHub Copilot、Gemini CLI、Cursor、Codex）で動作する。

### 7つのワークフロー

| ワークフロー | 用途 | フェーズスキル接頭辞 |
|---|---|---|
| 企画 (planning) | アイデア段階の構造化 | `fs-planning-phase*` |
| 設計 (design) | 要件→設計書の作成 | `fs-design-phase*` |
| 実装 (impl) | 設計書→コードの実装 | `fs-impl-phase*` |
| 設計逆引き (reverse) | 既存コードから設計書復元 | `fs-reverse-phase*` |
| 変更 (change) | 既存コードの仕様変更 | `fs-change-phase*` |
| リファクタリング (refactoring) | 内部構造改善 | `fs-refactoring-phase*` |
| バグ修正 (bugfix) | 不具合の修正 | `fs-bugfix-phase*` |

---

## フォルダ構成ツリー

git管理対象ファイルのみを記載（`.kiro/`, `.aide/tmp/`, `.aide/references/`, `.venv/`, `temp/` はgitignore対象のため除外）。

```
aide-claude/                          # プロジェクトルート
├── agents/                           # エージェント定義
│   ├── kiro/                         # Kiro IDE / Kiro CLI 用定義
│   │   ├── prompts/                  # サブエージェント用プロンプト（Kiro版）
│   │   │   ├── architecture-qa-agent-prompt.md
│   │   │   ├── code-review-agent-prompt.md
│   │   │   ├── delta-design-qa-agent-prompt.md
│   │   │   ├── design-review-agent-prompt.md
│   │   │   ├── final-design-audit-agent-prompt.md
│   │   │   ├── final-design-qa-agent-prompt.md
│   │   │   ├── manual-test-review-agent-prompt.md
│   │   │   ├── micro-impl-agent-prompt.md
│   │   │   ├── object-design-qa-agent-prompt.md
│   │   │   ├── progress-final-checker-prompt.md
│   │   │   ├── progress-updater-prompt.md
│   │   │   ├── requirements-qa-agent-prompt.md
│   │   │   └── test-coverage-audit-agent-prompt.md
│   │   ├── architecture-qa-agent.json
│   │   ├── architecture-qa-agent.md
│   │   ├── code-review-agent.json
│   │   ├── code-review-agent.md
│   │   ├── delta-design-qa-agent.json
│   │   ├── delta-design-qa-agent.md
│   │   ├── design-review-agent.json
│   │   ├── design-review-agent.md
│   │   ├── final-design-audit-agent.json
│   │   ├── final-design-audit-agent.md
│   │   ├── final-design-qa-agent.json
│   │   ├── final-design-qa-agent.md
│   │   ├── manual-test-review-agent.json
│   │   ├── manual-test-review-agent.md
│   │   ├── micro-impl-agent.json
│   │   ├── micro-impl-agent.md
│   │   ├── object-design-qa-agent.json
│   │   ├── object-design-qa-agent.md
│   │   ├── progress-final-checker.json
│   │   ├── progress-final-checker.md
│   │   ├── progress-updater.json
│   │   ├── progress-updater.md
│   │   ├── requirements-qa-agent.json
│   │   ├── requirements-qa-agent.md
│   │   ├── test-coverage-audit-agent.json
│   │   └── test-coverage-audit-agent.md
│   ├── architecture-qa-agent.md
│   ├── code-review-agent.md
│   ├── delta-design-qa-agent.md
│   ├── design-review-agent.md
│   ├── final-design-audit-agent.md
│   ├── final-design-qa-agent.md
│   ├── manual-test-review-agent.md
│   ├── micro-impl-agent.md
│   ├── object-design-qa-agent.md
│   ├── progress-final-checker.md
│   ├── progress-updater.md
│   ├── requirements-qa-agent.md
│   └── test-coverage-audit-agent.md
├── skills/                           # スキル定義（78フォルダ）
│   ├── using-aide-powers/            # ハブスキル（エントリポイント）
│   │   ├── SKILL.md
│   │   └── references/              # ツールマップ・ルール・バージョン等
│   │       ├── version.json
│   │       ├── global-rules.md
│   │       ├── phase-skill-rules.md
│   │       ├── progress-file-format.md
│   │       ├── common-skill-catalog.md
│   │       ├── kiro-ide-tools.md
│   │       ├── kiro-cli-tools.md
│   │       ├── copilot-tools.md
│   │       ├── vscode-copilot-tools.md
│   │       ├── codex-tools.md
│   │       └── gemini-tools.md
│   ├── fs-planning-phase{1-4}-*/     # 企画WF（4フェーズ）
│   ├── fs-design-phase{1-11}-*/      # 設計WF（11フェーズ）
│   ├── fs-impl-phase{1-7}-*/         # 実装WF（7フェーズ）
│   ├── fs-reverse-phase{1-6}-*/      # 逆引きWF（6フェーズ）
│   ├── fs-change-phase{1-3}-*/       # 変更WF（3フェーズ）
│   ├── fs-bugfix-phase{1-3}-*/       # バグ修正WF（3フェーズ）
│   ├── fs-refactoring-phase{1-7}-*/  # リファクタリングWF（7フェーズ）
│   └── [共通スキル 36個]             # git-commit-workflow, task-orchestration 等
├── steering/                         # ステアリングファイル（セットアップ配布元）
│   └── aide-powers-bootstrap.md      # ブートストラップ（inclusion: always）
├── rules/                            # プラットフォーム固有ルール
│   ├── aide-powers-bootstrap.md      # Claude Code 用
│   └── aide-powers-bootstrap.mdc     # Cursor 用
├── instructions/                     # GitHub Copilot 用
│   └── aide-powers-bootstrap.instructions.md
├── .apm/                             # APM パッケージリソース
│   └── instructions/                 # APM 配布用 instructions ソース
│       ├── aide-powers-bootstrap.instructions.md
│       ├── aide-powers-global-rules.instructions.md
│       └── aide-powers-phase-skill-rules.instructions.md
├── hooks/                            # セッションフック（Claude Code / Copilot CLI / VSCode Copilot）
│   ├── hooks.json                    # フック設定（SessionStart トリガー）
│   ├── brainstorm-selection.json     # ブレインストーム選択フック
│   ├── run-hook.cmd                  # フック実行スクリプト（Windows）
│   └── session-start                 # セッション開始フック本体（bash）
├── docs/                             # ユーザー向けドキュメント
│   ├── 01-about.md
│   ├── 02-getting-started.md
│   ├── 03-usage.md
│   ├── 04-faq.md
│   ├── 05-troubleshooting.md
│   └── kiro-cli-custom-agent.md
├── docs-dev/                         # 開発者向け内部設計ドキュメント
│   ├── 00-overview.md
│   ├── 01-system-platform/           # プラットフォーム層設計
│   │   ├── 00-architecture.md
│   │   ├── 01-hub-skill-activation.md
│   │   ├── 02-multiplatform.md
│   │   ├── 03-platform-bootstrap/   # 各プラットフォームブートストラップ
│   │   │   ├── README.md
│   │   │   ├── kiro.md
│   │   │   ├── claude-code.md
│   │   │   ├── copilot.md
│   │   │   ├── cursor.md
│   │   │   ├── gemini.md
│   │   │   ├── codex.md
│   │   │   └── opencode.md
│   │   ├── 04-skill-map.md
│   │   ├── 05-dynamic-rules.md
│   │   └── 06-execution-units.md
│   ├── 02-ai-agent/                  # AIエージェント層設計
│   │   ├── 00-overview.md
│   │   ├── 01-workflows/            # 7ワークフロー設計
│   │   │   ├── 00-overview.md
│   │   │   ├── 01-planning.md
│   │   │   ├── 02-design.md
│   │   │   ├── 03-impl.md
│   │   │   ├── 04-reverse.md
│   │   │   ├── 05-change.md
│   │   │   ├── 06-bugfix.md
│   │   │   └── 07-refactoring.md
│   │   ├── 02-phase-skills/         # フェーズスキル設計
│   │   │   ├── 00-overview.md
│   │   │   ├── planning.md
│   │   │   ├── design.md
│   │   │   ├── impl.md
│   │   │   ├── reverse.md
│   │   │   ├── change.md
│   │   │   ├── bugfix.md
│   │   │   └── refactoring.md
│   │   ├── 03-common-skills/        # 共通スキル設計
│   │   │   ├── 00-overview.md
│   │   │   ├── design.md
│   │   │   ├── impl.md
│   │   │   └── infrastructure.md
│   │   └── 04-agents/               # エージェント設計
│   │       ├── 00-overview.md
│   │       ├── implementation-agents.md
│   │       └── qa-agents.md
│   └── 03-how-to/                    # 拡張ガイド
│       ├── add-agent.md
│       ├── add-common-skill.md
│       ├── add-phase-skill.md
│       ├── add-workflow.md
│       └── release.md
├── .claude-plugin/                   # VSCode Agent Plugin（Claude Code用）
│   ├── marketplace.json
│   └── plugin.json
├── .claude/                          # Claude Code ワークスペース設定
│   └── rules/
│       └── aide-powers-bootstrap.md  # ワークスペース用ブートストラップ
├── .codex/                           # Codex用設定
│   └── INSTALL.md
├── .github/                          # GitHub Copilot CLI ワークスペース版
│   ├── hooks/                        # フック（hooks/ のミラー）
│   │   ├── brainstorm-selection.json
│   │   ├── hooks.json
│   │   ├── run-hook.cmd
│   │   └── session-start
│   ├── instructions/                 # instructions（ワークスペース版）
│   │   ├── aide-powers-bootstrap.instructions.md
│   │   └── aide-powers-global-rules.instructions.md
│   └── skills/                       # 共通スキル + ハブスキル（37フォルダ、フェーズスキル除外）
│       ├── aide-powers-guide/
│       ├── code-quality-review/
│       ├── ... （共通スキル36 + using-aide-powers）
│       └── visual-companion/
├── .aide/                            # aide-powers 作業領域
│   ├── specs/                        # 設計書・進捗（git管理対象）
│   └── prompts/                      # プロンプト（git管理対象）
├── .gitattributes                    # git属性設定（bat ファイルの -text diff）
├── .gitignore
├── LICENSE                           # ライセンスファイル
├── setup.bat                         # グローバルインストール（Windows）
├── setup.sh                          # グローバルインストール（macOS/Linux）
├── setup-local.bat                   # ローカルインストール（Windows）
├── setup-local.sh                    # ローカルインストール（macOS/Linux）
├── apm.yml                           # APM パッケージ定義（targets + メタデータ）
├── cleanup-kiro-agent.bat            # 旧kiro-agentクリーンアップ（Windows）
├── cleanup-kiro-agent.sh             # 旧kiro-agentクリーンアップ（macOS/Linux）
├── gemini-extension.json             # Gemini CLI エクステンション定義
├── GEMINI.md                         # Gemini CLI コンテキストファイル
├── aide-powers-global-rules.agents.md # OpenCode / Codex 用グローバルルール
└── README.md
```

---

## 各フォルダの役割

### `skills/` — スキル定義

aide-powers の中核。各スキルは独立したフォルダで、`SKILL.md` が本体。

| カテゴリ | 命名パターン | 例 | 役割 |
|---|---|---|---|
| ハブスキル | `using-aide-powers` | — | 全ワークフローのエントリポイント |
| フェーズスキル | `fs-{WF名}-phase{N}-{説明}` | `fs-design-phase1-user-req` | ワークフロー内の各フェーズ処理 |
| 共通スキル | 自由命名 | `git-commit-workflow`, `task-orchestration` | 横断的に使われるユーティリティ |

スキルの内部構造:
```
skills/{スキル名}/
├── SKILL.md          # スキル本体（activate で読み込まれる）
├── *-prompt.md       # サブエージェント用プロンプト（オプション）
├── *-process.md      # プロセス定義ファイル（オプション: 異常系・分岐プロセス等）
├── references/       # 参照ファイル群（オプション: ツールマップ等）
└── scripts/          # 実行スクリプト群（オプション: visual-companion 等）
```

### `agents/` — エージェント定義

サブエージェントとして呼び出されるAIの定義。13種類のエージェントが存在する。

#### `agents/kiro/prompts/` — Kiro用プロンプトファイル

Kiro CLI の JSON 定義（`"prompt": "file://./prompts/xxx-prompt.md"`）から参照されるサブエージェント用プロンプト。各エージェントごとに1つのプロンプトファイルが存在し、エージェントの詳細な振る舞い指示を含む。Kiro IDE では `.md` ファイルのフロントマター以降の本文がプロンプトとして使用されるため、`prompts/` は主に Kiro CLI 用。

| エージェント名 | 役割 |
|---|---|
| `micro-impl-agent` | マイクロ実装（1タスク1ファイル専任） |
| `code-review-agent` | コード品質レビュー（内部品質） |
| `design-review-agent` | 設計準拠レビュー（設計書との整合性） |
| `architecture-qa-agent` | アーキテクチャQA |
| `object-design-qa-agent` | オブジェクト設計QA |
| `delta-design-qa-agent` | 差分設計QA |
| `final-design-qa-agent` | 最終設計QA |
| `final-design-audit-agent` | 最終設計監査（横断監査） |
| `requirements-qa-agent` | 要件定義QA |
| `manual-test-review-agent` | 動作確認試験書 品質レビュー |
| `test-coverage-audit-agent` | テストカバレッジ監査 |
| `progress-updater` | 進捗ファイル更新 |
| `progress-final-checker` | 進捗最終チェック |

### `steering/` — ステアリングファイル

AIのコンテキストに注入される指示文書。`inclusion: manual` で手動注入を制御。

### `.github/` — GitHub Copilot CLI ワークスペース版

Copilot CLI がワークスペースレベルで認識するディレクトリ構造。`setup-local.bat` が配置する。
- `.github/hooks/` — フックファイル（`hooks/` のミラー）
- `.github/instructions/` — ブートストラップ + グローバルルール（ワークスペース版）
- `.github/skills/` — 共通スキル + ハブスキルのみ配置（フェーズスキルは含まない、37フォルダ）

### `.claude/` — Claude Code ワークスペース設定

Claude Code がワークスペースレベルで認識するルール。`setup-local.bat` が配置する。
- `.claude/rules/aide-powers-bootstrap.md` — ワークスペース用ブートストラップルール

### `rules/` — ルールファイル

プラットフォーム固有のブートストラップルール。

### `hooks/` — フック定義

Claude Code / Copilot CLI / VSCode Copilot のセッションフックやイベントトリガー。

### `docs/` — ユーザー向けドキュメント

aide-powers の利用者向け説明書。

### `docs-dev/` — 開発者向けドキュメント

aide-powers 自体の開発に携わる人向けの内部設計文書。3層構造:
1. `01-system-platform/` — プラットフォーム層（ブートストラップ・マルチプラットフォーム対応）
2. `02-ai-agent/` — AIエージェント層（ワークフロー・スキル・エージェント設計）
3. `03-how-to/` — 拡張ガイド（スキル/エージェント/ワークフローの追加方法）

---

## エントリポイント（起動メカニズム）

aide-powers の起動は**プラットフォームのルール/ステアリング機構 → ハブスキル → フェーズスキル**の連鎖で実現される。

### 起動フロー

```
[ユーザー発話]
    ↓
[プラットフォームブートストラップ]
│  ├── Kiro IDE: .kiro/steering/aide-powers-bootstrap.md（自動読み込み）
│  ├── Claude Code: rules/aide-powers-bootstrap.md
│  ├── Cursor: rules/aide-powers-bootstrap.mdc
│  ├── Copilot: instructions/aide-powers-bootstrap.instructions.md
│  ├── Gemini: GEMINI.md（gemini-extension.json で指定）
│  └── Codex: .codex/INSTALL.md
│  → 「開発リクエストなら using-aide-powers を activate せよ」
    ↓
[using-aide-powers スキル activate]
│  → ワークフロー選択・フェーズ進行制御
    ↓
[fs-{WF}-phase{N}-* スキル activate]（順次実行）
│  → 各フェーズの具体的処理
    ↓
[サブエージェント invoke]（必要に応じて）
│  → micro-impl-agent / code-review-agent / design-review-agent 等
    ↓
[共通スキル activate]（横断処理）
   → git-commit-workflow / task-orchestration / session-handover 等
```

### ハブスキル `using-aide-powers` の役割

- ワークフローの自動選択（ユーザー発話から判定）
- `progress-resume-check` による中断再開判定
- フェーズスキルの順次 activate 指示
- `references/` 配下でプラットフォーム別ツールマップを提供

---

## エージェント定義の構成（プラットフォーム差異）

### Kiro IDE と Kiro CLI のエージェント定義形式の違い

#### Kiro IDE — フロントマター付き Markdown

`agents/kiro/*.md` に配置。`invoke_sub_agent` で呼び出される。

```markdown
---
name: code-review-agent
description: |
  コード品質レビューエージェント。...
  Examples: <example>...</example>
tools: ["@builtin"]
---

あなたは「コード品質レビューエージェント」です。...
```

#### Kiro CLI — JSON定義 + Markdown参照

`agents/kiro/*.json` に配置。`subagent` コマンドで呼び出される。

```json
{
  "name": "code-review-agent",
  "description": "コード品質レビューエージェント。...",
  "prompt": "file://./prompts/code-review-agent-prompt.md",
  "tools": ["@builtin"],
  "allowedTools": ["@builtin"]
}
```

JSON の `"prompt": "file://./prompts/code-review-agent-prompt.md"` で `prompts/` 配下の Markdown を参照する。

#### Claude Code — Markdown（フロントマター付き、`agents/` ルート）

`agents/*.md` に配置。`subagent` コマンドで呼び出される。Kiro とは異なり `agents/` 直下。

```markdown
---
name: code-review-agent
description: |
  コード品質レビューエージェント。...
---

あなたは「コード品質レビューエージェント」です。...
```

### セットアップスクリプトによるデプロイ

`setup.bat` が `agents/kiro/` 全体を `~/.kiro/agents/` にコピーすることで、Kiro IDE/CLI にエージェントを登録する。

```
[リポジトリ] agents/kiro/        →  [インストール先] ~/.kiro/agents/
[リポジトリ] agents/*.md          →  [インストール先] ~/.claude/agents/ (Claude Code)
[リポジトリ] skills/              →  [インストール先] ~/.kiro/skills/ / ~/.claude/skills/
[リポジトリ] steering/*.md        →  [インストール先] ~/.kiro/steering/
```

---

## ファイル命名規則

| 対象 | パターン | 例 |
|---|---|---|
| フェーズスキルフォルダ | `fs-{WF}-phase{N}-{英語説明}` | `fs-design-phase1-user-req` |
| スキル本体 | `SKILL.md`（固定） | — |
| サブエージェントプロンプト | `{役割}-prompt.md` | `bugfix-analyzer-prompt.md` |
| エージェント定義（Claude Code） | `{エージェント名}.md` | `code-review-agent.md` |
| エージェント定義（Kiro CLI） | `{エージェント名}.json` + `{エージェント名}.md` | — |
| ブートストラップルール | `aide-powers-bootstrap.{拡張子}` | `.md` / `.mdc` / `.instructions.md` |
| ツールマップ | `{プラットフォーム}-tools.md` | `kiro-ide-tools.md` |
| フェーズスキルルール | `aide-powers-phase-skill-rules.md` | — |
| グローバルルール | `aide-powers-global-rules.md` | — |

---

## 設定ファイルの概要

| ファイル | 用途 |
|---|---|
| `gemini-extension.json` | Gemini CLI エクステンション定義。`contextFileName` で `GEMINI.md` を指定 |
| `.claude-plugin/plugin.json` | VSCode Agent Plugin 定義（Claude Code 用） |
| `.claude-plugin/marketplace.json` | マーケットプレイス表示情報 |
| `hooks/hooks.json` | フック設定（Claude Code / Copilot CLI / VSCode Copilot） |
| `setup.bat` / `setup.sh` | グローバルインストールスクリプト（全プラットフォーム対応） |
| `setup-local.bat` / `setup-local.sh` | ワークスペースローカルインストール |
| `skills/using-aide-powers/references/version.json` | aide-powers バージョン情報 |
| `skills/using-aide-powers/references/progress-file-format.md` | 進捗ファイルフォーマット定義 |
| `apm.yml` | APM パッケージ定義。メタデータ（name, version, description, author, keywords）と targets セクション（APM 配置対象プラットフォーム宣言）を定義 |
| `LICENSE` | ライセンス定義 |
| `.vscode/settings.json` | VSCode ワークスペース設定 |

---

## マルチプラットフォーム対応の仕組み

aide-powers は以下のメカニズムでプラットフォーム差異を吸収する:

1. **ブートストラップ層**: 各プラットフォーム固有の形式でエントリポイントを提供
2. **ツールマップ**: `skills/using-aide-powers/references/{platform}-tools.md` でツール名の変換テーブルを提供
3. **セットアップスクリプト**: `setup.bat`/`setup.sh` が各プラットフォームの正しいディレクトリにファイルをコピー
4. **スキル/エージェント本体は共通**: Markdown で記述されたロジックはプラットフォーム非依存

### 対応プラットフォーム一覧

| プラットフォーム | ブートストラップ形式 | エージェント呼出 | インストール先 |
|---|---|---|---|
| Kiro IDE | steering（自動注入） | `invoke_sub_agent` | `~/.kiro/` |
| Kiro CLI | steering + JSON agents | `subagent` | `~/.kiro/` |
| Claude Code | rules + hooks | `subagent` | `~/.claude/` |
| GitHub Copilot CLI | instructions | サブエージェント | `~/.copilot/` |
| VSCode Copilot | plugin + instructions | サブエージェント | `%APPDATA%\Code\agentPlugins\aide-powers\` |
| Cursor | .mdc rules | — | `~/.cursor/rules/` |
| Gemini CLI | extension + GEMINI.md | — | `gemini extensions link .`（リポジトリ直接参照） |
| Codex | INSTALL.md | — | `~/.agents/` |

---

## 配布マッピング表（setup.bat 準拠）

各リポジトリファイル/ディレクトリが、どのプラットフォームにどのパスで配布されるかの完全対応表。
`setup.bat` / `setup.sh` の実装に基づく（2026-06-16時点）。

### 凡例

- ✅ = 配布される
- — = 配布されない
- 「配布先パス」はインストール先のフルパスを記載

### `skills/`（全78スキルフォルダ一式）

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Kiro IDE / CLI | ✅ | `~/.kiro/skills/` |
| Claude Code | ✅ | `~/.claude/skills/` |
| Copilot CLI | ✅ | `~/.copilot/skills/` |
| VSCode Copilot | ✅ | `%APPDATA%\Code\agentPlugins\aide-powers\skills\` |
| Cursor | — | — |
| Gemini CLI | ✅ | リポジトリ直接参照（`gemini extensions link .`） |
| Codex | ✅ | `~/.agents/skills/aide-powers/` |

### `agents/`（ルート直下の13 Markdown）

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Kiro IDE / CLI | — | ※ `agents/kiro/` を使用（後述） |
| Claude Code | ✅ | `~/.claude/agents/` |
| Copilot CLI | ✅ | `~/.copilot/agents/` |
| VSCode Copilot | ✅ | `%APPDATA%\Code\agentPlugins\aide-powers\agents\` |
| Cursor | — | — |
| Gemini CLI | ✅ | リポジトリ直接参照 |
| Codex | ✅ | `~/.agents/agents/aide-powers/` |

### `agents/kiro/*.md`（フロントマター付きMarkdown、13エージェント分）

Kiro IDE の `invoke_sub_agent` がサブエージェント定義として読み込むファイル。

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Kiro IDE | ✅ | `~/.kiro/agents/*.md` |
| Kiro CLI | — | CLIはMDを直接読まない（JSONの `prompt` 経由で参照する） |
| 他プラットフォーム | — | — |

### `agents/kiro/*.json`（JSON定義、13エージェント分）

Kiro CLI の `subagent` がサブエージェント定義として読み込むファイル。`"prompt": "file://./prompts/xxx-prompt.md"` で同ディレクトリの `prompts/` 配下のMDを参照する。

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Kiro CLI | ✅ | `~/.kiro/agents/*.json` |
| Kiro IDE | — | IDEはJSONを読まない（MDのフロントマターを直接使用する） |
| 他プラットフォーム | — | — |

> **注意**: setup.bat は `agents/kiro/` を丸ごと `~/.kiro/agents/` にコピーするため、実際にはMD・JSON・prompts/ すべてが配置される。IDE は `.md` のみ、CLI は `.json` + `prompts/*.md` をランタイムで使用する。

### `steering/aide-powers-bootstrap.md`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Kiro IDE / CLI | ✅ | `~/.kiro/steering/aide-powers-bootstrap.md` |
| 他プラットフォーム | — | — |

### `rules/aide-powers-bootstrap.md`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Claude Code | ✅ | `~/.claude/rules/aide-powers-bootstrap.md` |
| 他プラットフォーム | — | — |

### `rules/aide-powers-bootstrap.mdc`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Cursor | ✅ | `~/.cursor/rules/aide-powers-bootstrap.mdc` |
| 他プラットフォーム | — | — |

### `instructions/aide-powers-bootstrap.instructions.md`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Copilot CLI | ✅ | `~/.copilot/instructions/aide-powers-bootstrap.instructions.md` |
| VSCode Copilot | ✅ | `%APPDATA%\Code\User\prompts\aide-powers-bootstrap.instructions.md` |
| 他プラットフォーム | — | — |

### `hooks/`（hooks.json, brainstorm-selection.json, run-hook.cmd, session-start）

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Claude Code | ✅ | `~/.claude/hooks/` |
| VSCode Copilot | ✅ | `%APPDATA%\Code\agentPlugins\aide-powers\hooks\` |
| 他プラットフォーム | — | — |

### `.claude-plugin/`（marketplace.json, plugin.json）

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| VSCode Copilot | ✅ | `%APPDATA%\Code\agentPlugins\aide-powers\.claude-plugin\` |
| 他プラットフォーム | — | — |

### `gemini-extension.json` + `GEMINI.md`

| プラットフォーム | 配布 | 使い方 |
|---|---|---|
| Gemini CLI | ✅ | リポジトリルートで `gemini extensions link .` 実行（コピーではなくシンボリックリンク相当） |
| 他プラットフォーム | — | — |

### `.codex/INSTALL.md`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| Codex | — | git管理されるがsetup.batでは配布しない。Codex自身が `.codex/` を自動認識する |
| 他プラットフォーム | — | — |

### `aide-powers-global-rules.agents.md`

| プラットフォーム | 配布 | 配布先パス |
|---|---|---|
| OpenCode / Codex | — | git管理されるがsetup.batでは配布しない。プロジェクトルートに存在することで自動認識される（AGENTS.md互換） |
| 他プラットフォーム | — | — |

### 配布されないファイル（開発・管理用）

| ファイル | 用途 |
|---|---|
| `docs/` | ユーザー向けドキュメント（リポジトリ内参照のみ） |
| `docs-dev/` | 開発者向け内部設計書（リポジトリ内参照のみ） |
| `.aide/specs/` | aide-powers作業成果物（リポジトリ内管理のみ） |
| `.aide/prompts/` | プロンプト（リポジトリ内管理のみ） |
| `setup.bat` / `setup.sh` | セットアップスクリプト本体（実行するだけで配布対象ではない） |
| `setup-local.bat` / `setup-local.sh` | ローカルセットアップ本体 |
| `cleanup-kiro-agent.bat` / `cleanup-kiro-agent.sh` | 移行ツール |
| `.gitattributes` | git属性設定（bat ファイルの -text diff） |
| `.gitignore` | git設定 |
| `README.md` | リポジトリ説明 |
| `LICENSE` | ライセンスファイル |
| `apm.yml` | APM パッケージ定義（セットアップスクリプト本体と同様、実行するだけで配布対象ではない） |

### ワークスペースローカル配置（setup-local.bat 準拠）

`setup-local.bat` / `setup-local.sh` は対象ワークスペースの内部にファイルを配置する（グローバルではなくプロジェクト固有）。

| 配置先 | 内容 |
|---|---|
| `.github/hooks/` | `hooks/` のコピー |
| `.github/instructions/` | ブートストラップ + グローバルルール |
| `.github/skills/` | 共通スキル + ハブスキル（37フォルダ、フェーズスキル除外） |
| `.claude/rules/` | `aide-powers-bootstrap.md` |
| `.kiro/steering/` | ブートストラップ + ルール |
| `.kiro/skills/` | 全スキル |


---

## パス3: skills/using-aide-powers/ 詳細解析

### SKILL.md

- **役割**: aide-powers 全体のハブスキル（エントリポイント）。セッション開始時に activate され、ワークフロー選択・ルール適用・プラットフォーム適応を司る。
- **主要セクション構成**:
  1. `起動時の手順` — セッション引き継ぎチェック → references 配置（version比較） → rules-distribute 実行
  2. `ワークフロー選択` — ユーザー発話から7WFのいずれかのフェーズ1スキルを特定し activate
  3. `ルール` — global-rules / phase-skill-rules への参照指示、activate必須原則の宣言
  4. `プラットフォーム適応` — ツールマップテーブル（6プラットフォーム対応）
- **参照関係（他スキルへの参照）**:
  - `session-handover` (aide-powers skill) — セッション引き継ぎ
  - `rules-distribute` (aide-powers skill) — ルール配布
  - `fs-planning-phase1-intake-and-init` (aide-powers skill)
  - `fs-design-phase1-user-req` (aide-powers skill)
  - `fs-reverse-phase1-program` (aide-powers skill)
  - `fs-impl-phase1-gate` (aide-powers skill)
  - `fs-change-phase1-analysis` (aide-powers skill)
  - `fs-bugfix-phase1-analysis` (aide-powers skill)
  - `fs-refactoring-phase1-status` (aide-powers skill)
- **参照関係（ファイル参照）**:
  - `.aide/references/version.json` — バージョン比較
  - `.aide/references/global-rules.md` — 全プラットフォーム共通ルール
  - `.aide/references/phase-skill-rules.md` — フェーズスキル共通ルール
  - `.aide/references/{platform}-tools.md` — 各プラットフォーム用ツールマップ
  - `.aide/specs/{feature_name}/session-handover.md` — セッション引き継ぎファイル
  - `.aide/specs/{feature_name}/pending-issues.md` — 残課題
  - `skills/using-aide-powers/references/version.json` — 正本バージョン



---

## パス3: agents/ 詳細解析

`agents/` 直下の13個のMarkdownファイル（Claude Code / Copilot CLI / VSCode Copilot 等で使用されるサブエージェント定義）の詳細解析。

### agents/architecture-qa-agent.md

**ファイルの役割**: アーキテクチャ設計書（GUI設計・レイヤードアーキテクチャ）の品質検証を行い、基準未達の設計を拒否するQAエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `architecture-qa-agent` |
| `description` | アーキテクチャQAレビューエージェント。GUI設計・レイヤードアーキテクチャの品質検証、DDD採用判断の妥当性・レイヤー間依存方向・依存性逆転の適用を検証。設計WFゲート2完了後または変更WFの差分設計QA時に呼び出される。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「アーキテクチャQAレビューエージェント」。設計書の品質を厳格に検証し、基準未達は承認拒否。
- **担当範囲**: GUI設計の要件充足チェック、DDD採用判断の妥当性、レイヤー間依存方向検証、ドメイン層独立性チェック、依存性逆転の適用チェック、テスト用ダミー実装方針検証、ユビキタス言語トレーサビリティ検証、ドメインモデル貧血症防止方針、集約設計方針検証、ユビキタス言語辞書存在確認、例外・ルール回避検出。
- **入力**: feature_name、レビュー対象ファイルパスリスト（gui-design.md, layered-architecture.md）、前提成果物ファイルパスリスト（user-requirements.md, system-requirements.md）。
- **レビュープロセス**: 3ステップ（対象読込→11検証項目の網羅実行→判定と結果出力）。
- **出力フォーマット**: Markdownテーブル形式（検証結果一覧、FAIL修正指示、WARNING項目、総合判定）。
- **判定基準**: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED。

**参照関係**:
- `requirements-qa-agent`（要件定義レビューは担当外として言及）
- `object-design-qa-agent`（オブジェクト設計レビューは担当外として言及）
- `final-design-qa-agent`（プログラム構成・インフラIF設計レビューは担当外として言及）

### references/version.json

- **役割**: aide-powers references 一式のバージョン管理。version 整数値でワークスペース側 `.aide/references/` との鮮度比較を行い、コピー要否を判定する。
- **構造**: `{ "version": 13, "updated": "2026-06-22" }` — version（整数）と updated（日付文字列）のみ。
- **参照関係**: SKILL.md の「起動時の手順」ステップ2 で正本として参照される。`.aide/references/version.json` と突き合わせて全 references ファイルの一括コピー要否を判定。



### agents/code-review-agent.md

**ファイルの役割**: コードの内部品質（命名、型ヒント、SOLID原則、エラーハンドリング等）とテスト方針準拠を検証する「中を見る」レビューエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `code-review-agent` |
| `description` | コード品質レビューエージェント。「中を見る」レビュー担当。実装タスク完了後のコード品質チェックまたはテストコード品質チェックで使用。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「コード品質レビューエージェント」。コード自体の品質を検証。設計書との整合性は担当外。
- **依頼受領時チェック**: 7項目の前提チェック（単一タスクID、単一ファイル、複数指示禁止、mode指定、設計書パス、進捗表更新依頼有無等）。違反時は BLOCKED / NEEDS_CONTEXT で返却。
- **担当範囲**: 命名規約、型ヒント・docstring、SOLID原則、エラーハンドリング、ファイルサイズ・ネスト深度、デッドコード検出、テストコード品質、ダミー実装検出。
- **入力**: task_id、対象ファイルパス、テスト対象実装ファイルパス、設計書ファイルパス、レイヤードアーキテクチャ定義書パス、過去不具合履歴フォルダパス、進捗表更新依頼、レビューモード（implementation / test）。
- **プロセス**: mode=implementation → `code-quality-review` + `error-handling-review` スキルを activate。mode=test → `test-review` スキルを activate（review_mode="policy"、検証項目1除外）。
- **判定基準**: ERROR=0 かつ WARNING=0 → APPROVED。それ以外 → NEEDS_FIX。

**参照関係**:
- `design-review-agent`（設計書整合性・import依存方向は担当外として言及）
- `micro-impl-agent`（実装修正は担当外として言及）
- `code-quality-review` スキル（implementation モードで activate）
- `error-handling-review` スキル（implementation モードで activate）
- `test-review` スキル（test モードで activate）
- `multi-stage-code-review` スキル（呼び出し元として言及）

### references/global-rules.md

- **役割**: aide-powers 全体に常時適用されるグローバルルール集。`rules-distribute` スキルにより各プラットフォームのルール配置先にコピーされる。
- **主要セクション構成**:
  1. `aide-powers で開発する` — 開発案件は必ず aide-powers 経由
  2. `ユーザへの質問の仕方` — 番号付き選択肢、1回1質問
  3. `敬語の維持` — 全エージェントで敬語必須
  4. `応答の簡潔さ` — 会話は簡潔、ドキュメントは丁寧
  5. `gitコミットルール` — git-commit-workflow スキル経由必須
  6. `ファイル書き込みルール` — 50行超は Write+Append
  7. `ツールマップ参照ルール` — プラットフォーム別ツール名変換必須
  8. `スキルの所在ルール` — グローバル/ワークスペースのどちらにも存在しうる
  9. `大きいファイルを分割して全行読み出すルール` — 部分ロード禁止
  10. `実行環境ルール` — dev-environment.md 準拠
  11. `共通スキル発動条件カタログ` — 7スキルの発動条件テーブル
- **参照関係（他スキルへの参照）**:
  - `using-aide-powers` (aide-powers skill)
  - `git-commit-workflow` (aide-powers skill)
  - `session-handover` (aide-powers skill)
  - `doc-index-maintenance` (aide-powers skill)
  - `visual-companion` (aide-powers skill)
  - `pending-issues-management` (aide-powers skill)
  - `tech-investigation` (aide-powers skill)
  - `task-orchestration` (aide-powers skill)
- **参照関係（ファイル参照）**:
  - `common-skill-catalog.md` — 詳細カタログへの参照
  - `dev-environment.md` — 実行環境定義



### agents/delta-design-qa-agent.md

**ファイルの役割**: 差分設計書（delta-design.md / fix-design.md / refactoring-design.md）のbefore→after妥当性、影響範囲外変更、既存設計書との矛盾を検証するQAエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `delta-design-qa-agent` |
| `description` | 差分設計QAレビューエージェント。変更WF・バグ修正WF・リファクタリングWFの差分設計QA時に常に呼び出される。差分設計の整合性・影響範囲外変更検出・既存設計書との矛盾検証。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「差分設計QAレビューエージェント」。差分設計書の品質を厳格に検証し、基準未達は承認拒否。
- **担当範囲**: before→after妥当性、影響範囲外への変更検出、既存設計書との矛盾チェック、差分設計の完全性、レイヤー依存方向の整合性、記述品質、例外・ルール回避検出、不変条件の保全チェック、OCP原則準拠チェック、「更新が必要な設計資料」セクション整合性チェック。
- **入力**: feature_name、レビュー対象ファイルパスリスト（差分設計書）、関連ファイルパスリスト（approach.md / fix-plan.md / refactoring-plan.md）、既存設計書ファイルパスリスト。
- **レビュープロセス**: 3ステップ（対象読込→10検証項目の網羅実行→判定と結果出力）。
- **出力フォーマット**: Markdownテーブル形式（検証結果一覧、FAIL修正指示、WARNING項目、総合判定）。
- **判定基準**: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED。

**参照関係**:
- `requirements-qa-agent`（各設計領域の専門検証は担当外として言及）
- `architecture-qa-agent`（同上）
- `object-design-qa-agent`（同上）
- `final-design-qa-agent`（同上）

### references/phase-skill-rules.md

- **役割**: フェーズスキル（`fs-*`）および全スキル実行時に必ず適用されるルール集。`rules-distribute` により各プラットフォームのルール配置先にコピーされる。
- **主要セクション構成**:
  1. `全SKILLの activate 必須・独自解釈禁止` — 最上位原則。スキルの独自解釈・省略を絶対禁止
  2. `手順の改変禁止と改善責務` — AI が陥りがちな誤りパターンを列挙して禁止
  3. `フェーススキル実作業禁止` — fs-* はオーケストレーション専任、実作業はサブエージェントのみ
  4. `ユーザーによる中止` — 中止時は final-check 中止モードへルーティング
  5. `作業中の他ワークフロー起動禁止` — WF進行中の別WF起動禁止
  6. `設計書なしの実装禁止` — design-gate PASS 必須
  7. `コンテキスト制約時の対応` — task-orchestration / session-handover 必須
  8. `再開判定とレポート記載の横断ルール` — RESUME_FROM のフェーズ番号解釈、Step途中再開、即時記載
- **参照関係（他スキルへの参照）**:
  - `session-handover` (aide-powers skill)
  - `task-orchestration` (aide-powers skill)
  - `design-gate` (aide-powers skill)
- **参照関係（ファイル参照）**:
  - `.aide/specs/{feature_name}/session-handover.md`
  - `.aide/specs/{feature_name}/pending-issues.md`
- **⚠️ 変更時の連動ファイル**: version.json +1、.apm/instructions/aide-powers-phase-skill-rules.instructions.md 同期、rules-distribute 配布トリガー


### references/common-skill-catalog.md

- **役割**: 共通スキル7種の詳細な発動条件カタログ。global-rules.md のサマリーテーブルの詳細版で、各スキルの発動を「条件への機械的合致」で判定するための一覧。
- **主要セクション構成**: 7スキルそれぞれに「概要」+「発動条件テーブル（#, 発動条件, 判定コンテキスト）」を記載
- **列挙されるスキル**:
  1. `session-handover` — 5条件（コンテキスト肥大化、handover.md存在、ユーザー指示、フェーズ完了、作業中断）
  2. `doc-index-maintenance` — 4条件（設計書の作成・移動・削除・doc-sync完了）
  3. `visual-companion` — 4条件（視覚表示要求、構造化情報提示、成果物確認、判断依頼）
  4. `pending-issues-management` — 5条件（スコープ外問題発見、残件質問、WF完了チェック、課題解決、WF完了時）
  5. `tech-investigation` — 3条件（技術質問、課題発生、実現性確認）
  6. `git-commit-workflow` — 3条件（成果物コミット、後処理コミット指示、変更commit）
  7. `task-orchestration` — 2条件（3件以上の同様操作、複雑な要求）
- **参照関係（他スキルへの参照）**: 上記7スキル全て `(aide-powers skill)` 記法で参照
- **参照関係（ファイル参照）**: なし（自己完結型のカタログ）



### agents/design-review-agent.md

**ファイルの役割**: 実装コードが設計書に準拠しているか・レイヤー間importルールが守られているかを検証する「外を見る」レビューエージェント。内部ロジック意図検証を最優先とする。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `design-review-agent` |
| `description` | 設計準拠レビューエージェント。「外を見る」レビュー担当。内部ロジック意図検証を最優先とし、タスク種別（通常実装/バグ修正/変更/リファクタリング）に応じた追加検証を行う。実装タスク完了後の設計準拠チェックで使用。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「設計準拠レビューエージェント」。設計書との整合性・アーキテクチャルール遵守を検証。コード内部品質は担当外。
- **最重要原則**: クラス名・シグネチャ一致でも内部ロジック未実装・スタブならFAIL。
- **依頼受領時チェック**: 7項目（単一タスクID、単一ファイル、複数指示禁止、設計参照セクション絞込、mode指定、進捗表更新依頼有無等）。BLOCKED / NEEDS_CONTEXT返却あり。
- **担当範囲**: 内部ロジック意図検証、設計書整合性チェック、importルール準拠チェック、テスト網羅性チェック、メソッド・クラス実装漏れ検出、シグネチャ不一致検出、タスク種別別追加検証、過去不具合修正の保持検証、合理的乖離判定。
- **入力**: task_id、対象ファイルパス、テスト対象実装ファイルパス、設計書ファイルパス、設計参照セクション、レビューモード（implementation / test）、タスク種別（normal / bugfix / change / refactoring）、fix-plan.md/fix-design.md/delta-design.mdパス、bugfix/ディレクトリパス、進捗表更新依頼。
- **プロセス**: 6ステップ（タスク種別判定→設計書読込→対象読込→検証実行（検証項目0〜6 + importルール/テスト網羅性）→合理的乖離判定→結果出力）。
- **出力フォーマット**: 差分一覧テーブル（ファイル/クラス/項目/設計書/実装/種別）+ 合理的乖離詳細 + サマリ。PASS時は1行のみ。
- **判定基準**: 差分0件 → PASS。差分1件以上 → FAIL（合理的乖離承認時を除く）。

**参照関係**:
- `code-review-agent`（コード内部品質は担当外として言及）
- `micro-impl-agent`（実装修正は担当外として言及）
- `import-review` スキル（implementation モードで activate 必須）
- `test-review` スキル（test モードで activate 必須、review_mode="coverage"）
- `design-sync` スキル（合理的乖離承認時に設計書更新依頼先として言及）
- `multi-stage-code-review` スキル（呼び出し元として言及）


---

## パス3: agents/kiro/ 詳細解析

`agents/kiro/` ディレクトリは **Kiro IDE / Kiro CLI 専用のサブエージェント定義**を格納する。13エージェント × 3ファイル（MD + JSON + prompts/）= 39ファイルで構成される。

### ファイル構成パターン（3ファイルセットの対応関係）

各エージェントは以下の3ファイルで定義される:

| ファイル | プラットフォーム | 用途 |
|---|---|---|
| `{name}.md` | Kiro IDE | フロントマター（name, description, tools）+ プロンプト本文。`invoke_sub_agent` で読み込まれる |
| `{name}.json` | Kiro CLI | JSON定義。`"prompt": "file://./prompts/{name}-prompt.md"` で prompts/ を参照 |
| `prompts/{name}-prompt.md` | Kiro CLI | プロンプト本文のみ（フロントマターなし）。JSON から `file://` 参照される |

**対応関係**: MD のフロントマター以降の本文と `prompts/{name}-prompt.md` の内容は**実質同一**（同じプロンプトの2つの配布形態）。JSON は名前・説明・ツール許可リストのメタデータを持ち、`prompt` フィールドで prompts/ のMDを参照する。

### JSON ファイルの共通フィールド構造

全13個のJSONファイルは以下の共通構造を持つ:

```json
{
  "name": "{エージェント名}",
  "description": "{1行説明}",
  "prompt": "file://./prompts/{エージェント名}-prompt.md",
  "tools": ["@builtin"],
  "allowedTools": ["@builtin"]
}
```

- `tools` / `allowedTools` は全エージェントで `["@builtin"]`（全ビルトインツール許可）
- `description` は MD のフロントマター description より短い要約形式

### MD ファイルのフロントマター共通構造

全13個のMDファイルは以下のフロントマター形式:

```yaml
---
name: {エージェント名}
description: |
  {複数行の詳細説明。Examples: <example>...</example> 付き}
tools: ["@builtin"]
---
```

- `description` には Kiro IDE の `invoke_sub_agent` 用メタデータとして Examples（呼び出し例）が含まれる
- `tools` は全エージェントで `["@builtin"]`

---

### エージェント別詳細解析

#### 1. architecture-qa-agent（アーキテクチャQAレビュー）

**役割（1行）**: アーキテクチャ設計書（GUI設計・レイヤードアーキテクチャ）の品質検証。設計WFゲート2で使用。

**MD フロントマター**:
- `name`: `architecture-qa-agent`
- `description`: DDD採用判断の妥当性、レイヤー間依存方向、依存性逆転の適用、DDD設計方針の検証。ゲート2完了後または変更WF差分設計QA時に呼出。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `architecture-qa-agent`
- `description`: 「アーキテクチャ設計書のQAレビューエージェント。」
- `prompt`: `file://./prompts/architecture-qa-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 担当: GUI設計要件充足、DDD採用判断妥当性、レイヤー間依存方向、ドメイン層独立性、依存性逆転、テスト用ダミー実装方針、ユビキタス言語トレーサビリティ/貧血症/集約方針（DDD時）、ユビキタス言語辞書存在確認（常時）、例外・ルール回避検出
- プロセス: 3ステップ（読込→11検証項目実行→判定出力）
- 判定基準: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED


### references/progress-file-format.md

- **役割**: 全7ワークフローの進捗管理ファイル（`*-progress.md`）の共通フォーマット定義書。ステータステーブル、フェーズ詳細、修正履歴、テスト結果の記載ルールを規定。
- **主要セクション構成**:
  1. `§1. 目的` — 進捗ファイルの役割
  2. `§2. 進捗ファイルの命名と配置` — 7WF×ファイル名マッピング
  3. `§3. 基本フォーマット` — ステータステーブル、フェーズ詳細セクション、修正履歴テーブル
  4. `§4. リファクタリングWF用の拡張` — テスト結果欄
  5. `§5. 記録ルール` — 状態マーカー（5種）、日時フォーマット、レビュー結果表記、成果物テーブル
  6. `§6. 更新タイミングルール` — progress-resume-check、gitコミット直前更新、作業中マーカー運用
  7. `§7. WF別の初期状態テンプレートとフェーズマッピング` — 7WFのフェーズ番号・スキル名・表示名の完全マッピング
  8. `§8. doc-index.md への登録方針` — 進捗ファイルは登録対象外
  9. `§9. 関連スキル` — 11スキルへの参照
  10. `§10. 改訂履歴`
- **参照関係（他スキルへの参照）**:
  - `progress-resume-check` (aide-powers skill)
  - `git-commit-workflow` (aide-powers skill)
  - `doc-index-maintenance` (aide-powers skill)
  - `design-gate` (aide-powers skill)
  - 全フェーズスキル群（`fs-planning-*`, `fs-design-*`, `fs-impl-*`, `fs-reverse-*`, `fs-change-*`, `fs-bugfix-*`, `fs-refactoring-*`）
- **参照関係（ファイル参照）**:
  - `.aide/specs/{project}/*-progress.md` — 各WFの進捗ファイル
  - `.aide/specs/{project}/impl-process-checklist.md`
  - `design-progress.md` — impl-progress.md からの相互参照



### agents/final-design-audit-agent.md

**ファイルの役割**: 実装WF最終チェックで全設計書の全項目が実装コードで対応されているかを横断的に照合（holistic監査）し、未実装項目をタスク化する最終監査エージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `final-design-audit-agent` |
| `description` | 最終設計準拠監査エージェント。doc-indexから全設計書を特定し全項目を横断照合。✅/❌で報告。❌検出時はimpl-task-list.md＋impl-process-checklist.mdにタスク追記。design-review-agentが1タスク=1ファイル専用で横断監査を拒否するのに対し、本エージェントは全設計書横断の最終監査専任。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「最終設計準拠監査エージェント」。全設計書の全項目が実装対応されているかを横断監査。
- **最重要原則**: クラス名・シグネチャ一致でも内部ロジック未実装・スタブなら❌。
- **担当範囲**: doc-index.mdから全設計書パス特定、全項目横断照合（全クラス定義・全メソッドシグネチャ・全不変条件・全テスト観点）、内部ロジック意図検証、❌検出時のタスク化（impl-task-list.md 2層構造 + impl-process-checklist.md）。
- **入力**: feature_name、doc-index.mdパス、impl-task-list.mdパス、impl-process-checklist.mdパス。
- **監査プロセス**: 5ステップ（設計書パス取得→全項目一覧化→実装コード横断照合→結果報告→❌検出時タスク化）。
- **タスク化詳細**: [5-1] impl-task-list.md追記（2層構造、1サブタスク=1ファイル=1publicメソッド）、[5-2] impl-process-checklist.md追記（工程行一式）、[5-3] 追記結果報告。
- **出力フォーマット**: 対象設計書一覧、全項目照合結果テーブル（✅/❌）、タスク化結果、サマリ。
- **判定基準**: ❌=0 → PASS。❌≧1 → FAIL（タスク化済み）。

**参照関係**:
- `design-review-agent`（1タスク=1ファイル専用で横断監査をBLOCKEDとする対比として言及）
- `code-review-agent`（コード内部品質は担当外として言及）
- `design-sync` スキル（設計書更新は担当外として言及）
- `test-coverage-audit-agent`（試験網羅性照合は担当外として言及）
- `coding-test-2review` スキル（追加実装の実行主体として言及）
- `impl-task-planning` スキル（タスク化ルールの準拠先として言及）

### references/kiro-ide-tools.md

- **役割**: Kiro IDE プラットフォーム用のツール名変換マップ。スキルが使用する Claude Code ツール名を Kiro IDE の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（15エントリ: Read→readFile, Write→fsWrite, Edit→strReplace, Bash→executePwsh, Skill→discloseContext, Task→invokeSubAgent 等）
  2. `Kiro IDE specific tools` — Kiro IDE 固有ツール一覧（readCode, fsAppend, listDirectory, semanticRename, smartRelocate, controlPwshProcess 等 11ツール）
  3. `Notes` — 補足事項（executePwsh の動作差異、discloseContext の使い方等）
  4. `Subagent dispatch` — Task ツールの Kiro IDE 等価パターン（invokeSubAgent への変換）
  5. `Subagent user interaction` — サブエージェントからのユーザー対話可能性（user_input 利用可）
- **参照関係**: なし（自己完結型のマッピング定義）


#### 2. code-review-agent（コード品質レビュー）

**役割（1行）**: コードの内部品質（命名、型ヒント、SOLID原則、エラーハンドリング等）とテスト方針準拠を検証する「中を見る」レビューエージェント。

**MD フロントマター**:
- `name`: `code-review-agent`
- `description`: 「中を見る」レビュー担当。コード自体の品質検証。設計書との整合性は担当外。実装タスク完了後のコード品質チェックで使用。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `code-review-agent`
- `description`: 「コード品質レビューエージェント。命名、型ヒント、SOLID原則、エラーハンドリング等を検証する。」
- `prompt`: `file://./prompts/code-review-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 依頼受領時チェック: 7項目（単一タスクID、単一ファイル、複数指示禁止、mode指定、設計書パス、進捗表更新依頼有無）。違反時 BLOCKED/NEEDS_CONTEXT 返却
- 担当: 命名規約、型ヒント・docstring、SOLID原則、エラーハンドリング、ファイルサイズ・ネスト深度、デッドコード、テストコード品質、ダミー実装検出
- プロセス: mode=implementation → `code-quality-review` + `error-handling-review` スキル activate。mode=test → `test-review` スキル activate
- 判定基準: ERROR=0 かつ WARNING=0 → APPROVED。それ以外 → NEEDS_FIX
- 参照スキル: `code-quality-review`, `error-handling-review`, `test-review`, `multi-stage-code-review`

#### 3. delta-design-qa-agent（差分設計QAレビュー）

**役割（1行）**: 差分設計書（delta-design.md / fix-design.md / refactoring-design.md）のbefore→after妥当性・影響範囲外変更・既存設計書矛盾を検証するQAエージェント。

**MD フロントマター**:
- `name`: `delta-design-qa-agent`
- `description`: 変更WF・バグ修正WF・リファクタリングWFの差分設計QA時に常に呼出。差分設計の整合性・影響範囲外変更検出・既存設計書との矛盾検証。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `delta-design-qa-agent`
- `description`: 「差分設計QAレビューエージェント。差分設計書の品質を検証し、基準を満たさない設計の承認を拒否する。」
- `prompt`: `file://./prompts/delta-design-qa-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 担当: before→after妥当性、影響範囲外変更検出、既存設計書矛盾チェック、差分設計完全性、レイヤー依存方向整合性、記述品質、例外・ルール回避検出、不変条件保全、OCP原則準拠、設計資料更新セクション整合性
- プロセス: 3ステップ（読込→10検証項目実行→判定出力）
- 判定基準: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED

#### 4. design-review-agent（設計準拠レビュー）

**役割（1行）**: 実装コードが設計書に準拠しているか、レイヤー間importルールが守られているかを検証する「外を見る」レビューエージェント。

**MD フロントマター**:
- `name`: `design-review-agent`
- `description`: 「外を見る」レビュー担当。設計書との整合性・他プログラムとの依存関係検証。内部ロジック意図検証を最優先。タスク種別対応の追加検証あり。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `design-review-agent`
- `description`: 「設計準拠レビューエージェント。実装コードが設計書に準拠しているか、レイヤー間のimportルールが守られているかを検証する。」
- `prompt`: `file://./prompts/design-review-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: クラス名・シグネチャが一致していても内部ロジックが設計意図通りでなければFAIL
- 依頼受領時チェック: 7項目（code-review-agent と類似構造）。違反時 BLOCKED/NEEDS_CONTEXT 返却
- REQUIRED SUB-SKILL: mode=implementation → `import-review` スキル。mode=test → `test-review` スキル（review_mode="coverage"）
- 担当: 内部ロジック意図検証（最優先）、設計書整合性、importルール準拠、テスト網羅性、実装漏れ検出、シグネチャ不一致検出、タスク種別追加検証、過去不具合修正保持検証、合理的乖離判定
- プロセス: 6ステップ（タスク種別判定→設計書読込→対象ファイル読込→検証実行→合理的乖離判定→結果出力）
- 検証項目: 項目0（内部ロジック意図・最優先）、項目1〜6（クラス存在・シグネチャ・コンストラクタ・処理フロー・不変条件・過去不具合保持・未定義追加）、importルールチェック、テスト網羅性チェック
- 判定基準: 差分0件 → PASS。差分1件以上 → FAIL
- 参照スキル: `import-review`, `test-review`, `design-sync`, `multi-stage-code-review`


### references/kiro-cli-tools.md

- **役割**: Kiro CLI プラットフォーム用のツール名変換マップ。Claude Code ツール名を Kiro CLI の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（15エントリ: Read→read, Write→write, Edit→edit, Bash→shell, Task→subagent 等）
  2. `Subagent dispatch` — Task ツールの Kiro CLI 等価パターン
  3. `Kiro CLI specific tools` — CLI 固有ツール一覧（aws, code, introspect, delegate, knowledge, todo, session, report, tool_search の9ツール）
  4. `Web search availability` — web_search/web_fetch のガバナンス制限と MCP フォールバック
  5. `Subagent user interaction` — サブエージェントからのユーザー対話可能性（対話的セッション動作）
- **参照関係**: なし（自己完結型のマッピング定義）
- **Kiro IDE との差異**: Skill → "Skills auto-load natively"（IDE の discloseContext に対し CLI はネイティブ自動ロード）、AskUserQuestion → 専用ツールなし（対話的動作で代替）



### agents/final-design-qa-agent.md

**ファイルの役割**: インフラIF設計書（infra-interface-design.md）とプログラム構成書（program-structure.md）の品質検証・設計網羅性の横断トレーサビリティ確認を行うQAエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `final-design-qa-agent` |
| `description` | 最終設計QAレビューエージェント。設計WFゲート4完了後または変更WFの差分設計QA時に呼び出される。インフラIF整合性、プログラム構成網羅性、importルールとレイヤー依存方向の整合性を検証。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「最終設計QAレビューエージェント」。インフラIF設計書とプログラム構成書の品質を厳格に検証し、基準未達は承認拒否。
- **担当範囲**: インフラIF設計の整合性（object-design-*.mdとの整合）、プログラム構成の網羅性（全クラスのファイル配置漏れ）、importルール定義の検証、ファイル命名規則、例外・ルール回避検出（6パターン）、設計網羅性確認（横断トレーサビリティ、ゲート4時のみ）。
- **入力**: feature_name、レビュー対象ファイルパスリスト（infra-interface-design.md, program-structure.md）、前提成果物ファイルパスリスト（object-design-*.md, layered-architecture.md, user-requirements.md, gui-design.md, system-architecture.md）。
- **レビュープロセス**: 3ステップ（対象読込→6検証項目の網羅実行→判定と結果出力）。
- **出力フォーマット**: Markdownテーブル形式（検証結果一覧、FAIL修正指示、WARNING項目、総合判定）。
- **判定基準**: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED。

**参照関係**:
- `requirements-qa-agent`（要件定義レビューは担当外として言及）
- `architecture-qa-agent`（アーキテクチャ設計レビューは担当外として言及）
- `object-design-qa-agent`（オブジェクト設計レビューは担当外として言及）

### references/copilot-tools.md

- **役割**: GitHub Copilot CLI プラットフォーム用のツール名変換マップ。Claude Code ツール名を Copilot CLI の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（17エントリ: Read→view, Write→create, Edit→edit, Bash→bash, Skill→skill, Task→task 等）
  2. `Agent types` — task ツールの agent_type パラメータ（general-purpose, explore, プラグインエージェント）
  3. `Async shell sessions` — 非同期シェルセッション（bash async, write_bash, read_bash, stop_bash, list_bash）
  4. `Additional Copilot CLI tools` — 固有ツール（store_memory, report_intent, sql, fetch_copilot_cli_documentation, GitHub MCP tools）
  5. `Web search limitations` — WebSearch なし、web_fetch + MCP フォールバック
  6. `Subagent user interaction` — サブエージェントからの ask_user 利用可
- **参照関係**: なし（自己完結型のマッピング定義）



### agents/micro-impl-agent.md

**ファイルの役割**: 1つの実装タスクを受け取り、実装コード・テストコードを書く実装専任エージェント。レビュー指摘に基づく修正も実行する。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `micro-impl-agent` |
| `description` | マイクロ実装エージェント（実装専任）。1タスクを受け取り実装コードとテストコードを書く。レビュー指摘修正も行う。呼び出し時にタスク番号・対象ファイルパス・テストファイルパス・設計参照セクション・テスト観点・依存先情報を渡す。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「マイクロ実装エージェント」。実装コードとテストコードを書くことに専念。レビューは行わない。
- **依頼受領時チェック**: 7項目（単一タスクID、単一ファイル、複数指示禁止、設計参照セクション絞込、dev-environment.mdパス、進捗表更新依頼有無等）。BLOCKED / NEEDS_CONTEXT返却あり。
- **入力**: タスク番号・タスク内容、対象ファイルパス、テストファイルパス、設計書ファイルパス、設計参照セクション、テスト観点、依存先、開発環境情報（dev-environment.md）、進捗表更新依頼、実行モード（implement / fix / write_test / fix_test / run_test）。
- **プロセス**: 全モード共通で `impl-coding-standards` スキルを activate し、そのルールに従って実行。6モード対応（implement新規実装、implement親タスク完了チェック、fix修正、write_testテスト作成、fix_testテスト修正、run_testテスト実行）。
- **出力**: 実装コード・テストコード（ファイル書込）、各モード完了報告。

**参照関係**:
- `impl-coding-standards` スキル（全モードで activate 必須）

#### 5. final-design-audit-agent（最終設計準拠監査）

**役割（1行）**: 全設計書を横断し、全クラス定義・全メソッドシグネチャ・全不変条件・全テスト観点が実装コードで対応されているかを✅/❌で照合する最終監査エージェント。

**MD フロントマター**:
- `name`: `final-design-audit-agent`
- `description`: 実装WF最終チェックで横断的にholistic監査。design-review-agentが「1タスク=1ファイル専用」で横断監査を拒否（BLOCKED）するのに対し、本エージェントは全設計書横断の最終監査専任。❌検出時はimpl-task-list.md + impl-process-checklist.md にタスク追記。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `final-design-audit-agent`
- `description`: 「最終設計準拠監査エージェント。全設計書を横断し、全クラス定義・全メソッドシグネチャ・全テスト観点が実装コードで対応されているかを照合する。」
- `prompt`: `file://./prompts/final-design-audit-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 存在理由: design-review-agentの1タスク=1ファイル原則と全体横断監査の責務が衝突するため切り出された専任エージェント
- 担当: doc-index.mdから全設計書パス特定、全項目の横断照合（holistic監査）、内部ロジック意図検証（最優先）、✅/❌報告、❌検出時のタスク化（impl-task-list.md 2層構造 + impl-process-checklist.md）
- プロセス: 5ステップ（設計書パス取得→全項目一覧化→実装コードとの横断照合→照合結果報告→❌検出時のタスク化）
- タスク化ルール: impl-task-planningの絶対ルール準拠（2層構造・1サブタスク=1ファイル=1publicメソッド）。追加実装そのものは行わない
- 参照スキル: `impl-task-planning`, `coding-test-2review`, `design-sync`

#### 6. final-design-qa-agent（最終設計QAレビュー）

**役割（1行）**: インフラIF設計書とプログラム構成書の品質検証。設計WFゲート4で使用。

**MD フロントマター**:
- `name`: `final-design-qa-agent`
- `description`: インフラIF整合性（object-design-*.mdとの整合）、プログラム構成の網羅性（全クラスのファイル配置漏れ）、importルールとレイヤー依存方向の整合性を検証。ゲート4完了後または変更WF差分設計QA時に呼出。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `final-design-qa-agent`
- `description`: 「最終設計QAレビューエージェント。インフラIF設計書とプログラム構成書の品質を検証し、基準を満たさない設計の承認を拒否する。」
- `prompt`: `file://./prompts/final-design-qa-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 担当: インフラIF設計の整合性（API/スキーマ vs オブジェクト設計）、プログラム構成の網羅性（全クラスのファイル配置）、importルール定義の検証、ファイル命名規則、例外・ルール回避検出、設計網羅性確認（横断トレーサビリティ、ゲート4時のみ）
- プロセス: 3ステップ（読込→6検証項目実行→判定出力）
- 検証項目2-6（設計網羅性確認）: user-requirements.md / gui-design.md / system-architecture.md が渡された場合のみ実施。全項目を1つずつ下流設計書と突き合わせ
- 判定基準: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED

#### 7. micro-impl-agent（マイクロ実装）

**役割（1行）**: 1つの実装タスクを受け取り、実装コードとテストコードを書く実装専任エージェント。

**MD フロントマター**:
- `name`: `micro-impl-agent`
- `description`: 実装専任。レビュー指摘に基づく修正も行う。呼び出し時にはタスク番号、対象ファイルパス、テストファイルパス、設計参照セクション、テスト観点、依存先情報を渡す。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `micro-impl-agent`
- `description`: 「マイクロ実装エージェント（実装専任）。1つの実装タスクを受け取り、実装コードとテストコードを書く。」
- `prompt`: `file://./prompts/micro-impl-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 依頼受領時チェック: 7項目（単一タスクID、単一ファイル、複数指示禁止、設計参照セクション絞込、dev-environment渡し、進捗表更新依頼有無）。違反時 BLOCKED/NEEDS_CONTEXT 返却
- 入力: タスク番号、対象ファイルパス、テストファイルパス、設計書ファイルパス、設計参照セクション、テスト観点、依存先、開発環境情報、進捗表更新依頼、実行モード
- 実行モード: `implement`（新規実装）/ `fix`（レビュー指摘修正）/ `write_test`（テスト作成）/ `fix_test`（テスト修正）/ `run_test`（テスト実行）
- プロセス: 全モードで `impl-coding-standards` スキルを activate し、その mode 別プロセスに100%従って実行
- 出力: 実装コード + テストコード + 完了報告
- 参照スキル: `impl-coding-standards`


### references/vscode-copilot-tools.md

- **役割**: VSCode GitHub Copilot プラットフォーム用のツール名変換マップ。Claude Code ツール名を VSCode Copilot の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（16エントリ: Read→read, Write→create/create_file, Edit→edit/replace_string_in_file, Bash→terminal, Task→runSubagent 等）
  2. `Auto-mapping from Claude format` — Claude形式エージェントファイルの自動検出・変換
  3. `Subagent dispatch` — runSubagent による .agent.md ベースのサブエージェント実行
  4. `Nested subagents` — 再帰的サブエージェント呼び出し（最大深度5）
  5. `Additional VSCode Copilot tools` — 固有ツール（#tool:web/fetch）
  6. `Subagent user interaction` — vscode/askQuestions によるサブエージェント対話
- **参照関係**: なし（自己完結型のマッピング定義）



### agents/object-design-qa-agent.md

**ファイルの役割**: オブジェクト設計書（全レイヤー）とユビキタス言語辞書の品質検証を行い、ドメインモデル貧血症・技術浸食・SOLID原則・テスタビリティ等を検証するQAエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `object-design-qa-agent` |
| `description` | オブジェクト設計QAレビューエージェント。設計WFゲート3完了後、変更WFの差分設計QA時、リファクタリングWFの差分設計QA時に呼び出される。ドメインモデル貧血症、技術浸食、SOLID原則、ユビキタス言語整合性、テスタビリティを検証。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「オブジェクト設計QAレビューエージェント」。オブジェクト設計書の品質を厳格に検証し、基準未達は承認拒否。
- **担当範囲**: A.ドメイン層技術浸食チェック、B.レイヤー間依存違反チェック、C.ドメインモデル貧血症チェック、D.テスト容易性チェック、E.ユビキタス言語整合性チェック、F.SOLID原則チェック（SRP/OCP/LSP/ISP/DIP各項目）、G.集約と整合性の境界チェック、H.オブジェクト定義の品質チェック、I.例外・ルール回避の検出。
- **入力**: feature_name、レビュー対象ファイルパスリスト（object-design-*.md, ubiquitous-language.md）、前提成果物ファイルパスリスト（user-requirements.md, system-requirements.md, gui-design.md, layered-architecture.md）。
- **レビュープロセス**: 3ステップ（対象読込→9検証項目（A〜I）の網羅実行→判定と結果出力）。
- **判定基準**: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED。

**参照関係**:
- `requirements-qa-agent`（要件定義レビューは担当外として言及）
- `architecture-qa-agent`（アーキテクチャ設計レビューは担当外として言及）
- `final-design-qa-agent`（プログラム構成・インフラIF設計レビューは担当外として言及）

### references/codex-tools.md

- **役割**: Codex（OpenAI）プラットフォーム用のツール名変換マップ。Claude Code ツール名を Codex の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（13エントリ: Task→spawn_agent, Skill→ネイティブ, Read/Write/Edit/Bash→ネイティブ, WebSearch→--search オプション 等）
  2. `Subagent dispatch requires multi-agent support` — config.toml での multi_agent 有効化
  3. `Named agent dispatch` — Codex にはエージェントレジストリがないため spawn_agent(worker) + プロンプト注入で代替。Message framing ガイド付き
  4. `Environment Detection` — git worktree/detached HEAD の検出方法
  5. `Codex App Finishing` — サンドボックスの branch/push 制限回避（App UI 操作への委譲）
  6. `Subagent user interaction` — request_user_input によるサブエージェント対話（headless 非対応）
- **参照関係（ファイル参照）**:
  - `agents/code-reviewer.md` — Named agent dispatch の例
  - `~/.codex/config.toml` — multi_agent 設定
- **特徴**: 他のツールマップより大幅に詳細。Codex のサンドボックス制約（worktree, detached HEAD）への対処法を含む。


### references/gemini-tools.md

- **役割**: Gemini CLI プラットフォーム用のツール名変換マップ。Claude Code ツール名を Gemini CLI の実ツール名に変換する。
- **主要セクション構成**:
  1. メインマッピングテーブル（14エントリ: Read→read_file, Write→write_file, Edit→replace, Bash→run_shell_command, Skill→activate_skill, Task→サブエージェント, WebSearch→google_web_search 等）
  2. `Subagent dispatch` — .gemini/agents/*.md ベースのカスタムエージェント + 組み込みサブエージェント（codebase_investigator, generalist, cli_help, browser_agent）
  3. `Additional Gemini CLI tools` — 固有ツール（list_directory, save_memory, tracker_create_task, enter_plan_mode/exit_plan_mode）
  4. `Subagent user interaction` — ask_user によるサブエージェント対話、再帰保護（サブエージェント→サブエージェント呼び出し不可）
- **参照関係**: なし（自己完結型のマッピング定義）
- **特徴**: 並列サブエージェント非対応（順次実行のみ）、再帰保護あり。google_web_search がネイティブ検索ツール。



### agents/progress-final-checker.md

**ファイルの役割**: 全前フェーズの完了状態を確認し、進捗ファイルの最終フェーズ（自フェーズ）を完了に更新する進捗チェックエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `progress-final-checker` |
| `description` | `"全前フェーズの完了状態を確認し、進捗ファイルの最終フェーズを完了に更新する"` |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 進捗ファイルを読み込み、最終フェーズを除く全前フェーズが✅完了であることを確認し、全て完了であれば自フェーズを✅完了に更新する。
- **入力**: workflow_name、total_phases（自フェーズ除く前フェーズ数）、progress_file_path、skipped_phases（除外フェーズ番号リスト、オプション）。
- **total_phases一覧**: planning=3, design=10, impl=6, change=2, bugfix=2, refactoring=6, reverse=5。
- **検証手順**: A.進捗ファイル読込→B.全前フェーズ完了確認（skipped_phases除外対応）→C.自フェーズステータス更新（Bが全PASS時のみ）。
- **出力**: PASS（全前フェーズ完了・自フェーズ更新済み）/ FAIL（problem_phase + reason + evidence）。

**参照関係**:
- 各WFの最終チェックフェーズスキル（呼び出し元として言及）

### ディレクトリ全体の参照関係サマリー

| ファイル | 種別 | 他スキルへの参照数 |
|---|---|---|
| `SKILL.md` | ハブスキル本体 | 9スキル（7WFエントリ + session-handover + rules-distribute） |
| `references/global-rules.md` | ルール定義 | 8スキル |
| `references/phase-skill-rules.md` | ルール定義 | 3スキル |
| `references/common-skill-catalog.md` | カタログ | 7スキル |
| `references/progress-file-format.md` | フォーマット定義 | 11スキル（全WFフェーズ群 + 共通3種） |
| `references/version.json` | バージョン管理 | 参照なし |
| `references/kiro-ide-tools.md` | ツールマップ | 参照なし |
| `references/kiro-cli-tools.md` | ツールマップ | 参照なし |
| `references/copilot-tools.md` | ツールマップ | 参照なし |
| `references/vscode-copilot-tools.md` | ツールマップ | 参照なし |
| `references/codex-tools.md` | ツールマップ | 参照なし |
| `references/gemini-tools.md` | ツールマップ | 参照なし |

**ツールマップ6ファイルの共通パターン**: 全て同一構造（メインマッピングテーブル + Subagent dispatch + プラットフォーム固有ツール + Subagent user interaction）を持ち、自己完結型で他ファイルへの参照を持たない。


#### 8. object-design-qa-agent（オブジェクト設計QAレビュー）

**役割（1行）**: オブジェクト設計書（ドメイン層・アプリケーション層・インフラ層・プレゼンテーション層）とユビキタス言語辞書の品質検証。設計WFゲート3で使用。

**MD フロントマター**:
- `name`: `object-design-qa-agent`
- `description`: ドメインモデル貧血症、技術浸食（ドメイン層への外部依存）、SOLID原則、ユビキタス言語整合性、テスタビリティを検証。ゲート3完了後、変更WFまたはリファクタリングWFの差分設計QA時に呼出。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `object-design-qa-agent`
- `description`: 「オブジェクト設計QAレビューエージェント。ドメイン層・アプリケーション層・インフラ層・プレゼンテーション層のオブジェクト設計書の品質を検証する。」
- `prompt`: `file://./prompts/object-design-qa-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 担当: ドメイン層への技術浸食チェック(A)、レイヤー間依存違反チェック(B)、ドメインモデル貧血症チェック(C)、テスト容易性チェック(D)、ユビキタス言語整合性チェック(E)、SOLID原則チェック(F)、集約と整合性の境界チェック(G)、オブジェクト定義の品質チェック(H)、例外・ルール回避検出(I)
- プロセス: 3ステップ（読込→9検証項目(A〜I)実行→判定出力）
- DDD不採用時: C（貧血症）、Eのユビキタス言語整合性検証、G（集約境界）をスキップ。ただしE辞書存在確認は常時実施
- 判定基準: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED

#### 9. progress-final-checker（進捗最終チェック）

**役割（1行）**: 全前フェーズの完了状態を確認し、進捗ファイルの最終フェーズを✅完了に更新するエージェント。

**MD フロントマター**:
- `name`: `progress-final-checker`
- `description`: 「全前フェーズの完了状態を確認し、進捗ファイルの最終フェーズを完了に更新する」
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `progress-final-checker`
- `description`: 「全前フェーズの完了状態を確認し、進捗ファイルの最終フェーズを完了に更新する。」
- `prompt`: `file://./prompts/progress-final-checker-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 入力パラメータ: workflow_name、total_phases（自フェーズ除く前フェーズ数）、progress_file_path、skipped_phases（スキップ許容フェーズ）
- total_phases定義: planning=3, design=10, impl=6, change=2, bugfix=2, refactoring=6, reverse=5
- 検証手順: A（進捗ファイル読込）→ B（全前フェーズ完了確認）→ C（最終フェーズのステータス更新）
- 誠実性原則: 完了になっていないフェーズがある場合はごまかさずFAIL
- 出力: PASS（全完了・自フェーズ更新済み）/ FAIL（problem_phase + reason + evidence）

#### 10. progress-updater（進捗アップデーター）

**役割（1行）**: フェーズ完了時に呼び出され、成果物の存在確認と進捗ファイルの更新を安全に行うエージェント。

**MD フロントマター**:
- `name`: `progress-updater`
- `description`: フェーズ完了時に呼び出され、成果物の存在確認と進捗ファイルの更新を行う。問題検知時はユーザーに即通知する。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `progress-updater`
- `description`: 「フェーズ完了時に呼び出され、成果物の存在確認と進捗ファイルの更新を行う。問題検知時はユーザーに即通知する。」
- `prompt`: `file://./prompts/progress-updater-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 4つのモード: `verify`（前処理・フェーズ開始時）、`write`（後処理・フェーズ完了時）、`fix_open`（修正起票）、`fix_close`（修正完了）
- verify モード: 直前フェーズ(N-1)が✅完了または🔧修正中であることを確認
- write モード: 進捗ファイル不在時の新規作成（skill_name からワークフロー識別子を抽出し、対応する初期状態テンプレートで新規作成。新規作成時は前フェーズ完了状態確認をスキップ）→成果物存在確認→前フェーズ完了状態確認→ステータステーブル更新→フェーズ詳細セクション追記
- fix_open モード: 完了済みフェーズを🔧修正中に差し戻し、修正履歴テーブルにFIX-N採番して追記。⬜未着手には戻さない（完了実績保持）
- fix_close モード: 修正履歴の該当エントリを✅修正完了に更新
- FAIL時: ユーザーに即通知し対応確認（やり直す/このまま進める/その他）。ユーザー判断が絶対

#### 11. requirements-qa-agent（要件定義QAレビュー）

**役割（1行）**: 要件定義書（ユーザー要件・システム要件・開発計画書・開発環境定義）の品質検証。設計WFゲート1で使用。

**MD フロントマター**:
- `name`: `requirements-qa-agent`
- `description`: EARS構文準拠、MoSCoW分類妥当性、エラーハンドリング方針網羅性、Must要件対応漏れを検証。ゲート1完了後または変更・バグ修正WFの差分設計QA時に呼出。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `requirements-qa-agent`
- `description`: 「要件定義QAレビューエージェント。要件定義書の品質を検証し、基準を満たさない設計の承認を拒否する。」
- `prompt`: `file://./prompts/requirements-qa-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 担当: 要件網羅性（Must項目全対応確認）、矛盾検出、EARS構文準拠、MoSCoW分類妥当性、エラーハンドリング方針（分類・伝播ルール・ログ方針）、開発環境定義完全性、ユーザー要件作成ルール準拠（目的と手段の分離・抽象表現）、開発計画書整合性、例外・ルール回避検出
- プロセス: 3ステップ（読込→9検証項目実行→判定出力）
- 判定基準: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED

#### 12. test-coverage-audit-agent（動作確認試験書 網羅性監査）

**役割（1行）**: user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する監査エージェント。

**MD フロントマター**:
- `name`: `test-coverage-audit-agent`
- `description`: 実装WF最終チェックで要件と試験項目を照合。試験項目漏れは追記、実装漏れの疑いは「Step1差し戻し推奨」と報告。安易に試験項目漏れと判断しないことが原則。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `test-coverage-audit-agent`
- `description`: 「動作確認試験書 網羅性監査エージェント。user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する。」
- `prompt`: `file://./prompts/test-coverage-audit-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: 安易に「試験項目漏れ」と判断しない。まず実装漏れの可能性を確認し、Step1差し戻し推奨が原則
- 担当: 全要件一覧化、全試験項目一覧化、各要件↔試験項目の照合、❌原因判定（試験項目漏れ vs 実装漏れの疑い）、試験項目漏れ時のmanual-test-plan.md追記、実装漏れ疑い時の報告
- プロセス: 6ステップ（要件一覧化→試験項目一覧化→照合→❌原因判定→試験項目漏れ時追記→結果報告）
- 判定: PASS（全要件カバー）/ NEEDS_IMPL_RECHECK（実装漏れ可能性→Step1差し戻し推奨）/ FIXED_BY_TEST_APPEND（試験項目追記で解消）

#### 13. manual-test-review-agent（動作確認試験書 品質レビュー）

**役割（1行）**: 4WF（実装・バグ修正・変更・リファクタリング）の動作確認Stepで生成された試験書が「ユーザー視点で全動作を検証しているか」をレビューする品質ゲート型エージェント。

**MD フロントマター**:
- `name`: `manual-test-review-agent`
- `description`: 動作確認試験書 品質レビューエージェント。共通4観点（ユーザー操作シナリオか／ユーザー視点の網羅性〔質的〕／目視可能な期待結果か／内部視点混入検出）で評価し、wf_type に応じた追加基準を適用。APPROVED/NEEDS_FIXを返す。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `manual-test-review-agent`
- `description`: 「動作確認試験書 品質レビューエージェント。試験書がユーザー視点で全動作を検証しているかを4観点+WF別基準でレビューし、APPROVED/NEEDS_FIXを返す。」
- `prompt`: `file://./prompts/manual-test-review-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: 試験書がバックエンドAPI単体試験・ユニットテスト視点に偏っていないかを厳格に評価する。内部実装視点の試験書は APPROVED しない
- 担当: 共通4観点の評価、wf_type別追加基準の評価、APPROVED/NEEDS_FIXの判定、修正可能粒度での指摘明示
- 担当外: 要件×試験項目の1対1突合（量的カバレッジ監査。test-coverage-audit-agent の専任）、試験書の修正実装、試験の実行、設計書との整合性チェック
- プロセス: 4ステップ（入力読込→共通4観点評価→WF別基準評価→判定）
- 判定: APPROVED（指摘0件）/ NEEDS_FIX（指摘1件以上）

---

### エージェント間の役割分担マトリクス

| エージェント | 設計WFゲート | 差分設計QA | 実装後レビュー | 最終チェック | 進捗管理 |
|---|---|---|---|---|---|
| architecture-qa-agent | ゲート2 | ○ | — | — | — |
| object-design-qa-agent | ゲート3 | ○ | — | — | — |
| final-design-qa-agent | ゲート4 | ○ | — | — | — |
| requirements-qa-agent | ゲート1 | ○ | — | — | — |
| delta-design-qa-agent | — | ○（常時） | — | — | — |
| code-review-agent | — | — | ○（内部品質） | — | — |
| design-review-agent | — | — | ○（設計準拠） | — | — |
| micro-impl-agent | — | — | ○（実装・修正） | — | — |
| final-design-audit-agent | — | — | — | ○（横断監査） | — |
| test-coverage-audit-agent | — | — | — | ○（試験網羅性） | — |
| manual-test-review-agent | — | — | ○（試験書品質） | — | — |
| progress-updater | — | — | — | — | ○（更新） |
| progress-final-checker | — | — | — | — | ○（最終確認） |

### 3ファイルセットの同一性確認結果

全13エージェントについて確認:
- **MD のフロントマター以降本文** と **prompts/{name}-prompt.md** の内容は**実質同一**（レイアウト差異程度）
- **JSON の description** は MD の description の短縮形
- 全エージェントで `tools` / `allowedTools` は `["@builtin"]` で統一



### agents/progress-updater.md

**ファイルの役割**: フェーズスキルの前処理・後処理で進捗ファイルの確認と更新を安全に行い、成果物存在確認・前フェーズ完了確認・進捗更新を一貫して実行するエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `progress-updater` |
| `description` | `フェーズ完了時に呼び出され、成果物の存在確認と進捗ファイルの更新を行う。問題検知時はユーザーに即通知する。` |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「進捗アップデーター」。進捗ファイルの確認と更新を安全に行い、オーケストレータの直接編集を防ぐ。
- **4モード**:
  - `verify`（前処理）: 直前フェーズ（N-1）が完了状態（✅完了 / 🔧修正中）であることを確認。
  - `write`（後処理）: 進捗ファイル不在時の新規作成（skill_name からワークフロー識別子を抽出し、対応する初期状態テンプレートで新規作成。新規作成時は前フェーズ完了確認をスキップ）→成果物存在確認→前フェーズ完了確認→ステータステーブル更新→詳細セクション追記。
  - `fix_open`（修正起票）: 完了済みフェーズを🔧修正中に差し戻し、修正履歴テーブルに追記。FIX-{連番}を採番。
  - `fix_close`（修正完了）: 修正履歴の該当エントリを✅修正完了に更新。
- **入力（共通）**: mode、progress_file_path、skill_name。write追加: changes_dir、expected_artifacts。fix_open追加: fix_phase、fix_reason、fix_content、requester_skill_name。fix_close追加: fix_id。
- **FAIL時**: ユーザーに直接通知し、対応を確認（やり直す / このまま進める / その他）。ユーザー判断の絶対性を原則とする。

**参照関係**:
- 各WFのフェーズスキル（呼び出し元として言及）


### agents/requirements-qa-agent.md

**ファイルの役割**: 要件定義書（ユーザー要件・システム要件・開発計画書・開発環境定義）の品質検証を行い、EARS構文準拠・MoSCoW分類・エラーハンドリング方針等を検証するQAエージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `requirements-qa-agent` |
| `description` | 要件定義QAレビューエージェント。設計WFゲート1完了後、または変更・バグ修正WFの差分設計QA時に呼び出される。EARS構文準拠、MoSCoW分類の妥当性、エラーハンドリング方針の網羅性、Must要件の対応漏れを検証。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「要件定義QAレビューエージェント」。要件定義書の品質を厳格に検証し、基準未達は承認拒否。
- **担当範囲**: 要件網羅性（Must→システム要件対応）、矛盾検出、EARS構文準拠（5パターン: Ubiquitous/Event-driven/State-driven/Unwanted/Optional）、MoSCoW分類妥当性、エラーハンドリング方針（分類・伝播ルール・ログ方針）、開発環境定義、ユーザー要件作成ルール準拠（目的と手段の分離・抽象表現等）、開発計画書整合性、例外・ルール回避検出。
- **入力**: feature_name、レビュー対象ファイルパスリスト（user-requirements.md, system-requirements.md, development-plan.md, dev-environment.md）、前提成果物ファイルパスリスト。
- **レビュープロセス**: 3ステップ（対象読込→9検証項目の網羅実行→判定と結果出力）。
- **判定基準**: FAIL=0 かつ WARNING=0 → APPROVED。それ以外 → REJECTED。

**参照関係**:
- `architecture-qa-agent`（アーキテクチャ設計レビューは担当外として言及）
- `object-design-qa-agent`（オブジェクト設計レビューは担当外として言及）


### agents/test-coverage-audit-agent.md

**ファイルの役割**: 実装WF最終チェックでuser-requirements.mdの全要件とmanual-test-plan.mdの全試験項目を照合し、未カバー要件を検出・原因判定するテストカバレッジ監査エージェント。

**フロントマター構造**:
| フィールド | 値 |
|---|---|
| `name` | `test-coverage-audit-agent` |
| `description` | 動作確認試験書 網羅性監査エージェント。user-requirements.md全要件とmanual-test-plan.md全試験項目を照合し未カバー要件を検出。試験項目漏れはmanual-test-plan.mdに追記。実装漏れの疑いは「Step1差し戻し推奨」と報告。安易に試験項目漏れと判断せず実装漏れ可能性を先に確認。Examples付き。 |
| `tools` | なし（未定義） |

**プロンプト本文の概要**:
- **役割定義**: 「動作確認試験書 網羅性監査エージェント」。ユーザー要件が動作確認試験書で漏れなくカバーされているかを監査。
- **最重要原則**: 未カバー要件発見時、安易に「試験項目漏れ」と判断せず、まず実装漏れの可能性を確認する。
- **担当範囲**: 全要件項目一覧化、全試験項目一覧化、要件と試験項目の照合、❌（未カバー要件）の原因判定（試験項目漏れ / 実装漏れの疑い）、試験項目漏れ時のmanual-test-plan.md追記、実装漏れの疑い時の「Step1差し戻し推奨」報告。
- **入力**: feature_name、user-requirements.mdパス、manual-test-plan.mdパス。
- **監査プロセス**: 6ステップ（要件一覧化→試験項目一覧化→照合→❌原因判定→試験項目追記（該当時のみ）→結果報告）。
- **出力フォーマット**: 網羅性チェック結果テーブル、❌原因判定と対応テーブル、サマリ。
- **判定**: PASS（全要件カバー）/ NEEDS_IMPL_RECHECK（実装漏れ可能性→Step1差し戻し推奨）/ FIXED_BY_TEST_APPEND（試験項目追記で解消）。

**参照関係**:
- `final-design-audit-agent`（設計準拠照合は担当外として言及）
- `design-sync` スキル（設計書更新は担当外として言及）
- `coding-test-2review` スキル（実装漏れ時の追加実装実行主体として言及）


---

### agents/ 直下ファイル群の横断的特徴

**共通するフロントマター構造**:
- 全13ファイルが `name` と `description` フィールドを持つ（Claude Code / Copilot CLI / VSCode Copilot のサブエージェント定義形式）。
- `tools` フィールドを持つファイルは0件（全て未定義。ビルトインツールを使用する前提）。
- `description` には Examples セクション（`<example>...</example>` 形式）を含むものが11件（progress-final-checker、progress-updater を除く）。

**エージェント分類**:
| カテゴリ | エージェント | 主な呼び出し元 |
|---|---|---|
| QAレビューアー（設計書品質検証、ゲート判定） | architecture-qa, object-design-qa, final-design-qa, requirements-qa, delta-design-qa | 各WFのフェーズスキル（ゲート完了時） |
| コードレビューアー（実装品質検証） | code-review, design-review | multi-stage-code-review スキル（実装タスク完了後） |
| 最終監査（横断監査・タスク化） | final-design-audit, test-coverage-audit | fs-impl-phase5-final-check（実装WF最終チェック） |
| 試験書品質レビュー | manual-test-review | 4WFの動作確認Step（試験書作成直後の品質ゲート） |
| 実装専任 | micro-impl | coding-test-2review スキル |
| 進捗管理 | progress-updater, progress-final-checker | 各WFのフェーズスキル（前処理・後処理） |

**共通パターン**:
- QAレビューアー5種は同一の出力フォーマット（検証結果一覧テーブル、FAIL修正指示、WARNING項目、総合判定APPROVED/REJECTED）と同一の判定基準（FAIL=0かつWARNING=0→APPROVED）を共有。
- コードレビューアー2種（code-review, design-review）は同一の依頼受領時チェック（7項目BLOCKED/NEEDS_CONTEXT）と「⚠️オーケストレータへの必須リマインダー」を共有。
- 全レビュー系エージェント（QA + コードレビュー）は「修正の実行は担当外（呼び出し元の責務）」を明示。


---

## パス3: フェーズスキル群 詳細解析

### 企画WF (fs-planning-phase*)

#### fs-planning-phase1-intake-and-init
- 役割: ユーザーから初期情報を収集し、既存資料を構造化し、企画書テンプレートを初期化する
- プロセス: 前処理 → Step1: 初期ヒアリング（7項目を1つずつ） → Step2: 既存資料の構造化（条件付き） → Step3: session-notes.md作成 → Step4: 企画書テンプレート初期化 → Step5: ユーザー承認 → 後処理
- 成果物: `source-materials/{資料名}.md`, `session-notes.md`, `planning-proposal.md`, `doc-index.md`, `planning-progress.md`, `fs-planning-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management(apply/update), doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `source-material-organizer-prompt.md`（Step2）, `session-notes-writer-prompt.md`（Step3）, `proposal-writer-init-prompt.md`（Step4）

#### fs-planning-phase2-explore
- 役割: 企画書テンプレートを対話・技術調査・レビューの反復サイクルで段階的に品質向上させる
- プロセス: 前処理 → Step1: ユーザーとの対話 → Step2: 技術調査（必要時） → Step3: 企画書の更新 → Step4: 区切り判定 → Step5: レビュー → Step6: ループ判定 → Step7: ユーザー承認 → 後処理（Step1-7は探索サイクルとしてループ）
- 成果物: `planning-proposal.md`（更新）, `session-notes.md`（更新）, `tech-investigation/`, `fs-planning-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management(apply/update), tech-investigation, doc-index-maintenance, git-commit-workflow, pending-issues-management, visual-companion, task-orchestration
- プロンプトテンプレート: `session-notes-writer-prompt.md`（Step1）, `proposal-writer-update-prompt.md`（Step3）, `proposal-reviewer-prompt.md`（Step5, mode: cycle_review）

#### fs-planning-phase3-finalize
- 役割: 探索サイクル完了後の最終レビュー・ユーザー合意取得・設計WFへの引き継ぎメモ作成
- プロセス: 前処理 → Step1: 最終レビューの実行 → Step2: レビュー結果の評価とユーザー確認 → Step3: ユーザー最終合意の取得 → Step4: handover-notes.md作成 → 後処理
- 成果物: `handover-notes.md`, `fs-planning-phase3-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write/fix_open/fix_close), user-profile-management(apply/update), doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `proposal-reviewer-prompt.md`（Step1, mode: final_review）, `handover-notes-writer-prompt.md`（Step4）
- 特記: Step2/Step3で「探索サイクルに戻る」場合、fix_openでphase2に修正起票し差し戻す

#### fs-planning-phase4-final-check
- 役割: 企画WF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → Step1: 全前フェーズの進捗確認と進捗ファイル更新 → Step2: 想定外残ファイルの確認 → 後処理（中止モード時は「中止クリーンアップ」へ直行）
- 成果物: `fs-planning-phase4-report.txt`（検証のみ、最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/fix_open/fix_close), user-profile-management(apply/update), doc-index-maintenance, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし
- 特記: phase-report-check(write)は呼ばない（progress-final-checkerが更新）。後処理完了後に全フェーズレポートを削除

（設計WF〜リファクタリングWF、および横断パターンまとめはファイル末尾に記載）

---

## パス3: 共通スキル群 詳細解析

### aide-powers-guide
- 役割: aide-powersフレームワーク全体のエントリーポイント。ワークフロー選択と初期セットアップを管理
- 主要機能: セッション引き継ぎチェック→references配置→rules-distribute実行→Quick Routingでワークフロー選択（企画/設計/実装/バグ修正/変更/リファクタリング/逆引き）
- 呼び出し元: ユーザーからのソフトウェア開発リクエスト時に最初にactivateされる
- 追加ファイル: なし（SKILL.mdのみ）

### code-quality-review
- 役割: 実装コードの内部品質レビュー詳細ルール集。命名・型ヒント・SOLID・ダミー実装検出・過去不具合再発チェック等
- 主要機能: 11セクション（命名規約/ファイルサイズ/1ファイル1クラス/型ヒント/docstring/コメント/SOLID/品質チェック/if網羅性/過去不具合再発/ダミー実装検出/デッドコード）をERROR/WARNING/INFOの3段階で判定
- 呼び出し元: code-review-agent（mode: implementation）から参照。間接的にcoding-test-2review/multi-stage-code-review経由
- 追加ファイル: なし（SKILL.mdのみ）

### coding-test-2review
- 役割: タスクリストの全タスクを実装→テスト→2段階レビューで処理するオーケストレーションスキル
- 主要機能: 最大6タスク並列実行。各タスク内で実装∥テスト実装→テスト実行→設計準拠レビュー∥コード品質レビューの工程を管理。工程チェック表(1工程=1行)で状態管理
- 呼び出し元: 実装ループを持つフェーズスキル（例: fs-change-phase2-impl Step 10）
- 追加ファイル: implementer-prompt.md（micro-impl-agent用）, spec-reviewer-prompt.md（design-review-agent用）, code-quality-reviewer-prompt.md（code-review-agent用）

### ddd-modeling
- 役割: DDD採用可否判断とレイヤードアーキテクチャ設計・ドメインモデリングを提供
- 主要機能: 4モード（create-architecture/create-domain/delta/reverse）。DDD3観点分析、アーキテクチャパターン選択、ユビキタス言語辞書作成、ドメインオブジェクト設計、品質チェック（貧血症/集約境界/インフラ浸食/用語統一）
- 呼び出し元: fs-design-phase7-ddd, fs-design-phase8-object, fs-change-phase2-impl, fs-refactoring-phase4-design, fs-reverse-phase5-optional-phases
- 追加ファイル: なし（SKILL.mdのみ）

### design-gate
- 役割: 設計書の存在と完了状態を機械的に確認するハードゲート。設計書なしの実装を防止
- 主要機能: doc-index.md読み取り→コア4ファイル（program-structure/dev-environment/system-requirements/user-requirements）の実体チェック→設計書と実装の整合性チェック。FAIL時はpending-issues登録+逆引きWF案内
- 呼び出し元: 実装WF/変更WF/リファクタリングWF/バグ修正WF（各開始時）
- 追加ファイル: design-doc-review-prompt.md（設計書レビュー用）, design-code-consistency-prompt.md（設計-コード整合性チェック用）

### design-qa-dispatch
- 役割: 設計成果物のQAレビューを適切なQAレビューアーエージェントにディスパッチする
- 主要機能: design-workflowモード（指定QAレビューアー直接呼び出し）とdelta-designモード（対応表に基づくQAレビューアー選択）。全レビューアーの結果を集約してAPPROVED/REJECTEDを返す
- 呼び出し元: fs-design-phase3/7/8/10（設計WFゲート1-4）, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design
- 追加ファイル: なし（SKILL.mdのみ）

### design-sync
- 役割: 設計書と実装の乖離を検出・分類し、同期を取るプロセスを管理
- 主要機能: 5フェーズ（乖離検出と分類→合理的乖離判定→修正案作成とユーザー承認→設計書更新→タスクリスト再構築）。軽微/中程度/重大の3分類で影響範囲を評価
- 呼び出し元: multi-stage-code-review, 各WFの実装フェーズスキル（レビューで乖離検出時）
- 追加ファイル: なし（SKILL.mdのみ）

### doc-index-maintenance
- 役割: doc-index.md（設計書一覧と状態管理）の作成・更新・削除を管理する唯一のスキル
- 主要機能: 5プロセス（A:作成時更新/B:更新時更新/C:削除時更新/D:新規作成/E:整合性チェック）。作業中ドキュメントは登録しないルール
- 呼び出し元: 全7WFの各フェーズ完了後、revert処理時
- 追加ファイル: なし（SKILL.mdのみ）

### doc-sync
- 役割: WF最終フェーズで差分設計書の内容を既存設計書にマージする（設計書反映）
- 主要機能: 6フェーズ（doc-index読み込み→入力確認→反映計画作成→設計書更新→一貫性チェック→ユーザー確認+history.md管理）。差分設計書(delta-design/fix-design/refactoring-design)を正式設計書にマージ
- 呼び出し元: 変更WFフェーズ9, バグ修正WFフェーズ6, リファクタリングWFフェーズ5
- 追加ファイル: なし（SKILL.mdのみ）

### error-handling-review
- 役割: 実装コードのエラーハンドリング品質を検証するレビュールール集
- 主要機能: 6検証項目（レイヤー間例外変換/例外ラップ正確性/Raises仕様チェック/try-exceptの適切性[もみ消し防止・チェイン・bare except・スコープ最小化・リソース管理]/ログ出力[二重計上防止]/エラーメッセージ品質）
- 呼び出し元: code-review-agent（mode: implementation）。multi-stage-code-review経由
- 追加ファイル: なし（SKILL.mdのみ）


### folder-merge-check
- 役割: 起因元ドキュメントフォルダへの統合可否をユーザーに確認し、承認時にファイル移動・history.md更新を実行
- 主要機能: 起因元フォルダ存在確認→経緯確認（history.md）→起因元要件との関連性判断→ユーザー確認→ファイル移動（恒久的設計資産は追記、その時用ファイルはold/退避）→history.md更新→結果返却
- 呼び出し元: fs-change-phase1-analysis, fs-bugfix-phase1-analysis, fs-refactoring-phase2-candidates
- 追加ファイル: なし（SKILL.mdのみ）

### git-commit-workflow
- 役割: WFフェーズ完了時のgitコミットを安全に実行する定型プロセス
- 主要機能: git管理状態確認→コミットメッセージ言語確認→変更ファイル確認（untracked調査/.gitignore整備）→コミットメッセージ生成（プレフィックス+Docs:フッター）→ユーザー承認→コミット・プッシュ。revertプロセスも含む
- 呼び出し元: 全7WFのフェーズ完了ごと
- 追加ファイル: なし（SKILL.mdのみ）

### gui-design
- 役割: GUI画面構成・配色・レイアウト・操作フロー・画面遷移を定義する
- 主要機能: 3モード（create/reverse/delta）。画面構成定義、配色・レイアウト設計、操作フロー設計、画面遷移定義。フレームワーク制約を考慮した現実的設計
- 呼び出し元: fs-design-phase5-gui, fs-reverse-phase5-optional-phases, 変更/リファクタリングWFの差分設計
- 追加ファイル: gui-designer-prompt.md（新規作成用サブエージェントプロンプト）, gui-reverse-prompt.md（逆引き用サブエージェントプロンプト）

### impl-coding-standards
- 役割: micro-impl-agentが1つの実装タスクを処理する際に従うべき詳細ルール集
- 主要機能: 粒度制御（1サブタスク=1呼び出し=1ファイル=1publicメソッド）、コーディング規約、動作確認試験書の更新、5モード（implement/write_test/run_test/fix/fix_test）の報告テンプレート
- 呼び出し元: micro-impl-agent（実装時に常に参照）
- 追加ファイル: なし（SKILL.mdのみ）

### impl-task-planning
- 役割: 設計書を依存関係グラフとして解析し、実装タスクを2層構造で分解する
- 主要機能: 依存関係グラフ構築→トポロジカルソートで実装順序決定→2層構造（親タスク=クラス/ファイル単位、サブタスク=publicメソッド単位）でタスク生成→網羅性チェック（漏れゼロまでループ）
- 呼び出し元: fs-impl-phase2-preparation, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase5-impl
- 追加ファイル: なし（SKILL.mdのみ）

### import-review
- 役割: import文のレイヤー間依存方向違反を機械的に検出するレビュールール集
- 主要機能: program-structure.mdのimportルール定義を読み込み、実装コードのimport文を解析し、内向き（domain側）以外の依存を検出。合理的乖離ルールの対象外（常に修正必須）
- 呼び出し元: design-review-agent（mode: implementation）。multi-stage-code-review経由
- 追加ファイル: なし（SKILL.mdのみ）

### infra-interface-design
- 役割: API定義・データストアスキーマ・外部サービス連携・リポジトリ具象実装のインターフェース仕様を具体化
- 主要機能: 4モード（create/delta/reverse/fix）。オブジェクト設計で定義されたドメインモデルに基づき、外部との境界仕様を実装可能レベルまで詳細化
- 呼び出し元: fs-design-phase9-infra, 変更/バグ修正/リファクタリングWFの差分設計, fs-reverse-phase5-optional-phases
- 追加ファイル: infra-interface-designer-prompt.md（サブエージェント用プロンプト）

### multi-stage-code-review
- 役割: 設計準拠レビュー（外を見る）と品質レビュー（中を見る）の2段階レビューパイプライン制御
- 主要機能: Stage 0（依頼内容チェック）→Stage 1a（設計準拠レビュー: design-review-agent）→Stage 1b（品質レビュー: code-review-agent）。両方PASSしない限りコードを受け入れない。非プログラム成果物は設計準拠のみ
- 呼び出し元: 実装WF/変更WF/バグ修正WF/リファクタリングWFの各実装タスク完了後
- 追加ファイル: なし（SKILL.mdのみ）

### object-design
- 役割: Application/Infrastructure/Presentation層のクラス・インターフェース設計（ドメイン層はddd-modelingが担当）
- 主要機能: 3モード（create/delta/reverse）。SOLID原則とテスタビリティを全クラスに適用。OO設計の適用判断を含む
- 呼び出し元: fs-design-phase8-object, 変更/バグ修正/リファクタリングWFの差分設計, fs-reverse-phase5-optional-phases
- 追加ファイル: object-designer-prompt.md（サブエージェント用プロンプト）

### pending-issues-management
- 役割: WF実行中に発見したスコープ外の問題をpending-issues.mdに記録・管理する
- 主要機能: 4モード（record: 記録 / present: WF開始時に既存issue提示 / write-back: WF完了時チェック / delete: 解決済みissue削除）。記録なき問題は忘れ去られる原則
- 呼び出し元: 全WFの各フェーズ（問題発見時）、WF開始時・完了時
- 追加ファイル: なし（SKILL.mdのみ）

### phase-report-check
- 役割: フェーズスキルの前処理（進捗確認）と後処理（進捗更新）で呼び出される進捗管理スキル
- 主要機能: 4モード（verify: 前フェーズ完了確認 / write: 成果物確認+進捗ファイル更新 / fix_open: 修正起票 / fix_close: 修正完了）。progress-updaterサブエージェントに更新を委譲
- 呼び出し元: 全フェーズスキルの前処理・後処理（省略禁止）
- 追加ファイル: なし（SKILL.mdのみ）

### program-structure-design
- 役割: フォルダ構成・ファイル配置・importルール・命名規則の設計・更新
- 主要機能: 4モード（create/delta/reverse/fix）。レイヤードアーキテクチャの依存方向を具体的なフォルダ配置とimportルールで実装レベルに落とし込む。全クラスを漏れなくファイルに配置し、禁止importパスを明示
- 呼び出し元: fs-design-phase10-program, 変更/バグ修正/リファクタリングWFの差分設計, fs-reverse-phase1-program
- 追加ファイル: なし（SKILL.mdのみ）

### progress-resume-check
- 役割: 全7WFの先頭フェーズスキルから呼ばれる再開判定共通スキル
- 主要機能: 進捗ファイルを読み込み、ステータステーブルから状態列を解析し、次に実行すべきフェーズ番号を返す（RESUME_FROM N / FRESH_START / ALL_COMPLETED）。進捗ファイルはRead only（書かない）
- 呼び出し元: 全7WFの先頭フェーズスキル（fs-*-phase1-*）
- 追加ファイル: なし（SKILL.mdのみ）

### rules-distribute
- 役割: aide-powersのルールを各プラットフォームのルールファイル機構に配置する
- 主要機能: 2モード（global: global-rules.mdを常時適用ルールとして配置 / skill: スキルルールを動的配置・削除）。プラットフォーム判定→ターゲットファイル生成→配置
- 呼び出し元: aide-powers-guide初期アクション、WF開始/終了時、共通スキル開始/終了時
- 追加ファイル: なし（SKILL.mdのみ）

### screenshot-capture
- 役割: 現在のアクティブ画面のスクリーンショットを撮影・保存する
- 主要機能: 保存先ディレクトリ準備→.venvにpyautogui導入→撮影実行（pyautogui.screenshot）→保存確認
- 呼び出し元: GUIモックアップ確認時、ユーザーへの視覚的確認が必要な場面
- 追加ファイル: なし（SKILL.mdのみ）

### session-handover
- 役割: セッション切り替え時の作業状態引き継ぎファイルの生成・更新・読み込み管理
- 主要機能: 4プロセス（1: session-handover.md自動更新 / 2: 新セッション読み込み / 3: セッション切り替え推奨+引き継ぎ生成 / 4: 新セッション用プロンプト提示[省略禁止]）。.gitignore保証付き
- 呼び出し元: WFフェーズ完了時（自動更新）、コンテキスト圧縮時、ユーザーからの明示的指示時
- 追加ファイル: なし（SKILL.mdのみ）

### step-history-writer
- 役割: 各フェーズスキルのStep完了時にセッション履歴を.aide/tmp/に書き出す
- 主要機能: 指定されたstep_idの会話履歴（role+発言内容）をそのまま転記。要約・整形・解釈禁止。step_idごと1ファイル厳守（束ね禁止）。毎Step activate必須
- 呼び出し元: 全フェーズスキルの各Step完了時
- 追加ファイル: なし（SKILL.mdのみ）

### system-requirements-definition
- 役割: 技術スタック・非機能要件・開発環境の定義を担当
- 主要機能: 4モード（create/reverse/delta/fix）。ユーザーヒアリング→実現手段検討→制限事項・セキュリティ・非機能要件整理→ログ出力方針定義→開発環境標準化。AIが勝手に決めない原則
- 呼び出し元: fs-design-phase2-system-req, fs-reverse-phase3-system-req, 変更WF等
- 追加ファイル: system-requirements-architect-prompt.md（新規作成用）, reverse-system-requirements-prompt.md（逆引き用）

### task-orchestration
- 役割: 複雑なタスク・大量の反復タスクを精度よくこなすための計画・実行管理
- 主要機能: ヒアリング（目的/成果物/情報/ツール/手法）→計画書作成(.aide/task-plans/)→計画に基づく実行。3+ファイルへの同一変更パターン適用時にセルフトリガー
- 呼び出し元: AIエージェント自身がセルフトリガー（3+ファイルの同一パターン適用/5+ファイルタッチ等）、ユーザー指示
- 追加ファイル: なし（SKILL.mdのみ）

### tech-investigation
- 役割: 技術要素の実現可能性を調査し、構造化された調査結果を返す
- 主要機能: Web検索を活用して最新情報を確認。プラットフォーム別のWeb検索手段（ネイティブ/MCP server/WebFetch代替）に対応。知っている情報でも必ず最新確認
- 呼び出し元: 技術的な質問への回答時、課題発生時、実現性確認時
- 追加ファイル: なし（SKILL.mdのみ）

### test-review
- 役割: テストコードのカバレッジ（設計書テスト観点）とテスト方針準拠（命名/独立性/モック禁止/境界値/異常系）を検証
- 主要機能: テスト観点カバー率100%検証 + テスト方針準拠チェック（モックライブラリ使用禁止、正規のダミー実装をDI経由で注入する原則）。両方満たさない限り受け入れ不可
- 呼び出し元: code-review-agent（mode: test）、design-review-agent（テスト網羅性検証時）
- 追加ファイル: なし（SKILL.mdのみ）

### toolmap-verifier
- 役割: 現在のプラットフォームでツールマップに記載されたツールが実際に使用可能かを検証
- 主要機能: プラットフォーム特定→ツールマップ読み込み・パース→実際のツール検証。ツールマップとの一貫性をチェック
- 呼び出し元: 必要に応じて（ツール名変換の正確性確認時）
- 追加ファイル: なし（SKILL.mdのみ）

### usecase-analysis
- 役割: 要件定義後・詳細設計前にユースケースを網羅的に洗い出し、改善する4段階プロセス
- 主要機能: 4工程（UC網羅リストアップ→プロセス定義→ユーザビリティ定量評価→低評価UC改善[最大3回ループ]）。サブエージェントに委譲
- 呼び出し元: fs-design-phase6-usecase
- 追加ファイル: なし（SKILL.mdのみ）※プロンプトテンプレートはSKILL.md内で言及

### user-profile-management
- 役割: ユーザーの技術レベルを会話から推定し、コミュニケーション粒度を動的調整
- 主要機能: 3軸×5段階（ドメイン知識/プログラミング/システム・インフラ）で推定。直接聞かず観察して推定。git config user.emailで個別識別。プロファイルに基づいて説明深さ・専門用語使用・選択肢提示方法を調整
- 呼び出し元: 初回会話後、プロファイルと実際の会話にギャップ検知時、WF完了時
- 追加ファイル: なし（SKILL.mdのみ）

### user-requirements-definition
- 役割: ユーザー要件の定義・更新（目的と手段の分離+ヒアリング必須）
- 主要機能: 3モード（create/reverse/delta）。ユーザーの要望を「目的」と「手段」に分離し、目的を要件として整理。AIが勝手に要件を決めない原則
- 呼び出し元: fs-design-phase1-user-req, fs-reverse-phase4-user-req, 変更WF
- 追加ファイル: user-requirements-architect-prompt.md（新規作成用）, reverse-user-requirements-prompt.md（逆引き用）

### visual-companion
- 役割: ブラウザベースのビジュアルコンパニオン。モックアップ・図表・選択肢をブラウザ表示
- 主要機能: Node.jsベースのWebSocketサーバー。screen_dir監視→最新HTMLをブラウザに配信→ユーザーのクリック選択をevents JSONで受信。HTMLフラグメントを自動ラップ
- 呼び出し元: ユーザーに見せたい情報があるとき、成果物確認時、判断を仰ぐとき
- 追加ファイル: scripts/（サーバー実装スクリプト群）

### 共通スキル群の横断的パターン

#### カテゴリ分類

| カテゴリ | スキル |
|---|---|
| **ワークフロー制御** | aide-powers-guide, progress-resume-check, phase-report-check, session-handover, step-history-writer |
| **設計支援** | ddd-modeling, object-design, gui-design, infra-interface-design, program-structure-design, usecase-analysis, user-requirements-definition, system-requirements-definition |
| **実装支援** | coding-test-2review, impl-coding-standards, impl-task-planning, task-orchestration |
| **品質保証（レビュー）** | multi-stage-code-review, code-quality-review, error-handling-review, import-review, test-review, design-qa-dispatch |
| **設計-実装整合性** | design-gate, design-sync, doc-sync, doc-index-maintenance, folder-merge-check |
| **インフラ/ユーティリティ** | git-commit-workflow, rules-distribute, toolmap-verifier, tech-investigation, screenshot-capture, visual-companion |
| **問題管理/メタ** | pending-issues-management, user-profile-management |

#### ファイル構成パターン

| パターン | スキル数 | 説明 |
|---|---|---|
| SKILL.mdのみ | 27個 | ルール提供型スキル。SKILL.md内に全ルール・プロセスを記述 |
| SKILL.md + プロンプトテンプレート | 8個 | サブエージェント委譲型。*-prompt.mdでサブエージェントへの指示を分離 |
| SKILL.md + scripts/ | 1個 | ツール提供型（visual-companion）。実行可能なスクリプトを含む |

#### プロンプトテンプレートを持つスキル

- coding-test-2review: implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md
- design-gate: design-doc-review-prompt.md, design-code-consistency-prompt.md
- gui-design: gui-designer-prompt.md, gui-reverse-prompt.md
- infra-interface-design: infra-interface-designer-prompt.md
- object-design: object-designer-prompt.md
- system-requirements-definition: system-requirements-architect-prompt.md, reverse-system-requirements-prompt.md
- user-requirements-definition: user-requirements-architect-prompt.md, reverse-user-requirements-prompt.md

---

## パス3: docs-dev/ 詳細解析

### docs-dev/00-overview.md

- **役割**: aide-powers 全体像を1ページで把握するための入口ドキュメント
- **主要セクション構成**: (1) aide-powersとは何か (2) 何を解決するか（3つの解決アプローチ） (3) 構成要素の俯瞰 (4) 7つのワークフロー一覧 (5) 対応プラットフォーム (6) 開発者向けドキュメントの読み方
- **参照関係**: 01-system-platform/00-architecture.md、02-ai-agent/01-workflows/00-overview.md、01-system-platform/06-execution-units.md、01-system-platform/02-multiplatform.md、03-how-to/ 各ファイル

### docs-dev/01-system-platform/00-architecture.md

- **役割**: aide-powers の4層構成（起動層・ハブ層・ルール層・実行層）とその関係を定義
- **主要セクション構成**: (1) ねらい (2) 4層構成テーブル (3) 全体図（Mermaid） (4) 起動から実作業までの流れ (5) 配布単位とインストール形態 (6) 章間の責務分担 (7) 設計上の重要原則
- **参照関係**: 01-hub-skill-activation.md、02-multiplatform.md、03-platform-bootstrap/README.md、04-skill-map.md、05-dynamic-rules.md、06-execution-units.md

### docs-dev/01-system-platform/01-hub-skill-activation.md

- **役割**: ハブスキル方式の設計思想、3パターンの起動層（常時注入型/フック型/ファイル参照型）、Quick Routing テーブル、スキル連鎖の仕組みを定義
- **主要セクション構成**: (1) なぜハブスキル方式か (2) プラットフォーム認識の3パターン (3) ハブスキル本体2種 (4) 初期アクション3STEP (5) Quick Routing分岐テーブル (6) プラットフォーム別呼び出し方 (7) スキル連鎖 (8) 二重実行防止（冪等性） (9) ハブスキルが読めないときの反論ルール
- **参照関係**: 03-platform-bootstrap/、05-dynamic-rules.md、using-aide-powers SKILL.md

### docs-dev/01-system-platform/02-multiplatform.md

- **役割**: マルチプラットフォーム対応の設計思想とツールマップ機構を定義
- **主要セクション構成**: (1) 対応プラットフォーム8種 (2) マルチPF対応の理由 (3) 差異が出る4箇所 (4) ツールマップの位置付け (5) ツールマップ一覧（6ファイル） (6) ツールマップ参照の規範化 (7) ルールファイル形式の差異 (8) 起動層の差異 (9) プラットフォーム認識フロー (10) 触ってはいけない領域との分離
- **参照関係**: 05-dynamic-rules.md、03-platform-bootstrap/README.md、.aide/references/{platform}-tools.md

### docs-dev/01-system-platform/03-platform-bootstrap/README.md

- **役割**: プラットフォーム別の起動処理インデックス。3パターン（常時注入型/フック型/ファイル参照型）の一覧と各プラットフォーム詳細ページへのリンク
- **主要セクション構成**: (1) 起動層の役割 (2) PF別起動機構一覧 (3) 全体図（Mermaid） (4) 共通パターン3種 (5) 共通の到達点 (6) PF別詳細ページ一覧 (7) 章境界
- **参照関係**: kiro.md、claude-code.md、cursor.md、copilot.md、opencode.md、gemini.md、codex.md、01-hub-skill-activation.md

### docs-dev/01-system-platform/03-platform-bootstrap/{kiro,claude-code,copilot,cursor,gemini,codex,opencode}.md

- **役割**: 各プラットフォーム別の起動シーケンス・配置物・ルール配置先・特殊事項の詳細（7ファイル）

### docs-dev/01-system-platform/04-skill-map.md

- **役割**: スキル群の分類定義（ハブ/フェーズ/共通/メタ/共通エージェント）と件数集計
- **主要セクション構成**: (1) スキル分類定義 (2) ハブスキル2件 (3) フェーズスキル45件（7WF別内訳） (4) 共通スキル24件（4分類） (5) メタスキル4件 (6) 共通エージェント8件 (7) 集計（合計75スキル+8エージェント）
- **参照関係**: 01-hub-skill-activation.md、02-ai-agent/01-workflows/00-overview.md、02-ai-agent/02-phase-skills/、02-ai-agent/03-common-skills/00-overview.md、02-ai-agent/04-agents/00-overview.md

### docs-dev/01-system-platform/05-dynamic-rules.md

- **役割**: rules-distribute スキルによるルールファイル動的生成機構の設計書。global/skillの2モード、配置先、残骸削除、忘却対策5層を定義
- **主要セクション構成**: (1) なぜファイル化するか (2) 2モード（global/skill） (3) globalモード動作（入力・配置先・必須ルール・targets.md・フロー） (4) skillモード動作（用途・抽出範囲・命名規則・配置先・目的宣言） (5) 自動生成マーカー (6) 残骸削除3層保険 (7) 呼び出しタイミング (8) .gitignore推奨 (9) 忘却対策5層全体像
- **参照関係**: using-aide-powers SKILL.md、.aide/references/global-rules.md、.aide/ai-agent-platform-targets.md

### docs-dev/01-system-platform/06-execution-units.md

- **役割**: リポジトリ内の各フォルダ・ファイルがどのプラットフォームのどの機構に対応するかを物理的に整理
- **主要セクション構成**: (1) リポジトリ構成俯瞰 (2) skills/ (3) agents/ (4) hooks/ (5) steering/ (6) instructions/ (7) .claude-plugin/ (8) .codex/INSTALL.md (9) GEMINI.md/AGENTS.md (10) setup.bat/setup.sh (11) setup-local.bat/setup-local.sh (12) cleanup-kiro-agent.bat (13) 配置物→機構対応マップ (14) ワークスペース側生成物 (15) 章境界
- **参照関係**: 04-skill-map.md、03-platform-bootstrap/

### docs-dev/02-ai-agent/00-overview.md

- **役割**: 第2章入口。3つの登場人物（フェーズスキル/共通スキル/共通エージェント）の定義と章構成を示す
- **主要セクション構成**: (1) 章の構成 (2) 3種類の構成要素テーブル (3) 7つのワークフロー (4) 章境界 (5) 読み進め方
- **参照関係**: 01-workflows/00-overview.md、02-phase-skills/、03-common-skills/、04-agents/

### docs-dev/02-ai-agent/01-workflows/00-overview.md

- **役割**: 7ワークフローの全体像・相互関係・横断共通スキル・QA体制の概観
- **主要セクション構成**: (1) 7WFの関係（Mermaid） (2) ワークフロー一覧テーブル（フェーズ数・QAゲート数） (3) 横断で動く共通スキル8種 (4) QA体制概観（設計WF4ゲート/差分QA/多段コードレビュー）
- **参照関係**: 02-phase-skills/、03-common-skills/、04-agents/00-overview.md

### docs-dev/02-ai-agent/01-workflows/{01-planning〜07-refactoring}.md（7ファイル）

- **役割**: 各ワークフロー個別のフェーズ流れ・ゲート構成・成果物一覧を記述

### docs-dev/02-ai-agent/02-phase-skills/00-overview.md

- **役割**: フェーズスキルの命名規則、SKILL.md共通構造、Iron Law/Red Flags/REQUIRED SUB-SKILL連鎖の設計を定義
- **主要セクション構成**: (1) 命名規則 `fs-{workflow}-phase{N}-{name}` (2) 配置 (3) SKILL.md共通構造テーブル（13セクション） (4) Iron LawとRed Flags (5) REQUIRED SUB-SKILL連鎖 (6) rules-distribute skill:deploy/cleanup必須 (7) グローバルルール参照必須 (8) WF本体が直接やってよい/いけないこと
- **参照関係**: 第1章全般、各WF別ファイル（planning.md〜refactoring.md）

### docs-dev/02-ai-agent/02-phase-skills/{planning,design,impl,reverse,change,bugfix,refactoring}.md（7ファイル）

- **役割**: 各ワークフローのフェーズスキル責務一覧・Iron Law代表例

### docs-dev/02-ai-agent/03-common-skills/00-overview.md

- **役割**: 共通スキルの位置づけ・フェーズスキルとの違い・3分類（配布運用系/設計系/実装系）定義
- **主要セクション構成**: (1) 共通スキルとは (2) フェーズスキルとの違いテーブル (3) 3分類テーブル（infrastructure/design/impl） (4) 使い分けガイド (5) エージェントとの関係
- **参照関係**: infrastructure.md、design.md、impl.md、04-agents/

### docs-dev/02-ai-agent/03-common-skills/{design,impl,infrastructure}.md（3ファイル）

- **役割**: 各分類の共通スキル詳細（目的・呼び出し元・Iron Law）

### docs-dev/02-ai-agent/04-agents/00-overview.md

- **役割**: 共通エージェント8件の一覧・ホワイトリスト3エージェント定義・4ステータス運用・委譲原則
- **主要セクション構成**: (1) 2分類（実装系/QA系） (2) 全エージェント一覧テーブル (3) ホワイトリスト3エージェント (4) ステータス4種（DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED） (5) 委譲原則 (6) 行動規範
- **参照関係**: implementation-agents.md、qa-agents.md

### docs-dev/02-ai-agent/04-agents/{implementation-agents,qa-agents}.md（2ファイル）

- **役割**: 実装系3エージェント・QAレビューアー5エージェントの詳細

### docs-dev/03-how-to/add-workflow.md

- **役割**: 新規ワークフロー追加の作業手順ガイド

### docs-dev/03-how-to/add-phase-skill.md

- **役割**: 既存ワークフローへのフェーズスキル追加手順ガイド

### docs-dev/03-how-to/add-common-skill.md

- **役割**: 共通スキル追加手順ガイド

### docs-dev/03-how-to/add-agent.md

- **役割**: 共通エージェント追加手順ガイド

### docs-dev/03-how-to/release.md

- **役割**: aide-powers 新バージョンのリリース手順ガイド

---

## パス3: hooks/ 詳細解析

### hooks/hooks.json

- **役割**: Claude Code / Copilot CLI / VSCode Copilot のフック登録設定
- **内容**: `SessionStart` イベントの `startup|clear|compact` マッチャーで `run-hook.cmd session-start` を同期実行
- **構造**: `{ "hooks": { "SessionStart": [{ "matcher": "startup|clear|compact", "hooks": [{ "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start", "async": false }] }] } }`

### hooks/brainstorm-selection.json

- **役割**: visual-companion スキル連携用のファイルイベントフック
- **内容**: `.aide/brainstorm/*/signal/browser-selection.json` 作成時に `askAgent` を発火し、ブラウザでの選択を AI Agent に通知
- **トリガー**: `fileCreated` パターン `**/.aide/brainstorm/*/signal/browser-selection.json`

### hooks/run-hook.cmd

- **役割**: Windows/Unix 両対応のポリグロットスクリプト（bash起動ブリッジ）
- **内容**: `: << 'CMDBLOCK'` で bash と cmd 両方から解釈可能。Windows 側は Git for Windows の bash.exe を探して指定スクリプトを実行。Unix 側は `exec bash` で直接実行。bash が見つからない場合はサイレントに exit 0。
- **用途**: hooks.json の `command` フィールドから呼ばれ、`session-start` スクリプトを起動

### hooks/session-start

- **役割**: SessionStart hook 本体。`using-aide-powers/SKILL.md` を読み込み、JSON エスケープして各プラットフォーム固有のフィールド名で出力
- **内容**:
  1. PLUGIN_ROOT から `skills/using-aide-powers/SKILL.md` を探索（2パスフォールバック）
  2. ファイル内容を bash パラメータ展開で JSON エスケープ（`escape_for_json` 関数）
  3. `<EXTREMELY_IMPORTANT>` タグで包んだコンテキスト文字列を構築
  4. 環境変数でプラットフォーム判別: `CURSOR_PLUGIN_ROOT` → `additional_context`、`CLAUDE_PLUGIN_ROOT` → `hookSpecificOutput.additionalContext`、その他 → `additionalContext`
- **プラットフォーム判別ロジック**: Cursor > Claude Code > Copilot CLI/SDK標準 の優先順

---

## パス3: .apm/ 詳細解析

### .apm/instructions/aide-powers-bootstrap.instructions.md

- **役割**: APM 配布用のブートストラップ instructions ソース。`instructions/` のファイルとほぼ同一だが、APM 固有の front-matter（`description` フィールド追加）を持つ
- **front-matter**: `description: aide-powers bootstrap...`, `applyTo: "**"`
- **マーカー**: `<!-- [aide-powers:bootstrap] このファイルは APM 配布用ソース。手動編集禁止。 -->`
- **本文**: 他のブートストラップファイルと同一（using-aide-powers activate 指示）

### .apm/instructions/aide-powers-global-rules.instructions.md

- **役割**: APM 配布用のグローバルルール instructions ソース。`rules-distribute` が生成する `.kiro/steering/aide-powers-global-rules.md` 等と同等内容をAPM形式で保持
- **front-matter**: `description: aide-powers global rules...`, `applyTo: "**"`

### .apm/instructions/aide-powers-phase-skill-rules.instructions.md

- **役割**: APM 配布用のフェーズスキルルール instructions ソース。`rules-distribute` が生成する `.kiro/steering/aide-powers-phase-skill-rules.md` 等と同等内容をAPM形式で保持
- **front-matter**: `description: aide-powers phase skill execution rules...`, `applyTo: "**"`

### ルート `instructions/` との差異

| 観点 | `instructions/` | `.apm/instructions/` |
|---|---|---|
| ファイル数 | 1（bootstrap のみ） | 3（bootstrap + global-rules + phase-skill-rules） |
| front-matter | `applyTo: '**'` のみ | `description` + `applyTo: "**"` |
| マーカー | `[aide-powers:bootstrap]` | `[aide-powers:bootstrap]` または `[aide-powers:auto-generated]` |
| 用途 | setup.bat による Copilot CLI / VSCode 配布 | APM パッケージマネージャ配布 |
| 内容の正本 | `steering/aide-powers-bootstrap.md` と同一 | global-rules / phase-skill-rules は `.aide/references/` と同一 |

---

## パス3: docs/ 詳細解析

### docs/01-about.md

- **役割**: aide-powers の特徴・他AI Agentとの違い・メリット/デメリット・向き不向きを俯瞰する判断材料ページ
- **主要セクション**: 一言で言うと / 解決したい問題 / 3つの特徴 / 他との違い / AIモデル別任せ度 / メリット / デメリット / 向き不向き / ライセンスと動作要件

### docs/02-getting-started.md

- **役割**: インストールと初回利用開始までの手順書（前提条件→インストール→起動確認→判断基準）
- **主要セクション**: 前提条件 / git clone / setup 実行 / 動作確認

### docs/03-usage.md

- **役割**: インストール後の実際の使い方ガイド（普通に話しかけるだけでWFが起動する旨の説明）
- **主要セクション**: 基本の流れ / ワークフロー選択 / フェーズ進行 / セッション管理 / トークン消費

### docs/04-faq.md

- **役割**: 利用エンジニア向けFAQ（動作の基本・トラブル・実運用のQ&A形式）
- **主要セクション**: 動作の基本 / ワークフロー / セッション管理 / プラットフォーム固有

### docs/05-troubleshooting.md

- **役割**: インストール・設定・利用上の問題と対処手順（症状/原因/対処の3点セット形式）
- **主要セクション**: スキル認識されない / hook発火しない / ルール適用されない / セッション引き継ぎ失敗

### docs/kiro-cli-custom-agent.md

- **役割**: Kiro CLI カスタムエージェント使用時に aide-powers の steering/skills を明示追加する手順
- **主要セクション**: なぜ必要か / resources フィールド設定方法

---

## パス3: 配布用ファイル群 詳細解析

### steering/aide-powers-bootstrap.md

- **内容**: Kiro IDE 用ブートストラップ。front-matter `inclusion: always`。本文は「aide-powers がインストールされています。ソフトウェア開発要求時に using-aide-powers を activate せよ」の数行。
- **配布先**: `~/.kiro/steering/`

### rules/aide-powers-bootstrap.md

- **内容**: Claude Code 用ブートストラップ。front-matter なし。マーカー `[aide-powers:bootstrap]`。本文は steering 版と同一。
- **配布先**: `~/.claude/rules/`

### rules/aide-powers-bootstrap.mdc

- **内容**: Cursor 用ブートストラップ。front-matter `alwaysApply: true` + `description`。本文は他と同一。
- **配布先**: `~/.cursor/rules/`

### instructions/aide-powers-bootstrap.instructions.md

- **内容**: GitHub Copilot 用ブートストラップ。front-matter `applyTo: '**'`。マーカー `[aide-powers:bootstrap]`。本文は他と同一。
- **配布先**: `~/.copilot/instructions/` および `%APPDATA%\Code\User\prompts\`

### .claude-plugin/plugin.json

- **内容**: Claude Code プラグインメタデータ。name=`aide-powers`、version=`1.0.0`、license=`Kyocera-Internal-Only`、keywords含む。
- **用途**: `claude plugin install` 時に読み込まれるプラグイン定義

### .claude-plugin/marketplace.json

- **内容**: マーケットプレース定義。name=`aide-powers-dev`、plugins配列に aide-powers エントリ（source=`./`）。
- **用途**: 自前プラグインマーケットプレースの入口メタデータ

### .claude/rules/aide-powers-bootstrap.md

- **内容**: Claude Code ワークスペース用ブートストラップ。`aide-agent` への切り替え指示（ルート `rules/` 版とは異なり `aide-agent` エージェント切り替えを指示）。
- **配置**: setup-local.bat が配置

### .codex/INSTALL.md

- **内容**: Codex 利用者向けインストール手順書。git clone → 手動コピー（bash/PowerShell）→ 検証 → 更新 → アンインストール手順。
- **配布**: setup.bat では配布しない。Codex が `.codex/` を自動認識

### .vscode/settings.json

- **内容**: 空の JSON オブジェクト `{}`。VSCode ワークスペース設定の placeholder。

---

## パス3: ルートファイル群 詳細解析

### setup.bat / setup.sh

- **役割**: グローバルインストーラ。ユーザーのホームディレクトリ配下に aide-powers を配置
- **主要ロジック**:
  1. プラットフォーム選択メニュー（番号1〜7:全部 / 1〜6:全部）
  2. 旧構造クリーンアップ（`cleanup_legacy_skills` — フラット化前の `*-workflow/` フォルダ削除）
  3. 配置先マッピング: Kiro→`~/.kiro/{skills,agents,steering}`、Claude Code→`~/.claude/{hooks,skills,agents}`、Copilot→`~/.copilot/{skills,agents,instructions}` + `%APPDATA%\Code\`、Gemini→エクステンションリンク案内、Codex→`~/.agents/`
  4. 既存ディレクトリの y/N 確認後コピー
  5. VSCode Copilot の場合 `settings.json` に `chat.pluginLocations` / `chat.plugins.enabled` 追記

### setup-local.bat / setup-local.sh

- **役割**: ローカルインストーラ。ワークスペース内に aide-powers を直接配置（チーム共有用）
- **主要ロジック**:
  1. プラットフォーム選択（Kiro / Claude Code / VSCode Copilot）
  2. 配置先: Kiro→`{project}/.kiro/{skills,agents,steering}`、Claude Code→`{project}/{skills,agents,hooks,.claude-plugin}`、VSCode→`{project}/.github/{skills,hooks}`
  3. .github/skills/ にはフェーズスキルを除外した共通スキル+ハブスキルのみ配置（37フォルダ）

### apm.yml

- **役割**: APM（AI Agent Package Manager）パッケージ定義
- **内容**: `name: aide-powers`、`version: 1.0.0`、`author: KC Developer Team`、`repository: https://10.110.47.117/kc-apm/kc-aide-powers`、`license: Kyocera-Internal-Only`、`targets: [kiro, claude, copilot, codex, gemini]`

### gemini-extension.json

- **役割**: Gemini CLI エクステンション定義
- **内容**: `{ "name": "aide-powers", "contextFileName": "GEMINI.md" }` — `gemini extensions link .` 実行時にこのファイルが読まれ、`GEMINI.md` をコンテキストファイルとして認識する

### GEMINI.md

- **役割**: Gemini CLI 用コンテキストファイル。`@import` で SKILL.md とツールマップを展開
- **内容**: 2行のみ — `@./skills/using-aide-powers/SKILL.md` + `@./.aide/references/gemini-tools.md`

### aide-powers-global-rules.agents.md

- **役割**: OpenCode / Codex 用グローバルルール。`AGENTS.md` から参照される。`rules-distribute` の global モードで自動追記される。

### README.md

- **役割**: リポジトリの顔。aide-powers の概要・7WF一覧・クイックスタート（git clone + setup 実行）を記載
- **主要セクション**: 何ができるか（7WFテーブル） / クイックスタート / 詳細ドキュメントへのリンク

### LICENSE

- **役割**: ライセンス定義ファイル（`Kyocera-Internal-Only`）

### .gitattributes

- **役割**: git 属性設定。bat ファイルに `-text diff` を指定（改行コード自動変換の抑制）

### .gitignore

- **役割**: git 除外設定。`.aide/tmp/`、`.aide/references/`、`.venv/`、`temp/`、`aide-powers-skill--*` 等を除外

### cleanup-kiro-agent.bat / cleanup-kiro-agent.sh

- **役割**: aide-powers 前身（kiro-agent）の旧構成を安全に削除するスクリプト
- **削除対象**: `.kiro/steering/aide-powers-global-rules.md`、`.kiro/agents/` 配下22ファイル、ルート `AGENTS.md`、ルート `aide-powers-global-rules.agents.md`
- **保持対象**: `.kiro/specs/`、`.kiro/` フォルダ自体

---

## パス3: .github/ 差異確認

### .github/skills/ と skills/ の差異

`.github/skills/` には **37フォルダ** が配置されている（共通スキル + ハブスキル `aide-powers-guide` + `using-aide-powers`）。
`skills/` には **78フォルダ** が存在する（全スキル）。

**差異**: `.github/skills/` にはフェーズスキル（`fs-*`）が含まれていない。これは `setup-local.bat` の仕様で、VSCode Copilot ワークスペース版にはフェーズスキルを除外して共通スキル+ハブスキルのみ配置する設計。

`.github/skills/` に含まれるが `skills/` に含まれない: なし
`skills/` に含まれるが `.github/skills/` に含まれない: `fs-*` 全41フォルダ（planning4 + design11 + impl7 + reverse6 + change3 + bugfix3 + refactoring7）

### .github/hooks/ と hooks/ の同一性

`.github/hooks/` には `hooks/` と同じ4ファイル（`brainstorm-selection.json`、`hooks.json`、`run-hook.cmd`、`session-start`）が存在する。`setup-local.bat` によるミラーコピー。内容は同一。

### .github/instructions/ の内容

| ファイル | 内容 |
|---|---|
| `aide-powers-bootstrap.instructions.md` | ブートストラップ（`instructions/` のミラー） |
| `aide-powers-global-rules.instructions.md` | グローバルルール（`rules-distribute` の global モードで生成されるワークスペース版） |

`instructions/` ルート（1ファイル）との差異: `.github/instructions/` には `aide-powers-global-rules.instructions.md` が追加で存在。これは `rules-distribute` がワークスペースローカル環境向けに生成するもの。


### 設計WF (fs-design-phase*)

#### fs-design-phase1-user-req
- 役割: ユーザー要件定義書（MoSCoW分類・EARS構文）を作成する。QAゲート1/4のREJECTED時にfix修正も担当
- プロセス: 前処理 → Step1: 企画WFからの引き継ぎ確認 → Step2: ユーザー要件定義 → 後処理
- 成果物: `user-requirements.md`, `tech-references/user-hints.md`（該当時）, `fs-design-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, pending-issues-management
- プロンプトテンプレート: `user-requirements-architect-prompt.md`（Step2）

#### fs-design-phase2-system-req
- 役割: 技術制約・ツール・プラットフォーム制限を収集し、システム要件定義書と開発環境定義書を作成
- プロセス: 前処理 → Step1: システム要件定義の実行 → 後処理
- 成果物: `system-requirements.md`, `dev-environment.md`, `fs-design-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, system-requirements-definition, doc-index-maintenance, git-commit-workflow, tech-investigation, pending-issues-management
- プロンプトテンプレート: `system-requirements-architect-prompt.md`（Step1）

#### fs-design-phase3-dev-plan
- 役割: 要件整合性を検証し開発計画書を作成。QAゲート1（要件定義レビュー）を実施
- プロセス: 前処理 → Step1: 前フェーズ成果物の確認 → Step2: 開発計画書の作成・整合性検証 → Step3: QAレビュー（ゲート1） → Step4: QA結果のユーザー共有 → 後処理
- 成果物: `development-plan.md`, `fs-design-phase3-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch（ゲート1→requirements-qa-agent）, doc-index-maintenance, git-commit-workflow, fs-design-phase1-user-req(fix), fs-design-phase2-system-req(fix)
- プロンプトテンプレート: `development-planner-prompt.md`（Step2）

#### fs-design-phase4-architecture
- 役割: システム構成設計書（アーキテクチャ図・ブロック図・設計判断）を作成
- プロセス: 前処理 → Step1: システム構成設計サブエージェント派遣 → 後処理
- 成果物: `system-architecture.md`, `tech-references/*.md`, `fs-design-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, tech-investigation, pending-issues-management, visual-companion
- プロンプトテンプレート: `system-architecture-designer-prompt.md`（Step1）

#### fs-design-phase5-gui
- 役割: GUI設計（GUI要否判定を含む）を実施。GUIスキップ時はdoc-indexに記録して次へ
- プロセス: 前処理 → Step1: GUI設計の作成（GUI要否判定を含む） → 後処理
- 成果物: `gui-design.md`（GUI実施時）, `fs-design-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, gui-design, visual-companion, doc-index-maintenance, git-commit-workflow, pending-issues-management
- プロンプトテンプレート: `gui-designer-prompt.md`（gui-designスキル経由）

#### fs-design-phase6-usecase
- 役割: ユースケース分析（網羅リストアップ→実現プロセス→ユーザビリティ評価→改善）を4段階+改善ループで実施
- プロセス: 前処理 → Step1: usecase-analysis活性化 → Step2: UC網羅リストアップ → Step3: 実現プロセス明確化 → Step4: ユーザビリティ評価 → Step5: 改善検討・最終まとめ → Step6: 改善反映ループ → Step7: ユーザー最終承認 → 後処理
- 成果物: `usecase-list.md`, `usecase-{uc名}.md`（各UC）, `usecase-analysis.md`, `fs-design-phase6-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, usecase-analysis, doc-index-maintenance, git-commit-workflow, pending-issues-management, visual-companion, task-orchestration
- プロンプトテンプレート: `usecase-lister-prompt.md`, `usecase-process-analyzer-prompt.md`, `usecase-usability-evaluator-prompt.md`, `usecase-improver-prompt.md`, `usecase-improvement-fix-prompt.md`, `usecase-coverage-reviewer-prompt.md`, `usecase-removal-prompt.md`

#### fs-design-phase7-ddd
- 役割: レイヤードアーキテクチャ設計とDDD採用判断を行い、QAゲート2を通過する
- プロセス: 前処理 → Step1: レイヤードアーキテクチャ設計（ddd-modeler createモード） → Step2: QAレビュー（ゲート2） → 後処理
- 成果物: `layered-architecture.md`, `ubiquitous-language.md`（初期版）, `fs-design-phase7-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, ddd-modeling, design-qa-dispatch（ゲート2→architecture-qa-agent）, doc-index-maintenance, git-commit-workflow, visual-companion, pending-issues-management
- プロンプトテンプレート: `ddd-modeler-prompt.md`（Step1/Step2 fix時）

#### fs-design-phase8-object
- 役割: 全レイヤーのオブジェクト設計（domain→app→infra→pres→summary）を作成し、QAゲート3を通過する
- プロセス: 前処理 → Step1: domain層設計 → Step2: app層設計 → Step3: infra層設計 → Step4: pres層設計 → Step5: summary → Step6: 品質基準確認 → Step7: QAレビュー（ゲート3） → Step8: REJECTED修正ループ → 後処理
- 成果物: `object-design-domain.md`, `object-design-app.md`, `object-design-infra.md`, `object-design-pres.md`, `object-design.md`, `ubiquitous-language.md`（更新）, `fs-design-phase8-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, object-design, design-qa-dispatch（ゲート3→object-design-qa-agent）, git-commit-workflow, doc-index-maintenance, pending-issues-management, visual-companion, task-orchestration, tech-investigation
- プロンプトテンプレート: `ddd-modeler-prompt.md`（Step1 domain）, `object-designer-prompt.md`（Step2-5, Step8 fix）

#### fs-design-phase9-infra
- 役割: インフラインターフェース設計（API定義・データストアスキーマ・外部サービス統合・リポジトリ具象実装）を作成
- プロセス: 前処理 → Step1: インフラ/IF設計（サブエージェント委譲） → 後処理
- 成果物: `infra-interface-design.md`, `fs-design-phase9-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, pending-issues-management, visual-companion, task-orchestration
- プロンプトテンプレート: `infra-interface-designer-prompt.md`（Step1。内部でinfra-interface-designスキル使用）

#### fs-design-phase10-program
- 役割: プログラム構成（フォルダ配置・ファイル命名・importルール）を設計し、QAゲート4（最終設計レビュー）を通過
- プロセス: 前処理 → Step1: 前フェーズ成果物の存在確認 → Step2: プログラム構成設計 → Step3: QAレビュー（ゲート4） → Step4: QA結果のユーザー共有・設計完了宣言 → 後処理
- 成果物: `program-structure.md`, `fs-design-phase10-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch（ゲート4→final-design-qa-agent）, doc-index-maintenance, git-commit-workflow, pending-issues-management, visual-companion, task-orchestration
- REJECTED時の修正委譲先: fs-design-phase9-infra(fix), fs-design-phase8-object(fix), fs-design-phase7-ddd(fix), fs-design-phase5-gui(fix), fs-design-phase4-architecture(fix), fs-design-phase1-user-req(fix)
- プロンプトテンプレート: `program-structure-designer-prompt.md`（Step2/Step3 fix）

#### fs-design-phase11-final-check
- 役割: 設計WF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → Step1: 全前フェーズの進捗確認と進捗ファイル更新 → Step2: 想定外残ファイルの確認 → 後処理（中止モード時は「中止クリーンアップ」へ直行）
- 成果物: `fs-design-phase11-report.txt`（検証のみ、最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/fix_open/fix_close), user-profile-management, doc-index-maintenance, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし


### 実装WF (fs-impl-phase*)

#### fs-impl-phase1-gate
- 役割: 設計書の完全性を確認し、実装開始前のゲートチェックを実施する
- プロセス: 前処理 → Step1: 進捗ファイル確認 → Step2: design-gate実行 → 後処理
- 成果物: `fs-impl-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), design-gate, pending-issues-management
- プロンプトテンプレート: なし
- 特記: FAIL時はWF終了（次フェーズへ遷移しない）

#### fs-impl-phase2-preparation
- 役割: 開発環境構築・実装タスクリスト生成・工程チェック表生成・動作確認試験書テンプレート作成
- プロセス: 前処理 → Step1: 設計書全文確認 → Step2: 開発環境の構築 → Step3: タスクリスト生成 → Step4: 工程チェック表生成 → Step5: 動作確認試験書初期化 → 後処理
- 成果物: `impl-task-list.md`, `impl-process-checklist.md`, `testing/manual-test-plan.md`, `fs-impl-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, impl-task-planning, doc-index-maintenance, git-commit-workflow
- プロンプトテンプレート: `env-builder-prompt.md`（Step2）, `test-doc-initializer-prompt.md`（Step5）
- 共通スキル参照: `skills/impl-task-planning/impl-planner-prompt.md`（Step3）

#### fs-impl-phase3-gui-mockup
- 役割: GUI静的モックアップの実装（ロジック接続なし）。GUI無し/スキップ時はそのまま次フェーズへ
- プロセス: 前処理 → Step1: GUI有無判定 → Step2: モックアップ作成確認 → Step3: モックアップ実装 → Step4: 画面表示確認 → Step5: ユーザーフィードバック → Step6: フィードバック反映 → Step7: 設計書同期 → 後処理
- 成果物: GUIモックアップコード（program-structure.md定義パス）, `fs-impl-phase3-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-sync, doc-index-maintenance, git-commit-workflow
- プロンプトテンプレート: `gui-mockup-impl-prompt.md`, `gui-mockup-fix-prompt.md`

#### fs-impl-phase4-execution
- 役割: タスクリストに基づく実装ループ（coding-test-2review経由で実装→テスト→2段階レビュー）＋動作確認Stepでの動作確認試験とリグレッションテストの実施
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → 後処理
- 成果物: 実装コード, テストコード, `impl-task-list.md`（完了更新）, `impl-process-checklist.md`（完了更新）, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-impl-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, pending-issues-management
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, 汎用のサブエージェント（Step2 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `impl-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
- 特記: Step2はリグレッションテスト実行サブエージェント（regression-test-prompt.md、工程①）を動作確認試験サブエージェント（impl-verification-prompt.md、工程②〜④）より先行実行する逐次順序（並列ではない）。リグレッションテスト全パス確認後に動作確認試験へ進む

#### fs-impl-phase5-final-check
- 役割: 最終設計監査（横断監査）・テストカバレッジ監査・追加実装ループ実行
- プロセス: 前処理 → Step1: 最終設計監査＋追加実装（coding-test-2review） → Step2: テストカバレッジ監査 → 後処理
- 成果物: 追加実装/テストコード, `manual-test-plan.md`（追記）, `fs-impl-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, visual-companion, task-orchestration
- 呼び出しエージェント: final-design-audit-agent, test-coverage-audit-agent（Step1/Step2）
- プロンプトテンプレート: なし
- プロセス定義: `design-impl-gap-process.md`（異常系プロセス定義 — 設計漏れ・実装漏れ発見時の対策プロセスA/B/C）

#### fs-impl-phase6-doc-generation
- 役割: README.mdと開発者向けドキュメント（docs/）を生成する
- プロセス: 前処理 → Step1: README.md生成 → Step2: docs/生成 → Step3: ユーザー確認 → 後処理
- 成果物: `README.md`, `docs/`（architecture.md, design-decisions.md等）, `fs-impl-phase6-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `readme-generator-prompt.md`（Step1）

#### fs-impl-phase7-final-check
- 役割: 実装WF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → 中止クリーンアップ（mode=abort時） → Step1: 全前フェーズ進捗確認 → Step2: 想定外残ファイル確認 → 後処理
- 成果物: `fs-impl-phase7-report.txt`（最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify), user-profile-management, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし


### 設計逆引きWF (fs-reverse-phase*)

#### fs-reverse-phase1-program
- 役割: 既存コードベースから3パス解析（概要→ファイル詳細→ディレクトリ単位解析）でプログラム構成を逆生成
- プロセス: 前処理 → Step1: パス1（概要解析） → Step2: パス2（ファイル詳細） → Step3: パス3計画（調査計画作成） → Step4: パス3実行（ディレクトリ単位解析） → 後処理
- 成果物: `program-structure.md`, `pass3-survey-plan.md`, `fs-reverse-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `reverse-program-structure-prompt.md`, `reverse-program-structure-planner-prompt.md`, `reverse-program-structure-reviewer-prompt.md`, `pass3-directory-analysis-prompt.md`

#### fs-reverse-phase2-dev-env
- 役割: 既存プロジェクト設定ファイルから開発環境情報を抽出
- プロセス: 前処理 → Step1: 開発環境情報抽出 → 後処理
- 成果物: `dev-environment.md`, `fs-reverse-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `reverse-dev-environment-prompt.md`（Step1）

#### fs-reverse-phase3-system-req
- 役割: コードからシステム要件（技術スタック・非機能要件・エラーハンドリング方針）を逆生成
- プロセス: 前処理 → Step1: システム要件逆生成+ユーザー合意 → 後処理
- 成果物: `system-requirements.md`, `fs-reverse-phase3-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow
- プロンプトテンプレート: `reverse-system-requirements-prompt.md`（Step1）

#### fs-reverse-phase4-user-req
- 役割: コード解析+ユーザーヒアリングでユーザー要件を逆生成（CORE COMPLETION）
- プロセス: 前処理 → Step1: コード解析+ヒアリング+user-requirements.md作成 → 後処理
- 成果物: `user-requirements.md`, `fs-reverse-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, visual-companion, task-orchestration
- プロンプトテンプレート: `reverse-user-requirements-prompt.md`（Step1）

#### fs-reverse-phase5-optional-phases
- 役割: コード構造に応じてオプション解析（アーキテクチャ/オブジェクト設計/インフラIF/GUI設計）を選択的に実行
- プロセス: 前処理 → Step1: 成果物確認 → Step2: オプションフェーズ要否判定 → Step3: オプション解析実行（1-4を順次） → Step4: 完了報告+次WF案内 → 後処理
- 成果物: `layered-architecture.md`, `ubiquitous-language.md`, `object-design*.md`, `infra-interface-design.md`, `gui-design.md`（各条件付き）, `fs-reverse-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, git-commit-workflow, pending-issues-management, visual-companion, task-orchestration
- プロンプトテンプレート: `reverse-optional-phase-judge-prompt.md`（Step2）, `reverse-architecture-prompt.md`, `reverse-object-design-prompt.md`, `reverse-infra-interface-prompt.md`, `reverse-gui-design-prompt.md`（各Step3）

#### fs-reverse-phase6-final-check
- 役割: 設計逆引きWF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → 中止クリーンアップ（mode=abort時） → Step1: 全前フェーズ進捗確認 → Step2: 想定外残ファイル確認 → 後処理
- 成果物: `fs-reverse-phase6-report.txt`（最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify), user-profile-management, doc-index-maintenance, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし


### 変更WF (fs-change-phase*)

#### fs-change-phase1-analysis
- 役割: 変更要求のヒアリング・design-gate・影響範囲分析・対応方針書の作成
- プロセス: 前処理 → Step1: design-gate → Step2: 変更要求定義 → Step3: 変更要求レビュー → Step4: 影響範囲分析 → Step5: 影響範囲ユーザー確認 → Step6: folder-merge-check → Step7: 対応方針書作成 → Step8: 方針レビュー → Step9: ユーザー最終承認 → 後処理
- 成果物: `change-requirements.md`, `impact-analysis.md`, `approach.md`, `refactoring-request.md`（委譲時のみ）, `fs-change-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-gate, folder-merge-check, doc-index-maintenance
- プロンプトテンプレート: `change-requirements-prompt.md`（Step2）, `change-impact-analyzer-prompt.md`（Step4）, `change-approach-planner-prompt.md`（Step7）, `change-approach-reviewer-prompt.md`（Step8）

#### fs-change-phase2-impl
- 役割: 差分設計・QAレビュー・影響範囲再分析・タスク分解・実装ループ・doc-sync・動作確認Stepでの動作確認試験とリグレッションテストの実施を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → Step12: 設計書反映 → Step13: 変更完了の案内 → 後処理
- 成果物: `delta-design.md`（+分割時`delta-design-{name}.md`）, `impact-analysis.md`（更新）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-change-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step11 工程②）, 汎用のサブエージェント（Step11 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `regression-test-prompt.md`（Step11 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `change-verification-prompt.md`（Step11 工程②: 試験書作成モード / 工程④: 試験実行モード）, `change-doc-syncer-prompt.md`（Step12）
- 特記: 従来Step11（リグレッションテスト結果の確認・報告）とStep12（動作検証・ユーザー確認）を1つの動作確認Step（Step11）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。以降のStepは1つずつ前倒しでリナンバリング（旧Step13→新Step12、旧Step14→新Step13、旧Step15→新Step14）

#### fs-change-phase3-final-check
- 役割: 変更WF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → 中止クリーンアップ（mode=abort時） → Step1: 全前フェーズ進捗確認 → Step2: 想定外残ファイル確認 → 後処理
- 成果物: `fs-change-phase3-report.txt`（最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify), user-profile-management, doc-index-maintenance, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし

### バグ修正WF (fs-bugfix-phase*)

#### fs-bugfix-phase1-analysis
- 役割: バグ報告ヒアリング・design-gate・再現性確認/原因特定・原因分析・folder-merge-check・修正方針書の作成
- プロセス: 前処理 → Step1: バグ報告ヒアリング → Step2: バグ報告書作成 → Step3: design-gate → Step4: 再現性確認・原因特定 → Step5: 原因分析 → Step6: 原因分析ユーザー確認 → Step7: folder-merge-check → Step8: 修正方針書作成 → Step9: 方針レビュー → Step10: ユーザー最終承認 → 後処理
- 成果物: `bug-report.md`, `bug-analysis.md`, `fix-plan.md`, `fs-bugfix-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-gate, folder-merge-check, doc-index-maintenance
- プロンプトテンプレート: `bugfix-reporter-prompt.md`（Step1）, `bugfix-investigator-prompt.md`（Step4）, `bugfix-analyzer-prompt.md`（Step5）, `bugfix-planner-prompt.md`（Step8）, `bugfix-plan-reviewer-prompt.md`（Step9）

#### fs-bugfix-phase2-impl
- 役割: 修正設計・QAレビュー・タスク分解・実装ループ・doc-sync・動作確認Stepでの動作確認試験とリグレッションテストの実施を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → Step10: 設計書反映 → Step11: バグ修正完了の案内 → 後処理
- 成果物: `fix-design.md`（+分割時`fix-design-{name}.md`）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-bugfix-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step9 工程②）, 汎用のサブエージェント（Step9 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `regression-test-prompt.md`（Step9 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `bugfix-verification-prompt.md`（Step9 工程②: 試験書作成モード / 工程④: 試験実行モード）, `bugfix-doc-syncer-prompt.md`（Step10）
- 特記: 従来Step9（リグレッションテスト結果の確認・報告）とStep10（動作検証・ユーザー確認）を1つの動作確認Step（Step9）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。以降のStepは1つずつ前倒しでリナンバリング（旧Step11→新Step10、旧Step12→新Step11、旧Step13→新Step12）

#### fs-bugfix-phase3-final-check
- 役割: バグ修正WF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → 中止クリーンアップ（mode=abort時） → Step1: 全前フェーズ進捗確認 → Step2: 想定外残ファイル確認 → 後処理
- 成果物: `fs-bugfix-phase3-report.txt`（最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify), user-profile-management, doc-index-maintenance, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし

### リファクタリングWF (fs-refactoring-phase*)

#### fs-refactoring-phase1-status
- 役割: セーフティネットベースライン確立（既存テスト全実行結果の記録）
- プロセス: 前処理 → Step1: design-gate → Step2: 既存テスト全実行＋結果記録 → Step3: ユーザー確認 → 後処理
- 成果物: `refactoring-progress.md`（セーフティネット基準記録）, `fs-refactoring-phase1-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), design-gate
- プロンプトテンプレート: `refactoring-status-checker-prompt.md`（Step2）

#### fs-refactoring-phase2-candidates
- 役割: リファクタリング候補の特定と優先順位付け。引き継ぎ時（refactoring-request.mdあり）は素通り通過
- プロセス: 前処理 → Step1: 候補分析（通常時）/素通り（引き継ぎ時） → Step2: ユーザー選択+folder-merge-check → 後処理
- 成果物: `refactoring-candidates.md`, `fs-refactoring-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, folder-merge-check, doc-index-maintenance
- プロンプトテンプレート: `refactoring-analyzer-prompt.md`（Step1）

#### fs-refactoring-phase3-plan
- 役割: リファクタリング方針書（before→after・メリット・影響範囲・リスク）の作成とユーザー合意
- プロセス: 前処理 → Step1: 候補/リクエスト確認 → Step2: 方針書作成+ユーザー合意 → 後処理
- 成果物: `refactoring-plan.md`, `fs-refactoring-phase3-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-index-maintenance, visual-companion
- プロンプトテンプレート: `refactoring-planner-prompt.md`（Step2）

#### fs-refactoring-phase4-design
- 役割: リファクタリング差分設計書の作成・QAレビュー・タスク分解・工程チェック表生成
- プロセス: 前処理 → Step1: 差分設計作成（+設計系共通スキルdeltaモード） → Step2: ユーザー確認 → Step3: QAレビュー → Step4: QA REJECTED修正ループ → Step5: タスク分解+工程チェック表 → 後処理
- 成果物: `refactoring-design.md`, `impl-process-checklist.md`, `delta-{領域名}.md`（パターンB/C/D時）, `fs-refactoring-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, impl-task-planning, object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta), pending-issues-management, doc-index-maintenance
- プロンプトテンプレート: `refactoring-designer-prompt.md`（Step1/Step4 fix）

#### fs-refactoring-phase5-impl
- 役割: リファクタリング実装ループ（coding-test-2review経由）＋動作確認Stepでの動作確認試験とリグレッションテスト（開始前基準との比較）の実施
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施、phase1-status記録の開始前基準との比較を含む） → 後処理
- 成果物: 実装コード, テストコード, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果・開始前基準との比較結果）, `fs-refactoring-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, 汎用のサブエージェント（Step2 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規。phase1-statusのセーフティネット基準記録との比較結果を報告）, `refactoring-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
- 特記: 従来Step2（セーフティネット全テスト）とStep3（動作確認試験）を1つの動作確認Step（Step2）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。リグレッションテスト実行サブエージェントは fs-refactoring-phase1-status で記録した開始前基準（セーフティネットベースライン）との比較結果を報告する

#### fs-refactoring-phase6-doc
- 役割: リファクタリング設計書の内容を既存設計書にマージ（doc-sync）
- プロセス: 前処理 → Step1: doc-sync実行 → Step2: ユーザー確認 → Step3: doc-index更新 → 後処理
- 成果物: 既存設計書（更新）, `fs-refactoring-phase6-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, doc-sync, doc-index-maintenance, visual-companion, task-orchestration
- プロンプトテンプレート: `doc-syncer-prompt.md`（Step1）

#### fs-refactoring-phase7-final-check
- 役割: リファクタリングWF全フェーズの整合性最終検証・進捗ファイル更新・一時ファイル削除
- プロセス: 前処理 → 中止クリーンアップ（mode=abort時） → Step1: 全前フェーズ進捗確認 → Step2: 想定外残ファイル確認 → 後処理
- 成果物: `fs-refactoring-phase7-report.txt`（最終的に削除）
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify), user-profile-management, git-commit-workflow
- 呼び出しエージェント: progress-final-checker（Step1）
- プロンプトテンプレート: なし
- 特記: リファクタリングWF唯一のまとめコミットはこの後処理で実行


### フェーズスキル群 横断的パターンまとめ

#### 共通プロセスパターン（全41フェーズスキル共通）

```
前処理
├── phase-skill-rules.md / global-rules.md 読込（重要ポイント3点抽出）
├── progress-resume-check 実行（再開ポイント判定）
├── フェーズ内 Step 途中再開判定
├── phase-report-check (verify) 実行（前フェーズ完了確認）
└── user-profile-management (apply) 実行（ユーザーレベル確認）
    ↓
Step 1..N（フェーズ固有の本処理）
    ↓
後処理
├── doc-index-maintenance 実行
├── phase-report-check (write) 実行（記載項目漏れ検証+進捗更新）
├── user-profile-management (update) 実行
├── git-commit-workflow 実行
└── 次フェーズスキルへ遷移
```

#### final-check フェーズの共通構造（7WF×1=7フェーズ）

全7ワークフローの最終フェーズ（`fs-*-phase{N}-final-check`）は同一構造:
- **phase-report-check (write) を呼ばない**（progress-final-checker が進捗更新を担当）
- **中止モード（mode=abort）対応**: 通常前処理をスキップし中止クリーンアップへ直行
- **Step1**: `progress-final-checker` エージェントを invoke（全前フェーズ ✅完了 確認 → 自フェーズ ✅完了 更新）
- **Step2**: `.aide/tmp/` 想定外残ファイル確認（ユーザー確認の上で削除）
- **後処理**: 全フェーズレポート（`.aide/tmp/fs-{WF}-phase*-report.txt`）を削除してWF終了
- **FAIL時**: fix_open で problem_phase に修正起票し、該当フェーズスキルへ差し戻し

#### 成果物のファイルパスパターン

| カテゴリ | パス | 説明 |
|---|---|---|
| 設計成果物 | `.aide/specs/{feature_name}/` | 設計書・要件書・進捗ファイル等 |
| 技術参考資料 | `.aide/specs/{feature_name}/tech-references/` | 技術調査結果・ユーザーヒント |
| テスト関連 | `.aide/specs/{feature_name}/testing/` | 動作確認試験書 |
| 変更WF作業フォルダ | `.aide/specs/{feature_name}/changes/{YYYYMMDD}-{概略}/` | 変更要求単位 |
| バグ修正WF作業フォルダ | `.aide/specs/{feature_name}/bugfix/{YYYYMMDD}-{概略}/` | バグ修正単位 |
| リファクタリングWF作業フォルダ | `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{概略}/` | リファクタリング単位 |
| フェーズレポート | `.aide/tmp/fs-{WF}-phase{N}-report.txt` | 一時ファイル（WF完了時に削除） |
| 進捗ファイル | `.aide/specs/{feature_name}/{WF}-progress.md` | フェーズ進捗管理 |

#### コミット戦略パターン

| WF | コミット戦略 | 説明 |
|---|---|---|
| 企画 | 各フェーズコミット型 | 各フェーズ後処理 + 探索サイクルごとにコミット |
| 設計 | 各フェーズコミット型 | 各フェーズ後処理でコミット |
| 実装 | 各フェーズコミット型 | 各フェーズ後処理でコミット |
| 設計逆引き | 各フェーズコミット型 | 各フェーズ後処理+オプション解析ごとにコミット |
| 変更 | WFまとめコミット型 | final-check の後処理でまとめてコミット |
| バグ修正 | WFまとめコミット型 | final-check の後処理でまとめてコミット |
| リファクタリング | WFまとめコミット型 | final-check の後処理で唯一のまとめコミット |

#### QAゲート構造（設計WF固有）

| ゲート | 実施フェーズ | QAエージェント | レビュー対象 |
|---|---|---|---|
| ゲート1 | phase3 (dev-plan) | requirements-qa-agent | user-requirements.md, system-requirements.md, dev-environment.md, development-plan.md |
| ゲート2 | phase7 (ddd) | architecture-qa-agent | layered-architecture.md, gui-design.md |
| ゲート3 | phase8 (object) | object-design-qa-agent | object-design-*.md, ubiquitous-language.md |
| ゲート4 | phase10 (program) | final-design-qa-agent | 全設計成果物の横断レビュー |

#### 変更系WF（change/bugfix/refactoring）の共通構造

phase2（実装フェーズ）は以下の共通パターンを持つ:
1. **差分設計作成** — 設計系共通スキル（delta モード）で影響範囲の既存設計書を差分更新
2. **QAレビュー** — design-qa-dispatch 経由で delta-design-qa-agent + 影響範囲に応じた専門QA
3. **タスク分解** — impl-task-planning でタスクリスト＋工程チェック表を生成
4. **実装ループ** — coding-test-2review で実装→テスト→2段階レビュー
5. **doc-sync** — 差分設計の内容を既存設計書にマージ


## パス3整合性チェック結果

### チェック実施情報

- **チェック日時**: 2026-06-23
- **チェック範囲**: program-structure.md 全体（2541行、約187KB）
- **チェック観点**: スキル間参照整合性、重複記載、命名規則補完

---

### 1. スキル間参照関係の整合性

**結果: 問題なし（矛盾・循環・存在しない参照なし）**

主要な参照チェーン確認:
| 呼び出し元 | 呼び出し先 | 逆方向記載 | 判定 |
|---|---|---|---|
| `using-aide-powers` | 7WFエントリ + `session-handover` + `rules-distribute` | 各スキルの呼び出し元に記載あり | ✅ |
| `code-review-agent` | `code-quality-review`, `error-handling-review`, `test-review` | 各スキルの呼び出し元に `code-review-agent` 記載 | ✅ |
| `design-review-agent` | `import-review`, `test-review`, `design-sync` | 各スキルの呼び出し元に記載あり | ✅ |
| `multi-stage-code-review` | `code-review-agent`, `design-review-agent` | 各エージェントの呼び出し元に記載あり | ✅ |
| `coding-test-2review` | `micro-impl-agent`, `design-review-agent`, `code-review-agent` | 各エージェントの呼び出し元に記載あり | ✅ |
| `final-design-audit-agent` | `impl-task-planning`, `coding-test-2review` | 各スキルの呼び出し元に記載あり | ✅ |
| `design-qa-dispatch` | 5種QAエージェント | 各QAエージェントの呼び出し元に記載あり | ✅ |
| 各フェーズスキル | `progress-resume-check`, `phase-report-check`, `user-profile-management` | 各スキルの呼び出し元に「全フェーズスキル」記載 | ✅ |

- **存在しないスキル名への参照**: 検出なし
- **循環参照パターン**: 検出なし（スキル→エージェント→スキルの連鎖は委譲パターンであり循環ではない）

---

### 2. 重複記載の有無と箇所

**結果: 意図的な並列記載1件あり（問題なし）、実質的重複なし**

| 箇所 | 内容 | 判定 |
|---|---|---|
| 「パス3: agents/ 詳細解析」と「パス3: agents/kiro/ 詳細解析」 | 13エージェントが2箇所で記載。前者=Claude Code版（`agents/*.md`）、後者=Kiro版（`agents/kiro/*.md` + `.json` + `prompts/`） | **正当**（実ファイルが別々に存在するため） |
| `agents/kiro/` セクション末尾「3ファイルセットの同一性確認結果」 | MD本文とprompts/の内容が「実質同一」と明記 | **正当**（同一性の記録として有用） |

構造的重複（同一情報の不要な繰り返し）は検出されなかった。ファイルサイズが大きい（187KB/2541行）のは、78スキル + 13エージェント × 複数プラットフォーム + 7WF全フェーズの網羅的記録による自然な結果。

---

### 3. 命名規則の追加事項

パス3解析で発見された追加命名パターン:

| カテゴリ | パターン | 例 |
|---|---|---|
| フェーズスキル内プロンプトテンプレート | `{動詞/役割}-{目的語/動作}-prompt.md` | `source-material-organizer-prompt.md`, `proposal-writer-init-prompt.md`, `bugfix-analyzer-prompt.md` |
| フェーズレポート | `fs-{WF}-phase{N}-report.txt` | `fs-planning-phase1-report.txt` |
| WF作業フォルダ（change/bugfix） | `{YYYYMMDD}-{概略}/` | `20260623-login-fix/` |
| WF作業フォルダ（refactoring） | `{YYYYMMDDHHmm}-{概略}/` | `202606231430-extract-service/` |
| 進捗ファイル | `{WF名}-progress.md` | `design-progress.md`, `impl-progress.md` |
| 差分設計書（分割時） | `{差分種別}-{領域名}.md` | `delta-design-gui.md`, `fix-design-domain.md` |
| セッション履歴 | `.aide/tmp/` 配下にstep_idごと1ファイル | — |
| APM front-matter | `description` + `applyTo: "**"` | `.apm/instructions/` 配下 |

既存の命名規則表（「ファイル命名規則」セクション）に含まれていなかったパターンとして上記を補完記録する。

---

### 4. その他の確認事項

- **`aide-powers-guide` と `using-aide-powers` の関係**: 共通スキル解析で `aide-powers-guide` が「ワークフロー選択と初期セットアップを管理」と記載されている。これは `using-aide-powers` のKiro以外のプラットフォーム用エイリアスまたは旧名称と推定される（実ファイル `.github/skills/aide-powers-guide/` に存在）。矛盾ではなく2種のハブスキルが存在する設計。
- **`.github/skills/` のフォルダ数**: 37フォルダ（共通スキル36 + ハブスキル1）と記載。ただし共通スキル解析で27個が「SKILL.mdのみ」、8個が「プロンプトテンプレート付き」、1個が「scripts付き」= 36個。ハブスキル2個（`using-aide-powers` + `aide-powers-guide`）を加えると38個の可能性があるが、`.github/skills/` は37フォルダと明記されており、setup-local.bat の実装に基づく正確な数値として受け入れる。
- **フェーズスキル総数**: 企画4 + 設計11 + 実装7 + 逆引き6 + 変更3 + バグ修正3 + リファクタリング7 = 41フェーズスキル。skills/ 全78 - フェーズ41 = 37（共通+ハブ）。`.github/skills/` の37フォルダと整合。

---

### 5. 総合判定

**パス3整合性チェック: PASS（問題なし）**

- スキル間参照関係に矛盾なし
- 重複記載なし（意図的な並列記載のみ）
- 命名規則は6パターンを追加補完記録
- ファイルサイズは網羅的記録の自然な結果であり、構造的問題なし
