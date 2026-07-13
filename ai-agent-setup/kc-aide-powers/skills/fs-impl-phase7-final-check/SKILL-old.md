---
name: fs-impl-phase7-final-check
description: "Use when implementation workflow's phase 6 (doc generation) is complete. Final integrity check of the entire workflow execution."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# フェーズ7: 進捗ファイル完全性チェック

## Overview

ワークフロー完了前の最終防衛ライン。全前フェーズの署名(PHASE-SIG)を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。

**Core principle:** 嘘をつくくらいなら、ユーザーに正直に報告せよ。

## 成果物

なし（検証のみ）

## Process

### 前処理
1. **progress-resume-check (aide-powers skill)** を activate して実行する
2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する（直前フェーズ署名検証）
3. **user-profile-management (aide-powers skill: apply)** を activate して実行する
4. `.aide/references/global-rules.md` を読み込み、内容に従う

### Step 1: 全前フェーズの署名検証と進捗ファイル更新（progress-final-checker 委譲）

`progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動する。

渡す情報:
- workflow_name: impl
- total_phases: 6（自フェーズを除く）
- progress_file_path: 前フェーズから引き継いだパス

progress-final-checker は最終フェーズを除く全前フェーズの署名(PHASE-SIG)を検証する。署名が存在しない／再計算値と一致しない／前フェーズ未完了のフェーズが1つでもあれば FAIL を返す。全て正当なら自フェーズを ✅ 完了 に更新する。

戻り値による分岐:
- **PASS** → progress-final-checker が自フェーズを ✅ 完了 に更新済み → Step 2 へ
- **FAIL** → ユーザーに問題内容（problem_phase / reason）を通知 → ユーザー承認を得て problem_phase 以降の進捗テーブル行を ⬜ 未着手 にリセット → 該当フェーズスキルに制御を戻す

### Step 2: 一時ファイルの削除

`.aide/tmp/session-history-*.txt` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。

**想定外残ファイルの確認削除:**

1. session-history（`.txt`）の削除後、`.aide/tmp/` 配下に残っているファイルを一覧取得する
2. 残ファイルから session-history（`session-history-*.txt`）を除いた「想定外ファイル」を抽出する
3. 想定外ファイルが 0 件なら本手順は完了（ユーザー確認は行わない）
4. 想定外ファイルが 1 件以上ある場合、ユーザーへ当該ファイル一覧（ファイル名・サイズ等）を提示し、番号付き選択肢で削除可否を確認する:
   - 1. すべて削除する
   - 2. 残置する（削除しない）
   - 3. その他（自由記述。一部のみ削除する等、ユーザーの指示に従う）
5. ユーザーの選択に従って処理する:
   - 「1. すべて削除する」→ 一覧の想定外ファイルを全て削除する
   - 「2. 残置する」→ 削除しない（次回ワークフローへ持ち越される旨を認識した上での残置）
   - 「3. その他」→ ユーザーの自由記述の指示に従って一部削除等を行う
6. 本確認削除は検証フロー（Step 1 の progress-final-checker による署名検証・進捗更新）の判定結果に一切影響しない（後段の整理処理であり、PASS/FAIL を変えない）

### 後処理
なし（署名なし。progress-final-checker が自フェーズのステータス更新を実施）

## Integration

**前フェーズ:** fs-impl-phase6-doc-generation (aide-powers skill)
**次フェーズ:** なし（実装ワークフロー最終フェーズ）
