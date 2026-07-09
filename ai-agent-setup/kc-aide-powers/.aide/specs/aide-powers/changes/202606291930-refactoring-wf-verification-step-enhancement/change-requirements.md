# 変更要求定義

## 変更概要
- **変更の目的・背景**: リファクタリングWF（fs-refactoring-phase5-impl）のStep 3「動作検証」は、現在「ユーザーに動作確認を依頼するだけ」の簡易版である。他3FS（impl/change/bugfix）は「verification-prompt.md テンプレートを使ってサブエージェントを起動し、verification-report.md を出力し、ユーザー承認を得る」パターンで統一されており、リファクタリングWFのみ品質レベルが低い。これを他3FSと同レベルに引き上げ、動作検証の品質を統一する。
- **変更種別**: 複合（新規ファイル追加 + 既存ファイル変更）

## 要求事項

### REQ-C-001: リファクタリング用 verification-prompt.md の新規作成
- **種別**: 追加
- **説明**: `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` を新規作成する。他3FSの verification-prompt.md（change-verification-prompt.md / impl-verification-prompt.md / bugfix-verification-prompt.md）と同パターンの構成とし、リファクタリング固有の確認観点（外部振る舞いが変わっていないこと）を盛り込む。
- **受入基準**:
  - AC-001: `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` がファイルとして存在すること
  - AC-002: プレースホルダーセクション（FSが実データで置き替えるパラメータ定義）が含まれること
  - AC-003: 試験実行の優先順位セクション（自分で確認→Playwright MCP→ユーザー依頼の優先順）が含まれること
  - AC-004: リファクタリング固有の確認観点として「外部振る舞いが変わっていないこと」がメイン検証項目に定義されていること
  - AC-005: セーフティネット（既存テスト全パス）に加えて、実際のアプリ起動→ユースケースシナリオ実行による確認が試験内容に含まれること
  - AC-006: verification-report.md の出力フォーマット定義が含まれること
  - AC-007: NG時の差し戻し情報セクションが含まれること
  - AC-008: 結果報告フォーマット（Status: OK/NG 形式）が定義されていること
- **優先度**: 必須

### REQ-C-002: fs-refactoring-phase5-impl SKILL.md の Step 3 書き換え
- **種別**: 変更
- **説明**: `skills/fs-refactoring-phase5-impl/SKILL.md` の Step 3「ユーザー動作検証依頼」を、サブエージェント起動型の動作確認ステップに書き換える。refactoring-verification-prompt.md をテンプレートとして使用し、プレースホルダーを実データで置換してサブエージェントを起動し、verification-report.md を出力させ、ユーザー承認を得るフローとする。
- **受入基準**:
  - AC-009: Step 3 のタイトルが動作確認試験を示す名称に変更されていること（「ユーザー動作検証依頼」からの変更）
  - AC-010: Step 3 の処理フローに refactoring-verification-prompt.md のプレースホルダー置換処理が定義されていること
  - AC-011: Step 3 の処理フローにサブエージェント起動（verification-prompt を使った動作確認試験の実行）が定義されていること
  - AC-012: Step 3 の成果物に verification-report.md（`{refactoring_dir}/verification-report.md`）が含まれていること
  - AC-013: Step 3 にユーザー承認フロー（試験結果の報告→ユーザーの OK/NG 判断→NG 時の差し戻し）が定義されていること
  - AC-014: Step 3 の状態判定に OK 時（後処理へ遷移）と NG 時（差し戻し先の判定）の分岐が定義されていること
  - AC-015: SKILL.md の Integration セクションに refactoring-verification-prompt.md への参照が追加されていること
- **優先度**: 必須

## 対象外（スコープ外）
- 他3FSの既存 verification-prompt.md（change-verification-prompt.md / impl-verification-prompt.md / bugfix-verification-prompt.md）の変更
- リファクタリングWFの他 Step（Step 1, Step 2, 前処理, 後処理）の変更
- リファクタリングWFの他フェーズ（phase1〜4, phase6〜7）の変更
- coding-test-2review スキルの変更
- verification-prompt.md の共通化・テンプレート抽出（4FS共通テンプレートの作成等）

## 前提条件
- 他3FSの verification-prompt.md が参照可能であること（パターンの参考とするため）
  - `skills/fs-change-phase2-impl/change-verification-prompt.md`
  - `skills/fs-impl-phase4-execution/impl-verification-prompt.md`
  - `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md`
- `skills/fs-refactoring-phase5-impl/SKILL.md` が存在し編集可能であること
- リファクタリングWFの前提（coding-test-2review による実装ループ完了、セーフティネット全パス）が Step 3 到達時点で成立していること

## 関連する既存要件
- **UR-001**: 7つのワークフロー（リファクタリングを含む）を提供すること — 本変更はリファクタリングWFの動作検証品質向上に該当
- **UR-005**: 多段コードレビュー（設計準拠＋コード品質の2段階）を提供すること — coding-test-2review 経由のレビュー後に行われる追加検証として位置づけ
- **Q-01**: 動作確認はインストーラ実行確認＋ハブスキル発動確認の手動検証で行う — 本変更により手動検証の品質が体系化される
