# 影響範囲分析（更新版 — 差分設計完了後の再精査）

## 変更種別
両方（追加 + 変更）

- 追加: `apm.yml` の新規作成（REQ-C-001）
- 変更: `setup-local.bat` / `setup-local.sh` への非対話モード追加（REQ-C-002, REQ-C-003）
- 変更: `README.md` への APM セットアップ手順追記（REQ-C-004）
- 変更: `docs/02-getting-started.md` への APM セットアップ手順追記（REQ-C-005）
- 変更: `program-structure.md` のドキュメント同期（REQ-C-006）

---

## アクター視点の影響

### 影響を受けるユースケース
- UC-1〜UC-8: 新規プロジェクトへの aide-powers セットアップ（Win11/WSL × 各プラットフォーム） — APM 経由の新しいセットアップ経路が追加される
- UC-9/UC-10: aide-powers の更新と反映 — `apm update` + `apm run setup-*` の更新フローが追加される
- UC-11: 他スキルとの一元管理 — APM の dependencies で aide-powers を宣言可能になる
- UC-12/UC-13: アンインストール — `apm uninstall` によるパッケージ除去経路が追加される

### 影響を受けるアクター
- **U1（社内開発者 Win11）** — APM CLI 経由のセットアップ・更新・削除が可能になる。既存の対話式 `setup-local.bat` は後方互換で引き続き使用可能
- **U2（社内開発者 WSL Ubuntu）** — APM CLI 経由のセットアップ・更新・削除が可能になる。既存の対話式 `setup-local.sh` は後方互換で引き続き使用可能

### 説明対象アクター

| アクター | 説明が必要な内容 | 説明方法 |
|---|---|---|
| U1（Win11 開発者） | APM 経由のセットアップ手順（install / run / update / uninstall） | README.md + docs/02-getting-started.md への追記 |
| U2（WSL Ubuntu 開発者） | APM 経由のセットアップ手順（install / run / update / uninstall） | README.md + docs/02-getting-started.md への追記 |
| リリース担当者 | 非対話モードの動作確認が追加された旨 | docs-dev/03-how-to/release.md の既存チェック項目で後方互換確認（追記不要） |

---

## プログラム構成視点の影響

### 変更対象ファイル（直接変更）
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `apm.yml` | 追加 | パッケージメタデータ + OS別×プラットフォーム別 scripts 定義 |
| `setup-local.bat` | 変更 | 第2引数による非対話モード分岐追加 + AGENTS.md 上書き確認の非対話対応 + 末尾 `pause` の非対話スキップ |
| `setup-local.sh` | 変更 | 第2引数による非対話モード分岐追加 + AGENTS.md 上書き確認の非対話対応 |
| `README.md` | 変更 | APM セットアップ手順セクションを追記（「更新方法」の直後、「ローカルインストール」の直前） |
| `docs/02-getting-started.md` | 変更 | APM CLI インストール〜セットアップ〜更新〜削除の詳細手順を追記（新セクション§7）+ 後続セクション番号繰り下げ |
| `.aide/specs/aide-powers/program-structure.md` | 変更 | フォルダ構成ツリーに `apm.yml` 追記、設定ファイル概要テーブルに追記、配布されないファイルテーブルに追記 |


### シグネチャ変更の全件追跡

#### 対象シグネチャ

| ファイル | 変更内容 | 破壊的か |
|---|---|---|
| `setup-local.bat` | 第2引数（オプショナル）を追加 | **非破壊的**（省略時は従来どおり対話モード） |
| `setup-local.sh` | 第2引数（オプショナル）を追加 | **非破壊的**（省略時は従来どおり対話モード） |

#### 呼び出し元の全件追跡結果（grep 全件確認済み）

| # | 参照元ファイル | 参照形式 | 影響 |
|---|---|---|---|
| 1 | `docs/02-getting-started.md` | `setup-local.bat <プロジェクトパス>` / `./setup-local.sh <プロジェクトパス>`（コマンド例） | なし（第2引数未指定のため対話モード維持） |
| 2 | `README.md` | `./setup-local.sh /path/to/your/project`（コマンド例） | なし（第2引数未指定のため対話モード維持） |
| 3 | `docs-dev/03-how-to/release.md` | 動作確認チェックリスト + 更新手順のコマンド例 | なし（後方互換のため既存チェック項目は有効） |
| 4 | `docs-dev/01-system-platform/06-execution-units.md` | ファイル構成ツリー + §11 概要説明 | なし（機能追加のため既存記述は正確なまま） |
| 5 | `docs/04-faq.md` | コマンド例（`./setup-local.sh /path/to/your/project`） | なし（後方互換のため既存記載は有効なまま） |
| 6 | `docs-dev/01-system-platform/00-architecture.md` | インストール方式の比較テーブル | なし（配置先・動作は変わらない） |
| 7 | `docs-dev/01-system-platform/03-platform-bootstrap/opencode.md` | 副作用として AGENTS.md が配置される旨の説明 | なし（動作不変） |
| 8 | `docs-dev/01-system-platform/03-platform-bootstrap/kiro.md` | ローカル配置先テーブル | なし（配置先は変わらない） |
| 9 | `docs-dev/01-system-platform/03-platform-bootstrap/claude-code.md` | ローカル配置先テーブル | なし（配置先は変わらない） |
| 10 | `.aide/specs/aide-powers/dev-environment.md` | §7.3 テスト用ディレクトリ検証の説明、§1 インストーラ一覧 | なし（機能追加のため既存記述は正確なまま） |
| 11 | `.aide/specs/aide-powers/ubiquitous-language.md` | 用語定義（local setup script） | なし（定義内容は後方互換で変わらない） |
| 12 | `apm.yml`（新規） | `setup-local.bat . 1`〜`4` / `./setup-local.sh . 1`〜`4` | 新規呼び出し元（非対話モードを使用） |

**結論:** 全12箇所を確認。既存参照元（#1〜#11）はすべて第2引数を指定していないため後方互換で影響なし。新規呼び出し元（#12: `apm.yml`）のみが非対話モードを使用する。

### 依存関係（変更対象を参照しているファイル — 変更不要だが認識すべきもの）

| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `docs/04-faq.md` | `setup-local.bat` / `setup-local.sh` のコマンド例を記載 | 低（後方互換のため既存記載は有効なまま） |
| `docs-dev/03-how-to/release.md` | `setup-local.bat` / `setup-local.sh` の動作確認チェックリスト | 低（非対話モード追加はリリースチェック項目に影響しない。ただし将来的に非対話モードのテスト追加が望ましい） |
| `docs-dev/01-system-platform/06-execution-units.md` | setup-local の概要説明 | 低（機能追加のため既存記述は正確なまま） |
| `docs-dev/01-system-platform/00-architecture.md` | setup-local の配置先説明 | 低（配置先は変わらない） |
| `docs-dev/01-system-platform/03-platform-bootstrap/kiro.md` | setup-local のローカル配置先表 | 低（配置先は変わらない） |
| `docs-dev/01-system-platform/03-platform-bootstrap/claude-code.md` | setup-local のローカル配置先表 | 低（配置先は変わらない） |
| `docs-dev/01-system-platform/03-platform-bootstrap/opencode.md` | setup-local の副作用説明 | 低（動作は変わらない） |
| `.aide/specs/aide-powers/dev-environment.md` | setup-local をインストーラとして記載 | 低（機能追加のため既存記述は正確なまま。§7.1 の動作確認手順に非対話モードテスト追加は将来の改善事項） |
| `.aide/specs/aide-powers/ubiquitous-language.md` | 用語定義 | 低（定義更新は将来のドキュメント同期で対応。今回スコープ外） |

### 環境変数 `NON_INTERACTIVE` のスコープ

- `setup-local.bat`: `setlocal` 内で `set` されるため、スクリプト終了後に環境を汚染しない
- `setup-local.sh`: シェル変数としてスクリプト内で完結。`export` はしない

---

## 既存要件との矛盾確認

| 確認対象 | 結果 |
|---|---|
| `user-requirements.md` | 存在しない（メタ開発プロジェクトのため — dev-environment.md §14.1） |
| `system-requirements.md` | 存在しない（同上） |
| `dev-environment.md` §4（bat/sh 2系統維持） | 矛盾なし（bat/sh 両方に同等の変更を入れる設計） |
| `dev-environment.md` §5（エンコーディング・改行コード） | 矛盾なし（bat=CP932/CRLF、sh=UTF-8/LF、apm.yml=UTF-8/LF を遵守） |
| `dev-environment.md` §7（手動検証方式） | 矛盾なし（自動テスト未導入、手動テスト項目として整理） |
| `dev-environment.md` §13（グローバル環境非汚染） | 矛盾なし（APM CLI は利用者が個別インストールする前提） |

---

## テスト対象機能の特定

本プロジェクトにはテストフレームワークが存在しないため（dev-environment.md §7.4）、テスト対象は手動テスト項目として特定する。

### 新規テスト（直接変更する機能）

| # | テスト項目 | 対象ファイル | テスト内容 | OS |
|---|---|---|---|---|
| T-1 | 非対話モード — Kiro (Win) | `setup-local.bat` | `setup-local.bat . 1` で対話プロンプトなしに Kiro 配置が完了する | Win |
| T-2 | 非対話モード — Claude Code (Win) | `setup-local.bat` | `setup-local.bat . 2` で対話プロンプトなしに Claude Code 配置が完了する | Win |
| T-3 | 非対話モード — Copilot (Win) | `setup-local.bat` | `setup-local.bat . 3` で対話プロンプトなしに Copilot 配置が完了する | Win |
| T-4 | 非対話モード — 全一括 (Win) | `setup-local.bat` | `setup-local.bat . 4` で対話プロンプトなしに全プラットフォーム配置が完了する | Win |
| T-5 | 非対話モード — Kiro (Linux) | `setup-local.sh` | `./setup-local.sh . 1` で対話プロンプトなしに Kiro 配置が完了する | Linux/WSL |
| T-6 | 非対話モード — Claude Code (Linux) | `setup-local.sh` | `./setup-local.sh . 2` で対話プロンプトなしに Claude Code 配置が完了する | Linux/WSL |
| T-7 | 非対話モード — Copilot (Linux) | `setup-local.sh` | `./setup-local.sh . 3` で対話プロンプトなしに Copilot 配置が完了する | Linux/WSL |
| T-8 | 非対話モード — 全一括 (Linux) | `setup-local.sh` | `./setup-local.sh . 4` で対話プロンプトなしに全プラットフォーム配置が完了する | Linux/WSL |
| T-9 | 非対話モード — AGENTS.md 自動上書き (Win) | `setup-local.bat` | 既存 AGENTS.md がある状態で `setup-local.bat . 1` 実行時、確認プロンプトなしに自動上書きされる | Win |
| T-10 | 非対話モード — AGENTS.md 自動上書き (Linux) | `setup-local.sh` | 既存 AGENTS.md がある状態で `./setup-local.sh . 1` 実行時、確認プロンプトなしに自動上書きされる | Linux/WSL |
| T-11 | 非対話モード — pause スキップ (Win) | `setup-local.bat` | 非対話モード実行時、末尾の `pause` で入力待ちにならずに終了する | Win |
| T-12 | 無効な第2引数 (Win) | `setup-local.bat` | `setup-local.bat . 5` や `setup-local.bat . abc` でエラーメッセージ表示後に終了する | Win |
| T-13 | 無効な第2引数 (Linux) | `setup-local.sh` | `./setup-local.sh . 5` や `./setup-local.sh . abc` でエラーメッセージ表示後に終了する | Linux/WSL |
| T-14 | apm.yml 構文検証 | `apm.yml` | `apm.yml` が有効な YAML であり、`apm run setup-kiro-win` 等のスクリプトが正しく解決される | Win/Linux |
| T-15 | APM 経由セットアップ E2E (Win) | `apm.yml` + `setup-local.bat` | `apm install` → `apm run setup-kiro-win` で Kiro 配置が完了する | Win |
| T-16 | APM 経由セットアップ E2E (Linux) | `apm.yml` + `setup-local.sh` | `apm install` → `apm run setup-kiro-linux` で Kiro 配置が完了する | Linux/WSL |

### リグレッションテスト（変更の影響を受ける既存機能）

| # | テスト項目 | 対象ファイル | テスト内容 | OS |
|---|---|---|---|---|
| R-1 | 対話モード後方互換 (Win) | `setup-local.bat` | `setup-local.bat <パス>` で従来どおり対話メニューが表示される | Win |
| R-2 | 対話モード後方互換 (Linux) | `setup-local.sh` | `./setup-local.sh <パス>` で従来どおり対話メニューが表示される | Linux/WSL |
| R-3 | 対話モード — AGENTS.md 上書き確認 (Win) | `setup-local.bat` | 対話モードで既存 AGENTS.md がある状態で `[y/N]` プロンプトが表示される | Win |
| R-4 | 対話モード — AGENTS.md 上書き確認 (Linux) | `setup-local.sh` | 対話モードで既存 AGENTS.md がある状態で `[y/N]` プロンプトが表示される | Linux/WSL |
| R-5 | 対話モード — pause 維持 (Win) | `setup-local.bat` | 対話モード実行時、末尾で `pause` が機能する | Win |
| R-6 | 対話モード — 全番号選択 (Win) | `setup-local.bat` | 対話モードで 0〜4 の全番号が正常に動作する（既存動作の維持確認） | Win |
| R-7 | 対話モード — 全番号選択 (Linux) | `setup-local.sh` | 対話モードで 0〜4 の全番号が正常に動作する（既存動作の維持確認） | Linux/WSL |
| R-8 | docs/02-getting-started.md セクション番号 | `docs/02-getting-started.md` | 新セクション挿入後、後続セクション（§8, §9）の番号が正しく繰り下がっている | — |

---

## 将来の改善事項（今回スコープ外）

| 項目 | 内容 | 理由 |
|---|---|---|
| `dev-environment.md` §7.1 更新 | 動作確認手順に「非対話モードのテスト」項目を追加 | delta-design のスコープ外として明記済み |
| `docs-dev/03-how-to/release.md` 更新 | リリースチェックリストに非対話モード動作確認を追加 | 既存チェック項目で後方互換は確認可能。非対話固有のチェック追加は将来改善 |
| `ubiquitous-language.md` 更新 | `apm.yml` / `APM` / `非対話モード` の用語追加 | ドキュメント同期は別途実施 |

---

## 起因元ドキュメントフォルダ

- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（変更対象ファイルの直近コミット `ad22f83`, `8c00436`, `c06351c`, `755dbcf`, `53221eb`, `c203a56` のいずれにも `Docs:` フッターは含まれていない）
