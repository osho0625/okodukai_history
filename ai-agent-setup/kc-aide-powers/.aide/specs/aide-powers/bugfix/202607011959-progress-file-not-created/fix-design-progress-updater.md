# バグ修正差分設計（分割: 修正スコープ1 — progress-updater本体）

> 本ファイルは fix-design.md の分割ファイルです。修正スコープ1（progress-updater の write モードへの新規作成処理追加、および同期4ファイル）を扱います。fix-plan.md の修正スコープ1の記載内容に変更はないため、既存のfix-design.mdの内容を土台としています。

## 対象ファイル（4ファイル）

- `agents/progress-updater.md`（正本）
- `agents/kiro/progress-updater.md`（Kiro IDE配布用・同期対象）
- `agents/kiro/prompts/progress-updater-prompt.md`（Kiro CLI配布用・同期対象）
- `.kiro/agents/progress-updater.md`（ワークスペース配布済みコピー・同期対象）

## 設計方針

- 既存記述のルール優先。Markdown表形式のStep記述パターン（`| Step | 内容 |` テーブル + `### W{n}. {見出し}` の詳細セクション）、見出し階層（`# モード名` → `## 実行フロー` → `## 各 Step の詳細` → `### W{n}. {名称}`）を踏襲する
- verify モードのセクションには一切変更を加えない（fix-plan.md の方針を厳守）
- write モードの実行フロー冒頭に `W1.5` を新設し、W1（フェーズ番号抽出）と W2（前フェーズ完了状態チェック）の間に「進捗ファイル不在時の新規作成」処理を挿入する
- **ワークフロー識別子の抽出方法（正規表現）:** skill_name（例: `fs-bugfix-phase1-analysis`）に対して正規表現 `^fs-([a-z]+)-phase\d+` を適用し、キャプチャグループ1をワークフロー識別子とする。既存 W1 のフェーズ番号抽出（`phase(\d+)`）と対をなす形で一貫性を保つ
- **ワークフロー識別子 → 初期テンプレートのマッピング表:**

  | ワークフロー識別子 | ワークフロー表示名 | 進捗ファイル名 | 初期テンプレート参照 |
  |---|---|---|---|
  | planning | 企画WF | planning-progress.md | progress-file-format.md §7.1 |
  | design | 設計WF | design-progress.md | progress-file-format.md §7.2 |
  | impl | 実装WF | impl-progress.md | progress-file-format.md §7.3 |
  | reverse | 設計逆引きWF | reverse-progress.md | progress-file-format.md §7.4 |
  | change | 変更WF | change-progress.md | progress-file-format.md §7.5 |
  | bugfix | バグ修正WF | bugfix-progress.md | progress-file-format.md §7.6 |
  | refactoring | リファクタリングWF | refactoring-progress.md | progress-file-format.md §7.7 |

- **新規作成時の前フェーズ完了チェックの扱い（W2 との整合性確定）:** W1.5 で新規作成した場合、W2 の前フェーズ完了状態チェックはスキップする。理由: 新規作成直後のステータステーブルは全フェーズ `⬜ 未着手` であり、前フェーズ（N-1）の実際の完了実績を新規作成後のテーブルから機械的に検証することは原理的に不可能である（実績は folder-merge-check により退避された旧ファイル側に存在するが、本修正の範囲では旧ファイルを遡って参照しない）。この扱いは bugfix WF（N=1 で新規作成、既存 W2 の「N=1はスキップ」規定と自然に整合）だけでなく、refactoring WF（phase2 の Step2 で folder-merge-check が発生し N=2 で新規作成されうる）でも矛盾なく成立させるために必要な確定である
- 修正対象は write モードのみ。verify / fix_open / fix_close モードは無変更

## 変更対象1: agents/progress-updater.md（正本）— write モード実行フロー

### before
```markdown
# write モード（後処理）

フェーズ完了時に呼び出される。成果物の存在確認 → 前フェーズ完了状態確認 → 進捗ファイル更新を行う。

## 実行フロー

| Step | 内容 |
|---|---|
| W1 | skill_name からフェーズ番号 N を抽出 |
| W2 | 進捗ファイルを Read で読み込み、前フェーズ完了状態を確認する |
| W3 | 成果物の存在確認（expected_artifacts が changes_dir に存在し1byte以上） |
| W4 | ステータステーブルの該当フェーズ行を `✅ 完了` + 完了日時に更新 |
| W5 | フェーズ詳細セクションを追記（状態・完了日時・skill_name・成果物一覧） |

W2〜W3 のいずれかで FAIL → フロー中断、ユーザーに即通知。
W4 以降は全項目 PASS の場合のみ実行する。

## 各 Step の詳細

### W1. フェーズ番号抽出
- skill_name に正規表現 `phase(\d+)` を適用してフェーズ番号 N を抽出

### W2. 進捗ファイル確認＋前フェーズ完了状態チェック
- 進捗ファイルを Read で読み込む
- 進捗ファイル上、前フェーズ（N-1）が `✅ 完了` または `🔧 修正中` であることを確認する。未完了（`⬜ 未着手` / `🔧 作業中`）のまま現フェーズを完了させようとしている → FAIL
- N = 1 の場合は前フェーズチェックをスキップ

### W3. 成果物の存在確認
- expected_artifacts の各ファイルが `changes_dir` 内に存在するか確認する。1つでも欠落 → FAIL
- ファイルが存在し1文字以上の内容があれば PASS。内容の品質は本チェックの対象外（QAレビューアーの責務）
```

### after
```markdown
# write モード（後処理）

フェーズ完了時に呼び出される。進捗ファイル不在時の新規作成 → 成果物の存在確認 → 前フェーズ完了状態確認 → 進捗ファイル更新を行う。

## 実行フロー

| Step | 内容 |
|---|---|
| W1 | skill_name からフェーズ番号 N を抽出 |
| W1.5 | 進捗ファイルが存在するか確認する。存在しない場合、skill_name からワークフロー識別子を抽出し、対応する初期状態テンプレートで新規作成する |
| W2 | 進捗ファイルを Read で読み込み、前フェーズ完了状態を確認する（W1.5 で新規作成した場合はこのチェックをスキップする） |
| W3 | 成果物の存在確認（expected_artifacts が changes_dir に存在し1byte以上） |
| W4 | ステータステーブルの該当フェーズ行を `✅ 完了` + 完了日時に更新 |
| W5 | フェーズ詳細セクションを追記（状態・完了日時・skill_name・成果物一覧） |

W1.5〜W3 のいずれかで FAIL → フロー中断、ユーザーに即通知。
W4 以降は全項目 PASS の場合のみ実行する。

## 各 Step の詳細

### W1. フェーズ番号抽出
- skill_name に正規表現 `phase(\d+)` を適用してフェーズ番号 N を抽出

### W1.5. 進捗ファイル新規作成
- `progress_file_path` のファイルが存在するか確認する
- **存在する場合:** 本 Step は何もせず W2 へ進む（既存動作を変更しない）
- **存在しない場合:** 以下を実行する
  1. skill_name に正規表現 `^fs-([a-z]+)-phase\d+` を適用し、ワークフロー識別子（キャプチャグループ1）を抽出する
  2. 抽出できない場合 → FAIL（理由: `skill_name '{skill_name}' が命名規則 'fs-{WF名}-phase{N}-{名称}' に合致せず、新規作成に必要なワークフロー識別子を抽出できない`）
  3. 抽出したワークフロー識別子が `planning` / `design` / `impl` / `reverse` / `change` / `bugfix` / `refactoring` のいずれにも該当しない場合 → FAIL（理由: `ワークフロー識別子 '{WF名}' は既知の7ワークフローのいずれにも該当しない`）
  4. 該当した場合、`skills/using-aide-powers/references/progress-file-format.md` §7（WF別の初期状態テンプレートとフェーズマッピング）の該当セクションを参照し、そのワークフローの全フェーズ一覧を取得する
  5. 同ファイル §3.1（基本フォーマット）に従い、取得した全フェーズを `⬜ 未着手` / 完了日時 `—` としたステータステーブルを構築する（見出し `# {ワークフロー表示名} 進捗` を付与）。ワークフロー識別子が `refactoring` の場合は §4.1（リファクタリングWF用の拡張）に従いテスト結果列を追加し、値は `—` とする
  6. Write で `progress_file_path` に新規ファイルを作成する
- 新規作成の成否に関わらず、以降 W2 へ進む（新規作成失敗時は上記 FAIL によりフロー中断）

### W2. 進捗ファイル確認＋前フェーズ完了状態チェック
- W1.5 で新規作成した場合: 本チェックをスキップし、W3 へ進む（新規作成直後は全フェーズ `⬜ 未着手` であり、前フェーズの実績を機械的に検証できないため）
- W1.5 で新規作成しなかった場合（既存ファイルが存在した場合）: 従来通り以下を実行する
  - 進捗ファイルを Read で読み込む
  - 進捗ファイル上、前フェーズ（N-1）が `✅ 完了` または `🔧 修正中` であることを確認する。未完了（`⬜ 未着手` / `🔧 作業中`）のまま現フェーズを完了させようとしている → FAIL
  - N = 1 の場合は前フェーズチェックをスキップ

### W3. 成果物の存在確認
- expected_artifacts の各ファイルが `changes_dir` 内に存在するか確認する。1つでも欠落 → FAIL
- ファイルが存在し1文字以上の内容があれば PASS。内容の品質は本チェックの対象外（QAレビューアーの責務）
```

### 変更理由
bug-analysis.md の原因分析（原因箇所: `agents/progress-updater.md` write モード実行フロー W1〜W5）が指摘する通り、write モードは既存ファイルの「更新」のみを前提としており、ファイル不在時の新規作成手順が定義されていなかった。W1.5 を新設して不在時の新規作成を明示化し、W2 に「新規作成時はスキップ」の分岐を追加することで、W2 の前フェーズ完了チェックと新規作成処理が論理的に矛盾しないようにした。これにより bug-report.md の症状（Phase1 の前処理または後処理で進捗ファイルが作成されないことがある）の原因そのもの（新規作成の担当者・手順が誰にも定義されていない状態）を除去する。

## 変更対象2: agents/kiro/progress-updater.md（Kiro IDE配布用・同期対象）

### before
変更対象1の before と完全に同一内容（フロントマターに `tools: ["@builtin"]` が追加されている点のみ差分があり、write モードの実行フロー本文は agents/progress-updater.md と一字一句同一）。

### after
変更対象1の after と完全に同一内容を反映する（フロントマターの `tools: ["@builtin"]` は変更しない）。

### 変更理由
program-structure.md の記載通り、`agents/progress-updater.md`（正本）・`agents/kiro/progress-updater.md`・`agents/kiro/prompts/progress-updater-prompt.md`・`.kiro/agents/progress-updater.md` の4ファイルは同一内容を保つ必要がある同期ファイル群である。実際に4ファイルを Read で確認した結果、write モードの本文は完全に一致していることを確認済み。正本の変更を機械的に同期させることで、Kiro IDE 環境で本バグ修正が反映されない事態を防ぐ。

---

## 変更対象3: agents/kiro/prompts/progress-updater-prompt.md（Kiro CLI配布用・同期対象）

### before
変更対象1の before と完全に同一内容（フロントマターが存在せず、本文が `あなたは「進捗アップデーター」です。` から直接始まる点のみ構造差分があり、write モードの実行フロー本文は同一）。

### after
変更対象1の after と完全に同一内容を反映する（フロントマターなしの構造は変更しない）。

### 変更理由
変更対象2と同様。Kiro CLI は本ファイルを JSON 定義（`progress-updater.json`）の `"prompt": "file://./prompts/progress-updater-prompt.md"` 経由で参照するため、本ファイルを同期しない場合 Kiro CLI 環境でのみ修正が反映されない状態になる。

---

## 変更対象4: .kiro/agents/progress-updater.md（ワークスペース配布済みコピー・同期対象）

### before
変更対象1の before と完全に同一内容（フロントマターに `tools: ["@builtin"]` が含まれる点は変更対象2と同じ構造）。

### after
変更対象1の after と完全に同一内容を反映する。

### 変更理由
本ファイルは setup.bat / setup-local.bat によってワークスペースへ配布済みの実行時コピーである。正本（変更対象1）のみを修正して本ファイルを同期しない場合、次回の再デプロイまで本バグ修正が現在のワークスペースの実行環境に反映されず、動作確認（リグレッションテスト）自体が実施不可能になる。
