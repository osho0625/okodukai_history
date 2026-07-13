# バグ報告（PI-005）: compliance-checker が sign-phase に任せるべきハッシュ計算を自前実行する

## 症状

compliance-checker サブエージェントが write モード実行時に、PowerShell の `Get-FileHash` コマンドで成果物ファイルの SHA256 ハッシュを自前計算しようとする。

## 再現手順

1. 任意のワークフローでフェーズを完了する
2. phase-compliance-check (write) が compliance-checker サブエージェントを起動する
3. サブエージェントが成果物ファイルのハッシュを `Get-FileHash` で計算しようとする

## 期待動作

`compliance-sig.bat sign-phase <progress_file_path> <phase_number> [artifact_files...]` を呼ぶだけで完結すべき。

## 修正対象

- `agents/compliance-checker.md`

## 修正内容

1. 検証項目 B に「存在確認のみ。ハッシュ計算禁止」を追記
2. AES署名セクションに Iron Law 追加（sign-phase に全て任せよ）
3. write モードの実行フロー全体像セクションを新設
4. 旧手順セクションに「新規使用禁止」を強調
