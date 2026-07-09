# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応（ファイル削除 + 参照箇所修正）
- **OCP検討結果**: 既存変更が必要（機能削除のため追加では対処不可）

## 関連箇所

### 変更対象（削除）
| ファイル | 変更内容 |
|---|---|
| steering/aide-agent.md | オーケストレータ steering 定義ファイルの削除 |
| agents/aide-agent.md | エージェント定義本体の削除 |
| .kiro/steering/aide-agent.md | Kiro IDE 配布先 steering（.gitignore 対象だがワークスペース内に存在。setup.bat が配置したもの。WFスコープ内で削除する） |
| .kiro/agents/aide-agent.json | Kiro CLI 用エージェント JSON（.gitignore 対象だがワークスペース内に存在。setup.bat が配置したもの。WFスコープ内で削除する） |

### 変更対象（修正）
| ファイル | 変更内容 |
|---|---|
| steering/aide-powers-bootstrap.md | aide-agent steering 読み込み指示の削除 |
| skills/using-aide-powers/SKILL.md | エージェント切り替えガードセクションの削除 |
| setup.bat | aide-agent.md コピー処理の削除 |
| rules/aide-powers-bootstrap.md | aide-agent 切り替え指示を using-aide-powers activate 指示に修正 |
| rules/aide-powers-bootstrap.mdc | aide-agent 切り替え指示を修正 |
| instructions/aide-powers-bootstrap.instructions.md | aide-agent 切り替え指示を修正 |

### 変更対象（ドキュメント更新）
| ファイル | 変更内容 |
|---|---|
| .aide/specs/aide-powers/program-structure.md | aide-agent 関連記述の削除・更新 |

### 新規追加
なし

## 変更方針の詳細

### ファイル削除
- **方針**: steering/aide-agent.md と agents/aide-agent.md を物理削除する
- **理由**: aide-agent 運用は廃止。プラットフォームのデフォルト Agent で直接 using-aide-powers を activate する形に戻すため

### ブートストラップファイル修正
- **方針**: 各プラットフォームの bootstrap ファイルから aide-agent 切り替え指示を削除し、「using-aide-powers スキルを activate してその指示に従う」形に統一する
- **理由**: aide-agent を経由しない直接的な起動フローに変更するため

### setup.bat 修正
- **方針**: aide-agent.md のコピー処理を削除する
- **理由**: 配布物から aide-agent.md が除外されるため

### using-aide-powers SKILL.md 修正
- **方針**: 「エージェント切り替えガード」セクションを削除する
- **理由**: aide-agent への切り替え判定が不要になるため

### program-structure.md 更新
- **方針**: aide-agent 関連記述（エージェント一覧表、フォルダツリー、起動フロー図、「aide-agent が agents/kiro/ に存在しない理由」セクション、配布マッピング表）を削除後の実態に合わせて更新する
- **理由**: 設計ドキュメントと実態の整合性を維持するため

### ワークスペース内 .kiro/ 配下のファイル（.kiro/steering/aide-agent.md, .kiro/agents/aide-agent.json）
- **方針**: WFスコープ内で物理削除する
- **理由**: これらは .gitignore 対象だがワークスペース直下の .kiro/ ディレクトリに物理的に存在するファイル（setup.bat が配置したもの）であり、ワークスペース内の操作としてWFスコープ内で削除可能。AC-001「リポジトリ内に存在しないこと」はワークスペース内（.kiro/含む）に物理的に存在しないことを意味するため、削除が必要
- **注意**: グローバル領域（~/.kiro/）に存在するファイルとは別物。グローバル領域の操作はWFスコープ外

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は機能削除であり、追加で対応可能にするための構造改善（リファクタリング）の対象にはならない
