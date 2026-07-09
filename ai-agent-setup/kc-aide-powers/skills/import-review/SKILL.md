---
name: import-review
description: "Use when reviewing implementation code to detect layered architecture dependency direction violations in import statements"
---

# importルールレビュー

## Overview

**Core principle:** レイヤー間の依存方向を守れ。内向き（domain 側）のみを指す依存だけが許される。

import-review は、実装コードの import 文（依存宣言文）を機械的に解析し、DDD + レイヤードアーキテクチャの依存方向違反を検出するレビュールール詳細スキルである。design-review-agent (aide-powers agent) の実装コードレビュー（mode: implementation）で REQUIRED SUB-SKILL として参照される。

> Dependencies must point inward. Domain depends on nothing; outer layers depend on inner layers only.

**重要:** importルール違反は**設計漏れ判定の対象外**である。設計準拠レビュー（クラス定義・シグネチャ等）の差分には乖離種別判定（FAIL_IMPL / FAIL_DESIGN）が適用されるが、importルール違反はアーキテクチャの根幹に関わるため、常に FAIL_IMPL（実装修正が必要）として扱う。

## The Iron Law

```
NO OUTWARD OR CROSS-LAYER DEPENDENCIES.
ドメイン層を最内層とし、外側の層は内側の層のみに依存する。内向き以外の依存を認めてはならない。
```

このルールに例外は存在しない。例外ルール2件（§例外ルール参照）は Iron Law の一部として明示的に定義された「許可事項」であり、Iron Law を破るものではない。

## Process

**Step 1:** プロジェクトの import ルール定義の読み込み
- program-structure.md の「importルール（許可/禁止パス）」セクションを Read で読む
- セクションがない場合 → 本スキル内の標準禁止マトリクス（§禁止マトリクス）を適用する
- プロジェクトのソースルートディレクトリ（src/ 等）を確認
- プロジェクトの例外ファイル（config, container, main 相当）を確認

**Step 2:** 対象ソースファイルの走査（Glob でファイルを走査）
- プロジェクトのソースルート配下の全ソースファイルを走査
  - Python: {root}/**/*.py
  - TypeScript: {root}/**/*.{ts,tsx}
  - Java: {root}/**/*.java
  - Go: {root}/**/*.go
  - C#: {root}/**/*.cs
- 対象ディレクトリが存在しない場合 → FAIL として報告（「対象ディレクトリが存在しない」）

**Step 3:** 各ファイルの依存宣言文を抽出（Read で各ファイルを読み込み）
- Python: `import X` と `from X import Y` を抽出
- TypeScript: `import ... from '...'` を抽出
- Java: `import package.Class;` を抽出
- Go: `import "path"` を抽出（グループ化された複数importに対応）
- C#: `using Namespace;` を抽出
- 行番号を記録する（違反報告に使用）
- 構文エラーでファイルが解析不能な場合 → そのファイルをスキップし、サマリに「解析不能ファイル」として記載（PASS 判定には影響しないが、修正推奨）

**Step 4:** 各ファイルの所属レイヤーを判定
- ファイルパスから所属レイヤーを判定
  - src/domain/ 配下 → domain
  - src/application/ 配下 → application
  - src/infrastructure/ 配下 → infrastructure
  - src/presentation/ 配下 → presentation
- 例外ファイル（config, container, main 相当）は「層に属さない」と判定
- 判定不能なパス → WARNING として記録（PASS 判定には影響させない）
  - ※ program-structure.md から例外ファイルとして扱うかを判定。判定不能な場合は WARNING として報告する

**Step 5:** 例外ルールの適用判定（禁止マトリクス判定より先に実施）
- 例外1: import元 または import先 が例外ファイル（config/container/main 相当）→ 許可（次の import へ）
- 例外2: import元が presentation で、import先が domain の値オブジェクトのデータ構造参照のみ → 許可（次の import へ）
  - ※「値オブジェクトのデータ構造参照のみ」の判定:
    - 値オブジェクト（例: EmailAddress, PhoneNumber 等の不変データクラス）の型参照・属性参照のみ
    - domain のサービス呼び出し・エンティティのメソッド呼び出しは禁止
- いずれの例外にも該当しない → Step 6へ

**Step 6:** 禁止マトリクスに照合
- 以下の8パターンのいずれかに該当するかを判定:

  | # | import元 | 禁止import先 | 理由 |
  |---|---|---|---|
  | 1 | domain | application | ドメイン層の独立性 |
  | 2 | domain | infrastructure | ドメイン層の独立性 |
  | 3 | domain | presentation | ドメイン層の独立性 |
  | 4 | application | infrastructure | 依存性逆転の原則 |
  | 5 | application | presentation | 上位層への逆依存禁止 |
  | 6 | infrastructure | application | 層間の循環依存防止 |
  | 7 | infrastructure | presentation | 層間の循環依存防止 |
  | 8 | presentation | infrastructure | インフラ層への直接依存禁止 |

- 該当する → 違反として記録
- 該当しない → 許可された依存（次の import へ）

**Step 7:** 違反リストの生成とサマリ出力
- 違反一覧テーブル（ファイル、行番号、import文、違反ルール）
- サマリ（検査ファイル数、違反数、判定）
- 判定:
  - 違反 0 件 → PASS
  - 違反 1 件以上 → FAIL

## 許可される依存方向

```
  presentation
       │
       ▼
   application
       │
       ▼
     domain  ◄─── infrastructure
```

- domain は最内層。他の層に依存しない
- infrastructure は domain のみに依存する（依存性逆転の原則により、domain のインターフェースを実装する）
- application は domain のみに依存する
- presentation は application に依存する。ただし **domain の値オブジェクトのデータ構造参照のみ**許可（例外2）
- `config`, `container`, `main` 相当のファイルは層に属さず、全層から import 可能（例外1）

## 禁止マトリクス（8パターン）

| # | import元 | 禁止import先 | 理由 | 詳細 |
|---|---|---|---|---|
| 1 | domain | application | ドメイン層の独立性 | ドメインはビジネスルールの本丸であり、アプリケーション層（ユースケース）に依存すると責務が逆転する |
| 2 | domain | infrastructure | ドメイン層の独立性 | ドメインはインフラ実装（DB/外部API等）に依存してはならない。DIP によりインターフェース経由で使う |
| 3 | domain | presentation | ドメイン層の独立性 | ドメインは UI / プレゼンテーションの事情を知ってはならない |
| 4 | application | infrastructure | 依存性逆転の原則 | アプリケーション層はインフラ実装に依存してはならない。domain のインターフェースを通じて間接利用する |
| 5 | application | presentation | 上位層への逆依存禁止 | アプリケーション（ユースケース）が UI に依存すると、UI 変更がユースケースに波及する |
| 6 | infrastructure | application | 層間の循環依存防止 | インフラ層はアプリケーション層のユースケースを知ってはならない。インフラは domain のインターフェースを実装するのみ |
| 7 | infrastructure | presentation | 層間の循環依存防止 | インフラ層はプレゼンテーション層を知ってはならない |
| 8 | presentation | infrastructure | インフラ層への直接依存禁止 | プレゼンテーション層はインフラ実装を直接呼ばず、application を経由する |

## 例外ルール

### 例外1: 層に属さないファイル（全層からimport可）

以下のファイル（およびプロジェクトで同等の役割を持つファイル）は特定レイヤーに属さず、全層からの import を許可する:

| ファイル | 役割 | 全層 import 可の理由 |
|---|---|---|
| `src/config.py`（相当: `config.ts`, `Config.java` 等） | 設定値定義 | 全層で設定値を参照する必要がある |
| `src/container.py`（相当: `di.ts`, `Container.java` 等） | DIコンテナ（Composition Root） | 具象クラスのインスタンス生成を一箇所に集約するため、container は全層を知る必要がある |
| `src/main.py`（相当: `index.ts`, `Main.java`, `main.go` 等） | エントリーポイント | アプリケーション起動時に全層を初期化する必要がある |

**判定方法:**
- `program-structure.md` で指定されている例外ファイル一覧を優先
- 指定がない場合は、プロジェクトの慣例に従って上記3種類を例外扱いにする

### 例外2: presentation → domain の値オブジェクトのデータ構造参照のみ許可

プレゼンテーション層からドメイン層への import は以下の条件を**全て**満たす場合のみ許可する:

1. **import 対象が値オブジェクト（Value Object）であること**
   - 例: `EmailAddress`, `PhoneNumber`, `Money`, `Period` などの不変データ構造
   - エンティティ（Entity）や集約ルート（Aggregate Root）の import は禁止
   - ドメインサービス（Domain Service）の import は禁止

2. **用途がデータ構造参照のみであること**
   - 型として参照する（引数型、フィールド型、戻り値型）
   - 属性（プロパティ）を読み取る
   - 値オブジェクトのメソッド呼び出し・ドメインロジック実行は禁止

3. **上記以外の用途は application 層経由で使用すること**
   - domain のビジネスロジックを呼びたい場合は application のユースケースを経由する

**禁止例:**
```python
# ❌ 禁止: presentation から domain のサービスを直接呼び出し
from domain.services.user_service import UserService
UserService().activate(user)

# ❌ 禁止: presentation から domain のエンティティを直接 import
from domain.entities.user import User
```

**許可例:**
```python
# ✅ 許可: presentation で domain の値オブジェクトを型参照
from domain.value_objects.email_address import EmailAddress

def display_email(email: EmailAddress) -> str:
    return email.value  # 属性参照は許可
```

## 出力フォーマット

### 違反一覧テーブル

```markdown
## importルール検証結果

### 違反一覧

| ファイル | 行番号 | import文 | 違反ルール |
|---|---|---|---|
| `src/domain/services/chunk_splitter.py` | 3 | `from infrastructure.utils import AudioLoader` | domain → infrastructure 禁止（ドメイン層の独立性） |
| `src/presentation/web/views.py` | 12 | `from infrastructure.db.connection import get_connection` | presentation → infrastructure 禁止（インフラ層への直接依存禁止） |

### サマリ

- 検査ファイル数: {N}
- 違反数: {M}
- 判定: {PASS / FAIL}
```

**「違反ルール」列の記載形式:**
- `{import元レイヤー} → {import先レイヤー} 禁止（{理由}）`
- 理由は禁止マトリクスの「理由」列をそのまま使用する

### 判定基準

- 違反 **0 件** → **PASS**
- 違反 **1 件以上** → **FAIL**

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。importルール違反を見逃そうとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「この1件だけならアーキテクチャを崩さない」 | 1件の違反が全体の依存グラフを崩す。例外を作ると後続の違反が連鎖する |
| 「設計漏れとして設計書を修正すればいい」 | importルール違反は設計漏れ判定の対象外。アーキテクチャの根幹は常に実装修正（FAIL_IMPL）が必要 |
| 「presentation から domain を import しているから例外2でいいだろう」 | 例外2は「値オブジェクトのデータ構造参照のみ」。サービス呼び出し・エンティティ操作は禁止 |
| 「config/container/main 以外のファイルも層に属さないから例外1にしよう」 | 例外1の対象は `program-structure.md` で指定されたファイルのみ。勝手に拡張してはならない |
| 「import 文が長いから違反しても読みにくいだけ」 | 読みにくさではなく、アーキテクチャの論理的整合性が論点 |
| 「テストが通っているから依存関係は問題ない」 | テスト通過と依存方向の正しさは別の品質軸。テストはインフラに直接依存するコードでも通る場合がある |
| 「他の既存ファイルでも同じ違反があるから、このファイルでも許容する」 | 既存の違反は既存の違反として別途修正対象。新たな違反を許容する理由にならない |
| 「時間がないから依存方向のリファクタリングは後回し」 | アーキテクチャの負債は時間が経つほど修正コストが大きくなる |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「domain から infrastructure を import しないと実装できない」 | 依存性逆転の原則を使う。domain でインターフェースを定義し、infrastructure がそれを実装する。DI で注入する |
| 「presentation から infrastructure を直接呼んだ方が手っ取り早い」 | 手っ取り早さは長期の保守性を破壊する。必ず application 経由で呼ぶ |
| 「application から presentation を呼ぶ設計もある」 | それは本スキルの前提（DDD + レイヤードアーキテクチャ）とは異なる設計。もしプロジェクトが異なる設計方針を採用するなら、`program-structure.md` でそれを明示すべき。明示がない限り、禁止マトリクスを適用する |
| 「infrastructure から application のユースケースを呼びたい（イベント処理等）」 | イベント駆動の場合は domain のインターフェース（IEventHandler 等）を通じて呼ぶ。infrastructure から application への直接 import は禁止 |
| 「値オブジェクトのメソッドくらい presentation で呼んでもいい」 | 値オブジェクトのメソッドがドメインロジック（バリデーション・変換等）を含む場合は application 経由で使う。例外2の「データ構造参照のみ」の粒度を守る |
| 「例外ファイル（container 等）に全部書けばルールを回避できる」 | container はインスタンス生成のみを担当する Composition Root。ビジネスロジックを container に書くことは別の設計違反（SRP 違反）であり、このルールで回避できない |

## Integration

**Called by:**
- `agents/design-review-agent`（mode: implementation）— 実装コードレビュー時に REQUIRED SUB-SKILL として本スキルを参照する
- 呼び出し元のワークフロー: 実装、変更、バグ修正、リファクタリング（全てで design-review-agent (aide-powers agent) mode: implementation 経由で呼ばれる）

**Related skills:**
- `multi-stage-code-review (aide-powers skill)` — design-review-agent (aide-powers agent) の実装コードレビューは multi-stage-code-review (aide-powers skill) の Stage 1a として実行される。本スキルはその中の importルール検証部分を担当
- `design-sync (aide-powers skill)` — 本スキル自体は合理的乖離ルールの対象外だが、importルール違反が設計書（program-structure.md）の記述不備に起因する場合は design-sync (aide-powers skill) で設計書を修正することがある
- `test-review (aide-powers skill)` — テストコードの配置・import 妥当性のレビューは test-review (aide-powers skill) が担当する。本スキルは mode: test では呼ばれない
- `code-quality-review (aide-powers skill)` — コード内部品質のレビュー。コード品質（命名・型・SOLID 等）は code-quality-review (aide-powers skill) が担当し、本スキルは importルールに特化する

**Input from caller（design-review-agent (aide-powers agent)）:**
- 対象ファイルパス（レビュー対象の実装ファイル）
- プロジェクトの import ルール定義（`program-structure.md` のセクションパス）
- 対象ソースディレクトリ（`src/` 等）

**Output to caller（design-review-agent (aide-powers agent)）:**
- 違反一覧テーブル（ファイル、行番号、import文、違反ルール）
- サマリ（検査ファイル数、違反数、判定）
- 判定（PASS / FAIL）

design-review-agent (aide-powers agent) は本スキルの出力を自身のレビュー結果（設計準拠レビュー + importルールレビュー）に統合して、multi-stage-code-review (aide-powers skill) の呼び出し元に返す。
