# 06. 実行部隊構成（skills/ agents/ hooks/ setup スクリプト等）

aide-powers リポジトリ内の各フォルダ・ファイルが、どのプラットフォームのどの機構に対応し、setup スクリプトでどこに配置されるかを物理的にまとめる章。

## 1. リポジトリ構成（俯瞰）

aide-powers の配布物は次のように構成される。

```
kc-aide-powers/                    ← 配布リポジトリのルート
├── skills/                        ← スキル本体（75スキル）
├── agents/                        ← サブエージェント定義（8件）
├── hooks/                         ← Claude Code 系の SessionStart hook
│   ├── hooks.json                 ← フック登録設定
│   ├── session-start              ← bash スクリプト本体
│   ├── run-hook.cmd               ← Windows 用ポリグロット起動
│   └── brainstorm-selection.json  ← visual-companion 用ファイルイベント
├── steering/                      ← Kiro IDE 用ブートストラップ
│   └── aide-powers-bootstrap.md
├── instructions/                  ← GitHub Copilot 用グローバル指示
│   └── aide-powers.instructions.md
├── .claude-plugin/                ← Claude Code プラグインメタデータ
│   ├── plugin.json
│   └── marketplace.json
├── .codex/                        ← Codex 利用者向けインストール手順書
│   └── INSTALL.md
├── GEMINI.md                      ← Gemini CLI 用 @import エントリ
├── AGENTS.md                      ← Codex / OpenCode 用参照エントリ
├── setup.bat / setup.sh           ← グローバルインストーラ
├── setup-local.bat / setup-local.sh   ← ローカルインストーラ
└── cleanup-kiro-agent.bat         ← 旧 kiro-agent 構成の片付け
```

各役割は以下に分けて記述する。

## 2. skills/ — スキル本体

aide-powers の主体。`skills/{skill-name}/SKILL.md` 形式でスキルが格納される。スキル分類と一覧は `04-skill-map.md` を参照。本ページはあくまで配置観点に絞る。

### 配置先（プラットフォーム別）

| プラットフォーム | グローバル配置先（setup.*） | ローカル配置先（setup-local.*） |
|---|---|---|
| Kiro IDE / Kiro CLI | `~/.kiro/skills/` | `{project}/.kiro/skills/` |
| Claude Code | `~/.claude/skills/` | `{project}/skills/`（プラグイン形式） |
| Cursor | プラグイン経由 | プラグイン経由 |
| GitHub Copilot CLI | `~/.copilot/skills/aide-powers/` | `{project}/.github/skills/`（VSCode） |
| VSCode GitHub Copilot | `~/.copilot/skills/aide-powers/` + `%APPDATA%\Code\agentPlugins\aide-powers\skills\` | `{project}/.github/skills/` |
| Codex | `~/.agents/skills/aide-powers/` | — |
| OpenCode | プロジェクトルート + `AGENTS.md` 参照 | — |
| Gemini CLI | エクステンションリンク（`gemini extensions link .`） | — |

setup スクリプトはコピー元の `skills/` ディレクトリをそのままコピーするだけ。インストール先で構造変換は行わない。

### 旧構造クリーンアップ

setup スクリプトには `cleanup_legacy_skills` 関数があり、フラット化前の旧フォルダ（`design-workflow/`、`bugfix-workflow/`、`change-workflow/`、`impl-workflow/`、`planning-workflow/`、`refactoring-workflow/`、`reverse-design-workflow/`、`skills/`）を削除する処理が組み込まれている。これは aide-powers が以前ワークフロー単位フォルダ構成を採っていた名残を消すためのもので、新規インストール環境では無動作。

## 3. agents/ — サブエージェント定義

`agents/{agent-name}.md` 形式で配布される共通エージェント定義。実体は8件（QAレビューアー5件 + ホワイトリスト3エージェント）。

### 配置先

| プラットフォーム | グローバル配置先 | ローカル配置先 |
|---|---|---|
| Kiro IDE / Kiro CLI | `~/.kiro/agents/` | `{project}/.kiro/agents/` |
| Claude Code | `~/.claude/agents/` | `{project}/agents/` |
| GitHub Copilot | `~/.copilot/agents/` + `%APPDATA%\Code\agentPlugins\aide-powers\agents\` | — |
| Codex | `~/.agents/agents/aide-powers/` | — |

エージェント定義の中身（プロンプト・ツール制限・mode）は第2章で扱う。本ページは配置観点に留める。

## 4. hooks/ — Claude Code 系 SessionStart 機構

Claude Code 系の SessionStart hook を実装する4ファイル。

| ファイル | 役割 |
|---|---|
| `hooks/hooks.json` | フック登録設定。`SessionStart` イベントの `startup` / `clear` / `compact` トリガーで `run-hook.cmd session-start` を呼び出す |
| `hooks/session-start` | 本体。`using-aide-powers/SKILL.md` を読み込み、JSON にエスケープして `additionalContext` / `additional_context` / `hookSpecificOutput.additionalContext` のいずれか（プラットフォーム別）で出力 |
| `hooks/run-hook.cmd` | Windows 用ポリグロット起動。`@echo off` の手前に `: << 'CMDBLOCK'` を置くことで、bash と cmd 両方から呼べる。Windows なら `Git for Windows` の `bash.exe` を探して `session-start` を実行する |
| `hooks/brainstorm-selection.json` | `visual-companion` スキル連携用。`.aide/brainstorm/*/signal/browser-selection.json` 作成時に `askAgent` を発火させてユーザー選択を AI Agent に伝える |

`session-start` は環境変数（`CURSOR_PLUGIN_ROOT` / `CLAUDE_PLUGIN_ROOT` / `COPILOT_CLI`）でプラットフォームを判別し、出力 JSON のフィールド名を切り替える。Cursor は `additional_context`（snake_case）、Claude Code は `hookSpecificOutput.additionalContext`、Copilot CLI と SDK 標準環境は `additionalContext` を期待する。

### 配置先

| プラットフォーム | 配置先 |
|---|---|
| Claude Code（プラグイン経由） | プラグインインストール先の `hooks/` |
| Claude Code（手動コピー） | `~/.claude/hooks/`（ただし手動コピーでは `hooks` は機能しない旨が setup.sh で警告される） |
| GitHub Copilot CLI | `~/.copilot/hooks/` |
| VSCode GitHub Copilot | `%APPDATA%\Code\agentPlugins\aide-powers\hooks\`、設定キー `chat.hookFilesLocations` で `~/.copilot/hooks` を許可 |

## 5. steering/ — Kiro IDE 用ブートストラップ

Kiro IDE のステアリング機構（会話冒頭に常時注入される短文）に置く起動層ファイル。

| ファイル | 配置先 | 中身 |
|---|---|---|
| `steering/aide-powers-bootstrap.md` | `~/.kiro/steering/` | front-matter `inclusion: always`、本文は「aide-powers がインストールされています。`skills/using-aide-powers/SKILL.md` を読み込み、その指示に従ってください。」の数行のみ |

これだけで、Kiro IDE の会話開始時にハブスキルへの誘導が完了する。setup.bat / setup.sh の Kiro セクションは既存ファイルがあれば上書き確認を入れた上でこのファイルをコピーする。

## 6. instructions/ — GitHub Copilot 用グローバル指示

GitHub Copilot のインストラクション機構（`.github/instructions/` または VSCode の `User/prompts/`）に置く起動層ファイル。

| ファイル | 配置先 | 中身 |
|---|---|---|
| `instructions/aide-powers.instructions.md` | `~/.copilot/instructions/`、`%APPDATA%\Code\User\prompts\` | front-matter `applyTo: '**'`、ワークフロー厳守・フェーズ省略禁止・直接実装禁止・トークン節約等のグローバル方針 |

`steering/aide-powers-bootstrap.md` と異なり、こちらはハブスキルの存在を前提に「ワークフロー厳守の規範」を直接指示する内容。Copilot は instructions が会話冒頭に注入されるため、ハブスキル発見の確度を上げる役割を果たす。

## 7. .claude-plugin/ — Claude Code プラグインメタデータ

Claude Code のプラグイン形式インストール（`claude plugin install {repo}`）で読み込まれるメタデータ。superpowers の配置慣習に倣い、リポジトリ直下の `.claude-plugin/` 固定パスに置く。

| ファイル | 中身 |
|---|---|
| `.claude-plugin/plugin.json` | プラグイン名（`aide-powers`）、説明、バージョン、ライセンス、キーワード。Claude Code が `claude plugin install` 実行時に読み込んで認識する |
| `.claude-plugin/marketplace.json` | マーケットプレース定義（プラグインの一覧定義）。自前のプラグインマーケットプレースとして配布する場合の入口メタデータ |

### 役割と利用経路

プラグイン形式インストールでは `plugin.json` を起点に `hooks/`・`skills/`・`agents/` がプラグインのインストール先に配置される。手動コピーの場合と異なり、SessionStart hook が確実に発火する。

`setup.bat` / `setup-local.bat` / `setup-local.sh` も `.claude-plugin/` を VSCode Copilot のプラグイン領域（`%APPDATA%\Code\agentPlugins\aide-powers\.claude-plugin\`）と Claude Code ローカルインストール先にコピーするため、**削除すると setup スクリプトが xcopy エラーを起こす**。リポジトリから削除してはならない。

### superpowers との関係

`.claude-plugin/{plugin.json,marketplace.json}` のパスは Claude Code 仕様で固定。superpowers が同じ慣習で配置しており、aide-powers もそれを踏襲している。

## 8. .codex/INSTALL.md — Codex 利用者向けインストール手順書

Codex 利用者が GitHub 上で aide-powers を見たときに、Codex 向けの詳細なインストール手順を見つけられるようにするためのドキュメント。

| ファイル | 中身 |
|---|---|
| `.codex/INSTALL.md` | `git clone` 先（`~/.codex/aide-powers`）、`~/.agents/skills/aide-powers/` への手動コピー手順（bash / PowerShell の両方）、`setup.bat`/`setup.sh` の選択肢5を使う代替手順、検証手順、更新手順、アンインストール手順 |

### 役割と利用経路

setup スクリプトからは参照されない。**純粋に利用者向けのドキュメント** で、`README.md` から直接リンクされている。Codex は他プラットフォームと違ってプラグイン機構を持たず手動コピーが基本のため、詳細な PowerShell コマンドや検証手順を含めて専用ガイドにしている。

### superpowers との関係

superpowers が「Codex 用インストールガイドは `.codex/INSTALL.md` に置く」という慣習を確立している（superpowers 公式ドキュメント "Plugin System" で明記）。aide-powers もこの慣習に倣う。`.codex/` 配下に置くことで、`~/.codex/aide-powers/` に clone した利用者が同じパス感覚でドキュメントを見つけられる。

## 9. GEMINI.md / AGENTS.md — ファイル参照型起動

Gemini CLI と Codex / OpenCode は、プロジェクトルートに置かれた特定ドキュメントを起動時に読み込む仕様を持つ。これに乗せて aide-powers を誘導する。

| ファイル | 想定プラットフォーム | 配置 | 中身 |
|---|---|---|---|
| `GEMINI.md` | Gemini CLI | プロジェクトルート | `@./skills/using-aide-powers/SKILL.md` と `@./.aide/references/gemini-tools.md` の `@import` 行 |
| `AGENTS.md` | Codex / OpenCode | プロジェクトルート | サブエージェント呼び出しルール + `aide-powers-global-rules.agents.md` への参照行（`rules-distribute` 自動追記） |

Gemini CLI では `@import` 行があるとファイル内容が会話開始時に展開される。Codex / OpenCode では `AGENTS.md` 自体が自動読み込みされ、その中の参照行から `aide-powers-global-rules.agents.md` がさらに読み込まれる。

## 10. setup.bat / setup.sh — グローバルインストーラ

ユーザーのホームディレクトリ配下に aide-powers を配置するスクリプト。Windows 用 `.bat` と Linux/Mac/WSL 用 `.sh` を提供する。

### 動作

1. インストール先プラットフォームを番号付きメニューで選択（複数選択可、`6: 全部` / `7: 全部`）
2. 選択したプラットフォームごとに以下を実行
   - 旧構造クリーンアップ（フラット化前の `*-workflow/` フォルダを削除）
   - `skills/`、`agents/`、必要に応じて `hooks/`、`steering/`、`instructions/`、`.claude-plugin/` をコピー
   - VSCode Copilot の場合は `chat.pluginLocations` / `chat.plugins.enabled` を `settings.json` に追記（PowerShell で JSON 編集）
3. 既存ディレクトリは上書き前に y/N 確認

### 配置先まとめ

| 選択肢 | 配置先 |
|---|---|
| 1. Kiro IDE / Kiro CLI | `~/.kiro/skills/`、`~/.kiro/agents/`、`~/.kiro/steering/aide-powers-bootstrap.md` |
| 2. Claude Code | `~/.claude/hooks/`、`~/.claude/skills/`、`~/.claude/agents/` |
| 3. GitHub Copilot（CLI + VSCode）| `~/.copilot/skills/`、`~/.copilot/agents/`、`~/.copilot/instructions/`、`%APPDATA%\Code\User\prompts\`、`%APPDATA%\Code\agentPlugins\aide-powers\` |
| 4. Gemini CLI | エクステンションリンク案内のみ（`gemini extensions link .` を表示） |
| 5. Codex | `~/.agents/skills/aide-powers/`、`~/.agents/agents/aide-powers/` |

## 11. setup-local.bat / setup-local.sh — ローカルインストーラ

プロジェクトリポジトリ内に aide-powers を直接配置するスクリプト。チームでリポジトリ共有して同一スキルセットを使う用途。

### 配置先

| 選択肢 | 配置先（{project} はカレントまたは引数指定のディレクトリ） |
|---|---|
| 1. Kiro IDE | `{project}/.kiro/skills/`、`{project}/.kiro/agents/`、`{project}/.kiro/steering/`、`{project}/AGENTS.md` |
| 2. Claude Code | `{project}/skills/`、`{project}/agents/`、`{project}/hooks/`、`{project}/.claude-plugin/` |
| 3. VSCode Copilot | `{project}/.github/skills/`、`{project}/.github/hooks/` |

ローカル配置されたファイルはリポジトリにコミットすればチーム全員が同じスキルセットを使える。ただし更新は手動で再 setup-local が必要。

## 12. cleanup-kiro-agent.bat — 旧 kiro-agent 構成の片付け

aide-powers の前身（kiro-agent）を使っていたワークスペースから、不要になったファイルを安全に削除するためのスクリプト。

### 削除対象（明示列挙）

- `.kiro/steering/aide-powers-global-rules.md`
- `.kiro/agents/` 配下の22ファイル（`agent-file-reviewer.md`、`workflow-designer.md` ほか）
- ルート `AGENTS.md`
- ルート `aide-powers-global-rules.agents.md`

### 保持対象

- `.kiro/specs/`（仕様）
- `.kiro/` フォルダ自体
- 上記以外すべて

実行前に y/N 確認を取り、削除対象が存在しない場合はスキップして件数を表示する。フォルダは中身が空のときのみ削除し、ファイルが残っているフォルダはそのまま保持する。aide-powers への移行直後にだけ使う一過性ユーティリティ。

## 13. 配置物 → 機構の対応マップ

リポジトリの各配布物が、プラットフォームのどの機構に対応するかを一覧でまとめる。

| 配布物 | 対応する機構 | 主要プラットフォーム |
|---|---|---|
| `skills/` | スキル機構（`Skill` ツール、`discloseContext`、`activate_skill`、`/skill-name`） | 全プラットフォーム |
| `agents/` | サブエージェント / カスタムエージェント機構 | Kiro、Claude Code、Copilot、Codex |
| `hooks/hooks.json` + `hooks/session-start` | SessionStart hook 機構 | Claude Code、Cursor、Copilot CLI |
| `hooks/run-hook.cmd` | Windows での bash 起動ブリッジ | 上記の Windows 環境 |
| `hooks/brainstorm-selection.json` | fileCreated イベントフック（`visual-companion` 連携） | Kiro 系 |
| `steering/aide-powers-bootstrap.md` | ステアリング常時注入 | Kiro IDE / Kiro CLI |
| `instructions/aide-powers.instructions.md` | グローバルインストラクション機構 | GitHub Copilot CLI / VSCode |
| `.claude-plugin/plugin.json` | プラグインメタデータ | Claude Code |
| `.claude-plugin/marketplace.json` | マーケットプレース定義 | Claude Code |
| `.codex/INSTALL.md` | 利用者向けインストール手順書（superpowers 慣習） | Codex |
| `GEMINI.md` | `@import` ファイル参照 | Gemini CLI |
| `AGENTS.md` | プロジェクトルートドキュメント自動読込 | Codex / OpenCode |
| `setup.*` / `setup-local.*` | インストーラ | 全プラットフォーム |
| `cleanup-kiro-agent.bat` | 旧資産片付け | Kiro 移行ユーザー |

## 14. ワークスペース側に生成されるもの

ハブスキルや `rules-distribute` の動作によって、配布物とは別に **ワークスペース内** にも実行部隊が生成される。これらは setup スクリプトが配置するものではなく、AI Agent がスキル実行中に作成する。

| パス | 生成元 | 内容 |
|---|---|---|
| `.aide/references/global-rules.md` ほか8ファイル | ハブスキル STEP 2 | プラットフォーム外参照を避けるためのコピー |
| `.aide/ai-agent-platform-targets.md` | `rules-distribute` global モード | ワークスペースの対象プラットフォームリスト |
| `.kiro/steering/aide-powers-global-rules.md` 等 | `rules-distribute` global モード | グローバルルールの常時適用ファイル |
| `aide-powers-skill--*.{ext}` | `rules-distribute` skill モード | スキル実行中の一時ルールファイル |
| `.aide/specs/{feature_name}/` 配下 | 各フェーズスキル | 設計書・進捗ファイル・引き継ぎファイル |

`.aide/references/` は **aide-powers のスキルが参照中のため削除禁止** という規定があり、共通用語辞書にも明記されている。

## 15. 章境界の確認

- 各 setup スクリプトの **新オプションを追加する手順** は第3章（03-how-to/）。
- 各スキル・エージェントの **中身（プロンプト・モード・テスト方針）** は第2章（02-ai-agent/）。
- 本ページは「実行部隊がどう配置されているか」までに留め、新規拡張・変更手順には踏み込まない。

