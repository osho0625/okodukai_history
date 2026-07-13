---
name: folder-merge-check
description: "Use when a workflow analysis phase identifies an origin document folder (via git blame Docs: footer). Determine whether to merge the current document folder into the origin folder."
---

# フォルダ統合判定

## Overview

変更・バグ修正・リファクタリングの3つのワークフローで共通利用されるフォルダ統合判定スキル。git blame → Docs: フッターの追跡により特定された起因元ドキュメントフォルダに対して、現在のドキュメントフォルダを統合するかどうかをユーザーに確認し、承認された場合にファイル移動・history.md 更新を実行する。

**Core principle:** 起因元フォルダが特定されたら、ユーザーに統合の可否を確認し、承認された場合のみフォルダを統合せよ。独自判断で統合・非統合を決定してはならない。

## The Iron Law

```
NO FOLDER MERGE WITHOUT USER APPROVAL.
ユーザーの承認なしに、フォルダ統合を実行してはならない。
```

```
NO MERGE DECISION WITHOUT ORIGIN VERIFICATION.
起因元フォルダの存在確認と history.md の経緯確認なしに、統合の可否をユーザーに問うてはならない。
```

## Process

呼び出し元フェーズスキルから起因元フォルダ情報を受け取る。

**入力:**
- `origin_folder_path`: 起因元ドキュメントフォルダのパス
- `current_dir`: 現在のドキュメントフォルダのパス（新規作成されたフォルダ）
- `workflow_type`: ワークフロー種別（変更 / バグ修正 / リファクタリング）
- `commit_hash`: （オプション）起因元を特定したコミットハッシュ
- `commit_summary`: （オプション）起因元コミットの要約

**Step 1:** 起因元フォルダの存在確認
- 存在しない → ユーザーに「起因元フォルダ（{origin_folder_path}）が見つかりません。新規フォルダで続行します。」と報告 → `current_dir` をそのまま返す（統合なし） → 出力: `merged=false, result_dir=current_dir`
- 存在する → Step 2へ

**Step 2:** 起因元フォルダの経緯確認
- 起因元フォルダ内の `history.md` を Read で読み込む
  - `history.md` が存在する → 過去の変更経緯を把握する
  - `history.md` が存在しない → 起因元フォルダ内の主要ドキュメントの概要を把握する

**Step 3:** 起因元要件との関連性判断

- (a) **起因元要件のまとめ**: 起因元フォルダの要件内容を、以下の優先順位で情報源を Read で読み込み要約する。
  - 優先1: **起因元フォルダのトップレベルに現存する (b)分類ファイル**（`change-requirements.md` / `bug-report.md` / `bug-analysis.md` / `refactoring-candidates.md` 等、存在するもの）。これらは起因元フォルダ自身の直近完了ワークフローの成果物であり、Step 5-事前（本Stepより後に実行される、統合先の前WF (b)分類成果物の一括退避処理）でまだ `old/{日付}/` に退避されておらず、トップレベルに残存している最も新しい経緯情報である。
  - 優先2: 起因元フォルダ内の `old/{日付}/` 配下に退避されている過去の要求文書（同種のファイル）。`old/{日付}/` サブフォルダが複数存在する場合は、最新の日付のサブフォルダを優先的に参照する。
  - 優先3: `history.md`（history.md 不在時は主要ドキュメントの概要）
  - **既存の除外ルールとの関係**: 移動ルール b の「`old/{日付}/` に退避したファイルは履歴保全目的で保持し、以降のフェーズ（タスク計画・doc-sync・design-sync 等）の入力対象から除外する（読み込み対象は正規名ファイルのみ）」という記述は、**統合完了後**に統合先ワークフロー（タスク計画・doc-sync・design-sync 等）が**設計入力**として `old/{日付}/` を参照しないようにするための除外ルールであり、本Step（**統合可否を判断するために過去の経緯を確認する**目的）とは適用文脈が異なる。`old/{日付}/` は「履歴保全目的で保持」するとルール自身が明言しており、本Stepでの参照はこの保持目的に合致するため、当該除外ルールの対象外である。
- (b) **統合先要件の読み込み**: `current_dir` と `workflow_type` から、今回の作業の要件文書を機械的に特定し Read で読み込む。
  - `workflow_type` が「変更」 → `{current_dir}/change-requirements.md`
  - `workflow_type` が「バグ修正」 → `{current_dir}/bug-report.md` と `{current_dir}/bug-analysis.md` の両方
    - **決定理由**: `fs-bugfix-phase1-analysis/SKILL.md` の Step 7（フォルダ統合判定）は Step 5（bug-analysis.md 作成）・Step 6（原因分析のユーザー承認）の後に実行されるため、Step 7 時点では bug-report.md と bug-analysis.md の両方が既に `bugfix_dir` 配下に存在する。関連性判断（統合先要件の把握）には、症状・再現手順（bug-report.md）だけでなく、原因箇所・影響範囲（bug-analysis.md）の情報も必要であるため、両方を読込対象とする。
  - `workflow_type` が「リファクタリング」 → `{current_dir}/refactoring-candidates.md`
- (c) **関連性の強弱判断**: (a) と (b) の内容を比較し、追加・変更・不具合修正等を問わず関連性が「強い」か「弱い（なし）」かを二値で判断する。判断理由（根拠）を明文化する。
- (d) **判断困難時の処理**: 強弱の判断が難しい場合、独自判断で確定せず、判断に迷っている旨と両方の可能性の根拠をユーザーに提示し確認を得る。
  - 提示する選択肢:
    1. 関連性は強い（統合検討へ進む）
    2. 関連性は弱い・なし（起因元なし扱いとする）
    3. その他（自由記述）
  - ユーザーの回答をもって強弱を確定する。
- (e) **分岐**:
  - 関連性「強い」と確定 → 判断結果（強い）と判断理由（根拠）を保持したまま **Step 4**（ユーザーへの確認）に進む
  - 関連性「弱い（なし）」と確定 → 起因元なし扱いとし、Step 4 以降（ユーザーへの統合可否確認・ファイル移動等）をスキップする → `current_dir` をそのまま返す（統合なし） → 出力: `merged=false, result_dir=current_dir`

**Step 4:** ユーザーへの確認
- 以下の情報をユーザーに提示する:
  - **起因元フォルダ**: {origin_folder_path}
  - **過去の経緯**: {history.md の内容要約 / 主要ドキュメントの概要}
  - **関連性の判断結果**: 強い（Step 3 で確定）
  - **判断理由（根拠）**: {Step 3 (c) または (d) で確定した根拠}
  - **現在のフォルダ**: {current_dir}
  - 「今回の{ワークフロー種別}は、過去の変更に関連している可能性があります。元のドキュメントフォルダに統合してよいですか？」
- 選択肢:
  1. はい（統合する）
  2. いいえ（新規フォルダで続行）
  3. その他（自由記述）
- ユーザーが「1. はい」→ Step 5へ
- ユーザーが「2. いいえ」→ `current_dir` をそのまま返す（統合なし） → 出力: `merged=false, result_dir=current_dir`

**Step 5:** ファイル移動の実行

**Step 5-事前: 統合先の前WF (b)分類成果物の一括退避**

統合先フォルダ（`origin_folder_path`）に残存する前WFの (b)分類成果物を、移動元ファイルの移動処理に先立って一括退避する。これにより、移動元ファイルの配置時に統合先が「クリーン」な状態であることを保証する。

1. **退避対象の検出**: 統合先フォルダ（`origin_folder_path`）に存在するファイルのうち、本 Step 5 の判定基準で **(b) その時用の設計資料・進捗ファイル** に分類されるものを一括検出する
   - 移動元（`current_dir`）に同名ファイルが存在するか否かは問わない（同名衝突がなくても退避対象）
   - 対象例: `delta-design.md` / `change-requirements.md` / `impact-analysis.md` / `approach.md` / `delta-task-list.md` / `impl-process-checklist.md` / `change-progress.md` / `bugfix-progress.md` / `refactoring-progress.md` / `testing/`（フォルダごと）等
   - 判定基準は既存の移動ルール b の (a)/(b) 判定基準と**完全に同一**（新しい判定基準の追加なし）

2. **退避先の日付決定**: `old/{日付}/` の日付は以下の優先順で決定する
   - 優先1: 統合先フォルダ内の `history.md` に記載されている最新エントリの日付
   - 優先2: `history.md` が存在しない場合、または日付が特定できない場合 → 統合先に存在する進捗ファイル（`change-progress.md` / `bugfix-progress.md` / `refactoring-progress.md`）内の最終完了日時を使用する
   - 優先3: いずれも特定できない場合 → 本日日付（`{YYYY-MM-DD}`）を使用する

3. **進捗ファイルの退避判定**（特別な条件分岐）:
   - 進捗ファイル（`change-progress.md` / `bugfix-progress.md` / `refactoring-progress.md`）が検出された場合:
     - **全フェーズ✅完了状態** → 無条件で `old/{日付}/` に退避する
     - **未完了状態**（途中フェーズが残っている等）→ ユーザーに以下の情報を報告し、退避許可を得てから退避する（勝手に退避しない）:
       - 進捗ファイル名
       - 完了状態のフェーズ一覧と未完了フェーズ一覧
       - 「前回のWFが完了していない可能性があります。退避してよいですか？」
       - 選択肢: 1. はい（退避する） / 2. いいえ（退避しない）/ 3. その他（自由記述）
   - ユーザーが退避を拒否した場合: 当該進捗ファイルのみ退避対象から除外し、他の (b)分類ファイルの退避は続行する

4. **退避の実行**: 検出した (b)分類ファイルを全て `old/{日付}/` に移動する
   - `old/{日付}/` サブフォルダを作成する（既に存在する場合はそのまま使用する）
   - `testing/` フォルダが存在する場合はフォルダごと `old/{日付}/testing/` に退避する（既存の b-2 ルールと同様の扱い）
   - 退避後、今回WFの進捗ファイルは phase-report-check write により新規作成される

5. **退避完了後の確認**: 統合先がクリーンな状態（(b)分類成果物が除去された状態）になったことを確認し、以下の移動ルールの処理に進む

**移動ルール（既存処理、変更なし）:**
- `current_dir` 内の全ファイルを `origin_folder_path` に移動する
- 移動ルール:
  - a. 移動先に同名ファイルが存在しない場合: そのまま移動する
  - b. 移動先に同名ファイルが存在する場合: まず以下の判定基準でファイルを (a) / (b) に分類し、分岐する
    - **判定基準（分岐の前に必ず分類すること）:**
      同名ファイルの扱いは、ファイルの性質に対する以下の判定基準で「恒久的か / その時用か」を判断する。ファイル名が下記の対象例に載っていない未知のファイルに遭遇した場合も、この判定基準に従って分類すること。
      - **(a) 恒久的設計資産**: 元のユーザー要求に関する資料や、データ構造など、**プロジェクトの最新の設計情報を表すもの**。常に最新状態が正であり、WF完了後も参照され続ける。
        - 対象例: `user-requirements.md` / `system-requirements.md` / `object-design-*.md` / `history.md` 等
      - **(b) その時用の設計資料・進捗ファイル**: 差分設計や進捗ファイルなど、**そのWF（ワークフロー）が終わると履歴としてしか価値がないもの**。WF完了後はスナップショットとして固定され、最新の設計情報を表すものではない。
        - 対象例: `delta-design.md` / `change-requirements.md` / `impact-analysis.md` / `approach.md` / `delta-task-list.md` / `impl-process-checklist.md` / `change-progress.md` / `bugfix-progress.md` / `refactoring-progress.md` / `testing/`（フォルダごと） 等
    - **(a) 恒久的設計資産と判定した場合 → 追記・更新ルート:**
      - 既存ファイルの末尾に以下のヘッダを付けて追記する:
        ```
        ---
        ## 追記（{YYYY-MM-DD}）
        ```
      - 移動元ファイルの全内容を追記する
      - 移動元ファイルを削除する
    - **(b) その時用の設計資料・進捗ファイルと判定した場合 → `old/{日付}/` 退避ルート:**
      - 統合先フォルダ配下に `old/{日付}/` サブフォルダを作成する（既に存在する場合はそのまま使用する）
      - `{日付}` は、退避対象に関連する `history.md` に記載されている日付を用いる（例: `old/2025-05-27/`）
      - 統合先の既存ファイル（旧WFの成果物）を `old/{日付}/` へ退避する
      - 今回WFの成果物を正規名で配置する（移動元ファイルをそのまま移動する）
      - `old/{日付}/` に退避したファイルは履歴保全目的で保持し、以降のフェーズ（タスク計画・doc-sync・design-sync 等）の入力対象から除外する（読み込み対象は正規名ファイルのみ）
    - **(a) / (b) のどちらにも明確に該当しない同名ファイルの場合 → (a) 追記・更新ルートを従来通り適用する**
    - **注意事項:**
      - 本ルールは全WF種別（変更 / バグ修正 / リファクタリング）に共通して適用する
      - 旧方式（`~1` / `~2` 等のサフィックスを付けてリネームする方式）は採用しない
  - b-2. `testing/` フォルダの取り扱い: `current_dir` 内に `testing/` フォルダが存在する場合、フォルダごと `old/{日付}/testing/` に移動する。testing/ 配下のファイル（test-function-list.md, test-{機能名}-test-plan.md）はそのWFの動作確認結果であり、統合先の正規 testing/ フォルダとは混在させない。
  - c. 全ファイルの移動が完了したら: 空になった `current_dir` を削除する

**Step 6:** history.md の更新（`workflow_type` による分岐）
- `workflow_type` が「変更」の場合:
  - 即座に history.md を更新する（MUST）
  - `origin_folder_path` 内の history.md を更新する
    - history.md が存在する場合: 末尾に追記エントリを追加する
    - history.md が存在しない場合: history.md を新規作成する
- `workflow_type` が「リファクタリング」の場合:
  - 即座に history.md を更新する（MUST）
  - `origin_folder_path` 内の history.md を更新する
    - history.md が存在する場合: 末尾に追記エントリを追加する
    - history.md が存在しない場合: history.md を新規作成する
- `workflow_type` が「バグ修正」の場合:
  - **この時点では history.md に追記しない**
  - フェーズ6（設計書反映）完了時に doc-sync (aide-powers skill) が追記する
  - 理由: バグ修正の場合、修正完了後に初めて正確な修正概要（症状・原因・修正内容）が確定するため

**Step 7:** 結果の返却
- 統合結果を呼び出し元に返す
- 出力: `merged=true, result_dir=origin_folder_path`

### history.md 追記テンプレート（ワークフロー種別別）

**変更WFの場合:**

```markdown
## 追加変更（{YYYY-MM-DD}）
- 日付: {YYYY-MM-DD}
- 依頼内容: {change-requirements.md の要求概要}
- 変更概要: {変更内容の要約}
- 関連ドキュメント: change-requirements.md, impact-analysis.md
```

**バグ修正WFの場合:**

※このテンプレートは folder-merge-check 実行時点では使用しない。フェーズ6完了時に doc-sync (aide-powers skill) が使用する。

```markdown
## 不具合修正（{YYYY-MM-DD}）
- 日付: {YYYY-MM-DD}
- バグ概要: {bug-report.md の症状要約}
- 原因: {bug-analysis.md の原因要約}
- 修正概要: {fix-design.md の修正内容要約}
- 関連ドキュメント: bug-report.md, bug-analysis.md, fix-plan.md, fix-design.md
```

**リファクタリングWFの場合:**

```markdown
## リファクタリング（{YYYY-MM-DD}）
- 日付: {YYYY-MM-DD}
- 対象: {リファクタリング対象の概要}
- 改善内容: {改善内容の要約}
- 関連ドキュメント: refactoring-candidates.md
```

### 完了条件

**統合した場合:**
1. 起因元要件との関連性判断（Step 3）が実行され、関連性が「強い」と確定している（判断困難時はユーザー確認により確定）
2. 統合先フォルダ（origin_folder_path）に残存していた前WFの (b)分類成果物が `old/{日付}/` に退避されている（Step 5-事前）
3. 進捗ファイルの退避判定が正しく実行されている（全フェーズ完了→無条件退避 / 未完了→ユーザー確認済み）
4. current_dir 内の全ファイルが origin_folder_path に移動されている
5. 同名ファイルの衝突が移動ルール b の判定分岐＝(a) 恒久的設計資産→追記・更新／(b) その時用の設計資料・進捗ファイル→`old/{日付}/` 退避 に従って解決されている
6. 空になった current_dir が削除されている
7. origin_folder_path 内の history.md が更新されている（※バグ修正WFを除く。バグ修正WFではフェーズ6完了時に doc-sync (aide-powers skill) が追記する）
8. 呼び出し元に統合結果（merged=true, result_dir=origin_folder_path）が返却されている

**統合しなかった場合:**
1. ユーザーが統合を拒否した、起因元フォルダが存在しなかった、または起因元要件との関連性判断（Step 3）で関連性が「弱い（なし）」と確定した
2. current_dir がそのまま維持されている
3. 呼び出し元に非統合結果（merged=false, result_dir=current_dir）が返却されている

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。フォルダ統合判定のルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「起因元フォルダが見つかったから自動的に統合する」 | 統合の可否はユーザーが判断する。独自判断で統合してはならない |
| 「ユーザーに聞くまでもない。明らかに関連している」 | 関連性の判断はユーザーの責務。ワークフローが独自に判断してはならない |
| 「同名ファイルがあるから統合できない」 | 同名ファイルは移動ルール b の判定分岐＝(a) 恒久的設計資産は追記・更新／(b) その時用ファイルは `old/{日付}/` 退避 で機械的に解決する。統合不可の理由にはならない |
| 「history.md の更新は後でやればよい」 | history.md の更新は統合時の必須処理。後回しにしない |
| 「起因元フォルダの存在確認は不要」 | 起因元フォルダが削除されている可能性がある。必ず存在確認する |
| 「フォルダ統合判定は省略してよい」 | 起因元フォルダが特定された場合、統合判定は必須。省略はドキュメントの散逸を招く |
| 「起因元フォルダが `changes/` で今回は `bugfix/` だからWF種別が異なり統合できない」 | folder-merge-check の目的は同じコード変更に起因するドキュメントを1箇所に集約しトレーサビリティを確保すること。WF種別（`changes/` / `bugfix/` / `refactoring/`）やディレクトリ階層の違いは統合を阻む条件ではない |
| 「起因元フォルダが見つかったから、関連性判断（Step 3）を経ずに即座にユーザーへ統合可否を確認する」 | 関連性判断（Step 3）は AC-001〜AC-002 で必須化されたプロセス。省略して Step 4 に進んではならない |
| 「関連性の強弱判断（Step 3）は省略してよい」 | 起因元フォルダが特定された場合、関連性判断は必須。省略すると無関係な経緯が同一フォルダに混在し、トレーサビリティを損なう |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「新規フォルダで進めた方がシンプル」 | 関連する変更を別フォルダに分散させると、後から経緯を追跡しにくくなる。統合の可否はユーザーが判断する |
| 「history.md は重要でない」 | history.md はフォルダ統合時の経緯把握に使用される。統合の有無に関わらず判定結果を記録する |
| 「起因元フォルダの内容を読む必要はない」 | history.md や主要ドキュメントの内容を把握しないと、ユーザーに適切な判断材料を提示できない |
| 「ファイル衝突が面倒だから統合を勧めない」 | ファイル衝突は移動ルール b の判定分岐＝(a) 恒久的設計資産は追記・更新／(b) その時用ファイルは `old/{日付}/` 退避 で機械的に解決できる。統合の推奨・非推奨はワークフローが判断するものではない |
| 「今回の作業要件文書を読まなくても、history.md の経緯だけで関連性は判断できる」 | 関連性判断（AC-002）は起因元フォルダの内容と今回の作業内容（change-requirements.md / bug-report.md 等）の実際の比較が必須。history.md だけでは統合先の要件内容が分からない |
| 「関連性の強弱が微妙なときは、統合できた方が便利なので『強い』側に倒す」 | 判断が難しい場合、AIが独自判断で確定してはならない（AC-003）。必ずユーザーに両方の可能性の根拠を提示し確認を得る |

## Integration

**Called by:**
- `fs-change-phase1-analysis` (aide-powers skill) — 影響範囲分析完了後のフォルダ統合判定
- `fs-bugfix-phase1-analysis` (aide-powers skill) — 原因分析完了後のフォルダ統合判定
- `fs-refactoring-phase2-candidates` (aide-powers skill) — 対象特定完了後のフォルダ統合判定

**Related skills:**
- `git-commit-workflow` (aide-powers skill) — Docs: フッターにフォルダパスを記載する（統合後は origin_folder_path を使用）
- `doc-sync` (aide-powers skill) — 設計書反映時に history.md を参照する（統合済みの場合）
- `pending-issues-management` (aide-powers skill) — 統合判定の結果は pending-issues には記録しない（正常フロー）

**Input from caller:**
- `origin_folder_path`: 起因元ドキュメントフォルダのパス（git blame → Docs: フッターから特定）
- `current_dir`: 現在のドキュメントフォルダのパス
- `workflow_type`: ワークフロー種別（変更 / バグ修正 / リファクタリング）
- `commit_hash`: （オプション）起因元を特定したコミットハッシュ
- `commit_summary`: （オプション）起因元コミットの要約

**Output to caller:**
- `merged`: 統合したかどうか（true / false）
- `result_dir`: 以降のフェーズで使用するドキュメントフォルダパス
