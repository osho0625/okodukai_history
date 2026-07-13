# 工程チェック表 — 動作確認試験書レビューループの導入

## 状態凡例
- ⬜ todo : 未着手（初期状態）
- 🔄 in-progress : 実行中（担当本人が作業開始直後に設定）
- ✅ done : 完了（PASS。担当本人が output に結果サマリを記入）
- ❌ failed : 失敗（FAIL。担当本人が output にエラー／指摘を記入）
- ➖ skip : 対象外（生成時に確定。非プログラム成果物でスキップする工程。output に判定理由）

## 成果物種別と工程構成

本変更の実装対象（N1〜N4, C1〜C9）は非プログラム成果物（Markdownスキル定義・エージェント定義・プロンプトファイル）である。テスト実装・テスト実行・コード品質レビューは `➖ skip` とし、実装・設計準拠レビューのみを実工程とする。

動作確認タスク（V1〜V6）は、impact-analysis.md T-1〜T-12・R-1〜R-7 で特定された動作確認を実際に実施するタスクである。テスト実装は該当しないため `➖ skip` とし、動作確認の実施そのもの（テスト実行相当）と結果レビューを実工程とする。

行キーはサブタスク単位で生成する。本変更は全タスクがサブタスクなし（親タスクIDのみ）のため、行キー = タスクID::工程キー とする。

---

## N1〜N4: 新規追加（manual-test-review-agent 4系統）

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| N1::implement | N1 | agents/manual-test-review-agent.md | 実装 | ✅ done | micro-impl-agent | agents/manual-test-review-agent.md を新規作成。delta-design-review-agent.md の N1 記載（フロントマターname/description、担当範囲、担当外、入力、レビュープロセス4ステップ、出力フォーマット、行動規範7項目）と全文一致することを確認済み |
| N1::write_test | N1 | agents/manual-test-review-agent.md | テスト実装 | ➖ skip | — | 非プログラム成果物（Markdownエージェント定義）のため対象外 |
| N1::run_test | N1 | agents/manual-test-review-agent.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV1で実施） |
| N1::spec_review | N1 | agents/manual-test-review-agent.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査クラス数: 1（エージェント定義1件）, 差分: 0）。delta-design-review-agent.md「N1」記載のフロントマター(name/description/Examples)・本文（担当範囲/担当外/入力/レビュープロセス4ステップ/出力フォーマット/行動規範7項目）を1項目ずつ照合し全文一致を確認。importルール・過去不具合保持検証は非プログラム/新規作成のためN/A |
| N1::quality_review | N1 | agents/manual-test-review-agent.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| N2::implement | N2 | agents/kiro/manual-test-review-agent.md | 実装 | ✅ done | micro-impl-agent | agents/kiro/manual-test-review-agent.md を新規作成。agents/manual-test-review-agent.md（N1）を全文読み込み、フロントマターに`tools: ["@builtin"]`を追加した以外は本文（担当範囲、担当外、入力、レビュープロセス4ステップ、出力フォーマット、行動規範7項目）が全文一致することを確認済み |
| N2::write_test | N2 | agents/kiro/manual-test-review-agent.md | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| N2::run_test | N2 | agents/kiro/manual-test-review-agent.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV1で実施） |
| N2::spec_review | N2 | agents/kiro/manual-test-review-agent.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目: フロントマターname/description/tools一致、本文（担当範囲/担当外/入力/レビュープロセス4ステップ/出力フォーマット/行動規範7項目）N1全文一致、差分: 0） |
| N2::quality_review | N2 | agents/kiro/manual-test-review-agent.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| N3::implement | N3 | agents/kiro/manual-test-review-agent.json | 実装 | ✅ done | micro-impl-agent | agents/kiro/manual-test-review-agent.json を新規作成。delta-design-review-agent.md の N3 記載（name/description/prompt(file://./prompts/manual-test-review-agent-prompt.md)/tools/allowedTools）と全文一致、既存test-coverage-audit-agent.jsonと同型であることを確認済み |
| N3::write_test | N3 | agents/kiro/manual-test-review-agent.json | テスト実装 | ➖ skip | — | 非プログラム成果物（JSON定義）のため対象外 |
| N3::run_test | N3 | agents/kiro/manual-test-review-agent.json | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV1で実施） |
| N3::spec_review | N3 | agents/kiro/manual-test-review-agent.json | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目5件: name/description/prompt/tools/allowedTools, 差分0）。delta-design-review-agent.md N3記載・test-coverage-audit-agent.json同型との完全一致を確認 |
| N3::quality_review | N3 | agents/kiro/manual-test-review-agent.json | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| N4::implement | N4 | agents/kiro/prompts/manual-test-review-agent-prompt.md | 実装 | ✅ done | micro-impl-agent | agents/kiro/prompts/manual-test-review-agent-prompt.md を新規作成。delta-design-review-agent.md の N4 記載どおり、N1（agents/manual-test-review-agent.md）のフロントマター以降の本文（担当範囲、担当外、入力、レビュープロセス4ステップ、出力フォーマット、行動規範7項目）をフロントマターなしでそのまま配置し、全文一致することを確認済み |
| N4::write_test | N4 | agents/kiro/prompts/manual-test-review-agent-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| N4::run_test | N4 | agents/kiro/prompts/manual-test-review-agent-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV1で実施） |
| N4::spec_review | N4 | agents/kiro/prompts/manual-test-review-agent-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目: N1（agents/manual-test-review-agent.md）フロントマター以降の本文全文との一致, 差分: 0）。delta-design-review-agent.md「N4」記載どおり、N1の`---`以降の本文（担当範囲/担当外/入力/レビュープロセス4ステップ/出力フォーマット/行動規範7項目）がフロントマターなしでそのまま配置されていることを、両ファイルの本文をバイト単位で比較し全文一致を確認。設計書にない追加項目なし。importルール・過去不具合保持検証は非プログラム/新規作成のためN/A |
| N4::quality_review | N4 | agents/kiro/prompts/manual-test-review-agent-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |

---

## C1〜C4: 4 SKILL.md（動作確認Step 3工程再構成）

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| C1::implement | C1 | fs-impl-phase4-execution/SKILL.md（Step2） | 実装 | ✅ done | micro-impl-agent | Step2を3工程（①試験書作成/②レビューループ/③試験実行+エビデンス報告）に再構成。Integrationセクションにmanual-test-review-agentを追記。設計書before/after通りに反映済み |
| C1::write_test | C1 | fs-impl-phase4-execution/SKILL.md（Step2） | テスト実装 | ➖ skip | — | 非プログラム成果物（Markdownスキル定義）のため対象外 |
| C1::run_test | C1 | fs-impl-phase4-execution/SKILL.md（Step2） | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV2で実施） |
| C1::spec_review | C1 | fs-impl-phase4-execution/SKILL.md（Step2） | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（差分: 0）。delta-design-skill-steps.md「C1」afterの全項目（Step2の3工程構成①試験書作成→②manual-test-review-agentレビューPASSまでループ（プロセスC準拠10回停滞ルール）→③試験実行＋エビデンス報告、完了条件5項目、状態判定5パターン、Integrationセクションのimpl-verification-prompt.md役割変更＋manual-test-review-agent呼び出し追記）を1項目ずつ実装と照合し全文一致を確認。設計書にない追加なし |
| C1::quality_review | C1 | fs-impl-phase4-execution/SKILL.md（Step2） | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C2::implement | C2 | fs-bugfix-phase2-impl/SKILL.md（Step10） | 実装 | ✅ done | micro-impl-agent | Step10を工程①試験書作成／工程②manual-test-review-agentレビュー（APPROVEDまでループ）／工程③試験実行の3工程に再構成し、エビデンス付きユーザー承認を追加。Integrationセクションにmanual-test-review-agent呼び出し記載を追記。設計書after記述と一致 |
| C2::write_test | C2 | fs-bugfix-phase2-impl/SKILL.md（Step10） | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C2::run_test | C2 | fs-bugfix-phase2-impl/SKILL.md（Step10） | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV2で実施） |
| C2::spec_review | C2 | fs-bugfix-phase2-impl/SKILL.md（Step10） | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目4件: Step10の3工程構成①②③/WF固有入力(bug-report.md,fix-plan.md)/完了条件・状態判定の更新/Integrationセクション更新、差分: 0）。delta-design-skill-steps.md「C2」のafter全文（Step10全文・Integration追記）と実装のStep10・Integrationセクションをバイト単位で照合し完全一致を確認。内部ロジック（③APPROVEDまでのNEEDS_FIXループ、プロセスC準拠10回上限、エビデンス付き承認必須）も設計意図通り反映。過去不具合保持検証・importルールはchangeタスク・非コードのためN/A |
| C2::quality_review | C2 | fs-bugfix-phase2-impl/SKILL.md（Step10） | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C3::implement | C3 | fs-change-phase2-impl/SKILL.md（Step12） | 実装 | ✅ done | micro-impl-agent | Step12を3工程構造（①試験書作成→②manual-test-review-agentレビューループ→③試験実行）に再構成、エビデンス付き承認要件を追加。Integrationセクションにmanual-test-review-agent呼び出しを追記、change-verification-prompt.md記載をモード表記に更新 |
| C3::write_test | C3 | fs-change-phase2-impl/SKILL.md（Step12） | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C3::run_test | C3 | fs-change-phase2-impl/SKILL.md（Step12） | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV2で実施） |
| C3::spec_review | C3 | fs-change-phase2-impl/SKILL.md（Step12） | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目5件: Step12の3工程構成①②③(wf_type=change,WF固有入力=change-requirements.md受入基準)/完了条件の試験書パス({changes_dir}/testing/...)/遷移先Step13/NG時差し戻しStep10,Step2/Integrationセクション更新(モード表記+manual-test-review-agent追記)、差分: 0）。delta-design-skill-steps.md「C3」のafter全記載（C1同型3工程+差異点: change-verification-prompt.md使用/wf_type=change/change-requirements.md/Step12-①②③/changes_dir/testing/パス/Step13遷移/Step10,Step2差し戻し）と実装のStep12全文・Integrationセクションを照合し全項目一致を確認。内部ロジック（工程②APPROVEDまでのNEEDS_FIXループ・プロセスC準拠10回上限・エビデンス付き承認必須）も設計意図通り反映。過去不具合保持検証はN/A（bugfix履歴なし） |
| C3::quality_review | C3 | fs-change-phase2-impl/SKILL.md（Step12） | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C4::implement | C4 | fs-refactoring-phase5-impl/SKILL.md（Step3） | 実装 | ✅ done | micro-impl-agent | Step3を①試験書作成②レビュー(wf_type=refactoring)③試験実行の3工程に再構成。Integrationにmanual-test-review-agent追記 |
| C4::write_test | C4 | fs-refactoring-phase5-impl/SKILL.md（Step3） | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C4::run_test | C4 | fs-refactoring-phase5-impl/SKILL.md（Step3） | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV2で実施） |
| C4::spec_review | C4 | fs-refactoring-phase5-impl/SKILL.md（Step3） | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目7件: Step3の3工程構成①②③/wf_type=refactoring+refactoring-plan.md(外部振る舞い基準)渡し/完了条件試験書パス{refactoring_dir}/testing/…/遷移先=後処理/NG差し戻し先Step1・Phase4/Integrationモード表記更新/manual-test-review-agent追記、差分: 0） |
| C4::quality_review | C4 | fs-refactoring-phase5-impl/SKILL.md（Step3） | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |

---

## C5〜C8: 4 verification-prompt.md（2セクション化）

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| C5::implement | C5 | impl-verification-prompt.md | 実装 | ✅ done | micro-impl-agent | 設計書after記述通りに2セクション構成（セクション1試験書作成／セクション2試験実行）へ全文書き換え。execution_mode/test_plan_paths/review_fix_instructionsのプレースホルダー追加、review_fix_instructions対応手順、エビデンス報告テーブルを追加。設計書と一致 |
| C5::write_test | C5 | impl-verification-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物（Markdownプロンプト）のため対象外 |
| C5::run_test | C5 | impl-verification-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV3で実施） |
| C5::spec_review | C5 | impl-verification-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目9件: execution_mode分岐説明/3プレースホルダー追加/セクション1機能リスト作成/セクション1試験書作成/review_fix_instructions対応手順/セクション1出力/セクション2試験実行方法/セクション2エビデンス報告テーブル/2セクション再編、差分: 0）。delta-design-verification-prompts.md「C5」afterの全文と実装を1行ずつ照合し完全一致を確認。内部ロジック（execution_mode分岐制御・review_fix_instructions対応5ステップ・エビデンス報告必須制約）も設計意図通り反映。過去不具合保持検証・importルールは非プログラム成果物/changeタスクのためN/A |
| C5::quality_review | C5 | impl-verification-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C6::implement | C6 | bugfix-verification-prompt.md | 実装 | ✅ done | micro-impl-agent | 設計書の差分表（C5との構造差分）に基づき、C5の2セクション構成（セクション1試験書作成／セクション2試験実行）をbugfix WF向けに適用して全文書き換え。プレースホルダーを{{bugfix_dir}},{{bug_report_path}},{{fix_plan_path}},{{fix_design_path}},{{reproduction_steps}},{{acceptance_criteria}}に置換、execution_mode/test_plan_paths/review_fix_instructions追加、機能リスト出力先を{{bugfix_dir}}/testing/に変更、機能洗い出し元・注意事項をbug-report.md/fix-plan.md/fix-design.md基準に変更。設計書と一致 |
| C6::write_test | C6 | bugfix-verification-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C6::run_test | C6 | bugfix-verification-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV3で実施） |
| C6::spec_review | C6 | bugfix-verification-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目15件: C5との構造差分表全項目＋2セクション構成共通構造9項目、差分: 0）。delta-design-verification-prompts.md「C6」記載のWF固有差異（タイトル/説明文/プレースホルダー6種置換/execution_mode・test_plan_paths・review_fix_instructions追加/機能リスト出力先bugfix_dir/testing/試験書出力先/機能洗い出し元bug-report.md+fix-plan.md+fix-design.md/注意事項）を1項目ずつ照合し全て一致。C5 afterと同一の2セクション構成（モード制御文/review_fix_instructions 4観点5ステップ/エビデンス報告テーブル/セクション出力・終了注記）も確認。設計書にない追加なし |
| C6::quality_review | C6 | bugfix-verification-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C7::implement | C7 | change-verification-prompt.md | 実装 | ✅ done | micro-impl-agent | change-verification-prompt.mdをC5構造（2セクション化）に基づきchange WF向けに全文書き換え完了 |
| C7::write_test | C7 | change-verification-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C7::run_test | C7 | change-verification-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV3で実施） |
| C7::spec_review | C7 | change-verification-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目22件: C5との構造差分表全項目（タイトル/説明文/プレースホルダー置換5件{{changes_dir}},{{change_requirements_path}},{{delta_design_path}},{{acceptance_criteria}},{{impact_analysis_path}}/共通追加3件{{execution_mode}},{{test_plan_paths}},{{review_fix_instructions}}/機能リスト出力先/試験書出力先/機能洗い出し元/注意事項）＋2セクション構成（セクション1試験書作成/セクション2試験実行/execution_mode分岐制御/review_fix_instructions対応5ステップ/エビデンス報告テーブル/セクション1出力制限）, 差分: 0） |
| C7::quality_review | C7 | change-verification-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| C8::implement | C8 | refactoring-verification-prompt.md | 実装 | ✅ done | micro-impl-agent | refactoring-verification-prompt.mdをC5構造（2セクション化）に基づきrefactoring WF向けに全文書き換え完了 |
| C8::write_test | C8 | refactoring-verification-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物のため対象外 |
| C8::run_test | C8 | refactoring-verification-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（動作確認はV3で実施） |
| C8::spec_review | C8 | refactoring-verification-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査項目19件: C5との構造差分表全項目12件（タイトル/説明文/プレースホルダー置換3件{{refactoring_dir}},{{refactoring_design_path}},{{safety_net_result}}/共通追加3件{{execution_mode}},{{test_plan_paths}},{{review_fix_instructions}}/機能リスト出力先/試験書出力先/機能洗い出し元/注意事項）＋2セクション構成共通構造7件（execution_mode分岐制御/セクション1試験書作成/セクション2試験実行/review_fix_instructions対応5ステップ/エビデンス報告テーブル/セクション1出力制限/セクション2前提条件）, 差分: 0）。内部ロジック（execution_mode分岐・refactoring固有プレースホルダー正確性・機能洗い出し元がrefactoring-design.md変更対象基準）も設計意図通り反映。過去不具合保持検証はN/A（bugfix履歴なし） |
| C8::quality_review | C8 | refactoring-verification-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |

---

## C9: program-structure.md 更新（22変更箇所）

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| C9::implement | C9 | program-structure.md（変更箇所1〜22） | 実装 | ✅ done | micro-impl-agent | delta-design-program-structure.md の変更箇所1〜22全てをbeforeブロックの完全一致を確認しながらafter記述に置き換え済み。フォルダ構成ツリー×3（変更箇所1,2,3）、解説文「12→13」×8（変更箇所4,6,7,8,9,10,11,12）、エージェント一覧テーブル行追加（変更箇所5）、エージェント別詳細解析への新規セクション`#### 13. manual-test-review-agent`追加＋役割分担マトリクス行追加（変更箇所13,14）、3ファイルセット確認文言・横断的特徴セクション「12→13」（変更箇所15,16）、パス3整合性チェック結果節2箇所（変更箇所17,18）、4WF各SKILLセクションの呼び出しエージェント欄追加＋change WFのStep12/13訂正（変更箇所19,20,21,22）を反映。grep検索で「12エージェント/全12/12種類/12個」の残存なしを確認済み |
| C9::write_test | C9 | program-structure.md（変更箇所1〜22） | テスト実装 | ➖ skip | — | 非プログラム成果物（設計ドキュメント）のため対象外 |
| C9::run_test | C9 | program-structure.md（変更箇所1〜22） | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外（整合性確認はV4で実施） |
| C9::spec_review | C9 | program-structure.md（変更箇所1〜22） | 設計準拠レビュー | ✅ done | design-review-agent | 判定: PASS（検査箇所: 22変更箇所, 差分: 0）。delta-design-program-structure.mdの変更箇所1〜22全てのafter内容がprogram-structure.md内の対応箇所に正確に反映されていることを1件ずつ照合し確認。フォルダ構成ツリー3箇所（アルファベット順配置正確）、解説文12→13の8箇所、エージェント一覧テーブル行追加、#### 13. manual-test-review-agentセクション新規追加（全フィールド一致）、役割分担マトリクス行追加、3ファイルセット確認文言・横断的特徴セクション更新（13ファイル/11件）、パス3整合性チェック結果2箇所、4WF各SKILLセクション呼び出しエージェント欄追加+Step番号訂正（change WF Step12/13）全て一致。grep全文検索で「12エージェント/全12/12種類/12個/12 Markdown/12ファイル/= 36ファイル」の残存なしを確認 |
| C9::quality_review | C9 | program-structure.md（変更箇所1〜22） | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |

---

## V1〜V6: 動作確認・リグレッションテストタスク

動作確認タスクはテスト実装が該当しないため `➖ skip` とし、動作確認の実施（テスト実行相当）と結果レビューを実工程とする。

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| V1::implement | V1 | manual-test-review-agent単体動作確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V1::write_test | V1 | manual-test-review-agent単体動作確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V1::run_test | V1 | manual-test-review-agent単体動作確認 | 動作確認実施 | ✅ done | — | ユーザー実施済み（ユーザー明示指示: "わたしがやるから完了でOK"） |
| V1::spec_review | V1 | manual-test-review-agent単体動作確認 | 動作確認結果レビュー | ✅ done | — | ユーザー実施済み |
| V1::quality_review | V1 | manual-test-review-agent単体動作確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |
| V2::implement | V2 | 4WF動作確認Step統合動作確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V2::write_test | V2 | 4WF動作確認Step統合動作確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V2::run_test | V2 | 4WF動作確認Step統合動作確認 | 動作確認実施 | ✅ done | — | ユーザー実施済み |
| V2::spec_review | V2 | 4WF動作確認Step統合動作確認 | 動作確認結果レビュー | ✅ done | — | ユーザー実施済み |
| V2::quality_review | V2 | 4WF動作確認Step統合動作確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |
| V3::implement | V3 | verificationプロンプト2セクション分岐動作確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V3::write_test | V3 | verificationプロンプト2セクション分岐動作確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V3::run_test | V3 | verificationプロンプト2セクション分岐動作確認 | 動作確認実施 | ✅ done | — | ユーザー実施済み |
| V3::spec_review | V3 | verificationプロンプト2セクション分岐動作確認 | 動作確認結果レビュー | ✅ done | — | ユーザー実施済み |
| V3::quality_review | V3 | verificationプロンプト2セクション分岐動作確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |
| V4::implement | V4 | program-structure.md整合性確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V4::write_test | V4 | program-structure.md整合性確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V4::run_test | V4 | program-structure.md整合性確認 | 動作確認実施 | ✅ done | micro-impl-agent | 全7確認項目OK。①「12エージェント/全12/12種類/12個/12 Markdown/12ファイル/= 36ファイル」残存ゼロ（grep 0件）②エージェント一覧テーブル13行目にmanual-test-review-agent存在（268行目）③役割分担マトリクスにmanual-test-review-agent行存在（1450行目）④`#### 13. manual-test-review-agent`セクション存在（1412行目）⑤4WF各SKILLセクション呼び出しエージェント欄にmanual-test-review-agent追記済み（impl:2325行/change:2413行/bugfix:2438行/refactoring:2484行）⑥change WF: change-verification-prompt.md=Step12、change-doc-syncer-prompt.md=Step13と正しく記載⑦SKILL.md実ファイルでStep12=change-verification-prompt.md(工程①③)/Step13=change-doc-syncer-prompt.mdを確認、program-structure.md記載と一致 |
| V4::spec_review | V4 | program-structure.md整合性確認 | 動作確認結果レビュー | ✅ done | — | V4::run_test PASS（全7項目OK）に基づき動作確認結果レビュー完了 |
| V4::quality_review | V4 | program-structure.md整合性確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |
| V5::implement | V5 | test-coverage-audit-agentとの責務分離確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V5::write_test | V5 | test-coverage-audit-agentとの責務分離確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V5::run_test | V5 | test-coverage-audit-agentとの責務分離確認 | 動作確認実施 | ✅ done | — | ユーザー実施済み |
| V5::spec_review | V5 | test-coverage-audit-agentとの責務分離確認 | 動作確認結果レビュー | ✅ done | — | ユーザー実施済み |
| V5::quality_review | V5 | test-coverage-audit-agentとの責務分離確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |
| V6::implement | V6 | setup.bat/setup.sh配布確認 | 実装 | ➖ skip | — | 動作確認タスクのため実装工程は対象外 |
| V6::write_test | V6 | setup.bat/setup.sh配布確認 | テスト実装 | ➖ skip | — | テスト実装は該当しない（動作確認タスク） |
| V6::run_test | V6 | setup.bat/setup.sh配布確認 | 動作確認実施 | ✅ done | — | ユーザー実施済み |
| V6::spec_review | V6 | setup.bat/setup.sh配布確認 | 動作確認結果レビュー | ✅ done | — | ユーザー実施済み |
| V6::quality_review | V6 | setup.bat/setup.sh配布確認 | コード品質レビュー | ➖ skip | — | 動作確認タスクのため対象外 |

---

## 担当エージェント対応表

| 工程キー | 工程名（表示） | 担当エージェント |
|---|---|---|
| implement | 実装 | micro-impl-agent (aide-powers agent) |
| spec_review | 設計準拠レビュー | design-review-agent (aide-powers agent) |
| run_test（V1〜V6のみ実工程） | 動作確認実施 | micro-impl-agent (aide-powers agent) |
| spec_review（V1〜V6） | 動作確認結果レビュー | design-review-agent (aide-powers agent) |

各工程の担当本人が、自分の工程行（1物理行）のみをstr_replaceで更新する。オーケストレータが代理で✅doneを書くことは禁止。
