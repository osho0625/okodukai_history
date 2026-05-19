# Requirements Document

## Introduction

紙の「あそびチケット」をデジタル化し、既存のお小遣い手帳PWAアプリに組み込む機能。チケットは「つじ」が発行し、子供たち（かいせい、はるちか、いろは）が使用する。チケットを使うと「つじ」はどんな遊びにも付き合う。チケットの残数確認、使用（電子印）、履歴確認、時間設定が可能。

## Glossary

- **Ticket_System**: あそびチケットの管理・表示・使用を行うシステム全体
- **Ticket**: 「つじ」が発行する遊びチケット1枚分のデータ（所有者、使用時間、状態、番号を持つ）
- **Ticket_ID**: システム内部で使用するUUID（更新・参照のプライマリキー）
- **Ticket_No**: 人間向けの連番表示番号（チケット券面に表示する通し番号）。データベースのsequenceにより採番される
- **Ticket_Status**: チケットの状態を示す値。unused（未使用）| used（使用済み）のいずれか
- **Owner**: チケットの所有者。localStorage key "selectedChild" から解決される。許容値: "かいせい" | "はるちか" | "いろは"
- **Admin**: 管理者権限を持つ端末のユーザー（deviceRole=admin）
- **deviceRole**: localStorage に保存される端末権限設定。管理者端末を識別するために使用する。UI制御専用であり、バックエンド認可には使用しない
- **Stamp**: チケット使用時に押される電子印。半透明の赤色で斜めにオーバーレイ表示され、テキスト「つかったよ」を含む
- **Ticket_View**: チケットを画像風に表示するUI画面
- **Service_Worker_Cache**: 既存PWAのService Worker（network-first戦略）によるキャッシュ

## Requirements

### Requirement 1: チケット残数の確認

**User Story:** As an Owner, I want to自分の残りチケット枚数を確認できる, so that あと何回つじと遊べるか把握できる。

#### Acceptance Criteria

1. WHEN an Owner opens the Ticket_View page, THE Ticket_System SHALL resolve the current Owner from localStorage key "selectedChild" (allowed values: "かいせい" | "はるちか" | "いろは").
2. WHEN an Owner opens the Ticket_View page, THE Ticket_System SHALL display the total number of unused Tickets belonging to that Owner.
3. WHEN an Admin opens the Ticket_View page, THE Ticket_System SHALL display the unused Ticket count for each Owner separately.
4. THE Ticket_System SHALL retrieve Ticket data from the Supabase database when the page loads (page-load fetch; realtime subscription は将来検討).
5. THE Ticket_View SHALL sort unused Tickets by Ticket_No ascending.

### Requirement 2: チケットの画像表示

**User Story:** As an Owner, I want to チケットを紙のデザインを再現した画像として表示できる, so that 実際のチケットと同じ見た目で確認できる。

#### Acceptance Criteria

1. THE Ticket_View SHALL display each Ticket with the title "PLAY WITH TSUJI !!" and subtitle "あそびチケット".
2. THE Ticket_View SHALL display the description "このチケットを使うとつじはどんなあそびにも付き合います" on each Ticket.
3. THE Ticket_View SHALL display the following rules on each Ticket: 時間中は券を使った人が最優先されます、この券は連続で使用できます、この券は予約性です、予約は先着順です、ご飯の時間になるとつじはご飯をたべます.
4. THE Ticket_View SHALL display the configured play duration in minutes on each Ticket.
5. THE Ticket_View SHALL display the Owner name on each Ticket.
6. THE Ticket_View SHALL display "TSUJI" as the issuer and "∞" as the expiration date on each Ticket.
7. THE Ticket_View SHALL display the Ticket_No on each Ticket.
8. WHEN a Ticket has been used, THE Ticket_View SHALL display the Stamp overlay diagonally in semi-transparent red with text "つかったよ" on that Ticket.

### Requirement 3: チケットの使用（電子印）

**User Story:** As an Owner, I want to チケットを使用済みにできる, so that つじに遊びの予約を伝えられる。

#### Acceptance Criteria

1. WHEN an Owner taps the "使う" button on an unused Ticket, THE Ticket_System SHALL display a confirmation dialog.
2. THE Ticket_System SHALL disable the "使う" button after first tap until the request completes.
3. WHEN the Owner confirms the usage, THE Ticket_System SHALL update Ticket_Status from "unused" to "used" atomically (SQL: `UPDATE tickets SET status='used' WHERE id=? AND status='unused'`, success determined by rows affected = 1).
4. WHEN a Ticket is marked as used, THE Ticket_System SHALL set used_at to the current timestamp and display the Stamp overlay on that Ticket.
5. WHEN a Ticket is used, THE Ticket_System SHALL send a Discord notification to the configured webhook endpoint stored in game_settings or environment, with the Owner name, play duration, and ticket number.
6. IF Discord notification fails, THEN THE Ticket_System SHALL still complete the Ticket update and log the notification failure.
7. THE Ticket_System SHALL prevent an already-used Ticket from being used again.

### Requirement 4: 使用済みチケットの履歴確認

**User Story:** As an Owner, I want to 過去に使ったチケットも確認できる, so that いつどのチケットを使ったか振り返れる。

#### Acceptance Criteria

1. THE Ticket_System SHALL provide a history view that lists all used Tickets for the current Owner.
2. WHEN displaying a used Ticket in the history, THE Ticket_System SHALL show the usage date and time.
3. THE Ticket_System SHALL sort the history with the most recently used Ticket first.
4. WHEN an Admin views the history, THE Ticket_System SHALL display used Tickets for all Owners.
5. WHERE the Ticket count exceeds 100, THE Ticket_System MAY paginate the history view.
6. THE Ticket_System SHALL treat used Tickets as immutable; used Tickets SHALL NOT be deleted through the UI.

### Requirement 5: 使用時間の設定

**User Story:** As an Admin, I want to チケットごとに遊び時間（分）を設定できる, so that チケットの内容を柔軟に決められる。

#### Acceptance Criteria

1. WHEN an Admin creates a new Ticket, THE Ticket_System SHALL require a play duration value in minutes.
2. THE Ticket_System SHALL accept play duration values between 5 minutes and 480 minutes.
3. THE Ticket_System SHALL display the configured play duration on the Ticket in the format "〇〇分".
4. THE Ticket_System SHALL treat play duration as immutable after Ticket creation.

### Requirement 6: チケットの発行（管理者機能）

**User Story:** As an Admin, I want to 各子供にチケットを発行できる, so that 遊びチケットを配布できる。

#### Acceptance Criteria

1. WHEN an Admin selects an Owner and specifies a play duration, THE Ticket_System SHALL create a new Ticket with a unique sequential Ticket_No.
2. THE Ticket_System SHALL generate Ticket_No using a database sequence to guarantee uniqueness under concurrent access.
3. THE Ticket_System SHALL assign the Ticket to one of the three Owners: かいせい, はるちか, or いろは.
4. WHEN a new Ticket is created, THE Ticket_System SHALL set the Ticket_Status to "unused".
5. WHEN an Admin creates a Ticket, THE Ticket_System SHALL send a Discord notification to the configured webhook endpoint stored in game_settings or environment, with the Owner name and play duration.
6. THE Ticket_System SHALL allow an Admin to create multiple Tickets at once by specifying a quantity between 1 and 100.
7. WHEN creating multiple Tickets at once, THE Ticket_System SHALL execute the bulk creation as a single transaction; all Tickets succeed or none are created.

### Requirement 7: エラーハンドリング

**User Story:** As an Owner, I want to エラー時に適切なメッセージを受け取れる, so that 何が起きたか理解できる。

#### Acceptance Criteria

1. IF the Supabase database is unreachable, THEN THE Ticket_System SHALL display "データの取得に失敗しました" message.
2. IF a Ticket usage request fails, THEN THE Ticket_System SHALL display an error message and keep the Ticket in unused state.
3. IF an Admin attempts to create a Ticket with invalid duration, THEN THE Ticket_System SHALL display a validation error message.
4. WHEN offline, THE Ticket_System SHALL serve cached Tickets from Service_Worker_Cache (network-first strategy, consistent with existing PWA behavior) but SHALL disable Ticket usage and creation.

### Requirement 8: データ整合性

**User Story:** As a system operator, I want to チケットデータの整合性が保証される, so that 不正な状態遷移や重複が発生しない。

#### Acceptance Criteria

1. THE Ticket_System SHALL ensure a Ticket can transition only from unused to used.
2. THE Ticket_System SHALL reject updates to already used Tickets.
3. THE Ticket_System SHALL guarantee unique Ticket_No values via database sequence.
4. THE Ticket_System SHALL update Ticket_Status atomically to prevent race conditions under concurrent access.

### Requirement 9: 認可に関する注記

**User Story:** As a system operator, I want to 認可方針が明確に定義されている, so that セキュリティ上の前提が共有される。

#### Acceptance Criteria

1. THE Ticket_System SHALL use deviceRole in localStorage for UI-only authorization (Admin/User表示切り替え).
2. THE Ticket_System SHALL NOT trust deviceRole for backend authorization.
3. NOTE: 現状このアプリはSupabase RLS無効で運用しているため、フロントエンド制御のみ（既存アプリと同じ方針）。

## Database Schema

```sql
CREATE SEQUENCE tickets_ticket_no_seq;

CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_no BIGINT UNIQUE DEFAULT nextval('tickets_ticket_no_seq'),
  owner TEXT NOT NULL CHECK (owner IN ('かいせい','はるちか','いろは')),
  duration_minutes INT NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- used_at と status の整合性制約
ALTER TABLE tickets ADD CONSTRAINT chk_used_ticket_consistency CHECK (
  (status = 'unused' AND used_at IS NULL)
  OR
  (status = 'used' AND used_at IS NOT NULL)
);

-- sequence ownership（table drop時に追従）
ALTER SEQUENCE tickets_ticket_no_seq OWNED BY tickets.ticket_no;

-- パフォーマンス用インデックス
CREATE INDEX idx_tickets_owner_status ON tickets(owner, status);
CREATE INDEX idx_tickets_used_at ON tickets(used_at DESC);
```

## Operations (操作一覧)

| 操作 | 説明 | 権限 |
|------|------|------|
| チケット一覧取得 | owner別フィルタで未使用チケットを取得 | Owner / Admin |
| チケット発行 | 新規チケットを作成（一括発行対応） | Admin |
| チケット使用 | 未使用チケットを使用済みに更新 | Owner |
| チケット履歴取得 | 使用済みチケットの一覧を取得 | Owner / Admin |

## Screens (画面一覧)

| 画面 | パス | 説明 |
|------|------|------|
| チケット一覧＋使用画面 | pages/ticket.html | Owner向け。未使用チケットの表示と使用操作 |
| 履歴表示 | pages/ticket.html 内タブ | 使用済みチケットの履歴閲覧 |
| チケット発行セクション | pages/admin.html 内 | 既存管理者ページにチケット発行UIを追加 |
