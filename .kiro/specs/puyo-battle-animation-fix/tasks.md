# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - [x] 1.1 Visual effects bug-condition test (must fail)
    - **Property 1A: Bug Condition** - Missing Visual Effects
    - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
    - **DO NOT attempt to fix the test or the code when it fails**
    - Call `findAndClear` on a grid with 4+ connected puyos in battle mode → assert escape animation DOM elements are spawned (position:fixed, correct image src), particles array grows by 3 per cleared puyo, and chain text appears for chainCount >= 2
    - Test that `findAndClear` in puyo-battle.html does NOT spawn escape animations
    - Run test on UNFIXED code - expect FAILURE
    - **EXPECTED OUTCOME**: Test FAILS (proves visual effects bug exists)
    - Document counterexamples: zero `.puyo-escape` DOM elements, `particles` undefined/empty, no chain text
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Sequence fairness bug-condition test (must fail)
    - **Property 1B: Bug Condition** - Non-Deterministic Puyo Sequence
    - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
    - **DO NOT attempt to fix the test or the code when it fails**
    - Initialize two instances with same seed → call `rand()` N times on each → assert sequences are identical
    - Verify current `rand()` uses `Math.random()` (non-deterministic)
    - Run test on UNFIXED code - expect FAILURE
    - **EXPECTED OUTCOME**: Test FAILS (proves sequence fairness bug exists)
    - Document counterexamples: two clients produce different color sequences for same seed
    - _Requirements: 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Score, Garbage, and Broadcast Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **Step 1 - Observe on UNFIXED code**:
    - Observe: `calcScore(1, {totalCleared:4, groups:[{color:0,count:4}], colorCount:1})` returns 40 on unfixed code
    - Observe: `calcScore(2, {totalCleared:4, groups:[{color:0,count:4}], colorCount:1})` returns 320 on unfixed code
    - Observe: garbage sent = `Math.floor(pts / 70)` for any score value
    - Observe: `broadcastState()` payload contains only `{grid, score, pair, next}` — no animation data
    - Observe: `findAndClear` returns same `{totalCleared, groups, colorCount}` regardless of animation presence
  - **Step 2 - Write property-based tests**:
    - For all random grid configurations with 4+ connected puyos: `calcScore(chainNum, findAndClear(grid))` produces identical output before and after fix
    - For all score values: `Math.floor(score / GARBAGE_RATE)` garbage count is unchanged
    - For all broadcast events: payload structure is `{grid, score, pair, next}` with no animation keys
    - For all chain results: `findAndClear` return value (totalCleared, groups, colorCount) is unchanged by animation additions
  - **Step 3 - Verify on UNFIXED code**:
    - Run tests on UNFIXED code
    - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 3. Fix for missing visual effects and non-deterministic puyo sequence

  - [x] 3.1 Extract shared animation CSS to `css/puyo-escape.css`
    - Create `css/puyo-escape.css` with keyframes: `puyoEscapeFly`, `puyoEscapeGhost`, `puyoEscapeWobble`, `puyoBurst`, `puyoWobble` and `.puyo-escape` class styles
    - Extract these from `pages/game.html` `<style>` block
    - Add `<link rel="stylesheet" href="../css/puyo-escape.css">` to `puyo-battle.html`
    - Replace inline keyframes in `game.html` with the same `<link>` import
    - _Bug_Condition: isBugCondition(input) where input.context === 'battle' AND escapeAnimationNotSpawned_
    - _Expected_Behavior: Shared CSS enables escape animation rendering in battle mode_
    - _Preservation: game.html existing animations continue to work (same CSS, just moved to external file)_
    - _Requirements: 2.7, 3.4, 4.2, 4.9_

  - [x] 3.2 Add `puyo-escape.js` script import to `puyo-battle.html`
    - Add `<script src="../js/puyo-escape.js"></script>` before the main `<script>` block
    - This provides `spawnPuyoEscape` function for special puyo motions (puyo_8 fly, puyo_9 ghost)
    - _Bug_Condition: puyo-escape.js not loaded in battle mode_
    - _Expected_Behavior: spawnPuyoEscape available for colorIdx 7 and 8_
    - _Preservation: No changes to puyo-escape.js itself_
    - _Requirements: 2.4, 2.5, 4.1_

  - [x] 3.3 Implement `spawnEscapePuyo` function in `puyo-battle.html`
    - Port from game.html: create DOM element at puyo's canvas position (using `myCanvas.getBoundingClientRect()`)
    - 4-stage animation: burst → scatter → getup → run (normal puyos)
    - For colorIdx 7 (puyo_8): delegate to `spawnPuyoEscape` with fly motion
    - For colorIdx 8 (puyo_9): delegate to `spawnPuyoEscape` with ghost motion
    - Performance guard: cap at ~60 concurrent DOM elements (enough for 10-chain worst case: ~40 puyos × 1.5 overlap), remove oldest inactive first
    - Animation is local-visual only (not included in broadcast)
    - _Bug_Condition: spawnEscapePuyo not defined in battle mode_
    - _Expected_Behavior: Each cleared puyo spawns escape animation with correct image and 4-stage timing_
    - _Preservation: No effect on score calculation or broadcast payload_
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 3.7, 3.8, 4.1, 4.5, 4.6_

  - [x] 3.4 Add particles array and rendering to `puyo-battle.html`
    - Declare `let particles = [];` in game state
    - In `findAndClear`: push 3 particles per cleared puyo `{x, y, vx, vy, color, size, life}` matching game.html behavior
    - In `drawBoard` for local canvas only (`isMine === true`): add particle update/render loop
    - Particles render only on local player's canvas (not opponent's)
    - _Bug_Condition: particles array undefined, no particle rendering on clear_
    - _Expected_Behavior: 3 particles per cleared puyo with velocity, color, lifetime matching normal mode_
    - _Preservation: Particles are visual-only, no effect on game logic or broadcast_
    - _Requirements: 2.3, 2.3.1, 2.6, 3.7, 3.8_

  - [x] 3.5 Add chain text display
    - In `resolveChain`, when `myChain > 1`: create/update positioned DOM element showing "N連鎖!" centered above `myCanvas`
    - Remove chain text immediately before spawning next controllable pair (in the `setTimeout` callback before `spawnPair()`)
    - Chain text must not obscure active falling puyos (z-index: above canvas, below modal overlays)
    - _Bug_Condition: No chain text displayed for chainCount >= 2_
    - _Expected_Behavior: "N連鎖!" text centered above local board, removed before next pair spawns_
    - _Preservation: Chain text is visual-only, no effect on score or broadcast_
    - _Requirements: 2.2, 2.2.1, 3.7_

  - [x] 3.6 Implement mulberry32 seeded PRNG
    - Implement `mulberry32` as a stateful object exposing mutable internal state for reconnection persistence:
      ```javascript
      function createPRNG(seed) {
        const rng = {
          state: seed | 0,
          next() {
            rng.state = rng.state + 0x6D2B79F5 | 0;
            let t = Math.imul(rng.state ^ rng.state >>> 15, 1 | rng.state);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
          }
        };
        return rng;
      }
      ```
    - `rng.state` is directly readable/writable for reconnection state persistence
    - Implementation must be byte-identical on all clients (no environment-dependent APIs)
    - Add `let puyoRng = null; let garbageRng = null; let puyoSeqIndex = 0;`
    - Replace `function rand() { return Math.floor(Math.random() * NUM_COLORS); }` with seeded version:
      ```javascript
      function rand() {
        const v = Math.floor(puyoRng.next() * NUM_COLORS);
        puyoSeqIndex++;
        return v;
      }
      ```
    - Sequence index increments only after successful generation
    - `generateRoomCode()` continues using `Math.random()` (non-gameplay, pre-seed-init)
    - `dropGarbage()` hole position SHALL use a separate seeded PRNG instance (`garbageRng = createPRNG(seed ^ 0xDEADBEEF)`), NOT `Math.random()`
    - No gameplay-affecting logic may use `Math.random()` after seed initialization
    - _Bug_Condition: rand() uses Math.random() directly — non-deterministic_
    - _Expected_Behavior: Same seed produces identical puyo color sequence on all clients_
    - _Preservation: generateRoomCode unaffected (pre-seed-init). Garbage hole position now deterministic via separate PRNG._
    - _Requirements: 2.8, 2.8.2, 2.8.3, 2.8.4, 2.8.5, 4.7, 4.7.1, 4.7.2, 4.7.3, 4.8_

  - [x] 3.7 Share seed at game start and support reconnection
    - In `createRoom`: generate seed via `crypto.getRandomValues(new Uint32Array(1))[0]` (fallback `Date.now()`)
    - In channel `join` broadcast: include seed in payload from host
    - In `joinRoom` subscribe callback: receive seed from host's broadcast
    - In `startBattle`: initialize `puyoRng = createPRNG(seed)` and `garbageRng = createPRNG(seed ^ 0xDEADBEEF)`
    - Reconnection: store `puyoRng.state` and `garbageRng.state` directly in broadcast state payload
    - On reconnect: restore PRNG by setting `puyoRng.state = storedState` directly (no expensive replay)
    - Seed remains immutable after game start, even if host disconnects
    - _Bug_Condition: No seed sharing mechanism exists_
    - _Expected_Behavior: Both clients initialize identical PRNG from shared seed_
    - _Preservation: Existing channel events (state, garbage, gameover) unchanged_
    - _Requirements: 2.8.1, 2.8.6, 3.3, 3.9, 4.7, 4.7.4_

  - [x] 3.8 Call `spawnEscapePuyo` and generate particles in `findAndClear`
    - After clearing each group, call `spawnEscapePuyo` for each cleared position (using canvas rect to compute screen coordinates)
    - Generate 3 particles per cleared puyo position
    - This wires up the animation functions (3.3, 3.4) into the actual clear logic
    - _Bug_Condition: findAndClear only sets grid[r][c] = null without spawning animations_
    - _Expected_Behavior: Each cleared puyo triggers escape animation and particle generation_
    - _Preservation: findAndClear return value (totalCleared, groups, colorCount) unchanged_
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 4.3_

  - [x] 3.9 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Visual Effects Spawned & Deterministic Sequence
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Escape animations spawn for each cleared puyo
      - Particles generated (3 per cleared puyo)
      - Chain text appears for chainCount >= 2
      - Seeded PRNG produces identical sequences for same seed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

  - [x] 3.10 Verify preservation tests still pass
    - **Property 2: Preservation** - Score, Garbage, and Broadcast Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm: calcScore output identical, garbage calculation unchanged, broadcast payload has no animation data
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite
  - Verify escape animations appear on local player's clear events only
  - Verify chain text centered above local board, removed before next pair
  - Verify particles render on local canvas only
  - Verify two clients with same seed produce identical puyo sequences
  - Verify no frame drop below 30fps on 10-chain (Chrome desktop 60Hz)
  - Verify broadcast payload unchanged (no animation data)
  - Verify game.html normal mode animations still work
