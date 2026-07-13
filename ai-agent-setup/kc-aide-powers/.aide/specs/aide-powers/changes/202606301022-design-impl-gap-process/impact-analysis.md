# 影響範囲分析書 — 設計漏れ・実装漏れ発見時の対策プロセス定義

## 1. 変更種別

**追加（機能追加）+ 既存定義変更（合理的乖離概念の廃止）**

設計漏れ・実装漏れ検出後の対策プロセスを新規に定義し、既存スキルに参照を追加する。
加えて、合理的乖離概念を廃止し乖離種別判定（設計漏れ / 実装誤り）への移行を行う（18ファイル）。
さらに、全フェーズスキル共通ルール（phase-skill-rules.md）に「設計不備発見時の対応ルール」を追加する。

---

## 2. アクター視点の影響分析

### 2.1 関連するユーザー要件

| 要件ID | 要件名 | 関連理由 |
|---|---|---|
| UR-005 | 多段コードレビュー（設計準拠＋コード品質の2段階） | 設計準拠レビューが検出した不整合の後続処理として本プロセスが位置づけられる。合理的乖離廃止により判定フローが変更される |
| UR-006 | 設計QAゲート（4ゲート） | 設計漏れ対策プロセスで設計FSを再実行した場合、QAゲートの再通過が必要 |
| UR-007 | 進捗管理機構 | 繰り返しプロセスの進捗追跡が必要 |
| UR-009 | 設計ゲート（design-gate） | 設計漏れ修正後も設計ゲートの整合性が維持される必要がある |
| UR-012 | エラーハンドリング体系 | ループ上限到達時のユーザー相談フローとの整合性 |
| UR-015 | ルール配布機構（rules-distribute） | phase-skill-rules.md の変更が配布先（.kiro/steering/, .claude/rules/ 等）に波及する |
| UR-022 | design-sync による設計書と実装の同期 | 起動タイミングが「レビュー中即時」→「種別確定後」に変更される |

### 2.2 影響を受けるユースケース

| # | ユースケース | 影響内容 |
|---|---|---|
| 1 | 実装WF最終チェック（fs-impl-phase5-final-check）での漏れ検出後フロー | 検出後に実装漏れ/設計漏れの区別に応じた明確なプロセスが追加される |
| 2 | coding-test-2review による実装ループ | 繰り返し実行時の回数管理・ユーザー相談プロセスが追加される。合理的乖離廃止により FAIL_PENDING→種別確定フローが追加される |
| 3 | 設計WFフェーズスキルの再実行 | 設計漏れ時に該当FSを前処理・後処理なしで再実行するフローが追加される |
| 4 | 設計準拠レビュー（design-review-agent） | ユーザー承認フロー（合理的乖離）が廃止され、FAIL/FAIL_PENDING の二択報告に簡素化される |
| 5 | 任意フェーズでの設計不備発見 | phase-skill-rules.md に全体ルールが追加され、どのフェーズからでも対策プロセスを起動できるようになる |

### 2.3 影響を受けるアクター

| # | アクター | 影響内容 |
|---|---|---|
| 1 | AIエージェント（オーケストレータ） | 漏れ検出後の分岐判断と繰り返しプロセスの実行責務が追加される。phase-skill-rules.md の新ルールにより、任意フェーズでの設計不備発見時の対応プロセスを認識・実行する責務が追加される |
| 2 | ユーザー（開発者） | 10回繰り返しても解消しない場合の相談フローが追加される。大量漏れ時の判断を求められる。乖離種別確定時に「実装誤り / 設計漏れ」の判断を求められる |
| 3 | final-design-audit-agent | 出力に「設計漏れ」「実装漏れ」の区別を含む必要がある（PRE-004） |
| 4 | design-review-agent | ユーザー承認フロー削除。FAIL/FAIL_PENDING の報告のみに簡素化 |

---

## 3. プログラム構成視点の影響分析

### 3.1 変更対象ファイル

| # | ファイルパス | 変更内容 | 変更種別 | 対応要件 |
|---|---|---|---|---|
| 1 | `skills/fs-impl-phase5-final-check/SKILL.md` | Step1 状態判定に異常系プロセスへの参照追加 + Integration セクションに参照追加 + 合理的乖離廃止に伴う記述変更 | 変更 | REQ-C-001, REQ-C-002, REQ-C-004 |
| 2 | `skills/fs-impl-phase5-final-check/design-impl-gap-process.md` | 設計漏れ・実装漏れ発見時の対策プロセス全体定義（新規作成） | 追加 | REQ-C-001, REQ-C-002, REQ-C-003 |
| 3 | `skills/using-aide-powers/references/phase-skill-rules.md`（正本） | 「設計不備発見時の対応ルール」セクションを追加 | 変更 | REQ-C-005 |
| 3b | `skills/using-aide-powers/references/version.json` | version を +1 する（配布トリガーに必要。正本の version が `.aide/references/version.json` より大きくなることで、次回 using-aide-powers 起動時に references 一括コピー → `.rules-updated` フラグ生成 → rules-distribute 配布が発動する） | 変更 | REQ-C-005 |
| 3c | `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` | APM 配布版のフェーズスキルルールを正本と同期更新 | 変更 | REQ-C-005 |
| 3d | `.aide/specs/aide-powers/program-structure.md` | references/phase-skill-rules.md セクションに「変更時の連動ファイル」注記を追加 | 変更 | REQ-C-005 |
| 4 | `skills/multi-stage-code-review/SKILL.md` | Review Result Handling 判定フロー変更 | 変更 | REQ-C-004 |
| 5 | `skills/coding-test-2review/SKILL.md` | 設計準拠レビュー FAIL 時の分岐変更。FAIL_PENDING→種別確定フロー追加 | 変更 | REQ-C-004 |
| 6 | `skills/coding-test-2review/spec-reviewer-prompt.md` | 合理的乖離の許容ルール → 乖離種別判定ルール | 変更 | REQ-C-004 |
| 7 | `skills/design-sync/SKILL.md` | Phase 2 変更 + Rational Deviation Rules 廃止 | 変更 | REQ-C-004 |
| 8 | `skills/import-review/SKILL.md` | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」 | 変更 | REQ-C-004 |
| 9 | `skills/fs-impl-phase4-execution/SKILL.md` | Integration 記述変更 | 変更 | REQ-C-004 |
| 10 | `skills/fs-impl-phase4-execution/spec-reviewer-prompt.md` | 合理的乖離の許容ルール → 乖離種別判定ルール | 変更 | REQ-C-004 |
| 11 | `skills/fs-change-phase2-impl/SKILL.md` | Integration 記述変更 | 変更 | REQ-C-004 |
| 12 | `skills/fs-bugfix-phase2-impl/SKILL.md` | Integration 記述変更 | 変更 | REQ-C-004 |
| 13 | `skills/fs-refactoring-phase5-impl/SKILL.md` | Integration 記述変更 | 変更 | REQ-C-004 |
| 14 | `skills/fs-refactoring-phase5-impl/spec-reviewer-prompt.md` | 合理的乖離の判定 → 乖離種別判定 | 変更 | REQ-C-004 |
| 15 | `agents/design-review-agent.md` | ステップ5 変更: ユーザー承認フロー削除 | 変更 | REQ-C-004 |
| 16 | `agents/kiro/design-review-agent.md` | 同上 | 変更 | REQ-C-004 |
| 17 | `agents/kiro/prompts/design-review-agent-prompt.md` | 同上 | 変更 | REQ-C-004 |
| 18 | `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | 判定種別・PASS条件の記述変更 | 変更 | REQ-C-004 |
| 19 | `docs-dev/02-ai-agent/03-common-skills/impl.md` | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」 | 変更 | REQ-C-004 |
| 20 | `docs-dev/02-ai-agent/03-common-skills/infrastructure.md` | design-sync 呼び出し元の記述変更 | 変更 | REQ-C-004 |


### 3.2 配布先への波及（REQ-C-005 追加分）

phase-skill-rules.md の変更は、以下の配布メカニズムにより配布先に波及する。

**配布メカニズム（正確なフロー）:**

1. **正本を変更**: `skills/using-aide-powers/references/phase-skill-rules.md` を直接編集する
2. **version.json の version を +1**: `skills/using-aide-powers/references/version.json` の version 整数値をインクリメントする（**この手順を省略すると配布が発動しない**）
3. **次回 using-aide-powers 起動時のトリガー**: using-aide-powers の「起動時の手順」ステップ2 で、正本 `skills/using-aide-powers/references/version.json` の version と `.aide/references/version.json` の version を比較する
4. **references 一括コピー**: 正本の version > .aide側の version であるため、`.aide/references/` 配下を正本からごっそり置き換える（phase-skill-rules.md, version.json 含む全 references ファイル）
5. **フラグ生成**: 置き換え完了後に空のフラグファイル `.aide/references/.rules-updated` を作成する
6. **rules-distribute 実行**: using-aide-powers の「起動時の手順」ステップ3 で `rules-distribute` スキルを global モードで実行する
7. **フラグ検知→配布**: rules-distribute は `.aide/references/.rules-updated` フラグの存在を確認し、`.aide/references/phase-skill-rules.md` を各プラットフォームの配置先に配布する
8. **フラグ削除**: 配布完了後にフラグファイルを削除する

**影響を受けるファイル一覧:**

| # | ファイルパス | 波及方法 | 人手の変更要否 |
|---|---|---|---|
| 1 | `skills/using-aide-powers/references/phase-skill-rules.md`（正本） | 直接編集対象 | ✅ 必要 |
| 2 | `skills/using-aide-powers/references/version.json` | version を +1 する | ✅ 必要 |
| 2b | `.apm/instructions/aide-powers-phase-skill-rules.instructions.md`（APM配布版） | 正本と同一内容をAPM形式で保持。正本変更時に手動同期が必要 | ✅ 必要 |
| 3 | `.aide/references/phase-skill-rules.md`（ワークスペース配布版） | using-aide-powers 起動時に正本からコピー（自動） | ❌ 不要 |
| 4 | `.aide/references/version.json` | 同上（references 一括コピーに含まれる） | ❌ 不要 |
| 5 | `.kiro/steering/aide-powers-phase-skill-rules.md` | rules-distribute 実行時に生成（自動） | ❌ 不要 |
| 6 | `.claude/rules/aide-powers-phase-skill-rules.md` | rules-distribute 実行時に生成（自動） | ❌ 不要 |
| 7 | `.github/instructions/aide-powers-phase-skill-rules.instructions.md` | rules-distribute 実行時に生成（自動） | ❌ 不要 |
| 8 | 他プラットフォームルールファイル（.copilot/, .cursor/, .gemini/ 等） | rules-distribute 実行時に生成（自動） | ❌ 不要 |

**注意**: 実装時に人手で変更が必要なのは §3.1 の T-03（正本 phase-skill-rules.md）と T-03b（version.json の version +1）のみ。それ以外は全て using-aide-powers 起動時 → rules-distribute 実行時に自動的に反映される。

### 3.3 依存関係の影響を受けるファイル

| # | ファイルパス | 影響理由 |
|---|---|---|
| 1 | `agents/kiro/final-design-audit-agent.md` / `agents/final-design-audit-agent.md` | PRE-004: 出力が「設計漏れ」と「実装漏れ」を区別して報告する前提条件。現状この区別が実装されているかの確認が必要 |
| 2 | `agents/kiro/prompts/final-design-audit-agent-prompt.md` | 同上（Kiro CLI 用プロンプト） |
| 3 | `skills/fs-design-phase*` 群（設計WFフェーズスキル11個） | 設計漏れ対策プロセスで前処理・後処理なしの再実行対象となる。現状の構成で個別再実行が可能かの確認が必要 |
| 4 | `skills/impl-task-planning/SKILL.md` | 漏れ箇所のタスクリスト再作成時の参照元 |
| 5 | `skills/pending-issues-management/SKILL.md` | phase-skill-rules.md の新ルールで「設計不備を pending-issues.md に記録する」手順から参照される |

### 3.4 シグネチャ変更の波及

**シグネチャ変更: 該当なし（Markdownスキル定義の変更のみ）**

本変更はMarkdownスキル定義の追加・変更であり、プログラムコードのシグネチャ変更は発生しない。影響はスキル間の参照関係（Integration セクション）と、サブエージェントの入出力仕様に限定される。

主な参照関係の変更:
- `fs-impl-phase5-final-check` の Integration セクションに異常系プロセスへの参照を追加
- 異常系プロセス定義ファイルから `coding-test-2review` / `fs-design-phase*` への呼び出し関係を定義
- `design-review-agent` の出力仕様変更（合理的乖離→FAIL/FAIL_PENDING の二択）
- `coding-test-2review` に乖離種別確定フローの追加

---

## 4. 既存要件との矛盾確認

### 4.1 user-requirements.md との照合結果

| 要件ID | 判定 | 備考 |
|---|---|---|
| UR-005 | ✅ 矛盾なし | 設計準拠レビューの後続処理として整合的に位置づけられている。合理的乖離廃止はレビューの判定フロー簡素化であり、レビュー自体の2段階構造は維持 |
| UR-006 | ✅ 矛盾なし | 設計漏れ対策で設計FSを前処理・後処理なしで再実行する際、QAゲートの再通過は不要（プロセスB手順2で明示的にバイパス）。これは最終監査で再検証されるため妥当 |
| UR-007 | ✅ 矛盾なし | 繰り返しカウントはスキル内ローカル管理。進捗ファイルの更新は既存の仕組みに影響しない |
| UR-009 | ✅ 矛盾なし | 設計漏れ修正後もdesign-gateの整合性は維持される（設計書自体が更新されるため） |
| UR-012 | ✅ 矛盾なし | 既存のBLOCKED/NEEDS_FIX体系を維持。プロセスCのユーザー相談は新規追加だが既存体系と衝突しない |
| UR-014 | ✅ 矛盾なし | プロセスCの選択肢にユーザー中止の余地がある |
| UR-015 | ✅ 矛盾なし | phase-skill-rules.md の変更は rules-distribute の通常動作で配布される。配布メカニズム自体は変更不要 |
| UR-022 | ✅ 矛盾なし | design-sync の起動タイミング変更（「レビュー中即時」→「種別確定後」）は内部ロジックを変更せず、呼び出しタイミングのみの変更。design-sync スキル自体の「乖離検出→分類→修正案作成→ユーザー承認→設計書更新」フローは維持される |

### 4.2 system-requirements.md との照合結果

| セクション | 判定 | 備考 |
|---|---|---|
| §4.1 エラー分類 | ✅ 矛盾なし | 既存のエラー種別体系を変更しない。FAIL_PENDING は FAIL の派生状態（保留）であり新規エラー種別ではない |
| §4.2 エラー伝播ルール | ✅ 矛盾なし | 「ユーザー判断が絶対」の原則とプロセスCが整合。乖離種別確定フローもユーザー判断に委ねる |
| §4.5 ワークフロー中止メカニズム | ✅ 矛盾なし | プロセスC中のユーザー中止要求は既存の中止メカニズムで処理可能 |
| §7.4 動作確認 | ✅ 矛盾なし | 自動テストなし（手動検証のみ）の方針と整合（NF-13） |
| §2.4 マルチプラットフォーム対応 | ✅ 矛盾なし | phase-skill-rules.md の変更はツールマップ層に影響しない。スキル/エージェント本体層の変更のみ |

**矛盾: なし**

---

## 5. テスト対象機能の特定

### 5.1 自動テスト

**対象外**

本変更はMarkdownプロセス定義の追加・変更であり、自動テストの対象外（system-requirements.md C-03: 自動テストなし / NF-13）。

### 5.2 手動確認項目

| # | 確認項目 | 確認方法 | 対応要件 |
|---|---|---|---|
| 1 | SKILL.md の状態判定で❌検出時に design-impl-gap-process.md が参照されること | 実装WF phase5 の実行時に、❌が発生するケースで正しくプロセス定義ファイルが Read されることを確認 | REQ-C-001, REQ-C-002 |
| 2 | プロセスA（実装漏れ対策）のフローが正しく実行されること | 実装漏れ検出時にタスクリスト再作成→coding-test-2review→再監査の流れが動作することを確認 | REQ-C-001 |
| 3 | プロセスB（設計漏れ対策）のフローが正しく実行されること | 設計漏れ検出時に該当FS再実行→差分タスク追加→実装→再監査の流れが動作することを確認 | REQ-C-002 |
| 4 | プロセスC（10回繰り返しユーザー相談）が正しく発動すること | 10回目のループ到達時にユーザーへの報告・選択肢提示が行われることを確認 | REQ-C-003 |
| 5 | 合理的乖離関連の記述が全18ファイルから除去され、乖離種別判定に置き換わっていること | 各ファイルで「合理的乖離」「PASS_WITH_DEVIATION」「Rational Deviation Rules」等の旧概念が残存していないことを grep で確認 | REQ-C-004 |
| 6 | design-review-agent がユーザー承認フローなしで FAIL/FAIL_PENDING を報告すること | 設計準拠レビュー実行時に、差分検出でユーザー対話なくFAIL報告のみ行われることを確認 | REQ-C-004 |
| 7 | coding-test-2review の乖離種別確定フローが正しく動作すること | 全タスク完了時または依存ブロック時に FAIL_PENDING 差分がユーザーに提示され、種別確定が行われることを確認 | REQ-C-004 |
| 8 | phase-skill-rules.md に「設計不備発見時の対応ルール」が追加され、AIが認識すること | 任意フェーズ実行時に設計不備を発見した場合、新ルールに従って pending-issues 記録→フェーズ完了後に対策プロセス起動の流れが動作することを確認 | REQ-C-005 |
| 9 | rules-distribute 実行後に配布先ルールファイルに新ルールが反映されること | setup.bat / rules-distribute 実行後、.kiro/steering/ 等の配布先にルールが含まれることを確認 | REQ-C-005 |

### 5.3 確認タイミング

- 項目 1〜4: 実際のプロジェクト開発で `fs-impl-phase5-final-check` が漏れを検出した際に自然発生する。初回適用時に特に注意して動作を確認する
- 項目 5〜7: 実装完了後に grep 確認 + 初回の coding-test-2review / design-review-agent 実行時に動作確認する
- 項目 8〜9: 実装完了後に rules-distribute を実行し、配布先ファイルの内容を確認する

---

## 6. 説明対象アクターの特定

| # | アクター | 説明内容 | 説明手段 |
|---|---|---|---|
| 1 | AIエージェント（オーケストレータ） | 新しいプロセスの実行方法: ❌検出時にdesign-impl-gap-process.mdを Read し、漏れ種別（設計漏れ/実装漏れ）に応じてプロセスA/B/Cに分岐する手順。任意フェーズでの設計不備発見時に phase-skill-rules.md の新ルールに従う手順 | SKILL.md の状態判定セクション + design-impl-gap-process.md 本体 + phase-skill-rules.md の新ルール記述で自己説明的に伝達 |
| 2 | ユーザー（開発者） | 10回繰り返し時の相談内容: 残存❌一覧・原因分析・選択肢（続行/手動確認/その他）の判断を求められること。乖離種別確定時に「実装誤り / 設計漏れ」の判断を求められること | プロセスC の実行時 / 乖離種別確定フロー時にオーケストレータがユーザーに直接提示 |
| 3 | design-review-agent | ユーザー承認フロー削除後の新しい判定フロー: FAIL（明らかな実装誤り）/ FAIL_PENDING（種別未確定）の二択報告に変更 | agents/design-review-agent.md の before→after 変更で直接反映 |

---

## 7. 起因元ドキュメントフォルダ

### 7.1 git blame 結果

| 対象ファイル | 直近の関連コミット | Docs: フッター |
|---|---|---|
| `skills/fs-impl-phase5-final-check/SKILL.md` | `f3660d3` (feat: 署名検証・レポート確認を削除し進捗確認・進捗更新に置換) | `Docs: .aide/specs/aide-powers/changes/202606151000-remove-signature-verification/` |
| `skills/coding-test-2review/SKILL.md` | `01e5273` (feat: coding-test-2review 工程内並列化) | `Docs: .aide/specs/aide-powers/changes/202606112022-coding-test-2review-parallel-approval/` |

### 7.2 判定

上記の起因元ドキュメントフォルダはいずれも **既存の別課題の変更記録** であり、今回の変更要求（設計漏れ・実装漏れ対策プロセス定義 + 合理的乖離概念の廃止）とは直接関連しない。

今回の変更の起因元は **PI-050**（pending-issues）であり、既存ドキュメントフォルダへの統合は不要。本変更は独立した新規変更フォルダ（`202606301022-design-impl-gap-process`）で管理する。

**起因元ドキュメントフォルダ: なし（新規独立変更）**

---

## 8. Phase 1 からの差分（REQ-C-005 追加による影響拡大）

Phase 1 版の影響分析からの主な変更点:

| # | Phase 1 版 | 更新版 |
|---|---|---|
| 1 | 変更対象ファイル: 2件 | 変更対象ファイル: **23件**（REQ-C-004 の18ファイル + REQ-C-005 の phase-skill-rules.md 正本 + version.json + .apm ファイル + program-structure.md + 本体2件） |
| 2 | phase-skill-rules.md は影響分析に含まれず | **追加**: phase-skill-rules.md（正本 + 配布版）が変更対象に追加（§3.1 #3, §3.2） |
| 3 | 配布先への波及は記載なし | **追加**: rules-distribute による配布先ルールファイルへの波及を記載（§3.2） |
| 4 | テスト対象機能: 4項目 | テスト対象機能: **9項目**（合理的乖離廃止確認 + phase-skill-rules.md 動作確認 + 配布確認を追加） |
| 5 | 説明対象アクター: 2名 | 説明対象アクター: **3名**（design-review-agent を追加） |
| 6 | ユースケース: 3件 | ユースケース: **5件**（設計準拠レビュー変更 + 任意フェーズ発見を追加） |
| 7 | UR-015, UR-022 は関連要件に含まれず | **追加**: UR-015（ルール配布）、UR-022（design-sync）を関連要件に追加 |

---

## 9. 注意事項

| # | 注意事項 |
|---|---|
| 1 | PRE-004「final-design-audit-agent の出力が設計漏れと実装漏れを区別して報告できること」が前提条件。現状のエージェント定義で区別が可能か、差分設計で確認が必要 |
| 2 | 設計WFフェーズスキル（fs-design-phase1〜11）の「前処理・後処理なしの再実行」が現状の構造で可能かの確認が必要。フェーズスキルは前処理で progress-resume-check を呼ぶ構造になっているため、バイパス方法を設計する必要がある |
| 3 | 本変更はメタ開発（aide-powers自体の開発）であるため、design-gate は適用対象外（dev-environment.md §14） |
| 4 | 実装WF以外のWF（変更WF・bugfix WF等）への適用はスコープ外（EX-003）。将来の拡張として記録のみ。ただし phase-skill-rules.md の全体ルールにより、これらのWF内でも設計不備発見時の対応は可能になる |
| 5 | phase-skill-rules.md の正本変更後は `skills/using-aide-powers/references/version.json` の version を +1 すること。これにより次回 using-aide-powers 起動時に references 一括コピー → `.rules-updated` フラグ生成 → rules-distribute 配布が自動発動する。version を上げ忘れると配布が発動せず、配布先が古いままになる |
| 6 | 合理的乖離廃止（REQ-C-004）は18ファイルに及ぶ大規模変更。task-orchestration スキルの使用を推奨する |
