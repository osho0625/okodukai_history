# 差分設計: 変更WF fs-change-phase2-impl Step 12

## 変更箇所 1: Step 12 タイトルおよび本文の全面書き換え

### 変更理由
現行の Step 12 は「ユーザー動作検証依頼」として、ユーザーに報告・依頼するだけの構成。AI Agent 側での動作確認が一切行われず、build が通るだけでは実際の動作保証にならない。bugfix WF Step 10 で確立された「動作検証・ユーザー確認」パターンを踏襲し、さらにサブエージェント委譲と verification-report.md 出力を追加することで、動作確認の品質を向上させる。

### before
```markdown
## Step 12: ユーザー動作検証依頼

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・変更した機能が動作可能な状態になったことをユーザーに報告し、動作検証を依頼した内容を記載する。伝える内容: 変更した機能の概要／動作確認の手順／確認してほしいポイント／影響がある既存機能
　動作検証依頼内容(Step12):

### 完了条件
fs-change-phase2-report.txtに、動作検証依頼内容(Step12)が記載されている

### 状態判定
完了条件を満たしていればStep13へ遷移する
```

### after
```markdown
## Step 12: 動作検証・ユーザー確認

### 成果物
fs-change-phase2-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・変更した機能が正しく動作することを動作確認する。本スキルディレクトリの `change-verification-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを起動して動作確認試験を実行させる。サブエージェントの出力を"動作確認サブエージェントの出力(Step12):"として記載する。サブエージェントが {changes_dir}/verification-report.md を出力したことを確認する
　動作確認方法(Step12):（サブエージェント実行 / ユーザーに依頼）
　動作確認手順(Step12):（実行した試験内容の要約）
　動作確認結果(Step12):（OK: 全試験項目パス / NG: 問題あり）
　動作確認サブエージェントの出力(Step12):
・動作確認結果が OK の場合、ユーザーに変更内容と確認結果を報告し、ユーザーからの承認を得る
　ユーザー承認結果(Step12):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step12):

> ⚠️ **動作確認の定義（build/テスト通過だけでは不可）:**
> 「動作確認」とは、**実際にアプリケーションを動作させ、受入基準（AC-xxx）に基づく受入判定試験と対処内容に基づく動作試験を実行する**ことを意味する。build が通る・単体テストが通るだけでは動作確認とみなさない。
>
> **FSの責務:**
> FSの責務は「プロンプトテンプレート準備（プレースホルダー埋込）→ サブエージェント起動 → 結果受領 → verification-report.md 存在確認」に限定される。FS自身が直接試験を実行してはならない。
>
> **確認の優先順位（サブエージェントに委譲）:**
> 1. **サブエージェントが自分で動作確認する（必須）:** アプリケーションを起動し、受入基準に基づく試験を実行する
> 2. **Web アプリの場合は Playwright MCP を使って必ずブラウザ操作で確認する:** 画面遷移・ボタン操作・表示内容を実際に検証する
> 3. **どうしても自分で確認できない場合のみ:** ユーザーに動作確認を依頼し、ユーザーから「確認OK」の回答を得てから完了とする
>
> 自分で確認できない場合の例: 物理デバイスが必要、外部サービスとの連携が必要、特定の権限が必要 等
>
> **ローカル/試験環境での実行制約:**
> 動作確認はローカル環境または試験環境で実行し、運用中のシステムに影響を与えてはならない。

### 完了条件
fs-change-phase2-report.txtに、動作確認結果(Step12)が「OK」であり、ユーザー承認結果(Step12)が「承認」であり、{changes_dir}/verification-report.md が存在すること

### 状態判定
- 動作確認結果(Step12)が「OK」かつユーザー承認結果(Step12)が「承認」の場合 → Step13 へ遷移する
- 動作確認結果(Step12)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step10（タスク実装ループ）へ差し戻し、追加修正タスクを delta-task-list.md に追記してから再実装する
　- 設計の問題（差分設計自体に問題）→ Step2（差分設計の作成）へ差し戻す
- ユーザー承認結果(Step12)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step12)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
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
| delta-design.md | {changes_dir}/delta-design.md | before→after形式の差分設計書（規模が大きい場合は索引+分割ファイル構成） |
| delta-design-{name}.md | {changes_dir}/delta-design-{name}.md | 大規模時のみ。delta-design.md から参照される分割ファイル（クラス名/テーマ名でファイル分割。ユーザー提示・承認の対象） |
| impact-analysis.md | {changes_dir}/impact-analysis.md | 設計内容ベースの精密な影響範囲分析（更新版） |
| delta-task-list.md | {changes_dir}/delta-task-list.md | 差分タスクリスト |
| impl-process-checklist.md | {changes_dir}/impl-process-checklist.md | 工程チェック表 |
| 実装コード | src/ 配下 | delta-task-list.md に基づく変更実装 |
| テストコード | tests/ 配下 | 各タスクに対応するテスト |
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |
| fs-change-phase2-report.txt | .aide/tmp/fs-change-phase2-report.txt | fs-change-phase2-implの実行レポート |
```

### after
```markdown
# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| delta-design.md | {changes_dir}/delta-design.md | before→after形式の差分設計書（規模が大きい場合は索引+分割ファイル構成） |
| delta-design-{name}.md | {changes_dir}/delta-design-{name}.md | 大規模時のみ。delta-design.md から参照される分割ファイル（クラス名/テーマ名でファイル分割。ユーザー提示・承認の対象） |
| impact-analysis.md | {changes_dir}/impact-analysis.md | 設計内容ベースの精密な影響範囲分析（更新版） |
| delta-task-list.md | {changes_dir}/delta-task-list.md | 差分タスクリスト |
| impl-process-checklist.md | {changes_dir}/impl-process-checklist.md | 工程チェック表 |
| 実装コード | src/ 配下 | delta-task-list.md に基づく変更実装 |
| テストコード | tests/ 配下 | 各タスクに対応するテスト |
| verification-report.md | {changes_dir}/verification-report.md | 動作確認試験書（サブエージェントが出力） |
| history.md | {changes_dir}/history.md | 変更履歴（doc-sync経由で初期作成） |
| fs-change-phase2-report.txt | .aide/tmp/fs-change-phase2-report.txt | fs-change-phase2-implの実行レポート |
```

---

## 変更箇所 3: Integration セクションへのプロンプトテンプレート追加

### 変更理由
新規作成するプロンプトテンプレートをIntegrationセクションのプロンプトテンプレート一覧に追加する必要がある。

### before
```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `change-doc-syncer-prompt.md` — Step 13
```

### after
```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `change-delta-designer-prompt.md` — Step 2（mode: phase4 / fix）、Step 5（fix）
- `change-impact-reviewer-prompt.md` — Step 6
- `change-task-planner-prompt.md` — Step 8
- `change-verification-prompt.md` — Step 12（動作確認サブエージェント委譲）
- `change-doc-syncer-prompt.md` — Step 13
```
