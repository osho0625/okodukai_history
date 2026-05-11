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
