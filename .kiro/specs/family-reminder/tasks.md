# Implementation Plan: Family Reminder

## Overview

家族向けお小遣い管理PWA「お小遣い手帳」にリマインダー機能を追加する。Supabase に `reminders` テーブルを作成し、child.html（登録・削除）、index.html（通知バナー）のUIを実装、GitHub Actions で5分毎のDiscord通知Cronを構築し、最後にadmin.html（管理）を実装する。

## Tasks

- [x] 1. データベーステーブル作成
  - [x] 1.1 `reminders` テーブルのSQLマイグレーションファイルを作成
    - `sql/create_reminders_table.sql` を作成
    - テーブル定義（id, type, child_id, child_name, message, event_date, creator_user_id, creator_role, custom_schedule, snooze_until, created_at, deleted_at）
    - child_name は非正規化フィールド（JOIN不要でCron通知メッセージ組み立て可能）。コメント追加: `-- child_name is denormalized. Source of truth is children.name`
    - CHECK制約（chk_event_date, chk_custom_schedule, type IN ('memo','event'), creator_role IN ('admin','user'), message length 1-200）
    - インデックス（idx_reminders_child_id, idx_reminders_type_event_date, idx_reminders_snooze）
    - RLSコメント追加:
      ```sql
      -- RLS disabled intentionally for consistency with existing app tables
      -- TODO: Evaluate RLS before production
      ```
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. child.html — リマインダー登録・削除セクション
  - [x] 2.1 リマインダーセクションUIの追加
    - 📋履歴セクションの後に「🔔 リマインダー」アコーディオンセクションを追加
    - 登録フォーム: テキスト入力（maxlength=200）、「日付を指定しない」チェックボックス、日付入力フィールド、送信ボタン
    - チェックボックスON時に日付フィールドを非表示/無効化
    - バリデーション: メッセージは trim() してからバリデーション（スペースのみは拒否）、trimmed length 1-200文字、日付未指定時のエラー、過去日付のエラー
    - 3秒デバウンスによる重複送信防止（メモリ内 `lastSubmitAt`）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 12.1, 12.2, 12.3_
  - [x] 2.2 リマインダー登録処理の実装
    - `reminder_device_id` の localStorage 管理（未設定時は自動生成）
    - reminder_device_id is an anonymous per-device identifier, not user authentication
    - Supabase INSERT（type, child_id, child_name, message, event_date, creator_user_id, creator_role）
    - 登録成功時の確認メッセージ表示
    - 登録成功時の Discord 通知送信（notifyDiscord関数使用、3秒タイムアウト）
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 12.4, 12.5_
  - [x] 2.3 リマインダー一覧表示と削除機能
    - child_id に紐づくアクティブリマインダー一覧を表示（deleted_at IS NULL）
    - creator_user_id が一致するリマインダーにのみ削除ボタン表示
    - 削除ボタンタップで soft delete:
      ```sql
      UPDATE reminders SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
      -- 冪等: 既に削除済みなら0行更新
      ```
    - _Requirements: 6.1, 6.2_

- [x] 3. index.html — 通知バナー
  - [x] 3.1 通知バナー領域の追加とリマインダー表示
    - `#reminderBanner` div をタイトル下に追加
    - Memo_Reminder: deleted_at IS NULL、created_at 降順で全件表示（子供名、メッセージ、登録日JST）
    - Event_Reminder: event_date が今日から7日以内（00:00 JST基準）、event_date 昇順で表示（子供名、メッセージ、イベント日、残り日数）
    - 過去の Event_Reminder は非表示
    - スヌーズ中のリマインダーも表示する（Discord通知のみ停止）
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.3_
  - [x] 3.2 admin用バナー操作ボタン
    - admin時: 各リマインダーに ×（削除）ボタン表示、タップで soft delete:
      ```sql
      UPDATE reminders SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
      -- 冪等: 既に削除済みなら0行更新
      ```
    - admin時: 各リマインダーにスヌーズボタン表示、タップで日数入力ダイアログ → snooze_until 保存
    - スヌーズ入力値バリデーション: positive integer only, max 365。0や負数は拒否
    - スヌーズ中リマインダーに残り日数インジケーター表示
    - user時: 操作ボタン非表示
    - _Requirements: 6.3, 6.4, 6.5, 10.1, 10.3, 10.4, 10.7, 10.8_

- [x] 4. Checkpoint - child.html と index.html の動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. GitHub Actions Cron ジョブ
  - [x] 5.1 `scripts/reminder-notify.js` の作成
    - use native fetch (Node 20+), no external dependencies required
    - Supabase REST API でアクティブリマインダー取得（deleted_at IS NULL）
    - 現在のJST時刻を取得
    - 5分ウィンドウ方式で通知対象を判定（`isInWindow` 関数）: 「07:50 schedule matches 07:50:00–07:54:59」、`isInWindow(scheduled, now): scheduled <= now < scheduled + 5`
    - スヌーズ中リマインダーのスキップ（current_jst_date < snooze_until）
    - Event_Reminder の通知ウィンドウ判定（event_date - 7日 〜 event_date）
    - 過去の Event_Reminder スキップ
    - custom_schedule 対応（設定あり→カスタム時間、なし→デフォルト 07:50/17:30）
    - 統合メッセージフォーマット作成・Discord Webhook 送信
    - 純粋関数を module.exports で export（テスト用）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 10.5, 10.6_
  - [x] 5.2 `.github/workflows/reminder-notify.yml` の作成
    - cron: `*/5 * * * *` スケジュール
    - workflow_dispatch（手動実行）対応
    - Node.js 20 セットアップ
    - 環境変数: SUPABASE_URL, SUPABASE_KEY, DISCORD_WEBHOOK（secrets）
    - `node scripts/reminder-notify.js` 実行
    - _Requirements: 8.1_

- [x] 6. admin.html — リマインダー管理セクション
  - [x] 6.1 リマインダー管理セクションUIの追加
    - 既存セクション末尾に「🔔 リマインダー管理」セクションを追加
    - 全リマインダー一覧表示（soft delete除外、created_at降順JST）
    - 各リマインダーに: type、子供名、メッセージ、event_date、通知スケジュール、スヌーズ状態、creator_role、ステータス（active/past/snoozed）
    - 過去の Event_Reminder に「過去」ラベル表示
    - 登録フォームは設置しない（登録は child.html からのみ）
    - _Requirements: 11.1, 11.3, 11.4, 7.2_
  - [x] 6.2 管理操作の実装（削除・スヌーズ・通知カスタマイズ）
    - 削除ボタン: 全リマインダーに表示、タップで soft delete:
      ```sql
      UPDATE reminders SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
      -- 冪等: 既に削除済みなら0行更新
      ```
    - スヌーズボタン: 日数入力ダイアログ → snooze_until 計算・保存
    - スヌーズ入力値バリデーション: positive integer only, max 365。0や負数は拒否
    - 通知時間カスタマイズUI: `<input type="time">` を使用し、複数エントリを追加/削除可能なUI。「＋」ボタンで時間追加、各エントリに「×」で削除。保存時に JSONB 配列として custom_schedule に保存
    - カスタムスケジュール削除時は NULL に戻す（デフォルトスケジュールに復帰）
    - 現在の通知スケジュール（デフォルト or カスタム）を各リマインダーに表示
    - _Requirements: 6.6, 6.7, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.2, 10.3, 10.4_

- [x] 7. Checkpoint - Cron ジョブと admin.html の動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Property-Based Tests
  - [ ]* 8.1 Property 1: Message length validation テスト
    - **Property 1: Message length validation**
    - fast-check で任意文字列を生成し、validateMessage の accept/reject が trimmed length 1-200 と一致することを検証
    - **Validates: Requirements 2.5, 12.1**
  - [ ]* 8.2 Property 2: Event date validation テスト
    - **Property 2: Event date validation**
    - fast-check で任意日付を生成し、validateEventDate が過去日付のみ reject することを検証
    - **Validates: Requirements 2.6**
  - [ ]* 8.3 Property 4: Cron notification filter テスト
    - **Property 4: Cron notification filter (5-minute window)**
    - fast-check でリマインダー配列と現在時刻を生成し、filterDueReminders の結果が5条件（deleted_at, snooze, memo/event window, time window）を満たすことを検証
    - **Validates: Requirements 3.4, 8.2, 8.3, 8.4, 8.5, 8.7, 8.8, 10.5, 10.6**
  - [ ]* 8.4 Property 5: TOP page banner filter and sort テスト
    - **Property 5: TOP page banner filter and sort**
    - fast-check でリマインダー配列と今日の日付を生成し、バナーフィルタ結果の順序と包含条件を検証
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.6, 5.7, 7.3**
  - [ ]* 8.5 Property 7: Custom schedule validation テスト
    - **Property 7: Custom schedule validation**
    - fast-check で任意JSONB値を生成し、validateCustomSchedule が HH:MM 配列のみ accept することを検証
    - **Validates: Requirements 1.5, 9.3, 9.4, 9.5**
  - [ ]* 8.6 Property 8: Snooze date calculation テスト
    - **Property 8: Snooze date calculation and boundary**
    - fast-check で任意日付と正整数Nを生成し、calculateSnoozeUntil が current + N 日であることを検証
    - **Validates: Requirements 10.4, 10.5, 10.6**
  - [ ]* 8.7 Property 9: Duplicate submission debounce テスト
    - **Property 9: Duplicate submission debounce (frontend)**
    - fast-check で2つのタイムスタンプを生成し、差が3秒未満なら reject、3秒以上なら accept を検証
    - **Validates: Requirements 2.8, 12.3**

- [x] 9. リリース更新（必須）
  - [x] 9.1 `pages/release-notes.html` にリマインダー機能のリリースノートを追記
    - バージョン番号を上げる（feat タグ）
    - _Requirements: 開発ルール_
  - [x] 9.2 `sw.js` の `CACHE_NAME` バージョン番号を +1
    - _Requirements: 開発ルール_
  - [x] 9.3 `index.html` のバージョン表示テキストを新バージョンに更新
    - _Requirements: 開発ルール_

- [x] 10. Final checkpoint - 全体動作確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 既存の inline JS パターンに準拠（ビルドステップなし）
- Property-based tests は `scripts/` 配下の純粋関数に対して fast-check で実行
- Discord通知失敗はUXをブロックしない（既存パターン準拠、3秒タイムアウト）
- Supabase クライアントは既存の `client` 変数を使用（js/common.js で初期化済み）
- child_name は非正規化フィールド（Design doc: "denormalized for Cron script performance"）。Source of truth は children.name
- Cron スクリプトは native fetch (Node 20+) を使用、外部依存なし
