# バグ報告

## 報告日
2026-06-17

## バグの症状
別プロジェクト（janken2）で `apm run setup-kiro-win` を実行すると、ファイルコピーが行われない。コピー完了後の日本語メッセージ出力部分が「コマンド」として解釈され、exit code 255 で失敗する。

## 再現手順
1. janken2 プロジェクトの apm.yml に以下を記載する:
   ```yaml
   scripts:
     setup-kiro-win: "apm_modules\\takashi\\aide-powers\\setup-local.bat . 1"
   ```
2. PowerShell で `apm run setup-kiro-win` を実行する

## 期待動作
skills, agents, steering のコピーが完了し、正常終了（exit code 0）すること。

## 実際の動作
- ファイルがコピーされない。完了メッセージは表示されるが実際のコピー先にファイルが存在しない
- コピー完了後の「配置完了メッセージ」表示部分で文字化けが発生する
- 文字化けした日本語が「コマンド」として解釈される:
  ```
  '[文字化けした日本語コマンド]' is not recognized as an internal or external command, operable program or batch file.
  ```
- exit code 255 でスクリプト実行が失敗と判定される:
  ```
  x Unknown execution failed (exit code: 255)
  [X] Script execution error: Script execution failed with exit code 255
  ```

## 発生頻度
毎回

## 発生環境・条件
- OS: Windows
- シェル: PowerShell
- プロジェクト: janken2（`C:\Users\00080700167\Documents\kiro\projects\janken2`）
- 実行コマンド: `apm run setup-kiro-win`
- スクリプト: `apm_modules\takashi\aide-powers\setup-local.bat . 1`（引数 `.` はプロジェクトルート、`1` は Kiro IDE を自動選択）

## 補足情報
- 実行ログから、文字エンコーディング（CP932 vs UTF-8）の問題で日本語が化けている可能性がある
- バッチファイルの配置完了メッセージ出力部分がコマンドとして誤解釈されている
- `apm run` はスクリプトの exit code を見て成功/失敗を判定している
- 完了メッセージは表示されるが実際のファイルコピーは行われていない。exit code 255 で異常終了する
