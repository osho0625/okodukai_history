# 02. はじめての aide-powers

aide-powers をインストールし、初回利用を始めるまでの手順をまとめます。利用エンジニアが上から順に実行することで、お使いのプラットフォームで aide-powers が動作する状態に到達できます。

このページに書かれているのは「インストールと起動確認の手順」と「うまくいったかの判断基準」のみです。問題が起きた場合の解決方法は `docs/05-troubleshooting.md` を参照してください。

## 1. 前提条件

aide-powers のインストールと利用には、以下のソフトウェアが必要です。

| ソフトウェア | 必須／任意 | 用途 |
|---|---|---|
| Git | 必須 | aide-powers リポジトリの clone（`git clone`） |
| Bash | Windows では必須 | `setup.sh` 系の実行、Claude Code / Cursor の SessionStart hook 実行。Windows では Git for Windows に同梱の bash を利用 |
| Node.js | 任意 | visual-companion スキルを使用する場合のみ必要 |

Windows をお使いの場合は、Git for Windows をインストールすると Git と Bash の両方が同時に揃います。

## 2. リポジトリの clone

aide-powers は配布単位として Git リポジトリの形で提供されます。任意のディレクトリに clone してください。

### Windows

```cmd
git clone <repository-url> %USERPROFILE%\aide-powers
cd %USERPROFILE%\aide-powers
```

### Linux / Mac / WSL

```bash
git clone <repository-url> ~/aide-powers
cd ~/aide-powers
```

`<repository-url>` には、配布元から提供されたリポジトリ URL を指定してください。clone 先のパスは任意ですが、後で `setup` を再実行して更新するときに参照するため、覚えやすい場所に置くことをおすすめします。

## 3. グローバルインストール

`setup.bat`（Windows）または `setup.sh`（Linux/Mac/WSL）を実行すると、各プラットフォームのホームディレクトリ配下に aide-powers が配置されます。これを **グローバルインストール** と呼び、ホームディレクトリ配下のすべてのプロジェクトから aide-powers を利用できる状態になります。

### 3.1 起動コマンド

Windows:

```cmd
setup.bat
```

Linux / Mac / WSL:

```bash
./setup.sh
```

### 3.2 メニューと選択肢

`setup.bat` / `setup.sh` を起動すると、インストール先プラットフォームを選ぶメニューが表示されます。番号と対応プラットフォームは次のとおりです。

| 番号 | プラットフォーム |
|---|---|
| 1 | Kiro IDE / Kiro CLI |
| 2 | Claude Code |
| 3 | GitHub Copilot（CLI + VSCode） |
| 4 | Gemini CLI |
| 5 | Codex |
| 6 | 全部（Windows: `setup.bat`） |
| 0 | キャンセル |

`setup.sh`（Linux/Mac/WSL）では、Copilot が CLI と VSCode の2項目に分かれており、メニュー番号も次のように1つずつずれます。

| 番号 | プラットフォーム（`setup.sh`） |
|---|---|
| 1 | Kiro IDE / Kiro CLI |
| 2 | Claude Code |
| 3 | Copilot CLI |
| 4 | VSCode GitHub Copilot |
| 5 | Gemini CLI |
| 6 | Codex |
| 7 | 全部 |
| 0 | キャンセル |

複数のプラットフォームを併用する場合は、各番号を1つずつ選んで `setup` を繰り返し実行するか、「全部」を選んで一括セットアップしてください。

### 3.3 配置時の確認プロンプト

既に配布物が配置されているディレクトリへ上書きするとき、setup スクリプトは `[y/N]` で上書き可否をユーザーに確認します。`y` を入力すると上書き、それ以外（既定）はスキップとなります。スキップした場合は既存ファイルが保持されます。

## 4. プラットフォーム別の追加手順

メニューでプラットフォームを選択した後、必要に応じて手動の補足作業を実施してください。各プラットフォームで配置先パスと起動メカニズムが異なるため、`docs-dev/01-system-platform/03-platform-bootstrap/` 配下の各プラットフォーム別ファイルを一次情報として、本節の内容と整合させています。

### 4.1 Kiro IDE / Kiro CLI（メニュー番号 1）

`setup.bat` / `setup.sh` の選択肢「1. Kiro IDE / Kiro CLI」を選ぶと、配布物は次のグローバルパスに配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `~/.kiro/skills/` |
| `agents/` | `~/.kiro/agents/` |
| `steering/aide-powers-bootstrap.md` | `~/.kiro/steering/aide-powers-bootstrap.md` |

Kiro IDE と Kiro CLI は同じ `~/.kiro/` を共有するため、選択肢1を1回実行すると両方が同時にセットアップされます。`hooks/` や `instructions/` は Kiro セットアップでは配置しません。

追加の手動作業は不要です。Kiro IDE / Kiro CLI を再起動するとステアリング機構（`.kiro/steering/`）に置かれたブートストラップが会話開始時に自動注入され、ハブスキルへ誘導されます。

### 4.2 Claude Code（メニュー番号 2）

Claude Code には2つのインストール方法があります。

#### プラグインインストール（推奨）

最も確実な方法です。次のコマンドを実行すると、配布物一式が Claude Code のプラグイン領域に展開され、SessionStart hook も自動的に登録されます。

```
claude plugin install <repository-url-or-local-path>
```

`<repository-url-or-local-path>` には Git リポジトリ URL もしくは clone 済みリポジトリのローカルパスを指定します。

#### 手動コピー（`setup.bat` / `setup.sh` の選択肢2）

メニューで「2. Claude Code」を選ぶと、配布物は次のパスに配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `~/.claude/skills/` |
| `agents/` | `~/.claude/agents/` |
| `hooks/` | `~/.claude/hooks/` |

手動コピー方式では、`skills/` と `agents/` は機能しますが、`hooks/` は SessionStart として登録されないため、ハブスキル全文の自動注入は発生しません。setup スクリプト実行時にこの旨が案内メッセージで表示されます。確実な起動を求める場合はプラグインインストールを利用してください。

### 4.3 GitHub Copilot（CLI + VSCode）（メニュー番号 3）

`setup.bat` の選択肢「3. GitHub Copilot（CLI + VSCode）」では、CLI 用と VSCode 用が一括でセットアップされます（`setup.sh` では選択肢が「3. Copilot CLI」「4. VSCode GitHub Copilot」に分かれています）。

#### ⚠️ 必須設定：ネストサブエージェントの有効化

aide-powers はオーケストレータ → サブエージェント → さらにサブエージェントというネスト呼び出しを使用します。VSCode のデフォルトではサブエージェントのネスト呼び出しが無効になっているため、以下の設定を **必ず有効にしてください**。

VSCode の `settings.json` に以下を追加します:

```json
{
  "chat.subagents.allowInvocationsFromSubagents": true
}
```

この設定が `false`（デフォルト）のままだと、aide-powers のワークフローが正常に動作しません。

#### Copilot CLI 側の配置先

| 配布物 | 配置先 |
|---|---|
| `skills/` | `~/.copilot/skills/` |
| `agents/` | `~/.copilot/agents/` |
| `hooks/` | `~/.copilot/hooks/` |
| `instructions/aide-powers.instructions.md` | `~/.copilot/instructions/aide-powers.instructions.md` |

#### VSCode Copilot 側の配置先（Windows）

| 配布物 | 配置先 |
|---|---|
| `instructions/aide-powers.instructions.md` | `%APPDATA%\Code\User\prompts\aide-powers.instructions.md` |
| `.claude-plugin/` / `hooks/` / `skills/` / `agents/` | `%APPDATA%\Code\agentPlugins\aide-powers\` 配下 |

#### `settings.json` の編集

setup スクリプトは VSCode の `settings.json` を自動編集します。既存設定は破壊せず、必要なキーだけを追加・更新します。

- Windows: `chat.pluginLocations` に `agentPlugins\aide-powers` を登録し、`chat.plugins.enabled` を `true` に設定
- Linux / Mac: `chat.hookFilesLocations` に `~/.copilot/hooks` を追加

VSCode 用 `settings.json` の場所は次のとおりです。

| OS | パス |
|---|---|
| Windows | `%APPDATA%\Code\User\settings.json` |
| macOS | `~/Library/Application Support/Code/User/settings.json` |
| Linux | `~/.config/Code/User/settings.json` |

setup スクリプトは Windows では PowerShell で JSON を編集し、Linux/Mac では `sed` で編集します。`settings.json` が存在しない場合は警告メッセージが表示されます（VSCode 未インストールの可能性があります）。

### 4.4 Gemini CLI（メニュー番号 4）

Gemini CLI は他プラットフォームと異なり、ファイルコピーではなく **エクステンション機構** で aide-powers を取り込みます。`setup.bat` / `setup.sh` の選択肢「4. Gemini CLI」（`setup.sh` では選択肢「5」）を選ぶと、実コピーは行われず、次のコマンドの案内のみが表示されます。

```
cd <aide-powers リポジトリのパス>
gemini extensions link .
```

clone 済みリポジトリのルートで `gemini extensions link .` を手動実行すると、Gemini CLI のエクステンション登録領域にシンボリックリンクが作られ、以降のセッションで自動的に有効化されます。

リモートインストール（リポジトリ URL からの取り込み）を行う場合は次のコマンドを使います。

```
gemini extensions install <repository-url>
```

### 4.5 Codex（メニュー番号 5）

`setup.bat` / `setup.sh` の選択肢「5. Codex」（`setup.sh` では選択肢「6」）を選ぶと、配布物は次のグローバルパスに配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `~/.agents/skills/aide-powers/` |
| `agents/` | `~/.agents/agents/aide-powers/` |

Codex は `~/.agents/skills/` 配下のスキルをネイティブに発見・実行する仕様のため、配置完了後はそのまま `using-aide-powers` を含む各スキルが利用可能になります。プロジェクトルートの `AGENTS.md` 経由でハブスキルへ誘導されます。

### 4.6 Cursor / OpenCode について

`setup.bat` / `setup.sh` の主メニューには Cursor / OpenCode の独立した選択肢はありません。

- **Cursor**: Claude Code と互換の SessionStart hook 機構を持つため、Claude Code 用にプラグインインストール（4.2 節）を行うと配布物を共用できます。ルールファイルは Cursor 独自の `.cursor/rules/` 配下を利用します。
- **OpenCode**: プロジェクトルートの `AGENTS.md` を経由して動作します。`setup-local.bat` / `setup-local.sh` の Kiro IDE オプションを実行すると、副作用としてプロジェクトルートに `AGENTS.md` が配置され、OpenCode から利用可能な状態になります。

## 5. ローカルインストール（チーム共有用）

aide-powers をプロジェクトリポジトリに直接組み込み、リポジトリ経由でチーム全員に配布する形態を **ローカルインストール** と呼びます。グローバルインストールと併用も可能です。

### 5.1 起動コマンド

Windows:

```cmd
setup-local.bat <プロジェクトのパス>
```

Linux / Mac / WSL:

```bash
./setup-local.sh <プロジェクトのパス>
```

`<プロジェクトのパス>` を省略するとカレントディレクトリが対象になります。

### 5.2 メニューと選択肢

`setup-local.bat` / `setup-local.sh` のメニュー番号と対応構成は次のとおりです。

| 番号 | プラットフォーム |
|---|---|
| 1 | Kiro IDE（`.kiro/skills/` + `.kiro/agents/` + `.kiro/steering/`、加えて `AGENTS.md` を配置） |
| 2 | Claude Code（`.claude-plugin/` 形式） |
| 3 | VSCode Copilot（`.github/skills/` 形式） |
| 4 | 全部 |
| 0 | キャンセル |

### 5.3 配置先

選択肢1（Kiro IDE）を選ぶと、`<プロジェクトのパス>` 配下に次が配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `{project}/.kiro/skills/` |
| `agents/` | `{project}/.kiro/agents/` |
| `steering/` | `{project}/.kiro/steering/` |
| `AGENTS.md` | `{project}/AGENTS.md`（既存があれば上書き確認） |

選択肢2（Claude Code）を選ぶと、次が配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `{project}/skills/` |
| `agents/` | `{project}/agents/` |
| `hooks/` | `{project}/hooks/` |
| `.claude-plugin/` | `{project}/.claude-plugin/` |

選択肢3（VSCode Copilot）を選ぶと、次が配置されます。

| 配布物 | 配置先 |
|---|---|
| `skills/` | `{project}/.github/skills/` |
| `hooks/` | `{project}/.github/hooks/` |

ローカルインストール後、配置されたディレクトリ・ファイルをリポジトリにコミットすれば、チームメンバーは clone するだけで aide-powers が組み込まれた状態になります。

## 6. インストール確認

各プラットフォームで「aide-powers がうまくインストールできているか」を判断する基準を以下に示します。問題が起きた場合は本節の内容で切り分け、解決方法は `docs/05-troubleshooting.md` を参照してください。

### 6.1 共通の確認ポイント

プラットフォームを再起動してから、以下の発話のいずれかで会話を開始します。

```
TODO アプリを作りたい
```

aide-powers がインストールされていれば、AI Agent はハブスキル `using-aide-powers` の指示に従い、企画ワークフローのエントリポイント（`fs-planning-phase1-intake-and-init`）を起動するか、ワークフロー選択肢を番号付きで提示します。

「インストールできている」と判断できる主な兆候は次のとおりです。

- AI Agent が「企画ワークフローを起動します」「設計ワークフローを起動します」のようにワークフロー名に言及する
- AI Agent が番号付き選択肢でユーザーに次の行動を確認する
- AI Agent が直ちにコード生成を始めず、要件のヒアリングや計画段階に入る

逆に、AI Agent が前提確認なくいきなりコードを書き始めた場合は、ハブスキルが正しく注入されていない可能性があります。

### 6.2 プラットフォーム別の確認ポイント

| プラットフォーム | 確認ポイント |
|---|---|
| Kiro IDE / Kiro CLI | `~/.kiro/steering/aide-powers-bootstrap.md` が存在し、`~/.kiro/skills/using-aide-powers/SKILL.md` が読み込める |
| Claude Code（プラグイン） | `claude plugin list` 等で aide-powers がプラグイン一覧に表示される。SessionStart で `<EXTREMELY_IMPORTANT>` を含むコンテキストが注入される |
| Claude Code（手動コピー） | `~/.claude/skills/using-aide-powers/SKILL.md` が存在する。Skill ツールで `using-aide-powers` を呼び出せる |
| Copilot CLI | `~/.copilot/instructions/aide-powers.instructions.md` が読み込まれ、`~/.copilot/skills/using-aide-powers/` が自動発見される |
| VSCode Copilot | `settings.json` に `chat.pluginLocations` と `chat.plugins.enabled: true` が設定され、エージェントプラグインとして aide-powers が認識される |
| Gemini CLI | `gemini extensions link .` 完了後、`GEMINI.md` の `@import` でハブスキル本文が会話冒頭にインクルードされる |
| Codex | `~/.agents/skills/aide-powers/using-aide-powers/SKILL.md` が読み込め、`AGENTS.md` 経由でグローバルルールが注入される |

## 7. APM（Agent Package Manager）経由のセットアップ

[APM](https://microsoft.github.io/apm/)（Agent Package Manager）CLI を使うと、プロジェクトの依存パッケージとして aide-powers を管理できます。プラットフォームによっては `apm install` だけでセットアップが完了します。ギャップがあるプラットフォームのみ追加の `setup-local` 実行が必要です。

### 7.1 APM CLI のインストール

#### Windows（PowerShell）

```powershell
irm https://apm.ms/install.ps1 | iex
```

#### Linux / WSL Ubuntu

```bash
curl -fsSL https://apm.ms/install.sh | bash
```

インストール後、`apm --version` でバージョンが表示されれば準備完了です。

### 7.2 aide-powers のインストール

プロジェクトルート（aide-powers を利用したいディレクトリ）で実行します。
利用するプラットフォームに応じて `--target` を指定してください。

| ターゲット | プラットフォーム | `apm install` のみで完結 |
|---|---|---|
| `kiro` | Kiro IDE / Kiro CLI | ❌（setup-local 要） |
| `claude` | Claude Code | ✅ |
| `copilot` | GitHub Copilot（CLI + VSCode） | ✅ |
| `codex` | Codex | ❌（setup-local 要） |
| `gemini` | Gemini CLI | ❌（手動コマンド要） |

```cmd
apm install --target kiro https://10.110.47.117/kc-apm/kc-aide-powers
```

> `kiro` の部分を上記表のターゲット名に置き換えてください。

> **前提:** 自己署名証明書を使用しているため、事前に以下の設定が必要です。
> ```cmd
> git config --global http."https://10.110.47.117/".sslVerify false
> ```

`apm_modules/kc-apm/kc-aide-powers/` にリポジトリがクローンされ、skills が自動配置されます。

### 7.3 セットアップ実行（ギャップ補完）

上記表で「`apm install` のみで完結」が ✅ のプラットフォーム（Claude Code, Copilot）はこの手順は不要です。`apm install --target {target}` だけでセットアップ完了です。

❌ のプラットフォームは、APM が配置できないファイルを補完するため、プロジェクトの `apm.yml` に scripts を追記して `apm run` で実行してください。

**手順1: apm.yml に scripts を追記**

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

### 7.4 更新

aide-powers の新バージョンがリリースされた場合:

```cmd
apm update aide-powers
```

> Claude Code / Copilot は `apm update` だけで更新完了です。

ギャップ補完が必要なプラットフォーム（Kiro, Codex, Gemini）のみ、§7.3「セットアップ実行」と同じ `apm run` コマンドを再実行してください。

### 7.5 アンインストール

```cmd
apm uninstall aide-powers
```

> **注意:** `apm uninstall` は `apm_modules/aide-powers/` を除去しますが、`setup-local` で配置済みのファイル（`.kiro/skills/`、`.kiro/agents/`、`.kiro/steering/` 等）は APM のロックファイルに記録されていないため自動削除されません。配置済みファイルを除去したい場合は手動で削除してください。

## 8. トラブル時の参照先

インストールがうまくいかない、起動確認が成立しない場合は、次のドキュメントを参照してください。

- `docs/05-troubleshooting.md` — 利用者向けのトラブルシューティングと解決策
- `docs-dev/01-system-platform/03-platform-bootstrap/` 配下の各プラットフォーム別ファイル — 起動メカニズム・配置先パス・特殊事項の一次情報
  - `kiro.md`
  - `claude-code.md`
  - `copilot.md`
  - `cursor.md`
  - `opencode.md`
  - `gemini.md`
  - `codex.md`

## 9. 次のステップ

aide-powers のインストールと起動確認が完了したら、次のドキュメントへ進んでください。

- `docs/03-usage.md` — aide-powers の基本的な使い方（ワークフローの選び方、AI Agent への話しかけ方、フェーズの進め方）

実際の開発タスク（企画、設計、実装、変更、バグ修正、リファクタリング、設計逆引き）の流れは、ハブスキル `using-aide-powers` が会話の起点として案内します。発話に応じて自動的に適切なワークフローが選択されるため、インストール後は普段どおりお使いください。
