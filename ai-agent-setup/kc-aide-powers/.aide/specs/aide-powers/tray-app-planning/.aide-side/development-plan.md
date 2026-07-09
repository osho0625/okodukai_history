# 開発計画書: aide-powers

## 1. プロジェクト概要

### 1.1 目的

kiro版AIDEの構成ファイル群（agents/*.md + steering/*.md + AGENTS.md）を、superpowers形式のスキルベースプラグインに最適化再構成し、8プラットフォーム共通のAIDE本体とする。

### 1.2 スコープ

- 7つのオーケストレータースキルチェーン + 約47サブエージェント定義の再構成
- 8プラットフォーム対応（Claude Code, Codex CLI, Kiro, Cursor, OpenCode, Gemini CLI, Copilot CLI, VSCode GitHub Copilot）
- superpowersの5つの仕組み（4ステータス管理、Iron Law、ゲート関数、2段階レビュー、体系的デバッグ）の組み込み
- 社内限定配布の確立

### 1.3 対象ユーザー

社内の幅広いメンバー（非エンジニアも含む）

### 1.4 プロジェクトの特性

本プロジェクトはプログラム作成が主体ではなく、**スキル定義ファイル（SKILL.md）・エージェント定義ファイル（agents/*.md）・設定ファイル（plugin.json, hooks.json等）の再構成**が中心である。従来のソフトウェア開発プロセス（コーディング→テスト→デプロイ）とは異なり、Markdownベースの定義ファイルの設計・作成・検証が主要な作業となる。

## 2. 開発プロセス

### 2.1 開発手法

**PoC先行型の段階的再構成**

1. 企画・設計・実装の3オーケストレーターをPoCとして先行再構成
2. PoCの結果から開発専用Agent/SKILLの定義を確定
3. 確定した開発方法論で残りのオーケストレーターを順次再構成

### 2.2 開発方法論

設計オーケストレーターや実装オーケストレーターは使わず、**プロジェクト専用の開発Agent/SKILL**を用意して開発する。PoCの結果から開発専用Agent/SKILLの定義を確定する。

### 2.3 スキル作成方法

superpowersのwriting-skillsスキルの**TDDアプローチ**を採用:
- **RED**: ベースラインテスト（期待する動作の定義）
- **GREEN**: 最小限のスキル作成（テストを通す）
- **REFACTOR**: 抜け穴を塞ぐ（エッジケース対応、規律強化）

### 2.4 変換優先順位

```
planning → design → impl（PoC先行）→ CLAUDE.md → change → bugfix → refactoring → reverse
```

### 2.5 評価環境

VSCode GitHub Copilotで動作検証する（技術調査08で「最も統合しやすいプラットフォーム」と確認済み）。

## 3. フェーズ構成

### フェーズ1: PoC — 企画・設計・実装オーケストレーターの再構成

PoCの詳細は [poc-plan.md](./poc-plan.md) を参照。

#### 目標
- 企画・設計・実装の3オーケストレータースキルチェーンをsuperpowers形式で作成
- スキルチェーン間の遷移（企画完了→設計開始、設計完了→実装開始）の検証
- 開発専用Agent/SKILLの定義確定

#### 成果物
| 成果物 | 内容 |
|---|---|
| 企画オーケストレータースキルチェーン | ハブスキル + フェーズ0〜3スキル |
| 設計オーケストレータースキルチェーン | ハブスキル + フェーズ1〜10スキル + QAゲートスキル |
| 実装オーケストレータースキルチェーン | ハブスキル + タスク分解・実装ループ・ドキュメント生成スキル |
| 関連サブエージェント定義 | 企画4 + 設計11 + 実装3 + 共通1 = 約19エージェント |
| 開発専用Agent/SKILLの定義 | aide-powers全体の開発に使う開発方法論 |

#### 評価基準
1. 3つのスキルチェーンで新規プロジェクトの企画→設計→実装の一連フローを完遂できること
2. スキルチェーン間の遷移が正しく機能すること
3. 各オーケストレーターがkiro版AIDEと同等以上の成果物を生成できること
4. 開発専用Agent/SKILLで同等のスキルチェーンを作成・修正できること

### フェーズ2: CLAUDE.md / AGENTS.md + 基盤ファイルの作成

#### 目標
- aide-powersのグローバルルール（CLAUDE.md / AGENTS.md）を作成
- using-aide-powersメタスキル（オーケストレーター自動選択）を作成
- セッション開始フック（hooks/）を作成
- プラットフォーム固有設定ファイルを作成

#### 成果物
| 成果物 | 内容 |
|---|---|
| CLAUDE.md | グローバルルール（~120行）: フェーズ省略禁止、敬語ルール、オーケストレーター実作業禁止、using-aide-powersスキル呼び出し指示 |
| AGENTS.md | マルチプラットフォーム対応のエージェント設定 |
| using-aide-powers/SKILL.md | メタスキル: 7オーケストレーターへの振り分けロジック |
| hooks/ | session-start, hooks.json, hooks-cursor.json, run-hook.cmd |
| プラットフォーム固有設定 | .claude-plugin/, .cursor-plugin/, .codex/, .opencode/, .github/, GEMINI.md, gemini-extension.json |
| ツールマッピング | codex-tools.md, copilot-tools.md, gemini-tools.md, kiro-tools.md（新規） |

### フェーズ3: 変更オーケストレーターの再構成

#### 目標
- 変更オーケストレータースキルチェーンをsuperpowers形式で作成
- 関連サブエージェント定義の作成

#### 成果物
| 成果物 | 内容 |
|---|---|
| 変更オーケストレータースキルチェーン | ハブスキル + フェーズ0〜9スキル（~830行を分割） |
| 関連サブエージェント定義 | 8エージェント（change-status-checker, change-requirements, change-impact-analyzer, change-approach-planner, change-delta-designer, change-impact-reviewer, change-task-planner, change-doc-syncer） |

### フェーズ4: バグ修正オーケストレーターの再構成

#### 目標
- バグ修正オーケストレータースキルチェーンをsuperpowers形式で作成
- systematic-debuggingの4フェーズ + 3回失敗ルールの統合

#### 成果物
| 成果物 | 内容 |
|---|---|
| バグ修正オーケストレータースキルチェーン | ハブスキル + フェーズ1〜6スキル（~800行を分割） |
| 関連サブエージェント定義 | 4エージェント（bugfix-reporter, bugfix-analyzer, bugfix-planner, bugfix-designer） |

### フェーズ5: リファクタリングオーケストレーターの再構成

#### 目標
- リファクタリングオーケストレータースキルチェーンをsuperpowers形式で作成

#### 成果物
| 成果物 | 内容 |
|---|---|
| リファクタリングオーケストレータースキルチェーン | ハブスキル + フェーズ1〜5スキル（~700行を分割） |
| 関連サブエージェント定義 | 4エージェント（refactoring-status-checker, refactoring-analyzer, refactoring-planner, refactoring-designer） |

### フェーズ6: 設計逆引きオーケストレーターの再構成

#### 目標
- 設計逆引きオーケストレータースキルチェーンをsuperpowers形式で作成

#### 成果物
| 成果物 | 内容 |
|---|---|
| 設計逆引きオーケストレータースキルチェーン | ハブスキル + フェーズ1〜4スキル + オプションフェーズ（~390行を分割） |
| 関連サブエージェント定義 | 8エージェント（reverse-program-structure, reverse-dev-environment, reverse-system-requirements, reverse-user-requirements, reverse-architecture, reverse-object-design, reverse-infra-interface, reverse-gui-design） |

### フェーズ7: superpowersから継承するファイルの統合

#### 目標
- 「そのまま使う」25件のファイルをコピー
- 規律スキル（TDD, systematic-debugging, verification-before-completion）の統合
- ユーティリティスキル（dispatching-parallel-agents, receiving-code-review）の統合
- ビジュアルコンパニオン関連ファイルの統合

#### 成果物
| 成果物 | 内容 |
|---|---|
| 規律スキル | test-driven-development/, systematic-debugging/, verification-before-completion/ |
| ユーティリティスキル | dispatching-parallel-agents/, receiving-code-review/ |
| コラボレーションスキル | requesting-code-review/（書き換え済み）, receiving-code-review/（そのまま） |
| ビジュアルコンパニオン | brainstorming/scripts/, brainstorming/visual-companion.md |
| git関連 | using-git-worktrees/, finishing-a-development-branch/（書き換え済み） |
| 開発者向け | writing-skills/（書き換え済み + そのまま混在） |
| ルートファイル | .gitignore, .gitattributes, README.md |

### フェーズ8: 統合テスト・Kiroブートストラップ検証

#### 目標
- 全7オーケストレーターの通しテスト（VSCode GitHub Copilot）
- Claude Codeでの動作検証
- Kiroブートストラップ方式の3候補検証・確定
- 各プラットフォーム固有設定の動作確認

#### 成果物
| 成果物 | 内容 |
|---|---|
| テスト結果レポート | 各オーケストレーターの動作確認結果 |
| Kiroブートストラップ方式の確定 | 3候補から最適な方式を選定 |
| プラットフォーム別動作確認結果 | 8プラットフォームの対応状況 |

### フェーズ9: ドキュメント・配布整備

#### 目標
- README.mdの作成（8プラットフォーム対応のインストール手順）
- 再構成工程のドキュメント化（REQ-S02対応）
- 社内配布手順の確立
- チーム展開用の`.claude/settings.json`テンプレート作成

#### 成果物
| 成果物 | 内容 |
|---|---|
| README.md | インストール手順、使い方、プラットフォーム別設定 |
| 再構成工程ドキュメント | 設計判断・手順の記録 |
| 配布手順書 | 社内メンバー向けセットアップガイド |
| settings.jsonテンプレート | チーム展開用の自動プロンプト設定 |

## 4. 最終成果物

### 4.1 納品物一覧

| # | 成果物 | 受け入れ基準 |
|---|---|---|
| 1 | aide-powersプラグイン一式 | 7オーケストレーター + 約47サブエージェント + 規律/ユーティリティスキル + 設定ファイル |
| 2 | CLAUDE.md / AGENTS.md | ~120行以内。グローバルルールが正しく適用されること |
| 3 | using-aide-powersメタスキル | 7オーケストレーターの自動選択が正しく機能すること |
| 4 | 8プラットフォーム対応設定 | 各プラットフォームでインストール・起動できること |
| 5 | README.md + 配布手順書 | 社内メンバーが10分以内にインストール・初回実行できること |
| 6 | 再構成工程ドキュメント | 再構成の設計判断・手順が記録されていること |
| 7 | 開発専用Agent/SKILLの定義 | PoCの結果から確定した開発方法論 |

### 4.2 受け入れ基準（Must要件との対応）

| Must要件 | 受け入れ基準 |
|---|---|
| REQ-M01: 既存AIDEと同等以上の成果物生成 | 7オーケストレーター全てがkiro版AIDEと同等の成果物を生成 |
| REQ-M02: マルチプラットフォーム対応 | 8プラットフォームでオーケストレーターが起動し成果物が生成される |
| REQ-M03: superpowers形式への最適化再構成 | 全構成ファイルがsuperpowers形式に再構成されている |
| REQ-M04: superpowersの仕組みの取り込み | 5つの仕組みがプロセスに組み込まれている |
| REQ-M05: サブエージェントのユーザー対話維持 | フォアグラウンドサブエージェントでユーザー対話が機能する |
| REQ-M06: 社内限定配布 | プライベートGitリポジトリからの配布が確立されている |
| REQ-M07: 容易なインストールと初回実行 | インストールから初回実行まで10分以内 |
| REQ-M08: オーケストレーター自動選択 | using-aide-powersメタスキルで正しく自動選択される |
| REQ-M09: 設計品質保証の維持・強化 | design-qa-agentによるDDD・SOLID・QAゲートが機能する |
| REQ-M10: kiro専用AIDEの開発停止と移行 | aide-powersがkiro版AIDEの全機能を代替できる |
| REQ-M11: オーケストレーターの実作業禁止の維持 | オーケストレーターが読み取り専用で動作する |

## 5. 技術スタックまとめ

| 項目 | 技術 |
|---|---|
| スキルシステム | Agent Skills標準（agentskills.io）— SKILL.md + YAMLフロントマター |
| プラグイン配布 | superpowers形式プラグイン構造 |
| サブエージェント | 各プラットフォームのネイティブ機構（Task, spawn_agent, invokeSubAgent, runSubagent等） |
| ルール注入 | 3段階コンテキスト投入（セッション開始→タスク開始→サブエージェント派遣） |
| ファイル形式 | Markdown（YAMLフロントマター付き）、JSON（plugin.json, hooks.json）、Shell script |
| 規律パターン | Iron Law + 多層防御 + ゲート関数（IDENTIFY→RUN→READ→VERIFY→CLAIM） |
| 品質保証 | 4ステータス管理 + 2段階レビュー + design-qa-agent（DDD, SOLID） |
| デバッグ | systematic-debugging 4フェーズ + 3回失敗ルール |

## 6. 作業量の概観

### 6.1 superpowersファイルの分類（構成要素判定表より）

| 分類 | 件数 | 作業内容 |
|---|---|---|
| そのまま使う | 25件 | コピーのみ |
| 中身を差し替える | 30件 | AIDEのロジックに書き換え（中核作業） |
| 新規作成 | 1件 | kiro-tools.md |
| 不要 | 28件 | コピーしない |

### 6.2 オーケストレータースキルの規模見積もり

| スキル | 元ファイル行数見積 | フェーズスキル数 |
|---|---|---|
| using-aide-powers（メタスキル） | ~150行 | 1（単体） |
| planning-orchestrator | ~420行 | ハブ + 4フェーズ |
| design-orchestrator | ~520行 | ハブ + 10フェーズ + QAゲート |
| impl-orchestrator | ~660行 | ハブ + 3スキル |
| change-orchestrator | ~830行 | ハブ + 10フェーズ |
| bugfix-orchestrator | ~800行 | ハブ + 6フェーズ |
| refactoring-orchestrator | ~700行 | ハブ + 5フェーズ |
| reverse-design-orchestrator | ~390行 | ハブ + 4フェーズ + オプション |

### 6.3 サブエージェント定義の規模

| カテゴリ | エージェント数 |
|---|---|
| 企画プロセス | 4 |
| 設計プロセス | 11 |
| 実装プロセス | 3 |
| 設計逆引きプロセス | 8 |
| 変更プロセス | 8 |
| バグ修正プロセス | 4 |
| リファクタリングプロセス | 4 |
| 共通 | 約5（git-committer, design-review-agent, code-review-agent等） |
| **合計** | **約47** |

## 7. リスクと対策

### 7.1 技術的リスク

| ID | リスク | 影響度 | 対策 |
|---|---|---|---|
| RISK-01 | オーケストレータースキルのサイズ超過（change: ~830行, bugfix: ~800行） | 中 | 呼び出しテンプレートを別ファイルに分離。フェーズスキル分割で1ファイルあたりのサイズを抑制 |
| RISK-02 | スキルのdescription記述精度による誤選択 | 中 | CSO（Claude Search Optimization）: 「Use when...」形式でトリガー条件のみ記述。PoCで精度を検証 |
| RISK-03 | プラットフォーム間のツール名不一致 | 中 | 各プラットフォーム向けツールマッピングファイルを作成（codex-tools.md, copilot-tools.md, gemini-tools.md, kiro-tools.md） |
| RISK-04 | 長時間セッションでのコンテキスト圧迫 | 中 | サブエージェント委譲でメインコンテキスト節約。3段階コンテキスト投入で不要な情報を排除 |
| RISK-05 | 大量ファイル再構成時の品質低下 | 高 | TDDアプローチ（RED-GREEN-REFACTOR）で各スキルを作成。フェーズごとに検証 |
| RISK-06 | スキルチェーン間の自動遷移が未定義 | 中 | PoCで遷移パターンを検証し独自メカニズムを設計 |

### 7.2 プラットフォーム固有リスク

| ID | リスク | 影響度 | 対策 |
|---|---|---|---|
| RISK-07 | フォアグラウンドサブエージェントのリグレッション（Issue #34592） | 中 | バージョン固定で対応。公式ドキュメントの記述は変更なし |
| RISK-08 | Kiroのブートストラップ方式の不確定性 | 中 | 3候補を開発しながら並行検証。候補1（`inclusion: always`ステアリング）を最初の実装ターゲット |
| RISK-09 | Codex CLIのmulti_agentは実験的機能 | 中 | Claude Codeをメインターゲットとし追従対応 |
| RISK-10 | VSCode Agent Pluginsはpreview | 低 | スキル・エージェントの基本形式は安定。影響は配布方式に限定 |

## 8. マイルストーン

| # | マイルストーン | フェーズ | 完了条件 |
|---|---|---|---|
| M1 | PoC完了 | フェーズ1 | 企画→設計→実装の通しフローが完遂。開発専用Agent/SKILLの定義確定 |
| M2 | 基盤ファイル完成 | フェーズ2 | CLAUDE.md + using-aide-powers + hooks + プラットフォーム設定が動作 |
| M3 | 主要オーケストレーター完成 | フェーズ3〜6 | 変更・バグ修正・リファクタリング・設計逆引きの4オーケストレーターが動作 |
| M4 | 全スキル統合完了 | フェーズ7 | superpowersから継承するファイルの統合完了。全スキルが揃う |
| M5 | 統合テスト完了 | フェーズ8 | 全7オーケストレーターの通しテスト合格。Kiroブートストラップ確定 |
| M6 | リリース準備完了 | フェーズ9 | ドキュメント・配布手順が整備され、社内展開可能な状態 |

## 9. 設計フェーズの進め方

本プロジェクトはスキル定義ファイルの再構成が中心であり、通常のアプリケーション開発とは設計の進め方が異なる。

### 9.1 設計オーケストレーターのフェーズ適用方針

| 設計フェーズ | 適用 | 理由 |
|---|---|---|
| フェーズ1: ユーザー要件定義 | ✅ 完了済み | user-requirements.md 作成済み |
| フェーズ2: システム要件定義 | ✅ 完了済み | system-requirements.md 作成済み |
| フェーズ3: 開発計画書 | ✅ 本文書 | development-plan.md（本文書） |
| フェーズ4: システム構成設計 | ✅ 実施 | プラグインのディレクトリ構成・スキルチェーン構造の設計 |
| フェーズ5: GUI設計 | ❌ 対象外 | GUIなし（ビジュアルコンパニオンはsuperpowersからそのまま継承） |
| フェーズ6: ユースケース分析 | ✅ 実施（ここまで） | 7オーケストレーターの利用シナリオ分析 |
| フェーズ7〜10 | ⏸️ 対象外 | プログラムコードがないため、レイヤードアーキテクチャ・オブジェクト設計・プログラム構成は不要 |

### 9.2 フェーズ4（システム構成設計）で設計する内容

- aide-powersプラグインのディレクトリ構成（最終形）
- スキルチェーンの構造設計（ハブスキル→フェーズスキルの連携方式）
- サブエージェント定義のファイル配置設計
- プラットフォーム固有設定の配置設計
- CLAUDE.md / AGENTS.md の構成設計

### 9.3 フェーズ6（ユースケース分析）で設計する内容

- 7オーケストレーターそれぞれの利用シナリオ
- オーケストレーター自動選択のトリガー条件
- スキルチェーン間の遷移シナリオ
- エラー時のフォールバックシナリオ

---

*本文書はユーザー要件定義書（user-requirements.md）、システム要件定義書（system-requirements.md）、開発企画書（planning-proposal.md）、PoC計画書（poc-plan.md）、構成要素判定表（poc-framework-analysis.md）に基づき作成された開発計画書です。*
