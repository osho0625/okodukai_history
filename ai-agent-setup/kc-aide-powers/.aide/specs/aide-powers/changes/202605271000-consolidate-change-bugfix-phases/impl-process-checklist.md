# 工程チェック表: スクリーンショット証跡による履歴偽装検出の強化

> 対象タスクリスト: [delta-task-list.md](./delta-task-list.md)
> 対象 REQ: REQ-C-001〜010

## このチェック表の特殊性（必読・メタ開発）

> 本件の実装対象は **Markdown のスキル定義（SKILL.md）・エージェント定義（agents/*.md）・参照ドキュメント（dev-environment.md）** であり、自動テスト対象外（メタ開発・pytest 等なし。dev-environment.md §7）。したがって全実装タスクは **非プログラム成果物タスク** として扱い、工程は「実装（編集／新規作成）→ 設計準拠レビュー → 修正・再レビュー」の簡略サイクルとする。**自動テスト工程は設けず、最後に人間が実機で行う手動検証（D-V-001）へ置換する。**
>
> - **実装（編集）:** delta-task-list.md の各タスクの「変更観点」を、delta-design の該当 before→after に完全準拠して反映する。
> - **設計準拠レビュー:** 反映内容が delta-design と一致し、既存記述と矛盾しない（スコープ厳守＝既存責務・既存ロジックを壊さない）ことを確認する。
> - **修正・再レビュー:** レビュー指摘があれば修正し再確認する。
> - **手動検証（D-V-001）:** setup.bat 再実行＋グローバル領域反映＋AIセッション再起動が前提のため **AIセッション内では実施不能**。人間（フレームワークオーナー）が実機で実施する別表とする（dev-environment.md §0/§11）。

## 工程チェック表（実装タスク・非プログラム成果物・簡略サイクル）

> ステータス凡例 — `[ ]` 未着手 / `[~]` 進行中 / `[x]` 完了 / `[-]` 該当なし。

| タスク | 対象ファイル | 種別 | 依存先 | 実装（編集） | 設計準拠レビュー | 修正/再レビュー |
|--------|-------------|------|--------|------|------------------|-----------------|
| D-001 | skills/screenshot-capture/SKILL.md | 追加 | なし | [x] | [x] | [-] |
| D-002 | skills/step-history-writer/SKILL.md | 変更 | D-001 | [x] | [x] | [-] |
| D-003 | agents/compliance-checker.md | 変更 | D-002 | [x] | [x] | [-] |
| D-004 | .aide/specs/aide-powers/dev-environment.md | 変更 | なし | [x] | [x] | [x] |
| D-FS-CHANGE | fs-change-*（2スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-BUGFIX | fs-bugfix-*（2スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-DESIGN | fs-design-*（10スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-IMPL | fs-impl-*（6スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-PLANNING | fs-planning-*（3スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-REFACTORING | fs-refactoring-*（6スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-FS-REVERSE | fs-reverse-*（5スキル） | 変更 | D-002 | [x] | [x] | [-] |
| D-005 | fs-*-final-check（7スキル） | 変更 | なし | [x] | [x] | [-] |

> 実行順序の制約: **D-001 → D-002 → {D-003, D-FS-* 全7グループ}**。**D-004 は独立（並列可）**。**D-005（final-check 系7スキルのクリーンアップ範囲拡張）も独立（並列可）**。`.png`/`.err` の生成元は D-001 だが、final-check のクリーンアップ記述追加は D-001 の完了に依存しない（D-004 と同様の独立扱い・task-orchestration で7スキルへ並列適用）。D-FS-* 7グループは相互独立（task-orchestration で並列適用）。同一ファイルを複数タスクで触らない・循環依存なし。

## D-FS-* グループ内の個別スキル工程（並列適用・サブチェック）

> 各グループは「同一パターンの機械適用」。個別スキルの編集完了を以下で追跡する（全スキルとも `artifact_dir` 引数追加のみ・フェーズ構成/Process/責務不変＝AC-007-5）。

### D-FS-CHANGE（渡す値: `{changes_dir}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-change-phase1-analysis | [x] | [x] |
| fs-change-phase2-impl | [x] | [x] |

### D-FS-BUGFIX（渡す値: `{bugfix_dir}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-bugfix-phase1-analysis | [x] | [x] |
| fs-bugfix-phase2-impl | [x] | [x] |

### D-FS-DESIGN（渡す値: `.aide/specs/{feature_name}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-design-phase1-user-req | [x] | [x] |
| fs-design-phase2-system-req | [x] | [x] |
| fs-design-phase3-dev-plan | [x] | [x] |
| fs-design-phase4-architecture | [x] | [x] |
| fs-design-phase5-gui | [x] | [x] |
| fs-design-phase6-usecase | [x] | [x] |
| fs-design-phase7-ddd | [x] | [x] |
| fs-design-phase8-object | [x] | [x] |
| fs-design-phase9-infra | [x] | [x] |
| fs-design-phase10-program | [x] | [x] |

### D-FS-IMPL（渡す値: `.aide/specs/{feature_name}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-impl-phase1-gate | [x] | [x] |
| fs-impl-phase2-preparation | [x] | [x] |
| fs-impl-phase3-gui-mockup | [x] | [x] |
| fs-impl-phase4-execution | [x] | [x] |
| fs-impl-phase5-final-check | [x] | [x] |
| fs-impl-phase6-doc-generation | [x] | [x] |

### D-FS-PLANNING（渡す値: `.aide/specs/{feature_name}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-planning-phase1-intake-and-init | [x] | [x] |
| fs-planning-phase2-explore | [x] | [x] |
| fs-planning-phase3-finalize | [x] | [x] |

### D-FS-REFACTORING（渡す値: `{refactoring_dir}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-refactoring-phase1-status | [x] | [x] |
| fs-refactoring-phase2-candidates | [x] | [x] |
| fs-refactoring-phase3-plan | [x] | [x] |
| fs-refactoring-phase4-design | [x] | [x] |
| fs-refactoring-phase5-impl | [x] | [x] |
| fs-refactoring-phase6-doc | [x] | [x] |

### D-FS-REVERSE（渡す値: `.aide/specs/{feature_name}`）
| スキル | 実装 | 設計準拠レビュー |
|--------|------|------------------|
| fs-reverse-phase1-program | [x] | [x] |
| fs-reverse-phase2-dev-env | [x] | [x] |
| fs-reverse-phase3-system-req | [x] | [x] |
| fs-reverse-phase4-user-req | [x] | [x] |
| fs-reverse-phase5-optional-phases | [x] | [x] |

## D-005（final-check 系7スキル）グループ内の個別スキル工程（並列適用・サブチェック）

> 各スキルの「### Step 2: 一時ファイルの削除」へ、改修1（glob を `.txt`/`.png`/`.err` の3拡張子へ拡張・7スキル全て）／改修2（想定外残ファイルのユーザー確認削除・7スキル全て）／改修3（Iron Law・完了条件の表現整合・fs-bugfix-phase3 と fs-change-phase3 のみ）を適用する。バリアント別（A1: 番号付き「処理:」形式／A2・A3: 一文形式）に delta-design-final-check-cleanup.md の代表 after へ準拠。**Step 1 の progress-final-checker 委譲（署名検証・進捗更新）は不変＝AC-010-5。**

### D-005（改修対象 Step: ### Step 2 一時ファイルの削除）
| スキル | バリアント | 適用改修 | 実装 | 設計準拠レビュー |
|--------|-----------|---------|------|------------------|
| fs-bugfix-phase3-final-check | A1 | 改修1/2/3 | [x] | [x] |
| fs-change-phase3-final-check | A1 | 改修1/2/3 | [x] | [x] |
| fs-design-phase11-final-check | A2 | 改修1/2 | [x] | [x] |
| fs-impl-phase7-final-check | A3 | 改修1/2 | [x] | [x] |
| fs-planning-phase4-final-check | A3 | 改修1/2 | [x] | [x] |
| fs-refactoring-phase7-final-check | A3 | 改修1/2 | [x] | [x] |
| fs-reverse-phase6-final-check | A3 | 改修1/2 | [x] | [x] |

## 各タスクの設計準拠レビュー観点（実装工程で確認）

| タスク | 設計準拠レビューで確認すること |
|--------|-------------------------------|
| D-001 | delta-design-screenshot-capture.md の after 全文に準拠（責務3点・output_path のみ・`.venv` 隔離/グローバル非汚染・画像/`.err` 排他・撮影失敗を致命的にしない）。AC-001-1〜6 充足。履歴ドメイン概念を引数に取らない単一責任が崩れていないこと |
| D-002 | 変更1〜5が delta-design-step-history-writer.md に準拠。`artifact_dir` 末尾追加・メタ「成果物フォルダパス」1行追加/「完了日時」1行削除・Step2 スクショ保存（activate 経由・自己流 pyautogui 禁止）・Step1 冒頭の履歴欠落検出。実行順「書き込み前チェック→履歴書き出し→スクショ保存」。**「会話履歴そのまま転記」セクション不変**（R-1） |
| D-003 | 変更1〜4が delta-design-compliance-checker.md に準拠。W4-0 照合キー導出（WF種別分岐）・絞り込み／W4-D を FSタイムスタンプ基準（メタ非依存）／判定原則要約行更新／W5-3 新設・完全性ルール4セクション化。**既存 W3/W4-A/B/C・W5-1/W5-2・W6/W7 不変**（R-3/R-4/R-5）。W4-C 判定ロジック不変（時刻ソース統一のみ） |
| D-004 | 変更1〜4が delta-design-dev-environment.md に準拠。現物の見出し番号（§1/§6/§12）に反映・§13 整合・§2 末尾整合確認。`.venv` 隔離/グローバル非インストールが全箇所で明記され §13 と矛盾しないこと |
| D-FS-*（全7グループ） | delta-design-fs-star-callsites.md に準拠。(X) 冒頭見出し定義 + (Y) 各 Step 呼び出し行の両方に `artifact_dir` を末尾追加。既存 skill_name/step_id/step_title 維持。WF 種別ごとの正しい値（changes_dir / bugfix_dir / refactoring_dir / `.aide/specs/{feature_name}`）。**フェーズ構成・Process 手順・責務の変更がないこと**（AC-007-5・R-7）。全34スキルへ漏れなく適用（AC-007-1/4） |
| D-005（final-check 7スキル） | delta-design-final-check-cleanup.md に準拠。改修1（Step 2 削除対象 glob を `.txt`/`.png`/`.err` の3拡張子へ拡張・7スキル全て）／改修2（session-history 系削除後に想定外残ファイルを番号付き選択肢〔1.全削除/2.残置/3.その他〕で確認削除・7スキル全て・global-rules 準拠）／改修3（Iron Law・完了条件の表現整合・fs-bugfix-phase3 と fs-change-phase3 のみ）。バリアント別（A1/A2/A3）の代表 after に一致。**既存検証フロー（Step 1 = progress-final-checker 委譲による署名検証・進捗更新）を壊さない＝検証 PASS 後の後段処理に閉じ PASS/FAIL・進捗更新を変えない（AC-010-5）**。対象7スキルへ漏れなく適用（AC-010-2）。他5スキルに Iron Law/完了条件の txt 記述がないこと（改修3 対象外）を確認 |

## 手動検証（実機・人間が実施）— D-V-001

> **【重要】AIセッション内では実施不能。** setup.bat 再実行 → グローバル領域（`~/.kiro/`）反映 → AIセッション再起動が前提（dev-environment.md §0/§11）。自動テストは作らない（§7）。「既存テストの全実行」は自動テスト不在のため適用不可・スキップ。実装フェーズで AI が担うのは上記ドキュメント整合性確認まで。

| 検証項目 | 観点 | 対応 REQ/AC | 検証実施 |
|---------|------|------------|---------|
| T-1 | screenshot-capture 画像保存 | AC-001-1 | [-] / 人間が実機で実施 |
| T-2 | `.venv` 自動導入・グローバル非汚染 | AC-001-2/§13 | [-] / 人間が実機で実施 |
| T-3 | `.err` 代替・画像/`.err` 排他 | AC-001-3/4 | [-] / 人間が実機で実施 |
| T-4 | 履歴書き出しと同時に screenshot-capture を activate | AC-002-1/2/3 | [-] / 人間が実機で実施 |
| T-5 | 撮影時の写り込み確認・撮り直し（一次保証） | AC-002-5 | [-] / 人間が実機で実施 |
| T-6 | 撮影失敗が履歴書き出しを妨げない | AC-002-4 | [-] / 人間が実機で実施 |
| T-7 | メタに「成果物フォルダパス」1行記録 | AC-003-1 | [-] / 人間が実機で実施 |
| T-8 | `(未指定)` フォールバック | AC-003-3 | [-] / 人間が実機で実施 |
| T-9 | メタから完了日時が消える | AC-008-1/2 | [-] / 人間が実機で実施 |
| T-10 | 成果物フォルダパス絞り込み | AC-004-1/2 | [-] / 人間が実機で実施 |
| T-11 | 照合キー導出（両系統） | AC-004-4/5/6 | [-] / 人間が実機で実施 |
| T-12 | 絞り込み0件で FAIL | AC-004-3 | [-] / 人間が実機で実施 |
| T-13 | W4-D FSタイムスタンプ基準・メタ非依存 | AC-008-3/4/5 | [-] / 人間が実機で実施 |
| T-14 | W5-3 スクショ照合（改ざん/写り込み/偽装/部分一致） | AC-005-1〜4 | [-] / 人間が実機で実施 |
| T-15 | W5-3-D `.err` 環境確認・撮り直ししない | AC-005-5/6 | [-] / 人間が実機で実施 |
| T-16 | 履歴欠落検出・やり直し促し | AC-009-1〜5 | [-] / 人間が実機で実施 |
| T-17 | 判定根拠は SKILL.md の Process 順序 | AC-009-4 | [-] / 人間が実機で実施 |
| T-18 | 全34 fs-* が artifact_dir を渡す | AC-007-1/2 | [-] / 人間が実機で実施 |
| T-19 | final-check 実行時に `.txt`/`.png`/`.err` の3拡張子が削除される | AC-010-1 | [-] / 人間が実機で実施 |
| T-20 | 対象7スキル全てに同一のクリーンアップ範囲拡張が漏れなく適用 | AC-010-2 | [-] / 人間が実機で実施 |
| T-21 | 想定外残ファイルの一覧提示・番号付き選択肢確認（0件なら確認しない） | AC-010-3 | [-] / 人間が実機で実施 |
| T-22 | 想定外残ファイルの削除可否がユーザー判断どおりに処理される | AC-010-4 | [-] / 人間が実機で実施 |
| T-23 | クリーンアップが検証フロー（署名検証・進捗更新）の判定結果に影響しない | AC-010-5 | [-] / 人間が実機で実施 |
| R-1 | 会話履歴そのまま転記の非退行 | K-2 | [-] / 人間が実機で実施 |
| R-2 | 既存エラー時動作の非退行 | 変更4 | [-] / 人間が実機で実施 |
| R-3 | W3/W4-A/B/C 非退行 | K-7/変更2 | [-] / 人間が実機で実施 |
| R-4 | W5-1/W5-2 非退行 | K-4/K-7 | [-] / 人間が実機で実施 |
| R-5 | W6/W7 進捗ファイル完了日時の非退行 | K-6 | [-] / 人間が実機で実施 |
| R-6 | progress-final-checker 非退行（履歴/スクショ非読込） | grep確認 | [-] / 人間が実機で実施 |
| R-7 | fs-* のフェーズ構成・Process・責務の非退行 | AC-007-5 | [-] / 人間が実機で実施 |
| R-8 | final-check 系7スキルの `.aide/tmp` クリーンアップ非退行（既存 `.txt` 削除を壊さない。REQ-C-010 は3拡張子削除＋想定外残ファイル確認削除へ拡張） | REQ-C-010 / 差分設計 C-5 / K-9 | [-] / 人間が実機で実施 |

## 完了条件

- 全実装タスク（D-001〜D-005 + D-FS-* 全7グループ・34スキル + final-check 系7スキル）の「実装」「設計準拠レビュー」が `[x]`。
- 設計準拠レビューで delta-design との不一致・既存記述との矛盾（スコープ逸脱）がないこと。
- 手動検証（D-V-001 / T-1〜23・R-1〜8）は人間が実機で実施（AIセッション内の完了対象外）。
