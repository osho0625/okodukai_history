---
name: fs-reverse-phase5-optional-phases
description: "Use when core reverse-design phases (1-4) are complete and optional analysis phases need to be evaluated and executed"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# オプションフェーズ管理（設計逆引き）

## Overview

コア完了（フェーズ4: ユーザー要件抽出）後、コードの構造を分析してオプションフェーズ（アーキテクチャ・オブジェクト設計・インフラIF・GUI設計）の実行/スキップを判定し、実行対象のオプション解析を順次管理する。全フェーズ完了時には生成ドキュメント一覧と次に利用可能なワークフローをユーザーに案内する。

**Core principle:** Analyze code structure to determine which optional design documents are needed, then execute each applicable analysis in sequence — always recording reality, never prescribing ideals.

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| layered-architecture.md | `.aide/specs/{feature}/layered-architecture.md` | レイヤードアーキテクチャ設計（フェーズ5実行時） |
| ubiquitous-language.md | `.aide/specs/{feature}/ubiquitous-language.md` | ユビキタス言語辞書（DDD時） |
| object-design.md + object-design-*.md | `.aide/specs/{feature}/object-design*.md` | オブジェクト設計（フェーズ6実行時） |
| infra-interface-design.md | `.aide/specs/{feature}/infra-interface-design.md` | インフラIF設計（フェーズ7実行時） |
| gui-design.md | `.aide/specs/{feature}/gui-design.md` | GUI設計（フェーズ8実行時） |

※ 判定結果により実行対象のフェーズのみ成果物を作成する

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-reverse-phase5-optional-phases
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Never:**
- コアフェーズ（フェーズ1〜4）が未完了の状態で実行してはならない

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: reverse-progress.md 確認（途中再開対応）

1. `.aide/specs/{feature_name}/reverse-progress.md` を Read で読み込む
2. オプションフェーズの完了状態を確認する:
   - 「オプション判定完了」の記録があるか
   - 各オプションフェーズ（フェーズ5〜8）の完了記録があるか
3. 既に一部が完了していれば、次の未完了フェーズから再開する
4. reverse-progress.md が存在しない場合はエラー（コアフェーズが未完了の可能性）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `step1`, step_title: `reverse-progress.md 確認（途中再開対応）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: オプションフェーズ実行判定

#### 判定基準テーブル

| # | オプションフェーズ | 判定対象 | 実行条件 | スキップ条件 | 判定方法 |
|---|---|---|---|---|---|
| 1 | アーキテクチャ（フェーズ5） | ディレクトリ構成 | `src/` 配下にレイヤーを示すディレクトリ構成がある | フラットな構成（全ファイルが同一ディレクトリ） | program-structure.md のフォルダ構成ツリーを解析 |
| 2 | オブジェクト設計（フェーズ6） | クラス定義 | クラスベースの設計がされている（ABC, dataclass, 型ヒント付きクラスが存在） | 関数ベースのスクリプト的な構成 | program-structure.md の各ファイルの主要クラス/関数名を解析 |
| 3 | インフラIF（フェーズ7） | 外部連携 | 外部サービス連携、DB接続、ファイルI/O等のインフラ層が存在する | 外部連携がない純粋なロジックのみ | program-structure.md の import 情報と system-requirements.md のデータ管理方式を解析 |
| 4 | GUI設計（フェーズ8） | GUIフレームワーク | GUIフレームワーク（tkinter, PyQt, wxPython, Kivy等）を使用している | CLI / API のみ | program-structure.md の import 情報を解析 |

#### 判定ロジックの詳細

**フェーズ5（アーキテクチャ）の判定:**
1. program-structure.md のフォルダ構成ツリーを読む
2. 以下のディレクトリパターンを検索:
   - `domain/`, `application/`, `infrastructure/`, `presentation/` → 4層レイヤード
   - `models/`, `views/`, `controllers/` → MVC
   - `core/`, `adapters/`, `ports/` → ヘキサゴナル
   - `entities/`, `usecases/`, `interfaces/`, `frameworks/` → クリーンアーキテクチャ
   - `services/`, `repositories/`, `controllers/` → 3層アーキテクチャ
3. 上記パターンのいずれかに該当 → **実行**
4. 全ファイルが同一ディレクトリまたは機能別フラット構成 → **スキップ**

**フェーズ6（オブジェクト設計）の判定:**
1. program-structure.md の各ファイルの主要クラス/関数名を読む
2. 以下の兆候を検索:
   - `class` キーワードで定義されたクラスが複数存在する
   - ABC, Protocol, dataclass, NamedTuple, Enum の使用がある
   - 型ヒント付きのクラスメソッドが存在する
3. 上記兆候が確認できる → **実行**
4. 関数定義のみ、スクリプト的な構成 → **スキップ**

**フェーズ7（インフラIF）の判定:**
1. program-structure.md の import 情報を読む
2. system-requirements.md のデータ管理方式セクションを読む
3. 以下の兆候を検索:
   - DB関連ライブラリの import（sqlite3, sqlalchemy, psycopg2 等）
   - ファイルI/O操作（json, csv, yaml, toml の読み書き）
   - 外部API呼び出しライブラリ（requests, httpx, aiohttp 等）
   - リポジトリパターンの実装（Repository クラスの存在）
4. 上記兆候が確認できる → **実行**
5. 外部連携がない純粋なロジックのみ → **スキップ**

**フェーズ8（GUI設計）の判定:**
1. program-structure.md の import 情報を読む
2. 以下の GUIフレームワークの import を検索:
   - `tkinter`, `ttk` → tkinter
   - `PyQt5`, `PyQt6` → PyQt
   - `PySide2`, `PySide6` → PySide
   - `wx` → wxPython
   - `kivy` → Kivy
   - Web系: `flask`, `django`, `fastapi` + テンプレートエンジン（Jinja2等）
   - フロントエンド: `svelte`, `react`, `vue` 等
3. 上記 import が確認できる → **実行**
4. CLI / API のみ → **スキップ**

#### 判定結果のユーザー提示フォーマット

```
## オプションフェーズの実行判定結果

コードの構造を分析した結果、以下のように判定しました:

| # | オプションフェーズ | 判定 | 根拠 |
|---|---|---|---|
| 1 | アーキテクチャ抽出 | ✅ 実行 / ⏭️ スキップ | {具体的な根拠} |
| 2 | オブジェクト設計抽出 | ✅ 実行 / ⏭️ スキップ | {具体的な根拠} |
| 3 | インフラIF抽出 | ✅ 実行 / ⏭️ スキップ | {具体的な根拠} |
| 4 | GUI設計抽出 | ✅ 実行 / ⏭️ スキップ | {具体的な根拠} |

この判定でよろしいですか？
1. はい、この判定で進めてください
2. 修正があります（変更したいフェーズを教えてください）
3. その他（自由記述）
```

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `step2`, step_title: `オプションフェーズ実行判定`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: オプションフェーズ順次実行ループ

以下の順序で各オプションフェーズを実行する:

| 順序 | フェーズ | プロンプトテンプレート | 成果物 |
|---|---|---|---|
| 1 | アーキテクチャ（フェーズ5） | `reverse-architecture-prompt.md` | `layered-architecture.md`, `ubiquitous-language.md`（DDD時） |
| 2 | オブジェクト設計（フェーズ6） | `reverse-object-design-prompt.md` | `object-design.md` + `object-design-{layer}.md` |
| 3 | インフラIF（フェーズ7） | `reverse-infra-interface-prompt.md` | `infra-interface-design.md` |
| 4 | GUI設計（フェーズ8） | `reverse-gui-design-prompt.md` | `gui-design.md` |

各フェーズの実行手順:

1. **判定確認**: 当該フェーズが「実行」と判定されているか確認。「スキップ」ならスキップ報告して次へ
2. **途中再開確認**: 当該フェーズが既に完了済みなら次へ
3. **サブエージェントディスパッチ**: 対応するプロンプトテンプレートを Read で読み込み、プレースホルダを埋めて Task でサブエージェントをディスパッチする
4. **サブエージェントの作業**: サブエージェントが成果物を作成し、ユーザーと対話して合意を得る
5. **doc-index-maintenance**: `doc-index-maintenance` (aide-powers skill) を呼び出し、成果物を doc-index.md に登録する
6. **git-commit-workflow**: `git-commit-workflow` (aide-powers skill) を呼び出し、成果物をコミットする

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `step3`, step_title: `オプションフェーズ順次実行ループ`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: 全フェーズ完了案内

全てのオプションフェーズ（実行対象のもの）が完了したら、以下をユーザーに案内する:

#### 生成ドキュメント一覧の提示

```
## 設計逆引きが完了しました 🎉

以下のドキュメントが生成されました:

### コアドキュメント
| # | ファイル名 | 用途 |
|---|---|---|
| 1 | program-structure.md | プログラム構成（ファイル構成・依存関係） |
| 2 | dev-environment.md | 開発実行環境 |
| 3 | system-requirements.md | システム要件（技術スタック・非機能要件） |
| 4 | user-requirements.md | ユーザー要件 |

### オプションドキュメント
| # | ファイル名 | 用途 | ステータス |
|---|---|---|---|
| 5 | layered-architecture.md | レイヤードアーキテクチャ | ✅ 生成済み / ⏭️ スキップ |
| 6 | ubiquitous-language.md | ユビキタス言語辞書 | ✅ 生成済み / ⏭️ スキップ |
| 7 | object-design.md + object-design-*.md | オブジェクト設計 | ✅ 生成済み / ⏭️ スキップ |
| 8 | infra-interface-design.md | インフラIF設計 | ✅ 生成済み / ⏭️ スキップ |
| 9 | gui-design.md | GUI設計 | ✅ 生成済み / ⏭️ スキップ |

### メタドキュメント
| # | ファイル名 | 用途 |
|---|---|---|
| 10 | reverse-progress.md | 逆引きフェーズ進捗管理 |
| 11 | doc-index.md | ドキュメント一覧インデックス |
```

#### 次に利用可能なワークフローの案内

```
## 次のステップ

設計書が揃いましたので、以下のワークフローが利用可能です:

1. **実装ワークフロー** — 設計書に基づいてコードを実装する
2. **変更ワークフロー** — 機能追加・仕様変更を行う
3. **バグ修正ワークフロー** — バグを修正する
4. **リファクタリングワークフロー** — 内部構造を改善する
5. **設計ワークフロー** — 設計書の改善が必要な場合、該当フェーズで修正する

どのワークフローを実行しますか？
1. 実装ワークフロー
2. 変更ワークフロー
3. バグ修正ワークフロー
4. リファクタリングワークフロー
5. 設計ワークフロー（設計書の改善）
6. 今は何もしない
7. その他（自由記述）
```

#### pending-issues の解消

全フェーズ完了時に `pending-issues-management` (aide-powers skill) を呼び出し、以下を実行する:
- `pending-issues.md` に「🚨 設計書未完了」の項目がある場合、該当項目を削除する
- 全項目が削除されてファイルが空になった場合は、ファイル自体を削除する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `step4`, step_title: `全フェーズ完了案内`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase6-final-check (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase5-optional-phases`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

## 完了条件

- 全てのオプションフェーズ（実行対象のもの）が完了し、各成果物についてユーザー合意を得ていること
- 各成果物が doc-index.md に登録されていること
- 各成果物が git コミットされていること
- reverse-progress.md に全フェーズ完了が記録されていること
- ユーザーに全フェーズ完了の案内が行われていること

### ビジュアルコンパニオン活用

以下の場面では `visual-companion` (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- アーキテクチャ抽出時のレイヤー構成図・依存方向図の表示
- オブジェクト設計時のクラス図、GUI設計時の画面レイアウトモックアップ

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。

| Red Flag | 対処 |
|---|---|
| 判定結果をユーザーに提示せずにオプションフェーズを開始しようとしている | STOP: 必ず判定結果をユーザーに提示し、合意を得てから進める |
| サブエージェントの成果物をユーザーに提示せずに次のフェーズに進もうとしている | STOP: 各オプションフェーズの成果物は必ずユーザーに提示して合意を得る |
| `doc-index-maintenance` (aide-powers skill) や `git-commit-workflow` (aide-powers skill) をスキップしようとしている | STOP: 各オプションフェーズ完了後の共通スキル呼び出しは省略不可 |
| 「あるべき設計」を記録しようとしている | STOP: 現実の記録原則に従い、コードの実態をそのまま記録する |
| 全フェーズ完了後の案内を省略しようとしている | STOP: 生成ドキュメント一覧と次に利用可能なワークフローの案内は必須 |
| コアフェーズ（1〜4）が未完了なのにオプションフェーズを開始しようとしている | STOP: コアフェーズの完了を先に確認する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- `fs-reverse-phase4-user-req` (aide-powers skill) → REQUIRED SUB-SKILL として遷移

**Next:**
- REQUIRED SUB-SKILL: fs-reverse-phase6-final-check (aide-powers skill)（進捗ファイル完全性チェック）

**Required common skills:**
- `doc-index-maintenance` (aide-powers skill) — 各オプション解析完了・ユーザー合意後に呼び出し
- `git-commit-workflow` (aide-powers skill) — 各オプション解析の doc-index-maintenance 完了後に呼び出し
- `pending-issues-management` (aide-powers skill) — 全フェーズ完了時に呼び出し（設計書未完了の pending-issues がある場合、解消を記録）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
