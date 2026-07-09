---
name: design-gate
description: "Use when starting any workflow that modifies code (implementation, change, refactoring, bugfix). Verify that design documents exist and are complete before proceeding."
---

# 設計書ゲート

## Overview

設計書ゲートは、コードを変更するワークフローの開始時に `doc-index.md`（設計書の一覧と状態を管理するファイル）の存在と完了状態を機械的に確認するハードゲートである。設計書が完了していなければワークフローを停止し、設計書の完成を先に行うよう案内する。

## Process

**Step 1:** `.kiro/specs/{feature_name}/` が存在し `.aide/specs/{feature_name}/` が存在しない場合:
- ユーザーに「`.aide/specs/` にコピーしてよいか」確認する
- 承認後コピーし、元ファイル削除の要否を確認する（選択肢: 1. 削除する 2. 残す）
- 以降 `.aide/specs/{feature_name}/` を使用する

**Step 2:** `doc-index.md` を読む
- 存在しない → FAIL
- 以下4ファイルが `✅ 完了` で記載されていない → FAIL
  - `program-structure.md`
  - `dev-environment.md`
  - `system-requirements.md`
  - `user-requirements.md`

**Step 3:** コア4ファイルの実体チェック（サブエージェント並列実行）
- 以下4ファイルそれぞれに対し、サブエージェントを並列で起動する
- プロンプトは `design-gate/design-doc-review-prompt.md` のテンプレートを使用し、`{file_path}` を置換して渡す
- 対象ファイル:
  - `program-structure.md`
  - `dev-environment.md`
  - `system-requirements.md`
  - `user-requirements.md`
- 各サブエージェントは PASS / FAIL + 理由 を返す
- 全4件 PASS → Step 4へ
- 1つでも FAIL → FAIL: 不十分なファイルと理由を報告し、Step 5へ

**Step 4:** ドキュメントと実装の整合性チェック（サブエージェント実行）
- プロンプトは `design-gate/design-code-consistency-prompt.md` のテンプレートを使用する
- サブエージェントに以下を渡す:
  - `program-structure.md` のパス
  - `user-requirements.md` のパス
  - プロジェクトルートパス
- サブエージェントが実行する内容:
  1. **ファイル構成の整合性**: `program-structure.md` に記載されたフォルダ構成・ファイル一覧と、実際のファイルシステムを比較する
     - 設計書に記載があるが実体がないファイル → 乖離として報告
     - 実体があるが設計書に記載がないファイル → 乖離として報告
     - ディレクトリ構成の不一致 → 乖離として報告
  2. **レイヤー依存方向の整合性**: `program-structure.md` に記載された import ルール（レイヤー間依存方向）と、実際のコードの import 文を抽出して比較する
     - 禁止方向の import が存在する → 違反として報告
  3. **主要クラス・関数の存在確認**: `program-structure.md` に記載された主要クラス・関数名が実際のコードに存在するか確認する
     - 設計書に記載があるが実装に存在しない → 乖離として報告
- 判定基準:
  - **PASS**: 乖離なし
  - **FAIL**: 何らかの乖離あり（軽微・中程度・重大を問わず、ファイル追加・削除・ディレクトリ構成変更・レイヤー依存方向の違反・主要クラスの欠落のいずれか）
- 結果に基づく分岐:
  - PASS → 次フェーズに進む
  - FAIL → 乖離内容を報告し、Step 5へ

**Step 5:** FAIL時:
- 不足・不十分なドキュメント一覧をユーザーに提示する
- `pending-issues.md` に2件登録する（pending-issues-management (aide-powers skill) 準拠）:
  - 「設計逆引きワークフローの実行」（重要度: 高）
  - 「{元のワークフロー名}の設計逆引き完了後に再実行」（重要度: 高）
- ワークフローを終了する

### pending-issues 登録テンプレート

```markdown
### PENDING-{番号}: 設計逆引きワークフローの実行
- 発生日時: {YYYY-MM-DD HH:MM}
- 発見元ワークフロー: {ワークフロー名}
- 発見フェーズ: 設計書ゲート
- 種別: 設計考慮漏れ
- 重要度: 高
- 詳細: 設計書が未完了のため、設計逆引きワークフローを実行して設計書を完成させる必要がある。未完了ドキュメント: {未完了ドキュメント一覧}
- 推奨対応ワークフロー: 設計逆引き
- 対応状況: 未対応

### PENDING-{番号+1}: {元のワークフロー名}の設計逆引き完了後に再実行
- 発生日時: {YYYY-MM-DD HH:MM}
- 発見元ワークフロー: {ワークフロー名}
- 発見フェーズ: 設計書ゲート
- 種別: 設計考慮漏れ
- 重要度: 高
- 詳細: 設計逆引きワークフロー完了後に、{元のワークフロー名}を再度起動する
- 推奨対応ワークフロー: {元のワークフロー名}
- 対応状況: 未対応
```

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。設計書ゲートをスキップしようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「変更がシンプルだから設計書は不要」 | 変更の複雑さに関わらず、設計書は必要。シンプルな変更でも設計書との整合性を保つ必要がある |
| 「軽微なバグだから逆引きをスキップしてよい」 | バグの重大度は設計書の必要性とは無関係。設計書がなければ影響範囲の分析ができない |
| 「設計書は揃っているはず」 | 「はず」ではなく、機械的に確認する。思い込みによるスキップは品質劣化の原因 |
| 「ユーザーが急いでいるから設計書チェックを省略する」 | 時間的制約は設計書ゲートの省略理由にならない。設計書なしの変更は後で大きな手戻りを生む |
| 「doc-index.md を自分で読んで判断すればよい」 | 設計書チェックは定められた手順で機械的に実行する。独自判断による省略を防ぐため |
| 「前回のワークフローで確認済みだから再確認は不要」 | ワークフロー起動のたびに確認する。前回以降に設計書が変更されている可能性がある |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「1行の修正だから設計書は不要」 | 1行の修正でも設計書との整合性確認が必要。設計書がなければ影響範囲が不明 |
| 「設計書を作る時間がない」 | 設計書なしの変更は手戻りリスクが高く、結果的に時間がかかる。設計書作成は投資 |
| 「コードを読めば設計がわかる」 | コードは「何をしているか」を示すが「なぜそうしているか」は示さない。設計書は意図を記録する |
| 「テストがあるから設計書は不要」 | テストは振る舞いの検証であり、設計の記録ではない。設計書とテストは補完関係 |
| 「設計書が古くて使えない」 | 古い設計書は更新すべきであり、設計書なしで進める理由にはならない。逆引きワークフローで最新化する |

## Integration

**Required workflow skills:**
- `pending-issues-management` (aide-powers skill) — FAIL時の `pending-issues.md` への issue 登録に使用する

**Called by:**
- 実装ワークフロー（開始時）
- 変更ワークフロー（開始時）
- リファクタリングワークフロー（開始時）
- バグ修正ワークフロー（ヒアリング完了後）

**Triggers:**
- 設計書作成ワークフロー（逆引き等）— FAIL時にユーザーに案内する対応先

**Related skills:**
- `design-sync` (aide-powers skill) — 設計書と実装の乖離が発生した場合の同期手順（design-gate は「存在確認」、design-sync は「内容の同期」）
- `doc-index-maintenance` (aide-powers skill) — `doc-index.md` の管理（design-gate は `doc-index.md` を「読む」側、doc-index-maintenance は「書く」側）
