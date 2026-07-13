# 対応方針書

## 方針概要

| 項目 | 内容 |
|---|---|
| 対応方針 | 既存変更で対応（直接修正） |
| OCP検討結果 | 適用対象外（Markdownドキュメントの修正であり、プログラムコードの拡張ポイントは存在しない） |
| リファクタリング検討結果 | 不要（スキルファイルのテキスト追記・条件削除のみ） |

## 関連箇所

### 変更対象ファイル一覧

| # | ファイル | REQ | 変更内容 |
|---|---|---|---|
| 1 | `skills/fs-change-phase7-task-planning/SKILL.md` | C-001, C-003 | レベル概念削除 + 工程チェック表生成追加 |
| 2 | `skills/fs-change-phase6-task-planning/SKILL.md` | C-001, C-003 | 同上（旧番号体系） |
| 3 | `skills/fs-bugfix-phase4-design/SKILL.md` | C-001, C-003 | レベル概念削除 + 工程チェック表生成追加 |
| 4 | `skills/fs-refactoring-phase4-design/SKILL.md` | C-001, C-003 | 同上 |
| 5 | `skills/fs-change-phase8-impl/SKILL.md` | C-002 | 非プログラム成果物の簡略サイクル追加 |
| 6 | `skills/fs-change-phase7-impl/SKILL.md` | C-002 | 同上（旧番号体系） |
| 7 | `skills/fs-bugfix-phase5-impl/SKILL.md` | C-002 | 同上 |
| 8 | `skills/fs-refactoring-phase5-impl/SKILL.md` | C-002 | 同上 |
| 9 | `skills/impl-task-planning/SKILL.md` | C-003 | 出力成果物追加 + テンプレート定義 |
| 10 | `skills/fs-change-phase5-delta-design/SKILL.md` | C-003 | 工程チェック表生成手順追加 |
| 11 | `skills/fs-change-phase4-delta-design/SKILL.md` | C-003 | 同上（旧番号体系） |
| 12 | `skills/fs-impl-phase2-preparation/SKILL.md` | C-003 | 同上 |
| 13 | `skills/fs-bugfix-phase6-doc/SKILL.md` | C-004 | history.md 条件削除（常に必須化） |

## 変更方針の詳細

### REQ-C-001: レベル概念削除

- delta-task-list.md のドキュメント構成セクションから「レベル別タスク一覧」を削除
- 「依存関係ベース・フラット構成」の記述に置き換え
- impl-task-planning の方式と整合させる

### REQ-C-002: 非プログラム成果物の簡略サイクル追加

- fs-impl-phase4-execution の「成果物種別の判定」「非プログラム成果物の簡略サイクル」セクションを参照元として、同等の記述を追加
- 既存の Process セクション内の適切な位置に挿入

### REQ-C-003: 工程チェック表生成手順追加

- impl-task-planning にテンプレート定義と生成手順を追加
- 各フェーズスキルのタスク分解ステップに「impl-process-checklist.md の生成」を1行追加

### REQ-C-004: history.md 常に必須化

- fs-bugfix-phase6-doc の成果物テーブルから「フォルダ統合済みの場合のみ」を削除
- Step 1 の history.md 指示から条件分岐を削除
- 完了条件テーブルの条件を削除

## リファクタリング検討結果

| 項目 | 内容 |
|---|---|
| 検討結果 | 不要 |
| 理由 | 修正対象は全てMarkdownドキュメント。プログラムコードの構造改善（OCP、Strategy等）の概念が適用されない |
