// credits.js — Staff roll / end credits (ported from CStaffRoll)

const STAFF_TEXT = [
  '',
  '',
  '',
  '　　　　　すいかが食べたい',
  '',
  '',
  '',
  '',
  '',
  'ゲームデザイン',
  '　　　　　　　　　　　　　　くろすけ',
  '',
  '',
  'プログラム',
  '　　　　　　　　　　　　　　くろすけ',
  '',
  '',
  'シナリオ',
  '　　　　　　　　　　　　　　くろすけ',
  '',
  '',
  'グラフィック',
  '　　　　　　　　　　　　　　くろすけ',
  '',
  '',
  'サウンド',
  '　　　　　　　　　　　　　　くろすけ',
  '',
  '',
  '',
  '',
  'HTML5移植',
  '　　　　　　　　　　　　　　Kiro AI',
  '',
  '',
  '',
  '',
  'スペシャルサンクス',
  '',
  '　　プレイしてくださったみなさま',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '２００２－２００８',
  '　　　　　　　　　　　きゃとみゅう',
  '',
  '',
  '',
  '',
  '　　　　　　　　　　　　　　ＦＩＮ',
  '',
  '',
];

export class Credits {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.frame = 0;
    this.resolve = null;
    this.stars = [];
    // Generate background stars
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * 400,
        y: Math.random() * 320,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  start() {
    this.active = true;
    this.frame = 0;
    return new Promise(resolve => { this.resolve = resolve; });
  }

  update(input) {
    if (!this.active) return;
    this.frame++;
    // End after scrolling completes or on OK press after 200 frames
    const totalFrames = STAFF_TEXT.length * 14 + 200;
    if (this.frame > totalFrames || (this.frame > 200 && input.isOK())) {
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
    if (f <= 20) brightness = f / 20;
    const totalFrames = STAFF_TEXT.length * 14 + 200;
    if (f >= totalFrames - 30) brightness = Math.max(0, (totalFrames - f) / 30);

    // Background: deep blue gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, '#000010');
    grad.addColorStop(0.5, '#000830');
    grad.addColorStop(1, '#000010');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 320);

    // Animated stars
    ctx.globalAlpha = brightness;
    for (const star of this.stars) {
      const twinkle = 0.4 + Math.sin(f * 0.05 + star.twinkle) * 0.4;
      ctx.fillStyle = `rgba(200,220,255,${twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, (star.y + f * star.speed) % 320, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Decorative side lines
    if (f > 20) {
      const lineAlpha = brightness * 0.3;
      ctx.strokeStyle = `rgba(100,150,255,${lineAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(30, 320);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(370, 0);
      ctx.lineTo(370, 320);
      ctx.stroke();
    }

    // Scrolling text
    const scrollY = 340 - f * 1.2;
    ctx.textAlign = 'left';

    for (let i = 0; i < STAFF_TEXT.length; i++) {
      const y = scrollY + i * 22;
      if (y < -30 || y > 350) continue;

      const text = STAFF_TEXT[i];
      if (!text) continue;

      // Determine if this is a title line (shorter, left-aligned) or credit line
      const isTitle = !text.startsWith('　');
      const fontSize = isTitle ? '14px' : '13px';
      ctx.font = `${fontSize} sans-serif`;

      // Fade text near edges
      let textAlpha = brightness;
      if (y < 30) textAlpha *= y / 30;
      if (y > 290) textAlpha *= (320 - y) / 30;
      if (textAlpha <= 0) continue;

      // Shadow
      ctx.fillStyle = `rgba(0,0,50,${textAlpha})`;
      ctx.fillText(text, 41, y + 1);

      // Main text with color
      if (isTitle) {
        ctx.fillStyle = `rgba(180,200,255,${textAlpha})`;
      } else {
        ctx.fillStyle = `rgba(255,255,255,${textAlpha})`;
      }
      ctx.fillText(text, 40, y);
    }

    ctx.globalAlpha = 1;

    // Skip hint
    if (f > 200) {
      ctx.fillStyle = 'rgba(150,150,150,0.4)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter でスキップ', 200, 312);
    }
  }
}
