# 新スキル詳細設計: fs-bugfix-phase3-final-check

> このファイルは delta-design.md の付属設計書。新スキル `fs-bugfix-phase3-final-check` の SKILL.md を実装するための完全仕様。

## スキルファイル配置

- パス: `skills/fs-bugfix-phase3-final-check/SKILL.md`
- frontmatter:
  - name: `fs-bugfix-phase3-final-check`
  - description: `Use when bugfix workflow's phase 2 (implementation) is complete. Final integrity check of the entire workflow execution.`

## SKILL.md 全文

````markdown
---
name: fs-bugfix-phase3-final-check
description: "Use when bugfix workflow's phase 2 (implementation) is complete. Final integrity check of the entire workflow execution."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。

# 最終整合性チェック（fs-bugfix-phase3-final-check）

ワークフロー完了前の最終整合性チェック。全フェーズの実行整合性を独立した検証用 agent で検査する。

## The Iron Laws

- **検証は委譲**: 本フェーズスキル自体は実行整合性の判定を行わない。判定は `progress-final-checker (aide-powers agent)` に委譲する
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は検証用 agent が行う。本スキルから phase-compliance-check (write) を呼び出してはならない
- **session-history-*.txt の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-fs-bugfix-phase*.txt` の全ファイルを必ず削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
- **FAIL 時のリセット範囲**: progress-final-checker が FAIL を返した場合、ユーザー承認の上で problem_phase 以降の進捗テーブル行のみを ⬜ 未着手 にリセットする。完了済みフェーズを巻き戻してはならない

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出し、
Phase 3（final-check）で progress-final-checker が実行整合性の検証に使用する。

呼び出しパラメータ:
- skill_name: `fs-bugfix-phase3-final-check`
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列

## 成果物

なし（検証のみ）

## Process

### 前処理（フェーズ全体で1回のみ）

1. **progress-resume-check (aide-powers skill)** を activate して実行する
   - 入力:
     - progress_file_path: `{bugfix_dir}/bugfix-progress.md`
     - workflow_name: `bugfix`
   - 戻り値による分岐:
     - `RESUME_FROM N` → N が本フェーズ（3）なら Step 1 から再開
     - `START_FRESH` → 本フェーズで START_FRESH は異常。前フェーズに差し戻す
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了

2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する
   - Phase 2 の署名を検証。FAIL の場合は Phase 2 に戻って後処理を再実行

3. **user-profile-management (aide-powers skill: apply)** を activate して実行する

4. `.aide/references/global-rules.md` を読み込み、内容に従う
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `前処理`, step_title: `前処理`）

### Step 1: セッションヒストリーの収集

**処理:**

1. `.aide/tmp/session-history-fs-bugfix-phase1-analysis-*.txt` および `.aide/tmp/session-history-fs-bugfix-phase2-impl-*.txt` の全ファイルパスを収集する
2. 全ファイルが存在することを確認する
3. 存在しないファイルがある場合 → ユーザーに報告し、該当フェーズの再実行を提案する
4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `step1`, step_title: `セッションヒストリーの収集`）

### Step 2: 検証用 agent の呼び出し

**処理:**

1. `progress-final-checker (aide-powers agent)` を invoke_sub_agent で起動する
2. 渡す情報:
   - session_history_files: Step 1 で収集した全ファイルパスの配列
   - workflow_name: `bugfix`
   - total_phases: 2（自フェーズを除く前フェーズ数）
   - progress_file_path: `{bugfix_dir}/bugfix-progress.md`
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `step2`, step_title: `検証用 agent の呼び出し`）

### Step 3: 検証結果の処理

**処理:**

1. 検証用 agent の戻り値による分岐:
   - **PASS** → 検証用 agent が自フェーズのステータスを ✅ 完了 に更新済み → Step 4 へ
   - **FAIL** → ユーザーに問題内容を通知 → ユーザーの承認を得る（リセットしてやり直すか確認）→ 承認後、problem_phase 以降の進捗テーブル行を ⬜ 未着手 にリセット → 該当フェーズスキルに制御を戻す
   - **UNCERTAIN** → ユーザーに検証結果を提示し判断を委ねる → 「問題なし」なら PASS 扱い / 「やり直し」なら FAIL 扱い
2. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `step3`, step_title: `検証結果の処理`）

### Step 4: 一時ファイルの削除

**処理:**

1. `.aide/tmp/session-history-fs-bugfix-phase*.txt` の全ファイルを削除する
2. 削除完了を確認する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `step4`, step_title: `一時ファイルの削除`）

### 後処理（フェーズ全体で1回のみ）

1. **doc-index-maintenance (aide-powers skill)** — ドキュメントインデックス更新
2. **user-profile-management (aide-powers skill: update)** — ユーザープロファイル更新
3. **git-commit-workflow (aide-powers skill)** — バグ修正ワークフロー全体の成果物をまとめてコミット（Docs: フッター付き）

注: phase-compliance-check (write) は実行しない。検証用 agent が自フェーズのステータス更新を実施するため。

4. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase3-final-check`, step_id: `後処理`, step_title: `後処理`）

## 完了条件（Phase 3 全体）

以下のいずれかを満たした状態:

**PASS:**
1. progress-final-checker が PASS を返している
2. 自フェーズのステータスが ✅ 完了 に更新されている（検証用 agent が更新）
3. 一時ファイル（session-history-*.txt）が削除されている
4. git-commit-workflow によりコミットが完了している

**FAIL:**
1. progress-final-checker が FAIL を返している
2. ユーザーに問題内容が通知されている
3. 該当フェーズへのリセット・差し戻しが実行されている

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `step-history-writer (aide-powers skill)` — 各 Step 完了時の履歴書き出し

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
- `progress-final-checker (aide-powers agent)` — Step 2（ワークフロー実行整合性の独立検証）

**Input from caller:**
- `bugfix_dir`: 確定済みの bugfix_dir
- `doc_index_path`: doc-index.md のパス

**Global rules:** `.aide/references/global-rules.md` を厳守

````
