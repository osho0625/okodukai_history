# Puyo Battle Animation & Sequence Fairness Bugfix Design

## Overview

対戦モード（`pages/puyo-battle.html`）にノーマルモード（`pages/game.html`）と同等の視覚演出（逃走アニメーション、連鎖テキスト、パーティクル）を追加し、さらにぷよ出現順序をseeded PRNGで同期することで公平な対戦を実現する。

修正は2つの独立した問題を対象とする:
1. **視覚演出の欠落**: 消去時アニメーション・エフェクトが未実装
2. **ぷよ順序の不公平**: `Math.random()` による独立乱数でぷよ色が非同期

## Glossary

- **Bug_Condition (C)**: 対戦モードでぷよが消去される、または対戦開始時にぷよ色が生成される状況
- **Property (P)**: 消去時に逃走アニメーション・パーティクル・連鎖テキストが表示される / 両端末で同一ぷよ順序が生成される
- **Preservation**: 既存のスコア計算、お邪魔ぷよ送信、broadcast同期、ノーマルモード動作が変更されないこと
- **`spawnEscapePuyo`**: `pages/game.html` 内の関数。消去されたぷよのDOM要素を生成し4段階アニメーション（burst→scatter→getup→run）を実行
- **`spawnPuyoEscape`**: `js/puyo-escape.js` の共通関数。特殊ぷよ（puyo_8飛行、puyo_9浮遊）の逃走モーションを実行
- **mulberry32**: 32bit seed から決定的な疑似乱数列を生成する軽量PRNG アルゴリズム
- **Sequence Index**: PRNGが何回advanceしたかを示すカウンタ。再接続時の状態復元に使用

## Bug Details

### Bug Condition

バグは2つの独立した条件で発現する:

**条件A（視覚演出欠落）**: 対戦モードでぷよが4つ以上繋がって消去されたとき、逃走アニメーション・パーティクル・連鎖テキストが表示されない。

**条件B（ぷよ順序不公平）**: 対戦開始時に各端末が独立した `Math.random()` でぷよ色を生成するため、両者のぷよ出現順序が異なる。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { event: 'clear' | 'generate_color', context: 'battle' }
  OUTPUT: boolean
  
  IF input.context !== 'battle' THEN RETURN false
  
  // 条件A: 消去時に視覚演出がない
  IF input.event === 'clear'
     AND puyoGroupSize >= 4
     AND (escapeAnimationNotSpawned OR particlesNotSpawned OR chainTextNotShown)
  THEN RETURN true
  
  // 条件B: ぷよ色生成が非決定的
  IF input.event === 'generate_color'
     AND usesNonSeededRandom()
  THEN RETURN true
  
  RETURN false
END FUNCTION
```

### Examples

- **逃走アニメーション欠落**: 4つの赤ぷよが繋がって消去 → ぷよが即座に消えるだけで、弾ける・落ちる・走るアニメーションが表示されない（期待: burst→scatter→getup→run の4段階アニメーション）
- **連鎖テキスト欠落**: 3連鎖が発生 → 「3連鎖!」テキストが表示されない（期待: ローカル盤面上部中央に表示）
- **パーティクル欠落**: ぷよ消去 → 破片エフェクトなし（期待: 各ぷよにつき3個のパーティクル生成）
- **特殊ぷよモーション欠落**: puyo_8消去 → 即座に消える（期待: 飛行モーションで画面外へ）
- **ぷよ順序不一致**: Player1の最初のペアが赤-青、Player2の最初のペアが緑-黄（期待: 両者同一）

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- スコア計算ロジック（`calcScore`）は変更しない
- お邪魔ぷよの送信・受信・相殺ロジックは変更しない
- 200msごとのbroadcast state送信は変更しない
- ノーマルモード（`pages/game.html`）の既存アニメーションは影響を受けない
- お邪魔ぷよの隣接消去ロジックは変更しない
- ルームコード生成（`generateRoomCode`）は既存の`Math.random()`を継続使用

**Scope:**
以下の入力・操作はこの修正の影響を受けない:
- マウス/タッチによるぷよ操作（左右移動、回転、ハードドロップ）
- ロビー画面のUI操作（ルーム作成、参加、キャンセル）
- 相手盤面の描画（相手側には逃走演出を同期しない）
- broadcast payloadの構造（アニメーション情報を含めない）

## Hypothesized Root Cause

### 条件A: 視覚演出欠落

1. **`spawnEscapePuyo` 関数が未実装**: `puyo-battle.html` の `findAndClear` 関数内で消去時に `grid[r][c] = null` のみ実行し、アニメーション生成を呼び出していない
2. **`puyo-escape.js` 未読み込み**: `<script src="../js/puyo-escape.js"></script>` が `puyo-battle.html` に含まれていない
3. **パーティクル配列が未定義**: `particles` 配列と描画ループが存在しない
4. **連鎖テキスト表示ロジックが未実装**: `resolveChain` 内で `chainCount > 1` 時のテキスト表示がない
5. **CSS keyframes 未定義**: `puyoEscapeFly`, `puyoEscapeGhost`, `puyoEscapeWobble` のアニメーション定義がない

### 条件B: ぷよ順序不公平

1. **`rand()` が `Math.random()` を直接使用**: `function rand() { return Math.floor(Math.random() * NUM_COLORS); }` — 非決定的
2. **シード共有メカニズムが未実装**: ルーム作成時にシードを生成・共有するロジックがない
3. **PRNG実装が存在しない**: mulberry32等のseeded PRNG関数が定義されていない

## Correctness Properties

Property 1: Bug Condition - Escape Animation Spawned on Clear

_For any_ puyo clear event in battle mode where 4+ connected puyos are removed, the fixed `findAndClear` function SHALL spawn an escape animation element (DOM node with position:fixed) for each cleared puyo, with the correct image source and 4-stage motion timing matching normal mode.

**Validates: Requirements 2.1, 2.4, 2.5, 2.7**

Property 2: Bug Condition - Chain Text Display

_For any_ chain event in battle mode where chainCount >= 2, the fixed `resolveChain` function SHALL display chain text ("N連鎖!") centered above the local player's board, and remove it when the chain sequence ends.

**Validates: Requirements 2.2, 2.2.1**

Property 3: Bug Condition - Particle Effects on Clear

_For any_ puyo clear event in battle mode, the fixed `findAndClear` function SHALL generate 3 particles per cleared puyo with velocity, color, and lifetime matching normal mode behavior.

**Validates: Requirements 2.3, 2.3.1**

Property 4: Bug Condition - Deterministic Puyo Sequence

_For any_ two clients initialized with the same seed value, calling the seeded `rand()` function N times SHALL produce an identical sequence of color values on both clients, and the sequence SHALL differ from `Math.random()` based generation.

**Validates: Requirements 2.8, 2.8.2, 2.8.3, 2.8.5**

Property 5: Preservation - Score and Garbage Unchanged

_For any_ puyo clear event in battle mode, the fixed code SHALL produce the same score calculation and garbage-send count as the original code, preserving all battle mechanics unrelated to visual effects.

**Validates: Requirements 3.1, 3.2, 3.5**

Property 6: Preservation - Broadcast Payload Unchanged

_For any_ state broadcast in battle mode, the fixed code SHALL send the same payload structure (grid, score, pair, next) without animation data, preserving network synchronization behavior.

**Validates: Requirements 2.6, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `pages/puyo-battle.html`

**Changes**:

1. **Add `<script src="../js/puyo-escape.js"></script>`**: Import the shared escape animation library before the main script block.

2. **Add CSS keyframes**: Extract shared animation CSS (`@keyframes puyoEscapeFly`, `@keyframes puyoEscapeGhost`, `@keyframes puyoEscapeWobble`, `.puyo-escape` class) into `css/puyo-escape.css` and import via `<link>` from both `game.html` and `puyo-battle.html`.

3. **Implement `spawnEscapePuyo` function**: Port from `game.html` — creates DOM element at puyo's canvas position, applies 4-stage animation (burst→scatter→getup→run). For colorIdx 7/8, delegate to `spawnPuyoEscape` from `puyo-escape.js`.

4. **Add particles array and rendering**: 
   - Declare `let particles = [];` in game state
   - In `findAndClear`, push 3 particles per cleared puyo (matching game.html: `{x, y, vx, vy, color, size, life}`)
   - In `drawBoard` for local canvas only, add particle update/render loop. Particles SHALL render only on the local player's canvas.

5. **Add chain text display**:
   - In `resolveChain`, when `myChain > 1`: create/update a positioned DOM element showing "N連鎖!" centered above `myCanvas`
   - Remove chain text immediately before spawning next controllable pair (not just "when chain ends")

6. **Implement seeded PRNG (stateful object)**:
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
   - Stateful object exposes `rng.state` for direct read/write (enables reconnection persistence without expensive replay)

7. **Replace `rand()` with seeded version**:
   - Add `let puyoRng = null; let garbageRng = null; let puyoSeqIndex = 0;`
   - Replace `function rand() { return Math.floor(Math.random() * NUM_COLORS); }` with:
     ```javascript
     function rand() {
       const v = Math.floor(puyoRng.next() * NUM_COLORS);
       puyoSeqIndex++;
       return v;
     }
     ```
   - Sequence index SHALL increment only after successful PRNG generation.
   - `dropGarbage()` hole position SHALL use a separate seeded PRNG instance (`garbageRng = createPRNG(seed ^ 0xDEADBEEF)`), NOT `Math.random()`.
   - No gameplay-affecting logic may call `Math.random()` after seed initialization. Only non-gameplay uses (e.g., `generateRoomCode` before game start) may continue using `Math.random()`.

8. **Share seed at game start**:
   - In `createRoom`: generate seed using `crypto.getRandomValues(new Uint32Array(1))[0]` (fallback to `Date.now()` if crypto API unavailable)
   - In channel `join` broadcast response: include seed in payload
   - In `joinRoom` subscribe callback: receive seed from host's response
   - In `startBattle`: initialize `puyoRng = createPRNG(seed)` and `garbageRng = createPRNG(seed ^ 0xDEADBEEF)`

9. **Reconnection support**:
   - Store `puyoRng.state` and `garbageRng.state` directly in broadcast state payload
   - On reconnect: restore PRNG by setting `puyoRng.state = storedState` directly (no expensive replay)
   - Fallback: if only seed + index available, re-initialize with seed and advance `puyoSeqIndex` times

10. **Performance guard**: Limit max concurrent escape animation DOM elements (cap at ~60 elements, remove oldest **inactive** elements first when exceeded during large chains. Active animations SHALL NOT be removed prematurely).

11. **Extract shared animation CSS**: Move shared animation keyframes and `.puyo-escape` styles to `css/puyo-escape.css` and import from both `game.html` and `puyo-battle.html` to avoid drift and duplication.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Inspect the DOM and canvas state during puyo clears in battle mode. Verify that no escape animation elements are created, no particles are rendered, and no chain text appears.

**Test Cases**:
1. **Escape Animation Absent**: Trigger a 4-puyo clear in battle mode → verify no `.puyo-escape` or `position:fixed` animation elements are added to DOM (will fail on unfixed code)
2. **Chain Text Absent**: Trigger a 2+ chain in battle mode → verify no chain text element appears (will fail on unfixed code)
3. **Particle Absent**: Trigger a clear in battle mode → verify canvas has no particle rendering (will fail on unfixed code)
4. **Sequence Divergence**: Start two clients in same room → compare first 10 puyo colors generated → verify they differ (will fail on unfixed code, confirming non-determinism)

**Expected Counterexamples**:
- Zero DOM elements with escape animation classes after clear events
- `particles` array undefined or empty after clears
- Two clients produce different color sequences for same game
- Possible causes: missing function definitions, missing script import, `Math.random()` usage

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.event === 'clear' THEN
    result := findAndClear_fixed(grid)
    ASSERT escapeAnimationsSpawned(result.clearedPositions)
    ASSERT particlesGenerated(result.clearedPositions, count=3)
    IF chainCount >= 2 THEN ASSERT chainTextVisible(chainCount)
  END IF
  IF input.event === 'generate_color' THEN
    seq1 := generateSequence(seed, N)
    seq2 := generateSequence(seed, N)
    ASSERT seq1 === seq2
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT broadcastPayload_fixed(input) === broadcastPayload_original(input)
  ASSERT calcScore_fixed(input) === calcScore_original(input)
  ASSERT garbageSent_fixed(input) === garbageSent_original(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random grid states and chain scenarios to verify score calculation is unchanged
- It catches edge cases in garbage calculation that manual tests might miss
- It provides strong guarantees that broadcast payload structure is preserved

**Test Plan**: Observe behavior on UNFIXED code first for score calculation, garbage sending, and broadcast payloads, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Score Calculation Preservation**: Generate random chain results → verify `calcScore` output is identical before and after fix
2. **Garbage Send Preservation**: Generate random score values → verify garbage count calculation is unchanged
3. **Broadcast Payload Preservation**: Trigger state broadcasts → verify payload structure has no animation data
4. **Normal Mode Preservation**: Run normal mode game.html → verify existing animations still work correctly

### Unit Tests

- Test `mulberry32` produces deterministic output for same seed
- Test `mulberry32` produces different output for different seeds
- Test `rand()` with seeded PRNG produces values in [0, NUM_COLORS)
- Test `spawnEscapePuyo` creates DOM element with correct position and image
- Test particle generation count (3 per cleared puyo)
- Test chain text appears only for chainCount >= 2
- Test chain text is removed when chain ends
- Test escape animation cap (max ~60 concurrent elements)

### Property-Based Tests

- Generate random seeds → verify two PRNG instances with same seed produce identical sequences of arbitrary length
- Generate random grid configurations → verify `findAndClear` score output is unchanged by animation additions
- Generate random chain lengths → verify chain text visibility matches `chainCount >= 2` condition
- Generate random clear events → verify particle count equals `clearedPuyoCount * 3`
- Generate random broadcast states → verify no animation-related keys in payload

### Integration Tests

- Full battle flow: create room → join → play until chain → verify animations appear on clearing player's screen only
- Seed sharing: create room → join → verify both clients generate identical first 20 puyo colors
- Reconnection: disconnect → reconnect → verify next puyo matches expected sequence position
- Performance: trigger 10-chain clear → measure frame time stays below 33ms (30fps threshold)
- Large chain: trigger maximum chain → verify DOM element cap prevents memory leak
