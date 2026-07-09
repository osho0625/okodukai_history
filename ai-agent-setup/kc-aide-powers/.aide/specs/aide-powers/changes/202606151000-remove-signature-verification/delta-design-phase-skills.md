# 差分設計書 — フェーズスキル群の一括パターン変更

## 概要

全フェーズスキル（約30ファイル）の前処理・後処理に対して、テンプレート的な一括パターン変更を適用する。変更パターンは全ファイルで均一である。

---

## 1. 変更パターン A — 通常フェーズスキルの前処理

### 対象ファイル

- `skills/fs-reverse-phase{1-5}/SKILL.md`（5ファイル）
- `skills/fs-refactoring-phase{1-6}/SKILL.md`（6ファイル）
- `skills/fs-planning-phase{1-3}/SKILL.md`（3ファイル）
- `skills/fs-impl-phase{1-4,6}/SKILL.md`（5ファイル）
- `skills/fs-design-phase9-infra/SKILL.md`（1ファイル）
- `skills/fs-design-phase{1-8}/SKILL.md`（8ファイル）
- `skills/fs-design-phase10-program/SKILL.md`（1ファイル）
- `skills/fs-change-phase{1-2}/SKILL.md`（2ファイル）
- `skills/fs-bugfix-phase{1-2}/SKILL.md`（2ファイル）
- その他、前処理で phase-report-check(verify) を呼び出す全フェーズスキル

### 変更内容

#### 1.1 前処理の成果物記載項目

**Before:**
```markdown
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　署名チェック結果(前処理):
```

**After:**
```markdown
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
```

**変更理由**: 「署名チェック結果」を「進捗確認結果」に変更。verify モードが署名検証から進捗状態確認に変わったため

#### 1.2 前処理の状態判定

**Before:**
```markdown
### 状態判定
完了条件を満たしたうえで、まず "署名チェック結果(前処理):" を確認する

- FAIL の場合 → ...（署名検証失敗時の処理）...
- PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
```

**After:**
```markdown
### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

- FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
- PASS または N/A（初回フェーズで前フェーズなし）の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める
```

**変更理由**: 「署名チェック結果」→「進捗確認結果」。FAIL 時の「署名FAIL」固有の記述（「直前フェーズの結果が信用できない」等）を汎用的な記述に変更

---

## 2. 変更パターン B — 通常フェーズスキルの後処理

### 対象ファイル

変更パターン A と同じフェーズスキル群

### 変更内容

#### 2.1 後処理の phase-report-check(write) 呼び出し

**Before:**
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行する。引数:
  - mode: write
  - progress_file_path: {進捗ファイルパス}
  - skill_name: {本フェーズのスキル名}
  - changes_dir: {成果物格納先}
  - report_file_path: {フェーズレポートパス}
  - required_items: {必須項目リスト}
  - expected_artifacts: {期待成果物リスト}
```

**After:**
```markdown
・phase-report-check (aide-powers skill: write)を activate して実行する。引数:
  - mode: write
  - progress_file_path: {進捗ファイルパス}
  - skill_name: {本フェーズのスキル名}
  - changes_dir: {成果物格納先}
  - expected_artifacts: {期待成果物リスト}
```

**変更理由**: `report_file_path` と `required_items` パラメータの削除（レポート記載項目検証廃止のため）

#### 2.2 後処理のレポート記載項目リスト

**Before:**
各フェーズスキルの後処理に「レポート記載項目リスト」セクションがあり、phase-report-check(write) に渡す `required_items` の一覧が定義されている。

**After:**
「レポート記載項目リスト」セクションを**完全削除する**。レポート記載項目検証が廃止されるため、このリストはコンテキストの無駄遣いになる。

**変更理由**: required_items を phase-report-check に渡す運用が廃止され、記載項目検証も行わないため、リスト自体が不要。コンテキストの節約のため削除する

---

## 3. 変更パターン C — 最終チェックフェーズスキルの前処理

### 対象ファイル

- `skills/fs-reverse-phase6-final-check/SKILL.md`
- `skills/fs-refactoring-phase7-final-check/SKILL.md`
- `skills/fs-impl-phase5-final-check/SKILL.md`（※impl は phase7 が final-check）
- `skills/fs-planning-phase4-final-check/SKILL.md`（存在する場合）
- `skills/fs-change-phase3-final-check/SKILL.md`
- `skills/fs-bugfix-phase3-final-check/SKILL.md`
- `skills/fs-design-phase11-final-check/SKILL.md`
- `skills/fs-impl-phase7-final-check/SKILL.md`

### 変更内容

最終チェックフェーズの前処理は通常フェーズと同じパターン A を適用する（「署名チェック結果」→「進捗確認結果」）。

---

## 4. 変更パターン D — 最終チェックフェーズの本体 Step（progress-final-checker 起動）

### 対象ファイル

変更パターン C と同じ最終チェックフェーズスキル群

### 変更内容

#### 4.1 progress-final-checker 起動の説明

**Before:**
```markdown
progress-final-checker (aide-powers agent) サブエージェントを起動する。
全前フェーズの署名を検証し、全て正当であれば自フェーズを ✅ 完了 に更新する。
```

**After:**
```markdown
progress-final-checker (aide-powers agent) サブエージェントを起動する。
全前フェーズが ✅ 完了 であることを確認し、自フェーズを ✅ 完了 に更新する。
```

**変更理由**: 「署名を検証し、全て正当であれば」→「✅ 完了 であることを確認し」に変更。署名検証廃止のため

#### 4.2 FAIL 時の記述

**Before:**（署名不一致・署名欠落・未完了等の多岐にわたるFAIL理由）

**After:** FAIL 理由は「前フェーズ未完了」のみに絞る:
```markdown
- FAIL の場合: 未完了のフェーズ番号と理由をユーザーに通知し、対応を確認する
```

**変更理由**: 署名関連の FAIL パターンが消えるため

---

## 5. 変更パターン E — 最終チェックフェーズの中止モード

### 対象ファイル

変更パターン C と同じ最終チェックフェーズスキル群

### 変更内容

**Before:**
```markdown
中止モードでは署名検証をスキップし、...
```

**After:**
```markdown
中止モードでは、...
```

**変更理由**: 「署名検証をスキップし」が不要（署名検証自体が存在しなくなるため）

---

## 6. 適用対象ファイル一覧

以下のファイルに上記パターン（該当するもの）を適用する:

| # | ファイル | 適用パターン |
|---|---|---|
| 1 | `skills/fs-reverse-phase1-program/SKILL.md` | A + B |
| 2 | `skills/fs-reverse-phase2-dev-env/SKILL.md` | A + B |
| 3 | `skills/fs-reverse-phase3-system-req/SKILL.md` | A + B |
| 4 | `skills/fs-reverse-phase4-user-req/SKILL.md` | A + B |
| 5 | `skills/fs-reverse-phase5-optional-phases/SKILL.md` | A + B |
| 6 | `skills/fs-reverse-phase6-final-check/SKILL.md` | A + C + D + E |
| 7 | `skills/fs-refactoring-phase1-status/SKILL.md` | A + B |
| 8 | `skills/fs-refactoring-phase2-candidates/SKILL.md` | A + B |
| 9 | `skills/fs-refactoring-phase3-plan/SKILL.md` | A + B |
| 10 | `skills/fs-refactoring-phase4-design/SKILL.md` | A + B |
| 11 | `skills/fs-refactoring-phase5-impl/SKILL.md` | A + B |
| 12 | `skills/fs-refactoring-phase6-doc/SKILL.md` | A + B |
| 13 | `skills/fs-refactoring-phase7-final-check/SKILL.md` | A + C + D + E |
| 14 | `skills/fs-planning-phase1-intake-and-init/SKILL.md` | A + B |
| 15 | `skills/fs-planning-phase2-explore/SKILL.md` | A + B |
| 16 | `skills/fs-planning-phase3-finalize/SKILL.md` | A + B |
| 17 | `skills/fs-planning-phase4-final-check/SKILL.md` | A + C + D + E |
| 18 | `skills/fs-impl-phase1-gate/SKILL.md` | A + B |
| 19 | `skills/fs-impl-phase2-preparation/SKILL.md` | A + B |
| 20 | `skills/fs-impl-phase3-gui-mockup/SKILL.md` | A + B |
| 21 | `skills/fs-impl-phase4-execution/SKILL.md` | A + B |
| 22 | `skills/fs-impl-phase5-final-check/SKILL.md` | A + C + D + E |
| 23 | `skills/fs-impl-phase6-doc-generation/SKILL.md` | A + B |
| 24 | `skills/fs-impl-phase7-final-check/SKILL.md` | A + C + D + E |
| 25 | `skills/fs-design-phase1-user-req/SKILL.md` | A + B |
| 26 | `skills/fs-design-phase2-system-req/SKILL.md` | A + B |
| 27 | `skills/fs-design-phase3-dev-plan/SKILL.md` | A + B |
| 28 | `skills/fs-design-phase4-architecture/SKILL.md` | A + B |
| 29 | `skills/fs-design-phase5-gui/SKILL.md` | A + B |
| 30 | `skills/fs-design-phase6-usecase/SKILL.md` | A + B |
| 31 | `skills/fs-design-phase7-ddd/SKILL.md` | A + B |
| 32 | `skills/fs-design-phase8-object/SKILL.md` | A + B |
| 33 | `skills/fs-design-phase9-infra/SKILL.md` | A + B |
| 34 | `skills/fs-design-phase10-program/SKILL.md` | A + B |
| 35 | `skills/fs-design-phase11-final-check/SKILL.md` | A + C + D + E |
| 36 | `skills/fs-change-phase1-analysis/SKILL.md` | A + B |
| 37 | `skills/fs-change-phase2-impl/SKILL.md` | A + B |
| 38 | `skills/fs-change-phase3-final-check/SKILL.md` | A + C + D + E |
| 39 | `skills/fs-bugfix-phase1-analysis/SKILL.md` | A + B |
| 40 | `skills/fs-bugfix-phase2-impl/SKILL.md` | A + B |
| 41 | `skills/fs-bugfix-phase3-final-check/SKILL.md` | A + C + D + E |


