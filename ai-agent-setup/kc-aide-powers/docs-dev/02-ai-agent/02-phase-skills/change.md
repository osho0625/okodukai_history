# 変更ワークフローのフェーズスキル

`fs-change-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れと QA / 実装パイプラインは
[`01-workflows/05-change.md`](../01-workflows/05-change.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 |
|---|---|---|
| 1 | `fs-change-phase1-analysis` | 分析・計画。設計書ゲート + 変更要件定義 + 影響範囲分析 + 対応方針策定 |
| 2 | `fs-change-phase2-impl` | 設計・実装・完了処理。差分設計 + 影響範囲再検討 + タスク計画 + 差分実装 + 設計書反映 |
| 3 | `fs-change-phase3-final-check` | 最終整合性チェック。ワークフロー実行整合性の独立検証 + コミット |

## fs-change-phase1-analysis

### 責務

変更ワークフローの分析・計画フェーズ。以下を 1 フェーズで実行する。

- `design-gate` 共通スキルで設計書の完了状態をハードゲートとして判定する。FAIL の場合は設計逆引きワークフロー（`fs-reverse-phase1-program`）へ誘導し、`pending-issues.md` に登録してワークフローを終了する。
- ユーザーから変更要求をヒアリングして `change-requirements.md` に構造化する。何を、なぜ、どこまで変えたいかを明確化する。
- 既存設計書 + 既存コード + 起因元ドキュメントを横断分析して影響範囲を `impact-analysis.md` に整理する。`git blame` で起因元ドキュメントフォルダを特定し、`folder-merge-check` 共通スキルで起因元フォルダの統合判定を行って `changes_dir` を確定する。
- OCP（Open-Closed Principle）の観点から対応方針を `approach.md` に決定する。拡張で対応するか、改変するか、改変が必要なら先にリファクタリングを提案するかを判断する。リファクタリング委譲時は `refactoring-request.md` を作成し、リファクタリングワークフローへ案内する。

### Iron Law の代表ルール

- 担当外に踏み込まない。before → after 形式の具体的なコード変更設計をしてはならない。実装コードを書いてはならない（差分設計・実装は Phase 2 の担当）。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-change-phase2-impl`（通常完了時）

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`、`user-profile-management`、`design-gate`、
`folder-merge-check`（起因元フォルダがある場合のみ）、`doc-index-maintenance`、`step-history-writer`。

## fs-change-phase2-impl

### 責務

変更ワークフローの設計・実装・完了処理フェーズ。以下を 1 フェーズで実行する。

- 影響を受ける設計領域を特定し、必要に応じて各設計系共通スキルを **`mode: delta`** で呼び出して `{changes_dir}/delta-{領域名}.md` に差分を出力させ、`delta-design.md`（規模が大きい場合は索引 + 分割ファイル構成）を before → after 形式で作成する。`design-qa-dispatch` 経由で `delta-design-qa-agent`（**常に呼ぶ**）と該当領域のQAレビューアーエージェント（`requirements-qa-agent` / `architecture-qa-agent` / `object-design-qa-agent` / `final-design-qa-agent`）を呼び、REJECTED の場合は修正 → 再QAを APPROVED になるまで繰り返す。
- 差分設計の詳細を踏まえて影響範囲を再精査する。シグネチャ変更を全件 Grep で追跡し、テスト対象機能（新規 / リグレッション）を特定して `impact-analysis.md`（更新版）を作成する。差分設計と影響分析をセットでユーザーに提示し最終合意を得る。
- 差分設計を依存関係に基づいてタスク分解し、`delta-task-list.md` と工程チェック表（`impl-process-checklist.md`）を作成する。
- 工程チェック表存在確認（HARD-GATE）の後、`multi-stage-code-review` 共通スキル経由で差分タスクを 1 つずつ実装する。1呼び出し = 1サブタスクを厳守し、ホワイトリストの3エージェント（`micro-impl-agent` / `design-review-agent` / `code-review-agent`）で工程内並列で回す。`PASS_WITH_DEVIATION` の場合は `design-sync` で設計同期する。全タスク完了後にリグレッションテストを実行し、ユーザーに動作検証を依頼する。
- `delta-design.md` を `doc-sync` 共通スキル経由で既存設計書にマージし、`history.md` を初期作成する。`pending-issues` の書き込み忘れチェックを行い、変更完了をユーザーに案内する。

### Iron Law の代表ルール

- 担当外に踏み込まない。変更要件のヒアリング・影響分析・対応方針の策定（Phase 1 の範囲）に踏み込んではならない。
- 既存設計書の直接変更禁止。差分設計フェーズ中は既存設計書を直接変更してはならない。反映は完了処理で `doc-sync` 経由で行う。
- 大規模設計時の分割対応。差分設計が大規模な場合は「メイン（索引）+ 分割ファイル群」構成で作成し、後続 Step（影響範囲再精査 / タスク計画 / doc-sync / design-sync）では索引から分割ファイルを全件読み込む。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-change-phase3-final-check`

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`、`user-profile-management`、
`design-qa-dispatch`、各設計領域の delta モード共通スキル（`ddd-modeling` / `object-design` /
`infra-interface-design` / `program-structure-design` / `gui-design` /
`user-requirements-definition` / `system-requirements-definition`）、
`multi-stage-code-review`、`impl-coding-standards`、`design-sync`、`doc-sync`、
`pending-issues-management`、`doc-index-maintenance`、`step-history-writer`。

## fs-change-phase3-final-check

### 責務

変更ワークフローの最終整合性チェックフェーズ。ワークフロー完了前に全フェーズの実行整合性を独立した検証用エージェントで検査する。

- `.aide/tmp/session-history-fs-change-phase*.txt` の全ファイルを収集し、`progress-final-checker` エージェントを起動してワークフロー実行整合性を検証する。
- 検証結果（PASS / FAIL / UNCERTAIN）に応じて処理を分岐する。PASS なら一時ファイル（`session-history-*.txt`）を削除する。FAIL ならユーザー承認の上で `problem_phase` 以降の進捗テーブル行を ⬜ 未着手 にリセットし、該当フェーズスキルに制御を戻す。
- 後処理で `git-commit-workflow` を呼び、変更ワークフロー全体の成果物をまとめて 1 回のコミットにする。

### Iron Law の代表ルール

- 検証は委譲。実行整合性の判定は本スキルではなく `progress-final-checker` エージェントに委譲する。
- 進捗ファイルの直接更新禁止。自フェーズのステータス更新は検証用エージェントが行う。本スキルから `phase-compliance-check (write)` を呼び出してはならない。
- `session-history-*.txt` の確実な削除（PASS 時）。残存させると次回ワークフロー実行時の誤判定の原因となる。

### REQUIRED SUB-SKILL（次フェーズ）

なし（変更ワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify のみ）、`user-profile-management`、
`progress-final-checker`（エージェント）、`git-commit-workflow`、`doc-index-maintenance`、
`step-history-writer`。
