# Implementation Plan: Pine Chat App

## Overview

Pine is a LINE-style family chat PWA built on Supabase (Database, Auth, Realtime, Edge Functions, Storage) with a Vanilla JS frontend hosted on GitHub Pages. Implementation follows a bottom-up approach: database layer → backend RPCs → Edge Functions → frontend services → PWA features.

## Tasks

- [x] 1. Database schema and migrations
  - [x] 1.1 Create base tables migration
    - Create `pine_members`, `pine_push_subscriptions`, `pine_chat_rooms` (with `dm_member_a`, `dm_member_b` columns), `pine_chat_room_members`, `pine_messages`, `pine_read_status`, `pine_call_sessions`, `pine_invites` (with `updated_at`, `invited_email` columns)
    - Include all CHECK constraints (message_type integrity, call status enum, invite status enum, dm_members_ordered)
    - Include all indexes: `idx_pine_messages_room`, `idx_pine_messages_sender`, `idx_pine_call_sessions_room`, `idx_active_room_member` (partial unique), `idx_room_members_active`, `idx_unique_dm_pair` (partial unique)
    - Include UNIQUE constraint on `(sender_id, client_message_id)`
    - Enable RLS on all tables
    - _Requirements: 1.10, 2.4, 2.13, 7.2, 9.1_

  - [x] 1.2 Create RLS helper functions
    - Implement `is_active_room_member(p_room_id UUID, p_member_id UUID)` SECURITY DEFINER function
    - Implement `shares_any_room(p_member_id UUID)` SECURITY DEFINER function
    - GRANT EXECUTE to authenticated (required for RLS policy evaluation when user queries tables). Apply SECURITY DEFINER + SET search_path = public, pg_temp. Helper functions are safe to EXECUTE because they only return boolean and require valid UUIDs as input.
    - _Requirements: 9.2, 9.3, 9.8_

  - [x] 1.3 Create RLS policies for all tables
    - `pine_members`: SELECT (own or shares_any_room), UPDATE denied for clients (presence updates via `update_presence` RPC only), no INSERT/DELETE for clients
    - Note: To prevent clients from modifying arbitrary columns on pine_members, implement an `update_presence(p_room_id UUID)` RPC that only updates `last_seen_at` and `active_room_id`. Remove direct UPDATE policy from pine_members. Alternatively, if keeping direct UPDATE for MVP, document that pine_members MUST NOT contain admin/role/permission columns.
    - `pine_chat_rooms`: SELECT (active member via is_active_room_member, deleted_at IS NULL), deny INSERT/UPDATE/DELETE
    - `pine_chat_room_members`: SELECT (active room member via is_active_room_member), deny INSERT/UPDATE/DELETE
    - `pine_messages`: SELECT (active member with joined_at filter), deny INSERT/UPDATE/DELETE
    - `pine_read_status`: ALL with member_id = auth.uid() AND is_active_room_member(chat_room_id, auth.uid()). This prevents users from creating read status records for rooms they don't belong to.
    - `pine_push_subscriptions`: ALL with member_id = auth.uid()
    - `pine_call_sessions`: SELECT (caller_id or callee_id), deny INSERT/UPDATE/DELETE
    - `pine_invites`: No client INSERT policy. All INSERTs performed by generate-invite Edge Function using service_role. Deny SELECT/UPDATE/DELETE for clients.
    - Realtime authorization for call:{call_session_id} channels: `(caller_id = auth.uid() OR callee_id = auth.uid()) AND status IN ('calling', 'connecting', 'connected')`. Use explicit allow-list of active statuses (not NOT IN) to prevent future status additions from inadvertently granting access. Apply topic format validation (starts with 'call:' then valid UUID pattern) before UUID cast. Policy applies to both SELECT (subscribe/receive) and INSERT (broadcast/send) on realtime.messages with extension = 'broadcast'.
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.1, 10.2, 10.3, 10.5, 10.6_

  - [x] 1.4 Implement `update_presence` RPC
    - Validate authenticated user
    - Accept `p_room_id UUID`, nullable
    - When `p_room_id` is not NULL, verify the caller is an active member of the room
    - Update only `last_seen_at = now()` and `active_room_id = p_room_id` on the caller's `pine_members` row
    - Use SECURITY DEFINER SET search_path = public, pg_temp with fully-qualified table names
    - REVOKE EXECUTE FROM PUBLIC; GRANT EXECUTE TO authenticated
    - Do not allow clients to directly UPDATE `pine_members` (no UPDATE RLS policy)
    - _Requirements: 3.9, 3.10, 3.11, 3.12, 9.2_

- [x] 2. SECURITY DEFINER RPCs — Room management
  - [x] 2.1 Implement `create_chat_room` RPC
    - Validate auth, block DM creation, validate name (1-100 chars), validate members (exist, ≥3 for group, max 50), insert room + members
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_members, etc.) within function bodies.
    - Apply REVOKE/GRANT (authenticated only)
    - _Requirements: 2.1, 2.2, 2.14, 2.15_

  - [x] 2.2 Implement `get_or_create_dm_room` RPC
    - Compute canonical member pair (least/greatest), INSERT ON CONFLICT DO NOTHING, return existing or new room_id
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_members, etc.) within function bodies.
    - Apply REVOKE/GRANT (authenticated only)
    - _Requirements: 2.4_

  - [x] 2.3 Implement `leave_chat_room`, `transfer_room_ownership`, `rename_chat_room`, `delete_chat_room` RPCs
    - `leave_chat_room`: reject DM rooms, reject creator without transfer, set left_at
    - `transfer_room_ownership`: verify caller is creator, verify new owner is active member
    - `rename_chat_room`: creator-only, validate name length
    - `delete_chat_room`: creator-only for group, member-only for DM, soft-delete + end active calls
    - When a DM room is soft-deleted (deleted_at set), the partial unique index on (dm_member_a, dm_member_b) WHERE deleted_at IS NULL allows a NEW DM room to be created between the same pair. Old messages remain in the deleted room but are inaccessible.
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_members, etc.) within function bodies.
    - Apply REVOKE/GRANT for all (authenticated only)
    - _Requirements: 2.5, 2.7, 2.8, 2.9, 2.10_

  - [x] 2.4 Implement `add_room_member` and `remove_room_member` RPCs
    - Creator-only, group-only, validate target member exists/active
    - Support rejoin (new joined_at record)
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_members, etc.) within function bodies.
    - Apply REVOKE/GRANT (authenticated only)
    - _Requirements: 2.5, 2.11_

- [x] 3. SECURITY DEFINER RPCs — Messages and calls
  - [x] 3.1 Implement `send_message` RPC
    - Validate auth, active membership, content integrity (text/image mutual exclusivity), text length ≤4000, storage_path within room folder
    - Idempotent INSERT with ON CONFLICT (sender_id, client_message_id) DO NOTHING
    - On successful INSERT, return the inserted row. On conflict (duplicate), SELECT and return the existing row matching (sender_id, client_message_id).
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_messages, etc.) within function bodies.
    - Apply REVOKE/GRANT (authenticated only)
    - _Requirements: 1.2, 1.9, 1.10, 7.2, 7.3_

  - [x] 3.2 Implement call state RPCs (`start_call`, `accept_call`, `reject_call`, `cancel_call`, `end_call`, `fail_call`, `mark_call_connected`)
    - `start_call`: verify 1-on-1 room, lock both members in canonical UUID order, check busy, create session
    - `accept_call`: callee only, calling→connecting
    - `reject_call`: callee only, calling→ended
    - `cancel_call`: caller only, calling→ended
    - `end_call`: either party, connecting/connected→ended
    - `fail_call`: either party, any active→failed
    - `mark_call_connected`: either party, connecting→connected (idempotent if already connected)
    - All use SELECT ... FOR UPDATE for state safety
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_call_sessions, etc.) within function bodies.
    - Apply REVOKE/GRANT for all (authenticated only)
    - _Requirements: 4.1, 4.8, 4.9, 4.12_

  - [x] 3.3 Implement `accept_invite` and `lock_invite` RPCs
    - `accept_invite`: SELECT invite row FOR UPDATE (row lock to prevent concurrent acceptance), verify processing status, check timeout (10 min), check expiry, verify email match via auth.users.email, create pine_members, mark invite status='used' — all within a single transaction
    - Validate display_name (1-50 chars, NOT NULL, trimmed). Trust only auth.users.email for email verification (not client-provided email). Normalize email comparison with lower(trim()).
    - `lock_invite`: atomic UPDATE WHERE code_hash + status='active' + not expired + email matches invited_email → set processing
    - `accept_invite` → GRANT to authenticated; `lock_invite` → GRANT to service_role only
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_invites, etc.) within function bodies.
    - _Requirements: 8.4, 8.7, 8.8_

  - [x] 3.4 Implement `calculate_unread_count` RPC
    - Loop through active rooms, respect joined_at boundary, use (created_at, id) tuple comparison
    - All functions use SECURITY DEFINER SET search_path = public, pg_temp. Use fully-qualified table names (public.pine_messages, etc.) within function bodies.
    - GRANT to service_role only (called by push-notify Edge Function)
    - _Requirements: 6.1, 6.2_

- [x] 4. Checkpoint — Database layer complete
  - Ensure all migrations apply cleanly, all RPCs are created with correct REVOKE/GRANT, RLS policies are in place. Ask the user if questions arise.
  - Recommended: Write basic RLS and RPC integration tests at this checkpoint before proceeding to Edge Functions. This catches permission/access issues early.

- [x] 5. Edge Functions
  - [x] 5.1 Implement `push-notify` Edge Function
    - Verify X-Webhook-Secret header
    - Query room members (excluding sender), check eligibility (last_seen_at, active_room_id, PUSH_SUPPRESS_TTL)
    - Call `calculate_unread_count` RPC per eligible member
    - Send Web Push with sender_name, preview (text truncated to 100 chars or '📷 画像'), unread_count
    - Handle 410 Gone (delete stale subscription)
    - MVP accepts potential duplicate push notifications from Webhook retries. Document as known limitation. Future: add pine_push_deliveries(message_id, member_id) with UNIQUE constraint for at-most-once delivery.
    - _Requirements: 3.2, 3.6, 3.7, 3.8_

  - [x] 5.2 Implement `generate-invite` Edge Function
    - Verify JWT + pine_members existence, check rate limit (max 5/day)
    - Generate 256-bit random code, SHA-256 hash, store with invited_email (normalized)
    - Return invite URL with raw code, expires_at (7 days)
    - _Requirements: 8.2, 8.3, 8.11_

  - [x] 5.3 Implement `validate-invite` Edge Function
    - Hash provided invite_code, call `lock_invite` RPC with code_hash + email
    - Return success (for client-side OTP trigger) or error
    - _Requirements: 8.4, 8.8_

  - [x] 5.4 Implement `turn-credentials` Edge Function
    - Verify JWT auth, generate time-limited TURN credentials (coturn HMAC-SHA1)
    - Return ICE server config with STUN + TURN URLs, username, credential, TTL
    - _Requirements: 4.4, 4.11_

- [x] 6. Storage bucket and policies
  - [x] 6.1 Create `pine-chat` private bucket with storage policies
    - Create private bucket with allowed_mime_types (jpeg, png, webp) and file_size_limit (10MB)
    - SELECT policy: active room member via is_active_room_member on folder path
    - INSERT policy: active room member via is_active_room_member on folder path
    - DELETE policy: active room member who uploaded the object (owner) can delete. This enables the 'upload → send_message failure → delete orphan' flow. Note: if member leaves room after upload, they can no longer delete their own orphaned files. Storage orphan cleanup for edge cases (browser crash between upload and INSERT, or member left) is deferred to a future scheduled cleanup Edge Function/pg_cron — not required for MVP.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 7. Database Webhook setup
  - [x] 7.1 Configure Database Webhook for pine_messages INSERT
    - Document webhook configuration pointing to push-notify Edge Function URL
    - Include X-Webhook-Secret header configuration
    - _Requirements: 3.2_

- [x] 8. Checkpoint — Backend complete
  - Ensure Edge Functions deploy, Storage policies work, Webhook is configured. Ask the user if questions arise.

- [x] 9. Frontend core setup
  - [x] 9.1 Create app entry point and configuration
    - Create `pages/pine.html` with base HTML structure, pineapple icon header
    - Create `js/pine/config.js` with BASE_PATH, SUPABASE_URL, SUPABASE_ANON_KEY, PUSH_SUPPRESS_TTL constants
    - Create `js/pine/supabase-client.js` initializing Supabase client
    - _Requirements: 1.8, 11.1_

  - [x] 9.2 Implement hash-based router
    - Create `js/pine/router.js` with PineRouter class
    - Support routes: `/` (room list), `room/:id`, `call/:id`, `invite`
    - Handle hashchange events, pattern matching with params extraction
    - _Requirements: 1.7_

  - [x] 9.3 Implement auth service
    - Create `js/pine/auth-service.js` with signInWithOtp, verifyOtp, getSession, onAuthChange
    - Handle token refresh, redirect to login on auth failure
    - _Requirements: 8.1_

  - [x] 9.4 Implement IndexedDB store (offline-store.js)
    - Create `js/pine/offline-store.js` with pine_db database (version 1)
    - Object stores: `pine_messages_cache` (keyPath: id, indexes: room_created, room_id), `pine_outbox` (keyPath: client_message_id, indexes: status, room_id)
    - Methods: cacheMessages, getCachedMessages, addToOutbox, processOutbox, getOutboxItems
    - Include stuck recovery logic (sending >5 min → revert to pending)
    - _Requirements: 11.3, 11.4, 11.5, 11.6_

- [x] 10. Frontend features — Chat
  - [x] 10.1 Implement room service
    - Create `js/pine/room-service.js` wrapping RPCs: createRoom, getOrCreateDM, leaveRoom, deleteRoom, transferOwnership, addMember, removeMember, renameRoom
    - Fetch room list with last message preview and unread count (subquery)
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 10.2 Implement message service
    - Create `js/pine/message-service.js` with sendMessage (via RPC), subscribeMessages (Postgres Changes), loadHistory (cursor-based pagination)
    - Generate client_message_id (UUID) before send
    - Deduplicate incoming messages by client_message_id
    - Integrate with offline outbox (queue when offline, process on reconnect)
    - Process outbox messages in order of created_at (client-side timestamp at queuing time) within the same room to maintain user-expected message ordering
    - On app startup, recover stuck items: any outbox item with status='sending' and updated_at older than 5 minutes is reverted to 'pending'
    - _Requirements: 1.2, 1.5, 7.1, 7.3, 11.5, 11.6, 11.7_

  - [x] 10.3 Implement chat room list UI
    - Render room list with name, last message preview, timestamp, unread badge
    - Filter out deleted rooms (handled by RLS)
    - Navigate to room on tap
    - _Requirements: 1.6, 1.7_

  - [x] 10.4 Implement chat room message view UI
    - Display messages in chronological order (created_at, id) with sender icon, name, content, timestamp
    - Right-aligned green bubbles (own), left-aligned white bubbles (others)
    - Auto-scroll on new message, show offline indicator
    - Image message display with signed URLs
    - _Requirements: 1.1, 1.4, 1.5, 11.3_

  - [x] 10.5 Implement storage service and image sending
    - Create `js/pine/storage-service.js` with uploadImage and getSignedUrl (1hr TTL)
    - Use client_message_id as the filename base for storage path: `{room_id}/{client_message_id}.{ext}`. This creates a direct correspondence between the outgoing message and the storage object without needing a separate message_id generation step.
    - Image send flow: generate client_message_id → upload to Storage at `{room_id}/{client_message_id}.{ext}` → send_message RPC with storage_path
    - On INSERT failure: delete uploaded Storage object
    - Disable image send when offline
    - _Requirements: 1.9, 1.11, 1.12_

- [x] 11. Frontend features — Calls
  - [x] 11.1 Implement call service
    - Create `js/pine/call-service.js` with WebRTC lifecycle management
    - [x] 11.1.1 WebRTC base setup (RTCPeerConnection, TURN credentials fetch)
    - [x] 11.1.2 Signaling via Realtime Broadcast (subscribe, ready handshake, offer/answer exchange)
    - [x] 11.1.3 ICE candidate handling (buffering, flushing after setRemoteDescription)
    - [x] 11.1.4 Call lifecycle management (start, accept, reject, cancel, end, fail, mark_connected)
    - [x] 11.1.5 Timeout and error handling (30s timeout, ICE failure detection, beforeunload)
    - [x] 11.1.6 Media controls (mic mute, camera toggle, track management)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.11_

  - [x] 11.2 Implement call UI
    - Incoming call screen with accept/reject buttons
    - Active call screen with local/remote video, mute/camera toggles, end call button
    - Handle busy, timeout, ICE failure states with appropriate UI feedback
    - _Requirements: 4.2, 4.5, 4.6, 4.8_

- [x] 12. Frontend features — Push, presence, unread
  - [x] 12.1 Implement push service
    - Create `js/pine/push-service.js` with subscribe (register push subscription in DB), unsubscribe, getPermissionState
    - Request notification permission on first open
    - Store subscription with endpoint (UNIQUE), keys_p256dh, keys_auth, user_agent
    - _Requirements: 3.1, 3.4, 3.5_

  - [x] 12.2 Implement presence service
    - Create `js/pine/presence-service.js` with enterRoom, leaveRoom, startHeartbeat (15s interval), stopHeartbeat
    - Update presence via `update_presence(p_room_id UUID)` RPC (not direct UPDATE)
    - `update_presence(NULL)` is used when leaving a room or when the page becomes hidden
    - The RPC only updates `last_seen_at` and `active_room_id`
    - Handle visibilitychange (background → call update_presence(NULL))
    - _Requirements: 3.9, 3.10, 3.11, 3.12_

  - [x] 12.3 Implement unread service
    - Create `js/pine/unread-service.js` with getUnreadCounts (per room), markAsRead (update pine_read_status), clearBadge
    - Unread calculation: messages with (created_at, id) > last_read, sender ≠ self, created_at ≥ joined_at
    - Update badge via navigator.setAppBadge / clearAppBadge (with feature detection)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [x] 13. Frontend features — Invite flow
  - [x] 13.1 Implement invite UI and flow
    - Generate invite: call generate-invite Edge Function with invited_email → display invite URL
    - Accept invite: parse code from URL → enter email → call validate-invite → trigger signInWithOtp client-side → verify OTP → call accept_invite RPC with display_name
    - Handle errors (expired, used, email mismatch, rate limit)
    - _Requirements: 8.1, 8.2, 8.4, 8.7, 8.8, 8.9_

- [x] 14. Service Worker
  - [x] 14.1 Implement Service Worker (sw.js)
    - Cache-first for static assets (HTML, CSS, JS, icons, manifest). Supabase API requests are NOT cached by Service Worker (contains auth tokens and private data). Chat message caching is handled by IndexedDB (pine_messages_cache), not Cache Storage.
    - Handle push event: parse payload, call navigator.setAppBadge(unread_count), show notification with sender name + preview
    - Handle notificationclick: focus existing Pine window or open new with correct room hash
    - Derive BASE_PATH from registration scope
    - _Requirements: 3.3, 3.7, 5.1, 11.2, 11.3_

- [x] 15. PWA Manifest and icons
  - [x] 15.1 Create Web App Manifest and icons
    - Create manifest.json with name "Pine", pineapple icon, theme_color, display "standalone"
    - Create/add pineapple icons (192x192, 512x512)
    - Register Service Worker in pine.html
    - _Requirements: 11.1_

- [x] 16. Checkpoint — Frontend complete
  - Ensure all frontend modules load without errors, router navigates correctly, auth flow works. Ask the user if questions arise.

- [ ] 17. Property-based tests
  - [ ]* 17.1 Write property test: Message Ordering Stability
    - **Property 1: Message Ordering Stability**
    - Test that for any set of messages (including those with identical created_at timestamps), sorting by (created_at, id) always produces the same deterministic order. UUID comparison provides tie-breaking for equal timestamps.
    - **Validates: Requirements 1.1, 7.4**

  - [ ]* 17.2 Write property test: Message Content Integrity
    - **Property 2: Message Content Integrity**
    - Test validation function accepts only valid text/image combinations
    - **Validates: Requirements 1.10**

  - [ ]* 17.3 Write property test: Room Creation Validation
    - **Property 11: Room Creation Validation**
    - Test create_chat_room rejects is_group=false, rejects <3 members for groups
    - **Validates: Requirements 2.15**

  - [ ]* 17.4 Write property test: Push Eligibility Determination
    - **Property 12: Push Eligibility Determination**
    - Test eligibility function returns correct result for all (last_seen_at, active_room_id) combinations
    - **Validates: Requirements 3.6**

  - [ ]* 17.5 Write property test: Call State Machine Correctness
    - **Property 13: Call State Machine Correctness**
    - Test all valid/invalid state transitions, busy detection
    - **Validates: Requirements 4.1, 4.8, 4.9**

  - [ ]* 17.6 Write property test: Unread Count Calculation
    - **Property 14: Unread Count Calculation**
    - Test unread count with various message sets, joined_at boundaries, last_read states
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 17.7 Write property test: Message Deduplication Idempotency
    - **Property 15: Message Deduplication Idempotency**
    - Test that N inserts with same (sender_id, client_message_id) result in exactly 1 stored message
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 17.8 Write property test: Invite Status Validation
    - **Property 17: Invite Status Validation**
    - Test accept_invite succeeds only under correct conditions (processing + not expired + email match)
    - **Validates: Requirements 8.8**

  - [ ]* 17.9 Write property test: Outbox State Machine
    - **Property 18: Outbox State Machine**
    - Test only valid transitions: pending→sending→sent, pending→sending→failed, failed→pending (retry)
    - **Validates: Requirements 11.6, 11.7**

- [ ] 18. Integration tests
  - [ ]* 18.1 Write integration tests for RLS policies and security attack vectors
    - Test room access granted/denied based on membership
    - Test message visibility respects joined_at boundary
    - Test left members lose access immediately
    - Non-member attempts SELECT on another room's messages → 0 rows
    - Non-member attempts send_message to another room → ERROR
    - Left member attempts SELECT on room messages → 0 rows
    - Non-creator attempts add_room_member → ERROR
    - Authenticated user attempts send_message with sender_id ≠ auth.uid() → ERROR (RPC enforces)
    - DM room: attempt leave_chat_room → ERROR (DM leave not supported)
    - DM room: attempt add_room_member → ERROR
    - Deleted room: attempt SELECT → 0 rows
    - Call session: non-participant attempts accept_call → ERROR
    - Invite: email mismatch on accept_invite → ERROR
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5**

  - [ ]* 18.2 Write integration tests for RPC functions
    - Test create_chat_room, get_or_create_dm_room, leave/transfer/delete flows
    - Test send_message idempotency and validation
    - Test call state machine transitions end-to-end
    - **Validates: Requirements 2.4, 2.9, 2.10, 4.9, 7.3**

  - [ ]* 18.3 Write integration tests for Storage policies
    - Test active member can upload/read, non-member is blocked
    - Test MIME type and file size enforcement
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5, 12.6**

- [ ] 19. Final checkpoint
  - Ensure all tests pass, all features are wired together, PWA installs correctly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- SQL migrations should be in `supabase/migrations/` directory
- Edge Functions should be in `supabase/functions/` directory
- Frontend JS modules in `js/pine/` directory
- Property tests use fast-check with vitest (min 100 runs per property)
- All RPC REVOKE/GRANT statements must use full function signatures including parameter types
- All client-supplied string inputs must be validated at the RPC/Edge Function boundary: display_name 1-50 chars, room name 1-100 chars, message content ≤4000 chars, email normalized with lower(trim())
- Storage orphan cleanup (files uploaded but never referenced by pine_messages) is a known MVP limitation. A future scheduled cleanup Edge Function can compare storage objects against pine_messages.storage_path to remove orphans.
