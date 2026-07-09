---
name: using-aide-powers
description: Use when starting any conversation - establishes workflow selection, global rules, and how to find and use skills for document-driven development
---

<SUBAGENT-STOP>
サブエージェントとして特定のタスクを実行するために派遣された場合、このスキルをスキップすること。
</SUBAGENT-STOP>

# aide-powers

aide-powers はドキュメント駆動開発フレームワークである。
スキルが適用される可能性が1%でもあるなら、必ずそのスキルを呼び出すこと。
このスキル（using-aide-powers）が読み込めている時点で、aide-powers は正常に動作している。

**優先順位:** ユーザーの明示的指示 > aide-powersスキル > デフォルトのシステムプロンプト

---

## 起動時の手順

セッション開始時、ユーザーへの応答前に以下を順番に実行する。

**1. セッション引き継ぎチェック**

`.aide/specs/{feature_name}/session-handover.md` が存在する場合、
`session-handover` (aide-powers skill) のプロセス2に従って作業状態を復元する。

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

**3. rules-distribute（global モード）**

`rules-distribute` (aide-powers skill) を global モードで実行する。
このスキルは `.aide/references/.rules-updated` フラグの有無を見て配布を行う:
- **フラグあり**（手順2で .aide/references/ が更新された）→ `.aide/references/global-rules.md` および `.aide/references/phase-skill-rules.md` を各プラットフォームのルール置き場に配置し、配置後にフラグファイルを削除する
- **フラグなし**（version 据え置き＝配置先は最新）→ 配布をスキップする

未配置のプラットフォームがある場合は、フラグの有無に関わらず新規作成する（初回配置の保証）。

配置先（プラットフォーム別、global-rules / phase-skill-rules の2系統）:

| プラットフォーム | global-rules | phase-skill-rules |
|---|---|---|
| Kiro IDE / CLI | `.kiro/steering/aide-powers-global-rules.md` | `.kiro/steering/aide-powers-phase-skill-rules.md` |
| Claude Code | `.claude/rules/aide-powers-global-rules.md` | `.claude/rules/aide-powers-phase-skill-rules.md` |
| Cursor | `.cursor/rules/aide-powers-global-rules.mdc` | `.cursor/rules/aide-powers-phase-skill-rules.mdc` |
| GitHub Copilot | `.github/instructions/aide-powers-global-rules.instructions.md` | `.github/instructions/aide-powers-phase-skill-rules.instructions.md` |
| Codex / OpenCode / Gemini | プロジェクトルート | プロジェクトルート |

「ファイルが存在するからスキップ」という判断を禁止する。配布要否は `.aide/references/.rules-updated` フラグで判定されるため、毎回必ず rules-distribute を呼び出すこと。

---

## ワークフロー選択

ユーザーの発話から適切なエントリポイントスキルを特定し、即座に activate する。

| 状況 | エントリポイント |
|---|---|
| アイデア段階・新規プロジェクト | `fs-planning-phase1-intake-and-init` (aide-powers skill) |
| 要件が明確・設計から始める | `fs-design-phase1-user-req` (aide-powers skill) |
| コードはあるが設計書がない | `fs-reverse-phase1-program` (aide-powers skill) |
| コードも設計書もある・実装する | `fs-impl-phase1-gate` (aide-powers skill) |
| 機能追加・仕様変更 | `fs-change-phase1-analysis` (aide-powers skill) |
| バグ修正 | `fs-bugfix-phase1-analysis` (aide-powers skill) |
| 内部構造改善・リファクタリング | `fs-refactoring-phase1-status` (aide-powers skill) |

### 発話トリガー

| トリガー | スキル |
|---|---|
| 作りたい、新しいアプリ、企画 / "build", "new project" | `fs-planning-phase1-intake-and-init` |
| 設計して、仕様書 / "design", "specs" | `fs-design-phase1-user-req` |
| 実装して、コードを書いて / "implement", "write code" | `fs-impl-phase1-gate` |
| バグ、動かない、エラー / "bug", "crashes", "broken" | `fs-bugfix-phase1-analysis` |
| 機能追加、仕様変更 / "add feature", "modify" | `fs-change-phase1-analysis` |
| リファクタ、技術的負債 / "refactor", "tech debt" | `fs-refactoring-phase1-status` |
| 設計書がない、構造把握 / "no docs", "reverse" | `fs-reverse-phase1-program` |

### 判断に迷うケース

| ケース | 判断基準 |
|---|---|
| 「修正して」 | バグ → bugfix / 仕様変更 → change |
| 「改善して」 | 振る舞い変わらない → refactoring / 変わる → change |
| 「設計書を作って」 | 既存コードある → reverse / ない → design |
| 「実装して」 | 設計書ある → impl / ない → まず設計 |
| 「新機能を追加」 | 既存コードベースある → change / ない → planning |

不明な場合はユーザーに番号付き選択肢で確認すること。

### pending-issues.md の事前チェック

ワークフロー選択前に `.aide/specs/{feature_name}/pending-issues.md` の存在を確認し、
存在する場合は内容を読んで優先対応が必要かを判断する。

---

## ルール

### 全プラットフォーム共通ルール

`.aide/references/global-rules.md` を参照。
ユーザー対話の振る舞い、git操作、ファイル書き込み、プラットフォーム適応など、aide-powers 全体に常時適用されるルール。

### フェーズスキル共通ルール

フェーズスキル（`fs-*`）および aide-powers の共通スキル実行時は、必ず `.aide/references/phase-skill-rules.md` を読み、その指示に従うこと。
前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など、フェーズスキル実行に必須のルールが記載されている。

これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

### 全SKILLの activate 必須・独自解釈禁止（最上位原則）

これは aide-powers の全スキルに優先して適用される最上位の原則である。

aide-powers の全ての SKILL（共通スキルも、フェーズスキル `fs-*` も、例外なく全て）は、AI が内容を独自解釈して自己流で進めてはならない。実行のたびに必ず該当 SKILL を activate（Kiro IDE では `discloseContext`、Claude Code では `Skill`、他プラットフォームでは `activate_skill` 等）で有効化し、SKILL の記述に 100% 従って実行すること。書かれていない手順を独自に補ったり、書かれている手順を省略・代替（`fs_write` 直書き等）に置き換えたりしてはならない。

**「覚えているから activate 不要」は誤りである。** 一度読んで内容を覚えたとしても、activate を省略・自己流代替してはならない。activate の目的は動作確認ではなく、実行のたびに SKILL のルールをコンテキストへ正確に再注入・適用することである（覚えた内容は時間経過・コンテキスト圧縮・自己流解釈で劣化しうる）。

詳細は `.aide/references/phase-skill-rules.md` の「全SKILLの activate 必須・独自解釈禁止（最上位原則）」を参照。

---

## プラットフォーム適応

スキルは Claude Code のツール名（`Read`, `Write`, `Edit`, `Bash`, `Task`, `Skill`）で記述されている。

| プラットフォーム | アクセス方法 | ツールマップ |
|---|---|---|
| Claude Code | `Skill` ツール | 不要 |
| Kiro IDE | `discloseContext` ツール | `.aide/references/kiro-ide-tools.md` |
| Kiro CLI | `discloseContext` ツール | `.aide/references/kiro-cli-tools.md` |
| Copilot CLI | `skill` ツール | `.aide/references/copilot-tools.md` |
| VSCode Copilot | 自動ロード / ファイル読み取り | `.aide/references/vscode-copilot-tools.md` |
| Gemini CLI | `activate_skill` ツール | `.aide/references/gemini-tools.md` |
| Codex | ファイル読み取り | `.aide/references/codex-tools.md` |

ツールマップを読まずに「そのツールは存在しない」と判断することを禁止する。
