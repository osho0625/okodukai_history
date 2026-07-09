# 変更要求定義

## 変更概要
- **変更の目的・背景**: aide-powers を APM（Agent Package Manager）経由でプロジェクトにセットアップできるようにする。現状、aide-powers のセットアップは手動で `setup-local.bat`/`setup-local.sh` を対話的に実行する必要があるが、APM の `apm install` → `apm run` フローに対応させることで、依存管理の一元化と非対話的なセットアップの自動化を実現する。
- **変更種別**: 複合

## 技術調査確認済み事実

以下は技術調査（2026-06-16時点）で確認された事実であり、設計・実装の前提知識として記録する。

- `apm run` はプロジェクトルートの CWD でシェルコマンドを実行する（https://microsoft.github.io/apm/reference/cli/run/ 確認）
- `apm run` の scripts は「literal shell command」として OS のデフォルトシェルで実行される（Win→cmd、Linux→bash）
- APM の Kiro ターゲットは agents 未サポート（2026-06-16時点）→ `apm run` + setup スクリプトで全配置をカバーする方式が必要

## 要求事項

### REQ-C-001: apm.yml の作成
- **種別**: 追加
- **説明**: リポジトリルートに `apm.yml` を新規作成する。パッケージメタデータ（name, version, description, author）と、OS別×プラットフォーム別の scripts を定義する。scripts は Windows（cmd）用と Linux/WSL（bash）用を分離し、各プラットフォーム（Kiro, Claude Code, VSCode Copilot, 全一括）に対応するエントリを持つ。
- **受入基準**:
  - AC-001: `apm.yml` がリポジトリルートに存在する
  - AC-002: `name`, `version`, `description`, `author` フィールドが定義されている
  - AC-003: Windows 用 scripts として `setup-kiro-win`, `setup-claude-win`, `setup-copilot-win`, `setup-all-win` が定義されている
  - AC-004: Linux 用 scripts として `setup-kiro-linux`, `setup-claude-linux`, `setup-copilot-linux`, `setup-all-linux` が定義されている
  - AC-005: 各 scripts が対応する setup-local スクリプトを適切な引数で呼び出す形式である
- **優先度**: 必須

### REQ-C-002: setup-local.bat への非対話モード追加
- **種別**: 変更
- **説明**: `setup-local.bat` に第2引数（プラットフォーム番号: 1=Kiro, 2=Claude Code, 3=VSCode Copilot, 4=全一括）を受け取る非対話モードを追加する。第2引数が指定された場合は対話的な番号入力プロンプトをスキップし、指定されたプラットフォーム番号で直接処理を実行する。第2引数が未指定の場合は従来どおり対話モードで動作する（後方互換性を維持）。
- **受入基準**:
  - AC-001: 第2引数にプラットフォーム番号（1〜4）を指定して実行した場合、対話プロンプトなしでセットアップが完了する
  - AC-002: 第2引数を省略して実行した場合、従来どおり対話的に番号入力を求める（後方互換）
  - AC-003: 無効な第2引数（5以上、0、文字列等）が指定された場合、エラーメッセージを表示して終了する
- **優先度**: 必須

### REQ-C-003: setup-local.sh への非対話モード追加
- **種別**: 変更
- **説明**: `setup-local.sh` に第2引数（プラットフォーム番号: 1=Kiro, 2=Claude Code, 3=VSCode Copilot, 4=全一括）を受け取る非対話モードを追加する。動作仕様は REQ-C-002 と同一（OS差異を除く）。
- **受入基準**:
  - AC-001: 第2引数にプラットフォーム番号（1〜4）を指定して実行した場合、対話プロンプトなしでセットアップが完了する
  - AC-002: 第2引数を省略して実行した場合、従来どおり対話的に番号入力を求める（後方互換）
  - AC-003: 無効な第2引数（5以上、0、文字列等）が指定された場合、エラーメッセージを表示して終了する
- **優先度**: 必須

### REQ-C-004: README.md への APM セットアップ手順追記
- **種別**: 変更
- **説明**: `README.md` に APM 経由でのセットアップ手順セクションを追記する。install（`apm install`）、run（`apm run setup-*`）、update（`apm update` + `apm run setup-*`）、uninstall（`apm uninstall`）の4操作の手順を記載する。
- **受入基準**:
  - AC-001: README.md に APM セットアップ手順のセクションが追加されている
  - AC-002: install 手順（`apm install` コマンド）が記載されている
  - AC-003: run 手順（OS別の `apm run setup-*` コマンド例）が記載されている
  - AC-004: update 手順（`apm update` + `apm run setup-*`）が記載されている
  - AC-005: uninstall 手順（`apm uninstall` + 配置済みファイルの手動削除に関する注記）が記載されている
- **優先度**: 必須

### REQ-C-005: docs/02-getting-started.md への APM セットアップ手順追記
- **種別**: 変更
- **説明**: `docs/02-getting-started.md` に APM 経由でのセットアップ手順セクションを追記する。README.md よりも詳細に、APM CLI のインストール手順（Win11 / WSL Ubuntu）から始まり、install / run / update / uninstall の手順を段階的に説明する。
- **受入基準**:
  - AC-001: docs/02-getting-started.md に APM セットアップ手順のセクションが追加されている
  - AC-002: APM CLI インストール手順が OS 別（Win11: PowerShell / WSL Ubuntu: curl）に記載されている
  - AC-003: `apm install` によるパッケージ取得手順が記載されている
  - AC-004: `apm run setup-*` による OS 別×プラットフォーム別のセットアップ手順が記載されている
  - AC-005: `apm update` + `apm run setup-*` による更新手順が記載されている
  - AC-006: `apm uninstall` によるアンインストール手順と配置済みファイルの手動削除に関する注記が記載されている
- **優先度**: 必須

### REQ-C-006: program-structure.md のドキュメント同期
- **種別**: 変更
- **説明**: `apm.yml` の追加に伴い、`.aide/specs/aide-powers/program-structure.md` のフォルダ構成ツリーに `apm.yml` を追記し、設定ファイル概要テーブルに `apm.yml` のエントリを追加する。
- **受入基準**:
  - AC-001: フォルダ構成ツリー内の適切な位置（ルート直下の設定ファイル群）に `apm.yml` が記載されている
  - AC-002: 設定ファイル概要テーブルに `apm.yml` の用途説明が記載されている
- **優先度**: 必須

## 対象外（スコープ外）
- APM の Kiro agents ネイティブサポート対応（将来 APM が agents を直接配置可能になった場合の移行は今回のスコープ外）
- 消費者側 `apm.yml` のテンプレート作成（aide-powers リポジトリ側の `apm.yml` のみが対象）
- `apm uninstall` 時の配置済みファイル自動削除スクリプトの作成（`apm run` で配置したファイルは APM のロックファイルに記録されないため、手動削除の注記にとどめる）
- APM の dependencies / targets セクション（今回はメタデータ + scripts のみ）
- 他リポジトリ（custom-review-skills 等）への APM 対応

## 前提条件
- aide-powers リポジトリが GitLab（`http://10.110.47.117/takashi/aide-claude`）でホストされている
- `setup-local.bat` と `setup-local.sh` が既にリポジトリルートに存在し、対話モードで正常動作している
- プラットフォーム番号の割り当て: 1=Kiro, 2=Claude Code, 3=VSCode Copilot, 4=全一括

## 関連する既存要件
- `program-structure.md` — フォルダ構成ツリー・設定ファイル概要（REQ-C-006 で同期対象）
- `docs/02-getting-started.md` — 既存のインストール・初期設定ガイド（REQ-C-005 で追記対象）
- `tech-investigation/apm-usecase-analysis.md` — APM ユースケース分析結果（本変更要求の根拠）
