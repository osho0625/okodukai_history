# aide-powers 共通用語辞書（ubiquitous-language.md）

## この辞書の目的

aide-powers のドキュメント（開発者向け / 利用者向け）を執筆する際、章をまたいで
用語の表記揺れや定義のブレが起きないようにするための共通辞書である。

開発者向けドキュメント（docs-dev/）の章別生成プロンプト、利用者向けドキュメントの
文章整形プロンプト、章間レビュープロンプトは、すべてこの辞書を参照し、
ここで定義された正式名称・定義・分類に従って記述すること。

新しい用語を導入する場合、または既存用語の定義に疑義が生じた場合は、
ドキュメント本文を書き換える前に必ずこの辞書を更新する。

---

## 1. プロジェクト全体

| 用語 | 英語表記 | 定義 |
|---|---|---|
| aide-powers | aide-powers | AI Agent によるドキュメント駆動開発を高度化するためのフレームワーク。スキル群（skills/）、共通エージェント定義（agents/）、ルール定義、配布スクリプト（setup.bat / setup.sh 等）で構成される。名称の「aide」は **AI-Driven Engineering**（AI駆動のエンジニアリング＝思いつきのコーディングではなく、要件定義 → 設計 → 実装 → レビューという規律ある工学的プロセスを AI に駆動させること）の略であり、英単語 aide（補佐役・支援者）にも掛けている |
| ドキュメント駆動開発 | document-driven development | 要件定義 → 設計 → 実装 → レビューの各段階で必ず文書を作成・確認しながら進める開発手法。aide-powers が AI Agent に強制する基本原則 |
| ハブスキル方式 | hub-skill activation | AI Agent が会話開始時にまずハブスキル（using-aide-powers）を読み込み、そこから他スキルへ遷移していく方式。AI Agent が自分で必要なスキルを発見する代わりに、ハブを起点に確実なルーティングを行う |
| マルチプラットフォーム対応 | multi-platform support | aide-powers が Kiro IDE / Claude Code / Cursor / OpenCode / GitHub Copilot（CLI + VSCode）/ Gemini CLI / Codex の各プラットフォームで動作する性質。プラットフォームごとに配置先・ツール名が異なるため、ツールマップで吸収する |
| 配布単位 | distribution package | aide-powers をリポジトリとして配布する単位。`git clone` してから `setup.bat` / `setup.sh` を実行することで各プラットフォームに展開される |

## 2. ワークフロー

| 用語 | 英語表記 | 定義 |
|---|---|---|
| ワークフロー | workflow | 開発プロセスをフェーズ単位に分解した一連のスキル群。aide-powers は7種類のワークフローを提供する |
| 企画ワークフロー | planning workflow | アイデアから開発企画書（planning-proposal.md）を作成するワークフロー。エントリポイント: `fs-planning-intake-and-init` |
| 設計ワークフロー | design workflow | 要件定義からプログラム構成設計までを行うワークフロー。11フェーズで構成。エントリポイント: `fs-design-phase1-user-req` |
| 実装ワークフロー | implementation workflow | 設計書に基づいてコードを実装するワークフロー。エントリポイント: `fs-impl-phase1-gate` |
| 設計逆引きワークフロー | reverse-design workflow | 既存コードから設計書を逆生成するワークフロー。エントリポイント: `fs-reverse-phase1-program` |
| 変更ワークフロー | change workflow | 既存コードに機能追加・仕様変更を加えるワークフロー。エントリポイント: `fs-change-phase1-analysis` |
| バグ修正ワークフロー | bugfix workflow | 既存コードのバグを修正するワークフロー。エントリポイント: `fs-bugfix-phase1-analysis` |
| リファクタリングワークフロー | refactoring workflow | 外部振る舞いを変えずに内部構造を改善するワークフロー。エントリポイント: `fs-refactoring-phase1-status` |
| エントリポイントスキル | entry-point skill | 各ワークフローの先頭フェーズスキル。Quick Routing でユーザー発話から特定される |
| Quick Routing | Quick Routing | ユーザー発話から最初に呼ぶべきフェーズスキルを特定するルーティング機構。using-aide-powers および global-rules.md に記述されている |
| フェーズ | phase | ワークフロー内で順序を持った作業単位。1フェーズ = 1フェーズスキル |
| QAゲート | QA gate | 設計ワークフローで設定された4つの品質審査ポイント（ゲート1〜4）。各ゲートで対応するQAレビューアーエージェントが APPROVED / REJECTED を判定する |
| 設計書ゲート | design gate | 実装系ワークフロー（実装・変更・リファクタリング・バグ修正フェーズ2）の入口に置かれるハードゲート。doc-index.md と各設計書の状態を機械的に確認する |

## 3. スキル

| 用語 | 英語表記 | 定義 |
|---|---|---|
| スキル | skill | aide-powers がプラットフォーム横断で提供する機能定義単位。`skills/{skill-name}/SKILL.md` 形式で記述される |
| フェーズスキル | phase skill | ワークフローの各フェーズに対応するスキル。命名規則は `fs-{workflow}-phase{N}-{name}`（例: `fs-design-phase1-user-req`）。フェーズスキルはワークフロー実行中に1回だけ呼ばれ、進捗管理・サブエージェント委譲・ユーザー対話を担う |
| 共通スキル | common skill | 複数のワークフローから呼び出される再利用可能なスキル。命名規則はフェーズスキルとは異なり、機能名がそのままスキル名になる（例: `design-gate`, `doc-sync`, `multi-stage-code-review`） |
| ハブスキル | hub skill | 全スキルの起点となる using-aide-powers スキル。会話開始時に必ず読み込まれ、ワークフロー選択と初期化を司る |
| メタスキル | meta skill | aide-powers の運用そのものを支えるスキル。`rules-distribute`, `task-orchestration`, `session-handover`, `progress-resume-check`, `user-profile-management`, `pending-issues-management` など |
| Skill ツール | Skill tool | プラットフォームが提供するスキル呼び出しツール。Kiro IDE では `discloseContext`、Claude Code では `Skill`、Gemini CLI では `activate_skill` 等、プラットフォームごとに名称が異なる |
| Iron Law | Iron Law | スキル内に明記された絶対遵守ルール。フェーズ省略禁止、サブエージェント委譲必須、ユーザー承認なしのコミット禁止など、ルール違反は品質崩壊に直結する |
| Red Flags | Red Flags | スキル内で「この思考が浮かんだら停止せよ」と警告される思考パターンの一覧。AIが自己合理化でルールを破ろうとする兆候を捕捉するためのチェックリスト |
| Common Rationalizations | Common Rationalizations | AIが省略・簡略化を正当化するために使いがちな言い訳と、それに対する正しい現実認識を対比させた一覧。Red Flags と対をなす |
| REQUIRED SUB-SKILL | REQUIRED SUB-SKILL | あるスキルから次のスキルへの遷移を必須化する宣言。フェーズスキル間の連鎖や、メインプロセスから共通スキルへの委譲を明示する |


## 4. 共通エージェント・サブエージェント

| 用語 | 英語表記 | 定義 |
|---|---|---|
| 共通エージェント | named agent | aide-powers が `agents/` 配下で名前付き定義として提供するサブエージェント。複数ワークフローで共有される |
| サブエージェント | sub-agent | フェーズスキルやメインオーケストレーターから委譲されるエージェント。コンテキスト分離・ツール制限・並列実行が可能 |
| サブエージェント委譲 | sub-agent delegation | 実作業（コード作成、レビュー、設計書執筆等）をサブエージェントに任せる原則。ワークフロー本体は実作業を行わない |
| ホワイトリスト3エージェント | whitelisted 3 agents | 実装ワークフローの工程チェック表で実行担当として認められる3つのエージェント。`micro-impl-agent` / `design-review-agent` / `code-review-agent` |
| micro-impl-agent | micro-impl-agent | マイクロ実装エージェント。1つの実装タスク（1ファイル / 1publicメソッド単位）を受け取って実装・修正・テスト作成・テスト実行を行う実装専任エージェント。`implement` / `fix` / `write_test` / `fix_test` / `run_test` の5モードを持つ |
| design-review-agent | design-review-agent | 設計準拠レビューエージェント。実装コードが設計書に従っているか、レイヤー間 import ルールに違反していないかを検証する。「外を見る」レビュー担当 |
| code-review-agent | code-review-agent | コード品質レビューエージェント。命名・型ヒント・SOLID 原則・エラーハンドリング・テスト方針準拠を検証する。「中を見る」レビュー担当 |
| QAレビューアーエージェント | QA reviewer agent | 設計ワークフローのQAゲートで設計書の品質を判定するエージェント群。`requirements-qa-agent` / `architecture-qa-agent` / `object-design-qa-agent` / `final-design-qa-agent` / `delta-design-qa-agent` |
| ステータス | status | サブエージェントが返す完了報告の状態。`DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED` の4種 |
| マイクロ実装の粒度 | micro-implementation granularity | 1サブタスク = 1呼び出し = 1ファイル = 最大1 publicメソッド。アイドルライン違反は分割依頼で対応する |

## 5. ルール配布機構（rules-distribute）

| 用語 | 英語表記 | 定義 |
|---|---|---|
| rules-distribute | rules-distribute | aide-powers のルールを各プラットフォームのルールファイル機構に直接配置するスキル。AIがファイルを読まなくてもプラットフォームが自動でコンテキスト注入する状態を作る |
| グローバルルール | global rules | 全フェーズスキル・全ワークフローに常時適用されるルール。`global-rules.md` に集約され、`rules-distribute` の global モードでプラットフォームのルールファイル機構に配置される |
| global モード | global mode | `rules-distribute` の動作モードの1つ。`global-rules.md` の全文をプラットフォーム固有のルールファイルとして配置する。配置後は削除されない |
| skill モード | skill mode | `rules-distribute` の動作モードの1つ。スキル固有の Iron Law / ルール / 完了条件 / 禁止事項を一時的なルールファイルとして配置する。`skill:deploy`（配置）と `skill:cleanup`（削除）のサブモードを持つ |
| プラットフォーム別ルールファイル配置先 | per-platform rule file location | プラットフォームごとに異なるルールファイルの配置先。Kiro: `.kiro/steering/`、Claude Code: `.claude/rules/`、Cursor: `.cursor/rules/`、Copilot: `.github/instructions/`、Gemini: プロジェクトルート + `GEMINI.md`、Codex / OpenCode: プロジェクトルート + `AGENTS.md` |
| ai-agent-platform-targets.md | ai-agent-platform-targets.md | このワークスペースで使用する AI Agent プラットフォームのリスト。`rules-distribute` の global モード実行時に作成され、`skill:deploy` の対象プラットフォーム特定に使われる |
| 自動生成マーカー | auto-generated marker | `rules-distribute` が生成したファイルを識別するためのコメント。`<!-- [aide-powers:auto-generated] -->` または `<!-- [aide-powers:skill-rule] -->` |

## 6. ハブ起動・セッション開始

| 用語 | 英語表記 | 定義 |
|---|---|---|
| SessionStart hook | SessionStart hook | Claude Code 系プラットフォームでセッション開始時に実行されるフック機構。aide-powers は `hooks/session-start` シェルスクリプトでハブスキルの内容を session_context として注入する |
| ブートストラップ | bootstrap | プラットフォームに aide-powers が「インストールされている」ことを伝え、ハブスキルへ誘導するための最小ファイル。Kiro IDE 用 `steering/aide-powers-bootstrap.md`、Copilot 用 `instructions/aide-powers.instructions.md`、Gemini 用 `GEMINI.md`、Codex / OpenCode 用 `AGENTS.md` がこれに該当する |
| ツールマップ | tool map | スキルが使う Claude Code 標準ツール名（Read, Write, Edit, Bash, Task, Skill 等）を、各プラットフォーム固有のツール名に変換するための対応表。`.aide/references/{platform}-tools.md` として配置される |
| references 配置 | references deployment | `.aide/references/` フォルダにツールマップ・グローバルルール等の参照ファイル一式を配置する処理。`using-aide-powers` の STEP 2 で実施される |
| .aide/references/ | dot-aide references folder | aide-powers が参照する補助ファイル群を保管するワークスペース内フォルダ。プラットフォーム外ファイルへのアクセス権限問題を回避するため、ワークスペース内にコピーを配置する。**aide-powers のスキルが参照中のため、削除禁止** |

## 7. 実行部隊（配布物）

| 用語 | 英語表記 | 定義 |
|---|---|---|
| skills/ | skills directory | スキル本体（SKILL.md とその付随ファイル）を格納するディレクトリ。`skills/{skill-name}/SKILL.md` 形式 |
| agents/ | agents directory | 共通エージェント定義ファイルを格納するディレクトリ。`agents/{agent-name}.md` 形式 |
| hooks/ | hooks directory | プラットフォームのフック機構で使うシェルスクリプト・JSON 設定を格納するディレクトリ。`hooks/session-start`, `hooks/hooks.json` 等 |
| steering/ | steering directory | Kiro IDE のステアリング機構（`.kiro/steering/`）に配布されるファイル群。aide-powers では `aide-powers-bootstrap.md` のみを含む |
| instructions/ | instructions directory | GitHub Copilot のインストラクション機構（`.github/instructions/`）に配布されるファイル群。aide-powers では `aide-powers.instructions.md` のみを含む |
| .claude-plugin/ | claude-plugin directory | Claude Code プラグイン形式でのインストール用メタデータ（`plugin.json` + `marketplace.json`）を格納するディレクトリ。superpowers の配置慣習に倣う。Claude Code 仕様で固定パス。`setup.bat` の Copilot 経路と `setup-local.*` の Claude Code 経路で参照されるため、削除すると setup スクリプトが xcopy エラーになる |
| .codex/ | dot-codex directory | Codex 利用者向けインストール手順書（`INSTALL.md`）を格納するディレクトリ。superpowers の配置慣習に倣う。setup スクリプトからは参照されないが、`README.md` から直接リンクされている純粋な利用者向けドキュメント |
| setup.bat / setup.sh | global setup script | 各プラットフォームのグローバル領域（`~/.kiro/`, `~/.claude/`, `~/.copilot/` 等）に aide-powers をインストールするスクリプト。Windows 用 `.bat` と Linux/Mac/WSL 用 `.sh` を提供 |
| setup-local.bat / setup-local.sh | local setup script | プロジェクトリポジトリのローカル領域（`{project}/.kiro/`, `{project}/.claude-plugin/` 等）に aide-powers を組み込むスクリプト。チームでリポジトリ共有する用途 |
| ローカルインストール | local installation | プロジェクトリポジトリに aide-powers を直接コミットしてチームで共有する配布形態。`setup-local.*` を使用する |
| グローバルインストール | global installation | ユーザーのホームディレクトリ配下にインストールし全プロジェクトから利用する配布形態。`setup.*` を使用する |

## 8. 設計プロセス用語

| 用語 | 英語表記 | 定義 |
|---|---|---|
| ユーザー要件 | user requirements | ユーザーが達成したい目的を EARS 構文と MoSCoW 分類で構造化した要件定義書（user-requirements.md） |
| システム要件 | system requirements | 技術スタック・非機能要件・開発環境制約をまとめた要件定義書（system-requirements.md） |
| 開発計画書 | development plan | 開発スコープ・進め方・体制を定義する文書（development-plan.md） |
| 開発環境定義 | dev environment | プロジェクトの実行環境・テスト実行コマンド・依存管理方針等を記述する文書（dev-environment.md）。実装系エージェントは必ずここを参照する |
| アーキテクチャ設計 | architecture design | システム全体構成図・ソフトウェアブロック図を作成するフェーズの成果物（system-architecture.md） |
| GUI設計 | GUI design | 画面構成・遷移図・共通UIルールを定める設計書（gui-design.md） |
| ユースケース分析 | use case analysis | ユーザー要件をユースケース単位で詳細化する分析。一覧 → 詳細プロセス → 操作性評価 → 改善の4段階で実施 |
| レイヤードアーキテクチャ設計 | layered architecture design | ドメイン層・アプリケーション層・インフラ層・プレゼンテーション層への分割設計（layered-architecture.md）。DDD 採用判定もここで行う |
| オブジェクト設計 | object design | レイヤーごとのクラス・メソッド・依存関係を定義する設計書群（`object-design-domain.md` 等の4ファイル） |
| インフラインターフェース設計 | infrastructure interface design | API 定義・データストアスキーマ・外部サービス連携・リポジトリ実装を定義する設計書（infra-interface-design.md） |
| プログラム構成 | program structure | フォルダ配置・ファイル命名規則・import 規則（レイヤー依存方向）を定義する設計書（program-structure.md） |
| 差分設計書 | delta design | 変更・バグ修正・リファクタリングの各ワークフローで作成される、既存設計書に対する変更内容を before/after 形式で記述した一時的な設計書。`delta-design.md` / `fix-design.md` / `refactoring-design.md` |
| 動作確認試験書 | manual test plan | 実装した機能を人手で動作確認するための試験項目をまとめた文書（`testing/manual-test-plan.md`）。`mode: implement` の完了時に必ず追記される |

## 9. 実装プロセス用語

| 用語 | 英語表記 | 定義 |
|---|---|---|
| 設計書ゲート PASS | design gate PASS | doc-index.md の全設計書が `✅ 完了` または `⏭️ スキップ` 状態であること。実装系ワークフローは PASS なしに先に進めない |
| 工程チェック表 | process checklist | 実装ワークフローで各タスクの工程進捗を記録する表（`impl-process-checklist.md`）。1工程1行構造（行キー `{task_id}::{工程キー}`、状態: ⬜todo/🔄in-progress/✅done/❌failed/➖skip）。工程キーは implement/write_test/run_test/spec_review/quality_review の5種。担当エージェント本人が自工程行を3段階更新する。非プログラム成果物は実行不要工程を ➖skip 行（判定理由必須）で記録する |
| 多段階コードレビュー | multi-stage code review | 実装後に実施するレビュー機構。ステージ1（実装レビュー: 設計準拠 + 品質）→ ステージ2（テストレビュー: 網羅性 + 品質）→ ステージ3（テスト実行）の3段階で行う |
| 設計準拠レビュー | design compliance review | 設計書とコードの整合性を確認するレビュー。design-review-agent が担当し、「外を見る」視点で実施する |
| コード品質レビュー | code quality review | コード自体の品質（命名、型ヒント、SOLID、エラーハンドリング等）を確認するレビュー。code-review-agent が担当し、「中を見る」視点で実施する |
| テスト網羅性レビュー | test coverage review | 設計書のテスト観点が全てカバーされているか、境界値・異常系を含むかを検証するレビュー |
| テスト品質レビュー | test quality review | テストコード自体の品質（命名規則、独立性、モック禁止等）を検証するレビュー |
| 合理的乖離 | rational deviation | 実装が設計書と異なるが合理的な理由（言語制約、ライブラリAPI実態等）がある乖離。ユーザー承認 + 設計書同期更新が必要 |
| 設計同期 | design sync | 実装が設計と乖離した際に、どちらかを修正して整合性を取り戻す処理。`design-sync` 共通スキルで実施 |
| ドキュメント反映 | document synchronization | ワークフロー完了時に差分設計書の内容を既存設計書にマージする処理。`doc-sync` 共通スキルで実施 |
| ダミー実装 | dummy implementation | `pass` のみ・`NotImplementedError`・固定値返却・TODO 付き仮実装等。原則禁止だが、設計書で定義された外部依存のテスト用ダミーは DI 注入で例外的に許可 |
| 親タスク完了チェック | parent task completion check | 全サブタスク完了後、設計書セクション全体と実装コードを照合して漏れを検出する処理。`micro-impl-agent` の `implement` モードの特殊形態 |

## 10. メタファイル・進捗管理

| 用語 | 英語表記 | 定義 |
|---|---|---|
| doc-index.md | documentation index | プロジェクトのドキュメント一覧と各ドキュメントの状態を管理するファイル。`doc-index-maintenance` 共通スキルが管理する |
| 進捗ファイル | progress file | 各ワークフローのフェーズ進捗を記録するファイル。`planning-progress.md` / `design-progress.md` / `impl-progress.md` 等。共通フォーマットは `.aide/references/progress-file-format.md` で定義 |
| pending-issues.md | pending issues | ワークフロー実行中に発見したスコープ外の問題を記録するファイル。`pending-issues-management` 共通スキルが管理する |
| session-handover.md | session handover | セッション切り替え時の作業状態を引き継ぐためのファイル。`session-handover` メタスキルが管理する。1世代前は `session-handover-old.md` として保持 |
| user-profile.md | user profile | ユーザーの技術レベル（ドメイン知識・プログラミング・システム/インフラの3軸×5段階）を記録するファイル。`user-profile-management` 共通スキルが管理する |
| feature_name | feature name | ドキュメント・進捗ファイルを格納するフィーチャー単位のディレクトリ名。`.aide/specs/{feature_name}/` 形式で利用する |

## 11. プラットフォーム

| 用語 | 英語表記 | 定義 |
|---|---|---|
| Kiro IDE | Kiro IDE | aide-powers の主要対応プラットフォームの1つ。ステアリング（`.kiro/steering/`）+ スキル（`~/.kiro/skills/`）で動作 |
| Kiro CLI | Kiro CLI | Kiro IDE の CLI 版。Kiro IDE と同じ配置構成 |
| Claude Code | Claude Code | Anthropic 公式の AI エージェント。SessionStart hook + Skill ツール経由でハブスキルを起動。aide-powers のメインターゲット |
| Cursor | Cursor | AI コードエディタ。SessionStart hook + `.cursor/rules/` のルール配置で動作 |
| OpenCode | OpenCode | OSS の AI エージェント。`AGENTS.md` 経由でルールファイルを読み込む |
| GitHub Copilot CLI | Copilot CLI | GitHub 公式 CLI 版 Copilot。`~/.copilot/skills/` にスキルを配置 |
| VSCode GitHub Copilot | VSCode Copilot | VSCode 拡張版 Copilot。Skills 自動発見 + `.github/instructions/` で動作 |
| Gemini CLI | Gemini CLI | Google 公式 CLI 版 Gemini。aide-powers はエクステンションとしてリンク |
| Codex | Codex | OpenAI 系の AI エージェント。`~/.agents/skills/` にスキルを配置 |

## 12. 用語の使い分け（揺れの統一）

ドキュメント執筆時、以下の揺れは正式名称に統一する。

| 揺れのある表現 | 正式名称（本辞書での採用） |
|---|---|
| AI / AI Agent / エージェント / アシスタント | **AI Agent**（システムを指す場合）/ **サブエージェント**（委譲される下位エージェントを指す場合） |
| プラットフォーム / クライアント / ツール / 環境 | **プラットフォーム**（Kiro IDE 等を指す場合） |
| ワークフロー / プロセス / フロー / 手順 | **ワークフロー**（aide-powers の7種類を指す場合）/ **プロセス**（スキル内部の処理段階を指す場合）/ **フェーズ**（ワークフロー内の作業単位を指す場合） |
| スキル / モジュール / コンポーネント | **スキル**（skills/ 配下のもの） |
| エージェント / サブエージェント / レビューアー | **共通エージェント**（agents/ 配下の名前付き定義）/ **サブエージェント**（フェーズスキルから委譲される下位エージェント全般）/ **QAレビューアーエージェント**（QAゲートでレビューするエージェント） |
| ルール / ガードレール / 規約 / 規則 | **ルール**（global / skill モードで配布されるもの）/ **Iron Law**（スキル内の絶対遵守ルール）/ **コーディング規約**（impl-coding-standards 内のもの） |
| ハブ / 起点 / エントリ | **ハブスキル**（using-aide-powers）/ **エントリポイントスキル**（各ワークフローの先頭フェーズスキル） |
| 配布 / インストール / 配置 / セットアップ | **配布**（aide-powers リポジトリの提供）/ **インストール**（プラットフォームへの配置、setup スクリプト実行）/ **ルール配布**（rules-distribute による配置） |
| 設定ファイル / コンフィグ | **設定ファイル**（一般用語）/ **doc-index.md / progress ファイル等**（aide-powers 固有のメタファイル名） |
| ユーザー / 開発者 / 利用者 | **ユーザー**（AI Agent と対話する人全般）/ **開発引き継ぎ者**（aide-powers の開発を引き継ぐ人）/ **利用エンジニア**（aide-powers を自プロジェクトで使う人）/ **非エンジニア**（aide-powers の概要を理解したい人） |
| ドキュメント / ドキュ / 文書 / 資料 | **ドキュメント**（成果物全般）/ **設計書**（設計フェーズの成果物）/ **企画書**（企画ワークフローの成果物 planning-proposal.md） |
| インストール / セットアップ / 導入 | **セットアップ**（setup スクリプト実行による配置作業）/ **インストール**（より広義の配置作業全般） |
| コミット / git コミット | **gitコミット**（必ず `git-commit-workflow` 共通スキル経由で実施） |

---

## 13. 禁止表現・推奨表現

ドキュメント執筆時、以下の表現は使用禁止または非推奨とする。

| 禁止・非推奨 | 理由 | 推奨 |
|---|---|---|
| AIDE | 旧称。aide-powers の前身プロジェクト名と混同される | aide-powers |
| superpowers 形式 | 設計判断の過程で参照した外部プロジェクト名。最終形では aide-powers 独自仕様として整理されている | aide-powers のスキル形式 |
| Manager / Handler / Util 系の汎用接尾辞（責務が曖昧な命名） | DDD・SOLID の観点から責務が不明瞭になる | 役割を明示する具体的な名前 |
| 「だいたい」「たぶん」「おそらく」 | 開発者向けドキュメントは事実ベースで書く | 確認可能な事実 / 「未確定」と明記 |
| 「簡単に書いた」「ざっくり書いた」 | aide-powers のドキュメントは詳細さが品質保証の根幹 | 必要な粒度で具体的に書く |

---

## 14. 辞書の更新ルール

- ドキュメントを書いていて新しい用語が必要になったら、まずこの辞書に追加してから本文を書く
- 既存用語の定義に疑義が生じたら、この辞書の定義を優先して本文を直す（逆ではない）
- 揺れを発見したら §12 に追記し、ドキュメント全体を統一する
- 章間レビュー（4章生成後の並列レビュー）で検出された用語ブレは、この辞書を起点に修正する
