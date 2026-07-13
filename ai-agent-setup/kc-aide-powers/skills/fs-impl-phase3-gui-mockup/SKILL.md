---
name: fs-impl-phase3-gui-mockup
description: "Use when implementing GUI mockup for early user feedback — static layout only, no logic wiring"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| GUIモックアップコード | program-structure.md で定義されたGUI関連ファイルパス | gui-design.md に基づく静的配置コード（ロジック接続なし） |
| fs-impl-phase3-report.txt | .aide/tmp/fs-impl-phase3-report.txt | fs-impl-phase3-gui-mockupの実行レポート |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-impl-phase3-report.txt以外のファイルの書き出しは禁止。

# レポート運用ルール

fs-impl-phase3-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-impl-phase3-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `フィードバック内容(Step5): N/A（GUI無しのためスキップ）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-impl-phase3-report.txt

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
・`.aide/specs/{feature_name}/session-handover.md`（存在すれば）と自フェーズの phase report（fs-impl-phase3-report.txt）の "現在のStep:" を読み、本フェーズを RESUME_FROM N（N==本フェーズ番号）で再開する場合にフェーズ内のどの Step から再開するかを判定する。中断していた Step があればその Step から、なければ Step1 から再開する。判定結果を次の項目で記載する
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
fs-impl-phase3-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
　・`RESUME_FROM N`（N==本フェーズ番号=3）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う）
　・`RESUME_FROM N`（N>本フェーズ番号=3）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<本フェーズ番号=3）→ 異常（前フェーズが未完了）。ユーザーに報告し、再開ポイント N が示す前フェーズスキルに差し戻す
　・`START_FRESH`（新規開始）→ 異常（前フェーズの環境確認・タスクリスト生成が未完了）。ユーザーに報告し、前フェーズスキル `fs-impl-phase2-preparation (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: GUI有無判定

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index.md を確認し、gui-design.md の存在を確認した結果を、次の項目で記載する
　gui-design.mdの有無(Step1):
　GUI有無判定結果(Step1):（GUIあり→Step2へ / GUIなし→スキップして後処理へ）

### 完了条件
fs-impl-phase3-report.txtに、gui-design.mdの有無(Step1)とGUI有無判定結果(Step1)が記載されている

### 状態判定
完了条件を満たし、fs-impl-phase3-report.txtの"GUI有無判定結果(Step1)"を確認する

・GUIなし → ユーザーに「GUIがないプロジェクトのため、GUIモックアップ確認をスキップします」と通知し、後処理へ遷移する（次フェーズ遷移。完了ステータス C）
・GUIあり → Step2 へ遷移する

## Step 2: モックアップ作成要否確認

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・ユーザーに番号付き選択肢で「gui-design.md に基づくGUIモックアップを作成しますか？モックアップは静的配置のみを先に作成し、ユーザーがレイアウトの確認を行う工程です。GUI設計に自信がある等の理由でこの確認をスキップすることもできます。」と確認する（選択肢: 1. はい、モックアップを作成して確認を行う / 2. いいえ、スキップして実装フェーズに進む / 3. その他（自由記述））。確認結果を、次の項目で記載する
　モックアップ作成要否のユーザー判断(Step2):（作成する / スキップ）

### 完了条件
fs-impl-phase3-report.txtに、モックアップ作成要否のユーザー判断(Step2)が記載されている

### 状態判定
完了条件を満たし、fs-impl-phase3-report.txtの"モックアップ作成要否のユーザー判断(Step2)"を確認する

・スキップ → ユーザーに「GUIモックアップ確認をスキップし、実装フェーズに進みます」と通知し、後処理へ遷移する（次フェーズ遷移。完了ステータス B）
・作成する → Step3 へ遷移する

## Step 3: GUIモックアップ実装

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・サブエージェント実行前に、program-structure.md からGUI関連ファイルの配置先を特定し、出力ファイルパスを記載する
　GUIモックアップの出力ファイルパス(Step3):（program-structure.md で定義されたGUI関連ファイルパス）
・本スキルディレクトリの `gui-mockup-impl-prompt.md`（mode: implement）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"GUIモックアップ実装エージェントの出力(Step3):"として記載する

### 完了条件
fs-impl-phase3-report.txtのGUIモックアップ実装エージェントの出力(Step3)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、program-structure.md で定義されたGUI関連ファイルがファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep4へ遷移する。ただしステータスが DONE_WITH_CONCERNS の場合は、Step4 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合 → 不足情報を補い `gui-mockup-impl-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 4: ユーザー確認依頼

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・ユーザーに以下を伝えた結果を"確認依頼内容(Step4):"として記載する。伝える内容: 起動コマンド（dev-environment.md に基づく）／確認してほしいポイント（1. ウィンドウサイズ・タイトルは適切か 2. タブ構成・タブ名は適切か 3. ボタン・入力欄の配置は適切か 4. 配色・フォントは見やすいか 5. その他気になる点）／「ロジックは未接続のため、ボタンを押しても動作しません」との注記
　確認依頼内容(Step4):

### 完了条件
fs-impl-phase3-report.txtに、確認依頼内容(Step4)が記載されている

### 状態判定
完了条件を満たしていればStep5へ遷移する

## Step 5: フィードバック収集・分析

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・ユーザーから受け取ったフィードバックと、その分類結果を、次の項目で記載する。分類は次の3区分とする: 問題なし／(A) コード修正のみで対応可能（配置の微調整、色の変更等）／(B) gui-design.md の修正が必要（画面構成の変更、新規ウィジェット追加等）
　フィードバック内容(Step5):
　フィードバック分類結果(Step5):（問題なし / A:コード修正のみ / B:gui-design.md修正必要）

### 完了条件
fs-impl-phase3-report.txtに、フィードバック内容(Step5)とフィードバック分類結果(Step5)が記載されている

### 状態判定
完了条件を満たし、fs-impl-phase3-report.txtの"フィードバック分類結果(Step5)"を確認する

・問題なし → 後処理へ遷移する（完了ステータス A）
・A:コード修正のみ → Step6 へ遷移する
・B:gui-design.md修正必要 → Step7 へ遷移する

なお Step6 / Step7 を経て Step4 に戻るフィードバック対応ループは最大3回まで。3回を超える場合は打ち切らず、ユーザーに「モックアップの修正が3回を超えました。方針を相談させてください」と伝え、方針（現状レイアウトで確定・方針変更等）を確認する。

## Step 6: コード修正

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `gui-mockup-fix-prompt.md`（mode: fix。フィードバック内容を転記、設計同期による変更は「なし」）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"GUIモックアップ修正エージェントの出力(Step6):"として記載する

### 完了条件
fs-impl-phase3-report.txtのGUIモックアップ修正エージェントの出力(Step6)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS である

### 状態判定
完了条件を満たしていればStep4（ユーザー確認依頼）へ戻る。ただしステータスが DONE_WITH_CONCERNS の場合は、Step4 へ戻る前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合 → 不足情報を補い `gui-mockup-fix-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 7: 設計同期（gui-design.md の修正が必要な場合）

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-sync (aide-powers skill)を activate して実行し、出力を"design-syncの出力(Step7):"として記載する。起動情報: 起因＝ユーザーフィードバックによるGUI設計変更／問題報告（フィードバック内容・現在のモックアップの状態・gui-design.md と期待値の乖離）／該当する設計ドキュメント＝gui-design.md／該当する実装ファイル＝GUIモックアップのファイルパス／タスクリスト＝impl-task-list.md。ユーザー承認は design-sync 内部で取得する。その記載内容から、次の項目を判断して記載する
　設計変更分類(Step7):（軽微（レイアウト微修正） / 中程度（画面構成変更） / 重大（画面追加・削除））
　設計同期ユーザー承認結果(Step7):
・設計同期完了後、更新された gui-design.md に基づきモックアップを修正するため、本スキルディレクトリの `gui-mockup-fix-prompt.md`（mode: fix。フィードバック内容と design-sync で更新された gui-design.md の変更内容を転記）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計同期後のモックアップ修正エージェントの出力(Step7):"として記載する

### 完了条件
fs-impl-phase3-report.txtに design-syncの出力(Step7)（設計変更分類(Step7)・設計同期ユーザー承認結果(Step7)）が記載され、設計同期後のモックアップ修正エージェントの出力(Step7)のステータスが DONE / DONE_WITH_CONCERNS である

### 状態判定
完了条件を満たしていればStep4（ユーザー確認依頼）へ戻る。ただし設計同期後のモックアップ修正エージェントの出力(Step7)のステータスが DONE_WITH_CONCERNS の場合は、Step4 へ戻る前に懸念事項をユーザーに報告し対応方針を確認する。

- NEEDS_CONTEXT の場合 → 不足情報を補い `gui-mockup-fix-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## 後処理

### 成果物
fs-impl-phase3-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。起動情報: ワークフロー種別＝実装／feature_name／完了フェーズ＝GUIモックアップ確認／コミット対象＝GUIモックアップコード（あれば）+ 更新された gui-design.md（あれば）+ impl-progress.md（＋更新時は doc-index.md）／コミットメッセージプレフィックス＝feat:。その記載内容から、次の項目を判断して記載する
　コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了（モックアップ確認済み） / B:スキップ（ユーザーがモックアップ作成せず） / C:GUI無し）
・次フェーズ遷移先(後処理):

### 完了条件
fs-impl-phase3-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と完了ステータス(後処理)が記載されている

### 状態判定
- phase-report-check(write) が FAIL を返した場合（記載項目漏れ検出）:
  - ユーザーに問題点（どの記載項目が不足しているか）を説明し、やり直しを提案する
  - 最終的な実行内容はユーザー指示に従う
- 完了条件を満たし、fs-impl-phase3-report.txtの"完了ステータス(後処理)"を確認したら `fs-impl-phase4-execution (aide-powers skill)` を activate して実行する

注: 実装ワークフローでは各フェーズが自フェーズの後処理でコミットする（各フェーズコミット型）。本フェーズも phase-report-check(write) で進捗ファイルを ✅ 完了 に更新した**後**に git-commit-workflow でコミットする。

# ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` を使い、ブラウザでイメージを表示してユーザーに確認すること。文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- GUIモックアップの静的レイアウトをブラウザ表示してユーザーに確認（Step4）
- 実アプリ起動前に画面イメージを視覚的に共有

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**前のフェーズスキル:**
- `fs-impl-phase2-preparation (aide-powers skill)` — 環境確認 + タスクリスト生成 + 試験書初期化

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-impl-phase4-execution (aide-powers skill)` — 実装ループ（coding-test-2review 経由）

**遷移ルール:**
- 通常完了（モックアップ作成・確認・コミットまで実施）→ **REQUIRED SUB-SKILL:** `fs-impl-phase4-execution (aide-powers skill)`
- GUI無し（Step1で gui-design.md が存在しない）→ ユーザーに通知 → **REQUIRED SUB-SKILL:** `fs-impl-phase4-execution (aide-powers skill)`
- スキップ（Step2でユーザーが「いいえ」を選択）→ ユーザーに通知 → **REQUIRED SUB-SKILL:** `fs-impl-phase4-execution (aide-powers skill)`

**Called by:**
- `fs-impl-phase2-preparation (aide-powers skill)` 完了後に自動遷移（REQUIRED SUB-SKILL チェーン）

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `design-sync (aide-powers skill)` — Step 7（フィードバックにより gui-design.md の修正が必要な場合）
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `phase-report-check (aide-powers skill: write)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（モックアップ確認完了後のコミット）
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**呼び出すエージェント:**
- `micro-impl-agent (aide-powers agent)`（implement モード）— GUIの静的配置を実装（Step3。`gui-mockup-impl-prompt.md` 経由）
- `micro-impl-agent (aide-powers agent)`（fix モード）— ユーザーフィードバック / 設計同期に基づくモックアップの修正（Step6 / Step7。`gui-mockup-fix-prompt.md` 経由）

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `gui-mockup-impl-prompt.md` — Step 3（mode: implement）
- `gui-mockup-fix-prompt.md` — Step 6 / Step 7（mode: fix）

**Input from caller:**
- `feature_name`: プロジェクト名

**Output to next phase:**
- なし（GUIモックアップコードのみ。次フェーズは impl-task-list.md に基づき実装ループを実行）

**Global rules:** `.aide/references/global-rules.md` を厳守
