# 修正計画書 (fix-plan.md)

## 基本情報

| 項目 | 内容 |
|---|---|
| 作成日 | 2026-06-19 |
| 対象バグ | APM配布ファイルの配置場所が不正 |
| 対策種別 | **根本対策** |
| 起因WF | 202606191000-rules-distribute-platform-check |

---

## 修正方針サマリー

APM が認識しないルート直下ディレクトリ（`steering/`, `rules/`, `instructions/`）に配置されたファイルを削除し、APM 正式パス（`.apm/instructions/`）にファイルを配置し直す。

---

## 修正対象一覧

### A. 削除対象（APM非認識場所に誤配置されたファイル）

| # | ファイルパス | 理由 |
|---|---|---|
| A-1 | `steering/aide-powers-global-rules.md` | APM非認識。変更WFで誤配置 |
| A-2 | `steering/aide-powers-phase-skill-rules.md` | APM非認識。変更WFで誤配置 |
| A-3 | `rules/aide-powers-global-rules.md` | APM非認識。変更WFで誤配置 |
| A-4 | `rules/aide-powers-phase-skill-rules.md` | APM非認識。変更WFで誤配置 |
| A-5 | `instructions/aide-powers-global-rules.instructions.md` | APM非認識。変更WFで誤配置 |
| A-6 | `instructions/aide-powers-phase-skill-rules.instructions.md` | APM非認識。変更WFで誤配置 |

### B. 移動対象（既存ファイルをAPM正式パスへ移動）

| # | 現在のパス | 移動先パス | 理由 |
|---|---|---|---|
| B-1 | `instructions/aide-powers-bootstrap.instructions.md` | `.apm/instructions/aide-powers-bootstrap.instructions.md` | 潜在バグ修正。APM正式パスへ移動 |

### C. 新規作成対象（APM正式パスに新規配置）

| # | ファイルパス | 内容ソース |
|---|---|---|
| C-1 | `.apm/instructions/aide-powers-global-rules.instructions.md` | 削除対象 A-5 の内容を APM 正式フォーマットで再配置 |
| C-2 | `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` | 削除対象 A-6 の内容を APM 正式フォーマットで再配置 |

---

## APM 正式フォーマット要件

`.apm/instructions/` 配下のファイルは以下のフォーマットに従う:

```markdown
---
description: （一行の要約 — 必須）
applyTo: "**"
---

（本文: 箇条書きでルールを記述）
```

重要ポイント:
- `description` フィールドは必須
- `applyTo: "**"` で全ファイルに適用（kiro では `inclusion: always` に自動変換）
- APM が各ターゲットへ自動変換して配布する（copilot → `.github/instructions/`, claude → `.claude/rules/`, kiro → `.kiro/steering/`）

---

## 既存ファイルへの影響（変更しない）

以下のファイルは setup.bat 経由の直接配布に使用されるため、削除・変更しない:

| ファイルパス | 用途 |
|---|---|
| `steering/aide-powers-bootstrap.md` | setup.bat → kiro 用 bootstrap 配布元 |
| `rules/aide-powers-bootstrap.md` | setup.bat → claude 用 bootstrap 配布元 |
| `rules/aide-powers-bootstrap.mdc` | setup.bat → cursor 用 bootstrap 配布元 |

これらは APM 経由ではなく setup.bat による直接コピー配布であり、program-structure.md のフォルダ構成ツリーにも正式に定義されている。

---

## 対策種別の判定

| 観点 | 判定 |
|---|---|
| 根本原因への対処か | ✅ APM が認識する正式パスにファイルを配置する |
| 暫定対策か | ❌ ワークアラウンドではない |
| 設計上の問題か | ✅ 変更WFの差分設計で APM 仕様を誤解した設計誤り |
| 再発防止 | `.apm/instructions/` の存在が今後の目印になる |

**判定: 根本対策**

---

## 副作用リスク分析

| リスク | 影響度 | 発生可能性 | 対策 |
|---|---|---|---|
| setup.bat 経由の配布への影響 | 低 | 低 | bootstrap の setup.bat 配布元（`steering/aide-powers-bootstrap.md`, `rules/aide-powers-bootstrap.md`, `rules/aide-powers-bootstrap.mdc`）は削除しない。影響なし |
| `.apm/` ディレクトリ新規作成による git 追跡 | 低 | なし | `.apm/` は APM パッケージの正式ディレクトリであり、git 追跡対象であるべき |
| 既に配布先にある global-rules / phase-skill-rules の重複 | 低 | 中 | `apm install` 実行時に上書きされるため問題なし。配布先での手動配置分（.kiro/steering/ 等）は APM が管理するようになる |
| `instructions/aide-powers-bootstrap.instructions.md` 削除による影響 | 低 | 低 | setup.bat は `instructions/` から直接コピーせず `steering/` や `rules/` から配布する。APM 経由での配布は `.apm/instructions/` から行われるようになるため正常動作 |

---

## リグレッションテスト方針

本プロジェクトは自動テストフレームワーク未導入（dev-environment.md §7.4）のため、手動検証で確認する。

### 検証手順

| # | 検証項目 | 手順 | 期待結果 |
|---|---|---|---|
| 1 | APM compile 検証 | `apm compile --validate` を実行 | エラーなし。3ファイル（bootstrap, global-rules, phase-skill-rules）が認識される |
| 2 | APM install --dry-run（copilot） | `apm install --dry-run --target copilot` | `.github/instructions/` に 3ファイルがデプロイ予定として表示される |
| 3 | APM install --dry-run（kiro） | `apm install --dry-run --target kiro` | `.kiro/steering/` に 3ファイルがデプロイ予定として表示される |
| 4 | APM install --dry-run（claude） | `apm install --dry-run --target claude` | `.claude/rules/` に 3ファイルがデプロイ予定として表示される |
| 5 | setup.bat 動作確認 | setup.bat を実行し kiro を選択 | `~/.kiro/steering/aide-powers-bootstrap.md` が正常に配置される（setup.bat 経由の既存配布に影響なし） |
| 6 | 誤配置ファイル不在確認 | `steering/`, `rules/`, `instructions/` を目視確認 | global-rules, phase-skill-rules のファイルが存在しないこと |

### 検証の制約

- APM CLI がインストールされていない環境では手順 1〜4 は実施不可
- その場合、ファイル配置の目視確認（`.apm/instructions/` に3ファイルが存在し、front-matter が正しいこと）で代替する

---

## 実施順序

1. `.apm/instructions/` ディレクトリを作成
2. `.apm/instructions/aide-powers-bootstrap.instructions.md` を作成（B-1: 既存内容を APM 正式フォーマットで配置）
3. `.apm/instructions/aide-powers-global-rules.instructions.md` を作成（C-1）
4. `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` を作成（C-2）
5. 削除: A-1 〜 A-6（`steering/`, `rules/`, `instructions/` の誤配置ファイル6件）
6. 削除: B-1 元ファイル（`instructions/aide-powers-bootstrap.instructions.md`）
7. リグレッションテスト実施

---

## program-structure.md 更新要否

フォルダ構成ツリーに `.apm/instructions/` が記載されていないため、修正実施後に program-structure.md を更新する必要がある。

追加すべき記載:
```
├── .apm/                             # APM パッケージリソース
│   └── instructions/                 # APM 配布用 instructions ソース
│       ├── aide-powers-bootstrap.instructions.md
│       ├── aide-powers-global-rules.instructions.md
│       └── aide-powers-phase-skill-rules.instructions.md
```

また、`instructions/` フォルダのツリー記載から `aide-powers-bootstrap.instructions.md` を削除し、`steering/` と `rules/` から global-rules / phase-skill-rules を削除する。

---

## 類似不具合の確認結果

| 確認項目 | 結果 |
|---|---|
| 他に APM 非認識場所に配置されたファイルがないか | `instructions/aide-powers-bootstrap.instructions.md` が潜在バグとして該当（本修正で対処済み） |
| `steering/aide-powers-bootstrap.md` は問題か | 問題なし。これは setup.bat 経由の直接配布元であり APM 配布とは別経路 |
| `rules/aide-powers-bootstrap.md` / `.mdc` は問題か | 問題なし。同上（setup.bat 経由） |
