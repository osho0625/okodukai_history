# superpowers テスト構造 詳細調査

## 要約

superpowersのテストは2カテゴリに分かれる。`tests/brainstorm-server/` はNode.js標準の `assert` モジュールとnpm `ws` パッケージを使ったユニット/統合テスト（WebSocketプロトコルとサーバー動作）。`tests/claude-code/` はClaude Code CLIをヘッドレスモード（`claude -p`）で実行し、スキルの振る舞いを検証するbashベースの統合テスト。aide-claudeでは、brainstorm-serverのテストパターン（自前テストランナー＋assert）をユニットテストに、claude-codeのテストパターン（CLIヘッドレス実行＋出力アサーション）をE2Eテストに応用できる。

---

## カテゴリ1: tests/brainstorm-server/（ユニットテスト）

### package.json

- **参照**: `references/superpowers/tests/brainstorm-server/package.json`
- **目的**: テスト用の依存関係とスクリプトを定義
- **内容**: `ws` パッケージ（v8.19.0）を唯一の依存として宣言。`npm test` で `node server.test.js` を実行
- **ポイント**: テストフレームワーク（Jest, Mocha等）を使わず、Node.js標準の `assert` モジュールで自前テストランナーを構築している。`ws` はテスト専用依存（本番コードには含まれない）

### server.test.js

- **参照**: `references/superpowers/tests/brainstorm-server/server.test.js`
- **目的**: brainstormサーバーの統合テスト。HTTP配信、WebSocket通信、ファイル監視、ブレインストーミングワークフロー全体を検証
- **実行方法**: `npm test`（= `node server.test.js`）
- **使用ライブラリ**: `child_process`（サーバープロセス起動）、`http`（HTTPリクエスト）、`ws`（WebSocketクライアント）、`fs`、`assert`
- **テスト構造**:
  - **Server Startup**（2件）: 起動時のJSON出力、state/server-info書き込み
  - **HTTP Serving**（7件）: 待機ページ表示、helper.js注入、Content-Type、フルHTML文書のそのまま配信、フラグメントのフレームテンプレートラップ、mtime順の最新ファイル配信、非HTMLファイル無視、404応答
  - **WebSocket Communication**（6件）: WebSocketアップグレード、ユーザーイベントのstdoutリレー、choiceイベントのstate/events書き込み、非choiceイベントの非書き込み、複数クライアント同時接続、切断クライアントのクリーンアップ、不正JSONの耐障害性
  - **File Watching**（5件）: 新規HTMLファイルでreload送信、HTML変更でreload送信、非HTMLファイルでreload非送信、新画面でstate/eventsクリア、screen-added/screen-updatedログ
  - **Helper.js / Frame Template検証**（2件）: helper.jsのAPI定義確認、frame-templateの構造確認
- **テストパターン**: サーバーを `spawn` で起動 → テスト実行 → `server.kill()` でクリーンアップ。非同期テストは `async/await` + `sleep` で待機。自前の `test(name, fn)` ラッパーでPASS/FAILカウント
- **aide-claudeへの示唆**: サーバーコンポーネントのテストパターンとして参考になる。テストフレームワーク不使用の軽量アプローチ。プロセス起動→検証→クリーンアップのライフサイクル管理が参考になる

### ws-protocol.test.js

- **参照**: `references/superpowers/tests/brainstorm-server/ws-protocol.test.js`
- **目的**: ゼロ依存WebSocketプロトコル実装のユニットテスト。フレームのエンコード/デコード、ハンドシェイク計算をサーバーから独立してテスト
- **実行方法**: `node ws-protocol.test.js`
- **使用ライブラリ**: `assert`、`crypto`（テストデータ生成用）。外部依存なし
- **テスト対象のエクスポート**: `computeAcceptKey(clientKey)`, `encodeFrame(opcode, payload)`, `decodeFrame(buffer)`, `OPCODES`
- **テスト構造**:
  - **WebSocket Handshake**（2件）: RFC 6455準拠のacceptキー計算、ランダムキーでのbase64検証
  - **Frame Encoding（server→client）**（7件）: 小/空/中/大フレーム、125/126バイト境界、closeフレーム、pongフレーム、マスクなし検証
  - **Frame Decoding（client→server）**（9件）: 小/空/中/大マスク付きフレーム、close/pingフレーム、不完全フレーム（null返却）、マスクなしクライアントフレーム拒否、複数フレームバッファ、マスク値検証
  - **Frame Size Boundaries**（4件）: 65535/65536バイト境界のエンコード/デコード
  - **Close Frame Details**（2件）: ステータスコード付きcloseフレーム、理由付きcloseフレーム
  - **JSON Roundtrip**（2件）: サーバーフレームのJSONラウンドトリップ、マスク付きクライアントJSONラウンドトリップ
- **テストパターン**: TDDアプローチ（テスト先行で実装前に書かれた）。`makeClientFrame` ヘルパーでマスク付きクライアントフレームを生成。境界値テストが充実
- **aide-claudeへの示唆**: プロトコルレベルのユニットテストの模範例。境界値テスト、RFC準拠テスト、エラーケーステストの網羅性が参考になる

### windows-lifecycle.test.sh

- **参照**: `references/superpowers/tests/brainstorm-server/windows-lifecycle.test.sh`
- **目的**: Windows（MSYS2/Git Bash）環境でのbrainstormサーバーのライフサイクルテスト。OWNER_PID監視がWindows環境で無効化される動作を検証
- **実行方法**: `bash tests/brainstorm-server/windows-lifecycle.test.sh`（リポジトリルートから実行、または `SUPERPOWERS_ROOT` を設定）
- **前提条件**: Node.jsがPATHに存在、Windows環境ではGit Bash（OSTYPE=msys*）
- **テスト構造**（6件）:
  1. **OWNER_PID is empty on Windows**: Windows環境でOWNER_PIDが空になることを確認（非Windowsではスキップ）
  2. **start-server.sh passes empty BRAINSTORM_OWNER_PID**: フェイクnodeを使ってstart-server.shが空のOWNER_PIDを渡すことを確認（非Windowsではスキップ）
  3. **Auto-foreground detection on Windows**: Windowsでフォアグラウンドモードが自動検出されることを確認（非Windowsではスキップ）
  4. **Server survives past 60-second lifecycle check**: 空OWNER_PIDでサーバーが75秒後も生存していることを確認（**75秒待機**）
  5. **Bad OWNER_PID causes shutdown (control)**: 存在しないPIDを指定するとサーバーが自己終了することを確認（**75秒待機**）
  6. **stop-server.sh cleanly stops the server**: stop-server.shでサーバーが正常停止することを確認
- **テストパターン**: プラットフォーム検出（`OSTYPE`）で非Windows環境のテストをスキップ。フェイクnodeバイナリで環境変数キャプチャ。`trap cleanup EXIT` でプロセスとtmpディレクトリのクリーンアップ。pass/fail/skipカウンタ
- **aide-claudeへの示唆**: クロスプラットフォームテストのパターンとして重要。Windows固有の問題（MSYS2 PID名前空間の不可視性）への対処方法。フェイクバイナリによる環境変数テスト手法が参考になる

---

## カテゴリ2: tests/claude-code/（統合テスト）

### README.md

- **参照**: `references/superpowers/tests/claude-code/README.md`
- **目的**: テストスイート全体のドキュメント。テスト構造、実行方法、追加方法を説明
- **要点**:
  - Claude Code CLIをヘッドレスモード（`claude -p`）で実行し、スキルの振る舞いを検証
  - **Fast Tests**（デフォルト実行、約2分）: スキルの内容・要件を検証
  - **Integration Tests**（`--integration` フラグ、10-30分）: 実際のワークフロー実行を検証
  - テスト追加手順: `test-<skill-name>.sh` を作成 → `test-helpers.sh` をsource → `run_claude` とアサーションで検証 → `run-skill-tests.sh` に追加

### test-helpers.sh

- **参照**: `references/superpowers/tests/claude-code/test-helpers.sh`
- **目的**: Claude Codeスキルテスト用の共通ヘルパー関数ライブラリ
- **提供関数**:
  - `run_claude "prompt" [timeout] [allowed_tools]`: Claude Code CLIをヘッドレスモードで実行し出力をキャプチャ
  - `assert_contains output pattern name`: 出力にパターンが含まれることを検証
  - `assert_not_contains output pattern name`: 出力にパターンが含まれないことを検証
  - `assert_count output pattern count name`: パターンの出現回数を検証
  - `assert_order output pattern_a pattern_b name`: パターンAがパターンBより前に出現することを検証
  - `create_test_project`: 一時テストディレクトリを作成
  - `cleanup_test_project`: テストディレクトリを削除
  - `create_test_plan project_dir [plan_name]`: サンプルプランファイルを作成
- **テストパターン**: `timeout` コマンドでCLI実行にタイムアウトを設定。`grep` ベースのパターンマッチでアサーション。`export -f` で関数をサブシェルにエクスポート
- **aide-claudeへの示唆**: CLIベースのE2Eテストフレームワークの核。aide-claudeでも同様のヘルパーライブラリを構築し、AIエージェントの振る舞いテストに活用できる

### run-skill-tests.sh

- **参照**: `references/superpowers/tests/claude-code/run-skill-tests.sh`
- **目的**: テストランナー。全テストの実行、フィルタリング、結果集計を担当
- **実行方法**:
  - 全Fast Tests: `./run-skill-tests.sh`
  - 統合テスト込み: `./run-skill-tests.sh --integration`
  - 特定テスト: `./run-skill-tests.sh --test test-subagent-driven-development.sh`
  - 詳細出力: `./run-skill-tests.sh --verbose`
  - タイムアウト設定: `./run-skill-tests.sh --timeout 1800`
- **機能**: Claude Code CLIの存在確認、テストファイルの実行権限自動付与、テストごとの実行時間計測、passed/failed/skippedカウント、verboseモードでの全出力表示
- **テスト一覧管理**: `tests` 配列にFast Tests、`integration_tests` 配列に統合テストを登録
- **aide-claudeへの示唆**: テストランナーの設計パターンとして直接流用可能。`--integration` フラグによるテスト分類、`--timeout` によるCI対応が参考になる

### test-subagent-driven-development.sh

- **参照**: `references/superpowers/tests/claude-code/test-subagent-driven-development.sh`
- **目的**: subagent-driven-developmentスキルの内容・要件をFast Testで検証（スキルが正しくロードされ、正しい情報を返すか）
- **実行方法**: `./run-skill-tests.sh` または直接 `bash test-subagent-driven-development.sh`
- **テスト構造**（9件）:
  1. **Skill loading**: スキルが認識されるか
  2. **Workflow ordering**: spec complianceがcode qualityより先か
  3. **Self-review requirement**: セルフレビューが言及されるか
  4. **Plan reading efficiency**: プランが1回だけ読まれるか
  5. **Spec compliance reviewer mindset**: レビュアーが懐疑的か
  6. **Review loops**: レビューループが存在するか
  7. **Task context provision**: タスクテキストが直接提供されるか（ファイル読み込みでなく）
  8. **Worktree requirement**: git worktreeが前提条件か
  9. **Main branch red flag**: mainブランチでの直接実装が警告されるか
- **テストパターン**: 各テストで `run_claude` に質問を投げ、`assert_contains` / `assert_not_contains` / `assert_order` で応答を検証。タイムアウト30秒/テスト
- **aide-claudeへの示唆**: AIスキルの「知識テスト」パターン。スキルが正しい情報を保持しているかをCLI経由で検証する手法。aide-claudeのスキル/プロンプトの品質保証に直接応用可能

### test-subagent-driven-development-integration.sh

- **参照**: `references/superpowers/tests/claude-code/test-subagent-driven-development-integration.sh`
- **目的**: subagent-driven-developmentスキルの実ワークフロー実行テスト。実際にプランを作成し、Claude Codeに実行させ、成果物を検証
- **実行方法**: `./run-skill-tests.sh --integration` または直接実行（10-30分かかる）
- **テスト構造**:
  - **セットアップ**: 一時プロジェクト作成、package.json・実装プラン（2タスク: add関数、multiply関数）・gitリポジトリを初期化
  - **実行**: `claude -p` でプランを実行（`--allowed-tools=all --permission-mode bypassPermissions`、タイムアウト1800秒）
  - **検証**（8件）:
    1. Skillツールが呼び出されたか（セッションJSONL解析）
    2. Subagent（Taskツール）が2つ以上ディスパッチされたか
    3. TodoWriteでタスク追跡されたか
    4. （欠番: Test 4, 5はコメントアウトまたは未実装）
    5. 実装ファイル（src/math.js）が作成され、add/multiply関数が存在するか
    6. テストファイル（test/math.test.js）が作成され、`npm test` が通るか
    7. gitコミットが3つ以上あるか
    8. 余分な機能（divide, power, subtract）が追加されていないか（spec compliance検証）
  - **トークン使用量分析**: `analyze-token-usage.py` でセッションのトークン消費を分析
- **テストパターン**: セッションJSONLファイル（`~/.claude/projects/` 配下）を解析してツール呼び出しを検証。`tee` で出力をファイルとターミナルに同時出力。`trap` でクリーンアップ
- **aide-claudeへの示唆**: E2Eワークフローテストの完全な参考実装。セッションJSONL解析によるツール呼び出し検証、実成果物の検証、トークン使用量分析の組み合わせが強力

### test-document-review-system.sh

- **参照**: `references/superpowers/tests/claude-code/test-document-review-system.sh`
- **目的**: ドキュメントレビューシステムの統合テスト。意図的にエラーを含むスペックを作成し、レビュアーがエラーを検出するかを検証
- **実行方法**: 直接実行（タイムアウト120秒）
- **テスト構造**:
  - **セットアップ**: 一時プロジェクト作成、意図的エラー入りスペック（TODOプレースホルダー、「specified later」の先送り記述）を作成、gitリポジトリ初期化
  - **実行**: `claude -p` でスペックレビューを実行（`--permission-mode bypassPermissions`）
  - **検証**（4件）:
    1. TODOが検出されたか
    2. 「specified later」の先送りが検出されたか
    3. Issues セクションが出力に含まれるか
    4. 承認されていないか（エラーがあるので不承認が正しい）
- **aide-claudeへの示唆**: AIレビュアーの品質テストパターン。意図的な欠陥を含む入力を与え、検出能力を検証する手法。aide-claudeのレビュー機能のテストに直接応用可能

### analyze-token-usage.py

- **参照**: `references/superpowers/tests/claude-code/analyze-token-usage.py`
- **目的**: Claude Codeセッショントランスクリプト（JSONL形式）からトークン使用量を分析するユーティリティ
- **実行方法**: `python3 analyze-token-usage.py <session-file.jsonl>`
- **機能**:
  - メインセッションとサブエージェント別のトークン使用量を集計
  - input_tokens, output_tokens, cache_creation, cache_read を分類
  - 推定コスト計算（$3/M input, $15/M output）
  - エージェントID別の内訳テーブル出力
- **使用ライブラリ**: Python標準ライブラリのみ（json, sys, pathlib, collections）
- **aide-claudeへの示唆**: トークンコスト分析ツールとして直接流用可能。aide-claudeのコスト最適化やパフォーマンス計測に活用できる

---

## テスト構造の全体像

```
tests/
├── brainstorm-server/          # ユニット/統合テスト（Node.js）
│   ├── package.json            # テスト依存（ws パッケージのみ）
│   ├── server.test.js          # サーバー統合テスト（HTTP, WS, ファイル監視）
│   ├── ws-protocol.test.js     # WebSocketプロトコル ユニットテスト
│   └── windows-lifecycle.test.sh  # Windows環境ライフサイクルテスト
│
└── claude-code/                # CLIベース統合テスト（bash）
    ├── README.md               # テストスイートドキュメント
    ├── test-helpers.sh         # 共通ヘルパー関数
    ├── run-skill-tests.sh      # テストランナー
    ├── test-subagent-driven-development.sh          # Fast Test（スキル知識検証）
    ├── test-subagent-driven-development-integration.sh  # 統合テスト（ワークフロー実行）
    ├── test-document-review-system.sh               # 統合テスト（レビュー検証）
    └── analyze-token-usage.py  # トークン使用量分析ユーティリティ
```

## テスト分類と実行時間

| カテゴリ | テスト種別 | 実行時間 | 外部依存 |
|---|---|---|---|
| brainstorm-server/server.test.js | 統合テスト | 数十秒 | ws (npm) |
| brainstorm-server/ws-protocol.test.js | ユニットテスト | 数秒 | なし |
| brainstorm-server/windows-lifecycle.test.sh | 環境テスト | 約3分（75秒×2待機） | Node.js |
| claude-code/Fast Tests | スキル知識テスト | 約2分 | Claude Code CLI |
| claude-code/Integration Tests | ワークフロー実行テスト | 10-30分 | Claude Code CLI |

## aide-claudeへの示唆まとめ

### 採用すべきパターン

1. **自前テストランナー**: テストフレームワーク不使用の軽量アプローチ（assert + pass/fail カウンタ）
2. **テストヘルパーライブラリ**: `test-helpers.sh` のような共通関数群をaide-claude用に構築
3. **Fast/Integration分離**: `--integration` フラグによるテスト分類でCI時間を制御
4. **セッションJSONL解析**: ツール呼び出し・トークン使用量の事後検証
5. **意図的欠陥テスト**: レビュー機能の品質保証に欠陥入り入力を使用
6. **クロスプラットフォーム対応**: `OSTYPE` によるプラットフォーム検出とスキップ

### aide-claudeで追加すべきテスト

1. **AIDEスキルの知識テスト**: superpowersの `test-subagent-driven-development.sh` パターンを流用
2. **ワークフローE2Eテスト**: 実プロジェクトでのスキル実行と成果物検証
3. **トークンコスト分析**: `analyze-token-usage.py` を流用してコスト最適化

---

## 情報源

| ファイル | 参照パス |
|---|---|
| package.json | `references/superpowers/tests/brainstorm-server/package.json` |
| server.test.js | `references/superpowers/tests/brainstorm-server/server.test.js` |
| ws-protocol.test.js | `references/superpowers/tests/brainstorm-server/ws-protocol.test.js` |
| windows-lifecycle.test.sh | `references/superpowers/tests/brainstorm-server/windows-lifecycle.test.sh` |
| README.md | `references/superpowers/tests/claude-code/README.md` |
| test-helpers.sh | `references/superpowers/tests/claude-code/test-helpers.sh` |
| run-skill-tests.sh | `references/superpowers/tests/claude-code/run-skill-tests.sh` |
| test-subagent-driven-development.sh | `references/superpowers/tests/claude-code/test-subagent-driven-development.sh` |
| test-subagent-driven-development-integration.sh | `references/superpowers/tests/claude-code/test-subagent-driven-development-integration.sh` |
| test-document-review-system.sh | `references/superpowers/tests/claude-code/test-document-review-system.sh` |
| analyze-token-usage.py | `references/superpowers/tests/claude-code/analyze-token-usage.py` |
