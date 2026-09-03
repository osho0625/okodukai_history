---
inclusion: fileMatch
fileMatchPattern: "*settlement*"
---

# 家庭内精算機能（family-settlement）

## 概要

家庭内の固定費・立替金の精算を補助する機能。夫婦それぞれが支払う固定費を折半し、毎月の精算金額を自動計算する。半年ごとに実費との差額精算も行う。

## ファイル構成

- `pages/settlement.html` — 精算メイン画面（4タブ）
- `js/settlement-utils.js` — 精算計算ロジック（純粋関数、dual export）
- `js/settlement-app.js` — UI・Supabase操作
- `sql/create_settlement_tables.sql` — テーブル定義
- `sql/create_settlement_rpc.sql` — Postgres Functions（Transaction）
- `sql/create_settlement_rpc_monthly_diff.sql` — 差額精算確定（月単位版）Postgres Function
- `sql/create_settlement_revert_rpc.sql` — 精算取消 Postgres Functions
- `sql/create_settlement_audit_log.sql` — 操作ログテーブル定義
- `sql/alter_monthly_expenses_manual.sql` — 手動追加対応（expense_master_id NULLable + name追加）
- `sql/alter_settlement_rls.sql` — RLS無効化（再実行用）
- `sql/alter_settlement_allow_multiple.sql` — 同月複数精算対応ALTER
- `sql/alter_temporary_expenses_beneficiaries.sql` — beneficiaries列追加
- `sql/alter_temporary_expenses_subsidy.sql` — expense_type列追加（補助金対応）
- `sql/alter_temporary_expenses_add_date.sql` — expense_date列追加（立替日、既存は月末日で補完）
- `tests/property-settlement.test.js` — プロパティベーステスト（17 Properties）
- `tests/settlement-integration.test.js` — 統合テスト
- `tests/settlement-deep-check.test.js` — 深層バグチェック

## DBテーブル

### expense_master（固定費マスタ）
- id, name, payer, base_amount, settlement_cycle (monthly/half_year), enabled, created_at, updated_at
- RLS無効

### monthly_expenses（毎月の精算データ）
- id, year_month, expense_master_id (FK, NULL許可), payer, planned_amount, actual_amount
- name: 手動追加項目の項目名（expense_master_idがNULLの場合に使用）
- difference: Generated Column (`CASE WHEN actual_amount IS NULL THEN 0 ELSE actual_amount - planned_amount END`)
- difference_settled, created_at
- UNIQUE (year_month, expense_master_id) — NULLは重複判定対象外
- RLS無効

### settlement_history（精算履歴）
- id, target_period (YYYY-MM or YYYY-H1/H2), payer_from, payer_to, amount
- settlement_type (monthly/difference), settlement_period (first_half/second_half)
- status (pending/paid), memo, paid_at, created_at
- RLS無効

### temporary_expenses（一時的な立替金）
- id, title, payer, amount, beneficiaries (TEXT[], default ['めぐみ','涼介']), expense_date (DATE, NOT NULL), year_month, note, settled, expense_type, created_at
- expense_date: 立替日（YYYY-MM-DD）。入力は日付単位で行い、year_monthは日付から自動導出（先頭7文字）
- year_month: 精算対象月（expense_dateと整合。既存データはexpense_dateを各月の月末日で補完）
- beneficiaries: 受益者（誰の分を立て替えたか）。両方=折半、片方のみ=全額その人が返す
- expense_type: 'expense'（立替金）/ 'subsidy'（補助金）。補助金の場合payerは受取人、折半して相手に半額渡す
- 編集/削除は settled=false（清算前）のみ可能（canEdit/canDeleteTemporaryExpense）
- RLS無効

### settlement_audit_log（操作ログ）
- id, action, target_type, target_id, year_month, detail, created_at
- action: settlement_confirm, settlement_revert, temp_add, temp_edit, temp_delete, monthly_expense_edit, monthly_expense_delete, actual_amount_edit
- RLS無効

## 画面構成（4タブ）

1. 📊 ダッシュボード — 今月の精算結果、未精算月一覧、差額精算待ち、立替金一覧
2. 📋 固定費管理 — マスタCRUD、有効/無効切替
3. 💴 今月の精算 — 月次精算計算・確定・取消・履歴、年月ナビ
4. 📈 差額精算 — 実費入力 + 差額精算確定を1画面で月単位に実施

## 精算結果表示

- 各payerのカード内で「小計」の下に「相手→自分: 〇〇円」を表示
- 金額 = そのpayerが支払った項目の中で相手が負担すべき額を算出
  - 固定費: planned_amount / 2（折半）
  - 一時立替（beneficiaries全員）: amount / 2
  - 一時立替（beneficiaries相手のみ）: amount 全額
  - 一時立替（beneficiaries自分のみ）: 0円
- 端数: Math.round()で四捨五入
- 精算結果カードには最終的な「誰→誰: 〇〇円」のみ表示（世帯合計・一人あたり折半は非表示）

## 設計上の制約

- payer数 = 2（めぐみ・涼介の2人前提）
- calculateSettlement(monthlyExpenses, temporaryExpenses, payers) — 第3引数payersで常に['めぐみ','涼介']を渡す（片方のみ登録時でも折半計算を保証）
- 一時立替の受益者(beneficiaries): 全員=折半、片方のみ=全額返済
- 精算開始月: 2026-06（SETTLEMENT_START_MONTH）。これ以前のデータは生成・表示しない
- 同月に複数回の月次精算が可能（精算後の追加立替対応）
- 端数: floor()で切り捨て、payer_from（支払う側）に有利
- 差額精算期間: 月単位（各月ごとに差額精算を確定）
- Expense_Master変更は既生成のMonthly_Expenseに影響しない
- 「月次精算済み」の判定: settlement_historyにレコードがあるかで導出
- 精算確定はSupabase RPC（Transaction + ROW_COUNTチェック）
- Monthly_Expense生成: 手動ボタン「この月の精算データを作成する」で明示的に作成（INSERT ON CONFLICT DO NOTHING）

## ダッシュボード

- 今月の精算カード: 右上に「＋立替追加」ボタン（翌月の year_month で temporary_expenses に登録）
- 未精算月: SETTLEMENT_START_MONTH〜当月で settlement_history にレコードがない月の一覧
- 差額精算待ち: 半年項目で actual_amount 未入力 or difference_settled=false の月の一覧

## RPC Functions

- `execute_monthly_settlement` — 月次精算確定（重複チェック + history INSERT + temp UPDATE）
- `execute_difference_settlement` — 差額精算確定・半年版（重複チェック + history INSERT + monthly UPDATE）
- `execute_difference_settlement_monthly` — 差額精算確定・月単位版（YYYY-MM形式で保存）
- `revert_monthly_settlement` — 月次精算取消（temp settled→false + history DELETE + Discord/Push通知）
- `revert_difference_settlement` — 差額精算取消（monthly difference_settled→false + history DELETE + Discord/Push通知）

## テスト

```bash
npx vitest run tests/property-settlement.test.js tests/settlement-integration.test.js tests/settlement-deep-check.test.js
```

17 Properties + 統合テスト + 深層チェック = 計61テスト

## 立替入力の日付対応（v2.44.0〜）

- 入力モーダルは日付ピッカー（type="date"）。新規追加時は対象月の月末日を初期値、編集時は保存済みexpense_dateを初期値にする
- year_monthはexpense_dateから自動導出（`yearMonthFromDate`）。月末日算出は`lastDayOfMonth`（settlement-utils.jsに追加、dual export）
- `validateTemporaryExpense`はexpense_date必須・YYYY-MM-DD形式・year_monthとの月整合をチェック
- 清算前（settled=false）なら日付を含めて修正可能
