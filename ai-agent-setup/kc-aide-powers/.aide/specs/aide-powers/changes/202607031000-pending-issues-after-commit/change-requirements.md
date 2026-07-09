# 変更要求定義

## 変更概要
- **変更の目的・背景**: pending-issues の check/present 処理が各WFの実装フェーズ（コミット前）で実行されるため、WF本体のフロー（設計→実装→レビュー→コミット）に割り込みが発生し、Phase 3（final-check）のコミットまでの流れが乱れる。この問題を解消し、pending-issues 関連処理をWF完全終了・コミット完了後に移動することで、WF本体フローの一貫性を確保する。
- **変更種別**: 変更

## 要求事項

### REQ-C-001: 各WF実装フェーズからのpending-issues関連Step削除
- **種別**: 変更
- **説明**: 各WFの実装フェーズスキル（fs-change-phase2-impl、fs-bugfix-phase2-impl、fs-refactoring-phase6-doc 等）に存在する pending-issues check/present の Step を削除する。これにより、WF本体のフロー（差分設計→実装→レビュー→コミット）が中断なく完結する。
- **受入基準**:
  - AC-001: fs-change-phase2-impl の SKILL.md に pending-issues check/present を実行する Step が存在しないこと
  - AC-002: fs-bugfix-phase2-impl の SKILL.md に pending-issues check/present を実行する Step が存在しないこと
  - AC-003: fs-refactoring-phase6-doc の SKILL.md に pending-issues check/present を実行する Step が存在しないこと
  - AC-004: その他全WFの実装フェーズスキルに pending-issues check/present を単独Stepとして実行する記述が存在しないこと
- **優先度**: 必須

### REQ-C-002: 全7WF最終フェーズの後処理にpending-issues check/presentを追加
- **種別**: 変更
- **説明**: 全7WFの最終フェーズスキル（fs-planning-phase4-final-check、fs-design-phase11-final-check、fs-impl-phase7-final-check、fs-reverse-phase6-final-check、fs-change-phase3-final-check、fs-bugfix-phase3-final-check、fs-refactoring-phase7-final-check）の後処理において、git-commit-workflow 実行完了後に pending-issues の check（書き込み忘れチェック）→ present（既存issues提示・検証・削除）を実行する手順を追加する。
- **受入基準**:
  - AC-005: fs-planning-phase4-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-006: fs-design-phase11-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-007: fs-impl-phase7-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-008: fs-reverse-phase6-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-009: fs-change-phase3-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-010: fs-bugfix-phase3-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-011: fs-refactoring-phase7-final-check の SKILL.md 後処理に、git-commit-workflow 完了後の pending-issues check → present 手順が記載されていること
  - AC-012: 各final-checkの後処理において、pending-issues check/present が git-commit-workflow の**後**（コミット完了後）に配置されていること（前ではないこと）
- **優先度**: 必須

### REQ-C-003: pending-issues処理の実行順序の明確化
- **種別**: 変更
- **説明**: 全7WFのfinal-check後処理における実行順序を「git-commit-workflow → pending-issues check → pending-issues present」の順で明確に定義する。pending-issues の check は書き込み忘れの検出、present は既存issuesの提示・検証・削除作業を担当する。
- **受入基準**:
  - AC-013: 全7WFのfinal-check SKILL.md後処理において、実行順序が「git-commit-workflow → pending-issues check → pending-issues present」の順であることが読み取れること
- **優先度**: 必須

## 対象外（スコープ外）
- pending-issues-management スキル（SKILL.md）自体の仕組み・ロジックの変更
- pending-issues.md のフォーマット変更
- pending-issues の record モード（問題発見時の記録）の変更（これは各フェーズ実行中に随時行うものであり、今回の変更対象ではない）
- WF本体フロー内での pending-issues record の呼び出し位置の変更
- final-check 以外のフェーズスキルへの新規 pending-issues 処理の追加

## 前提条件
- 全7WFの最終フェーズスキル（final-check）に git-commit-workflow の呼び出しが後処理に存在すること
- pending-issues-management スキルが check モードと present モードを既に提供していること
- 現行の実装フェーズスキルに pending-issues check/present の Step が存在すること（削除対象として）

## 関連する既存要件
- **UR-019**: pending-issues-management による残課題管理を提供すること — 本変更は pending-issues 処理の実行タイミングを変更するものであり、残課題管理機能自体は維持される
- **UR-007**: 進捗管理機構（中断再開・進捗ファイル・フェーズレポート）を提供すること — final-check 後処理の実行順序に影響するため関連
- **UR-001**: 7つのワークフローを提供すること — 全7WFの最終フェーズに共通の変更を適用するため関連
