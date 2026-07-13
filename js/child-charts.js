/**
 * child.html用 - おこづかい残高グラフ＋ポイント推移グラフ
 * プレイヤー選択式の比較グラフ（複数人重ね表示対応）
 * 依存: client, childId, toggleAccordion（グローバルに存在すること）
 */
const CHART_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0'];
let allChildren = [];
let balanceSelected = [];
let pointsSelected = [];
let balanceChartInitialized = false;
let pointsChartInitialized = false;

// toggleAccordionをオーバーライドして、グラフセクションが開かれたとき初回描画
const origToggleAccordion = toggleAccordion;
toggleAccordion = function(id, el) {
  origToggleAccordion(id, el);
  const body = document.getElementById(id);
  if (body && body.style.display !== 'none') {
    if (id === 'balanceChartBody' && !balanceChartInitialized) {
      balanceChartInitialized = true;
      initBalanceChart();
    }
    if (id === 'pointsChartBody' && !pointsChartInitialized) {
      pointsChartInitialized = true;
      initPointsChart();
    }
  }
};

async function loadAllChildren() {
  if (allChildren.length > 0) return;
  const { data } = await client.from('children').select('id, name').order('sort_order');
  allChildren = (data || []).filter(c => !c.name.endsWith('が返すお金'));
}

function renderChartTabs(containerId, selected, toggleFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = allChildren.map((c, i) => {
    const isActive = selected.includes(c.id);
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const bg = isActive ? color : '#f0f0f0';
    const fg = isActive ? '#fff' : '#666';
    const border = isActive ? color : '#ddd';
    return `<button onclick="${toggleFn}('${c.id}')" style="border:2px solid ${border};border-radius:6px;padding:4px 10px;font-size:0.78em;font-weight:600;cursor:pointer;background:${bg};color:${fg};transition:all 0.15s;">${c.name}</button>`;
  }).join('');
}

// --- おこづかい残高グラフ ---
async function initBalanceChart() {
  await loadAllChildren();
  const currentIdx = allChildren.findIndex(c => c.id === childId);
  balanceSelected = currentIdx >= 0 ? [allChildren[currentIdx].id] : (allChildren[0] ? [allChildren[0].id] : []);
  renderChartTabs('balancePlayerTabs', balanceSelected, 'toggleBalancePlayer');
  await drawBalanceCompareChart();
}

function toggleBalancePlayer(id) {
  const idx = balanceSelected.indexOf(id);
  if (idx >= 0) {
    if (balanceSelected.length === 1) return;
    balanceSelected.splice(idx, 1);
  } else {
    balanceSelected.push(id);
  }
  renderChartTabs('balancePlayerTabs', balanceSelected, 'toggleBalancePlayer');
  drawBalanceCompareChart();
}

async function drawBalanceCompareChart() {
  const canvas = document.getElementById('balanceChart');
  const emptyMsg = document.getElementById('balanceChartEmpty');
  const legend = document.getElementById('balanceLegend');
  emptyMsg.style.display = 'none';

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const series = [];
  for (const cid of balanceSelected) {
    const c = allChildren.find(x => x.id === cid);
    if (!c) continue;
    const { data: childData } = await client.from('children').select('balance').eq('id', cid).single();
    const { data: txs } = await client.from('transactions').select('type, amount, created_at')
      .eq('child_id', cid).order('created_at', { ascending: true });
    if (!txs || txs.length === 0) { series.push({ name: c.name, values: [], labels: [], color: CHART_COLORS[allChildren.indexOf(c) % CHART_COLORS.length] }); continue; }

    let bal = childData?.balance || 0;
    const desc = [...txs].reverse();
    const balances = [];
    for (const t of desc) {
      balances.unshift(bal);
      bal += t.type === 'add' ? -t.amount : t.amount;
    }
    balances.unshift(bal);
    const dayMap = new Map();
    const firstDate = new Date(txs[0].created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
    dayMap.set(firstDate, balances[0]);
    txs.forEach((t, i) => {
      const d = new Date(t.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
      dayMap.set(d, balances[i + 1]);
    });
    series.push({ name: c.name, values: [...dayMap.values()], labels: [...dayMap.keys()], color: CHART_COLORS[allChildren.indexOf(c) % CHART_COLORS.length] });
  }

  const hasData = series.some(s => s.values && s.values.length >= 2);
  if (!hasData) { emptyMsg.style.display = 'block'; legend.innerHTML = ''; return; }
  drawMultiLineChart(ctx, W, H, series, legend);
}

// --- ポイント推移グラフ ---
async function initPointsChart() {
  await loadAllChildren();
  const currentIdx = allChildren.findIndex(c => c.id === childId);
  pointsSelected = currentIdx >= 0 ? [allChildren[currentIdx].id] : (allChildren[0] ? [allChildren[0].id] : []);
  renderChartTabs('pointsPlayerTabs', pointsSelected, 'togglePointsPlayer');
  await drawPointsCompareChart();
}

function togglePointsPlayer(id) {
  const idx = pointsSelected.indexOf(id);
  if (idx >= 0) {
    if (pointsSelected.length === 1) return;
    pointsSelected.splice(idx, 1);
  } else {
    pointsSelected.push(id);
  }
  renderChartTabs('pointsPlayerTabs', pointsSelected, 'togglePointsPlayer');
  drawPointsCompareChart();
}

async function drawPointsCompareChart() {
  const canvas = document.getElementById('pointsChart');
  const emptyMsg = document.getElementById('pointsChartEmpty');
  const legend = document.getElementById('pointsLegend');
  emptyMsg.style.display = 'none';

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const series = [];
  for (const cid of pointsSelected) {
    const c = allChildren.find(x => x.id === cid);
    if (!c) continue;
    const { data: pts } = await client.from('chore_points').select('points, created_at')
      .eq('child_id', cid).eq('status', 'approved').order('created_at', { ascending: true });
    if (!pts || pts.length === 0) { series.push({ name: c.name, values: [], labels: [], color: CHART_COLORS[allChildren.indexOf(c) % CHART_COLORS.length] }); continue; }
    let cum = 0;
    const dayMap = new Map();
    dayMap.set('開始', 0);
    pts.forEach(r => { cum += r.points; const d = new Date(r.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' }); dayMap.set(d, cum); });
    series.push({ name: c.name, values: [...dayMap.values()], labels: [...dayMap.keys()], color: CHART_COLORS[allChildren.indexOf(c) % CHART_COLORS.length] });
  }

  const hasData = series.some(s => s.values && s.values.length >= 2);
  if (!hasData) { emptyMsg.style.display = 'block'; legend.innerHTML = ''; return; }
  drawMultiLineChart(ctx, W, H, series, legend);
}

// --- 共通描画関数 ---
function drawMultiLineChart(ctx, W, H, series, legendEl) {
  const padL = 50, padR = 16, padT = 20, padB = 40;
  const chartW = W - padL - padR, chartH = H - padT - padB;

  let gMin = Infinity, gMax = -Infinity;
  series.forEach(s => { (s.values || []).forEach(v => { if (v < gMin) gMin = v; if (v > gMax) gMax = v; }); });
  if (gMin === Infinity) gMin = 0;
  if (gMax === -Infinity) gMax = 100;
  if (gMin === gMax) { gMin -= 50; gMax += 50; }
  const range = gMax - gMin;

  ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
  }
  ctx.fillStyle = '#999'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.fillText(Math.round(gMax - (range / 4) * i).toLocaleString(), padL - 6, y + 3);
  }

  if (gMin < 0 && gMax > 0) {
    const zy = padT + chartH - ((0 - gMin) / range) * chartH;
    ctx.strokeStyle = '#e5393555'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, zy); ctx.lineTo(W - padR, zy); ctx.stroke();
    ctx.setLineDash([]);
  }

  series.forEach(s => {
    if (!s.values || s.values.length < 2) return;
    ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    s.values.forEach((v, i) => {
      const x = padL + (chartW / (s.values.length - 1)) * i;
      const y = padT + chartH - ((v - gMin) / range) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    const li = s.values.length - 1;
    const lx = padL + (chartW / li) * li;
    const ly = padT + chartH - ((s.values[li] - gMin) / range) * chartH;
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill();
  });

  const longestSeries = series.reduce((a, b) => (b.labels || []).length > (a.labels || []).length ? b : a, series[0]);
  if (longestSeries && longestSeries.labels) {
    ctx.fillStyle = '#999'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    const labels = longestSeries.labels;
    const maxL = 6; const step = Math.max(1, Math.floor(labels.length / maxL));
    labels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const x = padL + (chartW / (labels.length - 1)) * i;
        const parts = label.split('/');
        const short = parts.length >= 2 ? parts[parts.length - 2] + '/' + parts[parts.length - 1] : label;
        ctx.fillText(short, x, H - padB + 14);
      }
    });
  }

  legendEl.innerHTML = series.map(s => {
    const last = s.values && s.values.length > 0 ? s.values[s.values.length - 1].toLocaleString() : '-';
    return `<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:10px;height:10px;background:${s.color};border-radius:2px;display:inline-block;"></span>${s.name}(${last})</span>`;
  }).join('');
}
