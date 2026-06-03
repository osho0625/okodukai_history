// SessionManager - テストセッションの永続化（DOM非依存）
// localStorage キー: kanji_test_session
(function() {
'use strict';

var _Storage = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
var _saveToLS = _Storage.saveToLocalStorage;
var _removeFromLS = _Storage.removeFromLocalStorage;

var SESSION_KEY = 'kanji_test_session';

function saveSession(session) {
  var result = _saveToLS(SESSION_KEY, session);
  return result.success;
}

function loadSession() {
  try {
    var raw = localStorage.getItem(SESSION_KEY);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    _removeFromLS(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  _removeFromLS(SESSION_KEY);
}

// --- エクスポート ---
var exports = { saveSession: saveSession, loadSession: loadSession, clearSession: clearSession, _SESSION_KEY: SESSION_KEY };
if (typeof module !== 'undefined' && module.exports) { module.exports = exports; }
if (typeof window !== 'undefined') { window.SessionManager = exports; }
})();
