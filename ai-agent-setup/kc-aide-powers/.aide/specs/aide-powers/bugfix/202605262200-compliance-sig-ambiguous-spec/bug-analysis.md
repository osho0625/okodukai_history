# バグ原因分析

## 分析日
2026-05-26

## 原因箇所

### 1. phase-compliance-check SKILL.md（verify モード関連）

**ファイル:** `skills/phase-compliance-check/SKILL.md`

**問題箇所:** verify モードのプロセス説明（Step 2c）:
> 署名対象文字列を再構築し、HMAC-SHA256 で計算。抽出した署名と比較する

この記述では「署名対象文字列の第4引数（成果物一覧のSHA256）」をどのように取得するかが不明確。

**「成果物なしフェーズの署名手順」セクション** には以下の記述がある:
> 署名対象文字列: `{workflow_name}|{phase_number}|{完了日時}|E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`

しかし、成果物がある場合の第4引数の取得方法について、verify モードの説明には「スクリプトの verify サブコマンドに全て任せよ」という明確な指示がない。

### 2. compliance-checker エージェント定義

**ファイル:** `agents/compliance-checker.md`

**問題箇所:** 「AES 署名の仕組み」セクションの「署名検証（次フェーズ開始時）」:
```
skills\phase-compliance-check\scripts\compliance-sig.bat verify {workflow_name} {phase_number} "{完了日時}" {成果物一覧のSHA256} {抽出した署名Base64}
```

ここで `{成果物一覧のSHA256}` と書かれているが、これが:
- (A) 各成果物の SHA256 値を直接連結したもの
- (B) `artifact-hash` サブコマンドの出力値（二重ハッシュ）

のどちらであるかが曖昧。

### 3. スクリプトの実際の動作

**ファイル:** `skills/phase-compliance-check/scripts/compliance-sig.ps1`

**`artifact-hash` サブコマンドの動作:**
```powershell
$joined = $hashValues -join "`n"
$sha = [System.Security.Cryptography.SHA256]::Create()
$jBytes = [System.Text.Encoding]::UTF8.GetBytes($joined)
Write-Host ([BitConverter]::ToString($sha.ComputeHash($jBytes)).Replace("-",""))
```

つまり、個々の成果物 SHA256 値を改行で連結し、その連結文字列をさらに SHA256 ハッシュする（二重ハッシュ）。

**`sign` サブコマンドの動作:**
```powershell
$msg = "$Workflow|$Phase|$DateTime|$ArtifactHash"
$sig = Compute-Sig $msg
```

`sign` の第4引数 `$ArtifactHash` には `artifact-hash` サブコマンドの出力値（二重ハッシュ済み）を渡す設計。

**`verify` サブコマンドの動作:**
```powershell
$msg = "$Workflow|$Phase|$DateTime|$ArtifactHash"
$computed = Compute-Sig $msg
if ($computed -eq $ExpectedSig) { Write-Host "PASS" }
```

`verify` も同様に第4引数に `artifact-hash` の出力値を渡す必要がある。

## 根本原因

**SKILL.md と compliance-checker.md の記述が、スクリプトの実際の動作と乖離している。**

具体的には:
1. SKILL.md の verify モード説明に「verify 時はスクリプトの verify サブコマンドに全て任せよ」という指示がない
2. 「成果物一覧のSHA256」という表現が、`artifact-hash` サブコマンドの出力値（二重ハッシュ）を指すことが明示されていない
3. AIエージェントがスキルの記述を読んで手動で署名対象文字列を構築しようとすると、二重ハッシュを経由しないため署名不一致になる

**注記:** compliance-checker.md の「成果物一覧のSHA256の構築方法」セクションには以下の記述が既にある:
> **スクリプトの `artifact-hash` サブコマンドを使うこと。手動計算は禁止。**

しかし、この記述は write モードの署名生成時の文脈にあり、verify モードの署名検証時にも同様に `artifact-hash` を使うべきことが明示されていない。

## 影響範囲

| 影響を受けるファイル | 影響内容 |
|---|---|
| `skills/phase-compliance-check/SKILL.md` | verify モードの説明に明確な指示が不足 |
| `agents/compliance-checker.md` | verify モードでの artifact-hash 使用が不明確 |

## 起因元ドキュメントフォルダ
なし（スキルファイル・エージェント定義の初期作成時の記述不足）
