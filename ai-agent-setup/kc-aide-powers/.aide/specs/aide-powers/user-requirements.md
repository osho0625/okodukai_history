# ユーザー要件書 — aide-powers

## 1. プロジェクト概要

### 1.1 目的

aide-powers は **AIエージェントにドキュメント駆動開発を教えるフレームワーク** である。「AI-Driven Engineering」の略で、要件確認 → 設計 → 実装 → レビュー という規律ある工学的プロセスを AIエージェントに踏ませることで、AI が生成するコードの品質と一貫性を確保する。

### 1.2 対象ユーザー

- **AIエージェントを使うソフトウェア開発者**（京セラグループ内部）
- 複数の AI コーディングアシスタント（Kiro IDE/CLI、Claude Code、GitHub Copilot、Gemini CLI、Cursor、Codex）を業務で使用するエンジニア
- AI に「とりあえずコードを書かせる」のではなく、工学的プロセスに基づいた開発を行いたい人

### 1.3 解決する問題

| 問題 | aide-powers による解決 |
|---|---|
| AI が要件確認なしにコードを書き始める | 7つのワークフローで段階的プロセスを強制 |
| AI 生成コードの品質にばらつきがある | 多段レビュー（設計準拠＋コード品質）で品質を保証 |
| プラットフォームごとに AI の使い方が異なる | 8プラットフォーム共通のワークフロー・品質基準を提供 |
| セッション間で作業が途切れる | セッション引き継ぎ・進捗管理で継続性を確保 |
| 設計書とコードが乖離する | 設計ゲート・設計準拠レビューで整合性を維持 |

---

## 2. 要件一覧（MoSCoW 分類）

### 2.1 Must（必須）— フレームワークとして不可欠な機能

| ID | 要件 | 目的 | 手段 | 情報源 |
|---|---|---|---|---|
| UR-001 | 7つのワークフロー（企画/設計/実装/逆引き/変更/バグ修正/リファクタリング）を提供すること | ソフトウェア開発の全局面をカバーする | フェーズスキル群（fs-*）による段階的処理 | program-structure.md §7つのワークフロー, system-requirements.md §1.3 |
| UR-002 | ハブスキル（using-aide-powers）によるワークフロー自動選択を実現すること | ユーザーが自然言語で話しかけるだけで適切なワークフローが起動する | ユーザー発話からのQuick Routing判定 | program-structure.md §エントリポイント, system-requirements.md §1.4 |
| UR-003 | 8種のAIプラットフォームで同一のワークフロー・品質基準を提供すること | プラットフォーム間の体験差をなくす | ブートストラップ層＋ツールマップ層＋セットアップ層 | system-requirements.md §2.3, §2.4, §7.1 |
| UR-004 | 12種のサブエージェントによる専門分業を実現すること | レビュー・実装・進捗管理を専門化し品質を確保する | QAレビューアー5種＋コードレビューアー2種＋実装1種＋最終監査2種＋進捗管理2種 | program-structure.md §agents/, system-requirements.md §4.1 |
| UR-005 | 多段コードレビュー（設計準拠＋コード品質の2段階）を提供すること | 設計との整合性とコード内部品質を同時に保証する | design-review-agent（外を見る）＋ code-review-agent（中を見る）による並列レビュー | program-structure.md §multi-stage-code-review, §design-review-agent, §code-review-agent |
| UR-006 | 設計QAゲート（4ゲート）を提供すること | 設計品質を各段階で検証し、基準未達の設計を先に進めない | QAエージェント5種によるAPPROVED/REJECTED判定 | program-structure.md §エージェント間の役割分担マトリクス, system-requirements.md §4.4 |
| UR-007 | 進捗管理機構（中断再開・進捗ファイル・フェーズレポート）を提供すること | セッション中断からの正確な再開と作業状態の可視化 | progress-resume-check＋progress-updater＋progress-final-checker＋step-history-writer | system-requirements.md §3.2, §3.3, §5.1-5.3 |
| UR-008 | セッション引き継ぎ機構を提供すること | AI のコンテキスト限界を超える長期作業の継続性を確保する | session-handover スキルによる引き継ぎファイル生成・読み込み | program-structure.md §session-handover, system-requirements.md §3.1 |
| UR-009 | 設計ゲート（design-gate）による設計書なし実装の防止を実現すること | 設計なしのコード生成を防ぎ、設計駆動開発を強制する | doc-index.mdのコア4ファイル存在・完了確認 | program-structure.md §design-gate, system-requirements.md §4.2 (BLOCKED伝播) |
| UR-010 | 共通スキル群（36種）による横断的ユーティリティを提供すること | git操作・タスク管理・技術調査・問題管理等の共通処理を標準化する | 各スキルのactivate/呼び出しによるルール強制 | program-structure.md §共通スキル群 詳細解析 |
| UR-011 | ファイルベースのデータ管理（外部DB不使用）を実現すること | 追加インフラ不要で、Git管理可能な設計書・進捗を維持する | .aide/specs/{feature_name}/ 配下のMarkdownファイル群 | system-requirements.md §3.1, dev-environment.md §1 |
| UR-012 | エラーハンドリング体系（BLOCKED/NEEDS_CONTEXT/NEEDS_FIX/REJECTED/FAIL/NEEDS_IMPL_RECHECK）を提供すること | AIエージェントの処理中断を体系的に分類し適切な対処を可能にする | サブエージェント→フェーズスキル→ユーザーの伝播ルール | system-requirements.md §4.1, §4.2, §4.3 |
| UR-013 | セットアップスクリプト（setup.bat/setup.sh）によるインストールを提供すること | 非開発者でもメニュー選択式で各プラットフォームへの配布が可能 | インタラクティブメニュー→ファイルコピー配置 | system-requirements.md §7.1 NF-3, dev-environment.md §7.1 |
| UR-014 | ワークフロー中止メカニズムを提供すること | ユーザーがいつでも安全に作業を中断できる | final-check中止モード（mode=abort）→成果物確認削除→終了 | system-requirements.md §4.5 |
| UR-015 | ルール配布機構（rules-distribute）によるAIコンテキストへの自動ルール注入を実現すること | AIが常にフレームワークのルールに従って動作することを保証する | プラットフォーム別ルールファイル生成・配置 | program-structure.md §rules-distribute, system-requirements.md §2.4 |

### 2.2 Should（重要だが必須ではない）— 品質・利便性を高める機能

| ID | 要件 | 目的 | 手段 | 情報源 |
|---|---|---|---|---|
| UR-016 | visual-companion によるブラウザベースのビジュアル表示を提供すること | モックアップ・図表・選択肢をブラウザで視覚的に確認できる | Node.js WebSocketサーバー＋HTML配信 | program-structure.md §visual-companion |
| UR-017 | task-orchestration による大量・反復タスクの計画的実行を提供すること | 3件以上の同一パターン変更や複雑なタスクを精度よく完遂する | 計画書作成→計画に基づく実行。AIのセルフトリガー | program-structure.md §task-orchestration |
| UR-018 | user-profile-management によるユーザーレベル適応を提供すること | 技術レベルに応じたコミュニケーション粒度の自動調整 | 3軸×5段階のプロファイル推定＋git config user.email識別 | program-structure.md §user-profile-management |
| UR-019 | pending-issues-management による残課題管理を提供すること | スコープ外の問題を取りこぼさず記録・追跡する | pending-issues.mdへの記録＋WF開始/完了時チェック | program-structure.md §pending-issues-management |
| UR-020 | tech-investigation による技術調査支援を提供すること | 設計・実装判断の前に技術的裏付けを取る | Web検索活用＋構造化された調査結果の返却 | program-structure.md §tech-investigation |
| UR-021 | doc-index-maintenance による設計書一覧管理を提供すること | 全設計書の存在と状態を一元的に把握する | doc-index.mdの作成・更新・削除・整合性チェック | program-structure.md §doc-index-maintenance |
| UR-022 | design-sync による設計書と実装の同期を提供すること | レビューで検出された乖離を安全に解消する | 乖離検出→分類→修正案作成→ユーザー承認→設計書更新 | program-structure.md §design-sync |
| UR-023 | doc-sync による差分設計書のマージを提供すること | 変更/バグ修正/リファクタリング後の差分設計を正式設計書に反映する | delta-design/fix-design/refactoring-design → 正式設計書への統合 | program-structure.md §doc-sync |
| UR-024 | folder-merge-check による起因元フォルダ統合判定を提供すること | 変更・バグ修正時に関連ドキュメントフォルダの統合可否を管理する | 起因元確認→ユーザー承認→ファイル移動→history.md更新 | program-structure.md §folder-merge-check |
| UR-025 | ローカルインストール（setup-local）によるグローバル非汚染テストを可能にすること | グローバル環境を汚さずに動作確認ができる | setup-local.bat/sh でワークスペース内にファイル配置 | dev-environment.md §7.3, system-requirements.md §7.4 NF-15 |
| UR-026 | APM パッケージ配布に対応すること | パッケージマネージャ経由での社内配布を実現する | apm.yml定義＋.apm/instructions/配下のソースファイル | program-structure.md §.apm/ |
| UR-027 | フック機構（SessionStart Hook）によるセッション開始時の自動初期化を提供すること | セッション開始時に自動的にフレームワークをロードする | hooks.json＋run-hook.cmd＋session-start（bash） | program-structure.md §hooks/ |

### 2.3 Could（あると良い）— 将来の拡張候補

| ID | 要件 | 目的 | 手段 | 情報源 |
|---|---|---|---|---|
| UR-028 | 自動テストフレームワークの導入 | インストーラ・スキル発動の回帰テストを自動化する | 未確定（現時点では手動検証のみ） | dev-environment.md §7.4, system-requirements.md §7.4 NF-13 |
| UR-029 | 開発ツール側（グローバル領域）の自動更新タイミング管理 | setup.bat 手動実行への依存を軽減する | 未確定（現状は開発者が必要に応じて手動実行） | dev-environment.md §15 |
| UR-030 | screenshot-capture によるGUI画面キャプチャ | GUIモックアップ確認時に画面を自動撮影する | .venv内pyautogui→撮影実行→保存 | program-structure.md §screenshot-capture |

### 2.4 Won't（対象外）— 明示的に行わないこと

| ID | 要件 | 理由 | 情報源 |
|---|---|---|---|
| UR-031 | Python アプリケーション化 | 配布物はMarkdown/bat/bash/JSONの集合体であり、Pythonアプリではない | dev-environment.md §1, system-requirements.md §1.1 |
| UR-032 | 外部データベースの使用 | 完全にファイルベースで管理し、追加インフラを不要とする方針 | system-requirements.md §3.1 |
| UR-033 | グローバル環境へのパッケージインストール | インストーラはファイルコピーのみ。グローバルpip/npm install禁止 | system-requirements.md §6.4, dev-environment.md §13 |
| UR-034 | 社外への配布 | Kyocera-Internal-Only ライセンス。京セラグループ内部限定 | system-requirements.md §6.1 |
| UR-035 | 従来型設計書（コア4ファイル）によるメタ開発管理 | フレームワーク自体のメタ開発ではスキル定義・エージェント定義が設計書を兼ねる | dev-environment.md §14 |

---

## 3. 前提条件・制約

### 3.1 運用上の前提条件

| # | 前提条件 | 情報源 |
|---|---|---|
| P-01 | 利用者は京セラグループ内部の社員であること | system-requirements.md §6.1 |
| P-02 | 利用者は対応AIプラットフォーム（8種のいずれか）のライセンスを持っていること | system-requirements.md §2.3 |
| P-03 | Git がインストールされていること | system-requirements.md §2.2, dev-environment.md §6 |
| P-04 | Windows 環境では Git for Windows がインストールされていること（bash 同梱） | dev-environment.md §6 |
| P-05 | visual-companion 使用時のみ Node.js が必要であること | system-requirements.md §2.2, dev-environment.md §6 |
| P-06 | Python を補助使用する場合は .venv に隔離すること | dev-environment.md §12, §13 |

### 3.2 技術的制約

| # | 制約 | 理由 | 情報源 |
|---|---|---|---|
| C-01 | セルフホスティング開発（aide-powers自体をaide-powersで開発する） | 開発対象と開発ツールが同一であるため、2つの役割を常に区別する必要がある | dev-environment.md §0, §11 |
| C-02 | リポジトリ編集が即時反映されない（setup.bat再実行が必要） | グローバル領域と開発対象が分離されているため | dev-environment.md §0 厳守ルール, system-requirements.md §7.2 NF-6 |
| C-03 | 自動テストなし（手動検証のみ） | Markdownフレームワークの性質上、自動テストが困難 | dev-environment.md §7.4, system-requirements.md §7.4 |
| C-04 | 50行超のファイル書き込み制限（Write+Append分割必須） | 一度に大量書き込み時の不具合防止 | system-requirements.md §7.6 NF-16 |
| C-05 | bat版とsh版の2系統維持が必要 | Windows と Linux/Mac/WSL の両OS対応 | dev-environment.md §4 |
| C-06 | UTF-8（BOMなし）統一、bat のみ CRLF | プラットフォーム互換性確保 | system-requirements.md §7.5 |
| C-07 | design-gate がメタ開発では適用対象外 | スキル定義・エージェント定義が設計書を兼ねるため | dev-environment.md §14 |
| C-08 | 社内GitLab単一リポジトリ管理 | 社内ネットワーク内でのバージョン管理 | dev-environment.md §8.3 |

### 3.3 品質方針

| # | 方針 | 情報源 |
|---|---|---|
| Q-01 | 動作確認はインストーラ実行確認＋ハブスキル発動確認の手動検証で行う | dev-environment.md §7.1, §7.2 |
| Q-02 | 全コミットは git-commit-workflow スキル経由で実施する（直接 git commit 禁止） | dev-environment.md §8.2, system-requirements.md §5.4 |
| Q-03 | git add -A / git add . 禁止（ファイル個別指定のみ） | dev-environment.md §8.2 |
| Q-04 | QAレビューの判定基準は FAIL=0 かつ WARNING=0 で APPROVED（全QAエージェント共通） | system-requirements.md §4.4 |
| Q-05 | コードレビューは ERROR=0 かつ WARNING=0 で APPROVED | program-structure.md §code-review-agent |

---

## 4. トレーサビリティマトリクス

### 4.1 情報源一覧

| 記号 | ファイル |
|---|---|
| PS | `.aide/specs/aide-powers/program-structure.md` |
| DE | `.aide/specs/aide-powers/dev-environment.md` |
| SR | `.aide/specs/aide-powers/system-requirements.md` |

### 4.2 要件→情報源マッピング

| 要件ID | PS | DE | SR | 主要参照セクション |
|---|---|---|---|---|
| UR-001 | ○ | — | ○ | PS:§7つのワークフロー, SR:§1.3 |
| UR-002 | ○ | — | ○ | PS:§エントリポイント, SR:§1.4 |
| UR-003 | — | — | ○ | SR:§2.3, §2.4, §7.1 |
| UR-004 | ○ | — | ○ | PS:§agents/, SR:§4.1 |
| UR-005 | ○ | — | — | PS:§multi-stage-code-review, §design-review-agent, §code-review-agent |
| UR-006 | ○ | — | ○ | PS:§エージェント間の役割分担マトリクス, SR:§4.4 |
| UR-007 | — | — | ○ | SR:§3.2, §3.3, §5.1-5.3 |
| UR-008 | ○ | — | ○ | PS:§session-handover, SR:§3.1 |
| UR-009 | ○ | — | ○ | PS:§design-gate, SR:§4.2 |
| UR-010 | ○ | — | — | PS:§共通スキル群 詳細解析 |
| UR-011 | — | ○ | ○ | SR:§3.1, DE:§1 |
| UR-012 | — | — | ○ | SR:§4.1, §4.2, §4.3 |
| UR-013 | — | ○ | ○ | SR:§7.1 NF-3, DE:§7.1 |
| UR-014 | — | — | ○ | SR:§4.5 |
| UR-015 | ○ | — | ○ | PS:§rules-distribute, SR:§2.4 |
| UR-016 | ○ | — | — | PS:§visual-companion |
| UR-017 | ○ | — | — | PS:§task-orchestration |
| UR-018 | ○ | — | — | PS:§user-profile-management |
| UR-019 | ○ | — | — | PS:§pending-issues-management |
| UR-020 | ○ | — | — | PS:§tech-investigation |
| UR-021 | ○ | — | — | PS:§doc-index-maintenance |
| UR-022 | ○ | — | — | PS:§design-sync |
| UR-023 | ○ | — | — | PS:§doc-sync |
| UR-024 | ○ | — | — | PS:§folder-merge-check |
| UR-025 | — | ○ | ○ | DE:§7.3, SR:§7.4 NF-15 |
| UR-026 | ○ | — | — | PS:§.apm/ |
| UR-027 | ○ | — | — | PS:§hooks/ |
| UR-028 | — | ○ | ○ | DE:§7.4, SR:§7.4 NF-13 |
| UR-029 | — | ○ | — | DE:§15 |
| UR-030 | ○ | — | — | PS:§screenshot-capture |
| UR-031 | — | ○ | ○ | DE:§1, SR:§1.1 |
| UR-032 | — | — | ○ | SR:§3.1 |
| UR-033 | — | ○ | ○ | SR:§6.4, DE:§13 |
| UR-034 | — | — | ○ | SR:§6.1 |
| UR-035 | — | ○ | — | DE:§14 |

---

*本文書は aide-powers リポジトリの既存実装から逆引きしたユーザー要件です。*
*情報源: program-structure.md, dev-environment.md, system-requirements.md（全て `.aide/specs/aide-powers/` 配下）*
