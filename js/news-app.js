/**
 * news-app.js
 * UI制御・タブ切替・イベントハンドリング（Phase 1機能）
 *
 * 責務: ページ初期化、記事表示、カテゴリフィルタ、更新、オフライン検出
 * 依存: news-feed-service.js, news-article-store.js, news-setting-store.js
 */

import { fetchAllFeeds } from './news-feed-service.js';
import { loadCache, saveToCache, getDisplayArticles } from './news-article-store.js';
import { loadFeedSources, loadSettings, saveSettings, isDebugLogEnabled, updateFeedSource, addFeedSource, removeFeedSource, isValidUrl } from './news-setting-store.js';
import { loadFavorites, addFavorite, removeFavorite, isFavorite } from './news-favorite-store.js';

// --- カテゴリアイコンマッピング ---
const CATEGORY_ICONS = {
  'テック': '💻',
  'ゲーム': '🎮',
  'おでかけ': '🏞️',
};
const DEFAULT_ICON = '📰';

// --- アプリ状態 ---
let currentCategory = 'all';
let allArticles = [];
let isLoading = false;

// --- DOM要素キャッシュ ---
let els = {};

/**
 * DOM要素を取得・キャッシュする
 */
function cacheElements() {
  els = {
    articleList: document.getElementById('article-list'),
    loadingIndicator: document.getElementById('loading-indicator'),
    errorBanner: document.getElementById('error-banner'),
    errorBannerText: document.getElementById('error-banner-text'),
    offlineBanner: document.getElementById('offline-banner'),
    refreshBtn: document.getElementById('refresh-btn'),
    tabLatest: document.getElementById('tab-latest'),
    tabFavorites: document.getElementById('tab-favorites'),
    tabSettings: document.getElementById('tab-settings'),
  };
}

// --- デバッグログ ---

/**
 * デバッグログ出力（成功）
 * @param {string} message
 */
function debugLog(message) {
  if (isDebugLogEnabled()) {
    console.log(`[News] ${message}`);
  }
}

/**
 * デバッグログ出力（警告/失敗）
 * @param {string} message
 */
function debugWarn(message) {
  if (isDebugLogEnabled()) {
    console.warn(`[News] ${message}`);
  }
}

// --- 相対時間表示 ---

/**
 * 公開日時を相対時間テキストに変換する
 * @param {string} isoDate - ISO8601日時文字列
 * @returns {string} 相対時間（例: "3時間前", "2日前"）
 */
function formatRelativeTime(isoDate) {
  if (!isoDate) return '';
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  if (isNaN(date)) return '';
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}日前`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}ヶ月前`;
  return `${Math.floor(diffMonth / 12)}年前`;
}

// --- 記事カードレンダリング ---

/**
 * カテゴリに対応するアイコンを返す
 * @param {string} category
 * @returns {string} 絵文字アイコン
 */
function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || DEFAULT_ICON;
}

/**
 * 記事カードDOM要素を生成する（textContentで安全にレンダリング）
 * @param {object} article - 記事オブジェクト
 * @returns {HTMLElement}
 */
function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'article-card-header';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'article-category-icon';
  iconSpan.setAttribute('aria-label', article.sourceCategory || 'その他');
  iconSpan.textContent = getCategoryIcon(article.sourceCategory);

  const sourceSpan = document.createElement('span');
  sourceSpan.className = 'article-source';
  sourceSpan.textContent = article.sourceName || '';

  const dateSpan = document.createElement('span');
  dateSpan.className = 'article-date';
  dateSpan.textContent = formatRelativeTime(article.publishedAt);

  header.appendChild(iconSpan);
  header.appendChild(sourceSpan);
  header.appendChild(dateSpan);

  // タイトル
  const titleDiv = document.createElement('div');
  titleDiv.className = 'article-title';
  const titleLink = document.createElement('a');
  titleLink.href = article.url || '#';
  titleLink.target = '_blank';
  titleLink.rel = 'noopener';
  titleLink.textContent = article.title || '';
  titleDiv.appendChild(titleLink);

  // 概要
  const descDiv = document.createElement('div');
  descDiv.className = 'article-description';
  descDiv.textContent = (article.description || '').slice(0, 100);

  // フッター
  const footer = document.createElement('div');
  footer.className = 'article-card-footer';
  const favBtn = document.createElement('button');
  favBtn.className = 'favorite-btn';
  favBtn.setAttribute('data-article-id', article.id || '');

  const favorited = isFavorite(article.id);
  if (favorited) {
    favBtn.classList.add('is-favorite');
    favBtn.setAttribute('aria-label', 'お気に入りから削除');
    favBtn.textContent = '★';
  } else {
    favBtn.setAttribute('aria-label', 'お気に入りに追加');
    favBtn.textContent = '☆';
  }

  // お気に入りボタンクリックイベント
  favBtn.addEventListener('click', () => {
    const currentlyFavorited = isFavorite(article.id);
    if (currentlyFavorited) {
      removeFavorite(article.id);
      // 現在のタブに応じてUI更新
      const activeTab = document.querySelector('.tab.active');
      const tabName = activeTab ? activeTab.getAttribute('data-tab') : 'latest';
      if (tabName === 'favorites') {
        // お気に入りタブでは削除後にリスト再描画
        renderFavoritesTab();
      } else {
        // 最新タブではアイコン切替のみ
        favBtn.classList.remove('is-favorite');
        favBtn.setAttribute('aria-label', 'お気に入りに追加');
        favBtn.textContent = '☆';
      }
    } else {
      addFavorite(article);
      favBtn.classList.add('is-favorite');
      favBtn.setAttribute('aria-label', 'お気に入りから削除');
      favBtn.textContent = '★';
    }
  });

  footer.appendChild(favBtn);

  card.appendChild(header);
  card.appendChild(titleDiv);
  card.appendChild(descDiv);
  card.appendChild(footer);

  return card;
}

// --- 記事一覧表示 ---

/**
 * 記事配列をソートして表示する
 * @param {Array} articles - 記事配列
 */
function renderArticles(articles) {
  if (!els.articleList) return;

  // 公開日時降順ソート
  const sorted = sortArticlesByDate(articles);

  // カテゴリフィルタ適用
  const filtered = filterByCategory(sorted, currentCategory);

  // 最大100件に制限
  const limited = filtered.slice(0, 100);

  // DOM更新
  els.articleList.innerHTML = '';
  if (limited.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '記事がありません';
    els.articleList.appendChild(emptyMsg);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const article of limited) {
    fragment.appendChild(createArticleCard(article));
  }
  els.articleList.appendChild(fragment);
}

/**
 * 記事を公開日時降順でソートする
 * @param {Array} articles
 * @returns {Array}
 */
export function sortArticlesByDate(articles) {
  return [...articles].sort((a, b) => {
    const dateA = a.publishedAt || '';
    const dateB = b.publishedAt || '';
    return dateB.localeCompare(dateA);
  });
}

/**
 * カテゴリでフィルタリングする
 * @param {Array} articles
 * @param {string} category - カテゴリ名（'all'で全件）
 * @returns {Array}
 */
export function filterByCategory(articles, category) {
  if (!category || category === 'all') return articles;
  return articles.filter((a) => a.sourceCategory === category);
}

// --- ローディング・エラーUI ---

/**
 * ローディング表示を切り替える
 * @param {boolean} show
 */
function showLoading(show) {
  if (els.loadingIndicator) {
    els.loadingIndicator.style.display = show ? '' : 'none';
  }
}

/**
 * エラーバナーを表示する
 * @param {number} errorCount - 失敗フィード件数
 */
function showErrorBanner(errorCount) {
  if (els.errorBanner && els.errorBannerText) {
    els.errorBannerText.textContent = `一部フィードの取得に失敗しました（${errorCount}件）`;
    els.errorBanner.style.display = '';
  }
}

/**
 * エラーバナーを非表示にする
 */
function hideErrorBanner() {
  if (els.errorBanner) {
    els.errorBanner.style.display = 'none';
  }
}

/**
 * オフラインバナー表示/非表示
 * @param {boolean} show
 */
function showOfflineBanner(show) {
  if (els.offlineBanner) {
    els.offlineBanner.style.display = show ? '' : 'none';
  }
}

// --- お気に入りタブ ---

/**
 * お気に入りタブの記事一覧をレンダリングする
 * loadFavorites()の結果をcreateArticleCardで表示（descriptionは空文字）
 */
function renderFavoritesTab() {
  const favoritesList = document.getElementById('favorites-list');
  const favoritesEmpty = document.getElementById('favorites-empty');
  if (!favoritesList) return;

  const favorites = loadFavorites();

  // DOM更新
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    if (favoritesEmpty) favoritesEmpty.style.display = '';
    return;
  }

  if (favoritesEmpty) favoritesEmpty.style.display = 'none';

  const fragment = document.createDocumentFragment();
  for (const fav of favorites) {
    // descriptionは空文字として渡す（FavoriteArticleにはdescriptionがない）
    const articleForCard = {
      id: fav.id,
      title: fav.title,
      url: fav.url,
      sourceName: fav.sourceName,
      sourceCategory: fav.sourceCategory,
      publishedAt: fav.publishedAt,
      description: '',
    };
    fragment.appendChild(createArticleCard(articleForCard));
  }
  favoritesList.appendChild(fragment);
}

// --- タブ切替 ---

/**
 * タブ切替処理
 * @param {string} tabName - タブ名（'latest', 'favorites', 'settings'）
 */
function switchTab(tabName) {
  // タブボタンの状態を更新
  const tabBtns = document.querySelectorAll('.tab[data-tab]');
  tabBtns.forEach((btn) => {
    const isSelected = btn.getAttribute('data-tab') === tabName;
    btn.classList.toggle('active', isSelected);
    btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  // タブコンテンツの表示切替
  const sections = { latest: els.tabLatest, favorites: els.tabFavorites, settings: els.tabSettings };
  for (const [name, section] of Object.entries(sections)) {
    if (section) {
      const isActive = name === tabName;
      section.style.display = isActive ? '' : 'none';
      section.classList.toggle('active', isActive);
    }
  }

  // 設定タブを開いたら再描画
  if (tabName === 'settings') {
    renderSettingsTab();
  }

  // お気に入りタブを開いたら再描画
  if (tabName === 'favorites') {
    renderFavoritesTab();
  }
}

// --- カテゴリフィルタ ---

/**
 * カテゴリフィルターボタンのクリック処理
 * @param {string} category
 */
function handleCategoryFilter(category) {
  currentCategory = category;

  // ボタンのactive状態を更新
  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  filterBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });

  // 記事を再レンダリング
  renderArticles(allArticles);
}

// --- フィード取得 ---

/**
 * 全フィードを取得し、記事を更新する
 */
async function refreshFeeds() {
  if (isLoading) return;

  // オフラインチェック
  if (!navigator.onLine) {
    showOfflineBanner(true);
    debugWarn('オフラインのためフィード取得をスキップ');
    return;
  }

  isLoading = true;
  showLoading(true);
  hideErrorBanner();

  // 部分結果蓄積用のリストをリセット
  allArticles = [];

  const sources = loadFeedSources();
  const settings = loadSettings();
  const proxies = settings.proxies || [];

  try {
    const enabledSources = sources.filter((s) => s.enabled);
    const { articles, errors } = await fetchAllFeeds(sources, proxies, (source, partialArticles) => {
      // 部分結果コールバック: 取得完了分から順次表示
      debugLog(`${source.name}: ${partialArticles.length}件取得`);

      // 部分結果を追加してソート・表示
      allArticles = [...allArticles, ...partialArticles];
      renderArticles(allArticles);
    });

    // 全フィード取得完了: 全記事で再ソート
    allArticles = sortArticlesByDate(articles);
    renderArticles(allArticles);

    // キャッシュ保存
    if (articles.length > 0) {
      saveToCache(articles);
      debugLog(`キャッシュ保存完了: ${articles.length}件`);
    }

    // エラー処理
    if (errors.length > 0) {
      showErrorBanner(errors.length);
      for (const { source, error } of errors) {
        debugWarn(`${source.name}: ${error.type} - ${error.message}`);
        // フィードソースのエラー情報を永続化
        updateFeedSource(source.id, {
          errorCount: source.errorCount,
          lastError: source.lastError,
          lastErrorAt: source.lastErrorAt,
        });
      }
    }

    // 成功したソースの状態を永続化（fetchAllFeeds内でsource objectが更新されている）
    for (const source of enabledSources) {
      if (source.errorCount === 0 && source.lastSuccessAt) {
        updateFeedSource(source.id, {
          errorCount: 0,
          lastSuccessAt: source.lastSuccessAt,
          lastError: '',
          lastErrorAt: '',
        });
      }
    }
  } catch (err) {
    debugWarn(`フィード取得中に予期しないエラー: ${err.message}`);
    showErrorBanner(1);
  } finally {
    isLoading = false;
    showLoading(false);
  }
}

// --- オフライン検出 ---

/**
 * オフライン状態の監視を開始する
 */
function setupOfflineDetection() {
  // 初期状態チェック
  if (!navigator.onLine) {
    showOfflineBanner(true);
  }

  window.addEventListener('online', () => {
    showOfflineBanner(false);
    debugLog('オンライン復帰 - フィードを再取得します');
    refreshFeeds();
  });

  window.addEventListener('offline', () => {
    showOfflineBanner(true);
    debugWarn('オフラインになりました');
  });
}

// --- イベントリスナー ---

/**
 * イベントリスナーを設定する
 */
function setupEventListeners() {
  // 更新ボタン
  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', () => {
      refreshFeeds();
    });
  }

  // タブ切替
  const tabBtns = document.querySelectorAll('.tab[data-tab]');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // カテゴリフィルター
  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      handleCategoryFilter(category);
    });
  });

  // バナー閉じるボタン
  const closeBtns = document.querySelectorAll('.banner-close');
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const banner = btn.closest('.banner');
      if (banner) {
        banner.style.display = 'none';
      }
    });
  });

  // 設定タブ: フィード追加フォーム
  setupFeedAddForm();

  // 設定タブ: プロキシ追加フォーム
  setupProxyAddForm();
}

// --- 設定タブ: フィードソース管理 ---

/**
 * フィードのステータスアイコンを取得
 * @param {number} errorCount - 連続エラー回数
 * @returns {string} ステータス絵文字
 */
function getFeedStatusIcon(errorCount) {
  if (errorCount === 0) return '🟢';
  if (errorCount <= 2) return '🟡';
  return '🔴';
}

/**
 * フィードソースリストをレンダリングする
 */
function renderFeedSourceList() {
  const container = document.getElementById('feed-source-list');
  if (!container) return;

  const sources = loadFeedSources();
  container.innerHTML = '';

  if (sources.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = 'フィードソースがありません';
    container.appendChild(emptyMsg);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const source of sources) {
    fragment.appendChild(createFeedSourceItem(source));
  }
  container.appendChild(fragment);
}

/**
 * フィードソースアイテムのDOM要素を生成する
 * @param {object} source - フィードソースオブジェクト
 * @returns {HTMLElement}
 */
function createFeedSourceItem(source) {
  const item = document.createElement('div');
  item.className = 'feed-source-item';
  item.setAttribute('data-feed-id', source.id);

  // ステータスアイコン
  const statusIcon = document.createElement('span');
  statusIcon.className = 'feed-status-icon';
  statusIcon.textContent = getFeedStatusIcon(source.errorCount || 0);

  // フィード情報
  const info = document.createElement('div');
  info.className = 'feed-source-info';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'feed-source-name';
  nameSpan.textContent = source.name;

  const categorySpan = document.createElement('span');
  categorySpan.className = 'feed-source-category';
  const categoryIcon = getCategoryIcon(source.category);
  categorySpan.textContent = `${categoryIcon} ${source.category}`;

  info.appendChild(nameSpan);
  info.appendChild(categorySpan);

  // 有効/無効トグル
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle-switch';

  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = source.enabled !== false;
  toggleInput.className = 'feed-enabled-toggle';
  toggleInput.setAttribute('data-feed-id', source.id);

  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'toggle-slider';

  toggleLabel.appendChild(toggleInput);
  toggleLabel.appendChild(toggleSlider);

  // 有効/無効トグルイベント
  toggleInput.addEventListener('change', () => {
    updateFeedSource(source.id, { enabled: toggleInput.checked });
    debugLog(`${source.name}: ${toggleInput.checked ? '有効' : '無効'}に変更`);
  });

  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'feed-delete-btn';
  deleteBtn.setAttribute('data-feed-id', source.id);
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.textContent = '🗑️';

  deleteBtn.addEventListener('click', () => {
    handleDeleteFeedSource(source);
  });

  item.appendChild(statusIcon);
  item.appendChild(info);
  item.appendChild(toggleLabel);
  item.appendChild(deleteBtn);

  return item;
}

/**
 * フィードソース削除ハンドラ（確認ダイアログ付き）
 * @param {object} source - 削除対象のフィードソース
 */
function handleDeleteFeedSource(source) {
  const confirmed = confirm(`「${source.name}」を削除しますか？\n※記事キャッシュとお気に入りは保持されます`);
  if (!confirmed) return;

  removeFeedSource(source.id);
  debugLog(`フィードソース削除: ${source.name}`);
  renderFeedSourceList();
}

/**
 * フィード追加フォームのイベント設定
 */
function setupFeedAddForm() {
  const addBtn = document.getElementById('feed-add-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', handleAddFeedSource);
}

/**
 * フィード追加ハンドラ
 */
function handleAddFeedSource() {
  const nameInput = document.getElementById('feed-add-name');
  const urlInput = document.getElementById('feed-add-url');
  const categorySelect = document.getElementById('feed-add-category');
  const errorEl = document.getElementById('feed-add-error');

  if (!nameInput || !urlInput || !categorySelect || !errorEl) return;

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  const category = categorySelect.value;

  // バリデーション
  if (!name) {
    showFeedAddError('フィード名を入力してください');
    return;
  }

  if (!url) {
    showFeedAddError('URLを入力してください');
    return;
  }

  if (!isValidUrl(url)) {
    showFeedAddError('有効なURLを入力してください');
    return;
  }

  // 追加実行
  const result = addFeedSource({ name, url, category });
  if (result) {
    // フォームリセット
    nameInput.value = '';
    urlInput.value = '';
    hideFeedAddError();
    debugLog(`フィードソース追加: ${name}`);
    renderFeedSourceList();
  } else {
    showFeedAddError('フィードの追加に失敗しました');
  }
}

/**
 * フィード追加エラーメッセージ表示
 * @param {string} message
 */
function showFeedAddError(message) {
  const errorEl = document.getElementById('feed-add-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = '';
  }
}

/**
 * フィード追加エラーメッセージ非表示
 */
function hideFeedAddError() {
  const errorEl = document.getElementById('feed-add-error');
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

// --- 設定タブ: CORSプロキシ管理 ---

/**
 * CORSプロキシリストをレンダリングする
 */
function renderProxyList() {
  const container = document.getElementById('proxy-list');
  if (!container) return;

  const settings = loadSettings();
  const proxies = settings.proxies || [];
  container.innerHTML = '';

  if (proxies.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = 'プロキシがありません';
    container.appendChild(emptyMsg);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < proxies.length; i++) {
    fragment.appendChild(createProxyItem(proxies[i], i, proxies.length));
  }
  container.appendChild(fragment);
}

/**
 * プロキシアイテムのDOM要素を生成する
 * @param {object} proxy - プロキシ設定オブジェクト
 * @param {number} index - 配列内のインデックス
 * @param {number} total - 配列の全長
 * @returns {HTMLElement}
 */
function createProxyItem(proxy, index, total) {
  const item = document.createElement('div');
  item.className = 'proxy-item';

  // 順番表示
  const orderSpan = document.createElement('span');
  orderSpan.className = 'proxy-order';
  orderSpan.textContent = `${index + 1}`;

  // プロキシ情報
  const info = document.createElement('div');
  info.className = 'proxy-info';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'proxy-name';
  nameSpan.textContent = proxy.name;

  const urlSpan = document.createElement('span');
  urlSpan.className = 'proxy-url';
  urlSpan.textContent = proxy.urlPrefix;

  info.appendChild(nameSpan);
  info.appendChild(urlSpan);

  // アクションボタン
  const actions = document.createElement('div');
  actions.className = 'proxy-actions';

  // 上移動ボタン
  const upBtn = document.createElement('button');
  upBtn.className = 'proxy-move-btn';
  upBtn.textContent = '⬆️';
  upBtn.setAttribute('aria-label', '上に移動');
  upBtn.disabled = index === 0;
  upBtn.addEventListener('click', () => {
    moveProxy(index, index - 1);
  });

  // 下移動ボタン
  const downBtn = document.createElement('button');
  downBtn.className = 'proxy-move-btn';
  downBtn.textContent = '⬇️';
  downBtn.setAttribute('aria-label', '下に移動');
  downBtn.disabled = index === total - 1;
  downBtn.addEventListener('click', () => {
    moveProxy(index, index + 1);
  });

  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'proxy-delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.addEventListener('click', () => {
    removeProxy(index);
  });

  actions.appendChild(upBtn);
  actions.appendChild(downBtn);
  actions.appendChild(deleteBtn);

  item.appendChild(orderSpan);
  item.appendChild(info);
  item.appendChild(actions);

  return item;
}

/**
 * プロキシの順番を入れ替える
 * @param {number} fromIndex - 移動元インデックス
 * @param {number} toIndex - 移動先インデックス
 */
function moveProxy(fromIndex, toIndex) {
  const settings = loadSettings();
  const proxies = settings.proxies || [];
  if (toIndex < 0 || toIndex >= proxies.length) return;

  const [moved] = proxies.splice(fromIndex, 1);
  proxies.splice(toIndex, 0, moved);
  settings.proxies = proxies;
  saveSettings(settings);
  renderProxyList();
}

/**
 * プロキシを削除する
 * @param {number} index - 削除対象のインデックス
 */
function removeProxy(index) {
  const settings = loadSettings();
  const proxies = settings.proxies || [];
  if (index < 0 || index >= proxies.length) return;

  proxies.splice(index, 1);
  settings.proxies = proxies;
  saveSettings(settings);
  renderProxyList();
}

/**
 * プロキシ追加フォームのイベント設定
 */
function setupProxyAddForm() {
  const addBtn = document.getElementById('proxy-add-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', handleAddProxy);
}

/**
 * プロキシ追加ハンドラ
 */
function handleAddProxy() {
  const nameInput = document.getElementById('proxy-add-name');
  const urlInput = document.getElementById('proxy-add-url');

  if (!nameInput || !urlInput) return;

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) return;

  const settings = loadSettings();
  if (!settings.proxies) settings.proxies = [];

  settings.proxies.push({ name, urlPrefix: url, type: 'raw' });
  saveSettings(settings);

  // フォームリセット
  nameInput.value = '';
  urlInput.value = '';

  debugLog(`プロキシ追加: ${name}`);
  renderProxyList();
}

// --- 設定タブ: デバッグログ設定 ---

/**
 * デバッグログトグルの初期化とイベント設定
 */
function setupDebugToggle() {
  const toggle = document.getElementById('debug-log-toggle');
  if (!toggle) return;

  // 現在の設定を反映
  const settings = loadSettings();
  toggle.checked = settings.debugLog === true;

  // 重複登録防止: 既存リスナーを解除してから再登録
  toggle.onchange = () => {
    const settings = loadSettings();
    settings.debugLog = toggle.checked;
    saveSettings(settings);
  };
}

// --- 設定タブ: 通知設定 ---

/**
 * Supabaseクライアントを取得する（common.jsのCDN経由）
 * @returns {object|null} Supabaseクライアント、または未初期化ならnull
 */
function getSupabaseClient() {
  if (window.supabase && window.supabase.createClient) {
    // CDNから読み込まれたsupabaseライブラリが利用可能
    const url = 'https://ynecezxnltigplrfzzoh.supabase.co';
    const key = 'sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4';
    return window.supabase.createClient(url, key);
  }
  return null;
}

// Supabaseクライアントをキャッシュ
let _supabaseClient = null;
function getSupabase() {
  if (!_supabaseClient) {
    _supabaseClient = getSupabaseClient();
  }
  return _supabaseClient;
}

/**
 * 通知設定トグルの初期化とイベント設定
 * - Supabaseのpush_subscriptionsから現在の端末のnews_notification_enabled状態を取得
 * - トグル変更時にpush_subscriptionsテーブルを更新
 * - Notification.permission === 'denied'の場合は案内メッセージ表示
 */
async function setupNotificationToggle() {
  const toggle = document.getElementById('news-notify-toggle');
  const statusEl = document.getElementById('news-notify-status');
  if (!toggle || !statusEl) return;

  // ブラウザ通知がサポートされていない場合
  if (!('Notification' in window)) {
    toggle.disabled = true;
    statusEl.textContent = 'このブラウザはプッシュ通知に対応していません';
    statusEl.style.display = '';
    return;
  }

  // ブラウザで通知が拒否されている場合
  if (Notification.permission === 'denied') {
    toggle.disabled = true;
    toggle.checked = false;
    statusEl.textContent = 'ブラウザの設定で通知が無効になっています。ブラウザの設定から通知を許可してください。';
    statusEl.style.display = '';
    return;
  }

  // Supabaseクライアントが利用可能か確認
  const sb = getSupabase();
  if (!sb) {
    toggle.disabled = true;
    statusEl.textContent = '通知設定を読み込めませんでした（Supabase未初期化）';
    statusEl.style.display = '';
    return;
  }

  // 現在の端末のdevice_idを取得
  const deviceId = localStorage.getItem('push_device_id');
  if (!deviceId) {
    toggle.disabled = true;
    statusEl.textContent = 'プッシュ通知が未登録です。先に通知を許可してください。';
    statusEl.style.display = '';
    return;
  }

  // push_subscriptionsから現在の端末のnews_notification_enabled状態を取得
  try {
    const { data, error } = await sb
      .from('push_subscriptions')
      .select('news_notification_enabled')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      // カラムが存在しない場合のフォールバック（42703 = undefined column）
      if (error.code === '42703' || error.message?.includes('news_notification_enabled')) {
        toggle.disabled = true;
        statusEl.textContent = '通知設定カラムが未追加です（管理者にお問い合わせください）';
        statusEl.style.display = '';
        return;
      }
      debugWarn(`通知設定の読み込みに失敗: ${error.message}`);
      toggle.disabled = true;
      statusEl.textContent = '通知設定の読み込みに失敗しました';
      statusEl.style.display = '';
      return;
    }

    if (!data) {
      // このデバイスのサブスクリプションが存在しない
      toggle.disabled = true;
      statusEl.textContent = 'プッシュ通知が未登録です。先に通知を許可してください。';
      statusEl.style.display = '';
      return;
    }

    // 現在の状態をトグルに反映
    toggle.checked = data.news_notification_enabled === true;
    toggle.disabled = false;
    statusEl.style.display = 'none';
  } catch (e) {
    debugWarn(`通知設定の読み込み中にエラー: ${e.message}`);
    toggle.disabled = true;
    statusEl.textContent = '通知設定の読み込みに失敗しました';
    statusEl.style.display = '';
    return;
  }

  // トグル変更時のイベントリスナー（重複登録防止: onchangeで上書き）
  toggle.onchange = async () => {
    const enabled = toggle.checked;
    toggle.disabled = true;

    try {
      const { error } = await sb
        .from('push_subscriptions')
        .update({ news_notification_enabled: enabled })
        .eq('device_id', deviceId);

      if (error) {
        debugWarn(`通知設定の更新に失敗: ${error.message}`);
        // トグルを元に戻す
        toggle.checked = !enabled;
        statusEl.textContent = '設定の更新に失敗しました';
        statusEl.style.display = '';
        setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
      } else {
        debugLog(`ニュース通知: ${enabled ? 'ON' : 'OFF'}`);
        statusEl.style.display = 'none';
      }
    } catch (e) {
      debugWarn(`通知設定の更新中にエラー: ${e.message}`);
      toggle.checked = !enabled;
      statusEl.textContent = '設定の更新に失敗しました';
      statusEl.style.display = '';
      setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
    } finally {
      toggle.disabled = false;
    }
  };
}

// --- 設定タブ: 統合レンダリング ---

/**
 * 設定タブ全体をレンダリングする
 */
function renderSettingsTab() {
  renderFeedSourceList();
  renderProxyList();
  setupDebugToggle();
  setupNotificationToggle();
}

// --- 初期化 ---

/**
 * アプリ初期化（stale-while-revalidate戦略）
 * 1. キャッシュ読み込み → 即時表示
 * 2. バックグラウンドで最新フィードを取得
 */
function init() {
  cacheElements();
  setupEventListeners();
  setupOfflineDetection();

  // Step 1: キャッシュから即時表示
  const cached = loadCache();
  if (cached.length > 0) {
    allArticles = cached;
    renderArticles(allArticles);
    debugLog(`キャッシュから${cached.length}件表示`);
  }

  // Step 2: バックグラウンドでフィード取得
  refreshFeeds();
}

// DOMContentLoaded で初期化実行
document.addEventListener('DOMContentLoaded', init);
