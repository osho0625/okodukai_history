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
let myFaceUp = []; // プレイヤーの前に表向きで置かれたカード
let cpuFaceUp = []; // CPUの前に表向きで置かれたカード
let selectedCard = null;
let gameActive = false;

// --- 初期化 ---
function startGame() {
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';

  // デッキ作成 & シャッフル
  let deck = [];
  CREATURES.forEach(c => {
    for (let i = 0; i < 8; i++) deck.push(c.id);
  });
  shuffle(deck);

  // 配布（各32枚）
  myHand = deck.slice(0, 32);
  cpuHand = deck.slice(32, 64);
  myFaceUp = [];
  cpuFaceUp = [];
  selectedCard = null;
  gameActive = true;

  renderAll();
  // ランダムに先攻を決める
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
  document.getElementById('deckCount').textContent = '—';
  renderFaceUp('cpuFaceUp', cpuFaceUp);
  renderFaceUp('myFaceUp', myFaceUp);
  renderHand();
}

function renderFaceUp(elId, cards) {
  const el = document.getElementById(elId);
  // カードを種類ごとにグループ化
  const counts = {};
  cards.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  let html = '';
  CREATURES.forEach(c => {
    const n = counts[c.id] || 0;
    for (let i = 0; i < n; i++) {
      html += `<div class="face-up-card">${c.emoji}</div>`;
    }
  });
  el.innerHTML = html || '<span style="color:#555;font-size:0.8em;">なし</span>';
}

function renderHand() {
  const el = document.getElementById('myHand');
  // 手札をソートして表示
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
  // sortedと実際の手札を同期
  myHand = sorted;
}

function selectCard(idx) {
  if (!gameActive) return;
  const phase = document.getElementById('declareArea').style.display;
  // プレイヤーの番でのみ選択可能
  if (document.getElementById('declareArea').parentElement.querySelector('.zone-title')?.textContent === '') return;
  selectedCard = (selectedCard === idx) ? null : idx;
  renderHand();
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
    html += `<div class="declare-btn" onclick="playerDeclare('${c.id}')">${c.emoji}</div>`;
  });
  btns.innerHTML = html;
}

// --- プレイヤーのターン ---
function playerTurnStart() {
  if (checkGameEnd()) return;
  if (myHand.length === 0) { endGame(false, '手札がなくなった…'); return; }
  selectedCard = null;
  document.getElementById('declareArea').style.display = 'none';
  setMessage('あなたの番！ 手札からカードを選んで、宣言しよう', '');
  renderAll();
}

function playerDeclare(declaredId) {
  if (selectedCard === null) return;
  const actualId = myHand[selectedCard];
  const declared = CREATURES.find(c => c.id === declaredId);
  const actual = CREATURES.find(c => c.id === actualId);

  // 手札から除去
  myHand.splice(selectedCard, 1);
  selectedCard = null;
  document.getElementById('declareArea').style.display = 'none';

  // CPUが判定
  const isHonest = (declaredId === actualId);
  // CPU判定ロジック：確率ベースのブラフ読み
  const cpuGuess = cpuDecideGuess(declaredId, actualId);

  renderAll();

  // 演出
  const declaredEmoji = declared.emoji;
  setTimeout(() => {
    const correct = (cpuGuess === 'true' && isHonest) || (cpuGuess === 'false' && !isHonest);
    const guessText = cpuGuess === 'true' ? 'ホント' : 'ウソ';

    if (correct) {
      // CPUが当てた → プレイヤーの前にカードが置かれる（逆: 出した人の前）
      // ルール: 受け取る側が当てたら、出した人の前に置かれる
      myFaceUp.push(actualId);
      setMessage(
        `あなた「${declaredEmoji} ${declared.name}です」<br>CPU「${guessText}！」<br>→ 正解！ あなたの前にカードが置かれた 😱`,
        ''
      );
      renderAll();
      if (checkGameEnd()) return;
      // CPUが当てた→出した人(プレイヤー)が次の番
      setTimeout(() => playerTurnStart(), 1800);
    } else {
      // CPUが外した → CPUの前にカードが置かれる
      cpuFaceUp.push(actualId);
      setMessage(
        `あなた「${declaredEmoji} ${declared.name}です」<br>CPU「${guessText}！」<br>→ はずれ！ CPUの前にカードが置かれた 😄`,
        ''
      );
      renderAll();
      if (checkGameEnd()) return;
      // CPUが外した→受け取った人(CPU)が次の番
      setTimeout(() => cpuTurn(), 1800);
    }
  }, 800);
}
window.playerDeclare = playerDeclare;

// --- CPUのターン ---
function cpuTurn() {
  if (checkGameEnd()) return;
  if (cpuHand.length === 0) { endGame(true, 'CPUの手札がなくなった！'); return; }

  // CPUがカードを選んで宣言
  const cardIdx = Math.floor(Math.random() * cpuHand.length);
  const actualId = cpuHand[cardIdx];
  cpuHand.splice(cardIdx, 1);

  // CPUの宣言ロジック：50%ホント、50%ウソ
  let declaredId;
  if (Math.random() < 0.5) {
    declaredId = actualId; // ホント
  } else {
    // ランダムにウソの宣言
    const others = CREATURES.filter(c => c.id !== actualId);
    declaredId = others[Math.floor(Math.random() * others.length)].id;
  }

  const declared = CREATURES.find(c => c.id === declaredId);
  const isHonest = (declaredId === actualId);

  renderAll();
  setMessage(`CPUがカードを出して言った：<br>「これは ${declared.emoji}<b>${declared.name}</b> です」`, '');

  // 少し待ってから選択肢表示
  setTimeout(() => {
    setMessage(
      `CPUがカードを出して言った：<br>「これは ${declared.emoji}<b>${declared.name}</b> です」`,
      'judge'
    );
    showJudgeButtons(isHonest, actualId, declaredId);
  }, 1000);
}

function showJudgeButtons(isHonest, actualId, declaredId) {
  const btns = document.getElementById('choiceBtns');
  btns.innerHTML = `
    <button class="choice-btn true-btn" onclick="playerJudge(true, ${isHonest}, '${actualId}', '${declaredId}')">✅ ホント</button>
    <button class="choice-btn false-btn" onclick="playerJudge(false, ${isHonest}, '${actualId}', '${declaredId}')">❌ ウソ</button>
  `;
}

function playerJudge(guessTrue, isHonest, actualId, declaredId) {
  const actual = CREATURES.find(c => c.id === actualId);
  const declared = CREATURES.find(c => c.id === declaredId);
  const correct = (guessTrue === isHonest);

  if (correct) {
    // プレイヤーが当てた → CPUの前にカードが置かれる
    cpuFaceUp.push(actualId);
    setMessage(
      `正体は ${actual.emoji}${actual.name}！<br>→ 正解！ CPUの前にカードが置かれた 😄`,
      ''
    );
    renderAll();
    if (checkGameEnd()) return;
    // プレイヤーが当てた→出した人(CPU)が次の番… ではなくルール上は受け取り拒否成功→出した人が次
    // 正式ルール: 当てた場合、出した人の前に置かれる＆出した人が失敗した側
    // → カードを引き取った人が次のターン開始 = CPUがカードを引き取った→CPUの番
    setTimeout(() => cpuTurn(), 1800);
  } else {
    // プレイヤーが外した → プレイヤーの前にカードが置かれる
    myFaceUp.push(actualId);
    setMessage(
      `正体は ${actual.emoji}${actual.name}！<br>→ はずれ！ あなたの前にカードが置かれた 😱`,
      ''
    );
    renderAll();
    if (checkGameEnd()) return;
    // プレイヤーが引き取った→プレイヤーが次の番
    setTimeout(() => playerTurnStart(), 1800);
  }
}
window.playerJudge = playerJudge;

// --- CPUの判定AI ---
function cpuDecideGuess(declaredId, actualId) {
  // CPUの前にあるカードの枚数を考慮
  const declaredCount = cpuFaceUp.filter(id => id === declaredId).length;

  // 自分の前に3枚あるカードを宣言された→ウソだと思いたい（リスク回避）
  if (declaredCount >= 3) {
    return Math.random() < 0.7 ? 'false' : 'true';
  }
  // 基本は50/50 + 少しランダム性
  if (Math.random() < 0.45) {
    return 'true';
  } else {
    return 'false';
  }
}

// --- ゲーム終了判定 ---
function checkGameEnd() {
  // プレイヤーが4枚同じ
  const myCounts = countCards(myFaceUp);
  for (const id in myCounts) {
    if (myCounts[id] >= LOSE_COUNT) {
      const c = CREATURES.find(cr => cr.id === id);
      endGame(false, `${c.emoji}${c.name}が4枚たまってしまった…`);
      return true;
    }
  }
  // CPUが4枚同じ
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
