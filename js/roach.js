// --- roach.js: ゴキブリ演出 ---
// 依存: adminFailCount, incrementRoachCount() はindex.htmlで定義

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
    if (roachCount <= 0) return;
    const sprayBtn = document.createElement('div');
    sprayBtn.id = 'sprayBtn';
    sprayBtn.textContent = '\u{1F9F4}';
    sprayBtn.style.cssText = 'position:fixed;bottom:30px;right:24px;font-size:2.5em;z-index:10001;cursor:pointer;animation:sprayPulse 1.5s infinite;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3));';
    document.body.appendChild(sprayBtn);

    const style = document.createElement('style');
    style.id = 'sprayStyle';
    style.textContent = `
      @keyframes sprayPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
      @keyframes sprayMist1{0%{opacity:0;transform:scale(.3)}20%{opacity:.6}100%{opacity:0;transform:scale(5)}}
      @keyframes sprayMist2{0%{opacity:0;transform:scale(.2)}30%{opacity:.4}100%{opacity:0;transform:scale(4)}}
      @keyframes sprayHiss{0%{opacity:0}10%{opacity:.15}100%{opacity:0}}`;
    document.head.appendChild(style);

    sprayBtn.addEventListener('click', () => {
      sprayBtn.style.pointerEvents = 'none';
      sprayBtn.style.animation = 'none';
      sprayBtn.style.opacity = '0.5';

      const mist1 = document.createElement('div');
      mist1.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(255,255,255,.6) 0%,rgba(200,230,200,.3) 30%,transparent 60%);z-index:10002;pointer-events:none;animation:sprayMist1 5s ease-out forwards;';
      document.body.appendChild(mist1);
      setTimeout(() => {
        const mist2 = document.createElement('div');
        mist2.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(150,220,150,.4) 0%,rgba(150,200,150,.15) 40%,transparent 65%);z-index:10002;pointer-events:none;animation:sprayMist2 4s ease-out forwards;';
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
        }, i * 300);
      });
      setTimeout(() => {
        roachCount = 0;
        const bl = document.getElementById('roachBlocker'); if (bl) bl.remove();
        adminFailCount = 0;
        sprayBtn.remove();
        const s = document.getElementById('sprayStyle'); if (s) s.remove();
      }, roaches.length * 300 + 1000);
    });
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
    const bl = document.getElementById('roachBlocker'); if (bl) bl.remove();
    adminFailCount = 0;
  }
}

function spawnRoach(type) {
  type = type || 'normal';
  const r = document.createElement('div');
  r.textContent = '\u{1FAB3}';
  let size, baseSpeed, burstSpeed, shyness;
  switch (type) {
    case 'big': size=50+Math.random()*15; baseSpeed=2+Math.random()*1.5; burstSpeed=5+Math.random()*3; shyness=0; break;
    case 'huge': size=70+Math.random()*20; baseSpeed=1.5+Math.random(); burstSpeed=3+Math.random()*2; shyness=0; break;
    case 'fast': size=24+Math.random()*10; baseSpeed=5+Math.random()*3; burstSpeed=10+Math.random()*5; shyness=0; break;
    case 'shy': size=30+Math.random()*12; baseSpeed=3+Math.random()*2; burstSpeed=9+Math.random()*4; shyness=150; break;
    default: size=28+Math.random()*20; baseSpeed=3+Math.random()*2; burstSpeed=7+Math.random()*5; shyness=0;
  }
  let x=Math.random()*(window.innerWidth-60), y=Math.random()*(window.innerHeight-60);
  let angle=Math.random()*360, speed=0, targetSpeed=baseSpeed, targetAngle=angle;
  let state='run', stateTimer=30+Math.random()*60, wobble=0;

  r.setAttribute('data-roach','true');
  r.setAttribute('data-size',size);
  r.style.cssText=`position:fixed;font-size:${size}px;z-index:10000;pointer-events:auto;cursor:pointer;user-select:none;left:${x}px;top:${y}px;transform:rotate(${angle}deg);filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));transition:none;`;
  document.body.appendChild(r);
  let animId;

  function tick() {
    stateTimer--;
    if (shyness > 0) {
      const dx=x-mouseX, dy=y-mouseY, dist=Math.sqrt(dx*dx+dy*dy);
      if (dist < shyness) { targetAngle=Math.atan2(dy,dx)*180/Math.PI; targetSpeed=burstSpeed; state='burst'; stateTimer=20; }
    }
    if (stateTimer <= 0) {
      const roll=Math.random();
      if (roll<.12) { state='pause'; stateTimer=15+Math.random()*35; targetSpeed=0; }
      else if (roll<.30) { state='burst'; stateTimer=15+Math.random()*25; targetAngle+=(Math.random()-.5)*140; targetSpeed=burstSpeed; }
      else if (roll<.50) { state='wander'; stateTimer=40+Math.random()*80; targetSpeed=baseSpeed*.4; }
      else { state='run'; stateTimer=30+Math.random()*60; targetAngle+=(Math.random()-.5)*80; targetSpeed=baseSpeed; }
    }
    if (state==='wander') targetAngle+=(Math.random()-.5)*8;
    else if (state==='run') targetAngle+=(Math.random()-.5)*4;
    else if (state==='burst') targetAngle+=(Math.random()-.5)*6;

    speed+=(targetSpeed-speed)*.1;
    let diff=targetAngle-angle;
    while(diff>180) diff-=360; while(diff<-180) diff+=360;
    angle+=diff*.12;
    wobble=Math.sin(Date.now()*.03)*(speed>1?2:0);
    const rad=angle*Math.PI/180;
    x+=Math.cos(rad)*speed; y+=Math.sin(rad)*speed;

    if(x<5||x>window.innerWidth-45){targetAngle=180-targetAngle+(Math.random()-.5)*40;x=Math.max(5,Math.min(window.innerWidth-45,x));state='burst';stateTimer=15;targetSpeed=burstSpeed;}
    if(y<5||y>window.innerHeight-45){targetAngle=-targetAngle+(Math.random()-.5)*40;y=Math.max(5,Math.min(window.innerHeight-45,y));state='burst';stateTimer=15;targetSpeed=burstSpeed;}

    const breathe=1+Math.sin(Date.now()*.005)*.03;
    r.style.left=x+'px'; r.style.top=y+'px';
    r.style.transform=`rotate(${angle+90+wobble}deg) scale(${breathe})`;
    animId=requestAnimationFrame(tick);
  }
  animId=requestAnimationFrame(tick);
  r.dataset.animid=animId;

  r.addEventListener('click',()=>{
    cancelAnimationFrame(animId);
    r.style.pointerEvents='none';
    r.textContent='\u{1F480}';
    r.style.transform=`rotate(${angle}deg) scale(1.2)`;
    r.style.filter='none'; r.style.opacity='0.6';
    setTimeout(()=>{
      r.remove();
      incrementRoachCount();
      roachCleared();
      if(roachCount<=0){
        const sb=document.getElementById('sprayBtn'),ss=document.getElementById('sprayStyle');
        if(sb)sb.remove(); if(ss)ss.remove();
      }
    },600);
  });
}
