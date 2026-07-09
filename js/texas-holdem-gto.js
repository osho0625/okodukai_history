// GTO Preflop Trainer
const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const SUITS = ['♠','♥','♦','♣'];
const SUIT_COLORS = {'♠':'black','♣':'black','♥':'red','♦':'red'};

const POSITIONS_BY_PLAYERS = {
  4: ['co','btn','sb'],
  5: ['ep','co','btn','sb']
};
const POSITION_LABELS = {
  ep:'EP', co:'CO', btn:'BTN', sb:'SB'
};

let gtoData = {};
let gtoState = { players: 4, position: null, correct: 0, total: 0, currentAnswer: null, active: false };

// Load preflop data
async function gtoLoadData(players) {
  if (gtoData[players]) return;
  const res = await fetch(`../data/preflop/${players === 4 ? '4p' : '5p'}.json`);
  gtoData[players] = await res.json();
}

function gtoInitUI() {
  // Player count buttons
  document.querySelectorAll('#gtoPlayerCount button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#gtoPlayerCount button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gtoState.players = parseInt(btn.dataset.val);
      gtoState.position = null;
      gtoRenderPositions();
      gtoReset();
    });
  });
  gtoRenderPositions();
}

function gtoRenderPositions() {
  const container = document.getElementById('gtoPosition');
  const positions = POSITIONS_BY_PLAYERS[gtoState.players];
  container.innerHTML = positions.map(p =>
    `<button data-val="${p}">${POSITION_LABELS[p]}</button>`
  ).join('');
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gtoState.position = btn.dataset.val;
      gtoReset();
    });
  });
}

function gtoReset() {
  gtoState.correct = 0;
  gtoState.total = 0;
  gtoState.active = false;
  document.getElementById('gtoScore').textContent = '正解: 0 / 0';
  document.getElementById('gtoQuizArea').style.display = 'none';
  document.getElementById('gtoStartBtn').style.display = 'block';
  document.getElementById('gtoResult').textContent = '';
}

async function gtoStart() {
  if (!gtoState.position) {
    alert('ポジションを選んでね');
    return;
  }
  await gtoLoadData(gtoState.players);
  gtoState.active = true;
  document.getElementById('gtoStartBtn').style.display = 'none';
  document.getElementById('gtoQuizArea').style.display = 'block';
  gtoNextQuestion();
}

function gtoNextQuestion() {
  const data = gtoData[gtoState.players];
  const matrix = data[gtoState.position];
  // Pick random hand from 13x13
  const row = Math.floor(Math.random() * 13);
  const col = Math.floor(Math.random() * 13);
  const tier = matrix[row][col];

  // Determine correct action
  // tier 1 = premium (raise), 2 = raise, 3 = mixed/call, 4 = fold
  let correctAction;
  if (tier === 1 || tier === 2) correctAction = 'raise';
  else if (tier === 3) correctAction = 'call';
  else correctAction = 'fold';

  gtoState.currentAnswer = correctAction;
  gtoState.currentTier = tier;

  // Generate hand display
  const rankHigh = RANKS[row];
  const rankLow = RANKS[col];
  let handLabel, card1, card2;

  if (row === col) {
    // Pocket pair
    const s1 = randomSuit();
    let s2 = randomSuit();
    while (s2 === s1) s2 = randomSuit();
    card1 = { rank: rankHigh, suit: s1 };
    card2 = { rank: rankLow, suit: s2 };
    handLabel = rankHigh + rankLow;
  } else if (row < col) {
    // Suited (upper-left triangle)
    const s = randomSuit();
    card1 = { rank: rankHigh, suit: s };
    card2 = { rank: rankLow, suit: s };
    handLabel = rankHigh + rankLow + 's';
  } else {
    // Offsuit (lower-right triangle)
    const s1 = randomSuit();
    let s2 = randomSuit();
    while (s2 === s1) s2 = randomSuit();
    card1 = { rank: rankLow, suit: s1 };
    card2 = { rank: rankHigh, suit: s2 };
    handLabel = rankLow + rankHigh + 'o';
  }

  // Render cards
  const display = document.getElementById('gtoHandDisplay');
  display.innerHTML = `
    <div class="gto-card ${SUIT_COLORS[card1.suit]}">
      <span class="gto-card-rank">${card1.rank}</span>
      <span class="gto-card-suit">${card1.suit}</span>
    </div>
    <div class="gto-card ${SUIT_COLORS[card2.suit]}">
      <span class="gto-card-rank">${card2.rank}</span>
      <span class="gto-card-suit">${card2.suit}</span>
    </div>
  `;
  document.getElementById('gtoHandLabel').textContent = handLabel;
  document.getElementById('gtoResult').textContent = '';
  document.getElementById('gtoResult').className = 'gto-result';

  // Enable buttons
  document.querySelectorAll('.gto-action-btn').forEach(b => b.disabled = false);
}

function gtoAnswer(action) {
  if (!gtoState.active) return;
  gtoState.total++;
  const correct = action === gtoState.currentAnswer;
  if (correct) gtoState.correct++;

  const resultEl = document.getElementById('gtoResult');
  const actionLabels = { raise: 'レイズ', call: 'コール', fold: 'フォールド' };
  const tierLabels = { 1: 'プレミアム', 2: 'レイズ', 3: 'コール/ミックス', 4: 'フォールド' };

  if (correct) {
    resultEl.textContent = '⭕ 正解！';
    resultEl.className = 'gto-result correct';
  } else {
    resultEl.textContent = `❌ 不正解… 正解は「${actionLabels[gtoState.currentAnswer]}」（${tierLabels[gtoState.currentTier]}）`;
    resultEl.className = 'gto-result wrong';
  }

  document.getElementById('gtoScore').textContent = `正解: ${gtoState.correct} / ${gtoState.total}`;

  // Disable buttons briefly, then next question
  document.querySelectorAll('.gto-action-btn').forEach(b => b.disabled = true);
  setTimeout(() => gtoNextQuestion(), correct ? 800 : 1800);
}

function randomSuit() {
  return SUITS[Math.floor(Math.random() * 4)];
}

// Init when tab is first shown
document.addEventListener('DOMContentLoaded', () => gtoInitUI());
