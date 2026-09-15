// ============================================================
// 漢字合体ブラスト（縦STG + 漢字合体パズル）
//  - データは Supabase（kanji_master / kanji_recipes /
//    kanji_players / kanji_inventory / kanji_dex）に保存。
//  - プレイデータは子供（player）ごとに分離。
//  - 削除は作成端末（created_by_device）のみ許可（アプリ層で制御）。
// ============================================================

const MAX_HAND = 10;

// この端末の識別子（common.js の push_device_id を流用、無ければ生成）
function getDeviceId() {
  let id = localStorage.getItem('push_device_id');
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      ('dev-' + Date.now() + '-' + Math.random().toString(16).slice(2));
    localStorage.setItem('push_device_id', id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

// --- グローバル状態 ---
let MASTER = {};      // char -> {char, strokes, kentei_level, readings, is_part}
let RECIPES = [];     // {result_char, part_a, part_b}
let RECIPE_BY_RESULT = {}; // result_char -> recipe
let RECIPE_BY_PARTS = {};  // "a|b"(sorted) -> result_char

let player = null;    // 現在のプレイヤー行
let hand = [];        // 手持ち [{id, char}]
let dex = [];         // 図鑑 [{char, reading}]
let selected = [];    // 手持ちで選択中の inventory id

// ------------------------------------------------------------
// 起動
// ------------------------------------------------------------
(async function init() {
  if (isNightTime()) {
    document.body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#eee;"><div style="font-size:4em;">🌙</div><h2>今日はおしまい！</h2><p style="color:#aaa;">また明日ね</p><a href="../index.html" style="color:#8be9fd;">🏠 もどる</a></div>';
    return;
  }
  await loadMaster();
  const savedId = localStorage.getItem('kanjiblast_player_id');
  if (savedId) {
    await selectPlayer(savedId, true);
  } else {
    showScreen('playerScreen');
    loadPlayers();
  }
})();

// ------------------------------------------------------------
// マスタ/レシピ読み込み
// ------------------------------------------------------------
async function loadMaster() {
  let m = [], r = [];
  try {
    const res = await Promise.all([
      client.from('kanji_master').select('*'),
      client.from('kanji_recipes').select('*')
    ]);
    m = res[0].data || [];
    r = res[1].data || [];
  } catch (e) {
    console.error('マスタ読み込み失敗', e);
  }
  if (m.length === 0) {
    toast('データがまだ準備できてないみたい（テーブル未作成）');
  }
  m.forEach(k => {
    if (typeof k.readings === 'string') {
      try { k.readings = JSON.parse(k.readings); } catch (e) { k.readings = []; }
    }
    if (!Array.isArray(k.readings)) k.readings = [];
    MASTER[k.char] = k;
  });
  RECIPES = r || [];
  RECIPES.forEach(rc => {
    RECIPE_BY_RESULT[rc.result_char] = rc;
    RECIPE_BY_PARTS[partKey(rc.part_a, rc.part_b)] = rc.result_char;
  });
}

function partKey(a, b) { return [a, b].sort().join('|'); }

// ------------------------------------------------------------
// 画面遷移
// ------------------------------------------------------------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function backToMenu() { showScreen('menuScreen'); refreshMenu(); }

function goBack() {
  if (document.getElementById('stgScreen').classList.contains('active')) {
    if (confirm('しゅつげきを中断してメニューにもどる？')) { stopStg(); backToMenu(); }
    return;
  }
  if (document.getElementById('menuScreen').classList.contains('active')) {
    location.href = 'arcade.html';
    return;
  }
  backToMenu();
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

// ------------------------------------------------------------
// プレイヤー管理
// ------------------------------------------------------------
async function loadPlayers() {
  const list = document.getElementById('playerList');
  list.innerHTML = '<div class="loading">読み込み中...</div>';
  const { data } = await client.from('kanji_players').select('*').order('created_at');
  const players = data || [];
  if (players.length === 0) {
    list.innerHTML = '<p style="color:#aaa;font-size:0.85em;">まだだれもいないよ。したからつくってね</p>';
    return;
  }
  list.innerHTML = '';
  players.forEach(p => {
    const canDelete = p.created_by_device === DEVICE_ID;
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML =
      '<span style="font-size:1.6em;">🧒</span>' +
      '<div style="flex:1;text-align:left;">' +
        '<div class="pc-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="pc-meta">ハイスコア ' + (p.best_score || 0) + ' / STAGE ' + (p.max_stage || 1) + '</div>' +
      '</div>' +
      (canDelete ? '<span class="pc-del" title="さくじょ">🗑️</span>' : '');
    card.querySelector('.pc-name').parentElement.onclick = () => selectPlayer(p.id);
    card.querySelector('span').onclick = () => selectPlayer(p.id);
    const del = card.querySelector('.pc-del');
    if (del) del.onclick = (e) => { e.stopPropagation(); deletePlayer(p); };
    list.appendChild(card);
  });
}

async function createPlayer() {
  const input = document.getElementById('newPlayerName');
  const name = input.value.trim();
  if (!name) { toast('なまえを入れてね'); return; }
  const { data, error } = await client.from('kanji_players').insert({
    name, created_by_device: DEVICE_ID
  }).select().single();
  if (error) { toast('つくれなかった'); return; }
  input.value = '';
  // 最初のパーツを2つ配布（口・十）
  await giveStarterKanji(data.id);
  await selectPlayer(data.id);
}

async function giveStarterKanji(playerId) {
  const starters = ['口', '十', '木', '火'].filter(c => MASTER[c]);
  const rows = starters.map(c => ({ player_id: playerId, char: c, created_by_device: DEVICE_ID }));
  if (rows.length) await client.from('kanji_inventory').insert(rows);
}

async function selectPlayer(playerId, silent) {
  const { data, error } = await client.from('kanji_players').select('*').eq('id', playerId).maybeSingle();
  if (error || !data) {
    localStorage.removeItem('kanjiblast_player_id');
    if (!silent) toast('データが見つからないよ');
    showScreen('playerScreen'); loadPlayers();
    return;
  }
  player = data;
  localStorage.setItem('kanjiblast_player_id', player.id);
  await reloadPlayerData();
  showScreen('menuScreen');
  refreshMenu();
}

async function deletePlayer(p) {
  if (p.created_by_device !== DEVICE_ID) { toast('この端末では消せないよ'); return; }
  if (!confirm(p.name + ' のデータを消す？（もとにもどせません）')) return;
  // 子テーブルは ON DELETE CASCADE で自動削除
  await client.from('kanji_players').delete().eq('id', p.id).eq('created_by_device', DEVICE_ID);
  if (player && player.id === p.id) { player = null; localStorage.removeItem('kanjiblast_player_id'); }
  toast('消したよ');
  loadPlayers();
}

async function reloadPlayerData() {
  if (!player) return;
  const [{ data: inv }, { data: dx }] = await Promise.all([
    client.from('kanji_inventory').select('*').eq('player_id', player.id).order('created_at'),
    client.from('kanji_dex').select('*').eq('player_id', player.id)
  ]);
  hand = (inv || []).map(r => ({ id: r.id, char: r.char }));
  dex = (dx || []).map(r => ({ char: r.char, reading: r.reading }));
  selected = [];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ------------------------------------------------------------
// 強さ計算
//   漢字パワー = 画数 × 難易度係数 × (1 + 解放読み数 × 0.1)
//   全体ボーナス = 1 + 図鑑登録漢字数 × 0.02
//   最終 = round(漢字パワー × 全体ボーナス)
// ------------------------------------------------------------
const KENTEI_FACTOR = {
  '10': 1.0, '9': 1.2, '8': 1.4, '7': 1.6, '6': 1.8, '5': 2.0,
  '4': 2.4, '3': 2.8, '準2': 3.2, '2': 3.6, '準1': 4.2, '1': 5.0
};

function kenteiFactor(level) { return KENTEI_FACTOR[level] || 1.0; }

// 図鑑に登録済みの、その漢字の読み数
function unlockedReadingCount(char) {
  return dex.filter(d => d.char === char).length;
}

// 図鑑に1つでも読みが登録された漢字の種類数（全体ボーナス用）
function dexCharCount() {
  return new Set(dex.map(d => d.char)).size;
}

function overallBonus() {
  return 1 + dexCharCount() * 0.02;
}

function kanjiPower(char) {
  const m = MASTER[char];
  if (!m) return 0;
  const base = m.strokes * kenteiFactor(m.kentei_level) * (1 + unlockedReadingCount(char) * 0.1);
  return Math.round(base * overallBonus());
}

// ------------------------------------------------------------
// 読み仮名の判定
//   readings 各要素: {type, kana, display}
//   kana の "." は送り仮名の境界（例: "う.まれる"）。
//   入力は ひらがな化 + カタカナ化 の両方で照合し、
//   送り仮名あり/なし、活用ゆらぎ（まれる/まれた/む…）を許容する。
//   一致したら display（正規形）を返す。
// ------------------------------------------------------------
function toHira(s) {
  return s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}
function toKata(s) {
  return s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
}
function normInput(s) {
  return (s || '').trim().replace(/\s/g, '').replace(/[・･]/g, '');
}


// 送り仮名の活用ゆらぎ判定用に、語幹（"."より前）と送りを分ける
function readingParts(kana) {
  const idx = kana.indexOf('.');
  if (idx < 0) return { stem: kana, okuri: '' };
  return { stem: kana.slice(0, idx), okuri: kana.slice(idx + 1) };
}

// 入力 input が reading(kana) にマッチするか判定する。
// char: 対象漢字（表記入力「生まれる」対応のため）
// 戻り値: マッチした「語幹の長さ」（マッチしなければ -1）。大きいほど良い一致。
//   最長一致を選ぶことで「うむ」→生む、「うまれる」→生まれる を区別する。
function matchScore(input, kana, char) {
  const inHira = toHira(input);
  const { stem, okuri } = readingParts(kana);
  const stemHira = toHira(stem);

  // 音読み等（送り仮名なし）: 完全一致のみ（ひら/カナ両対応）
  if (!okuri) {
    const kHira = toHira(kana);
    if (inHira === kHira) return kHira.length + 100; // 完全一致は高スコア
    return -1;
  }

  // 訓読み（送り仮名あり）
  const fullHira = toHira(stem + okuri); // うまれる
  // 表記入力（生まれる）→ 漢字を送り仮名に置換したものと比較
  const inKanaFromWriting = toHira(input.replace(char, stem)); // 「生まれる」→「うまれる」

  // 完全一致（かな or 表記）
  if (inHira === fullHira || inKanaFromWriting === fullHira) return fullHira.length + 100;

  // 活用ゆらぎ: 語幹 + 送り(1文字以上)。うまれた/うむ 等。
  const candidates = [inHira, inKanaFromWriting];
  for (const cand of candidates) {
    if (cand.startsWith(stemHira) && cand.length > stemHira.length) {
      return stemHira.length; // 語幹が長いほど優先される
    }
  }
  return -1;
}

// 入力に一致する readings を探して、正規形 display を返す（無ければ null）
// 最もスコアの高い（最長語幹一致の）読みを採用する。
function resolveReading(char, input) {
  const m = MASTER[char];
  if (!m || !Array.isArray(m.readings)) return null;
  const norm = normInput(input);
  if (!norm) return null;
  let best = null, bestScore = -1;
  for (const r of m.readings) {
    const sc = matchScore(norm, r.kana, char);
    if (sc > bestScore) { bestScore = sc; best = r.display; }
  }
  return bestScore >= 0 ? best : null;
}

// ------------------------------------------------------------
// メニュー表示
// ------------------------------------------------------------
function refreshMenu() {
  if (!player) return;
  document.getElementById('menuPlayerName').textContent = '🧒 ' + player.name;
  document.getElementById('menuStats').textContent =
    'ハイスコア ' + (player.best_score || 0) + ' ／ 図鑑 ' + dexCharCount() + '種類 ／ 手持ち ' + hand.length + '/' + MAX_HAND;
  setEquipDisplay('Shot', player.equipped_shot);
  setEquipDisplay('Special', player.equipped_special);
}

function setEquipDisplay(slot, char) {
  document.getElementById('equip' + slot + 'Char').textContent = char || '-';
  document.getElementById('equip' + slot + 'Pow').textContent = char ? ('⚔ ' + kanjiPower(char)) : '';
}

// ------------------------------------------------------------
// 手持ち / 合体UI
// ------------------------------------------------------------
function renderInventory() {
  const grid = document.getElementById('invGrid');
  grid.innerHTML = '';
  for (let i = 0; i < MAX_HAND; i++) {
    const item = hand[i];
    const cell = document.createElement('div');
    if (!item) {
      cell.className = 'kanji-cell empty';
      cell.innerHTML = '<div class="kc-char" style="opacity:0.4;">・</div>';
    } else {
      const isSel = selected.includes(item.id);
      cell.className = 'kanji-cell' + (isSel ? ' selected' : '');
      const equipBadge =
        (player.equipped_shot === item.char ? '🔫' : '') +
        (player.equipped_special === item.char ? '💥' : '');
      cell.innerHTML =
        '<div class="kc-badge">' + equipBadge + '</div>' +
        '<div class="kc-char">' + item.char + '</div>' +
        '<div class="kc-pow">⚔' + kanjiPower(item.char) + '</div>';
      cell.onclick = () => toggleSelect(item.id);
    }
    grid.appendChild(cell);
  }
  updateRecipePreview();
  updateInvButtons();
}

function toggleSelect(id) {
  const idx = selected.indexOf(id);
  if (idx >= 0) { selected.splice(idx, 1); }
  else {
    if (selected.length >= 2) selected.shift(); // 最大2つ
    selected.push(id);
  }
  renderInventory();
}

function selectedChars() {
  return selected.map(id => (hand.find(h => h.id === id) || {}).char).filter(Boolean);
}

function updateRecipePreview() {
  const pv = document.getElementById('recipePreview');
  const chars = selectedChars();
  if (chars.length === 2) {
    const result = RECIPE_BY_PARTS[partKey(chars[0], chars[1])];
    pv.textContent = result
      ? (chars[0] + ' ＋ ' + chars[1] + ' → ' + result + '（⚔' + kanjiPower(result) + '）')
      : (chars[0] + ' ＋ ' + chars[1] + ' → ？（レシピなし）');
  } else if (chars.length === 1) {
    const c = chars[0];
    const rc = RECIPE_BY_RESULT[c];
    pv.textContent = rc ? (c + ' → ' + rc.part_a + ' ＋ ' + rc.part_b + ' に分解できる') : (c + '（これ以上分解できない）');
  } else {
    pv.textContent = '';
  }
}

function updateInvButtons() {
  const chars = selectedChars();
  const two = chars.length === 2;
  const one = chars.length === 1;
  document.getElementById('btnMerge').disabled = !(two && RECIPE_BY_PARTS[partKey(chars[0], chars[1])]);
  document.getElementById('btnSplit').disabled = !(one && RECIPE_BY_RESULT[chars[0]]);
  document.getElementById('btnEquipShot').disabled = !one;
  document.getElementById('btnEquipSpecial').disabled = !one;
  document.getElementById('btnRelease').disabled = !one;
}

// 合体: 選択2つを消して結果1つを追加
async function doMerge() {
  const chars = selectedChars();
  if (chars.length !== 2) return;
  const result = RECIPE_BY_PARTS[partKey(chars[0], chars[1])];
  if (!result) { toast('このくみあわせは合体できないよ'); return; }
  const ids = selected.slice();
  await client.from('kanji_inventory').delete().in('id', ids);
  const { data } = await client.from('kanji_inventory')
    .insert({ player_id: player.id, char: result, created_by_device: DEVICE_ID })
    .select().single();
  hand = hand.filter(h => !ids.includes(h.id));
  if (data) hand.push({ id: data.id, char: data.char });
  selected = [];
  toast('🎉 ' + result + ' ができた！');
  renderInventory();
}

// 分解: 選択1つを素材2つに戻す
async function doSplit() {
  const chars = selectedChars();
  if (chars.length !== 1) return;
  const rc = RECIPE_BY_RESULT[chars[0]];
  if (!rc) { toast('これ以上分解できないよ'); return; }
  if (hand.length + 1 > MAX_HAND) { toast('手持ちがいっぱい。分解すると1つ増えるよ'); return; }
  const id = selected[0];
  await client.from('kanji_inventory').delete().eq('id', id);
  const rows = [rc.part_a, rc.part_b].map(c => ({ player_id: player.id, char: c, created_by_device: DEVICE_ID }));
  const { data } = await client.from('kanji_inventory').insert(rows).select();
  hand = hand.filter(h => h.id !== id);
  (data || []).forEach(d => hand.push({ id: d.id, char: d.char }));
  selected = [];
  toast('🔨 ' + rc.part_a + ' と ' + rc.part_b + ' にわけた');
  renderInventory();
}

// 装備
async function doEquip(slot) {
  const chars = selectedChars();
  if (chars.length !== 1) return;
  const char = chars[0];
  const col = slot === 'shot' ? 'equipped_shot' : 'equipped_special';
  const upd = {}; upd[col] = char;
  await client.from('kanji_players').update(upd).eq('id', player.id);
  player[col] = char;
  toast((slot === 'shot' ? '🔫' : '💥') + ' ' + char + ' をそうびした');
  renderInventory();
}

// にがす
async function doRelease() {
  const chars = selectedChars();
  if (chars.length !== 1) return;
  const id = selected[0];
  const item = hand.find(h => h.id === id);
  if (!confirm(item.char + ' をにがす？')) return;
  await client.from('kanji_inventory').delete().eq('id', id);
  // 装備中なら外す
  const upd = {};
  if (player.equipped_shot === item.char && hand.filter(h => h.char === item.char).length <= 1) upd.equipped_shot = null;
  if (player.equipped_special === item.char && hand.filter(h => h.char === item.char).length <= 1) upd.equipped_special = null;
  if (Object.keys(upd).length) { await client.from('kanji_players').update(upd).eq('id', player.id); Object.assign(player, upd); }
  hand = hand.filter(h => h.id !== id);
  selected = [];
  toast('👋 ' + item.char + ' をにがした');
  renderInventory();
}

// ------------------------------------------------------------
// 図鑑 / 読み仮名登録
// ------------------------------------------------------------
function renderDex() {
  const listEl = document.getElementById('dexList');
  // 手持ち + これまで持ったことのある漢字（図鑑登録済み）をまとめて表示
  const chars = new Set();
  hand.forEach(h => chars.add(h.char));
  dex.forEach(d => chars.add(d.char));
  const arr = Array.from(chars).sort((a, b) => (MASTER[a]?.strokes || 0) - (MASTER[b]?.strokes || 0));

  if (arr.length === 0) {
    listEl.innerHTML = '<p style="color:#aaa;text-align:center;">まだ漢字がないよ。しゅつげきしてボスからゲットしよう！</p>';
    return;
  }
  listEl.innerHTML = '';
  arr.forEach(char => {
    const m = MASTER[char];
    if (!m) return;
    const done = dex.filter(d => d.char === char).map(d => d.reading);
    const total = (m.readings || []).length;
    const item = document.createElement('div');
    item.className = 'dex-item';
    item.innerHTML =
      '<div class="dex-head">' +
        '<div class="dex-char">' + char + '</div>' +
        '<div class="dex-info">' +
          '<div class="dex-meta">' + m.strokes + '画 ／ 漢検' + m.kentei_level + '級 ／ 読み ' + done.length + '/' + total + '</div>' +
          '<div class="dex-meta" style="color:#f1fa8c;">⚔ パワー ' + kanjiPower(char) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dex-readings">' +
        (m.readings || []).map(r => {
          const isDone = done.includes(r.display);
          return '<span class="reading-chip ' + (isDone ? 'done' : '') + '">' + (isDone ? r.display : '？') + '</span>';
        }).join('') +
      '</div>' +
      '<div class="reading-input-row">' +
        '<input placeholder="よみがなを入力（例：うまれる）" data-char="' + char + '">' +
        '<button class="btn btn-secondary">登録</button>' +
      '</div>';
    const input = item.querySelector('input');
    item.querySelector('button').onclick = () => submitReading(char, input);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submitReading(char, input); });
    listEl.appendChild(item);
  });
}

async function submitReading(char, input) {
  const val = input.value;
  const display = resolveReading(char, val);
  if (!display) { toast('ちがうみたい…もういちど！'); return; }
  if (dex.some(d => d.char === char && d.reading === display)) {
    toast('「' + display + '」はもう登録ずみ');
    input.value = '';
    return;
  }
  const { error } = await client.from('kanji_dex').insert({
    player_id: player.id, char, reading: display, created_by_device: DEVICE_ID
  });
  if (error) {
    // UNIQUE制約で既存の場合など
    if (error.code === '23505') { toast('もう登録ずみ'); }
    else { toast('登録できなかった'); }
    return;
  }
  dex.push({ char, reading: display });
  input.value = '';
  toast('⭐ 「' + display + '」を図鑑に登録！パワーアップ');
  renderDex();
}

// ============================================================
// STG本体（縦スクロール・ボス戦）
// ============================================================
let stg = null;

function stgConfig() {
  const shotChar = player.equipped_shot;
  const specialChar = player.equipped_special;
  return {
    shotChar,
    specialChar,
    shotPower: shotChar ? kanjiPower(shotChar) : 5,       // 弾の威力
    specialPower: specialChar ? kanjiPower(specialChar) * 6 : 30 // 必殺の威力
  };
}

function startStg() {
  if (!player) return;
  showScreen('stgScreen');
  const canvas = document.getElementById('stgCanvas');
  const wrap = document.getElementById('stgWrap');
  // キャンバスサイズ（最大幅460、9:14比）
  const w = Math.min(wrap.clientWidth || 400, 440);
  const h = Math.round(w * 1.5);
  canvas.width = w; canvas.height = h;

  const cfg = stgConfig();
  stg = {
    canvas, ctx: canvas.getContext('2d'), w, h,
    running: true, raf: null, lastShot: 0,
    player: { x: w / 2, y: h - 60, r: 18 },
    bullets: [], enemyBullets: [], enemies: [], drops: [], particles: [],
    stage: player.max_stage || 1,
    score: 0,
    boss: null,
    specialReady: true, specialCooldown: 0,
    cfg,
    tick: 0, _invuln: 0
  };
  _lives = 3;
  document.getElementById('specialBtn').disabled = !cfg.specialChar;
  bindStgInput();
  spawnStage();
  loop();
}

function stopStg() {
  if (stg) { stg.running = false; if (stg.raf) cancelAnimationFrame(stg.raf); }
  unbindStgInput();
}

let _stgMove = null, _stgDown = null, _stgUp = null;
function bindStgInput() {
  const canvas = stg.canvas;
  const rect = () => canvas.getBoundingClientRect();
  let dragging = false;
  const pos = (e) => {
    const r = rect();
    const t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
  };
  _stgDown = (e) => { dragging = true; movePlayer(pos(e)); e.preventDefault(); };
  _stgMove = (e) => { if (dragging) { movePlayer(pos(e)); e.preventDefault(); } };
  _stgUp = () => { dragging = false; };
  canvas.addEventListener('touchstart', _stgDown, { passive: false });
  canvas.addEventListener('touchmove', _stgMove, { passive: false });
  canvas.addEventListener('touchend', _stgUp);
  canvas.addEventListener('mousedown', _stgDown);
  canvas.addEventListener('mousemove', _stgMove);
  window.addEventListener('mouseup', _stgUp);
}
function unbindStgInput() {
  if (!stg) return;
  const c = stg.canvas;
  c.removeEventListener('touchstart', _stgDown);
  c.removeEventListener('touchmove', _stgMove);
  c.removeEventListener('touchend', _stgUp);
  c.removeEventListener('mousedown', _stgDown);
  c.removeEventListener('mousemove', _stgMove);
  window.removeEventListener('mouseup', _stgUp);
}
function movePlayer(p) {
  if (!stg) return;
  stg.player.x = Math.max(stg.player.r, Math.min(stg.w - stg.player.r, p.x));
  stg.player.y = Math.max(stg.h * 0.4, Math.min(stg.h - stg.player.r, p.y));
}

// ステージ生成: 雑魚を数体 → 一定時間後ボス
function spawnStage() {
  stg.enemies = [];
  stg.boss = null;
  stg.tick = 0;
  const n = 3 + Math.min(stg.stage, 6);
  for (let i = 0; i < n; i++) {
    stg.enemies.push({
      x: (stg.w / (n + 1)) * (i + 1), y: -30 - i * 40, r: 16,
      hp: 3 + stg.stage, maxHp: 3 + stg.stage, vy: 0.6 + stg.stage * 0.05,
      char: '敵', fireT: 60 + Math.random() * 60
    });
  }
}

function spawnBoss() {
  const hp = 60 + stg.stage * 40;
  stg.boss = {
    x: stg.w / 2, y: 70, r: 42, hp, maxHp: hp,
    vx: 1.2 + stg.stage * 0.1, dir: 1, fireT: 40
  };
}

function loop() {
  if (!stg || !stg.running) return;
  const { ctx, w, h } = stg;
  stg.tick++;

  // 背景（流れる星）
  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 30; i++) {
    const y = (stg.tick * 2 + i * 47) % h;
    ctx.fillRect((i * 37) % w, y, 2, 2);
  }

  // 自動連射
  if (stg.tick - stg.lastShot >= 10) {
    stg.lastShot = stg.tick;
    stg.bullets.push({ x: stg.player.x, y: stg.player.y - 20, vy: -9, dmg: stg.cfg.shotPower });
  }

  updateEntities();
  draw();

  if (stg.specialCooldown > 0) {
    stg.specialCooldown--;
    if (stg.specialCooldown === 0) { stg.specialReady = true; document.getElementById('specialBtn').disabled = !stg.cfg.specialChar; }
  }

  document.getElementById('stgScore').textContent = 'SCORE ' + stg.score;
  document.getElementById('stgStage').textContent = 'STAGE ' + stg.stage;
  const bossHpEl = document.getElementById('bossHp');
  bossHpEl.style.width = stg.boss ? (Math.max(0, stg.boss.hp / stg.boss.maxHp) * 100) + '%' : '0%';

  stg.raf = requestAnimationFrame(loop);
}

function updateEntities() {
  const { w, h } = stg;

  // 自弾
  stg.bullets.forEach(b => b.y += b.vy);
  stg.bullets = stg.bullets.filter(b => b.y > -10);

  // 敵弾
  stg.enemyBullets.forEach(b => { b.x += b.vx || 0; b.y += b.vy; });
  stg.enemyBullets = stg.enemyBullets.filter(b => b.y < h + 10 && b.y > -10);

  // 雑魚
  stg.enemies.forEach(e => {
    e.y += e.vy;
    if (e.y > h - 100) e.vy = -Math.abs(e.vy) * 0.5; // 下に来すぎたら戻る
    e.fireT--;
    if (e.fireT <= 0 && e.y > 0 && e.y < h * 0.6) {
      e.fireT = 90 + Math.random() * 60;
      stg.enemyBullets.push({ x: e.x, y: e.y + e.r, vy: 3 + stg.stage * 0.1 });
    }
  });

  // 雑魚が全滅したらボス
  if (!stg.boss && stg.enemies.length === 0 && stg.tick > 30) spawnBoss();

  // ボス挙動
  if (stg.boss) {
    const bo = stg.boss;
    bo.x += bo.vx * bo.dir;
    if (bo.x < bo.r || bo.x > w - bo.r) bo.dir *= -1;
    bo.fireT--;
    if (bo.fireT <= 0) {
      bo.fireT = 45;
      // 3方向弾
      for (let a = -1; a <= 1; a++) {
        stg.enemyBullets.push({ x: bo.x, y: bo.y + bo.r, vx: a * 1.5, vy: 3.2 });
      }
    }
  }

  // 衝突: 自弾 vs 雑魚
  stg.bullets.forEach(b => {
    stg.enemies.forEach(e => {
      if (dist(b, e) < e.r) { e.hp -= b.dmg; b.dead = true; addParticle(b.x, b.y, '#ffd27f'); }
    });
    if (stg.boss && dist(b, stg.boss) < stg.boss.r) {
      stg.boss.hp -= b.dmg; b.dead = true; addParticle(b.x, b.y, '#ff8a65');
    }
  });
  stg.bullets = stg.bullets.filter(b => !b.dead);

  // 撃破処理
  stg.enemies.forEach(e => { if (e.hp <= 0) { stg.score += 10; addParticle(e.x, e.y, '#8be9fd'); } });
  stg.enemies = stg.enemies.filter(e => e.hp > 0);

  if (stg.boss && stg.boss.hp <= 0) {
    stg.score += 100 + stg.stage * 20;
    dropFromBoss(stg.boss.x, stg.boss.y);
    for (let i = 0; i < 12; i++) addParticle(stg.boss.x, stg.boss.y, '#ffd27f');
    stg.boss = null;
  }

  // ドロップ落下 + 取得
  stg.drops.forEach(d => { d.y += 1.5; });
  stg.drops = stg.drops.filter(d => {
    if (d.y > h + 20) return false;
    if (dist(d, stg.player) < stg.player.r + d.r) { collectDrop(d.char); return false; }
    return true;
  });

  // 敵弾 vs 自機（被弾でゲームオーバー: HP制ではなく1発でやられない緩さ→3回まで）
  if (stg._invuln > 0) stg._invuln--;
  stg.enemyBullets.forEach(b => {
    if (stg._invuln <= 0 && dist(b, stg.player) < stg.player.r) {
      b.dead = true; onPlayerHit();
    }
  });
  stg.enemyBullets = stg.enemyBullets.filter(b => !b.dead);

  // パーティクル
  stg.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
  stg.particles = stg.particles.filter(p => p.life > 0);
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function addParticle(x, y, color) {
  for (let i = 0; i < 5; i++) {
    stg.particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 20, color });
  }
}

let _lives = 3;
function onPlayerHit() {
  stg._invuln = 60;
  _lives--;
  addParticle(stg.player.x, stg.player.y, '#ff5252');
  if (_lives <= 0) endStg(false);
  else toast('あと ' + _lives + ' 回！');
}

// ボスがパーツをドロップ（is_part の中からランダム）
function dropFromBoss(x, y) {
  const parts = Object.values(MASTER).filter(m => m.is_part).map(m => m.char);
  if (parts.length === 0) return;
  const char = parts[Math.floor(Math.random() * parts.length)];
  stg.drops.push({ x, y, r: 16, char });
}

async function collectDrop(char) {
  addParticle(stg.player.x, stg.player.y, '#a0ff9f');
  // 手持ちに空きがあれば追加
  if (hand.length >= MAX_HAND) { toast('手持ちがいっぱい！ ' + char + ' はにげちゃった'); return; }
  const { data } = await client.from('kanji_inventory')
    .insert({ player_id: player.id, char, created_by_device: DEVICE_ID }).select().single();
  if (data) hand.push({ id: data.id, char: data.char });
  toast('🎁 ' + char + ' をゲット！');
  // ボス撃破後、次ステージへ
  clearStageAdvance();
}

function clearStageAdvance() {
  stg.stage++;
  if (stg.stage > (player.max_stage || 1)) {
    player.max_stage = stg.stage;
    client.from('kanji_players').update({ max_stage: stg.stage }).eq('id', player.id);
  }
  setTimeout(() => { if (stg && stg.running) spawnStage(); }, 800);
}

function fireSpecial() {
  if (!stg || !stg.running || !stg.specialReady || !stg.cfg.specialChar) return;
  stg.specialReady = false;
  stg.specialCooldown = 300; // 5秒
  document.getElementById('specialBtn').disabled = true;
  // 画面全体攻撃
  const dmg = stg.cfg.specialPower;
  stg.enemies.forEach(e => { e.hp -= dmg; addParticle(e.x, e.y, '#ff6ec7'); });
  if (stg.boss) { stg.boss.hp -= dmg; addParticle(stg.boss.x, stg.boss.y, '#ff6ec7'); }
  stg.enemyBullets = [];
  for (let i = 0; i < 30; i++) addParticle(Math.random() * stg.w, Math.random() * stg.h * 0.5, '#ff6ec7');
  toast('💥 ' + stg.cfg.specialChar + ' ひっさつ！');
}

async function endStg(cleared) {
  stg.running = false;
  if (stg.raf) cancelAnimationFrame(stg.raf);
  unbindStgInput();
  // ハイスコア更新
  if (stg.score > (player.best_score || 0)) {
    player.best_score = stg.score;
    await client.from('kanji_players').update({ best_score: stg.score }).eq('id', player.id);
  }
  const s = stg.score;
  _lives = 3;
  stg = null;
  alert('ゲームオーバー！\nスコア: ' + s);
  backToMenu();
}

// ------------------------------------------------------------
// 描画
// ------------------------------------------------------------
function draw() {
  const { ctx } = stg;
  // 自機（漢字 or ▲）
  ctx.save();
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (stg._invuln > 0 && Math.floor(stg.tick / 4) % 2) ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#7cf6ff';
  ctx.fillText(stg.cfg.shotChar || '自', stg.player.x, stg.player.y);
  ctx.restore();

  // 自弾
  ctx.fillStyle = '#ffe08a';
  stg.bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, 7); ctx.fill(); });

  // 敵弾
  ctx.fillStyle = '#ff6b6b';
  stg.enemyBullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill(); });

  // 雑魚
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  stg.enemies.forEach(e => {
    ctx.fillStyle = '#c792ea';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText('敵', e.x, e.y);
  });

  // ボス
  if (stg.boss) {
    const bo = stg.boss;
    ctx.fillStyle = '#ff5252';
    ctx.beginPath(); ctx.arc(bo.x, bo.y, bo.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif';
    ctx.fillText('鬼', bo.x, bo.y);
  }

  // ドロップ（漢字）
  ctx.font = 'bold 26px sans-serif';
  stg.drops.forEach(d => {
    ctx.fillStyle = 'rgba(160,255,159,0.25)';
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r + 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#a0ff9f'; ctx.fillText(d.char, d.x, d.y);
  });

  // パーティクル
  stg.particles.forEach(p => {
    ctx.globalAlpha = p.life / 20;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
    ctx.globalAlpha = 1;
  });
}
