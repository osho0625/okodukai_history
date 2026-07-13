# 共通スキル: 実装系

実装ワークフロー / 変更ワークフロー / バグ修正ワークフロー / リファクタリングワークフローの
実装フェーズで動く共通スキル群。コーディング規約・タスク分解・多段階レビューパイプライン・
各レビュー観点を提供する。

## impl-coding-standards

### 目的

`micro-impl-agent` がコードを書く / 修正する / テストを書く / テストを実行する際に従う
共通の規約と粒度ルールを集約する。

### 呼び出し元

- `micro-impl-agent` が `implement` / `fix` / `write_test` / `fix_test` / `run_test` の全モードで参照

### メインプロセスの要点

提供する内容:

- **粒度ルール**: 1 サブタスク = 1 呼び出し = 1 ファイル = 最大 1 publicメソッド。
  アイドルライン違反は分割依頼で対応する。
- **コーディング規約**: 命名（PEP 8 等）、型ヒント、docstring、ファイルサイズ、エラーハンドリング基本パターン
- **動作確認試験書更新ルール**: `testing/manual-test-plan.md` への試験項目追記
- **親タスク完了チェック**: 全サブタスク完了後に設計書セクション全体と実装コードを照合する
- **5 モードの報告テンプレート**と**ステータス 4 種**（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）
- **テスト関連ルール**: unittest 標準ライブラリ使用、pytest 禁止、モック・スタブ禁止
- **テスト実行ルール**: ユニットテストを実行。既存テスト全実行（リグレッションテスト）は動作確認Stepで1回実施する設計に統一されている

### Iron Law

- 設計書を読まずに実装を始めない。
- ダミー実装の原則禁止。ライブラリが必要なら自分でインストールする。
- 1 回の呼び出しで変更するファイルは 1 つだけ。
- 50 行を超えるファイルは Write（先頭 50 行）+ Append（残り）の分割書き込み。

## impl-task-planning

### 目的

設計書群を読み、依存関係に基づいて実装タスクを順序付きに分解する。

### 呼び出し元

- `fs-impl-phase2-preparation`（実装ワークフロー）
- `fs-change-phase7-task-planning`（変更ワークフロー）
- `fs-bugfix-phase4-design`（バグ修正ワークフロー: 差分タスク分解）
- `fs-refactoring-phase4-design`（リファクタリング: 差分タスク分解）

### メインプロセスの要点

オブジェクト設計の依存方向 + プログラム構成を踏まえて依存関係グラフを作り、トポロジカルソートで
タスク順序を確定する。1 タスク 1 ファイル粒度を厳守する。
非プログラム成果物（設定ファイル等）は別カテゴリで管理する。

### Iron Law

- 1 タスクに複数ファイルの実装を詰め込まない。
- 依存関係を無視してタスク順序を決定しない。

## multi-stage-code-review

### 目的

実装後のコードレビューを段階的に実行するパイプラインを規定する。

### 呼び出し元

- `fs-impl-phase4-execution`（実装ワークフロー）
- `fs-change-phase8-impl`（変更ワークフロー）
- `fs-bugfix-phase5-impl`（バグ修正ワークフロー）
- `fs-refactoring-phase5-impl`（リファクタリングワークフロー）

### メインプロセスの要点

1 タスクごとに以下のパイプラインを省略禁止で実行する。

```
[タスク開始]
  → micro-impl-agent: implement モードで実装
  → Stage 1a: design-review-agent（設計準拠レビュー）
  → Stage 1b: code-review-agent（コード品質レビュー）         ← 並行実行可
    両方 PASS なら次へ
  → micro-impl-agent: write_test モードでテスト作成
  → Stage 2a: design-review-agent（テスト網羅性レビュー）
  → Stage 2b: code-review-agent（テスト品質レビュー）         ← 並行実行可
    両方 PASS なら次へ
  → micro-impl-agent: run_test モードでテスト実行
[タスク完了 → 工程チェック表更新 → 次のタスク]
```

非プログラム成果物の場合は「実装 → 設計準拠レビューのみ」の 3 ステップに短縮する。
判定基準は `fs-impl-phase4-execution` の「成果物種別の判定」を引き継ぐ。

### Iron Law

- ステージ間 PASS なしに次工程へ進まない。
- 複数タスクをまとめて実装してまとめてレビューしない。
- 工程チェック表は名前付きエージェントが更新する（オーケストレーターによる代筆禁止）。

## code-quality-review

### 目的

コード自体の品質（命名 / 型ヒント / docstring / SOLID / デッドコード / ダミー実装検出 /
過去不具合再発チェック）を検証するための観点とルールを提供する。

### 呼び出し元

- `code-review-agent`（mode: implementation）が必ず読み込む

### メインプロセスの要点

検証項目（PEP 8 命名 / 型ヒント・docstring / ファイルサイズ / SOLID / if/elif/else 網羅 /
デッドコード / マジックナンバー / 未使用 import / ダミー実装 / 過去不具合再発）を
具体的な検出パターンとして列挙する。重要度（ERROR / WARNING）と判定基準を提供する。

### Iron Law

- ダミー実装（unittest.mock import / `pass` のみ / TODO 付き仮実装等）は ERROR で NEEDS_FIX。
- 設計書との整合性（クラス定義 / メソッドシグネチャ / import 方向）には言及しない（design-review-agent の担当）。

## design-review

`design-review-agent` が「外を見る」レビューで参照する観点群は、共通スキルとしては
[`import-review`](#import-review)（import ルール検証）で提供される。設計準拠の検証ロジック自体は
エージェント側（`agents/design-review-agent.md`）に集約されているため、共通スキルとしての
`design-review` は配布されていない。詳細は [`../04-agents/implementation-agents.md`](../04-agents/implementation-agents.md) を参照。

## error-handling-review

### 目的

実装コードのエラーハンドリング品質を検証する観点とルールを提供する。

### 呼び出し元

- `code-review-agent`（mode: implementation）が必ず読み込む

### メインプロセスの要点

検証項目:

- 例外階層の整合（設計書の `Raises` セクションと実装の例外送出）
- レイヤー間例外変換（インフラ例外 → ドメイン例外への適切な変換）
- 例外チェイン（`raise X from Y`）の適切な使用
- try/except のスコープ最小化
- bare except 禁止
- エラーもみ消し防止
- ログ二重計上防止
- エラーメッセージの品質

### Iron Law

- bare except 検出は ERROR。
- 設計書 `Raises` と実装の例外送出の不一致は NEEDS_FIX。

## import-review

### 目的

実装コードの import 文がレイヤードアーキテクチャの依存方向ルールに違反していないかを検証する。

### 呼び出し元

- `design-review-agent`（mode: implementation）が必ず読み込む

### メインプロセスの要点

許可される依存方向: `presentation → application → domain ← infrastructure`。
禁止マトリクス（8 パターン）と例外ルール（2 件）を具体的に列挙する。
import ルール違反は **設計漏れ判定の対象外**（常に実装修正が必要）。

### Iron Law

- ドメイン層からインフラ層への import を 1 件でも検出すれば FAIL。
- import ルール違反を「設計漏れ」として設計書修正で回避してはならない。常に実装を修正する。

## test-review

### 目的

テストコードを「網羅性」と「方針準拠」の 2 視点で検証するための観点とルールを提供する。
レビューモードを切り替えて使う:

- `review_mode = "coverage"`: 設計書のテスト観点が全てカバーされているか（design-review-agent が使用）
- `review_mode = "policy"`: 命名 / 独立性 / モック禁止 / 境界値 / 異常系等の方針準拠（code-review-agent が使用）

### 呼び出し元

- `design-review-agent`（mode: test、coverage モード）
- `code-review-agent`（mode: test、policy モード）

### メインプロセスの要点

検証項目:

- 設計書の「テスト観点」セクションの全ケースカバー（coverage）
- 全パブリックメソッドのテスト存在（coverage）
- 境界値テスト（閾値の直前・直後）
- 異常系テスト（`Raises` セクションの全例外）
- テスト命名規則
- テスト独立性
- モック・スタブ禁止（unittest.mock の import があれば ERROR）
- import パスの正しさ

### Iron Law

- モック・スタブ使用検出は ERROR で NEEDS_FIX（ドメイン層は純粋ロジック、外部依存なしを前提）。
- 設計書テスト観点のカバー漏れは coverage モードで FAIL。
