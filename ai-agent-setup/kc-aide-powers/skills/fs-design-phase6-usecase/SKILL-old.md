---
name: fs-design-phase6-usecase
description: "Use when design phase 5 (GUI design) is complete and use case analysis is needed before proceeding to layered architecture design."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# ユースケース分析（設計フェーズ6）

## Overview

**Core principle:** 要件を実現するユースケースを網羅的に洗い出し、実現プロセスとユーザビリティを評価して改善せよ。改善は評価が収束するまでループする。

ユースケース分析は、GUI設計完了後・レイヤードアーキテクチャ設計前に実行する5工程のパイプラインである。利用者の目的をベースにUCを網羅的に洗い出し（工程①）、各UCの実現プロセスを明確化し（工程②）、ユーザビリティを定量的に評価し（工程③）、低評価UCの改善案を検討し（工程④）、改善を反映して再評価する（工程⑤）。

このフェーズスキルは `usecase-analysis` (aide-powers skill) 共通スキルのプロセス定義に従いつつ、設計ワークフロー固有の制御フロー（改善反映時の他フェーズスキルの fix モード呼び出し、修正順序制御、並列実行制御）を管理する。

## プロセス順序の固定ルール

以下のプロセス順序は省略・入れ替え不可:

- 工程①→②→③→④の順序は固定
- 工程⑤は工程④でC以下のUCがあり、ユーザーが改善案を承認した場合のみ実行
- 工程②③の並列実行は許可されるが、②→③の順序依存は守る

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| usecase-list.md | .aide/specs/{feature_name}/usecases/usecase-list.md | UC網羅リスト |
| usecase-{uc名}.md | .aide/specs/{feature_name}/usecases/usecase-{uc名}.md | 各UCの実現プロセス + ユーザビリティ評価 |
| usecase-analysis.md | .aide/specs/{feature_name}/usecases/usecase-analysis.md | 改善検討・最終まとめ |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase6-usecase
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: usecase-analysis 共通スキルの読み込み

**REQUIRED SUB-SKILL:** Read usecase-analysis (aide-powers skill)

usecase-analysis (aide-powers skill) 共通スキルを読み込み、4段階プロセスの全体フロー、総合評価の算出ルール、Red Flags、Common Rationalizations を把握する。

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step1`, step_title: `usecase-analysis 共通スキルの読み込み`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 2: 工程① — UC網羅リストアップ

Task で汎用サブエージェントに委譲する。
プロンプトテンプレート: `./usecase-lister-prompt.md`

渡すコンテキスト:
- feature_name
- .aide/specs/{feature_name}/user-requirements.md
- .aide/specs/{feature_name}/system-requirements.md
- 成果物格納先: .aide/specs/{feature_name}/usecases/

**プロセス制御:**
- ユーザー合意が必須。合意なしに Step 3 に進まない
- サブエージェントがユーザーと直接対話してUCリストの合意を得る

**出力:** usecases/usecase-list.md

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step2`, step_title: `工程① — UC網羅リストアップ`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 3: 工程② — 実現プロセス明確化（UC単位、並列実行可能）

usecase-list.md から全UCを読み取り、UC単位で Task により汎用サブエージェントに委譲する。
プロンプトテンプレート: `./usecase-process-analyzer-prompt.md`

渡すコンテキスト（UC単位）:
- feature_name
- 対象UC情報（UC-ID, ユースケース名）
- .aide/specs/{feature_name}/user-requirements.md
- .aide/specs/{feature_name}/system-requirements.md
- .aide/specs/{feature_name}/system-architecture.md
- .aide/specs/{feature_name}/gui-design.md
- .aide/specs/{feature_name}/usecases/usecase-list.md
- 成果物格納先: .aide/specs/{feature_name}/usecases/

**並列実行ルール:**
- UC単位で並列呼び出し可能（dispatching-parallel-agents パターン）
- 各担当は指定されたUCのみを扱い、他のUCには触れない
- 全UCの実現プロセスが完了してから Step 4 に進む

**出力:** usecases/usecase-{uc名}.md（UC単位で新規作成）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step3`, step_title: `工程② — 実現プロセス明確化`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 4: 工程③ — ユーザビリティ評価（UC単位、並列実行可能）

全UCについて、UC単位で Task により汎用サブエージェントに委譲する。
プロンプトテンプレート: `./usecase-usability-evaluator-prompt.md`

渡すコンテキスト（UC単位）:
- feature_name
- 対象UC情報（UC-ID, ユースケース名, ファイルパス）
- .aide/specs/{feature_name}/user-requirements.md
- .aide/specs/{feature_name}/gui-design.md

**並列実行ルール:**
- UC単位で並列呼び出し可能（dispatching-parallel-agents パターン）
- 各担当は指定されたUCのみを扱い、他のUCには触れない
- 全UCの評価が完了してから Step 5 に進む

**総合評価の算出ルール（usecase-analysis (aide-powers skill) 共通スキルに定義）:**
- D が1つでもあれば → 総合D
- C が2つ以上あれば → 総合C
- B が3つ以上あれば → 総合B
- それ以外 → 総合A

**出力:** usecases/usecase-{uc名}.md に評価結果を追記

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step4`, step_title: `工程③ — ユーザビリティ評価`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 5: 工程④ — 改善検討・最終まとめ

Task で汎用サブエージェントに委譲する。
プロンプトテンプレート: `./usecase-improver-prompt.md`

渡すコンテキスト:
- feature_name
- 全ユースケースファイルのパス一覧
- .aide/specs/{feature_name}/user-requirements.md
- .aide/specs/{feature_name}/system-architecture.md
- .aide/specs/{feature_name}/gui-design.md
- 成果物格納先: .aide/specs/{feature_name}/usecases/

**プロセス制御:**
- ユーザー承認が必須。承認なしに Step 6 に進まない
- 全UCがB以上でも、分析レポート（サマリー、次フェーズへの申し送り）は作成する
- 改善案の承認時に、GUI設計への影響も合わせて確認する

**出力:** usecases/usecase-analysis.md

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step5`, step_title: `工程④ — 改善検討・最終まとめ`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 6: 工程⑤ — 改善反映ループ（改善対象UCがある場合のみ）

**実行条件:** usecase-analysis.md にC以下のUCが1件以上あり、ユーザーが改善案を承認した場合のみ。
**スキップ条件:** 全UCがB以上の場合、またはユーザーが「改善不要」と判断した場合 → Step 7 へ。

この工程はプロセス制御そのもの（ループ制御、影響範囲判定、修正順序）であり、SKILL.md に直接記述する。サブエージェントへの委譲は個別の修正・再評価のみ。

**改善反映フロー（最大3回ループ）:**

```
[LOOP START — 最大3回]

  [6a] 影響範囲の判定
    usecase-analysis.md の改善提案内容を参照し、影響を受ける成果物を特定する:
    - 「システム構成の変更が必要」→ system-architecture.md
    - 「GUI設計フィードバック」に項目あり → gui-design.md
    - 「UCの追加・削除・統合が必要」→ usecase-list.md

  [6b] 影響を受ける成果物の修正（修正順序厳守）
    1番目: system-architecture の修正 — システム構成の変更が必要な場合
      → プロンプトテンプレート: ./usecase-improvement-fix-prompt.md
      → Task で汎用サブエージェントに委譲
      → ユーザー合意を得る
    2番目: gui-design の修正 — GUI設計フィードバックがある場合
      → プロンプトテンプレート: ./usecase-improvement-fix-prompt.md
      → Task で汎用サブエージェントに委譲
      → ユーザー合意を得る
    3番目: usecase-list の修正 — UCの追加・削除・統合が必要な場合
      → プロンプトテンプレート: ./usecase-lister-prompt.md（fix モード）
      → Task で汎用サブエージェントに委譲
      → ユーザー合意を得る

  [6c] 改善対象UCの再評価（必須）
    - 工程② 再実行: usecase-process-analyzer-prompt.md（fix モード）で改善対象UCの実現プロセスを更新
    - 工程③ 再実行: usecase-usability-evaluator-prompt.md（fix モード）で改善対象UCのユーザビリティを再評価
    ※ 再評価も UC単位で並列実行可能

  [6d] usecase-analysis.md に再評価結果を追記
    → usecase-improver-prompt.md（fix モード）を呼び出し
    → 既存の評価結果は絶対に削除・上書きしない
    → 「再評価 第{N}回」セクションヘッダを付けて追記

  [6e] ループ判定
    - 全UCがB以上 → ループ終了 → Step 7 へ
    - まだC以下のUCがある → ユーザーに報告し、LOOP START に戻る
    - 3回で収束しない場合 → ユーザーに以下を提示して判断を仰ぐ:
      - 残っているC以下のUCとその評価
      - これまでの改善履歴
      - 選択肢:
        1. 現状のまま次フェーズに進む
        2. さらに改善を試みる
        3. その他（自由記述）

[LOOP END]
```

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step6`, step_title: `工程⑤ — 改善反映ループ`, artifact_dir: `.aide/specs/{feature_name}`

---

### Step 7: ユーザー最終承認

- 全成果物をユーザーに提示し最終合意を得る
- 合意なし → 修正して再提示

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `step7`, step_title: `ユーザー最終承認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
   - 対象ドキュメント: usecases/usecase-list.md, usecases/usecase-{uc名}.md（全UC分）, usecases/usecase-analysis.md
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase7-ddd (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase6-usecase`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

## 完了条件

- 全UCがB以上、またはユーザーが現状で承認
- usecases/usecase-list.md が作成済み
- 全UCの usecases/usecase-{uc名}.md が作成済み（実現プロセス + ユーザビリティ評価）
- usecases/usecase-analysis.md が作成済み
- ユーザー最終承認を取得済み
- doc-index-maintenance (aide-powers skill) 完了
- git-commit-workflow (aide-powers skill) 完了
- 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
- 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
- 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
- ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

## 工程間の依存関係と並列実行ルール

| 工程 | 前提工程 | 並列実行 | 備考 |
|---|---|---|---|
| ① | なし（フェーズ5完了が前提） | 不可（単一実行） | — |
| ② | ①完了 | **UC単位で並列可** | 各担当は指定されたUCのみを扱い、他のUCには触れない |
| ③ | ②完了（対象UCの実現プロセスが必要） | **UC単位で並列可** | ②と③は同じUCに対して同時実行不可 |
| ④ | ③完了（全UCの評価結果が必要） | 不可（単一実行） | — |
| ⑤ | ④完了（改善提案が必要） | 不可（順次実行） | 影響範囲の修正順序を守る |

**並列実行の制約:**
- ②は全UCを並列で実行可能。③も全UCを並列で実行可能。ただし②→③の順序は守る
- 並列実行時、各エージェントは自分の担当UCファイルのみを作成・編集する
- ②と③を同一UCに対して同時に実行してはならない（②の結果が③の入力になるため）

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。プロセスを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「改善反映の修正順序を変えても問題ない」 | system-architecture → gui-design → usecase-list の順序は依存関係に基づく。順序を変えると整合性が崩れる |
| 「並列実行で全工程を一度に実行すればよい」 | 工程①→②→③→④の順序は固定。並列実行が許可されるのは工程②と③のUC単位の実行のみ |
| 「改善反映ループを省略してフェーズ7に進む」 | C以下のUCが残っている場合、ユーザーの判断なしにループを打ち切らない |
| 「工程②③の再評価は不要、改善案を反映すれば十分」 | 改善が実際に効果があったかは再評価で確認する必要がある。再評価なしの改善は検証されていない |
| 「fix モードの修正をオーケストレーター自身が行う」 | 成果物の修正は必ずサブエージェントに委譲する。オーケストレーターは制御フローの管理のみ |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前のフェーズスキル:**
- `fs-design-phase5-gui` (aide-powers skill)（GUI設計）→ 完了後に本スキルが呼び出される

**次のフェーズスキル:**
- `fs-design-phase7-ddd` (aide-powers skill)（レイヤードアーキテクチャ + ユビキタス言語）

**呼び出す共通スキル:**
- `usecase-analysis` (aide-powers skill) — 4段階プロセスの定義（Step 1 で読み込み）
- `doc-index-maintenance` (aide-powers skill) — 後処理
- `git-commit-workflow` (aide-powers skill) — 後処理
- `pending-issues-management` (aide-powers skill) — 問題発見時に随時記録
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
