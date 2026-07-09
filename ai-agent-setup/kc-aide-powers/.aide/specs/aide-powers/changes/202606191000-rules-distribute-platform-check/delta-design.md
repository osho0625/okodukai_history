# 差分設計書: rules-distribute プラットフォーム確認スキップ & APM経由ルール配布ファイル追加

## 変更概要

| 項目 | 内容 |
|---|---|
| 対応要求 | REQ-C-001〜REQ-C-006 |
| 変更対象 | `skills/rules-distribute/SKILL.md`（ステップ1） |
| 新規追加 | 6ファイル（`steering/` × 2, `rules/` × 2, `instructions/` × 2） |

---

## 1. SKILL.md ステップ1の変更（REQ-C-001, REQ-C-002）

### before

```markdown
## ステップ1: プラットフォーム判定

ユーザーは複数の AI Agent プラットフォームを利用している可能性がある。
自動で AI Agent のプラットフォームを判別するとともに、正しいか、他に利用しているプラットフォームがないかユーザーに確認すること。

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
```

### after

```markdown
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
```

### 変更のポイント

| # | 変更内容 | 対応要求 |
|---|---|---|
| 1 | ステップ冒頭に「条件分岐: ターゲットファイルの存在チェック」セクションを追加 | REQ-C-001 |
| 2 | 存在する場合のスキップ動作を明記 | REQ-C-001 |
| 3 | 「注記（明示的変更トリガー）」で再確認フローの発動条件を限定 | REQ-C-002 |
| 4 | 従来の確認フローを「確認フロー（ターゲットファイル未存在時 or 明示的変更依頼時）」として残す | REQ-C-001, REQ-C-002 |

---

## 2. 新規配布ファイル6本の設計（REQ-C-003〜REQ-C-006）

### 2.1 共通仕様

| 項目 | 値 |
|---|---|
| マーカーコメント | `<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->` |
| 正本（global-rules） | `skills/using-aide-powers/references/global-rules.md` の全文 |
| 正本（phase-skill-rules） | `skills/using-aide-powers/references/phase-skill-rules.md` の全文 |
| 同期運用 | 正本を更新した際は、これら6本の配布ファイルも同期更新すること |

### 2.2 `steering/aide-powers-global-rules.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-003, REQ-C-006 |
| 配布先 | APM → `.kiro/steering/aide-powers-global-rules.md` |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Kiro 向け: front-matter `inclusion: always` + `[aide-powers:auto-generated]` マーカー + 正本内容） |

**ファイル構成:**

```markdown
---
inclusion: always
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/global-rules.md の全文}
```

### 2.3 `steering/aide-powers-phase-skill-rules.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-003, REQ-C-006 |
| 配布先 | APM → `.kiro/steering/aide-powers-phase-skill-rules.md` |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Kiro 向け: front-matter `inclusion: always` + `[aide-powers:auto-generated]` マーカー + 正本内容） |

**ファイル構成:**

```markdown
---
inclusion: always
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/phase-skill-rules.md の全文}
```

### 2.4 `rules/aide-powers-global-rules.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-004, REQ-C-006 |
| 配布先 | APM → `.claude/rules/aide-powers-global-rules.md` |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Claude Code 向け: `[aide-powers:auto-generated]` マーカー + 正本内容、front-matter なし） |

**ファイル構成:**

```markdown
<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/global-rules.md の全文}
```

### 2.5 `rules/aide-powers-phase-skill-rules.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-004, REQ-C-006 |
| 配布先 | APM → `.claude/rules/aide-powers-phase-skill-rules.md` |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Claude Code 向け: `[aide-powers:auto-generated]` マーカー + 正本内容、front-matter なし） |

**ファイル構成:**

```markdown
<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/phase-skill-rules.md の全文}
```

### 2.6 `instructions/aide-powers-global-rules.instructions.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-005, REQ-C-006 |
| 配布先 | APM → Copilot インストラクション |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Copilot 向け: front-matter `applyTo: '**'` + `[aide-powers:auto-generated]` マーカー + 正本内容） |

**ファイル構成:**

```markdown
---
applyTo: '**'
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/global-rules.md の全文}
```

### 2.7 `instructions/aide-powers-phase-skill-rules.instructions.md`（新規）

| 項目 | 値 |
|---|---|
| 対応要求 | REQ-C-005, REQ-C-006 |
| 配布先 | APM → Copilot インストラクション |
| 形式パターン | SKILL.md ステップ2 global モード定義に準拠（Copilot 向け: front-matter `applyTo: '**'` + `[aide-powers:auto-generated]` マーカー + 正本内容） |

**ファイル構成:**

```markdown
---
applyTo: '**'
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

{skills/using-aide-powers/references/phase-skill-rules.md の全文}
```

---

## 3. 配布ファイル同期運用の注記追加

### 追加先

`skills/rules-distribute/SKILL.md` の末尾（最終ステップの後）に以下の注記セクションを追加する。

### 追加内容

```markdown
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
```

---

## 4. 既存ファイルへの影響なし確認

| ファイル | 影響 |
|---|---|
| `skills/rules-distribute/SKILL.md` ステップ2/3 | 変更なし |
| `steering/aide-powers-bootstrap.md` | 変更なし（既存のまま残る） |
| `rules/aide-powers-bootstrap.md` | 変更なし |
| `instructions/aide-powers-bootstrap.instructions.md` | 変更なし |
| `apm.yml` | 変更なし（同ディレクトリ追加のためAPMが自動認識） |
| `setup.bat` / `setup.sh` | 変更なし |

---

## 5. 要求トレーサビリティ

| 要求 | 設計箇所 | 検証方法 |
|---|---|---|
| REQ-C-001 | §1 条件分岐（存在時スキップ） | `.aide/ai-agent-platform-targets.md` 存在時にステップ1の質問が出ないこと |
| REQ-C-002 | §1 注記（明示的変更トリガー） | ユーザーが明示依頼した場合のみ再確認フローが動作すること |
| REQ-C-003 | §2.2, §2.3 | `steering/` に2ファイルが存在し、front-matter `inclusion: always` + マーカー + 正本内容であること |
| REQ-C-004 | §2.4, §2.5 | `rules/` に2ファイルが存在し、マーカー + 正本内容であること |
| REQ-C-005 | §2.6, §2.7 | `instructions/` に2ファイルが存在し、front-matter `applyTo: '**'` + マーカー + 正本内容であること |
| REQ-C-006 | §2.1（共通仕様） | 全6ファイルがプラットフォーム固有ヘッダー + マーカー + 正本内容の構成であること |
