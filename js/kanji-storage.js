// kanji-storage.js - localStorage容量超過対策ラッパー
// 全localStorage操作をtry-catchでラップし、QuotaExceededError時にエラー情報を返す
// 未採点データ（PendingGradingTest, StrokesStore）は自動削除しない

/**
 * localStorageにデータを保存する（容量超過対策付き）
 * @param {string} key - localStorageキー
 * @param {*} data - 保存するデータ（JSON.stringifyされる）
 * @returns {{success: boolean, error: string|null}} 保存結果
 */
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true, error: null };
  } catch (e) {
    // QuotaExceededError or other write errors
    return { success: false, error: e.message || '保存に失敗しました' };
  }
}

/**
 * localStorageからデータを読み込む
 * @param {string} key - localStorageキー
 * @returns {*|null} パースされたデータ、または失敗時null
 */
function loadFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * localStorageからキーを削除する
 * @param {string} key - localStorageキー
 */
function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

// --- エクスポート ---

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
  };
}
if (typeof window !== 'undefined') {
  window.KanjiStorage = { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage };
}
