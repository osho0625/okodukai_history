# 対応方針書

## 方針概要
- **対応方針**: 両方（既存ファイル1本の変更 + 新規ファイル6本の追加）
- **OCP検討結果**: 本変更は「追加」が主体であり、既存ロジックへの影響は SKILL.md ステップ1への条件分岐追加のみ。既存の振る舞い（ターゲットファイル未存在時）は保持される。拡張に対して開いており、リファクタリングは不要

## 関連箇所

### 変更対象
| ファイル | クラス/メソッド | 変更内容 |
|---|---|---|
| `skills/rules-distribute/SKILL.md` | ステップ1: プラットフォーム判定 | `.aide/ai-agent-platform-targets.md` 存在時のスキップ条件分岐を追加。明示的変更依頼時のみ再確認フローを実行する旨を記載 |

### 新規追加
| ファイル | クラス/メソッド | 追加内容 |
|---|---|---|
| `steering/aide-powers-global-rules.md` | — | Kiro向け global-rules 配布ファイル（front-matter `inclusion: always` + マーカー + 正本内容） |
| `steering/aide-powers-phase-skill-rules.md` | — | Kiro向け phase-skill-rules 配布ファイル（front-matter `inclusion: always` + マーカー + 正本内容） |
| `rules/aide-powers-global-rules.md` | — | Claude Code向け global-rules 配布ファイル（マーカー + 正本内容） |
| `rules/aide-powers-phase-skill-rules.md` | — | Claude Code向け phase-skill-rules 配布ファイル（マーカー + 正本内容） |
| `instructions/aide-powers-global-rules.instructions.md` | — | Copilot向け global-rules 配布ファイル（Copilot front-matter + マーカー + 正本内容） |
| `instructions/aide-powers-phase-skill-rules.instructions.md` | — | Copilot向け phase-skill-rules 配布ファイル（Copilot front-matter + マーカー + 正本内容） |

## 変更方針の詳細

### 1. SKILL.md ステップ1への条件分岐追加（REQ-C-001, REQ-C-002）

- **方針**: ステップ1の冒頭に条件分岐を追加する。`.aide/ai-agent-platform-targets.md` が存在する場合はユーザー確認をスキップし、既存ファイルの内容をそのまま使用してステップ2に進む。ファイルが存在しない場合は従来通りの確認フローを実行する。ユーザーから明示的にターゲット変更を依頼された場合のみ再確認フローを実行する旨を注記として追加
- **理由**: 既存の確認フロー本体は変更せず、その手前に条件分岐を追加するだけで実現可能。既存の振る舞い（初回実行時のフロー）を壊さずに拡張できる

### 2. steering/ への Kiro向け配布ファイル追加（REQ-C-003, REQ-C-006）

- **方針**: `steering/aide-powers-bootstrap.md` と同じディレクトリに、`aide-powers-global-rules.md` と `aide-powers-phase-skill-rules.md` を完成形として新規配置する。Kiro のステアリングファイル形式に従い、front-matter に `inclusion: always` を記載し、マーカーコメント `<!-- [aide-powers:auto-generated] rules-distribute スキルにより自動生成。手動編集禁止。 -->` の後に正本内容を配置する
- **理由**: 既存の `aide-powers-bootstrap.md` と同一パターンで配布されるため、APM がそのまま認識し `.kiro/steering/` に自動配布する。追加のAPM設定変更は不要

### 3. rules/ への Claude Code向け配布ファイル追加（REQ-C-004, REQ-C-006）

- **方針**: `rules/aide-powers-bootstrap.md` と同じディレクトリに、`aide-powers-global-rules.md` と `aide-powers-phase-skill-rules.md` を完成形として新規配置する。Claude Code のルールファイル形式に従い、front-matter なし、マーカーコメント + 正本内容の構成とする
- **理由**: 既存の `aide-powers-bootstrap.md` と同一パターン。APM がディレクトリ内のファイルを自動認識して配布する

### 4. instructions/ への Copilot向け配布ファイル追加（REQ-C-005, REQ-C-006）

- **方針**: `instructions/aide-powers-bootstrap.instructions.md` と同じディレクトリに、`aide-powers-global-rules.instructions.md` と `aide-powers-phase-skill-rules.instructions.md` を完成形として新規配置する。Copilot のインストラクション形式に従い、front-matter `applyTo: '**'` + マーカーコメント + 正本内容の構成とする
- **理由**: 既存の `aide-powers-bootstrap.instructions.md` と同一パターン。命名規則も `aide-powers-{内容名}.instructions.md` で一貫

### 5. 配布ファイル同期運用の明記

- **方針**: SKILL.md の該当箇所（ステップ2付近、または末尾の注記セクション）に、正本更新時には6本の配布ファイルも同期更新する必要がある旨を注記として追記する
- **理由**: 影響範囲分析の注意事項1で指摘された運用ルールの明記が必要。SKILL.md 内に記載することで、rules-distribute スキル実行時に自然に参照される

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は「追加」が主体であり、既存コードへの変更はSKILL.mdのステップ1に条件分岐を1箇所追加するのみ。新規ファイル6本は既存のbootstrapファイルと同一パターンの独立したファイルであり、既存構造との結合度は低い。OCPに適合しており、構造的なリファクタリングの必要性はない
