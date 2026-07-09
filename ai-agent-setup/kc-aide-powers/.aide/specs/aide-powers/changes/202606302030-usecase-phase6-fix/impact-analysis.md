# 影響範囲分析（更新版）

## 変更種別
変更

## 分析バージョン
- Phase 1 版: 差分設計前の軽量分析
- **本版: 差分設計QA APPROVED後の再精査版**

---

## 1. シグネチャ変更追跡（全件）

本プロジェクトはスキル定義ファイル（Markdown）のみで構成されている。「シグネチャ変更」= SKILL.md の状態判定の参照値・完了条件の文言変更。

| # | 変更箇所 | 変更内容 | 参照元 | 影響 |
|---|---|---|---|---|
| S-1 | SKILL.md Step2 完了条件 | 「UCリストのユーザー合意結果(Step2)が『合意』」を削除 | SKILL.md Step2 状態判定 | 「ユーザー合意が得られていない場合」分岐も削除されるため、Step2はサブエージェント完了のみで遷移可能になる |
| S-2 | SKILL.md Step2 成果物セクション | 「UCリストのユーザー合意結果(Step2):」項目を削除 | SKILL.md Step2 完了条件/状態判定 | レポート記載項目が減るため、レポート読み取り時に当該項目を期待する箇所への影響確認が必要 |
| S-3 | SKILL.md Step2 状態判定 | FAIL分岐追加、「ユーザー合意得られていない場合」分岐削除 | サブエージェント usecase-lister | usecase-lister が FAIL を返却可能になる（新規追加のため既存動作への影響なし） |
| S-4 | SKILL.md Step3 成果物セクション | サブエージェント出力→レポート転記の対応関係を明示 | usecase-coverage-reviewer-prompt.md 出力フォーマット | 既存の「### 判定」セクション値との文字列一致を明示化（値自体は変更なし） |
| S-5 | SKILL.md Step5 状態判定 | FAIL分岐追加、プログラム実現不可UCサブフロー追加 | サブエージェント usecase-process-analyzer | DONE_WITH_CONCERNS + 不可能UC一覧時に削除サブフローが起動される |
| S-6 | SKILL.md Integration プロンプトテンプレートリスト | `usecase-removal-prompt.md` 追加 | 管理用リスト（実行に影響なし） | リスト更新のみ |
| S-7 | usecase-lister-prompt.md | 「## 報告フォーマット」セクション追加 | SKILL.md Step2 状態判定 | ステータス値（DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL）がSKILL.md側の期待と整合する |
| S-8 | usecase-process-analyzer-prompt.md | 「## 報告フォーマット」「## プログラム実現不可UCの判定基準」セクション追加 | SKILL.md Step5 状態判定 | ステータス値とプログラム実現不可UC一覧がSKILL.md側のサブフローと連携する |
| S-9 | usecase-coverage-reviewer-prompt.md | 「## 報告フォーマット」セクション拡充 | SKILL.md Step3 状態判定 | 既存のステータス定義を拡充（DONE以外を追加）。値の文字列一致を明示 |
| S-10 | usecase-removal-prompt.md（新規） | UC削除サブエージェントプロンプト新規作成 | SKILL.md Step5 プログラム実現不可UCサブフロー | 新規ファイルのため既存への影響なし |

---

## 2. 既存要件との矛盾確認

| 要件ID | 要件名 | 整合性 | 判定理由 |
|---|---|---|---|
| UR-001 | 7つのワークフロー提供 | ✅ 整合 | 設計WFフェーズ6の改善であり、WF構成自体は変更しない |
| UR-004 | サブエージェント専門分業 | ✅ 整合 | サブエージェント報告フォーマット標準化により連携品質が向上 |
| UR-012 | エラーハンドリング体系 | ✅ 整合 | FAIL追加はsystem-requirements.md §4.1のFAIL定義と一致 |
| UR-014 | ワークフロー中止メカニズム | ✅ 整合 | Step5サブフローはWF中止ではなくStep内処理。中止メカニズムとは独立 |

---

## 3. システム要件との矛盾確認

| システム要件セクション | 整合性 | 判定理由 |
|---|---|---|
| §4.1 エラー分類 | ✅ 整合 | FAIL = フェーズ処理の失敗。今回追加するサブエージェントFAILステータスは同義 |
| §4.2 エラー伝播ルール | ✅ 整合 | FAIL時「ユーザーに対応選択肢を提示」ルールをStep2/Step5で遵守 |
| §4.4 QAレビュー判定基準 | ✅ 無関係 | フェーズ6はQAゲートを持たないため影響なし |
| §7.6 ファイル書き込み制約 | ✅ 整合 | 新規作成のusecase-removal-prompt.mdは50行超のため分割書き込みルール適用 |

**矛盾: なし**

---

## 4. 影響を受けるファイル一覧（変更対象 + 依存元）

### 4.1 変更対象ファイル（直接編集）

| # | ファイル | 変更種別 | 変更概要 |
|---|---|---|---|
| 1 | `skills/fs-design-phase6-usecase/SKILL.md` | 変更 | Step2完了条件修正、Step2成果物修正、Step2/Step5 FAIL分岐追加、Step3転記箇所明示、Step5プログラム実現不可UCサブフロー追加、Integration追記 |
| 2 | `skills/fs-design-phase6-usecase/usecase-lister-prompt.md` | 変更 | 「## 報告フォーマット」セクション追加（末尾追記） |
| 3 | `skills/fs-design-phase6-usecase/usecase-process-analyzer-prompt.md` | 変更 | 「## プログラム実現不可UCの判定基準」「## 報告フォーマット」セクション追加（末尾追記） |
| 4 | `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md` | 変更 | 「## 報告フォーマット」セクション拡充（既存セクション置換） |
| 5 | `skills/fs-design-phase6-usecase/usecase-removal-prompt.md` | 新規追加 | UC削除サブエージェントプロンプトテンプレート |

### 4.2 依存元ファイル（変更対象を参照しているが今回変更しないファイル）

| # | ファイル | 依存内容 | 影響判定 | 理由 |
|---|---|---|---|---|
| 1 | `skills/fs-design-phase5-gui/SKILL.md` | 後処理で `fs-design-phase6-usecase` をactivate | **影響なし** | 呼び出しパラメータ（feature_name, mode）に変更なし |
| 2 | `skills/fs-design-phase7-ddd/SKILL.md` | 前処理で前フェーズ差し戻し先として参照 | **影響なし** | フェーズ間遷移インターフェースに変更なし |
| 3 | `skills/using-aide-powers/references/progress-file-format.md` | Phase 6 のスキル名参照 | **影響なし** | スキル名は変更しない |
| 4 | `skills/fs-design-phase6-usecase/usecase-usability-evaluator-prompt.md` | Step6でusecase-{uc名}.mdを入力参照 | **影響なし** | usecase-{uc名}.mdのフォーマットは変更なし。プログラム実現不可UC削除後はUC数が減るのみ |
| 5 | `skills/fs-design-phase6-usecase/usecase-improver-prompt.md` | Step7でusecase-list.mdを入力参照 | **影響なし** | ファイルフォーマット変更なし。削除済UCが減るのみ |
| 6 | `skills/fs-design-phase6-usecase/usecase-improvement-fix-prompt.md` | Step8で改善反映修正対象としてusecase-list.md等を参照 | **影響なし** | ファイルフォーマット変更なし |
| 7 | `.aide/specs/aide-powers/program-structure.md` | fs-design-phase6-usecaseのプロンプトテンプレートリスト | **要更新** | `usecase-removal-prompt.md` をリストに追記する必要あり |

### 4.3 設計書への反映（変更後に更新が必要な設計資料）

| # | 設計書 | 更新内容 | 優先度 |
|---|---|---|---|
| 1 | `program-structure.md` | `skills/fs-design-phase6-usecase/` のプロンプトテンプレートリストに `usecase-removal-prompt.md` を追記 | 必須（実装完了後に反映） |

---

## 5. テスト対象機能の特定

本プロジェクトはMarkdownのみで構成されており、自動テストは存在しない（dev-environment.md §7.4）。「テスト」= フェーズ6を実行した際の動作確認。

### 5.1 新規テスト対象（本変更で新たに確認が必要な動作）

| # | テスト対象 | 確認内容 | 該当Step |
|---|---|---|---|
| T-1 | Step2 FAIL分岐 | usecase-lister サブエージェントがFAILを返却した場合、オーケストレータがユーザーに報告し対応方針（再実行/入力情報修正/前フェーズ差し戻し）を確認すること | Step2 |
| T-2 | Step2 ユーザー合意不要 | Step2完了条件がサブエージェントのDONE/DONE_WITH_CONCERNSのみで満たされ、ユーザー合意を待たずにStep3へ遷移すること | Step2 |
| T-3 | Step3 転記正確性 | サブエージェント出力の「### 判定」→「結果:」行の値が「網羅性レビュー結果(Step3):」に正しく転記されること | Step3 |
| T-4 | Step3 転記正確性（未カバー一覧） | サブエージェント出力の「### 未カバーユースケース一覧」テーブルが「未カバー操作一覧(Step3):」に正しく転記されること | Step3 |
| T-5 | Step5 FAIL分岐 | usecase-process-analyzer サブエージェントがFAILを返却した場合、オーケストレータがエラー内容と該当UC-IDをユーザーに報告し対応方針を確認すること | Step5 |
| T-6 | Step5 プログラム実現不可UCサブフロー | DONE_WITH_CONCERNSで不可能UC一覧が報告された場合、ユーザーに削除承認フロー（番号付き選択肢）が提示されること | Step5 |
| T-7 | Step5 UC削除サブエージェント起動 | ユーザーが削除承認した場合、usecase-removal-prompt.md ベースのサブエージェントが起動し、usecase-list.md/usecase-{uc名}.mdから該当UCが削除されること | Step5 |
| T-8 | usecase-lister 報告フォーマット準拠 | usecase-lister サブエージェントがStatus行を含む標準フォーマットで出力を返すこと | Step2 |
| T-9 | usecase-process-analyzer 報告フォーマット準拠 | usecase-process-analyzer サブエージェントがStatus行を含む標準フォーマットで出力し、プログラム実現不可UC判定時にDONE_WITH_CONCERNS + 不可能UC一覧を返すこと | Step5 |
| T-10 | usecase-coverage-reviewer 報告フォーマット準拠 | usecase-coverage-reviewer サブエージェントが拡充された報告フォーマット（DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL）で出力を返すこと | Step3 |

### 5.2 リグレッションテスト対象（既存動作の非破壊確認）

| # | テスト対象 | 確認内容 | リスク |
|---|---|---|---|
| R-1 | Step2 正常フロー | usecase-lister が DONE を返却した場合、従来通りStep3へ遷移すること | 低（完了条件からユーザー合意を削除しただけで、正常パスのロジックは不変） |
| R-2 | Step3 正常フロー | 「全操作カバー済み」の場合、従来通りStep4へ遷移すること | 低（値の文字列一致を明示しただけで判定ロジックは不変） |
| R-3 | Step3 未カバー時フロー | 「未カバー操作あり」の場合、従来通りfix→再レビューループが動作すること | 低（判定ロジックは不変） |
| R-4 | Step4 正常フロー | ユーザー承認→Step5遷移が従来通り動作すること | 低（Step4は今回変更対象外） |
| R-5 | Step5 正常フロー | 全UCがDONEの場合、従来通りStep6へ遷移すること | 低（FAIL/不可能UC分岐は新規追加で、DONEパスのロジックは不変） |
| R-6 | Step5 DONE_WITH_CONCERNS（不可能UC以外） | プログラム実現不可でない通常のDONE_WITH_CONCERNSの場合、従来通り懸念報告→対応確認→Step6遷移が動作すること | 中（サブフロー条件分岐が追加されるため、条件判定の正確性要確認） |
| R-7 | Step6以降のフロー | Step6（ユーザビリティ評価）〜Step9（後処理）が従来通り動作すること | 低（Step6以降のStep定義は今回変更対象外） |
| R-8 | Phase 5→Phase 6遷移 | fs-design-phase5-guiからの遷移が従来通り動作すること | 極低（インターフェース変更なし） |
| R-9 | Phase 6→Phase 7遷移 | 後処理完了後のfs-design-phase7-dddへの遷移が従来通り動作すること | 極低（インターフェース変更なし） |

---

## 6. 説明対象アクターの特定

### 6.1 変更によって動作が変わるアクター

| # | アクター | 影響の種類 | 説明が必要な内容 |
|---|---|---|---|
| A-1 | AIエージェント（オーケストレータ: fs-design-phase6-usecase） | 状態判定ロジック変更 | Step2のユーザー合意不要化、Step2/Step5のFAIL分岐追加、Step3の転記箇所明示、Step5のプログラム実現不可UCサブフロー追加 |
| A-2 | AIエージェント（サブエージェント: usecase-lister） | 出力フォーマット追加 | Status行を含む報告フォーマットの遵守義務。FAILステータスの使用条件 |
| A-3 | AIエージェント（サブエージェント: usecase-process-analyzer） | 出力フォーマット追加 + 判定基準追加 | Status行を含む報告フォーマットの遵守義務。プログラム実現不可UC判定基準の適用。DONE_WITH_CONCERNS時の不可能UC一覧出力義務 |
| A-4 | AIエージェント（サブエージェント: usecase-coverage-reviewer） | 出力フォーマット拡充 | 報告フォーマットのステータス種別拡充（DONE以外の追加）。「### 判定」→「結果:」行の値のSKILL.md側期待値との文字列レベル一致の明示化 |
| A-5 | AIエージェント（サブエージェント: usecase-removal）【新規】 | 新規アクター | UC削除処理の実行。usecase-list.mdからの行削除、usecase-{uc名}.mdファイル削除、欠番の許容 |
| A-6 | ソフトウェア開発者（aide-powersユーザー） | 対話フロー変更 | Step2でユーザー合意を求められなくなる（Step4で承認）。Step5でプログラム実現不可UC検出時に削除承認を求められる |

### 6.2 変更によって動作が変わらないアクター（確認済み）

| # | アクター | 確認結果 |
|---|---|---|
| N-1 | AIエージェント（サブエージェント: usecase-usability-evaluator） | usecase-{uc名}.mdのフォーマット変更なし。入力I/Fに影響なし |
| N-2 | AIエージェント（サブエージェント: usecase-improver） | usecase-list.md/usecase-{uc名}.mdのフォーマット変更なし。入力I/Fに影響なし |
| N-3 | AIエージェント（オーケストレータ: fs-design-phase5-gui） | Phase6への呼び出しインターフェース変更なし |
| N-4 | AIエージェント（オーケストレータ: fs-design-phase7-ddd） | Phase6からの遷移インターフェース変更なし |

---

## 7. リスク評価

| # | リスク | 影響度 | 発生確率 | 対策 |
|---|---|---|---|---|
| RK-1 | Step5のDONE_WITH_CONCERNS分岐条件（「プログラム実現不可UC含む/含まない」）の判定が曖昧 | 中 | 低 | delta-designでサブエージェント出力フォーマットに「### プログラム実現不可UC一覧」テーブルの有無で判定する形式を明確に定義済み |
| RK-2 | usecase-removal-prompt.mdが欠番を許容する設計により、Step6以降で存在しないUC-IDを参照するリスク | 低 | 極低 | Step6以降はusecase-list.mdから対象UCを読み取るため、削除済UCは対象外となる。usecase-list.mdから行が削除されているため参照されない |
| RK-3 | Step2完了条件からユーザー合意を削除したことで、ユーザーが確認なしにStep3に進む懸念 | 低 | 極低 | ユーザー合意はStep4で実施する設計。Step2→Step4間は機械的処理（網羅性レビュー）であり、ユーザー判断不要 |

---

## 8. 起因元ドキュメントフォルダ

- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし

---

## 完了条件自己チェック

| # | チェック項目 | 状態 |
|---|---|---|
| C1 | シグネチャ変更全件追跡完了 | ✅（S-1〜S-10の10件を特定） |
| C2 | 既存要件矛盾確認完了 | ✅（UR-001/004/012/014 全て整合） |
| C3 | システム要件影響確認完了 | ✅（§4.1/4.2/4.4/7.6 全て整合、矛盾なし） |
| C4 | テスト対象機能特定済み | ✅（新規T-1〜T-10、リグレッションR-1〜R-9） |
| C5 | 説明対象アクター特定済み | ✅（影響あり6件、影響なし4件を特定） |
| C6 | impact-analysis.md が更新済み | ✅ |
