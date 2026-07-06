/**
 * Property Tests: ランダムレシピのカテゴリフィルタ
 *
 * **Property 19: ランダムレシピのカテゴリフィルタ**
 * **Validates: Requirements 9.3**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterByCategory } from '../js/recipe-search.js';

// --- Generators ---

const categoryArb = fc.constantFrom('主菜', '副菜', '汁物', 'デザート', 'お弁当', 'お菓子');

const recipeArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  category: categoryArb,
  status: fc.constant('published')
});

const recipesArb = fc.array(recipeArb, { minLength: 0, maxLength: 30 });

// --- Property 19: ランダムレシピのカテゴリフィルタ ---

describe('Property 19: ランダムレシピのカテゴリフィルタ', () => {
  it('filtered results only contain recipes with matching category', () => {
    fc.assert(
      fc.property(
        recipesArb,
        categoryArb,
        (recipes, category) => {
          const result = filterByCategory(recipes, category);
          for (const r of result) {
            expect(r.category).toBe(category);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all recipes with matching category appear in result', () => {
    fc.assert(
      fc.property(
        recipesArb,
        categoryArb,
        (recipes, category) => {
          const result = filterByCategory(recipes, category);
          const expected = recipes.filter(r => r.category === category);
          expect(result.length).toBe(expected.length);
          for (const r of expected) {
            expect(result.some(res => res.id === r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('null/empty category returns all recipes', () => {
    fc.assert(
      fc.property(
        recipesArb,
        fc.constantFrom(null, '', undefined),
        (recipes, category) => {
          const result = filterByCategory(recipes, category);
          expect(result.length).toBe(recipes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result is a subset of original recipes (no new elements)', () => {
    fc.assert(
      fc.property(
        recipesArb,
        categoryArb,
        (recipes, category) => {
          const result = filterByCategory(recipes, category);
          expect(result.length).toBeLessThanOrEqual(recipes.length);
          for (const r of result) {
            expect(recipes.some(orig => orig.id === r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
