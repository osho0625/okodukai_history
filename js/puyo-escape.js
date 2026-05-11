// --- puyo-escape.js: ぷよ消去時の逃走アニメーション（共通） ---
// 全ゲーム（ぷよ・テトリス・ブロックブラスト）で使用
//
// 4段階モーション:
//   1. 弾ける（burst）
//   2. 散らばって地面に落ちる（scatter）
//   3. 起き上がる（getup）
//   4. 走って画面端へ逃げる（run）
//
// 特殊モーション:
//   puyo_8 (colorIdx=7): 弾ける→散らばる→浮いて飛んでいく
//   puyo_9 (colorIdx=8): 弾ける→散らばる→ふよふよ浮遊して消える
//
// 必要CSS（各ページで定義）:
//   @keyframes puyoEscapeFly, @keyframes puyoEscapeGhost, @keyframes puyoEscapeWobble

/**
 * ぷよ逃走アニメーションを生成（4段階）
 * @param {number} startX - 開始X座標（fixed position）
 * @param {number} startY - 開始Y座標（fixed position）
 * @param {string} imgSrc - ぷよ画像のパス
 * @param {number} colorIdx - ぷよの色インデックス（0-8）
 * @param {object} options - { size: px, groundY: px }
 */
function spawnPuyoEscape(startX, startY, imgSrc, colorIdx, options) {
  const size = (options && options.size) || 28;
  const groundY = (options && options.groundY) || (window.innerHeight - 70 + Math.random() * 20);

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;pointer-events:none;z-index:30;border-radius:50%;'
    + 'width:' + size + 'px;height:' + size + 'px;'
    + 'left:' + startX + 'px;top:' + startY + 'px;';
  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
  el.appendChild(img);
  document.body.appendChild(el);

  // --- 1. 弾ける ---
  el.style.transition = 'transform 0.15s ease-out';
  el.style.transform = 'scale(1.3)';
  setTimeout(() => { el.style.transform = 'scale(0.7)'; }, 150);

  // --- 2. 散らばって地面に落ちる（300ms後） ---
  setTimeout(() => {
    const scatterX = startX + (Math.random() - 0.5) * 40;
    el.style.transition = 'top 0.3s ease-in, left 0.15s ease-out, transform 0.3s ease-in';
    el.style.top = groundY + 'px';
    el.style.left = scatterX + 'px';
    el.style.transform = 'rotate(' + (Math.random() * 60 - 30) + 'deg) scale(0.8)';
  }, 300);

  // --- 3 & 4: 特殊 or 通常 ---
  if (colorIdx === 7) {
    // puyo_8: 起き上がる→浮いて飛んでいく
    setTimeout(() => {
      el.style.transition = 'top 0.4s ease-out, transform 0.3s ease-out';
      el.style.transform = 'scale(1) rotate(0deg)';
      el.style.top = (groundY - 50 - Math.random() * 30) + 'px';
    }, 700);
    setTimeout(() => {
      const goLeft = Math.random() < 0.5;
      const targetX = goLeft ? -size : window.innerWidth + size;
      const dist = Math.abs(targetX - startX);
      const dur = dist / (95 + Math.random() * 30);
      img.style.animation = 'puyoEscapeFly 0.4s ease-in-out infinite';
      el.style.transition = 'left ' + dur + 's linear, top ' + dur + 's ease-in-out';
      el.style.left = targetX + 'px';
      el.style.top = (groundY - 70 - Math.random() * 20) + 'px';
      setTimeout(() => el.remove(), dur * 1000 + 100);
    }, 1100);
  } else if (colorIdx === 8) {
    // puyo_9: 起き上がる→ふよふよ浮遊して消える
    setTimeout(() => {
      el.style.transition = 'top 0.4s ease-out, transform 0.3s ease-out, opacity 0.3s';
      el.style.transform = 'scale(1) rotate(0deg)';
      el.style.top = (groundY - 20 - Math.random() * 15) + 'px';
      el.style.opacity = '0.85';
    }, 700);
    setTimeout(() => {
      const goLeft = Math.random() < 0.5;
      const targetX = goLeft ? -size : window.innerWidth + size;
      const dist = Math.abs(targetX - startX);
      const dur = dist / (45 + Math.random() * 15);
      img.style.animation = 'puyoEscapeGhost 1.2s ease-in-out infinite';
      el.style.transition = 'left ' + dur + 's linear, opacity ' + dur + 's';
      el.style.left = targetX + 'px';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), dur * 1000 + 100);
    }, 1100);
  } else {
    // 通常ぷよ: 起き上がる→走って逃げる
    setTimeout(() => {
      el.style.transition = 'transform 0.3s ease-out';
      el.style.transform = 'scale(1) rotate(0deg)';
    }, 700);
    setTimeout(() => {
      const goLeft = Math.random() < 0.5;
      const targetX = goLeft ? -size : window.innerWidth + size;
      const currentX = parseFloat(el.style.left);
      const dist = Math.abs(targetX - currentX);
      const dur = dist / (100 + Math.random() * 40);
      img.style.animation = 'puyoEscapeWobble 0.2s ease-in-out infinite';
      el.style.transition = 'left ' + dur + 's linear';
      el.style.left = targetX + 'px';
      setTimeout(() => el.remove(), dur * 1000 + 100);
    }, 1050);
  }
}

/**
 * 解放状況に応じたぷよ色数を取得（localStorage参照）
 * @returns {number} 使用可能なぷよ色数（5, 6, or 9）
 */
function getUnlockedPuyoColorCount() {
  if (localStorage.getItem('puyo_special_unlocked') === 'true') return 9;
  if (localStorage.getItem('puyo_hard_unlocked') === 'true') return 6;
  return 5;
}
