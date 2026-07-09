---
name: fs-planning-phase3-finalize
description: "Use when the planning exploration cycle is complete and the proposal needs final review, user agreement, and handover preparation for the design workflow."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| handover-notes.md | `.aide/specs/{feature_name}/handover-notes.md` | 設計ワークフローへの引き継ぎメモ（ことづけ） |
| fs-planning-phase3-report.txt | `.aide/tmp/fs-planning-phase3-report.txt` | fs-planning-phase3-finalizeの実行レポート |

注: planning-proposal.md / session-notes.md / tech-investigation/ / source-materials/ / user-profile.md は前フェーズまでに作成済みの一次資料であり、本フェーズで新規作成する成果物は handover-notes.md のみ。


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-planning-phase3-report.txt以外のファイルの書き出しは禁止。

- **NO FINALIZATION WITHOUT HANDOVER-NOTES**: handover-notes.md を作成せずに企画ワークフローを完了扱いにしてはならない。handover-notes.md は設計ワークフローが開始時に必ず読み込む引き継ぎメモであり、これなしに設計を開始すると企画段階の重要な文脈（ユーザーのこだわり、妥協点、未解決課題）が失われる
- **基準未達時のユーザー確認を省略しない**: レビュー総合判定が ALMOST / NEEDS_WORK の場合、ユーザーに不足観点を説明し、探索サイクルへ戻るか/このまま進むかを必ず確認する。「シンプルだから」「ユーザーが急いでいるから」は省略の根拠にならない
- **妥協点の記録を省略しない**: 基準未達のままユーザーが続行を選んだ場合、その妥協点を handover-notes.md に必ず記録する（記録しないと設計フェーズで補強すべき箇所が不明になる）

# レポート運用ルール

fs-planning-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-planning-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `妥協点記録: N/A（総合判定 READY のため妥協なし）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):
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
・フェーズ内 Step 途中再開判定: "再開ポイント(前処理):" が `RESUME_FROM N`（N==本フェーズ番号）で本フェーズを実行する場合、`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-planning-phase3-report.txt）の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を記載する
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
fs-planning-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズの番号は 3）
　・`START_FRESH`（新規開始）→ 非初フェーズのため異常（前フェーズ未完了）。ユーザーに報告し前フェーズスキル `fs-planning-phase2-explore (aide-powers skill)` へ差し戻す
　・`RESUME_FROM N`（N==3＝本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理の「フェーズ内 Step 途中再開判定」で決めた "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>3＝後続フェーズ）→ 該当フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<3＝前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し前フェーズスキル `fs-planning-phase2-explore (aide-powers skill)` へ差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: 最終レビューの実行

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `proposal-reviewer-prompt.md`（final_review モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"最終レビューエージェントの出力(Step1):"として記載する
　- サブエージェントは planning-proposal.md を全文読み込み、関連資料（tech-investigation/, source-materials/, user-profile.md）を参照する
　- 10観点×5段階でスコアリングして総合判定を返す（観点4・5はオプションのため総合判定は必須8観点で算出する）
　- その記載内容から、次の項目を判断して記載する
　総合判定(Step1):（READY / ALMOST / NEEDS_WORK）
　スコア3以下の観点(Step1):

### 完了条件
fs-planning-phase3-report.txtの"最終レビューエージェントの出力(Step1):"と総合判定（READY / ALMOST / NEEDS_WORK）が記載されている

### 状態判定
完了条件を満たしたうえで、fs-planning-phase3-report.txtの"最終レビューエージェントの出力(Step1):"のステータスで分岐する
・正常完了 → Step2 へ遷移する
・NEEDS_CONTEXT の場合 → 不足情報を補い `proposal-reviewer-prompt.md`（final_review モード）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 2: レビュー結果の評価とユーザー確認

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step1 の総合判定に応じて、次のとおりユーザーに確認した結果を記載する
　- READY（8観点すべてが4以上）→ ユーザー確認は不要。「企画書の品質が十分なレベルに達しました」と伝える
　- ALMOST（8観点で3以下が2個以内）→ スコア3以下の観点をユーザーに平易な言葉で説明し、「まだ詰めたほうがいいところがあります」と提案する
　　番号付き選択肢で確認する:
　　1. もう少し詰めたい（探索サイクルに戻る）
　　2. このままでOK（最終化に進む）
　　3. その他（自由記述）
　- NEEDS_WORK（8観点で3以下が3個以上）→ スコア3以下の観点をユーザーに平易な言葉で説明し、「設計に進むにはまだ不十分な点が多いです」と説明する
　　番号付き選択肢で確認する:
　　1. 探索サイクルに戻って詰める（推奨）
　　2. それでもこのまま進めたい
　　3. その他（自由記述）
・ユーザーへの確認結果を、次の項目で記載する
　レビュー結果のユーザー判断(Step2):（探索サイクルに戻る / このまま進む / READYのため確認不要）
　妥協点記録(Step2):（このまま進む場合、handover-notes.md に記録する妥協点の要約。READY または戻る場合は理由を記載）
　修正起票結果(fix_id)(Step2):（「探索サイクルに戻る」を選んだ場合のみ。fix_open 起票で得た fix_id を記載。それ以外は理由を記載）

### 完了条件
fs-planning-phase3-report.txtに、総合判定に基づくユーザー判断（または READY のため確認不要）が記載されている

### 状態判定
完了条件を満たし、fs-planning-phase3-report.txtの"レビュー結果のユーザー判断(Step2):"に応じて分岐する
・READY（確認不要）または「このまま進む」→ Step3 へ遷移する（「このまま進む」の場合、妥協点を Step4 の handover-notes.md に記録するため "妥協点記録(Step2):" を確定させる）
・「探索サイクルに戻る」→ 以下を順に実行する:
　1. `phase-report-check (aide-powers skill: fix_open)` を activate して実行する
　　引数: progress_file_path=`.aide/specs/{feature_name}/planning-progress.md`, fix_phase=2, fix_reason=ユーザーが探索継続を希望／スコア3以下の観点, fix_content=詰めるべき観点の要約, requester_skill_name=`fs-planning-phase3-finalize`
　2. 返り値の fix_id を "修正起票結果(fix_id)(Step2):" に記載する
　3. 前フェーズスキル `fs-planning-phase2-explore (aide-powers skill)` に戻る（REQUIRED SUB-SKILL で再遷移）
　※ 🔧 修正中 になった phase2 は progress-resume-check が未完了として扱い RESUME_FROM 2 を返すため、phase3 への bounce（誤ルーティング）は起きない

## Step 3: ユーザー最終合意の取得

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・企画書（planning-proposal.md）の最終版をユーザーに提示し(Node.jsがあれば、ブラウザで表示すること)、「この内容で設計フェーズに進みます。よろしいですか？」と番号付き選択肢で確認した結果を、次の項目で記載する（1. はい / 2. いいえ、修正したい箇所がある（探索サイクルに戻る）/ 3. その他（自由記述））
　ユーザーの選択・指摘内容(Step3):
　修正起票結果(fix_id)(Step3):（「修正要求」の場合のみ。fix_open 起票で得た fix_id を記載。合意の場合は理由を記載）

### 完了条件
fs-planning-phase3-report.txtの"ユーザーの選択・指摘内容(Step3):"が合意である

### 状態判定
完了条件を満たし、fs-planning-phase3-report.txtの"ユーザーの選択・指摘内容(Step3):"の内容で分岐する
・合意の場合 → Step4 へ遷移する
・修正要求の場合 → 以下を順に実行する:
　1. `phase-report-check (aide-powers skill: fix_open)` を activate して実行する
　　引数: progress_file_path=`.aide/specs/{feature_name}/planning-progress.md`, fix_phase=2, fix_reason=ユーザーが企画書修正を希望, fix_content=修正内容要約, requester_skill_name=`fs-planning-phase3-finalize`
　2. 返り値の fix_id を "修正起票結果(fix_id)(Step3):" に記載する
　3. 前フェーズスキル `fs-planning-phase2-explore (aide-powers skill)` に戻る
　※ 🔧 修正中 になった phase2 は progress-resume-check が未完了として扱い RESUME_FROM 2 を返すため、phase3 への bounce（誤ルーティング）は起きない

## Step 4: handover-notes.md の作成

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　handover-notesの出力ファイルパス(Step4):（.aide/specs/{feature_name}/handover-notes.md）
・サブエージェントには feature_name に加え、Step1 の最終レビュー結果（{final_review_result}）と Step2 で確定した妥協点（{compromise_notes}）をプレースホルダー実データとして渡す
・本スキルディレクトリの `handover-notes-writer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"handover-notes作成エージェントの出力(Step4):"として記載する
　- サブエージェントは session-notes.md / user-profile.md / planning-proposal.md / tech-investigation/ / 最終レビュー結果を参照する
　- handover-notes.md に以下5項目を全て記載する（該当なしの場合も「該当なし」と明記しセクションを省略しない）:
　　A. 特に注意すべき点
　　B. ユーザーの意思決定の経緯
　　C. レビューで妥協した点
　　D. 技術調査で未解決の課題
　　E. ユーザー技術レベルの所感
　- Step2 で確定した妥協点は C に必ず反映する

### 完了条件
fs-planning-phase3-report.txtの"handover-notes作成エージェントの出力(Step4):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、.aide/specs/{feature_name}/handover-notes.md がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしたうえで、fs-planning-phase3-report.txtの"handover-notes作成エージェントの出力(Step4):"のステータスで分岐する
・DONE → 後処理へ遷移する
・DONE_WITH_CONCERNS → 後処理へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
・NEEDS_CONTEXT → 不足情報を補い `handover-notes-writer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
・BLOCKED → ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-planning-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。handover-notes.md のエントリ追加と全エントリの最終確認を行う。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・planning-progress.md の「## 修正履歴」に 🔧 修正中 のエントリがあれば、以下を実行する:
　1. 各 fix_id について `phase-report-check (aide-powers skill: fix_close)` を activate して実行する
　　引数: progress_file_path=`.aide/specs/{feature_name}/planning-progress.md`, fix_id=対象の fix_id
　2. 各エントリを ✅ 修正完了 にする
　3. 結果を"修正履歴クローズ結果(後処理):"として記載する
　- 🔧 修正中 のエントリがない場合は "N/A（修正なし）" と記載する
　修正履歴クローズ結果(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。企画ワークフローの成果物をコミットする（プレフィックス: `docs:`）。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):

### 完了条件
fs-planning-phase3-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータスが記載され、コミットが完了している

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、fs-planning-phase3-report.txtの"完了ステータス(後処理):"を確認したら `fs-planning-phase4-final-check (aide-powers skill)` を activate して実行する

注: 企画ワークフローは各フェーズコミット型であり、本フェーズは自フェーズの後処理で phase-report-check(write) の後にコミットする。最終フェーズ（fs-planning-phase4-final-check）の進捗ファイル ✅ 完了 更新後のコミットは final-check フェーズ側の後処理で実施される（移行済み・ルール5.8 準拠）。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-planning-phase4-final-check (aide-powers skill)`

**Called by:**
- `fs-planning-phase2-explore (aide-powers skill)` — REQUIRED SUB-SKILL 形式で遷移

**戻り遷移（例外的）:**
- Step2 でユーザーが「探索サイクルに戻る」を選択した場合、または Step3 でユーザーが「修正したい」を選択した場合、`phase-report-check (aide-powers skill: fix_open)` で phase2 に修正起票（進捗行を ✅完了→🔧 修正中 化）したうえで `fs-planning-phase2-explore (aide-powers skill)` に戻る。🔧 修正中 になった phase2 は progress-resume-check が未完了として扱い RESUME_FROM 2 を返すため、phase3 への bounce（誤ルーティング）は起きない。なお進捗表フェーズ行を ⬜ 未着手 に戻すことは禁止（完了実績が失われるため）。差し戻しは 🔧 修正中 で表現する

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理（handover-notes.md のエントリ追加、全エントリの最終確認）
- `git-commit-workflow (aide-powers skill)` — 後処理（企画ワークフロー成果物のコミット）
- `visual-companion (aide-powers skill)` — 企画書最終版の全体構成図・UIモックアップの視覚的提示。文字だけより図で見せた方がわかりやすい場面（Step2/Step3 のユーザー確認時）では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `proposal-reviewer-prompt.md` — Step 1（mode: final_review）
- `handover-notes-writer-prompt.md` — Step 4（mode: なし。handover-notes.md 作成をサブエージェントに委譲）

**Input from caller:**
- `feature_name`: プロジェクト名
- 企画探索サイクルの成果物（planning-proposal.md / session-notes.md / tech-investigation/ / source-materials/ / user-profile.md）

**Output to next phase:**
- `handover-notes.md`: 設計ワークフローへの引き継ぎメモ
- 引き継ぎ資料一式（planning-proposal.md / user-profile.md / tech-investigation/ / source-materials/ / handover-notes.md / doc-index.md）

**Global rules:** `.aide/references/global-rules.md` を厳守
