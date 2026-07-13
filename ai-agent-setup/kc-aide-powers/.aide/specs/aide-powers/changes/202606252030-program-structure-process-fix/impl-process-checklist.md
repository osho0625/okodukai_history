# 工程チェック表

## 変更概要
program-structure.md の3箇所のプロセス定義行テキスト修正（非プログラム成果物）

## 工程フロー（非プログラム成果物）
```
実装（テキスト置換）→ 目視確認（SKILL.mdとの照合）→ レビュー（設計準拠確認）
```

---

## D-001: fs-impl-phase4-execution プロセス行の修正

| 工程 | 担当 | 状態 | 備考 |
|---|---|---|---|
| 実装（テキスト置換） | micro-impl-agent | ✅ done | program-structure.md L2291付近のプロセス行を置換 |
| 目視確認 | micro-impl-agent | ✅ done | 修正後行と `skills/fs-impl-phase4-execution/SKILL.md` の Step を照合完了 |
| レビュー（設計準拠） | design-review-agent | ✅ done | delta-design.md 変更1 の after と一致確認 |

---

## D-002: fs-change-phase2-impl プロセス行の修正

| 工程 | 担当 | 状態 | 備考 |
|---|---|---|---|
| 実装（テキスト置換） | micro-impl-agent | ✅ done | program-structure.md L2377付近のプロセス行を置換 |
| 目視確認 | micro-impl-agent | ✅ done | 修正後行と `skills/fs-change-phase2-impl/SKILL.md` の Step を照合完了 |
| レビュー（設計準拠） | design-review-agent | ✅ done | delta-design.md 変更2 の after と一致確認 |

---

## D-003: fs-bugfix-phase2-impl プロセス行の修正

| 工程 | 担当 | 状態 | 備考 |
|---|---|---|---|
| 実装（テキスト置換） | micro-impl-agent | ✅ done | program-structure.md L2401付近のプロセス行を置換 |
| 目視確認 | micro-impl-agent | ✅ done | 修正後行と `skills/fs-bugfix-phase2-impl/SKILL.md` の Step を照合完了 |
| レビュー（設計準拠） | design-review-agent | ✅ done | delta-design.md 変更3 の after と一致確認 |

---

## 全体完了条件

- [x] D-001 全工程完了
- [x] D-002 全工程完了
- [x] D-003 全工程完了
- [ ] リグレッション目視確認3件 PASS

---

## 注意事項

- 自動テストなし（dev-environment.md §7.4: 自動テストFW未導入）
- 変更対象はドキュメントテキストのみ（コード変更なし）
- SKILL.md は変更しない（参照のみ）
- 実行順序: D-001 → D-002 → D-003（同一ファイル逐次実行）
