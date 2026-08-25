// Supabase設定（お小遣い手帳と同じプロジェクト）
const SUPABASE_URL = 'https://ynecezxnltigplrfzzoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4';
const VAPID_PUBLIC_KEY = 'BACPY31DgyoV3La_IdzxPvK4SrNT0NLj5KOi3PPekNv8dzU6_R4qO4tYkA4OHUptgQ_rSaPxw7S6Tu9I-j9uz08';

// Service Worker登録
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  checkPushStatus();
  loadScheduledNotifications();
});

// --- Push通知登録 ---
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function setupPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    showStatus('このブラウザはPush通知に対応していません', 'error');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showStatus('通知の許可が必要です', 'error');
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (sub) {
      const currentKey = sub.options && sub.options.applicationServerKey
        ? btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        : null;
      if (currentKey !== VAPID_PUBLIC_KEY) {
        await sub.unsubscribe();
        sub = null;
      }
    }

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    let deviceId = localStorage.getItem('push_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('push_device_id', deviceId);
    }

    // Supabaseにupsert
    await supabaseRequest('/rest/v1/push_subscriptions', 'POST', {
      device_id: deviceId,
      subscription: sub.toJSON(),
      child_name: null,
      role: 'admin',
      updated_at: new Date().toISOString()
    }, { 'Prefer': 'resolution=merge-duplicates' });

    localStorage.setItem('push_subscribed', 'true');
    checkPushStatus();
    showStatus('Push通知を有効にしました ✓', 'success');
  } catch (e) {
    console.error('Push setup failed:', e);
    showStatus('Push通知の設定に失敗しました', 'error');
  }
}

function checkPushStatus() {
  const pushBtn = document.getElementById('pushBtn');
  const pushStatus = document.getElementById('pushStatus');
  if (localStorage.getItem('push_subscribed') === 'true') {
    pushBtn.style.display = 'none';
    pushStatus.innerHTML = '<span class="subscribed">✓ Push通知: 有効</span>';
  }
}

// --- 洗濯通知スケジュール ---
async function scheduleNotification() {
  const btn = document.getElementById('notifyBtn');
  btn.disabled = true;

  const timeInput = document.getElementById('finishTime').value;
  const [hours, minutes] = timeInput.split(':').map(Number);
  const timeStr = `${String(hours).padStart(2, '0')}時${String(minutes).padStart(2, '0')}分`;

  // 完了予定時刻を今日の日付で構築（JST）
  const now = new Date();
  const todayJST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const finishTime = new Date(todayJST);
  finishTime.setHours(hours, minutes, 0, 0);

  // 指定時刻が既に過ぎている場合は翌日にする
  if (finishTime <= todayJST) {
    finishTime.setDate(finishTime.getDate() + 1);
  }

  const oneHourBefore = new Date(finishTime.getTime() - 60 * 60 * 1000);

  // 3つの通知をキューに追加
  const notifications = [
    {
      title: '🧺 洗濯通知',
      body: `${timeStr}に洗濯が完了予定です`,
      deliver_at: new Date().toISOString() // 即時
    },
    {
      title: '🧺 洗濯通知',
      body: '1時間後に洗濯が完了予定です',
      deliver_at: oneHourBefore.toISOString()
    },
    {
      title: '🧺 洗濯完了',
      body: '洗濯が完了しました',
      deliver_at: finishTime.toISOString()
    }
  ];

  try {
    // push_messagesにinsert（deliver_atカラム付き）
    const rows = notifications.map(n => ({
      target_role: 'admin',
      target_child_name: null,
      title: n.title,
      body: n.body,
      sent: false,
      deliver_at: n.deliver_at
    }));

    const res = await supabaseRequest('/rest/v1/push_messages', 'POST', rows, { 'Prefer': 'return=minimal' });

    if (res.ok) {
      showStatus(`✓ ${timeStr}に完了通知をセットしました`, 'success');
      loadScheduledNotifications();
    } else {
      const err = await res.text();
      console.error('push_messages INSERT failed:', res.status, err);
      throw new Error(`${res.status}: ${err}`);
    }
  } catch (e) {
    console.error('Notification schedule failed:', e);
    showStatus(`通知の登録に失敗: ${e.message}`, 'error');
  }

  btn.disabled = false;
}

// --- Supabase REST helper ---
async function supabaseRequest(path, method, body, extraHeaders = {}) {
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    }
  };
  if (body !== null && body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  return fetch(SUPABASE_URL + path, opts);
}

// --- UI helpers ---
function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (type || '');
  if (type === 'success') {
    setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 5000);
  }
}

// --- 予約済み通知の読み込み ---
async function loadScheduledNotifications() {
  const infoEl = document.getElementById('scheduledInfo');
  const textEl = document.getElementById('scheduledText');
  const btn = document.getElementById('notifyBtn');
  try {
    const now = new Date().toISOString();
    const res = await supabaseRequest(
      `/rest/v1/push_messages?select=id,title,body,deliver_at&sent=eq.false&deliver_at=gt.${now}&title=like.*洗濯*&order=deliver_at.asc`,
      'GET', null
    );
    if (!res.ok) { infoEl.style.display = 'none'; btn.disabled = false; return; }
    const data = await res.json();
    if (!data || data.length === 0) {
      infoEl.style.display = 'none';
      btn.disabled = false;
      return;
    }
    // 最も遅い通知（完了通知）の時刻を表示
    const last = data[data.length - 1];
    const deliverAt = new Date(last.deliver_at);
    const timeStr = `${String(deliverAt.getHours()).padStart(2,'0')}:${String(deliverAt.getMinutes()).padStart(2,'0')}`;
    textEl.innerHTML = `🔔 セット中: <strong>${timeStr}</strong> に完了予定`;
    infoEl.style.display = 'block';
    // セット済みならボタン無効化
    btn.disabled = true;
    // IDを保存しておく
    infoEl.dataset.ids = JSON.stringify(data.map(d => d.id));
  } catch(e) {
    infoEl.style.display = 'none';
    btn.disabled = false;
  }
}

// --- 予約キャンセル ---
async function cancelScheduled() {
  if (!confirm('セット中の洗濯通知をキャンセルしますか？')) return;
  const infoEl = document.getElementById('scheduledInfo');
  const ids = JSON.parse(infoEl.dataset.ids || '[]');
  try {
    for (const id of ids) {
      await supabaseRequest(`/rest/v1/push_messages?id=eq.${id}`, 'DELETE', null);
    }
    infoEl.style.display = 'none';
    document.getElementById('notifyBtn').disabled = false;
    showStatus('通知をキャンセルしました', 'success');
  } catch(e) {
    showStatus('キャンセルに失敗しました', 'error');
  }
}
