# 差分設計書（program-structure.md 更新） — エージェント数12→13

- **対象:** C9（program-structure.md）
- **親索引:** [delta-design.md](./delta-design.md)

---

## 設計方針（本ファイル固有）

- program-structure.md 内に散在する「12」記述を全て「13」に更新
- フォルダ構成ツリーに新規ファイル4本を追記
- 配布マッピング表の「12」を「13」に更新
- エージェント一覧テーブルに新エージェントを追記

---

## C9: .aide/specs/aide-powers/program-structure.md

### 変更理由
新規エージェント `manual-test-review-agent` の追加に伴い、
プログラム構成書の正本を整合させる必要がある。

---

### 変更箇所1: フォルダ構成ツリー（agents/kiro/prompts/）

**before:**
```
│   │   ├── prompts/                  # サブエージェント用プロンプト（Kiro版）
│   │   │   ├── architecture-qa-agent-prompt.md
│   │   │   ├── code-review-agent-prompt.md
│   │   │   ├── delta-design-qa-agent-prompt.md
│   │   │   ├── design-review-agent-prompt.md
│   │   │   ├── final-design-audit-agent-prompt.md
│   │   │   ├── final-design-qa-agent-prompt.md
│   │   │   ├── micro-impl-agent-prompt.md
│   │   │   ├── object-design-qa-agent-prompt.md
│   │   │   ├── progress-final-checker-prompt.md
│   │   │   ├── progress-updater-prompt.md
│   │   │   ├── requirements-qa-agent-prompt.md
│   │   │   └── test-coverage-audit-agent-prompt.md
```

**after:**
```
│   │   ├── prompts/                  # サブエージェント用プロンプト（Kiro版）
│   │   │   ├── architecture-qa-agent-prompt.md
│   │   │   ├── code-review-agent-prompt.md
│   │   │   ├── delta-design-qa-agent-prompt.md
│   │   │   ├── design-review-agent-prompt.md
│   │   │   ├── final-design-audit-agent-prompt.md
│   │   │   ├── final-design-qa-agent-prompt.md
│   │   │   ├── manual-test-review-agent-prompt.md
│   │   │   ├── micro-impl-agent-prompt.md
│   │   │   ├── object-design-qa-agent-prompt.md
│   │   │   ├── progress-final-checker-prompt.md
│   │   │   ├── progress-updater-prompt.md
│   │   │   ├── requirements-qa-agent-prompt.md
│   │   │   └── test-coverage-audit-agent-prompt.md
```

---

### 変更箇所2: フォルダ構成ツリー（agents/kiro/ 直下の .json + .md）

> **指摘対応:** 挿入位置がアルファベット順に反していた（誤: test-coverage-audit-agent の直前）。"manual-test-review-agent" は "final-design-qa-agent" の後・"micro-impl-agent" の前が正しい位置。

**before:**
```
│   │   ├── final-design-qa-agent.json
│   │   ├── final-design-qa-agent.md
│   │   ├── micro-impl-agent.json
│   │   ├── micro-impl-agent.md
```

**after:**
```
│   │   ├── final-design-qa-agent.json
│   │   ├── final-design-qa-agent.md
│   │   ├── manual-test-review-agent.json
│   │   ├── manual-test-review-agent.md
│   │   ├── micro-impl-agent.json
│   │   ├── micro-impl-agent.md
```

---

### 変更箇所3: フォルダ構成ツリー（agents/ ルート直下）

> **指摘対応:** 挿入位置がアルファベット順に反していた（誤: requirements-qa-agent の直前）。"manual-test-review-agent" は "final-design-qa-agent" の後・"micro-impl-agent" の前が正しい位置。

**before:**
```
│   ├── final-design-qa-agent.md
│   ├── micro-impl-agent.md
```

**after:**
```
│   ├── final-design-qa-agent.md
│   ├── manual-test-review-agent.md
│   ├── micro-impl-agent.md
```

---

### 変更箇所4: `agents/` 解説文

**before:**
```
### `agents/` — エージェント定義

サブエージェントとして呼び出されるAIの定義。12種類のエージェントが存在する。
```

**after:**
```
### `agents/` — エージェント定義

サブエージェントとして呼び出されるAIの定義。13種類のエージェントが存在する。
```

---

### 変更箇所5: エージェント一覧テーブル

**before:**（テーブル末尾）
```
| `test-coverage-audit-agent` | テストカバレッジ監査 |
| `progress-updater` | 進捗ファイル更新 |
| `progress-final-checker` | 進捗最終チェック |
```

**after:**（テーブル末尾）
```
| `manual-test-review-agent` | 動作確認試験書 品質レビュー |
| `test-coverage-audit-agent` | テストカバレッジ監査 |
| `progress-updater` | 進捗ファイル更新 |
| `progress-final-checker` | 進捗最終チェック |
```

---

### 変更箇所6: 配布マッピング表「agents/（ルート直下の12 Markdown）」

**before:**
```
### `agents/`（ルート直下の12 Markdown）
```

**after:**
```
### `agents/`（ルート直下の13 Markdown）
```

---

### 変更箇所7: 配布マッピング表「agents/kiro/*.md（...12エージェント分）」

**before:**
```
### `agents/kiro/*.md`（フロントマター付きMarkdown、12エージェント分）
```

**after:**
```
### `agents/kiro/*.md`（フロントマター付きMarkdown、13エージェント分）
```

---

### 変更箇所8: 配布マッピング表「agents/kiro/*.json（JSON定義、12エージェント分）」

**before:**
```
### `agents/kiro/*.json`（JSON定義、12エージェント分）
```

**after:**
```
### `agents/kiro/*.json`（JSON定義、13エージェント分）
```

---

### 変更箇所9: 「パス3: agents/ 詳細解析」見出し文（L656）

**before:**
```
`agents/` 直下の12個のMarkdownファイル（Claude Code / Copilot CLI / VSCode Copilot 等で使用されるサブエージェント定義）の詳細解析。
```

**after:**
```
`agents/` 直下の13個のMarkdownファイル（Claude Code / Copilot CLI / VSCode Copilot 等で使用されるサブエージェント定義）の詳細解析。
```

---

### 変更箇所10: 「パス3: agents/kiro/ 詳細解析」見出し文（L845）

**before:**
```
`agents/kiro/` ディレクトリは **Kiro IDE / Kiro CLI 専用のサブエージェント定義**を格納する。12エージェント × 3ファイル（MD + JSON + prompts/）= 36ファイルで構成される。
```

**after:**
```
`agents/kiro/` ディレクトリは **Kiro IDE / Kiro CLI 専用のサブエージェント定義**を格納する。13エージェント × 3ファイル（MD + JSON + prompts/）= 39ファイルで構成される。
```

---

### 変更箇所11: JSON ファイルの共通フィールド構造 説明文（L861）

**before:**
```
全12個のJSONファイルは以下の共通構造を持つ:
```

**after:**
```
全13個のJSONファイルは以下の共通構造を持つ:
```

---

### 変更箇所12: MD ファイルのフロントマター共通構造 説明文（L878）

**before:**
```
全12個のMDファイルは以下のフロントマター形式:
```

**after:**
```
全13個のMDファイルは以下のフロントマター形式:
```

---

### 変更箇所13: 「エージェント別詳細解析」節への新規セクション追加（`#### 13. manual-test-review-agent`）

既存の `test-coverage-audit-agent`（#### 12.）のセクション構造に揃え、`#### 12.` の直後に `#### 13.` として新規追加する。

**before:**（末尾セクションの直後は「### エージェント間の役割分担マトリクス」見出しに続く。挿入位置の直前直後を示す）
```
#### 12. test-coverage-audit-agent（動作確認試験書 網羅性監査）

**役割（1行）**: user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する監査エージェント。

**MD フロントマター**:
- `name`: `test-coverage-audit-agent`
- `description`: 実装WF最終チェックで要件と試験項目を照合。試験項目漏れは追記、実装漏れの疑いは「Step1差し戻し推奨」と報告。安易に試験項目漏れと判断しないことが原則。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `test-coverage-audit-agent`
- `description`: 「動作確認試験書 網羅性監査エージェント。user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する。」
- `prompt`: `file://./prompts/test-coverage-audit-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: 安易に「試験項目漏れ」と判断しない。まず実装漏れの可能性を確認し、Step1差し戻し推奨が原則
- 担当: 全要件一覧化、全試験項目一覧化、各要件↔試験項目の照合、❌原因判定（試験項目漏れ vs 実装漏れの疑い）、試験項目漏れ時のmanual-test-plan.md追記、実装漏れ疑い時の報告
- プロセス: 6ステップ（要件一覧化→試験項目一覧化→照合→❌原因判定→試験項目漏れ時追記→結果報告）
- 判定: PASS（全要件カバー）/ NEEDS_IMPL_RECHECK（実装漏れ可能性→Step1差し戻し推奨）/ FIXED_BY_TEST_APPEND（試験項目追記で解消）

---

### エージェント間の役割分担マトリクス
```

**after:**
```
#### 12. test-coverage-audit-agent（動作確認試験書 網羅性監査）

**役割（1行）**: user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する監査エージェント。

**MD フロントマター**:
- `name`: `test-coverage-audit-agent`
- `description`: 実装WF最終チェックで要件と試験項目を照合。試験項目漏れは追記、実装漏れの疑いは「Step1差し戻し推奨」と報告。安易に試験項目漏れと判断しないことが原則。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `test-coverage-audit-agent`
- `description`: 「動作確認試験書 網羅性監査エージェント。user-requirements.md の全要件と manual-test-plan.md の全試験項目を照合し、未カバー要件を検出する。」
- `prompt`: `file://./prompts/test-coverage-audit-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: 安易に「試験項目漏れ」と判断しない。まず実装漏れの可能性を確認し、Step1差し戻し推奨が原則
- 担当: 全要件一覧化、全試験項目一覧化、各要件↔試験項目の照合、❌原因判定（試験項目漏れ vs 実装漏れの疑い）、試験項目漏れ時のmanual-test-plan.md追記、実装漏れ疑い時の報告
- プロセス: 6ステップ（要件一覧化→試験項目一覧化→照合→❌原因判定→試験項目漏れ時追記→結果報告）
- 判定: PASS（全要件カバー）/ NEEDS_IMPL_RECHECK（実装漏れ可能性→Step1差し戻し推奨）/ FIXED_BY_TEST_APPEND（試験項目追記で解消）

#### 13. manual-test-review-agent（動作確認試験書 品質レビュー）

**役割（1行）**: 4WF（実装・バグ修正・変更・リファクタリング）の動作確認Stepで生成された試験書が「ユーザー視点で全動作を検証しているか」をレビューする品質ゲート型エージェント。

**MD フロントマター**:
- `name`: `manual-test-review-agent`
- `description`: 動作確認試験書 品質レビューエージェント。共通4観点（ユーザー操作シナリオか／ユーザー視点の網羅性〔質的〕／目視可能な期待結果か／内部視点混入検出）で評価し、wf_type に応じた追加基準を適用。APPROVED/NEEDS_FIXを返す。Examples付き。
- `tools`: `["@builtin"]`

**JSON フィールド**:
- `name`: `manual-test-review-agent`
- `description`: 「動作確認試験書 品質レビューエージェント。試験書がユーザー視点で全動作を検証しているかを4観点+WF別基準でレビューし、APPROVED/NEEDS_FIXを返す。」
- `prompt`: `file://./prompts/manual-test-review-agent-prompt.md`
- `tools` / `allowedTools`: `["@builtin"]`

**プロンプト本文概要**:
- 最重要原則: 試験書がバックエンドAPI単体試験・ユニットテスト視点に偏っていないかを厳格に評価する。内部実装視点の試験書は APPROVED しない
- 担当: 共通4観点の評価、wf_type別追加基準の評価、APPROVED/NEEDS_FIXの判定、修正可能粒度での指摘明示
- 担当外: 要件×試験項目の1対1突合（量的カバレッジ監査。test-coverage-audit-agent の専任）、試験書の修正実装、試験の実行、設計書との整合性チェック
- プロセス: 4ステップ（入力読込→共通4観点評価→WF別基準評価→判定）
- 判定: APPROVED（指摘0件）/ NEEDS_FIX（指摘1件以上）

---

### エージェント間の役割分担マトリクス
```

---

### 変更箇所14: 「エージェント間の役割分担マトリクス」表への新エージェント行追加

**before:**
```
| test-coverage-audit-agent | — | — | — | ○（試験網羅性） | — |
| progress-updater | — | — | — | — | ○（更新） |
| progress-final-checker | — | — | — | — | ○（最終確認） |
```

**after:**
```
| test-coverage-audit-agent | — | — | — | ○（試験網羅性） | — |
| manual-test-review-agent | — | — | ○（試験書品質） | — | — |
| progress-updater | — | — | — | — | ○（更新） |
| progress-final-checker | — | — | — | — | ○（最終確認） |
```

---

### 変更箇所15: 「3ファイルセットの同一性確認結果」見出し文（L1428）

**before:**
```
全12エージェントについて確認:
```

**after:**
```
全13エージェントについて確認:
```

---

### 変更箇所16: 「agents/ 直下ファイル群の横断的特徴」共通フロントマター構造・エージェント分類（L1514・Examples付き件数）

**before:**
```
**共通するフロントマター構造**:
- 全12ファイルが `name` と `description` フィールドを持つ（Claude Code / Copilot CLI / VSCode Copilot のサブエージェント定義形式）。
- `tools` フィールドを持つファイルは0件（全て未定義。ビルトインツールを使用する前提）。
- `description` には Examples セクション（`<example>...</example>` 形式）を含むものが10件（progress-final-checker、progress-updater を除く）。

**エージェント分類**:
| カテゴリ | エージェント | 主な呼び出し元 |
|---|---|---|
| QAレビューアー（設計書品質検証、ゲート判定） | architecture-qa, object-design-qa, final-design-qa, requirements-qa, delta-design-qa | 各WFのフェーズスキル（ゲート完了時） |
| コードレビューアー（実装品質検証） | code-review, design-review | multi-stage-code-review スキル（実装タスク完了後） |
| 最終監査（横断監査・タスク化） | final-design-audit, test-coverage-audit | fs-impl-phase5-final-check（実装WF最終チェック） |
| 実装専任 | micro-impl | coding-test-2review スキル |
| 進捗管理 | progress-updater, progress-final-checker | 各WFのフェーズスキル（前処理・後処理） |
```

**after:**
```
**共通するフロントマター構造**:
- 全13ファイルが `name` と `description` フィールドを持つ（Claude Code / Copilot CLI / VSCode Copilot のサブエージェント定義形式）。
- `tools` フィールドを持つファイルは0件（全て未定義。ビルトインツールを使用する前提）。
- `description` には Examples セクション（`<example>...</example>` 形式）を含むものが11件（progress-final-checker、progress-updater を除く）。

**エージェント分類**:
| カテゴリ | エージェント | 主な呼び出し元 |
|---|---|---|
| QAレビューアー（設計書品質検証、ゲート判定） | architecture-qa, object-design-qa, final-design-qa, requirements-qa, delta-design-qa | 各WFのフェーズスキル（ゲート完了時） |
| コードレビューアー（実装品質検証） | code-review, design-review | multi-stage-code-review スキル（実装タスク完了後） |
| 最終監査（横断監査・タスク化） | final-design-audit, test-coverage-audit | fs-impl-phase5-final-check（実装WF最終チェック） |
| 試験書品質レビュー | manual-test-review | 4WFの動作確認Step（試験書作成直後の品質ゲート） |
| 実装専任 | micro-impl | coding-test-2review スキル |
| 進捗管理 | progress-updater, progress-final-checker | 各WFのフェーズスキル（前処理・後処理） |
```

---

### 変更箇所17: 「パス3整合性チェック結果」節 重複記載表（L2584）

**before:**
```
| 「パス3: agents/ 詳細解析」と「パス3: agents/kiro/ 詳細解析」 | 12エージェントが2箇所で記載。前者=Claude Code版（`agents/*.md`）、後者=Kiro版（`agents/kiro/*.md` + `.json` + `prompts/`） | **正当**（実ファイルが別々に存在するため） |
```

**after:**
```
| 「パス3: agents/ 詳細解析」と「パス3: agents/kiro/ 詳細解析」 | 13エージェントが2箇所で記載。前者=Claude Code版（`agents/*.md`）、後者=Kiro版（`agents/kiro/*.md` + `.json` + `prompts/`） | **正当**（実ファイルが別々に存在するため） |
```

---

### 変更箇所18: 「パス3整合性チェック結果」節 構造的重複所見文（L2587）

**before:**
```
構造的重複（同一情報の不要な繰り返し）は検出されなかった。ファイルサイズが大きい（187KB/2541行）のは、78スキル + 12エージェント × 複数プラットフォーム + 7WF全フェーズの網羅的記録による自然な結果。
```

**after:**
```
構造的重複（同一情報の不要な繰り返し）は検出されなかった。ファイルサイズが大きい（187KB/2541行）のは、78スキル + 13エージェント × 複数プラットフォーム + 7WF全フェーズの網羅的記録による自然な結果。
```

---

### 変更箇所19: `#### fs-impl-phase4-execution` の呼び出しエージェント・プロンプトテンプレート欄

> **指摘対応:** delta-design-skill-steps.md（C1）で定義した `manual-test-review-agent` の呼び出しと、Step2の3工程再構成（工程①試験書作成／工程③試験実行）が、program-structure.md本体のプロセス構成節に反映されていなかった。

**before:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, pending-issues-management
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `impl-verification-prompt.md`（Step2 動作確認サブエージェント委譲）
```

**after:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, pending-issues-management
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `impl-verification-prompt.md`（Step2 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

---

### 変更箇所20: `#### fs-bugfix-phase2-impl` の呼び出しエージェント・プロンプトテンプレート欄

> **指摘対応:** delta-design-skill-steps.md（C2）で定義した `manual-test-review-agent` の呼び出しと、Step10の3工程再構成が、program-structure.md本体に反映されていなかった。

**before:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `bugfix-doc-syncer-prompt.md`（Step11）, `bugfix-verification-prompt.md`（Step10 動作確認サブエージェント委譲）
```

**after:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step10 工程②）
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `bugfix-doc-syncer-prompt.md`（Step11）, `bugfix-verification-prompt.md`（Step10 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

---

### 変更箇所21: `#### fs-change-phase2-impl` の呼び出しエージェント・プロンプトテンプレート欄

> **指摘対応:** delta-design-skill-steps.md（C3）で定義した `manual-test-review-agent` の呼び出しと、Step12の3工程再構成が、program-structure.md本体に反映されていなかった。加えて既存記載には2箇所のStep番号表記の誤りがあった。実ファイル（skills/fs-change-phase2-impl/SKILL.md）で確認した正しいStep対応は次の通り: `change-verification-prompt.md` = **Step 12**（動作検証・ユーザー確認）、`change-doc-syncer-prompt.md` = **Step 13**（設計書反映）。旧記載では `change-verification-prompt.md`（Step13）、`change-doc-syncer-prompt.md`（Step12）と誤って記載されていたため、afterでは両方を正しいStep番号（`change-verification-prompt.md`=Step12、`change-doc-syncer-prompt.md`=Step13）に訂正した。これにより delta-design-skill-steps.md（C3）のafter記載（`change-doc-syncer-prompt.md`=Step13）と整合する。

**before:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `change-doc-syncer-prompt.md`（Step12）, `change-verification-prompt.md`（Step13 動作確認サブエージェント委譲）
```

**after:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step12 工程②）
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `change-doc-syncer-prompt.md`（Step13）, `change-verification-prompt.md`（Step12 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

---

### 変更箇所22: `#### fs-refactoring-phase5-impl` の呼び出しエージェント・プロンプトテンプレート欄

> **指摘対応:** delta-design-skill-steps.md（C4）で定義した `manual-test-review-agent` の呼び出しと、Step3の3工程再構成が、program-structure.md本体に反映されていなかった。

**before:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `refactoring-verification-prompt.md`（Step3 動作確認サブエージェント委譲）
```

**after:**
```
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- 呼び出しエージェント: manual-test-review-agent（Step3 工程②）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `refactoring-verification-prompt.md`（Step3 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

---

*本ファイルは [delta-design.md](./delta-design.md) の分割ファイルである。*
