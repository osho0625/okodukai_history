// texas-holdem-charts.js
// プリフロップハンド表 - JSON読み込み＋描画ロジック
//
// Tier定義:
//   1 = プレミアム（AA-QQ, AKs, AKo, AQs）— 100% Raise / 3bet
//   2 = 基本レイズ — 高頻度でオープンレイズ
//   3 = 状況次第（ミックス）— 相手・状況次第で低頻度レイズ。BBのみコール
//   4 = フォールド

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

// チャートデータキャッシュ
const chartCache = {};

async function loadChartData(players) {
  const fileMap = { '9': '9max', '6': '6max', '5': '5p', '4': '4p' };
  const filename = fileMap[players];
  if (!filename) return null;
  if (chartCache[players]) return chartCache[players];
  try {
    const res = await fetch('../data/preflop/' + filename + '.json');
    const json = await res.json();
    // メタ情報(version, tiers)を除いたポジションデータのみキャッシュ
    const data = {};
    for (const key of Object.keys(json)) {
      if (key !== 'version' && key !== 'tiers') data[key] = json[key];
    }
    chartCache[players] = data;
    return data;
  } catch (e) {
    console.error('Failed to load chart:', filename, e);
    return null;
  }
}

function renderPreflopChart(data) {
  if (!data) {
    document.getElementById('preflopGrid').innerHTML = '<p style="color:#aaa;">読み込み中...</p>';
    return;
  }
  const tierClass = ['','tier1','tier2','tier3','tier4'];
  let html = '<table class="preflop-table"><thead><tr><th></th>';
  RANKS.forEach(r => html += '<th>' + r + '</th>');
  html += '</tr></thead><tbody>';
  for (let row = 0; row < 13; row++) {
    html += '<tr><th>' + RANKS[row] + '</th>';
    for (let col = 0; col < 13; col++) {
      const tier = data[row][col];
      let label;
      if (row === col) label = RANKS[row] + RANKS[col];
      else if (col > row) label = RANKS[row] + RANKS[col] + 's';
      else label = RANKS[col] + RANKS[row] + 'o';
      html += '<td class="' + tierClass[tier] + '">' + label + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  document.getElementById('preflopGrid').innerHTML = html;
}

// ポジション定義（人数別）
const POSITIONS_BY_PLAYERS = {
  '9': ['EP','MP','CO','BTN','SB','BB'],
  '6': ['EP','CO','BTN','SB','BB'],
  '5': ['EP','CO','BTN','SB','BB'],
  '4': ['CO','BTN','SB','BB']
};

let currentPlayers = '9';
let currentPosition = 'EP';

function renderPositionButtons(players) {
  const positions = POSITIONS_BY_PLAYERS[players];
  const container = document.getElementById('positionSelector');
  container.innerHTML = '';
  positions.forEach((pos, i) => {
    const btn = document.createElement('button');
    btn.textContent = pos;
    btn.dataset.pos = pos;
    if (i === 0) btn.classList.add('active');
    container.appendChild(btn);
  });
  currentPosition = positions[0];
}

async function updateChart() {
  const data = await loadChartData(currentPlayers);
  if (!data) return;
  const posData = data[currentPosition.toLowerCase()];
  renderPreflopChart(posData);
}

function initPreflopUI() {
  document.getElementById('playerCountSelector').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#playerCountSelector button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPlayers = btn.dataset.players;
    renderPositionButtons(currentPlayers);
    updateChart();
  });

  document.getElementById('positionSelector').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#positionSelector button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPosition = btn.dataset.pos;
    updateChart();
  });

  renderPositionButtons('9');
  updateChart();
}
