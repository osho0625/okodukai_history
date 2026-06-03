// KanjiRegistry - 漢字データのCRUD管理（DOM非依存）
// localStorage キー: kanji_ranges, kanji_entries_{rangeId}
(function() {
'use strict';

var RANGES_KEY = 'kanji_ranges';
var ENTRIES_KEY_PREFIX = 'kanji_entries_';

// --- ヘルパー ---

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function isBlank(str) {
  return typeof str !== 'string' || str.trim().length === 0;
}

function loadRanges() {
  try {
    const raw = localStorage.getItem(RANGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRanges(ranges) {
  localStorage.setItem(RANGES_KEY, JSON.stringify(ranges));
}

function loadEntries(rangeId) {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY_PREFIX + rangeId);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(rangeId, entries) {
  localStorage.setItem(ENTRIES_KEY_PREFIX + rangeId, JSON.stringify(entries));
}

// --- TestRange CRUD ---

/**
 * 新しいテスト範囲を作成する
 * @param {string} name - 範囲名
 * @returns {object|null} 作成されたTestRange、またはバリデーション失敗時null
 */
function getDeviceId() {
  return localStorage.getItem('push_device_id') || '';
}

function createRange(name) {
  if (isBlank(name)) return null;

  const range = {
    id: generateId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    createdBy: getDeviceId(),
  };

  const ranges = loadRanges();
  ranges.push(range);
  saveRanges(ranges);

  return range;
}

/**
 * テスト範囲名を更新する
 * @param {string} id - 範囲ID
 * @param {string} name - 新しい範囲名
 * @returns {boolean} 成功時true
 */
function updateRange(id, name) {
  if (isBlank(name)) return false;

  const ranges = loadRanges();
  const index = ranges.findIndex(r => r.id === id);
  if (index === -1) return false;

  ranges[index].name = name.trim();
  saveRanges(ranges);

  return true;
}

/**
 * テスト範囲を削除する（所属エントリも削除）
 * @param {string} id - 範囲ID
 * @returns {boolean} 成功時true
 */
function deleteRange(id) {
  const ranges = loadRanges();
  const index = ranges.findIndex(r => r.id === id);
  if (index === -1) return false;

  ranges.splice(index, 1);
  saveRanges(ranges);

  // 所属エントリも削除
  localStorage.removeItem(ENTRIES_KEY_PREFIX + id);

  return true;
}

/**
 * 全テスト範囲を取得する
 * @returns {object[]} TestRange配列
 */
function getAllRanges() {
  return loadRanges();
}

// --- KanjiEntry CRUD ---

/**
 * 漢字エントリを追加する
 * @param {string} rangeId - 所属範囲ID
 * @param {string} reading - 読み仮名
 * @param {string} answer - 正解漢字
 * @returns {object|null} 作成されたKanjiEntry、またはバリデーション失敗時null
 */
function addEntry(rangeId, reading, answer) {
  if (isBlank(reading) || isBlank(answer)) return null;

  // rangeIdの存在確認
  const ranges = loadRanges();
  if (!ranges.some(r => r.id === rangeId)) return null;

  const entry = {
    id: generateId(),
    rangeId: rangeId,
    reading: reading.trim(),
    answer: answer.trim(),
  };

  const entries = loadEntries(rangeId);
  entries.push(entry);
  saveEntries(rangeId, entries);

  return entry;
}

/**
 * 漢字エントリを削除する
 * @param {string} rangeId - 所属範囲ID
 * @param {string} entryId - エントリID
 * @returns {boolean} 成功時true
 */
function deleteEntry(rangeId, entryId) {
  const entries = loadEntries(rangeId);
  const index = entries.findIndex(e => e.id === entryId);
  if (index === -1) return false;

  entries.splice(index, 1);
  saveEntries(rangeId, entries);

  return true;
}

/**
 * 指定範囲の全エントリを取得する
 * @param {string} rangeId - 範囲ID
 * @returns {object[]} KanjiEntry配列
 */
function getEntriesByRange(rangeId) {
  return loadEntries(rangeId);
}

// --- 一括登録 ---

/**
 * "読み仮名,漢字" 形式の改行区切りテキストをパースする
 * @param {string} text - 改行区切りのテキスト
 * @returns {{reading: string, answer: string}[]} パース結果
 */
function parseBulkInput(text) {
  if (typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/);
  const results = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const commaIndex = trimmed.indexOf(',');
    if (commaIndex === -1) continue;

    const reading = trimmed.slice(0, commaIndex).trim();
    const answer = trimmed.slice(commaIndex + 1).trim();

    if (reading === '' || answer === '') continue;

    results.push({ reading, answer });
  }

  return results;
}

/**
 * 一括テキストをパースして指定範囲にエントリを追加する
 * @param {string} rangeId - 所属範囲ID
 * @param {string} text - 改行区切りの "読み仮名,漢字" テキスト
 * @returns {object[]} 追加されたKanjiEntry配列
 */
function addEntriesBulk(rangeId, text) {
  const parsed = parseBulkInput(text);
  const added = [];

  for (const { reading, answer } of parsed) {
    const entry = addEntry(rangeId, reading, answer);
    if (entry) {
      added.push(entry);
    }
  }

  return added;
}

// --- エクスポート/インポート ---

/**
 * 全データをJSON文字列でエクスポートする
 * @returns {string} JSON文字列（ranges + entries）
 */
function exportAllData() {
  const ranges = loadRanges();
  const data = {
    ranges: ranges,
    entries: {},
  };

  for (const range of ranges) {
    data.entries[range.id] = loadEntries(range.id);
  }

  return JSON.stringify(data);
}

/**
 * JSONデータをインポートする
 * @param {string} json - JSON文字列
 * @param {'overwrite' | 'rename'} conflictStrategy - 同名範囲コンフリクト時の戦略
 * @returns {{imported: number, skipped: number, errors: string[]}} インポート結果
 */
function importData(json, conflictStrategy) {
  const result = { imported: 0, skipped: 0, errors: [] };

  let data;
  try {
    data = JSON.parse(json);
  } catch (e) {
    result.errors.push('JSONパースエラー: ' + e.message);
    return result;
  }

  if (!data || !Array.isArray(data.ranges)) {
    result.errors.push('不正なデータ形式です');
    return result;
  }

  const existingRanges = loadRanges();

  for (const importedRange of data.ranges) {
    if (!importedRange || isBlank(importedRange.name)) {
      result.skipped++;
      continue;
    }

    const importedEntries = (data.entries && data.entries[importedRange.id]) || [];
    const conflictRange = existingRanges.find(r => r.name === importedRange.name.trim());

    if (conflictRange) {
      if (conflictStrategy === 'overwrite') {
        // 既存のEntryを全削除して置換
        saveEntries(conflictRange.id, importedEntries.map(e => ({
          id: e.id || generateId(),
          rangeId: conflictRange.id,
          reading: (e.reading || '').trim(),
          answer: (e.answer || '').trim(),
        })).filter(e => e.reading !== '' && e.answer !== ''));
        result.imported++;
      } else if (conflictStrategy === 'rename') {
        // 別名で保存
        let newName = importedRange.name.trim();
        const allRanges = loadRanges();
        let suffix = 1;
        while (allRanges.some(r => r.name === newName + ' (' + suffix + ')')) {
          suffix++;
        }
        newName = newName + ' (' + suffix + ')';

        const newRange = createRange(newName);
        if (newRange) {
          for (const entry of importedEntries) {
            if (!isBlank(entry.reading) && !isBlank(entry.answer)) {
              addEntry(newRange.id, entry.reading.trim(), entry.answer.trim());
            }
          }
          result.imported++;
        } else {
          result.skipped++;
        }
      }
    } else {
      // コンフリクトなし → 新規作成
      const newRange = createRange(importedRange.name.trim());
      if (newRange) {
        for (const entry of importedEntries) {
          if (!isBlank(entry.reading) && !isBlank(entry.answer)) {
            addEntry(newRange.id, entry.reading.trim(), entry.answer.trim());
          }
        }
        result.imported++;
      } else {
        result.skipped++;
      }
    }
  }

  return result;
}

/**
 * この範囲を削除できるか判定する（作成者 or admin）
 * @param {string} rangeId - 範囲ID
 * @returns {boolean}
 */
function canDeleteRange(rangeId) {
  if (localStorage.getItem('deviceRole') === 'admin') return true;
  const ranges = loadRanges();
  const range = ranges.find(r => r.id === rangeId);
  if (!range) return false;
  const deviceId = getDeviceId();
  // createdByが未設定（旧データ）の場合は削除不可
  if (!range.createdBy || !deviceId) return false;
  return range.createdBy === deviceId;
}

// --- エクスポート ---

var _exports = {
  createRange: createRange, updateRange: updateRange, deleteRange: deleteRange, getAllRanges: getAllRanges,
  canDeleteRange: canDeleteRange,
  addEntry: addEntry, deleteEntry: deleteEntry, getEntriesByRange: getEntriesByRange,
  parseBulkInput: parseBulkInput, addEntriesBulk: addEntriesBulk, exportAllData: exportAllData, importData: importData,
  _isBlank: isBlank, _RANGES_KEY: RANGES_KEY, _ENTRIES_KEY_PREFIX: ENTRIES_KEY_PREFIX,
};
if (typeof module !== 'undefined' && module.exports) { module.exports = _exports; }
if (typeof window !== 'undefined') { window.KanjiRegistry = _exports; }
})();
