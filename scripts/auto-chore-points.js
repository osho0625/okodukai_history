// auto-chore-points.js
// GitHub Actions Cron（毎時実行）から起動される自動お手伝いポイント付与スクリプト
// game_settings.auto_chore_config.hour と現在のJST時刻が一致した時のみ付与を実行する
// Node.js 20+ native fetch を使用
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key

// ============================================================
// 設定: 自動付与ルール（デフォルト）
// 管理者ページ (game_settings.auto_chore_config) で上書き可能。
// DBに設定がない場合はこのデフォルトが使われる。
// ============================================================
const DEFAULT_AUTO_CHORE_CONFIG = {
  hour: 7, // 付与を行うJST時刻（0-23）
  rules: [
    { childName: 'りょうすけ', choreName: '食洗器回し', points: 4, everyNDays: 1 },
    { childName: 'りょうすけ', choreName: '洗濯機', points: 9, everyNDays: 2 },
    { childName: 'めぐみ', choreName: '食洗器', points: 3, everyNDays: 2 },
    { childName: 'めぐみ', choreName: '料理', points: 10, everyNDays: 1 },
  ],
};

// game_settings から自動付与設定を取得（失敗時はデフォルト）
async function fetchAutoChoreConfig(supabaseUrl, supabaseKey) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/game_settings?id=eq.1&select=auto_chore_config`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    if (res.ok) {
      const data = await res.json();
      const cfg = data[0]?.auto_chore_config;
      if (cfg && Array.isArray(cfg.rules)) {
        return {
          hour: typeof cfg.hour === 'number' ? cfg.hour : DEFAULT_AUTO_CHORE_CONFIG.hour,
          rules: cfg.rules,
        };
      }
    } else {
      console.warn('game_settings fetch failed:', res.status);
    }
  } catch (e) {
    console.warn('Failed to fetch auto_chore_config, using defaults:', e.message);
  }
  return DEFAULT_AUTO_CHORE_CONFIG;
}

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
  const jstHour = jstDate.getHours();

  // 自動付与設定を取得
  const config = await fetchAutoChoreConfig(SUPABASE_URL, SUPABASE_KEY);
  const AUTO_CHORE_RULES = config.rules;

  console.log(`Auto chore points: ${dateStr} ${jstHour}:00 JST (day of year: ${dayOfYear}, target hour: ${config.hour})`);

  // 設定された付与時刻を過ぎていれば実行（cronは毎時実行される想定）。
  // 「その時刻ちょうど」ではなく「その時刻以降」で判定するため、
  // GitHub Actions cron の遅延・スキップが起きても当日中に拾える。
  // 二重付与は「当日すでに付与済みか」を chore_points で判定して防ぐ（下記 hasChoreToday）。
  // FORCE_RUN=true（手動実行）の場合は時刻判定をスキップして即実行。
  const forceRun = process.env.FORCE_RUN === 'true';
  if (!forceRun && jstHour < config.hour) {
    console.log(`Skip: current hour ${jstHour} < target hour ${config.hour} (まだ付与時刻前)`);
    console.log('Done.');
    return;
  }
  if (forceRun) console.log('FORCE_RUN enabled: hour check skipped');

  // childrenテーブルから対象の子供を取得
  const childrenRes = await fetch(`${SUPABASE_URL}/rest/v1/children?select=id,name,balance`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!childrenRes.ok) {
    console.error('Failed to fetch children:', childrenRes.status);
    process.exit(1);
  }
  const children = await childrenRes.json();

  // 付与対象の子供IDと、今回付与したポイント数を収集
  const affectedChildIds = new Set();
  const addedPointsByChild = new Map(); // childId -> 今回付与した合計ポイント

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

    // 当日すでにこのルールで付与済みなら二重付与を防ぐためスキップ。
    // （cronが同日に複数回実行される想定：時刻ゲートを「以上」にしたため）
    const alreadyGiven = await hasChoreToday(SUPABASE_URL, SUPABASE_KEY, child.id, rule.choreName, dateStr);
    if (alreadyGiven) {
      console.log(`Skip: ${rule.childName} - ${rule.choreName} (今日は付与済み)`);
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
      addedPointsByChild.set(child.id, (addedPointsByChild.get(child.id) || 0) + rule.points);
    } else {
      console.error(`Failed to insert for ${rule.childName}: ${insertRes.status}`);
    }
  }

  // マイルストーンチェック＆お小遣い自動付与（今回付与分で新たに達成したご褒美のみ）
  for (const childId of affectedChildIds) {
    const child = children.find(c => c.id === childId);
    if (!child) continue;
    const addedPts = addedPointsByChild.get(child.id) || 0;
    await checkAndGiveAllowance(SUPABASE_URL, SUPABASE_KEY, child, children, addedPts);
    await checkAndIssuePageTickets(SUPABASE_URL, SUPABASE_KEY, child, addedPts);
  }

  console.log('Done.');
}

// ============================================================
// マイルストーンチェック＆お小遣い付与
// 今回付与したポイント(addedPts)で新たに達成したマイルストーンのご褒美額のみを付与する。
// 過去の未付与分を一気に補填するリコンシリエーションは行わない。
// ============================================================
async function checkAndGiveAllowance(supabaseUrl, supabaseKey, child, allChildren, addedPts) {
  if (!addedPts || addedPts <= 0) return;

  // 全件取得用ヘッダー（Supabase REST APIデフォルト1000行制限を回避）
  const allHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Range': '0-99999' };

  // 現在の合計承認済みポイント（＝今回付与後の値）を取得
  const ptsRes = await fetch(
    `${supabaseUrl}/rest/v1/chore_points?child_id=eq.${child.id}&status=eq.approved&select=points`,
    { headers: allHeaders }
  );
  if (!ptsRes.ok && ptsRes.status !== 206) return;
  const ptsData = await ptsRes.json();
  const totalAfter = ptsData.reduce((s, r) => s + r.points, 0);
  const totalBefore = totalAfter - addedPts;

  // 今回付与分で新たに超えたマイルストーンのご褒美額のみを計算
  const reward = calcCumulativeAllowance(totalAfter) - calcCumulativeAllowance(totalBefore);

  if (reward <= 0) {
    console.log(`  ${child.name}: ご褒美なし（${totalBefore}pt → ${totalAfter}pt）`);
    return;
  }

  console.log(`  ${child.name}: ご褒美 ${reward}円 を入金（${totalBefore}pt → ${totalAfter}pt）`);

  // 入金実行
  const repayChild = allChildren.find(c => c.name === child.name + 'が返すお金');
  if (repayChild) {
    const half = Math.floor(reward / 2);
    const remainder = reward - half;

    // 本人への入金
    const { balance: curBal } = await getBalance(supabaseUrl, supabaseKey, child.id);
    await updateBalance(supabaseUrl, supabaseKey, child.id, curBal + remainder);
    await insertTransaction(supabaseUrl, supabaseKey, child.id, remainder, 'ポイント表ご褒美');

    // 返済用アカウントへの入金
    const { balance: repBal } = await getBalance(supabaseUrl, supabaseKey, repayChild.id);
    await updateBalance(supabaseUrl, supabaseKey, repayChild.id, repBal + half);
    await insertTransaction(supabaseUrl, supabaseKey, repayChild.id, half, `ポイント表ご褒美（${child.name}分）`);

    console.log(`    → 本人 +${remainder}円, 返済用 +${half}円`);
  } else {
    const { balance: curBal } = await getBalance(supabaseUrl, supabaseKey, child.id);
    await updateBalance(supabaseUrl, supabaseKey, child.id, curBal + reward);
    await insertTransaction(supabaseUrl, supabaseKey, child.id, reward, 'ポイント表ご褒美');
    console.log(`    → +${reward}円`);
  }
}

// ============================================================
// 1〜totalPtsで達成したマイルストーンご褒美の累計額を計算
// ご褒美額の差分は calcCumulativeAllowance(after) - calcCumulativeAllowance(before) で求める
// ============================================================
function calcCumulativeAllowance(totalPts) {
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

// 指定した子供・お手伝い名で、JST当日(dateStr)に付与済みレコードがあるか判定。
// created_at は UTC 保存なので、JST当日 [00:00, 24:00) を UTC 範囲
// [前日15:00Z, 当日15:00Z) に変換して問い合わせる。
async function hasChoreToday(supabaseUrl, supabaseKey, childId, choreName, dateStr) {
  const startUtc = new Date(`${dateStr}T00:00:00+09:00`).toISOString();
  const endUtc = new Date(`${dateStr}T00:00:00+09:00`);
  endUtc.setDate(endUtc.getDate() + 1);
  const endUtcStr = endUtc.toISOString();

  const url = `${supabaseUrl}/rest/v1/chore_points`
    + `?child_id=eq.${childId}`
    + `&chore_name=eq.${encodeURIComponent(choreName)}`
    + `&created_at=gte.${startUtc}`
    + `&created_at=lt.${endUtcStr}`
    + `&select=id&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    if (!res.ok && res.status !== 206) {
      // 判定に失敗した場合は安全側（未付与扱いにせず）に倒して二重付与を避けるため true を返す
      console.warn(`hasChoreToday check failed (${res.status}) for ${choreName}, treating as already given to avoid duplicates`);
      return true;
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (e) {
    console.warn(`hasChoreToday error for ${choreName}: ${e.message}, treating as already given`);
    return true;
  }
}

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
// 枚コンプリート時チケット発行チェック
// 今回付与したポイント(addedPts)で新たに完了した枚数分のみチケットを発行する。
// 過去分を一気に発行するリコンシリエーションは行わない。
// ============================================================
const TICKET_OWNERS = ['かいせい', 'はるちか', 'いろは'];

async function checkAndIssuePageTickets(supabaseUrl, supabaseKey, child, addedPts) {
  if (!TICKET_OWNERS.includes(child.name)) return;
  if (!addedPts || addedPts <= 0) return;

  const allHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Range': '0-99999' };

  // 現在の合計承認済みポイント（＝今回付与後の値）を取得
  const ptsRes = await fetch(
    `${supabaseUrl}/rest/v1/chore_points?child_id=eq.${child.id}&status=eq.approved&select=points`,
    { headers: allHeaders }
  );
  if (!ptsRes.ok && ptsRes.status !== 206) return;
  const ptsData = await ptsRes.json();
  const totalAfter = ptsData.reduce((s, r) => s + r.points, 0);
  const totalBefore = totalAfter - addedPts;

  // 今回付与分で新たに完了した枚数
  const sheetsBefore = totalBefore > 0 ? Math.floor(totalBefore / 400) : 0;
  const sheetsAfter = totalAfter > 0 ? Math.floor(totalAfter / 400) : 0;
  const newSheets = sheetsAfter - sheetsBefore;
  if (newSheets <= 0) {
    console.log(`  ${child.name}: チケット発行なし（${totalBefore}pt → ${totalAfter}pt）`);
    return;
  }

  // 1枚完了につき60分×2枚
  const issueCount = newSheets * 2;
  console.log(`  ${child.name}: 枚コンプリート ${newSheets}枚 → チケット ${issueCount}枚 発行（${totalBefore}pt → ${totalAfter}pt）`);

  const rows = [];
  for (let i = 0; i < issueCount; i++) {
    rows.push({ owner: child.name, duration_minutes: 60 });
  }
  await fetch(`${supabaseUrl}/rest/v1/tickets`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(rows)
  });
  console.log(`    → +${issueCount}枚 発行完了`);
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
