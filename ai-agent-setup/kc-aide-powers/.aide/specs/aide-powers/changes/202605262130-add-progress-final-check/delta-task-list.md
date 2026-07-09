# 差分タスクリスト

## 依存関係グラフ

D-001 → D-002, D-003, D-004, D-005, D-006, D-007, D-008
D-009 → D-002, D-003, D-004, D-005, D-006, D-007, D-008
D-002 → D-010
D-003 → D-011
D-004 → D-012
D-005 → D-013
D-006 → D-014
D-007 → D-015
D-008 → D-016
D-010, D-011, D-012, D-013, D-014, D-015, D-016 → D-017
D-017 → D-R-001

## タスク一覧

### D-001: 検証用agent定義の作成 [並列可]
- 種別: 新規追加
- 対象ファイル: .kiro/agents/progress-final-checker.md
- 依存先: なし
- 設計参照: delta-design.md セクション1
- テスト観点:
  - agent定義のフォーマットが正しいか
  - 検証観点A〜Fが全て記載されているか
  - 誠実性原則が記載されているか

### D-002: 企画WF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-planning-phase4-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=planning, N=4）
- テスト観点:
  - frontmatter の name/description が正しいか
  - Process の全ステップが記載されているか
  - workflow_name=planning, total_phases=3 が正しいか

### D-003: 設計WF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-design-phase11-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=design, N=11）
- テスト観点: D-002と同様（workflow_name=design, total_phases=10）

### D-004: 実装WF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-impl-phase7-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=impl, N=7）
- テスト観点: D-002と同様（workflow_name=impl, total_phases=6）

### D-005: 逆引きWF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-reverse-phase6-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=reverse, N=6）
- テスト観点: D-002と同様（workflow_name=reverse, total_phases=5）

### D-006: 変更WF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-change-phase10-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=change, N=10）
- テスト観点: D-002と同様（workflow_name=change, total_phases=9）

### D-007: バグ修正WF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-bugfix-phase7-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=bugfix, N=7）
- テスト観点: D-002と同様（workflow_name=bugfix, total_phases=6）

### D-008: リファクタリングWF最終チェックフェーズスキル作成 [並列可]
- 種別: 新規追加
- 対象ファイル: skills/fs-refactoring-phase7-final-check/SKILL.md
- 依存先: D-001, D-009
- 設計参照: delta-design.md セクション2（テンプレート、WF=refactoring, N=7）
- テスト観点: D-002と同様（workflow_name=refactoring, total_phases=6）

### D-009: progress-file-format.md フェーズマッピング追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/using-aide-powers/references/progress-file-format.md
- 依存先: なし
- 設計参照: delta-design.md セクション4
- テスト観点:
  - 全7WFのフェーズマッピングテーブルに行が追加されているか
  - フェーズ番号・スキル名・表示名が正しいか

### D-010: fs-planning-phase3-finalize 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-planning-phase3-finalize/SKILL.md
- 依存先: D-002
- 設計参照: delta-design.md セクション3-1
- テスト観点: before→after が正確に反映されているか

### D-011: fs-design-phase10-program 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-design-phase10-program/SKILL.md
- 依存先: D-003
- 設計参照: delta-design.md セクション3-2
- テスト観点: before→after が正確に反映されているか

### D-012: fs-impl-phase6-doc-generation 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-impl-phase6-doc-generation/SKILL.md
- 依存先: D-004
- 設計参照: delta-design.md セクション3-3
- テスト観点: before→after が正確に反映されているか

### D-013: fs-reverse-phase5-optional-phases 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-reverse-phase5-optional-phases/SKILL.md
- 依存先: D-005
- 設計参照: delta-design.md セクション3-4
- テスト観点: before→after が正確に反映されているか

### D-014: fs-change-phase9-completion 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-change-phase9-completion/SKILL.md
- 依存先: D-006
- 設計参照: delta-design.md セクション3-5
- テスト観点: before→after が正確に反映されているか

### D-015: fs-bugfix-phase6-doc 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-bugfix-phase6-doc/SKILL.md
- 依存先: D-007
- 設計参照: delta-design.md セクション3-6
- テスト観点: before→after が正確に反映されているか

### D-016: fs-refactoring-phase6-doc 遷移先追加 [並列可]
- 種別: 既存変更
- 対象ファイル: skills/fs-refactoring-phase6-doc/SKILL.md
- 依存先: D-008
- 設計参照: delta-design.md セクション3-7
- テスト観点: before→after が正確に反映されているか

### D-017: phase-compliance-check 誠実性原則追加 [逐次]
- 種別: 既存変更
- 対象ファイル: skills/phase-compliance-check/SKILL.md
- 依存先: D-010〜D-016
- 設計参照: delta-design.md セクション5
- テスト観点:
  - 誠実性原則セクションが正しい位置に追加されているか
  - 過去の不正事例が具体的に記載されているか
  - オーケストレータへの命令が明確か

### D-R-001: 全WF進捗管理の動作確認
- テスト種別: リグレッション
- 依存先: D-017
- 対象: progress-resume-check が新フェーズを正しく認識するか
- 確認内容:
  - 各WFの進捗ファイルに新フェーズ行を追加した状態で progress-resume-check が正常動作するか
  - 既存フェーズの再開判定に影響がないか

## タスクサマリー
- 新規追加タスク: 8件（agent 1 + スキル 7）
- 既存変更タスク: 9件（遷移先追加 7 + progress-file-format 1 + phase-compliance-check 1）
- GUI実装タスク: 0件
- リグレッションテスト: 1件
- 合計: 18件