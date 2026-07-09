# バグ原因分析

## 分析日
2026-07-01

## 現状把握

### 設計書の状態

本リポジトリは aide-powers フレームワーク自体のメタ開発リポジトリであり、dev-environment.md §14 の確定判断により、通常アプリ向けの「program-structure.md / system-requirements.md / user-requirements.md」ベースの design-gate はメタ開発では適用対象外とされている（設計逆引きで生成された同名ファイルは参考情報として存在するが、設計書の実体はスキル定義・エージェント定義そのもの）。

本バグに関係する設計書（実体）は以下であり、いずれも Read で内容を確認した:

| ファイル | 役割 | 状態 |
|---|---|---|
| `skills/using-aide-powers/references/progress-file-format.md` | 進捗ファイル共通フォーマット定義 | 存在する。§6.1に「進捗ファイルが存在しない → 新規作成を案内」という**方針**の記載はあるが、誰が・どの処理で新規作成するかの実装レベル手順は記載されていない |
| `skills/progress-resume-check/SKILL.md` | 進捗ファイル参照・再開判定 | 存在する。Iron Law として「本共通スキルは進捗ファイルを編集してはならない。Read のみ」と明記。**新規作成はこのスキルの責務ではないことが明示されている** |
| `skills/phase-report-check/SKILL.md` | 進捗確認（verify）・進捗更新（write） | 存在する。write モードの実処理を `progress-updater` サブエージェントに委譲する構成 |
| `agents/progress-updater.md`（および `agents/kiro/prompts/progress-updater-prompt.md`, `.kiro/agents/progress-updater.md`） | 進捗ファイルの実更新処理 | 存在する。**verify / write / fix_open / fix_close の全モードの実行フローに「ファイル不在時の新規作成」処理が定義されていない**（下記「原因箇所」参照） |
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | バグ修正WF Phase1オーケストレータ | 存在する。前処理で `progress-resume-check` を呼び、`START_FRESH` の場合は「Step1 へ遷移する」としか書かれておらず、**進捗ファイルを新規作成する処理ステップが存在しない** |

**設計書と実装（スキル定義）の乖離:** `progress-file-format.md` §6.1 は「新規作成を案内する」という上位方針を示しているが、それを実行する具体的な処理主体（新規作成のロジック・書き込み手順）が、呼び出し元のフェーズスキル（`fs-bugfix-phase1-analysis` 等）にも、委譲先の `progress-updater` エージェントにも実装されていない。方針と実装の間に「誰が新規作成するか」の欠落があるのが本バグの構造である。

### 既存テストの状態

dev-environment.md §7.4「自動テスト方針」に明記されている通り、本リポジトリには自動テストフレームワーク（pytest 等）は導入されておらず、動作確認は手動検証（インストーラ実行確認・ハブスキル発動確認）のみで行う方針である。したがって「総テスト数・パス数・失敗数」に類する自動テスト実行結果は存在しない。

- 総テスト数: N/A（自動テストフレームワーク未導入。dev-environment.md §7.4 の確定方針）
- パス: N/A
- 失敗: N/A
- 失敗テスト一覧: N/A（該当なし。本バグはドキュメント記述の欠落であり、コード実行結果としての失敗事例はない）

このバグは「プログラムの実行動作の不具合」ではなく「スキル定義ファイル（Markdown手順書）における処理ステップの記述漏れ」であるため、自動テストの有無は原因調査の妨げにならない。

## 原因分析

### 原因箇所

- ファイル: `agents/progress-updater.md`（Kiro IDE 版 `agents/kiro/progress-updater.md`、Kiro CLI 版 `agents/kiro/prompts/progress-updater-prompt.md` も同一内容。ワークスペース配布先 `.kiro/agents/progress-updater.md` も同様）
- 関連ファイル: `skills/phase-report-check/SKILL.md`（verify / write モードの呼び出し元。progress-updater への委譲部分）、`skills/fs-bugfix-phase1-analysis/SKILL.md`（バグ修正WF Phase1オーケストレータ。前処理での `progress-resume-check` 呼び出し部分）
- 該当箇所: `agents/progress-updater.md` の「verify モード」実行フロー（V1〜V4）と「write モード」実行フロー（W1〜W5）の全体
- 行番号（おおよそ）: verify モード実行フロー表（26〜35行目付近）、write モード実行フロー表（38〜48行目付近）

### 原因の説明

進捗ファイル（`bugfix-progress.md` / `change-progress.md` 等）を実際に読み書きしているのは `progress-updater` という専用の担当（サブエージェント）です。この担当への「作業指示書」（`agents/progress-updater.md`）を確認したところ、以下の作業しか指示されていませんでした。

- **verify（作業前チェック）**: 「進捗ファイルを読んで、前の工程が終わっているか確認する」だけ
- **write（作業後の記録）**: 「進捗ファイルを読んで、前の工程の完了確認 → 成果物があるか確認 → 表を更新する」だけ

どちらの指示にも「進捗ファイルがまだ存在しない場合は、まず新しく作成する」という手順が一言も書かれていません。つまり、進捗ファイルが存在することを前提とした「更新」の手順しか用意されておらず、「そもそも無い場合にどう作るか」という手順が抜けているということです。

一方で、進捗ファイルの有無を確認する係（`progress-resume-check`）は、「私はファイルを読むだけで、絶対に書き込んではいけない」という厳格なルールを持っています。そのため、ファイルが存在しない場合（`START_FRESH` という信号を返す）、その後どこかで誰かがファイルを新規作成しなければならないのですが、バグ修正ワークフローの手順書（`fs-bugfix-phase1-analysis/SKILL.md`）を見ると、`START_FRESH` を受け取った後は単に「Step1へ遷移する」と書かれているだけで、「ここで進捗ファイルを新規作成する」という指示がありません。

結果として、「ファイルを読むだけの係」も「ファイルを更新するだけの係（新規作成の手順を持たない）」も「オーケストレータ（新規作成を指示しない）」も、誰も進捗ファイルの新規作成を行わないまま処理が進み、フェーズが完了してもファイルが作られない、という状態になります。

補足情報にあった「フォルダ統合（folder-merge-check）が関与するケースで顕在化しやすい」という点についても、`folder-merge-check` はバグ修正WFの場合、統合時に `bugfix-progress.md` を「その時用の進捗ファイル」として `old/{日付}/` に退避する対象に含めています（同名ファイルが存在する場合）。統合後の新しい `bugfix_dir` では進捗ファイルが存在しない状態から再スタートすることになりますが、この場合も再作成の手順が定義されていないため、より高い頻度で不在状態が発生しやすいと考えられます。

### 技術的な詳細

- `agents/progress-updater.md` の write モード（W1〜W5）は、W2 で「進捗ファイルを Read で読み込み、前フェーズ完了状態を確認する」ことを前提としており、ファイルが存在しない場合の分岐処理（新規作成してからステータステーブルを構築する処理）が定義されていない。W3（成果物確認）・W4（ステータステーブル更新）・W5（フェーズ詳細セクション追記）も、既存の進捗ファイルの構造（ステータステーブル・フェーズ詳細セクション）が既に存在することを前提にした「更新」処理としてのみ記述されている。
- `skills/progress-resume-check/SKILL.md` は Iron Law として「NO PROGRESS FILE EDIT BY THIS SKILL.」を明記しており、ファイル不在時は `START_FRESH` を返すだけで新規作成は行わない（意図的な責務分離）。
- `skills/fs-bugfix-phase1-analysis/SKILL.md` の前処理では、`progress-resume-check` の出力が `START_FRESH` の場合は「Step1 へ遷移する」という分岐のみが定義されており、進捗ファイルの新規作成をどのタイミングで・誰が行うかについての指示がない。
- `skills/using-aide-powers/references/progress-file-format.md` §6.1 には「進捗ファイルが存在しない → 新規作成を案内」という上位方針、および §7.6（バグ修正WFの初期状態テンプレート：フェーズ一覧とスキル名マッピング）が定義されているが、これを実際に「新規作成する」処理として実行する主体（フェーズスキルまたはサブエージェント）が存在しない。
- 結果として、`progress_file_path` に存在しないパスを渡して `START_FRESH` を受け取った後、後続のどの処理（Step1〜後処理）でも進捗ファイルの新規作成が行われず、後処理で `phase-report-check (write)` → `progress-updater (write)` が呼ばれた際も、W2 で読み込むべき進捗ファイルが存在しないまま処理が進み、進捗ファイルが作成されない。

## 影響範囲

- `agents/progress-updater.md`（正本）・`agents/kiro/progress-updater.md`（Kiro IDE配布用）・`agents/kiro/prompts/progress-updater-prompt.md`（Kiro CLI配布用）・`.kiro/agents/progress-updater.md`（ワークスペース配布済み） — 4ファイルとも同一内容であり、修正時は全て同期させる必要がある
- 本バグは `progress-updater` を利用する全7ワークフローの先頭フェーズスキルに影響する可能性がある（`fs-planning-phase1-intake-and-init` / `fs-design-phase1-user-req` / `fs-impl-phase1-gate` / `fs-reverse-phase1-program` / `fs-change-phase1-analysis` / `fs-bugfix-phase1-analysis` / `fs-refactoring-phase1-status`）。いずれも前処理で `progress-resume-check` を呼び、`START_FRESH` の場合は「Step1へ遷移する」という同様の記述になっており、進捗ファイルの新規作成手順が明記されていない点は共通の構造的欠落と考えられる（本バグ報告はバグ修正WF・変更WFで顕在化した事象だが、原因箇所は7WF共通の `progress-updater` エージェントである）
- `skills/phase-report-check/SKILL.md` は `progress-updater` への委譲のみを行うため、修正時に併せて委譲パラメータ（新規作成に必要な初期テンプレート情報等）を渡す必要が生じる場合は、本スキルの入力仕様にも影響が及ぶ
- `skills/using-aide-powers/references/progress-file-format.md` §6.1・§7.1〜§7.7（各WFの初期状態テンプレート）は、新規作成処理の実装時に参照される仕様であり、修正の直接的な変更対象ではないが整合性確認の対象となる
- `folder-merge-check` によるフォルダ統合後（進捗ファイルが `old/{日付}/` に退避され、新フォルダには存在しない状態）も同じ経路を通るため、修正範囲に含めて確認する必要がある

### progress_file_path 明示指定の欠落状況

全7WFのフェーズスキル（合計41ファイル）のうち、後処理で `phase-report-check (aide-powers skill: write)` を呼び出す34ファイル（残り7ファイルは各WFの final-check フェーズであり、`progress-final-checker` に委譲するため `phase-report-check (write)` は呼ばない）を調査した結果、`progress_file_path` を明示的に指定しているのは **1ファイルのみ** であり、残り **33ファイル** では `progress_file_path` の記述が欠落している。

**明示指定あり（1ファイル）:**

| WF | ファイル | 記述内容 |
|---|---|---|
| 変更 | `fs-change-phase1-analysis/SKILL.md` | `progress_file_path={changes_dir}/change-progress.md`（Step6で確定したchanges_dirを使用） |

**明示指定なし（33ファイル）:**

| WF | 対象フェーズスキル（SKILL.md） |
|---|---|
| 企画（Planning） | `fs-planning-phase1-intake-and-init`, `fs-planning-phase2-explore`, `fs-planning-phase3-finalize` |
| 設計（Design） | `fs-design-phase1-user-req`, `fs-design-phase2-system-req`, `fs-design-phase3-dev-plan`, `fs-design-phase4-architecture`, `fs-design-phase5-gui`, `fs-design-phase6-usecase`, `fs-design-phase7-ddd`, `fs-design-phase8-object`, `fs-design-phase9-infra`, `fs-design-phase10-program` |
| 実装（Impl） | `fs-impl-phase1-gate`, `fs-impl-phase2-preparation`, `fs-impl-phase3-gui-mockup`, `fs-impl-phase4-execution`, `fs-impl-phase5-final-check`, `fs-impl-phase6-doc-generation` |
| 設計逆引き（Reverse） | `fs-reverse-phase1-program`, `fs-reverse-phase2-dev-env`, `fs-reverse-phase3-system-req`, `fs-reverse-phase4-user-req`, `fs-reverse-phase5-optional-phases` |
| 変更（Change） | `fs-change-phase2-impl` |
| バグ修正（Bugfix） | `fs-bugfix-phase1-analysis`, `fs-bugfix-phase2-impl` |
| リファクタリング（Refactoring） | `fs-refactoring-phase1-status`, `fs-refactoring-phase2-candidates`, `fs-refactoring-phase3-plan`, `fs-refactoring-phase4-design`, `fs-refactoring-phase5-impl`, `fs-refactoring-phase6-doc` |

**影響:** これら33ファイルでは後処理の `phase-report-check (write)` 呼び出し時に `progress_file_path` が渡されないため、呼び出し先の `progress-updater` が正しいパスの進捗ファイルを操作できない。`progress-updater` は渡されたパスを元に進捗ファイルを読み書きする設計であるが、パス未指定の場合にどのファイルを操作すべきか判断する手段がない。

## 起因元ドキュメントフォルダ

git blame と `git log --format=%B` によるコミットメッセージ調査、および該当コミットの変更差分（`git show`）の確認により、以下の経緯を検証した。

### 検証した3コミット

**1. 395d5bc（2026-05-18、`feat: 進捗管理機能の統一・移植漏れ修正（全7WF対応）`）**
- Docs フッター: `.aide/specs/aide-powers/changes/202605181002-progress-management-migration/`
- この時点では `fs-bugfix-phase1-report/SKILL.md`（当時の旧フェーズ構成）に対して、`START_FRESH → 進捗ファイルが存在しない。progress-file-format.md §6.1 および §7.6 の初期状態テンプレートに従い、進捗ファイルを新規作成する。その後ステップ1へ。」という**新規作成の指示が明示的に存在していた**（`git show` で確認した差分に明記）。また「ステップ5.5: 進捗ファイル更新（次フェーズ遷移直前）」というステップも新設され、Edit で進捗ファイルを更新する具体的な手順が定義されていた。

**2. a5938054（2026-06-10、`docs: FS report-style migration - full quality review cycle, key uniqueness, DDD-independent glossary, phase2 passthrough`）**
- Docs フッターなし（コミットメッセージにDocsフッター記載がない）
- 全41フェーズスキルをレポート出力形式に移行する大規模変更。`git show` で `skills/fs-bugfix-phase1-analysis/SKILL.md` の差分を確認したところ、旧記述の `- \`START_FRESH\` → 進捗ファイルを新規作成し Step 1 へ進む` という行が削除され、新記述の `・\`START_FRESH\`（新規開始）→ Step1 へ遷移する` に置き換わっていた。**この置き換えにより「新規作成」という言葉と処理指示が失われ、単なる「遷移する」という記述に変わった**。これが本バグの直接的な起因である。

**3. f3660d35（2026-06-15、`feat: 署名検証・レポート確認を削除し進捗確認・進捗更新に置換`）**
- Docs フッター: `.aide/specs/aide-powers/changes/202606151000-remove-signature-verification/`
- `git show` で差分を確認したが、この変更は「署名チェック結果」→「進捗確認結果」という項目名の置換、および署名検証関連の削除（レポート記載項目リストの削除等）が中心であり、「新規作成」指示の有無には触れていない。a5938054 の時点で既に「新規作成」の記述は失われていたため、本コミットは**今回のバグの欠落とは無関係**であることを確認した。

### 結論

- パス: `.aide/specs/aide-powers/changes/202605181002-progress-management-migration/`（395d5bc）は「新規作成」処理を導入した側であり、バグの起因元ではない。一方、a5938054 はコミットメッセージに Docs フッターが存在しないため、`folder-merge-check` / git blame の追跡対象となる「起因元ドキュメントフォルダ」を特定できない。
- コミットハッシュ: `a5938054094232c2ca57cc24dc2a873be4a2e33c`（新規作成指示が失われた直接原因のコミット。Docsフッターなし）
- コミットメッセージ1行目: `docs: FS report-style migration - full quality review cycle, key uniqueness, DDD-independent glossary, phase2 passthrough`

**起因元ドキュメントフォルダ: なし（バグの直接原因となったコミット a5938054 に Docs: フッターが存在しないため、追跡可能な起因元フォルダが特定できない。395d5bc の Docs パス（`.aide/specs/aide-powers/changes/202605181002-progress-management-migration/`）は「新規作成」処理を導入した側の変更であり、今回の欠落とは無関係）**

## テストカバレッジ

- 原因箇所のテスト: なし（`agents/progress-updater.md` は Markdown 手順書であり、dev-environment.md §7.4 の確定方針により自動テストは導入されていない。動作確認は手動検証のみ）
- 影響範囲のテスト: なし（同上の理由により、7ワークフロー共通の `progress-updater` 利用箇所全体について自動テストは存在しない）
