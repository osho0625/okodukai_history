---
name: fs-bugfix-phase3-final-check
description: "Use when bugfix workflow's phase 2 (implementation) is complete. Final integrity check of the entire workflow execution."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。

# 最終整合性チェック（fs-bugfix-phase3-final-check）

ワークフロー完了前の最終チェック。全前フェーズの署名(PHASE-SIG)を独立した検証用 agent で検証し、進捗ファイルの最終フェーズを完了に更新する。

## The Iron Laws

- **検証は委譲**: 本フェーズスキル自体は署名検証の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は検証用 agent が行う。本スキルから phase-compliance-check (write) を呼び出してはならない。自フェーズの署名も付与しない
- **session-history（.txt）の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-*.txt` の全ファイルを必ず削除する。加えて session-history 以外の想定外残ファイルはユーザー確認の上で削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
- **FAIL 時のリセット範囲**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase 以降の進捗テーブル行のみを ⬜ 未着手 にリセットする。完了済みフェーズを巻き戻してはならない

## 成果物

なし（検証のみ）

## Process

### 前処理
1. **progress-resume-check (aide-powers skill)** を activate して実行する
   - 入力: progress_file_path: `{bugfix_dir}/bugfix-progress.md`, workflow_name: `bugfix`
   - 戻り値による分岐:
     - `RESUME_FROM N` → N が本フェーズ（3）なら Step 1 から再開
     - `START_FRESH` → 本フェーズで START_FRESH は異常。前フェーズに差し戻す
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了
2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する — 直前フェーズ（Phase 2）の署名を検証。FAIL の場合は Phase 2 に戻って後処理を再実行
3. **user-profile-management (aide-powers skill: apply)** を activate して実行する
4. `.aide/references/global-rules.md` を読み込み、内容に従う

### Step 1: 全前フェーズの署名検証と進捗ファイル更新（progress-final-checker 委譲）

**処理:**

1. `progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動する
2. 渡す情報:
   - workflow_name: `bugfix`
   - total_phases: 2（自フェーズを除く前フェーズ数）
   - progress_file_path: `{bugfix_dir}/bugfix-progress.md`
3. progress-final-checker は最終フェーズを除く全前フェーズの署名(PHASE-SIG)を検証する。署名が存在しない／再計算値と一致しない／前フェーズが未完了のフェーズが1つでもあれば FAIL を返す。全て正当なら自フェーズを ✅ 完了 に更新する
4. 戻り値による分岐:
   - **PASS** → progress-final-checker が自フェーズのステータスを ✅ 完了 に更新済み → Step 2 へ
   - **FAIL** → ユーザーに問題内容（problem_phase / reason）を通知 → ユーザーの承認を得て、problem_phase 以降の進捗テーブル行を ⬜ 未着手 にリセット → 該当フェーズスキルに制御を戻す

### Step 2: 一時ファイルの削除

**処理:**

1. `.aide/tmp/session-history-*.txt` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）
2. 削除完了を確認する

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
1. **doc-index-maintenance (aide-powers skill)** — ドキュメントインデックス更新
2. **user-profile-management (aide-powers skill: update)** — ユーザープロファイル更新
3. **git-commit-workflow (aide-powers skill)** — バグ修正ワークフロー全体の成果物をまとめてコミット（Docs: フッター付き）

注: phase-compliance-check (write) は実行しない。自フェーズの署名は付与しない（progress-final-checker が署名なしでステータス更新を行う）。

## 完了条件（Phase 3 全体）

1. progress-final-checker が全前フェーズの署名 verify を実施し PASS（または FAIL 時の差し戻し処理が完了）
2. 自フェーズのステータスが ✅ 完了 に更新されている（progress-final-checker が更新）
3. 一時ファイル（session-history-*.txt）が削除され、想定外残ファイルはユーザー確認の上で処理されている
4. git-commit-workflow によりコミットが完了している

## Integration

**Called by:**
- `fs-bugfix-phase2-impl (aide-powers skill)` → REQUIRED SUB-SKILL → `fs-bugfix-phase3-final-check`

**次フェーズ:** なし（バグ修正ワークフロー最終フェーズ）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理1
- `phase-compliance-check (aide-powers skill: verify)` — 前処理2
- `user-profile-management (aide-powers skill)` — 前処理3 (apply) / 後処理2 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理1
- `git-commit-workflow (aide-powers skill)` — 後処理3（バグ修正WF全体のコミット）

**呼び出す名前付きエージェント:**
- `progress-final-checker (aide-powers agent)` — Step 1（全前フェーズの署名検証と進捗ファイル更新）

**Input from caller:**
- `bugfix_dir`: 確定済みの bugfix_dir
- `doc_index_path`: doc-index.md のパス

**Global rules:** `.aide/references/global-rules.md` を厳守
