# 影響範囲分析（差分設計反映・更新版）

> 本分析は、QA APPROVED 済みの差分設計（[delta-design.md](./delta-design.md) 索引 + 7 分割ファイル）と change-requirements.md（REQ-C-001〜010）を踏まえて、影響範囲を再調査したものです。スコープ拡張で **REQ-C-010（差分設計 C-5 = [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md)）が追加**されたため、その影響を本書に追記・反映しています（REQ-C-001〜009 の記述は原則維持し、REQ-C-010 追加に伴い整合が必要な箇所のみ更新）。Phase 1 版（対応方針確定前）の論点（経路A/B/C・fs-* 本体改修スコープ外との抵触・changes_dir の扱い等）は、対応方針・差分設計で確定した内容に整理・更新済みです。
>
> **メタ開発の代替（user/system-requirements.md 不在）:** 本リポジトリは aide-powers フレームワーク自体のメタ開発であり、標準設計書 user-requirements.md / system-requirements.md は**存在しません**（dev-environment.md §14.1。コア4ファイルのうち存在するのは dev-environment.md のみ）。したがって「既存要件・システム要件との矛盾確認」は、以下を代替の根拠として実施しています:
> - 既存要件の代替＝対象スキル/エージェントの SKILL.md・agents/*.md の既存記述、dev-environment.md、phase-skill-rules.md / global-rules.md（aide-powers の原則）
> - 矛盾確認の観点＝本変更が既存のスキル責務・原則（毎Step activate必須・会話そのまま転記・step_idごと1ファイル・記録なし=FAIL 等）や dev-environment.md の方針と矛盾しないか
> - アクター視点＝ワークフローを実行する AI Agent（オーケストレータ）/ compliance-checker / フレームワーク利用者（人間）/ メタ開発者
> - プログラム構成視点＝スキル定義・エージェント定義・参照ファイルの依存関係
>
> **自動テスト不在（手動検証）:** 自動テストは導入しません（dev-environment.md §7）。本書の「テスト対象機能」は**手動検証すべき振る舞い**として記述します（自動テストコードの作成対象ではない）。

## 変更種別

**両方（追加 + 変更）**

| 区分 | 内容 | 対象要求 |
|---|---|---|
| 追加 | スクリーンショット撮影共通スキル `screenshot-capture` の新規作成 | REQ-C-001 |
| 変更 | step-history-writer SKILL.md（スクショ呼び出し・入力 artifact_dir 追加・メタ成果物フォルダパス追加・完了日時削除・履歴欠落検出工程追加） | REQ-C-002 / REQ-C-003 / REQ-C-008 / REQ-C-009 |
| 変更 | compliance-checker.md（照合キー導出+絞り込み・W4-D を FSタイムスタンプ基準へ・W5スクショ照合追加） | REQ-C-004 / REQ-C-005 / REQ-C-008 |
| 変更 | 全フェーズスキル fs-*（34 スキル）の step-history-writer 呼び出しへ `artifact_dir` 引数追加 | REQ-C-007 |
| 変更（ドキュメント） | dev-environment.md §1/§6/§12（+§13 整合補強）の Python/.venv 方針改訂 | REQ-C-006 |
| 変更 | final-check 系 7 スキル（fs-*-final-check）の「一時ファイルの削除」Step のクリーンアップ範囲拡張（`session-history-*.txt` のみ→`.txt`/`.png`/`.err` の3拡張子）＋想定外残ファイルのユーザー確認削除（bugfix/change は Iron Law/完了条件の表現も整合） | REQ-C-010 |

## シグネチャ/呼び出し規約変更の全件追跡（Iron Law・省略不可）

本変更の「シグネチャ/呼び出し規約変更」は (a)〜(d) の 4 件。本工程で grep により全件追跡し、差分設計の集計を再検証した。**REQ-C-010 はシグネチャ変更を伴わない**（後述 (e) で明示）。

### (a) step-history-writer 入力に `artifact_dir` 追加 → 全呼び出し元 fs-* を全件追跡

**呼び出し規約変更にあたる。** `skills/fs-*/SKILL.md` 内の `step-history-writer (aide-powers skill)` 出現行を本工程で再 grep・ファイル別集計した結果、**34 スキル・計 281 出現**で差分設計（delta-design-overview.md §2.1 / delta-design-fs-star-callsites.md）と完全一致。final-check 系 7 スキルは 0 件（呼び出しなし＝対象外）であることも一致を確認した。

| WF 種別 | 改修対象スキル（自検証 grep 実数） | 小計 | artifact_dir に渡す値 |
|---|---|---|---|
| バグ修正 | fs-bugfix-phase1-analysis(14), fs-bugfix-phase2-impl(20) | 34 | `{bugfix_dir}` |
| 変更 | fs-change-phase1-analysis(13), fs-change-phase2-impl(22) | 35 | `{changes_dir}` |
| 設計 | fs-design-phase1-user-req(6), phase2-system-req(6), phase3-dev-plan(7), phase4-architecture(6), phase5-gui(6), phase6-usecase(10), phase7-ddd(5), phase8-object(10), phase9-infra(6), phase10-program(7) | 69 | `.aide/specs/{feature_name}` |
| 実装 | fs-impl-phase1-gate(5), phase2-preparation(8), phase3-gui-mockup(11), phase4-execution(8), phase5-final-check(6), phase6-doc-generation(7) | 45 | `.aide/specs/{feature_name}` |
| 企画 | fs-planning-phase1-intake-and-init(8), phase2-explore(10), phase3-finalize(7) | 25 | `.aide/specs/{feature_name}` |
| リファクタリング | fs-refactoring-phase1-status(6), phase2-candidates(7), phase3-plan(6), phase4-design(8), phase5-impl(8), phase6-doc(7) | 42 | `{refactoring_dir}` |
| 逆引き | fs-reverse-phase1-program(7), phase2-dev-env(5), phase3-system-req(5), phase4-user-req(7), phase5-optional-phases(7) | 31 | `.aide/specs/{feature_name}` |
| **合計** | **34 スキル** | **281** | — |

> **追跡結果の確定:** Phase 1 版で「経路A を採ると fs-* 全体へ波及し、fs-* 本体改修スコープ外と抵触する」とした論点は、**経路A 採用かつ REQ-C-007 で fs-* の呼び出し改修を正式にスコープ内と確定**したことで解消済み。これは「呼び出し箇所への引数追加のみ（フェーズ構成・Process・責務は不変）」に限定される非破壊変更であり、「fs-* 本体改修（フェーズ構成・責務変更）はスコープ外」とは抵触しない。
> **対象外 7 スキル（final-check 系・呼び出し 0 件）:** fs-bugfix-phase3-final-check / fs-change-phase3-final-check / fs-design-phase11-final-check / fs-impl-phase7-final-check / fs-planning-phase4-final-check / fs-refactoring-phase7-final-check / fs-reverse-phase6-final-check。これらは履歴を**削除する側**であり、`.png`/`.err` クリーンアップ範囲の論点に関わる（後述）。
> 注: 281 は出現行数（「step-history-writer について」見出し説明行を含む）。純粋な呼び出し指示行のみの再カウントは実装工程のタスク分解で行う（本工程スコープ外）。

### (b) step-history-writer メタ情報フォーマット変更（完了日時削除・成果物フォルダパス追加）→ 読む側を全件追跡

履歴メタ情報を**読む側**を追跡するため `完了日時` を skills/agents 全体で grep し、**「履歴メタの完了日時」を参照しているのは compliance-checker の W4-D のみ**であることを確認した。それ以外の `完了日時` ヒットは**すべて進捗ファイル側の完了日時**であり、履歴メタとは別系統（REQ-C-008 の対象外・混同禁止）。

| `完了日時` ヒット箇所 | 種別 | 本変更との関係 |
|---|---|---|
| `skills/step-history-writer/SKILL.md` L65 `- 完了日時: {YYYY-MM-DD HH:MM}（現在時刻）` | **履歴メタ（削除対象）** | REQ-C-008 AC-008-1 で削除。差分設計 delta-design-step-history-writer.md 変更2 |
| `agents/compliance-checker.md` W4-D（L251-253）`各履歴ファイル内の 完了日時: の記載値と…比較` | **履歴メタを読む側（唯一）** | REQ-C-008 AC-008-3/4。FSタイムスタンプ基準へ差し替え。delta-design-compliance-checker.md 変更2 |
| `agents/compliance-checker.md` W6/W7・判定原則（L182, L251要約行, L476, L601-602） | **進捗ファイル側の完了日時（別物）** | REQ-C-008 対象外。W6/W7 は変更なし（delta-design-compliance-checker.md「W7完了日時について」で明示区別）。判定原則の旧W4-D要約行（メタ乖離2時間）は変更3で削除 |
| `skills/phase-compliance-check/SKILL.md` L15-16（進捗表に `✅ 完了`+完了日時） | **進捗ファイル側（別物）** | 対象外。波及なし |
| `agents/progress-final-checker.md` L75（自フェーズを ✅ 完了+完了日時に更新） | **進捗ファイル側（別物）** | 対象外。波及なし |
| `skills/fs-*/SKILL.md` 各完了条件（design×8, planning×2, refactoring×1, change×1, bugfix×1 等）`完了日時が YYYY-MM-DD HH:MM 形式で記録されている` | **進捗ファイル側（別物）** | 対象外。これらは進捗ファイルの完了日時記録を指す。履歴メタ完了日時ではない。波及なし |

> **結論（残存確認）:** 履歴メタ完了日時を参照している箇所は **compliance-checker W4-D（+判定原則の要約行）のみ**であり、本変更（差分設計 変更2・変更3）で漏れなくカバーされている。**履歴メタ完了日時を読む箇所が compliance-checker 以外に残存していないことを確認済み。** 進捗ファイル側の完了日時（W6/W7 等）は REQ-C-008 の対象外であり、誤って削除・変更してはならない（混同防止のため delta-design-compliance-checker.md「W7完了日時について（変更なし・確認）」節が明示）。
> あわせてメタに**追加**される `- 成果物フォルダパス: {artifact_dir}` の読み手は compliance-checker W4-0（照合キー絞り込み・新設）。これは (d) と一体。

### (c) screenshot-capture（新規スキル）の被参照

- 被参照は **step-history-writer のみ**（REQ-C-002 で activate 呼び出し）。新規追加のため既存被参照はない。grep でも `screenshot-capture` を参照する既存ファイルは存在しない（新規）。
- 配布: setup 系（`setup.bat`/`setup.sh`/`setup-local.*`）は `skills/` ディレクトリ一括コピーのため、新規スキルフォルダは自動配布対象。bat/sh への明示追記は**不要**（波及なし）。
- `.gitignore` の `.venv/` 除外は §10.1 で既存。新規追記不要。

### (d) compliance-checker の照合キー導出（progress_file_path・skill_name から feature フォルダ導出）

入力シグネチャは**不変**（`changes_dir` は write モードの既存入力、`progress_file_path`・`skill_name` も既存入力）。本工程では、照合キー導出が依存する**進捗ファイル名の形式前提**が各 WF の実態と合うかを grep で確認した。

| WF 種別 | progress_file_path 実態（grep 確認） | 照合キー導出方式 | 親ディレクトリ＝feature フォルダか |
|---|---|---|---|
| 変更 | `{changes_dir}/change-progress.md` | write 入力 `changes_dir` を直接使用 | （導出不要。changes_dir 直接） |
| バグ修正 | `{bugfix_dir}/bugfix-progress.md` | write 入力 `bugfix_dir` を直接使用 | （導出不要。bugfix_dir 直接） |
| リファクタリング | `.aide/specs/{feature_name}/refactoring/{refactoring_dir}/refactoring-progress.md` | write 入力 `refactoring_dir` を直接使用 | （導出不要。refactoring_dir 直接。※親は feature フォルダではないが導出に依存しない） |
| 設計 | `.aide/specs/{feature_name}/design-progress.md` | progress_file_path の親 → `.aide/specs/{feature_name}` | **○（成立）** |
| 実装 | `.aide/specs/{feature_name}/impl-progress.md` | 同上 | **○（成立）** |
| 企画 | `.aide/specs/{feature_name}/planning-progress.md` | 同上 | **○（成立）** |
| 逆引き | `.aide/specs/{feature_name}/reverse-progress.md` | 同上 | **○（成立）** |

> **検証結果:** feature フォルダ導出系（設計/実装/企画/逆引き）は progress_file_path が `.aide/specs/{feature_name}/` 直下にあり、**親ディレクトリ取得で `.aide/specs/{feature_name}` が正しく得られる**ことを実態 grep で確認（REQ-C-004 / AC-004-5 の前提が成立）。changes_dir 相当系（変更/バグ修正/リファクタリング）は progress が作業サブフォルダ内にあるが、これら 3 WF は write 入力の `changes_dir`/`bugfix_dir`/`refactoring_dir` を**直接**照合キーに使うため、progress_file_path の親ディレクトリ導出には依存しない（AC-004-4）。
> したがって **REQ-C-004 の照合キー導出は全 7 WF で実態と整合**し、fs-* の phase-compliance-check 呼び出しへの改修は不要（AC-004-7）。Phase 1 版の「changes_dir を fs-* 側で揃える必要があるか要検討」という論点は、**compliance-checker 側導出で完結（fs-* 非波及）と確定**したことで解消済み。

### (e) REQ-C-010（final-check 系 7 スキルのクリーンアップ範囲拡張）→ シグネチャ変更なし（明示）

**REQ-C-010 はシグネチャ／呼び出し規約変更を伴わない。** REQ-C-010 はスキル定義（`skills/fs-*-final-check/SKILL.md`）内の「一時ファイルの削除」Step のクリーンアップ手順記述（削除対象 glob・想定外残ファイル確認・bugfix/change の Iron Law/完了条件表現）の**テキスト変更のみ**であり、呼び出しシグネチャ・関数シグネチャ・入力パラメータの変更はない（差分設計 C-5 [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) 8 章「インターフェース影響: なし」と一致）。

**final-check 系 7 スキルの呼ばれ方に変化がないこと（呼び出し規約不変）の確認:**

| 観点 | 確認結果 |
|---|---|
| final-check 系 7 スキルが他から呼ばれる関係 | 各 WF 末尾でオーケストレータが activate する起動関係は不変。REQ-C-010 は起動引数・起動方式を変えない（手順本文の記述変更のみ） |
| final-check 系 7 スキルが step-history-writer を呼ぶか | 呼ばない（(a) で 0 件確認済み）。REQ-C-010 でも呼ばない。REQ-C-007（artifact_dir 引数追加）と独立・非波及 |
| final-check 系 7 スキルが他スキルを呼ぶ関係 | Step 1 の `progress-final-checker` 委譲（署名検証・進捗更新）は不変。REQ-C-010 は Step 2「一時ファイルの削除」内に閉じ、この委譲関係に手を加えない（AC-010-5） |
| screenshot-capture / step-history-writer / compliance-checker との連動 | REQ-C-010 は「生成された `.png`/`.err` を末尾で清掃する受け皿」としてのみ連動。各設計とは独立して成立（差分設計 C-5 8 章と一致） |

> **追跡結果の確定:** REQ-C-010 はシグネチャ変更を伴わないため、(a)〜(d) のような呼び出し元全件 grep 追跡の対象外である。改修対象は final-check 系 7 スキル（fs-bugfix-phase3 / fs-change-phase3 / fs-design-phase11 / fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6）の SKILL.md 内テキストに限定され、これら 7 スキルの起動関係・被参照関係は不変であることを確認した。

## 既存原則・既存記述との矛盾確認（user/system-requirements.md 不在のため代替で実施）

> **代替実施の明記:** 本リポジトリには user-requirements.md / system-requirements.md が存在しない（dev-environment.md §14.1）。そのため、本変更が「既存要件・システム要件」と矛盾しないかの確認は、**対象スキル/エージェントの既存記述（SKILL.md・agents/*.md）・dev-environment.md・phase-skill-rules.md / global-rules.md（aide-powers の原則）**を代替の根拠として実施した。

### 確認結果（矛盾なし）

| # | 既存原則・既存記述（代替根拠） | 本変更の該当箇所 | 矛盾の有無・判定 |
|---|---|---|---|
| K-1 | **毎Step activate必須・自己流直書き禁止**（phase-skill-rules.md 最上位原則） | step-history-writer がスクショ撮影を `screenshot-capture` の activate 経由で行う（REQ-C-002 AC-002-1）。自己流 pyautogui 直書きを禁止 | **矛盾なし**（原則に従う設計） |
| K-2 | **会話履歴そのまま転記**（step-history-writer の既存責務） | メタ情報の改訂（完了日時削除・成果物フォルダパス追加）は「## メタ情報」ブロックのみ。「## 会話履歴（そのまま転記）」セクションは不変 | **矛盾なし**（転記責務は維持） |
| K-3 | **step_id ごと 1 ファイル**（既存仕様。change-requirements.md 前提条件に明記） | スクショは履歴ファイルと同名ベース・拡張子違い（`.png`/`.err`）で step_id ごと 1 対 1。履歴ファイルの 1 ファイル/step 仕様は不変 | **矛盾なし** |
| K-4 | **記録なし＝FAIL・怪しきは FAIL**（compliance-checker W5 絶対ルール） | W5-3 スクショ照合を**追加**（既存 W5-1/W5-2 は不変）。絞り込み 0 件は既存 W4-A の FAIL ルールをそのまま適用（AC-004-3） | **矛盾なし**（既存原則を拡張・強化する方向） |
| K-5 | **compliance-checker は検証側・撮り直さない**（番人責務） | W5-3 で「一次保証を信頼せず独立検証」「撮り直しは step-history-writer 専管」と明記。撮影時写り込み保証は step-history-writer の一次保証 | **矛盾なし**（責務分離が明確） |
| K-6 | **進捗ファイルの完了日時（W6/W7）**（compliance-checker 既存） | REQ-C-008 が削除するのは**履歴メタの完了日時のみ**。W6/W7 の進捗ファイル完了日時は変更しない（delta-design-compliance-checker.md「W7完了日時について」で明示区別） | **矛盾なし・混同なし**（下記 詳細確認 参照） |
| K-7 | **既存署名検証（W3/W4-A）・テキスト履歴検証（W5-1/W5-2）**（compliance-checker 既存ロジック） | 本変更は W4 への絞り込み追加・W4-D 参照元差し替え・W5-3 追加に限定。既存ロジックは不変（change-requirements.md「対象外」節と一致） | **矛盾なし** |
| K-8 | **dev-environment.md §13 グローバル非汚染ルール** | screenshot-capture の pyautogui 依存は `.venv` に隔離・グローバル非インストール（REQ-C-001 AC-001-2 / REQ-C-006 AC-006-4） | **矛盾なし**（§13 と整合。下記 dev-environment 影響参照） |
| K-9 | **final-check 系 7 スキルの既存検証フロー（Step 1 = progress-final-checker への委譲による署名検証・進捗ファイル更新）**（final-check 系 7 スキル既存ロジック） | REQ-C-010 はクリーンアップ（Step 2「一時ファイルの削除」）の削除対象 glob 拡張＋想定外残ファイルのユーザー確認削除＋bugfix/change の Iron Law/完了条件の表現整合のみ。Step 1 の署名検証・進捗更新ロジックには一切手を加えず、クリーンアップは検証 PASS 後の後段処理という既存位置づけを維持（AC-010-5） | **矛盾なし**（検証フローの判定結果に非影響。差分設計 C-5 7 章で担保） |

### REQ-C-009（履歴欠落検出・やり直し促し）と既存「一部欠落許容」の矛盾確認（重点）

既存記述（grep で確認）:
- `skills/phase-compliance-check/SKILL.md` L119: 「**セッション切り替えによる一部欠落は許容されるが、欠落が頻発する場合は FAIL となる（compliance-checker 側で判定）**」
- `agents/compliance-checker.md` W4-A（L234-235）: 「該当する履歴ファイルが **1つも存在しない** 場合 → FAIL」「**一部欠落は許容するが、過半数が欠落している場合 → FAIL**」

REQ-C-009 の動作（delta-design-step-history-writer.md 変更5）:
- step-history-writer が現 Step 書き込み**前**に前処理・前 Step 履歴の欠落を検出し、**ユーザーへ通知して欠落先頭 Process からのやり直しを促す**。
- **やり直し要否の最終判断、およびセッション跨ぎで欠落が説明可能な場合の扱いは、通知を受けたユーザー／オーケストレータが判断する**（AC-009-3 / change-requirements.md REQ-C-009 説明）。step-history-writer 自身は強制 FAIL もフェーズ中断もしない。

**判定: 矛盾なし。** 根拠:
1. REQ-C-009 は step-history-writer 側の**早期検知＋通知＋やり直し促し**であり、compliance-checker 側の**許容/FAIL 判定ロジックを変更しない**。両者は別レイヤー（書き込み時点の早期検知 vs 検証時点の合否判定）で、compliance-checker の「一部欠落許容（過半数欠落で FAIL）」はそのまま温存される。
2. REQ-C-009 は「歯抜けの検出・通知」が主眼で、**最終判断をユーザー/オーケストレータに委ねる**設計のため、「セッション切り替えによる正当な欠落は許容」という既存方針と両立する（正当な欠落ならユーザー判断でやり直し不要と整理できる）。
3. むしろ REQ-C-009 は既存 W4-A（記録なし=FAIL）を**書き込み時点へ前倒し**して補完する位置づけ（delta-design-step-history-writer.md 変更5「位置づけ」・change-requirements.md「関連する既存要件」と一致）。

> **軽微な申し送り（矛盾ではない・整合補強の余地）:** REQ-C-009 で step-history-writer が「欠落は原則やり直し」を促す一方、phase-compliance-check L119 / compliance-checker W4-A は「一部欠落は許容」と表現する。両者は判定主体（ユーザー判断 vs compliance-checker 判定）と発火タイミングが異なるため**論理的な矛盾はない**が、運用上「step-history-writer はやり直しを促すが、compliance-checker は一部欠落を許容しうる」という**温度差**が利用者に分かりにくい可能性がある。文言整合（例: step-history-writer の通知文に「セッション切り替え等で正当に欠落した場合はユーザー判断で続行可」を含める）は差分設計 変更5 の手順 D に既に織り込まれており、追加改修は不要。念のため懸念事項として記載する。

### REQ-C-008（完了日時削除）と compliance-checker W6/W7 の混同確認（重点）

- **削除対象（REQ-C-008）:** step-history-writer が**履歴ファイル**（`.aide/tmp/session-history-*.txt`）の「## メタ情報」に手書きする `- 完了日時:` のみ。
- **削除対象でない（混同禁止）:** compliance-checker W6（ステータステーブルを `✅ 完了`+完了日時に更新）・W7（フェーズ詳細に完了日時追記）は**進捗ファイル**（`*-progress.md`）への記録であり、別系統。grep でも両者が別ファイル・別目的であることを確認済み。
- **判定: 混同なし。** delta-design-compliance-checker.md に「W7 完了日時について（変更なし・確認）」節が設けられ、「REQ-C-008 が削除するのは履歴メタの完了日時のみ。進捗ファイルの完了日時（W6/W7）は変更しない」と明示されている。本影響分析でも (b) のヒット箇所分類で両系統を分離済み。

## dev-environment.md 方針への影響確認

| dev-environment.md 該当箇所 | 現行記載 | 本変更による影響 | 関連 REQ |
|---|---|---|---|
| §1 プロジェクトの性質 | 「Python アプリではない」「.py は存在しない」「Python パッケージ管理ファイルは存在しない」 | screenshot-capture が pyautogui を補助使用するため「一部スキルが Python を補助使用・`.venv` 隔離」を追記（実態整合） | REQ-C-006 AC-006-1 |
| §2 編集対象ファイル形式（末尾「Python ファイル（.py）は存在しません」） | 「.py は存在しない」 | （差分設計の改訂対象は §1/§6/§12 だが）§2 末尾の「.py は存在しない」も実態と乖離しうる。**差分設計では §2 を改訂対象に含めていない**点を申し送り（後述 懸念事項） | REQ-C-006（周辺） |
| §6 依存ツール表 Python 行 | 「Python｜不要｜開発に Python ランタイムを使用しない」 | 「一部スキルで必要（pyautogui／.venv 隔離）」へ改訂 | REQ-C-006 AC-006-2 |
| §6 末尾「仮想環境を使用しない」 | 「venv/.venv は使用しない。作成自体が不要」 | 「screenshot-capture が pyautogui 依存隔離のため `.venv` を使用」へ改訂 | REQ-C-006 AC-006-3 |
| §12 仮想環境 | 「Python 仮想環境は使用しない」「グローバルルール §5-3 は適用対象なし」 | 「screenshot-capture 用に `.venv` 使用」「§5-3 が `.venv` に適用」へ改訂 | REQ-C-006 AC-006-3/4 |
| §13 グローバル非汚染ルール | 「開発作業のためグローバルへ追加パッケージ不要」 | 改訂後の §1/§6/§12 が `.venv` 隔離・グローバル非インストールを明記し §13 と整合。§13 本体改訂は不要（任意の整合補記のみ） | REQ-C-006 AC-006-4 |
| §7 自動テスト方針 | 「自動テストフレームワークは導入しない・手動検証」 | **影響なし**。本変更も手動検証前提（後述「テスト対象機能＝手動検証項目」） | — |
| §14.1 design-gate コア4ファイル | 「user/system/program は存在しない・dev-environment.md のみ存在」 | **影響なし**（本変更で標準設計書を新設しない）。本影響分析もこの前提で実施 | — |

> **方針影響の要点:** REQ-C-006 は dev-environment.md の Python/.venv「不使用」方針を「一部スキルで補助使用・`.venv` 隔離」へ改訂する。これは §13（グローバル非汚染）と矛盾しない（pyautogui は `.venv` に隔離）。section 番号は approach.md が「§1/§3/§12」と記すが、現物の Python/.venv 記述は §1・§6・§12 にあり、差分設計（delta-design-dev-environment.md）で「記述内容を正とし現物の §1/§6/§12 を改訂」と確定済み。**dev-environment.md は設計エージェントが直接編集せず、実装工程で反映**（メタ開発の反映には setup.bat 再実行＋セッション再起動が必要。§0/§11）。

## テスト対象機能（手動検証項目として記述）

> 自動テスト不在（dev-environment.md §7）のため、以下は**手動検証すべき振る舞い**。自動テストコードの作成対象ではない。実機検証は人間（メタ開発者）に委ねる前提（skills/agents 編集は setup.bat 再実行＋セッション再起動まで AI Agent 挙動に反映されない。§0/§11）。

### A. 直接変更する機能の新規手動検証項目

| # | 手動検証項目 | 期待される振る舞い | 関連 REQ/AC |
|---|---|---|---|
| T-1 | screenshot-capture が保存先パスに画像を保存 | output_path に画像 1 ファイルが生成される（GUI 環境） | REQ-C-001 AC-001-1 |
| T-2 | pyautogui 未導入時の `.venv` 自動導入・グローバル非汚染 | `.venv` が作成され pyautogui がそこに入る。グローバルに入らない | AC-001-2 / §13 |
| T-3 | 撮影失敗時の `.err` 代替・画像/.err 排他 | ディスプレイなし環境で `.err` のみ生成（画像は作られない）。両方同時に存在しない | AC-001-3/4 |
| T-4 | step-history-writer が履歴書き出しと同時に screenshot-capture を activate 経由で呼ぶ | 各 Step で `.txt` と同名ベースの `.png`（または `.err`）が生成される | REQ-C-002 AC-002-1/2/3 |
| T-5 | 撮影時の写り込み確認・撮り直し（一次保証） | 該当 Step 文言・chat 画面が写っていない場合、ユーザーへスクロール依頼し撮り直す | AC-002-5 |
| T-6 | 撮影失敗が履歴書き出しを妨げない | `.err` でも履歴 `.txt` 書き出しは成功しフェーズ中断しない | AC-002-4 |
| T-7 | メタ情報に「成果物フォルダパス」1 行が記録される | 履歴 `.txt` の「## メタ情報」に `- 成果物フォルダパス: {artifact_dir}` が出力される | REQ-C-003 AC-003-1 |
| T-8 | artifact_dir 未指定時のフォールバック `(未指定)` | 未指定でも `- 成果物フォルダパス: (未指定)` が記録され、書き出しは成功する | AC-003-3 |
| T-9 | メタ情報から完了日時が消える | 履歴 `.txt` に `- 完了日時:` 行が出力されない。他メタ項目は維持 | REQ-C-008 AC-008-1/2 |
| T-10 | compliance-checker が成果物フォルダパスで履歴を絞り込む | 照合キーに一致する履歴のみ検証対象。不一致・`(未指定)` は除外 | REQ-C-004 AC-004-1/2 |
| T-11 | 照合キー導出（changes_dir 系/feature 導出系の両系統） | 変更/バグ修正/リファクタは changes_dir 等を直接、設計/実装/企画/逆引きは progress_file_path 親から feature フォルダを導出して照合 | AC-004-4/5/6 |
| T-12 | 絞り込み 0 件で FAIL | 照合キー一致履歴が 0 件なら「セッション履歴ファイルが存在しない」FAIL | AC-004-3 |
| T-13 | W4-D が FS タイムスタンプ基準で動作（メタ完了日時非依存） | 履歴ファイルの作成日時（Windows: CreationTime、取得不能時 LastWriteTime）で時刻検証。メタ完了日時を参照しない。乖離比較起因の毎回ユーザー確認が発生しない | REQ-C-008 AC-008-3/4/5 |
| T-14 | W5-3 スクショ照合（改ざん検出・写り込み独立検証・偽装判定・部分一致） | スクショ文言が履歴に無い→FAIL、該当Step文言が写っていない→偽装疑い、同一画面/無関係/chat不在→偽装判定、部分一致は許容 | REQ-C-005 AC-005-1〜4 |
| T-15 | W5-3-D `.err` 時のユーザー環境確認・撮り直ししない | `.err` は環境起因かユーザー確認、環境起因ならスクショ不在を FAIL にしない。compliance-checker は撮り直し依頼しない | AC-005-5/6 |
| T-16 | REQ-C-009 履歴欠落検出・やり直し促し | 現 Step 書き込み前に前処理・前 Step 履歴の欠落を検出→ユーザー通知→欠落先頭 Process からのやり直し促し。欠落なしなら通常書き込み | REQ-C-009 AC-009-1〜5 |
| T-17 | REQ-C-009 判定根拠は SKILL.md の Process 順序 | skill_name から当該フェーズ SKILL.md の Process 順序を参照し、自己流推定しない | AC-009-4 |
| T-18 | 全 fs-*（34 スキル）が artifact_dir を渡す | 各 WF の呼び出しに WF 種別ごとの成果物フォルダパスが付与される | REQ-C-007 AC-007-1/2 |
| T-19 | final-check 実行時に `.aide/tmp/session-history-*.{txt,png,err}` が削除される | final-check 系 7 スキルの「一時ファイルの削除」Step で `.txt` に加え `.png`・`.err` も削除対象に含まれ、3拡張子の全 session-history ファイルが削除される | REQ-C-010 AC-010-1 |
| T-20 | 対象 7 スキル全てに同一のクリーンアップ範囲拡張が漏れなく適用 | fs-bugfix-phase3 / fs-change-phase3 / fs-design-phase11 / fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6 の全てで3拡張子削除が記述されている | REQ-C-010 AC-010-2 |
| T-21 | 想定外残ファイルがある場合にユーザー確認の上で削除される | session-history 系（`.txt`/`.png`/`.err`）以外の残ファイルがある場合、一覧を番号付き選択肢（1.全削除/2.残置/3.その他）で提示し、削除可否を確認する。0 件なら確認しない | REQ-C-010 AC-010-3 |
| T-22 | 想定外残ファイルの削除可否がユーザー判断どおりに処理される | ユーザーが「削除」を選べば当該想定外ファイルを削除、「残置」を選べば削除しない（自由記述で一部削除も可） | REQ-C-010 AC-010-4 |
| T-23 | クリーンアップが検証フロー（署名検証・進捗更新）の判定結果に影響しない | クリーンアップ（Step 2）は Step 1 の progress-final-checker による署名検証・進捗更新（PASS 後）の後段処理であり、削除対象の増減・想定外ファイル確認の結果が PASS/FAIL 判定や進捗ステータス更新を変えない | REQ-C-010 AC-010-5 |

### B. 影響を受ける既存機能のリグレッション手動検証対象

| # | リグレッション検証項目 | 退行していないこと | 根拠 |
|---|---|---|---|
| R-1 | step-history-writer の会話履歴そのまま転記 | メタ改訂後も「## 会話履歴（そのまま転記）」が従来どおり機能 | K-2 |
| R-2 | step-history-writer の既存エラー時動作（書き込み失敗で中断しない） | スクショ補記追加後も履歴書き込み失敗の扱いは不変 | delta-design-step-history-writer.md 変更4 |
| R-3 | compliance-checker 既存 W3/W4-A/W4-B/W4-C | 署名検証・存在確認・順序検証・短時間生成判定が従来どおり（W4-C は時刻ソースのみ FS へ統一、判定ロジック不変） | K-7 / delta-design-compliance-checker.md 変更2 |
| R-4 | compliance-checker 既存 W5-1/W5-2 | プロセス実行チェック・偽装検出チェックが従来どおり（W5-3 追加のみ） | K-4/K-7 |
| R-5 | compliance-checker W6/W7（進捗ファイル完了日時） | 進捗ファイルへの完了日時記録が従来どおり（REQ-C-008 の影響を受けない） | K-6 |
| R-6 | progress-final-checker（署名検証＋進捗更新） | 履歴・スクショを読まないため本変更の影響を受けない（自フェーズ完了日時更新は進捗側で不変） | grep 確認（履歴非読込） |
| R-7 | fs-*（34 スキル）のフェーズ構成・Process・責務 | artifact_dir 引数追加のみで、フェーズ構成・手順・責務は不変 | REQ-C-007 AC-007-5 |
| R-8 | final-check 系 7 スキルの `.aide/tmp` クリーンアップ | `.txt` 削除の挙動自体は従来どおり維持される（REQ-C-010 は削除対象を `.png`/`.err` へ**拡張**するものであり、既存の `.txt` 削除を壊さない。bugfix/change の Iron Law/完了条件も `.txt` 削除を含めた整合表現へ拡張） | REQ-C-010 / 差分設計 C-5 / K-9 |

## 説明対象アクターの特定

操作フロー・運用が変わるアクターは以下 4 種。Phase 1 版から「撮り直し責務（一次保証）」「番人責務（独立検証）」「履歴欠落やり直し促し」を反映して更新。

| アクター | 影響を受ける操作・運用の変化 | 関連 REQ |
|---|---|---|
| **ワークフローを実行する AI Agent（オーケストレータ）** | 各 Step の履歴記録時に (1) screenshot-capture を activate して撮影、(2) 撮影時の写り込み確認・撮り直し依頼（一次保証）、(3) 現 Step 書き込み前の前処理・前 Step 履歴欠落検出と欠落先頭 Process からのやり直し促し、(4) 各呼び出しに artifact_dir を渡す、が追加される。あわせて (5) 各 WF 末尾の final-check 実行時に、`.aide/tmp/session-history-*.{txt,png,err}` の3拡張子削除に加え、session-history 系以外の想定外残ファイルをユーザー確認（番号付き選択肢）の上で削除する運用が加わる | REQ-C-002/003/007/009/010 |
| **compliance-checker（共通サブエージェント）** | (1) 照合キー導出＋成果物フォルダパス絞り込み（W4-0 新設）、(2) W4-D を FS タイムスタンプ基準へ、(3) W5-3 スクショ照合（番人として一次保証を信頼せず独立検証・撮り直ししない・`.err` 時環境確認）、が追加される | REQ-C-004/005/008 |
| **フレームワーク利用者（人間）** | (1) 撮影時の撮り直し依頼（スクロール等）への応答、(2) `.err` 時の撮影環境確認への応答、(3) 履歴欠落通知時のやり直し要否の最終判断、が増える。あわせて (4) final-check のクリーンアップ時に提示される「想定外残ファイル一覧」の削除可否確認（番号付き選択肢: 全削除/残置/その他）への応答が増える。GUI/ディスプレイなし環境では撮影が `.err` 代替となる | REQ-C-002/005/009/010 |
| **aide-powers 開発者（メタ開発者）** | screenshot-capture 用に `.venv`+pyautogui 導入前提が加わる。dev-environment.md の Python/.venv 方針改訂の反映（実装工程で編集→setup.bat 再実行＋セッション再起動）。手動検証（上記 T-/R- 項目）を実機で実施する | REQ-C-006 / dev-environment §0/§7/§11 |

## プログラム構成視点の影響（変更対象ファイルと依存関係）

### 変更対象ファイル

| # | ファイル | 変更種別 | 関連 REQ | 詳細設計 |
|---|---|---|---|---|
| 1 | `skills/screenshot-capture/SKILL.md` | 追加（新規） | REQ-C-001 | delta-design-screenshot-capture.md |
| 2 | `skills/step-history-writer/SKILL.md` | 変更 | REQ-C-002/003/008/009 | delta-design-step-history-writer.md |
| 3 | `agents/compliance-checker.md` | 変更 | REQ-C-004/005/008 | delta-design-compliance-checker.md |
| 4 | `skills/fs-*/SKILL.md`（34 スキル） | 変更（引数追加のみ） | REQ-C-007 | delta-design-fs-star-callsites.md |
| 5 | `.aide/specs/aide-powers/dev-environment.md` §1/§6/§12 | 変更（ドキュメント） | REQ-C-006 | delta-design-dev-environment.md |
| 6 | `skills/fs-*-final-check/SKILL.md`（final-check 系 7 スキル: fs-bugfix-phase3 / fs-change-phase3 / fs-design-phase11 / fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6） | 変更〔クリーンアップ手順記述〕 | REQ-C-010 | delta-design-final-check-cleanup.md |

### 依存関係（変更対象を参照しているファイル）

| 参照元ファイル | 参照対象 | 波及の有無 | スコープ |
|---|---|---|---|
| 全 fs-*（34 スキル・281 出現） | step-history-writer | **波及あり（確定・スコープ内）** artifact_dir 引数追加。grep 全件追跡済み（上記 (a)） | **スコープ内**（REQ-C-007） |
| final-check 系 7 スキル（fs-*-final-check） | step-history-writer | step-history-writer 呼び出しなし（grep 0 件）。ただし `.aide/tmp` クリーンアップ側として `.png`/`.err` 残置の論点あり。クリーンアップ範囲拡張＋想定外残ファイルのユーザー確認削除を実施 | **本変更スコープ内（REQ-C-010 / 差分設計 C-5 [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) で対応）** |
| `skills/phase-compliance-check/SKILL.md` | compliance-checker | write で `changes_dir` を既に渡す。照合キー導出は compliance-checker 側完結のため**呼び出し改修不要**。スクショ照合・絞り込み前提の明文追記は任意（必須でない） | 改修不要（申し送り U-3） |
| `skills/phase-compliance-check/SKILL.md` L119 | step-history-writer | 「Step 完了ごとに履歴書き出しが必要」前提を記述。`.png`/`.err` も `.aide/tmp` に増えるため前提記述の整合は軽微 | 要検討（軽微・申し送り） |
| `agents/progress-final-checker.md` | （署名のみ） | **波及なし**（履歴・スクショを読まない。grep で履歴非読込を確認） | スコープ外 |
| `setup.bat`/`setup.sh`/`setup-local.*` | skills/ 一括コピー | **波及なし**（新規スキルは自動配布。明示追記不要） | スコープ外 |
| `.gitignore` §10.1 | `.venv/` | **波及なし**（`.venv/` 除外は既存） | スコープ外 |
| `.aide/specs/aide-powers/doc-index.md` | （索引） | 新規スキル screenshot-capture の索引整合（doc-index-maintenance の通常運用で吸収） | 申し送り U-1 |
| `skills/using-aide-powers/references/phase-skill-rules.md` | step-history-writer | **波及なし**（原則の例示のみ。スクショ呼び出しも同原則に従う） | スコープ外 |

### `.aide/tmp/` クリーンアップ範囲への波及（REQ-C-010 として本変更スコープ内で対応）

本変更で `.aide/tmp/` に `session-history-{skill_name}-{step_id}.png`（または `.err`）が増える。final-check 系 7 スキルのクリーンアップは現状 `session-history-*.txt` のみを削除対象としている。`.png`/`.err` が残置すると次回 WF へ持ち越される懸念がある。

- **当初の判断（REQ-C-010 追加前）:** クリーンアップ glob の拡張（`*.txt` → `*.{txt,png,err}` 相当）は REQ-C-007 のスコープ（呼び出し箇所への引数追加のみ）に含まれず、「fs-* 本体改修はスコープ外」（change-requirements.md 対象外節）にあたるため、当初は**本変更では行わない**申し送り（別途変更 WF / pending-issues 化）扱いとしていた。
- **現在の方針（REQ-C-010 でスコープ内化）:** その後のユーザー決定により本件は **REQ-C-010 として本変更スコープ内に取り込まれた**。これに伴い当初判断（本変更では行わない・申し送り U-2）は覆り、差分設計 C-5 [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) で正式対応する。具体的には (1) 削除対象 glob を `session-history-*.txt` のみから `.txt`/`.png`/`.err` の3拡張子へ拡張（改修1 / AC-010-1・2）、(2) session-history 系以外の想定外残ファイルをユーザー確認（番号付き選択肢）の上で削除する工程を追加（改修2 / AC-010-3・4）、(3) fs-bugfix-phase3 / fs-change-phase3 のみ Iron Law / 完了条件の表現も3拡張子表現へ整合（改修3）。
- **検証フローへの非影響:** 上記はいずれも各 final-check スキルの「一時ファイルの削除」Step（検証 PASS 後の後段処理）内に閉じ、Step 1 の progress-final-checker による署名検証・進捗更新の判定結果に影響しない（AC-010-5 / K-9 / 差分設計 C-5 7 章）。
- **申し送り扱いの撤回:** したがって本件は申し送り（別途変更 WF で対応・pending-issues 化）ではなく、本変更の正式な変更対象（既存変更 C-5）である。旧「申し送り U-2」「pending-issues 化推奨」は撤回する（delta-design-overview.md U-2・delta-design.md と一致）。

## 懸念事項

1. **dev-environment.md §2 末尾の「.py は存在しない」記述（差分設計の改訂対象外）:** 差分設計（delta-design-dev-environment.md）の改訂対象は §1/§6/§12 だが、§2「編集対象ファイル形式」末尾にも「Python ファイル（.py）は存在しません」がある。screenshot-capture が pyautogui を `.venv` 内で実行するだけなら**リポジトリに追跡される .py は増えない**（`.venv/` は .gitignore 除外）ため §2 は厳密には誤りにならない可能性が高いが、実装工程で §2 末尾文言の整合（必要なら「リポジトリ追跡対象に .py は存在しない」等の明確化）を確認することを推奨。**矛盾ではなく整合補強の余地**として記載。
2. **REQ-C-009 と「一部欠落許容」の温度差（矛盾ではない）:** step-history-writer がやり直しを促す一方、compliance-checker/phase-compliance-check は一部欠落を許容しうる。判定主体・タイミングが異なるため論理矛盾はないが、利用者への説明上は温度差が分かりにくい可能性（前掲「REQ-C-009 矛盾確認」の申し送り）。差分設計 変更5 手順 D で「最終判断はユーザー/オーケストレータ」と明記済みのため追加改修は不要。
3. **OCR/ビジョン手段は本件対象外:** W5-3 のスクショ文言読み取り手段（画像解析）の技術選定は change-requirements.md「対象外」節で本要件の対象外。compliance-checker が画像文言を読める前提のみ置く。
4. **メタ開発の反映遅延:** skills/・agents/ の編集は setup.bat 再実行＋セッション再起動まで AI Agent 挙動に反映されない（dev-environment.md §0/§11）。実機での手動検証（T-/R- 項目）は人間（メタ開発者）に委ねる前提。
5. **REQ-C-010 と既存 final-check 検証フローの非矛盾（確認済み・懸念ではない）:** REQ-C-010 のクリーンアップ範囲拡張・想定外残ファイル確認削除は、final-check 系 7 スキルの既存検証フロー（Step 1 = progress-final-checker 委譲による署名検証・進捗更新）と矛盾しない（AC-010-5）。改修は Step 2「一時ファイルの削除」（検証 PASS 後の後段処理）内に閉じ、署名検証・進捗更新ロジックには手を加えないことを差分設計 C-5（7 章）で担保済み（K-9）。念のため確認事項として記載。

## 起因元ドキュメントフォルダ

**`.aide/specs/aide-powers/changes/202605271000-consolidate-change-bugfix-phases/`**（Phase 1 版から変更なし・実在確認済み）

| 検証対象（変更箇所） | 起因コミット | Docs: フッター | 根拠 |
|---|---|---|---|
| step-history-writer メタ情報セクション（REQ-C-003/008 が触る箇所） | `3957099` feat: 変更WF(10→3)とバグ修正WF(7→3)のフェーズ統合 | あり: `202605271000-consolidate-change-bugfix-phases/` | git blame でメタ情報行（スキル名/Step ID/Step タイトル/完了日時）が同コミット起因 |
| step-history-writer「会話履歴そのまま転記」「毎Step activate必須」（REQ-C-002 周辺） | `5606b1e` fix: step-history-writer未activate問題の恒久対策(PI-026) | あり: 同フォルダ | PI-026 系 |
| compliance-checker「履歴ファイルを skill_name から glob 導出」（REQ-C-004 が絞り込みを追加） | `c5c0a02` refactor: compliance-checkを本来の役割に絞り軽量化 | フッターなし | PI-022 是正。compliance/履歴系改修系譜であり同フォルダ作業群に連なる |

**判定根拠:** 本変更が触る step-history-writer のメタ情報・履歴転記方式、compliance-checker の履歴導出は、いずれも **PI-026/PI-022 を起点とする「証跡まわりの偽装・陳腐化対応の系譜」**。中核 2 ファイルの起因コミットが揃って Docs: フッターに同フォルダを明記しており、起因元ドキュメントフォルダとして特定できる。

> **フォルダ統合判定への申し送り:** 起因元フォルダ `202605271000-consolidate-change-bugfix-phases` が特定済み。後続の folder-merge-check で本 changes_dir を起因元へ統合するか検討対象となる（本工程は判定を行わない）。

## Phase 1 版からの主な更新点

| # | Phase 1 版 | 更新版（本書） |
|---|---|---|
| 1 | 経路A/B/C を併記し「経路A は fs-* 全体へ波及・スコープ外と抵触」と未確定 | **経路A 採用確定・REQ-C-007 で fs-* 引数追加はスコープ内**と整理。grep 34 スキル・281 出現を自検証 |
| 2 | REQ-C-004 の changes_dir を fs-* 側で揃えるか「要検討」 | **compliance-checker 側で照合キー導出完結（fs-* 非波及）と確定**（AC-004-4〜7）。progress_file_path 形式を grep で実態検証し全 7 WF で導出成立を確認 |
| 3 | REQ-C-008（完了日時削除）・REQ-C-009（履歴欠落検出）の影響記載なし（要求が後追加） | **REQ-C-008/009 の影響を追加**。完了日時メタの読み手を grep で全件追跡（compliance-checker W4-D のみ）。REQ-C-009 と既存「一部欠落許容」の矛盾確認を実施 |
| 4 | 完了日時の履歴メタ/進捗ファイル区別なし | **両系統を grep で分離・混同なしを確認**（W6/W7 は対象外） |
| 5 | テスト対象機能の明示なし | **手動検証項目 T-1〜18 / リグレッション R-1〜8 を新設**（自動テスト不在のため手動検証として） |
| 6 | アクターは AI Agent/compliance-checker/利用者/開発者の概略 | **撮り直し一次保証・番人独立検証・履歴欠落やり直し促しの運用変化を反映して更新** |
| 7 | （REQ-C-010 は未追加） | **REQ-C-010（final-check 系 7 スキルのクリーンアップ範囲拡張）をスコープ拡張で追加反映**。当初「申し送り U-2・本変更では行わない」とした判断が、ユーザー決定により本変更スコープ内（C-5）へ覆った経緯を明記。変更種別テーブル・変更対象ファイル（6 行目）・依存関係テーブル・クリーンアップ節・手動検証 T-19〜23・矛盾確認 K-9 を更新 |

## 自己チェック（C1〜C7）

- **C1（シグネチャ/呼び出し規約変更の全件 grep 追跡）:** 完了。(a) artifact_dir 呼び出し元＝34 スキル・281 出現を自検証 grep で確定（差分設計と一致、final-check 系 7 スキルは 0 件）。(b) 完了日時メタの読み手＝compliance-checker W4-D のみ（grep で全件追跡・残存なし確認）。(c) screenshot-capture 被参照＝step-history-writer のみ（新規）。(d) 照合キー導出の progress_file_path 形式前提を全 7 WF で grep 検証し成立を確認。**(e) REQ-C-010 はシグネチャ変更を伴わない**（final-check 系 7 スキル SKILL.md 内のクリーンアップ手順記述のテキスト変更のみ）。final-check 系 7 スキルの起動関係・被参照関係・progress-final-checker 委譲関係は不変であることを確認。
- **C2（既存原則/既存記述との矛盾確認・代替実施明記）:** 完了。user/system-requirements.md 不在のため SKILL.md・agents/*.md・dev-environment.md・phase-skill-rules.md/global-rules.md を代替根拠として実施（冒頭・K-1〜K-8 に明記）。REQ-C-009×「一部欠落許容」、REQ-C-008×W6/W7 の重点確認も実施し**矛盾なし**。
- **C3（dev-environment.md 方針への影響確認）:** 完了。§1/§6/§12 改訂、§13 整合、§7/§14.1 影響なしを確認。§2 末尾の整合補強の余地を懸念事項に記載。
- **C4（テスト対象＝手動検証項目 1 件以上）:** 完了。T-1〜23・R-1〜8 を記載（T-19〜23 は REQ-C-010 / AC-010-1〜5 に対応）。
- **C5（説明対象アクター特定）:** 完了。AI Agent オーケストレータ / compliance-checker / フレームワーク利用者 / メタ開発者の 4 アクターと運用変化を特定（オーケストレータの想定外残ファイル確認削除運用・利用者の削除可否確認応答を REQ-C-010 で追加）。
- **C6（impact-analysis.md を Write で更新）:** 完了（本ファイルを更新版で再作成・Write/Append で出力。REQ-C-010 反映版）。
- **C7（delta-design 索引+全分割ファイルを Read）:** 完了。delta-design.md（索引）/ overview / screenshot-capture / step-history-writer / compliance-checker / fs-star-callsites / dev-environment / **final-check-cleanup（C-5）** の全 8 ファイルを Read 済み。
