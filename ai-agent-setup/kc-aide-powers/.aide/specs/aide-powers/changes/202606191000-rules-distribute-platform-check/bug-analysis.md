# バグ原因分析

## 分析日
2026-06-19

## 現状把握

### 設計書の状態

doc-index.md に登録された設計書:

| ファイル | ステータス |
|---|---|
| dev-environment.md | ✅ 完了 |
| program-structure.md | ✅ 完了 |
| ubiquitous-language.md | ✅ 完了 |
| cross-chapter-review.md | ✅ 完了 |
| docs/01-about.md 〜 05-troubleshooting.md | ✅ 完了 |

- system-requirements.md: 存在しない（メタ開発のためコア4ファイル要件不適用 — dev-environment.md §14）
- user-requirements.md: 存在しない（同上）
- program-structure.md: 存在する（逆引きで作成済み）

### 既存テストの状態
- 総テスト数: N/A（自動テストフレームワーク未導入 — dev-environment.md §7.4）
- パス: N/A
- 失敗: N/A

## 原因分析

### 原因箇所

以下のディレクトリに配置されたファイル群:

| 配置先（誤り） | ファイル名 |
|---|---|
| `steering/` | `aide-powers-global-rules.md`, `aide-powers-phase-skill-rules.md` |
| `rules/` | `aide-powers-global-rules.md`, `aide-powers-phase-skill-rules.md` |
| `instructions/` | `aide-powers-global-rules.instructions.md`, `aide-powers-phase-skill-rules.instructions.md` |
| `instructions/` | `aide-powers-bootstrap.instructions.md`（既存ファイル、APM非認識場所に残存） |

- 問題: APM が認識しない場所にファイルが配置されている

### 原因の説明

APM（Agent Package Manager）は、パッケージのインストラクションファイルを **`.apm/instructions/` ディレクトリからのみ** 検索する（`src/apm_cli/integration/instruction_integrator.py` の `find_instruction_files` メソッド）。APMはこのディレクトリ内の `.instructions.md` ファイルを各ターゲットに自動変換して配布する:

- copilot → `.github/instructions/`
- claude → `.claude/rules/`（Claude Code）
- kiro → `.kiro/steering/`

変更WF（202606191000-rules-distribute-platform-check）の差分設計書（delta-design.md §4）では「`apm.yml` は変更なし（同ディレクトリ追加のためAPMが自動認識）」と記載されているが、**APMはルート直下の `steering/`, `rules/`, `instructions/` ディレクトリを検索対象としない**。設計段階でAPMのファイル検索仕様を誤解しており、`.apm/instructions/` へ配置すべきファイルをルート直下の各プラットフォーム別ディレクトリに配置してしまった。

これにより:
1. 新規追加した6ファイル（global-rules, phase-skill-rules の3プラットフォーム分）がAPM経由で配布されない
2. 既存の `instructions/aide-powers-bootstrap.instructions.md` も `.apm/instructions/` に存在しないため、APMがbootstrapファイルを認識できず配布されない（以前から潜在的に問題があった可能性、または別の経路で配布されていた）

### 技術的な詳細

**APMの検索パス:**
```
.apm/instructions/*.instructions.md
```

**実際の配置場所（APM非認識）:**
```
steering/aide-powers-bootstrap.md              ← setup.bat経由の配布元（非APM）
steering/aide-powers-global-rules.md           ← 変更WFで追加
steering/aide-powers-phase-skill-rules.md      ← 変更WFで追加
rules/aide-powers-bootstrap.md                 ← setup.bat経由の配布元（非APM）
rules/aide-powers-global-rules.md              ← 変更WFで追加
rules/aide-powers-phase-skill-rules.md         ← 変更WFで追加
instructions/aide-powers-bootstrap.instructions.md  ← 既存（setup.bat配布元）
instructions/aide-powers-global-rules.instructions.md  ← 変更WFで追加
instructions/aide-powers-phase-skill-rules.instructions.md  ← 変更WFで追加
```

**APMが期待する配置:**
```
.apm/instructions/aide-powers-bootstrap.instructions.md
.apm/instructions/aide-powers-global-rules.instructions.md
.apm/instructions/aide-powers-phase-skill-rules.instructions.md
```

**補足:** `.apm/` ディレクトリ自体がリポジトリに存在しない（作成されていない）。

## 影響範囲

| 影響対象 | 説明 |
|---|---|
| `apm install --target copilot` | `.github/instructions/` に bootstrap, global-rules, phase-skill-rules が配布されない |
| `apm install --target claude` | `.claude/rules/` に bootstrap, global-rules, phase-skill-rules が配布されない |
| `apm install --target kiro` | `.kiro/steering/` に bootstrap, global-rules, phase-skill-rules が配布されない |
| `apm update` | 同上（全ターゲットでルールファイルが更新されない） |
| APM経由で aide-powers をインストールする全ユーザー | bootstrap が配布されないと aide-powers が起動しない |

影響を受けるファイル一覧:
- `instructions/aide-powers-bootstrap.instructions.md`（APMに認識されない場所）
- `instructions/aide-powers-global-rules.instructions.md`（APMに認識されない場所）
- `instructions/aide-powers-phase-skill-rules.instructions.md`（APMに認識されない場所）
- `steering/aide-powers-global-rules.md`（APMに認識されない場所）
- `steering/aide-powers-phase-skill-rules.md`（APMに認識されない場所）
- `rules/aide-powers-global-rules.md`（APMに認識されない場所）
- `rules/aide-powers-phase-skill-rules.md`（APMに認識されない場所）

## 起因元ドキュメントフォルダ
- パス: `.aide/specs/aide-powers/changes/202606191000-rules-distribute-platform-check/`
- コミットハッシュ: `406f995`
- コミットメッセージ1行目: `feat: rules-distribute プラットフォーム確認スキップ & APM配布ファイル追加`

## テストカバレッジ
- 原因箇所のテスト: なし（自動テスト未導入）
- 影響範囲のテスト: なし
