# 差分設計書

## 設計方針
- references コピーと rules-distribute の global モード配布を、AI の Read→Write 方式からシェルコマンド（`Copy-Item` / `cp`）方式に変更する
- AI がファイル内容をコンテキストに展開する必要をなくし、コンテキスト消費と実行時間を削減する
- version.json の比較ロジック、フラグファイルプロトコル、スキル間インターフェースは一切変更しない
- Windows（PowerShell）と Linux/Mac（bash）の両方のコマンドを併記し、クロスプラットフォーム対応を維持する
- skill モード（deploy / cleanup）の記述は一切変更しない

## 修正対象の差分設計

### 変更対象1: skills/using-aide-powers/SKILL.md — 起動手順2「references 配置」

#### before

```markdown
**2. references 配置（version 比較による更新チェック）**

`.aide/references/` に以下のファイルが全て揃っているか確認する:
`version.json`, `global-rules.md`, `phase-skill-rules.md`, `progress-file-format.md`, `kiro-ide-tools.md`, `kiro-cli-tools.md`, `copilot-tools.md`, `vscode-copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`

正本は `skills/using-aide-powers/references/`（インストール環境では `~/.kiro/skills/using-aide-powers/references/` 等）。
不足があれば正本から全ファイルをコピーする。

さらに、references 一式の鮮度を version.json の単一 version で判定する:

1. 正本 `skills/using-aide-powers/references/version.json` と `.aide/references/version.json` を Read で読み、トップレベルの `version`（整数）を比較する
2. **正本の version > .aide側の version / .aide側に version.json が無い / .aide側に version フィールドが無い** のいずれかに該当 → `.aide/references/` 配下を正本からごっそり置き換える（version.json を含む全 references ファイルを上書きコピー）。置き換え後、空のフラグファイル `.aide/references/.rules-updated` を作成する（次の手順3で rules-distribute が配布対象を検知するシグナル）
3. **version が一致** → 何もしない（`.aide/references/.rules-updated` も作らない）

「`.aide/references/` にファイルがあるから最新だ」と判断することを禁止する。必ず version.json の version 同士を突き合わせること。
version の手動更新を忘れるとここで差分が検知されず配布されないため、references 配下のいずれかのファイルを編集したら version.json の version 更新を必ずセットで行うこと（正本 version.json 冒頭の注意書きを参照）。
```

#### after

```markdown
**2. references 配置（version 比較による更新チェック）**

`.aide/references/` に以下のファイルが全て揃っているか確認する:
`version.json`, `global-rules.md`, `phase-skill-rules.md`, `progress-file-format.md`, `kiro-ide-tools.md`, `kiro-cli-tools.md`, `copilot-tools.md`, `vscode-copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`

正本は `skills/using-aide-powers/references/`（インストール環境では `~/.kiro/skills/using-aide-powers/references/` 等）。

references 一式の鮮度を version.json の単一 version で判定する:

1. 正本 `skills/using-aide-powers/references/version.json` と `.aide/references/version.json` を Read で読み、トップレベルの `version`（整数）を比較する
2. **正本の version > .aide側の version / .aide側に version.json が無い / .aide側に version フィールドが無い / `.aide/references/` にファイル不足がある** のいずれかに該当 → 以下のシェルコマンドで正本から `.aide/references/` へ全ファイルを一括コピーする:

**Windows（PowerShell）:**
```powershell
# 正本パスを特定（グローバルインストール先）
$sourcePath = "~/.kiro/skills/using-aide-powers/references"

# .aide/references/ ディレクトリがなければ作成
New-Item -ItemType Directory -Path ".aide/references" -Force | Out-Null

# 全ファイルを一括コピー（上書き）
Copy-Item -Path "$sourcePath/*" -Destination ".aide/references/" -Force

# フラグファイルを作成
New-Item -ItemType File -Path ".aide/references/.rules-updated" -Force | Out-Null
```

**Linux/Mac（bash）:**
```bash
# 正本パスを特定（グローバルインストール先）
SOURCE_PATH="$HOME/.kiro/skills/using-aide-powers/references"

# .aide/references/ ディレクトリがなければ作成
mkdir -p .aide/references

# 全ファイルを一括コピー（上書き）
cp -f "$SOURCE_PATH"/* .aide/references/

# フラグファイルを作成
touch .aide/references/.rules-updated
```

3. **version が一致、かつファイルが全て揃っている** → 何もしない（`.aide/references/.rules-updated` も作らない）

**⚠️ AI はコピー対象ファイルの内容を Read/Write してはならない。** version.json の読み込み（比較用の小さな JSON）を除き、ファイル内容のコンテキスト展開は不要。シェルコマンドのみで完結すること。

「`.aide/references/` にファイルがあるから最新だ」と判断することを禁止する。必ず version.json の version 同士を突き合わせること。
version の手動更新を忘れるとここで差分が検知されず配布されないため、references 配下のいずれかのファイルを編集したら version.json の version 更新を必ずセットで行うこと（正本 version.json 冒頭の注意書きを参照）。
```

#### 変更理由
- 10ファイルの全文を AI コンテキストに展開する Read→Write 方式を廃止し、シェルコマンド1回で完結させることで、コンテキスト消費をほぼゼロにする
- 数ターンかかっていた処理が1回のシェルコマンド実行で完了するため、実行時間も大幅に短縮される
- version.json の比較ロジック（Read で小さな JSON を読んで比較）は現行通り維持する（比較のための Read は軽量で問題なし）

---

### 変更対象2: skills/rules-distribute/SKILL.md — ステップ2 global モード「入力ソース」および「差分検知＆置き換え処理」

#### before

```markdown
### 入力ソース

using-aide-powers (aide-powers skill) のルール群。`.aide/references/global-rules.md` および `.aide/references/phase-skill-rules.md` に全文が記載されている。
両ファイルを Read ツールで全文読み込み、各プラットフォームに合った形式でルールファイルを作成すること。
内容は省略せず全文を含めること。

**⚠️ ルールの内容だけでなく、各ルールの目的・必要性（なぜそのルールが存在するのか）も省略せず記載すること。**
ソースに書かれている説明文・理由・警告文を含めて全文を記載する。
ルールの箇条書きだけを抜き出して説明を省略することを禁止する。

#### ⚠️ ソース鮮度は using-aide-powers 側が version で保証する

`.aide/references/` の最新化（正本 `using-aide-powers/references/` との突き合わせと置き換え）は、
**using-aide-powers (aide-powers skill) の起動時手順「2. references 配置」が version.json 比較で実施する。**
rules-distribute はソースの最新化を行わない。鮮度保証は呼び出し元（using-aide-powers）の責務である。

using-aide-powers は、`.aide/references/` を正本から置き換えた場合に空のフラグファイル
`.aide/references/.rules-updated` を作成する。rules-distribute はこのフラグの有無で配布要否を判定する。

### 差分検知＆置き換え処理（フラグ駆動）

global モードは「新規配置」と「既存配置の更新」の両方を担う。
配布要否は **`.aide/references/.rules-updated` フラグファイルの有無** で判定する。
ルール本文同士の全文比較は行わない（version による鮮度判定は using-aide-powers 側で完結済み）。

**手順（global-rules.md と phase-skill-rules.md の両方に対して実行）:**

1. `.aide/references/.rules-updated` フラグファイルの有無を確認する
2. ステップ1でユーザーに確認した各プラットフォームの配置先ルールファイルが存在するか確認する
3. 各プラットフォーム × 両ソースについて以下を実行する:
   - **配置先ファイルが存在しない** → 新規作成する（フラグの有無に関わらず。初回配置の保証。後述の各プラットフォーム別フォーマットに従う）
   - **配置先ファイルが存在する**:
     - **フラグあり** → `.aide/references/global-rules.md` / `phase-skill-rules.md` の全文で Write 上書きする（front-matter とマーカーは各プラットフォーム形式を維持）
     - **フラグなし** → スキップ（配置先は最新。書き込み不要）
4. **フラグ後始末（必須）**: 手順3で1件でも配布（新規作成または上書き）を行い、かつ `.aide/references/.rules-updated` フラグが存在していた場合、配布完了後にフラグファイルを Delete で削除する。
   - フラグが存在しなかった場合は何もしない（削除対象なし）。
   - 「配置先が全て存在し、フラグもなかった」場合は配布も削除も発生しない（全スキップ）。

**配布漏れ防止:**
- フラグがあるのに一部プラットフォームへの配布をスキップしてフラグだけ削除することを禁止する。フラグ削除は全プラットフォームへの配布完了が前提。
- 新規作成（初回配置）はフラグと無関係に必ず行う。未配置のプラットフォームを放置してはならない。
```

#### after

```markdown
### 入力ソース

using-aide-powers (aide-powers skill) のルール群。`.aide/references/global-rules.md` および `.aide/references/phase-skill-rules.md` に全文が格納されている。
**AI はこれらのファイルを Read で読み込まない。** シェルコマンドで front-matter 文字列とソースファイル内容を結合し、各プラットフォームの配置先に直接書き込む。

#### ⚠️ ソース鮮度は using-aide-powers 側が version で保証する

`.aide/references/` の最新化（正本 `using-aide-powers/references/` との突き合わせと置き換え）は、
**using-aide-powers (aide-powers skill) の起動時手順「2. references 配置」が version.json 比較で実施する。**
rules-distribute はソースの最新化を行わない。鮮度保証は呼び出し元（using-aide-powers）の責務である。

using-aide-powers は、`.aide/references/` を正本から置き換えた場合に空のフラグファイル
`.aide/references/.rules-updated` を作成する。rules-distribute はこのフラグの有無で配布要否を判定する。

### 差分検知＆置き換え処理（フラグ駆動）

global モードは「新規配置」と「既存配置の更新」の両方を担う。
配布要否は **`.aide/references/.rules-updated` フラグファイルの有無** で判定する。
ルール本文同士の全文比較は行わない（version による鮮度判定は using-aide-powers 側で完結済み）。

**手順（global-rules.md と phase-skill-rules.md の両方に対して実行）:**

1. `.aide/references/.rules-updated` フラグファイルの有無を確認する
2. ステップ1でユーザーに確認した各プラットフォームの配置先ルールファイルが存在するか確認する
3. 各プラットフォーム × 両ソースについて以下をシェルコマンドで実行する:
   - **配置先ファイルが存在しない** → 新規作成する（フラグの有無に関わらず。初回配置の保証）
   - **配置先ファイルが存在する**:
     - **フラグあり** → シェルコマンドで上書きする
     - **フラグなし** → スキップ（配置先は最新。書き込み不要）

   **配布コマンド（各プラットフォーム）:**

   以下、`{SOURCE}` は `.aide/references/global-rules.md` または `.aide/references/phase-skill-rules.md`、`{DEST}` は各プラットフォームの配置先パスを示す。

   **■ front-matter 付きプラットフォーム:**

   **Kiro IDE / Kiro CLI** — front-matter: `---\ninclusion: always\n---`

   Windows（PowerShell）:
   ```powershell
   # 配置先ディレクトリがなければ作成
   New-Item -ItemType Directory -Path ".kiro/steering" -Force | Out-Null
   # front-matter + マーカー + 本文を結合して書き込み
   $header = "---`ninclusion: always`n---`n`n<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->`n`n"
   $header + (Get-Content -Raw "{SOURCE}") | Set-Content -NoNewline "{DEST}"
   ```

   Linux/Mac（bash）:
   ```bash
   # 配置先ディレクトリがなければ作成
   mkdir -p .kiro/steering
   # front-matter + マーカー + 本文を結合して書き込み
   { printf '%s\n\n' '---
   inclusion: always
   ---'; printf '%s\n\n' '<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->'; cat "{SOURCE}"; } > "{DEST}"
   ```

   **Claude Code** — front-matter なし、マーカーのみ

   Windows（PowerShell）:
   ```powershell
   New-Item -ItemType Directory -Path ".claude/rules" -Force | Out-Null
   $header = "<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->`n`n"
   $header + (Get-Content -Raw "{SOURCE}") | Set-Content -NoNewline "{DEST}"
   ```

   Linux/Mac（bash）:
   ```bash
   mkdir -p .claude/rules
   { printf '%s\n\n' '<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->'; cat "{SOURCE}"; } > "{DEST}"
   ```

   **Cursor** — front-matter: `---\nalwaysApply: true\ndescription: "..."\n---`

   Windows（PowerShell）:
   ```powershell
   New-Item -ItemType Directory -Path ".cursor/rules" -Force | Out-Null
   $header = "---`nalwaysApply: true`ndescription: `"aide-powers ルール。全セッションに常時適用。`"`n---`n`n<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->`n`n"
   $header + (Get-Content -Raw "{SOURCE}") | Set-Content -NoNewline "{DEST}"
   ```

   Linux/Mac（bash）:
   ```bash
   mkdir -p .cursor/rules
   { printf '%s\n\n' '---
   alwaysApply: true
   description: "aide-powers ルール。全セッションに常時適用。"
   ---'; printf '%s\n\n' '<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->'; cat "{SOURCE}"; } > "{DEST}"
   ```

   **GitHub Copilot** — front-matter: `---\napplyTo: "**"\n---`

   Windows（PowerShell）:
   ```powershell
   New-Item -ItemType Directory -Path ".github/instructions" -Force | Out-Null
   $header = "---`napplyTo: `"**`"`n---`n`n<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->`n`n"
   $header + (Get-Content -Raw "{SOURCE}") | Set-Content -NoNewline "{DEST}"
   ```

   Linux/Mac（bash）:
   ```bash
   mkdir -p .github/instructions
   { printf '%s\n\n' '---
   applyTo: "**"
   ---'; printf '%s\n\n' '<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->'; cat "{SOURCE}"; } > "{DEST}"
   ```

   **■ front-matter なしプラットフォーム（単純コピー）:**

   **Codex / OpenCode / Gemini CLI** — ソースをそのまま配置先にコピー

   Windows（PowerShell）:
   ```powershell
   Copy-Item -Path "{SOURCE}" -Destination "{DEST}" -Force
   ```

   Linux/Mac（bash）:
   ```bash
   cp -f "{SOURCE}" "{DEST}"
   ```

4. **フラグ後始末（必須）**: 手順3で1件でも配布（新規作成または上書き）を行い、かつ `.aide/references/.rules-updated` フラグが存在していた場合、配布完了後にフラグファイルをシェルコマンドで削除する。

   Windows（PowerShell）:
   ```powershell
   Remove-Item -Path ".aide/references/.rules-updated" -Force
   ```

   Linux/Mac（bash）:
   ```bash
   rm -f .aide/references/.rules-updated
   ```

   - フラグが存在しなかった場合は何もしない（削除対象なし）。
   - 「配置先が全て存在し、フラグもなかった」場合は配布も削除も発生しない（全スキップ）。

**⚠️ AI は `.aide/references/global-rules.md` / `phase-skill-rules.md` の内容を Read してはならない。** シェルコマンドで直接結合・コピーすることで、ファイル内容のコンテキスト展開を完全に回避する。

**配布漏れ防止:**
- フラグがあるのに一部プラットフォームへの配布をスキップしてフラグだけ削除することを禁止する。フラグ削除は全プラットフォームへの配布完了が前提。
- 新規作成（初回配置）はフラグと無関係に必ず行う。未配置のプラットフォームを放置してはならない。

**維持する部分（変更なし）:**
- `AGENTS.md` / `GEMINI.md` への参照行追記ロジック（1行の追記のみのため現行通り AI が実行する）
- `.aide/ai-agent-platform-targets.md` の作成ロジック
- 各プラットフォームの配置先パス・ファイル名
- front-matter の内容（各プラットフォーム固有のフォーマット）
- マーカーコメント `<!-- [aide-powers:auto-generated] ... -->` の文面
```

#### 変更理由
- global-rules.md / phase-skill-rules.md は数百行規模のファイルであり、全文を AI コンテキストに展開して Write する現行方式はコンテキスト消費が大きい
- front-matter テンプレートは固定文字列のため、シェルコマンドで機械的に結合可能であり AI が中身を理解する必要がない
- 生成方法が変わるだけで出力ファイルの内容・配置先・命名・フォーマットは不変のため、下流への影響なし

---

## 新規追加の設計
なし

## GUI差分
N/A

## インターフェース影響サマリ
- **スキル間インターフェース**: 変更なし。`using-aide-powers` → `rules-distribute` の呼び出し方法・パラメータは不変
- **フラグファイルプロトコル**: 変更なし。`.aide/references/.rules-updated` の作成・確認・削除フローは同一
- **配布先ファイルの内容・フォーマット**: 変更なし。同一の front-matter + マーカー + 本文が出力される
- **配布先のファイルパス・ファイル名**: 変更なし
- **skill モード（deploy / cleanup）**: 変更なし。本差分設計のスコープ外

## 更新が必要な設計資料
- `skills/using-aide-powers/SKILL.md` — 起動手順2のセクション（本差分設計の適用対象）
- `skills/rules-distribute/SKILL.md` — ステップ2「入力ソース」および「差分検知＆置き換え処理」セクション（本差分設計の適用対象）
