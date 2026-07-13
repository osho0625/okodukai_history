# バグ修正差分設計書

## 概要

phase-compliance-check の署名生成・検証を簡素化するため、`verify-phase` と `sign-phase` サブコマンドを新設し、SKILL.md およびエージェント定義を書き換える。

## 変更内容

### 変更1: compliance-sig.ps1 に `verify-phase` サブコマンド追加

**Before:** 存在しない

**After:**
```powershell
"verify-phase" {
    # Usage: compliance-sig.ps1 verify-phase <progress_file_path> <phase_number>
    param(
        [string]$ProgressFile = $Workflow,  # Position 1
        [string]$PhaseNum = $Phase          # Position 2
    )
    
    if (-not (Test-Path $ProgressFile)) {
        Write-Host "FAIL"
        Write-Host "Progress file not found: $ProgressFile"
        exit 1
    }
    
    $content = Get-Content $ProgressFile -Raw
    
    # workflow_name を抽出（基本情報テーブルから）
    if ($content -match '\|\s*ワークフロー\s*\|\s*(\w+)\s*\|') {
        $wfName = $Matches[1]
    } else {
        Write-Host "FAIL"; Write-Host "Cannot extract workflow_name"; exit 1
    }
    
    # 該当フェーズの完了日時を抽出（フェーズ詳細セクションから）
    if ($content -match "### フェーズ${PhaseNum}:[\s\S]*?\|\s*完了日時\s*\|\s*([^\s|]+)\s*\|") {
        $completedAt = $Matches[1]
    } else {
        Write-Host "FAIL"; Write-Host "Cannot extract completion datetime for phase $PhaseNum"; exit 1
    }
    
    # 該当フェーズの成果物テーブルから SHA256 値を抽出
    # フェーズ詳細セクション内の「#### 成果物」テーブルの SHA256 列を取得
    $phaseSection = [regex]::Match($content, "### フェーズ${PhaseNum}:[\s\S]*?(?=### フェーズ|### COMPLIANCE|$)").Value
    $hashMatches = [regex]::Matches($phaseSection, '\|\s*\S+\s*\|\s*([0-9a-fA-F]{64})\s*\|')
    
    $hashValues = @()
    foreach ($m in $hashMatches) {
        $hashValues += $m.Groups[1].Value
    }
    
    # artifact-hash を計算
    if ($hashValues.Length -eq 0) {
        $artifactHash = "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
    } else {
        $joined = $hashValues -join "`n"
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $jBytes = [System.Text.Encoding]::UTF8.GetBytes($joined)
        $artifactHash = [BitConverter]::ToString($sha.ComputeHash($jBytes)).Replace("-","")
        $sha.Dispose()
    }
    
    # 署名行を抽出
    if ($content -match "<!-- PHASE-SIG:${PhaseNum}:([A-Za-z0-9+/=]+) -->") {
        $expectedSig = $Matches[1]
    } else {
        Write-Host "FAIL"; Write-Host "Signature not found for phase $PhaseNum"; exit 1
    }
    
    # 署名検証
    $msg = "$wfName|$PhaseNum|$completedAt|$artifactHash"
    $computed = Compute-Sig $msg
    if ($computed -eq $expectedSig) {
        Write-Host "PASS"
    } else {
        Write-Host "FAIL"
        Write-Host "expected: $expectedSig"
        Write-Host "computed: $computed"
        Write-Host "message: $msg"
        exit 1
    }
}
```

### 変更2: compliance-sig.ps1 に `sign-phase` サブコマンド追加

**Before:** 存在しない

**After:**
```powershell
"sign-phase" {
    # Usage: compliance-sig.ps1 sign-phase <progress_file_path> <phase_number> [artifact_file1] [artifact_file2] ...
    $ProgressFile = $Workflow   # Position 1
    $PhaseNum = $Phase          # Position 2
    # Remaining args = artifact files
    $artifactFiles = @()
    if ($DateTime) { $artifactFiles += $DateTime }
    if ($ArtifactHash) { $artifactFiles += $ArtifactHash }
    if ($RemainingFiles) { $artifactFiles += $RemainingFiles }
    
    if (-not (Test-Path $ProgressFile)) {
        Write-Host "ERROR: Progress file not found: $ProgressFile"
        exit 1
    }
    
    $content = Get-Content $ProgressFile -Raw
    
    # workflow_name を抽出
    if ($content -match '\|\s*ワークフロー\s*\|\s*(\w+)\s*\|') {
        $wfName = $Matches[1]
    } else {
        Write-Host "ERROR: Cannot extract workflow_name"; exit 1
    }
    
    # 該当フェーズの完了日時を抽出
    if ($content -match "### フェーズ${PhaseNum}:[\s\S]*?\|\s*完了日時\s*\|\s*([^\s|]+)\s*\|") {
        $completedAt = $Matches[1]
    } else {
        Write-Host "ERROR: Cannot extract completion datetime for phase $PhaseNum"; exit 1
    }
    
    # artifact-hash を計算
    if ($artifactFiles.Length -eq 0) {
        $artifactHash = "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
    } else {
        $hashes = @()
        foreach ($f in $artifactFiles) {
            if (-not (Test-Path $f)) {
                Write-Host "ERROR: Artifact file not found: $f"; exit 1
            }
            $sha = [System.Security.Cryptography.SHA256]::Create()
            $stream = [System.IO.File]::OpenRead($f)
            $h = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace("-","")
            $stream.Close(); $sha.Dispose()
            $hashes += $h
        }
        $joined = $hashes -join "`n"
        $sha2 = [System.Security.Cryptography.SHA256]::Create()
        $jBytes = [System.Text.Encoding]::UTF8.GetBytes($joined)
        $artifactHash = [BitConverter]::ToString($sha2.ComputeHash($jBytes)).Replace("-","")
        $sha2.Dispose()
    }
    
    Write-Host "ARTIFACT_HASH:$artifactHash"
    $msg = "$wfName|$PhaseNum|$completedAt|$artifactHash"
    $sig = Compute-Sig $msg
    Write-Host "SIGNATURE:$sig"
}
```

### 変更3: compliance-sig.bat に同等のサブコマンド追加

**Before:** `verify-phase` / `sign-phase` なし

**After:** PowerShell 版を呼び出すラッパーとして実装（既存パターンと同じ）

### 変更4: compliance-sig.sh に verify-phase / sign-phase サブコマンド追加

**Before:** `verify-phase` / `sign-phase` なし

**After:**
```bash
verify-phase)
    # Usage: compliance-sig.sh verify-phase <progress_file_path> <phase_number>
    PROGRESS_FILE="$2"
    PHASE_NUM="$3"
    
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "FAIL"
        echo "Progress file not found: $PROGRESS_FILE"
        exit 1
    fi
    
    CONTENT=$(cat "$PROGRESS_FILE")
    
    # workflow_name を抽出
    WF_NAME=$(echo "$CONTENT" | grep -oP '\|\s*ワークフロー\s*\|\s*\K\w+')
    if [ -z "$WF_NAME" ]; then
        echo "FAIL"; echo "Cannot extract workflow_name"; exit 1
    fi
    
    # 該当フェーズの完了日時を抽出
    COMPLETED_AT=$(echo "$CONTENT" | sed -n "/### フェーズ${PHASE_NUM}:/,/### フェーズ\|### COMPLIANCE/p" | grep -oP '\|\s*完了日時\s*\|\s*\K[^\s|]+')
    if [ -z "$COMPLETED_AT" ]; then
        echo "FAIL"; echo "Cannot extract completion datetime for phase $PHASE_NUM"; exit 1
    fi
    
    # 該当フェーズの成果物テーブルから SHA256 値を抽出
    PHASE_SECTION=$(echo "$CONTENT" | sed -n "/### フェーズ${PHASE_NUM}:/,/### フェーズ\|### COMPLIANCE/p")
    HASH_VALUES=$(echo "$PHASE_SECTION" | grep -oP '\|\s*\S+\s*\|\s*\K[0-9a-fA-F]{64}(?=\s*\|)')
    
    # artifact-hash を計算
    if [ -z "$HASH_VALUES" ]; then
        ARTIFACT_HASH="E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
    else
        JOINED=$(echo "$HASH_VALUES" | tr '\n' '\n')
        ARTIFACT_HASH=$(printf '%s' "$JOINED" | sha256sum | awk '{print toupper($1)}')
    fi
    
    # 署名行を抽出
    EXPECTED_SIG=$(echo "$CONTENT" | grep -oP "<!-- PHASE-SIG:${PHASE_NUM}:\K[A-Za-z0-9+/=]+" )
    if [ -z "$EXPECTED_SIG" ]; then
        echo "FAIL"; echo "Signature not found for phase $PHASE_NUM"; exit 1
    fi
    
    # 署名検証
    MSG="${WF_NAME}|${PHASE_NUM}|${COMPLETED_AT}|${ARTIFACT_HASH}"
    COMPUTED=$(echo -n "$MSG" | openssl dgst -sha256 -hmac "$(cat "$KEY_PATH")" -binary | base64)
    if [ "$COMPUTED" = "$EXPECTED_SIG" ]; then
        echo "PASS"
    else
        echo "FAIL"
        echo "expected: $EXPECTED_SIG"
        echo "computed: $COMPUTED"
        echo "message: $MSG"
        exit 1
    fi
    ;;

sign-phase)
    # Usage: compliance-sig.sh sign-phase <progress_file_path> <phase_number> [artifact_file1] [artifact_file2] ...
    PROGRESS_FILE="$2"
    PHASE_NUM="$3"
    shift 3
    ARTIFACT_FILES=("$@")
    
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "ERROR: Progress file not found: $PROGRESS_FILE"; exit 1
    fi
    
    CONTENT=$(cat "$PROGRESS_FILE")
    
    # workflow_name を抽出
    WF_NAME=$(echo "$CONTENT" | grep -oP '\|\s*ワークフロー\s*\|\s*\K\w+')
    if [ -z "$WF_NAME" ]; then
        echo "ERROR: Cannot extract workflow_name"; exit 1
    fi
    
    # 該当フェーズの完了日時を抽出
    COMPLETED_AT=$(echo "$CONTENT" | sed -n "/### フェーズ${PHASE_NUM}:/,/### フェーズ\|### COMPLIANCE/p" | grep -oP '\|\s*完了日時\s*\|\s*\K[^\s|]+')
    if [ -z "$COMPLETED_AT" ]; then
        echo "ERROR: Cannot extract completion datetime for phase $PHASE_NUM"; exit 1
    fi
    
    # artifact-hash を計算
    if [ ${#ARTIFACT_FILES[@]} -eq 0 ]; then
        ARTIFACT_HASH="E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
    else
        HASHES=""
        for f in "${ARTIFACT_FILES[@]}"; do
            if [ ! -f "$f" ]; then
                echo "ERROR: Artifact file not found: $f"; exit 1
            fi
            H=$(sha256sum "$f" | awk '{print toupper($1)}')
            if [ -z "$HASHES" ]; then
                HASHES="$H"
            else
                HASHES="${HASHES}\n${H}"
            fi
        done
        ARTIFACT_HASH=$(printf '%b' "$HASHES" | sha256sum | awk '{print toupper($1)}')
    fi
    
    echo "ARTIFACT_HASH:$ARTIFACT_HASH"
    MSG="${WF_NAME}|${PHASE_NUM}|${COMPLETED_AT}|${ARTIFACT_HASH}"
    SIG=$(echo -n "$MSG" | openssl dgst -sha256 -hmac "$(cat "$KEY_PATH")" -binary | base64)
    echo "SIGNATURE:$SIG"
    ;;
```

### 変更5: skills/phase-compliance-check/SKILL.md の verify モード書き換え

**Before:**
```
2. サブエージェントが以下を検証:
   a. 進捗ファイルを Read で読み込む
   b. 前フェーズ（phase_number - 1）の署名行を抽出する
   c. 署名対象文字列を再構築し、HMAC-SHA256 で計算。抽出した署名と比較する
```

**After:**
```
2. サブエージェントが以下を検証:
   a. `verify-phase` サブコマンドを実行する:
      compliance-sig.bat verify-phase <progress_file_path> <phase_number - 1>
   b. 出力が PASS → 署名検証成功
   c. 出力が FAIL → 署名検証失敗（理由を報告）
   
   ⚠️ 手動で署名対象文字列を構築してはならない。verify-phase が内部で全て処理する。
```

#### 追加書き換え箇所: 「成果物なしフェーズの署名手順 > 検証時の注意」セクション

**Before:**
```
### 検証時の注意

verify モードで成果物なしフェーズの署名を検証する際も、同じ固定値を使用して署名対象文字列を再構築すること。
```

**After:**
```
### 検証時の注意

`verify-phase` サブコマンドが内部で自動的に固定値を使用するため、手動での固定値指定は不要。
`verify-phase` を使用すれば、成果物の有無に関わらず正しく署名検証が行われる。
```

### 変更6: skills/phase-compliance-check/SKILL.md の write モードに署名生成コマンドガイダンスを追加

**Before:** SKILL.md の write モードセクションには具体的な署名生成コマンド例は未記載（高レベルのプロセス記述のみ。具体的コマンドは compliance-checker.md に記載）

**After:** SKILL.md の「成果物なしフェーズの署名手順」セクションの後に、新セクション「署名生成・検証コマンド（推奨）」として以下のコマンドガイダンスを追加する:

```
### 署名生成・検証コマンド（推奨）

署名生成:
compliance-sig.bat sign-phase <progress_file_path> <phase_number> [artifact_file1] [artifact_file2] ...

署名検証:
compliance-sig.bat verify-phase <progress_file_path> <phase_number>

成果物ファイルなしの場合:
compliance-sig.bat sign-phase <progress_file_path> <phase_number>
→ 自動的に固定値 E3B0C44... が使用される

⚠️ 旧コマンド（sign / verify / artifact-hash）の直接使用は非推奨。sign-phase / verify-phase を使用すること。
```

### 変更7: agents/compliance-checker.md の「AES 署名の仕組み」セクション書き換え

**Before:**
```
### 署名生成（PASS 時）
compliance-sig.bat sign {workflow_name} {phase_number} "{完了日時}" {成果物一覧のSHA256}

### 「成果物一覧のSHA256」の構築方法
compliance-sig.bat artifact-hash HASH1 HASH2 HASH3

### 署名検証（次フェーズ開始時）
compliance-sig.bat verify {workflow_name} {phase_number} "{完了日時}" {成果物一覧のSHA256} {抽出した署名Base64}
```

**After:**
```
### 署名生成（PASS 時）
compliance-sig.bat sign-phase <progress_file_path> <phase_number> [artifact_file1] [artifact_file2] ...

出力:
- ARTIFACT_HASH:{hash} — 成果物テーブルの SHA256 列に記載する値ではない（内部計算用）
- SIGNATURE:{sig} — 進捗ファイルに埋め込む署名

成果物ファイルなしの場合:
compliance-sig.bat sign-phase <progress_file_path> <phase_number>
→ 自動的に固定値が使用される

### 署名検証（次フェーズ開始時）
compliance-sig.bat verify-phase <progress_file_path> <phase_number>

出力: PASS または FAIL（+ 理由）

⚠️ 手動で署名対象文字列を構築してはならない。
⚠️ 旧コマンド（sign / verify / artifact-hash）は後方互換のため残すが、新規使用は非推奨。
```

#### 追加書き換え箇所1: 「verify モード（前処理）」セクション Step 3

**Before:**
```
3. 署名対象文字列を再構築し、HMAC-SHA256 で計算。抽出した署名と比較する
   - 署名が存在しない or 不一致 → FAIL
```

**After:**
```
3. `verify-phase` サブコマンドを実行し、署名を検証する:
   compliance-sig.bat verify-phase <progress_file_path> <phase_number - 1>
   - 出力が PASS → 署名一致
   - 出力が FAIL → 署名不一致（理由を報告）
   ⚠️ 手動で署名対象文字列を構築してはならない。
```

#### 追加書き換え箇所2: 「A. 前フェーズ署名検証」セクション

**Before:**
```
### A. 前フェーズ署名検証
- 署名対象文字列を再構築し、HMAC-SHA256 で計算して前フェーズの署名と比較する
- 署名が存在しない or 不一致 → FAIL（改ざんの疑い）
- 初回フェーズ（フェーズ0）の場合は署名検証をスキップ
```

**After:**
```
### A. 前フェーズ署名検証
- `verify-phase` サブコマンドで前フェーズの署名を検証する:
  compliance-sig.bat verify-phase <progress_file_path> <phase_number - 1>
- 出力が FAIL → FAIL（改ざんの疑い）
- 初回フェーズ（フェーズ0）の場合は署名検証をスキップ
⚠️ 手動で署名対象文字列を構築してはならない。verify-phase が内部で全て処理する。
```

## リグレッションテスト設計

### テスト1: 往復テスト（成果物あり）
1. テスト用進捗ファイルを作成（フェーズ1完了状態、成果物SHA256記載済み）
2. テスト用成果物ファイルを作成
3. `sign-phase` で署名生成
4. 生成された署名を進捗ファイルに埋め込む
5. `verify-phase` で検証 → PASS を期待

### テスト2: 往復テスト（成果物なし）
1. テスト用進捗ファイルを作成（成果物テーブルなし）
2. `sign-phase` を成果物ファイル引数なしで実行
3. 生成された署名を進捗ファイルに埋め込む
4. `verify-phase` で検証 → PASS を期待

### テスト3: 改ざん検出
1. テスト1の状態から進捗ファイルの完了日時を変更
2. `verify-phase` で検証 → FAIL を期待

### テスト4: 既存コマンド互換
1. 既存の `sign` / `verify` / `artifact-hash` が引き続き動作することを確認

### テスト5: 大きいファイル
1. 1MB以上のテスト用成果物ファイルを作成
2. `sign-phase` で署名生成 → エラーなく完了
3. `verify-phase` で検証 → PASS を期待

## 更新が必要な設計資料

実装後に以下を更新する:
- なし（本件はスキルファイル・エージェント定義・スクリプト自体が修正対象であり、別途設計書の更新は不要）

## タスク分解

### タスク1: compliance-sig.ps1 に verify-phase / sign-phase サブコマンドを追加
- 対象ファイル: `skills/phase-compliance-check/scripts/compliance-sig.ps1`
- 依存: なし
- テスト: テスト1〜5 を実行

### タスク2: compliance-sig.bat に verify-phase / sign-phase サブコマンドを追加
- 対象ファイル: `skills/phase-compliance-check/scripts/compliance-sig.bat`
- 依存: タスク1（ps1 の実装を参照）

### タスク3: compliance-sig.sh に verify-phase / sign-phase サブコマンドを追加
- 対象ファイル: `skills/phase-compliance-check/scripts/compliance-sig.sh`
- 依存: タスク1（ps1 の実装を参照）

### タスク4: SKILL.md の verify/write モード説明を書き換え
- 対象ファイル: `skills/phase-compliance-check/SKILL.md`
- 依存: タスク1（新サブコマンドの仕様確定後）

### タスク5: compliance-checker.md の署名関連セクションを書き換え
- 対象ファイル: `agents/compliance-checker.md`
- 依存: タスク1（新サブコマンドの仕様確定後）

### 依存関係グラフ
```
タスク1 → タスク2 [並列可]
タスク1 → タスク3 [並列可]
タスク1 → タスク4 [並列可]
タスク1 → タスク5 [並列可]
```

タスク1完了後、タスク2〜5は並列実行可能。
