# Implementation Plan: 家庭内精算機能 (family-settlement)

## Overview

既存のお小遣い手帳PWAに家庭内精算機能を追加する。DB → 純粋関数(utils) → HTML(タブUI) → アプリケーション層(app) → 統合の順で実装し、各マイルストーンで動作確認する。プロパティベーステストは対応する関数実装の直後に配置し、早期にロジック正当性を検証する。

実装順序: SQL(schema+RPC) → settlement-utils.js → settlement.html → settlement-app.js → index.html連携 → PWA更新

---

## Milestone 1: DB・純粋関数・プロパティテスト

- [x] 1. データベースセットアップ
  - [x] 1.1 SQLスキーマファイル作成（sql/settlement-schema.sql）
    - expense_master, monthly_expenses, settlement_history, temporary_expenses の4テーブル作成
    - monthly_expenses.difference は Generated Column（CASE WHEN actual_amount IS NULL THEN 0 ELSE actual_amount - planned_amount END）
    - UNIQUE制約: monthly_expenses (year_month, expense_master_id)
    - CHECK制約: settlement_cycle IN ('monthly','half_year'), status IN ('pending','paid'), settlement_type IN ('monthly','difference')
    - 全テーブル RLS無効化、インデックス作成
    - _Requirements: 9.5, 9.6, 9.7, 2.6, 5.2_
  - [x] 1.2 Supabase RPCファイル作成（sql/settlement-rpc.sql）
    - execute_monthly_settlement: 重複実行チェック（Already settled） + settlement_history INSERT + temporary_expenses UPDATE (settled=true、指定IDがある場合のみROW_COUNT検証)
    - execute_difference_settlement: 重複実行チェック（Already settled） + settlement_history INSERT + monthly_expenses UPDATE (difference_settled=true、ROW_COUNT検証)
    - ROW_COUNTチェック: p_temporary_expense_ids / p_monthly_expense_ids の配列長 > 0 の場合のみ検証（0件は立替なし等の正常ケース）
    - エラー時はRAISE EXCEPTIONでTransaction ROLLBACK
    - _Requirements: 4.1, 4.8, 6.5, 6.6, 7.7_

- [x] 2. 精算ユーティリティ関数の実装（js/settlement-utils.js）
  - [x] 2.1 バリデーション関数を実装
    - validateExpenseMaster(data): name空チェック、base_amount>=0、settlement_cycle値チェック
    - validateTemporaryExpense(data): title空チェック、amount>0チェック
    - dual exportパターン（typeof module !== 'undefined' && module.exports）
    - _Requirements: 1.3, 1.4, 7.1, 7.2_
  - [x]* 2.2 プロパティテスト: Expense_Masterバリデーション
    - **Property 1: Expense_Masterバリデーション**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  - [x]* 2.3 プロパティテスト: Temporary_Expenseバリデーション
    - **Property 10: Temporary_Expenseバリデーション**
    - **Validates: Requirements 7.1, 7.2**
  - [x] 2.4 Monthly_Expense生成関数を実装
    - generateMonthlyExpenses(enabledMasters, existingRecords, yearMonth): enabled=trueのみ対象、重複排除、planned_amount=base_amount、actual_amount=null
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x]* 2.5 プロパティテスト: Monthly_Expense生成の不変条件
    - **Property 2: Monthly_Expense生成の不変条件**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  - [x]* 2.6 プロパティテスト: Monthly_Expense生成の冪等性
    - **Property 3: Monthly_Expense生成の冪等性**
    - **Validates: Requirements 2.5**
  - [x]* 2.7 プロパティテスト: enabled=falseは生成されない
    - **Property 13: enabled=falseは生成されない**
    - **Validates: Requirements 1.7, 2.1**
  - [x] 2.8 月次精算計算関数を実装
    - calculateSettlement(monthlyExpenses, temporaryExpenses) → { payerTotals: {[payer]:number}, payerDiffs: {[payer]:number}, householdTotal: number, fairShare: number, transfers: [{from, to, amount}] }
    - payerDiffs = fairShare - payerTotals[payer]（プラス=支払い不足、マイナス=支払い超過）
    - shouldCreateSettlement(amount): amount===0 → false
    - canEditTemporaryExpense(expense): settled===false → true
    - canDeleteTemporaryExpense(expense): settled===false → true
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.8, 7.8, 7.9_
  - [x]* 2.9 プロパティテスト: 月次精算の収支均衡
    - **Property 4: 月次精算の収支均衡**
    - **Validates: Requirements 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8**
  - [x]* 2.10 プロパティテスト: 精算額0→非生成
    - **Property 5: 精算額0→非生成**
    - **Validates: Requirements 4.8**
  - [x]* 2.11 プロパティテスト: Transfer総額の収支均衡
    - **Property 12: Transfer総額の収支均衡**
    - **Validates: Requirements 3.4, 6.4**
  - [x]* 2.12 プロパティテスト: calculateSettlementの純粋関数保証
    - **Property 14: calculateSettlementの純粋関数保証**
    - **Validates: Design Principle（テスタビリティ）**
  - [x] 2.13 差額計算関数群を実装
    - calculateDifference(actualAmount, plannedAmount): actual=null→0、それ以外→actual-planned
    - calculateAccumulatedDifference(monthlyExpenses): payer別のdifference合計
    - getDifferenceSettlementPeriod(yearMonth): 1-6月→'first_half'、7-12月→'second_half'
    - getPeriodMonths(year, period): 期間内のyear_month配列
    - _Requirements: 5.2, 5.4, 6.1, 6.3_
  - [x]* 2.14 プロパティテスト: 差額計算の正確性
    - **Property 6: 差額計算の正確性**
    - **Validates: Requirements 5.2**
  - [x]* 2.15 プロパティテスト: 累積差額の集計正確性
    - **Property 7: 累積差額の集計正確性**
    - **Validates: Requirements 5.4, 6.3**
  - [x] 2.16 差額精算計算関数を実装
    - calculateDifferenceSettlement(monthlyExpenses): payerDiffs集計、折半ロジック（floor）、transfers、suggestions
    - suggestBaseAmountAdjustments(monthlyExpenses): actual_amount!=nullのみで平均→1000円単位丸め
    - _Requirements: 6.2, 6.3, 6.4, 6.10_
  - [x]* 2.17 プロパティテスト: 差額精算の公平分担計算
    - **Property 8: 差額精算の公平分担計算**
    - **Validates: Requirements 6.4**
  - [x]* 2.18 プロパティテスト: 基準額調整提案
    - **Property 9: 基準額調整提案**
    - **Validates: Requirements 6.10**
  - [x]* 2.19 プロパティテスト: actual_amount=nullは平均に含めない
    - **Property 15: actual_amount=nullは平均に含めない**
    - **Validates: Requirements 6.10**
  - [x]* 2.20 プロパティテスト: calculateDifferenceSettlementの純粋関数保証
    - **Property 16: calculateDifferenceSettlementの純粋関数保証**
    - **Validates: Design Principle（テスタビリティ）**
  - [x]* 2.21 プロパティテスト: 精算済みTemporary_Expenseの不変性
    - **Property 11: 精算済みTemporary_Expenseの不変性（canEdit/canDelete判定ロジック）**
    - テスト対象: canEditTemporaryExpense(), canDeleteTemporaryExpense() — settled=true→false、settled=false→true
    - **Validates: Requirements 7.8, 7.9**
  - [x]* 2.22 プロパティテスト: calculateSettlementの順序不変性
    - **Property 17: 入力配列の順番を変えても結果は同一**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 3. Checkpoint — Milestone 1 完了確認
  - Property Test OK（実装したProperty全パス、最大17個）
  - SQLファイルの構文確認
  - `git commit -m "feat(settlement): Milestone 1 - DB schema + utils + property tests"`

---

## Milestone 2: HTML・UI・アプリケーション層

- [x] 4. HTMLページ作成（pages/settlement.html）
  - [x] 4.1 settlement.htmlの基本構造作成
    - head（meta viewport, common.js読み込み）
    - ナビゲーション（←戻る / 🏠ホーム）
    - タブバー（📊ダッシュボード / 📋固定費管理 / 💴今月の精算 / 📈差額管理 / 🔄差額精算）
    - 各タブ用コンテナ（tab-dashboard, tab-master, tab-monthly, tab-difference, tab-diff-settlement）
    - script読み込み順序: common.js → settlement-utils.js → settlement-app.js
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 5. アプリケーション層の実装（js/settlement-app.js）
  - [x] 5.1 初期化・タブ切り替え・ダッシュボードを実装
    - initApp(): タブイベント設定、初期表示（ダッシュボード）
    - switchTab(tabName): コンテナ表示切替、対応データロード
    - loadDashboard(): 今月の精算結果カード、未払い件数バッジ、差額精算待ちサマリー、立替金一覧
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [x] 5.2 固定費マスタ管理UIを実装
    - loadExpenseMasters(): 一覧表示（name, payer, base_amount, settlement_cycle, enabled）
    - saveExpenseMaster(data): バリデーション→INSERT/UPDATE（既生成のMonthly_Expenseは更新しない）
    - toggleExpenseMasterEnabled(id, enabled): 有効/無効切替
    - 追加/編集モーダル（フォーム＋バリデーションエラー表示）
    - 注意: base_amount/payer変更は既生成Monthly_Expenseに影響しない。次月以降の新規生成分のみに適用
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.7_
  - [x] 5.3 月次精算画面を実装
    - loadMonthlySettlement(yearMonth): Monthly_Expense自動生成(INSERT ON CONFLICT DO NOTHING) + payer別一覧 + Temporary_Expense一覧 + 計算結果表示
    - 「精算済み」判定: settlement_historyに該当year_monthのtype=monthlyレコードが存在するかで判定
    - executeMonthlySettlement(yearMonth): RPC呼び出し（execute_monthly_settlement）、精算額0時はボタン非活性
    - renderSettlementResult(): payer別項目一覧、合計、fair share、payerDiffs（+/-表示）、transfer方向・金額表示
    - 精算履歴一覧（pending/paid表示、paid_at記録、memoフィールド）
    - 年月セレクタ
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  - [x] 5.4 一時立替管理UIを実装
    - loadTemporaryExpenses(yearMonth): 一覧表示（title, payer, amount, note, settled状態）
    - saveTemporaryExpense(data): バリデーション→INSERT
    - editTemporaryExpense(id, data): settled=falseのみ許可
    - deleteTemporaryExpense(id): settled=falseのみ許可、確認ダイアログ
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  - [x] 5.5 差額管理画面を実装
    - loadDifferenceManagement(): half_year項目一覧、planned_amount/actual_amount/difference/accumulated_difference表示
    - saveActualAmount(id, actualAmount): actual_amount更新（差額は Generated Column 自動算出）
    - 差額の色分け表示（プラス/マイナス）
    - 精算済みレコードは入力欄非活性化
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 5.6 差額精算画面を実装
    - loadDifferenceSettlement(year, period): 期間セレクタ（上半期/下半期）、累積差額一覧、精算金額表示
    - executeDifferenceSettlement(year, period): RPC呼び出し（execute_difference_settlement）、確認ダイアログ、accumulated_difference=0時はボタン非活性
    - 基準額調整提案表示（suggestBaseAmountAdjustments結果）
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [x] 6. Checkpoint — Milestone 2 完了確認
  - 全タブが表示され、データのCRUD操作が正常動作すること
  - 精算確定（月次・差額）がRPC経由で動作すること
  - バリデーションエラーが正しく表示されること
  - エラーハンドリング（Toast表示、リトライ）が動作すること
  - `git commit -m "feat(settlement): Milestone 2 - HTML + app layer"`

---

## Milestone 3: 統合・リリース準備

- [x] 7. TOPページ連携とPWA更新
  - [x] 7.1 index.htmlに💰アイコンリンク追加
    - 既存アイコン列に精算機能リンクを追加（pages/settlement.htmlへ遷移）
    - _Requirements: 10.1_
  - [x] 7.2 sw.jsのキャッシュ対象に精算関連ファイルを追加
    - pages/settlement.html, js/settlement-utils.js, js/settlement-app.js をキャッシュリストに追加
    - CACHE_NAMEバージョン +1
    - _Requirements: 10.2_

- [x] 8. Checkpoint — 最終確認
  - Property Test OK（実装したProperty全パス、最大17個）
  - 手動確認: 固定費登録 → 月次精算 → 実費入力 → 差額精算 → ダッシュボード表示が動作すること
  - TOPページからのナビゲーション確認
  - `git commit -m "feat(settlement): complete family-settlement feature"`

---

## Notes

- Property Testはオプショナル（`*`付き）。スキップした場合はCheckpointの「全パス」条件から除外される
- Property番号はdesign.mdのCorrectness Properties番号と完全一致
- settlement-utils.jsはdual exportパターン（既存recipe-utils.jsと同じ）
- 2人（payer数=2）前提で実装。将来の3人以上対応のためpayerはTEXTで管理
- 端数処理: floor()で切り捨て、余りはpayer_from（支払う側）に有利
- differenceは Generated Column → アプリ側で更新不要。JS側のcalculateDifference()はUI即時表示専用
- 精算確定はSupabase RPC（Transaction）で実行、ROW_COUNTチェック付き
- Monthly_Expense生成は INSERT ... ON CONFLICT DO NOTHING で冪等性を保証
- settlement_historyはtarget_period列を使用。フォーマット: monthly→`YYYY-MM`（例: 2026-07）、difference→`YYYY-H1`/`YYYY-H2`（例: 2026-H1）
- RPC重複実行防止: settlement_historyに同じtarget_period+settlement_typeのレコードが既存なら RAISE EXCEPTION 'Already settled'
- ROW_COUNTチェック: 配列長>0の場合のみ検証。配列長=0（立替なし等）は正常ケースとして通す
- 「月次精算済み」の判定: settlement_historyにレコードがあるかで導出（monthly_expensesにフラグは持たない）
- Expense_Master変更は既生成のMonthly_Expenseに影響しない（次月以降の新規生成分のみ）
- エラーハンドリング: RPC失敗→全ROLLBACK+Toast、ネットワーク失敗→Toast+リトライ、バリデーション→フィールド下赤文字
- 各タスクは1コミットで完結する粒度を意識
