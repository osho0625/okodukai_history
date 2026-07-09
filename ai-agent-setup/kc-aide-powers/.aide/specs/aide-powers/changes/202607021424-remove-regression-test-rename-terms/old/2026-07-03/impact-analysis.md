# 影響範囲分析（Phase 2 更新版）

## 変更種別
変更

## アクター視点の影響

### 影響を受けるユースケース
- UR-001: 7つのワークフロー提供 — バグ修正WF・リファクタリングWFのフェーズスキル内記述が修正されるため、ワークフローの設計記述正確性に影響
- UR-010: 共通スキル群による横断的ユーティリティ — impl-coding-standards（共通スキル）のステータス運用ルール表が修正されるため、共通スキルの記述正確性に影響

### 影響を受けるアクター
- AIエージェント — スキル定義の用語・番号が修正されることで、AIがスキルを読み取る際の解釈精度が向上する（ただし振る舞い変更はなく文言の正確性のみ）
- aide-powers開発者 — docs-dev（開発者向けドキュメント）の記述が修正されるため、開発者が参照する情報の正確性が向上する

## プログラム構成視点の影響

### 変更対象ファイル
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/impl-coding-standards/SKILL.md` | 変更 | ステータス運用ルール表内の旧用語「対象 + 全体リグレッション」を新用語に修正 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | 変更 | Integration節「呼び出す共通スキル」表のStep番号修正（doc-sync: 旧Step11→Step10、pending-issues: 旧Step12/13→Step11/12） |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | 変更 | 運用ルール節の旧表現「リグレッションテストタスクを…2系統で…分ける」を新表現に修正 |
| `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | 変更 | 冒頭一覧表の「各タスクごとのセーフティネット全実行」を新表現に修正 |
| `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` | 変更 | 「各タスク完了ごとに既存テスト全実行」等の旧表現を新表現に修正 |
| `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` | 変更 | 記録項目数表現を refactoring-status-checker-prompt.md の表記（総テスト数・パス数・失敗数・スキップ数）に統一（全4箇所） |

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `skills/coding-test-2review/SKILL.md` | impl-coding-standards をサブエージェント経由で参照 | 低（用語変更のみで振る舞い不変） |
| `agents/kiro/prompts/micro-impl-agent-prompt.md` | impl-coding-standards を activate して使用 | 低（用語変更のみで振る舞い不変） |
| `agents/micro-impl-agent.md` | impl-coding-standards を activate して使用 | 低（用語変更のみで振る舞い不変） |
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | fs-bugfix-phase2-impl を REQUIRED SUB-SKILL として呼び出し | 低（Integration節の番号修正のみでプロセス不変） |
| `skills/fs-bugfix-phase3-final-check/SKILL.md` | fs-bugfix-phase2-impl の後続フェーズとして参照 | 低（影響なし） |
| `skills/fs-refactoring-phase2-candidates/SKILL.md` | fs-refactoring-phase1-status の後続フェーズ | 低（記録項目表現の統一のみで振る舞い不変） |

## シグネチャ変更追跡結果

シグネチャ変更なし（全件文字列修正のみ。Grep追跡対象0件）。

delta-design.md のインターフェース影響サマリに「シグネチャ変更なし。全6件は設計書・ドキュメント内の用語/番号の文字列修正であり、メソッド/関数のインターフェースには一切影響しない」と明記されている。

## テスト対象機能

該当なし（全件ドキュメント/スキル定義の文字列修正。プログラムコード変更なし）。

修正後の文言がスキル実行時に正しく解釈されることの目視確認は可能だが、自動テスト対象となるプログラムコード変更は存在しない。

## 説明対象アクター

該当なし（操作フロー変更なし）。

本変更は既存の用語/番号の正確性修正であり、新機能追加やユーザー操作フローの変更を含まない。したがって、特定アクターへの説明は不要。

## 既存要件・システム要件との矛盾確認

| 確認対象 | 結果 |
|---|---|
| user-requirements.md | 矛盾なし（UR-001, UR-010 に関連するが、振る舞い変更なし。記述の正確性向上のみ） |
| system-requirements.md | 矛盾なし（非機能要件・エラーハンドリング・データ管理等に影響なし） |

## 分析時点の注意事項
- 本分析は差分設計（delta-design.md）QA APPROVED 後の Phase 2 更新版である
- 全6件の変更は非機能変更（文言修正）であり、ワークフローの振る舞い変更を含まない
- シグネチャ変更なし（メソッド/関数のインターフェース変更は一切ない）

## Phase 1 からの変更点

| # | 変更箇所 | Phase 1 記載 | Phase 2 修正 |
|---|---|---|---|
| 1 | 変更対象ファイル表 REQ-C-006行のファイルパス | `skills/fs-refactoring-phase1-status/SKILL.md` | `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` |
| 2 | 変更対象ファイル表 REQ-C-006行の変更概要 | 「記録項目数表現の用語差異を修正（`refactoring-status-checker-prompt.md` との統一）」 | 「記録項目数表現を refactoring-status-checker-prompt.md の表記（総テスト数・パス数・失敗数・スキップ数）に統一（全4箇所）」 |
| 3 | 依存関係表 | `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` を依存ファイルとして記載 | 修正対象そのものであるため依存関係表から削除 |
| 4 | テスト対象機能セクション | 未記載 | 「該当なし」として追加 |
| 5 | 説明対象アクターセクション | 未記載 | 「該当なし」として追加 |
| 6 | シグネチャ変更追跡結果セクション | 未記載 | 「シグネチャ変更0件」として追加 |
| 7 | 既存要件矛盾確認セクション | 未記載 | 「矛盾なし」として追加 |

## 起因元ドキュメントフォルダ
- パス: `.aide/specs/aide-powers/changes/202607021424-remove-regression-test-rename-terms/`
- コミットハッシュ: 3a5ea31482c5d471cd6346c7aee0151f93f79d68
- コミットメッセージ1行目: feat: リグレッションテスト廃止・動作確認Step統合・用語統一（以下省略）
- 検証結果: 関連あり（今回の変更は前回変更WFのスコープ外に残存した旧用語・旧番号を修正するものであり、前回WFの直接的な後続対応である）
