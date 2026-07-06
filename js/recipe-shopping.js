// recipe-shopping.js — 買い物リストロジック
// Implemented in Task 19

/**
 * レシピの材料を買い物リストに追加
 * @param {string} recipeId - レシピID
 * @param {Array<{name: string, quantity: string}>} ingredients - 選択された材料リスト
 * @returns {Promise<{error: object|null}>}
 */
async function addToShoppingList(recipeId, ingredients) {
  var items = ingredients.map(function(ing) {
    return { ingredient_name: ing.name, quantity: ing.quantity };
  });
  return await ShoppingListRepository.addItems(recipeId, items);
}

/**
 * 買い物リストを取得してレシピ別にグループ化
 * @returns {Promise<object>} {recipeName: [{id, ingredient_name, quantity, checked, ...}]}
 */
async function loadShoppingList() {
  var result = await ShoppingListRepository.getAll();
  var items = result.data || [];
  // Group by recipe
  var grouped = {};
  for (var i = 0; i < items.length; i++) {
    var recipeName = (items[i].recipes && items[i].recipes.title) || '（レシピなし）';
    if (!grouped[recipeName]) grouped[recipeName] = [];
    grouped[recipeName].push(items[i]);
  }
  return grouped;
}
