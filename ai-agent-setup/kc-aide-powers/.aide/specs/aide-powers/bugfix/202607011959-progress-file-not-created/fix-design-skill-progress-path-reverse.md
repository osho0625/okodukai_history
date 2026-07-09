# バグ修正差分設計（分割: 修正スコープ2 — 設計逆引きWF 5ファイル）

> 本ファイルは fix-design.md の分割ファイルです。設計逆引きWF（fs-reverse-phase1〜5）のSKILL.md後処理に `progress_file_path` の明示指定を追加します。設計逆引きWFの進捗ファイルパスは静的パス `{specs_dir}/reverse-progress.md`（specs_dir=`.aide/specs/{feature_name}`）です。

## 設計方針

- 変更WFの既存記述パターンと同一形式で明示指定を追加する
- 設計逆引きWFは各フェーズコミット型であり、後処理内に `git-commit-workflow` 呼び出しも含むが、明示指定の挿入対象は `phase-report-check (write)` 呼び出し文のみである

## 対象ファイル1: skills/fs-reverse-phase1-program/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査で本ファイルが該当。fix-plan.md の修正方針に従い、変更WFの既存記述パターンに合わせて明示指定を追加する。本フェーズは3パス解析ループ（Step1〜4）を持つが、`phase-report-check (write)` の呼び出しはフェーズ全体の後処理1箇所のみである。

## 対象ファイル2: skills/fs-reverse-phase2-dev-env/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル3: skills/fs-reverse-phase3-system-req/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル4: skills/fs-reverse-phase4-user-req/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズは設計逆引きWFのコア完了（4ドキュメント揃う）タイミングだが、`phase-report-check (write)` の呼び出しは通常の後処理と同一形式である。

## 対象ファイル5: skills/fs-reverse-phase5-optional-phases/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズはオプションフェーズ（アーキテクチャ/オブジェクト設計/インフラIF/GUI設計）の順次実行ループを持ち、各オプション完了時（Step3）にも `git-commit-workflow` を個別に呼ぶが、`phase-report-check (write)` の呼び出しはフェーズ全体の後処理1箇所のみである。設計逆引きWFの最終フェーズ手前（fs-reverse-phase6-final-check の前段）にあたる。
