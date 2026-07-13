# Implementer Prompt Template（リファクタリング実装）

micro-impl-agent を Task でディスパッチする際に、以下のテンプレートを使用する。

## 委譲先

`agents/micro-impl-agent`

---

## mode: implement（リファクタリング実装）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are implementing a refactoring task.

    ## Task Information
    - Task number: {refactoring-design.md のタスク番号}
    - Task description: {タスクの説明文}

    ## Mode
    implement

    ## Target Files
    - Implementation file: {src/レイヤー/ファイル名}
    - Test file: {tests/レイヤー/test_ファイル名}（なし の場合もある）

    ## Design Document（読むべきファイルとセクション）
    - {refactoring_dir/refactoring-design.md} → Section: {該当リファクタリング項目}

    ## Test Cases
    {リファクタリング設計書から抽出したテストケース一覧をそのまま転記}

    ## Dependencies（実装済みファイル）
    - {既存の実装済みファイル}
    （依存がない場合は「なし」）

    ## Reference Files（既存規約）
    - {同レイヤーの既存コードファイル}（命名・エラーハンドリング・スタイルの参考）

    ## Past Bug Fix History
    - {.aide/specs/feature_name/bugfix/}（存在する場合。存在しない場合は「なし」）

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**

    ## Refactoring-Specific Rules
    - 外部振る舞いを変えないこと（公開インターフェースの入出力・例外を保持）
    - 既存コードのルール（命名、エラーハンドリング、スタイル）を優先すること
    - 設計書に定義されていないメソッドやプロパティを追加しないこと
    - 1回の呼び出しで変更するファイルは1つだけ

    ## Before You Begin
    設計書の該当セクションを必ず読んでから実装を開始すること。
    不明点があれば質問すること。推測で実装しないこと。

    ## Report Format
    - Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - What you implemented
    - Files changed
    - Self-review findings
    - Any concerns
```

---

## mode: fix（レビュー指摘修正）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are fixing review issues for a refactoring task.

    ## Task Information
    - Task number: {タスク番号}

    ## Mode
    fix

    ## Target Files
    - Implementation file: {src/レイヤー/ファイル名}

    ## Review Findings
    ### design-review-agent findings ({PASS/FAIL})
    {指摘内容をそのまま転記。PASSの場合は「指摘なし」}

    ### code-review-agent findings ({PASS/FAIL})
    {指摘内容をそのまま転記。PASSの場合は「指摘なし」}

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**

    ## Rules
    - レビュー指摘を全て対応すること
    - 指摘以外の変更は行わないこと
```

---

## mode: write_test（テスト作成）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are writing tests for a refactoring task.

    ## Task Information
    - Task number: {タスク番号}

    ## Mode
    write_test

    ## Target Files
    - Implementation file: {src/レイヤー/ファイル名}
    - Test file: {tests/レイヤー/test_ファイル名}

    ## Design Document（テスト観点の参照元）
    - {refactoring_dir/refactoring-design.md} → Section: {該当リファクタリング項目}

    ## Test Cases
    {リファクタリング設計書から抽出したテストケース一覧をそのまま転記}

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**
```

---

## mode: fix_test（テスト修正）

```
Task (agents/micro-impl-agent):
  prompt: |
    You are fixing test review issues.

    ## Task Information
    - Task number: {タスク番号}

    ## Mode
    fix_test

    ## Target Files
    - Test file: {tests/レイヤー/test_ファイル名}

    ## Review Findings
    ### design-review-agent findings ({PASS/FAIL})
    {指摘内容をそのまま転記。PASSの場合は「指摘なし」}

    ### code-review-agent findings ({PASS/FAIL})
    {指摘内容をそのまま転記。PASSの場合は「指摘なし」}

    ## Development Environment
    - Environment definition: {.aide/specs/feature_name/dev-environment.md}
    - **Read this file and follow its execution environment, commands, and development rules**
```

---

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

---

## テンプレート運用ルール

1. **必須フィールドの省略禁止**: テンプレートの全フィールドを埋めること。情報がない場合は「なし」と明記する
2. **余計な情報の追加禁止**: テンプレートに定義されていない情報は渡さない
3. **設計書セクションの絞り込み**: 設計書ファイルパスには必ず「→ Section:」で参照範囲を指定する。ファイル全体を渡さない
4. **レビュー指摘の転記**: fix / fix_test モードでは、レビューエージェントの出力をそのまま転記する。要約・省略しない
5. **開発環境情報の必須化**: 全モードで dev-environment.md のパスを含める。micro-impl-agent はこのファイルを必ず Read で読み込み、実行環境・実行コマンド・開発ルールに従うこと
