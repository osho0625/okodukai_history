# Requirements Document

## Introduction

「Pine」は家族内＋子供の友達くらいの小規模グループを対象としたLINE風チャットアプリ。PWA（Progressive Web App）として実装し、既存の GitHub Pages + Supabase インフラ上で動作する。アイコンはパイナップル🍍。テキスト・画像メッセージのリアルタイム送受信、プッシュ通知、WebRTC通話（STUN/TURN）、Androidホーム画面のバッジ通知をサポートする。認証にはSupabase Authを使用し、Row Level Securityによるデータアクセス制御を行う。MVPではメッセージの編集・削除機能は提供しない。MVPではグループ通話をサポートせず、1対1通話のみ対応する。

## Glossary

- **Pine**: 本チャットアプリ全体の名称
- **Chat_Room**: メッセージをやりとりする単位（1対1またはグループ）
- **Message**: チャットルーム内で送受信されるテキストまたは画像データ
- **Member**: Pineに登録されたユーザー（家族または子供の友達）。Supabase Auth ユーザーと1対1で対応する
- **Push_Service**: Web Push APIを利用したプッシュ通知サービス
- **Service_Worker**: バックグラウンドでプッシュ通知受信・バッジ更新を行うスクリプト
- **Call_Session**: WebRTCによる音声/ビデオ通話セッション。状態は calling, ringing, connecting, connected, ending, ended, failed のいずれか。'idle'状態は存在しない（レコード作成時に'calling'となる）。'busy'はCall_Session状態ではなく、通話開始リクエストへの応答である
- **Badge_API**: PWA Badging API（navigator.setAppBadge()）によるアプリバッジ表示機能
- **Supabase_Realtime**: Supabaseのリアルタイムサブスクリプション機能。チャットメッセージ配信にはPostgres Changes（RLSベース）を使用し、WebRTCシグナリングにはPrivate Realtime Broadcast Channelを使用する
- **Supabase_Auth**: Supabase認証サービス（JWT発行・検証）
- **RLS**: Row Level Security。Supabaseテーブルへの行レベルアクセス制御
- **Edge_Function**: Supabase Edge Function。サーバーサイドロジック実行環境。service_roleキーを使用しクライアントには非公開
- **Invite_Code**: 一回限りの招待コード（256ビットランダム値）。ハッシュ化して保存する。短い数字コードではなくセキュアな長さとする
- **Offline_Outbox**: IndexedDB（pine_outbox store）に保存されるオフライン送信キュー。状態は pending, sending, sent, failed のいずれか。MVPではテキストメッセージのみ対応（画像のオフライン送信は対象外）
- **TURN_Server**: NAT越えが困難な環境でWebRTCメディアをリレーするサーバー。認証情報はEdge Function経由で短命トークンとして取得する
- **Database_Webhook**: Supabase Database Webhook。テーブルINSERT後に非同期HTTPリクエストを送信する仕組み
- **Messages_Cache**: IndexedDB（pine_messages_cache store）に保存される最近アクセスしたChat_Roomのメッセージキャッシュ

## Requirements

### Requirement 1: メッセージ送受信（LINE風チャット）

**User Story:** As a Member, I want to LINE風のUIでテキスト・画像メッセージを送受信できる, so that 家族や友達とリアルタイムにやりとりできる。

#### Acceptance Criteria

1. WHEN a Member opens a Chat_Room, THE Pine SHALL display past messages in chronological order (ORDER BY created_at, id) with sender icon, sender name, message content, and timestamp.
2. WHEN a Member sends a text message, THE Pine SHALL store the message in Supabase with a client-generated unique identifier (client_message_id) and deliver it to all Chat_Room members via Supabase_Realtime.
3. Under normal network conditions, WHEN a Member sends a message, THE Pine SHALL deliver it to online Chat_Room members within 2 seconds.
4. THE Pine SHALL display sent messages as right-aligned bubbles (green) and received messages as left-aligned bubbles (white), following LINE-style layout.
5. WHEN a new message arrives via Supabase_Realtime, THE Pine SHALL append it to the chat view without requiring page reload.
6. THE Pine SHALL display a Chat_Room list screen showing each room's name, last message preview, timestamp, and unread message count. MVPではルームごとの最終メッセージ取得にサブクエリを使用する（小規模に十分）。
7. WHEN a Member taps a Chat_Room from the list, THE Pine SHALL navigate to that Chat_Room's message view.
8. THE Pine SHALL display the pineapple icon (🍍) as the app logo in the header area.
9. WHEN a Member sends an image message, THE Pine SHALL upload the image to Supabase Storage at the path `pine-chat/{room_id}/{message_id}.{ext}` (where ext is the original file format) and store the storage_path in the Message record with message_type set to 'image' and content set to NULL.
10. THE Pine SHALL enforce message content integrity via CHECK constraint: (message_type = 'text' AND content IS NOT NULL AND storage_path IS NULL) OR (message_type = 'image' AND content IS NULL AND storage_path IS NOT NULL).
11. THE Pine SHALL allow only active Chat_Room members (left_at IS NULL) to read and upload image objects belonging to that Chat_Room via Supabase Storage policies.
12. IF image Message insertion fails after successful Storage upload, THE Pine SHALL delete the uploaded Storage object to prevent orphaned files. Flow: message_id generation → Storage upload → Message INSERT. If INSERT fails → delete Storage object.

### Requirement 2: チャットルーム管理

**User Story:** As a Member, I want to 1対1やグループのチャットルームを作成・管理できる, so that 会話の相手やグループを自由に設定できる。

#### Acceptance Criteria

1. WHEN a Member creates a new Chat_Room, THE Pine SHALL allow selection of one or more Members as participants.
2. WHEN a group Chat_Room is created, THE Pine SHALL allow the creator to set a room name and record the creator as created_by.
3. THE Pine SHALL support both 1-on-1 rooms and group rooms (3 members or more).
4. WHEN a 1-on-1 Chat_Room already exists between two Members, THE Pine SHALL navigate to the existing room instead of creating a duplicate, using a DB Function/RPC for atomic "get existing or create" operation.
5. THE Pine SHALL support the following room operations via DB Functions/RPCs: `add_room_member()` (member add), `remove_room_member()` (member remove), `leave_chat_room()` (leave room), `delete_chat_room()` (soft-delete), `rename_chat_room()` (rename room). Member add/remove はMVPではroom creatorのみ実行可能とする（created_byで判定、RPC内部で検証）。
6. THE Pine SHALL retain is_group flag on Chat_Room for future flexibility in distinguishing room types.
7. WHEN a room is "deleted", THE Pine SHALL set deleted_at on the pine_chat_rooms record (soft-delete). Messages are NOT physically deleted. Chat_Rooms with deleted_at IS NOT NULL SHALL NOT appear in the room list.
8. WHEN a Member leaves a Chat_Room, THE Pine SHALL invoke a `leave_chat_room(room_id)` DB Function/RPC that verifies auth.uid() = member_id AND left_at IS NULL, then sets left_at = now(). The Member immediately loses access to room messages (enforced by RLS).
9. THE Pine SHALL NOT allow the Chat_Room creator to leave without first transferring the created_by role to another active member. The `leave_chat_room` RPC SHALL reject the request if the leaving Member is the room creator and no ownership transfer has been performed.
10. THE Pine SHALL provide a `transfer_room_ownership(room_id, new_owner_id)` RPC that allows the current creator to designate another active member as the new created_by.
11. WHEN a Member who previously left is re-added to a Chat_Room, THE Pine SHALL create a new pine_chat_room_members record with a new joined_at. The Member SHALL see only messages created after the new joined_at.
12. WHEN calculating unread count for a rejoined Member, THE Pine SHALL count only messages created after the Member's current joined_at.
13. For each Chat_Room, a Member SHALL have at most one active membership record (left_at IS NULL), enforced by a partial unique index.
14. THE Pine SHALL create Chat_Rooms exclusively via the `create_chat_room` DB Function/RPC, which enforces created_by = auth.uid() and validates member count constraints. The RPC handles: created_by enforcement, is_group validation, and initial member insertion.
15. THE Pine SHALL enforce via `create_chat_room` RPC: is_group = false requires exactly 2 active members; is_group = true requires 3 or more active members.

### Requirement 3: プッシュ通知

**User Story:** As a Member, I want to アプリを開いていない時に新着メッセージのプッシュ通知を受け取れる, so that 大事なメッセージを見逃さない。

#### Acceptance Criteria

1. WHEN a Member first opens Pine, THE Pine SHALL request notification permission and register the Service_Worker for push notifications.
2. WHEN a new Message is inserted, THE Pine SHALL trigger the following flow: Message INSERT → Database_Webhook → Edge_Function → calculate unread_count → send Web Push with payload including sender name, message preview, and unread_count.
3. WHEN a Member taps the push notification, THE Pine SHALL open the corresponding Chat_Room.
4. THE Pine SHALL store push subscription endpoints in Supabase with a UNIQUE constraint on endpoint, along with user_agent and last_used_at for subscription lifecycle management.
5. IF push notification permission is denied, THEN THE Pine SHALL display a visual indicator for unread messages within the app without sending push notifications.
6. THE Edge_Function SHALL determine push send eligibility using last_seen_at and active_room_id fields on pine_members. A Member is eligible for push when: active_room_id differs from the target Chat_Room OR last_seen_at is more than 30 seconds ago (configurable TTL). Note: The 30-second threshold is a Push抑制判定TTL (configurable) and does not guarantee that the Member is not viewing the Chat_Room.
7. WHEN a push notification is received, THE Service_Worker SHALL call navigator.setAppBadge(payload.unread_count) directly from the push payload without querying the database.
8. WHEN multiple messages are inserted in rapid succession, multiple Database Webhooks may fire concurrently. THE Pine SHALL treat each push payload's unread_count as a point-in-time snapshot. The Service_Worker SHALL always use the most recently received unread_count for badge updates.

#### last_seen_at / active_room_id 更新仕様

9. WHEN a Member opens Pine, THE Pine SHALL update last_seen_at.
10. THE Pine SHALL update last_seen_at periodically (e.g., every 30 seconds) while the app is in foreground.
11. WHEN a Member opens a Chat_Room, THE Pine SHALL set active_room_id to that room's id.
12. WHEN a Member navigates away from a Chat_Room or the app goes to background (visibilitychange), THE Pine SHALL set active_room_id to NULL and update last_seen_at.
13. Note: last_seen_at / active_room_id tracking is heuristic-based and does not guarantee accurate foreground detection.
14. Note: MVPでは1 Member = 1 active deviceと想定する。複数端末を同時使用する場合、last_seen_at / active_room_id は最後に更新した端末の値が反映される。

### Requirement 4: WebRTC通話

**User Story:** As a Member, I want to チャット相手と音声通話またはビデオ通話ができる, so that テキストでは伝えにくい内容を直接話せる。

#### Acceptance Criteria

1. WHEN a Member taps the call button in a 1-on-1 Chat_Room, THE Pine SHALL invoke the `start_call(room_id)` DB Function/RPC to atomically check whether the callee already has an active Call_Session (status IN ('calling', 'ringing', 'connecting', 'connected')) and create a new Call_Session only if the callee is not busy. If the callee is busy, the RPC SHALL return a 'busy' response without creating a Call_Session.
2. WHEN an incoming call is received, THE Pine SHALL display an incoming call screen with accept and reject buttons.
3. WHEN the recipient accepts the call, THE Pine SHALL establish a peer-to-peer audio/video connection via WebRTC.
4. THE Pine SHALL use STUN and TURN servers for WebRTC connectivity to support all network environments including symmetric NAT.
5. THE Pine SHALL provide toggle buttons for microphone mute and camera on/off during an active Call_Session.
6. WHEN either Member taps the end call button, THE Pine SHALL terminate the Call_Session, update its status to 'ended', and return both Members to the Chat_Room view.
7. THE Pine SHALL use Supabase Realtime Private Broadcast Channel as the signaling channel for WebRTC offer/answer/ICE candidate exchange via channel topic `call:{call_session_id}`. Offer, answer, and ICE candidates are transmitted via Realtime Broadcast and not persisted in the database.
8. THE Pine SHALL handle the following Call_Session failure scenarios: no answer (timeout), rejection by callee, cancellation by caller, busy (callee already in a call), network disconnect during call, ICE connection failure, and browser close during call.
9. THE Pine SHALL manage all Call_Session state transitions via DB Functions/RPCs: `start_call(room_id)` (creates session, checks busy), `accept_call(session_id)`, `reject_call(session_id)`, `cancel_call(session_id)`, `end_call(session_id)`. Direct INSERT/UPDATE on pine_call_sessions is denied via RLS. THE Pine SHALL track Call_Session status transitions through the following states: calling → ringing → connecting → connected → ending → ended (or → failed at any point). 'idle' state does not exist; the record is created at 'calling'.
10. THE Pine SHALL NOT support group calls in the initial release. Only 1-on-1 voice/video calls are supported.
11. THE Pine SHALL retrieve short-lived TURN credentials via Edge_Function. TURN credentials SHALL NOT be hardcoded in the client.
12. THE Pine SHALL ensure all Call_Session creation goes through `start_call()` RPC. No direct client INSERT is permitted, enforced by RLS INSERT = deny policy.

### Requirement 5: バッジ通知（PWA）

**User Story:** As a Member, I want to ホーム画面のアプリアイコンに未読メッセージ数のバッジが表示される, so that アプリを開かなくても新着メッセージがあることがわかる。

#### Acceptance Criteria

1. WHEN a push notification is received by the Service_Worker, THE Service_Worker SHALL call navigator.setAppBadge(payload.unread_count) using the unread_count from the push payload.
2. WHEN a Member reads all unread messages, THE Pine SHALL clear the badge using navigator.clearAppBadge().
3. WHEN the browser and installed PWA support the Badging API, THE Pine SHALL use navigator.setAppBadge() and navigator.clearAppBadge() for badge management.
4. IF the Badge_API is not supported by the browser, THEN THE Pine SHALL skip badge operations without causing errors.
5. THE Pine SHALL ensure that non-supported environments for Badge_API do not affect message reception or push notification delivery. Badge is a purely additive feature.

### Requirement 6: 未読カウント管理

**User Story:** As a Member, I want to 各チャットルームの未読数が正確に表示される, so that どのルームに新着メッセージがあるか一目でわかる。

#### Acceptance Criteria

1. THE Pine SHALL calculate unread count as the number of Messages whose (created_at, id) tuple is greater than the last_read_message's (created_at, id) tuple, sent by a Member other than the reading Member (sender_id <> auth.uid()). SQL concept: `(created_at, id) > (SELECT created_at, id FROM pine_messages WHERE id = last_read_message_id) AND sender_id <> auth.uid()`.
2. WHEN last_read_message_id IS NULL (first time reading a room), THE Pine SHALL count all messages in the room created after the Member's joined_at as unread (excluding own messages).
3. WHEN a Member opens a Chat_Room and views messages, THE Pine SHALL update both last_read_at and last_read_message_id in the read status record.
4. THE Pine SHALL store read status per Member per Chat_Room with both last_read_at timestamp and last_read_message_id for precise tracking.

### Requirement 7: メッセージ重複防止

**User Story:** As a Member, I want to ネットワーク不安定時にメッセージが重複送信されない, so that 会話が混乱しない。

#### Acceptance Criteria

1. THE Pine SHALL assign a client-generated UUID (client_message_id) to every outgoing Message before transmission.
2. THE Pine SHALL enforce a UNIQUE constraint on (sender_id, client_message_id) to prevent duplicate message creation on the server.
3. WHEN a message send request is retried due to network failure, THE Pine SHALL use the same client_message_id to ensure idempotent insertion.
4. THE Pine SHALL order messages by (created_at, id) to guarantee stable display order.

### Requirement 8: 認証・招待管理

**User Story:** As a system operator, I want to 家族と招待された友達だけがアプリを使える, so that 関係者以外からのアクセスを防げる。

#### Acceptance Criteria

1. THE Pine SHALL authenticate Members using Supabase_Auth with JWT tokens as the authentication backbone. Recommended auth method is Email OTP (or Magic Link). Upon first sign-in, Supabase Auth automatically creates the auth user.
2. WHEN a new Member is invited, THE Pine SHALL allow any existing Member to generate an invite link containing a one-time Invite_Code (256-bit random value).
3. THE Pine SHALL store Invite_Code as a hash (code_hash) and never in plaintext, with an expiration time (expires_at).
4. WHEN an invited person opens Pine with a valid invite link, THE Pine SHALL execute the following flow: invited person enters email → Edge_Function validates invite code and sets status to 'processing' (lock/reserve) → Supabase Auth signInWithOtp (or Magic Link) sends verification to email → user verifies OTP/clicks Magic Link → on successful verification, Edge_Function creates pine_members record and sets invite status to 'used' (with used_at timestamp). The Edge Function's role is: validate invite code + lock (status='processing') + create pine_members + mark consumed (status='used'). Auth user creation is handled by Supabase Auth's standard OTP/Magic Link flow.
5. THE Pine SHALL ensure that the service_role key used in Edge_Function MUST NOT be exposed to the client.
6. THE Pine SHALL ensure invitation acceptance consistency. Because Supabase Auth user creation and application database changes cannot be committed as a single database transaction, the Edge_Function SHALL use compensating actions when subsequent operations fail (e.g., delete the Auth user if pine_members creation fails). Recommended order: 1. Invite検証(status='active'確認) → 2. Invite status='processing'設定(lock) → 3. Auth user作成(OTP送信) → 4. pine_members作成 → 5. invite status='used' + used_at更新 → 6. 成功. On failure at any step: compensating rollback of prior steps (revert status to 'active').
7. WHEN an Invite_Code is used, THE Pine SHALL mark it as consumed by setting status to 'used' and recording used_at and created_member_id.
8. IF an Invite_Code has expired (expires_at passed), already been used (status = 'used'), or is currently being processed (status = 'processing'), THEN THE Pine SHALL reject the invitation and display an appropriate error message.
9. THE Pine SHALL store Member profiles (display_name, avatar_url) in pine_members with id referencing auth.users(id).
10. THE Pine SHALL reference pine_members.id as `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` to maintain identity linkage with Supabase Auth.
11. THE Pine SHALL enforce rate limiting on Invite_Code validation attempts (maximum 5 attempts per IP per hour) to prevent brute-force attacks.

#### Invitation Flow

- **Existing Member → Edge_Function**: Invite生成 → code_hash保存 → Invite URL発行
- **Invited Person → Pine → Edge_Function**: URL受信 → email入力 → Invite検証(status='active') → status='processing'設定(lock) → OTP/Magic Link送信 → user検証完了 → pine_members作成 → status='used' + used_at更新 → ログイン完了

### Requirement 9: データアクセス制御（RLS）

**User Story:** As a Member, I want to 自分が参加しているルームのデータだけにアクセスできる, so that プライバシーが保護される。

#### Acceptance Criteria

1. THE Pine SHALL enable Row Level Security on ALL Pine tables exposed through the Supabase Data API.
2. WHILE a Member is authenticated, THE Pine SHALL allow the Member to SELECT only Chat_Rooms in which the Member participates (exists in pine_chat_room_members with left_at IS NULL).
3. WHILE a Member is authenticated, THE Pine SHALL allow the Member to SELECT only Messages in Chat_Rooms in which the Member participates (left_at IS NULL) and messages created after the Member's current joined_at.
4. WHILE a Member is authenticated, THE Pine SHALL allow the Member to INSERT Messages only when sender_id = auth.uid() AND the Member is an active participant of the target Chat_Room (left_at IS NULL). The RLS INSERT policy MUST enforce sender_id = auth.uid() to prevent impersonation.
5. THE Pine SHALL deny UPDATE and DELETE operations on pine_messages for all Members (no message editing or deletion in MVP).
6. WHILE a Member is authenticated, THE Pine SHALL allow the Member to SELECT, INSERT, UPDATE, and DELETE only their own push subscriptions.
7. WHILE a Member is authenticated, THE Pine SHALL allow the Member to SELECT and UPDATE only their own read status records.
8. WHILE a Member is authenticated, THE Pine SHALL perform all pine_chat_room_members mutations (add, remove, leave) exclusively via DB Functions/RPCs. No direct INSERT/DELETE is permitted via RLS. MVPでは"designated role"概念は使用せず、created_byのみで判定する.
9. THE Pine SHALL define explicit SELECT, INSERT, UPDATE, DELETE policies for each table as follows:
   - **pine_members**: SELECT = any authenticated (acceptable for MVP since only display_name and avatar_url are stored; sensitive personal information such as email or phone SHALL NOT be stored in pine_members); INSERT = service_role only (via Edge_Function); UPDATE = own record only; DELETE = deny (MVPではアカウント削除未対応)
   - **pine_chat_rooms**: SELECT = participant members; INSERT = deny (via `create_chat_room` RPC only, which enforces created_by = auth.uid()); UPDATE = deny (via `rename_chat_room`, `delete_chat_room`, `transfer_room_ownership` RPCs only); DELETE = deny (soft-delete via deleted_at)
   - **pine_chat_room_members**: SELECT = room participants; INSERT = deny; UPDATE = deny; DELETE = deny. All member mutations (add, remove, leave, rejoin) are performed exclusively via DB Functions/RPCs (`add_room_member`, `remove_room_member`, `leave_chat_room`) which bypass RLS using SECURITY DEFINER. This prevents direct INSERT/DELETE that could bypass creator-leave validation or create inconsistencies.
   - **pine_messages**: SELECT = active room participants (joined_at filter); INSERT = active room participants with sender_id = auth.uid() enforced; UPDATE = deny; DELETE = deny
   - **pine_read_status**: SELECT = own records; INSERT = own records; UPDATE = own records; DELETE = own records
   - **pine_push_subscriptions**: SELECT = own records; INSERT = own records; UPDATE = own records; DELETE = own records
   - **pine_call_sessions**: SELECT = caller or callee; INSERT = deny; UPDATE = deny; DELETE = deny. All state transitions managed via RPCs: `start_call()`, `accept_call()`, `reject_call()`, `cancel_call()`, `end_call()`. RPCs use SECURITY DEFINER.
   - **pine_invites**: SELECT = deny (validation via Edge_Function); INSERT = any authenticated member; UPDATE = service_role only; DELETE = deny
10. THE Pine SHALL add `role TEXT NOT NULL DEFAULT 'member'` to pine_chat_room_members for future flexibility, but MVP only checks created_by for permission decisions.

### Requirement 10: Realtime認可

**User Story:** As a Member, I want to チャットルームのリアルタイム通信が参加者以外に漏れない, so that 会話の秘密性が保たれる。

#### Acceptance Criteria

1. THE Pine SHALL use Postgres Changes for chat message delivery. Postgres Changes relies on RLS policies on pine_messages for authorization; no explicit Realtime channel subscription is required for message filtering.
2. WHEN a Member attempts to receive messages via Postgres Changes, THE Pine SHALL ensure RLS policies on pine_messages enforce that only active Chat_Room participants (left_at IS NULL) receive message events.
3. IF a non-member or a member with left_at set attempts to receive Chat_Room messages, THEN THE Pine SHALL block message delivery via RLS.
4. THE Pine SHALL use Postgres Changes for MVP Realtime implementation (simpler, sufficient for small scale). Future migration to Broadcast is possible.
5. THE Pine SHALL use Private Realtime Broadcast Channel with topic `call:{call_session_id}` for WebRTC signaling communication. This is separate from message delivery.
6. THE Pine SHALL clearly separate Realtime transport: chat messages use Postgres Changes (RLS-based), WebRTC signaling uses Private Realtime Broadcast Channel.

### Requirement 11: PWAインストール・オフライン対応

**User Story:** As a Member, I want to Pineをスマホのホーム画面にインストールして使える, so that ネイティブアプリのような体験ができる。

#### Acceptance Criteria

1. THE Pine SHALL provide a valid Web App Manifest with app name "Pine", pineapple icon, theme color, and display mode "standalone".
2. THE Service_Worker SHALL cache static assets (HTML, CSS, JS, icons) using Cache Storage for offline access. Cache Storage is used ONLY for static assets.
3. WHEN Pine is offline, THE Pine SHALL display messages from IndexedDB (pine_messages_cache store) and show an offline indicator. "Cached messages" refers to IndexedDB-stored messages, NOT Cache Storage.
4. THE Pine SHALL store recently accessed Chat_Room messages in IndexedDB (pine_messages_cache store) for offline viewing.
5. WHEN a Member sends a text message while offline, THE Pine SHALL store the message in the Offline_Outbox (IndexedDB, pine_outbox store) with status 'pending' and the pre-assigned client_message_id. MVPでは画像メッセージのオフライン送信は対象外とする.
6. WHEN Pine regains connectivity, THE Pine SHALL process the Offline_Outbox by sending each pending message to Supabase, transitioning states from pending → sending → sent (or → failed on error).
7. IF a queued message fails to send after connectivity is restored, THEN THE Pine SHALL mark it as 'failed' in the Offline_Outbox and allow the Member to retry manually.

### Requirement 12: Storageアクセス制御

**User Story:** As a Member, I want to チャットルームの画像が参加者以外にアクセスされない, so that プライベートな画像が保護される。

#### Acceptance Criteria

1. WHILE a Member is an active participant of a Chat_Room (left_at IS NULL), THE Pine SHALL allow the Member to read (SELECT) image objects in the Storage bucket path `pine-chat/{room_id}/`.
2. WHILE a Member is an active participant of a Chat_Room (left_at IS NULL), THE Pine SHALL allow the Member to upload (INSERT) image objects to the Storage bucket path `pine-chat/{room_id}/`.
3. IF a Member is not an active participant of a Chat_Room, THEN THE Pine SHALL block all read and upload operations on image objects in that Chat_Room's Storage path.
4. THE Pine SHALL implement Storage policies that mirror the DB RLS logic: participation check via pine_chat_room_members with left_at IS NULL.
5. THE Pine SHALL allow only supported image MIME types: image/jpeg, image/png, image/webp.
6. THE Pine SHALL enforce a maximum image file size of 10MB per upload. Enforced via Supabase Storage policies.

## Database Schema

```sql
-- メンバー管理（Supabase Auth連携）
CREATE TABLE pine_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  last_seen_at TIMESTAMPTZ,
  active_room_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- プッシュ通知サブスクリプション
CREATE TABLE pine_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES pine_members(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チャットルーム
CREATE TABLE pine_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES pine_members(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チャットルームメンバー
CREATE TABLE pine_chat_room_members (
  chat_room_id UUID NOT NULL REFERENCES pine_chat_rooms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES pine_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  PRIMARY KEY (chat_room_id, member_id, joined_at)
);

-- メッセージ
CREATE TABLE pine_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES pine_chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES pine_members(id),
  client_message_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, client_message_id),
  CHECK (
    (message_type = 'text' AND content IS NOT NULL AND storage_path IS NULL)
    OR (message_type = 'image' AND content IS NULL AND storage_path IS NOT NULL)
  )
);

-- 既読管理
CREATE TABLE pine_read_status (
  member_id UUID NOT NULL REFERENCES pine_members(id) ON DELETE CASCADE,
  chat_room_id UUID NOT NULL REFERENCES pine_chat_rooms(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_message_id UUID REFERENCES pine_messages(id),
  PRIMARY KEY (member_id, chat_room_id)
);

-- 通話セッション
CREATE TABLE pine_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES pine_chat_rooms(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES pine_members(id),
  callee_id UUID NOT NULL REFERENCES pine_members(id),
  status TEXT NOT NULL DEFAULT 'calling' CHECK (status IN ('calling', 'ringing', 'connecting', 'connected', 'ending', 'ended', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- 招待管理
CREATE TABLE pine_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES pine_members(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'processing', 'used', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_member_id UUID REFERENCES pine_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_pine_messages_room ON pine_messages (chat_room_id, created_at, id);
CREATE INDEX idx_pine_messages_sender ON pine_messages (sender_id);
CREATE INDEX idx_pine_call_sessions_room ON pine_call_sessions (chat_room_id, created_at);
CREATE UNIQUE INDEX idx_active_room_member ON pine_chat_room_members (chat_room_id, member_id) WHERE left_at IS NULL;
CREATE INDEX idx_room_members_active ON pine_chat_room_members (member_id, chat_room_id) WHERE left_at IS NULL;
```

## Screens (画面一覧)

| 画面 | パス | 説明 |
|------|------|------|
| チャットルーム一覧 | pages/pine.html | ルーム一覧・最終メッセージプレビュー・未読バッジ |
| チャットルーム | pages/pine.html#room/{id} | LINE風メッセージ表示・送信UI |
| 通話画面 | pages/pine.html#call/{call_session_id} | WebRTC通話UI（着信/発信/通話中） |
| メンバー招待 | pages/pine.html#invite | 招待リンク生成・新規メンバー登録 |

## 技術構成

- フロントエンド: Vanilla JS + HTML/CSS（既存プロジェクトに合わせる）
- バックエンド: Supabase（Database, Auth, Realtime, Edge Functions, Storage）
- 認証: Supabase Auth（JWT）、招待ユーザーはEmail OTP（またはMagic Link）で認証。Auth user作成はSupabase Authの標準OTP/Magic Linkフローが自動的に処理
- データアクセス制御: Row Level Security（全テーブル）+ Supabase Storage Policies
- プッシュ通知: Web Push API + Supabase Edge Functions + Database Webhook（DB Triggerではなく）
- 通話: WebRTC（STUN/TURN）+ シグナリングはSupabase Realtime Private Broadcast Channel経由（topic: `call:{call_session_id}`）
- TURN認証: Edge Function経由で短命credentials取得（クライアントにハードコードしない）
- 画像ストレージ: Supabase Storage（`pine-chat/{room_id}/{message_id}.{ext}`、元フォーマット保持、MIME制限: jpeg/png/webp、最大10MB）
- Realtime（メッセージ配信）: Postgres Changes使用（RLSベース、明示的なチャネル購読不要）。将来Broadcastへ移行可能
- Realtime（WebRTCシグナリング）: Private Realtime Broadcast Channel（topic: `call:{call_session_id}`）
- オフライン: IndexedDB（pine_messages_cache store: メッセージキャッシュ、pine_outbox store: 送信キュー）、Cache Storage（静的アセットのみ）
- ホスティング: GitHub Pages
- PWA: Service Worker + Web App Manifest + Badging API
- 招待: Edge Function（service_role使用、クライアント非公開）で招待検証 + pine_members作成 + invite消費。Auth user作成は標準OTPフローが処理
- MVPでのアカウント削除: 未対応。これによりFK設計が簡素化される（sender_id, caller_id, callee_id, created_by は全て NOT NULL、ON DELETE句不要）

## DB Functions/RPCs

以下のDB Functions（SECURITY DEFINER）を提供する。全RPCはRLSをバイパスし、内部でauth.uid()を検証する。

| RPC名 | 引数 | 説明 |
|--------|------|------|
| `create_chat_room(name, member_ids, is_group)` | name: TEXT, member_ids: UUID[], is_group: BOOLEAN | Room作成 + created_by = auth.uid()強制 + メンバー数バリデーション + 初期メンバー挿入 |
| `get_or_create_dm_room(other_member_id)` | other_member_id: UUID | 1対1ルームのatomic get/create |
| `leave_chat_room(room_id)` | room_id: UUID | auth.uid() = member_id確認 + creator leave拒否 + left_at = now()設定 |
| `transfer_room_ownership(room_id, new_owner_id)` | room_id: UUID, new_owner_id: UUID | 現在のcreatorが別のactive memberにcreated_byを移譲 |
| `start_call(room_id)` | room_id: UUID | Atomic busy check + Call_Session作成（status='calling'） |
| `accept_call(session_id)` | session_id: UUID | 着信受諾（status='ringing'→'connecting'） |
| `reject_call(session_id)` | session_id: UUID | 着信拒否（status='ringing'→'ended'） |
| `cancel_call(session_id)` | session_id: UUID | 発信者キャンセル（status='calling'→'ended'） |
| `end_call(session_id)` | session_id: UUID | 通話終了（status='connected'→'ending'→'ended'） |
| `accept_invite(invite_code, display_name)` | invite_code: TEXT, display_name: TEXT | Invite受諾 + pine_members作成。認証済みユーザーの auth.uid() を使用して pine_members を作成する（Edge Function内で使用） |
| `add_room_member(room_id, member_id)` | room_id: UUID, member_id: UUID | Room creatorのみ実行可。active member追加 |
| `remove_room_member(room_id, member_id)` | room_id: UUID, member_id: UUID | Room creatorのみ実行可。対象memberのleft_at設定。creator自身は除外不可 |
| `rename_chat_room(room_id, new_name)` | room_id: UUID, new_name: TEXT | Room creatorのみ実行可。ルーム名変更 |
| `delete_chat_room(room_id)` | room_id: UUID | Room creatorのみ実行可。deleted_at = now()設定（soft-delete） |
