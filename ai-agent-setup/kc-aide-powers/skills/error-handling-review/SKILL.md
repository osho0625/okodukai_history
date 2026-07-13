---
name: error-handling-review
description: "Use when reviewing implementation code for error handling quality — exception hierarchy, cross-layer exception translation, wrapping correctness, try/except scope, bare except, error suppression, logging duplication, and error message quality. Called by code-review-agent in implementation mode."
---

# エラーハンドリングレビュー

## Overview

**Core principle:** 例外は正しい層で、正しい形でラップし、正しい場所で1回だけログに残せ。もみ消すな、広すぎるキャッチをするな、ログと raise を重ねて計上するな。

error-handling-review は、実装コードの**エラーハンドリング品質**を検証するためのレビュー観点ルール集である。例外階層の設計、レイヤー間の例外変換ルール、例外ラップの正確性、try/except のスコープ最小化、bare except 禁止、エラーもみ消し防止、ログ出力の適切性（二重計上防止を含む）、エラーメッセージの品質を網羅的に定義する。

## The Iron Law

```
NO SILENT FAILURES. NO BARE EXCEPT. NO DOUBLE LOGGING.
設計書に記載がない例外を握りつぶしてはならない。
bare except（全例外キャッチ）は原則禁止。
ログ出力と例外送出を同一経路で二重に計上してはならない。
```

このルールの例外は後述の「注意事項（許容される例外）」セクションに明示されたケース（設計書で「無視して継続」と明記されている等）のみ。

## Inputs

**Never:**
- テストコードのレビュー時（`test-review (aide-powers skill)` が担当）
- 設計準拠レビュー時（design-review-agent (aide-powers agent) が担当）
- import ルールのレビュー時（`import-review (aide-powers skill)` が担当）
- 実装時（コード生成側）— 実装エージェントが従うべきコーディング規約は `impl-coding-standards (aide-powers skill)` に定義される

レビュー実行時に必要な情報:
- レビュー対象の実装ファイルパス
- 設計書（オブジェクト設計書）— メソッドの `Raises` セクションを含む
- レイヤードアーキテクチャ定義書 — レイヤー間の例外変換ルールの照合用
- （任意）エラーハンドリング方針を記載したドキュメント

## 例外階層の設計（検証の前提知識）

レビュー対象プロジェクトでは、以下のような例外階層を採用していることを前提とする。具体名はプロジェクトごとに異なってよいが、**層ごとの基底例外 + サブクラス** の構造を持つ点は共通する。

```
Exception（言語組み込みの例外基底）
├── DomainError                    # ドメイン層基底（ビジネスルール違反）
│   ├── InvalidParamError          # バリデーション違反
│   ├── UnsupportedLogicError      # 非対応ロジック
│   ├── ChunkSplitError            # チャンク分割エラー
│   └── ChunkMergeError            # チャンクマージエラー
├── ApplicationError               # アプリケーション層基底（ユースケース実行失敗）
│   ├── InferenceExecutionError    # 推論実行エラー
│   ├── CancellationError          # キャンセル
│   ├── ExportError                # エクスポートエラー
│   └── DownloadError              # ダウンロードエラー
├── InfrastructureError            # インフラ層基底（外部I/O失敗）
│   ├── RecognitionError           # 推論エンジンエラー
│   ├── VadError                   # VADエラー
│   ├── EvaluationError            # 評価エラー
│   ├── MonitoringError            # リソース計測エラー
│   ├── RepositoryError            # 永続化エラー
│   └── ModelDownloadError         # モデルDLエラー
└── PresentationError              # プレゼンテーション層基底
    └── ValidationError            # UI入力バリデーション
```

- 上記はあくまで**例**であり、プロジェクトの設計書に定義された階層を正とする
- レビュー時は、設計書（`object-design-*.md` 等）と `layered-architecture.md` の例外階層定義を必ず照合元として Read で読み込むこと
- 他言語（Java, C#, TypeScript 等）でも「層ごとの基底例外 + サブクラス」の構造は同一のレビュー観点で評価できる

## 検証項目

### 1. レイヤー間の例外変換ルール

レイヤー間で例外を伝播する際の変換ルールを、以下の4パターンで検証する。

| 発生元 | 伝播先 | 変換ルール |
|---|---|---|
| インフラ層 → アプリケーション層 | `InfrastructureError` のサブクラス → `ApplicationError` のサブクラスにラップ | 元の例外を `cause` 属性に保持する |
| ドメイン層 → アプリケーション層 | `DomainError` はそのまま伝播（ラップ不要） | ドメイン例外はビジネスルール違反のため変換しない |
| アプリケーション層 → プレゼンテーション層 | `ApplicationError` / `DomainError` をキャッチしてUI表示 | エラー通知機構（`messagebox.showerror()` 等）で表示 |
| プレゼンテーション層内 | `ValidationError` → `messagebox.showwarning()` 等 | UI入力の形式エラー |

**言語別読み替え**:
- Python: `raise ApplicationError(msg) from original`
- Java/C#: `throw new ApplicationException(msg, original);`
- TypeScript: `throw new ApplicationError(msg, { cause: original });`

**判定**: 上記ルールに違反する例外伝播が1件以上あれば ERROR。

### 2. 例外ラップの正確性

アプリケーション層（またはそれに相当する上位層）のユースケース内で、以下を検証する。

- インフラ層の例外（例: `RecognitionError`）が適切なアプリケーション層例外（例: `InferenceExecutionError(message, cause=original)`）にラップされているか
- インフラ層の例外（例: `VadError`）が適切なアプリケーション層例外にラップされているか
- リポジトリ層の例外（例: `RepositoryError`）が適切な `ApplicationError` サブクラスにラップされているか
- ラップ時に **`cause` 属性**（または言語相当の「原因例外」保持機構）に元の例外が正しく設定されているか

**言語別読み替え**:
- Python: `raise NewError(msg) from original_exc`
- Java: `throw new NewException(msg, original)`
- C#: `throw new NewException(msg, original)`（`innerException` パラメータ）
- TypeScript（ES2022+）: `throw new NewError(msg, { cause: original })`

**判定**: ラップ欠落・`cause` 未設定が1件以上あれば ERROR。

### 3. Raises 仕様チェック

設計書（`object-design-*.md` 等）の各メソッドに定義された `Raises` セクションについて、以下を検証する。

- **記載された例外クラスが正しく送出されているか**（送出漏れ）
- **送出条件が設計書と一致するか**（バリデーションロジック等）
- **記載されていない例外が送出されていないか**（予期しない例外の漏れ）

記載外例外の検出は、実装コードの `raise` 文を走査し、設計書の `Raises` リストと突き合わせることで行う。

**判定**:
- 送出漏れ: ERROR
- 送出条件不一致: ERROR
- 記載外例外の送出: ERROR（設計書に追記するか、実装を修正する必要がある）

### 4. try/except の適切性

#### 4.1 ★最重要★ エラーのもみ消し防止

設計書で明示的に処理方法が定義されている例外（正常系・準正常系として設計されたケース）**以外** は、以下の3ステップルールに従うこと。

**3ステップルール:**

1. **デバッグ可能な情報をログ出力する**:
   - 何が起きたか
   - 例外クラス名
   - 例外メッセージ
   - 発生箇所（モジュール・メソッド名）
   - 関連パラメータ（機密情報は除く）
2. **エラー通知処理（UI表示、コールバック等）が存在する場合は、そこへ流す**
3. **エラー通知処理が存在しない場合は、例外をキャッチせずそのまま送出させる**（アプリをエラーで落とす）

**禁止事項**:
- 設計書に記載がない例外を `except: pass` で握りつぶすこと
- 設計書に記載がない例外を `except Exception: logger.error(...)` だけで握りつぶし、上位に伝播させないこと
- 意図しない例外を表面化させないまま正常系にフォールスルーさせること

**運用原則**: 意図しない例外は必ず表面化させ、ユーザーと対処方法を合意してから正式なハンドリングを実装すること。

**判定**: 違反1件以上で ERROR。

#### 4.2 例外チェイン（`raise X from Y`）

- 例外を変換する際は `raise NewError(...) from original` を使い、**オリジナルの traceback（スタックトレース）を保持する**こと
- `raise X from None` で意図的にチェインを切る場合は、**元の例外が持つ情報（属性名、エラーメッセージ等）を新しい例外に引き継ぐ**こと
  - 例: `KeyError` → `AttributeError` 変換時、KeyError が保持している属性名を新しい例外のメッセージに含める
- `from` なしの `raise NewError(...)` で**暗黙的にチェインが切れていないか**を確認する

**言語別読み替え**:
- Java: `throw new NewException(msg, original)` でチェイン保持
- C#: `throw new NewException(msg, original)` でチェイン保持
- TypeScript（ES2022+）: `throw new NewError(msg, { cause: original })` でチェイン保持

**判定**: `from` 欠落・情報欠落が1件以上あれば ERROR。

#### 4.3 bare except の禁止と例外指定

- **bare except**（Python: `except:`、空のキャッチ節）は `except BaseException:` と同義であり、`SystemExit` や `KeyboardInterrupt` もキャッチしてしまうため **原則禁止**
- bare except を**許容する条件は以下の2ケースのみ**:
  1. ハンドラ内で traceback をログ出力またはユーザーに表示する場合（診断情報の取り出し）
  2. リソースの後始末をした後に `raise` で再送出する場合（ただし `try...finally` の方が望ましい）
- シグナル系を含む「ほぼすべての例外」をキャッチしたい場合は `except Exception:` を使う（`BaseException` ではなく）
- OS関連エラーは `errno` の値ではなく、**言語・ランタイム固有のOS例外階層**を明示的に使う
  - Python 3.3+: `FileNotFoundError`, `PermissionError`, `IsADirectoryError` 等
  - Java: `FileNotFoundException`, `AccessDeniedException` 等
  - C#: `FileNotFoundException`, `UnauthorizedAccessException` 等

**判定**: bare except が許容2ケース以外で使われていれば ERROR。`except BaseException:` の使用（許容ケース以外）も ERROR。

#### 4.4 try ブロックのスコープ最小化

- try で囲む範囲は**必要最小限のコード**に限ること（バグのもみ消し防止）
- 悪い例: try ブロック内に対象外の処理を含め、意図しない例外までキャッチしてしまう

**Good（スコープ最小）**:

```python
try:
    value = collection[key]
except KeyError:
    return key_not_found(key)
else:
    return handle_value(value)
```

**Bad（スコープ過剰）**:

```python
try:
    return handle_value(collection[key])
except KeyError:
    # handle_value() が発生させる KeyError もキャッチしてしまう
    return key_not_found(key)
```

- 他言語でも論理は同一: `try` 節には「例外が発生しうる単一操作のみ」を入れ、後続処理は `else` や try 外に出す

**判定**: try の範囲が過剰で意図しない例外まで捕捉する構造が1件以上あれば ERROR。

#### 4.5 リソース管理

- リソース（ファイル、ソケット、ロック、DB接続等）が**特定のスコープでのみ使われる**場合は `with` 文を使う（Python）
  - Java/C#: `try-with-resources` / `using` ステートメント
  - TypeScript: `using` 宣言（TC39 Stage 3 / TypeScript 5.2+）
- `with` / `using` が使えない言語・ケースでは `try...finally` で後始末する

**判定**: リソースの解放漏れ・`with` / `try...finally` 未使用が1件以上あれば ERROR。

#### 4.6 その他の基本チェック項目

- **過度に広い例外キャッチ**（`except Exception:`）が**不適切に**使用されていないか（§4.1 のルールに従わず、単なる握りつぶしになっていないか）
- **例外を握りつぶしていないか**（`except: pass`、`except Exception: pass`）
- キャッチした例外が設計書の Raises セクションに定義されたものか（**未定義の例外をキャッチしていないか**）
- インフラ層のサンプリングループ等、**設計書で明示的に「無視して継続」と記載されている箇所は許容**する（§注意事項 参照）

**判定**: 違反1件以上で ERROR。設計書で明示的に許容されているケースは判定対象外。

### 5. ログ出力

- 例外キャッチ時に**適切なログ出力**があるか
- **ログレベル**が適切か:
  - `WARNING`: 回復可能なエラー（壊れたJSONファイルのスキップ等）
  - `ERROR`: 回復不能なエラー（推論失敗等）
- `logger = logging.getLogger(__name__)` で**モジュールレベルのロガー**を使用しているか（他言語でも「モジュール/クラス単位のロガー取得」が推奨）

#### 5.1 ログと例外の二重計上防止（重要）

同一の例外について、下位層で `logger.error()` して上位層にも `raise` すると、ログが二重に出力されてノイズになる。以下の使い分けを検証すること。

| パターン | ログ出力 | 例外送出 | 適用場面 |
|---|---|---|---|
| **ログ+継続** | 出力する（WARNING または ERROR） | 送出しない | 回復可能なエラーで、上位に通知不要な場合 |
| **透過（そのまま上位へ）** | 出力しない | そのまま送出 | 上位層で適切にハンドリングされる場合。中間層でのログは不要 |
| **ラップして上位へ** | 出力しない | 変換して送出（`raise NewError(...) from original`） | 例外を変換して上位に伝播する場合。ログは最終キャッチ地点で出力する |

**原則**: **ログ出力は例外の最終キャッチ地点（プレゼンテーション層 or エラー通知処理）で1回だけ行う**。

**中間層の WARNING ルール**: 中間層（アプリケーション層）で `logger.error()` + `raise` の組み合わせがある場合は **WARNING** とする（ERROR ではない）。設計書・運用次第で許容する余地があるため。

**判定**:
- ログ欠落（最終キャッチ地点でログがない）: WARNING
- ログレベル誤り: WARNING
- モジュールロガー未使用（グローバルロガーや `print()` 使用）: WARNING
- 中間層での二重計上（`logger.error()` + `raise`）: WARNING

### 6. エラーメッセージの品質

- **具体性**: エラーメッセージが具体的か（**何が、なぜ失敗したか**が分かるか）
  - 例（良い）: "モデルファイル 'whisper-v3.bin' の読み込みに失敗しました: ファイルが見つかりません (path=/models/whisper-v3.bin)"
  - 例（悪い）: "エラーが発生しました"
- **分離**: ユーザー向けメッセージとデバッグ向けメッセージが適切に分離されているか
  - ユーザー向け: 対処可能な表現（「再試行してください」「管理者に連絡してください」）
  - デバッグ向け: スタックトレース、内部状態、パラメータ値等
- **機密情報の除外**: 機密情報（パスワード、APIキー、個人情報等）がエラーメッセージに含まれていないか

**判定**: 違反1件以上で WARNING（設計書や運用ルールに照らして判断する）。機密情報の露出は ERROR。

## Process

**Step 1:** 対象レベルの設計書から全メソッドの Raises セクションを抽出する
- `object-design-*.md` 等を Read で読み、クラス・メソッドごとに「送出される例外」「送出条件」を列挙

**Step 2:** 対応する実装ファイルの try/except ブロックを解析する
- `raise` 文、`except` 節、例外クラス、`from` 句、ログ出力の有無を抽出

**Step 3:** 例外変換ルールとの照合を行う
- §検証項目 1〜6 の各検証項目を順に評価

**Step 4:** 違反リストを生成する
- §出力フォーマット に従ってテーブル形式で報告

## 出力フォーマット

```markdown
## エラーハンドリング検証結果

### 違反一覧
| ファイル | メソッド | 項目 | 内容 | 重要度 |
|---|---|---|---|---|
| `src/application/usecases/run_inference.py` | `execute` | 例外ラップ欠落 | `RecognitionError` が `InferenceExecutionError` にラップされていない | ERROR |
| `src/infrastructure/repositories/json_result_repository.py` | `list_all` | ログ出力欠落 | 壊れたJSONスキップ時にWARNINGログがない | WARNING |
| `src/infrastructure/monitoring/psutil_monitor.py` | `_sample_loop` | bare except | `except:` が使用されている（`except psutil.Error:` にすべき） | ERROR |

### 例外伝播チェーン
| 発生元 | 経由 | 最終キャッチ | 変換 | 判定 |
|---|---|---|---|---|
| `RecognitionError` (infra) | `RunInferenceUseCase.execute` | `InferenceTab._on_inference_error` | → `InferenceExecutionError` → UI表示 | OK |
| `RepositoryError` (infra) | `CompareResultsUseCase.delete_results` | `ResultsTab._on_delete_error` | → `ApplicationError` → UI表示 | OK |

### サマリ
- 検査メソッド数: {N}
- ERROR数: {E}
- WARNING数: {W}
- 判定: {PASS / FAIL}
```

## 注意事項（許容される例外）

以下は**例外的に許容される**ケース。レビュー時にこれらに該当する場合は、ERROR として挙げない。

- **設計書で明示的に「無視して継続」と記載されている箇所**
  - 例: インフラ層の `_sample_loop` 内の `except psutil.Error: pass`（psutil のサンプリングループ）
  - 前提条件: 設計書に当該メソッドで「エラー発生時は無視して継続する」と明記されていること
- **`CancellationError` はラップ不要**
  - そのままプレゼンテーション層に伝播させる
  - プレゼンテーション層側で `CancellationError` とその他を分岐処理する（例: `_on_inference_error` で分岐）
- **`DomainError` のサブクラスはアプリケーション層でラップ不要**
  - そのまま伝播する（ビジネスルール違反は変換しない、§検証項目1 の「ドメイン層 → アプリケーション層」ルール）
- **プレゼンテーション層のエラーハンドラ**
  - `CancellationError` とその他（`ApplicationError`、`DomainError` 等）を分岐処理することが設計で規定されている

**これらの「許容される例外」は設計書に明記されているべき**であり、実装コードのコメントでも明示することを推奨する。設計書に記載がないまま「無視して継続」の実装がある場合は ERROR（§4.1 エラーのもみ消し防止に該当）。

## 完了条件（判定基準）

- **ERROR が0件** → PASS
- **ERROR が1件以上** → FAIL
- **WARNING のみ** → PASS（改善推奨として報告）

code-review-agent (aide-powers agent) は本スキルの判定結果を、§出力フォーマット に従って呼び出し元（`multi-stage-code-review (aide-powers skill)` 経由で実装ワークフロー等）に返す。

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。エラーハンドリングレビューの基本ルールに違反しようとしている。

| # | Red Flag | なぜ危険か |
|---|---|---|
| 1 | 「設計書に書いてないけど、たぶんこの例外は無視してよいだろう」 | §4.1 最重要ルール違反。設計書に記載がない例外の握りつぶしは禁止。必ず表面化させ、ユーザーと合意する |
| 2 | 「`except Exception: pass` で落ちないようにしておこう」 | エラーのもみ消し。問題の隠蔽であり、後に原因不明の不具合を生む |
| 3 | 「bare except（`except:`）で全部まとめてキャッチしよう」 | `SystemExit` や `KeyboardInterrupt` まで捕捉してしまう。許容2ケース以外は禁止 |
| 4 | 「try の範囲は広めに取っておこう」 | スコープ過剰は意図しない例外のもみ消しを招く。try 節には例外が発生する単一操作のみを入れる |
| 5 | 「`raise NewError()` で新しい例外に変換すれば traceback はいらない」 | `from` なしの変換は暗黙的にチェインを切る。オリジナルのスタックトレースは必ず保持する（`raise X from Y`） |
| 6 | 「念のため下位層でも `logger.error` しておこう」 | ログの二重計上。最終キャッチ地点で1回だけ出力する原則に違反する |
| 7 | 「リソース解放は `try...finally` より手書きで close したほうが柔軟だ」 | 解放漏れの温床。`with` / `using` / `try-with-resources` を優先する |
| 8 | 「インフラ層の例外をそのままプレゼンテーション層まで伝播させよう」 | レイヤー間変換ルール違反。インフラ→アプリケーションでラップし、`cause` 属性に元例外を保持する |
| 9 | 「`errno == 2` で判定すればファイル不在を拾える」 | OS例外階層（`FileNotFoundError` 等）を使わない設計。言語組み込みのOS例外階層を使う |
| 10 | 「エラーメッセージにパスワードやAPIキーを入れておけばデバッグに便利」 | 機密情報の露出。ログ・メッセージには絶対に含めない |

## Common Rationalizations

| Excuse（言い訳） | Reality（反論） |
|---|---|
| 「この例外は起きないはずだから無視してよい」 | 「起きないはず」は設計書に基づく根拠が必要。根拠なき握りつぶしは禁止（§4.1） |
| 「`except Exception:` は汎用的で便利」 | 広すぎるキャッチはバグのもみ消しを招く。具体的な例外クラスを指定する |
| 「bare except は短くて書きやすい」 | 書きやすさは例外処理の正しさの理由にならない。許容2ケース以外は禁止 |
| 「`from` を書くのは冗長」 | traceback の保持はデバッグに必須。冗長ではなく必要情報 |
| 「ログはあちこちに残しておけば安心」 | 二重計上はノイズ。最終キャッチ地点で1回だけ |
| 「try...finally のほうが柔軟」 | リソース解放には `with` / `using` / `try-with-resources` を優先。`try...finally` は補助手段 |
| 「設計書の Raises が古いから、実装が正だ」 | 設計書と実装の乖離は設計同期（`design-sync (aide-powers skill)`）で解決する。レビュー時は設計書が正 |
| 「エラーメッセージは簡潔なほうがよい」 | ユーザー向けは簡潔でよいが、デバッグ向けは具体的であること。両者の分離が重要 |
| 「テストが通っているから例外処理は問題ない」 | テストで拾えない例外パス（想定外の組み合わせ）がある。静的レビューで確認する |
| 「この箇所はもみ消しでも動くから問題ない」 | 動作と設計の正しさは別。設計書に記載のない例外の握りつぶしは禁止 |

## Integration

**Called by:**
- `agents/code-review-agent`（`mode: implementation` のみ）
  - `multi-stage-code-review (aide-powers skill)` 共通スキル Stage 1 経由で、実装ワークフロー・変更ワークフロー・バグ修正ワークフロー・リファクタリングワークフローの各実装タスクで起動される

**Not called by:**
- `agents/design-review-agent` — 設計準拠・importルール・テスト網羅性が担当範囲
- `agents/micro-impl-agent` — 実装者が従うコーディング規約は `impl-coding-standards (aide-powers skill)` スキルを参照
- `code-review-agent (aide-powers agent)` の `mode: test` — テストコードレビューは `test-review (aide-powers skill)` スキルを参照

**Related skills:**
- `code-quality-review (aide-powers skill)` — 命名・SOLID・ダミー実装検出等、本スキルと同じ code-review-agent (aide-powers agent)（implementation）から参照される姉妹スキル。本スキルとは**観点が独立**（エラーハンドリング vs コード品質全般）
- `test-review (aide-powers skill)` — テストコードのレビュー観点
- `import-review (aide-powers skill)` — importルール（レイヤー間依存方向）のレビュー観点
- `multi-stage-code-review (aide-powers skill)` — 本スキルを間接的に起動するレビューパイプライン制御スキル
- `design-sync (aide-powers skill)` — 設計書の Raises と実装が乖離した場合、設計書側を修正するために起動する
