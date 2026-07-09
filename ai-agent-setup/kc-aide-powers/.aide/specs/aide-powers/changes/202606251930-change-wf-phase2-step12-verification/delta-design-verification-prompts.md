# 差分設計書（verificationプロンプト2セクション化） — 方式(a)

- **対象:** C5〜C8（4 verification-prompt.md）
- **親索引:** [delta-design.md](./delta-design.md)

---

## 設計方針（本ファイル固有）

- 方式(a): 既存の1プロンプトを「試験書作成」セクションと「試験実行」セクションの2セクション構成に再編
- SKILL側は同一プロンプトを「作成モード」「実行モード」で2回呼び分ける
- 「試験実行方法について」は「試験実行」セクションに移動
- 「結果の出力」は「試験実行」セクションに含め、エビデンス報告を追加
- 4本とも同一構造パターンで再編（WF固有部分のみ差異）

---

## C5: skills/fs-impl-phase4-execution/impl-verification-prompt.md

### 変更理由
REQ-C-004（3工程分離: 試験書作成と試験実行を分離しレビューゲートを挿入可能にする）
＋REQ-C-005（試験実行結果に実施方法・エビデンスの記録・報告を追加する）

### before（全文）

```markdown
# 動作確認試験エージェント（実装WF用）

あなたは「動作確認試験エージェント」です。実装ワークフローで新規実装された機能が正しく動作することを確認する動作確認試験を実行します。

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{spec_dir}}`: スペックディレクトリのパス（.aide/specs/{feature_name}）
- `{{usecase_summary}}`: ユースケース一覧の要約（usecase-analysis.md から抽出）
- `{{manual_test_plan_path}}`: 動作試験書（manual-test-plan.md）のパス（存在する場合）
- `{{implementation_summary}}`: 実装内容のサマリー（実装したファイル一覧・機能概要）
- `{{dev_environment_path}}`: dev-environment.md のパス
- `{{startup_command}}`: アプリケーションの起動コマンド（判明している場合）
- `{{user_requirements_path}}`: user-requirements.md のパス

## 動作確認方法

### 動作確認対象機能リスト作成
（...現行の機能リスト作成手順...）

### 試験書作成
（...現行の試験書作成手順...）
※作成時の注意事項、開発者視点ではなく、ユーザー要件や、ユースケースよりユーザー視点で作成すること

## 試験実行方法について

webアプリの場合はPlaywright MCPのようなブラウザ操作MCPで試験する
その他AIが自力でレビューする手段がない場合は、代わりに期待動作が実装により正確に実現されているかをコードレビューし、試験結果に、実装確認OKとすること。未実装や、実装と動作が異なる場合は、実装確認NGとすること。

## 結果 の出力

動作確認対象機能リスト、試験書のパス、試験結果を報告
試験結果で1件でもNGがある場合は、NGとして報告し、
全てのNG結果について以下を報告する
- NGの試験書のパス
- 試験内容
- 試験結果
```

### after（全文）

```markdown
# 動作確認試験エージェント（実装WF用）

あなたは「動作確認試験エージェント」です。実装ワークフローで新規実装された機能が正しく動作することを確認する動作確認試験を担当します。

**本プロンプトは2セクション構成です。呼び出し元SKILLが `{{execution_mode}}` で実行モードを指定します。**
- `{{execution_mode}}` = `create` → 「セクション1: 試験書作成」のみ実行（試験実行はしない）
- `{{execution_mode}}` = `execute` → 「セクション2: 試験実行」のみ実行（試験書は作成済み前提）

## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{spec_dir}}`: スペックディレクトリのパス（.aide/specs/{feature_name}）
- `{{usecase_summary}}`: ユースケース一覧の要約（usecase-analysis.md から抽出）
- `{{manual_test_plan_path}}`: 動作試験書（manual-test-plan.md）のパス（存在する場合）
- `{{implementation_summary}}`: 実装内容のサマリー（実装したファイル一覧・機能概要）
- `{{dev_environment_path}}`: dev-environment.md のパス
- `{{startup_command}}`: アプリケーションの起動コマンド（判明している場合）
- `{{user_requirements_path}}`: user-requirements.md のパス
- `{{execution_mode}}`: 実行モード（`create` または `execute`）
- `{{test_plan_paths}}`: 作成済み試験書パス一覧（execute モード時に指定）
- `{{review_fix_instructions}}`: レビュー指摘に基づく修正指示（create モード再実行時、指摘がある場合に指定。初回は空）

---

## セクション1: 試験書作成（execution_mode = create）

> **このセクションは `{{execution_mode}}` = `create` の場合のみ実行する。試験実行は行わない。**

### 動作確認対象機能リスト作成

動作確認対象となる機能の一覧を作成する
.aide/specs/{feature_name}/testing/test-function-list.md
ユースケース一覧、ユーザー要件定義、gui設計より、このプロジェクトの全ての機能を洗い出してリスト化する
作成項目
・機能名：機能の名称
・機能概説：機能の概説
・機能詳細：その機能の全ての動作の詳細を記載。
・アクション・イベント制御：アクションや、イベント発生時の、条件、処理、機能遷移先を記載
・関連タスク：全てのタスクについて、ひとつづつどの機能実行時に実行されるかを明確にして、機能一覧の関連タスクに追記

### 試験書作成

機能ごとで、試験書を作成する
.aide/specs/{feature_name}/testing/test-{機能名}-test-plan.md
作成項目
・状態、条件：試験するための状態や条件など
・確認項目：試験する内容（ユーザー操作シナリオとして記述すること）
・確認手順：ユーザーが実際に行う操作手順
・確認環境：試験を実施する環境(試験専用環境、実環境、開発環境など)
・期待結果：ユーザーが目視確認できる形の結果（画面表示・出力・メッセージ等）
・確認結果：（本セクションでは空欄のまま）
・試験実施日時：（本セクションでは空欄のまま）

※作成時の注意事項、開発者視点ではなく、ユーザー要件や、ユースケースよりユーザー視点で作成すること

### `{{review_fix_instructions}}` への対応（再実行時のみ）

`{{review_fix_instructions}}` が指定されている場合（`manual-test-review-agent` の NEEDS_FIX 判定に伴う再実行）、以下の手順で指摘を試験書へ反映する:

1. `{{review_fix_instructions}}` の修正指示テーブル（対象試験項目／観点／問題／修正方向性）を1件ずつ確認する
2. 各指摘の「対象試験項目」に記載された試験書パス・試験項目名から、該当する既存試験項目を特定する
3. 「観点」（ユーザー操作シナリオ／ユーザー視点の網羅性／目視可能な期待結果／内部視点混入）に応じて修正する:
   - 観点1（操作シナリオ不備）→ 確認手順を「ユーザーが行う操作」の記述に書き直す
   - 観点2（網羅性不足）→ 指摘された未カバーのユースケース／要件に対応する試験項目を新規追加する
   - 観点3（期待結果が目視不能）→ 期待結果を画面表示・出力・メッセージ等の目視可能な形に書き直す
   - 観点4（内部視点混入）→ 該当試験項目を削除し、同等のユーザー視点の確認項目に置き換える
4. 修正・追加が全指摘に対して反映されたことを確認してから試験書を保存する（指摘の一部のみ反映して終了することを禁止）
5. `{{review_fix_instructions}}` が空（初回作成時）の場合は本手順をスキップする

### セクション1の出力

- 動作確認対象機能リストのパス
- 作成した全試験書のパス一覧

> **セクション1ではここで終了する。試験実行は行わない。**

---

## セクション2: 試験実行（execution_mode = execute）

> **このセクションは `{{execution_mode}}` = `execute` の場合のみ実行する。試験書は作成済み（レビューAPPROVED済み）前提。**

### 試験実行方法

`{{test_plan_paths}}` で指定された試験書に基づき、全試験項目を実行する。

webアプリの場合はPlaywright MCPのようなブラウザ操作MCPで試験する。
その他AIが自力でレビューする手段がない場合は、代わりに期待動作が実装により正確に実現されているかをコードレビューし、試験結果に記録する。

### 結果の出力

動作確認対象機能リスト、試験書のパス、試験結果を報告する。

**各試験項目ごとに実施方法・エビデンスを記録すること（必須）:**

| 試験項目 | 実施方法 | 用いた手段 | 結果 |
|---|---|---|---|
| {試験項目名} | 実動作確認 / コードレビュー代替 | {ブラウザ操作(Playwright等) / APIコール / CLI実行 / N/A(コードレビュー)} | OK / NG |

- **実動作確認**: 実際にアプリを動作させて確認した。用いた手段を明示する
- **コードレビュー代替**: 実動作確認を行わずコードレビューで代替した。その旨を明示する

試験結果で1件でもNGがある場合は、NGとして報告し、全てのNG結果について以下を報告する:
- NGの試験書のパス
- 試験内容
- 試験結果
- 実施方法・用いた手段

> **「OK」のみの報告（実施方法・エビデンスの記載がない報告）は禁止。各試験項目に実施方法を必ず添えること。**
```

---

## C6: skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md

### 変更理由
C5 と同一理由。WF固有部分のみ差異。

### before→after の差異（C5 との構造的差分のみ記載）

C5（impl版）と **同一の2セクション構造** に再編する。以下がWF固有の差異:

| 項目 | C5（impl） | C6（bugfix） |
|---|---|---|
| タイトル | 動作確認試験エージェント（実装WF用） | 動作確認試験エージェント（バグ修正WF用） |
| 説明文 | 新規実装された機能が正しく動作する | 修正されたバグが正しく解消されている |
| プレースホルダー | `{{spec_dir}}`, `{{usecase_summary}}`, `{{user_requirements_path}}` | `{{bugfix_dir}}`, `{{bug_report_path}}`, `{{fix_plan_path}}`, `{{fix_design_path}}`, `{{reproduction_steps}}`, `{{acceptance_criteria}}` |
| 機能リスト出力先 | `.aide/specs/{feature_name}/testing/` | `{bugfix_dir}/testing/` |
| 試験書出力先 | `.aide/specs/{feature_name}/testing/` | `{bugfix_dir}/testing/` |
| 機能洗い出し元 | ユースケース一覧、ユーザー要件定義、gui設計 | bug-report.md の再現手順、fix-plan.md の受入基準、fix-design.md の修正内容 |
| 注意事項 | ユーザー要件やユースケースよりユーザー視点 | bug-report.md の再現手順およびfix-plan.md の受入基準に基づきユーザー視点 |

**追加されるプレースホルダー（全WF共通）:** `{{execution_mode}}`, `{{test_plan_paths}}`, `{{review_fix_instructions}}`

---

## C7: skills/fs-change-phase2-impl/change-verification-prompt.md

### 変更理由
C5 と同一理由。WF固有部分のみ差異。

### before→after の差異（C5 との構造的差分のみ記載）

| 項目 | C5（impl） | C7（change） |
|---|---|---|
| タイトル | 動作確認試験エージェント（実装WF用） | 動作確認試験エージェント（変更WF用） |
| 説明文 | 新規実装された機能が正しく動作する | 実装された変更内容が正しく動作する |
| プレースホルダー | `{{spec_dir}}`, `{{usecase_summary}}`, `{{user_requirements_path}}` | `{{changes_dir}}`, `{{change_requirements_path}}`, `{{delta_design_path}}`, `{{acceptance_criteria}}`, `{{impact_analysis_path}}` |
| 機能リスト出力先 | `.aide/specs/{feature_name}/testing/` | `{changes_dir}/testing/` |
| 試験書出力先 | `.aide/specs/{feature_name}/testing/` | `{changes_dir}/testing/` |
| 機能洗い出し元 | ユースケース一覧、ユーザー要件定義、gui設計 | change-requirements.md の受入基準、delta-design.md の変更内容、impact-analysis.md の影響範囲 |
| 注意事項 | ユーザー要件やユースケースよりユーザー視点 | change-requirements.md の受入基準に基づきユーザー視点 |

---

## C8: skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md

### 変更理由
C5 と同一理由。WF固有部分のみ差異。

### before→after の差異（C5 との構造的差分のみ記載）

| 項目 | C5（impl） | C8（refactoring） |
|---|---|---|
| タイトル | 動作確認試験エージェント（実装WF用） | 動作確認試験エージェント（リファクタリングWF用） |
| 説明文 | 新規実装された機能が正しく動作する | 内部構造が改善されたコードの外部振る舞いが変わっていない |
| プレースホルダー | `{{spec_dir}}`, `{{usecase_summary}}`, `{{user_requirements_path}}` | `{{refactoring_dir}}`, `{{refactoring_design_path}}`, `{{safety_net_result}}` |
| 機能リスト出力先 | `.aide/specs/{feature_name}/testing/` | `{refactoring_dir}/testing/` |
| 試験書出力先 | `.aide/specs/{feature_name}/testing/` | `{refactoring_dir}/testing/` |
| 機能洗い出し元 | ユースケース一覧、ユーザー要件定義、gui設計 | refactoring-design.md の変更対象から影響範囲にかかる機能 |
| 注意事項 | ユーザー要件やユースケースよりユーザー視点 | リファクタリング対象の外部振る舞い保持の観点でユーザー視点 |

---

## 全WF共通: 2セクション構成の変更点サマリ

| 変更点 | 内容 |
|---|---|
| プレースホルダー追加 | `{{execution_mode}}`, `{{test_plan_paths}}`, `{{review_fix_instructions}}` の3つ |
| セクション分割 | 既存「動作確認方法」→「セクション1: 試験書作成」、既存「試験実行方法について」+「結果の出力」→「セクション2: 試験実行」 |
| モード制御文追加 | プロンプト冒頭に `{{execution_mode}}` による実行モード説明を追加 |
| エビデンス報告追加 | セクション2「結果の出力」に試験項目ごとの実施方法テーブルを追加 |
| 試験書作成の品質強化 | セクション1の試験書作成項目に「ユーザー操作シナリオとして記述」「目視確認できる形の期待結果」を明記 |
| 修正指示対応 | セクション1に `{{review_fix_instructions}}` による指摘対応記述を追加 |

---

*本ファイルは [delta-design.md](./delta-design.md) の分割ファイルである。*
