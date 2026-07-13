# バグ修正・追加対応履歴

## 初回バグ修正
- 日付: 2026-06-17
- バグ概要: apm run setup-kiro-win 実行時に setup-local.bat のエンコーディング破損（CP932 マルチバイトの第2バイト 0x7C がパイプ演算子として誤解釈）により exit code 255 で失敗する
- 原因: setup-local.bat が最初のコミットから破損状態（CP932 → UTF-8 変換で第1バイトが U+FFFD に置換、第2バイトの ASCII が残存）。147行目の「ポ」(0x7C = |) がパイプ演算子として解釈される
- 対策種別: 根本対策
- 修正方針: setup-local.bat を UTF-8 + chcp 65001 で全体再作成（setup.bat と同一方式に統一）。.gitattributes で再発防止。dev-environment.md 規約更新
- 修正概要: setup-local.bat をUTF-8で再作成（chcp 65001追加、日本語テキスト復元、ロジック変更なし）。.gitattributes新規作成（*.bat -text diff）。dev-environment.md §5.1更新
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
