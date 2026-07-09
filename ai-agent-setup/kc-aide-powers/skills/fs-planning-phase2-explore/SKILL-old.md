---
name: fs-planning-phase2-explore
description: "Use when the initial planning proposal template has been created and needs iterative refinement through user dialogue, technical investigation, and review cycles."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 企画探索サイクル

## Overview

**Core principle:** 対話→技術調査→企画書更新→レビューの探索サイクルを繰り返し、開発企画書の解像度を段階的に上げる。ユーザーの相談相手として機能し、技術調査の結果から新たな可能性を積極的に提案する。

## The Iron Law

```
NO EXPLORATION CYCLE COMPLETION WITHOUT A REVIEW.
レビューなしに探索サイクルを完了してはならない。
区切り条件に該当したら、必ず proposal-reviewer でレビューを実施すること。
```

## 成果物

| # | ファイル | 説明 |
|---|---|---|
| 1 | planning-proposal.md | 開発企画書（探索サイクルで段階的に更新） |
| 2 | session-notes.md | 対話記録（確定事項・検討中・技術調査依頼・提案事項・却下事項） |
| 3 | tech-investigation/ | 技術調査結果（tech-investigation (aide-powers skill) 経由で格納） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-planning-phase2-explore
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Exceptions:**
- ユーザーが「企画書はこれで十分」と明示的に判断した場合は、最低1回のレビューを実施した上で fs-planning-phase3-finalize (aide-powers skill) に遷移してよい

### 前処理

1. `progress-resume-check (aide-powers skill)` を activate し、進捗ファイルを確認する
   - 中断からの再開の場合は、前回の状態を復元して適切なステップから再開する
3. `phase-compliance-check (aide-powers skill: verify)` を activate し、前フェーズの完了条件充足を検証する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: ユーザーとの対話

1. planning-proposal.md を Read で読み、未充足セクション（「未定」と記載されている箇所）を把握する
2. 前回のレビュー結果がある場合は、改善提案の優先度を確認する
3. session-notes.md の最新状態を Read で確認する
4. 未充足セクションについて、平易な言葉で **1つずつ** 質問する
5. ユーザーの発言から技術調査が必要な要素を見つけたらメモする
6. 「こんなこともできますよ」と新たな可能性を随時提案する
7. やり取りの内容を session-notes.md に記録する（以下のカテゴリで整理）:
   - **確定事項**: ユーザーが明確に決定した内容
   - **検討中**: まだ結論が出ていない内容
   - **技術調査依頼**: 調査が必要な技術要素
   - **提案事項**: AIから提案してユーザーの反応を待つ内容
   - **却下事項**: 検討の結果、採用しないことになった内容
8. 各エントリにはサイクル番号を付ける（例: `[サイクル1]`）
9. ユーザーの発言は原文のまま記録する（改変しない）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step1`, step_title: `ユーザーとの対話`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: 技術調査（必要な場合のみ）

1. `tech-investigation (aide-powers skill)` スキルを発動する
2. 以下の情報を渡す:
   - `feature_name`: 対象プロジェクトの feature_name
   - `調査対象`: 調査すべき技術要素の具体的な内容
   - `調査の背景`: なぜこの調査が必要か、企画書のどのセクションに関係するか
   - `調査観点`: 実現可能性 / 代替手段 / コスト / 制約事項 / その他
3. 調査結果をユーザーの技術レベルに合わせて説明する
4. `doc-index-maintenance (aide-powers skill)` で doc-index.md を更新する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step2`, step_title: `技術調査（必要な場合のみ）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: 企画書の更新

1. session-notes.md の差分（前回更新以降の新しいメモ）と新規の技術調査結果を取りまとめる
2. `proposal-writer-update-prompt.md` の内容を Read で読み込む
3. プロンプトテンプレートのプレースホルダを埋めて Task でサブエージェントをディスパッチする
4. サブエージェントが planning-proposal.md を更新する
5. `doc-index-maintenance (aide-powers skill)` で doc-index.md を更新する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step3`, step_title: `企画書の更新`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: 区切り判定

以下の4条件のいずれかに該当するか判定する:

| # | 条件 | 具体的な判断基準 | 例 |
|---|---|---|---|
| (a) | 技術調査が一段落した | 主要な技術要素（必須機能に関わるもの）の調査が完了し、実現可能性の判断が出揃った | 3つの必須機能のうち2つの技術調査が完了した |
| (b) | 複数セクションが大きく更新された | 企画書の2つ以上のセクション（機能詳細、全体イメージ等）に実質的な情報追加があった | 機能詳細に2つの新機能が追加され、データフローも更新された |
| (c) | 方向性が大きく変わった | ユーザーとの対話で、プロジェクトの目的・スコープ・技術選定に大きな変更があった | 「Webアプリ」から「デスクトップアプリ」に方針転換した |
| (d) | ユーザーが確認を要望した | ユーザーが「一旦確認したい」「今の状態を見たい」等と発言した | 「ここまでの内容を一度レビューしてほしい」 |

- いずれにも該当しない → Step 1に戻る
- いずれかに該当 → Step後処理を実行し、Step 5に進む

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step4`, step_title: `区切り判定`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: レビュー

1. `proposal-reviewer-prompt.md` の内容を Read で読み込む
2. プロンプトテンプレートのプレースホルダを埋めて Task でサブエージェント（cycle_review モード）をディスパッチする
3. レビュー結果をユーザーに共有する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step5`, step_title: `レビュー`, artifact_dir: `.aide/specs/{feature_name}`

### Step 6: ループ判定

レビュー結果の総合判定に基づき、次のアクションを決定する。

**総合判定の計算方法（観点4・5を除く8観点で判定）:**

| 判定 | 条件 | アクション |
|---|---|---|
| **NEEDS_WORK** | 8観点のうち3以下が3個以上 | サイクル継続（必須）。改善提案の優先度に従い、最も優先度の高い観点から対話・調査を進める。レビュー結果の改善提案をユーザーに共有し、次のサイクルの方針を相談する |
| **ALMOST** | 8観点のうち3以下が2個以内 | ユーザーに確認する。不足している観点を具体的に説明し、「もう少し詰めますか？」と確認する。ユーザーが「これでOK」と判断した場合はフェーズ3へ遷移する |
| **READY** | 8観点すべてが4以上 | フェーズ3へ遷移。ユーザーに「企画書の品質が十分なレベルに達しました。最終確認に進みましょう」と伝える |

**オプション化された観点（総合判定に影響しない）:**
- 観点4（開発リソースの妥当性）: スコアリングは実施するが参考情報として扱う
- 観点5（運用費用）: スコアリングは実施するが参考情報として扱う

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step6`, step_title: `ループ判定`, artifact_dir: `.aide/specs/{feature_name}`

### Step 7: ユーザー承認

- NEEDS_WORK → Step 1に戻る（サイクル継続）
- ALMOST → ユーザーに確認
  - 「もう少し詰めたい」→ Step 1に戻る
  - 「これでOK」→ Step後処理を実行し、後処理へ
- READY → ユーザーに「企画書の品質が十分なレベルに達しました。最終確認に進みましょう」と伝え、承認を得る
- ユーザーが完了を希望 → Step後処理を実行し、後処理へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `step7`, step_title: `ユーザー承認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理

1. `doc-index-maintenance (aide-powers skill)` を activate し、doc-index.md を更新する
2. `phase-compliance-check (aide-powers skill: write)` を activate し、本フェーズの完了条件充足を検証する
3. `git-commit-workflow (aide-powers skill)` を activate し、成果物をコミットする
4. `fs-planning-phase3-finalize (aide-powers skill)` へ遷移する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase2-explore`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下のいずれかを満たすこと:

1. **READY 判定**: proposal-reviewer の cycle_review で READY（8観点すべてが4以上）と判定された
2. **ALMOST + ユーザー完了希望**: ALMOST と判定され、かつユーザーが完了を希望した
3. **ユーザーの明示的な完了希望**: ユーザーが「企画書はこれで十分」と明示的に判断した場合（ただし最低1回のレビューを実施済みであること）
4. 進捗ファイル（planning-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
5. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
6. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
7. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### ユーザーとの対話ポイント

| # | 対話ポイント | タイミング | 内容 |
|---|---|---|---|
| 1 | 未充足セクションの質問・提案 | サイクル開始時 | 企画書の「未定」セクションや情報不足の箇所について、平易な言葉で質問する |
| 2 | 新たなアイデア・可能性の提案 | 技術調査結果の説明時 | 調査結果から見えた新たな可能性を「こんなこともできますよ」と提案する |
| 3 | 技術調査結果の説明 | tech-investigator 完了後 | ユーザーの技術レベルに合わせて調査結果を説明する |
| 4 | レビュー結果の共有 | proposal-reviewer 完了後 | スコアと改善提案をユーザーに共有し、次のサイクルの方針を相談する |
| 5 | 完了希望の確認 | ALMOST 判定時 | ユーザーが完了を希望するか、もう少し詰めるかを確認する |

### 共通スキルの呼び出しタイミング

| # | 共通スキル | 呼び出しタイミング |
|---|---|---|
| 1 | `tech-investigation (aide-powers skill)` | ユーザーとの対話で技術調査が必要な要素が見つかった時 |
| 2 | `doc-index-maintenance (aide-powers skill)` | 後処理、および tech-investigator が技術調査結果を作成した後、proposal-writer が企画書を更新した後 |
| 3 | `git-commit-workflow (aide-powers skill)` | 後処理（探索サイクル完了時） |
| 4 | `pending-issues-management (aide-powers skill)` | 探索サイクル中に問題を発見した場合（稀） |

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- 技術調査結果の説明時にアーキテクチャ構成図・技術比較表を表示
- ユーザーへの技術選定の選択肢提示時に比較図を表示

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。探索サイクルのルールに違反しようとしている。

| Red Flag | 正しい対応 |
|---|---|
| 区切り条件に該当しているのにレビューをスキップしようとしている | 必ず proposal-reviewer でレビューを実施する |
| ユーザーの発言を改変してサブエージェントに渡そうとしている | ユーザーの発言はそのまま session-notes.md に記録する |
| 技術調査なしに「たぶんできる」で企画書を埋めようとしている | `tech-investigation (aide-powers skill)` で調査してから記載する |
| 複数の質問を一度にまとめて投げようとしている | 質問は1つずつ投げる |
| session-notes に記載されていない情報を企画書に追加しようとしている | session-notes に記録してから proposal-writer に渡す |
| NEEDS_WORK 判定なのにフェーズ3に遷移しようとしている | サイクルを継続する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ユーザーが急いでいるからレビューは省略しよう」 | レビューは品質保証の核心。省略すると設計フェーズで手戻りが発生する |
| 「技術調査は前に似たものをやったから不要」 | 技術は日々変わる。必ず最新情報を確認する |
| 「NEEDS_WORK だけど大した問題じゃないからフェーズ3に進もう」 | 判定基準は明確。8観点のうち3以下が3個以上ならサイクル継続が必須 |
| 「ユーザーが答えてくれないから推測で埋めよう」 | 推測で埋めない。質問の仕方を変えて再度聞く |
| 「運用コストは後で考えればいい」 | オプション化されているが、記載を推奨する。ユーザーに「ランニングコストについて何か気になることはありますか？」と聞く |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-planning-phase3-finalize (aide-powers skill)` — 完了判定・最終化

**Called by:**
- `fs-planning-phase1-intake-and-init (aide-powers skill)` — 初期情報収集・テンプレート初期化が完了した後に遷移

**Related skills:**
- `tech-investigation (aide-powers skill)` — 技術調査の委譲
- `doc-index-maintenance (aide-powers skill)` — ドキュメント作成・更新後の doc-index.md 更新
- `git-commit-workflow (aide-powers skill)` — レビュー完了時のコミット
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること
- `pending-issues-management (aide-powers skill)` — 問題発見時の記録（稀）

**Global rules:** `.aide/references/global-rules.md` を厳守
