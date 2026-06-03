// auto-chore-points.js
// GitHub Actions Cron（毎日1回）から実行される自動お手伝いポイント付与スクリプト
// Node.js 20+ native fetch を使用
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key
//   DISCORD_WEBHOOK - Discord Webhook URL

// ============================================================
// 設定: 自動付与ルール
// ============================================================
const AUTO_CHORE_RULES = [
  { childName: 'りょうすけ', choreName: '食洗器', points: 3, everyNDays: 1 },
  { childName: 'りょうすけ', choreName: '洗濯機', points: 9, everyNDays: 3 },
  { childName: 'めぐみ', choreName: '食洗器', points: 3, everyNDays: 2 },
  { childName: 'めぐみ', choreName: '料理', points: 10, everyNDays: 1 },
];

// ============================================================
// Main
// ============================================================
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

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
  const childrenRes = await fetch(`${SUPABASE_URL}/rest/v1/children?select=id,name`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!childrenRes.ok) {
    console.error('Failed to fetch children:', childrenRes.status);
    process.exit(1);
  }
  const children = await childrenRes.json();

  const results = [];

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
      results.push(`${rule.childName}: ${rule.choreName} +${rule.points}pt`);
    } else {
      console.error(`Failed to insert for ${rule.childName}: ${insertRes.status}`);
    }
  }

  // マイルストーンチェック＆お小遣い付与
  for (const rule of AUTO_CHORE_RULES) {
    if (dayOfYear % rule.everyNDays !== 0) continue;
    const child = children.find(c => c.name === rule.childName);
    if (!child) continue;

    // 重複チェック（同じ子供の合計は1回だけ計算）
    if (results.find(r => r.startsWith(rule.childName + ':')) !== results.find(r => r === `${rule.childName}: ${rule.choreName} +${rule.points}pt`)) continue;

    await checkAndGiveAllowance(SUPABASE_URL, SUPABASE_KEY, child, children);
  }

  // Discord通知
  if (results.length > 0 && DISCORD_WEBHOOK) {
    const msg = '🤖 自動お手伝いポイント付与\n' + results.map(r => '• ' + r).join('\n');
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msg })
      });
    } catch (e) {}

    // Push通知キューにも追加
    for (const name of [...new Set(results.map(r => r.split(':')[0]))]) {
      const body = results.filter(r => r.startsWith(name + ':')).map(r => r.split(': ')[1]).join(', ');
      await fetch(`${SUPABASE_URL}/rest/v1/push_messages`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          title: '🤖 自動ポイント付与',
          body: `${name}: ${body}`,
          target_role: 'all',
          target_child_name: null
        })
      });
    }
  }

  console.log('Done.');
}

// ============================================================
// マイルストーンチェック＆お小遣い付与
// ============================================================
async function checkAndGiveAllowance(supabaseUrl, supabaseKey, child, allChildren) {
  // 現在の合計ポイントを取得
  const ptsRes = await fetch(
    `${supabaseUrl}/rest/v1/chore_points?child_id=eq.${child.id}&status=eq.approved&select=points`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  if (!ptsRes.ok) return;
  const ptsData = await ptsRes.json();
  const totalNow = ptsData.reduce((s, r) => s + r.points, 0);

  // 今日付与した分だけマイルストーンをチェック
  // （totalNow - todayAdded + 1 ~ totalNow の範囲）
  // ここでは簡略化: 最新のマイルストーン到達のみチェック
  const sheetPt = ((totalNow - 1) % 400) + 1;
  if (sheetPt % 20 !== 0) return; // ちょうどマイルストーンでなければスキップ

  // 既にお小遣いが付与されてないか確認（最後のtransactionをチェック）
  // → 安全のため、この自動スクリプトではマイルストーンお小遣いは付与しない
  // （手動操作で確認してから付与する設計）
  console.log(`⚠️ ${child.name}: マイルストーン ${sheetPt}pt 到達の可能性あり（お小遣い付与は手動で確認してください）`);
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
