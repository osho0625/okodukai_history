# 変更要求定義

## 変更概要
- **変更の目的・背景**: aide-agent（オーケストレータエージェント）関連ファイルの運用がプラットフォームのデフォルト Agent で正常に動作しないため、これらを削除し、プラットフォームのデフォルト Agent が using-aide-powers スキルの指示に従って直接動作する形に戻す。aide-agent を専用エージェントとして定義・注入する方式は、Kiro IDE のネスト実行制限等の問題により期待通りに機能しなかった。
- **変更種別**: 変更（既存の振る舞いを変更）

## 要求事項

### REQ-C-001: aide-agent 関連ファイルの削除
- **種別**: 変更
- **説明**: aide-agent のオーケストレータ定義・ステアリング注入に関する以下のファイルを削除する。
  - `steering/aide-agent.md`（リポジトリ内ステアリングファイル）
  - `.kiro/steering/aide-agent.md`（Kiro IDE 配布先ステアリング）
  - `agents/aide-agent.md`（エージェント定義本体）
  - `.kiro/agents/aide-agent.json`（Kiro CLI 用エージェント JSON）
- **受入基準**:
  - AC-001: 上記4ファイルがリポジトリ内に存在しないこと
  - AC-002: ファイル削除後、プロジェクトの他ファイルで参照エラー（ファイルが見つからない等の実行時エラー）が発生しないこと
- **優先度**: 必須

### REQ-C-002: aide-agent 参照箇所の更新
- **種別**: 変更
- **説明**: aide-agent を参照している以下のファイル内の記述を、プラットフォームのデフォルト Agent が using-aide-powers スキルの指示に直接従う形に更新する。
  - `steering/aide-powers-bootstrap.md`（aide-agent steering 読み込み指示の削除）
  - `skills/using-aide-powers/SKILL.md`（エージェント切り替えガード記述の削除・修正）
  - `setup.bat`（aide-agent.md コピー処理の削除）
  - `rules/aide-powers-bootstrap.md`（aide-agent 切り替え指示の修正）
  - `rules/aide-powers-bootstrap.mdc`（aide-agent 切り替え指示の修正）
  - `instructions/aide-powers-bootstrap.instructions.md`（aide-agent 切り替え指示の修正）
- **受入基準**:
  - AC-003: 上記ファイル内に `aide-agent` への参照（ファイル読み込み指示・切り替え指示）が残っていないこと
  - AC-004: 更新後の各ブートストラップファイルが「using-aide-powers スキルを activate してその指示に従う」旨の記述になっていること
- **優先度**: 必須

### REQ-C-003: 設計ドキュメントの更新
- **種別**: 変更
- **説明**: `program-structure.md` 内の aide-agent に関する記述（フォルダツリー、エージェント一覧表、動作フロー図、aide-agent が agents/kiro/ に存在しない理由セクション等）を、aide-agent が存在しない状態に合わせて更新する。
- **受入基準**:
  - AC-005: `program-structure.md` の記述が aide-agent 削除後の実態と一致していること
  - AC-006: オーケストレータ動作の説明が「プラットフォームのデフォルト Agent が using-aide-powers を activate して動作する」形に更新されていること
- **優先度**: 必須

## 対象外（スコープ外）
- 新しいエージェント機構の導入（aide-agent の代替となる新たなカスタムエージェント定義の作成）
- using-aide-powers スキル自体のロジック変更（既存スキルの振る舞いは維持）
- 他のサブエージェント（micro-impl-agent, code-review-agent 等）への変更
- Kiro IDE 以外のプラットフォーム固有の対応（Claude Code 用 agents/ 等は影響範囲分析で判断）

## 前提条件
- プラットフォームのデフォルト Agent が using-aide-powers スキルを直接 activate して動作できること（既にこの動作は確認済み）
- aide-agent 削除後もサブエージェント（invoke_sub_agent）の呼び出しは、デフォルト Agent から直接実行可能であること

## 関連する既存要件
- `program-structure.md` §エージェント定義一覧: aide-agent がオーケストレータとして定義されている
- `program-structure.md` §動作フロー: bootstrap → aide-agent steering → ワークフロー実行の流れが定義されている
- `program-structure.md` §aide-agent が agents/kiro/ に存在しない理由: Kiro IDE のネスト実行制限に関する設計判断が記載されている
- `dev-environment.md` §14: design-gate 免除（program-structure.md は PASS 相当）
