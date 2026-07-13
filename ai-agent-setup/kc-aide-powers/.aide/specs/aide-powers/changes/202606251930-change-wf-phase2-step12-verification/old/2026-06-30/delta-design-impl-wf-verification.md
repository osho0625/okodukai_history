# 差分設計: 実装WF fs-impl-phase4-execution Step 2

## 変更箇所 1: Step 2 タイトルおよび本文の全面書き換え

### 変更理由
現行の Step 2 は「ユーザー動作検証依頼」として、ユーザーに報告・依頼するだけの構成。実装WFでは受入基準ではなくユースケースと動作試験書（manual-test-plan.md）をベースとした試験が適切。変更WF/bugfix WFと同一パターンの横展開により一貫性を確保する。

### before
```markdown
## Step 2: ユーザー動作検証依頼

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・全タスク完了後、動作可能な状態になったことをユーザーに報告し、GUI/CLI 動作検証を依頼した内容を記載する。伝える内容: 起動コマンド／動作可能なユースケース（何ができるか）／まだ未実装の機能（何ができないか）／確認してほしいポイント
　動作検証依頼内容(Step2):
・ユーザーからのフィードバックがあれば対応した結果を記載する
　動作検証のフィードバック対応(Step2):（フィードバックあり → 対応内容 / フィードバックなし）

### 完了条件
fs-impl-phase4-report.txtに、動作検証依頼内容(Step2)と動作検証のフィードバック対応(Step2)が記載されている

### 状態判定
- 完了条件を満たしていれば後処理へ遷移する。
- フィードバックで実装の修正が必要になった場合は Step1（coding-test-2review）に差し戻して修正し、再度 Step2 を実行する。
```

### after
```markdown
## Step 2: 動作検証・ユーザー確認

### 成果物
fs-impl-phase4-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・実装した機能が正しく動作することを動作確認する。本スキルディレクトリの `impl-verification-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを起動して動作確認試験を実行させる。サブエージェントの出力を"動作確認サブエージェントの出力(Step2):"として記載する。サブエージェントが .aide/specs/{feature_name}/verification-report.md を出力したことを確認する
　動作確認方法(Step2):（サブエージェント実行 / ユーザーに依頼）
　動作確認手順(Step2):（実行した試験内容の要約）
　動作確認結果(Step2):（OK: 全試験項目パス / NG: 問題あり）
　動作確認サブエージェントの出力(Step2):
・動作確認結果が OK の場合、ユーザーに実装内容と確認結果を報告し、ユーザーからの承認を得る
　ユーザー承認結果(Step2):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step2):

> ⚠️ **動作確認の定義（build/テスト通過だけでは不可）:**
> 「動作確認」とは、**実際にアプリケーションを動作させ、ユースケースに基づく試験と動作試験書（manual-test-plan.md）に基づく試験を実行する**ことを意味する。build が通る・単体テストが通るだけでは動作確認とみなさない。
>
> **FSの責務:**
> FSの責務は「プロンプトテンプレート準備（プレースホルダー埋込）→ サブエージェント起動 → 結果受領 → verification-report.md 存在確認」に限定される。FS自身が直接試験を実行してはならない。
>
> **確認の優先順位（サブエージェントに委譲）:**
> 1. **サブエージェントが自分で動作確認する（必須）:** アプリケーションを起動し、ユースケースに基づく試験を実行する
> 2. **Web アプリの場合は Playwright MCP を使って必ずブラウザ操作で確認する:** 画面遷移・ボタン操作・表示内容を実際に検証する
> 3. **どうしても自分で確認できない場合のみ:** ユーザーに動作確認を依頼し、ユーザーから「確認OK」の回答を得てから完了とする
>
> 自分で確認できない場合の例: 物理デバイスが必要、外部サービスとの連携が必要、特定の権限が必要 等
>
> **ローカル/試験環境での実行制約:**
> 動作確認はローカル環境または試験環境で実行し、運用中のシステムに影響を与えてはならない。

### 完了条件
fs-impl-phase4-report.txtに、動作確認結果(Step2)が「OK」であり、ユーザー承認結果(Step2)が「承認」であり、.aide/specs/{feature_name}/verification-report.md が存在すること

### 状態判定
- 動作確認結果(Step2)が「OK」かつユーザー承認結果(Step2)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step2)が「NG」の場合 → 問題の内容を分析し、以下に遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを impl-task-list.md に追記してから再実装する
- ユーザー承認結果(Step2)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step2)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

---

## 変更箇所 2: 成果物テーブルへの追加

### 変更理由
verification-report.md は本変更で新たに追加される成果物であり、成果物テーブルへの反映が必要。

### before
```markdown
# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | 設計書で定義されたパス | impl-task-list.md に基づく実装コード |
| テストコード | 設計書で定義されたパス | 各実装に対応するテストコード |
| impl-task-list.md | .aide/specs/{feature_name}/impl-task-list.md | タスクリスト（全タスク完了状態に更新） |
| impl-process-checklist.md | .aide/specs/{feature_name}/impl-process-checklist.md | 工程チェック表（1工程1行。全工程行が ✅ done／➖ skip） |
| impl-progress.md | .aide/specs/{feature_name}/impl-progress.md | 実装ワークフローの進捗ファイル（phase-report-check が更新） |
| fs-impl-phase4-report.txt | .aide/tmp/fs-impl-phase4-report.txt | fs-impl-phase4-execution の実行レポート |
```

### after
```markdown
# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | 設計書で定義されたパス | impl-task-list.md に基づく実装コード |
| テストコード | 設計書で定義されたパス | 各実装に対応するテストコード |
| impl-task-list.md | .aide/specs/{feature_name}/impl-task-list.md | タスクリスト（全タスク完了状態に更新） |
| impl-process-checklist.md | .aide/specs/{feature_name}/impl-process-checklist.md | 工程チェック表（1工程1行。全工程行が ✅ done／➖ skip） |
| verification-report.md | .aide/specs/{feature_name}/verification-report.md | 動作確認試験書（サブエージェントが出力） |
| impl-progress.md | .aide/specs/{feature_name}/impl-progress.md | 実装ワークフローの進捗ファイル（phase-report-check が更新） |
| fs-impl-phase4-report.txt | .aide/tmp/fs-impl-phase4-report.txt | fs-impl-phase4-execution の実行レポート |
```

---

## 変更箇所 3: Integration セクションへのプロンプトテンプレート追加

### 変更理由
新規作成するプロンプトテンプレートをIntegrationセクションに追加する必要がある。現行のIntegrationセクションにはプロンプトテンプレート一覧が存在しないため、新規セクションとして追加する。

### before
```markdown
**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。phase-report-check(write) の後にコミット）
- `pending-issues-management (aide-powers skill)` — 作業中に発見した問題の記録（record）。実装中の問題は coding-test-2review 内部および本スキルから随時記録する
- `visual-companion (aide-powers skill)` — 動作検証依頼時の視覚的提示に活用
- `task-orchestration (aide-powers skill)` — 量が多い場合の分割処理に活用
```

### after
```markdown
**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
- `git-commit-workflow (aide-powers skill)` — 後処理（各フェーズコミット型。phase-report-check(write) の後にコミット）
- `pending-issues-management (aide-powers skill)` — 作業中に発見した問題の記録（record）。実装中の問題は coding-test-2review 内部および本スキルから随時記録する
- `visual-companion (aide-powers skill)` — 動作検証依頼時の視覚的提示に活用
- `task-orchestration (aide-powers skill)` — 量が多い場合の分割処理に活用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `impl-verification-prompt.md` — Step 2（動作確認サブエージェント委譲）
```

---

## 変更箇所 4: レポート運用ルールの例示更新

### 変更理由
レポート運用ルール内の例示が旧Step名「動作検証依頼内容(Step2)」を参照しているため、新Step名に合わせて更新する。

### before
```markdown
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `動作検証依頼内容(Step2): N/A（動作可能な状態に至っていないため未依頼）`）
```

### after
```markdown
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `動作確認結果(Step2): N/A（動作可能な状態に至っていないため未実行）`）
```
