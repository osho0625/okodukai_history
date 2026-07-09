---
name: progress-resume-check
description: "Use when starting any of the 7 workflows. Read the progress file and determine the next phase to execute (resume, fresh start, or all-completed)."
---

# progress-resume-check

## 概要

全7WFの先頭フェーズスキルから呼び出される再開判定共通スキル。
進捗ファイルを Read で読み込み、ステータステーブルから状態列を解析し、次に実行すべきフェーズを返す。

**Core principle:** 進捗ファイルを読むだけ。書かない。判定するだけ。実作業はしない。

---

## The Iron Law

```
NO PROGRESS FILE EDIT BY THIS SKILL.
本共通スキルは進捗ファイルを編集してはならない。Read のみ行うこと。

NO PHASE NUMBER GUESSING.
進捗ファイルに記載のないフェーズ番号を返してはならない。
判定は「ステータス」テーブルの ✅ 完了 マーカーに基づき機械的に行うこと。
```

---

## 入力仕様

| パラメータ | 型 | 必須 | 内容 |
|---|---|---|---|
| progress_file_path | 文字列 | 必須 | 進捗ファイルのパス |
| workflow_name | 文字列 | 必須 | planning / design / impl / reverse / change / bugfix / refactoring |

---

## 出力仕様

3種類のいずれかを返す:

| 戻り値 | 意味 | 条件 |
|---|---|---|
| `RESUME_FROM N` | フェーズ N から再開 | 🔧 修正中 があればそのフェーズ、無ければ 最後の ✅ 完了 + 1 |
| `START_FRESH` | 新規開始 | ファイル不在 or ✅ 完了 が0件 |
| `ALL_COMPLETED` | 全フェーズ完了済み | 全行が ✅ 完了 |

---

## メインプロセス

```
1. 進捗ファイルの存在確認
   └─ 不在 → return START_FRESH

2. 共通フォーマット準拠確認
   └─ 非準拠 → return START_FRESH

3. ステータステーブル解析（全行走査）
   ├─ 各行の状態列を抽出
   └─ ✅ 完了 / それ以外 を判定

4. 最後の完了フェーズ特定
   ├─ ✅ 完了 が 0件 → return START_FRESH
   ├─ 全行が ✅ 完了 → return ALL_COMPLETED
   └─ それ以外 → 最後の連続 ✅ 完了 行の次を特定

5. 戻り値構築
   └─ return RESUME_FROM N（N = 最後の連続完了 + 1 のフェーズ番号）
```

---

## 修正モード（🔧 修正中 / ✅ 修正完了）に関する注記

進捗管理の「修正モード」で現れる状態マーカーの扱いについて補足する（解析ロジック本体は変更しない）。

- **`🔧 修正中`**: 修正のため差し戻されたフェーズに付く。`✅ 完了` ではないため、上記メインプロセスの「最後の連続 ✅ 完了 行の次を特定」ロジックで自然に未完了として扱われ、そのフェーズが再開対象（`RESUME_FROM`）になる。特別な分岐は不要である。
- **`✅ 修正完了`**: 修正履歴テーブルにのみ現れる状態であり、ステータステーブルには出ない。本スキルはステータステーブルのみを解析対象とするため、`✅ 修正完了` は解析対象外である。

---

## 異常系の取り扱い

全て安全側（START_FRESH）に倒す:

| 異常パターン | 判定結果 |
|---|---|
| ファイル不在 | START_FRESH |
| 空ファイル | START_FRESH |
| ステータスセクション不在 | START_FRESH |
| テーブル構造崩壊 | START_FRESH |
| 未定義マーカー | 当該行を未完了扱いで続行 |
| workflow_name 不整合 | START_FRESH |

---

## Red Flags - STOP

以下の衝動が生じたら即座に停止せよ:

- 「進捗ファイルを自分で初期化しよう」→ **禁止**（Read専用）
- 「フォーマット違反を修正しよう」→ **禁止**
- 「フェーズ番号を推測しよう」→ **禁止**
- 「フェーズ詳細サブセクションを参照しよう」→ **ステータステーブルのみ解析**

---

## Common Rationalizations

以下の合理化を拒否せよ:

| 合理化 | 正しい対応 |
|---|---|
| 「呼び出し元がまた読むのは無駄だから初期化もやろう」 | 副作用禁止。Read のみ |
| 「作業中の方を優先したい」 | ✅ 完了 のみを完了とみなす |

---

## Integration

| 項目 | 内容 |
|---|---|
| Called by | 全7WFの先頭フェーズスキル |
| Reference | .aide/references/progress-file-format.md |
| Related | design-gate (aide-powers skill), doc-index-maintenance (aide-powers skill) |
