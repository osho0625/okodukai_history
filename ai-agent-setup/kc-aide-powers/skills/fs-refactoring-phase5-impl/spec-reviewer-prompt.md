# Spec Compliance Reviewer Prompt Template（リファクタリング設計準拠レビュー）

design-review-agent を Task でディスパッチする際に、以下のテンプレートを使用する。

## 委譲先

`agents/design-review-agent`

---

## mode: implementation（実装コードレビュー）

```
Task (agents/design-review-agent):
  prompt: |
    You are reviewing whether a refactoring implementation matches its design specification.

    ## Review Mode
    implementation

    ## Target File
    - {src/レイヤー/ファイル名}

    ## Design Document（照合元）
    - {refactoring_dir/refactoring-design.md} → Section: {該当リファクタリング項目}
    - {.aide/specs/feature_name/program-structure.md} → Section: importルール

    ## Past Bug Fix History
    - {.aide/specs/feature_name/bugfix/}（存在する場合。存在しない場合は「なし」）

    ## CRITICAL: Do Not Trust the Report
    実装者の完了報告を信用しないこと。設計書と実装コードを自分の目で照合すること。

    ## Review Checklist（設計書全項目チェック — 必須）
    設計書の該当セクションに記載されている**すべての項目**について、
    実装コードで対応されているかを1項目ずつ確認すること。
    1つでも ❌ がある場合は FAIL とする。

    ### 検証項目（優先順位順）
    0. **内部ロジック意図検証（最優先）**: メソッドの処理内容が設計書の意図を満たしているか
    1. クラス存在チェック: 設計書に定義された全クラスが存在するか
    2. メソッドシグネチャチェック: 名前・引数・型ヒント・戻り値が一致するか
    3. コンストラクタチェック: DI対象の依存が設計書通りか
    4. 処理フローチェック: バリデーション順序、例外送出条件が設計書に従っているか
    5. 不変条件チェック: 値オブジェクトのバリデーション等が設計書通りか
    5.5. **過去不具合修正の保持検証**: bugfix/ 配下の全修正履歴が保持されているか
         ※ テスト結果のみでの判断禁止。設計書とコードの目視確認で判断すること
    6. 設計書にないものの検出: 未定義のパブリックメソッド/属性が追加されていないか

    ### リファクタリング固有の検証
    - 外部から見た振る舞い（入出力・例外）が変更前と等価か
    - import関係の変更がアーキテクチャルールに違反していないか

    ### 乖離種別の判定
    差分が検出された場合、以下の二択で判定する:
    - **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
    - **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新

    ## Report Format
    - 設計準拠: PASS / FAIL（差分N件）
    - importルール: PASS / FAIL（違反N件）
    - 差分詳細テーブル（FAILの場合）
    - 乖離種別一覧（FAIL_DESIGN 該当がある場合）
```

---

## mode: test（テストコードレビュー）

```
Task (agents/design-review-agent):
  prompt: |
    You are reviewing test coverage for a refactoring task.

    ## Review Mode
    test

    ## Target File
    - {tests/レイヤー/test_ファイル名}

    ## Design Document（照合元）
    - {refactoring_dir/refactoring-design.md} → Section: {該当リファクタリング項目}（テスト観点）

    ## Implementation File（テスト対象）
    - {src/レイヤー/ファイル名}

    ## CRITICAL: Do Not Trust the Report
    テスト作成者の完了報告を信用しないこと。設計書とテストコードを自分の目で照合すること。

    ## Review Checklist
    0. 全パブリックメソッドにテストが存在するか
    1. 設計書の「テスト観点」の全ケースに対応するテストメソッドが存在するか
    2. 境界値テスト: 設計書の不変条件に対して境界値・直前・直後がテストされているか
    3. 異常系テスト: 設計書の「Raises」セクションの全例外に対するテストがあるか

    ## Report Format
    - テスト網羅性: PASS / FAIL（未カバーN件）
    - カバレッジサマリテーブル
```
