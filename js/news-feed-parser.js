/**
 * news-feed-parser.js
 * RSS 2.0 / Atom XML解析、HTMLサニタイズ、記事ID生成
 * 
 * 責務: フィードXMLをArticleオブジェクト配列に変換する純粋なパーサーモジュール
 * 依存: なし（ブラウザ標準API: DOMParser, crypto.subtle のみ使用）
 */

/**
 * URLを正規化する（トレイリングスラッシュ除去、クエリパラメータソート、hash除去）
 * 注意: http/httpsは別URLとして扱う（プロトコル変換しない）
 * @param {string} url - 正規化対象URL
 * @returns {string} 正規化されたURL
 */
export function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.pathname = u.pathname.replace(/\/$/, "");
    u.search = new URLSearchParams([...u.searchParams.entries()].sort()).toString();
    if (u.search && !u.search.startsWith("?")) {
      u.search = "?" + u.search;
    }
    return u.toString();
  } catch {
    // 無効なURLの場合はそのまま返す
    return url || "";
  }
}

/**
 * HTMLタグを除去してプレーンテキストを返す（XSS対策）
 * @param {string} html - サニタイズ対象のHTML文字列
 * @param {number} maxLength - 最大文字数（デフォルト200）
 * @returns {string} サニタイズ済みプレーンテキスト
 */
export function sanitizeHtml(html, maxLength = 200) {
  if (!html || typeof html !== "string") return "";
  // HTMLタグを正規表現で完全除去
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength);
}

/**
 * URLを正規化してSHA-256ハッシュIDを生成
 * 注意: ID生成はフィード取得時のみ実行。キャッシュ読み込み時は保存済みidをそのまま利用する
 * @param {string} url - 記事URL
 * @returns {Promise<string>} hex形式のSHA-256ハッシュ
 */
export async function generateArticleId(url) {
  const normalized = normalizeUrl(url);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * RSS 2.0形式のXMLからアイテムを抽出する
 * @param {Document} doc - パース済みXMLドキュメント
 * @returns {Array<{title: string, url: string, publishedAt: string, description: string}>}
 */
function parseRss2Items(doc) {
  const items = doc.querySelectorAll("item");
  const results = [];
  for (const item of items) {
    const title = item.querySelector("title")?.textContent?.trim() || "";
    const url = item.querySelector("link")?.textContent?.trim() || "";
    const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
    const description =
      item.querySelector("description")?.textContent?.trim() || "";

    let publishedAt = "";
    if (pubDate) {
      const d = new Date(pubDate);
      publishedAt = isNaN(d.getTime()) ? "" : d.toISOString();
    }

    results.push({ title, url, publishedAt, description });
  }
  return results;
}

/**
 * Atom形式のXMLからエントリを抽出する
 * 複数<link>要素がある場合はrel="alternate"を優先
 * @param {Document} doc - パース済みXMLドキュメント
 * @returns {Array<{title: string, url: string, publishedAt: string, description: string}>}
 */
function parseAtomEntries(doc) {
  const entries = doc.querySelectorAll("entry");
  const results = [];
  for (const entry of entries) {
    const title = entry.querySelector("title")?.textContent?.trim() || "";

    // link要素の優先選択: rel="alternate" > rel指定なし > 最初のlink
    const links = entry.querySelectorAll("link");
    let url = "";
    if (links.length > 0) {
      // rel="alternate"を優先
      let alternateLink = null;
      let noRelLink = null;
      for (const link of links) {
        const rel = link.getAttribute("rel");
        if (rel === "alternate") {
          alternateLink = link;
          break;
        }
        if (!rel && !noRelLink) {
          noRelLink = link;
        }
      }
      const selectedLink = alternateLink || noRelLink || links[0];
      url = selectedLink.getAttribute("href")?.trim() || "";
    }

    const updated =
      entry.querySelector("updated")?.textContent?.trim() ||
      entry.querySelector("published")?.textContent?.trim() ||
      "";
    const summary =
      entry.querySelector("summary")?.textContent?.trim() ||
      entry.querySelector("content")?.textContent?.trim() ||
      "";

    let publishedAt = "";
    if (updated) {
      const d = new Date(updated);
      publishedAt = isNaN(d.getTime()) ? "" : d.toISOString();
    }

    results.push({ title, url, publishedAt, description: summary });
  }
  return results;
}

/**
 * フィード形式を判定する
 * @param {Document} doc - パース済みXMLドキュメント
 * @returns {"rss2"|"atom"|"unknown"}
 */
function detectFeedType(doc) {
  if (doc.querySelector("rss") || doc.querySelector("channel > item")) {
    return "rss2";
  }
  if (doc.documentElement?.tagName === "feed" || doc.querySelector("feed > entry")) {
    return "atom";
  }
  return "unknown";
}

/**
 * RSS/Atom XMLを解析してArticleオブジェクト配列を返す
 * XML解析・サニタイズは同期処理。ID生成（SHA-256）のみ非同期。
 * @param {string} xmlText - RSS/AtomフィードのXMLテキスト
 * @param {FeedSource} source - フィードソース情報
 * @returns {Promise<{articles: Article[], error: null} | {articles: [], error: {message: string}}>}
 */
export async function parseFeed(xmlText, source) {
  if (!xmlText || typeof xmlText !== "string") {
    return { articles: [], error: { message: "フィードを読み込めませんでした" } };
  }

  let doc;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xmlText, "text/xml");
  } catch (e) {
    return { articles: [], error: { message: "フィードを読み込めませんでした" } };
  }

  // DOMParserのパースエラー検出（ブラウザ: parsererror要素、jsdom: 例外 or null）
  if (!doc || !doc.documentElement) {
    return { articles: [], error: { message: "フィードを読み込めませんでした" } };
  }
  const parseError = doc.querySelector("parsererror") || 
    doc.documentElement.tagName === "parsererror" ||
    doc.documentElement.querySelector("parsererror");
  if (parseError) {
    return { articles: [], error: { message: "フィードを読み込めませんでした" } };
  }

  const feedType = detectFeedType(doc);
  if (feedType === "unknown") {
    return { articles: [], error: { message: "フィードを読み込めませんでした" } };
  }

  let rawItems;
  if (feedType === "rss2") {
    rawItems = parseRss2Items(doc);
  } else {
    rawItems = parseAtomEntries(doc);
  }

  // URL無しの記事はスキップ
  const validItems = rawItems.filter((item) => item.url);

  // 最大20件取得
  const limitedItems = validItems.slice(0, 20);

  const fetchedAt = new Date().toISOString();

  // Promise.allで複数記事のID生成を並列実行
  const articles = await Promise.all(
    limitedItems.map(async (item) => {
      const id = await generateArticleId(item.url);
      return {
        id,
        title: item.title,
        url: item.url,
        publishedAt: item.publishedAt,
        description: sanitizeHtml(item.description, 200),
        sourceName: source.name || "",
        sourceId: source.id || "",
        sourceCategory: source.category || "",
        fetchedAt,
      };
    })
  );

  return { articles, error: null };
}
