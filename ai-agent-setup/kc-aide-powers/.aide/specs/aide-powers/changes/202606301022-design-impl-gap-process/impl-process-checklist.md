# 工程チェック表 — 設計漏れ・実装漏れ発見時の対策プロセス定義

## 概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606301022-design-impl-gap-process |
| タスク総数 | 24 |
| 成果物種別 | 全て非プログラム成果物（Markdown） |
| テスト工程 | 全スキップ（NF-13: 自動テストなし） |

---

## 工程チェック表

| 工程 | status | result | remarks |
|---|---|---|---|
| T-01::implement | ✅ done | design-impl-gap-process.md 新規作成完了（設計書§1コードブロック内容と一致） | — |
| T-01::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-01::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-01::spec_review | ✅ done | PASS（検査セクション数: 8, 差分: 0） | — |
| T-01::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-01::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-02::implement | ✅ done | §2変更箇所1(状態判定)適用済確認 + §2変更箇所2(Integration末尾)適用済確認 + §8の3箇所置換完了: REQUIRED SKILL coding-test-2review行（設計同期→設計漏れ時の設計同期）、design-review-agent行（乖離種別判定追加）、呼び出す共通スキルcoding-test-2review行（合理的乖離検出時→設計漏れ（FAIL_PENDING→種別確定後）） | — |
| T-02::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-02::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-02::spec_review | ✅ done | PASS（検査箇所: 5, 差分: 0）— §2変更箇所1(状態判定)+変更箇所2(Integration末尾)+§8の3箇所(REQUIRED SKILL行・design-review-agent行・呼び出す共通スキル行)全てafterと完全一致・beforeテキスト残存なし | — |
| T-02::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-02::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-03::implement | ✅ done | 「設計不備発見時の対応ルール」セクションを「作業中の他ワークフロー起動禁止」直後・「設計書なしの実装禁止」直前に挿入完了（設計書§2.5 afterコードブロック内容と一致） | — |
| T-03::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03::spec_review | ✅ done | PASS（検査セクション数: 1, 差分: 0）— §2.5 afterコードブロック内容と完全一致、挿入位置正確（「作業中の他ワークフロー起動禁止」直後・「設計書なしの実装禁止」直前） | — |
| T-03::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-03b::implement | ✅ done | version 16→17, updated 2026-06-29→2026-06-30 に更新完了（配布トリガー） | — |
| T-03b::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03b::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03b::spec_review | ✅ done | PASS（検査クラス数: N/A, 差分: 0）version 16→17(+1)確認済、updated 2026-06-30 確認済 | — |
| T-03b::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03b::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-03c::implement | ✅ done | APM版 front-matter 維持＋本文を正本 phase-skill-rules.md の全内容で置換完了（「設計不備発見時の対応ルール」「各Step・前処理・後処理の実行前の責務宣言」追加、「作業中の他ワークフロー起動禁止」但し書き追加を含む） | — |
| T-03c::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03c::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03c::spec_review | ✅ done | PASS（検査セクション数: 13, 差分: 0）— APM版本文が正本 phase-skill-rules.md と完全一致。「設計不備発見時の対応ルール」「各Step・前処理・後処理の実行前の責務宣言」含有確認済 | — |
| T-03c::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03c::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-03d::implement | ✅ done | program-structure.md の references/phase-skill-rules.md セクションに「⚠️ 変更時の連動ファイル」注記追加完了 | — |
| T-03d::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03d::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03d::spec_review | ✅ done | PASS（検査クラス数: N/A, 差分: 0）— references/phase-skill-rules.md セクションに「⚠️ 変更時の連動ファイル」注記あり、内容（version.json +1、.apm同期、rules-distribute配布トリガー）設計書指示と完全一致 | — |
| T-03d::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-03d::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-04::implement | ✅ done | 6箇所置換完了: Review Result Handling判定フロー・重要注記・Red Flags・Common Rationalizations・Integration(Required/Calls) | — |
| T-04::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-04::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-04::spec_review | ✅ done | PASS（検査クラス数: N/A, 差分: 0）6箇所全て設計書afterと一致・beforeテキスト残存なし | — |
| T-04::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-04::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-05::implement | ✅ done | 設計準拠レビューFAIL判定を FAIL（実装誤り）+ FAIL_PENDING（種別未確定）分岐に変更。Integration Calls の design-sync 説明文を更新 | — |
| T-05::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-05::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-05::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）— §2変更箇所1(FAIL判定分岐)+変更箇所2(Integration Calls)ともにafter完全一致、beforeテキスト残存なし | — |
| T-05::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-05::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-06::implement | ✅ done | 3箇所置換完了: combined「乖離種別判定ルール」+ combined「判定/報告フォーマット」+ implementation「乖離種別判定ルール」 | — |
| T-06::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-06::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-06::spec_review | ✅ done | PASS（§3指定3箇所は全て正しく反映）。※ FAIL_DESIGN: implementation判定/報告フォーマットに「合理的乖離（該当時）」残存 = 設計書§3の変更指定漏れ | — |
| T-06::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-06::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-07::implement | ✅ done | Phase2変更+Phase3タイトル変更+Rational Deviation Rules廃止+Red Flags+Common Rationalizations 5箇所適用完了 | — |
| T-07::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-07::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-07::spec_review | ✅ done | PASS（差分0件。Phase2変更+Phase3タイトル変更+Rational Deviation Rules廃止+Red Flags+Common Rationalizations 全5箇所適用確認済。beforeテキスト残存なし） | — |
| T-07::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-07::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-08::implement | ✅ done | 2箇所置換完了: Overview「重要」注記（合理的乖離ルールの対象外→設計漏れ判定の対象外+FAIL_IMPL）、Red Flagsテーブル行（合理的乖離として承認→設計漏れとして設計書修正） | — |
| T-08::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-08::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-08::spec_review | ✅ done | PASS（検査セクション数: 2, 差分: 0）Overview「重要」注記・Red Flagsテーブル行の2箇所ともafterと完全一致・beforeテキスト残存なし | — |
| T-08::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-08::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-09::implement | ✅ done | 2箇所置換完了: Step1説明文（合理的乖離検出時→設計漏れ（FAIL_PENDING→種別確定後））、Integration呼び出す共通スキル（同上） | — |
| T-09::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-09::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-09::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）§6変更箇所1(Step1説明文)+変更箇所2(Integration呼び出す共通スキル)ともにafter完全一致・beforeテキスト残存なし | — |
| T-09::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-09::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-10::implement | ✅ done | 2箇所置換完了: 「合理的乖離の許容ルール」→「乖離種別判定ルール」（FAIL_IMPL/FAIL_DESIGN二択判定）+ 報告フォーマット更新。skills/ と .kiro/skills/ 両方に適用 | — |
| T-10::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-10::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-10::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）— 乖離種別判定ルール・報告フォーマットの2箇所ともafterと一致、beforeテキスト残存なし | — |
| T-10::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-10::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-11::implement | ✅ done | 2箇所置換完了: coding-test-2review説明文（合理的乖離検出時→設計漏れ（FAIL_PENDING→種別確定後））、Integration呼び出す共通スキルcoding-test-2review行（同上） | — |
| T-11::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-11::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-11::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）— §9変更箇所1(coding-test-2review説明文)+変更箇所2(Integration呼び出す共通スキル行)ともにafter完全一致・beforeテキスト残存なし | — |
| T-11::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-11::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-12::implement | ✅ done | 2箇所置換完了: coding-test-2review説明文（合理的乖離検出時→設計漏れ（FAIL_PENDING→種別確定後））+ Integration記述（同様の置換） | — |
| T-12::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-12::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-12::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）— §10指定2箇所ともafterと完全一致・beforeテキスト残存なし | — |
| T-12::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-12::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-13::implement | ✅ done | 2箇所置換完了: coding-test-2review説明文（合理的乖離検出時→設計漏れ（FAIL_PENDING→種別確定後））+ Integration呼び出す共通スキル（同上） | — |
| T-13::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-13::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-13::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）— §11の2箇所（coding-test-2review説明文+Integration呼び出す共通スキル行）ともにafterと完全一致・beforeテキスト「合理的乖離検出時」残存なし | — |
| T-13::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-13::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-14::implement | ✅ done | 2箇所置換完了: 「合理的乖離の判定」→「乖離種別の判定」（FAIL_IMPL/FAIL_DESIGNの二択）+ 報告フォーマット「合理的乖離一覧」→「乖離種別一覧（FAIL_DESIGN該当がある場合）」 | — |
| T-14::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-14::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-14::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）§12変更箇所1(乖離種別の判定)+変更箇所2(乖離種別一覧)ともにafter完全一致・beforeテキスト残存なし | — |
| T-14::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-14::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-15::implement | ✅ done | 9箇所置換完了: 担当リスト（合理的乖離→乖離種別判定）+ importルール注記（FAIL_IMPL）+ ステップ5全体（乖離種別判定）+ 出力種別削除（合理的乖離）+ テーブル（FAIL_PENDING詳細）+ サマリ判定文 + FAIL時出力 + 行動規範5,7,8 | — |
| T-15::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-15::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-15::spec_review | ✅ done | PASS（検査箇所: 9, 差分: 0）— §13指定9箇所（担当リスト・importルール注記・ステップ5全体・出力種別削除・テーブル・サマリ判定文・FAIL時出力・行動規範5,7,8）全てafterと完全一致・beforeテキスト「合理的乖離」残存なし | — |
| T-15::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-15::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-16::implement | ✅ done | §13と同一パターン全10箇所適用完了: 担当リスト・importルール注記・ステップ5全体・種別説明・乖離詳細テーブル・サマリ判定文・FAIL時出力・行動規範5,7,8 | — |
| T-16::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-16::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-16::spec_review | ✅ done | PASS（検査箇所: 10, 差分: 0）§13同一パターン全10箇所after一致・beforeテキスト「合理的乖離」残存なし | — |
| T-16::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-16::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-17::implement | ✅ done | §13同一パターン8箇所適用完了: 担当リスト・importルール注記・ステップ5全体・種別削除・テーブル変更・サマリ判定文・FAIL出力・行動規範5,7,8 | — |
| T-17::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-17::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-17::spec_review | ✅ done | PASS（検査箇所: 8, 差分: 0）— §13同一パターン全8箇所適用確認済・beforeテキスト残存なし | — |
| T-17::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-17::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-18::implement | ✅ done | 3箇所置換完了: 判定種別・PASS条件テーブル（合理的乖離→種別未確定）+ ステータス運用（設計漏れ確定時design-sync依頼）+ 行動規範5（種別確定はレビュー中に行わない） | — |
| T-18::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-18::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-18::spec_review | ✅ done | PASS（検査箇所: 3, 差分: 0）— §16の3箇所（判定種別テーブル+ステータス運用+行動規範5）全てafterと完全一致・beforeテキスト残存なし | — |
| T-18::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-18::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-19::implement | ✅ done | 2箇所置換完了: import-review記述（合理的乖離ルールの対象外→設計漏れ判定の対象外）+ Iron Law（合理的乖離として承認→設計漏れとして設計書修正で回避禁止） | — |
| T-19::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-19::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-19::spec_review | ✅ done | PASS（検査箇所: 2, 差分: 0）§17指定2箇所（import-review記述+Iron Law）ともにafter完全一致・beforeテキスト残存なし | — |
| T-19::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-19::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-20::implement | ✅ done | design-sync 呼び出し元を「多段階コードレビューで合理的乖離が承認された場合」→「coding-test-2review の乖離種別確定フローで設計漏れと確定された場合」に変更完了 | — |
| T-20::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-20::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-20::spec_review | ✅ done | PASS（検査箇所: 1, 差分: 0）§18変更箇所（design-sync呼び出し元2行）afterと完全一致・beforeテキスト残存なし | — |
| T-20::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-20::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |
| T-21::implement | ✅ done | 9項目全PASS: 項目1✅(SKILL.md参照あり) 項目2✅(プロセスA定義済) 項目3✅(プロセスB定義済) 項目4✅(プロセスC定義済) 項目5✅(許容済FAIL_DESIGN除外で残存なし) 項目6✅(ユーザー承認フロー削除済) 項目7✅(FAIL_PENDING種別確定フロー記述あり) 項目8✅(正本に「設計不備発見時の対応ルール」追加済) 項目9✅(正本に追加済。配布先同期はrules-distribute自動配布の責務で本タスク対象外) | — |
| T-21::write_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-21::run_test | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-21::spec_review | ✅ done | PASS（検査項目数: 9, 差分: 0）— §5.2全9項目の網羅性確認済・各項目確認結果妥当・項目5のFAIL_DESIGN許容は設計書スコープ外として妥当 | — |
| T-21::code_review | ➖ skip | — | 非プログラム成果物のためスキップ |
| T-21::parent_check | ✅ done | 全工程PASS確認済。独立タスクのため holistic 照合対象なし | — |

---

Docs: .aide/specs/aide-powers/changes/202606301022-design-impl-gap-process/
