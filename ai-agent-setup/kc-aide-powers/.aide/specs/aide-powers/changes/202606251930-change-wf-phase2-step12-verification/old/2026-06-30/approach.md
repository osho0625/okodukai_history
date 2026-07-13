# 対応方針書

## OCP検討結果
N/A（本変更はMarkdownスキルファイルの記述統一であり、プログラムコードの変更を伴わないためOCP原則の検討対象外）

## リファクタリング提案
なし（記述構造の統一であり、リファクタリング委譲は不要）

## 対応方針

### 方針概要
fs-impl-phase4-execution のStep 2 および impl-verification-prompt.md をリファレンスとし、残り3WF（変更/バグ修正/リファクタリング）の動作確認ステップとプロンプトを新構造に書き換える。

### 変更の進め方
1. 3WFのverification-prompt.md を新構造に書き換え（REQ-C-002）
2. 3WFのSKILL.md動作確認ステップ定義を書き換え（REQ-C-001）
3. 3WFのSKILL.md成果物テーブル・完了条件から旧verification-report.md参照を除去（REQ-C-003）
4. folder-merge-check/SKILL.md に testing/ → old/ ルールを追加（REQ-C-004）

### WF間の差分（リファレンスとの違い）
- **実装WF（リファレンス）**: 全機能が対象。出力先 .aide/specs/{feature_name}/testing/
- **変更/バグ修正/リファクタリングWF**: 実装箇所＋影響範囲にかかる機能のみ対象。出力先は各作業フォルダ内 testing/

### 変更対象ファイル（7件）
| # | ファイル | 変更内容 |
|---|---|---|
| 1 | skills/fs-change-phase2-impl/SKILL.md | Step 12 書き換え + 成果物テーブル変更 |
| 2 | skills/fs-change-phase2-impl/change-verification-prompt.md | 4段階構造に書き換え |
| 3 | skills/fs-bugfix-phase2-impl/SKILL.md | Step 10 書き換え + 成果物テーブル変更 |
| 4 | skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md | 4段階構造に書き換え |
| 5 | skills/fs-refactoring-phase5-impl/SKILL.md | Step 3 書き換え + 成果物テーブル変更 |
| 6 | skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md | 4段階構造に書き換え |
| 7 | skills/folder-merge-check/SKILL.md | testing/ → old/ ルール追加 |

### リスク・注意事項
- リファレンス（impl-verification-prompt.md）との乖離が生じないよう、構造を忠実に踏襲する
- 各WF固有の差分（対象範囲・出力先・プレースホルダー）のみ変更する
- SKILL.md の状態判定（OK/NG時の遷移先）は既存ロジックを維持する
