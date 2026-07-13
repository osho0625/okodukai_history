# 開発実行環境定義書: aide-powers

このドキュメントは、aide-powers リポジトリ自体（このプロジェクト）を開発するときの実行環境・運用ルールを定義します。aide-powers の利用者向けセットアップ手順は `docs/02-getting-started.md` を、プロダクトとしての要件は `system-requirements.md` を参照してください。

## 0. 重要: 2つの aide-powers を混同しないこと

このプロジェクトでは「aide-powers」という名前が **2つの異なる役割** で登場します。本ドキュメントを読むときは常に区別してください。

| 役割 | 何を指すか | 具体的な所在 |
|---|---|---|
| **開発対象としての aide-powers** | このリポジトリ自体。私たちが作って配布するプロダクト | このリポジトリの `skills/`、`agents/`、`hooks/`、`steering/`、`instructions/`、`.claude-plugin/`、`.codex/`、`setup.bat` 等 |
| **開発ツールとしての aide-powers** | 上記プロダクトの **過去バージョン** が AI Agent のグローバル領域にインストールされていて、今このリポジトリの開発作業中に AI Agent が利用しているもの | グローバル領域: `~/.kiro/skills/`、`~/.kiro/agents/`、`~/.kiro/steering/aide-powers-bootstrap.md` 等（`setup.bat` を過去に実行して配置されたもの） |

### なぜ混同しやすいか

- 同じ名前
- 同じ構成（`skills/` `agents/` `hooks/` 等のディレクトリ名が完全一致）
- 同じスキル群（`fs-*`、`using-aide-powers`、`rules-distribute` 等）
- セルフホスティング開発のため、開発ツール（グローバル）と開発対象（このリポジトリ）の両方が同時に存在する

### 厳守ルール

| 場面 | やること |
|---|---|
| AI Agent がスキルを呼び出すとき | **開発ツール側**（グローバル領域）のスキルを使う。このリポジトリの `skills/` 内ファイルを直接実行することはない |
| このリポジトリの `skills/` を編集するとき | **開発対象**を変更している。グローバル領域には反映されない（反映するには `setup.bat` の再実行が必要） |
| `setup.bat` を実行するとき | **開発対象** をビルドして **開発ツール側** にデプロイしている |
| グローバルルール `.aide/references/global-rules.md` を参照するとき | このファイルは **開発ツール側** が `using-aide-powers` の STEP 2 でワークスペース内にコピーしたもの。このリポジトリのソース（`skills/using-aide-powers/references/global-rules.md`）とは別ファイル |
| ドキュメントで「aide-powers」と書くとき | 文脈から判別できない場合は「aide-powers リポジトリ自体」「グローバル領域の aide-powers」のように区別して書く |

### 開発フロー上の影響

- このリポジトリの `skills/` を編集しても、**AI Agent の挙動は即座に変わらない**。`setup.bat` を再実行してグローバル領域に反映させてから、AI Agent のセッションを再起動する必要がある
- グローバル領域の aide-powers が古いままだと、ドキュメントに書いた最新ルールと AI Agent の挙動が食い違う場合がある。この場合は **開発ツール側の更新を先に**実行してから、開発作業に入ること
- このドキュメントで「aide-powers の `skills/`」と書かれているとき、特に断りがなければ **開発対象**（このリポジトリ）のことを指す

---

## 1. プロジェクトの性質

aide-powers は **Python アプリケーションではありません**。AI Agent によるドキュメント駆動開発を高度化するためのフレームワークであり、配布物の実態は以下の集合体です。

| 要素 | 内容 |
|---|---|
| スキル定義 | `skills/{skill-name}/SKILL.md` および参照ファイル |
| エージェント定義 | `agents/*.md`（共通サブエージェント） |
| プラットフォーム配布物 | `steering/`, `instructions/`, `.claude-plugin/`, `.codex/`, `GEMINI.md`, `gemini-extension.json` |
| Hook 設定 | `hooks/*.json`（Claude Code 系 SessionStart Hook 設定） |
| Hook 実行スクリプト | `hooks/session-start`（bash）、`hooks/run-hook.cmd`（cmd） |
| インストーラ | `setup.bat`, `setup.sh`, `setup-local.bat`, `setup-local.sh` |
| 旧資産片付け | `cleanup-kiro-agent.bat` |
| ドキュメント | `docs/`, `docs-dev/` |
| 設計書・進捗 | `.aide/specs/` |

実行コードは Markdown / bat / bash / JSON の集合であり、`pyproject.toml`、`requirements.txt`、`setup.py` 等の Python パッケージ管理ファイルは存在しません。

スキルやツールの都合で Python を補助的に使う場合は、依存をプロジェクト内の仮想環境 `.venv` に隔離し、グローバル環境へはインストールしません（§13 グローバル環境の非汚染ルールと整合）。これは配布物の主体が Markdown/bat/bash/JSON であるという方針の例外的補助であり、aide-powers が Python アプリケーション化することを意味しません。

## 2. 編集対象ファイル形式

| 拡張子 | 主な用途 | 備考 |
|---|---|---|
| `.md` | スキル定義、エージェント定義、ドキュメント、設計書、ステアリング | 大半の成果物 |
| `.bat` | Windows 向けインストーラ・hook ラッパー | `setup.bat`, `setup-local.bat`, `cleanup-kiro-agent.bat`, `hooks/run-hook.cmd` |
| `.sh` | Linux/Mac/WSL 向けインストーラ・hook | `setup.sh`, `setup-local.sh`, `hooks/session-start` |
| `.json` | Hook 設定、プラグインメタデータ、Gemini 拡張定義 | `hooks/*.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `gemini-extension.json` |
| `.html` / `.js` / `.cjs` | visual-companion スキルのローカルサーバ | `skills/visual-companion/scripts/` |

リポジトリ追跡対象に Python ファイル（`.py`）は存在しません（Python を補助使用する場合も `.venv` 内でのみ実行し、`.venv/` は `.gitignore` で追跡除外します。§12 参照）。

## 3. AI Agent プラットフォーム

このリポジトリを編集している AI Agent のプラットフォームは `.aide/ai-agent-platform-targets.md` の記載に従います。

| 項目 | 値 |
|---|---|
| 対象プラットフォーム | Kiro IDE / Kiro CLI |
| ツールマップ | `.aide/references/kiro-ide-tools.md`（ワークフロー開始時にコピー配置） |



`rules-distribute` スキルの `skill:deploy` モードはこのファイルに記載された全プラットフォームに対してルールファイルを生成します。プラットフォームを増やす場合は、本ファイルを編集してから `rules-distribute` を再実行してください。

## 4. OS 依存と配布スクリプトの2系統維持

| 観点 | 内容 |
|---|---|
| 開発主環境 | Windows（cmd / PowerShell） |
| 配布スクリプト | Windows 向け `.bat` と Linux/Mac/WSL 向け `.sh` の2系統を維持する必要があります |
| 修正ルール | インストーラ・hook ラッパーに変更を加える際は、`.bat` 版と `.sh` 版の両方を整合させて更新してください |

bat / bash 双方のスクリプトに同じメニュー項目・選択肢番号・配置先が反映されるよう、`docs/02-getting-started.md` 6.2 節「プラットフォーム別の確認ポイント」と矛盾しないことを確認してください。

## 5. 文字エンコーディングと改行コード

### 5.1 エンコーディング

| 対象 | エンコーディング | 備考 |
|---|---|---|
| Markdown（`.md`） | UTF-8（BOM なし） | 全ドキュメント・スキル・エージェント定義 |
| JSON（`hooks/*.json`、`.claude-plugin/*.json`、`gemini-extension.json` 等） | UTF-8（BOM なし） | |
| bash スクリプト（`.sh`） | UTF-8 | `setup.sh`, `setup-local.sh`, `hooks/session-start` は UTF-8 |
| bat スクリプト（`.bat`） | UTF-8（BOM なし） | 先頭に `chcp 65001 >nul` を記述すること。`setup.bat`, `setup-local.bat` は UTF-8 + `chcp 65001` で動作する。新規 `.bat` ファイルもこれに合わせること |

bat ファイルは UTF-8 で記述し、スクリプト先頭で `chcp 65001 >nul` を実行してコードページを切り替えます。これにより apm 経由（PowerShell → cmd.exe、コードページ 65001）でも、cmd.exe 直接実行でも、日本語メッセージが正しく表示されます。

### 5.2 改行コード

| 対象 | 改行コード |
|---|---|
| Markdown / JSON / 通常テキスト | LF |
| `.bat` ファイル | CRLF（Windows cmd の都合） |
| `.sh` ファイル | LF |

`setup.bat` / `setup-local.bat` は CRLF、`setup.sh` / `setup-local.sh` は LF で保存されています。新規追加時もこの規約に揃えてください。

## 6. 依存ツール

| ツール | 必須／任意 | 用途 |
|---|---|---|
| Git | 必須 | バージョン管理、配布、リポジトリのクローン |
| Git for Windows | Windows 開発時 必須 | Git 本体に加え、`hooks/session-start` 等の bash スクリプトを Windows でも実行するために bash が同梱されている |
| PowerShell | Windows 開発時 必須 | `setup.bat` 内で VSCode `settings.json` を JSON として編集する処理に使用される |
| Node.js | 任意 | `skills/visual-companion/scripts/server.cjs` を起動する場合のみ必要 |
| Python | 補助的に使う場合のみ | スキルやツールが Python を使う場合に必要。依存は `.venv` に隔離し、グローバル環境へはインストールしない（§13 と整合）。それ以外の開発作業では Python ランタイムを使用しない |

Python の仮想環境（`.venv`）は、Python を補助的に使うスキル・ツールの依存を隔離する目的で使用します。グローバル環境へはインストールしません（§13 と整合）。それ以外の開発作業では仮想環境を必要としません。

## 7. 動作確認の方法

aide-powers リポジトリ自体には、`pytest` 等の自動テストフレームワークは導入していません。動作確認はインストーラの実行と、各プラットフォームでのハブスキル発動確認による手動検証で行います。

### 7.1 インストーラ実行確認（setup.bat / setup.sh）

| 手順 | 内容 |
|---|---|
| 1 | リポジトリのルートディレクトリで `setup.bat`（Windows）または `./setup.sh`（Linux/Mac/WSL）を起動する |
| 2 | メニューが表示され、対象プラットフォームの番号を選択できることを確認する |
| 3 | 既存配置がある場合に `[y/N]` の上書き確認プロンプトが出ることを確認する |
| 4 | 選択したプラットフォームの配置先（例: `~/.kiro/skills/`、`~/.kiro/agents/`、`~/.kiro/steering/aide-powers-bootstrap.md`）にファイルがコピーされていることを確認する |

メニュー項目と配置先の詳細は `docs/02-getting-started.md` 3節および 4節を参照してください。

### 7.2 ハブスキル発動確認

各プラットフォームで `using-aide-powers` ハブスキルが正しく読み込まれるか、`docs/02-getting-started.md` 6.2 節「プラットフォーム別の確認ポイント」を実機で確認します。確認項目の例:

- Kiro IDE / Kiro CLI: `~/.kiro/steering/aide-powers-bootstrap.md` が存在し、`~/.kiro/skills/using-aide-powers/SKILL.md` が読み込めること
- 会話を「TODO アプリを作りたい」等のフレーズで開始すると、AI Agent がワークフロー名に言及し、番号付き選択肢でユーザー確認に入ること

### 7.3 setup-local によるテスト用ディレクトリ検証

グローバル領域を汚染せずに動作確認したい場合は、`setup-local.bat <テスト用ディレクトリ>` または `./setup-local.sh <テスト用ディレクトリ>` を使用します。テスト用ディレクトリで AI Agent セッションを起動し、ハブスキルが発動するかを確認してください。

### 7.4 自動テスト方針

| 項目 | 方針 |
|---|---|
| 自動テストフレームワーク | 導入しない（Python の pytest 等は使わない） |
| 検証方法 | 手動検証（7.1〜7.3 の手順） |
| 将来の拡張 | 未確定 |

## 8. Git 運用ルール

### 8.1 コミットメッセージ言語

| 項目 | 値 |
|---|---|
| コミットメッセージ言語 | 日本語（`git-commit-workflow` スキル §2 「初回確認」のデフォルトに従う） |

### 8.2 コミット手順

すべてのコミットは `git-commit-workflow` 共通スキル経由で行います。エージェントが直接 `git commit` / `git push` を実行することは禁止です（aide-powers グローバルルール §4-2）。

| ルール | 内容 |
|---|---|
| バルク追加禁止 | `git add -A` および `git add .` は **禁止**（git-commit-workflow Iron Law） |
| ファイル指定 | コミット対象は必ずファイル単位で個別に指定する |
| 承認必須 | `git commit` 実行前に、対象ファイル一覧とコミットメッセージをユーザーに提示し、明示的な承認を得る |
| 1ワークフロー1コミット | ワークフロー1件 = コミット1回。複数ワークフローのまとめコミットを禁止 |
| プレフィックス | 企画・設計・設計逆引き → `docs:` / 実装 → `feat:` `test:` / 変更 → `feat:` `fix:` / バグ修正 → `fix:` / リファクタリング → `refactor:` |
| `Docs:` フッター | 変更・バグ修正・リファクタリングの3WFでは必須 |

### 8.3 リモート構成

このリポジトリは内部 GitLab 上の単一リポジトリで管理されます。

| リモート名 | リポジトリ | 公開範囲 | 役割 |
|---|---|---|---|
| origin | `http://10.110.47.117/kc-apm/kc-aide-powers.git` | パブリック | 開発・公開兼用。通常の push 先 |

**ブランチ構成:**
- `main` — 開発ブランチ
- `old_develop` — 旧開発履歴（参照用）

### 8.4 push ルール

| 操作 | コマンド | タイミング |
|---|---|---|
| 通常の push | `git push origin main` | コミットごとに毎回 |

**ルール:**
- 開発作業のコミットは `origin` に毎回 push する
- AI エージェントが自己判断で push することを禁止する（git-commit-workflow 経由のみ）

## 9. ファイル書き込みルール（aide-powers 固有）

aide-powers グローバルルール §4-3 に従います。

| ルール | 内容 |
|---|---|
| 50行超のファイル書き込み | Write で先頭50行程度を書き込み、残りを Append で追記する |
| 理由 | 一度に大量書き込みすると、書き込みが完了しない不具合が発生するため |

このルールは新規ファイル作成・既存ファイルへの大規模追記の両方に適用します。

## 10. .gitignore による除外パターン

ルートの `.gitignore` で以下のパターンが追跡除外されています。

### 10.1 外部参照・OS・エディタ系

```
/references/                # 外部リポジトリのコピー（kiro-agents, superpowers 等）
.DS_Store / Thumbs.db / Desktop.ini  # OS生成ファイル
.vscode/ / .idea/ / *.swp   # エディタ・IDE
node_modules/               # Node.js
__pycache__/ / .venv/ / venv/ / dist/ / build/  # Python（補助使用時の .venv 等は追跡除外）
.env / .env.local           # 環境変数
*.log / logs/               # ログ
```

### 10.2 セッション引き継ぎ

```
.aide/specs/**/session-handover*.md  # ローカル作業ファイル
```

### 10.3 AI Agent / IDE 生成ファイル

各プラットフォームのローカル領域はスキルや IDE が生成するため追跡しません。

```
.kiro/ / .claude/ / .copilot/ / .gemini/ / .codex/ / .github/
brainstorm-selection*.json
!.codex/INSTALL.md          # 例外: 配布物として手書きされているファイルは追跡
```

### 10.4 aide-powers 作業領域

スキル実行時の作業ファイルは追跡しません。設計書・企画書等の成果物（`.aide/specs/`）は追跡します。

```
.aide/references/           # ワークフロー開始時にコピー配置されるツールマップ等
.aide/global-rules.md
.aide/ai-agent-platform-targets.md
.aide/brainstorm/
.aide/brainstorm-server/
```

## 11. 開発ワークフロー

aide-powers 自体の開発は、aide-powers のワークフローを使用して行います（**セルフホスティング**）。§0 で述べたとおり、ここでは「開発ツールとしての aide-powers（グローバル領域にインストール済み）」が「開発対象としての aide-powers（このリポジトリ）」を開発する構図になります。

| ワークフロー | 用途 | エントリポイントスキル（開発ツール側） |
|---|---|---|
| 企画 | 新規プロジェクトのアイデア整理 | `fs-planning-intake-and-init` |
| 設計 | 要件定義〜プログラム構成設計 | `fs-design-phase1-user-req` |
| 実装 | 設計書に基づく実装 | `fs-impl-phase1-gate` |
| 設計逆引き | 既存資産から設計書を生成 | `fs-reverse-phase1-program` |
| 変更 | 機能追加・仕様変更 | `fs-change-phase1-analysis` |
| バグ修正 | バグの報告〜修正〜ドキュメント更新 | `fs-bugfix-phase1-analysis` |
| リファクタリング | 内部構造改善 | `fs-refactoring-phase1-status` |

**注意:** 上記スキル群は「開発ツール側」（グローバル領域: `~/.kiro/skills/` 等）に配置されているスキルが起動します。このリポジトリ配下の `skills/{エントリポイント名}/SKILL.md` を AI Agent が直接読みに来ることはありません。このリポジトリのスキル定義を編集してもグローバル側には自動反映されないため、変更を AI Agent の挙動に反映させたい場合は `setup.bat` で再デプロイしてセッションを再起動する必要があります。

スキル・エージェント定義の追加・修正は、原則として変更ワークフロー（`fs-change-*`）を経由します。

## 12. 仮想環境

| 項目 | 内容 |
|---|---|
| Python 仮想環境（`.venv`） | **Python を補助的に使う場合に使用する。** Python 依存ライブラリを隔離する目的でプロジェクト内 `.venv` を使用する。**グローバル環境へはインストールしない**（§13 グローバル環境の非汚染ルールと整合）。Python を使わない開発作業では仮想環境を必要としない |
| Node.js | visual-companion の `server.cjs` 実行時のみ使用。グローバル Node.js を直接使用し、プロジェクト固有の `node_modules/` は持たない |

aide-powers グローバルルール §5-3「仮想環境（venv, .venv 等）が設定されている場合は仮想環境を優先すること」は、本リポジトリでは Python を補助使用する場合の `.venv` に対して適用される（Python 実行は `.venv` を優先する）。Python を使わない開発作業には仮想環境が存在しないため、その範囲では適用対象なしのままである。

## 13. グローバル環境の非汚染ルール

aide-powers の開発に必要な依存ツールは Git・PowerShell・bash・Node.js のみで、いずれもプラットフォームに標準的に存在するか、開発者が個別にインストールする想定です。リポジトリの開発作業のためにグローバル環境へ追加のパッケージをインストールする必要はありません。

setup スクリプト実行時にグローバル領域（`~/.kiro/`、`~/.claude/` 等）に配布物を配置しますが、これは aide-powers の **利用者向けインストール動作** であり、開発作業そのものではありません。

## 14. 設計書ゲート（design-gate）の扱い

このリポジトリはフレームワーク自体のメタ開発であり、通常の Python / アプリケーション開発とはドキュメント構成が根本的に異なります。`design-gate` (aide-powers skill) を機械的に適用すると **必ず FAIL する** ため、本リポジトリでの design-gate の扱いを以下に明記します。**この判断は確定済みであり、ワークフロー起動のたびにユーザーへ再確認する必要はありません。**

### 14.1 なぜ design-gate が機械適用できないか

design-gate は doc-index.md に以下のコア4ファイルが `✅ 完了` で記載されていることを要求します。

| design-gate が要求するファイル | 本リポジトリでの状態 |
|---|---|
| `program-structure.md` | **存在しない** |
| `system-requirements.md` | **存在しない** |
| `user-requirements.md` | **存在しない** |
| `dev-environment.md` | 存在する（本ファイル） |

本リポジトリは Python アプリではなく、配布物の実体は Markdown / bat / bash / JSON の集合体（スキル定義・エージェント定義・配布スクリプト等）です（§1 参照）。設計書にあたるものは **スキル定義（SKILL.md）・エージェント定義（agents/*.md）・各種参照ファイルそのもの** であり、これらは既に存在し、コードと一体です。通常アプリ向けの「program-structure.md による構造設計 → コード実装」という分離構造を前提とした design-gate のコア4ファイル要件は、この構造に当てはまりません。

### 14.2 確定した扱い

| 場面 | 扱い |
|---|---|
| 実装・変更・バグ修正・リファクタリングWFで design-gate に到達したとき | **メタ開発のため design-gate は適用対象外**と判断し、ゲートを PASS 相当として扱い、次の工程へ進む。FAIL によるワークフロー終了・設計逆引きWF案内・pending-issues 登録は行わない |
| 設計書の代わりに整合性の根拠とするもの | 対象スキルの SKILL.md・エージェント定義・参照ファイル（`.aide/references/` のツールマップ等）・本 dev-environment.md・ubiquitous-language.md |
| 設計逆引きWF（fs-reverse-*）の要否 | 不要。コア4ファイルを後から逆生成する運用はとらない（メタ開発の構造に合わないため） |

### 14.3 根拠

- フレームワークオーナー（ユーザー）の明示判断（2026-06-02）。「メタ開発では従来型設計書が存在しないことを前提に design-gate をスキップして続行する」ことを確定。
- 過去の同種バグ修正WF（`202605271348-fix-final-check-missing` 等）でも同様に design-gate を実質スキップして進行している。
- この扱いは「設計書なしの実装禁止」ルール（phase-skill-rules.md）の例外にあたるが、本リポジトリでは「スキル定義・エージェント定義そのものが設計書を兼ねる」ため、設計の根拠なしに実装しているわけではない。

## 15. 未確定事項

| 項目 | 状況 |
|---|---|
| 自動テストフレームワークの将来導入 | 未確定（現時点では導入しない方針） |
| 開発ツール側（グローバル領域の aide-powers）の更新タイミング | 未確定（現状: 開発者が必要に応じて `setup.bat` を手動実行する運用） |

---

*本文書は aide-powers リポジトリ自体（このプロジェクト）を開発するときの実行環境定義書です。*
*aide-powers の利用者向けセットアップ手順は `docs/02-getting-started.md`、プロダクトとしての要件は `system-requirements.md` を参照してください。*
