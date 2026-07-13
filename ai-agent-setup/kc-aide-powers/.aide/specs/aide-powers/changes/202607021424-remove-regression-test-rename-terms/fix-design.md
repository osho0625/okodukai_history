# バグ修正差分設計

## 作成日
2026-07-06

## 対象バグ
micro-impl-agent（実装専任エージェント）が、実装以外の目的（リグレッションテスト実行）で呼び出されている。regression-test-prompt.md 4ファイルに不正な委譲先指定があり、その呼び出し元である SKILL.md 4ファイルの Integration 節（および fs-refactoring-phase5-impl のStep本文）にも同様の具体名指定が存在する。

## 対策種別
根本対策（fix-plan.md より引き継ぎ）

## 設計方針
- regression-test-prompt.md 4ファイルは、他のプロンプトテンプレート（bugfix-reporter-prompt.md, bugfix-analyzer-prompt.md 等）と同一の構造パターン（「委譲先エージェント」セクションを持たず、ファイル全体がそのままサブエージェントへのプロンプトとして成り立つ）に統一する
- SKILL.md 4ファイルは、Integration節の見出しを「呼び出す名前付きエージェント」から「呼び出すサブエージェント」に変更し、委譲先エージェント名を固定しない旨を明記する記述に統一する。この新しい記述パターンは4ファイルで完全に統一する
- プロンプト本文（テスト実行指示の内容そのもの）は一切変更しない。変更するのは「委譲先を固定する記述」の削除・言い換えのみに限定する
- fs-refactoring-phase5-impl のStep2本文中の `micro-impl-agent` 直接記述は、他3ファイルのStep本文と同様の「サブエージェントを起動し」という汎用表現に統一する
- 変数プレースホルダー記法（`{{feature_name}}` 等の二重波括弧）自体の変更はスコープ外とし、既存表記のまま残す（fix-plan.md の修正内容に記法統一の指示がないため。既存設計書の直接変更にも該当しない）

## 修正対象の差分設計

### 変更対象1: skills/fs-bugfix-phase2-impl/regression-test-prompt.md

#### before
ファイル全体が以下の構造を持つ:
- 冒頭見出し「# リグレッションテスト実行エージェント（バグ修正WF用）」+ 説明文
- 「## 委譲先エージェント」セクション（`` `micro-impl-agent (aide-powers agent)` `` の1行のみ）
- 「## プレースホルダー（FSが実データで置き替える）」セクション（`{{feature_name}}` 等3変数の宣言）
- 「## 実行内容」セクション。冒頭に「`` `micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する: ``」という一文があり、続くコードブロック（```` ``` ````）内に「### タスク情報」〜「## 報告フォーマット」までのプロンプト本文が格納されている
- 「## 出力」セクション

#### after
- 冒頭見出しと説明文はそのまま残す
- 「## 委譲先エージェント」セクションを削除する
- 「## プレースホルダー（FSが実データで置き替える）」セクションを削除する
- 「## 実行内容」の見出しと「`` `micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する: ``」の一文を削除する
- コードブロック（```` ``` ````）を外し、内部の「### タスク情報」〜「## 報告フォーマット」をファイルのトップレベル構造にそのまま引き上げる（見出しレベル・内容は変更しない）
- 「## 出力」セクションはそのまま残す
- 結果として、ファイル全体が「説明文 → ### タスク情報 → ### 実行モード → ### テスト実行コマンド（必須） → ### 開発環境情報 → ## テスト実行ルール → ## 報告フォーマット → ## 出力」という、他のプロンプトテンプレートと同型の一続きの構造になる

#### 変更理由
bug-analysis.md の原因1（micro-impl-agent の責務外利用）に対応する「委譲先エージェント」宣言、および原因2（プロンプトテンプレートの構造不整合）に対応する「委譲先エージェント」「プレースホルダー」独自セクション・コードブロック入れ子構造を除去し、他の全プロンプトテンプレートと同一の「ファイル全体がそのままサブエージェント向けプロンプトとして成り立つ」構造に揃える。

---

### 変更対象2: skills/fs-change-phase2-impl/regression-test-prompt.md

#### before
変更対象1と同一構造（見出しが「# リグレッションテスト実行エージェント（変更WF用）」、`{{changes_dir}}` を含む3変数のプレースホルダー宣言、実行内容セクション内に「呼び出し元ワークフロー: 変更WF（fs-change-phase2-impl Step11）」を含むプロンプト本文がコードブロックで格納）。

#### after
変更対象1と同一の変更を適用する（「## 委譲先エージェント」「## プレースホルダー」削除、コードブロック解放、「## 出力」は残す）。プロンプト本文の内容（`{{changes_dir}}` 等の変数含む）は一切変更しない。

#### 変更理由
変更対象1と同一（他プロンプトテンプレートとの構造統一、micro-impl-agent 責務外利用の解消）。

---

### 変更対象3: skills/fs-impl-phase4-execution/regression-test-prompt.md

#### before
変更対象1と同一構造（見出しが「# リグレッションテスト実行エージェント（実装WF用）」、`{{spec_dir}}` を含む3変数のプレースホルダー宣言、実行内容セクション内に「呼び出し元ワークフロー: 実装WF（fs-impl-phase4-execution Step2）」を含むプロンプト本文がコードブロックで格納）。

#### after
変更対象1と同一の変更を適用する。

#### 変更理由
変更対象1と同一。

---

### 変更対象4: skills/fs-refactoring-phase5-impl/regression-test-prompt.md

#### before
変更対象1と同様の構造だが、以下の点で他3ファイルと異なる:
- 説明文に「フェーズ1（fs-refactoring-phase1-status）で記録した開始前基準（セーフティネットベースライン）との比較結果を報告する」旨の追加記述がある
- プレースホルダー宣言に `{{safety_net_baseline}}`（開始前のセーフティネット基準）が追加されている（計4変数）
- 実行内容のプロンプト本文に「### 開始前基準（比較対象）」セクションと、テスト実行ルール内に基準比較の判定ロジック（完全一致／FAIL数増加／スキップ数変化）が含まれる
- 「## 出力」セクションに「開始前基準との比較結果」の項目が追加されている

#### after
- 「## 委譲先エージェント」「## プレースホルダー（FSが実データで置き替える）」セクションを削除する
- 「## 実行内容」見出しと「`` `micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する: ``」の一文を削除する
- コードブロックを外し、「### タスク情報」〜「## 報告フォーマット」（開始前基準比較の記述を含む）をトップレベルに引き上げる
- 「## 出力」セクション（開始前基準との比較結果の項目を含む）はそのまま残す
- 他3ファイルとの構造差異（基準比較ロジックの有無）は維持する。これは規模・目的の違いによる正当な差異であり、fix-plan.md の修正内容に均一化の指示はないため統一しない

#### 変更理由
変更対象1〜3と同一の原因（micro-impl-agent 責務外利用、構造不整合）に対する同一の対策。基準比較機能はリグレッションテスト実行という責務の範囲内の付加情報であり、今回の修正対象（委譲先固定・コードブロック入れ子構造）とは独立しているため、その部分の記述は変更しない。

---

### 変更対象5: skills/fs-bugfix-phase2-impl/SKILL.md（Integration節 + プロンプトテンプレート欄）

#### before（Integration節）
```
**呼び出す名前付きエージェント（Step 9 工程①）:**
- `micro-impl-agent (aide-powers agent)` — Step 9 工程①（リグレッションテスト実行。regression-test-prompt.md 経由。工程②〜④より先行）
```

#### after（Integration節）
```
**呼び出すサブエージェント（Step 9 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 9 工程①: リグレッションテスト実行。工程②〜④より先行）
```

#### before（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 9（工程①: リグレッションテスト実行専任。micro-impl-agent 用。新規。動作確認試験より先行実行）
```

#### after（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 9（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
```

#### 変更理由
fix-plan.md のスコープ拡張（2026-07-06追記）で指摘された通り、Integration節に `micro-impl-agent (aide-powers agent)` という具体名でリグレッションテスト実行（実装を伴わない作業）の委譲先を固定している記述は、regression-test-prompt.md 側の原因（micro-impl-agent の責務外利用）がそのまま呼び出し元に伝播したものである。委譲先を固定しない記述に改め、原因を完全に解消する。見出しも「名前付きエージェント」から「サブエージェント」に変更し、内容と整合させる。同じ Integration 節内のプロンプトテンプレート欄にも同種の `micro-impl-agent 用` という具体名指定が残っており、これを修正しないと「委譲先は固定しない」（呼び出す名前付きエージェント欄）と「micro-impl-agent 用」（プロンプトテンプレート欄）が数行違いで併存する内部矛盾が生じる。そのため同じ趣旨でプロンプトテンプレート欄の記述も「汎用のサブエージェント用」に置き換える。

---

### 変更対象6: skills/fs-change-phase2-impl/SKILL.md（Integration節 + プロンプトテンプレート欄）

#### before（Integration節）
```
**呼び出す名前付きエージェント（Step 11 工程①）:**
- `micro-impl-agent (aide-powers agent)` — Step 11 工程①（リグレッションテスト実行。regression-test-prompt.md 経由。工程②〜④より先行）
```

#### after（Integration節）
```
**呼び出すサブエージェント（Step 11 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 11 工程①: リグレッションテスト実行。工程②〜④より先行）
```

#### before（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 11（工程①: リグレッションテスト実行専任。micro-impl-agent 用。新規。動作確認試験より先行実行）
```

#### after（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 11（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
```

#### 変更理由
変更対象5と同一（Step番号のみ異なる）。プロンプトテンプレート欄の修正理由も変更対象5と同一（Integration節内での内部矛盾解消）。

---

### 変更対象7: skills/fs-impl-phase4-execution/SKILL.md（Integration節 + プロンプトテンプレート欄）

#### before（Integration節）
```
**呼び出す名前付きエージェント（Step 2 工程①）:**
- `micro-impl-agent (aide-powers agent)` — Step 2 工程①（リグレッションテスト実行。regression-test-prompt.md 経由。工程②〜④より先行）
```

#### after（Integration節）
```
**呼び出すサブエージェント（Step 2 工程①）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 2 工程①: リグレッションテスト実行。工程②〜④より先行）
```

#### before（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 2（工程①: リグレッションテスト実行専任。micro-impl-agent 用。新規。動作確認試験より先行実行）
```

#### after（プロンプトテンプレート欄）
```
- `regression-test-prompt.md` — Step 2（工程①: リグレッションテスト実行専任。汎用のサブエージェント用。新規。動作確認試験より先行実行）
```

#### 変更理由
変更対象5と同一（Step番号のみ異なる）。プロンプトテンプレート欄の修正理由も変更対象5と同一（Integration節内での内部矛盾解消）。

---

### 変更対象8: skills/fs-refactoring-phase5-impl/SKILL.md（Integration節 + サブエージェントプロンプト欄 + Step2本文）

#### before（Integration節）
```
**呼び出す名前付きエージェント（Step 2）:**
- `micro-impl-agent (aide-powers agent)` — Step 2（リグレッションテスト実行。regression-test-prompt.md 経由）
```

#### before（サブエージェントプロンプト欄）
```
- `regression-test-prompt.md` — Step 2 専任（工程番号なし・単独の呼び出し。micro-impl-agent 用。新規。phase1-statusのセーフティネット基準との比較報告を含む）
```

#### before（Step2本文）
```
本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとして `micro-impl-agent` を起動し、既存テスト全実行（リグレッションテスト）を実際に実行させ、フェーズ1（fs-refactoring-phase1-status）で記録した開始前基準（セーフティネットベースライン）との比較結果を確認・報告させる。
```

#### after（Integration節）
```
**呼び出すサブエージェント（Step 2）:**
- 委譲先は具体的なエージェント名で固定しない。regression-test-prompt.md の内容（プレースホルダー置換済み）をそのままプロンプトとしてサブエージェントに渡し、プラットフォームのツールマップに従って汎用のサブエージェントを起動する（Step 2: リグレッションテスト実行。開始前基準〔セーフティネットベースライン〕との比較報告を含む）
```

#### after（サブエージェントプロンプト欄）
```
- `regression-test-prompt.md` — Step 2 専任（工程番号なし・単独の呼び出し。汎用のサブエージェント用。新規。phase1-statusのセーフティネット基準との比較報告を含む）
```

#### after（Step2本文）
```
本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとしてサブエージェントを起動し、既存テスト全実行（リグレッションテスト）を実際に実行させ、フェーズ1（fs-refactoring-phase1-status）で記録した開始前基準（セーフティネットベースライン）との比較結果を確認・報告させる。
```

#### 変更理由
Integration節の修正理由は変更対象5と同一。fs-refactoring-phase5-impl は見出しが「プロンプトテンプレート」ではなく「サブエージェントプロンプト」であるが、同一節内に「呼び出す名前付きエージェント」欄と `micro-impl-agent 用` という具体名指定が数行違いで併存している点は他3ファイルと同じ内部矛盾であり、同じ趣旨で「汎用のサブエージェント用」に置き換える。加えて fix-plan.md が明記する通り、fs-refactoring-phase5-impl は他3ファイルと異なり Step本文（動作確認Stepの工程に相当する箇所）にも `micro-impl-agent` という具体名を直接含んでいる（他3ファイルのStep本文は既に「サブエージェントを起動し」という汎用表現になっており修正不要）。この箇所も他3ファイルのStep本文と揺れのない同一の汎用表現「サブエージェントを起動し」に修正し、原因（micro-impl-agent の責務外指定）を本文レベルでも完全に取り除く。それ以外の文言（開始前基準との比較報告等）は変更しない。

## 新規追加の設計
該当なし（Markdownスキル定義ファイルの構造修正のみ）

## リグレッションテスト設計

### 追加テストケース
なし（自動テスト対象外。Markdownのスキル定義ファイルに対する自動テストは存在しない）

### 既存テストへの影響
既存テストへの影響なし。品質担保は以下の方法で行う（fix-plan.md「品質担保方法」を引き継ぎ）:
- 修正後のファイルが他のプロンプトテンプレート（bugfix-reporter-prompt.md等）と同一の構造パターンに従っていることをレビューで確認する
- プロンプト本文（テスト実行指示の内容）が修正前後で変わっていないことをdiffで確認する
- SKILL.md側の修正について、修正前後でIntegration節・Step本文の他の記述（工程②〜④、coding-test-2review経由部分等）が変更されていないことをdiffで確認する
- 4ファイルのSKILL.md間で修正後の記述パターン（「呼び出すサブエージェント」見出し + 委譲先固定なしの説明文）が統一されていることを確認する
- fs-refactoring-phase5-impl の Step2本文の修正が、他3ファイルのStep本文の「サブエージェントを起動し」という表現と揺れなく一致していることを確認する

## インターフェース影響サマリ
シグネチャ変更なし（Markdownスキル定義ファイルの構造修正のみ）

## 更新が必要な設計資料

### 本修正で直接編集する8ファイル（本修正の対象ファイル自身）
以下8項目は本修正の変更対象1〜8そのものであり、更新タイミングはいずれも実装タスク（Step8 タスク実装ループ）での直接編集である。

- skills/fs-change-phase2-impl/regression-test-prompt.md: 「委譲先エージェント」セクション削除 + 「実行内容」セクションの構造変更（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-bugfix-phase2-impl/regression-test-prompt.md: 同上（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-impl-phase4-execution/regression-test-prompt.md: 同上（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-refactoring-phase5-impl/regression-test-prompt.md: 同上（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-bugfix-phase2-impl/SKILL.md: Integration節「呼び出す名前付きエージェント（Step 9 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更 + 同節内「プロンプトテンプレート」欄の `micro-impl-agent 用` 具体名指定を「汎用のサブエージェント用」に変更（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-change-phase2-impl/SKILL.md: Integration節「呼び出す名前付きエージェント（Step 11 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更 + 同節内「プロンプトテンプレート」欄の `micro-impl-agent 用` 具体名指定を「汎用のサブエージェント用」に変更（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-impl-phase4-execution/SKILL.md: Integration節「呼び出す名前付きエージェント（Step 2 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更 + 同節内「プロンプトテンプレート」欄の `micro-impl-agent 用` 具体名指定を「汎用のサブエージェント用」に変更（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）
- skills/fs-refactoring-phase5-impl/SKILL.md: Integration節「呼び出す名前付きエージェント（Step 2）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更 + 同節内「サブエージェントプロンプト」欄の `micro-impl-agent 用` 具体名指定を「汎用のサブエージェント用」に変更 + Step本文中の `micro-impl-agent` 直接記述を「サブエージェント」という汎用表現に変更（更新タイミング: 実装タスク〔Step8タスク実装ループ〕で直接編集）

### 本修正の影響を受ける既存の正式設計書（本修正の対象外・実装後の反映が必要）

#### .aide/specs/aide-powers/program-structure.md

doc-index.md登録済み・✅完了の正式設計書。fs-impl-phase4-execution / fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase5-impl の各説明ブロックの「呼び出しエージェント」行に `micro-impl-agent（StepX リグレッションテスト実行、regression-test-prompt.md 経由）` という具体名指定が残っており、本修正でSKILL.md 4ファイルのIntegration節が「委譲先を固定しない」記述に変わると実態と矛盾する。以下のbefore→afterに従い、更新タイミング: バグ修正WFのStep10「設計書反映」（doc-sync）で更新する。

##### ①fs-impl-phase4-execution節（program-structure.md 2325行付近）

###### before
```
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, micro-impl-agent（Step2 リグレッションテスト実行、regression-test-prompt.md 経由）
```

###### after
```
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, 汎用のサブエージェント（Step2 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
```

##### ②fs-change-phase2-impl節（program-structure.md 2414行付近）

###### before
```
- 呼び出しエージェント: manual-test-review-agent（Step11 工程②）, micro-impl-agent（Step11 リグレッションテスト実行、regression-test-prompt.md 経由）
```

###### after
```
- 呼び出しエージェント: manual-test-review-agent（Step11 工程②）, 汎用のサブエージェント（Step11 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
```

##### ③fs-bugfix-phase2-impl節（program-structure.md 2440行付近）

###### before
```
- 呼び出しエージェント: manual-test-review-agent（Step9 工程②）, micro-impl-agent（Step9 リグレッションテスト実行、regression-test-prompt.md 経由）
```

###### after
```
- 呼び出しエージェント: manual-test-review-agent（Step9 工程②）, 汎用のサブエージェント（Step9 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
```

##### ④fs-refactoring-phase5-impl節（program-structure.md 2487行付近）

###### before
```
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, micro-impl-agent（Step2 リグレッションテスト実行、regression-test-prompt.md 経由）
```

###### after
```
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, 汎用のサブエージェント（Step2 工程①: リグレッションテスト実行。regression-test-prompt.md 経由。委譲先エージェント名は固定しない）
```

##### ⑤fs-impl-phase4-execution節「プロンプトテンプレート」列（program-structure.md 2326行付近）

###### before
```
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `impl-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
```

###### after
```
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `impl-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
```

##### ⑥fs-change-phase2-impl節「プロンプトテンプレート」列（program-structure.md 2415行付近）

###### before
```
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `regression-test-prompt.md`（Step11 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `change-verification-prompt.md`（Step11 工程②: 試験書作成モード / 工程④: 試験実行モード）, `change-doc-syncer-prompt.md`（Step12）
```

###### after
```
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `regression-test-prompt.md`（Step11 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `change-verification-prompt.md`（Step11 工程②: 試験書作成モード / 工程④: 試験実行モード）, `change-doc-syncer-prompt.md`（Step12）
```

##### ⑦fs-bugfix-phase2-impl節「プロンプトテンプレート」列（program-structure.md 2441行付近）

###### before
```
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `regression-test-prompt.md`（Step9 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `bugfix-verification-prompt.md`（Step9 工程②: 試験書作成モード / 工程④: 試験実行モード）, `bugfix-doc-syncer-prompt.md`（Step10）
```

###### after
```
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `regression-test-prompt.md`（Step9 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規）, `bugfix-verification-prompt.md`（Step9 工程②: 試験書作成モード / 工程④: 試験実行モード）, `bugfix-doc-syncer-prompt.md`（Step10）
```

##### ⑧fs-refactoring-phase5-impl節「プロンプトテンプレート」列（program-structure.md 2488行付近）

###### before
```
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規。phase1-statusのセーフティネット基準記録との比較結果を報告）, `refactoring-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
```

###### after
```
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、汎用のサブエージェント用、新規。phase1-statusのセーフティネット基準記録との比較結果を報告）, `refactoring-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
```

##### 修正理由
本修正でSKILL.md 4ファイルのIntegration節見出しが「呼び出す名前付きエージェント」から「呼び出すサブエージェント」に変わり、委譲先を固定しない記述に統一される（変更対象5〜8参照）。program-structure.mdの「呼び出しエージェント」欄（①〜④）も同じ趣旨に合わせ、`micro-impl-agent` の具体名を「汎用のサブエージェント」という表現に置き換える。加えて、同じ4節内の「プロンプトテンプレート」欄（⑤〜⑧）にも `micro-impl-agent用` という同種の具体名指定が残っており、①〜④のみを修正すると「委譲先エージェント名は固定しない」（呼び出しエージェント欄）と「micro-impl-agent用」（プロンプトテンプレート欄）が同一節内で数行違いに併存する内部矛盾が生じる。そのため⑤〜⑧のプロンプトテンプレート欄も「汎用のサブエージェント用」に置き換え、両欄の記述を統一する。ただしprogram-structure.mdは本修正の対象ファイルではないため、実装タスクでは直接編集しない。実装完了後のバグ修正WF Step10「設計書反映」（doc-sync）で、修正後のSKILL.md 4ファイルの実態に合わせて本ファイルを更新する。
