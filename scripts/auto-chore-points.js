// auto-chore-points.js
// GitHub Actions Cron（毎日1回）から実行される自動お手伝いポイント付与スクリプト
// Node.js 20+ native fetch を使用
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key

// ============================================================
// 設定: 自動付与ルール
// ============================================================
const AUTO_CHORE_RULES = [
  { childName: 'りょうすけ', choreName: '食洗器', points: 3, everyNDays: 1 },
  { childName: 'りょうすけ', choreName: '洗濯機', points: 9, everyNDays: 2 },
  { childName: 'めぐみ', choreName: '食洗器', points: 3, everyNDays: 2 },
  { childName: 'めぐみ', choreName: '料理', points: 10, everyNDays: 1 },
];

// マイルストーン入金額（child.html / common.js と同一ロジック）
function getAllowanceForMilestone(pts) {
  if (pts === 400) return 400;
  if (pts === 200) return 200;
  if (pts % 60 === 0) return 300;
  if (pts % 20 === 0) return 40;
  return 0;
}

// ============================================================
// Main
// ============================================================
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY');
    process.exit(1);
  }

  // 現在のJST日付を取得
  const now = new Date();
  const jstStr = now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
  const jstDate = new Date(jstStr);
  const dayOfYear = getDayOfYear(jstDate);
  const dateStr = formatDate(jstDate);

  console.log(`Auto chore points: ${dateStr} (day of year: ${dayOfYear})`);

  // childrenテーブルから対象の子供を取得
  const childrenRes = await fetch(`${SUPABASE_URL}/rest/v1/children?select=id,name,balance`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!childrenRes.ok) {
    console.error('Failed to fetch children:', childrenRes.status);
    process.exit(1);
  }
  const children = await childrenRes.json();

  // 付与対象の子供IDを収集
  const affectedChildIds = new Set();

  for (const rule of AUTO_CHORE_RULES) {
    // N日に1回の判定（dayOfYear % N === 0）
    if (dayOfYear % rule.everyNDays !== 0) {
      console.log(`Skip: ${rule.childName} - ${rule.choreName} (every ${rule.everyNDays} days, today not due)`);
      continue;
    }

    const child = children.find(c => c.name === rule.childName);
    if (!child) {
      console.error(`Child not found: ${rule.childName}`);
      continue;
    }

    // chore_pointsに挿入（status=approved、自動付与なので即承認）
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/chore_points`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        child_id: child.id,
        chore_name: rule.choreName,
        points: rule.points,
        status: 'approved'
      })
    });

    if (insertRes.ok) {
      console.log(`✓ ${rule.childName}: ${rule.choreName} +${rule.points}pt`);
      affectedChildIds.add(child.id);
    } else {
      console.error(`Failed to insert for ${rule.childName}: ${insertRes.status}`);
    }
  }

  // マイルストーンチェック＆お小遣い自動付与
  for (const childId of affectedChildIds) {
    const child = children.find(c => c.id === childId);
    if (!child) continue;
    await checkAndGiveAllowance(SUPABASE_URL, SUPABASE_KEY, child, children);
  }

  console.log('Done.');
}

// ============================================================
// マイルストーンチェック＆お小遣い付与
// ============================================================
async function checkAndGiveAllowance(supabaseUrl, supabaseKey, child, allChildren) {
  // 合計承認済みポイントを取得
  const ptsRes = await fetch(
    `${supabaseUrl}/rest/v1/chore_points?child_id=eq.${child.id}&status=eq.approved&select=points`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  if (!ptsRes.ok) return;
  const ptsData = await ptsRes.json();
  const totalPts = ptsData.reduce((s, r) => s + r.points, 0);

  // 期待されるお小遣い総額を計算（ポイント1〜totalPtsの全マイルストーン）
  const expectedAllowance = calcExpectedAllowance(totalPts);

  // 実際に入金されたお小遣い総額を取得（memo='ポイント表ご褒美'のtransactions合計）
  const txRes = await fetch(
    `${supabaseUrl}/rest/v1/transactions?child_id=eq.${child.id}&type=eq.add&memo=eq.ポイント表ご褒美&select=amount`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  if (!txRes.ok) return;
  const txData = await txRes.json();
  const actualAllowance = txData.reduce((s, r) => s + r.amount, 0);

  // 返済用アカウントの入金分も加算
  const repayChild = allChildren.find(c => c.name === child.name + 'が返すお金');
  let repayAllowance = 0;
  if (repayChild) {
    const repayRes = await fetch(
      `${supabaseUrl}/rest/v1/transactions?child_id=eq.${repayChild.id}&type=eq.add&memo=like.ポイント表ご褒美*&select=amount`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    if (repayRes.ok) {
      const repayData = await repayRes.json();
      repayAllowance = repayData.reduce((s, r) => s + r.amount, 0);
    }
  }

  const totalActual = actualAllowance + repayAllowance;
  const deficit = expectedAllowance - totalActual;

  if (deficit <= 0) {
    console.log(`  ${child.name}: お小遣い正常（期待=${expectedAllowance}円, 実績=${totalActual}円）`);
    return;
  }

  console.log(`  ${child.name}: お小遣い不足 ${deficit}円 を入金（期待=${expectedAllowance}円, 実績=${totalActual}円）`);

  // 入金実行
  if (repayChild) {
    const half = Math.floor(deficit / 2);
    const remainder = deficit - half;

    // 本人への入金
    const { balance: curBal } = await getBalance(supabaseUrl, supabaseKey, child.id);
    const newBal = curBal + remainder;
    await updateBalance(supabaseUrl, supabaseKey, child.id, newBal);
    await insertTransaction(supabaseUrl, supabaseKey, child.id, remainder, 'ポイント表ご褒美');

    // 返済用アカウントへの入金
    const { balance: repBal } = await getBalance(supabaseUrl, supabaseKey, repayChild.id);
    const newRepBal = repBal + half;
    await updateBalance(supabaseUrl, supabaseKey, repayChild.id, newRepBal);
    await insertTransaction(supabaseUrl, supabaseKey, repayChild.id, half, `ポイント表ご褒美（${child.name}分）`);

    console.log(`    → 本人 +${remainder}円, 返済用 +${half}円`);
  } else {
    const { balance: curBal } = await getBalance(supabaseUrl, supabaseKey, child.id);
    const newBal = curBal + deficit;
    await updateBalance(supabaseUrl, supabaseKey, child.id, newBal);
    await insertTransaction(supabaseUrl, supabaseKey, child.id, deficit, 'ポイント表ご褒美');
    console.log(`    → +${deficit}円`);
  }
}

// ============================================================
// お小遣い期待額を計算
// ============================================================
function calcExpectedAllowance(totalPts) {
  let total = 0;
  for (let pt = 1; pt <= totalPts; pt++) {
    // 枚内のポイント位置（1-400）
    const sheetPt = ((pt - 1) % 400) + 1;
    if (sheetPt % 20 === 0) {
      total += getAllowanceForMilestone(sheetPt);
    }
  }
  return total;
}

// ============================================================
// Supabase ヘルパー
// ============================================================
async function getBalance(supabaseUrl, supabaseKey, childId) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/children?id=eq.${childId}&select=balance`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const data = await res.json();
  return { balance: data[0]?.balance || 0 };
}

async function updateBalance(supabaseUrl, supabaseKey, childId, newBalance) {
  await fetch(`${supabaseUrl}/rest/v1/children?id=eq.${childId}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ balance: newBalance })
  });
}

async function insertTransaction(supabaseUrl, supabaseKey, childId, amount, memo) {
  await fetch(`${supabaseUrl}/rest/v1/transactions`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ child_id: childId, type: 'add', amount, memo })
  });
}

// ============================================================
// ユーティリティ
// ============================================================
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Run
main().catch(e => {
  console.error(e);
  process.exit(1);
});
