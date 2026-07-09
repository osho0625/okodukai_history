---
name: fs-design-phase10-program
description: "Use when Phase 9 (infrastructure interface design) is complete and user has agreed. Finalize program structure (folder layout, file naming, import rules) and pass Gate 4 (final design review with completeness check)."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# プログラム構成確定（fs-design-phase10-program）

## Overview

**Core principle:** オブジェクト設計の全クラスを漏れなくファイルに配置し、レイヤー間の依存方向をimportルールで強制せよ。

fs-design-phase10-program は設計ワークフローのフェーズ10として、インフラIF設計（フェーズ9）完了後に実行される。レイヤードアーキテクチャとオブジェクト設計に基づき、フォルダ構成・ファイル構成を確定し、importルール（許可/禁止パス）を明記する。設計ワークフロー最後のフェーズスキルとして、ゲート4（最終設計レビュー）で全設計書の整合性と網羅性を確認し、設計完了を宣言する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| program-structure.md | `{specs_dir}/program-structure.md` | フォルダ構成・ファイル配置・importルール・命名規則を定義 |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase10-program
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Never:**
- フェーズ9（インフラIF設計）が未完了の場合
- フェーズ8（オブジェクト設計）が未完了の場合
- フェーズ7（レイヤードアーキテクチャ）が未完了の場合

**前提:** fs-design-phase9-infra (aide-powers skill) 完了

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: 前フェーズ成果物の読み込み
- 以下の成果物を全て Read で読み込む:
  - layered-architecture.md
  - object-design-domain.md
  - object-design-application.md
  - object-design-infrastructure.md
  - object-design-presentation.md
  - infra-interface-design.md
  - system-architecture.md
  - gui-design.md
  - user-requirements.md
  - system-requirements.md

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `step1`, step_title: `前フェーズ成果物の読み込み`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: program-structure-designer サブエージェントの呼び出し（phase10 モード）
- `./program-structure-designer-prompt.md` を Read で読み込み、テンプレート変数を埋めて Task でサブエージェントをディスパッチする
- サブエージェントに渡す情報:
  - feature_name
  - mode: phase10
  - 前フェーズ成果物のパス
- サブエージェントの処理:
  1. program-structure-design (aide-powers skill)（新規作成モード）を読み込む
  2. レイヤードアーキテクチャの各層を src/ 配下のトップレベルフォルダとして反映
  3. 各層の中は機能ドメインごとにサブフォルダを切る（最大3-4階層）
  4. ファイル命名規則を適用（言語の標準規則に従う）
  5. 1ファイル1クラスを基本とし、クラス名とファイル名の対応を一貫させる
  6. importルール（許可/禁止パス）を定義
  7. テストコードのディレクトリ構成を定義
  8. 設定ファイル・環境変数の管理方針を定義
  9. program-structure.md を作成
  10. ユーザーに提示し合意を得る
  11. 合意後「プログラム構成確定」と明示
- ユーザー合意 → Step後処理を実行し、Step 3 へ
- ユーザーが修正を要求 → サブエージェントがユーザーと対話して修正 → 再提示

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `step2`, step_title: `program-structure-designer サブエージェントの呼び出し（phase10 モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: QAレビュー（ゲート4: 最終設計レビュー）
- **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill)
- パラメータ:
  - ゲート: gate4（最終設計レビュー）
  - レビュー対象: infra-interface-design.md, program-structure.md
  - 前提成果物: object-design-*.md, layered-architecture.md, user-requirements.md, gui-design.md, system-architecture.md
  - QAレビューアー: final-design-qa-agent (aide-powers agent)
- 検証項目:
  1. インフラIF設計の整合性 — API定義・スキーマ定義とオブジェクト設計のインターフェース定義の整合
  2. プログラム構成の整合性 — オブジェクト設計の全クラスをカバーしているか。漏れがあればFAIL
  3. importルールの定義 — 許可/禁止パスが明記されているか。レイヤー間依存方向に基づくルールが具体的か
  4. ファイル命名規則 — 言語の標準規則（Python: PEP 8準拠のスネークケース等）が全ファイルに適用されているか
- 追加必須チェック: 設計網羅性確認
  - ゲート4は設計ワークフロー最後のゲートであり、全設計書の整合性を確認する最終レビュー
  - 通常の4検証項目に加えて、以下の設計網羅性確認を必須で実施する:
    - user-requirements.md の全項目を1つずつチェック → 設計書（object-design-*.md, layered-architecture.md, infra-interface-design.md, program-structure.md）で考慮・反映されているか
    - gui-design.md の全画面・全コンポーネントを1つずつチェック → 設計書で考慮・反映されているか
    - system-architecture.md の全コンポーネントを1つずつチェック → 設計書で考慮・反映されているか
    - 未考慮が1つでもあれば REJECTED
    - 確認結果を design-progress.md に記録する
- APPROVED → Step後処理を実行し、Step 4 へ
- REJECTED → Step 3r（修正ループ）へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `step3`, step_title: `QAレビュー（ゲート4: 最終設計レビュー）`, artifact_dir: `.aide/specs/{feature_name}`

  **Step 3r:** REJECTED→fix→再QAループ
  1. final-design-qa-agent (aide-powers agent) の修正指示を受け取る
  2. 修正指示の内容を分析し、修正対象を特定する
  3. 該当するフェーズスキル/サブエージェントを fix モードで呼び出す:
     - program-structure.md の問題 → program-structure-designer-prompt.md（mode: fix）で Task ディスパッチ
     - infra-interface-design.md の問題 → fs-design-phase9-infra (aide-powers skill: fix)
     - object-design-*.md の問題 → fs-design-phase8-object (aide-powers skill: fix)
     - layered-architecture.md の問題 → fs-design-phase7-ddd (aide-powers skill: fix)
     - gui-design.md の問題 → fs-design-phase5-gui (aide-powers skill: fix)
     - user-requirements.md の問題 → fs-design-phase1-user-req (aide-powers skill: fix)
     - system-architecture.md の問題 → fs-design-phase4-architecture (aide-powers skill: fix)
  4. 修正完了後、ユーザーに修正内容を提示し合意を得る
  5. **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill)
  6. **REQUIRED SUB-SKILL:** Use design-qa-dispatch (aide-powers skill) で再QA（省略絶対禁止）
  7. APPROVED になるまで 1〜6 を繰り返す

### Step 4: QA APPROVED 後の処理
1. QAレビュー結果（設計網羅性確認結果を含む）をユーザーに共有する
2. 「設計完了」をユーザーに宣言する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `step4`, step_title: `QA APPROVED 後の処理`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase11-final-check (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase10-program`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### 完了条件

以下の全てを満たすこと:

1. `program-structure.md` が作成されている
2. フォルダ構成ツリー（全ファイル含む）が記載されている
3. importルール（許可/禁止パス）が明記されている
4. ファイル命名規則が定義されている
5. ユーザーの合意を得ている（「プログラム構成確定」が明示されている）
6. doc-index-maintenance (aide-powers skill) で doc-index.md が更新されている
7. git-commit-workflow (aide-powers skill) でコミットが完了している
8. design-qa-dispatch (aide-powers skill) 経由の final-design-qa-agent (aide-powers agent) によるQAレビューで APPROVED を得ている
9. 設計網羅性確認が完了し、結果が design-progress.md に記録されている
10. REJECTED → fix → 再QA のループが完了している（REJECTED があった場合）

### 再QA省略の絶対禁止ルール

REJECTED を受けて修正を行った場合、**必ず** design-qa-dispatch (aide-powers skill) 経由で再QAレビューを実施すること。以下の理由による再QA省略は一切認めない:

- 「修正内容がシンプルだから再QAは不要」→ 禁止
- 「前回のQAで他の項目はPASSだったから、修正箇所だけ確認すればよい」→ 禁止
- 「ユーザーが合意したから再QAは不要」→ 禁止
- 「設計ワークフローの最後だから早く終わらせたい」→ 禁止

### 厳守ルール

- **QA APPROVED なしに設計完了を宣言してはならない**
- **REJECTED 後の修正を行った場合、再QA を省略してはならない**
- **設計網羅性確認を省略してはならない**（ゲート4の必須チェック）

### ビジュアルコンパニオン活用

以下の場面では visual-companion (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- フォルダ構成ツリー図の表示
- importルール依存方向図（レイヤー間の依存方向）の視覚的提示

## Red Flags - STOP

以下の思考パターンに気づいたら、即座に停止して正しいプロセスに戻ること:

| Red Flag | なぜ危険か |
|---|---|
| 「オブジェクト設計のクラスは大体カバーしているから十分」 | 「大体」ではなく全クラスを1つずつ確認する。漏れがあればゲート4でFAILになる |
| 「importルールは暗黙的に理解されるから明記不要」 | importルールは明示的に定義しなければ実装時に依存方向が崩れる。禁止パスを具体的に列挙する |
| 「設計ワークフローの最後だから早く終わらせたい」 | 最後のゲートこそ最も重要。設計網羅性確認を省略すると、実装フェーズで大きな手戻りが発生する |
| 「修正がシンプルだから再QAは不要」 | ゲート4は全設計書の整合性を確認する最終レビュー。修正が他の設計書に波及する可能性がある |
| 「設計網羅性確認は時間がかかるから省略する」 | 設計網羅性確認はゲート4の必須チェック。省略は品質保証の放棄に等しい |
| 「前のゲートで確認済みだから最終レビューは形式的でよい」 | ゲート4は前のゲート以降に追加された設計（フェーズ9, 10）も含めた最終確認。形式的な確認は禁止 |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「フォルダ構成は実装時に調整すればよい」 | フォルダ構成は設計の一部。実装時の変更はレイヤー間依存の崩壊リスクがある |
| 「importルールはリンターで強制すればよい」 | リンター設定の前提として、設計書にルールが明記されている必要がある。設計書がルールの正（source of truth）である。設計書に記載のないファイルを追加してはならない |
| 「全クラスのファイル配置確認は手間がかかりすぎる」 | 手間がかかるからこそ設計段階で確認する。実装後の配置漏れ発見は修正コストが桁違いに高い |
| 「設計網羅性確認は前のゲートで十分」 | 前のゲートはそれぞれの設計領域を検証する。ゲート4は全設計書を横断的に確認する唯一の機会 |
| 「ユーザーが合意したから品質は十分」 | ユーザー合意とQA品質は別の観点。ゲート4の設計網羅性確認はユーザーが判断できない技術的整合性を検証する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Required workflow skills:**
- doc-index-maintenance (aide-powers skill) — program-structure.md 作成後のドキュメントインデックス更新
- git-commit-workflow (aide-powers skill) — フェーズ完了時・QA APPROVED 後のgitコミット
- design-qa-dispatch (aide-powers skill) — ゲート4（最終設計レビュー）の実行
- program-structure-design (aide-powers skill) — プログラム構成設計の手法・ルール（サブエージェント内で使用、新規作成モード）
- pending-issues-management (aide-powers skill) — 問題発見時の記録
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- fs-design-phase9-infra (aide-powers skill)（REQUIRED SUB-SKILL として）

**Next phase:**
- REQUIRED SUB-SKILL: fs-design-phase11-final-check (aide-powers skill)（完全性チェック後、実装ワークフローへ案内）

**QA reviewer:**
- final-design-qa-agent (aide-powers agent) — design-qa-dispatch 経由で呼び出し（ゲート4: 最終設計レビュー）

**Input from caller:**
- feature_name（プロジェクト名）
- specs_dir（`.aide/specs/{feature_name}`）

**Global rules:** `.aide/references/global-rules.md` を厳守
