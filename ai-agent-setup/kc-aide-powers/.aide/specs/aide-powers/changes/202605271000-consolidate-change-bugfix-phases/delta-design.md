# 差分設計書（索引）: スクリーンショット証跡による履歴偽装検出の強化

> 本書は索引です。規模が大きいため、設計詳細は機能・ファイル単位の分割ファイルに収録しています。
> 各分割ファイルは単独で読めるよう、before / after / 変更理由を完結させています。
> 入力: change-requirements.md（REQ-C-001〜009）／ impact-analysis.md ／ approach.md ／ dev-environment.md。
> 本書は対応方針（approach.md）に従って差分設計を起こしたものであり、対応方針自体は変更していません。

## 確定事項（本設計で確定した命名・引数）

| 項目 | 確定値 | 根拠 |
|---|---|---|
| 新規スキル名 | `screenshot-capture` | approach.md の仮称を踏襲。単一責任（画面を撮る / `.err` 代替 / `.venv` 導入）を表す汎用名。既存スキル命名（`step-history-writer`・`visual-companion` 等、ケバブケースの動作説明名）と整合 |
| 新規スキル配置パス | `skills/screenshot-capture/SKILL.md` | 既存共通スキルと同じ `skills/{name}/SKILL.md` 配置。setup 系のディレクトリ一括コピーで自動配布される（impact-analysis.md） |
| step-history-writer 追加入力パラメータ名（汎用名） | `artifact_dir` | REQ-C-003/approach.md「汎用名（例: artifact_dir）」を採用。`changes_dir` 固定にしない理由は、`changes_dir` が変更/バグ修正/リファクタリングの 3 WF にしか存在せず、設計/企画/実装/逆引きには相当物がないため。全 WF が自分の成果物フォルダパスを渡せる汎用名とする |
| メタ情報の追加行ラベル | `成果物フォルダパス` | REQ-C-003 AC-003-1。日本語ラベルで既存メタ項目（スキル名・Step ID・Step タイトル）と統一 |
| フォールバック表記（artifact_dir 未指定時） | `(未指定)` | REQ-C-003 AC-003-3。空欄ではなく明示的な代替文字列とし、`changes_dir` と文字列一致しないことを保証（誤一致防止） |
| REQ-C-004 照合キーの導出方式 | compliance-checker が WF 種別で導出（`changes_dir` 相当を持つ WF は write 入力 `changes_dir` をそのまま／持たない WF は `progress_file_path`・`skill_name` から feature フォルダパス `.aide/specs/{feature_name}` を機械的に導出）。導出は compliance-checker 側で完結 | REQ-C-004 AC-004-4〜7。artifact_dir と照合キーの一致根拠を担保し、設計/実装/企画/逆引き WF の phase-compliance-check 呼び出しへの改修を不要にする（fs-* 本体改修はスコープ外と整合） |
| REQ-C-009 履歴欠落検出工程 | step-history-writer が現 Step 書き込み前に、`skill_name` から SKILL.md の Process 順序を参照して前処理・前 Step 履歴の欠落を検出し、欠落時はユーザー通知＋欠落先頭 Process からのやり直しを促す | REQ-C-009 AC-009-1〜5。final-check（compliance-checker W4-A）の早期前倒し検出。やり直し要否の最終判断はユーザー／オーケストレータに委ねる |
| REQ-C-010 クリーンアップ削除対象 glob | `session-history-*.txt` のみから `session-history-*.txt`・`session-history-*.png`・`session-history-*.err` の3拡張子へ拡張 | REQ-C-010 AC-010-1。screenshot-capture が生成する `.png`/`.err` を final-check 系7スキルで確実に清掃 |
| REQ-C-010 想定外残ファイル確認の選択肢形式 | 番号付き選択肢「1. すべて削除する / 2. 残置する / 3. その他（自由記述）」でユーザーに削除可否を確認 | REQ-C-010 AC-010-3/4。global-rules（番号付き選択肢・最後に自由記述・1回1質問・敬語）準拠。session-history 系（.txt/.png/.err）以外の残ファイルが対象 |

## 設計方針

詳細は [delta-design-overview.md](./delta-design-overview.md) を参照。要点は以下。

- **追加（OCP遵守）:** 撮影能力は step-history-writer に埋め込まず、単一責任の新規スキル `screenshot-capture` として切り出す。step-history-writer は「保存先パスを渡して activate する」だけに依存する。
- **既存変更は非破壊な観点・工程・入力の追加に限定:** step-history-writer は工程追加＋入力1個追加＋メタ1行追加／1行削除。compliance-checker は W4/W5 への観点追加と W4-D の参照元差し替え。fs-* 群は呼び出し箇所への引数追加のみ（責務・構造不変）。
- **経路A（ユーザー決定）:** 成果物フォルダパスは step-history-writer の入力パラメータ `artifact_dir` で受け取り、全 fs-* がその値を渡す。

## 新規追加の設計（索引）

| # | 対象 | 一行サマリ | 関連 REQ | 詳細ファイル |
|---|---|---|---|---|
| N-1 | `skills/screenshot-capture/SKILL.md`（新規） | 保存先パスを入力に pyautogui で画面撮影、未導入時 `.venv` 導入（グローバル非汚染）、失敗時は同名ベースの `.err` を作成（画像と `.err` は排他）。履歴ドメインを知らない単一責任の汎用部品 | REQ-C-001 | [delta-design-screenshot-capture.md](./delta-design-screenshot-capture.md) |

## 既存変更の設計（索引）

| # | 対象 | 一行サマリ | 関連 REQ | 詳細ファイル |
|---|---|---|---|---|
| C-1 | `skills/step-history-writer/SKILL.md` | 入力に `artifact_dir` 追加、履歴書き出しと同時に screenshot-capture を activate（同名・拡張子違い画像保存＋撮影時写り込み確認・撮り直し依頼）、メタ情報に成果物フォルダパス1行追加・完了日時行削除、現 Step 書き込み前に前処理・前 Step 履歴の欠落を検出し欠落先頭 Process からのやり直しを促す工程を追加 | REQ-C-002 / REQ-C-003 / REQ-C-008 / REQ-C-009 | [delta-design-step-history-writer.md](./delta-design-step-history-writer.md) |
| C-2 | `agents/compliance-checker.md` | W4 に照合キー導出（WF 種別分岐・compliance-checker 側で完結）と成果物フォルダパス絞り込みを追加、W4-D を完了日時メタ参照からファイル作成日時（FSタイムスタンプ）基準へ変更、W5 にスクショ照合観点（改ざん検出・写り込み独立検証・偽装判定・部分一致・`.err` 環境確認・撮り直ししない）追加 | REQ-C-004 / REQ-C-005 / REQ-C-008 | [delta-design-compliance-checker.md](./delta-design-compliance-checker.md) |
| C-3 | 全フェーズスキル `fs-*`（34 スキル／281 出現箇所） | step-history-writer 呼び出しに `artifact_dir` 引数を追加する設計方針・代表 before→after・WF 種別ごとの渡し値定義・対象スキル一覧 | REQ-C-007 | [delta-design-fs-star-callsites.md](./delta-design-fs-star-callsites.md) |
| C-4 | `.aide/specs/aide-powers/dev-environment.md` §1/§3/§12 | 「Python 不使用 /.py 不在 /.venv 不使用」を「一部スキルが pyautogui を補助使用・依存は `.venv` に隔離（グローバル非汚染、§13 と整合）」へ改訂 | REQ-C-006 | [delta-design-dev-environment.md](./delta-design-dev-environment.md) |
| C-5 | 全 final-check 系7スキル `fs-*-final-check`（fs-bugfix-phase3 / fs-change-phase3 / fs-design-phase11 / fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6） | 一時ファイル削除 Step の削除対象を `session-history-*.{txt,png,err}` へ拡張し、想定外残ファイルのユーザー確認削除を追加。Iron Law/完了条件の表現も整合 | REQ-C-010 | [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) |

## インターフェース影響サマリ

詳細は [delta-design-overview.md](./delta-design-overview.md) の「インターフェース影響サマリ」節を参照。要点は以下。

- **step-history-writer の入力パラメータ追加（`artifact_dir`）:** シグネチャ／呼び出し規約変更にあたる。呼び出し元 grep の結果、step-history-writer を activate する全フェーズスキルは **34 スキル・計 281 出現箇所**（final-check 系 7 スキルは呼び出しなし）。全件が `skill_name` / `step_id` / `step_title` の 3 引数のみの同一パターンで、ここに `artifact_dir` を加える。
- **compliance-checker の入力シグネチャ変更なし:** REQ-C-004 の照合キーは WF 種別で導出する。`changes_dir` 相当を持つ WF（変更/バグ修正/リファクタリング）は write モードの既存入力 `changes_dir` をそのまま使用、持たない WF（設計/実装/企画/逆引き）は compliance-checker が `progress_file_path`・`skill_name` から feature フォルダパスを機械的に導出（いずれも入力シグネチャ不変・fs-* の phase-compliance-check 呼び出しは非波及）。REQ-C-008 の W4-D 変更も内部の時刻取得元差し替えのみで入力不変。

## 更新が必要な設計資料

詳細は [delta-design-overview.md](./delta-design-overview.md) の「更新が必要な設計資料」節を参照。本設計エージェントは既存設計書を直接変更しないため、以下を申し送る。

- `.aide/specs/aide-powers/doc-index.md`: 新規スキル `screenshot-capture` の追加に伴う索引整合（標準設計書ではないが、ドキュメントインデックス維持の観点で doc-index-maintenance スキルの対象）。
- `skills/fs-*-final-check/SKILL.md`（final-check 系 7 スキル）の `.aide/tmp/` クリーンアップ範囲拡張: 本変更で `.png` / `.err` が増えるため `session-history-*.txt` のみ削除する現行 glob を拡張する件は、**REQ-C-010 として本変更スコープ内に取り込み済み**であり、差分設計 C-5 [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) で正式対応している。よって本件は「更新が必要な設計資料（外部・別途変更WFで対応）」ではなく、本変更の正式な変更対象（既存変更 C-5）である。
