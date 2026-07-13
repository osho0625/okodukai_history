# リファクタリングワークフローのフェーズスキル

`fs-refactoring-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れとセーフティネット原則は
[`01-workflows/07-refactoring.md`](../01-workflows/07-refactoring.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 |
|---|---|---|
| 1 | `fs-refactoring-phase1-status` | 設計書ゲート + 既存テスト全実行でセーフティネット基準を記録 |
| 2 | `fs-refactoring-phase2-candidates` | 6 観点での候補特定 + 起因元フォルダ統合判定 |
| 3 | `fs-refactoring-phase3-plan` | ユーザーが日常言葉で before → after を理解できる形での方針合意 |
| 4 | `fs-refactoring-phase4-design` | `refactoring-design.md` 作成 + 差分設計 QA |
| 5 | `fs-refactoring-phase5-impl` | 実装 + 動作確認Stepでセーフティネット全実行（1回） |
| 6 | `fs-refactoring-phase6-doc` | 差分設計を既存設計書にマージ + コミット |
| 7 | `fs-refactoring-phase7-final-check` | ワークフロー全体の最終整合性チェック |

## fs-refactoring-phase1-status

### 責務

`design-gate` 共通スキルで設計書の完了状態を判定する。次に `dev-environment.md` 記載の
テスト実行コマンドで既存テストを全実行し、PASS 数 / FAIL 数 / スキップ数を
**セーフティネット基準値**として `refactoring-progress.md` に記録する。

ユーザーから具体的なリファクタリング要求がある場合は `refactoring-request.md` として引き継ぐ。

### Iron Law の代表ルール

- **NO REFACTORING WITHOUT SAFETY NET BASELINE**: セーフティネット基準なしに以降のフェーズへ進んではならない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase2-candidates`（要求がない場合）または `fs-refactoring-phase3-plan`（要求がある場合）

### 主要な共通スキル呼び出し

`design-gate`、`progress-resume-check`、`rules-distribute`、`git-commit-workflow`。

## fs-refactoring-phase2-candidates

### 責務

リファクタリング候補を 6 観点（重複コード / 巨大化 / 命名 / 結合度 / 依存方向 /
テスタビリティ等）で体系的に分析し、優先順位を付けて `refactoring-candidates.md` に整理する。
`folder-merge-check` で起因元ドキュメントフォルダの統合判定も行う。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase3-plan`

### 主要な共通スキル呼び出し

`folder-merge-check`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-refactoring-phase3-plan

### 責務

`refactoring-plan.md` を作成し、ユーザーが日常言葉で「何が、どう、どれくらい変わるか」を
イメージできる形で方針合意を得る。番号付き選択肢でユーザー合意を取る。

### Iron Law の代表ルール

- ユーザーが before → after をイメージできない状態で次フェーズへ進まない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase4-design`

### 主要な共通スキル呼び出し

`doc-index-maintenance`、`git-commit-workflow`。

## fs-refactoring-phase4-design

### 責務

`refactoring-design.md` を before → after 形式で作成する。`design-qa-dispatch` 経由で
`delta-design-qa-agent`（**常に呼ぶ**）と影響領域のQAレビューアーエージェントを呼ぶ。
リファクタリング差分設計の特殊検証項目として、外部振る舞いの保持・過去不具合修正の保持・
import ルール / レイヤー依存方向の遵守を検証する。

### Iron Law の代表ルール

- **NO CHANGE TO EXTERNAL BEHAVIOR**: 外部振る舞いを変える設計は FAIL。
- 過去不具合修正（`bugfix/` 配下）が保持されていない設計は FAIL。
- REJECTED 後の再 QA 省略禁止。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase5-impl`（QA APPROVED 後）

### 主要な共通スキル呼び出し

`design-qa-dispatch`、各設計領域の delta モード共通スキル、
`impl-task-planning`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-refactoring-phase5-impl

### 責務

差分タスクを 1 つずつ実装する。ホワイトリスト3エージェントによる多段階コードレビューを実施する。
パイプライン全体は
[`multi-stage-code-review` 共通スキル](../03-common-skills/impl.md#multi-stage-code-review)
が司る。詳細はそちらを参照。全タスク完了後の動作確認Stepで、セーフティネット（既存テスト全実行）を
**1 回実行**し、フェーズ1で記録した基準値と照合する。FAIL 数増加・スキップ数の不自然な変化があれば
実装ループへ差し戻して修正する。

### Iron Law の代表ルール

- **NO WORKFLOW COMPLETION WITHOUT SAFETY NET PASS**: 動作確認Stepでのセーフティネット PASS なしにワークフローを完了できない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase6-doc`

### 主要な共通スキル呼び出し

`multi-stage-code-review`、`impl-coding-standards`、
`code-quality-review` / `error-handling-review` / `import-review` / `test-review`、
`design-sync`、`task-orchestration`、`git-commit-workflow`。

## fs-refactoring-phase6-doc

### 責務

`refactoring-design.md` を `doc-sync` 共通スキル経由で既存設計書にマージし、`doc-index.md` を更新する。
完了後、最終整合性チェックフェーズへ遷移する。

### Iron Law の代表ルール

- ワークフロー完了時の `git-commit-workflow` 呼び出し省略禁止。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-refactoring-phase7-final-check`

### 主要な共通スキル呼び出し

`doc-sync`、`doc-index-maintenance`、`git-commit-workflow`、`pending-issues-management`。

## fs-refactoring-phase7-final-check

### 責務

リファクタリングワークフローの最終フェーズスキル。`progress-final-checker` エージェントが
全前フェーズの署名（PHASE-SIG）を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。
PASS で完了、FAIL なら該当フェーズへ差し戻す。

### REQUIRED SUB-SKILL（次フェーズ）

なし（リファクタリングワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`progress-final-checker`（エージェント）。
