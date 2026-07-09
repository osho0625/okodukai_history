# 変更要求定義

## 変更概要
- **変更の目的・背景**: 前回変更WF（202607021424-remove-regression-test-rename-terms）で実施した用語統一・Step番号リナンバリングのスコープ外だった箇所に、旧用語・旧番号が残存している。設計書間の用語一貫性を確保するため、PI-056〜PI-061で報告された6箇所の残存旧用語・旧番号を修正する。
- **変更種別**: 非機能変更（設計書の用語統一）

## 要求事項

### REQ-C-001: impl-coding-standards ステータス運用ルール表の旧用語修正
- **種別**: 非機能変更
- **説明**: `skills/impl-coding-standards/SKILL.md` のステータス運用ルール表に残存する旧用語「対象 + 全体リグレッション」を、前回変更WFで定義された新用語に修正する。
- **受入基準**:
  - AC-001: ステータス運用ルール表内の「対象 + 全体リグレッション」という表現が全て新用語に置換されていること
  - AC-002: 修正後のステータス運用ルール表が、前回変更WFの delta-design.md で定義された用語体系と一致していること
- **優先度**: 必須

### REQ-C-002: fs-bugfix-phase2-impl Integration節のStep番号修正
- **種別**: 非機能変更
- **説明**: `skills/fs-bugfix-phase2-impl/SKILL.md` の Integration節「呼び出す共通スキル」表で、リナンバリングに追随していないStep番号を修正する。具体的には doc-sync が旧Step11（正: Step10）、pending-issues-management が旧Step12/13（正: Step11/12）で参照されている。
- **受入基準**:
  - AC-001: Integration節の「呼び出す共通スキル」表で doc-sync のStep番号が Step10 になっていること
  - AC-002: Integration節の「呼び出す共通スキル」表で pending-issues-management のStep番号が Step11/Step12 になっていること
  - AC-003: 修正後のStep番号が、同SKILL.mdの本文Step定義と整合していること
- **優先度**: 必須

### REQ-C-003: bugfix-task-planner-prompt.md 運用ルール節の旧用語修正
- **種別**: 非機能変更
- **説明**: `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` 末尾の運用ルール節に残存する旧用語「リグレッションテストタスクを2系統で分ける」等の表現を、前回変更WFで定義された新用語・新構造に修正する。
- **受入基準**:
  - AC-001: 運用ルール節内の「リグレッションテストタスクを2系統で分ける」等の旧表現が全て削除または新表現に置換されていること
  - AC-002: 修正後の運用ルール節が、前回変更WFの delta-design.md で定義されたテスト構造と一致していること
- **優先度**: 必須

### REQ-C-004: docs-dev リファクタリング冒頭一覧表の旧表現修正
- **種別**: 非機能変更
- **説明**: `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` 冒頭一覧表に残存する旧表現「各タスクごとのセーフティネット全実行」を、前回変更WFで定義された新表現に修正する。
- **受入基準**:
  - AC-001: 冒頭一覧表内の「各タスクごとのセーフティネット全実行」が新表現に置換されていること
  - AC-002: 修正後の表現が、前回変更WFの delta-design.md のリファクタリングWF変更内容と一致していること
- **優先度**: 必須

### REQ-C-005: docs-dev リファクタリングWF設計の旧表現修正
- **種別**: 非機能変更
- **説明**: `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` の複数節に残存する旧表現「各タスク完了ごと」等を、前回変更WFで定義された新表現に修正する。
- **受入基準**:
  - AC-001: 文書内の「各タスク完了ごと」等の旧表現が全て新表現に置換されていること
  - AC-002: 修正後の各節が、前回変更WFの delta-design.md のリファクタリングWF変更内容と一致していること
- **優先度**: 必須

### REQ-C-006: fs-refactoring-phase1-status 記録項目数表現の用語差異修正
- **種別**: 非機能変更
- **説明**: `skills/fs-refactoring-phase1-status/SKILL.md` と `regression-test-prompt.md` 間で記録項目数の表現に軽微な用語差異がある。両ファイル間で一貫した表現に統一する。
- **受入基準**:
  - AC-001: SKILL.md と regression-test-prompt.md で記録項目数に関する表現が統一されていること
  - AC-002: 統一後の表現が文脈として適切であること
- **優先度**: 必須

## 対象外（スコープ外）
- 機能変更（ワークフローの振る舞い変更、新規機能追加）は一切含まない
- 用語/番号の文字列修正以外のロジック変更は行わない
- PI-056〜PI-061で報告された箇所以外のファイル修正は行わない
- 前回変更WF（202607021424-remove-regression-test-rename-terms）の delta-design.md スコープ内ファイルの再修正は行わない

## 前提条件
- 前回変更WF（202607021424-remove-regression-test-rename-terms）が完了済みであること
- 前回変更WFの delta-design.md で定義された新用語・新構造が正式な基準であること
- 各PIで報告された旧用語・旧番号の残存が事実であること

## 関連する既存要件
- UR-001（7つのワークフロー提供）: 本変更はワークフローのスキル定義内用語を修正するため関連
- UR-010（共通スキル群による横断的ユーティリティ）: impl-coding-standards は共通スキルであり、その記述の正確性に関連
- Q-02（全コミットは git-commit-workflow スキル経由）: 本変更のコミットも同ルールに従う
