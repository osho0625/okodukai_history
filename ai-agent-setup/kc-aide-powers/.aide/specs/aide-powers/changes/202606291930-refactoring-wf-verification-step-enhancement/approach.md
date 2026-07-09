# 対応方針書

## 方針概要
- **対応方針**: 両方（新規ファイル追加 + 既存ファイル変更）
- **OCP検討結果**: 既存変更が必要（SKILL.md の Step 3 書き換えは追加のみでは対処不可）

## 関連箇所

### 変更対象
| ファイル | クラス/メソッド | 変更内容 |
|---|---|---|
| `skills/fs-refactoring-phase5-impl/SKILL.md` | Step 3「ユーザー動作検証依頼」セクション | サブエージェント起動型の動作確認試験ステップに書き換え |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | Integration セクション | refactoring-verification-prompt.md への参照追加 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | 成果物テーブル | verification-report.md を成果物として追加 |

### 新規追加
| ファイル | クラス/メソッド | 追加内容 |
|---|---|---|
| `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | — | リファクタリング用動作確認プロンプトテンプレート（サブエージェント向け） |

## 変更方針の詳細

### 1. refactoring-verification-prompt.md の新規作成

- **方針**: 他3FS（change/impl/bugfix）の verification-prompt.md と同一構成パターンで新規作成する。以下の共通セクション構成を踏襲する:
  1. エージェント役割宣言（リファクタリングWF用）
  2. プレースホルダーセクション（FSが実データで置換するパラメータ定義）
  3. 試験実行の優先順位（自分で確認→Playwright MCP→ユーザー依頼）
  4. ローカル/試験環境での実行制約
  5. 試験内容の定義（リファクタリング固有）
  6. 試験手順の雛形
  7. 結果報告フォーマット（Status: OK/NG 形式）
  8. verification-report.md の出力フォーマット定義
  9. NG時の差し戻し情報セクション

- **リファクタリング固有の確認観点**:
  - メイン検証項目: 「外部振る舞いが変わっていないこと」
  - セーフティネット確認: 既存テスト全パスの再確認
  - ユースケースシナリオ実行: 実際のアプリ起動による動作確認
  - リグレッション観点: 内部構造変更により既存機能が壊れていないこと

- **プレースホルダー**: `{{feature_name}}`, `{{refactoring_dir}}`, `{{refactoring_design_path}}`, `{{implementation_summary}}`, `{{safety_net_result}}`, `{{dev_environment_path}}`, `{{startup_command}}`

- **試験内容の構成**:
  1. セーフティネット確認試験（既存テスト全パスの再確認）
  2. 外部振る舞い保持試験（ユースケースシナリオ実行）
  3. リグレッション確認試験（変更部分の関連機能動作確認）

- **差し戻し先**: 実装の問題→Step1（coding-test-2review）、設計の問題→Phase4（refactoring-design）

- **理由**: 他3FSとの一貫性を確保し、リファクタリングWFの動作検証品質を統一水準に引き上げるため。完全な新規追加であり既存ファイルへの影響なし。

### 2. SKILL.md の Step 3 書き換え

- **方針**: 現在の「ユーザー動作検証依頼」（ユーザーに報告して依頼するだけの簡易版）を、他3FSと同パターンのサブエージェント起動型の動作確認試験ステップに書き換える。具体的な処理フロー:
  1. refactoring-verification-prompt.md のプレースホルダーを実データで置換
  2. 置換済みプロンプトでサブエージェントを起動
  3. サブエージェントが動作確認試験を実行し、`{refactoring_dir}/verification-report.md` を出力
  4. 試験結果（Status: OK/NG）をユーザーに報告
  5. ユーザー承認フロー（OK→後処理遷移、NG→差し戻し先判定）

- **Step 3 タイトル変更**: 「ユーザー動作検証依頼」→「動作確認試験」（仮。差分設計で確定）

- **成果物追加**: `{refactoring_dir}/verification-report.md`

- **状態判定の変更**: OK時は後処理へ遷移、NG時は差し戻し先を判定してユーザーに提示

- **理由**: 他3FS（impl/change/bugfix）では全てサブエージェント起動型であり、リファクタリングWFのみ品質レベルが低い状態を解消するため。

### 3. SKILL.md の Integration セクション更新

- **方針**: refactoring-verification-prompt.md をサブエージェントプロンプトとして Integration セクションに追加する。

- **理由**: SKILL.md の Integration セクションは当該スキルが参照・利用するリソースの完全な一覧であり、新規プロンプトファイルの追加を反映する必要があるため。

### 4. SKILL.md の成果物テーブル更新

- **方針**: 冒頭の成果物テーブルに verification-report.md を追加する。

- **理由**: Step 3 で新たに生成される成果物をスキル定義の成果物一覧に反映する必要があるため。

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は aide-powers フレームワーク自体のスキル定義ファイル（Markdown）の追加/変更であり、プログラミング言語のコードベースではない。OCP原則は設計思想として参考にしたが、Markdownファイルの追加/変更には直接適用されない。新規ファイル（refactoring-verification-prompt.md）は完全に追加のみであり、既存ファイル変更（SKILL.md）は構造上避けられないが、変更範囲は Step 3 + Integration + 成果物テーブルに限定されており、他のStepや他スキルへの波及は発生しない。リファクタリング委譲の必要なし。
