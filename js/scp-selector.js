/**
 * SCP選択ロジック - 純粋関数モジュール
 * ブラウザ (window) と Node.js (module.exports) の両方で動作する
 */

/**
 * 簡易ハッシュ関数（djb2ベース）
 * @param {string} str - 入力文字列（例: "2026-06-03"）
 * @returns {number} 正の32bit整数ハッシュ値
 */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h & 0x7fffffff;
  }
  return h;
}

/**
 * 当日表示するSCPを選択する（日付固定・未読優先）
 * @param {Array<{id: string}>} scpData - SCP_DATA配列
 * @param {string[]} viewedIds - 閲覧済みIDリスト
 * @param {{date: string, id: string}|null} override - override設定（nullなら無し）
 * @param {string} todayStr - 当日日付 "YYYY-MM-DD"
 * @returns {string|null} 選択されたSCP ID（データ空ならnull）
 */
function selectScp(scpData, viewedIds, override, todayStr) {
  if (!scpData || scpData.length === 0) {
    return null;
  }

  var dataIds = scpData.map(function(s) { return s.id; });

  // Priority 1: override が当日日付かつIDがscpDataに存在
  if (override && override.date === todayStr && dataIds.indexOf(override.id) !== -1) {
    return override.id;
  }

  // Priority 2: 未閲覧SCPから日付シードで決定的に選択
  var unviewed = dataIds.filter(function(id) {
    return viewedIds.indexOf(id) === -1;
  });

  if (unviewed.length > 0) {
    var index = hash(todayStr) % unviewed.length;
    return unviewed[index];
  }

  // Priority 3: 全て閲覧済み → 全体から日付シードで選択
  var index = hash(todayStr) % dataIds.length;
  return dataIds[index];
}

/**
 * 閲覧済みリストにIDを追加（重複・無効ID拒否、入力を変更しない）
 * @param {string[]} viewedIds - 現在の閲覧済みIDリスト
 * @param {string} id - 追加するSCP ID
 * @param {Array<{id: string}>} scpData - SCP_DATA配列（無効ID拒否のため必須）
 * @returns {string[]} 更新後の閲覧済みIDリスト（新しい配列）
 */
function markViewed(viewedIds, id, scpData) {
  // scpDataに存在しないIDは拒否
  var dataIds = scpData.map(function(s) { return s.id; });
  if (dataIds.indexOf(id) === -1) {
    return viewedIds.slice();
  }

  // 重複拒否
  if (viewedIds.indexOf(id) !== -1) {
    return viewedIds.slice();
  }

  // 新しい配列を返す（入力を変更しない）
  return viewedIds.concat([id]);
}

/**
 * 読了率を計算する（純粋関数）
 * @param {Array<{id: string}>} scpData - SCP_DATA配列
 * @param {string[]} viewedIds - 閲覧済みIDリスト
 * @returns {number} 読了率（0.0〜1.0）
 */
function calcReadRate(scpData, viewedIds) {
  if (!scpData || scpData.length === 0) {
    return 0;
  }

  var dataIds = scpData.map(function(s) { return s.id; });
  var intersectionCount = viewedIds.filter(function(id) {
    return dataIds.indexOf(id) !== -1;
  }).length;

  return intersectionCount / scpData.length;
}

/**
 * SCPエントリのバリデーション
 * @param {object} entry - 検証対象エントリ
 * @returns {boolean} 有効ならtrue
 */
function validateScpEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  if (!entry.id || typeof entry.id !== 'string' || entry.id.length === 0) {
    return false;
  }
  if (!entry.number || typeof entry.number !== 'string' || entry.number.length === 0) {
    return false;
  }
  if (!entry.title || typeof entry.title !== 'string' || entry.title.length === 0) {
    return false;
  }
  if (!entry.url || typeof entry.url !== 'string' || !entry.url.startsWith('https://')) {
    return false;
  }
  return true;
}

// Dual export: browser (window) and Node.js (module.exports)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hash, selectScp, markViewed, calcReadRate, validateScpEntry };
}
