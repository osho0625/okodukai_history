# 影響範囲分析書（Phase 2 差分設計後・再分析版） — 動作確認試験書レビューループの導入

- **feature_name:** aide-powers
- **変更ID:** 202607010000-manual-test-review-loop
- **分析日:** 2026-07-01（Phase1版）→ **再分析: 差分設計QA APPROVED後**
- **入力:** change-requirements.md（REQ-C-001〜005）、impact-analysis.md（Phase1版）、delta-design.md（索引＋分割4ファイル: delta-design-review-agent.md / delta-design-skill-steps.md / delta-design-verification-prompts.md / delta-design-program-structure.md）、approach.md
- **本変更の性質:** メタ開発（実装コード＝skills/ 配下のスキル定義・agents/ 配下のエージェント定義）
- **本書の位置づけ:** 差分設計（QA APPROVED済）の確定内容を踏まえ、Phase1の影響分析を再調査し、テスト対象機能・説明対象アクターを特定する。delta-design.md / approach.md の記述内容そのものは変更しない。

---

## 0. サマリ（Phase1からの主要な更新点）

| # | 更新内容 | 詳細 |
|---|---|---|
| 1 | 差分設計で全13ファイルの before→after が確定 | 新規4系統（N1〜N4: manual-test-review-agent）＋改修9ファイル（C1〜C9）。Phase1の予測（§3.2の13ファイル）と一致 |
| 2 | 3工程分離の実現方式が方式(a)「1プロンプト2セクション化」で確定 | verificationプロンプト4本はファイル分割せず、`{{execution_mode}}`（create/execute）で2セクションを呼び分ける方式に確定。ファイル数増加なし |
| 3 | レビューアーの判定文字列が APPROVED / NEEDS_FIX に確定 | Q-04/Q-05（既存QA・コードレビュー判定基準）と整合する形で確定 |
| 4 | レビューループの停滞時ルールが確定 | design-impl-gap-process.md プロセスC準拠、**10回**でユーザー相談、ユーザー「続行する」選択時はカウントリセット |
| 5 | **program-structure.md の「12→13」記述漏れがゼロであることを確認** | Phase1注意事項3「漏れ注意」を指摘した箇所（12箇所）を、delta-design-program-structure.md の変更箇所1〜18 と全件突合し、**全箇所が対応済み**であることを確認（詳細§3.3） |
| 6 | **新たな影響箇所を2件発見**（Phase1未検出） | ① `user-requirements.md` UR-004 の「12種のサブエージェント」記述、② `system-requirements.md` §1.2 の「12種 × 複数形式」記述。いずれも本変更実装後に実態（13種）と不整合になるが、delta-design.md の「更新が必要な設計資料」に含まれていない（詳細§4） |
| 7 | シグネチャ変更全件追跡（Iron Law）実施結果 | 既存コードのシグネチャ変更は**ゼロ**であることを確認（新規追加のみ）。詳細§3.4 |

---

## 1. 変更種別（Phase1より継承・変更なし）

**機能追加＋仕様変更の複合。**

| 種別 | 内容 | 対応要求 |
|---|---|---|
| 機能追加 | 動作確認試験書レビュー専用エージェント `manual-test-review-agent` の新設（4系統: N1〜N4） | REQ-C-001 |
| 仕様変更 | 4WFの動作確認Stepへの「生成→レビュー→指摘→修正→再レビュー（PASSまでループ）」組み込み | REQ-C-002 |
| 機能追加 | WF種別（`wf_type`）に応じたレビュー基準差異への対応 | REQ-C-003 |
| 仕様変更 | 4WFの動作確認Stepを「①試験書作成→②試験書レビュー（PASSまでループ）→③試験実行」の3工程に分離（方式(a): 1プロンプト2セクション化で実現） | REQ-C-004 |
| 機能追加（報告要件） | 動作確認結果のユーザー報告に、各試験項目の実施方法・エビデンス（実動作確認／コードレビュー代替の区別）を必須化 | REQ-C-005 |


---

## 2. アクター視点の影響（差分設計確定内容で再確認）

本変更のアクターは **aide-powers を使う開発者**（8プラットフォームで実装・バグ修正・変更・リファクタリングの各WFを実行するユーザー）。差分設計で工程・報告フォーマットが確定したため、Phase1の想定を確定内容で更新する。

| 影響を受けるアクター行動 | 変更前 | 変更後（差分設計で確定） |
|---|---|---|
| 4WFの動作確認Stepの実行 | 1つのサブエージェントが試験書作成→試験実行→結果報告を一気通貫で実施 | 【工程①】試験書作成サブエージェント起動（`execution_mode=create`）→【工程②】`manual-test-review-agent` 起動（`wf_type` 指定）→APPROVEDまでループ→【工程③】試験実行サブエージェント起動（`execution_mode=execute`） |
| 動作確認Stepの完了判定 | 試験結果OK＋ユーザー承認 | 試験書レビュー結果が「APPROVED」＋試験実行がAPPROVED済み試験書に基づいて実施済み＋動作確認結果「OK」＋ユーザー承認結果「承認」（エビデンス付き報告済み） |
| WF種別ごとの検証観点 | 各verificationプロンプトの注意書きに委ねられる | `manual-test-review-agent` が共通4観点＋`wf_type`別基準（impl=ユースケース/要件網羅、bugfix=再現手順未再現+受入基準、change=受入基準、refactoring=外部振る舞い保持）を適用 |
| レビュー指摘への対応 | （機構自体が存在しなかった） | NEEDS_FIX時、指摘内容（対象試験項目／観点／問題／修正方向性）が試験書作成セクションの `{{review_fix_instructions}}` に渡され、試験書を修正して再レビュー。**10回**繰り返してもAPPROVEDにならない場合は停止しユーザー相談（続行選択時はカウントリセット） |
| 動作確認結果のユーザー報告 | 「動作確認OK」等の結果のみ報告 | 各試験項目について「試験項目／実施方法（実動作確認 or コードレビュー代替）／用いた手段／結果」のテーブル形式で報告。エビデンスを欠いた「OK」のみの報告は完了条件として不成立 |

### 関連する既存要件（Phase1より継承）

| 要件ID | 要件 | 本変更との関係 |
|---|---|---|
| UR-001 | 7つのワークフロー（実装・変更・バグ修正・リファクタリングを含む） | 本変更は4WFの動作確認Stepを対象とする |
| UR-004 | 12種のサブエージェントによる専門分業 | **要件本文の記述更新が必要（新規発見。詳細§4.1）**。13種への数値更新が必要 |
| UR-005 | 多段コードレビュー（design-review-agent＋code-review-agent の「生成→レビュー」型） | 同じ設計思想を動作確認試験書に適用する（判定文字列もAPPROVED/NEEDS_FIXで揃えた） |
| UR-006 | 設計QAゲート（APPROVED/REJECTED で基準未達を先に進めない） | 「PASSするまで次に進まない」ゲート型思想を踏襲（判定文字列はNEEDS_FIXでQAのREJECTEDと差異あり。design-review-agent/code-review-agent系のAPPROVED/NEEDS_FIXパターンに合わせた設計判断であり矛盾ではない） |
| UR-007 | 進捗管理機構（フェーズ/Stepの完了判定・進行制御） | 動作確認Stepの完了判定に「レビューAPPROVED」が加わる |

（参考）Q-04（QA判定基準 FAIL=0 かつ WARNING=0 で APPROVED）／Q-05（コードレビュー ERROR=0 かつ WARNING=0 で APPROVED）と、新レビューアーのAPPROVED判定基準（指摘0件でAPPROVED）は整合している。

---

## 3. プログラム構成視点の影響（差分設計確定内容の再確認）

### 3.1 変更対象ファイル表（差分設計で確定・Phase1予測との一致確認）

Phase1（§3.2）で予測した13ファイルは、差分設計（delta-design-review-agent.md / delta-design-skill-steps.md / delta-design-verification-prompts.md / delta-design-program-structure.md）の確定内容と**全件一致**した。予測から確定への変化点のみ記す。

| # | ファイルパス | 変更種別 | Phase1予測 → 差分設計確定内容 |
|---|---|---|---|
| N1 | `agents/manual-test-review-agent.md` | 新規作成 | 予測どおり。フロントマター＋4観点・wf_type分岐・APPROVED/NEEDS_FIX判定を含むプロンプト本文で確定 |
| N2 | `agents/kiro/manual-test-review-agent.md` | 新規作成 | 予測どおり。N1と同一本文＋`tools: ["@builtin"]`追加で確定 |
| N3 | `agents/kiro/manual-test-review-agent.json` | 新規作成 | 予測どおり。`test-coverage-audit-agent.json`と同型で確定 |
| N4 | `agents/kiro/prompts/manual-test-review-agent-prompt.md` | 新規作成 | 予測どおり。N1のフロントマター以降本文と同一で確定 |
| C1 | `skills/fs-impl-phase4-execution/SKILL.md` | 改修 | Step2を3工程（①②③）に再構成。Integration欄に`manual-test-review-agent`呼び出しを追記。**確定：完了条件・状態判定の文言まで具体化** |
| C2 | `skills/fs-bugfix-phase2-impl/SKILL.md` | 改修 | 同上（Step10、wf_type=bugfix） |
| C3 | `skills/fs-change-phase2-impl/SKILL.md` | 改修 | 同上（Step12、wf_type=change） |
| C4 | `skills/fs-refactoring-phase5-impl/SKILL.md` | 改修 | 同上（Step3、wf_type=refactoring） |
| C5 | `skills/fs-impl-phase4-execution/impl-verification-prompt.md` | 改修 | **確定：方式(a)採用。**プロンプト冒頭に`{{execution_mode}}`分岐説明を追加、「セクション1: 試験書作成」「セクション2: 試験実行」の2セクション構成に再編。`{{review_fix_instructions}}`による指摘反映手順を追加 |
| C6 | `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md` | 改修 | 同上（bugfix向け差異：プレースホルダー`{{bugfix_dir}}`等） |
| C7 | `skills/fs-change-phase2-impl/change-verification-prompt.md` | 改修 | 同上（change向け差異：プレースホルダー`{{changes_dir}}`等） |
| C8 | `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | 改修 | 同上（refactoring向け差異：プレースホルダー`{{refactoring_dir}}`等） |
| C9 | `.aide/specs/aide-powers/program-structure.md` | 改修 | **確定：22箇所の変更箇所（変更箇所1〜22）**。Phase1予測（フォルダツリー・解説文・配布表・エージェント一覧の「12→13」更新）に加え、差分設計QAレビュー指摘対応として以下が追加確定：①アルファベット順配置の訂正（変更箇所2・3）、②エージェント別詳細解析への新規セクション追加（変更箇所13）、③役割分担マトリクスへの行追加（変更箇所14）、④4WF各SKILLセクションの「呼び出しエージェント」欄追加＋Step番号誤記訂正（変更箇所19〜22。特にchange WFはStep12/13の既存誤記も同時訂正） |

**追加確定（Phase1未記載・delta-design.md「更新が必要な設計資料」より）:**

| # | ファイルパス | 変更種別 | 内容 |
|---|---|---|---|
| D1 | `docs-dev/02-ai-agent/04-agents/qa-agents.md` | 改修（doc-sync対応・実装時） | ファイル末尾に `manual-test-review-agent` の解説セクションを新規追加（役割・入力・検証観点・判定・test-coverage-audit-agentとの責務境界表）。既存の「QAレビューアーエージェント詳細」という位置づけ自体は変更しない旨が明記されている |

### 3.2 依存関係表（Phase1より継承・変更なし）

| 起点ファイル | 依存先 | 依存の性質 | 本変更での影響 |
|---|---|---|---|
| `skills/fs-impl-phase4-execution/SKILL.md`（Step2） | `impl-verification-prompt.md` | 動作確認サブエージェントへのプロンプトテンプレート参照（`execution_mode`で2回呼び分け） | レビューループ追加でStep内フローが増える |
| `skills/fs-impl-phase4-execution/SKILL.md`（Step2） | 新 `manual-test-review-agent` | 試験書レビューの委譲先（新規） | 新エージェント呼び出しを追加 |
| `skills/fs-bugfix-phase2-impl/SKILL.md`（Step10） | `bugfix-verification-prompt.md` / 新レビューアー | 同上（WF種別=bugfix） | 同上 |
| `skills/fs-change-phase2-impl/SKILL.md`（Step12） | `change-verification-prompt.md` / 新レビューアー | 同上（WF種別=change） | 同上 |
| `skills/fs-refactoring-phase5-impl/SKILL.md`（Step3） | `refactoring-verification-prompt.md` / 新レビューアー | 同上（WF種別=refactoring） | 同上 |
| `agents/kiro/manual-test-review-agent.json` | `agents/kiro/prompts/manual-test-review-agent-prompt.md` | JSONの `"prompt": "file://./prompts/..."` によるプロンプト本文参照 | 4系統を整合させて作成する必要 |
| `setup.bat` / `setup.sh` | `agents/kiro/` ディレクトリ一式 / `agents/*.md` | ディレクトリ丸ごとコピー配布 | **改修不要**（新規ファイルは自動的に配布対象になる。差分設計でも同結論） |
| `program-structure.md` | `agents/` の実体（12→13エージェント） | 構成記述の正本 | 22箇所の変更箇所として確定済み |

### 3.3 program-structure.md「12→13」記述漏れの突合結果（Phase1注意事項3の解消確認）

Phase1（注意事項3）は「program-structure.md の『12種類』記述が複数箇所にあり、漏れなく更新する必要がある」と指摘していた。今回、リポジトリ内の実ファイル `program-structure.md` を実際に検索し、「12」を含む全箇所（12箇所）を、delta-design-program-structure.md の変更箇所1〜18と1件ずつ突合した。

| # | program-structure.md 内の実際の記述箇所 | 対応する差分設計の変更箇所 | 突合結果 |
|---|---|---|---|
| 1 | L247「12種類のエージェントが存在する」 | 変更箇所4 | ✅ 対応済み（13種類へ） |
| 2 | L489「agents/（ルート直下の12 Markdown）」 | 変更箇所6 | ✅ 対応済み |
| 3 | L501「agents/kiro/*.md（...12エージェント分）」 | 変更箇所7 | ✅ 対応済み |
| 4 | L511「agents/kiro/*.json（...12エージェント分）」 | 変更箇所8 | ✅ 対応済み |
| 5 | L656「agents/ 直下の12個のMarkdownファイル」 | 変更箇所9 | ✅ 対応済み |
| 6 | L845「12エージェント×3ファイル＝36ファイル」 | 変更箇所10 | ✅ 対応済み（13エージェント×3＝39ファイルへ） |
| 7 | L861「全12個のJSONファイル」 | 変更箇所11 | ✅ 対応済み |
| 8 | L878「全12個のMDファイル」 | 変更箇所12 | ✅ 対応済み |
| 9 | L1428「全12エージェントについて確認」 | 変更箇所15 | ✅ 対応済み |
| 10 | L1514「全12ファイルが name と description」 | 変更箇所16 | ✅ 対応済み（13ファイルへ、Examples件数10→11も同時訂正） |
| 11 | L2584「12エージェントが2箇所で記載」 | 変更箇所17 | ✅ 対応済み |
| 12 | L2587「78スキル＋12エージェント×複数プラットフォーム」 | 変更箇所18 | ✅ 対応済み |

**結論：program-structure.md内の「12」記述12箇所は差分設計側で全件（12/12）対応済みであり、漏れは存在しない。** Phase1注意事項3は解消されたとみなす。

なお、差分設計は上記12箇所の単純な数値更新に加え、Phase1では検出していなかった**アルファベット順配置の誤り2箇所**（変更箇所2・3）と、**既存のStep番号誤記2箇所**（change WFの `change-verification-prompt.md`=Step12 / `change-doc-syncer-prompt.md`=Step13 の逆転誤記。変更箇所21）も合わせて訂正する設計になっている。これらは差分設計QAレビューの指摘対応として追加されたものであり、本変更のスコープ内の妥当な訂正である。

### 3.4 シグネチャ変更の全件追跡（Iron Law・必須実施）

delta-design.md（メイン＋分割4ファイル: delta-design-review-agent.md, delta-design-skill-steps.md, delta-design-verification-prompts.md, delta-design-program-structure.md）の全 before→after を走査し、既存コード（既存エージェント定義・既存スキル定義）のシグネチャ変更（既存の入出力インターフェース・呼び出し引数・呼び出し方の変更）が存在するかを確認した。

**確認結果：既存コードのシグネチャ変更はゼロ（新規追加のみ）。**

| 対象 | 変更内容 | シグネチャ変更か | 判定根拠 |
|---|---|---|---|
| `manual-test-review-agent`（N1〜N4） | 新規追加 | 該当なし（新規） | 既存に同名のエージェントは存在しない（grep確認済み、既存コードに0件） |
| 4 SKILL.md の動作確認Step（C1〜C4） | Step内部構造を1工程→3工程に再構成 | **シグネチャ変更なし** | delta-design.md記載の「インターフェース影響サマリ」どおり、Step番号・Step名・前後Stepへの遷移（呼び出し元）は不変。Step内部の実装詳細のみ変更 |
| 4 verificationプロンプト（C5〜C8） | 1セクション構成→2セクション構成（`{{execution_mode}}`で分岐） | **シグネチャ変更なし（拡張）** | 既存プレースホルダー（`{{feature_name}}`等）はすべて維持。新規プレースホルダー（`{{execution_mode}}`, `{{test_plan_paths}}`, `{{review_fix_instructions}}`）を追加するのみで、既存プレースホルダーの削除・意味変更・型変更はない。呼び出し元（各SKILL.md）以外からの参照も存在しない（grep確認済み） |
| `program-structure.md`（C9） | 構成記述の更新 | 該当なし（ドキュメント記述） | コードのインターフェースではなく構成記述の正本更新 |

**呼び出し元の全件確認（grep実施）：** `impl-verification-prompt.md` / `bugfix-verification-prompt.md` / `change-verification-prompt.md` / `refactoring-verification-prompt.md` の4ファイル名でリポジトリ全体を検索した結果、参照元は各対応するSKILL.md（`fs-impl-phase4-execution`, `fs-bugfix-phase2-impl`, `fs-change-phase2-impl`, `fs-refactoring-phase5-impl`）とprogram-structure.mdの記述のみであり、他スキル・他エージェントからの参照は存在しない。したがって新規プレースホルダー追加による副作用（他呼び出し元への予期しない影響）はない。

**`manual-test-review-agent` という名前の衝突確認：** リポジトリ全体を検索した結果、既存コード（`.aide/specs/aide-powers/changes/` 配下を除く）にこの名称の既存ファイル・既存参照は存在しない。名前衝突なし。

---

## 4. 新たに判明した影響箇所（Phase1未検出・本再分析で発見）

差分設計の確定内容と、`user-requirements.md` / `system-requirements.md` の既存記述を突き合わせた結果、Phase1では検出されていなかった2件の影響箇所を新たに発見した。いずれも delta-design.md の「更新が必要な設計資料」表（program-structure.md と qa-agents.md の2件のみ記載）に含まれていない。

### 4.1 新規発見1: `user-requirements.md` UR-004 の「12種のサブエージェント」記述

`user-requirements.md` §2.1 Must要件に以下の記述がある:

> UR-004 | 12種のサブエージェントによる専門分業を実現すること | レビュー・実装・進捗管理を専門化し品質を確保する | QAレビューアー5種＋コードレビューアー2種＋実装1種＋最終監査2種＋進捗管理2種 | program-structure.md §agents/, system-requirements.md §4.1

本変更により実際のエージェント数は13種になるが、UR-004の要件本文・手段列（「QAレビューアー5種＋コードレビューアー2種＋実装1種＋最終監査2種＋進捗管理2種」＝合計12）はいずれも数値が古いままとなる。`manual-test-review-agent` は上記5分類のいずれにも属さない新分類（試験書品質レビュー）であるため、単純な数値差し替えでは済まず、分類列の追加（例：「+試験書品質レビュー1種」）が必要になる。

**影響度：中。** user-requirements.md はこのリポジトリの「逆引き要件書」（実装から逆生成されたドキュメント）であり、doc-index.md には ✅完了として登録されている。本変更を実装すれば実態と要件書の記述が不整合になる。

### 4.2 新規発見2: `system-requirements.md` §1.2 の「12種 × 複数形式」記述

`system-requirements.md` §1.2 全体構成テーブルに以下の記述がある:

> エージェント定義 | サブエージェントの役割・プロンプト定義 | 12種 × 複数形式

本変更後は「13種 × 複数形式」に更新が必要。§4.1（4.1 AIエージェントのエラー分類）には具体的な「12」という数値記載はないため、この1箇所のみが対象。

**影響度：低〜中。** system-requirements.md も doc-index.md に✅完了として登録された正本ドキュメントであり、記述と実態の不整合が生じる。

### 4.3 上記2件が delta-design.md に含まれていない理由の推測（修正権限外のため報告のみ）

delta-design.md の「更新が必要な設計資料」表は `program-structure.md` と `docs-dev/.../qa-agents.md` の2件のみを挙げており、`user-requirements.md` / `system-requirements.md` は挙げられていない。impact-analysis Phase1版の注意事項2「doc-index.md は影響を受けない可能性が高い」の考察はdoc-index.mdの登録要否についてのみ言及しており、既存の正本ドキュメント（user-requirements.md / system-requirements.md）本文中の数値記述への言及はなかった。今回の再分析で初めて特定された影響箇所である。

**本エージェントは delta-design.md の内容修正権限を持たないため、上記2件の追記の要否・実施タイミングはユーザー・後続の設計担当エージェントの判断に委ねる。** 本書ではテスト対象・影響範囲としての報告に留める。

---

## 5. 既存要件・システム要件との矛盾確認（ステップ3）

### 5.1 user-requirements.md の既存要件との矛盾確認

既存Must要件（UR-001〜UR-015）を全件確認した結果、**本変更が既存要件と直接矛盾する箇所はない**。

| 要件ID | 内容 | 矛盾確認結果 |
|---|---|---|
| UR-001（7つのワークフロー） | 実装・変更・バグ修正・リファクタリングを含む | 矛盾なし。本変更はこれら4WFの動作確認Stepの内部構造拡張であり、WF自体の追加・削除は行わない |
| UR-004（12種のサブエージェント） | 分業構造 | **数値記述が不整合になる（§4.1で報告済み・矛盾ではなく更新漏れ）**。要件の趣旨（専門分業によるレビュー・実装・進捗管理の品質確保）自体には矛盾しない。むしろ新エージェントの追加はUR-004の趣旨の延長 |
| UR-005（多段コードレビュー） | design-review-agent＋code-review-agentの「外を見る／中を見る」分業 | 矛盾なし。試験書レビューという別領域への同型分業の適用であり、既存2エージェントの役割変更はない |
| UR-006（設計QAゲート・4ゲート） | QAエージェント5種によるAPPROVED/REJECTED判定 | 矛盾なし。UR-006は「設計ワークフローの4ゲート」に限定した要件であり、動作確認Stepのレビューループ（新設）は対象外（別の既存要件UR-007・UR-005の系譜に位置づけられる） |
| UR-007（進捗管理機構） | フェーズ/Stepの完了判定・進行制御 | 矛盾なし。完了判定条件に新たな条件（レビューAPPROVED）が加わるだけで、進行制御の仕組み自体（progress-resume-check等）は変更しない |
| UR-009（design-gate） | 設計書なし実装の防止 | 矛盾なし。本変更はメタ開発（dev-environment.md §14により design-gate 適用除外・確定済み）であり、design-gate自体への影響はない |
| UR-035（Won't・従来型設計書によるメタ開発管理をしない） | メタ開発ではスキル・エージェント定義自体が設計書を兼ねる | 矛盾なし。本書・delta-design.md・approach.md はこの方針（コア4ファイル不要）に従って作成されている |

**判定文字列の一貫性についての確認（新規論点）:** 新レビューアーの判定文字列は APPROVED / NEEDS_FIX であり、Q-04（既存QA5種の判定基準：FAIL=0かつWARNING=0でAPPROVED/REJECTED）とは判定語の片方（NEEDS_FIX vs REJECTED）が異なる。ただしapproach.md §3.3で述べられているとおり、これは design-review-agent / code-review-agent 系（APPROVED/NEEDS_FIX相当）に揃えた意図的な設計判断であり、既存要件との矛盾ではない。

### 5.2 system-requirements.md の非機能要件への影響確認

| 要件ID | 内容 | 影響確認結果 |
|---|---|---|
| NF-1〜NF-4（マルチプラットフォーム対応） | 8プラットフォーム全てでハブスキル起動、ツール名差異吸収、配布メニュー、bat/sh同一結果保証 | **影響なし（対応済み）。** 新エージェントは既存12エージェントと同一の4系統配置規約（agents/*.md, agents/kiro/*.md, agents/kiro/*.json, agents/kiro/prompts/*-prompt.md）に従うため、既存のツールマップ・配布メニューの変更は不要（impact-analysis §3.2 依存関係表・setup.bat/sh改修不要の結論どおり） |
| §4.1（エラー分類） | BLOCKED/NEEDS_CONTEXT/NEEDS_FIX/REJECTED/FAIL/NEEDS_IMPL_RECHECK | **影響なし。** NEEDS_FIXは既存のエラー分類表に既に定義済み（「レビューで品質基準未達／発生元：レビューエージェント／対処：実装エージェントに修正依頼」）であり、新レビューアーの判定はこの既存分類にそのまま合致する。新しいエラー種別の追加は不要 |
| §4.4（QA判定基準） | FAIL=0かつWARNING=0でAPPROVED（既存QA5種共通） | **影響なし（整合確認済み）。** 新レビューアーの判定基準（指摘0件でAPPROVED）は既存QA基準と同じ思想（指摘ゼロで合格）であり、矛盾しない |
| §7.1 NF-1〜4 | マルチプラットフォーム対応 | 上記と同一。影響なし |
| §7.6 NF-16（50行超のファイル書き込み制約） | Write+Append分割必須 | **実装時に適用が必要（新たな制約適用箇所）。** N1〜N4の新規エージェント定義ファイル、C1〜C9の改修ファイルはいずれも50行を超える見込みが高く、実装フェーズでこのルールの遵守が必要（本書は影響範囲分析のため実装方法自体は担当外） |
| §3.2（.aide/specs/の構造） | ドキュメント種別ごとの配置規約 | 影響なし。本変更はこの配置規約に従った`.aide/specs/aide-powers/changes/`配下での作業であり、規約自体への変更はない |

**結論：system-requirements.mdの非機能要件と本変更の間に矛盾はない。** ただし§4.1のシステム構成テーブル記述（「12種×複数形式」）は§4.1で報告済みの数値更新が必要な箇所である。

---

## 6. テスト対象機能の特定（ステップ4）

### 6.1 新規テスト対象（直接変更する機能）

| # | テスト対象 | 対応する差分設計 | 確認すべき内容 |
|---|---|---|---|
| T-1 | `manual-test-review-agent` の動作（4系統すべてで） | N1〜N4 | 4観点（ユーザー操作シナリオ／ユーザー視点網羅性／目視可能な期待結果／内部視点混入検出）に基づく判定が機能すること。`wf_type`（impl/bugfix/change/refactoring）ごとに正しいWF別基準が適用され、出力の「適用基準」欄に明記されること |
| T-2 | `manual-test-review-agent` の判定ロジック（APPROVED/NEEDS_FIX） | N1（ステップ4: 判定） | 観点別指摘が0件のときAPPROVED、1件以上のときNEEDS_FIXになること。NEEDS_FIX時に「対象試験項目／観点／問題／修正方向性」が修正可能な粒度で出力されること |
| T-3 | 実装WF Step2 の3工程再構成 | C1 | 工程①（試験書作成・execution_mode=create）→工程②（レビューAPPROVED待ちループ）→工程③（試験実行・execution_mode=execute）の順序が守られ、②APPROVED前に③が実行されないこと |
| T-4 | バグ修正WF Step10 の3工程再構成 | C2 | 同上（wf_type=bugfix、bug-report.md/fix-plan.mdが正しく渡ること） |
| T-5 | 変更WF Step12 の3工程再構成 | C3 | 同上（wf_type=change、change-requirements.mdが正しく渡ること） |
| T-6 | リファクタリングWF Step3 の3工程再構成 | C4 | 同上（wf_type=refactoring、refactoring-plan.mdが正しく渡ること） |
| T-7 | レビューループの停滞時挙動（4WF共通） | C1〜C4 | NEEDS_FIXが**10回**繰り返されてもAPPROVEDにならない場合に停止しユーザー相談が発生すること。ユーザーが「続行する」を選択した場合にカウントがリセットされ再度10回まで継続すること |
| T-8 | 4 verificationプロンプトの2セクション分岐（`{{execution_mode}}`） | C5〜C8 | `execution_mode=create`指定時に「セクション1: 試験書作成」のみが実行され試験実行が行われないこと。`execution_mode=execute`指定時に「セクション2: 試験実行」のみが実行され、レビューAPPROVED済み試験書に基づくこと |
| T-9 | `{{review_fix_instructions}}` による指摘反映（4 verificationプロンプト共通） | C5〜C8 | NEEDS_FIX時の再実行で、指摘テーブルの各行（観点1〜4）に応じた修正パターンが試験書に反映され、全指摘が反映されるまで保存されないこと |
| T-10 | verificationプロンプトのエビデンス報告（結果の出力） | C5〜C8 | セクション2の結果報告に、試験項目ごとの「実施方法（実動作確認／コードレビュー代替）／用いた手段／結果」のテーブルが出力されること。「OK」のみの報告（エビデンスなし）が出力されないこと |
| T-11 | 各WF SKILL のユーザー報告部分のエビデンス明示（C1〜C4） | C1〜C4 | ユーザーへの動作確認結果報告に、各試験項目の実施方法・エビデンスが添えられ、エビデンスを欠いた「OK」のみの報告が完了条件として不成立になること |
| T-12 | program-structure.mdの整合性（C9） | C9 | 22の変更箇所すべてが反映され、「12」の残存記述がゼロであること。エージェント一覧・役割分担マトリクス・各WFセクションの「呼び出しエージェント」欄・アルファベット順配置・Step番号訂正（change WF）が正しく反映されていること |
| T-13 | docs-dev/qa-agents.mdへの新エージェント解説追加（D1） | delta-design.md「更新が必要な設計資料」 | ファイル末尾に`manual-test-review-agent`の解説セクションが追加され、既存5エージェントの解説部分（行動規範含む）が変更されていないこと |

### 6.2 リグレッションテスト対象（変更の影響を受ける可能性がある既存機能）

| # | テスト対象 | 影響の性質 | 確認すべき内容 |
|---|---|---|---|
| R-1 | 既存の動作確認Step完了フロー（4WF共通）のNG差し戻し | Step内部構造変更に伴う既存フロー維持確認 | 動作確認結果「NG」時の既存の差し戻しフロー（実装WF: Step1へ差し戻し／bugfix・change: 既存フロー／refactoring: Step1またはPhase4へ差し戻し）が、3工程再構成後も変更なく機能すること |
| R-2 | 既存の動作確認Stepのユーザー承認フロー（「追加確認要求」「NG」の分岐） | 完了条件・状態判定への追記に伴う既存分岐の維持確認 | 「追加確認要求」時の追加確認実施フロー、「NG」時の指摘対応フローが、レビューループ追加後も変更なく機能すること |
| R-3 | 既存verificationプロンプトの試験実行部分（`## 試験実行方法について`相当） | 「試験実行」セクションへの移動に伴う内容維持確認 | Playwright MCP等によるブラウザ操作試験、コードレビュー代替判断のロジック自体は、セクション移動後も文言・判断基準が変わらず維持されていること |
| R-4 | 既存の動作確認対象機能リスト作成手順 | セクション1への内包に伴う内容維持確認 | 機能リスト作成手順（ユースケース一覧・ユーザー要件・GUI設計からの機能洗い出し等）が、2セクション化後も変更なく実行されること |
| R-5 | `test-coverage-audit-agent` の既存動作（実装WF最終チェック） | 新エージェントとの責務分離が正しく機能しているかの確認 | `test-coverage-audit-agent`の量的網羅性監査（要件×試験項目の1対1照合）が、新設の`manual-test-review-agent`（質的レビュー）の追加によって重複実行・機能低下しないこと。両エージェントの担当外セクションの相互参照が機能上も分離されていること |
| R-6 | change WFのStep12/13呼び出し（doc-syncer） | program-structure.mdのStep番号誤記訂正（変更箇所21）に伴う確認 | `change-doc-syncer-prompt.md`が実際にStep13で呼ばれること（実ファイルSKILL.md側は既にStep13が正しい旨、grep確認済み。program-structure.md側の記述訂正が実態と一致しているかの確認） |
| R-7 | setup.bat / setup.sh によるエージェント配布 | 新規4ファイル追加に伴う既存配布ロジックの確認 | `agents/kiro/`丸ごとコピー、`agents/*.md`個別コピーの既存ロジックが、ファイル数増加後も変更なく新規4ファイルを含めて正しく配布すること（改修不要の結論の実動作確認） |

---

## 7. 説明対象アクターの特定（ステップ5）

### 7.1 操作フローが変わるアクター

| アクター | 変わる操作フロー | 説明すべき内容 |
|---|---|---|
| **4WF（実装・バグ修正・変更・リファクタリング）を実行する開発者** | 動作確認Stepの実行中、試験書作成後に「試験書レビュー結果（APPROVED/NEEDS_FIX）」がレポートに表示されるようになる。NEEDS_FIXの場合は自動的に試験書修正→再レビューが繰り返され、10回で停止しユーザー相談が発生する可能性がある | ①動作確認Stepの内部構造が3工程（作成→レビュー→実行）に変わったこと、②レビューがAPPROVEDになるまで試験実行に進まないこと、③停滞時（10回）にはユーザーへの相談が発生すること、④その際「続行する」を選べば再度10回まで継続できること |
| **同上（動作確認結果の報告を受け取る立場として）** | 動作確認完了時の報告フォーマットが変わる。従来は「動作確認OK」の一言で完了できたが、今後は試験項目ごとに「実施方法（実動作確認／コードレビュー代替）」「用いた手段」の明示が必須になる | エビデンスのない「OK」報告は成立しないこと。実動作確認とコードレビュー代替の違いを理解し、後者が多い場合は品質保証の観点で注意が必要なことを認識する必要がある |

### 7.2 新しい操作が追加されるアクター

上記と同一のアクター（4WFを実行する開発者）に、以下の新しい操作・確認ポイントが追加される。

| 新しい操作・確認ポイント | 発生タイミング |
|---|---|
| 試験書レビュー結果（APPROVED/NEEDS_FIX＋観点別評価表）の確認 | 各WFの動作確認Stepの工程②完了時 |
| NEEDS_FIX時の修正待ち・再レビュー結果の確認（自動ループのため開発者の追加操作は基本的に発生しないが、ループの進行状況をレポートで確認できる） | 工程②のループ中 |
| レビューループが10回で停滞した場合のユーザー相談への応答（続行する／中止する等の判断） | 工程②が10回NEEDS_FIXを繰り返した場合のみ（例外パス） |
| 試験実行結果報告（エビデンス付き）の確認・承認 | 工程③完了後のユーザー承認時 |

### 7.3 説明対象外のアクター（確認）

- **aide-powersの一般利用者（開発対象アプリケーションのエンドユーザー）:** 本変更はaide-powersのメタ開発（フレームワーク自体の開発プロセス）に関するものであり、開発対象アプリケーションのエンドユーザーの操作フローには影響しない。
- **test-coverage-audit-agentの呼び出し元（fs-impl-phase5-final-check）:** 当該フェーズスキル自体・その利用者の操作フローに変更はない（R-5で確認したとおり、責務分離により既存動作は維持される）。

---

## 8. 分析時点の注意事項（Phase1より継承・更新）

1. **既存の「動作確認試験エージェント」は名前付きエージェントではなくプロンプトファイル。** 差分設計で方式(a)（1プロンプト2セクション化）が確定したため、Phase1で挙げた「レビューアー用プロンプトファイル方式」の選択肢は不採用となった（レビューアーは名前付きエージェント方式で確定）。

2. **doc-index.md は影響を受けない（Phase1判断を維持）。** doc-index.md はエージェント定義を登録対象としないため、本変更による更新は不要。

3. **program-structure.md の「12種類」記述漏れは解消済み（§3.3で全件突合済み）。** Phase1の「漏れ注意」指摘は解消されたが、代わりに §4 で報告した user-requirements.md / system-requirements.md の数値記述が新たな残課題として残る。

4. **test-coverage-audit-agent との役割の違いは差分設計で明確化済み。** delta-design-review-agent.md 末尾の責務境界表、および新エージェント定義の「担当外」セクションに相互参照が明記されており、Phase1で指摘した重複・矛盾リスクは設計レベルで解消されている（実装後のR-5でリグレッション確認が必要）。

5. **verificationプロンプトの改修方式は方式(a)で確定（ファイル数増加なし）。** Phase1・approach.mdで検討された方式(b)（ファイル分割で4→8本）は不採用。§3.1の変更対象ファイル表は13ファイル（新規4＋改修9）のままで変わらない。

6. **各WFの動作確認Step番号・Step名（差分設計で確定・変更なし）:**
   - 実装WF: `fs-impl-phase4-execution` → **Step 2「動作検証・ユーザー確認」**
   - バグ修正WF: `fs-bugfix-phase2-impl` → **Step 10「動作検証・ユーザー確認」**
   - 変更WF: `fs-change-phase2-impl` → **Step 12「動作検証・ユーザー確認」**
   - リファクタリングWF: `fs-refactoring-phase5-impl` → **Step 3「動作確認試験」**

7. **設計ゲートはメタ開発のため適用対象外（dev-environment.md §14・変更なし）。**

8. **REQ-C-004の3工程分離とREQ-C-002のレビューループはセットで設計されており、差分設計でも一貫している。** C1〜C4（SKILL側の工程区切り・ゲート判定）とC5〜C8（プロンプト側の`execution_mode`分岐）が整合していることを確認済み。

9. **REQ-C-005のエビデンス報告は差分設計で2箇所の反映が確定済み。** ①C5〜C8の「結果の出力」テーブル形式の確定、②C1〜C4のユーザー報告部分への追記文言の確定。両者のフォーマット（試験項目／実施方法／用いた手段／結果）は一致している。

10. **新規発見：user-requirements.md / system-requirements.md の数値記述更新は本変更のスコープに含めるかの判断が必要（§4）。** 本エージェントはこの2件の追記要否・実施タイミングの決定権を持たない。ユーザー・後続の設計担当エージェントへの申し送り事項とする。

---

## 9. 起因元ドキュメントフォルダ（Phase1より継承・変更なし）

4つの verification-prompt.md の最終コミット（`39acea17`「feat: 3WFの動作確認ステップを4段階構造に統一（PI-047）」）のコミットメッセージ `Docs:` フッターより特定。

**起因元ドキュメントフォルダ:** `.aide/specs/aide-powers/changes/202606251930-change-wf-phase2-step12-verification/`（実在を確認済み・本変更の作業フォルダそのもの）

- **folder-merge-check 済み・統合済み。** 本変更の作業フォルダ（changes_dir）は起因元フォルダそのものであり、既に統合済みである（history.md「追加変更（2026-07-01）」の備考欄に記載のとおり、前WF成果物は `old/2026-06-30/` へ退避済み）。
- **関連性: 高（無関係ではない）。** 本変更は同一の verification プロンプト群・同一の4WF動作確認Stepを変更対象とするため、起因元と完全に同一の対象を扱う。統合先が確定しているため、後続フェーズで追加のフォルダ統合判断は不要。

---

*本書は差分設計（QA APPROVED済）の確定内容を踏まえた影響範囲の再調査に限定する。delta-design.md / approach.md の記述内容そのものの修正・実装タスクの分解は本書の担当外であり、後続フェーズ（実装タスク計画）で扱う。*
