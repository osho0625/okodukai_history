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
