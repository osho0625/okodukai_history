# 影響範囲分析（Phase2版: 差分設計確定後の再調査）

## 変更種別
複合（追加＝オブジェクト設計テンプレートへの記載欄新設 / 変更＝object-designスキルの処理手順への技術調査ステップ追加、object-design-qa-agentの検証項目追加）

## 変更内容の確定状況（delta-design.md ベース）

delta-design.md（QA APPROVED済み、索引+4分割ファイル構成）により、変更範囲は以下の6ファイル・計13箇所に確定した。

| # | ファイル | 変更箇所数 | 対応REQ |
|---|---|---|---|
| 1 | `skills/object-design/SKILL.md` | 4箇所（create Step2 / delta Step3 / reverse Step2 / Related skills） | REQ-C-002 |
| 2 | `skills/object-design/object-designer-prompt.md` | 4箇所（quality_checkカテゴリ9新設+カテゴリ数表記修正 / deltaモード手順7 / reverseモード手順10・出力テンプレート） | REQ-C-001, REQ-C-002 |
| 3 | `skills/fs-design-phase8-object/object-designer-prompt.md` | 3箇所（技術的実装情報テンプレート新設 / phase8_{layer-name}手順 / fix手順1） | REQ-C-001, REQ-C-002 |
| 4 | `agents/object-design-qa-agent.md` | 2箇所（担当範囲 / 検証項目L新設）+見出し番号修正1箇所 | REQ-C-003 |
| 5 | `agents/kiro/object-design-qa-agent.md` | 2箇所（担当範囲 / 検証項目L新設） | REQ-C-003 |
| 6 | `agents/kiro/prompts/object-design-qa-agent-prompt.md` | 2箇所（担当範囲 / 検証項目L新設） | REQ-C-003 |

Phase1（軽量版）で対象と推定した6ファイルと完全に一致しており、対象ファイルの漏れ・過不足はない。

## Phase1分析との比較

### 一致した点
- 変更対象6ファイルの特定は Phase1 と完全一致
- 依存元スキル（fs-design-phase8-object, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design, fs-reverse-phase5-optional-phases, design-qa-dispatch）の特定も一致
- 呼び出しパラメータ（mode, feature_name 等）に変更がない、という Phase1 の推定は delta-design.md の「インターフェース影響サマリ」で確定（変更なしと明記）

### 新たに判明した点（Phase1からの精緻化）
1. **fs-design-phase8-object 内での実施タイミングの精緻化**（Phase1では「各レイヤー設計Step」と概括していたが、実際の呼び出し構造を精査した結果、以下の3系統に分かれることが判明）:
   - a. **個別レイヤー設計Step**（Step 3, 5, 7...奇数番）: `object-designer-prompt.md`（ローカル複製、mode: phase8_{layer-name}）を直接呼び出す。今回追加された技術調査ステップ（手順5）はここで実行される
   - b. **個別レイヤーレビューStep**（Step 4, 6, 8...偶数番）: design-qa-dispatch経由で object-design-qa-agent を review_scope=当該レイヤー限定で呼び出す。新設検証項目Lはこの個別レイヤーレビューで実行される
   - c. **全体整合性QAレビュー**（Step (5+2N)、gate3）: design-qa-dispatch経由で object-design-qa-agent を review_scope=全体整合性限定で呼び出すが、fs-design-phase8-object/SKILL.md に明記された検証項目テーブルは「B（レイヤー間依存）」「E（ユビキタス言語）」「レイヤー間IF整合性」の3項目に限定され、「個別レイヤーレビューで検証済みの項目は除外」する設計になっている。したがって**検証項目L（クラス単位の外部連携チェック）は全体整合性レビューでは再実行されず、個別レイヤーレビューでのみ実行される**という運用上の役割分担が明確化された。これはQA判定ロジック自体の変更ではなく、既存の役割分担（個別レイヤーレビュー＝クラス単位検証、全体整合性レビュー＝横断整合性検証）に検証項目Lが自然に収まることの確認である
   - d. **品質基準確認Step (4+2N)**: object-design（共通スキル）を create モードで呼び出し、quality_checkの新設カテゴリ9がここで実行される
2. **見出し番号不整合の解消**（追加対応）: `agents/object-design-qa-agent.md`（Claude Code版）で「ステップ3: 判定と結果の出力」が直前の「ステップ3: 検証項目の実行」と番号重複していた既存不整合を、ユーザー承認（2026-07-06、選択肢2）により本変更に統合して「ステップ4」に修正する。この対応は approach.md 策定後にユーザー指摘で追加されたものだが、実装コード・影響範囲・対応方針自体の変更を伴わない表記修正のため、影響範囲への追加項目はない（pending-issues.md登録も不要と判断済み、delta-design-qa-agents.md確認済み）
3. **並行変更との整合性確認**: 同一3ファイル（object-design-qa-agent 3プラットフォーム版）に対し、既に完了済みの変更 `202606301700-gui-transition-event-design`（doc_index_path入力追加＋ステップ2考慮漏れ検証追加）が適用されていることを実ファイルで確認した。本変更の delta-design.md の before 記述（担当範囲10項目、検証項目K直後にステップ3/4見出し）は、この並行変更適用後の実際のファイル内容と完全に一致しており、コンフリクトは発生しない

## シグネチャ変更の全件追跡

本変更はMarkdown記述（テンプレート・処理手順・検証項目）への追加であり、プログラミング言語のシグネチャ変更は存在しない。「呼び出しパラメータ」に相当する概念（サブエージェント起動時の入力仕様、プロンプトテンプレートの構造）についても以下の通り確認した。

| 確認対象 | 結果 |
|---|---|
| `object-design (aide-powers skill)` の Input from caller（mode, feature_name, specs_dir, date, impact_analysis_path, program_structure_path） | **変更なし**（今回の変更はスキル内部の処理手順・検証観点への追記のみ） |
| `object-design-qa-agent` の入力定義（feature_name, レビュー対象ファイル, 前提成果物ファイル, doc_index_path） | **変更なし**（検証項目Lは既存の入力情報の範囲内で実行可能。新規入力パラメータは不要） |
| `design-qa-dispatch (aide-powers skill)` の入力定義（mode, affected_domains, target_reviewer, review_target_files, prerequisite_files, feature_name, doc_index_path, review_scope） | **変更なし**（object-design-qa-agent の出力内容が変わるだけで、ディスパッチ側のインターフェースには影響しない） |
| `fs-design-phase8-object (aide-powers skill)` の Input from caller（feature_name, doc_index_path, mode, qa_feedback, fix対象） | **変更なし** |
| プロンプトテンプレートのプレースホルダー構造（{mode}, {feature_name}, {specs_dir} 等） | **変更なし**（テンプレート内の記載セクション・検証項目リストへの追記のみ） |

呼び出し元7スキル（fs-design-phase8-object, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design, fs-reverse-phase5-optional-phases, design-qa-dispatch, および design-qa-dispatch の更に上位の呼び出し元）に対して、呼び出しコード（呼び出し方法・渡すパラメータ）の修正は一切不要であることを確定した。

## 既存要件・システム要件との矛盾確認

### user-requirements.md との整合性

| 関連要件 | 整合性 | 根拠 |
|---|---|---|
| UR-004（12種のサブエージェントによる専門分業） | ✅ 整合 | object-design-qa-agent の検証能力強化であり、専門分業の質を高める方向の変更。担当範囲リストへの1行追加も専門分業の枠組みを崩さない |
| UR-005（多段コードレビュー: 設計準拠＋コード品質） | ✅ 整合 | 設計書の情報充足度（外部連携部分の裏付け）向上により、design-review-agent による設計準拠レビューの精度が間接的に向上する好影響 |
| UR-006（設計QAゲート4ゲート、FAIL=0かつWARNING=0→APPROVED） | ✅ 整合 | ゲート3（object-design-qa-agent）の検証項目が A〜K → A〜L に拡張されるが、判定基準の文言・計算方法は変更しない。Q-04（system-requirements.md）とも整合 |
| UR-010（共通スキル群による横断的ユーティリティ、object-design/tech-investigationを含む） | ✅ 整合 | 既存の2スキル（object-design, tech-investigation）を組み合わせる形の変更であり、新規共通スキルの追加は発生しない |
| UR-020（tech-investigationによる技術調査支援） | ✅ 整合 | 「設計・実装判断の前に技術的裏付けを取る」という目的そのものを、外部連携部分の設計に対して具体的なプロセスとして明文化する変更であり、UR-020の狭義の実装拡張にあたる |
| C-07（design-gateがメタ開発では適用対象外） | ✅ 整合 | 本変更はスキル定義・エージェント定義自体の編集であり、dev-environment.md §14 に基づき変更WFのフェーズスキル群（fs-change-phase*）が設計書を兼ねる。前提条件（change-requirements.md）にも明記済み |

矛盾は検出されなかった。

### system-requirements.md の非機能要件への影響

| 非機能要件 | 影響 |
|---|---|
| NF-16（50行超のファイルはWrite+Append分割書き込み） | 影響あり（本変更の実装時、6ファイルへの追記作業そのものがこのルールの対象になる。実装タスク側で遵守すること） |
| NF-17（大きいファイルは分割読み込みで全行取得） | 影響あり（本変更の実装・レビュー時、対象6ファイルは全て10KB超または200行超のため、分割読み込みで全行確認が必要） |
| NF-4（bat版とsh版で同一の配布結果を保証） | 影響なし（本変更はbat/shスクリプトを一切変更しない） |
| その他の非機能要件（NF-1〜3, 5〜15） | 影響なし（マルチプラットフォーム対応・セルフホスティング・拡張性・動作確認方式のいずれにも変更を及ぼさない） |

矛盾・悪影響は検出されなかった。

## テスト対象機能の特定

本変更は非プログラム成果物（Markdown定義ファイル）であるため、C-03（system-requirements.md §7.4 NF-13）の方針通り自動テスト対象はない。動作確認Stepでの確認内容を以下の通り検討する。

### 直接変更する機能（動作確認Stepでの確認対象）

| # | 機能 | 確認内容 |
|---|---|---|
| 1 | object-design スキル create モード（quality_check） | 外部連携クラスを含むオブジェクト設計に対し、quality_checkディスパッチ時にカテゴリ9（外部連携部分の技術調査・参考ドキュメントチェック）が実行され、記載欄未整備の場合に違反として報告されること |
| 2 | object-design スキル delta モード | 外部連携部分に変更が及ぶ差分設計時に、tech-investigation が実施され、調査結果・リンクが技術的実装情報セクション（技術調査結果／参考ドキュメントカテゴリ）に反映されること |
| 3 | object-design スキル reverse モード | 既存コードの外部連携部分逆引き時、コメント/README由来のURL記録、またはtech-investigation補足調査が行われ、出力テンプレートに新設2カテゴリが反映されること |
| 4 | fs-design-phase8-object（mode: phase8_{layer-name}） | 外部連携クラスの新規設計時、tech-investigation実施ステップ（手順5）が実行され、技術的実装情報セクション（新設テンプレート）に反映されること |
| 5 | fs-design-phase8-object（mode: fix） | 検証項目L指摘（外部連携部分の技術調査・参考ドキュメント不足）を受けた修正時、問題種別の箇条書き5番目のルートで tech-investigation が実施され修正されること |
| 6 | object-design-qa-agent（3プラットフォーム版）の検証項目L | 個別レイヤーレビューStepにて、外部連携クラスに技術調査結果・参考ドキュメントリンクが未記載の場合にFAIL判定、記載内容が他の設計記述と不整合な場合にFAIL判定となること。外部連携が存在しないクラスは対象外として扱われること |
| 7 | agents/object-design-qa-agent.md の見出し番号修正 | 検証項目リスト直後の見出しが「ステップ4: 判定と結果の出力」に修正され、直前の「ステップ3: 検証項目の実行」との重複が解消されていること |

### リグレッションテスト対象（既存機能への影響がないことの確認）

| # | 対象 | 確認内容 |
|---|---|---|
| 1 | quality_check モードの既存カテゴリ1〜8 | カテゴリ9追加後も既存8カテゴリの検証内容・順序・判定基準が変化していないこと。カテゴリ数表記が「9カテゴリ」に正しく更新されていること |
| 2 | delta モードの既存手順1〜6（旧8, 9） | 新設手順（旧7内の箇条書き追加）により後続手順の番号が変わらないこと（手順7内への追記のみのため番号ずれなし） |
| 3 | reverse モードの既存手順1〜9、11以降 | 新設手順10内の箇条書き追加により後続手順（11: レイヤー別ファイル生成以降）の番号が変わらないこと |
| 4 | fs-design-phase8-object の技術的実装情報テンプレート新設 | 既存の「クラス設計の共通要件」4項目（役割/パブリックメソッド/パブリックプロパティ/依存関係）の記述・順序が変化していないこと |
| 5 | fs-design-phase8-object mode: phase8_{layer-name} の既存手順1〜4 | 新設手順5挿入により手順6（旧5: Write）・手順7（旧6: ユーザー合意）に番号がずれるが、各手順の意味・順序関係自体は変化していないこと |
| 6 | fs-design-phase8-object mode: fix の既存問題種別1〜4 | 新設5番目の問題種別追加により既存4項目の対応方法が変化していないこと |
| 7 | object-design-qa-agent 検証項目A〜K（3プラットフォーム版） | 検証項目L追加により既存A〜Kの判定ロジック・出力フォーマット・総合判定計算方法（FAIL=0かつWARNING=0→APPROVED）が一切変化していないこと |
| 8 | agents/kiro/object-design-qa-agent.md, agents/kiro/prompts/object-design-qa-agent-prompt.md の既存ステップ4見出し | 検証項目L挿入後も見出し番号「ステップ4」がそのまま維持されていること（修正不要な2ファイルへの誤修正がないこと） |
| 9 | design-qa-dispatch経由の呼び出しインターフェース | object-design-qa-agentへの入力パラメータ（feature_name, レビュー対象ファイル, 前提成果物ファイル, doc_index_path, review_scope）に変更がなく、呼び出し元7スキルのコード変更が不要であること |

## 説明対象アクターの特定

### 操作フローが変わるアクター

| アクター | 変わる操作フロー |
|---|---|
| AIエージェント（オブジェクト設計担当。object-design スキル / fs-design-phase8-object 経由のサブエージェント） | create/delta/reverseの各モードで、外部ツール・外部サービス連携部分を設計する際にtech-investigationを実施するステップが新たに追加される。これまで任意だった技術調査が、外部連携部分に関しては手順として明記される |
| AIエージェント（QAレビュー担当。object-design-qa-agent） | 検証項目リストに項目Lが追加され、外部連携部分の技術調査結果・公式ドキュメントリンクの記載有無・内容整合性を確認する作業が追加される。担当範囲リストにも対応する1行が追加される |

### 新しい操作が追加されるアクター

上記2アクターと同一（tech-investigation呼び出しステップの追加、検証項目Lの実行という新規操作が追加される）。

### 説明対象外（操作フローに変化がないアクター）

| アクター | 理由 |
|---|---|
| ソフトウェア開発者（フレームワーク利用者） | 呼び出しインターフェース（mode, feature_name等）に変更がなく、ワークフローの起動方法・進め方に変化はない。オブジェクト設計書の記載内容が充実し、外部連携部分の設計根拠が追跡可能になる好影響のみを受ける（操作フロー自体は不変のため説明対象外） |
| AIエージェント（オーケストレータ。fs-design-phase8-object等の呼び出し元フェーズスキル） | サブエージェントへの呼び出しパラメータ・呼び出し方法に変更がない。サブエージェントの出力内容・実行時間が変化する可能性はあるが、オーケストレータ自身の操作フロー（Step構成・遷移条件）は変化しない |

## 分析時点の注意事項（Phase2確定版）

- 本分析は delta-design.md（QA APPROVED済み）の確定内容に基づく精密分析であり、Phase1（軽量版）の内容を全面的に置き換える
- 既存の object-design-*.md（過去に作成済みの設計書）への遡及的なリンク追加は変更要求のスコープ外（change-requirements.md 前提条件に明記、delta-design.mdでも再確認済み）
- reverse モードのテンプレート変更は今後の新規逆引き実行時にのみ適用される。既存運用への影響はない

## 起因元ドキュメントフォルダ
- パス: `.aide/specs/aide-powers/changes/202606292033-object-design-role-clarity/`
- コミットハッシュ: `be2b7b852de5f9ca414bc7654b1ddcd29bd79243`
- コミットメッセージ1行目: `feat: object-design スキルに役割定義導出ルールと技術情報セクションを追加`
- 検証結果: 関連あり（Phase1から継続）— `git blame` により、変更対象ファイル（`skills/object-design/SKILL.md`、`skills/object-design/object-designer-prompt.md`、`agents/object-design-qa-agent.md` 3プラットフォーム版）の該当箇所（「技術的実装情報」セクション、検証項目K「技術情報記載有無検証」）はいずれも本コミットが最新の変更者であった。delta-design.md の確定内容（approach.mdの統合方針）により、今回新設する「技術調査結果」「参考ドキュメント（URLリンク付き）」の2カテゴリは、この既存「技術的実装情報」テーブルへの行追加として統合されることが確定した（別セクション新設ではない）。したがって起因元フォルダとの関連性はPhase1の推定通り確認され、統合方針も確定している
