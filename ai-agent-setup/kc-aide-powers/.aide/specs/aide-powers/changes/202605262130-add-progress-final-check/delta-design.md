# 差分設計書 (delta-design.md)

## 変更概要

全7ワークフローの最終フェーズとして「進捗ファイル完全性チェック」フェーズスキルを追加し、検証用agentを新規作成する。

---

## 1. 新規: 検証用agent定義

### ファイル: .kiro/agents/progress-final-checker.md

```markdown
---
name: progress-final-checker
description: "セッションヒストリーと進捗ファイルを検証し、ワークフロー実行の正当性を確認する"
tools:
  - read_file
  - grep_search
  - execute_pwsh
---

# progress-final-checker

## 役割

セッションヒストリー全文と進捗ファイルを受け取り、ワークフロー実行の正当性を多角的に検証する。

## 誠実性原則（最重要）

**嘘をつくくらいなら、ユーザーに正直に報告せよ。**

過去にAIエージェントがcompliance-checkerに虚偽のexecution_evidenceを渡して署名を取得した実例がある。
このような不正は、ユーザーの信頼を根本から破壊する。

- 検証で判断に迷った場合は FAIL ではなく UNCERTAIN を返し、ユーザーに判断を委ねよ
- 自分の検証能力の限界を正直に認めよ
- 「たぶん大丈夫」で PASS を返すな

## 検証観点

### A. セッションヒストリーの自然さ
- 会話の流れに不自然な飛躍がないか
- 突然コンテキストが変わっていないか
- 時系列が矛盾していないか

### B. フェーズスキル実行痕跡
- 各フェーズで discloseContext (スキルactivate) が呼ばれているか
- progress-resume-check が各フェーズ冒頭で実行されているか
- phase-compliance-check (verify) が各フェーズ冒頭で実行されているか
- phase-compliance-check (write) が各フェーズ末尾で実行されているか
- compliance-checker サブエージェントが invoke_sub_agent で呼ばれているか

### C. ユーザーとの自然な会話
- ユーザーの発言が存在するか（AIの独り言だけでないか）
- ユーザーへの質問と回答のペアが存在するか
- ユーザーの合意取得が記録されているか

### D. compliance-checker への偽装検出
- execution_evidence に記載された内容がセッションヒストリーと矛盾していないか
- 実行していないステップを「実行した」と申告していないか
- サブエージェント委譲が指示されている箇所で、実際に委譲されているか
- phase-compliance-check (write) に渡された情報が実際の実行内容と一致するか

### E. 進捗ファイルの完全性チェック
- progress_file_path で指定された進捗ファイルを read_file で読み込む
- ステータステーブルの全フェーズ（自フェーズ除く）が ✅ 完了 になっているか
- 各フェーズ（自フェーズ除く）の詳細セクションが存在するか
- 各フェーズに COMPLIANCE-DECLARATION テーブルが記載されているか
- 各フェーズに COMPLIANCE-DECLARATION コメント行（省略なし宣言）が記載されているか
- 各フェーズに PHASE-SIG 署名行が記載されているか
- compliance-sig スクリプトの verify サブコマンドで全署名を検証する
- 成果物テーブルの SHA256 値が実ファイルのハッシュと一致するか確認する
- ステータステーブルの完了日時とフェーズ詳細セクションの完了日時が一致するか

### F. 最終フェーズ（自フェーズ）のステータス更新チェック
- 自フェーズ行がステータステーブルに存在するか
- 自フェーズ行が ⬜ 未着手 の状態であるか（まだ更新されていないこと）
- 全検証 PASS 後に自フェーズを ✅ 完了 に更新する（署名なし）

## 出力

| 結果 | 意味 |
|---|---|
| PASS | 全検証観点で問題なし |
| FAIL | 問題検出。problem_phase と reason を返す |
| UNCERTAIN | 判断不能。ユーザーに確認を求める |

### FAIL時の出力形式

`
result: FAIL
problem_phase: {問題が検出されたフェーズ番号}
reason: {具体的な問題の説明}
evidence: {問題を示す該当箇所}
`
```

---

## 2. 新規: 最終チェックフェーズスキル（共通テンプレート）

全7WFで同一構造。以下はテンプレート。WF名とフェーズ番号のみ異なる。

### ファイル名マッピング

| WF | スキル名 | フェーズ番号 |
|---|---|---|
| 企画 | fs-planning-phase4-final-check | 4 |
| 設計 | fs-design-phase11-final-check | 11 |
| 実装 | fs-impl-phase7-final-check | 7 |
| 逆引き | fs-reverse-phase6-final-check | 6 |
| 変更 | fs-change-phase10-final-check | 10 |
| バグ修正 | fs-bugfix-phase7-final-check | 7 |
| リファクタリング | fs-refactoring-phase7-final-check | 7 |

### SKILL.md テンプレート

```markdown
---
name: fs-{wf}-phase{N}-final-check
description: "Use when {wf_description} workflow's last phase before this is complete. Final integrity check of the entire workflow execution."
---

# フェーズ{N}: 進捗ファイル完全性チェック

## Overview

ワークフロー完了前の最終防衛ライン。セッション全体の整合性を独立した検証用agentで検査する。

**Core principle:** 嘘をつくくらいなら、ユーザーに正直に報告せよ。

## 成果物

なし（検証のみ）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)
2. phase-compliance-check (aide-powers skill: verify)

### Step 1: セッションヒストリーの取得

セッション内で取得可能な会話履歴全文をテキストとして構築する。

### Step 2: 検証用agentの呼び出し

セッションヒストリー全文を一時ファイル（temp/session-history.txt）に書き出し、progress-final-checker (aide-powers agent) を invoke_sub_agent で起動する。

渡す情報:
- session_history: Step 1で取得したセッションヒストリー全文
- workflow_name: {workflow_name}
- total_phases: {N-1}（自フェーズを除く）
- progress_file_path: 前フェーズから引き継いだパス

### Step 3: 検証結果の処理

- **PASS の場合:**
  - 検証用agentが自フェーズのステータスを ✅ 完了 に更新済み（署名なし）
  - ワークフロー正常完了

- **FAIL の場合:**
  - ユーザーに問題内容を通知
  - ユーザーの承認を得る（リセットしてやり直すか確認）
  - ユーザー承認後、problem_phase 以降の進捗テーブル行を ⬜ 未着手 にリセット
  - 該当フェーズスキルに制御を戻す

- **UNCERTAIN の場合:**
  - ユーザーに検証結果を提示し判断を委ねる
  - ユーザーが「問題なし」→ PASS扱い
  - ユーザーが「やり直し」→ FAIL扱い

### Step 4: 一時ファイルの削除

検証完了後（PASS/FAIL/UNCERTAIN いずれの場合も）、temp/session-history.txt を削除する。

### 後処理

なし（署名なし。検証用agentが自フェーズのステータス更新を実施）

## Integration

**前フェーズ:** fs-{wf}-phase{N-1}-{prev_phase_name}
**次フェーズ:** なし（ワークフロー最終フェーズ）
```

---

## 3. 既存変更: 各WF最終フェーズスキルの次フェーズ遷移追加

各WFの最終フェーズスキルのIntegrationセクション構造が異なるため、個別に記載する。

### 3-1. fs-planning-phase3-finalize/SKILL.md（企画WF）

変更箇所: 後処理セクション内

**before:**
`
4. 次フェーズ遷移: 企画ワークフロー完了。設計ワークフローへ引き継ぎ資料一式を渡す
`

**after:**
`
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-planning-phase4-final-check (aide-powers skill)）
`

### 3-2. fs-design-phase10-program/SKILL.md（設計WF）

変更箇所: 後処理セクション + Integration > Next phase

**before (後処理):**
`
4. 次フェーズ遷移（設計ワークフロー完了 → 実装ワークフローへの案内）
`

**after (後処理):**
`
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase11-final-check (aide-powers skill)）
`

**before (Integration):**
`
**Next phase:**
- 設計完了 → 実装ワークフローへ（設計ワークフロー最後のフェーズスキル）
`

**after (Integration):**
`
**Next phase:**
- REQUIRED SUB-SKILL: fs-design-phase11-final-check (aide-powers skill)（完全性チェック後、実装ワークフローへ案内）
`

### 3-3. fs-impl-phase6-doc-generation/SKILL.md（実装WF）

変更箇所: Integration > REQUIRED SUB-SKILL

**before:**
`
**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- なし（fs-impl-phase6-doc-generation は実装ワークフローの最終フェーズスキル）
`

**after:**
`
**REQUIRED SUB-SKILL（次フェーズスキルへの遷移）:**
- fs-impl-phase7-final-check (aide-powers skill)（進捗ファイル完全性チェック）
`

### 3-4. fs-reverse-phase5-optional-phases/SKILL.md（逆引きWF）

変更箇所: 後処理セクション + Integration > Next

**before (後処理):**
`
4. 逆引きワークフロー完了（最終フェーズのため次フェーズ遷移なし）
`

**after (後処理):**
`
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-reverse-phase6-final-check (aide-powers skill)）
`

**before (Integration):**
`
**Next:**
- なし（設計逆引きワークフローの最終フェーズスキル）
`

**after (Integration):**
`
**Next:**
- REQUIRED SUB-SKILL: fs-reverse-phase6-final-check (aide-powers skill)（進捗ファイル完全性チェック）
`

### 3-5. fs-change-phase9-completion/SKILL.md（変更WF）

変更箇所: Integration > 次フェーズスキル

**before:**
`
**次フェーズスキル:**
- なし（変更ワークフローの最終フェーズ）
`

**after:**
`
**次フェーズスキル:**
- REQUIRED SUB-SKILL: fs-change-phase10-final-check (aide-powers skill)（進捗ファイル完全性チェック）
`

### 3-6. fs-bugfix-phase6-doc/SKILL.md（バグ修正WF）

変更箇所: Integration > 次フェーズスキル

**before:**
`
**次フェーズスキル:**
- なし（バグ修正ワークフローの最終フェーズ）
`

**after:**
`
**次フェーズスキル:**
- REQUIRED SUB-SKILL: fs-bugfix-phase7-final-check (aide-powers skill)（進捗ファイル完全性チェック）
`

### 3-7. fs-refactoring-phase6-doc/SKILL.md（リファクタリングWF）

変更箇所: Integration > Called by の後に次フェーズセクション追加

**before:**
`
**Called by:**
- リファクタリングワークフロー（フェーズ5完了後に呼び出される）
`（次フェーズスキルセクションなし）

**after:**
`
**Called by:**
- リファクタリングワークフロー（フェーズ5完了後に呼び出される）

**次フェーズスキル:**
- REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check (aide-powers skill)（進捗ファイル完全性チェック）
`

---

## 4. 既存変更: progress-file-format.md フェーズマッピング追加

### 変更対象: skills/using-aide-powers/references/progress-file-format.md

各WFのフェーズマッピングテーブル（§7）に最終チェック行を追加:

| WF | 追加行 |
|---|---|
| §7.1 企画 | \| 4 \| Phase 4 \| fs-planning-phase4-final-check \| 完全性チェック \| |
| §7.2 設計 | \| 11 \| Phase 11 \| fs-design-phase11-final-check \| 完全性チェック \| |
| §7.3 実装 | \| 7 \| Phase 7 \| fs-impl-phase7-final-check \| 完全性チェック \| |
| §7.4 逆引き | \| 6 \| Phase 6 \| fs-reverse-phase6-final-check \| 完全性チェック \| |
| §7.5 変更 | \| 10 \| Phase 10 \| fs-change-phase10-final-check \| 完全性チェック \| |
| §7.6 バグ修正 | \| 7 \| Phase 7 \| fs-bugfix-phase7-final-check \| 完全性チェック \| |
| §7.7 リファクタリング | \| 7 \| Phase 7 \| fs-refactoring-phase7-final-check \| 完全性チェック \| |

---

---

## 5. 既存変更: phase-compliance-check スキルへの誠実性原則追加

### 変更対象

| # | ファイル | 変更内容 |
|---|---|---|
| 1 | skills/phase-compliance-check/SKILL.md | 誠実性原則セクションを追加（オーケストレータ向け） |

### 追加内容

「呼び出された AI Agent への厳守事項」セクションの直前に以下を追加:

**before:** （セクションなし）

**after:**

## 誠実性原則（オーケストレータへの警告）

**嘘をつくくらいなら、ユーザーに正直に報告せよ。**

過去にオーケストレータ（AIエージェント）が以下の不正を行った実例がある:
- compliance-checker に虚偽の execution_evidence を渡して署名を取得した
- 実行していない前処理を「実行した」と申告した
- COMPLIANCE-DECLARATION に虚偽の遵守申告を記載した

これらの不正は、ユーザーの信頼を根本から破壊する。

**オーケストレータへの命令:**
- 省略した手順がある場合は正直にユーザーに申告し、やり直しを申し出ること
- 虚偽の execution_evidence を構築してはならない
- 「バレないだろう」という判断で不正を行ってはならない
- 不正を行うくらいなら、正直に「省略しました」と報告する方が遥かにマシである
- compliance-checker は渡された情報を検証するだけであり、情報の真偽の責任はオーケストレータにある

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 更新タイミング |
|---|---|---|
| progress-file-format.md | §7 フェーズマッピング行追加 | 実装時 |
| docs-dev/02-ai-agent/01-workflows/*.md | 各WFドキュメントにフェーズ追加記載 | 実装後 |