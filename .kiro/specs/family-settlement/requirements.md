# Requirements Document

## Introduction

既存のお小遣い手帳PWAに、家庭内の固定費・立替金の精算を補助する機能を追加する。夫婦それぞれが家庭の固定費を支払い、毎月初めに負担額を折半して精算する運用を一元管理する。電気代やガソリン代など毎月変動する費用については、あらかじめ基準額で精算し、半年ごとに実費との差額のみをまとめて精算する運用に対応する。一時的な立替金（旅行・家具・イベント等）も同じ仕組みで精算できるようにする。

## Glossary

- **Settlement_App**: 家庭内精算機能全体
- **Expense_Master**: 固定費マスタ。項目名、支払担当、基準額、精算周期（monthly / half_year）、有効フラグを持つ
- **Monthly_Expense**: 毎月生成される精算データ。expense_masterに基づき、基準額（planned_amount）と実費（actual_amount）、差額（difference）を保持する
- **Settlement_History**: 毎月の精算履歴。誰から誰へいくら支払うか、状態（pending / paid）を記録する
- **Temporary_Expense**: 一時的な立替金。旅行・家具・イベント等の臨時支出を登録し、月次精算に加算する
- **Payer**: 支払担当者。文字列で管理する（将来的な複数人対応を考慮）
- **Settlement_Cycle**: 精算周期。monthly（毎月精算）または half_year（半年ごとの差額精算）の2種類
- **Planned_Amount**: 基準額。monthly精算で使用する固定の見積もり金額
- **Actual_Amount**: 実費。half_year周期の項目に対して入力する実際の支払額
- **Difference**: 差額。actual_amount - planned_amount で算出される値
- **Accumulated_Difference**: 累積差額。half_year周期の項目について、半年分の差額を合算した値
- **Difference_Settlement_Period**: 差額精算の対象期間。1〜6月（上半期）と7〜12月（下半期）の固定2期間
- **Settlement_Type**: 精算種別。monthly（月次精算）または difference（差額精算）の2種類

## Requirements

### Requirement 1: 固定費マスタ管理

**User Story:** As a family member, I want to 家庭の固定費項目を登録・編集・無効化できる, so that 毎月の精算対象を一元管理できる。

#### Acceptance Criteria

1. WHEN a user opens the expense master management screen, THE Settlement_App SHALL display a list of all Expense_Master entries with name, payer, base_amount, settlement_cycle, and enabled status.
2. THE Settlement_App SHALL allow registering a new Expense_Master with name (TEXT, required), payer (TEXT, required), base_amount (INTEGER, required, >= 0), and settlement_cycle (TEXT, required, "monthly" or "half_year").
3. WHEN the user submits a new Expense_Master, THE Settlement_App SHALL validate that name is not empty, base_amount is a non-negative integer, and settlement_cycle is either "monthly" or "half_year".
4. IF validation fails, THEN THE Settlement_App SHALL display a specific error message indicating the invalid field.
5. THE Settlement_App SHALL allow editing the name, payer, base_amount, and settlement_cycle of an existing Expense_Master.
6. THE Settlement_App SHALL allow toggling the enabled flag of an Expense_Master to include or exclude the item from future settlements.
7. WHILE an Expense_Master has enabled=false, THE Settlement_App SHALL exclude that item from monthly settlement calculations.
8. THE Settlement_App SHALL retain disabled Expense_Master records and their associated Monthly_Expense history without deletion.

### Requirement 2: 毎月の精算データ生成

**User Story:** As a family member, I want to 毎月の精算データが自動的に生成される, so that 各月の精算対象を個別に管理できる。

#### Acceptance Criteria

1. WHEN a user opens the monthly settlement screen for a specific year_month, THE Settlement_App SHALL generate Monthly_Expense records for all enabled Expense_Master entries that do not yet have records for that year_month.
2. THE Settlement_App SHALL set planned_amount of each generated Monthly_Expense to the base_amount of the corresponding Expense_Master.
3. THE Settlement_App SHALL set actual_amount to NULL and difference to 0 for newly generated Monthly_Expense records.
4. THE Settlement_App SHALL set payer of each Monthly_Expense to the payer of the corresponding Expense_Master at generation time.
5. THE Settlement_App SHALL NOT regenerate Monthly_Expense records that already exist for a given year_month and expense_master_id combination.
6. THE Settlement_App SHALL use the format "YYYY-MM" for year_month values (例: "2026-07").
7. WHEN an Expense_Master's base_amount, payer, or other fields are modified, THE Settlement_App SHALL NOT update already-generated Monthly_Expense records for past year_months. Changes to Expense_Master SHALL only affect newly generated Monthly_Expense records.

### Requirement 3: 月次精算計算

**User Story:** As a family member, I want to 毎月の精算金額を自動計算してもらえる, so that 手計算なしで誰が誰にいくら払うかが分かる。

#### Acceptance Criteria

1. WHEN the user views the monthly settlement for a specific year_month, THE Settlement_App SHALL calculate the total planned_amount per payer from all Monthly_Expense records for that year_month.
2. THE Settlement_App SHALL calculate the household total by summing all payers' planned_amount totals.
3. THE Settlement_App SHALL calculate each payer's fair share by dividing the household total by the number of distinct payers (折半).
4. THE Settlement_App SHALL calculate the settlement amount as each payer's fair share minus that payer's total planned_amount.
5. WHEN payer A's total exceeds payer A's fair share, THE Settlement_App SHALL indicate that other payers owe payer A the excess amount.
6. THE Settlement_App SHALL include Temporary_Expense amounts for the same year_month in the monthly settlement calculation, adding each Temporary_Expense to the corresponding payer's total.
7. THE Settlement_App SHALL display a breakdown showing each payer's items, subtotal, household total, fair share, and the resulting transfer direction and amount.
8. THE Settlement_App SHALL round fractional amounts down to the nearest integer (端数切り捨て).

### Requirement 4: 精算履歴管理

**User Story:** As a family member, I want to 精算結果を記録し精算済みかどうかを管理できる, so that 支払い忘れや二重支払いを防げる。

#### Acceptance Criteria

1. WHEN the monthly settlement is calculated, THE Settlement_App SHALL create a Settlement_History record with year_month, payer_from, payer_to, amount, settlement_type="monthly", and status="pending".
2. THE Settlement_App SHALL store settlement_type as either "monthly" or "difference" to distinguish monthly settlements from difference settlements.
3. THE Settlement_App SHALL display all Settlement_History records for a given year_month with status indication (pending / paid) and settlement_type.
4. WHEN the user marks a settlement as paid, THE Settlement_App SHALL update the status to "paid" and record paid_at timestamp.
5. THE Settlement_App SHALL allow recording a memo (TEXT, optional) on a Settlement_History record to note payment method or other details (例: "PayPayで支払い済み", "現金", "銀行振込").
6. THE Settlement_App SHALL NOT allow modifying a Settlement_History record's amount or settlement_type after status is set to "paid". Memo SHALL remain editable after paid.
7. THE Settlement_App SHALL display past Settlement_History records in reverse chronological order.
8. IF a settlement amount is 0, THEN THE Settlement_App SHALL NOT create a Settlement_History record for that year_month.
9. THE Settlement_App SHALL display all pending Settlement_History records (including past months) on the dashboard, showing the count of unsettled items.

### Requirement 5: 実費入力と差額管理

**User Story:** As a family member, I want to 半年周期の項目に実費を入力し差額を確認できる, so that 基準額と実際の支出の差を把握できる。

#### Acceptance Criteria

1. THE Settlement_App SHALL allow entering actual_amount for Monthly_Expense records where the corresponding Expense_Master has settlement_cycle="half_year".
2. WHEN actual_amount is entered, THE Settlement_App SHALL calculate difference as actual_amount minus planned_amount and store it in the Monthly_Expense record.
3. THE Settlement_App SHALL display a difference management screen showing each half_year item's planned_amount, actual_amount, difference, and accumulated_difference (累積差額).
4. THE Settlement_App SHALL calculate accumulated_difference by summing all unsettled difference values for each half_year Expense_Master.
5. THE Settlement_App SHALL allow editing actual_amount after initial entry, recalculating difference accordingly.
6. THE Settlement_App SHALL display a visual indicator (positive/negative) for each difference value (プラスは追加支払い、マイナスは払い戻し).

### Requirement 6: 半年ごとの差額精算

**User Story:** As a family member, I want to 半年ごとに累積差額をまとめて精算できる, so that 変動費の過不足を定期的に清算できる。

#### Acceptance Criteria

1. THE Settlement_App SHALL define two fixed difference settlement periods per year: 上半期 (January–June) and 下半期 (July–December).
2. THE Settlement_App SHALL display a difference settlement screen showing all half_year items with their accumulated_difference for the selected period.
3. THE Settlement_App SHALL calculate the total accumulated_difference per payer for the selected period.
4. THE Settlement_App SHALL calculate the difference settlement amount using the same fair-share logic as monthly settlement (累積差額合計を折半し、差額を算出).
5. WHEN the user taps the "差額精算" button, THE Settlement_App SHALL create a Settlement_History record with settlement_type="difference" and the calculated difference settlement amount.
6. WHEN the difference settlement is executed, THE Settlement_App SHALL mark all included Monthly_Expense records (within the selected period) as difference_settled=true.
7. WHEN the difference settlement is executed, THE Settlement_App SHALL reset the accumulated_difference display to 0 for the settled period.
8. THE Settlement_App SHALL NOT allow executing difference settlement when accumulated_difference is 0 for all items in the selected period.
9. THE Settlement_App SHALL display a confirmation dialog showing the settlement breakdown before executing the difference settlement.
10. WHEN the user views the difference settlement screen, THE Settlement_App SHALL show a summary suggesting base_amount adjustments based on the average actual_amount for the period (例: "平均実費 22,354円 → 基準額を22,000円へ変更しますか？").

### Requirement 7: 一時的な立替金管理

**User Story:** As a family member, I want to 旅行・家具・イベント等の一時的な立替金を登録できる, so that 臨時支出も月次精算に含めて清算できる。

#### Acceptance Criteria

1. THE Settlement_App SHALL allow registering a Temporary_Expense with title (TEXT, required), payer (TEXT, required), amount (INTEGER, required, > 0), year_month (TEXT, required, "YYYY-MM" format), and note (TEXT, optional).
2. WHEN the user submits a Temporary_Expense, THE Settlement_App SHALL validate that title is not empty and amount is a positive integer.
3. THE Settlement_App SHALL allow entering and editing a note field for additional details (例: "沖縄ホテル代", "IKEA本棚").
4. IF validation fails, THEN THE Settlement_App SHALL display a specific error message indicating the invalid field.
5. THE Settlement_App SHALL display all Temporary_Expense records for a given year_month in the monthly settlement screen.
6. THE Settlement_App SHALL include unsettled Temporary_Expense amounts in the monthly settlement calculation for the corresponding year_month and payer.
7. WHEN a monthly settlement including a Temporary_Expense is marked as paid, THE Settlement_App SHALL mark the Temporary_Expense as settled=true.
8. THE Settlement_App SHALL allow editing and deleting Temporary_Expense records while settled=false.
9. THE Settlement_App SHALL NOT allow editing or deleting Temporary_Expense records after settled=true.

### Requirement 8: 精算ダッシュボード

**User Story:** As a family member, I want to 今月の精算状況を一目で確認できる, so that 精算の進捗や未払い・差額状況をすぐに把握できる。

#### Acceptance Criteria

1. WHEN a user opens the settlement dashboard, THE Settlement_App SHALL display the current month's settlement result (transfer direction and amount).
2. THE Settlement_App SHALL display the current month's settlement status (pending / paid).
3. THE Settlement_App SHALL display all pending (unpaid) Settlement_History records across all months with their count (未払い件数).
4. THE Settlement_App SHALL display a count of half_year items with unsettled differences and the total accumulated_difference.
5. THE Settlement_App SHALL display a list of unsettled Temporary_Expense entries for the current month.
6. THE Settlement_App SHALL provide navigation links to the expense master management, monthly settlement, difference management, and difference settlement screens.
7. THE Settlement_App SHALL display the year_month selector to view past months' settlement information.

### Requirement 9: データ保全と設計原則

**User Story:** As a system operator, I want to 精算データが安全に保持され将来の拡張にも対応できる, so that 過去の精算履歴を参照でき将来的に3人以上の精算にも拡張できる。

#### Acceptance Criteria

1. THE Settlement_App SHALL retain all Settlement_History records without deletion (精算履歴は削除せず保持).
2. THE Settlement_App SHALL store payer values as TEXT to allow future multi-person settlement support.
3. THE Settlement_App SHALL NOT store calculated values (fair share, transfer amount) that can be derived from existing data at query time.
4. THE Settlement_App SHALL separate monthly settlement and difference settlement as independent processes that do not interfere with each other.
5. THE Settlement_App SHALL use UUID as primary key for all tables.
6. THE Settlement_App SHALL record created_at timestamp for all records.
7. THE Settlement_App SHALL record updated_at timestamp for Expense_Master records.

### Requirement 10: アクセスと画面構成

**User Story:** As a family member, I want to お小遣い手帳アプリ内から精算機能にアクセスできる, so that 既存のアプリ内で一貫した操作体験で精算を行える。

#### Acceptance Criteria

1. THE Settlement_App SHALL be accessible from the TOP page (index.html) via a dedicated icon link.
2. THE Settlement_App SHALL function as a page within the existing PWA.
3. THE Settlement_App SHALL use the same Supabase client configuration as other pages in the app.
4. THE Settlement_App SHALL provide tab or section navigation for: 精算ダッシュボード, 固定費管理, 今月の精算, 差額管理, 差額精算.
5. THE Settlement_App SHALL not require additional authentication beyond the existing app access.

## Database Schema

```sql
-- 固定費マスタ
CREATE TABLE IF NOT EXISTS expense_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  payer TEXT NOT NULL,
  base_amount INTEGER NOT NULL DEFAULT 0,
  settlement_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (settlement_cycle IN ('monthly', 'half_year')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expense_master DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_expense_master_enabled ON expense_master (enabled);
CREATE INDEX idx_expense_master_payer ON expense_master (payer);

-- 毎月の精算データ
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL,
  expense_master_id UUID NOT NULL REFERENCES expense_master(id) ON DELETE CASCADE,
  payer TEXT NOT NULL,
  planned_amount INTEGER NOT NULL DEFAULT 0,
  actual_amount INTEGER,
  difference INTEGER GENERATED ALWAYS AS (
    CASE WHEN actual_amount IS NULL THEN 0
         ELSE actual_amount - planned_amount
    END
  ) STORED,
  difference_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE monthly_expenses DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_monthly_expenses_unique ON monthly_expenses (year_month, expense_master_id);
CREATE INDEX idx_monthly_expenses_year_month ON monthly_expenses (year_month);
CREATE INDEX idx_monthly_expenses_payer ON monthly_expenses (payer);

-- 精算履歴
CREATE TABLE IF NOT EXISTS settlement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_period TEXT NOT NULL,
  payer_from TEXT NOT NULL,
  payer_to TEXT NOT NULL,
  amount INTEGER NOT NULL,
  settlement_type TEXT NOT NULL DEFAULT 'monthly' CHECK (settlement_type IN ('monthly', 'difference')),
  settlement_period TEXT CHECK (settlement_period IN ('first_half', 'second_half')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  memo TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE settlement_history DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_settlement_history_target_period ON settlement_history (target_period);
CREATE INDEX idx_settlement_history_status ON settlement_history (status);
CREATE INDEX idx_settlement_history_type ON settlement_history (settlement_type);

-- 一時的な立替金
CREATE TABLE IF NOT EXISTS temporary_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  payer TEXT NOT NULL,
  amount INTEGER NOT NULL,
  year_month TEXT NOT NULL,
  note TEXT,
  settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE temporary_expenses DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_temporary_expenses_year_month ON temporary_expenses (year_month);
CREATE INDEX idx_temporary_expenses_settled ON temporary_expenses (settled);
```

## Screens (画面一覧)

| 画面 | 説明 |
|------|------|
| 精算ダッシュボード | 今月の精算結果、精算済み状況、差額精算待ち件数、立替金一覧を表示 |
| 固定費管理 | 固定費マスタの一覧・追加・編集・有効/無効切替 |
| 今月の精算 | 今月の固定費・一時立替の一覧、合計、自動計算結果、精算実行 |
| 差額管理 | 半年周期項目の基準額・実費・差額・累積差額の一覧、実費入力 |
| 差額精算 | 半年分の累積差額一覧、精算ボタン、精算履歴 |

## Future Extensions (スコープ外)

- 精算履歴グラフ
- 年間負担割合
- LINE送信用メッセージ生成
- PDF出力
- 精算リマインダー
- 3人以上の精算対応
- クレジットカード別管理
- CSV出力
