# バグ修正方針

## 作成日
2026-06-17

## 対象バグ
`apm run setup-kiro-win` 実行時に setup-local.bat の日本語 echo 文（147行目）がエンコーディング破損により cmd.exe にパイプ演算子として誤解釈され、exit code 255 で失敗する。ファイルコピー自体は成功しているが、apm が非0終了コードにより失敗と判定する。

## 原因サマリー
setup-local.bat のエンコーディングが最初のコミット時点から破損している。CP932 マルチバイト文字の第1バイト（0x83等）が U+FFFD（EF BF BD）に変換され、第2バイトのうち ASCII 範囲のもの（特に「ポ」の 0x7C = `|`）が残存。cmd.exe がこの 0x7C をパイプ演算子として解釈し、echo 文の右辺をコマンド実行しようとしてエラーとなる。

## 修正方針

### 対策種別
根本対策

### 修正内容
1. **setup-local.bat を正しいエンコーディングで再作成する**
   - setup.bat と同様に「UTF-8 + `chcp 65001`」方式に統一する
   - 理由: setup.bat が既に UTF-8 + `chcp 65001` で正常動作しており、同一方式に揃えることで保守性が向上する。また `apm run` は PowerShell からコードページ 65001（UTF-8）で bat を実行するため、UTF-8 方式の方が apm 経由実行との親和性が高い
   - 改行コードは CRLF を維持（dev-environment.md §5.2）

2. **dev-environment.md §5.1 のエンコーディング規約を更新する**
   - 現状: bat は CP932 と記載
   - 実態: setup.bat は既に UTF-8 + `chcp 65001` で運用されている
   - 更新: bat ファイルのエンコーディング規約を「UTF-8 + 先頭に `chcp 65001 >nul`」に変更する

3. **.gitattributes を追加してエンコーディング保護を行う**
   - `*.bat` に対して `binary` または `-text` 属性を設定し、git による自動改行変換・エンコーディング変換を防止する
   - 再発防止策として機能する

### 修正対象ファイル
- `setup-local.bat`: UTF-8（BOM なし）+ `chcp 65001 >nul` + CRLF で全体を再作成。日本語 echo 文を正しい UTF-8 テキストで記述する
- `.gitattributes`（新規作成）: bat ファイルのエンコーディング変換防止設定を追加
- `.aide/specs/aide-powers/dev-environment.md` §5.1: bat ファイルのエンコーディング規約を UTF-8 + chcp 65001 に更新

### 副作用のリスク
- **setup-local.bat を直接 cmd.exe から実行する場合**: `chcp 65001` によりコードページが変更されるが、`setlocal` 内で実行されるため外部環境に影響しない。また setup.bat が既に同方式で問題なく動作している実績がある
- **他のスクリプトへの波及**: cleanup-kiro-agent.bat は ASCII のみで構成されており影響なし
- **既存ユーザーへの影響**: setup-local.bat は `apm install` で配布されるため、次回 `apm install` 時に自動的に修正版に置き換わる

## 類似不具合の調査結果

| ファイル | 状態 | 詳細 |
|---------|------|------|
| `setup.bat` | ✅ 正常 | UTF-8 + `chcp 65001` で正しくエンコードされている。U+FFFD = 0件。日本語表示も正常 |
| `cleanup-kiro-agent.bat` | ✅ 正常 | ASCII のみで構成（4220 bytes）。U+FFFD = 0件。マルチバイト文字を含まないため問題なし |
| `setup-local.bat` | ❌ 破損 | U+FFFD = 419件。全ての日本語テキストが破損。パイプ文字残存により実行時エラー発生 |

## リグレッションテスト方針

### テスト手順
- **再現テストの再実行**: 別プロジェクトで `apm run setup-kiro-win` を実行し、exit code 0 で正常終了することを確認する
- **日本語メッセージの表示確認**: 実行時に日本語メッセージが文字化けなく表示されることを目視確認する
- **ファイルコピーの完了確認**: `.kiro/skills/`, `.kiro/agents/`, `.kiro/steering/` に期待するファイルが配置されていることを確認する
- **直接実行の確認**: cmd.exe から `setup-local.bat . 1` を直接実行し、正常終了することを確認する
- **setup.bat のリグレッション確認**: setup.bat の動作に変更がないことを確認する（今回直接変更しないが、.gitattributes 追加の影響確認）
