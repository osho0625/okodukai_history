# 変更履歴: compliance-sig-ambiguous-spec

## 不具合修正（2026-05-26）— PI-001
- 日付: 2026-05-26
- バグ概要: phase-compliance-check スキルの verify モードで署名対象文字列の第4引数が曖昧
- 原因: スキルに「成果物一覧のSHA256」と書いてあるが、実際のスクリプトは artifact-hash で二重ハッシュした値を使用
- 修正概要: verify-phase / sign-phase サブコマンドを新設し、手動構築を禁止
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
- コミット: 88e12df

## 不具合修正（2026-05-27）— PI-005
- 日付: 2026-05-27
- バグ概要: compliance-checker サブエージェントが write モードで Get-FileHash を自前実行する
- 原因: エージェント定義に sign-phase 一発で完結する旨の明確な記述が不足
- 修正概要: Iron Law・禁止事項・write モード実行フロー全体像を agents/compliance-checker.md に追記
- 関連ドキュメント: bug-report-pi005.md

## 不具合修正（2026-05-27）— PI-008
- 日付: 2026-05-27
- バグ概要: verify-phase の正規表現が成果物テーブルのハッシュを抽出できない
- 原因: フェーズセクション抽出が `### フェーズN:` で始めていたため成果物サブセクションで切れる + ハッシュ抽出が2列テーブル前提
- 修正概要: セクション抽出を `## フェーズN:` 〜 `PHASE-SIG` に変更、ハッシュ抽出を行末64文字hex方式に変更（PowerShell版 + bash版）
- 関連ドキュメント: bug-report-pi008.md, bug-analysis-pi008.md, fix-plan-pi008.md

## 不具合修正（2026-05-27）— PI-009
- 日付: 2026-05-27
- バグ概要: compliance-checker エージェント定義が hash-files（二重ハッシュ）をテーブル記入値として指示していた
- 原因: PI-005 修正時に hash-files のコードを読まずに「file_sha256 を返す」と思い込んで記載
- 修正概要: テーブル記入値の取得方法を「hash-files」→「Get-FileHash / sha256sum」に修正。禁止事項を明確化
- レビュー観点: sign↔verify対称性、ps1↔sh同一性、エージェント定義整合性、往復テスト — 全PASS
- 関連ドキュメント: review-criteria-pi009.md
