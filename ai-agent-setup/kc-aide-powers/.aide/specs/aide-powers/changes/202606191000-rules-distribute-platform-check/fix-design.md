# バグ修正差分設計

## 作成日
2026-06-19

## 対象バグ
APM配布ファイルの配置場所が不正（APMが `.apm/instructions/` のみ検索するのに、ルート直下に配置していた）

## 対策種別
根本対策（fix-plan.md より引き継ぎ）

## 設計方針
- APM正式フォーマット（description必須、applyTo: "**"）を厳守
- 既存の setup.bat 配布経路に影響しないよう、setup.bat 配布元ファイルは変更しない
- 1ファイル1トピックの原則（APM推奨）に従い3ファイルに分離

## 修正対象の差分設計

### 変更対象1: `.apm/instructions/aide-powers-bootstrap.instructions.md`（新規作成）

#### before
ファイル不在（`.apm/instructions/` ディレクトリ自体が存在しない）

#### after
`.apm/instructions/aide-powers-bootstrap.instructions.md` を APM 正式フォーマットで作成。

```markdown
---
description: aide-powers bootstrap - activates using-aide-powers skill for all development tasks
applyTo: "**"
---

<!-- [aide-powers:bootstrap] このファイルは APM 配布用ソース。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。
```

#### 変更理由
APMが認識する場所（`.apm/instructions/`）にbootstrapを配置するため。既存の `instructions/aide-powers-bootstrap.instructions.md` は `applyTo: '**'` を持つが `description` フィールドが欠落しており APM 正式フォーマット非準拠。APM 正式フォーマットに修正の上、正式パスに配置する。

---

### 変更対象2: `.apm/instructions/aide-powers-global-rules.instructions.md`（新規作成）

#### before
ファイル不在

#### after
`.apm/instructions/aide-powers-global-rules.instructions.md` を APM 正式フォーマットで作成。
本文ソース: `skills/using-aide-powers/references/global-rules.md` の全文。

```markdown
---
description: aide-powers global rules - coding standards, communication rules, and common skill catalog
applyTo: "**"
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

## aide-powers で開発する

aide-powers は AI Agent によるソフトウェア開発を高度化するドキュメント駆動開発フレームワークである。
ユーザーからソフトウェア開発のリクエストを受けたら、常に `using-aide-powers` (aide-powers skill) を最初に activate し、その指示に従うこと。
開発案件は必ずaide-powersを用いること。ユーザーに手順の省略を進めてはいけない


---

## ユーザへの質問の仕方

（... skills/using-aide-powers/references/global-rules.md の全文がそのまま続く ...）

（※ 以下省略 — 実装時は global-rules.md の全文を front-matter 直後に配置する）
```

#### 変更理由
APM経由で全ターゲットにglobal-rulesを配布するため。本文ソースは `skills/using-aide-powers/references/global-rules.md`（正式な管理元）であり、既存の `instructions/aide-powers-global-rules.instructions.md` と同一内容だが、`description` フィールドを追加してAPM正式フォーマットに準拠させる。

---

### 変更対象3: `.apm/instructions/aide-powers-phase-skill-rules.instructions.md`（新規作成）

#### before
ファイル不在

#### after
`.apm/instructions/aide-powers-phase-skill-rules.instructions.md` を APM 正式フォーマットで作成。
本文ソース: `skills/using-aide-powers/references/phase-skill-rules.md` の全文。

```markdown
---
description: aide-powers phase skill execution rules - mandatory activation, no modification, orchestrator constraints
applyTo: "**"
---

<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->

# AIDE POWERS SKILL実行ルール

aide-powers のフェーズスキル（`fs-*`）および aide-powers の全スキルが守るべき共通ルール。

（... skills/using-aide-powers/references/phase-skill-rules.md の全文がそのまま続く ...）

（※ 以下省略 — 実装時は phase-skill-rules.md の全文を front-matter 直後に配置する）
```

#### 変更理由
APM経由で全ターゲットにphase-skill-rulesを配布するため。本文ソースは `skills/using-aide-powers/references/phase-skill-rules.md`（正式な管理元）であり、`description` フィールドを追加してAPM正式フォーマットに準拠させる。

---

### 変更対象4: `steering/aide-powers-global-rules.md`（削除）

#### before
存在する（変更WFで誤配置）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `steering/`）に配置されたファイル。APM経由の配布には使用されない。`.apm/instructions/` に正式ファイルを配置するため不要。

---

### 変更対象5: `steering/aide-powers-phase-skill-rules.md`（削除）

#### before
存在する（変更WFで誤配置）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `steering/`）に配置されたファイル。同上。

---

### 変更対象6: `rules/aide-powers-global-rules.md`（削除）

#### before
存在する（変更WFで誤配置）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `rules/`）に配置されたファイル。同上。

---

### 変更対象7: `rules/aide-powers-phase-skill-rules.md`（削除）

#### before
存在する（変更WFで誤配置）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `rules/`）に配置されたファイル。同上。

---

### 変更対象8: `instructions/aide-powers-global-rules.instructions.md`（削除）

#### before
存在する（変更WFで誤配置。front-matter に `description` なし）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `instructions/`）に配置されたファイル。`.apm/instructions/` に正式フォーマットで再配置するため不要。

---

### 変更対象9: `instructions/aide-powers-phase-skill-rules.instructions.md`（削除）

#### before
存在する（変更WFで誤配置。front-matter に `description` なし）

#### after
削除

#### 変更理由
APM非認識場所（ルート直下 `instructions/`）に配置されたファイル。同上。

---

## 削除しないファイル（setup.bat / setup.sh 配布元 — 確認済み）

以下のファイルは **削除対象外** である。setup.bat / setup.sh による直接配布に使用されるため変更しない:

| ファイルパス | 用途 |
|---|---|
| `steering/aide-powers-bootstrap.md` | setup.bat → kiro 用 bootstrap 配布元 |
| `rules/aide-powers-bootstrap.md` | setup.bat → claude 用 bootstrap 配布元 |
| `rules/aide-powers-bootstrap.mdc` | setup.bat → cursor 用 bootstrap 配布元 |
| `instructions/aide-powers-bootstrap.instructions.md` | setup.bat → Copilot CLI / VSCode Copilot 用 bootstrap 配布元 |

---

## リグレッションテスト設計

自動テストフレームワーク未導入（dev-environment.md §7.4）のため、手動検証手順を記載する（fix-plan.md のリグレッションテスト方針を引き継ぎ）。

### 検証手順

| # | 検証項目 | 手順 | 期待結果 |
|---|---|---|---|
| 1 | APM compile 検証 | `apm compile --validate` を実行 | エラーなし。3ファイル（bootstrap, global-rules, phase-skill-rules）が認識される |
| 2 | APM install --dry-run（copilot） | `apm install --dry-run --target copilot` | `.github/instructions/` に 3ファイルがデプロイ予定として表示される |
| 3 | APM install --dry-run（kiro） | `apm install --dry-run --target kiro` | `.kiro/steering/` に 3ファイルがデプロイ予定として表示される |
| 4 | APM install --dry-run（claude） | `apm install --dry-run --target claude` | `.claude/rules/` に 3ファイルがデプロイ予定として表示される |
| 5 | setup.bat 動作確認 | setup.bat を実行し kiro を選択 | `steering/aide-powers-bootstrap.md` が正常に配置される（既存配布に影響なし） |
| 6 | 誤配置ファイル不在確認 | `steering/`, `rules/`, `instructions/` を目視確認 | global-rules, phase-skill-rules の6ファイルが存在しないこと。`instructions/aide-powers-bootstrap.instructions.md` は残存していること |
| 7 | description フィールド確認 | `.apm/instructions/` 内の3ファイルの front-matter を目視確認 | 全ファイルに `description` フィールドが存在すること |

### 検証の制約

- APM CLI がインストールされていない環境では手順 1〜4 は実施不可
- その場合、ファイル配置の目視確認（`.apm/instructions/` に3ファイルが存在し、front-matter が正しいこと）で代替する

---

## インターフェース影響サマリ

シグネチャ変更なし（ファイル配置変更のみ）。APM のコンパイル・デプロイ出力は変更されるが、最終的に配布先に届くルール内容は同一。

---

## 更新が必要な設計資料

- **program-structure.md**: (1) `.apm/instructions/` ディレクトリとその配下3ファイルの追加 (2) `steering/` から `aide-powers-global-rules.md`, `aide-powers-phase-skill-rules.md` のツリー記載除去 (3) `rules/` から `aide-powers-global-rules.md`, `aide-powers-phase-skill-rules.md` のツリー記載除去 (4) `instructions/` フォルダのツリー記載は変更なし（`aide-powers-bootstrap.instructions.md` は残存するため）
