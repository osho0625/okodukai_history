# 差分タスクリスト

## 並列実行ルール（厳守）

- 並列実行可能なタスク（依存先なし同士）は、オーケストレータが **invoke_sub_agent を複数回同時に呼ぶ** ことで並列化する
- 1つのサブエージェントに複数タスクを渡すことを **絶対禁止** する
- レビューも同様: 各成果物に対して **別々のレビューサブエージェント** を並列で呼ぶ
- 「並列でやれ」と1つのサブエージェントに指示するのは並列実行ではない

## 依存関係グラフ

D-001 → D-007
D-002 → D-007
D-003 → D-007
D-004 → D-007
D-005 → D-007
D-006 → D-007
D-001 → D-008
D-002 → D-008
D-003 → D-008
D-004 → D-008
D-005 → D-008
D-006 → D-008
D-007 → D-009
D-008 → D-009
D-009 → D-010
D-010 → D-011

## タスク一覧

### グループA: 新スキル作成（変更WF）

#### タスク D-001: fs-change-phase1-analysis/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-change-phase1-analysis/SKILL.md
- 設計参照: delta-design.md「fs-change-phase1-analysis」セクション
- 内容: 旧Phase1〜4のStep部分を統合した詳細SKILL.md作成。Iron Law, Red Flags, Common Rationalizations, サブエージェント情報渡し、完了条件を全て移植。Step単位履歴書き出し処理を含む。

#### タスク D-002: fs-change-phase2-impl/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-change-phase2-impl/SKILL.md
- 設計参照: delta-design.md「fs-change-phase2-impl」セクション
- 内容: 旧Phase5〜8のStep部分を統合した詳細SKILL.md作成。Step単位履歴書き出し処理を含む。

#### タスク D-003: fs-change-phase3-completion/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-change-phase3-completion/SKILL.md
- 設計参照: delta-design.md「fs-change-phase3-completion」セクション
- 内容: 旧Phase9〜10を統合。PASS時の履歴ファイル一括削除処理を含む。

### グループB: 新スキル作成（バグ修正WF）

#### タスク D-004: fs-bugfix-phase1-analysis/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-bugfix-phase1-analysis/SKILL.md
- 設計参照: delta-design.md「fs-bugfix-phase1-analysis」セクション
- 内容: 旧Phase1〜3のStep部分を統合した詳細SKILL.md作成。Step単位履歴書き出し処理を含む。

#### タスク D-005: fs-bugfix-phase2-impl/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-bugfix-phase2-impl/SKILL.md
- 設計参照: delta-design.md「fs-bugfix-phase2-impl」セクション
- 内容: 旧Phase4〜5を統合。Step単位履歴書き出し処理を含む。

#### タスク D-006: fs-bugfix-phase3-completion/SKILL.md 作成
- 種別: 新規追加
- 依存先: なし
- 対象ファイル: skills/fs-bugfix-phase3-completion/SKILL.md
- 設計参照: delta-design.md「fs-bugfix-phase3-completion」セクション
- 内容: 旧Phase6〜7を統合。PASS時の履歴ファイル一括削除処理を含む。

### グループC: 共通スキル・参照ファイル更新

#### タスク D-007: phase-compliance-check + compliance-checker 改修
- 種別: 既存変更
- 依存先: D-001〜D-006
- 対象ファイル: skills/phase-compliance-check/SKILL.md, agents/compliance-checker.md
- 設計参照: delta-design.md「phase-compliance-check スキルの変更」セクション
- 内容: session_history_file → session_history_files（複数ファイル対応）

#### タスク D-008: 参照ファイル更新
- 種別: 既存変更
- 依存先: D-001〜D-006
- 対象ファイル:
  - .aide/references/progress-file-format.md
  - skills/using-aide-powers/SKILL.md
  - skills/using-aide-powers/references/global-rules.md
  - .kiro/steering/aide-powers-global-rules.md
  - skills/using-aide-powers/references/phase-skill-rules.md
- 設計参照: delta-design.md「参照ファイルの更新」セクション
- 内容: フェーズマッピング更新、エントリポイントスキル名更新、Step単位履歴書き出しルール追加

### グループD: 他WFフェーズスキルへの履歴書き出し追加

#### タスク D-009: 全7WFの既存フェーズスキルにStep単位履歴書き出し処理を追加
- 種別: 既存変更
- 依存先: D-007, D-008
- 対象ファイル: 全フェーズスキル（変更WF・バグ修正WF以外の5WF: 企画・設計・実装・逆引き・リファクタリング）
- 設計参照: delta-design.md「セッション履歴Step単位書き出し」セクション
- 内容: 各Step完了時の履歴書き出し処理を全フェーズスキルに追加。最終フェーズにPASS時削除処理追加。
- 備考: task-orchestration で並列処理推奨（約30ファイル）

### グループE: 旧スキル削除

#### タスク D-010: 旧スキルディレクトリ削除
- 種別: 削除
- 依存先: D-009
- 対象ファイル: 17ディレクトリ（変更WF旧10 + バグ修正WF旧7）
- 設計参照: delta-design.md「削除対象」セクション
- 内容: 新スキルが全て動作確認済みの状態で旧スキルを削除

### リグレッションテスト

#### タスク D-R-001: 変更WF新スキルの動作確認
- テスト種別: リグレッション
- 確認内容: 新しい3フェーズスキルが正しくactivateでき、遷移が正しく動作すること

#### タスク D-R-002: バグ修正WF新スキルの動作確認
- テスト種別: リグレッション
- 確認内容: 新しい3フェーズスキルが正しくactivateでき、遷移が正しく動作すること

#### タスク D-R-003: セッション履歴書き出し・削除の動作確認
- テスト種別: リグレッション
- 確認内容: Step完了時に履歴ファイルが書き出され、最終フェーズPASS後に削除されること

### グループF: 最終確認

#### タスク D-011: 全体整合性確認
- 種別: 確認
- 依存先: D-010
- 内容: 全参照が新スキル名に更新されていること、旧スキル名への参照が残っていないことをgrep確認

## タスクサマリー
- 新規追加タスク: 6件（D-001〜D-006）
- 既存変更タスク: 3件（D-007, D-008, D-009）
- 削除タスク: 1件（D-010）
- 確認タスク: 1件（D-011）
- リグレッションテスト: 3件（D-R-001〜003）
- 合計: 14件
