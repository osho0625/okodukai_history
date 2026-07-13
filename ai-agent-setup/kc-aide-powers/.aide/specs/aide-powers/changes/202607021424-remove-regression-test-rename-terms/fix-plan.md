# バグ修正方針

## 作成日
2026-07-06

## 対象バグ
micro-impl-agent（実装専任エージェント）が、実装以外の目的（リグレッションテスト実行）で呼び出されている。regression-test-prompt.md 4ファイルに不正な委譲先指定がある。

**スコープ拡張（2026-07-06追記）**: 上記4ファイルを呼び出す側の SKILL.md 本体（fs-bugfix-phase2-impl, fs-change-phase2-impl, fs-impl-phase4-execution, fs-refactoring-phase5-impl の4ファイル）にも、Integration節および Step本文の中に `micro-impl-agent (aide-powers agent)` という具体名でリグレッションテスト実行を委譲する記述が存在する。regression-test-prompt.md 側の修正（委譲先エージェント指定の削除）と整合させるため、呼び出し元である SKILL.md 側の記述も同時に修正する必要がある。

## 原因サマリー
regression-test-prompt.md は「サブエージェントに渡されるプロンプト」であるが、2つの設計上の問題を含む: (1) micro-impl-agent の責務外の用途で使用 (2) 他のプロンプトテンプレートにはない「委譲先エージェント」という独自セクションが存在する構造不整合。作成時に coding-test-2review の run_test パターンを誤って流用した結果。

**スコープ拡張（2026-07-06追記）**: regression-test-prompt.md 側の原因（micro-impl-agent の責務外利用）は、呼び出し元の SKILL.md 側にも同じ形で存在する。SKILL.md の Integration節（「呼び出す名前付きエージェント」セクション）と Step本文（動作確認Stepの工程①指示文）の両方で、リグレッションテスト実行（テストコマンドを実行して結果を報告するだけの作業。実装を伴わない）の委譲先として `micro-impl-agent (aide-powers agent)` という具体名が明記されている。これは regression-test-prompt.md を新規作成した際に、呼び出し元の SKILL.md 側にも同じ誤った委譲先指定をそのまま反映してしまったことが原因であり、regression-test-prompt.md 側と同一原因（micro-impl-agent の責務外利用）の伝播である。

## 修正方針

### 対策種別
根本対策

### 修正内容
regression-test-prompt.md 4ファイルを、ファイル全体がそのままサブエージェントに渡されるプロンプトとして成り立つ構造に書き換える:

1. 「## 委譲先エージェント」セクション全体を削除する
2. 「## プレースホルダー（FSが実データで置き替える）」セクションを削除する（FSがプレースホルダーを置換してから渡すため、サブエージェント向けプロンプトには不要）
3. 「## 実行内容」セクションの「`micro-impl-agent (aide-powers agent)` を以下のプロンプトで起動する:」の記述を削除する
4. コードブロック（```）で囲まれていたプロンプト本文をコードブロックから解放し、ファイルのトップレベル構造に引き上げる
5. 「## 出力」セクションはサブエージェントへの報告指示として残す
6. 冒頭の「# リグレッションテスト実行エージェント」見出しと説明文はサブエージェントへの役割指示として残す

修正後の構造: 他のプロンプトテンプレート（bugfix-reporter-prompt.md等）と同じく、ファイル全体がプレースホルダー置換後にそのままサブエージェントに渡されるプロンプトとして成り立つ。FSスキル（SKILL.md）がプレースホルダーを置換し、各プラットフォームのツールマップに従って適切なサブエージェント呼び出しを行う。

### 修正内容（SKILL.md側・2026-07-06追記）

regression-test-prompt.md 側で「委譲先エージェント」という固定指定をやめたことに合わせて、呼び出し元の SKILL.md 側でも `micro-impl-agent (aide-powers agent)` という具体的なエージェント名の指定をやめ、委譲先を固定しない汎用的な記述に変更する。委譲先を具体的なエージェント名で固定せず、FS実行時のプラットフォーム判断（ツールマップ経由の一般的なサブエージェント起動）に委ねる。

**問題箇所の指摘（方針レベル）:**

- fs-bugfix-phase2-impl / fs-change-phase2-impl / fs-impl-phase4-execution / fs-refactoring-phase5-impl の各 SKILL.md の Integration節「呼び出す名前付きエージェント」に相当する表内に、リグレッションテスト実行（工程①）の委譲先として `micro-impl-agent (aide-powers agent)` という具体名が記載されている。この項目は委譲先を固定しない記述に改める必要がある。
- fs-bugfix-phase2-impl / fs-change-phase2-impl / fs-impl-phase4-execution の3ファイルのStep本文（動作確認Stepの工程①指示文）は既に「サブエージェントを起動し」という汎用表現になっており、Step本文自体の修正は不要。Integration節のみが修正対象。
- fs-refactoring-phase5-impl のStep本文（工程①に相当する箇所）は、他3ファイルと異なり `micro-impl-agent` という具体名を直接含んでいる。この箇所も他3ファイルのStep本文と同様の、委譲先を固定しない汎用表現に修正する必要がある。

**修正の方向性:**

上記いずれの箇所も、委譲先エージェント名を具体的に固定する記述をやめ、委譲先を特定のエージェント名で固定しない汎用的な記述に変更する方針とする。見出しの文言、テーブル構造の変更方法、置換後の具体的な表現は本fix-planでは確定せず、差分設計フェーズで確定する。

**論点A・Bのヒアリング結果（2026-07-06）:**
- 論点A: 委譲先を具体的なエージェント名で固定しない方針とする。新しい名前付きエージェントは新設しない。実際にどのサブエージェント種別を使うかは各AIプラットフォームのツールマップ（general-purpose型サブエージェント等）に委ねる
- 論点B: SKILL.md側の記述変更は根本対策と判定する。micro-impl-agentという責務外指定を完全に取り除く修正であり、原因そのものの解消に含まれるため

### 修正対象ファイル
- skills/fs-change-phase2-impl/regression-test-prompt.md: 「委譲先エージェント」セクション削除 + 「実行内容」セクションの構造変更
- skills/fs-bugfix-phase2-impl/regression-test-prompt.md: 同上
- skills/fs-impl-phase4-execution/regression-test-prompt.md: 同上
- skills/fs-refactoring-phase5-impl/regression-test-prompt.md: 同上
- skills/fs-bugfix-phase2-impl/SKILL.md（2026-07-06追記）: Integration節「呼び出す名前付きエージェント（Step 9 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更
- skills/fs-change-phase2-impl/SKILL.md（2026-07-06追記）: Integration節「呼び出す名前付きエージェント（Step 11 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更
- skills/fs-impl-phase4-execution/SKILL.md（2026-07-06追記）: Integration節「呼び出す名前付きエージェント（Step 2 工程①）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更
- skills/fs-refactoring-phase5-impl/SKILL.md（2026-07-06追記）: Integration節「呼び出す名前付きエージェント（Step 2）」の `micro-impl-agent (aide-powers agent)` 具体名指定を、委譲先を固定しない記述に変更 + Step本文中の `micro-impl-agent` 直接記述を「サブエージェント」という汎用表現に変更

### 副作用のリスク
- なし。修正はプロンプトテンプレートおよびスキル定義ファイルの構造変更のみ（Markdownファイル）
- プロンプト本文（サブエージェントが受け取るテスト実行指示）の内容自体は変更しない
- FSスキル側（SKILL.md）の呼び出し方法を変更する必要があるか確認が必要（SKILL.md が「委譲先エージェント」セクションを参照している場合） → スコープ拡張により対応済み。4ファイルのSKILL.mdすべてを修正対象に含めた
- SKILL.md側の修正により、他のセクション（例: coding-test-2review経由の記述、progress-updater等の呼び出し）に影響がないことを確認する必要がある。今回の修正対象はリグレッションテスト実行（工程①）の委譲先指定のみであり、他工程（工程②〜④の動作確認試験、coding-test-2review経由の実装ループ等）の記述は変更しない

## 類似不具合の調査結果
- 他のプロンプトテンプレートに同様の「委譲先エージェント」セクションは存在しない（regression-test-prompt.md 固有の問題）
- micro-impl-agent の他の不正使用箇所は検出されなかった（正当な用途のみ）
- スコープ拡張調査（2026-07-06）: regression-test-prompt.md を呼び出す4つのSKILL.mdすべてに同種の問題（Integration節での具体名指定）が存在することを確認した。他の名前付きエージェント（design-review-agent, code-review-agent等）についても同様の誤指定がないか確認したが、これらは coding-test-2review 経由での正当な用途（設計準拠レビュー・コード品質レビュー）でのみ使用されており、問題は検出されなかった

## リグレッションテスト方針

### 追加するテスト
- なし（Markdownのスキル定義ファイルに対する自動テストは存在しない。修正の正確性はレビューで担保する）

### 既存テストでカバー済みの範囲
- N/A（自動テスト対象外）

### 品質担保方法
- 修正後のファイルが他のプロンプトテンプレート（bugfix-reporter-prompt.md等）と同一の構造パターンに従っていることをレビューで確認する
- プロンプト本文（テスト実行指示の内容）が修正前後で変わっていないことをdiffで確認する
- SKILL.md側の修正について、修正前後でIntegration節・Step本文の他の記述（工程②〜④、coding-test-2review経由部分等）が変更されていないことをdiffで確認する
- 4ファイルのSKILL.md間で修正後の記述パターンが統一されていることを確認する
