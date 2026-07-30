/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  getDefaultSettings,
  getDefaultFeedSources,
  loadSettings,
  saveSettings,
  loadFeedSources,
  saveFeedSources,
  addFeedSource,
  removeFeedSource,
  updateFeedSource,
  isValidUrl,
  isDebugLogEnabled,
  _internals,
} from "../js/news-setting-store.js";

const { SETTINGS_KEY, FEEDS_KEY, FEEDS_VERSION, FEEDS_VERSION_KEY, SETTINGS_VERSION, SETTINGS_VERSION_KEY } = _internals;

beforeEach(() => {
  localStorage.clear();
  // バージョンキーを設定して、マイグレーションによるリセットを回避
  localStorage.setItem(FEEDS_VERSION_KEY, String(FEEDS_VERSION));
  localStorage.setItem(SETTINGS_VERSION_KEY, String(SETTINGS_VERSION));
});

describe("getDefaultSettings", () => {
  it("デフォルト設定にプロキシ2件とdebugLog=falseが含まれる", () => {
    const settings = getDefaultSettings();
    expect(settings.proxies).toHaveLength(2);
    expect(settings.proxies[0].name).toBe("allorigins-raw");
    expect(settings.proxies[1].name).toBe("allorigins-json");
    expect(settings.debugLog).toBe(false);
  });

  it("各プロキシにname, urlPrefix, typeフィールドがある", () => {
    const settings = getDefaultSettings();
    for (const proxy of settings.proxies) {
      expect(proxy).toHaveProperty("name");
      expect(proxy).toHaveProperty("urlPrefix");
      expect(proxy).toHaveProperty("type");
      expect(["raw", "query"]).toContain(proxy.type);
    }
  });
});

describe("getDefaultFeedSources", () => {
  it("デフォルトフィードソースが7件ある", () => {
    const sources = getDefaultFeedSources();
    expect(sources).toHaveLength(7);
  });

  it("テック3件、ゲーム3件、おでかけ1件のカテゴリ構成", () => {
    const sources = getDefaultFeedSources();
    const tech = sources.filter((s) => s.category === "テック");
    const game = sources.filter((s) => s.category === "ゲーム");
    const outing = sources.filter((s) => s.category === "おでかけ");
    expect(tech).toHaveLength(3);
    expect(game).toHaveLength(3);
    expect(outing).toHaveLength(1);
  });

  it("全フィードソースがFeedSource型の必須フィールドを持つ", () => {
    const sources = getDefaultFeedSources();
    for (const source of sources) {
      expect(source).toHaveProperty("id");
      expect(source).toHaveProperty("name");
      expect(source).toHaveProperty("url");
      expect(source).toHaveProperty("category");
      expect(source).toHaveProperty("enabled");
      expect(source).toHaveProperty("lastSuccessAt");
      expect(source).toHaveProperty("errorCount");
      expect(source).toHaveProperty("lastError");
      expect(source).toHaveProperty("lastErrorAt");
      expect(source.enabled).toBe(true);
      expect(source.errorCount).toBe(0);
    }
  });

  it("全フィードソースのURLが有効", () => {
    const sources = getDefaultFeedSources();
    for (const source of sources) {
      expect(isValidUrl(source.url)).toBe(true);
    }
  });
});

describe("loadSettings / saveSettings", () => {
  it("localStorageが空の場合はデフォルト設定を返す", () => {
    const settings = loadSettings();
    expect(settings).toEqual(getDefaultSettings());
  });

  it("保存した設定を正しく読み込める（ラウンドトリップ）", () => {
    const custom = {
      proxies: [{ name: "test", urlPrefix: "https://test.com/?url=", type: "raw" }],
      debugLog: true,
    };
    saveSettings(custom);
    const loaded = loadSettings();
    expect(loaded).toEqual(custom);
  });

  it("不正なJSONが保存されている場合はデフォルト設定を返す", () => {
    localStorage.setItem(SETTINGS_KEY, "invalid json{{{");
    const settings = loadSettings();
    expect(settings).toEqual(getDefaultSettings());
  });

  it("null値が保存されている場合はデフォルト設定を返す", () => {
    localStorage.setItem(SETTINGS_KEY, "null");
    const settings = loadSettings();
    expect(settings).toEqual(getDefaultSettings());
  });

  it("saveSettingsはtrueを返す", () => {
    const result = saveSettings({ proxies: [], debugLog: false });
    expect(result).toBe(true);
  });
});

describe("loadFeedSources / saveFeedSources", () => {
  it("初回起動時はデフォルトフィードを登録して返す", () => {
    const sources = loadFeedSources();
    expect(sources).toHaveLength(7);
    // localStorageにも保存されている
    const raw = localStorage.getItem(FEEDS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw)).toHaveLength(7);
  });

  it("保存したフィードソースを正しく読み込める", () => {
    const custom = [
      {
        id: "custom-feed",
        name: "Custom",
        url: "https://example.com/feed",
        category: "テック",
        enabled: true,
        lastSuccessAt: "",
        errorCount: 0,
        lastError: "",
        lastErrorAt: "",
      },
    ];
    saveFeedSources(custom);
    const loaded = loadFeedSources();
    expect(loaded).toEqual(custom);
  });

  it("不正なJSONの場合はデフォルトに戻す", () => {
    localStorage.setItem(FEEDS_KEY, "not valid json");
    const sources = loadFeedSources();
    expect(sources).toHaveLength(7);
  });

  it("配列でないデータの場合はデフォルトに戻す", () => {
    localStorage.setItem(FEEDS_KEY, JSON.stringify({ not: "array" }));
    const sources = loadFeedSources();
    expect(sources).toHaveLength(7);
  });
});

describe("addFeedSource", () => {
  it("有効なフィードソースを追加できる", () => {
    saveFeedSources([]);
    const result = addFeedSource({
      name: "Test Feed",
      url: "https://example.com/rss",
      category: "テック",
    });
    expect(result).not.toBeNull();
    expect(result.id).toBeTruthy();
    expect(result.name).toBe("Test Feed");
    expect(result.url).toBe("https://example.com/rss");
    expect(result.category).toBe("テック");
    expect(result.enabled).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  it("追加後にlocalStorageに永続化される", () => {
    saveFeedSources([]);
    addFeedSource({
      name: "Persisted Feed",
      url: "https://example.com/feed",
      category: "ゲーム",
    });
    const sources = loadFeedSources();
    expect(sources).toHaveLength(1);
    expect(sources[0].name).toBe("Persisted Feed");
  });

  it("nameが空の場合はnullを返す", () => {
    const result = addFeedSource({ name: "", url: "https://example.com", category: "テック" });
    expect(result).toBeNull();
  });

  it("urlが無効な場合はnullを返す", () => {
    const result = addFeedSource({ name: "Test", url: "not-a-url", category: "テック" });
    expect(result).toBeNull();
  });

  it("categoryが空の場合はnullを返す", () => {
    const result = addFeedSource({ name: "Test", url: "https://example.com", category: "" });
    expect(result).toBeNull();
  });

  it("IDが重複する場合は一意なIDを生成する", () => {
    saveFeedSources([
      {
        id: "test-feed",
        name: "Test Feed",
        url: "https://example.com/1",
        category: "テック",
        enabled: true,
        lastSuccessAt: "",
        errorCount: 0,
        lastError: "",
        lastErrorAt: "",
      },
    ]);
    const result = addFeedSource({
      name: "Test Feed",
      url: "https://example.com/2",
      category: "テック",
    });
    expect(result).not.toBeNull();
    expect(result.id).not.toBe("test-feed");
  });

  it("enabled指定なしの場合はデフォルトtrue", () => {
    saveFeedSources([]);
    const result = addFeedSource({
      name: "New",
      url: "https://example.com/feed",
      category: "テック",
    });
    expect(result.enabled).toBe(true);
  });

  it("enabled: falseを指定できる", () => {
    saveFeedSources([]);
    const result = addFeedSource({
      name: "Disabled",
      url: "https://example.com/feed",
      category: "テック",
      enabled: false,
    });
    expect(result.enabled).toBe(false);
  });
});

describe("removeFeedSource", () => {
  it("指定IDのフィードソースを削除できる", () => {
    saveFeedSources([
      {
        id: "to-remove",
        name: "Remove Me",
        url: "https://example.com",
        category: "テック",
        enabled: true,
        lastSuccessAt: "",
        errorCount: 0,
        lastError: "",
        lastErrorAt: "",
      },
      {
        id: "keep",
        name: "Keep Me",
        url: "https://example.com/keep",
        category: "テック",
        enabled: true,
        lastSuccessAt: "",
        errorCount: 0,
        lastError: "",
        lastErrorAt: "",
      },
    ]);
    const result = removeFeedSource("to-remove");
    expect(result).toBe(true);
    const sources = loadFeedSources();
    expect(sources).toHaveLength(1);
    expect(sources[0].id).toBe("keep");
  });

  it("存在しないIDの場合はfalseを返す", () => {
    saveFeedSources([]);
    const result = removeFeedSource("non-existent");
    expect(result).toBe(false);
  });

  it("空文字列IDの場合はfalseを返す", () => {
    const result = removeFeedSource("");
    expect(result).toBe(false);
  });

  it("nullの場合はfalseを返す", () => {
    const result = removeFeedSource(null);
    expect(result).toBe(false);
  });
});

describe("updateFeedSource", () => {
  beforeEach(() => {
    saveFeedSources([
      {
        id: "update-target",
        name: "Original",
        url: "https://example.com/feed",
        category: "テック",
        enabled: true,
        lastSuccessAt: "",
        errorCount: 0,
        lastError: "",
        lastErrorAt: "",
      },
    ]);
  });

  it("enabled状態を更新できる", () => {
    const result = updateFeedSource("update-target", { enabled: false });
    expect(result).not.toBeNull();
    expect(result.enabled).toBe(false);
    // localStorageにも反映
    const sources = loadFeedSources();
    expect(sources[0].enabled).toBe(false);
  });

  it("エラー情報を更新できる", () => {
    const result = updateFeedSource("update-target", {
      errorCount: 3,
      lastError: "proxy_timeout",
      lastErrorAt: "2025-01-15T10:00:00Z",
    });
    expect(result.errorCount).toBe(3);
    expect(result.lastError).toBe("proxy_timeout");
    expect(result.lastErrorAt).toBe("2025-01-15T10:00:00Z");
  });

  it("成功時のステータスリセット", () => {
    updateFeedSource("update-target", { errorCount: 2, lastError: "network_error" });
    const result = updateFeedSource("update-target", {
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
      lastSuccessAt: "2025-01-15T12:00:00Z",
    });
    expect(result.errorCount).toBe(0);
    expect(result.lastError).toBe("");
    expect(result.lastSuccessAt).toBe("2025-01-15T12:00:00Z");
  });

  it("idフィールドは変更されない", () => {
    const result = updateFeedSource("update-target", { id: "hacked-id", name: "New Name" });
    expect(result.id).toBe("update-target");
    expect(result.name).toBe("New Name");
  });

  it("存在しないIDの場合はnullを返す", () => {
    const result = updateFeedSource("non-existent", { enabled: false });
    expect(result).toBeNull();
  });

  it("updatesがnullの場合はnullを返す", () => {
    const result = updateFeedSource("update-target", null);
    expect(result).toBeNull();
  });
});

describe("isValidUrl", () => {
  it("httpsのURLは有効", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("httpのURLは有効", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("スキームなしは無効", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });

  it("空文字列は無効", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("nullは無効", () => {
    expect(isValidUrl(null)).toBe(false);
  });

  it("undefinedは無効", () => {
    expect(isValidUrl(undefined)).toBe(false);
  });

  it("スペースを含むURLは無効", () => {
    expect(isValidUrl("https://example .com")).toBe(false);
  });

  it("ftp等の非http(s)スキームは無効", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("file:///etc/hosts")).toBe(false);
  });

  it("日本語を含むURLは有効", () => {
    expect(isValidUrl("https://example.com/search?q=アスレチック")).toBe(true);
  });
});

describe("isDebugLogEnabled", () => {
  it("デフォルトではfalse", () => {
    expect(isDebugLogEnabled()).toBe(false);
  });

  it("設定でtrueの場合はtrue", () => {
    saveSettings({ ...getDefaultSettings(), debugLog: true });
    expect(isDebugLogEnabled()).toBe(true);
  });

  it("設定でfalseの場合はfalse", () => {
    saveSettings({ ...getDefaultSettings(), debugLog: false });
    expect(isDebugLogEnabled()).toBe(false);
  });
});
