# 工程チェック表

## 概要

| 項目 | 値 |
|---|---|
| 変更名 | usecase-phase6-fix |
| 成果物種別 | 非プログラム（Markdown） |
| 適用工程 | implement, spec_review |
| スキップ工程 | write_test（➖ skip）, run_test（➖ skip）, code_review（➖ skip） |
| スキップ理由 | 非プログラム成果物のためテスト実装・テスト実行・コード品質レビューは該当なし（dev-environment.md §7.4） |

---

## 凡例

| 記号 | 意味 |
|---|---|
| ⬜ | 未着手 |
| 🔄 | 作業中 |
| ✅ | 完了 |
| ➖ | スキップ（非該当） |
| ❌ | 失敗（要修正） |

---

## チェック表

| # | 行キー | 状態 | 備考 |
|---|---|---|---|
| 1 | D-001::implement | ✅ | usecase-lister-prompt.md 末尾に報告フォーマット追加。Status 5種定義・UC総数・利用者分類数・懸念事項の報告項目を追加完了 |
| 2 | D-001::spec_review | ✅ | PASS（差分0件） |
| 3 | D-002::implement | ✅ | usecase-process-analyzer-prompt.md 末尾に2セクション追加完了（プログラム実現不可UC判定基準+報告フォーマット） |
| 4 | D-002::spec_review | ✅ | delta-design 変更対象7 との整合性確認。全5観点PASS |
| 5 | D-003::implement | ✅ | usecase-coverage-reviewer-prompt.md 報告フォーマット拡充完了 |
| 6 | D-003::spec_review | ✅ | PASS（差分0件） |
| 7 | D-004::implement | ✅ | usecase-removal-prompt.md 新規作成完了（3セクション追記: 削除結果の確認、注意事項、報告フォーマット） |
| 8 | D-004::spec_review | ✅ | PASS（差分0件） |
| 9 | D-005-1::implement | ✅ | SKILL.md Step2 完了条件から「UCリストのユーザー合意結果(Step2)が『合意』であり、」を削除完了 |
| 10 | D-005-1::spec_review | ✅ | PASS（差分0件） |
| 11 | D-005-2::implement | ✅ | Step2 成果物セクションから「ユーザー合意結果」2行を削除完了 |
| 12 | D-005-2::spec_review | ✅ | PASS（差分0件） |
| 13 | D-005-3::implement | ✅ | SKILL.md Step2 状態判定 FAIL分岐追加 |
| 14 | D-005-3::spec_review | ✅ | PASS（差分0件） |
| 15 | D-005-4::implement | ✅ | SKILL.md Step3 転記参照箇所明示（「### 判定」→「結果:」行転記指示 + 「### 未カバーユースケース一覧」転記指示追加） |
| 16 | D-005-4::spec_review | ✅ | PASS（差分0件） |
| 17 | D-005-5::implement | ✅ | SKILL.md Step5 FAIL分岐+プログラム実現不可UCサブフロー追加 |
| 18 | D-005-5::spec_review | ✅ | PASS（差分0件） |
| 19 | D-005-6::implement | ✅ | SKILL.md Integration プロンプトテンプレートリスト更新（usecase-removal-prompt.md 追加） |
| 20 | D-005-6::spec_review | ✅ | PASS（差分0件） |
| 21 | D-006::implement | ✅ | program-structure.md fs-design-phase6-usecase プロンプトテンプレート一覧末尾に usecase-removal-prompt.md 追記完了 |
| 22 | D-006::spec_review | ✅ | PASS（差分0件） |
| 23 | D-R-001::implement | ✅ | PASS: R-1〜R-9 全項目で既存動作維持を確認。Step2(DONE→Step3), Step3(全カバー→Step4/未カバー→fix loop), Step4(承認→Step5), Step5(全DONE→Step6/DONE_WITH_CONCERNS非不可UC→報告+Step6), Step6-9(変更なし), Phase5→6(IF不変), Phase6→7(IF不変) |
| 24 | D-R-001::spec_review | ✅ | PASS（R-1〜R-9 全9項目カバー確認済み、差分0件） |
