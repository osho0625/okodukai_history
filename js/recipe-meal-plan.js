// recipe-meal-plan.js — 献立ロジック
// Implemented in Task 20

/**
 * 指定日の献立を取得
 * @param {string} date - 'YYYY-MM-DD'
 * @returns {Promise<{data: Array, error: object|null}>}
 */
async function loadMealPlan(date) {
  return await MealPlanRepository.getByDate(date);
}

/**
 * 献立を保存（UPSERT）
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} mealType - '朝' | '昼' | '夜'
 * @param {object} slots - {main: recipeId|null, side: recipeId|null, soup: recipeId|null}
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function saveMealPlan(date, mealType, slots) {
  return await MealPlanRepository.save(date, mealType, slots);
}
