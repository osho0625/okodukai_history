# 差分設計書

## 変更概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606292100-task-list-row-key-subtask-rule |
| CR数 | 2（CR-001: 行キー生成ルール追記 / CR-002: 冗長コピー削除・参照切り替え） |
| 変更対象ファイル数 | 6 |
| 新規追加ファイル | なし |
| 削除ファイル | 1 |

---

## CR-001: 行キー生成ルール追記

### 変更1-1: skills/fs-change-phase2-impl/change-task-planner-prompt.md

**変更箇所:** ステップ6（impl-process-checklist.md 生成）セクション

#### before

```markdown
#### ステップ6: impl-process-checklist.md 生成

タスクリストの全タスクに対して工程チェック表を生成する。
フォーマットは impl-task-planning スキルの「工程チェック表の生成」セクションに従う。
```

#### after

```markdown
#### ステップ6: impl-process-checklist.md 生成

タスクリストの全タスクに対して工程チェック表を生成する。
フォーマットは impl-task-planning スキルの「工程チェック表の生成」セクションに従う。

**行キー生成ルール:**
工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る。
- サブタスクがある親タスク: 各サブタスクのIDで行キーを生成する（例: 1.1::implement, 1.2::implement）
  - 親タスクID（例: 1）単体では行キーを作らない
- サブタスクがない親タスク: 親タスクIDで行キーを生成する（例: 0.3::implement）
```

---

### 変更1-2: skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md

**変更箇所:** ステップ6（impl-process-checklist.md 生成）セクション

#### before

```markdown
#### ステップ6: impl-process-checklist.md 生成

タスクリストの全タスクに対して工程チェック表を生成する。
フォーマットは impl-task-planning スキルの「工程チェック表の生成」セクションに従う。
```

#### after

```markdown
#### ステップ6: impl-process-checklist.md 生成

タスクリストの全タスクに対して工程チェック表を生成する。
フォーマットは impl-task-planning スキルの「工程チェック表の生成」セクションに従う。

**行キー生成ルール:**
工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る。
- サブタスクがある親タスク: 各サブタスクのIDで行キーを生成する（例: 1.1::implement, 1.2::implement）
  - 親タスクID（例: 1）単体では行キーを作らない
- サブタスクがない親タスク: 親タスクIDで行キーを生成する（例: 0.3::implement）
```

---

### 変更1-3: skills/impl-task-planning/impl-planner-prompt.md

**変更箇所:** ステップ7（工程チェック表の生成）セクション冒頭部

#### before

```markdown
### ステップ7: 工程チェック表の生成（必須）

タスクリスト（impl-task-list.md）の生成と同時に、`{specs_dir}/impl-process-checklist.md`（工程チェック表）を生成する。これは fs-impl-phase4-execution (aide-powers skill) が各タスクの工程漏れを防ぐためのチェック表である。

- 工程チェック表は **「1 工程 = 1 行」構造**で生成する（1 タスク × 各工程を 1 行ずつ）。生成手順・行構成（プログラムコードタスクは 実装 / テスト実装 / テスト実行 / 設計準拠レビュー / コード品質レビュー の 5 工程行。非プログラム成果物は 実装・設計準拠レビューを実工程行とし、残りを `➖ skip` 行とする）・行キー（`{task_id}::{工程キー}`）・状態記号（`⬜ todo` / `🔄 in-progress` / `✅ done` / `❌ failed` / `➖ skip`）・「状態 / 実行エージェント / output」形式・担当本人による 3 段階更新・ホワイトリスト監査ルールは、`aide-powers:impl-task-planning` スキルの「工程チェック表の生成（必須）」セクションに従うこと
```

#### after

```markdown
### ステップ7: 工程チェック表の生成（必須）

タスクリスト（impl-task-list.md）の生成と同時に、`{specs_dir}/impl-process-checklist.md`（工程チェック表）を生成する。これは fs-impl-phase4-execution (aide-powers skill) が各タスクの工程漏れを防ぐためのチェック表である。

- 工程チェック表は **「1 工程 = 1 行」構造**で生成する（1 タスク × 各工程を 1 行ずつ）。生成手順・行構成（プログラムコードタスクは 実装 / テスト実装 / テスト実行 / 設計準拠レビュー / コード品質レビュー の 5 工程行。非プログラム成果物は 実装・設計準拠レビューを実工程行とし、残りを `➖ skip` 行とする）・行キー（`{task_id}::{工程キー}`）・状態記号（`⬜ todo` / `🔄 in-progress` / `✅ done` / `❌ failed` / `➖ skip`）・「状態 / 実行エージェント / output」形式・担当本人による 3 段階更新・ホワイトリスト監査ルールは、`aide-powers:impl-task-planning` スキルの「工程チェック表の生成（必須）」セクションに従うこと

**行キー生成ルール:**
工程チェック表の行キーはサブタスクID単位で生成し、サブタスクがないタスクのみ親タスクIDで行を作る。
- サブタスクがある親タスク: 各サブタスクのIDで行キーを生成する（例: 1.1::implement, 1.2::implement）
  - 親タスクID（例: 1）単体では行キーを作らない
- サブタスクがない親タスク: 親タスクIDで行キーを生成する（例: 0.3::implement）
```

---

## CR-002: 冗長コピー削除・参照切り替え

### 変更2-1: skills/fs-impl-phase2-preparation/impl-planner-prompt.md

**操作:** ファイル削除

#### before

ファイルが存在する（`skills/impl-task-planning/impl-planner-prompt.md` とほぼ同一内容の冗長コピー）

#### after

ファイルが存在しない（削除）

---

### 変更2-2: skills/fs-impl-phase2-preparation/SKILL.md

**変更箇所A:** Step 3 のプロンプト参照記述

#### before

```markdown
・本スキルディレクトリの `impl-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"タスクリスト生成エージェントの出力(Step3):"として記載する。その記載内容から、次の項目を判断して記載する
```

#### after

```markdown
・`skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"タスクリスト生成エージェントの出力(Step3):"として記載する。その記載内容から、次の項目を判断して記載する
```

---

**変更箇所B:** Step 4 のプロンプト参照記述（修正ループ時）

#### before

```markdown
- "タスクリスト承認のユーザー判断(Step4):"が修正要求の場合 → フィードバック内容を補い `impl-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行してタスクリストを修正し、修正後 Step4 を再実行する
```

#### after

```markdown
- "タスクリスト承認のユーザー判断(Step4):"が修正要求の場合 → フィードバック内容を補い `skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行してタスクリストを修正し、修正後 Step4 を再実行する
```

---

**変更箇所C:** Step 3 の状態判定セクション（NEEDS_CONTEXT 時の再実行記述）

#### before

```markdown
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `impl-planner-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
```

#### after

```markdown
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `skills/impl-task-planning/impl-planner-prompt.md`（共通スキル配下）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
```

---

**変更箇所D:** Integration セクションのプロンプトテンプレート一覧

#### before

```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `env-builder-prompt.md` — Step 2（開発環境の構築）
- `impl-planner-prompt.md` — Step 3（タスクリスト生成・工程チェック表生成）
- `test-doc-initializer-prompt.md` — Step 5（動作確認試験書の空テンプレート作成）
```

#### after

```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `env-builder-prompt.md` — Step 2（開発環境の構築）
- `test-doc-initializer-prompt.md` — Step 5（動作確認試験書の空テンプレート作成）

**プロンプトテンプレート（共通スキル参照）:**
- `skills/impl-task-planning/impl-planner-prompt.md` — Step 3（タスクリスト生成・工程チェック表生成）
```

---

## 更新が必要な設計資料

### `.aide/specs/aide-powers/program-structure.md` — `fs-impl-phase2-preparation` セクション

**変更箇所:** プロンプトテンプレート行

#### before

```markdown
- プロンプトテンプレート: `env-builder-prompt.md`（Step2）, `impl-planner-prompt.md`（Step3）, `test-doc-initializer-prompt.md`（Step5）
```

#### after

```markdown
- プロンプトテンプレート: `env-builder-prompt.md`（Step2）, `test-doc-initializer-prompt.md`（Step5）
- 共通スキル参照: `skills/impl-task-planning/impl-planner-prompt.md`（Step3）
```

---

## 整合性確認

| 確認項目 | 結果 |
|---|---|
| CR-001 追記ルールと impl-task-planning SKILL.md 既存定義の整合性 | ✅ 整合（既存定義 `{task_id}::{工程キー}` のサブタスクID適用を明示化したもの） |
| CR-002 参照パス変更後の呼び出しロジック整合性 | ✅ 整合（プレースホルダー置換→サブエージェント実行のフローは不変、参照先パスのみ変更） |
| CR-001 の3ファイル間での追記内容の一貫性 | ✅ 一貫（同一ルール文を追記） |
| program-structure.md 更新内容と CR-002 変更2-2D の整合性 | ✅ 整合（SKILL.md の Integration セクション変更と program-structure.md のプロンプトテンプレート行変更が同一方針） |

---

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
