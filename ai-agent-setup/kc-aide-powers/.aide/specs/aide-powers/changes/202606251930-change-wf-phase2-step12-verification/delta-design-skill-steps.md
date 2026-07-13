# 差分設計書（SKILL Step再構成） — 4WF動作確認Stepの3工程化

- **対象:** C1〜C4（4 SKILL.md の動作確認Step）
- **親索引:** [delta-design.md](./delta-design.md)

---

## 設計方針（本ファイル固有）

- 4WFの動作確認Stepを「①試験書作成→②レビューPASSまでループ→③試験実行→ユーザー承認」の3工程に再構成
- 既存の Step 番号・Step 名・前後 Step への遷移は維持（Step 内部構造のみ変更）
- レビューループの停滞時は design-impl-gap-process.md プロセスC 準拠（**10回**繰り返してもAPPROVEDにならない場合に停止しユーザー相談。ユーザーが「続行する」を選択した場合はカウントを0にリセットして再度10回まで繰り返し可能）
- エビデンス報告（REQ-C-005）をユーザー承認部分に追加
- Integration セクションに `manual-test-review-agent` を追記

---

## C1: skills/fs-impl-phase4-execution/SKILL.md — Step 2 再構成

### 変更理由
REQ-C-004（3工程分離）＋REQ-C-002（レビューループ）＋REQ-C-005（エビデンス報告）を満たすため、
現状の一気通貫構造（試験書生成→試験実行→ユーザー承認）を3工程に分離する。

### before（Step 2 全文）

```markdown
## Step 2: 動作検証・ユーザー確認

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・実装した機能が正しく動作することを動作確認する。本スキルディレクトリの `impl-verification-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを起動して動作確認試験を実行させる。サブエージェントの出力を"動作確認サブエージェントの出力(Step2):"として記載する。サブエージェントが 試験書のパスと、試験結果を返すことを確認
・動作確認結果が全てOK の場合、ユーザーに実装内容と確認結果を報告し、ユーザーからの承認を得る
　ユーザー承認結果(Step2):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step2):

### 完了条件
fs-impl-phase4-report.txtに、動作確認結果(Step2)が「OK」であり、ユーザー承認結果(Step2)が「承認」であり、.aide/specs/{feature_name}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 動作確認結果(Step2)が「OK」かつユーザー承認結果(Step2)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step2)が「NG」の場合 → 問題の内容を分析し、以下に遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを impl-task-list.md に追記してから再実装する
- ユーザー承認結果(Step2)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step2)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

### after（Step 2 全文）

```markdown
## Step 2: 動作検証・ユーザー確認

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: 試験書作成】本スキルディレクトリの `impl-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step2-①):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step2-①):
　作成された試験書パス(Step2-①):

・【工程②: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `impl`
　- 試験書パス: 工程①で受領したパス
　- WF固有入力: usecase-analysis.md, user-requirements.md
　レビュー結果を"試験書レビュー結果(Step2-②):"として即時記載する
　- **APPROVED の場合** → 工程③へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `impl-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step2-②):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step2-②):

・【工程③: 試験実行】工程②で APPROVED となった試験書に基づき、`impl-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、実際の動作確認（試験実行）を行う。試験結果を"試験実行サブエージェントの出力(Step2-③):"として記載する
　試験実行サブエージェントの出力(Step2-③):

・動作確認結果が全てOK の場合、ユーザーに実装内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step2):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step2):

### 完了条件
fs-impl-phase4-report.txtに以下が全て満たされていること:
- 試験書レビュー結果(Step2-②)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step2)が「OK」である
- ユーザー承認結果(Step2)が「承認」である（エビデンス付き報告済み）
- .aide/specs/{feature_name}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 工程②で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程③に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程②が APPROVED かつ動作確認結果(Step2)が「OK」かつユーザー承認結果(Step2)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step2)が「NG」の場合 → 問題の内容を分析し、以下に遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを impl-task-list.md に追記してから再実装する
- ユーザー承認結果(Step2)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step2)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

### Integration セクションへの追記（before→after）

**before:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `impl-verification-prompt.md` — Step 2（動作確認サブエージェント委譲）
```

**after:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `impl-verification-prompt.md` — Step 2（工程①: 試験書作成モード / 工程③: 試験実行モード）

**呼び出す名前付きエージェント（Step 2 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 2 工程②（試験書品質レビュー。wf_type=impl）
```

---

## C2: skills/fs-bugfix-phase2-impl/SKILL.md — Step 10 再構成

### 変更理由
C1 と同一理由（REQ-C-004 / REQ-C-002 / REQ-C-005）。WF種別=bugfix。

### before（Step 10 全文）

```markdown
## Step 10: 動作検証・ユーザー確認

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・バグが修正された状態になったことを動作確認する。本スキルディレクトリの `bugfix-verification-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを起動して動作確認試験を実行させる。サブエージェントの出力を"動作確認サブエージェントの出力(Step10):"として記載する。サブエージェントが 試験書のパスと、試験結果を返すことを確認
　動作確認サブエージェントの出力(Step10):
・動作確認結果が全てOK の場合、ユーザーに修正内容と確認結果を報告し、ユーザーからの承認を得る
　ユーザー承認結果(Step10):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step10):

### 完了条件
fs-bugfix-phase2-report.txtに、動作確認結果(Step10)が「OK」であり、ユーザー承認結果(Step10)が「承認」であり、{bugfix_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 動作確認結果(Step10)が「OK」かつユーザー承認結果(Step10)が「承認」の場合 → Step11 へ遷移する
- 動作確認結果(Step10)が「NG」の場合 → （略・差し戻しフロー）
- ユーザー承認結果(Step10)が「追加確認要求」/「NG」の場合 → （略・差し戻しフロー）
```

### after（Step 10 全文）

```markdown
## Step 10: 動作検証・ユーザー確認

### 成果物
fs-bugfix-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: 試験書作成】本スキルディレクトリの `bugfix-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。試験書パスを受領する
　試験書作成サブエージェントの出力(Step10-①):
　作成された試験書パス(Step10-①):

・【工程②: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `bugfix`
　- 試験書パス: 工程①で受領したパス
　- WF固有入力: bug-report.md（再現手順）, fix-plan.md（受入基準）
　レビュー結果を"試験書レビュー結果(Step10-②):"として即時記載する
　- **APPROVED の場合** → 工程③へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき試験書を修正させ、再度レビュー。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
　試験書レビュー結果(Step10-②):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step10-②):

・【工程③: 試験実行】工程②で APPROVED となった試験書に基づき、`bugfix-verification-prompt.md` の「試験実行」セクションをモード指定し、サブエージェントを起動して実際の動作確認を行う
　試験実行サブエージェントの出力(Step10-③):

・動作確認結果が全てOK の場合、ユーザーに修正内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段〕／コードレビュー代替）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step10):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step10):

### 完了条件
fs-bugfix-phase2-report.txtに以下が全て満たされていること:
- 試験書レビュー結果(Step10-②)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step10)が「OK」である
- ユーザー承認結果(Step10)が「承認」である（エビデンス付き報告済み）
- {bugfix_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 工程②で NEEDS_FIX の場合 → 試験書修正→再レビューへループ（プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程②が APPROVED かつ動作確認結果「OK」かつユーザー承認「承認」→ Step11 へ遷移する
- 動作確認結果(Step10)が「NG」の場合 → 問題の内容を分析し差し戻しフローに従う（既存と同一）
- ユーザー承認結果(Step10)が「追加確認要求」/「NG」の場合 → 既存と同一のフロー
```

### Integration セクションへの追記（before→after）

**before:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `bugfix-designer-prompt.md` — Step 2（mode: design / fix）、Step 5（fix）
- `bugfix-task-planner-prompt.md` — Step 6
- `bugfix-verification-prompt.md` — Step 10（動作確認サブエージェント委譲）
- `bugfix-doc-syncer-prompt.md` — Step 11
```

**after:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `bugfix-designer-prompt.md` — Step 2（mode: design / fix）、Step 5（fix）
- `bugfix-task-planner-prompt.md` — Step 6
- `bugfix-verification-prompt.md` — Step 10（工程①: 試験書作成モード / 工程③: 試験実行モード）
- `bugfix-doc-syncer-prompt.md` — Step 11

**呼び出す名前付きエージェント（Step 10 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 10 工程②（試験書品質レビュー。wf_type=bugfix）
```

---

## C3: skills/fs-change-phase2-impl/SKILL.md — Step 12 再構成

### 変更理由
C1 と同一理由（REQ-C-004 / REQ-C-002 / REQ-C-005）。WF種別=change。

### before（Step 12 — 構造はC1/C2と同型のため要点のみ）

現状: `change-verification-prompt.md` でサブエージェントを1回起動し一気通貫で試験書作成→試験実行→結果報告。ユーザー承認を得て Step13 へ遷移。

### after（Step 12 — C1/C2と同型の3工程構造。差異点のみ記載）

**C1/C2 との差異:**
- 工程①: `change-verification-prompt.md` の「試験書作成」セクション使用
- 工程②: `manual-test-review-agent` に `wf_type=change`、WF固有入力=`change-requirements.md`（受入基準）を渡す
- 工程③: `change-verification-prompt.md` の「試験実行」セクション使用
- レポート項目名: (Step12-①), (Step12-②), (Step12-③)
- 完了条件の試験書パス: `{changes_dir}/testing/test-{機能名}-test-plan.md`
- 遷移先: APPROVED＋OK＋承認 → Step13 へ遷移
- NG時差し戻し先: Step10（タスク実装ループ）/ Step2（差分設計）

### Integration セクションへの追記（before→after）

**before:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `change-verification-prompt.md` — Step 12（動作確認サブエージェント委譲）
- `change-doc-syncer-prompt.md` — Step 13
```

**after:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `change-verification-prompt.md` — Step 12（工程①: 試験書作成モード / 工程③: 試験実行モード）
- `change-doc-syncer-prompt.md` — Step 13

**呼び出す名前付きエージェント（Step 12 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 12 工程②（試験書品質レビュー。wf_type=change）
```

---

## C4: skills/fs-refactoring-phase5-impl/SKILL.md — Step 3 再構成

### 変更理由
C1 と同一理由（REQ-C-004 / REQ-C-002 / REQ-C-005）。WF種別=refactoring。

### before（Step 3 — 構造はC1/C2と同型のため要点のみ）

現状: `refactoring-verification-prompt.md` でサブエージェントを1回起動し一気通貫で試験書作成→試験実行→結果報告。ユーザー承認を得て後処理へ遷移。

### after（Step 3 — C1/C2と同型の3工程構造。差異点のみ記載）

**C1/C2 との差異:**
- 工程①: `refactoring-verification-prompt.md` の「試験書作成」セクション使用
- 工程②: `manual-test-review-agent` に `wf_type=refactoring`、WF固有入力=`refactoring-plan.md`（外部振る舞い基準。approach.md §3.4 の記載に統一）を渡す
- 工程③: `refactoring-verification-prompt.md` の「試験実行」セクション使用
- レポート項目名: (Step3-①), (Step3-②), (Step3-③)
- 完了条件の試験書パス: `{refactoring_dir}/testing/test-{機能名}-test-plan.md`
- 遷移先: APPROVED＋OK＋承認 → 後処理へ遷移
- NG時差し戻し先: Step1（coding-test-2review）/ Phase4（fs-refactoring-phase4-design）

### Integration セクションへの追記（before→after）

**before:**
```
**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `refactoring-verification-prompt.md` — Step 3（動作確認試験。プレースホルダーを実データで置換してサブエージェントに渡す）
```

**after:**
```
**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `refactoring-verification-prompt.md` — Step 3（工程①: 試験書作成モード / 工程③: 試験実行モード。プレースホルダーを実データで置換してサブエージェントに渡す）

**呼び出す名前付きエージェント（Step 3 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 3 工程②（試験書品質レビュー。wf_type=refactoring）
```

---

*本ファイルは [delta-design.md](./delta-design.md) の分割ファイルである。*
