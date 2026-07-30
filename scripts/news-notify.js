// news-notify.js
// GitHub Actions Cron (毎朝07:00 JST) から実行されるニュース通知スクリプト
// Node.js 20+ native fetch を使用（外部依存なし）
//
// 処理フロー:
//   1. デフォルトFeed_SourceのRSSを直接取得（サーバーサイドなのでCORS不要）
//   2. Supabase news_last_checkテーブルから前回チェック状態を取得
//   3. 新着記事の差分判定（前回のarticle IDリストと比較）
//   4. 新着ありの場合: push_messagesテーブルに通知レコード挿入
//   5. news_last_checkテーブルを更新
//
// 環境変数:
//   SUPABASE_URL   - Supabase プロジェクト URL
//   SUPABASE_KEY   - Supabase anon/service key

// ============================================================
// Constants
// ============================================================

const FETCH_TIMEOUT = 15000; // 15秒

const DEFAULT_FEEDS = [
  { url: 'https://hnrss.org/frontpage', name: 'Hacker News', category: 'テック' },
  { url: 'https://www.publickey1.jp/atom.xml', name: 'Publickey', category: 'テック' },
  { url: 'https://zenn.dev/feed', name: 'Zenn Trending', category: 'テック' },
  { url: 'https://qiita.com/popular-items/feed', name: 'Qiita Trending', category: 'テック' },
  { url: 'https://b.hatena.ne.jp/hotentry/it.rss', name: 'はてブ テクノロジー', category: 'テック' },
  { url: 'https://www.minecraft.net/en-us/feeds/community-content/rss', name: 'Minecraft公式', category: 'ゲーム' },
  { url: 'https://www.nintendo.co.jp/rss/news.xml', name: '任天堂ニュース', category: 'ゲーム' },
  { url: 'https://www.famitsu.com/feed/', name: 'ファミ通', category: 'ゲーム' },
  { url: 'https://news.google.com/rss/search?q=アスレチック+公園&hl=ja&gl=JP&ceid=JP:ja', name: 'アスレチック公園', category: 'おでかけ' },
  { url: 'https://b.hatena.ne.jp/search/tag?q=アスレチック&mode=rss', name: 'はてブ アスレチック', category: 'おでかけ' },
];

const CATEGORY_ICONS = {
  'テック': '💻',
  'ゲーム': '🎮',
  'おでかけ': '🏞️',
};

// ============================================================
// Pure functions (exported for testing)
// ============================================================

/**
 * 通知本文をフォーマットする
 * @param {Array<{title: string, category: string}>} newArticles - 新着記事一覧
 * @returns {string} 通知本文
 */
function formatNotificationBody(newArticles) {
  if (!newArticles || newArticles.length === 0) return '';
  const count = newArticles.length;
  const topArticle = newArticles[0];
  const icon = CATEGORY_ICONS[topArticle.category] || '📰';
  return `昨日の新着${count}件 ${icon} ${topArticle.title}`;
}

/**
 * RSS 2.0形式のXMLから記事を抽出する（軽量正規表現ベース）
 * @param {string} xml - RSS XMLテキスト
 * @returns {Array<{title: string, link: string}>}
 */
function parseRss2(xml) {
  const items = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    if (link) {
      items.push({ title: title || '(無題)', link });
    }
  }
  return items;
}

/**
 * Atom形式のXMLから記事を抽出する（軽量正規表現ベース）
 * @param {string} xml - Atom XMLテキスト
 * @returns {Array<{title: string, link: string}>}
 */
function parseAtom(xml) {
  const entries = [];
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const title = extractTag(entryXml, 'title');
    const link = extractAtomLink(entryXml);
    if (link) {
      entries.push({ title: title || '(無題)', link });
    }
  }
  return entries;
}

/**
 * XMLタグの内容を抽出する（CDATA対応）
 * @param {string} xml - XML文字列
 * @param {string} tagName - タグ名
 * @returns {string} タグの内容
 */
function extractTag(xml, tagName) {
  // CDATA対応: <![CDATA[...]]>
  const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  const content = (match[1] !== undefined ? match[1] : match[2]) || '';
  // HTMLタグを除去してプレーンテキスト化
  return content.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

/**
 * Atom形式の<link>要素からhrefを抽出する
 * rel="alternate"を優先、なければ最初のlinkのhref
 * @param {string} xml - entry内のXML
 * @returns {string} リンクURL
 */
function extractAtomLink(xml) {
  // rel="alternate" を優先
  const altRegex = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i;
  const altMatch = xml.match(altRegex);
  if (altMatch) return altMatch[1];

  // href ... rel="alternate" の順番パターンにも対応
  const altRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*\/?>/i;
  const altMatch2 = xml.match(altRegex2);
  if (altMatch2) return altMatch2[1];

  // rel指定なしまたは最初のlink
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i;
  const linkMatch = xml.match(linkRegex);
  if (linkMatch) return linkMatch[1];

  return '';
}

/**
 * XMLテキストからフィード形式を判定してパースする
 * @param {string} xml - フィードXMLテキスト
 * @returns {Array<{title: string, link: string}>}
 */
function parseFeedXml(xml) {
  if (!xml || typeof xml !== 'string') return [];
  // Atom形式の判定: <feed が含まれ <entry が含まれる
  if (xml.includes('<feed') && xml.includes('<entry')) {
    return parseAtom(xml);
  }
  // RSS 2.0形式（<rss or <item 含む）
  return parseRss2(xml);
}

/**
 * 記事のリンクURLからIDを生成する（SHA-256ハッシュ、Node.js crypto使用）
 * @param {string} url - 記事URL
 * @returns {string} hex形式のSHA-256ハッシュ
 */
function generateArticleId(url) {
  const crypto = require('crypto');
  const normalized = normalizeUrl(url);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * URLを正規化する（トレイリングスラッシュ除去、クエリパラメータソート、hash除去）
 * @param {string} url - 正規化対象URL
 * @returns {string} 正規化されたURL
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    u.pathname = u.pathname.replace(/\/$/, '');
    const params = [...u.searchParams.entries()].sort();
    u.search = new URLSearchParams(params).toString();
    if (u.search && !u.search.startsWith('?')) {
      u.search = '?' + u.search;
    }
    return u.toString();
  } catch {
    return url;
  }
}

// ============================================================
// Main execution (only runs when called directly)
// ============================================================

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY');
    process.exit(1);
  }

  console.log('[news-notify] Starting news notification check...');

  // 1. 全デフォルトフィードのRSSを直接取得
  const allArticles = [];
  for (const feed of DEFAULT_FEEDS) {
    try {
      const articles = await fetchFeedArticles(feed);
      allArticles.push(...articles);
      console.log(`[news-notify] ${feed.name}: ${articles.length}件取得`);
    } catch (err) {
      console.warn(`[news-notify] ${feed.name}: 取得失敗 - ${err.message}`);
    }
  }

  if (allArticles.length === 0) {
    console.log('[news-notify] No articles fetched from any feed. Exiting.');
    return;
  }

  // 2. Supabase news_last_checkテーブルから前回チェック状態を取得
  const lastChecks = await fetchLastChecks(SUPABASE_URL, SUPABASE_KEY);
  console.log(`[news-notify] Previous check records: ${lastChecks.length}`);

  // 3. 新着記事の差分判定
  const newArticles = detectNewArticles(allArticles, lastChecks);
  console.log(`[news-notify] New articles detected: ${newArticles.length}`);

  if (newArticles.length > 0) {
    // 4. push_messagesテーブルに通知レコード挿入
    const body = formatNotificationBody(newArticles);
    const hasSubscribers = await insertPushMessage(SUPABASE_URL, SUPABASE_KEY, body);
    if (hasSubscribers) {
      console.log(`[news-notify] Push notification queued: ${body}`);
    } else {
      console.log('[news-notify] No subscribers with news_notification_enabled=true');
    }
  } else {
    console.log('[news-notify] No new articles. Skipping notification.');
  }

  // 5. news_last_checkテーブルを更新
  await updateLastChecks(SUPABASE_URL, SUPABASE_KEY, allArticles);
  console.log('[news-notify] Updated news_last_check records.');

  console.log('[news-notify] Done.');
}

/**
 * 単一フィードのRSSを取得してパースする
 * @param {{url: string, name: string, category: string}} feed
 * @returns {Promise<Array<{id: string, title: string, link: string, category: string, feedUrl: string}>>}
 */
async function fetchFeedArticles(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FamilyNewsBot/1.0 (GitHub Actions)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const items = parseFeedXml(xml);

    // 最大20件、ID生成
    const limited = items.slice(0, 20);
    return limited.map(item => ({
      id: generateArticleId(item.link),
      title: item.title,
      link: item.link,
      category: feed.category,
      feedUrl: feed.url,
    }));
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Supabase news_last_checkテーブルから前回チェック状態を取得
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @returns {Promise<Array<{feed_url: string, last_article_ids: string[]}>>}
 */
async function fetchLastChecks(supabaseUrl, supabaseKey) {
  const endpoint = `${supabaseUrl}/rest/v1/news_last_check?select=feed_url,last_article_ids`;
  const res = await fetch(endpoint, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  if (!res.ok) {
    console.warn(`[news-notify] Failed to fetch news_last_check: ${res.status}`);
    return [];
  }
  return res.json();
}

/**
 * 新着記事を検出する（前回のarticle IDリストと比較）
 * @param {Array<{id: string, title: string, link: string, category: string, feedUrl: string}>} allArticles
 * @param {Array<{feed_url: string, last_article_ids: string[]}>} lastChecks
 * @returns {Array<{id: string, title: string, link: string, category: string, feedUrl: string}>}
 */
function detectNewArticles(allArticles, lastChecks) {
  // feed_url → 前回のarticle IDセットのマップ
  const lastIdsMap = new Map();
  for (const check of lastChecks) {
    lastIdsMap.set(check.feed_url, new Set(check.last_article_ids || []));
  }

  const newArticles = [];
  for (const article of allArticles) {
    const previousIds = lastIdsMap.get(article.feedUrl);
    // 前回チェック記録がない場合は初回なので新着扱いしない（初回は通知しない）
    if (!previousIds) continue;
    // 前回のIDリストに含まれていない → 新着
    if (!previousIds.has(article.id)) {
      newArticles.push(article);
    }
  }
  return newArticles;
}

/**
 * push_messagesテーブルに通知レコードを挿入
 * news_notification_enabled=trueのサブスクリプションが存在する場合のみ
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @param {string} body - 通知本文
 * @returns {Promise<boolean>} 通知を挿入したかどうか
 */
async function insertPushMessage(supabaseUrl, supabaseKey, body) {
  // news_notification_enabled=trueのサブスクリプションが存在するか確認
  const subRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?news_notification_enabled=eq.true&select=id&limit=1`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );
  if (!subRes.ok) {
    console.warn(`[news-notify] Failed to check subscribers: ${subRes.status}`);
    return false;
  }
  const subs = await subRes.json();
  if (subs.length === 0) return false;

  // push_messagesにレコード挿入
  const payload = {
    title: '📰 ファミリーニュース',
    body: body,
    target_role: null,
    sent: false,
  };

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/push_messages`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!insertRes.ok) {
    console.error(`[news-notify] Failed to insert push_message: ${insertRes.status}`);
    return false;
  }

  return true;
}

/**
 * news_last_checkテーブルを更新（upsert）
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @param {Array<{id: string, feedUrl: string}>} allArticles
 */
async function updateLastChecks(supabaseUrl, supabaseKey, allArticles) {
  // feedUrl毎にarticle IDをグルーピング
  const feedArticleMap = new Map();
  for (const article of allArticles) {
    if (!feedArticleMap.has(article.feedUrl)) {
      feedArticleMap.set(article.feedUrl, []);
    }
    feedArticleMap.get(article.feedUrl).push(article.id);
  }

  // 各フィードのlast_article_idsをupsert
  for (const [feedUrl, articleIds] of feedArticleMap) {
    const payload = {
      feed_url: feedUrl,
      last_article_ids: articleIds,
      checked_at: new Date().toISOString(),
    };

    const res = await fetch(
      `${supabaseUrl}/rest/v1/news_last_check?on_conflict=feed_url`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.warn(`[news-notify] Failed to upsert news_last_check for ${feedUrl}: ${res.status}`);
    }
  }
}

// Run main if executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('[news-notify] Error:', err);
    process.exit(1);
  });
}

// ============================================================
// Exports for testing
// ============================================================
module.exports = {
  formatNotificationBody,
  parseRss2,
  parseAtom,
  parseFeedXml,
  extractTag,
  extractAtomLink,
  generateArticleId,
  normalizeUrl,
  detectNewArticles,
  DEFAULT_FEEDS,
  CATEGORY_ICONS,
};
