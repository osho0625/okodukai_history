/**
 * news-setting-store.js
 * 設定管理（CORSプロキシ候補リスト、デバッグログ、フィードソース管理）
 *
 * 責務: localStorageを使った設定データ・フィードソース一覧の永続化
 * 依存: なし（ブラウザ標準API: localStorage のみ使用）
 */

const SETTINGS_KEY = "family-news-settings";
const FEEDS_KEY = "family-news-feeds";

/**
 * デフォルト設定を返す
 * @returns {object} デフォルト設定オブジェクト
 */
export function getDefaultSettings() {
  return {
    proxies: [
      { name: "allorigins", urlPrefix: "https://api.allorigins.win/get?url=", type: "query" },
      { name: "everyorigin", urlPrefix: "https://everyorigin.jwvbremen.nl/api/get?url=", type: "query" },
      { name: "corslol", urlPrefix: "https://api.cors.lol/?url=", type: "raw" },
    ],
    debugLog: false,
  };
}

/**
 * デフォルトフィードソース配列を返す
 * @returns {FeedSource[]} デフォルトフィードソース一覧
 */
export function getDefaultFeedSources() {
  return [
    // テック
    {
      id: "hacker-news",
      name: "Hacker News",
      url: "https://hnrss.org/frontpage",
      category: "テック",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "publickey",
      name: "Publickey",
      url: "https://www.publickey1.jp/atom.xml",
      category: "テック",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "zenn-trending",
      name: "Zenn Trending",
      url: "https://zenn.dev/feed",
      category: "テック",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "qiita-trending",
      name: "Qiita Trending",
      url: "https://qiita.com/popular-items/feed",
      category: "テック",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "hatena-tech",
      name: "はてなブックマーク テクノロジー",
      url: "https://b.hatena.ne.jp/hotentry/it.rss",
      category: "テック",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    // ゲーム
    {
      id: "minecraft-news",
      name: "Minecraft公式ニュース",
      url: "https://www.minecraft.net/en-us/feeds/community-content/rss",
      category: "ゲーム",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "nintendo-news",
      name: "任天堂ニュース",
      url: "https://www.nintendo.co.jp/rss/news.xml",
      category: "ゲーム",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "famitsu",
      name: "ファミ通",
      url: "https://www.famitsu.com/feed/",
      category: "ゲーム",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    // おでかけ
    {
      id: "google-news-athletic",
      name: "Googleニュース（アスレチック 公園）",
      url: "https://news.google.com/rss/search?q=アスレチック+公園&hl=ja&gl=JP&ceid=JP:ja",
      category: "おでかけ",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
    {
      id: "hatena-athletic",
      name: "はてなブックマーク検索（アスレチック）",
      url: "https://b.hatena.ne.jp/search/tag?q=アスレチック&mode=rss",
      category: "おでかけ",
      enabled: true,
      lastSuccessAt: "",
      errorCount: 0,
      lastError: "",
      lastErrorAt: "",
    },
  ];
}

/**
 * 設定をlocalStorageから読み込み
 * 保存データがない場合はデフォルト設定を返す
 * @returns {object} 設定オブジェクト
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    const settings = JSON.parse(raw);
    if (!settings || typeof settings !== "object") return getDefaultSettings();
    return settings;
  } catch {
    return getDefaultSettings();
  }
}

/**
 * 設定をlocalStorageに保存
 * @param {object} settings - 保存する設定オブジェクト
 * @returns {boolean} 保存成功
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/**
 * フィードソース一覧読み込み（初回起動時はデフォルト登録）
 * @returns {FeedSource[]} フィードソース配列
 */
export function loadFeedSources() {
  try {
    const raw = localStorage.getItem(FEEDS_KEY);
    if (!raw) {
      // 初回起動: デフォルトフィードを登録して返す
      const defaults = getDefaultFeedSources();
      saveFeedSources(defaults);
      return defaults;
    }
    const sources = JSON.parse(raw);
    if (!Array.isArray(sources)) {
      const defaults = getDefaultFeedSources();
      saveFeedSources(defaults);
      return defaults;
    }
    return sources;
  } catch {
    const defaults = getDefaultFeedSources();
    saveFeedSources(defaults);
    return defaults;
  }
}

/**
 * フィードソース一覧保存
 * @param {FeedSource[]} sources - フィードソース配列
 * @returns {boolean} 保存成功
 */
export function saveFeedSources(sources) {
  try {
    localStorage.setItem(FEEDS_KEY, JSON.stringify(sources));
    return true;
  } catch {
    return false;
  }
}

/**
 * フィードソース追加（ID自動生成）
 * @param {object} source - 追加するフィードソース（id以外のフィールド）
 * @returns {FeedSource|null} 追加されたフィードソース（失敗時null）
 */
export function addFeedSource(source) {
  if (!source || !source.name || !source.url || !source.category) {
    return null;
  }
  if (!isValidUrl(source.url)) {
    return null;
  }

  const sources = loadFeedSources();
  const newSource = {
    id: generateId(source.name),
    name: source.name,
    url: source.url,
    category: source.category,
    enabled: source.enabled !== undefined ? source.enabled : true,
    lastSuccessAt: "",
    errorCount: 0,
    lastError: "",
    lastErrorAt: "",
  };

  // ID重複回避
  if (sources.some((s) => s.id === newSource.id)) {
    newSource.id = newSource.id + "-" + Date.now().toString(36);
  }

  sources.push(newSource);
  saveFeedSources(sources);
  return newSource;
}

/**
 * フィードソース削除
 * @param {string} id - 削除対象のフィードソースID
 * @returns {boolean} 削除成功
 */
export function removeFeedSource(id) {
  if (!id) return false;
  const sources = loadFeedSources();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length === sources.length) return false; // 対象なし
  saveFeedSources(filtered);
  return true;
}

/**
 * フィードソース更新（enabled切替、エラー情報更新等）
 * @param {string} id - 更新対象のフィードソースID
 * @param {object} updates - 更新するフィールド
 * @returns {FeedSource|null} 更新後のフィードソース（失敗時null）
 */
export function updateFeedSource(id, updates) {
  if (!id || !updates || typeof updates !== "object") return null;
  const sources = loadFeedSources();
  const index = sources.findIndex((s) => s.id === id);
  if (index === -1) return null;

  // id は変更不可
  const { id: _ignoreId, ...safeUpdates } = updates;
  sources[index] = { ...sources[index], ...safeUpdates };
  saveFeedSources(sources);
  return sources[index];
}

/**
 * URL形式バリデーション
 * @param {string} url - 検証するURL文字列
 * @returns {boolean} 有効なURL形式かどうか
 */
export function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  // スペースが含まれている場合は無効
  if (/\s/.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    // http または https のみ許可
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * デバッグログが有効か判定
 * @returns {boolean} デバッグログ有効フラグ
 */
export function isDebugLogEnabled() {
  const settings = loadSettings();
  return settings.debugLog === true;
}

// --- 内部ヘルパー関数 ---

/**
 * 名前からIDを生成する（kebab-case化）
 * @param {string} name - ソース名
 * @returns {string} 生成されたID
 */
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u3000-\u9fff\uff00-\uffef]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || ("feed-" + Date.now().toString(36));
}

// エクスポート（テスト用に内部定数も公開）
export const _internals = {
  SETTINGS_KEY,
  FEEDS_KEY,
  generateId,
};
