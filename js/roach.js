// --- roach.js: ゴキブリ演出 ---
// 依存: adminFailCount, incrementRoachCount() (index.html)

let roachCount = 0;
let mouseX = -1000, mouseY = -1000;

document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  if (t) { mouseX = t.clientX; mouseY = t.clientY; }
});

// --- メイン: ゴキブリ発生 ---
function unleashRoaches() {
  // 操作ブロッカー
  const blocker = document.createElement('div');
  blocker.id = 'roachBlocker';
  blocker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:transparent;z-index:9998;';
  document.body.appendChild(blocker);
  roachCount = 15;

  // 30秒後にスプレー出現
  setTimeout(showSpray, 30000);

  // 種類別にスポーン
  const spawns = [
    { type: 'normal', count: 5, startDelay: 0, interval: 400 },
    { type: 'shy',    count: 3, startDelay: 2000, interval: 500 },
    { type: 'big',    count: 2, startDelay: 3500, interval: 600 },
    { type: 'huge',   count: 2, startDelay: 5000, interval: 800 },
    { type: 'fast',   count: 3, startDelay: 6500, interval: 400 },
  ];
  spawns.forEach(s => {
    for (let i = 0; i < s.count; i++) {
      setTimeout(() => spawnRoach(s.type), s.startDelay + i * s.interval);
    }
  });
}

// --- スプレー ---
function showSpray() {
  if (roachCount <= 0) return;

  const sprayBtn = document.createElement('div');
  sprayBtn.id = 'sprayBtn';
  sprayBtn.textContent = '\u{1F9F4}';
  sprayBtn.style.cssText = 'position:fixed;bottom:30px;right:24px;font-size:2.5em;z-index:10001;cursor:pointer;animation:sprayPulse 1.5s infinite;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3));';
  document.body.appendChild(sprayBtn);

  const style = document.createElement('style');
  style.id = 'sprayStyle';
  style.textContent = `
    @keyframes sprayPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
    @keyframes sprayMist1 { 0%{opacity:0;transform:scale(.3)} 20%{opacity:.6} 100%{opacity:0;transform:scale(5)} }
    @keyframes sprayMist2 { 0%{opacity:0;transform:scale(.2)} 30%{opacity:.4} 100%{opacity:0;transform:scale(4)} }
    @keyframes sprayHiss { 0%{opacity:0} 10%{opacity:.15} 100%{opacity:0} }
  `;
  document.head.appendChild(style);

  sprayBtn.addEventListener('click', () => useSpray(sprayBtn));
}

function useSpray(sprayBtn) {
  sprayBtn.style.pointerEvents = 'none';
  sprayBtn.style.animation = 'none';
  sprayBtn.style.opacity = '0.5';

  // ミストエフェクト
  createMistEffect('rgba(255,255,255,.6)', 'rgba(200,230,200,.3)', 'sprayMist1', 5000);
  setTimeout(() => {
    createMistEffect('rgba(150,220,150,.4)', 'rgba(150,200,150,.15)', 'sprayMist2', 4000);
  }, 500);

  // フラッシュ
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:10003;pointer-events:none;animation:sprayHiss 1.5s ease-out forwards;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1500);

  // 全ゴキブリを順番に倒す
  const roaches = Array.from(document.querySelectorAll('[data-roach]'));
  roaches.sort((a, b) => parseFloat(a.dataset.size) - parseFloat(b.dataset.size));

  roaches.forEach((r, i) => {
    setTimeout(() => killRoachWithSpray(r), i * 300);
  });

  // クリーンアップ
  setTimeout(() => {
    roachCount = 0;
    removeElement('roachBlocker');
    removeElement('sprayBtn');
    removeElement('sprayStyle');
    adminFailCount = 0;
  }, roaches.length * 300 + 1000);
}

function createMistEffect(color1, color2, animation, duration) {
  const mist = document.createElement('div');
  mist.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,${color1} 0%,${color2} 30%,transparent 60%);z-index:10002;pointer-events:none;animation:${animation} ${duration/1000}s ease-out forwards;`;
  document.body.appendChild(mist);
  setTimeout(() => mist.remove(), duration);
}

function killRoachWithSpray(r) {
  const aid = parseInt(r.dataset.animid);
  if (aid) cancelAnimationFrame(aid);
  r.style.pointerEvents = 'none';
  r.style.transition = 'transform 0.3s';
  r.style.transform += ' rotate(90deg)';
  incrementRoachCount();
  setTimeout(() => {
    r.style.transform += ' rotate(180deg)';
    setTimeout(() => {
      r.textContent = '\u{1F480}';
      r.style.opacity = '0.5';
      r.style.transform += ' scale(0.6)';
      setTimeout(() => r.remove(), 500);
    }, 300);
  }, 300);
}

// --- ゴキブリ退治カウント ---
function roachCleared() {
  roachCount--;
  if (roachCount <= 0) {
    removeElement('roachBlocker');
    adminFailCount = 0;
  }
}

// --- ゴキブリ個体生成 ---
const ROACH_TYPES = {
  normal: { sizeMin: 28, sizeMax: 48, baseMin: 3, baseMax: 5, burstMin: 7, burstMax: 12, shyness: 0 },
  big:    { sizeMin: 50, sizeMax: 65, baseMin: 2, baseMax: 3.5, burstMin: 5, burstMax: 8, shyness: 0 },
  huge:   { sizeMin: 70, sizeMax: 90, baseMin: 1.5, baseMax: 2.5, burstMin: 3, burstMax: 5, shyness: 0 },
  fast:   { sizeMin: 24, sizeMax: 34, baseMin: 5, baseMax: 8, burstMin: 10, burstMax: 15, shyness: 0 },
  shy:    { sizeMin: 30, sizeMax: 42, baseMin: 3, baseMax: 5, burstMin: 9, burstMax: 13, shyness: 150 },
};

function randRange(min, max) { return min + Math.random() * (max - min); }

function spawnRoach(type) {
  const cfg = ROACH_TYPES[type] || ROACH_TYPES.normal;
  const size = randRange(cfg.sizeMin, cfg.sizeMax);
  const baseSpeed = randRange(cfg.baseMin, cfg.baseMax);
  const burstSpeed = randRange(cfg.burstMin, cfg.burstMax);
  const shyness = cfg.shyness;

  const r = document.createElement('div');
  r.textContent = '\u{1FAB3}';
  r.setAttribute('data-roach', 'true');
  r.setAttribute('data-size', size);

  let x = Math.random() * (window.innerWidth - 60);
  let y = Math.random() * (window.innerHeight - 60);
  let angle = Math.random() * 360;
  let speed = 0, targetSpeed = baseSpeed, targetAngle = angle;
  let state = 'run', stateTimer = randRange(30, 90);

  r.style.cssText = `position:fixed;font-size:${size}px;z-index:10000;pointer-events:auto;cursor:pointer;user-select:none;left:${x}px;top:${y}px;transform:rotate(${angle}deg);filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));transition:none;`;
  document.body.appendChild(r);

  let animId;
  function tick() {
    stateTimer--;

    // shy: マウスから逃げる
    if (shyness > 0) {
      const dx = x - mouseX, dy = y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) < shyness) {
        targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        targetSpeed = burstSpeed;
        state = 'burst';
        stateTimer = 20;
      }
    }

    // 状態遷移
    if (stateTimer <= 0) {
      const roll = Math.random();
      if (roll < 0.12)      { state = 'pause';  stateTimer = randRange(15, 50); targetSpeed = 0; }
      else if (roll < 0.30) { state = 'burst';  stateTimer = randRange(15, 40); targetAngle += randRange(-70, 70); targetSpeed = burstSpeed; }
      else if (roll < 0.50) { state = 'wander'; stateTimer = randRange(40, 120); targetSpeed = baseSpeed * 0.4; }
      else                  { state = 'run';    stateTimer = randRange(30, 90); targetAngle += randRange(-40, 40); targetSpeed = baseSpeed; }
    }

    // 微調整
    const jitter = state === 'wander' ? 8 : state === 'burst' ? 6 : 4;
    targetAngle += randRange(-jitter/2, jitter/2);

    speed += (targetSpeed - speed) * 0.1;

    let diff = targetAngle - angle;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    angle += diff * 0.12;

    const wobble = Math.sin(Date.now() * 0.03) * (speed > 1 ? 2 : 0);
    const rad = angle * Math.PI / 180;
    x += Math.cos(rad) * speed;
    y += Math.sin(rad) * speed;

    // 壁バウンド
    if (x < 5 || x > window.innerWidth - 45) {
      targetAngle = 180 - targetAngle + randRange(-20, 20);
      x = Math.max(5, Math.min(window.innerWidth - 45, x));
      state = 'burst'; stateTimer = 15; targetSpeed = burstSpeed;
    }
    if (y < 5 || y > window.innerHeight - 45) {
      targetAngle = -targetAngle + randRange(-20, 20);
      y = Math.max(5, Math.min(window.innerHeight - 45, y));
      state = 'burst'; stateTimer = 15; targetSpeed = burstSpeed;
    }

    const breathe = 1 + Math.sin(Date.now() * 0.005) * 0.03;
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.transform = `rotate(${angle + 90 + wobble}deg) scale(${breathe})`;
    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);
  r.dataset.animid = animId;

  // クリックで退治
  r.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    r.style.pointerEvents = 'none';
    r.textContent = '\u{1F480}';
    r.style.transform = `rotate(${angle}deg) scale(1.2)`;
    r.style.filter = 'none';
    r.style.opacity = '0.6';
    setTimeout(() => {
      r.remove();
      incrementRoachCount();
      roachCleared();
      if (roachCount <= 0) {
        removeElement('sprayBtn');
        removeElement('sprayStyle');
      }
    }, 600);
  });
}

// --- ユーティリティ ---
function removeElement(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
