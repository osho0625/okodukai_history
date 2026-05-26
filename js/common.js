// 共通設定・ユーティリティ
const SUPABASE_URL = "https://ynecezxnltigplrfzzoh.supabase.co";
const SUPABASE_KEY = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1498552364905529355/6I3vultTaQcYNRjPP76ZtyyyGLG1JWdU7eX3IfMtpGCUWR3sdw2Gn3_pNxHgaS-z9iyG';

const isAdmin = localStorage.getItem('deviceRole') === 'admin';

async function notifyDiscord(content) {
  try {
    await fetch(DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
  } catch (e) {}
}

// --- Web Push通知 ---
// VAPID公開鍵（GitHub Secretsに対応する秘密鍵を保存）
const VAPID_PUBLIC_KEY = 'BHgHz0m_5AB7lMyEKx2T_stxMjDbIYS8_D-q2IdVqFxOLUdhn2iuRIN1pV40yu95IKAv5J7HGEnlIe4GcEbvpEA';

/**
 * Push通知の購読を登録/更新
 * @param {string} [childName] - 紐づける子供の名前（任意）
 * @returns {Promise<boolean>} 成功したら true
 */
async function subscribePush(childName) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    // device_id を取得/生成
    let deviceId = localStorage.getItem('push_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      localStorage.setItem('push_device_id', deviceId);
    }

    const role = localStorage.getItem('deviceRole') === 'admin' ? 'admin' : 'user';

    // Supabase に upsert
    await client.from('push_subscriptions').upsert({
      device_id: deviceId,
      subscription: sub.toJSON(),
      child_name: childName || null,
      role: role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'device_id' });

    localStorage.setItem('push_subscribed', 'true');
    return true;
  } catch (e) {
    console.error('Push subscription failed:', e);
    return false;
  }
}

/**
 * Push通知の購読を解除
 */
async function unsubscribePush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();

    const deviceId = localStorage.getItem('push_device_id');
    if (deviceId) {
      await client.from('push_subscriptions').delete().eq('device_id', deviceId);
    }
    localStorage.removeItem('push_subscribed');
  } catch (e) {
    console.error('Push unsubscribe failed:', e);
  }
}

/**
 * Push通知が購読済みか確認
 * @returns {Promise<boolean>}
 */
async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch (e) {
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getAllowanceForMilestone(pts) {
  if (pts === 400) return 400;
  if (pts === 200) return 200;
  if (pts % 60 === 0) return 300;
  if (pts % 20 === 0) return 40;
  return 0;
}

async function savePendingDeposit(cid, oldBalance, newBalance, amount) {
  const { data: existing } = await client.from('pending_effects')
    .select('id, data').eq('child_id', cid).eq('type', 'deposit');
  if (existing && existing.length > 0) {
    const row = existing[0];
    const updated = { ...row.data, newBalance, totalAmount: row.data.totalAmount + amount };
    await client.from('pending_effects').update({ data: updated }).eq('id', row.id);
  } else {
    await client.from('pending_effects').insert({ child_id: cid, type: 'deposit', data: { oldBalance, newBalance, totalAmount: amount } });
  }
}

// --- 夜間ゲーム制限（共通） ---
function getNightStartHour() {
  const day = new Date().getDay();
  return (day === 5 || day === 6) ? 22 : 21; // 金土は22時、日〜木は21時
}

function isNightTime() {
  if (localStorage.getItem('deviceRole') === 'admin') return false;
  if (localStorage.getItem('nightLimitOff') === 'true') return false;
  if (localStorage.getItem('nightUnlocked') === 'true') return false;
  const h = new Date().getHours();
  return h >= getNightStartHour() || h < 4;
}

// --- ゲーム中断確認（共通） ---
// isPlayingFn: ゲーム進行中かを返す関数
// pauseFn: ポーズ処理（任意）
// dest: 遷移先の説明テキスト
// action: 確認後に実行する関数
function confirmLeaveGame(isPlayingFn, pauseFn, dest, action) {
  if (!isPlayingFn()) { action(); return; }
  if (pauseFn) pauseFn();
  if (confirm('現在のゲームを中断して' + dest + 'に移動しますか？')) {
    action();
  }
}
