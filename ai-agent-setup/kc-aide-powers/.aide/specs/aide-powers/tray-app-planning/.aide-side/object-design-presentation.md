# プレゼンテーション層オブジェクト設計: aide-powers タスクトレイ管理アプリ

## 1. 設計方針

### 1.1 Presentation層の責務

Presentation層はユーザーとのインタラクション（UI表示・入力受付・通知）を担う。具体的には以下の責務を持つ:

- **タスクトレイ管理**: pystrayによるシステムトレイアイコン、右クリックメニュー、トースト通知
- **HTTPサーバー**: aiohttpによるREST APIエンドポイント、静的ファイル配信
- **WebSocket通信**: インストール進捗・更新進捗のリアルタイム配信
- **ブラウザUI**: HTML/CSS/JSによるウィザード・ダッシュボード・設定画面

### 1.2 禁止事項

| # | 禁止事項 | 理由 |
|---|---|---|
| 1 | ビジネスロジックの実装 | バージョン比較、更新ポリシー判定、環境変数バリデーション等はApplication層経由でDomain層に委譲する |
| 2 | Infrastructure層への直接アクセス | MinIO接続、ファイルシステム操作、レジストリ操作等はApplication層経由で行う |
| 3 | ドメインオブジェクトの直接操作 | PluginVersion, EnvironmentVariable等のドメインオブジェクトを直接生成・操作しない。Application層のDTOを使用する |
| 4 | 設定ファイルの直接読み書き | config.jsonの操作はApplication層のSettingsService経由で行う |

### 1.3 Application層との連携方式

- Presentation層はApplication層の5つのサービス（WizardService, PluginManagementService, VersionMonitoringService, ProjectLaunchService, SettingsService）を呼び出す
- Application層からはDTO（WizardStateDTO, InstallProgressDTO, PlatformStatusDTO, RegisteredProjectDTO, EnvironmentVariableDTO, GeneralSettingsDTO）を受け取り、JSON/HTMLに変換して表示する
- Application層の例外（ApplicationError系）をキャッチし、HTTPステータスコードとエラーメッセージに変換する

### 1.4 非同期統合方式（pystray + aiohttp）

pystrayはスレッドベースで動作し、aiohttpはasyncioイベントループで動作する。両者を統合するため以下の方式を採用する:

- **メインスレッド**: asyncioイベントループ（aiohttpサーバー）を実行する
- **pystrayスレッド**: pystrayのアイコン管理を別スレッドで実行する（`icon.run_detached()`）
- **スレッド間通信**: pystrayのメニューアクションからasyncioイベントループにコルーチンを投入する（`asyncio.run_coroutine_threadsafe()`）
- **シャットダウン**: pystrayの「終了」メニューからasyncioイベントループを停止し、全体を終了する

### 1.5 セキュリティ方針

- aiohttpサーバーは `127.0.0.1` のみにバインド（外部ネットワークからのアクセス不可）
- ポートはランダムな高ポート（49152〜65534）を使用し、競合時は順次試行
- CORS設定は不要（同一オリジンのみ）

---

## 2. TrayIcon の詳細設計

### 2.1 概要

| 項目 | 内容 |
|---|---|
| 役割 | pystrayによるタスクトレイアイコン管理。右クリックメニュー構築、トースト通知、アイコンバッジ更新を行う |
| 使用する外部技術 | `pystray`（タスクトレイ）, `Pillow`（アイコン画像・バッジ描画）, `webbrowser`（ブラウザ起動） |
| 配置先 | `app/presentation/tray/tray_icon.py` |

### 2.2 依存先

| 依存先 | 用途 |
|---|---|
| `WizardService` | 初期設定完了判定（`is_setup_completed()`） |
| `VersionMonitoringService` | 更新確認・更新実行 |
| `ProjectLaunchService` | プロジェクト一覧取得・プロジェクト起動・プロジェクト登録 |
| `WebServer` | ブラウザUIのURL取得（`get_url()`） |

### 2.3 コンストラクタ

```python
def __init__(
    self,
    wizard_service: WizardService,
    version_monitoring_service: VersionMonitoringService,
    project_launch_service: ProjectLaunchService,
    web_server: WebServer,
    icon_path: str,
    loop: asyncio.AbstractEventLoop,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `wizard_service` | `WizardService` | 初期設定ウィザードサービス |
| `version_monitoring_service` | `VersionMonitoringService` | バージョン監視サービス |
| `project_launch_service` | `ProjectLaunchService` | プロジェクト起動サービス |
| `web_server` | `WebServer` | WebServerインスタンス（URL取得用） |
| `icon_path` | `str` | タスクトレイアイコンファイル（.ico）のパス |
| `loop` | `asyncio.AbstractEventLoop` | メインスレッドのasyncioイベントループ（スレッド間通信用） |

### 2.4 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_icon` | `pystray.Icon` | pystrayアイコンインスタンス |
| `_base_image` | `PIL.Image.Image` | 通常状態のアイコン画像 |
| `_badge_image` | `PIL.Image.Image` | 更新ありバッジ付きアイコン画像 |
| `_has_update` | `bool` | 更新があるかどうかのフラグ |
| `_loop` | `asyncio.AbstractEventLoop` | メインスレッドのイベントループ参照 |

### 2.5 パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `start()` | — | `None` | pystrayアイコンを別スレッドで起動する（`icon.run_detached()`） |
| `stop()` | — | `None` | pystrayアイコンを停止する（`icon.stop()`） |
| `update_badge(has_update)` | `has_update: bool` | `None` | アイコンのバッジ表示を更新する。True: バッジ付きアイコン + ツールチップ変更、False: 通常アイコン |
| `show_notification(title, message)` | `title: str, message: str` | `None` | トースト通知を表示する（`icon.notify()`） |

### 2.6 メニュー構成

gui-design.md TRAY-MENU仕様に準拠する。

```python
def _build_menu(self) -> pystray.Menu:
    return pystray.Menu(
        pystray.MenuItem("設定画面を開く", self._on_open_dashboard, default=True),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("プロジェクトを開く", pystray.Menu(
            *self._build_project_menu_items(),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("プロジェクトを追加...", self._on_add_project),
        )),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("更新を確認", self._on_check_updates),
        pystray.MenuItem("更新を実行", self._on_execute_update, enabled=self._has_update),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("ログを開く", self._on_open_log),
        pystray.MenuItem("aide-powers について", self._on_about),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("終了", self._on_quit),
    )
```

### 2.7 メニューアクションハンドラ（内部メソッド）

| メソッド | 概要 | Application層呼び出し |
|---|---|---|
| `_on_open_dashboard()` | ブラウザでダッシュボード（またはウィザード）を開く | `wizard_service.is_setup_completed()` で判定し、`webbrowser.open(url)` |
| `_on_add_project()` | フォルダ選択ダイアログ → プロジェクト登録 | `project_launch_service.register_project(path)` |
| `_on_open_project(path)` | 環境変数設定 + 開発ツール起動 | `project_launch_service.launch_project(path)` |
| `_on_check_updates()` | バージョンチェック → トースト通知 | `version_monitoring_service.check_for_updates()` |
| `_on_execute_update()` | 全プラットフォーム更新 → トースト通知 | `version_monitoring_service.update_all_platforms()` |
| `_on_open_log()` | ログファイルをテキストエディタで開く | `os.startfile(log_path)` |
| `_on_about()` | バージョン情報をトースト通知で表示 | — |
| `_on_quit()` | アプリケーション全体を終了する | `web_server.stop()` → `icon.stop()` |

### 2.8 スレッド間通信

pystrayのメニューアクションは別スレッドで実行されるため、Application層の非同期メソッドを呼び出す際は `asyncio.run_coroutine_threadsafe()` を使用する。

```python
def _on_check_updates(self) -> None:
    future = asyncio.run_coroutine_threadsafe(
        self._async_check_updates(), self._loop
    )
    future.result(timeout=30)

async def _async_check_updates(self) -> None:
    try:
        platforms = await self._version_monitoring_service.check_for_updates()
        has_update = any(p.has_update for p in platforms)
        self.update_badge(has_update)
        if has_update:
            self.show_notification("aide-powers 更新通知", "新しいバージョンが利用可能です。")
        else:
            self.show_notification("aide-powers", "すべてのプラグインは最新です。")
    except StorageConnectionError:
        self.show_notification("aide-powers 警告", "ストレージサーバーに接続できません。")
```

### 2.9 アイコンバッジの動的生成

Pillowを使用してアイコン画像にバッジ（小さな赤丸）を重ねて描画する。

```
1. _base_image をコピー
2. ImageDraw で右下に赤い丸（半径4px）を描画
3. _badge_image として保持
4. update_badge(True) 時に icon.icon = _badge_image に差し替え
5. update_badge(False) 時に icon.icon = _base_image に戻す
```

### 2.10 トースト通知一覧

gui-design.md §3.5 に準拠する。

| トリガー | タイトル | メッセージ例 |
|---|---|---|
| 新バージョン検知（定期チェック） | aide-powers 更新通知 | `新しいバージョン (v1.2.3) が利用可能です。右クリックメニューから更新を実行できます。` |
| 更新確認（手動）— 更新あり | aide-powers 更新通知 | `新しいバージョン (v1.2.3) が利用可能です。` |
| 更新確認（手動）— 最新 | aide-powers | `すべてのプラグインは最新です。` |
| 更新完了 | aide-powers | `更新が完了しました (v1.2.3)。` |
| 更新失敗 | aide-powers エラー | `更新に失敗しました。ログを確認してください。` |
| MinIO接続失敗 | aide-powers 警告 | `ストレージサーバーに接続できません。オフラインモードで動作します。` |

### 2.11 テスト観点

- メニュー構成が gui-design.md §3.3 に準拠していること
- `_on_open_dashboard` が初期設定状態に応じて正しいURLを開くこと
- `update_badge(True)` でバッジ付きアイコンに切り替わること
- `update_badge(False)` で通常アイコンに戻ること
- スレッド間通信（`asyncio.run_coroutine_threadsafe`）が正しく動作すること
- 「更新を実行」メニューが `_has_update=False` 時にグレーアウトされること
- プロジェクト一覧サブメニューが動的に生成されること
- 各トースト通知が正しいタイトル・メッセージで表示されること

---

## 3. WebServer の詳細設計

### 3.1 概要

| 項目 | 内容 |
|---|---|
| 役割 | aiohttpによるHTTPサーバー。静的ファイル配信、REST APIエンドポイント、WebSocket接続管理を統合する |
| 使用する外部技術 | `aiohttp`（HTTPサーバー）, `aiohttp_jinja2`（テンプレートエンジン）, `jinja2`（テンプレート） |
| 配置先 | `app/presentation/web/web_server.py` |

### 3.2 依存先

| 依存先 | 用途 |
|---|---|
| `APIRoutes` | REST APIルーティングの登録 |
| `WebSocketHandler` | WebSocket接続管理 |

### 3.3 コンストラクタ

```python
def __init__(
    self,
    api_routes: APIRoutes,
    websocket_handler: WebSocketHandler,
    static_dir: str,
    template_dir: str,
    host: str = "127.0.0.1",
    port_range: tuple[int, int] = (49152, 65534),
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `api_routes` | `APIRoutes` | REST APIルーティングインスタンス |
| `websocket_handler` | `WebSocketHandler` | WebSocket接続管理インスタンス |
| `static_dir` | `str` | 静的ファイル（CSS/JS/画像）のディレクトリパス |
| `template_dir` | `str` | Jinja2テンプレートのディレクトリパス |
| `host` | `str` | バインドするホスト（デフォルト: `127.0.0.1`） |
| `port_range` | `tuple[int, int]` | 使用するポート範囲（デフォルト: 49152〜65534） |

### 3.4 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_app` | `aiohttp.web.Application` | aiohttpアプリケーションインスタンス |
| `_runner` | `aiohttp.web.AppRunner` or `None` | アプリケーションランナー |
| `_site` | `aiohttp.web.TCPSite` or `None` | TCPサイト |
| `_host` | `str` | バインドホスト |
| `_port` | `int` or `None` | 実際にバインドされたポート番号 |
| `_port_range` | `tuple[int, int]` | ポート範囲 |

### 3.5 パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `start()` | — | `None` | aiohttpサーバーを起動する。ポート範囲内で空きポートを順次試行する |
| `stop()` | — | `None` | aiohttpサーバーを停止する。全WebSocket接続をクローズし、ランナーをクリーンアップする |
| `get_url()` | — | `str` | 現在のサーバーURL（`http://127.0.0.1:{port}`）を返す |
| `get_port()` | — | `int` | 現在バインドされているポート番号を返す |

### 3.6 初期化処理

```
1. aiohttp.web.Application() を生成
2. aiohttp_jinja2 でJinja2テンプレートローダーを設定
3. api_routes.register_routes(app) でREST APIルートを登録
4. websocket_handler.register_routes(app) でWebSocketルートを登録
5. aiohttp.web.static("/static", static_dir) で静的ファイル配信を登録
6. ページルート（/, /wizard/*, /dashboard, /settings/*）を登録
```

### 3.7 ポート選択ロジック

```
1. port_range の開始ポートからランダムにポートを選択
2. TCPSite(runner, host, port) でバインドを試行
3. OSError（ポート使用中）の場合、次のランダムポートを試行
4. 最大10回試行し、すべて失敗した場合は RuntimeError をスロー
5. 成功したポートを _port に記録
```

### 3.8 ページルーティング（HTMLページ配信）

| URL | テンプレート | 説明 |
|---|---|---|
| `/` | — | `setup_completed` に応じてリダイレクト |
| `/wizard/welcome` | `wizard/welcome.html` | WIZ-01: ようこそ |
| `/wizard/platforms` | `wizard/platforms.html` | WIZ-02: プラットフォーム選択 |
| `/wizard/certificate` | `wizard/certificate.html` | WIZ-02B: 証明書設定 |
| `/wizard/storage` | `wizard/storage.html` | WIZ-03: ストレージ接続設定 |
| `/wizard/install` | `wizard/install.html` | WIZ-04: インストール確認・実行 |
| `/wizard/complete` | `wizard/complete.html` | WIZ-05: 完了 |
| `/dashboard` | `dashboard.html` | DASH: ダッシュボード |
| `/settings` | — | `/settings/platforms` にリダイレクト |
| `/settings/platforms` | `settings/platforms.html` | 設定: プラットフォームタブ |
| `/settings/storage` | `settings/storage.html` | 設定: ストレージタブ |
| `/settings/general` | `settings/general.html` | 設定: 全般タブ |

### 3.9 テスト観点

- サーバーが `127.0.0.1` のみにバインドされること
- ポート競合時に次のポートを試行すること
- 全ページルートが正しいテンプレートを返すこと
- `/` のリダイレクトが初期設定状態に応じて正しいこと
- `stop()` で全WebSocket接続がクローズされること
- 静的ファイルが `/static/` パスで配信されること

---

## 4. APIRoutes の詳細設計

### 4.1 概要

| 項目 | 内容 |
|---|---|
| 役割 | REST APIルーティング。リクエストのバリデーション（形式チェック）とApplication層への委譲を行う |
| 使用する外部技術 | `aiohttp`（リクエスト/レスポンス処理） |
| 配置先 | `app/presentation/web/api_routes.py` |

### 4.2 依存先

| 依存先 | 用途 |
|---|---|
| `WizardService` | ウィザード関連API |
| `PluginManagementService` | プラットフォーム追加・削除API |
| `VersionMonitoringService` | バージョンチェック・更新API |
| `ProjectLaunchService` | プロジェクト管理API |
| `SettingsService` | 設定管理API |

### 4.3 コンストラクタ

```python
def __init__(
    self,
    wizard_service: WizardService,
    plugin_management_service: PluginManagementService,
    version_monitoring_service: VersionMonitoringService,
    project_launch_service: ProjectLaunchService,
    settings_service: SettingsService,
) -> None
```

### 4.4 パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `register_routes(app)` | `app: aiohttp.web.Application` | `None` | 全REST APIルートをaiohttpアプリケーションに登録する |

### 4.5 REST APIエンドポイント一覧

gui-design.md §8 のAPIエンドポイント定義に準拠する。

#### 4.5.1 ウィザード関連API

| エンドポイント | メソッド | ハンドラ | 概要 |
|---|---|---|---|
| `/api/wizard/state` | GET | `_get_wizard_state` | ウィザードの現在状態を取得 |
| `/api/wizard/platforms` | POST | `_save_platforms` | 選択プラットフォームを保存 |
| `/api/wizard/certificate` | POST | `_save_certificate` | 証明書パスを保存 |
| `/api/wizard/certificate/validate` | POST | `_validate_certificate` | 証明書ファイルの存在検証 |
| `/api/wizard/storage` | POST | `_save_storage` | ストレージ接続情報を保存 |
| `/api/wizard/storage/test` | POST | `_test_storage_connection` | ストレージ接続テスト |
| `/api/wizard/install/start` | POST | `_start_installation` | インストール実行開始 |
| `/api/wizard/install/status` | GET | `_get_install_status` | インストール進捗取得 |
| `/api/wizard/complete` | POST | `_complete_setup` | セットアップ完了を記録 |

#### 4.5.2 ダッシュボード関連API

| エンドポイント | メソッド | ハンドラ | 概要 |
|---|---|---|---|
| `/api/dashboard/platforms` | GET | `_get_platforms` | インストール済みプラットフォーム一覧取得 |
| `/api/dashboard/check` | POST | `_check_for_updates` | バージョンチェック即時実行 |
| `/api/dashboard/update` | POST | `_update_platform` | 指定プラットフォームの更新実行 |
| `/api/dashboard/update/all` | POST | `_update_all_platforms` | 全プラットフォーム一括更新 |
| `/api/dashboard/update/status` | GET | `_get_update_status` | 更新進捗取得 |
| `/api/dashboard/projects` | GET | `_get_projects` | 登録プロジェクト一覧取得 |
| `/api/dashboard/projects` | POST | `_register_project` | プロジェクト登録 |
| `/api/dashboard/projects/remove` | POST | `_unregister_project` | プロジェクト登録解除 |
| `/api/dashboard/projects/launch` | POST | `_launch_project` | プロジェクトを開発ツールで開く |

#### 4.5.3 設定関連API

| エンドポイント | メソッド | ハンドラ | 概要 |
|---|---|---|---|
| `/api/settings/platforms/add` | POST | `_add_platforms` | プラットフォーム追加 |
| `/api/settings/platforms/remove` | POST | `_remove_platform` | プラットフォーム削除 |
| `/api/settings/storage` | GET | `_get_storage_connection` | ストレージ接続情報取得 |
| `/api/settings/storage` | POST | `_save_storage_settings` | ストレージ設定保存 |
| `/api/settings/storage/test` | POST | `_test_storage_settings` | ストレージ接続テスト（設定画面用） |
| `/api/settings/general` | GET | `_get_general_settings` | 全般設定取得 |
| `/api/settings/general` | POST | `_save_general_settings` | 全般設定保存 |
| `/api/settings/env-vars` | GET | `_get_environment_variables` | 環境変数一覧取得 |
| `/api/settings/env-vars` | POST | `_save_environment_variables` | 環境変数一覧保存 |
| `/api/settings/env-vars/reset` | POST | `_reset_environment_preset` | 環境変数をプリセットにリセット |
| `/api/settings/log/open` | POST | `_open_log_file` | ログファイルを開く |

### 4.6 リクエスト/レスポンス形式

すべてのAPIは `Content-Type: application/json` で通信する。

#### 共通レスポンス形式

成功時:
```json
{"success": true, "data": { ... }}
```

エラー時:
```json
{"success": false, "error": "エラーメッセージ"}
```

#### 主要リクエスト/レスポンス例

**POST `/api/wizard/platforms`**
```json
// Request
{"platform_types": ["CLAUDE_CODE", "KIRO", "CURSOR"]}
// Response
{"success": true}
```

**POST `/api/wizard/certificate`**
```json
// Request
{"path": "C:\\cert\\cert.pem"}
// Response
{"success": true}
```

**POST `/api/wizard/storage`**
```json
// Request
{"endpoint": "https://minio.example.com", "access_key": "...", "secret_key": "..."}
// Response
{"success": true}
```

**POST `/api/wizard/storage/test`**
```json
// Request
{"endpoint": "https://minio.example.com", "access_key": "...", "secret_key": "..."}
// Response (success)
{"success": true}
// Response (failure)
{"success": false, "error": "接続に失敗しました: タイムアウト"}
```

**GET `/api/wizard/install/status`**
```json
// Response
{
  "success": true,
  "data": {
    "percentage": 60,
    "total_steps": 5,
    "completed_steps": 3,
    "current_step_name": "Kiro にインストール中...",
    "steps": [
      {"name": "プラグインのダウンロード", "status": "completed", "error_message": null},
      {"name": "プラグインの展開", "status": "completed", "error_message": null},
      {"name": "Claude Code にインストール", "status": "completed", "error_message": null},
      {"name": "Kiro にインストール", "status": "running", "error_message": null},
      {"name": "スタートアップ登録", "status": "pending", "error_message": null}
    ],
    "is_completed": false,
    "has_error": false,
    "error_message": null
  }
}
```

**GET `/api/dashboard/platforms`**
```json
// Response
{
  "success": true,
  "data": [
    {
      "platform_name": "Claude Code",
      "platform_type": "CLAUDE_CODE",
      "current_version": "1.1.0",
      "latest_version": "1.2.3",
      "update_status": "update_available",
      "has_update": true
    }
  ]
}
```

**POST `/api/dashboard/projects`**
```json
// Request
{"path": "C:\\projects\\my-app"}
// Response
{
  "success": true,
  "data": {
    "path": "C:\\projects\\my-app",
    "folder_name": "my-app",
    "last_used_at": null
  }
}
```

### 4.7 エラーハンドリング

Application層の例外をHTTPステータスコードに変換する。

| Application層例外 | HTTPステータス | エラーメッセージ |
|---|---|---|
| `StorageConnectionError` | 502 Bad Gateway | ストレージサーバーに接続できません |
| `PluginDownloadError` | 502 Bad Gateway | プラグインのダウンロードに失敗しました |
| `PluginInstallError` | 500 Internal Server Error | プラグインのインストールに失敗しました |
| `ConfigLoadError` | 500 Internal Server Error | 設定ファイルの読み込みに失敗しました |
| `ConfigSaveError` | 500 Internal Server Error | 設定ファイルの保存に失敗しました |
| `ToolNotFoundError` | 404 Not Found | 開発ツールが見つかりません |
| `ProjectPathNotFoundError` | 404 Not Found | プロジェクトフォルダが見つかりません |
| `CertificateFileNotFoundError` | 400 Bad Request | 証明書ファイルが見つかりません |
| `InvalidCertificatePathError` | 400 Bad Request | 証明書パスの形式が不正です |
| `InvalidStorageConnectionError` | 400 Bad Request | ストレージ接続情報が不正です |
| `InvalidEnvironmentVariableError` | 400 Bad Request | 環境変数キーが不正です |
| `DuplicateEnvironmentVariableError` | 400 Bad Request | 環境変数キーが重複しています |
| `SetupNotCompletedError` | 403 Forbidden | 初期設定が完了していません |
| その他の `ApplicationError` | 500 Internal Server Error | 内部エラーが発生しました |

#### エラーハンドリングの実装方式

共通のエラーハンドリングミドルウェアを使用する。

```python
@aiohttp.web.middleware
async def error_handling_middleware(request, handler):
    try:
        return await handler(request)
    except ApplicationError as e:
        status = _get_http_status(e)
        return aiohttp.web.json_response(
            {"success": False, "error": e.message},
            status=status,
        )
    except Exception as e:
        logging.exception("Unexpected error")
        return aiohttp.web.json_response(
            {"success": False, "error": "内部エラーが発生しました"},
            status=500,
        )
```

### 4.8 リクエストバリデーション

APIRoutesはリクエストの形式チェック（必須フィールドの存在確認、型チェック）のみを行う。ビジネスルールのバリデーション（パス形式検証、URL形式検証等）はApplication層・Domain層に委譲する。

```python
async def _save_platforms(self, request: aiohttp.web.Request) -> aiohttp.web.Response:
    body = await request.json()
    # 形式チェック（Presentation層の責務）
    if "platform_types" not in body:
        return aiohttp.web.json_response(
            {"success": False, "error": "platform_types は必須です"},
            status=400,
        )
    if not isinstance(body["platform_types"], list):
        return aiohttp.web.json_response(
            {"success": False, "error": "platform_types はリスト形式で指定してください"},
            status=400,
        )
    # Application層に委譲（ビジネスバリデーションはApplication/Domain層で実行）
    await self._wizard_service.save_selected_platforms(body["platform_types"])
    return aiohttp.web.json_response({"success": True})
```

### 4.9 テスト観点

- 全エンドポイントが正しいHTTPメソッドで登録されていること
- リクエストボディの形式チェック（必須フィールド不在時の400エラー）
- Application層の例外が正しいHTTPステータスコードに変換されること
- 正常系のレスポンスが期待するJSON形式であること
- エラーハンドリングミドルウェアが未知の例外を500に変換すること

---

## 5. WebSocketHandler の詳細設計

### 5.1 概要

| 項目 | 内容 |
|---|---|
| 役割 | WebSocket接続管理。インストール進捗・更新進捗のリアルタイム配信を行う |
| 使用する外部技術 | `aiohttp`（WebSocketサーバー） |
| 配置先 | `app/presentation/web/websocket_handler.py` |

### 5.2 依存先

WebSocketHandlerはApplication層のサービスに直接依存しない。進捗情報はAPIRoutes経由で取得し、WebSocketHandlerに通知する（プッシュ方式）。

### 5.3 コンストラクタ

```python
def __init__(self) -> None
```

引数なし。内部で接続管理のデータ構造を初期化する。

### 5.4 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_connections` | `set[aiohttp.web.WebSocketResponse]` | アクティブなWebSocket接続のセット |

### 5.5 パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `register_routes(app)` | `app: aiohttp.web.Application` | `None` | WebSocketルートをaiohttpアプリケーションに登録する |
| `broadcast(message)` | `message: dict` | `None` | 全アクティブ接続にJSONメッセージを送信する |
| `close_all()` | — | `None` | 全アクティブ接続をクローズする |
| `connection_count` | — | `int`（プロパティ） | アクティブ接続数を返す |

### 5.6 WebSocketルート

| URL | ハンドラ | 概要 |
|---|---|---|
| `/ws` | `_handle_websocket` | WebSocket接続を受け付け、接続管理に追加する |

### 5.7 接続管理

```python
async def _handle_websocket(self, request: aiohttp.web.Request) -> aiohttp.web.WebSocketResponse:
    ws = aiohttp.web.WebSocketResponse()
    await ws.prepare(request)
    self._connections.add(ws)
    try:
        async for msg in ws:
            # クライアントからのメッセージは現時点では無視
            # 将来の拡張ポイント（クライアントからのコマンド受付等）
            pass
    finally:
        self._connections.discard(ws)
    return ws
```

### 5.8 メッセージ形式

#### インストール進捗メッセージ

```json
{
  "type": "install_progress",
  "data": {
    "percentage": 60,
    "current_step_name": "Kiro にインストール中...",
    "steps": [
      {"name": "プラグインのダウンロード", "status": "completed"},
      {"name": "Kiro にインストール", "status": "running"}
    ],
    "is_completed": false,
    "has_error": false
  }
}
```

#### 更新進捗メッセージ

```json
{
  "type": "update_progress",
  "data": {
    "percentage": 50,
    "platform_name": "Claude Code",
    "status": "running"
  }
}
```

#### バージョンチェック結果メッセージ

```json
{
  "type": "version_check",
  "data": {
    "has_update": true,
    "platforms": [
      {"platform_name": "Claude Code", "has_update": true, "latest_version": "1.2.3"}
    ]
  }
}
```

### 5.9 テスト観点

- WebSocket接続の確立と切断が正しく管理されること
- `broadcast` が全アクティブ接続にメッセージを送信すること
- 切断済み接続が `_connections` から除去されること
- `close_all` で全接続がクローズされること
- メッセージ形式が定義通りであること

---

## 6. StaticFiles の詳細設計

### 6.1 概要

| 項目 | 内容 |
|---|---|
| 役割 | HTML/CSS/JSの静的ファイル群。ウィザード、ダッシュボード、設定画面のフロントエンドを構成する |
| 使用する外部技術 | `Jinja2`（テンプレートエンジン）, HTML5, CSS3, JavaScript（ES6+） |
| 配置先 | `app/presentation/static/` および `app/presentation/templates/` |

### 6.2 Jinja2テンプレート構成

gui-design.md §9 に準拠する。

```
templates/
+-- base.html                  # 共通ベーステンプレート
+-- nav.html                   # ナビゲーションバー（部分テンプレート）
+-- wizard/
|   +-- base_wizard.html       # ウィザード共通レイアウト（ステップインジケーター）
|   +-- welcome.html           # WIZ-01: ようこそ
|   +-- platforms.html         # WIZ-02: プラットフォーム選択
|   +-- certificate.html       # WIZ-02B: 証明書設定
|   +-- storage.html           # WIZ-03: ストレージ接続設定
|   +-- install.html           # WIZ-04: インストール確認・実行
|   +-- complete.html          # WIZ-05: 完了
+-- dashboard.html             # DASH: ダッシュボード
+-- settings/
    +-- base_settings.html     # 設定画面共通レイアウト（タブ）
    +-- platforms.html         # タブ1: プラットフォーム管理
    +-- storage.html           # タブ2: ストレージ設定
    +-- general.html           # タブ3: 全般設定
```

### 6.3 テンプレート継承関係

```
base.html
+-- wizard/base_wizard.html
|   +-- wizard/welcome.html
|   +-- wizard/platforms.html
|   +-- wizard/certificate.html
|   +-- wizard/storage.html
|   +-- wizard/install.html
|   +-- wizard/complete.html
+-- dashboard.html（nav.html をインクルード）
+-- settings/base_settings.html（nav.html をインクルード）
    +-- settings/platforms.html
    +-- settings/storage.html
    +-- settings/general.html
```

### 6.4 静的ファイル構成

```
static/
+-- css/
|   +-- style.css              # 全画面共通スタイルシート（gui-design.md §2 準拠）
+-- js/
|   +-- wizard-install.js      # WIZ-04: インストール進捗のポーリング
|   +-- dashboard.js           # DASH: 更新チェック・更新実行・プロジェクト管理
|   +-- settings.js            # SETTINGS: 接続テスト・設定保存
+-- img/
    +-- aide-powers.ico        # タスクトレイアイコン
```

### 6.5 JavaScript の役割

各JSファイルはREST APIへのfetchリクエストとDOM操作のみを行う。ビジネスロジックは含まない。

| ファイル | 役割 |
|---|---|
| `wizard-install.js` | `/api/wizard/install/status` への1秒間隔ポーリング。プログレスバーとステップ一覧のDOM更新。完了時の自動遷移 |
| `dashboard.js` | プラットフォーム一覧の取得・表示、更新チェック・更新実行のAjax処理、プロジェクト一覧の取得・登録・削除・起動のAjax処理、確認ダイアログの表示 |
| `settings.js` | 接続テストのAjax処理、設定保存のAjax処理、環境変数テーブルの動的行追加・削除、プリセットリセットの確認ダイアログ |

### 6.6 テスト観点

- テンプレート継承が正しく機能すること
- 全画面がbase.htmlの共通スタイルを継承していること
- ウィザード画面でナビゲーションバーが非表示であること
- ダッシュボード・設定画面でナビゲーションバーが表示されること
- JavaScriptのfetchリクエストが正しいエンドポイントを呼び出すこと
- gui-design.md §2 の配色・タイポグラフィ・レイアウトルールがCSSに反映されていること

---

## 7. アプリケーション起動フロー

### 7.1 Composition Root

アプリケーション起動時に全コンポーネントを組み立てるエントリーポイント。

| 項目 | 内容 |
|---|---|
| 配置先 | `app/main.py` |
| 役割 | DI（依存性注入）による全コンポーネントの組み立て、イベントループの起動、シャットダウンハンドリング |

### 7.2 起動シーケンス

```
1. ログ設定の初期化
2. コマンドライン引数の解析（--dry-run, --port 等）
3. dry-run判定（AIDE_DRY_RUN=1 または --dry-run）

4. ドメインサービスの生成（依存なし）
   - PluginInstallationService()
   - UpdatePolicyService()
   - EnvironmentPresetService()

5. リポジトリ具象実装の生成（Infrastructure層）
   - dry-run時: InMemory系/Dummy系
   - 本番時: MinioPluginRepository, FileSystemConfigRepository 等

6. Application層サービスの生成（依存注入）
   - PluginManagementService(...)
   - WizardService(...)
   - VersionMonitoringService(...)
   - ProjectLaunchService(...)
   - SettingsService(...)

7. Presentation層コンポーネントの生成
   - WebSocketHandler()
   - APIRoutes(wizard_service, plugin_management_service, ...)
   - WebServer(api_routes, websocket_handler, static_dir, template_dir)

8. asyncioイベントループの取得
   - loop = asyncio.get_event_loop()

9. WebServerの起動
   - await web_server.start()

10. TrayIconの生成と起動
    - tray_icon = TrayIcon(wizard_service, version_monitoring_service, ..., loop)
    - tray_icon.start()  # 別スレッドで起動

11. 定期バージョンチェックタスクの開始
    - asyncio.create_task(_periodic_version_check())

12. 初回起動判定
    - setup_completed = wizard_service.is_setup_completed()
    - 未完了の場合: ブラウザでウィザードを自動オープン

13. イベントループの実行
    - loop.run_forever()

14. シャットダウン処理（終了時）
    - tray_icon.stop()
    - await web_server.stop()
    - 全非同期タスクのキャンセル
```

### 7.3 定期バージョンチェック

```python
async def _periodic_version_check(
    version_monitoring_service: VersionMonitoringService,
    settings_service: SettingsService,
    tray_icon: TrayIcon,
    websocket_handler: WebSocketHandler,
) -> None:
    while True:
        settings = settings_service.get_general_settings()
        interval = settings.check_interval_minutes * 60  # 秒に変換
        await asyncio.sleep(interval)
        try:
            platforms = await version_monitoring_service.check_for_updates()
            has_update = any(p.has_update for p in platforms)
            tray_icon.update_badge(has_update)
            if has_update:
                tray_icon.show_notification(
                    "aide-powers 更新通知",
                    "新しいバージョンが利用可能です。"
                )
                await websocket_handler.broadcast({
                    "type": "version_check",
                    "data": {"has_update": True, "platforms": [...]}
                })
        except StorageConnectionError:
            logging.warning("定期バージョンチェック失敗: ストレージ接続エラー")
```

### 7.4 シャットダウンフロー

```
1. TrayIconの「終了」メニュー → _on_quit() が呼ばれる
2. asyncio.run_coroutine_threadsafe() でメインループにシャットダウンを投入
3. WebServer.stop() → 全WebSocket接続クローズ → aiohttpサーバー停止
4. 定期バージョンチェックタスクのキャンセル
5. TrayIcon.stop() → pystrayアイコン停止
6. asyncioイベントループの停止
7. プロセス終了
```

---

## 8. Presentation層のチェックリスト

| # | チェック項目 | 状態 | 備考 |
|---|---|---|---|
| 1 | Presentation層にビジネスロジック（バージョン比較、更新ポリシー判定等）が含まれていないこと | OK | Application層のサービスに委譲 |
| 2 | Presentation層がInfrastructure層の具象クラスを直接参照していないこと | OK | Application層経由でのみアクセス |
| 3 | Presentation層がドメインオブジェクトを直接生成・操作していないこと | OK | DTOを使用 |
| 4 | Application層のDTOのみを使用してデータを受け渡していること | OK | WizardStateDTO, InstallProgressDTO, PlatformStatusDTO, RegisteredProjectDTO, EnvironmentVariableDTO, GeneralSettingsDTO |
| 5 | aiohttpサーバーが127.0.0.1のみにバインドされること | OK | WebServer.host = "127.0.0.1" |
| 6 | ポートがランダムな高ポート（49152〜65534）を使用すること | OK | WebServer.port_range |
| 7 | pystrayとaiohttpの非同期統合方式が定義されていること | OK | §1.4 で定義 |
| 8 | REST APIエンドポイントがgui-design.md §8 に準拠していること | OK | §4.5 で全エンドポイントを定義 |
| 9 | WebSocketメッセージ形式が定義されていること | OK | §5.8 で定義 |
| 10 | タスクトレイメニューがgui-design.md §3.3 に準拠していること | OK | §2.6 で定義 |
| 11 | Application層の例外がHTTPステータスコードに正しく変換されること | OK | §4.7 で変換マトリクスを定義 |
| 12 | Jinja2テンプレート構成がgui-design.md §9 に準拠していること | OK | §6.2 で定義 |
| 13 | 静的ファイル構成がgui-design.md §9.3 に準拠していること | OK | §6.4 で定義 |
| 14 | Composition Rootでの組み立て順序が定義されていること | OK | §7.2 で定義 |
| 15 | 定期バージョンチェックの仕組みが定義されていること | OK | §7.3 で定義 |
| 16 | シャットダウンフローが定義されていること | OK | §7.4 で定義 |
| 17 | 技術的命名（~Data, ~Manager, ~Flag, ~Helper）がPresentation層に存在しないこと | OK | ユビキタス言語辞書に準拠 |

---

*本文書はユーザー要件定義書（user-requirements.md）、GUI設計書（gui-design.md）、レイヤードアーキテクチャ設計書（layered-architecture.md）、アプリケーション層オブジェクト設計書（object-design-application.md）、ドメイン層オブジェクト設計書（object-design-domain.md）、ユビキタス言語辞書（ubiquitous-language.md）に基づき作成されたプレゼンテーション層オブジェクト設計書です。*
