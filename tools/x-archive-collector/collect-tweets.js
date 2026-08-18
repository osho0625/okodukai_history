/**
 * @jcsholdem の 2024/7/15 00:00〜23:59 (JST) の投稿を収集するツール
 * 
 * 情報源: Wayback Machine CDX API + アーカイブJSON取得
 * 出力: CSV (投稿日時, URL, 本文, 画像URL)
 * 
 * 使い方: node collect-tweets.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_USER = 'jcsholdem';
const TARGET_USER_DISPLAY = 'jcsHoldem';
const TARGET_DATE_JST = '2024-07-15';
const OUTPUT_FILE = path.join(__dirname, `${TARGET_USER}_${TARGET_DATE_JST}.csv`);

// JST 7/15 00:00 = UTC 7/14 15:00
// JST 7/15 23:59:59 = UTC 7/15 14:59:59
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TARGET_START_UTC = new Date('2024-07-14T15:00:00Z');
const TARGET_END_UTC = new Date('2024-07-15T14:59:59Z');

// --- HTTP ---
function httpGet(urlPath, hostname = 'web.archive.org') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path: urlPath,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- Snowflake ID → timestamp ---
function snowflakeToDate(id) {
  const bigId = BigInt(id);
  const tsMs = Number((bigId >> 22n) + 1288834974657n);
  return new Date(tsMs);
}

function toJSTString(date) {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  return jst.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+$/, '');
}

// --- CDX API search ---
async function searchCDX() {
  console.log('[CDX] Wayback Machine CDX API を検索中...');
  // Search wider range to catch all possible tweets
  // CDX timestamp is archive time, not tweet time, so search broader
  const cdxPath = `/cdx/search/cdx?url=twitter.com/${TARGET_USER}/status/*&output=json&from=20240714&to=20240716`;

  let retries = 3;
  while (retries > 0) {
    try {
      const res = await httpGet(cdxPath);
      if (res.status === 200 && res.data.trim() && res.data[0] === '[') {
        const rows = JSON.parse(res.data);
        const results = [];
        for (let i = 1; i < rows.length; i++) {
          const [urlkey, timestamp, original, mimetype, statuscode, digest, length] = rows[i];
          const tweetIdMatch = original.match(/\/status\/(\d+)/);
          if (tweetIdMatch) {
            const tweetId = tweetIdMatch[1];
            const tweetDate = snowflakeToDate(tweetId);
            // Filter: JST 7/15 only
            if (tweetDate >= TARGET_START_UTC && tweetDate <= TARGET_END_UTC) {
              results.push({ tweetId, timestamp, original, tweetDate });
            }
          }
        }
        console.log(`[CDX] JST ${TARGET_DATE_JST} の投稿: ${results.length}件`);
        return results;
      } else if (res.status === 503) {
        console.log(`[CDX] 503 Service Unavailable, リトライ中... (残り${retries - 1}回)`);
        retries--;
        await sleep(5000);
      } else {
        console.log(`[CDX] Unexpected status: ${res.status}`);
        return [];
      }
    } catch (e) {
      console.log(`[CDX] Error: ${e.message}, リトライ中...`);
      retries--;
      await sleep(3000);
    }
  }
  return [];
}

// --- Fetch archived tweet JSON ---
async function fetchTweetArchive(tweetId, archiveTimestamp, originalUrl) {
  // Use id_ modifier to get raw content
  const waybackPath = `/web/${archiveTimestamp}id_/${originalUrl}`;
  
  try {
    const res = await httpGet(waybackPath);
    if (res.status === 200) {
      try {
        const json = JSON.parse(res.data);
        return json;
      } catch {
        // Not JSON, try to extract from HTML
        return { raw: res.data };
      }
    }
  } catch (e) {
    console.log(`  [Error] ${tweetId}: ${e.message}`);
  }
  return null;
}

// --- Parse tweet JSON (Twitter API format archived by Wayback) ---
function parseTweetJson(json) {
  if (!json || !json.data) return null;

  const data = json.data;
  const result = {
    id: data.id,
    datetime_utc: data.created_at || '',
    text: data.text || '',
    images: [],
    is_reply: false,
    is_retweet: false,
    is_quote: false,
    replied_to: null
  };

  // Check referenced tweets
  if (data.referenced_tweets) {
    for (const ref of data.referenced_tweets) {
      if (ref.type === 'replied_to') {
        result.is_reply = true;
        result.replied_to = ref.id;
      }
      if (ref.type === 'retweeted') result.is_retweet = true;
      if (ref.type === 'quoted') result.is_quote = true;
    }
  }

  // Extract media
  if (json.includes && json.includes.media) {
    for (const media of json.includes.media) {
      if (media.type === 'photo' && media.url) {
        result.images.push(media.url);
      }
    }
  }

  return result;
}

// --- CSV ---
function escapeCsv(str) {
  if (!str) return '';
  str = str.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function writeCsv(tweets) {
  const BOM = '\ufeff';
  const header = '投稿日時(JST),URL,種別,本文,画像URL\n';
  const rows = tweets.map(t => {
    const jstTime = t.datetime_utc ? toJSTString(new Date(t.datetime_utc)) : '';
    const url = `https://x.com/${TARGET_USER_DISPLAY}/status/${t.id}`;
    let type = '投稿';
    if (t.is_reply) type = 'リプライ';
    if (t.is_retweet) type = 'リポスト';
    if (t.is_quote) type = '引用';
    const images = (t.images || []).join(' | ');
    return `${escapeCsv(jstTime)},${escapeCsv(url)},${escapeCsv(type)},${escapeCsv(t.text)},${escapeCsv(images)}`;
  }).join('\n');

  fs.writeFileSync(OUTPUT_FILE, BOM + header + rows, 'utf8');
}

// --- Main ---
async function main() {
  console.log(`=== @${TARGET_USER_DISPLAY} ${TARGET_DATE_JST} (JST) 投稿収集 ===\n`);

  // 1. CDX API search
  const cdxResults = await searchCDX();

  if (cdxResults.length === 0) {
    console.log('\nWayback Machine にアーカイブが見つかりませんでした。');
    console.log('手動検索をお試しください:');
    printManualUrls();
    writeCsv([]);
    return;
  }

  // 2. Fetch each archived tweet
  const tweets = [];
  for (const result of cdxResults) {
    console.log(`  取得中: ${result.tweetId} (${toJSTString(result.tweetDate)} JST)`);
    const json = await fetchTweetArchive(result.tweetId, result.timestamp, result.original);
    if (json && json.data) {
      const parsed = parseTweetJson(json);
      if (parsed) {
        tweets.push(parsed);
        console.log(`    ✓ ${parsed.text.substring(0, 50)}...`);
      }
    } else {
      console.log(`    ✗ コンテンツ取得失敗`);
    }
    await sleep(2000); // Rate limit
  }

  // 3. Deduplicate
  const seen = new Set();
  const unique = tweets.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  // 4. Sort by time
  unique.sort((a, b) => (a.datetime_utc || '').localeCompare(b.datetime_utc || ''));

  // 5. Output CSV
  writeCsv(unique);

  console.log(`\n=== 結果 ===`);
  console.log(`収集件数: ${unique.length}`);
  console.log(`出力ファイル: ${OUTPUT_FILE}`);
  console.log('');
  unique.forEach(t => {
    const jst = t.datetime_utc ? toJSTString(new Date(t.datetime_utc)) : '?';
    let type = '投稿';
    if (t.is_reply) type = 'リプライ';
    if (t.is_retweet) type = 'RT';
    console.log(`  [${jst}] [${type}] ${t.text.substring(0, 60)}${t.text.length > 60 ? '...' : ''}`);
    if (t.images.length) console.log(`    画像: ${t.images.join(', ')}`);
  });

  printManualUrls();
}

function printManualUrls() {
  console.log('\n--- 追加確認用URL ---');
  console.log(`X検索: https://x.com/search?q=from%3A${TARGET_USER}%20since%3A2024-07-15%20until%3A2024-07-16&f=live`);
  console.log(`Wayback: https://web.archive.org/web/20240715*/twitter.com/${TARGET_USER}/*`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
