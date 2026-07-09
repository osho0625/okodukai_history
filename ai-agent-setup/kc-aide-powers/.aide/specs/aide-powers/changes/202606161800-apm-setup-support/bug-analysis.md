# バグ原因分析

## 分析日
2026-06-17

## 現状把握

### 設計書の状態
メタ開発のため通常の設計書構成とは異なる。dev-environment.md §14参照。setup-local.bat は dev-environment.md §5.1 で「Shift_JIS（CP932）」エンコーディングと定義されている。

### 既存テストの状態
- 自動テストなし（dev-environment.md §7.4: 自動テストフレームワーク導入しない方針）

### 再現試験結果
`temp/test-apm-bug/` フォルダで以下の手順により再現に成功:

1. `apm.yml`（name + version）を作成
2. `apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers` を実行 → 成功（78 skills integrated）
3. `apm.yml` に `scripts: setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"` を追記
4. `apm run setup-kiro-win` を実行 → **失敗（exit code 255）**

**実行結果の詳細:**
- `.kiro/skills/`（78件）、`.kiro/agents/`、`.kiro/steering/` へのファイルコピーは**実際には成功している**
- コピー完了後の `:done` セクションの echo 文（147行目）で失敗する
- エラーメッセージ:
  ```
  '�W�g���ɃR�~�b�g����΃`�[���ŋ��L�ł��܂��B' is not recognized as an internal or external command, operable program or batch file.
  ```
- `apm run` が exit code 255 を返し、スクリプト失敗と判定される

**補足:** バグ報告では「ファイルがコピーされない」とあるが、再現試験では実際にはコピーは成功している。exit code 非0のため apm が失敗と判定し、ユーザーが「コピーされていない」と誤認した可能性が高い。

## 原因分析

### 原因箇所
- ファイル: `setup-local.bat`
- 行番号: 147行目
- 該当コード: `echo リポジトリにコミットすればチームで共有できます。`（本来の意図）

### 原因の説明
`setup-local.bat` のエンコーディングが破損している。dev-environment.md §5.1 では CP932（Shift_JIS）と定義されているが、実際のファイルは git リポジトリ内で**最初のコミット（f8639fe）の時点から既に破損した状態**で格納されている。

具体的には、CP932 の日本語マルチバイト文字が UTF-8 の置換文字 U+FFFD（バイト列 `EF BF BD`）に変換されてしまっているが、マルチバイト文字の第2バイトのうち ASCII と重複するものは生き残っている。

147行目の「リ**ポ**ジトリにコ**ミ**ットすれば**チ**ームで共有できます。」に含まれる:
- **`ポ`** = CP932 で `83 7C`。第2バイト `7C` は ASCII の `|`（パイプ）
- **`チ`** = CP932 で `83 60`。第2バイト `60` は ASCII の `` ` ``（バッククォート）

エンコーディング破損により `83` → `EF BF BD`（U+FFFD）に変換されたが、`7C`（`|`）は ASCII として残存。cmd.exe はこの `|` をパイプ演算子と解釈し、echo 文を2つのコマンドに分割する:
1. `echo [garbled_text]` → 文字化け文字列を出力（成功）
2. `[garbled_text_after_pipe]` → コマンドとして実行しようとする（失敗）

### 技術的な詳細

**ファイルのバイト構造（147行目）:**
```
echo EF BF BD EF BF BD EF BF BD 7C EF BF BD 57 ...
                                 ^^
                                 | ← パイプ演算子として解釈される
```

**エンコーディング破損の経緯:**
1. setup-local.bat は本来 CP932 で記述されるべきファイル（dev-environment.md §5.1）
2. git にコミットされた時点で既にエンコーディングが破損（最初のコミット f8639fe から）
3. `.gitattributes` が存在せず、git の自動エンコーディング変換制御がない
4. CP932 のマルチバイト文字の第1バイト（`83` 等）が U+FFFD に置換され、第2バイトのうち ASCII 範囲のもの（`7C`, `60`, `57`, `67` 等）が単独バイトとして残存
5. `apm run` は PowerShell から bat を実行する際、コードページ 65001（UTF-8）で動作する
6. cmd.exe がファイルを読む際、残存した `7C`（`|`）バイトをパイプ演算子として解釈し、echo 行の右辺をコマンドとして実行しようとする

**exit code の流れ:**
- パイプ右辺のコマンド実行が失敗 → ERRORLEVEL が非0に設定
- bat 自体は `goto :end` → `exit /b 0` に到達するが、パイプの失敗が最終 exit code に影響
- `apm run` が exit code 255 として報告（apm 独自のエラーラッピングの可能性）

## 影響範囲
- `setup-local.bat` — 147行目の echo 文（直接原因）
- `setup-local.bat` 全体 — 他の日本語 echo 文も同様に破損している（ただし `|` を含む文字が他にない限り実行時エラーにはならない）
- `setup.bat` — 同様の破損が存在する可能性あり（未検証）

## 起因元ドキュメントフォルダ
- パス: `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/`
- コミットハッシュ: b3d673f
- コミットメッセージ1行目: feat: APM経由のセットアップ対応

## テストカバレッジ
- 原因箇所のテスト: なし（自動テスト未導入）
- 影響範囲のテスト: なし
