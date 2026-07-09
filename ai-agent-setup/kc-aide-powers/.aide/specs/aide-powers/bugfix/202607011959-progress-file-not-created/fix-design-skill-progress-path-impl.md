# バグ修正差分設計（分割: 修正スコープ2 — 実装WF 6ファイル）

> 本ファイルは fix-design.md の分割ファイルです。実装WF（fs-impl-phase1〜6）のSKILL.md後処理に `progress_file_path` の明示指定を追加します。実装WFの進捗ファイルパスは静的パス `.aide/specs/{feature_name}/impl-progress.md` です。

## 設計方針

- 変更WFの既存記述パターンと同一形式で明示指定を追加する
- 実装WFは各フェーズコミット型であり、後処理内に `git-commit-workflow` 呼び出しも含むが、明示指定の挿入対象は `phase-report-check (write)` 呼び出し文のみである
- fs-impl-phase5-final-check は「レポート記載項目リスト」セクションを持つが、この項目リストへの `progress_file_path` 追加は不要（required_items は記載項目名のリストであり、呼び出しパラメータとは別概念のため）

## 対象ファイル1: skills/fs-impl-phase1-gate/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査で本ファイルが該当。fix-plan.md の修正方針に従い、変更WFの既存記述パターンに合わせて明示指定を追加する。本フェーズは設計書ゲート専用フェーズであり成果物のコミットはないため、`git-commit-workflow` は呼ばれないが `phase-report-check (write)` は通常通り呼ばれる。

## 対象ファイル2: skills/fs-impl-phase2-preparation/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル3: skills/fs-impl-phase3-gui-mockup/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズはGUI無し/スキップ/通常完了の3分岐（完了ステータス A/B/C）を持つが、いずれの分岐でも後処理は共通で実行されるため、明示指定は後処理1箇所で全分岐をカバーする。

## 対象ファイル4: skills/fs-impl-phase4-execution/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル5: skills/fs-impl-phase5-final-check/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に下記「レポート記載項目リスト」を required_items として渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
　進捗更新結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡し、下記「レポート記載項目リスト」を required_items として渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
　進捗更新結果(後処理):
```

### 変更理由
対象ファイル1と同様。本ファイルは既に `required_items` という別パラメータを渡す記述を持つため、既存記述文に `progress_file_path=` の指定を追加する形で挿入した（変更WFの基本パターンを維持しつつ、既存の他パラメータ受け渡し記述との共存を優先）。

## 対象ファイル6: skills/fs-impl-phase6-doc-generation/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/impl-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズは実装ワークフローの実質完了報告フェーズ（fs-impl-phase7-final-check は終了処理専用）であり、後処理で1回のみ `phase-report-check (write)` が呼ばれる。
