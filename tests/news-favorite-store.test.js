/**
 * news-favorite-store.js のユニットテスト
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  _internals,
} from "../js/news-favorite-store.js";

const { FAVORITES_KEY, MAX_FAVORITES } = _internals;

/**
 * テスト用Article生成ヘルパー（フルArticle型）
 */
function createArticle(overrides = {}) {
  const defaults = {
    id: `id-${Math.random().toString(36).slice(2)}`,
    title: "Test Article",
    url: "https://example.com/article",
    publishedAt: "2025-01-15T08:00:00Z",
    description: "This description should NOT be saved",
    sourceName: "Test Source",
    sourceId: "test-source",
    sourceCategory: "テック",
    fetchedAt: "2025-01-15T10:30:00Z",
  };
  return { ...defaults, ...overrides };
}

/**
 * テスト用FavoriteArticle生成ヘルパー
 */
function createFavoriteArticle(overrides = {}) {
  const defaults = {
    id: `id-${Math.random().toString(36).slice(2)}`,
    title: "Test Article",
    url: "https://example.com/article",
    sourceName: "Test Source",
    sourceCategory: "テック",
    publishedAt: "2025-01-15T08:00:00Z",
    savedAt: new Date().toISOString(),
  };
  return { ...defaults, ...overrides };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("loadFavorites", () => {
  it("空のlocalStorageから空配列を返す", () => {
    expect(loadFavorites()).toEqual([]);
  });

  it("保存済みお気に入りを読み込む", () => {
    const favorites = [
      createFavoriteArticle({ id: "fav-1" }),
      createFavoriteArticle({ id: "fav-2" }),
    ];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    const result = loadFavorites();
    expect(result).toHaveLength(2);
  });

  it("保存日時降順でソートして返す", () => {
    const favorites = [
      createFavoriteArticle({ id: "old", savedAt: "2025-01-01T00:00:00Z" }),
      createFavoriteArticle({ id: "new", savedAt: "2025-01-15T00:00:00Z" }),
      createFavoriteArticle({ id: "mid", savedAt: "2025-01-10T00:00:00Z" }),
    ];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    const result = loadFavorites();
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("mid");
    expect(result[2].id).toBe("old");
  });

  it("不正なJSONの場合は空配列を返す", () => {
    localStorage.setItem(FAVORITES_KEY, "invalid json{{{");
    expect(loadFavorites()).toEqual([]);
  });

  it("配列でないデータの場合は空配列を返す", () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify({ foo: "bar" }));
    expect(loadFavorites()).toEqual([]);
  });
});

describe("addFavorite", () => {
  it("記事をお気に入りに追加できる", () => {
    const article = createArticle({ id: "article-1" });
    const result = addFavorite(article);

    expect(result.added).toBe(true);
    expect(result.removed).toBeNull();

    const favorites = loadFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe("article-1");
  });

  it("descriptionを保存しない", () => {
    const article = createArticle({
      id: "article-1",
      description: "This should not be saved",
    });
    addFavorite(article);

    const favorites = loadFavorites();
    expect(favorites[0]).not.toHaveProperty("description");
  });

  it("軽量データのみ保存する（id, title, url, sourceName, sourceCategory, publishedAt, savedAt）", () => {
    const article = createArticle({
      id: "article-1",
      title: "My Title",
      url: "https://example.com",
      sourceName: "Source",
      sourceCategory: "ゲーム",
      publishedAt: "2025-01-15T08:00:00Z",
      description: "excluded",
      sourceId: "excluded-source-id",
      fetchedAt: "excluded-fetched-at",
    });
    addFavorite(article);

    const favorites = loadFavorites();
    const fav = favorites[0];
    expect(fav.id).toBe("article-1");
    expect(fav.title).toBe("My Title");
    expect(fav.url).toBe("https://example.com");
    expect(fav.sourceName).toBe("Source");
    expect(fav.sourceCategory).toBe("ゲーム");
    expect(fav.publishedAt).toBe("2025-01-15T08:00:00Z");
    expect(fav.savedAt).toBeDefined();
    expect(fav).not.toHaveProperty("description");
    expect(fav).not.toHaveProperty("sourceId");
    expect(fav).not.toHaveProperty("fetchedAt");
  });

  it("savedAtにISO8601形式の現在日時が設定される", () => {
    const before = new Date().toISOString();
    const article = createArticle({ id: "article-1" });
    addFavorite(article);
    const after = new Date().toISOString();

    const favorites = loadFavorites();
    expect(favorites[0].savedAt >= before).toBe(true);
    expect(favorites[0].savedAt <= after).toBe(true);
  });

  it("既にお気に入りに存在する記事は追加しない", () => {
    const article = createArticle({ id: "article-1" });
    addFavorite(article);
    const result = addFavorite(article);

    expect(result.added).toBe(false);
    expect(result.removed).toBeNull();

    const favorites = loadFavorites();
    expect(favorites).toHaveLength(1);
  });

  it("nullまたはidなしの場合は追加しない", () => {
    expect(addFavorite(null)).toEqual({ added: false, removed: null });
    expect(addFavorite({})).toEqual({ added: false, removed: null });
    expect(addFavorite({ id: "" })).toEqual({ added: false, removed: null });
  });

  it("100件超過時はsavedAt最古のものを自動削除する", () => {
    // 100件のお気に入りを事前に保存
    const existing = Array.from({ length: MAX_FAVORITES }, (_, i) =>
      createFavoriteArticle({
        id: `existing-${i}`,
        savedAt: new Date(Date.now() - (MAX_FAVORITES - i) * 1000).toISOString(),
      })
    );
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(existing));

    // 101件目を追加
    const newArticle = createArticle({ id: "new-article" });
    const result = addFavorite(newArticle);

    expect(result.added).toBe(true);
    expect(result.removed).not.toBeNull();
    // 最古の記事が削除される
    expect(result.removed.id).toBe("existing-0");

    const favorites = loadFavorites();
    expect(favorites).toHaveLength(MAX_FAVORITES);
    expect(favorites.some((f) => f.id === "new-article")).toBe(true);
    expect(favorites.some((f) => f.id === "existing-0")).toBe(false);
  });

  it("100件超過時にconsole.warnが出力される", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const existing = Array.from({ length: MAX_FAVORITES }, (_, i) =>
      createFavoriteArticle({
        id: `existing-${i}`,
        savedAt: new Date(Date.now() - (MAX_FAVORITES - i) * 1000).toISOString(),
      })
    );
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(existing));

    addFavorite(createArticle({ id: "overflow" }));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("お気に入りが上限")
    );
  });
});

describe("removeFavorite", () => {
  it("お気に入りから記事を削除できる", () => {
    const article = createArticle({ id: "to-remove" });
    addFavorite(article);

    const result = removeFavorite("to-remove");
    expect(result).toBe(true);

    const favorites = loadFavorites();
    expect(favorites).toHaveLength(0);
  });

  it("存在しないIDの場合はfalseを返す", () => {
    const result = removeFavorite("non-existent");
    expect(result).toBe(false);
  });

  it("nullまたは空文字の場合はfalseを返す", () => {
    expect(removeFavorite(null)).toBe(false);
    expect(removeFavorite("")).toBe(false);
    expect(removeFavorite(undefined)).toBe(false);
  });

  it("複数の中から特定の記事のみ削除する", () => {
    addFavorite(createArticle({ id: "keep-1" }));
    addFavorite(createArticle({ id: "remove-me" }));
    addFavorite(createArticle({ id: "keep-2" }));

    removeFavorite("remove-me");

    const favorites = loadFavorites();
    expect(favorites).toHaveLength(2);
    expect(favorites.some((f) => f.id === "keep-1")).toBe(true);
    expect(favorites.some((f) => f.id === "keep-2")).toBe(true);
    expect(favorites.some((f) => f.id === "remove-me")).toBe(false);
  });
});

describe("isFavorite", () => {
  it("お気に入りに存在する記事はtrueを返す", () => {
    addFavorite(createArticle({ id: "favorite-1" }));
    expect(isFavorite("favorite-1")).toBe(true);
  });

  it("お気に入りに存在しない記事はfalseを返す", () => {
    expect(isFavorite("non-existent")).toBe(false);
  });

  it("nullまたは空文字の場合はfalseを返す", () => {
    expect(isFavorite(null)).toBe(false);
    expect(isFavorite("")).toBe(false);
    expect(isFavorite(undefined)).toBe(false);
  });

  it("削除後はfalseを返す", () => {
    addFavorite(createArticle({ id: "temp" }));
    expect(isFavorite("temp")).toBe(true);

    removeFavorite("temp");
    expect(isFavorite("temp")).toBe(false);
  });
});

describe("永続化", () => {
  it("ページリロード後もお気に入りが維持される（localStorage永続化）", () => {
    addFavorite(createArticle({ id: "persistent" }));

    // loadFavoritesで再読み込みをシミュレート
    const reloaded = loadFavorites();
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].id).toBe("persistent");
  });

  it("localStorage書き込みエラー時にconsole.warnが出力される", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Storage.prototype.setItemをモックしてエラーを投げる
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === FAVORITES_KEY) {
        throw new Error("QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    };

    const article = createArticle({ id: "will-fail" });
    addFavorite(article);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("お気に入りの保存に失敗しました"),
      expect.anything()
    );

    // リストア
    Storage.prototype.setItem = originalSetItem;
  });
});
