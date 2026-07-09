---
name: fs-reverse-phase1-program
description: "Use when reverse-engineering program structure from an existing codebase as the first phase of the reverse-design workflow"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# プログラム構成逆引き（フェーズ1）

## Overview

既存コードベースのファイル構成・ディレクトリ構成・依存関係を3パス解析で抽出し、`program-structure.md` を生成する先頭フェーズスキル。

**Core principle:** 3パス解析でコンテキスト溢れを防ぎながら、既存コードベースのファイル構成・依存関係を正確に記録する。

3パス解析の意義:
- パス1（スケルトン）: ファイル名のみでプロジェクト全体像を把握し、規模を判定する。ファイルの中身は読まない
- パス2（importツリー）: エントリポイント起点で依存関係を追跡し、到達可能なファイルの役割を記録する
- パス3（フォルダ単位網羅チェック）: パス2で未到達のファイルを含め、全ファイルを網羅的に解析する。ディレクトリ単位でサブエージェントに委譲し、コンテキスト独立性を確保する

## The Iron Law

### 逆引きワークフロー固有 Iron Law

```
1. RECORD THE REALITY OF CODE, NOT THE IDEAL DESIGN.
   コードの現実を記録せずに、設計書を作成してはならない。
   「あるべき設計」ではなく「現在の実装の設計」を記録する。
```

### フェーズ固有: 3パス解析の順序保証

```
NO PASS 3 WITHOUT PASS 1+2 COMPLETION AND USER APPROVAL.
パス1+パス2の完了とユーザー合意なしに、パス3に進んではならない。

NO INTEGRITY CHECK WITHOUT ALL PASS 3 DIRECTORIES ANALYZED.
パス3の全ディレクトリ解析完了なしに、整合性チェックに進んではならない。
```

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| program-structure.md | .aide/specs/{feature_name}/program-structure.md | 3パス解析によるプログラム構成記録 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-reverse-phase1-program
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Skip conditions:**
- `reverse-progress.md` でフェーズ1が完了済みの場合 → 次フェーズスキル（`fs-reverse-phase2-dev-env (aide-powers skill)`）へ遷移

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
   - START_FRESH → Step 1 へ。
   - RESUME_FROM N → 進捗ファイルは既存。N が本フェーズなら本スキル内の該当ステップから再開、N が後続フェーズなら該当フェーズスキルへ遷移。
   - ALL_COMPLETED → 全フェーズ完了済み。ユーザーに案内し終了。
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: パス1+パス2
- プロンプトテンプレート: reverse-program-structure-prompt.md
- 委譲先: Task でサブエージェントをディスパッチ
- 入力: feature_name, プロジェクトルート
- 出力: program-structure.md（パス1+パス2）
- サブエージェントがユーザーと直接対話し合意を得る
- 完了後: 「プログラム構成パス1+パス2完了」と明示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `step1`, step_title: `パス1+パス2`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: パス3調査計画
- プロンプトテンプレート: reverse-program-structure-planner-prompt.md
- 委譲先: Task でサブエージェントをディスパッチ
- 入力: feature_name, プロジェクトルート, program-structure.md のパス
- 出力: pass3-survey-plan.md
- サブエージェントがユーザーと直接対話し合意を得る
- 完了後: 「パス3調査計画完了」と明示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `step2`, step_title: `パス3調査計画`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: パス3ディレクトリ単位解析（ループ）
- pass3-survey-plan.md を Read で読み込む
- パス2解析済みファイル一覧を抽出する
- for each ディレクトリ in 調査計画:
  - プロンプトテンプレート: pass3-directory-analysis-prompt.md
  - 委譲先: Task でサブエージェントをディスパッチ
  - テンプレートの {対象ディレクトリ}, {出力先ファイル}, {パス2解析済みファイル一覧} を埋める
  - サブエージェント完了後:
    - program-structure.md を Read で確認し、追記が正しく行われたことを検証
    - 追記が不十分な場合: 同じディレクトリに対して再委譲（最大1回のリトライ）
    - リトライ後も不十分な場合: ユーザーに報告し判断を仰ぐ
    - 「ステップN/M完了: {ディレクトリ名}」とユーザーに報告
  - 次のディレクトリに進む
- 全ステップ完了後: 「パス3ディレクトリ単位解析完了」と明示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `step3`, step_title: `パス3ディレクトリ単位解析（ループ）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: パス3整合性チェック
- プロンプトテンプレート: reverse-program-structure-reviewer-prompt.md
- 委譲先: Task でサブエージェントをディスパッチ
- 入力: feature_name, program-structure.md のパス
- 出力: program-structure.md（最終版）
- サブエージェントがユーザーと直接対話し合意を得る
- 合意後「プログラム構成逆引き完了」と明示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `step4`, step_title: `パス3整合性チェック`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)（program-structure.md を doc-index.md に登録）
2. phase-compliance-check (aide-powers skill: write)（フェーズ遵守チェック＋署名付き進捗更新）
3. git-commit-workflow (aide-powers skill)（フェーズ1全体の成果物をコミット）
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase2-dev-env (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-reverse-phase1-program`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### パス3ループ制御の詳細ロジック

**Step 1:** 前提準備
- pass3-survey-plan.md を Read で読み込む
- 調査ステップ一覧を抽出する（ステップ番号、ディレクトリパス）
- パス2解析済みファイル一覧を抽出する
- 総ステップ数 M を取得する

**Step 2:** ループ（N = 1 to M の各ディレクトリに対して繰り返し）
- 現在のステップのディレクトリパスを取得する
- サブエージェント委譲:
  - pass3-directory-analysis-prompt.md のテンプレートを Read で読み込む
  - テンプレート変数を埋める:
    - {target_directory} ← 現在のディレクトリパス
    - {output_file} ← .aide/specs/{feature_name}/program-structure.md
    - {analyzed_files_list} ← パス2解析済みファイル一覧
  - Task でサブエージェントをディスパッチ:
    - prompt: （テンプレート変数を埋めたプロンプト）
    - explanation: "パス3 ステップ{N}/{M}: {ディレクトリパス} の解析"
- 検証:
  - program-structure.md を Read で確認する
  - 追記が正しく行われたことを検証する:
    - 対象ディレクトリのセクションが存在するか
    - ファイルの役割説明が追記されているか
    - import情報が記載されているか
  - 追記が不十分な場合:
    - 同じディレクトリに対して再委譲する（最大1回のリトライ）
    - リトライ後も不十分な場合はユーザーに報告し判断を仰ぐ
- 進捗報告:
  - ユーザーに「ステップ{N}/{M}完了: {ディレクトリ名}」と報告する

**Step 3:** ループ完了
- 「パス3ディレクトリ単位解析完了」と明示する

### 途中再開時のループ制御

パス3ディレクトリ単位解析の途中でセッションが中断された場合の再開ロジック:

1. `reverse-progress.md` を確認する
2. 「フェーズ1c: ステップN/M完了」の記録がある場合、ステップN+1から再開する
3. `program-structure.md` を Read で確認し、既に解析済みのディレクトリを特定する
4. 未解析のディレクトリからループを再開する

### reverse-progress.md の記録形式

```markdown
# 設計逆引き進捗

## フェーズ1: プログラム構成抽出
- [x] フェーズ1a: パス1+パス2 完了
- [x] フェーズ1b: パス3調査計画 完了
- [x] フェーズ1c: パス3ディレクトリ単位解析
  - [x] ステップ1/5: src/domain/
  - [x] ステップ2/5: src/application/
  - [ ] ステップ3/5: src/infrastructure/
  - [ ] ステップ4/5: src/presentation/
  - [ ] ステップ5/5: tests/
- [ ] フェーズ1d: パス3整合性チェック
- [ ] フェーズ1: 完了（doc-index + git-commit）
```

### 完了条件

以下のすべてが満たされた場合にフェーズ1完了とする:

1. `program-structure.md` が作成され、パス1+パス2+パス3の全内容が含まれている
2. パス3整合性チェックが完了し、ユーザーが最終版に合意している
3. `doc-index.md` に `program-structure.md` のエントリが登録されている
4. gitコミットが完了している
5. `reverse-progress.md` に「フェーズ1完了」が記録されている（phase-compliance-check (write) により更新）
- 進捗ファイル（reverse-progress.md）が `progress-resume-check (aide-powers skill)` の戻り値に応じて適切に取り扱われている
  - START_FRESH の場合: phase-compliance-check (write) により新規作成済み
  - RESUME_FROM N / ALL_COMPLETED の場合: 既存進捗ファイルを上書きせず、戻り値に応じた分岐処理が実行済み

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` スキルを使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- プログラム構成のフォルダツリー・依存関係図の視覚的表示
- importツリー（依存グラフ）をブラウザで図示

## Red Flags - STOP

以下の思考パターンに気づいたら即座に停止すること:

| Red Flag | なぜ危険か |
|---|---|
| 「パス1+パス2の合意を待たずにパス3に進もう」 | Iron Law 違反。必ずユーザー合意を得てからパス3に進む |
| 「このディレクトリは小さいから解析をスキップしよう」 | 調査計画の全ディレクトリを解析する。スキップは禁止 |
| 「パス3のループ中にユーザーに質問しよう」 | パス3ディレクトリ単位解析中はユーザーへの質問不要。黙々と解析・書き出しを行う |
| 「コードの設計が悪いから理想の設計に書き換えよう」 | 「現実の記録」原則違反。コードの現実をそのまま記録する |
| 「program-structure.md を Write で全体上書きしよう」 | パス3では追記モード（Edit / Bash による追記）のみ使用。全体上書きは禁止 |
| 「Read での検証は省略しよう」 | パス3の各ステップ完了後、必ず Read で追記結果を検証する |
| 「doc-index-maintenance を省略してコミットしよう」 | 共通スキルの呼び出し順序を守る。doc-index-maintenance (aide-powers skill) → git-commit-workflow (aide-powers skill) |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「プロジェクトが小さいからパス3は不要」 | 小規模でもパス3は実行する。パス2で未到達のファイルが存在する可能性がある |
| 「パス1+パス2で十分な情報が得られた」 | パス3は網羅性を保証するための工程。パス2はエントリポイントからの到達可能ファイルのみ |
| 「整合性チェックは形式的だから省略してよい」 | 整合性チェックはimportルールの統合・未到達ファイルの整理・命名規則の補完を行う重要な工程 |
| 「ユーザーが急いでいるからフェーズ完了処理を省略しよう」 | doc-index-maintenance (aide-powers skill) と git-commit-workflow (aide-powers skill) は必須。省略は品質劣化の原因 |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理（進捗ファイル再開チェック）
- `phase-compliance-check (aide-powers skill)` — 前処理（verify: 前フェーズ署名検証）・後処理（write: フェーズ遵守チェック＋署名付き進捗更新）
- `doc-index-maintenance (aide-powers skill)` — 後処理（program-structure.md を doc-index.md に登録）
- `git-commit-workflow (aide-powers skill)` — 後処理（フェーズ1全体の成果物をコミット）
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**呼び出さない共通スキル:**
- `design-gate (aide-powers skill)` — 設計逆引きワークフローは設計書を生成する側であり、設計書の存在確認は不要
- `design-sync (aide-powers skill)` — 逆引きは「現実の記録」であり、実装と設計書の同期は不要
- `multi-stage-code-review (aide-powers skill)` — コード変更を行わないため不要
- `usecase-analysis (aide-powers skill)` — ユースケース分析は設計ワークフローの担当
- `doc-sync (aide-powers skill)` — 逆引きは新規生成であり、既存設計書との同期は不要

**Called by:**
- 設計逆引きワークフロー（先頭フェーズとして）

**Input from caller:**
- feature_name（スペックディレクトリ名）
- プロジェクトルートパス

**Global rules:** `.aide/references/global-rules.md` を厳守
