# 工程チェック表（署名検証機構の削除）

## チェック表

| タスク | 実装 | レビュー | 完了 |
|---|---|---|---|
| **T1: 削除 — phase-compliance-check** | ✅ | ✅ | ✅ |
| **T2: 削除 — compliance-checker** | | | |
| 　2.1 agents/compliance-checker.md 削除 | ✅ | ✅ | ✅ |
| 　2.2 agents/kiro/compliance-checker.md 削除 | ✅ | ✅ | ✅ |
| **T3: 削除 — create-sig.sh** | ✅ | ✅ | ✅ |
| **T4: 簡素化 — phase-report-check/SKILL.md** | ✅ | ✅ | ✅ |
| **T5: 新規 — progress-updater** | | | |
| 　5.1 agents/progress-updater.md 新規作成 | ✅ | ✅ | ✅ |
| 　5.2 agents/kiro/progress-updater.md 新規作成 | ✅ | ✅ | ✅ |
| **T6: 削除 — phase-report-checker** | | | |
| 　6.1 agents/phase-report-checker.md 削除 | ✅ | ✅ | ✅ |
| 　6.2 agents/kiro/phase-report-checker.md 削除 | ✅ | ✅ | ✅ |
| **T7: 簡素化 — progress-final-checker** | | | |
| 　7.1 agents/progress-final-checker.md 簡素化 | ✅ | ✅ | ✅ |
| 　7.2 agents/kiro/progress-final-checker.md 簡素化 | ✅ | ✅ | ✅ |
| **T8: 参照更新 — phase-skill-rules.md（skills版）** | ✅ | ✅ | ✅ |
| **T9: 参照更新 — phase-skill-rules.md（.kiro版）** | ✅ | ✅ | ✅ |
| **T10: 参照更新 — session-handover/SKILL.md** | ✅ | ✅ | ✅ |
| **T11: 参照更新 — progress-file-format.md** | ✅ | ✅ | ✅ |
| **T12: 参照更新 — step-history-writer/SKILL.md** | ✅ | ✅ | ✅ |
| **T13: 一括変更 — reverse系** | | | |
| 　13.1 fs-reverse-phase1-program (A+B) | ✅ | ✅ | ✅ |
| 　13.2 fs-reverse-phase2-dev-env (A+B) | ✅ | ✅ | ✅ |
| 　13.3 fs-reverse-phase3-system-req (A+B) | ✅ | ✅ | ✅ |
| 　13.4 fs-reverse-phase4-user-req (A+B) | ✅ | ✅ | ✅ |
| 　13.5 fs-reverse-phase5-optional-phases (A+B) | ✅ | ✅ | ✅ |
| 　13.6 fs-reverse-phase6-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T14: 一括変更 — refactoring系** | | | |
| 　14.1 fs-refactoring-phase1-status (A+B) | ✅ | ✅ | ✅ |
| 　14.2 fs-refactoring-phase2-candidates (A+B) | ✅ | ✅ | ✅ |
| 　14.3 fs-refactoring-phase3-plan (A+B) | ✅ | ✅ | ✅ |
| 　14.4 fs-refactoring-phase4-design (A+B) | ✅ | ✅ | ✅ |
| 　14.5 fs-refactoring-phase5-impl (A+B) | ✅ | ✅ | ✅ |
| 　14.6 fs-refactoring-phase6-doc (A+B) | ✅ | ✅ | ✅ |
| 　14.7 fs-refactoring-phase7-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T15: 一括変更 — planning系** | | | |
| 　15.1 fs-planning-phase1-intake-and-init (A+B) | ✅ | ✅ | ✅ |
| 　15.2 fs-planning-phase2-explore (A+B) | ✅ | ✅ | ✅ |
| 　15.3 fs-planning-phase3-finalize (A+B) | ✅ | ✅ | ✅ |
| 　15.4 fs-planning-phase4-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T16: 一括変更 — impl系** | | | |
| 　16.1 fs-impl-phase1-gate (A+B) | ✅ | ✅ | ✅ |
| 　16.2 fs-impl-phase2-preparation (A+B) | ✅ | ✅ | ✅ |
| 　16.3 fs-impl-phase3-gui-mockup (A+B) | ✅ | ✅ | ✅ |
| 　16.4 fs-impl-phase4-execution (A+B) | ✅ | ✅ | ✅ |
| 　16.5 fs-impl-phase5-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| 　16.6 fs-impl-phase6-doc-generation (A+B) | ✅ | ✅ | ✅ |
| 　16.7 fs-impl-phase7-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T17: 一括変更 — design系** | | | |
| 　17.1 fs-design-phase1-user-req (A+B) | ✅ | ✅ | ✅ |
| 　17.2 fs-design-phase2-system-req (A+B) | ✅ | ✅ | ✅ |
| 　17.3 fs-design-phase3-dev-plan (A+B) | ✅ | ✅ | ✅ |
| 　17.4 fs-design-phase4-architecture (A+B) | ✅ | ✅ | ✅ |
| 　17.5 fs-design-phase5-gui (A+B) | ✅ | ✅ | ✅ |
| 　17.6 fs-design-phase6-usecase (A+B) | ✅ | ✅ | ✅ |
| 　17.7 fs-design-phase7-ddd (A+B) | ✅ | ✅ | ✅ |
| 　17.8 fs-design-phase8-object (A+B) | ✅ | ✅ | ✅ |
| 　17.9 fs-design-phase9-infra (A+B) | ✅ | ✅ | ✅ |
| 　17.10 fs-design-phase10-program (A+B) | ✅ | ✅ | ✅ |
| 　17.11 fs-design-phase11-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T18: 一括変更 — change系** | | | |
| 　18.1 fs-change-phase1-analysis (A+B) | ✅ | ✅ | ✅ |
| 　18.2 fs-change-phase2-impl (A+B) | ✅ | ✅ | ✅ |
| 　18.3 fs-change-phase3-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T19: 一括変更 — bugfix系** | | | |
| 　19.1 fs-bugfix-phase1-analysis (A+B) | ✅ | ✅ | ✅ |
| 　19.2 fs-bugfix-phase2-impl (A+B) | ✅ | ✅ | ✅ |
| 　19.3 fs-bugfix-phase3-final-check (A+C+D+E) | ✅ | ✅ | ✅ |
| **T20: リグレッション確認** | | | |
| 　20.1 phase-report-check (verify) 動作確認 | ⬜ | — | ⬜ |
| 　20.2 phase-report-check (write) 動作確認 | ⬜ | — | ⬜ |
| 　20.3 progress-updater 全モード確認 | ⬜ | — | ⬜ |
| 　20.4 progress-final-checker 完了確認 | ⬜ | — | ⬜ |
| 　20.5 phase-compliance-check 残存参照なし確認 | ⬜ | — | ⬜ |
| 　20.6 compliance-checker 残存参照なし確認 | ⬜ | — | ⬜ |
| 　20.7 フェーズスキル前処理フロー確認 | ⬜ | — | ⬜ |
| 　20.8 フェーズスキル後処理フロー確認 | ⬜ | — | ⬜ |
| 　20.9 最終チェック中止モード確認 | ⬜ | — | ⬜ |
| 　20.10 session-handover 実行証跡確認 | ⬜ | — | ⬜ |

---

## Wave 別実行ガイド

| Wave | タスク | 並列可否 | 前提条件 |
|---|---|---|---|
| Wave 1 | T1, T2, T3 | ✅ 並列可 | なし |
| Wave 2 | T4, T6 | ✅ 並列可 | Wave 1 完了 |
| Wave 3 | T5, T7, T8, T9, T10, T11 | ✅ 並列可 | Wave 2 完了 |
| Wave 4 | T12, T13, T14, T15, T16, T17, T18, T19 | ✅ 並列可 | Wave 3 完了 |
| Wave 5 | T20 | 単独 | Wave 4 完了 |

---

## 変更パターン早見表（T13〜T19 用）

| パターン | 変更箇所 | 変更内容 |
|---|---|---|
| **A** | 前処理 | 「署名チェック結果」→「進捗確認結果」。FAIL 時記述を汎用化 |
| **B** | 後処理 | `report_file_path`/`required_items` 削除。「レポート記載項目リスト」セクション完全削除 |
| **C** | 最終チェック前処理 | パターン A と同一 |
| **D** | 最終チェック本体 | progress-final-checker 起動説明から「署名検証」記述除去 |
| **E** | 最終チェック中止モード | 「署名検証をスキップし」除去 |
