# 影響範囲分析（更新版 — フェーズ6精査後 / REQ-C-008・REQ-C-009 統合）

## 変更種別
仕様変更（modification）

## フェーズ6再精査での追加点（REQ-C-008/009 追加に伴う影響範囲の追記）

本ドキュメントは過去セッションで REQ-C-006（step-history-writer 追加）/ REQ-C-007（設計系共通スキル mode: delta 統一）まで反映済みの「更新版 — フェーズ6精査後」をベースとする。
今回のフェーズ6再精査では、フェーズ5（差分設計）のやり直しで delta-design.md に新たに追加された以下2要件の影響を統合した。

- **REQ-C-008（差分設計ファイルの分割対応）**: delta-design.md / fix-design.md を「メイン（索引）+ 分割ファイル群」構成で作成できるようにする。後続 Step（影響再精査 / タスク計画 / doc-sync / design-sync）で分割ファイルを索引から発見して全 Read する義務を追加。
- **REQ-C-009（「1呼び出し = 1サブタスク」ルール強化 / 二重防御）**: 呼び出し元（新フェーズスキル）・multi-stage-code-review（共通スキル）・3エージェント定義の3層でペイロードの粒度を検証する。受領側4ファイル（multi-stage-code-review/SKILL.md + micro-impl-agent / design-review-agent / code-review-agent）はユーザー明示承認によるスコープ拡張で本WF内修正済み。

REQ-C-006/007 の既存分析内容は維持し、本セクション以降に REQ-C-008/009 分を追記・統合している。

### 重要な確認事実

REQ-C-009 の受領側4ファイルは、本セッション時点で既に修正が反映済みであることを確認した:
- `skills/multi-stage-code-review/SKILL.md` に「Stage 0: 依頼内容チェック（受領時・必須）」（0a ペイロード検証 / 0b 柔軟ルール例外判定 / 0c 理由）が存在
- `agents/micro-impl-agent.md` / `agents/design-review-agent.md` / `agents/code-review-agent.md` に「依頼受領時のチェック（必須・最初に実行）」が存在

これら4ファイルは複数WFから共有される資産であり、本WFで修正済みのため、他WF（実装WF・リファクタリングWF）への横展開（PI-021）時は再修正不要。

## シグネチャ変更追跡

| # | 変更対象 | Before | After | 呼び出し元 | 対応状況 |
|---|---|---|---|---|---|
| 1 | phase-compliance-check write モード入力: `session_history_file` | 単一ファイルパス（文字列） | `session_history_files`（文字列配列）または単一パス（後方互換） | 全7WFの全フェーズスキル後処理（41箇所） | 参照ファイル更新 #5 で対応 |
| 2 | compliance-checker エージェント入力: `session_history_file` | 単一ファイルパス（文字列） | `session_history_files`（文字列配列）または単一パス（後方互換） | phase-compliance-check スキル（write モード内部呼び出し） | 参照ファイル更新 #6 で対応 |
| 3 | progress-final-checker エージェント入力: `total_phases` | 変更WF: 9 / バグ修正WF: 6 | 変更WF: 2 / バグ修正WF: 2（自フェーズ除く前フェーズ数） | fs-change-phase3-final-check Step 2 / fs-bugfix-phase3-final-check Step 2 | 参照ファイル更新 #7 で対応 |
| 4 | ワークフロー選択ガイド: 変更WFエントリポイント | `fs-change-phase1-status` | `fs-change-phase1-analysis` | using-aide-powers/SKILL.md, global-rules.md, steering, aide-powers-guide, docs-dev 各所 | 参照ファイル更新 #1, #2, #3, #8, #9, #10, #11, #14, #16 で対応 |
| 5 | ワークフロー選択ガイド: バグ修正WFエントリポイント | `fs-bugfix-phase1-report` | `fs-bugfix-phase1-analysis` | using-aide-powers/SKILL.md, global-rules.md, steering, aide-powers-guide, docs-dev 各所 | 参照ファイル更新 #1, #2, #3, #8, #9, #10, #11, #13, #16 で対応 |
| 6 | fs-change-phase3-final-check 前フェーズ参照 | `fs-change-phase9-completion` | `fs-change-phase2-impl` | fs-change-phase3-final-check 前処理（verify）、Integration セクション | 新スキル内で直接定義（delta-design.md に記載済み） |
| 7 | fs-bugfix-phase3-final-check 前フェーズ参照 | `fs-bugfix-phase6-doc` | `fs-bugfix-phase2-impl` | fs-bugfix-phase3-final-check 前処理（verify）、Integration セクション | 新スキル内で直接定義（delta-design.md に記載済み） |
| 8 | progress-file-format.md §7.5 変更WFフェーズ一覧 | 10フェーズ（phase1-status 〜 phase10-final-check） | 3フェーズ（phase1-analysis, phase2-impl, phase3-final-check） | progress-resume-check（進捗ファイル読み込み時） | 参照ファイル更新 #4 で対応 |
| 9 | progress-file-format.md §7.6 バグ修正WFフェーズ一覧 | 7フェーズ（phase1-report 〜 phase7-final-check） | 3フェーズ（phase1-analysis, phase2-impl, phase3-final-check） | progress-resume-check（進捗ファイル読み込み時） | 参照ファイル更新 #4 で対応 |
| 10 | プロンプトテンプレート内の遷移先スキル名 | 旧フェーズスキル名（例: `fs-change-phase2-requirements`） | 新フェーズスキル名（例: `fs-change-phase1-analysis`） | 各プロンプトテンプレート（change-*-prompt.md, bugfix-*-prompt.md） | 参照ファイル更新 #18, #19 で対応 |

### 追跡結果サマリー

全シグネチャ変更（10件）について、delta-design.md の「参照ファイルの更新」セクション（19件）で対応が網羅されていることを確認した。未対応の呼び出し元は存在しない。

### REQ-C-007 関連シグネチャ変更追跡（追加）

| # | 変更対象 | Before | After | 呼び出し元 | 対応状況 |
|---|---|---|---|---|---|
| 11 | object-design スキル mode 名 | `update` | `delta` | object-design 本体 / object-designer-prompt.md / fs-change-phase2-impl（新）/ fs-bugfix-phase2-impl（新）/ fs-refactoring-phase4-design | 各ファイルで mode 名置換 |
| 12 | object-design 差分時の出力先 | 既存 `object-design-*.md` を直接更新 | `{changes_dir}/delta-object-design.md` を新規作成 | object-design 本体 / object-designer-prompt.md | プロセス書き換え |
| 13 | gui-design スキル mode 名 | `update` | `delta` | gui-design 本体 / gui-designer-prompt.md / fs-change-phase2-impl（新）/ fs-bugfix-phase2-impl（新）/ fs-refactoring-phase4-design | 各ファイルで mode 名置換 |
| 14 | gui-design 差分時の出力先 | 既存 `gui-design.md` を直接更新 | `{changes_dir}/delta-gui-design.md` を新規作成 | gui-design 本体 / gui-designer-prompt.md | プロセス書き換え |
| 15 | ddd-modeling スキル mode 名 | `update`（プロセスC） | `delta` | ddd-modeling 本体 / ddd-modeler-prompt.md / fs-change-phase2-impl（新）/ fs-bugfix-phase2-impl（新）/ fs-refactoring-phase4-design | mode 名のみ置換（実態は変わらず） |
| 16 | fs-refactoring-phase4-design の設計系共通スキル呼び出し記述 | 「差分モード」（暗黙に update を意味）/ 表記揺れ「（aide-powers skill: 差分モード）」「（差分モード）」 | `mode: delta` で明示的に統一 | fs-refactoring-phase4-design/SKILL.md / refactoring-designer-prompt.md | 記述書き換え |
| 17 | プロジェクト固有 system-architecture.md の「差分更新モード」表記 | 「（新規作成/差分更新モード）」 | 「（新規作成/差分モード）」 | `.aide/specs/aide-powers/tray-app-planning/.kiro-side/system-architecture.md` / `.aide-side/system-architecture.md` | 表記統一 |

### REQ-C-008/009 関連シグネチャ・契約変更追跡（追加 — フェーズ6再精査）

REQ-C-008/009 はフレームワークの SKILL.md / エージェント定義の記述追加が中心で、アプリケーションコードのような関数シグネチャ変更は伴わない。ただし「サブエージェント呼び出しペイロード」と「multi-stage-code-review の戻り値契約」がインターフェースに相当するため、その変更を契約変更として全件追跡する。

| # | 変更対象 | Before | After | 呼び出し元 / 影響先 | 対応状況 |
|---|---|---|---|---|---|
| 18 | multi-stage-code-review 呼び出しペイロード | task番号/対象ファイル/設計参照/テスト観点/依存先（項目数・名称が暗黙） | **10項目の明示ペイロードテンプレート**（task_id / task_title / target_file / test_file / design_refs / test_perspectives / dependencies / dev_environment / task_kind / bugfix_dir） | fs-change-phase2-impl Step 12 / fs-bugfix-phase2-impl Step 10（新スキル内で定義） | 新スキル設計に記載済み（delta-design-fs-{change,bugfix}-phase2-impl.md） |
| 19 | multi-stage-code-review の戻り値契約 | ALL_PASS / PASS_WITH_DEVIATION / PASS_WITH_WARNING（粒度違反時の返却ステータスなし） | 上記に加え、Stage 0 違反時に **BLOCKED**（複数タスク統合等）/ **NEEDS_CONTEXT**（設計参照未絞り込み・dev_environment 欠落）を返す | fs-change-phase2-impl Step 12 / fs-bugfix-phase2-impl Step 10 のオーケストレータ（BLOCKED 受領時に呼び出しを修正して再実行する分岐が必要） | multi-stage-code-review/SKILL.md に Stage 0 反映済み。新スキル Step 12/10 に「BLOCKED で返される」旨記載済み |
| 20 | 柔軟ルール例外パラメータ | なし | `parent_task_id` / `target_public_methods`（複数 publicMethod 一覧）を任意項目として追加 | 呼び出し元フェーズスキル / multi-stage-code-review / 3エージェント（micro-impl / design-review / code-review） | 4ファイル全てに反映済み（受領側修正完了確認済み） |
| 21 | micro-impl-agent / design-review-agent / code-review-agent の依頼受領契約 | 依頼受領時の粒度チェックなし | 「依頼受領時のチェック」セクション新設。粒度違反時に各エージェントが BLOCKED / NEEDS_CONTEXT を返す（第3層防御） | multi-stage-code-review 経由のフェーズスキル | 3エージェント定義に反映済み（受領側修正完了確認済み） |
| 22 | delta-design.md / fix-design.md の構成（成果物フォーマット） | 単一ファイル前提 | 「メイン（索引）+ 分割ファイル群（delta-design-{name}.md / fix-design-{name}.md）」構成を許容 | 後続 Step（影響再精査 / タスク計画 / doc-sync / design-sync）の各サブエージェントが索引から分割ファイルを発見し全 Read | 新スキル Iron Laws / 成果物テーブル / 各 Step Input / プロンプトに反映済み |

### REQ-C-008/009 追跡結果サマリー

- REQ-C-008/009 に起因する **アプリケーションコードレベルの関数シグネチャ変更は新規検出なし**（フレームワークの記述追加が中心）
- ただし「サブエージェント呼び出しペイロード（10項目化 + 柔軟ルール例外2項目）」「multi-stage-code-review / 3エージェントの戻り値契約（BLOCKED/NEEDS_CONTEXT 追加）」をインターフェース契約変更として **5件（#18〜#22）を新規追跡**
- 全件について delta-design.md（REQ-C-008/009 セクション + 付属設計ファイル）で対応が記載されていることを確認。受領側4ファイル（#19/#20/#21 関連）は既に実体修正済みを確認
- 未対応の呼び出し元・影響先は存在しない

## 既存要件矛盾確認

### 確認対象
- change-requirements.md「対象外（スコープ外）」セクション

### 確認結果: 矛盾なし（REQ-C-008/009 についてもスコープ整合を確認）

| # | 対象外項目 | 本変更との関係 | 判定 |
|---|---|---|---|
| 1 | 他のWF（企画・設計・実装・設計逆引き・リファクタリング）のフェーズ構成変更 | REQ-C-006 は全7WFに step-history-writer を追加するが、これはフェーズ「構成」変更ではなく各Step末尾への処理追加。フェーズ数・フェーズ名・フェーズ遷移は変わらない | 矛盾なし |
| 2 | 共通スキル（phase-compliance-check, progress-resume-check, design-gate 等）の内部ロジック変更 | phase-compliance-check の `session_history_file` → `session_history_files` は**パラメータの型変更（インターフェース変更）**であり、内部ロジック変更ではない。検証ロジック自体は変わらず、入力の受け取り方が変わるのみ | 矛盾なし |
| 3 | プロンプトテンプレート（*-prompt.md）の内容変更 | delta-design.md #18, #19 で行うのは遷移先スキル名の参照文字列の置換のみ。プロンプトの「内容」（指示内容・出力形式等）は変更しない | 矛盾なし |
| 4 | エージェント定義（agents/）の変更 | compliance-checker.md と progress-final-checker.md の入力仕様変更は、エージェントの「振る舞い」変更ではなく入力パラメータ仕様の更新。エージェントの判定ロジック・出力形式は変わらない | 矛盾なし |
| 5 | （REQ-C-009）エージェント定義（agents/）の判定ロジック・出力形式の変更 | REQ-C-009 は micro-impl-agent / design-review-agent / code-review-agent に「依頼受領時のチェック」を追加するもの。これは各エージェントの本来の振る舞い（実装/レビュー）を変えず、依頼受領時の前段ガードを追加するもの。**当初スコープ外だが、ユーザーが「スコープクリープを許可し今回で全て修正する」と明示承認済み**（delta-design.md「スコープ拡張の経緯」） | 矛盾なし（ユーザー明示承認によりスコープ内化） |
| 6 | （REQ-C-009）共通スキル multi-stage-code-review への Stage 0 追加 | パイプライン本体（Stage 1〜3）のロジックは不変。受領時のペイロード検証ガード（Stage 0）を前段に追加するもの。**ユーザー明示承認済みのスコープ拡張** | 矛盾なし（ユーザー明示承認によりスコープ内化） |
| 7 | （REQ-C-008）プロンプトテンプレートの「指示内容・出力形式の変更」 | REQ-C-008 は change/bugfix の delta-designer / task-planner / doc-syncer / impact-reviewer プロンプトに「分割判断・索引フォーマット・全 Read 義務」を追加する。これは新規スキル（fs-change-phase2-impl / fs-bugfix-phase2-impl）配下に**新規作成するプロンプトテンプレートの内容**であり、既存プロンプトの指示内容を改変するものではない。本WFのフェーズ統合に伴い新規作成される成果物の一部 | 矛盾なし（新規作成プロンプトのため既存改変に該当せず） |

### 補足: 境界ケースの判断根拠

- **session_history_file の型変更**: パラメータの型（string → string[]）はインターフェース仕様であり、「内部ロジック」（検証アルゴリズム、判定基準、出力形式）とは区別される。後方互換性を維持する設計（単一パスも受け付ける）により、既存の呼び出し元への影響も最小化されている
- **progress-final-checker の total_phases 変更**: これは呼び出し時の引数値の変更であり、エージェント定義の変更ではない。エージェント定義自体は「渡された total_phases に基づいて検証する」というロジックのまま
- **REQ-C-009 のスコープ拡張（既存4ファイルの直接修正）**: multi-stage-code-review/SKILL.md + 3エージェント定義の計4ファイルは、当初の変更要件スコープ（変更WF/バグ修正WFのフェーズ統合）の範囲外。delta-design.md「スコープ拡張の経緯」に記載の通り、ユーザーが「スコープクリープを許可し、今回で全て修正する」と明示指示したため本WF内で実施。これら4ファイルは複数WF共有資産であり、本WFで修正済みのため他WF横展開時（PI-021）は再修正不要。**ユーザー明示承認があるため change-requirements.md「対象外」との矛盾は発生しない**
- **REQ-C-008 の「分割対応」**: 差分設計の成果物フォーマット（単一→索引+分割可）の拡張であり、設計プロセスの本質（before→after で差分を記述する）は不変。新規スキル・新規プロンプトに対する記述追加であり、既存資産の振る舞い変更には当たらない

## テスト対象機能

### 直接変更のテスト

| # | テスト対象 | テスト内容 | 検証方法 |
|---|---|---|---|
| 1 | 変更WF新3フェーズの実行 | Phase 1（分析・計画）→ Phase 2（設計・実装）→ Phase 3（最終チェック）が正常に遷移するか | 変更WFを実際に実行し、全フェーズが完走することを確認 |
| 2 | バグ修正WF新3フェーズの実行 | Phase 1（分析・計画）→ Phase 2（設計・実装）→ Phase 3（最終チェック）が正常に遷移するか | バグ修正WFを実際に実行し、全フェーズが完走することを確認 |
| 3 | step-history-writer の動作 | 各Step完了時に正しいパス・フォーマットで履歴ファイルが書き出されるか | フェーズ実行中に `.aide/tmp/session-history-*.txt` が生成されることを確認 |
| 4 | compliance-checker の session_history_files 配列対応 | 複数ファイルパスを渡した場合に全ファイルを読み込んで検証できるか | 後処理で compliance-checker が複数ファイルを正常に処理することを確認 |
| 5 | progress-final-checker の total_phases=2 対応 | Phase 3 で total_phases: 2 を渡した場合に正しく検証できるか | final-check フェーズで PASS/FAIL が正しく判定されることを確認 |
| 6 | 旧Step内容の完全移植 | 旧フェーズスキルの全Step内容が新スキルに漏れなく含まれているか | 旧スキルと新スキルのStep一覧を突合し、欠落がないことを確認 |

### REQ-C-008（分割対応）のテスト（追加）

| # | テスト対象 | テスト内容 | 検証方法 |
|---|---|---|---|
| 7 | 差分設計の分割判断 | 規模が大きい差分設計で delta-designer / bugfix-designer がメイン（索引）+ 分割ファイル群構成を作成するか | 大規模変更を入力し、delta-design.md が索引化され delta-design-{name}.md が生成されることを確認 |
| 8 | 分割ファイルの索引整合 | メインの「修正対象の差分設計」「新規追加の設計」が分割ファイルへのリンク + 一行サマリになっているか | メインファイルのリンクと実在する分割ファイルの突合 |
| 9 | 分割ファイルの単独完結性 | 各分割ファイルが before / after / 変更理由 を含み単独で読めるか | 各分割ファイルの内容確認 |
| 10 | 後続 Step の全 Read 義務 | 影響再精査 / タスク計画 / doc-sync の各サブエージェントが索引判定をして分割ファイル群を全 Read するか | impact-reviewer 自己チェック C7、task-planner / doc-syncer の網羅性チェックが分割ファイル合算で実施されることを確認（索引のみ読んで本文読み忘れがないこと） |
| 11 | fix モードの分割ファイル編集 | QA指摘修正時に該当の分割ファイル側を Edit するか（メインの索引だけを編集しないか） | fix モードで分割ファイル側が修正されることを確認 |

### REQ-C-009（1呼び出し=1サブタスク強化 / 二重防御）のテスト（追加）

| # | テスト対象 | テスト内容 | 検証方法 |
|---|---|---|---|
| 12 | 第1層: 呼び出し元の粒度チェック | fs-change-phase2-impl Step 12 / fs-bugfix-phase2-impl Step 10 の「呼び出し前チェックリスト（粒度チェック最重要）」が機能するか | 複数タスク束ねの指示を作ろうとした際、呼び出し前に中止・修正されることを確認 |
| 13 | 第2層: multi-stage-code-review Stage 0 検証 | 複数 task_id / 複数 target_file / 複数指示表現を渡した場合に BLOCKED で返却されるか | Stage 0a の各チェック項目（#1〜#5）に違反するペイロードを渡し BLOCKED / NEEDS_CONTEXT が返ることを確認 |
| 14 | 第3層: 3エージェントの受領時チェック | micro-impl-agent / design-review-agent / code-review-agent が受領時に粒度違反を検出し BLOCKED を返すか | 各エージェントに束ね依頼を渡し BLOCKED が返ることを確認 |
| 15 | 柔軟ルール例外の判定 | parent_task_id + target_public_methods 明示かつ同一クラス/同一ファイル/極小 publicMethod の場合のみ束ね受領を許容するか | 例外条件を満たす/満たさないペイロードで Stage 0b / 各エージェント例外判定が正しく分岐することを確認 |
| 16 | オーケストレータの BLOCKED 受領後の再実行 | multi-stage-code-review から BLOCKED を受けた際、呼び出しを修正して再実行する分岐が機能するか | BLOCKED 返却時に Step 12/10 が呼び出しを 1サブタスク粒度に修正して再実行することを確認 |

### リグレッションテスト

| # | テスト対象 | リグレッションリスク | 検証方法 |
|---|---|---|---|
| 1 | 他5WF（企画・設計・実装・逆引き・リファクタリング）の正常動作 | step-history-writer 追加による副作用 | 他WFのフェーズを1つ実行し、前処理・後処理が正常に動作することを確認 |
| 2 | progress-resume-check の再開判定 | 進捗ファイルのフェーズ数変更による再開位置誤判定 | 変更WF・バグ修正WFの進捗ファイルを途中状態にして再開判定が正しく動作することを確認 |
| 3 | phase-compliance-check (verify) の署名検証 | 新フェーズ名での署名検証が正しく動作するか | Phase 2 → Phase 3 遷移時に verify が PASS することを確認 |
| 4 | ハブスキルのルーティング | エントリポイントスキル名変更後のルーティング | 「変更して」「バグ修正して」等の発話で正しいスキルが activate されることを確認 |
| 5 | session_history_file 単一パスの後方互換 | 他5WFは当面単一パスで渡す可能性 | 単一パス（文字列）を渡した場合にも compliance-checker が正常動作することを確認 |
| 6 | 既存WF（実装WF・リファクタリングWF）のレビューパイプライン | multi-stage-code-review への Stage 0 追加・3エージェントの受領時チェック追加による副作用（正常な1サブタスク呼び出しが誤って BLOCKED されないか） | 実装WF・リファクタリングWFで正常な1サブタスク呼び出しが Stage 0 を通過し、従来通りパイプラインが完走することを確認 |
| 7 | 分割していない差分設計の従来動作 | REQ-C-008 の分割対応追加により、分割しない（単一ファイル）ケースが従来通り処理されるか | 小規模変更で delta-design.md / fix-design.md を単一ファイルで作成し、後続 Step が従来通り動作することを確認 |

## アクター視点の影響（フェーズ3版から継承 + REQ-C-008/009 追記）

### 影響を受けるアクター

| アクター | 影響内容 |
|---|---|
| AIエージェント（オーケストレータ） | ワークフロー実行時のフェーズ遷移先スキル名が変わる。前処理・後処理の呼び出し回数が削減される（変更WF: 10回→3回、バグ修正WF: 7回→3回）。REQ-C-006 により全フェーズスキルでStep単位の履歴書き出しが追加される。**（REQ-C-009）タスク実装ループで multi-stage-code-review を呼び出す際、10項目ペイロードテンプレートを構築し、呼び出し前に粒度チェックを実施する義務が追加される。BLOCKED 受領時は呼び出しを 1サブタスク粒度に修正して再実行する。（REQ-C-008）後続 Step で delta-design.md / fix-design.md の分割索引を判定し、分割ファイル群を全 Read する義務が追加される** |
| AIエージェント（compliance-checker） | session_history_file パラメータが単一ファイル→複数ファイル対応に変更。検証対象のフェーズ名が変わる |
| AIエージェント（progress-final-checker） | total_phases の値が変わる（変更WF: 9→2、バグ修正WF: 6→2） |
| AIエージェント（progress-resume-check） | 進捗ファイルのフェーズ数が変わる（変更WF: 10→3、バグ修正WF: 7→3）。ステータステーブルの行数が減少する |
| AIエージェント（multi-stage-code-review） | **（REQ-C-009）Stage 0「依頼内容チェック」が新設され、パイプライン開始前にペイロード（task_id / target_file / task_title / design_refs / dev_environment）を検証し、違反時は BLOCKED / NEEDS_CONTEXT を返す責務が追加される。柔軟ルール例外（parent_task_id / target_public_methods）の判定責務も追加される** |
| AIエージェント（micro-impl-agent） | **（REQ-C-009）「依頼受領時のチェック」が新設され、依頼受領時に粒度違反（複数タスク束ね・複数ファイル・複数指示）を検出し BLOCKED / NEEDS_CONTEXT を返す第3層防御の責務が追加される** |
| AIエージェント（design-review-agent） | **（REQ-C-009）「依頼受領時のチェック」が新設され、レビュー依頼受領時に粒度違反を検出し BLOCKED を返す責務が追加される** |
| AIエージェント（code-review-agent） | **（REQ-C-009）「依頼受領時のチェック」が新設され、レビュー依頼受領時に粒度違反を検出し BLOCKED を返す責務が追加される** |
| AIエージェント（change-delta-designer / bugfix-designer） | **（REQ-C-008）差分設計の規模を見積もり、大規模時にメイン（索引）+ 分割ファイル群構成で作成する責務が追加される。fix モードでは分割ファイル側を Edit する** |
| AIエージェント（change-impact-reviewer） | **（REQ-C-008）delta-design.md の分割索引を判定し、分割ファイル群を全 Read してシグネチャ変更全件追跡を合算で実施する責務が追加される（自己チェック C7）** |
| AIエージェント（change-task-planner / bugfix-task-planner） | **（REQ-C-008）分割ファイル全 Read のうえ、メイン+全分割ファイル合算の変更項目数で網羅性チェックを実施する責務が追加される** |
| AIエージェント（change-doc-syncer / bugfix-doc-syncer） | **（REQ-C-008）分割索引判定 → 分割ファイル全 Read（読み忘れ厳禁）のうえ既存設計書に反映する責務が追加される** |
| ユーザー（開発者） | 進捗ファイルの表示が簡潔になる。ワークフロー実行時のコンテキスト消費が削減され、セッション切り替え頻度が低下する。**（REQ-C-008）大規模な差分設計が分割提示されることで、レビュー時の可読性が向上する。承認時はメイン+全分割ファイルがセットで提示される** |

### 影響を受けるユースケース

| ユースケース | 影響内容 |
|---|---|
| 変更WFの実行 | エントリポイントが `fs-change-phase1-status` → `fs-change-phase1-analysis` に変更。フェーズ遷移が Phase1→Phase2→Phase3 の3段階に簡素化 |
| バグ修正WFの実行 | エントリポイントが `fs-bugfix-phase1-report` → `fs-bugfix-phase1-analysis` に変更。フェーズ遷移が Phase1→Phase2→Phase3 の3段階に簡素化 |
| progress-resume-check による再開判定 | 変更WF・バグ修正WFの進捗ファイルのフェーズ数が変わるため、再開位置の判定ロジックに影響（ただし progress-resume-check 自体はステータステーブルを機械的に読むため内部ロジック変更は不要） |
| phase-compliance-check (verify) | 検証対象のスキル名が新名称に変わる。進捗ファイルの前フェーズ署名検証で参照するフェーズ名が変わる |
| phase-compliance-check (write) | session_history_files が複数ファイルのパス一覧に変更。全7WFの全フェーズスキルで Step 単位の履歴書き出しが追加される |
| ハブスキルによるルーティング | using-aide-powers のワークフロー選択ガイドでエントリポイントスキル名が変わる |
| セッション再開時の状況把握 | 進捗ファイルのフェーズ数が減少するため、表示が簡潔になる |
| 大規模差分設計の作成・レビュー（REQ-C-008） | 差分設計が分割索引構成で作成され、後続の影響再精査 / タスク計画 / doc-sync が分割ファイルを全 Read する。ユーザー承認はメイン+全分割ファイルのセット提示で行う |
| タスク実装ループの実行（REQ-C-009） | サブエージェント呼び出しが「1呼び出し=1サブタスク」で厳格化され、3層（呼び出し元・multi-stage-code-review・3エージェント）でペイロード粒度が検証される。違反時は BLOCKED で差し戻され、呼び出しを修正して再実行する |
| 実装WF・リファクタリングWFのタスク実装ループ（REQ-C-009 横展開影響） | multi-stage-code-review / 3エージェントは共有資産のため、Stage 0 / 受領時チェック追加が実装WF・リファクタリングWFのレビューパイプラインにも作用する。正常な1サブタスク呼び出しは従来通り通過する（PI-021 横展開時のフェーズスキル側追記は別途必要だが、受領側ガードは本WFで反映済み） |

## プログラム構成視点の影響（フェーズ3版から継承 + 精査結果 + REQ-C-008/009 追記）

### 直接変更対象

#### 新規作成（7ファイル — delta-design.md 確定版）

| ファイル | 内容 |
|---|---|
| `skills/fs-change-phase1-analysis/SKILL.md` | 変更WF Phase1（分析・計画）: 旧Phase 1〜4 統合 |
| `skills/fs-change-phase2-impl/SKILL.md` | 変更WF Phase2（設計・実装・完了処理）: 旧Phase 5〜9 統合。**REQ-C-008（分割対応）/ REQ-C-009（1呼び出し=1サブタスク・10項目ペイロード）を含む** |
| `skills/fs-change-phase3-final-check/SKILL.md` | 変更WF Phase3（最終整合性チェック）: 旧Phase 10 相当 |
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | バグ修正WF Phase1（分析・計画）: 旧Phase 1〜3 統合 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | バグ修正WF Phase2（設計・実装・ドキュメント反映）: 旧Phase 4〜6 統合。**REQ-C-008 / REQ-C-009 を含む** |
| `skills/fs-bugfix-phase3-final-check/SKILL.md` | バグ修正WF Phase3（最終整合性チェック）: 旧Phase 7 相当 |
| `skills/step-history-writer/SKILL.md` | 各Step完了時の履歴書き出し共通スキル（REQ-C-006） |

#### 新規作成（プロンプトテンプレート — REQ-C-008/009 の記述を内包）

| ファイル | 内容 |
|---|---|
| `skills/fs-change-phase2-impl/change-delta-designer-prompt.md` | mode: phase4 / fix。**REQ-C-008: 分割判断・索引フォーマット例・分割ファイル冒頭フォーマット例・Red Flags・Common Rationalizations・fix モードの分割ファイル Read/Edit** |
| `skills/fs-change-phase2-impl/change-impact-reviewer-prompt.md` | **REQ-C-008: 分割ファイル全 Read + シグネチャ変更全件追跡を合算で実施 + 自己チェック C7** |
| `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | **REQ-C-008: 分割ファイル全 Read + 網羅性チェック合算** |
| `skills/fs-change-phase2-impl/change-doc-syncer-prompt.md` | **REQ-C-008: 分割索引判定 → 分割ファイル全 Read（読み忘れ厳禁）** |
| `skills/fs-bugfix-phase2-impl/bugfix-designer-prompt.md` | mode: design / fix。**REQ-C-008: 分割判断・索引フォーマット・fix モードの分割ファイル Read/Edit** |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | **REQ-C-008: 分割ファイル全 Read + 網羅性チェック合算** |
| `skills/fs-bugfix-phase2-impl/bugfix-doc-syncer-prompt.md` | **REQ-C-008: 分割索引判定 → 分割ファイル全 Read（読み忘れ厳禁）** |

注: これらプロンプトテンプレートは新フェーズスキル新規作成に伴う新規成果物であり、既存プロンプトの内容改変ではない。

#### REQ-C-009 受領側の既存ファイル変更（スコープ拡張・ユーザー明示承認済み・実体反映済み）

| # | ファイル | 変更内容 | 状態 |
|---|---|---|---|
| 1 | `skills/multi-stage-code-review/SKILL.md` | 「Stage 0: 依頼内容チェック（受領時・必須）」新設（0a ペイロード検証5項目 + 0b 柔軟ルール例外判定 + 0c 理由）、Red Flags に違反パターン追加 | **反映済み（確認済み）** |
| 2 | `agents/micro-impl-agent.md` | 「依頼受領時のチェック（必須・最初に実行）」新設（チェックリスト5項目 + 柔軟ルール例外 + 理由） | **反映済み（確認済み）** |
| 3 | `agents/design-review-agent.md` | 「依頼受領時のチェック（必須・最初に実行）」新設（チェックリスト4項目 + 柔軟ルール例外 + 理由） | **反映済み（確認済み）** |
| 4 | `agents/code-review-agent.md` | 「依頼受領時のチェック（必須・最初に実行）」新設（チェックリスト4項目 + 柔軟ルール例外 + 理由） | **反映済み（確認済み）** |

これら4ファイルは複数WF共有資産。本WFで修正済みのため、他WF（実装WF・リファクタリングWF）への横展開（PI-021）時は再修正不要。

#### 削除対象（17ディレクトリ）

| ディレクトリ | 統合先 |
|---|---|
| `skills/fs-change-phase1-status/` | fs-change-phase1-analysis に統合 |
| `skills/fs-change-phase2-requirements/` | fs-change-phase1-analysis に統合 |
| `skills/fs-change-phase3-impact/` | fs-change-phase1-analysis に統合 |
| `skills/fs-change-phase4-approach/` | fs-change-phase1-analysis に統合 |
| `skills/fs-change-phase5-delta-design/` | fs-change-phase2-impl に統合 |
| `skills/fs-change-phase6-impact-review/` | fs-change-phase2-impl に統合 |
| `skills/fs-change-phase7-task-planning/` | fs-change-phase2-impl に統合 |
| `skills/fs-change-phase8-impl/` | fs-change-phase2-impl に統合 |
| `skills/fs-change-phase9-completion/` | fs-change-phase2-impl に統合 |
| `skills/fs-change-phase10-final-check/` | fs-change-phase3-final-check にリネーム |
| `skills/fs-bugfix-phase1-report/` | fs-bugfix-phase1-analysis に統合 |
| `skills/fs-bugfix-phase2-analysis/` | fs-bugfix-phase1-analysis に統合 |
| `skills/fs-bugfix-phase3-plan/` | fs-bugfix-phase1-analysis に統合 |
| `skills/fs-bugfix-phase4-design/` | fs-bugfix-phase2-impl に統合 |
| `skills/fs-bugfix-phase5-impl/` | fs-bugfix-phase2-impl に統合 |
| `skills/fs-bugfix-phase6-doc/` | fs-bugfix-phase2-impl に統合 |
| `skills/fs-bugfix-phase7-final-check/` | fs-bugfix-phase3-final-check にリネーム |

#### 変更対象（既存ファイル更新 — 参照ファイル更新19件）

| # | ファイル | 変更内容 |
|---|---|---|
| 1 | `skills/using-aide-powers/SKILL.md` | エントリポイントスキル名を更新 |
| 2 | `skills/using-aide-powers/references/global-rules.md` | ルーティングテーブルのスキル名を更新 |
| 3 | `.kiro/steering/aide-powers-global-rules.md` | エントリポイントスキル名を更新（rules-distribute で自動再生成） |
| 4 | `.aide/references/progress-file-format.md` | §7.5 / §7.6 を3フェーズテンプレートに更新 |
| 5 | `skills/phase-compliance-check/SKILL.md` | session_history_files パラメータ対応（配列）に変更 |
| 6 | `agents/compliance-checker.md` | session_history_files 入力仕様を配列対応に変更 |
| 7 | `agents/progress-final-checker.md` | total_phases の説明を更新（変更WF: 2、バグ修正WF: 2） |
| 8 | `skills/aide-powers-guide/SKILL.md` | ワークフロー選択ガイドのエントリポイントスキル名を更新 |
| 9 | `.aide/specs/aide-powers/dev-environment.md` | §11 エントリポイントスキル名を更新 |
| 10 | `docs-dev/00-overview.md` | ワークフロー一覧テーブルのエントリポイントスキル名を更新 |
| 11 | `docs-dev/02-ai-agent/00-overview.md` | ワークフロー一覧テーブルのスキル名を更新 |
| 12 | `docs-dev/02-ai-agent/02-phase-skills/change.md` | 変更WFの全フェーズ一覧を3フェーズに更新 |
| 13 | `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | バグ修正WFの全フェーズ一覧を3フェーズに更新 |
| 14 | `docs-dev/02-ai-agent/01-workflows/05-change.md` | 変更WFのフロー図・フェーズ遷移を更新 |
| 15 | `docs-dev/03-how-to/add-phase-skill.md` | フェーズスキル命名規則の例示を更新 |
| 16 | `docs-dev/01-system-platform/01-hub-skill-activation.md` | ハブスキルのルーティングテーブルを更新 |
| 17 | `doc-index.md` | 新スキル名への参照更新（存在する場合） |
| 18 | 各プロンプトテンプレート（change-*-prompt.md） | 遷移先スキル名の参照文字列置換 |
| 19 | 各プロンプトテンプレート（bugfix-*-prompt.md） | 遷移先スキル名の参照文字列置換 |

#### REQ-C-006 による変更対象（全7WFの全フェーズスキル）

統合後の全フェーズスキルに step-history-writer 呼び出しルールを追加する。

| WF | フェーズ数 | 対象スキル |
|---|---|---|
| 企画 | 4 | `fs-planning-phase1-intake-and-init` 〜 `fs-planning-phase4-final-check` |
| 設計 | 11 | `fs-design-phase1-user-req` 〜 `fs-design-phase11-final-check` |
| 実装 | 7 | `fs-impl-phase1-gate` 〜 `fs-impl-phase7-final-check` |
| 設計逆引き | 6 | `fs-reverse-phase1-program` 〜 `fs-reverse-phase6-final-check` |
| 変更（新） | 3 | `fs-change-phase1-analysis` 〜 `fs-change-phase3-final-check` |
| バグ修正（新） | 3 | `fs-bugfix-phase1-analysis` 〜 `fs-bugfix-phase3-final-check` |
| リファクタリング | 7 | `fs-refactoring-phase1-status` 〜 `fs-refactoring-phase7-final-check` |
| **合計** | **41** | |

#### REQ-C-007 による変更対象（mode: delta 統一）

| # | ファイル | 変更内容 |
|---|---|---|
| 1 | `skills/object-design/SKILL.md` | mode 一覧 / 差分更新プロセス / 完了条件 / Called by / Input from caller の `update` を `delta` に変更。プロセス内容を「中間ファイル出力（既存設計書直接更新を廃止）」に書き換え |
| 2 | `skills/object-design/object-designer-prompt.md` | `mode: update` セクションを `mode: delta` に書き換え。出力先を `{changes_dir}/delta-object-design.md` に変更 |
| 3 | `skills/gui-design/SKILL.md` | mode 一覧 / Update プロセス / Called by / Input from caller の `update` を `delta` に変更。プロセス内容を「中間ファイル出力」に書き換え |
| 4 | `skills/gui-design/gui-designer-prompt.md` | `update モード` セクション x2 を `delta モード` に書き換え。出力先を `{changes_dir}/delta-gui-design.md` に変更 |
| 5 | `skills/ddd-modeling/SKILL.md` | モード判定の `update` を `delta` にリネーム。プロセスC を「Delta プロセス」にリネーム（実態は既に delta-design.md 出力なので動作変更なし） |
| 6 | `skills/ddd-modeling/ddd-modeler-prompt.md` | `mode: update` 入力仕様を `mode: delta` にリネーム |
| 7 | `skills/fs-refactoring-phase4-design/SKILL.md` | 設計系共通スキル呼び出し記述（5箇所以上）を `mode: delta` で明示的に呼ぶように統一 |
| 8 | `skills/fs-refactoring-phase4-design/refactoring-designer-prompt.md` | 「設計系共通スキル差分モードの結果」記述を `delta-{領域名}.md` ファイル参照に変更 |
| 9 | `.aide/specs/aide-powers/tray-app-planning/.kiro-side/system-architecture.md` | 「（新規作成/差分更新モード）」を「（新規作成/差分モード）」に表記統一 |
| 10 | `.aide/specs/aide-powers/tray-app-planning/.aide-side/system-architecture.md` | 同上 |

#### REQ-C-008 による変更対象（差分設計ファイル分割対応）

| # | 対象 | 変更内容 | 種別 |
|---|---|---|---|
| 1 | `skills/fs-change-phase2-impl/SKILL.md` | Iron Laws「大規模設計時の分割対応」/ 成果物テーブル（delta-design-{name}.md）/ Step 3 ユーザー承認のセット提示 / Step 6・8・16 の Input（索引判定+全 Read）/ Step 13 design-sync の分割ファイル修正 / 完了条件に分割対応を追記 | 新規スキル設計 |
| 2 | `skills/fs-bugfix-phase2-impl/SKILL.md` | 同上（Step 番号は bugfix 版に対応: Step 6・14 の Input、Step 11 design-sync 等） | 新規スキル設計 |
| 3 | change/bugfix delta-designer プロンプト | 分割判断・索引フォーマット例・分割ファイル冒頭フォーマット例・自己チェック・Red Flags・Common Rationalizations / fix モードの分割ファイル Read/Edit | 新規プロンプト |
| 4 | change/bugfix task-planner プロンプト | 分割ファイル全 Read + 網羅性チェック合算 | 新規プロンプト |
| 5 | change/bugfix doc-syncer プロンプト | 分割索引判定 → 分割ファイル全 Read（読み忘れ厳禁） | 新規プロンプト |
| 6 | change-impact-reviewer プロンプト（変更WF特有） | 分割ファイル全 Read + シグネチャ変更全件追跡を合算で実施 + 自己チェック C7 | 新規プロンプト |

#### REQ-C-009 による変更対象（1呼び出し=1サブタスク強化 / 二重防御）

| # | 対象 | 変更内容 | 種別 |
|---|---|---|---|
| 1 | `skills/fs-change-phase2-impl/SKILL.md` Step 12 | 「サブエージェント呼び出しの基本原則」「ペイロードテンプレート（10項目）」「呼び出し前チェックリスト（粒度チェック最重要）」「柔軟ルール例外」「なぜ細かく呼び出すのか（理由）」を追記 | 新規スキル設計 |
| 2 | `skills/fs-bugfix-phase2-impl/SKILL.md` Step 10 | 同上 | 新規スキル設計 |
| 3 | `skills/multi-stage-code-review/SKILL.md` | Stage 0「依頼内容チェック」新設（ペイロード検証5項目 + 柔軟ルール例外判定 + 理由）、Red Flags 追加 | **既存ファイル変更（スコープ拡張・反映済み）** |
| 4 | `agents/micro-impl-agent.md` | 「依頼受領時のチェック」新設（5項目 + 柔軟ルール例外 + 理由） | **既存ファイル変更（スコープ拡張・反映済み）** |
| 5 | `agents/design-review-agent.md` | 「依頼受領時のチェック」新設（4項目 + 柔軟ルール例外 + 理由） | **既存ファイル変更（スコープ拡張・反映済み）** |
| 6 | `agents/code-review-agent.md` | 「依頼受領時のチェック」新設（4項目 + 柔軟ルール例外 + 理由） | **既存ファイル変更（スコープ拡張・反映済み）** |

## 影響範囲サマリー（更新 — REQ-C-008/009 統合後）

### 影響度: 大

本変更は aide-powers の中核であるフェーズスキル群に対する大規模な構造変更である。REQ-C-008/009 の追加により、新フェーズスキル（fs-change-phase2-impl / fs-bugfix-phase2-impl）とそのプロンプト群、および複数WF共有資産（multi-stage-code-review + 3エージェント）への影響が加わった。

### シグネチャ・契約変更追跡結果

- **REQ-C-006/007 由来のシグネチャ変更17件**（#1〜#17）: delta-design.md の「参照ファイルの更新」セクションで対応が網羅されていることを確認済み（既存分析を維持）
- **REQ-C-008/009 由来の契約変更5件**（#18〜#22）を新規追跡:
  - #18 multi-stage-code-review 呼び出しペイロードの10項目化
  - #19 multi-stage-code-review 戻り値契約に BLOCKED / NEEDS_CONTEXT 追加
  - #20 柔軟ルール例外パラメータ（parent_task_id / target_public_methods）追加
  - #21 3エージェントの依頼受領契約に粒度チェック追加
  - #22 delta-design.md / fix-design.md の分割構成（成果物フォーマット）追加
- **REQ-C-008/009 に起因するアプリケーションコードレベルの関数シグネチャ変更は新規検出なし**（フレームワークの SKILL/エージェント記述追加が中心）
- 未対応の呼び出し元・影響先は存在しない

### 既存要件矛盾確認結果

- change-requirements.md の「対象外」項目（既存4項目 + REQ-C-008/009 関連3項目 = 計7項目）全てについて矛盾なしを確認
- **REQ-C-009 のスコープ拡張（既存4ファイルの直接修正）はユーザー明示承認済み**（delta-design.md「スコープ拡張の経緯」）であり、「対象外: エージェント定義の判定ロジック変更」「対象外: 共通スキルの内部ロジック変更」との矛盾は発生しない（受領時ガードの追加であり判定ロジック・出力形式の本質は不変）
- REQ-C-008 は新規スキル・新規プロンプトに対する記述であり、既存資産の改変には当たらない

### 主要な影響ポイント

1. **スキルファイルの大量削除・作成**: 17ディレクトリ削除 + 7ファイル新規作成（step-history-writer 含む）+ 7プロンプトテンプレート新規作成
2. **参照元の広範な更新**: 19件の参照ファイル更新が必要。全件 delta-design.md で特定済み
3. **REQ-C-006 の全WF横断影響**: 全7WFの全41フェーズスキルに step-history-writer 呼び出しルールを追加
4. **REQ-C-007 の設計系共通スキル モード統一**: 3スキル + 3プロンプト + リファクタリングWFのフェーズスキル + プロジェクト固有ドキュメントを更新
5. **REQ-C-008 の分割対応**: 新フェーズスキル（Iron Laws / 成果物 / 各 Step Input / 完了条件）+ 6プロンプト（designer / impact-reviewer / task-planner / doc-syncer）に分割索引判定・全 Read 義務を内包。後続 Step の「索引のみ読んで本文読み忘れ」が最大のリスク
6. **REQ-C-009 の二重防御**: 呼び出し元（新フェーズスキル Step 12/10）+ multi-stage-code-review（Stage 0）+ 3エージェント（受領時チェック）の3層でペイロード粒度を検証。受領側4ファイルは既に反映済み（複数WF共有資産のため横展開時 PI-021 で再修正不要）

### 注意点

- 旧スキルの内容移植時に Step の漏れがないことの検証が重要（機能削減なしの前提）
- エントリポイントスキル名の変更は、グローバル領域にデプロイ済みの steering ファイルにも影響する（setup.bat 再実行が必要）
- REQ-C-006 は変更WF・バグ修正WF以外の5WFにも影響するため、実装量が大きい
- progress-resume-check は進捗ファイルのステータステーブルを機械的に読むため、内部ロジック変更は不要
- **（REQ-C-008）分割対応では、後続 Step が索引のみ読んで分割ファイル本文を読み忘れると、影響範囲分析・タスク網羅性・設計書反映が破綻する。各サブエージェントの自己チェック（impact-reviewer の C7 等）と全 Read 義務の徹底が必須**
- **（REQ-C-009）受領側4ファイル（multi-stage-code-review + 3エージェント）は本WFで反映済み。実装フェーズでは新フェーズスキル Step 12/10 側（第1層）の記述追加が主作業となる。共有資産への変更が実装WF・リファクタリングWFのレビューパイプラインに副作用を与えないこと（正常な1サブタスク呼び出しが誤って BLOCKED されないこと）をリグレッションで確認すること**

### 起因元ドキュメントフォルダ

なし（新規変更要求。既存の変更ドキュメントフォルダから派生したものではない）

## フェーズ2/フェーズ3からの変更点

### フェーズ3（初回影響分析）→ フェーズ6（過去セッション精査）での変更点

- REQ-C-006（step-history-writer 全7WF適用）/ REQ-C-007（設計系共通スキル mode: delta 統一）を反映
- シグネチャ変更追跡を17件に拡張（#11〜#17 を REQ-C-007 関連として追加）

### フェーズ6（過去セッション精査）→ フェーズ6（今回再精査）での変更点 ★今回の追記

フェーズ5（差分設計）のやり直しで delta-design.md に追加された REQ-C-008/009 を反映:

1. **シグネチャ・契約変更追跡に5件追加**（#18〜#22）— ペイロード10項目化、戻り値契約 BLOCKED/NEEDS_CONTEXT、柔軟ルール例外パラメータ、3エージェント受領契約、分割構成フォーマット
2. **既存要件矛盾確認に3項目追加**（#5〜#7）— REQ-C-009 のエージェント定義変更・multi-stage-code-review への Stage 0 追加・REQ-C-008 のプロンプト記述について、ユーザー明示承認・新規作成成果物であることを踏まえ矛盾なしと判定
3. **テスト対象機能に分割対応テスト5件（#7〜#11）・1呼び出し=1サブタスク強化テスト5件（#12〜#16）を追加**。リグレッションテストに共有資産影響（#6）・分割なし従来動作（#7）を追加
4. **アクター影響に9アクター追記** — multi-stage-code-review / micro-impl-agent / design-review-agent / code-review-agent / change-delta-designer / bugfix-designer / impact-reviewer / task-planner / doc-syncer の責務追加
5. **プログラム構成に新規プロンプト7件・REQ-C-008 変更対象6件・REQ-C-009 変更対象6件を追加**。REQ-C-009 受領側4ファイルは実体反映済みであることを確認・明記
