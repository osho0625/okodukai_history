---
name: rules-distribute
description: "Enforces aide-powers rules via platform-native rule file mechanisms. Use when first using aide-powers in a workspace, at workflow start/end, and at common skill start/end."
---

# ルール配布スキル（rules-distribute）

## Overview

aide-powers のルールを、各プラットフォームのルールファイル機構に直接配置するスキル。
配置されたルールはプラットフォームが自動的にAIのコンテキストに注入するため、
AIが「ファイルを読む」ステップなしにルールが強制適用される。

## 2つのモード

| モード | 用途 | ライフサイクル |
|---|---|---|
| **global** | global-rules.md の内容を常時適用ルールとして配置 | 常時配置（削除しない） |
| **skill** | スキルのルール部分を動的配置 | スキル開始時に配置、完了時に削除 |

※ skill モードはフェーズスキル（`fs-*`）だけでなく、共通スキル（`multi-stage-code-review (aide-powers skill)`, `impl-coding-standards (aide-powers skill)` 等）も含む、aide-powers の全スキルが対象。

---

## ステップ1: プラットフォーム判定

ユーザーは複数の AI Agent プラットフォームを利用している可能性がある。
自動で AI Agent のプラットフォームを判別するとともに、正しいか、他に利用しているプラットフォームがないかユーザーに確認すること。

### 条件分岐: ターゲットファイルの存在チェック

**事前チェック:** `.aide/ai-agent-platform-targets.md` が既に存在するか確認する。

- **存在する場合**: ユーザーへのプラットフォーム確認を**スキップ**し、既存ファイルの内容をそのまま使用してステップ2に進む。ユーザーには「既存のプラットフォームターゲット設定を使用します」と簡潔に通知するのみとする。
- **存在しない場合**: 以下の従来の確認フローを実行する。

> **注記（明示的変更トリガー）:** ユーザーから「プラットフォームターゲットを変更したい」「対象プラットフォームを追加/削除したい」等の明示的な依頼があった場合にのみ、既存の `.aide/ai-agent-platform-targets.md` を無視して以下の確認フローを再実行し、ファイルを更新する。AI が自己判断でターゲットファイルを変更・再確認することは禁止。

### 確認フロー（ターゲットファイル未存在時 or 明示的変更依頼時）

**手順:**
1. システム情報やワークスペースの構成から、現在の AI Agent プラットフォームを推定する
2. 推定結果をユーザーに提示し、以下を確認する:
   - 推定が正しいか
   - 他にこのワークスペースで利用している AI Agent プラットフォームがないか

```
このワークスペースで使用している AI Agent プラットフォームを確認させてください。
現在 {推定したプラットフォーム名} で動作していると判断しましたが、
他にも利用しているプラットフォームはありますか？（複数可）:

1. Kiro IDE / Kiro CLI
2. Claude Code
3. Cursor
4. OpenCode
5. GitHub Copilot（VSCode / CLI）
6. Gemini CLI
7. Codex
8. その他（自由記述）
```

3. ユーザーの回答を待ち、回答に基づいて該当する全プラットフォームに対してルールファイルを作成する
4. **ユーザーの回答を待たずに次のステップに進んではならない**

### 各プラットフォームの配置先

| プラットフォーム | 配置先 |
|---|---|
| Kiro IDE / Kiro CLI | `.kiro/steering/` |
| Claude Code | `.claude/rules/` |
| Cursor | `.cursor/rules/`（`alwaysApply: true` の `.mdc` 形式） |
| OpenCode | Codex と同じ方式（プロジェクトルートに別ファイル。`AGENTS.md` 経由で参照） |
| GitHub Copilot（VSCode / CLI） | `.github/instructions/` |
| Gemini CLI | プロジェクトルートに別ファイル |
| Codex | プロジェクトルートに別ファイル |

### 配置先フォルダの自動作成

配置先フォルダが存在しない場合は作成すること（例: `.kiro/steering/` がなければ作成する）。

---

## ステップ2: global モード（常時適用ルール配置 / 差分置き換え）

**⚠️ 重要: 「配置します」と報告するだけで終わるな。必ず Write ツール（fsWrite / fs_write）でファイルを実際に作成すること。ファイルが作成されるまでこのステップは完了しない。**

**⚠️ 全文必須: 配布対象ルールファイルの内容は省略せず全文を含めること。作成後、出力ファイルの最終行が元ファイルの最終行と一致することを確認すること。一致しなければ書き込みが不完全であり、やり直すこと。**

### 配布対象ファイル

global モードは以下の2ファイルを各プラットフォームに配布する:

| ソース | 配置先ファイル名（Kiro 例） | 用途 |
|---|---|---|
| `.aide/references/global-rules.md` | `aide-powers-global-rules.md` | 全プラットフォーム共通ルール |
| `.aide/references/phase-skill-rules.md` | `aide-powers-phase-skill-rules.md` | フェーズスキル共通ルール |

両方とも常時注入される（プラットフォームのルールファイル機構経由）。

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

### 各プラットフォームへのルールファイル作成

ステップ1でユーザーに確認した全プラットフォームに対してグローバルルールファイルを作成または更新する。

### `.aide/ai-agent-platform-targets.md` の作成（必須）

グローバルルールファイルの作成が完了したら、`.aide/ai-agent-platform-targets.md` を作成する。
このファイルは skill:deploy モードで対象プラットフォームを特定するために使用される。

```markdown
# aide-powers 対象プラットフォーム

このワークスペースで使用する AI Agent プラットフォームの一覧。
rules-distribute スキルの skill:deploy モードは、このリストに記載された全プラットフォームに対してルールファイルを作成する。

## プラットフォーム一覧

- {ユーザーが回答したプラットフォーム1}
- {ユーザーが回答したプラットフォーム2}
- ...
```

**`.aide/` フォルダが存在しない場合は作成すること。**

#### Kiro IDE / Kiro CLI

**出力先:** `.kiro/steering/aide-powers-global-rules.md`

```markdown
---
inclusion: always
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{global-rules.md の全内容}
```

#### Claude Code

**出力先:** `.claude/rules/aide-powers-global-rules.md`

```markdown
<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{global-rules.md の全内容}
```

※ `paths` フィールドなし = 無条件で全セッションに適用

#### Cursor

**出力先:** `.cursor/rules/aide-powers-global-rules.mdc`

```markdown
---
alwaysApply: true
description: "aide-powers グローバルルール。全セッションに常時適用。"
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{global-rules.md の全内容}
```

#### OpenCode

Codex と同じ方式を使用する。

**出力先:** `aide-powers-global-rules.agents.md`（プロジェクトルート）

内容: `global-rules.md` の全内容をそのまま配置。

さらに `AGENTS.md` に以下の行を追記（既に存在しなければ）:

```
以下のファイルのルールに従うこと: aide-powers-global-rules.agents.md
```

※ OpenCode は `AGENTS.md` を自動読み込みするため、この参照行で `aide-powers-global-rules.agents.md` も読み込まれる。

#### GitHub Copilot

**出力先:** `.github/instructions/aide-powers-global-rules.instructions.md`

```markdown
---
applyTo: "**"
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{global-rules.md の全内容}
```

#### Gemini CLI

**出力先:** `aide-powers-global-rules.gemini.md`（プロジェクトルート）

内容: `global-rules.md` の全内容をそのまま配置。

さらに `GEMINI.md` に以下の行を追記（既に存在しなければ）:

```
@./aide-powers-global-rules.gemini.md
```

#### Codex

**出力先:** `aide-powers-global-rules.agents.md`（プロジェクトルート）

内容: `global-rules.md` の全内容をそのまま配置。

さらに `AGENTS.md` に以下の行を追記（既に存在しなければ）:

```
以下のファイルのルールに従うこと: aide-powers-global-rules.agents.md
```

### phase-skill-rules.md 用ファイル名

`phase-skill-rules.md` を配布する際は、上記の各プラットフォームの出力先のファイル名を以下のように置き換えて配置すること。フォーマット（front-matter、マーカー）は global-rules.md と同じ形式を使用する。

| プラットフォーム | phase-skill-rules.md の出力先 |
|---|---|
| Kiro IDE / Kiro CLI | `.kiro/steering/aide-powers-phase-skill-rules.md` |
| Claude Code | `.claude/rules/aide-powers-phase-skill-rules.md` |
| Cursor | `.cursor/rules/aide-powers-phase-skill-rules.mdc` |
| OpenCode | `aide-powers-phase-skill-rules.agents.md`（プロジェクトルート） |
| GitHub Copilot | `.github/instructions/aide-powers-phase-skill-rules.instructions.md` |
| Gemini CLI | `aide-powers-phase-skill-rules.gemini.md`（プロジェクトルート） |
| Codex | `aide-powers-phase-skill-rules.agents.md`（プロジェクトルート） |

**OpenCode / Codex の AGENTS.md 追記:**
```
以下のファイルのルールに従うこと: aide-powers-phase-skill-rules.agents.md
```

**Gemini CLI の GEMINI.md 追記:**
```
@./aide-powers-phase-skill-rules.gemini.md
```

---

## ステップ3: skill モード（スキルルールの動的配置）

**⚠️ 重要: 「配置します」と報告するだけで終わるな。必ず Write ツール（fsWrite / fs_write）でファイルを実際に作成すること。削除時も必ず Delete ツールで実際に削除すること。**

### 入力

呼び出し元スキルから以下を受け取る:
- **スキル名**: 例 `fs-design-phase1-user-req`, `multi-stage-code-review`
- **ルール内容**: スキルから抽出した「ルール部分」のテキスト

### ルール部分の抽出基準

スキルの SKILL.md から以下のセクションを抽出する:
- `## The Iron Law` セクション全体
- `## ルール` または `## Rules` セクション（存在する場合）
- `## 完了条件` セクション（存在する場合）
- `## 禁止事項` セクション（存在する場合）

手順・ステップ・Overview・参照ファイル等は**含めない**。

**⚠️ ルールの内容だけでなく、各ルールの目的・必要性（なぜそのルールが存在するのか）も省略せず記載すること。**
Iron Law に付随する説明文、ルールの理由、警告文を含めて記載する。
ルールの箇条書きだけを抜き出して説明を省略することを禁止する。

### ルールファイル作成（skill:deploy）

#### 手順

1. **`.aide/ai-agent-platform-targets.md` を読み込む**
   このファイルは global モード実行時に作成される。対象プラットフォームのリストが記載されている。

2. **`.aide/ai-agent-platform-targets.md` に記載された全プラットフォームに対して、スキル用ルールファイルを作成する**
   1つも漏らさず、リストに記載された全プラットフォーム分のスキル用ルールファイルを Write ツールで実際に作成すること。

3. **作成確認: 全プラットフォーム分のスキル用ルールファイルが実際に存在するか確認する**
   `.aide/ai-agent-platform-targets.md` に記載された各プラットフォームについて、対応するスキル用ルールファイルが実際にワークスペース内に存在するか確認すること。
   存在しないファイルがあれば、即座に作成する。全ファイルの存在が確認できるまでこのステップは完了しない。

4. **`.aide/ai-agent-platform-targets.md` が存在しない場合**
   global モードが未実行である。先に `rules-distribute` スキルを global モードで実行すること。

#### ファイル命名規則

```
aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}
```

例: `aide-powers-skill--fs-design-phase1-user-req--202605151430`

- `aide-powers-skill--` プレフィックスで rules-distribute が生成したファイルと識別可能
- `{スキル名}` でどのスキルのルールか判別可能
- `{YYYYMMDDHHmm}` で生成時刻を記録（古い残骸の判定に使用）

#### 残骸削除ルール

`skill:deploy` 実行時、配置先ディレクトリ内に `aide-powers-skill--` プレフィックスを持つファイルが既に存在する場合:
1. **現在デプロイしようとしているスキルと同名のファイル** → 削除して新規作成
2. **別スキル名のファイル** → 前スキルの残骸とみなし削除

つまり `aide-powers-skill--*` は常に1ファイルのみ存在する状態を維持する。

#### ルールファイル先頭の目的宣言（必須）

全プラットフォーム共通で、ルールファイルの先頭（front-matter・マーカーの直後）に以下の目的宣言を記載すること:

```
# {スキルの description から取得した目的} のためのルール

> aide-powers の緻密に計算されたプロセスの履行をわずかでも損なうことは、
> 後に大きな不具合の原因となる。ここに記述するルールを厳守しなければならない。
```

`{スキルの description}` は、対象スキルの SKILL.md の front-matter にある `description` フィールドの内容を使用する。

#### Kiro IDE / Kiro CLI

**出力先:** `.kiro/steering/aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.md`

```markdown
---
inclusion: always
---

<!-- [aide-powers:skill-rule] スキル: {スキル名} / 生成: {YYYYMMDDHHmm} / スキル完了時に自動削除 -->

# 現在実行中のスキルルール: {スキル名}

{抽出したルール内容}
```

#### Claude Code

**出力先:** `.claude/rules/aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.md`

```markdown
<!-- [aide-powers:skill-rule] スキル: {スキル名} / 生成: {YYYYMMDDHHmm} / スキル完了時に自動削除 -->

# 現在実行中のスキルルール: {スキル名}

{抽出したルール内容}
```

#### Cursor

**出力先:** `.cursor/rules/aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.mdc`

```markdown
---
alwaysApply: true
description: "aide-powers スキルルール（{スキル名}）。スキル完了時に自動削除。"
---

<!-- [aide-powers:skill-rule] スキル: {スキル名} / 生成: {YYYYMMDDHHmm} / スキル完了時に自動削除 -->

# 現在実行中のスキルルール: {スキル名}

{抽出したルール内容}
```

#### OpenCode

Codex と同じ方式を使用する。

**出力先:** `aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.agents.md`（プロジェクトルート）

内容をそのまま配置。

#### GitHub Copilot

**出力先:** `.github/instructions/aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.instructions.md`

```markdown
---
applyTo: "**"
---

<!-- [aide-powers:skill-rule] スキル: {スキル名} / 生成: {YYYYMMDDHHmm} / スキル完了時に自動削除 -->

# 現在実行中のスキルルール: {スキル名}

{抽出したルール内容}
```

#### Gemini CLI

**出力先:** `aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.gemini.md`（プロジェクトルート）

内容をそのまま配置。`GEMINI.md` に `@./aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.gemini.md` を追記（なければ）。

#### Codex

**出力先:** `aide-powers-skill--{スキル名}--{YYYYMMDDHHmm}.agents.md`（プロジェクトルート）

内容をそのまま配置。

### 削除（skill:cleanup）

スキル完了時に、全プラットフォームの配置先ディレクトリから `aide-powers-skill--` プレフィックスを持つファイルを**全て削除**する。

| プラットフォーム | 削除対象パターン |
|---|---|
| Kiro | `.kiro/steering/aide-powers-skill--*` |
| Claude Code | `.claude/rules/aide-powers-skill--*` |
| Cursor | `.cursor/rules/aide-powers-skill--*` |
| OpenCode | `aide-powers-skill--*.agents.md`（Codex と共有） |
| GitHub Copilot | `.github/instructions/aide-powers-skill--*` |
| Gemini CLI | `aide-powers-skill--*.gemini.md` + `GEMINI.md` から該当 `@import` 行を削除 |
| Codex | `aide-powers-skill--*.agents.md` |

---

## ステップ4: 保険（忘却対策）

### 保険A: deploy 時の自動クリーンアップ

`skill:deploy` 実行時、`aide-powers-skill--` プレフィックスを持つ既存ファイルを全て削除してから新規配置する（ステップ3の残骸削除ルールに含まれる）。

### 保険B: ワークフロー開始時クリーンアップ

ワークフロー開始時（先頭フェーズスキル起動時）に、全プラットフォームの配置先から
`aide-powers-skill--*` ファイルが残っていないか確認し、あれば削除する。

### 保険C: ワークフロー完了時クリーンアップ

ワークフロー完了時（最終フェーズスキル完了時）に、`skill:cleanup` を実行して
確実に残骸を除去する。

---

## 呼び出し方

### global モード

```
rules-distribute スキルを global モードで実行してください。
```

以下のタイミングで呼び出す:
- using-aide-powers (aide-powers skill) のワークスペース初期化時（新規配置）
- ワークフロー開始時のチェック（using-aide-powers が version.json 比較で `.aide/references/` を最新化し `.rules-updated` フラグを立てた場合、本スキルが配置先へ配布してフラグを削除する）
- references 配下のいずれかの正本ファイル（global-rules.md / phase-skill-rules.md / progress-file-format.md / 各ツールマップ等）の更新時（正本 version.json の version を上げると、using-aide-powers が `.aide/references/` を置き換えてフラグを立てる。本スキルがフラグを見て、配布対象（global-rules.md / phase-skill-rules.md）の既存配置を最新内容に置き換える）

ソースの最新化（`.aide/references/` の置き換え）と version 判定は using-aide-powers 側の責務である。本スキルは `.aide/references/.rules-updated` フラグの有無で配布要否を判定し、配布後にフラグを削除する。

### skill モード（配置）

```
rules-distribute スキルを skill:deploy モードで実行してください。
スキル名: fs-design-phase1-user-req
ルール内容: （以下に抽出済みルールを記載）
```

### skill モード（削除）

```
rules-distribute スキルを skill:cleanup モードで実行してください。
```

---

## 注意事項

- 自動生成マーカー `[aide-powers:auto-generated]` または `[aide-powers:skill-rule]` が含まれるファイルのみ操作対象とする。マーカーがないファイルは絶対に変更しない。
- `GEMINI.md` や `AGENTS.md` への追記時は、既存内容を破壊しないこと。
- `.gitignore` に `aide-powers-skill--*` を追加することを推奨する（動的ファイルはコミット不要）。
- `.aide/references/.rules-updated` は using-aide-powers が `.aide/references/` を更新したことを示すシグナルファイル。global モードが配布完了後に削除する。手動で作成・削除してはならない。`.gitignore` に追加することを推奨する。

---

## 注記: APM配布ファイルの同期更新

正本（`skills/using-aide-powers/references/global-rules.md` および `phase-skill-rules.md`）を更新した際は、以下の6本の配布ファイルも同期更新すること:

- `steering/aide-powers-global-rules.md`
- `steering/aide-powers-phase-skill-rules.md`
- `rules/aide-powers-global-rules.md`
- `rules/aide-powers-phase-skill-rules.md`
- `instructions/aide-powers-global-rules.instructions.md`
- `instructions/aide-powers-phase-skill-rules.instructions.md`

各ファイルの構成（プラットフォーム固有ヘッダー + マーカー + 正本内容）は本設計書の §2 を参照。
