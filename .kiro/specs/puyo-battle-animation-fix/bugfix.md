# Bugfix Requirements Document

## Introduction

対戦モード（`pages/puyo-battle.html`）において、ノーマルモード（`pages/game.html`）に存在する連鎖アニメーションとピクミン（ぷよ）逃走アニメーションが実装されていない。これにより対戦モードのゲーム体験がノーマルモードと比較して視覚的に乏しくなっている。

ノーマルモードでは、ぷよが消える際に以下の演出がある:
- ぷよが弾けて地面に落ち、起き上がって画面端へ走って逃げるアニメーション（`spawnEscapePuyo` / `spawnPuyoEscape`）
- 特殊ぷよ（puyo_8: 飛行、puyo_9: ふよふよ浮遊）の固有逃走モーション
- 消去時のパーティクルエフェクト
- 連鎖数テキスト表示（「2連鎖!」「3連鎖!」等）

対戦モードではこれらが全て欠落しており、ぷよが即座に消えるだけの処理になっている。

バトル要素（お邪魔ぷよ、相殺、通信同期）以外のゲーム性はノーマルぴくぴくに完全準拠とする。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN ぷよが4つ以上繋がって消去される THEN the system はぷよを即座にグリッドから削除し、逃走アニメーションを表示しない

1.2 WHEN 2連鎖以上の連鎖が発生する THEN the system は連鎖数テキスト（「N連鎖!」）を画面に表示しない

1.3 WHEN ぷよが消去される THEN the system はパーティクル（破片）エフェクトを表示しない

1.4 WHEN 特殊ぷよ（puyo_8, puyo_9）が消去される THEN the system は固有の逃走モーション（飛行・浮遊）を表示しない

1.5 WHEN 対戦が開始される THEN the system は各端末で独立に `Math.random()` でぷよ色を生成するため、両者のぷよ出現順序が異なり公平な条件で対戦できない

### Expected Behavior (Correct)

2.1 WHEN ぷよが4つ以上繋がって消去される THEN the system SHALL 各ぷよに対して逃走アニメーション（弾ける→地面に落ちる→起き上がる→走って画面端へ逃げる）を表示する

2.2 WHEN 2連鎖以上の連鎖が発生する THEN the system SHALL 連鎖数テキスト（「N連鎖!」）をローカルプレイヤーの盤面上部中央に表示する

2.2.1 Chain text SHALL appear centered above the local player's board.

2.3 WHEN ぷよが消去される THEN the system SHALL 消去位置にパーティクルエフェクトを表示する

2.3.1 Each cleared puyo SHALL spawn the same particle count as normal mode.

2.4 WHEN 特殊ぷよ（puyo_8: colorIdx=7）が消去される THEN the system SHALL 飛行モーションの逃走アニメーションを表示する

2.5 WHEN 特殊ぷよ（puyo_9: colorIdx=8）が消去される THEN the system SHALL ふよふよ浮遊モーションの逃走アニメーションを表示する

2.6 Animation effects SHALL be local-visual only and SHALL NOT be included in network synchronization payloads. 相手盤面には逃走演出を同期しない。

2.7 Escape animation duration SHALL match normal mode timing（ノーマルモードと同一のタイミング定数を使用すること）.

### Puyo Sequence Fairness（ぷよ出現順序の公平性）

2.8 WHEN 対戦が開始される THEN the system SHALL 両プレイヤーに同一のぷよ出現順序を提供すること。

2.8.1 ルーム作成者がシード値を生成し、参加者にbroadcastで共有する。

2.8.2 両端末は共有シードを用いたseeded PRNG（疑似乱数生成器）で `rand()` を実装し、`Math.random()` を使用しない。

2.8.3 同じシードから生成されるぷよ色の列は、両端末で完全に一致すること。

2.8.4 お邪魔ぷよの穴位置など、ぷよ色以外のランダム要素は別系列のPRNGまたは独立処理とし、ぷよ色シーケンスに影響を与えないこと。

2.8.5 PRNG SHALL advance exactly once per puyo color generation event. Pre-generation or variable-length buffering is prohibited unless identical on both clients.

2.8.6 Shared seed SHALL remain immutable after game start, even if host disconnects.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN ぷよが消去される THEN the system SHALL CONTINUE TO 正しくスコアを計算しお邪魔ぷよを相手に送信する

3.2 WHEN 連鎖が終了する THEN the system SHALL CONTINUE TO お邪魔ぷよを降らせてから次のぷよを出す

3.3 WHEN 対戦中にぷよを操作する THEN the system SHALL CONTINUE TO 200msごとに状態をbroadcastし相手の盤面を同期する

3.4 WHEN ノーマルモード（game.html）でぷよが消去される THEN the system SHALL CONTINUE TO 既存の逃走アニメーションを正常に表示する

3.5 WHEN 対戦モードでお邪魔ぷよが隣接消去される THEN the system SHALL CONTINUE TO お邪魔ぷよを正しく除去する

3.6 WHEN ルームコード生成やお邪魔ぷよ穴位置など非ぷよ色のランダム処理 THEN the system SHALL CONTINUE TO 正常に動作すること（seeded PRNGの導入が他のランダム処理を壊さない）

3.7 Animation layers SHALL NOT obscure active falling puyos or UI overlays（アニメーションレイヤーが操作中のぷよやUIを隠さないこと）.

3.8 10連鎖以上でも frame drop を起こさないこと。Animation must not reduce frame rate below 30fps（測定条件: Chrome desktop 60Hz環境で10連鎖消去時）.

3.9 WHEN a player reconnects THEN the system SHALL restore identical next-piece state using current sequence index or PRNG state.

## Implementation Constraints

4.1 Reuse existing animation logic from `pages/game.html` where possible. 対戦モードでは以下の関数を再利用または同等実装すること:
  - `spawnEscapePuyo` — 逃走アニメーション生成
  - `spawnPuyoEscape` — 特殊ぷよ逃走モーション（js/puyo-escape.js）
  - chain text rendering logic — 連鎖数テキスト描画
  - particle generation logic — パーティクル生成

4.2 可能な限りロジックを共通化し、重複実装を避ける。

4.3 Animation effects are visual-only and must not affect battle synchronization logic. broadcast payloadにアニメーション情報を含めない。

4.4 Animation timing must match normal mode behavior（タイミング定数はノーマルモードと同一値を使用）.

4.5 Rendering order must not block gameplay visibility（z-indexの適切な設定）.

4.6 Performance must remain stable during large chain clears（大連鎖時もパフォーマンス維持）.

4.7 Seeded PRNG implementation: mulberry32等の軽量アルゴリズムを使用し、シード生成には `crypto.getRandomValues(new Uint32Array(1))[0]` を使用（crypto API不可時のみ `Date.now()` にfallback）→ joinイベントのレスポンスまたはgame startイベントでシードを共有 → 両端末で同一シードからぷよ色列を生成する。

4.7.1 PRNG implementation must be byte-identical on all clients. No environment-dependent randomness APIs may be used.

4.7.2 No gameplay-affecting logic may use `Math.random()` after seed initialization. ゲームプレイに影響するロジックはseed初期化後 `Math.random()` を使用禁止。

4.7.3 Sequence index SHALL increment only after successful PRNG generation（PRNGが正常に値を返した後にのみindexを進める）.

4.7.4 Persist PRNG internal state directly for reconnection recovery when possible（再接続時はPRNG内部状態を直接保存・復元し、N回replayを避ける）.

4.8 ぷよ色生成用PRNGとその他ランダム処理（ルームコード生成、お邪魔ぷよ穴位置）は別インスタンスとし、互いに干渉しないこと。

4.9 Shared animation CSS should be extracted into a common stylesheet (`css/puyo-escape.css`) and imported from both `game.html` and `puyo-battle.html` to prevent drift.
