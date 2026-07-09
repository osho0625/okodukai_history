# 差分設計

## 変更概要

変更WF（10フェーズ→3フェーズ）とバグ修正WF（7フェーズ→3フェーズ）のフェーズスキル統合。

## 新スキル構成

### 変更WF

| # | 新スキル名 | 表示名 | 統合元 |
|---|---|---|---|
| 1 | fs-change-phase1-analysis | 分析・計画 | 旧Phase 1〜4 |
| 2 | fs-change-phase2-impl | 設計・実装 | 旧Phase 5〜8 |
| 3 | fs-change-phase3-completion | 完了 | 旧Phase 9〜10 |

### バグ修正WF

| # | 新スキル名 | 表示名 | 統合元 |
|---|---|---|---|
| 1 | fs-bugfix-phase1-analysis | 分析・計画 | 旧Phase 1〜3 |
| 2 | fs-bugfix-phase2-impl | 設計・実装 | 旧Phase 4〜5 |
| 3 | fs-bugfix-phase3-completion | 完了 | 旧Phase 6〜7 |

## 各新スキルの Process 構成

### fs-change-phase1-analysis

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# 設計書ゲート（旧Phase 1）
Step 1: design-gate 実行
Step 2: PASS結果報告 / FAIL時はpending-issues登録してWF終了

# 変更要件定義（旧Phase 2）
Step 3: 設計ドキュメント読み込み（doc-index.md, user-requirements.md, program-structure.md）
Step 4: サブエージェント起動（change-requirements-prompt.md）→ ヒアリング → change-requirements.md 作成 → ユーザー合意

# 影響範囲分析（旧Phase 3）
Step 5: サブエージェント起動（change-impact-analyzer-prompt.md）→ impact-analysis.md 作成
Step 6: フォルダ統合判定（folder-merge-check）

# 対応方針策定（旧Phase 4）
Step 7: サブエージェント起動（change-approach-planner-prompt.md）→ OCP検討 → approach.md 作成 → ユーザー合意
Step 8: リファクタリング委譲判定（refactoring-request.md 作成時はWF終了）

後処理:
- doc-index-maintenance
- phase-compliance-check (write)
- 次フェーズ遷移 → fs-change-phase2-impl

成果物: change-requirements.md, impact-analysis.md, approach.md (+ refactoring-request.md if applicable)

### fs-change-phase2-impl

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# 差分設計（旧Phase 5）
Step 1: 設計系共通スキル呼び出し判定
Step 2: サブエージェント起動（change-delta-designer-prompt.md）→ delta-design.md 作成
Step 3: ユーザー承認
Step 4: QAレビュー（design-qa-dispatch）→ APPROVED まで fix ループ

# 影響範囲再検討（旧Phase 6）
Step 5: サブエージェント起動（change-impact-reviewer-prompt.md）→ impact-analysis.md 更新 → ユーザー合意

# タスク計画（旧Phase 7）
Step 6: impl-task-planning 参照
Step 7: サブエージェント起動（change-task-planner-prompt.md）→ delta-task-list.md 作成 → ユーザー合意

# 差分実装（旧Phase 8）
Step 8: 工程チェック表存在確認（HARD-GATE）
Step 9: タスクリスト読み込み
Step 10: タスク実行ループ（multi-stage-code-review 経由、各タスクごとに実装→レビュー→テスト）

後処理:
- doc-index-maintenance
- phase-compliance-check (write)
- 次フェーズ遷移 → fs-change-phase3-completion

成果物: delta-design.md, impact-analysis.md（更新版）, delta-task-list.md, impl-process-checklist.md, 実装コード

### fs-change-phase3-completion

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# 設計書反映・完了処理（旧Phase 9）
Step 1: doc-sync → 設計書反映
Step 2: pending-issues 書き込み忘れチェック
Step 3: 変更完了の案内（サマリー提示）

# 進捗ファイル完全性チェック（旧Phase 10）
Step 4: セッションヒストリー取得
Step 5: progress-final-checker agent 呼び出し
Step 6: 検証結果処理（PASS/FAIL/UNCERTAIN）

後処理:
- doc-index-maintenance
- phase-compliance-check (write)
- git-commit-workflow

成果物: history.md

### fs-bugfix-phase1-analysis

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# バグ報告ヒアリング（旧Phase 1）
Step 1: 作業ディレクトリ準備
Step 2: サブエージェント起動（bugfix-reporter-prompt.md）→ bug-report.md 作成 → ユーザー合意

# 原因分析（旧Phase 2）
Step 3: design-gate 実行（HARD-GATE）
Step 4: サブエージェント起動（bugfix-analyzer-prompt.md）→ 現状把握 + 原因分析 → bug-analysis.md 作成 → ユーザー合意
Step 5: フォルダ統合判定（folder-merge-check）

# 修正方針確定（旧Phase 3）
Step 6: サブエージェント起動（bugfix-planner-prompt.md）→ fix-plan.md 作成 → ユーザー合意（原因・対策・対策種別の3点セット）

後処理:
- doc-index-maintenance
- phase-compliance-check (write)
- 次フェーズ遷移 → fs-bugfix-phase2-impl

成果物: bug-report.md, bug-analysis.md, fix-plan.md

### fs-bugfix-phase2-impl

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# 差分設計（旧Phase 4）
Step 1: 設計系共通スキル呼び出し判定
Step 2: サブエージェント起動（bugfix-designer-prompt.md）→ fix-design.md 作成
Step 3: ユーザー承認
Step 4: QAレビュー（design-qa-dispatch）→ APPROVED まで fix ループ
Step 5: タスク分解（impl-task-planning）

# 実装（旧Phase 5）
Step 6: 工程チェック表存在確認（HARD-GATE）
Step 7: タスクリスト読み込み
Step 8: タスク実行ループ（multi-stage-code-review 経由）

後処理:
- phase-compliance-check (write)
- 次フェーズ遷移 → fs-bugfix-phase3-completion

成果物: fix-design.md, impl-process-checklist.md, 実装コード

### fs-bugfix-phase3-completion

前処理:
- progress-resume-check
- phase-compliance-check (verify)

# ドキュメント反映・完了処理（旧Phase 6）
Step 1: doc-sync → 設計書反映
Step 2: pending-issues 書き込み忘れチェック
Step 3: バグ修正完了の案内（サマリー提示）

# 進捗ファイル完全性チェック（旧Phase 7）
Step 4: セッションヒストリー取得
Step 5: progress-final-checker agent 呼び出し
Step 6: 検証結果処理（PASS/FAIL/UNCERTAIN）

後処理:
- doc-index-maintenance
- phase-compliance-check (write)
- git-commit-workflow

成果物: history.md

## 参照ファイルの更新

### progress-file-format.md §7.5 変更WF

Before:
| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1〜10 | （10フェーズ） | fs-change-phase1-status 〜 fs-change-phase10-final-check | ... |

After:
| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | fs-change-phase1-analysis | 分析・計画 |
| 2 | Phase 2 | fs-change-phase2-impl | 設計・実装 |
| 3 | Phase 3 | fs-change-phase3-completion | 完了 |

### progress-file-format.md §7.6 バグ修正WF

Before:
| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1〜7 | （7フェーズ） | fs-bugfix-phase1-report 〜 fs-bugfix-phase7-final-check | ... |

After:
| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | fs-bugfix-phase1-analysis | 分析・計画 |
| 2 | Phase 2 | fs-bugfix-phase2-impl | 設計・実装 |
| 3 | Phase 3 | fs-bugfix-phase3-completion | 完了 |

### using-aide-powers/SKILL.md

エントリポイントスキル名の更新:
- 変更WF: fs-change-phase1-status → fs-change-phase1-analysis
- バグ修正WF: fs-bugfix-phase1-report → fs-bugfix-phase1-analysis

### using-aide-powers/references/global-rules.md

ルーティングテーブルのスキル名更新:
- fs-change-phase1-status → fs-change-phase1-analysis
- fs-bugfix-phase1-report → fs-bugfix-phase1-analysis

### .kiro/steering/aide-powers-global-rules.md

同上のスキル名更新。

## 削除対象

変更WF旧スキル（10ディレクトリ）:
- skills/fs-change-phase1-status/
- skills/fs-change-phase2-requirements/
- skills/fs-change-phase3-impact/
- skills/fs-change-phase4-approach/
- skills/fs-change-phase5-delta-design/
- skills/fs-change-phase6-impact-review/
- skills/fs-change-phase7-task-planning/
- skills/fs-change-phase8-impl/
- skills/fs-change-phase9-completion/
- skills/fs-change-phase10-final-check/

バグ修正WF旧スキル（7ディレクトリ）:
- skills/fs-bugfix-phase1-report/
- skills/fs-bugfix-phase2-analysis/
- skills/fs-bugfix-phase3-plan/
- skills/fs-bugfix-phase4-design/
- skills/fs-bugfix-phase5-impl/
- skills/fs-bugfix-phase6-doc/
- skills/fs-bugfix-phase7-final-check/

## 更新が必要な設計資料

実装後に更新すること:
- progress-file-format.md（§7.5, §7.6）
- using-aide-powers/SKILL.md
- using-aide-powers/references/global-rules.md
- .kiro/steering/aide-powers-global-rules.md


## セッション履歴Step単位書き出し（REQ-C-006）

### 概要

従来の「セッション履歴全文を1ファイルにエクスポート」方式を廃止し、各Step完了時に該当Stepのやり取りだけを個別ファイルに書き出す方式に変更する。

### ファイル命名規則

```
.aide/tmp/session-history-{フェーズスキル名}-前処理.txt
.aide/tmp/session-history-{フェーズスキル名}-step{N}.txt
.aide/tmp/session-history-{フェーズスキル名}-後処理.txt
```

例（変更WF Phase1の場合）:
```
.aide/tmp/session-history-fs-change-phase1-analysis-前処理.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step1.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step2.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step3.txt
...
.aide/tmp/session-history-fs-change-phase1-analysis-後処理.txt
```

### 書き出しタイミング

- 前処理完了時: 前処理に関するやり取りを書き出す
- 各Step完了時: そのStepに関するやり取りを書き出す
- 後処理は書き出し不要（後処理自体がcompliance-checkerへの渡しなので）

### compliance-checker への渡し方

後処理で compliance-checker を呼び出す際:
- session_history_file パラメータを session_history_files（複数形）に変更
- 全Step履歴ファイルのパス一覧を配列で渡す

### 削除タイミング

最終フェーズ（final-check）でのチェック後、すべてOK（PASS）になったタイミングで全履歴ファイルを削除する。
- FAIL の場合は削除しない（調査用に残す）

### 適用範囲

全7WFの全フェーズスキルに適用する（変更WF・バグ修正WFに限らない）。

### phase-compliance-check スキルの変更

Before:
- session_history_file: 単一ファイルパス

After:
- session_history_files: ファイルパスの配列
- compliance-checker は各ファイルを順に読み込んで検証する

### 影響を受けるファイル（追加）

| # | ファイル | 変更内容 |
|---|---|---|
| 11 | skills/phase-compliance-check/SKILL.md | session_history_files パラメータ対応 |
| 12 | agents/compliance-checker.md | 複数ファイル読み込み対応 |
| 13 | 全フェーズスキル（全7WF） | 各Step完了時の履歴書き出し処理追加 |
| 14 | 最終フェーズスキル（*-final-check） | PASS時の履歴ファイル一括削除処理追加 |
