# AIDE → Claude Code (superpowers形式) 完全マッピング表

## 1. AIDEの全ファイル構成

### 1.1 agents/*.md — カスタムエージェント定義（43ファイル）

| # | ファイル名 | name | description（要約） | tools | 行数 |
|---|---|---|---|---|---|
| 1 | bugfix-analyzer.md | bugfix-analyzer | バグ原因分析。設計書・コードの現状把握と原因特定 | read, write, shell | 76 |
| 2 | bugfix-designer.md | bugfix-designer | バグ修正差分設計。リグレッションテスト設計含む | read, write | 57 |
| 3 | bugfix-planner.md | bugfix-planner | バグ修正方針確定。ユーザーに修正方法を説明 | read, write | 54 |
| 4 | bugfix-reporter.md | bugfix-reporter | バグ報告ヒアリング。症状・再現手順・期待動作を聞き出す | read, write | 51 |
| 5 | change-approach-planner.md | change-approach-planner | 対応方針策定。OCP原則に基づき変更方法を決定 | read, write | 64 |
| 6 | change-delta-designer.md | change-delta-designer | 差分設計。before→after形式で変更内容を明記 | read, write | 63 |
| 7 | change-doc-syncer.md | change-doc-syncer | 設計書反映。差分設計を既存設計書にマージ | read, write | 52 |
| 8 | change-impact-analyzer.md | change-impact-analyzer | 影響範囲分析（軽量版） | read, write | 48 |
| 9 | change-impact-reviewer.md | change-impact-reviewer | 影響範囲再検討。差分設計後の再調査 | read, write | 51 |
| 10 | change-requirements.md | change-requirements | 変更要件定義。ユーザーの変更要求をヒアリング | read, write | 48 |
| 11 | change-status-checker.md | change-status-checker | 現状把握。設計書とコードの整合性確認 | read | 45 |
| 12 | change-task-planner.md | change-task-planner | 差分タスクリスト作成 | read, write | 47 |
| 13 | code-review-agent.md | code-review-agent | コード品質レビュー（命名、SOLID、エラーハンドリング等） | read | 82 |
| 14 | ddd-modeler.md | ddd-modeler | DDDモデラー。ユビキタス言語・ドメイン層設計 | read, write | 77 |
| 15 | design-qa-agent.md | design-qa-agent | 設計QA。品質基準を満たさない設計の承認を拒否 | read | 268 |
| 16 | design-review-agent.md | design-review-agent | 設計準拠レビュー。設計書との整合性検証 | read | 79 |
| 17 | development-planner.md | development-planner | 開発計画アーキテクト。実現性検討・開発計画書作成 | read, write | 37 |
| 18 | doc-completion-delegator.md | doc-completion-delegator | 設計書完成デリゲーター。未完了設計書を逆引きで完成 | read, write, shell | 46 |
| 19 | git-committer.md | git-committer | gitコミット。コミットメッセージ自動生成・ユーザー確認 | read, shell | 66 |
| 20 | micro-impl-agent.md | micro-impl-agent | マイクロ実装。1タスク単位で実装+テストを書く | read, write, shell | 142 |
| 21 | object-designer.md | object-designer | オブジェクトデザイナー。SOLID原則に基づくクラス設計 | read, write | 105 |
| 22 | proposal-reviewer.md | proposal-reviewer | 企画書レビュー。10観点×5段階スコアリング | read, write | 102 |
| 23 | proposal-writer.md | proposal-writer | 企画書ライター。開発企画書の作成・更新 | read, write | 114 |
| 24 | refactoring-analyzer.md | refactoring-analyzer | リファクタリング対象特定 | read, write | 61 |
| 25 | refactoring-designer.md | refactoring-designer | リファクタリング差分設計 | read, write | 58 |
| 26 | refactoring-planner.md | refactoring-planner | リファクタリング方針確定 | read, write | 58 |
| 27 | refactoring-status-checker.md | refactoring-status-checker | リファクタリング現状把握。テスト全実行 | read, shell | 60 |
| 28 | reverse-architecture.md | reverse-architecture | アーキテクチャ逆引き | read, write, shell | 39 |
| 29 | reverse-dev-environment.md | reverse-dev-environment | 開発環境逆引き | read, write, shell | 35 |
| 30 | reverse-gui-design.md | reverse-gui-design | GUI設計逆引き | read, write, shell | 37 |
| 31 | reverse-infra-interface.md | reverse-infra-interface | インフラIF逆引き | read, write, shell | 36 |
| 32 | reverse-object-design.md | reverse-object-design | オブジェクト設計逆引き | read, write, shell | 38 |
| 33 | reverse-program-structure.md | reverse-program-structure | プログラム構成逆引き | read, write, shell | 42 |
| 34 | reverse-system-requirements.md | reverse-system-requirements | システム要件逆引き | read, write, shell | 35 |
| 35 | reverse-user-requirements.md | reverse-user-requirements | ユーザー要件逆引き | read, write, shell | 35 |
| 36 | source-material-organizer.md | source-material-organizer | 資料読み込み・構造化 | read, write | 47 |
| 37 | system-architecture-designer.md | system-architecture-designer | システム構成設計 | read, write | 53 |
| 38 | system-requirements-architect.md | system-requirements-architect | システム要件情報収集 | read, write, web | 51 |
| 39 | tech-investigator.md | tech-investigator | 技術調査。Web検索で実現可能性を調査 | read, write, web | 61 |
| 40 | usecase-improver.md | usecase-improver | ユースケース改善 | read, write | 51 |
| 41 | usecase-lister.md | usecase-lister | ユースケースリストアップ | read, write | 78 |
| 42 | usecase-process-analyzer.md | usecase-process-analyzer | ユースケース実現プロセス分析 | read, write | 48 |
| 43 | usecase-usability-evaluator.md | usecase-usability-evaluator | ユースケースユーザビリティ評価 | read, write | 54 |
| 44 | user-requirements-architect.md | user-requirements-architect | ユーザー要件ヒアリング | read, write | 65 |

**合計: 43ファイル、2,830行**


### 1.2 steering/*.md — ステアリングファイル（58ファイル）

#### 1.2.1 常時読み込み（inclusion: always）— 2ファイル

| # | ファイル名 | inclusion | 内容 | 行数 |
|---|---|---|---|---|
| 1 | orchestrator-index.md | always | オーケストレーター選択ガイド + 生成ドキュメント一覧 | 145 |
| 2 | global-rules.md | always | グローバルルール（フェーズ省略禁止、実作業禁止、敬語等） | 157 |

**小計: 2ファイル、302行**

#### 1.2.2 オーケストレーター（inclusion: manual）— 7ファイル

| # | ファイル名 | inclusion | 内容 | 行数 |
|---|---|---|---|---|
| 1 | agent-planning-orchestrator.md | manual | 企画オーケストレーター | 418 |
| 2 | agent-design-orchestrator.md | manual | 設計オーケストレーター | 513 |
| 3 | agent-impl-orchestrator.md | manual | 実装オーケストレーター | 658 |
| 4 | agent-reverse-design-orchestrator.md | manual | 設計逆引きオーケストレーター | 385 |
| 5 | agent-change-orchestrator.md | manual | 変更オーケストレーター | 822 |
| 6 | agent-refactoring-orchestrator.md | manual | リファクタリングオーケストレーター | 699 |
| 7 | agent-bugfix-orchestrator.md | manual | バグ修正オーケストレーター | 796 |

**小計: 7ファイル、4,291行**

#### 1.2.3 サブエージェント手順書（inclusion: manual）— 44ファイル

| # | ファイル名 | inclusion | 対応エージェント | 行数 |
|---|---|---|---|---|
| 1 | agent-bugfix-analyzer.md | manual | bugfix-analyzer | 113 |
| 2 | agent-bugfix-designer.md | manual | bugfix-designer | 105 |
| 3 | agent-bugfix-planner.md | manual | bugfix-planner | 124 |
| 4 | agent-bugfix-reporter.md | manual | bugfix-reporter | 61 |
| 5 | agent-change-approach-planner.md | manual | change-approach-planner | 107 |
| 6 | agent-change-delta-designer.md | manual | change-delta-designer | 129 |
| 7 | agent-change-doc-syncer.md | manual | change-doc-syncer | 78 |
| 8 | agent-change-impact-analyzer.md | manual | change-impact-analyzer | 91 |
| 9 | agent-change-impact-reviewer.md | manual | change-impact-reviewer | 97 |
| 10 | agent-change-requirements.md | manual | change-requirements | 58 |
| 11 | agent-change-status-checker.md | manual | change-status-checker | 67 |
| 12 | agent-change-task-planner.md | manual | change-task-planner | 97 |
| 13 | agent-ddd-review.md | manual | design-qa-agent（DDDレビュー観点） | 80 |
| 14 | agent-design-review.md | manual | design-qa-agent（設計妥当性検証） | 86 |
| 15 | agent-doc-completion-delegator.md | manual | doc-completion-delegator | 40 |
| 16 | agent-feasibility-review.md | manual | development-planner（実現性検討） | 59 |
| 17 | agent-git-committer.md | manual | git-committer | 147 |
| 18 | agent-gui-design.md | manual | object-designer（GUI設計） | 56 |
| 19 | agent-impl-design-sync.md | manual | （設計同期・軌道修正、専用エージェントなし） | 65 |
| 20 | agent-impl-planner.md | manual | （実装プランナー、専用エージェントなし） | 190 |
| 21 | agent-impl-review-design.md | fileMatch: src/**/* | design-review-agent（設計準拠検証） | 159 |
| 22 | agent-impl-review-errors.md | fileMatch: src/**/* | code-review-agent（エラーハンドリング検証） | 149 |
| 23 | agent-impl-review-imports.md | fileMatch: src/**/* | code-review-agent（importルール検証） | 48 |
| 24 | agent-impl-review-quality.md | fileMatch: src/**/* | code-review-agent（コード品質検証） | 215 |
| 25 | agent-impl-review-tests.md | fileMatch: src/**/* | design-review-agent（テスト網羅性検証） | 120 |
| 26 | agent-infra-interface-design.md | manual | object-designer（インフラIF設計） | 73 |
| 27 | agent-layered-architecture.md | manual | ddd-modeler（レイヤードアーキテクチャ設計） | 116 |
| 28 | agent-object-design.md | manual | object-designer + ddd-modeler（オブジェクト設計） | 93 |
| 29 | agent-planning-orchestrator.md | — | （オーケストレーター、上記1.2.2に記載） | — |
| 30 | agent-program-structure.md | manual | object-designer（プログラム構成） | 74 |
| 31 | agent-readme-generator.md | manual | （README生成、専用エージェントなし） | 66 |
| 32 | agent-refactoring-analyzer.md | manual | refactoring-analyzer | 109 |
| 33 | agent-refactoring-designer.md | manual | refactoring-designer | 135 |
| 34 | agent-refactoring-planner.md | manual | refactoring-planner | 94 |
| 35 | agent-refactoring-status-checker.md | manual | refactoring-status-checker | 55 |
| 36 | agent-reverse-architecture.md | manual | reverse-architecture | 88 |
| 37 | agent-reverse-dev-environment.md | manual | reverse-dev-environment | 101 |
| 38 | agent-reverse-gui-design.md | manual | reverse-gui-design | 102 |
| 39 | agent-reverse-infra-interface.md | manual | reverse-infra-interface | 90 |
| 40 | agent-reverse-object-design.md | manual | reverse-object-design | 109 |
| 41 | agent-reverse-program-structure.md | manual | reverse-program-structure | 250 |
| 42 | agent-reverse-system-requirements.md | manual | reverse-system-requirements | 88 |
| 43 | agent-reverse-user-requirements.md | manual | reverse-user-requirements | 96 |
| 44 | agent-system-architecture.md | manual | system-architecture-designer | 155 |
| 45 | agent-system-requirements.md | manual | system-requirements-architect | 113 |
| 46 | agent-usecase-improver.md | manual | usecase-improver | 98 |
| 47 | agent-usecase-lister.md | manual | usecase-lister | 111 |
| 48 | agent-usecase-process-analyzer.md | manual | usecase-process-analyzer | 53 |
| 49 | agent-usecase-usability-evaluator.md | manual | usecase-usability-evaluator | 57 |
| 50 | agent-user-requirements.md | manual | user-requirements-architect | 61 |

**注**: #21〜25 は `inclusion: fileMatch`（src/**/* パターン）。残りは `inclusion: manual`。
**注**: #29 はオーケストレーターのため1.2.2に記載済み。実質49ファイル。

**小計: 49ファイル（オーケストレーター7を除く）、4,797行**

#### 1.2.4 fileMatch ステアリング — 5ファイル

| # | ファイル名 | fileMatchPattern | 内容 | 行数 |
|---|---|---|---|---|
| 1 | agent-impl-review-design.md | src/**/* | 設計準拠検証ルール | 159 |
| 2 | agent-impl-review-errors.md | src/**/* | エラーハンドリング検証ルール | 149 |
| 3 | agent-impl-review-imports.md | src/**/* | importルール検証ルール | 48 |
| 4 | agent-impl-review-quality.md | src/**/* | コード品質検証ルール | 215 |
| 5 | agent-impl-review-tests.md | src/**/* | テスト網羅性検証ルール | 120 |

**小計: 5ファイル、691行**

### 1.3 その他のファイル

| # | ファイル | 内容 | 行数 |
|---|---|---|---|
| 1 | workspace/AGENTS.md | プロジェクトルートに配置するエージェント作業ルール | 53 |
| 2 | AGENTS.md（リポジトリルート） | workspace/AGENTS.md と同内容 | 71 |


---

## 2. エージェントとステアリングの対応関係

### 2.1 オーケストレーター別サブエージェント呼び出し一覧

#### 企画オーケストレーター（agent-planning-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| フェーズ0 | （オーケストレーター自身） | — | ✅ 初期ヒアリング |
| フェーズ1 | proposal-writer | — | ❌ |
| フェーズ2 | source-material-organizer | — | ❌ |
| フェーズ2 | tech-investigator | — | ❌ |
| フェーズ2 | proposal-writer（update） | — | ❌ |
| フェーズ2 | proposal-reviewer | — | ❌ |
| フェーズ3 | proposal-reviewer（final） | — | ❌ |

#### 設計オーケストレーター（agent-design-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| フェーズ1 | user-requirements-architect | agent-user-requirements.md | ✅ ヒアリング |
| フェーズ2 | system-requirements-architect | agent-system-requirements.md | ✅ ヒアリング |
| フェーズ3 | development-planner | agent-feasibility-review.md | ✅ 合意 |
| QAゲート1 | design-qa-agent | — | ❌ |
| フェーズ4 | system-architecture-designer | agent-system-architecture.md | ✅ 合意 |
| フェーズ5 | object-designer（GUI） | agent-gui-design.md | ✅ 合意 |
| フェーズ6-① | usecase-lister | agent-usecase-lister.md | ✅ 確認 |
| フェーズ6-② | usecase-process-analyzer | agent-usecase-process-analyzer.md | ❌ |
| フェーズ6-③ | usecase-usability-evaluator | agent-usecase-usability-evaluator.md | ❌ |
| フェーズ6-④ | usecase-improver | agent-usecase-improver.md | ✅ 合意 |
| フェーズ7 | ddd-modeler | agent-layered-architecture.md | ✅ 合意 |
| QAゲート2 | design-qa-agent | agent-ddd-review.md, agent-design-review.md | ❌ |
| フェーズ8 | ddd-modeler（domain） | agent-object-design.md | ❌ |
| フェーズ8 | object-designer（app/infra/pres） | agent-object-design.md | ✅ 合意 |
| QAゲート3 | design-qa-agent | — | ❌ |
| フェーズ9 | object-designer（インフラIF） | agent-infra-interface-design.md | ✅ 合意 |
| フェーズ10 | object-designer（プログラム構成） | agent-program-structure.md | ✅ 合意 |
| QAゲート4 | design-qa-agent | — | ❌ |

#### 実装オーケストレーター（agent-impl-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| プランナー | （ステアリングのみ） | agent-impl-planner.md | ❌ |
| 実装ループ | micro-impl-agent | — | ❌ |
| 実装ループ | design-review-agent | agent-impl-review-design.md | ❌ |
| 実装ループ | code-review-agent | agent-impl-review-quality.md, agent-impl-review-errors.md, agent-impl-review-imports.md, agent-impl-review-tests.md | ❌ |
| 設計同期 | （ステアリングのみ） | agent-impl-design-sync.md | ❌ |
| README生成 | （ステアリングのみ） | agent-readme-generator.md | ❌ |
| gitコミット | git-committer | agent-git-committer.md | ✅ 承認 |

#### 設計逆引きオーケストレーター（agent-reverse-design-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| フェーズ1 | reverse-program-structure | agent-reverse-program-structure.md | ✅ 合意 |
| フェーズ2 | reverse-dev-environment | agent-reverse-dev-environment.md | ✅ 合意 |
| フェーズ3 | reverse-system-requirements | agent-reverse-system-requirements.md | ✅ 合意 |
| フェーズ4 | reverse-user-requirements | agent-reverse-user-requirements.md | ✅ ヒアリング+合意 |
| フェーズ5（opt） | reverse-architecture | agent-reverse-architecture.md | ✅ 合意 |
| フェーズ6（opt） | reverse-object-design | agent-reverse-object-design.md | ✅ 合意 |
| フェーズ7（opt） | reverse-infra-interface | agent-reverse-infra-interface.md | ✅ 合意 |
| フェーズ8（opt） | reverse-gui-design | agent-reverse-gui-design.md | ✅ 合意 |
| gitコミット | git-committer | agent-git-committer.md | ✅ 承認 |

#### 変更オーケストレーター（agent-change-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| ゲート | change-status-checker | agent-change-status-checker.md | ❌ |
| （未完了時） | doc-completion-delegator | agent-doc-completion-delegator.md | ✅ |
| フェーズ0 | change-status-checker | agent-change-status-checker.md | ✅ 提案 |
| フェーズ1 | change-requirements | agent-change-requirements.md | ✅ ヒアリング |
| フェーズ2 | change-impact-analyzer | agent-change-impact-analyzer.md | ❌ |
| フェーズ3 | change-approach-planner | agent-change-approach-planner.md | ✅ 合意 |
| フェーズ4 | change-delta-designer | agent-change-delta-designer.md | ✅ 合意 |
| フェーズ5 | design-qa-agent | — | ❌ |
| フェーズ6 | change-impact-reviewer | agent-change-impact-reviewer.md | ✅ 合意 |
| フェーズ7 | change-task-planner | agent-change-task-planner.md | ✅ 合意 |
| フェーズ8 | micro-impl-agent + design-review-agent + code-review-agent | （実装オーケストレーターと同様） | ❌ |
| フェーズ8（同期） | （ステアリングのみ） | agent-impl-design-sync.md | ❌ |
| フェーズ9 | change-doc-syncer | agent-change-doc-syncer.md | ✅ 確認 |
| gitコミット | git-committer | agent-git-committer.md | ✅ 承認 |

#### リファクタリングオーケストレーター（agent-refactoring-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| ゲート | change-status-checker | agent-change-status-checker.md | ❌ |
| （未完了時） | doc-completion-delegator | agent-doc-completion-delegator.md | ✅ |
| フェーズ0 | refactoring-status-checker | agent-refactoring-status-checker.md | ✅ 提案 |
| フェーズ1 | refactoring-analyzer | agent-refactoring-analyzer.md | ✅ 合意 |
| フェーズ2 | refactoring-planner | agent-refactoring-planner.md | ✅ 合意 |
| フェーズ3 | refactoring-designer | agent-refactoring-designer.md | ✅ 合意 |
| QAゲート | design-qa-agent | — | ❌ |
| フェーズ4 | micro-impl-agent + design-review-agent + code-review-agent | （実装オーケストレーターと同様） | ❌ |
| フェーズ5 | change-doc-syncer | agent-change-doc-syncer.md | ✅ 確認 |
| gitコミット | git-committer | agent-git-committer.md | ✅ 承認 |

#### バグ修正オーケストレーター（agent-bugfix-orchestrator.md）

| フェーズ | サブエージェント | ステアリング | ユーザー対話 |
|---|---|---|---|
| ゲート | change-status-checker | agent-change-status-checker.md | ❌ |
| （未完了時） | doc-completion-delegator | agent-doc-completion-delegator.md | ✅ |
| フェーズ1 | bugfix-reporter | agent-bugfix-reporter.md | ✅ ヒアリング |
| フェーズ2 | bugfix-analyzer | agent-bugfix-analyzer.md | ✅ やり取り |
| フェーズ3 | bugfix-planner | agent-bugfix-planner.md | ✅ 合意 |
| フェーズ4 | bugfix-designer | agent-bugfix-designer.md | ✅ 合意 |
| フェーズ4-QA | design-qa-agent | — | ❌ |
| フェーズ5 | micro-impl-agent + design-review-agent + code-review-agent | （実装オーケストレーターと同様） | ❌ |
| フェーズ5（同期） | （ステアリングのみ） | agent-impl-design-sync.md | ❌ |
| フェーズ6 | change-doc-syncer | agent-change-doc-syncer.md | ✅ 確認 |
| gitコミット | git-committer | agent-git-committer.md | ✅ 承認 |

### 2.2 ユーザー対話が必要なサブエージェント一覧

以下のサブエージェントは `userInput` を使ってユーザーと直接対話する:

| # | エージェント | 対話の種類 | 呼び出し元 |
|---|---|---|---|
| 1 | user-requirements-architect | ヒアリング（要件聞き出し） | 設計 |
| 2 | system-requirements-architect | ヒアリング（技術要件） | 設計 |
| 3 | development-planner | 合意取得 | 設計 |
| 4 | bugfix-reporter | ヒアリング（バグ症状） | バグ修正 |
| 5 | bugfix-analyzer | やり取り（原因追跡） | バグ修正 |
| 6 | bugfix-planner | 合意取得（修正方針） | バグ修正 |
| 7 | bugfix-designer | 合意取得（差分設計） | バグ修正 |
| 8 | change-requirements | ヒアリング（変更要求） | 変更 |
| 9 | change-approach-planner | 合意取得（方針） | 変更 |
| 10 | change-delta-designer | 合意取得（差分設計） | 変更 |
| 11 | change-impact-reviewer | 合意取得（影響範囲） | 変更 |
| 12 | change-task-planner | 合意取得（タスクリスト） | 変更 |
| 13 | change-doc-syncer | 確認（反映内容） | 変更/バグ修正/リファクタリング |
| 14 | change-status-checker | 提案（逆引き実行） | 変更/バグ修正/リファクタリング |
| 15 | refactoring-status-checker | 提案（テスト失敗時） | リファクタリング |
| 16 | refactoring-analyzer | 合意取得 | リファクタリング |
| 17 | refactoring-planner | 合意取得 | リファクタリング |
| 18 | refactoring-designer | 合意取得 | リファクタリング |
| 19 | reverse-* (全8エージェント) | 合意取得（成果物確認） | 設計逆引き |
| 20 | usecase-lister | 確認（UC一覧） | 設計 |
| 21 | usecase-improver | 合意取得 | 設計 |
| 22 | git-committer | 承認（コミット内容） | 全オーケストレーター |
| 23 | doc-completion-delegator | ヒアリング（逆引き中） | 変更/バグ修正/リファクタリング |


---

## 3. superpowers形式へのマッピング表

### 3.1 基盤ファイル（常時読み込み）

| # | AIDEのファイル | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 1 | steering/orchestrator-index.md | inclusion: always | CLAUDE.md（圧縮版） | ルール圧縮 | ~50行 | オーケストレーター選択ロジックを圧縮。ドキュメント一覧は各スキルに分散 |
| 2 | steering/global-rules.md | inclusion: always | CLAUDE.md（圧縮版） | ルール圧縮 | ~40行 | フェーズ省略禁止、実作業禁止、敬語等のコアルールを圧縮 |
| 3 | workspace/AGENTS.md | ワークスペースルール | CLAUDE.md（圧縮版） | ルール圧縮 | ~30行 | オーケストレーター経由必須、ステアリング確認等 |

**CLAUDE.md 合計見積: ~120行**

### 3.2 オーケストレーター → スキル化

| # | AIDEのファイル | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 4 | steering/agent-planning-orchestrator.md | オーケストレーター | skills/planning-orchestrator/SKILL.md | スキル化 | ~420行 | フェーズ管理ロジック + 呼び出しテンプレート |
| 5 | steering/agent-design-orchestrator.md | オーケストレーター | skills/design-orchestrator/SKILL.md | スキル化 | ~520行 | 10フェーズ + 4QAゲート |
| 6 | steering/agent-impl-orchestrator.md | オーケストレーター | skills/impl-orchestrator/SKILL.md | スキル化 | ~660行 | 実装ループ + レビュー体制 |
| 7 | steering/agent-reverse-design-orchestrator.md | オーケストレーター | skills/reverse-design-orchestrator/SKILL.md | スキル化 | ~390行 | コア4フェーズ + オプション4フェーズ |
| 8 | steering/agent-change-orchestrator.md | オーケストレーター | skills/change-orchestrator/SKILL.md | スキル化 | ~830行 | 10フェーズ + QAゲート + 実装ループ |
| 9 | steering/agent-refactoring-orchestrator.md | オーケストレーター | skills/refactoring-orchestrator/SKILL.md | スキル化 | ~700行 | 6フェーズ + QAゲート + 実装ループ |
| 10 | steering/agent-bugfix-orchestrator.md | オーケストレーター | skills/bugfix-orchestrator/SKILL.md | スキル化 | ~800行 | 7フェーズ + QAゲート + 実装ループ |

**スキル（オーケストレーター）合計: 7スキル、~4,320行**

### 3.3 サブエージェント → エージェント定義（agents/*.md + steering/agent-*.md 統合）

#### 3.3.1 企画プロセス（4エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 11 | agents/source-material-organizer.md | サブエージェント | .claude/agents/source-material-organizer.md | 統合 | ~50行 | ステアリングなし（エージェント定義のみ） |
| 12 | agents/tech-investigator.md | サブエージェント | .claude/agents/tech-investigator.md | 統合 | ~65行 | ステアリングなし。web tool使用 |
| 13 | agents/proposal-writer.md | サブエージェント | .claude/agents/proposal-writer.md | 統合 | ~115行 | ステアリングなし |
| 14 | agents/proposal-reviewer.md | サブエージェント | .claude/agents/proposal-reviewer.md | 統合 | ~105行 | ステアリングなし |

#### 3.3.2 設計プロセス（11エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 15 | agents/user-requirements-architect.md + steering/agent-user-requirements.md | サブエージェント | .claude/agents/user-requirements-architect.md | 統合 | ~130行 | ユーザー対話あり |
| 16 | agents/system-requirements-architect.md + steering/agent-system-requirements.md | サブエージェント | .claude/agents/system-requirements-architect.md | 統合 | ~170行 | ユーザー対話あり。web tool使用 |
| 17 | agents/development-planner.md + steering/agent-feasibility-review.md | サブエージェント | .claude/agents/development-planner.md | 統合 | ~100行 | ユーザー対話あり |
| 18 | agents/system-architecture-designer.md + steering/agent-system-architecture.md | サブエージェント | .claude/agents/system-architecture-designer.md | 統合 | ~210行 | ユーザー対話あり |
| 19 | agents/object-designer.md + steering/agent-gui-design.md + agent-object-design.md + agent-infra-interface-design.md + agent-program-structure.md | サブエージェント | .claude/agents/object-designer.md | 統合 | ~400行 | 複数ステアリングを統合。ユーザー対話あり |
| 20 | agents/usecase-lister.md + steering/agent-usecase-lister.md | サブエージェント | .claude/agents/usecase-lister.md | 統合 | ~190行 | ユーザー対話あり |
| 21 | agents/usecase-process-analyzer.md + steering/agent-usecase-process-analyzer.md | サブエージェント | .claude/agents/usecase-process-analyzer.md | 統合 | ~105行 | |
| 22 | agents/usecase-usability-evaluator.md + steering/agent-usecase-usability-evaluator.md | サブエージェント | .claude/agents/usecase-usability-evaluator.md | 統合 | ~115行 | |
| 23 | agents/usecase-improver.md + steering/agent-usecase-improver.md | サブエージェント | .claude/agents/usecase-improver.md | 統合 | ~150行 | ユーザー対話あり |
| 24 | agents/ddd-modeler.md + steering/agent-layered-architecture.md + agent-ddd-review.md | サブエージェント | .claude/agents/ddd-modeler.md | 統合 | ~275行 | DDDレビュー観点も統合 |
| 25 | agents/design-qa-agent.md + steering/agent-design-review.md + agent-ddd-review.md | サブエージェント | .claude/agents/design-qa-agent.md | 統合 | ~435行 | 設計QA + 設計妥当性 + DDDレビュー |

#### 3.3.3 設計逆引きプロセス（8エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 26 | agents/reverse-program-structure.md + steering/agent-reverse-program-structure.md | サブエージェント | .claude/agents/reverse-program-structure.md | 統合 | ~295行 | ユーザー対話あり |
| 27 | agents/reverse-dev-environment.md + steering/agent-reverse-dev-environment.md | サブエージェント | .claude/agents/reverse-dev-environment.md | 統合 | ~140行 | ユーザー対話あり |
| 28 | agents/reverse-system-requirements.md + steering/agent-reverse-system-requirements.md | サブエージェント | .claude/agents/reverse-system-requirements.md | 統合 | ~125行 | ユーザー対話あり |
| 29 | agents/reverse-user-requirements.md + steering/agent-reverse-user-requirements.md | サブエージェント | .claude/agents/reverse-user-requirements.md | 統合 | ~135行 | ユーザー対話あり |
| 30 | agents/reverse-architecture.md + steering/agent-reverse-architecture.md | サブエージェント | .claude/agents/reverse-architecture.md | 統合 | ~130行 | ユーザー対話あり |
| 31 | agents/reverse-object-design.md + steering/agent-reverse-object-design.md | サブエージェント | .claude/agents/reverse-object-design.md | 統合 | ~150行 | ユーザー対話あり |
| 32 | agents/reverse-infra-interface.md + steering/agent-reverse-infra-interface.md | サブエージェント | .claude/agents/reverse-infra-interface.md | 統合 | ~130行 | ユーザー対話あり |
| 33 | agents/reverse-gui-design.md + steering/agent-reverse-gui-design.md | サブエージェント | .claude/agents/reverse-gui-design.md | 統合 | ~140行 | ユーザー対話あり |

#### 3.3.4 変更プロセス（8エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 34 | agents/change-status-checker.md + steering/agent-change-status-checker.md | サブエージェント | .claude/agents/change-status-checker.md | 統合 | ~115行 | ユーザー対話あり |
| 35 | agents/change-requirements.md + steering/agent-change-requirements.md | サブエージェント | .claude/agents/change-requirements.md | 統合 | ~110行 | ユーザー対話あり |
| 36 | agents/change-impact-analyzer.md + steering/agent-change-impact-analyzer.md | サブエージェント | .claude/agents/change-impact-analyzer.md | 統合 | ~140行 | |
| 37 | agents/change-approach-planner.md + steering/agent-change-approach-planner.md | サブエージェント | .claude/agents/change-approach-planner.md | 統合 | ~175行 | ユーザー対話あり |
| 38 | agents/change-delta-designer.md + steering/agent-change-delta-designer.md | サブエージェント | .claude/agents/change-delta-designer.md | 統合 | ~195行 | ユーザー対話あり |
| 39 | agents/change-impact-reviewer.md + steering/agent-change-impact-reviewer.md | サブエージェント | .claude/agents/change-impact-reviewer.md | 統合 | ~150行 | ユーザー対話あり |
| 40 | agents/change-task-planner.md + steering/agent-change-task-planner.md | サブエージェント | .claude/agents/change-task-planner.md | 統合 | ~145行 | ユーザー対話あり |
| 41 | agents/change-doc-syncer.md + steering/agent-change-doc-syncer.md | サブエージェント | .claude/agents/change-doc-syncer.md | 統合 | ~135行 | ユーザー対話あり |

#### 3.3.5 バグ修正プロセス（4エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 42 | agents/bugfix-reporter.md + steering/agent-bugfix-reporter.md | サブエージェント | .claude/agents/bugfix-reporter.md | 統合 | ~115行 | ユーザー対話あり |
| 43 | agents/bugfix-analyzer.md + steering/agent-bugfix-analyzer.md | サブエージェント | .claude/agents/bugfix-analyzer.md | 統合 | ~190行 | ユーザー対話あり |
| 44 | agents/bugfix-planner.md + steering/agent-bugfix-planner.md | サブエージェント | .claude/agents/bugfix-planner.md | 統合 | ~180行 | ユーザー対話あり |
| 45 | agents/bugfix-designer.md + steering/agent-bugfix-designer.md | サブエージェント | .claude/agents/bugfix-designer.md | 統合 | ~165行 | ユーザー対話あり |

#### 3.3.6 リファクタリングプロセス（4エージェント）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 46 | agents/refactoring-status-checker.md + steering/agent-refactoring-status-checker.md | サブエージェント | .claude/agents/refactoring-status-checker.md | 統合 | ~120行 | ユーザー対話あり |
| 47 | agents/refactoring-analyzer.md + steering/agent-refactoring-analyzer.md | サブエージェント | .claude/agents/refactoring-analyzer.md | 統合 | ~175行 | ユーザー対話あり |
| 48 | agents/refactoring-planner.md + steering/agent-refactoring-planner.md | サブエージェント | .claude/agents/refactoring-planner.md | 統合 | ~155行 | ユーザー対話あり |
| 49 | agents/refactoring-designer.md + steering/agent-refactoring-designer.md | サブエージェント | .claude/agents/refactoring-designer.md | 統合 | ~195行 | ユーザー対話あり |

#### 3.3.7 共通エージェント（4エージェント + ステアリング専用3）

| # | AIDEのファイル（統合元） | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 50 | agents/micro-impl-agent.md | サブエージェント | .claude/agents/micro-impl-agent.md | 統合 | ~145行 | ステアリングなし |
| 51 | agents/design-review-agent.md + steering/agent-impl-review-design.md + agent-impl-review-tests.md | サブエージェント | .claude/agents/design-review-agent.md | 統合 | ~360行 | 設計準拠 + テスト網羅性 |
| 52 | agents/code-review-agent.md + steering/agent-impl-review-quality.md + agent-impl-review-errors.md + agent-impl-review-imports.md | サブエージェント | .claude/agents/code-review-agent.md | 統合 | ~495行 | 品質 + エラー + import |
| 53 | agents/doc-completion-delegator.md + steering/agent-doc-completion-delegator.md | サブエージェント | .claude/agents/doc-completion-delegator.md | 統合 | ~90行 | ユーザー対話あり |
| 54 | agents/git-committer.md + steering/agent-git-committer.md | サブエージェント | .claude/agents/git-committer.md | 統合 | ~215行 | ユーザー対話あり |
| 55 | steering/agent-impl-design-sync.md | ステアリング専用 | .claude/agents/impl-design-sync.md | 新規エージェント化 | ~70行 | 対応するagents/*.mdなし |
| 56 | steering/agent-impl-planner.md | ステアリング専用 | .claude/agents/impl-planner.md | 新規エージェント化 | ~195行 | 対応するagents/*.mdなし |
| 57 | steering/agent-readme-generator.md | ステアリング専用 | .claude/agents/readme-generator.md | 新規エージェント化 | ~70行 | 対応するagents/*.mdなし |

### 3.4 fileMatch ステアリング → レビュールール統合

| # | AIDEのファイル | 種別 | Claude Code での配置先 | 変換方法 | 行数見積 | 備考 |
|---|---|---|---|---|---|---|
| 58 | steering/agent-impl-review-design.md | fileMatch: src/**/* | design-review-agent に統合済み（#51） | 統合 | — | |
| 59 | steering/agent-impl-review-errors.md | fileMatch: src/**/* | code-review-agent に統合済み（#52） | 統合 | — | |
| 60 | steering/agent-impl-review-imports.md | fileMatch: src/**/* | code-review-agent に統合済み（#52） | 統合 | — | |
| 61 | steering/agent-impl-review-quality.md | fileMatch: src/**/* | code-review-agent に統合済み（#52） | 統合 | — | |
| 62 | steering/agent-impl-review-tests.md | fileMatch: src/**/* | design-review-agent に統合済み（#51） | 統合 | — | |

**注**: fileMatch ステアリングは Claude Code では自動トリガーの仕組みがないため、対応するレビューエージェント定義に統合する。


---

## 4. 実現性の確認ポイント

### 4.1 CLAUDE.md に含める内容のサイズ見積もり

| 内容 | 行数見積 |
|---|---|
| オーケストレーター選択ロジック（orchestrator-index.md 圧縮版） | ~50行 |
| グローバルルール（global-rules.md 圧縮版） | ~40行 |
| ワークスペースルール（AGENTS.md 圧縮版） | ~30行 |
| **合計** | **~120行** |

**判定: ✅ 実現可能**
- Claude Code の CLAUDE.md は数百行程度が推奨。120行は十分に収まる。
- 元の302行（orchestrator-index.md + global-rules.md）+ 53行（AGENTS.md）= 355行を約1/3に圧縮。
- ドキュメント一覧（orchestrator-index.md の大部分）は各オーケストレータースキルに移動するため大幅に削減可能。

### 4.2 スキルの総数と各スキルのサイズ見積もり

| スキル名 | 元ファイル | 行数見積 |
|---|---|---|
| planning-orchestrator | agent-planning-orchestrator.md | ~420行 |
| design-orchestrator | agent-design-orchestrator.md | ~520行 |
| impl-orchestrator | agent-impl-orchestrator.md | ~660行 |
| reverse-design-orchestrator | agent-reverse-design-orchestrator.md | ~390行 |
| change-orchestrator | agent-change-orchestrator.md | ~830行 |
| refactoring-orchestrator | agent-refactoring-orchestrator.md | ~700行 |
| bugfix-orchestrator | agent-bugfix-orchestrator.md | ~800行 |
| **合計** | **7スキル** | **~4,320行** |

**判定: ⚠️ 要検討**
- 各スキルは400〜830行。Claude Code のスキルとしては大きめだが、オーケストレーターの呼び出しテンプレートを含むため必然的にこのサイズになる。
- 特に change-orchestrator（830行）と bugfix-orchestrator（800行）は大きい。呼び出しテンプレート部分を別ファイルに分離する等の工夫が必要かもしれない。
- superpowers の SKILL.md は読み込み時にコンテキストに展開されるため、大きすぎるとコンテキスト圧迫の懸念がある。

### 4.3 サブエージェント定義の総数と各定義のサイズ見積もり

| カテゴリ | エージェント数 | 平均行数 | 合計行数 |
|---|---|---|---|
| 企画プロセス | 4 | ~85行 | ~335行 |
| 設計プロセス | 11 | ~210行 | ~2,280行 |
| 設計逆引きプロセス | 8 | ~155行 | ~1,245行 |
| 変更プロセス | 8 | ~145行 | ~1,165行 |
| バグ修正プロセス | 4 | ~165行 | ~650行 |
| リファクタリングプロセス | 4 | ~160行 | ~645行 |
| 共通エージェント | 7 | ~235行 | ~1,640行 |
| **合計** | **46** | — | **~7,960行** |

**注**: 43のカスタムエージェント + 3のステアリング専用（impl-design-sync, impl-planner, readme-generator）= 46エージェント

**判定: ✅ 実現可能**
- Claude Code の `.claude/agents/` にはファイル数の制限はない。
- 各エージェント定義は90〜500行程度で、Claude Code のエージェント定義として適切なサイズ。
- エージェント定義はサブエージェント呼び出し時にのみ読み込まれるため、コンテキスト圧迫の問題は少ない。

### 4.4 ユーザー対話が必要なサブエージェントの一覧（エスカレーションパターンが必要なもの）

Claude Code のサブエージェント（`Task` ツール）はユーザーと直接対話できない。以下のエージェントはエスカレーションパターンが必要。

#### 対話パターン別分類

**パターンA: ヒアリング型（複数回のやり取りが必要）**

| # | エージェント | 対話内容 | 対応方針 |
|---|---|---|---|
| 1 | user-requirements-architect | 要件ヒアリング（目的と手段の分離） | オーケストレーターが事前にヒアリングし、結果をプロンプトで渡す |
| 2 | system-requirements-architect | 技術要件ヒアリング | 同上 |
| 3 | bugfix-reporter | バグ症状ヒアリング | 同上 |
| 4 | bugfix-analyzer | 原因追跡中のやり取り | 分析結果をオーケストレーターに返し、追加質問が必要ならオーケストレーターが仲介 |
| 5 | change-requirements | 変更要求ヒアリング | オーケストレーターが事前にヒアリングし、結果をプロンプトで渡す |
| 6 | reverse-user-requirements | コード解析結果の確認+補完 | 同上 |

**パターンB: 合意取得型（成果物提示→承認）**

| # | エージェント | 対話内容 | 対応方針 |
|---|---|---|---|
| 7 | development-planner | 開発計画の合意 | サブエージェントが成果物を作成→オーケストレーターがユーザーに提示→合意後に次フェーズ |
| 8 | bugfix-planner | 修正方針の合意 | 同上 |
| 9 | bugfix-designer | 差分設計の合意 | 同上 |
| 10 | change-approach-planner | 対応方針の合意 | 同上 |
| 11 | change-delta-designer | 差分設計の合意 | 同上 |
| 12 | change-impact-reviewer | 影響範囲の合意 | 同上 |
| 13 | change-task-planner | タスクリストの合意 | 同上 |
| 14 | refactoring-analyzer | 候補一覧の合意 | 同上 |
| 15 | refactoring-planner | 方針の合意 | 同上 |
| 16 | refactoring-designer | 差分設計の合意 | 同上 |
| 17 | reverse-* (全8エージェント) | 成果物の合意 | 同上 |
| 18 | usecase-lister | UC一覧の確認 | 同上 |
| 19 | usecase-improver | 改善提案の合意 | 同上 |

**パターンC: 承認型（簡易確認）**

| # | エージェント | 対話内容 | 対応方針 |
|---|---|---|---|
| 20 | git-committer | コミット内容の承認 | オーケストレーターがコミット内容を提示→承認後にコミット実行 |
| 21 | change-doc-syncer | 反映内容の確認 | 同上 |
| 22 | change-status-checker | 逆引き実行の提案 | オーケストレーターが判断結果を提示→ユーザー判断 |

**エスカレーション実装方針:**
- **パターンA**: オーケストレーター（スキル）がユーザーとのヒアリングを担当し、収集した情報をサブエージェントのプロンプトに含めて渡す。サブエージェントは受け取った情報をもとに成果物を作成する。
- **パターンB**: サブエージェントが成果物を作成して返す→オーケストレーターがユーザーに提示→ユーザーが修正要求した場合はサブエージェントを再呼び出し。
- **パターンC**: オーケストレーターが直接ユーザーに確認し、結果に基づいてサブエージェントを呼び出す。

### 4.5 変換が困難または不可能なファイルの一覧

| # | ファイル | 困難な理由 | 対応方針 |
|---|---|---|---|
| 1 | steering/agent-impl-review-*.md（5ファイル） | `inclusion: fileMatch` はClaude Codeに対応する仕組みがない | レビューエージェント定義に統合。自動トリガーは諦め、オーケストレーターからの明示的呼び出しで代替 |
| 2 | 全オーケストレーターの `invokeSubAgent` 呼び出しテンプレート | Kiro の `invokeSubAgent` はClaude Code の `Task` ツールに対応するが、呼び出しプロトコルが異なる | テンプレートを `Task` ツール形式に書き換え。プロンプト構造は維持可能 |
| 3 | `userInput` を使うサブエージェント（23エージェント） | Claude Code のサブエージェント（Task）はユーザーと直接対話できない | エスカレーションパターンで対応（4.4参照） |
| 4 | steering/global-rules.md の「禁止ツール一覧」 | Kiro固有のツール名（fsWrite, strReplace等）がClaude Codeでは異なる | Claude Code のツール名（Write, Edit等）に読み替え |
| 5 | steering/global-rules.md の「OS判定ルール」 | Kiro の `executePwsh` はClaude Code の `Bash` ツールに対応 | Bash ツール前提に書き換え |
| 6 | steering/orchestrator-index.md のファイルパス参照 | `~/.kiro/steering/` パスはClaude Codeでは `.claude/` に変わる | パス参照を `.claude/` ベースに書き換え |
| 7 | steering/agent-git-committer.md | Kiro の `executePwsh` でgit操作 → Claude Code では `Bash` ツール | ツール名の読み替えのみ。ロジックは維持可能 |

**判定: ✅ 全て対応可能**
- 変換不可能なファイルはない。全て何らかの方法で対応可能。
- 最も工数がかかるのは「ユーザー対話パターンの変換」（23エージェント分のエスカレーションロジック設計）。

---

## 5. 全体サマリー

### 5.1 ファイル数サマリー

| カテゴリ | AIDE（元） | Claude Code（変換後） |
|---|---|---|
| 常時読み込みルール | 2 steering + 1 AGENTS.md | 1 CLAUDE.md |
| オーケストレーター | 7 steering | 7 skills/*/SKILL.md |
| サブエージェント定義 | 43 agents + 49 steering = 92ファイル | 46 .claude/agents/*.md |
| fileMatch ステアリング | 5 steering | （レビューエージェントに統合） |
| **合計** | **104ファイル** | **54ファイル** |

### 5.2 行数サマリー

| カテゴリ | AIDE（元） | Claude Code（変換後見積） |
|---|---|---|
| CLAUDE.md | — | ~120行 |
| スキル（オーケストレーター） | 4,291行 | ~4,320行 |
| エージェント定義 | 2,830行（agents）+ 4,797行（steering）= 7,627行 | ~7,960行 |
| **合計** | **~12,220行** | **~12,400行** |

**注**: 変換後の行数が若干増えるのは、agents/*.md と steering/agent-*.md を統合する際にセクション見出し等が追加されるため。

### 5.3 変換の優先順位（推奨）

| 優先度 | 対象 | 理由 |
|---|---|---|
| 1 | CLAUDE.md（基盤ルール） | 全体の動作基盤。最初に作成すべき |
| 2 | change-orchestrator + 関連エージェント | 最も使用頻度が高い（既存コードへの変更） |
| 3 | bugfix-orchestrator + 関連エージェント | 次に使用頻度が高い |
| 4 | impl-orchestrator + 共通エージェント | 実装ループは変更・バグ修正でも使用 |
| 5 | refactoring-orchestrator + 関連エージェント | 変更オーケストレーターから引き継ぎ可能 |
| 6 | reverse-design-orchestrator + 関連エージェント | 設計書がない場合に必要 |
| 7 | design-orchestrator + 関連エージェント | 新規プロジェクト用 |
| 8 | planning-orchestrator + 関連エージェント | アイデア段階用（使用頻度低） |

### 5.4 ステアリング専用ファイル（対応するagents/*.mdがないもの）

以下の3ファイルは steering/ にのみ存在し、対応する agents/*.md がない:

| # | ステアリングファイル | 用途 | 対応方針 |
|---|---|---|---|
| 1 | agent-impl-design-sync.md | 設計同期・軌道修正 | 新規エージェント定義として .claude/agents/impl-design-sync.md を作成 |
| 2 | agent-impl-planner.md | 実装プランナー | 新規エージェント定義として .claude/agents/impl-planner.md を作成 |
| 3 | agent-readme-generator.md | README生成 | 新規エージェント定義として .claude/agents/readme-generator.md を作成 |

### 5.5 1つのエージェントに複数ステアリングが対応するケース

| エージェント | 対応ステアリング | 統合方針 |
|---|---|---|
| object-designer | agent-gui-design.md, agent-object-design.md, agent-infra-interface-design.md, agent-program-structure.md | モード別セクションとして1ファイルに統合 |
| ddd-modeler | agent-layered-architecture.md, agent-ddd-review.md | レイヤード設計 + DDDレビュー観点を統合 |
| design-qa-agent | agent-design-review.md, agent-ddd-review.md | ゲート別セクションとして統合 |
| design-review-agent | agent-impl-review-design.md, agent-impl-review-tests.md | 設計準拠 + テスト網羅性を統合 |
| code-review-agent | agent-impl-review-quality.md, agent-impl-review-errors.md, agent-impl-review-imports.md | 品質 + エラー + importを統合 |
| development-planner | agent-feasibility-review.md | 実現性検討ルールを統合 |
