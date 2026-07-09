# プログラム構成設計 サブエージェント指示書

## 実行モード

{mode}

## feature_name

{feature_name}

## 出力先

`.aide/specs/{feature_name}/program-structure.md`

---

## 共通ルール（全モード）

### 設計原則

1. **レイヤードアーキテクチャの依存方向を具体的なimportルールで表現する**
2. **全クラスを漏れなくファイルに配置する**（create/fix モード）
3. **禁止importパスを明示的に列挙する**（「暗黙的に理解される」は不可）
4. **1ファイル1クラスを基本とする**（小さなヘルパークラスは例外。判断基準: 200行以下）

### 成果物フォーマット（program-structure.md）

```markdown
# プログラム構成

## 1. フォルダ構成ツリー
（全ファイル含む。ツリー形式で記載）

## 2. 各フォルダの役割説明
（フォルダごとに1〜2行で説明）

## 3. 各ファイルの役割説明
（ファイルごとに1行で説明）

## 4. ファイル命名規則
（言語別の命名規則を記載）

## 5. importルール（許可/禁止パス）
（レイヤー間の依存方向に基づく具体的なルール）

## 6. テストコードのディレクトリ構成
（tests/ 配下の構成）

## 7. 設定ファイル・環境変数の管理方針
（設定ファイルの配置場所、環境変数の管理方針）
```

---

## create モード（新規作成）

### 前提条件

- オブジェクト設計（object-design-*.md）とインフラIF設計（infra-interface-design.md）が完了していること
- layered-architecture.md でレイヤー構成と依存ルールが定義されていること

### 入力ファイル

以下のファイルを全て Read で読み込むこと:

| ファイル | 読み取る情報 |
|---|---|
| `layered-architecture.md` | レイヤー構成、依存ルール（importルールの根拠） |
| `object-design-domain.md` | ドメイン層の全クラス定義 |
| `object-design-application.md` | アプリケーション層の全クラス定義 |
| `object-design-infrastructure.md` | インフラ層の全クラス定義 |
| `object-design-presentation.md` | プレゼンテーション層の全クラス定義 |
| `infra-interface-design.md` | 外部IF仕様（設定ファイル管理方針の参考） |
| `system-architecture.md` | システム構成（全体像の把握） |
| `gui-design.md` | 画面構成（プレゼンテーション層のファイル配置の参考） |
| `user-requirements.md` | 要件（スコープの確認） |
| `system-requirements.md` | 要件（言語・フレームワーク情報） |

### 実行手順

#### ステップ1: フォルダ構成の設計

以下のルールに従ってフォルダ構成を設計する:

- ソースコードは `src/` 配下、テストコードは `tests/` 配下に配置する
- レイヤードアーキテクチャの各層を `src/` 配下のトップレベルフォルダとして反映する
- 各層の中は機能ドメインごとにサブフォルダを切る
- わかりやすいまとまりを優先し、深すぎるネストは避ける（最大3-4階層）

**フォルダ構成例（Python）:**

```
src/
├── domain/           # ドメイン層
│   ├── models/       # エンティティ、値オブジェクト
│   ├── services/     # ドメインサービス
│   └── repositories/ # リポジトリインターフェース
├── application/      # アプリケーション層
│   ├── usecases/     # ユースケース
│   └── dto/          # データ転送オブジェクト
├── infrastructure/   # インフラストラクチャ層
│   ├── persistence/  # リポジトリ実装
│   ├── external/     # 外部サービス連携
│   └── config/       # 設定
├── presentation/     # プレゼンテーション層
│   ├── gui/          # GUI関連
│   └── cli/          # CLI関連
└── shared/           # 層横断のユーティリティ（最小限に）
```

#### ステップ2: ファイル配置の確定

- object-design-*.md の**全クラス**を1つずつ確認し、対応するファイルを配置する
- 1ファイル1クラスを基本とする（小さなヘルパークラスは例外）
- 1ファイルあたりの行数目安: 200行以下
- 特殊ファイル: `__init__.py`（Python）、`config/`、`constants` 等も配置する

**重要:** 「大体カバーしている」は不可。全クラスを漏れなく配置すること。

#### ステップ3: ファイル命名規則の適用

system-requirements.md で決定された言語の標準命名規則に従う:

| 言語 | ファイル命名規則 | 備考 |
|---|---|---|
| Python | スネークケース（PEP 8準拠） | モジュール名は短い全小文字。1ファイル1クラスの場合はクラス名をスネークケースに変換 |
| TypeScript/JavaScript | キャメルケース or ケバブケース | プロジェクトの慣例に合わせる |
| Java/Kotlin/C# | パスカルケース | クラス名とファイル名を一致させる |

- インターフェースファイル: 言語規則に従う
- テストファイル: `test_` プレフィックスまたは `_test` サフィックス（言語慣例に従う）

**Python 命名規則の詳細（参考）:**

- **1ファイル1クラスの場合**: クラス名をスネークケースに変換する。UseCase サフィックスは省略可（例: `RunInferenceUseCase` → `run_inference.py`）
- **複数クラスをまとめるファイル**: 内容の役割を表すスネークケース名とする（例: `exceptions.py`、`value_objects.py`、`interfaces.py`）
- **インターフェースファイル（Python）**: `i_repository.py` または `repository_interface.py` 形式
- **パッケージ名（Python）**: 短い全小文字のスネークケース。アンダースコアの使用は非推奨だが許容される（例: `domain`, `application`, `infrastructure`, `presentation`）

#### ステップ4: importルールの定義

layered-architecture.md の依存ルールを具体的なimportパスに変換する:

1. **禁止されるimportパスを具体的に列挙する**
   - 例: `domain` から `infrastructure` への import は禁止
   - 例: `presentation` から `infrastructure` への直接 import は禁止
   - 例: `application` から `presentation` への import は禁止

2. **許可されるimportパスを明記する**
   - 例: `application` から `domain` のインターフェースへの import は許可
   - 例: `infrastructure` から `domain` のインターフェースへの import は許可（実装のため）
   - 例: `presentation` から `application` への import は許可

3. **依存方向の原則を明記する**
   - 上位層（domain）は下位層（infrastructure, presentation）に依存しない
   - 依存性逆転の原則（DIP）に基づくインターフェース参照パターンを明記する

#### ステップ5: テストコードのディレクトリ構成の定義

- `tests/` 配下に `src/` と同じ構造を反映する
- テストファイルは対象ファイルと1対1で対応させる
- テストヘルパー・フィクスチャの配置場所を定義する

#### ステップ6: 設定ファイル・環境変数の管理方針の定義

- 設定ファイルの配置場所を定義する
- 環境変数の管理方針を定義する
- infra-interface-design.md の外部IF仕様を参考にする

#### ステップ7: program-structure.md の作成

上記の成果物フォーマットに従い、program-structure.md を Write で作成する。

#### ステップ8: 整合性確認

以下を確認する:
- object-design-*.md の全クラスが漏れなくファイルに配置されていること
- importルールが layered-architecture.md の依存ルールと整合していること
- ファイル命名規則が system-requirements.md で決定された言語の標準規則に従っていること
- 矛盾がある場合はユーザーに報告する

#### ステップ9: ユーザーへの提示と合意取得

- フォルダ構成・ファイル命名規則・importルールを説明する
- ユーザーの質問・修正要望に対応する
- 合意後「プログラム構成確定」と明示する

---

## delta モード（差分更新）

### 入力情報

```
変更要求/修正方針:
{change_requirements}

影響分析結果:
{impact_analysis}

既存 program-structure.md:
{program_structure_path}

差分設計書の出力先:
{delta_design_path}
```

### 実行手順

#### ステップ1: 影響範囲の特定

- 影響分析結果から、プログラム構成に影響する変更を特定する
- 既存 program-structure.md の該当セクションを Read で読み込む

#### ステップ2: 変更内容の設計

以下の変更を設計する:
- 新規ファイルの追加（クラス追加の場合）
- 既存ファイルの移動・リネーム（構造変更の場合）
- importルールの更新（依存関係変更の場合）

**重要:** 影響範囲外のファイル配置・importルールは変更しない。

#### ステップ3: 差分設計書への記載

差分設計書（delta-design.md / fix-design.md / refactoring-design.md）に、program-structure.md の変更内容を before→after 形式で記載する:

```markdown
### program-structure.md の変更

#### フォルダ構成の変更

**before:**
```
src/application/usecases/
├── create_user.py
└── delete_user.py
```

**after:**
```
src/application/usecases/
├── create_user.py
├── delete_user.py
└── update_user.py  # 追加
```

#### importルールの変更

**before:**
（変更前のルール）

**after:**
（変更後のルール）
```

#### ステップ4: 整合性確認

- object-design-*.md との整合性を確認する（新規クラスのファイル配置漏れがないか）
- layered-architecture.md の依存ルールとimportルールの整合性を確認する

#### ステップ5: ユーザーへの提示と合意取得

- 変更内容を説明し、合意を得る

---

## reverse モード（逆引き）

### 入力情報

```
プロジェクトルート:
{project_root}

解析対象:
プロジェクト内の全ソースファイル
```

### 設計原則

**コードの現実を記録する。理想の設計ではない。**

- 実際のファイル配置・命名・依存関係をそのまま記録する
- importルール違反を発見した場合は「違反」として記録する（修正はしない）
- 改善は別のワークフロー（変更・リファクタリング）で行う

### 実行手順

#### パス1: スケルトン解析

1. Bash でディレクトリ構成のツリーを取得する（全ファイル名）
2. プロジェクト規模を判定する:
   - 小規模: 〜50ファイル
   - 中規模: 51〜150ファイル
   - 大規模: 151ファイル〜
3. エントリポイントを特定する（main.py, index.ts, App.java 等）
4. 設定ファイルの概要を把握する（.env, config/, settings 等）

#### パス2: importツリー解析

1. エントリポイント起点で import/require を再帰的にたどる
2. 動的importも検出する（importlib, dynamic import() 等）
3. 各ファイルの役割を推定する（ファイル名・import先から判断）
4. 依存方向（実態のimportルール）を記録する

#### パス3: フォルダ単位の網羅チェック

1. パス2で到達しなかったファイルを含め、全ファイルを網羅する
2. フォルダ単位で解析する（大規模プロジェクトは分割実行）
3. 各ファイルの役割説明を補完する

**注意:** パス3の制御フロー（調査計画作成、ディレクトリ単位のループ、分割判定）はフェーズスキル（reverse-phase1-program）側で管理する。本プロンプトテンプレートは各ディレクトリの解析手順（何を解析するか、どう記録するか）を提供する。

#### 整合性チェック

1. importルールの整理（依存方向の整合性確認、違反の記録）
2. 未到達ファイルセクションの整理（パス2で到達しなかったファイルの分類）
3. ファイル命名規則の補完（実態の命名パターンを記録）

#### 成果物作成

上記の成果物フォーマットに従い、program-structure.md を Write で作成する。reverse モードでは以下の点に注意:

- フォルダ構成ツリー: 実際のディレクトリ構成をそのまま記録
- importルール: 実態の依存方向を記録（違反がある場合は「※違反」と注記）
- ファイル命名規則: 実態の命名パターンを記録（不統一がある場合はその旨を記載）
- エントリポイント情報を追加セクションとして記載

#### ユーザー合意

- 解析結果を提示し、合意を得る
- 「これは現実の記録であり、改善は別のワークフローで行う」ことを説明する

---

## fix モード（修正）

### 入力情報

```
指摘内容:
{qa_feedback}

修正対象ファイル:
.aide/specs/{feature_name}/program-structure.md

関連成果物:
- .aide/specs/{feature_name}/object-design-domain.md
- .aide/specs/{feature_name}/object-design-application.md
- .aide/specs/{feature_name}/object-design-infrastructure.md
- .aide/specs/{feature_name}/object-design-presentation.md
- .aide/specs/{feature_name}/layered-architecture.md
```

### 実行手順

#### ステップ1: 指摘内容の分析

- 修正が必要な箇所を特定する
- 指摘の種類を判別する（ファイル配置漏れ、importルール不整合、命名規則違反 等）

#### ステップ2: 修正の実行

- ファイル配置漏れの修正時: object-design-*.md の全クラスを再確認する
- importルールの修正時: レイヤー間依存方向との整合性を確認する
- 命名規則の修正時: system-requirements.md で決定された言語の標準規則を確認する
- Edit で program-structure.md を修正する

#### ステップ3: 整合性確認

- object-design-*.md との整合性を確認する
- layered-architecture.md との整合性を確認する
- 修正範囲が他フェーズの成果物に及ぶ場合はその旨を報告する

#### ステップ4: ユーザーへの提示と合意取得

- 修正内容を説明し、合意を得る

---

## 禁止事項（全モード共通）

- object-design-*.md に定義されていないクラスのファイルを配置してはならない（create モード）
- layered-architecture.md の依存ルールに違反するimportルールを定義してはならない（create/fix モード）
- system-requirements.md で決定されていない言語の命名規則を適用してはならない
- 影響範囲外のファイル配置・importルールを変更してはならない（delta モード）
- コードの現実を理想化してはならない（reverse モード）
