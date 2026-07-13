# 変更要求定義

## 変更概要

- **変更の目的・背景**: references コピーと rules-distribute 配布をシェルコマンドベースに変更し、AI のコンテキスト消費と実行時間を削減する
- **変更種別**: 変更

### 現状の問題

| 箇所 | 現行方式 | 問題 |
|---|---|---|
| using-aide-powers 起動手順2「references 配置」 | 正本10ファイルを1つずつ Read → Write でコピー | コンテキスト大量消費（10ファイル分のテキスト読み書き）、数ターン消費 |
| rules-distribute global モード | `.aide/references/` の global-rules.md / phase-skill-rules.md を Read → 各プラットフォーム向けに front-matter 付きで Write | ファイル全文をコンテキストに展開して書き直すため重い |

### 期待される改善

| 箇所 | 改善後方式 | 効果 |
|---|---|---|
| references 配置 | シェルコマンド（`Copy-Item` / `cp`）で一括コピー | コンテキスト消費ほぼゼロ、10ファイルが数秒で完了 |
| rules-distribute global モード | シェルスクリプトで front-matter + 本文を結合してコピー | ファイル内容をAIが読む必要なし |

---

## 要求事項

### REQ-C-001: references コピーのシェルコマンド化

**対象スキル:** `using-aide-powers`（起動手順2「references 配置」）

**現行動作:**
1. 正本 `skills/using-aide-powers/references/` の version.json を Read で読む
2. `.aide/references/version.json` を Read で読む
3. version 比較で更新が必要と判定した場合、正本の全10ファイルを1つずつ Read → `.aide/references/` に Write でコピー
4. フラグファイル `.aide/references/.rules-updated` を作成

**変更後の動作:**
1. version.json の Read と比較は現行通り（version 判定ロジックは変更しない）
2. 更新が必要と判定した場合、シェルコマンドで正本ディレクトリから `.aide/references/` へ全ファイルを一括コピーする
3. フラグファイル `.aide/references/.rules-updated` を作成する（現行通り）

**技術要件:**
- Windows 環境では `Copy-Item`（PowerShell）を使用する
- Linux/Mac 環境では `cp` を使用する
- `.aide/references/` ディレクトリが存在しない場合は作成する
- 正本ディレクトリのパスはインストール環境（`~/.kiro/skills/using-aide-powers/references/` 等）を使用する
- コピー対象: version.json, global-rules.md, phase-skill-rules.md, progress-file-format.md, kiro-ide-tools.md, kiro-cli-tools.md, copilot-tools.md, vscode-copilot-tools.md, codex-tools.md, gemini-tools.md（全10ファイル）

**受入条件:**
- AC-001-1: version 不一致時に、正本の全10ファイルが `.aide/references/` にコピーされること
- AC-001-2: AI がファイル内容を Read/Write しないこと（シェルコマンドのみで完結）
- AC-001-3: コピー後に `.aide/references/.rules-updated` フラグが作成されること
- AC-001-4: version 一致時は何もしない動作が維持されること
- AC-001-5: `.aide/references/` ディレクトリが存在しない場合に自動作成されること

---

### REQ-C-002: rules-distribute global モードのシェルコマンド化

**対象スキル:** `rules-distribute`（ステップ2: global モード）

**現行動作:**
1. `.aide/references/.rules-updated` フラグの有無を確認
2. `.aide/references/global-rules.md` と `phase-skill-rules.md` を Read で全文読み込み
3. 各プラットフォーム向けに front-matter（`---\ninclusion: always\n---` 等）+ マーカーコメント + 本文を組み立てて Write

**変更後の動作:**
1. フラグ確認は現行通り
2. front-matter + マーカーコメント + 本文の結合をシェルコマンド/スクリプトで実行する
3. AI がソースファイルの内容を Read しない

**技術要件:**
- 各プラットフォームの front-matter テンプレートを定義する（下表参照）
- シェルコマンドで front-matter 文字列 + ソースファイル内容を結合して出力先に書き込む

| プラットフォーム | front-matter / ヘッダー | ソース | 出力先 |
|---|---|---|---|
| Kiro IDE / CLI | `---\ninclusion: always\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | global-rules.md | `.kiro/steering/aide-powers-global-rules.md` |
| Kiro IDE / CLI | `---\ninclusion: always\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | phase-skill-rules.md | `.kiro/steering/aide-powers-phase-skill-rules.md` |
| Claude Code | `<!-- [aide-powers:auto-generated] ... -->\n\n` | global-rules.md | `.claude/rules/aide-powers-global-rules.md` |
| Claude Code | `<!-- [aide-powers:auto-generated] ... -->\n\n` | phase-skill-rules.md | `.claude/rules/aide-powers-phase-skill-rules.md` |
| Cursor | `---\nalwaysApply: true\ndescription: "..."\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | global-rules.md | `.cursor/rules/aide-powers-global-rules.mdc` |
| Cursor | `---\nalwaysApply: true\ndescription: "..."\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | phase-skill-rules.md | `.cursor/rules/aide-powers-phase-skill-rules.mdc` |
| GitHub Copilot | `---\napplyTo: "**"\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | global-rules.md | `.github/instructions/aide-powers-global-rules.instructions.md` |
| GitHub Copilot | `---\napplyTo: "**"\n---\n\n<!-- [aide-powers:auto-generated] ... -->\n\n` | phase-skill-rules.md | `.github/instructions/aide-powers-phase-skill-rules.instructions.md` |
| Codex / OpenCode | なし（そのままコピー） | global-rules.md | `aide-powers-global-rules.agents.md` |
| Codex / OpenCode | なし（そのままコピー） | phase-skill-rules.md | `aide-powers-phase-skill-rules.agents.md` |
| Gemini CLI | なし（そのままコピー） | global-rules.md | `aide-powers-global-rules.gemini.md` |
| Gemini CLI | なし（そのままコピー） | phase-skill-rules.md | `aide-powers-phase-skill-rules.gemini.md` |

**Windows での結合コマンド例:**
```powershell
# front-matter 付きの場合
$header = "---`ninclusion: always`n---`n`n<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->`n`n"
$header + (Get-Content -Raw ".aide/references/global-rules.md") | Set-Content -NoNewline ".kiro/steering/aide-powers-global-rules.md"

# front-matter なしの場合（単純コピー）
Copy-Item ".aide/references/global-rules.md" "aide-powers-global-rules.agents.md"
```

**受入条件:**
- AC-002-1: フラグあり時に、全プラットフォームの配置先にルールファイルが生成されること
- AC-002-2: 生成されたファイルが正しい front-matter + マーカーコメント + 本文全文を含むこと
- AC-002-3: AI が `.aide/references/global-rules.md` / `phase-skill-rules.md` の内容を Read しないこと
- AC-002-4: フラグなし＆配置先存在時はスキップされること（現行動作維持）
- AC-002-5: 配置先ファイルが存在しない場合は、フラグの有無に関わらず新規作成されること（初回配置保証の維持）
- AC-002-6: 配布完了後にフラグファイルが削除されること（現行動作維持）
- AC-002-7: 配置先ディレクトリが存在しない場合に自動作成されること

---

## 対象外（スコープ外）

- **rules-distribute の skill モード**: 本変更は global モードのみを対象とする。skill:deploy / skill:cleanup モードは変更しない
- **version.json の比較ロジック**: 比較自体は Read で version.json を読む必要がある（小さいJSONファイルのため問題なし）。この部分は変更しない
- **`.aide/ai-agent-platform-targets.md` の作成・更新ロジック**: 変更しない
- **AGENTS.md / GEMINI.md への参照行追記ロジック**: front-matter なしプラットフォームの追記ロジックは現行通りAIが実行する（1行の追記のみのため軽量）
- **配布先ファイルの全文一致検証**: 現行スキルの「出力ファイルの最終行が元ファイルの最終行と一致することを確認」要件は、シェルコマンドの信頼性により不要とする（コマンドのexit codeで正常終了を確認する）

---

## 前提条件

| # | 前提 |
|---|---|
| 1 | 開発環境は Windows（PowerShell 利用可能）。ただしスキル記述はクロスプラットフォーム対応とし、Linux/Mac 向けコマンドも併記する |
| 2 | AI Agent にはシェルコマンド実行ツール（execute_pwsh / Bash 等）が利用可能である |
| 3 | 正本ディレクトリ（`~/.kiro/skills/using-aide-powers/references/` 等）はグローバルインストール済みでアクセス可能である |
| 4 | `.aide/references/` に配置されるファイルは純粋なコピー（front-matter は付与しない）。front-matter 付与は rules-distribute が担当する |

---

## 関連する既存要件

| 関連ドキュメント | 関連箇所 |
|---|---|
| `skills/using-aide-powers/SKILL.md` | 起動手順2「references 配置」 |
| `skills/rules-distribute/SKILL.md` | ステップ2: global モード |
| `.aide/specs/aide-powers/dev-environment.md` | §3 AI Agent プラットフォーム、§4 OS依存 |
| `.aide/specs/aide-powers/program-structure.md` | フォルダ構成ツリー、配布マッピング表 |

---

## 変更の影響範囲

| 影響を受けるファイル | 変更内容 |
|---|---|
| `skills/using-aide-powers/SKILL.md` | 起動手順2の記述をシェルコマンド方式に書き換え |
| `skills/rules-distribute/SKILL.md` | global モードの配布手順をシェルコマンド方式に書き換え |

※ スキル定義（SKILL.md）の変更のみ。配布物のディレクトリ構造やファイル名は変更しない。
