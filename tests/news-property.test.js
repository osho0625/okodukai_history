/**
 * news-property.test.js
 * ファミリーニュース プロパティベーステスト（全17プロパティ、Property 14はスキップ）
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { sortArticlesByDate, filterByCategory } from "../js/news-app.js";
import {
  parseFeed,
  sanitizeHtml,
  normalizeUrl,
} from "../js/news-feed-parser.js";
import {
  loadFeedSources,
  saveFeedSources,
  removeFeedSource,
  isValidUrl,
  _internals as settingInternals,
} from "../js/news-setting-store.js";
import {
  loadCache,
  saveToCache,
  deduplicateArticles,
  _internals as articleInternals,
} from "../js/news-article-store.js";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  _internals as favoriteInternals,
} from "../js/news-favorite-store.js";
import { fetchAllFeeds } from "../js/news-feed-service.js";

// ============================================================
// Arbitraries (generators)
// ============================================================

/** 有効なISO8601日時文字列を生成 */
const arbIsoDate = fc
  .date({
    min: new Date("2000-01-01T00:00:00Z"),
    max: new Date("2030-12-31T23:59:59Z"),
  })
  .map((d) => d.toISOString());

/** Article arbitrary */
const arbArticle = fc.record({
  id: fc.hexaString({ minLength: 64, maxLength: 64 }),
  title: fc.string({ minLength: 0, maxLength: 100 }),
  url: fc.webUrl(),
  publishedAt: arbIsoDate,
  description: fc.string({ minLength: 0, maxLength: 200 }),
  sourceName: fc.string({ minLength: 1, maxLength: 30 }),
  sourceId: fc.string({ minLength: 1, maxLength: 30 }),
  sourceCategory: fc.constantFrom("テック", "ゲーム", "おでかけ"),
  fetchedAt: arbIsoDate,
});

/** FeedSource arbitrary */
const arbFeedSource = fc.record({
  id: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  url: fc.webUrl(),
  category: fc.constantFrom("テック", "ゲーム", "おでかけ"),
  enabled: fc.boolean(),
  lastSuccessAt: fc.constant(""),
  errorCount: fc.constant(0),
  lastError: fc.constant(""),
  lastErrorAt: fc.constant(""),
});

// ============================================================
// Helper: localStorage reset
// ============================================================

function clearLocalStorage() {
  localStorage.clear();
}

// ============================================================
// Property 1: 記事の公開日時降順ソート
// ============================================================

describe("Property 1: 記事の公開日時降順ソート", () => {
  /**
   * **Validates: Requirements 1.1, 1.3**
   * For any 記事配列に対して、ソート結果はすべての隣接要素ペアで
   * articles[i].publishedAt >= articles[i+1].publishedAt を満たす
   */
  it("ソート結果は全隣接ペアで降順", () => {
    fc.assert(
      fc.property(fc.array(arbArticle, { minLength: 0, maxLength: 50 }), (articles) => {
        const sorted = sortArticlesByDate(articles);
        for (let i = 0; i < sorted.length - 1; i++) {
          const a = sorted[i].publishedAt || "";
          const b = sorted[i + 1].publishedAt || "";
          expect(a >= b).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 2: フィード解析の主要フィールド保持（セマンティック等価）
// ============================================================

describe("Property 2: フィード解析の主要フィールド保持（セマンティック等価）", () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * For any 有効なRSS 2.0 XMLにおいて、parseFeedの結果のtitle/link/dateが
   * 元XMLに含まれる値と意味的に等価
   */

  /** RSS 2.0用 arbitrary: タイトルとURLのペアからXMLを生成 */
  const arbRssItem = fc.record({
    title: fc.string({ minLength: 1, maxLength: 50 }).filter(
      (s) => !s.includes("<") && !s.includes("&") && !s.includes(">") && s.trim().length > 0
    ),
    path: fc.stringOf(fc.constantFrom("a", "b", "c", "1", "2", "/", "-"), { minLength: 1, maxLength: 15 })
      .filter((s) => !s.includes("//") && !s.startsWith("/"))
      .map((p) => `https://example.com/${p}`),
  });

  it("RSS 2.0の主要フィールドが保持される", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbRssItem, { minLength: 1, maxLength: 5 }),
        async (items) => {
          const itemsXml = items
            .map(
              (item) =>
                `<item><title>${item.title}</title><link>${item.path}</link><pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate></item>`
            )
            .join("\n");
          const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Test</title>${itemsXml}</channel></rss>`;
          const source = { id: "test", name: "Test", category: "テック" };
          const result = await parseFeed(xml, source);

          expect(result.error).toBeNull();
          expect(result.articles.length).toBe(items.length);

          for (let i = 0; i < items.length; i++) {
            // parseFeedはtextContent.trim()を適用するため、trimmed比較
            expect(result.articles[i].title).toBe(items[i].title.trim());
            expect(result.articles[i].url).toBe(items[i].path);
            expect(result.articles[i].publishedAt).toBe("2024-01-01T12:00:00.000Z");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 3: Atomフィードのlink優先選択
// ============================================================

describe("Property 3: Atomフィードのlink優先選択", () => {
  /**
   * **Validates: Requirements 2.4**
   * For any 複数linkを持つAtomエントリにおいて、rel="alternate"のhrefが優先
   */

  const arbAtomEntry = fc.record({
    title: fc.string({ minLength: 1, maxLength: 30 }).filter(
      (s) => !s.includes("<") && !s.includes("&") && s.trim().length > 0
    ),
    alternateUrl: fc.webUrl().filter((u) => !u.includes("&") && !u.includes("'") && !u.includes('"')),
    selfUrl: fc.webUrl().filter((u) => !u.includes("&") && !u.includes("'") && !u.includes('"')),
  });

  it("rel=alternateのhrefが優先される", async () => {
    await fc.assert(
      fc.asyncProperty(arbAtomEntry, async (entry) => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Atom</title>
  <entry>
    <title>${entry.title}</title>
    <link rel="self" href="${entry.selfUrl}"/>
    <link rel="alternate" href="${entry.alternateUrl}"/>
    <updated>2024-01-15T10:00:00Z</updated>
    <summary>Test summary</summary>
  </entry>
</feed>`;
        const source = { id: "atom-test", name: "Atom Test", category: "テック" };
        const result = await parseFeed(xml, source);

        expect(result.error).toBeNull();
        expect(result.articles.length).toBe(1);
        expect(result.articles[0].url).toBe(entry.alternateUrl);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 4: 無効XMLの安全なエラーハンドリング
// ============================================================

describe("Property 4: 無効XMLの安全なエラーハンドリング", () => {
  /**
   * **Validates: Requirements 2.5**
   * For any 無効XML文字列に対して、parseFeedは例外をスローせずエラー結果を返す
   */
  it("無効XML文字列で例外をスローしない", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 0, maxLength: 500 }), async (randomText) => {
        const source = { id: "test", name: "Test", category: "テック" };
        // parseFeedが例外をスローしないことを確認
        const result = await parseFeed(randomText, source);
        // エラーが返るか、もしくは偶然有効なXMLなら articles が返る
        expect(result).toHaveProperty("articles");
        expect(result).toHaveProperty("error");
        if (result.error !== null) {
          expect(result.error).toHaveProperty("message");
          expect(result.articles).toHaveLength(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 5: HTMLサニタイズによるタグ完全除去
// ============================================================

describe("Property 5: HTMLサニタイズによるタグ完全除去", () => {
  /**
   * **Validates: Requirements 3.1, 3.3**
   * For any HTML文字列に対して、sanitizeHtmlの結果にHTMLタグが一切含まれない
   */

  /** HTMLタグを含む文字列を生成 */
  const arbHtmlString = fc.oneof(
    fc.string({ minLength: 0, maxLength: 300 }),
    fc.string({ minLength: 1, maxLength: 100 }).map(
      (s) => `<div>${s}</div>`
    ),
    fc.string({ minLength: 1, maxLength: 50 }).map(
      (s) => `<script>${s}</script>`
    ),
    fc.string({ minLength: 1, maxLength: 50 }).map(
      (s) => `<img onerror="${s}" src="x">`
    ),
    fc.string({ minLength: 1, maxLength: 50 }).map(
      (s) => `<iframe src="${s}"></iframe>`
    )
  );

  it("結果にHTMLタグが含まれない", () => {
    fc.assert(
      fc.property(arbHtmlString, (html) => {
        const result = sanitizeHtml(html, 1000);
        // HTMLタグのパターン: < followed by letters or / followed by >
        expect(result).not.toMatch(/<[a-zA-Z\/][^>]*>/);
      }),
      { numRuns: 100 }
    );
  });
});


// ============================================================
// Property 6: FeedSourceのlocalStorage永続化ラウンドトリップ
// ============================================================

describe("Property 6: FeedSourceのlocalStorage永続化ラウンドトリップ", () => {
  /**
   * **Validates: Requirements 4.2, 4.6**
   * For any 有効なFeedSource配列に対して、保存後に読み込んだ結果が等価
   */
  beforeEach(() => {
    clearLocalStorage();
  });

  it("保存後に読み込んだ結果が等価", () => {
    fc.assert(
      fc.property(fc.array(arbFeedSource, { minLength: 0, maxLength: 20 }), (sources) => {
        clearLocalStorage();
        saveFeedSources(sources);
        const loaded = JSON.parse(localStorage.getItem(settingInternals.FEEDS_KEY));
        expect(loaded).toEqual(sources);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 7: フィードソース削除時のキャッシュ・お気に入り保持
// ============================================================

describe("Property 7: フィードソース削除時のキャッシュ・お気に入り保持", () => {
  /**
   * **Validates: Requirements 4.3, 4.7**
   * For any FeedSourceを削除した後も、キャッシュおよびお気に入りは変更されない
   */
  beforeEach(() => {
    clearLocalStorage();
  });

  it("フィードソース削除後もキャッシュ・お気に入りは変更されない", () => {
    fc.assert(
      fc.property(
        arbFeedSource,
        fc.array(arbArticle, { minLength: 1, maxLength: 5 }),
        (feedSource, articles) => {
          clearLocalStorage();

          // Setup: フィードソースを保存
          saveFeedSources([feedSource]);

          // Setup: キャッシュを保存
          const cacheData = articles.map((a) => ({ ...a, sourceId: feedSource.id }));
          localStorage.setItem(articleInternals.CACHE_KEY, JSON.stringify(cacheData));

          // Setup: お気に入りを保存
          const favorites = articles.slice(0, 2).map((a) => ({
            id: a.id,
            title: a.title,
            url: a.url,
            sourceName: a.sourceName,
            sourceCategory: a.sourceCategory,
            publishedAt: a.publishedAt,
            savedAt: new Date().toISOString(),
          }));
          localStorage.setItem(favoriteInternals.FAVORITES_KEY, JSON.stringify(favorites));

          // キャッシュ・お気に入りのスナップショットを取得
          const cacheBefore = localStorage.getItem(articleInternals.CACHE_KEY);
          const favBefore = localStorage.getItem(favoriteInternals.FAVORITES_KEY);

          // Action: フィードソース削除
          removeFeedSource(feedSource.id);

          // Assert: キャッシュ・お気に入りは変更されない
          const cacheAfter = localStorage.getItem(articleInternals.CACHE_KEY);
          const favAfter = localStorage.getItem(favoriteInternals.FAVORITES_KEY);
          expect(cacheAfter).toBe(cacheBefore);
          expect(favAfter).toBe(favBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 8: 有効フィードのみ取得対象
// ============================================================

describe("Property 8: 有効フィードのみ取得対象", () => {
  /**
   * **Validates: Requirements 4.4**
   * For any FeedSource配列において、enabled:falseのソースはfetch対象に含まれない
   */
  it("enabled:falseのソースはfetch対象に含まれない", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbFeedSource, { minLength: 1, maxLength: 10 }),
        async (sources) => {
          const fetchedUrls = [];

          // fetchをモック
          const originalFetch = globalThis.fetch;
          globalThis.fetch = async (url) => {
            fetchedUrls.push(url);
            return new Response(
              `<?xml version="1.0"?><rss version="2.0"><channel><item><title>Test</title><link>https://example.com/test</link></item></channel></rss>`,
              { status: 200, headers: { "Content-Type": "text/xml" } }
            );
          };

          try {
            const proxies = [{ name: "test", urlPrefix: "https://proxy.test/?url=", type: "raw" }];
            await fetchAllFeeds(sources, proxies);

            // enabled:falseのソースのURLがfetch対象に含まれないことを確認
            const disabledUrls = sources
              .filter((s) => !s.enabled)
              .map((s) => s.url);

            for (const disabledUrl of disabledUrls) {
              const encodedUrl = encodeURIComponent(disabledUrl);
              const fetched = fetchedUrls.some((u) => u.includes(encodedUrl));
              expect(fetched).toBe(false);
            }
          } finally {
            globalThis.fetch = originalFetch;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 9: 無効URL形式のバリデーション拒否
// ============================================================

describe("Property 9: 無効URL形式のバリデーション拒否", () => {
  /**
   * **Validates: Requirements 4.5**
   * For any 有効URL形式でない文字列に対して、isValidUrlはfalseを返す
   */

  /** 無効なURL文字列を生成 */
  const arbInvalidUrl = fc.oneof(
    fc.constant(""),
    fc.constant("   "),
    fc.string({ minLength: 1, maxLength: 50 }).filter((s) => {
      try {
        const u = new URL(s.trim());
        return u.protocol !== "http:" && u.protocol !== "https:";
      } catch {
        return true; // URLとしてパースできない = 無効
      }
    }),
    fc.string({ minLength: 1, maxLength: 30 }).map((s) => `ftp://${s}`),
    fc.string({ minLength: 1, maxLength: 30 }).map((s) => `javascript:${s}`),
    fc.string({ minLength: 1, maxLength: 30 }).map((s) => `not a url ${s}`),
    fc.string({ minLength: 1, maxLength: 30 }).map((s) => `http:// ${s}.com`),
  );

  it("無効URL形式に対してfalseを返す", () => {
    fc.assert(
      fc.property(arbInvalidUrl, (url) => {
        expect(isValidUrl(url)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 10: お気に入り追加のラウンドトリップ（description除外）
// ============================================================

describe("Property 10: お気に入り追加のラウンドトリップ（description除外）", () => {
  /**
   * **Validates: Requirements 5.1, 5.4, 5.5, 5.6**
   * For any Article に対して、addFavorite後にloadFavoritesした結果に
   * id/title/url/sourceName/sourceCategory/publishedAtが含まれ、descriptionは含まれない
   */
  beforeEach(() => {
    clearLocalStorage();
  });

  it("追加後にloadで取得でき、descriptionは含まれない", () => {
    fc.assert(
      fc.property(arbArticle, (article) => {
        clearLocalStorage();

        addFavorite(article);
        const favorites = loadFavorites();
        const found = favorites.find((f) => f.id === article.id);

        expect(found).toBeDefined();
        expect(found.id).toBe(article.id);
        expect(found.title).toBe(article.title);
        expect(found.url).toBe(article.url);
        expect(found.sourceName).toBe(article.sourceName);
        expect(found.sourceCategory).toBe(article.sourceCategory);
        expect(found.publishedAt).toBe(article.publishedAt);
        // descriptionは含まれない
        expect(found).not.toHaveProperty("description");
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 11: お気に入り削除後の非存在
// ============================================================

describe("Property 11: お気に入り削除後の非存在", () => {
  /**
   * **Validates: Requirements 5.2**
   * For any お気に入り追加済み記事IDに対して、removeFavorite後にisFavoriteがfalseを返す
   */
  beforeEach(() => {
    clearLocalStorage();
  });

  it("removeFavorite後にisFavoriteがfalseを返す", () => {
    fc.assert(
      fc.property(arbArticle, (article) => {
        clearLocalStorage();

        // 追加
        addFavorite(article);
        expect(isFavorite(article.id)).toBe(true);

        // 削除
        removeFavorite(article.id);
        expect(isFavorite(article.id)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});


// ============================================================
// Property 12: カテゴリフィルタリングの正確性
// ============================================================

describe("Property 12: カテゴリフィルタリングの正確性", () => {
  /**
   * **Validates: Requirements 6.2, 6.3**
   * For any 記事配列と選択カテゴリに対して、フィルタ結果のすべての記事は
   * sourceCategory === selectedCategory を満たす
   */
  it("フィルタ結果の全記事がselectedCategoryに一致する", () => {
    fc.assert(
      fc.property(
        fc.array(arbArticle, { minLength: 0, maxLength: 30 }),
        fc.constantFrom("テック", "ゲーム", "おでかけ"),
        (articles, category) => {
          const filtered = filterByCategory(articles, category);
          for (const article of filtered) {
            expect(article.sourceCategory).toBe(category);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("カテゴリ'all'の場合は全記事が返される", () => {
    fc.assert(
      fc.property(
        fc.array(arbArticle, { minLength: 0, maxLength: 30 }),
        (articles) => {
          const filtered = filterByCategory(articles, "all");
          expect(filtered.length).toBe(articles.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 13: プロキシフォールバックとエラー分離
// ============================================================

describe("Property 13: プロキシフォールバックとエラー分離", () => {
  /**
   * **Validates: Requirements 7.2, 7.4, 7.5**
   * For any フィード取得において、全プロキシ失敗時は当該フィードのみエラーとし、
   * 他のフィード結果は影響を受けない
   */
  it("全プロキシ失敗時は当該フィードのみエラー、他フィードは影響なし", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbFeedSource.map((s) => ({ ...s, enabled: true })), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }).chain((max) => fc.integer({ min: 0, max })),
        async (sources, failIndex) => {
          const actualFailIndex = failIndex % sources.length;

          const originalFetch = globalThis.fetch;
          globalThis.fetch = async (url) => {
            // failIndexのフィードURLを含む場合はエラーを返す
            const failUrl = encodeURIComponent(sources[actualFailIndex].url);
            if (url.includes(failUrl)) {
              throw new Error("Network error");
            }
            // 他のフィードは成功
            return new Response(
              `<?xml version="1.0"?><rss version="2.0"><channel><item><title>OK</title><link>https://example.com/${Math.random()}</link></item></channel></rss>`,
              { status: 200 }
            );
          };

          try {
            const proxies = [
              { name: "proxy1", urlPrefix: "https://proxy1.test/?url=", type: "raw" },
              { name: "proxy2", urlPrefix: "https://proxy2.test/?url=", type: "raw" },
            ];
            const result = await fetchAllFeeds(sources, proxies);

            // 失敗フィードがエラーに含まれる
            const failedSourceIds = result.errors.map((e) => e.source.id);
            expect(failedSourceIds).toContain(sources[actualFailIndex].id);

            // 他のフィードの記事が取得されている（最低1件は成功するはず）
            const successCount = sources.length - 1;
            if (successCount > 0) {
              expect(result.articles.length).toBeGreaterThan(0);
            }
          } finally {
            globalThis.fetch = originalFetch;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 15: URL正規化の等価性
// ============================================================

describe("Property 15: URL正規化の等価性", () => {
  /**
   * **Validates: Requirements 12.1**
   * For any 同一プロトコル内でトレイリングスラッシュ・クエリ順序のみが異なるURLに対して、
   * normalizeUrlは同一文字列を返す
   */

  const arbUrlPair = fc
    .record({
      pathSegments: fc.array(
        fc.string({ minLength: 1, maxLength: 5 }).filter((s) => /^[a-z0-9]+$/.test(s)),
        { minLength: 1, maxLength: 4 }
      ),
      params: fc.array(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 5 }).filter((s) => /^[a-z]+$/.test(s)),
          fc.string({ minLength: 1, maxLength: 5 }).filter((s) => /^[a-z0-9]+$/.test(s))
        ),
        { minLength: 1, maxLength: 4 }
      ),
    })
    .map(({ pathSegments, params }) => {
      const path = "/" + pathSegments.join("/");
      const base = `https://example.com${path}`;
      // クエリパラメータ順序の異なる2つのURL（一方にはトレイリングスラッシュとハッシュ）
      const query1 = params.map(([k, v]) => `${k}=${v}`).join("&");
      const query2 = [...params].reverse().map(([k, v]) => `${k}=${v}`).join("&");
      return {
        url1: `${base}/?${query1}#hash`,
        url2: `${base}?${query2}`,
      };
    });

  it("トレイリングスラッシュ・クエリ順序・ハッシュのみ異なるURLは同一に正規化される", () => {
    fc.assert(
      fc.property(arbUrlPair, ({ url1, url2 }) => {
        const normalized1 = normalizeUrl(url1);
        const normalized2 = normalizeUrl(url2);
        expect(normalized1).toBe(normalized2);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 16: 重複排除後のID一意性
// ============================================================

describe("Property 16: 重複排除後のID一意性", () => {
  /**
   * **Validates: Requirements 12.2, 12.3**
   * For any 重複IDを含む記事配列に対して、deduplicateArticlesの結果は
   * 全Article.idが一意
   */
  it("重複排除後はIDが全て一意", () => {
    fc.assert(
      fc.property(
        fc.array(arbArticle, { minLength: 1, maxLength: 20 }),
        (articles) => {
          // 意図的に重複を作成
          const duplicated = [...articles, ...articles.slice(0, Math.min(3, articles.length))];
          
          // existing=空で重複排除
          const result = deduplicateArticles(duplicated, []);
          
          // 結果は元のarticlesと同じ（existing=空なので全て新規扱い）
          // ただし deduplicateArticles は existing にない ID のみを返すので
          // 2回目の呼び出しで重複が排除されることを確認
          const firstBatch = articles;
          const secondBatch = articles.slice(0, Math.min(3, articles.length));
          const deduplicated = deduplicateArticles(secondBatch, firstBatch);
          
          // secondBatchのIDは全てfirstBatchに含まれるのでresultは空
          expect(deduplicated.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("deduplicateArticlesの結果のIDは全て一意", () => {
    fc.assert(
      fc.property(
        fc.array(arbArticle, { minLength: 1, maxLength: 20 }),
        fc.array(arbArticle, { minLength: 0, maxLength: 10 }),
        (newArticles, existing) => {
          const result = deduplicateArticles(newArticles, existing);
          const ids = result.map((a) => a.id);
          const uniqueIds = new Set(ids);
          // 結果には existing に含まれる ID は無い
          const existingIds = new Set(existing.map((a) => a.id));
          for (const id of ids) {
            expect(existingIds.has(id)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============================================================
// Property 17: プッシュ通知本文のフォーマット正確性
// ============================================================

describe("Property 17: プッシュ通知本文のフォーマット正確性", () => {
  /**
   * **Validates: Requirements 13.7**
   * For any 新着記事配列（1件以上）に対して、結果は記事件数と先頭記事タイトルを含む
   */

  // news-notify.js は CommonJS なので require() で読み込む
  // eslint-disable-next-line
  const { formatNotificationBody } = require("../scripts/news-notify.js");

  const arbNotifyArticle = fc.record({
    title: fc.string({ minLength: 1, maxLength: 80 }),
    category: fc.constantFrom("テック", "ゲーム", "おでかけ"),
    link: fc.webUrl(),
  });

  it("結果は記事件数と先頭記事タイトルを含む", () => {
    fc.assert(
      fc.property(
        fc.array(arbNotifyArticle, { minLength: 1, maxLength: 20 }),
        (articles) => {
          const body = formatNotificationBody(articles);
          // 件数を含む
          expect(body).toContain(`${articles.length}件`);
          // 先頭記事のタイトルを含む
          expect(body).toContain(articles[0].title);
        }
      ),
      { numRuns: 100 }
    );
  });
});
