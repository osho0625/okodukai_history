# 変更要求定義

## 変更概要
- **変更の目的・背景**: 実装WF（fs-impl-phase4-execution）の動作確認ステップを「機能リスト＋機能別試験書」の新構造に書き換え済み。残り3WF（変更/バグ修正/リファクタリング）もこの新構造に統一する。旧形式の冗長な⚠️注意書きブロック・verification-report.md（単一レポートファイル）を廃止し、機能リスト作成→機能別試験書作成→試験実行→結果報告の構造に書き換える。
- **変更種別**: 変更

## 要求事項

### REQ-C-001: 3WFのSKILL.md動作確認ステップ定義の書き換え
- **種別**: 変更
- **説明**: 以下3ファイルの動作確認ステップ定義を、fs-impl-phase4-execution/SKILL.md の Step 2 スタイルに書き換える。冗長な⚠️注意書きブロック（「動作確認の定義」「確認の優先順位」「ローカル/試験環境での実行制約」等の長大なquoteブロック）を削除し、簡潔な記述に統一する。
  - `skills/fs-change-phase2-impl/SKILL.md`（Step 12）
  - `skills/fs-bugfix-phase2-impl/SKILL.md`（Step 10）
  - `skills/fs-refactoring-phase5-impl/SKILL.md`（Step 3）
- **受入基準**:
  - AC-001: 各ステップから旧形式の⚠️注意書きquoteブロックが全て除去されていること
  - AC-002: FSの責務が「プロンプトテンプレート準備（プレースホルダー埋込）→ サブエージェント起動 → 結果受領 → 試験書パスと試験結果の確認」と簡潔に記載されていること
  - AC-003: 完了条件が「試験結果OK＋ユーザー承認＋{作業フォルダ}/testing/test-{機能名}-test-plan.md が存在すること」に変更されていること（旧 verification-report.md への参照なし）
  - AC-004: 状態判定（OK/NG時の遷移先）は既存ロジックを維持すること
- **優先度**: 必須（Must）

### REQ-C-002: 3WFのverification-prompt.mdの書き換え
- **種別**: 変更
- **説明**: 以下3ファイルのプロンプトテンプレートを、impl-verification-prompt.md の構造に書き換える。ただし、対象範囲は「全機能」ではなく「実装箇所＋影響範囲にかかる機能のみ」とし、出力先は各作業フォルダ内の testing/ とする。
  - `skills/fs-change-phase2-impl/change-verification-prompt.md` → 出力先: `{changes_dir}/testing/`
  - `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md` → 出力先: `{bugfix_dir}/testing/`
  - `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` → 出力先: `{refactoring_dir}/testing/`
- **受入基準**:
  - AC-005: 各プロンプトが以下4段階構造を持つこと: (1)動作確認対象機能リスト作成 (2)機能別試験書作成 (3)試験実行 (4)結果報告
  - AC-006: 動作確認対象機能リスト（test-function-list.md）の作成指示が含まれ、対象が「実装箇所＋影響範囲にかかる機能」に限定されていること（実装WFの「全機能」とは異なる）
  - AC-007: 機能別試験書（test-{機能名}-test-plan.md）の作成項目が impl-verification-prompt.md と同一であること（状態/条件、確認項目、確認手順、確認環境、期待結果、確認結果、試験実施日時）
  - AC-008: 試験実行方法が impl-verification-prompt.md と同一であること（Playwright MCP / コードレビューによる確認）
  - AC-009: 結果報告形式が impl-verification-prompt.md と同一であること（機能リスト・試験書パス・試験結果。NGの場合は試験書パス・試験内容・試験結果を報告）
  - AC-010: 出力先が各WFの作業フォルダ内 testing/ であること（{changes_dir}/testing/, {bugfix_dir}/testing/, {refactoring_dir}/testing/）
  - AC-011: 3プロンプト間で共通の構造・表現が統一されていること（WF固有の差分はプレースホルダーのみ）
- **優先度**: 必須（Must）

### REQ-C-003: 旧verification-report.md成果物定義の除去
- **種別**: 変更
- **説明**: 3WFのSKILL.mdから、旧形式 verification-report.md に関する記述を全て除去する。
  - `skills/fs-change-phase2-impl/SKILL.md`: 成果物テーブルから `verification-report.md` 行を削除、Step 12 完了条件から `verification-report.md が存在すること` を削除
  - `skills/fs-bugfix-phase2-impl/SKILL.md`: 同上（Step 10）
  - `skills/fs-refactoring-phase5-impl/SKILL.md`: 同上（Step 3）
- **受入基準**:
  - AC-012: 3WFの成果物テーブルから verification-report.md の行が除去されていること
  - AC-013: 3WFの動作確認ステップ完了条件から verification-report.md への参照が除去されていること
  - AC-014: 代わりに testing/ フォルダ配下の成果物定義（test-function-list.md, test-{機能名}-test-plan.md）が成果物テーブルに追加されていること
- **優先度**: 必須（Must）

### REQ-C-004: フォルダ統合時のtesting/配下の取り扱い定義
- **種別**: 追加
- **説明**: 変更/バグ修正/リファクタリングWFの作業フォルダを本体設計フォルダに統合する際、testing/ 配下のファイルは old/ に移動する旨を定義する。統合処理を担う該当箇所（doc-sync や folder-merge-check 等）に記載を追加する。
- **受入基準**:
  - AC-015: フォルダ統合時に testing/ 配下が old/ に移動されるルールが明記されていること
  - AC-016: old/ への移動は統合処理の一環として自動的に行われること（手動操作不要）
- **優先度**: 必須（Must）

## 対象外（スコープ外）
- 実装WF（fs-impl-phase4-execution）のSKILL.md および impl-verification-prompt.md（既に編集済みのリファレンス。変更しない）
- coding-test-2review の変更
- dev-environment.md のフォーマット変更
- 動作確認の外部振る舞い変更（OK/NG判定ロジック、差し戻し先等は既存を維持）
- testing/ フォルダ構造自体の設計（impl-verification-prompt.md で確定済みの構造をそのまま適用）

## 前提条件
- fs-impl-phase4-execution/SKILL.md の Step 2 および impl-verification-prompt.md がリファレンスとして確定済み
- 3WF全てに動作確認ステップと verification-prompt.md が既に定義されていること（確認済み）
- 各WFの作業フォルダ変数（changes_dir, bugfix_dir, refactoring_dir）は既にSKILL.md内で定義済み

## 関連する既存要件
- **UR-005**（多段コードレビュー）: 動作確認は既存のレビュー体系の一部
- **UR-007**（進捗管理機構）: 動作確認結果はフェーズレポートに記録される
- **impl-verification-prompt.md**: 新構造のリファレンス実装（実装WF用）
- **fs-impl-phase4-execution/SKILL.md Step 2**: 新構造のステップ定義リファレンス
