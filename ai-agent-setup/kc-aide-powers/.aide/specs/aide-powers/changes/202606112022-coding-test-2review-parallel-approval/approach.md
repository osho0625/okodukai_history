# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応
- **OCP検討結果**: 既存変更が必要（既存プロンプトテンプレートへのルール追記が本質であり、OCP適用外）

## 関連箇所

### 変更対象
| ファイル | 変更内容 |
|---|---|
| `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | ステップ6に行キー生成ルール追記 |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | ステップ6に行キー生成ルール追記 |
| `skills/impl-task-planning/impl-planner-prompt.md` | ステップ7に行キー生成ルール追記 |
| `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` | 削除（冗長コピー） |
| `skills/fs-impl-phase2-preparation/SKILL.md` | Step 3のプロンプト参照先を共通スキルに変更、Integrationセクションのプロンプトテンプレート一覧更新 |

### 新規追加
なし

## 変更方針の詳細

### CR-001: 行キー生成ルール追記
- **方針**: 3ファイルの工程チェック表生成セクションに行キー生成ルールを追記する
- **理由**: impl-task-planning SKILL.md本体には記載があるが、サブエージェントに渡すプロンプトテンプレートに明示されておらず、エージェントがルールを見落とす

### CR-002: 冗長コピー削除・参照切り替え
- **方針**: fs-impl-phase2-preparation/impl-planner-prompt.md を削除し、SKILL.md の参照先を共通スキル配下（skills/impl-task-planning/impl-planner-prompt.md）に変更する。Integrationセクションのプロンプトテンプレート一覧から `impl-planner-prompt.md` を削除し、共通スキル参照である旨を記載する
- **理由**: 同一内容のファイルが2箇所に存在すると、一方のみ更新されもう一方が古いまま残るリスクがある。共通スキルに一本化して保守性を向上させる

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: CR-002 が冗長コピーの解消であり、リファクタリング的要素は今回の変更自体に含まれている。別途リファクタリングWFを起動する必要はない

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
