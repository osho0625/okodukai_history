// --- ゴキブリ演出 ---
let roachCount = 0;
let mouseX = -1000, mouseY = -1000;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  if (t) { mouseX = t.clientX; mouseY = t.clientY; }
});

function unleashRoaches() {
  const blocker = document.createElement('div');
  blocker.id = 'roachBlocker';
  blocker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:transparent;z-index:9998;';
  document.body.appendChild(blocker);

  roachCount = 15;

  setTimeout(() => {
    if (roachCount > 0) {
      const sprayBtn = document.createElement('div');
      sprayBtn.id = 'sprayBtn';
      sprayBtn.textContent = '\u{1F9F4}';
      sprayBtn.style.cssText = 'position:fixed;bottom:30px;right:24px;font-size:2.5em;z-index:10001;cursor:pointer;animation:sprayPulse 1.5s infinite;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3));';
      document.body.appendChild(sprayBtn);

      const style = document.createElement('style');
      style.id = 'sprayStyle';
      style.textContent = `
        @keyframes sprayPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes sprayMist1 { 0%{opacity:0;transform:scale(0.3)} 20%{opacity:0.6} 100%{opacity:0;transform:scale(5)} }
        @keyframes sprayMist2 { 0%{opacity:0;transform:scale(0.2)} 30%{opacity:0.4} 100%{opacity:0;transform:scale(4)} }
        @keyframes sprayHiss { 0%{opacity:0} 10%{opacity:0.15} 100%{opacity:0} }
      `;
      document.head.appendChild(style);

      sprayBtn.addEventListener('click', () => {
        sprayBtn.style.pointerEvents = 'none';
        sprayBtn.style.animation = 'none';
        sprayBtn.style.opacity = '0.5';

        const mist1 = document.createElement('div');
        mist1.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(255,255,255,0.6) 0%,rgba(200,230,200,0.3) 30%,transparent 60%);z-index:10002;pointer-events:none;animation:sprayMist1 5s ease-out forwards;';
        document.body.appendChild(mist1);

        setTimeout(() => {
          const mist2 = document.createElement('div');
          mist2.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(150,220,150,0.4) 0%,rgba(150,200,150,0.15) 40%,transparent 65%);z-index:10002;pointer-events:none;animation:sprayMist2 4s ease-out forwards;';
          document.body.appendChild(mist2);
          setTimeout(() => mist2.remove(), 4000);
        }, 500);

        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:10003;pointer-events:none;animation:sprayHiss 1.5s ease-out forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1500);
        setTimeout(() => mist1.remove(), 5000);

        const roaches = Array.from(document.querySelectorAll('[data-roach]'));
        roaches.sort((a, b) => parseFloat(a.dataset.size) - parseFloat(b.dataset.size));
        roaches.forEach((r, i) => {
          setTimeout(() => {
            const aid = parseInt(r.dataset.animid);
            if (aid) cancelAnimationFrame(aid);
            r.style.pointerEvents = 'none';
            r.style.transition = 'transform 0.3s';
            r.style.transform += ' rotate(90deg)';
            setTimeout(() => {
              r.style.transform += ' rotate(180deg)';
              setTimeout(() => {
                r.textContent = '\u{1F480}';
                r.style.opacity = '0.5';
                r.style.transform += ' scale(0.6)';
                setTimeout(() => r.remove(), 500);
              }, 300);
            }, 300);
          }, i * 300);
        });

        setTimeout(() => {
          roachCount = 0;
          const bl = document.getElementById('roachBlocker');
          if (bl) bl.remove();
          adminFailCount = 0;
          sprayBtn.remove();
          const s = document.getElementById('sprayStyle');
          if (s) s.remove();
        }, roaches.length * 300 + 1000);
      });
    }
  }, 30000);

  for (let i = 0; i < 5; i++) setTimeout(() => spawnRoach('normal'), i * 400);
  for (let i = 0; i < 3; i++) setTimeout(() => spawnRoach('shy'), 2000 + i * 500);
  for (let i = 0; i < 2; i++) setTimeout(() => spawnRoach('big'), 3500 + i * 600);
  for (let i = 0; i < 2; i++) setTimeout(() => spawnRoach('huge'), 5000 + i * 800);
  for (let i = 0; i < 3; i++) setTimeout(() => spawnRoach('fast'), 6500 + i * 400);
}

function roachCleared() {
  roachCount--;
  if (roachCount <= 0) {
    const bl = document.getElementById('roachBlocker');
    if (bl) bl.remove();
    adminFailCount = 0;
  }
}
