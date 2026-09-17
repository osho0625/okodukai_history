// ============================================================
// 漢字合体 -カンジニオン-（縦STG + 漢字合体パズル）
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
let RECIPE_BY_RESULT = {}; // result_char -> [ [parts...], ... ]（複数レシピ可）
let RECIPE_BY_PARTS = {};  // "a|b|c"(sorted) -> [result_char, ...]（選択式）

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
  RECIPE_BY_RESULT = {};
  RECIPE_BY_PARTS = {};
  RECIPES.forEach(rc => {
    const parts = recipeParts(rc);
    // 同じ結果に複数レシピを許す → 配列で保持
    (RECIPE_BY_RESULT[rc.result_char] = RECIPE_BY_RESULT[rc.result_char] || []).push(parts);
    // 同じ素材の組み合わせが複数結果を持つ場合がある（選択式）→ 配列で保持
    const k = partKey(parts);
    if (!RECIPE_BY_PARTS[k]) RECIPE_BY_PARTS[k] = [];
    if (!RECIPE_BY_PARTS[k].includes(rc.result_char)) RECIPE_BY_PARTS[k].push(rc.result_char);
  });
}

// recipeParts / partKey は js/kanji-blast.pure.js に唯一の実体があり、グローバル公開される。

// パーツ配列に含まれる最大画数（分解の優先度に使用）。実体は partsMaxStrokePure。
function partsMaxStroke(parts) {
  return partsMaxStrokePure(MASTER, parts);
}

// result_char の分解先レシピを1つ選ぶ。実体は chooseSplitRecipePure。
function chooseSplitRecipe(char) {
  return chooseSplitRecipePure(MASTER, RECIPE_BY_RESULT, char);
}

// ------------------------------------------------------------
// 画面遷移
// ------------------------------------------------------------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function backToMenu() { showScreen('menuScreen'); refreshMenu(); }

// 合体・分解 画面を開く
function openInv() { selected = []; showScreen('invScreen'); renderInventory(); }
// 装備・手持ち 画面を開く
function openEquip() { selected = []; showScreen('equipScreen'); renderInventory(); }

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
  hand = (inv || []).map(r => ({ id: r.id, char: r.char, plus: r.plus || 0 }));
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
// KENTEI_FACTOR / kenteiFactor は js/kanji-blast.pure.js に唯一の実体があり、グローバル公開される。

// 図鑑に登録済みの、その漢字の読み数。実体は unlockedReadingCountPure。
function unlockedReadingCount(char) {
  return unlockedReadingCountPure(dex, char);
}

// 図鑑に1つでも読みが登録された漢字の種類数（全体ボーナス用）。実体は dexCharCountPure。
function dexCharCount() {
  return dexCharCountPure(dex);
}

function overallBonus() {
  return overallBonusPure(dex);
}

// plus: 強化値（+値）。+1ごとに×1.05のバフ。実体は kanjiPowerPure。
function kanjiPower(char, plus) {
  return kanjiPowerPure(MASTER, dex, char, plus);
}

// +値の表示用（+0は空文字）
function plusLabel(plus) { return (plus && plus > 0) ? ('+' + plus) : ''; }

// ------------------------------------------------------------
// 読み仮名の判定
//   readings 各要素: {type, kana, display}
//   kana の "." は送り仮名の境界（例: "う.まれる"）。
//   入力は ひらがな化 + カタカナ化 の両方で照合し、
//   送り仮名あり/なし、活用ゆらぎ（まれる/まれた/む…）を許容する。
//   一致したら display（正規形）を返す。
// ------------------------------------------------------------
// toHira / toKata / normInput / readingParts / matchScore は js/kanji-blast.pure.js
// に唯一の実体があり、classic script としてグローバル公開される（本ファイルより前に読み込む）。

// 入力に一致する readings を探して、正規形 display を返す（無ければ null）。
// 実体は resolveReadingPure（pure.js）。ここは MASTER を渡す薄いラッパー。
function resolveReading(char, input) {
  return resolveReadingPure(MASTER, char, input);
}

// ------------------------------------------------------------
// メニュー表示
// ------------------------------------------------------------
function refreshMenu() {
  if (!player) return;
  document.getElementById('menuPlayerName').textContent = '🧒 ' + player.name;
  document.getElementById('menuStats').textContent =
    'ハイスコア ' + (player.best_score || 0) + ' ／ 図鑑 ' + dexCharCount() + '種類 ／ 手持ち ' + hand.length + '/' + MAX_HAND;
  setEquipDisplay('Shot', player.equipped_shot, player.equipped_shot_plus);
  setEquipDisplay('Special', player.equipped_special, player.equipped_special_plus);
}

function setEquipDisplay(slot, char, plus) {
  const p = plus || 0;
  document.getElementById('equip' + slot + 'Char').textContent = char ? (char + plusLabel(p)) : '-';
  document.getElementById('equip' + slot + 'Pow').textContent = char ? ('⚔ ' + kanjiPower(char, p)) : '';
}

// ------------------------------------------------------------
// 手持ち / 合体UI
// ------------------------------------------------------------
// アクティブな手持ち画面（invScreen=合体分解 / equipScreen=装備手持ち）の
// グリッド要素を返す。どちらも同じ hand/selected を共有する。
function activeInvGrid() {
  const equipScreen = document.getElementById('equipScreen');
  if (equipScreen && equipScreen.classList.contains('active')) {
    return document.getElementById('equipGrid');
  }
  return document.getElementById('invGrid');
}

function renderInventory() {
  const grid = activeInvGrid();
  if (!grid) return;
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
        (player.equipped_shot === item.char && (player.equipped_shot_plus || 0) === item.plus ? '🔫' : '') +
        (player.equipped_special === item.char && (player.equipped_special_plus || 0) === item.plus ? '💥' : '');
      cell.innerHTML =
        '<div class="kc-badge">' + equipBadge + '</div>' +
        '<div class="kc-char">' + item.char + '<span style="font-size:0.5em;color:#ffa94d;">' + plusLabel(item.plus) + '</span></div>' +
        '<div class="kc-pow">⚔' + kanjiPower(item.char, item.plus) + '</div>';
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
    if (selected.length >= 3) selected.shift(); // 最大3つ
    selected.push(id);
  }
  renderInventory();
}

function selectedChars() {
  return selected.map(id => (hand.find(h => h.id === id) || {}).char).filter(Boolean);
}

function selectedItems() {
  return selected.map(id => hand.find(h => h.id === id)).filter(Boolean);
}

// 合成後の+値 = 素材の+合計 + 1、plus_cap で上限クリップ。実体は mergedPlusPure。
function mergedPlus(items) {
  return mergedPlusPure(items, (player && player.plus_cap) || 3);
}

// splitPlus は js/kanji-blast.pure.js に唯一の実体があり、グローバル公開される。

function updateRecipePreview() {
  const pv = document.getElementById('recipePreview');
  if (!pv) return; // 装備画面にはプレビュー欄が無い
  const items = selectedItems();
  const chars = items.map(it => it.char);
  if (items.length >= 2) {
    const results = RECIPE_BY_PARTS[partKey(chars)];
    const joined = items.map(it => it.char + plusLabel(it.plus)).join(' ＋ ');
    if (results && results.length) {
      const np = mergedPlus(items);
      const outs = results.map(r => r + plusLabel(np) + '（⚔' + kanjiPower(r, np) + '）').join(' / ');
      pv.textContent = joined + ' → ' + outs + (results.length > 1 ? '（えらべる）' : '');
    } else {
      pv.textContent = joined + ' → ？（レシピなし）';
    }
  } else if (items.length === 1) {
    const rc = chooseSplitRecipe(chars[0]);
    if (rc) {
      const sp = splitPlus(items[0].plus, rc.length);
      pv.textContent = chars[0] + plusLabel(items[0].plus) + ' → ' + rc.map(c => c + plusLabel(sp)).join(' ＋ ') + ' に分解できる';
    } else {
      pv.textContent = chars[0] + '（これ以上分解できない）';
    }
  } else {
    pv.textContent = '';
  }
}

function updateInvButtons() {
  const chars = selectedChars();
  const multi = chars.length >= 2;
  const one = chars.length === 1;
  const results = multi ? RECIPE_BY_PARTS[partKey(chars)] : null;
  // 合体・分解ボタンと装備・にがすボタンは別画面に分かれているため、
  // 存在するものだけを更新する（null 安全）。
  const setDisabled = (id, disabled) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  };
  setDisabled('btnMerge', !(results && results.length));
  setDisabled('btnSplit', !(one && chooseSplitRecipe(chars[0])));
  setDisabled('btnEquipShot', !one);
  setDisabled('btnEquipSpecial', !one);
  setDisabled('btnRelease', !one);
}

// 合体: 選択した素材（2〜3）を消して結果1つを追加。
// 同じ組み合わせで複数結果がある場合は選択式。+値 = 素材+合計+1（上限クリップ）。
async function doMerge() {
  const items = selectedItems();
  if (items.length < 2) return;
  const chars = items.map(it => it.char);
  const results = RECIPE_BY_PARTS[partKey(chars)];
  if (!results || !results.length) { toast('このくみあわせは合体できないよ'); return; }

  let result = results[0];
  if (results.length > 1) {
    result = pickMergeResult(results); // 選択UI
    if (!result) return; // キャンセル
  }
  const np = mergedPlus(items);
  const ids = selected.slice();
  await client.from('kanji_inventory').delete().in('id', ids);
  const { data } = await client.from('kanji_inventory')
    .insert({ player_id: player.id, char: result, plus: np, created_by_device: DEVICE_ID })
    .select().single();
  hand = hand.filter(h => !ids.includes(h.id));
  if (data) hand.push({ id: data.id, char: data.char, plus: data.plus || 0 });
  selected = [];
  toast('🎉 ' + result + plusLabel(np) + ' ができた！');
  renderInventory();
}

// 複数結果からどれを作るか選ばせる（シンプルにconfirm連鎖 or prompt）
function pickMergeResult(results) {
  // 例: 「二」か「十」→ 数字で選択
  const msg = 'どれを作る？\n' + results.map((r, i) => (i + 1) + ': ' + r).join('\n') + '\n\n番号を入力してね';
  const ans = prompt(msg, '1');
  if (ans === null) return null;
  const idx = parseInt(ans, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= results.length) { toast('番号がちがうよ'); return null; }
  return results[idx];
}

// 分解: 選択1つを素材（2〜3）に戻す。+値は (結果+ - 1)/素材数 を端数切り捨てで配分。
async function doSplit() {
  const items = selectedItems();
  if (items.length !== 1) return;
  const src = items[0];
  const parts = chooseSplitRecipe(src.char); // 画数が大きいパーツを含むレシピを優先
  if (!parts) { toast('これ以上分解できないよ'); return; }
  // 1つ消えて parts.length 個増える → 差分（parts.length - 1）ぶん空きが要る
  if (hand.length - 1 + parts.length > MAX_HAND) {
    toast('手持ちがいっぱい。分解すると' + (parts.length - 1) + 'つ増えるよ');
    return;
  }
  const sp = splitPlus(src.plus, parts.length);
  const id = src.id;
  await client.from('kanji_inventory').delete().eq('id', id);
  const rows = parts.map(c => ({ player_id: player.id, char: c, plus: sp, created_by_device: DEVICE_ID }));
  const { data } = await client.from('kanji_inventory').insert(rows).select();
  hand = hand.filter(h => h.id !== id);
  (data || []).forEach(d => hand.push({ id: d.id, char: d.char, plus: d.plus || 0 }));
  selected = [];
  toast('🔨 ' + parts.map(c => c + plusLabel(sp)).join(' と ') + ' にわけた');
  renderInventory();
}

// 装備（char と +値の両方を保存）
async function doEquip(slot) {
  const items = selectedItems();
  if (items.length !== 1) return;
  const it = items[0];
  const col = slot === 'shot' ? 'equipped_shot' : 'equipped_special';
  const pcol = col + '_plus';
  const upd = {}; upd[col] = it.char; upd[pcol] = it.plus || 0;
  await client.from('kanji_players').update(upd).eq('id', player.id);
  player[col] = it.char; player[pcol] = it.plus || 0;
  toast((slot === 'shot' ? '🔫' : '💥') + ' ' + it.char + plusLabel(it.plus) + ' をそうびした');
  renderInventory();
}

// にがす
async function doRelease() {
  const items = selectedItems();
  if (items.length !== 1) return;
  const item = items[0];
  const id = item.id;
  if (!confirm(item.char + plusLabel(item.plus) + ' をにがす？')) return;
  await client.from('kanji_inventory').delete().eq('id', id);
  // 同じ char+plus の在庫がこれ1枚だけなら、装備からも外す
  const sameStock = hand.filter(h => h.char === item.char && h.plus === item.plus).length;
  const upd = {};
  if (player.equipped_shot === item.char && (player.equipped_shot_plus || 0) === item.plus && sameStock <= 1) {
    upd.equipped_shot = null; upd.equipped_shot_plus = 0;
  }
  if (player.equipped_special === item.char && (player.equipped_special_plus || 0) === item.plus && sameStock <= 1) {
    upd.equipped_special = null; upd.equipped_special_plus = 0;
  }
  if (Object.keys(upd).length) { await client.from('kanji_players').update(upd).eq('id', player.id); Object.assign(player, upd); }
  hand = hand.filter(h => h.id !== id);
  selected = [];
  toast('👋 ' + item.char + plusLabel(item.plus) + ' をにがした');
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
  const shotPlus = player.equipped_shot_plus || 0;
  const specialChar = player.equipped_special;
  const specialPlus = player.equipped_special_plus || 0;
  return {
    shotChar, shotPlus,
    specialChar, specialPlus,
    shotPower: shotChar ? kanjiPower(shotChar, shotPlus) : 5,             // 弾の威力
    specialPower: specialChar ? kanjiPower(specialChar, specialPlus) * 6 : 30 // 必殺の威力
  };
}

// フロアボス判定: 5ステージごと（5,10,15…）が強ボス
function isFloorBossStage(stage) { return stage % 5 === 0; }

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
  stg.lastShot = 0; // tick を 0 に戻すので lastShot も同期（次ステージで連射が止まるバグ対策）
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
  const floor = isFloorBossStage(stg.stage);
  const hp = (60 + stg.stage * 40) * (floor ? 2.2 : 1);
  stg.boss = {
    x: stg.w / 2, y: 70, r: floor ? 52 : 42, hp, maxHp: hp,
    vx: (1.2 + stg.stage * 0.1) * (floor ? 1.3 : 1), dir: 1, fireT: 40,
    floor
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
    const wasFloor = stg.boss.floor;
    stg.score += (100 + stg.stage * 20) * (wasFloor ? 2 : 1);
    dropFromBoss(stg.boss.x, stg.boss.y, wasFloor);
    for (let i = 0; i < (wasFloor ? 24 : 12); i++) addParticle(stg.boss.x, stg.boss.y, wasFloor ? '#ff6ec7' : '#ffd27f');
    stg.boss = null;
    if (wasFloor) raisePlusCap();
  }

  // ドロップ落下 + 取得
  stg.drops.forEach(d => { d.y += 1.5; });
  stg.drops = stg.drops.filter(d => {
    if (d.y > h + 20) return false;
    if (dist(d, stg.player) < stg.player.r + d.r) { collectDrop(d.char, d.floor); return false; }
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

// ボスがドロップ:
//  - 通常ボス: 基本パーツ（is_part=true）からランダム
//  - フロアボス: 合成漢字（is_part=false）。ステージが進むほど画数の高い漢字を落とす
function dropFromBoss(x, y, floor) {
  let pool;
  if (floor) {
    pool = Object.values(MASTER).filter(m => !m.is_part);
    if (pool.length === 0) pool = Object.values(MASTER).filter(m => m.is_part);
    // ステージ進行で解禁する画数上限（stage5→~10画, stage10→~14画 …）
    const strokeCap = 6 + Math.floor(stg.stage / 5) * 4;
    const filtered = pool.filter(m => m.strokes <= strokeCap);
    if (filtered.length) pool = filtered;
    // 画数の高いものを優先的に（後半ほど強い）
    pool.sort((a, b) => b.strokes - a.strokes);
    // 上位1/3から抽選
    const top = pool.slice(0, Math.max(1, Math.ceil(pool.length / 3)));
    pool = top;
  } else {
    pool = Object.values(MASTER).filter(m => m.is_part);
  }
  if (!pool.length) return;
  const char = pool[Math.floor(Math.random() * pool.length)].char;
  stg.drops.push({ x, y, r: 16, char, floor: !!floor });
}

async function collectDrop(char, floor) {
  addParticle(stg.player.x, stg.player.y, '#a0ff9f');
  if (hand.length >= MAX_HAND) { toast('手持ちがいっぱい！ ' + char + ' はにげちゃった'); return; }
  // フロアボスの合成漢字ドロップは +1 付きで手に入る（ちょっと強い）
  const dropPlus = floor ? Math.min(1, (player.plus_cap || 3)) : 0;
  const { data } = await client.from('kanji_inventory')
    .insert({ player_id: player.id, char, plus: dropPlus, created_by_device: DEVICE_ID }).select().single();
  if (data) hand.push({ id: data.id, char: data.char, plus: data.plus || 0 });
  toast('🎁 ' + char + plusLabel(dropPlus) + ' をゲット！');
  clearStageAdvance();
}

// フロアボス撃破で+値の上限を1上げる
async function raisePlusCap() {
  player.plus_cap = (player.plus_cap || 3) + 1;
  await client.from('kanji_players').update({ plus_cap: player.plus_cap }).eq('id', player.id);
  toast('⭐ フロアボス撃破！ +の上限が ' + player.plus_cap + ' になった！');
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

  // ボス（フロアボスは紫で大きく、文字は「王」）
  if (stg.boss) {
    const bo = stg.boss;
    ctx.fillStyle = bo.floor ? '#b14dff' : '#ff5252';
    ctx.beginPath(); ctx.arc(bo.x, bo.y, bo.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (bo.floor ? 48 : 40) + 'px sans-serif';
    ctx.fillText(bo.floor ? '王' : '鬼', bo.x, bo.y);
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
