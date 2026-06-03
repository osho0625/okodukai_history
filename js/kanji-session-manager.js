// SessionManager - テストセッションの永続化（DOM非依存）
// localStorage キー: kanji_test_session

const _KanjiStorage = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
const { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } = _KanjiStorage;

const SESSION_KEY = 'kanji_test_session';

/**
 * セッションをlocalStorageに保存する
 * @param {object} session - QuizSession
 * @returns {boolean} 保存成功時true
 */
function saveSession(session) {
  const result = saveToLocalStorage(SESSION_KEY, session);
  return result.success;
}

/**
 * 保存済みセッションを読み込む
 * パースエラー時はキーを削除してnullを返す
 * @returns {object|null} QuizSession または null
 */
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === null) return null;
    const session = JSON.parse(raw);
    return session;
  } catch {
    // パースエラー時はキーを削除
    removeFromLocalStorage(SESSION_KEY);
    return null;
  }
}

/**
 * セッションを削除する
 */
function clearSession() {
  removeFromLocalStorage(SESSION_KEY);
}

// --- エクスポート ---

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveSession,
    loadSession,
    clearSession,
    _SESSION_KEY: SESSION_KEY,
  };
}
if (typeof window !== 'undefined') {
  window.SessionManager = { saveSession, loadSession, clearSession };
}
