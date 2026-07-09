# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応（文字列修正のみ）
- **OCP検討結果**: N/A（非機能変更。設計書・ドキュメント内の用語/番号の文字列修正であり、ソフトウェアの振る舞い変更を伴わない）

## 関連箇所

### 変更対象
| ファイル | 変更内容 |
|---|---|
| `skills/impl-coding-standards/SKILL.md` | ステータス運用ルール表の旧用語「対象 + 全体リグレッション」を新用語に修正 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | Integration節「呼び出す共通スキル」表のStep番号修正（doc-sync: 旧Step11→Step10、pending-issues: 旧Step12/13→Step11/12） |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | 運用ルール節の旧表現「リグレッションテストタスクを2系統で分ける」を新表現に修正 |
| `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | 冒頭一覧表の「各タスクごとのセーフティネット全実行」を新表現に修正 |
| `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` | 複数節の「各タスク完了ごと」等の旧表現を新表現に修正 |
| `skills/fs-refactoring-phase1-status/SKILL.md` | 記録項目数表現の用語差異を修正（`refactoring-status-checker-prompt.md` との統一） |

### 新規追加
なし（全て既存ファイルの文字列修正のみ）

## 変更方針の詳細

### REQ-C-001〜006（共通方針）
- **方針**: 各ファイルの該当箇所を特定し、旧用語/旧番号を新用語/新番号に文字列置換する
- **理由**: 前回変更WFで定義された新用語/新番号が正式な基準であり、残存箇所をそれに統一する
- **具体的な手法**: 各ファイルを Read で読み込み、該当箇所を Edit（str_replace）で修正する。前回変更WFの delta-design.md で定義された新用語・新構造を正として適用する

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 用語/番号の文字列修正のみであり、コード構造・アーキテクチャの変更を伴わない。OCP原則に基づく構造改善の余地がない（そもそも構造変更ではない）
