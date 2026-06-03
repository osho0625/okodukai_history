// kanji-storage.js - localStorage容量超過対策ラッパー
(function() {
'use strict';

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: e.message || '保存に失敗しました' };
  }
}

function loadFromLocalStorage(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

var exports = { saveToLocalStorage: saveToLocalStorage, loadFromLocalStorage: loadFromLocalStorage, removeFromLocalStorage: removeFromLocalStorage };
if (typeof module !== 'undefined' && module.exports) { module.exports = exports; }
if (typeof window !== 'undefined') { window.KanjiStorage = exports; }
})();
