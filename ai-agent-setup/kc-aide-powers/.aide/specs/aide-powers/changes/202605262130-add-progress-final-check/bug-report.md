# バグ報告

## 報告日
2026-05-27

## バグの症状
変更WF `202605262130-add-progress-final-check` で全7WF（planning/design/impl/reverse/change/bugfix/refactoring）に final-check フェーズスキルを追加したが、最終フェーズである final-check が実行されない。

## 再現手順
1. 任意のワークフロー（例: バグ修正WF）を最終フェーズの直前まで実行する
2. 最終フェーズスキル（例: fs-bugfix-phase6-doc）を完了する
3. 後処理の「次フェーズ遷移」セクションに従って遷移先を確認する

## 期待動作
最終フェーズスキルの後処理「次フェーズ遷移」で final-check フェーズスキル（例: fs-bugfix-phase7-final-check）が呼び出されること。
また `.aide/references/progress-file-format.md` の各WFのフェーズ表に final-check 行が含まれていること。

## 実際の動作
- 4つの最終フェーズスキル（fs-impl-phase6-doc-generation / fs-change-phase9-completion / fs-bugfix-phase6-doc / fs-refactoring-phase6-doc）の後処理が「○○ワークフロー完了」のままで、final-check への遷移指示がない
- `.aide/references/progress-file-format.md`（progress-resume-check が参照するコピー）に全7WFの final-check 行が未追加（`skills/using-aide-powers/references/` 版には追加済み）

## 発生頻度
毎回（実装漏れのため、該当WFを実行すれば必ず発生）

## 発生環境・条件
全7WFの最終フェーズで発生

## 補足情報
- 発見元WF: 変更WF (202605262130-add-progress-final-check) の実装漏れ
- 該当ファイル（5ファイル）:
  1. `.aide/references/progress-file-format.md`
  2. `skills/fs-impl-phase6-doc-generation/SKILL.md`
  3. `skills/fs-change-phase9-completion/SKILL.md`
  4. `skills/fs-bugfix-phase6-doc/SKILL.md`
  5. `skills/fs-refactoring-phase6-doc/SKILL.md`
- 関連 pending-issue: PI-014
