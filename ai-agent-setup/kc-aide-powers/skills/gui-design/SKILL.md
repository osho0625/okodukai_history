---
name: gui-design
description: "Use when designing GUI layout, screen composition, navigation flow, and common UI rules for a project with graphical user interface."
---

# GUI設計

## Overview

**Core principle:** ユーザーの目的を達成できるUI構成を設計する。見た目の美しさよりも操作性・わかりやすさを優先し、フレームワーク制約を考慮した現実的な設計を行う。

GUI設計スキルは、画面構成・配色・レイアウト・操作フロー・画面遷移を定義する共通スキルである。新規作成（create）、逆引き（reverse）、差分（delta）の3モードで動作し、全てのワークフローから統一的に利用される。

## Process

**Skip conditions:**
- アプリ形態がCLI、バッチ処理、ライブラリ、APIサーバー等のGUI不要プロジェクト
- user-requirements.md にGUI関連の要件が一切ない
- system-architecture.md にUI層が存在しない
- 逆引きモードでGUIフレームワークのimportが検出されない

**Step 1:** モード判定
- 入力パラメータの mode を確認する
- mode: create → Create プロセスへ
- mode: reverse → Reverse プロセスへ
- mode: delta → Delta プロセスへ

---

### Create プロセス（新規作成モード）

**Step 1:** GUI必要性判定
- user-requirements.md, system-requirements.md, system-architecture.md を Read で確認
- GUI不要 → ユーザーに報告・確認 → SKIPPED ステータスを返す
- GUI必要 → C-2 へ

**Step 2:** gui-designer サブエージェント起動（gui-designer-prompt.md 経由）
- Task でサブエージェントをディスパッチする
- 入力:
  - user-requirements.md
  - system-requirements.md
  - system-architecture.md
- 処理:
  1. 前提成果物の読み込み
  2. 画面一覧の定義
  3. 各画面の構成設計（レイアウト、UI要素、操作フロー、状態表示）
  4. 画面遷移の設計（Mermaid記法）
  5. 共通UIルールの定義
  6. gui-design.md の作成
  7. ユーザーへの提示・合意取得
- ユーザー合意 → DONE ステータスを返す
- 修正要求 → gui-designer を fix モードで再起動
  - C-2 ループ（最大3回。3回を超える場合はユーザーに状況を報告し、続行/中断を確認する）

---

### Reverse プロセス（逆引きモード）

**Step 1:** GUIフレームワーク検出
- program-structure.md とソースコードのimport文を Grep + Read で確認
- GUI未検出 → ユーザーに報告・確認 → SKIPPED ステータスを返す
- GUI検出 → R-2 へ

**Step 2:** gui-reverse-analyzer サブエージェント起動（gui-reverse-prompt.md 経由）
- Task でサブエージェントをディスパッチする
- 入力:
  - program-structure.md
  - user-requirements.md
  - GUIソースコード
- 処理:
  1. GUIフレームワークの特定（tkinter/PyQt/wxPython/Kivy/Web等）
  2. メインウィンドウの解析
  3. 画面・タブの一覧抽出
  4. 各画面のウィジェット解析
  5. ダイアログ・サブウィンドウの解析
  6. スレッド・非同期処理の解析
  7. 共通UIルールの抽出
  8. gui-design.md の作成
  9. ユーザーへの提示・合意取得
- ユーザー合意 → DONE ステータスを返す
- 修正要求 → gui-reverse-analyzer を fix モードで再起動
  - R-2 ループ（最大3回。3回を超える場合はユーザーに状況を報告し、続行/中断を確認する）

---

### Delta プロセス（差分モード）

**Step 1:** 差分内容の確認
- 差分設計書（delta-design.md / fix-design.md / refactoring-design.md）のGUI関連変更を Read で確認する
- GUI変更なし → SKIPPED ステータスを返す
- GUI変更あり → U-2 へ

**Step 2:** gui-designer サブエージェント起動（gui-designer-prompt.md 経由、delta モード）
- Task でサブエージェントをディスパッチする
- 入力:
  - 既存 gui-design.md
  - 差分設計書のGUI変更セクション
- 処理:
  1. 既存 gui-design.md を読み込む（参照のみ、変更しない）
  2. 差分設計書のGUI変更内容を確認する
  3. before→after 形式で差分を作成する（画面追加/削除/変更、遷移変更、UIルール変更）
  4. `{changes_dir}/delta-gui-design.md` を Write で作成する
  5. ユーザーに提示・合意取得
- ユーザー合意 → DONE ステータスを返す
- 修正要求 → gui-designer を fix モードで再起動
  - U-2 ループ（最大3回。3回を超える場合はユーザーに状況を報告し、続行/中断を確認する）

### 完了条件

**DONE（正常完了）:**
- create / reverse モードでは gui-design.md が作成されている
- delta モードでは `{changes_dir}/delta-gui-design.md` が作成されている（既存 gui-design.md は変更しない）
- gui-design.md（create / reverse モード）に以下が含まれている: 画面一覧、各画面の構成、画面遷移図、画面遷移フロー、イベント制御表、状態遷移図、共通UIルール
- ユーザーが内容に合意している

**SKIPPED（スキップ）:**
- GUI不要プロジェクトであることが確認されている
- ユーザーがスキップに同意している

### GUI必要性判定ロジック

以下の条件のいずれかに該当する場合、GUI設計をスキップする:

1. アプリ形態がGUI不要（CLI、バッチ処理、ライブラリ、APIサーバー、デーモン等）
2. user-requirements.md にGUI関連の要件が一切ない
3. system-architecture.md にプレゼンテーション層/UI層が存在しない
4. 逆引きモードで、GUIフレームワークのimportが検出されない

スキップ時は「GUI設計: 該当なし」と明記し、呼び出し元に SKIPPED ステータスを返す。

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「GUIは簡単だから詳細設計は不要」 | 全画面の構成・遷移を定義すること。簡単に見えるGUIほど設計漏れが発生しやすい |
| 「フレームワーク制約を無視した理想的なUIを設計しよう」 | system-requirements.md で決定済みのフレームワークの制約を確認し、実現可能な設計にすること |
| 「ユーザーの合意なしに完了しよう」 | ユーザーの明示的な合意を得ること。GUI設計はユーザーの使い勝手に直結する |
| 「GUI不要プロジェクトだがGUI設計を強行しよう」 | スキップロジックに従い、ユーザーに確認の上スキップすること |
| 「画面遷移図を省略しよう」 | 画面遷移は必須。画面が1つでも、ダイアログやエラー表示の遷移を定義すること |
| 「画面遷移フロー・イベント制御表・状態遷移図を省略しよう」 | 3セクションは全て必須。画面遷移図（Mermaid）だけでは遷移条件・イベント処理・状態管理の詳細が不足する |
| 「逆引きモードで理想の設計を書こう」 | コードの現実を記録する。実際のGUI実装をそのまま記録すること |
| 「Must要件に対応する画面・UI要素の確認を省略しよう」 | user-requirements.md のMust要件すべてに対応するUI要素が存在することを確認すること |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「画面が1つだから遷移図は不要」 | 画面が1つでもダイアログ、エラー表示、確認ダイアログ等の遷移がある。省略しない |
| 「フレームワークは後で決めるからUI設計は自由にやる」 | system-requirements.md で決定済みのフレームワーク制約を必ず考慮する |
| 「逆引きだから現状のUIの問題点も指摘すべき」 | 逆引きモードは「コードの現実を記録する」が原則。改善提案は別途行う |
| 「差分更新だから全体の整合性チェックは不要」 | 差分更新でも、更新後の gui-design.md 全体の整合性を確認する |
| 「レスポンシブ対応は実装時に考える」 | ウィンドウリサイズ時の挙動は設計段階で定義する |

## Integration

**Called by:**
- `fs-design-phase5-gui` (aide-powers skill)（設計WF）— create モード
- `fs-reverse-phase5-optional-phases` (aide-powers skill)（設計逆引きWF）— reverse モード
- `fs-change-phase2-impl` (aide-powers skill)（変更WF）— delta モード（doc-sync (aide-powers skill) 経由）
- バグ修正WF完了フェーズ — delta モード（doc-sync (aide-powers skill) 経由）
- リファクタリングWF完了フェーズ — delta モード（doc-sync (aide-powers skill) 経由）

**Related skills:**
- `doc-index-maintenance` (aide-powers skill) — gui-design.md 作成/更新後のインデックス更新
- `pending-issues-management` (aide-powers skill) — GUI設計中に発見された問題の記録
- `doc-sync` (aide-powers skill) — 差分設計書から gui-design.md への反映（delta モードの上位プロセス）

**Input from caller:**
- `mode` — create / reverse / delta
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `user_requirements_path` — user-requirements.md のパス
- `system_requirements_path` — system-requirements.md のパス（create モード）
- `system_architecture_path` — system-architecture.md のパス（create モード）
- `program_structure_path` — program-structure.md のパス（reverse モード）
- `delta_design_path` — 差分設計書のパス（delta モード）
- `existing_gui_design_path` — 既存 gui-design.md のパス（delta モード）
