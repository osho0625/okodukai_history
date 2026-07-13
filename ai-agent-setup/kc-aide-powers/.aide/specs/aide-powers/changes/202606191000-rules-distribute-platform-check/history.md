# 変更履歴: rules-distribute プラットフォーム確認スキップ & APM経由ルール配布ファイル追加

## 変更日時
2026-06-19

## 変更概要
- rules-distribute SKILL.md のステップ1に `.aide/ai-agent-platform-targets.md` 存在時のスキップ条件分岐を追加
- APM配布用のルールファイル6本を新規追加（steering/ × 2, rules/ × 2, instructions/ × 2）
- SKILL.md 末尾に同期運用注記セクションを追加

## 対応要求
- REQ-C-001: プラットフォーム確認のスキップ（ターゲットファイル存在時）
- REQ-C-002: 明示的変更トリガーの制限
- REQ-C-003: steering/ 配布ファイル追加（Kiro向け）
- REQ-C-004: rules/ 配布ファイル追加（Claude Code向け）
- REQ-C-005: instructions/ 配布ファイル追加（GitHub Copilot向け）
- REQ-C-006: 全配布ファイルの共通構成（プラットフォーム固有ヘッダー + マーカー + 正本内容）

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---|---|---|
| skills/rules-distribute/SKILL.md | 修正 | ステップ1に条件分岐追加 + 末尾に同期運用注記追加 |
| steering/aide-powers-global-rules.md | 新規 | Kiro向け global-rules 配布ファイル |
| steering/aide-powers-phase-skill-rules.md | 新規 | Kiro向け phase-skill-rules 配布ファイル |
| rules/aide-powers-global-rules.md | 新規 | Claude Code向け global-rules 配布ファイル |
| rules/aide-powers-phase-skill-rules.md | 新規 | Claude Code向け phase-skill-rules 配布ファイル |
| instructions/aide-powers-global-rules.instructions.md | 新規 | GitHub Copilot向け global-rules 配布ファイル |
| instructions/aide-powers-phase-skill-rules.instructions.md | 新規 | GitHub Copilot向け phase-skill-rules 配布ファイル |

## 影響を受けた既存設計書
なし（本変更はプログラム構成への局所的追加のみで、既存設計書へのマージ対象なし）

## 設計書参照
- delta-design.md（本 changes_dir 内）


## 不具合修正（2026-06-19）
- 日付: 2026-06-19
- バグ概要: APM配布ファイルの配置場所が不正（.apm/instructions/ ではなくルート直下に配置していたためAPMが認識しない）
- 原因: 変更WFの差分設計でAPMの検索仕様を誤解し、ルート直下の steering/, rules/, instructions/ にファイルを配置した
- 修正概要: .apm/instructions/ に APM正式フォーマット（description + applyTo付き）で3ファイルを配置し、誤配置の6ファイルを削除
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
