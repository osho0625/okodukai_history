# 変更・不具合対応履歴

## 初回変更
- 日付: 2026-07-03
- 依頼内容: pending-issues の check/present 処理が各WFの実装フェーズ（コミット前）で実行されるため、WF本体のフロー（設計→実装→レビュー→コミット）に割り込みが発生し、Phase 3（final-check）のコミットまでの流れが乱れる問題を解消する。pending-issues 関連処理をWF完全終了・コミット完了後に移動し、WF本体フローの一貫性を確保する。
- 変更概要: 全11ファイルに対する既存変更（新規ファイル作成なし）。パターンA（削除・4件）: fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase6-doc / fs-impl-phase5-final-check の各実装フェーズ・最終チェックフェーズから pending-issues check/present の単独Stepを削除し、後続Stepをリナンバリングした。パターンB（追加・7件）: 全7WFの最終フェーズ（fs-planning-phase4-final-check, fs-design-phase11-final-check, fs-impl-phase7-final-check, fs-reverse-phase6-final-check, fs-change-phase3-final-check, fs-bugfix-phase3-final-check, fs-refactoring-phase7-final-check）の後処理に、git-commit-workflow完了後の「pending-issues check → present」の手順を追加した。実行順序は全WF共通で「git-commit-workflow → pending-issues check → pending-issues present」に統一した。合わせて program-structure.md の該当4フェーズスキルのプロセス記述（Step構成）を実装後の状態に同期した。
- 関連ドキュメント: change-requirements.md, impact-analysis.md, delta-design.md, delta-task-list.md, impl-process-checklist.md
