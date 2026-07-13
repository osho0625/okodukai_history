# 差分設計書

## 変更概要

APM（Agent Package Manager）の targets メカニズムを活用し、`apm install --target {target}` による aide-powers のインストールを5プラットフォーム（Kiro, Claude Code, Copilot, Codex, Gemini）に拡張する。APM が自動配置できる primitives（skills, instructions, hooks）を `targets` セクションで宣言し、APM だけでは配置できないもの（Kiro の agents/steering 等）は `setup-local` で補完する設計。Cursor/OpenCode/Windsurf はブートストラップ設計が未整備のため今回対象外。

---

## 1. APM ターゲット別ギャップ分析結果

APM targets matrix（https://microsoft.github.io/apm/reference/targets-matrix/）の調査結果に基づく。

### 1.1 APM が配置できる primitives（compatibility matrix より）

| primitive | copilot | claude | codex | gemini | kiro |
|---|---|---|---|---|---|
| instructions | native | native | compiled | compiled | native |
| agents | native | native | compiled | unsupported | unsupported |
| skills | native | native | native | native | native |
| hooks | native | native | native | native | native |

### 1.2 aide-powers が各プラットフォームで必要とするもの（program-structure.md 配布マッピング表より）

| プラットフォーム | skills | agents | instructions/rules | hooks | その他 |
|---|---|---|---|---|---|
| Kiro IDE/CLI | ✅ | ✅（kiro/専用形式） | ✅（steering） | — | — |
| Claude Code | ✅ | ✅ | ✅（rules） | ✅ | .claude-plugin |
| Copilot | ✅ | ✅ | ✅（instructions） | ✅ | — |
| Codex | ✅ | ✅ | — | — | AGENTS.md |
| Gemini CLI | ✅ | ✅ | — | — | gemini-extension.json, GEMINI.md |

### 1.3 ギャップ判定

| プラットフォーム | `apm install` で配置可能 | ギャップ（追加手順要） | 判定 |
|---|---|---|---|
| **Kiro** | skills, instructions(steering) | agents（Kiro専用JSON+MD形式、APM agents primitiveはunsupported） | **要 setup-local** |
| **Claude Code** | skills, instructions(rules), agents, hooks | なし（.claude-plugin は機能的に不要） | **`apm install` のみで完結** |
| **Copilot** | skills, instructions, agents, hooks | — | **`apm install` のみで完結** |
| **Codex** | skills | agents（compiled→AGENTS.md）、hooks なし | **要 setup-local**（AGENTS.md 相当のグローバルルール配置） |
| **Gemini** | skills | agents unsupported、GEMINI.md + extension.json は APM 管轄外 | **要 setup-local**（`gemini extensions link` 手順案内） |

> **対象外:** Cursor/OpenCode/Windsurf はブートストラップ設計が未整備のため今回対象外。整備完了時に追加する。

---

## 2. apm.yml の差分設計

### 2.1 targets セクションの新設

**変更理由**: 現行 apm.yml には `targets` セクションがなく、APM は auto-detection（プロジェクト内の `.kiro/` 等のディレクトリ存在）に依存する。明示的に `targets` を宣言することで、`apm install` 時にユーザーが `--target` で指定したプラットフォーム向けに primitives が正しくコンパイル・配置される。また、`scripts` セクションは削除する。APM の scripts は消費者には露出されず（実機検証済み）、直接 clone ユーザーは `setup-local.bat` を直接実行すればよい。APM 経由の消費者向けには README で `apm.yml` への scripts 追記手順を案内する（§6.4 参照）。

#### before

```yaml
name: aide-powers
version: 1.0.0
description: AI Agent document-driven development framework
author: KC Developer Team
repository: http://10.110.47.117/takashi/aide-powers
license: Kyocera-Internal-Only
keywords:
  - ai-agent
  - document-driven-development
  - aide
  - kiro
  - claude-code
  - copilot

scripts:
  # Windows (cmd) — apm run は cmd.exe で実行される
  setup-kiro-win: "setup-local.bat . 1"
  setup-claude-win: "setup-local.bat . 2"
  setup-copilot-win: "setup-local.bat . 3"
  setup-all-win: "setup-local.bat . 4"
  # Linux / WSL (bash) — apm run は bash で実行される
  setup-kiro-linux: "./setup-local.sh . 1"
  setup-claude-linux: "./setup-local.sh . 2"
  setup-copilot-linux: "./setup-local.sh . 3"
  setup-all-linux: "./setup-local.sh . 4"
```

#### after

```yaml
name: aide-powers
version: 1.0.0
description: AI Agent document-driven development framework
author: KC Developer Team
repository: http://10.110.47.117/takashi/aide-powers
license: Kyocera-Internal-Only
keywords:
  - ai-agent
  - document-driven-development
  - aide
  - kiro
  - claude-code
  - copilot
  - codex
  - gemini

targets:
  - kiro
  - claude
  - copilot
  - codex
  - gemini
```


### 2.2 .apm/ ディレクトリについて

**結論: .apm/ ディレクトリの新設は不要。**

APM は `.apm/` だけでなく、パッケージ内の既存ディレクトリ構造を自動認識する（Package Anatomy ドキュメントより）:
- `skills/<name>/SKILL.md` → スキルとして自動発見
- `agents/*.md` → エージェントとして自動発見（APM が対応するターゲットに配置）
- `hooks/*.json` → フックとして自動発見
- `steering/*.md` / `instructions/*.md` → 指示として自動発見

aide-powers は既にこの構造を持っているため、`targets:` セクションを宣言するだけで APM が自動的に適切なターゲットに配置する。

---

## 3. setup-local.bat の差分設計

### 3.1 メニュー構成の維持

**結論: setup-local.bat/sh のメニュー構成は変更しない。** 既存の4択（1:Kiro, 2:Claude, 3:Copilot, 4:全部, 0:キャンセル）をそのまま維持する。

setup-local は APM 専用スクリプトではなく、APM を使わない直接 clone + setup-local 実行のフローでも利用される。メニュー項目の削除や番号変更はユーザーの混乱を招くため行わない。

ただし各メニューの内部処理で、APM が配置済みの primitives（skills 等）のコピーを省略する修正を加える（§3.2 以降）。

### 3.2 非対話モード終了処理の修正

**変更理由**: `apm run` 経由で実行した場合、`endlocal` の後にバッチファイルが明示的に終了しないため、後続行がコマンドとして解釈され exit code 255 で異常終了する。`endlocal` の後に `exit /b 0` を追加して明示的にバッチファイルを終了させる。実機検証で確認済み（`apm run setup-kiro-win` で本現象が発生）。

#### before

```bat
:done
echo.
echo === ローカルセットアップ完了 ===
echo プロジェクト %TARGET_DIR% にローカル設定を配布しました。
echo リポジトリにコミットすればチームで共有できます。
goto :end

:end
if not "!NON_INTERACTIVE!" == "1" pause
endlocal
```

#### after

```bat
:done
echo.
echo === ローカルセットアップ完了 ===
echo プロジェクト %TARGET_DIR% にローカル設定を配布しました。
echo リポジトリにコミットすればチームで共有できます。
goto :end

:end
if not "!NON_INTERACTIVE!" == "1" pause
endlocal
exit /b 0
```

### 3.3 Codex / Gemini のローカル配置について

**結論: Codex と Gemini は setup-local に追加しない。**

Codex と Gemini はワークスペースローカル設定に非対応であり、グローバル配置（`~/` 配下）が必要。グローバル配置は setup.bat/sh が既に対応している（メニュー5番: Gemini CLI、6番: Codex）。

APM 経由の場合も、`apm install` が配置するのはワークスペースローカルの primitives のみ。Codex/Gemini 向けのグローバルファイル（`~/.agents/`, `~/.gemini/`等）は APM の管轄外であり、引き続き setup.bat で対応する。

### 3.4 Copilot / Claude Code の配置ロジック

**結論: 変更不要。** 

APM 経由の場合これらのプラットフォームは `apm install` のみで完結するが、setup-local は APM を使わないフローでも利用される。既存の配置ロジックを維持する。

---

## 4. setup-local.sh の差分設計

### 4.1 メニュー構成・配置ロジック

**結論: setup-local.sh は bat と同様、メニュー構成・配置ロジックとも変更不要。**

### 4.2 非対話モード終了処理の修正

bat と同期。非対話モード（第2引数あり）の終了時に明示的に `exit 0` する。

#### before

```bash
echo ""
echo "=== ローカルセットアップ完了 ==="
echo ""
echo "プロジェクト $TARGET_DIR にローカル設定を配置しました。"
echo "リポジトリにコミットすればチームで共有できます。"
```

#### after

```bash
echo ""
echo "=== ローカルセットアップ完了 ==="
echo ""
echo "プロジェクト $TARGET_DIR にローカル設定を配置しました。"
echo "リポジトリにコミットすればチームで共有できます。"
exit 0
```

---

## 5. setup.bat / setup.sh の差分設計

**変更理由**: setup.bat/sh にも引数対応（非対話モード）を追加する。`apm run` 経由や自動化スクリプトからプラットフォーム番号を引数で渡し、メニュー選択をスキップして直接実行できるようにする。setup-local.bat と同様の仕組み。

> **注:** setup.bat/sh のメニュー項目（Cursor 含む既存7/8択）は変更しない。引数対応（非対話モード）の追加のみ行う。Cursor はグローバルインストール経路では引き続きサポートするが、APM targets には含めない（ブートストラップ設計未整備のため）。

### 5.1 引数対応の追加

#### before（メニュー選択部分）

```bat
echo.
echo aide-powers セットアップ
echo ========================
echo コピー元: %SCRIPT_DIR%
echo.
echo インストール先を選択してください:
echo   1. Kiro IDE / Kiro CLI
echo   2. Claude Code
echo   3. Cursor
echo   4. GitHub Copilot (CLI + VSCode)
echo   5. Gemini CLI
echo   6. Codex
echo   7. 全部
echo   0. キャンセル
echo.
set /p "CHOICE=選択 [0-7]: "
```

#### after（引数対応追加）

```bat
echo.
echo aide-powers セットアップ
echo ========================
echo コピー元: %SCRIPT_DIR%
echo.

REM 第1引数が指定されている場合は非対話モード（メニューをスキップ）
if not "%~1" == "" (
    set "CHOICE=%~1"
    set "NON_INTERACTIVE=1"
    goto :dispatch
)

echo インストール先を選択してください:
echo   1. Kiro IDE / Kiro CLI
echo   2. Claude Code
echo   3. Cursor
echo   4. GitHub Copilot (CLI + VSCode)
echo   5. Gemini CLI
echo   6. Codex
echo   7. 全部
echo   0. キャンセル
echo.
set /p "CHOICE=選択 [0-7]: "

:dispatch
```

### 5.2 非対話モード終了処理

setup-local.bat と同様に、非対話モードでは `exit /b 0` で正常終了する。

#### after（終了部分に追加）

```bat
:end
if defined NON_INTERACTIVE (
    exit /b 0
)
pause
```

### 5.3 setup.sh の対応（同様）

#### before

```bash
echo "インストール先を選択してください:"
echo "  1. Kiro IDE / Kiro CLI"
echo "  2. Claude Code"
echo "  3. Cursor"
echo "  4. Copilot CLI"
echo "  5. VSCode GitHub Copilot"
echo "  6. Gemini CLI"
echo "  7. Codex"
echo "  8. 全部"
echo "  0. キャンセル"
echo ""
printf "選択 [0-8]: "
read -r choice
```

#### after

```bash
# 第1引数が指定されている場合は非対話モード
if [ -n "$1" ]; then
    choice="$1"
    NON_INTERACTIVE=1
else
    echo "インストール先を選択してください:"
    echo "  1. Kiro IDE / Kiro CLI"
    echo "  2. Claude Code"
    echo "  3. Cursor"
    echo "  4. Copilot CLI"
    echo "  5. VSCode GitHub Copilot"
    echo "  6. Gemini CLI"
    echo "  7. Codex"
    echo "  8. 全部"
    echo "  0. キャンセル"
    echo ""
    printf "選択 [0-8]: "
    read -r choice
fi
```

終了部分：

```bash
if [ -z "$NON_INTERACTIVE" ]; then
    echo "何かキーを押してください..."
    read -n 1
fi
exit 0
```

---

## 6. README.md APM セクションの差分設計

**変更理由**: 全8プラットフォームのターゲット表への拡張、APM 公式 URL の追加、プラットフォームごとの完結可否の明記（AC-009〜AC-013）。

### 6.1 APM セクション冒頭

#### before

```markdown
## APM（Agent Package Manager）経由のセットアップ

APM を使うと、プロジェクトの依存として aide-powers を管理できます。
```

#### after

```markdown
## APM（Agent Package Manager）経由のセットアップ

[APM](https://microsoft.github.io/apm/)（Agent Package Manager）を使うと、プロジェクトの依存として aide-powers を管理できます。
```

### 6.2 ターゲット表

#### before

```markdown
| ターゲット | プラットフォーム |
|---|---|
| `kiro` | Kiro IDE / Kiro CLI |
| `claude` | Claude Code |
| `copilot` | VSCode Copilot |
```

#### after

```markdown
| ターゲット | プラットフォーム | `apm install` のみで完結 |
|---|---|---|
| `kiro` | Kiro IDE / Kiro CLI | ❌（setup-local で agents/steering を追加配置） |
| `claude` | Claude Code | ✅ |
| `copilot` | GitHub Copilot（CLI + VSCode） | ✅ |
| `codex` | Codex | ❌（setup-local で AGENTS.md を追加配置） |
| `gemini` | Gemini CLI | ❌（`gemini extensions link .` が別途必要） |
```

### 6.3 インストールコマンド例

#### before

```markdown
```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers
```

> `kiro` の部分を上記表のターゲット名に置き換えてください。
```

#### after

```markdown
```cmd
apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers
```

> `kiro` の部分を上記表のターゲット名に置き換えてください。
> `apm install` のみで完結するプラットフォーム（Claude Code, Copilot）は、これだけでセットアップ完了です。
```

### 6.4 セットアップ実行セクション

#### before

```markdown
### セットアップ実行

`apm install` は skills のみ配置します。agents / steering 等の追加ファイルを配置するため、以下の setup-local を実行してください。

利用するプラットフォームの番号を指定して **1つだけ** 実行します。

| 番号 | プラットフォーム |
|---|---|
| 1 | Kiro IDE |
| 2 | Claude Code |
| 3 | VSCode Copilot |
| 4 | 全プラットフォーム一括 |
```

#### after

```markdown
### セットアップ実行（ギャップ補完が必要なプラットフォームのみ）

上記表で「`apm install` のみで完結」が ✅ のプラットフォーム（Claude Code, Copilot）は追加手順不要です。

❌ のプラットフォームは、APM が配置できないファイルを補完するため、以下の手順で `apm run` を使えるようにしてください。

**手順1: apm.yml に scripts を追記**

プロジェクトの `apm.yml` に以下を追記してください（お使いのプラットフォームに対応する行のみ）：

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/takashi/aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\takashi\\aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/takashi/aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\takashi\\aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/takashi/aide-powers/setup.sh 6"
```

**手順2: apm run で実行**

| コマンド | プラットフォーム | 補完内容 |
|---|---|---|
| `apm run setup-kiro-win` | Kiro IDE (Windows) | agents + steering |
| `apm run setup-kiro-linux` | Kiro IDE (Linux/Mac) | agents + steering |
| `apm run setup-global-codex-win` | Codex (Windows) | グローバル配置 |
| `apm run setup-global-gemini-win` | Gemini CLI (Windows) | グローバル配置 |

> **`apm update` 後も同じコマンドで最新ファイルに更新できます。**
```

### 6.5 更新セクション

**変更理由**: §6.4 でセットアップ実行をギャップ補完方式に変更したことに伴い、「更新」セクションの手順も整合させる。旧来の `setup-local.bat . 1` 直接実行例を削除し、ギャップ補完方式に統一する。

#### before

```markdown
### 更新

```cmd
apm update aide-powers
```

その後、セットアップを再実行します。

```cmd
apm_modules\takashi\aide-powers\setup-local.bat . 1
```

> 番号はプラットフォームに合わせて変更してください。
```

#### after

```markdown
### 更新

```cmd
apm update aide-powers
```

> Claude Code / Copilot は `apm update` だけで更新完了です。

ギャップ補完が必要なプラットフォーム（Kiro, Codex, Gemini）のみ、§「セットアップ実行」と同じ `apm run` コマンドを再実行してください。
```

### 6.6 Windows/Linux コマンド例の更新

**結論: §6.4 に統合したため、従来の直接パス実行例は削除する。**

---

## 7. docs/02-getting-started.md §7 の差分設計

**変更理由**: README と同等の情報を docs にも記載する（AC-012）。

### 7.1 §7 冒頭

#### before

```markdown
## 7. APM（Agent Package Manager）経由のセットアップ

APM CLI を使うと、プロジェクトの依存パッケージとして aide-powers を管理できます。`apm install` → `setup-local` 実行で同等のセットアップが完了します。
```

#### after

```markdown
## 7. APM（Agent Package Manager）経由のセットアップ

[APM](https://microsoft.github.io/apm/)（Agent Package Manager）CLI を使うと、プロジェクトの依存パッケージとして aide-powers を管理できます。プラットフォームによっては `apm install` だけでセットアップが完了します。ギャップがあるプラットフォームのみ追加の `setup-local` 実行が必要です。
```

### 7.2 §7.2 ターゲット表

#### before

```markdown
| ターゲット | プラットフォーム |
|---|---|
| `kiro` | Kiro IDE / Kiro CLI |
| `claude` | Claude Code |
| `copilot` | VSCode Copilot |
```

#### after

```markdown
| ターゲット | プラットフォーム | `apm install` のみで完結 |
|---|---|---|
| `kiro` | Kiro IDE / Kiro CLI | ❌（setup-local 要） |
| `claude` | Claude Code | ✅ |
| `copilot` | GitHub Copilot（CLI + VSCode） | ✅ |
| `codex` | Codex | ❌（setup-local 要） |
| `gemini` | Gemini CLI | ❌（手動コマンド要） |
```

### 7.3 §7.3 セットアップ実行

#### before

```markdown
### 7.3 セットアップ実行

`apm install` は skills のみ配置します。agents / steering 等の追加ファイルを配置するため、以下の setup-local を実行してください。

利用するプラットフォームの番号を指定して **1つだけ** 実行します。

| 番号 | プラットフォーム | 配置先 |
|---|---|---|
| 1 | Kiro IDE | `.kiro/skills/` + `.kiro/agents/` + `.kiro/steering/` |
| 2 | Claude Code | `skills/` + `agents/` + `hooks/` + `.claude-plugin/` |
| 3 | VSCode Copilot | `.github/skills/` + `.github/hooks/` |
| 4 | 全プラットフォーム一括 | 上記すべて |
```

#### after

```markdown
### 7.3 セットアップ実行（ギャップ補完）

上記表で「`apm install` のみで完結」が ✅ のプラットフォーム（Claude Code, Copilot）はこの手順は不要です。`apm install --target {target}` だけでセットアップ完了です。

❌ のプラットフォームは、APM が配置できないファイルを補完するため、プロジェクトの `apm.yml` に scripts を追記して `apm run` で実行してください。

**手順1: apm.yml に scripts を追記**

```yaml
scripts:
  # Kiro IDE（agents/steering 補完）
  setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/takashi/aide-powers/setup-local.sh . 1"
  # Codex（グローバル配置）
  setup-global-codex-win: "apm_modules\\takashi\\aide-powers\\setup.bat 6"
  setup-global-codex-linux: "./apm_modules/takashi/aide-powers/setup.sh 7"
  # Gemini CLI（グローバル配置）
  setup-global-gemini-win: "apm_modules\\takashi\\aide-powers\\setup.bat 5"
  setup-global-gemini-linux: "./apm_modules/takashi/aide-powers/setup.sh 6"
```

**手順2: apm run で実行**

| コマンド | プラットフォーム | 補完内容 |
|---|---|---|
| `apm run setup-kiro-win` | Kiro IDE (Windows) | agents + steering |
| `apm run setup-kiro-linux` | Kiro IDE (Linux/Mac) | agents + steering |
| `apm run setup-global-codex-win` | Codex (Windows) | グローバル配置 |
| `apm run setup-global-gemini-win` | Gemini CLI (Windows) | グローバル配置 |

> **`apm update` 後も同じコマンドで最新ファイルに更新できます。**
```

### 7.4 更新セクション

**変更理由**: §7.3 でセットアップ実行をギャップ補完方式に変更したことに伴い、「更新」セクションの手順も整合させる。旧来の `setup-local.bat . 1` 直接実行例を削除し、ギャップ補完方式に統一する。

#### before

```markdown
### 7.4 更新

aide-powers の新バージョンがリリースされた場合:

```cmd
apm update aide-powers
```

その後、セットアップを再実行します。

```cmd
apm_modules\takashi\aide-powers\setup-local.bat . 1
```

> 番号はプラットフォームに合わせて変更してください。
```

#### after

```markdown
### 7.4 更新

aide-powers の新バージョンがリリースされた場合:

```cmd
apm update aide-powers
```

> Claude Code / Copilot は `apm update` だけで更新完了です。

ギャップ補完が必要なプラットフォーム（Kiro, Codex, Gemini）のみ、§7.3「セットアップ実行」と同じ `apm run` コマンドを再実行してください。
```

---

## 8. .apm/instructions/ について

**結論: .apm/instructions/ の新規作成は不要。**

APM は既存の `steering/aide-powers-bootstrap.md` を自動発見し、ターゲットに応じて適切な形式で配置する:
- kiro → `.kiro/steering/aide-powers-bootstrap.md`
- claude → `.claude/rules/aide-powers-bootstrap.md`
- cursor → `.cursor/rules/aide-powers-bootstrap.mdc`
- copilot → `.github/instructions/aide-powers-bootstrap.instructions.md`
- windsurf → `.windsurf/rules/aide-powers-bootstrap.md`
- codex/opencode → compiled（AGENTS.md に統合）

---

## 9. 設計上の判断事項まとめ

| 判断 | 根拠 |
|---|---|
| `.apm/` ディレクトリは不要 | APM はパッケージ内の既存ディレクトリ（skills/, agents/, hooks/, steering/）を自動発見する。`targets:` 宣言のみで配置される |
| setup-local のメニューは変更しない | APM 専用ではなく、直接 clone フローでも使用される。メニュー番号の変更はユーザーの混乱を招く |
| Codex/Gemini は setup-local に追加しない | ワークスペースローカル設定に非対応。グローバル配置は setup.bat が既に対応済み |
| Kiro の agents は setup-local で残す | APM の kiro ターゲットは agents primitive が unsupported。Kiro 専用形式（JSON+MD）は APM が扱えない |
| Claude Code は `apm install` のみで完結 | .claude-plugin はメタデータのみで機能的に不要。APM が skills/agents/rules/hooks を全て配置するため補完不要 |
| setup.bat/sh に引数対応（非対話モード）追加 | `apm run` 経由でグローバルインストールを自動化するため。Codex/Gemini はローカル非対応でグローバル配置が必要 |
| apm.yml scripts セクションは削除 | 消費者には露出されない（実機検証済み）。直接 clone は bat 直接実行で十分。消費者向けは README で apm.yml scripts 追記 + `apm run` 実行を案内 |
| targets は 5PF に限定（kiro, claude, copilot, codex, gemini） | Cursor/OpenCode/Windsurf は aide-powers のブートストラップ設計が未整備。対応時に追加する |

---

## 10. ファイル変更一覧

| # | ファイル | 種別 | 概要 |
|---|---|---|---|
| 1 | `apm.yml` | 変更 | targets セクション新設、scripts 削除、keywords 拡張 |
| 2 | `setup-local.bat` | 変更 | 非対話モード終了処理の修正（`exit /b 0` 追加） |
| 3 | `setup-local.sh` | 変更 | 非対話モード終了処理の修正（`exit 0` 追加） |
| 4 | `README.md` | 変更 | APM セクションのターゲット表拡張・完結可否明記・APM URL 追加 |
| 5 | `docs/02-getting-started.md` | 変更 | §7.2 ターゲット表拡張、§7.3 セットアップ手順再構成 |
| 6 | `setup.bat` | 変更 | 引数対応（非対話モード）追加 |
| 7 | `setup.sh` | 変更 | 引数対応（非対話モード）追加 |

---

## 11. 更新が必要な設計資料

| # | 設計資料 | 更新箇所 | 更新内容 | 更新タイミング |
|---|---|---|---|---|
| 1 | `program-structure.md` | 「設定ファイルの概要」セクション apm.yml 行 | 「メタデータ（name, version, description, author）と OS別×プラットフォーム別 scripts を定義」→「メタデータ（name, version, description, author, keywords）と targets セクション（APM 配置対象プラットフォーム宣言）を定義」に更新 | 実装後（Step 13 設計書反映で実施） |

---

*Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support/*
