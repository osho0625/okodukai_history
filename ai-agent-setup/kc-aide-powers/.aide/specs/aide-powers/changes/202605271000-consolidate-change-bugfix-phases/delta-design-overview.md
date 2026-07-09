# 差分設計: 設計方針・インターフェース影響サマリ・更新が必要な設計資料

> 本ファイルは [delta-design.md](./delta-design.md) の分割ファイル群の総論です。
> 各 REQ の before→after 詳細は機能別の分割ファイルを参照してください。

## 1. 設計方針

### 1.1 全体方針

本変更は「証跡捏造の再発防止（PI-026 の延長）」を目的とし、**テキスト履歴に加えてスクリーンショットという物証を残し、compliance-checker が両者を突き合わせて偽装を判定できるようにする**ことを中核とする。あわせて、複数の成果物フォルダの履歴が `.aide/tmp/` に混在しても今回の作業の履歴だけを検証対象にできるよう、履歴メタに成果物フォルダパスを記録して絞り込めるようにする。

approach.md の確定方針に従い、構成は以下の 4 本柱とする。

1. **新規スキル 1 つの追加（OCP遵守）** — 撮影という関心事を単一責任スキル `screenshot-capture` に閉じ込める。撮影手段（pyautogui・`.venv` 導入・`.err` 代替・将来の OS 別撮影）の変更が呼び出し側へ波及しない。
2. **中核 2 ファイルへの非破壊な観点・工程・入力の追加** — step-history-writer（スクショ呼び出し工程追加＋入力1個追加＋メタ1行追加/1行削除＋現 Step 書き込み前の履歴欠落検出・やり直し促し工程追加〔REQ-C-009〕）、compliance-checker（W4/W5 への観点追加＋W4-D の参照元差し替え＋W4-0 の照合キー導出〔REQ-C-004〕）。既存の責務・署名検証・テキスト履歴検証ロジックは変更しない。
3. **fs-* 群への機械的な引数追加（ユーザー決定でスコープ化）** — step-history-writer 呼び出しに `artifact_dir` を加えるのみ。フェーズ構成・Process 手順・責務は不変。
4. **dev-environment.md の記載整合** — Python/.venv 方針を実態（pyautogui を `.venv` に隔離）へ改訂。

### 1.2 設計上の確定判断

| 論点 | 確定判断 | 根拠 |
|---|---|---|
| 撮影機能の置き場所 | step-history-writer に埋め込まず新規スキルに分離 | OCP（approach.md REQ-C-001）。撮影手段変更の波及局所化・再利用性 |
| 成果物フォルダパスの入手経路 | 経路A（step-history-writer の入力パラメータ）＝ユーザー決定 | approach.md REQ-C-003。呼び出し元が確実に保持する値を渡す |
| 入力パラメータ名 | `artifact_dir`（汎用名） | `changes_dir` は 3 WF にしか存在しない。全 WF が渡せる汎用名が必要 |
| フォールバック表記 | `(未指定)`（明示文字列） | 空欄だと照合・可読性が不安定。`changes_dir` と誤一致しない固定文字列 |
| 撮影の責務境界 | 撮る/`.err`/`.venv` 導入のみ（screenshot-capture）。写り込み妥当性は呼び出し側（step-history-writer 一次保証）、独立検証は compliance-checker（番人） | REQ-C-001 AC-001-6 / REQ-C-002 / REQ-C-005 |
| W4-D 時刻検証の基準 | 履歴ファイルの作成日時（FSタイムスタンプ）。Windows は CreationTime 優先、取得不能時 LastWriteTime にフォールバック | REQ-C-008。手書き完了日時の不安定さを排除 |
| REQ-C-004 照合キーの導出方式 | compliance-checker が WF 種別で照合キーを導出。`changes_dir` 相当を持つ WF（変更/バグ修正/リファクタリング）は write 入力 `changes_dir` をそのまま、持たない WF（設計/実装/企画/逆引き）は `progress_file_path`・`skill_name` から feature フォルダパス `.aide/specs/{feature_name}` を機械的に導出。導出は compliance-checker 側で完結し fs-* の phase-compliance-check 呼び出しは非波及 | REQ-C-004 AC-004-4〜7。artifact_dir と照合キーの一致根拠を担保し fs-* スコープ拡張を回避 |
| REQ-C-009 履歴欠落検出の判定根拠 | step-history-writer が現 Step 書き込み前に、`skill_name` から当該フェーズスキル SKILL.md の Process 順序を参照して前処理・前 Step 履歴の欠落を検出。欠落時はユーザー通知＋欠落先頭 Process からのやり直し促し。やり直し要否の最終判断はユーザー／オーケストレータ | REQ-C-009 AC-009-1〜5。final-check（W4-A）の早期前倒し検出 |

### 1.3 既存コードのパターン踏襲方針

- 新規 `screenshot-capture/SKILL.md` は、既存スキル（`step-history-writer`・`visual-companion`）の節構成（front-matter `name`/`description` → タイトル → 目的 → 入力パラメータ表 → 出力 → Process → エラー時動作 → Integration）と敬語スタイル（「〜する」「〜してはならない」の規範体）に合わせる。
- 用語は aide-powers 用語（activate / フェーズスキル / 共通スキル / 成果物フォルダ / `.aide/tmp/`）を用いる。
- Windows 主環境（dev-environment.md §4）を踏まえ、`.venv` 導入・撮影コマンドは Windows（PowerShell）系を主、bash 系を従として併記する。

## 2. インターフェース影響サマリ

### 2.1 step-history-writer の入力パラメータ追加（シグネチャ/呼び出し規約変更）

step-history-writer の入力に `artifact_dir` を追加することは、呼び出し規約の変更にあたる。呼び出し元を grep で全件検索した結果は以下。

**検索条件:** `skills/fs-*/SKILL.md` 内の `step-history-writer (aide-powers skill)` を含む activate 指示行。

**集計結果: 34 スキル・計 281 出現箇所**（step-history-writer を呼び出さない final-check 系 7 スキルは対象外）。

| WF 種別 | 対象スキル（呼び出し箇所数） | 小計 |
|---|---|---|
| バグ修正 | fs-bugfix-phase1-analysis(14), fs-bugfix-phase2-impl(20) | 34 |
| 変更 | fs-change-phase1-analysis(13), fs-change-phase2-impl(22) | 35 |
| 設計 | fs-design-phase1-user-req(6), fs-design-phase2-system-req(6), fs-design-phase3-dev-plan(7), fs-design-phase4-architecture(6), fs-design-phase5-gui(6), fs-design-phase6-usecase(10), fs-design-phase7-ddd(5), fs-design-phase8-object(10), fs-design-phase9-infra(6), fs-design-phase10-program(7) | 69 |
| 実装 | fs-impl-phase1-gate(5), fs-impl-phase2-preparation(8), fs-impl-phase3-gui-mockup(11), fs-impl-phase4-execution(8), fs-impl-phase5-final-check(6), fs-impl-phase6-doc-generation(7) | 45 |
| 企画 | fs-planning-phase1-intake-and-init(8), fs-planning-phase2-explore(10), fs-planning-phase3-finalize(7) | 25 |
| リファクタリング | fs-refactoring-phase1-status(6), fs-refactoring-phase2-candidates(7), fs-refactoring-phase3-plan(6), fs-refactoring-phase4-design(8), fs-refactoring-phase5-impl(8), fs-refactoring-phase6-doc(7) | 42 |
| 逆引き | fs-reverse-phase1-program(7), fs-reverse-phase2-dev-env(5), fs-reverse-phase3-system-req(5), fs-reverse-phase4-user-req(7), fs-reverse-phase5-optional-phases(7) | 31 |
| **合計** | **34 スキル** | **281** |

> 注: 上記は `step-history-writer (aide-powers skill)` 文字列の出現行数（各 SKILL.md 内）。各スキルの「step-history-writer について」見出し行・本文説明行を含むため、純粋な呼び出し指示行（`> **step-history-writer ...**: activate して実行。パラメータ — ...` 形式）はこれよりやや少ない。実装工程でのタスク分解時に呼び出し指示行のみを再カウントすること（タスク分解は本工程のスコープ外）。

**呼び出し元なし（対象外）の 7 スキル:** fs-bugfix-phase3-final-check, fs-change-phase3-final-check, fs-design-phase11-final-check, fs-impl-phase7-final-check, fs-planning-phase4-final-check, fs-refactoring-phase7-final-check, fs-reverse-phase6-final-check。

> 補足: 上記 7 スキルはいずれも各 WF 末尾の final-check 系で、「検証のみ」フェーズのため step-history-writer を呼ばず、逆に `.aide/tmp/session-history-*.txt` を削除する側（後述 2.4）。名称に「final-check」を含む `fs-impl-phase5-final-check` は実装WF中間の検証フェーズで step-history-writer を呼ぶ（6 出現）ため、対象外の 7 スキルには含まれず改修対象（34 スキル）側に入る。本設計では grep 実数に基づき「呼び出しを持つ 34 スキル」を改修対象とする。

**現状の呼び出しパターン（全件同一）:**
```
> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `{skill}`, step_id: `{id}`, step_title: `{title}`
```

**改修後（`artifact_dir` 追加）:**
```
> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `{skill}`, step_id: `{id}`, step_title: `{title}`, artifact_dir: `{各WFの成果物フォルダパス}`
```

詳細・WF 種別ごとの渡し値は [delta-design-fs-star-callsites.md](./delta-design-fs-star-callsites.md) を参照。

### 2.2 compliance-checker の入力シグネチャ（変更なし）／照合キーは WF 種別で導出

REQ-C-004 の履歴絞り込みに使う照合キーは、WF 種別によって導出方法が分かれるが、**いずれも compliance-checker 側で完結し、入力シグネチャの追加波及はない**。

- **`changes_dir` 相当を持つ WF（変更／バグ修正／リファクタリング）:** 照合キーは write モードの**既存入力** `changes_dir`（compliance-checker.md「write モード追加パラメータ」表に存在）をそのまま用いる。入力シグネチャの追加波及はない。
- **`changes_dir` 相当を持たない WF（設計／実装／企画／逆引き）:** これらの WF のフェーズスキルは作業別サブフォルダを持たず、成果物は feature フォルダ `.aide/specs/{feature_name}` 配下に置かれる。compliance-checker が write 入力の `progress_file_path`（`.aide/specs/{feature_name}/{wf}-progress.md`）の親ディレクトリ、または `skill_name` から feature フォルダパス `.aide/specs/{feature_name}` を**機械的に導出**して照合キーとする（REQ-C-004 / AC-004-5）。導出は compliance-checker 側で完結し、これらの WF の fs-* へは非波及（入力シグネチャ変更なし）。
- REQ-C-008 の W4-D 変更は、compliance-checker 内部の時刻取得元（メタ完了日時 → FSタイムスタンプ）の差し替えのみ。入力不変。
- **呼び出し側（fs-* の phase-compliance-check 呼び出し）改修は不要・スコープ外:** 全 WF で照合キーは compliance-checker 側で完結する（`changes_dir` 相当を持つ WF は write モードの既存 `changes_dir` をそのまま使用、持たない WF は compliance-checker が feature フォルダパスを導出）。したがって、設計／実装／企画／逆引きの各 WF のフェーズスキルが phase-compliance-check を write モードで呼ぶ際の引数（`changes_dir` 等）を新たに渡す/揃える改修は**不要**であり、本変更ではこれらの WF の phase-compliance-check 呼び出しを**変更しない**（impact-analysis.md と一致）。この結論は [delta-design-fs-star-callsites.md](./delta-design-fs-star-callsites.md) の「照合キーの一致対応表」と一致する。

> **前回 QA レビュー FAIL の解消:** 旧 §2.2 は「compliance-checker 受領 `changes_dir` と fs-* 側で揃える」前提で fs-star-callsites と矛盾していた。本改訂で「全 WF で compliance-checker 側完結（`changes_dir` 保持 WF はそのまま／非保持 WF は feature フォルダ導出）。fs-* の phase-compliance-check 呼び出し改修は不要」へ統一し、fs-star-callsites.md と結論を一致させた。これにより、artifact_dir と照合キーの一致根拠が担保され（非保持 WF は compliance-checker の導出で吸収）、fs-* スコープ拡張の自己宣言も不要となる。

### 2.3 screenshot-capture の被参照（新規）

- 参照元は step-history-writer のみ（REQ-C-002 で activate）。新規追加のため既存被参照はない。
- setup 系（`setup.bat`/`setup.sh`/`setup-local.*`）はディレクトリ一括コピーのため、新規スキルフォルダは自動配布対象。bat/sh への明示追記は不要（impact-analysis.md と一致、本変更スコープ外）。

### 2.4 `.aide/tmp/` クリーンアップ範囲への波及（REQ-C-010 で本変更スコープ内に取り込み）

本変更で `.aide/tmp/` に `session-history-{skill_name}-{step_id}.png`（または `.err`）が増える。現行の final-check 系 7 スキル（各 WF 末尾の final-check。`.aide/tmp/session-history-*.txt` を削除する側）は、いずれも Step「一時ファイルの削除」で `.aide/tmp/session-history-*.txt` のみを削除対象としている。うち fs-bugfix-phase3-final-check / fs-change-phase3-final-check の 2 スキルは、加えて Iron Law / 完了条件にも `session-history-*.txt` 参照を持つ（残り 5 スキルは Iron Law / 完了条件にクリーンアップ記述を持たず、Step 2 本体にのみ削除記述がある）。この分類は差分設計 C-5（[delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md)）6 章（Iron Law / 完了条件の整合対象は 2 スキルのみ）と一致する。`.png`/`.err` が残置すると次回ワークフローへ持ち越される懸念がある。

- **当初の判断（REQ-C-010 追加前）:** クリーンアップ glob の拡張（`session-history-*.txt` → `session-history-*.{txt,png,err}` 相当）は REQ-C-007 のスコープ（step-history-writer 呼び出し箇所への引数追加のみ）に含まれず、また「fs-* 本体改修はスコープ外」（change-requirements.md 対象外節）にあたるとして、当初は**本変更では行わない**申し送り扱いとしていた。
- **現在の方針（REQ-C-010 でスコープ内化）:** その後のユーザー決定により本件は **REQ-C-010 として本変更スコープ内に取り込まれた**。これに伴い旧判断（本変更では行わない）は覆り、差分設計 C-5 [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md) で final-check 系 7 スキルのクリーンアップ範囲拡張を正式対応する。したがって本件は申し送り（別途変更WFで対応）ではなく、本変更の正式な変更対象である。

## 3. 更新が必要な設計資料

本設計エージェントは既存設計書・既存スキルを直接変更しない。以下を後工程へ申し送る。

| # | 対象資料 | 必要な更新 | 区分 | 根拠 |
|---|---|---|---|---|
| U-1 | `.aide/specs/aide-powers/doc-index.md` | 新規スキル `screenshot-capture` 追加に伴う索引整合（doc-index-maintenance スキルが各 WF 後処理で実施）。本リポジトリは標準設計書を持たない（dev-environment.md §14.1）ため、スキル定義そのものが設計資料。索引の網羅性維持のため追記を検討 | 申し送り（doc-index-maintenance の通常運用で吸収可） | REQ-C-001 / dev-environment.md §14.1 |
| U-2 | `skills/fs-*-final-check/SKILL.md`（final-check 系 7 スキル） | `.aide/tmp/` 削除対象 glob を `session-history-*.txt` のみから `session-history-*.{txt,png,err}` へ拡張し、想定外残ファイルのユーザー確認削除を追加（C-5 で設計済み） | **本変更スコープ内で対応（REQ-C-010 / 差分設計 C-5 = [delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md)）** | REQ-C-010 / C-5 / 本書 2.4 |
| U-3 | `skills/phase-compliance-check/SKILL.md` | 全 WF で phase-compliance-check 呼び出しの改修は不要（`changes_dir` 相当を持つ 3 WF は既存 `changes_dir` をそのまま渡す／持たない 4 WF は compliance-checker が `progress_file_path`・`skill_name` から照合キーを導出して吸収。REQ-C-004 精緻化で解決済み）。スクショ照合・絞り込み前提を明文追記するかは要検討（impact-analysis.md「要検討」） | 申し送り（compliance-checker 内で完結するため必須ではない） | impact-analysis.md 依存関係表 / REQ-C-004（AC-004-5〜7） |
| U-4 | `.aide/references/phase-skill-rules.md` | step-history-writer のスクショ呼び出しも「全SKILL activate 必須」原則の対象である旨は既存原則で読み取れるため新規追記は不要。例示更新は任意 | 申し送り（任意） | change-requirements.md 関連既存要件 |

> U-1・U-3・U-4 は本変更の delta-design では直接編集しない。U-1 は各 WF 後処理の doc-index-maintenance スキルで自動的に扱われる範囲。一方 U-2 は当初スコープ外（fs-* 本体改修の禁止）として pending-issues 化を推奨していたが、ユーザー決定により **REQ-C-010 として本変更スコープ内に取り込まれ、差分設計 C-5（[delta-design-final-check-cleanup.md](./delta-design-final-check-cleanup.md)）で正式対応済み**である。したがって U-2 については pending-issues 化の推奨を撤回する。
