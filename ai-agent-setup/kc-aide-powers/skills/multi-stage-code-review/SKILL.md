---
name: multi-stage-code-review
description: "Use when implementation code or test code has been written and needs review before proceeding to the next task"
---

# Multi-Stage Code Review

## Overview

実装したら、設計準拠レビューと品質レビューの両方を通せ。片方だけでは不十分。レビュアーは実装者の報告を信用するな。設計書とコードを自分の目で照合しろ。

**Core principle:** 設計準拠レビュー（外を見る）と品質レビュー（中を見る）の2段階レビューを必ず通し、レビュアーは実装者の報告ではなく設計書とコードの直接照合で判定する。

## The Iron Law

```
NO CODE ACCEPTED WITHOUT BOTH DESIGN COMPLIANCE AND QUALITY REVIEW PASSING
```

設計準拠レビューと品質レビューの両方がPASSしない限り、コードを受け入れてはならない。

**例外: 非プログラム成果物の場合**
非プログラム成果物（設定ファイル、ドキュメント、データ定義等、実行されるロジックを含まないファイル）に対しては、設計準拠レビューのPASSのみで受け入れ可能とする。品質レビュー・テストレビュー・テスト実行はスキップする。判定基準と判定方法は `fs-impl-phase4-execution` (aide-powers skill) の「成果物種別の判定」セクションに従う。

**Exceptions:**
- プロトタイプ・スパイク（探索的な実装で、本番コードに含めない場合）— ユーザーに確認すること

## Stage 0: 依頼内容チェック（受領時・必須）

> **AI が省略しがちな失敗パターン**: 呼び出し元（ワークフロー）が「複数タスクをまとめて1呼び出しに束ねる」「『これらを並列でやって』と複数指示を1呼び出しに含める」「対象ファイルを複数指定する」— これらを受け入れてはならない。

multi-stage-code-review は、呼び出し元から渡されたペイロードを最初に検証する。違反があれば BLOCKED で即時返却する。

### 0a. ペイロード検証チェックリスト

| # | チェック項目 | 違反時の対応 |
|---|---|---|
| 1 | task_id が単一のサブタスクIDになっているか（カンマ区切りや「複数」「全部」等の表現がないか） | BLOCKED: 「複数タスクの統合は禁止です。1呼び出し = 1サブタスクで再実行してください」 |
| 2 | target_file が単一ファイルパスになっているか | BLOCKED: 「対象ファイルが複数指定されています。1呼び出し = 1ファイルで再実行してください」 |
| 3 | task_title に「並列で」「順番に」「これらを」のような複数指示の表現が含まれていないか | BLOCKED: 「複数指示を1呼び出しに含めることは禁止です。各サブタスクごとに別呼び出しで起動してください」 |
| 4 | design_refs が該当サブタスクの設計参照に絞られているか（設計書全体ではなくセクション指定か） | NEEDS_CONTEXT: 「設計参照セクションを絞り込んでください」 |
| 5 | dev_environment（dev-environment.md のパス）が指定されているか | NEEDS_CONTEXT: 「開発環境情報が不足しています」 |

### 0b. 柔軟ルール例外の判定

ペイロードに「parent_task_id」と「target_public_methods」（複数 publicMethod 一覧）が明示されている場合、柔軟ルール例外として束ね受領を許容する。ただし以下の全てを満たすこと:

- 同一クラスかつ同一ファイル内の publicMethod のみ
- 各 publicMethod が極小（10行以下）かつ独立性が極めて低い（値オブジェクトの getter / コンストラクタヘルパー等）
- target_public_methods に含まれる各 publicMethod について、設計参照セクション・テスト観点が個別に指定されている

これらを満たさない場合は BLOCKED で返却する。

### 0c. なぜこのチェックが必要か

呼び出し元が複数タスクを束ねて呼び出すと:
- AI のコンテキストが肥大化し、各サブタスクの精度が低下する
- 並列実行できないため、結局逐次処理になり遅くなる
- 1サブタスク失敗時の切り戻し範囲が大きくなる
- レビュアー（design-review-agent / code-review-agent）が複数の異なる対象を一度に検証することになり、見落としリスクが上がる

multi-stage-code-review がパイプライン開始前にチェックすることで、上流のミスを早期に検出し、品質と速度の両方を確保する。

## Multi-Stage Code Review Pipeline

### Stage 1: Implementation Review（実装コードレビュー）

実装コードが書かれたら、以下の2つのレビューを実行する。
2つのレビューは独立しているため、並行して実行してよい。

#### 1a. Design Compliance Review（設計準拠レビュー）— 「外を見る」

設計準拠レビュアーサブエージェントに委譲する。
エージェント: `agents/design-review-agent`（aide-powers agent）
プロンプトテンプレート: `spec-reviewer-prompt.md`（レビュー対象・コンテキストを渡す）

レビュー観点（詳細はプロンプトテンプレートに定義）:
- 設計書と実装コードの整合性
- アーキテクチャルールの遵守
- 過去不具合修正の保持（変更・バグ修正・リファクタリング時）

**判定**: 差分0件 → PASS、1件以上 → FAIL

#### 1b. Quality Review（品質レビュー）— 「中を見る」

品質レビュアーサブエージェントに委譲する。
エージェント: `agents/code-review-agent`（aide-powers agent）
プロンプトテンプレート: `code-quality-reviewer-prompt.md`（レビュー対象・コンテキストを渡す）

レビュー観点（詳細はプロンプトテンプレートに定義）:
- コード品質（コーディング規約、SOLID原則、ダミー実装検出等）
- エラーハンドリング

**判定**: ERROR 0件 → PASS、1件以上 → FAIL

#### Review Result Handling（レビュー結果の処理）

レビュー結果を受け取ったら、以下の順にチェックする:

1. **FAIL（明らかな実装誤り）があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
   修正は `agents/micro-impl-agent`（aide-powers agent）に委譲する。
   プロンプトテンプレート: `implementer-prompt.md`（レビュー指摘内容をそのまま転記して渡す）
2. **FAIL_PENDING（種別未確定の差分）があるか？** → YES: 工程チェック表に記録し保留。実装完了 or 依存ブロック後にユーザーと種別確定する
3. **WARNING があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
   ERROR と同様、全指摘を修正 + 再レビュー必須。
   例外: 修正困難（外部ライブラリの制約、プラットフォーム固有の制限等、実装者の努力では解決できないもの）かつ WARNING レベルの場合のみ、ユーザーに理由を提示し承認を得てスキップ可能。
   「軽微だから記録して次へ」は禁止。誤記であっても修正する。
4. **全チェック通過** → Stage 2 へ

**重要**: 設計漏れ（FAIL_PENDING→種別確定後）検出時の設計書更新をスキップしてはならない。設計書と実装の同期は即座に実行する。

### Stage 2: Test Review（テストコードレビュー）

Stage 1 が全PASSした後、テストコードが書かれたら、以下の2つのレビューを実行する。

#### 2a. Test Coverage Review（テスト網羅性レビュー）— 「外を見る」

設計準拠レビュアーサブエージェントに委譲する（テストモード）。
エージェント: `agents/design-review-agent`（aide-powers agent、テストモード）

レビュー観点（詳細はプロンプトテンプレートに定義）:
- 設計書のテスト観点の網羅性
- 境界値テスト・異常系テストの存在

**判定**: カバー率100% → PASS、100%未満 → FAIL

#### 2b. Test Quality Review（テスト品質レビュー）— 「中を見る」

品質レビュアーサブエージェントに委譲する（テストモード）。
エージェント: `agents/code-review-agent`（aide-powers agent、テストモード）

レビュー観点（詳細はプロンプトテンプレートに定義）:
- テスト命名規則、独立性、テスト方針準拠

**判定**: 違反0件 → PASS、1件以上 → FAIL

#### Test Review Result Handling

Stage 1 と同じ判断フローを適用する。全PASSしたら Stage 3 へ。

### Stage 3: Test Execution（テスト実行）

Stage 2 が全PASSした後、テストを実行する。

- ユニットテストを実行し、全パスを確認する
- テスト失敗があれば修正 → 該当レビューを再実行 → テスト再実行
- 既存テスト全実行（リグレッションテスト）は本ステージでは実施しない。動作確認Step（各フェーズスキルの regression-test-prompt.md 経由）で1回実施する設計に統一されている

### 「Do Not Trust the Report」原則

レビュアーは実装者の報告を信用しない。設計書とコードを自分の目で照合する。

- 実装者の「完了報告」はレビュー開始のトリガーに過ぎず、品質の証拠にはならない
- 「テストが通っているから修正は保持されている」という判断を禁止する
- ダミー実装・先送りマーカー（「暫定対応」「後で差し替え」等）を検出してFAILとする

**注記**: この原則はプロンプトテンプレート（`spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`）にも記載すること。

### Non-Program Artifact Pipeline（非プログラム成果物パイプライン）

呼び出し元（fs-impl-phase4-execution (aide-powers skill) 等）が成果物を「非プログラム成果物」と判定した場合、以下の簡略パイプラインを適用する:

**実行するステージ:**
- Stage 1a: Design Compliance Review（設計準拠レビュー）のみ

**スキップするステージ:**
- Stage 1b: Quality Review（品質レビュー）— 非プログラム成果物にはコード品質観点が適用不可
- Stage 2: Test Review（テストレビュー）— 非プログラム成果物はテスト対象外
- Stage 3: Test Execution（テスト実行）— 非プログラム成果物はテスト対象外

**Review Result Handling:**
- Stage 1a の結果のみで判断する
- PASS → Pipeline Complete
- FAIL → 実装者に修正を指示 → 修正後、Stage 1a を再実行

**判定の責任:**
- 非プログラム成果物の判定は呼び出し元（fs-impl-phase4-execution (aide-powers skill) 等）が行う
- multi-stage-code-review は呼び出し元の判定に従い、簡略パイプラインを適用する
- 判定に疑義がある場合は呼び出し元に差し戻す（NEEDS_CONTEXT で報告）

### Pipeline Complete

全ステージPASS → 次のタスクへ進む

### Subagents and Prompt Templates

| 役割 | エージェント | プロンプトテンプレート |
|---|---|---|
| 設計準拠レビュアー | `agents/design-review-agent`（aide-powers agent） | `spec-reviewer-prompt.md` |
| 品質レビュアー | `agents/code-review-agent`（aide-powers agent） | `code-quality-reviewer-prompt.md` |
| 実装者（修正時） | `agents/micro-impl-agent`（aide-powers agent） | `implementer-prompt.md` |

名前付きエージェントは `agents/` 配下に定義されており、複数ワークフローから共通利用される。
プロンプトテンプレートは各フェーズスキルのディレクトリ直下に配置され、レビュー対象・コンテキスト等のパラメータを渡す。

## Red Flags - STOP

| Red Flag | 対処 |
|---|---|
| 「レビューは省略して次に進もう」と考えた | STOP。レビュー省略は品質崩壊の始まり。必ず両方のレビューを通す |
| 「テストが通っているから修正は保持されている」と判断した | STOP。テストはプログラム変更と同時に変更される。設計書とコードの目視確認で判断する |
| 「設計漏れだが軽微だから設計書更新は後回しでいい」と判断した | STOP。設計漏れ確定後の設計書更新は即座に実行する。後回しは乖離の蓄積を招く |
| 「修正がシンプルだから再レビューは不要」と考えた | STOP。修正の妥当性はレビュアーが判断する。必ず再レビューを実行する |
| 「品質レビューだけ通せば十分」と考えた | STOP。設計準拠レビューと品質レビューは独立した観点。両方必須 |
| 「実装者が『完了』と報告したから大丈夫」と信じた | STOP。レビュアーは実装者の報告を信用しない。自分の目で設計書とコードを照合する |
| 「ダミー実装だが後で差し替える」と許容した | STOP。ダミー実装は即FAIL。「後で」は来ない |
| 「コンテキストが大きいからレビューを省略する」と考えた | STOP。コンテキスト管理はレビュー省略の理由にならない |
| 呼び出し元から複数サブタスク統合の依頼を受けて受け入れた | STOP。Stage 0 のペイロード検証を必ず実行し、違反があれば BLOCKED で返却する |
| 「呼び出し元のフェーズスキルを信用して受け入れる」と考えた | STOP。Stage 0 の検証は受領側の責務。フェーズスキルが間違って束ねている可能性を常に想定する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「修正が1行だけだからレビューは不要」 | 1行の修正でもバグは入る。レビューの手間は小さいが、見逃しのリスクは大きい |
| 「テストが全部通っているから品質は問題ない」 | テストはプログラム変更と同時に変更される。テスト通過は品質の証拠にならない |
| 「設計準拠レビューは通ったから品質レビューは形式的」 | 設計準拠は「外を見る」、品質は「中を見る」。観点が異なるため、片方のPASSは他方を保証しない |
| 「設計漏れを検出したが設計書更新は後でいい」 | 設計書と実装の乖離は即座に同期する。「後で」は忘却と品質劣化の始まり |
| 「リファクタリングだから設計準拠レビューは不要」 | リファクタリングでも外部振る舞いの保持を設計書と照合して確認する必要がある |
| 「プロトタイプだからレビューは省略」 | プロトタイプが本番コードに含まれるなら、レビューは必須。含まれないなら、このスキルの適用外 |
| 「時間がないからレビューを1回で済ませたい」 | 品質ゲートは時間的制約で省略できない。レビュー省略で生まれた技術的負債は、後でより多くの時間を消費する |

## Integration

**Required workflow skills:**
- design-sync (aide-powers skill)（設計漏れ（FAIL_PENDING→種別確定後）、設計書の同期更新に使用）

**Called by:**
- 実装ワークフローの実装フェーズ
- 変更ワークフローの差分実装フェーズ
- バグ修正ワークフローの実装フェーズ
- リファクタリングワークフローの実装フェーズ

**Calls:**
- design-sync (aide-powers skill)（設計漏れ（FAIL_PENDING→種別確定後）の設計書同期）

**Required agents（agents/ 配下の aide-powers agent）:**
- `agents/design-review-agent` (aide-powers agent) — 設計準拠レビュー + テスト網羅性レビューを担当。「外を見る」視点
- `agents/code-review-agent` (aide-powers agent) — 品質レビュー + テスト方針レビューを担当。「中を見る」視点
- `agents/micro-impl-agent` (aide-powers agent) — レビュー指摘に基づく修正を担当。実装専任
