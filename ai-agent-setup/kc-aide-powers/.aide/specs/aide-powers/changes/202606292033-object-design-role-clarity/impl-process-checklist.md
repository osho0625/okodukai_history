# 工程チェック表

> 本変更は6ファイルすべてが非プログラム成果物（実行ロジックを持たないMarkdown定義ファイル）への既存変更（記述追加）である。
> テスト実装（write_test）・テスト実行（run_test）・コード品質レビュー（quality_review）は全タスクで対象外（➖ skip）とし、実装（implement）・設計準拠レビュー（spec_review）のみを実工程とする。

## 状態凡例
- ⬜ todo : 未着手（初期状態）
- 🔄 in-progress : 実行中（担当本人が作業開始直後に設定）
- ✅ done : 完了（PASS。担当本人が output に結果サマリを記入）
- ❌ failed : 失敗（FAIL。担当本人が output にエラー／指摘を記入）
- ➖ skip : 対象外（生成時に確定。非プログラム成果物でスキップする工程。output に判定理由）

## 非プログラム成果物タスク

| 行キー | タスクID | タスク | 工程 | 状態 | 実行エージェント | output |
|--------|---------|--------|------|------|----------------|--------|
| D-001::implement | D-001 | skills/object-design/SKILL.md | 実装 | ✅ done | micro-impl-agent | delta-design-object-design-skill.md の4件（create Step2末尾1項目追加／delta Step3新規ステップ挿入／reverse Step2末尾7番目ステップ追加／Integration Related skills末尾1項目追加）を反映。既存記述は変更なし |
| D-001::write_test | D-001 | skills/object-design/SKILL.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-001::run_test | D-001 | skills/object-design/SKILL.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-001::spec_review | D-001 | skills/object-design/SKILL.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（検査項目数: 4, 差分: 0）。delta-design-object-design-skill.md の変更対象1-1〜1-4全4項目（createモードStep2末尾1項目追加／deltaモードStep3新規ステップ挿入・後続番号ずれ／reverseモードStep2末尾7番目ステップ追加／Integration Related skills末尾1項目追加）が文言完全一致で反映されている。既存記述・順序・意味関係に変化なし。設計書にない追加項目なし。 |
| D-001::quality_review | D-001 | skills/object-design/SKILL.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-002::implement | D-002 | skills/object-design/object-designer-prompt.md | 実装 | ✅ done | micro-impl-agent | delta-design-object-designer-prompt.mdの2-1〜2-4全差分を反映済み。①quality_checkカテゴリ数「8→9」、②カテゴリ9新設（外部連携部分の技術調査・参考ドキュメントチェック）、③deltaモード手順7に外部連携時のtech-investigation実施を追記、④reverseモード手順10に参考ドキュメントURL抽出/tech-investigation補足調査を追記、⑤reverseモード出力テンプレートに「技術調査結果」「参考ドキュメント（URLリンク付き）」の2行を追加。非プログラム成果物のためテスト工程は対象外。 |
| D-002::write_test | D-002 | skills/object-design/object-designer-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-002::run_test | D-002 | skills/object-design/object-designer-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-002::spec_review | D-002 | skills/object-design/object-designer-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（検査項目5, 差分0）。delta-design-object-designer-prompt.md の変更対象2-1〜2-4の全5変更点（①カテゴリ数表記8→9, ②カテゴリ9新設「外部連携部分の技術調査・参考ドキュメントチェック」を8直後・出力見出し直前に挿入, ③deltaモード手順7に外部連携時tech-investigation追記（手順番号7-9維持）, ④reverseモード手順10に参考ドキュメントURL抽出/補足調査追記（手順番号10-11維持）, ⑤reverseモード出力テンプレートに技術調査結果/参考ドキュメント2行追加（既存5行・注記は不変））が全て正確に反映されていることを確認。既存記述の変化・未定義の追加なし。 |
| D-002::quality_review | D-002 | skills/object-design/object-designer-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-003::implement | D-003 | skills/fs-design-phase8-object/object-designer-prompt.md | 実装 | ✅ done | micro-impl-agent | delta-design-phase8-prompt.md の変更対象3-1〜3-3を反映。3-1: クラス設計共通要件に「技術的実装情報（該当する場合）」7カテゴリのテーブルを新設。3-2: mode: phase8_{layer-name} 処理手順に技術調査ステップ（旧手順5の前）を挿入し旧5→6, 旧6→7に採番変更。3-3: mode: fix 処理手順1の箇条書きに「外部連携部分の技術調査・参考ドキュメント不足」項目を追加。既存構造・順序は変更対象以外は維持。 |
| D-003::write_test | D-003 | skills/fs-design-phase8-object/object-designer-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-003::run_test | D-003 | skills/fs-design-phase8-object/object-designer-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-003::spec_review | D-003 | skills/fs-design-phase8-object/object-designer-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（検査項目3, 差分0）。delta-design-phase8-prompt.md の変更対象3-1〜3-3の全3項目を確認。3-1: 「クラス設計の共通要件」の依存関係直後・オブジェクトの生成・管理パターン直前に「技術的実装情報（該当する場合）」7カテゴリのテーブルが新設され、skills/object-design/object-designer-prompt.md のreverseモードテンプレートと同一構成・同一運用ルール（注記含む）で完全一致。3-2: mode: phase8_{layer-name} 処理手順の旧手順5（Write）の直前にtech-investigation実施ステップが挿入され、旧5→6, 旧6→7に採番変更、既存手順1〜4は不変。3-3: mode: fix 処理手順1の箇条書きに「外部連携部分の技術調査・参考ドキュメント不足」項目が追加され、既存4項目は不変。設計書にない追加項目なし。 |
| D-003::quality_review | D-003 | skills/fs-design-phase8-object/object-designer-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-004::implement | D-004 | agents/object-design-qa-agent.md | 実装 | ✅ done | micro-impl-agent | delta-design-qa-agents.md の変更対象4-1・4-2を反映済み。①担当範囲リスト末尾に「外部連携部分の技術調査結果・公式ドキュメントリンク検証」を1行追加、②検証項目K直後に検証項目L（外部連携部分の技術調査結果・公式ドキュメントリンク検証）を新設、③検証項目リスト直後の見出しを「ステップ3: 判定と結果の出力」から「ステップ4: 判定と結果の出力」に修正（見出し番号不整合解消、ユーザー承認済み）。既存記述への変更はなし。 |
| D-004::write_test | D-004 | agents/object-design-qa-agent.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-004::run_test | D-004 | agents/object-design-qa-agent.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-004::spec_review | D-004 | agents/object-design-qa-agent.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（検査項目3, 差分: 0）。担当範囲1行追加・検証項目L新設・見出し番号「ステップ3→ステップ4」修正の全3項目が設計書通りに反映されており、既存項目A〜Kの判定ロジック・出力フォーマットへの変更なし |
| D-004::quality_review | D-004 | agents/object-design-qa-agent.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-005::implement | D-005 | agents/kiro/object-design-qa-agent.md | 実装 | ✅ done | micro-impl-agent | delta-design-qa-agents.md の変更対象5-1・5-2を反映済み。①担当範囲リスト末尾に「外部連携部分の技術調査結果・公式ドキュメントリンク検証」を1行追加、②検証項目K直後に検証項目L（外部連携部分の技術調査結果・公式ドキュメントリンク検証）を新設。本ファイルは元から見出しが「ステップ4: 判定と結果の出力」と正しい連番のため見出し修正は不要（design_refs記載通り）。既存記述への変更なし。 |
| D-005::write_test | D-005 | agents/kiro/object-design-qa-agent.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-005::run_test | D-005 | agents/kiro/object-design-qa-agent.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-005::spec_review | D-005 | agents/kiro/object-design-qa-agent.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（差分0件）。担当範囲末尾に「外部連携部分の技術調査結果・公式ドキュメントリンク検証」1行追加、検証項目K直後に検証項目L新設、いずれもdelta-design-qa-agents.md（変更対象5-1・5-2）のafter全文と完全一致。見出しは元から「ステップ4: 判定と結果の出力」で誤変更なし。既存記述（A〜K、判定基準、行動規範）への影響なし。 |
| D-005::quality_review | D-005 | agents/kiro/object-design-qa-agent.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-006::implement | D-006 | agents/kiro/prompts/object-design-qa-agent-prompt.md | 実装 | ✅ done | micro-impl-agent | delta-design-qa-agents.md の変更対象6-1・6-2を反映済み。①担当範囲リスト末尾に「外部連携部分の技術調査結果・公式ドキュメントリンク検証」を1行追加、②検証項目K直後に検証項目L（外部連携部分の技術調査結果・公式ドキュメントリンク検証）を新設。本ファイルは元から見出しが「ステップ4: 判定と結果の出力」と正しい連番のため見出し修正は不要（design_refs記載通り）。既存記述への変更なし。 |
| D-006::write_test | D-006 | agents/kiro/prompts/object-design-qa-agent-prompt.md | テスト実装 | ➖ skip | — | 非プログラム成果物（実行ロジックなし）のためテスト工程は対象外 |
| D-006::run_test | D-006 | agents/kiro/prompts/object-design-qa-agent-prompt.md | テスト実行 | ➖ skip | — | 非プログラム成果物のため対象外 |
| D-006::spec_review | D-006 | agents/kiro/prompts/object-design-qa-agent-prompt.md | 設計準拠レビュー | ✅ done | design-review-agent | PASS（検査項目3, 差分: 0）。delta-design-qa-agents.md の変更対象6-1・6-2の全2項目（①担当範囲リスト末尾に「外部連携部分の技術調査結果・公式ドキュメントリンク検証」1行追加、②検証項目K直後に検証項目L新設）がafter全文と完全一致で反映されている。本ファイルは元から見出しが「ステップ4: 判定と結果の出力」で正しい連番のため見出し修正は不要と判断され、実際に誤修正されていないことも確認。既存項目A〜Kの判定ロジック・出力フォーマット・行動規範への変更なし。設計書にない追加項目なし。 |
| D-006::quality_review | D-006 | agents/kiro/prompts/object-design-qa-agent-prompt.md | コード品質レビュー | ➖ skip | — | 非プログラム成果物のため対象外 |

## 監査ルール（ホワイトリスト強制）

- 各工程行の「実行エージェント」は、状態が `🔄/✅/❌` のとき、その工程キーに対応する担当エージェント（implement→micro-impl-agent、spec_review→design-review-agent）であり、かつホワイトリスト3エージェント（micro-impl-agent / design-review-agent / code-review-agent）のいずれかでなければならない。
- 工程キーと実行エージェントの対応が不一致、またはホワイトリスト以外の場合は ❌ FAIL 扱いとする。
- オーケストレータ（起動元）が代理で `✅ done` を書くこと（実施していない工程をやったことにする）は禁止。各工程の担当サブエージェント本人が、自分の工程行（1物理行）のみを更新する。
