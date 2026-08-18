const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_USER = process.argv[2] || 'osho_d29';
const TARGET_DATE = process.argv[3] || '2023-07-15';
const [year, month, day] = TARGET_DATE.split('-');

// JST target date 00:00 = UTC previous day 15:00
// JST target date 23:59:59 = UTC target day 14:59:59
const utcFromDate = new Date(`${year}-${month}-${String(Number(day)-1).padStart(2,'0')}T15:00:00Z`);
// Handle month boundary
const targetStart = new Date(Date.UTC(Number(year), Number(month)-1, Number(day)) - 9*60*60*1000);
const targetEnd = new Date(Date.UTC(Number(year), Number(month)-1, Number(day), 23, 59, 59) - 9*60*60*1000);

// CDX search range (broader to catch archiving delays)
const cdxFrom = new Date(targetStart.getTime() - 24*60*60*1000).toISOString().replace(/[-T:Z.]/g,'').substring(0,8);
const cdxTo = new Date(targetEnd.getTime() + 24*60*60*1000).toISOString().replace(/[-T:Z.]/g,'').substring(0,8);

function httpGet(p) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'web.archive.org', path: p, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } };
    const req = https.request(options, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => resolve({ status: r.statusCode, data: d })); });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function snowflakeToDate(id) {
  const bigId = BigInt(id);
  const tsMs = Number((bigId >> 22n) + 1288834974657n);
  return new Date(tsMs);
}
function toJST(date) {
  const jst = new Date(date.getTime() + 9*60*60*1000);
  return jst.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+$/, '');
}

async function main() {
  console.log(`=== @${TARGET_USER} ${TARGET_DATE} (JST) ===`);
  console.log(`CDX検索範囲: ${cdxFrom} - ${cdxTo}`);

  // Search CDX
  let cdxData = null;
  for (let retry = 0; retry < 3; retry++) {
    try {
      const res = await httpGet(`/cdx/search/cdx?url=twitter.com/${TARGET_USER}/status/*&output=json&from=${cdxFrom}&to=${cdxTo}`);
      if (res.status === 200 && res.data[0] === '[') { cdxData = res.data; break; }
      console.log(`  CDX status ${res.status}, retry...`);
    } catch (e) { console.log(`  CDX error: ${e.message}, retry...`); }
    await sleep(5000);
  }

  if (!cdxData) { console.log('CDX API失敗'); return; }

  const rows = JSON.parse(cdxData);
  const matched = [];
  for (let i = 1; i < rows.length; i++) {
    const [urlkey, timestamp, original] = rows[i];
    const idMatch = original.match(/\/status\/(\d+)/);
    if (!idMatch) continue;
    const tweetDate = snowflakeToDate(idMatch[1]);
    if (tweetDate >= targetStart && tweetDate <= targetEnd) {
      matched.push({ id: idMatch[1], timestamp, original, tweetDate });
    }
  }

  console.log(`対象ツイート: ${matched.length}件\n`);

  const results = [];
  for (const t of matched) {
    console.log(`Fetching: ${t.id} (${toJST(t.tweetDate)})`);
    try {
      const res = await httpGet('/web/' + t.timestamp + 'id_/' + t.original);
      if (res.status === 200) {
        const json = JSON.parse(res.data);
        const data = json.data;
        const images = [];
        if (json.includes && json.includes.media) {
          json.includes.media.forEach(m => { if (m.url) images.push(m.url); });
        }
        let type = '投稿';
        if (data.referenced_tweets) {
          for (const r of data.referenced_tweets) {
            if (r.type === 'replied_to') type = 'リプライ';
            if (r.type === 'retweeted') type = 'リポスト';
            if (r.type === 'quoted') type = '引用';
          }
        }
        results.push({ jst: toJST(new Date(data.created_at)), url: `https://x.com/${TARGET_USER}/status/${data.id}`, type, text: data.text, images: images.join(' | ') });
        console.log(`  ✓ [${type}] ${data.text.substring(0, 60)}`);
      } else { console.log(`  HTTP ${res.status}`); }
    } catch (e) { console.log(`  Error: ${e.message}`); }
    await sleep(2000);
  }

  // CSV output
  const esc = s => { s = (s || '').replace(/\r?\n/g, ' '); return (s.includes(',') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const header = '投稿日時(JST),URL,種別,本文,画像URL\n';
  const csvRows = results.map(r => [esc(r.jst), esc(r.url), esc(r.type), esc(r.text), esc(r.images)].join(',')).join('\n');
  const outFile = path.join(__dirname, `${TARGET_USER}_${TARGET_DATE}.csv`);
  fs.writeFileSync(outFile, '\ufeff' + header + csvRows, 'utf8');
  console.log(`\n出力: ${outFile}`);
  console.log(`件数: ${results.length}`);
}
main().catch(e => console.log('Fatal:', e.message));
