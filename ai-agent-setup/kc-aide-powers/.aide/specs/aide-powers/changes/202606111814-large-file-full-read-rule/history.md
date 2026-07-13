# 変更・不具合対応履歴

## 初回変更
- 日付: 2026-06-11
- 依頼内容: PI-032。大きいファイルを分割して全行読み出すルールを global-rules に追記する。メタ開発のフルレビュー中にサブエージェントが長い SKILL.md を読む際、部分ロード（"partially loaded"）や AST 要約モードでファイル後半を読み落とし、req_items 漏れの誤検出（false positive）や削除済み Step の存在誤認（false negative）が発生していたため、読み落とし防止を恒久・汎用ルールとして正本へ反映する。
- 変更概要: global-rules 正本（`skills/using-aide-powers/references/global-rules.md`）の「スキルの所在ルール」直後・「実行環境ルール」前に「大きいファイルを分割して全行読み出すルール」セクションを新規追記（追加のみ／OCP 整合）。version.json の version を 5→6 に +1、updated を 2026-06-11 に更新。配布（`.aide/references/` 置き換え＋`.kiro/steering/aide-powers-global-rules.md` 再生成）は version +1 をトリガーに次回 using-aide-powers 起動時の起動時手順で自動反映される（本変更WFでは手動配布しない）。
- 関連ドキュメント: change-requirements.md, impact-analysis.md, approach.md, delta-design.md, delta-task-list.md
