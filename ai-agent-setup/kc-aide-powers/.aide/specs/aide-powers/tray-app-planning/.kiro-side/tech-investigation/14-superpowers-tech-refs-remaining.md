# 技術調査14: superpowers tech-references 残り8ファイル + 良い仕組み5つの詳細調査

## 調査概要

- **調査対象**: superpowersのtech-references残り8ファイル + ユーザーが評価した5つの仕組み
- **調査日**: 2025-07-19
- **調査の背景**: aide-for-claude-codeプロジェクトのPoC計画書・企画書の精度向上のため、superpowersのフレームワーク設計思想を網羅的に把握する

## 要約

superpowersの残り8つのtech-referenceファイルを全文読了し、aide-claudeへの関連度を判定した。8ファイル中6ファイルが「高」関連度であり、特にマルチエージェント・オーケストレーション、サブエージェントライフサイクル、ルール注入パターン、エンドツーエンドフローの4ファイルはPoC計画書・企画書に直接影響する。パートBの5つの仕組み（4ステータス管理、Visual Companion、体系的デバッグ、説得原理、ゲート関数パターン）は全てsuperpowersのソースコード内に実装箇所を特定済みであり、aide-claudeへの採用方法を具体的に整理した。

---

## パートA: tech-references 8ファイルの調査結果

### 1. tech-ref-agent-rule-injection.md

**概要**: エージェントへのルール注入パターンを6つに分類・解説。セッション開始フック注入、プロジェクトレベル規約（CLAUDE.md）、オンデマンドスキル読み込み、プロンプトテンプレート構築、名前付きエージェント定義、スキル間クロスリファレンスの各パターンの実装詳細、メリット・デメリット、応用ガイダンスを網羅。

**aide-claudeへの関連度**: **高**

**PoC計画書・企画書への影響**:
- PoC計画書 §5.4（説得原理）: ルール注入の強制力テクニック（`<EXTREMELY-IMPORTANT>`タグ、Iron Lawパターン、Red Flagsテーブル、精神条項）の具体的な実装方法がここに記載されている
- 企画書 §2.3（オーケストレーター自動選択）: ハブスキルによるスキル発見ルール（1%ルール）の設計がここに詳述されている
- 企画書 §2.1（マルチプラットフォーム対応）: プラットフォーム別の注入方式の違い（JSON出力形式の分岐）が記載

**aide-claudeで採用すべき知見**:
- **6つのルール注入パターンの使い分け**: aide-claudeのルールを「常時適用」「条件付き適用」「サブエージェント向け」の3カテゴリに分類し、適切なパターンを選択する
- **合理化防止テクニック**: Red Flagsテーブル、Common Rationalizationsテーブル、精神条項をaide-claudeの規律スキルに組み込む
- **コンテキスト隔離の原則**: サブエージェントにセッション履歴を渡さず、テンプレートで必要最小限のコンテキストを構築する設計
- **段階的コンテキスト投入**: セッション開始時はハブスキルのみ → タスク開始時に関連スキル → サブエージェント派遣時にテンプレート構築

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-agent-rule-injection.md`

---

### 2. tech-ref-brainstorming-feature.md

**概要**: ブレインストーミングスキルの全体像を解説。9ステップのチェックリスト、ビジュアルコンパニオン機能（HTTP+WebSocketサーバー、CSSクラス設計、イベント記録）、スペックドキュメントレビュー（セルフレビュー4項目 + サブエージェントレビュー5カテゴリ）、HARD-GATEによる実装禁止、writing-plansスキルへの遷移制御を網羅。

**aide-claudeへの関連度**: **中**

**PoC計画書・企画書への影響**:
- 企画書 §2.4（変換工程）: superpowersのbrainstormingスキルはaide-claudeの企画オーケストレーターに対応する。9ステップのチェックリスト構造はフェーズスキルの設計参考になる
- PoC計画書 §5.3（Iron Lawパターン）: HARD-GATEの実装例として参考になる

**aide-claudeで採用すべき知見**:
- **HARD-GATEパターン**: 設計承認前の実装を絶対禁止するゲート。aide-claudeの設計書ゲート（フェーズ0前の必須チェック）に直接適用可能
- **セルフレビュー4項目**: プレースホルダスキャン、内部整合性、スコープチェック、曖昧性チェック。aide-claudeのQAゲートに組み込める
- **1回1質問の原則**: ユーザーを圧倒しないための設計。aide-claudeのヒアリングフェーズに採用可能

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-brainstorming-feature.md`

---

### 3. tech-ref-end-to-end-flow.md

**概要**: プラグイン読み込みからコード生成・ブランチ完了までの全体フローを7フェーズに分割して解説。各フェーズの入出力、接続点、所要時間の目安を明記。横断的に発動する規律スキル（TDD、systematic-debugging、verification-before-completion）の位置づけも解説。

**aide-claudeへの関連度**: **高**

**PoC計画書・企画書への影響**:
- PoC計画書 §5.2（ワークフローチェーン）: superpowersの7フェーズフローの遷移パターンがaide-claudeの10フェーズスキルチェーンの設計参考になる
- 企画書 §3.2（ビジネスフロー）: superpowersのフロー全体像との対比でaide-claudeのフローを検証できる
- PoC計画書 §5.5（並列実行）: SDDとexecuting-plansの分岐点（Execution Handoff）の設計がaide-claudeのフェーズ8に参考になる

**aide-claudeで採用すべき知見**:
- **フェーズ間の入出力明示**: 各フェーズの入力・出力・次フェーズへの接続点を明確に定義する設計。aide-claudeの各フェーズスキルにも同様の構造を採用すべき
- **規律スキルの横断的発動**: プロセススキルの各ステップで規律スキルが横断的に発動する仕組み。aide-claudeでもQAゲートや検証スキルを横断的に発動させる設計が有効
- **Execution Handoff（分岐点）**: ユーザーに実行方式を選択させる設計。aide-claudeのフェーズ8でも同様の分岐を設けられる

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-end-to-end-flow.md`

---

### 4. tech-ref-executable-files.md

**概要**: superpowersの全11実行可能ファイル（JavaScript、Bash、ポリグロットスクリプト）の内部動作を詳細に解説。ブートストラップ系（session-start、run-hook.cmd、superpowers.js）、ブレインストームサーバー系（server.cjs、start-server.sh、stop-server.sh、helper.js）、ユーティリティ系の処理フロー、入出力、エラーハンドリング、設計判断の理由を網羅。

**aide-claudeへの関連度**: **低**

**PoC計画書・企画書への影響**:
- 直接的な影響は少ない。aide-claudeはsuperpowersの実行可能ファイルをそのまま使うため、内部実装の理解は変換作業には不要
- ただし、session-startスクリプトのプラットフォーム検出ロジックは、Kiro対応時のブートストラップ方式設計に参考になる

**aide-claudeで採用すべき知見**:
- **プラットフォーム検出の環境変数ベース設計**: `CURSOR_PLUGIN_ROOT`、`CLAUDE_PLUGIN_ROOT`、`COPILOT_CLI`等の環境変数でプラットフォームを判別する設計。Kiro対応時に同様のパターンを追加する際の参考
- **ポリグロットラッパー**: Windows/Unix両対応のrun-hook.cmdの設計。aide-claudeでも同様のラッパーが必要になる可能性

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-executable-files.md`

---

### 5. tech-ref-multi-agent-orchestration.md

**概要**: superpowersのマルチエージェント構成（オーケストレータ＋サブエージェント）の全体像を解説。サブエージェント駆動開発（SDD）の詳細フロー、4段階パイプライン（実装→スペック準拠レビュー→コード品質レビュー→最終レビュー）、ステータス報告とハンドリング、コンテキスト隔離の設計、並列エージェント派遣、モデル選択戦略、コードレビューの仕組みを網羅。

**aide-claudeへの関連度**: **高**

**PoC計画書・企画書への影響**:
- PoC計画書 §4.2（関連サブエージェント定義）: SDDの4段階パイプラインはaide-claudeのサブエージェント設計に直接影響
- PoC計画書 §5.5（並列実行）: dispatching-parallel-agentsパターンの詳細がフェーズ8の設計に影響
- 企画書 §3.7（開発リスク）: 「オーケストレータ自身は実装しない」原則はaide-claudeの「オーケストレーターの実作業禁止」ルールと完全に一致

**aide-claudeで採用すべき知見**:
- **2段階レビューゲート**: 「何を作ったか」（スペック準拠）→「どう作ったか」（コード品質）の2段階。aide-claudeのQAゲートに直接採用可能
- **エスカレーション階梯**: BLOCKED時の4段階対応（コンテキスト追加→高性能モデル→タスク分割→ユーザーエスカレーション）
- **コンテキスト汚染防止**: オーケストレータ自身が修正を行うことの明確な禁止
- **モデル選択戦略**: タスク複雑度に応じた「最小限のモデル」選択。aide-claudeでもコスト最適化に活用可能

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md`

---

### 6. tech-ref-project-anatomy.md

**概要**: superpowersのプロジェクト構造の設計意図と運用ガイド。ゼロ依存プラグインとしての構造、マルチプラットフォーム対応の構造（6プラットフォーム別設定ファイル）、ディレクトリ構造の詳細（skills/、hooks/、agents/、tests/、docs/、commands/）、バージョン管理の仕組み、ファイル変更時の影響範囲マップを網羅。

**aide-claudeへの関連度**: **中**

**PoC計画書・企画書への影響**:
- 企画書 §2.2（プラグイン形式での社内配布）: プラグイン構成の具体的なファイル構造がここに記載
- 企画書 §2.1（マルチプラットフォーム対応）: 各プラットフォーム向け設定ファイルの分離設計が参考になる

**aide-claudeで採用すべき知見**:
- **共通コンテンツとプラットフォーム固有設定の分離**: skills/とagents/は全プラットフォーム共通、設定ファイルはプラットフォーム固有という設計
- **スキルディレクトリの3パターン**: SKILL.mdのみ / SKILL.md+補助ドキュメント / SKILL.md+補助ドキュメント+スクリプト。aide-claudeのスキル構造設計に参考
- **バージョン一括管理**: `.version-bump.json`による複数ファイルのバージョン同期。aide-claudeでも同様の仕組みが必要

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-project-anatomy.md`

---

### 7. tech-ref-skill-system-architecture.md

**概要**: スキルシステムのアーキテクチャ全体像。ハブスキル→個別スキルの2段階構造、ブートストラップフロー（6プラットフォーム別の詳細）、スキル発見メカニズム（1%ルール、Red Flagsテーブル、優先順位）、プラットフォーム適応パターン（ツール名マッピング）、他プロジェクトへの応用ガイドを網羅。

**aide-claudeへの関連度**: **高**

**PoC計画書・企画書への影響**:
- PoC計画書 §5.6（CSO）: スキルのdescription設計原則がここに記載
- 企画書 §2.3（オーケストレーター自動選択）: ハブスキルによるスキル発見・優先順位の仕組みがaide-claudeのusing-aideメタスキル設計に直接影響
- 企画書 §2.1（マルチプラットフォーム対応）: ツール名マッピングの設計パターンがKiro対応に直接影響

**aide-claudeで採用すべき知見**:
- **2段階構造（ハブスキル→個別スキル）**: セッション開始時はハブスキルのみ注入、個別スキルはオンデマンド。aide-claudeのusing-aideメタスキルに直接採用
- **スキルの公式分類**: Rigid（厳格）とFlexible（柔軟）の2種別。aide-claudeのスキルにも同様の分類を適用
- **ツール名マッピングの設計**: Claude Codeのツール名で統一記述し、他プラットフォームはマッピングで吸収。aide-claudeのKiro対応（kiro-tools.md）に直接適用

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-system-architecture.md`

---

### 8. tech-ref-subagent-lifecycle.md

**概要**: サブエージェントの生成・派遣・ライフサイクル管理の仕組みを3レイヤー（プラットフォームAPI / SKILLファイル / プロンプトテンプレート）に分解して解説。Taskツールの呼び出し方法（汎用/名前付き）、プロンプトテンプレートの設計（変数の埋め方、「ファイルを読ませない」設計）、ライフサイクル（生成→ステータス報告→レビューループ→完了）、コンテキスト隔離、プラットフォーム別の実装差異（6プラットフォーム）、合理化防止テクニックを網羅。

**aide-claudeへの関連度**: **高**

**PoC計画書・企画書への影響**:
- PoC計画書 §4.2（関連サブエージェント定義）: サブエージェント定義の設計パターン（汎用 vs 名前付き）の使い分け基準がここに記載
- 企画書 §3.1（解説）: サブエージェントのユーザー対話（フォアグラウンドサブエージェント）の設計に影響
- 企画書 §2.1（マルチプラットフォーム対応）: プラットフォーム別のサブエージェント生成APIの違いが記載

**aide-claudeで採用すべき知見**:
- **汎用 vs 名前付きエージェントの使い分け基準**: 「人格が固定か、タスクごとに変わるか」が主な軸。aide-claudeのサブエージェント設計に直接適用
- **プロンプトテンプレート設計チェックリスト**: タスク全文のコピペ、質問の奨励、エスカレーション条件、セルフレビュー、報告形式の定義。aide-claudeのサブエージェントテンプレートに採用
- **`<SUBAGENT-STOP>`タグ**: サブエージェントがハブスキルを不要に読み込むことを防止。aide-claudeのusing-aideメタスキルにも同様のタグが必要

**参照元**: `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-subagent-lifecycle.md`

---

## パートA: 関連度サマリー

| # | ファイル | 関連度 | 主な影響先 |
|---|---|---|---|
| 1 | tech-ref-agent-rule-injection.md | **高** | PoC §5.4, 企画書 §2.3, §2.1 |
| 2 | tech-ref-brainstorming-feature.md | **中** | 企画書 §2.4, PoC §5.3 |
| 3 | tech-ref-end-to-end-flow.md | **高** | PoC §5.2, 企画書 §3.2, PoC §5.5 |
| 4 | tech-ref-executable-files.md | **低** | Kiro対応時のブートストラップ設計 |
| 5 | tech-ref-multi-agent-orchestration.md | **高** | PoC §4.2, §5.5, 企画書 §3.7 |
| 6 | tech-ref-project-anatomy.md | **中** | 企画書 §2.2, §2.1 |
| 7 | tech-ref-skill-system-architecture.md | **高** | PoC §5.6, 企画書 §2.3, §2.1 |
| 8 | tech-ref-subagent-lifecycle.md | **高** | PoC §4.2, 企画書 §3.1, §2.1 |

---

## パートB: superpowersの良い仕組み5つの詳細調査

### B1. サブエージェント駆動開発の4ステータス管理

#### 定義箇所

| ファイル | 内容 |
|---|---|
| `references/superpowers/skills/subagent-driven-development/SKILL.md` §Handling Implementer Status | 4ステータスの定義とオーケストレータの対応方法 |
| `references/superpowers/skills/subagent-driven-development/implementer-prompt.md` §Report Format | 実装者サブエージェントへの報告形式指示 |
| `references/superpowers/skills/subagent-driven-development/spec-reviewer-prompt.md` | スペック準拠レビュアーのプロンプト（「信頼しない原則」） |
| `references/superpowers/skills/subagent-driven-development/code-quality-reviewer-prompt.md` | コード品質レビュアーのプロンプト（スペック準拠レビュー通過後にのみ実行） |

#### 4ステータスの定義と遷移ルール

**ステータス定義**（`SKILL.md` より）:

| ステータス | 意味 | オーケストレータの対応 |
|---|---|---|
| `DONE` | 完了 | スペック準拠レビューへ進む |
| `DONE_WITH_CONCERNS` | 完了だが懸念あり | 懸念を読む。正確性・スコープの問題なら対処後レビューへ。観察的な懸念ならメモしてレビューへ |
| `NEEDS_CONTEXT` | 情報不足 | 不足情報を提供して再派遣 |
| `BLOCKED` | 完了不能 | 段階的対応（下記） |

**BLOCKED時の段階的対応**:
1. コンテキスト不足 → 情報追加して同モデルで再派遣
2. 推論力不足 → より高性能モデルで再派遣
3. タスクが大きすぎ → タスク分割
4. 計画自体が間違い → ユーザーにエスカレーション

**重要ルール**: 「Never ignore an escalation or force the same model to retry without changes.」

#### 2段階レビューの詳細

**第1段階: スペック準拠レビュー**（spec-reviewer-prompt.md）
- 目的: 「何を作ったか」の検証
- 核心: 「Do Not Trust the Report」— 実装者の報告を信用せず独立検証
- 検証観点: Missing requirements / Extra/unneeded work / Misunderstandings
- 出力: `✅ Spec compliant` または `❌ Issues found`

**第2段階: コード品質レビュー**（code-quality-reviewer-prompt.md → code-reviewer.md）
- 目的: 「どう作ったか」の検証
- 前提: **スペック準拠レビューが合格してからでないと実行不可**
- 検証観点: Code Quality / Architecture / Testing / Requirements
- 出力: Ready to merge? Yes/No/With fixes

**不合格時のフロー**:
- 実装者（同じサブエージェント）が修正 → レビュアーが再レビュー → 合格まで繰り返し
- 再レビューのスキップは禁止
- サブエージェントが失敗した場合は修正用サブエージェントを新規派遣（オーケストレータ自身が修正することは「context pollution」として禁止）

#### aide-claudeへの採用方法

**そのまま使える部分**:
- 4ステータス（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）の定義と遷移ルール
- BLOCKED時の段階的対応パターン
- 「信頼しない原則」（Do Not Trust the Report）

**カスタマイズが必要な部分**:
- aide-claudeの2段階レビューは「仕様準拠レビュー」→「品質レビュー」に対応するが、aide-claudeのQAゲート（design-qa-agent）はDDD・SOLID等の設計品質も検証するため、レビュー観点を拡張する必要がある
- aide-claudeのサブエージェントはフォアグラウンドモードでユーザーと直接対話するため、NEEDS_CONTEXTの処理フローが異なる（サブエージェントが直接ユーザーに質問できる）

**PoC計画書への影響**:
- PoC §4.2（関連サブエージェント定義）に4ステータス管理を明記すべき
- PoC §5.3（Iron Lawパターン）の多層防御に「信頼しない原則」を組み込むべき

---

### B2. Visual Companionのブラウザ連携アーキテクチャ

#### 定義箇所

| ファイル | 内容 |
|---|---|
| `references/superpowers/skills/brainstorming/visual-companion.md` | ビジュアルコンパニオンの使用判断基準、ループ処理、CSSクラス、イベント形式 |
| `references/superpowers/skills/brainstorming/scripts/server.cjs` | HTTP+WebSocketサーバー本体（ゼロ依存、RFC 6455手実装） |
| `references/superpowers/skills/brainstorming/scripts/frame-template.html` | フレームテンプレート（CSSクラス定義、ライト/ダークテーマ） |
| `references/superpowers/skills/brainstorming/scripts/helper.js` | クライアントサイドスクリプト（WebSocket接続、クリックイベントキャプチャ） |
| `references/superpowers/skills/brainstorming/scripts/start-server.sh` | サーバー起動（プラットフォーム検出、フォアグラウンド/バックグラウンド切替） |
| `references/superpowers/skills/brainstorming/scripts/stop-server.sh` | サーバー停止（graceful shutdown → SIGKILL） |
| `references/superpowers/skills/brainstorming/SKILL.md` §ステップ2 | ビジュアルコンパニオン提案の条件 |

#### アーキテクチャの詳細

**HTMLフラグメントの自動ラップ**:
- エージェントはHTMLフラグメント（`<div>`等で始まる）を書くだけでよい
- `server.cjs`が`isFullDocument()`で判定し、フラグメントなら`frame-template.html`の`<!-- CONTENT -->`に挿入
- 完全なHTML（`<!DOCTYPE`で始まる）はそのまま配信（helper.jsのみ注入）

**CSSクラス設計**:

| クラス | 用途 |
|---|---|
| `.options` + `.option` | A/B/C選択肢（縦並び） |
| `.cards` + `.card` | グリッドカード（レスポンシブ） |
| `.mockup` | モックアップコンテナ（`.mockup-header` + `.mockup-body`） |
| `.split` | 2カラム比較（700px以下で1カラムにフォールバック） |
| `.pros-cons` | メリット/デメリット（`.pros`緑 + `.cons`赤） |
| `.placeholder` | プレースホルダ（破線ボーダー） |
| `.mock-nav` / `.mock-sidebar` / `.mock-button` / `.mock-input` | ワイヤーフレーム要素 |
| `data-multiselect` | 複数選択有効化（`.options`または`.cards`に付与） |

**イベントのJSONL記録**:
- ユーザーのブラウザクリックは`$STATE_DIR/events`にNDJSON形式で記録
- 形式: `{"type":"click","choice":"a","text":"Option A","timestamp":1706000101}`
- 新スクリーン追加時にeventsファイルは自動クリア
- エージェントは次のターンでeventsファイルを読み、ターミナルテキストとマージ

**ループ処理（6ステップ）**:
1. サーバー生存確認 + HTML書き込み（セマンティックファイル名、ファイル名再利用禁止）
2. ユーザーへの案内（URL、画面の説明、ターミナルでの回答依頼）
3. eventsファイル読み取り + ターミナルテキストとのマージ
4. フィードバックに基づく反復または次の質問へ
5. ブラウザ不要時のwaitingスクリーン表示
6. 繰り返し

#### aide-claudeへの採用方法

**そのまま使える部分**:
- Visual Companionのサーバー・スクリプト群はsuperpowersの構成要素としてaide-claudeにそのまま含まれる
- CSSクラス設計、イベント記録形式、ループ処理はそのまま利用可能

**カスタマイズが必要な部分**:
- aide-claudeの企画オーケストレーターでVisual Companionを使う場合、brainstormingスキルの「ステップ2: ビジュアルコンパニオン提案」に相当するフェーズを設計する必要がある
- aide-claudeのGUI設計フェーズ（設計オーケストレーターのフェーズ5）でもVisual Companionを活用できる可能性がある

**PoC計画書への影響**:
- 変更オーケストレーターのPoCではVisual Companionは直接使わないため、PoC計画書への影響は小さい
- ただし、将来の企画オーケストレーター・設計オーケストレーターの変換時に重要になる

---

### B3. 体系的デバッグの4フェーズ + 3回失敗ルール

#### 定義箇所

| ファイル | 内容 |
|---|---|
| `references/superpowers/skills/systematic-debugging/SKILL.md` | 4フェーズの定義、Iron Law、3回失敗ルール、Red Flags、Common Rationalizations |
| `references/superpowers/skills/systematic-debugging/root-cause-tracing.md` | 根本原因追跡テクニック（Phase 1の補助） |
| `references/superpowers/skills/systematic-debugging/defense-in-depth.md` | 多層防御テクニック（根本原因発見後の補助） |
| `references/superpowers/skills/systematic-debugging/condition-based-waiting.md` | 条件ベース待機テクニック（タイムアウト置換） |

#### 4フェーズの詳細

**Iron Law**: `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`

**Phase 1: 根本原因調査（Root Cause Investigation）**
- エラーメッセージを注意深く読む（スタックトレース完全読了、行番号・ファイルパス・エラーコード記録）
- 一貫した再現（再現不可能なら推測せずデータ収集）
- 最近の変更確認（git diff、依存変更、環境差異）
- マルチコンポーネントシステムでの診断計装（各コンポーネント境界でのログ追加）
- データフロー追跡（悪い値の発生源まで遡る）

**Phase 2: パターン分析（Pattern Analysis）**
- 同じコードベース内の動作する類似コードを見つける
- リファレンス実装を完全に読む（スキミング禁止）
- 動作するものと壊れているものの差異を全て列挙
- 依存関係・設定・環境の前提条件を理解

**Phase 3: 仮説テスト（Hypothesis and Testing）**
- 単一の仮説を明確に記述（「XがYの理由で根本原因だと思う」）
- 最小限の変更でテスト（1変数ずつ）
- 検証してから次へ（うまくいかなければ新しい仮説を立てる、追加修正を重ねない）
- わからない場合は「わからない」と言う

**Phase 4: 実装（Implementation）**
- 失敗するテストケースを作成（TDDスキル連携）
- 単一の修正を実装（根本原因に対処、「ついでに」改善禁止）
- 修正を検証（テスト通過、他テスト影響なし）

#### 3回失敗ルールの詳細

`SKILL.md` Phase 4 ステップ4-5より:

```
4. If Fix Doesn't Work
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - If ≥ 3: STOP and question the architecture (step 5 below)
   - DON'T attempt Fix #4 without architectural discussion

5. If 3+ Fixes Failed: Question Architecture
   Pattern indicating architectural problem:
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   STOP and question fundamentals:
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   Discuss with your human partner before attempting more fixes
   This is NOT a failed hypothesis - this is a wrong architecture.
```

#### aide-claudeへの採用方法

**そのまま使える部分**:
- 4フェーズの構造（根本原因調査→パターン分析→仮説テスト→実装）
- Iron Law（`NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`）
- 3回失敗ルール（3回修正に失敗したらアーキテクチャの問題と判断）
- Red Flags、Common Rationalizationsテーブル

**カスタマイズが必要な部分**:
- aide-claudeのバグ修正オーケストレーターは既に6フェーズ（ヒアリング→原因分析→修正方針→差分設計→実装→ドキュメント反映）を持つ。systematic-debuggingの4フェーズはPhase 2（原因分析）とPhase 3（修正方針）に統合する形で採用する
- 3回失敗ルールのエスカレーション先を、aide-claudeではリファクタリングオーケストレーターへの引き継ぎ（refactoring-request.md経由）として設計する

**PoC計画書への影響**:
- 変更オーケストレーターのPoCでは直接使わないが、将来のバグ修正オーケストレーター変換時に重要
- PoC §5.3（Iron Lawパターン）の設計参考として、systematic-debuggingのIron Law + 多層防御の構造を参照すべき

---

### B4. 説得原理に基づくプロンプト設計

#### 定義箇所

| ファイル | 内容 |
|---|---|
| `references/superpowers/skills/writing-skills/persuasion-principles.md` | Cialdiniの7原則のLLMへの適用方法、スキル種類別の推奨組み合わせ、研究基盤 |
| `references/superpowers/skills/writing-skills/SKILL.md` §Psychology note | 説得原理への参照と適用指示 |
| `references/superpowers/skills/writing-skills/testing-skills-with-subagents.md` §Why this works | プレッシャーテストと説得原理の関係 |
| `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-creation.md` §5.5 | 説得原理の詳細解説 |

#### 7原則の詳細

**研究基盤**: Meincke et al. (2025) — N=28,000のAI会話で7つの説得原理をテスト。説得テクニックの適用により遵守率が33%→72%に倍増（p < .001）。

| # | 原則 | LLMでの効果 | スキルでの使い方 |
|---|---|---|---|
| 1 | **Authority（権威）** | 命令的言語（YOU MUST, Never, Always）で判断疲労と合理化を排除 | 規律スキルの核心部分 |
| 2 | **Commitment（コミットメント）** | 宣言の要求（「I'm using [Skill Name]」）、明示的選択の強制 | スキル使用の宣言義務 |
| 3 | **Scarcity（希少性）** | 時間制限（Before proceeding）、順序依存（Immediately after X） | 即時検証要件 |
| 4 | **Social Proof（社会的証明）** | 普遍的パターン（Every time, Always）、失敗モード（X without Y = failure） | 規範の確立 |
| 5 | **Unity（一体感）** | 協調的言語（our codebase, we're colleagues） | 協調ワークフロー |
| 6 | **Reciprocity（互恵性）** | 使用を控える（操作的に感じられる） | ほぼ不使用 |
| 7 | **Liking（好意）** | **使用禁止**（正直なフィードバック文化と矛盾、追従性を生む） | 規律スキルでは絶対不使用 |

#### スキル種類別の推奨組み合わせ

| スキル種類 | 使う原則 | 避ける原則 |
|---|---|---|
| Discipline-enforcing（規律） | Authority + Commitment + Social Proof | Liking, Reciprocity |
| Guidance/technique（ガイダンス） | Moderate Authority + Unity | Heavy authority |
| Collaborative（協調） | Unity + Commitment | Authority, Liking |
| Reference（参照） | Clarity only | All persuasion |

#### なぜLLMに説得原理が効くのか

`persuasion-principles.md`より:
- LLMは人間のテキストで訓練されており、これらのパターンを含む
- Authority言語は訓練データ中でコンプライアンスに先行する
- Commitmentシーケンス（宣言→行動）は頻繁にモデル化されている
- Social Proofパターン（everyone does X）は規範を確立する

#### aide-claudeへの採用方法

**そのまま使える部分**:
- Authority + Commitment + Social Proofの組み合わせを規律スキルに適用
- 「YOU MUST」「No exceptions」「Every time」等の具体的な言語パターン
- Likingの不使用原則（追従性防止）

**具体的な適用箇所**:
- PoC計画書 §5.4（説得原理）: 変更オーケストレーターのIron Lawに Authority を適用
- PoC計画書 §5.3（Iron Lawパターン）: 精神条項に Commitment を適用（「Violating the letter is violating the spirit」）
- PoC計画書 §5.1（スキル作成方法）: Red FlagsテーブルとCommon Rationalizationsテーブルに Social Proof を適用

**PoC計画書への影響**:
- PoC §5.4は既に「Authority + Commitment + Social Proofを規律部分に組み込む」と記載済み。本調査で具体的な適用方法が明確になった

---

### B5. 完了前検証のゲート関数パターン

#### 定義箇所

| ファイル | 内容 |
|---|---|
| `references/superpowers/skills/verification-before-completion/SKILL.md` | ゲート関数の定義、Iron Law、Common Failures、Red Flags、Rationalization Prevention |
| `references/superpowers/skills/test-driven-development/testing-anti-patterns.md` | テストアンチパターンごとのGate Function定義 |
| `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-end-to-end-flow.md` §9 | 横断的規律スキルとしての位置づけ |

#### ゲート関数の5ステップ

`verification-before-completion/SKILL.md`より:

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

**Iron Law**: `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE`

**精神条項**: 「Violating the letter of this rule is violating the spirit of this rule.」

#### Common Failures（よくある失敗）

| 主張 | 必要な証拠 | 不十分な証拠 |
|---|---|---|
| Tests pass | テストコマンド出力: 0 failures | 前回の実行結果、「通るはず」 |
| Linter clean | リンター出力: 0 errors | 部分チェック、推測 |
| Build succeeds | ビルドコマンド: exit 0 | リンター通過、ログが良さそう |
| Bug fixed | 元の症状テスト: passes | コード変更した、修正したはず |
| Agent completed | VCS diffで変更確認 | エージェントが「成功」と報告 |
| Requirements met | 行ごとのチェックリスト | テスト通過 |

#### 適用タイミング

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

#### aide-claudeへの採用方法

**そのまま使える部分**:
- IDENTIFY→RUN→READ→VERIFY→CLAIMの5ステップ
- Iron Law（`NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE`）
- Common Failuresテーブル
- Red Flags（「should」「probably」「seems to」の使用検出）
- Rationalization Preventionテーブル

**具体的な適用箇所**:
- aide-claudeの全オーケストレーターのフェーズ完了判定に適用
- 特にQAゲート（design-qa-agent）の判定後、「修正したから大丈夫」という自己判断を防止するために有効
- aide-claudeの「フェーズスキップ禁止ルール」（global-rules.md）の技術的裏付けとして機能

**カスタマイズが必要な部分**:
- aide-claudeではテスト実行だけでなく、設計書の整合性検証（DDD、SOLID準拠等）も「検証」に含まれる。ゲート関数の「command」を「検証手段」に一般化する必要がある
- aide-claudeのサブエージェントがフォアグラウンドで動作するため、「Agent completed」の検証方法がsuperpowersとは異なる

**PoC計画書への影響**:
- PoC §5.3（Iron Lawパターン）の多層防御にゲート関数パターンを組み込むべき
- 変更オーケストレーターの各フェーズ完了判定にIDENTIFY→RUN→READ→VERIFY→CLAIMを適用

---

## パートB: aide-claudeへの採用方法サマリー

| # | 仕組み | 採用方法 | カスタマイズ要否 |
|---|---|---|---|
| B1 | 4ステータス管理 | そのまま採用。aide-claudeのサブエージェント報告形式として定義 | 中（QAゲートの観点拡張、フォアグラウンドモード対応） |
| B2 | Visual Companion | superpowersの構成要素としてそのまま含まれる | 低（企画・設計オーケストレーターでの活用設計が必要） |
| B3 | 体系的デバッグ4フェーズ+3回失敗ルール | バグ修正オーケストレーターに統合 | 中（既存6フェーズとの統合、エスカレーション先の設計） |
| B4 | 説得原理 | Authority+Commitment+Social Proofを規律スキルに適用 | 低（具体的な言語パターンはそのまま使える） |
| B5 | ゲート関数パターン | 全オーケストレーターのフェーズ完了判定に適用 | 中（「command」を「検証手段」に一般化） |

---

## 情報源

### パートA: 読了したtech-referenceファイル

| # | ファイルパス |
|---|---|
| 1 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-agent-rule-injection.md` |
| 2 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-brainstorming-feature.md` |
| 3 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-end-to-end-flow.md` |
| 4 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-executable-files.md` |
| 5 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-multi-agent-orchestration.md` |
| 6 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-project-anatomy.md` |
| 7 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-skill-system-architecture.md` |
| 8 | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-subagent-lifecycle.md` |

### パートB: 参照したソースファイル

| # | ファイルパス | パートBの項目 |
|---|---|---|
| 1 | `references/superpowers/skills/subagent-driven-development/SKILL.md` | B1 |
| 2 | `references/superpowers/skills/subagent-driven-development/implementer-prompt.md` | B1 |
| 3 | `references/superpowers/skills/subagent-driven-development/spec-reviewer-prompt.md` | B1 |
| 4 | `references/superpowers/skills/subagent-driven-development/code-quality-reviewer-prompt.md` | B1 |
| 5 | `references/superpowers/skills/brainstorming/visual-companion.md` | B2 |
| 6 | `references/superpowers/skills/brainstorming/scripts/server.cjs` | B2 |
| 7 | `references/superpowers/skills/brainstorming/scripts/frame-template.html` | B2 |
| 8 | `references/superpowers/skills/brainstorming/scripts/helper.js` | B2 |
| 9 | `references/superpowers/skills/systematic-debugging/SKILL.md` | B3 |
| 10 | `references/superpowers/skills/writing-skills/persuasion-principles.md` | B4 |
| 11 | `references/superpowers/skills/writing-skills/SKILL.md` | B4 |
| 12 | `references/superpowers/skills/writing-skills/testing-skills-with-subagents.md` | B4 |
| 13 | `references/superpowers/skills/verification-before-completion/SKILL.md` | B5 |
| 14 | `references/superpowers/skills/test-driven-development/testing-anti-patterns.md` | B5 |
