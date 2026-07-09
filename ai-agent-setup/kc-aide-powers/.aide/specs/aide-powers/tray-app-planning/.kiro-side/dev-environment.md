# 開発実行環境定義書: aide-powers

## 1. プロジェクトの特性

aide-powersはスキル定義ファイル（SKILL.md）・エージェント定義ファイル（agents/*.md）・設定ファイル（plugin.json, hooks.json等）の再構成が中心である。加えて、タスクトレイ管理アプリ（Python）の開発を含む。スキル・エージェント定義部分は従来のプログラミングプロジェクトとは開発環境の構成が異なるが、タスクトレイ管理アプリはPythonプログラムとして通常の開発環境が必要となる。

### 成果物の種類

| 種類 | 形式 | 例 |
|---|---|---|
| スキル定義 | Markdown（YAMLフロントマター付き） | skills/planning-orchestrator/SKILL.md |
| エージェント定義 | Markdown（YAMLフロントマター付き） | agents/bugfix-analyzer.md |
| プラグインメタデータ | JSON | .claude-plugin/plugin.json |
| フック設定 | JSON | hooks/hooks.json |
| フック実行スクリプト | Shell / CMD | hooks/session-start, hooks/run-hook.cmd |
| ツールマッピング | Markdown | skills/using-aide/references/kiro-tools.md |
| 基盤ルール | Markdown | CLAUDE.md, AGENTS.md |
| ビジュアルコンパニオン | HTML/JS/Node.js | brainstorming/scripts/（superpowersから継承） |
| タスクトレイ管理アプリ | Python | tray-app/（pystray + aiohttp + minio-py） |

## 2. 開発環境

### 2.1 対象OS

| OS | 対応状況 | 備考 |
|---|---|---|
| Windows | ✅ 対応 | hooks/run-hook.cmd でフック実行。PowerShellコマンド使用 |
| macOS | ✅ 対応 | bashスクリプトで動作 |
| Linux | ✅ 対応 | bashスクリプトで動作 |
| WSL | ✅ 対応 | bashスクリプトで動作 |

### 2.2 必須ツール

| ツール | 用途 | 備考 |
|---|---|---|
| Git | バージョン管理・配布 | プライベートリポジトリへのアクセスに認証設定が必要 |
| テキストエディタ | Markdownファイルの編集 | VSCode推奨（Markdown Preview機能あり） |
| Python 3.10+ | タスクトレイ管理アプリの開発・ビルド | venv利用必須。PyInstallerによるexe化にも使用 |

### 2.3 任意ツール（PoC・評価時）

| ツール | 用途 | 備考 |
|---|---|---|
| Claude Code | メインターゲットでの動作確認 | `/plugin install`でインストール |
| VSCode + GitHub Copilot | PoC評価環境 | Agent Plugins（Preview）で動作確認 |
| Kiro IDE / Kiro CLI | Kiro対応の動作確認 | スキル・エージェントの動作検証 |
| Node.js | ビジュアルコンパニオンの実行（superpowersから継承） | brainstorming/scripts/server.cjs の実行に必要 |

### 2.4 Python環境

タスクトレイ管理アプリの開発にPython 3.10+が必要。

| 項目 | 内容 |
|---|---|
| Pythonバージョン | 3.10以上（minio-pyの推奨バージョン。pystrayはPython 3.4+対応だが3.10+に統一） |
| 用途 | タスクトレイ管理アプリの開発・テスト・ビルド（PyInstallerによるexe化） |
| 適用範囲 | `tray-app/` ディレクトリ配下のみ。スキル・エージェント定義ファイルにはPython不要 |

### 2.5 仮想環境（venv）

タスクトレイ管理アプリの開発にvenvを使用する。

| 項目 | 内容 |
|---|---|
| venvパス | `tray-app/.venv` |
| 作成手順 | `cd tray-app && python -m venv .venv` |
| 有効化（Windows） | `tray-app\.venv\Scripts\Activate.ps1` |
| 有効化（WSL/Linux/macOS） | `source tray-app/.venv/bin/activate` |
| 依存インストール | `pip install -r tray-app/requirements.txt` |
| 依存固定 | `pip freeze > tray-app/requirements.txt` |

**注意**: スキル・エージェント定義ファイルの編集作業にはvenvは不要。venvはタスクトレイアプリの開発時のみ使用する。

## 3. リポジトリ構成

### 3.1 ディレクトリ構造

```
aide-powers/
├── .claude-plugin/
│   └── plugin.json                    # Claude Codeプラグインメタデータ
├── .cursor-plugin/
│   └── plugin.json                    # Cursorプラグインメタデータ
├── .github/
│   └── plugin.json                    # VSCode Copilot Agent Pluginsメタデータ
├── .codex/
│   └── INSTALL.md                     # Codex CLIインストールガイド
├── .kiro/
│   ├── INSTALL.md                     # Kiroインストールガイド
│   └── steering/
│       └── aide-bootstrap.md          # Kiroブートストラップ用ステアリング（候補1）
├── .opencode/
│   ├── INSTALL.md                     # OpenCodeインストールガイド
│   └── plugins/
│       └── aide.js                    # OpenCodeプラグインスクリプト
├── skills/
│   ├── using-aide/
│   │   ├── SKILL.md                   # メタスキル（オーケストレーター自動選択）
│   │   └── references/
│   │       ├── codex-tools.md         # Codex CLIツールマッピング
│   │       ├── copilot-tools.md       # Copilot CLIツールマッピング
│   │       ├── gemini-tools.md        # Gemini CLIツールマッピング
│   │       └── kiro-tools.md          # Kiroツールマッピング（新規作成）
│   ├── planning-orchestrator/
│   │   └── SKILL.md
│   ├── design-orchestrator/
│   │   └── SKILL.md
│   ├── impl-orchestrator/
│   │   └── SKILL.md
│   ├── reverse-design-orchestrator/
│   │   └── SKILL.md
│   ├── change-orchestrator/
│   │   └── SKILL.md
│   ├── refactoring-orchestrator/
│   │   └── SKILL.md
│   ├── bugfix-orchestrator/
│   │   └── SKILL.md
│   ├── brainstorming/                 # superpowersから継承（ビジュアルコンパニオン含む）
│   ├── writing-plans/                 # superpowersから差し替え
│   ├── subagent-driven-development/   # superpowersから差し替え
│   ├── executing-plans/               # superpowersから差し替え（インライン実行代替）
│   ├── finishing-a-development-branch/ # superpowersから差し替え
│   ├── using-git-worktrees/           # superpowersからそのまま
│   ├── test-driven-development/       # superpowersからそのまま
│   ├── systematic-debugging/          # superpowersからそのまま
│   ├── verification-before-completion/ # superpowersからそのまま
│   ├── requesting-code-review/        # superpowersから差し替え
│   ├── receiving-code-review/         # superpowersからそのまま
│   ├── dispatching-parallel-agents/   # superpowersからそのまま
│   └── writing-skills/               # superpowersから差し替え
├── agents/
│   ├── （企画プロセス: 4ファイル）
│   ├── （設計プロセス: 11ファイル）
│   ├── （設計逆引きプロセス: 8ファイル）
│   ├── （変更プロセス: 8ファイル）
│   ├── （バグ修正プロセス: 4ファイル）
│   ├── （リファクタリングプロセス: 4ファイル）
│   └── （共通: 7ファイル）
├── hooks/
│   ├── hooks.json                     # Claude Code / Copilot CLI向けフック設定
│   ├── hooks-cursor.json              # Cursor向けフック設定
│   ├── session-start                  # セッション開始スクリプト（bash）
│   └── run-hook.cmd                   # Windows向けフック実行ラッパー
├── tray-app/                              # タスクトレイ管理アプリ（Python）
│   ├── app/                               # ソースコードルートパッケージ（4層レイヤードアーキテクチャ）
│   │   ├── main.py                        # エントリーポイント
│   │   ├── domain/                        # ドメイン層（ビジネスロジック）
│   │   ├── application/                   # アプリケーション層（ユースケース）
│   │   ├── infrastructure/                # インフラストラクチャ層（MinIO・ファイルシステム等）
│   │   └── presentation/                  # プレゼンテーション層
│   │       ├── tray/                      # pystrayタスクトレイ管理
│   │       ├── web/                       # aiohttpローカルサーバー・API・WebSocket
│   │       ├── templates/                 # Jinja2テンプレートHTML（aiohttp-jinja2経由）
│   │       └── static/                    # 静的ファイル（CSS/JS/アイコン）
│   ├── tests/                             # テストコード
│   ├── requirements.txt                   # 依存パッケージ（バージョン固定）
│   ├── requirements-dev.txt               # 開発用依存パッケージ
│   ├── pyinstaller.spec                   # PyInstallerビルド設定
│   └── .venv/                             # 仮想環境（.gitignore対象）
├── CLAUDE.md                          # 基盤ルール（~120行）
├── AGENTS.md                          # マルチプラットフォーム対応エージェント設定
├── GEMINI.md                          # Gemini CLI向け設定
├── gemini-extension.json              # Gemini CLI向け拡張定義
├── README.md                          # プロジェクト説明・インストール手順
├── .gitignore
└── .gitattributes
```

### 3.2 ファイル命名規約

| 種類 | 命名規約 | 例 |
|---|---|---|
| スキル | `skills/{skill-name}/SKILL.md` | skills/planning-orchestrator/SKILL.md |
| スキル参照ファイル | `skills/{skill-name}/references/{name}.md` | skills/using-aide/references/kiro-tools.md |
| スキルプロンプトテンプレート | `skills/{skill-name}/{role}-prompt.md` | skills/subagent-driven-development/implementer-prompt.md |
| エージェント定義 | `agents/{agent-name}.md` | agents/bugfix-analyzer.md |
| プラットフォーム設定 | `.{platform}/plugin.json` | .claude-plugin/plugin.json |

### 3.3 .gitignore

```
# Node.js（ビジュアルコンパニオン用）
node_modules/

# Python（タスクトレイアプリ用）
tray-app/.venv/
__pycache__/
*.pyc
*.pyo
*.egg-info/
dist/
build/
*.spec

# OS固有
.DS_Store
Thumbs.db

# エディタ固有
.vscode/
.idea/

# ローカル設定
CLAUDE.local.md
*.local.md
```

## 4. 開発ワークフロー

### 4.1 開発方法論

- 設計オーケストレーターや実装オーケストレーターは使わず、プロジェクト専用の開発Agent/SKILLを用意して開発する
- PoCの結果から開発専用Agent/SKILLの定義を確定する
- スキル作成にはsuperpowersのwriting-skillsスキルのTDDアプローチ（RED-GREEN-REFACTOR）を採用

### 4.2 PoC先行の開発順序

1. **PoC**: 企画・設計・実装の3オーケストレーターをsuperpowers形式に再構成
2. **評価**: VSCode GitHub Copilotで通しフロー検証
3. **全体展開**: PoCの結果から全体の変換工程を確定

### 4.3 変換の優先順位

planning → design → impl（PoC先行）→ CLAUDE.md → change → bugfix → refactoring → reverse

### 4.4 評価環境

| 項目 | 内容 |
|---|---|
| PoC評価プラットフォーム | VSCode GitHub Copilot |
| 選定理由 | 技術調査08で「最も統合しやすいプラットフォーム」と確認済み |
| 評価方法 | 新規プロジェクトの企画→設計→実装の一連のフローを完遂できるか検証 |

## 5. 依存管理

### 5.1 スキル・エージェント定義の外部依存

スキル・エージェント定義部分は外部パッケージ・外部サービスへの依存を持たない（ゼロ依存原則）。

| 項目 | 依存 |
|---|---|
| 外部パッケージ | なし（Markdownファイルのみ） |
| 外部サービス | なし（各プラットフォームのAIモデルは各プラットフォームの契約に依存） |
| ランタイム | 各プラットフォームのAIエージェントランタイム |

### 5.2 タスクトレイ管理アプリの依存パッケージ

`tray-app/requirements.txt` で管理する。詳細は [program-structure.md](./program-structure.md) §10 を参照。

| パッケージ | バージョン | ライセンス | 用途 |
|---|---|---|---|
| pystray | ==0.19.5 | LGPLv3 | タスクトレイ常駐・右クリックメニュー・トースト通知 |
| aiohttp | >=3.9.0,<4.0.0 | Apache 2.0 | 非同期HTTPサーバー（ブラウザUI提供） |
| aiohttp-jinja2 | >=1.6,<2.0 | Apache 2.0 | aiohttpとJinja2テンプレートの統合 |
| jinja2 | >=3.1.0,<4.0.0 | BSD-3-Clause | テンプレートエンジン |
| minio | >=7.2.0,<8.0.0 | Apache 2.0 | S3互換ストレージSDK（バージョン監視・ダウンロード） |
| Pillow | >=10.0.0,<11.0.0 | HPND License | pystray依存。アイコン画像の生成・読み込み |
| PyInstaller | >=6.13.0,<7.0.0 | GPL v2（ブートローダー: Apache 2.0） | exe化（開発依存。requirements-dev.txtに分離も可） |

**標準ライブラリ（追加インストール不要）**:
- `winreg`: Windowsレジストリ操作（スタートアップ登録）
- `webbrowser`: デフォルトブラウザ起動
- `asyncio`: aiohttpサーバーのイベントループ管理
- `logging`: ログ出力
- `json`: 設定ファイル・バージョン情報の読み書き

### 5.3 グローバル環境の非汚染ルール（REQ-M17）

aide-powersの開発・実行に必要な依存は、すべてプロジェクトフォルダ内で管理する。グローバル環境へのインストールを禁止する。

| 言語 | ローカル管理方式 | 禁止事項 |
|---|---|---|
| Python | `tray-app/.venv/` + `tray-app/requirements.txt` | `pip install` をvenv外で実行しない |
| Node.js | `tray-app/node_modules/` + `tray-app/package.json`（必要な場合） | `npm install -g` を使用しない |

**確認方法**: `pip list`（venv外）や `npm list -g` で、aide-powers関連のパッケージがグローバルに存在しないことを確認する。

### 5.4 superpowersからの継承

superpowersのファイルを基盤として使用する。構成要素判定表（poc-framework-analysis.md）に基づき、以下の方針で管理する:

- **そのまま使う（25件）**: superpowersのファイルをそのままコピー。superpowersの更新に追従する場合はコピーを更新
- **中身を差し替える（30件）**: ファイル構造はsuperpowersを踏襲し、中身をAIDEのロジックに書き換え。aide-powers独自の管理
- **新規作成（1件）**: kiro-tools.md。aide-powers独自

## 6. 実行ルール

### 6.1 スキルの実行

- スキルは各プラットフォームのSkillツール（またはスラッシュコマンド）で呼び出す
- using-aideメタスキルがオーケストレーターの自動選択を担当
- 各オーケストレータースキルはフェーズ管理ロジックに従いサブエージェントを委譲

### 6.2 サブエージェントの実行

- サブエージェントはフォアグラウンドで実行（ユーザー対話が必要なため）
- 各サブエージェントは独立したコンテキストウィンドウで動作
- 親のコンテキストは継承しない。必要な情報はプロンプトテンプレートで注入

### 6.3 フックの実行

- セッション開始時にhooks/session-startスクリプトが実行される
- using-aide/SKILL.mdの内容を読み込みJSON形式で出力
- Windows環境ではhooks/run-hook.cmdを経由

### 6.4 タスクトレイアプリの実行

#### 開発時の実行

```powershell
# venv有効化（Windows）
cd tray-app
.venv\Scripts\Activate.ps1

# アプリ起動
python -m app.main
```

```bash
# venv有効化（WSL/Linux/macOS）
cd tray-app
source .venv/bin/activate

# アプリ起動
python -m app.main
```

#### exe化（ビルド）

```powershell
# Windows上でのみビルド可能（PyInstallerはクロスコンパイル非対応）
cd tray-app
.venv\Scripts\Activate.ps1
pyinstaller --onefile --windowed --icon=app/presentation/static/img/aide-powers.ico app/main.py
```

- `--onefile`: 単一exeファイルに結合
- `--windowed`: コンソールウィンドウを非表示（タスクトレイアプリに必須）
- `--icon`: exeのアイコン指定
- 出力先: `tray-app/dist/main.exe`

#### テスト実行

```powershell
cd tray-app
.venv\Scripts\Activate.ps1
python -m pytest tests/
```

## 7. プラットフォーム別インストール手順

### 7.1 Claude Code（メインターゲット）

```bash
# プライベートGitリポジトリから直接インストール
claude /plugin install https://your-git-server.com/team/aide-powers.git

# バージョン固定でインストール
claude /plugin install https://your-git-server.com/team/aide-powers#v1.0.0
```

チーム展開（`.claude/settings.json`に追加）:
```json
{
  "plugins": [
    {
      "source": "https://your-git-server.com/team/aide-powers",
      "enabled": true
    }
  ]
}
```

### 7.2 Codex CLI

```bash
# リポジトリをクローン
git clone https://your-git-server.com/team/aide-powers.git ~/.codex/aide

# スキルのシンボリックリンクを作成
mkdir -p ~/.agents/skills
ln -s ~/.codex/aide/skills ~/.agents/skills/aide

# multi_agentを有効化（~/.codex/config.toml）
# [features]
# multi_agent = true
```

### 7.3 Kiro

```bash
# リポジトリをクローン
git clone https://your-git-server.com/team/aide-powers.git ~/.kiro/aide

# スキルのシンボリックリンク
mkdir -p ~/.kiro/skills
ln -sf ~/.kiro/aide/skills ~/.kiro/skills/aide

# エージェントのコピー
mkdir -p ~/.kiro/agents
cp ~/.kiro/aide/agents/*.md ~/.kiro/agents/

# ブートストラップ用ステアリングファイルの配置
cp ~/.kiro/aide/.kiro/steering/aide-bootstrap.md ~/.kiro/steering/

# Kiroを再起動
```

### 7.4 VSCode GitHub Copilot

Agent Plugins（Preview）経由:
- `.github/plugin.json`がリポジトリに含まれているため、リポジトリをクローンするだけで動作
- Extensions ビューで `@agentPlugins` 検索でもインストール可能

### 7.5 その他のプラットフォーム

各プラットフォーム固有のINSTALL.mdを参照:
- Cursor: `.cursor-plugin/plugin.json`
- OpenCode: `.opencode/INSTALL.md`
- Gemini CLI: `GEMINI.md` + `gemini-extension.json`
- Copilot CLI: `copilot plugin install`

---

*本文書はシステム要件定義書（system-requirements.md）と連携する開発実行環境定義書です。*
*実装フェーズでサブエージェントに直接渡される、開発環境に特化した情報を記載しています。*
