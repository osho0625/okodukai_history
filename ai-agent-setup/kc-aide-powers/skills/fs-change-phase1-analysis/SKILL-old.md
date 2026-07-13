---
name: fs-change-phase1-analysis
description: "Use when starting the change workflow. Performs design gate, requirements definition, impact analysis, and approach planning."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。

# 分析・計画フェーズ（fs-change-phase1-analysis）

変更ワークフローの Phase 1。設計書ゲート確認、変更要件定義、影響範囲分析、対応方針策定を実行する。

## The Iron Laws

- **担当外に踏み込まない**: before→after 形式の具体的なコード変更設計をしてはならない。実装コードを書いてはならない

## step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。前処理完了時も同様。

呼び出しパラメータ:
- skill_name: `fs-change-phase1-analysis`
- step_id: `前処理` / `step1` / `step2` ...
- step_title: Step のタイトル文字列
- artifact_dir: `{changes_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| change-requirements.md | {changes_dir}/change-requirements.md | 構造化された変更要求定義ドキュメント |
| impact-analysis.md | {changes_dir}/impact-analysis.md | アクター視点・プログラム構成視点の影響範囲分析結果 |
| approach.md | {changes_dir}/approach.md | 対応方針書（OCP検討結果、変更方針の詳細） |
| refactoring-request.md | {changes_dir}/refactoring-request.md | リファクタリング依頼書（リファクタリング委譲時のみ） |

## Process

### 前処理（フェーズ全体で1回のみ）

1. **progress-resume-check (aide-powers skill)** を activate して実行する
   - 入力: progress_file_path: `{changes_dir}/change-progress.md`, workflow_name: `change`
   - 戻り値による分岐:
     - `RESUME_FROM N` → N が本フェーズ（1）なら Step 1 から再開、N が後続フェーズなら該当フェーズスキルへ遷移
     - `START_FRESH` → 進捗ファイルを新規作成し Step 1 へ進む
     - `ALL_COMPLETED` → 全フェーズ完了済み。ユーザーに案内し終了
2. **phase-compliance-check (aide-powers skill: verify)** を activate して実行する — フェーズ1のため自動 PASS
3. **user-profile-management (aide-powers skill: apply)** を activate して実行する
4. `.aide/references/global-rules.md` を読み込み、内容に従う
5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{changes_dir}`）

### 設計書ゲート区画

#### Step 1: HARD-GATE: 設計書ゲート

**処理:**

1. `design-gate (aide-powers skill)` を activate して実行する
2. 戻り値による分岐:
   - **PASS** → ユーザーに PASS の事実を報告し、Step 2 へ進む
   - **FAIL** → ユーザーに設計書が不足している旨を報告し、設計逆引きワークフロー（`fs-reverse-phase1-program (aide-powers skill)`）の実行を提案する。pending-issues.md に未解決問題として登録し、ワークフロー終了
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step1`, step_title: `設計書ゲート`, artifact_dir: `{changes_dir}`）

### 変更要件定義区画

#### Step 2: 変更要件の作成（サブエージェント委譲）

本スキルディレクトリの `change-requirements-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** ユーザーの変更要求をヒアリングし、構造化された変更要求定義ドキュメント change-requirements.md を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| user_requirements_path | doc-index.md から取得 |
| program_structure_path | doc-index.md から取得 |
| ユーザーの要望・回答 | ユーザーの発言（そのまま転記） |

**Output:** `{changes_dir}/change-requirements.md`

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 3 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 3 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step2`, step_title: `変更要件の作成`, artifact_dir: `{changes_dir}`）

#### changes_dir の命名規則

```
.aide/specs/{feature_name}/changes/{YYYYMMDDHHmm}-{対処概略}(-{番号})
```

#### Step 3: 変更要件のユーザー承認

**処理:**

1. `{changes_dir}/change-requirements.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認** → Step 4 へ進む
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 3 を再実行する
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step3`, step_title: `変更要件のユーザー承認`, artifact_dir: `{changes_dir}`）

### 影響範囲分析 + フォルダ統合判定区画

#### Step 4: 影響範囲分析（サブエージェント委譲）

本スキルディレクトリの `change-impact-analyzer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 変更要求定義をもとに、アクター視点・プログラム構成視点の影響範囲を分析し、git blame で起因元ドキュメントフォルダを特定して impact-analysis.md を作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| change_requirements_path | changes_dir から構築 |

**Output:** `{changes_dir}/impact-analysis.md`

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 5 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 5 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step4`, step_title: `影響範囲分析`, artifact_dir: `{changes_dir}`）

#### Step 5: 影響分析結果の確認

**処理:**

1. サブエージェントの報告ステータスによる機械的分岐:
   - 報告に `completeness_check: PASS` が含まれている → Step 6 へ進む
   - 報告に `completeness_check: FAIL` が含まれている → 不足セクションを指定して Step 4 のサブエージェントを再ディスパッチ
   - 報告に completeness_check が含まれていない → Step 4 のサブエージェントを再ディスパッチ（完了条件チェックの実行を明示的に指示）
2. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step5`, step_title: `影響分析結果の確認`, artifact_dir: `{changes_dir}`）

#### Step 6: フォルダ統合判定

**処理:**

1. impact-analysis.md の「起因元ドキュメントフォルダ」セクションを読み取る
2. 起因元フォルダの状態による分岐:
   - **なし** → changes_dir はそのまま → Step 7 へ進む
   - **あり** → `folder-merge-check (aide-powers skill)` を activate して実行する
     - 入力: origin_folder_path, current_changes_dir, workflow_type: 変更, commit_hash, commit_summary
     - 戻り値の changes_dir を以降の `{changes_dir}` として確定する → Step 7 へ進む
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step6`, step_title: `フォルダ統合判定`, artifact_dir: `{changes_dir}`）

### 対応方針策定区画

#### Step 7: 対応方針の作成（サブエージェント委譲）

本スキルディレクトリの `change-approach-planner-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** 変更要求と影響範囲分析をもとに、OCP原則に基づく最適な対応方針を策定し、approach.md を作成する。リファクタリング推奨時はユーザーに提案し、許可された場合は refactoring-request.md も作成する

**Input:**
| 情報 | 取得元 |
|---|---|
| feature_name | ワークフローコンテキスト |
| changes_dir | ワークフローコンテキスト |
| doc_index_path | ワークフローコンテキスト |
| program_structure_path | doc-index.md から取得 |
| object_design_paths | doc-index.md から取得 |
| dev_environment_path | doc-index.md から取得 |
| change_requirements_path | changes_dir から構築 |
| impact_analysis_path | changes_dir から構築 |
| ユーザーの要望・回答 | ユーザーの発言（そのまま転記） |

**Output:** `{changes_dir}/approach.md`（+ リファクタリング許可時: `{changes_dir}/refactoring-request.md`）

**ステータス分岐:**
- `DONE` → Step後処理を実行し、Step 8 へ
- `DONE_WITH_CONCERNS` → 懸念事項の内容をユーザーに報告し、対応方針を確認した上で Step 8 へ
- `NEEDS_CONTEXT` → 不足情報を提供して再ディスパッチ
- `BLOCKED` → ユーザーに報告し対応方針を確認

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step7`, step_title: `対応方針の作成`, artifact_dir: `{changes_dir}`）

#### Step 8: 対応方針のレビュー（サブエージェント委譲）

本スキルディレクトリの `change-approach-reviewer-prompt.md` を Read で読み込み、プレースホルダーを置換してサブエージェントをディスパッチする。

**タスク:** approach.md の品質をレビューし、OCP検討結果・関連箇所・変更方針の詳細・リファクタリング検討結果の記載漏れがないか検証する

**Input:**
| 情報 | 取得元 |
|---|---|
| changes_dir | ワークフローコンテキスト |
| approach_path | changes_dir から構築 |
| change_requirements_path | changes_dir から構築 |
| impact_analysis_path | changes_dir から構築 |

**ステータス分岐:**
- `PASS` → Step後処理を実行し、Step 9 へ
- `FAIL` → 指摘内容を change-approach-planner に渡して approach.md を修正し、再度 Step 8 へ

**Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step8`, step_title: `対応方針のレビュー`, artifact_dir: `{changes_dir}`）

#### Step 9: 対応方針のユーザー承認

**処理:**

1. `{changes_dir}/approach.md` の内容をユーザーに提示する
2. ユーザーの判断による分岐:
   - **承認（パターンA: 通常続行）** → 後処理へ進む
   - **承認（パターンB: リファクタリング委譲）** → リファクタリングワークフロー起動を案内しワークフロー終了
   - **修正要求** → サブエージェントを fix モードで再ディスパッチし、修正後 Step 8 へ戻る
3. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `step9`, step_title: `対応方針のユーザー承認`, artifact_dir: `{changes_dir}`）

### 後処理（フェーズ全体で1回のみ）

1. **doc-index-maintenance (aide-powers skill)** を activate して実行する
2. **phase-compliance-check (aide-powers skill: write)** を activate して実行する — フェーズ完了検証と進捗ファイル更新
3. **user-profile-management (aide-powers skill: update)** を activate して実行する
4. **次フェーズ遷移:** `fs-change-phase2-impl (aide-powers skill)` を activate して実行する

注: 変更ワークフローでは最終フェーズの進捗ファイル ✅ 完了 更新後に1回のみ git コミットを行う。本フェーズではコミットしない。

5. **Step後処理:** step-history-writer (aide-powers skill) を activate して実行する（skill_name: `fs-change-phase1-analysis`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{changes_dir}`）

## 完了条件

**パターンA: 通常完了**
1. design-gate が PASS
2. change-requirements.md が作成され、ユーザー承認済み
3. impact-analysis.md が作成され、completeness_check PASS
4. changes_dir が確定（フォルダ統合判定完了）
5. approach.md が作成され、レビュー PASS、ユーザー承認済み
6. 進捗ファイルが ✅ 完了 に更新されている

**パターンB: リファクタリング委譲（ワークフロー終了）**
1. approach.md にリファクタリング実施予定が記録されている
2. refactoring-request.md が作成されている
3. ユーザーがリファクタリング委譲を承認している

**パターンC: 設計書ゲート FAIL（ワークフロー終了）**
1. design-gate が FAIL を返している
2. ユーザーに設計逆引きワークフローの実行を提案済み
3. pending-issues.md に未解決問題として登録済み

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `step-history-writer (aide-powers skill)` — 各 Step 末尾で実行

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-change-phase2-impl (aide-powers skill)`

**Called by:** 変更ワークフロー（最初のフェーズスキル）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理1
- `phase-compliance-check (aide-powers skill: verify)` — 前処理2
- `user-profile-management (aide-powers skill)` — 前処理3 (apply) / 後処理3 (update)
- `design-gate (aide-powers skill)` — Step 1
- `folder-merge-check (aide-powers skill)` — Step 6（起因元フォルダがある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — 後処理1

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-requirements-prompt.md` — Step 2（mode: create / fix）
- `change-impact-analyzer-prompt.md` — Step 4
- `change-approach-planner-prompt.md` — Step 7（mode: create / fix）
- `change-approach-reviewer-prompt.md` — Step 8

**Input from caller:**
- `feature_name`: プロジェクト名
- ユーザーの最初の発言（変更要求の内容）

**Output to next phase:**
- `changes_dir`: 確定した changes_dir

**リファクタリング委譲時:**
- `fs-refactoring-phase1-status (aide-powers skill)` を案内

**Global rules:** `.aide/references/global-rules.md` を厳守
