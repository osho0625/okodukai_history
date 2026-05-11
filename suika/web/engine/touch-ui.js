// touch-ui.js — Virtual analog stick + action buttons for mobile
// Creates DOM overlay elements and feeds input to the Input system

import { DIR } from './input.js';

const STICK_RADIUS = 50;
const STICK_DEAD_ZONE = 12;

export class TouchUI {
  constructor(input) {
    this.input = input;
    this.active = false;
    this.stickTouchId = null;
    this.stickOrigin = { x: 0, y: 0 };
    this.stickPos = { x: 0, y: 0 };

    // Only show on touch devices
    if (!this._isTouchDevice()) return;
    this.active = true;
    this._createDOM();
    this._setupStick();
    this._setupButtons();
  }

  _isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  _createDOM() {
    // Container
    const container = document.createElement('div');
    container.id = 'touch-controls';
    container.innerHTML = `
      <div class="touch-stick-area" id="touchStickArea">
        <div class="touch-stick-base" id="touchStickBase">
          <div class="touch-stick-knob" id="touchStickKnob"></div>
        </div>
      </div>
      <div class="touch-btn-area" id="touchBtnArea">
        <button class="touch-btn touch-btn-ok" id="touchBtnOK">A</button>
        <button class="touch-btn touch-btn-cancel" id="touchBtnCancel">B</button>
        <button class="touch-btn touch-btn-cam-l" id="touchBtnCamL">◀</button>
        <button class="touch-btn touch-btn-cam-r" id="touchBtnCamR">▶</button>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #touch-controls {
        position: fixed; bottom: 0; left: 0; right: 0;
        height: 180px; pointer-events: none; z-index: 1000;
        display: flex; justify-content: space-between; align-items: flex-end;
        padding: 0 12px 16px;
      }
      .touch-stick-area {
        width: 140px; height: 140px; position: relative;
        pointer-events: auto; touch-action: none;
      }
      .touch-stick-base {
        width: 110px; height: 110px; border-radius: 50%;
        background: rgba(255,255,255,0.08);
        border: 2px solid rgba(255,255,255,0.2);
        position: absolute; bottom: 10px; left: 10px;
        display: flex; align-items: center; justify-content: center;
      }
      .touch-stick-knob {
        width: 44px; height: 44px; border-radius: 50%;
        background: rgba(255,255,255,0.35);
        border: 2px solid rgba(255,255,255,0.5);
        position: absolute;
        transition: none;
      }
      .touch-btn-area {
        display: grid; grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 8px; pointer-events: auto; touch-action: none;
        width: 130px; height: 130px;
      }
      .touch-btn {
        width: 56px; height: 56px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.1);
        color: #fff; font-size: 14px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .touch-btn:active, .touch-btn.pressed {
        background: rgba(255,255,255,0.3);
        border-color: rgba(255,255,255,0.6);
      }
      .touch-btn-ok {
        background: rgba(76,175,80,0.25); border-color: rgba(76,175,80,0.5);
        grid-column: 2; grid-row: 1;
      }
      .touch-btn-cancel {
        background: rgba(244,67,54,0.2); border-color: rgba(244,67,54,0.4);
        grid-column: 1; grid-row: 1;
      }
      .touch-btn-cam-l {
        background: rgba(100,150,255,0.15); border-color: rgba(100,150,255,0.3);
        grid-column: 1; grid-row: 2; font-size: 18px;
      }
      .touch-btn-cam-r {
        background: rgba(100,150,255,0.15); border-color: rgba(100,150,255,0.3);
        grid-column: 2; grid-row: 2; font-size: 18px;
      }

      /* Hide keyboard info on touch devices */
      @media (pointer: coarse) {
        .info { display: none !important; }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.stickArea = document.getElementById('touchStickArea');
    this.stickBase = document.getElementById('touchStickBase');
    this.stickKnob = document.getElementById('touchStickKnob');
    this.btnOK = document.getElementById('touchBtnOK');
    this.btnCancel = document.getElementById('touchBtnCancel');
    this.btnCamL = document.getElementById('touchBtnCamL');
    this.btnCamR = document.getElementById('touchBtnCamR');
  }

  _setupStick() {
    const area = this.stickArea;

    area.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.stickTouchId = touch.identifier;
      const rect = this.stickBase.getBoundingClientRect();
      this.stickOrigin.x = rect.left + rect.width / 2;
      this.stickOrigin.y = rect.top + rect.height / 2;
      this._updateStick(touch.clientX, touch.clientY);
    }, { passive: false });

    area.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.stickTouchId) {
          this._updateStick(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    const endStick = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.stickTouchId) {
          this.stickTouchId = null;
          this.stickKnob.style.transform = 'translate(0px, 0px)';
          this.input.setTouchDirection(DIR.NONE);
        }
      }
    };
    area.addEventListener('touchend', endStick);
    area.addEventListener('touchcancel', endStick);
  }

  _updateStick(clientX, clientY) {
    let dx = clientX - this.stickOrigin.x;
    let dy = clientY - this.stickOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Clamp to radius
    if (dist > STICK_RADIUS) {
      dx = dx / dist * STICK_RADIUS;
      dy = dy / dist * STICK_RADIUS;
    }

    // Move knob visually
    this.stickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

    // Determine direction
    if (dist < STICK_DEAD_ZONE) {
      this.input.setTouchDirection(DIR.NONE);
      return;
    }

    const angle = Math.atan2(-dy, dx); // -dy because screen Y is inverted
    // Convert angle to 8 directions
    // 0=right, PI/2=up, PI=left, -PI/2=down
    const deg = ((angle * 180 / Math.PI) + 360) % 360;

    let dir;
    if (deg >= 337.5 || deg < 22.5) dir = DIR.RIGHT;
    else if (deg >= 22.5 && deg < 67.5) dir = DIR.UP_RIGHT;
    else if (deg >= 67.5 && deg < 112.5) dir = DIR.UP;
    else if (deg >= 112.5 && deg < 157.5) dir = DIR.UP_LEFT;
    else if (deg >= 157.5 && deg < 202.5) dir = DIR.LEFT;
    else if (deg >= 202.5 && deg < 247.5) dir = DIR.DOWN_LEFT;
    else if (deg >= 247.5 && deg < 292.5) dir = DIR.DOWN;
    else dir = DIR.DOWN_RIGHT;

    this.input.setTouchDirection(dir);
  }

  _setupButtons() {
    this._bindBtn(this.btnOK, 'ok');
    this._bindBtn(this.btnCancel, 'cancel');
    this._bindBtn(this.btnCamL, 'camL');
    this._bindBtn(this.btnCamR, 'camR');
  }

  _bindBtn(el, name) {
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      el.classList.add('pressed');
      this.input.setTouchButton(name, true);
    }, { passive: false });

    const release = (e) => {
      el.classList.remove('pressed');
      this.input.setTouchButton(name, false);
    };
    el.addEventListener('touchend', release);
    el.addEventListener('touchcancel', release);
  }
}
