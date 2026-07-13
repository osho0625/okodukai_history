# APM Instructions フォーマット調査結果

調査日: 2025-07-14
情報源: microsoft.github.io/apm 公式ドキュメント (Last updated: Jun 12, 2026)

---

## 結論（必須フォーマット）

### ソースファイル配置

```
.apm/instructions/<name>.instructions.md
```

### テンプレート（スコープ付き instruction）

```markdown
---
description: Python style rules enforced on src/ and tests/
applyTo: "**/*.py"
---

- Use `pathlib.Path`, never `os.path`.
- Tests live next to the module under `tests/<module>/`.
- ...
```

### テンプレート（無条件 instruction / applyTo なし）

```markdown
---
description: Global coding standards for the project
---

- Always write unit tests for new functions.
- Use meaningful variable names.
- ...
```

---

## 詳細仕様

### ファイル拡張子

- **必須**: `.instructions.md`（ダブル拡張子）
- ベースネーム（ダブル拡張子を除いた部分）がデプロイ時のファイル名ステムになる
- 例: `python-style.instructions.md` → デプロイ先で `python-style.md` 等

### ファイル名の命名規則

- 公式ドキュメントに厳格な命名規則の記載はない
- 推奨パターン: ケバブケース（`python-style`, `pr-review-checklist`）
- 1トピック1ファイルが推奨

### Front-matter フィールド

| フィールド | 必須/任意 | 型 | 説明 |
|---|---|---|---|
| `description` | **必須** | string | 一行の要約。コンパイル時のコンテキストインデックスで使用される |
| `applyTo` | instructions では **必須**（任意扱いだがスコープが効かなくなる） | string / YAML sequence | ルールが適用されるファイルglob |

### `applyTo` フィールドの仕様

#### 型と値

1. **単一glob**: `"**/*.py"`
2. **カンマ区切りリスト**: `"**/*.{css,scss},**/*.tsx"`
3. **YAML sequence（配列）**: 
   ```yaml
   applyTo:
     - "**/*.py"
   ```

#### 重要な注意事項

- ブレース代替（`**/*.{css,scss}`）内のカンマはglobの一部であり、リスト区切りとしては扱われない
- YAML配列形式で複数パターンを指定した場合、APM は**最初のパターンのみ使用**し残りは無視する（downstream consumerの単一パターン制限）
- **推奨**: 複数globにはカンマ区切り文字列形式を使用する

#### applyTo がない場合の動作

- `applyTo` なしの instruction は「無条件（unconditional）」として扱われる
- スコープ付きルールディレクトリには配置されず、コンパイル済みコンテキストファイル（`AGENTS.md`, `GEMINI.md`）にフォールディングされる
- Copilot や Cursor でスコープ付きルールにしたい場合は `applyTo` が必須

### Body（本文）の規約

- 箇条書きで始める（散文ではなく）。エージェントがタスク中に読むため簡潔に
- 1ファイル1トピック。`python-style` と `python-testing` を混在させない
- リポジトリ内のパスはバッククォートで引用する
- 挨拶やメタ情報（"In this file we will…"）は不要。ルールを直接述べる

---

## ターゲット別変換ルール

### 変換テーブル

| ターゲット | デプロイ先 | applyTo の変換 | 備考 |
|---|---|---|---|
| copilot | `.github/instructions/<name>.instructions.md` | verbatim（そのまま維持） | カンマリストはCopilotがネイティブ分割 |
| claude | `.claude/rules/<name>.md` | `applyTo` → `paths:` リスト（YAML配列に展開） | カンマリストは YAML 配列に展開される |
| cursor | `.cursor/rules/<name>.mdc` | `applyTo` → `globs:` (単一globはスカラー、カンマリストはYAML配列) | description 未設定時は自動導出 |
| windsurf | `.windsurf/rules/<name>.md` | `applyTo` → `trigger: glob` + `globs:` (スカラーまたはYAML配列) | applyTo なし → `trigger: always_on` |
| kiro | `.kiro/steering/<name>.md` | `applyTo` → `inclusion: fileMatch` + `fileMatchPattern:` | applyTo なし → `inclusion: always` |
| codex | `AGENTS.md` にフォールディング | コンパイルのみ、個別ファイルデプロイなし | |
| gemini | `GEMINI.md` にフォールディング | コンパイルのみ、個別ファイルデプロイなし | |
| opencode | `AGENTS.md` にフォールディング | コンパイルのみ、個別ファイルデプロイなし | |

### Copilot ターゲットの変換詳細

- 配置先: `.github/instructions/<name>.instructions.md`
- front-matter: **そのまま維持**（verbatim）
- Copilot は `.github/instructions/` を直接読み取るため compile は任意
- カンマ区切りリストはCopilotがネイティブに分割処理

### Claude ターゲットの変換詳細

- 配置先: `.claude/rules/<name>.md`
- `applyTo` → `paths:` に変換される（YAML配列形式）
- カンマ区切りリストは展開されてYAML配列になる

**推定される出力例**:
```markdown
---
description: Python style rules enforced on src/ and tests/
paths:
  - "**/*.py"
---

- Use `pathlib.Path`, never `os.path`.
- ...
```

### Kiro ターゲットの変換詳細

- 配置先: `.kiro/steering/<name>.md`
- `applyTo` → `inclusion: fileMatch` + `fileMatchPattern:` に変換
- `applyTo` なし → `inclusion: always`
- AGENTS.md にもフォールバックとして出力（cross-harness用）

**推定される出力例**:
```markdown
---
description: Python style rules enforced on src/ and tests/
inclusion: fileMatch
fileMatchPattern: "**/*.py"
---

- Use `pathlib.Path`, never `os.path`.
- ...
```

### Cursor ターゲットの変換詳細

- 配置先: `.cursor/rules/<name>.mdc`
- `applyTo` → `globs:` に変換
- 単一glob: スカラー値
- 複数glob: YAML配列

**推定される出力例**:
```markdown
---
description: Python style rules enforced on src/ and tests/
globs: "**/*.py"
---

- Use `pathlib.Path`, never `os.path`.
- ...
```

---

## compile vs install の使い分け

| ユースケース | コマンド |
|---|---|
| `.apm/instructions/` のイテレーション | `apm compile` |
| prompts, skills, agents, hooks, commands, MCP のデプロイ | `apm install` |
| 依存追加・apm_modules/ リフレッシュ | `apm install` |
| デプロイ済みバイトとlockfile一致検証 | `apm audit` |

- `apm install` は内部で compile を実行するため、クリーンチェックアウトでは `apm install` だけで十分
- `apm compile` は instructions のイテレーション時に install の副作用なしで使用する

---

## 検証コマンド

```bash
apm compile --validate           # frontmatter + 構造チェック（書き込みなし）
apm install --dry-run --target cursor  # デプロイプレビュー
apm compile --watch              # 変更時自動再コンパイル
```

---

## 情報源

| ページ | URL | 最終更新 |
|---|---|---|
| Instructions and agents | https://microsoft.github.io/apm/producer/author-primitives/instructions-and-agents/ | Jun 12, 2026 |
| Compile your package | https://microsoft.github.io/apm/producer/compile/ | Jun 12, 2026 |
| Primitives and Targets | https://microsoft.github.io/apm/concepts/primitives-and-targets/ | Jun 12, 2026 |
| Your First Package | https://microsoft.github.io/apm/getting-started/first-package/ | Jun 12, 2026 |

ソースコード参照先（公式ドキュメントの記載による）:
- `src/apm_cli/integration/instruction_integrator.py`
- `src/apm_cli/integration/targets.py`

※ GitHub リポジトリ (github.com/microsoft/apm) は公開されているがソースコードの直接確認は不可（ドキュメントサイトのみ公開）

---

## 補足: よくある落とし穴

1. **applyTo 忘れ**: applyTo なしの instruction はスコープ付きルールにならず、AGENTS.md にフォールディングされる
2. **YAML配列の複数パターン**: APM は最初のパターンのみ使用する。カンマ区切り文字列を推奨
3. **ルールの混在**: 1ファイルに複数トピックを入れない。分割する
4. **グローバル instruction の重複記載**: エージェントはワークスペースのコンパイル済みコンテキストを継承するため、agent body で instruction を再記載しない
