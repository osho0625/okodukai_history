# バグ修正タスクリスト

## 基本情報

| 項目 | 内容 |
|---|---|
| 対象バグ | APM配布ファイルの配置場所が不正 |
| 対策種別 | 根本対策 |
| fix-design | [fix-design.md](./fix-design.md) |
| タスク総数 | 5（実装4 + 手動検証1） |

---

## タスク一覧

### B-001: `.apm/instructions/aide-powers-bootstrap.instructions.md` 新規作成

| 項目 | 内容 |
|---|---|
| 対象ファイル | `.apm/instructions/aide-powers-bootstrap.instructions.md` |
| 操作 | 新規作成（ディレクトリ `.apm/instructions/` も作成） |
| fix-design 参照 | 変更対象1 |
| 依存先 | なし |
| テスト | 手動検証（B-R-001） |

**実装内容:**
- `.apm/instructions/` ディレクトリを作成
- fix-design.md「変更対象1」の after セクションの内容でファイルを作成
- front-matter に `description` と `applyTo: "**"` が含まれること

---

### B-002: `.apm/instructions/aide-powers-global-rules.instructions.md` 新規作成

| 項目 | 内容 |
|---|---|
| 対象ファイル | `.apm/instructions/aide-powers-global-rules.instructions.md` |
| 操作 | 新規作成 |
| fix-design 参照 | 変更対象2 |
| 依存先 | B-001（ディレクトリ作成） |
| 本文ソース | `skills/using-aide-powers/references/global-rules.md` |
| テスト | 手動検証（B-R-001） |

**実装内容:**
- fix-design.md「変更対象2」の after セクションの front-matter を付与
- 本文は `skills/using-aide-powers/references/global-rules.md` の全文をそのまま配置

---

### B-003: `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` 新規作成

| 項目 | 内容 |
|---|---|
| 対象ファイル | `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` |
| 操作 | 新規作成 |
| fix-design 参照 | 変更対象3 |
| 依存先 | B-001（ディレクトリ作成） |
| 本文ソース | `skills/using-aide-powers/references/phase-skill-rules.md` |
| テスト | 手動検証（B-R-001） |

**実装内容:**
- fix-design.md「変更対象3」の after セクションの front-matter を付与
- 本文は `skills/using-aide-powers/references/phase-skill-rules.md` の全文をそのまま配置

---

### B-004: 誤配置ファイル削除（6件）

| 項目 | 内容 |
|---|---|
| 対象ファイル | 下記6件 |
| 操作 | 削除 |
| fix-design 参照 | 変更対象4〜9 |
| 依存先 | B-001, B-002, B-003（正式パスにファイル作成後に削除） |
| テスト | 手動検証（B-R-001） |

**削除対象:**
1. `steering/aide-powers-global-rules.md`
2. `steering/aide-powers-phase-skill-rules.md`
3. `rules/aide-powers-global-rules.md`
4. `rules/aide-powers-phase-skill-rules.md`
5. `instructions/aide-powers-global-rules.instructions.md`
6. `instructions/aide-powers-phase-skill-rules.instructions.md`

**削除しないファイル（確認済み）:**
- `steering/aide-powers-bootstrap.md` — setup.bat 配布元
- `rules/aide-powers-bootstrap.md` — setup.bat 配布元
- `rules/aide-powers-bootstrap.mdc` — setup.bat 配布元
- `instructions/aide-powers-bootstrap.instructions.md` — setup.bat 配布元

---

### B-R-001: 手動検証

| 項目 | 内容 |
|---|---|
| 操作 | 手動検証（fix-design.md リグレッションテスト設計に準拠） |
| 依存先 | B-001, B-002, B-003, B-004（全タスク完了後） |

**検証項目:**

| # | 検証項目 | 手順 | 期待結果 |
|---|---|---|---|
| 1 | APM compile 検証 | `apm compile --validate` を実行 | エラーなし。3ファイルが認識される |
| 2 | APM install --dry-run（copilot） | `apm install --dry-run --target copilot` | `.github/instructions/` に3ファイルがデプロイ予定 |
| 3 | APM install --dry-run（kiro） | `apm install --dry-run --target kiro` | `.kiro/steering/` に3ファイルがデプロイ予定 |
| 4 | APM install --dry-run（claude） | `apm install --dry-run --target claude` | `.claude/rules/` に3ファイルがデプロイ予定 |
| 5 | setup.bat 動作確認 | setup.bat を実行し kiro を選択 | bootstrap が正常配置（既存配布に影響なし） |
| 6 | 誤配置ファイル不在確認 | `steering/`, `rules/`, `instructions/` を目視確認 | global-rules, phase-skill-rules の6ファイルが不在。bootstrap 系は残存 |
| 7 | description フィールド確認 | `.apm/instructions/` 内の3ファイルの front-matter を目視確認 | 全ファイルに `description` フィールドが存在 |

**検証の制約:**
- APM CLI 未インストール環境では手順1〜4は実施不可。ファイル配置の目視確認で代替する

---

## 実行順序

```
B-001（bootstrap作成 + ディレクトリ作成）
  ↓
B-002（global-rules作成）  ← B-001に依存（ディレクトリ）
B-003（phase-skill-rules作成）  ← B-001に依存（ディレクトリ）
  ↓
B-004（誤配置ファイル削除6件）  ← B-001, B-002, B-003に依存
  ↓
B-R-001（手動検証）  ← 全タスク完了後
```

---

## 備考

- 本タスクリストはソースコードのロジック変更を含まない（Markdownファイルの配置場所修正のみ）
- 自動テストフレームワーク未導入のため、テストコードファイルは作成しない
- program-structure.md の更新は doc-sync フェーズで対応（本タスクリストのスコープ外）
