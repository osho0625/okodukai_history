# 影響範囲分析

## 変更対象

### 変更WF（10フェーズ → 3フェーズ）

| 旧スキル | 統合先 |
|---|---|
| fs-change-phase1-status | fs-change-phase1-analysis |
| fs-change-phase2-requirements | fs-change-phase1-analysis |
| fs-change-phase3-impact | fs-change-phase1-analysis |
| fs-change-phase4-approach | fs-change-phase1-analysis |
| fs-change-phase5-delta-design | fs-change-phase2-impl |
| fs-change-phase6-impact-review | fs-change-phase2-impl |
| fs-change-phase7-task-planning | fs-change-phase2-impl |
| fs-change-phase8-impl | fs-change-phase2-impl |
| fs-change-phase9-completion | fs-change-phase3-completion |
| fs-change-phase10-final-check | fs-change-phase3-completion |

### バグ修正WF（7フェーズ → 3フェーズ）

| 旧スキル | 統合先 |
|---|---|
| fs-bugfix-phase1-report | fs-bugfix-phase1-analysis |
| fs-bugfix-phase2-analysis | fs-bugfix-phase1-analysis |
| fs-bugfix-phase3-plan | fs-bugfix-phase1-analysis |
| fs-bugfix-phase4-design | fs-bugfix-phase2-impl |
| fs-bugfix-phase5-impl | fs-bugfix-phase2-impl |
| fs-bugfix-phase6-doc | fs-bugfix-phase3-completion |
| fs-bugfix-phase7-final-check | fs-bugfix-phase3-completion |

## 影響を受けるファイル

### 直接変更が必要なファイル

| # | ファイル | 変更内容 |
|---|---|---|
| 1 | skills/fs-change-phase1-analysis/SKILL.md | 新規作成（旧1〜4統合） |
| 2 | skills/fs-change-phase2-impl/SKILL.md | 新規作成（旧5〜8統合） |
| 3 | skills/fs-change-phase3-completion/SKILL.md | 新規作成（旧9〜10統合） |
| 4 | skills/fs-bugfix-phase1-analysis/SKILL.md | 新規作成（旧1〜3統合） |
| 5 | skills/fs-bugfix-phase2-impl/SKILL.md | 新規作成（旧4〜5統合） |
| 6 | skills/fs-bugfix-phase3-completion/SKILL.md | 新規作成（旧6〜7統合） |
| 7 | .aide/references/progress-file-format.md | §7.5, §7.6 のフェーズマッピング更新 |
| 8 | skills/using-aide-powers/SKILL.md | ワークフロー定義・ルーティング更新 |
| 9 | skills/using-aide-powers/references/global-rules.md | エントリポイントスキル名更新 |
| 10 | .kiro/steering/aide-powers-global-rules.md | エントリポイントスキル名更新 |

### 削除対象

| # | ディレクトリ |
|---|---|
| 1 | skills/fs-change-phase1-status/ |
| 2 | skills/fs-change-phase2-requirements/ |
| 3 | skills/fs-change-phase3-impact/ |
| 4 | skills/fs-change-phase4-approach/ |
| 5 | skills/fs-change-phase5-delta-design/ |
| 6 | skills/fs-change-phase6-impact-review/ |
| 7 | skills/fs-change-phase7-task-planning/ |
| 8 | skills/fs-change-phase8-impl/ |
| 9 | skills/fs-change-phase9-completion/ |
| 10 | skills/fs-change-phase10-final-check/ |
| 11 | skills/fs-bugfix-phase1-report/ |
| 12 | skills/fs-bugfix-phase2-analysis/ |
| 13 | skills/fs-bugfix-phase3-plan/ |
| 14 | skills/fs-bugfix-phase4-design/ |
| 15 | skills/fs-bugfix-phase5-impl/ |
| 16 | skills/fs-bugfix-phase6-doc/ |
| 17 | skills/fs-bugfix-phase7-final-check/ |

### 参照元の更新が必要な箇所

旧スキル名を参照している箇所（grep対象）:

- `fs-change-phase0-status` → discloseContext の description 更新
- `fs-bugfix-phase1-report` → discloseContext の description 更新
- compliance-checker agent 内のフェーズ番号参照（total_phases）
- progress-final-checker agent 内のフェーズ番号参照（total_phases）

## 起因元ドキュメントフォルダ

なし（新規変更）

## テスト対象

- 新スキルが正しく activate できること
- progress-file-format.md の新テンプレートで進捗ファイルが正しく作成されること
- using-aide-powers からのルーティングが新スキル名に正しく遷移すること
- セッション履歴ファイルが各Step完了時に正しく書き出されること
- compliance-checker が複数履歴ファイルを正しく読み込んで検証できること
- 最終フェーズPASS後に履歴ファイルが正しく削除されること

## REQ-C-006 による追加影響

### 追加で変更が必要なファイル

| # | ファイル | 変更内容 |
|---|---|---|
| 11 | skills/phase-compliance-check/SKILL.md | session_history_files パラメータ対応（単数→複数） |
| 12 | agents/compliance-checker.md | 複数ファイル読み込み対応 |
| 13 | 全7WFの全フェーズスキル（約40ファイル） | 各Step完了時の履歴書き出し処理追加 |
| 14 | 最終フェーズスキル（7つの *-final-check） | PASS時の履歴ファイル一括削除処理追加 |
| 15 | .aide/references/phase-skill-rules.md | Step完了時の履歴書き出しルール追加 |
| 16 | skills/using-aide-powers/references/phase-skill-rules.md | 同上 |
