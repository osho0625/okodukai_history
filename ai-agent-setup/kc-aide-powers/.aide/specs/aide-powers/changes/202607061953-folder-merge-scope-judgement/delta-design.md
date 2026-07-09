# 差分設計書: folder-merge-scope-judgement

## 設計方針

`skills/folder-merge-check/SKILL.md` の Step 2（起因元フォルダの経緯確認）と Step 3（ユーザーへの確認）の間に、新設Step「起因元要件との関連性判断」を1つ挿入する。挿入に伴い、既存Step3以降は1つずつ後ろにリナンバリングされる（Step3→Step4、Step4→Step5、Step5→Step6、Step6→Step7）。

新設Stepの内部フローは以下の5段階とする:
- (a) 起因元要件のまとめ
- (b) 統合先（今回の作業）要件の読み込み（`current_dir` と `workflow_type` からの機械的特定。新規パラメータの追加は不要）
- (c) 関連性の強弱判断（二値・根拠明文化）
- (d) 判断困難時のユーザー確認
- (e) 分岐（関連性「強い」→新Step4へ進む／「弱い（なし）」→起因元なし扱いで早期return）

既存Step3（新Step4）は、ユーザー提示情報に「関連性の判断結果」「判断理由（根拠）」の2項目を追加する以外、選択肢・分岐ロジックは変更しない。

既存Step1・Step2・旧Step4（ファイル移動）〜旧Step6（結果返却）の内部ロジックは変更しない（Step番号表記のみリナンバリング）。

呼び出し元3スキル（`fs-change-phase1-analysis` / `fs-bugfix-phase1-analysis` / `fs-refactoring-phase2-candidates`）への変更は不要（approach.md 4章の判断を継承）。

---

## 新規追加

### 新設Step: 起因元要件との関連性判断

既存Step2（起因元フォルダの経緯確認）の直後、既存Step3（ユーザーへの確認）の直前に挿入する。挿入後のStep番号は **Step 3** となる（既存Step3以降はStep4以降にリナンバリングされる）。

**追加する記述（`skills/folder-merge-check/SKILL.md` への新設セクション）:**

```markdown
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
```

**入力（既存パラメータの流用。新規パラメータの追加なし）:**
- `current_dir`: 現在のドキュメントフォルダのパス（既存）
- `workflow_type`: ワークフロー種別（既存）
- 起因元フォルダのトップレベルに現存する (b)分類ファイル（`change-requirements.md` / `bug-report.md` / `bug-analysis.md` / `refactoring-candidates.md` 等、存在するもの。優先1）
- 起因元フォルダの `old/{日付}/` 配下の要求文書（存在する場合。優先2）
- Step 2 で読み込み済みの起因元フォルダの `history.md` / 主要ドキュメント内容（優先3）

**判断が難しい場合の分岐の位置づけ:**
Step 1 の「起因元フォルダが存在しない」場合の早期return（`merged=false, result_dir=current_dir`）と同様の構造を踏襲する。既存の Iron Law「`NO MERGE DECISION WITHOUT ORIGIN VERIFICATION`」が要求する段階的絞り込みの流れ（Step1: 存在確認 → Step2: 経緯確認 → **Step3: 要件まとめ+関連性判断（新設）** → Step4: ユーザー確認）にそのまま組み込まれる。

---

## 既存変更

### 変更1: Step3（ユーザーへの確認）→ Step4へのリナンバリングと提示情報拡張

**変更理由**: REQ-C-002（判断結果のユーザー提示）を満たすため。新設Step3で関連性「強い」と判定された場合のみStep4に到達するため、Step4のユーザー提示情報に判断結果と根拠を追加提示する必要がある。またStep番号は新設Stepの挿入により1つ後ろにずれる。

**Before（現行 `skills/folder-merge-check/SKILL.md`）:**

```markdown
**Step 3:** ユーザーへの確認
- 以下の情報をユーザーに提示する:
  - **起因元フォルダ**: {origin_folder_path}
  - **過去の経緯**: {history.md の内容要約 / 主要ドキュメントの概要}
  - **現在のフォルダ**: {current_dir}
  - 「今回の{ワークフロー種別}は、過去の変更に関連している可能性があります。元のドキュメントフォルダに統合してよいですか？」
- 選択肢:
  1. はい（統合する）
  2. いいえ（新規フォルダで続行）
  3. その他（自由記述）
- ユーザーが「1. はい」→ Step 4へ
- ユーザーが「2. いいえ」→ `current_dir` をそのまま返す（統合なし） → 出力: `merged=false, result_dir=current_dir`
```

**After:**

```markdown
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
```

**差分の要点:**
- 見出し番号: Step 3 → Step 4
- ユーザー提示情報: 「関連性の判断結果」「判断理由（根拠）」の2項目を追加（「過去の経緯」と「現在のフォルダ」の間に挿入）
- 遷移先: 「1. はい」選択時の遷移先を Step 4 → Step 5 に変更（後続Stepのリナンバリングに伴う）
- 選択肢自体（1.はい/2.いいえ/3.その他）・「2. いいえ」時の早期return処理は変更なし

---

### 変更2: 旧Step4（ファイル移動の実行）→ Step5へのリナンバリング

**変更理由**: 新設Step3の挿入により、以降のStep番号が1つずつ後ろにずれるため。内部ロジック（移動ルール a/b/b-2/c、Step 4-事前の退避処理）自体は変更しないが、Step 4-事前の本文内に存在する自己参照（「本 Step 4 の判定基準」）はStep番号のずれに合わせて更新が必要。

**Before:**

```markdown
**Step 4:** ファイル移動の実行

**Step 4-事前: 統合先の前WF (b)分類成果物の一括退避**

（...既存の退避処理・移動ルール本文。変更なし...）

1. **退避対象の検出**: 統合先フォルダ（`origin_folder_path`）に存在するファイルのうち、本 Step 4 の判定基準で **(b) その時用の設計資料・進捗ファイル** に分類されるものを一括検出する

（...以下、既存本文。変更なし...）
```

**After:**

```markdown
**Step 5:** ファイル移動の実行

**Step 5-事前: 統合先の前WF (b)分類成果物の一括退避**

（...既存の退避処理・移動ルール本文。変更なし...）

1. **退避対象の検出**: 統合先フォルダ（`origin_folder_path`）に存在するファイルのうち、本 Step 5 の判定基準で **(b) その時用の設計資料・進捗ファイル** に分類されるものを一括検出する

（...以下、既存本文。変更なし...）
```

**差分の要点:**
- 見出し番号: 「Step 4」→「Step 5」、「Step 4-事前」→「Step 5-事前」の表記変更
- Step 4-事前の本文内にある自己参照「本 Step 4 の判定基準」→「本 Step 5 の判定基準」への表記変更（更新漏れ防止のため明示）
- 退避対象検出・退避先の日付決定・進捗ファイルの退避判定・退避の実行・退避完了後の確認・移動ルール（a/b/b-2/c）の処理内容自体は一切変更しない

---

### 変更3: 旧Step5（history.md の更新）→ Step6へのリナンバリング

**変更理由**: 新設Step3の挿入に伴うStep番号のずれ。

**Before:**

```markdown
**Step 5:** history.md の更新（`workflow_type` による分岐）
（...既存本文。変更なし...）
```

**After:**

```markdown
**Step 6:** history.md の更新（`workflow_type` による分岐）
（...既存本文。変更なし...）
```

**差分の要点:** 見出し番号のみ変更。`workflow_type` 別の分岐処理（変更/リファクタリング即時更新、バグ修正はdoc-sync委譲）は変更なし。

---

### 変更4: 旧Step6（結果の返却）→ Step7へのリナンバリング

**変更理由**: 新設Step3の挿入に伴うStep番号のずれ。

**Before:**

```markdown
**Step 6:** 結果の返却
- 統合結果を呼び出し元に返す
- 出力: `merged=true, result_dir=origin_folder_path`
```

**After:**

```markdown
**Step 7:** 結果の返却
- 統合結果を呼び出し元に返す
- 出力: `merged=true, result_dir=origin_folder_path`
```

**差分の要点:** 見出し番号のみ変更。処理内容は変更なし。

---

### 変更5: 完了条件セクションの整合性更新

**変更理由**: (1) 新設Step3で行われる関連性判断の完了を明示するため、(2) 既存の「Step 4-事前」表記を「Step 5-事前」に更新するため。

**Before:**

```markdown
### 完了条件

**統合した場合:**
1. 統合先フォルダ（origin_folder_path）に残存していた前WFの (b)分類成果物が `old/{日付}/` に退避されている（Step 4-事前）
2. 進捗ファイルの退避判定が正しく実行されている（全フェーズ完了→無条件退避 / 未完了→ユーザー確認済み）
3. current_dir 内の全ファイルが origin_folder_path に移動されている
4. 同名ファイルの衝突が移動ルール b の判定分岐＝(a) 恒久的設計資産→追記・更新／(b) その時用の設計資料・進捗ファイル→`old/{日付}/` 退避 に従って解決されている
5. 空になった current_dir が削除されている
6. origin_folder_path 内の history.md が更新されている（※バグ修正WFを除く。バグ修正WFではフェーズ6完了時に doc-sync (aide-powers skill) が追記する）
7. 呼び出し元に統合結果（merged=true, result_dir=origin_folder_path）が返却されている

**統合しなかった場合:**
1. ユーザーが統合を拒否した、または起因元フォルダが存在しなかった
2. current_dir がそのまま維持されている
3. 呼び出し元に非統合結果（merged=false, result_dir=current_dir）が返却されている
```

**After:**

```markdown
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
```

**差分の要点:**
- 「統合した場合」に新項目1（関連性判断の完了確認）を追加し、既存項目1〜7を2〜8にリナンバリング
- 既存項目1（現項目2）の「Step 4-事前」を「Step 5-事前」に更新
- 「統合しなかった場合」の項目1に「起因元要件との関連性判断（Step 3）で関連性が『弱い（なし）』と確定した」場合を追加

---

### 変更6: Red Flags テーブルへの項目追加

**変更理由**: REQ-C-001 AC-001〜AC-003 で追加された関連性判断プロセスの省略・スキップを防止するため。

**Before（テーブル末尾2行）:**

```markdown
| 「フォルダ統合判定は省略してよい」 | 起因元フォルダが特定された場合、統合判定は必須。省略はドキュメントの散逸を招く |
| 「起因元フォルダが `changes/` で今回は `bugfix/` だからWF種別が異なり統合できない」 | folder-merge-check の目的は同じコード変更に起因するドキュメントを1箇所に集約しトレーサビリティを確保すること。WF種別（`changes/` / `bugfix/` / `refactoring/`）やディレクトリ階層の違いは統合を阻む条件ではない |
```

**After（末尾に2行追加）:**

```markdown
| 「フォルダ統合判定は省略してよい」 | 起因元フォルダが特定された場合、統合判定は必須。省略はドキュメントの散逸を招く |
| 「起因元フォルダが `changes/` で今回は `bugfix/` だからWF種別が異なり統合できない」 | folder-merge-check の目的は同じコード変更に起因するドキュメントを1箇所に集約しトレーサビリティを確保すること。WF種別（`changes/` / `bugfix/` / `refactoring/`）やディレクトリ階層の違いは統合を阻む条件ではない |
| 「起因元フォルダが見つかったから、関連性判断（Step 3）を経ずに即座にユーザーへ統合可否を確認する」 | 関連性判断（Step 3）は AC-001〜AC-002 で必須化されたプロセス。省略して Step 4 に進んではならない |
| 「関連性の強弱判断（Step 3）は省略してよい」 | 起因元フォルダが特定された場合、関連性判断は必須。省略すると無関係な経緯が同一フォルダに混在し、トレーサビリティを損なう |
```

---

### 変更7: Common Rationalizations テーブルへの項目追加

**変更理由**: 関連性判断（Step 3）実施時にAIが陥りがちな誤った合理化を防止するため。

**Before（テーブル末尾1行）:**

```markdown
| 「ファイル衝突が面倒だから統合を勧めない」 | ファイル衝突は移動ルール b の判定分岐＝(a) 恒久的設計資産は追記・更新／(b) その時用ファイルは `old/{日付}/` 退避 で機械的に解決できる。統合の推奨・非推奨はワークフローが判断するものではない |
```

**After（末尾に2行追加）:**

```markdown
| 「ファイル衝突が面倒だから統合を勧めない」 | ファイル衝突は移動ルール b の判定分岐＝(a) 恒久的設計資産は追記・更新／(b) その時用ファイルは `old/{日付}/` 退避 で機械的に解決できる。統合の推奨・非推奨はワークフローが判断するものではない |
| 「今回の作業要件文書を読まなくても、history.md の経緯だけで関連性は判断できる」 | 関連性判断（AC-002）は起因元フォルダの内容と今回の作業内容（change-requirements.md / bug-report.md 等）の実際の比較が必須。history.md だけでは統合先の要件内容が分からない |
| 「関連性の強弱が微妙なときは、統合できた方が便利なので『強い』側に倒す」 | 判断が難しい場合、AIが独自判断で確定してはならない（AC-003）。必ずユーザーに両方の可能性の根拠を提示し確認を得る |
```

---

## GUI差分

該当なし。本変更はスキル定義書（`skills/folder-merge-check/SKILL.md`）の内部プロセス変更のみであり、GUIに影響する変更は含まれない。

---

## インターフェース影響サマリ

**シグネチャ変更: なし**

folder-merge-check の入力パラメータ（`origin_folder_path`, `current_dir`, `workflow_type`, `commit_hash`, `commit_summary`）・出力パラメータ（`merged`, `result_dir`）は変更しない。新設Step3が必要とする「今回の作業要件文書」は、既存パラメータ `current_dir` と `workflow_type` から機械的に導出するため、新規パラメータの追加は不要（approach.md「変更方針の詳細1」の方針を継承）。

**呼び出し元3スキルへの影響（Grep確認結果）**

以下の全呼び出し箇所を確認した結果、いずれも `origin_folder_path` / `current_dir` / `workflow_type` の既存3パラメータのみを渡す呼び出し形式であり、変更は不要と確認した。

| 呼び出し元ファイル | 呼び出し箇所 | 渡しているパラメータ | 変更要否 |
|---|---|---|---|
| `skills/fs-change-phase1-analysis/SKILL.md` | Step 6「フォルダ統合判定」 | `origin_folder_path`（impact-analysis.mdの起因元ドキュメントフォルダセクションから）, `current_dir`=changes_dir, `workflow_type`=変更 | 変更不要 |
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | Step 7「フォルダ統合判定」 | `origin_folder_path`（bug-analysis.mdの起因元ドキュメントフォルダセクションから）, `current_dir`=bugfix_dir, `workflow_type`=バグ修正 | 変更不要 |
| `skills/fs-refactoring-phase2-candidates/SKILL.md` | Step 2「フォルダ統合判定」 | `origin_folder_path`（refactoring-candidates.mdの起因元ドキュメントフォルダセクションから）, `current_dir`=refactoring_dir, `workflow_type`=リファクタリング | 変更不要（引き継ぎ経路では本Step自体が実行されないため新設Step3も実行されない。影響なし） |

**その他の参照元（Grep確認結果、folder-merge-check への呼び出し元ではなく被参照側）**

| ファイル | 参照内容 | 変更要否 |
|---|---|---|
| `skills/git-commit-workflow/SKILL.md` | folder-merge-check の Related skills として言及されるのみ（history.mdへのDocs:フッター記載時の参照元） | 変更不要（本変更はStep3挿入のみで、Docs:フッター記載ロジックには影響しない） |
| `skills/doc-sync/SKILL.md` | folder-merge-check の Related skills として言及されるのみ（設計書反映時のhistory.md参照） | 変更不要（Step4以降=旧Step3以降のファイル移動・history.md更新ロジックは変更していない） |
| `skills/pending-issues-management/SKILL.md` | folder-merge-check の Related skills として言及されるのみ（統合判定結果は正常フローのためpending-issuesに記録しない） | 変更不要（Step3(d)のユーザー確認は既存Step3のユーザー確認と同様の「正常フロー内のユーザー対話」であり、pending-issues記録要否のポリシーに変更はない） |

**結論**: 呼び出し元3スキル・被参照3スキルのいずれにも変更は不要。変更対象は `skills/folder-merge-check/SKILL.md` の1ファイルのみに限定される。

---

## 更新が必要な設計資料

| 資料 | 更新内容 | 更新タイミング | 区分 |
|---|---|---|---|
| `.aide/specs/aide-powers/program-structure.md`（「パス3: 共通スキル群 詳細解析」内の `folder-merge-check` 項目） | 主要機能の記述「起因元フォルダ存在確認→経緯確認（history.md）→ユーザー確認→...」に、新設された「起因元要件との関連性判断」ステップの言及を追加する（例: 「起因元フォルダ存在確認→経緯確認（history.md）→起因元要件との関連性判断→ユーザー確認→...」） | 実装後（doc-sync フェーズでの反映） | 本変更スコープ内・doc-sync 対象 |

本差分設計書自身は既存設計書（program-structure.md 等）を直接変更していない。上記の反映は doc-sync (aide-powers skill) の担当範囲であり、本エージェントの担当外である。
