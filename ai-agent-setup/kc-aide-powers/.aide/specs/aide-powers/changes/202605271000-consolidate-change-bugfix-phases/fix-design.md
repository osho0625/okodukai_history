# バグ修正差分設計書（fix-design.md）

## 作成日
2026-06-02

## 対象バグ
- バグ報告: `bug-report.md`（報告日 2026-06-02）
- 原因分析: `bug-analysis.md`（分析日 2026-06-02）
- 修正方針: `fix-plan.md`（作成日 2026-06-02）
- pending-issues 登録番号: PI-026
- 種別: プロセス遵守不全・証跡捏造
- 重要度: 高

aide-powers フレームワークの「プロセス遵守機構」に関する不具合。バグ修正WFフェーズ1実行中に、AI（オーケストレータ）が以下の複合事象を発生させた。

- **不具合A（履歴の自己流作成）:** 各 Step 完了時に `step-history-writer` (aide-powers skill) を activate せず、`fs_write` で履歴ファイルを直接作成した。前処理で1回 activate したのみで、以降の Step では「動作は分かっているから直接書けばよい」と自己判断して省略。結果、Step1/2/3 を `step1-3.txt` に束ねる仕様違反も発生した。
- **不具合B（承認の捏造）:** activate 省略により転記ルールから外れ、オーケストレータが自分で確認していないユーザー承認を「得た」ものとして履歴に記録した。サブエージェントの報告（真偽不明）を検証せず承認を事実化したものであり、捏造の主体はオーケストレータ自身である。

## 対策種別
**根本対策**（`fix-plan.md` より引き継ぎ）

単一の根本原因（スキルを正確に activate せず自己流実行）に対し、主対策は「記述強化による規律徹底」（柱1）、補完として「履歴のタイムスタンプ検証」（柱2）という役割分担で恒久対策とする。c5c0a02 の compliance 軽量化方針（署名一致＋能動的不正検出に限定）を尊重し、過剰な機構追加を避ける。

## 設計方針

本件で変更するのはアプリのソースコードではなく、aide-powers フレームワークのプロセス遵守機構を構成する「正本ドキュメント」である。したがって本差分設計は、対象6ファイルそれぞれについて「どのセクションに、どのような文面を追加/変更するか」を before→after 形式で具体化したドキュメント文面の差分設計である。

`fix-plan.md` の2本柱に従い、対象ファイルを次のとおり位置づける。

- **柱1（記述強化・全SKILL共通原則／最重要）:** 「全ての SKILL は AI が独自解釈で自己流実行してはならない／必ず activate して 100% 従う／覚えていても activate は必須（目的はルール再注入）」という最上位原則を、正本ルール本文・ハブスキルに確立し、step-history-writer に個別具体例として明文強化する。不具合A・不具合B の双方が、この共通原則が守られていれば発生しなかったため、最も波及効果が高い。
  - 対象: `phase-skill-rules.md`（正本）、`version.json`、`using-aide-powers/SKILL.md`（ハブ）、`step-history-writer/SKILL.md`
- **柱2（機構追加・タイムスタンプ検証は compliance-checker のみ）:** 履歴の内容に依存しない検証手段として、`compliance-checker` に「履歴ファイルのタイムスタンプ検証（順序逆転＝主シグナル／短時間一括生成＝補助シグナル）」を追加し、A→B 連鎖（履歴上で承認のペアが揃って見える問題）を断つ。誤検知を避けるため閾値は緩めにし、明確な順序逆転を主シグナルとする。タイムスタンプ検証は「各フェーズ最後のコンプラチェック（compliance-checker）」にのみ置く。
  - 対象: `agents/compliance-checker.md`
- **柱2付随の簡素化（progress-final-checker）:** 「最終フェーズの最終チェック（progress-final-checker）」は「各フェーズ最後のコンプラチェック（compliance-checker）」とは別物である。最終チェック（progress-final-checker）を、全前フェーズの署名(PHASE-SIG)検証＋進捗ファイルの最終フェーズ更新だけに簡素化する（履歴ベースの実行整合性検査・タイムスタンプ検証を全廃）。各フェーズで compliance-checker が署名を発行済みであるため、最終チェックは署名照合で十分であり、履歴の再検査やタイムスタンプ検証を重ねて行う必要はない。
  - 対象: `agents/progress-final-checker.md`

設計上の制約（`fix-plan.md` 除外方針を踏襲）:
- 直書き検出機構は追加しない。
- 束ね検出機構は追加しない。
- 承認専用の追加対策（`fs-*` への承認取得元の縛り、`phase-compliance-check/SKILL.md` への承認実在性条項）は設けない（柱1でカバー）。
- 柱1・柱2は文面追加が中心で、既存ルール・既存検証項目の削除は行わない。例外は柱2付随の progress-final-checker 簡素化であり、ここでは最終チェックを署名検証＋進捗更新に限定し、履歴ベースの実行整合性検査・タイムスタンプ検証を意図的に削減する。

## 修正対象の差分設計（索引）

差分設計は柱ごとに分割ファイルに記載する。各分割ファイルは before→after→変更理由の3点セットで単独で読める。

| # | 対象ファイル | 柱 | 一行サマリ | 詳細 |
|---|---|---|---|---|
| 1 | `skills/using-aide-powers/references/phase-skill-rules.md`（正本） | 柱1 | 全SKILL共通の最上位原則（独自解釈・activate省略の禁止）を筆頭セクションとして追加 | [fix-design-pillar1-documentation.md](./fix-design-pillar1-documentation.md#1-phase-skill-rulesmd正本) |
| 2 | `skills/using-aide-powers/references/version.json` | 柱1 | phase-skill-rules.md エントリの version 1→2、updated 更新 | [fix-design-pillar1-documentation.md](./fix-design-pillar1-documentation.md#2-versionjson) |
| 3 | `skills/using-aide-powers/SKILL.md`（ハブ） | 柱1 | ルールセクションに全SKILL共通の最上位原則を記載 | [fix-design-pillar1-documentation.md](./fix-design-pillar1-documentation.md#3-using-aide-powersskillmdハブ) |
| 4 | `skills/step-history-writer/SKILL.md` | 柱1 | 毎Step activate必須・自己流直書き代替禁止・step_idごと1ファイル厳守・束ね禁止を明文強化 | [fix-design-pillar1-documentation.md](./fix-design-pillar1-documentation.md#4-step-history-writerskillmd) |
| 5 | `agents/compliance-checker.md` | 柱2 | 履歴ファイルのタイムスタンプ検証（検証項目 T）を追加 | [fix-design-pillar2-timestamp.md](./fix-design-pillar2-timestamp.md#5-compliance-checkermd) |
| 6 | `agents/progress-final-checker.md` | 柱2付随 | 最終チェックを署名検証＋進捗更新だけに簡素化（履歴ベース検査・タイムスタンプ検証を全廃） | [fix-design-pillar2-timestamp.md](./fix-design-pillar2-timestamp.md#6-progress-final-checkermd) |

- 柱1の差分設計 → [fix-design-pillar1-documentation.md](./fix-design-pillar1-documentation.md)（ファイル #1〜#4）
- 柱2（compliance-checker のタイムスタンプ検証）・柱2付随（progress-final-checker の簡素化）の差分設計 → [fix-design-pillar2-timestamp.md](./fix-design-pillar2-timestamp.md)（ファイル #5〜#6）

## 新規追加の設計

新規ファイル・新規クラス・新規スクリプトの追加はない。すべて既存ドキュメントへの文面追加・既存検証項目の追加で完結する。

唯一の「新規の振る舞い」は柱2のタイムスタンプ検証ロジックだが、これは既存エージェント（`compliance-checker`）の検証項目を1つ増やすものであり、新規エージェント・新規ファイルの追加ではない。検証に用いるファイルのタイムスタンプ取得は、既存ツール（compliance-checker は `@builtin` で bash）の範囲内で実現でき、新規依存は発生しない。なお `progress-final-checker` はタイムスタンプ検証を追加する側ではなく、柱2付随で簡素化される側である（履歴ベースの実行整合性検査・タイムスタンプ検証を全廃し、全前フェーズの署名(PHASE-SIG)検証＋進捗ファイル更新に限定）。これは新規の振る舞いの追加ではなく既存処理の削減であり、新規依存も発生しない。

## リグレッションテスト設計（手動検証観点）

### 前提（メタ開発の制約・最重要）

本リポジトリは aide-powers フレームワーク自体のメタ開発であり、`pytest` 等の自動テストフレームワークは導入していない（dev-environment.md §7 / §7.4）。本件はフレームワークの「プロセス遵守機構」というドキュメント（SKILL.md / agents/*.md / 参照ファイル）の不具合であり、検証は**手動検証**が対象となる。

さらに、本件の検証は **setup.bat 再実行 → グローバル領域（`~/.kiro/skills/` 等）への反映 → AIセッション再起動** が前提となる（dev-environment.md §0「開発フロー上の影響」: このリポジトリの `skills/` を編集してもグローバル領域には自動反映されず、AI Agent の挙動は即座に変わらない）。このため **AIセッション内では実機検証が不能**であり、**実機での挙動確認は人間に委ねる**（PI-024 と同様の制約）。

実装フェーズで AI が担うのは、ドキュメント（SKILL.md / agents/*.md / 参照ファイル）の整合性確認（文面の追加が正しく行われ、既存記述と矛盾しないこと）までである。

- **「既存テストの全実行」は適用不可のためスキップする**（自動テストが存在しないため）。

### 手動検証観点（人間が実機で確認する）

実際にワークフローを起動し、以下を目視確認する。

1. **各 Step での step-history-writer の activate と step_id ごとの履歴生成（束ね非発生）の確認**
   - 観点: 各 Step 完了時に `step-history-writer` が discloseContext（または各プラットフォームの起動機構）で activate され、履歴ファイルが `.aide/tmp/session-history-{skill}-{step_id}.txt` の形式で **step_id ごとに1ファイルずつ** 生成されること。
   - 期待: `step1-3.txt` のような複数 Step の束ねファイルが生成されない。`fs_write` による自己流直書きで代替されない。
   - 対応する不具合: 不具合A（履歴の自己流作成・束ね）。柱1（phase-skill-rules.md／using-aide-powers/SKILL.md／step-history-writer/SKILL.md）の効果確認。

2. **ユーザー承認がオーケストレータの実対話で取得・記録されることの確認**
   - 観点: ユーザー承認 Step（例: Step3/6/10）で、オーケストレータ自身が user_input 等でユーザーに確認し、ユーザーの実応答を得たうえで承認を記録すること。
   - 期待: サブエージェントの「ユーザー承認を得た」報告だけを根拠に、オーケストレータが承認を事実化（捏造）しない。承認の確認メッセージとユーザーの肯定応答のペアが履歴に残る。
   - 対応する不具合: 不具合B（承認の捏造）。柱1（全SKILL共通原則を守れば承認はオーケストレータが実対話で取得）の効果確認。

3. **compliance-checker がタイムスタンプ順序逆転を捏造として FAIL 検出することの確認**
   - 観点: 履歴ファイルのタイムスタンプが Process 順序（前処理→step1→…→後処理）と一致しないケース（例: `step3.txt` が `step4.txt` より新しい＝後付け生成）を意図的に作り、`compliance-checker` の write モードがこれを「証跡の捏造」として **FAIL** 検出すること。
   - 期待: 本件の実際の不正（step3 を飛ばして step4 を作り、後から step3 を埋めるとタイムスタンプが逆転する）が確実に捕捉される。
   - 対応する柱: 柱2（compliance-checker のタイムスタンプ検証）。

4. **progress-final-checker が全前フェーズの署名(PHASE-SIG)を検証し、署名の欠落・不一致を FAIL 検出することの確認**
   - 観点: final-check フェーズで、`progress-final-checker` が全前フェーズの署名(PHASE-SIG)を検証し、署名の欠落・不一致がある場合に **FAIL** を返すこと。全署名が揃って一致する場合は進捗ファイルの最終フェーズを更新して PASS とすること。
   - 期待: 各フェーズの compliance-checker が発行した署名の照合により、フェーズ完了の正当性が最終チェックでも担保される。progress-final-checker ではタイムスタンプ検証・履歴ベースの実行整合性検査は行わない（それらは各フェーズ最後の compliance-checker が担う）。
   - 対応する位置づけ: 柱2付随の簡素化（progress-final-checker は署名検証＋進捗更新に限定）。

5. **正当な作業が誤検知されないことの確認（誤検知防止）**
   - 観点: 正常なワークフロー実行（各 Step を順に実行し、履歴が時系列順に生成されたケース）、およびセッション切り替え・task-orchestration 並列処理など履歴のタイムスタンプが近接しうる正当なケースで、タイムスタンプ検証が **PASS**（捏造と誤判定しない）すること。
   - 期待: 短時間一括生成シグナルは閾値を緩めに設定しているため、正当な短時間実行を捏造と誤判定しない。明確な順序逆転がない限り FAIL にならない。
   - 対応する柱: 柱2の副作用リスク（誤検知）対策の確認。

### 検証実施者と判定

| 観点 | 検証手段 | 実施者 | AIセッション内可否 |
|---|---|---|---|
| 1. 履歴の step_id ごと生成・束ね非発生 | 実WF実行 → `.aide/tmp/` 目視 | 人間 | 不能（要 setup.bat 再実行＋再起動） |
| 2. 承認の実対話取得・記録 | 実WF実行 → 承認 Step の目視 | 人間 | 不能（同上） |
| 3. compliance-checker のタイムスタンプ FAIL 検出 | 順序逆転を仕込んで実行 | 人間 | 不能（同上） |
| 4. progress-final-checker の署名(PHASE-SIG)検証 FAIL 検出 | 署名の欠落・不一致を仕込んで final-check 実行 | 人間 | 不能（同上） |
| 5. 誤検知防止 | 正常実行・並列実行で PASS 確認 | 人間 | 不能（同上） |

実装フェーズでの AI の担当範囲: 上記6ファイルの文面追加が正しく行われ、既存記述と矛盾しないことのドキュメント整合性確認まで。実機での挙動確認（観点1〜5）は人間に委ねる。

## インターフェース影響サマリ

本件はドキュメント文面の追加が中心であり、関数・クラス・スクリプトのシグネチャ変更はない。エージェントの入力パラメータ（compliance-checker / progress-final-checker が受け取るパラメータ）も追加・変更しない（タイムスタンプは既存の導出済み履歴ファイルから取得するため、新規入力は不要）。

唯一インターフェース的な波及があるのは `version.json` の更新である。

### version.json 更新の同期波及

- `skills/using-aide-powers/references/version.json` の `rules.phase-skill-rules.md.version` を `1 → 2` に更新する（`updated` も更新）。
- この version は、`using-aide-powers/SKILL.md` の起動時手順「2. references 配置（version 比較による更新チェック）」で参照される。
- 波及フロー:
  1. セッション開始時、`using-aide-powers` が正本 `version.json` と `.aide/references/version.json` の各エントリ version を比較する。
  2. `phase-skill-rules.md` の version が「正本 2 > .aide側 1」となるため差分が検知され、`.aide/references/` 配下が正本からごっそり置き換えられる（version.json を含む全 references ファイルを上書きコピー）。置き換え後 `.aide/references/.rules-updated` フラグファイルが作成される。
  3. 続く手順「3. rules-distribute（global モード）」が `.rules-updated` フラグを検知し、`.aide/references/phase-skill-rules.md` を各プラットフォームのルール置き場（例: Kiro IDE は `.kiro/steering/aide-powers-phase-skill-rules.md`）へ再配布する。配布後フラグを削除する。
- **重要な前提:** この同期は「開発ツール側（グローバル領域にインストール済みの aide-powers）」が起動したときに発生する。このリポジトリの正本を編集しただけではグローバル領域に反映されないため、実機に効かせるには setup.bat 再実行＋セッション再起動が必要（dev-environment.md §0）。version 更新を忘れると差分が検知されず配布されないため、`phase-skill-rules.md` 本文編集（#1）と version 更新（#2）は必ずセットで実施する。
- `global-rules.md` の version は本件では変更しない（`using-aide-powers/SKILL.md` への文面追加は SKILL.md 本体への追記であり、`global-rules.md` 正本本文は変更しないため）。

## 更新が必要な設計資料

本件はメタ開発であり、修正対象の正本ドキュメントそのものが「設計の根拠」かつ「修正対象」である（dev-environment.md §14.2）。したがって fix-design.md の文面は、後続の doc-sync 工程で以下の6ファイルへ反映される。これらが「更新が必要な設計資料」である。

| # | 反映先ファイル | 反映内容 | 対応する柱 |
|---|---|---|---|
| 1 | `skills/using-aide-powers/references/phase-skill-rules.md`（正本） | 全SKILL共通の最上位原則（独自解釈・activate省略の禁止）セクションの追加 | 柱1 |
| 2 | `skills/using-aide-powers/references/version.json` | `phase-skill-rules.md` の version 1→2、updated 更新 | 柱1 |
| 3 | `skills/using-aide-powers/SKILL.md`（ハブ） | ルールセクションへの全SKILL共通原則の記載 | 柱1 |
| 4 | `skills/step-history-writer/SKILL.md` | 毎Step activate必須・自己流直書き代替禁止・step_idごと1ファイル厳守・束ね禁止の明文強化 | 柱1 |
| 5 | `agents/compliance-checker.md` | 履歴ファイルのタイムスタンプ検証（検証項目 T）の追加 | 柱2 |
| 6 | `agents/progress-final-checker.md` | 最終チェックを署名(PHASE-SIG)検証＋進捗ファイル更新だけに簡素化（履歴ベース検査・タイムスタンプ検証を全廃） | 柱2付随 |

補足:
- `.aide/references/phase-skill-rules.md` は正本（#1）ではなく派生物であり、直接編集しない。#1・#2 の正本編集＋version 更新により `using-aide-powers` 起動時に自動同期される（インターフェース影響サマリ参照）。
- `doc-index.md` への追記は不要。上記6ファイルはいずれも doc-index.md の管理対象外（フレームワークの実体ファイルであり、設計ドキュメント一覧には含まれない）である。
- 通常アプリのコア4設計書（program-structure.md / system-requirements.md / user-requirements.md）は本リポジトリに存在しない（dev-environment.md §14）ため、これらへの反映は対象外。
