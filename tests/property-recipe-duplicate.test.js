/**
 * Property Tests: レシピ複製データ保持
 *
 * **Property 20: レシピ複製データ保持**
 * **Validates: Requirements 10.2, 10.4**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { duplicateRecipeData } from '../js/recipe-utils.js';

// --- Generators ---

const ingredientArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),
  quantity: fc.string({ minLength: 0, maxLength: 10 }),
  memo: fc.string({ minLength: 0, maxLength: 20 }),
  sort_order: fc.nat({ max: 50 })
});

const stepArb = fc.record({
  description: fc.string({ minLength: 1, maxLength: 50 }),
  sort_order: fc.nat({ max: 50 })
});

const tagArb = fc.record({
  tag: fc.string({ minLength: 1, maxLength: 20 })
});

const photoArb = fc.record({
  id: fc.uuid(),
  url: fc.webUrl(),
  type: fc.constantFrom('main', 'step'),
  sort_order: fc.nat({ max: 10 })
});

const recipeArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ minLength: 0, maxLength: 50 }),
  author: fc.string({ minLength: 1, maxLength: 15 }),
  category: fc.constantFrom('主菜', '副菜', '汁物', 'デザート', 'お弁当', 'お菓子'),
  cook_time_minutes: fc.nat({ max: 300 }),
  servings: fc.string({ minLength: 1, maxLength: 10 }),
  recipe_ingredients: fc.array(ingredientArb, { minLength: 0, maxLength: 10 }),
  recipe_steps: fc.array(stepArb, { minLength: 0, maxLength: 10 }),
  recipe_tags: fc.array(tagArb, { minLength: 0, maxLength: 5 }),
  recipe_photos: fc.array(photoArb, { minLength: 0, maxLength: 5 })
});

// --- Property 20: レシピ複製データ保持 ---

describe('Property 20: レシピ複製データ保持', () => {
  it('title has "のコピー" suffix', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          expect(dup.title).toBe(recipe.title + 'のコピー');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('ingredients are copied with same name, quantity, memo', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          const origIngs = recipe.recipe_ingredients || [];
          expect(dup.ingredients.length).toBe(origIngs.length);
          for (let i = 0; i < origIngs.length; i++) {
            expect(dup.ingredients[i].name).toBe(origIngs[i].name);
            expect(dup.ingredients[i].quantity).toBe(origIngs[i].quantity || '');
            expect(dup.ingredients[i].memo).toBe(origIngs[i].memo || '');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('steps are copied with same description', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          const origSteps = recipe.recipe_steps || [];
          expect(dup.steps.length).toBe(origSteps.length);
          for (let i = 0; i < origSteps.length; i++) {
            expect(dup.steps[i].description).toBe(origSteps[i].description || '');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tags are copied', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          const origTags = (recipe.recipe_tags || []).map(t => typeof t === 'string' ? t : t.tag);
          expect(dup.tags).toEqual(origTags);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('category, cook_time_minutes, servings are copied', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          expect(dup.category).toBe(recipe.category || '');
          expect(dup.cook_time_minutes).toBe(recipe.cook_time_minutes || null);
          expect(dup.servings).toBe(recipe.servings || '');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('photos are NOT copied (no photos field in result)', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const dup = duplicateRecipeData(recipe);
          expect(dup.photos).toBeUndefined();
          expect(dup.recipe_photos).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
