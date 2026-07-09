# バグ修正ワークフローのフェーズスキル

`fs-bugfix-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れと「ヒアリング最優先」原則は
[`01-workflows/06-bugfix.md`](../01-workflows/06-bugfix.md) を参照。

バグ修正ワークフローは 3 フェーズで構成される。旧 7 フェーズ（バグ報告 / 原因分析 / 修正方針 /
修正設計 / 実装 / ドキュメント反映 / 最終チェック）は、責務のまとまりごとに 3 スキルへ統合された。

## 一覧

| 順序 | スキル名 | 役割 | 統合された旧フェーズ |
|---|---|---|---|
| 1 | `fs-bugfix-phase1-analysis` | バグ報告ヒアリング + 設計書ゲート + 再現性確認・原因特定 + 原因分析 + フォルダ統合判定 + 修正方針確定 | 旧Phase1〜3 |
| 2 | `fs-bugfix-phase2-impl` | 差分設計 + 差分設計QA + タスク計画 + 差分実装 + リグレッションテスト + 設計書反映 | 旧Phase4〜6 |
| 3 | `fs-bugfix-phase3-final-check` | ワークフロー実行整合性の最終チェック + コミット | 旧Phase7 |

設計書ゲートは Phase 1 の内部（バグ報告ヒアリングの後・原因分析の前）に位置し、
`design-gate` 共通スキルが判定する。

## fs-bugfix-phase1-analysis

### 責務

バグ修正ワークフローのエントリポイント。**まずユーザーに状況を聞く**。
旧 Phase1〜3（バグ報告 / 原因分析 / 修正方針）を 1 フェーズに統合し、次の流れを担う:

- バグ報告ヒアリング（症状・再現手順・期待動作・実際の動作・環境情報）→ `bug-report.md`
- 設計書ゲート（`design-gate` でハードゲート判定）
- 再現性確認・原因特定（再現性確認 + 仮実装による改善検証 + 原因候補特定）→ レポート記載
- 原因分析（コード調査・テスト実行・ログ分析による根本原因特定 + 影響範囲調査）→ `bug-analysis.md`
- 起因元ドキュメントフォルダの統合判定（`folder-merge-check`）
- 修正方針確定（原因 / 対策 / 対策種別の合意）→ `fix-plan.md`

before → after 形式の具体的なコード変更設計や実装コードの作成は次フェーズの担当であり、
このフェーズでは行わない。

### Iron Law の代表ルール

- **ヒアリング最優先**: 設計書チェック・テスト実行・コード調査より先に、まずユーザーの話を聞く。困っている人を待たせない。
- **担当外に踏み込まない**: before→after 形式のコード変更設計や実装コードを書いてはならない。
- 「症状を消すだけ」の対症療法ではなく根本原因の特定を必須とする。
- 原因 / 対策 / 対策種別の三つ組のユーザー合意なしに次フェーズへ進まない。

対策種別は次の 3 種に分類する:

- **コード修正**: 設計通りに動いていなかった
- **設計修正**: 設計が間違っていた
- **仕様変更扱い**: バグではなく仕様変更が妥当（変更ワークフローへ移行）

### REQUIRED SUB-SKILL（次フェーズ）

`fs-bugfix-phase2-impl`（コード修正 / 設計修正の場合）。
設計書ゲート FAIL の場合は設計逆引きワークフロー（`fs-reverse-phase1-program`）を提案し、
仕様変更扱いの場合は変更ワークフローへ移行する。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`user-profile-management`、
`design-gate`（バグ報告ヒアリング後 / 原因分析前）、`folder-merge-check`（起因元フォルダがある場合）、
`doc-index-maintenance`、`step-history-writer`。

### プロンプトテンプレート

`bugfix-reporter-prompt.md`、`bugfix-investigator-prompt.md`、`bugfix-analyzer-prompt.md`、
`bugfix-planner-prompt.md`、`bugfix-plan-reviewer-prompt.md`。

## fs-bugfix-phase2-impl

### 責務

旧 Phase4〜6（修正設計 / 実装 / ドキュメント反映）を 1 フェーズに統合し、次の流れを担う:

- 差分設計（`fix-design.md` を before → after 形式で作成。規模が大きい場合は索引 + 分割ファイル構成）
- 差分設計 QA（`design-qa-dispatch` 経由で `delta-design-qa-agent`（**常に呼ぶ**）と影響領域のQAレビューアーを呼ぶ）
- 差分タスクリスト作成（`delta-task-list.md` / `impl-process-checklist.md`）
- 差分実装（ホワイトリスト3エージェントによる多段階コードレビュー）
- 動作確認Step（バグ再現テストを含む動作確認試験 + リグレッションテスト〔既存テスト全実行〕を1回実施）
- 設計書反映（`fix-design.md` を `doc-sync` 経由で既存設計書にマージ + `history.md` 初期作成）

広範囲修正で複数の設計領域に影響する場合、影響を受ける各設計系共通スキルを **`mode: delta`** で
呼び出し、`delta-{領域名}.md` に差分を出力したうえで `fix-design.md` に統合する。

多段階コードレビューのパイプライン全体は
[`multi-stage-code-review` 共通スキル](../03-common-skills/impl.md#multi-stage-code-review)
が司る。詳細はそちらを参照。

### Iron Law の代表ルール

- **担当外に踏み込まない**: バグ報告ヒアリング・原因分析・修正方針策定（Phase 1 の範囲）に踏み込まない。
- **既存設計書の直接変更禁止**: 更新が必要な場合は `fix-design.md` に記載し、設計書反映で `doc-sync` 経由でマージする。
- **大規模設計時の分割対応**: `fix-design.md` を「メイン（索引）+ 分割ファイル群」構成で作成した場合、後続 Step は索引から分割ファイルを発見し、すべて読み込む（索引のみ読んで本文を読み忘れることは厳禁）。
- **NO TASK PROCEEDS WITHOUT FULL REVIEW AND ALL TESTS PASSING**: レビュー全 PASS とユニットテストパスなしに次タスクへ進めない。
- **NO TASK MERGING — EVER**: 差分タスクの統合実装を禁止。1 タスク = 1 回の `multi-stage-code-review` 呼び出し。
- **バグ再現テスト必須・リグレッションテストは動作確認Stepで1回**: バグ再現テストの作成は各実装タスクで欠かさない。既存テスト全実行（リグレッションテスト）は動作確認Step（Step9）で1回実施する。
- REJECTED 後の再 QA 省略禁止。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-bugfix-phase3-final-check`

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`user-profile-management`、
`design-qa-dispatch`、各設計領域の delta モード共通スキル（`user-requirements-definition` /
`system-requirements-definition` / `gui-design` / `object-design` / `ddd-modeling` /
`infra-interface-design` / `program-structure-design`）、`multi-stage-code-review`、
`impl-task-planning`、`impl-coding-standards`、`design-sync`、`doc-sync`、
`pending-issues-management`、`doc-index-maintenance`、`task-orchestration`、`step-history-writer`。

### プロンプトテンプレート

`bugfix-designer-prompt.md`（mode: design / fix）、`bugfix-task-planner-prompt.md`、
`bugfix-doc-syncer-prompt.md`。

## fs-bugfix-phase3-final-check

### 責務

旧 Phase7 相当。ワークフロー完了前の最終整合性チェックを担う。
全フェーズの実行整合性を独立した検証用 agent（`progress-final-checker`）に委譲して検査し、
PASS の場合はワークフロー全体の成果物を 1 回のコミットにまとめる。

検証では、Phase 1（`fs-bugfix-phase1-analysis-*`）と Phase 2（`fs-bugfix-phase2-impl-*`）の
セッションヒストリーを収集し、`progress-final-checker` に `total_phases: 2` と
`session_history_files`（配列）を渡す。

### Iron Law の代表ルール

- **検証は委譲**: 本スキル自体は実行整合性の判定を行わない。判定は `progress-final-checker` に委譲する。
- **進捗ファイルの直接更新禁止**: 自フェーズのステータス更新は検証用 agent が行う（`phase-compliance-check` の write を呼ばない）。
- **session-history-*.txt の確実な削除**: 検証 PASS 後に `.aide/tmp/session-history-fs-bugfix-phase*.txt` を全削除する。
- **FAIL 時のリセット範囲**: FAIL 時はユーザー承認の上で `problem_phase` 以降の進捗テーブル行のみを ⬜ 未着手 にリセットする。

### REQUIRED SUB-SKILL（次フェーズ）

なし（バグ修正ワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`user-profile-management`、
`doc-index-maintenance`、`git-commit-workflow`（バグ修正WF全体のコミット）、
`step-history-writer`、`progress-final-checker`（実行整合性の独立検証）。
