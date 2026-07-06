/**
 * Property Tests: 材料検索・冷蔵庫検索
 *
 * **Property 6: 材料検索 AND/OR ロジック**
 * **Validates: Requirements 3.2, 3.4**
 *
 * **Property 7: OR検索一致数順ソート**
 * **Validates: Requirements 3.6**
 *
 * **Property 8: 冷蔵庫検索（不足品数＋不足率ソート）**
 * **Validates: Requirements 3.7**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { searchByIngredientsLogic, searchFridgeLogic } from '../js/recipe-search.js';

// --- Generators ---

const ingredientArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 })
});

const recipeWithIngredientsArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  recipe_ingredients: fc.array(ingredientArb, { minLength: 1, maxLength: 8 })
});

const recipesArb = fc.array(recipeWithIngredientsArb, { minLength: 1, maxLength: 10 });

const searchNamesArb = fc.array(
  fc.string({ minLength: 1, maxLength: 15 }),
  { minLength: 1, maxLength: 5 }
);

// --- Property 6: 材料検索 AND/OR ロジック ---

describe('Property 6: 材料検索 AND/OR ロジック', () => {
  it('AND mode: all results contain ALL specified ingredients (partial match)', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          // Pick ingredient names from existing recipes to ensure meaningful tests
          if (recipes.length === 0) return;
          const firstRecipe = recipes[0];
          const ings = firstRecipe.recipe_ingredients;
          if (ings.length === 0) return;
          // Use first ingredient name as search term
          const names = [ings[0].name];

          const result = searchByIngredientsLogic(recipes, names, 'and');
          for (const r of result) {
            const ingNames = r.recipe_ingredients.map(i => i.name.toLowerCase());
            for (const name of names) {
              const searchTerm = name.toLowerCase();
              const hasMatch = ingNames.some(n => n.includes(searchTerm));
              expect(hasMatch).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('AND mode: recipes with all specified ingredients are included', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          if (recipes.length === 0) return;
          const targetRecipe = recipes[0];
          const ings = targetRecipe.recipe_ingredients;
          if (ings.length === 0) return;
          // Search for one ingredient from the target recipe
          const names = [ings[0].name];

          const result = searchByIngredientsLogic(recipes, names, 'and');
          // The target recipe should be in results (it has that ingredient)
          const ingNames = targetRecipe.recipe_ingredients.map(i => i.name.toLowerCase());
          const allMatch = names.every(n => ingNames.some(ing => ing.includes(n.toLowerCase())));
          if (allMatch) {
            expect(result.some(r => r.id === targetRecipe.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('OR mode: all results contain at least one specified ingredient', () => {
    fc.assert(
      fc.property(
        recipesArb,
        searchNamesArb,
        (recipes, names) => {
          const result = searchByIngredientsLogic(recipes, names, 'or');
          for (const r of result) {
            const ingNames = r.recipe_ingredients.map(i => i.name.toLowerCase());
            const hasAny = names.some(name => {
              const searchTerm = name.toLowerCase();
              return ingNames.some(n => n.includes(searchTerm));
            });
            expect(hasAny).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty names returns all recipes', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          const resultAnd = searchByIngredientsLogic(recipes, [], 'and');
          const resultOr = searchByIngredientsLogic(recipes, [], 'or');
          expect(resultAnd.length).toBe(recipes.length);
          expect(resultOr.length).toBe(recipes.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 7: OR検索一致数順ソート ---

describe('Property 7: OR検索一致数順ソート', () => {
  it('OR results are sorted by matchCount DESC', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          // Generate search names from existing ingredients to ensure matches
          const allIngNames = recipes.flatMap(r => r.recipe_ingredients.map(i => i.name));
          if (allIngNames.length < 2) return;
          // Pick 2-3 unique ingredient names
          const uniqueNames = [...new Set(allIngNames)].slice(0, 3);
          if (uniqueNames.length === 0) return;

          const result = searchByIngredientsLogic(recipes, uniqueNames, 'or');

          // Verify sort order by computing match counts
          for (let i = 0; i < result.length - 1; i++) {
            const ingNamesA = result[i].recipe_ingredients.map(ing => ing.name.toLowerCase());
            const ingNamesB = result[i + 1].recipe_ingredients.map(ing => ing.name.toLowerCase());

            const countA = uniqueNames.filter(name => {
              const term = name.toLowerCase();
              return ingNamesA.some(n => n.includes(term));
            }).length;

            const countB = uniqueNames.filter(name => {
              const term = name.toLowerCase();
              return ingNamesB.some(n => n.includes(term));
            }).length;

            expect(countA).toBeGreaterThanOrEqual(countB);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 8: 冷蔵庫検索（不足品数＋不足率ソート） ---

describe('Property 8: 冷蔵庫検索（不足品数＋不足率ソート）', () => {
  it('all results have missing ingredients <= 2', () => {
    fc.assert(
      fc.property(
        recipesArb,
        fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 8 }),
        (recipes, available) => {
          const result = searchFridgeLogic(recipes, available);
          for (const r of result) {
            const ings = r.recipe_ingredients.map(i => i.name.toLowerCase());
            const totalCount = ings.length;
            let matchedCount = 0;
            for (const ing of ings) {
              const found = available.some(a => ing.includes(a.toLowerCase()) || a.toLowerCase().includes(ing));
              if (found) matchedCount++;
            }
            const missingCount = totalCount - matchedCount;
            expect(missingCount).toBeLessThanOrEqual(2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('results are sorted by deficiency ratio ASC', () => {
    fc.assert(
      fc.property(
        recipesArb,
        fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 8 }),
        (recipes, available) => {
          const result = searchFridgeLogic(recipes, available);

          for (let i = 0; i < result.length - 1; i++) {
            const ingsA = result[i].recipe_ingredients.map(ing => ing.name.toLowerCase());
            const ingsB = result[i + 1].recipe_ingredients.map(ing => ing.name.toLowerCase());

            let matchedA = 0;
            for (const ing of ingsA) {
              if (available.some(a => ing.includes(a.toLowerCase()) || a.toLowerCase().includes(ing))) matchedA++;
            }
            let matchedB = 0;
            for (const ing of ingsB) {
              if (available.some(a => ing.includes(a.toLowerCase()) || a.toLowerCase().includes(ing))) matchedB++;
            }

            const ratioA = ingsA.length === 0 ? 1 : (ingsA.length - matchedA) / ingsA.length;
            const ratioB = ingsB.length === 0 ? 1 : (ingsB.length - matchedB) / ingsB.length;

            expect(ratioA).toBeLessThanOrEqual(ratioB + 1e-10); // floating point tolerance
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty available returns empty array', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          expect(searchFridgeLogic(recipes, [])).toEqual([]);
          expect(searchFridgeLogic(recipes, null)).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
