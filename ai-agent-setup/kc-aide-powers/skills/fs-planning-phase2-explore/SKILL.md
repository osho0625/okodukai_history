---
name: fs-planning-phase2-explore
description: "Use when the initial planning proposal template has been created and needs iterative refinement through user dialogue, technical investigation, and review cycles."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| planning-proposal.md | `.aide/specs/{feature_name}/planning-proposal.md` | 開発企画書（探索サイクルで段階的に更新） |
| session-notes.md | `.aide/specs/{feature_name}/session-notes.md` | 対話記録（確定事項・検討中・技術調査依頼・提案事項・却下事項） |
| tech-investigation/ | `.aide/specs/{feature_name}/tech-investigation/` | 技術調査結果（tech-investigation (aide-powers skill) 経由で格納） |
| fs-planning-phase2-report.txt | `.aide/tmp/fs-planning-phase2-report.txt` | fs-planning-phase2-exploreの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-planning-phase2-report.txt以外のファイルの書き出しは禁止。

**レビュー省略禁止:** 区切り条件に該当したら、必ず proposal-reviewer によるレビューを実施すること。レビューなしに探索サイクルを完了してはならない。「ユーザーが急いでいるから」「指摘通り直したから」「前に似た調査をしたから」等は省略の根拠にならない。

# レポート運用ルール

fs-planning-phase2-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-planning-phase2-report.txt に反映する
- 探索サイクルは複数回ループするため、各サイクルの記録はサイクル番号を付けて累積記録する（前サイクルの記録は消さない）
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `tech-investigationの出力: N/A（本サイクルでは技術調査不要のためスキップ）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}`）
・現在のPhase:
・現在のStep:
・`.aide/references/phase-skill-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　phase-skill-rules重要ポイント1(前処理):
　phase-skill-rules重要ポイント2(前処理):
　phase-skill-rules重要ポイント3(前処理):
・`.aide/references/global-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　global-rules重要ポイント1(前処理):
　global-rules重要ポイント2(前処理):
　global-rules重要ポイント3(前処理):
・progress-resume-check (aide-powers skill)を activate して実行し、出力を"progress-resume-checkの出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・フェーズ内 Step 途中再開判定: "再開ポイント(前処理):" が `RESUME_FROM N`（N==本フェーズ番号）で本フェーズを実行する場合、`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-planning-phase2-report.txt）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。ただし phase3 からの戻り遷移での再入時は、フェーズ内途中再開ではなく探索サイクルを Step1 から新規実行する。判定結果を記載する
　再開Step(前処理):
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):

### 完了条件
fs-planning-phase2-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズの番号は 2）
　・`START_FRESH`（新規開始）→ 非初フェーズのため異常（前フェーズ未完了）。ユーザーに報告し前フェーズスキルへ差し戻す
　・`RESUME_FROM N`（N==2＝本フェーズ番号）→ 本フェーズを実行する。phase3 からの戻り遷移での再入の場合は探索サイクルを Step1 から新規実行する。フェーズ内の途中再開が必要な場合は前処理の「フェーズ内 Step 途中再開判定」で決めた "再開Step(前処理):" に従う
　・`RESUME_FROM N`（N>2＝後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<2＝前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し前フェーズスキルへ差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了
　（注: phase3 からの戻り遷移では、phase3 が fix_open で本フェーズ（探索）進捗行を ✅完了→🔧修正中 にする。progress-resume-check は 🔧修正中 を未完了とみなし `RESUME_FROM 2`（本フェーズ）を返すため、本フェーズは RESUME_FROM 2 分岐で再入し、探索サイクルを Step1 から新規実行する。⬜未着手 へのリセットは行わない（完了実績を保持するため））

## Step 1: ユーザーとの対話

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・{feature_name}/planning-proposal.md の未充足セクション（「未定」記載箇所）と、前回レビュー結果があれば改善提案の優先度、{feature_name}/session-notes.md の最新状態を確認した結果を、次の項目で記載する。未充足セクションについて平易な言葉で **1つずつ** ユーザーに質問し、新たな可能性を随時提案する
　現在のサイクル番号(Step1):
　未充足セクション一覧(Step1):
　ユーザーへの質問と回答要約(Step1):
　新たな提案内容(Step1):
　技術調査が必要な要素(Step1):
・ユーザーとの対話内容を session-notes.md に記録する作業をサブエージェントに委譲する。本スキルディレクトリの `session-notes-writer-prompt.md` のプレースホルダー（`{feature_name}` / `{cycle_number}`（現在のサイクル番号）/ `{dialogue_results}`（今サイクルの質問と回答・提案・技術調査依頼・却下など））を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、出力を"session-notes更新エージェントの出力(Step1):"として記載する（確定事項・検討中・技術調査依頼・提案事項・却下事項のカテゴリで整理し、各エントリにサイクル番号を付与、ユーザーの発言は原文のまま改変せず記録する）
　session-notes更新エージェントの出力(Step1):

### 完了条件
fs-planning-phase2-report.txtに、対話結果（質問と回答・提案・技術調査が必要な要素）と session-notes更新エージェントの出力が記載され、その出力ステータスが DONE / DONE_WITH_CONCERNS であり、{feature_name}/session-notes.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-planning-phase2-report.txtの"session-notes更新エージェントの出力(Step1):"のステータスを確認する:

- DONE の場合:
  - Step2 へ遷移する（技術調査が必要な要素がない場合も Step2 へ遷移する。Step2 内でスキップ判定する）
- DONE_WITH_CONCERNS の場合:
  - Step2 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `session-notes-writer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 2: 技術調査（必要な場合のみ）

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step1 で特定した「技術調査が必要な要素」の有無を確認した結果を記載する
　技術調査要否(Step2):（要 / 不要）
・技術調査が必要な場合、tech-investigation (aide-powers skill)を activate して実行し（調査対象・調査の背景・調査観点を渡す）、出力を"tech-investigationの出力(Step2):"として記載する。その記載内容から、次の項目を判断して記載する。不要な場合は理由を記載してスキップする
　技術調査結果要約(Step2):
・技術調査を実施した場合、doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(Step2):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(Step2):

### 完了条件
fs-planning-phase2-report.txtに、技術調査要否が記載され、調査実施時は tech-investigation の出力と doc-index-maintenance の出力が記載されている（不要時は理由が記載されている）

### 状態判定
完了条件を満たしていればStep3へ遷移する

## Step 3: 企画書の更新

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　企画書の出力ファイルパス(Step3):（.aide/specs/{feature_name}/planning-proposal.md）
・本スキルディレクトリの `proposal-writer-update-prompt.md` のプレースホルダーを実データ（session-notes.md の差分・新規の技術調査結果）で置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"企画書更新エージェントの出力(Step3):"として記載する
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(Step3):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(Step3):

### 完了条件
fs-planning-phase2-report.txtの"企画書更新エージェントの出力(Step3):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、.aide/specs/{feature_name}/planning-proposal.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-planning-phase2-report.txtの"企画書更新エージェントの出力(Step3):"のステータスを確認する:

- DONE の場合:
  - Step4 へ遷移する
- DONE_WITH_CONCERNS の場合:
  - Step4 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `proposal-writer-update-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 4: 区切り判定

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・以下の4条件のいずれかに該当するかを判定した結果を、次の項目で記載する
　区切り条件該当判定(Step4):（該当した条件 a/b/c/d、またはいずれも非該当）
　区切り条件該当判定理由(Step4):

区切り条件（いずれかに該当したらレビューへ）:

| # | 条件 | 具体的な判断基準 |
|---|---|---|
| (a) | 技術調査が一段落した | 主要な技術要素（必須機能に関わるもの）の調査が完了し、実現可能性の判断が出揃った |
| (b) | 複数セクションが大きく更新された | 企画書の2つ以上のセクションに実質的な情報追加があった |
| (c) | 方向性が大きく変わった | プロジェクトの目的・スコープ・技術選定に大きな変更があった |
| (d) | ユーザーが確認を要望した | ユーザーが「一旦確認したい」「今の状態を見たい」等と発言した |

### 完了条件
fs-planning-phase2-report.txtに、区切り条件該当判定と判定理由が記載されている

### 状態判定
完了条件を満たし、fs-planning-phase2-report.txtの"区切り条件該当判定(Step4):"を確認する
・いずれの条件にも非該当 → Step1 に戻る（探索サイクル継続）
・いずれかの条件に該当 → Step5 へ遷移する

## Step 5: レビュー

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `proposal-reviewer-prompt.md`（cycle_review モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"企画書レビューエージェントの出力(Step5):"として記載する。その記載内容から、次の項目を判断して記載する
　レビュー総合判定(Step5):（READY / ALMOST / NEEDS_WORK）
　改善提案要約(Step5):
・レビュー結果をユーザーに共有する

### 完了条件
fs-planning-phase2-report.txtに、企画書レビューエージェントの出力とレビュー総合判定（READY / ALMOST / NEEDS_WORK）が記載されている

### 状態判定
完了条件を満たしたうえで、fs-planning-phase2-report.txtの"企画書レビューエージェントの出力(Step5):"のステータスを確認する:

- DONE / DONE_WITH_CONCERNS の場合:
  - Step6 へ遷移する
- NEEDS_CONTEXT の場合:
  - 不足情報を補い `proposal-reviewer-prompt.md`（cycle_review モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合:
  - ユーザーに報告し対応方針を確認する

## Step 6: ループ判定

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step5 のレビュー総合判定（観点4・5を除く8観点で判定）に基づき、次のアクションを決定した結果を、次の項目で記載する
　ループ判定結果(Step6):（NEEDS_WORK:サイクル継続 / ALMOST:ユーザー確認 / READY:フェーズ3遷移）
　次のサイクルで重点的に扱う領域(Step6):

総合判定の基準:

| 判定 | 条件 | アクション |
|---|---|---|
| **NEEDS_WORK** | 8観点のうち3以下が3個以上 | サイクル継続（必須）。改善提案の優先度に従い対話・調査を進める |
| **ALMOST** | 8観点のうち3以下が2個以内 | ユーザーに確認する。不足観点を説明し「もう少し詰めますか？」と確認 |
| **READY** | 8観点すべてが4以上 | フェーズ3へ遷移 |

（観点4（開発リソースの妥当性）・観点5（運用費用）はスコアリングするが総合判定に影響しない参考情報）

### 完了条件
fs-planning-phase2-report.txtに、ループ判定結果が記載されている

### 状態判定
完了条件を満たしていればStep7へ遷移する

## Step 7: ユーザー承認

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step6 のループ判定結果に応じてユーザーに提示・確認した結果を、次の項目で記載する
　探索サイクルのユーザー判断(Step7):（サイクル継続 / 完了希望 / フェーズ3遷移承認）
　完了希望の有無(Step7):
・サイクル継続（Step1 に戻る）と判断した場合は、git-commit-workflow (aide-powers skill)を activate して実行し、当該サイクルの成果物（planning-proposal.md / session-notes.md / tech-investigation/）をコミットした結果を"サイクルコミット結果(Step7):"として記載する（プレフィックス: `docs:`）。後処理へ遷移する場合は最終サイクルとして後処理側でコミットするため、ここでは「N/A（後処理でコミット）」と記載する
　サイクルコミット結果(Step7):

### 完了条件
fs-planning-phase2-report.txtの"探索サイクルのユーザー判断(Step7):"が記載されている

### 状態判定
完了条件を満たし、fs-planning-phase2-report.txtの"ループ判定結果(Step6):"および"探索サイクルのユーザー判断(Step7):"を確認し分岐する。サイクル継続で Step1 に戻る場合は、戻る前に上記「サイクルコミット結果(Step7):」のとおり git-commit-workflow で当該サイクルの成果物をコミットする
・NEEDS_WORK → Step1 に戻る（サイクル継続）
・ALMOST かつ ユーザーが「もう少し詰めたい」→ Step1 に戻る
・ALMOST かつ ユーザーが「これでOK（完了希望）」→ 後処理へ遷移する
・READY かつ ユーザーがフェーズ3遷移を承認 → 後処理へ遷移する
・READY だが ユーザーがさらにサイクル継続を希望 → Step1 に戻る（サイクル継続）
・ユーザー明示完了（最低1回レビュー実施済み）→ 後処理へ遷移
・上記に加え、ユーザーが「企画書はこれで十分」と明示的に完了を判断した場合は、本フェーズで最低1回のレビュー（Step5）を実施済みであることを条件に後処理へ遷移してよい

## 後処理

### 成果物
fs-planning-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、成果物をコミットした結果を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:READY遷移 / B:ALMOST+ユーザー完了希望 / C:ユーザー明示完了（最低1回レビュー実施済み））
・次フェーズ遷移先(後処理):

### 完了条件
fs-planning-phase2-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータスが記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-planning-phase2-report.txtの"完了ステータス(後処理):"を確認したら `fs-planning-phase3-finalize (aide-powers skill)` を activate して実行する

注: 企画ワークフローは各フェーズの後処理でそのフェーズの phase-report-check(write) の後に git コミットを行う（各フェーズコミット型）。本フェーズも後処理の phase-report-check(write) の後にコミットする。加えて本フェーズは探索サイクルが複数回ループするため、サイクル完了ごと（Step7 でサイクル継続と判断し Step1 に戻る前）にも git-commit-workflow 経由で当該サイクルの成果物をコミットし、コミット粒度をサイクル単位に保つ（後処理のコミットは最終サイクル分）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-planning-phase3-finalize (aide-powers skill)` — 完了判定・最終化

**Called by:**
- `fs-planning-phase1-intake-and-init (aide-powers skill)` — 初期情報収集・テンプレート初期化が完了した後に遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `tech-investigation (aide-powers skill)` — Step 2（技術調査が必要な要素がある場合のみ）
- `doc-index-maintenance (aide-powers skill)` — Step 2（技術調査実施時）/ Step 3（企画書更新後）/ 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — Step 7（サイクル継続時の区切りコミット）/ 後処理（最終サイクル完了時）
- `pending-issues-management (aide-powers skill)` — 探索サイクル中に問題を発見した場合（稀）
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `session-notes-writer-prompt.md` — Step 1（mode: update）
- `proposal-writer-update-prompt.md` — Step 3（mode: update）
- `proposal-reviewer-prompt.md` — Step 5（mode: cycle_review）

**Input from caller:**
- `feature_name`: プロジェクト名
- 初期化済みの planning-proposal.md / session-notes.md（Phase 1 で作成）

**Output to next phase:**
- `feature_name`: プロジェクト名
- 品質基準を満たした planning-proposal.md

**Global rules:** `.aide/references/global-rules.md` を厳守
