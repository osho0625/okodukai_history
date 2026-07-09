# docs-dev/ 章間レビュー結果

作成日: 2025-01-15
レビュー対象: docs-dev/ 配下の全ファイル（00-overview.md / 01-system-platform/ 配下 9 ファイル / 02-ai-agent/ 配下 16 ファイル / 03-how-to/ 配下 5 ファイル、計 31 ファイル）
辞書: .aide/specs/aide-powers/ubiquitous-language.md

## 重大度判定基準
- 高: ドキュメントの読者がフレームワークを誤認識・誤動作させる可能性が高い
- 中: 読みづらさや表記の不統一感を生む
- 低: 軽微な揺れ・体裁の問題

## 1. 用語ブレ

### 1.1 ubiquitous-language.md 違反

| # | 検出箇所（ファイル:行/節） | 違反内容 | 正式名称 | 重大度 |
| --- | --- | --- | --- | --- |
| 1.1.1 | 02-ai-agent/01-workflows/02-design.md:§QA ゲートの構造 表 | 「担当 QA エージェント」と省略表記 | QAレビューアーエージェント | 中 |
| 1.1.2 | 02-ai-agent/01-workflows/05-change.md:§ゲート 差分設計 QA 表 / §委譲する共通エージェント節 | 「QA エージェント」と省略表記が複数箇所 | QAレビューアーエージェント | 中 |
| 1.1.3 | 02-ai-agent/01-workflows/06-bugfix.md:§ゲート 差分設計 QA 節 | 「QA エージェント」と省略表記 | QAレビューアーエージェント | 中 |
| 1.1.4 | 02-ai-agent/01-workflows/07-refactoring.md:§ゲート 差分設計 QA 節 | 「QA エージェント」と省略表記 | QAレビューアーエージェント | 中 |
| 1.1.5 | 02-ai-agent/04-agents/qa-agents.md:§共通の判定基準節 / §design-qa-dispatch 説明 | 「QA エージェント」と省略表記が頻出 | QAレビューアーエージェント | 中 |
| 1.1.6 | 02-ai-agent/03-common-skills/infrastructure.md:§design-qa-dispatch 節「追加の QA エージェントを呼ぶ」「ゲート位置に対応するエージェントを呼ぶ」 | 「QA エージェント」と省略表記 | QAレビューアーエージェント | 中 |
| 1.1.7 | 00-overview.md:§3 構成要素の俯瞰の表 | 「（QAレビューアーエージェントの計 8 名）」とあり、ホワイトリスト3エージェントを含む 8 名が QAレビューアーエージェント扱いになっている誤記 | 「QAレビューアーエージェント・実装系エージェントの計 8 名」 | 高 |
| 1.1.8 | 02-ai-agent/04-agents/00-overview.md:§全エージェント一覧 表ヘッダ | 「micro-impl-agent ... 5モード」の説明が辞書定義（マイクロ実装の粒度）と完全一致しない簡略表記 | 1サブタスク=1呼び出し=1ファイル=最大1publicメソッド の粒度宣言を辞書に揃える | 低 |

### 1.2 表記揺れ

| # | 概念 | 表記A（箇所） | 表記B（箇所） | 推奨統一 | 重大度 |
| --- | --- | --- | --- | --- | --- |
| 1.2.1 | ホワイトリスト3エージェント | 「ホワイトリスト3エージェント」（ubiquitous-language.md §4 が定義） | 「ホワイトリスト 3 エージェント」（02-ai-agent/04-agents/00-overview.md / 02-ai-agent/01-workflows/03-impl.md / 02-ai-agent/02-phase-skills/impl.md / 04-agents/implementation-agents.md など） | 辞書通り「ホワイトリスト3エージェント」（半角空白なし） | 中 |
| 1.2.2 | 数字の前後の空白 | 「7 つの」「7 ワークフロー」（00-overview.md §1, §4 / 02-ai-agent/00-overview.md） | 「7ワークフロー」（01-system-platform/04-skill-map.md §1 タイトル, §3） | docs-dev/ 全体で空白あり/なしを統一（推奨：辞書に従い「7ワークフロー」） | 中 |
| 1.2.3 | グローバル領域 | 「グローバル領域（`~/.kiro/`, `~/.claude/`, `~/.copilot/` 等）」（00-overview.md §1 / 02-ai-agent/02-phase-skills/00-overview.md §配置） | 「グローバルエリア（`~/.kiro/skills/`、`~/.claude/skills/` 等）」（01-system-platform/01-hub-skill-activation.md §8） | ubiquitous-language §11「グローバルインストール（ホームディレクトリ配下）」/§4「グローバルエリア」を踏まえ、配置先を指す場合は「グローバルエリア」、行為を指す場合は「グローバルインストール」 | 中 |
| 1.2.4 | 企画書 | 「開発企画書（planning-proposal.md）」（00-overview.md §4 / 02-ai-agent/00-overview.md §7ワークフロー / 02-ai-agent/01-workflows/01-planning.md §タイトル） | 「企画書」（02-ai-agent/02-phase-skills/planning.md / 03-how-to/release.md など） | 辞書 §12「企画書（企画ワークフローの成果物 planning-proposal.md）」に合わせて「企画書」で統一（または初出のみ「開発企画書（planning-proposal.md）」と冗長表記しその後は「企画書」） | 中 |
| 1.2.5 | フェーズ番号の前後の空白 | 「フェーズ 4」「ゲート 1」「ステージ 1a」（02-ai-agent/01-workflows/02-design.md ほか chapter 2 全般） | 「フェーズ4」「ゲート1」（00-overview.md / 一部の他章） | docs-dev/ 全体で空白あり/なしを統一（推奨：「フェーズ4」） | 低 |
| 1.2.6 | フェーズスキル数の集計 | 「フェーズスキル 45」（01-system-platform/04-skill-map.md §7 集計） | 「実体は8件（QAレビューアー5件 + ホワイトリスト3エージェント）」（01-system-platform/06-execution-units.md §3） | 同じ章内で集計値の根拠が示されない。集計の責務を1か所（推奨：04-skill-map.md）に集約 | 低 |
| 1.2.7 | プラットフォーム別配置先表現 | 「`~/.kiro/skills/`」「`~/.claude/skills/`」（多くの章で記載） | 「`%USERPROFILE%\.kiro\skills\`」（03-how-to/add-phase-skill.md §動作確認） | プラットフォーム標記をワークスペース・パス区切り（POSIX/Windows）で統一する方針を導入 | 低 |
| 1.2.8 | カウント表記 | 「2 件」（00-overview.md / 04-skill-map.md §2） | 「2件」 | 数値+助数詞は半角空白なしで統一推奨 | 低 |

### 1.3 禁止用語の混入

| # | 検出箇所 | 禁止用語 | 推奨表現 | 重大度 |
| --- | --- | --- | --- | --- |
| 1.3.1 | 検出なし | — | — | — |

> 注: 03-how-to/add-common-skill.md §2 の「Manager / Handler / Util 等の汎用接尾辞は禁止」、03-how-to/add-agent.md §2 の「✗ `code-handler` → ✓ `code-review-agent`」、02-ai-agent/04-agents/qa-agents.md §object-design-qa-agent の「`~Manager` 等の技術命名混入禁止」は、いずれも禁止例として教示する文脈で出現しており、辞書 §13 の禁止用語混入には該当しない。



## 2. 重複

### 2.1 章をまたぐ重複

| # | 内容 | 箇所A | 箇所B | 推奨対応 | 重大度 |
| --- | --- | --- | --- | --- | --- |
| 2.1.1 | 7 ワークフローの一覧表（用途・エントリポイント） | 00-overview.md:§4「7 つのワークフロー」 表 | 02-ai-agent/00-overview.md:§7 つのワークフロー 表 + 02-ai-agent/01-workflows/00-overview.md:§ワークフロー一覧 表 + 01-system-platform/04-skill-map.md:§3 表 | 章2が一次情報。章0は1〜2行の要約とリンクに留める。01-system-platform/04-skill-map.md は機構面（スキル数集計）に絞り、用途列・エントリポイント列の重複を削減 | 高 |
| 2.1.2 | プラットフォーム別配置先一覧（`.kiro/steering/` 等） | 00-overview.md:§5 対応プラットフォーム 表 | 01-system-platform/00-architecture.md:§3 全体図 + 01-system-platform/02-multiplatform.md:§7 ルールファイル形式 表 + 01-system-platform/05-dynamic-rules.md:§3.2 配置先 表 + 01-system-platform/03-platform-bootstrap/各ファイル | 章0は要点のみ。詳細は 01-system-platform/02-multiplatform §7 + 05-dynamic-rules §3.2 + 03-platform-bootstrap/ に1か所ずつ集約。00-overview の表は最小化 | 高 |
| 2.1.3 | Quick Routing テーブル（ユーザー発話 → エントリポイント） | 02-ai-agent/00-overview.md:§7 つのワークフロー（用途列が Quick Routing 相当） | 01-system-platform/01-hub-skill-activation.md:§4 Quick Routing 表 | 機構面（どこに同じテーブルが書かれているか）は 01-system-platform/01 が一次。02-ai-agent では再掲せずリンクに留める | 中 |
| 2.1.4 | 多段階コードレビューの3エージェント体制とパイプライン記述 | 02-ai-agent/01-workflows/03-impl.md:§多段階コードレビュー 詳細擬似フロー | 02-ai-agent/03-common-skills/impl.md:§multi-stage-code-review 同擬似フロー（ほぼ同文） + 02-ai-agent/02-phase-skills/impl.md:§fs-impl-execution + 02-ai-agent/04-agents/00-overview.md | 03-common-skills/impl.md（共通スキル本体）を一次情報とし、ワークフロー側は1〜2行で参照に留める | 高 |
| 2.1.5 | 4 つのQAゲート（ゲート1〜4の対応エージェント） | 02-ai-agent/01-workflows/02-design.md:§QA ゲートの構造 表 | 02-ai-agent/02-phase-skills/design.md:§QA ゲートの位置 表 + 02-ai-agent/04-agents/qa-agents.md:§各QAエージェント | ワークフロー側で位置と役割を簡潔に提示し、判定観点の詳細は 04-agents/qa-agents.md に集約。02-phase-skills/design.md の同表は除去または短縮 | 中 |
| 2.1.6 | 各ワークフローの「連携する共通スキル」「委譲する共通エージェント」一覧 | 02-ai-agent/01-workflows/01〜07*.md（各ワークフロー） | 02-ai-agent/02-phase-skills/各ワークフロー.md（同フェーズスキル） | 「01-workflows」を一次情報とし、02-phase-skills 側は各フェーズの責務（メインプロセス）に絞る。「連携する共通スキル」セクションは 01-workflows のみに残す | 中 |
| 2.1.7 | rules-distribute の global / skill モード説明 | 01-system-platform/05-dynamic-rules.md:§2 2つのモード〜§4 skill モードの動作 | 01-system-platform/01-hub-skill-activation.md:§3.STEP 3 + 02-ai-agent/03-common-skills/infrastructure.md:§rules-distribute | 05-dynamic-rules を一次情報とし、他章はリンク誘導に留める。03-common-skills/infrastructure.md §rules-distribute も詳細を削り「詳細は 第1章 §05-dynamic-rules を参照」に短縮 | 中 |
| 2.1.8 | DDD 採用判断・ドメインモデル貧血症などのオブジェクト設計指針 | 02-ai-agent/01-workflows/02-design.md:§QA ゲートの構造 + 02-ai-agent/02-phase-skills/design.md:§fs-design-phase7-ddd / fs-design-phase8-object | 02-ai-agent/03-common-skills/design.md:§ddd-modeling / object-design + 02-ai-agent/04-agents/qa-agents.md:§object-design-qa-agent | 観点の正本は 03-common-skills/design.md と 04-agents/qa-agents.md。フェーズスキル側は委譲先の役割に絞る | 中 |
| 2.1.9 | 設計書ゲート（PASS / FAIL 判定基準） | 02-ai-agent/01-workflows/03-impl.md:§設計書ゲート + 02-ai-agent/01-workflows/05-change.md:§設計書ゲート + 02-ai-agent/01-workflows/06-bugfix.md:§設計書ゲート + 02-ai-agent/01-workflows/07-refactoring.md:§設計書ゲート + 02-ai-agent/02-phase-skills/impl.md:§fs-impl-gate / 02-ai-agent/02-phase-skills/change.md / 02-ai-agent/02-phase-skills/bugfix.md / 02-ai-agent/02-phase-skills/refactoring.md | 02-ai-agent/03-common-skills/infrastructure.md:§design-gate | 03-common-skills/infrastructure.md §design-gate を一次情報とし、他章は1〜2行に短縮 | 中 |
| 2.1.10 | Iron Law の繰り返し列挙（同じルールが複数ファイルに散在） | 02-ai-agent/01-workflows/03-impl.md / 05-change.md / 06-bugfix.md / 07-refactoring.md（各§Iron Law） | 02-ai-agent/02-phase-skills/impl.md / change.md / bugfix.md / refactoring.md（各フェーズの§Iron Law） | ワークフロー総括は 01-workflows、フェーズ単位の Iron Law は 02-phase-skills とすみ分け、文面の重複（同じ箇条書きの再掲）を削減 | 中 |
| 2.1.11 | 配布物のフォルダ構成（skills/ agents/ hooks/ steering/ instructions/ .claude-plugin/ などの俯瞰） | 00-overview.md:§3 構成要素の俯瞰 ツリー + §3 役割表 | 01-system-platform/00-architecture.md:§3 全体図 + 01-system-platform/06-execution-units.md:§1 リポジトリ構成 | 機構面の正本は 01-system-platform/06-execution-units.md。00-overview と 01-system-platform/00-architecture.md は要点のみに留める | 中 |
| 2.1.12 | フェーズスキル命名規則 `fs-{workflow}-phase{N}-{name}` | 01-system-platform/04-skill-map.md:§1 / §3 | 02-ai-agent/02-phase-skills/00-overview.md:§命名規則 + 03-how-to/add-phase-skill.md:§3-1 / §3-2 / §3-3 | 02-phase-skills/00-overview.md を中身の一次情報、03-how-to/add-phase-skill.md を手順の一次情報、04-skill-map.md は機構観点の最小説明に絞る | 低 |

### 2.2 章内重複

| # | 内容 | 箇所A | 箇所B | 推奨対応 | 重大度 |
| --- | --- | --- | --- | --- | --- |
| 2.2.1 | 「他章への入口」「他章への導線」がほぼ同内容で2回記載 | 00-overview.md:§他章への入口（早見） 冒頭 | 00-overview.md:§他章への導線 末尾 | どちらか一方に統一（推奨：末尾の §他章への導線 のみ残す） | 低 |
| 2.2.2 | 第1章で同じ章境界注記が複数回 | 01-system-platform/00-architecture.md:§6 章間の責務分担 | 01-system-platform/02-multiplatform.md:§10 触ってはいけない領域との分離 + 01-system-platform/05-dynamic-rules.md:§10 章境界の確認 + 01-system-platform/06-execution-units.md:§14 章境界の確認 + 03-platform-bootstrap/README.md:§7 章境界の確認 | 各ファイル末尾の章境界注記は短文に統一し、表現の重複を減らす（リファレンスとして機能する最小形に） | 低 |
| 2.2.3 | 02-ai-agent/01-workflows/02-design.md 内 4 ゲート対応表 | §フェーズの流れ Mermaid 図 | §フェーズ一覧 表 + §QA ゲートの構造 表 + §委譲する共通エージェント 表 | 同一情報（ゲート位置と担当エージェント）が4回出現。表の重複を整理 | 中 |
| 2.2.4 | 02-ai-agent/04-agents/00-overview.md 内のホワイトリスト3エージェント記述 | §共通エージェントとは 直後 §全エージェント一覧 | §ホワイトリスト 3 エージェント 節 | 1か所（§ホワイトリスト3エージェント）に集約 | 低 |
| 2.2.5 | 02-ai-agent/01-workflows/05-change.md / 06-bugfix.md / 07-refactoring.md の差分設計QA説明 | 各§ゲート 差分設計 QA 表 | 各§委譲する共通エージェント 表 | 表が完全に冗長。§委譲する共通エージェント 表に集約 | 中 |

## 3. 責務境界の侵犯

### 3.1 00-overview の深入り

| # | 検出箇所 | 内容 | 本来の担当章 | 重大度 |
| --- | --- | --- | --- | --- |
| 3.1.1 | 00-overview.md:§3 構成要素の俯瞰（ツリー + 役割表） | 配布物（skills/ / agents/ / hooks/ / steering/ / instructions/ / .claude-plugin/ / .aide/references/ / setup.bat / setup-local.bat / cleanup-kiro-agent.bat / README.md / AGENTS.md / GEMINI.md）の詳細な役割解説をしている | 第1章 01-system-platform/06-execution-units.md | 高 |
| 3.1.2 | 00-overview.md:§5 対応プラットフォーム 表 | プラットフォーム別の動作方式・配置先（`~/.claude/hooks/`, `~/.kiro/steering/`, VSCode `agentPlugins/`, Codex `~/.agents/skills/aide-powers/` 等）を詳細列挙 | 第1章 01-system-platform/02-multiplatform.md および 03-platform-bootstrap/ | 高 |
| 3.1.3 | 00-overview.md:§4 7 つのワークフロー 表 | 用途・エントリポイントだけでなく「設計ワークフロー: ユーザー要件から始まり ... 10 フェーズを順に実施」など内訳まで踏み込んで記述 | 第2章 02-ai-agent/01-workflows/ | 中 |
| 3.1.4 | 00-overview.md:§2 何を解決するか | 「ハブスキル方式」「7 ワークフローへの分割」「プラットフォーム別ルール配布」と中核機構を3点で詳述（特に各プラットフォームの`.kiro/steering/`〜`AGENTS.md`まで列挙） | 第1章（機構の責務） | 中 |

### 3.2 01-system-platform から 02 への侵犯

| # | 検出箇所 | 内容 | 本来の担当章 | 重大度 |
| --- | --- | --- | --- | --- |
| 3.2.1 | 01-system-platform/04-skill-map.md:§3 フェーズスキル一覧（7ワークフロー × 各フェーズ） | 全ワークフローの全フェーズスキル一覧（45 件）を表で提示。エントリポイントマーク・順序まで記載 | 第2章 02-ai-agent/02-phase-skills/ および 02-ai-agent/01-workflows/ | 高 |
| 3.2.2 | 01-system-platform/04-skill-map.md:§4 共通スキル一覧 | 24 件の共通スキル名と「役割」を表で詳述（design-gate / multi-stage-code-review / git-commit-workflow ほか） | 第2章 02-ai-agent/03-common-skills/ | 高 |
| 3.2.3 | 01-system-platform/04-skill-map.md:§5 メタスキル一覧 §6 サブエージェント | rules-distribute / task-orchestration / 各 QA / micro-impl-agent などの役割を詳述 | 第2章 02-ai-agent/03-common-skills/ および 04-agents/ | 高 |
| 3.2.4 | 01-system-platform/05-dynamic-rules.md:§4.2 抽出する範囲（## The Iron Law / ## ルール / ## 完了条件 / ## 禁止事項） | スキルの SKILL.md セクション構造に踏み込んでいる | 第2章 02-ai-agent/02-phase-skills/00-overview.md:§SKILL.md の共通構造 | 中 |
| 3.2.5 | 01-system-platform/06-execution-units.md:§3 agents/ — サブエージェント定義 | 「QAレビューアー5件 + ホワイトリスト3エージェント」と中身分類を提示。実体8件 | 第2章 02-ai-agent/04-agents/ | 中 |
| 3.2.6 | 01-system-platform/01-hub-skill-activation.md:§4 Quick Routing | 「ユーザー発話の意図 → エントリポイントスキル」テーブルを全行掲載 | 第2章 02-ai-agent/01-workflows/00-overview.md（の Quick Routing 概観）と本来連携。第1章では存在の言及・メカニズムだけで足り、テーブル全文は第2章に集約推奨 | 中 |

### 3.3 02-ai-agent から 01 / 03 への侵犯

| # | 検出箇所 | 内容 | 本来の担当章 | 重大度 |
| --- | --- | --- | --- | --- |
| 3.3.1 | 02-ai-agent/03-common-skills/infrastructure.md:§rules-distribute（§2 メインプロセスの要点） | 「Kiro: `.kiro/steering/`、Claude Code: `.claude/rules/`、Cursor: `.cursor/rules/`、Copilot: `.github/instructions/`、Gemini: `GEMINI.md`、Codex / OpenCode: `AGENTS.md`」とプラットフォーム別配置先を再掲 | 第1章 01-system-platform/05-dynamic-rules.md | 中 |
| 3.3.2 | 02-ai-agent/02-phase-skills/00-overview.md:§配置 | 「`skills/{skill-name}/SKILL.md` ← スキル本体」「ワークスペース内に `skills/` フォルダがなくても、グローバル領域（`~/.kiro/skills/` 等）に...」など機構面の説明 | 第1章 01-system-platform/06-execution-units.md および 11 スキル所在ルール | 低 |
| 3.3.3 | 02-ai-agent/03-common-skills/infrastructure.md:§visual-companion §2 メインプロセスの要点「ローカル WebSocket サーバを起動し、ブラウザで図を表示して」 | スキル機構の実装手段に踏み込み、機構面の話 | 第1章（機構面）に部分的に該当。本来 visual-companion スキルの SKILL.md 直接参照に留める | 低 |
| 3.3.4 | 02-ai-agent/02-phase-skills/00-overview.md:§rules-distribute の skill モードを必ず呼ぶ | rules-distribute の動作機構を再説明（「プラットフォームのルールファイル機構に一時的に注入され、フェーズ実行中に常時参照される」） | 第1章 01-system-platform/05-dynamic-rules.md | 中 |
| 3.3.5 | 02-ai-agent/04-agents/00-overview.md:§サブエージェント委譲の原則 | ツール制限（frontmatter `tools`）・並列実行（`task-orchestration`）など機構詳細に近い記述 | 第1章 / 第3章（add-agent.md）に分担。本章は責務と中身に絞るべき | 低 |

### 3.4 03-how-to から 01 / 02 への侵犯

| # | 検出箇所 | 内容 | 本来の担当章 | 重大度 |
| --- | --- | --- | --- | --- |
| 3.4.1 | 03-how-to/add-agent.md:§3 agent.md の必須セクション §3-1〜3-9 | エージェント定義ファイルの内部構造を細目まで解説（frontmatter / 役割宣言 / REQUIRED SUB-SKILL / 担当範囲 / 入力 / プロセス / 出力 / 4ステータス / 行動規範） | 第2章 02-ai-agent/04-agents/ + add-agent.md は「やり方」だけのはずが、中身解説に踏み込んでいる | 中 |
| 3.4.2 | 03-how-to/add-common-skill.md:§3 SKILL.md の必須セクション §3-1〜3-10 | 共通スキル SKILL.md の内部構造（frontmatter / Iron Law / Red Flags / Common Rationalizations / Integration / グローバルルール参照）を詳述。第2章の「02-phase-skills/00-overview.md §SKILL.md の共通構造」と内容が重複 | 第2章 02-ai-agent/02-phase-skills/00-overview.md と整理。本書（第3章）は手順チェックリストに絞る | 中 |
| 3.4.3 | 03-how-to/add-phase-skill.md:§3 SKILL.md の必須セクション §3-1〜3-11 | 上記同様、フェーズスキルの SKILL.md 内部構造を詳細解説（Iron Law、Red Flags、Common Rationalizations、Integration、グローバルルール参照、章間の責務分担まで） | 第2章 02-ai-agent/02-phase-skills/00-overview.md にすでに記述あり。第3章は手順だけにする | 中 |
| 3.4.4 | 03-how-to/release.md:§3 バージョン番号付け（MAJOR/MINOR/PATCH 各該当例） | リリース手順だけでなく、aide-powers のバージョニング方針（「既存スキル名変更 / 既存ワークフロー削除 / 配置先ディレクトリ構造の破壊的変更」等の具体例）の記述あり | 第1章（機構観点の方針）または README に集約推奨。第3章はリリース手順そのものに絞る | 低 |
| 3.4.5 | 03-how-to/add-workflow.md:§5 Quick Routing への登録 §5-1〜5-3 | ハブスキル `using-aide-powers/SKILL.md`、`aide-powers-guide/SKILL.md`、`global-rules.md` の Quick Routing テーブル構造に深入り。テーブルの列名・内容を擬似 Markdown で示している | 第1章（Quick Routing の機構）と兼ねるが、構造詳細は 01-system-platform/01-hub-skill-activation.md にリンクし、本書は手順に絞る | 低 |
| 3.4.6 | 03-how-to/add-workflow.md:§4-1 フェーズ分割を決める / §4-3 進捗ファイルフォーマット定義 | 進捗ファイルフォーマット（フェーズ番号 / スキル名 / 状態列 / 完了日時列 / 成果物列）の構造を詳述 | 第1章 01-system-platform/06-execution-units.md または進捗ファイル定義ファイル `.aide/references/progress-file-format.md` の責務 | 低 |



## 4. その他検出事項

### 4.1 タスクトレイ管理アプリ関連
- **検出なし**。docs-dev/ 全 31 ファイルに `tray-app-planning`、トレイ、タスクトレイ等の混入は見当たらない。.aide/specs/aide-powers/tray-app-planning/ 配下の参照や、planning ワークフローで具体例として登場する記述もなし。

### 4.2 old/ 参照
- **検出なし**。docs-dev/ 全ファイルで `old/`、`session-handover-old.md` 等の旧資産参照はない（`session-handover-old.md` は ubiquitous-language.md §10 で定義されており、開発者向けドキュメントへの混入もなし）。

### 4.3 文体混在

| # | 検出箇所 | 内容 | 重大度 |
| --- | --- | --- | --- |
| 4.3.1 | docs-dev/ 全体 | docs-dev/ は基本的に「である」調（常体）で統一されている。一方、03-how-to/release.md §5 「ユーザー側の取り込み手順案内」のサブ説明（「利用エンジニアはこれをそのまま実行する。」）など、利用者向け文脈では「です・ます」調が混入する可能性がある書き方が散見されるが、現状はすべて「である」調で書かれており、明確な敬体混在は検出なし | 低 |
| 4.3.2 | 02-ai-agent/04-agents/implementation-agents.md:§micro-impl-agent §役割 「あなたは...です。」のような擬似 frontmatter 形式の引用（agents/{name}.md の内容例） | 本文は常体。引用は agents/ ファイル内の文体（敬体に近い宣言形）。文脈上は問題なし | 低 |

> 補足: docs-dev/ 全体を通じて、見出しは体言止め＋本文は「である」調で概ね一貫している。常体／敬体の意図しない混在は検出されなかった。

## 5. 集計

| カテゴリ | 高 | 中 | 低 | 計 |
| --- | --- | --- | --- | --- |
| 1.1 ubiquitous-language.md 違反 | 1 | 6 | 1 | 8 |
| 1.2 表記揺れ | 0 | 4 | 4 | 8 |
| 1.3 禁止用語の混入 | 0 | 0 | 0 | 0 |
| 2.1 章をまたぐ重複 | 3 | 8 | 1 | 12 |
| 2.2 章内重複 | 0 | 2 | 3 | 5 |
| 3.1 00-overview の深入り | 2 | 2 | 0 | 4 |
| 3.2 01 → 02 侵犯 | 3 | 3 | 0 | 6 |
| 3.3 02 → 01/03 侵犯 | 0 | 2 | 3 | 5 |
| 3.4 03 → 01/02 侵犯 | 0 | 3 | 3 | 6 |
| 4.1 タスクトレイ混入 | 0 | 0 | 0 | 0 |
| 4.2 old/ 参照 | 0 | 0 | 0 | 0 |
| 4.3 文体混在 | 0 | 0 | 2 | 2 |
| **合計** | **9** | **30** | **17** | **56** |

## 6. 高優先修正タスクの推奨グルーピング

高優先（重大度: 高）の検出 9 件を以下の 4 タスクに整理する。

### タスクA: 00-overview.md の責務範囲修正

- **該当検出**: 3.1.1（§3 構成要素の俯瞰の深入り）/ 3.1.2（§5 対応プラットフォーム表の深入り）/ 2.1.1（7 ワークフロー一覧表の重複）/ 2.1.2（プラットフォーム別配置先の重複）/ 2.1.11（配布物フォルダ構成の重複）/ 1.1.7（QAレビューアーエージェントと実装系エージェントの混同表記）
- **修正方針**:
  1. §3 構成要素の俯瞰のツリーと役割表を最小化（2〜3 行の概要 + 詳細リンクのみに圧縮）。詳細は 01-system-platform/06-execution-units.md へ誘導。
  2. §5 対応プラットフォーム表の動作方式・配置先列は削除し、列を「プラットフォーム」「詳細リンク」だけに簡素化。詳細は 01-system-platform/02-multiplatform.md と 03-platform-bootstrap/ へ誘導。
  3. §4 7 つのワークフロー表の説明列も簡素化（用途とエントリポイントのみ）。詳細は 02-ai-agent/01-workflows/ へ誘導。
  4. §3 「8 名」表記を「QAレビューアーエージェント 5 名 + 実装系エージェント 3 名の計 8 名」へ訂正。
  5. §他章への入口（早見）と §他章への導線 のうち末尾だけ残し冒頭は削除（または見出し変更で意図的な再掲を明示）。

### タスクB: 01-system-platform/04-skill-map.md の責務範囲修正

- **該当検出**: 3.2.1（フェーズスキル一覧の深入り）/ 3.2.2（共通スキル一覧の深入り）/ 3.2.3（メタスキル + サブエージェント一覧の深入り）/ 2.1.1（7 ワークフロー一覧の重複）/ 2.1.12（命名規則の重複）
- **修正方針**:
  1. §3 フェーズスキル一覧（45 件）を削除し、「ワークフロー数」「フェーズ総数」と各ワークフロー名のみのサマリ表に変更。詳細は 02-ai-agent/02-phase-skills/ へ誘導。
  2. §4 共通スキル一覧 / §5 メタスキル一覧 / §6 サブエージェント一覧から「役割」列を削除（または「分類」列に置き換え）。中身は 02-ai-agent/03-common-skills/ および 04-agents/ へ誘導。
  3. §7 集計（スキル数・分類別件数）はこの章の本来責務として残す。
  4. §1 命名規則は最小限の言及にとどめ、詳細は 02-ai-agent/02-phase-skills/00-overview.md と 03-how-to/add-phase-skill.md へ誘導。

### タスクC: 表記揺れの一括統一

- **該当検出**: 1.1.1〜1.1.6（QAレビューアーエージェントの省略表記が章2全体に散在 / すべて中重大度だが範囲が広い）/ 1.2.1（ホワイトリスト3エージェント）/ 1.2.2（数字+助数詞の空白）/ 1.2.3（グローバル領域 vs グローバルエリア）/ 1.2.4（企画書 vs 開発企画書）
- **修正方針**:
  1. ubiquitous-language.md §13 へ表記ルールの追補（数字+助数詞の空白方針、グローバル領域の正式名称、企画書の使い分け）を行ったうえで、docs-dev/ 全ファイルを grep して一括統一。
  2. 「QA エージェント」を「QAレビューアーエージェント」に置換（02-ai-agent/01-workflows/02-design.md / 05-change.md / 06-bugfix.md / 07-refactoring.md / 02-phase-skills/各ファイル / 03-common-skills/infrastructure.md / 04-agents/qa-agents.md）。
  3. 「ホワイトリスト 3 エージェント」を「ホワイトリスト3エージェント」に統一。
  4. 「7 ワークフロー」「7 つの」を「7ワークフロー」に統一（README.md と整合）。

### タスクD: 章をまたぐ重複の整理

- **該当検出**: 2.1.1（7 ワークフロー一覧）/ 2.1.2（プラットフォーム別配置先）/ 2.1.4（多段階コードレビューの3エージェント体制とパイプライン記述）
- **修正方針**:
  1. **多段階コードレビュー（最重要）**: 02-ai-agent/03-common-skills/impl.md §multi-stage-code-review を一次情報として確定。02-ai-agent/01-workflows/03-impl.md / 05-change.md / 06-bugfix.md / 07-refactoring.md の同擬似フローを「[多段階コードレビュー](../../03-common-skills/impl.md#multi-stage-code-review) を参照」に置換。02-ai-agent/02-phase-skills/各ファイルからもパイプライン詳細を削除し責務一覧に絞る。
  2. **7 ワークフロー一覧**: 02-ai-agent/01-workflows/00-overview.md を一次情報として確定。00-overview.md / 02-ai-agent/00-overview.md / 01-system-platform/04-skill-map.md の同表をリンク化。
  3. **プラットフォーム別配置先**: 01-system-platform/05-dynamic-rules.md §3.2 を一次情報として確定。00-overview.md / 02-multiplatform.md §7（重複部分）/ 03-common-skills/infrastructure.md §rules-distribute から詳細表を削除しリンク化。03-platform-bootstrap/ の各プラットフォーム別ファイルは個別ページとしての詳細責務を継続。

---

## 補足: 重大度高で本グルーピングに含まれない件

集計上の「高 9 件」は次の通り全て上記タスクに含まれている:

- 3.1.1, 3.1.2 → タスクA
- 3.2.1, 3.2.2, 3.2.3 → タスクB
- 1.1.7 → タスクA（00-overview の表訂正として吸収）
- 2.1.1, 2.1.2 → タスクA / D（章境界の修正と重複整理が表裏一体）
- 2.1.4 → タスクD

「高優先の検出はすべて §6 のいずれかのタスクに含まれている」という完了条件を満たしている。

