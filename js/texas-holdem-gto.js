// GTO Preflop Trainer
(function() {
const GTO_RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const GTO_SUITS = ['♠','♥','♦','♣'];
const GTO_SUIT_COLORS = {'♠':'black','♣':'black','♥':'red','♦':'red'};

const POSITIONS_BY_PLAYERS = {
  4: ['co','btn','sb','bb'],
  5: ['ep','co','btn','sb','bb']
};
const POSITION_LABELS = {
  ep:'EP', co:'CO', btn:'BTN', sb:'SB', bb:'BB'
};

let gtoData = {};
let gtoState = { players: 4, position: null, correct: 0, total: 0, currentAnswer: null, active: false };

async function gtoLoadData(players) {
  if (gtoData[players]) return;
  const res = await fetch(`../data/preflop/${players === 4 ? '4p' : '5p'}.json`);
  gtoData[players] = await res.json();
}

function gtoInitUI() {
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
  if (!container) return;
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

window.gtoStart = async function() {
  if (!gtoState.position) {
    alert('ポジションを選んでね');
    return;
  }
  await gtoLoadData(gtoState.players);
  gtoState.active = true;
  document.getElementById('gtoStartBtn').style.display = 'none';
  document.getElementById('gtoQuizArea').style.display = 'block';
  gtoNextQuestion();
};

function gtoNextQuestion() {
  const data = gtoData[gtoState.players];
  const matrix = data[gtoState.position];
  const row = Math.floor(Math.random() * 13);
  const col = Math.floor(Math.random() * 13);
  const tier = matrix[row][col];

  let correctAction;
  if (tier === 1 || tier === 2) correctAction = 'raise';
  else if (tier === 3) correctAction = 'call';
  else correctAction = 'fold';

  gtoState.currentAnswer = correctAction;
  gtoState.currentTier = tier;
  gtoState.currentRow = row;
  gtoState.currentCol = col;

  const rankHigh = GTO_RANKS[row];
  const rankLow = GTO_RANKS[col];
  let handLabel, card1, card2;

  if (row === col) {
    const s1 = rndSuit();
    let s2 = rndSuit();
    while (s2 === s1) s2 = rndSuit();
    card1 = { rank: rankHigh, suit: s1 };
    card2 = { rank: rankLow, suit: s2 };
    handLabel = rankHigh + rankLow;
  } else if (row < col) {
    const s = rndSuit();
    card1 = { rank: rankHigh, suit: s };
    card2 = { rank: rankLow, suit: s };
    handLabel = rankHigh + rankLow + 's';
  } else {
    const s1 = rndSuit();
    let s2 = rndSuit();
    while (s2 === s1) s2 = rndSuit();
    card1 = { rank: rankLow, suit: s1 };
    card2 = { rank: rankHigh, suit: s2 };
    handLabel = rankLow + rankHigh + 'o';
  }

  const display = document.getElementById('gtoHandDisplay');
  display.innerHTML = `
    <div class="gto-card ${GTO_SUIT_COLORS[card1.suit]}">
      <span class="gto-card-rank">${card1.rank}</span>
      <span class="gto-card-suit">${card1.suit}</span>
    </div>
    <div class="gto-card ${GTO_SUIT_COLORS[card2.suit]}">
      <span class="gto-card-rank">${card2.rank}</span>
      <span class="gto-card-suit">${card2.suit}</span>
    </div>
  `;
  document.getElementById('gtoHandLabel').textContent = handLabel;
  document.getElementById('gtoResult').textContent = '';
  document.getElementById('gtoResult').className = 'gto-result';
  document.getElementById('gtoMatrix').style.display = 'none';
  document.getElementById('gtoNextBtn').style.display = 'none';
  document.querySelectorAll('.gto-action-btn').forEach(b => b.disabled = false);

  // BB時はレイズボタンを「3ベット」表記に
  const raiseBtn = document.querySelector('.gto-action-btn.raise');
  raiseBtn.textContent = gtoState.position === 'bb' ? '3ベット' : 'レイズ';
}

window.gtoAnswer = function(action) {
  if (!gtoState.active) return;
  gtoState.total++;
  const correct = action === gtoState.currentAnswer;
  if (correct) gtoState.correct++;

  const resultEl = document.getElementById('gtoResult');
  const actionLabels = { raise: gtoState.position === 'bb' ? '3ベット' : 'レイズ', call: 'コール', fold: 'フォールド' };
  const tierLabels = { 1: 'プレミアム', 2: 'レイズ', 3: 'コール/ミックス', 4: 'フォールド' };

  if (correct) {
    resultEl.textContent = '⭕ 正解！';
    resultEl.className = 'gto-result correct';
  } else {
    resultEl.textContent = `❌ 不正解… 正解は「${actionLabels[gtoState.currentAnswer]}」（${tierLabels[gtoState.currentTier]}）`;
    resultEl.className = 'gto-result wrong';
  }

  document.getElementById('gtoScore').textContent = `正解: ${gtoState.correct} / ${gtoState.total}`;
  document.querySelectorAll('.gto-action-btn').forEach(b => b.disabled = true);

  if (correct) {
    setTimeout(() => gtoNextQuestion(), 800);
  } else {
    showGtoMatrix();
    document.getElementById('gtoNextBtn').style.display = 'inline-block';
  }
};

window.gtoNext = function() {
  document.getElementById('gtoMatrix').style.display = 'none';
  document.getElementById('gtoNextBtn').style.display = 'none';
  gtoNextQuestion();
};

function showGtoMatrix() {
  const data = gtoData[gtoState.players];
  const matrix = data[gtoState.position];
  const tierColors = { 1: '#4caf50', 2: '#2196f3', 3: '#ffc107', 4: 'rgba(255,255,255,0.08)' };
  const tierText = { 1: '#fff', 2: '#fff', 3: '#222', 4: '#666' };

  let html = '<table class="gto-matrix-table"><tr><th></th>';
  for (let c = 0; c < 13; c++) html += `<th>${GTO_RANKS[c]}</th>`;
  html += '</tr>';

  for (let r = 0; r < 13; r++) {
    html += `<tr><th>${GTO_RANKS[r]}</th>`;
    for (let c = 0; c < 13; c++) {
      const t = matrix[r][c];
      const isHighlight = (r === gtoState.currentRow && c === gtoState.currentCol);
      const border = isHighlight ? 'border:2px solid #ff5252;' : '';
      html += `<td style="background:${tierColors[t]};color:${tierText[t]};${border}">`;
      if (r === c) html += GTO_RANKS[r] + GTO_RANKS[c];
      else if (r < c) html += GTO_RANKS[r] + GTO_RANKS[c] + 's';
      else html += GTO_RANKS[c] + GTO_RANKS[r] + 'o';
      html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  html += '<div class="gto-matrix-legend">🟢プレミアム/レイズ 🔵レイズ 🟡コール/ミックス ⬜フォールド　<span style="color:#ff5252;">■</span> = 出題ハンド</div>';

  const container = document.getElementById('gtoMatrix');
  container.innerHTML = html;
  container.style.display = 'block';
}

function rndSuit() {
  return GTO_SUITS[Math.floor(Math.random() * 4)];
}

document.addEventListener('DOMContentLoaded', () => gtoInitUI());
})();
