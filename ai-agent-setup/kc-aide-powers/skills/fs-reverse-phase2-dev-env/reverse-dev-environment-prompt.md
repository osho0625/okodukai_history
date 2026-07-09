# 開発環境逆引きプロンプトテンプレート

サブエージェントを起動する際、以下のテンプレートに変数を埋め込んで使用する。

**Purpose:** 既存プロジェクトの設定ファイル群を解析し、開発環境情報を抽出して dev-environment.md を作成する。

**Dispatch when:** fs-reverse-phase2-dev-env スキルのステップ1で、サブエージェントに委譲する際に使用する。

## プロンプトテンプレート

```
## 開発環境逆引き指示

### 実行フェーズ
phase2

### feature_name
{feature_name}

### プロジェクトルート
{project_root}

### 前フェーズの成果物
- {specs_path}/program-structure.md

### 最重要原則
**コードの現実を記録する。理想の環境構成ではなく、実際に使われている環境をそのまま記録する。**

### 解析手順

#### ステップ1: Python環境の特定

以下のファイル・設定から Python バージョンと環境構成を特定する。

**バージョン情報の取得元（優先順位順）:**
1. `.python-version` ファイル
2. `pyproject.toml` の `[project]` → `requires-python`
3. `setup.py` の `python_requires`
4. `runtime.txt`
5. 上記がない場合: ユーザーに確認する

**仮想環境の確認:**
- `.venv/` または `venv/` ディレクトリの存在
- `.gitignore` に `.venv` が含まれているか
- `pyproject.toml` の `[tool.poetry]`（Poetry使用の場合）
- `Pipfile`（pipenv使用の場合）

**⚠️ venv が存在する場合の必須記載事項:**
- dev-environment.md に「グローバルの python / pip の使用禁止」を必ず明記する
- 全てのコマンド（テスト実行・アプリ起動・パッケージインストール等）は venv 内の python / pip を使用すること
- 「グローバル環境への pip install を絶対に行わないこと」を明記する

#### ステップ2: 依存管理方式の特定

以下のパターンから依存管理方式を判定する:

| ファイル | 管理方式 |
|---|---|
| `requirements.txt` のみ | pip + requirements.txt |
| `pyproject.toml` + `[project.dependencies]` | PEP 621 準拠 |
| `pyproject.toml` + `[tool.poetry]` | Poetry |
| `Pipfile` + `Pipfile.lock` | pipenv |
| `setup.py` + `install_requires` | setuptools |
| `pyproject.toml` + `[tool.hatch]` | Hatch |

**依存パッケージの分類:**
- 本番依存（`dependencies` / `install_requires`）
- 開発依存（`dev-dependencies` / `extras_require["dev"]`）
- テスト依存（`extras_require["test"]`）

**注意:** 複数の依存管理方式が混在している場合は、主要なものを特定しつつ全て記録する。

#### ステップ3: テスト実行方式の特定

以下からテストフレームワークと実行方法を特定する:
- `pyproject.toml` の `[tool.pytest]` セクション
- `conftest.py` の存在
- `tox.ini` / `nox.py` の存在
- テストファイルの import 文（`import pytest`, `import unittest` 等）

テスト実行コマンドを具体的に記載する（OS別のパスを含む）。

#### ステップ4: リンター・フォーマッターの特定

以下の設定ファイルから使用ツールを特定する:
- `pyproject.toml` の `[tool.ruff]`, `[tool.black]`, `[tool.isort]`, `[tool.mypy]` 等
- `.flake8`, `.pylintrc`, `setup.cfg` の lint 設定
- `pre-commit-config.yaml`

#### ステップ5: その他の開発ツール

- CI/CD設定（`.github/workflows/`, `.gitlab-ci.yml` 等）
- Docker設定（`Dockerfile`, `docker-compose.yml`）
- Makefile / タスクランナー

### 成果物

`{specs_path}/dev-environment.md` に以下の構成で作成する:

```markdown
# 開発実行環境: {feature_name}

逆引き生成日時: {timestamp}

## Python環境
- バージョン: Python 3.x
- 仮想環境: venv（`.venv/`）
- 作成手順: `python -m venv .venv`
- 有効化: `.venv/Scripts/activate`（Windows）/ `source .venv/bin/activate`（Linux/Mac）

## 依存管理
- 管理方式: {pip + requirements.txt / Poetry / etc.}
- インストール: `pip install -r requirements.txt`
- 本番依存: {パッケージ一覧}
- 開発依存: {パッケージ一覧}

## 実行ルール
- Python実行: `.venv/Scripts/python`（Windows）/ `.venv/bin/python`（Linux/Mac）
- テスト実行: `.venv/Scripts/python -m pytest -v`
- アプリ起動: `.venv/Scripts/python main.py`
- ⚠️ グローバルの python / pip の使用禁止（venv が存在する場合）
- ⚠️ グローバル環境への pip install を絶対に行わないこと

## テスト
- フレームワーク: pytest
- 設定: pyproject.toml の [tool.pytest.ini_options]
- 実行コマンド: `.venv/Scripts/python -m pytest -v`

## リンター・フォーマッター
- {使用ツール一覧}

## 対象OS
- {OS情報}
```

### ユーザー確認

成果物をユーザーに提示し、以下を確認する:
- Python バージョンが正しいか
- 依存管理方式が正しいか
- 実行コマンドが正しいか（OS別のパスが正しいか）
- 記載されていない開発ツールがないか

合意を得たら「開発環境逆引き完了」と明示する。

### 運用ルール
- 質問は1つずつ投げること
- コードの現実を記録すること（理想の設計ではない）
- 成果物作成後、ユーザーに提示して合意を得ること
- ユーザーに選択を求めるときは番号付き選択肢で提示すること（最後に「その他（自由記述）」を含める）
- ユーザーとの会話は日本語・敬語を使うこと
- **サブエージェントの呼び出し（Task ツール）は使用しないこと**（自身がさらにサブエージェントを呼び出すことを禁止）
- `requirements.txt` にバージョン指定がない場合は、現在インストールされているバージョンを確認する
- OS固有のパス（`Scripts` vs `bin`）は、ユーザーの環境に合わせる
```

## 変数一覧

| 変数 | 説明 | 例 |
|---|---|---|
| `{feature_name}` | スペックディレクトリ名 | `my-project` |
| `{project_root}` | プロジェクトルートの絶対パスまたは相対パス | `/home/user/my-project` |
| `{specs_path}` | スペックディレクトリのパス | `.aide/specs/my-project` |

## サブエージェントの期待する振る舞い

1. 解析手順（ステップ1〜5）に従い、設定ファイルを順次解析する
2. 各ステップで発見した情報を蓄積する
3. 全ステップ完了後、成果物フォーマットに従って `dev-environment.md` を作成する
4. 成果物をユーザーに提示し、合意を得る
5. 合意を得たら「開発環境逆引き完了」と明示して処理を終了する

## サブエージェントが返すべき情報

- 作成した成果物のファイルパス
- ユーザー合意の有無
- 特記事項（設定ファイルが見つからなかった項目、ユーザーに確認した事項等）
