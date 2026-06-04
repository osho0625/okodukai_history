// NotificationService - テスト完了通知（外部サービス連携）
// Supabase push_messages INSERT + Discord Webhook
(function() {
'use strict';

var _Storage = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
var _loadFromLS = _Storage.loadFromLocalStorage;

var PENDING_TESTS_KEY = 'kanji_pending_tests';

async function notifyTestCompleted(pendingTestId, rangeName, handwritingCount) {
  if (handwritingCount <= 0) return;

  var title = '📝 漢字テスト採点依頼';
  var body = '未採点テストがあります 範囲: ' + rangeName + ' 手書き回答: ' + handwritingCount + '件';

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: title + '\n' + body }),
    });
  } catch (e) { console.warn('Discord Webhook送信失敗:', e); }

  try {
    await fetch(SUPABASE_URL + '/rest/v1/push_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify({ target_role: 'admin', title: title, body: body }),
    });
  } catch (e) { console.warn('Supabase push_messages INSERT失敗:', e); }
}

function getPendingCount() {
  var tests = _loadFromLS(PENDING_TESTS_KEY) || [];
  return tests.length;
}

// --- エクスポート ---
var exports = { notifyTestCompleted: notifyTestCompleted, getPendingCount: getPendingCount, _PENDING_TESTS_KEY: PENDING_TESTS_KEY };
if (typeof module !== 'undefined' && module.exports) { module.exports = exports; }
if (typeof window !== 'undefined') { window.NotificationService = exports; }
})();
