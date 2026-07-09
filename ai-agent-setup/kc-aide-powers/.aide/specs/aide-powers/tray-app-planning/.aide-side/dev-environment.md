# 開発実行環境定義書: aide-powers

## 1. プロジェクトの特性

aide-powersはスキル定義ファイル（SKILL.md）・エージェント定義ファイル（agents/*.md）・設定ファイル（hooks.json等）・ルール定義ファイル（global-rules.md等）で構成されるAI Agent開発支援フレームワークである。従来のプログラミングプロジェクトとは異なり、成果物の大半はMarkdownファイルである。

### 成果物の種類

| 種類 | 形式 | 例 |
|---|---|---|
| スキル定義 | Markdown（YAMLフロントマター付き） | skills/fs-change-phase1-status/SKILL.md |
| エージェント定義 | Markdown（YAMLフロントマター付き） | agents/code-review-agent.md |
| ツールマッピング | Markdown | skills/using-aide-powers/references/kiro-ide-tools.md |
| グローバルルール | Markdown | skills/using-aide-powers/references/global-rules.md |
| 進捗ファイルフォーマット | Markdown | skills/using-aide-powers/references/progress-file-format.md |
| プラットフォーム設定 | JSON / Markdown | .claude-plugin/plugin.json, GEMINI.md |
| フック設定 | JSON | hooks/hooks.json, hooks/brainstorm-selection.json |
| フック実行スクリプト | Shell / CMD | hooks/session-start, hooks/run-hook.cmd |
| ステアリングファイル | Markdown | steering/aide-powers-bootstrap.md |
| 基盤ルール | Markdown | AGENTS.md, aide-powers-global-rules.agents.md |
| ビジュアルコンパニオン | HTML/JS/Node.js | skills/visual-companion/scripts/ |
| セットアップスクリプト | Shell / CMD | setup.sh, setup.bat, setup-local.sh, setup-local.bat |

## 2. 開発環境

### 2.1 対象OS

| OS | 対応状況 | 備考 |
|---|---|---|
| Windows | ✅ 対応 | hooks/run-hook.cmd, setup.bat でフック実行・セットアップ |
| macOS | ✅ 対応 | bashスクリプトで動作 |
| Linux | ✅ 対応 | bashスクリプトで動作 |
| WSL | ✅ 対応 | bashスクリプトで動作 |

### 2.2 必須ツール

| ツール | 用途 | 備考 |
|---|---|---|
| Git | バージョン管理・配布 | プライベートリポジトリへのアクセスに認証設定が必要 |
| テキストエディタ | Markdownファイルの編集 | VSCode / Kiro IDE 推奨 |
| Node.js | ビジュアルコンパニオンの実行 | skills/visual-companion/scripts/server.cjs の実行に必要 |

### 2.3 任意ツール（動作確認時）

| ツール | 用途 | 備考 |
|---|---|---|
| Claude Code | メインターゲットでの動作確認 | `/plugin install`でインストール |
| Kiro IDE | Kiro IDE 対応の動作確認 | スキル・エージェントの動作検証 |
| Kiro CLI | Kiro CLI 対応の動作確認 | スキル・エージェントの動作検証 |
| VSCode + GitHub Copilot | Copilot Agent Plugins での動作確認 | Agent Plugins（Preview）で動作確認 |
| Codex CLI | Codex CLI 対応の動作確認 | multi_agent 有効化が必要 |
| Gemini CLI | Gemini CLI 対応の動作確認 | gemini-extension.json で設定 |

### 2.4 Python環境（tray-app 用・未実装）

**注意: tray-app は設計済み・未実装。以下は設計時の定義であり、実装時に最新化する。**

| 項目 | 内容 |
|---|---|
| Pythonバージョン | 3.10以上 |
| 用途 | タスクトレイ管理アプリの開発・テスト・ビルド |
| 適用範囲 | `tray-app/` ディレクトリ配下のみ |

### 2.5 仮想環境（venv）（tray-app 用・未実装）

**注意: tray-app は設計済み・未実装。以下は設計時の定義であり、実装時に最新化する。**

| 項目 | 内容 |
|---|---|
| venvパス | `tray-app/.venv` |
| 作成手順 | `cd tray-app && python -m venv .venv` |
| 有効化（Windows） | `tray-app\.venv\Scripts\Activate.ps1` |
| 有効化（WSL/Linux/macOS） | `source tray-app/.venv/bin/activate` |

## 3. リポジトリ構成

### 3.1 ディレクトリ構造

```
aide-powers/
├── .aide/
│   ├── references/                    # ツールマップ・グローバルルール等（WF開始時にコピー）
│   │   ├── codex-tools.md
│   │   ├── copilot-tools.md
│   │   ├── gemini-tools.md
│   │   ├── global-rules.md
│   │   ├── kiro-cli-tools.md
│   │   ├── kiro-ide-tools.md
│   │   ├── progress-file-format.md
│   │   └── vscode-copilot-tools.md
│   └── specs/
│       └── aide-powers/               # 設計書・変更履歴・技術参考資料
│           ├── doc-index.md
│           ├── dev-environment.md     # 本ファイル
│           ├── user-requirements.md
│           ├── system-requirements.md
│           ├── program-structure.md
│           ├── system-architecture.md
│           ├── pending-issues.md
│           ├── changes/               # 変更ワークフロー成果物
│           ├── tech-investigation/    # 技術調査結果
│           ├── tech-references/       # 技術参考資料
│           └── usecases/              # ユースケース関連
├── .claude-plugin/
│   ├── marketplace.json               # Claude Code マーケットプレイス設定
│   └── plugin.json                    # Claude Code プラグインメタデータ
├── .codex/
│   └── INSTALL.md                     # Codex CLI インストールガイド
├── .github/
│   └── instructions/
│       └── aide-powers-global-rules.instructions.md  # GitHub Copilot 用ルール
├── .kiro/
│   ├── agents/                        # Kiro IDE 用カスタムエージェント（開発支援用）
│   ├── specs/                         # Kiro IDE 用スペック
│   └── steering/
│       └── aide-powers-global-rules.md  # Kiro IDE ステアリング（グローバルルール）
├── agents/                            # 共通エージェント定義
│   ├── architecture-qa-agent.md
│   ├── code-review-agent.md
│   ├── delta-design-qa-agent.md
│   ├── design-review-agent.md
│   ├── final-design-qa-agent.md
│   ├── micro-impl-agent.md
│   ├── object-design-qa-agent.md
│   └── requirements-qa-agent.md
├── docs/
│   └── kiro-cli-custom-agent.md       # Kiro CLI カスタムエージェント資料
├── hooks/
│   ├── brainstorm-selection.json      # ビジュアルコンパニオン選択Hook
│   ├── hooks.json                     # Claude Code / Copilot CLI 向けフック設定
│   ├── run-hook.cmd                   # Windows向けフック実行ラッパー
│   └── session-start                  # セッション開始スクリプト（bash）
├── instructions/
│   └── aide-powers.instructions.md    # Copilot CLI 用インストラクション
├── references/                        # 外部リポジトリ参照（.gitignore対象）
│   ├── kiro-agents/                   # kiro-agents リポジトリのコピー
│   ├── kiro-desk-agents/              # kiro-desk-agents リポジトリのコピー
│   └── superpowers/                   # superpowers リポジトリのコピー
├── skills/                            # スキル定義（70+フォルダ）
│   ├── using-aide-powers/             # メタスキル（エントリポイント）
│   │   ├── SKILL.md
│   │   └── references/                # ツールマップ・ルール等のソース
│   │       ├── codex-tools.md
│   │       ├── copilot-tools.md
│   │       ├── gemini-tools.md
│   │       ├── global-rules.md
│   │       ├── kiro-cli-tools.md
│   │       ├── kiro-ide-tools.md
│   │       ├── progress-file-format.md
│   │       └── vscode-copilot-tools.md
│   ├── fs-planning-*/                 # 企画WFフェーズスキル（3件）
│   ├── fs-design-*/                   # 設計WFフェーズスキル（10件）
│   ├── fs-impl-*/                     # 実装WFフェーズスキル（6件）
│   ├── fs-reverse-*/                  # 設計逆引きWFフェーズスキル（5件）
│   ├── fs-change-*/                   # 変更WFフェーズスキル（9件）
│   ├── fs-bugfix-*/                   # バグ修正WFフェーズスキル（6件）
│   ├── fs-refactoring-*/              # リファクタリングWFフェーズスキル（6件）
│   ├── visual-companion/              # ビジュアルコンパニオン
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       ├── frame-template.html
│   │       ├── helper.js
│   │       ├── server.cjs
│   │       ├── start-server.bat
│   │       ├── start-server.sh
│   │       └── stop-server.sh
│   └── （共通スキル 20+件）
│       ├── aide-powers-guide/
│       ├── code-quality-review/
│       ├── ddd-modeling/
│       ├── design-gate/
│       ├── design-qa-dispatch/
│       ├── design-sync/
│       ├── doc-index-maintenance/
│       ├── doc-sync/
│       ├── error-handling-review/
│       ├── folder-merge-check/
│       ├── git-commit-workflow/
│       ├── gui-design/
│       ├── impl-coding-standards/
│       ├── impl-task-planning/
│       ├── import-review/
│       ├── infra-interface-design/
│       ├── multi-stage-code-review/
│       ├── object-design/
│       ├── pending-issues-management/
│       ├── program-structure-design/
│       ├── progress-resume-check/
│       ├── rules-distribute/
│       ├── session-handover/
│       ├── system-requirements-definition/
│       ├── task-orchestration/
│       ├── tech-investigation/
│       ├── test-review/
│       ├── toolmap-verifier/
│       ├── usecase-analysis/
│       ├── user-profile-management/
│       └── user-requirements-definition/
├── steering/
│   └── aide-powers-bootstrap.md       # 非Kiroプラットフォーム用ブートストラップ
├── AGENTS.md                          # マルチプラットフォーム対応エージェント設定
├── aide-powers-global-rules.agents.md # AGENTS.md から参照されるグローバルルール
├── GEMINI.md                          # Gemini CLI 向け設定
├── gemini-extension.json              # Gemini CLI 向け拡張定義
├── README.md                          # プロジェクト説明・インストール手順
├── setup.bat / setup.sh               # グローバルインストール用セットアップ
├── setup-local.bat / setup-local.sh   # ローカル（ワークスペース内）セットアップ
├── cleanup-kiro-agent.bat / .sh       # Kiro エージェントクリーンアップ
└── .gitignore
```

### 3.2 ファイル命名規約

| 種類 | 命名規約 | 例 |
|---|---|---|
| スキル | `skills/{skill-name}/SKILL.md` | skills/fs-change-phase1-status/SKILL.md |
| スキル参照ファイル | `skills/{skill-name}/references/{name}.md` | skills/using-aide-powers/references/kiro-ide-tools.md |
| ワークスペース参照ファイル | `.aide/references/{name}.md` | .aide/references/global-rules.md |
| エージェント定義 | `agents/{agent-name}.md` | agents/code-review-agent.md |
| Kiro IDE エージェント | `.kiro/agents/{agent-name}.md` | .kiro/agents/tech-investigator.md |
| プラットフォーム設定 | `.{platform}/plugin.json` 等 | .claude-plugin/plugin.json |
| ステアリング | `steering/{name}.md` または `.kiro/steering/{name}.md` | steering/aide-powers-bootstrap.md |
| 変更ワークフロー成果物 | `.aide/specs/{feature}/changes/{YYYYMMDDHHmm}-{概略}/` | .aide/specs/aide-powers/changes/202605191500-dev-environment-update/ |

### 3.3 .gitignore

```
# 参照用フォルダ（外部リポジトリのコピー）
/references/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
Desktop.ini

# Editor / IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
*.egg-info/
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Personal files
あとこれ.txt

# Session handover files (local working files, not for repository)
.aide/specs/**/session-handover*.md
```

## 4. 開発ワークフロー

### 4.1 開発方法論

aide-powers 自体の開発は aide-powers のワークフローを使用して行う（セルフホスティング）。
変更ワークフロー（fs-change-*）を使用してスキル・エージェント定義の追加・修正を行う。

### 4.2 ワークフロー一覧

| ワークフロー | 用途 | フェーズスキル数 |
|---|---|---|
| 企画 | 新規プロジェクトのアイデア整理・企画書作成 | 3 |
| 設計 | 要件定義〜プログラム構成設計 | 10 |
| 実装 | 設計書に基づくコード実装 | 6 |
| 設計逆引き | 既存コードから設計書を生成 | 5 |
| 変更 | 既存コードへの機能追加・仕様変更 | 9 |
| バグ修正 | バグの報告〜修正〜ドキュメント更新 | 6 |
| リファクタリング | 内部構造改善（振る舞い変更なし） | 6 |

### 4.3 開発支援エージェント（.kiro/agents/）

aide-powers 自体の開発を支援するカスタムエージェント群。プロダクトの一部ではなく、開発ツール。

| エージェント | 役割 |
|---|---|
| tech-investigator | 技術調査（Web検索で最新情報確認） |
| workflow-designer | ワークフロー詳細構成資料の作成 |
| workflow-design-reviewer | ワークフロー詳細構成資料のレビュー |
| phase-skill-structure-designer | フェーズスキル構成設計 |
| phase-skill-structure-reviewer | フェーズスキル構成設計のレビュー |
| phase-skill-detail-designer | フェーズスキル詳細設計 |
| phase-skill-detail-reviewer | フェーズスキル詳細設計のレビュー |
| common-skill-detail-designer | 共通スキル詳細設計 |
| common-skill-detail-reviewer | 共通スキル詳細設計のレビュー |
| skill-file-writer | SKILL.md 実ファイル作成 |
| skill-file-reviewer | SKILL.md 実ファイルのレビュー |
| agent-file-writer | エージェント定義ファイル作成 |
| agent-file-reviewer | エージェント定義ファイルのレビュー |
| migration-planner | kiro-agents → aide-powers 移植計画 |
| migration-worker | 移植実行 |
| migration-reviewer | 移植結果レビュー |
| migration-modifier | 移植結果への追加変更 |
| flatten-analyzer | skills/ フラット化の影響分析 |
| flatten-executor | skills/ フラット化の実行 |
| flatten-reviewer | skills/ フラット化の成果物レビュー |
| using-aide-powers-enhancer | using-aide-powers スキルの強化 |
| workflow-final-reviewer | ワークフロー設計の全体整合性確認 |

## 5. 依存管理

### 5.1 スキル・エージェント定義の外部依存

スキル・エージェント定義部分は外部パッケージ・外部サービスへの依存を持たない（ゼロ依存原則）。

| 項目 | 依存 |
|---|---|
| 外部パッケージ | なし（Markdownファイルのみ） |
| 外部サービス | なし（各プラットフォームのAIモデルは各プラットフォームの契約に依存） |
| ランタイム | 各プラットフォームのAIエージェントランタイム |

### 5.2 ビジュアルコンパニオンの依存

| パッケージ | 用途 | 備考 |
|---|---|---|
| Node.js | server.cjs の実行 | ローカルHTTPサーバー起動 |

### 5.3 tray-app の依存パッケージ（未実装・設計のみ）

**注意: tray-app は設計済み・未実装。以下は設計時の定義であり、実装時に最新化する。**

`tray-app/requirements.txt` で管理予定。詳細は [program-structure.md](./program-structure.md) §10 を参照。

| パッケージ | バージョン | 用途 |
|---|---|---|
| pystray | ==0.19.5 | タスクトレイ常駐 |
| aiohttp | >=3.9.0,<4.0.0 | 非同期HTTPサーバー |
| aiohttp-jinja2 | >=1.6,<2.0 | テンプレート統合 |
| jinja2 | >=3.1.0,<4.0.0 | テンプレートエンジン |
| minio | >=7.2.0,<8.0.0 | S3互換ストレージSDK |
| Pillow | >=10.0.0,<11.0.0 | アイコン画像処理 |
| PyInstaller | >=6.13.0,<7.0.0 | exe化 |

### 5.4 superpowers からの継承

aide-powers は独自のスキル体系に完全移行済み。superpowers からの継承は以下のみ:

| 継承元 | 継承内容 | 現在の配置 |
|---|---|---|
| superpowers/brainstorming | ビジュアルコンパニオン（HTML/JS/Node.js サーバー） | skills/visual-companion/scripts/ |

他の全スキル・エージェントは aide-powers 独自設計。superpowers の skills/ を直接使用するものはない。

### 5.5 グローバル環境の非汚染ルール

aide-powersの開発・実行に必要な依存は、すべてプロジェクトフォルダ内で管理する。グローバル環境へのインストールを禁止する。

## 6. 実行ルール

### 6.1 スキルの実行

- スキルは各プラットフォームのSkillツール（Kiro IDE: `discloseContext`、Claude Code: `Skill`）で呼び出す
- using-aide-powers メタスキルがワークフロー選択を担当
- 各フェーズスキルは順番に activate され、定義された手順に従って作業を進行する

### 6.2 サブエージェントの実行

- サブエージェントは各プラットフォームの Task ツール（Kiro IDE: `invokeSubAgent`）で起動する
- 各サブエージェントは独立したコンテキストウィンドウで動作
- 親のコンテキストは継承しない。必要な情報はプロンプトで注入

### 6.3 フックの実行

- セッション開始時に hooks/session-start スクリプトが実行される（Claude Code）
- Kiro IDE では .kiro/steering/ のステアリングファイルが自動読み込みされる
- Windows環境では hooks/run-hook.cmd を経由

### 6.4 ツールマップの参照

ワークフロー開始時に `skills/using-aide-powers/references/` 内のファイルが `.aide/references/` にコピーされる。
各スキル・エージェントは `.aide/references/` 内のファイルを参照する。

| プラットフォーム | ツールマップファイル |
|---|---|
| Kiro IDE | `.aide/references/kiro-ide-tools.md` |
| Kiro CLI | `.aide/references/kiro-cli-tools.md` |
| Copilot CLI | `.aide/references/copilot-tools.md` |
| VSCode GitHub Copilot | `.aide/references/vscode-copilot-tools.md` |
| Codex CLI | `.aide/references/codex-tools.md` |
| Gemini CLI | `.aide/references/gemini-tools.md` |

## 7. プラットフォーム別インストール手順

### 7.1 Claude Code（メインターゲット）

```bash
# プライベートGitリポジトリから直接インストール
claude /plugin install https://your-git-server.com/team/aide-powers.git
```

### 7.2 Kiro IDE

```bash
# リポジトリをクローン
git clone https://your-git-server.com/team/aide-powers.git ~/.kiro/aide

# セットアップスクリプト実行
cd ~/.kiro/aide && ./setup.sh
# または Windows: setup.bat
```

セットアップスクリプトが以下を実行:
- skills/ のシンボリックリンク作成（`~/.kiro/skills/` 配下）
- agents/ のコピー（`~/.kiro/agents/` 配下）
- steering/ のコピー（`~/.kiro/steering/` 配下）

### 7.3 Codex CLI

```bash
# リポジトリをクローン
git clone https://your-git-server.com/team/aide-powers.git ~/.codex/aide

# セットアップスクリプト実行
cd ~/.codex/aide && ./setup.sh
```

### 7.4 VSCode GitHub Copilot

`.github/instructions/` にインストラクションファイルが含まれているため、リポジトリをクローンするだけで動作。

### 7.5 Gemini CLI

```bash
# リポジトリをクローン後、GEMINI.md と gemini-extension.json を参照
```

### 7.6 ローカルインストール（ワークスペース内）

```bash
# ワークスペース内にクローンして setup-local を実行
git clone https://your-git-server.com/team/aide-powers.git
cd aide-powers && ./setup-local.sh
# または Windows: setup-local.bat
```

---

*本文書はシステム要件定義書（system-requirements.md）と連携する開発実行環境定義書です。*
*実装フェーズでサブエージェントに直接渡される、開発環境に特化した情報を記載しています。*
