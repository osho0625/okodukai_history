---
name: fs-design-phase5-gui
description: "Use when fs-design-phase4-architecture is complete and user has agreed to the system architecture."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# GUI設計（設計フェーズ5）

## Overview

**Core principle:** ユーザーの目的を達成できるUI構成を設計する。見た目の美しさよりも操作性・わかりやすさを優先し、フレームワーク制約を考慮した現実的な設計を行う。

設計ワークフローのフェーズ5として、GUI設計を実行する。GUIが不要なプロジェクト（CLI、バッチ処理、ライブラリ等）の場合はスキップし、次フェーズに遷移する。GUI設計の実作業は gui-design (aide-powers skill) に委譲する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| gui-design.md | .aide/specs/{feature_name}/gui-design.md | GUI設計書（画面一覧・構成・遷移・共通UIルール） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase5-gui
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Skip conditions:**
- アプリ形態がCLI、バッチ処理、ライブラリ、APIサーバー等のGUI不要プロジェクト
- user-requirements.md にGUI関連の要件が一切ない
- system-architecture.md にUI層が存在しない

### 前処理
1. progress-resume-check (aide-powers skill) （進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase5-gui`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: GUI必要性判定
- user-requirements.md, system-requirements.md, system-architecture.md を Read で確認
- 以下の条件のいずれかに該当する場合、GUI設計をスキップする:
  1. system-requirements.md のアプリ形態がGUI不要（CLI、バッチ処理、ライブラリ、APIサーバー、デーモン等）
  2. user-requirements.md にGUI関連の要件が一切ない（画面、UI、表示、操作等のGUI関連キーワードが存在しない）
  3. system-architecture.md にプレゼンテーション層/UI層が存在しない
- GUI不要 → スキップ処理へ
- GUI必要 → Step 2 へ

**スキップ処理:**
1. ユーザーに報告・確認: 「このプロジェクトはGUIが不要と判断しました。GUI設計をスキップして次のフェーズに進みます。」と報告し、確認を得る
   - ユーザー同意 → S-2 へ
   - ユーザーが「GUIは必要」と回答 → Step 2 へ
2. doc-index.md に「⏭️ スキップ」記録
   - REQUIRED SUB-SKILL: doc-index-maintenance (aide-powers skill)
   - gui-design.md のエントリを「⏭️ スキップ」ステータスで記録する
   - gui-design.md ファイルは作成しない
3. 次フェーズへ遷移 → 後処理へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase5-gui`, step_id: `step1`, step_title: `GUI必要性判定`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: gui-design (aide-powers skill) 呼び出し（phase5 モード）
- REQUIRED SUB-SKILL: gui-design (aide-powers skill)
- gui-design (aide-powers skill) を phase5 モードで呼び出す
- 渡す情報:
  - mode: phase5
  - feature_name: {feature_name}
  - specs_dir: .aide/specs/{feature_name}
  - user_requirements_path: .aide/specs/{feature_name}/user-requirements.md
  - system_requirements_path: .aide/specs/{feature_name}/system-requirements.md
  - system_architecture_path: .aide/specs/{feature_name}/system-architecture.md
- gui-design (aide-powers skill) 内部で以下が実行される:
  1. user-requirements.md, system-requirements.md, system-architecture.md を読み込む
  2. 必要な画面を洗い出す
  3. 各画面の構成（レイアウト、UI要素、操作フロー）を設計する
  4. 画面遷移を定義する
  5. 共通UIルール（フォント、色、余白等の方針）を定義する
  6. gui-design.md に成果物を作成する
  7. ユーザーに提示し合意を得る
- ステータス判定:
  - DONE → Step後処理を実行し、Step 3 へ
  - SKIPPED → スキップ処理へ（共通スキル側でGUI不要と判定された場合）
  - BLOCKED → ユーザーに状況を報告し、対応を確認する

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase5-gui`, step_id: `step2`, step_title: `gui-design (aide-powers skill) 呼び出し（phase5 モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: ユーザー合意確認
- gui-design (aide-powers skill) がユーザー合意を取得済みか確認する
- 合意済み（DONE） → Step後処理を実行し、後処理へ
- 修正要求 → gui-design (aide-powers skill) を fix モードで再呼び出し
  - 渡す情報:
    - mode: fix（修正モード）
    - feature_name: {feature_name}
    - specs_dir: .aide/specs/{feature_name}
    - fix_instructions: {ユーザーの修正指示}
  - 合意が得られるまで繰り返す → Step 3 へ

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase5-gui`, step_id: `step3`, step_title: `ユーザー合意確認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill) （gui-design.md を「✅ 完了」ステータスで記録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill) （gui-design.md のコミット）
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase6-usecase (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase5-gui`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### GUI必要性判定ロジック（詳細）

以下の条件のいずれかに該当する場合、GUI設計をスキップする:

| # | 条件 | 確認方法 |
|---|---|---|
| 1 | アプリ形態がGUI不要 | system-requirements.md の「アプリ形態」「実行形態」セクションを確認。CLI、バッチ処理、ライブラリ、APIサーバー、デーモン等 |
| 2 | GUI関連の要件が一切ない | user-requirements.md 全文を確認。「画面」「UI」「表示」「操作」「ウィンドウ」「ボタン」「入力」等のGUI関連キーワードが存在しない |
| 3 | UI層が存在しない | system-architecture.md のアーキテクチャ図・ブロック図を確認。プレゼンテーション層、UI層、View層等のGUI関連コンポーネントが含まれていない |

**判定の優先順位:**
- 3つの条件のうち1つでも該当すればスキップ候補とする
- ただし、最終判断はユーザーに確認する（ユーザーが「GUIは必要」と回答した場合はGUI設計を実行する）

### 完了条件

以下のいずれかを満たすこと:

**GUI必要の場合:**
1. gui-design.md が `.aide/specs/{feature_name}/gui-design.md` に作成されている
2. gui-design.md に以下が含まれている:
   - 画面一覧（画面名、画面ID、種類、目的）
   - 各画面の構成（レイアウト、UI要素、操作フロー、状態表示）
   - 画面遷移図（Mermaid記法）
   - 共通UIルール（フォント、色、余白、ボタン、レスポンシブ対応、アクセシビリティ）
3. ユーザーが gui-design.md の内容に合意している
4. doc-index-maintenance (aide-powers skill) が完了している
5. git-commit-workflow (aide-powers skill) が完了している
6. 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
7. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
8. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
9. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

**GUI不要の場合:**
1. ユーザーがGUI設計スキップに同意している
2. doc-index.md に gui-design.md が「⏭️ スキップ」ステータスで記録されている

### 報告ステータス

| ステータス | 意味 |
|---|---|
| DONE | 正常完了。gui-design.md 作成済み、ユーザー合意済み、コミット済み |
| SKIPPED | GUI不要のためスキップ。ユーザー確認済み、doc-index.md 記録済み |
| BLOCKED | 続行不可能な問題が発生（ユーザーに状況を報告） |

### ビジュアルコンパニオン活用

以下の場面では `visual-companion` (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- 画面レイアウト・UI要素配置のモックアップをブラウザ表示
- 画面遷移図・ナビゲーションフローの視覚的提示
- 配色・フォントサイズ等のデザイン要素の確認

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「GUIは簡単だから詳細設計は不要」 | 全画面の構成・遷移を定義すること。簡単に見えるGUIほど設計漏れが発生しやすい |
| 「フレームワーク制約を無視した理想的なUIを設計しよう」 | system-requirements.md で決定済みのフレームワーク（tkinter等）の制約を確認し、実現可能な設計にすること |
| 「ユーザーの合意なしに次フェーズに進もう」 | ユーザーの明示的な合意を得ること。GUI設計はユーザーの使い勝手に直結する |
| 「GUI不要プロジェクトだがGUI設計を強行しよう」 | スキップロジックに従い、ユーザーに確認の上スキップすること |
| 「画面遷移図を省略しよう」 | 画面遷移は必須。画面が1つでも、ダイアログやエラー表示の遷移を定義すること |
| 「gui-design (aide-powers skill) を使わず直接設計しよう」 | GUI設計の実作業は gui-design (aide-powers skill) に委譲する。フェーズスキルは制御フローのみ担当する |
| 「スキップ時に doc-index.md の更新を忘れた」 | スキップ時も必ず doc-index-maintenance (aide-powers skill) で「⏭️ スキップ」ステータスを記録すること |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「画面が1つだから遷移図は不要」 | 画面が1つでもダイアログ、エラー表示、確認ダイアログ等の遷移がある。省略しない |
| 「フレームワークは後で決めるからUI設計は自由にやる」 | system-requirements.md で決定済みのフレームワーク制約を必ず考慮する。未決定なら先にフェーズ2に戻る |
| 「CLIだけどGUI設計もやっておこう」 | GUI不要プロジェクトにGUI設計を強行しない。スキップロジックに従う |
| 「ユーザーが忙しそうだから合意確認を省略しよう」 | GUI設計はユーザーの使い勝手に直結する。必ず合意を得る |
| 「共通スキルを呼ぶのは面倒だから直接やろう」 | gui-design (aide-powers skill) に設計方針・プロセス・フォーマットが定義されている。必ず共通スキル経由で実行する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前フェーズ:**
- `fs-design-phase4-architecture` (aide-powers skill) （システム構成設計）から REQUIRED SUB-SKILL として遷移

**次フェーズ:**
- REQUIRED SUB-SKILL → `fs-design-phase6-usecase` (aide-powers skill) （ユースケース分析）

**呼び出す共通スキル:**
- `gui-design` (aide-powers skill) — GUI設計の実作業（create / fix モード）
- `doc-index-maintenance` (aide-powers skill) — doc-index.md の更新（完了 / スキップ）
- `git-commit-workflow` (aide-powers skill) — gui-design.md のコミット
- `pending-issues-management` (aide-powers skill) — GUI設計中に発見された問題の記録（随時）
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- 設計ワークフロー（fs-design-phase4-architecture (aide-powers skill) 完了後）

**Input from caller:**
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`

**Global rules:** `.aide/references/global-rules.md` を厳守
