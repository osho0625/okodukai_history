# 影響範囲分析（差分設計完了後・確定版）

## 変更種別
変更

## 分析ステータス
本ドキュメントは delta-design.md（QA APPROVED済み・単一ファイル）の内容を踏まえて Phase 1 版の影響分析を再精査した確定版である。

---

## 1. アクター視点の影響

### 影響を受けるユースケース
- UR-019: pending-issues-management による残課題管理を提供すること — pending-issues の check/present 実行タイミングが実装フェーズ中からWF完全終了後（final-check後処理のgit-commit完了後）に変更される。残課題管理機能自体（record/check/present の各モードのロジック）は無変更であり、呼び出しタイミングのみが変更される
- UR-001: 7つのワークフローを提供すること — 全7WFの最終フェーズスキルに共通の変更を適用。WF本体フロー（設計→実装→レビュー→コミット）の一貫性が向上する
- UR-007: 進捗管理機構を提供すること — final-check 後処理の実行順序が「git-commit-workflow → pending-issues check → pending-issues present」に明確化される

### 影響を受けるアクター
- AIエージェント（フェーズスキル実行者） — 実装フェーズ（change/bugfix/refactoring）および実装WF最終チェックフェーズ（impl）でpending-issues check/presentを実行しなくなり、全7WFのfinal-check後処理でのみ、git-commit-workflow完了後に実行する
- ソフトウェア開発者（ユーザー） — pending-issuesの提示・対応確認がWF末尾（コミット完了後）に集約されるため、WF本体フロー中の割り込みがなくなる。7WF共通で「コミットが終わってから残課題の確認をする」という体験に変わる

---

## 2. プログラム構成視点の影響（確定版）

### 2.1 変更対象ファイル（delta-design.md 記載の11件・Phase 1と同一）

| ファイル | 変更パターン | 変更概要 |
|---|---|---|
| `skills/fs-change-phase2-impl/SKILL.md` | A-1（削除） | Step 13 削除、Step 14→Step13 リナンバリング、Integration行削除、完了条件項目9削除 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | A-2（削除） | Step 11 削除、Step 12→Step11 リナンバリング、Integration行削除 |
| `skills/fs-refactoring-phase6-doc/SKILL.md` | A-3（削除） | Step 2 削除、Step 3→Step2・Step 4→Step3 リナンバリング、Integration行削除 |
| `skills/fs-impl-phase5-final-check/SKILL.md` | A-4（削除） | Step 3 削除（最終Step）、Step 2 状態判定の遷移先文言変更、Integration行削除 |
| `skills/fs-change-phase3-final-check/SKILL.md` | B-1（追加・完全例） | 後処理に pending-issues check→present 追加、完了条件・Integration更新 |
| `skills/fs-bugfix-phase3-final-check/SKILL.md` | B-2（追加） | B-1同型。差分：レポート名/文言のみ |
| `skills/fs-refactoring-phase7-final-check/SKILL.md` | B-3（追加） | doc-index-maintenance等を呼ばない構造。挿入位置: git-commit-workflow直後〜完了ステータス直前 |
| `skills/fs-impl-phase7-final-check/SKILL.md` | B-4（追加） | B-3同型 |
| `skills/fs-planning-phase4-final-check/SKILL.md` | B-5（追加） | B-1同型 |
| `skills/fs-design-phase11-final-check/SKILL.md` | B-6（追加） | B-1同型 |
| `skills/fs-reverse-phase6-final-check/SKILL.md` | B-7（追加） | B-1同型 |

全11ファイルについて実ファイルを読み込み、delta-design.md の before 記述（Step番号・見出し文言・Integration記載・完了条件記載）と実ファイル内容が完全一致することを確認した。Phase 1 の変更対象ファイル一覧に変更・追加はない。

### 2.2 Step番号参照の全件追跡結果

本変更はプログラムコードのシグネチャ変更を伴わないため、追跡対象は「Step番号」という参照キーである。各ファイルについて、Step番号が参照される全箇所（見出し／完了条件／状態判定／Integration／レポート記載項目リスト）を確認した結果を以下に示す。

| ファイル | 見出し | 完了条件 | 状態判定 | Integration | 特殊セクション | 判定 |
|---|---|---|---|---|---|---|
| fs-change-phase2-impl | ✅リナンバリング対象 | ✅項目9削除対象 | ✅Step13→14の遷移記述を確認済み | ✅Step13/14行削除対象 | なし | 追跡完了 |
| fs-bugfix-phase2-impl | ✅リナンバリング対象 | 該当なし（完了条件に個別Step番号記載なし） | ✅Step11→12の遷移記述を確認済み | ✅Step11/12行削除対象 | なし | 追跡完了 |
| fs-refactoring-phase6-doc | ✅リナンバリング対象（2箇所） | 該当なし | ✅Step1→2→3→4の連鎖遷移を確認済み | ✅Step2行削除対象 | なし | 追跡完了 |
| fs-impl-phase5-final-check | Step3見出し削除（リナンバリング不要・最終Step） | 該当なし | ✅Step2状態判定の文言変更対象を確認済み | ✅Step3行削除対象 | ⚠️**レポート記載項目リストに未反映**（後述2.3） | **追加検出あり** |

**追跡の結論**: fs-impl-phase5-final-check において、delta-design.md に明記されていない追加の修正対象箇所を検出した（2.3節で詳述）。他3ファイル（A-1〜A-3）については、delta-design.md の記述と実ファイルの全Step番号参照箇所が一致し、追跡漏れはない。

### 2.3 【新規検出】fs-impl-phase5-final-check「レポート記載項目リスト」の更新漏れ

delta-design.md の A-4 節は Step 3 本体の削除・Integration行の削除・Step2状態判定の文言変更のみを指示しているが、実ファイルには以下の専用セクションが存在し、これが更新対象から漏れている。

**該当箇所**: `skills/fs-impl-phase5-final-check/SKILL.md` の `# レポート記載項目リスト` セクション（後処理で `phase-report-check (write)` に `required_items` として渡す必須項目リスト）

このリストには、削除対象の Step 3 に紐づく以下4項目が現在も列挙されている。

```
- pending-issues-management(check)の出力(Step3):
- 書き込み漏れの有無と対応(Step3):
- pending-issues-management(present)の出力(Step3):
- pending-issues提示結果(Step3):
```

**影響**: Step 3 が削除されると、これらの項目はフェーズレポートに記載されなくなる。しかし「レポート記載項目リスト」からこの4項目を削除しないまま実装すると、後処理の `phase-report-check (write)` が required_items との突き合わせで記載項目漏れ（❌）と誤判定し、FAIL を返す可能性がある。これは他の3ファイル（fs-change-phase2-impl 等）には存在しない、fs-impl-phase5-final-check 固有の追加修正対象である。

**対応方針（実装タスクへの反映が必要）**: delta-task-list.md 作成時に、fs-impl-phase5-final-check のタスクへ「レポート記載項目リストから Step3 関連4項目を削除する」作業を明示的に追加すること。既存の delta-design.md 自体（QA APPROVED済み）を書き換えることは本エージェントの担当外のため、この指摘は次工程（差分タスクリスト作成）に引き継ぐ。

**解消済み**: delta-design.mdのA-4セクションに「付随変更: レポート記載項目リスト」が追記され、Step3関連4項目の削除がbefore/after形式で明記された(2回目QAレビューAPPROVED済み)。

### 2.4 【新規検出】パターンB 6件（B-2〜B-7）のIntegrationセクション追加の暗黙要求

delta-design.md は B-1（fs-change-phase3-final-check）についてのみ「Integrationセクション追加」の before/after を明示し、B-2〜B-7 は「B-1と同一パターン」と記述するのみで、Integration セクションへの `pending-issues-management` 行追加を個別には明示していない。

実ファイルを確認したところ、B-2〜B-7 の全ファイルの Integration セクション「呼び出す共通スキル」に `git-commit-workflow (aide-powers skill)` の行が存在し、B-1の完全パターンに従うなら、この行の直後に `pending-issues-management (aide-powers skill)` の行を追加する必要がある（B-1 の after 例と同一形式）。これは「同一パターン」という記述から論理的に導出される暗黙の変更対象であり、見落とすと Integration セクションの記載が実際の呼び出し内容と不整合になる。

**対応方針**: delta-task-list.md 作成時に、B-2〜B-7 の各タスクに「Integrationセクションの『呼び出す共通スキル』に pending-issues-management 行を追加する」ことを明記すること。

**解消済み**: delta-design.mdのB-2〜B-7各セクションに「Integrationセクション追加」のbefore/afterが個別に明文化された(2回目QAレビューAPPROVED済み)。

### 2.5 依存関係（変更対象を参照しているファイル）

| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `skills/pending-issues-management/SKILL.md` | pending-issues check/present モードの定義元 | 低（スキル自体のロジック変更なし。呼び出しタイミングのみ変更。check/present のI/Oは維持されるため、呼び出し元の引数構成もB-1の例に倣えば互換） |
| `skills/coding-test-2review/SKILL.md` | pending_issues_path パラメータで pending-issues.md への随時記録（record モード）を実行 | 低（record モードは今回の変更対象外。変更要求のスコープ外セクションにも明記済み。実装中の随時記録は継続する） |
| `.aide/specs/aide-powers/program-structure.md` | 各WFフェーズスキルのプロセス記述にpending-issues Step情報を含む（実在確認済み） | 中（delta-design.md「更新が必要な設計資料」に記載済み。実装後にStep記述の反映が必要） |
| `skills/fs-*-phase*-*/SKILL.md`（削除・追加対象以外の同WF内フェーズ） | 各WF内で前後フェーズへの遷移先スキル名を記述 | 極小（Step番号のリナンバリングはフェーズ内部の話であり、他フェーズスキルからの参照は「フェーズスキル名」単位であり「Step番号」単位ではないため、他フェーズスキルの記述への影響はない。確認済み） |

---

## 3. 既存要件・システム要件との矛盾確認

### 3.1 ユーザー要件（user-requirements.md）との整合性

| 要件ID | 確認内容 | 結果 |
|---|---|---|
| UR-019（pending-issues-management） | 「記録・追跡する」という目的は維持されるか | 矛盾なし。record/check/presentのロジック自体は無変更 |
| UR-007（進捗管理機構） | フェーズレポート・進捗ファイルの運用ルールと整合するか | 矛盾なし。フェーズレポート運用ルール（即時記載・単一ファイル更新）は変更対象ファイルすべてで維持される |
| UR-001（7つのワークフロー） | 全7WF共通変更がワークフロー構成自体を変えないか | 矛盾なし。フェーズ数・フェーズ順序は変わらない（各WF内のStep番号リナンバリングのみ） |
| UR-014（ワークフロー中止メカニズム） | final-check の中止モード（mode=abort）処理への影響 | 矛盾なし。中止クリーンアップセクションは前処理直後に分岐する構造であり、後処理（pending-issues追加箇所）とは独立。中止モード時は後処理自体を実行しないため無影響 |

矛盾は検出されなかった。

### 3.2 システム要件（system-requirements.md）の非機能要件との整合性

| 要件ID | 確認内容 | 結果 |
|---|---|---|
| NF-16（50行超のファイルはWrite+Append分割） | 変更対象ファイルの多くが50行を大きく超える | 直接の矛盾ではないが実装時の注意点。11ファイル全てが既に数百行規模であり、Step削除・追加のいずれも既存ファイルへの部分編集（str_replace相当）で対応可能。全文書き直し（Write）が必要なケースは想定されないため、NF-16の分割ルールが問題になる可能性は低い |
| NF-17（大きいファイルは分割読み込みで全行取得） | 本影響分析自体の実施における前提 | 矛盾なし。本分析では対象11ファイルおよびdelta-design.md等を全行読み込んで確認済み |
| §4.4 QAレビュー判定基準（FAIL=0かつWARNING=0） | 実装後のQA再レビュー要否 | 本変更は差分設計QAが既にAPPROVED済み。後続は実装タスクのdesign-review-agent/code-review-agentレビューの対象となるが、これは通常の実装フローであり矛盾はない |
| §5.1 フェーズレポート記載ルール（即時記載・記載項目漏れ検出） | fs-impl-phase5-final-checkの「レポート記載項目リスト」機構 | **2.3節で指摘した更新漏れが実際に発生すると、この非機能要件（記載項目漏れ検出の正確性）が損なわれる。実装タスクへの反映必須** |

2.3節の指摘以外に、システム要件の非機能要件と矛盾する変更点はない。

---

## 4. テスト対象機能（新規/リグレッション区別）

本プロジェクトはaide-powersフレームワーク（スキル定義ファイル）であり、自動テストコードは存在しない。「テスト」に相当するのは、各WFを実際に実行してpending-issues関連の手順が正しく動作するかを確認する動作確認である。

### 4.1 新規テスト対象（本変更で動作が変わる機能）

| # | 対象WF/フェーズ | 確認内容 |
|---|---|---|
| 1 | 変更WF実装フェーズ（fs-change-phase2-impl） | pending-issues check/present の単独Stepが実行されないこと。旧Step14（新Step13）でもpresent呼び出しが行われないこと |
| 2 | バグ修正WF実装フェーズ（fs-bugfix-phase2-impl） | 同上（旧Step12→新Step11） |
| 3 | リファクタリングWFドキュメント同期フェーズ（fs-refactoring-phase6-doc） | 同上（旧Step2削除、旧Step3→新Step2、旧Step4→新Step3） |
| 4 | 実装WF最終チェックフェーズ（fs-impl-phase5-final-check） | Step3が削除され、Step2完了後に直接後処理へ遷移すること。かつ後処理の phase-report-check(write) が誤ってFAILを返さないこと（2.3節の修正が正しく反映されているかの確認を含む） |
| 5 | 変更WF最終フェーズ（fs-change-phase3-final-check） | 後処理でgit-commit-workflow完了後にpending-issues check→presentの順で実行されること |
| 6 | バグ修正WF最終フェーズ（fs-bugfix-phase3-final-check） | 同上 |
| 7 | リファクタリングWF最終フェーズ（fs-refactoring-phase7-final-check） | 同上（git-commit-workflow直後〜完了ステータス直前の挿入位置を含む） |
| 8 | 実装WF最終フェーズ（fs-impl-phase7-final-check） | 同上 |
| 9 | 企画WF最終フェーズ（fs-planning-phase4-final-check） | 同上 |
| 10 | 設計WF最終フェーズ（fs-design-phase11-final-check） | 同上 |
| 11 | 設計逆引きWF最終フェーズ（fs-reverse-phase6-final-check） | 同上 |

7WF全てについて「pending-issues.md が存在する場合／存在しない場合」の両パターンを確認することが望ましい（presentモードの分岐処理: 存在しない場合は「未対応の問題はありません」と報告するのみ）。

### 4.2 リグレッション対象（既存動作が壊れていないことの確認）

| # | 対象 | 確認内容 |
|---|---|---|
| 1 | 各実装フェーズ（change/bugfix/refactoring）の削除・追加と無関係な既存Step | Step1〜(削除Step直前)までの処理、リナンバリング後のStepへの遷移が正常に動作すること |
| 2 | fs-impl-phase5-final-check の Step1（最終設計準拠チェック）・Step2（動作確認試験書網羅性チェック） | Step3削除の影響を受けず従来通り動作すること |
| 3 | 各final-checkフェーズのStep1（進捗確認）・Step2（想定外残ファイル確認）・中止クリーンアップセクション | pending-issues追加の影響を受けず従来通り動作すること（追加箇所は後処理のみであり、Step1/Step2/中止クリーンアップとは独立） |
| 4 | doc-index-maintenance・user-profile-management(update)を呼ぶ後処理（B-1, B-2, B-5, B-6, B-7） | pending-issues追加後も、既存の呼び出し順序（doc-index-maintenance→user-profile-management→git-commit-workflow→【新規】pending-issues check→present→完了ステータス）が壊れないこと |
| 5 | doc-index-maintenance等を呼ばない後処理（B-3, B-4） | 既存の呼び出し順序（git-commit-workflow→【新規】pending-issues check→present→完了ステータス）が壊れないこと |
| 6 | 各WFの前フェーズからの遷移（Called by記述） | フェーズスキル名を単位とした遷移であり、Step番号リナンバリングの影響を受けないこと（2.5節で確認済み） |

---

## 5. 説明対象アクター

| アクター | 説明すべき内容 |
|---|---|
| AIエージェント（フェーズスキル実行者） | 実装フェーズ（change/bugfix/refactoring）およびimplのfinal-checkではpending-issues checkを実行しない。全7WFのfinal-check後処理で、git-commit-workflow完了後にpending-issues check→presentの順で実行する。この実行順序（git-commit-workflow→check→present）を厳守する |
| ソフトウェア開発者（ユーザー） | pending-issuesの提示・対応確認のタイミングが変わる。従来は実装フェーズの途中（コミット前）で問題提示が割り込んでいたが、今後はWF完全終了・コミット完了後にまとめて提示される。コミット後に提示されるため、対応方針（次WFで対応/対応不要として削除/保留）を確認した結果が当該コミットには反映されない点に注意（pending-issues.mdの更新は次のコミットタイミングまで未コミット状態になり得る） |

---

## 6. Phase 1からの変更点

| 項目 | Phase 1版 | 確定版（本版） |
|---|---|---|
| 変更対象ファイル一覧 | 11件（暫定） | 11件（実ファイル照合により確定・変更なし） |
| シグネチャ変更追跡 | 未実施（軽量版のため） | 実施済み。Step番号参照の全箇所を4ファイル×5観点（見出し/完了条件/状態判定/Integration/特殊セクション）で確認 |
| fs-impl-phase5-final-check の「レポート記載項目リスト」 | 言及なし | **新規検出**: Step3関連4項目の削除漏れリスクを検出（2.3節） |
| B-2〜B-7 のIntegrationセクション追加 | 言及なし | **新規検出**: 「B-1と同一パターン」から論理的に導出される暗黙の追加要求を明示化（2.4節） |
| テスト対象機能 | 概要のみ（直接変更する機能／リグレッション対象を1行で記述） | 新規11項目・リグレッション6項目に詳細化（4節） |
| 説明対象アクター | 影響を受けるアクターとして記載のみ | 説明すべき内容を具体化し、コミットとpending-issues更新のタイミングずれという注意点を追加（5節） |
| 既存要件との矛盾確認 | 未実施 | 実施済み。矛盾なしを確認（3.1節） |
| システム要件非機能要件確認 | 未実施 | 実施済み。矛盾なし。ただし2.3節の指摘は非機能要件（記載項目漏れ検出の正確性）に関わるため実装タスクへの反映必須（3.2節） |

---

## 7. 起因元ドキュメントフォルダ
- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（変更対象ファイルの主要コミットにpending-issues Step導入に関連する Docs: フッターが存在しない。pending-issues Stepは複数の異なるコミットで段階的に追加されたものであり、単一の起因元ドキュメントフォルダは特定できない）。Phase 1版から変更なし。
