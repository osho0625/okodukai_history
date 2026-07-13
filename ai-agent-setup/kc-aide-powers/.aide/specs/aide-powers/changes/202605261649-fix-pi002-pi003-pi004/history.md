# 変更履歴

## 202605261649-fix-pi002-pi003-pi004

| 項目 | 内容 |
|---|---|
| 変更日 | 2026-05-28 |
| 変更種別 | バグ修正（PI-002, PI-003, PI-004, PI-007 一括対応） |
| 変更要求 | REQ-C-001〜REQ-C-004 |

### 変更内容

1. **REQ-C-001: レベル構成記述の更新** — 4ファイルの「レベル別タスク一覧」を「依存関係グラフ」方式に置き換え
2. **REQ-C-002: 非プログラム成果物の簡略サイクル追加** — 4ファイルの実装フェーズスキルに成果物種別判定+簡略サイクルを追加
3. **REQ-C-003: 工程チェック表生成手順の追加** — 7ファイルのタスク分解ステップに impl-process-checklist.md 生成手順を追加
4. **REQ-C-004: history.md 常に必須化** — fs-bugfix-phase6-doc/SKILL.md の条件分岐を削除し常に必須に変更

### 修正対象ファイル（12ファイル）

| # | ファイル | 対応REQ |
|---|---|---|
| 1 | skills/fs-change-phase7-task-planning/SKILL.md | C-001, C-003 |
| 2 | skills/fs-change-phase6-task-planning/SKILL.md | C-001, C-003 |
| 3 | skills/fs-bugfix-phase4-design/SKILL.md | C-001, C-003 |
| 4 | skills/fs-refactoring-phase4-design/SKILL.md | C-001, C-003 |
| 5 | skills/fs-change-phase8-impl/SKILL.md | C-002 |
| 6 | skills/fs-change-phase7-impl/SKILL.md | C-002 |
| 7 | skills/fs-bugfix-phase5-impl/SKILL.md | C-002 |
| 8 | skills/fs-refactoring-phase5-impl/SKILL.md | C-002 |
| 9 | skills/fs-change-phase5-delta-design/SKILL.md | C-003 |
| 10 | skills/fs-change-phase4-delta-design/SKILL.md | C-003 |
| 11 | skills/fs-impl-phase2-preparation/SKILL.md | C-003 |
| 12 | skills/fs-bugfix-phase6-doc/SKILL.md | C-004 |
