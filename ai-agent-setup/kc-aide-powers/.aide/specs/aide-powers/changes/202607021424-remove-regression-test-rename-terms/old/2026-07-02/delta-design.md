# 差分設計書（メイン）

本変更は影響ファイル数が33件（既存変更19件＋新規追加4件＋間接影響10件）と多いため、項目（修正テーマ）ごとに分割ファイル構成とする。本ファイルは索引・インターフェース影響サマリ・更新が必要な設計資料のみを扱う。各分割ファイルの具体的な before→after 記述は分割ファイル本体を参照すること。

## 分割ファイル索引

| # | ファイル | 内容 | 対象ファイル数 |
|---|---|---|---|
| 1 | [delta-design-coding-test-2review.md](./delta-design-coding-test-2review.md) | `coding-test-2review` 本体＋3プロンプト（SKILL.md, implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md） | 4 |
| 2 | [delta-design-regression-test-prompts.md](./delta-design-regression-test-prompts.md) | 新規4ファイル `regression-test-prompt.md`（fs-impl-phase4-execution / fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase5-impl 各配下） | 4（新規） |
| 3 | [delta-design-impl-wf.md](./delta-design-impl-wf.md) | `fs-impl-phase4-execution`（SKILL.md, implementer-prompt.md） | 2 |
| 4 | [delta-design-change-wf.md](./delta-design-change-wf.md) | `fs-change-phase2-impl`（SKILL.md, change-task-planner-prompt.md） | 2 |
| 5 | [delta-design-bugfix-wf.md](./delta-design-bugfix-wf.md) | `fs-bugfix-phase2-impl`（SKILL.md, bugfix-task-planner-prompt.md） | 2 |
| 6 | [delta-design-refactoring-wf.md](./delta-design-refactoring-wf.md) | `fs-refactoring-phase5-impl`（SKILL.md, implementer-prompt.md） | 2 |
| 7 | [delta-design-shared-skills.md](./delta-design-shared-skills.md) | `impl-coding-standards`, `multi-stage-code-review`, `test-review`, `impl-task-planning` | 4 |
| 8 | [delta-design-docs.md](./delta-design-docs.md) | `docs-dev/` 配下5件 ＋ `docs/03-usage.md` | 6 |

**合計対象ファイル数**: 既存変更 19件（#1のうち1件はSKILL.md本体+3プロンプト=4件がすべて既存変更、#3〜6は各2件で計8件、#7は4件、#8は6件 → 4+8+4+6=22件のうち新規追加を除く。詳細は下記「対象ファイル数の集計」参照）＋ 新規追加 4件（#2）＝ 合計26件の直接変更・新規対象ファイル、間接影響ファイルは #1・#7・#8 に内包される7件（test-review, impl-task-planning, change-task-planner-prompt.md, bugfix-task-planner-prompt.md, docs-dev 4件, docs/03-usage.md）を含む。

### 対象ファイル数の集計（approach.md との対応）

| 分類 | 件数 | 内訳 |
|---|---|---|
| 既存変更（approach.md「変更対象」表 12件のうち直接編集） | 19件 | coding-test-2review関連4件 + impl-coding-standards + multi-stage-code-review + fs-impl-phase4-execution関連2件 + fs-refactoring-phase5-impl関連2件 + fs-change-phase2-impl関連1件(SKILL.md) + fs-bugfix-phase2-impl関連1件(SKILL.md) + test-review + impl-task-planning + change-task-planner-prompt.md + bugfix-task-planner-prompt.md + docs-dev4件 + docs/03-usage.md = 19件 |
| 新規追加 | 4件 | regression-test-prompt.md × 4（fs-impl-phase4-execution / fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase5-impl 各配下） |
| 間接影響（廃止3件・修正6件・維持4件のうち、廃止・修正の9件が変更対象に内包） | 9件（19件の一部として既に集計済み） | test-review, impl-task-planning, change-task-planner-prompt.md, bugfix-task-planner-prompt.md, docs-dev4件, docs/03-usage.md |

> 注記: 間接影響ファイルのうち「廃止3件・修正6件」は上記「既存変更19件」に内包される（重複カウントを避けるため独立集計しない）。「維持4件」（fs-refactoring-phase1-status/SKILL.md, refactoring-planner-prompt.md, refactoring-verification-prompt.md, fs-refactoring-phase6-doc/SKILL.md, change-impact-reviewer-prompt.md）は変更なしのため本設計書の変更対象に含まれない。

---

## インターフェース影響サマリ

### シグネチャ変更: `bugfix_dir` パラメータの廃止（coding-test-2review 呼び出し時）

`coding-test-2review (aide-powers skill)` の入力パラメータから `bugfix_dir` を廃止する（正確には、preservation check 廃止に伴い呼び出し時に `bugfix_dir` を渡さなくなる。coding-test-2review 本体からも `bugfix_dir` 入力パラメータ定義・preservation check 参照ロジックを削除する）。

impact-analysis.md にて Grep で網羅的に確認済みの呼び出し元は以下の3ファイルであり、これらすべてで `coding-test-2review` 呼び出し時の `bugfix_dir=...` 行を削除する。

| # | 呼び出し元ファイル | 呼び出し箇所（Step） | 対応する分割ファイル |
|---|---|---|---|
| 1 | `skills/fs-refactoring-phase5-impl/SKILL.md` | Step 1 | delta-design-refactoring-wf.md |
| 2 | `skills/fs-change-phase2-impl/SKILL.md` | Step 10 | delta-design-change-wf.md |
| 3 | `skills/fs-bugfix-phase2-impl/SKILL.md` | Step 8 | delta-design-bugfix-wf.md |

これ以外に `coding-test-2review` へ `bugfix_dir` を渡している箇所は存在しない（impact-analysis.md のシグネチャ変更波及追跡セクションで Grep 確認済み）。

**波及なしの確認**: `bugfix_dir` は `coding-test-2review` のオプション入力パラメータであり、呼び出し元3ファイルが渡すのをやめるだけで完結する。`coding-test-2review` 内部の `implementer-prompt.md` / `spec-reviewer-prompt.md` / `code-quality-reviewer-prompt.md` の各プロンプトテンプレートからも `{bugfix_dir}` プレースホルダーと task_kind 別の preservation check 分岐記述を削除するため、シグネチャの参照元はこれで全て解消される（詳細は delta-design-coding-test-2review.md）。

### 廃止される工程・記述の波及範囲

| 廃止対象 | 波及先（削除が必要な参照元） | 対応する分割ファイル |
|---|---|---|
| `preservation check` 工程 | coding-test-2review/SKILL.md, implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md | delta-design-coding-test-2review.md |
| 「対象テスト」「全体リグレッション」の2本立て実行 | coding-test-2review/implementer-prompt.md（run_test）, impl-coding-standards/SKILL.md（run_testモード）, fs-impl-phase4-execution/implementer-prompt.md | delta-design-coding-test-2review.md, delta-design-shared-skills.md, delta-design-impl-wf.md |
| 「既存テスト全実行（リグレッション確認）」記述（Stage 3） | multi-stage-code-review/SKILL.md | delta-design-shared-skills.md |
| Step単位の「リグレッションテスト結果の確認・報告（セーフティネット）」 | fs-impl-phase4-execution/SKILL.md（Step2に統合）, fs-change-phase2-impl/SKILL.md（旧Step11→Step11に統合）, fs-bugfix-phase2-impl/SKILL.md（旧Step9→Step9に統合）, fs-refactoring-phase5-impl/SKILL.md（旧Step2→Step2に統合） | delta-design-impl-wf.md, delta-design-change-wf.md, delta-design-bugfix-wf.md, delta-design-refactoring-wf.md |
| リグレッションテストタスクの抽出テンプレート | fs-change-phase2-impl/change-task-planner-prompt.md, fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md | delta-design-change-wf.md, delta-design-bugfix-wf.md |
| test-review のリグレッション観点（実装ステップ内） | test-review/SKILL.md（workflow_context別テーブルの bugfix/refactoring 行） | delta-design-shared-skills.md |
| impl-task-planning のリグレッションテスト必須記述 | impl-task-planning/SKILL.md（ワークフロー別差異テーブル） | delta-design-shared-skills.md |

### Stepリナンバリングの波及

| ファイル | 変更前Step構成 | 変更後Step構成 | 参照Step番号の修正が必要な箇所 |
|---|---|---|---|
| `fs-change-phase2-impl/SKILL.md` | Step11（リグレッション確認）+ Step12（動作検証）+ Step13（設計書反映）+ Step14（pending-issues）+ Step15（完了案内） | Step11（動作確認Step統合）+ Step12（設計書反映）+ Step13（pending-issues）+ Step14（完了案内） | `change-doc-syncer-prompt.md` の参照元Step表記（Step13→Step12）、Integration節のプロンプトテンプレート表 |
| `fs-bugfix-phase2-impl/SKILL.md` | Step9（リグレッション確認）+ Step10（動作検証）+ Step11（設計書反映）+ Step12（pending-issues）+ Step13（完了案内） | Step9（動作確認Step統合）+ Step10（設計書反映）+ Step11（pending-issues）+ Step12（完了案内） | `bugfix-doc-syncer-prompt.md` の参照元Step表記（Step11→Step10）、Integration節のプロンプトテンプレート表 |
| `fs-refactoring-phase5-impl/SKILL.md` | Step1（実装ループ）+ Step2（リグレッション確認）+ Step3（動作確認試験） | Step1（実装ループ）+ Step2（動作確認Step統合） | 後続Stepなし（Step3が最終Stepだったため繰り上げ影響なし） |
| `fs-impl-phase4-execution/SKILL.md` | Step1（実装ループ）+ Step2（動作検証） | Step1（実装ループ）+ Step2（動作確認Step、内部構成変更のみ） | Step番号自体の変更なし（元々Step2に統合されていた） |

`change-doc-syncer-prompt.md` と `bugfix-doc-syncer-prompt.md` 自体はプロンプトファイル内で「Step13」「Step11」という直接のStep番号記述を持たない（呼び出し元SKILL.mdのIntegration節でのみStep番号が記載される）ため、プロンプトファイル本体の変更は不要。SKILL.md側のIntegration節の記載のみ修正する（各分割ファイルで反映）。

---

## 更新が必要な設計資料

本変更の実装完了後、以下の既存設計書を更新する必要がある（doc-sync 相当の処理は本変更では change ワークフローの Step12〈設計書反映〉で実施され、その反映元がこのセクションである）。

| 設計書 | 更新内容 | 反映元セクション |
|---|---|---|
| `program-structure.md` | `coding-test-2review`, `fs-impl-phase4-execution`, `fs-change-phase2-impl`, `fs-bugfix-phase2-impl`, `fs-refactoring-phase5-impl`, `impl-coding-standards`, `multi-stage-code-review`, `test-review`, `impl-task-planning` の各セクション記述を、`delta-program-structure.md`（program-structure-design delta モードの出力）の内容で置き換える | `delta-program-structure.md`（既に作成済み。本 delta-design.md への転記は不要。program-structure-design スキルの出力そのものを反映元として使用する） |

> **program-structure.md への反映方法に関する注記**: `delta-program-structure.md` の「整合性確認結果」セクションに記載の通り、program-structure.md の記載粒度（役割／主要機能／呼び出し元／追加ファイルの要約レベル）では、`coding-test-2review` / `impl-coding-standards` / `multi-stage-code-review` / `test-review` / `impl-task-planning` の5スキルは実質的な変更なしと判定されている。実際に変更が必要なのは以下4セクションのみ（`delta-program-structure.md` の該当セクションを反映する）:
> - `fs-impl-phase4-execution`（役割／プロセス／成果物／呼び出しエージェント／プロンプトテンプレート／特記を更新。新規ファイル regression-test-prompt.md の追加）
> - `fs-change-phase2-impl`（同上。Stepリナンバリングも反映）
> - `fs-bugfix-phase2-impl`（同上。Stepリナンバリングも反映）
> - `fs-refactoring-phase5-impl`（同上。開始前基準との比較報告の特記を追加）
>
> 上記4セクションの具体的な before→after は `delta-program-structure.md` に既に確定済みのため、本 delta-design.md では重複記載しない。change ワークフローの設計書反映Step（Step12）でこの `delta-program-structure.md` を直接の反映元として使用すること。

他の既存設計書（`system-requirements.md`, `user-requirements.md`, `ubiquitous-language.md`, `dev-environment.md` 等）への影響はない。本変更は実装ステップ内のテスト実行タイミング・用語の変更であり、システム要件・ユーザー要件・ユビキタス言語・開発環境定義のいずれにも変更を必要としない。

---

## 分割ファイル読み込みの注意

後続工程（差分設計QA、タスク分解、実装）は、本索引から全ての分割ファイル（#1〜#8）を特定し、**すべて読み込むこと**。索引のみを読んで分割ファイル本文を読み忘れることを禁止する。
