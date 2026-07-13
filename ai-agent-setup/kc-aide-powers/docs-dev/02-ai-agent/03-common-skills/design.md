# 共通スキル: 設計系

各設計フェーズの本処理（要件定義 / システム要件 / ユースケース / GUI / DDD / オブジェクト /
インフラ IF / プログラム構成）を担う共通スキル群。

設計系共通スキルは複数のモード（create / fix / delta / reverse / update）を持ち、
呼び出し元のフェーズスキル（`fs-design-*` / `fs-change-*` / `fs-bugfix-*` /
`fs-refactoring-*` / `fs-reverse-*`）からモード指定で起動される。

## user-requirements-definition

### 目的

ユーザー要件を EARS 構文 + MoSCoW 分類で構造化した `user-requirements.md` を作成・更新する。
要望を「目的」と「手段」に分離し、必須手段か一例かを確認したうえで構造化する。

### 呼び出し元

- `fs-design-phase1-user-req`（create / fix）
- `fs-reverse-phase4-user-req`（reverse: コード挙動 + ヒアリングからの逆生成）
- `fs-change-phase2-requirements` / `fs-change-phase5-delta-design`（delta: 変更要件の追加・修正）
- `fs-bugfix-phase4-design`（delta: 設計修正種別で要件への波及がある場合）

### メインプロセスの要点

1. ヒアリング / 既存資料 / コード挙動から要望を抽出する
2. 目的と手段を分離する。手段はユーザーに必須か一例かを確認する
3. 必須手段は要件として記載する。手段・ロジック・パラメータは抽象表現で記載
4. EARS 構文（Ubiquitous / Event-driven / State-driven / Unwanted / Optional）と
   MoSCoW 分類（Must / Should / Could / Won't）で構造化する

### Iron Law

- 目的と手段の分離なしに要件を確定しない。
- ユーザーに否定された手段を記載しない。

## system-requirements-definition

### 目的

システム要件（技術スタック・非機能要件）を `system-requirements.md` に、開発環境定義を
`dev-environment.md` にまとめる。

### 呼び出し元

- `fs-design-phase2-system-req`（create / fix）
- `fs-reverse-phase3-system-req`（reverse: コードの実態から抽出）
- `fs-change-phase5-delta-design` / `fs-bugfix-phase4-design`（delta: 該当領域の更新）

### メインプロセスの要点

技術スタック・非機能要件・エラーハンドリング方針（分類 / 伝播ルール / ログ方針）を整理する。
`dev-environment.md` には言語バージョン・仮想環境パス・依存管理方針・テスト実行コマンドを必須記載する。

### Iron Law

- `dev-environment.md` の作成漏れ禁止（実装系エージェントが必ず参照する）。
- エラーハンドリング方針の 3 要素（分類 / 伝播 / ログ）の欠落禁止。

## usecase-analysis

### 目的

ユーザー要件をユースケース単位で詳細化する 4 段階分析を行い、`usecases/` 配下に成果物を作成する。

### 呼び出し元

- `fs-design-phase6-usecase`

### メインプロセスの要点

1. **一覧化**: 想定されるユースケースを網羅的に列挙する
2. **詳細プロセス定義**: 各ユースケースの実現プロセスを書き下す
3. **操作性評価**: GUI 設計と突き合わせて操作性の問題を洗い出す
4. **改善**: 評価結果から改善案をまとめる

### Iron Law

- 4 段階を順序通りに実施し、いずれかをスキップしない。

## gui-design

### 目的

画面構成・遷移図・共通 UI ルールを `gui-design.md` に作成・更新する。

### 呼び出し元

- `fs-design-phase5-gui`（create）
- `fs-reverse-phase5-optional-phases`（reverse: GUI フレームワークの import が検出された場合）
- `fs-change-phase5-delta-design`（update: GUI に影響がある場合）

### メインプロセスの要点

ユーザー要件の Must 項目を全てカバーする画面・UI 要素を定義する。`visual-companion` で
モックアップ図を表示してユーザー確認する。

### Iron Law

- ユーザー要件 Must 項目に対応する画面 / UI 要素の取りこぼし禁止。

## ddd-modeling

### 目的

レイヤードアーキテクチャ設計と DDD 採用判断、およびドメイン層オブジェクト
（エンティティ・値オブジェクト・集約・ドメインサービス）のモデリングを担う。

### 呼び出し元

- `fs-design-phase7-ddd`（レイヤード設計）
- `fs-design-phase8-object` の domain サブフェーズ（ドメイン層オブジェクト設計）
- `fs-reverse-phase5-optional-phases`（reverse: コードからレイヤー構造とドメインオブジェクトを抽出）
- 差分系ワークフローの delta 用呼び出し

### メインプロセスの要点

DDD 採否を分析観点（規模・I/O 多様性・テスト独立性等）で判断し、結論に論理的根拠を持たせる。
採用時はアーキテクチャパターン選択（レイヤード / ヘキサゴナル / オニオン / クリーン）と
ユビキタス言語辞書の初期版作成も担う。

### Iron Law

- DDD 採用判断を「なんとなく」で決定しない。
- ドメイン層が他のどの層にも依存しない設計を強制する。
- ドメインモデル貧血症（Getter/Setter のみのデータホルダ化）を防ぐ。

## object-design

### 目的

レイヤーごとのクラス・メソッド・依存関係を SOLID 原則とテスタビリティに従って設計する。
アプリケーション / インフラ / プレゼンテーション層を担当する。

### 呼び出し元

- `fs-design-phase8-object` の app / infra / pres / summary サブフェーズ
- `fs-reverse-phase5-optional-phases`（reverse: クラスベース設計が検出された場合）
- 差分系ワークフローの delta 用呼び出し

### メインプロセスの要点

`object-design-application.md` / `object-design-infrastructure.md` /
`object-design-presentation.md` を作成し、最後に `object-design.md` でサマリを作る。
SRP の判定は「使う人の目的が 1 つに限定されているか」で行う（メソッド数や行数では判定しない）。
インフラ層には DI 切り替え可能な**テスト用ダミー実装**を必ず設計に含める。

### Iron Law

- ドメイン層への技術浸食（DB 型 / ORM 制約 / ライブラリ依存）を持ち込まない。
- レイヤーをまたぐ依存はインターフェース経由に限定する。
- 外部インフラアクセスにテスト用ダミー実装を含めない設計は FAIL。

## infra-interface-design

### 目的

API 定義・データストアスキーマ・外部サービス連携・リポジトリ実装を `infra-interface-design.md` に
まとめる。オブジェクト設計のインターフェース定義との整合を確保する。

### 呼び出し元

- `fs-design-phase9-infra`（create / fix）
- `fs-reverse-phase5-optional-phases`（reverse: インフラ層の実装が見つかった場合）
- 差分系ワークフローの delta 用呼び出し

### メインプロセスの要点

オブジェクト設計のリポジトリインターフェースに対応する具象実装定義をすべて網羅する。
エラーケース・設定パラメータも具体的に定義する。

### Iron Law

- リポジトリインターフェースとインフラ IF の対応漏れ禁止。

## program-structure-design

### 目的

フォルダ配置・ファイル命名規則・import ルール（レイヤー依存方向）を `program-structure.md` に
まとめる。

### 呼び出し元

- `fs-design-phase10-program`（create / fix）
- `fs-reverse-phase1-program`（reverse: コードベースの 3 パス解析）
- 差分系ワークフローの delta 用呼び出し

### メインプロセスの要点

オブジェクト設計の全クラスをファイル配置と 1 件ずつ突き合わせる。テスト用ダミー実装の配置先も
含める。import ルール（許可 / 禁止パスの具体定義）を `layered-architecture.md` の依存方向と
整合させる。

### Iron Law

- 全クラスのファイル配置漏れを 1 件でも検出すれば FAIL。抜き取りチェック禁止。
- import ルールがレイヤー依存方向と整合していなければ FAIL。
