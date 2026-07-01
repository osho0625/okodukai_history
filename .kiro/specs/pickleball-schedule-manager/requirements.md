# Requirements Document

## Introduction

関東地区ピックル会（京セラピックルボールクラブ）の練習日程と出欠を管理するWebアプリケーション。
既存のGoogleスプレッドシート（xlsx形式）と双方向連携し、練習日の読み込み・追加とメンバーの出欠登録をアプリから行える。
スタンドアロンGoogle Apps Script（GAS）を中間APIとして使用し、スプレッドシート本体は変更しない。
スプレッドシートとの併用を前提とし、段階的にアプリへの移行を可能にする。

## Glossary

- **Schedule_Manager**: 練習日程・出欠管理機能を提供するWebアプリケーション全体
- **Practice_Session**: 1回の練習についての情報（データモデル参照）
- **Attendance**: あるPractice_Sessionに対するメンバー1名の出欠状態（○/×/△）
- **Member**: クラブに所属する人物。スプレッドシートの列ヘッダーから取得
- **Current_User**: アプリ操作中のユーザー。Memberの中から選択しLocalStorageに記憶
- **Spreadsheet**: Google Driveで管理されている「ピックル会スケジュール調整.xlsx」（ID: 1fL-p266yVU2M8CZv2spousWvpY4TmjIv）
- **GAS_API**: スタンドアロンGoogle Apps Scriptで構築する中間APIエンドポイント
- **Session_List**: Practice_Sessionを一覧表示するUI領域
- **Session_Form**: Practice_Sessionの追加・編集に使用する入力フォーム

## Data Model

### Practice_Session

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| rowIndex | Number | Yes | ≥ 1 | スプレッドシート上の行番号（APIでの行識別に使用） |
| date | Date (YYYY-MM-DD) | Yes | 有効な日付 | 練習日 |
| dayOfWeek | String | Yes | 月〜日 | 曜日 |
| venue | String | Yes | 1〜100文字 | 会場名（例: 緑スポーツセンター） |
| startTime | String (HH:MM) | Yes | 00:00〜23:59 | 開始時刻 |
| endTime | String (HH:MM) | Yes | startTimeより後 | 終了時刻 |
| reservationId | String | No | 最大50文字 | 予約ID / 予約名 |
| notes | String | No | 最大200文字 | 備考 |
| participantCount | String | No | - | 参加予定人数（自動集計文字列） |

### Attendance

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| memberName | String | Yes | 列ヘッダーと一致 | メンバー名 |
| status | Enum | Yes | ○ / × / △ | 出欠状態 |
| note | String | No | 最大20文字 | △の場合の補足（例: "遅れて参加", "参加未定"） |

### 行の識別方法

スプレッドシートにID列を追加しないため、Practice_Sessionの識別には **rowIndex**（スプレッドシートの行番号）を使用する。

- getSessions で各 Practice_Session に rowIndex を付与して返す
- 更新・削除リクエストには rowIndex を指定する
- フロントエンドは操作前に必ず最新の getSessions を取得し、最新の rowIndex を使用する
- 行の追加・削除により rowIndex が変動するため、キャッシュされた rowIndex での操作は禁止する

## Requirements

### Requirement 1: スプレッドシートからの練習日読み込み

**User Story:** As a メンバー, I want スプレッドシートに登録されている練習日をアプリで見たい, so that スプシを開かなくても予定が確認できる

#### Acceptance Criteria

1. WHEN the Schedule_Manager is loaded, THE GAS_API SHALL fetch all Practice_Sessions from the Spreadsheet and display them in the Session_List sorted by date ASC, then startTime ASC
2. THE Session_List SHALL display date, dayOfWeek, venue, startTime, endTime, reservationId, notes, and participantCount for each Practice_Session
3. WHEN a Practice_Session date has passed, THE Session_List SHALL visually distinguish past sessions from upcoming sessions (e.g., reduced opacity)
4. WHILE no Practice_Sessions exist in the Spreadsheet, THE Session_List SHALL display a message indicating no sessions are registered
5. IF the GAS_API request fails, THEN THE Schedule_Manager SHALL display an error message with error code and allow retry

### Requirement 2: 出欠状況の表示

**User Story:** As a メンバー, I want 各練習日の全員の出欠状況を見たい, so that 誰が来るか把握してから参加を決められる

#### Acceptance Criteria

1. WHEN a Practice_Session is displayed, THE Session_List SHALL show the Attendance status (○/×/△) for all Members
2. WHEN an Attendance status is △ with a note, THE Session_List SHALL display the status as "△（{note}）" inline (e.g., "△（遅れて参加）")
3. WHEN an Attendance status is △ without a note, THE Session_List SHALL display "△（未定）"
4. THE Session_List SHALL display the total participant count (○ count + △ count) for each Practice_Session
5. THE Current_User's own Attendance SHALL be visually highlighted (e.g., border or background color) in the list

### Requirement 3: 出欠の登録・変更

**User Story:** As a Current_User, I want アプリから自分の出欠を入力したい, so that スプシを開かずに出欠連絡ができる

#### Acceptance Criteria

1. WHEN the Current_User taps their Attendance cell for a Practice_Session, THE Schedule_Manager SHALL present options: ○（参加）, ×（不参加）, △（条件付き）
2. WHEN △ is selected, THE Schedule_Manager SHALL display a text input for a short note (max 20 characters, e.g., "遅れて参加")
3. WHEN the Current_User confirms their Attendance choice, THE GAS_API SHALL write the value to the corresponding cell in the Spreadsheet using rowIndex and memberName
4. WHEN the Attendance is successfully written, THE Session_List SHALL update to reflect the new status without page reload
5. IF the GAS_API write fails, THEN THE Schedule_Manager SHALL display an error message with error code and retain the previous Attendance state

### Requirement 4: 練習日の追加

**User Story:** As a Current_User, I want アプリから新しい練習日を追加したい, so that スプシを開かなくても予定を作れる

#### Acceptance Criteria

1. WHEN the Current_User activates the add action, THE Session_Form SHALL appear with fields for date, venue, startTime, endTime, reservationId, and notes
2. WHEN the Current_User submits the Session_Form with valid data, THE GAS_API SHALL append a new row to the Spreadsheet with the provided data
3. WHEN a new Practice_Session is saved, THE Session_List SHALL re-fetch from GAS_API and update (to obtain correct rowIndex)
4. IF the Current_User submits the Session_Form with a missing date, venue, or startTime, THEN THE Session_Form SHALL display a validation error indicating the required fields
5. IF endTime ≤ startTime, THEN THE Session_Form SHALL display a validation error "終了時刻は開始時刻より後にしてください"
6. ALL Current_Users have permission to add Practice_Sessions (no role restriction)

### Requirement 5: 練習日の編集

**User Story:** As a Current_User, I want 既存の練習日情報を編集したい, so that 場所や時間の変更をすぐ反映できる

#### Acceptance Criteria

1. WHEN the Current_User activates the edit action on a Practice_Session, THE Session_Form SHALL appear pre-filled with the existing data
2. WHEN the Current_User submits the edited Session_Form with valid data, THE GAS_API SHALL update the row at the specified rowIndex in the Spreadsheet
3. WHEN a Practice_Session is updated, THE Session_List SHALL re-fetch from GAS_API and update
4. IF the specified rowIndex no longer contains the expected data (row was modified externally), THEN THE GAS_API SHALL return error code ROW_MISMATCH and the Schedule_Manager SHALL inform the user to refresh
5. IF endTime ≤ startTime, THEN THE Session_Form SHALL display a validation error
6. ALL Current_Users have permission to edit Practice_Sessions (no role restriction)

### Requirement 6: 練習日の削除

**User Story:** As a Current_User, I want 不要な練習日を削除したい, so that 古い情報を整理できる

#### Acceptance Criteria

1. WHEN the Current_User activates the delete action on a Practice_Session, THE Schedule_Manager SHALL display a confirmation dialog showing the session details (date, venue, time)
2. WHEN the Current_User confirms the deletion, THE GAS_API SHALL delete the row at the specified rowIndex after verifying the row content matches
3. WHEN a Practice_Session is deleted, THE Session_List SHALL re-fetch from GAS_API and update
4. IF the Current_User cancels the deletion, THEN THE Schedule_Manager SHALL retain the Practice_Session unchanged
5. IF the specified rowIndex no longer contains the expected data, THEN THE GAS_API SHALL return error code ROW_MISMATCH
6. ALL Current_Users have permission to delete Practice_Sessions (no role restriction)

### Requirement 7: ユーザー識別（名前選択）

**User Story:** As a メンバー, I want 初回起動時に自分の名前を選択したい, so that 自分の出欠を簡単に入力できる

#### Acceptance Criteria

1. WHEN the Schedule_Manager is loaded for the first time (no Current_User in LocalStorage), THE Schedule_Manager SHALL display a Member selection screen
2. THE Member selection screen SHALL list all Members fetched from the Spreadsheet column headers
3. WHEN the user selects a Member, THE Schedule_Manager SHALL save the selection to LocalStorage and proceed to the Session_List
4. THE Schedule_Manager SHALL provide a settings option to change the Current_User at any time
5. WHEN the Current_User is changed, THE Schedule_Manager SHALL update the highlighted Attendance and save the new selection to LocalStorage

### Requirement 8: Google Apps Script中間API

**User Story:** As a 開発者, I want GASを中間APIとして使いたい, so that フロントエンドから安全にスプレッドシートを読み書きできる

#### Acceptance Criteria

1. THE GAS_API SHALL expose the following endpoints via doGet/doPost with action parameter:

| Action | Method | Description | Parameters |
|--------|--------|-------------|------------|
| getSessions | GET | 全Practice_Session + Attendance取得 | - |
| updateAttendance | POST | 出欠の書き込み | rowIndex, memberName, status, note |
| addSession | POST | 練習日の追加 | date, venue, startTime, endTime, reservationId, notes |
| updateSession | POST | 練習日の編集 | rowIndex, date, venue, startTime, endTime, reservationId, notes, expectedDate, expectedVenue, expectedStartTime |
| deleteSession | POST | 練習日の削除 | rowIndex, expectedDate, expectedVenue, expectedStartTime (検証用) |
| backup | POST | GitHubへバックアップ保存 | - |
| listBackups | GET | GitHubのバックアップ一覧取得 | - |
| restore | POST | バックアップからスプレッドシートを復元 | fileName |

2. THE GAS_API SHALL use LockService to prevent concurrent write conflicts (timeout: 10 seconds)
3. THE GAS_API SHALL return JSON responses in the format: `{ success: boolean, data?: any, error?: { code: string, message: string } }`
4. THE GAS_API SHALL be deployed as a web app (execute as deployer, access by anyone with the URL)
5. THE GAS_API SHALL identify rows by rowIndex and verify row content (date + venue + startTime) before write operations (optimistic concurrency check)
6. FOR deleteSession and updateSession, THE GAS_API SHALL verify that the row at rowIndex contains the expected date, venue, and startTime before proceeding

#### Error Codes

| Code | Description |
|------|-------------|
| ROW_MISMATCH | 指定されたrowIndexの内容が期待値と一致しない（外部変更あり） |
| WRITE_CONFLICT | LockService取得失敗（同時書き込み、10秒タイムアウト） |
| SPREADSHEET_ERROR | スプレッドシートへのアクセスエラー |
| INVALID_PARAMS | リクエストパラメータ不正 |
| GITHUB_ERROR | GitHubバックアップ保存/取得失敗 |
| UNKNOWN_ERROR | 予期しないエラー |

### Requirement 9: データバックアップ（GitHub保存）

**User Story:** As a Current_User, I want スプレッドシートのデータをバックアップしたい, so that データが壊れても復元できる

#### Acceptance Criteria

1. THE Schedule_Manager SHALL provide a backup action button
2. WHEN the Current_User activates the backup action, THE GAS_API SHALL export all Practice_Sessions and Attendance data as JSON and commit it to the GitHub repository via GitHub API
3. THE backup file SHALL be saved as `backups/pickleball_YYYYMMDD_HHmmss.json` in the repository (JST timezone)
4. THE GAS_API SHALL store the GitHub token securely in Script Properties (not exposed to the browser)
5. IF the backup fails, THEN THE GAS_API SHALL return error code GITHUB_ERROR with details

### Requirement 10: バックアップからの復元

**User Story:** As a Current_User, I want バックアップからデータを復元したい, so that 誤操作やデータ破損から回復できる

#### Acceptance Criteria

1. THE Schedule_Manager SHALL provide a restore action that lists available backup files from the GitHub repository (via GAS_API listBackups endpoint)
2. WHEN the Current_User selects a backup file, THE Schedule_Manager SHALL display a preview of the data (session count, date range) and a confirmation dialog
3. BEFORE restoration, THE GAS_API SHALL automatically create a pre-restore backup named `backups/pickleball_YYYYMMDD_HHmmss_prerestore.json`
4. WHEN the Current_User confirms restoration, THE GAS_API SHALL overwrite the Spreadsheet data with the backup contents
5. WHEN restoration is complete, THE Session_List SHALL reload to reflect the restored data
6. IF restoration fails, THEN THE GAS_API SHALL return an error code and the Schedule_Manager SHALL leave the Spreadsheet unchanged

### Requirement 11: オフラインキャッシュ

**User Story:** As a メンバー, I want API障害時やオフライン時でも練習予定を確認したい, so that ネット環境に左右されずに予定を把握できる

#### Acceptance Criteria

1. WHEN Practice_Session and Attendance data is successfully fetched from the GAS_API, THE Schedule_Manager SHALL cache the data in LocalStorage with a lastFetched timestamp (ISO 8601, JST)
2. IF the GAS_API request fails, THEN THE Schedule_Manager SHALL load cached data from LocalStorage and display it with a "オフラインデータ（{lastFetched}時点）" indicator
3. WHEN cached data is displayed, THE Schedule_Manager SHALL disable all write operations (Attendance changes, adding/editing/deleting sessions) and show a "読み取り専用" badge
4. WHEN connectivity is restored, THE Schedule_Manager SHALL allow the user to refresh data from the GAS_API

### Requirement 12: レスポンシブUI・ダークテーマ

**User Story:** As a メンバー, I want スマートフォンでも見やすい画面で操作したい, so that 移動中でも出欠確認や登録ができる

#### Acceptance Criteria

1. THE Schedule_Manager SHALL render correctly on viewports from 320px to 1920px width
2. THE Schedule_Manager SHALL use a dark color theme consistent with the existing style.css design tokens
3. THE Session_List SHALL be horizontally scrollable on mobile when the member columns exceed viewport width
4. THE Session_Form and Attendance controls SHALL be accessible via keyboard navigation and include appropriate ARIA labels
5. THE Attendance input (○/×/△) SHALL be operable with a single tap on mobile devices

### Requirement 13: データ整合性

**User Story:** As a メンバー, I want 複数人が同時に出欠を更新しても正しく保存されてほしい, so that 他人の入力を上書きしてしまう心配がない

#### Acceptance Criteria

1. WHEN the GAS_API receives a write request, IT SHALL acquire a LockService lock before modifying the Spreadsheet
2. IF the lock cannot be acquired within 10 seconds, THEN THE GAS_API SHALL return error code WRITE_CONFLICT
3. WHEN the lock is acquired, THE GAS_API SHALL release it immediately after the write operation completes
4. FOR updateSession and deleteSession, THE GAS_API SHALL verify row content (date + venue + startTime) before writing to detect external modifications
5. IF row content does not match, THE GAS_API SHALL return error code ROW_MISMATCH and the Schedule_Manager SHALL prompt the user to refresh
6. THE Schedule_Manager SHALL display a retry option when WRITE_CONFLICT is received

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Session_List SHALL render within 3 seconds on 4G connection |
| Capacity | Up to 200 Practice_Sessions and 50 Members |
| Browser Support | Chrome, Safari, Edge (latest 2 versions, mobile included) |
| Timezone | All dates and times SHALL be treated as Asia/Tokyo (JST) |
| Character Encoding | UTF-8 |
| Availability | Dependent on Google Sheets API / GAS uptime (no SLA guarantee) |
| Future Scalability | If data exceeds LocalStorage limits (5MB), migration to IndexedDB SHALL be considered |
