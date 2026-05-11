// credits.js — Staff roll / end credits (ported from CStaffRoll)

const STAFF_TEXT = [
  '',
  '　　　　　すいかが食べたい',
  '',
  '',
  '',
  '',
  'ゲームデザイン　　　　　　　くろすけ',
  '',
  '',
  'プログラム　　　　　　　　　くろすけ',
  '',
  '',
  'シナリオ　　　　　　　　　　くろすけ',
  '',
  '',
  'グラフィック　　　　　　　　くろすけ',
  '',
  '',
  '',
  '',
  'スペシャルサンクス',
  '　　　　プレイしてくださったみなさま',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '２００２－２００８　　　きゃとみゅう',
];

export class Credits {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.frame = 0;
    this.resolve = null;
  }

  start() {
    this.active = true;
    this.frame = 0;
    return new Promise(resolve => { this.resolve = resolve; });
  }

  update(input) {
    if (!this.active) return;
    this.frame++;
    // End after 450 frames or on OK press after 200 frames
    if (this.frame > 450 || (this.frame > 200 && input.isOK())) {
      this.active = false;
      if (this.resolve) { this.resolve(); this.resolve = null; }
    }
  }

  draw() {
    if (!this.active) return;
    const ctx = this.ctx;
    const f = this.frame;

    // Fade in/out
    let brightness = 1;
    if (f <= 10) brightness = f / 10;
    else if (f >= 440) brightness = Math.max(0, (450 - f) / 10);

    // Background: dark with slight blue
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 400, 320);

    // Scrolling text
    const scrollY = 330 - f * 1.5;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';

    for (let i = 0; i < STAFF_TEXT.length; i++) {
      const y = scrollY + i * 20;
      if (y < -20 || y > 340) continue;

      const text = STAFF_TEXT[i];
      if (!text) continue;

      // Shadow
      const alpha = brightness;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillText(text, 21, y + 1);
      ctx.fillText(text, 19, y - 1);

      // Main text
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillText(text, 20, y);
    }

    // Decorative lines (matching original)
    if (f > 10 && f < 440) {
      const lineAlpha = brightness * 0.6;
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
      ctx.lineWidth = 1;
      const lineProgress = Math.min(1, (f - 10) / 30);
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.lineTo(50 + 300 * lineProgress, 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(350 - 300 * lineProgress, 300);
      ctx.lineTo(350, 300);
      ctx.stroke();
    }

    // Skip hint
    if (f > 200) {
      ctx.fillStyle = 'rgba(150,150,150,0.5)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter でスキップ', 200, 312);
    }
  }
}
