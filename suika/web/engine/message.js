// message.js — Message window UI (ported from CMessWindow)

export class MessageWindow {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.text = '';
    this.resolve = null;
    this.displayedChars = 0;
    this.charSpeed = 1; // 1 char per frame (matching original)
    this.frameCount = 0;
    this.onAdvance = null;
  }

  // Show message and return a promise that resolves when player presses OK
  show(text) {
    this.text = text;
    this.visible = true;
    this.displayedChars = 0;
    this.frameCount = 0;
    this._closing = false;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  // Close the window (called by CLOSEW event command)
  close() {
    this.visible = false;
    this._closing = false;
  }

  // Call each frame
  update(inputOK) {
    if (!this.visible) return;
    this.frameCount++;

    // Advance text display
    if (this.displayedChars < this.text.length) {
      const prevChars = this.displayedChars;
      this.displayedChars = Math.min(this.text.length, this.displayedChars + this.charSpeed);
      // Play text advance SE every 2 characters (matching original tick rate)
      if (this.onAdvance && Math.floor(this.displayedChars / 2) > Math.floor(prevChars / 2)) {
        this.onAdvance();
      }
      // If player presses OK, show all text immediately
      if (inputOK) {
        this.displayedChars = this.text.length;
      }
    } else if (inputOK) {
      // Text fully displayed, player pressed OK → resolve (keep window visible for next message)
      if (this.resolve) {
        const r = this.resolve;
        this.resolve = null;
        r();
      }
    }
  }

  draw() {
    if (!this.visible) return;

    const ctx = this.ctx;
    const x = 8;
    const y = 228;
    const w = 384;
    const h = 84;

    // Window background
    ctx.fillStyle = 'rgba(0, 0, 80, 0.85)';
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';

    const displayText = this.text.substring(0, this.displayedChars);
    const lines = this._wrapText(displayText, w - 16);
    for (let i = 0; i < lines.length && i < 4; i++) {
      ctx.fillText(lines[i], x + 8, y + 20 + i * 18);
    }

    // Cursor (blinking triangle when text is complete)
    if (this.displayedChars >= this.text.length && (this.frameCount >> 2) & 1) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(x + w - 20, y + h - 16);
      ctx.lineTo(x + w - 14, y + h - 16);
      ctx.lineTo(x + w - 17, y + h - 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  _wrapText(text, maxWidth) {
    const lines = [];
    // Split on newline characters first
    const rawLines = text.split(/\n/);
    for (const raw of rawLines) {
      // Simple character-based wrapping (good for Japanese)
      const charsPerLine = Math.floor(maxWidth / 14);
      for (let i = 0; i < raw.length; i += charsPerLine) {
        lines.push(raw.substring(i, i + charsPerLine));
      }
      if (raw.length === 0) lines.push('');
    }
    return lines;
  }
}


export class ChoiceWindow {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.options = [];
    this.selected = 0;
    this.resolve = null;
  }

  show(opt1, opt2) {
    this.options = [opt1, opt2];
    this.selected = 0;
    this.visible = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  update(input) {
    if (!this.visible) return;
    if (input.isUp() || input.isLeft()) {
      this.selected = 0;
    }
    if (input.isDown() || input.isRight()) {
      this.selected = 1;
    }
    if (input.isOK()) {
      this.visible = false;
      if (this.resolve) {
        this.resolve(this.selected);
        this.resolve = null;
      }
    }
    if (input.isCancel()) {
      this.selected = 1;
      this.visible = false;
      if (this.resolve) {
        this.resolve(this.selected);
        this.resolve = null;
      }
    }
  }

  draw() {
    if (!this.visible) return;
    const ctx = this.ctx;
    const x = 16;
    const y = 16;
    const w = 100;
    const h = 52;

    ctx.fillStyle = 'rgba(0, 0, 80, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < this.options.length; i++) {
      ctx.fillStyle = i === this.selected ? '#ff0' : '#fff';
      const marker = i === this.selected ? '▶ ' : '  ';
      ctx.fillText(marker + this.options[i], x + 8, y + 20 + i * 22);
    }
  }
}
