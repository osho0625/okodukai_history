# インフラストラクチャ層オブジェクト設計: aide-powers タスクトレイ管理アプリ

## 1. 設計方針

### 1.1 Infrastructure層の責務

Infrastructure層はDomain層が定義したリポジトリインターフェースの具体実装を提供する。外部技術（minio-py, json, winreg, subprocess, pathlib等）の利用はInfrastructure層に閉じ込め、他のレイヤーに技術的詳細を漏洩させない。

### 1.2 禁止事項

| # | 禁止事項 | 理由 |
|---|---|---|
| 1 | ビジネスロジックの実装 | バージョン比較、更新ポリシー判定、環境変数バリデーション等はDomain層の責務 |
| 2 | ドメインオブジェクトの不変条件の検証 | PluginVersion のパース検証、CertificatePath の拡張子検証等はDomain層の値オブジェクトが行う |
| 3 | Application層・Presentation層への直接依存 | Infrastructure層はDomain層のインターフェースのみを実装する |
| 4 | 外部技術の例外をそのまま上位に伝播 | minio.error.S3Error, json.JSONDecodeError 等はInfrastructure層でキャッチし、ドメイン非依存の形で再送出する |

### 1.3 データマッピング方針

Infrastructure層は外部形式（JSON, MinIO API レスポンス, レジストリ値等）とドメインオブジェクトの間の変換を担う。変換時にドメインオブジェクトのファクトリメソッド・コンストラクタを使用し、ドメイン層のバリデーションを経由する。

### 1.4 テスト用ダミー実装の方針

layered-architecture.md §8 に基づき、外部インフラにアクセスする各リポジトリインターフェースについて、疑似的な結果を返すダミー実装（dry run用）を設計する。ダミー実装は同一インターフェースを実装し、DIで本番実装と切り替え可能にする。切り替えは環境変数 `AIDE_DRY_RUN=1` またはコマンドライン引数 `--dry-run` で行う。

---

## 2. 本番実装クラスの詳細設計

### 2.1 MinioPluginRepository（MinIOプラグインリポジトリ）

| 項目 | 内容 |
|---|---|
| 役割 | MinIO S3互換ストレージからプラグインパッケージのダウンロード・バージョン情報取得を行う |
| 実装するインターフェース | `PluginRepository`（Domain層 §7.1） |
| 使用する外部技術 | `minio` (minio-py 7.2.x), `urllib3`, `certifi` |
| 配置先 | `app/infrastructure/minio/minio_plugin_repository.py` |

#### コンストラクタ

```python
def __init__(
    self,
    endpoint: str,
    access_key: str,
    secret_key: str,
    bucket_name: str,
    certificate_path: str | None = None,
    secure: bool = True,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `endpoint` | `str` | MinIOサーバーのエンドポイント（ホスト:ポート形式。例: `minio.example.com`） |
| `access_key` | `str` | MinIOアクセスキー |
| `secret_key` | `str` | MinIOシークレットキー |
| `bucket_name` | `str` | プラグインパッケージを格納するバケット名（例: `aide-powers`） |
| `certificate_path` | `str \| None` | 社内プロキシ対応のCA証明書ファイルパス。指定時はSSL検証に使用する |
| `secure` | `bool` | HTTPS接続を使用するか（デフォルト: True） |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_client` | `minio.Minio` | MinIOクライアントインスタンス |
| `_bucket_name` | `str` | バケット名 |

#### 初期化処理

```
1. certificate_path が指定されている場合:
   a. urllib3.PoolManager を CA証明書パス付きで生成
   b. Minio クライアントに http_client として渡す
2. certificate_path が未指定の場合:
   a. デフォルトのSSL検証で Minio クライアントを生成
3. Minio(endpoint, access_key, secret_key, secure=secure, http_client=...) でクライアントを初期化
```

#### パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `get_latest_version()` | — | `PluginVersion` | バケット内のオブジェクト一覧からバージョンタグ付きの最新パッケージを特定し、PluginVersionとして返す |
| `download_package(version)` | `version: PluginVersion` | `bytes` | 指定バージョンのプラグインパッケージ（zipファイル）をダウンロードし、バイト列として返す |
| `is_available()` | — | `bool` | MinIOサーバーへの接続可否を確認する |

#### 実装概要: get_latest_version

```
1. _client.list_objects(bucket_name, prefix="aide-powers/") でオブジェクト一覧を取得
2. オブジェクト名からバージョン文字列を抽出（命名規則: aide-powers/aide-powers-{version}.zip）
3. 各バージョン文字列を PluginVersion.from_string() でパース
4. PluginVersion の比較演算で最新バージョンを特定
5. 最新の PluginVersion を返す
6. オブジェクトが存在しない場合は例外をスロー
```

#### 実装概要: download_package

```
1. オブジェクトキーを構築: f"aide-powers/aide-powers-{version}.zip"
2. _client.get_object(bucket_name, object_key) でオブジェクトを取得
3. レスポンスの .read() でバイト列を取得
4. レスポンスの .close() と .release_conn() でリソースを解放
5. バイト列を返す
```

#### 実装概要: is_available

```
1. _client.bucket_exists(bucket_name) を呼び出す
2. 成功すれば True を返す
3. 接続エラー・認証エラー等の例外発生時は False を返す
```

#### エラーハンドリング

| 外部例外 | 発生条件 | 対応 |
|---|---|---|
| `minio.error.S3Error` | バケット不在、オブジェクト不在、認証失敗等 | ログ出力後、`RuntimeError` に変換して再送出 |
| `urllib3.exceptions.MaxRetryError` | サーバー接続タイムアウト | ログ出力後、`RuntimeError` に変換して再送出 |
| `urllib3.exceptions.SSLError` | SSL証明書検証失敗 | ログ出力後、`RuntimeError` に変換して再送出 |
| `InvalidVersionError` | バージョン文字列のパース失敗 | ログ出力（WARNING）し、該当オブジェクトをスキップ |

#### テスト観点

- 結合テスト: 実際のMinIOサーバーに対するバージョン取得・ダウンロード
- ダミー実装テスト: InMemoryPluginRepository との振る舞い一致
- CA証明書パス指定時のSSL接続
- バケット内にオブジェクトが存在しない場合のエラー
- ネットワーク切断時の is_available → False

---

### 2.2 FileSystemConfigRepository（ファイルシステム設定リポジトリ）

| 項目 | 内容 |
|---|---|
| 役割 | `%LOCALAPPDATA%\aide-powers\config.json` の読み書きを行い、アプリケーション設定を永続化する |
| 実装するインターフェース | `ConfigRepository`（Domain層 §7.2） |
| 使用する外部技術 | `json`（Python標準）, `pathlib`（Python標準）, `os`（Python標準） |
| 配置先 | `app/infrastructure/filesystem/filesystem_config_repository.py` |

#### コンストラクタ

```python
def __init__(
    self,
    config_dir: str | None = None,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `config_dir` | `str \| None` | 設定ファイルの格納ディレクトリ。未指定時は `%LOCALAPPDATA%\aide-powers` を使用する |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_config_path` | `pathlib.Path` | config.json のフルパス |

#### 初期化処理

```
1. config_dir が未指定の場合:
   a. os.environ.get("LOCALAPPDATA") でベースディレクトリを取得
   b. ベースディレクトリ / "aide-powers" を config_dir とする
2. config_dir が存在しない場合はディレクトリを作成（mkdir -p 相当）
3. _config_path = Path(config_dir) / "config.json"
4. config.json が存在しない場合はデフォルト値で初期化
```

#### パブリックメソッド

object-design-domain.md §7.2 で定義された ConfigRepository インターフェースの全メソッドを実装する。

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `load_storage_connection()` | — | `StorageConnection \| None` | config.json の `storage` セクションからストレージ接続情報を読み込む |
| `save_storage_connection(connection)` | `connection: StorageConnection` | — | ストレージ接続情報を config.json に保存する |
| `load_certificate_path()` | — | `CertificatePath \| None` | config.json の `certificate_path` を読み込む |
| `save_certificate_path(path)` | `path: CertificatePath` | — | 証明書パスを config.json に保存する |
| `load_environment_variables()` | — | `EnvironmentVariableCollection` | config.json の `env_vars` セクションから環境変数一覧を読み込む |
| `save_environment_variables(variables)` | `variables: EnvironmentVariableCollection` | — | 環境変数一覧を config.json に保存する |
| `load_installed_platforms()` | — | `list[InstalledPlatform]` | config.json の `installed_platforms` セクションからプラットフォーム一覧を読み込む |
| `save_installed_platforms(platforms)` | `platforms: list[InstalledPlatform]` | — | プラットフォーム一覧を config.json に保存する |
| `load_registered_projects()` | — | `list[RegisteredProject]` | config.json の `registered_projects` セクションからプロジェクト一覧を読み込む |
| `save_registered_projects(projects)` | `projects: list[RegisteredProject]` | — | プロジェクト一覧を config.json に保存する |
| `is_setup_completed()` | — | `bool` | config.json の `setup_completed` フラグを返す |
| `mark_setup_completed()` | — | — | config.json の `setup_completed` を `true` に設定する |

#### 内部ヘルパーメソッド

| メソッド | 概要 |
|---|---|
| `_read_config()` | config.json を読み込み dict として返す。ファイル不在時はデフォルト dict を返す |
| `_write_config(data)` | dict を config.json に書き出す。アトミック書き込み（一時ファイル → rename）を使用する |

#### データマッピング: JSON → ドメインオブジェクト

| JSONキー | ドメインオブジェクト | 変換処理 |
|---|---|---|
| `storage.endpoint` | `StorageConnection` | `StorageConnection(endpoint, access_key, secret_key)` で生成 |
| `certificate_path` | `CertificatePath` | `CertificatePath(path)` で生成 |
| `env_vars` (dict) | `EnvironmentVariableCollection` | 各キー・値ペアから `EnvironmentVariable` を生成し、コレクションに格納 |
| `installed_platforms` (list) | `list[InstalledPlatform]` | 各要素から `PlatformType` 列挙値を解決し、`InstalledPlatform` を生成 |
| `registered_projects` (list) | `list[RegisteredProject]` | 各要素から `RegisteredProject` を生成 |

#### データマッピング: ドメインオブジェクト → JSON

| ドメインオブジェクト | JSONキー | 変換処理 |
|---|---|---|
| `StorageConnection` | `storage` | `{"endpoint": ..., "access_key": ..., "secret_key": ...}` |
| `CertificatePath` | `certificate_path` | `str(path)` |
| `EnvironmentVariableCollection` | `env_vars` | `collection.to_dict()` → `{"KEY": "VALUE", ...}` |
| `InstalledPlatform` | `installed_platforms[i]` | `{"platform_type": ..., "current_version": ..., "latest_version": ...}` |
| `RegisteredProject` | `registered_projects[i]` | `{"path": ..., "last_used_at": ...}` |

#### アトミック書き込みの実装

```
1. 一時ファイル（config.json.tmp）にJSON文字列を書き出す
2. 一時ファイルを config.json にリネーム（os.replace）
3. リネームはOSレベルでアトミックなため、書き込み途中のファイルが残らない
```

#### エラーハンドリング

| 外部例外 | 発生条件 | 対応 |
|---|---|---|
| `json.JSONDecodeError` | config.json の内容が不正なJSON | ログ出力（ERROR）後、バックアップを作成し、デフォルト値で再初期化 |
| `FileNotFoundError` | config.json が存在しない | デフォルト値の dict を返す（正常系として扱う） |
| `PermissionError` | ファイルの読み書き権限がない | ログ出力後、`RuntimeError` に変換して再送出 |
| `OSError` | ディスク容量不足等 | ログ出力後、`RuntimeError` に変換して再送出 |
| `InvalidVersionError` 等のドメイン例外 | config.json 内のデータが不正 | ログ出力（WARNING）し、該当フィールドをデフォルト値で補完 |

#### テスト観点

- 正常な読み書きの往復（save → load で同一データが復元されること）
- config.json 不在時のデフォルト値返却
- 不正なJSON内容時のリカバリ（バックアップ作成 + デフォルト値初期化）
- アトミック書き込みの検証（書き込み中にプロセスが中断しても破損しないこと）
- 全メソッドの正常系・異常系

---

### 2.3 FileSystemPlatformInstaller（ファイルシステムプラットフォームインストーラー）

| 項目 | 内容 |
|---|---|
| 役割 | 各プラットフォームのプラグインディレクトリにaide-powersプラグインファイルを配置・削除する |
| 実装するインターフェース | `PlatformInstaller`（Domain層 §7.3） |
| 使用する外部技術 | `pathlib`（Python標準）, `shutil`（Python標準）, `zipfile`（Python標準）, `json`（Python標準） |
| 配置先 | `app/infrastructure/filesystem/filesystem_platform_installer.py` |

#### コンストラクタ

```python
def __init__(self) -> None
```

引数なし。プラットフォーム別のインストールパスは内部の定数マッピングで管理する。

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_install_paths` | `dict[PlatformType, pathlib.Path]` | プラットフォーム別のインストール先パス（§5 で定義） |

#### パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `install(platform_type, package_data)` | `platform_type: PlatformType, package_data: bytes` | — | パッケージデータ（zip）を展開し、対象プラットフォームのディレクトリに配置する |
| `uninstall(platform_type)` | `platform_type: PlatformType` | — | 対象プラットフォームのプラグインディレクトリを削除する |
| `get_installed_version(platform_type)` | `platform_type: PlatformType` | `PluginVersion \| None` | 対象プラットフォームにインストールされているバージョンを plugin.json から読み取る |

#### 実装概要: install

```
1. platform_type に対応するインストール先パスを _install_paths から取得
2. インストール先ディレクトリが存在する場合はバックアップ（.bak）を作成
3. package_data を io.BytesIO でラップし、zipfile.ZipFile で展開
4. 展開したファイルをインストール先ディレクトリに配置
5. バックアップを削除
6. エラー発生時はバックアップからリストア
```

#### 実装概要: uninstall

```
1. platform_type に対応するインストール先パスを取得
2. ディレクトリが存在する場合は shutil.rmtree() で削除
3. ディレクトリが存在しない場合は何もしない（冪等性を保証）
```

#### 実装概要: get_installed_version

```
1. platform_type に対応するインストール先パスを取得
2. インストール先 / "plugin.json" を読み込む
3. plugin.json の "version" フィールドを PluginVersion.from_string() でパース
4. PluginVersion を返す
5. plugin.json が存在しない場合は None を返す
```

#### エラーハンドリング

| 外部例外 | 発生条件 | 対応 |
|---|---|---|
| `zipfile.BadZipFile` | パッケージデータが不正なzip | ログ出力後、`RuntimeError` に変換して再送出 |
| `PermissionError` | ファイル配置先への書き込み権限がない | ログ出力後、`RuntimeError` に変換して再送出 |
| `OSError` | ディスク容量不足、パスが長すぎる等 | ログ出力後、`RuntimeError` に変換して再送出 |
| `shutil.Error` | ファイルコピー・削除の失敗 | ログ出力後、`RuntimeError` に変換して再送出 |

#### テスト観点

- 正常なインストール（zip展開 → ファイル配置）
- 上書きインストール（既存ディレクトリがある場合のバックアップ → リストア）
- アンインストール（ディレクトリ削除）
- アンインストールの冪等性（存在しないディレクトリの削除でエラーにならない）
- get_installed_version の正常取得・未インストール時のNone返却
- 不正なzipデータでのエラーハンドリング

---

### 2.4 WindowsRegistryAdapter（Windowsレジストリアダプタ）

| 項目 | 内容 |
|---|---|
| 役割 | Windowsレジストリ（HKCU\Software\Microsoft\Windows\CurrentVersion\Run）を操作し、タスクトレイアプリのスタートアップ登録・解除を行う |
| 実装するインターフェース | `StartupRegistry`（Domain層 §7.4） |
| 使用する外部技術 | `winreg`（Python標準、Windows専用）, `sys`（Python標準） |
| 配置先 | `app/infrastructure/registry/windows_registry_adapter.py` |

#### コンストラクタ

```python
def __init__(
    self,
    app_name: str = "aide-powers",
    executable_path: str | None = None,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `app_name` | `str` | レジストリに登録するアプリケーション名（デフォルト: `aide-powers`） |
| `executable_path` | `str \| None` | 起動する実行ファイルのパス。未指定時は `sys.executable` を使用する |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_app_name` | `str` | レジストリキー名 |
| `_executable_path` | `str` | 実行ファイルのフルパス |
| `_registry_key` | `str` | レジストリパス（`r"Software\Microsoft\Windows\CurrentVersion\Run"`） |

#### パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `register()` | — | — | スタートアップにアプリケーションを登録する |
| `unregister()` | — | — | スタートアップ登録を解除する |
| `is_registered()` | — | `bool` | スタートアップに登録されているかを確認する |

#### 実装概要: register

```
1. winreg.OpenKey(HKEY_CURRENT_USER, _registry_key, 0, KEY_SET_VALUE) でキーを開く
2. winreg.SetValueEx(key, _app_name, 0, REG_SZ, f'"{_executable_path}"') で値を設定
3. キーを閉じる
```

#### 実装概要: unregister

```
1. winreg.OpenKey(HKEY_CURRENT_USER, _registry_key, 0, KEY_SET_VALUE) でキーを開く
2. winreg.DeleteValue(key, _app_name) で値を削除
3. キーを閉じる
4. 値が存在しない場合（FileNotFoundError）は何もしない（冪等性を保証）
```

#### 実装概要: is_registered

```
1. winreg.OpenKey(HKEY_CURRENT_USER, _registry_key, 0, KEY_READ) でキーを開く
2. winreg.QueryValueEx(key, _app_name) で値を取得
3. 値が存在すれば True を返す
4. FileNotFoundError の場合は False を返す
```

#### エラーハンドリング

| 外部例外 | 発生条件 | 対応 |
|---|---|---|
| `FileNotFoundError` | レジストリキーまたは値が存在しない | unregister: 正常系として扱う（冪等性）。is_registered: False を返す |
| `PermissionError` | レジストリへのアクセス権限がない | ログ出力後、`RuntimeError` に変換して再送出 |
| `OSError` | レジストリ操作の一般的なエラー | ログ出力後、`RuntimeError` に変換して再送出 |

#### テスト観点

- 登録 → is_registered → True の確認
- 解除 → is_registered → False の確認
- 未登録状態での解除（エラーにならないこと）
- 登録値が正しい実行ファイルパスであること
- Windows以外の環境での graceful な失敗（ImportError のハンドリング）

---

### 2.5 ProcessLauncher（プロセスランチャー）

| 項目 | 内容 |
|---|---|
| 役割 | 環境変数を設定した子プロセスとして開発ツールを起動する |
| 実装するインターフェース | `DevelopmentToolLauncher`（Domain層 §7.5） |
| 使用する外部技術 | `subprocess`（Python標準）, `os`（Python標準）, `shutil`（Python標準） |
| 配置先 | `app/infrastructure/process/process_launcher.py` |

#### コンストラクタ

```python
def __init__(
    self,
    tool_command: str,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `tool_command` | `str` | 開発ツールの実行コマンド（例: `"kiro"`, `"code"`, `"cursor"`） |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_tool_command` | `str` | 開発ツールの実行コマンド |

#### パブリックメソッド

| メソッド | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `launch(project_path, env_vars)` | `project_path: str, env_vars: dict[str, str]` | — | 環境変数を設定した状態で開発ツールを子プロセスとして起動する |
| `is_tool_available()` | — | `bool` | 開発ツールの実行ファイルがPATH上に存在するかを確認する |

#### 実装概要: launch

```
1. 現在のプロセスの環境変数をコピー: env = os.environ.copy()
2. env_vars の内容を env にマージ（上書き）
3. subprocess.Popen(
       [_tool_command, project_path],
       env=env,
       cwd=project_path,
       creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
   )
4. 子プロセスの起動を確認（Popen オブジェクトの poll() で即座にクラッシュしていないか確認）
5. 子プロセスの参照は保持しない（デタッチ起動のため）
```

#### 実装概要: is_tool_available

```
1. shutil.which(_tool_command) でPATH上の実行ファイルを検索
2. 見つかれば True、見つからなければ False を返す
```

#### エラーハンドリング

| 外部例外 | 発生条件 | 対応 |
|---|---|---|
| `FileNotFoundError` | 実行コマンドが見つからない | ログ出力後、`RuntimeError` に変換して再送出 |
| `PermissionError` | 実行権限がない | ログ出力後、`RuntimeError` に変換して再送出 |
| `OSError` | 子プロセス起動の一般的なエラー | ログ出力後、`RuntimeError` に変換して再送出 |
| `subprocess.SubprocessError` | サブプロセス関連のエラー | ログ出力後、`RuntimeError` に変換して再送出 |

#### テスト観点

- 正常な起動（環境変数が子プロセスに渡されること）
- 存在しないコマンドでの起動失敗
- is_tool_available の正常判定
- 子プロセスがデタッチされること（親プロセス終了時に子プロセスが終了しないこと）
- 環境変数のマージ（既存の環境変数が保持され、追加分が上書きされること）

---

## 3. テスト用ダミー実装クラスの詳細設計

### 3.1 InMemoryPluginRepository（インメモリプラグインリポジトリ）

| 項目 | 内容 |
|---|---|
| 役割 | メモリ上のデータでプラグインリポジトリの振る舞いを再現する。ネットワークアクセスなし |
| 実装するインターフェース | `PluginRepository`（Domain層 §7.1） |
| 使用する外部技術 | なし（Python標準ライブラリのみ） |
| 配置先 | `app/infrastructure/testing/in_memory_plugin_repository.py` |

#### コンストラクタ

```python
def __init__(
    self,
    available_versions: list[str] | None = None,
    package_data: bytes | None = None,
    is_available: bool = True,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `available_versions` | `list[str] \| None` | 利用可能なバージョン文字列のリスト（例: `["1.0.0", "1.1.0", "1.2.0"]`）。未指定時は `["1.0.0"]` |
| `package_data` | `bytes \| None` | ダウンロード時に返すパッケージデータ。未指定時はダミーのzipバイト列を生成 |
| `is_available` | `bool` | ストレージの接続可否を制御するフラグ（デフォルト: True） |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_versions` | `list[PluginVersion]` | 利用可能なバージョンのリスト（ソート済み） |
| `_package_data` | `bytes` | ダウンロード時に返すバイト列 |
| `_is_available` | `bool` | 接続可否フラグ |
| `download_count` | `int` | ダウンロード呼び出し回数（テスト検証用） |
| `version_check_count` | `int` | バージョンチェック呼び出し回数（テスト検証用） |

#### パブリックメソッド

| メソッド | 戻り値 | 概要 |
|---|---|---|
| `get_latest_version()` | `PluginVersion` | `_versions` の最後の要素（最新）を返す。`_is_available` が False の場合は `RuntimeError` をスロー |
| `download_package(version)` | `bytes` | `_package_data` を返す。`_is_available` が False の場合は `RuntimeError` をスロー |
| `is_available()` | `bool` | `_is_available` の値を返す |

#### テスト支援メソッド

| メソッド | 概要 |
|---|---|
| `set_available(flag: bool)` | 接続可否フラグを動的に変更する（テスト中のオフライン状態シミュレーション用） |
| `add_version(version_str: str)` | 新しいバージョンを追加する（テスト中のバージョン更新シミュレーション用） |

---

### 3.2 InMemoryConfigRepository（インメモリ設定リポジトリ）

| 項目 | 内容 |
|---|---|
| 役割 | メモリ上のdictで設定値を保持する。ファイルI/Oなし |
| 実装するインターフェース | `ConfigRepository`（Domain層 §7.2） |
| 使用する外部技術 | なし（Python標準ライブラリのみ） |
| 配置先 | `app/infrastructure/testing/in_memory_config_repository.py` |

#### コンストラクタ

```python
def __init__(self) -> None
```

引数なし。内部状態をデフォルト値で初期化する。

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_storage_connection` | `StorageConnection \| None` | ストレージ接続情報 |
| `_certificate_path` | `CertificatePath \| None` | 証明書パス |
| `_environment_variables` | `EnvironmentVariableCollection` | 環境変数コレクション（初期値: 空コレクション） |
| `_installed_platforms` | `list[InstalledPlatform]` | インストール済みプラットフォーム一覧（初期値: 空リスト） |
| `_registered_projects` | `list[RegisteredProject]` | 登録プロジェクト一覧（初期値: 空リスト） |
| `_setup_completed` | `bool` | セットアップ完了フラグ（初期値: False） |

#### パブリックメソッド

ConfigRepository インターフェースの全12メソッドを実装する。各メソッドは内部状態の読み書きのみを行う。

| メソッド | 概要 |
|---|---|
| `load_storage_connection()` | `_storage_connection` を返す |
| `save_storage_connection(connection)` | `_storage_connection` に代入する |
| `load_certificate_path()` | `_certificate_path` を返す |
| `save_certificate_path(path)` | `_certificate_path` に代入する |
| `load_environment_variables()` | `_environment_variables` を返す |
| `save_environment_variables(variables)` | `_environment_variables` に代入する |
| `load_installed_platforms()` | `_installed_platforms` のコピーを返す |
| `save_installed_platforms(platforms)` | `_installed_platforms` にコピーを代入する |
| `load_registered_projects()` | `_registered_projects` のコピーを返す |
| `save_registered_projects(projects)` | `_registered_projects` にコピーを代入する |
| `is_setup_completed()` | `_setup_completed` を返す |
| `mark_setup_completed()` | `_setup_completed` を True に設定する |

#### テスト支援メソッド

| メソッド | 概要 |
|---|---|
| `reset()` | 全内部状態をデフォルト値にリセットする |

---

### 3.3 DummyPlatformInstaller（ダミープラットフォームインストーラー）

| 項目 | 内容 |
|---|---|
| 役割 | インストール操作をログ出力のみで実行する。ファイル配置なし |
| 実装するインターフェース | `PlatformInstaller`（Domain層 §7.3） |
| 使用する外部技術 | `logging`（Python標準） |
| 配置先 | `app/infrastructure/testing/dummy_platform_installer.py` |

#### コンストラクタ

```python
def __init__(self) -> None
```

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_installed` | `dict[PlatformType, PluginVersion]` | インストール済みプラットフォームとバージョンのマッピング |
| `install_history` | `list[tuple[PlatformType, int]]` | インストール呼び出し履歴（プラットフォーム, パッケージサイズ）。テスト検証用 |
| `uninstall_history` | `list[PlatformType]` | アンインストール呼び出し履歴。テスト検証用 |

#### パブリックメソッド

| メソッド | 概要 |
|---|---|
| `install(platform_type, package_data)` | `_installed` にバージョンを記録し、`install_history` に追加する。ログ出力のみでファイル配置は行わない。バージョンはダミーのzipからplugin.jsonを読み取るか、デフォルト値 `"1.0.0"` を使用する |
| `uninstall(platform_type)` | `_installed` から削除し、`uninstall_history` に追加する。ログ出力のみ |
| `get_installed_version(platform_type)` | `_installed` から該当バージョンを返す。未インストール時は None |

#### テスト支援メソッド

| メソッド | 概要 |
|---|---|
| `set_installed_version(platform_type, version)` | テスト用にインストール済みバージョンを直接設定する |
| `reset()` | 全内部状態をリセットする |

---

### 3.4 DummyStartupRegistry（ダミースタートアップレジストリ）

| 項目 | 内容 |
|---|---|
| 役割 | レジストリ操作をスキップし、登録状態をメモリ上で管理する |
| 実装するインターフェース | `StartupRegistry`（Domain層 §7.4） |
| 使用する外部技術 | `logging`（Python標準） |
| 配置先 | `app/infrastructure/testing/dummy_startup_registry.py` |

#### コンストラクタ

```python
def __init__(
    self,
    initially_registered: bool = False,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `initially_registered` | `bool` | 初期状態で登録済みとするか（デフォルト: False） |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_registered` | `bool` | 登録状態 |
| `register_count` | `int` | register 呼び出し回数（テスト検証用） |
| `unregister_count` | `int` | unregister 呼び出し回数（テスト検証用） |

#### パブリックメソッド

| メソッド | 概要 |
|---|---|
| `register()` | `_registered` を True に設定し、`register_count` をインクリメントする。ログ出力 |
| `unregister()` | `_registered` を False に設定し、`unregister_count` をインクリメントする。ログ出力 |
| `is_registered()` | `_registered` の値を返す |

#### テスト支援メソッド

| メソッド | 概要 |
|---|---|
| `reset()` | 全内部状態をリセットする |

---

### 3.5 DummyDevelopmentToolLauncher（ダミー開発ツールランチャー）

| 項目 | 内容 |
|---|---|
| 役割 | 子プロセス起動をスキップし、起動コマンドをログ出力のみで記録する |
| 実装するインターフェース | `DevelopmentToolLauncher`（Domain層 §7.5） |
| 使用する外部技術 | `logging`（Python標準） |
| 配置先 | `app/infrastructure/testing/dummy_development_tool_launcher.py` |

#### コンストラクタ

```python
def __init__(
    self,
    tool_available: bool = True,
) -> None
```

| 引数 | 型 | 説明 |
|---|---|---|
| `tool_available` | `bool` | ツールが利用可能かを制御するフラグ（デフォルト: True） |

#### 内部状態

| 属性 | 型 | 説明 |
|---|---|---|
| `_tool_available` | `bool` | ツール利用可否フラグ |
| `launch_history` | `list[tuple[str, dict[str, str]]]` | 起動呼び出し履歴（プロジェクトパス, 環境変数dict）。テスト検証用 |

#### パブリックメソッド

| メソッド | 概要 |
|---|---|
| `launch(project_path, env_vars)` | `launch_history` に記録し、ログ出力する。子プロセスは起動しない。`_tool_available` が False の場合は `RuntimeError` をスロー |
| `is_tool_available()` | `_tool_available` の値を返す |

#### テスト支援メソッド

| メソッド | 概要 |
|---|---|
| `set_tool_available(flag: bool)` | ツール利用可否フラグを動的に変更する |
| `get_last_launch()` | 最後の起動呼び出し情報を返す（テスト検証用） |
| `reset()` | 全内部状態をリセットする |

---

## 4. config.json スキーマ定義

FileSystemConfigRepository が読み書きする `%LOCALAPPDATA%\aide-powers\config.json` のデータ構造を定義する。

### 4.1 完全スキーマ

```json
{
  "setup_completed": false,
  "certificate_path": "C:\\cert\\cert.pem",
  "storage": {
    "endpoint": "https://minio.example.com",
    "access_key": "minioadmin",
    "secret_key": "minioadmin"
  },
  "env_vars": {
    "NODE_EXTRA_CA_CERTS": "C:\\cert\\cert.pem",
    "REQUESTS_CA_BUNDLE": "C:\\cert\\cert.pem",
    "SSL_CERT_FILE": "C:\\cert\\cert.pem",
    "CURL_CA_BUNDLE": "C:\\cert\\cert.pem",
    "GIT_SSL_CAINFO": "C:\\cert\\cert.pem",
    "SSL_CERT_DIR": "C:\\cert",
    "ELECTRON_EXTRA_CA_CERTS": "C:\\cert\\cert.pem",
    "UV_NO_SYNC": "1",
    "UV_SYSTEM_PYTHON": "1"
  },
  "installed_platforms": [
    {
      "platform_type": "CLAUDE_CODE",
      "current_version": "1.2.3",
      "latest_version": "1.2.3"
    },
    {
      "platform_type": "KIRO",
      "current_version": "1.1.0",
      "latest_version": "1.2.3"
    }
  ],
  "registered_projects": [
    {
      "path": "C:\\projects\\my-app",
      "last_used_at": "2025-07-15T14:30:00"
    },
    {
      "path": "C:\\projects\\web-service",
      "last_used_at": null
    }
  ],
  "settings": {
    "check_interval_minutes": 60,
    "auto_start": true,
    "default_tool": "kiro",
    "log_level": "INFO"
  }
}
```

### 4.2 フィールド定義

#### トップレベル

| フィールド | 型 | 必須 | デフォルト値 | 説明 | 対応するConfigRepositoryメソッド |
|---|---|---|---|---|---|
| `setup_completed` | `boolean` | はい | `false` | 初期設定ウィザード完了フラグ | `is_setup_completed()`, `mark_setup_completed()` |
| `certificate_path` | `string \| null` | いいえ | `null` | CA証明書ファイルの絶対パス | `load_certificate_path()`, `save_certificate_path()` |
| `storage` | `object \| null` | いいえ | `null` | ストレージ接続情報 | `load_storage_connection()`, `save_storage_connection()` |
| `env_vars` | `object` | はい | `{}` | 環境変数のキー・値マッピング | `load_environment_variables()`, `save_environment_variables()` |
| `installed_platforms` | `array` | はい | `[]` | インストール済みプラットフォーム一覧 | `load_installed_platforms()`, `save_installed_platforms()` |
| `registered_projects` | `array` | はい | `[]` | 登録プロジェクト一覧 | `load_registered_projects()`, `save_registered_projects()` |
| `settings` | `object` | はい | （下記参照） | アプリケーション設定 | SettingsService が ConfigRepository 経由で読み書き |

#### storage オブジェクト

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `endpoint` | `string` | はい | MinIOサーバーのURL（例: `https://minio.example.com`） |
| `access_key` | `string` | はい | MinIOアクセスキー |
| `secret_key` | `string` | はい | MinIOシークレットキー |

#### installed_platforms 配列要素

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `platform_type` | `string` | はい | PlatformType 列挙値の名前（例: `"CLAUDE_CODE"`, `"KIRO"`） |
| `current_version` | `string \| null` | いいえ | 現在インストールされているバージョン（セマンティックバージョニング形式） |
| `latest_version` | `string \| null` | いいえ | ストレージ上の最新バージョン |

#### registered_projects 配列要素

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `path` | `string` | はい | プロジェクトフォルダの絶対パス |
| `last_used_at` | `string \| null` | いいえ | 最終使用日時（ISO 8601形式: `YYYY-MM-DDTHH:MM:SS`）。未使用時は `null` |

#### settings オブジェクト

| フィールド | 型 | 必須 | デフォルト値 | 説明 |
|---|---|---|---|---|
| `check_interval_minutes` | `integer` | はい | `60` | バージョンチェック間隔（分） |
| `auto_start` | `boolean` | はい | `true` | Windows起動時の自動起動ON/OFF |
| `default_tool` | `string` | はい | `"kiro"` | デフォルト起動ツールのコマンド名 |
| `log_level` | `string` | はい | `"INFO"` | ログレベル（`"DEBUG"` / `"INFO"` / `"WARNING"` / `"ERROR"`） |

### 4.3 デフォルト config.json

config.json が存在しない場合に生成されるデフォルト値:

```json
{
  "setup_completed": false,
  "certificate_path": null,
  "storage": null,
  "env_vars": {},
  "installed_platforms": [],
  "registered_projects": [],
  "settings": {
    "check_interval_minutes": 60,
    "auto_start": true,
    "default_tool": "kiro",
    "log_level": "INFO"
  }
}
```

### 4.4 マイグレーション方針

将来 config.json のスキーマが変更される場合に備え、以下の方針を採用する:

- config.json にはスキーマバージョンフィールドを持たない（現時点では不要）
- 読み込み時に存在しないフィールドはデフォルト値で補完する（前方互換性）
- 不明なフィールドは無視する（後方互換性）
- 破壊的変更が必要になった場合は、その時点でマイグレーション機構を導入する

---

## 5. プラットフォーム別インストールパス定義

FileSystemPlatformInstaller が使用する、各プラットフォームのプラグインインストール先パスを定義する。

### 5.1 パス定義一覧

| PlatformType | インストール先パス | 備考 |
|---|---|---|
| `CLAUDE_CODE` | `%APPDATA%\claude\plugin-cache\aide-powers` | Claude Code プラグインキャッシュ。`/plugin install` で初回配置後、以降はこのパスを直接更新 |
| `CODEX_CLI` | `%USERPROFILE%\.codex\plugins\aide-powers` | Codex CLI プラグインディレクトリ。symlink方式の代替として直接配置 |
| `KIRO` | `%USERPROFILE%\.kiro\powers\aide-powers` | Kiro Powers ディレクトリ。git clone方式の代替として直接配置 |
| `CURSOR` | `%APPDATA%\Cursor\plugins\aide-powers` | Cursor プラグインディレクトリ |
| `OPENCODE` | `%USERPROFILE%\.opencode\plugins\aide-powers` | OpenCode プラグインディレクトリ |
| `GEMINI_CLI` | `%USERPROFILE%\.gemini\extensions\aide-powers` | Gemini CLI 拡張ディレクトリ |
| `COPILOT_CLI` | `%APPDATA%\github-copilot-cli\plugins\aide-powers` | Copilot CLI プラグインディレクトリ |
| `VSCODE_COPILOT` | `%USERPROFILE%\.github\plugins\aide-powers` | VSCode GitHub Copilot Agent Plugins ディレクトリ |

### 5.2 パス解決の実装

```python
import os
from pathlib import Path
from app.domain.value_objects import PlatformType

def _resolve_install_paths() -> dict[PlatformType, Path]:
    appdata = os.environ.get("APPDATA", "")
    userprofile = os.environ.get("USERPROFILE", "")

    return {
        PlatformType.CLAUDE_CODE: Path(appdata) / "claude" / "plugin-cache" / "aide-powers",
        PlatformType.CODEX_CLI: Path(userprofile) / ".codex" / "plugins" / "aide-powers",
        PlatformType.KIRO: Path(userprofile) / ".kiro" / "powers" / "aide-powers",
        PlatformType.CURSOR: Path(appdata) / "Cursor" / "plugins" / "aide-powers",
        PlatformType.OPENCODE: Path(userprofile) / ".opencode" / "plugins" / "aide-powers",
        PlatformType.GEMINI_CLI: Path(userprofile) / ".gemini" / "extensions" / "aide-powers",
        PlatformType.COPILOT_CLI: Path(appdata) / "github-copilot-cli" / "plugins" / "aide-powers",
        PlatformType.VSCODE_COPILOT: Path(userprofile) / ".github" / "plugins" / "aide-powers",
    }
```

### 5.3 インストール先ディレクトリの構造

各プラットフォームのインストール先には、以下の構造でファイルが配置される:

```
aide-powers/
├── plugin.json              ← プラグインメタデータ（バージョン情報含む）
├── CLAUDE.md / AGENTS.md    ← 基盤ルール
├── skills/                  ← オーケストレータースキル群
│   └── ...
├── agents/                  ← サブエージェント定義
│   └── ...
├── hooks/                   ← セッション開始フック
│   └── ...
└── （プラットフォーム固有設定ファイル）
```

### 5.4 plugin.json の構造

get_installed_version が読み取る plugin.json の構造:

```json
{
  "name": "aide-powers",
  "version": "1.2.3",
  "description": "AIエージェントを活用したドキュメント駆動開発フレームワーク"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `name` | `string` | プラグイン名 |
| `version` | `string` | セマンティックバージョニング形式のバージョン文字列 |
| `description` | `string` | プラグインの説明 |

---

## 6. エラーハンドリング方針

### 6.1 基本方針

Infrastructure層で発生する外部技術の例外は、Infrastructure層内でキャッチし、以下のいずれかの方法で処理する:

1. **正常系として吸収**: 冪等性を保証するケース（例: 存在しないレジストリ値の削除）
2. **ログ出力 + RuntimeError に変換**: Application層に伝播させるケース
3. **ログ出力 + デフォルト値で補完**: データ破損時のリカバリケース

### 6.2 例外変換マトリクス

| Infrastructure層クラス | 外部例外 | 変換先 | Application層での扱い |
|---|---|---|---|
| MinioPluginRepository | `minio.error.S3Error` | `RuntimeError` | `StorageConnectionError` / `PluginDownloadError` に変換 |
| MinioPluginRepository | `urllib3.exceptions.MaxRetryError` | `RuntimeError` | `StorageConnectionError` に変換 |
| MinioPluginRepository | `urllib3.exceptions.SSLError` | `RuntimeError` | `StorageConnectionError` に変換 |
| FileSystemConfigRepository | `json.JSONDecodeError` | デフォルト値で補完 | `ConfigLoadError`（バックアップ作成後） |
| FileSystemConfigRepository | `PermissionError` | `RuntimeError` | `ConfigLoadError` / `ConfigSaveError` に変換 |
| FileSystemConfigRepository | `OSError` | `RuntimeError` | `ConfigLoadError` / `ConfigSaveError` に変換 |
| FileSystemPlatformInstaller | `zipfile.BadZipFile` | `RuntimeError` | `PluginInstallError` に変換 |
| FileSystemPlatformInstaller | `PermissionError` | `RuntimeError` | `PluginInstallError` / `PluginUninstallError` に変換 |
| FileSystemPlatformInstaller | `shutil.Error` | `RuntimeError` | `PluginInstallError` / `PluginUninstallError` に変換 |
| WindowsRegistryAdapter | `FileNotFoundError` | 正常系として吸収 | — |
| WindowsRegistryAdapter | `PermissionError` | `RuntimeError` | Application層で適切なエラーメッセージに変換 |
| ProcessLauncher | `FileNotFoundError` | `RuntimeError` | `ToolNotFoundError` に変換 |
| ProcessLauncher | `PermissionError` | `RuntimeError` | Application層で適切なエラーメッセージに変換 |

### 6.3 ログ出力ルール

system-requirements.md §7.5 のログ出力方針に準拠する。

| レベル | Infrastructure層での使用場面 |
|---|---|
| `DEBUG` | MinIO API呼び出しの詳細（リクエストURL、レスポンスサイズ等）、config.json の読み書き内容、レジストリ操作の詳細 |
| `INFO` | ダウンロード完了、インストール成功、スタートアップ登録成功、開発ツール起動成功 |
| `WARNING` | config.json 内の不正データのスキップ、バージョン文字列のパース失敗（スキップ） |
| `ERROR` | MinIOサーバー接続失敗、ファイル読み書き失敗、レジストリ操作失敗、子プロセス起動失敗 |

### 6.4 リトライ方針

| 対象 | リトライ回数 | バックオフ | 備考 |
|---|---|---|---|
| MinIO接続（get_latest_version, download_package） | 3回 | 指数バックオフ（1秒, 2秒, 4秒） | urllib3 の Retry 機構を使用 |
| MinIO接続テスト（is_available） | リトライなし | — | 即座に結果を返す |
| ファイルI/O（config.json） | リトライなし | — | 即座にエラーを返す |
| レジストリ操作 | リトライなし | — | 即座にエラーを返す |
| 子プロセス起動 | リトライなし | — | 即座にエラーを返す |

---

## 7. Infrastructure層のチェックリスト

| # | チェック項目 | 状態 | 備考 |
|---|---|---|---|
| 1 | Infrastructure層にビジネスロジック（バージョン比較、更新ポリシー判定、環境変数バリデーション等）が実装されていないこと | ✅ | Domain層に委譲 |
| 2 | Infrastructure層がDomain層のリポジトリインターフェースを正確に実装していること | ✅ | 全5インターフェースの全メソッドを実装 |
| 3 | ドメインオブジェクトの不変条件の検証をInfrastructure層で行っていないこと | ✅ | PluginVersion.from_string() 等のドメイン層ファクトリメソッドを使用 |
| 4 | 外部技術の例外がそのまま上位レイヤーに伝播しないこと | ✅ | §6 のエラーハンドリング方針に従い変換 |
| 5 | テスト用ダミー実装が全リポジトリインターフェースに対して設計されていること | ✅ | 5クラスのダミー実装を設計 |
| 6 | ダミー実装がDIで本番実装と切り替え可能であること | ✅ | 同一インターフェースを実装。Composition Root で切り替え |
| 7 | config.json のスキーマが ConfigRepository の全メソッドが必要とするデータを網羅していること | ✅ | §4 で全フィールドを定義 |
| 8 | 8プラットフォームのインストールパスが定義されていること | ✅ | §5 で全8プラットフォームのパスを定義 |
| 9 | system-requirements.md の技術スタック（minio-py 7.2.x, Python 3.10+, winreg等）に準拠していること | ✅ | 各クラスの使用技術が技術スタックに一致 |
| 10 | ユビキタス言語辞書に準拠した命名を使用していること | ✅ | PluginRepository, ConfigRepository, PlatformInstaller, StartupRegistry, DevelopmentToolLauncher |
| 11 | Application層・Presentation層への直接依存がないこと | ✅ | Domain層のインターフェースのみを実装 |
| 12 | ログ出力が system-requirements.md §7.5 のログ出力方針に準拠していること | ✅ | §6.3 でログレベル別の使用場面を定義 |
| 13 | アトミック書き込み（config.json）が設計されていること | ✅ | §2.2 で一時ファイル → rename 方式を定義 |
| 14 | 冪等性が必要な操作（uninstall, unregister）で冪等性が保証されていること | ✅ | 存在しないリソースの削除でエラーにならない設計 |
| 15 | CA証明書パスを使用したSSL接続が設計されていること | ✅ | MinioPluginRepository のコンストラクタで certificate_path を受け取る |

---

*本文書はユーザー要件定義書（user-requirements.md）、システム要件定義書（system-requirements.md）、GUI設計書（gui-design.md）、レイヤードアーキテクチャ設計書（layered-architecture.md）、ドメイン層オブジェクト設計書（object-design-domain.md）、アプリケーション層オブジェクト設計書（object-design-application.md）、ユビキタス言語辞書（ubiquitous-language.md）に基づき作成されたインフラストラクチャ層オブジェクト設計書です。*