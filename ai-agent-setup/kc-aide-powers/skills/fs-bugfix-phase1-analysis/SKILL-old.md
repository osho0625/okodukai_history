---
name: fs-bugfix-phase1-analysis
description: "Use when starting the bugfix workflow. Performs bug report hearing, design gate, root cause analysis, folder merge check, and fix plan establishment."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。

# 分析・計画フェーズ（fs-bugfix-phase1-analysis）

バグ修正ワークフローの Phase 1。バグ報告ヒアリング、設計書ゲート、原因分析、フォルダ統合判定、修正方針確定を実行する。

## The Iron Laws

- **担当外に踏み込まない**: before→after 形式の具体的なコード変更設計をしてはならない。実装コードを書いてはならない
- **ヒアリング最優先**: 設計書チェック・テスト実行・コード調査より先に、まずユーザーの話を聞く

## step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。前処理完了時も同様。

呼び出しパラメータ:
- skill_name: `fs-bugfix-phase1-analysis`
- step_id: `前処理` / `step1` / `step2` ...
- step_title: Step のタイトル文字列
- artifact_dir: `{bugfix_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| bug-report.md | {bugfix_dir}/bug-report.md | バグの症状・再現手順・期待動作 |
| bug-analysis.md | {bugfix_dir}/bug-analysis.md | 原因分析結果（原因箇所・影響範囲・起因元フォルダ） |
| fix-plan.md | {bugfix_dir}/fix-plan.md | 修正方針書（原因・対策・対策種別・副作用リスク・テスト方針） |

## Process

### 前処理（フェーズ全体で1回のみ）

1. **progress-resume-check (aide-powers skill)** を activate して実行する
   - 入力: progress_file_path: `{bugfix_dir}/bugfix-progress.md`, workflow_name: `bugfix`
   - 戻り値による分岐:
     - `RESUME_FROM N` → N が本フェーズ（1）なら Step 1 から再開
     - `START_FRESH` → 進捗ファイルを新規作成し Step 1 へ進む
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了
2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する — フェーズ1のため自動 PASS
3. **user-profile-management (aide-powers skill: apply)** を activate して実行する
4. `.aide/references/global-rules.md` を読み込み、内容に従う
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{bugfix_dir}`）

### バグ報告ヒアリング区画

#### Step 1: 作業ディレクトリの準備

**処理:**

1. bugfix_dir のパスを決定する: `.aide/specs/{feature_name}/bugfix/{YYYYMMDDHHmm}-{対処概略}(-{番号})/`
2. ディレクトリ自体はサブエージェントが bug-report.md を書き込む際に自動作成される
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step1`, step_title: `作業ディレクトリの準備`, artifact_dir: `{bugfix_dir}`）

#### Step 2: バグ報告ヒアリング（サブエージェント委譲）

本スキルディレクトリの `bugfix-reporter-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** ユーザーからバグの症状・再現手順・期待動作をヒアリングし、bug-report.md を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| bugfix_dir | Step 1 で確定 |
| ユーザーの最初の発言 | ユーザーの発言（そのまま転記） |

**Output:** `{bugfix_dir}/bug-report.md`

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 3 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 3 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step2`, step_title: `バグ報告ヒアリング`, artifact_dir: `{bugfix_dir}`）

#### Step 3: バグ報告のユーザー承認

**処理:**

1. `{bugfix_dir}/bug-report.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認** → Step 4 へ進む
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 3 を再実行する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step3`, step_title: `バグ報告のユーザー承認`, artifact_dir: `{bugfix_dir}`）

### 設計書ゲート + 原因分析区画

#### Step 4: HARD-GATE: 設計書ゲート

**処理:**

1. `design-gate (aide-powers skill)` を activate して実行する
2. 戻り値による分岐:
   - **PASS** → ユーザーに PASS の事実を報告し、Step 5 へ進む
   - **FAIL** → ユーザーに設計書が不足している旨を報告し、設計逆引きワークフロー（`fs-reverse-phase1-program (aide-powers skill)`）の実行を提案する。pending-issues.md に未解決問題として登録し、ワークフロー終了
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step4`, step_title: `設計書ゲート`, artifact_dir: `{bugfix_dir}`）

#### Step 5: 原因分析（サブエージェント委譲）

本スキルディレクトリの `bugfix-analyzer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 設計ドキュメントとコードを調査し、バグの原因箇所・影響範囲・起因元ドキュメントフォルダを特定して bug-analysis.md を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| bugfix_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| bug_report_path | bugfix_dir から構築 |

**Output:** `{bugfix_dir}/bug-analysis.md`

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 6 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 6 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step5`, step_title: `原因分析`, artifact_dir: `{bugfix_dir}`）

#### Step 6: 原因分析のユーザー承認

**処理:**

1. `{bugfix_dir}/bug-analysis.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認** → Step 7 へ進む
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 6 を再実行する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step6`, step_title: `原因分析のユーザー承認`, artifact_dir: `{bugfix_dir}`）

#### Step 7: フォルダ統合判定

**処理:**

1. bug-analysis.md の「起因元ドキュメントフォルダ」セクションを読み取る
2. 起因元フォルダの状態による分岐:
   - **なし** → bugfix_dir はそのまま → Step 8 へ進む
   - **あり** → `folder-merge-check (aide-powers skill)` を activate して実行する
     - 入力: origin_folder_path, current_dir(=bugfix_dir), workflow_type: バグ修正, commit_hash, commit_summary
     - 戻り値の result_dir を以降の `{bugfix_dir}` として確定する → Step 8 へ進む
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step7`, step_title: `フォルダ統合判定`, artifact_dir: `{bugfix_dir}`）

### 修正方針確定区画

#### Step 8: 修正方針の作成（サブエージェント委譲）

本スキルディレクトリの `bugfix-planner-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 原因に基づく修正方法を検討し、根本対策/暫定対策の判定・副作用リスク分析・リグレッションテスト方針を含む fix-plan.md を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| bugfix_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| bug_report_path | bugfix_dir から構築 |
| bug_analysis_path | bugfix_dir から構築 |

**Output:** `{bugfix_dir}/fix-plan.md`

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 9 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 9 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step8`, step_title: `修正方針の作成`, artifact_dir: `{bugfix_dir}`）

#### Step 9: 修正方針のレビュー（サブエージェント委譲）

本スキルディレクトリの `bugfix-plan-reviewer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** fix-plan.md の品質をレビューし、対策種別・副作用リスク・リグレッションテスト方針の記載漏れがないか検証する

**Input:**
| 情報 | 取得元 |
|---|---|
| bugfix_dir | ワークフローコンテキスト |
| fix_plan_path | bugfix_dir から構築 |
| bug_analysis_path | bugfix_dir から構築（整合性確認用） |

**ステータス分岐:**
- `PASS` → Step後処理を実行し、Step 10 へ
- `FAIL` → 指摘内容を bugfix-planner に渡して fix-plan.md を修正し、再度 Step 9 へ

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step9`, step_title: `修正方針のレビュー`, artifact_dir: `{bugfix_dir}`）

#### Step 10: 修正方針のユーザー承認

**処理:**

1. `{bugfix_dir}/fix-plan.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認** → 後処理へ進む
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 9 へ戻る
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `step10`, step_title: `修正方針のユーザー承認`, artifact_dir: `{bugfix_dir}`）

### 後処理（フェーズ全体で1回のみ）

1. **doc-index-maintenance (aide-powers skill)** を activate して実行する
2. **phase-compliance-check (aide-powers skill: write)** を activate して実行する — フェーズ完了検証と進捗ファイル更新
3. **user-profile-management (aide-powers skill: update)** を activate して実行する
4. **次フェーズ遷移:** `fs-bugfix-phase2-impl (aide-powers skill)` を activate して実行する

注: バグ修正ワークフローでは最終フェーズの進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-bugfix-phase1-analysis`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{bugfix_dir}`）

## 完了条件

**パターンA: 通常完了**
1. bug-report.md が作成され、ユーザー承認済み
2. design-gate が PASS
3. bug-analysis.md が作成され、ユーザー承認済み
4. bugfix_dir が確定（フォルダ統合判定完了）
5. fix-plan.md が作成され、レビュー PASS、ユーザー承認済み
6. 進捗ファイルが ✅ 完了 に更新されている

**パターンB: 設計書ゲート FAIL（ワークフロー終了）**
1. design-gate が FAIL を返している
2. ユーザーに設計逆引きワークフローの実行を提案済み
3. pending-issues.md に未解決問題として登録済み

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `step-history-writer (aide-powers skill)` — 各 Step 末尾で実行

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-bugfix-phase2-impl (aide-powers skill)`

**Called by:** バグ修正ワークフロー（最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理1
- `phase-compliance-check (aide-powers skill: verify)` — 前処理2
- `user-profile-management (aide-powers skill)` — 前処理3 (apply) / 後処理3 (update)
- `design-gate (aide-powers skill)` — Step 4
- `folder-merge-check (aide-powers skill)` — Step 7（起因元フォルダがある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — 後処理1

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `bugfix-reporter-prompt.md` — Step 2（mode: create / fix）
- `bugfix-analyzer-prompt.md` — Step 5（mode: create / fix）
- `bugfix-planner-prompt.md` — Step 8（mode: create / fix）
- `bugfix-plan-reviewer-prompt.md` — Step 9

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーの最初の発言（バグ報告の内容）

**Output to next phase:**
- `bugfix_dir`: 確定した bugfix_dir

**Global rules:** `.aide/references/global-rules.md` を厳守
