# レビュー観点: 署名フロー全体の整合性（PI-009）

## ロジック定義（正しい仕様）

### sign-phase のデータフロー

```
入力: progress_file_path, phase_number, [artifact_file1, artifact_file2, ...]

1. progress_file から workflow_name と completed_at を抽出
2. 各 artifact_file の SHA256 を計算 → raw_hash_1, raw_hash_2, ...
3. raw_hash を改行結合して SHA256 → artifact_hash
   artifact_hash = SHA256(raw_hash_1 + "\n" + raw_hash_2 + ...)
   ※ ファイル0件の場合: artifact_hash = E3B0C44...（空文字列のSHA256）
4. 署名対象文字列: "{workflow}|{phase}|{datetime}|{artifact_hash}"
5. HMAC-SHA256(署名対象文字列, key) → signature
6. 出力: ARTIFACT_HASH:{artifact_hash}, SIGNATURE:{signature}
```

### verify-phase のデータフロー

```
入力: progress_file_path, phase_number

1. progress_file から workflow_name と completed_at を抽出
2. progress_file のフェーズセクションから成果物テーブルの SHA256 列を抽出
   → table_hash_1, table_hash_2, ...
3. table_hash を改行結合して SHA256 → artifact_hash
   artifact_hash = SHA256(table_hash_1 + "\n" + table_hash_2 + ...)
   ※ テーブルにハッシュ0件の場合: artifact_hash = E3B0C44...
4. 署名対象文字列: "{workflow}|{phase}|{datetime}|{artifact_hash}"
5. HMAC-SHA256(署名対象文字列, key) → computed_signature
6. progress_file から PHASE-SIG:{phase}:{expected_signature} を抽出
7. computed_signature == expected_signature → PASS / FAIL
```

### 整合性条件（sign と verify が一致するための必要十分条件）

```
sign-phase の step 2 で計算した raw_hash_N
  == verify-phase の step 2 で読み取った table_hash_N

つまり: 成果物テーブルの SHA256 列に書く値 = 成果物ファイルの生SHA256
```

### 成果物テーブルに書くべき値

```
テーブルの SHA256 列 = SHA256(ファイル内容)
                    = Get-FileHash -Algorithm SHA256 の出力（大文字）
                    ≠ hash-files の出力（二重ハッシュ）
                    ≠ sign-phase の ARTIFACT_HASH 出力（二重ハッシュ）
```

---

## コードレビュー観点

### 観点1: コード実装がロジック定義に従っているか

| # | チェック対象 | チェック内容 | 結果 |
|---|---|---|---|
| 1-1 | sign-phase (ps1) step 2 | 各ファイルの SHA256 を OpenRead → SHA256.ComputeHash で計算しているか | |
| 1-2 | sign-phase (ps1) step 3 | raw_hash を "`n" で結合して SHA256 しているか | |
| 1-3 | verify-phase (ps1) step 2 | テーブルから正規表現で 64文字hex を抽出しているか | |
| 1-4 | verify-phase (ps1) step 3 | table_hash を "`n" で結合して SHA256 しているか | |
| 1-5 | sign-phase (sh) step 2 | 各ファイルの SHA256 を sha256sum/openssl で計算しているか | |
| 1-6 | sign-phase (sh) step 3 | raw_hash を "\n" で結合して SHA256 しているか | |
| 1-7 | verify-phase (sh) step 2 | テーブルから grep で 64文字hex を抽出しているか | |
| 1-8 | verify-phase (sh) step 3 | table_hash を "\n" で結合して SHA256 しているか | |

### 観点2: agents/compliance-checker.md の指示がロジック定義と整合しているか

| # | チェック対象 | チェック内容 | 結果 |
|---|---|---|---|
| 2-1 | テーブル記入値の指示 | 「Get-FileHash で生SHA256を取得してテーブルに書け」と明記されているか | |
| 2-2 | 禁止事項 | 「hash-files の出力をテーブルに書くな」「ARTIFACT_HASH をテーブルに書くな」が明記されているか | |
| 2-3 | sign-phase の用途 | 「署名生成のみ。テーブル記入値の取得には使わない」が明記されているか | |
| 2-4 | 手順の順序 | 「Get-FileHash → テーブル記入 → sign-phase」の順序が明記されているか | |

### 観点3: 往復テスト（E2E）

| # | テストケース | 期待結果 | 結果 |
|---|---|---|---|
| 3-1 | 成果物1件: Get-FileHash → テーブル記入 → sign-phase → verify-phase | PASS | |
| 3-2 | 成果物複数件: 同上 | PASS | |
| 3-3 | 成果物なし: sign-phase（引数なし）→ verify-phase | PASS | |
| 3-4 | 間違い: ARTIFACT_HASH をテーブルに記入 → verify-phase | FAIL | |
| 3-5 | 間違い: hash-files 出力をテーブルに記入 → verify-phase | FAIL | |

### 観点4: 後方互換性

| # | テストケース | 期待結果 | 結果 |
|---|---|---|---|
| 4-1 | PI-001 bugfix-progress.md 全フェーズ verify-phase | 全 PASS | |
| 4-2 | 変更WF change-progress.md フェーズ1〜4 verify-phase | 全 PASS | |
