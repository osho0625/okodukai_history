# 差分タスクリスト

## タスク一覧

| # | タスク | 対象ファイル | 依存 | 種別 | 状態 |
|---|---|---|---|---|---|
| T1 | global-rules.md に共通スキル発動条件カタログセクション追加 | skills/using-aide-powers/references/global-rules.md | — | 非プログラム（ドキュメント） | ⬜ 未着手 |
| T2 | phase-skill-rules.md の冗長性排除・圧縮 | skills/using-aide-powers/references/phase-skill-rules.md | — | 非プログラム（ドキュメント） | ⬜ 未着手 |
| T3 | version.json の version bump | skills/using-aide-powers/references/version.json | T1, T2 | 非プログラム（ドキュメント） | ⬜ 未着手 |

## タスク詳細

### T1: global-rules.md に共通スキル発動条件カタログセクション追加

- **対象**: `skills/using-aide-powers/references/global-rules.md`
- **内容**: ファイル末尾（「実行環境ルール」セクションの後）に「共通スキル発動条件カタログ」セクションを追加
- **設計参照**: delta-design.md「変更1」のafterセクション
- **実装方法**: ユーザーとの共同作業で文面を確定してから追記
- **完了基準**: カタログセクションが追加され、7スキルの発動条件が「〜のとき」形式で記載されている

### T2: phase-skill-rules.md の冗長性排除・圧縮

- **対象**: `skills/using-aide-powers/references/phase-skill-rules.md`
- **内容**: 同一ルールの重複表現を排除し、176行 → 150行以下に圧縮
- **設計参照**: delta-design.md「変更2」の圧縮方針・想定削減量内訳
- **実装方法**: ユーザーとの共同作業で圧縮後の文面を決定
- **完了基準**: 圧縮後のファイルが150行以下であり、全ての既存ルールの意図が維持されている（AC-009）

### T3: version.json の version bump

- **対象**: `skills/using-aide-powers/references/version.json`
- **内容**: version: 7 → 8、updated: "2026-06-15" → 実施日
- **依存**: T1, T2 が完了してから実行
- **実装方法**: T1・T2 完了後に version.json を更新
- **完了基準**: version が 8 に更新され、updated が実施日になっている

## 注記
- 全タスクが非プログラム（ドキュメント）種別のため、自動テスト工程・コードレビュー工程は適用しない
- T1・T2 はユーザーとの共同作業で文面を決定する
- T3 は T1・T2 完了後に実行する（配布トリガーのため最後に bump）
