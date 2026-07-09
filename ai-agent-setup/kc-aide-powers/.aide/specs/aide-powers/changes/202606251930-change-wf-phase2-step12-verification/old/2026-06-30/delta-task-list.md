# 差分タスクリスト

## 変更概要
3WF（変更/バグ修正/リファクタリング）の動作確認ステップとプロンプトを新構造（4段階構造）に統一し、folder-merge-check に testing/ → old/ ルールを追加する。

## タスク一覧

### D-001: change-verification-prompt.md を4段階構造に書き換え

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-change-phase2-impl/change-verification-prompt.md` |
| 対応する差分設計 | 変更1 |
| 対応する要件 | REQ-C-002 (AC-005〜AC-011) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | プロンプト全体を delta-design.md 変更1 の after に書き換え。旧形式（試験実行の優先順位/ローカル制約/verification-report.md出力）を廃止し、4段階構造（機能リスト作成→試験書作成→試験実行→結果報告）に統一。出力先を `{changes_dir}/testing/` とする |

---

### D-002: bugfix-verification-prompt.md を4段階構造に書き換え

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md` |
| 対応する差分設計 | 変更2 |
| 対応する要件 | REQ-C-002 (AC-005〜AC-011) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | プロンプト全体を delta-design.md 変更2 の after に書き換え。旧形式を廃止し、4段階構造に統一。出力先を `{bugfix_dir}/testing/` とする |

---

### D-003: refactoring-verification-prompt.md を4段階構造に書き換え

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` |
| 対応する差分設計 | 変更3 |
| 対応する要件 | REQ-C-002 (AC-005〜AC-011) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | プロンプト全体を delta-design.md 変更3 の after に書き換え。旧形式を廃止し、4段階構造に統一。出力先を `{refactoring_dir}/testing/` とする |

---

### D-004: fs-change-phase2-impl/SKILL.md の Step 12 書き換え + 成果物テーブル変更

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-change-phase2-impl/SKILL.md` |
| 対応する差分設計 | 変更4（4-A: 成果物テーブル, 4-B: Step 12） |
| 対応する要件 | REQ-C-001 (AC-001〜AC-004), REQ-C-003 (AC-012〜AC-014) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | (1) 成果物テーブルから `verification-report.md` 行を削除し、`test-function-list.md` + `test-{機能名}-test-plan.md` 行を追加。(2) Step 12 の⚠️注意書きquoteブロックを全て除去し、FSの責務を簡潔化。完了条件を `{changes_dir}/testing/test-{機能名}-test-plan.md が存在すること` に変更。状態判定は既存ロジック維持 |

---

### D-005: fs-bugfix-phase2-impl/SKILL.md の Step 10 書き換え + 成果物テーブル変更

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-bugfix-phase2-impl/SKILL.md` |
| 対応する差分設計 | 変更5（5-A: 成果物テーブル, 5-B: Step 10） |
| 対応する要件 | REQ-C-001 (AC-001〜AC-004), REQ-C-003 (AC-012〜AC-014) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | (1) 成果物テーブルから `verification-report.md` 行を削除し、`test-function-list.md` + `test-{機能名}-test-plan.md` 行を追加。(2) Step 10 の⚠️注意書きquoteブロックを全て除去し、FSの責務を簡潔化。完了条件を `{bugfix_dir}/testing/test-{機能名}-test-plan.md が存在すること` に変更。状態判定は既存ロジック維持 |

---


### D-006: fs-refactoring-phase5-impl/SKILL.md の Step 3 書き換え + 成果物テーブル変更

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/fs-refactoring-phase5-impl/SKILL.md` |
| 対応する差分設計 | 変更6（6-A: 成果物テーブル, 6-B: Step 3） |
| 対応する要件 | REQ-C-001 (AC-001〜AC-004), REQ-C-003 (AC-012〜AC-014) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | (1) 成果物テーブルから `verification-report.md` 行を削除し、`test-function-list.md` + `test-{機能名}-test-plan.md` 行を追加。(2) Step 3 の⚠️注意書きquoteブロックを全て除去し、FSの責務を簡潔化。完了条件を `{refactoring_dir}/testing/test-{機能名}-test-plan.md が存在すること` に変更。状態判定は既存ロジック維持 |

---

### D-007: folder-merge-check/SKILL.md に testing/ → old/ ルール追加

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/folder-merge-check/SKILL.md` |
| 対応する差分設計 | 変更7 |
| 対応する要件 | REQ-C-004 (AC-015, AC-016) |
| 依存先タスク | なし（並列実行可能） |
| 変更内容 | Step 4 の移動ルール b の対象例に `testing/`（フォルダごと）を追加。c の直前に b-2 として `testing/` フォルダの取り扱い注記を挿入（testing/ 配下は old/{日付}/testing/ に移動） |

---

## 依存関係グラフ

```
D-001 ─┐
D-002 ─┤
D-003 ─┤── 全タスク並列実行可能（全て別ファイルへの変更）
D-004 ─┤
D-005 ─┤
D-006 ─┤
D-007 ─┘
```

全7タスクは異なるファイルを変更するため、依存関係なし。全て並列実行可能。

---

## 網羅性チェック

| delta-design.md 変更項目 | 対応タスク | カバー状態 |
|---|---|---|
| 変更1: change-verification-prompt.md | D-001 | ✅ |
| 変更2: bugfix-verification-prompt.md | D-002 | ✅ |
| 変更3: refactoring-verification-prompt.md | D-003 | ✅ |
| 変更4: fs-change-phase2-impl/SKILL.md (4-A + 4-B) | D-004 | ✅ |
| 変更5: fs-bugfix-phase2-impl/SKILL.md (5-A + 5-B) | D-005 | ✅ |
| 変更6: fs-refactoring-phase5-impl/SKILL.md (6-A + 6-B) | D-006 | ✅ |
| 変更7: folder-merge-check/SKILL.md | D-007 | ✅ |

---

## リグレッション確認タスク

impact-analysis.md の「影響を受ける可能性がある機能（リグレッション確認対象）」に基づき、以下を実装完了後のレビュー時に確認する:

| # | 確認内容 | 確認タイミング |
|---|---|---|
| 1 | 後続ステップの遷移（Step 13/11/後処理）が正しく起動する記述になっていること | D-004, D-005, D-006 のレビュー時 |
| 2 | NG時の差し戻し先が既存ロジックと同一であること | D-004, D-005, D-006 のレビュー時 |
| 3 | folder-merge-check の既存移動ルール（a, b, c）が破壊されていないこと | D-007 のレビュー時 |
