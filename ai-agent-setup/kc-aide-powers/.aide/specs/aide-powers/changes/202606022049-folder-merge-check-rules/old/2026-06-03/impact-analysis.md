# 影響範囲分析

> 本書は差分設計（QA APPROVED 済み）の確定内容を反映した再精査完了版である。Phase 1 の軽量版に対し、差分設計で確定した3つの変更箇所（Red Flags 1行追加 / Step 4 移動ルール b の判定分岐構造への拡張 / 完了条件 #2 の文言整合）を反映している。

## 変更種別
変更（既存スキル定義ドキュメント `skills/folder-merge-check/SKILL.md` 1ファイルへの内部ルール追記・更新のみ。プログラムコードのシグネチャ変更なし。外部インターフェース不変）

## アクター視点の影響

### 影響を受けるユースケース
- UC-フォルダ統合判定: AI Agent が folder-merge-check を実行してドキュメントフォルダを統合する場面 — Red Flags に新たな STOP 条件（WF種別差による統合拒否）が追加されることで、WF種別差を理由とした誤った統合拒否が抑制される（変更箇所1 / REQ-C-001）
- UC-異種WF統合: 異なるWF種別（changes↔bugfix↔refactoring）のフォルダを統合する場面 — Step 4 移動ルール b が判定分岐構造に拡張され、同名衝突時のファイル扱いが「(a) 恒久的設計資産 → 追記・更新」「(b) その時用の設計資料＋進捗ファイル → old/{日付}/ 退避」の2分類で統一される。これにより進捗ファイル衝突（REQ-C-002）およびその時用設計資料の同名上書き事故（REQ-C-003）が防止される（変更箇所2）
- UC-統合完了判定: folder-merge-check の完了条件チェック — 完了条件 #2 が移動ルール b の判定分岐（(a) 追記・更新 / (b) old/{日付}/ 退避）に整合する文言へ更新され、(b) のファイルが退避で解決されたケースも完了条件が正しく包含する（変更箇所3 / FAIL-1）

### 影響を受けるアクター
- AI Agent（オーケストレータ / サブエージェント）— folder-merge-check スキルの指示に従ってフォルダ統合を実行する際、新ルール（WF種別差の Red Flag、判定分岐による (a)/(b) 分類、old/{日付}/ 退避、更新後の完了条件）に従う必要がある
- フレームワークオーナー（ユーザー）— 影響なし（統合可否の承認フロー＝The Iron Law は変更されない。本変更はスキル内部の判定・移動ルールの追記更新に限定）

## プログラム構成視点の影響

### 変更対象ファイル
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/folder-merge-check/SKILL.md` | 変更（追記・更新） | (1) Red Flags テーブルに1行追加（変更箇所1 / REQ-C-001: WF種別差を理由とした統合拒否を STOP 対象に追加）。(2) Step 4 移動ルール b を判定分岐構造に拡張（変更箇所2 / REQ-C-002・003: 同名衝突時に判定基準で (a) 恒久的設計資産=追記・更新／(b) その時用の設計資料＋進捗ファイル=old/{日付}/退避 へ分岐。既存の単純追記挙動は (a) ルートとして保持。`{日付}` は history.md 記載の日付を使用）。(3) 完了条件 #2 の文言を判定分岐構造に整合（変更箇所3 / FAIL-1） |

本変更の実装対象は上記1ファイルのみ。差分設計の3つの変更箇所はすべて同一ファイル内で完結する。

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `skills/fs-change-phase1-analysis/SKILL.md` | Step 6 で folder-merge-check を activate して呼び出す（参照2箇所を確認） | 低（呼び出しインターフェース変更なし。入力・出力パラメータ不変） |
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | Step 7 で folder-merge-check を activate して呼び出す（参照2箇所を確認） | 低（同上） |
| `skills/fs-refactoring-phase2-candidates/SKILL.md` | Step 4 で folder-merge-check を activate して呼び出す（参照7箇所を確認） | 低（同上） |
| `docs-dev/02-ai-agent/03-common-skills/infrastructure.md` | folder-merge-check の説明セクション | 低（old/{日付}/ 退避ルールの記述追従が望ましいが、本変更のスコープ外・将来対応候補） |
| `docs-dev/02-ai-agent/02-phase-skills/change.md` | folder-merge-check の利用説明 | 低（同上） |
| `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | folder-merge-check の利用説明 | 低（同上） |
| `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | folder-merge-check の利用説明 | 低（同上） |

### シグネチャ変更の波及
- **なし。** 本変更は folder-merge-check スキルの入力パラメータ（origin_folder_path, current_dir, workflow_type, commit_hash, commit_summary）および出力パラメータ（merged, result_dir）に一切変更を加えない。追加・更新されるのはスキル内部の判定ルール（Red Flags）・移動ルール（Step 4 b）・完了条件の記述のみであるため、呼び出し元のインターフェースに影響しない。
- 呼び出し元3スキル（fs-change-phase1-analysis / fs-bugfix-phase1-analysis / fs-refactoring-phase2-candidates）が folder-merge-check を参照していることを再精査時に確認済み（それぞれ 2 / 2 / 7 箇所）。いずれも activate して同一パラメータで呼び出す形式であり、インターフェース不変のため変更不要。差分設計「インターフェース影響サマリ」とも一致する。

## 既存要件・システム要件との矛盾
- **矛盾なし。** 本プロジェクトは aide-powers フレームワーク自体のメタ開発であり、形式的な user-requirements.md / system-requirements.md は存在しないか限定的である。本変更は既存スキル（folder-merge-check）の目的「同じコード変更に起因するドキュメントを1箇所に集約しトレーサビリティを確保する」を強化する方向の追記・更新であり、既存の設計方針・運用ルールと矛盾しない。既存の Red Flag「同名ファイルがあるから統合できない」とも方向性が一致する（統合を阻む条件を狭く解釈しない）。

## テスト対象機能
- **自動テスト対象外。** 変更対象はスキル定義ドキュメント（Markdown）であり、プログラムコードではないため自動テストの対象とならない。検証は SKILL.md の記述レビュー（受入基準 AC-001-x / AC-002-x / AC-003-x、および FAIL-1 の完了条件整合の充足確認）と、ユーザーによる手動動作検証（実際のフォルダ統合シナリオでの挙動確認）で行う。

## 分析時点の注意事項（再精査完了版）
- 本分析は差分設計（QA APPROVED 済み）の確定内容を反映した**再精査完了版**である（Phase 1 の軽量版から更新済み）。
- 本変更は単一ファイル（`skills/folder-merge-check/SKILL.md`）への内部ルールの追記・更新のみで完結するため、影響範囲は極めて限定的である。
- 差分設計の3つの変更箇所（Red Flags 1行追加 / Step 4 移動ルール b の判定分岐構造への拡張 / 完了条件 #2 の文言整合）はすべて同一ファイル内で完結し、外部インターフェース・呼び出し元には波及しない。
- 呼び出し元フェーズスキル（fs-change-phase1-analysis / fs-bugfix-phase1-analysis / fs-refactoring-phase2-candidates）への変更は不要（change-requirements.md の「対象外」に明記、かつ再精査で参照のみであることを確認）。
- `docs-dev/` 配下のドキュメントへの記述追従は望ましいが、本変更のスコープ外であり将来別ワークフローで対応する候補（pending-issues として記録対象）。

## 起因元ドキュメントフォルダ
- パス: `.aide/specs/aide-powers/changes/202605271000-consolidate-change-bugfix-phases/`
- コミットハッシュ: `3957099`
- コミットメッセージ1行目: `feat: 変更WF(10→3)とバグ修正WF(7→3)のフェーズ統合`
- 検証結果: 関連あり
  - 根拠: (1) コミット 3957099 が `skills/folder-merge-check/SKILL.md` を直接変更している（旧フェーズスキル名→新フェーズスキル名へのリネーム）。(2) 今回の変更要求の起因である PI-015 / PI-016 は、この統合作業に伴うバグ修正WF（202605271348-fix-final-check-missing）の実行中に folder-merge-check が呼ばれた際に発見された問題。(3) PI-027 も同フォルダでの作業中に成果物ファイルの上書き事故として顕在化した問題（同フォルダ配下 `old/` に退避した実例が存在し、本変更 REQ-C-003 のルール記述の参照元となっている）。(4) 当該フォルダには既に history.md が存在し、過去の変更・バグ修正の経緯が記録されている。
