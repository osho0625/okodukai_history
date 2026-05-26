# Requirements Document

## Introduction

家族向けお小遣い管理PWAアプリ「お小遣い手帳」にリマインダー機能を追加する。本機能は個別アカウントページ（child.html）を入口とした統一的なリマインダー機能であり、全ユーザーが同じ登録フォームを使用する（権限差なし）。

- **全ユーザー共通**: テキスト＋日付フィールド（「日付を指定しない」チェックボックス付き）でリマインダーを登録できる
  - 「日付を指定しない」ON → メモ型リマインダー（削除されるまで毎日通知）
  - 「日付を指定しない」OFF → 行事リマインダー（7日前から当日まで毎日通知）
- **Discord通知**: デフォルト1日2回（7:50 JST、17:30 JST）
- **Cron実行**: 5分毎に実行し、該当時間のリマインダーのみ通知を送信
- **通知時間カスタマイズ**: admin限定で、リマインダーごとに通知時間を個別設定可能
- **通知一時停止（スヌーズ）**: admin限定で、指定日数間Discord通知を停止可能（JSTカレンダー日単位）
- **削除方法**:
  - 個別ページ（child.html）から: 自分が作成したリマインダーのみ削除可能（creator_user_idで識別）
  - TOP画面（index.html）の通知バナーから: admin権限のみ直接削除ボタン表示
  - admin.htmlから: admin権限で全リマインダー削除可能
- **タイムゾーン**: 全タイムスタンプはUTCで保存し、UIではJSTで表示する
- **過去のEvent_Reminder**: DBに残り続け（soft delete方式）、admin.htmlでは表示するがTOP画面には表示しない

## Glossary

- **Reminder_System**: リマインダー機能全体を管理するシステム
- **Child_Page**: pages/child.html（個別アカウントページ、リマインダー登録・削除の入口）
- **TOP_Page**: index.html（アプリのトップ画面、リマインダー表示先）
- **Admin_Page**: pages/admin.html（管理者ページ、リマインダー一覧管理）
- **Admin**: deviceRole=adminの端末操作者（親）
- **User**: deviceRole=userの端末操作者（子供）
- **Memo_Reminder**: 「日付を指定しない」ONで登録されたメモ型リマインダー（削除されるまで毎日通知）
- **Event_Reminder**: 「日付を指定しない」OFFで日付を指定して登録された行事リマインダー（7日前00:00 JSTから当日まで通知）
- **Discord_Notifier**: Discord Webhookを使用した通知送信機能（既存のnotifyDiscord関数）
- **Cron_Job**: GitHub Actionsのスケジュール実行ワークフロー（5分毎に実行）
- **Notification_Banner**: TOP画面タイトル下に表示される通知バナー領域
- **Custom_Schedule**: admin限定で設定可能なリマインダーごとの個別通知時間（HH:MM JST形式の配列）
- **Snooze**: admin限定で設定可能な通知一時停止機能（指定日数間Discord通知を停止、JSTカレンダー日単位で計算）
- **JST**: 日本標準時（UTC+9）。UIでの表示・通知時間の基準
- **UTC**: 協定世界時。データベースでのタイムスタンプ保存基準
- **creator_user_id**: リマインダー作成者を識別する端末識別子（localStorage管理）
- **Soft_Delete**: deleted_atカラムにタイムスタンプを設定することによる論理削除方式

## Database Schema

```
Reminder {
  id: UUID (PK)
  type: TEXT ('memo' | 'event')
  child_id: UUID (FK → children)
  child_name: TEXT
  message: TEXT (1-200 chars)
  event_date: DATE (nullable, event型のみ)
  creator_user_id: TEXT (端末識別子, NOT NULL)
  creator_role: TEXT ('admin' | 'user')
  custom_schedule: JSONB (nullable, 例: ["06:00","21:00"])
  snooze_until: DATE (nullable, JST calendar date)
  created_at: TIMESTAMPTZ (UTC)
  deleted_at: TIMESTAMPTZ (nullable, soft delete)
}
```

- 全タイムスタンプ（created_at, deleted_at）はUTCで保存する
- event_dateはJSTカレンダー日付（DATE型）で保存する
- snooze_untilはJSTカレンダー日付（DATE型）で保存する
- custom_scheduleはJST時刻のHH:MM文字列配列で保存する
- soft delete方式: 削除時はdeleted_atにUTCタイムスタンプを設定し、物理削除しない
- creator_user_idは必須（NOT NULL）。削除権限の判定に使用する

## Requirements

### Requirement 1: タイムゾーンとデータ保存

**User Story:** As a developer, I want all timestamps stored in UTC and displayed in JST, so that the system handles timezone consistently and correctly for a Japan-based family.

#### Acceptance Criteria

1. THE Reminder_System SHALL store all timestamps (created_at, deleted_at) in UTC (TIMESTAMPTZ)
2. THE Reminder_System SHALL render all timestamps in JST (UTC+9) in the UI
3. THE Reminder_System SHALL store event_date as a JST calendar date (DATE type)
4. THE Reminder_System SHALL store snooze_until as a JST calendar date (DATE type)
5. THE Reminder_System SHALL store custom_schedule times as HH:MM strings in JST

### Requirement 2: リマインダー登録UI（全ユーザー共通フォーム）

**User Story:** As a family member, I want to register reminders from the child's individual page using the same form regardless of my role, so that everyone can create both memo and event reminders equally.

#### Acceptance Criteria

1. THE Child_Page SHALL display a reminder registration section with a text input field (1-200 characters), a "日付を指定しない" checkbox, a date input field, and a submit button
2. WHEN the "日付を指定しない" checkbox is checked, THE Reminder_System SHALL disable and hide the date input field
3. WHEN the "日付を指定しない" checkbox is unchecked, THE Reminder_System SHALL enable and display the date input field for date selection
4. THE Reminder_System SHALL present the same registration form to both Admin and User without any difference in available fields
5. IF a user submits a message shorter than 1 character or longer than 200 characters, THEN THE Reminder_System SHALL display a validation error and prevent submission
6. IF a user submits a reminder with the checkbox unchecked and a past date, THEN THE Reminder_System SHALL display an error and prevent submission
7. IF a user submits a reminder with the checkbox unchecked and no date entered, THEN THE Reminder_System SHALL display an error and prevent submission
8. IF a user submits a duplicate request within 3 seconds of a previous submission, THEN THE Reminder_System SHALL ignore the duplicate submission

### Requirement 3: メモ型リマインダーの登録（日付を指定しない）

**User Story:** As a family member, I want to post a memo reminder without a date, so that I can communicate important information to the family and be reminded every day until it is resolved.

#### Acceptance Criteria

1. WHEN a user submits a reminder with the "日付を指定しない" checkbox checked, THE Reminder_System SHALL save it as a Memo_Reminder with the child's name, message content (1-200 chars), creator_user_id, creator_role, and creation timestamp (UTC) to the database
2. WHEN a Memo_Reminder is saved successfully, THE Reminder_System SHALL display a confirmation message to the user
3. WHEN a Memo_Reminder is saved successfully, THE Discord_Notifier SHALL send a creation notification containing the child's name and message content to the Discord channel
4. THE Cron_Job SHALL send Discord notifications for all active Memo_Reminders at the default times (7:50 JST and 17:30 JST) every day until the Memo_Reminder is soft-deleted

### Requirement 4: 行事リマインダーの登録（日付あり）

**User Story:** As a family member, I want to register upcoming events with dates and descriptions for a specific child, so that the family doesn't forget important items or preparations.

#### Acceptance Criteria

1. WHEN a user submits a reminder with the "日付を指定しない" checkbox unchecked and a valid future date, THE Reminder_System SHALL save it as an Event_Reminder with the child's name, event date, message (1-200 chars), creator_user_id, creator_role, and creation timestamp (UTC) to the database
2. WHEN an Event_Reminder is saved successfully, THE Reminder_System SHALL display a confirmation message to the user
3. WHEN an Event_Reminder is saved successfully, THE Discord_Notifier SHALL send a creation notification containing the child's name, event date, and message content to the Discord channel
4. THE Reminder_System SHALL associate the Event_Reminder with the child whose individual page is currently displayed

### Requirement 5: リマインダーのTOP画面表示

**User Story:** As a family member, I want to see active reminders on the TOP page, so that everyone is aware of messages and upcoming events.

#### Acceptance Criteria

1. WHEN the TOP_Page loads, THE Notification_Banner SHALL display all active Memo_Reminders (not soft-deleted) sorted by created_at newest first
2. WHEN the TOP_Page loads, THE Notification_Banner SHALL display Event_Reminders whose event_date is within 7 calendar days from today (starting at 00:00 JST exactly 7 calendar days before the event date, inclusive of the event date), sorted by nearest event date first
3. THE Notification_Banner SHALL display Memo_Reminders first (sorted newest-first by created_at), followed by Event_Reminders below (sorted by nearest event date)
4. THE Notification_Banner SHALL display each Memo_Reminder with the child's name, message content, and submission date (in JST)
5. THE Notification_Banner SHALL display each Event_Reminder with the child's name, event date, days remaining, and message content
6. WHEN an Event_Reminder's event_date has passed, THE Notification_Banner SHALL stop displaying that Event_Reminder on the TOP_Page
7. WHILE a reminder has an active Snooze, THE Notification_Banner SHALL still display the reminder (Snooze only affects Discord notifications)

### Requirement 6: リマインダーの削除

**User Story:** As a family member, I want to delete reminders I created from the child page, and as an Admin I want to quickly dismiss reminders from the TOP page and admin page.

#### Acceptance Criteria

1. THE Child_Page SHALL display a delete button only on reminders whose creator_user_id matches the current user's device identifier
2. WHEN a user taps the delete button on the Child_Page, THE Reminder_System SHALL soft-delete the reminder by setting deleted_at to the current UTC timestamp
3. WHILE deviceRole is "admin", THE Notification_Banner SHALL display a dismiss button (×) on each reminder
4. WHEN an Admin taps the dismiss button on the Notification_Banner, THE Reminder_System SHALL soft-delete the reminder and remove it from the display
5. WHILE deviceRole is "user", THE Notification_Banner SHALL display reminders without a dismiss button
6. WHILE deviceRole is "admin", THE Admin_Page SHALL display a delete button on all reminders (including past Event_Reminders)
7. WHEN an Admin taps the delete button on the Admin_Page, THE Reminder_System SHALL soft-delete the reminder

### Requirement 7: 過去のEvent_Reminderの扱い

**User Story:** As an Admin, I want past event reminders to remain in the database for reference, so that I can review history and manually clean up when appropriate.

#### Acceptance Criteria

1. WHEN an Event_Reminder's event_date has passed, THE Reminder_System SHALL retain the record in the database (no automatic deletion)
2. THE Admin_Page SHALL display past Event_Reminders in the reminder management section with a "past" status indicator
3. THE TOP_Page SHALL exclude past Event_Reminders from the Notification_Banner display
4. WHEN an Admin manually deletes a past Event_Reminder from the Admin_Page, THE Reminder_System SHALL soft-delete the record by setting deleted_at

### Requirement 8: Discord定期通知（5分毎Cron）

**User Story:** As a family member, I want to receive Discord notifications at scheduled times for active reminders, so that the family is reminded consistently and doesn't forget important things.

#### Acceptance Criteria

1. THE Cron_Job SHALL execute every 5 minutes and dispatch notifications for reminders due at that time
2. WHEN the current time (in JST) matches a reminder's scheduled notification time (default: 7:50 JST and 17:30 JST), THE Discord_Notifier SHALL send notifications for all active Memo_Reminders that are not snoozed
3. WHEN an Event_Reminder's notification window is active (starting at 00:00 JST exactly 7 calendar days before the event_date) and the current time matches the scheduled notification time and the reminder is not snoozed, THE Cron_Job SHALL send a Discord notification containing the child's name, event date, days remaining, and message content
4. WHEN an Event_Reminder's event_date has passed, THE Cron_Job SHALL stop sending notifications for that event
5. WHEN a reminder has been soft-deleted, THE Cron_Job SHALL stop sending notifications for that reminder
6. THE Cron_Job SHALL send one consolidated notification message containing all due reminders for that execution
7. WHEN a reminder has a Custom_Schedule configured, THE Cron_Job SHALL send notifications for that reminder only at the custom-specified times (in JST) instead of the default times
8. WHEN a reminder does not have a Custom_Schedule configured, THE Cron_Job SHALL use the default notification times (7:50 JST and 17:30 JST)

### Requirement 9: 通知時間カスタマイズ（admin限定）

**User Story:** As an Admin, I want to set custom notification times for individual reminders, so that I can control when specific reminders are sent based on their importance or context.

#### Acceptance Criteria

1. WHILE deviceRole is "admin", THE Admin_Page SHALL display a notification time customization option for each reminder in the reminder management section
2. WHILE deviceRole is "user", THE Reminder_System SHALL hide the notification time customization UI
3. WHEN an Admin sets custom notification times for a reminder, THE Reminder_System SHALL save the specified times (one or more HH:MM values in JST) as a JSONB array to the database
4. THE Reminder_System SHALL allow an Admin to specify one or more notification times per reminder (e.g., ["06:00"] or ["07:50","17:30","21:00"])
5. WHEN an Admin removes all custom notification times from a reminder, THE Reminder_System SHALL revert that reminder to the default notification schedule (7:50 JST and 17:30 JST) by setting custom_schedule to NULL
6. THE Admin_Page SHALL display the current notification schedule (default or custom) for each reminder

### Requirement 10: 通知一時停止（スヌーズ）

**User Story:** As an Admin, I want to temporarily pause Discord notifications for a specific reminder for a set number of days, so that I can suppress notifications during periods when they are not needed without deleting the reminder.

#### Acceptance Criteria

1. WHILE deviceRole is "admin", THE TOP_Page Notification_Banner SHALL display a snooze button on each reminder
2. WHILE deviceRole is "admin", THE Admin_Page SHALL display a snooze button on each reminder in the reminder management section
3. WHEN an Admin taps the snooze button, THE Reminder_System SHALL display a dialog to input the number of days to pause notifications
4. WHEN an Admin confirms the snooze duration, THE Reminder_System SHALL calculate the snooze end date in JST calendar days (current JST date + specified days) and save it to the database
5. WHILE a reminder's snooze_until date has not passed (compared at 00:00 JST), THE Cron_Job SHALL skip sending Discord notifications for that reminder
6. WHEN a reminder's snooze_until date has passed (current JST date >= snooze_until), THE Cron_Job SHALL automatically resume sending Discord notifications for that reminder
7. WHILE a reminder is snoozed, THE Notification_Banner SHALL display a snooze indicator showing the remaining snooze days
8. WHILE deviceRole is "user", THE Reminder_System SHALL hide the snooze button

### Requirement 11: リマインダー管理（管理者ページ）

**User Story:** As an Admin, I want to view and manage all registered reminders from the admin page, so that I can manage the full list, customize notifications, and correct mistakes.

#### Acceptance Criteria

1. THE Admin_Page SHALL display a list of all registered reminders (both Memo_Reminders and Event_Reminders, including past events) that are not soft-deleted, in a reminder management section
2. WHEN an Admin taps the delete button on a reminder, THE Reminder_System SHALL soft-delete the reminder by setting deleted_at to the current UTC timestamp
3. THE Admin_Page SHALL display each reminder with its type (memo/event), child's name, message content, event_date (if event), notification schedule (default or custom), snooze status, creator_role, and status (active/past/snoozed)
4. THE Admin_Page SHALL display reminders sorted by creation date (in JST) with the newest first

### Requirement 12: バリデーション

**User Story:** As a developer, I want input validation enforced consistently, so that data integrity is maintained and accidental duplicate submissions are prevented.

#### Acceptance Criteria

1. THE Reminder_System SHALL enforce a message length between 1 and 200 characters (inclusive)
2. IF a message exceeds 200 characters, THEN THE Reminder_System SHALL truncate the display and show a character count error before submission
3. IF a duplicate submission is detected within 3 seconds of the previous submission (same creator_user_id and same child_id), THEN THE Reminder_System SHALL ignore the duplicate and display no additional confirmation
4. THE Reminder_System SHALL validate that creator_user_id is present before allowing submission
5. IF creator_user_id is not available, THEN THE Reminder_System SHALL generate and persist a new device identifier in localStorage before proceeding
