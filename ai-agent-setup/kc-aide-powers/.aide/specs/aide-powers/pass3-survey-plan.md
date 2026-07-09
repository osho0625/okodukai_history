# パス3 調査計画

## プロジェクト規模

**大規模**（ソースファイル数: 430、うち除外対象外: 430）

内訳:
- skills/: 224ファイル（78フォルダ）
- agents/: 48ファイル
- docs-dev/: 44ファイル
- .github/: 78ファイル（skills/ のミラー含む）
- docs/: 6ファイル
- hooks/: 4ファイル
- .apm/: 3ファイル
- .claude-plugin/: 2ファイル
- rules/: 2ファイル
- steering/: 1ファイル
- instructions/: 1ファイル
- .claude/: 1ファイル
- .codex/: 1ファイル
- .vscode/: 1ファイル
- ルートファイル: 14ファイル

---

## パス2 解析状況の評価

program-structure.md には以下がパス2で記載済み:
- **フォルダレベルの役割説明**: 全主要フォルダの概要（skills/, agents/, docs-dev/, hooks/ 等）
- **エージェント12種の名前と役割テーブル**: 完了
- **設定ファイル概要テーブル**: 完了
- **配布マッピング表**: 完了（setup.bat準拠）
- **起動フロー図**: 完了
- **ファイル命名規則**: 完了

**パス2で未到達の個別ファイル解析**:
- skills/ 内78フォルダの各 SKILL.md 及びプロンプトファイルの個別役割
- agents/ 内48ファイルの個別内容詳細
- docs-dev/ 内44ファイルの個別内容
- hooks/ 内4ファイルの設定詳細
- .github/skills/ の37フォルダ（skills/ のサブセットミラー）
- ルートのスクリプト群の詳細ロジック

---

## 調査ステップ一覧

### 優先度高: ハブスキル・フェーズスキル・共通スキル

| ステップ | ディレクトリ | ファイル数 | パス2解析済み | 未済 | 備考 |
|---|---|---|---|---|---|
| 1 | skills/using-aide-powers/ | 12 | 0 | 12 | ハブスキル（エントリポイント） |
| 2 | skills/fs-planning-phase{1-4}-*/ | 16 | 0 | 16 | 企画WF（4フォルダ） |
| 3 | skills/fs-design-phase{1-11}-*/ | 37 | 0 | 37 | 設計WF（11フォルダ） |
| 4 | skills/fs-impl-phase{1-7}-*/ | 24 | 0 | 24 | 実装WF（7フォルダ） |
| 5 | skills/fs-reverse-phase{1-6}-*/ | 24 | 0 | 24 | 逆引きWF（6フォルダ） |
| 6 | skills/fs-change-phase{1-3}-*/ | 15 | 0 | 15 | 変更WF（3フォルダ） |
| 7 | skills/fs-bugfix-phase{1-3}-*/ | 13 | 0 | 13 | バグ修正WF（3フォルダ） |
| 8 | skills/fs-refactoring-phase{1-7}-*/ | 22 | 0 | 22 | リファクタリングWF（7フォルダ） |
| 9 | skills/（共通スキル36個） | 61 | 0 | 61 | git-commit-workflow, task-orchestration 等 |

### 優先度高: エージェント定義

| ステップ | ディレクトリ | ファイル数 | パス2解析済み | 未済 | 備考 |
|---|---|---|---|---|---|
| 10 | agents/（ルート直下12 MD） | 12 | 0 | 12 | Claude Code 用エージェント定義 |
| 11 | agents/kiro/（MD+JSON+prompts/） | 36 | 0 | 36 | Kiro IDE/CLI 用エージェント定義 |

### 優先度中: 開発者ドキュメント・フック・APM

| ステップ | ディレクトリ | ファイル数 | パス2解析済み | 未済 | 備考 |
|---|---|---|---|---|---|
| 12 | docs-dev/01-system-platform/ | 14 | 0 | 14 | プラットフォーム層設計 |
| 13 | docs-dev/02-ai-agent/ | 24 | 0 | 24 | AIエージェント層設計 |
| 14 | docs-dev/03-how-to/ | 5 | 0 | 5 | 拡張ガイド |
| 15 | docs-dev/00-overview.md | 1 | 0 | 1 | docs-dev トップレベル概要 |
| 16 | hooks/ | 4 | 0 | 4 | セッションフック |
| 17 | .apm/instructions/ | 3 | 0 | 3 | APM 配布用 instructions |

### 優先度低: ユーザードキュメント・ルール・ミラー・ルートファイル

| ステップ | ディレクトリ | ファイル数 | パス2解析済み | 未済 | 備考 |
|---|---|---|---|---|---|
| 18 | docs/ | 6 | 0 | 6 | ユーザー向けドキュメント |
| 19 | steering/ | 1 | 0 | 1 | ステアリング |
| 20 | rules/ | 2 | 0 | 2 | プラットフォーム固有ルール |
| 21 | instructions/ | 1 | 0 | 1 | Copilot用 instructions |
| 22 | .claude-plugin/ | 2 | 0 | 2 | VSCode Agent Plugin |
| 23 | .claude/rules/ | 1 | 0 | 1 | Claude Code ワークスペースルール |
| 24 | .codex/ | 1 | 0 | 1 | Codex設定 |
| 25 | .vscode/ | 1 | 0 | 1 | VSCode設定 |
| 26 | ルートファイル群 | 14 | 0 | 14 | setup.bat, README.md 等 |
| 27 | .github/（hooks+instructions+skills） | 78 | 0 | 78 | ※skills/のサブセットミラー |

---

## 分割判定結果

### skills/（78フォルダ、224ファイル）→ 9ステップに分割

skills/ はサブフォルダ78個で、10個を大幅に超えるため以下のように分割:

| 分割グループ | フォルダ数 | ファイル数 | 分割根拠 |
|---|---|---|---|
| ステップ1: using-aide-powers（ハブ） | 1 | 12 | 最重要エントリポイント |
| ステップ2: fs-planning-phase* | 4 | 16 | 企画WF |
| ステップ3: fs-design-phase* | 11 | 37 | 設計WF（最多フェーズ） |
| ステップ4: fs-impl-phase* | 7 | 24 | 実装WF |
| ステップ5: fs-reverse-phase* | 6 | 24 | 逆引きWF |
| ステップ6: fs-change-phase* | 3 | 15 | 変更WF |
| ステップ7: fs-bugfix-phase* | 3 | 13 | バグ修正WF |
| ステップ8: fs-refactoring-phase* | 7 | 22 | リファクタリングWF |
| ステップ9: 共通スキル36個 | 36 | 61 | 横断ユーティリティ |

### agents/kiro/（36ファイル）→ 1ステップで対応可

MD 12 + JSON 12 + prompts/ 12 = 36ファイル。サブフォルダは `prompts/` 1つのみ。分割不要。

### docs-dev/（44ファイル）→ 4ステップに分割

| 分割グループ | フォルダ/ファイル数 | 分割根拠 |
|---|---|---|
| ステップ12: 01-system-platform/ | 14 | プラットフォーム層 |
| ステップ13: 02-ai-agent/ | 24 | AIエージェント層（4サブフォルダ） |
| ステップ14: 03-how-to/ | 5 | 拡張ガイド |
| ステップ15: 00-overview.md | 1 | トップレベル概要 |

### .github/skills/（37フォルダ、72ファイル）→ スキップ推奨

`.github/skills/` は `skills/` の共通スキル + ハブスキルのミラー（`setup-local.bat` で配置）。
内容は `skills/` と同一のため、**ステップ9のスキル解析で代替可能**。
差異確認のみ実施し、重複解析は省略する。

---

## 調査における注意事項

1. **SKILL.md が本体**: 各スキルフォルダの中核は `SKILL.md`。これを読めばスキルの振る舞いが分かる
2. **プロンプトファイル（*-prompt.md）**: サブエージェント用指示。SKILL.md から参照される
3. **SKILL-old.md**: 旧バージョン（一部フォルダに残存）。解析対象に含めるが「旧版」と明記
4. **references/**: ツールマップや定義ファイル。`using-aide-powers/references/` に集中
5. **scripts/**: 実行可能スクリプト。`visual-companion/scripts/` のみに存在
6. **.github/skills/**: `skills/` のミラーのため差異確認のみ

---

## パス2で解析済みのファイル一覧

program-structure.md ではフォルダ単位の構造説明・役割テーブル・配布マッピングが記載済みだが、
**個別ファイルの詳細な役割解析（各 SKILL.md の内容要約、各エージェントの具体的な振る舞い等）は未実施**。

以下はパス2でフォルダレベルの説明が完了しているディレクトリ（パス3では個別ファイル解析が必要）:

- skills/（構造パターン説明済み、個別スキル内容未解析）
- agents/（12種のエージェント名・役割表あり、個別ファイル内容未解析）
- agents/kiro/（Kiro IDE/CLI 形式差異の説明済み、個別内容未解析）
- agents/kiro/prompts/（存在と参照方法の説明済み、個別内容未解析）
- docs-dev/（3層構造の説明済み、個別ファイル内容未解析）
- hooks/（ファイル名記載済み、設定内容未解析）
- .apm/instructions/（ファイル名記載済み、内容未解析）
- docs/（ファイル名記載済み、内容未解析）
- steering/（ファイル名記載済み、内容未解析）
- rules/（ファイル名記載済み、内容未解析）
- instructions/（ファイル名記載済み、内容未解析）
- .claude-plugin/（ファイル名記載済み、内容未解析）
- .claude/rules/（ファイル名記載済み、内容未解析）
- .codex/（ファイル名記載済み、内容未解析）
- .vscode/（ファイル名記載済み、内容未解析）
- .github/（構造説明済み、個別内容未解析）
- ルートファイル群（ファイル名記載済み、スクリプト内容未解析）

---

## skills/ フォルダ内の全ファイル詳細（調査対象）

### ステップ1: using-aide-powers（ハブスキル）
- skills/using-aide-powers/SKILL.md
- skills/using-aide-powers/references/version.json
- skills/using-aide-powers/references/global-rules.md
- skills/using-aide-powers/references/phase-skill-rules.md
- skills/using-aide-powers/references/progress-file-format.md
- skills/using-aide-powers/references/common-skill-catalog.md
- skills/using-aide-powers/references/kiro-ide-tools.md
- skills/using-aide-powers/references/kiro-cli-tools.md
- skills/using-aide-powers/references/copilot-tools.md
- skills/using-aide-powers/references/vscode-copilot-tools.md
- skills/using-aide-powers/references/codex-tools.md
- skills/using-aide-powers/references/gemini-tools.md

### ステップ2: fs-planning-phase*（企画WF 4フォルダ）
- skills/fs-planning-phase1-intake-and-init/（5ファイル）
- skills/fs-planning-phase2-explore/（5ファイル）
- skills/fs-planning-phase3-finalize/（4ファイル）
- skills/fs-planning-phase4-final-check/（2ファイル）

### ステップ3: fs-design-phase*（設計WF 11フォルダ）
- skills/fs-design-phase1-user-req/（3ファイル）
- skills/fs-design-phase2-system-req/（3ファイル）
- skills/fs-design-phase3-dev-plan/（3ファイル）
- skills/fs-design-phase4-architecture/（3ファイル）
- skills/fs-design-phase5-gui/（3ファイル）
- skills/fs-design-phase6-usecase/（7ファイル）
- skills/fs-design-phase7-ddd/（3ファイル）
- skills/fs-design-phase8-object/（4ファイル）
- skills/fs-design-phase9-infra/（3ファイル）
- skills/fs-design-phase10-program/（3ファイル）
- skills/fs-design-phase11-final-check/（2ファイル）

### ステップ4: fs-impl-phase*（実装WF 7フォルダ）
- skills/fs-impl-phase1-gate/（2ファイル）
- skills/fs-impl-phase2-preparation/（5ファイル）
- skills/fs-impl-phase3-gui-mockup/（4ファイル）
- skills/fs-impl-phase4-execution/（6ファイル）
- skills/fs-impl-phase5-final-check/（2ファイル）
- skills/fs-impl-phase6-doc-generation/（3ファイル）
- skills/fs-impl-phase7-final-check/（2ファイル）

### ステップ5: fs-reverse-phase*（逆引きWF 6フォルダ）
- skills/fs-reverse-phase1-program/（6ファイル）
- skills/fs-reverse-phase2-dev-env/（3ファイル）
- skills/fs-reverse-phase3-system-req/（3ファイル）
- skills/fs-reverse-phase4-user-req/（3ファイル）
- skills/fs-reverse-phase5-optional-phases/（7ファイル）
- skills/fs-reverse-phase6-final-check/（2ファイル）

### ステップ6: fs-change-phase*（変更WF 3フォルダ）
- skills/fs-change-phase1-analysis/（7ファイル）
- skills/fs-change-phase2-impl/（6ファイル）
- skills/fs-change-phase3-final-check/（2ファイル）

### ステップ7: fs-bugfix-phase*（バグ修正WF 3フォルダ）
- skills/fs-bugfix-phase1-analysis/（6ファイル）
- skills/fs-bugfix-phase2-impl/（5ファイル）
- skills/fs-bugfix-phase3-final-check/（2ファイル）

### ステップ8: fs-refactoring-phase*（リファクタリングWF 7フォルダ）
- skills/fs-refactoring-phase1-status/（3ファイル）
- skills/fs-refactoring-phase2-candidates/（3ファイル）
- skills/fs-refactoring-phase3-plan/（3ファイル）
- skills/fs-refactoring-phase4-design/（3ファイル）
- skills/fs-refactoring-phase5-impl/（5ファイル）
- skills/fs-refactoring-phase6-doc/（3ファイル）
- skills/fs-refactoring-phase7-final-check/（2ファイル）

### ステップ9: 共通スキル（36フォルダ）
- skills/aide-powers-guide/（1ファイル）
- skills/code-quality-review/（1ファイル）
- skills/coding-test-2review/（4ファイル）
- skills/ddd-modeling/（2ファイル）
- skills/design-gate/（3ファイル）
- skills/design-qa-dispatch/（1ファイル）
- skills/design-sync/（1ファイル）
- skills/doc-index-maintenance/（1ファイル）
- skills/doc-sync/（1ファイル）
- skills/error-handling-review/（1ファイル）
- skills/folder-merge-check/（1ファイル）
- skills/git-commit-workflow/（1ファイル）
- skills/gui-design/（3ファイル）
- skills/impl-coding-standards/（1ファイル）
- skills/impl-task-planning/（2ファイル）
- skills/import-review/（1ファイル）
- skills/infra-interface-design/（2ファイル）
- skills/multi-stage-code-review/（1ファイル）
- skills/object-design/（2ファイル）
- skills/pending-issues-management/（1ファイル）
- skills/phase-report-check/（1ファイル）
- skills/program-structure-design/（2ファイル）
- skills/progress-resume-check/（1ファイル）
- skills/rules-distribute/（1ファイル）
- skills/screenshot-capture/（1ファイル）
- skills/session-handover/（1ファイル）
- skills/step-history-writer/（1ファイル）
- skills/system-requirements-definition/（3ファイル）
- skills/task-orchestration/（1ファイル）
- skills/tech-investigation/（2ファイル）
- skills/test-review/（1ファイル）
- skills/toolmap-verifier/（1ファイル）
- skills/usecase-analysis/（1ファイル）
- skills/user-profile-management/（1ファイル）
- skills/user-requirements-definition/（3ファイル）
- skills/visual-companion/（9ファイル: SKILL.md + scripts/7ファイル）

---

## 合計サマリー

| 項目 | 数値 |
|---|---|
| 調査ステップ総数 | 27 |
| 総ファイル数（除外対象外） | 430 |
| パス2解析済み（個別ファイルレベル） | 0 |
| パス3で要解析 | 430 |
| 分割が必要だったディレクトリ | skills/（→9分割）、docs-dev/（→4分割） |
| スキップ推奨 | .github/skills/（skills/ のミラーのため差異確認のみ） |

---

**パス3調査計画完了**
