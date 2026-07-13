---
name: fs-design-phase6-usecase
description: "Use when design phase 5 (GUI design) is complete and use case analysis is needed before proceeding to layered architecture design."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| usecase-list.md | .aide/specs/{feature_name}/usecases/usecase-list.md | UC網羅リスト |
| usecase-{uc名}.md | .aide/specs/{feature_name}/usecases/usecase-{uc名}.md | 各UCの実現プロセス + ユーザビリティ評価 |
| usecase-analysis.md | .aide/specs/{feature_name}/usecases/usecase-analysis.md | 改善検討・最終まとめ |
| fs-design-phase6-usecase-report.txt | .aide/tmp/fs-design-phase6-usecase-report.txt | fs-design-phase6-usecaseの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-design-phase6-usecase-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-design-phase6-usecase-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-design-phase6-usecase-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `改善対象UC(Step7): なし（全UCがB以上）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}/usecases/`）
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase6）/ fix（QAゲート差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
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
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):
・下記「状態判定」の Step途中再開判定の結果を記載する
　再開Step(前処理):

### 完了条件
fs-design-phase6-usecase-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート差し戻し）の場合:**
  - progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - QAゲートから渡された fix対象（不足と判定された観点）と qa_feedback を用いて Step Fix を直接実行する
  - fix 完了後:
    - 後続フェーズへ前進遷移しない
    - 後処理・コミットも実行しない
    - 呼び出し元に制御を戻す（再QAレビューのため）

- **実行モードが通常の場合:**
  "進捗確認結果(前処理):" を確認する
  ・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
  ・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 6）
　  ・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜5の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　  ・`RESUME_FROM N`（N==6、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　  ・`RESUME_FROM N`（N>6、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　  ・`RESUME_FROM N`（N<6、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　  ・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

  **Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase6-usecase-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。

## Step 1: usecase-analysis 共通スキルの活性化

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・usecase-analysis (aide-powers skill)を activate して実行し、出力を"usecase-analysisの出力(Step1):"として記載する。その記載内容から、本フェーズで適用するプロセス定義の要点を判断して記載する
　usecase-analysis 4段階プロセス要点(Step1):
　総合評価の算出ルール要点(Step1):

### 完了条件
fs-design-phase6-usecase-report.txtに、usecase-analysis を activate して得たプロセス定義の要点が記載されている

### 状態判定
完了条件を満たしていればStep2へ遷移する

## Step 2: 工程① — UC網羅リストアップ

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　UCリストの出力ファイルパス(Step2):（`.aide/specs/{feature_name}/usecases/usecase-list.md`）
・本スキルディレクトリの `usecase-lister-prompt.md`（mode: phase6_list）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"UCリストアップエージェントの出力(Step2):"として記載する


### 完了条件
fs-design-phase6-usecase-report.txtの"UCリストアップエージェントの出力(Step2):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/usecases/usecase-list.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep3へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `usecase-lister-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED の場合 → ユーザーに報告し対応方針を確認する
- ステータスが FAIL の場合 → UCリスト作成に回復不能なエラーが発生している。エラー内容をユーザーに報告し、対応方針（再実行 / 入力情報の修正 / 前フェーズへの差し戻し）を確認する

## Step 3: UC網羅性レビュー（サブエージェント実行）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `usecase-coverage-reviewer-prompt.md`（mode: review）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"UC網羅性レビューエージェントの出力(Step3):"として記載する。サブエージェントは照合用の中間リスト（usecase-goal-list.md, usecase-risk-list.md, usecase-service-list.md, gui-screen-list.md, gui-page-list.md, usecase-gui-list.md, usecase-process-list.md, usecase-buginform-list.md, usecase-update-list.md, usecase-reset-error.md, usecase-params-error.md, usecase-cancel-error.md）を `.aide/specs/{feature_name}/usecases/review/` 配下に作成し、usecase-list.md との照合を行う
・サブエージェント出力の「### 判定」セクション内「結果:」行の値を以下の項目に転記する（文字列は「全操作カバー済み」または「未カバー操作あり（{N}件）」のいずれか）:
　網羅性レビュー結果(Step3): {サブエージェント出力「### 判定」→「結果:」行の値}
・サブエージェント出力の「### 未カバーユースケース一覧」テーブル内容を以下に転記する:
　未カバー操作一覧(Step3): {サブエージェント出力「### 未カバーユースケース一覧」の内容。未カバー0件の場合は「なし」}

### 完了条件
fs-design-phase6-usecase-report.txtに"UC網羅性レビューエージェントの出力(Step3):"が記載され、網羅性レビュー結果(Step3)が「全操作カバー済み」である

### 状態判定
- 「全操作カバー済み」の場合: Step 4（UCリストのユーザー承認）へ遷移する
- 「未カバー操作あり」の場合: 未カバー操作一覧をユーザーに報告し、`usecase-lister-prompt.md`（mode: fix）で不足UCを追加するサブエージェントを実行する。追加後、本 Step（UC網羅性レビュー）を再実行する（全操作カバー済みになるまで繰り返す）



## Step 4: UCリストのユーザー承認

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/usecases/usecase-list.md` の内容をユーザーに提示し、承認を得た結果を、次の項目で記載する
　UCリストのユーザー判断(Step4):
　UCリストの修正回数(Step4):
　UCリストの修正内容要約(Step4):

### 完了条件
fs-design-phase6-usecase-report.txtの"UCリストのユーザー判断(Step4):"が承認である

### 状態判定
完了条件を満たしていればStep5へ遷移する。"UCリストのユーザー判断(Step4):"が修正要求の場合、修正内容を補い `usecase-lister-prompt.md`（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行し、修正後 Step4 を再実行する

## Step 5: 工程② — 実現プロセス明確化（UC単位・並列）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/usecases/usecase-list.md` から全UCを読み取り、対象UC一覧を記載する
　対象UC一覧(Step5):
・UC単位で本スキルディレクトリの `usecase-process-analyzer-prompt.md`（mode: phase6_process）のプレースホルダーを実データ（対象UC情報）で置き替えたデータをプロンプトとし、サブエージェントを実行する。依存先のない複数UCは複数のサブエージェントを同時に起動して並列実行してよい。各サブエージェントの出力を"実現プロセス分析エージェントの出力（UC-xxx）(Step5):"として全UC分記載する

### 完了条件
fs-design-phase6-usecase-report.txtに全UCの実現プロセス分析エージェントの出力が記載され、全UCのステータスが DONE / DONE_WITH_CONCERNS であり、全UCの `.aide/specs/{feature_name}/usecases/usecase-{uc名}.md` がファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep6へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS のUCがあり、かつ「プログラム実現不可UC」が報告されている場合 → 以下のサブフローを実行する:
  1. サブエージェント出力から「プログラム実現不可UC一覧」（UC-ID、ユースケース名、不可理由）を抽出する
  2. 該当UC一覧と不可理由をユーザーに提示し、UCリストからの削除承認を求める（番号付き選択肢: 1. 全て削除を承認 / 2. 一部のみ削除（対象を指定）/ 3. 削除しない（現状維持）/ 4. その他（自由記述））
  3. ユーザーが削除を承認した場合 → `usecase-removal-prompt.md` のプレースホルダーを削除対象UC情報で置き替えたデータをプロンプトとし、サブエージェントを実行する。サブエージェントの出力を"UC削除エージェントの出力(Step5):"としてレポートに記載する
  4. 削除完了後、残りの DONE_WITH_CONCERNS 懸念事項（プログラム実現不可以外）があればユーザーに報告し対応方針を確認する。その後 Step6 へ遷移する
- ステータスが DONE_WITH_CONCERNS のUCがあり、「プログラム実現不可UC」が含まれない場合 → Step6 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT のUCがある場合 → 不足情報を補い当該UCについて `usecase-process-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED のUCがある場合 → ユーザーに報告し対応方針を確認する
- ステータスが FAIL のUCがある場合 → 実現プロセス分析に回復不能なエラーが発生している。エラー内容と該当UC-IDをユーザーに報告し、対応方針（当該UCのみ再実行 / 入力情報の修正 / スキップして次Stepへ進む）を確認する

## Step 6: 工程③ — ユーザビリティ評価（UC単位・並列）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・対象UC一覧（Step5 と同一）について、UC単位で本スキルディレクトリの `usecase-usability-evaluator-prompt.md`（mode: phase6_eval）のプレースホルダーを実データ（対象UC情報・ファイルパス）で置き替えたデータをプロンプトとし、サブエージェントを実行する。依存先のない複数UCは複数のサブエージェントを同時に起動して並列実行してよい。各サブエージェントの出力を"ユーザビリティ評価エージェントの出力（UC-xxx）(Step6):"として全UC分記載する
・各UCの総合評価を集約した結果を記載する
　UC別総合評価一覧(Step6):

### 完了条件
fs-design-phase6-usecase-report.txtに全UCのユーザビリティ評価エージェントの出力と UC別総合評価一覧が記載され、全UCのステータスが DONE / DONE_WITH_CONCERNS であり、全UCの `.aide/specs/{feature_name}/usecases/usecase-{uc名}.md` に評価結果が追記されている

### 状態判定
完了条件を満たしていればStep7へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS のUCがある場合 → Step7 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT のUCがある場合 → 不足情報を補い当該UCについて `usecase-usability-evaluator-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED のUCがある場合 → ユーザーに報告し対応方針を確認する

## Step 7: 工程④ — 改善検討・最終まとめ

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、出力ファイルパスを記載する
　改善検討の出力ファイルパス(Step7):（`.aide/specs/{feature_name}/usecases/usecase-analysis.md`）
・本スキルディレクトリの `usecase-improver-prompt.md`（mode: phase6_improve）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"改善検討エージェントの出力(Step7):"として記載する
・サブエージェントが提示した改善案に対するユーザー承認結果（GUI設計への影響の許容可否を含む）を、次の項目で記載する
　改善対象UC(Step7):
　改善案ユーザー承認結果(Step7):

### 完了条件
fs-design-phase6-usecase-report.txtの"改善検討エージェントの出力(Step7):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/usecases/usecase-analysis.md` がファイルサイズ1byte以上で存在し、"改善案ユーザー承認結果(Step7):"が記載されている

### 状態判定
完了条件を満たしたうえで、改善対象UC（総合評価C以下のUC）の有無とユーザー承認結果で分岐する
・改善対象UCが1件以上あり、ユーザーが改善実施を承認した → Step8 へ遷移する
・全UCがB以上、またはユーザーが「改善不要」と判断した → Step9 へ遷移する（改善対象UC(Step7): の項目に理由を記載する）
ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS の場合 → 遷移前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `usecase-improver-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 8: 工程⑤ — 改善反映ループ（改善対象UCがある場合のみ）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/usecases/usecase-analysis.md` の改善提案内容から、影響を受ける成果物（system-architecture.md / gui-design.md / usecase-list.md）を特定した結果を記載する
　影響範囲判定結果(Step8):
・影響を受ける成果物を、修正順序（1番目: system-architecture.md → 2番目: gui-design.md → 3番目: usecase-list.md）に従い、各々サブエージェントに委譲して修正する。修正ごとにユーザー合意を得る
　- system-architecture.md / gui-design.md の修正: `usecase-improvement-fix-prompt.md`（mode: fix）
　- usecase-list.md の修正: `usecase-lister-prompt.md`（mode: fix）
　各修正サブエージェントの出力を"改善反映修正エージェントの出力（{対象ファイル}）(Step8):"として記載し、ユーザー合意結果を記載する
・改善対象UCの再評価（必須）として、工程②再実行（`usecase-process-analyzer-prompt.md` mode: fix）と工程③再実行（`usecase-usability-evaluator-prompt.md` mode: fix）を改善対象UCについて実行する（UC単位で並列実行可）。各出力を"再評価エージェントの出力（UC-xxx）(Step8):"として記載する
・再評価結果を usecase-analysis.md に追記するため `usecase-improver-prompt.md`（mode: fix）を実行し、出力を"再評価追記エージェントの出力(Step8):"として記載する
・ループ判定の結果を記載する
　現在のループ回数(Step8):
　ループ判定結果(Step8):

### 完了条件
fs-design-phase6-usecase-report.txtに、影響範囲判定結果・改善反映修正エージェントの出力・再評価エージェントの出力・再評価追記エージェントの出力・ループ判定結果が記載され、再評価が必ず実施されている（改善反映のみで再評価を省略してはならない）

### 状態判定
ループ判定結果で分岐する
・全UCがB以上 → ループ終了 → Step9 へ遷移する
・まだC以下のUCがある かつ ループ回数が3回未満 → ユーザーに報告し、本 Step の改善反映フローを最初から再実行する（次ループ）
・3回で収束しない場合 → ユーザーに「残っているC以下のUCとその評価」「これまでの改善履歴」を提示し、番号付き選択肢（1. 現状のまま次フェーズに進む / 2. さらに改善を試みる / 3. その他（自由記述））で判断を仰ぐ。ユーザー判断に従い、続行なら次ループ、進行なら Step9 へ遷移する

## Step 9: ユーザー最終承認

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・全成果物（usecase-list.md / 全UCの usecase-{uc名}.md / usecase-analysis.md）をユーザーに提示し、最終合意を得た結果を、次の項目で記載する
　最終承認ユーザー判断(Step9):
　最終承認の修正回数(Step9):
　最終承認の修正内容要約(Step9):

### 完了条件
fs-design-phase6-usecase-report.txtの"最終承認ユーザー判断(Step9):"が承認である

### 状態判定
完了条件を満たしていれば後処理へ遷移する。"最終承認ユーザー判断(Step9):"が修正要求の場合、修正対象の成果物に応じて該当プロンプトテンプレート（mode: fix）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して成果物を修正し、修正後 Step9 を再実行する

## Step Fix: fixモード — 差し戻し補完（fixモード時のみ実行）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・fix対象(Step Fix): {qa_feedbackから抽出した不足観点の要約}
・qa_feedback内容(Step Fix): {呼び出し元から渡されたQAフィードバック全文}
・fix対象に応じて以下を実行する:
  - UC追加が必要な場合: `usecase-lister-prompt.md`（mode: fix）で不足UCを追加し、追加したUCについて `usecase-process-analyzer-prompt.md`（mode: fix）で実現プロセスを定義する
  - 既存UCの粒度が粗い場合: 対象UCについて `usecase-process-analyzer-prompt.md`（mode: fix）で再分析する
  - イベント制御に関するUC不足の場合: gui-design.mdのイベント制御表を参照し、未カバーのイベントに対応するUCを `usecase-lister-prompt.md`（mode: fix）で追加する
・各サブエージェントの出力を"fix補完エージェントの出力(Step Fix):"として記載する
・fix結果のユーザー確認結果を記載する
　fix結果ユーザー確認(Step Fix):

### 完了条件
fix対象の観点について補完が完了し、ユーザーの確認が得られている

### 状態判定
完了条件を満たしたら、呼び出し元に制御を戻す（後続フェーズへの前進遷移・後処理・コミットは行わない）

## 後処理

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する（対象: usecases/usecase-list.md, usecases/usecase-{uc名}.md（全UC分）, usecases/usecase-analysis.md）
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-design-phase6-usecase-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先が記載されている

### 状態判定
phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
- ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
- 最終的な実行内容はユーザー指示に従う

完了条件を満たし、git-commit-workflow まで完了したら `fs-design-phase7-ddd (aide-powers skill)` を activate して実行する

注: 設計ワークフローは各フェーズコミット型である。本フェーズは後処理で phase-report-check(write) により進捗ファイルを ✅ 完了 に更新した後、git-commit-workflow で当該フェーズのコミットを行う。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**前のフェーズスキル:**
- `fs-design-phase5-gui (aide-powers skill)`（GUI設計）→ 完了後に本スキルが呼び出される

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-design-phase7-ddd (aide-powers skill)`（レイヤードアーキテクチャ + ユビキタス言語）

**Called by:** 設計ワークフロー（フェーズ6）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `usecase-analysis (aide-powers skill)` — Step 1（4段階プロセスの定義を活性化）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理
- `pending-issues-management (aide-powers skill)` — 問題発見時に随時記録
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `usecase-lister-prompt.md` — Step 2（mode: phase6_list / fix）
- `usecase-coverage-reviewer-prompt.md` — Step 3（mode: review）【新規作成】
- `usecase-process-analyzer-prompt.md` — Step 5〜（mode: phase6_process / fix）
- `usecase-usability-evaluator-prompt.md` — Step 6（mode: phase6_eval / fix）、Step 8 再評価（mode: fix）
- `usecase-improver-prompt.md` — Step 7（mode: phase6_improve / fix）、Step 8 再評価追記（mode: fix）
- `usecase-improvement-fix-prompt.md` — Step 8（mode: fix / system-architecture.md・gui-design.md の修正）
- `usecase-removal-prompt.md` — Step 5 プログラム実現不可UC削除サブフロー【新規作成】

**Input from caller:**
- `feature_name`: プロジェクト名
- `mode`:（オプション）`phase6`（通常、デフォルト）/ `fix`（QAゲート差し戻し）
- `fix_target`:（fixモード時のみ）不足と判定された観点の説明
- `qa_feedback`:（fixモード時のみ）QAエージェントからのフィードバック全文

**Output to next phase:**
- ユースケース成果物一式（usecase-list.md / 全UCの usecase-{uc名}.md / usecase-analysis.md）

**Global rules:** `.aide/references/global-rules.md` を厳守
