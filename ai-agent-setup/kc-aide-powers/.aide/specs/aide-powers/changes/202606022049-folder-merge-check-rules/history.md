# 変更・不具合対応履歴

## 初回変更
- 日付: 2026-06-03
- 依頼内容: folder-merge-check スキルの運用中に顕在化した3つの問題（PI-015 / PI-016 / PI-027）を解消する。具体的には、(1) WF種別（changes/bugfix/refactoring）の違いを理由とした誤った統合拒否の防止（PI-015）、(2) 統合時の進捗ファイル名の衝突回避（PI-016）、(3) その時用の設計資料の同名上書き事故の防止（PI-027）。これらを `skills/folder-merge-check/SKILL.md` への3ルール追加で対応する。
- 変更概要: 差分設計に基づき `skills/folder-merge-check/SKILL.md` を3箇所更新。(1) Red Flags テーブルに「WF種別差を理由とした統合拒否は STOP」を1行追加。(2) Step 4 移動ルール b を判定分岐構造へ拡張し、同名衝突時に (a) 恒久的設計資産＝追記・更新／(b) その時用の設計資料・進捗ファイル＝`old/{日付}/` 退避 の2分類へ分岐（既存の単純追記挙動は (a) ルートとして保持）。(3) 完了条件 #2 の文言を (a)/(b) の判定分岐に整合するよう更新。
- 関連ドキュメント: change-requirements.md, delta-design.md

## 追加変更（2026-07-03）
- 日付: 2026-07-03
- 依頼内容: folder-merge-check のフォルダ統合実行時に、統合先に残存する前WF (b)分類成果物一式を自動的に old/ へ退避するルールを明文化し、progress-resume-check の ALL_COMPLETED 誤判定を防止する（PI-051対応）
- 変更概要: skills/folder-merge-check/SKILL.md の Step 4 セクションに、前WF (b)分類成果物の一括退避ルール（同名衝突の有無を問わず退避）・進捗ファイル退避必須化（完了状態確認付き）・退避→移動の順序定義を追加
- 関連ドキュメント: change-requirements.md, impact-analysis.md
