# タスクトレイ常駐アプリ 技術スタック調査

## 調査概要

| 項目 | 内容 |
|---|---|
| 調査対象 | Windowsタスクトレイ常駐アプリの実現に必要な技術要素（5項目） |
| 調査日 | 2025年7月 |
| 調査の背景 | aide-powersにタスクトレイ管理アプリを追加し、非エンジニアがコマンドライン不要でインストール・設定・更新管理を行えるようにする |

## 要約（3〜5行）

Windowsタスクトレイ常駐アプリの実現は**技術的に十分可能**です。pystray（タスクトレイ）+ Flask/FastAPI（ブラウザUI）+ minio-py（ストレージ）+ PyInstaller（exe化）+ winreg（スタートアップ登録）の組み合わせで、すべての要件を満たせます。pystrayはWindowsでの動作実績が豊富で、通知機能も内蔵しています。Flask/FastAPIをバックグラウンドスレッドで起動し、ブラウザでUIを表示するパターンは広く使われており安定しています。PyInstallerでのexe化も成熟しており、Python 3.8〜3.14に対応しています。

---

## 1. タスクトレイ常駐（pystray）

### 1.1 実現可能性: ✅ 可能

### 1.2 推奨ライブラリ: pystray

| 項目 | 内容 |
|---|---|
| ライブラリ名 | pystray |
| 最新バージョン | 0.19.5（2023-09-17リリース） |
| ライセンス | LGPLv3 |
| Python対応 | Python 2.7, 3.4+ |
| 対応OS | Windows, macOS, Linux（Xorg/GTK/AppIndicator） |
| GitHub | [moses-palmer/pystray](https://github.com/moses-palmer/pystray) ★560 |
| PyPI | [pystray](https://pypi.org/project/pystray/) |
| 依存 | Pillow（アイコン画像生成用） |

### 1.3 主要機能

#### タスクトレイアイコン表示
- `pystray.Icon` クラスでシステムトレイにアイコンを表示
- アイコンはPIL.Image.Imageインスタンスで指定（.ico/.png等から読み込み可能）
- `icon.run()` はブロッキング呼び出し。Windowsではメインスレッド以外からの呼び出しも安全

#### 右クリックメニュー
- `pystray.Menu` と `pystray.MenuItem` でコンテキストメニューを構築
- サブメニュー、チェックボックス、ラジオボタン、セパレータに対応
- メニュー項目の有効/無効、表示/非表示を動的に制御可能
- `default=True` を設定した項目はアイコンのダブルクリックで実行される

#### 通知（トースト通知）
- `icon.notify(message, title=None)` メソッドでWindowsトースト通知を表示可能
- `icon.remove_notification()` で通知を削除
- `Icon.HAS_NOTIFICATION` でプラットフォームの通知サポートを確認可能
- **Windows（win32バックエンド）では通知がサポートされている**
- 注意: macOSとXorgでは通知非サポート（本プロジェクトはWindows専用のため問題なし）

#### スレッド統合
- `run_detached()` メソッドで他のフレームワーク（Flask等）との統合が可能
- `setup` コールバックで別スレッドでの初期化処理を実行可能

### 1.4 実装の難易度: 低

pystrayのAPIはシンプルで、基本的なタスクトレイアプリは数十行で実装可能。ドキュメントも整備されている。

### 1.5 制約事項

- pystrayの最終リリースは2023年9月。約2年間新リリースなし（ただし安定版として機能している）
- Pillowが必須依存（アイコン画像の生成・読み込みに使用）
- pystrayの通知はシンプルなテキスト通知のみ。リッチな通知（ボタン、画像、プログレスバー等）が必要な場合は別ライブラリが必要

### 1.6 通知の代替手段（リッチ通知が必要な場合）

| ライブラリ | バージョン | 特徴 | メンテナンス状況 |
|---|---|---|---|
| [Windows-Toasts](https://pypi.org/project/Windows-Toasts/) | 1.3.1（2025-05-06） | WinRT ベース。ボタン・画像・サウンド対応。Win10/11対応 | ✅ 活発（2025年5月更新） |
| [winotify](https://pypi.org/project/winotify/) | 1.1.0 | 純Python。シンプルなトースト通知 | ⚠️ 2022年以降更新なし |
| [win11toast](https://pypi.org/project/win11toast/) | - | WinRTベース。Win10/11対応 | ⚠️ 2024年6月最終更新 |
| [desktop-notifier](https://pypi.org/project/desktop-notifier/) | 6.1.x（2025-04） | クロスプラットフォーム | ✅ 活発 |

**推奨**: pystray内蔵の `notify()` で基本通知を実装し、リッチ通知が必要になった場合は Windows-Toasts を追加導入する。

### 1.7 代替ライブラリ

| ライブラリ | 特徴 | 評価 |
|---|---|---|
| [crosstray](https://pypi.org/project/crosstray/) | 軽量・純Python。GUI依存なし。2025年リリース | 新しすぎて実績が少ない。要追加調査 |
| [simplesystray](https://pypi.org/project/simplesystray/) | Windows専用。シンプル | 2023年リリース。機能が限定的 |
| [tray-manager](https://pypi.org/project/tray-manager/) | pystrayのラッパー。オブジェクト指向API | pystray依存。追加の抽象化レイヤー |

**推奨**: pystrayが最も実績があり、ドキュメントも充実しているため、pystrayを採用する。

---

## 2. ブラウザUIのローカルWebサーバー

### 2.1 実現可能性: ✅ 可能

### 2.2 アーキテクチャパターン

タスクトレイアプリ（pystray）がバックグラウンドでFlask/FastAPIサーバーを起動し、ユーザーがメニューから「設定画面を開く」等を選択するとブラウザが自動で開くパターン。

```
[pystray タスクトレイ] → [Flask/FastAPI ローカルサーバー (127.0.0.1:ポート)] ← [ブラウザ UI]
```

### 2.3 Flask vs FastAPI 比較

| 項目 | Flask | FastAPI |
|---|---|---|
| 最新バージョン | 3.1.x | 0.115.x |
| Python対応 | 3.9+ | 3.8+ |
| 非同期対応 | 限定的（Flask 2.0+でasync対応） | ネイティブ async/await |
| 学習コスト | 低（シンプル） | 中（型ヒント・Pydantic必須） |
| パフォーマンス | 十分（ローカル用途では差なし） | 高（ただしローカル用途では差なし） |
| エコシステム | 非常に豊富 | 豊富（成長中） |
| PyInstaller対応 | ✅ 実績豊富 | ✅ 対応（uvicorn同梱が必要） |
| GitHub Stars | 約69k | 約82k |

**推奨**: ローカルUIサーバーとしてはFlaskが適している。理由:
- シンプルなAPI（非エンジニア向けツールに複雑な非同期処理は不要）
- PyInstallerとの組み合わせ実績が豊富
- `flask run` ではなく `app.run(threaded=True)` でバックグラウンドスレッドから起動可能
- FastAPIはuvicornが必要で、exe化時の構成がやや複雑になる

### 2.4 ブラウザ自動起動

Python標準ライブラリの `webbrowser` モジュールで実現可能:

```python
import webbrowser
webbrowser.open('http://127.0.0.1:5000')
```

- 追加ライブラリ不要
- デフォルトブラウザで開く
- タスクトレイメニューのコールバックから呼び出す

### 2.5 Flaskのバックグラウンド起動パターン

```python
import threading
from flask import Flask

app = Flask(__name__)

def start_server():
    app.run(host='127.0.0.1', port=5000, threaded=True, use_reloader=False)

# バックグラウンドスレッドで起動
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
```

- `use_reloader=False` が重要（リローダーはexe化時に問題を起こす）
- `daemon=True` でメインプロセス終了時にスレッドも終了
- `host='127.0.0.1'` でローカルのみアクセス可能（セキュリティ上重要）

### 2.6 代替手段

| 手段 | 特徴 | 評価 |
|---|---|---|
| [flaskwebgui](https://pypi.org/project/flaskwebgui/) ★743 | Flask/FastAPIをデスクトップアプリ化。Chromeをアプリモードで起動 | ブラウザ依存。タスクトレイとの統合が複雑 |
| [pywebview](https://pywebview.flowrl.com/) | 軽量Webビューウィンドウ | 独自ウィンドウ。ブラウザUIとは異なるアプローチ |
| [NiceGUI](https://nicegui.io/) | FastAPIベースのPython UIフレームワーク | 高機能だが依存が多い |
| tkinter直接 | Python標準GUI | Web技術が使えない。UI構築が大変 |

**推奨**: Flask + webbrowser の組み合わせが最もシンプルで安定。

### 2.7 制約事項

- ローカルサーバーのポート番号が他アプリと競合する可能性がある → ポート検出ロジックが必要
- ファイアウォールの警告が出る可能性がある → `127.0.0.1` バインドで回避可能
- Flaskの開発サーバーは本番用ではないが、ローカルUI用途では十分

### 2.8 実装の難易度: 低

Flask + webbrowser + threading の組み合わせは広く使われているパターンで、実装は容易。

---

## 3. MinIO SDK（Python）によるバージョン監視・ダウンロード

### 3.1 実現可能性: ✅ 可能

### 3.2 ライブラリ情報

| 項目 | 内容 |
|---|---|
| ライブラリ名 | minio（minio-py） |
| 最新バージョン | 7.2.20（2025年1月リリース） |
| ライセンス | Apache License 2.0 |
| Python対応 | 3.7+（公式ドキュメントでは3.10+推奨） |
| GitHub | [minio/minio-py](https://github.com/minio/minio-py) ★1k, Fork 370 |
| PyPI | [minio](https://pypi.org/project/minio/) |
| 公式ドキュメント | [minio-py.min.io](https://minio-py.min.io/) |
| API Reference | [Python Client API Reference](https://docs.min.io/enterprise/aistor-object-store/developers/sdk/python/api/) |

### 3.3 主要API（バージョン監視・ダウンロードに必要なもの）

#### オブジェクトメタデータ取得
```python
from minio import Minio

client = Minio(endpoint, access_key, secret_key)

# オブジェクトのメタデータ取得（サイズ、最終更新日、ETag、カスタムメタデータ等）
stat = client.stat_object(bucket_name, object_name)
# stat.metadata  → カスタムメタデータ（バージョン情報等を格納可能）
# stat.etag      → ETag（変更検知に使用可能）
# stat.last_modified → 最終更新日時
# stat.size      → ファイルサイズ
```

#### オブジェクト一覧取得
```python
# バケット内のオブジェクト一覧
objects = client.list_objects(bucket_name, prefix="plugins/")
for obj in objects:
    print(obj.object_name, obj.size, obj.last_modified, obj.etag)
```

注意: `list_objects` ではカスタムメタデータは取得できない（[GitHub Issue #1173](https://github.com/minio/minio-py/issues/1173)）。個別に `stat_object` を呼ぶ必要がある。

#### ファイルダウンロード
```python
# ファイルとしてダウンロード
client.fget_object(bucket_name, object_name, file_path)

# ストリームとして取得
response = client.get_object(bucket_name, object_name)
data = response.read()
response.close()
response.release_conn()
```

### 3.4 バージョン監視の実装パターン

**推奨パターン**: カスタムメタデータにバージョン情報を格納し、`stat_object` で定期的にチェック

```python
# アップロード時にバージョンメタデータを付与
client.fput_object(
    bucket_name, "plugins/my-plugin.zip", local_path,
    metadata={"x-amz-meta-version": "1.2.3"}
)

# バージョンチェック
stat = client.stat_object(bucket_name, "plugins/my-plugin.zip")
remote_version = stat.metadata.get("x-amz-meta-version", "unknown")
```

**代替パターン**: バージョン情報をJSONファイルとして管理
```python
# versions.json をダウンロードしてバージョン情報を取得
response = client.get_object(bucket_name, "versions.json")
versions = json.loads(response.read())
```

### 3.5 ストレージ抽象化の設計パターン（MinIO → S3 → 他クラウドへの切り替え）

MinIOはS3互換APIを提供しているため、以下の抽象化パターンが有効:

#### パターン1: boto3を使用（推奨）
boto3（AWS SDK for Python）はMinIOに対しても `endpoint_url` を指定するだけで接続可能:

```python
import boto3

# MinIO接続
s3 = boto3.client('s3',
    endpoint_url='http://minio-server:9000',
    aws_access_key_id='...',
    aws_secret_access_key='...'
)

# AWS S3接続（endpoint_urlを省略するだけ）
s3 = boto3.client('s3',
    aws_access_key_id='...',
    aws_secret_access_key='...'
)
```

**メリット**: MinIO→AWS S3の切り替えが設定変更のみで完了
**デメリット**: boto3は依存が大きい（botocore含む）。exe化時のサイズ増加

#### パターン2: Repository パターンによる抽象化（推奨）
```python
from abc import ABC, abstractmethod

class StorageRepository(ABC):
    @abstractmethod
    def get_object_metadata(self, bucket, key) -> dict: ...
    @abstractmethod
    def download_file(self, bucket, key, local_path) -> None: ...
    @abstractmethod
    def list_objects(self, bucket, prefix) -> list: ...

class MinioStorageRepository(StorageRepository):
    def __init__(self, client: Minio): ...

class Boto3StorageRepository(StorageRepository):
    def __init__(self, client): ...
```

**推奨**: 初期実装はminio-pyで行い、Repositoryパターンで抽象化する。将来boto3への切り替えが必要になった場合、Repository実装を差し替えるだけで対応可能。

### 3.6 実装の難易度: 低〜中

minio-pyのAPIはシンプルだが、バージョン監視ロジック（定期チェック、差分検出、ダウンロード管理）の設計が必要。

### 3.7 制約事項

- `list_objects` ではカスタムメタデータが取得できない（個別に `stat_object` が必要）
- MinIOサーバーへのネットワーク接続が必要（オフライン時のフォールバック設計が必要）
- minio-pyとboto3のAPI互換性は完全ではない（一部のMinIO固有機能はboto3では使えない）

### 3.8 コスト

- minio-py: **無料**（Apache License 2.0）
- MinIOサーバー: セルフホスト版は**無料**（AGPL v3）。エンタープライズ版は有料
- boto3: **無料**（Apache License 2.0）

---

## 4. setup.exe / setup.bat の作成方法

### 4.1 実現可能性: ✅ 可能

### 4.2 PyInstaller vs Nuitka 比較

| 項目 | PyInstaller | Nuitka |
|---|---|---|
| 最新バージョン | 6.13.x（2025年4月） | 2.8.x（2025年6月） |
| Python対応 | 3.8〜3.14 | 2.6, 2.7, 3.4〜3.14 |
| GitHub Stars | ★12k, Fork 2k | ★11.2k, Fork 639 |
| ライセンス | GPL v2（ブートローダーはApache 2.0） | Apache License 2.0 |
| 方式 | バンドル（Pythonインタプリタ + コードを同梱） | コンパイル（PythonコードをCに変換） |
| 出力サイズ | 大きい（50〜100MB+） | 小さい（PyInstallerの50〜70%程度） |
| ビルド速度 | 速い | 遅い（C コンパイルが必要） |
| 起動速度 | 普通 | 速い（2〜3倍高速） |
| コード保護 | 低い（逆コンパイル容易） | 高い（Cコードに変換） |
| 設定の容易さ | 簡単（`pyinstaller script.py`） | やや複雑（Cコンパイラが必要） |
| Windows要件 | 特になし | Visual Studio 2022 or MinGW64 |
| pystray対応 | ✅ 実績あり | ✅ 対応（プラグイン設定が必要な場合あり） |
| Flask対応 | ✅ 実績豊富 | ✅ 対応 |

**推奨**: PyInstallerを採用する。理由:
- ビルドが簡単で、特別なコンパイラ環境が不要
- pystray + Flask の組み合わせでの実績が豊富
- 社内ツールではコード保護の優先度が低い
- 出力サイズは大きいが、社内配布では許容範囲

### 4.3 PyInstallerの基本的な使い方

```bash
# 単一ファイルexe（推奨）
pyinstaller --onefile --windowed --icon=app.ico main.py

# --onefile: 単一exeファイルに結合
# --windowed: コンソールウィンドウを非表示（タスクトレイアプリに必須）
# --icon: exeのアイコン指定
```

### 4.4 setup.bat 方式

PyInstallerでexe化したアプリを配布する場合、setup.batで初期セットアップを行うパターン:

```bat
@echo off
echo aide-powers セットアップを開始します...

REM インストール先ディレクトリの作成
if not exist "%LOCALAPPDATA%\aide-powers" mkdir "%LOCALAPPDATA%\aide-powers"

REM ファイルのコピー
copy /Y "aide-powers.exe" "%LOCALAPPDATA%\aide-powers\"
copy /Y "config.ini" "%LOCALAPPDATA%\aide-powers\"

REM スタートアップ登録（後述）
REM ...

echo セットアップが完了しました。
pause
```

### 4.5 配布方式の選択肢

| 方式 | メリット | デメリット |
|---|---|---|
| setup.bat + exe | シンプル。管理者権限不要 | UIがない。エラーハンドリングが限定的 |
| PyInstaller --onefile | 単一ファイル配布。実行するだけ | 初回起動が遅い（展開処理） |
| Inno Setup | 本格的なインストーラー。UIあり | 別途ツールが必要。設定が複雑 |
| NSIS | 軽量インストーラー | 学習コストがある |

**推奨**: 初期はsetup.bat + exe方式で十分。将来的にInno Setupへの移行も検討可能。

### 4.6 実装の難易度: 低

PyInstallerのexe化は成熟しており、基本的なコマンド一つで実行可能。

### 4.7 制約事項

- PyInstallerの `--onefile` モードは初回起動時にテンポラリディレクトリへの展開が発生し、起動が遅い（数秒）
- ウイルス対策ソフトがPyInstaller製exeを誤検知する場合がある（既知の問題）
- `--windowed` モード使用時、標準出力/エラーはログファイルにリダイレクトする設計が必要
- PyInstallerはクロスコンパイル非対応（Windows用exeはWindows上でビルドする必要がある）

### 4.8 コスト

- PyInstaller: **無料**（GPL v2 / ブートローダーはApache 2.0）
- Nuitka: **無料**（Apache License 2.0）。商用サポートは有料
- Inno Setup: **無料**（修正BSD License）

---

## 5. Windowsスタートアップ登録

### 5.1 実現可能性: ✅ 可能

### 5.2 方法の比較

| 方法 | 管理者権限 | 難易度 | 信頼性 | 推奨度 |
|---|---|---|---|---|
| レジストリ（HKCU\Run） | 不要 | 低 | 高 | ⭐ 推奨 |
| スタートアップフォルダ | 不要 | 低 | 高 | ○ 代替 |
| タスクスケジューラ | 場合による | 中 | 最高 | △ 過剰 |

### 5.3 方法1: レジストリ（HKCU\Software\Microsoft\Windows\CurrentVersion\Run）— 推奨

Python標準ライブラリの `winreg` モジュールで実装可能（追加ライブラリ不要）:

```python
import winreg
import sys
import os

def register_startup(app_name: str, exe_path: str) -> None:
    """スタートアップにアプリを登録する"""
    key = winreg.OpenKey(
        winreg.HKEY_CURRENT_USER,
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        0,
        winreg.KEY_SET_VALUE
    )
    winreg.SetValueEx(key, app_name, 0, winreg.REG_SZ, exe_path)
    winreg.CloseKey(key)

def unregister_startup(app_name: str) -> None:
    """スタートアップからアプリを削除する"""
    key = winreg.OpenKey(
        winreg.HKEY_CURRENT_USER,
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        0,
        winreg.KEY_SET_VALUE
    )
    try:
        winreg.DeleteValue(key, app_name)
    except FileNotFoundError:
        pass  # 既に削除済み
    winreg.CloseKey(key)

def is_registered_startup(app_name: str) -> bool:
    """スタートアップに登録されているか確認する"""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            0,
            winreg.KEY_READ
        )
        winreg.QueryValueEx(key, app_name)
        winreg.CloseKey(key)
        return True
    except FileNotFoundError:
        return False
```

**メリット**:
- `HKEY_CURRENT_USER` は管理者権限不要
- Python標準ライブラリのみで実装可能
- プログラムから登録/解除が容易
- Windowsの「スタートアップアプリ」設定画面に表示される

### 5.4 方法2: スタートアップフォルダ

```python
import os
import shutil

def get_startup_folder() -> str:
    """ユーザーのスタートアップフォルダパスを取得"""
    return os.path.join(
        os.environ['APPDATA'],
        r'Microsoft\Windows\Start Menu\Programs\Startup'
    )

def register_startup_folder(app_name: str, exe_path: str) -> None:
    """スタートアップフォルダにショートカットを作成"""
    # ショートカット作成にはpywin32またはpythoncomが必要
    import win32com.client
    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut_path = os.path.join(get_startup_folder(), f"{app_name}.lnk")
    shortcut = shell.CreateShortCut(shortcut_path)
    shortcut.Targetpath = exe_path
    shortcut.save()
```

**メリット**: 直感的。ユーザーがエクスプローラーで確認可能
**デメリット**: ショートカット作成にpywin32が必要（追加依存）

### 5.5 推奨

**レジストリ方式（HKCU\Run）を推奨**。理由:
- 管理者権限不要
- Python標準ライブラリのみで実装可能（追加依存なし）
- プログラムからの登録/解除が容易
- タスクトレイアプリの設定画面から「スタートアップ登録」のON/OFFを切り替えるUIが実装しやすい

### 5.6 実装の難易度: 低

winregモジュールのAPIはシンプルで、数行で実装可能。

### 5.7 制約事項

- `HKEY_CURRENT_USER` はカレントユーザーのみ有効。全ユーザーに適用するには `HKEY_LOCAL_MACHINE` が必要（管理者権限必須）
- 32bit Pythonが64bit Windowsで動作する場合、レジストリリダイレクション（Wow6432Node）に注意が必要
- レジストリ操作はWindows固有。クロスプラットフォーム対応が必要な場合は別途設計が必要（本プロジェクトはWindows専用のため問題なし）

### 5.8 コスト

- winreg: **無料**（Python標準ライブラリ）

---

## 総合リスク評価

### 技術的リスク

| リスク | 影響度 | 発生確率 | 対策 |
|---|---|---|---|
| pystrayの開発停滞 | 中 | 中 | 安定版として機能中。Windows APIは変わりにくい。代替としてcrosstrayを監視 |
| PyInstaller製exeのウイルス誤検知 | 中 | 中 | コード署名の導入。社内ウイルス対策ソフトの除外設定 |
| ポート競合 | 低 | 低 | 動的ポート割り当て or 設定可能にする |
| MinIOサーバー接続障害 | 中 | 低 | オフラインモードの実装。ローカルキャッシュ |

### ライセンスリスク

| ライブラリ | ライセンス | リスク |
|---|---|---|
| pystray | LGPLv3 | 動的リンクであれば問題なし。PyInstallerでバンドルする場合はLGPLv3の条件に注意 |
| PyInstaller | GPL v2（ブートローダーはApache 2.0） | ブートローダー部分はApache 2.0。生成されたexeにはGPLは適用されない |
| minio-py | Apache 2.0 | 商用利用可。制約なし |
| Flask | BSD-3-Clause | 商用利用可。制約なし |
| Pillow | HPND License | 商用利用可。制約なし |

### 将来の継続性リスク

| ライブラリ | メンテナンス状況 | 評価 |
|---|---|---|
| pystray | 最終リリース 2023-09。GitHub Issue/PRは少数 | ⚠️ 開発は低調だが安定版として機能 |
| PyInstaller | 最終リリース 2025-04。活発に開発中 | ✅ 良好 |
| Nuitka | 最終リリース 2025-06。活発に開発中 | ✅ 良好 |
| minio-py | 最終リリース 2025-01。定期的にリリース | ✅ 良好 |
| Flask | 活発に開発中。Pallets Projects管理 | ✅ 非常に良好 |
| Windows-Toasts | 最終リリース 2025-05 | ✅ 良好 |

---

## 推奨技術スタック まとめ

| 要素 | 推奨ライブラリ | 理由 |
|---|---|---|
| タスクトレイ | pystray 0.19.5 | 実績豊富。Windows対応が安定。通知機能内蔵 |
| 通知（基本） | pystray内蔵 notify() | 追加依存なし |
| 通知（リッチ） | Windows-Toasts 1.3.1 | 必要になった場合に追加。WinRT ベースで最新 |
| ローカルWebサーバー | Flask 3.1.x | シンプル。PyInstaller対応実績豊富 |
| ブラウザ起動 | webbrowser（標準ライブラリ） | 追加依存なし |
| ストレージSDK | minio-py 7.2.x | S3互換。Repositoryパターンで抽象化 |
| exe化 | PyInstaller 6.13.x | ビルドが簡単。実績豊富 |
| スタートアップ登録 | winreg（標準ライブラリ） | 管理者権限不要。追加依存なし |
| セットアップ | setup.bat + exe | シンプル。将来Inno Setupへ移行可能 |

---

## 情報源

| 情報源 | URL | 確認日 |
|---|---|---|
| pystray PyPI | https://pypi.org/project/pystray/ | 2025年7月 |
| pystray ドキュメント（Usage） | https://pystray.readthedocs.io/en/latest/usage.html | 2025年7月 |
| pystray ドキュメント（Reference） | https://pystray.readthedocs.io/en/latest/reference.html | 2025年7月 |
| pystray GitHub | https://github.com/moses-palmer/pystray | 2025年7月 |
| MinIO Python SDK 公式 | https://minio-py.min.io/ | 2025年7月 |
| MinIO PyPI | https://pypi.org/project/minio/ | 2025年7月 |
| MinIO GitHub (minio-py) | https://github.com/minio/minio-py | 2025年7月 |
| MinIO Python API Reference | https://docs.min.io/enterprise/aistor-object-store/developers/sdk/python/api/ | 2025年7月 |
| MinIO GitHub Issue #1173（メタデータ制限） | https://github.com/minio/minio-py/issues/1173 | 2025年7月 |
| PyInstaller PyPI | https://pypi.org/project/PyInstaller/ | 2025年7月 |
| PyInstaller GitHub | https://github.com/pyinstaller/pyinstaller | 2025年7月 |
| Nuitka PyPI | https://pypi.org/project/Nuitka/ | 2025年7月 |
| Nuitka GitHub | https://github.com/Nuitka/Nuitka | 2025年7月 |
| Windows-Toasts PyPI | https://pypi.org/project/Windows-Toasts/ | 2025年7月 |
| Flask 公式 | https://flask.palletsprojects.com/ | 2025年7月 |
| FastAPI 公式 | https://fastapi.tiangolo.com/ | 2025年7月 |
| flaskwebgui GitHub | https://github.com/ClimenteA/flaskwebgui | 2025年7月 |
| crosstray PyPI | https://pypi.org/project/crosstray/ | 2025年7月 |
| Python winreg ドキュメント | https://docs.python.org/3/library/winreg.html | 2025年7月 |
| GeeksforGeeks: Autorun Python on Windows | https://www.geeksforgeeks.org/python/autorun-a-python-script-on-windows-startup/ | 2025年7月 |

Content was rephrased for compliance with licensing restrictions. All information was verified through Web search and official documentation.
