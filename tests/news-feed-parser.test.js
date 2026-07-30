/**
 * news-feed-parser.js のユニットテスト
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import {
  parseFeed,
  sanitizeHtml,
  generateArticleId,
  normalizeUrl,
} from "../js/news-feed-parser.js";

describe("normalizeUrl", () => {
  it("トレイリングスラッシュを除去する", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe(
      "https://example.com/path"
    );
  });

  it("ハッシュフラグメントを除去する", () => {
    expect(normalizeUrl("https://example.com/path#section")).toBe(
      "https://example.com/path"
    );
  });

  it("クエリパラメータをソートする", () => {
    const result = normalizeUrl("https://example.com/path?z=1&a=2");
    expect(result).toBe("https://example.com/path?a=2&z=1");
  });

  it("http/httpsを別URLとして扱う", () => {
    const http = normalizeUrl("http://example.com/path");
    const https = normalizeUrl("https://example.com/path");
    expect(http).not.toBe(https);
  });

  it("同一意味のURLは同一の正規化結果になる", () => {
    const a = normalizeUrl("https://example.com/path/?b=2&a=1#hash");
    const b = normalizeUrl("https://example.com/path?a=1&b=2");
    expect(a).toBe(b);
  });
});

describe("sanitizeHtml", () => {
  it("HTMLタグを除去する", () => {
    expect(sanitizeHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("scriptタグを完全除去する", () => {
    const result = sanitizeHtml('<script>alert("xss")</script>safe text');
    expect(result).toBe('alert("xss")safe text');
  });

  it("maxLengthで切り詰める", () => {
    const result = sanitizeHtml("abcdefghij", 5);
    expect(result).toBe("abcde");
  });

  it("デフォルトmaxLengthは200", () => {
    const longText = "a".repeat(300);
    expect(sanitizeHtml(longText).length).toBe(200);
  });

  it("空文字列を返す（null入力）", () => {
    expect(sanitizeHtml(null)).toBe("");
  });

  it("HTMLエンティティをデコードする", () => {
    expect(sanitizeHtml("&amp; &lt; &gt;")).toBe("& < >");
  });

  it("iframeタグを除去する", () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>safe')).toBe("safe");
  });

  it("onerror属性を含むタグを除去する", () => {
    expect(sanitizeHtml('<img onerror="alert(1)" src="x">')).toBe("");
  });
});

describe("generateArticleId", () => {
  it("同じURLから同一IDを生成する", async () => {
    const id1 = await generateArticleId("https://example.com/article");
    const id2 = await generateArticleId("https://example.com/article");
    expect(id1).toBe(id2);
  });

  it("正規化後に同一のURLからは同一IDを生成する", async () => {
    const id1 = await generateArticleId("https://example.com/article/");
    const id2 = await generateArticleId("https://example.com/article");
    expect(id1).toBe(id2);
  });

  it("hex形式の64文字（SHA-256）を返す", async () => {
    const id = await generateArticleId("https://example.com/article");
    expect(id).toMatch(/^[0-9a-f]{64}$/);
  });

  it("異なるURLからは異なるIDを生成する", async () => {
    const id1 = await generateArticleId("https://example.com/article1");
    const id2 = await generateArticleId("https://example.com/article2");
    expect(id1).not.toBe(id2);
  });
});

describe("parseFeed - RSS 2.0", () => {
  const source = { id: "test-feed", name: "Test Feed", category: "テック" };

  const rss2Xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article 1</title>
      <link>https://example.com/article1</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <description>&lt;p&gt;Summary of article 1&lt;/p&gt;</description>
    </item>
    <item>
      <title>Article 2</title>
      <link>https://example.com/article2</link>
      <pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate>
      <description>Plain text summary</description>
    </item>
  </channel>
</rss>`;

  it("RSS 2.0をパースしてArticle配列を返す", async () => {
    const result = await parseFeed(rss2Xml, source);
    expect(result.error).toBeNull();
    expect(result.articles).toHaveLength(2);
  });

  it("Articleの各フィールドが正しく設定される", async () => {
    const result = await parseFeed(rss2Xml, source);
    const article = result.articles[0];
    expect(article.title).toBe("Article 1");
    expect(article.url).toBe("https://example.com/article1");
    expect(article.publishedAt).toBe("2024-01-01T12:00:00.000Z");
    expect(article.description).toBe("Summary of article 1");
    expect(article.sourceName).toBe("Test Feed");
    expect(article.sourceId).toBe("test-feed");
    expect(article.sourceCategory).toBe("テック");
    expect(article.id).toMatch(/^[0-9a-f]{64}$/);
    expect(article.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("descriptionのHTMLサニタイズが行われる", async () => {
    const xmlWithHtml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Test</title>
    <link>https://example.com/test</link>
    <description>&lt;script&gt;alert('xss')&lt;/script&gt;&lt;p&gt;Safe content&lt;/p&gt;</description>
  </item>
</channel></rss>`;
    const result = await parseFeed(xmlWithHtml, source);
    expect(result.articles[0].description).not.toContain("<script>");
    expect(result.articles[0].description).toContain("Safe content");
  });
});

describe("parseFeed - Atom", () => {
  const source = { id: "atom-feed", name: "Atom Feed", category: "ゲーム" };

  const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <entry>
    <title>Atom Article 1</title>
    <link rel="alternate" href="https://example.com/atom1"/>
    <link rel="self" href="https://example.com/atom1.xml"/>
    <updated>2024-01-15T10:00:00Z</updated>
    <summary>Atom summary 1</summary>
  </entry>
  <entry>
    <title>Atom Article 2</title>
    <link href="https://example.com/atom2"/>
    <updated>2024-01-16T10:00:00Z</updated>
    <summary>Atom summary 2</summary>
  </entry>
</feed>`;

  it("Atomをパースして記事配列を返す", async () => {
    const result = await parseFeed(atomXml, source);
    expect(result.error).toBeNull();
    expect(result.articles).toHaveLength(2);
  });

  it("rel=alternateのlinkを優先する", async () => {
    const result = await parseFeed(atomXml, source);
    expect(result.articles[0].url).toBe("https://example.com/atom1");
  });

  it("Atomの各フィールドが正しく設定される", async () => {
    const result = await parseFeed(atomXml, source);
    const article = result.articles[0];
    expect(article.title).toBe("Atom Article 1");
    expect(article.publishedAt).toBe("2024-01-15T10:00:00.000Z");
    expect(article.description).toBe("Atom summary 1");
    expect(article.sourceCategory).toBe("ゲーム");
  });
});

describe("parseFeed - エラーハンドリング", () => {
  const source = { id: "test", name: "Test", category: "テック" };

  it("無効なXMLでエラーオブジェクトを返す（例外スローしない）", async () => {
    const result = await parseFeed("<invalid>xml<without>closing", source);
    expect(result.error).not.toBeNull();
    expect(result.error.message).toBe("フィードを読み込めませんでした");
    expect(result.articles).toHaveLength(0);
  });

  it("空文字列でエラーオブジェクトを返す", async () => {
    const result = await parseFeed("", source);
    expect(result.error).not.toBeNull();
    expect(result.articles).toHaveLength(0);
  });

  it("null入力でエラーオブジェクトを返す", async () => {
    const result = await parseFeed(null, source);
    expect(result.error).not.toBeNull();
    expect(result.articles).toHaveLength(0);
  });

  it("ランダムテキストでエラーオブジェクトを返す", async () => {
    const result = await parseFeed("this is just random text", source);
    expect(result.error).not.toBeNull();
    expect(result.articles).toHaveLength(0);
  });

  it("有効XMLだがRSS/Atom以外の形式でエラーを返す", async () => {
    const result = await parseFeed(
      '<?xml version="1.0"?><root><data>hello</data></root>',
      source
    );
    expect(result.error).not.toBeNull();
    expect(result.articles).toHaveLength(0);
  });
});

describe("parseFeed - 最大20件制限", () => {
  it("20件を超える記事は切り捨てる", async () => {
    const source = { id: "big", name: "Big Feed", category: "テック" };
    const items = Array.from(
      { length: 25 },
      (_, i) =>
        `<item><title>Art ${i}</title><link>https://example.com/${i}</link></item>`
    ).join("");
    const xml = `<?xml version="1.0"?><rss version="2.0"><channel>${items}</channel></rss>`;
    const result = await parseFeed(xml, source);
    expect(result.articles.length).toBe(20);
  });
});
