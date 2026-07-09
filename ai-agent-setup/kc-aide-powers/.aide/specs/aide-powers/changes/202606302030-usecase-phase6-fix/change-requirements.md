# 変更要求定義

## 変更概要
- **変更の目的・背景**: ユースケース分析フェーズ（fs-design-phase6-usecase）において、(1) サブエージェントが返す出力フォーマットとFS側（SKILL.md）がその出力を受け取って処理する箇所の連携に不整合がある、(2) Step 5（ユースケース実現プロセス分析）でプログラムだけでは物理的に実現不可能なユースケースに対する対応方針が未定義である。これらを修正し、フェーズ6の実行信頼性を向上させる。
- **変更種別**: 変更

## 要求事項

### REQ-C-001: サブエージェント出力フォーマットの標準化（usecase-lister-prompt.md）
- **種別**: 変更
- **説明**: usecase-lister-prompt.md にステータス報告フォーマット（Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / FAIL）を定義する。現状、SKILL.md の Step2 状態判定がこれらのステータスを前提としているが、プロンプト側に対応する報告フォーマットセクションが存在しない。
- **受入基準**:
  - AC-001: usecase-lister-prompt.md に「## 報告フォーマット」セクションが存在し、Status として DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / FAIL のいずれかを返却する形式が定義されている
  - AC-002: SKILL.md の Step2 状態判定で参照する各ステータスに対応する条件が、usecase-lister-prompt.md 内で「どのような場合にどのステータスを返すか」として明文化されている（FAIL は作成失敗等の回復不能エラー時に返す）
  - AC-003: SKILL.md の Step2 状態判定に FAIL 分岐が追加されている（FAIL 時はユーザーに報告し対応方針を確認する）
  - AC-004: SKILL.md の Step2 完了条件から「UCリストのユーザー合意結果(Step2)が『合意』」が削除されている（ユーザー承認は Step4 で実施するため Step2 では不要）
- **優先度**: 必須

### REQ-C-002: サブエージェント出力フォーマットの標準化（usecase-process-analyzer-prompt.md）
- **種別**: 変更
- **説明**: usecase-process-analyzer-prompt.md にステータス報告フォーマット（Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / FAIL）を定義する。現状、SKILL.md の Step5 状態判定がこれらのステータスを前提としているが、プロンプト側に対応する報告フォーマットセクションが存在しない。
- **受入基準**:
  - AC-001: usecase-process-analyzer-prompt.md に「## 報告フォーマット」セクションが存在し、Status として DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / FAIL のいずれかを返却する形式が定義されている
  - AC-002: SKILL.md の Step5 状態判定で参照する各ステータスに対応する条件が、usecase-process-analyzer-prompt.md 内で「どのような場合にどのステータスを返すか」として明文化されている（FAIL は作成失敗等の回復不能エラー時に返す）
  - AC-003: SKILL.md の Step5 状態判定に FAIL 分岐が追加されている（FAIL 時はユーザーに報告し対応方針を確認する）
- **優先度**: 必須

### REQ-C-003: UC網羅性レビュー出力とFS受け取りの連携明確化（usecase-coverage-reviewer-prompt.md ↔ SKILL.md Step3）
- **種別**: 変更
- **説明**: usecase-coverage-reviewer-prompt.md の出力フォーマット「### 判定」セクションの記載とSKILL.md Step3 の「網羅性レビュー結果(Step3):」への格納の対応関係を明確にする。現状、サブエージェントの出力構造（Markdownヘッダ階層内の「結果:」行）とFS側が期待する値（「全操作カバー済み / 未カバー操作あり（N件）」）は概ね一致しているが、FS側で「サブエージェント出力のどの部分をどの項目に転記するか」が明示されていない。
- **受入基準**:
  - AC-001: SKILL.md の Step3 において、サブエージェント出力から「網羅性レビュー結果(Step3):」「未カバー操作一覧(Step3):」に転記する際の参照箇所（出力フォーマットのどのフィールドか）が記載されている
  - AC-002: usecase-coverage-reviewer-prompt.md の出力フォーマットの「### 判定」セクションの値が、SKILL.md Step3 の状態判定条件（「全操作カバー済み」/ 「未カバー操作あり」）と文字列レベルで一致している
- **優先度**: 必須

### REQ-C-004: プログラムで実現不可能なユースケースの検出と削除フロー
- **種別**: 変更
- **説明**: Step 5（ユースケース実現プロセス分析）において、プログラムだけでは物理的に実現できないユースケース（例: 物理的操作が必要、人間の介在が必須、外部ハードウェア操作、法的手続き等）が検出された場合に、ユーザーに報告し承認を得たうえでUCリストから削除するフローを定義する。現状、usecase-process-analyzer-prompt.md にはこのような場合の扱いが未定義であり、実現不可能なUCがリストに残り続ける。
- **受入基準**:
  - AC-001: usecase-process-analyzer-prompt.md に「プログラム単体では実現不可能なユースケースの判定基準」が定義されている（例: 物理的操作、人間の介在必須、外部ハードウェア制御、法的手続き等のカテゴリ）
  - AC-002: usecase-process-analyzer-prompt.md において、プログラム実現不可と判定したUCについて DONE_WITH_CONCERNS ステータスで報告し、該当UCの一覧と不可能な理由を出力に含める形式が定義されている
  - AC-003: SKILL.md の Step5 状態判定において、プログラム実現不可UCが DONE_WITH_CONCERNS で報告された場合に、ユーザーへ該当UC一覧と理由を提示し、削除の承認を得るフローが定義されている
  - AC-004: ユーザー承認後に該当UCを削除するためのプロンプトテンプレート（例: usecase-removal-prompt.md）が本スキルディレクトリに用意されており、SKILL.md の Step5 状態判定においてサブエージェントを起動して usecase-list.md からの該当UC削除および対応する usecase-{uc名}.md の削除を実行させる手順が定義されている
- **優先度**: 必須

## 対象外（スコープ外）
- usecase-usability-evaluator-prompt.md の出力フォーマット修正（Step6のユーザビリティ評価については現時点で連携不整合の報告がないため）
- usecase-improver-prompt.md の出力フォーマット修正（同上）
- usecase-improvement-fix-prompt.md の修正（同上）
- 他のフェーズスキル（fs-design-phase5-gui, fs-design-phase7-ddd 等）への変更
- 影響範囲の分析（別工程で実施）
- 具体的なコード変更設計（before→after形式の設計は別工程）

## 前提条件
- 変更対象ファイルは `skills/fs-design-phase6-usecase/` ディレクトリ配下に存在する
- サブエージェントのステータス報告フォーマットの標準形式は aide-powers フレームワーク全体で `Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED` の4種を使用する慣例が確立している（他のサブエージェントプロンプトで使用実績あり）
- SKILL.md の Step構成（Step1〜Step9, Step Fix, 前処理, 後処理）自体は変更しないが、Step5 内にサブフロー（ユーザー報告→承認→UC削除）を追加することは許容する

## 関連する既存要件
- **UR-001**: 7つのワークフロー（設計WF）を提供すること — 設計WFフェーズ6の品質向上に直結
- **UR-004**: 12種のサブエージェントによる専門分業を実現すること — サブエージェントとオーケストレータ間の連携品質向上
- **UR-012**: エラーハンドリング体系（BLOCKED/NEEDS_CONTEXT等）を提供すること — サブエージェントからのステータス報告の標準化
