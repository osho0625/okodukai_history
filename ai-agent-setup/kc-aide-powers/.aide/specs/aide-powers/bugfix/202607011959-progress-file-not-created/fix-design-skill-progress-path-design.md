# バグ修正差分設計（分割: 修正スコープ2 — 設計WF 10ファイル）

> 本ファイルは fix-design.md の分割ファイルです。設計WF（fs-design-phase1〜10）のSKILL.md後処理に `progress_file_path` の明示指定を追加します。設計WFの進捗ファイルパスは静的パス `{specs_dir}/design-progress.md`（specs_dir=`.aide/specs/{feature_name}`）です。

## 設計方針

- 変更WFの既存記述パターンと同一形式で `phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。` の直後に `呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。` を挿入する
- fs-design-phase1〜10 は全て「通常モード（後処理を実行）」の後処理セクションのみが対象。fixモード（QAゲート差し戻し時）は後処理・コミットを実行せず呼び出し元に制御を戻すため、本修正の対象外（progress-updater への到達経路自体がない）

## 対象ファイル1: skills/fs-design-phase1-user-req/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
bug-analysis.md の「progress_file_path 明示指定の欠落状況」調査で本ファイルが該当。fix-plan.md の修正方針に従い、変更WFの既存記述パターンに合わせて明示指定を追加する。設計WFは specs_dir が静的だが、記述の一貫性確保のため修正スコープに含める。

## 対象ファイル2: skills/fs-design-phase2-system-req/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル3: skills/fs-design-phase3-dev-plan/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズはゲート1（QAレビュー）を持つが、ゲート1のREJECTED修正委譲先（phase1/phase2）はfixモードで後処理・コミットを行わず本ゲートに制御を戻す契約のため、`phase-report-check (write)` は本フェーズ（phase3）の後処理でのみ呼ばれる。

## 対象ファイル4: skills/fs-design-phase4-architecture/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル5: skills/fs-design-phase5-gui/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。GUIスキップ時（完了ステータス B）でも後処理は通常通り実行されるため、明示指定は分岐に関わらず適用される。

## 対象ファイル6: skills/fs-design-phase6-usecase/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル7: skills/fs-design-phase7-ddd/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズはゲート2を持つが、REJECTED修正はフェーズ内修正ループ（design-qa-dispatch 再実行）で完結し、後処理は APPROVED 確定後の1回のみ実行されるため、明示指定は後処理1箇所で十分である。

## 対象ファイル8: skills/fs-design-phase8-object/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズは5サブフェーズ+gate3構成だが、`phase-report-check (write)` の呼び出しはフェーズ全体の後処理1箇所のみである。

## 対象ファイル9: skills/fs-design-phase9-infra/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。

## 対象ファイル10: skills/fs-design-phase10-program/SKILL.md（後処理）

### before
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### after
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/design-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
```

### 変更理由
対象ファイル1と同様。本フェーズはゲート4（最終設計レビュー）を持ち、REJECTED時は他フェーズ（phase1/4/5/7/8/9）へfixモードで委譲するが、いずれも後処理・コミットを行わず本ゲートに制御を戻す契約のため、`phase-report-check (write)` は本フェーズの後処理でのみ呼ばれる。設計WF全体の最終フェーズ手前（fs-design-phase11-final-check の前段）にあたる。
