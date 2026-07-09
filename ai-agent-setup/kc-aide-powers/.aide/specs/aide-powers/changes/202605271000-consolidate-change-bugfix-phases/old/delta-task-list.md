# 差分タスクリスト

> 本変更WFは aide-powers フレームワーク自体のメタ開発。実装単位は SKILL.md / プロンプトテンプレート / エージェント定義 / 参照ドキュメント等のファイルである。したがって基本単位は「1ファイル=1タスク」。2層構造は「親タスク=論理的なまとまり（カテゴリ）、サブタスク=個別ファイル」として適用する。リグレッションテストは自動テストが存在しないため「実際にWFを実行して動作確認する手動検証タスク（D-R-XXX）」として表現する。

## 依存関係グラフ

```
D-001 (step-history-writer/SKILL.md)  ※全フェーズスキルが参照する基盤
  ├─→ D-002〜D-004   (変更WF新スキル本体)
  ├─→ D-013〜D-015   (バグ修正WF新スキル本体)
  └─→ D-023〜D-057   (REQ-C-006: 既存35フェーズスキルへの step-history-writer 追加)

D-002 (change-p1 SKILL) ─→ D-005〜D-008 (change-p1 プロンプト4種)
D-003 (change-p2 SKILL) ─→ D-009〜D-012 (change-p2 プロンプト4種)
D-013 (bugfix-p1 SKILL) ─→ D-016〜D-019 (bugfix-p1 プロンプト4種)
D-014 (bugfix-p2 SKILL) ─→ D-020〜D-022 (bugfix-p2 プロンプト3種)

新スキル名確定（D-002,003,004,013,014,015）
  └─→ D-067〜D-082 (エントリポイント名・フェーズ数の参照更新)
  └─→ D-068 完了 ─→ D-084 (steering を rules-distribute で再生成)
  └─→ D-086〜D-096 (共通スキル11ファイルの参照更新漏れの補完：削除前提)

REQ-C-007 mode:delta（SKILL→プロンプトの順で逐次）
  D-058 → D-059   (object-design SKILL → prompt)
  D-060 → D-061   (gui-design SKILL → prompt)
  D-062 → D-063   (ddd-modeling SKILL → prompt)
  D-054 → D-064   (fs-refactoring-phase4-design SKILL[REQ-C-006+007] → refactoring-designer-prompt)
  D-065, D-066    (tray-app-planning system-architecture ×2：独立)

全新規作成（D-001〜D-022）+ 全参照更新（D-067〜D-084, D-086〜D-096）完了
  └─→ D-085 (旧17ディレクトリ一括削除：参照切れ防止のため最後に実行)

リグレッションテスト D-R-001〜D-R-023：全実装タスク（D-001〜D-085）完了後に手動WF実行で検証
```

依存原則:
1. step-history-writer（D-001）は全フェーズスキルから参照されるため最初に作成。
2. 新フェーズスキル本体 → 参照するプロンプトテンプレートの順。
3. 新規作成・参照更新の完了後に旧ディレクトリ削除（先に削除すると参照切れ）。
4. 同一ファイルを変更するタスクは作らない（ファイル競合回避。1ファイル=1タスク厳守）。
5. REQ-C-008/009 は新フェーズスキル本体（D-003/D-014）とそのプロンプトに内包されるため独立タスクなし。
6. REQ-C-009 受領側4ファイル（multi-stage-code-review/SKILL.md + 3エージェント定義）は impact-analysis で「反映済み（確認済み）」のため実装タスクなし。D-R-022 で副作用を検証する。

## タスク一覧

> **凡例** — 種別: 新規作成 / 既存変更 / 削除。各タスク 1ファイル（削除のみ例外でディレクトリ一括）。設計参照は delta-design.md 本体または付属ファイル名 + 該当セクション。

### カテゴリA: 共通基盤スキル（REQ-C-006 の前提）

#### D-001: step-history-writer 共通スキル新規作成
- 種別: 新規作成
- 依存先: なし
- 対象ファイル: `skills/step-history-writer/SKILL.md`
- 設計参照: delta-design-step-history-writer.md「SKILL.md 全文」
- 作業内容・観点: Step完了時にセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す共通スキルを作成。入力パラメータ（skill_name / step_id / step_title）・出力フォーマット・エラー時動作（書き込み失敗でフェーズ中断しない）・Integration を漏れなく記述。全7WFの全フェーズスキルおよび progress-final-checker が依存する基盤のため最優先で作成する。

### カテゴリB: 変更WF 新フェーズスキル本体（REQ-C-001, REQ-C-008, REQ-C-009 内包）

#### D-002: fs-change-phase1-analysis 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-change-phase1-analysis/SKILL.md`
- 設計参照: delta-design-fs-change-phase1-analysis.md「SKILL.md 全文」
- 作業内容・観点: 旧Phase1〜4（設計書ゲート/要件定義/影響分析/対応方針）を統合。前処理・後処理はフェーズ全体で1回。Step通し番号化と `#` 見出し区画化。全Step末尾に step-history-writer 呼び出しを明記。次フェーズ遷移先は `fs-change-phase2-impl`。

#### D-003: fs-change-phase2-impl 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-change-phase2-impl/SKILL.md`
- 設計参照: delta-design-fs-change-phase2-impl.md「SKILL.md 全文」 + delta-design.md「REQ-C-007/008/009」
- 作業内容・観点: 旧Phase5〜9（差分設計/影響再検討/タスク計画/実装/完了処理）を統合（Step1〜18）。**REQ-C-008**: Iron Laws「大規模設計時の分割対応」、成果物テーブル（delta-design-{name}.md）、Step3/6/8/16 の索引判定+全Read。**REQ-C-009**: Step12 のサブエージェント呼び出し基本原則・10項目ペイロードテンプレート・呼び出し前粒度チェックリスト・柔軟ルール例外・理由。**REQ-C-007**: Step1 設計系共通スキルを `mode: delta` で呼び出し。設計系共通スキルへの遷移先名整合。

#### D-004: fs-change-phase3-final-check 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-change-phase3-final-check/SKILL.md`
- 設計参照: delta-design-fs-change-phase3-final-check.md「SKILL.md 全文」
- 作業内容・観点: 旧Phase10相当。前フェーズ参照を `fs-change-phase2-impl` に。Step2 で progress-final-checker に `total_phases: 2`・`session_history_files`（配列）を渡す。session-history 収集対象は `fs-change-phase1-analysis-*` / `fs-change-phase2-impl-*`。後処理で git-commit-workflow（Docs:フッター）。

### カテゴリC: 変更WF Phase1 プロンプトテンプレート（4ファイル）

#### D-005: change-requirements-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-002
- 対象ファイル: `skills/fs-change-phase1-analysis/change-requirements-prompt.md`
- 設計参照: delta-design-fs-change-phase1-prompts.md「change-requirements-prompt.md」
- 作業内容・観点: mode: phase1 / fix の2モード。ヒアリング手順・ドキュメント構成テンプレート・完了条件自己チェック・Red Flags・Common Rationalizations を移植。

#### D-006: change-impact-analyzer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-002
- 対象ファイル: `skills/fs-change-phase1-analysis/change-impact-analyzer-prompt.md`
- 設計参照: delta-design-fs-change-phase1-prompts.md「change-impact-analyzer-prompt.md」
- 作業内容・観点: 軽量影響分析。git blame による起因元フォルダ特定の検証ステップ・completeness_check の PASS/FAIL 報告を移植。

#### D-007: change-approach-planner-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-002
- 対象ファイル: `skills/fs-change-phase1-analysis/change-approach-planner-prompt.md`
- 設計参照: delta-design-fs-change-phase1-prompts.md「change-approach-planner-prompt.md」
- 作業内容・観点: mode: approach / fix。OCP検討・リファクタリング提案ルール・approach.md/refactoring-request.md フォーマット・パターンA/B判定を移植。

#### D-008: change-approach-reviewer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-002
- 対象ファイル: `skills/fs-change-phase1-analysis/change-approach-reviewer-prompt.md`
- 設計参照: delta-design-fs-change-phase1-prompts.md「change-approach-reviewer-prompt.md」
- 作業内容・観点: approach.md 品質レビュー（8チェック項目）。PASS/FAIL 報告。新規追加プロンプト。

### カテゴリD: 変更WF Phase2 プロンプトテンプレート（4ファイル, REQ-C-008内包）

#### D-009: change-delta-designer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-003
- 対象ファイル: `skills/fs-change-phase2-impl/change-delta-designer-prompt.md`
- 設計参照: delta-design-fs-change-phase2-prompts.md「change-delta-designer-prompt.md」
- 作業内容・観点: mode: phase4 / fix。**REQ-C-008**: 分割判断・索引フォーマット例・分割ファイル冒頭フォーマット例・分割関連 Red Flags/Common Rationalizations・fix モードの分割ファイル Read/Edit。シグネチャ変更スコープ外 Grep 義務。

#### D-010: change-impact-reviewer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-003
- 対象ファイル: `skills/fs-change-phase2-impl/change-impact-reviewer-prompt.md`
- 設計参照: delta-design-fs-change-phase2-prompts.md「change-impact-reviewer-prompt.md」
- 作業内容・観点: **REQ-C-008**: 分割ファイル全Read + シグネチャ変更全件追跡を合算で実施 + 自己チェック C7。既存要件矛盾確認・テスト対象機能特定。

#### D-011: change-task-planner-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-003
- 対象ファイル: `skills/fs-change-phase2-impl/change-task-planner-prompt.md`
- 設計参照: delta-design-fs-change-phase2-prompts.md「change-task-planner-prompt.md」
- 作業内容・観点: **REQ-C-008**: 分割ファイル全Read + 網羅性チェック合算。delta-task-list.md / impl-process-checklist.md 生成。リグレッションテスト必須。

#### D-012: change-doc-syncer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-003
- 対象ファイル: `skills/fs-change-phase2-impl/change-doc-syncer-prompt.md`
- 設計参照: delta-design-fs-change-phase2-prompts.md「change-doc-syncer-prompt.md」
- 作業内容・観点: **REQ-C-008**: 分割索引判定 → 分割ファイル全Read（読み忘れ厳禁）。既存設計書マージ・history.md 初期作成。

### カテゴリE: バグ修正WF 新フェーズスキル本体（REQ-C-002, REQ-C-008, REQ-C-009 内包）

#### D-013: fs-bugfix-phase1-analysis 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-bugfix-phase1-analysis/SKILL.md`
- 設計参照: delta-design-fs-bugfix-phase1-analysis.md「SKILL.md 全文」
- 作業内容・観点: 旧Phase1〜3（バグ報告/原因分析/修正方針）を統合（Step1〜10）。Iron Laws に「ヒアリング最優先」。前処理・後処理1回。全Step末尾に step-history-writer。次フェーズ遷移先は `fs-bugfix-phase2-impl`。

#### D-014: fs-bugfix-phase2-impl 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-bugfix-phase2-impl/SKILL.md`
- 設計参照: delta-design-fs-bugfix-phase2-impl.md「SKILL.md 全文」 + delta-design.md「REQ-C-007/008/009」
- 作業内容・観点: 旧Phase4〜6（修正設計/実装/ドキュメント反映）を統合（Step1〜16）。**REQ-C-008**: Iron Laws 分割対応、成果物テーブル（fix-design-{name}.md）、Step3/6/14 の索引判定+全Read。**REQ-C-009**: Step10 の呼び出し基本原則・10項目ペイロード・粒度チェックリスト・柔軟ルール例外・理由。**REQ-C-007**: Step1 設計系共通スキルを `mode: delta`。

#### D-015: fs-bugfix-phase3-final-check 本体新規作成
- 種別: 新規作成
- 依存先: D-001
- 対象ファイル: `skills/fs-bugfix-phase3-final-check/SKILL.md`
- 設計参照: delta-design-fs-bugfix-phase3-final-check.md「SKILL.md 全文」
- 作業内容・観点: 旧Phase7相当。前フェーズ参照を `fs-bugfix-phase2-impl` に。Step2 で progress-final-checker に `total_phases: 2`・`session_history_files`（配列）。session-history 収集対象は `fs-bugfix-phase1-analysis-*` / `fs-bugfix-phase2-impl-*`。後処理で git-commit-workflow。

### カテゴリF: バグ修正WF Phase1 プロンプトテンプレート（4ファイル）

#### D-016: bugfix-reporter-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-013
- 対象ファイル: `skills/fs-bugfix-phase1-analysis/bugfix-reporter-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase1-prompts.md「bugfix-reporter-prompt.md 全文」
- 作業内容・観点: バグ報告ヒアリング。最重要原則（まず聞く・質問攻めにしない・原因推測禁止）・bug-report.md フォーマットを移植。

#### D-017: bugfix-analyzer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-013
- 対象ファイル: `skills/fs-bugfix-phase1-analysis/bugfix-analyzer-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase1-prompts.md「bugfix-analyzer-prompt.md 全文」
- 作業内容・観点: 原因分析。現状把握（設計書読込・既存テスト全実行）・原因箇所特定・git blame 起因元検証・bug-analysis.md フォーマットを移植。

#### D-018: bugfix-planner-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-013
- 対象ファイル: `skills/fs-bugfix-phase1-analysis/bugfix-planner-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase1-prompts.md「bugfix-planner-prompt.md 全文」
- 作業内容・観点: 修正方針確定。根本対策/暫定対策の自己判定フロー・副作用リスク分析・リグレッションテスト方針・fix-plan.md フォーマットを移植。

#### D-019: bugfix-plan-reviewer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-013
- 対象ファイル: `skills/fs-bugfix-phase1-analysis/bugfix-plan-reviewer-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase1-prompts.md「bugfix-plan-reviewer-prompt.md 全文」
- 作業内容・観点: fix-plan.md 品質レビュー（6チェック項目）。PASS/FAIL 報告。

### カテゴリG: バグ修正WF Phase2 プロンプトテンプレート（3ファイル, REQ-C-008内包）

#### D-020: bugfix-designer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-014
- 対象ファイル: `skills/fs-bugfix-phase2-impl/bugfix-designer-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase2-prompts.md「bugfix-designer-prompt.md」
- 作業内容・観点: mode: design / fix。**REQ-C-008**: 分割判断・索引フォーマット・fix モードの分割ファイル Read/Edit。リグレッションテスト設計必須・before→after・変更理由。

#### D-021: bugfix-task-planner-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-014
- 対象ファイル: `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase2-prompts.md「bugfix-task-planner-prompt.md」
- 作業内容・観点: **REQ-C-008**: 分割ファイル全Read + 網羅性チェック合算。対策種別引き継ぎ・リグレッションテスト2系統（既存カバー/追加必要）・delta-task-list.md / impl-process-checklist.md 生成。

#### D-022: bugfix-doc-syncer-prompt.md 新規作成
- 種別: 新規作成
- 依存先: D-014
- 対象ファイル: `skills/fs-bugfix-phase2-impl/bugfix-doc-syncer-prompt.md`
- 設計参照: delta-design-fs-bugfix-phase2-prompts.md「bugfix-doc-syncer-prompt.md」
- 作業内容・観点: **REQ-C-008**: 分割索引判定 → 分割ファイル全Read。既存設計書マージ（after で書き換え）・history.md 初期作成（対策種別記載必須）。

### カテゴリH: REQ-C-006 既存フェーズスキルへの step-history-writer 追加（他5WF・35ファイル）

> 変更WF/バグ修正WFの6新スキル（D-002〜D-004, D-013〜D-015）は本体作成時に step-history-writer を内包するため、ここでは対象外。全41フェーズスキルのうち残り35件を対象とする。各タスクは該当 SKILL.md の Process 全Step末尾に step-history-writer 呼び出しを追記し、Process 直前に「step-history-writer について」説明セクションを追加する既存変更。設計参照は delta-design.md「REQ-C-006: step-history-writer の記載ルール（全新スキル共通）」+ delta-design-step-history-writer.md。

#### 企画WF（4ファイル）

#### D-023: fs-planning-phase1-intake-and-init に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-planning-phase1-intake-and-init/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 全Step末尾 + 前処理/後処理に step-history-writer 呼び出しを追記。skill_name は当該スキル名。説明セクションを Process 直前に追加。

#### D-024: fs-planning-phase2-explore に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-planning-phase2-explore/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-025: fs-planning-phase3-finalize に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-planning-phase3-finalize/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-026: fs-planning-phase4-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-planning-phase4-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため、Iron Laws の session-history 削除規定との整合に注意して追記。

#### 設計WF（11ファイル）

#### D-027: fs-design-phase1-user-req に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase1-user-req/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-028: fs-design-phase2-system-req に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase2-system-req/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-029: fs-design-phase3-dev-plan に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase3-dev-plan/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-030: fs-design-phase4-architecture に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase4-architecture/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-031: fs-design-phase5-gui に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase5-gui/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-032: fs-design-phase6-usecase に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase6-usecase/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-033: fs-design-phase7-ddd に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase7-ddd/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-034: fs-design-phase8-object に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase8-object/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-035: fs-design-phase9-infra に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase9-infra/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-036: fs-design-phase10-program に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase10-program/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-037: fs-design-phase11-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-design-phase11-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため session-history 削除規定との整合に注意。

#### 実装WF（7ファイル）

#### D-038: fs-impl-phase1-gate に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase1-gate/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 全Step末尾 + 前処理/後処理に追記。

#### D-039: fs-impl-phase2-preparation に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase2-preparation/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-040: fs-impl-phase3-gui-mockup に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase3-gui-mockup/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-041: fs-impl-phase4-execution に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase4-execution/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: タスク実装ループ Step では各タスクごとではなくレベル/Step完了時に1回記録する旨に整合させる。

#### D-042: fs-impl-phase5-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase5-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため session-history 削除規定との整合に注意。

#### D-043: fs-impl-phase6-doc-generation に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase6-doc-generation/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-044: fs-impl-phase7-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-impl-phase7-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため session-history 削除規定との整合に注意。

#### 設計逆引きWF（6ファイル）

#### D-045: fs-reverse-phase1-program に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase1-program/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-046: fs-reverse-phase2-dev-env に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase2-dev-env/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-047: fs-reverse-phase3-system-req に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase3-system-req/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-048: fs-reverse-phase4-user-req に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase4-user-req/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-049: fs-reverse-phase5-optional-phases に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase5-optional-phases/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-050: fs-reverse-phase6-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-reverse-phase6-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため session-history 削除規定との整合に注意。

#### リファクタリングWF（7ファイル）

#### D-051: fs-refactoring-phase1-status に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase1-status/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-052: fs-refactoring-phase2-candidates に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase2-candidates/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-053: fs-refactoring-phase3-plan に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase3-plan/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-054: fs-refactoring-phase4-design に step-history-writer 追加 + mode: delta 統一（REQ-C-006 + REQ-C-007 統合）
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase4-design/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」 + 「REQ-C-007 / 呼び出し元フェーズスキルの修正」 + impact-analysis.md REQ-C-007 #7
- 作業内容・観点: **同一ファイルへの2要件をまとめて1タスクで実施（1ファイル=1タスク厳守のため分割不可）。** (1) REQ-C-006: 全Step末尾 + 前処理/後処理に step-history-writer 呼び出しを追記、説明セクション追加。(2) REQ-C-007: 設計系共通スキル呼び出し記述（5箇所以上）の「差分モード」「（差分モード）」表記を `mode: delta` で明示的に統一。`mode: update` 表記があれば置換。

#### D-055: fs-refactoring-phase5-impl に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase5-impl/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-056: fs-refactoring-phase6-doc に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase6-doc/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: 同上。

#### D-057: fs-refactoring-phase7-final-check に step-history-writer 追加
- 種別: 既存変更
- 依存先: D-001
- 対象ファイル: `skills/fs-refactoring-phase7-final-check/SKILL.md`
- 設計参照: delta-design.md「step-history-writer の記載ルール」
- 作業内容・観点: final-check フェーズのため session-history 削除規定との整合に注意。

### カテゴリI: REQ-C-007 設計系共通スキルの mode: delta 統一（残り）

> object-design / gui-design / ddd-modeling の本体スキル + プロンプトを mode: delta に統一。本体（SKILL.md）でモード・プロセス・出力先を確定してからプロンプトを修正するため、SKILL → prompt の順で逐次実行する。refactoring-designer-prompt（D-064）は D-054（refactoring SKILL）完了後。tray-app-planning ドキュメント（D-065/D-066）は独立。

#### D-058: object-design/SKILL.md を mode: delta 化
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `skills/object-design/SKILL.md`
- 設計参照: delta-design.md「REQ-C-007 / object-design」 + impact-analysis.md REQ-C-007 #1
- 作業内容・観点: mode 一覧 / 差分更新プロセス / 完了条件 / Called by / Input from caller の `update` を `delta` に変更。プロセス内容を「`{changes_dir}/delta-object-design.md` への中間ファイル出力（既存設計書直接更新を廃止）」に書き換え。Step5（概要更新）を削除。

#### D-059: object-designer-prompt.md を mode: delta 化
- 種別: 既存変更
- 依存先: D-058
- 対象ファイル: `skills/object-design/object-designer-prompt.md`
- 設計参照: delta-design.md「REQ-C-007 / object-design」 + impact-analysis.md REQ-C-007 #2
- 作業内容・観点: `mode: update` セクションを `mode: delta` に書き換え。出力先を `{changes_dir}/delta-object-design.md`（Read は参照のみ・変更しない）に変更。

#### D-060: gui-design/SKILL.md を mode: delta 化
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `skills/gui-design/SKILL.md`
- 設計参照: delta-design.md「REQ-C-007 / gui-design」 + impact-analysis.md REQ-C-007 #3
- 作業内容・観点: mode 一覧 / Update プロセス / Called by / Input from caller の `update` を `delta` に変更。プロセスを「`{changes_dir}/delta-gui-design.md` への中間ファイル出力」に書き換え。

#### D-061: gui-designer-prompt.md を mode: delta 化
- 種別: 既存変更
- 依存先: D-060
- 対象ファイル: `skills/gui-design/gui-designer-prompt.md`
- 設計参照: delta-design.md「REQ-C-007 / gui-design」 + impact-analysis.md REQ-C-007 #4
- 作業内容・観点: `update モード` セクション×2 を `delta モード` に書き換え。出力先を `{changes_dir}/delta-gui-design.md` に変更（既存 gui-design.md は参照のみ）。

#### D-062: ddd-modeling/SKILL.md を mode: delta 化
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `skills/ddd-modeling/SKILL.md`
- 設計参照: delta-design.md「REQ-C-007 / ddd-modeling」 + impact-analysis.md REQ-C-007 #5
- 作業内容・観点: モード判定の `update` を `delta` にリネーム。プロセスC を「Delta プロセス」にリネーム。出力先を `{changes_dir}/delta-ddd-modeling.md` に統一（実態の動作変更なし）。

#### D-063: ddd-modeler-prompt.md を mode: delta 化
- 種別: 既存変更
- 依存先: D-062
- 対象ファイル: `skills/ddd-modeling/ddd-modeler-prompt.md`
- 設計参照: delta-design.md「REQ-C-007 / ddd-modeling」 + impact-analysis.md REQ-C-007 #6
- 作業内容・観点: `mode: update` 入力仕様を `mode: delta` にリネーム。

#### D-064: refactoring-designer-prompt.md の差分モード参照を delta-{領域名}.md 化
- 種別: 既存変更
- 依存先: D-054
- 対象ファイル: `skills/fs-refactoring-phase4-design/refactoring-designer-prompt.md`
- 設計参照: delta-design.md「REQ-C-007 / 呼び出し元フェーズスキルの修正」 + impact-analysis.md REQ-C-007 #16
- 作業内容・観点: 「{差分設計の結果}」「設計系共通スキル差分モードの結果」プレースホルダを `delta-{領域名}.md` ファイル群への参照に変更。

#### D-065: tray-app-planning .kiro-side system-architecture.md 表記統一
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `.aide/specs/aide-powers/tray-app-planning/.kiro-side/system-architecture.md`
- 設計参照: delta-design.md「REQ-C-007 / プロジェクト固有ドキュメントの修正」 + impact-analysis.md REQ-C-007 #17
- 作業内容・観点: 「（新規作成/差分更新モード）」を「（新規作成/差分モード）」に表記統一。

#### D-066: tray-app-planning .aide-side system-architecture.md 表記統一
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `.aide/specs/aide-powers/tray-app-planning/.aide-side/system-architecture.md`
- 設計参照: delta-design.md「REQ-C-007 / プロジェクト固有ドキュメントの修正」 + impact-analysis.md REQ-C-007 #17
- 作業内容・観点: 同上。

### カテゴリJ: 参照ファイルの更新（REQ-C-003 / REQ-C-004 + シグネチャ変更 #1〜#9）

> エントリポイントスキル名変更（fs-change-phase1-status→analysis, fs-bugfix-phase1-report→analysis）・フェーズ数変更（10→3, 7→3）・session_history_files 配列化・total_phases 変更の波及。新スキル名が確定（D-002/003/004/013/014/015）した後に実施。各ファイル1タスク。delta-design.md「参照ファイルの更新」#1〜#17 のうちプロンプト系（#18/#19）は D-005〜D-022 で新スキル名を用いて新規作成済みのため独立タスク不要。

#### D-067: using-aide-powers/SKILL.md エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `skills/using-aide-powers/SKILL.md`
- 設計参照: delta-design.md「参照ファイルの更新 #1」 + impact-analysis.md シグネチャ #4/#5
- 作業内容・観点: ワークフロー選択ガイド表・Quick Routing 表の `fs-change-phase1-status`→`fs-change-phase1-analysis`、`fs-bugfix-phase1-report`→`fs-bugfix-phase1-analysis` に更新。

#### D-068: using-aide-powers/references/global-rules.md エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `skills/using-aide-powers/references/global-rules.md`
- 設計参照: delta-design.md「参照ファイルの更新 #2」
- 作業内容・観点: ルーティングテーブルのスキル名を新名称に更新。これがソースとなり D-084（steering 再生成）の入力となる。

#### D-069: progress-file-format.md §7.5/§7.6 を3フェーズ化
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015
- 対象ファイル: `skills/using-aide-powers/references/progress-file-format.md`
- 設計参照: delta-design.md「参照ファイルの更新 #4」 + impact-analysis.md シグネチャ #8/#9
- 作業内容・観点: §7.5 変更WFを3フェーズ（phase1-analysis / phase2-impl / phase3-final-check）、§7.6 バグ修正WFを3フェーズ（phase1-analysis / phase2-impl / phase3-final-check）テンプレートに更新。

#### D-070: phase-compliance-check/SKILL.md を session_history_files 配列対応
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `skills/phase-compliance-check/SKILL.md`
- 設計参照: delta-design.md「参照ファイルの更新 #5」 + impact-analysis.md シグネチャ #1
- 作業内容・観点: write モード入力 `session_history_file`（単一）→ `session_history_files`（配列、単一パスも後方互換で受付）に変更。

#### D-071: compliance-checker.md を session_history_files 配列対応
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `agents/compliance-checker.md`
- 設計参照: delta-design.md「参照ファイルの更新 #6」 + impact-analysis.md シグネチャ #2
- 作業内容・観点: 入力仕様 `session_history_file` → `session_history_files`（配列、後方互換）に変更。検証ロジック・出力形式は不変。

#### D-072: progress-final-checker.md の total_phases 説明更新
- 種別: 既存変更
- 依存先: なし
- 対象ファイル: `agents/progress-final-checker.md`
- 設計参照: delta-design.md「参照ファイルの更新 #7」 + impact-analysis.md シグネチャ #3
- 作業内容・観点: total_phases の説明を更新（変更WF: 2、バグ修正WF: 2＝自フェーズ除く前フェーズ数）。

#### D-073: aide-powers-guide/SKILL.md エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `skills/aide-powers-guide/SKILL.md`
- 設計参照: delta-design.md「参照ファイルの更新 #8」
- 作業内容・観点: ワークフロー選択ガイド表・判断に迷うケース表の旧エントリポイント名を新名称に更新。

#### D-074: dev-environment.md §11 エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `.aide/specs/aide-powers/dev-environment.md`
- 設計参照: delta-design.md「参照ファイルの更新 #9」
- 作業内容・観点: §11 開発ワークフロー表の `fs-change-phase1-status`→`fs-change-phase1-analysis`、`fs-bugfix-phase1-report`→`fs-bugfix-phase1-analysis` に更新。

#### D-075: docs-dev/00-overview.md エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `docs-dev/00-overview.md`
- 設計参照: delta-design.md「参照ファイルの更新 #10」
- 作業内容・観点: ワークフロー一覧テーブルのエントリポイントスキル名を更新。

#### D-076: docs-dev/02-ai-agent/00-overview.md エントリポイント名更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `docs-dev/02-ai-agent/00-overview.md`
- 設計参照: delta-design.md「参照ファイルの更新 #11」
- 作業内容・観点: ワークフロー一覧テーブルのスキル名を更新。

#### D-077: docs-dev/02-ai-agent/02-phase-skills/change.md を3フェーズ構成に更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004
- 対象ファイル: `docs-dev/02-ai-agent/02-phase-skills/change.md`
- 設計参照: delta-design.md「参照ファイルの更新 #12」
- 作業内容・観点: 変更WFの全フェーズ一覧（旧10スキル）を新3スキル（phase1-analysis / phase2-impl / phase3-final-check）の責務記述に書き換え。

#### D-078: docs-dev/02-ai-agent/02-phase-skills/bugfix.md を3フェーズ構成に更新
- 種別: 既存変更
- 依存先: D-013, D-014, D-015
- 対象ファイル: `docs-dev/02-ai-agent/02-phase-skills/bugfix.md`
- 設計参照: delta-design.md「参照ファイルの更新 #13」
- 作業内容・観点: バグ修正WFの全フェーズ一覧（旧7スキル）を新3スキルの責務記述に書き換え。

#### D-079: docs-dev/02-ai-agent/01-workflows/05-change.md フロー図更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004
- 対象ファイル: `docs-dev/02-ai-agent/01-workflows/05-change.md`
- 設計参照: delta-design.md「参照ファイルの更新 #14」
- 作業内容・観点: 変更WFのフロー図（mermaid）・フェーズ遷移・フェーズ一覧表・共通スキル表を新3フェーズに更新。

#### D-080: docs-dev/02-ai-agent/01-workflows/06-bugfix.md フロー図更新
- 種別: 既存変更
- 依存先: D-013, D-014, D-015
- 対象ファイル: `docs-dev/02-ai-agent/01-workflows/06-bugfix.md`
- 設計参照: delta-design.md「参照ファイルの更新 #13/#14（バグ修正WFフロー図）」 + 影響分析「ハブスキルによるルーティング」
- 作業内容・観点: バグ修正WFのフロー図（mermaid）・フェーズ一覧表・エージェント呼び出し表を新3フェーズに更新。設計分割により delta-design #13/#14 は change/bugfix 双方のフロー図を含むため本タスクで bugfix フロー図を担当（網羅性チェックで追加特定）。

#### D-081: docs-dev/03-how-to/add-phase-skill.md 命名例更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `docs-dev/03-how-to/add-phase-skill.md`
- 設計参照: delta-design.md「参照ファイルの更新 #15」
- 作業内容・観点: フェーズスキル命名規則の例示にある旧エントリポイント名（`fs-change-phase1-status` 等）を新名称に更新。

#### D-082: docs-dev/01-system-platform/01-hub-skill-activation.md ルーティング表更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `docs-dev/01-system-platform/01-hub-skill-activation.md`
- 設計参照: delta-design.md「参照ファイルの更新 #16」
- 作業内容・観点: ハブスキルのルーティングテーブルの旧エントリポイント名を新名称に更新。

#### D-083: doc-index.md の新スキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-013
- 対象ファイル: `.aide/specs/aide-powers/doc-index.md`
- 設計参照: delta-design.md「参照ファイルの更新 #17」
- 作業内容・観点: 新スキル名への参照があれば更新。現状 doc-index.md にフェーズスキル名の直接参照は確認されないため、存在する場合のみ更新（なければ「更新不要」と記録）。

#### D-084: steering aide-powers-global-rules.md の再生成（rules-distribute）
- 種別: 既存変更
- 依存先: D-068
- 対象ファイル: `.kiro/steering/aide-powers-global-rules.md`
- 設計参照: delta-design.md「参照ファイルの更新 #3」
- 作業内容・観点: エントリポイントスキル名を新名称に更新。本ファイルは rules-distribute スキルにより global-rules.md（D-068）を入力として自動再生成されるため、D-068 完了後に rules-distribute を実行して反映する（手動編集禁止の自動生成ファイル）。

### カテゴリJ-2: 参照更新漏れの補完（削除前提・参照切れ防止）

> D-085（旧17ディレクトリ削除）の前提確認で、削除対象外の共通スキル11ファイルの「Called by:」等のセクションに、削除予定の旧フェーズスキル名への参照が残っていることが判明（D-067〜D-084 のスコープから漏れていたもの）。このまま旧ディレクトリを削除すると参照切れになるため、削除前に新フェーズスキル名へ置換する。本変更WFのスコープ（REQ-C-003 / REQ-C-004: フェーズ数・スキル名変更の波及）内の更新漏れとしてユーザー承認済み。各タスク共通: 種別=既存変更、依存先=D-002,D-003,D-004,D-013,D-014,D-015（新スキル名確定）、設計参照=delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）。旧→新の変換は同マッピング（変更WF: phase1-status/2-requirements/3-impact/4-approach→fs-change-phase1-analysis、phase5-delta-design/6-impact-review/7-task-planning/8-impl/9-completion→fs-change-phase2-impl、phase10-final-check→fs-change-phase3-final-check。バグ修正WF: phase1-report/2-analysis/3-plan→fs-bugfix-phase1-analysis、phase4-design/5-impl/6-doc→fs-bugfix-phase2-impl、phase7-final-check→fs-bugfix-phase3-final-check）に従う。全て非プログラム成果物（Markdown）であり簡略サイクル（実装→設計レビュー）で処理する。

#### D-086: system-requirements-definition/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/system-requirements-definition/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`、`fs-bugfix-phase4-design`→`fs-bugfix-phase2-impl`。

#### D-087: user-requirements-definition/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/user-requirements-definition/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`。

#### D-088: program-structure-design/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/program-structure-design/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`。

#### D-089: object-design/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/object-design/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`。

#### D-090: infra-interface-design/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/infra-interface-design/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`。

#### D-091: impl-task-planning/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/impl-task-planning/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase7-task-planning`→`fs-change-phase2-impl`、`fs-bugfix-phase4-design`→`fs-bugfix-phase2-impl`。

#### D-092: impl-coding-standards/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/impl-coding-standards/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: `fs-change-phase8-impl`→`fs-change-phase2-impl`、`fs-bugfix-phase5-impl`→`fs-bugfix-phase2-impl`。

#### D-093: gui-design/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/gui-design/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase9-completion`→`fs-change-phase2-impl`。

#### D-094: folder-merge-check/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/folder-merge-check/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase3-impact`→`fs-change-phase1-analysis`、`fs-bugfix-phase2-analysis`→`fs-bugfix-phase1-analysis`。

#### D-095: design-qa-dispatch/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/design-qa-dispatch/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: `fs-change-phase5-delta-design`→`fs-change-phase2-impl`、`fs-bugfix-phase4-design`→`fs-bugfix-phase2-impl`。

#### D-096: ddd-modeling/SKILL.md の旧フェーズスキル名参照更新
- 種別: 既存変更
- 依存先: D-002, D-003, D-004, D-013, D-014, D-015（新スキル名確定）
- 対象ファイル: `skills/ddd-modeling/SKILL.md`
- 設計参照: delta-design.md『新フェーズ構成』（旧→新フェーズ統合マッピング）
- 作業内容・観点: 削除対象の旧フェーズスキル名参照を新フェーズスキル名に置換する。フェーズ役割の記述（delta モード等）は維持する。新フェーズ構成マッピングに従う。具体: Called by の `fs-change-phase5-delta-design`→`fs-change-phase2-impl`。

### カテゴリK: 旧フェーズスキルディレクトリの削除（REQ-C-005）

#### D-085: 旧変更WF・バグ修正WF フェーズスキル17ディレクトリの一括削除
- 種別: 削除
- 依存先: D-002〜D-022（新規作成全件）, D-067〜D-084（参照更新全件）, D-086〜D-096（参照更新漏れの補完）
- 対象ファイル: 以下17ディレクトリ（同質・低リスクの一括削除のため1タスクに集約。理由: 全て「旧フェーズスキルディレクトリの削除」という単一操作であり、個別判断を要しない。新規作成・参照更新が全完了した後に実行することで参照切れを防ぐ）
  - `skills/fs-change-phase1-status/`
  - `skills/fs-change-phase2-requirements/`
  - `skills/fs-change-phase3-impact/`
  - `skills/fs-change-phase4-approach/`
  - `skills/fs-change-phase5-delta-design/`
  - `skills/fs-change-phase6-impact-review/`
  - `skills/fs-change-phase7-task-planning/`
  - `skills/fs-change-phase8-impl/`
  - `skills/fs-change-phase9-completion/`
  - `skills/fs-change-phase10-final-check/`
  - `skills/fs-bugfix-phase1-report/`
  - `skills/fs-bugfix-phase2-analysis/`
  - `skills/fs-bugfix-phase3-plan/`
  - `skills/fs-bugfix-phase4-design/`
  - `skills/fs-bugfix-phase5-impl/`
  - `skills/fs-bugfix-phase6-doc/`
  - `skills/fs-bugfix-phase7-final-check/`
- 設計参照: delta-design.md「削除対象（17ディレクトリ）」 + approach.md「REQ-C-005」
- 作業内容・観点: 削除前に、旧スキルの全Step内容が新スキルに漏れなく移植されていること（機能削減なし）を D-002/D-003/D-013/D-014 の成果物と突合して確認する（影響分析「テスト対象機能 #6 旧Step内容の完全移植」）。確認後、各ディレクトリを SKILL.md・プロンプトテンプレートごと削除する。削除は不可逆操作のため実行前にユーザー確認を取る。

### リグレッションテスト（全タスク完了後）

> aide-powers には自動テストがないため、全て「実際にWFを実行して動作確認する手動検証タスク」。検証には setup.bat 再実行でグローバル領域に新スキルを反映してからセッション再起動が必要（dev-environment.md §0, §11）。全実装タスク（D-001〜D-085）完了後に実施する。出典: impact-analysis.md「テスト対象機能」「リグレッションテスト」。

#### D-R-001: 変更WF新3フェーズの完走検証
- テスト対象: 変更WF Phase1→Phase2→Phase3 の遷移（impact-analysis テスト #1）
- 検証方法: 実際に変更WFを起動し、Phase1（分析・計画）→Phase2（設計・実装）→Phase3（最終チェック）が正常に遷移・完走することを手動確認。

#### D-R-002: バグ修正WF新3フェーズの完走検証
- テスト対象: バグ修正WF Phase1→Phase2→Phase3 の遷移（impact-analysis テスト #2）
- 検証方法: 実際にバグ修正WFを起動し、全フェーズが完走することを手動確認。

#### D-R-003: step-history-writer の動作検証
- テスト対象: 各Step完了時の履歴ファイル書き出し（impact-analysis テスト #3）
- 検証方法: フェーズ実行中に `.aide/tmp/session-history-*.txt` が正しいパス・フォーマットで生成されることを確認。

#### D-R-004: compliance-checker の session_history_files 配列対応検証
- テスト対象: 複数ファイルパス配列の処理（impact-analysis テスト #4）
- 検証方法: 後処理で compliance-checker に複数ファイルパスを渡し、全ファイルを読み込んで検証できることを確認。

#### D-R-005: progress-final-checker の total_phases=2 対応検証
- テスト対象: final-check での total_phases: 2 判定（impact-analysis テスト #5）
- 検証方法: 変更WF/バグ修正WF の Phase3 で PASS/FAIL が正しく判定されることを確認。

#### D-R-006: 旧Step内容の完全移植検証
- テスト対象: 旧フェーズスキルの全Stepが新スキルに漏れなく含まれるか（impact-analysis テスト #6）
- 検証方法: 旧スキル（削除前）と新スキルのStep一覧を突合し、欠落がないことを確認（D-085 削除前の前提確認も兼ねる）。

#### D-R-007: 差分設計の分割判断検証（REQ-C-008）
- テスト対象: 大規模差分設計でのメイン+分割ファイル構成生成（impact-analysis テスト #7）
- 検証方法: 大規模変更を入力し、delta-design.md が索引化され delta-design-{name}.md が生成されることを確認。

#### D-R-008: 分割ファイルの索引整合検証（REQ-C-008）
- テスト対象: メインの索引リンクと実在分割ファイルの整合（impact-analysis テスト #8）
- 検証方法: メインファイルのリンクと実在する分割ファイルを突合。

#### D-R-009: 分割ファイルの単独完結性検証（REQ-C-008）
- テスト対象: 各分割ファイルが before/after/変更理由 を含むか（impact-analysis テスト #9）
- 検証方法: 各分割ファイルの内容を確認。

#### D-R-010: 後続Stepの全Read義務検証（REQ-C-008）
- テスト対象: impact-reviewer/task-planner/doc-syncer の分割ファイル全Read（impact-analysis テスト #10）
- 検証方法: impact-reviewer 自己チェック C7、task-planner/doc-syncer の網羅性チェックが分割ファイル合算で実施され、索引のみ読んで本文を読み忘れないことを確認。

#### D-R-011: fix モードの分割ファイル編集検証（REQ-C-008）
- テスト対象: QA指摘修正時に分割ファイル側を Edit するか（impact-analysis テスト #11）
- 検証方法: fix モードで分割ファイル側が修正される（メイン索引のみ編集しない）ことを確認。

#### D-R-012: 第1層 呼び出し元の粒度チェック検証（REQ-C-009）
- テスト対象: Step12/Step10 の呼び出し前チェックリスト（impact-analysis テスト #12）
- 検証方法: 複数タスク束ねの指示を作ろうとした際、呼び出し前に中止・修正されることを確認。

#### D-R-013: 第2層 multi-stage-code-review Stage0 検証（REQ-C-009）
- テスト対象: Stage 0a ペイロード検証（impact-analysis テスト #13）
- 検証方法: 複数 task_id / 複数 target_file / 複数指示を渡し BLOCKED / NEEDS_CONTEXT が返ることを確認。

#### D-R-014: 第3層 3エージェント受領時チェック検証（REQ-C-009）
- テスト対象: micro-impl / design-review / code-review の受領時粒度チェック（impact-analysis テスト #14）
- 検証方法: 各エージェントに束ね依頼を渡し BLOCKED が返ることを確認。

#### D-R-015: 柔軟ルール例外の判定検証（REQ-C-009）
- テスト対象: parent_task_id + target_public_methods 例外判定（impact-analysis テスト #15）
- 検証方法: 例外条件を満たす/満たさないペイロードで Stage 0b / 各エージェント例外判定が正しく分岐することを確認。

#### D-R-016: オーケストレータの BLOCKED 受領後の再実行検証（REQ-C-009）
- テスト対象: BLOCKED 受領時の呼び出し修正・再実行（impact-analysis テスト #16）
- 検証方法: BLOCKED 返却時に Step12/10 が呼び出しを1サブタスク粒度に修正して再実行することを確認。

#### D-R-017: 他5WFの正常動作（step-history-writer 副作用）
- テスト対象: 企画・設計・実装・逆引き・リファクタリングWFの前処理・後処理（impact-analysis リグレッション #1）
- 検証方法: 他WFのフェーズを1つ実行し、step-history-writer 追加後も前処理・後処理が正常動作することを確認。

#### D-R-018: progress-resume-check の再開判定（フェーズ数変更）
- テスト対象: 変更WF/バグ修正WF 進捗ファイルの再開位置判定（impact-analysis リグレッション #2）
- 検証方法: 進捗ファイルを途中状態にして再開判定が正しく動作することを確認。

#### D-R-019: phase-compliance-check (verify) の署名検証（新フェーズ名）
- テスト対象: 新フェーズ名での署名検証（impact-analysis リグレッション #3）
- 検証方法: Phase2→Phase3 遷移時に verify が PASS することを確認。

#### D-R-020: ハブスキルのルーティング検証（エントリポイント名変更）
- テスト対象: 新エントリポイント名でのルーティング（impact-analysis リグレッション #4）
- 検証方法: 「変更して」「バグ修正して」等の発話で fs-change-phase1-analysis / fs-bugfix-phase1-analysis が activate されることを確認。setup.bat 再実行後に検証すること。

#### D-R-021: session_history_file 単一パスの後方互換検証
- テスト対象: 単一パス渡しでの compliance-checker 動作（impact-analysis リグレッション #5）
- 検証方法: 他5WFが単一パス（文字列）を渡した場合にも compliance-checker が正常動作することを確認。

#### D-R-022: 既存WF（実装/リファクタリング）のレビューパイプライン副作用検証（REQ-C-009）
- テスト対象: multi-stage-code-review Stage0・3エージェント受領時チェック追加の副作用（impact-analysis リグレッション #6）
- 検証方法: 実装WF・リファクタリングWFで正常な1サブタスク呼び出しが Stage0 を通過し、誤って BLOCKED されずパイプラインが完走することを確認。受領側4ファイルは反映済みのため新規実装はないが副作用確認は必須。

#### D-R-023: 分割していない差分設計の従来動作検証（REQ-C-008）
- テスト対象: 単一ファイル差分設計の従来処理（impact-analysis リグレッション #7）
- 検証方法: 小規模変更で delta-design.md / fix-design.md を単一ファイルで作成し、後続Stepが従来通り動作することを確認。

## タスクサマリー

### 実装タスク（カテゴリ別）

| カテゴリ | 内容 | タスクID | 件数 |
|---|---|---|---|
| A | 共通基盤スキル（step-history-writer 新規） | D-001 | 1 |
| B | 変更WF 新フェーズスキル本体（新規） | D-002〜D-004 | 3 |
| C | 変更WF Phase1 プロンプト（新規） | D-005〜D-008 | 4 |
| D | 変更WF Phase2 プロンプト（新規, REQ-C-008内包） | D-009〜D-012 | 4 |
| E | バグ修正WF 新フェーズスキル本体（新規） | D-013〜D-015 | 3 |
| F | バグ修正WF Phase1 プロンプト（新規） | D-016〜D-019 | 4 |
| G | バグ修正WF Phase2 プロンプト（新規, REQ-C-008内包） | D-020〜D-022 | 3 |
| H | REQ-C-006 既存35フェーズスキルへの step-history-writer 追加（既存変更。D-054は REQ-C-007 と統合） | D-023〜D-057 | 35 |
| I | REQ-C-007 設計系共通スキル mode: delta 統一（既存変更。残り） | D-058〜D-066 | 9 |
| J | 参照ファイルの更新（既存変更） | D-067〜D-084 | 18 |
| J-2 | 参照更新漏れの補完（共通スキル11ファイル・削除前提。既存変更） | D-086〜D-096 | 11 |
| K | 旧17ディレクトリの一括削除 | D-085 | 1 |
| **実装タスク合計** | | | **96** |

### 種別別内訳

| 種別 | 件数 | 該当 |
|---|---|---|
| 新規作成 | 22 | D-001〜D-022 |
| 既存変更 | 73 | D-023〜D-084, D-086〜D-096 |
| 削除 | 1 | D-085（17ディレクトリ一括） |

### リグレッションテスト（手動WF実行検証）

| 区分 | タスクID | 件数 |
|---|---|---|
| 直接変更テスト | D-R-001〜D-R-006 | 6 |
| REQ-C-008 分割対応テスト | D-R-007〜D-R-011 | 5 |
| REQ-C-009 二重防御テスト | D-R-012〜D-R-016 | 5 |
| リグレッションテスト | D-R-017〜D-R-023 | 7 |
| **検証タスク合計** | | **23** |

### 総計

- 実装タスク: 96件
- 検証タスク: 23件
- **合計: 119件**

## 網羅性チェック結果

impact-analysis.md「プログラム構成視点の影響」の全カテゴリとタスクの対応:

| 設計書の項目 | 件数 | 対応タスク | 状態 |
|---|---|---|---|
| 新規作成スキル本体 | 7 | D-001〜D-004, D-013〜D-015 | ✅ |
| 新規作成プロンプト | 7 | D-009〜D-012, D-020〜D-022 | ✅ |
| （補足）Phase1 プロンプト | 8 | D-005〜D-008, D-016〜D-019 | ✅（設計付属ファイルに実体あり。新スキル稼働に必須のため追加） |
| 削除17ディレクトリ | 17 | D-085（1タスクに集約） | ✅ |
| 参照ファイル更新 | 19 | D-067〜D-084（18タスク）+ D-005〜D-022（プロンプト#18/#19は新規作成で吸収） | ✅ |
| REQ-C-006 全41フェーズスキルへの step-history-writer | 41 | 新6スキル本体（D-002〜D-004,D-013〜D-015）に内包 + 既存35（D-023〜D-057） | ✅ |
| REQ-C-007 設計系共通スキル | 10 | D-054, D-058〜D-066 | ✅ |
| REQ-C-008 新フェーズスキル内記述 | — | D-003/D-014 本体 + D-009〜D-012/D-020〜D-022 プロンプトに内包 | ✅ |
| REQ-C-009 新フェーズスキル内記述（第1層） | — | D-003/D-014 本体（Step12/Step10）に内包 | ✅ |
| REQ-C-009 受領側4ファイル（第2層/第3層） | 4 | 反映済み（impact-analysis 確認済み）→ 実装タスクなし、D-R-022 で副作用検証 | ✅（タスク不要） |

### 網羅性の補足

- **設計書の総項目数（プログラム構成視点）**: 新規スキル7 + 新規プロンプト7 + 削除17 + 参照更新19 + REQ-C-006(41) + REQ-C-007(10) = 主要カテゴリすべてタスク化済み。
- **タスク数との対応**: 1ファイル=1タスク原則により、新規プロンプトは設計付属ファイルにある Phase1 用4+4=8件も追加で特定し計上（設計書のサマリー表は Phase2 の7件のみ列挙していたが、新スキル稼働には Phase1 プロンプトも必須のため網羅性チェックで補完）。
- **REQ-C-006 の 41 件**: 新規6スキルは本体作成タスクに step-history-writer 記述を内包するため独立タスクにせず、既存35件のみ独立タスク化。合計 6（内包）+ 35（独立）= 41 で一致。
- **REQ-C-009 受領側4ファイル**: impact-analysis.md で「反映済み（確認済み）」と明記されているため実装タスクを作成しない。副作用は D-R-022 で検証。
- **漏れ**: なし（設計書の全変更項目がタスクまたは新スキル本体への内包でカバーされている）。

### 追加特定した項目（設計書サマリー表に明示されていなかったが網羅性確保のため追加）

1. **Phase1 プロンプト8件（D-005〜D-008, D-016〜D-019）**: delta-design 付属ファイル（phase1-prompts）に実体仕様あり。新スキル稼働に必須。
2. **D-080（06-bugfix.md フロー図）**: delta-design「参照ファイルの更新」#13/#14 は変更WFフロー図中心の記述だが、同様にバグ修正WFフロー図（docs-dev/02-ai-agent/01-workflows/06-bugfix.md）も旧7フェーズを参照しているため追加。
3. **D-084（steering 再生成）**: delta-design #3 に対応。rules-distribute 経由の自動生成のため D-068 を入力とする依存を明記。
