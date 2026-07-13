# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応
- **OCP検討結果**: 既存変更が必要

REQ-C-001（実装ステップ内リグレッションテスト廃止）・REQ-C-003（用語統一）は、既存のSKILL.md・プロンプトテンプレートに記述されている preservation check・全体リグレッション実行・bugfix_dir パラメータ・「対象テスト」等の**既存記述を削除・改名**するものであり、新規追加のみで対処することは原理的に不可能である。REQ-C-002（動作確認Stepでの1回実施への統一）も、各WFに既に存在する動作確認Step（verification step）に対する記述修正であり、新しい抽象化・拡張ポイントの新設ではない。したがって、対象ファイルを直接編集する「既存変更で対応」が唯一の選択肢である。

## 関連箇所

### 変更対象

| ファイル | スキル/プロンプト単位 | 変更内容 |
|---|---|---|
| `skills/coding-test-2review/SKILL.md` | SKILL本体 | bugfix_dir パラメータ廃止、preservation check 工程廃止、全体リグレッション廃止、Red Flags修正 |
| `skills/coding-test-2review/implementer-prompt.md` | write_test/run_testモード記述 | preservation check 記述廃止、テスト実行コマンドから全体リグレッション廃止、「対象テスト」→「ユニットテスト」 |
| `skills/coding-test-2review/spec-reviewer-prompt.md` | preservation checkセクション | セクション廃止、出力フォーマットから該当行廃止 |
| `skills/coding-test-2review/code-quality-reviewer-prompt.md` | preservation checkセクション | セクション廃止、出力フォーマットから該当行廃止 |
| `skills/impl-coding-standards/SKILL.md` | run_testモード記述 | 全体リグレッション実行廃止、2本立てルール廃止、失敗時フロー・報告テンプレート修正、「対象テスト」→「ユニットテスト」 |
| `skills/multi-stage-code-review/SKILL.md` | テスト実行工程記述 | 「既存テスト全実行（リグレッション確認）」記述廃止 |
| `skills/fs-impl-phase4-execution/SKILL.md` | coding-test-2review呼び出し注記/Step2 | 全体リグレッション記述廃止、Step2をREQ-C-002に沿い、動作確認Stepを2つの独立したサブエージェント呼び出し（既存の動作確認試験エージェント=impl-verification-prompt.md + 新規のリグレッションテスト実行エージェント=regression-test-prompt.md）に分離する設計に変更する |
| `skills/fs-impl-phase4-execution/implementer-prompt.md` | テスト実行コマンド記述 | 全体リグレッション廃止、テスト実行ルール修正、「対象テスト」→「ユニットテスト」 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | Step1/Step2 | bugfix_dirパラメータ廃止、preservation check記述廃止、Step2をREQ-C-002に沿い、動作確認Stepを2つの独立したサブエージェント呼び出し（既存の動作確認試験エージェント=refactoring-verification-prompt.md + 新規のリグレッションテスト実行エージェント=regression-test-prompt.md）に分離する設計に変更する |
| `skills/fs-refactoring-phase5-impl/implementer-prompt.md` | セーフティネット記述 | 実装ステップ内の全体リグレッション記述廃止 |
| `skills/fs-change-phase2-impl/SKILL.md` | Step10/Step11 | bugfix_dirパラメータ廃止、preservation check記述廃止、Step11をREQ-C-002に沿い、動作確認Stepを2つの独立したサブエージェント呼び出し（既存の動作確認試験エージェント=change-verification-prompt.md + 新規のリグレッションテスト実行エージェント=regression-test-prompt.md）に分離する設計に修正する |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | Step8/Step9 | bugfix_dirパラメータ廃止、preservation check記述廃止、Step9をREQ-C-002に沿い、動作確認Stepを2つの独立したサブエージェント呼び出し（既存の動作確認試験エージェント=bugfix-verification-prompt.md + 新規のリグレッションテスト実行エージェント=regression-test-prompt.md）に分離する設計に修正する |
| `skills/test-review/SKILL.md` | workflow_context別テスト観点テーブル | 「リグレッションテスト必須」等の実装ステップ内観点を廃止（テストレビュー観点として、実装ステップ内での毎回確認を要求している部分のみ） |
| `skills/impl-task-planning/SKILL.md` | タスク分解方針 | 「リグレッションテスト: 変更・バグ修正WFでは必須」の記述を廃止（タスク単位での計画対象から除外） |
| `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | タスク抽出テンプレート | リグレッションテストタスクの抽出テンプレートを廃止 |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | タスク抽出テンプレート | 同上 |
| `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | run_testモード説明 | 全体リグレッション記述廃止、「対象テスト」→「ユニットテスト」 |
| `docs-dev/02-ai-agent/03-common-skills/impl.md` | テスト実行ルール説明 | 「対象テスト＋全体リグレッションの両方を実行」の記述を「動作確認Stepで1回実施」に修正、用語統一 |
| `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | リグレッションテスト記述 | 実施タイミングを「動作確認Step（Step9）で1回」に修正（廃止ではなく修正） |
| `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | セーフティネットIron Law | 「各タスク完了時のブロッキング」から「動作確認Stepでの1回確認」に修正 |
| `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` | セーフティネットIron Law | 同上 |
| `docs/03-usage.md` | §5バグ修正WF説明、§8.1トークン消費傾向表 | 「各タスク完了時に既存テスト全実行」の記述を「動作確認Step時点で1回実施」に修正。「リグレッションテスト（バグ再現テスト）の設計」記述は維持しつつ、直後の全実行タイミング記述と混同しないよう文言調整 |

### 新規追加

| ファイル | スキル/プロンプト単位 | 追加内容 |
|---|---|---|
| `skills/fs-impl-phase4-execution/regression-test-prompt.md` | 新規プロンプトテンプレート | リグレッションテスト（既存テスト全実行）専任のプロンプト。既存の `micro-impl-agent (aide-powers agent)` に dev-environment.md 記載の「全テスト実行コマンド」を実行させ、結果（全パス/失敗件数・失敗テスト名）を報告させる |
| `skills/fs-change-phase2-impl/regression-test-prompt.md` | 新規プロンプトテンプレート | 同上（change WF用） |
| `skills/fs-bugfix-phase2-impl/regression-test-prompt.md` | 新規プロンプトテンプレート | 同上（bugfix WF用） |
| `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` | 新規プロンプトテンプレート | 同上（refactoring WF用）。開始前基準（phase1-statusで記録したセーフティネット基準）との比較結果を報告する設計とする |

## 変更方針の詳細

### REQ-C-001: 実装ステップ内リグレッションテストの廃止
- **方針**: `coding-test-2review`・`impl-coding-standards`・`multi-stage-code-review`・`fs-impl-phase4-execution` 等、実装ループ内でテストを実行する全スキル・プロンプトから、preservation check・全体リグレッション実行・bugfix_dir パラメータの記述を直接削除する。
- **理由**: これらは「毎タスク完了時に既存テストを全実行する」という廃止対象の仕組みそのものであり、追加や抽象化では対処できず、直接編集が必須。

### REQ-C-002: 動作確認Stepでのリグレッションテスト1回実施への統一
- **方針**: `fs-change-phase2-impl`（Step11）・`fs-bugfix-phase2-impl`（Step9）・`fs-refactoring-phase5-impl`（Step2）・`fs-impl-phase4-execution`（Step2） の、各WFに既存の動作確認Stepの記述を修正し、そのStep内でリグレッションテスト（既存テスト全実行）を1回実施する設計に統一する。
- **実行方式（フェーズスキル実作業禁止の原則に基づく）**: 動作確認Stepでのユーザー視点の動作確認試験（試験項目実行）と、内部の自動テスト全実行（リグレッションテスト）は異なる責務であるため、1つのサブエージェント・1つのプロンプトに混在させず、以下の2つの独立したサブエージェント呼び出しに分離する。
  - **サブエージェント1（既存・変更なし）**: 動作確認試験エージェント。各WF既存の動作確認プロンプトテンプレート（`impl-verification-prompt.md` / `change-verification-prompt.md` / `bugfix-verification-prompt.md` / `refactoring-verification-prompt.md`）を用い、ユーザー視点の試験項目（動作確認試験）実行に専任する。リグレッションテスト実行手順の追加は行わない
  - **サブエージェント2（新規）**: リグレッションテスト実行エージェント。対象WFのスキルディレクトリに新規作成する `regression-test-prompt.md` を用い、既存の `micro-impl-agent (aide-powers agent)` にリグレッションテスト（既存テスト全実行）専任で dev-environment.md 記載の「全テスト実行コマンド」を実行させ、結果（全パス/失敗件数・失敗テスト名）を報告させる
  - **実行順序**: リグレッションテスト実行エージェント（サブエージェント2）を先に実行し、全パスを確認した後にのみ、動作確認試験エージェント（サブエージェント1）を実行する逐次順序とする
    - 理由: リグレッションテストが失敗している状態（既存機能が壊れている）でユーザー視点の動作確認試験を進めても、その結果が信頼できないため。既存機能の健全性を先に確保してから、新規実装の動作確認を行う方が合理的
    - リグレッションテストが失敗した場合: 動作確認試験には進まず、原因を報告してユーザーに対応方針を確認する
  - 動作確認Stepの完了条件は、両サブエージェントの結果がともに揃っていること（リグレッションテスト実行結果 + 試験項目実行結果）とする
  - `fs-refactoring-phase5-impl` の `regression-test-prompt.md` は、既に `{{safety_net_result}}` プレースホルダーとして持つ役割を引き継ぎ、phase1-statusで記録した開始前基準との比較結果を報告する設計とする
- **理由**: 動作確認Stepは全WFに既に存在するため、新設ではなく既存Stepの記述修正で対応可能。実装ステップ内実行の廃止（REQ-C-001）とセットで、実施タイミングを一箇所に集約する。また、フェーズスキル実作業禁止の原則により、テストコマンドの実行自体はオーケストレータ（fs-*）が行わず、サブエージェントに委譲する。ユーザーからの指摘（「動作確認するサブエージェントとリグレッションテストするサブエージェントは分けろ」）に基づき、ユーザー視点の動作確認試験と内部の自動テスト全実行という異なる責務を1つのサブエージェントに混在させず、専任のサブエージェント・プロンプトに分離する。さらにユーザーからの指摘（「順番はリグレッションテストが先だよね？」）に基づき、実行順序を並列/逐次いずれかとする曖昧な記述から、リグレッションテスト先行の逐次順序に確定した。

### REQ-C-003: 用語の標準化
- **方針**: 「対象テスト」等の独自用語を「ユニットテスト」等の標準用語に置換する。「対象テキスト」は検索0件のため対応不要（要求定義時の想定用語が実際には存在しなかった）。
- **理由**: 用語統一は文言修正のみで対応可能であり、構造変更を伴わない。

### 間接影響ファイル（14件）の維持/廃止判断

REQ-C-002の「実装ステップ内での実行」と「動作確認Stepでの1回実施」の区別に基づき、以下のように分類する。

#### 廃止（実装ステップ内実行に該当するため）

| ファイル | 判断根拠 |
|---|---|
| `test-review/SKILL.md` のリグレッション観点 | test-review は code-review-agent から `mode=test` で**タスク単位**に呼び出されるテストレビュー観点。ここに「リグレッションテスト必須」観点が残ると、実質的に毎タスクでリグレッション実施を要求し続けることになり、REQ-C-001と矛盾する。廃止する |
| `impl-task-planning/SKILL.md` のリグレッションテスト必須記述 | タスク分解時に「リグレッションテストタスク」を計画対象とする記述。動作確認Stepでの1回実施に統一する以上、個別タスクとして計画する必要がなくなる。廃止する |
| `change-task-planner-prompt.md` / `bugfix-task-planner-prompt.md` のリグレッションテストタスクテンプレート | 上記と同一理由。タスクリストからリグレッションテストタスクを抽出するテンプレート自体が実装ステップ内実行の仕組みの一部であり、廃止する |

#### 維持（動作確認Step・その前提工程に該当するため）

| ファイル | 判断根拠 |
|---|---|
| `fs-refactoring-phase1-status/SKILL.md` のセーフティネット基準記録 | リファクタリング**開始前**に既存テスト実行結果を基準として1回記録するものであり、「動作確認Stepでの1回実施」と対になる仕組み（開始前1回＋動作確認時1回の比較）。実装ステップ内の毎回実行とは異なる目的であるため維持する |
| `fs-refactoring-phase3-plan/refactoring-planner-prompt.md` のユーザー向け用語集「セーフティネット」 | phase1-statusのセーフティネット基準記録が維持されるため、それを説明する用語集項目も維持する |
| `fs-refactoring-phase5-impl/refactoring-verification-prompt.md` の safety_net_result プレースホルダー | 役割は動作確認Step（Step2）でのリグレッションテスト結果報告であり、REQ-C-002が求める「動作確認Stepでの1回実施」の報告手段そのものである。ただしユーザー指摘に基づく分離方針により、実際の実行・報告は新規の `regression-test-prompt.md`（リグレッションテスト実行エージェント）側へ移す。プレースホルダーが担っていた役割自体は維持しつつ、参照元ファイルを付け替える |
| `fs-refactoring-phase6-doc/SKILL.md` のリグレッション結果読み取り | phase5の動作確認Step（Step2）で1回報告された結果をドキュメント同期時に読み取る記述であり、動作確認Step側の仕組みが維持されることと整合する。維持する |
| `fs-change-phase2-impl/change-impact-reviewer-prompt.md` の「リグレッションテスト対象」 | 影響範囲分析でテスト対象スコープを特定するための用語であり、実行頻度（毎タスク/1回）とは無関係。動作確認Stepで1回実施する際のスコープ定義としても引き続き必要なため維持する |

#### 修正（実装ステップ内実行の記述と動作確認Step側の記述が混在しているため）

| ファイル | 判断根拠 |
|---|---|
| `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | run_testモードの説明から全体リグレッション実行部分を削除し、用語を統一する（説明対象の仕組み自体がREQ-C-001で廃止されるため） |
| `docs-dev/02-ai-agent/03-common-skills/impl.md` | 「対象テスト＋全体リグレッションの両方を実行」の説明を「動作確認Stepで1回実施」に修正する |
| `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | 「リグレッションテスト必須」という要求自体は維持しつつ、実施タイミングを「動作確認Step（Step9）で1回」に修正する |
| `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | セーフティネットのIron Law（NO TASK PROCEEDS WITHOUT SAFETY NET PASS）は「各タスクをブロックする」という実装ステップ内実行の解釈を含むため、「動作確認Stepでの1回確認によりWF完了をブロックする」という解釈に修正する |
| `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` | 同上の理由で同様に修正する |
| `docs/03-usage.md`（新規発見分） | 「各タスク完了時に既存テスト全実行」の説明を「動作確認Step時点で1回実施」に修正する。「リグレッションテスト（バグ再現テスト）の設計」自体（バグを再現するテストケースの設計）はテスト内容の設計であり実行タイミングの話ではないため維持するが、直後に続く全実行タイミングの記述と混同しないよう文言を調整する |

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は既存記述の削除・実施タイミングの一箇所への集約・用語統一であり、新しい抽象化や拡張ポイントの導入を必要としない。19件の直接変更対象と14件の間接影響ファイルの判断（維持8件・廃止3件・修正3件、新規発見1件を含む）は多岐にわたるが、いずれも該当ファイルの該当セクションを直接編集する対応で完結し、構造的な再設計（新しいパラメータ抽象化、共通化モジュールの新設等）を要する規模・複雑性ではない。したがって `fs-change-phase4-design` へそのまま進み、リファクタリングWFへの分岐は行わない。
