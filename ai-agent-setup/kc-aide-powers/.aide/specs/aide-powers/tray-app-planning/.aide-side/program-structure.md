# プログラム構成確定: aide-powers タスクトレイ管理アプリ

## 1. 概要

本ドキュメントは、[レイヤードアーキテクチャ設計書](layered-architecture.md)および[オブジェクト設計書群](object-design-domain.md)に基づき、タスクトレイ管理アプリ（Python）の `app/` 配下のディレクトリ・ファイル構成、各ファイルの役割、importルール、`__init__.py` の構成、テストディレクトリ構成を確定する。

### 1.1 設計方針

- [レイヤードアーキテクチャ設計書](layered-architecture.md) §8.3 のディレクトリ構成を基盤とする
- PEP 8 準拠: モジュール名はスネークケース、クラス名はパスカルケース
- 1ファイル1クラスを基本とする（小さな列挙型・例外クラスは集約可）
- 最大フォルダ深度: 4階層（`app/domain/value_objects/plugin_version.py`）
- 1ファイルあたりの行数目安: 200行以下

### 1.2 ルートディレクトリの位置

[開発実行環境定義書](dev-environment.md) §3.1 では `tray-app/` 配下にソースコードを配置する構成が示されている。設計の進行に伴い、ソースコードのルートパッケージは `tray-app/app/` とする。

```
tray-app/                  # タスクトレイ管理アプリのプロジェクトルート
├── app/                   # ソースコードルートパッケージ
├── tests/                 # テストコード
├── requirements.txt       # 依存パッケージ（バージョン固定）
├── requirements-dev.txt   # 開発用依存パッケージ
├── pyinstaller.spec       # PyInstallerビルド設定
└── .venv/                 # 仮想環境（.gitignore対象）
```

---

## 2. フォルダ構成ツリー（全ファイル）

```
tray-app/
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   │
│   │   ├── value_objects/
│   │   │   ├── __init__.py
│   │   │   ├── plugin_version.py
│   │   │   ├── environment_variable.py
│   │   │   ├── environment_variable_collection.py
│   │   │   ├── certificate_path.py
│   │   │   ├── storage_connection.py
│   │   │   ├── install_step.py
│   │   │   ├── install_progress.py
│   │   │   ├── platform_type.py
│   │   │   ├── update_status.py
│   │   │   └── install_step_status.py
│   │   │
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── plugin.py
│   │   │   ├── installed_platform.py
│   │   │   └── registered_project.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── plugin_installation_service.py
│   │   │   ├── update_policy_service.py
│   │   │   └── environment_preset_service.py
│   │   │
│   │   └── repositories/
│   │       ├── __init__.py
│   │       ├── plugin_repository.py
│   │       ├── config_repository.py
│   │       ├── platform_installer.py
│   │       ├── startup_registry.py
│   │       └── development_tool_launcher.py
│   │
│   ├── application/
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   │
│   │   ├── dto/
│   │   │   ├── __init__.py
│   │   │   ├── wizard_state_dto.py
│   │   │   ├── install_progress_dto.py
│   │   │   ├── install_step_dto.py
│   │   │   ├── platform_status_dto.py
│   │   │   ├── registered_project_dto.py
│   │   │   ├── environment_variable_dto.py
│   │   │   └── general_settings_dto.py
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── wizard_service.py
│   │       ├── plugin_management_service.py
│   │       ├── version_monitoring_service.py
│   │       ├── project_launch_service.py
│   │       └── settings_service.py
│   │
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   │
│   │   ├── minio/
│   │   │   ├── __init__.py
│   │   │   └── minio_plugin_repository.py
│   │   │
│   │   ├── filesystem/
│   │   │   ├── __init__.py
│   │   │   ├── filesystem_config_repository.py
│   │   │   └── filesystem_platform_installer.py
│   │   │
│   │   ├── registry/
│   │   │   ├── __init__.py
│   │   │   └── windows_registry_adapter.py
│   │   │
│   │   ├── process/
│   │   │   ├── __init__.py
│   │   │   └── process_launcher.py
│   │   │
│   │   └── testing/
│   │       ├── __init__.py
│   │       ├── in_memory_plugin_repository.py
│   │       ├── in_memory_config_repository.py
│   │       ├── dummy_platform_installer.py
│   │       ├── dummy_startup_registry.py
│   │       └── dummy_development_tool_launcher.py
│   │
│   └── presentation/
│       ├── __init__.py
│       │
│       ├── tray/
│       │   ├── __init__.py
│       │   └── tray_icon.py
│       │
│       ├── web/
│       │   ├── __init__.py
│       │   ├── web_server.py
│       │   ├── api_routes.py
│       │   └── websocket_handler.py
│       │
│       ├── templates/
│       │   ├── base.html
│       │   ├── nav.html
│       │   ├── wizard/
│       │   │   ├── base_wizard.html
│       │   │   ├── welcome.html
│       │   │   ├── platforms.html
│       │   │   ├── certificate.html
│       │   │   ├── storage.html
│       │   │   ├── install.html
│       │   │   └── complete.html
│       │   ├── dashboard.html
│       │   └── settings/
│       │       ├── base_settings.html
│       │       ├── platforms.html
│       │       ├── storage.html
│       │       └── general.html
│       │
│       └── static/
│           ├── css/
│           │   └── style.css
│           ├── js/
│           │   ├── wizard-install.js
│           │   ├── dashboard.js
│           │   └── settings.js
│           └── img/
│               └── aide-powers.ico
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   │
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── value_objects/
│   │   │   ├── __init__.py
│   │   │   ├── test_plugin_version.py
│   │   │   ├── test_environment_variable.py
│   │   │   ├── test_environment_variable_collection.py
│   │   │   ├── test_certificate_path.py
│   │   │   ├── test_storage_connection.py
│   │   │   ├── test_install_step.py
│   │   │   └── test_install_progress.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── test_plugin.py
│   │   │   ├── test_installed_platform.py
│   │   │   └── test_registered_project.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── test_plugin_installation_service.py
│   │       ├── test_update_policy_service.py
│   │       └── test_environment_preset_service.py
│   │
│   ├── application/
│   │   ├── __init__.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── test_wizard_service.py
│   │       ├── test_plugin_management_service.py
│   │       ├── test_version_monitoring_service.py
│   │       ├── test_project_launch_service.py
│   │       └── test_settings_service.py
│   │
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── test_filesystem_config_repository.py
│   │   ├── test_filesystem_platform_installer.py
│   │   ├── test_windows_registry_adapter.py
│   │   └── test_process_launcher.py
│   │
│   └── presentation/
│       ├── __init__.py
│       ├── test_api_routes.py
│       ├── test_websocket_handler.py
│       └── test_web_server.py
│
├── requirements.txt
├── requirements-dev.txt
├── pyinstaller.spec
└── .venv/
```

---

## 3. 各フォルダの役割説明

### 3.1 トップレベル

| フォルダ/ファイル | 役割 |
|---|---|
| `app/` | ソースコードルートパッケージ。4層レイヤードアーキテクチャの全コードを格納する |
| `tests/` | テストコード。`app/` のディレクトリ構造をミラーリングする |
| `requirements.txt` | 本番依存パッケージ（バージョン固定 `==` 指定） |
| `requirements-dev.txt` | 開発用依存パッケージ（pytest, pyinstaller等） |
| `pyinstaller.spec` | PyInstallerビルド設定（単一exe生成用） |
| `.venv/` | Python仮想環境（.gitignore対象） |

### 3.2 app/ 直下

| ファイル | 役割 |
|---|---|
| `__init__.py` | ルートパッケージ初期化（空ファイル） |
| `main.py` | Composition Root。DI組み立て、asyncioイベントループ起動、シャットダウンハンドリング。[プレゼンテーション層設計書](object-design-presentation.md) §7 に準拠 |

### 3.3 app/domain/ — ドメイン層

[ドメイン層オブジェクト設計書](object-design-domain.md) に基づく。

| フォルダ/ファイル | 役割 |
|---|---|
| `domain/` | ドメイン層ルート。ビジネスロジック・ドメインルール・不変条件を格納する。外部ライブラリへの依存なし |
| `domain/exceptions.py` | ドメイン例外クラス群（`DomainError`, `InvalidVersionError`, `InvalidEnvironmentVariableError` 等） |
| `domain/value_objects/` | 値オブジェクト群 |
| `domain/entities/` | エンティティ群（集約ルート） |
| `domain/services/` | ドメインサービス群（単一エンティティに属さないビジネスロジック） |
| `domain/repositories/` | リポジトリインターフェース群（`abc.ABC` による抽象基底クラス） |

### 3.4 app/application/ — アプリケーション層

[アプリケーション層オブジェクト設計書](object-design-application.md) に基づく。

| フォルダ/ファイル | 役割 |
|---|---|
| `application/` | アプリケーション層ルート。ユースケースの実現、ドメインオブジェクトの協調を担う |
| `application/exceptions.py` | アプリケーション例外クラス群（`ApplicationError`, `StorageConnectionError` 等） |
| `application/dto/` | DTO群。Application層とPresentation層の間のデータ受け渡し用 |
| `application/services/` | ユースケースサービス群 |

### 3.5 app/infrastructure/ — インフラストラクチャ層

[インフラストラクチャ層オブジェクト設計書](object-design-infrastructure.md) に基づく。

| フォルダ/ファイル | 役割 |
|---|---|
| `infrastructure/` | インフラ層ルート。ドメイン層リポジトリインターフェースの具象実装を格納する |
| `infrastructure/minio/` | MinIO S3互換ストレージ連携 |
| `infrastructure/filesystem/` | ファイルシステム操作（config.json読み書き、プラグインファイル配置） |
| `infrastructure/registry/` | Windowsレジストリ操作（スタートアップ登録） |
| `infrastructure/process/` | 子プロセス起動（開発ツールランチャー） |
| `infrastructure/testing/` | テスト用ダミー実装群（dry run用）。[レイヤードアーキテクチャ設計書](layered-architecture.md) §8 に準拠 |

### 3.6 app/presentation/ — プレゼンテーション層

[プレゼンテーション層オブジェクト設計書](object-design-presentation.md) に基づく。

| フォルダ/ファイル | 役割 |
|---|---|
| `presentation/` | プレゼンテーション層ルート。ユーザーとのインタラクションを担う |
| `presentation/tray/` | pystrayによるタスクトレイアイコン管理 |
| `presentation/web/` | aiohttpによるHTTPサーバー・REST API・WebSocket |
| `presentation/templates/` | Jinja2テンプレート（HTML）。[GUI設計書](gui-design.md) §9 に準拠 |
| `presentation/static/` | 静的ファイル（CSS/JS/画像）。[GUI設計書](gui-design.md) §9.3 に準拠 |

---

## 4. 各ファイルの役割説明

### 4.1 ドメイン層（app/domain/）

#### 例外クラス

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `exceptions.py` | `DomainError` | ドメイン例外の基底クラス |
| | `InvalidVersionError` | バージョン文字列がセマンティックバージョニング形式でない |
| | `InvalidEnvironmentVariableError` | 環境変数キーが空または不正形式 |
| | `DuplicateEnvironmentVariableError` | 環境変数キーが重複している |
| | `InvalidCertificatePathError` | 証明書パスが空または拡張子が.pemでない |
| | `InvalidStorageConnectionError` | ストレージ接続情報が不正 |
| | `InvalidProjectPathError` | プロジェクトパスが空 |
| | `InstallStepTransitionError` | インストールステップの不正な状態遷移 |
| | `PluginNotInstalledError` | プラグインが未インストール状態で更新を試行 |

#### 値オブジェクト（domain/value_objects/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `plugin_version.py` | `PluginVersion` | セマンティックバージョニング（major.minor.patch）に基づくバージョン表現。比較演算を提供する |
| `environment_variable.py` | `EnvironmentVariable` | 環境変数のキー・値ペア。キーのバリデーションを内包する |
| `environment_variable_collection.py` | `EnvironmentVariableCollection` | 環境変数の集合管理。キー重複禁止ルールを保証する |
| `certificate_path.py` | `CertificatePath` | CA証明書ファイルパスの表現。パス形式検証・拡張子検証を内包する |
| `storage_connection.py` | `StorageConnection` | ストレージ接続情報（エンドポイント・アクセスキー・シークレットキー）の表現 |
| `install_step.py` | `InstallStep`, `InstallStepType` | インストールの各工程を表す値オブジェクトとステップ種別列挙型 |
| `install_progress.py` | `InstallProgress` | インストール全体の進捗状態 |
| `platform_type.py` | `PlatformType` | 対応する8プラットフォームの列挙型 |
| `update_status.py` | `UpdateStatus` | プラットフォームの更新状態を表す列挙型 |
| `install_step_status.py` | `InstallStepStatus` | インストールステップの状態を表す列挙型 |

#### エンティティ（domain/entities/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `plugin.py` | `Plugin` | aide-powersプラグイン本体。バージョン管理・更新状態判定の振る舞いを持つ |
| `installed_platform.py` | `InstalledPlatform` | インストール済みプラットフォーム。現在バージョン・最新バージョン・更新状態を保持する |
| `registered_project.py` | `RegisteredProject` | 登録プロジェクト。パス・最終使用日時を保持し、開発ツール起動の対象となる |

#### ドメインサービス（domain/services/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `plugin_installation_service.py` | `PluginInstallationService` | インストールフローの制御。ステップ生成・進捗計算・リトライ判定 |
| `update_policy_service.py` | `UpdatePolicyService` | 更新可否・更新優先度の判定。全自動更新禁止ルールを含む |
| `environment_preset_service.py` | `EnvironmentPresetService` | 証明書パスに基づくデフォルト環境変数プリセットの生成 |

#### リポジトリインターフェース（domain/repositories/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `plugin_repository.py` | `PluginRepository` | プラグインの取得・保存の抽象インターフェース（`abc.ABC`） |
| `config_repository.py` | `ConfigRepository` | 設定情報の読み込み・保存の抽象インターフェース（`abc.ABC`） |
| `platform_installer.py` | `PlatformInstaller` | プラットフォームへのプラグインファイル配置の抽象インターフェース（`abc.ABC`） |
| `startup_registry.py` | `StartupRegistry` | スタートアップ登録の抽象インターフェース（`abc.ABC`） |
| `development_tool_launcher.py` | `DevelopmentToolLauncher` | 開発ツール起動の抽象インターフェース（`abc.ABC`） |

### 4.2 アプリケーション層（app/application/）

#### 例外クラス

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `exceptions.py` | `ApplicationError` | アプリケーション例外の基底クラス |
| | `StorageConnectionError` | ストレージサーバーへの接続失敗 |
| | `PluginDownloadError` | プラグインパッケージのダウンロード失敗 |
| | `PluginInstallError` | プラグインのインストール失敗 |
| | `PluginUninstallError` | プラグインの削除失敗 |
| | `ConfigLoadError` | 設定ファイルの読み込み失敗 |
| | `ConfigSaveError` | 設定ファイルの保存失敗 |
| | `ToolNotFoundError` | 開発ツールの実行ファイルが見つからない |
| | `ProjectPathNotFoundError` | プロジェクトフォルダが存在しない |
| | `CertificateFileNotFoundError` | 証明書ファイルが存在しない |
| | `UpdateExecutionError` | 更新実行中のエラー |
| | `SetupNotCompletedError` | 初期設定ウィザード未完了 |

#### DTO（application/dto/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `wizard_state_dto.py` | `WizardStateDTO` | ウィザードの現在状態をPresentation層に伝達する |
| `install_progress_dto.py` | `InstallProgressDTO` | インストール・更新の進捗状態をPresentation層に伝達する |
| `install_step_dto.py` | `InstallStepDTO` | 個別インストールステップの状態をPresentation層に伝達する |
| `platform_status_dto.py` | `PlatformStatusDTO` | プラットフォームの状態をPresentation層に伝達する |
| `registered_project_dto.py` | `RegisteredProjectDTO` | 登録プロジェクト情報をPresentation層に伝達する |
| `environment_variable_dto.py` | `EnvironmentVariableDTO` | 環境変数のキー・値ペアをPresentation層に伝達する |
| `general_settings_dto.py` | `GeneralSettingsDTO` | 全般設定の値をPresentation層に伝達する |

#### サービス（application/services/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `wizard_service.py` | `WizardService` | 初期設定ウィザードのフロー制御。ステップ遷移管理、設定値永続化 |
| `plugin_management_service.py` | `PluginManagementService` | プラグインのインストール・削除・一覧取得。進捗管理 |
| `version_monitoring_service.py` | `VersionMonitoringService` | バージョンチェック実行、更新有無判定、更新実行の調整 |
| `project_launch_service.py` | `ProjectLaunchService` | プロジェクト登録・削除・一覧取得、開発ツール起動の調整 |
| `settings_service.py` | `SettingsService` | 設定値の読み込み・保存。環境変数管理、証明書パス管理、一般設定 |

### 4.3 インフラストラクチャ層（app/infrastructure/）

#### MinIO連携（infrastructure/minio/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `minio_plugin_repository.py` | `MinioPluginRepository` | MinIO S3互換ストレージからプラグインパッケージのダウンロード・バージョン情報取得。`PluginRepository` を実装する |

#### ファイルシステム（infrastructure/filesystem/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `filesystem_config_repository.py` | `FileSystemConfigRepository` | `%LOCALAPPDATA%\aide-powers\config.json` の読み書き。`ConfigRepository` を実装する |
| `filesystem_platform_installer.py` | `FileSystemPlatformInstaller` | 各プラットフォームのプラグインディレクトリへのファイル配置・削除。`PlatformInstaller` を実装する |

#### Windowsレジストリ（infrastructure/registry/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `windows_registry_adapter.py` | `WindowsRegistryAdapter` | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` への登録・解除。`StartupRegistry` を実装する |

#### 子プロセス（infrastructure/process/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `process_launcher.py` | `ProcessLauncher` | 環境変数を設定した子プロセスとして開発ツールを起動する。`DevelopmentToolLauncher` を実装する |

#### テスト用ダミー実装（infrastructure/testing/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `in_memory_plugin_repository.py` | `InMemoryPluginRepository` | メモリ上のデータでプラグインリポジトリを再現。`PluginRepository` を実装する |
| `in_memory_config_repository.py` | `InMemoryConfigRepository` | メモリ上のdictで設定値を保持。`ConfigRepository` を実装する |
| `dummy_platform_installer.py` | `DummyPlatformInstaller` | インストール操作をログ出力のみで実行。`PlatformInstaller` を実装する |
| `dummy_startup_registry.py` | `DummyStartupRegistry` | レジストリ操作をスキップし、メモリ上で管理。`StartupRegistry` を実装する |
| `dummy_development_tool_launcher.py` | `DummyDevelopmentToolLauncher` | 子プロセス起動をスキップし、ログ出力のみ。`DevelopmentToolLauncher` を実装する |

### 4.4 プレゼンテーション層（app/presentation/）

#### タスクトレイ（presentation/tray/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `tray_icon.py` | `TrayIcon` | pystrayによるタスクトレイアイコン管理。右クリックメニュー構築、トースト通知、アイコンバッジ更新 |

#### Webサーバー（presentation/web/）

| ファイル | 配置クラス | 役割 |
|---|---|---|
| `web_server.py` | `WebServer` | aiohttpによるHTTPサーバー。静的ファイル配信、ルーティング登録、ポート選択 |
| `api_routes.py` | `APIRoutes` | REST APIルーティング（全30エンドポイント）。リクエストバリデーションとApplication層への委譲 |
| `websocket_handler.py` | `WebSocketHandler` | WebSocket接続管理。インストール進捗・更新進捗のリアルタイム配信 |

#### テンプレート（presentation/templates/）

| ファイル | 役割 |
|---|---|
| `base.html` | 共通ベーステンプレート（`<head>`, CSS読み込み, `<body>` 構造） |
| `nav.html` | ナビゲーションバー部分テンプレート（ダッシュボード・設定画面で共通使用） |
| `wizard/base_wizard.html` | ウィザード共通レイアウト（ステップインジケーター、ナビゲーションボタン） |
| `wizard/welcome.html` | WIZ-01: ようこそ画面 |
| `wizard/platforms.html` | WIZ-02: プラットフォーム選択画面 |
| `wizard/certificate.html` | WIZ-02B: 証明書設定画面 |
| `wizard/storage.html` | WIZ-03: ストレージ接続設定画面 |
| `wizard/install.html` | WIZ-04: インストール確認・実行画面 |
| `wizard/complete.html` | WIZ-05: 完了画面 |
| `dashboard.html` | DASH: ダッシュボード画面 |
| `settings/base_settings.html` | 設定画面共通レイアウト（タブ構造） |
| `settings/platforms.html` | 設定タブ1: プラットフォーム管理 |
| `settings/storage.html` | 設定タブ2: ストレージ設定 |
| `settings/general.html` | 設定タブ3: 全般設定 |

#### 静的ファイル（presentation/static/）

| ファイル | 役割 |
|---|---|
| `css/style.css` | 全画面共通スタイルシート。[GUI設計書](gui-design.md) §2 の配色・タイポグラフィ・レイアウトルールに準拠 |
| `js/wizard-install.js` | WIZ-04: インストール進捗のポーリング、プログレスバー・ステップ一覧のDOM更新 |
| `js/dashboard.js` | DASH: プラットフォーム一覧取得・更新チェック・更新実行・プロジェクト管理のAjax処理 |
| `js/settings.js` | SETTINGS: 接続テスト・設定保存・環境変数テーブル操作のAjax処理 |
| `img/aide-powers.ico` | タスクトレイアイコン（16x16, 32x32, 48x48 の複数サイズを含む .ico ファイル） |

### 4.5 エントリーポイント（app/main.py）

| 配置する関数/処理 | 役割 |
|---|---|
| `main()` | アプリケーションのエントリーポイント。Composition Root として全コンポーネントをDI組み立てする |
| `_create_services(dry_run)` | dry-run判定に基づきリポジトリ具象実装を選択し、Application層サービスを生成する |
| `_periodic_version_check(...)` | 定期バージョンチェックのasyncタスク |
| `_shutdown(...)` | シャットダウン処理（WebServer停止 → TrayIcon停止 → タスクキャンセル） |

---

## 5. importルール（レイヤー間の依存方向の強制）

[レイヤードアーキテクチャ設計書](layered-architecture.md) §5 に基づき、レイヤー間のimportルールを定義する。

### 5.1 依存方向の概要

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain層**: 他のどの層にも依存しない（最も安定した層）
- **Application層**: Domain層のみに依存する
- **Infrastructure層**: Domain層のみに依存する（リポジトリインターフェースを実装）
- **Presentation層**: Application層のみに依存する

### 5.2 許可されるimport

#### Domain層が許可するimport

```python
# Python標準ライブラリのみ
import re
import enum
import abc
from dataclasses import dataclass
from typing import Sequence, Iterator
from datetime import datetime
from pathlib import PurePosixPath, PureWindowsPath  # パス文字列操作のみ（I/Oなし）

# 同一層内の参照
from app.domain.value_objects.plugin_version import PluginVersion
from app.domain.value_objects.platform_type import PlatformType
from app.domain.entities.installed_platform import InstalledPlatform
from app.domain.exceptions import InvalidVersionError
```

#### Application層が許可するimport

```python
# Python標準ライブラリ
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

# Domain層への依存（許可）
from app.domain.entities.plugin import Plugin
from app.domain.entities.installed_platform import InstalledPlatform
from app.domain.entities.registered_project import RegisteredProject
from app.domain.value_objects.plugin_version import PluginVersion
from app.domain.value_objects.environment_variable import EnvironmentVariable
from app.domain.value_objects.environment_variable_collection import EnvironmentVariableCollection
from app.domain.value_objects.certificate_path import CertificatePath
from app.domain.value_objects.storage_connection import StorageConnection
from app.domain.value_objects.platform_type import PlatformType
from app.domain.services.plugin_installation_service import PluginInstallationService
from app.domain.services.update_policy_service import UpdatePolicyService
from app.domain.services.environment_preset_service import EnvironmentPresetService
from app.domain.repositories.plugin_repository import PluginRepository       # インターフェース
from app.domain.repositories.config_repository import ConfigRepository       # インターフェース
from app.domain.repositories.platform_installer import PlatformInstaller     # インターフェース
from app.domain.repositories.startup_registry import StartupRegistry         # インターフェース
from app.domain.repositories.development_tool_launcher import DevelopmentToolLauncher  # インターフェース
from app.domain.exceptions import InvalidVersionError, InvalidCertificatePathError

# 同一層内の参照
from app.application.dto.wizard_state_dto import WizardStateDTO
from app.application.dto.install_progress_dto import InstallProgressDTO
from app.application.exceptions import StorageConnectionError, PluginDownloadError
```

#### Infrastructure層が許可するimport

```python
# Python標準ライブラリ
import json
import os
import logging
import winreg          # Windows専用
import subprocess
import shutil
import zipfile
import io
from pathlib import Path

# 外部ライブラリ（Infrastructure層のみ）
import minio
import urllib3

# Domain層への依存（インターフェース実装のため — 許可）
from app.domain.repositories.plugin_repository import PluginRepository
from app.domain.repositories.config_repository import ConfigRepository
from app.domain.value_objects.plugin_version import PluginVersion
from app.domain.value_objects.storage_connection import StorageConnection
from app.domain.value_objects.certificate_path import CertificatePath
from app.domain.value_objects.environment_variable import EnvironmentVariable
from app.domain.value_objects.environment_variable_collection import EnvironmentVariableCollection
from app.domain.value_objects.platform_type import PlatformType
from app.domain.entities.installed_platform import InstalledPlatform
from app.domain.entities.registered_project import RegisteredProject
from app.domain.exceptions import InvalidVersionError

# 同一層内の参照（同一サブパッケージ内のみ）
# infrastructure/testing/ 内のファイルは infrastructure/ 内の他サブパッケージを参照しない
```

#### Presentation層が許可するimport

```python
# Python標準ライブラリ
import asyncio
import webbrowser
import os
import logging

# 外部ライブラリ（Presentation層のみ）
import pystray
import PIL.Image
import aiohttp
import aiohttp.web
import aiohttp_jinja2
import jinja2

# Application層への依存（許可）
from app.application.services.wizard_service import WizardService
from app.application.services.plugin_management_service import PluginManagementService
from app.application.services.version_monitoring_service import VersionMonitoringService
from app.application.services.project_launch_service import ProjectLaunchService
from app.application.services.settings_service import SettingsService
from app.application.dto.wizard_state_dto import WizardStateDTO
from app.application.dto.install_progress_dto import InstallProgressDTO
from app.application.dto.platform_status_dto import PlatformStatusDTO
from app.application.dto.registered_project_dto import RegisteredProjectDTO
from app.application.dto.general_settings_dto import GeneralSettingsDTO
from app.application.dto.environment_variable_dto import EnvironmentVariableDTO
from app.application.exceptions import ApplicationError, StorageConnectionError

# 同一層内の参照
from app.presentation.web.api_routes import APIRoutes
from app.presentation.web.websocket_handler import WebSocketHandler
from app.presentation.web.web_server import WebServer
```

#### main.py（Composition Root）が許可するimport

```python
# main.py は全層の具象クラスを参照する唯一の場所
# Application層サービス
from app.application.services.wizard_service import WizardService
# ... 他のサービス

# Infrastructure層具象実装（DI注入のため）
from app.infrastructure.minio.minio_plugin_repository import MinioPluginRepository
from app.infrastructure.filesystem.filesystem_config_repository import FileSystemConfigRepository
from app.infrastructure.filesystem.filesystem_platform_installer import FileSystemPlatformInstaller
from app.infrastructure.registry.windows_registry_adapter import WindowsRegistryAdapter
from app.infrastructure.process.process_launcher import ProcessLauncher

# Infrastructure層テスト用ダミー実装（dry-run時）
from app.infrastructure.testing.in_memory_plugin_repository import InMemoryPluginRepository
from app.infrastructure.testing.in_memory_config_repository import InMemoryConfigRepository
# ... 他のダミー実装

# Domain層サービス
from app.domain.services.plugin_installation_service import PluginInstallationService
# ... 他のドメインサービス

# Presentation層コンポーネント
from app.presentation.tray.tray_icon import TrayIcon
from app.presentation.web.web_server import WebServer
from app.presentation.web.api_routes import APIRoutes
from app.presentation.web.websocket_handler import WebSocketHandler
```

### 5.3 禁止されるimport

| 禁止パターン | 理由 |
|---|---|
| `from app.application import ...` を Domain層から | Domain層は他層に依存しない |
| `from app.infrastructure import ...` を Domain層から | Domain層は他層に依存しない |
| `from app.presentation import ...` を Domain層から | Domain層は他層に依存しない |
| `from app.infrastructure import ...` を Application層から | Application層はInfrastructure層の具象に依存しない（DIP） |
| `from app.presentation import ...` を Application層から | Application層はPresentation層に依存しない |
| `from app.domain import ...` を Presentation層から | Presentation層はDomain層を直接操作しない（層スキップ禁止） |
| `from app.infrastructure import ...` を Presentation層から | Presentation層はInfrastructure層に依存しない |
| `from app.application import ...` を Infrastructure層から | Infrastructure層はApplication層に依存しない |
| `from app.presentation import ...` を Infrastructure層から | Infrastructure層はPresentation層に依存しない |

### 5.4 importルール早見表

| import元 ＼ import先 | domain | application | infrastructure | presentation |
|---|---|---|---|---|
| **domain** | ✅ 同一層内 | ❌ | ❌ | ❌ |
| **application** | ✅ | ✅ 同一層内 | ❌ | ❌ |
| **infrastructure** | ✅ | ❌ | ✅ 同一層内 | ❌ |
| **presentation** | ❌ | ✅ | ❌ | ✅ 同一層内 |
| **main.py** | ✅ | ✅ | ✅ | ✅ |

---

## 6. `__init__.py` の構成

### 6.1 方針

- `__init__.py` はパッケージの公開APIを定義する役割を持つ
- 各層のルート `__init__.py` は空ファイルとする（パッケージ認識のみ）
- サブパッケージの `__init__.py` は、そのパッケージの主要クラスを re-export する
- re-export により、利用側は深いパスを意識せずにimportできる

### 6.2 各 `__init__.py` の内容

#### app/__init__.py

```python
# 空ファイル（パッケージ認識のみ）
```

#### app/domain/__init__.py

```python
# 空ファイル（パッケージ認識のみ）
```

#### app/domain/value_objects/__init__.py

```python
from app.domain.value_objects.plugin_version import PluginVersion
from app.domain.value_objects.environment_variable import EnvironmentVariable
from app.domain.value_objects.environment_variable_collection import EnvironmentVariableCollection
from app.domain.value_objects.certificate_path import CertificatePath
from app.domain.value_objects.storage_connection import StorageConnection
from app.domain.value_objects.install_step import InstallStep, InstallStepType
from app.domain.value_objects.install_progress import InstallProgress
from app.domain.value_objects.platform_type import PlatformType
from app.domain.value_objects.update_status import UpdateStatus
from app.domain.value_objects.install_step_status import InstallStepStatus

__all__ = [
    "PluginVersion",
    "EnvironmentVariable",
    "EnvironmentVariableCollection",
    "CertificatePath",
    "StorageConnection",
    "InstallStep",
    "InstallStepType",
    "InstallProgress",
    "PlatformType",
    "UpdateStatus",
    "InstallStepStatus",
]
```

#### app/domain/entities/__init__.py

```python
from app.domain.entities.plugin import Plugin
from app.domain.entities.installed_platform import InstalledPlatform
from app.domain.entities.registered_project import RegisteredProject

__all__ = [
    "Plugin",
    "InstalledPlatform",
    "RegisteredProject",
]
```

#### app/domain/services/__init__.py

```python
from app.domain.services.plugin_installation_service import PluginInstallationService
from app.domain.services.update_policy_service import UpdatePolicyService
from app.domain.services.environment_preset_service import EnvironmentPresetService

__all__ = [
    "PluginInstallationService",
    "UpdatePolicyService",
    "EnvironmentPresetService",
]
```

#### app/domain/repositories/__init__.py

```python
from app.domain.repositories.plugin_repository import PluginRepository
from app.domain.repositories.config_repository import ConfigRepository
from app.domain.repositories.platform_installer import PlatformInstaller
from app.domain.repositories.startup_registry import StartupRegistry
from app.domain.repositories.development_tool_launcher import DevelopmentToolLauncher

__all__ = [
    "PluginRepository",
    "ConfigRepository",
    "PlatformInstaller",
    "StartupRegistry",
    "DevelopmentToolLauncher",
]
```

#### app/application/__init__.py

```python
# 空ファイル（パッケージ認識のみ）
```

#### app/application/dto/__init__.py

```python
from app.application.dto.wizard_state_dto import WizardStateDTO
from app.application.dto.install_progress_dto import InstallProgressDTO
from app.application.dto.install_step_dto import InstallStepDTO
from app.application.dto.platform_status_dto import PlatformStatusDTO
from app.application.dto.registered_project_dto import RegisteredProjectDTO
from app.application.dto.environment_variable_dto import EnvironmentVariableDTO
from app.application.dto.general_settings_dto import GeneralSettingsDTO

__all__ = [
    "WizardStateDTO",
    "InstallProgressDTO",
    "InstallStepDTO",
    "PlatformStatusDTO",
    "RegisteredProjectDTO",
    "EnvironmentVariableDTO",
    "GeneralSettingsDTO",
]
```

#### app/application/services/__init__.py

```python
from app.application.services.wizard_service import WizardService
from app.application.services.plugin_management_service import PluginManagementService
from app.application.services.version_monitoring_service import VersionMonitoringService
from app.application.services.project_launch_service import ProjectLaunchService
from app.application.services.settings_service import SettingsService

__all__ = [
    "WizardService",
    "PluginManagementService",
    "VersionMonitoringService",
    "ProjectLaunchService",
    "SettingsService",
]
```

#### app/infrastructure/__init__.py 〜 各サブパッケージ

```python
# infrastructure/ 配下の各 __init__.py は空ファイルとする
# Infrastructure層の具象クラスは main.py（Composition Root）からのみ直接参照される
# re-export は不要（利用箇所が限定的なため）
```

#### app/presentation/__init__.py 〜 各サブパッケージ

```python
# presentation/ 配下の各 __init__.py は空ファイルとする
# Presentation層のクラスは main.py（Composition Root）からのみ直接参照される
```

---

## 7. テストディレクトリ構成

### 7.1 方針

- テストディレクトリは `app/` のディレクトリ構造をミラーリングする
- テストファイル名は `test_` プレフィックスを付ける（pytest規約）
- テストフレームワーク: `pytest`
- テスト用フィクスチャは `conftest.py` に集約する

### 7.2 テスト分類

| テスト分類 | 対象層 | テスト方式 | 外部依存 |
|---|---|---|---|
| ドメイン層テスト | Domain層 | モック不要の純粋ロジックテスト | なし |
| アプリケーション層テスト | Application層 | ダミー実装（InMemory系/Dummy系）をDI注入 | なし |
| インフラ層テスト | Infrastructure層 | ファイルシステム・レジストリの実操作テスト | ファイルシステム、レジストリ |
| プレゼンテーション層テスト | Presentation層 | aiohttp test client によるAPIテスト | なし（テストサーバー） |

### 7.3 conftest.py の役割

```python
# tests/conftest.py

import pytest
from app.infrastructure.testing.in_memory_plugin_repository import InMemoryPluginRepository
from app.infrastructure.testing.in_memory_config_repository import InMemoryConfigRepository
from app.infrastructure.testing.dummy_platform_installer import DummyPlatformInstaller
from app.infrastructure.testing.dummy_startup_registry import DummyStartupRegistry
from app.infrastructure.testing.dummy_development_tool_launcher import DummyDevelopmentToolLauncher
from app.domain.services.plugin_installation_service import PluginInstallationService
from app.domain.services.update_policy_service import UpdatePolicyService
from app.domain.services.environment_preset_service import EnvironmentPresetService


@pytest.fixture
def plugin_repo():
    """テスト用インメモリプラグインリポジトリ"""
    return InMemoryPluginRepository()


@pytest.fixture
def config_repo():
    """テスト用インメモリ設定リポジトリ"""
    return InMemoryConfigRepository()


@pytest.fixture
def platform_installer():
    """テスト用ダミープラットフォームインストーラー"""
    return DummyPlatformInstaller()


@pytest.fixture
def startup_registry():
    """テスト用ダミースタートアップレジストリ"""
    return DummyStartupRegistry()


@pytest.fixture
def tool_launcher():
    """テスト用ダミー開発ツールランチャー"""
    return DummyDevelopmentToolLauncher()


@pytest.fixture
def plugin_installation_service():
    """ドメインサービス: インストールフロー制御"""
    return PluginInstallationService()


@pytest.fixture
def update_policy_service():
    """ドメインサービス: 更新ポリシー判定"""
    return UpdatePolicyService()


@pytest.fixture
def environment_preset_service():
    """ドメインサービス: 環境変数プリセット生成"""
    return EnvironmentPresetService()
```

### 7.4 テストファイル一覧と対応するソースファイル

| テストファイル | テスト対象 | テスト観点 |
|---|---|---|
| `tests/domain/value_objects/test_plugin_version.py` | `PluginVersion` | パース、比較、等価性、ハッシュ、不正文字列の拒否 |
| `tests/domain/value_objects/test_environment_variable.py` | `EnvironmentVariable` | キーバリデーション、不変性、with_value |
| `tests/domain/value_objects/test_environment_variable_collection.py` | `EnvironmentVariableCollection` | 重複チェック、add/remove/update、to_dict、不変性 |
| `tests/domain/value_objects/test_certificate_path.py` | `CertificatePath` | パス検証、拡張子検証、directoryプロパティ |
| `tests/domain/value_objects/test_storage_connection.py` | `StorageConnection` | URL形式検証、空チェック、等価性 |
| `tests/domain/value_objects/test_install_step.py` | `InstallStep` | 状態遷移（正常・不正）、リトライ、不変性 |
| `tests/domain/value_objects/test_install_progress.py` | `InstallProgress` | 進捗計算、完了判定、エラー判定 |
| `tests/domain/entities/test_plugin.py` | `Plugin` | is_installed、has_update、get_update_status |
| `tests/domain/entities/test_installed_platform.py` | `InstalledPlatform` | has_update、バージョン更新、表示名 |
| `tests/domain/entities/test_registered_project.py` | `RegisteredProject` | パスバリデーション、record_usage、get_folder_name |
| `tests/domain/services/test_plugin_installation_service.py` | `PluginInstallationService` | ステップ生成、進捗計算、リトライ判定、次ステップ取得 |
| `tests/domain/services/test_update_policy_service.py` | `UpdatePolicyService` | 更新可否判定、更新可能一覧、メジャー更新判定 |
| `tests/domain/services/test_environment_preset_service.py` | `EnvironmentPresetService` | プリセット生成（9個の環境変数）、SSL_CERT_DIR |
| `tests/application/services/test_wizard_service.py` | `WizardService` | セットアップ完了判定、プラットフォーム保存、証明書保存+プリセット生成、接続テスト |
| `tests/application/services/test_plugin_management_service.py` | `PluginManagementService` | インストール全ステップ、アンインストール、進捗取得、リトライ |
| `tests/application/services/test_version_monitoring_service.py` | `VersionMonitoringService` | バージョンチェック、更新実行、一括更新 |
| `tests/application/services/test_project_launch_service.py` | `ProjectLaunchService` | プロジェクト登録・解除・起動、重複防止 |
| `tests/application/services/test_settings_service.py` | `SettingsService` | 全般設定保存、環境変数保存、プリセットリセット、スタートアップ連動 |
| `tests/infrastructure/test_filesystem_config_repository.py` | `FileSystemConfigRepository` | 読み書き往復、デフォルト値、不正JSON復旧、アトミック書き込み |
| `tests/infrastructure/test_filesystem_platform_installer.py` | `FileSystemPlatformInstaller` | インストール、アンインストール冪等性、バージョン取得 |
| `tests/infrastructure/test_windows_registry_adapter.py` | `WindowsRegistryAdapter` | 登録・解除・確認、冪等性（Windows環境のみ実行） |
| `tests/infrastructure/test_process_launcher.py` | `ProcessLauncher` | ツール存在確認、環境変数マージ |
| `tests/presentation/test_api_routes.py` | `APIRoutes` | 全30エンドポイントの正常系・異常系、バリデーション、エラーハンドリング |
| `tests/presentation/test_websocket_handler.py` | `WebSocketHandler` | 接続管理、broadcast、close_all |
| `tests/presentation/test_web_server.py` | `WebServer` | ポート選択、ページルーティング、静的ファイル配信 |

---

## 8. 設定ファイル・環境変数の管理方針

### 8.1 設定ファイル

| ファイル | パス | 管理方式 |
|---|---|---|
| `config.json` | `%LOCALAPPDATA%\aide-powers\config.json` | `FileSystemConfigRepository` が読み書き。[インフラ/インターフェース設計書](infra-interface-design.md) §4 のスキーマに準拠 |
| `aide-powers.log` | `%LOCALAPPDATA%\aide-powers\logs\aide-powers.log` | Python標準 `logging` + `RotatingFileHandler`（最大5MB、バックアップ3世代） |

### 8.2 環境変数（アプリケーション動作制御）

| 環境変数 | 用途 | デフォルト値 |
|---|---|---|
| `AIDE_DRY_RUN` | `1` でダミー実装に切り替え | 未設定（本番実装） |
| `AIDE_LOG_LEVEL` | ログレベル切り替え（`DEBUG` / `INFO` / `WARNING` / `ERROR`） | `INFO` |

### 8.3 コマンドライン引数

| 引数 | 用途 |
|---|---|
| `--dry-run` | ダミー実装に切り替え（`AIDE_DRY_RUN=1` と同等） |
| `--port PORT` | aiohttpサーバーのポートを固定指定（デバッグ用） |

---

## 9. ファイル命名規則のまとめ

| 対象 | 規則 | 例 |
|---|---|---|
| パッケージ名（フォルダ名） | 全小文字スネークケース | `value_objects`, `domain`, `infrastructure` |
| モジュール名（ファイル名） | 全小文字スネークケース（PEP 8準拠） | `plugin_version.py`, `wizard_service.py` |
| クラス名 | パスカルケース（PEP 8準拠） | `PluginVersion`, `WizardService` |
| 1ファイル1クラスの場合 | ファイル名 = クラス名のスネークケース変換 | `PluginVersion` → `plugin_version.py` |
| 複数クラスをまとめるファイル | 役割を表すスネークケース名 | `exceptions.py`（複数例外クラス） |
| テストファイル | `test_` プレフィックス + 対象ファイル名 | `test_plugin_version.py` |
| テンプレートファイル | 全小文字、ハイフンまたはアンダースコア区切り | `base_wizard.html`, `welcome.html` |
| 静的ファイル（CSS/JS） | 全小文字、ハイフン区切り | `wizard-install.js`, `style.css` |
| 列挙型・小さな値オブジェクト | 関連するものを1ファイルに集約可 | `install_step.py`（`InstallStep` + `InstallStepType`） |

---

## 10. 依存パッケージ

### 10.1 requirements.txt（本番依存）

```
pystray==0.19.5
Pillow>=10.0.0,<11.0.0
aiohttp>=3.9.0,<4.0.0
aiohttp-jinja2>=1.6,<2.0
jinja2>=3.1.0,<4.0.0
minio>=7.2.0,<8.0.0
```

### 10.2 requirements-dev.txt（開発用依存）

```
-r requirements.txt
pytest>=8.0.0,<9.0.0
pytest-asyncio>=0.23.0,<1.0.0
pytest-aiohttp>=1.0.0,<2.0.0
pyinstaller>=6.13.0,<7.0.0
```

---

## 11. ファイル数サマリ

| カテゴリ | ファイル数 |
|---|---|
| Domain層 Pythonファイル（`__init__.py` 含む） | 22 |
| Application層 Pythonファイル（`__init__.py` 含む） | 17 |
| Infrastructure層 Pythonファイル（`__init__.py` 含む） | 17 |
| Presentation層 Pythonファイル（`__init__.py` 含む） | 7 |
| Presentation層 テンプレート（HTML） | 14 |
| Presentation層 静的ファイル（CSS/JS/画像） | 5 |
| エントリーポイント（main.py + app/__init__.py） | 2 |
| **ソースコード合計** | **84** |
| テストファイル（`__init__.py` + `conftest.py` 含む） | 33 |
| **プロジェクト全体合計（設定ファイル含む）** | **119** |

---

*本文書は[レイヤードアーキテクチャ設計書](layered-architecture.md)、[ドメイン層オブジェクト設計書](object-design-domain.md)、[アプリケーション層オブジェクト設計書](object-design-application.md)、[インフラストラクチャ層オブジェクト設計書](object-design-infrastructure.md)、[プレゼンテーション層オブジェクト設計書](object-design-presentation.md)、[インフラ/インターフェース設計書](infra-interface-design.md)、[GUI設計書](gui-design.md)、[開発実行環境定義書](dev-environment.md)に基づき作成されたプログラム構成確定書です。*
