// --- garden.js: ぷよ畑演出 ---
// 依存: incrementPuyoCount() はindex.htmlで定義

const PUYO_IMAGES = [
  'images/puyo_1.avif',
  'images/puyo_2.avif',
  'images/puyo_3.avif',
  'images/puyo_4.avif',
  'images/puyo_5.avif'
];

let gardenInitialized = false;
let puyoSprouts = [];
let puyoCount = 0;

// 植木鉢ボタン: クリック=5個追加、長押し=全部引き抜く
(function setupGardenBtn() {
  const btn = document.getElementById('gardenBtn');
  if (!btn) return;
  let pressTimer = null;
  let isLongPress = false;

  btn.addEventListener('mousedown', startPress);
  btn.addEventListener('touchstart', e => { e.preventDefault(); startPress(); });
  btn.addEventListener('mouseup', endPress);
  btn.addEventListener('touchend', endPress);
  btn.addEventListener('mouseleave', cancelPress);

  function startPress() {
    isLongPress = false;
    pressTimer = setTimeout(() => { isLongPress = true; pullAllPuyo(); }, 600);
  }
  function endPress() {
    clearTimeout(pressTimer);
    if (!isLongPress) addPuyoBatch();
  }
  function cancelPress() { clearTimeout(pressTimer); }
})();

function addPuyoBatch() {
  const garden = document.getElementById('puyoGarden');
  garden.style.display = 'block';
  gardenInitialized = true;
  for (let i = 0; i < 5; i++) {
    setTimeout(() => spawnSprout(), i * 150);
  }
}

function spawnSprout() {
  const garden = document.getElementById('puyoGarden');
  const src = PUYO_IMAGES[Math.floor(Math.random() * PUYO_IMAGES.length)];
  const x = Math.random() * (window.innerWidth - 50) + 5;

  const sprout = document.createElement('div');
  sprout.className = 'puyo-sprout';
  sprout.style.left = x + 'px';
  sprout.dataset.img = src;

  const leaf = document.createElement('div');
  leaf.className = 'sprout-leaf';
  leaf.textContent = '\u{1F331}';
  sprout.appendChild(leaf);
  garden.appendChild(sprout);
  puyoSprouts.push(sprout);
  puyoCount++;

  sprout.style.opacity = '0';
  sprout.style.transform = 'translateY(20px)';
  setTimeout(() => {
    sprout.style.transition = 'opacity 0.4s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    sprout.style.opacity = '1';
    sprout.style.transform = 'translateY(0)';
  }, 50);

  sprout.addEventListener('click', () => pullSinglePuyo(sprout, src));
}

function pullSinglePuyo(sprout, imgSrc) {
  if (sprout.dataset.pulled) return;
  sprout.dataset.pulled = 'true';
  doPullAnimation(sprout, imgSrc);
  incrementPuyoCount(imgSrc);
  puyoCount--;
  checkGardenClear();
}

function pullAllPuyo() {
  const alive = puyoSprouts.filter(s => !s.dataset.pulled);
  alive.forEach((sprout, i) => {
    setTimeout(() => {
      if (sprout.dataset.pulled) return;
      sprout.dataset.pulled = 'true';
      const imgSrc = sprout.dataset.img || '';
      doPullAnimation(sprout, imgSrc);
      incrementPuyoCount(imgSrc);
      puyoCount--;
      checkGardenClear();
    }, i * 120);
  });
}

// 種類ごとの歩く速度 (px/sec)
const PUYO_SPEED = {
  'puyo_1': 80,   // 赤: 普通
  'puyo_2': 60,   // 紫: 遅い
  'puyo_3': 110,  // 黄色: 早い
  'puyo_4': 80,   // 青: 普通
  'puyo_5': 70    // 白: ちょっと遅い
};

function doPullAnimation(sprout, imgSrc) {
  const rect = sprout.getBoundingClientRect();
  sprout.classList.add('pulled');

  for (let i = 0; i < 3; i++) {
    const poof = document.createElement('div');
    poof.className = 'dirt-poof';
    poof.textContent = '\u{1F4A8}';
    poof.style.left = (rect.left + Math.random() * 30 - 10) + 'px';
    poof.style.top = (rect.bottom - 20) + 'px';
    poof.style.position = 'fixed';
    poof.style.zIndex = '201';
    document.body.appendChild(poof);
    setTimeout(() => poof.remove(), 600);
  }

  setTimeout(() => {
    const fly = document.createElement('div');
    fly.className = 'puyo-fly';
    const flyImg = document.createElement('img');
    flyImg.src = imgSrc;
    fly.appendChild(flyImg);

    const startX = rect.left;
    const landY = window.innerHeight - 85;
    fly.style.left = startX + 'px';
    fly.style.top = landY + 'px';
    document.body.appendChild(fly);
    flyImg.style.animation = 'puyoJump 0.6s ease-out';

    // 種類から速度を取得
    const match = imgSrc.match(/puyo_\d/);
    const puyoKey = match ? match[0] : 'puyo_1';
    const walkSpeed = PUYO_SPEED[puyoKey] || 80;

    setTimeout(() => {
      const goLeft = Math.random() < 0.5;
      const targetX = goLeft ? -80 : window.innerWidth + 20;
      const distance = Math.abs(targetX - startX);
      const duration = distance / walkSpeed;

      flyImg.style.animation = 'puyoWalk 0.3s ease-in-out infinite';
      fly.style.transition = 'left ' + duration + 's linear';
      fly.style.left = targetX + 'px';

      // コケる処理（距離が長い＋速度が速いほど確率UP、最大20%）
      const distFactor = distance / window.innerWidth;
      const speedFactor = walkSpeed / 80; // 80を基準速度とする
      const tripChance = Math.min(0.10, 0.035 * distFactor * speedFactor);
      const willTrip = Math.random() < tripChance;
      if (willTrip) {
        const tripTime = (0.15 + Math.random() * 0.7) * duration * 1000;
        setTimeout(() => {
          // コケる
          fly.style.transition = 'none';
          const currentLeft = fly.getBoundingClientRect().left;
          fly.style.left = currentLeft + 'px';
          flyImg.style.animation = 'none';
          flyImg.style.transform = 'rotate(90deg) scale(0.9)';
          flyImg.style.transition = 'transform 0.2s';

          // 起き上がる
          setTimeout(() => {
            flyImg.style.transform = 'rotate(0deg) scale(1)';
            setTimeout(() => {
              // 駆け足で走る
              const remainDist = Math.abs((goLeft ? -80 : window.innerWidth + 20) - currentLeft);
              const sprintDuration = remainDist / (walkSpeed * 1.8);
              flyImg.style.animation = 'puyoWalk 0.15s ease-in-out infinite';
              fly.style.transition = 'left ' + sprintDuration + 's linear';
              fly.style.left = (goLeft ? -80 : window.innerWidth + 20) + 'px';

              setTimeout(() => {
                fly.style.opacity = '0';
                setTimeout(() => fly.remove(), 300);
              }, sprintDuration * 1000 - 300);
            }, 200);
          }, 800);
        }, tripTime);
      } else {
        setTimeout(() => {
          fly.style.opacity = '0';
          setTimeout(() => fly.remove(), 300);
        }, duration * 1000 - 300);
      }
    }, 650);
  }, 150);

  setTimeout(() => sprout.remove(), 800);
}

function checkGardenClear() {
  if (puyoCount <= 0) {
    puyoCount = 0;
    puyoSprouts = [];
  }
}
