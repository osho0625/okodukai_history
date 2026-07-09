# バグ修正差分設計

## 作成日
2026-07-01

## 対象バグ
不具合修正ワークフロー（bugfix）や変更ワークフロー（change）などを開始したとき、Phase1（分析フェーズ）の処理の中で、進捗を記録するためのファイル（`bugfix-progress.md` / `change-progress.md` 等）が作られないことがある。特に、作業フォルダを統合する処理（folder-merge-check）が関わるケースで発生しやすい。

## 対策種別
根本対策（fix-plan.md より引き継ぎ）

**判定理由:** 本バグの原因は「進捗ファイルが存在しない場合に、誰が・どこで新しく作るかが手順書に定義されていない」という構造的な欠落、および「後処理で渡すべき progress_file_path が曖昧・暗黙的な状態」である。今回の修正は、進捗ファイルの読み書きを一手に担っている `progress-updater` の write モードの手順に「ファイルが無ければ新しく作る」処理を追加するとともに、全7WFのSKILL.mdに「どのファイルパスを渡すか」の明示的な記述を追加するものであり、原因そのものを取り除く。特定の症状だけを回避する分岐追加や、例外を握りつぶすような対処ではないため、暫定対策には該当しない。

## 設計方針
- 既存コードのルール優先（命名・エラーハンドリング・スタイル）。Markdown表形式のStep記述パターン、見出し階層を踏襲する
- レイヤー間依存ルール遵守（layered-architecture.md は本メタ開発リポジトリには存在しない。dev-environment.md §14 の確定判断により、通常アプリ向けdesign-gateはメタ開発では適用対象外であり、本修正はスキル定義ファイル（Markdown手順書）の記述追加・変更に閉じるため、レイヤー依存の概念は適用対象外）
- 修正スコープ2（33ファイル）は、変更WF（`fs-change-phase1-analysis/SKILL.md`）に既に存在する記述パターンと同一の形式で機械的に適用する。WFごとに進捗ファイルパスの変数名（静的パス直接記載 / `{changes_dir}` / `{bugfix_dir}` / `{refactoring_dir}`）が異なるため、fix-plan.md の「類似不具合の調査結果」表の変数一覧に厳密に従う
- 規模が大きいため、修正スコープ1（progress-updater本体）と修正スコープ2（33ファイル、WF単位でグルーピング）に分割する

## 修正対象の差分設計

詳細は分割ファイルを参照:

- [fix-design-progress-updater.md](./fix-design-progress-updater.md) — 修正スコープ1: `agents/progress-updater.md` 系4ファイル（write モードへの新規作成処理 W1.5 追加）
- [fix-design-skill-progress-path-planning.md](./fix-design-skill-progress-path-planning.md) — 修正スコープ2: 企画WF 3ファイルへの progress_file_path 明示指定追加
- [fix-design-skill-progress-path-design.md](./fix-design-skill-progress-path-design.md) — 修正スコープ2: 設計WF 10ファイルへの progress_file_path 明示指定追加
- [fix-design-skill-progress-path-impl.md](./fix-design-skill-progress-path-impl.md) — 修正スコープ2: 実装WF 6ファイルへの progress_file_path 明示指定追加
- [fix-design-skill-progress-path-reverse.md](./fix-design-skill-progress-path-reverse.md) — 修正スコープ2: 設計逆引きWF 5ファイルへの progress_file_path 明示指定追加
- [fix-design-skill-progress-path-change-bugfix-refactoring.md](./fix-design-skill-progress-path-change-bugfix-refactoring.md) — 修正スコープ2: 変更WF(1)・バグ修正WF(2)・リファクタリングWF(6) 計9ファイルへの progress_file_path 明示指定追加（動的パスWF）

**33ファイルの内訳（企画3 + 設計10 + 実装6 + 設計逆引き5 + 変更1 + バグ修正2 + リファクタリング6 = 33）:**

| WF | 件数 | 分割ファイル |
|---|---|---|
| 企画WF | 3 | fix-design-skill-progress-path-planning.md |
| 設計WF | 10 | fix-design-skill-progress-path-design.md |
| 実装WF | 6 | fix-design-skill-progress-path-impl.md |
| 設計逆引きWF | 5 | fix-design-skill-progress-path-reverse.md |
| 変更WF | 1 | fix-design-skill-progress-path-change-bugfix-refactoring.md |
| バグ修正WF | 2 | fix-design-skill-progress-path-change-bugfix-refactoring.md |
| リファクタリングWF | 6 | fix-design-skill-progress-path-change-bugfix-refactoring.md |

## 新規追加の設計

新規追加なし（既存ファイルへの処理追加・記述追加のみ。新規クラス・新規メソッドの追加はない）。

## リグレッションテスト設計

本リポジトリには自動テストフレームワークが存在しないため（dev-environment.md §7.4）、以下は全て手動検証シナリオとして設計する。

### 追加テストケース（手動検証シナリオ）

#### テスト1: バグ修正WF Phase1完了時の進捗ファイル新規作成
- 対象: `agents/progress-updater.md`（write モード）、バグ修正WF Phase1（`fs-bugfix-phase1-analysis`）
- 入力: `.aide/specs/aide-powers-test/bugfix/{テスト用日時}-{概略}/` に `bugfix-progress.md` が存在しない状態で、バグ修正ワークフローを新規開始し Phase1 の全Stepを完了させる
- 期待結果: `{bugfix_dir}/bugfix-progress.md` が progress-file-format.md §7.6 の初期テンプレート（Phase1〜3のステータステーブル）で新規作成され、Phase1 行が `✅ 完了` + 完了日時に更新され、フェーズ詳細セクションが追記されている
- 目的（防ぐバグ）: bug-report.md の症状そのもの（Phase1 の後処理で進捗ファイルが作成されない）を直接検証する

#### テスト2: 7ワークフロー全てでの初期テンプレート正しい選択
- 対象: `agents/progress-updater.md`（write モード W1.5）
- 入力: 企画・設計・実装・設計逆引き・変更・バグ修正・リファクタリングの7ワークフローそれぞれについて、先頭フェーズの skill_name（例: `fs-planning-phase1-intake-and-init`、`fs-design-phase1-user-req` 等）で write モードを呼び出し、進捗ファイル不在状態から新規作成させる
- 期待結果: 各ワークフローに対応する進捗ファイル名・表示名・フェーズ一覧が progress-file-format.md §7.1〜§7.7 のマッピング通りに生成される。リファクタリングWFの場合はテスト結果列が追加されている
- 目的（防ぐバグ）: bug-analysis.md が指摘する「7ワークフロー共通の構造的欠落」を横断的に検証し、特定WFのみの局所修正になっていないことを確認する

#### テスト3: N=1とN>1双方での新規作成
- 対象: `agents/progress-updater.md`（write モード W1.5・W2）
- 入力: (a) N=1（例: `fs-bugfix-phase1-analysis`）で進捗ファイル不在状態から write モードを実行、(b) リファクタリングWFの Step2（フォルダ統合発生時）を想定し N=2（`fs-refactoring-phase2-candidates`）かつ進捗ファイルがまだ存在しない状態を人為的に用意して write モードを実行
- 期待結果: 両ケースとも W1.5 で新規作成が行われ、W2 の前フェーズ完了チェックがスキップされて FAIL にならず、W3〜W5 まで正常に完了する
- 目的（防ぐバグ）: fix-plan.md の境界値確認方針（N=1とN>1の両方でファイル不在時に新規作成が正しく行われること）を検証し、W2 のスキップ分岐漏れによる新たな FAIL を防ぐ

#### テスト4: write → verify の連携（verifyモード無修正の裏付け）
- 対象: `agents/progress-updater.md`（verify モード・無修正であることの確認）、バグ修正WF Phase1→Phase2
- 入力: Phase1（N=1）の write モードで進捗ファイルが新規作成された状態にした後、続けて Phase2（`fs-bugfix-phase2-impl`、N=2）の前処理で `phase-report-check (verify)` → `progress-updater (verify)` を実行する
- 期待結果: verify モードが Phase1（N-1=1）の完了状態を進捗ファイルから正しく Read でき、`✅ 完了` として PASS を返す
- 目的（防ぐバグ）: fix-plan.md の統合確認方針を検証し、write モードの新規作成後に verify モードが正しく機能することを確認する（verify モード自体は無修正であることの裏付け）

#### テスト5: フォルダ統合（folder-merge-check）後の新規作成
- 対象: `agents/progress-updater.md`（write モード）、`folder-merge-check`、バグ修正WFまたはリファクタリングWF
- 入力: 起因元フォルダが存在するバグ報告でバグ修正WFを開始し、Step 7（フォルダ統合判定）で folder-merge-check が旧 `bugfix-progress.md` を `old/{日付}/` に退避し、新しい bugfix_dir に進捗ファイルが存在しない状態にしたうえで後処理まで進める
- 期待結果: 新しい bugfix_dir に `bugfix-progress.md` が正しく新規作成され、統合後のワークフロー進行に支障が出ない
- 目的（防ぐバグ）: bug-report.md の「発生環境・条件」（フォルダ統合が関与するケースで顕在化しやすい）に直接対応するシナリオであり、本バグの主要な発生条件を検証する

#### テスト6: skill_name 命名規則不一致時の異常系
- 対象: `agents/progress-updater.md`（write モード W1.5 の異常系分岐）
- 入力: 命名規則 `fs-{WF名}-phase{N}-{名称}` に合致しない skill_name（例: `custom-skill-abc`）を渡し、進捗ファイル不在状態で write モードを呼び出す
- 期待結果: W1.5 でワークフロー識別子が抽出できず FAIL となり、ユーザーに「skill_name が命名規則に合致せず新規作成に必要なワークフロー識別子を抽出できない」旨が通知される
- 目的（防ぐバグ）: fix-plan.md の副作用リスク（命名規則に沿わない skill_name が将来的に渡された場合の異常系）を検証し、異常系が握りつぶされず正しく FAIL 報告されることを確認する

#### テスト7: 33ファイル全件の progress_file_path 明示指定記述確認（網羅性チェック）
- 対象: 修正対象33ファイル全て（企画3/設計10/実装6/設計逆引き5/変更1/バグ修正2/リファクタリング6）
- 入力: 修正後の各SKILL.md後処理セクションを Read し、各WFの進捗ファイルパス変数を用いた `progress_file_path` の明示指定が記述されているかを1件ずつ確認する
- 期待結果: 33ファイル全件について、変更WF（fs-change-phase1-analysis）の既存記述パターンと一貫した形式で明示指定が追加されている（対象ファイルリストとの照合により追加漏れがないことを確認する）
- 目的（防ぐバグ）: bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査で判明した33ファイルの欠落を、記述レベルで全件解消したことを確認する

#### テスト8: 修正対象外ファイルの無変更確認
- 対象: `skills/fs-change-phase1-analysis/SKILL.md`
- 入力: 修正後の本ファイルを Read し、後処理セクションの記述を確認する
- 期待結果: 本ファイルは既に明示指定済み（今回のスコープ外）であるため、変更されていないこと（既存の「Step 6 で確定した changes_dir を使用」という記述が変わっていないこと）を確認する
- 目的（防ぐバグ）: スコープ外ファイルへの意図しない変更（副作用）がないことを確認する

#### テスト9: フォルダ統合発生時の progress_file_path 実動確認（動的パスWF）
- 対象: バグ修正WFまたはリファクタリングWFの実行（folder-merge-check 発生ケース）
- 入力: テスト5と同じ条件（起因元フォルダが存在するケース）でワークフローを実際に実行し、後処理実行時に渡される progress_file_path の値をログ・レポート（`fs-bugfix-phase1-report.txt` 等）から確認する
- 期待結果: Step 7（または該当Step）で確定した統合後の bugfix_dir（または refactoring_dir）を用いた progress_file_path が渡され、進捗ファイルが統合後の正しいフォルダに作成・更新される
- 目的（防ぐバグ）: fix-plan.md の実動確認方針に対応し、記述追加が実際のワークフロー実行結果に反映されることを確認する

#### テスト10: 静的パスWFでの記述機能確認
- 対象: 企画WFまたは設計WFの実行
- 入力: 企画WFまたは設計WFを実際に実行し、後処理実行時に明示指定された progress_file_path（静的パス）を用いて進捗ファイルが正しく作成・更新されることを確認する
- 期待結果: specs_dir が静的なWFでも記述追加が正しく機能し、進捗ファイルが正しいパスに作成・更新される
- 目的（防ぐバグ）: specs_dir が静的なWF（企画・設計・実装・設計逆引き）についても記述追加が正しく機能することを確認する

### 既存テストへの影響

既存動作確認手順への影響なし。

dev-environment.md §7.1（インストーラ実行確認）・§7.2（ハブスキル発動確認）は、setup.bat / setup.sh の配置動作および `using-aide-powers` ハブスキルの読み込み確認を対象としており、本修正（progress-updater の write モード分岐追加、33ファイルの SKILL.md 記述追加）はいずれも既存の配置先・読み込み経路・ファイル形式を変更しないため、これらの手順自体に変更は不要である。既存の正常系（進捗ファイルが既に存在するケースでの write モード動作）は W1.5 が「存在する場合は何もしない」設計であるため、動作に変化はない。

## インターフェース影響サマリ

呼び出しパラメータの変更なし。

`progress-updater` の入力パラメータ（mode / progress_file_path / skill_name / changes_dir / expected_artifacts 等）に新規追加・変更はない。write モードの新規作成処理は既存の `skill_name` と `progress_file_path` のみから実行可能であり、fix-plan.md の方針（新規パラメータ追加は不要）通りである。

呼び出し元への影響も確認済み: `skills/phase-report-check/SKILL.md` の write モード（Step 1: progress-updater サブエージェントの起動、引数 `mode write / progress_file_path / skill_name / changes_dir / expected_artifacts`）は変更不要。

Grep で `phase-report-check (aide-powers skill: write)` の全呼び出し元（全 `fs-*-phase*` SKILL.md の後処理）を確認した結果、修正スコープ2の対象33ファイル以外に `progress_file_path` の明示指定が欠落している後処理呼び出しは見つからなかった（既に明示指定済みの `fs-change-phase1-analysis/SKILL.md` を含め、34ファイル全件を Grep で照合済み）。final-check系フェーズ（7ファイル）は `progress-final-checker` に委譲するため `phase-report-check (write)` を呼ばず、本調査の対象外である。

| ファイル | 呼び出し箇所 | 影響内容 | 後方互換性 |
|---|---|---|---|
| skills/phase-report-check/SKILL.md | write モードから progress-updater への委譲 | 引数の追加・変更なし。progress_file_path が明示指定されるようになるだけで、パラメータの型・数は不変 | あり（既存呼び出し元がある場合も動作変更なし） |
| 修正対象33ファイル（fs-*-phase*/SKILL.md） | 後処理内の phase-report-check (write) 呼び出し文 | 呼び出し文に progress_file_path を明示追加する記述変更のみ。オーケストレータ（AI Agent）が SKILL.md の記述に従って呼び出す際のパラメータが明示化される | あり（記述追加のみで既存の呼び出しロジック自体は変更しない） |

シグネチャ変更はない（agents/progress-updater.md のパラメータ名・型は不変のため、Grep による全呼び出し元検索の対象となる「シグネチャ変更」は発生していない）。

## 更新が必要な設計資料

- `program-structure.md`: progress-updater の write モード処理フローを説明する箇所は以下の2箇所存在し、**両方とも**「成果物存在確認→前フェーズ完了確認→ステータステーブル更新→詳細セクション追記」から「進捗ファイル不在時の新規作成→成果物存在確認→前フェーズ完了確認→ステータステーブル更新→詳細セクション追記」に更新する必要がある（doc-sync 経由で実装完了後に反映）
  - ①「パス3: agents/kiro/詳細解析」内「### エージェント別詳細解析」の「#### 10. progress-updater（進捗アップデーター）」（Kiro CLI用 JSON + prompts/ の詳細解析）
  - ②「パス3: agents/詳細解析」内の「### agents/progress-updater.md」（Claude Code / Copilot CLI / VSCode Copilot 用 agents/*.md の詳細解析）
- `program-structure.md` の全7WFのフェーズスキル解析セクション（「パス3: フェーズスキル群 詳細解析」以下の各 `fs-*-phase*` 項目）: 該当セクションを確認した結果、各項目は「呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), ...」のようにスキル名の列挙のみを記載する粒度であり、`progress_file_path=...` のようなパラメータ値を記載するセクションは存在しない。したがって、**33ファイルへの `progress_file_path` 明示指定追加について program-structure.md の該当セクションは存在せず更新不要**と結論づける
- `skills/using-aide-powers/references/progress-file-format.md`: 本ドキュメント自体への変更は不要（既存の §6.1・§7 の記述内容と本修正の実装は整合している）。ただし §6.1 に「新規作成の実行主体は `agents/progress-updater.md` の write モード W1.5 である」旨の一文を補記すると、方針と実装主体の対応がドキュメント上でも追跡できるようになるため、追記を推奨する（doc-sync 実行時にユーザーと相談のうえ判断すること）

（doc-sync 経由で完了処理時に反映する）
