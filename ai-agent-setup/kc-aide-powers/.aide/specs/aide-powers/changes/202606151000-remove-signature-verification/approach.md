# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応
- **OCP検討結果**: 既存変更が必要（署名検証機能の削除が主体であり、追加のみでは対処不可能）

## 関連箇所

### 変更対象
| ファイル | クラス/メソッド | 変更内容 |
|---|---|---|
| `skills/phase-compliance-check/SKILL.md` | スキル定義全体 | 完全削除 |
| `agents/compliance-checker.md` | エージェント定義全体 | 完全削除 |
| `skills/phase-report-check/SKILL.md` | verify/write モード | 署名検証・レポート記載項目検証の除去。verify→進捗確認、write→進捗更新に簡素化 |
| `agents/phase-report-checker.md` | エージェント定義全体 | 署名生成・検証・レポート記載項目検証の除去。名称変更（progress-updater等） |
| `agents/progress-final-checker.md` | 検証手順 B | 全署名検証ロジックの除去。進捗ファイルの全フェーズ完了確認のみに変更 |
| `skills/using-aide-powers/references/phase-skill-rules.md` | 署名関連記述 | 「署名生成」「署名検証をスキップ」等の記述を除去・更新 |
| `.kiro/steering/aide-powers-phase-skill-rules.md` | compliance-check 参照 | phase-compliance-check / compliance-checker への言及を除去 |
| `skills/session-handover/SKILL.md` | 実行証跡テンプレート | phase-compliance-check への参照を除去 |
| `skills/using-aide-powers/references/progress-file-format.md` | 説明文 | phase-report-check(write) 関連の署名記述を更新 |
| `skills/step-history-writer/SKILL.md` | 説明文 | progress-final-checker の署名検証に関する説明を更新 |

### 参照更新対象（フェーズスキル群 — テンプレート的一括適用）

以下のフェーズスキルは全て同一パターンの変更を適用する（前処理の verify 関連記述の更新 + 後処理の write 関連記述の更新）。

| ファイルグループ | 変更内容 |
|---|---|
| `skills/fs-reverse-phase{1-5}/SKILL.md`（5ファイル） | 前処理: phase-report-check(verify) → 進捗確認に変更。後処理: phase-report-check(write) → 進捗更新に変更 |
| `skills/fs-reverse-phase6-final-check/SKILL.md` | 前処理: verify → 進捗確認。Step1: progress-final-checker の署名検証除去 |
| `skills/fs-refactoring-phase{1-6}/SKILL.md`（6ファイル） | 前処理・後処理の署名関連記述を更新 |
| `skills/fs-refactoring-phase7-final-check/SKILL.md` | 前処理: verify → 進捗確認。Step1: progress-final-checker の署名検証除去 |
| `skills/fs-planning-phase{1-3}/SKILL.md`（3ファイル） | 前処理・後処理の署名関連記述を更新 |
| `skills/fs-impl-phase{1-4,6}/SKILL.md`（5ファイル） | 前処理・後処理の署名関連記述を更新 |
| `skills/fs-impl-phase5-final-check/SKILL.md` | 前処理: verify → 進捗確認。Step1: progress-final-checker の署名検証除去 |
| `skills/fs-design-phase9-infra/SKILL.md` | 前処理・後処理の署名関連記述を更新 |
| その他変更/バグ修正/設計WFの各フェーズスキル | 同パターン適用 |

### 新規追加
| ファイル | クラス/メソッド | 追加内容 |
|---|---|---|
| なし | — | 本変更は削除・簡素化が主体であり、新規ファイルの追加は不要 |

## 変更方針の詳細

### 1. phase-compliance-check スキルの削除（REQ-C-006）
- **方針**: `skills/phase-compliance-check/SKILL.md` を完全削除する
- **理由**: 署名検証を主目的としたスキルであり、署名検証廃止に伴い存在意義がなくなる。進捗確認・進捗更新の機能は phase-report-check（簡素化後）に統合済み

### 2. compliance-checker エージェントの削除（REQ-C-006）
- **方針**: `agents/compliance-checker.md` を完全削除する
- **理由**: phase-compliance-check の実行主体であり、スキル削除に伴い不要。機能は phase-report-checker（簡素化・名称変更後）に引き継がれる

### 3. phase-report-check スキルの簡素化（REQ-C-004）
- **方針**: verify モードは「進捗確認」に変更し、サブエージェントで進捗ファイルを読み再開判定を行うだけにする。write モードは「進捗更新」に変更し、サブエージェントで進捗ファイルに完了記録を書き込むだけにする。署名検証・レポート記載項目検証・省略なし宣言・署名生成を全て除去する。fix_open / fix_close モードは残す（進捗管理の一部として有用）
- **理由**: 署名検証がなくてもフェーズの省略を検知・防止できる代替機構（aide agent による制御）が機能しているため。進捗ファイルの読み書きはサブエージェントとして残す方針が確定している

### 4. phase-report-checker エージェントの簡素化・名称変更（REQ-C-005）
- **方針**: 署名生成・検証・レポート記載項目検証を全て除去し、進捗ファイルの読み込み・書き込みのみを担当するエージェントに変更する。名称を `progress-updater` に変更する（役割が「レポートチェック」から「進捗更新」に変わるため）
- **理由**: エージェント名が役割を正確に反映すべき。進捗ファイル操作のサブエージェント化はオーケストレータの直接操作禁止ルールを維持するため

### 5. progress-final-checker エージェントの簡素化（REQ-C-003）
- **方針**: 全署名検証ロジック（署名再計算・照合、COMPLIANCE-DECLARATION確認）を除去する。ステータステーブルの全前フェーズ完了確認のみを行い、全て ✅ 完了であれば自フェーズを完了に更新する
- **理由**: 署名検証廃止に伴い、完了判定は進捗ファイルのステータスのみで行う

### 6. 各フェーズスキルの前処理・後処理の更新（REQ-C-001, REQ-C-002）
- **方針**: 全フェーズスキル（30+ファイル）の前処理で「phase-compliance-check(verify)」または「phase-report-check(verify)」の呼び出しを「進捗確認（progress-resume-check + サブエージェント）」に変更する。後処理では「phase-compliance-check(write)」または「phase-report-check(write)」の呼び出しを「進捗更新（サブエージェント）」に変更する
- **理由**: 変更パターンは均一であり、テンプレート的一括適用で対応可能。サブエージェント（progress-updater）に委譲する構造は維持する

### 7. ステアリングファイル・参照ファイルの更新（REQ-C-006 関連）
- **方針**: `.kiro/steering/aide-powers-phase-skill-rules.md` の phase-compliance-check / compliance-checker への参照を除去し、後処理記述から「署名生成」を削除する。`skills/using-aide-powers/references/phase-skill-rules.md` も同様に更新する
- **理由**: 削除されたスキル・エージェントへの参照が残ると、AIが存在しないスキルを呼び出そうとする事故につながる

### 8. 署名関連の残存物の削除
- **方針**: `.aide/scripts/create-sig.sh`（署名スクリプト）は削除対象とする。進捗ファイルフォーマットから `<!-- PHASE-SIG:... -->` / `<!-- COMPLIANCE-DECLARATION:... -->` の記述ルールを除去する
- **理由**: 署名メカニズム自体を廃止するため、関連する全ての残存物を除去する

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 本変更は「署名検証の削除と進捗確認への簡素化」という一方向の変更であり、今後同様の改変パターンが反復される可能性は低い。影響ファイルは多い（30+）が、変更パターンは均一であり、テンプレート的一括適用で対応可能。リポジトリの配布物がMarkdown/bash/JSONの集合体であるため、OOP的なリファクタリング（Strategy/Factory等）は適用対象外。構造的改善の余地は限定的であり、リファクタリングのコストに見合うメリットがない
