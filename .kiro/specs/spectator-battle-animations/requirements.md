# Requirements Document

## Introduction

観戦者（spectator）が対戦中のプレイヤーと同じ連鎖演出（逃走アニメーション、パーティクル、連鎖テキスト）を両方のプレイヤーボード上で視聴できるようにする機能。プレイヤーが連鎖消去を行った際に軽量な `chain_animation` イベントをブロードキャストし、観戦者側でローカルにアニメーションを再生する。

## Glossary

- **Spectator**: ルームに参加しているが対戦には参加していないユーザー（role = 'spectator' or 'queue'）
- **Active_Player**: 対戦中のプレイヤー（role = 'seatA' or 'seatB'）
- **Chain_Animation_Event**: 連鎖消去発生時にブロードキャストされるイベント（payload: {clientId, chainNum, clears}）
- **Broadcaster**: 連鎖消去を行い `chain_animation` イベントを送信する Active_Player
- **Animation_Renderer**: 受信した Chain_Animation_Event を画面上に描画するコンポーネント
- **Escape_Animation**: 消去されたぷよが弾けて逃げる4段階モーションアニメーション（burst → scatter → getup → run）
- **Particle_Overlay**: パーティクルエフェクトを描画するオーバーレイ canvas
- **Chain_Text**: 連鎖数を表示するテキスト要素（例: "3連鎖!"）
- **Target_Board**: アニメーションを描画する対象のキャンバス（seatA → myCanvas/左, seatB → oppCanvas/右）
- **DOM_Element_Cap**: 同時に存在できる逃走アニメーション DOM 要素の上限（60個）
- **Color_Puyo**: colorIdx が 0〜8 の通常ぷよ
- **Garbage_Puyo**: colorIdx が -2 のお邪魔ぷよ

## Requirements

### Requirement 1: Chain Animation Event Broadcasting

**User Story:** As an active player, I want my chain clears to broadcast animation data, so that spectators can see the same chain animations I see locally.

#### Acceptance Criteria

1. WHEN a chain clear is detected in resolveChains(), THE Broadcaster SHALL send a `chain_animation` event containing clientId, chainNum, and clears array via the Supabase channel
2. WHEN a chain step clears color puyos, THE Broadcaster SHALL include the col, row, and colorIdx of each cleared Color_Puyo in the clears array
3. THE Chain_Animation_Event payload SHALL contain only clientId (string), chainNum (number >= 1), and clears (array of {col, row, colorIdx})
4. WHEN multiple chain steps occur in sequence, THE Broadcaster SHALL send one Chain_Animation_Event per chain step with the correct chainNum for that step

### Requirement 2: Spectator Animation Rendering

**User Story:** As a spectator, I want to see chain animations on both player boards, so that I have the same visual experience as the active players.

#### Acceptance Criteria

1. WHEN a Spectator receives a Chain_Animation_Event, THE Animation_Renderer SHALL spawn one Escape_Animation for each cleared Color_Puyo (colorIdx >= 0) in the clears array
2. WHEN a Spectator receives a Chain_Animation_Event, THE Animation_Renderer SHALL generate 3 particles per cleared Color_Puyo on the Particle_Overlay
3. WHEN a Spectator receives a Chain_Animation_Event with chainNum >= 2, THE Animation_Renderer SHALL display Chain_Text showing "N連鎖!" above the Target_Board
4. WHEN a Spectator receives a Chain_Animation_Event with chainNum === 1, THE Animation_Renderer SHALL NOT display Chain_Text
5. WHEN a Chain_Animation_Event contains Garbage_Puyo clears (colorIdx = -2), THE Animation_Renderer SHALL generate particles but SHALL NOT spawn Escape_Animations for those clears

### Requirement 3: Board Targeting

**User Story:** As a spectator, I want animations to appear on the correct player board, so that I can tell which player triggered the chain.

#### Acceptance Criteria

1. WHEN a Chain_Animation_Event has clientId matching seatAClientId, THE Animation_Renderer SHALL render all animations on myCanvas (left board)
2. WHEN a Chain_Animation_Event has clientId matching seatBClientId, THE Animation_Renderer SHALL render all animations on oppCanvas (right board)
3. WHEN chain animations occur on both boards simultaneously, THE Animation_Renderer SHALL render both sets of animations independently without interference

### Requirement 4: Active Player Isolation

**User Story:** As an active player, I want to ignore broadcast chain animation events, so that my local animations are not duplicated.

#### Acceptance Criteria

1. WHEN an Active_Player (role = seatA or seatB) receives a Chain_Animation_Event, THE Animation_Renderer SHALL perform no action and return immediately
2. THE Active_Player's local chain animations SHALL continue to be triggered independently by resolveChains() without dependency on the broadcast event

### Requirement 5: Particle Overlay System

**User Story:** As a spectator, I want to see particle effects during chain clears, so that the visual experience matches what active players see.

#### Acceptance Criteria

1. THE Particle_Overlay SHALL be a canvas element positioned absolutely over the game boards with pointer-events disabled
2. WHEN particles are active, THE Particle_Overlay SHALL render all particles using a requestAnimationFrame loop
3. WHEN all particles have expired (life <= 0), THE Particle_Overlay render loop SHALL self-terminate by cancelling the animation frame
4. WHEN new particles are generated while the render loop is inactive, THE Particle_Overlay SHALL restart the render loop

### Requirement 6: Performance Constraints

**User Story:** As a spectator, I want animations to perform smoothly without degrading the browser, so that the viewing experience remains responsive.

#### Acceptance Criteria

1. WHILE escape animations are active, THE Animation_Renderer SHALL maintain a maximum of 60 concurrent Escape_Animation DOM elements (DOM_Element_Cap)
2. WHEN the DOM_Element_Cap is reached, THE Animation_Renderer SHALL remove the oldest inactive elements before spawning new ones
3. THE Chain_Animation_Event payload size SHALL remain bounded (maximum ~40 clears per chain step)

### Requirement 7: Payload Validation

**User Story:** As a spectator, I want malformed animation events to be handled gracefully, so that the application does not crash.

#### Acceptance Criteria

1. IF a Chain_Animation_Event is received with missing or invalid fields (clientId, chainNum, or clears), THEN THE Animation_Renderer SHALL discard the event without processing
2. IF a Chain_Animation_Event contains clears with out-of-range col or row values, THEN THE Animation_Renderer SHALL skip those individual clears without affecting valid ones
3. IF a Chain_Animation_Event is received before canvases are initialized, THEN THE Animation_Renderer SHALL discard the event silently

### Requirement 8: Spectator State Initialization

**User Story:** As a spectator, I want the system to correctly identify which player is on which board, so that animations target the correct side.

#### Acceptance Criteria

1. WHEN a Spectator enters spectator view, THE system SHALL store seatAClientId and seatBClientId from the room state snapshot
2. WHEN a room_state_sync is received with updated seat assignments, THE system SHALL update seatAClientId and seatBClientId accordingly
3. THE system SHALL set spectatorMode to true when the user's role is 'spectator' or 'queue'
