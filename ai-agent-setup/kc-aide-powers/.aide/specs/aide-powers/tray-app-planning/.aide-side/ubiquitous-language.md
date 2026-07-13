# ユビキタス言語辞書: aide-powers タスクトレイ管理アプリ

## 1. 辞書の目的

本辞書は、aide-powersタスクトレイ管理アプリのドメイン層で使用する用語を統一し、要件定義書・設計書・コード上の命名を1対1で対応させるためのものである。

## 2. 用語辞書

### 2.1 コアドメイン用語

| 日本語名（正式） | 英語名（コード上の命名） | 定義 | 分類 | 出典 |
|---|---|---|---|---|
| プラグイン | Plugin | aide-powersプラグイン本体。MinIOストレージからダウンロードされ、各プラットフォームにインストールされる配布単位 | エンティティ | REQ-M13, layered-architecture §4.3 |
| プラグインバージョン | PluginVersion | セマンティックバージョニング（major.minor.patch）に基づくバージョン表現。比較演算（より新しい・同一・互換性）を提供する | 値オブジェクト | REQ-M14, layered-architecture §4.3 |
| インストール済みプラットフォーム | InstalledPlatform | aide-powersがインストールされたプラットフォーム（Claude Code, Kiro等）。現在バージョン・最新バージョン・更新状態を保持する | エンティティ | REQ-M02, layered-architecture §4.3 |
| 登録プロジェクト | RegisteredProject | ユーザーが登録したワークスペースフォルダ。パス・最終使用日時を保持し、開発ツール起動の対象となる | エンティティ | REQ-M16, layered-architecture §4.3 |
| 環境変数 | EnvironmentVariable | 開発ツール起動時に子プロセスに設定するキー・値ペア。キーのバリデーション（空チェック・重複禁止）を内包する | 値オブジェクト | REQ-M16, layered-architecture §4.3 |
| 証明書パス | CertificatePath | 社内プロキシ対応のCA証明書ファイル（.pem）のパス。パス形式検証・拡張子検証を内包する | 値オブジェクト | REQ-M18, layered-architecture §4.3 |
| ストレージ接続情報 | StorageConnection | MinIOストレージへの接続情報（エンドポイント・アクセスキー・シークレットキー）。URL形式検証を内包する | 値オブジェクト | REQ-M13, layered-architecture §4.3 |

### 2.2 ドメインサービス用語

| 日本語名（正式） | 英語名（コード上の命名） | 定義 | 分類 | 出典 |
|---|---|---|---|---|
| プラグインインストールサービス | PluginInstallationService | プラグインインストールフローの制御。ステップ管理・リトライ判定を行う。単一エンティティに属さないドメインロジック | ドメインサービス | layered-architecture §4.3 |
| 更新ポリシーサービス | UpdatePolicyService | 更新可否・更新優先度の判定を行う。全自動更新禁止ルール（REQ-M14）を含む更新ポリシーのドメインロジック | ドメインサービス | REQ-M14, layered-architecture §4.3 |

### 2.3 リポジトリインターフェース用語

| 日本語名（正式） | 英語名（コード上の命名） | 定義 | 分類 | 出典 |
|---|---|---|---|---|
| プラグインリポジトリ | PluginRepository | プラグインの取得・保存の抽象インターフェース。ストレージからのバージョン情報取得・パッケージダウンロードを抽象化する | リポジトリIF | layered-architecture §4.3, §7.1 |
| 設定リポジトリ | ConfigRepository | 設定情報（config.json）の読み込み・保存の抽象インターフェース | リポジトリIF | layered-architecture §4.3, §7.1 |
| プラットフォームインストーラー | PlatformInstaller | プラットフォームへのプラグインファイル配置の抽象インターフェース | リポジトリIF | layered-architecture §4.3, §7.1 |
| スタートアップレジストリ | StartupRegistry | Windowsスタートアップ登録の抽象インターフェース | リポジトリIF | layered-architecture §4.3, §7.1 |
| 開発ツールランチャー | DevelopmentToolLauncher | 開発ツール起動の抽象インターフェース。環境変数を設定した子プロセスとしてツールを起動する | リポジトリIF | REQ-M16, layered-architecture §4.3, §7.1 |

### 2.4 ビジネスプロセス用語

| 日本語名（正式） | 英語名（コード上の命名） | 定義 | 出典 |
|---|---|---|---|
| インストールステップ | InstallStep | プラグインインストールの各工程（ダウンロード・展開・配置・スタートアップ登録）。順序と状態（未着手・実行中・完了・失敗）を持つ | GUI設計 WIZ-04 |
| インストール進捗 | InstallProgress | インストール全体の進捗状態。全体パーセンテージと各ステップの状態を保持する | GUI設計 WIZ-04 |
| 更新状態 | UpdateStatus | プラットフォームの更新状態（最新・更新あり・エラー） | GUI設計 DASH §5.5 |
| プラットフォーム種別 | PlatformType | 対応する8プラットフォームの列挙（ClaudeCode, CodexCli, Kiro, Cursor, OpenCode, GeminiCli, CopilotCli, VSCodeCopilot） | REQ-M02 |
| セットアップ完了状態 | SetupCompleted | 初期設定ウィザードが完了したかどうかの状態 | GUI設計 §1.3 |
| 環境変数プリセット | EnvironmentPreset | 証明書パスに基づいて自動生成されるデフォルトの環境変数セット | UC-045 |

### 2.5 禁止用語（技術的命名の排除）

| 禁止用語 | 理由 | 正式用語 |
|---|---|---|
| PluginData | データの入れ物を示唆。振る舞いを持つエンティティである | Plugin |
| VersionString | 技術的な型名。ドメイン概念を表現していない | PluginVersion |
| PlatformManager | Manager接尾辞は責務が曖昧 | InstalledPlatform（エンティティ）+ PluginInstallationService（サービス） |
| ConfigData | データの入れ物を示唆 | 各値オブジェクト（EnvironmentVariable, CertificatePath, StorageConnection）に分解 |
| UpdateFlag | Flag接尾辞はドメイン概念を表現していない | UpdateStatus（更新状態） |
| ProjectInfo | Info接尾辞は責務が曖昧 | RegisteredProject |
| EnvVar | 略語。ドメイン概念を正確に表現していない | EnvironmentVariable |

## 3. 同義語の統一

| 揺れのある表現 | 統一先（正式名称） | 備考 |
|---|---|---|
| バージョン / ver / version | プラグインバージョン（PluginVersion） | コード上は PluginVersion 型を使用 |
| プラットフォーム / ツール / エディタ | プラットフォーム（PlatformType） | 8プラットフォームを指す場合 |
| 開発ツール / IDE / エディタ | 開発ツール（DevelopmentTool） | 起動対象のツールを指す場合 |
| プロジェクト / ワークスペース / フォルダ | 登録プロジェクト（RegisteredProject） | 登録済みのプロジェクトを指す場合 |
| 設定 / コンフィグ / config | 設定（Config） | config.jsonの内容を指す場合 |
| 証明書 / CA証明書 / cert | 証明書パス（CertificatePath） | 証明書ファイルのパスを指す場合 |
| ストレージ / MinIO / S3 | ストレージ接続情報（StorageConnection） | 接続情報を指す場合 |
| インストール / セットアップ / 導入 | インストール | プラグインの配置を指す場合 |
| 更新 / アップデート / update | 更新 | プラグインの新バージョン適用を指す場合 |

---

*本辞書はユーザー要件定義書（user-requirements.md）、システム要件定義書（system-requirements.md）、GUI設計書（gui-design.md）、レイヤードアーキテクチャ設計書（layered-architecture.md）、ユースケース分析（usecase-tray-app.md）に基づき作成されたユビキタス言語辞書です。*
