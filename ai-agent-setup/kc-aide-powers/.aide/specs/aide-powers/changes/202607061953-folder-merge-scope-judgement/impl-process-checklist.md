# 工程チェック表

## 状態凡例
- ⬜ todo : 未着手（初期状態）
- 🔄 in-progress : 実行中（担当本人が作業開始直後に設定）
- ✅ done : 完了（PASS。担当本人が output に結果サマリを記入）
- ❌ failed : 失敗（FAIL。担当本人が output にエラー／指摘を記入）
- ➖ skip : 対象外（生成時に確定。非プログラム成果物でスキップする工程。output に判定理由）

## 非プログラム成果物タスク

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| 0.1::implement | 0.1 | skills/folder-merge-check/SKILL.md 更新 | 実装 | ✅ done | micro-impl-agent | 新設Step3（起因元要件との関連性判断、(a)〜(e)）を挿入し、旧Step3→4/旧Step4→5/旧Step5→6/旧Step6→7にリナンバリング。Step4-事前の自己参照「本Step4の判定基準」→「本Step5の判定基準」を更新。完了条件（統合した場合1項目追加・統合しなかった場合の文言追加）、Red Flags2行追加、Common Rationalizations2行追加。Step1・Step2・移動ルール本体・history.md追記テンプレート・Integration節は変更なしを確認済み |
| 0.1::spec_review | 0.1 | skills/folder-merge-check/SKILL.md 更新 | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目数: 15, 差分: 0）。delta-design.mdの「新規追加」（新設Step3(a)〜(e)全文一致）と「既存変更」の変更1〜7（Step4提示情報拡張、Step5〜7リナンバリング＋自己参照更新、完了条件、RedFlags2行、CommonRationalizations2行）を全項目照合しPASS。Step1・Step2・移動ルール本体・history.md追記テンプレート・Integration節は変更なしを逆方向チェックで確認。importルール: N/A（Markdown定義ファイル）。過去不具合修正保持検証: N/A（bugfix/配下該当なし）。「入力」「判断が難しい場合の分岐の位置づけ」記述はdelta-design自身の説明ブロック（変更理由/差分の要点と同位置づけ）であり逐語挿入対象外と判断（既存Step1-7にも個別入力ミニセクションが無い構造的一貫性、トップレベル入力5項目が不変でシグネチャ変更なしの宣言と整合）。 |
| 0.1::write_test | 0.1 | skills/folder-merge-check/SKILL.md 更新 | テスト実装 | ➖ skip | — | 非プログラム成果物（Markdown形式のスキル定義ファイルの内部プロセス変更であり、実行ロジック・テストコードの対象がない）のためテスト工程は対象外。本リポジトリは自動テストフレームワーク非導入・手動検証方針（dev-environment.md §7.4） |
| 0.1::run_test | 0.1 | skills/folder-merge-check/SKILL.md 更新 | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外。動作確認は後続のStep11（動作確認Step）で手動検証として実施する |
| 0.1::quality_review | 0.1 | skills/folder-merge-check/SKILL.md 更新 | コード品質レビュー | ➖ skip | — | 非プログラム成果物（コード品質レビューの対象となる実装コードが存在しない）のため対象外 |
