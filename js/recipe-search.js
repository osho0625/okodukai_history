// recipe-search.js — 検索ロジック（純粋関数）
// Implemented in Task 9+

/**
 * テキスト部分一致検索
 * @param {object} recipe - {title, description, category, author, recipe_tags: [{tag}]}
 * @param {string} query - 検索クエリ
 * @returns {boolean}
 */
function matchesTextSearch(recipe, query) {
  // Case-insensitive partial match on: title, description, category, author, tags
  // Returns true if query appears in any of them
  if (!query || query.trim() === '') return true;
  var q = query.toLowerCase();
  var fields = [
    recipe.title || '',
    recipe.description || '',
    recipe.category || '',
    recipe.author || ''
  ];
  // Add tags
  var tags = (recipe.recipe_tags || []).map(function(t) { return typeof t === 'string' ? t : t.tag; });
  fields = fields.concat(tags);
  return fields.some(function(f) { return f.toLowerCase().includes(q); });
}

/**
 * レシピリストソート
 * @param {Array} recipes
 * @param {string} mode - 'newest'|'oldest'|'name'|'favorite'|'recent'
 * @param {object} [favoriteCounts] - {recipeId: count}
 * @param {object} [cookStats] - {recipeId: {count, lastCookedAt}}
 * @returns {Array} sorted copy
 */
function sortRecipes(recipes, mode, favoriteCounts, cookStats) {
  var sorted = recipes.slice();
  switch (mode) {
    case 'newest':
      sorted.sort(function(a, b) { return (b.updated_at || '').localeCompare(a.updated_at || ''); });
      break;
    case 'oldest':
      sorted.sort(function(a, b) { return (a.updated_at || '').localeCompare(b.updated_at || ''); });
      break;
    case 'name':
      sorted.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
      break;
    case 'favorite':
      favoriteCounts = favoriteCounts || {};
      sorted.sort(function(a, b) { return (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0); });
      break;
    case 'recent':
      cookStats = cookStats || {};
      sorted.sort(function(a, b) {
        var dateA = (cookStats[a.id] || {}).lastCookedAt || '';
        var dateB = (cookStats[b.id] || {}).lastCookedAt || '';
        return dateB.localeCompare(dateA);
      });
      break;
  }
  return sorted;
}

/**
 * 可視性フィルタ
 * @param {Array} recipes
 * @param {string} currentUser - current user name
 * @returns {Array} visible recipes
 */
function filterVisibleRecipes(recipes, currentUser) {
  return recipes.filter(function(r) {
    if (r.status === 'published') return true;
    if ((r.status === 'draft' || r.status === 'private') && r.author === currentUser) return true;
    return false;
  });
}

/**
 * お気に入りフィルタ
 * @param {Array} recipes
 * @param {string[]} userFavorites - recipe_id array
 * @returns {Array}
 */
function filterFavorites(recipes, userFavorites) {
  if (!userFavorites || userFavorites.length === 0) return [];
  return recipes.filter(function(r) { return userFavorites.includes(r.id); });
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { matchesTextSearch, sortRecipes, filterVisibleRecipes, filterFavorites };
}
