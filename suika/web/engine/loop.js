// loop.js — Game loop (ported from MainFrame / DoFrame / WaitRepaint)

export class GameLoop {
  constructor(targetMs = 90) {
    this.targetMs = targetMs;  // ~11 FPS matching original
    this.running = false;
    this.frameCount = 0;
    this.onFrame = null;  // callback(dt)
    this._lastTime = 0;
    this._accumulator = 0;
    this._rafId = null;
  }

  start(onFrame) {
    this.onFrame = onFrame;
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

      // Fixed timestep: run logic at original game speed
      // Cap to prevent spiral of death (max 3 frames per rAF)
      let steps = 0;
      while (this._accumulator >= this.targetMs && steps < 3) {
        this._accumulator -= this.targetMs;
        if (this.onFrame) {
          this.onFrame(this.targetMs);
        }
        this.frameCount++;
        steps++;
      }
      // Discard excess accumulated time to prevent catch-up stutter
      if (this._accumulator > this.targetMs * 3) {
        this._accumulator = 0;
      }

      this._tick();
    });
  }
}
