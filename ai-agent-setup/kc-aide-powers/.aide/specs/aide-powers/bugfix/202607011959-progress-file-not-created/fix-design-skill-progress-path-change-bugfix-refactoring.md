# バグ修正差分設計（分割: 修正スコープ2 — 変更WF・バグ修正WF・リファクタリングWF 9ファイル）

> 本ファイルは fix-design.md の分割ファイルです。動的パスWF（変更WF・バグ修正WF・リファクタリングWF）のSKILL.md後処理に `progress_file_path` の明示指定を追加します。これらのWFは folder-merge-check によりフォルダパスが実行中に動的に変わりうるため、静的パスWF（企画/設計/実装/設計逆引き）とは異なり「どのStepで確定したパスを使うか」を明示する必要があります。

## 設計方針

- 変更WFの既存記述パターン（`fs-change-phase1-analysis/SKILL.md` の既存記述: 「呼び出し時に progress_file_path=`{changes_dir}/change-progress.md`（Step 6 で確定した changes_dir を使用）を渡す」）を、他の動的パスWFのフェーズに同一形式で適用する
- 各WFのフォルダ確定Stepを Read で確認済み:
  - 変更WF（fs-change-phase2-impl）: changes_dir は phase1 の Step6 で確定済みの値を Input from caller として引き継ぐ（本フェーズ内で新規確定しない）
  - バグ修正WF: bugfix_dir は phase1 の Step7（フォルダ統合判定）で確定
  - リファクタリングWF: refactoring_dir は phase1 の Step2（セーフティネット基準の記録時に確定。以降 phase2〜7 は引き継ぐのみ）。phase2 のみ Step2（フォルダ統合判定）で再確定される可能性がある（起因元フォルダがある場合）

## 対象ファイル1: skills/fs-change-phase2-impl/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{changes_dir}/change-progress.md`（phase1 Step 6 で確定した changes_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査で、変更WFのうち fs-change-phase1-analysis のみ明示指定済み、fs-change-phase2-impl は欠落していることが判明した。fix-plan.md の修正方針に従い、フェーズ1の既存記述パターン（`{changes_dir}/change-progress.md`（Step 6 で確定した changes_dir を使用））をフェーズ2に適用する。フェーズ2では changes_dir を新規確定せず phase1 から引き継ぐのみであるため、「phase1 Step 6 で確定した」と明記した。

## 対象ファイル2: skills/fs-bugfix-phase1-analysis/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{bugfix_dir}/bugfix-progress.md`（Step 7 で確定した bugfix_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
本フェーズは Step 7（フォルダ統合判定）で `bugfix_dir` を確定させる構成であり、folder-merge-check によってパスが動的に変わりうる。明示指定を追加することで、後処理実行時にどの bugfix_dir を使うべきかがオーケストレータの記憶・コンテキストに依存する状態を解消し、誤ったパスが渡されるリスクを低減する。本バグの主要な発生条件（フォルダ統合が関与するケース）に直接対応する修正である。

## 対象ファイル3: skills/fs-bugfix-phase2-impl/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{bugfix_dir}/bugfix-progress.md`（phase1 Step 7 で確定した bugfix_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
本フェーズは bugfix_dir を新規確定せず phase1 から Input from caller で引き継ぐのみである。対象ファイル2と同一の bugfix_dir を用いるため「phase1 Step 7 で確定した」と明記した。

## 対象ファイル4: skills/fs-refactoring-phase1-status/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（Step 2 で確定した refactoring_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
本フェーズは Step 2（セーフティネット基準の記録）で `refactoring_dir` を確定させる唯一の確定点であり（program-structure.md および本スキルの Integration セクションに「refactoring_dir の確定（命名・フォルダ作成）は本フェーズ（phase1）で1回だけ行い、phase2〜7 はこの値を Input from caller で引き継ぐ」と明記されている）、folder-merge-check によってパスが動的に変わりうる。明示指定を追加することで誤ったパスが渡されるリスクを低減する。

## 対象ファイル5: skills/fs-refactoring-phase2-candidates/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（Step 2 で確定した refactoring_dir を使用。引き継ぎ経路（Step2実行なし）の場合は phase1 Step2 で確定した refactoring_dir を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
既存のfix-design.mdで確定済みの記述内容（旧スコープ時に作成）をそのまま維持する。本フェーズは通常経路では Step2（フォルダ統合判定）で refactoring_dir が再確定される可能性があり、引き継ぎ経路（refactoring-request.md あり）では Step2 自体がスキップされるため、その場合は phase1 Step2 で確定済みの refactoring_dir を使う必要がある旨を明記した。これにより、フォルダ統合が発生するケースで誤った progress_file_path が渡され進捗ファイルが正しいフォルダに作成されないリスクを低減する。

## 対象ファイル6: skills/fs-refactoring-phase3-plan/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
本フェーズは refactoring_dir を新規確定せず、phase1（および phase2 でフォルダ統合があった場合はその確定値）から引き継ぐのみである。Integration セクションの Input from caller にも「refactoring_dir: phase1 Step2 で確定済みの refactoring_dir（本フェーズでは引き継ぐのみ。新規確定しない）」と明記されている。この引き継ぎ関係を明示指定に反映した。

## 対象ファイル7: skills/fs-refactoring-phase4-design/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル6と同様。本フェーズはQA REJECTED修正ループ（Step3〜4）や却下・中止分岐（Step2）を持つが、通常完了時の後処理は1箇所のみであり、そこに明示指定を追加する。

## 対象ファイル8: skills/fs-refactoring-phase5-impl/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル6と同様。

## 対象ファイル9: skills/fs-refactoring-phase6-doc/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`{refactoring_dir}/refactoring-progress.md`（phase1 Step 2 で確定した refactoring_dir を使用。phase2 でフォルダ統合が発生した場合はその確定値を使用）を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル6と同様。本フェーズはリファクタリングWFの最終フェーズ手前（fs-refactoring-phase7-final-check の前段）であり、doc-sync による設計書反映後の後処理で `phase-report-check (write)` が1回呼ばれる。git コミットは本フェーズでは行わず phase7 でまとめて実行されるが、`phase-report-check (write)` の呼び出しには影響しない。
