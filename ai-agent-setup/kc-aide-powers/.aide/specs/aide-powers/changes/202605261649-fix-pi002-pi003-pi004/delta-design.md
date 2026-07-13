# 差分設計書

## 変更概要

PI-002 + PI-003 + PI-004 + PI-007（REQ-C-004）の4件を一括修正する。
全てスキルファイル（Markdown）のテキスト修正。

---

## REQ-C-001: レベル構成記述の更新

### 対象ファイルと修正内容

各ファイルの delta-task-list.md ドキュメント構成セクションから「レベル別タスク一覧」を削除し、impl-task-planning の方式に置き換える。

#### Before（共通パターン）

各ファイルに以下のような記述がある:
```
### レベル別タスク一覧
- レベル0: 依存なし（並列実行可能）
- レベル1: レベル0に依存
- レベル2: レベル1に依存
```

#### After（共通パターン）

以下に置き換える:
```
### 依存関係グラフ

impl-task-planning (aide-powers skill) の方式に従う:
- 「レベル」の概念は使用しない
- 依存先が全て完了したタスクは即座に起動可能
- 最大並列度 = 依存先が全て完了済みの親タスクの数
- 各タスクに「依存先: なし」または「依存先: D-001, D-002」を明記
```

#### 対象ファイル

| # | ファイル | 該当セクション |
|---|---|---|
| 1 | skills/fs-change-phase7-task-planning/SKILL.md | delta-task-list.md ドキュメント構成 |
| 2 | skills/fs-change-phase6-task-planning/SKILL.md | 同上 |
| 3 | skills/fs-bugfix-phase4-design/SKILL.md | タスク分解セクション |
| 4 | skills/fs-refactoring-phase4-design/SKILL.md | タスク分解セクション |

---

## REQ-C-002: 非プログラム成果物の簡略サイクル追加

### 追加するセクション（共通）

fs-impl-phase4-execution から以下の2セクションを抽出し、各実装フェーズスキルに追加する:

```markdown
#### 成果物種別の判定（タスクサイクル開始前に実施）

各タスクのサイクルを開始する前に、成果物がプログラムコードか非プログラム成果物かを判定する。

**判定基準（内容ベース）:**

| 種別 | 定義 | 例 |
|---|---|---|
| プログラムコード | プログラミング言語で書かれた、コンパイルまたはインタプリタで実行されるソースコード | .py, .ts, .js, .java, .go 等のソースファイル |
| 非プログラム成果物 | 実行されるロジックを含まないファイル | 設定ファイル(.json, .yaml, .toml)、ドキュメント(.md, .html)、データ定義、テンプレート、静的ファイル(.css, .ico) |

**判定方法:**
1. タスクの設計書参照セクションから対象ファイルの種別を確認する
2. 実際のファイル内容から、実行されるロジックを含むかを確認する
3. 判断に迷う場合はプログラムコードとして扱う（安全側に倒す）

**非プログラム成果物と判定した場合:**
- 簡略サイクルを適用する: 実装 → 設計準拠レビューのみ → 完了
- 品質レビュー（code-review-agent）: スキップ
- テスト作成・テストレビュー・テスト実行: スキップ
- 判定理由を進捗に明記する（理由なき簡略化を禁止）

#### 非プログラム成果物の簡略サイクル

**Step 1:** 成果物種別判定 — 非プログラム成果物と判定（理由を記録）
**Step 2:** 実装 — micro-impl-agent（mode: implement）に委譲
**Step 3:** 設計準拠レビューのみ — design-review-agent（mode: implementation）に委譲
  - PASS → Step 4へ
  - FAIL → micro-impl-agent（mode: fix）で修正 → Step 3 再実行
**Step 4:** タスク完了
```

### 対象ファイルと挿入位置

| # | ファイル | 挿入位置 |
|---|---|---|
| 5 | skills/fs-change-phase8-impl/SKILL.md | タスク実行ループセクション内（通常サイクルの前） |
| 6 | skills/fs-change-phase7-impl/SKILL.md | 同上 |
| 7 | skills/fs-bugfix-phase5-impl/SKILL.md | 同上 |
| 8 | skills/fs-refactoring-phase5-impl/SKILL.md | 同上 |

---

## REQ-C-003: 工程チェック表生成手順の追加

### impl-task-planning への追加

impl-task-planning/SKILL.md には既に「工程チェック表の生成（必須）」セクションが存在する。
追加不要（既に定義済み）。

### 各フェーズスキルへの追加

各フェーズスキルのタスク分解ステップに以下の1行を追加する:

```markdown
- impl-task-planning (aide-powers skill) の「工程チェック表の生成（必須）」に従い、`impl-process-checklist.md` を生成する
```

### 対象ファイルと挿入位置

| # | ファイル | 挿入位置 |
|---|---|---|
| 9 | skills/fs-change-phase5-delta-design/SKILL.md | タスク分解ステップの末尾 |
| 10 | skills/fs-change-phase4-delta-design/SKILL.md | 同上（旧番号体系） |
| 11 | skills/fs-change-phase7-task-planning/SKILL.md | タスク分解ステップの末尾（REQ-C-001と同じファイル） |
| 12 | skills/fs-change-phase6-task-planning/SKILL.md | 同上（旧番号体系） |
| 13 | skills/fs-bugfix-phase4-design/SKILL.md | タスク分解ステップの末尾（REQ-C-001と同じファイル） |
| 14 | skills/fs-refactoring-phase4-design/SKILL.md | タスク分解ステップの末尾（REQ-C-001と同じファイル） |
| 15 | skills/fs-impl-phase2-preparation/SKILL.md | タスク分解ステップの末尾 |

---

## REQ-C-004: history.md 常に必須化

### fs-bugfix-phase6-doc/SKILL.md の修正

#### Before

成果物テーブル:
```markdown
| history.md | {設計書フォルダ}/history.md | 不具合修正エントリの追記（フォルダ統合済みの場合のみ） |
```

Step 1 の history.md 指示:
```markdown
- history.md 指示:
  - フォルダ統合済み → 不具合修正エントリを追記
  - フォルダ統合なし → history.md の作成・更新は不要
```

完了条件:
```markdown
| 3 | history.md 更新完了 | フォルダ統合済みの場合、history.md に不具合修正エントリが追記されている |
```

#### After

成果物テーブル:
```markdown
| history.md | {bugfix_dir}/history.md | 不具合修正エントリの追記（常に必須） |
```

Step 1 の history.md 指示:
```markdown
- history.md 指示: 常に不具合修正エントリを追記する（フォルダ統合の有無に関わらず必須）
  - history.md が存在する場合: 末尾に追記
  - history.md が存在しない場合: 新規作成
```

完了条件:
```markdown
| 3 | history.md 更新完了 | bugfix_dir 内の history.md に不具合修正エントリが追記されている |
```

---

## 修正対象ファイル一覧（重複除去）

| # | ファイル | 対応REQ |
|---|---|---|
| 1 | skills/fs-change-phase7-task-planning/SKILL.md | C-001, C-003 |
| 2 | skills/fs-change-phase6-task-planning/SKILL.md | C-001, C-003 |
| 3 | skills/fs-bugfix-phase4-design/SKILL.md | C-001, C-003 |
| 4 | skills/fs-refactoring-phase4-design/SKILL.md | C-001, C-003 |
| 5 | skills/fs-change-phase8-impl/SKILL.md | C-002 |
| 6 | skills/fs-change-phase7-impl/SKILL.md | C-002 |
| 7 | skills/fs-bugfix-phase5-impl/SKILL.md | C-002 |
| 8 | skills/fs-refactoring-phase5-impl/SKILL.md | C-002 |
| 9 | skills/fs-change-phase5-delta-design/SKILL.md | C-003 |
| 10 | skills/fs-change-phase4-delta-design/SKILL.md | C-003 |
| 11 | skills/fs-impl-phase2-preparation/SKILL.md | C-003 |
| 12 | skills/fs-bugfix-phase6-doc/SKILL.md | C-004 |
