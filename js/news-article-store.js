/**
 * news-article-store.js
 * 記事キャッシュ・重複排除・容量管理
 *
 * 責務: localStorageを使った記事キャッシュの永続化・容量管理・重複排除
 * 依存: なし（ブラウザ標準API: localStorage のみ使用）
 */

const CACHE_KEY = "family-news-cache";
const MAX_CACHE_ARTICLES = 200;
const MAX_DISPLAY_ARTICLES = 100;
const EXPIRY_DAYS = 30;
const MAX_DESCRIPTION_BYTES = 500;
const MAX_ARTICLE_BYTES = 10240; // 10KB
const STORAGE_LIMIT_BYTES = 4 * 1024 * 1024; // 4MB
const PRUNE_ON_OVERFLOW_COUNT = 50;

/**
 * 文字列のバイト数を取得する（UTF-8）
 * @param {string} str
 * @returns {number}
 */
function getByteLength(str) {
  return new TextEncoder().encode(str).length;
}

/**
 * descriptionをバイト制限内に切り詰める
 * @param {string} description
 * @returns {string}
 */
function truncateDescription(description) {
  if (!description) return "";
  // バイト数チェック
  if (getByteLength(description) <= MAX_DESCRIPTION_BYTES) {
    return description;
  }
  // バイト数が超過する場合、文字を1つずつ減らして確認
  let result = description;
  while (getByteLength(result) > MAX_DESCRIPTION_BYTES && result.length > 0) {
    result = result.slice(0, result.length - 1);
  }
  return result;
}

/**
 * 記事オブジェクトをサイズ制限内に調整する
 * @param {object} article
 * @returns {object}
 */
function enforceArticleSizeLimit(article) {
  const adjusted = { ...article };
  adjusted.description = truncateDescription(adjusted.description || "");

  // 全体10KB制限チェック
  const json = JSON.stringify(adjusted);
  if (getByteLength(json) > MAX_ARTICLE_BYTES) {
    // descriptionをさらに切り詰めて対応
    while (
      getByteLength(JSON.stringify(adjusted)) > MAX_ARTICLE_BYTES &&
      adjusted.description.length > 0
    ) {
      adjusted.description = adjusted.description.slice(
        0,
        adjusted.description.length - 10
      );
    }
  }
  return adjusted;
}

/**
 * localStorageの現在の使用バイト数を概算で取得
 * @returns {number}
 */
function getStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    total += getByteLength(key);
    total += getByteLength(localStorage.getItem(key));
  }
  return total;
}

/**
 * 記事キャッシュを読み込み（保存済みidをそのまま利用、再計算しない）
 * @returns {Article[]} キャッシュ済み記事（最大200件）
 */
export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const articles = JSON.parse(raw);
    if (!Array.isArray(articles)) return [];
    // 最大200件に制限
    return articles.slice(0, MAX_CACHE_ARTICLES);
  } catch {
    return [];
  }
}

/**
 * 記事をキャッシュに保存（既存キャッシュとのマージ・重複排除・容量管理付き）
 * 保存フロー: load → merge with new → deduplicate → prune expired → enforce limit → save
 * @param {Article[]} articles - 保存対象記事
 * @returns {{saved: number, duplicates: number, pruned: number}} 保存結果
 */
export function saveToCache(articles) {
  if (!Array.isArray(articles)) {
    return { saved: 0, duplicates: 0, pruned: 0 };
  }

  // 1. 既存キャッシュの読み込み
  const existing = loadCache();

  // 2. 新規記事のサイズ制限適用
  const sizedArticles = articles.map(enforceArticleSizeLimit);

  // 3. マージ（新しい記事を先頭に追加）
  const merged = [...sizedArticles, ...existing];

  // 4. 重複排除（IDベース、最初の出現を保持）
  const { deduplicated, duplicateCount } = deduplicateById(merged);

  // 5. 期限切れ記事の削除
  const { valid, prunedCount } = removeExpired(deduplicated);

  // 6. 最大件数制限（fetchedAt新しい順に200件）
  const limited = valid
    .sort((a, b) => (b.fetchedAt || "").localeCompare(a.fetchedAt || ""))
    .slice(0, MAX_CACHE_ARTICLES);

  // 7. localStorageに保存
  const saved = writeToStorage(limited);

  return {
    saved: saved ? limited.length : 0,
    duplicates: duplicateCount,
    pruned: prunedCount + (valid.length - limited.length),
  };
}

/**
 * 期限切れ記事を削除（30日経過）
 * @returns {number} 削除件数
 */
export function pruneExpired() {
  const articles = loadCache();
  const { valid, prunedCount } = removeExpired(articles);

  if (prunedCount > 0) {
    writeToStorage(valid);
  }

  return prunedCount;
}

/**
 * Article.idで重複判定（idは生成済み前提）
 * 既存記事にないIDの新規記事のみを返す
 * @param {Article[]} newArticles - 新規記事
 * @param {Article[]} existing - 既存記事
 * @returns {Article[]} 重複除去後の新規記事
 */
export function deduplicateArticles(newArticles, existing) {
  if (!Array.isArray(newArticles)) return [];
  if (!Array.isArray(existing)) return newArticles;

  const existingIds = new Set(existing.map((a) => a.id));
  return newArticles.filter((a) => a.id && !existingIds.has(a.id));
}

/**
 * 表示用に記事を取得する（最大100件、公開日時降順）
 * @returns {Article[]} 表示用記事配列
 */
export function getDisplayArticles() {
  const articles = loadCache();
  return articles
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    .slice(0, MAX_DISPLAY_ARTICLES);
}

// --- 内部ヘルパー関数 ---

/**
 * ID重複を除去する（最初の出現を保持）
 * @param {Article[]} articles
 * @returns {{deduplicated: Article[], duplicateCount: number}}
 */
function deduplicateById(articles) {
  const seen = new Set();
  const deduplicated = [];
  let duplicateCount = 0;

  for (const article of articles) {
    if (!article.id) {
      deduplicated.push(article);
      continue;
    }
    if (seen.has(article.id)) {
      duplicateCount++;
    } else {
      seen.add(article.id);
      deduplicated.push(article);
    }
  }

  return { deduplicated, duplicateCount };
}

/**
 * 30日経過した記事を除去する
 * @param {Article[]} articles
 * @returns {{valid: Article[], prunedCount: number}}
 */
function removeExpired(articles) {
  const now = Date.now();
  const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const valid = [];
  let prunedCount = 0;

  for (const article of articles) {
    const fetchedAt = article.fetchedAt
      ? new Date(article.fetchedAt).getTime()
      : now;
    if (now - fetchedAt > expiryMs) {
      prunedCount++;
    } else {
      valid.push(article);
    }
  }

  return { valid, prunedCount };
}

/**
 * localStorageに記事配列を書き込む（4MB超過時は古い順に50件削除）
 * @param {Article[]} articles
 * @returns {boolean} 保存成功
 */
function writeToStorage(articles) {
  try {
    const json = JSON.stringify(articles);
    localStorage.setItem(CACHE_KEY, json);

    // localStorage全体の使用量チェック
    if (getStorageUsage() > STORAGE_LIMIT_BYTES) {
      // 古い順に50件削除
      const sorted = [...articles].sort((a, b) =>
        (a.fetchedAt || "").localeCompare(b.fetchedAt || "")
      );
      const pruned = sorted.slice(PRUNE_ON_OVERFLOW_COUNT);
      localStorage.setItem(CACHE_KEY, JSON.stringify(pruned));
    }
    return true;
  } catch {
    // QuotaExceededError等の場合、古い記事を削除して再試行
    try {
      const sorted = [...articles].sort((a, b) =>
        (a.fetchedAt || "").localeCompare(b.fetchedAt || "")
      );
      const pruned = sorted.slice(PRUNE_ON_OVERFLOW_COUNT);
      localStorage.setItem(CACHE_KEY, JSON.stringify(pruned));
      return true;
    } catch {
      return false;
    }
  }
}

// エクスポート（テスト用に内部関数も公開）
export const _internals = {
  CACHE_KEY,
  MAX_CACHE_ARTICLES,
  MAX_DISPLAY_ARTICLES,
  EXPIRY_DAYS,
  MAX_DESCRIPTION_BYTES,
  MAX_ARTICLE_BYTES,
  STORAGE_LIMIT_BYTES,
  PRUNE_ON_OVERFLOW_COUNT,
  getByteLength,
  truncateDescription,
  enforceArticleSizeLimit,
  getStorageUsage,
  deduplicateById,
  removeExpired,
  writeToStorage,
};
