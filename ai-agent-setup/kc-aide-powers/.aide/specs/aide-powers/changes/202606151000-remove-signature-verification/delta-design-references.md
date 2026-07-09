# 差分設計書 — 参照更新

## 1. `skills/using-aide-powers/references/phase-skill-rules.md` — 署名関連記述の除去

### 1.1 「前処理・後処理の絶対実行」セクション

**Before:**
```markdown
前処理（compliance-check の verify、進捗ファイル読み込み等）は絶対に省略してはならない。
後処理（compliance-check の write、進捗ファイル更新、署名生成等）も絶対に省略してはならない。
```

**After:**
```markdown
前処理（進捗確認、進捗ファイル読み込み等）は絶対に省略してはならない。
後処理（進捗更新、進捗ファイル更新等）も絶対に省略してはならない。
```

**変更理由**: phase-compliance-check（削除対象）への参照除去、「署名生成」の記述除去

### 1.2 「ユーザーによる中止（全WF共通）」セクション

**Before:**
```markdown
- final-check の中止モードは、署名検証をスキップし、本WFの作業成果物（作業フォルダ・進捗ファイル・タスクリスト・ドラフト設計書等）を**ユーザー確認のうえ削除**し、必要ならコミットし、フェーズレポートを削除してワークフローを終了する
```

**After:**
```markdown
- final-check の中止モードは、本WFの作業成果物（作業フォルダ・進捗ファイル・タスクリスト・ドラフト設計書等）を**ユーザー確認のうえ削除**し、必要ならコミットし、フェーズレポートを削除してワークフローを終了する
```

**変更理由**: 「署名検証をスキップし」の記述が不要になったため除去

---

## 2. `.kiro/steering/aide-powers-phase-skill-rules.md` — 同様の更新

上記 §1 と同一の変更を `.kiro/steering/aide-powers-phase-skill-rules.md` にも適用する。このファイルは `rules-distribute` スキルによりグローバル領域にコピーされるステアリングファイルであり、配布元（`skills/using-aide-powers/references/phase-skill-rules.md`）と同期している必要がある。

変更箇所は §1.1 と §1.2 と同一。

---

## 3. `skills/session-handover/SKILL.md` — phase-compliance-check 参照の除去

### 3.1 実行証跡テンプレート内の参照

**Before:**
```markdown
| 2 | phase-compliance-check (verify) | {PASS / FAIL} | {実行コマンドと結果} |
```

**After:**
```markdown
| 2 | phase-report-check (verify) | {PASS / FAIL} | {進捗確認結果} |
```

**変更理由**: phase-compliance-check が削除されたため、phase-report-check（簡素化後）に変更

### 3.2 後処理テンプレート内の参照

**Before:**
```markdown
| 3 | phase-compliance-check (write) | {未実施 — 次セッションで実行} | — |
```

**After:**
```markdown
| 3 | phase-report-check (write) | {未実施 — 次セッションで実行} | — |
```

**変更理由**: 同上

### 3.3 記載条件・説明文の更新

**Before:**
```markdown
> **記載条件:** フェーズの後処理（phase-compliance-check write）がまだ完了していない場合に記載する。
> 後処理が完了済み（署名付きで進捗ファイルに記録済み）の場合は「後処理完了済み — 証跡は design-progress.md に署名済み」と記載する。
```

**After:**
```markdown
> **記載条件:** フェーズの後処理（phase-report-check write）がまだ完了していない場合に記載する。
> 後処理が完了済み（進捗ファイルに記録済み）の場合は「後処理完了済み — 進捗ファイルに記録済み」と記載する。
```

**変更理由**: phase-compliance-check への参照を phase-report-check に変更、「署名付きで」「署名済み」の記述除去

### 3.4 なぜ必要かセクション

**Before:**
```markdown
`phase-compliance-check (write)` は `execution_evidence`（実行証跡）を入力として受け取り、各ステップの実行証跡が存在するか検証する。証跡がないと FAIL になり、フェーズのやり直しになる。セッションを跨ぐ場合、前セッションの実行履歴は新セッションのAIには見えないため、引き継ぎファイルに明示的に記録しておく必要がある。
```

**After:**
```markdown
`phase-report-check (write)` は進捗ファイルの更新を行う。セッションを跨ぐ場合、前セッションの実行状態は新セッションのAIには見えないため、引き継ぎファイルに明示的に記録しておく必要がある。
```

**変更理由**: phase-compliance-check への参照除去、`execution_evidence` の検証がなくなったため記述簡素化

### 3.5 署名検証の詳細例

**Before:**
```markdown
| 2 | phase-compliance-check (verify) | PASS | `compliance-sig.bat artifact-hash 0DC9C403...` → `BA938401...`。`compliance-sig.bat verify design 9 "2026-05-26 18:45" BA938401... hn16GXoK...` → PASS |
```

**After:**
```markdown
| 2 | phase-report-check (verify) | PASS | 直前フェーズ ✅ 完了 を確認 |
```

**変更理由**: 署名コマンドの記述が不要になったため簡素化

---

## 4. `skills/using-aide-powers/references/progress-file-format.md` — 署名関連記述の更新

### 4.1 §3.3 修正履歴テーブル内の署名記述

**Before:**
```markdown
**署名なし（重要）:**

- 修正履歴エントリには署名（FIX-SIG 等）を一切付けない
- 改ざん防止署名はフェーズ完了時の `PHASE-SIG` のみである

**署名整合:**

- `PHASE-SIG:{N}` は phase N が一度でも完了した証跡として保持される
- `🔧 修正中` のフェーズも `PHASE-SIG` を保持する（差し戻しで署名を削除しない）
```

**After:**
（セクション全体を削除）

**変更理由**: 署名メカニズム廃止に伴い署名関連の記述が不要

### 4.2 §9 関連スキルテーブル

変更なし（phase-report-check は名称維持のため参照更新不要。phase-compliance-check はテーブルに記載されていない）

---

## 5. `skills/step-history-writer/SKILL.md` — progress-final-checker 説明の更新

### 5.1 概要の説明文

**Before:**
```markdown
セッション中の実行履歴を `.aide/tmp/` に書き出し、最終整合性チェック（final-check フェーズ）で progress-final-checker が検証に使用する。
```

**After:**
```markdown
セッション中の実行履歴を `.aide/tmp/` に書き出す。
```

**変更理由**: progress-final-checker が署名検証を行わなくなったため、「検証に使用する」の記述を削除。step-history-writer 自体のスキルは変更しない（スコープ外）が、説明文の参照先が変わるため更新

### 5.2 Used by セクション

**Before:**
```markdown
**Used by:**
- `progress-final-checker (aide-powers agent)` — final-check フェーズで全履歴ファイルを読み込み、実行整合性を検証する
```

**After:**
```markdown
**Used by:**
- `progress-final-checker (aide-powers agent)` — final-check フェーズで参照可能（進捗完了確認の補助情報）
```

**変更理由**: 「全履歴ファイルを読み込み、実行整合性を検証する」が実態と合わなくなるため更新
