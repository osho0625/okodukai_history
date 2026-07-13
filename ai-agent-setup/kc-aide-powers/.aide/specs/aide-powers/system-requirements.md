# システム要件書 — aide-powers

## 1. システム構成概要

### 1.1 フレームワーク形態

aide-powers は **AIエージェント用ドキュメント駆動開発フレームワーク** である。「AI-Driven Engineering」の略で、要件確認 → 設計 → 実装 → レビュー という規律ある工学的プロセスを AIエージェントに踏ませることを目的とする。

本フレームワークはアプリケーションコード（Python / JavaScript 等）ではなく、**AIエージェントの振る舞いを制御するドキュメント・設定・スクリプトの集合体**として構成される。

### 1.1.1 移植元リポジトリ（kiro-agents）

aide-powers は、Kiro IDE のエージェント機構（Kiro Agents）で構成されたワークフローをマルチプラットフォーム対応するためにスキル化（Markdown ベースの汎用フレームワーク化）したものである。

| 項目 | 値 |
|---|---|
| 移植元リポジトリ | `http://10.110.47.117/takashi/kiro-agents` |
| 移植元の構成 | Kiro IDE の `.kiro/agents/*.md` + `.kiro/steering/*.md` で構成されたエージェント群 |
| aide-powers との関係 | kiro-agents のエージェント定義 → aide-powers のスキル定義（SKILL.md）＋プロンプトテンプレート（*-prompt.md）に変換。1つの Kiro Agent が 1つのスキルまたはプロンプトテンプレートに対応する |
| 参照タイミング | スキル設計・変更時に移植元の意図・構成を確認する場合 |

#### 成り立ち

aide-powers は以下の経緯で誕生した:

1. **Kiro IDE のエージェント機構（Kiro Agents）** で、ドキュメント駆動開発ワークフローを実現するエージェント群を構築（kiro-agents リポジトリ）
2. Kiro Agents は Kiro IDE 専用の `.kiro/agents/*.md` 形式で定義されているため、**他のAIエージェントプラットフォーム（Claude Code、Copilot、Cursor、Gemini、Codex 等）では動作しない**
3. 同一のワークフロー・品質基準を複数プラットフォームで提供するため、Kiro Agents のエージェント定義を **プラットフォーム非依存のスキル定義（Markdown）** に変換し、ツールマップによるプラットフォーム差異吸収レイヤーを追加したものが aide-powers

つまり aide-powers は「kiro-agents のマルチプラットフォーム移植版」であり、設計思想・ワークフロー構成・エージェント分担の原型は全て kiro-agents に由来する。

### 1.2 全体構成

| 構成要素 | 内容 | ファイル数 |
|---|---|---|
| スキル定義 | ワークフローの各フェーズ処理ロジック（Markdown） | 78フォルダ |
| エージェント定義 | サブエージェントの役割・プロンプト定義 | 12種 × 複数形式 |
| ステアリング／ルール | AIコンテキストへの自動注入指示文書 | 各プラットフォーム用 |
| フック設定 | セッション開始時トリガー | JSON + bash/cmd |
| インストーラ | 各プラットフォームへの配布スクリプト | bat/sh 4本 |
| ドキュメント | ユーザー向け・開発者向け説明書 | docs/ + docs-dev/ |
| 設計書・進捗 | aide-powers 自身の設計・管理領域 | .aide/specs/ |

### 1.3 7つのワークフロー

| ワークフロー | 用途 | フェーズ数 |
|---|---|---|
| 企画 (planning) | アイデア段階の構造化 | 4 |
| 設計 (design) | 要件→設計書の作成 | 11 |
| 実装 (impl) | 設計書→コードの実装 | 7 |
| 設計逆引き (reverse) | 既存コードから設計書復元 | 6 |
| 変更 (change) | 既存コードの仕様変更 | 3 |
| リファクタリング (refactoring) | 内部構造改善 | 7 |
| バグ修正 (bugfix) | 不具合の修正 | 3 |

### 1.4 起動メカニズム

```
[ユーザー発話]
  → [プラットフォームブートストラップ（自動注入）]
    → [ハブスキル using-aide-powers（activate）]
      → [フェーズスキル fs-{WF}-phase{N}-*（順次activate）]
        → [サブエージェント invoke（必要時）]
        → [共通スキル activate（横断処理）]
```

---

## 2. 技術スタック

### 2.1 使用言語・ファイル形式

| 言語/形式 | 用途 | 備考 |
|---|---|---|
| Markdown (.md) | スキル定義、エージェント定義、ドキュメント、設計書、ステアリング | 全成果物の大半 |
| JSON (.json) | Hook設定、プラグインメタデータ、Geminiエクステンション定義、エージェントJSON定義 | 設定・メタデータ |
| bat (.bat, .cmd) | Windows向けインストーラ・Hookラッパー | UTF-8 + chcp 65001 |
| bash (.sh) | Linux/Mac/WSL向けインストーラ・Hook | UTF-8, LF改行 |
| HTML/JavaScript (.html, .js, .cjs) | visual-companion スキルのローカルサーバ | Node.js 実行 |
| YAML (.yml) | APM パッケージ定義 | apm.yml |
| MDC (.mdc) | Cursor用ルール形式 | プラットフォーム固有 |

### 2.2 依存ツール

| ツール | 必須/任意 | 用途 |
|---|---|---|
| Git | 必須 | バージョン管理、リポジトリクローン、配布 |
| Git for Windows | Windows時 必須 | bash 同梱（Hook実行に使用） |
| PowerShell | Windows時 必須 | setup.bat内でJSON編集に使用 |
| Node.js | 任意 | visual-companion の server.cjs 実行時のみ |
| Python | 補助的 | スキル/ツールが使う場合のみ。.venv に隔離 |


### 2.3 対応プラットフォーム（8種）

| # | プラットフォーム | ブートストラップ形式 | エージェント呼出方式 | インストール先 |
|---|---|---|---|---|
| 1 | Kiro IDE | steering（自動注入） | `invoke_sub_agent` | `~/.kiro/` |
| 2 | Kiro CLI | steering + JSON agents | `subagent` | `~/.kiro/` |
| 3 | Claude Code | rules + hooks | `subagent` | `~/.claude/` |
| 4 | GitHub Copilot CLI | instructions | サブエージェント | `~/.copilot/` |
| 5 | VSCode Copilot | plugin + instructions | サブエージェント | `%APPDATA%\Code\agentPlugins\aide-powers\` |
| 6 | Cursor | .mdc rules | — | `~/.cursor/rules/` |
| 7 | Gemini CLI | extension + GEMINI.md | — | リポジトリ直接参照（`gemini extensions link .`） |
| 8 | Codex | INSTALL.md | — | `~/.agents/` |

### 2.4 マルチプラットフォーム対応メカニズム

| 層 | 役割 | 実装方式 |
|---|---|---|
| ブートストラップ層 | 各プラットフォーム固有形式でエントリポイント提供 | .md / .mdc / .instructions.md / GEMINI.md / INSTALL.md |
| ツールマップ層 | プラットフォーム間のツール名差異を吸収 | `references/{platform}-tools.md`（6種） |
| セットアップ層 | 正しいディレクトリにファイルを配置 | `setup.bat` / `setup.sh` のメニュー選択式 |
| スキル/エージェント本体 | プラットフォーム非依存の共通ロジック | Markdown で記述 |

---

## 3. データ管理

### 3.1 管理方式

aide-powers のデータ管理は完全にファイルベースである。データベースや外部ストレージは使用しない。

| データ種別 | 格納先 | 管理方式 |
|---|---|---|
| 設計書・要件定義 | `.aide/specs/{feature_name}/` | Git追跡対象 |
| 進捗ファイル | `.aide/specs/{feature_name}/*-progress.md` | Git追跡対象 |
| フェーズレポート | `.aide/tmp/` | 一時ファイル（WF完了後削除） |
| セッション引き継ぎ | `.aide/specs/{feature_name}/session-handover.md` | Git除外（ローカル作業ファイル） |
| ツールマップ・ルール（ワークスペース） | `.aide/references/` | Git除外（起動時コピー配置） |
| 残課題 | `.aide/specs/{feature_name}/pending-issues.md` | Git追跡対象 |
| ドキュメントインデックス | `.aide/specs/{feature_name}/doc-index.md` | Git追跡対象 |

### 3.2 .aide/specs/ の構造

各フィーチャー（開発案件）ごとにサブフォルダが作成され、ワークフロー全体の成果物と進捗を一元管理する。

```
.aide/specs/{feature_name}/
├── *-progress.md              # ワークフロー進捗ファイル（WF種別により命名）
├── doc-index.md               # ドキュメントインデックス（全設計書の登録簿）
├── pending-issues.md          # 残課題管理
├── session-handover.md        # セッション引き継ぎ（.gitignore対象）
├── user-requirements.md       # ユーザー要件定義
├── system-requirements.md     # システム要件定義
├── dev-environment.md         # 開発環境定義
├── program-structure.md       # プログラム構成書
├── layered-architecture.md    # レイヤードアーキテクチャ設計
├── gui-design.md              # GUI設計
├── object-design-*.md         # オブジェクト設計（レイヤー別）
├── infra-interface-design.md  # インフラIF設計
├── impl-task-list.md          # 実装タスクリスト
├── impl-process-checklist.md  # 実装工程チェック表
├── manual-test-plan.md        # 動作確認試験書
└── ...（WF種別により追加成果物）
```

### 3.3 進捗ファイルフォーマット

| 項目 | 内容 |
|---|---|
| ステータステーブル | 各フェーズの状態一覧（⬜未着手/🔄実行中/✅完了/🔧修正中/❌中止） |
| フェーズ詳細セクション | 各フェーズの開始日時・完了日時・成果物一覧 |
| 修正履歴テーブル | FIX-{連番}による修正追跡 |
| テスト結果欄 | リファクタリングWF用拡張 |

---

## 4. エラーハンドリング方針

### 4.1 AIエージェントのエラー分類

aide-powers では、AIエージェントの処理中断を以下の体系で分類する。

| エラー種別 | 意味 | 発生元 | 対処 |
|---|---|---|---|
| BLOCKED | 前提条件未充足で処理不可能 | サブエージェント | 呼び出し元が前提を満たして再実行 |
| NEEDS_CONTEXT | 追加情報が必要 | サブエージェント | 呼び出し元が不足情報を補完 |
| NEEDS_FIX | レビューで品質基準未達 | レビューエージェント | 実装エージェントに修正依頼 |
| REJECTED | 設計QAで承認拒否 | QAエージェント | 設計修正後に再レビュー |
| FAIL | フェーズ処理の失敗 | フェーズスキル/進捗管理 | ユーザーに通知し対応選択肢を提示 |
| NEEDS_IMPL_RECHECK | 実装漏れの疑い | test-coverage-audit-agent | Step1差し戻し推奨 |

### 4.2 エラー伝播ルール

```
サブエージェント → フェーズスキル（オーケストレータ）→ ユーザー

- サブエージェントは BLOCKED/NEEDS_CONTEXT/NEEDS_FIX/REJECTED を返却
- フェーズスキルは結果を解釈し、リトライ or ユーザー通知を判断
- FAIL 時はユーザーに対応選択肢を提示（やり直す/このまま進める/その他）
- ユーザー判断が絶対（AIが勝手に代替手段を取ることを禁止）
```

### 4.3 依頼受領時チェック（レビューエージェント共通）

コードレビューエージェント（code-review-agent, design-review-agent）は依頼受領時に7項目の前提チェックを行い、不備があれば即座に BLOCKED/NEEDS_CONTEXT を返却する。

| # | チェック項目 |
|---|---|
| 1 | 単一タスクIDが指定されているか |
| 2 | 対象が単一ファイルか |
| 3 | 複数レビュー同時依頼でないか |
| 4 | mode（implementation/test）が指定されているか |
| 5 | 設計書パスが渡されているか |
| 6 | 進捗表更新依頼の有無 |
| 7 | 設計参照セクション絞込が指定されているか |

### 4.4 QAレビューの判定基準

| QAエージェント | 判定基準 | 出力 |
|---|---|---|
| architecture-qa-agent | FAIL=0 かつ WARNING=0 | APPROVED / REJECTED |
| object-design-qa-agent | FAIL=0 かつ WARNING=0 | APPROVED / REJECTED |
| final-design-qa-agent | FAIL=0 かつ WARNING=0 | APPROVED / REJECTED |
| requirements-qa-agent | FAIL=0 かつ WARNING=0 | APPROVED / REJECTED |
| delta-design-qa-agent | FAIL=0 かつ WARNING=0 | APPROVED / REJECTED |

### 4.5 ワークフロー中止メカニズム

- ユーザーはいつでも中止を要求可能
- 中止要求を受けたフェーズは、最終フェーズスキル（`fs-{wf}-phaseN-final-check`）を中止モード（mode=abort）で activate
- 中止モードは作業成果物をユーザー確認のうえ削除（ソースコードは自動削除禁止）
- フェーズレポートを削除してワークフロー終了

---

## 5. ログ出力方針

### 5.1 フェーズレポート

| 項目 | 内容 |
|---|---|
| 格納先 | `.aide/tmp/` |
| ファイル名 | `fs-{wf}-phase{N}-report.txt` |
| 内容 | 各フェーズの実行結果・Step実行状況・サブエージェント出力 |
| ライフサイクル | WF完了時（final-check後処理）に全フェーズレポートを一括削除 |
| 記載ルール | サブエージェント実行結果は実行直後に即座に記載（末尾まとめ記載禁止） |

### 5.2 進捗ファイル

| 項目 | 内容 |
|---|---|
| 格納先 | `.aide/specs/{feature_name}/` |
| ファイル名 | `{wf-name}-progress.md` |
| 内容 | ステータステーブル + フェーズ詳細 + 修正履歴 |
| 更新タイミング | フェーズ開始時（verify）・完了時（write）・修正起票時（fix_open）・修正完了時（fix_close） |
| 更新主体 | progress-updater エージェント（フェーズスキルによる直接編集禁止） |

### 5.3 Step履歴

| 項目 | 内容 |
|---|---|
| 格納先 | `.aide/tmp/` |
| 管理スキル | `step-history-writer` |
| 用途 | final-check フェーズでの整合性検証に使用 |
| ライフサイクル | セッション内の作業追跡用（WF完了時削除） |

### 5.4 Git履歴による追跡

設計書・進捗ファイル等のGit追跡対象ファイルはコミット履歴により変更追跡を行う。コミットメッセージは日本語、`git-commit-workflow` スキル経由で作成する。

| コミットプレフィックス | 用途 |
|---|---|
| `docs:` | 企画・設計・設計逆引き |
| `feat:` | 実装・変更 |
| `test:` | テスト |
| `fix:` | バグ修正・変更 |
| `refactor:` | リファクタリング |

---

## 6. セキュリティ要件

### 6.1 ライセンス

| 項目 | 内容 |
|---|---|
| ライセンス種別 | Kyocera-Internal-Only |
| 配布範囲 | 京セラグループ内部のみ |
| ライセンスファイル | `LICENSE`（リポジトリルート） |

### 6.2 配布チャネル

| チャネル | 対象 | アクセス制御 |
|---|---|---|
| 内部GitLab | `http://10.110.47.117/kc-apm/kc-aide-powers.git` | パブリック（社内ネットワーク内） |
| APM パッケージ | `apm.yml` 定義に基づく配布 | 社内配布 |

### 6.3 機密情報管理（.gitignore）

以下のパターンでセキュリティ上の機密情報・ローカル作業情報をGit追跡から除外する。

| パターン | 保護対象 |
|---|---|
| `.env` / `.env.local` | 環境変数（API キー等） |
| `.venv/` / `venv/` | Python仮想環境（ローカル依存） |
| `node_modules/` | Node.js依存（ローカル） |
| `.aide/references/` | ワークフロー開始時コピー配置（正本はリポジトリ内） |
| `.aide/specs/**/session-handover*.md` | セッション引き継ぎ（ローカル作業ファイル） |
| `.kiro/` / `.claude/` / `.copilot/` / `.gemini/` / `.codex/` / `.github/` | AI Agent / IDE 生成ファイル（setup-localで配置されるもの含む） |
| `*.log` / `logs/` | ログファイル |
| `.aide/brainstorm/` | ブレインストーム作業領域 |

### 6.4 グローバル環境の非汚染

- インストーラ（setup.bat/sh）はファイルコピーのみを行い、グローバル環境にパッケージインストールしない
- 配布物は各プラットフォーム指定のディレクトリにコピー配置されるのみ
- Python を補助使用する場合は `.venv` に隔離（グローバルpip install禁止）

---

## 7. 非機能要件

### 7.1 マルチプラットフォーム対応（8種）

aide-powers は以下の8プラットフォームで同一のワークフロー・品質基準を提供する。

| 要件ID | 要件 | 実現方式 |
|---|---|---|
| NF-1 | 8プラットフォーム全てでハブスキルが起動すること | プラットフォーム別ブートストラップ |
| NF-2 | ツール名の差異を透過的に吸収すること | ツールマップ6種による変換テーブル |
| NF-3 | 配布はメニュー選択式で非開発者でも実行可能なこと | setup.bat/sh のインタラクティブメニュー |
| NF-4 | bat版とsh版で同一の配布結果を保証すること | 2系統維持ルール（改変時は両方更新） |

### 7.2 セルフホスティング開発

aide-powers 自体の開発は、aide-powers のワークフローを使用して行う（セルフホスティング）。

| 要件ID | 要件 |
|---|---|
| NF-5 | 開発ツール（グローバル領域の過去バージョン）と開発対象（リポジトリ）を明確に区別すること |
| NF-6 | リポジトリのスキル編集がグローバル領域に即時反映されないこと（setup.bat再実行が必要） |
| NF-7 | セルフホスティングの循環により混乱が生じないよう、dev-environment.md §0 で2つの役割を常に区別すること |

### 7.3 拡張性

| 要件ID | 要件 | 実現方式 |
|---|---|---|
| NF-8 | 新規ワークフローの追加が可能であること | `docs-dev/03-how-to/add-workflow.md` ガイド |
| NF-9 | 新規共通スキルの追加が可能であること | `docs-dev/03-how-to/add-common-skill.md` ガイド |
| NF-10 | 新規フェーズスキルの追加が可能であること | `docs-dev/03-how-to/add-phase-skill.md` ガイド |
| NF-11 | 新規エージェントの追加が可能であること | `docs-dev/03-how-to/add-agent.md` ガイド |
| NF-12 | 新規プラットフォーム対応の追加が可能であること | ツールマップ追加 + setup スクリプトメニュー追加 + ブートストラップ作成 |

### 7.4 動作確認

| 要件ID | 要件 |
|---|---|
| NF-13 | 自動テストフレームワークは導入しない（手動検証のみ） |
| NF-14 | インストーラ実行確認 + ハブスキル発動確認で動作検証すること |
| NF-15 | setup-local によるグローバル非汚染テストが可能であること |

### 7.5 文字エンコーディング・改行コード

| 対象 | エンコーディング | 改行コード |
|---|---|---|
| Markdown / JSON / 通常テキスト | UTF-8（BOM なし） | LF |
| bat スクリプト | UTF-8（BOM なし）+ chcp 65001 | CRLF |
| sh スクリプト | UTF-8 | LF |

### 7.6 ファイル書き込み制約

| 要件ID | 要件 | 理由 |
|---|---|---|
| NF-16 | 50行超のファイルは Write+Append で分割書き込みすること | 一度に大量書き込みすると完了しない不具合防止 |
| NF-17 | 大きいファイルは分割読み込みで全行取得すること | 部分ロードによる読み落とし防止 |

---

*本文書は aide-powers リポジトリのプロダクトとしてのシステム要件を記録したものです。*
*開発環境については `dev-environment.md`、プログラム構成については `program-structure.md` を参照してください。*
