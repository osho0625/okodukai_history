# 差分設計: fs-refactoring-phase5-impl（SKILL.md + implementer-prompt.md）

対象ファイル: `skills/fs-refactoring-phase5-impl/SKILL.md`, `implementer-prompt.md`（計2件、既存変更）

## 1. skills/fs-refactoring-phase5-impl/SKILL.md

### 1-1. The Iron Laws — 「既存テスト全実行のセーフティネット」記述の更新

**before:**
```
- **NEVER MERGE TASKS**: タスク実装ループは coding-test-2review を1回だけ呼び出す。オーケストレータ側でタスクを束ねたり、ループ・工程順序を制御してはならない（タスクごとの 1呼び出し=1サブタスク 制御、依存先ベースの並列実行、既存テスト全実行のセーフティネットは coding-test-2review 内部の責務）
```

**after:**
```
- **NEVER MERGE TASKS**: タスク実装ループは coding-test-2review を1回だけ呼び出す。オーケストレータ側でタスクを束ねたり、ループ・工程順序を制御してはならない（タスクごとの 1呼び出し=1サブタスク 制御、依存先ベースの並列実行は coding-test-2review 内部の責務）
```

**変更理由**: REQ-C-001。既存テスト全実行のセーフティネットは coding-test-2review 内部（タスク単位の実装ループ）ではなく、動作確認Step（Step2）に一本化されるため、本文中の「内部責務」の記述からセーフティネットを除外する。

### 1-2. Step 1: タスク実装ループ — bugfix_dir パラメータと preservation check 注記を削除

**before:**
```
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step1):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{refactoring_dir}/refactoring-design.md`（タスク一覧と依存先・状態を持つ）
　　- process_checklist_path=`{refactoring_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{refactoring_dir}/refactoring-design.md`（実装の根拠となるリファクタリング差分設計書）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`refactoring`
　　- bugfix_dir=`.aide/specs/{feature_name}/bugfix/`（過去不具合履歴ディレクトリ。リファクタリングで過去バグが元に戻る再混入を防ぐための preservation check 用。bugfix/ 配下が存在しない場合は coding-test-2review 内部で preservation check はスキップされる）
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step1):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念・並列可/逐次マーカーは使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
- テスト実行工程では対象テスト＋全体リグレッション（既存テスト全実行＝リファクタリングのセーフティネット）を実行し、外部振る舞いの保持を客観的に確認する
- さらに task_kind=`refactoring` かつ bugfix_dir が渡されるため、内部の preservation check 工程で bugfix_dir 配下の過去不具合修正が再混入（regression）していないことを検証する
- 成果物種別（プログラム / 非プログラム）の判定も内部で行う
- 実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う
- レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される
```

**after:**
```
・`coding-test-2review (aide-powers skill)` を activate して実行し、出力を"coding-test-2reviewの出力(Step1):"として記載する
　- 呼び出し時に次を渡す:
　　- task_list_path=`{refactoring_dir}/refactoring-design.md`（タスク一覧と依存先・状態を持つ）
　　- process_checklist_path=`{refactoring_dir}/impl-process-checklist.md`
　　- design_doc_paths=`{refactoring_dir}/refactoring-design.md`（実装の根拠となるリファクタリング差分設計書）
　　- doc_index_path
　　- pending_issues_path=`.aide/specs/{feature_name}/pending-issues.md`（実装・テスト・レビュー中に発見したスコープ外の問題・設計欠陥・別件不具合の随時記録先）
　　- task_kind=`refactoring`
　- 本スキルは実行可能タスクが無くなるまで内部でウェーブを繰り返すため、呼び出しは1回でよい（オーケストレータ側でループしない）
　coding-test-2reviewの出力(Step1):（全タスクの処理結果と最終状態）

注: coding-test-2review は内部で「実行可能タスク抽出（依存先ベース。レベル概念・並列可/逐次マーカーは使わない）→ タスク本数で最大6タスク（タスク内工程の同時起動数は上限カウント対象外）を 1タスクの1工程=1サブエージェント で起動し、同一タスク内では 実装∥テスト実装 を並列起動 → テスト実行 → 設計準拠レビュー∥コード品質レビュー を並列起動 → 各担当が自分の工程行（1工程1行）を3段階更新 → タスクリスト状態更新」を1ウェーブとし、実行可能タスクが無くなるまで繰り返す。
- テスト実行工程ではユニットテスト（対象タスクのテストファイル）のみを実行する。既存テスト全実行（外部振る舞いの保持確認）は本Step内では実施せず、後続の動作確認Step（Step2）で1回実施する設計に統一されている
- 成果物種別（プログラム / 非プログラム）の判定も内部で行う
- 実装・テスト・修正は micro-impl-agent、レビューは design-review-agent / code-review-agent が担う
- レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される
```

**変更理由**: REQ-C-001。preservation check 用の `bugfix_dir` パラメータの受け渡しを削除する。テスト実行工程における全体リグレッション（既存テスト全実行＝セーフティネット）は動作確認Step（Step2）に一本化されるため、タスク単位の実装ループ内では実施しない旨を明記する。

### 1-3. Step 2 の中身を「coding-test-2review出力の確認」から「regression-test-prompt.md による実際のリグレッションテスト実行」に変更（Step2/Step3は分離維持・統合しない）

**確定方針（重要）**: fs-refactoring-phase5-impl の Step2（リグレッションテスト結果の確認・報告）と Step3（動作確認試験）は、他3WF（fs-impl-phase4-execution, fs-change-phase2-impl, fs-bugfix-phase2-impl）と異なり、**1つの「動作確認Step」に統合しない**。Step2はそのままStep2として維持し、中身のみ「coding-test-2reviewの出力確認」から「regression-test-prompt.mdによる実際のリグレッションテスト実行」に変更する。Step3（動作確認試験）は完全に変更なし。Step2→Step3の遷移条件（リグレッション結果が全パス＆基準一致ならStep3へ）も維持する。

#### Step 2（見出し変更なし。中身を変更）

**before:**
```
## Step 2: リグレッションテスト結果の確認・報告（セーフティネット）

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・直前の実装ループ（coding-test-2review）の出力を確認する。coding-test-2review は内部のテスト実行工程で全体リグレッション（既存テスト全実行＝セーフティネット）を実施済みであり、status: DONE は全工程（リグレッション含む）PASS を意味する。**本 Step では FS 自身でテストを実行・修正しない。** coding-test-2review の出力からリグレッション結果を確認し記載する
　リグレッション結果(Step2):（coding-test-2review の出力に基づく。全パス（status: DONE＝全工程PASS） / ※テスト失敗は coding-test-2review が status: BLOCKED として実装ループ Step で既にユーザー確認済みのため通常本 Step には到達しない）
　リグレッション結果のユーザーへの報告(Step2):（セーフティネット（既存テスト全実行）の結果をユーザーに報告した内容）

### 完了条件
当該レポートに、coding-test-2review の出力に基づくリグレッション結果(Step2)とリグレッション結果のユーザーへの報告(Step2)が記載されている

### 状態判定
coding-test-2review の出力でリグレッション（既存テスト全実行）が全パスであることを確認しユーザーに報告したら、Step3 へ遷移する。（テスト失敗ケースは直前の実装ループ Step で coding-test-2review が status: BLOCKED を返した時点でユーザー確認済みのため、本 Step では扱わない）
```

**after:**
```
## Step 2: リグレッションテスト結果の確認・報告（セーフティネット）

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとして `micro-impl-agent` を起動し、既存テスト全実行（リグレッションテスト）を実際に実行させ、フェーズ1（fs-refactoring-phase1-status）で記録した開始前基準（セーフティネットベースライン）との比較結果を確認・報告させる。サブエージェントの出力を"リグレッションテスト実行サブエージェントの出力(Step2):"として記載する
　リグレッションテスト実行サブエージェントの出力(Step2):（全テスト実行結果: 総数/全パス数/失敗数、失敗テスト名一覧、開始前基準との比較結果）

### 完了条件
当該レポートに、リグレッションテスト実行サブエージェントの出力(Step2)が全パスかつ開始前基準との比較で差異なしであることが記載されている

### 状態判定
リグレッションテスト実行サブエージェントの出力(Step2)が全パスかつ開始前基準との比較で差異ないことを確認しユーザーに報告したら、Step3 へ遷移する。失敗がある場合は Step1（coding-test-2review）へ差し戻し、失敗テストの原因を修正するタスクを refactoring-design.md に追記してから再実装し、再度 Step2 を実行する
```

**変更理由**: REQ-C-002。approach.md で確定した方針は「Step2/Step3は分離維持し統合しない」であり、他3WFと同じ統合パターンをfs-refactoring-phase5-implには適用しない。Step2は見出し・Step番号を維持したまま、中身を「直前の実装ループ（coding-test-2review）の出力確認のみ」から「新規 regression-test-prompt.md を用いて micro-impl-agent に既存テスト全実行を実際に実行させ、フェーズ1の開始前基準との比較結果を確認・報告させる」設計に変更する。coding-test-2review 側は 1-2 の変更により内部で全体リグレッションを実行しなくなるため、その代替としてStep2が実際のリグレッションテスト実行を担う。Step2→Step3への遷移条件（全パス＆基準一致ならStep3へ）は元のまま維持する。

#### Step 3（変更なし）

元のSKILL.mdの「Step 3: 動作確認試験」（工程①: 試験書作成 〜 工程③: 試験実行、完了条件、状態判定を含む全体）は**一切変更しない**。before/after の差分自体が発生しないため、本節では省略する。

**変更理由**: 確定方針により、Step3はfs-refactoring-phase5-implにおいて変更対象外である。他3WFのような動作確認Stepへの統合は行わない。

### 1-4. Integration節: プロンプトテンプレート表・呼び出しエージェント表・Input from callerの更新

**before:**
```
**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `refactoring-verification-prompt.md` — Step 3（工程①: 試験書作成モード / 工程③: 試験実行モード。プレースホルダーを実データで置換してサブエージェントに渡す）

**呼び出す名前付きエージェント（Step 3 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 3 工程②（試験書品質レビュー。wf_type=refactoring）
```

**after:**
```
**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `regression-test-prompt.md` — Step 2 専任（工程番号なし・単独の呼び出し。micro-impl-agent 用。新規。phase1-statusのセーフティネット基準との比較報告を含む）
- `refactoring-verification-prompt.md` — Step 3（工程①: 試験書作成モード / 工程③: 試験実行モード。プレースホルダーを実データで置換してサブエージェントに渡す。元のStep番号・工程番号のまま）

**呼び出す名前付きエージェント（Step 2）:**
- `micro-impl-agent (aide-powers agent)` — Step 2（リグレッションテスト実行。regression-test-prompt.md 経由）

**呼び出す名前付きエージェント（Step 3 工程②）:**
- `manual-test-review-agent (aide-powers agent)` — Step 3 工程②（試験書品質レビュー。wf_type=refactoring。元のまま）
```

**変更理由**: 1-3 で確定したStep2/Step3分離維持の構成をIntegration節に反映する。regression-test-prompt.md はStep2専任の新規ファイルとして工程番号なしで追加し、refactoring-verification-prompt.md および manual-test-review-agent の呼び出しはStep3側で元のStep番号・工程番号のまま変更しない。

**before（Input from caller の bugfix_dir 説明）:**
```
- `bugfix_dir`: 過去不具合履歴ディレクトリ（`.aide/specs/{feature_name}/bugfix/`）。coding-test-2review に task_kind=`refactoring` とともに渡し、過去不具合の再混入検出（preservation check）に使用する
```

**after（該当行削除）:**
（削除。coding-test-2review 呼び出し時に bugfix_dir を渡さなくなったため、Input from caller の一覧からも削除する）

**変更理由**: REQ-C-001。coding-test-2review 呼び出し時の bugfix_dir パラメータ廃止（1-2）に伴い、本スキルが呼び出し元から受け取る入力としても不要になる。

---

## 2. skills/fs-refactoring-phase5-impl/implementer-prompt.md

### 2-1. mode: run_test — テスト実行コマンドから全体リグレッション（セーフティネット）を削除

**before:**
```
## mode: run_test（テスト実行）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are running tests for a refactoring task.

    ## Task Information
    - Task number: {タスク番号}

    ## Mode
    run_test

    ## Target Files
    - Test file: {tests/レイヤー/test_ファイル名}

    ## Test Commands（必須）
    - Target test: {dev-environment.md に記載のテスト実行コマンド} {tests/レイヤー/test_ファイル名} -v
    - Full regression (SAFETY NET): {dev-environment.md に記載のテスト実行コマンド} -v

    ※ テスト実行コマンドは dev-environment.md の記載を優先すること。
    ※ 必ず全体リグレッション（セーフティネット）も実行すること。

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**
```
```

**after:**
```
## mode: run_test（テスト実行）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are running tests for a refactoring task.

    ## Task Information
    - Task number: {タスク番号}

    ## Mode
    run_test

    ## Target Files
    - Test file: {tests/レイヤー/test_ファイル名}

    ## Test Commands（必須）
    - Unit test: {dev-environment.md に記載のテスト実行コマンド} {tests/レイヤー/test_ファイル名} -v

    ※ テスト実行コマンドは dev-environment.md の記載を優先すること。

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**
```
```

**変更理由**: REQ-C-001・REQ-C-003。タスク単位の実装ループ内での全体リグレッション（セーフティネット）実行を廃止する（動作確認Stepの regression-test-prompt.md に一本化）。用語も英語表記の "Target test" → "Unit test" に統一する。
