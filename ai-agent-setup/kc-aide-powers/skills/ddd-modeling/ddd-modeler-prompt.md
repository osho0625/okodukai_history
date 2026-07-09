# DDD モデリング指示

## スコープ

{scope}

- `architecture`: レイヤードアーキテクチャ設計（DDD採用判断 + アーキテクチャパターン選択 + レイヤー構成設計 + テスト用ダミー実装方針 + ユビキタス言語辞書初期版）
- `domain`: ドメイン層オブジェクト設計（ユビキタス言語辞書詳細化 + 戦術的パターン適用 + クラス定義 + 品質チェック）

## モード

{mode}

- `create`: 新規作成
- `delta`: 差分（before→after 形式）
- `reverse`: 逆引き（既存コードから設計書を逆生成）
- `fix`: QA指摘修正

## feature_name

{feature_name}

## 参照すべきスキル

**REQUIRED SUB-SKILL:** aide-powers:ddd-modeling

以下の手法・ルール・品質基準に従うこと:
- DDD採用判断の3観点分析手順
- アーキテクチャパターン選択基準（4パターン比較表）
- レイヤー構成設計ルール（依存性逆転、層間依存のインターフェース経由）
- ユビキタス言語辞書作成手順
- ドメイン層設計の品質基準（貧血症防止、集約境界、インフラ浸食防止、ユビキタス言語統一）
- テスト用ダミー実装の設計方針（許可/禁止ルール）

## 前フェーズの成果物

### scope: architecture, mode: create の場合
- `.aide/specs/{feature_name}/user-requirements.md`
- `.aide/specs/{feature_name}/system-requirements.md`
- `.aide/specs/{feature_name}/development-plan.md`
- `.aide/specs/{feature_name}/system-architecture.md`

### scope: domain, mode: create の場合
- `.aide/specs/{feature_name}/layered-architecture.md`
- `.aide/specs/{feature_name}/user-requirements.md`
- `.aide/specs/{feature_name}/ubiquitous-language.md`（初期版）

### mode: delta の場合
- `.aide/specs/{feature_name}/layered-architecture.md`（既存）
- `.aide/specs/{feature_name}/ubiquitous-language.md`（既存、DDD採用の場合）
- 変更要求ドキュメント（change-requirements.md / refactoring-plan.md）

### mode: reverse の場合
- 既存コード（ソースファイル群）
- `.aide/specs/{feature_name}/program-structure.md`

## 処理手順

aide-powers:ddd-modeling の該当プロセスに従って実行すること:
- scope: architecture, mode: create → プロセスA
- scope: domain, mode: create → プロセスB
- mode: delta → プロセスC（Delta プロセス）
- mode: reverse → プロセスD
- mode: fix → QA指摘内容に基づき該当箇所を修正

## 成果物フォーマット

### layered-architecture.md（scope: architecture の場合）

```markdown
# レイヤードアーキテクチャ設計

## DDD採用可否の判断

### 分析観点

| # | 観点 | 分析結果 |
|---|---|---|
| 1 | ドメインルール・振る舞いの有無 | {分析結果} |
| 2 | ルール変更の主体 | {分析結果} |
| 3 | 変更の可能性 | {分析結果} |

### 結論

{DDD採用 / DDD不採用}

### 理由

{判断の根拠を記述}

## アーキテクチャパターン

{選択したパターン名}（選択理由を記述）

## レイヤー構成図

{テキストベースのレイヤー構成図}

## 各レイヤーの責務定義

### {レイヤー名1}
- 責務: {責務の説明}
- 配置するコンポーネント: {コンポーネント一覧}

### {レイヤー名2}
...

## レイヤー間の依存ルール

| 依存元 | 依存先 | 許可/禁止 | 備考 |
|---|---|---|---|

## 依存性逆転の適用箇所（DDD採用時）

| インターフェース | 定義場所（層） | 実装場所（層） | 用途 |
|---|---|---|---|

## テスト用ダミー実装の設計方針

### 対象インターフェース一覧

| インターフェース | ダミー実装の概要 | DI切り替え方法 |
|---|---|---|

### 禁止事項
- 「ライブラリ未インストール」等の理由で本来の処理をダミーで代替する設計を含めない
- テスト用ダミー実装（dry run用）は許可。同一インターフェースを実装し、DIで本番実装と切り替え可能にする
```

### ubiquitous-language.md（DDD採用時）

```markdown
# ユビキタス言語辞書

## 概要

本ドキュメントは、ユーザー要件で使用されるビジネス用語と、
設計・実装で使用するクラス名・メソッド名の対応を定義する。

## 用語対応表

### エンティティ・値オブジェクト（名詞）

| ビジネス用語（日本語） | 英語名 | 設計上の型名 | 分類 | 備考 |
|---|---|---|---|---|

### 振る舞い（動詞）

| ビジネス用語（日本語） | 英語名 | 設計上のメソッド名 | 所属クラス | 備考 |
|---|---|---|---|---|

### 未対応の用語（要注意）

| ビジネス用語 | 未対応の理由 |
|---|---|
```

### object-design-domain.md（scope: domain の場合）

```markdown
# ドメイン層オブジェクト設計

## 概要

{ドメイン層の全体像を1〜2文で}

## エンティティ

### {エンティティ名}

- **役割:** {1文で}
- **不変条件:** {不変条件のリスト}

| メソッド名 | 引数 | 戻り値 | 概要 |
|---|---|---|---|

- **テスト観点:** {テスト観点のリスト}

## 値オブジェクト

### {値オブジェクト名}

- **役割:** {1文で}
- **不変条件:** {不変条件のリスト}
- **同値性:** {同値性の判定基準}

## 集約

### {集約ルート名}

- **境界:** {集約に含まれるエンティティ・値オブジェクト}
- **整合性ルール:** {集約内で保証する整合性}
- **他集約との関連:** {ID参照で関連付ける集約}

## ドメインサービス

### {ドメインサービス名}

- **役割:** {1文で。なぜエンティティに属さないかを明記}

| メソッド名 | 引数 | 戻り値 | 概要 |
|---|---|---|---|

## リポジトリインターフェース

### {リポジトリ名}

- **対象集約:** {対象の集約ルート}

| メソッド名 | 引数 | 戻り値 | 概要 |
|---|---|---|---|
```

## QA指摘内容（fix モードの場合）

{QAレビューアーの修正指示をそのまま転記}

## 変更要求（delta モードの場合）

{change-requirements.md / refactoring-plan.md の該当セクションを転記}
