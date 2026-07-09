# 修正計画（PI-008）

## 原因-修正-種別 トリプル

| 項目 | 内容 |
|---|---|
| 原因 | verify-phase の正規表現が2列テーブル前提で、3列テーブルのハッシュを抽出できない |
| 修正 | 正規表現を列数に依存しない汎用パターンに変更（PowerShell版 + bash版） |
| 種別 | スクリプト修正 |

## 修正対象ファイル

| ファイル | 修正内容 |
|---|---|
| `skills/phase-compliance-check/scripts/compliance-sig.ps1` | verify-phase 内のセクション抽出 + ハッシュ抽出正規表現を修正 |
| `skills/phase-compliance-check/scripts/compliance-sig.sh` | verify-phase 内のセクション抽出 + ハッシュ抽出正規表現を修正 |

## 修正内容

### PowerShell版（compliance-sig.ps1）

**Before:**
```powershell
$phaseSection = [regex]::Match($content, "### フェーズ${PhaseNum}:[\s\S]*?(?=### フェーズ|### COMPLIANCE|$)").Value
$hashMatches = [regex]::Matches($phaseSection, '\|\s*\S+\s*\|\s*([0-9a-fA-F]{64})\s*\|')
```

**After:**
```powershell
$phaseSection = [regex]::Match($content, "## フェーズ${PhaseNum}:[\s\S]*?(?=\n## フェーズ\d|<!-- PHASE-SIG:${PhaseNum}:)").Value
$hashMatches = [regex]::Matches($phaseSection, '([0-9a-fA-F]{64})\s*\|?\s*$', [System.Text.RegularExpressions.RegexOptions]::Multiline)
```

### bash版（compliance-sig.sh）

**Before:**
```bash
PHASE_SECTION=$(echo "$CONTENT" | sed -n "/### フェーズ${PHASE_NUM}:/,/### フェーズ\|### COMPLIANCE/p")
HASH_VALUES=$(echo "$PHASE_SECTION" | grep -oP '\|\s*\S+\s*\|\s*\K[0-9a-fA-F]{64}(?=\s*\|)')
```

**After:**
```bash
PHASE_SECTION=$(echo "$CONTENT" | sed -n "/## フェーズ${PHASE_NUM}:/,/<!-- PHASE-SIG:${PHASE_NUM}:/p")
HASH_VALUES=$(echo "$PHASE_SECTION" | grep -oP '[0-9a-fA-F]{64}(?=\s*\|?\s*$)')
```

**完了日時抽出（verify-phase, sign-phase 両方）:**

**Before:**
```bash
COMPLETED_AT=$(echo "$CONTENT" | sed -n "/### フェーズ${PHASE_NUM}:/,/### フェーズ\|### COMPLIANCE/p" | grep -oP '\|\s*完了日時\s*\|\s*\K[^\s|]+')
```

**After:**
```bash
COMPLETED_AT=$(echo "$CONTENT" | sed -n "/## フェーズ${PHASE_NUM}:/,/<!-- PHASE-SIG:${PHASE_NUM}:/p" | grep -oP '\|\s*完了日時\s*\|\s*\K[^\s|]+')
```

## テスト方針

PowerShell版: 既にテスト済み（全ユースケース PASS）
bash版: Windows 環境のため Git Bash で実行確認

## リスク評価

- PowerShell版: 修正済み・テスト済み
- bash版: 同じロジックの修正。PowerShell版と同じパターンに揃える
