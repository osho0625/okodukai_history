# 対応方針書

## 方針概要

### 対応方針
既存変更で対応

### OCP検討結果
適用不可。本プロジェクトはスキルファイル群（AIエージェント用のSKILL.mdファイル群）であり、コード上の拡張ポイント（Strategy/Factory パターン、プラグイン機構等）の概念が存在しない。変更内容は「複数のスキルファイルを1つに統合する」という構造変更であり、追加のみで対処することは不可能。

## 関連箇所

### 変更対象

| 対象 | 変更内容 |
|---|---|
| skills/fs-change-phase1-analysis/SKILL.md | 新規作成（旧Phase 1〜4 統合） |
| skills/fs-change-phase2-impl/SKILL.md | 新規作成（旧Phase 5〜9 統合） |
| skills/fs-change-phase3-final-check/SKILL.md | 新規作成（旧Phase 10 そのまま） |
| skills/fs-bugfix-phase1-analysis/SKILL.md | 新規作成（旧Phase 1〜3 統合） |
| skills/fs-bugfix-phase2-impl/SKILL.md | 新規作成（旧Phase 4〜6 統合） |
| skills/fs-bugfix-phase3-final-check/SKILL.md | 新規作成（旧Phase 7 そのまま） |
| skills/using-aide-powers/references/progress-file-format.md | §7.5/§7.6 更新 |
| skills/using-aide-powers/SKILL.md | エントリポイントスキル名更新 |
| skills/using-aide-powers/references/global-rules.md | エントリポイントスキル名更新 |
| skills/phase-compliance-check/SKILL.md | session_history_file 複数対応 |
| agents/compliance-checker.md | session_history_file 複数対応 |
| 全7WFの全フェーズスキル（41ファイル） | Step単位履歴書き出し追加（REQ-C-006） |
| skills/object-design/SKILL.md + object-designer-prompt.md | mode: update → delta、既存設計書直接更新→中間ファイル出力（REQ-C-007） |
| skills/gui-design/SKILL.md + gui-designer-prompt.md | mode: update → delta、既存設計書直接更新→中間ファイル出力（REQ-C-007） |
| skills/ddd-modeling/SKILL.md + ddd-modeler-prompt.md | mode: update → delta（モード名統一のみ、実態変更なし）（REQ-C-007） |
| skills/fs-refactoring-phase4-design/SKILL.md + refactoring-designer-prompt.md | mode 名 update → delta、設計系共通スキル呼び出し記述更新（REQ-C-007） |
| 旧変更WFスキル（10ディレクトリ） | 削除 |
| 旧バグ修正WFスキル（7ディレクトリ） | 削除 |

### 間接影響（参照元更新）

| 対象 | 更新内容 |
|---|---|
| .kiro/steering/aide-powers-global-rules.md | エントリポイントスキル名更新（rules-distribute で自動生成） |
| docs-dev/ 配下の関連ドキュメント | フェーズ一覧・遷移先スキル名の更新 |
| .aide/specs/aide-powers/dev-environment.md | §11 エントリポイントスキル名更新 |

## 変更方針の詳細

### REQ-C-001: 変更WF 3フェーズ統合

**方針:** 旧10フェーズスキルの SKILL.md から Process セクションの各 Step を取り出し、新3フェーズスキルに統合する。

**統合ルール:**
1. 旧フェーズの Step 部分を取り出し、`#` 見出しで区切って連番 Step 化する
2. 前処理・後処理はフェーズ全体で1回のみ
3. 注意事項（Iron Law, Red Flags, Common Rationalizations）は関連 Step の近くに配置する
4. 複数旧フェーズに共通する注意事項は重複なく1箇所に整理する

**新フェーズ構成:**
- Phase 1（分析・計画）: 旧Phase 1（設計書ゲート）+ 旧Phase 2（要件定義）+ 旧Phase 3（影響分析）+ 旧Phase 4（方針策定）
- Phase 2（設計・実装・完了処理）: 旧Phase 5（差分設計）+ 旧Phase 6（影響再検討）+ 旧Phase 7（タスク計画）+ 旧Phase 8（実装）+ 旧Phase 9（完了処理）
- Phase 3（最終整合性チェック）: 旧Phase 10（現状と同じ役割）

### REQ-C-002: バグ修正WF 3フェーズ統合

**方針:** REQ-C-001 と同じ統合ルールを適用する。

**新フェーズ構成:**
- Phase 1（分析・計画）: 旧Phase 1（バグ報告）+ 旧Phase 2（原因分析）+ 旧Phase 3（修正方針）
- Phase 2（設計・実装・ドキュメント反映）: 旧Phase 4（修正設計）+ 旧Phase 5（修正実装）+ 旧Phase 6（ドキュメント更新）
- Phase 3（最終整合性チェック）: 旧Phase 7（現状と同じ役割）

### REQ-C-003: progress-file-format.md 更新

**方針:** §7.5 と §7.6 のフェーズマッピングテーブルを新3フェーズ構成に書き換える。

### REQ-C-004: using-aide-powers 関連ファイル更新

**方針:** ワークフロー選択ガイドのエントリポイントスキル名と、フェーズ遷移の記述を新スキル名に更新する。

### REQ-C-005: 旧フェーズスキル削除

**方針:** 新スキル作成・動作確認後に旧ディレクトリを削除する。削除は最後に行う（移植漏れ防止）。

### REQ-C-006: セッション履歴のStep単位書き出し

**方針:** 全7WFの全フェーズスキル（統合後41ファイル）の Process セクションに、各 Step 完了時の履歴書き出し処理を追加する。phase-compliance-check と compliance-checker の session_history_file パラメータを複数ファイル対応に変更する。

### REQ-C-007: 設計系共通スキルのモード統一（mode: delta）

**方針:** `mode: update` を使用している設計系共通スキル3種（object-design / gui-design / ddd-modeling）を `mode: delta` に統一する。object-design / gui-design は既存設計書を直接更新する動作を廃止し、`{changes_dir}/delta-{領域名}.md` への中間ファイル出力に変更する。ddd-modeling は実態としてすでに delta-design.md に書く動作なので、モード名のみ統一する。

**修正範囲:**
1. 設計系共通スキル本体（3スキル）+ プロンプト（3ファイル）の mode 名統一・出力先変更
2. 呼び出し元フェーズスキル（変更WF・バグ修正WF・リファクタリングWF）の mode 名統一
3. プロジェクト固有ドキュメントの「差分更新モード」表記統一

**Iron Law との整合:** 「差分設計フェーズ中は既存設計書を直接変更しない」と整合する。既存設計書への反映は doc-sync 経由で完了処理時に行う。

## リファクタリング検討結果

**結論:** 不要

**理由:** 今回の変更自体がフェーズ構成の簡素化（10→3、7→3）であり、実質的にリファクタリングに相当する。追加のリファクタリングは不要。
