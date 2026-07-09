# バグ修正方針

## 作成日
2026-07-01

## 対象バグ
不具合修正ワークフロー（bugfix）や変更ワークフロー（change）などを開始したとき、Phase1（分析フェーズ）の処理の中で、進捗を記録するためのファイル（`bugfix-progress.md` / `change-progress.md` 等）が作られないことがある。特に、作業フォルダを統合する処理（folder-merge-check）が関わるケースで発生しやすい。

## 原因サマリー

進捗ファイルの読み書きを実際に担当しているのは `progress-updater` という部品です。この部品に与えられている作業指示書（`agents/progress-updater.md`）を確認したところ、次の2つの指示しかありませんでした。

- 「作業前チェック（verifyモード）」: 進捗ファイルを読んで、前の工程が終わっているか確認するだけ
- 「作業後の記録（writeモード）」: 進捗ファイルを読んで、成果物の有無・前工程の完了を確認し、記録の表を更新するだけ

どちらの指示にも「進捗ファイルがまだ存在しないときは、まず新しく作る」という手順が書かれていません。つまり「すでにあるファイルを更新する」手順しか用意されておらず、「そもそも無い場合にどう作るか」という手順が抜けています。

進捗ファイルの有無を確認するだけの別の部品（`progress-resume-check`）は、「自分は絶対にファイルを書き込まない」という厳格なルールを持っており、ファイルが無いことを検知して知らせるだけです。そして、各ワークフローの最初のフェーズの手順書（例: `fs-bugfix-phase1-analysis`）を見ても、「ファイルが無い」という知らせを受け取った後、単に次のステップに進むだけで、「ここで新しく作る」という指示がありません。

結果として、「無いことを知らせる係」も「更新するだけの係」も「進め方を決める係」も、誰も新規作成を行わないまま処理が進んでしまい、フェーズが完了しても進捗ファイルが作られない、という状態になります。

この構造的な欠落は `progress-updater` という1つの部品を経由する全てのワークフロー（企画・設計・実装・設計逆引き・変更・バグ修正・リファクタリングの7つ全て）に共通して存在することを、各ワークフローの最初のフェーズの手順書を確認して確かめました。いずれも「ファイルが無い」という知らせを受け取った後は「次のステップに進む」という記述のみで、新規作成の指示がない点で同じ抜け漏れになっていました。

### 類似不具合の調査結果

「同様のロジックの処理が他にあれば、そこも同様に漏れているか再確認」の観点で、企画・設計・実装・設計逆引き・変更・バグ修正・リファクタリングの**全7ワークフロー**について、各フェーズスキルの SKILL.md を Read/Grep で確認しました（final-check系フェーズは進捗ファイルの完了確認のみを行い `progress-final-checker` を経由する構成であり、いずれも `progress_file_path` を明示的に渡していることを確認済みのため調査対象外）。

調査の結果、`progress-updater` の新規作成ロジック欠落とは別の類似不具合として、後処理で `phase-report-check (aide-powers skill: write)` を activate する際の `progress_file_path` 明示指定が、**bugfix WF・refactoring WF に限らず、7ワークフロー中6ワークフロー（企画・設計・実装・設計逆引き・変更WFのphase2・バグ修正WF・リファクタリングWF）で共通して欠落している**ことが判明しました。

- **明示指定が既に存在する唯一の例外:** `skills/fs-change-phase1-analysis/SKILL.md` の後処理のみ、「呼び出し時に `progress_file_path=`{changes_dir}/change-progress.md`（Step 6 で確定した changes_dir を使用）を渡す」という明示的な記述が Read で確認できました。
- **それ以外の全フェーズスキル（33ファイル）は、`phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。` という記述のみで、`progress_file_path` の受け渡しが記述レベルで明示されていません。**

前回の調査では「フォルダ統合によってパスが動的に変わるWF（bugfix・refactoring）」という基準でスコープを bugfix WF・refactoring WF のみに絞っていましたが、これは調査不足による誤った絞り込みでした。実際には、specs_dir が静的なパス（`.aide/specs/{feature_name}/`）で決まる企画・設計・実装・設計逆引きWFも含めて、動的にフォルダが変わる変更WF（phase2のみ）・バグ修正WF・リファクタリングWFも含めて、**ほぼ全てのフェーズスキルで同様の記述欠落が存在します**。ユーザーからの当初の指示「全てのWFを対象にしてください」に従い、今回は以下の33ファイル全てを修正対象とします。

**欠落が確認された33ファイル（WF別）:**

| WF | 進捗ファイルパス変数 | 欠落しているフェーズスキル |
|---|---|---|
| 企画WF | `.aide/specs/{feature_name}/planning-progress.md`（静的） | fs-planning-phase1-intake-and-init, fs-planning-phase2-explore, fs-planning-phase3-finalize（3件） |
| 設計WF | `{specs_dir}/design-progress.md`（specs_dir=`.aide/specs/{feature_name}`、静的） | fs-design-phase1-user-req 〜 fs-design-phase10-program（10件） |
| 実装WF | `.aide/specs/{feature_name}/impl-progress.md`（静的） | fs-impl-phase1-gate 〜 fs-impl-phase6-doc-generation（6件） |
| 設計逆引きWF | `{specs_dir}/reverse-progress.md`（specs_dir=`.aide/specs/{feature_name}`、静的） | fs-reverse-phase1-program 〜 fs-reverse-phase5-optional-phases（5件） |
| 変更WF | `{changes_dir}/change-progress.md`（changes_dir はStep6で動的確定） | fs-change-phase2-impl（1件。phase1は既に明示指定済みのため対象外） |
| バグ修正WF | `{bugfix_dir}/bugfix-progress.md`（bugfix_dir はStep7で動的確定） | fs-bugfix-phase1-analysis, fs-bugfix-phase2-impl（2件） |
| リファクタリングWF | `{refactoring_dir}/refactoring-progress.md`（refactoring_dir はphase1のStep2で動的確定） | fs-refactoring-phase1-status, fs-refactoring-phase2-candidates, fs-refactoring-phase3-plan, fs-refactoring-phase4-design, fs-refactoring-phase5-impl, fs-refactoring-phase6-doc（6件） |

specs_dir が静的に決まる企画・設計・実装・設計逆引きWFでは、パスの取り違えという直接的なバグ発生リスクは動的パスのWFほど高くはありませんが、記述として明示されていない点は共通の構造的欠落であり、今回のバグ（進捗ファイル新規作成の担当者・手順が誰にも定義されていない）と根本原因の性質が同じ（「暗黙の前提に依存し、手順書に明示していない」）であるため、修正スコープに含めます。

## 修正方針

### 対策種別
根本対策

**判定理由:** 本バグの原因は「進捗ファイルが存在しない場合に、誰が・どこで新しく作るかが手順書に定義されていない」という構造的な欠落です。今回の修正は、進捗ファイルの読み書きを一手に担っている `progress-updater` の write モードの手順に「ファイルが無ければ新しく作る」という処理を追加するとともに、全7WFのSKILL.mdに「どのファイルパスを渡すか」の明示的な記述を追加するものであり、原因そのもの（新規作成の担当者・手順が誰にも定義されていない状態、および渡すべきパスが曖昧・暗黙的な状態）を取り除きます。write モードのみに範囲を絞っても、原因を除去する修正であることに変わりはありません。特定の症状だけを回避する分岐追加や、例外を握りつぶすような対処ではないため、暫定対策には該当しません。

### 修正内容（方針レベル）

**修正スコープ1: progress-updater の write モードへの新規作成処理の追加（既存内容を維持）**

`agents/progress-updater.md` を実際に Read して確認した結果、**write モードのみを修正すれば十分であり、verify モードの修正は不要**であることが確認できました。根拠は以下の通りです。

- verify モードの実行フローは V1（フェーズ番号抽出）→ V2（N = 1 ならスキップして PASS で終了）→ V3（進捗ファイルを Read）→ V4（前フェーズ完了状態確認）の順で定義されています。**V2 のスキップ判定は V3 の Read 実行より前に評価されます。** つまり N = 1（各ワークフローの先頭フェーズ）の場合、verify モードはそもそも進捗ファイルを一度も読みに行きません。ファイルの有無を確認する処理自体が実行されないため、verify モードに「ファイル不在時の新規作成」処理を追加しても、N = 1 のケースでは呼び出されず意味を持ちません。
- 進捗ファイルが最初に作られるべきタイミングは、各ワークフローの先頭フェーズ（Phase1 等）の**後処理（write モード）**です。write モードは後処理からのみ呼ばれ、フェーズが N = 1 であっても W2（進捗ファイルの Read）は必ず実行されます。
- write モードが「ファイル不在時に新規作成する」ように修正されれば、先頭フェーズ（N = 1）完了時の後処理で進捗ファイルが新規作成されます。以降のフェーズ（N > 1）で verify モードが V3 で進捗ファイルを Read する時点では、既に write モードによって進捗ファイルが作成済みの状態になっています。
- したがって、**verify モードには一切変更を加えません**。修正対象は write モードの実行フローのみです。

具体的には、write モードの実行フロー冒頭（W1 と W2 の間、または W2 内）に「進捗ファイルが存在するかどうか」を確認する手順を追加し、存在しない場合は `skill_name` からワークフロー名とフェーズ番号を読み取り、`progress-file-format.md` に定義された該当ワークフロー用の初期状態テンプレートで進捗ファイルを新規作成してから、既存の W2〜W5（前フェーズ完了状態確認・成果物確認・ステータステーブル更新・フェーズ詳細追記）に合流させる方針とします。具体的な判定方法（正規表現の詳細等）は次工程（差分設計）で確定します。

**修正スコープ2: 全WFのSKILL.md への progress_file_path 明示指定の記述追加（今回拡大）**

ユーザーからの当初の指示は「全てのWFを対象にしてください」でしたが、前回は「フォルダ統合によってパスが動的に変わるWF」という基準を独自に設定し、bugfix WF・refactoring WF のみにスコープを絞ってしまいました。これは誤りであり、今回は全7ワークフローを対象に拡大します。

上記「類似不具合の調査結果」の表に記載した33ファイル全てについて、変更WF（`skills/fs-change-phase1-analysis/SKILL.md`）に既に存在する記述パターンと同じ形式で、`phase-report-check (aide-powers skill: write)` 呼び出し箇所に `progress_file_path` を明示的に渡す記述を追加します。

- **企画WF・設計WF・実装WF・設計逆引きWF（specs_dir が静的パスのWF）:** 該当する進捗ファイルパス（`.aide/specs/{feature_name}/{WF名}-progress.md`、または `{specs_dir}/{WF名}-progress.md`）を、各フェーズスキルの後処理の `phase-report-check (aide-powers skill: write)` 呼び出し文に明示的に追加する
- **変更WF（fs-change-phase2-impl）:** Step 6 で確定済みの changes_dir を用いた `progress_file_path={changes_dir}/change-progress.md` を明示的に追加する（fs-change-phase1-analysis は既に明示指定済みのため変更不要）
- **バグ修正WF（fs-bugfix-phase1-analysis, fs-bugfix-phase2-impl）:** Step 7（phase1）で確定済みの bugfix_dir を用いた `progress_file_path={bugfix_dir}/bugfix-progress.md` を明示的に追加する
- **リファクタリングWF（fs-refactoring-phase1-status 〜 fs-refactoring-phase6-doc）:** phase1 Step2 で確定済みの refactoring_dir を用いた `progress_file_path={refactoring_dir}/refactoring-progress.md` を明示的に追加する

これはドキュメント（SKILL.md）の記述追加であり、コード変更ではありません。具体的な記述文言・追加位置の確定は次工程（差分設計）で行います。

### 修正対象ファイル

**修正スコープ1（既存内容を維持）:**

- `agents/progress-updater.md`（writeモードのみ）: 進捗ファイル不在時の新規作成処理を追加する（正本）。verify モードの記述は変更しない
- `agents/kiro/progress-updater.md`（writeモードのみ）: 上記と同一内容に同期する（Kiro IDE 配布用）
- `agents/kiro/prompts/progress-updater-prompt.md`（writeモードのみ）: 上記と同一内容に同期する（Kiro CLI 配布用）
- `.kiro/agents/progress-updater.md`（writeモードのみ）: 上記と同一内容に同期する（ワークスペースへの配布済みコピー）

上記4ファイルは program-structure.md の記載どおり同一内容を保つ必要があるファイル群であり、いずれも `agents/progress-updater.md` の内容と完全に同期させる。**いずれのファイルも verify モードのセクションには変更を加えない。**

**修正スコープ2（今回拡大。33ファイル）:**

企画WF（3件）:
- `skills/fs-planning-phase1-intake-and-init/SKILL.md`（後処理）
- `skills/fs-planning-phase2-explore/SKILL.md`（後処理）
- `skills/fs-planning-phase3-finalize/SKILL.md`（後処理）

設計WF（10件）:
- `skills/fs-design-phase1-user-req/SKILL.md`（後処理）
- `skills/fs-design-phase2-system-req/SKILL.md`（後処理）
- `skills/fs-design-phase3-dev-plan/SKILL.md`（後処理）
- `skills/fs-design-phase4-architecture/SKILL.md`（後処理）
- `skills/fs-design-phase5-gui/SKILL.md`（後処理）
- `skills/fs-design-phase6-usecase/SKILL.md`（後処理）
- `skills/fs-design-phase7-ddd/SKILL.md`（後処理）
- `skills/fs-design-phase8-object/SKILL.md`（後処理）
- `skills/fs-design-phase9-infra/SKILL.md`（後処理）
- `skills/fs-design-phase10-program/SKILL.md`（後処理）

実装WF（6件）:
- `skills/fs-impl-phase1-gate/SKILL.md`（後処理）
- `skills/fs-impl-phase2-preparation/SKILL.md`（後処理）
- `skills/fs-impl-phase3-gui-mockup/SKILL.md`（後処理）
- `skills/fs-impl-phase4-execution/SKILL.md`（後処理）
- `skills/fs-impl-phase5-final-check/SKILL.md`（後処理）
- `skills/fs-impl-phase6-doc-generation/SKILL.md`（後処理）

設計逆引きWF（5件）:
- `skills/fs-reverse-phase1-program/SKILL.md`（後処理）
- `skills/fs-reverse-phase2-dev-env/SKILL.md`（後処理）
- `skills/fs-reverse-phase3-system-req/SKILL.md`（後処理）
- `skills/fs-reverse-phase4-user-req/SKILL.md`（後処理）
- `skills/fs-reverse-phase5-optional-phases/SKILL.md`（後処理）

変更WF（1件。fs-change-phase1-analysisは既に明示指定済みのため対象外）:
- `skills/fs-change-phase2-impl/SKILL.md`（後処理）

バグ修正WF（2件）:
- `skills/fs-bugfix-phase1-analysis/SKILL.md`（後処理）
- `skills/fs-bugfix-phase2-impl/SKILL.md`（後処理）

リファクタリングWF（6件）:
- `skills/fs-refactoring-phase1-status/SKILL.md`（後処理）
- `skills/fs-refactoring-phase2-candidates/SKILL.md`（後処理）
- `skills/fs-refactoring-phase3-plan/SKILL.md`（後処理）
- `skills/fs-refactoring-phase4-design/SKILL.md`（後処理）
- `skills/fs-refactoring-phase5-impl/SKILL.md`（後処理）
- `skills/fs-refactoring-phase6-doc/SKILL.md`（後処理）

### 副作用のリスク

**修正スコープ1（progress-updater write モード）について:**

- 影響がある範囲: `progress-updater` を利用する全7ワークフローの、`phase-report-check` を経由するあらゆるフェーズの**後処理（write モード）**が対象になる。ただし、これは「進捗ファイルが存在するときの動作」には変更を加えず、「存在しないときにだけ新規作成を追加する」変更のため、既存の正常系（すでに進捗ファイルがあるケース）の動作は変わらない
- `skill_name` からワークフロー名を抽出する処理が新たに必要になる。呼び出し元は全て `fs-{WF名}-phase{N}-{名称}` という命名規則に統一されていることを確認済みのため、想定される呼び出し元からは正しく抽出できる見込みだが、命名規則に沿わない `skill_name` が将来的に渡された場合の異常系の扱いは、次工程（差分設計）で明確化する必要がある
- **verify モードを修正しないことによるリスク:** verify モード（V1〜V4）は今回一切変更しないため、既存の動作は完全に維持される。唯一検討すべきは「N > 1 のフェーズで verify が呼ばれた時点で、何らかの理由（write モードの実行失敗・手動でのファイル削除等）により進捗ファイルが依然として存在しない異常系」だが、この場合 verify モードの V3（Read）が失敗し、V4 も実行できないため FAIL 相当の結果になると想定される。これは「ファイルが無いのに前フェーズ完了として扱われる」という誤った PASS を防ぐ意味では安全側の挙動であり、修正前から存在する挙動でもあるため、今回の修正によって新たに悪化するリスクではない。この異常系の具体的な挙動（エラーメッセージの明確さ等）は次工程の差分設計で確認する
- `progress-resume-check`（読み取り専用の別部品）の動作・責務には変更を加えないため、影響はない
- 各ワークフローのフェーズスキル側（`fs-*-phase1-*` 等）のインターフェース（呼び出しパラメータ）は変更しない方針（既存の `skill_name` から抽出可能なため新規パラメータは不要）であり、フェーズスキル側の修正は不要と考えられる。ただし、この点は次工程の差分設計で呼び出し側に変更が本当に不要か再確認する

**修正スコープ2（全WFのSKILL.md記述追加。33ファイル）について:**

- これはドキュメント（手順書）への記述追加のみであり、実行ロジック自体（processing logic）を変更するものではない。追加する記述は変更WFに既に存在する記述パターン（`{changes_dir}/change-progress.md`）を他の6WFに合わせて適用するだけであり、新しい仕組みを導入するものではないため、副作用のリスクは低いと考える
- 記述追加によって、これまで「暗黙的に呼び出し元スキルの記憶やコンテキストに依存していた」progress_file_path の決定が明示化されるため、オーケストレータの実行のばらつき（誤ったパスを渡してしまうリスク）が低減される、という改善効果が見込まれる
- **対象ファイル数が33件と多いことに伴うリスク:** 前回（bugfix・refactoringの計8件相当）に比べて対象ファイル数が大幅に増加したため、以下の点に注意する必要がある
  - **記述パターンの一貫性維持:** WFごとに進捗ファイルパスの変数名（specs_dir / changes_dir / bugfix_dir / refactoring_dir、または静的パス直接記載）が異なるため、差分設計時に各ファイルへ適用するパス表現を取り違えないよう、WF単位で変数名を一覧化してから機械的に適用する必要がある（本方針書の「類似不具合の調査結果」表がその一覧に相当する）
  - **修正漏れの検出:** 33ファイルという規模のため、差分設計・実装の各工程で「対象ファイルリストとの照合による網羅性チェック」を行い、記述追加漏れがないことを最終確認する必要がある
  - **既存記述との整合性:** 各ファイルの後処理には doc-index-maintenance や user-profile-management 等の他の呼び出しも並記されているため、追加する記述がそれらの記述と混在して可読性を損なわないよう、変更WFの既存記述パターン（1文で完結させる形式）に厳密に揃える
  - **specs_dir が静的なWF（企画・設計・実装・設計逆引き）への適用の妥当性:** これらのWFは folder-merge-check の対象外であり progress_file_path が実行中に変化することはないため、明示指定を追加してもバグの再発防止効果は動的パスのWFに比べて限定的である。ただし、暗黙の前提を明示化するという一貫性の観点、および将来これらのWFにもフォルダ統合的な仕組みが追加された場合の予防効果から、修正スコープに含める判断とした

### フォルダ統合（folder-merge-check）・PI-051との整合性

folder-merge-check によるフォルダ統合後（進捗ファイルが `old/{日付}/` に退避され、新フォルダには存在しない状態）も、修正スコープ1（write モードの新規作成処理）が適用される経路を通るため、次にそのフォルダでフェーズが完了した時点（write モード）で自動的に新規作成されるようになる。

修正スコープ2について、フォルダ統合によってパスが動的に変わる変更WF・バグ修正WF・リファクタリングWFへの progress_file_path 明示指定の追加は、folder-merge-check との整合性を直接的に高める修正である。一方、企画WF・設計WF・実装WF・設計逆引きWFは specs_dir が静的であり folder-merge-check の対象外であるため、これらのWFへの追加は folder-merge-check との直接的な関連はないが、全WF共通の記述一貫性を確保する目的で同一スコープに含める。両修正スコープとも write モードに閉じた修正であり、verify モードや PI-051（既存の別課題管理）に対する影響はない。

## リグレッションテスト方針

修正対象を write モードのみに絞り込んだことに伴い、verify モードに関するテスト項目（verify 単独での新規作成確認、N=1 スキップ処理との干渉確認等）は設定しない。write モードの新規作成処理、および全7WFのSKILL.md記述追加（33ファイル）の2点に焦点を当てたテスト項目とする。

### 追加する動作確認

**修正スコープ1（progress-updater write モード）:**

- バグ再現確認: 進捗ファイルが存在しない状態（先頭フェーズ N=1 完了時を想定）で `progress-updater` を write モードで呼び出し、修正前は新規作成されない（不在または想定外挙動になる）ことを確認したうえで、修正後は該当ワークフロー用の初期テンプレートで新規作成され、通常の更新処理（前フェーズ完了状態確認・成果物確認・ステータステーブル更新・フェーズ詳細追記）まで正しく完了することを確認する
- 境界値確認: 7ワークフロー（企画・設計・実装・設計逆引き・変更・バグ修正・リファクタリング）それぞれの `skill_name` を用いて、write モード呼び出し時に対応するワークフロー専用の初期テンプレートが正しく選択されて新規作成されることを確認する
- 境界値確認: フェーズ番号 N=1（先頭フェーズ、前フェーズ完了状態チェックがスキップされる）と N>1（先頭以外のフェーズ）の両方で、write モードにおいてファイル不在時に新規作成が正しく行われることを確認する
- 統合確認: 先頭フェーズ（N=1）の write モードで進捗ファイルが新規作成された後、後続フェーズ（N=2）の verify モードが該当ファイルを正しく Read でき、前フェーズ（N=1）の完了状態を正しく確認できることを確認する（write → verify の連携確認。verify モード自体は無修正であることの裏付け）
- 異常系確認: フォルダ統合（folder-merge-check）によって進捗ファイルが退避され新フォルダに存在しない状態を再現し、次のフェーズの write モード実行時に正しく新規作成されることを確認する

**修正スコープ2（全7WFのSKILL.md記述追加。33ファイル）:**

- 記述確認（網羅性チェック）: 修正対象33ファイル全てについて、修正後の SKILL.md の後処理を Read し、それぞれのWFの進捗ファイルパス変数（`.aide/specs/{feature_name}/{WF名}-progress.md` / `{specs_dir}/{WF名}-progress.md` / `{changes_dir}/change-progress.md` / `{bugfix_dir}/bugfix-progress.md` / `{refactoring_dir}/refactoring-progress.md`）を用いた `progress_file_path` の明示指定が、変更WF（fs-change-phase1-analysis）の既存記述パターンと一貫した形式で追加されていることを、33ファイル全件について1件ずつ確認する（対象ファイルリストとの照合により追加漏れがないことを確認する）
- 記述確認: 修正対象外の `skills/fs-change-phase1-analysis/SKILL.md` が変更されていないこと（既に明示指定済みのため今回のスコープ外）を確認する
- 実動確認: バグ修正WFまたはリファクタリングWFを実際に実行し、folder-merge-check によってフォルダ統合が発生するケース（起因元フォルダがあるケース）で、後処理実行時に正しい確定後の bugfix_dir / refactoring_dir を用いて progress_file_path が渡され、進捗ファイルが正しいフォルダに作成・更新されることを確認する
- 実動確認: 企画WFまたは設計WFを実際に実行し、後処理実行時に明示指定された progress_file_path（静的パス）を用いて進捗ファイルが正しく作成・更新されることを確認する（specs_dir が静的なWFでも記述追加が正しく機能することの確認）

**実施方法:** dev-environment.md §7.4 の確定方針により、本リポジトリには pytest 等の自動テストフレームワークは導入していないため、上記はすべて手動検証（実際に該当ワークフローの該当フェーズを進捗ファイル不在の状態から実行し、ファイルが作成されるかを目視確認する。または修正後の SKILL.md をRead して記述内容を目視確認する）で実施する。

### 既存動作でカバー済みの範囲

- なし。bug-analysis.md のテストカバレッジ調査のとおり、原因箇所（`agents/progress-updater.md`）にも影響範囲（7ワークフロー共通の利用箇所、および全7WFのSKILL.md）にも既存の自動テストは存在しない（自動テストフレームワーク自体が本リポジトリに導入されていない）
