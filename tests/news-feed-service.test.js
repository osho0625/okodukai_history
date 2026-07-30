/**
 * news-feed-service.js のユニットテスト
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchFeed, fetchAllFeeds, _internals } from "../js/news-feed-service.js";

// テスト用のRSS XMLデータ
const validRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article 1</title>
      <link>https://example.com/article1</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <description>Summary 1</description>
    </item>
    <item>
      <title>Article 2</title>
      <link>https://example.com/article2</link>
      <pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate>
      <description>Summary 2</description>
    </item>
  </channel>
</rss>`;

const invalidXml = "this is not valid xml at all";

// テスト用のソースとプロキシ設定
function createSource(overrides = {}) {
  return {
    id: "test-feed",
    name: "Test Feed",
    url: "https://example.com/feed.xml",
    category: "テック",
    enabled: true,
    lastSuccessAt: "",
    errorCount: 0,
    lastError: "",
    lastErrorAt: "",
    ...overrides,
  };
}

function createProxies() {
  return [
    { name: "allorigins", urlPrefix: "https://api.allorigins.win/raw?url=", type: "raw" },
    { name: "corsproxy", urlPrefix: "https://corsproxy.io/?", type: "raw" },
    { name: "codetabs", urlPrefix: "https://api.codetabs.com/v1/proxy?quest=", type: "raw" },
  ];
}

describe("fetchFeed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("最初のプロキシで成功した場合、記事を返す", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validRssXml),
    });

    const source = createSource();
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).toBeNull();
    expect(result.articles).toHaveLength(2);
    expect(result.articles[0].title).toBe("Article 1");
    expect(result.source.errorCount).toBe(0);
    expect(result.source.lastSuccessAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.source.lastError).toBe("");
    expect(result.source.lastErrorAt).toBe("");
  });

  it("最初のプロキシ失敗→2番目で成功（フォールバック）", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(validRssXml),
      });
    });

    const source = createSource();
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).toBeNull();
    expect(result.articles).toHaveLength(2);
    expect(result.source.errorCount).toBe(0);
  });

  it("全プロキシ失敗時、エラーを返しerrorCountをインクリメント", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    const source = createSource({ errorCount: 2 });
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).not.toBeNull();
    expect(result.error.type).toBe("network_error");
    expect(result.articles).toHaveLength(0);
    expect(result.source.errorCount).toBe(3);
    expect(result.source.lastError).toBe("network_error");
    expect(result.source.lastErrorAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("HTTPエラーレスポンスでフォールバックし、全失敗時にhttp_errorを記録", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    const source = createSource();
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).not.toBeNull();
    expect(result.error.type).toBe("http_error_403");
    expect(result.source.lastError).toBe("http_error_403");
  });

  it("タイムアウト時にproxy_timeoutを記録する", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        const err = new Error("Aborted");
        err.name = "AbortError";
        setTimeout(() => reject(err), 100);
      });
    });

    const source = createSource();
    const proxies = createProxies();

    // fakeTimersではAbortControllerのsetTimeoutは自動で進むのでrealTimerを使う
    vi.useRealTimers();

    const result = await fetchFeed(source, proxies);

    expect(result.error).not.toBeNull();
    expect(result.error.type).toBe("proxy_timeout");
    expect(result.source.lastError).toBe("proxy_timeout");
  });

  it("XML解析エラー時にxml_parse_errorを記録する", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(invalidXml),
    });

    const source = createSource();
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).not.toBeNull();
    expect(result.error.type).toBe("xml_parse_error");
    expect(result.source.lastError).toBe("xml_parse_error");
  });

  it("成功時にerrorCount=0にリセットされる", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validRssXml),
    });

    const source = createSource({ errorCount: 5, lastError: "proxy_timeout", lastErrorAt: "2024-01-01T00:00:00Z" });
    const proxies = createProxies();

    const result = await fetchFeed(source, proxies);

    expect(result.error).toBeNull();
    expect(result.source.errorCount).toBe(0);
    expect(result.source.lastError).toBe("");
    expect(result.source.lastErrorAt).toBe("");
    expect(result.source.lastSuccessAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("query型プロキシのJSONレスポンスを正しく処理する", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ contents: validRssXml }),
    });

    const source = createSource();
    const proxies = [{ name: "query-proxy", urlPrefix: "https://proxy.example.com/?url=", type: "query" }];

    const result = await fetchFeed(source, proxies);

    expect(result.error).toBeNull();
    expect(result.articles).toHaveLength(2);
  });
});

describe("fetchAllFeeds", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enabled: falseのソースは取得対象外", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validRssXml),
    });

    const sources = [
      createSource({ id: "enabled-1", enabled: true }),
      createSource({ id: "disabled-1", enabled: false }),
      createSource({ id: "enabled-2", enabled: true, url: "https://example.com/feed2.xml" }),
    ];
    const proxies = createProxies();

    const result = await fetchAllFeeds(sources, proxies);

    // enabled=false のソースはfetch対象外
    // 2つの有効フィード x 2記事ずつ = 4記事
    expect(result.articles).toHaveLength(4);
    expect(result.errors).toHaveLength(0);
  });

  it("空のソース配列で空結果を返す", async () => {
    const result = await fetchAllFeeds([], createProxies());
    expect(result.articles).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("全ソースdisabledで空結果を返す", async () => {
    const sources = [
      createSource({ enabled: false }),
      createSource({ id: "disabled-2", enabled: false }),
    ];
    const result = await fetchAllFeeds(sources, createProxies());
    expect(result.articles).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("一部失敗しても他のフィードの記事は取得できる", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      callCount++;
      // 奇数回目の呼び出しは成功、最初のソースのすべてのプロキシ呼び出しを失敗させる
      if (url.includes("fail-feed")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(validRssXml),
      });
    });

    const sources = [
      createSource({ id: "success-feed", url: "https://example.com/success" }),
      createSource({ id: "fail-feed", url: "https://example.com/fail-feed" }),
    ];
    const proxies = createProxies();

    const result = await fetchAllFeeds(sources, proxies);

    expect(result.articles).toHaveLength(2); // 成功フィードから2記事
    expect(result.errors).toHaveLength(1); // 1フィード失敗
    expect(result.errors[0].source.id).toBe("fail-feed");
  });

  it("部分結果コールバックが成功フィードごとに呼ばれる", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validRssXml),
    });

    const sources = [
      createSource({ id: "feed-1" }),
      createSource({ id: "feed-2", url: "https://example.com/feed2.xml" }),
    ];
    const proxies = createProxies();

    const partialResults = [];
    const onPartialResult = (source, articles) => {
      partialResults.push({ sourceId: source.id, count: articles.length });
    };

    await fetchAllFeeds(sources, proxies, onPartialResult);

    expect(partialResults).toHaveLength(2);
    expect(partialResults[0].count).toBe(2);
    expect(partialResults[1].count).toBe(2);
  });

  it("部分結果コールバックが未定義でもエラーにならない", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validRssXml),
    });

    const sources = [createSource()];
    const proxies = createProxies();

    // onPartialResult を undefined にして呼び出し
    const result = await fetchAllFeeds(sources, proxies, undefined);
    expect(result.articles).toHaveLength(2);
  });

  it("逐次取得される（全フィードがfetchされる）", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(validRssXml),
      });
    });

    const sources = [
      createSource({ id: "feed-1" }),
      createSource({ id: "feed-2", url: "https://example.com/feed2.xml" }),
      createSource({ id: "feed-3", url: "https://example.com/feed3.xml" }),
    ];
    const proxies = createProxies();

    const result = await fetchAllFeeds(sources, proxies);

    // 全フィードのfetchが呼ばれる
    expect(global.fetch).toHaveBeenCalled();
    expect(result.articles.length).toBeGreaterThanOrEqual(3 * 2); // 各フィード2記事
  });
});

describe("classifyError", () => {
  it("AbortErrorはproxy_timeoutを返す", () => {
    const err = new Error("Aborted");
    err.name = "AbortError";
    expect(_internals.classifyError(err, true)).toBe("proxy_timeout");
  });

  it("statusがあるエラーはhttp_error_XXXを返す", () => {
    const err = new Error("HTTP 404");
    err.status = 404;
    expect(_internals.classifyError(err, false)).toBe("http_error_404");
  });

  it("TypeErrorはnetwork_errorを返す", () => {
    const err = new TypeError("Failed to fetch");
    expect(_internals.classifyError(err, false)).toBe("network_error");
  });

  it("不明なエラーはnetwork_errorを返す", () => {
    const err = new Error("Something went wrong");
    expect(_internals.classifyError(err, false)).toBe("network_error");
  });
});
