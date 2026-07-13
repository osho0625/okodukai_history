# バグ報告

## 基本情報

| 項目 | 値 |
|---|---|
| 報告日 | 2026-05-28 |
| 報告者 | ユーザー |
| 発見元 | 変更WF (202605261649-fix-pi002-pi003-pi004) フェーズ8後処理、変更WF (202605262130-add-progress-final-check) |
| 対応PI | PI-001, PI-010 |

## 症状

### 症状1（PI-001）: phase-compliance-check verify モードの署名対象文字列記述が曖昧

- phase-compliance-check スキルの verify モードで、署名対象文字列の第4引数に何を渡すかが曖昧
- スキルには「成果物一覧のSHA256」と書いてあるが、実際のスクリプト (compliance-sig.bat) は artifact-hash サブコマンドで二重ハッシュ（成果物SHA256値をさらにSHA256）した値を使用する
- AIエージェントが手動で署名対象文字列を構築して検証しようとすると「署名不一致」になる

### 症状2（PI-010）: compliance-checker が E-2 ❌ 申告時に PASS を返す

- compliance-check write モードで rule_violations: none と申告しつつ、COMPLIANCE-DECLARATION テーブルの E-2 が ❌ になっている場合、矛盾として FAIL すべきだが PASS を返した
- E-2 が ❌（プロセス省略あり）の場合は省略なし宣言と矛盾するため、いかなる場合も FAIL すべき

## 再現手順

### 症状1の再現
1. フェーズ完了後に phase-compliance-check (verify) を実行する
2. AIエージェントがスキルの記述に従い、手動で署名対象文字列を構築する
3. `{workflow_name}|{phase_number}|{完了日時}|{成果物SHA256}` の第4引数に Get-FileHash の出力値を直接使用する
4. verify-phase サブコマンドの結果と不一致になる（二重ハッシュとの差異）

### 症状2の再現
1. フェーズ8完了後に phase-compliance-check (write) を実行する
2. COMPLIANCE-DECLARATION テーブルの E-2 を ❌ で申告する（Iron Law #2 違反を正直に記録）
3. compliance-checker が PASS を返す（本来 FAIL すべき）

## 期待動作

### 症状1の期待動作
- スキルに「verify時は verify-phase サブコマンドに全て任せよ。手動で署名対象文字列を構築して比較するな」と明記されている
- 署名対象文字列の第4引数は artifact-hash サブコマンドの出力値であることが明記されている

### 症状2の期待動作
- E-1〜E-4 のいずれかが ❌ の場合、compliance-checker は無条件 FAIL を返す
- rule_violations: none と E-2 ❌ の矛盾を検出して FAIL する

## 対象ファイル

| # | ファイル | 修正内容 |
|---|---|---|
| 1 | skills/phase-compliance-check/SKILL.md | verify モードの記述明確化 |
| 2 | agents/compliance-checker.md | E-1〜E-4 ❌ 時の無条件 FAIL ルール追加 |
