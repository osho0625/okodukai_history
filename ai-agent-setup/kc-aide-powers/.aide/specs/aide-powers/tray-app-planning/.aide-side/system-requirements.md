# システム要件定義書: aide-powers

## 1. システム構成概要

### 1.1 アプリケーション形態

aide-powersは「AIエージェント向けスキル・エージェント定義・設定ファイルの集合体」であり、通常のアプリケーションではない。superpowers形式のプラグインとして構成され、各プラットフォームのAIエージェント機構上で動作する。

| 項目 | 内容 |
|---|---|
| 形態 | AIエージェントプラグイン（スキルベースフレームワーク）+ Windowsタスクトレイ管理アプリ |
| 実行環境 | 各プラットフォームのAIエージェントランタイム / Windows（タスクトレイアプリ） |
| 成果物の種類 | SKILL.md、agents/*.md、設定ファイル（plugin.json, hooks.json等）、CLAUDE.md/AGENTS.md、タスクトレイ管理アプリ（Python） |
| プログラムコード | タスクトレイ管理アプリ（Python）。スキル・エージェント定義はMarkdownベースの定義ファイルが主体。補助スクリプトあり |

### 1.2 全体アーキテクチャ

```
aide-powers プラグイン
├── CLAUDE.md / AGENTS.md          ← 基盤ルール（常時読み込み）
├── skills/                         ← オーケストレータースキル群（オンデマンド読み込み）
│   ├── using-aide-powers/SKILL.md        ← メタスキル（オーケストレーター自動選択）
│   ├── planning-orchestrator/     ← 企画オーケストレーター
│   ├── design-orchestrator/       ← 設計オーケストレーター
│   ├── impl-orchestrator/         ← 実装オーケストレーター
│   ├── reverse-design-orchestrator/ ← 設計逆引きオーケストレーター
│   ├── change-orchestrator/       ← 変更オーケストレーター
│   ├── refactoring-orchestrator/  ← リファクタリングオーケストレーター
│   ├── bugfix-orchestrator/       ← バグ修正オーケストレーター
│   └── （superpowersから継承するスキル群）
├── agents/                         ← サブエージェント定義（40+ファイル）
├── hooks/                          ← セッション開始フック
└── プラットフォーム固有設定
    ├── .claude-plugin/plugin.json
    ├── .cursor-plugin/plugin.json
    ├── .github/plugin.json
    ├── .codex/INSTALL.md
    ├── .kiro/（ステアリング + スキル + エージェント）
    ├── .opencode/
    ├── GEMINI.md
    └── gemini-extension.json
```

## 2. 技術スタック

### 2.1 基盤フレームワーク

| 項目 | 技術 | 選定理由 |
|---|---|---|
| スキルシステム | Agent Skills標準（agentskills.io） | 8プラットフォーム共通のスキル定義形式。SKILL.mdフロントマター（name, description）による自動発見・オンデマンド読み込み |
| プラグイン配布 | superpowers形式プラグイン構造 | Claude Code `/plugin install`、Codex symlink、Kiro git clone、VSCode Agent Plugins等の各プラットフォーム配布方式に対応 |
| サブエージェント | 各プラットフォームのネイティブ機構 | Claude Code: Task、Codex: spawn_agent、Kiro: invokeSubAgent/subagent、VSCode: runSubagent |
| ルール注入 | 段階的コンテキスト投入（3段階） | セッション開始時→タスク開始時→サブエージェント派遣時の3段階でコンテキスト効率を最適化 |

### 2.2 ファイル形式

| ファイル種別 | 形式 | 用途 |
|---|---|---|
| スキル定義 | Markdown（YAMLフロントマター付き） | オーケストレーターのフェーズ管理ロジック |
| エージェント定義 | Markdown（YAMLフロントマター付き） | サブエージェントのシステムプロンプト |
| プラグインメタデータ | JSON（plugin.json） | プラグイン名・説明・バージョン |
| フック設定 | JSON（hooks.json） | セッション開始時のコンテキスト注入 |
| フック実行スクリプト | Shell script / CMD | SKILL.md読み込み・JSON出力 |
| ツールマッピング | Markdown | プラットフォーム間のツール名変換表 |
| 基盤ルール | Markdown（CLAUDE.md / AGENTS.md） | 常時適用のグローバルルール |

### 2.3 補助スクリプト

| スクリプト | 言語 | 用途 |
|---|---|---|
| hooks/session-start | Shell（bash） | セッション開始時にusing-aide-powers/SKILL.mdを読み込みJSON出力 |
| hooks/run-hook.cmd | CMD（Windows） | Windows環境でのフック実行ラッパー |
| brainstorming/scripts/server.cjs | Node.js（CommonJS） | ビジュアルコンパニオンのWebSocketサーバー（superpowersから継承） |
| brainstorming/scripts/helper.js | JavaScript | ビジュアルコンパニオンのクライアントヘルパー（superpowersから継承） |
| brainstorming/scripts/start-server.sh | Shell | サーバー起動スクリプト（superpowersから継承） |
| brainstorming/scripts/stop-server.sh | Shell | サーバー停止スクリプト（superpowersから継承） |

### 2.4 タスクトレイ管理アプリ

| 項目 | 技術 | バージョン | ライセンス | 用途 |
|---|---|---|---|---|
| 言語 | Python | 3.10+ | PSF License | アプリケーション本体 |
| タスクトレイ常駐 | pystray | 0.19.5 | LGPLv3 | システムトレイアイコン・右クリックメニュー・トースト通知 |
| ローカルWebサーバー | aiohttp | 3.x | Apache 2.0 | HTTP + WebSocket統合サーバー。ブラウザUIの静的ファイル配信とリアルタイム通信を提供（127.0.0.1バインド） |
| ブラウザ起動 | webbrowser | Python標準ライブラリ | PSF License | デフォルトブラウザでUI画面を開く |
| ストレージSDK | minio-py | 7.2.x | Apache 2.0 | S3互換ストレージからのバージョン監視・ダウンロード |
| exe化 | PyInstaller | 6.13.x | GPL v2（ブートローダー: Apache 2.0） | 単一exeファイルへのパッケージング |
| アイコン画像 | Pillow | 最新安定版 | HPND License | pystray依存。アイコン画像の生成・読み込み |
| スタートアップ登録 | winreg | Python標準ライブラリ | PSF License | Windowsレジストリ（HKCU\Run）によるスタートアップ登録 |

#### GUI技術の選定理由

- pystray + aiohttp + ブラウザUIの構成は、将来統合予定のdesk-agents（kiro-agent-desktop）と同じアーキテクチャである
- aiohttpはPython asyncioベースであり、pystrayの`run_detached()`と自然に共存できる（単一プロセスで完結）
- ブラウザUI（HTML/CSS/JS）により、モダンで表現力の高いUIを実現できる
- obra/superpowersのbrainstorming方式を参考にした通信アーキテクチャ（HTTP + WebSocket）を採用する
- 将来desk-agentsを統合する際に、UIコンポーネントやサーバー構成を共有できる

#### ストレージ抽象化設計

- Repositoryパターンで抽象化し、ストレージ実装を差し替え可能にする
- 初期実装: minio-py（MinIO S3互換API）
- 将来切り替え: boto3（AWS S3）への差し替えがRepository実装の追加のみで対応可能

#### 開発ツールランチャー機能

タスクトレイアプリは、社内プロキシ（Global Protect）対応のための環境変数を設定した状態で開発ツールを起動するランチャー機能を持つ。

| 環境変数 | 用途 |
|---|---|
| `NODE_EXTRA_CA_CERTS` | Node.jsのカスタムCA証明書 |
| `REQUESTS_CA_BUNDLE` | Python requestsのCA証明書 |
| `SSL_CERT_FILE` | OpenSSLのCA証明書 |
| `CURL_CA_BUNDLE` | curlのCA証明書 |
| `GIT_SSL_CAINFO` | GitのSSL CA証明書 |
| `SSL_CERT_DIR` | SSL証明書ディレクトリ |
| `ELECTRON_EXTRA_CA_CERTS` | Electron（Kiro IDE等）のCA証明書 |
| `UV_NO_SYNC` | uv同期無効化 |
| `UV_SYSTEM_PYTHON` | uvシステムPython使用 |
| `MCP_EXTRA_PATH` | MCPツールの追加パス |

- 証明書ファイルのパスは設定画面で指定可能（デフォルト: `C:\cert\` 配下）
- 起動可能な開発ツール: Kiro IDE、VSCode、Claude Code等（設定画面で追加可能）
- プロジェクトルートを指定してワークスペースとして開く

#### 環境変数管理機能

開発ツール起動時に設定する環境変数をGUIで管理する。

| 機能 | 説明 |
|---|---|
| 一覧表示 | 設定済みの環境変数（キー=値）を一覧表示 |
| 追加 | 新しい環境変数を追加 |
| 編集 | 既存の環境変数の値を変更 |
| 削除 | 不要な環境変数を削除 |
| プリセット | デフォルトで京セラ証明書関連の環境変数がプリセットされる |
| リセット | プリセットの初期状態に戻す |

- 環境変数は `%LOCALAPPDATA%\aide-powers\config.json` の `env_vars` セクションに保存
- 開発ツール起動時に、管理されている全環境変数を子プロセスの環境に設定してから起動する
- プリセットはセットアップ時に自動設定される（証明書パスはウィザードで入力した値を使用）

## 3. 対象プラットフォーム

### 3.1 8プラットフォーム対応一覧

| # | プラットフォーム | 対応方式 | スキル | サブエージェント | フック | 配布 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | Claude Code（メイン） | ネイティブ | ✅ SKILL.md | ✅ Task | ✅ hooks.json | ✅ /plugin install | メインターゲット |
| 2 | Codex CLI | symlink | ✅ SKILL.md | ✅ spawn_agent | ❌ | ✅ git clone+symlink | 実験的機能（multi_agent） |
| 3 | Kiro | git clone+コピー | ✅ SKILL.md | ✅ invokeSubAgent/subagent | ⚠️ ステアリングで代替 | ✅ git clone+コピー | ツールマッピング要作成 |
| 4 | Cursor | プラグイン | ✅ SKILL.md | ✅ Task | ✅ hooks-cursor.json | ✅ .cursor-plugin | |
| 5 | OpenCode | プラグイン | ✅ SKILL.md | ✅ @mention | ❌ | ✅ opencode.json | |
| 6 | Gemini CLI | 拡張 | ✅ activate_skill | ✅ .gemini/agents/ | ❌ | ✅ gemini-extension.json | サブエージェント対応済み（2026-04）。ユーザー対話はask_userツールで対応（Issue #22103モニター中） |
| 7 | Copilot CLI | プラグイン | ✅ skill | ✅ task | ✅ hooks.json | ✅ plugin install | |
| 8 | VSCode GitHub Copilot | Agent Plugins | ✅ SKILL.md | ✅ runSubagent | ✅ SessionStart | ✅ .github/plugin.json | 最も統合しやすい。PoC評価環境 |

### 3.2 プラットフォーム固有の対応事項

#### Kiro固有

- **ツールマッピングファイル（kiro-tools.md）の新規作成が必要**: Claude Codeのツール名（Read, Write, Edit, Bash, Task等）をKiroのツール名（readFile, fsWrite, strReplace, executePwsh, invokeSubAgent等）にマッピング
- **ブートストラップ方式**: 3候補を開発しながら試験して確定
  - 候補1（最初の実装ターゲット）: `inclusion: always`のステアリングファイル（`~/.kiro/steering/aide-bootstrap.md`）
  - 候補2: AGENTS.mdに記述
  - 候補3: Kiro Powersとしてバンドル（制約多い: agents/skills配布不可、常時アクティブ不可、CLI未対応）

#### VSCode GitHub Copilot固有

- **Agent Plugins（Preview）**: `.github/plugin.json`を追加するだけで対応可能
- **Claude形式の自動マッピング**: `.claude/agents/*.md`を自動検出し、ツール名を一部自動マッピング
- **ネストされたサブエージェント**: `chat.subagents.allowInvocationsFromSubagents`設定で再帰的呼び出し可能（最大深度5）— ただしaide-powersではフラット構造を維持

#### Gemini CLI固有

- **サブエージェント対応済み（2026-04正式リリース）**: `.gemini/agents/`配下にエージェント定義を配置することでサブエージェント駆動が可能
- **ユーザー対話**: サブエージェントからのask_user（ユーザー対話）は仕様上対応。Issue #22103で不具合報告あり、修正をモニター中

## 4. superpowersの仕組みの取り込み（REQ-M04対応）

### 4.1 構造化された報告形式（4ステータス管理）

| ステータス | 意味 | オーケストレーターの対応 |
|---|---|---|
| DONE | 完了 | レビューへ進む |
| DONE_WITH_CONCERNS | 完了だが懸念あり | 懸念を評価し、対処後レビューへ |
| NEEDS_CONTEXT | 情報不足 | フォアグラウンドモードのため、サブエージェントが直接ユーザーに質問可能 |
| BLOCKED | 完了不能 | 段階的対応: ①コンテキスト追加 ②高性能モデル ③タスク分割 ④ユーザーエスカレーション |

### 4.2 規律パターン（Iron Law + 多層防御）

- **Iron Law形式**: 「Xなしに、Yしてはならない」— 各オーケストレーターの核心ルール
- **多層防御**: 精神条項 + Red Flags + Common Rationalizations + Gate Function
- **精神条項**: 「Violating the letter of this rule is violating the spirit of this rule.」
- **説得原理の適用**: Authority（命令的言語）+ Commitment（スキル使用宣言義務）+ Social Proof（普遍的パターン）。Likingは使用禁止

### 4.3 検証パターン（ゲート関数 5ステップ）

IDENTIFY → RUN → READ → VERIFY → CLAIM

- aide-powersでの一般化: 「What command proves this claim?」→「What verification method proves this claim?」
- 設計書の整合性検証（DDD、SOLID準拠等）も「検証手段」に含める

### 4.4 多段階レビュー（2段階レビュー）

1. **第1段階: スペック準拠レビュー**（「何を作ったか」）— Do Not Trust the Report原則
2. **第2段階: コード品質レビュー**（「どう作ったか」）— 第1段階合格が前提

- 不合格時: オーケストレーター自身が修正せず、修正用サブエージェントを新規派遣（コンテキスト汚染防止）

### 4.5 構造化されたデバッグ手法（4フェーズ + 3回失敗ルール）

- **4フェーズ**: 根本原因調査 → パターン分析 → 仮説テスト → 実装
- **3回失敗ルール**: 3回修正に失敗したらアーキテクチャの問題と判断しエスカレーション
- **Iron Law**: `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`

## 5. 制限事項

### 5.1 プラットフォーム制約

| ID | 制約 | 影響 | 対策 |
|---|---|---|---|
| CON-01 | サブエージェントのネスト不可（Claude Code） | オーケストレーターが全サブエージェントを直接管理するフラット構造が必須 | フラット委譲構造で設計 |
| CON-02 | フォアグラウンドサブエージェントのリグレッション（Claude Code: Issue #34592、Kiro IDE/CLI: 同様の不具合発生時） | サブエージェントのユーザー対話が一時的に不能になる可能性 | バージョン固定で対応。不具合修正をモニターする |
| CON-03 | Gemini CLIのサブエージェント対話に不具合の可能性（Issue #22103） | サブエージェントからのask_userが正常動作しない報告あり。仕様上は対話可能の前提で設計する | 不具合修正をモニター。修正されるまではpending状態として把握する |
| CON-04 | Codex CLIのmulti_agentは実験的機能 | APIが変更される可能性 | Claude Codeをメインターゲットとし追従対応 |
| CON-05 | VSCode Agent Pluginsはpreview | 仕様変更の可能性 | スキル・エージェントの基本形式は安定。影響は配布方式に限定 |
| CON-06 | Kiro PowersはIDE専用（CLI未対応） | CLI環境ではPowersが使えない | ステアリングファイル方式で代替 |

### 5.2 スキルチェーン制約

| ID | 制約 | 影響 | 対策 |
|---|---|---|---|
| CON-07 | スキルチェーン間の自動遷移が未定義 | 企画完了→設計開始等の遷移を独自設計する必要あり | PoCで遷移パターンを検証し独自メカニズムを設計 |
| CON-08 | 大きなスキルファイル（change: ~830行、bugfix: ~800行） | コンテキスト圧迫の懸念 | 呼び出しテンプレート部分を別ファイルに分離 |
| CON-09 | CLAUDE.mdの推奨サイズ ~200行 | 基盤ルールの記述量に制限 | ~120行に圧縮。詳細はスキルに委譲 |

### 5.3 配布制約

| ID | 制約 | 影響 | 対策 |
|---|---|---|---|
| CON-10 | 社内限定配布（パブリック展開不可） | マーケットプレイス公開不可 | プライベートGitリポジトリから配布 |
| CON-11 | プラグインキャッシュの制約 | プラグインディレクトリ外のファイル参照不可 | `${CLAUDE_PLUGIN_ROOT}`変数を使用 |

### 5.4 タスクトレイアプリ制約

| ID | 制約 | 影響 | 対策 |
|---|---|---|---|
| CON-12 | タスクトレイアプリはWindows専用 | pystray自体はクロスプラットフォームだが、winreg等はWindows固有。macOS/Linuxでは動作しない | 方式B（git clone方式）を非Windows環境向けの代替手段として維持 |
| CON-13 | PyInstaller製exeのウイルス対策ソフト誤検知リスク | 社内配布時にウイルス対策ソフトがexeをブロックする可能性 | コード署名の導入検討。社内ウイルス対策ソフトの除外設定を配布手順に含める |
| CON-14 | pystrayの最終リリースが2023年9月 | 安定版として機能中だが開発が停滞。将来のWindows更新で互換性問題が発生する可能性 | Windows APIは変わりにくいため当面は問題なし。代替としてcrosstrayを監視 |
| CON-15 | 社内プロキシ（Global Protect）のオレオレ証明書が必要。証明書ファイルが存在しない環境では開発ツールランチャーが正常動作しない | 証明書ファイルの存在チェックを起動時に実施し、未設定の場合は設定画面への誘導メッセージを表示 |
| CON-16 | aiohttpサーバーのポート競合リスク | 他のローカルサーバーとポートが競合する可能性がある | ランダムな高ポート（49152〜65534）を使用し、競合時は順次試行する。使用ポートをトースト通知で告知 |

## 6. セキュリティ要件

### 6.1 配布のセキュリティ

| 項目 | 要件 |
|---|---|
| リポジトリアクセス | 社内メンバーのみがアクセス可能なプライベートGitリポジトリ |
| 認証方式 | 既存のgit認証情報ヘルパー（gh auth login等） |
| バックグラウンド自動更新 | 環境変数でトークンを設定（GITHUB_TOKEN / GH_TOKEN） |
| 誤公開防止 | プライベートリポジトリ設定の確認を配布手順に含める |

### 6.2 実行時のセキュリティ

| 項目 | 要件 |
|---|---|
| サブエージェントの権限 | toolsフィールドでホワイトリスト制限。不要なツールへのアクセスを防止 |
| オーケストレーターの実作業禁止 | ファイル書き込み・コード変更・git操作はサブエージェントに委譲。オーケストレーターは読み取り専用 |
| コンテキスト汚染防止 | 不合格時はオーケストレーター自身が修正せず、修正用サブエージェントを新規派遣 |
| 機密情報の取り扱い | aide-powers自体は機密情報を保持しない。ユーザープロジェクトの機密情報は各プラットフォームのセキュリティ機構に依存 |

### 6.3 タスクトレイアプリのセキュリティ

| 項目 | 要件 |
|---|---|
| ローカルWebサーバーのバインド | 127.0.0.1のみにバインドし、外部ネットワークからのアクセスを不可とする |
| MinIOアクセスキーの保管 | 設定ファイルに平文保存しない方針。Windows Credential Manager等のOS標準の資格情報管理機構の利用、または暗号化保存を検討する |
| exe配布の完全性 | MinIOからダウンロードしたexeのハッシュ検証を実施し、改ざんを検知する |

## 7. 非機能要件

### 7.1 パフォーマンス

| 項目 | 要件 |
|---|---|
| コンテキスト効率 | kiro版AIDEと同等かやや減少するトークン消費量（REQ-S01） |
| CLAUDE.mdサイズ | ~120行以内（推奨200行以下に収まる） |
| スキルの読み込み | オンデマンド読み込み。不要なスキルはコンテキストに含めない |
| サブエージェントのコンテキスト隔離 | プロンプトテンプレートで必要最小限のコンテキストを構築 |

### 7.2 可用性

| 項目 | 要件 |
|---|---|
| オフライン動作 | プラグインインストール後はオフラインで動作可能（AIモデルへのアクセスは各プラットフォーム依存） |
| バージョン固定 | ref指定でプラグインバージョンを固定可能 |
| フォールバック | フォアグラウンドサブエージェントのリグレッション発生時はClaude Codeバージョン固定で対応 |
| MinIOサーバーダウン時 | 方式A（タスクトレイアプリ方式）での新規インストール・更新ができなくなる。方式B（git clone方式）が補助経路として機能し、aide-powersの利用自体は継続可能 |

### 7.3 保守性・拡張性

| 項目 | 要件 |
|---|---|
| 変換優先順位 | planning → design → impl（PoC先行）→ CLAUDE.md → change → bugfix → refactoring → reverse |
| 再構成工程のドキュメント化 | 再構成の設計判断・手順を記録し、将来の更新・拡張に活用（REQ-S02） |
| プラットフォーム追加 | Agent Skills標準準拠により、将来のプラットフォーム追加が容易 |
| スキルの独立性 | 各オーケストレータースキルは独立して更新可能 |

### 7.4 インストール・展開

| 項目 | 要件 |
|---|---|
| インストール時間 | 10分以内（REQ-M07） |
| **方式A（タスクトレイアプリ方式）** | MinIOからsetup.bat/setup.exeをダウンロードし実行。タスクトレイアプリの初期設定ウィザードを経てプラグインをインストール。非エンジニア向け推奨方式。バージョン管理・更新通知・将来のdesk-agents対応を提供 |
| **方式B（git clone方式）** | superpowersと同じ手法でaide-powersをセットアップ。バージョン管理・更新通知・desk-agents等は非対応。エンジニアが手軽にaide-powersだけを使いたい場合の方式 |
| Claude Code | `/plugin install` でプライベートGitリポジトリから直接インストール（方式B） |
| チーム展開 | `.claude/settings.json`にプラグインソースを宣言し自動プロンプト |
| Codex CLI | git clone + symlink方式（方式B） |
| Kiro | git clone + ファイルコピー方式（セットアップスクリプト提供）（方式B） |
| VSCode Copilot | Agent Plugins（`.github/plugin.json`）または`.github/`配下にファイル配置（方式B） |
| 更新（方式A） | タスクトレイアプリがバージョン監視・通知。更新実行はユーザーの明示的トリガーのみ（全自動更新禁止） |
| 更新（方式B） | ref指定で自動更新、またはgit pull |

### 7.5 エラーハンドリング方針

aide-powersのスキル・エージェント定義ファイル部分は従来のログ出力方針は適用外。タスクトレイ管理アプリはPythonプログラムであるため、以下のエラーハンドリング・ログ出力方針を定義する。

#### サブエージェントのエラーハンドリング

| 状況 | 対応 |
|---|---|
| サブエージェントがBLOCKED | 段階的対応: ①コンテキスト追加 ②高性能モデル ③タスク分割 ④ユーザーエスカレーション |
| サブエージェントがNEEDS_CONTEXT | フォアグラウンドモードでサブエージェントが直接ユーザーに質問 |
| QAゲートでREJECTED | 修正用サブエージェントを新規派遣。オーケストレーターは修正しない |
| 3回修正失敗 | アーキテクチャの問題と判断しユーザーにエスカレーション |

#### フック実行のエラーハンドリング

| 状況 | 対応 |
|---|---|
| session-startスクリプト失敗 | セッションは継続。using-aide-powersスキルの手動呼び出しで代替 |
| SKILL.md読み込み失敗 | エラーメッセージを表示し、ユーザーにインストール状態の確認を促す |

#### タスクトレイアプリのログ出力方針

| 項目 | 内容 |
|---|---|
| ログライブラリ | Python標準 `logging` モジュール（`print` によるログ出力は禁止） |
| ログレベル定義 | `DEBUG`: 関数の引数・戻り値、MinIO API呼び出し詳細、aiohttp リクエスト詳細 / `INFO`: アプリ起動・終了、バージョンチェック結果、ダウンロード完了、プラグインインストール成功 / `WARNING`: MinIOサーバー接続タイムアウト（リトライ中）、aiohttpポート競合でフォールバック / `ERROR`: MinIOサーバー接続失敗（リトライ上限超過）、ファイルダウンロード失敗、レジストリ操作失敗 |
| ログ出力先 | ファイル（`%LOCALAPPDATA%\aide-powers\logs\aide-powers.log`）+ 標準エラー出力（デバッグ時） |
| ログフォーマット | `%(asctime)s [%(levelname)s] %(name)s: %(message)s` |
| 本番時のログレベル | `INFO` |
| デバッグ時の切り替え | 環境変数 `AIDE_LOG_LEVEL=DEBUG` または設定ファイルで切り替え |
| ログローテーション | `RotatingFileHandler`（最大5MB、バックアップ3世代） |

#### タスクトレイアプリのエラーハンドリング

| 状況 | 対応 |
|---|---|
| MinIOサーバー接続失敗 | リトライ（指数バックオフ）後、オフラインモードに移行。トースト通知でユーザーに告知 |
| ポート競合（aiohttpサーバー起動失敗） | 代替ポートを自動検出して起動。使用ポートをトースト通知で告知 |
| ダウンロードファイル破損 | ハッシュ検証で検知し、再ダウンロードを試行。失敗時はユーザーに通知 |
| レジストリ操作失敗 | エラーログ出力。スタートアップ登録失敗をユーザーに通知し、手動登録手順を案内 |

## 8. Must要件とのトレーサビリティ

| Must要件 | 対応するシステム要件 |
|---|---|
| REQ-M01: 既存AIDEと同等以上の成果物生成 | 7つのオーケストレータースキル + 40+サブエージェント定義で全成果物をカバー |
| REQ-M02: マルチプラットフォーム対応 | §3: 8プラットフォーム対応一覧。Agent Skills標準準拠 |
| REQ-M03: superpowers形式への最適化再構成 | §2: 技術スタック。superpowers形式のプラグイン構造を採用 |
| REQ-M04: superpowersの優れた仕組みの取り込み | §4: 5つの仕組み（4ステータス管理、Iron Law、ゲート関数、2段階レビュー、体系的デバッグ） |
| REQ-M05: サブエージェントのユーザー対話維持 | フォアグラウンドサブエージェントでAskUserQuestionパススルー。リグレッション時はバージョン固定 |
| REQ-M06: 社内限定配布 | §6.1: プライベートGitリポジトリからの配布 |
| REQ-M07: 容易なインストールと初回実行 | §7.4: 10分以内。`/plugin install`一発 |
| REQ-M08: オーケストレーター自動選択 | using-aide-powersメタスキル + CLAUDE.md選択ガイド + descriptionベース自動選択 |
| REQ-M09: 設計品質保証の維持・強化 | design-qa-agent（DDD、SOLID、QAゲート）+ superpowersの仕組みで補強 |
| REQ-M10: kiro専用AIDEの開発停止と移行 | aide-powersが全プラットフォーム共通のAIDEとなる |
| REQ-M11: オーケストレーターの実作業禁止の維持 | §6.2: オーケストレーターは読み取り専用。全実作業をサブエージェントに委譲 |
| REQ-M12: タスクトレイ管理アプリによるGUI管理 | §1.1: アプリケーション形態にタスクトレイ管理アプリを追加。§2.4: Python + pystray + aiohttp + Pillow + winreg + webbrowser で実現。ブラウザUIでモダンなGUIを提供 |
| REQ-M13: S3互換ストレージからの配布 | §2.4: minio-py 7.2.x でMinIO S3互換APIに接続。Repositoryパターンで抽象化し将来boto3への切り替え可能 |
| REQ-M14: バージョン監視と更新通知 | §2.4: minio-pyのstat_object/list_objectsでバージョン監視。pystray内蔵notify()で通知。§7.4: 更新実行はユーザーの明示的トリガーのみ（全自動更新禁止） |
| REQ-M15: 2つのセットアップ方式の並立 | §7.4: 方式A（タスクトレイアプリ方式）と方式B（git clone方式）を並立。§7.2: MinIOダウン時は方式Bが補助経路 |
| REQ-M16: プロジェクトルート管理と開発ツールランチャー | §2.4: 開発ツールランチャー機能。環境変数テーブルで証明書設定を定義。設定画面で証明書パス・ツールパスを管理 |
| REQ-M17: グローバル環境の非汚染 | §5（dev-environment.md）: venv + requirements.txt、node_modules + package.jsonでプロジェクトローカル管理 |
| REQ-M18: セットアップ時の証明書設定 | 初期設定ウィザード（WIZ-03の前）に証明書設定ステップを追加。ファイル存在検証を実施 |

## 9. 構成要素の規模見積もり

### 9.1 スキル（オーケストレーター）

| スキル | 元ファイル | 行数見積 |
|---|---|---|
| using-aide-powers（メタスキル） | orchestrator-index.md相当 | ~150行 |
| planning-orchestrator | agent-planning-orchestrator.md | ~420行 |
| design-orchestrator | agent-design-orchestrator.md | ~520行 |
| impl-orchestrator | agent-impl-orchestrator.md | ~660行 |
| reverse-design-orchestrator | agent-reverse-design-orchestrator.md | ~390行 |
| change-orchestrator | agent-change-orchestrator.md | ~830行 |
| refactoring-orchestrator | agent-refactoring-orchestrator.md | ~700行 |
| bugfix-orchestrator | agent-bugfix-orchestrator.md | ~800行 |

### 9.2 サブエージェント定義

| カテゴリ | エージェント数 | 備考 |
|---|---|---|
| 企画プロセス | 4 | source-material-organizer, tech-investigator, proposal-writer, proposal-reviewer |
| 設計プロセス | 11 | user-requirements-architect, system-requirements-architect, development-planner, system-architecture-designer, object-designer, usecase-lister, usecase-process-analyzer, usecase-usability-evaluator, usecase-improver, ddd-modeler, design-qa-agent |
| 設計逆引きプロセス | 8 | reverse-program-structure, reverse-dev-environment, reverse-system-requirements, reverse-user-requirements, reverse-architecture, reverse-object-design, reverse-infra-interface, reverse-gui-design |
| 変更プロセス | 8 | change-status-checker, change-requirements, change-impact-analyzer, change-approach-planner, change-delta-designer, change-impact-reviewer, change-task-planner, change-doc-syncer |
| バグ修正プロセス | 4 | bugfix-reporter, bugfix-analyzer, bugfix-planner, bugfix-designer |
| リファクタリングプロセス | 4 | refactoring-status-checker, refactoring-analyzer, refactoring-planner, refactoring-designer |
| 共通 | 7 | micro-impl-agent, design-review-agent, code-review-agent, doc-completion-delegator, git-committer, impl-design-sync, impl-planner, readme-generator |
| **合計** | **~47** | agents/*.md + steering/agent-*.md を統合 |

### 9.3 superpowersから継承するファイル

| 分類 | 件数 | 作業 |
|---|---|---|
| そのまま使う | 25件 | コピーのみ |
| 中身を差し替える | 30件 | AIDEのロジックに書き換え |
| 新規作成 | 1件 | kiro-tools.md |
| 不要 | 28件 | コピーしない |

## 10. リスク（システム要件レベル）

| ID | リスク | 影響度 | 対策 |
|---|---|---|---|
| SYS-RISK-01 | オーケストレータースキルのサイズ超過（change: ~830行） | 中 | 呼び出しテンプレートを別ファイルに分離。フェーズスキル分割も検討 |
| SYS-RISK-02 | スキルのdescription記述精度による誤選択 | 中 | CSO（Claude Search Optimization）: 「Use when...」形式でトリガー条件のみ記述 |
| SYS-RISK-03 | プラットフォーム間のツール名不一致 | 中 | 各プラットフォーム向けツールマッピングファイルを作成 |
| SYS-RISK-04 | 長時間セッションでのコンテキスト圧迫 | 中 | サブエージェント委譲でメインコンテキスト節約。自動コンパクション活用 |
| SYS-RISK-05 | 大量ファイル再構成時の品質低下 | 高 | 工程を細かく分割し各ステップで検証。TDDアプローチ（RED-GREEN-REFACTOR） |
| SYS-RISK-06 | PyInstaller製exeのウイルス対策ソフト誤検知 | 中 | コード署名の導入検討。社内ウイルス対策ソフトの除外設定を配布手順に含める |
| SYS-RISK-07 | pystrayの開発停滞（最終リリース2023年9月） | 中 | 安定版として機能中。Windows APIは変わりにくい。代替としてcrosstrayを監視 |
| SYS-RISK-08 | MinIOサーバーの可用性 | 高 | サーバーダウン時は方式A（タスクトレイアプリ方式）での新規インストール・更新が不可。方式B（git clone方式）を補助経路として維持 |
| SYS-RISK-09 | ローカルWebサーバーのポート競合 | 低 | ランダムな高ポート（49152〜65534）を使用し、競合時は順次試行する。代替ポート自動検出ロジックを実装 |
| SYS-RISK-10 | pystrayのLGPLv3ライセンスとPyInstallerバンドル | 低 | PyInstallerは動的リンク相当の扱い。生成されたexeにGPLは適用されない。ただしLGPLv3の条件（ソースコード提供義務等）を確認し遵守する |

---

*本文書はユーザー要件定義書（user-requirements.md）、開発企画書（planning-proposal.md）、技術調査結果（18件）、PoC計画書（poc-plan.md）、構成要素判定表（poc-framework-analysis.md）、タスクトレイアプリ技術スタック調査（09-tray-app-tech-stack.md）に基づき作成されたシステム要件定義書です。*
