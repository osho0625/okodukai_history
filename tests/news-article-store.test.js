/**
 * news-article-store.js のユニットテスト
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadCache,
  saveToCache,
  pruneExpired,
  deduplicateArticles,
  getDisplayArticles,
  _internals,
} from "../js/news-article-store.js";

const {
  CACHE_KEY,
  MAX_CACHE_ARTICLES,
  MAX_DISPLAY_ARTICLES,
  EXPIRY_DAYS,
  getByteLength,
  truncateDescription,
  enforceArticleSizeLimit,
  deduplicateById,
  removeExpired,
} = _internals;

/**
 * テスト用Article生成ヘルパー
 */
function createArticle(overrides = {}) {
  const defaults = {
    id: `id-${Math.random().toString(36).slice(2)}`,
    title: "Test Article",
    url: "https://example.com/article",
    publishedAt: new Date().toISOString(),
    description: "Test description",
    sourceName: "Test Source",
    sourceId: "test-source",
    sourceCategory: "テック",
    fetchedAt: new Date().toISOString(),
  };
  return { ...defaults, ...overrides };
}

/**
 * N件のArticle配列を生成
 */
function createArticles(count, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createArticle({
      id: `article-${i}`,
      title: `Article ${i}`,
      url: `https://example.com/article-${i}`,
      ...baseOverrides,
    })
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("loadCache", () => {
  it("空のlocalStorageから空配列を返す", () => {
    expect(loadCache()).toEqual([]);
  });

  it("保存済みキャッシュを読み込む", () => {
    const articles = createArticles(3);
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    const result = loadCache();
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("article-0");
  });

  it("最大200件に制限する", () => {
    const articles = createArticles(250);
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    const result = loadCache();
    expect(result).toHaveLength(MAX_CACHE_ARTICLES);
  });

  it("不正なJSONの場合は空配列を返す", () => {
    localStorage.setItem(CACHE_KEY, "invalid json{{{");
    expect(loadCache()).toEqual([]);
  });

  it("配列でないデータの場合は空配列を返す", () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ foo: "bar" }));
    expect(loadCache()).toEqual([]);
  });

  it("保存済みidをそのまま利用する（再生成しない）", () => {
    const articles = [createArticle({ id: "preserved-id-123" })];
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    const result = loadCache();
    expect(result[0].id).toBe("preserved-id-123");
  });
});

describe("saveToCache", () => {
  it("新規記事を保存できる", () => {
    const articles = createArticles(5);
    const result = saveToCache(articles);
    expect(result.saved).toBeGreaterThan(0);

    const cached = loadCache();
    expect(cached).toHaveLength(5);
  });

  it("既存キャッシュとマージする", () => {
    const existing = createArticles(3);
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));

    const newArticles = createArticles(2).map((a, i) => ({
      ...a,
      id: `new-${i}`,
    }));
    saveToCache(newArticles);

    const cached = loadCache();
    expect(cached).toHaveLength(5);
  });

  it("重複記事を排除する", () => {
    const existing = [createArticle({ id: "dup-1" })];
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));

    const newArticles = [
      createArticle({ id: "dup-1", title: "Duplicate" }),
      createArticle({ id: "new-1", title: "New" }),
    ];
    const result = saveToCache(newArticles);
    expect(result.duplicates).toBe(1);

    const cached = loadCache();
    // 重複排除後: new-1 + dup-1 = 2件
    expect(cached).toHaveLength(2);
  });

  it("最大200件を超えた場合に古い記事を切り捨てる", () => {
    const existing = createArticles(190).map((a, i) => ({
      ...a,
      fetchedAt: new Date(Date.now() - i * 1000).toISOString(),
    }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));

    const newArticles = createArticles(20).map((a, i) => ({
      ...a,
      id: `new-${i}`,
      fetchedAt: new Date().toISOString(),
    }));
    saveToCache(newArticles);

    const cached = loadCache();
    expect(cached.length).toBeLessThanOrEqual(MAX_CACHE_ARTICLES);
  });

  it("30日経過した記事を自動削除する", () => {
    const oldDate = new Date(
      Date.now() - (EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000
    ).toISOString();
    const existing = [
      createArticle({ id: "old-1", fetchedAt: oldDate }),
      createArticle({ id: "fresh-1", fetchedAt: new Date().toISOString() }),
    ];
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));

    const newArticles = [
      createArticle({ id: "new-1", fetchedAt: new Date().toISOString() }),
    ];
    const result = saveToCache(newArticles);
    expect(result.pruned).toBeGreaterThanOrEqual(1);

    const cached = loadCache();
    const ids = cached.map((a) => a.id);
    expect(ids).not.toContain("old-1");
    expect(ids).toContain("fresh-1");
    expect(ids).toContain("new-1");
  });

  it("null入力でエラーにならない", () => {
    const result = saveToCache(null);
    expect(result).toEqual({ saved: 0, duplicates: 0, pruned: 0 });
  });

  it("空配列を渡しても既存キャッシュを維持する", () => {
    const existing = createArticles(3);
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));
    saveToCache([]);
    const cached = loadCache();
    expect(cached).toHaveLength(3);
  });
});

describe("pruneExpired", () => {
  it("30日以上経過した記事を削除する", () => {
    const oldDate = new Date(
      Date.now() - (EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000
    ).toISOString();
    const articles = [
      createArticle({ id: "old", fetchedAt: oldDate }),
      createArticle({ id: "new", fetchedAt: new Date().toISOString() }),
    ];
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));

    const pruned = pruneExpired();
    expect(pruned).toBe(1);

    const cached = loadCache();
    expect(cached).toHaveLength(1);
    expect(cached[0].id).toBe("new");
  });

  it("期限切れ記事がない場合は0を返す", () => {
    const articles = createArticles(3);
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    expect(pruneExpired()).toBe(0);
  });

  it("空キャッシュでは0を返す", () => {
    expect(pruneExpired()).toBe(0);
  });
});

describe("deduplicateArticles", () => {
  it("既存記事と重複するIDを持つ新規記事を除外する", () => {
    const existing = [
      createArticle({ id: "existing-1" }),
      createArticle({ id: "existing-2" }),
    ];
    const newArticles = [
      createArticle({ id: "existing-1", title: "Duplicate" }),
      createArticle({ id: "brand-new", title: "New" }),
    ];

    const result = deduplicateArticles(newArticles, existing);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("brand-new");
  });

  it("既存が空の場合は全て返す", () => {
    const newArticles = createArticles(3);
    const result = deduplicateArticles(newArticles, []);
    expect(result).toHaveLength(3);
  });

  it("新規が空の場合は空配列を返す", () => {
    const existing = createArticles(3);
    const result = deduplicateArticles([], existing);
    expect(result).toEqual([]);
  });

  it("null入力を安全に処理する", () => {
    expect(deduplicateArticles(null, [])).toEqual([]);
    expect(deduplicateArticles(createArticles(2), null)).toHaveLength(2);
  });

  it("idが空の記事はフィルタされる", () => {
    const existing = [createArticle({ id: "a" })];
    const newArticles = [createArticle({ id: "" })];
    const result = deduplicateArticles(newArticles, existing);
    expect(result).toHaveLength(0);
  });
});

describe("getDisplayArticles", () => {
  it("公開日時降順で返す", () => {
    const articles = [
      createArticle({ id: "1", publishedAt: "2024-01-01T00:00:00Z" }),
      createArticle({ id: "2", publishedAt: "2024-01-03T00:00:00Z" }),
      createArticle({ id: "3", publishedAt: "2024-01-02T00:00:00Z" }),
    ];
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));

    const result = getDisplayArticles();
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("最大100件に制限する", () => {
    const articles = createArticles(150);
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));

    const result = getDisplayArticles();
    expect(result).toHaveLength(MAX_DISPLAY_ARTICLES);
  });

  it("空キャッシュで空配列を返す", () => {
    expect(getDisplayArticles()).toEqual([]);
  });
});

describe("内部ヘルパー: truncateDescription", () => {
  it("500バイト以内のdescriptionはそのまま返す", () => {
    const desc = "Short description";
    expect(truncateDescription(desc)).toBe(desc);
  });

  it("500バイトを超えるdescriptionを切り詰める", () => {
    // マルチバイト文字で500byte超過を作成
    const desc = "あ".repeat(200); // 200 * 3 = 600 bytes
    const result = truncateDescription(desc);
    expect(getByteLength(result)).toBeLessThanOrEqual(500);
  });

  it("空文字列を安全に処理する", () => {
    expect(truncateDescription("")).toBe("");
    expect(truncateDescription(null)).toBe("");
    expect(truncateDescription(undefined)).toBe("");
  });
});

describe("内部ヘルパー: enforceArticleSizeLimit", () => {
  it("10KB以内の記事はそのまま返す", () => {
    const article = createArticle();
    const result = enforceArticleSizeLimit(article);
    expect(result.title).toBe(article.title);
  });

  it("10KB超過の記事はdescriptionを切り詰める", () => {
    const article = createArticle({
      description: "x".repeat(15000),
    });
    const result = enforceArticleSizeLimit(article);
    expect(getByteLength(JSON.stringify(result))).toBeLessThanOrEqual(10240);
  });
});

describe("内部ヘルパー: deduplicateById", () => {
  it("重複IDを除去し最初の出現を保持する", () => {
    const articles = [
      createArticle({ id: "a", title: "First" }),
      createArticle({ id: "b", title: "Second" }),
      createArticle({ id: "a", title: "Duplicate of First" }),
    ];
    const { deduplicated, duplicateCount } = deduplicateById(articles);
    expect(deduplicated).toHaveLength(2);
    expect(duplicateCount).toBe(1);
    expect(deduplicated[0].title).toBe("First");
  });

  it("IDがない記事は全て保持する", () => {
    const articles = [
      createArticle({ id: null }),
      createArticle({ id: undefined }),
    ];
    const { deduplicated } = deduplicateById(articles);
    expect(deduplicated).toHaveLength(2);
  });
});

describe("内部ヘルパー: removeExpired", () => {
  it("30日以内の記事を保持する", () => {
    const articles = [
      createArticle({ fetchedAt: new Date().toISOString() }),
      createArticle({
        fetchedAt: new Date(
          Date.now() - 29 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }),
    ];
    const { valid, prunedCount } = removeExpired(articles);
    expect(valid).toHaveLength(2);
    expect(prunedCount).toBe(0);
  });

  it("30日超過の記事を除去する", () => {
    const articles = [
      createArticle({ fetchedAt: new Date().toISOString() }),
      createArticle({
        fetchedAt: new Date(
          Date.now() - 31 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }),
    ];
    const { valid, prunedCount } = removeExpired(articles);
    expect(valid).toHaveLength(1);
    expect(prunedCount).toBe(1);
  });

  it("fetchedAtがない記事は期限切れにしない", () => {
    const articles = [createArticle({ fetchedAt: undefined })];
    const { valid } = removeExpired(articles);
    expect(valid).toHaveLength(1);
  });
});

describe("localStorage容量管理", () => {
  it("writeToStorageが4MB超過を検出した場合に古い順に50件削除する", () => {
    // 内部関数writeToStorageのロジックをテスト
    // jsdomのlocalStorageはサイズ制限がないため、getStorageUsageの結果で検証
    const { writeToStorage, getStorageUsage, PRUNE_ON_OVERFLOW_COUNT } =
      _internals;

    // 4MB超のデータでlocalStorageを埋める
    const bigData = "x".repeat(4 * 1024 * 1024 + 1000);
    localStorage.setItem("filler-data", bigData);

    const articles = createArticles(100).map((a, i) => ({
      ...a,
      fetchedAt: new Date(Date.now() - i * 1000).toISOString(),
    }));

    // writeToStorageは4MB超過検出で古い50件を削除する
    writeToStorage(articles);

    const cached = loadCache();
    // 4MB超過が検出されたため、100 - 50 = 50件になる
    expect(cached.length).toBe(100 - PRUNE_ON_OVERFLOW_COUNT);

    // 残った記事はfetchedAtが新しいもの（= 先頭50件）
    // fetchedAtでソートした後のslice(50)なので、古い順のインデックス50〜99が削除され0〜49が残る
    for (const article of cached) {
      expect(article.fetchedAt).toBeDefined();
    }

    // クリーンアップ
    localStorage.removeItem("filler-data");
  });
});
