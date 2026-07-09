# 実装ワークフローのフェーズスキル

`fs-impl-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れと多段階レビューパイプラインは
[`01-workflows/03-impl.md`](../01-workflows/03-impl.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 |
|---|---|---|
| 1 | `fs-impl-phase1-gate` | 設計書ゲート（HARD-GATE）。`doc-index.md` 全 ✅ 完了の機械的判定 |
| 2 | `fs-impl-phase2-preparation` | 開発環境確認・タスクリスト生成・動作確認試験書テンプレート |
| 3 | `fs-impl-phase3-gui-mockup` | GUI 静的配置のみの実装 → ユーザー確認（GUI なしはスキップ） |
| 4 | `fs-impl-phase4-execution` | ワークフローの核心。3エージェント体制でタスクごとに実装ループ |
| 5 | `fs-impl-phase5-final-check` | 設計網羅性 + 動作確認試験書整合 + pending-issues 確認 |
| 6 | `fs-impl-phase6-doc-generation` | README.md + docs/ 生成 |
| 7 | `fs-impl-phase7-final-check` | ワークフロー全体の最終整合性チェック |

## fs-impl-phase1-gate

### 責務

`doc-index.md` を機械的に読み、全設計書が `✅ 完了` または `⏭️ スキップ` 状態であるかを判定する。
PASS なら次フェーズへ、FAIL なら設計ワークフロー（または設計逆引きワークフロー）へ誘導する。
`.kiro/specs → .aide/specs` のマイグレーション確認も担当する。

### Iron Law の代表ルール

- 設計書ゲートを通過しないまま実装に進んではならない。「単純なタスクだから」「急ぎだから」は省略の根拠にならない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase2-preparation`（PASS 時）

### 主要な共通スキル呼び出し

`design-gate`（ゲート判定本体）、`progress-resume-check`、`rules-distribute`、`git-commit-workflow`。

## fs-impl-phase2-preparation

### 責務

`dev-environment.md` に従って開発環境を確認・構築し、設計書群から依存関係に基づく
`impl-task-list.md` を生成する。動作確認試験書テンプレート（`testing/manual-test-plan.md`）も
このフェーズで作成しておく。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase3-gui-mockup`（GUI あり）または `fs-impl-phase4-execution`（GUI なし）

### 主要な共通スキル呼び出し

`impl-task-planning`（タスク分解）、`task-orchestration`（必要に応じて）、
`doc-index-maintenance`、`git-commit-workflow`。

## fs-impl-phase3-gui-mockup

### 責務

GUI 設計を持つプロジェクトで、最初に **静的配置のみ** の GUI モックアップを実装してユーザーに確認してもらう。
ロジック配線は行わない。早期にユーザー期待とのずれを検出するための任意フェーズ。

### Iron Law の代表ルール

- 静的配置以外（イベントハンドラ・データバインド等）を絶対に実装しない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase4-execution`

### 主要な共通スキル呼び出し

`micro-impl-agent` への委譲、`git-commit-workflow`。

## fs-impl-phase4-execution

### 責務

実装ワークフローの**核心フェーズ**。`impl-task-list.md` の全タスクを 1 つずつ取り出し、
ホワイトリスト3エージェント（`micro-impl-agent` / `design-review-agent` / `code-review-agent`）で
実装ループを回す。1 タスクの1工程=1サブエージェントで工程内並列化（実装∥テスト実装 → テスト実行 →
設計準拠∥コード品質レビュー）を省略禁止で全工程実行する。
パイプライン全体は
[`multi-stage-code-review` 共通スキル](../03-common-skills/impl.md#multi-stage-code-review)
が司る。詳細はそちらを参照。
非プログラム成果物の場合は「実装 → 設計準拠レビューのみ」の 3 ステップで完了。

### Iron Law の代表ルール

- **NEVER SKIP A STEP WITHIN A TASK**: 1 タスク内のステップを省略禁止。
- **NEVER BATCH MULTIPLE TASKS**: 複数タスクを一括実装してまとめてレビューは禁止。
- **NEVER PROCEED WITHOUT BOTH REVIEWS PASSING**: 設計準拠と品質の両 PASS なしに次工程へ進めない。
- **PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP**: 工程チェック表を各ステップ完了時に名前付きエージェントが必ず更新（オーケストレーターによる代筆禁止）。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase5-final-check`

### 主要な共通スキル呼び出し

`multi-stage-code-review`（パイプライン全体）、`impl-coding-standards`（`micro-impl-agent` の規約）、
`code-quality-review` / `error-handling-review` / `import-review` / `test-review`（各レビュー観点）、
`design-sync`（実装と設計が乖離した場合）、`task-orchestration`、`git-commit-workflow`、
`pending-issues-management`。

## fs-impl-phase5-final-check

### 責務

全設計書項目について実装漏れを横断確認し、`testing/manual-test-plan.md` がタスクごとに
追記されきっているかを検証する。`pending-issues.md` の記録漏れもこのフェーズで確認する。

### Iron Law の代表ルール

- 抜き取りチェック禁止。全設計書項目を 1 件ずつ実装と突き合わせる。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase6-doc-generation`

### 主要な共通スキル呼び出し

`pending-issues-management`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-impl-phase6-doc-generation

### 責務

設計書群と実装結果から `README.md` と `docs/` を再構成して生成する。プロジェクトの「顔」となる
ドキュメントをワークフロー終了時にまとめて整える。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-impl-phase7-final-check`

### 主要な共通スキル呼び出し

`doc-index-maintenance`、`git-commit-workflow`。

## fs-impl-phase7-final-check

### 責務

実装ワークフローの最終フェーズスキル。`progress-final-checker` エージェントが全前フェーズの
署名（PHASE-SIG）を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。
PASS で完了、FAIL なら該当フェーズへ差し戻す。

### REQUIRED SUB-SKILL（次フェーズ）

なし（実装ワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`progress-final-checker`（エージェント）。
