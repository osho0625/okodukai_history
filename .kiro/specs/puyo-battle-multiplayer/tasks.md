# Implementation Plan: puyo-battle-multiplayer

## Overview

Implement multiplayer room expansion for puyo-battle.html: rematch, 3+ players, spectate/queue, winner-stays rotation, spectator-only mode, reconnection, and ownership transfer. Pure JS modules are built first for testability, then wired into the HTML.

## Tasks

- [x] 1. Create RoomStateManager module (`js/puyo-room-state.js`)
  - [x] 1.1 Implement state machine with valid transitions (LOBBY, PLAYING, RESULT, REMATCH_WAIT, ROTATING)
    - Define `canTransition(from, to)` and `transition(newState)` with deterministic rules
    - Implement stateId `{ epoch, version }` tracking — version increments on **every authoritative state mutation** (not only state transitions). This includes: queue changes, rematch votes, participant join/leave, role switches, ownership transfer, etc.
    - Expose `getAvailableActions()` method returning `{ canRematch, canQueue, canSwitchRole, ... }` for UI to consume (UI renders based on this, not raw state)
    - _Requirements: Room State Model, 1.7, 4.4, 4.5_
  - [x] 1.2 Implement seat management (assignSeat, vacateSeat) and participant tracking
    - seatA/seatB assignment, spectators[], queue[] arrays
    - joinCounter monotonic assignment for join ordering
    - Max 6 participants enforcement
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  - [x] 1.3 Implement queue management (enqueue, dequeue, removeFromQueue)
    - queueCounter monotonic for FIFO ordering
    - Sorted by queueOrder ascending invariant
    - _Requirements: 3.3, 8.1, 8.2, 8.3_
  - [x] 1.4 Implement role switching (spectator↔queue)
    - Spectator to queue: remove from spectators[], append to queue[] with new queueOrder
    - Queue to spectator: remove from queue[] preserving order, add to spectators[]
    - _Requirements: 3.7, 3.8_
  - [x] 1.5 Implement winner-stays rotation logic
    - Winner → seatA, queue[0] → seatB, loser → queue tail
    - Queue length invariant after rotation
    - Win streak tracking (increment winner, reset loser)
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  - [x] 1.6 Implement rematch vote logic with battleId scoping
    - rematchVotes `{ seatA, seatB }` reset on new battle (battleId increment)
    - Reject votes with stale battleId
    - 30s timeout deadline stored as absolute timestamp
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7_
  - [x] 1.7 Implement spectatorOnly mode enforcement
    - When spectatorOnly=true, queue operations are blocked
    - RESULT always transitions to REMATCH_WAIT when spectatorOnly is active
    - _Requirements: 5.2, 5.4_
  - [x] 1.8 Implement participant removal and room closure detection
    - Remove from any list (seat/spectator/queue), preserve others' positions
    - Detect empty room (no participants, no pending reconnection timers)
    - _Requirements: 3.6, 7.3_
  - [ ]* 1.9 Write property tests for RoomStateManager (Properties 1, 4, 5, 6, 7, 10, 11, 13, 18)
    - **Property 1: Post-RESULT state transition determined by queue**
    - **Property 4: Winner-stays rotation correctness**
    - **Property 5: Queue FIFO integrity**
    - **Property 6: Role switch correctness**
    - **Property 7: Participant removal consistency**
    - **Property 10: Win streak tracking**
    - **Property 11: SpectatorOnly mode enforcement**
    - **Property 13: Participant list broadcast consistency**
    - **Property 18: battleId isolates rematch votes**
    - **Validates: Requirements 1.7, 4.1-4.4, 4.6, 3.3, 3.6, 3.7, 3.8, 5.2, 5.4, 8.1, 8.3, 2.5**

- [x] 2. Create OwnershipManager module (`js/puyo-ownership.js`)
  - [x] 2.1 Implement heartbeat broadcasting with monotonic sequence number
    - Owner broadcasts every 5s with incrementing seq
    - stateId included in heartbeat payload
    - _Requirements: Design Decision 7_
  - [x] 2.2 Implement heartbeat miss detection with wall-clock timeout + jitter
    - Primary detection: `Date.now() - lastHeartbeat > 15000` (15s wall-clock timeout, matching design spec)
    - Jittered check interval (4-6s) to prevent thundering herd
    - Trigger ownership claim when timeout detected AND participant is oldest
    - _Requirements: Design Decision 7_
  - [x] 2.3 Implement ownership claim protocol with deterministic tie-break
    - Candidate must be oldest participant (lowest joinOrder)
    - Tie-break: lowest joinOrder wins, then lexicographic clientId
    - All participants converge on same winner
    - _Requirements: 7.1_
  - [x] 2.4 Implement ownership transfer with roomState snapshot and deadline reconstruction
    - New owner inherits full roomState (joinCounter, queueCounter, deadlines)
    - Reconstruct setTimeout from `deadline - Date.now()` (execute immediately if passed)
    - Epoch increment on transfer, stateId reset
    - _Requirements: 7.1, 7.2_
  - [x] 2.5 Implement owner command validation (validateAction)
    - Verify sender identity matches payload.clientId (spoof rejection)
    - Role-based validation (only active players can vote/send game state, etc.)
    - battleId validation for rematch votes
    - _Requirements: Owner Command Validation, Security_
  - [ ]* 2.6 Write property tests for OwnershipManager (Properties 9, 14, 15, 17, 19, 20)
    - **Property 9: Ownership transfers to oldest participant**
    - **Property 14: Owner heartbeat liveness (15s timeout triggers transfer)**
    - **Property 15: State identity prevents split-brain (epoch comparison)**
    - **Property 17: Ownership claim deterministic (tie-break)**
    - **Property 19: Sender spoof rejected**
    - **Property 20: queueCounter monotonic after owner transfer**
    - **Validates: Requirements 7.1, Design Decision 7, Queue integrity**
  - [x] 2.7 Ownership transfer integration test
    - Simulate owner disconnect (stop heartbeat) → verify transfer triggers after 15s
    - Verify new owner reconstructs timers from deadlines
    - Verify epoch increment and stale message rejection
    - _Requirements: 7.1, 7.2, Design Decision 7_

- [x] 3. Create ReconnectionManager module (`js/puyo-reconnect.js`)
  - [x] 3.1 Implement disconnect detection and role preservation
    - Store disconnected player's role, seat data, queue position
    - 30s grace period as absolute deadline timestamp
    - Input freeze flag for Active_Players on disconnect
    - _Requirements: 6.1, 2.6_
  - [x] 3.2 Implement reconnection with identity validation and role restoration
    - Validate clientId (localStorage-persisted) — reconnectToken removed (clientId + owner's in-memory participant map is sufficient for identity)
    - Restore exact role and position (seat/spectator/queue position)
    - Clear input freeze on successful reconnect
    - _Requirements: 6.2_
  - [x] 3.3 Implement timeout handling (forfeit for active players, removal for others)
    - Active_Player timeout → remaining player wins
    - Spectator/Queue timeout → remove from participant list
    - _Requirements: 6.3, 6.4_
  - [ ]* 3.4 Write property tests for ReconnectionManager (Properties 8, 16)
    - **Property 8: Reconnection role round-trip**
    - **Property 16: Input freeze on disconnect**
    - **Validates: Requirements 6.1, 6.2, Reconnection Manager**
  - [x] 3.5 Test reconnection during ROTATING state
    - Verify queue player disconnect during ROTATING correctly skips to next
    - Verify winner reconnect during ROTATING preserves seatA position
    - _Requirements: 6.1, 4.5, Edge Cases_

- [x] 4. Checkpoint - Ensure all pure module tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create PRNG seed synchronization test
  - [ ]* 5.1 Write property test for PRNG determinism (Property 3)
    - **Property 3: PRNG seed synchronization**
    - Two createPRNG instances with same seed produce identical sequences for any N calls
    - **Validates: Requirements 1.5**
  - [ ]* 5.2 Write property test for rematch settings preservation (Property 2)
    - **Property 2: Rematch preserves room settings**
    - Room config (difficulty, colors, cols, rows, speed) unchanged after rematch vote
    - **Validates: Requirements 1.2**

- [x] 6. DB schema changes
  - [x] 6.1 Create SQL migration file (`sql/alter_puyo_battles_multiplayer.sql`)
    - ALTER status CHECK constraint to include 'lobby', 'rotating'
    - ADD columns: max_players (INT DEFAULT 6), spectator_only (BOOLEAN DEFAULT false), owner_client_id (TEXT), updated_at (TIMESTAMPTZ DEFAULT now())
    - CREATE trigger to auto-update updated_at on any row UPDATE:
      ```sql
      CREATE OR REPLACE FUNCTION update_puyo_battles_updated_at()
      RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
      CREATE TRIGGER trg_puyo_battles_updated_at BEFORE UPDATE ON puyo_battles
      FOR EACH ROW EXECUTE FUNCTION update_puyo_battles_updated_at();
      ```
    - CREATE indexes on status and updated_at
    - _Requirements: 2.1, 5.1, 7.1, DB Cleanup_

- [x] 7. Implement HTML UI components and lobby extensions
  - [x] 7.1 Add clientId persistence (localStorage)
    - `localStorage.getItem('puyo_client_id') || crypto.randomUUID()` — persisted across reloads and browser restarts
    - reconnectToken removed from design (clientId + owner's in-memory participant map is sufficient)
    - _Requirements: Design Decision 5_
  - [x] 7.2 Add spectator-only checkbox to room creation UI
    - Checkbox in lobbyCreate section
    - Include spectator_only in DB insert payload
    - Show 👁 icon in room list for spectator-only rooms
    - _Requirements: 5.1, 5.3_
  - [x] 7.3 Implement role selection UI for 3rd+ participants
    - Modal with "👀 観戦する" and "🎮 順番待ちする" buttons
    - Hide queue option when spectatorOnly=true
    - Send `role_choice` event to owner
    - _Requirements: 3.1, 3.2, 3.3, 5.2_
  - [x] 7.4 Implement participant list panel
    - Show all participants with role icons (🎮 seat, 👁 spectator, ⏳ queue, 👑 owner)
    - Display win streak count
    - Show current count (e.g., "4/6")
    - Role switch buttons ("順番待ちに入る" / "順番待ちをやめる")
    - _Requirements: 2.4, 2.5, 3.4, 3.7, 3.8, 4.6_
  - [x] 7.5 Implement spectator view (read-only dual board display)
    - Render both seatA and seatB boards using existing canvas drawing logic
    - No input controls shown for spectators
    - Queue players also see spectator view while waiting
    - _Requirements: 2.3, 3.5_

- [x] 8. Implement Supabase channel integration and event wiring
  - [x] 8.1 Implement owner-side event handlers (receive action events, validate, mutate state)
    - Listen for: player_join, player_leave, role_choice, role_switch, rematch_vote, rematch_cancel, gameover
    - Call validateAction() before processing
    - Mutate RoomStateManager and broadcast room_state_sync after each valid mutation
    - _Requirements: Authority Model, Owner Command Validation_
  - [x] 8.2 Implement non-owner event handlers (receive authoritative state, apply locally)
    - Listen for: room_state_sync, heartbeat, ownership_transfer, ownership_claim
    - Apply stateId/epoch validation (reject stale, accept higher epoch)
    - Update local UI state from received room_state_sync
    - _Requirements: Communication Flow, State Version Control_
  - [x] 8.3 Implement broadcast wrapper functions
    - `broadcastRoomState()` — owner sends full state with stateId
    - `sendAction(event, payload)` — non-owner sends action to owner
    - `broadcastHeartbeat()` — owner heartbeat with seq
    - Retry logic (3 retries, 500ms backoff)
    - _Requirements: Network Errors_
  - [x] 8.4 Implement reconnection wiring with channel
    - On page load: check localStorage for clientId, attempt reconnect to last known room
    - Send `reconnect_request` with clientId
    - Owner validates against participant map and restores role
    - Broadcast `disconnect_notice` and `reconnect_success` to all
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 8.5 Wire room_state_sync handler to update all UI components
    - Update participant list, queue display, spectator view, result overlay
    - UI reads `getAvailableActions()` from RoomStateManager to determine button visibility
    - _Requirements: 2.5, State Version Control_
  - [x] 8.6 Implement owner heartbeat broadcasting and miss detection wiring
    - Wire OwnershipManager heartbeat into channel.send
    - Wire 15s wall-clock timeout detection to trigger ownership_claim
    - Handle ownership_transfer event (accept new owner, update epoch, reconstruct timers)
    - _Requirements: Design Decision 7, 7.1, 7.2_
  - [x] 8.7 Simultaneous join stress handling
    - Handle 3+ players joining within same heartbeat interval
    - Owner assigns joinOrder sequentially, resolves seat conflicts by joinOrder
    - _Requirements: 2.1, 8.2, Edge Cases_

- [x] 9. Implement result overlay and rematch/rotation flow
  - [x] 9.1 Extend result overlay with rematch button and vote status
    - Show "もういちど" button only when queue is empty and spectatorOnly is off
    - Display "相手の応答を待っています..." when one player voted
    - 30s countdown timer display
    - Send `rematch_vote` / `rematch_cancel` events
    - _Requirements: 1.1, 1.3, 1.4, 1.6, 1.7_
  - [x] 9.2 Implement winner-stays rotation UI flow
    - Show "次の対戦まで 5秒..." during ROTATING state
    - Display next opponent name
    - Auto-start new battle after 5s with new seed
    - Move loser to queue, notify spectators of rematch status
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.5_

- [x] 10. Implement DB cleanup and updated_at maintenance
  - [x] 10.1 Update cleanupStaleRooms to use updated_at instead of created_at
    - waiting/finished: `updated_at < now() - 15min`
    - playing/lobby/rotating: `updated_at < now() - 2h`
    - Owner updates DB on every heartbeat cycle AND on every authoritative state change (status update, etc.)
    - DB trigger auto-updates updated_at on any UPDATE, so any DB write keeps the room alive
    - _Requirements: DB Cleanup Responsibility_

- [x] 11. Implement room closure and edge cases
  - [x] 11.1 Handle room full (7th player rejection), player name collision, and terminal state
    - Reject with "ルームが満員です" when participants >= max_players
    - Append suffix for name collision (e.g., "たろう(2)")
    - Mark DB row 'finished' and unsubscribe channel when last participant leaves with no pending timers
    - _Requirements: 7.3, Edge Cases_
  - [x] 11.2 Write property test for room closure (Property 12)
    - **Property 12: Room closure on empty**
    - **Validates: Requirements 7.3**

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property tests that can be skipped for faster MVP (except Property 12 which is mandatory)
- Pure JS modules (tasks 1-3) are built first for testability, then wired into HTML (tasks 7-9)
- Property tests use fast-check library with minimum 100 iterations per property
- All ordering uses monotonic counters (joinCounter, queueCounter), never Date.now()
- clientId in localStorage (survives reload and browser restart)
- reconnectToken removed — clientId + owner's in-memory participant map is sufficient for identity
- Deadlines stored as absolute timestamps for timer reconstruction on ownership transfer
- stateId.version increments on EVERY authoritative mutation, not just state transitions
- Heartbeat miss detection uses 15s wall-clock timeout (not sequence count) with jittered check intervals
- UI components read `getAvailableActions()` from RoomStateManager — UI never makes state decisions directly
- DB updated_at trigger ensures any DB write keeps the room alive for cleanup purposes
