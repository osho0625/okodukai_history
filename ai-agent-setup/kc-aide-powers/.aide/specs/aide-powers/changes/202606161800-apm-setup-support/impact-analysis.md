# 影響範囲分析（Phase 2 — 差分設計確定後の再調査版）

## 変更概要

APM（Agent Package Manager）の targets メカニズムを活用し、`apm install --target {target}` による aide-powers のインストールを5プラットフォーム（Kiro, Claude Code, Copilot, Codex, Gemini）に拡張する。APM が自動配置できる primitives（skills, instructions, hooks）を `targets` セクションで宣言し、APM だけでは配置できないもの（Kiro の agents/steering 等）は `setup-local` で補完する設計。Cursor/OpenCode/Windsurf はブートストラップ設計が未整備のため今回対象外。

---

## 1. シグネチャ変更の全件追跡（Iron Law）

### 1.1 変更されるインターフェース一覧

| # | ファイル | 変更内容 | 種別 |
|---|---|---|---|
| S-1 | `apm.yml` | `scripts` セクション削除 → `targets` セクション新設（YAMLキー構造変更） | 破壊的変更 |
| S-2 | `setup.bat` | 第1引数による非対話モード追加（新インターフェース） | 追加（後方互換） |
| S-3 | `setup.sh` | 第1引数による非対話モード追加（新インターフェース） | 追加（後方互換） |
| S-4 | `setup-local.bat` | 終了処理に `exit /b 0` 追加 | 動作修正（インターフェース不変） |
| S-5 | `setup-local.sh` | 終了処理に `exit 0` 追加 | 動作修正（インターフェース不変） |

### 1.2 呼び出し元追跡テーブル

#### S-1: apm.yml — scripts セクション削除

`scripts` セクション内のスクリプト名（`setup-kiro-win`, `setup-claude-win` 等）を `apm run` 経由で呼び出す箇所。**scripts を削除するため、これらの呼び出し記述は全て無効化される。**

| # | 呼び出し元ファイル | 参照内容 | 影響 |
|---|---|---|---|
| 1 | `README.md` | APMセクションで `apm run setup-*` の手順記載 | **要更新（delta-design §6で対応済み）** |
| 2 | `docs/02-getting-started.md` §7 | `apm run setup-*` の手順記載 | **要更新（delta-design §7で対応済み）** |
| 3 | `.aide/specs/aide-powers/tech-investigation/apm-usecase-analysis.md` | apm.yml scripts の設計調査 | 影響なし（調査ドキュメント、更新不要） |
| 4 | `.aide/specs/aide-powers/tech-investigation/apm-manifest.md` | apm.yml scripts の設計方針 | 影響なし（調査ドキュメント、更新不要） |
| 5 | `.aide/specs/aide-powers/program-structure.md` | apm.yml の説明行 | **要更新（delta-design §11で対応済み）** |

**判定:** delta-design §6, §7, §11 でドキュメント更新が設計済み。追加の漏れなし。

#### S-2: setup.bat — 引数対応（非対話モード）追加


| # | 呼び出し元ファイル | 参照内容 | 影響 |
|---|---|---|---|
| 1 | `README.md` | グローバルインストール手順で `setup.bat` 言及 | 影響なし（引数なし実行＝既存動作維持） |
| 2 | `docs/02-getting-started.md` §3 | `setup.bat` / `setup.sh` の起動手順・メニュー説明 | 影響なし（メニュー構成不変、引数は追加のみ） |
| 3 | `docs/04-faq.md` | `setup.bat` を使った共有方法の案内 | 影響なし |
| 4 | `docs/05-troubleshooting.md` | `setup.bat` 再実行による復旧手順 | 影響なし |
| 5 | `docs-dev/03-how-to/release.md` | リリース時 setup.bat 再実行確認 | 影響なし |
| 6 | `docs-dev/03-how-to/add-phase-skill.md` | setup.bat 再実行で新スキル配布確認 | 影響なし |
| 7 | `docs-dev/03-how-to/add-workflow.md` | setup.bat 再実行確認 | 影響なし |
| 8 | `docs-dev/01-system-platform/06-execution-units.md` §10 | グローバルインストーラ説明 | 影響なし |
| 9 | `docs-dev/01-system-platform/03-platform-bootstrap/*.md` | 各PFのインストール先説明 | 影響なし |
| 10 | `docs-dev/00-overview.md` | セットアップ説明 | 影響なし |
| 11 | `.aide/specs/aide-powers/dev-environment.md` §7 | 動作確認方法 | 影響なし |
| 12 | `.aide/specs/aide-powers/program-structure.md` | setup.bat の配置先説明 | 影響なし |
| 13 | **delta-design §6.4（新規）** | `apm run setup-global-codex-win` → `setup.bat 6` の呼び出し | **新しい呼び出し経路（delta-designで設計済み）** |

**判定:** 引数対応は追加（後方互換）のため既存呼び出し元への影響はなし。delta-design §6.4 で新しい呼び出し経路（`apm run` → `setup.bat {番号}`）が設計済み。

#### S-3: setup.sh — 引数対応（非対話モード）追加

| # | 呼び出し元ファイル | 参照内容 | 影響 |
|---|---|---|---|
| 1 | `README.md` | グローバルインストール手順 `./setup.sh` | 影響なし（引数なし＝既存動作維持） |
| 2 | `docs/02-getting-started.md` §3 | setup.sh の起動手順・メニュー説明 | 影響なし |
| 3 | `docs-dev/03-how-to/release.md` | 再実行確認 | 影響なし |
| 4 | **delta-design §6.4（新規）** | `apm run setup-global-codex-linux` → `setup.sh 7` | **新しい呼び出し経路（delta-designで設計済み）** |
| 5 | **delta-design §6.4（新規）** | `apm run setup-global-gemini-linux` → `setup.sh 6` | **新しい呼び出し経路（delta-designで設計済み）** |

**判定:** S-2 と同様、後方互換の追加。既存ドキュメントへの影響なし。

#### S-4: setup-local.bat — 終了処理修正

| # | 呼び出し元ファイル | 参照内容 | 影響 |
|---|---|---|---|
| 1 | `apm.yml`（現行） | `scripts` で `setup-local.bat . {番号}` を呼び出し | **apm.yml scripts 削除で消滅（S-1で対応）** |
| 2 | `README.md` | `apm_modules\...\setup-local.bat . 1` の手順記載 | **要更新（delta-design §6で対応済み）** |
| 3 | `docs/02-getting-started.md` §5, §7 | ローカルインストール手順 | **§7は要更新（delta-design §7で対応済み）、§5は不変** |
| 4 | `docs/04-faq.md` | チーム共有手順 | 影響なし（引数インターフェース不変） |
| 5 | `docs-dev/03-how-to/release.md` | ローカルインストール動作確認 | 影響なし |
| 6 | `docs-dev/01-system-platform/06-execution-units.md` §11 | ローカルインストーラ説明 | 影響なし |

**判定:** 引数インターフェースは不変（終了処理のみ）。`apm run` 経由での exit code 255 問題が解消される。

#### S-5: setup-local.sh — 終了処理修正

S-4 と対称。呼び出し元は同上の .sh 版パスに読み替え。影響判定も同じ。

---

## 2. Phase 1 からの差分（追加・修正事項）

### 2.1 Phase 1 で「条件付き」だった項目の確定

| Phase 1 の記載 | Phase 2 の確定判断 |
|---|---|
| `.apm/` 新規作成 — 条件付き | **不要と確定**（APM は既存ディレクトリ構造を自動発見する。delta-design §2.2, §8） |
| `setup.bat` / `setup.sh` — 条件付き変更 | **変更確定**（引数対応＝非対話モード追加。delta-design §5） |
| setup-local のメニュー拡張 | **変更しないと確定**（既存4択維持。delta-design §3.1） |
| apm.yml の scripts 拡張 | **scripts 削除と確定**（消費者に露出されないため。delta-design §2.1） |

### 2.2 Phase 1 に含まれていなかった影響箇所

| # | 影響箇所 | Phase 1 の状態 | Phase 2 で追加 |
|---|---|---|---|
| 1 | `program-structure.md` apm.yml 行の更新 | 未記載 | delta-design §11 で更新指示あり |
| 2 | `apm.yml` keywords 拡張（`codex`, `gemini` 追加）| 未記載 | delta-design §2.1 で明示 |
| 3 | delta-design §6.4 の新しい `apm run` → `setup.bat {番号}` 呼び出し経路 | 未記載 | 新規呼び出し経路としてS-2,S-3に記載 |

---

## 3. 変更対象ファイル一覧（確定版）

| # | ファイル | 変更内容 | 種別 |
|---|---|---|---|
| 1 | `apm.yml` | targets セクション新設、scripts セクション削除、keywords 拡張 | 変更 |
| 2 | `setup-local.bat` | 非対話モード終了処理の修正（`exit /b 0` 追加） | 変更 |
| 3 | `setup-local.sh` | 非対話モード終了処理の修正（`exit 0` 追加） | 変更 |
| 4 | `setup.bat` | 引数対応（非対話モード）追加 | 変更 |
| 5 | `setup.sh` | 引数対応（非対話モード）追加 | 変更 |
| 6 | `README.md` | APM セクションのターゲット表拡張・完結可否明記・APM URL 追加・手順再構成 | 変更 |
| 7 | `docs/02-getting-started.md` | §7.2 ターゲット表拡張、§7.3 セットアップ手順再構成 | 変更 |
| 8 | `program-structure.md` | apm.yml 行の説明更新（実装後に実施） | 変更 |

**確定ファイル数: 8件**（Phase 1 の「5件確定+3件条件付き」から「8件確定」に整理）

---

## 4. 既存要件・システム要件との矛盾確認

### 4.1 確認結果

本リポジトリはメタ開発プロジェクトであり `user-requirements.md` / `system-requirements.md` は存在しない（dev-environment.md §14.1 で明記）。代わりに以下を照合源として確認した。

| 照合源 | 確認結果 |
|---|---|
| `dev-environment.md` §4（OS依存と2系統維持） | ✅ 準拠。bat/sh 両方を対称に修正 |
| `dev-environment.md` §5（エンコーディング・改行） | ✅ 準拠。bat=CP932/CRLF, sh=UTF-8/LF の既存ルール維持が前提 |
| `dev-environment.md` §7（動作確認方法） | ✅ 準拠。setup.bat/sh の引数対応追加後も従来の手動テスト方法で検証可能 |
| `dev-environment.md` §8（Git運用ルール） | ✅ 影響なし |
| `dev-environment.md` §13（グローバル環境非汚染） | ✅ 準拠。変更は配布スクリプトのインターフェース改善であり、新たな依存ツールを要求しない |
| `program-structure.md` 配布マッピング表 | ✅ 準拠。各PFの配置先は変更なし。apm.yml 行の説明更新は delta-design §11 で計画済み |

### 4.2 矛盾

**検出されず。**

---

## 5. テスト対象機能の特定

### 5.1 新規テスト対象（直接変更する機能）

| # | テスト対象 | テスト内容 | 対象ファイル |
|---|---|---|---|
| T-1 | apm.yml targets 宣言 | YAML として有効であること。`targets` に5PFが列挙されていること | `apm.yml` |
| T-2 | setup.bat 非対話モード | `setup.bat 1` で Kiro インストールがメニュー表示なしで実行されること | `setup.bat` |
| T-3 | setup.bat 非対話モード（全番号） | `setup.bat {1〜7}` の各番号で対応PFへの配置が正常完了すること | `setup.bat` |
| T-4 | setup.sh 非対話モード | `./setup.sh 1` で同上 | `setup.sh` |
| T-5 | setup.sh 非対話モード（全番号） | `./setup.sh {1〜8}` の各番号で対応PFへの配置が正常完了すること | `setup.sh` |
| T-6 | setup-local.bat 終了処理 | `apm run` 経由で実行した場合に exit code 0 で正常終了すること | `setup-local.bat` |
| T-7 | setup-local.sh 終了処理 | 同上（.sh版） | `setup-local.sh` |
| T-8 | APM E2E: `apm install --target kiro` | skills が正しく配置されること | `apm.yml` + APM |
| T-9 | APM E2E: `apm install --target claude` | skills + agents + rules + hooks が配置されること | `apm.yml` + APM |
| T-10 | APM E2E: `apm install --target copilot` | skills + instructions + agents + hooks が配置されること | `apm.yml` + APM |
| T-11 | APM 補完フロー: Kiro | `apm install` → `apm run setup-kiro-win` で agents + steering が配置完了 | `apm.yml` + `setup-local.bat` |
| T-12 | APM 補完フロー: Codex | `apm run setup-global-codex-win` → `setup.bat 6` でグローバル配置完了 | `setup.bat` |
| T-13 | APM 補完フロー: Gemini | `apm run setup-global-gemini-win` → `setup.bat 5` でグローバル配置完了 | `setup.bat` |
| T-14 | README APM セクション | 5PFのターゲット表・完結可否・手順が正確に記載されていること | `README.md` |
| T-15 | docs §7 APM セクション | README と同等情報が整合して記載されていること | `docs/02-getting-started.md` |

### 5.2 リグレッションテスト対象（影響を受ける既存機能）

| # | テスト対象 | 確認内容 | 対象ファイル |
|---|---|---|---|
| R-1 | setup.bat 対話モード維持 | 引数なしで実行した場合に従来通りメニューが表示されること | `setup.bat` |
| R-2 | setup.sh 対話モード維持 | 同上 | `setup.sh` |
| R-3 | setup-local.bat 既存動作 | 引数付き(`setup-local.bat . 1`)で従来通り Kiro 配置が完了すること | `setup-local.bat` |
| R-4 | setup-local.sh 既存動作 | 同上 | `setup-local.sh` |
| R-5 | setup-local.bat 対話モード | 引数なしで対話メニュー(4択)が従来通り表示されること | `setup-local.bat` |
| R-6 | setup-local.sh 対話モード | 同上 | `setup-local.sh` |
| R-7 | 直接 clone フロー | `git clone` → `setup-local.bat . 1` が従来通り動作すること（APM 経路を使わない） | `setup-local.bat` |
| R-8 | グローバルインストール全PF | `setup.bat` 対話モードで全メニュー番号が従来通り動作すること | `setup.bat` |

---

## 6. 説明対象アクターの特定

| # | アクター | 変更の種別 | 説明が必要な内容 |
|---|---|---|---|
| A-1 | APM 経由の aide-powers 消費者（全PF） | 操作フロー変更 | ①`apm.yml` に `scripts` は含まれなくなった ②ギャップ補完が必要なPFは消費者の `apm.yml` に scripts を追記する方式に変更 |
| A-2 | Codex ユーザー（APM 経由） | 新規操作追加 | `apm install --target codex` + `apm run setup-global-codex-win` の手順 |
| A-3 | Gemini ユーザー（APM 経由） | 新規操作追加 | `apm install --target gemini` + `apm run setup-global-gemini-win` の手順 |
| A-4 | 直接 clone ユーザー | 影響なし | 従来の `setup.bat` / `setup-local.bat` フローは不変。説明不要 |

**説明媒体:** README.md APM セクション + docs/02-getting-started.md §7（delta-design §6, §7 で設計済み）

---

## 7. 起因元ドキュメントフォルダ

```
Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support/
```

---

## 8. 分析サマリ

- delta-design のシグネチャ変更5件について全呼び出し元を Grep 追跡し、Phase 1 の影響分析を更新した
- Phase 1 で「条件付き」だった3件（.apm/, setup.bat/sh, setup-local メニュー拡張）を全て確定判断に更新した
- `user-requirements.md` / `system-requirements.md` は本リポジトリに存在しない（メタ開発）。代替として `dev-environment.md` の各セクションと照合し、矛盾なしを確認した
- テスト対象: 新規15件 + リグレッション8件 = 計23件のテスト観点を特定
- 説明対象アクター: 4種（うち操作フロー変更1種、新規操作追加2種、影響なし1種）
- Phase 1 から追加された影響箇所: `program-structure.md` 更新、`apm.yml` keywords 拡張、新規 `apm run` → `setup.bat {番号}` 呼び出し経路
