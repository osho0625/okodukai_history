# バグ報告

## 報告日
2026-07-06

## バグの症状
micro-impl-agent は「実装コードとテストコードを書く」ための実装専任エージェントであるにもかかわらず、実装以外の目的（リグレッションテスト実行等）で呼び出されている箇所がスキル定義内に存在する。

## 再現手順
1. リポジトリ内の全 .md ファイルで `micro-impl-agent` を検索する
2. 各ヒット箇所について、その文脈が「実装コードを書く」「テストコードを書く」「実装コードを修正する」以外の用途であるかを判定する
3. 実装以外の用途で micro-impl-agent を呼び出している箇所が存在する

## 期待動作
micro-impl-agent は実装（implement / write_test / fix / fix_test）の用途でのみ呼び出される。それ以外の用途（テスト実行、レポート作成、検証等）では micro-impl-agent を使わない。

## 実際の動作
実装以外の目的で micro-impl-agent が指定・呼び出されている箇所がある。

## 発生頻度
恒常的（スキル定義ファイルの設計上の不具合）

## 発生環境・条件
全プラットフォーム共通（aide-powers スキル定義ファイルの問題）

## 補足情報
- 既知の該当例: regression-test-prompt.md（4WF分）で「委譲先エージェント」に micro-impl-agent が指定されている
- micro-impl-agent の正当な用途: implement / write_test / run_test（coding-test-2review の工程内） / fix / fix_test
- 修正対象の特定方法: `micro-impl-agent` の全出現箇所を調査し、正当な用途以外を洗い出す
