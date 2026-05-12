// input.js — Input handler (ported from CGameApp key/mouse handling)
// Supports keyboard, mouse, and touch (virtual stick + buttons)

export const KEY = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  SPACE: ' ',
  Z: 'z',
  X: 'x',
  C: 'c',
  ESCAPE: 'Escape',
};

// Direction constants matching Java GetKeybordVect()
export const DIR = {
  NONE: -1,
  UP: 0,
  UP_RIGHT: 1,
  RIGHT: 2,
  DOWN_RIGHT: 3,
  DOWN: 4,
  DOWN_LEFT: 5,
  LEFT: 6,
  UP_LEFT: 7,
};

export class Input {
  constructor(canvas) {
    this.keys = {};
    this.keyDown = {};    // true only on first frame
    this.prevKeys = {};

    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseLeft = false;
    this.mouseRight = false;
    this.mouseLeftDown = false;  // single frame
    this.mouseRightDown = false;

    // Touch virtual stick state
    this.touchDir = DIR.NONE;
    this.touchButtons = {};     // held state
    this.touchButtonDown = {};  // edge-triggered (single frame)
    this._prevTouchButtons = {};

    this._setupKeyboard();
    this._setupMouse(canvas);
  }

  _setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  _setupMouse(canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseLeft = true;
      if (e.button === 2) this.mouseRight = true;
      e.preventDefault();
    });
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseLeft = false;
      if (e.button === 2) this.mouseRight = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Called by external touch UI to set virtual stick direction
  setTouchDirection(dir) {
    this.touchDir = dir;
  }

  // Called by external touch UI for button press (edge-triggered)
  setTouchButton(name, pressed) {
    this.touchButtons[name] = pressed;
  }

  // Call once per frame to update edge-triggered states
  update() {
    this.keyDown = {};
    for (const key in this.keys) {
      if (this.keys[key] && !this.prevKeys[key]) {
        this.keyDown[key] = true;
      }
    }
    this.mouseLeftDown = this.mouseLeft && !this._prevMouseLeft;
    this.mouseRightDown = this.mouseRight && !this._prevMouseRight;

    // Touch button edge detection
    this.touchButtonDown = {};
    for (const btn in this.touchButtons) {
      if (this.touchButtons[btn] && !this._prevTouchButtons[btn]) {
        this.touchButtonDown[btn] = true;
      }
    }

    // Touch direction edge detection (fires once when stick moves to a new direction)
    // Also fires on repeat interval when held
    this._touchDirDown = DIR.NONE;
    if (this.touchDir !== DIR.NONE) {
      if (this.touchDir !== this._prevTouchDir) {
        // New direction
        this._touchDirDown = this.touchDir;
        this._touchDirRepeat = 0;
        this._touchDirHoldFrames = 0;
      } else {
        // Same direction held — repeat after delay
        this._touchDirHoldFrames = (this._touchDirHoldFrames || 0) + 1;
        if (this._touchDirHoldFrames > 8) { // initial delay: 8 frames
          this._touchDirRepeat = (this._touchDirRepeat || 0) + 1;
          if (this._touchDirRepeat >= 4) { // repeat every 4 frames
            this._touchDirDown = this.touchDir;
            this._touchDirRepeat = 0;
          }
        }
      }
    } else {
      this._touchDirHoldFrames = 0;
      this._touchDirRepeat = 0;
    }

    this.prevKeys = { ...this.keys };
    this._prevMouseLeft = this.mouseLeft;
    this._prevMouseRight = this.mouseRight;
    this._prevTouchButtons = { ...this.touchButtons };
    this._prevTouchDir = this.touchDir;
  }

  isKey(key) { return !!this.keys[key.toLowerCase()]; }
  isKeyDown(key) { return !!this.keyDown[key.toLowerCase()]; }

  isOK() {
    return this.isKeyDown('enter') || this.isKeyDown(' ') || this.mouseLeftDown || !!this.touchButtonDown['ok'];
  }

  isCancel() {
    return this.isKeyDown('x') || this.isKeyDown('escape') || this.mouseRightDown || !!this.touchButtonDown['cancel'];
  }

  // Direction edge-triggered with repeat (works with both keyboard and touch stick)
  isUp() {
    return this._isDirEdge('arrowup') || this._touchDirDown === DIR.UP || this._touchDirDown === DIR.UP_LEFT || this._touchDirDown === DIR.UP_RIGHT;
  }
  isDown() {
    return this._isDirEdge('arrowdown') || this._touchDirDown === DIR.DOWN || this._touchDirDown === DIR.DOWN_LEFT || this._touchDirDown === DIR.DOWN_RIGHT;
  }
  isLeft() {
    return this._isDirEdge('arrowleft') || this._touchDirDown === DIR.LEFT || this._touchDirDown === DIR.UP_LEFT || this._touchDirDown === DIR.DOWN_LEFT;
  }
  isRight() {
    return this._isDirEdge('arrowright') || this._touchDirDown === DIR.RIGHT || this._touchDirDown === DIR.UP_RIGHT || this._touchDirDown === DIR.DOWN_RIGHT;
  }

  // Key edge with repeat (initial delay then repeat)
  _isDirEdge(key) {
    const k = key.toLowerCase();
    if (this.keyDown[k]) {
      this._keyHold = this._keyHold || {};
      this._keyHold[k] = 0;
      return true;
    }
    if (this.keys[k]) {
      this._keyHold = this._keyHold || {};
      this._keyHold[k] = (this._keyHold[k] || 0) + 1;
      if (this._keyHold[k] > 10 && this._keyHold[k] % 3 === 0) return true;
    } else {
      if (this._keyHold) this._keyHold[k] = 0;
    }
    return false;
  }

  // Get 8-direction from arrow keys or virtual stick
  getDirection() {
    // Virtual stick takes priority if active
    if (this.touchDir !== DIR.NONE) return this.touchDir;

    const u = this.isKey('arrowup');
    const d = this.isKey('arrowdown');
    const l = this.isKey('arrowleft');
    const r = this.isKey('arrowright');

    if (u && !d && !l && !r) return DIR.UP;
    if (u && !d && !l && r) return DIR.UP_RIGHT;
    if (!u && !d && !l && r) return DIR.RIGHT;
    if (!u && d && !l && r) return DIR.DOWN_RIGHT;
    if (!u && d && !l && !r) return DIR.DOWN;
    if (!u && d && l && !r) return DIR.DOWN_LEFT;
    if (!u && !d && l && !r) return DIR.LEFT;
    if (u && !d && l && !r) return DIR.UP_LEFT;
    return DIR.NONE;
  }

  clear() {
    this.keys = {};
    this.keyDown = {};
    this.prevKeys = {};
    this.mouseLeft = false;
    this.mouseRight = false;
    this.touchDir = DIR.NONE;
    this.touchButtons = {};
    this.touchButtonDown = {};
    this._prevTouchButtons = {};
  }
}
