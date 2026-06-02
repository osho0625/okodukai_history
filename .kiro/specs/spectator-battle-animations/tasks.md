# Implementation Plan: Spectator Battle Animations

## Overview

Add chain animation broadcasting from active players and rendering on spectator side. Modify `js/puyo-battle-main.js` to broadcast `chain_animation` events during `resolveChains()`, then add spectator-side handling with escape animations, particle overlay, and chain text display.

## Tasks

- [x] 1. Add spectator state variables and initialization
  - [x] 1.1 Add spectator state variables to global state section
    - Add `spectatorMode`, `seatAClientId`, `seatBClientId`, `spectatorParticles`, `spectatorParticleCanvas`, `spectatorAnimFrame` variables
    - _Requirements: 8.1, 8.3_
  - [x] 1.2 Initialize seatAClientId and seatBClientId in showSpectatorView
    - Read seatA/seatB clientIds from `roomManager.getSnapshot()` when entering spectator view
    - Set `spectatorMode = true`
    - Update clientIds on `room_state_sync` events
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Broadcast chain_animation event from resolveChains
  - [x] 2.1 Modify resolveChains() to collect cleared puyo positions and broadcast
    - After detecting connected groups, collect `{col, row, colorIdx}` for each cleared Color_Puyo
    - Call `sendAction('chain_animation', { clientId: myClientId, chainNum, clears })` after each chain step
    - Ensure existing local animation and score logic remains unchanged
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 2.2 Write property test: Broadcast Payload Completeness
    - **Property 1: Broadcast Payload Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [ ]* 2.3 Write property test: Chain Step Sequencing
    - **Property 2: Chain Step Sequencing**
    - **Validates: Requirement 1.4**

- [x] 3. Implement handleChainAnimation for spectators
  - [x] 3.1 Add handleChainAnimation function with payload validation
    - Early return if role is seatA/seatB (active player isolation)
    - Validate payload fields: clientId (string), chainNum (number >= 1), clears (non-empty array)
    - Skip individual clears with out-of-range col/row values
    - Guard against uninitialized canvases
    - _Requirements: 4.1, 7.1, 7.2, 7.3_
  - [x] 3.2 Add board targeting logic in handleChainAnimation
    - Map clientId to myCanvas (left) if matches seatAClientId, oppCanvas (right) if matches seatBClientId
    - Calculate cell positions from canvas getBoundingClientRect
    - _Requirements: 3.1, 3.2_
  - [x] 3.3 Spawn escape animations for cleared color puyos
    - Call `spawnPuyoEscape()` for each clear where colorIdx >= 0
    - Skip garbage puyos (colorIdx < 0) for escape animations
    - Enforce DOM element cap of 60 concurrent escape elements
    - _Requirements: 2.1, 2.5, 6.1, 6.2_
  - [x] 3.4 Generate particles for cleared puyos
    - Add 3 particles per cleared Color_Puyo to `spectatorParticles` array
    - Also generate particles for garbage puyos
    - Start particle render loop if not already running
    - _Requirements: 2.2, 5.4_
  - [x] 3.5 Show chain text for chainNum >= 2
    - Create or reuse fixed-position chain text element per board side
    - Display "N連鎖!" above target board
    - Auto-hide after 1.5 seconds
    - Do not show for chainNum === 1
    - _Requirements: 2.3, 2.4_
  - [ ]* 3.6 Write property test: Escape Animation Count
    - **Property 3: Escape Animation Count**
    - **Validates: Requirements 2.1, 2.5**
  - [ ]* 3.7 Write property test: Particle Count Consistency
    - **Property 4: Particle Count Consistency**
    - **Validates: Requirement 2.2**
  - [ ]* 3.8 Write property test: Chain Text Threshold
    - **Property 5: Chain Text Threshold**
    - **Validates: Requirements 2.3, 2.4**
  - [ ]* 3.9 Write property test: Board Targeting Accuracy
    - **Property 6: Board Targeting Accuracy**
    - **Validates: Requirements 3.1, 3.2**
  - [ ]* 3.10 Write property test: Active Player Isolation
    - **Property 7: Active Player Isolation**
    - **Validates: Requirement 4.1**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement spectator particle overlay system
  - [x] 5.1 Add getOrCreateParticleOverlay function
    - Create a canvas element positioned absolutely over the game boards container
    - Set pointer-events: none and high z-index
    - Match dimensions to the battle area
    - Reuse existing overlay if already created
    - _Requirements: 5.1_
  - [x] 5.2 Add startSpectatorParticleLoop function
    - Render particles with decreasing opacity and gravity
    - Remove expired particles (life <= 0)
    - Self-terminate loop when no particles remain (set spectatorAnimFrame = null)
    - _Requirements: 5.2, 5.3_
  - [ ]* 5.3 Write property test: Particle Loop Self-Termination
    - **Property 8: Particle Loop Self-Termination**
    - **Validates: Requirement 5.3**

- [x] 6. Add DOM element cap enforcement and event listener registration
  - [x] 6.1 Implement DOM element cap logic
    - Track active escape animation elements
    - Before spawning new elements, check count against cap of 60
    - Remove oldest inactive elements when cap is reached
    - _Requirements: 6.1, 6.2_
  - [x] 6.2 Register chain_animation event listener on the channel
    - Add `channel.on('broadcast', { event: 'chain_animation' }, ...)` in channel setup
    - Route received payload to `handleChainAnimation()`
    - _Requirements: 2.1, 3.1, 3.2_
  - [ ]* 6.3 Write property test: DOM Element Cap Invariant
    - **Property 9: DOM Element Cap Invariant**
    - **Validates: Requirement 6.1**
  - [ ]* 6.4 Write property test: Payload Validation Robustness
    - **Property 10: Payload Validation Robustness**
    - **Validates: Requirements 7.1, 7.2**

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code changes are in `js/puyo-battle-main.js` (the shared animation library `js/puyo-escape.js` is used as-is)
- Property tests use fast-check library as specified in the design
- The existing `spawnPuyoEscape` function from `js/puyo-escape.js` is reused directly for spectator escape animations
