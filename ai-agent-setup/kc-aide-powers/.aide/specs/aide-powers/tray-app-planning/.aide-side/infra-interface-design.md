# インフラ/インターフェース設計: aide-powers タスクトレイ管理アプリ

## 1. 設計対象の一覧

本ドキュメントは、オブジェクト設計で定義されたドメインモデルとレイヤードアーキテクチャに基づき、外部との境界（REST API、WebSocket、データストア、外部サービス連携）のインターフェース仕様を具体化する。

### 1.1 設計対象インターフェース

| # | カテゴリ | インターフェース | 参照元 | 本ドキュメントでの扱い |
|---|---|---|---|---|
| 1 | REST API | 全30エンドポイント | object-design-presentation.md §4.5 | §2 で JSON Schema を厳密定義 |
| 2 | WebSocket | リアルタイム通知メッセージ | object-design-presentation.md §5.8 | §3 でメッセージスキーマを定義 |
| 3 | データストア | config.json | object-design-infrastructure.md §4 | §4 で JSON Schema を厳密定義（補足・詳細化） |
| 4 | 外部サービス | MinIO S3互換ストレージ | object-design-infrastructure.md §2.1 | §5 でバケット構造・接続仕様を定義 |
| 5 | 外部サービス | Windowsレジストリ | object-design-infrastructure.md §2.4 | §6 でキーパス・値形式を定義 |
| 6 | 外部サービス | 子プロセス起動 | object-design-infrastructure.md §2.5 | §7 で起動コマンド・環境変数マージを定義 |
| 7 | ファイルシステム | プラットフォーム別インストールパス | object-design-infrastructure.md §5 | §8 でパス解決・plugin.json スキーマを定義 |
| 8 | リポジトリ具象実装 | 5リポジトリの具象実装方針 | object-design-domain.md §7 | §9 でデータマッピングルールを定義 |
| 9 | エラーハンドリング | 例外変換マトリクス | object-design-infrastructure.md §6 | §10 で統一方針を定義 |

### 1.2 設計方針

- DDD採用済みのため、ドメインオブジェクトと永続化スキーマは明確に分離する
- APIのリクエスト/レスポンスにはDTO（Application層で定義済み）を使用し、ドメインオブジェクトを直接公開しない
- リポジトリの具象実装はドメイン層のインターフェースに忠実に従う
- object-design-infrastructure.md で既に詳細設計されている内容は参照のみとし、重複を避ける。本ドキュメントでは「インターフェース仕様」（外部との契約）に焦点を当てる

---

## 2. REST API 詳細仕様

### 2.1 共通仕様

#### ベースURL

```
http://127.0.0.1:{port}
```

- ポートはランダムな高ポート（49152〜65534）から選択される
- `127.0.0.1` のみにバインド（外部ネットワークからのアクセス不可）

#### Content-Type

すべてのAPIリクエスト・レスポンスは `Content-Type: application/json; charset=utf-8` で通信する。

#### 共通レスポンスエンベロープ

成功時:
```json
{
  "success": true,
  "data": { ... }
}
```

エラー時:
```json
{
  "success": false,
  "error": "エラーメッセージ（日本語）"
}
```

#### 共通レスポンスJSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "SuccessResponse": {
      "type": "object",
      "required": ["success"],
      "properties": {
        "success": { "type": "boolean", "const": true },
        "data": {}
      }
    },
    "ErrorResponse": {
      "type": "object",
      "required": ["success", "error"],
      "properties": {
        "success": { "type": "boolean", "const": false },
        "error": { "type": "string", "minLength": 1 }
      }
    }
  }
}
```

#### HTTPステータスコード一覧

| ステータス | 意味 | 使用場面 |
|---|---|---|
| 200 OK | 正常完了 | GET/POST の正常レスポンス |
| 400 Bad Request | リクエスト不正 | 必須フィールド不在、型不正、バリデーションエラー |
| 403 Forbidden | 操作不許可 | 初期設定未完了状態での操作 |
| 404 Not Found | リソース不在 | 開発ツール不在、プロジェクトフォルダ不在 |
| 500 Internal Server Error | サーバー内部エラー | 設定ファイル読み書き失敗、インストール失敗 |
| 502 Bad Gateway | 外部サービスエラー | ストレージ接続失敗、ダウンロード失敗 |

#### Application層例外 → HTTPステータス変換マトリクス

| Application層例外 | HTTPステータス | error メッセージ |
|---|---|---|
| `StorageConnectionError` | 502 | ストレージサーバーに接続できません |
| `PluginDownloadError` | 502 | プラグインのダウンロードに失敗しました |
| `PluginInstallError` | 500 | プラグインのインストールに失敗しました |
| `PluginUninstallError` | 500 | プラグインの削除に失敗しました |
| `ConfigLoadError` | 500 | 設定ファイルの読み込みに失敗しました |
| `ConfigSaveError` | 500 | 設定ファイルの保存に失敗しました |
| `ToolNotFoundError` | 404 | 開発ツールが見つかりません |
| `ProjectPathNotFoundError` | 404 | プロジェクトフォルダが見つかりません |
| `CertificateFileNotFoundError` | 400 | 証明書ファイルが見つかりません |
| `InvalidCertificatePathError` | 400 | 証明書パスの形式が不正です |
| `InvalidStorageConnectionError` | 400 | ストレージ接続情報が不正です |
| `InvalidEnvironmentVariableError` | 400 | 環境変数キーが不正です |
| `DuplicateEnvironmentVariableError` | 400 | 環境変数キーが重複しています |
| `SetupNotCompletedError` | 403 | 初期設定が完了していません |
| その他の `ApplicationError` | 500 | 内部エラーが発生しました |
| 未知の `Exception` | 500 | 内部エラーが発生しました |

### 2.2 ウィザード関連API（9エンドポイント）

#### GET `/api/wizard/state`

ウィザードの現在状態を取得する。

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": {
    "current_step": 1,
    "selected_platforms": ["Claude Code", "Kiro"],
    "certificate_path": "C:\\cert\\cert.pem",
    "storage_endpoint": "https://minio.example.com",
    "is_storage_connected": true,
    "is_certificate_valid": true,
    "setup_completed": false
  }
}
```

**レスポンス data JSON Schema:**
```json
{
  "type": "object",
  "required": ["current_step", "selected_platforms", "certificate_path", "storage_endpoint", "is_storage_connected", "is_certificate_valid", "setup_completed"],
  "properties": {
    "current_step": { "type": "integer", "minimum": 1, "maximum": 6 },
    "selected_platforms": { "type": "array", "items": { "type": "string" } },
    "certificate_path": { "type": ["string", "null"] },
    "storage_endpoint": { "type": ["string", "null"] },
    "is_storage_connected": { "type": "boolean" },
    "is_certificate_valid": { "type": "boolean" },
    "setup_completed": { "type": "boolean" }
  }
}
```

---

#### POST `/api/wizard/platforms`

選択プラットフォームを保存する。

**リクエスト:**
```json
{
  "platform_types": ["CLAUDE_CODE", "KIRO", "CURSOR"]
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["platform_types"],
  "properties": {
    "platform_types": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"]
      }
    }
  }
}
```

**バリデーションルール:**
- `platform_types` は必須（不在時: 400 `platform_types は必須です`）
- `platform_types` はリスト形式（型不正時: 400 `platform_types はリスト形式で指定してください`）
- 1つ以上の要素が必要（空リスト時: 400 `少なくとも1つのプラットフォームを選択してください`）
- 各要素は有効な PlatformType 列挙値（不正値時: 400 `不正なプラットフォーム種別です: {value}`）

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/wizard/certificate`

証明書パスを保存する。

**リクエスト:**
```json
{
  "path": "C:\\cert\\cert_Kyocera_CAs.pem"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["path"],
  "properties": {
    "path": { "type": "string", "minLength": 1 }
  }
}
```

**バリデーションルール:**
- `path` は必須（不在時: 400 `path は必須です`）
- `path` は空でない文字列（空文字時: 400 `証明書ファイルのパスを入力してください`）
- ドメイン層バリデーション: 拡張子が `.pem`（不正時: 400 `.pemファイルを指定してください`）
- ファイル存在チェック（不在時: 400 `指定されたパスにファイルが見つかりません`）

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/wizard/certificate/validate`

証明書ファイルの存在検証を行う（リアルタイムバリデーション用）。

**リクエスト:**
```json
{
  "path": "C:\\cert\\cert_Kyocera_CAs.pem"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["path"],
  "properties": {
    "path": { "type": "string", "minLength": 1 }
  }
}
```

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "is_valid_extension": true
  }
}
```

**レスポンス data JSON Schema:**
```json
{
  "type": "object",
  "required": ["exists", "is_valid_extension"],
  "properties": {
    "exists": { "type": "boolean" },
    "is_valid_extension": { "type": "boolean" }
  }
}
```

---

#### POST `/api/wizard/storage`

ストレージ接続情報を保存する。

**リクエスト:**
```json
{
  "endpoint": "https://minio.example.com",
  "access_key": "minioadmin",
  "secret_key": "minioadmin"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["endpoint", "access_key", "secret_key"],
  "properties": {
    "endpoint": { "type": "string", "minLength": 1, "pattern": "^https?://" },
    "access_key": { "type": "string", "minLength": 1 },
    "secret_key": { "type": "string", "minLength": 1 }
  }
}
```

**バリデーションルール:**
- `endpoint` は必須かつ `http://` または `https://` で始まるURL形式
- `access_key` は必須かつ空でない
- `secret_key` は必須かつ空でない

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/wizard/storage/test`

ストレージ接続テストを実行する。

**リクエスト:** `/api/wizard/storage` と同一スキーマ

**レスポンス（200 OK — 接続成功）:**
```json
{ "success": true }
```

**レスポンス（502 — 接続失敗）:**
```json
{
  "success": false,
  "error": "接続に失敗しました: タイムアウト"
}
```

---

#### POST `/api/wizard/install/start`

インストール実行を開始する。

**リクエスト:** ボディなし（保存済みの設定に基づいて実行）

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### GET `/api/wizard/install/status`

インストール進捗を取得する。

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": {
    "percentage": 60,
    "total_steps": 5,
    "completed_steps": 3,
    "current_step_name": "Kiro にインストール中...",
    "steps": [
      { "name": "プラグインのダウンロード", "status": "completed", "error_message": null },
      { "name": "プラグインの展開", "status": "completed", "error_message": null },
      { "name": "Claude Code にインストール", "status": "completed", "error_message": null },
      { "name": "Kiro にインストール", "status": "running", "error_message": null },
      { "name": "スタートアップ登録", "status": "pending", "error_message": null }
    ],
    "is_completed": false,
    "has_error": false,
    "error_message": null
  }
}
```

**レスポンス data JSON Schema:**
```json
{
  "type": "object",
  "required": ["percentage", "total_steps", "completed_steps", "current_step_name", "steps", "is_completed", "has_error", "error_message"],
  "properties": {
    "percentage": { "type": "integer", "minimum": 0, "maximum": 100 },
    "total_steps": { "type": "integer", "minimum": 1 },
    "completed_steps": { "type": "integer", "minimum": 0 },
    "current_step_name": { "type": ["string", "null"] },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "status", "error_message"],
        "properties": {
          "name": { "type": "string" },
          "status": { "type": "string", "enum": ["pending", "running", "completed", "failed"] },
          "error_message": { "type": ["string", "null"] }
        }
      }
    },
    "is_completed": { "type": "boolean" },
    "has_error": { "type": "boolean" },
    "error_message": { "type": ["string", "null"] }
  }
}
```

---

#### POST `/api/wizard/complete`

セットアップ完了を記録する。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

### 2.3 ダッシュボード関連API（9エンドポイント）

#### GET `/api/dashboard/platforms`

インストール済みプラットフォーム一覧を取得する。

**レスポンス（200 OK）:**
```json
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
    },
    {
      "platform_name": "Kiro",
      "platform_type": "KIRO",
      "current_version": "1.2.3",
      "latest_version": "1.2.3",
      "update_status": "up_to_date",
      "has_update": false
    }
  ]
}
```

**レスポンス data 配列要素 JSON Schema:**
```json
{
  "type": "object",
  "required": ["platform_name", "platform_type", "current_version", "latest_version", "update_status", "has_update"],
  "properties": {
    "platform_name": { "type": "string" },
    "platform_type": { "type": "string", "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"] },
    "current_version": { "type": ["string", "null"], "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "latest_version": { "type": ["string", "null"], "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "update_status": { "type": "string", "enum": ["up_to_date", "update_available", "error", "unknown"] },
    "has_update": { "type": "boolean" }
  }
}
```

---

#### POST `/api/dashboard/check`

バージョンチェックを即時実行する。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
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

レスポンス data スキーマは `GET /api/dashboard/platforms` と同一。

---

#### POST `/api/dashboard/update`

指定プラットフォームの更新を実行する。

**リクエスト:**
```json
{
  "platform_type": "CLAUDE_CODE"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["platform_type"],
  "properties": {
    "platform_type": {
      "type": "string",
      "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"]
    }
  }
}
```

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/dashboard/update/all`

全プラットフォームを一括更新する。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### GET `/api/dashboard/update/status`

更新進捗を取得する。

**レスポンス:** `GET /api/wizard/install/status` と同一スキーマ（InstallProgressDTO）。

---

#### GET `/api/dashboard/projects`

登録プロジェクト一覧を取得する。

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": [
    {
      "path": "C:\\projects\\my-app",
      "folder_name": "my-app",
      "last_used_at": "2025-07-15T14:30:00"
    },
    {
      "path": "C:\\projects\\web-service",
      "folder_name": "web-service",
      "last_used_at": null
    }
  ]
}
```

**レスポンス data 配列要素 JSON Schema:**
```json
{
  "type": "object",
  "required": ["path", "folder_name", "last_used_at"],
  "properties": {
    "path": { "type": "string", "minLength": 1 },
    "folder_name": { "type": "string", "minLength": 1 },
    "last_used_at": { "type": ["string", "null"], "format": "date-time" }
  }
}
```

---

#### POST `/api/dashboard/projects`

プロジェクトを登録する。

**リクエスト:**
```json
{
  "path": "C:\\projects\\my-app"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["path"],
  "properties": {
    "path": { "type": "string", "minLength": 1 }
  }
}
```

**バリデーションルール:**
- `path` は必須かつ空でない文字列
- フォルダが存在すること（不在時: 404 `プロジェクトフォルダが見つかりません`）
- 同一パスが未登録であること（重複時: 400 `このプロジェクトは既に登録されています`）

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": {
    "path": "C:\\projects\\my-app",
    "folder_name": "my-app",
    "last_used_at": null
  }
}
```

---

#### POST `/api/dashboard/projects/remove`

プロジェクト登録を解除する（プロジェクトファイル自体は削除しない）。

**リクエスト:**
```json
{
  "path": "C:\\projects\\my-app"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["path"],
  "properties": {
    "path": { "type": "string", "minLength": 1 }
  }
}
```

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/dashboard/projects/launch`

プロジェクトを開発ツールで開く。

**リクエスト:**
```json
{
  "path": "C:\\projects\\my-app"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["path"],
  "properties": {
    "path": { "type": "string", "minLength": 1 }
  }
}
```

**バリデーションルール:**
- `path` は必須かつ空でない文字列
- フォルダが存在すること（不在時: 404 `プロジェクトフォルダが見つかりません`）
- 開発ツールが利用可能であること（不在時: 404 `開発ツールが見つかりません`）

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

### 2.4 設定関連API（12エンドポイント）

#### POST `/api/settings/platforms/add`

プラットフォームを追加インストールする。

**リクエスト:**
```json
{
  "platform_types": ["CODEX_CLI", "OPENCODE"]
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["platform_types"],
  "properties": {
    "platform_types": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"]
      }
    }
  }
}
```

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/settings/platforms/remove`

プラットフォームからプラグインを削除する。

**リクエスト:**
```json
{
  "platform_type": "CURSOR"
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["platform_type"],
  "properties": {
    "platform_type": {
      "type": "string",
      "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"]
    }
  }
}
```

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### GET `/api/settings/storage`

ストレージ接続情報を取得する。シークレットキーはマスク表示用に部分的に返す。

**レスポンス（200 OK — 設定済み）:**
```json
{
  "success": true,
  "data": {
    "endpoint": "https://minio.example.com",
    "access_key": "minioadmin",
    "secret_key_masked": "mini****min"
  }
}
```

**レスポンス（200 OK — 未設定）:**
```json
{
  "success": true,
  "data": null
}
```

**レスポンス data JSON Schema:**
```json
{
  "oneOf": [
    { "type": "null" },
    {
      "type": "object",
      "required": ["endpoint", "access_key", "secret_key_masked"],
      "properties": {
        "endpoint": { "type": "string" },
        "access_key": { "type": "string" },
        "secret_key_masked": { "type": "string" }
      }
    }
  ]
}
```

---

#### POST `/api/settings/storage`

ストレージ接続情報を保存する。

**リクエスト:** `/api/wizard/storage` と同一スキーマ

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/settings/storage/test`

ストレージ接続テストを実行する（設定画面用）。

**リクエスト・レスポンス:** `/api/wizard/storage/test` と同一。

---

#### GET `/api/settings/general`

全般設定を取得する。

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": {
    "check_interval_minutes": 60,
    "auto_start": true,
    "default_tool": "kiro",
    "certificate_path": "C:\\cert\\cert.pem",
    "env_vars_enabled": true,
    "environment_variables": [
      { "key": "NODE_EXTRA_CA_CERTS", "value": "C:\\cert\\cert.pem" },
      { "key": "REQUESTS_CA_BUNDLE", "value": "C:\\cert\\cert.pem" },
      { "key": "SSL_CERT_FILE", "value": "C:\\cert\\cert.pem" },
      { "key": "CURL_CA_BUNDLE", "value": "C:\\cert\\cert.pem" },
      { "key": "GIT_SSL_CAINFO", "value": "C:\\cert\\cert.pem" },
      { "key": "SSL_CERT_DIR", "value": "C:\\cert" },
      { "key": "ELECTRON_EXTRA_CA_CERTS", "value": "C:\\cert\\cert.pem" },
      { "key": "UV_NO_SYNC", "value": "1" },
      { "key": "UV_SYSTEM_PYTHON", "value": "1" }
    ],
    "log_level": "INFO"
  }
}
```

**レスポンス data JSON Schema:**
```json
{
  "type": "object",
  "required": ["check_interval_minutes", "auto_start", "default_tool", "certificate_path", "env_vars_enabled", "environment_variables", "log_level"],
  "properties": {
    "check_interval_minutes": { "type": "integer", "enum": [15, 30, 60, 120, 360] },
    "auto_start": { "type": "boolean" },
    "default_tool": { "type": "string" },
    "certificate_path": { "type": ["string", "null"] },
    "env_vars_enabled": { "type": "boolean" },
    "environment_variables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["key", "value"],
        "properties": {
          "key": { "type": "string", "pattern": "^[A-Za-z_][A-Za-z0-9_]*$" },
          "value": { "type": "string" }
        }
      }
    },
    "log_level": { "type": "string", "enum": ["DEBUG", "INFO", "WARNING", "ERROR"] }
  }
}
```

---

#### POST `/api/settings/general`

全般設定を保存する。

**リクエスト:** `GET /api/settings/general` のレスポンス data と同一スキーマ

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### GET `/api/settings/env-vars`

環境変数一覧を取得する。

**レスポンス（200 OK）:**
```json
{
  "success": true,
  "data": [
    { "key": "NODE_EXTRA_CA_CERTS", "value": "C:\\cert\\cert.pem" },
    { "key": "UV_NO_SYNC", "value": "1" }
  ]
}
```

**レスポンス data JSON Schema:**
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["key", "value"],
    "properties": {
      "key": { "type": "string", "pattern": "^[A-Za-z_][A-Za-z0-9_]*$" },
      "value": { "type": "string" }
    }
  }
}
```

---

#### POST `/api/settings/env-vars`

環境変数一覧を保存する。

**リクエスト:**
```json
{
  "variables": [
    { "key": "NODE_EXTRA_CA_CERTS", "value": "C:\\cert\\cert.pem" },
    { "key": "UV_NO_SYNC", "value": "1" }
  ]
}
```

**リクエスト JSON Schema:**
```json
{
  "type": "object",
  "required": ["variables"],
  "properties": {
    "variables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["key", "value"],
        "properties": {
          "key": { "type": "string", "minLength": 1, "pattern": "^[A-Za-z_][A-Za-z0-9_]*$" },
          "value": { "type": "string" }
        }
      }
    }
  }
}
```

**バリデーションルール:**
- `variables` は必須
- 各要素の `key` は空でなく、`^[A-Za-z_][A-Za-z0-9_]*$` パターンに一致すること
- `key` の重複がないこと（重複時: 400 `環境変数キーが重複しています`）

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/settings/env-vars/reset`

環境変数をデフォルトのプリセットにリセットする。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

#### POST `/api/settings/log/open`

ログファイルをデフォルトのテキストエディタで開く。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

### 2.5 REST API エンドポイント一覧（サマリ）

| # | メソッド | エンドポイント | 概要 | カテゴリ |
|---|---|---|---|---|
| 1 | GET | `/api/wizard/state` | ウィザード状態取得 | ウィザード |
| 2 | POST | `/api/wizard/platforms` | プラットフォーム選択保存 | ウィザード |
| 3 | POST | `/api/wizard/certificate` | 証明書パス保存 | ウィザード |
| 4 | POST | `/api/wizard/certificate/validate` | 証明書ファイル検証 | ウィザード |
| 5 | POST | `/api/wizard/storage` | ストレージ接続情報保存 | ウィザード |
| 6 | POST | `/api/wizard/storage/test` | ストレージ接続テスト | ウィザード |
| 7 | POST | `/api/wizard/install/start` | インストール開始 | ウィザード |
| 8 | GET | `/api/wizard/install/status` | インストール進捗取得 | ウィザード |
| 9 | POST | `/api/wizard/complete` | セットアップ完了記録 | ウィザード |
| 10 | GET | `/api/dashboard/platforms` | プラットフォーム一覧取得 | ダッシュボード |
| 11 | POST | `/api/dashboard/check` | バージョンチェック実行 | ダッシュボード |
| 12 | POST | `/api/dashboard/update` | 個別プラットフォーム更新 | ダッシュボード |
| 13 | POST | `/api/dashboard/update/all` | 全プラットフォーム一括更新 | ダッシュボード |
| 14 | GET | `/api/dashboard/update/status` | 更新進捗取得 | ダッシュボード |
| 15 | GET | `/api/dashboard/projects` | プロジェクト一覧取得 | ダッシュボード |
| 16 | POST | `/api/dashboard/projects` | プロジェクト登録 | ダッシュボード |
| 17 | POST | `/api/dashboard/projects/remove` | プロジェクト登録解除 | ダッシュボード |
| 18 | POST | `/api/dashboard/projects/launch` | プロジェクト起動 | ダッシュボード |
| 19 | POST | `/api/settings/platforms/add` | プラットフォーム追加 | 設定 |
| 20 | POST | `/api/settings/platforms/remove` | プラットフォーム削除 | 設定 |
| 21 | GET | `/api/settings/storage` | ストレージ接続情報取得 | 設定 |
| 22 | POST | `/api/settings/storage` | ストレージ設定保存 | 設定 |
| 23 | POST | `/api/settings/storage/test` | ストレージ接続テスト | 設定 |
| 24 | GET | `/api/settings/general` | 全般設定取得 | 設定 |
| 25 | POST | `/api/settings/general` | 全般設定保存 | 設定 |
| 26 | GET | `/api/settings/env-vars` | 環境変数一覧取得 | 設定 |
| 27 | POST | `/api/settings/env-vars` | 環境変数一覧保存 | 設定 |
| 28 | POST | `/api/settings/env-vars/reset` | 環境変数プリセットリセット | 設定 |
| 29 | POST | `/api/settings/log/open` | ログファイルを開く | 設定 |
| 30 | POST | `/api/wizard/install/retry` | 失敗ステップのリトライ | ウィザード |

#### エンドポイント #30: POST `/api/wizard/install/retry`

失敗したインストールステップをリトライする。

**リクエスト:** ボディなし

**レスポンス（200 OK）:**
```json
{ "success": true }
```

---

## 3. WebSocket メッセージ詳細仕様

### 3.1 接続管理

| 項目 | 仕様 |
|---|---|
| エンドポイント | `ws://127.0.0.1:{port}/ws` |
| プロトコル | WebSocket（RFC 6455） |
| メッセージ形式 | JSON（UTF-8） |
| 方向 | サーバー → クライアント（プッシュ）。クライアント → サーバーのメッセージは現時点では無視する |
| 接続管理 | 接続確立時に内部セットに追加、切断時に除去 |
| 切断処理 | サーバー停止時に全接続をクローズ |

### 3.2 メッセージ共通エンベロープ

```json
{
  "type": "メッセージタイプ",
  "data": { ... }
}
```

**共通 JSON Schema:**
```json
{
  "type": "object",
  "required": ["type", "data"],
  "properties": {
    "type": { "type": "string", "enum": ["install_progress", "update_progress", "version_check"] },
    "data": { "type": "object" }
  }
}
```

### 3.3 メッセージタイプ一覧

| # | type | 送信タイミング | 用途 |
|---|---|---|---|
| 1 | `install_progress` | インストール実行中（1秒間隔） | WIZ-04 のプログレスバー・ステップ一覧更新 |
| 2 | `update_progress` | 更新実行中（1秒間隔） | DASH の更新プログレス表示 |
| 3 | `version_check` | 定期バージョンチェック完了時 | DASH の更新通知バナー更新 |

### 3.4 install_progress メッセージ

```json
{
  "type": "install_progress",
  "data": {
    "percentage": 60,
    "total_steps": 5,
    "completed_steps": 3,
    "current_step_name": "Kiro にインストール中...",
    "steps": [
      { "name": "プラグインのダウンロード", "status": "completed", "error_message": null },
      { "name": "プラグインの展開", "status": "completed", "error_message": null },
      { "name": "Claude Code にインストール", "status": "completed", "error_message": null },
      { "name": "Kiro にインストール", "status": "running", "error_message": null },
      { "name": "スタートアップ登録", "status": "pending", "error_message": null }
    ],
    "is_completed": false,
    "has_error": false,
    "error_message": null
  }
}
```

**data JSON Schema:** `GET /api/wizard/install/status` のレスポンス data と同一スキーマ。

### 3.5 update_progress メッセージ

```json
{
  "type": "update_progress",
  "data": {
    "percentage": 50,
    "platform_name": "Claude Code",
    "platform_type": "CLAUDE_CODE",
    "status": "running",
    "error_message": null
  }
}
```

**data JSON Schema:**
```json
{
  "type": "object",
  "required": ["percentage", "platform_name", "platform_type", "status", "error_message"],
  "properties": {
    "percentage": { "type": "integer", "minimum": 0, "maximum": 100 },
    "platform_name": { "type": "string" },
    "platform_type": { "type": "string", "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"] },
    "status": { "type": "string", "enum": ["pending", "running", "completed", "failed"] },
    "error_message": { "type": ["string", "null"] }
  }
}
```

### 3.6 version_check メッセージ

```json
{
  "type": "version_check",
  "data": {
    "has_update": true,
    "latest_version": "1.2.3",
    "platforms": [
      {
        "platform_name": "Claude Code",
        "platform_type": "CLAUDE_CODE",
        "current_version": "1.1.0",
        "latest_version": "1.2.3",
        "has_update": true
      },
      {
        "platform_name": "Kiro",
        "platform_type": "KIRO",
        "current_version": "1.2.3",
        "latest_version": "1.2.3",
        "has_update": false
      }
    ]
  }
}
```

**data JSON Schema:**
```json
{
  "type": "object",
  "required": ["has_update", "latest_version", "platforms"],
  "properties": {
    "has_update": { "type": "boolean" },
    "latest_version": { "type": ["string", "null"], "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "platforms": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["platform_name", "platform_type", "current_version", "latest_version", "has_update"],
        "properties": {
          "platform_name": { "type": "string" },
          "platform_type": { "type": "string" },
          "current_version": { "type": ["string", "null"] },
          "latest_version": { "type": ["string", "null"] },
          "has_update": { "type": "boolean" }
        }
      }
    }
  }
}
```

### 3.7 将来の拡張ポイント

クライアント → サーバー方向のメッセージは現時点では無視するが、将来以下の用途で拡張可能:
- クライアントからのインストール中断リクエスト
- desk-agents 追加時のリアルタイム制御コマンド

---

## 4. config.json 詳細スキーマ

### 4.1 概要

object-design-infrastructure.md §4 で定義された config.json スキーマの JSON Schema 形式での厳密定義を行う。

- ファイルパス: `%LOCALAPPDATA%\aide-powers\config.json`
- エンコーディング: UTF-8（BOMなし）
- 改行コード: CRLF（Windows環境）

### 4.2 完全 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "aide-powers-config-v1",
  "title": "aide-powers config.json",
  "description": "aide-powersタスクトレイ管理アプリの設定ファイルスキーマ",
  "type": "object",
  "required": ["setup_completed", "env_vars", "installed_platforms", "registered_projects", "settings"],
  "properties": {
    "setup_completed": {
      "type": "boolean",
      "default": false,
      "description": "初期設定ウィザード完了フラグ"
    },
    "certificate_path": {
      "type": ["string", "null"],
      "default": null,
      "description": "CA証明書ファイルの絶対パス（.pem形式）",
      "pattern": "\\.pem$"
    },
    "storage": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "required": ["endpoint", "access_key", "secret_key"],
          "properties": {
            "endpoint": {
              "type": "string",
              "pattern": "^https?://",
              "description": "MinIOサーバーのURL"
            },
            "access_key": {
              "type": "string",
              "minLength": 1,
              "description": "MinIOアクセスキー"
            },
            "secret_key": {
              "type": "string",
              "minLength": 1,
              "description": "MinIOシークレットキー"
            }
          },
          "additionalProperties": false
        }
      ],
      "default": null,
      "description": "ストレージ接続情報"
    },
    "env_vars": {
      "type": "object",
      "default": {},
      "description": "環境変数のキー・値マッピング",
      "patternProperties": {
        "^[A-Za-z_][A-Za-z0-9_]*$": { "type": "string" }
      },
      "additionalProperties": false
    },
    "installed_platforms": {
      "type": "array",
      "default": [],
      "description": "インストール済みプラットフォーム一覧",
      "items": {
        "type": "object",
        "required": ["platform_type"],
        "properties": {
          "platform_type": {
            "type": "string",
            "enum": ["CLAUDE_CODE", "CODEX_CLI", "KIRO", "CURSOR", "OPENCODE", "GEMINI_CLI", "COPILOT_CLI", "VSCODE_COPILOT"]
          },
          "current_version": {
            "type": ["string", "null"],
            "pattern": "^\\d+\\.\\d+\\.\\d+$",
            "default": null
          },
          "latest_version": {
            "type": ["string", "null"],
            "pattern": "^\\d+\\.\\d+\\.\\d+$",
            "default": null
          }
        },
        "additionalProperties": false
      }
    },
    "registered_projects": {
      "type": "array",
      "default": [],
      "description": "登録プロジェクト一覧",
      "items": {
        "type": "object",
        "required": ["path"],
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1,
            "description": "プロジェクトフォルダの絶対パス"
          },
          "last_used_at": {
            "type": ["string", "null"],
            "format": "date-time",
            "default": null,
            "description": "最終使用日時（ISO 8601形式）"
          }
        },
        "additionalProperties": false
      }
    },
    "settings": {
      "type": "object",
      "required": ["check_interval_minutes", "auto_start", "default_tool", "log_level"],
      "properties": {
        "check_interval_minutes": {
          "type": "integer",
          "enum": [15, 30, 60, 120, 360],
          "default": 60,
          "description": "バージョンチェック間隔（分）"
        },
        "auto_start": {
          "type": "boolean",
          "default": true,
          "description": "Windows起動時の自動起動ON/OFF"
        },
        "default_tool": {
          "type": "string",
          "default": "kiro",
          "description": "デフォルト起動ツールのコマンド名"
        },
        "log_level": {
          "type": "string",
          "enum": ["DEBUG", "INFO", "WARNING", "ERROR"],
          "default": "INFO",
          "description": "ログレベル"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": true
}
```

### 4.3 マイグレーション方針の詳細

object-design-infrastructure.md §4.4 で定義された方針を補足する。

| 方針 | 詳細 |
|---|---|
| 前方互換性 | 読み込み時に存在しないフィールドはデフォルト値で補完する。新しいバージョンのアプリが古い config.json を読んでも動作する |
| 後方互換性 | 不明なフィールドは無視する（`additionalProperties: true` をトップレベルで許容）。古いバージョンのアプリが新しい config.json を読んでも動作する |
| スキーマバージョン | 現時点ではスキーマバージョンフィールドを持たない。破壊的変更が必要になった場合に導入する |
| 破損リカバリ | JSON パースに失敗した場合、バックアップ（`config.json.bak`）を作成し、デフォルト値で再初期化する |

### 4.4 デフォルト config.json

config.json が存在しない場合に生成されるデフォルト値（object-design-infrastructure.md §4.3 と同一）:

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

---

## 5. MinIO S3互換ストレージ連携仕様

### 5.1 バケット構造

| 項目 | 値 |
|---|---|
| バケット名 | `aide-powers` |
| リージョン | デフォルト（MinIOローカル） |
| アクセス制御 | プライベート（認証必須） |

#### オブジェクト命名規則

```
aide-powers/
├── aide-powers-1.0.0.zip
├── aide-powers-1.1.0.zip
├── aide-powers-1.2.3.zip
└── ...
```

| 項目 | 規則 |
|---|---|
| プレフィックス | `aide-powers/` |
| ファイル名形式 | `aide-powers-{major}.{minor}.{patch}.zip` |
| バージョン形式 | セマンティックバージョニング（`\d+\.\d+\.\d+`） |
| ファイル形式 | ZIP（プラグインパッケージ） |

#### バージョン抽出の正規表現

```python
PACKAGE_PATTERN = r"^aide-powers/aide-powers-(\d+\.\d+\.\d+)\.zip$"
```

### 5.2 接続パラメータ

| パラメータ | 値 | 説明 |
|---|---|---|
| endpoint | ユーザー設定値 | MinIOサーバーのホスト:ポート（例: `minio.example.com`） |
| access_key | ユーザー設定値 | MinIOアクセスキー |
| secret_key | ユーザー設定値 | MinIOシークレットキー |
| secure | `True` | HTTPS接続を使用（デフォルト） |
| bucket_name | `aide-powers` | プラグインパッケージ格納バケット |

### 5.3 CA証明書によるSSL接続

社内プロキシ（Global Protect）対応のため、カスタムCA証明書を使用したSSL接続をサポートする。

```python
# certificate_path が指定されている場合
import urllib3

http_client = urllib3.PoolManager(
    cert_reqs="CERT_REQUIRED",
    ca_certs=certificate_path,  # ユーザー指定のCA証明書パス
)

client = Minio(
    endpoint=endpoint,
    access_key=access_key,
    secret_key=secret_key,
    secure=True,
    http_client=http_client,
)
```

### 5.4 タイムアウト設定

| 操作 | 接続タイムアウト | 読み取りタイムアウト |
|---|---|---|
| バケット存在確認（is_available） | 5秒 | 5秒 |
| オブジェクト一覧取得（get_latest_version） | 10秒 | 30秒 |
| パッケージダウンロード（download_package） | 10秒 | 120秒 |

### 5.5 リトライ方針（指数バックオフ）

object-design-infrastructure.md §6.4 で定義された方針の詳細化。

| 項目 | 値 |
|---|---|
| 最大リトライ回数 | 3回 |
| 初回待機時間 | 1秒 |
| バックオフ係数 | 2（指数バックオフ: 1秒 → 2秒 → 4秒） |
| 最大待機時間 | 4秒 |
| リトライ対象ステータス | 500, 502, 503, 504 |
| リトライ対象例外 | `urllib3.exceptions.MaxRetryError`, `urllib3.exceptions.TimeoutError` |

```python
from urllib3.util.retry import Retry

retry = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504],
)
```

### 5.6 API呼び出し仕様

| 操作 | MinIO API | 引数 | 戻り値 |
|---|---|---|---|
| 接続確認 | `client.bucket_exists(bucket_name)` | `bucket_name: str` | `bool` |
| バージョン一覧取得 | `client.list_objects(bucket_name, prefix)` | `bucket_name: str, prefix: "aide-powers/"` | `Iterator[Object]` |
| パッケージダウンロード | `client.get_object(bucket_name, object_name)` | `bucket_name: str, object_name: str` | `HTTPResponse` |

---

## 6. Windowsレジストリ連携仕様

### 6.1 レジストリキーパス

| 項目 | 値 |
|---|---|
| ルートキー | `HKEY_CURRENT_USER` |
| サブキーパス | `Software\Microsoft\Windows\CurrentVersion\Run` |
| 値名 | `aide-powers` |
| 値の型 | `REG_SZ`（文字列） |
| 値のデータ | `"{executable_path}"` （ダブルクォートで囲んだ実行ファイルの絶対パス） |

### 6.2 値のデータ形式

```
"C:\Users\{username}\AppData\Local\aide-powers\aide-powers.exe"
```

- パスにスペースが含まれる可能性があるため、ダブルクォートで囲む
- `executable_path` 未指定時は `sys.executable` を使用する

### 6.3 アクセス権限要件

| 操作 | 必要な権限 | winreg定数 |
|---|---|---|
| 登録（書き込み） | `KEY_SET_VALUE` | `winreg.KEY_SET_VALUE` |
| 解除（削除） | `KEY_SET_VALUE` | `winreg.KEY_SET_VALUE` |
| 確認（読み取り） | `KEY_READ` | `winreg.KEY_READ` |

- `HKEY_CURRENT_USER` 配下のため、管理者権限は不要
- 通常のユーザー権限で読み書き可能

### 6.4 冪等性の保証

| 操作 | 既に存在する場合 | 存在しない場合 |
|---|---|---|
| register | 値を上書き（エラーにならない） | 新規作成 |
| unregister | 値を削除 | 何もしない（`FileNotFoundError` を吸収） |
| is_registered | `True` を返す | `False` を返す |

---

## 7. 子プロセス起動仕様

### 7.1 起動コマンドの形式

```python
subprocess.Popen(
    [tool_command, project_path],
    env=merged_env,
    cwd=project_path,
    creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
)
```

| パラメータ | 値 | 説明 |
|---|---|---|
| `tool_command` | `"kiro"`, `"code"`, `"cursor"` 等 | 開発ツールの実行コマンド名 |
| `project_path` | プロジェクトフォルダの絶対パス | ワークスペースとして開くパス |
| `cwd` | `project_path` | 子プロセスの作業ディレクトリ |
| `creationflags` | `DETACHED_PROCESS \| CREATE_NEW_PROCESS_GROUP` | デタッチ起動（親プロセスから独立） |

### 7.2 環境変数マージルール

```python
# 1. 現在のプロセスの環境変数をコピー
env = os.environ.copy()

# 2. config.json の env_vars をマージ（上書き）
env.update(env_vars)

# 3. マージ後の env を子プロセスに渡す
```

| ルール | 説明 |
|---|---|
| ベース | 現在のプロセス（aide-powersアプリ）の環境変数 |
| マージ方式 | `env_vars` の内容で上書き。既存キーは上書き、新規キーは追加 |
| 削除 | `env_vars` に含まれないキーは元の値を維持（削除しない） |
| 大文字小文字 | Windows環境では環境変数キーは大文字小文字を区別しない |

### 7.3 デタッチ起動の詳細

| 項目 | 説明 |
|---|---|
| `DETACHED_PROCESS` | 子プロセスを親プロセスのコンソールから切り離す |
| `CREATE_NEW_PROCESS_GROUP` | 子プロセスに新しいプロセスグループを割り当てる |
| 参照保持 | `Popen` オブジェクトの参照は保持しない（デタッチのため） |
| 起動確認 | `Popen.poll()` で即座にクラッシュしていないか確認する |
| 親プロセス終了時 | 子プロセスは独立して動作を継続する |

### 7.4 ツール利用可否の確認

```python
import shutil

def is_tool_available(tool_command: str) -> bool:
    return shutil.which(tool_command) is not None
```

- `shutil.which()` は PATH 上の実行ファイルを検索する
- 見つかれば `True`、見つからなければ `False`

---

## 8. プラットフォーム別インストールパス仕様

### 8.1 パス定義一覧

object-design-infrastructure.md §5.1 で定義されたパスの詳細化。

| PlatformType | インストール先パス | 環境変数ベース |
|---|---|---|
| `CLAUDE_CODE` | `%APPDATA%\claude\plugin-cache\aide-powers` | `APPDATA` |
| `CODEX_CLI` | `%USERPROFILE%\.codex\plugins\aide-powers` | `USERPROFILE` |
| `KIRO` | `%USERPROFILE%\.kiro\powers\aide-powers` | `USERPROFILE` |
| `CURSOR` | `%APPDATA%\Cursor\plugins\aide-powers` | `APPDATA` |
| `OPENCODE` | `%USERPROFILE%\.opencode\plugins\aide-powers` | `USERPROFILE` |
| `GEMINI_CLI` | `%USERPROFILE%\.gemini\extensions\aide-powers` | `USERPROFILE` |
| `COPILOT_CLI` | `%APPDATA%\github-copilot-cli\plugins\aide-powers` | `APPDATA` |
| `VSCODE_COPILOT` | `%USERPROFILE%\.github\plugins\aide-powers` | `USERPROFILE` |

### 8.2 パス解決ロジック

```python
import os
from pathlib import Path

def resolve_install_path(platform_type: PlatformType) -> Path:
    appdata = os.environ.get("APPDATA", "")
    userprofile = os.environ.get("USERPROFILE", "")

    paths = {
        PlatformType.CLAUDE_CODE: Path(appdata) / "claude" / "plugin-cache" / "aide-powers",
        PlatformType.CODEX_CLI: Path(userprofile) / ".codex" / "plugins" / "aide-powers",
        PlatformType.KIRO: Path(userprofile) / ".kiro" / "powers" / "aide-powers",
        PlatformType.CURSOR: Path(appdata) / "Cursor" / "plugins" / "aide-powers",
        PlatformType.OPENCODE: Path(userprofile) / ".opencode" / "plugins" / "aide-powers",
        PlatformType.GEMINI_CLI: Path(userprofile) / ".gemini" / "extensions" / "aide-powers",
        PlatformType.COPILOT_CLI: Path(appdata) / "github-copilot-cli" / "plugins" / "aide-powers",
        PlatformType.VSCODE_COPILOT: Path(userprofile) / ".github" / "plugins" / "aide-powers",
    }
    return paths[platform_type]
```

### 8.3 インストール先ディレクトリ構造

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

### 8.4 plugin.json スキーマ

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "aide-powers plugin.json",
  "description": "aide-powersプラグインのメタデータ",
  "type": "object",
  "required": ["name", "version", "description"],
  "properties": {
    "name": {
      "type": "string",
      "const": "aide-powers",
      "description": "プラグイン名"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "セマンティックバージョニング形式のバージョン文字列"
    },
    "description": {
      "type": "string",
      "description": "プラグインの説明"
    }
  },
  "additionalProperties": true
}
```

**plugin.json の例:**
```json
{
  "name": "aide-powers",
  "version": "1.2.3",
  "description": "AIエージェントを活用したドキュメント駆動開発フレームワーク"
}
```

---

## 9. データマッピングルール一覧

### 9.1 概要

リポジトリ具象実装がドメインオブジェクトと永続化形式（JSON）の間で行う変換ルールを定義する。変換時にはドメインオブジェクトのファクトリメソッド・コンストラクタを使用し、ドメイン層のバリデーションを経由する。

### 9.2 FileSystemConfigRepository のデータマッピング

#### JSON → ドメインオブジェクト（読み込み時）

| JSONパス | ドメインオブジェクト | 変換処理 | エラー時の対応 |
|---|---|---|---|
| `storage.endpoint`, `storage.access_key`, `storage.secret_key` | `StorageConnection` | `StorageConnection(endpoint, access_key, secret_key)` で生成 | `InvalidStorageConnectionError` → WARNING ログ + `None` を返す |
| `certificate_path` | `CertificatePath` | `CertificatePath(path)` で生成 | `InvalidCertificatePathError` → WARNING ログ + `None` を返す |
| `env_vars` (dict) | `EnvironmentVariableCollection` | 各キー・値ペアから `EnvironmentVariable(key, value)` を生成し、コレクションに格納 | `InvalidEnvironmentVariableError` → WARNING ログ + 該当エントリをスキップ |
| `installed_platforms[i].platform_type` | `PlatformType` | `PlatformType[platform_type_str]` で列挙値を解決 | `KeyError` → WARNING ログ + 該当エントリをスキップ |
| `installed_platforms[i].current_version` | `PluginVersion` | `PluginVersion.from_string(version_str)` でパース | `InvalidVersionError` → WARNING ログ + `None` を設定 |
| `installed_platforms[i]` | `InstalledPlatform` | `InstalledPlatform(platform_type, current_version)` で生成し、`latest_version` を設定 | 上記の個別エラー対応に従う |
| `registered_projects[i].path` | `RegisteredProject` | `RegisteredProject(path)` で生成 | `InvalidProjectPathError` → WARNING ログ + 該当エントリをスキップ |
| `registered_projects[i].last_used_at` | `datetime` | `datetime.fromisoformat(last_used_at_str)` でパース | `ValueError` → WARNING ログ + `None` を設定 |

#### ドメインオブジェクト → JSON（書き込み時）

| ドメインオブジェクト | JSONパス | 変換処理 |
|---|---|---|
| `StorageConnection` | `storage` | `{"endpoint": conn.endpoint, "access_key": conn.access_key, "secret_key": conn.secret_key}` |
| `CertificatePath` | `certificate_path` | `str(cert_path)` → パス文字列 |
| `EnvironmentVariableCollection` | `env_vars` | `collection.to_dict()` → `{"KEY": "VALUE", ...}` |
| `InstalledPlatform` | `installed_platforms[i]` | `{"platform_type": platform.platform_type.name, "current_version": str(platform.current_version) if platform.current_version else None, "latest_version": str(platform.latest_version) if platform.latest_version else None}` |
| `RegisteredProject` | `registered_projects[i]` | `{"path": project.path, "last_used_at": project.last_used_at.isoformat() if project.last_used_at else None}` |

### 9.3 MinioPluginRepository のデータマッピング

| MinIO API レスポンス | ドメインオブジェクト | 変換処理 |
|---|---|---|
| `Object.object_name` | `PluginVersion` | 正規表現 `aide-powers-(\d+\.\d+\.\d+)\.zip` でバージョン文字列を抽出し、`PluginVersion.from_string()` でパース |
| `HTTPResponse.read()` | `bytes` | レスポンスボディをバイト列として読み取り。ドメインオブジェクトへの変換なし（Application層がバイト列をそのまま PlatformInstaller に渡す） |

### 9.4 FileSystemPlatformInstaller のデータマッピング

| ファイル | ドメインオブジェクト | 変換処理 |
|---|---|---|
| `plugin.json` の `version` フィールド | `PluginVersion` | `json.load()` で dict を取得し、`PluginVersion.from_string(data["version"])` でパース |

### 9.5 アトミック書き込みの実装仕様

FileSystemConfigRepository の書き込み操作はアトミック書き込みを使用する。

```
1. 一時ファイル（config.json.tmp）にJSON文字列を書き出す
   - json.dumps(data, ensure_ascii=False, indent=2) でフォーマット
   - encoding="utf-8" で書き出し
2. 一時ファイルを config.json にリネーム（os.replace）
   - os.replace() はOSレベルでアトミック
   - 書き込み途中のファイルが残らない
3. エラー発生時は一時ファイルを削除（クリーンアップ）
```

---

## 10. エラーハンドリング統一方針

### 10.1 基本方針

object-design-infrastructure.md §6 で定義された方針を統合し、全レイヤーを通じたエラーハンドリングの統一方針を定義する。

#### エラー処理の3パターン

| パターン | 説明 | 適用場面 |
|---|---|---|
| 正常系として吸収 | 冪等性を保証するケース。エラーを無視して正常終了する | 存在しないレジストリ値の削除、存在しないディレクトリの削除 |
| ログ出力 + RuntimeError に変換 | Application層に伝播させるケース。Infrastructure層の技術的例外をRuntimeErrorに変換する | ストレージ接続失敗、ファイル読み書き失敗、レジストリ操作失敗 |
| ログ出力 + デフォルト値で補完 | データ破損時のリカバリケース。不正データをスキップまたはデフォルト値で補完する | config.json の不正JSON、バージョン文字列のパース失敗 |

### 10.2 レイヤー別例外変換フロー

```
[外部技術の例外]
    ↓ Infrastructure層でキャッチ
[RuntimeError / デフォルト値補完]
    ↓ Application層でキャッチ
[ApplicationError系の例外]
    ↓ Presentation層でキャッチ
[HTTPステータスコード + エラーJSON]
    ↓ ブラウザUI
[エラーメッセージ表示]
```

### 10.3 完全な例外変換マトリクス

| Infrastructure層クラス | 外部例外 | Infrastructure層の対応 | Application層の変換先 | HTTPステータス |
|---|---|---|---|---|
| MinioPluginRepository | `minio.error.S3Error`（認証失敗） | `RuntimeError` に変換 | `StorageConnectionError` | 502 |
| MinioPluginRepository | `minio.error.S3Error`（バケット不在） | `RuntimeError` に変換 | `StorageConnectionError` | 502 |
| MinioPluginRepository | `minio.error.S3Error`（オブジェクト不在） | `RuntimeError` に変換 | `PluginDownloadError` | 502 |
| MinioPluginRepository | `urllib3.exceptions.MaxRetryError` | `RuntimeError` に変換 | `StorageConnectionError` | 502 |
| MinioPluginRepository | `urllib3.exceptions.SSLError` | `RuntimeError` に変換 | `StorageConnectionError` | 502 |
| MinioPluginRepository | `InvalidVersionError` | WARNING ログ + スキップ | — | — |
| FileSystemConfigRepository | `json.JSONDecodeError` | バックアップ作成 + デフォルト値 | `ConfigLoadError` | 500 |
| FileSystemConfigRepository | `FileNotFoundError` | デフォルト値を返す | — | — |
| FileSystemConfigRepository | `PermissionError` | `RuntimeError` に変換 | `ConfigLoadError` / `ConfigSaveError` | 500 |
| FileSystemConfigRepository | `OSError` | `RuntimeError` に変換 | `ConfigLoadError` / `ConfigSaveError` | 500 |
| FileSystemPlatformInstaller | `zipfile.BadZipFile` | `RuntimeError` に変換 | `PluginInstallError` | 500 |
| FileSystemPlatformInstaller | `PermissionError` | `RuntimeError` に変換 | `PluginInstallError` / `PluginUninstallError` | 500 |
| FileSystemPlatformInstaller | `shutil.Error` | `RuntimeError` に変換 | `PluginInstallError` / `PluginUninstallError` | 500 |
| WindowsRegistryAdapter | `FileNotFoundError` | 正常系として吸収 | — | — |
| WindowsRegistryAdapter | `PermissionError` | `RuntimeError` に変換 | Application層で適切なメッセージに変換 | 500 |
| WindowsRegistryAdapter | `OSError` | `RuntimeError` に変換 | Application層で適切なメッセージに変換 | 500 |
| ProcessLauncher | `FileNotFoundError` | `RuntimeError` に変換 | `ToolNotFoundError` | 404 |
| ProcessLauncher | `PermissionError` | `RuntimeError` に変換 | Application層で適切なメッセージに変換 | 500 |
| ProcessLauncher | `subprocess.SubprocessError` | `RuntimeError` に変換 | Application層で適切なメッセージに変換 | 500 |

### 10.4 ログ出力ルール

system-requirements.md §7.5 に準拠する。

| レベル | 使用場面 |
|---|---|
| `DEBUG` | MinIO API呼び出し詳細、config.json 読み書き内容、レジストリ操作詳細、aiohttp リクエスト詳細 |
| `INFO` | アプリ起動・終了、バージョンチェック結果、ダウンロード完了、インストール成功、スタートアップ登録成功 |
| `WARNING` | config.json 内の不正データスキップ、バージョン文字列パース失敗、MinIOサーバー接続タイムアウト（リトライ中）、ポート競合フォールバック |
| `ERROR` | MinIOサーバー接続失敗（リトライ上限超過）、ファイルダウンロード失敗、レジストリ操作失敗、子プロセス起動失敗 |

#### ログフォーマット

```
%(asctime)s [%(levelname)s] %(name)s: %(message)s
```

#### ログローテーション

| 項目 | 値 |
|---|---|
| ハンドラ | `RotatingFileHandler` |
| ファイルパス | `%LOCALAPPDATA%\aide-powers\logs\aide-powers.log` |
| 最大ファイルサイズ | 5MB |
| バックアップ世代数 | 3 |

---

## 11. 将来の拡張ポイント

### 11.1 desk-agents 追加時の影響

将来のdesk-agents追加時に、AIエージェントからタスクトレイアプリの管理データにアクセスする連携（MCP等）が必要になる可能性がある。現時点では設計対象外だが、以下の拡張ポイントを記録する。

| 拡張ポイント | 現在の設計 | desk-agents追加時の変更見込み |
|---|---|---|
| REST API | aide-powers専用の30エンドポイント | desk-agents用のエンドポイント群を追加。`/api/desk-agents/` プレフィックスで名前空間を分離 |
| WebSocket | 3種のメッセージタイプ | desk-agents固有のメッセージタイプを追加 |
| config.json | aide-powers専用のスキーマ | `products` セクションを追加し、製品ごとの設定を管理 |
| MinIO バケット | `aide-powers` バケットのみ | `desk-agents` バケットを追加。バケット名をリポジトリコンストラクタで注入する設計のため、変更は最小限 |
| MCP連携 | 対象外 | MCPサーバーとしてのエンドポイント追加。config.json の読み取りAPIをMCPツールとして公開する可能性 |

### 11.2 ストレージバックエンド差し替え

| 差し替えシナリオ | 影響範囲 | 変更内容 |
|---|---|---|
| MinIO → AWS S3 | Infrastructure層のみ | `MinioPluginRepository` → `Boto3PluginRepository` に差し替え。バケット構造・命名規則は同一 |
| MinIO → Azure Blob | Infrastructure層のみ | `MinioPluginRepository` → `AzureBlobPluginRepository` に差し替え。コンテナ名をバケット名に対応 |

いずれの場合も、`PluginRepository` インターフェースの契約（`get_latest_version`, `download_package`, `is_available`）は変更不要。Composition Root での注入先を変更するだけで対応可能。

---

*本文書はユーザー要件定義書（user-requirements.md）、システム要件定義書（system-requirements.md）、GUI設計書（gui-design.md）、レイヤードアーキテクチャ設計書（layered-architecture.md）、ドメイン層オブジェクト設計書（object-design-domain.md）、アプリケーション層オブジェクト設計書（object-design-application.md）、インフラストラクチャ層オブジェクト設計書（object-design-infrastructure.md）、プレゼンテーション層オブジェクト設計書（object-design-presentation.md）、ユビキタス言語辞書（ubiquitous-language.md）に基づき作成されたインフラ/インターフェース設計書です。*