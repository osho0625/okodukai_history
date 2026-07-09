---
name: test-review
description: "Use when reviewing test code for coverage (spec test points) or test policy compliance (naming, independence, no mocks, boundary values, exception cases)"
---

# テストレビュー

## Overview

**Core principle:** テストコードは、設計書のテスト観点を 100% 網羅し、モックなしで、独立した命名規則に従って書け。

テストは「設計書が要求する品質」を保証する装置である。ゆえに、
1. **設計書のテスト観点の全ケースを網羅する**（design-review 観点）
2. **命名・独立性・モック禁止のルールに従う**（code-review 観点）

この 2 軸を同時に満たさない限り、テストコードは受け入れ可能ではない。
モックが必要に感じたら、それはテスト困難な設計のシグナルである。**即席スタブで逃げるな**。

## The Iron Law

```
NO TEST ACCEPTED WITHOUT BOTH COVERAGE AND POLICY COMPLIANCE.
テスト観点カバー率 100% と、テスト方針準拠（命名・独立性・モック禁止）の両方を満たさない限り、
テストコードを受け入れてはならない。
```

```
NO MOCK LIBRARIES FOR PROGRAM LOGIC TESTS.
プログラムロジックのテストでモック/スタブライブラリを使用してはならない。
外部インフラ依存は、本番コードとして配置された正規のダミー実装を DI 経由で注入すること。
即席スタブの使用は禁止する。
```

種別: **Rigid**（厳密遵守。例外はユーザー承認を要する）

**Exceptions (ask your human partner):**
- 外部インフラ依存で、設計書にダミー実装が定義されておらず、設計変更も困難な場合のモック使用 → 先に `design-sync (aide-powers skill)` 共通スキルを起動し、設計見直しを検討する → 設計変更が困難と判断された場合に限り、ユーザー承認を得てモック使用を許可する（承認理由と対象を記録）
- プロトタイプ・スパイクコード（本番コードに含めない場合） → ただし本番コードに含まれるなら、例外は認めない

## テストフレームワークと配置ルール

### テストフレームワーク

プロジェクトのテストフレームワークに従う。Python プロジェクトの既定は **`unittest`** モジュール。**pytest は使用しない**（標準ライブラリで完結させ、追加依存を増やさないため）。

### テストコードの基本構造（Python + unittest 既定）

```python
import unittest

class TestTargetClass(unittest.TestCase):
    def test_method_condition_expected(self):
        # Arrange / Act / Assert
        ...

if __name__ == '__main__':
    unittest.main()
```

### テストファイルの配置ルール

`program-structure.md` で定義されたテストディレクトリ構造に従う。
レイヤードアーキテクチャ採用時は `{test_root}/{layer}/` 構造を推奨する。

Python + unittest の既定:
```
unittest/
├── domain/           # ドメイン層テスト
├── application/      # アプリケーション層テスト
└── infrastructure/   # インフラ層テスト
```

### 他言語対応（補足）

| 言語 / フレームワーク | テストフレームワーク | モック/スタブ禁止対象 | パラメタライズ機構 |
|---|---|---|---|
| Python（既定） | unittest | `unittest.mock`, `MagicMock`, `patch`, `Mock` | `unittest.TestCase.subTest` |
| Java | JUnit 5 | Mockito, PowerMock, EasyMock | `@ParameterizedTest` |
| C# / .NET | NUnit / xUnit | Moq, NSubstitute, FakeItEasy | `[TestCase]` / `[Theory]` |
| Go | `testing` パッケージ | gomock, testify/mock | `t.Run` によるサブテスト |
| TypeScript / JavaScript | Jest / Vitest | `jest.fn`, `jest.mock`, sinon | `test.each` / `it.each` |

## Process

### 入力パラメータ

呼び出し元（design-review-agent (aide-powers agent) または code-review-agent (aide-powers agent)）から以下を受け取る:

- **review_mode**: `"coverage"`（design-review-agent (aide-powers agent)）/ `"policy"`（code-review-agent (aide-powers agent)）/ `"both"`（統合呼び出し時）
- **target_test_file**: レビュー対象のテストファイルパス（例: `tests/domain/test_xxx.py`）
- **target_impl_file**: テスト対象の実装ファイルパス（例: `src/domain/xxx.py`）
- **design_doc_refs**: 設計書ファイルのリスト（レイヤー別 object-design-*.md、差分設計書など）
- **workflow_context**: 呼び出し元ワークフロー（`impl` / `change` / `bugfix` / `refactoring`）
- **test_framework_config**: テストフレームワーク名（既定: Python + unittest）、レイヤー別配置ルール

### ステップ 1: 設計書からテスト観点を抽出する

1. design_doc_refs の各設計書を Read で読み込む
2. target_impl_file 対象クラスの「テスト観点:」セクションを見つける
3. 箇条書きで列挙されたテストケースを個別にリスト化する
4. 設計書の「Raises:」セクションからも、例外系テストケースを抽出する
5. 設計書の「不変条件」「引数の制約」から境界値テストケースを抽出する

**workflow_context に応じた設計書参照先の切り替え:**

- `workflow_context == "impl"`:
  - object-design-*.md からテスト観点を抽出
  - 通常のテスト観点チェックのみ
- `workflow_context == "change"`:
  - delta-design.md + object-design-*.md からテスト観点を抽出
  - 過去不具合修正テストの保持検証を追加（bugfix/ 配下のテスト履歴を参照し、削除されていないか確認）
- `workflow_context == "bugfix"`:
  - fix-design.md + object-design-*.md からテスト観点を抽出
  - バグ再現テストの存在確認: bug-report.md の再現手順を再現するテストが対象タスクのテストファイルに存在するか確認
- `workflow_context == "refactoring"`:
  - refactoring-design.md + object-design-*.md からテスト観点を抽出
  - 外部振る舞い保持の確認（インターフェースレベルでのテスト変更有無を検出）

**抽出例（`InferenceParams` から 8 ケース抽出）:**

```
テスト観点セクションの内容:
- num_threads=0 → InvalidParamError
- num_threads=-1 → InvalidParamError
- num_threads=1.5（float） → InvalidParamError（int型チェック）
- chunk_duration=0.0 → InvalidParamError
- chunk_duration=-5.0 → InvalidParamError
- InferenceParams(1, 30.0) → 正常生成
- frozen確認: 属性代入で FrozenInstanceError
- InferenceParams.default() → num_threads=1, chunk_duration=30.0

→ 8 つの独立したテストケースとしてリスト化する
```

他ドメインでも同様のパターンで抽出すること。設計書の「テスト観点:」以降の箇条書きを 1 項目 = 1 テストケースとして数える。

### ステップ 2: テストファイルを読み込み、テストメソッドを列挙する

1. target_test_file を Read で読み込む
2. テストクラスと全テストメソッドを列挙する
3. 各テストメソッドの命名、アサーション内容、setUp/tearDown 構造を把握する

### ステップ 3: 検証項目ごとのチェック

review_mode に応じて、以下の検証項目をチェックする。

#### review_mode = "coverage" の場合（design-review-agent (aide-powers agent) が呼び出す）

- 検証項目 0: パブリックメソッドのテスト必須
- 検証項目 1: テストケース網羅性（設計書テスト観点との照合）
- 検証項目 5: 境界値テスト
- 検証項目 6: 異常系テスト（Raises との照合）

#### review_mode = "policy" の場合（code-review-agent (aide-powers agent) が呼び出す）

- 検証項目 0: パブリックメソッドのテスト必須
- 検証項目 2: テスト命名規則
- 検証項目 3: テスト独立性
- 検証項目 4: テスト方針の準拠（モック禁止）
- 検証項目 5: 境界値テスト（ロジック品質の観点）
- 検証項目 6: 異常系テスト（アサーション品質の観点）

#### review_mode = "both" の場合

上記すべての検証項目（0〜6）をチェックする。

### ステップ 4: 各検証項目の詳細チェック

各検証項目の詳細ロジックは後述の「検証項目詳細」セクションを参照する。

### ステップ 5: 未カバーケース・違反を特定し、出力フォーマットにまとめる

後述の「出力フォーマット」セクションに従って、以下の 4 セクションを作成する:
- 未カバーのテストケース表
- テスト方針違反表
- 設計書別カバレッジサマリ
- 全体サマリ

### ステップ 6: 判定

- **review_mode = "coverage"**: カバー率 100% かつ検証項目 0 の違反 0 件 → PASS、それ以外 → FAIL
- **review_mode = "policy"**: 違反 0 件 → PASS、1 件以上 → FAIL
- **review_mode = "both"**: いずれかの判定で FAIL なら FAIL

### ステップ 7: モック使用検出時の特別フロー

検証項目 4 で `unittest.mock` 等のモックライブラリ使用が検出された場合、以下の 2 択フローを適用する:

**Step 7-1:** モック使用の分類
- 外部インフラ依存のテスト？
  - YES → 設計書にダミー実装が定義されているか確認
    - 定義あり → FAIL（設計書定義のダミー実装を使うよう指示）
    - 定義なし → 選択肢 A または B を提示
  - NO（プログラムロジックのテスト） → FAIL（モック使用禁止）

**Step 7-2:** 選択肢 A: design-sync (aide-powers skill) 共通スキル起動
- 設計見直しを提案し、依存関係を分離してテスト可能にする
- 提案内容: 依存関係を分離する、インターフェースを追加する、ダミー実装を設計書に追加する

**Step 7-3:** 選択肢 B: ユーザー承認取得
- スタブ使用の理由と対象を明示
- 承認なしでのスタブ使用は FAIL
- 承認を得た場合は、テストコード内のコメントで承認を得た旨と理由を記録する

**このフローは code-review-agent (aide-powers agent) が検出した場合に発動する**（検証項目 4 は code-review-agent (aide-powers agent) の担当）。

## 検証項目詳細

### 検証項目 0: パブリックメソッドのテスト必須（両エージェント共通）

**チェックロジック:**

1. target_impl_file を解析し、全パブリックメソッドを列挙する（アンダースコア `_` で始まらないメソッド）
2. target_test_file の全テストメソッドを解析する
3. パブリックメソッド名に対応するテストメソッドが存在するかを確認する（`test_{method_name}_*` パターン）
4. 設計書の「テスト観点」に記載がないパブリックメソッドでも、テストの存在は必須とする

**違反時の出力:**

```
| ファイル | クラス | パブリックメソッド | 状態 |
|---|---|---|---|
| src/domain/xxx.py | XxxClass | calculate_something | テスト未実装（ERROR） |
```

**重要度**: ERROR
**担当エージェント**: design-review-agent (aide-powers agent) と code-review-agent (aide-powers agent) の両方（重複チェックだが、どちらで検出されても FAIL）

---

### 検証項目 1: テストケース網羅性（design-review-agent (aide-powers agent) 担当）

**チェックロジック:**

1. ステップ 1 で抽出した設計書のテスト観点リストを取得
2. 各テスト観点について、対応するテストメソッドが存在するかをセマンティックに照合する
3. テストメソッドのアサーション内容が、設計書のケースを正しく検証しているかを確認する
4. 1 つのテストメソッドが複数のテスト観点をカバーしている場合も許容する
5. `subTest` によるパラメタライズも有効とみなす
6. カバー率 = (カバーされたテスト観点数) / (総テスト観点数) × 100% を計算する

**セマンティック照合の例:**

設計書のテスト観点: `num_threads=0 → InvalidParamError`

対応するテストメソッドの候補:
- `test_init_with_zero_num_threads_raises_invalid_param_error` ✅ カバー
- `test_num_threads_zero` ✅ カバー（命名からも読み取れる）
- `test_validation` ❌ 名前から何をテストしているか読み取れない（別途検証項目 2 で指摘）

**重要度**: カバー率 100% 未満で FAIL

---

### 検証項目 2: テスト命名規則（code-review-agent (aide-powers agent) 担当）

**チェックロジック:**

| サブ項目 | ルール | 例 |
|---|---|---|
| 2-1 | テストファイル名 = `test_{対象ファイル名}.py` | `src/domain/inference_params.py` → `tests/domain/test_inference_params.py` |
| 2-2 | テストクラス名 = `Test{対象クラス名}` | `InferenceParams` → `TestInferenceParams` |
| 2-3 | テストメソッド名 = `test_{メソッド名}_{条件}_{期待結果}` | `test_init_with_zero_num_threads_raises_invalid_param_error` |
| 2-4 | 命名から何をテストしているか読み取れるか | `test_validation` のような曖昧な命名は ERROR |

**他言語対応（補足）:**

| 言語 | ファイル名 | クラス名 | メソッド名 |
|---|---|---|---|
| Python + unittest | `test_{対象}.py` | `Test{対象クラス名}` | `test_{メソッド名}_{条件}_{期待結果}` |
| Java + JUnit | `{対象クラス名}Test.java` | `{対象クラス名}Test` | `{メソッド名}_{条件}_{期待結果}` |
| C# + NUnit | `{対象クラス名}Tests.cs` | `{対象クラス名}Tests` | `{メソッド名}_{条件}_{期待結果}` |
| Go + testing | `{対象}_test.go` | （関数ベース） | `Test{メソッド名}_{条件}_{期待結果}` |

**重要度**: ERROR

---

### 検証項目 3: テスト独立性（code-review-agent (aide-powers agent) 担当）

**チェックロジック:**

| サブ項目 | ルール | 違反検出パターン |
|---|---|---|
| 3-1 | 各テストメソッドが独立して実行可能か | `setUp`/`tearDown` 外で共有状態を変更している、テストメソッド間で呼び出し順序に依存している |
| 3-2 | テスト実行順序に依存していないか | クラス変数やモジュール変数をテスト内で変更して、後続テストが前のテスト結果に依存している |
| 3-3 | 共有状態の変更がないか | グローバル変数の書き換え、ファイルシステム状態の永続的変更（`tearDown` でクリーンアップされていない） |

**違反時の出力:**

```
| テストファイル | テストメソッド | 違反内容 |
|---|---|---|
| tests/domain/test_xxx.py | test_increment_counter | グローバル変数 `_counter` を書き換えており、次のテストが影響を受ける |
```

**重要度**: ERROR

---

### 検証項目 4: テスト方針の準拠 — モック禁止（code-review-agent (aide-powers agent) 担当）

**最重要ルール**: プログラムロジックに関わるテストコードで**スタブ・モック**（`unittest.mock`, `MagicMock`, `patch` 等）は使用しない。

**チェックロジック:**

1. テストファイルの import 文を解析する
2. 以下のいずれかの import があれば、モック使用を検出する:
   - Python: `unittest.mock`, `mock`, `MagicMock`, `patch`, `Mock`, `MonkeyPatch`
   - Java: `org.mockito.*`, `mockito`, `PowerMock`
   - C#: `Moq`, `NSubstitute`, `FakeItEasy`
   - Go: `gomock`, `testify/mock`
   - JS/TS: `jest.fn`, `jest.mock`, `sinon`
3. 検出された場合、ステップ 7 のモック使用検出特別フローを適用する
4. レイヤー別の補足チェックを適用する

**レイヤー別の補足チェック:**

| レイヤー | テスト方針 | チェック内容 |
|---|---|---|
| ドメイン層（`unittest/domain/`） | 純粋ロジックのテスト | 外部依存が一切ないこと。モックライブラリの import があれば ERROR |
| アプリケーション層（`unittest/application/`） | 外部インフラ依存はダミー実装を DI 注入 | モックライブラリの import があれば ERROR。ダミー実装は設計書に定義された正規クラスを使用すること |
| インフラ層（`unittest/infrastructure/`） | 必要に応じて tmpdir 等の fixture 使用。外部インフラはダミー実装で代替 | モックライブラリの import があれば ERROR |

**ダミー実装の要件:**

- **本番コードとして**正規のディレクトリに配置されている（Python 既定: `src/infrastructure/`）
- **テストコード内で即席に作ったスタブ**ではない
- 設計書で明示的にダミー実装として定義されている
- DI（Dependency Injection）経由で注入可能になっている

**ダミー実装の違反例:**

```python
# ❌ 違反: テストコード内で即席スタブを作成
class FakeRepository:  # tests/application/test_xxx.py 内で定義
    def save(self, data): pass
    def find(self, id): return None

# ✅ OK: 本番コードのダミー実装を DI 注入
from src.infrastructure.dummy_repository import DummyRepository  # src/ 配下の正規クラス
use_case = UseCase(repository=DummyRepository())
```

**違反時の出力:**

```
| テストファイル | 行番号 | 違反内容 | 推奨対処 |
|---|---|---|---|
| tests/domain/test_chunk_splitter.py | 3 | ドメイン層テストで `unittest.mock` を使用している（from unittest.mock import patch） | モック削除 + 純粋ロジックテストに修正 |
| tests/application/test_use_case.py | 5 | アプリケーション層テストで `MagicMock` を使用している | 設計書定義のダミー実装を DI 注入に変更 |
```

**重要度**: ERROR

---

### 検証項目 5: 境界値テスト（両エージェント対象 — design-review 主、code-review 副）

**チェックロジック:**

1. 設計書の不変条件・引数制約から閾値を抽出する
2. 閾値に対して、以下のテストが存在するか確認する:
   - 閾値ちょうどの値
   - 閾値の直前（境界のギリギリ内側）
   - 閾値の直後（境界のギリギリ外側）
3. 欠落がある場合は未カバーとして報告

**具体例:**

```
設計書の制約: num_threads >= 1

必要なテスト:
- num_threads=0 （閾値の直前、NG ケース → InvalidParamError）
- num_threads=1 （閾値ちょうど、OK ケース → 正常生成）
- （num_threads=2 は境界値ではないため必須ではない）

テストメソッド例:
- test_init_with_num_threads_zero_raises_invalid_param_error
- test_init_with_num_threads_one_succeeds
```

**違反時の出力:**

```
| 設計書 | クラス | 不変条件 | 未カバーの境界値 |
|---|---|---|---|
| object-design-domain.md | InferenceParams | num_threads >= 1 | num_threads=0（直前）のテストなし |
```

**重要度**: FAIL（カバー率 100% 未満）

---

### 検証項目 6: 異常系テスト（両エージェント対象 — design-review 主、code-review 副）

**チェックロジック:**

1. 設計書の「Raises」セクションから、全例外クラスを抽出する
2. 各例外について、送出条件のテストが存在するかを確認する
3. テスト内でテストフレームワークの例外検証 API を使って正しい例外クラスを検証しているか確認する
4. 例外メッセージの検証（必須ではないが推奨）

**言語別の例外検証 API:**

| 言語 | 例外検証 API |
|---|---|
| Python + unittest | `self.assertRaises(ExceptionClass)`, `self.assertRaisesRegex(ExceptionClass, pattern)` |
| Java + JUnit 5 | `assertThrows(ExceptionClass.class, () -> ...)` |
| C# + NUnit | `Assert.Throws<ExceptionClass>(() -> ...)` |
| Go + testing | `if err == nil { t.Error(...) }` + 型アサーション |
| JS/TS + Jest | `expect(() => ...).toThrow(ExceptionClass)` |

**違反時の出力:**

```
| 設計書 | クラス | Raises | 状態 |
|---|---|---|---|
| object-design-domain.md | InferenceParams | InvalidParamError | テスト未実装 |
| object-design-domain.md | VadParams | InvalidParamError（min >= max） | テスト存在するがアサーション内容が不正 |
```

**重要度**: FAIL（カバー率 100% 未満）

## 出力フォーマット

テストレビュー結果は、以下の 4 つのセクションで構成される。

**セクション 1: 未カバーのテストケース表（design-review 観点）**

```markdown
### 未カバーのテストケース
| 設計書 | クラス | テスト観点 | 状態 |
|---|---|---|---|
| `object-design-domain.md` | `InferenceParams` | `num_threads=1.5`（float）→ `InvalidParamError` | 未実装 |
| `object-design-domain.md` | `VadParams` | `min_speech_duration=30.0, max_speech_duration=30.0`（等しい）→ `InvalidParamError` | 未実装 |
```

**セクション 2: テスト方針違反表（code-review 観点）**

```markdown
### テスト方針違反
| テストファイル | 違反内容 |
|---|---|
| `tests/domain/test_chunk_splitter.py` | ドメイン層テストで `unittest.mock` を使用している |
| `tests/application/test_use_case.py` | テストメソッド `test_validation` の命名が曖昧（何をテストしているか読み取れない） |
```

**セクション 3: 設計書別カバレッジサマリ**

```markdown
### カバレッジサマリ
| 設計書 | 総テストケース数 | 実装済み | 未実装 | カバー率 |
|---|---|---|---|---|
| `object-design-domain.md` | 45 | 42 | 3 | 93.3% |
| `object-design-application.md` | 20 | 18 | 2 | 90.0% |
```

**セクション 4: 全体サマリ**

```markdown
### 全体サマリ
- 総テストケース数: {N}
- 実装済み: {M}
- 未実装: {N-M}
- カバー率: {M/N * 100}%
- テスト方針違反数: {V}
- 判定: {PASS / FAIL}
```

**判定ルール:**

- review_mode = "coverage": カバー率 100% かつ検証項目 0 の違反 0 件 → PASS
- review_mode = "policy": 違反 0 件 → PASS
- review_mode = "both": 上記両方を満たす → PASS

## 注意事項

- テストメソッド名と設計書のテスト観点の対応は、**完全一致ではなくセマンティックな照合**で判定する
- **1 つのテストメソッドが複数のテスト観点をカバーしている場合も許容する**（ただし推奨しない）
- 設計書に記載のないテストケースの追加は許容する（品質向上として歓迎）
- `unittest.TestCase` の **`subTest` によるパラメタライズも有効**とみなす（他言語: `@ParameterizedTest`, `test.each`, `t.Run` 等も同様）

## 2 エージェントの責務分担

| 呼び出し元エージェント | mode | 本スキルの review_mode | 担当検証項目 |
|---|---|---|---|
| design-review-agent (aide-powers agent) | implementation（実装コードレビュー） | — | 本スキル非対象 |
| design-review-agent (aide-powers agent) | **test**（テストコードレビュー） | **coverage** | 0, 1, 5, 6 |
| code-review-agent (aide-powers agent) | implementation（実装コードレビュー） | — | 本スキル非対象 |
| code-review-agent (aide-powers agent) | **test**（テストコードレビュー） | **policy** | 0, 2, 3, 4, 5, 6 |

**重複項目（検証項目 0）の扱い:**
「パブリックメソッドのテスト必須」は両エージェントの責務に該当する。
両エージェントから同時にチェックされるが、いずれか一方でも ERROR を検出すれば FAIL となるため、運用上問題ない。

## ワークフロー別差異

本スキルは複数のワークフローから呼び出される。呼び出し元ワークフローに応じて、設計書の参照先と補足レビュー観点が切り替わる。

| 呼び出し元ワークフロー | 設計書の参照先 | 補足レビュー観点 | workflow_context 値 |
|---|---|---|---|
| 実装ワークフロー | `object-design-*.md`（レイヤー別） | — | `impl` |
| 変更ワークフロー | `delta-design.md` + `object-design-*.md` | 過去不具合修正テストの保持検証を追加 | `change` |
| バグ修正ワークフロー | `fix-design.md` + `object-design-*.md` | `bug-report.md` の再現手順に対応するバグ再現テストの存在確認 | `bugfix` |
| リファクタリングワークフロー | `refactoring-design.md` + `object-design-*.md` | 外部振る舞い保持の確認 | `refactoring` |

## Red Flags - STOP

以下の思考パターンを検出したら **STOP** — test-review のルールを逸脱しようとしている。

| # | Red Flag | なぜ危険か |
|---|---|---|
| 1 | 「モックを使えばすぐにテストが書ける」 | モック禁止は最重要ルール。テスト困難なのは設計の問題。`design-sync (aide-powers skill)` で設計を見直す |
| 2 | 「`test_validation` のような曖昧な命名でも動けば OK」 | 命名から何をテストしているか読み取れないと、将来の保守者が混乱する。ERROR |
| 3 | 「1 つのテストメソッドに複数のアサーションをまとめて効率化しよう」 | 複数ケースをまとめるなら `subTest` パラメタライズを使うこと。独立性を損なう無秩序な統合は禁止 |
| 4 | 「境界値のちょうど 1 つだけテストしておけば十分」 | 境界値は「ちょうど」「直前」「直後」の 3 点を押さえるべき。1 点だけでは不十分 |
| 5 | 「例外メッセージは検証しなくていい（必須ではない）」 | 必須ではないが推奨。重要な例外は `assertRaisesRegex` で内容まで検証するのが望ましい |
| 6 | 「設計書に載っていないパブリックメソッドのテストは不要」 | 検証項目 0 により、設計書に観点記載がなくてもテストは必須。ERROR |
| 7 | 「テストコード内で即席スタブを作れば本番コードを汚さない」 | 即席スタブは禁止。本番コードとして正規のダミー実装を置き、DI で注入する |
| 8 | 「unittest.mock は便利だから、ドメイン層でも使おう」 | ドメイン層は純粋ロジックのはず。モック不要。モック使用は即 ERROR |
| 9 | 「テスト実行順序に依存してても、CI では必ず同じ順序で流れるから大丈夫」 | CI のテストランナーは並列実行・順序変更の可能性がある。独立性違反は即 ERROR |
| 10 | 「設計書のテスト観点が 10 個あるが、大事な 8 個だけカバーすれば OK」 | カバー率 100% 未満は FAIL。全ケース必須 |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| 「外部 API を呼ぶからモックは必要不可欠だ」 | 外部 API 呼び出しは**インフラ層の責務**。ダミー実装を DI 注入する設計にすべき。モックではなく設計を直す |
| 「pytest の方が便利だから pytest で書きたい」 | プロジェクトのテストフレームワークに従う。Python 既定では unittest で統一。フレームワーク変更は設計事項 |
| 「`unittest.mock` は標準ライブラリだから使ってよいはず」 | 標準ライブラリかどうかは禁止判断の基準ではない。**モック禁止**ルールは独立ルール |
| 「境界値テストは網羅性重視より可読性を優先したい」 | 境界値テストは重要度が高い。可読性はテスト命名と `subTest` で担保する |
| 「1 メソッドが複数観点をカバーしているから効率的」 | 許容はされるが**推奨ではない**。将来の改修時に観点の対応関係が分からなくなる |
| 「設計同期スキルを呼ぶのは面倒だから、ユーザー承認ルートで済ませたい」 | まず設計見直し（選択肢 A）を試みること。ユーザー承認は最終手段 |
| 「テストが遅いから `setUp` を `setUpClass` にまとめた」 | クラス単位の setUp は共有状態を生みやすい。独立性違反に注意。必要ならテストヘルパー関数で代用 |
| 「ダミー実装を src/ に置くと本番コードが肥大化する」 | ダミー実装は**本番コードとしての価値**がある（dry run 機能、開発モード等）。設計書に明示して正規配置する |

## Integration

**Called by:**
- `agents/design-review-agent.md`（mode: test） — REQUIRED SUB-SKILL 形式で本スキルを参照し、review_mode = "coverage" で呼び出す
- `agents/code-review-agent.md`（mode: test） — REQUIRED SUB-SKILL 形式で本スキルを参照し、review_mode = "policy" で呼び出す
- `multi-stage-code-review (aide-powers skill)` の Stage 2 から、上記 2 エージェントを並行起動することで間接的に呼び出される

**Calls:**
- `design-sync (aide-powers skill)` — モック使用検出時の「選択肢 A: 設計の見直し」で起動する。依存関係の分離、ダミー実装の追加等を設計書に反映する

**Related skills:**
- `multi-stage-code-review (aide-powers skill)` — test-review の上位パイプライン制御スキル。Stage 2（テストレビュー）で本スキルを呼び出す
- `design-gate (aide-powers skill)` — 設計書の存在確認（test-review の前提条件。設計書がなければテスト観点も抽出できない）
- `pending-issues-management (aide-powers skill)` — test-review で対応しきれない根本的な問題（設計同期でも解決しない）の記録
