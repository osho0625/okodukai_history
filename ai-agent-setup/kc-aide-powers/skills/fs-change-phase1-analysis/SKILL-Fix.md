---
name: fs-change-phase1-analysis
description: "Use when starting the change workflow. Performs design gate, requirements definition, impact analysis, and approach planning."
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| change-requirements.md | {changes_dir}/change-requirements.md | 構造化された変更要求定義ドキュメント |
| impact-analysis.md | {changes_dir}/impact-analysis.md | アクター視点・プログラム構成視点の影響範囲分析結果 |
| approach.md | {changes_dir}/approach.md | 対応方針書（OCP検討結果、変更方針の詳細） |
| refactoring-request.md | {changes_dir}/refactoring-request.md | リファクタリング依頼書（リファクタリング委譲時のみ） |
| fs-change-phase1-report.txt | .aide/tmp/fs-change-phase1-report.txt | fs-change-phase1-analysisの成果物 |


# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル、サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-change-phase1-result.txt以外のファイルの書き出しは禁止。

# Process

## 前処理

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・成果物出力先フォルダ
・現在のPhase
・現在のStep
・progress-resume-check (aide-powers skill)を実行して得た内容で次の項目を書き出す
  再開ポイント：
  再開ポイント判定理由:
  引継ぎファイルがあれば内容の要約:
・phase-compliance-check (aide-powers skill: verify)を実行して得た内容で次の項目を書き出す
　前のフェーズ:
  前のフェーズ完了日時:
  署名チェック結果:
・user-profile-management (aide-powers skill: apply)を実行して得た内容で次の項目を書き出す
　ユーザーのドメイン知識レベル：
　ユーザーのプログラムスキルレベル：
　やり取り上の注意点要約：

### 状態判定
fs-change-phase1-report.txtの再開ポイントを確認しStep1へ遷移する

## Step 1: HARD-GATE: 設計書ゲート

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase
・現在のStep
・design-gate (aide-powers skill)を実行して得た内容で次の項目を書き出す
　必須ドキュメントが存在するか：
　設計逆引きが必要か：
　必須ドキュメントが存在しないのに設計逆引きしない理由：
　pindins-issues.mdに追記した項目：

### 状態判定
fs-change-phase1-report.txtの"設計逆引きが必要か"の内容が必要の場合、ワークフローを終了。不要の場合、Step2へ遷移する

## Step 2: 変更要件の作成

### 成果物
fs-change-phase1-report.txt

以下を満たすこと
・現在のPhase
・現在のStep
・サブエージェント実行前に、ユーザーの変更要求内容から changes_dir を確定し、出力ファイルパスを書き出す
　changes_dir の命名規則: `.aide/specs/{feature_name}/changes/{YYYYMMDDHHmm}-{対処概略}(-{番号})`
　出力ファイルパス：（例: {changes_dir}/change-requirements.md）
・本スキルディレクトリの `change-requirements-prompt.md`のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"変更要件作成エージェントの出力:"として記載

### 完了条件
fs-change-phase1-report.txtの変更要件作成エージェントの出力の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、成果物フォルダにchange-requirements.mdがファイルサイズ1byte以上で存在する

### 状態判定
完了条件を満たしていればStep3へ遷移する。fs-change-phase1-report.txtの変更要件作成エージェントの出力のステータスがNEEDS_CONTEXT の場合、不足情報を提供して再ディスパッチ。BLOCKED の場合、ユーザーに報告し対応方針を確認する

