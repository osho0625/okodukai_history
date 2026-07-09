# 差分タスクリスト — 設計漏れ・実装漏れ発見時の対策プロセス定義

## 概要

| 項目 | 内容 |
|---|---|
| 変更ID | 202606301022-design-impl-gap-process |
| タスク総数 | 24 |
| 成果物種別 | 全て非プログラム成果物（Markdown） |
| テスト工程 | 全スキップ（NF-13: 自動テストなし） |

---

## タスク一覧

### グループ1: 新規プロセス定義（T-01）

| タスクID | 対象ファイル | 変更種別 | 内容 | 依存 | 設計参照 |
|---|---|---|---|---|---|
| T-01 | `skills/fs-impl-phase5-final-check/design-impl-gap-process.md` | 新規作成 | 設計漏れ・実装漏れ発見時の対策プロセス全体定義（プロセスA/B/C + 起動パス + 判定基準） | なし | delta-design.md §1 |

### グループ2: 既存スキル変更 — 異常系参照追加（T-02）

| タスクID | 対象ファイル | 変更種別 | 内容 | 依存 | 設計参照 |
|---|---|---|---|---|---|
| T-02 | `skills/fs-impl-phase5-final-check/SKILL.md` | 変更 | Step1 状態判定に異常系プロセスへの参照追加 + Integration セクションに参照追加 + 合理的乖離廃止§8の記述変更 | T-01 | delta-design.md §2, §8 |

### グループ3: 全体ルール追加 + 配布連動（T-03, T-03b, T-03c, T-03d）

| タスクID | 対象ファイル | 変更種別 | 内容 | 依存 | 設計参照 |
|---|---|---|---|---|---|
| T-03 | `skills/using-aide-powers/references/phase-skill-rules.md` | 変更 | 「設計不備発見時の対応ルール」セクション追加 | T-01 | delta-design.md §2.5 |
| T-03b | `skills/using-aide-powers/references/version.json` | 変更 | version を +1（配布トリガー） | T-03（同時実施） | impact-analysis.md §3.2 |
| T-03c | `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` | 変更 | APM配布版の同期更新（正本 phase-skill-rules.md の内容をAPM形式で反映） | T-03 | delta-design.md §更新が必要な設計資料 |
| T-03d | `.aide/specs/aide-powers/program-structure.md` | 変更 | references/phase-skill-rules.md セクションに「⚠️ 変更時の連動ファイル」注記追加 | T-01 | delta-design.md §更新が必要な設計資料 |

### グループ4: 合理的乖離廃止（T-04〜T-20）

| タスクID | 対象ファイル | 変更種別 | 内容 | 依存 | 設計参照 |
|---|---|---|---|---|---|
| T-04 | `skills/multi-stage-code-review/SKILL.md` | 変更 | Review Result Handling 判定フロー変更 + Red Flags + Common Rationalizations + Integration | なし | deprecate §1 |
| T-05 | `skills/coding-test-2review/SKILL.md` | 変更 | 設計準拠レビュー FAIL 時の分岐変更。FAIL_PENDING→種別確定フロー追加 + Integration | なし | deprecate §2 |
| T-06 | `skills/coding-test-2review/spec-reviewer-prompt.md` | 変更 | 合理的乖離の許容ルール → 乖離種別判定ルール（mode: combined + mode: implementation） | なし | deprecate §3 |
| T-07 | `skills/design-sync/SKILL.md` | 変更 | Phase 2 変更 + Phase 3 タイトル変更 + Rational Deviation Rules 廃止 + Red Flags + Common Rationalizations | なし | deprecate §4 |
| T-08 | `skills/import-review/SKILL.md` | 変更 | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」+ Red Flags | なし | deprecate §5 |
| T-09 | `skills/fs-impl-phase4-execution/SKILL.md` | 変更 | Step 1 説明文 + Integration 記述変更 | なし | deprecate §6 |
| T-10 | `skills/fs-impl-phase4-execution/spec-reviewer-prompt.md` | 変更 | 合理的乖離の許容ルール → 乖離種別判定ルール | なし | deprecate §7 |
| T-11 | `skills/fs-change-phase2-impl/SKILL.md` | 変更 | coding-test-2review 説明文 + Integration 記述変更 | なし | deprecate §9 |
| T-12 | `skills/fs-bugfix-phase2-impl/SKILL.md` | 変更 | coding-test-2review 説明文 + Integration 記述変更 | なし | deprecate §10 |
| T-13 | `skills/fs-refactoring-phase5-impl/SKILL.md` | 変更 | coding-test-2review 説明文 + Integration 記述変更 | なし | deprecate §11 |
| T-14 | `skills/fs-refactoring-phase5-impl/spec-reviewer-prompt.md` | 変更 | 合理的乖離の判定 → 乖離種別判定 + 報告フォーマット | なし | deprecate §12 |
| T-15 | `agents/design-review-agent.md` | 変更 | ステップ5 全体変更: ユーザー承認フロー削除 + 出力変更 + 行動規範変更 | なし | deprecate §13 |
| T-16 | `agents/kiro/design-review-agent.md` | 変更 | §13 と同一パターン適用 | なし | deprecate §14 |
| T-17 | `agents/kiro/prompts/design-review-agent-prompt.md` | 変更 | §13 と同一パターン適用 | なし | deprecate §15 |
| T-18 | `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | 変更 | 判定種別・PASS条件の記述変更 + 行動規範 | なし | deprecate §16 |
| T-19 | `docs-dev/02-ai-agent/03-common-skills/impl.md` | 変更 | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」+ Iron Law | なし | deprecate §17 |
| T-20 | `docs-dev/02-ai-agent/03-common-skills/infrastructure.md` | 変更 | design-sync 呼び出し元の記述変更 | なし | deprecate §18 |

### グループ5: リグレッション確認（T-21）

| タスクID | 対象ファイル | 変更種別 | 内容 | 依存 | 設計参照 |
|---|---|---|---|---|---|
| T-21 | —（手動確認） | 確認 | impact-analysis.md §5.2 の手動確認9項目を実施 | T-01〜T-20, T-03b〜T-03d 全完了後 | impact-analysis.md §5.2 |

---

## 依存関係図

```
T-01 ──┬──→ T-02
       ├──→ T-03 ──┬──→ T-03b（同時実施）
       │           └──→ T-03c
       └──→ T-03d

T-04〜T-20（独立・並列実行可能）

T-01〜T-20 + T-03b〜T-03d 全完了 → T-21
```

---

## 実行順序（推奨）

1. **Wave 1**: T-01（新規プロセス定義）+ T-04〜T-20（合理的乖離廃止17ファイル）— 並列実行可能
2. **Wave 2**: T-02（T-01 依存）+ T-03（T-01 依存）+ T-03d（T-01 依存）
3. **Wave 3**: T-03b（T-03 依存・同時実施）+ T-03c（T-03 依存）
4. **Wave 4**: T-21（全タスク完了後のリグレッション確認）

---

## 設計参照略称

| 略称 | 正式ファイル名 |
|---|---|
| delta-design.md | `.aide/specs/aide-powers/changes/202606301022-design-impl-gap-process/delta-design.md` |
| deprecate | `.aide/specs/aide-powers/changes/202606301022-design-impl-gap-process/delta-design-deprecate-rational-deviation.md` |
| impact-analysis.md | `.aide/specs/aide-powers/changes/202606301022-design-impl-gap-process/impact-analysis.md` |

---

Docs: .aide/specs/aide-powers/changes/202606301022-design-impl-gap-process/
