---
name: fs-planning-phase1-intake-and-init
description: "Use when starting a planning workflow to collect initial information from the user, structure existing materials, and initialize the planning proposal template."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# fs-planning-phase1-intake-and-init（企画ワークフロー: 初期ヒアリング・テンプレート初期化）

## Overview

企画ワークフローの先頭フェーズスキル。ユーザーへの初期ヒアリング（7項目）、既存資料の構造化、ユーザー技術レベルの初期判定、session-notes の作成、企画書テンプレートの初期化、方向性確認までを1つのフェーズとして実行する。

**Core principle:** ユーザーの漠然としたアイデアの核を掴み、対話の土台を作り、開発企画書の骨格を作成せよ。詳細に踏み込まず、全体像を掴むことが目的。

ワークフローは単なる中継役ではなく、**ユーザーの相談相手・アイデアの壁打ち相手**として機能する。

---

## The Iron Law（企画ワークフロー共通）

先頭フェーズスキルとして、企画ワークフロー全体に適用される Iron Law を配置する。

```
HEARING FIRST. NO AUTONOMOUS DECISIONS.
AIが勝手にアイデアや方針を決定してはならない。
必ずユーザーにヒアリングしてから決定せよ。
ただし、積極的な提案は推奨する。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 構造化済み資料 | `.aide/specs/{feature_name}/source-materials/{資料名}.md` | ユーザー提供資料の構造化結果 |
| セッションメモ | `.aide/specs/{feature_name}/session-notes.md` | ヒアリング内容の構造化記録 |
| 開発企画書 | `.aide/specs/{feature_name}/planning-proposal.md` | 企画書テンプレート初期版 |
| ドキュメントインデックス | `.aide/specs/{feature_name}/doc-index.md` | 成果物のインデックス |
| 進捗管理 | `.aide/specs/{feature_name}/planning-progress.md` | フェーズ進捗状態 |

---


### ヒアリング優先

- AIが勝手にアイデアや方針を決定しない。必ずユーザーにヒアリングしてから決定する
- 不明点があれば推測せず質問する
- ただし、積極的に提案することは推奨する（「こんなこともできますよ」「こうするともっと良くなりますよ」）

### ユーザーへの質問は平易な言葉で

- 中学生がわかりそうな表現を使うこと。ユーザーは非エンジニアの可能性がある
- 専門用語をそのまま質問に使わない。企画書の項目名とユーザーへの質問は別物。例:
  - ✕「関連ビジネスロジックを教えてください」→ ◯「どんな仕事やシーンで使うものですか？」
  - ✕「非機能要件はありますか？」→ ◯「速さや安定性で気になることはありますか？」
  - ✕「データフローを教えてください」→ ◯「データはどこから来て、どこに出しますか？」
- ユーザーの回答を企画書に記載する際は、適切な専門用語に変換してよい（ただし元の意図を改変しない）
- `user-profile.md` のスコアが4〜5の軸については、その軸に関する専門用語は使ってよい

### 質問は1つずつ

- 質問は1つずつ投げること。複数の質問を一度にまとめて投げない
- ユーザーの回答を受けてから次の質問に進む

### ワークフローの役割（相談相手として）

- **専門用語の補足**: ユーザーの技術レベル（user-profile.md）に応じて、専門用語を平易な言葉で補足する
- **判断材料の提供**: 選択肢が出た場合、各選択肢のメリット・デメリットを添える
- **積極的な提案**: 技術調査の結果から新たな可能性を見つけたら、随時ユーザーに提案する
- **質問への直接回答**: ユーザーが用語の意味や技術概念について質問した場合、ワークフロー自身が回答する

### 禁止事項

- ワークフローが**企画判断を代行する**ことは禁止（判断材料は提供するが、決定はユーザーが行う）
- サブエージェントの出力を**何も補足せずそのまま転送する**だけの中継は避ける
- ユーザーの回答を**改変してサブエージェントに渡す**ことは禁止


### テンプレート運用ルール

1. 必須フィールドの省略禁止: テンプレートの全フィールドを埋めること
2. 余計な情報の追加禁止: テンプレートに定義されていない情報は渡さない
3. 成果物パスの明示: ファイルパスは `.aide/specs/{feature_name}/` からの完全パスで指定する

### 成果物内のドキュメント間リンク

- `.aide/specs/{feature_name}/` 配下の成果物内で他のドキュメントファイル名を記述する際は、相対パスのリンクを付けること

---

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-planning-phase1-intake-and-init
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

---

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
   - 入力:
     - progress_file_path: `.aide/specs/{feature_name}/planning-progress.md`
     - workflow_name: planning
   - 戻り値に基づく分岐:
     - RESUME_FROM N → N が本フェーズなら Step 1 から再開、N が後続フェーズなら該当フェーズスキルへ遷移
     - START_FRESH → Step 1 へ
     - ALL_COMPLETED → 全フェーズ完了済み。ユーザーに案内し終了
3. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 初期ヒアリング（7項目を1つずつ）
- 以下を1つずつ質問する（質問は平易な言葉で）:
  1. 何を作りたいのか（ざっくりとした目的）
  2. どんな出来上がりをイメージしているか
  3. なぜそれが必要なのか（背景・動機）
  4. 誰が使うのか（対象ユーザー）
  5. どんな仕事やシーンで使うものか（→ 企画書では「関連ビジネスロジック」として記載。ユーザーには「ビジネスロジック」という言葉は使わない）
  6. 誰かから依頼されたものか（依頼者がいる場合、会話内容や議事録の有無を確認）
  7. 具体的にどんな機能が必要か（思いつく範囲で）
- ※ この段階では詳細に踏み込まない。全体像を掴むことが目的

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `step1`, step_title: `初期ヒアリング（7項目を1つずつ）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 既存資料の構造化（条件付き）
- ユーザーが資料を提供した場合:
  - Task で source-material-organizer サブエージェントをディスパッチ（source-material-organizer-prompt.md を使用）
  - 構造化結果を `.aide/specs/{feature_name}/source-materials/` に格納
- ユーザーが資料を提供しなかった場合:
  - このステップをスキップ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `step2`, step_title: `既存資料の構造化（条件付き）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: session-notes.md の作成
- ヒアリングで得た情報を以下のカテゴリで構造化して記録:
  - 確定事項: ユーザーが明確に決定した内容
  - 検討中: まだ結論が出ていない内容
  - 技術調査依頼: 調査が必要な技術要素
  - 提案事項: AIから提案してユーザーの反応を待つ内容
  - 却下事項: 検討の結果、採用しないことになった内容
- ※ 各エントリには日時（またはサイクル番号）を付ける
- ※ ワークフローが Write で直接作成する（メタ情報のため）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `step3`, step_title: `session-notes.md の作成`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: 企画書テンプレート初期化
- Task で proposal-writer-init サブエージェントをディスパッチ（proposal-writer-init-prompt.md を使用）
- session-notes.md と構造化済み資料を渡す
- `.aide/specs/{feature_name}/planning-proposal.md` を作成

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `step4`, step_title: `企画書テンプレート初期化`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: ユーザー承認
- 初期化された企画書をユーザーに提示する
- 「この方向性で進めてよいですか？」と確認
- ユーザーの合意を得る
- 合意なし → 修正して再提示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `step5`, step_title: `ユーザー承認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: `fs-planning-phase2-explore (aide-powers skill)`）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase1-intake-and-init`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下のすべてを満たすこと:

1. **ヒアリング完了**: 7項目の質問への回答が得られていること
2. **資料構造化完了**: ユーザーが提供した資料がある場合、`source-materials/` に構造化済みであること
3. **テンプレート初期化完了**: `planning-proposal.md` が作成されていること
4. **方向性確認完了**: ユーザーが企画書の方向性を確認していること
- 進捗ファイル（planning-progress.md）が `progress-resume-check (aide-powers skill)` の戻り値に応じて適切に取り扱われている
  - START_FRESH の場合: progress-file-format.md §6.1 / §7.1 に従って新規作成済み
  - RESUME_FROM N / ALL_COMPLETED の場合: 既存進捗ファイルを上書きせず、戻り値に応じた分岐処理が実行済み



---

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。fs-planning-phase1-intake-and-init のルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「ヒアリングは省略して、ユーザーの最初の発言だけで企画書を作ろう」 | 7項目のヒアリングは全体像を掴むために必須。最初の発言だけでは情報が不足する |
| 「質問を一度にまとめて投げよう」 | 質問は1つずつ投げるルール。まとめて投げるとユーザーが混乱する |
| 「ユーザーが提供した資料を自分で読んで要約しよう」 | 資料の構造化は source-material-organizer に委譲する。ワークフローが直接処理しない |
| 「planning-proposal.md を直接書こう」 | 成果物の作成は proposal-writer に委譲する。ワークフローは直接作成しない |
| 「この段階で技術的な詳細を深掘りしよう」 | このフェーズの目的は全体像を掴むこと。詳細は探索サイクル（fs-planning-phase2-explore (aide-powers skill)）で行う |
| 「ユーザーの技術レベルを直接聞こう」 | 技術レベルは会話内容から推定する。直接聞かない |
| 「方向性確認は不要だろう」 | テンプレート初期化後の方向性確認はフェーズ完了条件。省略禁止 |

---

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ユーザーが急いでいるからヒアリングを短縮しよう」 | 初期ヒアリングの不足は後のフェーズで手戻りを生む。7項目は最低限の質問 |
| 「資料が少ないから source-material-organizer は不要」 | 資料の量に関わらず、構造化はサブエージェントの責務。ワークフローが直接処理しない |
| 「企画書のテンプレートはシンプルだから直接書ける」 | テンプレートの複雑さに関わらず、成果物の作成はサブエージェントに委譲する |
| 「ユーザーが技術者だから平易な言葉は不要」 | user-profile.md のスコアが4〜5の軸のみ専門用語OK。他の軸は平易な言葉を使う |
| 「フェーズ0とフェーズ1は別々にコミットすべき」 | 統合されたフェーズなので、フェーズ完了時に1回コミットする |

---

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- `fs-planning-phase2-explore (aide-powers skill)` — フェーズ完了後、探索サイクルに遷移する

**Called by:**
- 企画ワークフロー（using-aide-powers (aide-powers skill) から遷移）

**Related skills:**
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `doc-index-maintenance (aide-powers skill)` — ステップ7で成果物のインデックス登録に使用
- `git-commit-workflow (aide-powers skill)` — ステップ9でフェーズ完了時のコミットに使用
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。企画書の方向性説明、アーキテクチャ構成図、技術比較表など、イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。サブエージェントに並列委譲し、各ファイルのコンテキストを理解した上で適切に処理する。量が多い場合は積極的に活用すること

**Workflow-wide rules defined in:** この SKILL.md
（Iron Law、運用ルールは後続フェーズスキル fs-planning-phase2-explore (aide-powers skill)、fs-planning-phase3-finalize (aide-powers skill) からも参照される）

**Input from caller:**
- `feature_name`（成果物パスの構築に使用）
- ユーザーのアイデア（漠然としたもの）

**遷移時に存在すべき成果物:**
- `planning-proposal.md`（初期版）
- `session-notes.md`
- `source-materials/*.md`（資料がある場合）
- `doc-index.md`

**Global rules:** `.aide/references/global-rules.md` を厳守



