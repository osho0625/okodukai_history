// loop.js — Game loop (ported from MainFrame / DoFrame / WaitRepaint)

export class GameLoop {
  constructor(targetMs = 90) {
    this.targetMs = targetMs;  // ~11 FPS matching original
    this.running = false;
    this.frameCount = 0;
    this.onFrame = null;  // callback(dt) — update + draw
    this.onUpdate = null; // callback(dt) — update only (no draw)
    this.onDraw = null;   // callback() — draw only
    this._lastTime = 0;
    this._accumulator = 0;
    this._rafId = null;
  }

  start(onFrame, onUpdate, onDraw) {
    if (onUpdate && onDraw) {
      // Separated update/draw mode (prevents flickering)
      this.onUpdate = onUpdate;
      this.onDraw = onDraw;
      this.onFrame = null;
    } else {
      // Legacy combined mode
      this.onFrame = onFrame;
      this.onUpdate = null;
      this.onDraw = null;
    }
    this.running = true;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  setTargetMs(ms) {
    this.targetMs = ms;
  }

  _tick() {
    if (!this.running) return;
    this._rafId = requestAnimationFrame((now) => {
      const dt = now - this._lastTime;
      this._lastTime = now;
      this._accumulator += dt;

      // Cap to prevent spiral of death (max 3 frames per rAF)
      let steps = 0;
      while (this._accumulator >= this.targetMs && steps < 3) {
        this._accumulator -= this.targetMs;
        if (this.onUpdate) {
          this.onUpdate(this.targetMs);
        } else if (this.onFrame) {
          this.onFrame(this.targetMs);
        }
        this.frameCount++;
        steps++;
      }
      // Discard excess accumulated time to prevent catch-up stutter
      if (this._accumulator > this.targetMs * 3) {
        this._accumulator = 0;
      }

      // Draw once per rAF (only if we ran at least one step)
      if (steps > 0 && this.onDraw) {
        this.onDraw();
      }

      this._tick();
    });
  }
}
