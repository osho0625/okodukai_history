# 変更・不具合対応履歴

## 初回変更
- 日付: 2025-07-06
- 依頼内容: folder-merge-check の統合判断で、起因元と今回作業の要件関連性をAIが判断し、関連が強ければ統合提案、弱ければ起因元なし扱いとするプロセスを追加
- 変更概要: skills/folder-merge-check/SKILL.md に新設Step3「起因元要件との関連性判断」を挿入（優先順位付き3段階の起因元要件読込、workflow_type別の統合先要件読込、関連性の強弱二値判断、判断困難時のユーザー確認、分岐）。既存Step3〜6をStep4〜7にリナンバリング。新Step4のユーザー提示情報に「関連性の判断結果」「判断理由」を追加。完了条件・Red Flags・Common Rationalizationsを更新
- 関連ドキュメント: change-requirements.md, delta-design.md
