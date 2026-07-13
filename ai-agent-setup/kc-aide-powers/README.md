# aide-powers

AIエージェントにドキュメント駆動開発を教えるフレームワークです。

「aide」は **AI-Driven Engineering**（AI駆動のエンジニアリング）の略です。思いつきでコードを書くのではなく、要件確認 → 設計 → 実装 → レビューという規律ある工学的プロセスを AIエージェントに踏ませることを意図しています。

「アプリ作って」と言うだけでは、動くけれど期待と違うものができあがります。aide-powers を入れると、要件確認 → 設計 → 実装 → レビューの正しい手順を AIエージェントが踏むようになり、ユーザーが本当に欲しいものを作れるようになります。

## 何ができるか

7 つのワークフローで開発プロセス全体をカバーします。発話内容から AIエージェントが自動的に適切なワークフローを選択し、フェーズ順に進めます。

| ワークフロー | いつ使うか | 発話例 |
|---|---|---|
| 企画ワークフロー | アイデア段階 | 「TODOアプリ作りたい」 |
| 設計ワークフロー | 要件が決まった | 「この仕様で設計して」 |
| 実装ワークフロー | 設計書がある | 「実装して」 |
| 設計逆引きワークフロー | コードはあるが設計書がない | 「このコードの設計書を作って」 |
| 変更ワークフロー | 既存コードに機能追加・仕様変更 | 「ログイン機能を追加して」 |
| リファクタリングワークフロー | 内部構造改善（振る舞い不変） | 「このクラスを分割して」 |
| バグ修正ワークフロー | 動かない・エラーが出る | 「このバグ直して」 |

各ワークフローはフェーズスキル（`fs-*`）の連鎖で構成され、必要に応じて共通エージェント（`micro-impl-agent` / `design-review-agent` / `code-review-agent` / 各種QAレビューアーエージェント）が呼び出されます。

## クイックスタート

リポジトリを `git clone` した後、プラットフォームに応じたセットアップスクリプトを実行します。これがグローバルインストール（ユーザーのホーム配下に配置し、全プロジェクトから利用する形態）です。

> **Windows の方はまず [Git for Windows](https://gitforwindows.org/) を入れてください。** `git clone` と setup.bat 内の bash 実行（一部のセットアップ処理）に必要です。インストーラーは既定設定のままで構いません。

### Windows

```cmd
git clone <repository-url> %USERPROFILE%\aide-powers
cd %USERPROFILE%\aide-powers
setup.bat
```

メニューが表示されるので、使うプラットフォームを選択します。

```
1. Kiro IDE / Kiro CLI
2. Claude Code
3. GitHub Copilot（CLI + VSCode）
4. Gemini CLI
5. Codex
6. 全部
0. キャンセル
```

### Linux / Mac / WSL

```bash
git clone <repository-url> ~/aide-powers
cd ~/aide-powers
./setup.sh
```

メニューが表示されるので、使うプラットフォームを選択します。

```
1. Kiro IDE / Kiro CLI
2. Claude Code
3. Copilot CLI
4. VSCode GitHub Copilot
5. Gemini CLI
6. Codex
7. 全部
0. キャンセル
```

### Gemini CLI のみ

Gemini CLI はエクステンションとしてリンクします。

```bash
cd ~/aide-powers
gemini extensions link .
```

## 対応プラットフォーム

| プラットフォーム | 動作方式 | 配置先 |
|---|---|---|
| Claude Code | SessionStart hook → Skill ツール | `~/.claude/skills/`、`~/.claude/agents/`、`~/.claude/hooks/` |
| Kiro IDE | Steering → Skills | `~/.kiro/steering/`、`~/.kiro/skills/`、`~/.kiro/agents/` |
| Kiro CLI | Steering → Skills | 同上 |
| Copilot CLI | SessionStart hook → skill ツール | `~/.copilot/skills/aide-powers/`、`~/.copilot/agents/`、`~/.copilot/hooks/` |
| VSCode GitHub Copilot | Skills 自動発見 + instructions | `~/.copilot/skills/aide-powers/` ＋ VSCode `settings.json` への `chat.hookFilesLocations` 追加 |

> **VSCode GitHub Copilot をお使いの方へ:** aide-powers はサブエージェントのネスト呼び出しを使用するため、VSCode の `settings.json` に `"chat.subagents.allowInvocationsFromSubagents": true` を追加してください。デフォルト（`false`）のままだとワークフローが正常に動作しません。
| Gemini CLI | `GEMINI.md` の `@import` | `gemini extensions link` でリポジトリを参照 |
| Codex | Skills ネイティブ発見 | `~/.agents/skills/aide-powers/`、`~/.agents/agents/aide-powers/` |

プラットフォームごとにツール名や配置先が異なりますが、ツールマップ（`.aide/references/{platform}-tools.md`）でスキル内のツール表記を吸収しているため、利用者側で意識する必要はありません。

## 使い方

インストール後、AIエージェントに普通に話しかけるだけで適切なワークフローが起動します。

```
「Pythonでじゃんけんアプリ作って」
→ 企画ワークフローが起動し、要件確認から始まる

「このバグ直して」
→ バグ修正ワークフローが起動し、原因分析から始まる

「ログイン機能を追加して」
→ 変更ワークフローが起動し、影響範囲分析から始まる
```

会話開始時にハブスキル（`using-aide-powers`）が起点となり、Quick Routing でユーザー発話から該当するエントリポイントスキルへ遷移します。途中の進捗・成果物は `.aide/specs/{feature_name}/` 配下のファイルとして保存されます。

## 更新方法

```bash
cd ~/aide-powers              # Windows: cd %USERPROFILE%\aide-powers
git pull
./setup.sh                    # Windows: setup.bat
```

setup を再実行すると、旧バージョンの構造（旧ワークフロー単位のフォルダ等）は自動的にクリーンアップされ、最新のスキル・エージェント・ルールが上書きコピーされます。

## APM（Agent Package Manager）経由のセットアップ

[APM](https://microsoft.github.io/apm/)（Agent Package Manager）を使うと、プロジェクトの依存として aide-powers を管理できます。

### インストール

利用するプラットフォームに応じて `--target` を指定してインストールします。

| ターゲット | プラットフォーム | `apm install` のみで完結 |
|---|---|---|
| `kiro` | Kiro IDE / Kiro CLI | ❌（setup-local で agents/steering を追加配置） |
| `claude` | Claude Code | ✅ |
| `copilot` | GitHub Copilot（CLI + VSCode） | ✅ |
| `codex` | Codex | ❌（setup-local で AGENTS.md を追加配置） |
| `gemini` | Gemini CLI | ❌（`gemini extensions link .` が別途必要） |

> **前提:** 自己署名証明書を使用しているため、事前に以下の設定が必要です。

```cmd
git config --global http."https://10.110.47.117/".sslVerify false
```

```cmd
apm install --target kiro https://10.110.47.117/kc-apm/kc-aide-powers
```

> `kiro` の部分を上記表のターゲット名に置き換えてください。
> `apm install` のみで完結するプラットフォーム（Claude Code, Copilot）は、これだけでセットアップ完了です。

### セットアップ実行（ギャップ補完が必要なプラットフォームのみ）

上記表で「`apm install` のみで完結」が ✅ のプラットフォーム（Claude Code, Copilot）は追加手順不要です。

❌ のプラットフォームは、APM が配置できないファイルを補完するため、以下の手順で `apm run` を使えるようにしてください。

**手順1: apm.yml に scripts を追記**

プロジェクトの `apm.yml` に以下を追記してください（お使いのプラットフォームに対応する行のみ）：

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/kc-apm/kc-aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\kc-apm\\kc-aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/kc-apm/kc-aide-powers/setup.sh 6"
```

**手順2: apm run で実行**

| コマンド | プラットフォーム | 補完内容 |
|---|---|---|
| `apm run setup-kiro-win` | Kiro IDE (Windows) | agents + steering |
| `apm run setup-kiro-linux` | Kiro IDE (Linux/Mac) | agents + steering |
| `apm run setup-global-codex-win` | Codex (Windows) | グローバル配置 |
| `apm run setup-global-gemini-win` | Gemini CLI (Windows) | グローバル配置 |

> **`apm update` 後も同じコマンドで最新ファイルに更新できます。**

### 更新

全パッケージを一括更新する場合：

```cmd
apm update --force
```

特定パッケージのみ更新する場合：

```cmd
apm update --force kc-aide-powers
```

> Claude Code / Copilot は `apm update --force` だけで更新完了です。

ギャップ補完が必要なプラットフォーム（Kiro, Codex, Gemini）のみ、§「セットアップ実行」と同じ `apm run` コマンドを再実行してください。

### アンインストール

```cmd
apm uninstall kc-aide-powers
```

> **注意:** `apm uninstall` はパッケージ自体を除去しますが、`setup-local` で配置済みのファイル（`.kiro/skills/` 等）は自動削除されません。手動で削除してください。

詳細な手順は [docs/02-getting-started.md](docs/02-getting-started.md) を参照してください。

## ローカルインストール（チーム共有）

プロジェクトリポジトリに aide-powers を組み込み、チーム全員が同じ手順で開発できるようにする配布形態です。プロジェクトの `.kiro/`、`.claude-plugin/`、`.github/` などのローカル領域に配置されます。

```bash
cd ~/aide-powers
./setup-local.sh /path/to/your/project    # Windows: setup-local.bat <project-path>
```

ターゲットプロジェクトのルートで実行すると、引数を省略してカレントディレクトリに配置することもできます。

## 前提条件

- **Git for Windows**（Windows の場合）— `git clone` と setup.bat 内の bash 実行に必要です。[gitforwindows.org](https://gitforwindows.org/) からインストールしてください。
- **Git**（Linux / Mac / WSL の場合）— 多くのディストリビューションには既にインストール済みですが、無ければパッケージマネージャ（`apt install git` / `brew install git` 等）で入れてください。
- **Node.js**（任意）— visual-companion スキルなど、ビジュアル補助機能を使う場合のみ必要です。

## ドキュメント

利用者向けドキュメントは `docs/` 配下に整理されています。

| ドキュメント | 内容 |
|---|---|
| [docs/01-about.md](docs/01-about.md) | aide-powers とは |
| [docs/02-getting-started.md](docs/02-getting-started.md) | インストールと初期設定 |
| [docs/03-usage.md](docs/03-usage.md) | 使い方 |
| [docs/04-faq.md](docs/04-faq.md) | よくある質問 |
| [docs/05-troubleshooting.md](docs/05-troubleshooting.md) | トラブルシュート |
| [docs/kiro-cli-custom-agent.md](docs/kiro-cli-custom-agent.md) | Kiro CLI カスタムエージェント設定 |
| [.codex/INSTALL.md](.codex/INSTALL.md) | Codex インストール手順 |

aide-powers 自体の開発を引き継ぐ方は、開発者向けドキュメントの入口を参照してください。

- [docs-dev/00-overview.md](docs-dev/00-overview.md) — フレームワーク全体像と各章への導線

## ライセンス

京セラ社内利用限定。詳細は [LICENSE](LICENSE) を参照してください。
