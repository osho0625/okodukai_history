# 差分設計書

## 設計方針

### 変更の目的
pending-issues の check/present 処理を各WFの実装フェーズ（コミット前）から全7WFの最終フェーズ（final-check）後処理のgit-commit-workflow完了後に移動する。これによりWF本体フロー（設計→実装→レビュー→コミット）の一貫性を確保する。

### 変更パターン
- **パターンA（削除）**: 実装フェーズからpending-issues check/present の単独Stepを削除し、後続Stepをリナンバリング（4件）
- **パターンB（追加）**: 全7WFのfinal-check後処理にgit-commit-workflow完了後のpending-issues check→present手順を追加（7件）

### 実行順序の統一
全7WFのfinal-check後処理において「git-commit-workflow → pending-issues check → pending-issues present」の順を統一する。

---

## パターンA: 実装フェーズからのStep削除（4件）

### A-1. fs-change-phase2-impl/SKILL.md — Step 13 削除

**変更理由**: pending-issues check をWF本体フロー中から除去し、final-check後処理に集約するため

#### before（Step 13 セクション全体）

```markdown
## Step 13: pending-issues 書き込み忘れチェック

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・pending-issues-management (aide-powers skill: check)を activate して実行し（progress_file_path: `{changes_dir}/change-progress.md`, pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(Step13):"として記載する。共通スキルが進捗ファイルを遡り書き込み漏れパターンを検索する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(Step13):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）

注: pending-issues.md の有無に関わらず実行する（進捗ファイル遡り照合が目的）。

### 完了条件
fs-change-phase2-report.txtに、pending-issues-management(check)の出力(Step13)と書き込み漏れの有無と対応(Step13)が記載されている

### 状態判定
完了条件を満たしていればStep14へ遷移する
```

#### after

（削除。このセクションは完全に除去する）

#### 付随変更: Step番号リナンバリング

| 旧Step番号 | 新Step番号 | 内容 |
|---|---|---|
| Step 14: 変更完了の案内 | Step 13: 変更完了の案内 | 見出し・本文中の「Step14」→「Step13」に変更 |

具体的な変更箇所:
- 見出し `## Step 14: 変更完了の案内` → `## Step 13: 変更完了の案内`
- 成果物記載項目の `(Step14)` → `(Step13)` に全て変更
- Step 12 の状態判定 `Step13へ遷移する` → そのまま（番号一致するため変更不要）
- 旧Step 13 の状態判定 `Step14へ遷移する` → 削除対象のため不要

#### 付随変更: 旧Step 14（新Step 13）内のpending-issues present呼び出し削除

旧Step 14「変更完了の案内」には pending-issues-management (present) の呼び出しが含まれている。この呼び出しもfinal-check後処理に移動するため削除する。

**before（旧Step 14 内の該当箇所）:**

```markdown
・pending-issues 対応方針を確認した結果を記載する。pending-issues.md が存在する場合は `pending-issues-management (aide-powers skill: present)` を activate して実行し、出力を"pending-issues-management(present)の出力(Step14):"として記載する。記録された全問題を重要度順にユーザーに提示し各問題の対応方針を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues-management(present)の出力(Step14):
　pending-issues対応方針(Step14):
```

**after:**

（削除。上記記述を完全に除去する）

**完了条件のbefore:**
```markdown
fs-change-phase2-report.txtに、変更内容サマリー(Step14)・変更完了案内の更新設計書一覧(Step14)・テスト実行結果(Step14)・変更履歴提示結果(Step14)・pending-issues-management(present)の出力(Step14)・pending-issues対応方針(Step14)が記載されている
```

**完了条件のafter:**
```markdown
fs-change-phase2-report.txtに、変更内容サマリー(Step13)・変更完了案内の更新設計書一覧(Step13)・テスト実行結果(Step13)・変更履歴提示結果(Step13)が記載されている
```

#### 付随変更: Integrationセクション

**before:**
```markdown
- `pending-issues-management (aide-powers skill)` — Step 13 (check) / Step 14 (present)
```

**after:**
（削除。pending-issues-management の呼び出しは本フェーズから完全除去される）

#### 付随変更: 完了条件セクション

**before（#完了条件 の項目9）:**
```markdown
9. pending-issues 書き込み忘れチェックが完了している
```

**after:**
（項目9を削除し、後続の番号を繰り上げる）

---

### A-2. fs-bugfix-phase2-impl/SKILL.md — Step 11 削除

**変更理由**: A-1と同一（pending-issues check をfinal-check後処理に集約）

#### before（Step 11 セクション全体）

A-1のStep 13と同一構造。`## Step 11: pending-issues 書き込み忘れチェック` セクション全体を削除する。差分はStep番号（13→11）、レポートファイル名（fs-bugfix-phase2-report.txt）、progress_file_path（`{bugfix_dir}/bugfix-progress.md`）のみ。

#### after

（削除。このセクションは完全に除去する）

#### 付随変更: Step番号リナンバリング

| 旧Step番号 | 新Step番号 | 内容 |
|---|---|---|
| Step 12: バグ修正完了の案内 | Step 11: バグ修正完了の案内 | 見出し・本文中の「Step12」→「Step11」に変更 |

#### 付随変更: 旧Step 12（新Step 11）内のpending-issues present呼び出し削除

A-1の旧Step 14と同一パターン。旧Step 12「バグ修正完了の案内」内の pending-issues-management (present) 呼び出し記述を削除し、完了条件から `pending-issues-management(present)の出力(Step12)・pending-issues対応方針(Step12)` を除去する。

#### 付随変更: Integrationセクション

pending-issues-management の参照行を削除する（A-1と同一パターン）。

---

### A-3. fs-refactoring-phase6-doc/SKILL.md — Step 2 削除

**変更理由**: A-1と同一（pending-issues check をfinal-check後処理に集約）

#### before（Step 2 セクション全体）

`## Step 2: pending-issues 書き込み忘れチェック` セクション全体を削除する。内容はA-1のStep 13と同一構造で、差分はStep番号（13→2）、レポートファイル名（fs-refactoring-phase6-report.txt）、progress_file_path（`{refactoring_dir}/refactoring-progress.md`）のみ。

#### after

（削除。このセクションは完全に除去する）

#### 付随変更: Step番号リナンバリング

| 旧Step番号 | 新Step番号 | 内容 |
|---|---|---|
| Step 3: リファクタリング完了案内 | Step 2: リファクタリング完了案内 | 見出し・本文中の「Step3」→「Step2」に変更 |
| Step 4: 完了案内のユーザー承認 | Step 3: 完了案内のユーザー承認 | 見出し・本文中の「Step4」→「Step3」に変更 |

#### 付随変更: 状態判定のStep番号参照更新

- 旧Step 1 の状態判定 `Step2へ遷移する` → そのまま（削除ステップの次なので番号一致不要。doc-sync完了後に旧Step3＝新Step2へ遷移する記述に変更）
  - 正確には: `Step3へ遷移する` → `Step2へ遷移する`（旧Step 2 の状態判定が「Step3へ遷移する」であったのを、旧Step 1 の状態判定「Step2へ遷移する」が旧Step 3（新Step 2）を指す形に自然変更される）

#### 付随変更: Integrationセクション

pending-issues-management の参照行を削除する（A-1と同一パターン）。

---

### A-4. fs-impl-phase5-final-check/SKILL.md — Step 3 削除

**変更理由**: A-1と同一（pending-issues check/present をfinal-check後処理に集約）

#### before（Step 3 セクション全体）

`## Step 3: pending-issues の確認と書き込み忘れチェック` セクション全体を削除する。このStepはcheck モードとpresent モードの両方を実行する（他のA-1〜A-3はcheckのみ）。Step 3が最終Stepのためリナンバリングは不要。

#### after

（削除。このセクションは完全に除去する）

#### 付随変更: Step 2 の状態判定

**before:**
```markdown
完了条件を満たし"網羅性チェック結果(Step2)"が全要件カバーの場合 Step3 へ遷移する。
```

**after:**
```markdown
完了条件を満たし"網羅性チェック結果(Step2)"が全要件カバーの場合 後処理へ遷移する。
```

#### 付随変更: Integrationセクション

pending-issues-management の参照行を削除する。

#### 付随変更: レポート記載項目リスト

**変更理由**: Step 3 削除に伴い、後処理の `phase-report-check (write)` に渡す required_items からもStep3関連項目を削除する必要がある。削除しないと記載項目漏れと誤判定されFAILする可能性がある。

**before（`# レポート記載項目リスト` セクション内の該当箇所）:**
```markdown
- pending-issues-management(check)の出力(Step3):
- 書き込み漏れの有無と対応(Step3):
- pending-issues-management(present)の出力(Step3):
- pending-issues提示結果(Step3):
```

**after:**
（削除。上記4項目を完全に除去する）

#### 付随変更: The Iron Laws「最終チェック項目の省略禁止」（design-sync反映・2026-07-03）

**変更理由**: coding-test-2review の設計準拠レビュー（design-review-agent、D-004タスク）でFAIL_DESIGN判定を受けた設計漏れ。Step 3（pending-issues の確認と書き込み忘れチェック）削除に伴い、The Iron Laws内の「最終チェック3項目の省略禁止」がStep3を名指しで含んだままとなり、実態（本フェーズはStep1・Step2の2項目のみ実施）と不整合になっていた。

**before:**
```markdown
- **最終チェック3項目の省略禁止**: 「最終設計準拠チェック」「動作確認試験書の網羅性チェック」「pending-issues 書き込み忘れチェック」のいずれも省略してはならない。「実装ループが通ったから大丈夫」は理由にならない。
```

**after:**
```markdown
- **最終チェック2項目の省略禁止**: 「最終設計準拠チェック」「動作確認試験書の網羅性チェック」のいずれも省略してはならない。「実装ループが通ったから大丈夫」は理由にならない。
```

#### 付随変更: Integration「Output to next phase」（design-sync反映・2026-07-03）

**変更理由**: 上記と同一の設計漏れ。Step 3 削除により本フェーズは pending-issues のチェックを実行しなくなったため、次フェーズへの引き渡し状態の記述からpending-issues関連の記述を除去する。

**before:**
```markdown
**Output to next phase:**
- 全設計書全項目 ✅・全要件試験カバー済み・pending-issues 書き込み漏れチェック済みの状態
```

**after:**
```markdown
**Output to next phase:**
- 全設計書全項目 ✅・全要件試験カバー済みの状態
```

#### 付随変更: レポート記載項目リスト直下の注記（design-sync反映・2026-07-03・3回目）

**変更理由**: coding-test-2review の設計準拠レビュー（design-review-agent、D-004タスク）で3回目のFAIL_DESIGN判定を受けた設計漏れ。Step 3（pending-issues の確認と書き込み忘れチェック）削除に伴い、「レポート記載項目リスト」直下の注記内に、旧Step3由来の死んだ参照（対応ロジックが本ファイルに存在しない）が残存していた。

**before:**
```markdown
> 注: 分岐により実行されない処理（例: Step1 で ❌ がなく coding-test-2review を呼び出さない場合、Step2 で ❌ がなく原因判定を行わない場合、pending-issues.md が存在せず present を実行しない場合）の項目は、required_items から除外して渡すか、レポートに理由（例: `coding-test-2reviewの出力(Step1): N/A（❌項目なしのため追加実装不要）`）を記載すること。
```

**after:**
```markdown
> 注: 分岐により実行されない処理（例: Step1 で ❌ がなく coding-test-2review を呼び出さない場合、Step2 で ❌ がなく原因判定を行わない場合）の項目は、required_items から除外して渡すか、レポートに理由（例: `coding-test-2reviewの出力(Step1): N/A（❌項目なしのため追加実装不要）`）を記載すること。
```

---

## パターンB: 全7WF final-check後処理へのpending-issues check/present追加（7件）

### 追加手順の共通定義

全7WFのfinal-check後処理に、git-commit-workflow完了直後・WF終了判定の直前に、以下の2手順を追加する:

```markdown
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
```

注: pending-issues.md の有無に関わらず check は実行する（進捗ファイル遡り照合が目的）。present は pending-issues.md が存在しない場合は「未対応の問題はありません」と報告するのみ。

### B-1. fs-change-phase3-final-check/SKILL.md（代表例 — 完全なbefore/after）

**変更理由**: WF完全終了・コミット完了後にpending-issues処理を集約するため

#### before（後処理の「以下を満たすこと」セクション）

```markdown
以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。変更ワークフロー全体の成果物をまとめてコミットする（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　変更WF最終コミット結果(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（変更ワークフロー最終フェーズ））
```

#### after（後処理の「以下を満たすこと」セクション）

```markdown
以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。変更ワークフロー全体の成果物をまとめてコミットする（Docs: フッター付き）。その記載内容から、次の項目を判断して記載する
　変更WF最終コミット結果(後処理):
・pending-issues-management (aide-powers skill: check)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(後処理):"として記載する。WF実行中に書き込み忘れた問題がないかを最終確認する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(後処理):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）
・pending-issues-management (aide-powers skill: present)を activate して実行し（pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(present)の出力(後処理):"として記載する。pending-issues.md が存在する場合は記録された全問題を重要度順にユーザーに提示し各問題の対応方針（次WFで対応/対応不要として削除/保留）を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues対応方針(後処理):
・完了ステータス(後処理):（A:通常完了）
・次フェーズ遷移先(後処理):（なし（変更ワークフロー最終フェーズ））
```

#### 完了条件のbefore

```markdown
fs-change-phase3-report.txtに、doc-index-maintenanceの出力(後処理) / user-profile-management(update)の出力(後処理) / git-commit-workflowの出力(後処理) を実行して得た項目と完了ステータス(後処理)が記載され、コミットが完了している
```

#### 完了条件のafter

```markdown
fs-change-phase3-report.txtに、doc-index-maintenanceの出力(後処理) / user-profile-management(update)の出力(後処理) / git-commit-workflowの出力(後処理) / pending-issues-management(check)の出力(後処理) / pending-issues-management(present)の出力(後処理) を実行して得た項目と完了ステータス(後処理)が記載され、コミットが完了している
```

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `git-commit-workflow (aide-powers skill)` — 後処理（変更WF全体のコミット）
```

**after（呼び出す共通スキル）:**
```markdown
- `git-commit-workflow (aide-powers skill)` — 後処理（変更WF全体のコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-2. fs-bugfix-phase3-final-check/SKILL.md

B-1と同一パターン。差分のみ:
- レポートファイル名: `fs-bugfix-phase3-report.txt`
- git-commit-workflow の説明文: 「バグ修正ワークフロー全体の成果物をまとめてコミットする」
- 最終コミット結果の記載項目名: `コミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（バグ修正ワークフロー最終フェーズ）`
- 状態判定のフェーズレポート削除対象: `fs-bugfix-phase1-report.txt` / `fs-bugfix-phase2-report.txt` / `fs-bugfix-phase3-report.txt`

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（バグ修正WF全体のコミット）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（バグ修正WF全体のコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-3. fs-refactoring-phase7-final-check/SKILL.md

B-1と同一パターン（ただしこのファイルは doc-index-maintenance / user-profile-management を呼ばない構造）。差分:
- レポートファイル名: `fs-refactoring-phase7-report.txt`
- git-commit-workflow の説明文: 「リファクタリングワークフロー全フェーズの成果物...をまとめてコミットする」
- 最終コミット結果の記載項目名: `最終進捗更新のコミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（リファクタリングワークフロー最終フェーズ）`
- 注記にpending-issuesの記述を追加: 「doc-index-maintenance / user-profile-management(update) は前フェーズ fs-refactoring-phase6-doc で実施済みのため本フェーズでは呼ばない。」の後に配置する

pending-issues 手順の挿入位置は git-commit-workflow の記載項目の**直後**、`完了ステータス(後処理):` の**直前**。

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill: apply)` — 前処理
- `git-commit-workflow (aide-powers skill)` — 後処理（リファクタリングWF唯一のまとめコミット。progress-final-checker の最終進捗更新後に実行）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill: apply)` — 前処理
- `git-commit-workflow (aide-powers skill)` — 後処理（リファクタリングWF唯一のまとめコミット。progress-final-checker の最終進捗更新後に実行）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-4. fs-impl-phase7-final-check/SKILL.md

B-3と同一パターン（doc-index-maintenance / user-profile-management を呼ばない構造）。差分:
- レポートファイル名: `fs-impl-phase7-report.txt`
- git-commit-workflow の説明文: 「実装ワークフローは各フェーズコミット型であり...」
- 最終コミット結果の記載項目名: `最終進捗更新のコミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（実装ワークフロー最終フェーズ）`
- 注記更新: 「doc-index-maintenance / user-profile-management(update) は本フェーズの後処理では実行しない」の後に配置

pending-issues 手順の挿入位置は git-commit-workflow の記載項目の**直後**、`完了ステータス(後処理):` の**直前**。

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply)
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。progress-final-checker による最終進捗更新の後にコミット）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply)
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。progress-final-checker による最終進捗更新の後にコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-5. fs-planning-phase4-final-check/SKILL.md

B-1と同一パターン。差分のみ:
- レポートファイル名: `fs-planning-phase4-report.txt`
- git-commit-workflow の説明文: 「本フェーズで progress-final-checker が最終フェーズ行を ✅ 完了 に更新した進捗ファイルを含め、企画ワークフローの最終状態をコミットする」
- 最終コミット結果の記載項目名: `コミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（企画ワークフロー最終フェーズ）`

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（企画WF最終状態のコミット）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（企画WF最終状態のコミット）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-6. fs-design-phase11-final-check/SKILL.md

B-1と同一パターン。差分のみ:
- レポートファイル名: `fs-design-phase11-report.txt`
- git-commit-workflow の説明文: 「設計ワークフロー最終フェーズの最終進捗更新...を含めてコミットする」
- 最終コミット結果の記載項目名: `コミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（設計ワークフロー最終フェーズ）`

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（最終進捗更新後のコミット。設計WFは各フェーズコミット型のため、最終フェーズ行 ✅ 完了 の取りこぼし防止に必須）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（最終進捗更新後のコミット。設計WFは各フェーズコミット型のため、最終フェーズ行 ✅ 完了 の取りこぼし防止に必須）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

### B-7. fs-reverse-phase6-final-check/SKILL.md

B-1と同一パターン。差分のみ:
- レポートファイル名: `fs-reverse-phase6-report.txt`
- git-commit-workflow の説明文: 「設計逆引きワークフロー最終フェーズの最終進捗更新...を含めてコミットする」
- 最終コミット結果の記載項目名: `最終進捗更新のコミット結果(後処理):`
- 次フェーズ遷移先の記述: `なし（設計逆引きワークフロー最終フェーズ）`

#### Integrationセクション追加

**before（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（最終進捗更新後のコミット。設計逆引きWFは各フェーズコミット型のため、最終フェーズ行 ✅ 完了 の取りこぼし防止に必須）
```

**after（呼び出す共通スキル）:**
```markdown
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 後処理
- `git-commit-workflow (aide-powers skill)` — 後処理（最終進捗更新後のコミット。設計逆引きWFは各フェーズコミット型のため、最終フェーズ行 ✅ 完了 の取りこぼし防止に必須）
- `pending-issues-management (aide-powers skill)` — 後処理（check: 書き込み忘れチェック / present: 既存issues提示・対応確認）
```

---

## インターフェース影響サマリ

本変更はスキル定義テキストファイル（.md）の変更であり、プログラムコードのシグネチャ変更は発生しない。

| 項目 | 影響 |
|---|---|
| pending-issues-management スキルのインターフェース | 変更なし（check/present モードの仕様は維持） |
| 各フェーズスキルの Input/Output | 変更なし |
| エージェント定義 | 変更なし |
| ツールマップ | 変更なし |

---

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 優先度 | 更新タイミング |
|---|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` | 各WFフェーズスキルのStep記述（変更WF Step13削除→リナンバリング、バグ修正WF Step11削除→リナンバリング、リファクタリングWF Step2削除→リナンバリング、実装WF Step3削除）を反映 | 中（差分設計完了後に対応） | 実装後（全ファイル変更完了後にprogram-structure.mdのStep記述を更新） |
