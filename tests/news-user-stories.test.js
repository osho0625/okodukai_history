/**
 * ニュースアプリ ユーザーストーリー統合テスト
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sortArticlesByDate, filterByCategory } from "../js/news-app.js";
import {
  parseFeed,
  sanitizeHtml,
  normalizeUrl,
  generateArticleId,
} from "../js/news-feed-parser.js";
import {
  loadCache,
  saveToCache,
  deduplicateArticles,
  getDisplayArticles,
} from "../js/news-article-store.js";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../js/news-favorite-store.js";
import {
  loadFeedSources,
  saveFeedSources,
  addFeedSource,
  removeFeedSource,
  updateFeedSource,
  isValidUrl,
  loadSettings,
  getDefaultFeedSources,
} from "../js/news-setting-store.js";
import { fetchAllFeeds } from "../js/news-feed-service.js";

// --- テスト用定数 ---
const validRssXml = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title>Test Article</title><link>https://example.com/1</link><pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate><description>Test desc</description></item>
</channel></rss>`;

const multiItemRssXml = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title>Article A</title><link>https://example.com/a</link><pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate><description>Desc A</description></item>
<item><title>Article B</title><link>https://example.com/b</link><pubDate>Mon, 01 Jan 2024 06:00:00 GMT</pubDate><description>Desc B</description></item>
<item><title>Article C</title><link>https://example.com/c</link><pubDate>Wed, 03 Jan 2024 18:00:00 GMT</pubDate><description>Desc C</description></item>
</channel></rss>`;

// --- ヘルパー ---
function createTestArticle(overrides = {}) {
  return {
    id: overrides.id || `id-${Math.random().toString(36).slice(2)}`,
    title: overrides.title || "Test Article",
    url: overrides.url || "https://example.com/article",
    publishedAt: overrides.publishedAt || "2024-01-01T12:00:00.000Z",
    description: overrides.description || "Test description",
    sourceName: overrides.sourceName || "Test Source",
    sourceId: overrides.sourceId || "test-source",
    sourceCategory: overrides.sourceCategory || "テック",
    fetchedAt: overrides.fetchedAt || new Date().toISOString(),
  };
}

// --- セットアップ ---
beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(validRssXml),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// シナリオ1: 初回起動
// =============================================================================
describe("シナリオ1: 初回起動 - デフォルトフィードソース10件が登録される", () => {
  it("loadFeedSources()がデフォルト10件を返す", () => {
    const sources = loadFeedSources();
    expect(sources).toHaveLength(10);
  });

  it("デフォルトフィードソースがlocalStorageに保存される", () => {
    loadFeedSources();
    const raw = localStorage.getItem("family-news-feeds");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(10);
  });

  it("デフォルトソースに各カテゴリが含まれる", () => {
    const sources = loadFeedSources();
    const categories = [...new Set(sources.map((s) => s.category))];
    expect(categories).toContain("テック");
    expect(categories).toContain("ゲーム");
    expect(categories).toContain("おでかけ");
  });

  it("2回目のloadFeedSourcesはlocalStorageから読み込む（デフォルト再登録しない）", () => {
    const first = loadFeedSources();
    // 1件削除してから再度読み込み
    const modified = first.slice(0, 9);
    saveFeedSources(modified);
    const second = loadFeedSources();
    expect(second).toHaveLength(9);
  });
});

// =============================================================================
// シナリオ2: RSS取得→表示
// =============================================================================
describe("シナリオ2: RSS取得→表示", () => {
  it("fetchAllFeedsでRSS取得し、parseFeedで解析された記事が返る", async () => {
    const sources = [
      { id: "test", name: "Test", url: "https://example.com/rss", category: "テック", enabled: true, errorCount: 0, lastSuccessAt: "", lastError: "", lastErrorAt: "" },
    ];
    const proxies = [{ name: "test-proxy", urlPrefix: "https://proxy.example.com/?url=", type: "raw" }];

    const { articles, errors } = await fetchAllFeeds(sources, proxies);
    expect(errors).toHaveLength(0);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].title).toBe("Test Article");
  });

  it("saveToCacheで保存した記事がgetDisplayArticlesで取得できる", async () => {
    const source = { id: "test", name: "Test", url: "https://example.com/rss", category: "テック", enabled: true, errorCount: 0, lastSuccessAt: "", lastError: "", lastErrorAt: "" };
    const { articles } = await parseFeed(validRssXml, source);
    saveToCache(articles);

    const displayed = getDisplayArticles();
    expect(displayed.length).toBeGreaterThan(0);
    expect(displayed[0].title).toBe("Test Article");
  });

  it("getDisplayArticlesは最大100件で公開日時降順を返す", () => {
    // 101件の記事を生成して保存
    const articles = Array.from({ length: 101 }, (_, i) =>
      createTestArticle({
        id: `article-${i}`,
        publishedAt: new Date(2024, 0, 1, i).toISOString(),
      })
    );
    saveToCache(articles);

    const displayed = getDisplayArticles();
    expect(displayed.length).toBeLessThanOrEqual(100);
    // 降順確認
    for (let i = 1; i < displayed.length; i++) {
      expect(displayed[i - 1].publishedAt >= displayed[i].publishedAt).toBe(true);
    }
  });
});

// =============================================================================
// シナリオ3: カテゴリフィルタ
// =============================================================================
describe("シナリオ3: カテゴリフィルタ", () => {
  const articles = [
    createTestArticle({ id: "1", sourceCategory: "ゲーム", title: "Minecraft Update" }),
    createTestArticle({ id: "2", sourceCategory: "テック", title: "React 19" }),
    createTestArticle({ id: "3", sourceCategory: "ゲーム", title: "Nintendo News" }),
    createTestArticle({ id: "4", sourceCategory: "おでかけ", title: "Park Guide" }),
    createTestArticle({ id: "5", sourceCategory: "テック", title: "Rust 2.0" }),
  ];

  it("ゲームのみフィルタリング", () => {
    const result = filterByCategory(articles, "ゲーム");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.sourceCategory === "ゲーム")).toBe(true);
  });

  it("テックのみフィルタリング", () => {
    const result = filterByCategory(articles, "テック");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.sourceCategory === "テック")).toBe(true);
  });

  it("おでかけのみフィルタリング", () => {
    const result = filterByCategory(articles, "おでかけ");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Park Guide");
  });

  it("'all'で全件返す", () => {
    const result = filterByCategory(articles, "all");
    expect(result).toHaveLength(5);
  });

  it("カテゴリ未指定で全件返す", () => {
    const result = filterByCategory(articles, "");
    expect(result).toHaveLength(5);
  });
});

// =============================================================================
// シナリオ4: お気に入り
// =============================================================================
describe("シナリオ4: お気に入り", () => {
  it("addFavorite→isFavorite=true→removeFavorite→isFavorite=false", () => {
    const article = createTestArticle({ id: "fav-test-1" });

    expect(isFavorite("fav-test-1")).toBe(false);

    addFavorite(article);
    expect(isFavorite("fav-test-1")).toBe(true);

    removeFavorite("fav-test-1");
    expect(isFavorite("fav-test-1")).toBe(false);
  });

  it("descriptionが保存されない", () => {
    const article = createTestArticle({
      id: "fav-desc-test",
      description: "This should not be saved",
    });

    addFavorite(article);
    const favorites = loadFavorites();
    const saved = favorites.find((f) => f.id === "fav-desc-test");

    expect(saved).toBeDefined();
    expect(saved.description).toBeUndefined();
  });

  it("お気に入りはページリロード後も維持される（localStorage永続化）", () => {
    const article = createTestArticle({ id: "persist-test" });
    addFavorite(article);

    // loadFavorites再呼出し（localStorage読み直し）
    const favorites = loadFavorites();
    expect(favorites.some((f) => f.id === "persist-test")).toBe(true);
  });
});

// =============================================================================
// シナリオ5: オフラインキャッシュ
// =============================================================================
describe("シナリオ5: オフラインキャッシュ", () => {
  it("saveToCache後にloadCacheで記事が取得できる", () => {
    const articles = [
      createTestArticle({ id: "cache-1", title: "Cached Article 1" }),
      createTestArticle({ id: "cache-2", title: "Cached Article 2" }),
    ];
    saveToCache(articles);

    const cached = loadCache();
    expect(cached.length).toBeGreaterThanOrEqual(2);
    expect(cached.some((a) => a.id === "cache-1")).toBe(true);
    expect(cached.some((a) => a.id === "cache-2")).toBe(true);
  });

  it("キャッシュはlocalStorageに永続化される", () => {
    const articles = [createTestArticle({ id: "persist-cache" })];
    saveToCache(articles);

    const raw = localStorage.getItem("family-news-cache");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.some((a) => a.id === "persist-cache")).toBe(true);
  });
});

// =============================================================================
// シナリオ6: フィードソース管理
// =============================================================================
describe("シナリオ6: フィードソース管理", () => {
  it("addFeedSourceで新規ソースが追加される", () => {
    loadFeedSources(); // デフォルト登録
    const added = addFeedSource({
      name: "New Feed",
      url: "https://example.com/new-feed.xml",
      category: "テック",
    });

    expect(added).not.toBeNull();
    expect(added.id).toBeDefined();
    expect(added.name).toBe("New Feed");

    const sources = loadFeedSources();
    expect(sources.some((s) => s.name === "New Feed")).toBe(true);
  });

  it("removeFeedSourceでソースが削除される", () => {
    loadFeedSources(); // デフォルト登録
    const sources = loadFeedSources();
    const targetId = sources[0].id;

    const result = removeFeedSource(targetId);
    expect(result).toBe(true);

    const afterRemoval = loadFeedSources();
    expect(afterRemoval.some((s) => s.id === targetId)).toBe(false);
  });

  it("updateFeedSourceでenabled切替ができる", () => {
    loadFeedSources(); // デフォルト登録
    const sources = loadFeedSources();
    const targetId = sources[0].id;

    const updated = updateFeedSource(targetId, { enabled: false });
    expect(updated).not.toBeNull();
    expect(updated.enabled).toBe(false);

    const reloaded = loadFeedSources();
    const found = reloaded.find((s) => s.id === targetId);
    expect(found.enabled).toBe(false);
  });

  it("無効なURLのソースは追加できない", () => {
    loadFeedSources();
    const result = addFeedSource({
      name: "Bad Feed",
      url: "not-a-url",
      category: "テック",
    });
    expect(result).toBeNull();
  });
});

// =============================================================================
// シナリオ7: エラー耐性
// =============================================================================
describe("シナリオ7: エラー耐性 - 一部フィード失敗時に成功分は取得", () => {
  it("一部失敗→成功分のarticlesは取得、errorsに失敗分が含まれる", async () => {
    // fetch: 1回目は成功、2回目は失敗
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount % 2 === 0) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(validRssXml),
      });
    });

    const sources = [
      { id: "success-feed", name: "Success", url: "https://example.com/ok.xml", category: "テック", enabled: true, errorCount: 0, lastSuccessAt: "", lastError: "", lastErrorAt: "" },
      { id: "fail-feed", name: "Fail", url: "https://example.com/fail.xml", category: "ゲーム", enabled: true, errorCount: 0, lastSuccessAt: "", lastError: "", lastErrorAt: "" },
    ];
    const proxies = [{ name: "proxy", urlPrefix: "https://proxy.test/?url=", type: "raw" }];

    const { articles, errors } = await fetchAllFeeds(sources, proxies);

    // 成功分の記事が取得できている
    expect(articles.length).toBeGreaterThan(0);
    // 失敗分がerrorsに記録されている
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error.type).toBeDefined();
  });
});

// =============================================================================
// シナリオ8: stale-while-revalidate
// =============================================================================
describe("シナリオ8: stale-while-revalidate", () => {
  it("loadCacheでキャッシュ即時取得→fetchAllFeedsでバックグラウンド更新→saveToCacheでマージ", async () => {
    // Step 1: 既存キャッシュを保存
    const cachedArticles = [
      createTestArticle({ id: "cached-old", title: "Old Cached", publishedAt: "2024-01-01T00:00:00.000Z" }),
    ];
    saveToCache(cachedArticles);

    // Step 2: キャッシュから即時取得
    const cached = loadCache();
    expect(cached.length).toBeGreaterThan(0);
    expect(cached.some((a) => a.id === "cached-old")).toBe(true);

    // Step 3: バックグラウンドでフィード取得
    const sources = [
      { id: "test", name: "Test", url: "https://example.com/rss", category: "テック", enabled: true, errorCount: 0, lastSuccessAt: "", lastError: "", lastErrorAt: "" },
    ];
    const proxies = [{ name: "proxy", urlPrefix: "https://proxy.test/?url=", type: "raw" }];
    const { articles: newArticles } = await fetchAllFeeds(sources, proxies);

    // Step 4: 新しい記事をキャッシュにマージ保存
    saveToCache(newArticles);

    // Step 5: マージ結果を確認（古いキャッシュ + 新規記事）
    const merged = loadCache();
    expect(merged.some((a) => a.id === "cached-old")).toBe(true);
    expect(merged.length).toBeGreaterThan(1);
  });
});

// =============================================================================
// シナリオ9: 重複排除
// =============================================================================
describe("シナリオ9: 重複排除", () => {
  it("同じURLの記事が重複しない（deduplicateArticles）", () => {
    const existing = [createTestArticle({ id: "dup-1", url: "https://example.com/same" })];
    const newArticles = [createTestArticle({ id: "dup-1", url: "https://example.com/same" })];

    const unique = deduplicateArticles(newArticles, existing);
    expect(unique).toHaveLength(0);
  });

  it("saveToCacheで同一IDの重複記事は1件のみ保存される", () => {
    const articles = [
      createTestArticle({ id: "same-id", title: "First" }),
      createTestArticle({ id: "same-id", title: "Duplicate" }),
    ];
    saveToCache(articles);

    const cached = loadCache();
    const matches = cached.filter((a) => a.id === "same-id");
    expect(matches).toHaveLength(1);
  });

  it("normalizeUrlでトレイリングスラッシュが除去される", () => {
    const url1 = normalizeUrl("https://example.com/article/");
    const url2 = normalizeUrl("https://example.com/article");
    expect(url1).toBe(url2);
  });

  it("normalizeUrlでクエリパラメータがソートされる", () => {
    const url1 = normalizeUrl("https://example.com/page?b=2&a=1");
    const url2 = normalizeUrl("https://example.com/page?a=1&b=2");
    expect(url1).toBe(url2);
  });

  it("同じURLからは同じArticle IDが生成される", async () => {
    const id1 = await generateArticleId("https://example.com/article");
    const id2 = await generateArticleId("https://example.com/article");
    expect(id1).toBe(id2);
  });
});

// =============================================================================
// シナリオ10: URL検証
// =============================================================================
describe("シナリオ10: URL検証", () => {
  it("無効なURLでfalseを返す", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("  ")).toBe(false);
    expect(isValidUrl("http://example .com")).toBe(false);
  });

  it("有効なURLでtrueを返す", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com/path")).toBe(true);
    expect(isValidUrl("https://example.com/feed.xml")).toBe(true);
    expect(isValidUrl("https://sub.domain.example.com/rss")).toBe(true);
  });
});
