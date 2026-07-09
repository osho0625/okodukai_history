# バグ修正差分設計（分割: 修正スコープ2 — 企画WF 3ファイル）

> 本ファイルは fix-design.md の分割ファイルです。企画WF（fs-planning-phase1〜3）のSKILL.md後処理に `progress_file_path` の明示指定を追加します。企画WFの進捗ファイルパスは静的パス `.aide/specs/{feature_name}/planning-progress.md` です（specs_dir が実行中に変化しないため、Step確定作業は不要）。

## 設計方針

- 変更WF（`skills/fs-change-phase1-analysis/SKILL.md`）に既に存在する記述パターンと同一の形式で追加する: `呼び出し時に progress_file_path=`{path}`を渡す。`
- 各ファイルの後処理内、`phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。` の直後（同一文の中）に明示指定を挿入する
- 静的パスWFのため「Step Nで確定した」という注記は付けず、そのまま `.aide/specs/{feature_name}/planning-progress.md` を明示する

## 対象ファイル1: skills/fs-planning-phase1-intake-and-init/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査（33ファイル）で本ファイルが該当。fix-plan.md の修正方針に従い、変更WFの既存記述パターンに合わせて明示指定を追加する。企画WFは specs_dir が静的であり folder-merge-check の対象外だが、暗黙の前提を明示化する一貫性の観点から修正スコープに含める。

## 対象ファイル2: skills/fs-planning-phase2-explore/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本ファイルは探索サイクルのループ（Step7）中にも `git-commit-workflow` を呼ぶが、`phase-report-check (write)` の呼び出しは後処理のみであるため、後処理1箇所のみに追加する。

## 対象ファイル3: skills/fs-planning-phase3-finalize/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/planning-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本ファイルは企画WFの最終フェーズ（final-check の前段）であり、`phase-report-check (write)` は後処理でのみ呼ばれる。修正履歴クローズ処理（fix_close）は本修正の対象外（write モードのみが対象）。
