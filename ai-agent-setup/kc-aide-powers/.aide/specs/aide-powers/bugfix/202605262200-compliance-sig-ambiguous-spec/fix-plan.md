# 修正方針書

## 原因サマリ

phase-compliance-check スキルの署名生成（sign）・署名検証（verify）において、AIエージェントが複数のサブコマンドを正しい順序・正しい引数で呼び出す必要があり、その手順がSKILL.mdに不明確に記述されている。特に verify モードで「成果物一覧のSHA256」（artifact-hash サブコマンドの出力値＝二重ハッシュ）を手動で構築しようとすると署名不一致になる。

## 対策

`verify-phase` と `sign-phase` サブコマンドを新設し、進捗ファイルパス + フェーズ番号（+ 成果物ファイルパス）だけで署名検証・生成が完結するようにする。

## 対策種別

**根本対策**

引数組み立ての曖昧さ・複雑さそのものを解消する。AIエージェントが artifact-hash を事前計算する必要がなくなるため、仕様の誤解による署名不一致が原理的に発生しなくなる。

## 修正内容（before → after）

### 修正1: compliance-sig スクリプト（.ps1 / .bat / .sh）

**新設サブコマンド:**

#### `verify-phase`

```
compliance-sig verify-phase <progress_file_path> <phase_number>
```

内部動作:
1. 進捗ファイルを読み込む
2. 該当フェーズの完了日時を抽出する
3. 該当フェーズの成果物テーブルから SHA256 値を抽出する
4. workflow_name をファイルから抽出する
5. artifact-hash を内部計算する（SHA256値が0件なら固定値 E3B0C44...）
6. 署名対象文字列を構築: `{workflow}|{phase}|{datetime}|{artifactHash}`
7. 該当フェーズの署名行 `<!-- PHASE-SIG:{N}:{Base64} -->` を抽出する
8. HMAC-SHA256 で計算し、抽出した署名と比較する
9. PASS / FAIL を出力する

#### `sign-phase`

```
compliance-sig sign-phase <progress_file_path> <phase_number> [artifact_file1] [artifact_file2] ...
```

内部動作:
1. 進捗ファイルを読み込む
2. workflow_name を抽出する
3. 該当フェーズの完了日時を抽出する
4. 成果物ファイルが指定されている場合:
   - 各ファイルの SHA256 をストリーム読み込みで計算する
   - 改行連結 → SHA256（二重ハッシュ）で artifact-hash を計算する
5. 成果物ファイルが0個の場合:
   - 固定値 `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` を使用する
6. 署名対象文字列を構築: `{workflow}|{phase}|{datetime}|{artifactHash}`
7. HMAC-SHA256 で署名を生成する
8. `ARTIFACT_HASH:{hash}` と `SIGNATURE:{sig}` を出力する

**エッジケース対応:**
- 成果物なし（引数0個）: 固定値を使用（現行 artifact-hash サブコマンドと同じ動作）
- 大きいファイル: ストリーム読み込み（[System.IO.File]::OpenRead）でメモリ効率を確保
- 成果物ファイル数が多い場合: PowerShell の引数制限は実質問題なし（数十ファイル程度が上限想定）。将来的にファイルリスト経由のオプション追加を検討

**後方互換:**
- 既存の `sign` / `verify` / `artifact-hash` / `sign-files` / `hash-files` サブコマンドはそのまま残す
- 新サブコマンドは追加のみ

### 修正2: skills/phase-compliance-check/SKILL.md

**verify モード:**
- Before: 「署名対象文字列を再構築し、HMAC-SHA256 で計算。抽出した署名と比較する」
- After: 「`verify-phase` サブコマンドを使用する。手動で署名対象文字列を構築してはならない」
- コマンド例を記載:
  ```
  compliance-sig.bat verify-phase <progress_file_path> <phase_number>
  ```

**write モード（署名生成）:**
- Before: `sign` + `artifact-hash` の2段階手順
- After: 「`sign-phase` サブコマンドを使用する」
- コマンド例を記載:
  ```
  compliance-sig.bat sign-phase <progress_file_path> <phase_number> [artifact_files...]
  ```

**「成果物なしフェーズの署名手順」セクション:**
- Before: 手動で固定値を指定する手順
- After: 「`sign-phase` に成果物ファイルを渡さなければ自動的に固定値が使用される」

### 修正3: agents/compliance-checker.md

**「AES 署名の仕組み」セクション:**
- 署名生成: `sign-phase` サブコマンドの使用に書き換え
- 署名検証: `verify-phase` サブコマンドの使用に書き換え
- 「成果物一覧のSHA256の構築方法」セクション: `sign-phase` が内部で自動計算する旨を明記

## 副作用リスク分析

| リスク | 影響度 | 対策 |
|---|---|---|
| 既存サブコマンドとの互換性 | 低 | 既存コマンドは残す。新コマンドは追加のみ |
| 進捗ファイルのパース失敗 | 中 | パースエラー時は明確なエラーメッセージを出力して exit 1 |
| 進捗ファイルフォーマット変更時の追従 | 低 | パース対象は固定パターン（PHASE-SIG行、成果物テーブル、完了日時）のみ |

## リグレッションテスト方針

1. **往復テスト:** `sign-phase` で署名生成 → `verify-phase` で検証 → PASS を確認
2. **成果物なしケース:** 成果物ファイル引数なしで `sign-phase` → `verify-phase` → PASS
3. **成果物ありケース:** 実際の成果物ファイルを指定して `sign-phase` → `verify-phase` → PASS
4. **改ざん検出テスト:** 署名後に進捗ファイルの完了日時を変更 → `verify-phase` → FAIL
5. **既存コマンド互換テスト:** 既存の `sign` / `verify` が引き続き動作することを確認

## ユーザー合意チェックリスト

- [x] 原因の理解（SKILL.md の記述曖昧性）
- [x] 対策種別の合意（根本対策）
- [x] 修正方針の合意（verify-phase / sign-phase サブコマンド新設）
- [x] 成果物なし・大きいファイルへの対応確認
