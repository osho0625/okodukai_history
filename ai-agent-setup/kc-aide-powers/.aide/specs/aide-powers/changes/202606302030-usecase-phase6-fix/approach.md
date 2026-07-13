# 対応方針書

## 方針概要
- **対応方針**: 両方（既存ファイルへのセクション追加 + 新規ファイル追加）
- **OCP検討結果**: 追加のみで対処可能（既存の正常動作しているStep定義の構造を壊さず、セクション追加・分岐追加・新規ファイル追加で対応）

## 関連箇所

### 変更対象
| ファイル | セクション/箇所 | 変更内容 |
|---|---|---|
| `skills/fs-design-phase6-usecase/usecase-lister-prompt.md` | ファイル末尾 | 「## 報告フォーマット」セクション追加（Status: DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL の定義と発生条件） |
| `skills/fs-design-phase6-usecase/usecase-process-analyzer-prompt.md` | ファイル末尾 | 「## 報告フォーマット」セクション追加（同上）+ 「## プログラム実現不可UCの判定基準」セクション追加 |
| `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md` | 「## 報告フォーマット」セクション / 「### 判定」セクション | Status定義の拡充（DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL追加）+ 判定値の文字列一致確認明記 |
| `skills/fs-design-phase6-usecase/SKILL.md` | Step2 完了条件 | 「UCリストのユーザー合意結果(Step2)が『合意』」を削除（ユーザー承認はStep4で実施するため） |
| `skills/fs-design-phase6-usecase/SKILL.md` | Step2 状態判定 | FAIL 分岐追加（FAIL時はユーザーに報告し対応方針を確認） |
| `skills/fs-design-phase6-usecase/SKILL.md` | Step3 成果物 | サブエージェント出力から「網羅性レビュー結果(Step3):」「未カバー操作一覧(Step3):」への転記参照箇所を明示 |
| `skills/fs-design-phase6-usecase/SKILL.md` | Step5 状態判定 | FAIL 分岐追加 + プログラム実現不可UC検出時のサブフロー追加（ユーザー報告→承認→UC削除サブエージェント起動） |

### 新規追加
| ファイル | 用途 | 追加内容 |
|---|---|---|
| `skills/fs-design-phase6-usecase/usecase-removal-prompt.md` | プログラム実現不可UC削除用サブエージェントプロンプト | usecase-list.mdから該当UC行の削除 + 対応するusecase-{uc名}.mdファイルの削除を実行する指示 |

## 変更方針の詳細

### REQ-C-001: usecase-lister-prompt.md への報告フォーマット追加
- **方針**: ファイル末尾に「## 報告フォーマット」セクションを追加する。既存の「## 注意事項」セクションの後に配置する。Status定義（DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL）と各ステータスの発生条件を明文化する。併せてSKILL.md Step2の完了条件から「UCリストのユーザー合意結果(Step2)が『合意』」を削除し、Step2状態判定にFAIL分岐を追加する。
- **理由**: 既存プロンプトの指示内容を破壊せずに末尾追加で対応可能。usecase-coverage-reviewer-prompt.mdには既に「## 報告フォーマット」が存在するが、その形式は簡素（Status: DONEのみ）であるため、他の2プロンプトに追加する際にも同様の簡潔な形式を基本とし、SKILL.md側が必要とする全ステータスを定義する。SKILL.md Step2の完了条件修正は、ユーザー承認がStep4に移動している設計意図との整合のため。

### REQ-C-002: usecase-process-analyzer-prompt.md への報告フォーマット追加
- **方針**: ファイル末尾（「## fix モードの場合」セクションの後）に「## 報告フォーマット」セクションを追加する。加えて、REQ-C-004の「プログラム実現不可UC判定基準」セクションも同ファイルに追加する（DONE_WITH_CONCERNSの発生条件に「プログラム実現不可UCを検出した場合」を含め、不可能UC一覧と理由を出力に含める形式を定義する）。SKILL.md Step5にFAIL分岐を追加する。
- **理由**: usecase-process-analyzer-prompt.mdは実現プロセスを分析するエージェントであり、プログラムで実現可能かの判断を最初に行う適切な場所である。報告フォーマットとプログラム不可判定基準を同一ファイルに追加することで、サブエージェントが判定→報告を一貫して行える。

### REQ-C-003: usecase-coverage-reviewer-prompt.md とSKILL.md Step3の連携明確化
- **方針**: (1) usecase-coverage-reviewer-prompt.mdの既存「## 報告フォーマット」セクションを拡充し、DONE以外のステータス（DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED/FAIL）の発生条件を追加定義する。(2) 出力フォーマット「### 判定」セクションの値（「全操作カバー済み」「未カバー操作あり（{N}件）」）がSKILL.md Step3の状態判定条件と文字列レベルで一致することを明記する。(3) SKILL.md Step3の成果物セクションに、サブエージェント出力のどの部分（「### 判定」セクションの「結果:」行）を「網羅性レビュー結果(Step3):」に転記するかを明示する。
- **理由**: usecase-coverage-reviewer-prompt.mdには既に基本的な報告フォーマットと出力フォーマット（「### 判定」セクション）が存在する。既存構造を活かし、不足している情報（ステータスの網羅定義、SKILL.md側の転記対応関係）を追記する形で対応する。

### REQ-C-004: プログラム実現不可UCの検出・削除フロー
- **方針**: (1) usecase-process-analyzer-prompt.mdに「## プログラム実現不可UCの判定基準」セクションを追加（物理的操作、人間の介在必須、外部ハードウェア制御、法的手続き等のカテゴリを定義）。(2) 同プロンプトの報告フォーマットにおいて、プログラム不可UC検出時はDONE_WITH_CONCERNSで報告し、不可能UC一覧と理由を出力に含める形式を定義。(3) SKILL.md Step5の状態判定に、DONE_WITH_CONCERNSかつプログラム実現不可UCありの場合のサブフロー（ユーザーへの報告→削除承認→usecase-removal-prompt.mdによるサブエージェント起動）を追加。(4) usecase-removal-prompt.mdを新規作成。
- **理由**: REQ-C-004は本変更で最も大きい追加だが、全て追加型で対応可能。usecase-process-analyzer-prompt.mdへの判定基準追加は既存の分析フローを拡張するもの。SKILL.md Step5の状態判定は既存のDONE_WITH_CONCERNS分岐の前に「プログラム実現不可UC」のサブフローを挟む形で追加する。usecase-removal-prompt.mdは完全新規ファイル。

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 変更対象はスキル定義ファイル（Markdown）であり、コードの構造的問題は該当しない。各プロンプトファイルの構造は明確で、セクション追加による拡張に適した構成となっている。SKILL.mdのStep定義も各Stepが独立した構造を持ち、分岐追加が自然に行える形式である。usecase-coverage-reviewer-prompt.mdには既に「## 報告フォーマット」が存在しており、他の2プロンプトに同様のセクションを追加することで構造の統一性が向上する。リファクタリングの必要なしと判断する。
