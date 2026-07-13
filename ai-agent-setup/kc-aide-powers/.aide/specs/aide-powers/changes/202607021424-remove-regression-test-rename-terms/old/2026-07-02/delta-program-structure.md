# プログラム構成 差分設計

## 変更対象セクション一覧

1. `coding-test-2review`（共通スキル一覧）
2. `fs-impl-phase4-execution`（実装WF フェーズスキル一覧）
3. `fs-change-phase2-impl`（変更WF フェーズスキル一覧）
4. `fs-bugfix-phase2-impl`（バグ修正WF フェーズスキル一覧）
5. `fs-refactoring-phase5-impl`（リファクタリングWF フェーズスキル一覧）
6. `impl-coding-standards` / `multi-stage-code-review`（共通スキル一覧）
7. `test-review` / `impl-task-planning`（共通スキル一覧）

※ 上記以外のフォルダ構成・importルール・ファイル命名規則・配布マッピング表等は本変更の影響範囲外であり、変更しない。

---

## セクション別 before→after

### 1. coding-test-2review

**before:**
```
### coding-test-2review
- 役割: タスクリストの全タスクを実装→テスト→2段階レビューで処理するオーケストレーションスキル
- 主要機能: 最大6タスク並列実行。各タスク内で実装∥テスト実装→テスト実行→設計準拠レビュー∥コード品質レビューの工程を管理。工程チェック表(1工程=1行)で状態管理
- 呼び出し元: 実装ループを持つフェーズスキル（例: fs-change-phase2-impl Step 10）
- 追加ファイル: implementer-prompt.md（micro-impl-agent用）, spec-reviewer-prompt.md（design-review-agent用）, code-quality-reviewer-prompt.md（code-review-agent用）
```

**after:**
```
### coding-test-2review
- 役割: タスクリストの全タスクを実装→テスト→2段階レビューで処理するオーケストレーションスキル
- 主要機能: 最大6タスク並列実行。各タスク内で実装∥テスト実装→テスト実行→設計準拠レビュー∥コード品質レビューの工程を管理。工程チェック表(1工程=1行)で状態管理
- 呼び出し元: 実装ループを持つフェーズスキル（例: fs-change-phase2-impl Step 10）
- 追加ファイル: implementer-prompt.md（micro-impl-agent用）, spec-reviewer-prompt.md（design-review-agent用）, code-quality-reviewer-prompt.md（code-review-agent用）
```
（変更なし）

**変更理由:**
approach.md の変更対象一覧では `skills/coding-test-2review/SKILL.md` から bugfix_dir パラメータ・preservation check 工程・全体リグレッション実行の記述削除が指示されている。しかし program-structure.md における本スキルの記載は「役割／主要機能／呼び出し元／追加ファイル」という要約レベルの粒度であり、bugfix_dir パラメータ名・preservation check という工程名・全体リグレッションという実行内容はいずれも本書に文字として現れていない（実際の詳述はスキル本体である `skills/coding-test-2review/SKILL.md` 側にのみ存在する）。「主要機能」の「テスト実行」はタスク単位のユニットテスト実行を指す記述であり、REQ-C-001 廃止後もこの記述自体は正確であるため書き換え不要。したがって program-structure.md の記載レベルでは変更不要と判断した。呼び出し元の「fs-change-phase2-impl Step 10」もタスク実装ループの呼び出し位置であり、Step番号は変更されない（変更されるのは後続の動作確認Step側）ため、この一文も変更不要である。

---

### 2. fs-impl-phase4-execution

**before:**
```
#### fs-impl-phase4-execution
- 役割: タスクリストに基づく実装ループ（coding-test-2review経由で実装→テスト→2段階レビュー）
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作検証・ユーザー確認 → 後処理
- 成果物: 実装コード, テストコード, `impl-task-list.md`（完了更新）, `impl-process-checklist.md`（完了更新）, `verification-report.md`, `fs-impl-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, pending-issues-management
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `impl-verification-prompt.md`（Step2 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

**after:**
```
#### fs-impl-phase4-execution
- 役割: タスクリストに基づく実装ループ（coding-test-2review経由で実装→テスト→2段階レビュー）＋動作確認Stepでの動作確認試験とリグレッションテストの実施
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → 後処理
- 成果物: 実装コード, テストコード, `impl-task-list.md`（完了更新）, `impl-process-checklist.md`（完了更新）, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-impl-phase4-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review, git-commit-workflow, pending-issues-management
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, micro-impl-agent（Step2 リグレッションテスト実行、regression-test-prompt.md 経由）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `impl-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
- 特記: Step2はリグレッションテスト実行サブエージェント（regression-test-prompt.md、工程①）を動作確認試験サブエージェント（impl-verification-prompt.md、工程②〜④）より先行実行する逐次順序（並列ではない）。リグレッションテスト全パス確認後に動作確認試験へ進む
```

**変更理由:**
approach.md REQ-C-002 の実行方式に基づき、`fs-impl-phase4-execution` の Step2（動作確認Step）は、ユーザー視点の動作確認試験（既存の `impl-verification-prompt.md` 経由の動作確認試験エージェント）と、内部の自動テスト全実行によるリグレッションテスト（新規の `regression-test-prompt.md` 経由の micro-impl-agent）という異なる責務を1つのサブエージェントに混在させず、2つの独立したサブエージェント呼び出しに分離する設計に変更する。これに伴い `regression-test-prompt.md` が新規ファイルとして `skills/fs-impl-phase4-execution/` 配下に追加されるため、プロンプトテンプレート欄・呼び出しエージェント欄への追記が必要。実装ステップ（Step1のcoding-test-2reviewループ内）でのリグレッション実行はREQ-C-001により廃止されるが、program-structure.mdのStep1記載自体（「タスク実装ループ（coding-test-2review 経由）」）はリグレッションの実施箇所を明示していないため文言変更は不要。

---

### 3. fs-change-phase2-impl

**before:**
```
#### fs-change-phase2-impl
- 役割: 差分設計・QAレビュー・影響範囲再分析・タスク分解・実装ループ・doc-sync・全テスト実行を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: リグレッションテスト結果の確認・報告（セーフティネット） → Step12: 動作検証・ユーザー確認 → Step13: 設計書反映 → Step14: pending-issues 書き込み忘れチェック → Step15: 変更完了の案内 → 後処理
- 成果物: `delta-design.md`（+分割時`delta-design-{name}.md`）, `impact-analysis.md`（更新）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`, `fs-change-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step12 工程②）
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `change-doc-syncer-prompt.md`（Step13）, `change-verification-prompt.md`（Step12 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

**after:**
```
#### fs-change-phase2-impl
- 役割: 差分設計・QAレビュー・影響範囲再分析・タスク分解・実装ループ・doc-sync・動作確認Stepでの動作確認試験とリグレッションテストの実施を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → Step12: 設計書反映 → Step13: pending-issues 書き込み忘れチェック → Step14: 変更完了の案内 → 後処理
- 成果物: `delta-design.md`（+分割時`delta-design-{name}.md`）, `impact-analysis.md`（更新）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-change-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step11 工程②）, micro-impl-agent（Step11 リグレッションテスト実行、regression-test-prompt.md 経由）
- プロンプトテンプレート: `change-delta-designer-prompt.md`（Step2）, `change-impact-reviewer-prompt.md`（Step3）, `change-task-planner-prompt.md`（Step7）, `regression-test-prompt.md`（Step11 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `change-verification-prompt.md`（Step11 工程②: 試験書作成モード / 工程④: 試験実行モード）, `change-doc-syncer-prompt.md`（Step12）
- 特記: 従来Step11（リグレッションテスト結果の確認・報告）とStep12（動作検証・ユーザー確認）を1つの動作確認Step（Step11）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。以降のStepは1つずつ前倒しでリナンバリング（旧Step13→新Step12、旧Step14→新Step13、旧Step15→新Step14）
```

**変更理由:**
approach.md REQ-C-001により、Step10のcoding-test-2reviewループ内でのbugfix_dirパラメータ・preservation check記述は廃止される（呼び出し元一覧・Step10自体の記載はスキル名の列挙のみのため program-structure.md上の文言変更は不要）。REQ-C-002により、従来別々だったStep11（リグレッションテスト結果確認＝セーフティネット）とStep12（動作検証・ユーザー確認）を「動作確認Step」として1つに統合し、その内部で①既存の動作確認試験サブエージェント（change-verification-prompt.md）と②新規のリグレッションテスト実行サブエージェント（regression-test-prompt.md、micro-impl-agent用）を独立して呼び出す設計に変更する。Step統合に伴い後続Stepの番号が1つずつ前倒しになるため、`change-doc-syncer-prompt.md` の参照Step番号（Step13→Step12）も合わせて修正する。

---

### 4. fs-bugfix-phase2-impl

**before:**
```
#### fs-bugfix-phase2-impl
- 役割: 修正設計・QAレビュー・タスク分解・実装ループ・doc-sync・全テスト実行を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: リグレッションテスト結果の確認・報告（セーフティネット） → Step10: 動作検証・ユーザー確認 → Step11: 設計書反映 → Step12: pending-issues 書き込み忘れチェック → Step13: バグ修正完了の案内 → 後処理
- 成果物: `fix-design.md`（+分割時`fix-design-{name}.md`）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`, `fs-bugfix-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step10 工程②）
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `bugfix-doc-syncer-prompt.md`（Step11）, `bugfix-verification-prompt.md`（Step10 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

**after:**
```
#### fs-bugfix-phase2-impl
- 役割: 修正設計・QAレビュー・タスク分解・実装ループ・doc-sync・動作確認Stepでの動作確認試験とリグレッションテストの実施を一貫実行
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施） → Step10: 設計書反映 → Step11: pending-issues 書き込み忘れチェック → Step12: バグ修正完了の案内 → 後処理
- 成果物: `fix-design.md`（+分割時`fix-design-{name}.md`）, `delta-task-list.md`, `impl-process-checklist.md`, 実装コード, テストコード, `history.md`, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果）, `fs-bugfix-phase2-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, design-qa-dispatch, coding-test-2review, impl-task-planning, doc-sync, user-requirements-definition(delta), system-requirements-definition(delta), gui-design(delta), object-design(delta), ddd-modeling(delta), infra-interface-design(delta), program-structure-design(delta)
- 呼び出しエージェント: manual-test-review-agent（Step9 工程②）, micro-impl-agent（Step9 リグレッションテスト実行、regression-test-prompt.md 経由）
- プロンプトテンプレート: `bugfix-designer-prompt.md`（Step2）, `bugfix-task-planner-prompt.md`（Step6）, `regression-test-prompt.md`（Step9 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規）, `bugfix-verification-prompt.md`（Step9 工程②: 試験書作成モード / 工程④: 試験実行モード）, `bugfix-doc-syncer-prompt.md`（Step10）
- 特記: 従来Step9（リグレッションテスト結果の確認・報告）とStep10（動作検証・ユーザー確認）を1つの動作確認Step（Step9）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。以降のStepは1つずつ前倒しでリナンバリング（旧Step11→新Step10、旧Step12→新Step11、旧Step13→新Step12）
```

**変更理由:**
fs-change-phase2-impl と同様の理由。REQ-C-001によりStep8のcoding-test-2reviewループ内でのbugfix_dirパラメータ・preservation check記述が廃止される（呼び出し元一覧・Step8自体の記載はスキル名の列挙のみのため program-structure.md上の文言変更は不要）。REQ-C-002により、従来別々だったStep9（リグレッションテスト結果確認）とStep10（動作検証）を「動作確認Step」として1つに統合し、動作確認試験サブエージェント（bugfix-verification-prompt.md）とリグレッションテスト実行サブエージェント（regression-test-prompt.md、新規）を独立して呼び出す設計に変更する。Step統合に伴い後続Stepの番号が前倒しになるため、`bugfix-doc-syncer-prompt.md` の参照Step番号（Step11→Step10）も修正する。

---

### 5. fs-refactoring-phase5-impl

**before:**
```
#### fs-refactoring-phase5-impl
- 役割: リファクタリング実装ループ（coding-test-2review経由、セーフティネットテスト付き）
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: セーフティネット全テスト → Step3: 動作確認試験 → 後処理
- 成果物: 実装コード, テストコード, `verification-report.md`, `fs-refactoring-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- 呼び出しエージェント: manual-test-review-agent（Step3 工程②）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `refactoring-verification-prompt.md`（Step3 工程①: 試験書作成モード / 工程③: 試験実行モード）
```

**after:**
```
#### fs-refactoring-phase5-impl
- 役割: リファクタリング実装ループ（coding-test-2review経由）＋動作確認Stepでの動作確認試験とリグレッションテスト（開始前基準との比較）の実施
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: 動作確認Step（動作確認試験サブエージェント＋リグレッションテスト実行サブエージェントの2系統を実施、phase1-status記録の開始前基準との比較を含む） → 後処理
- 成果物: 実装コード, テストコード, `verification-report.md`（動作確認試験結果＋リグレッションテスト結果・開始前基準との比較結果）, `fs-refactoring-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- 呼び出しエージェント: manual-test-review-agent（Step2 工程②）, micro-impl-agent（Step2 リグレッションテスト実行、regression-test-prompt.md 経由）
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `regression-test-prompt.md`（Step2 工程①: リグレッションテスト実行専任、micro-impl-agent用、新規。phase1-statusのセーフティネット基準記録との比較結果を報告）, `refactoring-verification-prompt.md`（Step2 工程②: 試験書作成モード / 工程④: 試験実行モード）
- 特記: 従来Step2（セーフティネット全テスト）とStep3（動作確認試験）を1つの動作確認Step（Step2）に統合し、リグレッションテスト実行サブエージェント（工程①）を動作確認試験サブエージェント（工程②〜④）より先行実行する逐次順序（並列ではない）に変更。リグレッションテスト実行サブエージェントは fs-refactoring-phase1-status で記録した開始前基準（セーフティネットベースライン）との比較結果を報告する
```

**変更理由:**
approach.md REQ-C-001により、Step1のcoding-test-2reviewループ内でのbugfix_dirパラメータ・preservation check記述が廃止される（呼び出し元一覧・Step1自体の記載はスキル名の列挙のみのため program-structure.md上の文言変更は不要）。REQ-C-002により、従来別々だったStep2（セーフティネット全テスト）とStep3（動作確認試験）を「動作確認Step」として1つに統合し、動作確認試験サブエージェント（refactoring-verification-prompt.md）とリグレッションテスト実行サブエージェント（regression-test-prompt.md、新規）を独立して呼び出す設計に変更する。リファクタリングWFのリグレッションテスト実行サブエージェントは、approach.mdの指示により fs-refactoring-phase1-status で記録した開始前基準（セーフティネットベースライン）との比較結果を報告する固有の役割を持つ点が他WFと異なる。Step3が最終Stepであったため統合後は後続Stepの番号繰り上げは発生しない。

---

### 6. impl-coding-standards / multi-stage-code-review

**before:**
```
### impl-coding-standards
- 役割: micro-impl-agentが1つの実装タスクを処理する際に従うべき詳細ルール集
- 主要機能: 粒度制御（1サブタスク=1呼び出し=1ファイル=1publicメソッド）、コーディング規約、動作確認試験書の更新、5モード（implement/write_test/run_test/fix/fix_test）の報告テンプレート
- 呼び出し元: micro-impl-agent（実装時に常に参照）
- 追加ファイル: なし（SKILL.mdのみ）

### multi-stage-code-review
- 役割: 設計準拠レビュー（外を見る）と品質レビュー（中を見る）の2段階レビューパイプライン制御
- 主要機能: Stage 0（依頼内容チェック）→Stage 1a（設計準拠レビュー: design-review-agent）→Stage 1b（品質レビュー: code-review-agent）。両方PASSしない限りコードを受け入れない。非プログラム成果物は設計準拠のみ
- 呼び出し元: 実装WF/変更WF/バグ修正WF/リファクタリングWFの各実装タスク完了後
- 追加ファイル: なし（SKILL.mdのみ）
```

**after:**
```
### impl-coding-standards
- 役割: micro-impl-agentが1つの実装タスクを処理する際に従うべき詳細ルール集
- 主要機能: 粒度制御（1サブタスク=1呼び出し=1ファイル=1publicメソッド）、コーディング規約、動作確認試験書の更新、5モード（implement/write_test/run_test/fix/fix_test）の報告テンプレート
- 呼び出し元: micro-impl-agent（実装時に常に参照）
- 追加ファイル: なし（SKILL.mdのみ）

### multi-stage-code-review
- 役割: 設計準拠レビュー（外を見る）と品質レビュー（中を見る）の2段階レビューパイプライン制御
- 主要機能: Stage 0（依頼内容チェック）→Stage 1a（設計準拠レビュー: design-review-agent）→Stage 1b（品質レビュー: code-review-agent）。両方PASSしない限りコードを受け入れない。非プログラム成果物は設計準拠のみ
- 呼び出し元: 実装WF/変更WF/バグ修正WF/リファクタリングWFの各実装タスク完了後
- 追加ファイル: なし（SKILL.mdのみ）
```
（変更なし）

**変更理由:**
approach.mdでは `skills/impl-coding-standards/SKILL.md` のrun_testモードから全体リグレッション実行廃止、`skills/multi-stage-code-review/SKILL.md` の「既存テスト全実行（リグレッション確認）」記述廃止が指示されている。しかし program-structure.md の両スキルの記載は要約レベルであり、「run_testモード」は5モードの列挙名としてのみ言及、「主要機能」も「両方PASSしない限りコードを受け入れない」という審査ゲートの説明にとどまり、全体リグレッション・既存テスト全実行という実行内容そのものへの言及がない。したがって、これらのスキル本体（SKILL.md）側の詳細記述変更は本書の記載粒度には影響せず、program-structure.md の記載は変更不要と判断した。

---

### 7. test-review / impl-task-planning

**before:**
```
### test-review
- 役割: テストコードのカバレッジ（設計書テスト観点）とテスト方針準拠（命名/独立性/モック禁止/境界値/異常系）を検証
- 主要機能: テスト観点カバー率100%検証 + テスト方針準拠チェック（モックライブラリ使用禁止、正規のダミー実装をDI経由で注入する原則）。両方満たさない限り受け入れ不可
- 呼び出し元: code-review-agent（mode: test）、design-review-agent（テスト網羅性検証時）
- 追加ファイル: なし（SKILL.mdのみ）

### impl-task-planning
- 役割: 設計書を依存関係グラフとして解析し、実装タスクを2層構造で分解する
- 主要機能: 依存関係グラフ構築→トポロジカルソートで実装順序決定→2層構造（親タスク=クラス/ファイル単位、サブタスク=publicメソッド単位）でタスク生成→網羅性チェック（漏れゼロまでループ）
- 呼び出し元: fs-impl-phase2-preparation, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase5-impl
- 追加ファイル: なし（SKILL.mdのみ）
```

**after:**
```
### test-review
- 役割: テストコードのカバレッジ（設計書テスト観点）とテスト方針準拠（命名/独立性/モック禁止/境界値/異常系）を検証
- 主要機能: テスト観点カバー率100%検証 + テスト方針準拠チェック（モックライブラリ使用禁止、正規のダミー実装をDI経由で注入する原則）。両方満たさない限り受け入れ不可
- 呼び出し元: code-review-agent（mode: test）、design-review-agent（テスト網羅性検証時）
- 追加ファイル: なし（SKILL.mdのみ）

### impl-task-planning
- 役割: 設計書を依存関係グラフとして解析し、実装タスクを2層構造で分解する
- 主要機能: 依存関係グラフ構築→トポロジカルソートで実装順序決定→2層構造（親タスク=クラス/ファイル単位、サブタスク=publicメソッド単位）でタスク生成→網羅性チェック（漏れゼロまでループ）
- 呼び出し元: fs-impl-phase2-preparation, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase5-impl
- 追加ファイル: なし（SKILL.mdのみ）
```
（変更なし）

**変更理由:**
approach.mdでは `skills/test-review/SKILL.md` のworkflow_context別テスト観点テーブルから「リグレッションテスト必須」等の実装ステップ内観点の廃止、`skills/impl-task-planning/SKILL.md` のタスク分解方針から「リグレッションテスト: 変更・バグ修正WFでは必須」の記述廃止が指示されている（間接影響ファイルの廃止判断）。しかし program-structure.md における両スキルの記載は要約レベルであり、test-reviewの「主要機能」にはworkflow_context別のテスト観点テーブルの内容（リグレッションテスト必須等）が個別に記載されておらず、impl-task-planningの「主要機能」にも「リグレッションテスト」という個別のタスク種別への言及がない。したがって、これらの詳細記述の廃止はスキル本体（SKILL.md）側でのみ発生し、program-structure.md の記載粒度には影響しないため変更不要と判断した。呼び出し元一覧（fs-impl-phase2-preparation, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase5-impl）もタスク分解方針そのものではなく呼び出し関係の記載であり、リグレッションタスク廃止後も呼び出し関係自体に変更はないため変更不要。

---

## 整合性確認結果

- **object-design-*.md との整合性**: 本変更はクラス設計に影響しないため、program-structure.mdのファイル配置に新規クラス配置漏れは発生しない。
- **layered-architecture.md との整合性**: 本変更はimportルール・レイヤー間依存方向に影響しないため、program-structure.mdのimportルール記載は変更不要。
- **新規ファイル（regression-test-prompt.md × 4）の配置**: `skills/fs-impl-phase4-execution/`, `skills/fs-change-phase2-impl/`, `skills/fs-bugfix-phase2-impl/`, `skills/fs-refactoring-phase5-impl/` の各フォルダ配下に1件ずつ配置される。既存のファイル命名規則（`{役割}-{目的語/動作}-prompt.md` パターン）に合致するため、命名規則セクションの変更は不要。
- **影響範囲外の変更確認**: フォルダ構成ツリー・エージェント定義・importルール・ファイル命名規則・配布マッピング表・マルチプラットフォーム対応の仕組み等、本変更の影響範囲外のセクションは変更していない。
- **4WFのSKILL.mdへの実際の反映**: 本書はprogram-structure.mdの記載レベルでの整合性のみを扱う。各フェーズスキルSKILL.md本体への正確な反映内容（Step番号・サブエージェント呼び出し順序の確定等）は次工程のdelta-design.mdで確定し、整合性はそちらで担保される。
