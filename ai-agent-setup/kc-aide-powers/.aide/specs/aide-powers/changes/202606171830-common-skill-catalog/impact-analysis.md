# 影響範囲分析（軽量版）

## 変更種別
**両方**（追加 + 変更）
- 追加: 共通スキル発動条件カタログ（新規ドキュメント）の作成（REQ-C-001, REQ-C-003）
- 変更: global-rules.md へのカタログ参照追加（REQ-C-002）、phase-skill-rules.md の冗長性排除・圧縮（REQ-C-004）

---

## アクター視点の影響分析

### アクター1: AIエージェント（Claude等のLLM）

| 影響ユースケース | 影響内容 | 影響度 |
|---|---|---|
| ワークフロー実行中の共通スキル自律選択 | カタログ参照により、session-handover / doc-index-maintenance / visual-companion / pending-issues-management / tech-investigation / git-commit-workflow / task-orchestration の発動タイミングを機械的に判定可能になる | 高 |
| フェーズスキル実行時のルール適用 | phase-skill-rules.md 圧縮によりルール注入時のノイズが減少。重要ルールの視認性・強制力が向上する | 中 |
| セッション開始時の初期ルール読み込み | global-rules.md にカタログ参照パスが追加されるため、AIが参照すべき情報の所在を認識する経路が増える | 低 |

### アクター2: ユーザー（開発者）

| 影響ユースケース | 影響内容 | 影響度 |
|---|---|---|
| AIによるスキル使い忘れの減少 | カタログ整備によりAIが自律的にスキルを発動する精度が向上し、ユーザーが手動で指示する場面が減少する | 中 |
| ルールファイルの可読性向上 | phase-skill-rules.md 圧縮によりユーザーがルールを確認する際の可読性が向上する | 低 |

**影響ユースケース数: 5件**
**影響アクター数: 2件**

---

## プログラム構成視点の影響分析

### 変更対象ファイル

| # | ファイルパス | 変更種別 | 変更概要 |
|---|---|---|---|
| 1 | `skills/using-aide-powers/references/global-rules.md` | 変更 | カタログドキュメントへの参照パスを追加 |
| 2 | `skills/using-aide-powers/references/phase-skill-rules.md` | 変更 | 冗長表現の排除・圧縮（現176行 → 目標200行以下を維持しつつ重複排除） |
| 3 | 新規ファイル（配置先は approach.md で決定） | 追加 | 共通スキル発動条件カタログ本体 |

**変更対象ファイル数: 3件**（うち新規1件）

### 依存関係（波及影響）

| # | 依存ファイル/仕組み | 影響の波及経路 | 影響内容 |
|---|---|---|---|
| 1 | `.kiro/steering/aide-powers-global-rules.md` | rules-distribute スキルが global-rules.md を各プラットフォームに配布 | global-rules.md 変更後、rules-distribute 経由で自動更新される |
| 2 | `.kiro/steering/aide-powers-phase-skill-rules.md` | rules-distribute スキルが phase-skill-rules.md を各プラットフォームに配布 | phase-skill-rules.md 圧縮後、rules-distribute 経由で自動更新される |
| 3 | `.claude/rules/aide-powers-global-rules.md` | 同上（Claude Code 配布先） | 同上 |
| 4 | `.claude/rules/aide-powers-phase-skill-rules.md` | 同上（Claude Code 配布先） | 同上 |
| 5 | `.cursor/rules/aide-powers-global-rules.mdc` | 同上（Cursor 配布先） | 同上 |
| 6 | `.cursor/rules/aide-powers-phase-skill-rules.mdc` | 同上（Cursor 配布先） | 同上 |
| 7 | `skills/using-aide-powers/references/version.json` | version を上げることで using-aide-powers が `.aide/references/` を最新化 → `.rules-updated` フラグ → rules-distribute が配布 | version bump が必要 |

**依存関係ファイル数: 7件**

### シグネチャ変更の波及

本変更はドキュメント変更（Markdown ファイルの追加・編集）のみであり、プログラム的なシグネチャ変更（関数・クラス・API等）は発生しない。

### 配布メカニズムへの影響

- `rules-distribute` スキルの動作ロジック自体は変更不要（既存の配布機構で対応可能）
- `version.json` の version を上げることで、次回セッション開始時に自動配布される
- カタログが新規ファイルとして追加される場合、rules-distribute の配布対象に含めるか否かは approach.md で判断する（カタログが global-rules.md 内に直接記載される場合は不要）

---

## 起因元ドキュメントフォルダ（git blame）

### 調査結果

| 対象ファイル | 直近 Docs: フッター | ドキュメントフォルダ |
|---|---|---|
| `skills/using-aide-powers/references/global-rules.md` | あり（commit f36256e2） | `.aide/specs/aide-powers/changes/202606111814-large-file-full-read-rule/` |
| `skills/using-aide-powers/references/phase-skill-rules.md` | あり（commit f3660d35） | `.aide/specs/aide-powers/changes/202606151000-remove-signature-verification/` |

### 判定

起因元ドキュメントフォルダは複数存在するが、いずれも本変更とは無関係の過去変更のフォルダである。本変更は独立した新規要求（PI-040 起源）であり、既存の変更フォルダへのマージは不要。

**起因元ドキュメントフォルダ: なし**（本変更は独立した新規要求）

---

## 完了条件チェック

| # | チェック項目 | 結果 |
|---|---|---|
| 1 | 変更種別が判定されている | ✅ PASS（両方: 追加+変更） |
| 2 | アクター視点の影響が記録されている | ✅ PASS（2アクター、5ユースケース） |
| 3 | プログラム構成視点の変更対象が特定されている | ✅ PASS（3ファイル） |
| 4 | 依存関係が特定されている | ✅ PASS（7件） |
| 5 | シグネチャ変更の波及が確認されている | ✅ PASS（なし） |
| 6 | git blame による起因元フォルダが確認されている | ✅ PASS（独立要求のためマージ不要） |
| 7 | 対応方針に踏み込んでいない | ✅ PASS |
| 8 | before→after 設計に踏み込んでいない | ✅ PASS |
