# 差分設計: screenshot-capture（新規スキル）

> 対象: `skills/screenshot-capture/SKILL.md`（新規作成）
> 関連 REQ: REQ-C-001
> 親索引: [delta-design.md](./delta-design.md)

## 概要

pyautogui を用いて指定パスに現在画面のスクリーンショットを撮影・保存する単一責任の共通スキルを新規作成する。撮影できない環境では同名ベースの `.err` ファイルを代替として残す。履歴ドメインの判断（何が写っているべきか）は一切持たない汎用部品とする。

## 確定事項

| 項目 | 確定値 |
|---|---|
| スキル名 | `screenshot-capture` |
| 配置パス | `skills/screenshot-capture/SKILL.md` |
| 入力 | 保存先ファイルパス（`output_path`）のみ |
| 依存ライブラリ | pyautogui（`.venv` に隔離。グローバル非汚染） |
| 出力（成功） | `output_path` に画像（`.png` 等）1 ファイル |
| 出力（失敗） | `output_path` のベース名 + `.err`（画像は作らない＝排他） |

## before → after

### before

`skills/screenshot-capture/` ディレクトリおよび `SKILL.md` は**存在しない**（新規追加）。

### after（新規作成する SKILL.md の全文設計）

```markdown
---
name: screenshot-capture
description: "指定された保存先パスに現在のアクティブ画面のスクリーンショットを pyautogui で撮影・保存する単一責任の共通スキル。未導入時は .venv に pyautogui を導入（グローバル非汚染）、撮影失敗時は同名ベースの .err を代替作成する。"
---

# スクリーンショット撮影（screenshot-capture）

指定された保存先ファイルパスに、現在のアクティブ画面のスクリーンショットを撮影して保存する共通スキル。

## このスキルの責務（単一責任・誤解禁止）

本スキルの責務は **「画面を撮る」「撮れない場合は `.err` を残す」「pyautogui が未導入なら `.venv` に導入する」** の 3 点のみである。

本スキルは **履歴の概念を一切持たない汎用部品** である。何が写っているべきか（該当 Step の文言・chat 画面の有無等）を判断・検証してはならない。撮影画像の中身の妥当性確認は、本スキルを呼び出す側（step-history-writer 等）の責務である。

- 入力は保存先パス（`output_path`）のみに依存する。
- 撮影画像の内容を解析・検証するロジックを持ってはならない。
- 履歴ファイル名・成果物フォルダ・フェーズ等の aide-powers ドメイン概念を引数に取らない。

## 呼び出し元

- `step-history-writer (aide-powers skill)` — 履歴ファイル書き出しと同時に、履歴ファイルと同名・拡張子違いの保存先パスを渡して activate する。
- その他、画面の物証を残したい任意のスキルから activate して再利用してよい（保存先パスを指定するだけで使える）。

## 入力パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| output_path | string | 必須 | 保存先ファイルパス（画像拡張子付き。例: `.aide/tmp/session-history-fs-change-phase1-analysis-step1.png`）。プロジェクトルートからの相対パスまたは絶対パス |

## 出力ファイル（排他）

1 回の撮影要求に対し、以下のいずれか一方の状態のみになる（両方同時に存在してはならない）。

| ケース | 生成物 | 内容 |
|---|---|---|
| 撮影成功 | `output_path`（画像 1 ファイル） | 撮影した画面の画像。`.err` は作成しない |
| 撮影失敗 | `output_path` のベース名 + `.err` | 失敗理由（例外内容・環境情報）を記載したテキスト。画像は作成しない |

- `.err` のパスは、`output_path` の拡張子部分を `.err` に置き換えたものとする。
  - 例: `.../session-history-...-step1.png` → `.../session-history-...-step1.err`

## Process

### Step 1: 保存先ディレクトリの準備

1. `output_path` の親ディレクトリが存在しない場合は作成する。
2. `output_path` のベース名から `.err` パスを導出しておく（拡張子を `.err` に置換）。

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
4. `.venv` の作成・pyautogui 導入のいずれかに失敗した場合は、撮影不能とみなして Step 4（失敗処理）へ進む。

> グローバル非汚染（dev-environment.md §13 と整合）: 撮影依存（pyautogui）は必ず `.venv` に隔離する。`pip install`（グローバル）や `--user` を使ってはならない。

### Step 3: スクリーンショット撮影と保存

1. `.venv` の Python で pyautogui を用いて現在画面を撮影し、`output_path` に保存する。
   - 例（Windows）: `.\.venv\Scripts\python -c "import pyautogui; pyautogui.screenshot(r'{output_path}')"`
   - 例（bash）: `./.venv/bin/python -c "import pyautogui; pyautogui.screenshot('{output_path}')"`
2. 保存後、`output_path` にファイルが生成されたことを確認する。
3. 撮影・保存に成功した場合、`.err` ファイルが存在すれば削除し（排他保証）、正常終了する。
4. 撮影中に例外（ディスプレイなし・X11/表示環境なし・pyautogui 内部エラー等）が発生した場合は Step 4 へ進む。

### Step 4: 撮影失敗時の `.err` 代替作成

1. `output_path`（画像）が中途半端に生成されていれば削除する（排他保証）。
2. `.err` パスに、失敗理由を記載したテキストファイルを作成する。記載内容:
   - 失敗時刻
   - 例外メッセージ（撮影不能の理由）
   - 取得できる環境情報（OS・ディスプレイ有無の判定結果等）
3. `.err` を作成したことを呼び出し元に返す（撮影不能であった旨）。

### 排他の保証（最重要）

- 「画像が存在し `.err` が存在しない」または「`.err` が存在し画像が存在しない」のいずれか一方の状態で終了すること。
- 両方が同時に存在する状態で終了してはならない。成功時は `.err` を残さず、失敗時は画像を残さない。

## エラー時の動作

- 本スキルは「撮影の成否」を呼び出し元へ返すが、**撮影失敗そのものを致命的エラーとして扱わない**（`.err` を残して正常に制御を返す）。呼び出し元（step-history-writer）のフェーズ進行を中断させる判断はしない。
- `.venv` 作成・pip 導入の失敗も撮影失敗として扱い、`.err` に理由を記載する。

## Integration

**Called by:**
- `step-history-writer (aide-powers skill)` — 履歴書き出しと同時に呼び出される（REQ-C-002）

**依存:**
- Python 実行環境（`.venv` に pyautogui を導入できること）
- GUI/ディスプレイ環境（ない場合は `.err` 代替）

**設計書（dev-environment.md）との整合:**
- §1/§3/§12（pyautogui を `.venv` に隔離して補助使用）、§13（グローバル非汚染）。詳細は delta-design-dev-environment.md を参照。
```

## 変更理由

- **新規追加の理由:** 撮影能力を step-history-writer に直接埋め込むと、撮影手段（ライブラリ・`.venv` 導入手順・`.err` 代替・将来の OS 別撮影）の変更が step-history-writer 本体へ波及する。単一責任スキルとして切り出すことで、呼び出し側は「保存先パスを渡して activate する」インターフェースのみに依存し、撮影実装を独立して拡張・差し替えできる（OCP遵守。approach.md REQ-C-001）。
- **責務を撮影のみに限定する理由:** AC-001-6。履歴ドメインの判断（何が写っているべきか）を持たせると単一責任が崩れ、他スキルからの再利用が困難になる。写り込み妥当性は呼び出し側（step-history-writer の一次保証）と compliance-checker（独立検証）が担う多層構造とする。
- **`.venv` 隔離の理由:** AC-001-2 およびグローバル非汚染（dev-environment.md §13）。グローバル Python 環境を汚染しないため、依存を必ず `.venv` に閉じ込める。
- **画像／`.err` 排他の理由:** AC-001-4。撮影要求 1 回に対し成果物の状態を一意に定めることで、compliance-checker が「画像なし＝偽装疑い」か「`.err`＝環境起因」かを明確に区別できる。

## 受入基準カバレッジ

| AC | 充足箇所 |
|---|---|
| AC-001-1 | 入力パラメータ `output_path` / Process Step 3（画像 1 ファイル保存） |
| AC-001-2 | Process Step 2（`.venv` 導入・グローバル非汚染） |
| AC-001-3 | Process Step 4（`.err` 作成・失敗理由記載・画像非作成） |
| AC-001-4 | 「排他の保証」節 / 出力ファイル（排他）表 |
| AC-001-5 | front-matter・Integration（共通スキルとして配置・呼び出し側がパス指定） |
| AC-001-6 | 「このスキルの責務」節（履歴ドメイン非依存・内容検証ロジックを持たない） |
