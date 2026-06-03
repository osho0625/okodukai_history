// NotificationService - テスト完了通知（外部サービス連携）
// Supabase push_messages INSERT + Discord Webhook
// SUPABASE_URL, SUPABASE_KEY, DISCORD_WEBHOOK はグローバルスコープ（js/common.js）で定義済み

const _KanjiStorageNS = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
const { loadFromLocalStorage } = _KanjiStorageNS;

const PENDING_TESTS_KEY = 'kanji_pending_tests';

/**
 * テスト完了通知を送信する
 * handwritingCount > 0 の場合のみ通知を送信する
 * 通知失敗時はcatchしてスキップ（console.warnのみ）
 * @param {string} pendingTestId - 未採点テストID
 * @param {string} rangeName - テスト範囲名
 * @param {number} handwritingCount - 手書き回答件数
 * @returns {Promise<void>}
 */
async function notifyTestCompleted(pendingTestId, rangeName, handwritingCount) {
  if (handwritingCount <= 0) return;

  const title = '📝 漢字テスト採点依頼';
  const body = `未採点テストがあります 範囲: ${rangeName} 手書き回答: ${handwritingCount}件`;

  // Discord Webhook送信
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `${title}\n${body}` }),
    });
  } catch (e) {
    console.warn('Discord Webhook送信失敗:', e);
  }

  // Supabase push_messages INSERT
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/push_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        target_role: 'admin',
        title: title,
        body: body,
      }),
    });
    if (!response.ok) {
      console.warn('Supabase push_messages INSERT失敗:', response.status);
    }
  } catch (e) {
    console.warn('Supabase push_messages INSERT失敗:', e);
  }
}

/**
 * 未採点テスト件数を取得する（テスト単位）
 * @returns {number} PendingGradingTest[]の配列長
 */
function getPendingCount() {
  const tests = loadFromLocalStorage(PENDING_TESTS_KEY) || [];
  return tests.length;
}

// --- エクスポート ---

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    notifyTestCompleted,
    getPendingCount,
    _PENDING_TESTS_KEY: PENDING_TESTS_KEY,
  };
}
if (typeof window !== 'undefined') {
  window.NotificationService = { notifyTestCompleted, getPendingCount };
}
