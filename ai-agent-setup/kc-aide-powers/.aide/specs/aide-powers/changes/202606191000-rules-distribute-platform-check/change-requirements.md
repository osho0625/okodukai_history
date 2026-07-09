# 変更要件定義: rules-distribute プラットフォーム確認スキップ & APM経由ルール配布ファイル追加

## 変更概要

### 目的・背景

1. **rules-distribute ステップ1のUX改善**: 現在、rules-distribute スキルのステップ1は毎回ユーザーにプラットフォーム確認を行う。しかし `.aide/ai-agent-platform-targets.md` が既に存在する場合は過去に確認済みであり、再確認は不要な手間である。ターゲット変更はユーザーが明示的に依頼した時のみ対応すれば十分。

2. **APM経由でのルール配布ファイル追加**: 現在、リポジトリの `steering/aide-powers-bootstrap.md` をAPM（Agent Package Manager）が認識し、`.kiro/steering/` 等に自動配布している。同じ仕組みを活用し、`global-rules` と `phase-skill-rules` もAPM経由で各プラットフォームに自動配布されるようにする。具体的には `steering/`、`rules/`、`instructions/` に完成形のルールファイルを配置するだけでよい（setup.bat/sh の変更は不要）。

### 変更種別

仕様変更（既存の振る舞いを変更）

---

## 要求事項

### REQ-C-001: プラットフォームターゲットファイル存在時の確認スキップ

| 項目 | 内容 |
|---|---|
| 種別 | 振る舞い変更 |
| 説明 | rules-distribute スキルのステップ1において、`.aide/ai-agent-platform-targets.md` が既に存在する場合はユーザーへのプラットフォーム確認を行わず、既存ファイルの内容をそのまま使用する |
| 受入基準 | 1. `.aide/ai-agent-platform-targets.md` が存在する場合、ユーザーへの質問なしにステップ2に進むこと<br>2. `.aide/ai-agent-platform-targets.md` が存在しない場合は従来通りユーザーに確認すること<br>3. ユーザーから明示的に「ターゲットを変更したい」旨の依頼があった場合のみ、再確認フローを実行すること |
| 優先度 | Must |

### REQ-C-002: ターゲット変更の明示的トリガー

| 項目 | 内容 |
|---|---|
| 種別 | 振る舞い追加 |
| 説明 | ユーザーが明示的にプラットフォームターゲットの変更を依頼した場合にのみ、既存の `.aide/ai-agent-platform-targets.md` を更新する再確認フローを実行する |
| 受入基準 | 1. ユーザーからの明示的な変更指示がない限り、既存ターゲットファイルは変更されないこと<br>2. 変更指示があった場合は従来のステップ1の確認フローが実行されること<br>3. 変更後のターゲットファイルが正しく更新されること |
| 優先度 | Must |

### REQ-C-003: steering/ にKiro用ルール配布ファイルを追加

| 項目 | 内容 |
|---|---|
| 種別 | 機能追加 |
| 説明 | リポジトリの `steering/` ディレクトリに `aide-powers-global-rules.md` と `aide-powers-phase-skill-rules.md` を配置する。APMがこれを認識し、`.kiro/steering/` に自動配布する（既存の `aide-powers-bootstrap.md` と同じ配布パターン） |
| 受入基準 | 1. `steering/aide-powers-global-rules.md` がリポジトリに存在すること<br>2. `steering/aide-powers-phase-skill-rules.md` がリポジトリに存在すること<br>3. APMによる自動配布後、`.kiro/steering/aide-powers-global-rules.md` および `.kiro/steering/aide-powers-phase-skill-rules.md` として利用可能になること<br>4. ファイル内容は rules-distribute スキルの global モードで Kiro 向けに配置されるものと同じ形式であること |
| 優先度 | Must |

### REQ-C-004: rules/ にClaude Code用ルール配布ファイルを追加

| 項目 | 内容 |
|---|---|
| 種別 | 機能追加 |
| 説明 | リポジトリの `rules/` ディレクトリに `aide-powers-global-rules.md` と `aide-powers-phase-skill-rules.md` を配置する。APMがこれを認識し、Claude Code のルール置き場に自動配布する（既存の `aide-powers-bootstrap.md` と同じ配布パターン） |
| 受入基準 | 1. `rules/aide-powers-global-rules.md` がリポジトリに存在すること<br>2. `rules/aide-powers-phase-skill-rules.md` がリポジトリに存在すること<br>3. APMによる自動配布後、Claude Code のルールとして利用可能になること<br>4. ファイル内容は rules-distribute スキルの global モードで Claude Code 向けに配置されるものと同じ形式であること |
| 優先度 | Must |

### REQ-C-005: instructions/ にCopilot用ルール配布ファイルを追加

| 項目 | 内容 |
|---|---|
| 種別 | 機能追加 |
| 説明 | リポジトリの `instructions/` ディレクトリに `aide-powers-global-rules.instructions.md` と `aide-powers-phase-skill-rules.instructions.md` を配置する。APMがこれを認識し、Copilot のインストラクション置き場に自動配布する（既存の `aide-powers-bootstrap.instructions.md` と同じ配布パターン） |
| 受入基準 | 1. `instructions/aide-powers-global-rules.instructions.md` がリポジトリに存在すること<br>2. `instructions/aide-powers-phase-skill-rules.instructions.md` がリポジトリに存在すること<br>3. APMによる自動配布後、Copilot のインストラクションとして利用可能になること<br>4. ファイル内容は rules-distribute スキルの global モードで Copilot 向けに配置されるものと同じ形式であること |
| 優先度 | Must |

### REQ-C-006: 配布ファイルの内容形式

| 項目 | 内容 |
|---|---|
| 種別 | 制約 |
| 説明 | 各配布ファイルの内容は、rules-distribute スキルの global モードで各プラットフォーム向けに配置されるものと同一形式（プラットフォーム固有ヘッダー + マーカーコメント + 正本内容の完成形）とする。正本を変更した際は、これらの配布ファイルも同期更新する必要がある |
| 受入基準 | 1. 各配布ファイルはプラットフォーム固有のヘッダー（Kiro: front-matter無し、Claude Code: マーカーのみ、Copilot: 該当形式）+ 正本内容の完成形であること<br>2. マーカーコメント `<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->` が含まれること<br>3. 正本（`skills/using-aide-powers/references/`）の内容と配布ファイルの正本部分が一致していること |
| 優先度 | Must |

---

## 対象外（スコープ外）

- APM 自体の仕組み変更（APM の配布ロジックやパッケージ定義は変更しない）
- ワークスペース内の rules-distribute の配布ロジック変更（ワークスペースへの配布は既存のまま）
- setup.bat / setup.sh の変更（ルール配布はAPM経由で行うため、setup スクリプトの変更は不要）
- Gemini CLI / Codex / OpenCode のルール配布（これらはリポジトリ直接参照方式またはプロジェクトルート配置のため、APM配布ディレクトリの対象外）
- Cursor のルール配布（Cursor は `rules/` に `.mdc` 形式で配置するためAPM配布パターンが異なる。本変更では対象外）
- ワークスペース内ルールファイルの配置・更新ロジック（rules-distribute スキルのステップ2・3の本体ロジックは変更しない）
- `.aide/references/` へのソース最新化ロジック（using-aide-powers の責務であり変更しない）

---

## 前提条件

- 正本ファイルは `skills/using-aide-powers/references/global-rules.md` および `skills/using-aide-powers/references/phase-skill-rules.md` に存在する
- 各プラットフォームのヘッダーフォーマットは rules-distribute スキル SKILL.md のステップ2で定義済み
- APM は `steering/`、`rules/`、`instructions/` に配置されたファイルを認識し、各プラットフォームの所定ディレクトリに自動配布する（既存の `aide-powers-bootstrap` の配布で実証済み）
- `.aide/ai-agent-platform-targets.md` は rules-distribute の global モード実行時に作成される既存仕様

---

## 関連する既存要件

| ドキュメント | 関連箇所 |
|---|---|
| `skills/rules-distribute/SKILL.md` | ステップ1（プラットフォーム判定）、ステップ2（global モード配布）の既存定義 |
| `program-structure.md` | 配布マッピング表、`steering/` `rules/` `instructions/` の配布先定義 |
| `steering/aide-powers-bootstrap.md` | APM配布パターンの既存実装（Kiro向けブートストラップ） |
| `rules/aide-powers-bootstrap.md` | APM配布パターンの既存実装（Claude Code向けブートストラップ） |
| `instructions/aide-powers-bootstrap.instructions.md` | APM配布パターンの既存実装（Copilot向けブートストラップ） |
| `apm.yml` | APMパッケージ定義（配布対象ディレクトリの認識設定） |
