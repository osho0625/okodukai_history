# 差分設計: fs-change-phase2-impl（SKILL.md + change-task-planner-prompt.md）

対象ファイル: `skills/fs-change-phase2-impl/SKILL.md`, `change-task-planner-prompt.md`（計2件、既存変更）

## 1. skills/fs-change-phase2-impl/SKILL.md

### 1-1. 成果物テーブル: verification-report.md の説明を更新

**before:**
```
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |
| fs-change-phase2-report.txt | .aide/tmp/fs-change-phase2-report.txt | fs-change-phase2-implの実行レポート |
```

**after:**
```
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |
| fs-change-phase2-report.txt | .aide/tmp/fs-change-phase2-report.txt | fs-change-phase2-implの実行レポート |
```
（テーブル自体は変更なし。test-{機能名}-test-plan.md の説明行を以下のように更新する）

**before（該当行）:**
```
| test-{機能名}-test-plan.md | {changes_dir}/testing/test-{機能名}-test-plan.md | 機能別動作確認試験書（サブエージェントが出力） |
```

**after（該当行）:**
```
| test-{機能名}-test-plan.md | {changes_dir}/testing/test-{機能名}-test-plan.md | 機能別動作確認試験書（動作確認試験サブエージェントが出力）＋リグレッションテスト結果（リグレッションテスト実行サブエージェントが出力） |
```

**変更理由**: REQ-C-002。動作確認Step（Step11）が動作確認試験とリグレッションテストの2系統を実施する設計になるため、成果物の説明にリグレッションテスト結果を追記する。

### 1-2. Step 10: タスク実装ループ — bugfix_dir パラメータと preservation check 注記を削除

**before:**
```
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step10):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{changes_dir}/delta-task-list.md`
　　- process_checklist_path=`{changes_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{changes_dir}/delta-design.md`（実装の根拠となる差分設計書。分割構成の場合はメイン+全分割ファイル）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`change`
　　- bugfix_dir=`.aide/specs/{feature_name}/bugfix/`（過去不具合履歴の親ディレクトリ。過去に修正したバグの再混入（preservation check / regression）検出に使用する。各 bugfix サブフォルダの history.md が照合対象。bugfix/ ディレクトリが存在しない場合は省略可）
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step10):（全タスクの処理結果と最終状態。preservation check の結果を含む）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。成果物種別（プログラム / 非プログラム）の判定も内部で行う。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。task_kind=change かつ bugfix_dir が渡されるため、テスト実装・各レビュー工程で preservation check（bugfix_dir 配下の過去修正バグが再混入していないこと・過去バグへのリグレッションテストが存在することの検証）が内部で実施される。
```

**after:**
```
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step10):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{changes_dir}/delta-task-list.md`
　　- process_checklist_path=`{changes_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{changes_dir}/delta-design.md`（実装の根拠となる差分設計書。分割構成の場合はメイン+全分割ファイル）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`change`
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step10):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念は使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。成果物種別（プログラム / 非プログラム）の判定も内部で行う。実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う。レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。リグレッションテスト（既存テスト全実行）は本Step内では実施せず、後続の動作確認Step（Step11）で1回実施する設計に統一されている。
```

**変更理由**: REQ-C-001。preservation check の実施は動作確認Stepに一本化されるため、`bugfix_dir` パラメータの受け渡しと注記中の preservation check 説明を削除する。

### 1-3. 完了条件: 「リグレッションテスト全パス」の記述を削除

**before:**
```
### 完了条件
fs-change-phase2-report.txtに coding-test-2reviewの出力(Step10)が記載され、status: DONE であり、{changes_dir}/delta-task-list.md の全タスクが完了状態に更新され、{changes_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```

**after:**
```
### 完了条件
fs-change-phase2-report.txtに coding-test-2reviewの出力(Step10)が記載され、status: DONE であり、{changes_dir}/delta-task-list.md の全タスクが完了状態に更新され、{changes_dir}/impl-process-checklist.md の全工程行が `✅ done`（または `➖ skip`）である（1工程1行構造での全工程 PASS 判定。共通仕様 CF-9）
```
（この完了条件自体に「リグレッションテスト全パス」の文言は元々含まれていないため変更不要。参考: 完了条件の全体像は本ファイル末尾の「完了条件」章の項目5に記載されており、そちらを次項で修正する）

### 1-4. Step 11・Step 12 を「動作確認Step」に統合し、リグレッションテスト実行サブエージェントを追加

**before:**
```
## Step 11: リグレッションテスト結果の確認・報告（セーフティネット）

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・直前の実装ループ（coding-test-2review）の出力を確認する。coding-test-2review は内部のテスト実行工程で全体リグレッション（既存テスト全実行＝セーフティネット）を実施済みであり、status: DONE は全工程（リグレッション含む）PASS を意味する。**本 Step では FS 自身でテストを実行・修正しない。** coding-test-2review の出力からリグレッション結果を確認し記載する
　リグレッション結果(Step11):（coding-test-2review の出力に基づく。全パス（status: DONE＝全工程PASS） / ※テスト失敗は coding-test-2review が status: BLOCKED として実装ループ Step で既にユーザー確認済みのため通常本 Step には到達しない）
　リグレッション結果のユーザーへの報告(Step11):（セーフティネット（既存テスト全実行）の結果をユーザーに報告した内容）

### 完了条件
fs-change-phase2-report.txtに、coding-test-2review の出力に基づくリグレッション結果(Step11)とリグレッション結果のユーザーへの報告(Step11)が記載されている

### 状態判定
coding-test-2review の出力でリグレッション（既存テスト全実行）が全パスであることを確認しユーザーに報告したら、Step12 へ遷移する。（テスト失敗ケースは直前の実装ループ Step で coding-test-2review が status: BLOCKED を返した時点でユーザー確認済みのため、本 Step では扱わない）

## Step 12: 動作検証・ユーザー確認

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: 試験書作成】本スキルディレクトリの `change-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step12-①):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step12-①):
　作成された試験書パス(Step12-①):

・【工程②: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `change`
　- 試験書パス: 工程①で受領したパス
　- WF固有入力: change-requirements.md（受入基準）
　レビュー結果を"試験書レビュー結果(Step12-②):"として即時記載する
　- **APPROVED の場合** → 工程③へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `change-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step12-②):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step12-②):

・【工程③: 試験実行】工程②で APPROVED となった試験書に基づき、`change-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、実際の動作確認（試験実行）を行う。試験結果を"試験実行サブエージェントの出力(Step12-③):"として記載する
　試験実行サブエージェントの出力(Step12-③):

・動作確認結果が全てOK の場合、ユーザーに変更内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step12):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step12):

### 完了条件
fs-change-phase2-report.txtに以下が全て満たされていること:
- 試験書レビュー結果(Step12-②)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step12)が「OK」である
- ユーザー承認結果(Step12)が「承認」である（エビデンス付き報告済み）
- {changes_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- 工程②で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程③に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程②が APPROVED かつ動作確認結果(Step12)が「OK」かつユーザー承認結果(Step12)が「承認」の場合 → Step13 へ遷移する
- 動作確認結果(Step12)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step10（タスク実装ループ）へ差し戻し、追加修正タスクを delta-task-list.md に追記してから再実装する
　- 設計の問題（差分設計自体に問題）→ Step2（差分設計の作成）へ差し戻す
- ユーザー承認結果(Step12)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step12)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

**after:**
```
## Step 11: 動作確認Step（動作確認試験＋リグレッションテスト）

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:

・【工程①: リグレッションテスト実行（先行・ブロッキング）】本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を行う。**本工程は工程②〜④（動作確認試験）より先に実行し、全パスを確認できるまで工程②〜④に進まない**。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step11-①):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step11-①):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧）

・【工程②: 試験書作成】工程①で全パスを確認した後、本スキルディレクトリの `change-verification-prompt.md` の「試験書作成」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、動作確認試験書を**作成**させる（この時点では試験実行しない）。サブエージェントの出力を"試験書作成サブエージェントの出力(Step11-②):"として記載する。試験書パスを受領する
　試験書作成サブエージェントの出力(Step11-②):
　作成された試験書パス(Step11-②):

・【工程③: 試験書レビュー（PASSまでループ）】`manual-test-review-agent` を起動し、以下を渡してレビューさせる:
　- wf_type: `change`
　- 試験書パス: 工程②で受領したパス
　- WF固有入力: change-requirements.md（受入基準）
　レビュー結果を"試験書レビュー結果(Step11-③):"として即時記載する
　- **APPROVED の場合** → 工程④へ進む
　- **NEEDS_FIX の場合** → 指摘内容に基づき `change-verification-prompt.md` の「試験書作成」セクションを用いてサブエージェントに試験書を修正させ、再度 `manual-test-review-agent` でレビューする。**APPROVED になるまで繰り返す**（design-impl-gap-process.md プロセスC 準拠。**10回**繰り返しても APPROVED にならない場合は停止しユーザーに相談する。ユーザーが「続行する」を選択した場合はカウントをリセットして再度10回まで繰り返す）
　試験書レビュー結果(Step11-③):（APPROVED / NEEDS_FIX + 指摘内容）
　試験書レビューループ回数(Step11-③):

・【工程④: 試験実行】工程③で APPROVED となった試験書に基づき、`change-verification-prompt.md` の「試験実行」セクションをモード指定し、プレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、実際の動作確認（試験実行）を行う。試験結果を"試験実行サブエージェントの出力(Step11-④):"として記載する
　試験実行サブエージェントの出力(Step11-④):

・動作確認結果（工程④）が全てOK の場合（リグレッションテスト結果〔工程①〕は既に全パス確認済み）、ユーザーに変更内容と確認結果を報告し、ユーザーからの承認を得る。**報告には各試験項目の実施方法・エビデンス（実動作確認〔用いた手段: ブラウザ操作/APIコール/CLI実行等〕／コードレビュー代替）と、リグレッションテスト結果（全パス/失敗件数）を添える。エビデンスを欠いた「OK」のみの報告は完了条件として不許容**
　ユーザー承認結果(Step11):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step11):

### 完了条件
fs-change-phase2-report.txtに以下が全て満たされていること:
- リグレッションテスト実行サブエージェントの出力(Step11-①)が全パスである
- 試験書レビュー結果(Step11-③)が「APPROVED」である
- 試験実行が APPROVED 済み試験書に基づいて実施済みである
- 動作確認結果(Step11-④)が「OK」である
- ユーザー承認結果(Step11)が「承認」である（エビデンス付き報告済み）
- {changes_dir}/testing/test-{機能名}-test-plan.md が存在すること

### 状態判定
- リグレッションテスト結果(Step11-①)に失敗がある場合 → 工程②〜④に進まず、Step10（タスク実装ループ）へ差し戻し、失敗テストの原因を修正するタスクを delta-task-list.md に追記してから再実装し、再度Step11（工程①から）を実行する
- 工程③で試験書レビューが NEEDS_FIX の場合 → 試験書修正→再レビューへループ（APPROVED になるまで工程④に進まない。プロセスC準拠で10回繰り返しても APPROVED にならない場合は停止しユーザー相談）
- 工程③が APPROVED かつ動作確認結果(Step11-④)が「OK」かつユーザー承認結果(Step11)が「承認」の場合 → Step12 へ遷移する
- 動作確認結果(Step11-④)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step10（タスク実装ループ）へ差し戻し、追加修正タスクを delta-task-list.md に追記してから再実装する
　- 設計の問題（差分設計自体に問題）→ Step2（差分設計の作成）へ差し戻す
- ユーザー承認結果(Step11)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step11)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

**変更理由**: REQ-C-002。approach.md の実行方式に従い、従来別々だった「Step11: リグレッションテスト結果の確認・報告（セーフティネット）」と「Step12: 動作検証・ユーザー確認」を1つの「動作確認Step」（Step11）に統合する。統合後のStep11は「リグレッションテスト実行サブエージェント」（新規の regression-test-prompt.md）と「動作確認試験サブエージェント」（既存の change-verification-prompt.md）の2つの独立した呼び出しで構成する。ユーザーからの指摘（「順番はリグレッションテストが先だよね？」）に基づき確定した実行順序に従い、リグレッションテスト（工程①）を先に実行し、全パスを確認したうえで初めて動作確認試験（工程②〜④）に進む逐次実行とする（並列実行ではない）。完了条件・状態判定にもこの順序を反映する。

### 1-5. Step 13（旧Step13）→ Step12 へのリナンバリング（設計書反映）

**before:**
```
## Step 13: 設計書反映

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計書反映エージェントの出力(Step13):"として記載する。delta-design.md の内容を既存設計書にマージし、変更履歴（{changes_dir}/history.md）を初期作成する
　更新された設計書一覧(Step13):

### 完了条件
fs-change-phase2-report.txtの設計書反映エージェントの出力(Step13)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/history.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep14へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step14 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの設計書反映エージェントの出力(Step13)のステータスがNEEDS_CONTEXT の場合、追加情報を補い `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する
```

**after:**
```
## Step 12: 設計書反映

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"設計書反映エージェントの出力(Step12):"として記載する。delta-design.md の内容を既存設計書にマージし、変更履歴（{changes_dir}/history.md）を初期作成する
　更新された設計書一覧(Step12):

### 完了条件
fs-change-phase2-report.txtの設計書反映エージェントの出力(Step12)の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、{changes_dir}/history.md がファイルサイズ1byte以上で存在する

### 状態判定
- 完了条件を満たしていればStep13へ遷移する
- ただしステータスが DONE_WITH_CONCERNS の場合は、Step13 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- fs-change-phase2-report.txtの設計書反映エージェントの出力(Step12)のステータスがNEEDS_CONTEXT の場合、追加情報を補い `change-doc-syncer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合、ユーザーに報告し対応方針を確認する
```

**変更理由**: Step統合（1-4）に伴い、以降のStepが1つずつ前倒しになる。旧Step13（設計書反映）→新Step12。

### 1-6. Step 14（旧）→ Step13 へのリナンバリング（pending-issues 書き込み忘れチェック）

**before:**
```
## Step 14: pending-issues 書き込み忘れチェック

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・pending-issues-management (aide-powers skill: check)を activate して実行し（progress_file_path: `{changes_dir}/change-progress.md`, pending_issues_path: `.aide/specs/{feature_name}/pending-issues.md`）、出力を"pending-issues-management(check)の出力(Step14):"として記載する。共通スキルが進捗ファイルを遡り書き込み漏れパターンを検索する。その記載内容から、次の項目を判断して記載する
　書き込み漏れの有無と対応(Step14):（漏れなし / 漏れあり → ユーザー確認の上 pending-issues.md に追記）

注: pending-issues.md の有無に関わらず実行する（進捗ファイル遡り照合が目的）。

### 完了条件
fs-change-phase2-report.txtに、pending-issues-management(check)の出力(Step14)と書き込み漏れの有無と対応(Step14)が記載されている

### 状態判定
完了条件を満たしていればStep15へ遷移する
```

**after:**
```
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

**変更理由**: Step統合（1-4）に伴うリナンバリング。旧Step14→新Step13。

### 1-7. Step 15（旧）→ Step14 へのリナンバリング（変更完了の案内）

**before:**
```
## Step 15: 変更完了の案内

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・変更内容サマリーを作成・提示した結果を記載する（変更要求＝change-requirements.md の概要／変更内容＝delta-design.md の概要／実装タスク＝delta-task-list.md のタスク一覧）
　変更内容サマリー(Step15):
・更新設計書一覧を提示する
　変更完了案内の更新設計書一覧(Step15):
・テスト実行結果を提示する（全テスト・リグレッションテスト）
　テスト実行結果(Step15):
・changes/ 配下の変更履歴を提示する（changes_dir パス + 格納ドキュメント一覧）
　変更履歴提示結果(Step15):（提示した changes_dir パスと格納ドキュメント一覧）
・pending-issues 対応方針を確認した結果を記載する。pending-issues.md が存在する場合は `pending-issues-management (aide-powers skill: present)` を activate して実行し、出力を"pending-issues-management(present)の出力(Step15):"として記載する。記録された全問題を重要度順にユーザーに提示し各問題の対応方針を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues-management(present)の出力(Step15):
　pending-issues対応方針(Step15):

### 完了条件
fs-change-phase2-report.txtに、変更内容サマリー(Step15)・変更完了案内の更新設計書一覧(Step15)・テスト実行結果(Step15)・変更履歴提示結果(Step15)・pending-issues-management(present)の出力(Step15)・pending-issues対応方針(Step15)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する
```

**after:**
```
## Step 14: 変更完了の案内

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・変更内容サマリーを作成・提示した結果を記載する（変更要求＝change-requirements.md の概要／変更内容＝delta-design.md の概要／実装タスク＝delta-task-list.md のタスク一覧）
　変更内容サマリー(Step14):
・更新設計書一覧を提示する
　変更完了案内の更新設計書一覧(Step14):
・テスト実行結果を提示する（ユニットテスト・リグレッションテスト）
　テスト実行結果(Step14):
・changes/ 配下の変更履歴を提示する（changes_dir パス + 格納ドキュメント一覧）
　変更履歴提示結果(Step14):（提示した changes_dir パスと格納ドキュメント一覧）
・pending-issues 対応方針を確認した結果を記載する。pending-issues.md が存在する場合は `pending-issues-management (aide-powers skill: present)` を activate して実行し、出力を"pending-issues-management(present)の出力(Step14):"として記載する。記録された全問題を重要度順にユーザーに提示し各問題の対応方針を確認する。存在しない場合は「未対応の問題はありません」と報告する
　pending-issues-management(present)の出力(Step14):
　pending-issues対応方針(Step14):

### 完了条件
fs-change-phase2-report.txtに、変更内容サマリー(Step14)・変更完了案内の更新設計書一覧(Step14)・テスト実行結果(Step14)・変更履歴提示結果(Step14)・pending-issues-management(present)の出力(Step14)・pending-issues対応方針(Step14)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する
```

**変更理由**: Step統合（1-4）に伴うリナンバリング。旧Step15→新Step14。テスト実行結果の表記も「全テスト」→「ユニットテスト」に用語統一する（REQ-C-003）。

### 1-8. 完了条件（章末）の項目5からリグレッションテスト表記を統一

**before:**
```
5. delta-task-list.md の全タスクが実装完了し、レビュー全PASS、テスト全PASS、リグレッションテスト全パス
```

**after:**
```
5. delta-task-list.md の全タスクが実装完了し、レビュー全PASS、ユニットテスト全PASS
6. 動作確認Stepでリグレッションテスト（既存テスト全実行）が1回実施され、全パスであること
```

**変更理由**: REQ-C-001・REQ-C-002・REQ-C-003。リグレッションテストの実施主体が実装ループ内（項目5に一体化）から動作確認Step（新設の項目6）に変わったことを明示する。以降の項目番号は1つずつ後ろにずれる（旧6〜13→新7〜14）。用語も「テスト全PASS」→「ユニットテスト全PASS」に統一する。

### 1-9. Integration節: プロンプトテンプレート表・呼び出しエージェント表・Step番号参照の更新

**before:**
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

**after:**
```
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `regression-test-prompt.md` — Step 11（工程①: リグレッションテスト実行専任。micro-impl-agent 用。新規。動作確認試験より先行実行）
- `change-verification-prompt.md` — Step 11（工程②: 試験書作成モード / 工程④: 試験実行モード）
- `change-doc-syncer-prompt.md` — Step 12

**呼び出す名前付きエージェント（Step 11 工程①）:**
- `micro-impl-agent (aide-powers agent)` — Step 11 工程①（リグレッションテスト実行。regression-test-prompt.md 経由。工程②〜④より先行）

**呼び出す名前付きエージェント（Step 11 工程③）:**
- `manual-test-review-agent (aide-powers agent)` — Step 11 工程③（試験書品質レビュー。wf_type=change）
```

**変更理由**: Step統合・リナンバリング（1-4, 1-5）と新規ファイル追加（regression-test-prompt.md）を Integration 節に反映する。リグレッションテスト先行の逐次実行順序（工程①→②→③→④）に合わせて工程番号を採番する。
```

---

## 2. skills/fs-change-phase2-impl/change-task-planner-prompt.md

### 2-1. 変更ワークフロー固有のルール — 「リグレッションテスト必須」の記述を削除

**before:**
```
### 変更ワークフロー固有のルール

1. **差分設計ベースの分解**: delta-design.md の変更項目を起点にタスクを分解する
   - 新規追加: 新規クラスの実装（1クラス = 1親タスク）
   - 既存変更: 既存クラス・メソッドの変更（1変更箇所 = 1親タスク）
   - GUI実装: 画面レイアウト変更、新規ウィジェット・イベントハンドラ

2. **リグレッションテスト必須**: impact-analysis.md の「テスト対象機能」から
   リグレッションテストタスクを抽出する
   - 直接変更する機能 → 必ずテストが必要
   - 変更の影響を受ける可能性がある機能 → リグレッションテスト対象

3. **before→after 追跡**: 既存変更タスクでは delta-design.md の
   before→after セクションを設計参照として明記する

4. **インターフェース影響の連鎖**: シグネチャ変更がある場合、
   影響を受ける実装クラスの修正タスクも依存関係に含める
```

**after:**
```
### 変更ワークフロー固有のルール

1. **差分設計ベースの分解**: delta-design.md の変更項目を起点にタスクを分解する
   - 新規追加: 新規クラスの実装（1クラス = 1親タスク）
   - 既存変更: 既存クラス・メソッドの変更（1変更箇所 = 1親タスク）
   - GUI実装: 画面レイアウト変更、新規ウィジェット・イベントハンドラ

2. **before→after 追跡**: 既存変更タスクでは delta-design.md の
   before→after セクションを設計参照として明記する

3. **インターフェース影響の連鎖**: シグネチャ変更がある場合、
   影響を受ける実装クラスの修正タスクも依存関係に含める
```

**変更理由**: REQ-C-001・REQ-C-002。リグレッションテスト（既存テスト全実行）の実施は動作確認Step（regression-test-prompt.md 経由）に一本化されたため、実装タスクの一種として個別にリグレッションテストタスクを計画する必要がなくなる。impact-analysis.md の「テスト対象機能」自体は影響範囲分析の観点として維持されるが、それをタスクリスト上のリグレッションテストタスクへ変換する工程は廃止する。

### 2-2. タスク分解手順 ステップ2 — リグレッションテストタスク抽出手順を削除

**before:**
```
#### ステップ2: タスク分解（2層構造）

1. delta-design.md の「新規追加」セクションから新規追加タスクを抽出する
2. delta-design.md の「既存変更」セクションから既存変更タスクを抽出する
3. delta-design.md の「GUI差分」セクション（存在する場合）からGUI実装タスクを抽出する
4. impact-analysis.md の「テスト対象機能」からリグレッションテストタスクを抽出する
5. 各タスクを親タスク + サブタスクに分解する:
   - 親タスク = クラス/変更項目単位（1ファイル）
   - サブタスク = publicメソッド単位（1サブタスク = 1 publicメソッド）
   - メソッドのないクラス（値オブジェクト、列挙型等）はサブタスクなし
```

**after:**
```
#### ステップ2: タスク分解（2層構造）

1. delta-design.md の「新規追加」セクションから新規追加タスクを抽出する
2. delta-design.md の「既存変更」セクションから既存変更タスクを抽出する
3. delta-design.md の「GUI差分」セクション（存在する場合）からGUI実装タスクを抽出する
4. 各タスクを親タスク + サブタスクに分解する:
   - 親タスク = クラス/変更項目単位（1ファイル）
   - サブタスク = publicメソッド単位（1サブタスク = 1 publicメソッド）
   - メソッドのないクラス（値オブジェクト、列挙型等）はサブタスクなし
```

**変更理由**: REQ-C-001・REQ-C-002。手順4（リグレッションテストタスク抽出）を廃止する。

### 2-3. delta-task-list.md 作成テンプレート — リグレッションテストセクションを削除

**before:**
```
（タスクごとに繰り返し）

### リグレッションテスト（全タスク完了後）

#### タスク D-R-001: {テスト対象機能名} のリグレッションテスト
- テスト種別: リグレッション
- 対象テストファイル: {パス}
- 確認内容: {何を確認するか}

## 網羅性チェック結果
- チェック回数: {N}回
- 設計書の総変更項目数: {A}件
- タスクリストの総タスク数: {B}件
- 最終結果: 漏れなし

## タスクサマリー
- 新規追加タスク: {N}件
- 既存変更タスク: {N}件
- GUI実装タスク: {N}件
- リグレッションテスト: {N}件
- 合計: {N}件
```
```

**after:**
```
（タスクごとに繰り返し）

## 網羅性チェック結果
- チェック回数: {N}回
- 設計書の総変更項目数: {A}件
- タスクリストの総タスク数: {B}件
- 最終結果: 漏れなし

## タスクサマリー
- 新規追加タスク: {N}件
- 既存変更タスク: {N}件
- GUI実装タスク: {N}件
- 合計: {N}件
```
```

**変更理由**: REQ-C-001・REQ-C-002。リグレッションテストタスクのテンプレートを削除する。リグレッションテスト（既存テスト全実行）は動作確認Step（Step11 工程④・regression-test-prompt.md）で1回実施されるため、delta-task-list.md 上に個別タスクとして計画する必要がなくなる。

### 2-4. 報告フォーマット — タスクサマリーの記載内容からリグレッションテスト件数を削除

**before:**
```
### 報告フォーマット
完了時に以下を報告すること:
- **Status:** DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 作成したファイル: {changes_dir}/delta-task-list.md, {changes_dir}/impl-process-checklist.md
- タスクサマリー（新規追加/既存変更/GUI実装/リグレッションテストの件数）
- 懸念事項（ある場合）
```

**after:**
```
### 報告フォーマット
完了時に以下を報告すること:
- **Status:** DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- 作成したファイル: {changes_dir}/delta-task-list.md, {changes_dir}/impl-process-checklist.md
- タスクサマリー（新規追加/既存変更/GUI実装の件数）
- 懸念事項（ある場合）
```

**変更理由**: 上記2-3と整合させる。
