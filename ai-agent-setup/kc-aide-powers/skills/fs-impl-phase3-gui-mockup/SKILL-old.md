---
name: fs-impl-phase3-gui-mockup
description: "Use when implementing GUI mockup for early user feedback — static layout only, no logic wiring"
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# GUIモックアップ確認

## Overview

gui-design.md に基づきGUIの静的配置（ウィンドウ、タブ、ボタン配置等）のみを実装し、ロジック接続なしの状態でユーザーに確認を依頼する。期待値の乖離を早期に検出し、フィードバックに基づく修正を行う。GUIがないプロジェクトではスキップして次フェーズに直接遷移する。

**Core principle:** GUIモックアップは「静的配置のみ・ロジック接続なし」の状態でユーザーに確認を依頼し、期待値の乖離を早期に検出する。フィードバックにより設計書の修正が必要な場合は、実装ループに入る前に設計同期を完了させる。

## 厳守ルール

以下のルールは Iron Law ではないが、このフェーズスキルで厳守する:

- GUIモックアップは**静的配置のみ**を実装する。ロジック接続・イベントハンドラの実装を行わない
- モックアップ作成要否確認でユーザーが「作成する」を選択した場合、モックアップ実装後はユーザーの「問題なし」確認を得るまでフィードバックループを継続する
- gui-design.md の修正が必要な場合は、必ず `design-sync (aide-powers skill)` を経由する（直接編集しない）

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| GUIモックアップコード | program-structure.md で定義されたGUI関連ファイルパス | gui-design.md に基づく静的配置コード（ロジック接続なし） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-impl-phase3-gui-mockup
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**Skip conditions:**
- gui-design.md が存在しない場合（CLIアプリケーション、ライブラリ、バックエンドサービス等）
- gui-design.md は存在するが、ユーザーがモックアップ確認をスキップする選択肢を選んだ場合

**前提:** fs-impl-phase2-preparation (aide-powers skill) 完了

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: GUI有無判定
- doc-index.md を確認し、gui-design.md の存在を確認する
- 分岐:
  - gui-design.md が存在しない → ユーザーに「GUIがないプロジェクトのため、GUIモックアップ確認をスキップします」と通知 → 後処理へ（次フェーズ遷移）
  - gui-design.md が存在する → Step 2へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step1`, step_title: `GUI有無判定`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: モックアップ作成要否確認
- ユーザーに番号付き選択肢で確認する:
  - 「gui-design.md に基づくGUIモックアップを作成しますか？モックアップは静的配置のみを先に作成し、ユーザーがレイアウトの確認を行う工程です。GUI設計に自信がある等の理由でこの確認をスキップすることもできます。」
    1. はい、モックアップを作成して確認を行う
    2. いいえ、スキップして実装フェーズに進む
    3. その他（自由記述）
- 分岐:
  - 「2. いいえ」（スキップ）を選択 → ユーザーに「GUIモックアップ確認をスキップし、実装フェーズに進みます」と通知 → 後処理へ（次フェーズ遷移）
  - 「1. はい」（作成）を選択 → Step 3へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step2`, step_title: `モックアップ作成要否確認`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: GUIモックアップ実装
- gui-design.md を Read で読み込む
- program-structure.md からGUI関連ファイルの配置先を確認する
- dev-environment.md から開発環境情報を確認する
- Task で micro-impl-agent (aide-powers agent)（implement モード）をディスパッチする:
  - gui-design.md の全画面・全タブ・全ウィジェットの静的配置を実装
  - ロジック接続なし（ボタンクリック等のイベントハンドラは空 or pass）
  - 画面遷移なし（各画面を独立して表示できる状態）
  - 配色・フォント・レイアウトは gui-design.md に従う

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step3`, step_title: `GUIモックアップ実装`, artifact_dir: `.aide/specs/{feature_name}`

### Step 4: ユーザー確認依頼
- ユーザーに以下を伝える:
  - 起動コマンド（dev-environment.md に基づく）
  - 確認してほしいポイント:
    1. ウィンドウサイズ・タイトルは適切か
    2. タブ構成・タブ名は適切か
    3. ボタン・入力欄の配置は適切か
    4. 配色・フォントは見やすいか
    5. その他、気になる点はないか
  - 「ロジックは未接続のため、ボタンを押しても動作しません」と注記

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step4`, step_title: `ユーザー確認依頼`, artifact_dir: `.aide/specs/{feature_name}`

### Step 5: フィードバック収集
- ユーザーからのフィードバックを受け取る
- 分岐:
  - 「問題なし」→ 後処理へ
  - フィードバックあり → フィードバック分析へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step5`, step_title: `フィードバック収集`, artifact_dir: `.aide/specs/{feature_name}`

### Step 6: フィードバック分析
- フィードバック内容を以下に分類する:
  - (A) コード修正のみで対応可能（配置の微調整、色の変更等）→ コード修正（Step 7）へ
  - (B) gui-design.md の修正が必要（画面構成の変更、新規ウィジェット追加等）→ 設計同期（Step 8）へ

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step6`, step_title: `フィードバック分析`, artifact_dir: `.aide/specs/{feature_name}`

### Step 7: コード修正
- Task で micro-impl-agent (aide-powers agent)（fix モード）をディスパッチする:
  - フィードバック内容をそのまま転記
  - 修正対象ファイルを指定
- 修正完了後 → Step 4（ユーザー確認依頼）に戻る

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step7`, step_title: `コード修正`, artifact_dir: `.aide/specs/{feature_name}`

### Step 8: 設計同期（gui-design.md の修正が必要な場合）
- design-sync (aide-powers skill) を起動する:
  - 起因: ユーザーフィードバックによるGUI設計変更
  - 分類: 軽微（レイアウト微修正）/ 中程度（画面構成変更）/ 重大（画面追加・削除）
  - 修正案: フィードバック内容に基づく gui-design.md の修正案
  - ユーザー承認: design-sync (aide-powers skill) 内で取得
- 設計同期完了後:
  - 更新された gui-design.md に基づきモックアップを修正
  - Task で micro-impl-agent (aide-powers agent)（fix モード）をディスパッチする
  - Step 4（ユーザー確認依頼）に戻る

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `step8`, step_title: `設計同期`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase4-execution (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-impl-phase3-gui-mockup`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### ステップ3: micro-impl-agent (aide-powers agent) への指示（implement モード）

Task で micro-impl-agent (aide-powers agent) を以下の指示でディスパッチする:

```
## 実装指示

### タスク情報
- タスク番号: GUI-MOCKUP
- タスク内容: gui-design.md に基づくGUIの静的配置（モックアップ）を実装する

### 実行モード
implement

### 対象ファイル
- 実装ファイル: {program-structure.md から特定したGUI関連ファイルパス}
- テストファイル: なし（モックアップのためテスト不要）

### 設計書（読むべきファイルとセクション）
- {.aide/specs/{feature_name}/gui-design.md} → セクション: 全体
- {.aide/specs/{feature_name}/program-structure.md} → セクション: GUI関連ファイル配置

### 実装ルール（重要）
- **静的配置のみ**: ウィンドウ、タブ、ボタン、入力欄、ラベル等のウィジェット配置のみを実装する
- **ロジック接続禁止**: イベントハンドラは空（pass）にする。ボタンクリック等の処理は実装しない
- **画面遷移なし**: 各画面を独立して表示できる状態にする
- **配色・フォント・レイアウト**: gui-design.md の指定に厳密に従う
- **動作確認試験書の更新**: testing/manual-test-plan.md にGUIモックアップの確認項目を追記する

### テスト観点
なし（モックアップのため自動テスト不要。動作確認試験書で手動確認する）

### 依存先（実装済みファイル）
なし（モックアップは他のコードに依存しない）

### 開発環境情報
- 環境定義ファイル: {.aide/specs/{feature_name}/dev-environment.md}
```

### ステップ7/8後: micro-impl-agent (aide-powers agent) への指示（fix モード）

Task で micro-impl-agent (aide-powers agent) を以下の指示でディスパッチする:

```
## 修正指示

### タスク情報
- タスク番号: GUI-MOCKUP-FIX

### 実行モード
fix

### 対象ファイル
- 実装ファイル: {修正対象のGUIファイルパス}

### レビュー指摘内容
#### ユーザーフィードバック
{ユーザーからのフィードバック内容をそのまま転記}

#### 設計同期による変更（該当する場合）
{design-sync で更新された gui-design.md の変更内容をそのまま転記。
 設計同期がない場合は「なし」}

### 実装ルール（重要）
- **静的配置のみ**: 修正もウィジェット配置の変更のみ。ロジック接続は行わない
- **gui-design.md に従う**: 設計同期後の場合は更新された gui-design.md に従う

### 開発環境情報
- 環境定義ファイル: {.aide/specs/{feature_name}/dev-environment.md}
```

### ステップ8: design-sync (aide-powers skill) への呼び出し情報

design-sync (aide-powers skill) を以下の情報で起動する:

```
- 起因: ユーザーフィードバックによるGUI設計変更
- 問題報告:
  - フィードバック内容: {ユーザーのフィードバックをそのまま転記}
  - 現在のモックアップの状態: {実装済みの画面構成の概要}
  - 乖離の内容: {gui-design.md と期待値の差分}
- 該当する設計ドキュメント: gui-design.md
- 該当する実装ファイル: {GUIモックアップのファイルパス}
- タスクリスト: impl-task-list.md（GUI関連タスクへの影響確認用）
```

### 後処理: git-commit-workflow (aide-powers skill) への呼び出し情報

git-commit-workflow (aide-powers skill) を以下の情報で起動する:

```
- ワークフロー種別: 実装
- feature_name: {feature_name}
- 完了フェーズ: GUIモックアップ確認
- コミット対象: GUIモックアップコード + 更新された gui-design.md（あれば）
- コミットメッセージプレフィックス: feat:
```

## 完了条件

以下の全てを満たすこと:

1. **GUI有無判定が完了している**: gui-design.md の存在確認が行われている
2. **（GUI有りの場合）モックアップ作成要否確認が完了している**: ユーザーに対してモックアップ作成の要否を番号付き選択肢で確認し、合意を得ている
3. **（GUI有り＋モックアップ作成を選択した場合）モックアップが実装されている**: gui-design.md に基づく静的配置が実装済み
4. **（GUI有り＋モックアップ作成を選択した場合）ユーザー確認が完了している**: ユーザーから「問題なし」の回答を得ている
5. **（GUI有り＋モックアップ作成を選択した場合）設計同期が完了している**: gui-design.md の修正が必要だった場合、design-sync (aide-powers skill) が完了している
6. **（GUI有り＋モックアップ作成を選択した場合）gitコミットが完了している**: git-commit-workflow (aide-powers skill) でコミット済み
7. **（スキップ選択時 / GUI無し時）次フェーズへの遷移通知が完了している**: 「GUIモックアップ確認をスキップし、実装フェーズに進みます」とユーザーに通知し、fs-impl-phase4-execution (aide-powers skill) に遷移する状態にある

### ビジュアルコンパニオン活用

以下の場面では `visual-companion (aide-powers skill)` スキルを使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- GUIモックアップの静的レイアウトをブラウザ表示してユーザーに確認
- 実アプリ起動前に画面イメージを視覚的に共有

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。GUIモックアップ確認のルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「モックアップにロジックも少し入れておこう」 | 静的配置のみ。ロジック接続は fs-impl-phase4-execution (aide-powers skill) で行う |
| 「ユーザーに確認せずに次に進もう。見た目は設計通りだから」 | モックアップ作成要否確認でユーザーが明示的にスキップを選択した場合を除き、必ずモックアップ実装後にユーザーに確認を依頼する。設計通りでも期待値と異なる場合がある |
| 「フィードバックは軽微だから gui-design.md は更新しなくていい」 | 画面構成・ウィジェット追加等の変更は必ず design-sync (aide-powers skill) で設計書を更新する |
| 「gui-design.md を直接編集して修正しよう」 | design-sync (aide-powers skill) 共通スキルを経由する。直接編集は禁止 |
| 「GUIがないプロジェクトだが、念のためモックアップを作ろう」 | gui-design.md が存在しない場合はスキップする。不要な作業を行わない |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「静的配置だけでは確認の意味がない」 | レイアウト・配色・ボタン配置の乖離は静的配置で十分検出できる |
| 「フィードバックループは時間の無駄」 | 実装ループに入ってからのGUI修正はコストが桁違いに大きい |
| 「設計同期は大げさ。直接 gui-design.md を修正すればいい」 | 設計同期を経由しないと変更履歴が残らず、タスクリストとの整合性も崩れる |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**前のフェーズスキル:**
- `fs-impl-phase2-preparation (aide-powers skill)` — 環境確認 + タスクリスト生成 + 試験書初期化

**次のフェーズスキル（REQUIRED SUB-SKILL）:**
- `fs-impl-phase4-execution (aide-powers skill)` — 3エージェント体制の実装ループ

**遷移ルール:**
- fs-impl-phase3-gui-mockup 完了後（モックアップ作成・確認・コミットまで実施）: **REQUIRED SUB-SKILL:** fs-impl-phase4-execution (aide-powers skill)
- GUI無しの場合（Step 1で gui-design.md が存在しない）: ユーザーに通知 → **REQUIRED SUB-SKILL:** fs-impl-phase4-execution (aide-powers skill)
- ユーザーがモックアップ作成をスキップした場合（Step 2で「いいえ」を選択）: ユーザーに通知 → **REQUIRED SUB-SKILL:** fs-impl-phase4-execution (aide-powers skill)

**利用する共通スキル:**
- `design-sync (aide-powers skill)` — フィードバックにより gui-design.md の修正が必要な場合に起動
- `git-commit-workflow (aide-powers skill)` — モックアップ確認完了後のコミット
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**利用するエージェント:**
- `micro-impl-agent (aide-powers agent)`（implement モード）— GUIの静的配置を実装
- `micro-impl-agent (aide-powers agent)`（fix モード）— ユーザーフィードバックに基づくモックアップの修正

**Called by:**
- `fs-impl-phase2-preparation (aide-powers skill)` 完了後に自動遷移（REQUIRED SUB-SKILL チェーン）
