---
name: fs-planning-phase3-finalize
description: "Use when the planning exploration cycle is complete and the proposal needs final review, user agreement, and handover preparation for the design workflow."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# 企画最終化

## Overview

**Core principle:** 企画書を最終レビューし、ユーザーの合意を得て、設計ワークフローが迷わず始められる引き継ぎ資料を作成する。

fs-planning-phase3-finalize は企画ワークフローの最終フェーズスキルである。企画書が設計ワークフローへの一次資料として十分な品質に達していることを確認し、引き継ぎ資料（handover-notes.md）を作成して設計ワークフローへの橋渡しを完了する。

## The Iron Law

```
NO FINALIZATION WITHOUT HANDOVER-NOTES.
handover-notes.md を作成せずに、企画ワークフローを完了扱いにしてはならない。
```

handover-notes.md は設計ワークフローが開始時に必ず読み込む引き継ぎメモである。これなしに設計ワークフローを開始すると、企画段階の重要な文脈（ユーザーのこだわり、妥協点、未解決課題）が失われる。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| handover-notes.md | `.aide/specs/{feature_name}/handover-notes.md` | 設計ワークフローへの引き継ぎメモ |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-planning-phase3-finalize
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 最終レビューの実行
- `proposal-reviewer-prompt.md`（final_review モード）経由で Task でサブエージェントを起動する
- planning-proposal.md を全文読み込み
- 関連資料（tech-investigation/, source-materials/, user-profile.md）を参照
- 10観点×5段階でスコアリング
- 総合判定（READY / ALMOST / NEEDS_WORK）を返却
- ※ 観点4（開発リソース）・観点5（運用費用）はオプション。総合判定は観点4・5を除く8観点で算出する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `step1`, step_title: `最終レビューの実行`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: レビュー結果の評価と分岐
- READY（8観点が全て4以上）→ Step後処理を実行し、Step 3 へ
- ALMOST（8観点で3以下が2個以内）→ Step 2a へ
- NEEDS_WORK（8観点で3以下が3個以上）→ Step 2b へ

  **Step 2a:** 基準未達時のユーザー提案（ALMOST の場合）
  - スコア3以下の観点をユーザーに平易な言葉で説明する
  - 「まだ詰めたほうがいいところがあります」と提案する
  - 具体的にどの観点が不十分かを説明する
  - ユーザーに選択肢を提示する:
    1. もう少し詰めたい（→ fs-planning-phase2-explore (aide-powers skill) に戻る）
    2. このままでOK（→ Step 3 へ）
    3. その他（自由記述）
  - ユーザーが「もう少し詰めたい」→ fs-planning-phase2-explore (aide-powers skill) に戻る（REQUIRED SUB-SKILL で再遷移）
  - ユーザーが「このままでOK」→ Step 3 へ（妥協点を handover-notes.md に記録）

  **Step 2b:** 基準未達時のユーザー提案（NEEDS_WORK の場合）
  - スコア3以下の観点をユーザーに平易な言葉で説明する
  - 「設計に進むにはまだ不十分な点が多いです」と説明する
  - 具体的にどの観点が不十分かを説明する
  - ユーザーに選択肢を提示する:
    1. 探索サイクルに戻って詰める（推奨）（→ fs-planning-phase2-explore (aide-powers skill) に戻る）
    2. それでもこのまま進めたい（→ Step 3 へ）
    3. その他（自由記述）
  - ユーザーが「探索サイクルに戻る」→ fs-planning-phase2-explore (aide-powers skill) に戻る
  - ユーザーが「このまま進めたい」→ Step 3 へ（妥協点を handover-notes.md に記録）

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `step2`, step_title: `レビュー結果の評価と分岐`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: ユーザー最終合意の取得
- 企画書の最終版の要約をユーザーに提示する
- 「この内容で設計フェーズに進みます。よろしいですか？」と確認する
  1. はい（→ Step 4 へ）
  2. いいえ、修正したい箇所がある（→ fs-planning-phase2-explore (aide-powers skill) に戻る）
  3. その他（自由記述）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `step3`, step_title: `ユーザー最終合意の取得`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: handover-notes.md の作成
- session-notes.md を Read で参照しながら企画プロセス全体を振り返る
- user-profile.md を Read で参照する
- 以下の5項目を全て記載する（詳細は「handover-notes.md の記載ルール」参照）:
  - A. 特に注意すべき点
  - B. ユーザーの意思決定の経緯
  - C. レビューで妥協した点
  - D. 技術調査で未解決の課題
  - E. ユーザー技術レベルの所感
- `.aide/specs/{feature_name}/handover-notes.md` に Write で出力する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `step4`, step_title: `handover-notes.md の作成`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)（handover-notes.md のエントリ追加、全エントリの最終確認）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)（コミット対象: 企画ワークフローの全成果物、プレフィックス: `docs:`）
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-planning-phase4-final-check (aide-powers skill)）
   - 引き継ぎ資料:
     - planning-proposal.md（開発企画書）
     - user-profile.md（ユーザー技術レベル）
     - tech-investigation/（技術調査結果）
     - source-materials/（構造化済み資料）
     - handover-notes.md（ことづけ）
     - doc-index.md（ドキュメント一覧）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-planning-phase3-finalize`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### handover-notes.md の記載ルール

handover-notes.md は以下の5つのセクションで構成する。**全セクション必須。** 該当なしの場合は「該当なし」と明記する（セクション自体を省略しない）。

#### A. 特に注意すべき点

設計フェーズで見落としてほしくない情報を記載する。

| 記載項目 | 内容 | 例 |
|---|---|---|
| 企画段階で判明したリスク | 技術的リスク、ビジネスリスク、スケジュールリスク | 「外部API Xの利用規約が変更される可能性がある（2025年Q3に改定予定）」 |
| ユーザーのこだわり | ユーザーが特に重視している点、譲れない要件 | 「UIのレスポンス速度を最優先。200ms以内を厳守したい意向」 |
| 技術的な制約 | 企画段階で判明した技術的制約 | 「社内ネットワークからの外部API呼び出しにプロキシ設定が必要」 |
| 暗黙の前提 | 企画書に明記されていないが共有されている前提 | 「ユーザーは既存のExcelマクロからの移行を想定している」 |

#### B. ユーザーの意思決定の経緯

重要な判断でユーザーがどのような理由で決定したかを記載する。設計フェーズで「なぜこうなったか」を理解するため。

| 記載項目 | 内容 | 例 |
|---|---|---|
| 判断内容 | 何を決定したか | 「データベースにSQLiteを採用」 |
| 選択肢 | 検討した選択肢 | 「SQLite / PostgreSQL / MySQL」 |
| 決定理由 | ユーザーがその選択肢を選んだ理由 | 「インストール不要で配布が容易。社内PCに追加ソフトを入れる承認プロセスが煩雑なため」 |
| 却下理由 | 他の選択肢を却下した理由 | 「PostgreSQLは運用負荷が高い。MySQLはライセンスの懸念」 |

#### C. レビューで妥協した点

proposal-reviewer が基準未達と判定したがユーザーがOKとした観点を記載する。設計フェーズで補強が必要な可能性がある。

| 記載項目 | 内容 | 例 |
|---|---|---|
| 観点名 | スコア3以下だった観点 | 「観点7: リスク対策の十分さ（スコア3）」 |
| 不足内容 | 具体的に何が不足しているか | 「外部APIの障害時のフォールバック戦略が未定義」 |
| ユーザーの判断 | ユーザーがOKとした理由 | 「設計フェーズで詳細を詰めればよいと判断」 |
| 設計フェーズへの推奨 | 設計フェーズで補強すべき内容 | 「システム構成設計（フェーズ4）でフォールバック戦略を必ず検討すること」 |

#### D. 技術調査で未解決の課題

調査したが結論が出なかった技術要素を記載する。設計フェーズで追加調査が必要。

| 記載項目 | 内容 | 例 |
|---|---|---|
| 調査対象 | 何を調査したか | 「リアルタイム通知の実現方式」 |
| 調査結果 | 現時点でわかっていること | 「WebSocket / SSE / ポーリングの3方式を調査。WebSocketが最適だが、社内プロキシとの互換性が未確認」 |
| 未解決の理由 | なぜ結論が出なかったか | 「社内プロキシの設定情報が入手できなかった」 |
| 設計フェーズへの推奨 | 設計フェーズで必要な追加調査 | 「システム要件定義（フェーズ2）で社内プロキシの設定を確認し、WebSocketの互換性を検証すること」 |

#### E. ユーザー技術レベルの所感

user-profile.md のスコアだけでは伝わらない、ユーザーとのコミュニケーションで感じた所感を記載する。

| 記載項目 | 内容 | 例 |
|---|---|---|
| コミュニケーションスタイル | ユーザーの対話の特徴 | 「技術用語は理解するが、選択肢を提示すると判断に時間がかかる傾向がある」 |
| 得意・不得意 | スコアに表れない強み・弱み | 「業務フローの説明は非常に詳細だが、UIのイメージを言語化するのが苦手」 |
| 対話のコツ | 設計フェーズで効果的な対話方法 | 「具体的なモックアップや図を見せると判断が早い。抽象的な質問は避けたほうがよい」 |
| 注意点 | 設計フェーズで気をつけるべきこと | 「専門用語を使うと理解はするが、確認なしに進めると後から『思っていたのと違う』となりやすい」 |

### handover-notes.md テンプレート

```markdown
# 設計ワークフローへの引き継ぎメモ（ことづけ）

作成日: {YYYY-MM-DD}
企画書: [planning-proposal.md](./planning-proposal.md)
ユーザープロファイル: [user-profile.md](./user-profile.md)

## A. 特に注意すべき点

{企画段階で判明したリスク、ユーザーのこだわり、技術的な制約、暗黙の前提}

## B. ユーザーの意思決定の経緯

{重要な判断の内容、選択肢、決定理由、却下理由}

## C. レビューで妥協した点

{スコア3以下だった観点、不足内容、ユーザーの判断、設計フェーズへの推奨}

## D. 技術調査で未解決の課題

{調査対象、調査結果、未解決の理由、設計フェーズへの推奨}

## E. ユーザー技術レベルの所感

{コミュニケーションスタイル、得意・不得意、対話のコツ、注意点}
```

### 完了条件

以下の3つすべてを満たすこと（観点4・5はオプションのため完了条件に含めない）:

1. **テンプレート充足**: 企画書の全セクションが充足基準を満たしている（または基準未達をユーザーが許容している）
2. **技術的裏付け**: 必須機能すべてに技術的な実現手段が確認されている
3. **ユーザー合意**: ユーザーが最終合意している

**加えて、以下を必ず完了していること:**

4. **handover-notes.md が作成されている**（Iron Law）
5. **doc-index.md が最新化されている**
6. **git コミットが完了している**
7. 進捗ファイル（planning-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
8. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
9. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
10. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- 企画書の最終版提示時に全体構成の概要図を表示
- UIモックアップ・構成図でユーザーの最終合意を促進

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。Iron Law に違反しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「レビュー結果が良好だから handover-notes.md は不要」 | handover-notes.md はレビュー結果とは別の情報（意思決定経緯、所感等）を含む。Iron Law 違反 |
| 「ユーザーが急いでいるから最終合意を省略する」 | 合意なしの企画書は設計フェーズで手戻りの原因になる |
| 「handover-notes.md の該当なしセクションは省略してよい」 | セクション自体を省略しない。「該当なし」と明記する |
| 「doc-index.md は前のフェーズで更新済みだから確認不要」 | handover-notes.md のエントリ追加と全体の最終確認が必要 |
| 「NEEDS_WORK だがユーザーがOKと言ったので妥協点の記録は不要」 | 妥協点を handover-notes.md に記録しないと、設計フェーズで補強すべき箇所が不明になる |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「handover-notes.md は形式的なもの」 | 設計ワークフローが開始時に必ず読み込む重要な引き継ぎ資料。企画段階の文脈が失われると設計品質が低下する |
| 「レビューで全観点4以上だから妥協点はない」 | 観点4・5がオプション化されているため、これらのスコアが低い場合は妥協点として記録する必要がある |
| 「ユーザー技術レベルの所感は user-profile.md で十分」 | user-profile.md は3軸×5段階のスコアのみ。コミュニケーションスタイルや対話のコツはスコアに表れない |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Called by:**
- `fs-planning-phase2-explore (aide-powers skill)` — REQUIRED SUB-SKILL 形式で遷移

**戻り遷移（例外的）:**
- ステップ2a/2b でユーザーが「もう少し詰めたい」を選択した場合、`fs-planning-phase2-explore (aide-powers skill)` に戻る

**Related skills:**
- `doc-index-maintenance (aide-powers skill)` — handover-notes.md のエントリ追加、全エントリの最終確認
- `git-commit-workflow (aide-powers skill)` — 企画ワークフロー全成果物のコミット
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること
