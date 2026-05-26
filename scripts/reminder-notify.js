// reminder-notify.js
// GitHub Actions Cron (every 5 minutes) から実行されるリマインダー通知スクリプト
// Node.js 20+ native fetch を使用（外部依存なし）
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key
//   DISCORD_WEBHOOK - Discord Webhook URL

// ============================================================
// Pure functions (exported for testing)
// ============================================================

/**
 * メッセージバリデーション
 * @param {string} msg - 入力メッセージ
 * @returns {boolean} trimmed length が 1-200 なら true
 */
function validateMessage(msg) {
  if (typeof msg !== 'string') return false;
  const trimmed = msg.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

/**
 * イベント日付バリデーション
 * @param {string} dateStr - 'YYYY-MM-DD' 形式の日付
 * @param {string} todayStr - 'YYYY-MM-DD' 形式の今日の日付 (JST)
 * @returns {boolean} 日付が今日以降なら true
 */
function validateEventDate(dateStr, todayStr) {
  if (!dateStr || !todayStr) return false;
  return dateStr >= todayStr;
}

/**
 * 5分ウィンドウ判定
 * scheduled <= now < scheduled + 5
 * @param {string} scheduledHHMM - 'HH:MM' 形式のスケジュール時刻
 * @param {string} nowHHMM - 'HH:MM' 形式の現在時刻
 * @returns {boolean}
 */
function isInWindow(scheduledHHMM, nowHHMM) {
  const scheduled = parseMinutes(scheduledHHMM);
  const current = parseMinutes(nowHHMM);
  if (scheduled === null || current === null) return false;
  return current >= scheduled && current < scheduled + 5;
}

/**
 * HH:MM を分に変換
 * @param {string} hhmm - 'HH:MM' 形式
 * @returns {number|null} 0-1439 の分数、無効なら null
 */
function parseMinutes(hhmm) {
  if (typeof hhmm !== 'string') return null;
  const match = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * custom_schedule バリデーション
 * @param {*} schedule - JSONB値
 * @returns {boolean} HH:MM文字列の非空配列なら true
 */
function validateCustomSchedule(schedule) {
  if (!Array.isArray(schedule)) return false;
  if (schedule.length === 0) return false;
  return schedule.every(item => {
    if (typeof item !== 'string') return false;
    const match = item.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  });
}

/**
 * スヌーズ終了日を計算
 * @param {string} todayStr - 'YYYY-MM-DD' 形式の今日の日付 (JST)
 * @param {number} days - スヌーズ日数（正整数）
 * @returns {string} 'YYYY-MM-DD' 形式のスヌーズ終了日
 */
function calculateSnoozeUntil(todayStr, days) {
  const date = new Date(todayStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 通知対象リマインダーをフィルタ
 * @param {Array} reminders - リマインダー配列
 * @param {{dateStr: string, timeStr: string}} now - 現在のJST日時
 *   dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM'
 * @returns {Array} 通知対象のリマインダー配列
 */
function filterDueReminders(reminders, now) {
  const { dateStr, timeStr } = now;

  return reminders.filter(r => {
    // (a) deleted_at is NULL
    if (r.deleted_at != null) return false;

    // (b) スヌーズチェック: current_jst_date < snooze_until ならスキップ
    if (r.snooze_until && dateStr < r.snooze_until) return false;

    // (c)(d) タイプ別ウィンドウ判定
    if (r.type === 'event') {
      // event_date が過去ならスキップ
      if (r.event_date < dateStr) return false;
      // event_date - 7日 <= today <= event_date
      const eventDate = new Date(r.event_date + 'T00:00:00');
      const sevenDaysBefore = new Date(eventDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      const sevenDaysBeforeStr = formatDateStr(sevenDaysBefore);
      if (dateStr < sevenDaysBeforeStr || dateStr > r.event_date) return false;
    }
    // memo type: always in notification window (no date filter)

    // (e) 時間ウィンドウ判定
    const schedules = (r.custom_schedule && Array.isArray(r.custom_schedule) && r.custom_schedule.length > 0)
      ? r.custom_schedule
      : ['07:50', '17:30'];

    const inTimeWindow = schedules.some(s => isInWindow(s, timeStr));
    if (!inTimeWindow) return false;

    return true;
  });
}

/**
 * Date オブジェクトを 'YYYY-MM-DD' に変換
 * @param {Date} date
 * @returns {string}
 */
function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Discord メッセージをフォーマット
 * @param {Array} reminders - 通知対象リマインダー配列
 * @param {string} todayStr - 'YYYY-MM-DD' 形式の今日の日付 (JST)
 * @returns {string} Discord メッセージ
 */
function formatMessage(reminders, todayStr) {
  if (!reminders || reminders.length === 0) return '';

  const memos = reminders.filter(r => r.type === 'memo');
  const events = reminders.filter(r => r.type === 'event');

  let msg = '🔔 リマインダー通知\n';

  if (memos.length > 0) {
    msg += '\n📝 メモ:\n';
    memos.forEach(r => {
      msg += `• [${r.child_name}] ${r.message}\n`;
    });
  }

  if (events.length > 0) {
    msg += '\n📅 行事:\n';
    events.forEach(r => {
      const daysRemaining = calcDaysRemaining(r.event_date, todayStr);
      const eventMonth = parseInt(r.event_date.split('-')[1], 10);
      const eventDay = parseInt(r.event_date.split('-')[2], 10);
      msg += `• [${r.child_name}] ${r.message}（あと${daysRemaining}日 - ${eventMonth}/${eventDay}）\n`;
    });
  }

  return msg.trim();
}

/**
 * 残り日数を計算
 * @param {string} eventDateStr - 'YYYY-MM-DD'
 * @param {string} todayStr - 'YYYY-MM-DD'
 * @returns {number}
 */
function calcDaysRemaining(eventDateStr, todayStr) {
  const event = new Date(eventDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diff = event.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ============================================================
// Main execution (only runs when called directly)
// ============================================================

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

  if (!SUPABASE_URL || !SUPABASE_KEY || !DISCORD_WEBHOOK) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY, DISCORD_WEBHOOK');
    process.exit(1);
  }

  // 現在のJST時刻を取得
  const now = getCurrentJST();
  console.log(`Current JST: ${now.dateStr} ${now.timeStr}`);

  // Supabase REST API でアクティブリマインダーを取得
  const reminders = await fetchActiveReminders(SUPABASE_URL, SUPABASE_KEY);
  console.log(`Fetched ${reminders.length} active reminders`);

  // 通知対象をフィルタ
  const due = filterDueReminders(reminders, now);
  console.log(`Due reminders: ${due.length}`);

  if (due.length === 0) {
    console.log('No reminders due at this time. Exiting.');
    return;
  }

  // メッセージをフォーマット
  const message = formatMessage(due, now.dateStr);

  // Discord通知
  console.log('Sending Discord notification...');
  await sendDiscord(DISCORD_WEBHOOK, message);

  // Web Push通知
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    console.log('Sending Web Push notifications...');
    await sendWebPush(SUPABASE_URL, SUPABASE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL, due, now.dateStr);
  } else {
    console.log('VAPID keys not configured, skipping Web Push.');
  }

  console.log('Done.');
}

/**
 * 現在のJST日時を取得
 * @returns {{dateStr: string, timeStr: string}}
 */
function getCurrentJST() {
  const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
  const jstDate = new Date(nowStr);
  const y = jstDate.getFullYear();
  const mo = String(jstDate.getMonth() + 1).padStart(2, '0');
  const d = String(jstDate.getDate()).padStart(2, '0');
  const h = String(jstDate.getHours()).padStart(2, '0');
  const mi = String(jstDate.getMinutes()).padStart(2, '0');
  return {
    dateStr: `${y}-${mo}-${d}`,
    timeStr: `${h}:${mi}`
  };
}

/**
 * Supabase REST API でアクティブリマインダーを取得
 * @param {string} url - Supabase URL
 * @param {string} key - Supabase Key
 * @returns {Promise<Array>}
 */
async function fetchActiveReminders(url, key) {
  const endpoint = `${url}/rest/v1/reminders?deleted_at=is.null&select=*`;
  const res = await fetch(endpoint, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  if (!res.ok) {
    throw new Error(`Supabase API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Discord Webhook にメッセージを送信
 * @param {string} webhookUrl - Discord Webhook URL
 * @param {string} content - メッセージ内容
 */
async function sendDiscord(webhookUrl, content) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!res.ok) {
    console.error(`Discord Webhook error: ${res.status} ${res.statusText}`);
  }
}

/**
 * Web Push通知を全登録端末に送信
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @param {string} vapidPublicKey
 * @param {string} vapidPrivateKey
 * @param {string} vapidEmail
 * @param {Array} reminders - 通知対象リマインダー
 * @param {string} todayStr - 'YYYY-MM-DD'
 */
async function sendWebPush(supabaseUrl, supabaseKey, vapidPublicKey, vapidPrivateKey, vapidEmail, reminders, todayStr) {
  let webpush;
  try {
    webpush = require('web-push');
  } catch (e) {
    console.error('web-push module not available, skipping push notifications');
    return;
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  // 全サブスクリプションを取得
  const endpoint = `${supabaseUrl}/rest/v1/push_subscriptions?select=*`;
  const res = await fetch(endpoint, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  if (!res.ok) {
    console.error(`Failed to fetch push subscriptions: ${res.status}`);
    return;
  }
  const subscriptions = await res.json();
  console.log(`Found ${subscriptions.length} push subscriptions`);

  if (subscriptions.length === 0) return;

  // 通知ペイロード作成
  const memos = reminders.filter(r => r.type === 'memo');
  const events = reminders.filter(r => r.type === 'event');
  let bodyLines = [];
  memos.forEach(r => bodyLines.push(`📝 [${r.child_name}] ${r.message}`));
  events.forEach(r => {
    const days = calcDaysRemaining(r.event_date, todayStr);
    bodyLines.push(`📅 [${r.child_name}] ${r.message}（あと${days}日）`);
  });

  const payload = JSON.stringify({
    title: '🔔 リマインダー通知',
    body: bodyLines.join('\n'),
    tag: 'reminder-' + todayStr,
    url: '/okodukai_history/index.html'
  });

  // 各端末に送信（失敗しても続行）
  const expiredIds = [];
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // サブスクリプション期限切れ → 削除対象
        expiredIds.push(sub.id);
        console.log(`Subscription expired: ${sub.device_id}`);
      } else {
        console.error(`Push failed for ${sub.device_id}:`, err.message);
      }
    }
  }

  // 期限切れサブスクリプションを削除
  if (expiredIds.length > 0) {
    for (const id of expiredIds) {
      await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
    }
    console.log(`Cleaned up ${expiredIds.length} expired subscriptions`);
  }
}

// Run main if executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

// ============================================================
// Exports for testing
// ============================================================
module.exports = {
  validateMessage,
  validateEventDate,
  filterDueReminders,
  isInWindow,
  validateCustomSchedule,
  calculateSnoozeUntil,
  formatMessage,
  parseMinutes,
  calcDaysRemaining,
  formatDateStr
};
