---
name: object-design
description: "Use when object design documents (object-design-*.md) need to be created, updated, or reverse-engineered. Applies SOLID principles and testability to Application/Infrastructure/Presentation layer class design."
---

# オブジェクト設計

## Overview

**Core principle:** SOLID原則とテスタビリティを全クラスに適用し、レイヤー別にオブジェクトを設計する。ドメイン層は ddd-modeling (aide-powers skill) が担当し、本スキルはApplication/Infrastructure/Presentation層のクラス・インターフェース設計を担当する。

## The Iron Law

```
NO CLASS DESIGN WITHOUT SOLID PRINCIPLES AND TESTABILITY VERIFICATION.
SOLID原則とテスタビリティの検証なしに、クラス設計を確定してはならない。
```

## Process

### モード判定

呼び出し時のモードに応じて、以下のいずれかのプロセスを実行する。

- create モード（新規作成・品質チェック）→ 新規作成プロセスへ
- delta モード（差分設計）→ 差分設計プロセスへ
- reverse モード（逆引き）→ 逆引きプロセスへ

### OO設計の適用判断（全モード共通）

全モードの処理に入る前に、以下の判断基準を適用する:

- **機能とデータのまとまりが独立して成り立つ場合** → OO設計を適用する
- **単純な手続き的処理** → 無理にクラス化しない

### 新規作成プロセス（mode: create）

**Step 1:** 5サブフェーズの成果物を Read で読み込む
- 対象ファイル:
  - .aide/specs/{feature_name}/object-design-domain.md
  - .aide/specs/{feature_name}/object-design-application.md
  - .aide/specs/{feature_name}/object-design-infrastructure.md
  - .aide/specs/{feature_name}/object-design-presentation.md
  - .aide/specs/{feature_name}/object-design.md
  - .aide/specs/{feature_name}/ubiquitous-language.md

**Step 2:** object-designer-prompt.md を mode: quality_check で Task ディスパッチする
- サブエージェントが以下の品質基準を全レイヤーに適用して検証する:
  - SOLID原則（S/O/L/I/D 各原則の適用状況）
  - テスタビリティ（DI可能な構造、純粋ロジックの分離）
  - ドメインモデル貧血症の防止（ドメイン層のみ）
  - レイヤー間依存違反（上位→下位の具象依存がないか）
  - ダミー実装の設計漏れ（インフラ層のテスト用ダミー実装）
  - ユビキタス言語の整合性（命名の揺れがないか）
  - 外部連携部分の技術調査結果・参考ドキュメントリンクの記載状況

**Step 3:** 品質基準違反がある場合
- サブエージェントが違反箇所と修正提案をユーザーに提示する
- ユーザー合意を得て修正を実施する

**Step 4:** 完了
- 全品質基準を満たすことを確認し、完了を宣言する

### 差分設計プロセス（mode: delta）

**Step 1:** 変更要求と影響範囲を Read で読み込む
- 対象ファイル:
  - .aide/specs/{feature_name}/changes/{date}/change-requirements.md
  - .aide/specs/{feature_name}/changes/{date}/approach.md
  - .aide/specs/{feature_name}/changes/{date}/impact-analysis.md
  - 既存の .aide/specs/{feature_name}/object-design-*.md

**Step 2:** 影響を受けるレイヤーを特定する
- impact-analysis.md のプログラム構成視点の影響範囲から、更新が必要なレイヤー（domain/app/infra/pres）を特定する

**Step 3:** object-designer-prompt.md を mode: delta で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 影響を受けるレイヤーの既存 object-design-*.md を Read で読み込む（参照のみ、変更しない）
  2. 変更要求に基づき、before→after 形式で差分を設計する
  3. SOLID原則・テスタビリティを維持しながら差分を設計する
  4. 変更が外部ツール・外部サービス連携部分に及ぶ場合、tech-investigation (aide-powers skill) を実施し、調査結果と参考ドキュメントリンクを技術的実装情報セクションに反映する
  5. `{changes_dir}/delta-object-design.md` を Write で作成する

**Step 4:** ユーザー合意を確認する

**Step 5:** 完了

### 逆引きプロセス（mode: reverse）

**Step 1:** 既存コードベースの情報を Read で読み込む
- 対象ファイル:
  - .aide/specs/{feature_name}/program-structure.md
  - 既存コードファイル（program-structure.md に記載されたファイル群）
  - .aide/specs/{feature_name}/layered-architecture.md（存在する場合）

**Step 2:** object-designer-prompt.md を mode: reverse で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 全クラスの抽出（クラス名、継承関係、メソッド、プロパティ）
  2. 依存関係の解析（import文、コンストラクタインジェクション）
  3. レイヤー分類（ドメイン/アプリケーション/インフラ/プレゼンテーション）
  4. 例外クラスの抽出
  5. デザインパターンの識別（リポジトリ、ファクトリ、アダプタ等）
  6. テスト観点の抽出
  7. 外部連携部分の参考ドキュメントリンクの記録（既存コードのコメントやREADME等から抽出できる場合は記録し、抽出できない場合は tech-investigation (aide-powers skill) で補足調査してもよい）

**Step 3:** レイヤー別ファイルを生成する
- object-design-domain.md
- object-design-application.md
- object-design-infrastructure.md
- object-design-presentation.md
- object-design.md（概要）

**Step 4:** ユーザーに提示し合意を得る

**Step 5:** 完了

### 完了条件

**create モード:**
- 全レイヤーの品質基準チェックが完了している
- 品質基準違反がある場合は修正済み

**delta モード:**
- `{changes_dir}/delta-object-design.md` が作成されている（既存設計書は変更しない）
- ユーザー合意を得ている

**reverse モード:**
- 全レイヤーの object-design-*.md が生成されている
- object-design.md（概要）が生成されている
- ユーザー合意を得ている

## 品質基準（全モード共通）

### SOLID原則の適用基準

| 原則 | チェック観点 |
|---|---|
| S（単一責任） | クラスの変更理由が1つに限定されているか。bool型引数で他引数の役割が変わるメソッドがないか |
| O（オープン・クローズド） | 拡張ポイント（インターフェース、抽象クラス）が適切に設けられているか。新ユースケース追加時に既存クラスの修正が不要か |
| L（リスコフ置換） | 基底型で派生型を扱えるか。契約（事前条件・事後条件）が守られているか |
| I（インターフェース分離） | クライアントが使わないメソッドへの依存を強制していないか |
| D（依存性逆転） | 上位モジュールが下位モジュールの具象に依存していないか。DIによる依存注入が適切に設計されているか |

### テスタビリティの確保

| レイヤー | テスタビリティ基準 |
|---|---|
| ドメイン層 | モック不要でテスト可能な純粋ロジック |
| アプリケーション層 | DIでダミー実装を注入してテスト可能 |
| インフラ層 | テスト用ダミー実装（dry run）を必ず設計に含める |
| プレゼンテーション層 | ロジックをアプリケーション層に委譲し、UI層は薄く保つ |

### 役割定義→publicメソッド導出ルール

クラスの役割定義から必要なpublicメソッドを網羅的に導出するためのルール。全モード・全レイヤーに適用する。

**導出手順:**
1. クラスの「役割定義（具体）」セクション（入力・出力・責務外）を確認する
2. 「入力」で宣言されたデータを受け取るためのメソッドを特定する
3. 「出力」で宣言されたデータを返すためのメソッドを特定する
4. 入力→出力の変換に必要な中間処理のメソッドを特定する
5. 全ての責務に対応するpublicメソッドが存在することをセルフチェックする

**セルフチェック基準:**
- 役割定義で宣言した全ての「入力」に対応する受信経路（メソッド引数またはコンストラクタ引数）が存在すること
- 役割定義で宣言した全ての「出力」に対応する生成経路（メソッド戻り値）が存在すること
- 「責務外」に記載された処理に関するメソッドが含まれていないこと

**トレーサビリティ:**
- メソッドテーブルの「責務」列に、対応する役割定義の項目（入力/出力のどれに対応するか）を明記する

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「ドメイン層のクラスにインフラ固有の型を含めてもよい」 | ドメイン層への技術浸食。インターフェース経由で依存性を逆転させる |
| 「エンティティにメソッドがなくてもデータクラスとして十分」 | ドメインモデル貧血症。ビジネスルールをドメインオブジェクト自身に持たせる |
| 「テスト用ダミー実装は実装フェーズで考える」 | ダミー実装の設計はインフラ層設計の責務。設計フェーズで定義しないと実装時に設計漏れが発生する |
| 「全レイヤーを一度に設計した方が効率的」 | 順序依存の設計を一度にやると整合性が崩れる。domain→app→infra→pres→summaryの順序を守る |
| 「差分更新で影響範囲外のレイヤーも修正する」 | スコープクリープ。impact-analysis.md で特定された影響範囲のみを更新する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ドメイン層から外部ライブラリを直接使った方が効率的」 | ドメイン層への技術浸食。インターフェース経由で依存性を逆転させる |
| 「ユースケースクラスが1メソッドしかないのでサービスクラスにまとめる」 | 単一責任原則違反。ユースケースごとに独立したクラスを維持する |
| 「DIは過剰設計」 | テスタビリティの確保に必須。コンストラクタインジェクションで依存を受け取る設計とする |
| 「逆引きでコードの構造をそのまま設計書にすればよい」 | 逆引きでも設計品質基準（SOLID、テスタビリティ）を適用する。現状の問題点も記録する |
| 「差分更新は変更箇所だけ直せばよい」 | 変更箇所だけでなく、変更による波及影響（依存関係の変化）も確認する |

## Integration

**Called by:**
- `fs-design-phase8-object (aide-powers skill)`（設計WF: create モード — 5サブフェーズ完了後の品質基準最終確認）
- `fs-change-phase2-impl (aide-powers skill)`（変更WF: delta モード — オブジェクト設計に影響がある差分設計時）
- `fs-refactoring-phase4-design (aide-powers skill)`（リファクタリングWF: delta モード — オブジェクト設計に影響がある差分設計時）
- `fs-reverse-phase5-optional-phases (aide-powers skill)`（設計逆引きWF: reverse モード — クラスベース設計が検出された場合）

**Uses:**
- `object-designer-prompt.md` — オブジェクト設計用プロンプトテンプレート（本スキル内、Task でディスパッチ）

**Related skills:**
- `ddd-modeling (aide-powers skill)` — ドメイン層の設計を担当（本スキルはドメイン層以外を担当）
- `design-qa-dispatch (aide-powers skill)` — オブジェクト設計のQAレビュー（本スキルの呼び出し元フェーズスキルが管理）
- `design-sync (aide-powers skill)` — 実装中に設計との乖離が発覚した場合の同期手順
- `tech-investigation (aide-powers skill)` — 外部ツール・外部サービス連携部分の設計時に、公式ドキュメントベースの技術調査を実施するために使用する

**Input from caller:**
- `mode` — create / delta / reverse
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `date` — 変更日付（delta モード: `changes/{date}/` のパス特定に使用）
- `impact_analysis_path` — impact-analysis.md のパス（delta モード）
- `program_structure_path` — program-structure.md のパス（reverse モード）
