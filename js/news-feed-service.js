/**
 * news-feed-service.js
 * CORS Proxy経由のフィード取得・プロキシフォールバック・エラー耐性
 *
 * 責務: 全有効フィードの並列取得、プロキシ候補の順次試行、エラー記録
 * 依存: js/news-feed-parser.js の parseFeed 関数
 */

import { parseFeed } from "./news-feed-parser.js";

const FETCH_TIMEOUT_MS = 10000; // 10秒タイムアウト

/**
 * タイムアウト付きfetch
 * @param {string} url - 取得先URL
 * @param {number} timeoutMs - タイムアウト時間（ミリ秒）
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * プロキシ経由でフィードURLのテキストを取得
 * @param {string} feedUrl - RSSフィードURL
 * @param {import("./news-feed-service.js").ProxyConfig} proxy - プロキシ設定
 * @returns {Promise<string>} フィードXMLテキスト
 */
async function fetchViaProxy(feedUrl, proxy) {
  const proxyUrl = proxy.urlPrefix + encodeURIComponent(feedUrl);
  const response = await fetchWithTimeout(proxyUrl);

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (proxy.type === "query") {
    const json = await response.json();
    return json.contents || json.data || json.body || "";
  }

  return await response.text();
}

/**
 * エラー種別を判定する
 * @param {Error} error - 発生したエラー
 * @param {boolean} allProxiesFailed - 全プロキシが失敗したか
 * @returns {string} エラー種別文字列
 */
function classifyError(error, allProxiesFailed) {
  if (error.name === "AbortError" || allProxiesFailed) {
    if (error.name === "AbortError") return "proxy_timeout";
  }
  if (error.status) {
    return `http_error_${error.status}`;
  }
  if (error.name === "TypeError" || error.message?.includes("network") || error.message?.includes("fetch")) {
    return "network_error";
  }
  if (error.message?.includes("XML") || error.message?.includes("parse")) {
    return "xml_parse_error";
  }
  return "network_error";
}

/**
 * 単一フィードをプロキシフォールバック付きで取得
 * @param {FeedSource} source - フィードソース
 * @param {ProxyConfig[]} proxies - プロキシ候補リスト
 * @returns {Promise<{articles: Article[], source: FeedSource, error: null} | {articles: [], source: FeedSource, error: {type: string, message: string}}>}
 */
export async function fetchFeed(source, proxies) {
  let lastError = null;
  let allTimeout = true;

  for (const proxy of proxies) {
    try {
      const xmlText = await fetchViaProxy(source.url, proxy);
      const result = await parseFeed(xmlText, source);

      if (result.error) {
        lastError = new Error(result.error.message);
        lastError._type = "xml_parse_error";
        allTimeout = false;
        continue;
      }

      // 成功: ソースの状態を更新
      source.errorCount = 0;
      source.lastSuccessAt = new Date().toISOString();
      source.lastError = "";
      source.lastErrorAt = "";

      return { articles: result.articles, source, error: null };
    } catch (err) {
      lastError = err;
      if (err.name !== "AbortError") {
        allTimeout = false;
      }
    }
  }

  // 全プロキシ失敗
  const errorType = lastError?._type || (allTimeout ? "proxy_timeout" : classifyError(lastError, true));
  source.errorCount = (source.errorCount || 0) + 1;
  source.lastError = errorType;
  source.lastErrorAt = new Date().toISOString();

  return {
    articles: [],
    source,
    error: { type: errorType, message: lastError?.message || "Unknown error" },
  };
}

/**
 * 全有効フィードソースから記事を並列取得
 * @param {FeedSource[]} sources - フィードソース配列
 * @param {ProxyConfig[]} proxies - CORSプロキシ候補配列
 * @param {function} [onPartialResult] - 部分結果コールバック (source, articles) => void
 * @returns {Promise<{articles: Article[], errors: Array<{source: FeedSource, error: {type: string, message: string}}>}>}
 */
export async function fetchAllFeeds(sources, proxies, onPartialResult) {
  // enabled: false のソースは除外
  const enabledSources = sources.filter((s) => s.enabled);

  if (enabledSources.length === 0) {
    return { articles: [], errors: [] };
  }

  const allArticles = [];
  const errors = [];

  // 全フィードを並列取得
  const promises = enabledSources.map(async (source) => {
    const result = await fetchFeed(source, proxies);

    if (result.error) {
      errors.push({ source: result.source, error: result.error });
    } else {
      allArticles.push(...result.articles);
      // 部分結果コールバック: 取得完了分から順次返却
      if (typeof onPartialResult === "function") {
        onPartialResult(result.source, result.articles);
      }
    }

    return result;
  });

  await Promise.all(promises);

  return { articles: allArticles, errors };
}

// テスト用に内部関数もエクスポート
export const _internals = {
  FETCH_TIMEOUT_MS,
  fetchWithTimeout,
  fetchViaProxy,
  classifyError,
};
