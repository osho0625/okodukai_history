---
name: screenshot-capture
description: "指定された保存先パスに現在のアクティブ画面のスクリーンショットを撮影・保存する共通スキル。"
---

# スクリーンショット撮影（screenshot-capture）

指定された保存先ファイルパス（`output_path`）に現在のアクティブ画面を撮影して保存する共通スキル。入力は `output_path` だけに依存する。

## 入力パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| output_path | string | 必須 | 保存先ファイルパス（画像拡張子付き。例: `.aide/tmp/capture-001.png`）。プロジェクトルートからの相対パスまたは絶対パス |

## Process

### Step 1: 保存先ディレクトリの準備

`output_path` の親ディレクトリが存在しない場合は作成する。

### Step 2: pyautogui の利用可能性確認と `.venv` への導入

1. プロジェクトルートに `.venv` が存在するか確認する。なければ作成する。
   - Windows（PowerShell）: `python -m venv .venv`
   - bash: `python3 -m venv .venv`
2. `.venv` の Python で pyautogui が import 可能か確認する。
   - Windows: `.\.venv\Scripts\python -c "import pyautogui"`
   - bash: `./.venv/bin/python -c "import pyautogui"`
3. 未導入（import 失敗）の場合、`.venv` にインストールする。**グローバル環境へは一切インストールしない。**
   - Windows: `.\.venv\Scripts\python -m pip install pyautogui`
   - bash: `./.venv/bin/python -m pip install pyautogui`

> Python 依存（pyautogui）は必ず `.venv` に隔離する。`pip install`（グローバル）や `--user` を使ってはならない。

### Step 3: スクリーンショット撮影と保存

1. `.venv` の Python で pyautogui を用いて現在画面を撮影し、`output_path` に保存する。
   - 例（Windows）: `.\.venv\Scripts\python -c "import pyautogui; pyautogui.screenshot(r'{output_path}')"`
   - 例（bash）: `./.venv/bin/python -c "import pyautogui; pyautogui.screenshot('{output_path}')"`
2. `output_path` にファイルが生成されたことを確認する。

## エラー時の動作

撮影できなかった場合（`.venv` 作成・pyautogui 導入の失敗、ディスプレイなし、撮影中の例外等）は、撮影できなかった旨と理由を呼び出し元に説明して制御を返す。ファイルは作らない。撮影失敗そのものを致命的エラーとして扱わず、呼び出し元の処理を中断させる判断はしない。

## Integration

**依存:**
- Python 実行環境（`.venv` に pyautogui を導入できること）
- GUI/ディスプレイ環境
