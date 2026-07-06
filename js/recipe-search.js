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

/**
 * タグフィルタ: 指定タグを持つレシピのみ抽出
 * @param {Array} recipes
 * @param {string} tag
 * @returns {Array}
 */
function filterByTag(recipes, tag) {
  return recipes.filter(function(r) {
    var tags = (r.recipe_tags || []).map(function(t) { return typeof t === 'string' ? t : t.tag; });
    return tags.includes(tag);
  });
}

/**
 * アレルギー除外フィルタ: 指定アレルゲンタグを持つレシピを除外
 * @param {Array} recipes
 * @param {string} allergen - アレルゲン名（例: "卵"）
 * @returns {Array}
 */
function filterExcludeAllergy(recipes, allergen) {
  var allergyTag = 'allergy:' + allergen;
  return recipes.filter(function(r) {
    var tags = (r.recipe_tags || []).map(function(t) { return typeof t === 'string' ? t : t.tag; });
    return !tags.includes(allergyTag);
  });
}

/**
 * 素材逆引き検索ロジック（AND/OR）
 * @param {Array} recipes - [{id, recipe_ingredients: [{name}]}]
 * @param {string[]} names - 検索材料名リスト
 * @param {string} mode - 'and' | 'or'
 * @returns {Array} フィルタ＋ソート済みレシピ配列
 */
function searchByIngredientsLogic(recipes, names, mode) {
  if (!names || names.length === 0) return recipes;

  var results = [];
  for (var i = 0; i < recipes.length; i++) {
    var ingNames = (recipes[i].recipe_ingredients || []).map(function(ing) { return ing.name.toLowerCase(); });
    var matchCount = 0;
    for (var j = 0; j < names.length; j++) {
      var searchTerm = names[j].toLowerCase();
      var matched = ingNames.some(function(n) { return n.includes(searchTerm); });
      if (matched) matchCount++;
    }

    if (mode === 'and' && matchCount === names.length) {
      results.push({ recipe: recipes[i], matchCount: matchCount });
    } else if (mode === 'or' && matchCount > 0) {
      results.push({ recipe: recipes[i], matchCount: matchCount });
    }
  }

  // Sort by matchCount DESC (for OR mode ordering, also stable for AND)
  results.sort(function(a, b) { return b.matchCount - a.matchCount; });
  return results.map(function(r) { return r.recipe; });
}

/**
 * 冷蔵庫検索ロジック
 * @param {Array} recipes - [{id, recipe_ingredients: [{name}]}]
 * @param {string[]} available - 手持ち材料名リスト
 * @returns {Array} 不足2品以内のレシピ（不足率昇順）
 */
function searchFridgeLogic(recipes, available) {
  if (!available || available.length === 0) return [];

  var results = [];
  for (var i = 0; i < recipes.length; i++) {
    var ings = (recipes[i].recipe_ingredients || []).map(function(ing) { return ing.name.toLowerCase(); });
    var totalCount = ings.length;
    if (totalCount === 0) continue;

    var matchedCount = 0;
    for (var j = 0; j < ings.length; j++) {
      var found = available.some(function(a) { return ings[j].includes(a.toLowerCase()) || a.toLowerCase().includes(ings[j]); });
      if (found) matchedCount++;
    }

    var missingCount = totalCount - matchedCount;
    if (missingCount <= 2) {
      var ratio = totalCount === 0 ? 1 : missingCount / totalCount;
      results.push({
        recipe: recipes[i],
        missingCount: missingCount,
        ratio: ratio
      });
    }
  }

  // Sort by ratio ASC (lowest deficiency first)
  results.sort(function(a, b) { return a.ratio - b.ratio; });
  return results.map(function(r) { return r.recipe; });
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { matchesTextSearch, sortRecipes, filterVisibleRecipes, filterFavorites, filterByTag, filterExcludeAllergy, searchByIngredientsLogic, searchFridgeLogic };
}
