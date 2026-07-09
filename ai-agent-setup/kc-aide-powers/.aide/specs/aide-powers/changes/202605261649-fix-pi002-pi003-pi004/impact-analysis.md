# 影響範囲分析

## アクター視点の影響

| アクター | 影響内容 | 影響度 |
|---|---|---|
| AI エージェント（オーケストレータ） | タスク計画フェーズでレベル概念を使わなくなる | 中 |
| AI エージェント（micro-impl-agent） | 非プログラム成果物の簡略サイクルが明示される | 中 |
| AI エージェント（オーケストレータ） | 工程チェック表が自動生成されるようになる | 高 |
| AI エージェント（compliance-checker） | history.md の成果物チェックが常に必須になる | 中 |

## プログラム構成視点の影響

### REQ-C-001: タスク計画スキルのレベル構成記述更新

| 修正対象 | 参照元 | 影響 |
|---|---|---|
| `skills/fs-change-phase7-task-planning/SKILL.md` | fs-change-phase6-impact-review → fs-change-phase7-task-planning | delta-task-list.md のフォーマット変更 |
| `skills/fs-change-phase6-task-planning/SKILL.md` | 旧番号体系（同上） | 同上 |
| `skills/fs-bugfix-phase4-design/SKILL.md` | fs-bugfix-phase3-plan → fs-bugfix-phase4-design | タスク分解セクションのフォーマット変更 |
| `skills/fs-refactoring-phase4-design/SKILL.md` | fs-refactoring-phase3-plan → fs-refactoring-phase4-design | 同上 |

### REQ-C-002: 非プログラム成果物の簡略サイクル追加

| 修正対象 | 参照元 | 影響 |
|---|---|---|
| `skills/fs-change-phase8-impl/SKILL.md` | fs-change-phase7-task-planning → fs-change-phase8-impl | 新セクション追加（既存フローに影響なし） |
| `skills/fs-change-phase7-impl/SKILL.md` | 旧番号体系（同上） | 同上 |
| `skills/fs-bugfix-phase5-impl/SKILL.md` | fs-bugfix-phase4-design → fs-bugfix-phase5-impl | 同上 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | fs-refactoring-phase4-design → fs-refactoring-phase5-impl | 同上 |

### REQ-C-003: 工程チェック表生成手順追加

| 修正対象 | 参照元 | 影響 |
|---|---|---|
| `skills/impl-task-planning/SKILL.md` | 全WFのタスク計画フェーズから呼び出される | 出力成果物追加 + テンプレート定義追加 |
| `skills/fs-bugfix-phase4-design/SKILL.md` | （REQ-C-001と同じファイル） | タスク分解ステップに生成手順追加 |
| `skills/fs-change-phase5-delta-design/SKILL.md` | fs-change-phase4-approach → fs-change-phase5-delta-design | タスク分解ステップに生成手順追加 |
| `skills/fs-change-phase7-task-planning/SKILL.md` | （REQ-C-001と同じファイル） | タスク分解ステップに生成手順追加 |
| `skills/fs-change-phase4-delta-design/SKILL.md` | 旧番号体系 | 同上 |
| `skills/fs-change-phase6-task-planning/SKILL.md` | 旧番号体系 | 同上 |
| `skills/fs-refactoring-phase4-design/SKILL.md` | （REQ-C-001と同じファイル） | タスク分解ステップに生成手順追加 |
| `skills/fs-impl-phase2-preparation/SKILL.md` | fs-impl-phase1-gate → fs-impl-phase2-preparation | タスク分解ステップに生成手順追加 |

### REQ-C-004: history.md 必須化

| 修正対象 | 参照元 | 影響 |
|---|---|---|
| `skills/fs-bugfix-phase6-doc/SKILL.md` | fs-bugfix-phase5-impl → fs-bugfix-phase6-doc | 成果物テーブルの条件削除 |

## 起因元ドキュメントフォルダ

- パス: なし
- 理由: 今回の変更は複数の pending-issues（PI-002〜PI-004 + PI-007）を一括対応するものであり、特定の過去変更に起因するものではない。各PIは異なるWFの実行中に発見された問題であり、単一の起因元フォルダは存在しない。

## 影響範囲サマリー

- 修正対象ファイル数: 12ファイル（重複除く）
- 全てスキルファイル（Markdown）のテキスト修正
- 既存の動作を壊す変更はない（追記・条件削除のみ）
- impl-task-planning 共通スキルへの変更が最も影響範囲が広い（全WFから参照される）
