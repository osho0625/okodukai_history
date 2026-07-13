# superpowers テスト構造 詳細調査

## 調査概要

| 項目 | 内容 |
|---|---|
| 調査対象 | superpowers の `tests/opencode/` および `tests/subagent-driven-dev/` 配下の全ファイル |
| 調査日 | 2025-07-18 |
| 調査の背景 | aide-claude は superpowers のフレームワークに AIDE の具象ロジックを載せる構成をとる。テスト構造を aide-claude でも採用するため、superpowers のテストの詳細を把握する必要がある |

## 要約

superpowers のテストは2カテゴリに分かれる。**opencode テスト**はプラグインのインストール・ツール動作・スキル優先度解決を検証するユニット/統合テスト群で、隔離された一時環境を構築して実行する。**subagent-driven-dev テスト**は design.md + plan.md + scaffold.sh の3点セットで構成されるE2Eテストで、Claude にプロジェクトを丸ごと実装させてスキルの実用性を検証する。aide-claude では opencode テストの構造（setup.sh による隔離環境 + テストランナー）をそのまま踏襲し、subagent-driven-dev テストは AIDE のサブエージェント機能の検証に応用できる。

---

## 1. tests/opencode/ — プラグインテスト群

### 1.1 全体構成

```
tests/opencode/
├── run-tests.sh              # テストランナー（エントリポイント）
├── setup.sh                  # テスト環境セットアップ（全テスト共通）
├── test-plugin-loading.sh    # プラグイン読み込みテスト（単体テスト）
├── test-tools.sh             # ツール動作テスト（統合テスト）
└── test-priority.sh          # スキル優先度テスト（統合テスト）
```

テストは2種類に分類される:
- **単体テスト**: OpenCode 不要。ファイル構造・シンタックスの検証（`test-plugin-loading.sh`）
- **統合テスト**: OpenCode 必要。実際に LLM を呼び出してツール動作を検証（`test-tools.sh`, `test-priority.sh`）

### 1.2 run-tests.sh — テストランナー

**参照**: `references/superpowers/tests/opencode/run-tests.sh`

**目的**: 全テストを順次実行し、結果を集計・レポートする。

**実行方法**:
```bash
./run-tests.sh                    # 単体テストのみ
./run-tests.sh --integration      # 統合テストも含む
./run-tests.sh --test <テスト名>  # 特定テストのみ
./run-tests.sh --verbose          # 詳細出力
```

**構造**:
- CLIオプション: `--integration`（統合テスト実行）、`--verbose`（詳細出力）、`--test`（特定テスト指定）、`--help`
- テスト配列: 単体テスト配列 `tests=()` と統合テスト配列 `integration_tests=()` を分離管理
- 結果集計: passed / failed / skipped をカウントし、最終サマリーを表示
- 終了コード: 1件でも失敗があれば `exit 1`

### 1.3 setup.sh — テスト環境セットアップ

**参照**: `references/superpowers/tests/opencode/setup.sh`

**目的**: テストごとに隔離された一時環境を構築する。本番の `$HOME` や OpenCode 設定を汚染しない。

**仕組み**:
1. `mktemp -d` で一時ディレクトリを作成し、`$HOME` を上書き
2. `$XDG_CONFIG_HOME` と `$OPENCODE_CONFIG_DIR` を一時ディレクトリ配下に設定
3. superpowers のスキルとプラグインを一時ディレクトリにコピー
4. プラグインをシンボリックリンクで登録（OpenCode が読む場所に配置）
5. テスト用フィクスチャを作成:
   - `personal-test` スキル（個人スキルディレクトリに配置）
   - `project-test` スキル（プロジェクトディレクトリに配置）
6. `cleanup_test_env()` 関数をエクスポート（テスト終了時に一時ディレクトリを削除）

**エクスポートされる変数**:
| 変数名 | 内容 |
|---|---|
| `REPO_ROOT` | リポジトリルート |
| `TEST_HOME` | 一時ホームディレクトリ |
| `OPENCODE_CONFIG_DIR` | 一時 OpenCode 設定ディレクトリ |
| `SUPERPOWERS_DIR` | superpowers インストール先 |
| `SUPERPOWERS_SKILLS_DIR` | スキルディレクトリ |
| `SUPERPOWERS_PLUGIN_FILE` | プラグイン JS ファイルパス |

**インストールレイアウト**:
```
$OPENCODE_CONFIG_DIR/
├── superpowers/                          # パッケージルート
│   ├── skills/                           # スキルディレクトリ
│   └── .opencode/plugins/superpowers.js  # プラグインファイル
├── plugins/superpowers.js                # シンボリックリンク（OpenCode が読む）
└── skills/personal-test/SKILL.md         # テスト用個人スキル
```

### 1.4 test-plugin-loading.sh — プラグイン読み込みテスト

**参照**: `references/superpowers/tests/opencode/test-plugin-loading.sh`

**目的**: プラグインが正しくインストールされ、OpenCode から認識される状態かを検証する。OpenCode 不要の単体テスト。

**テストケース（6件）**:
| # | テスト内容 | 検証方法 |
|---|---|---|
| 1 | プラグインシンボリックリンクの存在 | `-L` でシンボリックリンク確認 + `readlink -f` でターゲット存在確認 |
| 2 | スキルディレクトリにスキルが存在 | `find` で `SKILL.md` の数をカウント（> 0） |
| 3 | `using-superpowers` スキルの存在 | ブートストラップに必須のスキルファイル確認 |
| 4 | プラグイン JS のシンタックス検証 | `node --check` で構文チェック |
| 5 | ハードコードパスの不在確認 | `grep` で旧パス参照がないことを確認 |
| 6 | テストフィクスチャの存在確認 | personal-test スキルファイルの存在確認 |

### 1.5 test-tools.sh — ツール動作テスト

**参照**: `references/superpowers/tests/opencode/test-tools.sh`

**目的**: `find_skills` と `use_skill` ツールが正しく動作するかを検証する。OpenCode 必須の統合テスト。

**テストケース（3件）**:
| # | テスト内容 | 検証方法 |
|---|---|---|
| 1 | `find_skills` ツール | `opencode run` で実行し、出力に `superpowers:brainstorming` 等のスキル名が含まれるか確認 |
| 2 | `use_skill` ツール（個人スキル） | `personal-test` スキルをロードし、マーカー文字列 `PERSONAL_SKILL_MARKER_12345` が出力に含まれるか確認 |
| 3 | `use_skill` ツール（superpowers: プレフィックス） | `superpowers:brainstorming` をロードし、関連キーワードが出力に含まれるか確認 |

**実行パターン**: 各テストは `timeout 60s opencode run --print-logs "<プロンプト>"` で実行。タイムアウト（60秒）とエラーハンドリングあり。

### 1.6 test-priority.sh — スキル優先度テスト

**参照**: `references/superpowers/tests/opencode/test-priority.sh`

**目的**: スキルの優先度解決（project > personal > superpowers）が正しく動作するかを検証する。OpenCode 必須の統合テスト。

**フィクスチャ構成**: 同名スキル `priority-test` を3箇所に異なるマーカー付きで配置:
| 配置場所 | 優先度 | マーカー |
|---|---|---|
| `$SUPERPOWERS_SKILLS_DIR/priority-test/` | 低 | `PRIORITY_MARKER_SUPERPOWERS_VERSION` |
| `$OPENCODE_CONFIG_DIR/skills/priority-test/` | 中 | `PRIORITY_MARKER_PERSONAL_VERSION` |
| `$TEST_HOME/test-project/.opencode/skills/priority-test/` | 高 | `PRIORITY_MARKER_PROJECT_VERSION` |

**テストケース（5件）**:
| # | テスト内容 | 検証方法 |
|---|---|---|
| 1 | フィクスチャの存在確認 | 3箇所すべてにファイルが存在するか |
| 2 | personal > superpowers | HOME から実行し、PERSONAL マーカーが返るか |
| 3 | project > personal > superpowers | プロジェクトディレクトリから実行し、PROJECT マーカーが返るか |
| 4 | `superpowers:` プレフィックスで強制指定 | プロジェクト内から `superpowers:priority-test` を指定し、SUPERPOWERS マーカーが返るか |
| 5 | `project:` プレフィックスの動作 | プロジェクト外から `project:priority-test` を指定し、エラーになるか |

---

## 2. tests/subagent-driven-dev/ — サブエージェント駆動開発テスト

### 2.1 全体構成

```
tests/subagent-driven-dev/
├── run-test.sh               # テストランナー（エントリポイント）
├── go-fractals/              # テストプロジェクト: Go CLI フラクタル生成
│   ├── design.md             # 設計仕様書
│   ├── plan.md               # 実装計画書（タスク分解）
│   └── scaffold.sh           # プロジェクト初期化スクリプト
└── svelte-todo/              # テストプロジェクト: Svelte Todo アプリ
    ├── design.md             # 設計仕様書
    ├── plan.md               # 実装計画書（タスク分解）
    └── scaffold.sh           # プロジェクト初期化スクリプト
```

### 2.2 run-test.sh — テストランナー

**参照**: `references/superpowers/tests/subagent-driven-dev/run-test.sh`

**目的**: 指定されたテストプロジェクトをスキャフォールドし、Claude に `superpowers:subagent-driven-development` スキルで実装させる E2E テスト。

**実行方法**:
```bash
./run-test.sh go-fractals
./run-test.sh svelte-todo --plugin-dir /path/to/superpowers
```

**処理フロー**:
1. 引数からテスト名を取得（`go-fractals` or `svelte-todo`）
2. `/tmp/superpowers-tests/<timestamp>/` にタイムスタンプ付き出力ディレクトリを作成
3. `scaffold.sh` を実行してプロジェクトを初期化
4. Claude を `claude -p` で非対話実行:
   - `--plugin-dir` で superpowers プラグインを指定
   - `--dangerously-skip-permissions` で自動テスト用に権限チェックをスキップ
   - `--output-format stream-json` でトークン使用量を追跡
   - `--verbose` で詳細ログ
5. 実行結果を JSON ログに保存
6. `jq` でトークン使用量を抽出・表示
7. 次のステップ（手動検証コマンド）を案内

### 2.3 テストプロジェクト共通パターン: scaffold.sh

**参照**: `references/superpowers/tests/subagent-driven-dev/go-fractals/scaffold.sh`, `references/superpowers/tests/subagent-driven-dev/svelte-todo/scaffold.sh`

**目的**: テスト用プロジェクトの初期状態を作成する。

**共通処理**:
1. 指定ディレクトリを作成
2. `git init` で Git リポジトリを初期化
3. `design.md` と `plan.md` をコピー
4. `.claude/settings.local.json` を作成（Claude の権限設定）
5. 初期コミットを作成

**権限設定の違い**:
| 項目 | go-fractals | svelte-todo |
|---|---|---|
| Bash 許可 | `go:*`, `mkdir:*`, `git:*` | `npm:*`, `npx:*`, `mkdir:*`, `git:*` |
| 共通 | `Read(**)`, `Edit(**)`, `Write(**)` | `Read(**)`, `Edit(**)`, `Write(**)` |

### 2.4 テストプロジェクト共通パターン: design.md + plan.md

各テストプロジェクトは **design.md**（何を作るか）と **plan.md**（どう作るか）の2文書で構成される。

**design.md の構成要素**:
- Overview（概要）
- Features（機能一覧）
- User Interface（UI モックアップ / 使用例）
- Architecture（ディレクトリ構成）
- Data Model / Dependencies
- Acceptance Criteria（受入基準）

**plan.md の構成要素**:
- 冒頭に `superpowers:subagent-driven-development` スキルの使用を指示
- Context（design.md への参照）
- Tasks（番号付きタスクリスト）
  - 各タスクに **Do**（実装内容）と **Verify**（検証方法）を明記
  - タスク間は `---` で区切り

### 2.5 go-fractals — Go CLI フラクタル生成ツール

**参照**: `references/superpowers/tests/subagent-driven-dev/go-fractals/design.md`, `references/superpowers/tests/subagent-driven-dev/go-fractals/plan.md`

**プロジェクト概要**: ASCII アートでフラクタル（シェルピンスキー三角形、マンデルブロ集合）を生成する Go CLI ツール。

**技術スタック**: Go 1.21+, `github.com/spf13/cobra`

**タスク数**: 10タスク（プロジェクトセットアップ → CLI フレームワーク → アルゴリズム実装 → CLI 統合 → バリデーション → 統合テスト → README）

**テストとしての特徴**:
- Go のビルドシステム（`go mod`, `go build`, `go test`）を使用
- 外部依存（cobra）のインストールが必要
- アルゴリズム実装を含む（LLM のコード生成能力を検証）
- ユニットテスト + 統合テストの両方を要求

### 2.6 svelte-todo — Svelte Todo アプリ

**参照**: `references/superpowers/tests/subagent-driven-dev/svelte-todo/design.md`, `references/superpowers/tests/subagent-driven-dev/svelte-todo/plan.md`

**プロジェクト概要**: Svelte + TypeScript で構築する Todo リストアプリ。localStorage 永続化、フィルタリング機能付き。

**技術スタック**: Svelte, TypeScript, Vite, Vitest, Playwright

**タスク数**: 12タスク（プロジェクトセットアップ → ストア → localStorage → コンポーネント群 → 統合 → フィルタ → スタイリング → E2E テスト → README）

**テストとしての特徴**:
- フロントエンドのコンポーネント設計を検証
- 複数のテストフレームワーク（Vitest + Playwright）を使用
- UI モックアップ（ASCII アート）からの実装を要求
- 状態管理（Svelte store）とデータ永続化を含む

---

## 3. aide-claude への示唆

### 3.1 opencode テスト構造の応用

| superpowers の要素 | aide-claude での対応 |
|---|---|
| `setup.sh`（隔離環境構築） | Claude Code の設定ディレクトリ（`~/.claude/`）を一時ディレクトリに隔離する setup.sh を作成。CLAUDE.md やスキルファイルのインストールを検証 |
| `test-plugin-loading.sh`（構造検証） | CLAUDE.md の存在・内容検証、スキルディレクトリの構造検証、設定ファイルの整合性チェック |
| `test-tools.sh`（ツール動作検証） | `claude -p` を使った統合テスト。サブエージェント呼び出し、スキル読み込みの動作検証 |
| `test-priority.sh`（優先度検証） | Claude Code にはプラグインの優先度概念はないが、CLAUDE.md の階層（プロジェクト > ユーザー）の検証に応用可能 |
| `run-tests.sh`（テストランナー） | 同様の構造で、`--integration` フラグで Claude API 呼び出しを伴うテストを分離 |

### 3.2 subagent-driven-dev テスト構造の応用

| superpowers の要素 | aide-claude での対応 |
|---|---|
| `design.md` + `plan.md` の3点セット | AIDE のサブエージェント駆動開発スキルの E2E テストに同じパターンを採用。design.md + plan.md + scaffold.sh でテストプロジェクトを定義 |
| `scaffold.sh`（プロジェクト初期化） | `.claude/settings.local.json` の代わりに CLAUDE.md やプロジェクト固有の設定を配置 |
| `run-test.sh`（Claude 非対話実行） | `claude -p` による非対話実行パターンをそのまま踏襲。`--dangerously-skip-permissions` で自動テスト化 |
| トークン使用量の追跡 | `--output-format stream-json` + `jq` によるトークン追跡パターンを採用し、スキルのコスト効率を測定 |

### 3.3 テスト設計の重要ポイント

1. **隔離環境の構築が必須**: `setup.sh` で `$HOME` を一時ディレクトリに差し替えるパターンは、テストが本番環境を汚染しないために不可欠
2. **単体テストと統合テストの分離**: OpenCode/Claude 不要のテスト（ファイル構造検証）と必要なテスト（LLM 呼び出し）を明確に分離し、CI での実行コストを制御
3. **マーカー文字列による検証**: テストフィクスチャにユニークなマーカー（`PERSONAL_SKILL_MARKER_12345` 等）を埋め込み、出力に含まれるかで動作を検証するパターンは LLM テストに有効
4. **タイムアウト設定**: LLM 呼び出しには `timeout 60s` を設定し、ハングを防止

---

## 情報源

| ファイルパス | 内容 |
|---|---|
| `references/superpowers/tests/opencode/run-tests.sh` | テストランナー |
| `references/superpowers/tests/opencode/setup.sh` | テスト環境セットアップ |
| `references/superpowers/tests/opencode/test-plugin-loading.sh` | プラグイン読み込みテスト |
| `references/superpowers/tests/opencode/test-tools.sh` | ツール動作テスト |
| `references/superpowers/tests/opencode/test-priority.sh` | スキル優先度テスト |
| `references/superpowers/tests/subagent-driven-dev/run-test.sh` | サブエージェントテストランナー |
| `references/superpowers/tests/subagent-driven-dev/go-fractals/design.md` | Go Fractals 設計書 |
| `references/superpowers/tests/subagent-driven-dev/go-fractals/plan.md` | Go Fractals 実装計画 |
| `references/superpowers/tests/subagent-driven-dev/go-fractals/scaffold.sh` | Go Fractals スキャフォールド |
| `references/superpowers/tests/subagent-driven-dev/svelte-todo/design.md` | Svelte Todo 設計書 |
| `references/superpowers/tests/subagent-driven-dev/svelte-todo/plan.md` | Svelte Todo 実装計画 |
| `references/superpowers/tests/subagent-driven-dev/svelte-todo/scaffold.sh` | Svelte Todo スキャフォールド |
