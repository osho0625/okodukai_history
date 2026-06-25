// ごきぶりポーカー - CPU対戦
(function() {
'use strict';

// 8種の虫カード
const CREATURES = [
  { id: 'cockroach', emoji: '🪳', name: 'ゴキブリ' },
  { id: 'bat',       emoji: '🦇', name: 'コウモリ' },
  { id: 'stinkbug',  emoji: '🐛', name: 'カメムシ' },
  { id: 'scorpion',  emoji: '🦂', name: 'サソリ' },
  { id: 'fly',       emoji: '🪰', name: 'ハエ' },
  { id: 'spider',    emoji: '🕷️', name: 'クモ' },
  { id: 'frog',      emoji: '🐸', name: 'カエル' },
  { id: 'rat',       emoji: '🐀', name: 'ネズミ' }
];

const LOSE_COUNT = 4; // 同じカード4枚で負け

let myHand = [];
let cpuHand = [];
let myFaceUp = [];
let cpuFaceUp = [];
let selectedCard = null;
let gameActive = false;
let isPlayerTurn = false;

// --- 初期化 ---
function startGame() {
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';

  let deck = [];
  CREATURES.forEach(c => {
    for (let i = 0; i < 8; i++) deck.push(c.id);
  });
  shuffle(deck);

  myHand = deck.slice(0, 32);
  cpuHand = deck.slice(32, 64);
  myFaceUp = [];
  cpuFaceUp = [];
  selectedCard = null;
  gameActive = true;
  isPlayerTurn = false;

  renderAll();
  if (Math.random() < 0.5) {
    cpuTurn();
  } else {
    playerTurnStart();
  }
}
window.startGame = startGame;

function goTitle() {
  document.getElementById('titleScreen').style.display = 'block';
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
}
window.goTitle = goTitle;

// --- 表示更新 ---
function renderAll() {
  document.getElementById('myHandCount').textContent = myHand.length;
  document.getElementById('cpuHandCount').textContent = cpuHand.length;
  renderFaceUp('cpuFaceUp', cpuFaceUp);
  renderFaceUp('myFaceUp', myFaceUp);
  renderHand();
  updateHandInteractivity();
}

function renderFaceUp(elId, cards) {
  const el = document.getElementById(elId);
  // 種類ごとにカウントしてグループ表示
  const counts = {};
  cards.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  let html = '';
  CREATURES.forEach(c => {
    const n = counts[c.id] || 0;
    if (n === 0) return;
    const danger = n >= 3 ? ' danger' : '';
    html += `<div class="face-up-group${danger}">`;
    html += `<span class="face-up-emoji">${c.emoji}</span>`;
    html += `<span class="face-up-count">&times;${n}</span>`;
    html += '</div>';
  });
  el.innerHTML = html || '<span style="color:#555;font-size:0.8em;">なし</span>';
}

function renderHand() {
  const el = document.getElementById('myHand');
  const sorted = [...myHand].sort((a, b) => {
    return CREATURES.findIndex(c => c.id === a) - CREATURES.findIndex(c => c.id === b);
  });
  let html = '';
  sorted.forEach((id, i) => {
    const c = CREATURES.find(cr => cr.id === id);
    const sel = selectedCard === i ? ' selected' : '';
    html += `<div class="hand-card${sel}" data-idx="${i}" onclick="selectCard(${i})">${c.emoji}</div>`;
  });
  el.innerHTML = html;
  myHand = sorted;
}

// 手札のインタラクティブ状態を視覚的に更新
function updateHandInteractivity() {
  const handEl = document.getElementById('myHand');
  if (isPlayerTurn && gameActive) {
    handEl.classList.remove('disabled');
  } else {
    handEl.classList.add('disabled');
  }
}

function selectCard(idx) {
  if (!gameActive || !isPlayerTurn) return;
  selectedCard = (selectedCard === idx) ? null : idx;
  renderHand();
  updateHandInteractivity();
  if (selectedCard !== null) {
    showDeclareOptions();
  } else {
    document.getElementById('declareArea').style.display = 'none';
  }
}
window.selectCard = selectCard;

function showDeclareOptions() {
  const area = document.getElementById('declareArea');
  const btns = document.getElementById('declareBtns');
  area.style.display = 'block';
  let html = '';
  CREATURES.forEach(c => {
    html += `<div class="declare-btn" onclick="playerDeclare('${c.id}')">${c.emoji}<span class="declare-name">${c.name}</span></div>`;
  });
  btns.innerHTML = html;
}

// --- プレイヤーのターン ---
function playerTurnStart() {
  if (checkGameEnd()) return;
  if (myHand.length === 0) { endGame(false, '手札がなくなった…'); return; }
  isPlayerTurn = true;
  selectedCard = null;
  document.getElementById('declareArea').style.display = 'none';
  setMessage('<span class="turn-indicator">あなたの番</span><br>手札からカードを選んでタップ → 宣言する虫を選ぼう', '');
  renderAll();
}

function playerDeclare(declaredId) {
  if (selectedCard === null || !isPlayerTurn) return;
  isPlayerTurn = false;
  const actualId = myHand[selectedCard];
  const declared = CREATURES.find(c => c.id === declaredId);

  myHand.splice(selectedCard, 1);
  selectedCard = null;
  document.getElementById('declareArea').style.display = 'none';

  const isHonest = (declaredId === actualId);
  const cpuGuess = cpuDecideGuess(declaredId);

  renderAll();

  const declaredEmoji = declared.emoji;
  setMessage(`あなた「${declaredEmoji} ${declared.name}です」<br><span style="color:#aaa">CPUが考え中...</span>`, '');

  setTimeout(() => {
    if (!gameActive) return;
    const correct = (cpuGuess === 'true' && isHonest) || (cpuGuess === 'false' && !isHonest);
    const guessText = cpuGuess === 'true' ? 'ホント' : 'ウソ';

    if (correct) {
      myFaceUp.push(actualId);
      setMessage(
        `あなた「${declaredEmoji} ${declared.name}です」<br>CPU「<b>${guessText}</b>！」<br>→ <span class="result-bad">正解！ あなたの前に置かれた</span> 😱`,
        ''
      );
      renderAll();
      if (checkGameEnd()) return;
      setTimeout(() => { if (gameActive) playerTurnStart(); }, 2000);
    } else {
      cpuFaceUp.push(actualId);
      setMessage(
        `あなた「${declaredEmoji} ${declared.name}です」<br>CPU「<b>${guessText}</b>！」<br>→ <span class="result-good">はずれ！ CPUの前に置かれた</span> 😄`,
        ''
      );
      renderAll();
      if (checkGameEnd()) return;
      setTimeout(() => { if (gameActive) cpuTurn(); }, 2000);
    }
  }, 1000);
}
window.playerDeclare = playerDeclare;

// --- CPUのターン ---
function cpuTurn() {
  if (checkGameEnd()) return;
  if (cpuHand.length === 0) { endGame(true, 'CPUの手札がなくなった！'); return; }
  isPlayerTurn = false;
  updateHandInteractivity();

  const cardIdx = Math.floor(Math.random() * cpuHand.length);
  const actualId = cpuHand[cardIdx];
  cpuHand.splice(cardIdx, 1);

  // CPUの宣言ロジック: プレイヤーの前のカードを考慮
  let declaredId;
  if (Math.random() < 0.45) {
    declaredId = actualId; // ホント
  } else {
    // プレイヤーの前に多いカードを宣言（いやがらせ）する確率を上げる
    const myCountMap = countCards(myFaceUp);
    const dangerCards = CREATURES.filter(c => (myCountMap[c.id] || 0) >= 2 && c.id !== actualId);
    if (dangerCards.length > 0 && Math.random() < 0.4) {
      declaredId = dangerCards[Math.floor(Math.random() * dangerCards.length)].id;
    } else {
      const others = CREATURES.filter(c => c.id !== actualId);
      declaredId = others[Math.floor(Math.random() * others.length)].id;
    }
  }

  const declared = CREATURES.find(c => c.id === declaredId);
  const isHonest = (declaredId === actualId);

  renderAll();
  setMessage(`<span class="turn-indicator">CPUの番</span><br>CPUがカードを出した...<br>「これは ${declared.emoji}<b>${declared.name}</b> です」`, '');

  setTimeout(() => {
    if (!gameActive) return;
    setMessage(
      `<span class="turn-indicator">CPUの番</span><br>CPUが言った：「これは ${declared.emoji}<b>${declared.name}</b> です」<br><span style="color:#aaa;font-size:0.85em">ホント？ ウソ？</span>`,
      'judge'
    );
    showJudgeButtons(isHonest, actualId);
  }, 1200);
}

function showJudgeButtons(isHonest, actualId) {
  const btns = document.getElementById('choiceBtns');
  btns.innerHTML = `
    <button class="choice-btn true-btn" onclick="playerJudge(true, ${isHonest}, '${actualId}')">✅ ホント</button>
    <button class="choice-btn false-btn" onclick="playerJudge(false, ${isHonest}, '${actualId}')">❌ ウソ</button>
  `;
}

function playerJudge(guessTrue, isHonest, actualId) {
  if (!gameActive) return;
  document.getElementById('choiceBtns').innerHTML = '';
  const actual = CREATURES.find(c => c.id === actualId);
  const correct = (guessTrue === isHonest);

  if (correct) {
    cpuFaceUp.push(actualId);
    setMessage(
      `正体は ${actual.emoji}<b>${actual.name}</b>！<br>→ <span class="result-good">正解！ CPUの前に置かれた</span> 😄`,
      ''
    );
    renderAll();
    if (checkGameEnd()) return;
    setTimeout(() => { if (gameActive) cpuTurn(); }, 2000);
  } else {
    myFaceUp.push(actualId);
    setMessage(
      `正体は ${actual.emoji}<b>${actual.name}</b>！<br>→ <span class="result-bad">はずれ！ あなたの前に置かれた</span> 😱`,
      ''
    );
    renderAll();
    if (checkGameEnd()) return;
    setTimeout(() => { if (gameActive) playerTurnStart(); }, 2000);
  }
}
window.playerJudge = playerJudge;

// --- CPUの判定AI ---
function cpuDecideGuess(declaredId) {
  const declaredCount = cpuFaceUp.filter(id => id === declaredId).length;
  // 自分の前に3枚ある虫を宣言された→ウソだと思いたい
  if (declaredCount >= 3) {
    return Math.random() < 0.75 ? 'false' : 'true';
  }
  // 2枚ある場合もやや警戒
  if (declaredCount >= 2) {
    return Math.random() < 0.6 ? 'false' : 'true';
  }
  return Math.random() < 0.47 ? 'true' : 'false';
}

// --- ゲーム終了判定 ---
function checkGameEnd() {
  const myCounts = countCards(myFaceUp);
  for (const id in myCounts) {
    if (myCounts[id] >= LOSE_COUNT) {
      const c = CREATURES.find(cr => cr.id === id);
      endGame(false, `${c.emoji}${c.name}が4枚たまってしまった…`);
      return true;
    }
  }
  const cpuCounts = countCards(cpuFaceUp);
  for (const id in cpuCounts) {
    if (cpuCounts[id] >= LOSE_COUNT) {
      const c = CREATURES.find(cr => cr.id === id);
      endGame(true, `CPUに${c.emoji}${c.name}が4枚たまった！`);
      return true;
    }
  }
  return false;
}

function countCards(cards) {
  const counts = {};
  cards.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  return counts;
}

function endGame(playerWin, reason) {
  gameActive = false;
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'block';
  document.getElementById('resultTitle').textContent = playerWin ? '🎉 勝ち！' : '💀 負け…';
  document.getElementById('resultMsg').textContent = reason;
}

// --- UI ヘルパー ---
function setMessage(text, mode) {
  document.getElementById('messageText').innerHTML = text;
  if (mode !== 'judge') {
    document.getElementById('choiceBtns').innerHTML = '';
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 夜間制限チェック
if (typeof isNightTime === 'function' && isNightTime()) {
  document.querySelector('.container').innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="font-size:4em;margin-bottom:16px;">🌙</div><h2>今日はおしまい！</h2><p style="color:#aaa;margin-top:8px;">また明日ね</p></div>';
}

})();
