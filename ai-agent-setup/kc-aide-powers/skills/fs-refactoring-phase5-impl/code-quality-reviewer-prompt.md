# Code Quality Reviewer Prompt Template（リファクタリングコード品質レビュー）

code-review-agent を Task でディスパッチする際に、以下のテンプレートを使用する。

## 委譲先

`agents/code-review-agent`

---

## mode: implementation（実装コードレビュー）

```
Task (agents/code-review-agent):
  prompt: |
    You are reviewing code quality for a refactoring implementation.

    ## Review Mode
    implementation

    ## Target File
    - {src/レイヤー/ファイル名}

    ## Design Document（Raisesセクション参照用）
    - {refactoring_dir/refactoring-design.md} → Section: {該当リファクタリング項目}

    ## Reference Files（既存規約）
    - {同レイヤーの既存コードファイル}

    ## Past Bug Fix History
    - {.aide/specs/feature_name/bugfix/}（存在する場合。存在しない場合は「なし」）

    ## CRITICAL: Do Not Trust the Report
    実装者の完了報告を信用しないこと。コードを自分の目で確認すること。

    ## Review Checklist

    ### コード品質
    1. 命名規約: プロジェクトのコーディング規約に準拠しているか。既存コードのパターンを優先
    2. ファイルサイズ: 適切な範囲内か
    3. 型ヒント: 全パブリックメソッドの引数・戻り値に型ヒントがあるか
    4. docstring: 全パブリックメソッド・全クラスにdocstringがあるか
    5. SOLID原則: SRP, OCP, LSP, ISP, DIP の遵守
    6. if/elif/else網羅性: 最後の条件を else で暗黙処理していないか
    7. デッドコード: 未参照メソッド・属性・変数がないか

    ### エラーハンドリング
    1. 例外送出条件が設計書のRaisesセクションと一致するか
    2. try/exceptの適切性（bare except禁止、エラーもみ消し防止）
    3. 例外チェイン（raise X from Y）の適切性

    ### 過去不具合再発チェック
    - bugfix/ 配下の全修正が保持されているか（目視確認必須）
    - テスト結果のみでの判断禁止

    ### ダミー実装の検出（必須）
    - pass のみ、NotImplementedError、ハードコード固定値、TODO付き仮実装
    - 「仮」「暫定」「ダミー」コメント
    - 設計書ロジック未実装

    ## Judgment
    - ERROR が0件 → PASS
    - ERROR が1件以上 → FAIL

    ## Report Format
    - コード品質: PASS / FAIL（ERROR N件, WARNING N件）
    - エラーハンドリング: PASS / FAIL（ERROR N件）
    - 詳細テーブル（FAILの場合）
```

---

## mode: test（テストコードレビュー）

```
Task (agents/code-review-agent):
  prompt: |
    You are reviewing test quality for a refactoring task.

    ## Review Mode
    test

    ## Target File
    - {tests/レイヤー/test_ファイル名}

    ## CRITICAL: Do Not Trust the Report
    テスト作成者の完了報告を信用しないこと。テストコードを自分の目で確認すること。

    ## Review Checklist
    1. テスト命名規則: ファイル名・クラス名・メソッド名がプロジェクト規約に準拠しているか
    2. テスト独立性: 各テストが独立実行可能か、テスト間依存がないか
    3. モック・スタブ使用禁止: unittest.mock のimportがあれば即ERROR
    4. 境界値テスト: 境界値・直前・直後がテストされているか
    5. 異常系テスト: 例外ケースがテストされているか

    ## Judgment
    - 違反0件 → PASS
    - 1件以上 → FAIL

    ## Report Format
    - テスト方針準拠: PASS / FAIL
    - 違反詳細テーブル（FAILの場合）
```
