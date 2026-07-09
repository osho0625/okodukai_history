# 差分設計

## 変更概要

変更WF（10フェーズ→3フェーズ）とバグ修正WF（7フェーズ→3フェーズ）のフェーズ統合を行う。
旧フェーズの各Stepの粒度はそのまま維持し、新フェーズ内で通し番号に連番化する。
旧フェーズ単位の塊を `#` 見出しで区切って認識可能にする。

Phase 3（最終整合性チェック）は現状の final-check と同じ役割・同じ内容を維持する。

## 新フェーズ構成

### 変更WF（10→3フェーズ）

| 新フェーズ | 新スキル名 | 含まれる旧フェーズ | 役割 |
|---|---|---|---|
| Phase 1（分析・計画） | fs-change-phase1-analysis | 旧Phase 1〜4 | 設計書ゲート、要件定義、影響分析、対応方針 |
| Phase 2（設計・実装・完了処理） | fs-change-phase2-impl | 旧Phase 5〜9 | 差分設計、影響再検討、タスク計画、実装、完了処理 |
| Phase 3（最終整合性チェック） | fs-change-phase3-final-check | 旧Phase 10 | 進捗ファイル完全性チェック（現状と同じ） |

### バグ修正WF（7→3フェーズ）

| 新フェーズ | 新スキル名 | 含まれる旧フェーズ | 役割 |
|---|---|---|---|
| Phase 1（分析・計画） | fs-bugfix-phase1-analysis | 旧Phase 1〜3 | バグ報告、原因分析、修正方針確定 |
| Phase 2（設計・実装・ドキュメント反映） | fs-bugfix-phase2-impl | 旧Phase 4〜6 | 差分設計、実装、ドキュメント反映 |
| Phase 3（最終整合性チェック） | fs-bugfix-phase3-final-check | 旧Phase 7 | 進捗ファイル完全性チェック（現状と同じ） |

---

## 統合ルール

### 前処理・後処理

- **前処理**（progress-resume-check + phase-compliance-check verify）は新フェーズ全体で **1回のみ** 実行する
- **後処理**（doc-index-maintenance + phase-compliance-check write + git-commit-workflow 等）は新フェーズ全体で **1回のみ** 実行する
- 旧フェーズごとに前処理・後処理を繰り返さない（これがフェーズ統合の主目的）

### 旧フェーズの Process 以外の記述の扱い

旧フェーズスキルには Process（前処理・Step・後処理）以外に以下のセクションが存在する:
- Overview / The Iron Law
- Red Flags - STOP
- Common Rationalizations
- Integration（呼び出す共通スキル、前後フェーズ遷移）
- 完了条件
- 報告ステータス
- サブエージェントへの情報渡し
- ビジュアルコンパニオン活用

**統合方針:**

| 記述の種類 | 扱い |
|---|---|
| **複数旧フェーズに共通する記述**（例: 「フェーズ省略禁止」「ヒアリング優先」等） | 新スキルの冒頭に **共通ルール** セクションとして1箇所にまとめる。重複排除 |
| **特定Stepに固有の記述**（例: 「OCP検討必須」は旧Phase4固有） | 該当 `#` 見出し区画の直後に配置し、Step からアンカーリンクで参照する。例: `※ [Red Flags: 対応方針策定](#red-flags-対応方針策定) 参照` |
| **Iron Law** | フェーズ全体に適用される普遍的ルールのみ冒頭に **The Iron Laws** として列挙する。特定Stepにしか適用されないルール（例: 「影響分析は両視点必須」「OCP検討必須」）は Iron Law に含めず、該当Stepの注記として配置する |
| **Red Flags / Common Rationalizations** | 関連する `#` 見出し区画の末尾に配置する。複数区画に共通するものは共通セクションに配置 |
| **Integration（呼び出す共通スキル）** | 新スキルの末尾に統合した **Integration** セクションを配置。全旧フェーズの呼び出し先を網羅 |
| **完了条件** | 新フェーズ全体の完了条件として統合。各旧フェーズの完了条件は中間チェックポイントとして `#` 区画内に残す |
| **報告ステータス** | サブエージェントの報告ステータスは各 Step の記述内に残す |
| **サブエージェントへの情報渡し** | 各 Step の記述内に残す（該当 Step で使用するため） |

### アンカーリンクの形式

Step から関連する注意事項を参照する場合:
```markdown
Step 12: サブエージェント起動: change-approach-planner-prompt.md
- ※ [Iron Law: OCP検討必須](#iron-law-ocp検討必須) を遵守すること
- ※ [Red Flags: 対応方針策定](#red-flags-対応方針策定) 参照
```

### 記述品質ルール（全新スキル共通）

- **経緯・言い訳・冗長な説明を書くな。** スキルの役目達成に必要な情報のみで構成する
- 「旧Phase X〜Y を統合したものであり〜」のような統合経緯の説明は不要
- 「各旧フェーズの Step 粒度はそのまま維持している」のような設計判断の説明は不要
- Overview には「このスキルが何をするか」だけを書く。「なぜこうなったか」は書かない

---

## 新スキル Process 定義

### fs-change-phase1-analysis

#### step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を Call する。前処理完了時も同様。
個別 Step への記載は省略するが、実行時は必ず各 Step 末尾で Call すること。

#### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）
   - フェーズ1のため署名検証スキップで自動 PASS

---

# 設計書ゲート（旧Phase 1）

#### Step 1: HARD-GATE: 設計書ゲート
- design-gate (aide-powers skill) を実行する
- PASS → Step 2へ
- FAIL → pending-issues 登録 → ワークフロー終了

#### Step 2: 設計書ゲート PASS 確認
- design-gate の結果をユーザーに報告する

---

# 変更要件定義（旧Phase 2）

#### Step 3: 設計ドキュメント読み込み
- doc-index.md、user-requirements.md、program-structure.md を Read で読み込む

#### Step 4: 前フェーズ結果確認
- フェーズ1のステータスレポートを確認する

#### Step 5: サブエージェント起動: change-requirements-prompt.md（mode: phase1）
- Task でサブエージェントをディスパッチする
- ヒアリング → change-requirements.md 作成 → ユーザー合意

#### Step 6: 完了条件チェック
- change-requirements.md が作成されユーザーの合意を得たか確認

---

# 影響範囲分析 + フォルダ統合判定（旧Phase 3）

#### Step 7: 影響範囲分析（サブエージェント委譲）
- change-impact-analyzer-prompt.md を使用して Task でサブエージェントをディスパッチする
- 設計ドキュメント読み込み → アクター視点分析 → プログラム構成視点分析 → 起因元特定 → impact-analysis.md 作成

#### Step 8: 影響分析結果の確認
- impact-analysis.md の内容を Read で確認する

#### Step 9: フォルダ統合判定
- folder-merge-check (aide-powers skill) を呼び出し、changes_dir を確定する

---

# 対応方針策定（旧Phase 4）

#### Step 10: 設計ドキュメント読み込み
- doc-index.md、program-structure.md、object-design-*.md を Read で読み込む

#### Step 11: 前フェーズ成果物確認
- change-requirements.md、impact-analysis.md を Read で読み込む

#### Step 12: サブエージェント起動: change-approach-planner-prompt.md（mode: phase3）
- Task でサブエージェントをディスパッチする
- OCP原則検討 → リファクタリング検討 → approach.md 作成 → ユーザー合意

#### Step 13: 完了条件チェック
- approach.md が作成されユーザーの合意を得たか、または refactoring-request.md が作成されたか確認

#### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-change-phase2-impl）

---

### fs-change-phase2-impl

#### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

---

# 差分設計（旧Phase 5）

#### Step 1: 設計系共通スキル呼び出し判定
- impact-analysis.md + approach.md を Read で読み込む
- 影響を受ける設計領域を特定する
- 局所的変更 → change-delta-designer のみ
- 広範囲変更 → 設計系共通スキルの差分モードを呼び出す

#### Step 2: 差分設計の作成
- change-delta-designer-prompt.md に基づき Task でサブエージェントをディスパッチする
- delta-design.md を Write で作成

#### Step 3: ユーザー承認
- delta-design.md の内容をユーザーに提示し合意を得る

#### Step 4: QAレビュー
- design-qa-dispatch (aide-powers skill) を呼び出す
- APPROVED → Step 6へ
- REJECTED → Step 5へ

#### Step 5: fix → 再QA ループ
- QA指摘に基づき delta-design.md を修正
- 再QAレビュー実行（APPROVED になるまで繰り返す）

---

# 影響範囲再検討（旧Phase 6）

#### Step 6: サブエージェント委譲: 影響範囲再精査
- change-impact-reviewer-prompt.md を使用して Task でサブエージェントをディスパッチする
- シグネチャ変更全件追跡 → 既存要件矛盾確認 → テスト対象機能特定 → impact-analysis.md 更新 → ユーザー合意

#### Step 7: 完了条件チェック
- シグネチャ変更全件追跡完了、既存要件矛盾確認完了、ユーザー合意取得済みか確認

---

# 差分タスクリスト作成（旧Phase 7）

#### Step 8: 設計ドキュメント読み込み
- doc-index.md、program-structure.md を Read で読み込む

#### Step 9: 前フェーズ成果物読み込み
- delta-design.md、impact-analysis.md、approach.md を Read で読み込む

#### Step 10: 共通スキル参照: impl-task-planning (aide-powers skill)
- タスク分解のルール・手順を適用

#### Step 11: サブエージェント起動: change-task-planner-prompt.md
- Task でサブエージェントをディスパッチする
- タスク分解 → 依存関係整理 → delta-task-list.md 作成 → ユーザー合意
- impl-process-checklist.md を生成する

#### Step 12: 完了条件チェック
- delta-task-list.md が作成されユーザーの合意を得たか確認

---

# 差分実装（旧Phase 8）

#### Step 13: 工程チェック表存在確認 HARD-GATE
- impl-process-checklist.md の存在確認
- 存在しない → ワークフロー中断

#### Step 14: 実行計画策定
- delta-task-list.md を Read で読み込み、実行順序を確定する
- dev-environment.md、doc-index.md を Read で読み込む

#### Step 15: レベル別実装ループ
- 各タスクについて multi-stage-code-review (aide-powers skill) を呼び出す
- Stage 1: 実装コードレビュー → Stage 2: テストコードレビュー → Stage 3: テスト実行

#### Step 16: レビュー結果受領後の判断フロー
- FAIL/合理的乖離/WARNING の判定と対応

#### Step 17: リグレッションテスト
- 全タスク完了後、既存テスト全実行

#### Step 18: ユーザー動作検証依頼
- 変更した機能の動作検証をユーザーに依頼する

---

# 設計書反映・完了処理（旧Phase 9）

#### Step 19: 設計書反映
- doc-sync (aide-powers skill) に従いサブエージェントに委譲する
- history.md を初期作成する

#### Step 20: pending-issues 書き込み忘れチェック
- pending-issues-management (aide-powers skill: check) を呼び出す

#### Step 21: 変更完了の案内
- 変更内容サマリー、更新設計書一覧、テスト結果、gitコミット情報をユーザーに提示する

#### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-change-phase3-final-check）

---

### fs-change-phase3-final-check

現状の fs-change-phase10-final-check と同じ**役割**だが、以下の表現変更がある:
- スキル名: `fs-change-phase10-final-check` → `fs-change-phase3-final-check`
- total_phases: 9 → 2（自フェーズを除く前フェーズ数）
- 前フェーズ skill_name: `fs-change-phase9-completion` → `fs-change-phase2-impl`
- Integration の前フェーズ遷移元: `fs-change-phase9-completion` → `fs-change-phase2-impl`
- Step 4 に REQ-C-006 の履歴ファイル一括削除を追加
- step-history-writer 呼び出しルールを適用（全Step共通）

#### step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を Call する。前処理完了時も同様。

#### 前処理
1. progress-resume-check (aide-powers skill)
2. phase-compliance-check (aide-powers skill: verify)
   - 直前フェーズ `fs-change-phase2-impl` の署名を検証する

#### Step 1: セッションヒストリーの取得
- セッション内で取得可能な会話履歴全文をテキストとして構築する

#### Step 2: 検証用agentの呼び出し
- progress-final-checker (aide-powers agent) を invoke_sub_agent で起動する
- workflow_name: change, total_phases: 2（自フェーズを除く）

#### Step 3: 検証結果の処理
- PASS → ワークフロー正常完了
- FAIL → ユーザーに問題内容を通知、リセット確認
- UNCERTAIN → ユーザーに判断を委ねる

#### Step 4: 一時ファイルの削除
- temp/session-history.txt を削除する
- `.aide/tmp/session-history-*.txt`（Phase 1, Phase 2 で step-history-writer が書き出した全Step履歴ファイル）を一括削除する
- FAIL の場合は調査用に残す（削除しない）

#### 後処理
1. git-commit-workflow (aide-powers skill)（進捗ファイル ✅ 完了 更新後にコミット — §6.5 準拠）

---

### fs-bugfix-phase1-analysis

#### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）
   - フェーズ1のため署名検証スキップで自動 PASS

---

# バグ報告ヒアリング（旧Phase 1）

#### Step 1: 作業ディレクトリの準備
- bugfix_dir の命名規則に従いパスを決定する

#### Step 2: バグ報告ヒアリング（サブエージェント派遣）
- bugfix-reporter-prompt.md を Read で読み込み、Task でサブエージェントをディスパッチする
- ユーザーの発言から情報抽出 → 不足情報を質問 → bug-report.md 作成 → ユーザー合意

#### Step 3: 成果物の確認
- bug-report.md が作成されていることを確認する

---

# 原因分析 + フォルダ統合判定（旧Phase 2）

#### Step 4: HARD-GATE: design-gate (aide-powers skill) 共通スキルの呼び出し
- 設計書の完了状態を確認する
- PASS → Step 5へ
- FAIL → pending-issues 登録 → ワークフロー終了

#### Step 5: 原因分析サブエージェントの派遣
- bugfix-analyzer-prompt.md に従い Task でサブエージェントを派遣する
- パート1: 現状把握（設計ドキュメント読み込み、テスト全実行）
- パート2: 原因分析（関連コード特定、原因箇所特定、影響範囲分析、起因元特定、bug-analysis.md 作成、ユーザー合意）

#### Step 6: folder-merge-check (aide-powers skill) 共通スキルの呼び出し（フォルダ統合判定）
- bug-analysis.md の「起因元ドキュメントフォルダ」を確認し、統合判定を実行する

#### Step 7: 完了確認
- bug-analysis.md が作成され、ユーザーの合意が得られ、bugfix_dir が確定した状態を確認

---

# バグ修正方針確定（旧Phase 3）

#### Step 8: 設計ドキュメントの読み込み
- doc-index.md、program-structure.md、dev-environment.md、関連設計書を Read で読み込む

#### Step 9: サブエージェント派遣（bugfix-planner-prompt.md）
- Task でサブエージェントをディスパッチする
- 原因説明 → 修正方法検討 → 根本/暫定判定 → 3点セット提示 → 副作用リスク分析 → テスト方針策定 → fix-plan.md 作成 → ユーザー合意

#### Step 10: 完了確認
- fix-plan.md が作成され、対策種別・副作用リスク・テスト方針が含まれ、ユーザー合意が得られたか確認

#### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-bugfix-phase2-impl）

---

### fs-bugfix-phase2-impl

#### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

---

# バグ修正差分設計（旧Phase 4）

#### Step 1: 設計系共通スキル呼び出し判定
- bug-analysis.md と fix-plan.md を Read で読み、影響が及ぶ設計領域を特定する
- 局所修正 → bugfix-designer のみ
- 広範囲 → 設計系共通スキルの差分モードを呼び出す

#### Step 2: 差分設計の作成
- bugfix-designer サブエージェント（bugfix-designer-prompt.md 経由）を Task でディスパッチする
- fix-design.md を作成する

#### Step 3: ユーザー承認
- fix-design.md の内容をユーザーに提示し合意を得る

#### Step 4: QAレビューの実行
- design-qa-dispatch (aide-powers skill) を呼び出す
- APPROVED → Step 6へ
- REJECTED → Step 5へ

#### Step 5: REJECTED → 修正 → 再QA ループ
- bugfix-designer（fixモード）で fix-design.md を修正
- 再QAレビュー実行（APPROVED になるまで繰り返す）

#### Step 6: タスク分解
- impl-task-planning (aide-powers skill) を呼び出す
- fix-design.md のタスクセクションを更新する
- impl-process-checklist.md を生成する

---

# バグ修正実装（旧Phase 5）

#### Step 7: 工程チェック表存在確認 HARD-GATE
- impl-process-checklist.md の存在確認
- 存在しない → ワークフロー中断

#### Step 8: タスクリスト読み込み
- fix-design.md のタスク分解セクションを Read で読み込む
- dev-environment.md を Read で読み込み、テスト実行コマンドを確認する

#### Step 9: タスク実行ループ
- 各タスクについて multi-stage-code-review (aide-powers skill) を呼び出す
- Stage 1: 実装コードレビュー → Stage 2: テストコードレビュー → Stage 3: テスト実行

#### Step 10: 設計同期（必要な場合のみ）
- design-sync (aide-powers skill) を呼び出すトリガー発生時に実行

#### Step 11: 全タスク完了後
- 全タスク完了・全テストパス確認
- ユーザーに動作検証を依頼する

---

# ドキュメント反映・完了処理（旧Phase 6）

#### Step 12: ドキュメント反映
- doc-sync (aide-powers skill) を呼び出す
- fix-design.md、fix-plan.md の内容を既存設計書に反映する
- history.md に不具合修正エントリを追記する

#### Step 13: pending-issues 書き込み忘れチェック
- pending-issues-management (aide-powers skill: check) を呼び出す

#### Step 14: バグ修正完了の案内
- 修正内容サマリー、更新設計書一覧、テスト結果、gitコミット情報をユーザーに提示する

#### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-bugfix-phase3-final-check）

---

### fs-bugfix-phase3-final-check

現状の fs-bugfix-phase7-final-check と同じ**役割**だが、以下の表現変更がある:
- スキル名: `fs-bugfix-phase7-final-check` → `fs-bugfix-phase3-final-check`
- total_phases: 6 → 2（自フェーズを除く前フェーズ数）
- 前フェーズ skill_name: `fs-bugfix-phase6-doc` → `fs-bugfix-phase2-impl`
- Integration の前フェーズ遷移元: `fs-bugfix-phase6-doc` → `fs-bugfix-phase2-impl`
- Step 4 に REQ-C-006 の履歴ファイル一括削除を追加
- step-history-writer 呼び出しルールを適用（全Step共通）

#### step-history-writer 呼び出しルール（全Step共通）

全ての Step 完了時に `step-history-writer (aide-powers skill)` を Call する。前処理完了時も同様。

#### 前処理
1. progress-resume-check (aide-powers skill)
2. phase-compliance-check (aide-powers skill: verify)
   - 直前フェーズ `fs-bugfix-phase2-impl` の署名を検証する

#### Step 1: セッションヒストリーの取得
- セッション内で取得可能な会話履歴全文をテキストとして構築する

#### Step 2: 検証用agentの呼び出し
- progress-final-checker (aide-powers agent) を invoke_sub_agent で起動する
- workflow_name: bugfix, total_phases: 2（自フェーズを除く）

#### Step 3: 検証結果の処理
- PASS → ワークフロー正常完了
- FAIL → ユーザーに問題内容を通知、リセット確認
- UNCERTAIN → ユーザーに判断を委ねる

#### Step 4: 一時ファイルの削除
- temp/session-history.txt を削除する
- `.aide/tmp/session-history-*.txt`（Phase 1, Phase 2 で step-history-writer が書き出した全Step履歴ファイル）を一括削除する
- FAIL の場合は調査用に残す（削除しない）

#### 後処理
1. git-commit-workflow (aide-powers skill)（進捗ファイル ✅ 完了 更新後にコミット — §6.5 準拠）

---

## REQ-C-006: セッション履歴Step単位書き出し

### 実装方式: step-history-writer スキル（新規作成）

`step-history-writer` (aide-powers skill) を新規作成し、各Step完了時にCallする。
書き出しロジックを1箇所に集約することで、41フェーズスキル全てに書き出しロジックを埋め込む必要をなくす。

**呼び出し方（各フェーズスキルの各Step末尾に追加）:**
```
Step N 完了後: step-history-writer (aide-powers skill) を Call する
  - skill_name: 現在のフェーズスキル名
  - step_id: "前処理" / "step{N}" 
  - step_title: Step のタイトル文字列
```

### 重要ルール（step-history-writer スキルが遵守すべきルール）

- **要約禁止**: 議事録のようにそのまま出力する。要約・圧縮・省略は一切しない
- **ユーザー発言とAI回答を分けて記述**: `Role: user` / `Role: assistant` で明確に分離する
- **省略禁止**: ユーザーの発言もAIの回答も全文をそのまま記録する
- ツール呼び出し（invoke_sub_agent, discloseContext 等）の引数と結果も記録する
- 改変・編集・偽装した内容を書き出してはならない

### ファイル命名規則

```
.aide/tmp/session-history-{フェーズスキル名}-{step_id}.txt
```

| step_id | 意味 |
|---|---|
| `前処理` | 前処理（progress-resume-check + compliance-check verify）の履歴 |
| `step{N}` | Step N の履歴（N は通し番号） |

**例（変更WF Phase 1 の場合）:**
```
.aide/tmp/session-history-fs-change-phase1-analysis-前処理.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step1.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step2.txt
.aide/tmp/session-history-fs-change-phase1-analysis-step3.txt
...
.aide/tmp/session-history-fs-change-phase1-analysis-step13.txt
```

### 書き出しフォーマット

```
== {フェーズスキル名} {step_id}: {step_title} ==
Timestamp: {YYYY-MM-DD HH:MM}

Role: assistant
Content: change-requirements.md を作成するためにサブエージェントを起動します。
Action: invoke_sub_agent("general-task-execution")
Input: {サブエージェントに渡した全引数そのまま}
Result: {サブエージェントの返却結果全文そのまま}

Role: assistant
Content: change-requirements.md が作成されました。内容を確認してください。
（以下、ユーザーに提示した内容全文）

Role: user
Content: 1（はい、この内容で合意）

Role: assistant
Content: ユーザー合意確認済み。
```

### 書き出しタイミング

- 前処理完了時: `step_id: "前処理"` で書き出す
- 各Step完了時: `step_id: "step{N}"` で書き出す
- 後処理: 書き出し不要（後処理自体が compliance-checker への渡しであり、後処理の内容は compliance-checker が検証結果として記録する）

### compliance-checker への渡し方

後処理で compliance-checker に `session_history_files`（配列）で全ファイルパスを渡す:
```
session_history_files: [
  ".aide/tmp/session-history-fs-change-phase1-analysis-前処理.txt",
  ".aide/tmp/session-history-fs-change-phase1-analysis-step1.txt",
  ".aide/tmp/session-history-fs-change-phase1-analysis-step2.txt",
  ...
]
```

### 削除タイミング

final-check（Phase 3）PASS後に一括削除する。FAIL の場合は調査用に残す。

### 適用範囲

全7WFの全フェーズスキル（変更WF、バグ修正WF、設計WF、実装WF、企画WF、リファクタリングWF、逆引きWF）。

### git-commit タイミングの統一（全7WF共通）

全WFにおいて、git-commit-workflow は**最終フェーズ（final-check）の進捗ファイル ✅ 完了 更新後**に実行する（progress-file-format.md §6.5 準拠）。

- 最終フェーズ以外のフェーズの後処理には git-commit-workflow を含めない
- 最終フェーズの後処理に git-commit-workflow を配置する
- これにより、進捗ファイルの全フェーズ ✅ 完了 状態がコミットに含まれることを保証する

**対象（全7WFの最終フェーズ）:**

| WF | 最終フェーズスキル | 対応 |
|---|---|---|
| 変更（新） | fs-change-phase3-final-check | 本設計で対応済み |
| バグ修正（新） | fs-bugfix-phase3-final-check | 本設計で対応済み |
| 企画 | fs-planning-phase4-final-check | REQ-C-006 実装時に確認・修正 |
| 設計 | fs-design-phase11-final-check | REQ-C-006 実装時に確認・修正 |
| 実装 | fs-impl-phase7-final-check | REQ-C-006 実装時に確認・修正 |
| 設計逆引き | fs-reverse-phase6-final-check | REQ-C-006 実装時に確認・修正 |
| リファクタリング | fs-refactoring-phase7-final-check | REQ-C-006 実装時に確認・修正 |

### 新規作成するスキル

| スキル名 | パス | 役割 |
|---|---|---|
| step-history-writer | skills/step-history-writer/SKILL.md | 各Step完了時の履歴書き出し共通スキル |

---

## 参照ファイルの更新（実装時に更新）

| # | ファイル | 更新内容 | タイミング |
|---|---|---|---|
| 1 | skills/using-aide-powers/SKILL.md | エントリポイントスキル名を `fs-change-phase1-analysis` / `fs-bugfix-phase1-analysis` に更新 | 実装時 |
| 2 | skills/using-aide-powers/references/global-rules.md | ルーティングテーブルのスキル名を更新 | 実装時 |
| 3 | .kiro/steering/aide-powers-global-rules.md | エントリポイントスキル名を更新（rules-distribute で自動再生成） | 実装後 |
| 4 | .aide/references/progress-file-format.md | §7.5 / §7.6 を3フェーズテンプレートに更新 | 実装時 |
| 5 | skills/phase-compliance-check/SKILL.md | session_history_files パラメータ対応（配列）に変更 | 実装時 |
| 6 | agents/compliance-checker.md | session_history_files 入力仕様を配列対応に変更 | 実装時 |
| 7 | agents/progress-final-checker.md | total_phases を 2（自フェーズ除く）に更新 | 実装時 |
| 8 | skills/aide-powers-guide/SKILL.md | ワークフロー選択ガイドのエントリポイントスキル名を更新 | 実装後 |
| 9 | .aide/specs/aide-powers/dev-environment.md | §11 エントリポイントスキル名を更新 | 実装後 |
| 10 | docs-dev/00-overview.md | ワークフロー一覧テーブルのエントリポイントスキル名を更新 | 実装後 |
| 11 | docs-dev/02-ai-agent/00-overview.md | ワークフロー一覧テーブルのスキル名を更新 | 実装後 |
| 12 | docs-dev/02-ai-agent/02-phase-skills/change.md | 変更WFの全フェーズ一覧を3フェーズに更新 | 実装後 |
| 13 | docs-dev/02-ai-agent/02-phase-skills/bugfix.md | バグ修正WFの全フェーズ一覧を3フェーズに更新 | 実装後 |
| 14 | docs-dev/02-ai-agent/01-workflows/05-change.md | 変更WFのフロー図・フェーズ遷移を更新 | 実装後 |
| 15 | docs-dev/03-how-to/add-phase-skill.md | フェーズスキル命名規則の例示を更新 | 実装後 |
| 16 | docs-dev/01-system-platform/01-hub-skill-activation.md | ハブスキルのルーティングテーブルを更新 | 実装後 |

## 削除対象

| ファイル | 理由 |
|---|---|
| skills/fs-change-phase1-status/SKILL.md | fs-change-phase1-analysis に統合 |
| skills/fs-change-phase2-requirements/SKILL.md | fs-change-phase1-analysis に統合 |
| skills/fs-change-phase3-impact/SKILL.md | fs-change-phase1-analysis に統合 |
| skills/fs-change-phase4-approach/SKILL.md | fs-change-phase1-analysis に統合 |
| skills/fs-change-phase5-delta-design/SKILL.md | fs-change-phase2-impl に統合 |
| skills/fs-change-phase6-impact-review/SKILL.md | fs-change-phase2-impl に統合 |
| skills/fs-change-phase7-task-planning/SKILL.md | fs-change-phase2-impl に統合 |
| skills/fs-change-phase8-impl/SKILL.md | fs-change-phase2-impl に統合 |
| skills/fs-change-phase9-completion/SKILL.md | fs-change-phase2-impl に統合 |
| skills/fs-change-phase10-final-check/SKILL.md | fs-change-phase3-final-check にリネーム |
| skills/fs-bugfix-phase1-report/SKILL.md | fs-bugfix-phase1-analysis に統合 |
| skills/fs-bugfix-phase2-analysis/SKILL.md | fs-bugfix-phase1-analysis に統合 |
| skills/fs-bugfix-phase3-plan/SKILL.md | fs-bugfix-phase1-analysis に統合 |
| skills/fs-bugfix-phase4-design/SKILL.md | fs-bugfix-phase2-impl に統合 |
| skills/fs-bugfix-phase5-impl/SKILL.md | fs-bugfix-phase2-impl に統合 |
| skills/fs-bugfix-phase6-doc/SKILL.md | fs-bugfix-phase2-impl に統合 |
| skills/fs-bugfix-phase7-final-check/SKILL.md | fs-bugfix-phase3-final-check にリネーム |

## 更新が必要な設計資料

上記「参照ファイルの更新」セクション（16件）に加え、以下も実装時に更新が必要:

| # | ファイル | 更新内容 | タイミング |
|---|---|---|---|
| 17 | doc-index.md | 新スキル名への参照更新（存在する場合） | 実装時 |
| 18 | 各プロンプトテンプレート（change-*-prompt.md） | 遷移先スキル名の参照更新（`fs-change-phase2-requirements` → `fs-change-phase1-analysis` 等） | 実装時 |
| 19 | 各プロンプトテンプレート（bugfix-*-prompt.md） | 遷移先スキル名の参照更新（`fs-bugfix-phase2-analysis` → `fs-bugfix-phase1-analysis` 等） | 実装時 |

※ プロンプトテンプレートの「内容変更」はスコープ外（change-requirements.md 対象外に記載）。ここで行うのは遷移先スキル名の参照文字列の置換のみ。
