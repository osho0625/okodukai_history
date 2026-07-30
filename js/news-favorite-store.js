/**
 * news-favorite-store.js
 * お気に入り記事管理モジュール
 * localStorageを利用してお気に入り記事を永続化する
 *
 * FavoriteArticle型:
 *   id: string           - Article.idと同一
 *   title: string        - 記事タイトル
 *   url: string          - 記事URL
 *   sourceName: string   - フィードソース表示名
 *   sourceCategory: string - カテゴリ
 *   publishedAt: string  - 公開日時（ISO8601）
 *   savedAt: string      - 保存日時（ISO8601）
 */

const FAVORITES_KEY = "family-news-favorites";
const MAX_FAVORITES = 100;

/**
 * お気に入り一覧を読み込み
 * @returns {FavoriteArticle[]} お気に入り記事（保存日時降順）
 */
export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // 保存日時降順でソート
    return parsed.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  } catch (e) {
    console.warn("[News] お気に入りデータの読み込みに失敗しました:", e.message);
    return [];
  }
}

/**
 * 記事をお気に入りに追加（上限100件管理）
 * descriptionは保存しない（容量節約）
 * @param {Article} article - 対象記事
 * @returns {{added: boolean, removed: FavoriteArticle|null}} 追加結果
 */
export function addFavorite(article) {
  if (!article || !article.id) {
    return { added: false, removed: null };
  }

  const favorites = loadFavorites();

  // 既にお気に入りに存在する場合は追加しない
  if (favorites.some((f) => f.id === article.id)) {
    return { added: false, removed: null };
  }

  // 軽量データのみ抽出（descriptionは除外）
  const favoriteArticle = {
    id: article.id,
    title: article.title || "",
    url: article.url || "",
    sourceName: article.sourceName || "",
    sourceCategory: article.sourceCategory || "",
    publishedAt: article.publishedAt || "",
    savedAt: new Date().toISOString(),
  };

  // 先頭に追加
  favorites.unshift(favoriteArticle);

  // 上限超過時は最古のものを自動削除
  let removed = null;
  if (favorites.length > MAX_FAVORITES) {
    // savedAtが最古のものを削除
    const oldestIndex = favorites.reduce((minIdx, item, idx, arr) => {
      return new Date(item.savedAt).getTime() <
        new Date(arr[minIdx].savedAt).getTime()
        ? idx
        : minIdx;
    }, 0);
    removed = favorites.splice(oldestIndex, 1)[0];
    console.warn(
      `[News] お気に入りが上限${MAX_FAVORITES}件を超えたため、最古の記事「${removed.title}」を自動削除しました`
    );
  }

  // localStorageに保存
  saveFavorites(favorites);

  return { added: true, removed };
}

/**
 * お気に入りから削除
 * @param {string} articleId - 記事ID
 * @returns {boolean} 削除成功
 */
export function removeFavorite(articleId) {
  if (!articleId) return false;

  const favorites = loadFavorites();
  const initialLength = favorites.length;
  const filtered = favorites.filter((f) => f.id !== articleId);

  if (filtered.length === initialLength) {
    return false; // 該当記事が見つからなかった
  }

  saveFavorites(filtered);
  return true;
}

/**
 * 記事IDがお気に入りかどうか判定
 * @param {string} articleId - 記事ID
 * @returns {boolean}
 */
export function isFavorite(articleId) {
  if (!articleId) return false;

  const favorites = loadFavorites();
  return favorites.some((f) => f.id === articleId);
}

/**
 * お気に入り配列をlocalStorageに保存（内部関数）
 * @param {FavoriteArticle[]} favorites
 */
function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn("[News] お気に入りの保存に失敗しました:", e.message);
  }
}

// テスト用に内部定数をエクスポート
export const _internals = {
  FAVORITES_KEY,
  MAX_FAVORITES,
  saveFavorites,
};
