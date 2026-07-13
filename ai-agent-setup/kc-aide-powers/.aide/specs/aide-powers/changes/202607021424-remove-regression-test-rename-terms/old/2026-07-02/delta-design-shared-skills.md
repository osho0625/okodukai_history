# 差分設計: 共通スキル4件（impl-coding-standards, multi-stage-code-review, test-review, impl-task-planning）

対象ファイル: `skills/impl-coding-standards/SKILL.md`, `skills/multi-stage-code-review/SKILL.md`, `skills/test-review/SKILL.md`, `skills/impl-task-planning/SKILL.md`（計4件、既存変更）

## 1. skills/impl-coding-standards/SKILL.md

### 1-1. mode: run_test（テスト実行）の Step 1 — テスト実行コマンド組み立て手順から全体リグレッションを削除

**before:**
```
### mode: run_test（テスト実行）

**Step 1:** テスト実行コマンドを組み立てる
- dev-environment.md に記載されたテスト実行コマンドに従い、「対象テスト」と「全体リグレッションテスト」の2種類のコマンドを必ず両方実行する
- 対象テスト: dev-environment.md の「単一テストファイル実行コマンド」
- 全体リグレッション: dev-environment.md の「全テスト実行コマンド」
- ※ 仮想環境の使用有無・パスは dev-environment.md に従う
- ※ 片方だけの実行（対象テストのみ等）を禁止する。必ず両方実行する
- ※ dev-environment.md にテスト実行コマンドが記載されていない場合は NEEDS_CONTEXT で報告する

**Step 2:** テストを実行し結果を判定する
- 対象テスト・全体リグレッションの両方が全パス → Step 3（完了報告）へ
- いずれかで失敗あり → 原因判定:
  - 外部ライブラリ起因（sherpa-onnx, onnxruntime, psutil 等のAPI不一致、環境依存エラー）→ リトライせず即報告
  - 実装またはテストの問題 →
    - 修正後は「該当レビューを再実行してから」テストを再実行する
    - 実装を修正した場合 → design-review-agent (aide-powers agent) / code-review-agent (aide-powers agent)（implementation モード）を再実行
    - テストを修正した場合 → design-review-agent (aide-powers agent) / code-review-agent (aide-powers agent)（test モード）を再実行
    - レビュー再実行は micro-impl-agent (aide-powers agent) の責務外のため、呼び出し元に「修正後はレビューに戻る」ことを報告する
    - レビュー再実行後、テストを再実行（最大3回）
    - 3回修正しても解決しない場合は報告

**Step 3:** 完了報告
- 「全5モードの報告テンプレート」の mode: run_test テンプレートに従って報告する
- 「対象テスト」と「全体リグレッションテスト」の結果を別々に記載する
- ステータス（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）は「ステータス運用ルール」に従って選択する
```

**after:**
```
### mode: run_test（テスト実行）

**Step 1:** テスト実行コマンドを組み立てる
- dev-environment.md に記載された「単一テストファイル実行コマンド」を使用し、ユニットテストを実行する
- ※ 仮想環境の使用有無・パスは dev-environment.md に従う
- ※ dev-environment.md にテスト実行コマンドが記載されていない場合は NEEDS_CONTEXT で報告する

**Step 2:** テストを実行し結果を判定する
- ユニットテストが全パス → Step 3（完了報告）へ
- 失敗あり → 原因判定:
  - 外部ライブラリ起因（sherpa-onnx, onnxruntime, psutil 等のAPI不一致、環境依存エラー）→ リトライせず即報告
  - 実装またはテストの問題 →
    - 修正後は「該当レビューを再実行してから」テストを再実行する
    - 実装を修正した場合 → design-review-agent (aide-powers agent) / code-review-agent (aide-powers agent)（implementation モード）を再実行
    - テストを修正した場合 → design-review-agent (aide-powers agent) / code-review-agent (aide-powers agent)（test モード）を再実行
    - レビュー再実行は micro-impl-agent (aide-powers agent) の責務外のため、呼び出し元に「修正後はレビューに戻る」ことを報告する
    - レビュー再実行後、テストを再実行（最大3回）
    - 3回修正しても解決しない場合は報告

**Step 3:** 完了報告
- 「全5モードの報告テンプレート」の mode: run_test テンプレートに従って報告する
- ユニットテストの結果を記載する
- ステータス（DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED）は「ステータス運用ルール」に従って選択する
```

**変更理由**: REQ-C-001・REQ-C-003。タスク単位の実装ループ内での全体リグレッションテスト実行を廃止する（動作確認Stepの regression-test-prompt.md に一本化）。「対象テスト」という用語を廃し「ユニットテスト」に統一する。

### 1-2. テスト実行ルール（mode: run_test）セクション全体の更新

**before:**
```
## テスト実行ルール（mode: run_test）

**使用フレームワーク:**

- `dev-environment.md` に記載されたテストフレームワーク・テスト実行コマンドに従う
- dev-environment.md にテスト実行コマンドが記載されていない場合は NEEDS_CONTEXT で報告する

**テスト実行コマンド（必須: 対象テスト + 全体リグレッションの2本立て）:**

`run_test` モードでは **必ず「対象テスト」と「全体リグレッションテスト」の両方を実行する。** どちらか片方だけの実行を禁止する。

- **対象テスト**: dev-environment.md に記載された「単一テストファイル実行コマンド」を使用する
- **全体リグレッションテスト**: dev-environment.md に記載された「全テスト実行コマンド」を使用する
- 仮想環境（venv等）の使用有無・パスは dev-environment.md の記述に従う
- グローバルにインストールされたツールを使用してよいかは dev-environment.md の記述に従う

**必須ルール（言語・フレームワーク非依存）:**
- `run_test` モードは **必ず両方（対象テスト + 全体リグレッションテスト）を実行する**。一方のみの実行で報告することを禁止する
- 具体的なコマンド・パス・オプションは全て `dev-environment.md` の記述に従う

**なぜ全体リグレッションも必要か:**

- 対象テストだけではデグレ（既存テストの破損）を検出できない
- 1ファイルの変更が他ファイルの挙動に影響する可能性は常にある
- 全体リグレッション通過を確認してはじめて「タスク完了」と言える

**失敗時の対応フロー:**

1. 対象テスト / 全体リグレッションテスト のいずれかで失敗
2. 原因判定:
   - 外部ライブラリ起因のAPI不一致・環境依存エラー（例: sherpa-onnx, onnxruntime, psutil 等）→ リトライせず即報告（実装修正で対応不可のため）
   - 実装またはテストの問題 → 修正 → 該当レビューを再実行 → テスト再実行（最大3回）
3. 修正後の「該当レビュー再実行」ルール（必須）:
   - 実装コードを修正した場合 → design-review-agent (aide-powers agent)（mode: implementation）+ code-review-agent (aide-powers agent)（mode: implementation）を呼び出し元に「再実行してからテストに戻る」ことを促す
   - テストコードを修正した場合 → design-review-agent (aide-powers agent)（mode: test）+ code-review-agent (aide-powers agent)（mode: test）を呼び出し元に「再実行してからテストに戻る」ことを促す
   - レビュー実行自体は micro-impl-agent (aide-powers agent) の責務外だが、修正後にレビューを飛ばして直接テストを再実行することを禁止する。呼び出し元に「修正後はレビューに戻る」ことを報告上で明示する
4. 結果:
   - 3回以内で解決 → 完了報告
   - 3回修正しても解決しない → 報告（pending-issues 登録を検討）

**補足: 全体リグレッション失敗の特別扱い:**

- 全体リグレッションで **対象タスク以外のテスト** が失敗した場合、本タスクの修正で直せる範囲を超える可能性がある
- このケースは「既存の設計・実装に影響する変更」が含まれている兆候なので、3回リトライに執着せず、早めに呼び出し元に報告する
- 必要に応じて `design-sync (aide-powers skill)` の起動を呼び出し元に委ねる
```

**after:**
```
## テスト実行ルール（mode: run_test）

**使用フレームワーク:**

- `dev-environment.md` に記載されたテストフレームワーク・テスト実行コマンドに従う
- dev-environment.md にテスト実行コマンドが記載されていない場合は NEEDS_CONTEXT で報告する

**テスト実行コマンド:**

- **ユニットテスト**: dev-environment.md に記載された「単一テストファイル実行コマンド」を使用する
- 仮想環境（venv等）の使用有無・パスは dev-environment.md の記述に従う
- グローバルにインストールされたツールを使用してよいかは dev-environment.md の記述に従う

**必須ルール（言語・フレームワーク非依存）:**
- `run_test` モードは対象タスクのユニットテストを実行する。具体的なコマンド・パス・オプションは全て `dev-environment.md` の記述に従う
- 既存テスト全実行（リグレッションテスト）は本モードでは実施しない。動作確認Step（各フェーズスキルの regression-test-prompt.md 経由）で1回実施する設計に統一されている

**失敗時の対応フロー:**

1. ユニットテストで失敗
2. 原因判定:
   - 外部ライブラリ起因のAPI不一致・環境依存エラー（例: sherpa-onnx, onnxruntime, psutil 等）→ リトライせず即報告（実装修正で対応不可のため）
   - 実装またはテストの問題 → 修正 → 該当レビューを再実行 → テスト再実行（最大3回）
3. 修正後の「該当レビュー再実行」ルール（必須）:
   - 実装コードを修正した場合 → design-review-agent (aide-powers agent)（mode: implementation）+ code-review-agent (aide-powers agent)（mode: implementation）を呼び出し元に「再実行してからテストに戻る」ことを促す
   - テストコードを修正した場合 → design-review-agent (aide-powers agent)（mode: test）+ code-review-agent (aide-powers agent)（mode: test）を呼び出し元に「再実行してからテストに戻る」ことを促す
   - レビュー実行自体は micro-impl-agent (aide-powers agent) の責務外だが、修正後にレビューを飛ばして直接テストを再実行することを禁止する。呼び出し元に「修正後はレビューに戻る」ことを報告上で明示する
4. 結果:
   - 3回以内で解決 → 完了報告
   - 3回修正しても解決しない → 報告（pending-issues 登録を検討）
```

**変更理由**: REQ-C-001・REQ-C-002・REQ-C-003。「対象テスト + 全体リグレッションの2本立て」ルールを廃止し、タスク単位の実装ループではユニットテストのみを実行する設計に統一する。全体リグレッション（既存テスト全実行）は動作確認Stepに一本化されることを明記する。全体リグレッション失敗の特別扱い（対象タスク以外のテスト失敗時の早期報告）は、全体リグレッション自体が本モードで実施されなくなるため削除する。用語も「対象テスト」→「ユニットテスト」に統一する。

### 1-3. 完了条件テーブル — run_test の完了条件を更新

**before（該当行）:**
```
| run_test | 対象テスト実行済み・**全体リグレッションテスト実行済み**・結果判定済み（両方全パス／失敗原因特定／外部ライブラリ起因の即報告／修正後はレビュー再実行を呼び出し元に促した）・報告出力済み（Status 付き） |
```

**after（該当行）:**
```
| run_test | ユニットテスト実行済み・結果判定済み（全パス／失敗原因特定／外部ライブラリ起因の即報告／修正後はレビュー再実行を呼び出し元に促した）・報告出力済み（Status 付き） |
```

**変更理由**: 上記1-1・1-2と整合させる。

### 1-4. 全5モードの報告テンプレート — mode: run_test 報告テンプレートの更新

**before:**
```
**mode: run_test 報告テンプレート:**

```markdown
## テスト実行報告
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- テストファイル: {パス}
- 対象テスト結果: 全{N}件パス / {M}件失敗
- 全体リグレッション結果: 全{N}件パス / {M}件失敗
- 状態: テスト完了 / 要修正
- 失敗時の原因（該当する場合）: 実装問題 / テスト問題 / 外部ライブラリ起因（リトライ不可）
- レビュー再実行の必要性（該当する場合）: 実装修正のため implementation モードのレビュー再実行が必要 / テスト修正のため test モードのレビュー再実行が必要
- 懸念事項 / 不足情報 / ブロック要因: （DONE 以外の場合に詳細を記載）
```
```

**after:**
```
**mode: run_test 報告テンプレート:**

```markdown
## テスト実行報告
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- テストファイル: {パス}
- ユニットテスト結果: 全{N}件パス / {M}件失敗
- 状態: テスト完了 / 要修正
- 失敗時の原因（該当する場合）: 実装問題 / テスト問題 / 外部ライブラリ起因（リトライ不可）
- レビュー再実行の必要性（該当する場合）: 実装修正のため implementation モードのレビュー再実行が必要 / テスト修正のため test モードのレビュー再実行が必要
- 懸念事項 / 不足情報 / ブロック要因: （DONE 以外の場合に詳細を記載）
```
```

**変更理由**: 上記1-1・1-2と整合させる。

### 1-5. Red Flags — 全体リグレッション関連の Red Flag を更新

**before（該当行）:**
```
| 14 | 「テスト実行で外部ライブラリエラーが出たから3回リトライしよう」 | 外部ライブラリ起因はリトライ不可。即報告する |
```

**after（該当行、変更なし。参考として周辺を確認したが本行自体は全体リグレッションの記述を含まないため変更不要）**

**確認結果**: Red Flags テーブルの各行を確認したが、「全体リグレッション」「対象テスト」の廃止対象記述に直接言及する行はなかったため、Red Flags テーブル自体の変更は不要。

### 1-6. ワークフロー別差異 — リファクタリング行の「既存テスト全実行（セーフティネット）」記述を更新

**before（該当行）:**
```
| リファクタリング | `refactoring-design.md`, `program-structure.md` | 既存規約の参照、過去不具合修正の保持、外部振る舞い保持の確認、既存テスト全実行（セーフティネット） |
```

**after（該当行）:**
```
| リファクタリング | `refactoring-design.md`, `program-structure.md` | 既存規約の参照、過去不具合修正の保持、外部振る舞い保持の確認 |
```

**変更理由**: REQ-C-001・REQ-C-002。既存テスト全実行（セーフティネット）はタスク単位の実装ループではなく動作確認Stepに一本化されるため、本スキル（タスク単位で呼ばれる micro-impl-agent 向けルール集）の「追加の観点」からは削除する。

---

## 2. skills/multi-stage-code-review/SKILL.md

### 2-1. Stage 3: Test Execution — 「既存テスト全実行（リグレッション確認）」記述を削除

**before:**
```
### Stage 3: Test Execution（テスト実行）

Stage 2 が全PASSした後、テストを実行する。

- 対象テストを実行し、全パスを確認する
- 変更・バグ修正・リファクタリングの場合: 既存テスト全実行（リグレッション確認）
- テスト失敗があれば修正 → 該当レビューを再実行 → テスト再実行
```

**after:**
```
### Stage 3: Test Execution（テスト実行）

Stage 2 が全PASSした後、テストを実行する。

- ユニットテストを実行し、全パスを確認する
- テスト失敗があれば修正 → 該当レビューを再実行 → テスト再実行
- 既存テスト全実行（リグレッションテスト）は本ステージでは実施しない。動作確認Step（各フェーズスキルの regression-test-prompt.md 経由）で1回実施する設計に統一されている
```

**変更理由**: REQ-C-001・REQ-C-002・REQ-C-003。変更・バグ修正・リファクタリングの各ワークフローにおいて1タスク完了ごとに実施されていた既存テスト全実行（リグレッション確認）を廃止し、動作確認Stepに一本化する旨を明記する。用語も「対象テスト」→「ユニットテスト」に統一する。

---

## 3. skills/test-review/SKILL.md

### 3-1. Process ステップ1 — workflow_context に応じた設計書参照先の切り替え（bugfix / refactoring 行）を更新

**before:**
```
- `workflow_context == "change"`:
  - delta-design.md + object-design-*.md からテスト観点を抽出
  - 過去不具合修正テストの保持検証を追加（bugfix/ 配下のテスト履歴を参照し、削除されていないか確認）
- `workflow_context == "bugfix"`:
  - fix-design.md + object-design-*.md からテスト観点を抽出
  - リグレッションテスト必須: bug-report.md の再現手順を再現するテストが存在するか確認
  - 既存テスト全パスの確認
- `workflow_context == "refactoring"`:
  - refactoring-design.md + object-design-*.md からテスト観点を抽出
  - 既存テスト全パス必須（セーフティネットの確認）
  - 外部振る舞い保持の確認（インターフェースレベルでのテスト変更有無を検出）
```

**after:**
```
- `workflow_context == "change"`:
  - delta-design.md + object-design-*.md からテスト観点を抽出
  - 過去不具合修正テストの保持検証を追加（bugfix/ 配下のテスト履歴を参照し、削除されていないか確認）
- `workflow_context == "bugfix"`:
  - fix-design.md + object-design-*.md からテスト観点を抽出
  - バグ再現テストの存在確認: bug-report.md の再現手順を再現するテストが対象タスクのテストファイルに存在するか確認
- `workflow_context == "refactoring"`:
  - refactoring-design.md + object-design-*.md からテスト観点を抽出
  - 外部振る舞い保持の確認（インターフェースレベルでのテスト変更有無を検出）
```

**変更理由**: REQ-C-001・REQ-C-002。本スキルはタスク単位のテストコードレビュー（design-review-agent / code-review-agent が `mode: test` で呼び出す）観点であり、「既存テスト全パスの確認」「セーフティネットの確認」（＝既存テスト全実行という動的な実行結果の確認）は動作確認Stepに一本化されたため、タスク単位のレビュー観点からは削除する。バグ修正の「リグレッションテスト必須」は、バグ再現テスト自体の存在確認（コードレビュー時の静的観点）として意味を残すため、「バグ再現テストの存在確認」に文言を修正して維持する（既存テスト全実行という動的実行の確認ではなく、テストコードにバグ再現ケースが書かれているかという静的観点）。

### 3-2. ワークフロー別差異テーブル — bugfix / refactoring 行の補足レビュー観点を更新

**before:**
```
| バグ修正ワークフロー | `fix-design.md` + `object-design-*.md` | **リグレッションテスト必須**。`bug-report.md` の再現手順に対応するテストの存在確認 | `bugfix` |
| リファクタリングワークフロー | `refactoring-design.md` + `object-design-*.md` | 既存テスト全パス必須（セーフティネット）。外部振る舞い保持の確認 | `refactoring` |
```

**after:**
```
| バグ修正ワークフロー | `fix-design.md` + `object-design-*.md` | `bug-report.md` の再現手順に対応するバグ再現テストの存在確認 | `bugfix` |
| リファクタリングワークフロー | `refactoring-design.md` + `object-design-*.md` | 外部振る舞い保持の確認 | `refactoring` |
```

**変更理由**: 上記3-1と整合させる。「リグレッションテスト必須」「既存テスト全パス必須（セーフティネット）」という実装ステップ内の毎回実行観点を廃止し、バグ再現テストの存在確認（静的観点）のみを維持する。

---

## 4. skills/impl-task-planning/SKILL.md

### 4-1. ワークフロー別差異テーブル — 「リグレッションテスト」行を更新

**before:**
```
| リグレッションテスト | なし | 変更・バグ修正WFでは必須 |
```

**after:**
```
| リグレッションテスト（既存テスト全実行） | なし | どのWFでも実装タスクとしては計画しない（動作確認Stepで1回実施する設計に統一） |
```

**変更理由**: REQ-C-001・REQ-C-002。変更・バグ修正WFで「リグレッションテスト: 必須」としてタスク分解対象に含めていた記述を廃止する。既存テスト全実行（リグレッションテスト）は動作確認Step（各フェーズスキルの regression-test-prompt.md 経由）に一本化されたため、タスク分解時点では計画不要である旨に修正する。
