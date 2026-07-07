---
inclusion: fileMatch
fileMatchPattern: "*settlement*"
---

# 家庭内精算機能（family-settlement）

## 概要

家庭内の固定費・立替金の精算を補助する機能。夫婦それぞれが支払う固定費を折半し、毎月の精算金額を自動計算する。半年ごとに実費との差額精算も行う。

## ファイル構成

- `pages/settlement.html` — 精算メイン画面（5タブ）
- `js/settlement-utils.js` — 精算計算ロジック（純粋関数、dual export）
- `js/settlement-app.js` — UI・Supabase操作
- `sql/create_settlement_tables.sql` — テーブル定義
- `sql/create_settlement_rpc.sql` — Postgres Functions（Transaction）
- `sql/create_settlement_revert_rpc.sql` — 精算取消 Postgres Functions
- `sql/alter_settlement_rls.sql` — RLS無効化（再実行用）
- `tests/property-settlement.test.js` — プロパティベーステスト（17 Properties）
- `tests/settlement-integration.test.js` — 統合テスト
- `tests/settlement-deep-check.test.js` — 深層バグチェック

## DBテーブル

### expense_master（固定費マスタ）
- id, name, payer, base_amount, settlement_cycle (monthly/half_year), enabled, created_at, updated_at
- RLS無効

### monthly_expenses（毎月の精算データ）
- id, year_month, expense_master_id (FK), payer, planned_amount, actual_amount
- difference: Generated Column (`CASE WHEN actual_amount IS NULL THEN 0 ELSE actual_amount - planned_amount END`)
- difference_settled, created_at
- UNIQUE (year_month, expense_master_id)
- RLS無効

### settlement_history（精算履歴）
- id, target_period (YYYY-MM or YYYY-H1/H2), payer_from, payer_to, amount
- settlement_type (monthly/difference), settlement_period (first_half/second_half)
- status (pending/paid), memo, paid_at, created_at
- RLS無効

### temporary_expenses（一時的な立替金）
- id, title, payer, amount, beneficiaries (TEXT[], default ['めぐみ','涼介']), year_month, note, settled, created_at
- beneficiaries: 受益者（誰の分を立て替えたか）。両方=折半、片方のみ=全額その人が返す
- RLS無効

## 画面構成（タブ）

1. 📊 ダッシュボード — 今月の精算結果、未払い件数、差額精算待ち、立替金一覧
2. 📋 固定費管理 — マスタCRUD、有効/無効切替
3. 💴 今月の精算 — 月次精算計算・確定・履歴、年月ナビ
4. 📈 差額管理 — 半年項目の実費入力、即時差額表示
5. 🔄 差額精算 — 期間別累積差額一覧、精算確定、基準額調整提案

## 設計上の制約

- payer数 = 2（めぐみ・涼介の2人前提）
- calculateSettlement(monthlyExpenses, temporaryExpenses, payers) — 第3引数payersで常に['めぐみ','涼介']を渡す（片方のみ登録時でも折半計算を保証）
- 一時立替の受益者(beneficiaries): 全員=折半、片方のみ=全額返済
- 精算開始月: 2026-06（SETTLEMENT_START_MONTH）。これ以前のデータは生成・表示しない
- 同月に複数回の月次精算が可能（精算後の追加立替対応）
- 端数: floor()で切り捨て、payer_from（支払う側）に有利
- 差額精算期間: 固定2期間（1〜6月=上半期、7〜12月=下半期）
- Expense_Master変更は既生成のMonthly_Expenseに影響しない
- 「月次精算済み」の判定: settlement_historyにレコードがあるかで導出
- 精算確定はSupabase RPC（Transaction + ROW_COUNTチェック）
- Monthly_Expense生成: 手動ボタン「この月の精算データを作成する」で明示的に作成（INSERT ON CONFLICT DO NOTHING）

## RPC Functions

- `execute_monthly_settlement` — 月次精算確定（重複チェック + history INSERT + temp UPDATE）
- `execute_difference_settlement` — 差額精算確定（重複チェック + history INSERT + monthly UPDATE）
- `revert_monthly_settlement` — 月次精算取消（temp settled→false + history DELETE + Discord/Push通知）
- `revert_difference_settlement` — 差額精算取消（monthly difference_settled→false + history DELETE + Discord/Push通知）

## テスト

```bash
npx vitest run tests/property-settlement.test.js tests/settlement-integration.test.js tests/settlement-deep-check.test.js
```

17 Properties + 統合テスト + 深層チェック = 計55テスト
