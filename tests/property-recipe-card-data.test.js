/**
 * Property Test: レシピカードデータ完全性
 * **Property 3: レシピカードデータ完全性**
 * **Validates: Requirements 2.2, 4.13**
 *
 * For any recipe data, recipeCardData() returns an object that has ALL of:
 * title, author, category, cookTimeMinutes, servings, isFavorite (boolean), thumbnailUrl fields.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const { recipeCardData } = require('../js/recipe-utils.js');

// Generator: recipe object as returned from Supabase with joined tables
const recipeArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  author: fc.string({ minLength: 1 }),
  category: fc.constantFrom('主菜', '副菜', '汁物', 'デザート', 'お弁当', 'お菓子', ''),
  cook_time_minutes: fc.oneof(fc.integer({ min: 1, max: 300 }), fc.constant(null)),
  servings: fc.string(),
  status: fc.constantFrom('published', 'draft', 'private'),
  recipe_photos: fc.array(
    fc.record({
      url: fc.webUrl(),
      sort_order: fc.integer({ min: 0, max: 10 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  recipe_tags: fc.array(
    fc.record({ tag: fc.string({ minLength: 1, maxLength: 20 }) }),
    { minLength: 0, maxLength: 5 }
  ),
  recipe_favorites: fc.array(
    fc.record({ user_name: fc.string({ minLength: 1 }) }),
    { minLength: 0, maxLength: 3 }
  ),
});

// Generator: userFavorites (array of recipe_ids)
const userFavoritesArb = fc.array(fc.uuid(), { minLength: 0, maxLength: 10 });

// Generator: cookStats map
const cookStatsArb = fc.dictionary(
  fc.uuid(),
  fc.record({
    count: fc.integer({ min: 0, max: 100 }),
    lastCookedAt: fc.oneof(
      fc.constant(null),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString())
    ),
  })
);

describe('Property 3: レシピカードデータ完全性', () => {
  it('recipeCardData always returns object with all required fields', () => {
    fc.assert(
      fc.property(recipeArb, userFavoritesArb, cookStatsArb, (recipe, userFavorites, cookStats) => {
        const result = recipeCardData(recipe, userFavorites, cookStats);

        // All required fields must exist
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('author');
        expect(result).toHaveProperty('category');
        expect(result).toHaveProperty('cookTimeMinutes');
        expect(result).toHaveProperty('servings');
        expect(result).toHaveProperty('isFavorite');
        expect(result).toHaveProperty('thumbnailUrl');

        // isFavorite must be boolean
        expect(typeof result.isFavorite).toBe('boolean');

        // thumbnailUrl must be string or null
        expect(result.thumbnailUrl === null || typeof result.thumbnailUrl === 'string').toBe(true);

        // tags must be an array
        expect(Array.isArray(result.tags)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('isFavorite is true when recipe.id is in userFavorites', () => {
    fc.assert(
      fc.property(recipeArb, cookStatsArb, (recipe, cookStats) => {
        // Include recipe.id in favorites
        const userFavorites = [recipe.id];
        const result = recipeCardData(recipe, userFavorites, cookStats);
        expect(result.isFavorite).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('isFavorite is false when recipe.id is NOT in userFavorites', () => {
    fc.assert(
      fc.property(recipeArb, cookStatsArb, (recipe, cookStats) => {
        // Exclude recipe.id from favorites
        const userFavorites = ['not-this-id-1', 'not-this-id-2'];
        const result = recipeCardData(recipe, userFavorites, cookStats);
        expect(result.isFavorite).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('thumbnailUrl is from sort_order=0 photo or null', () => {
    fc.assert(
      fc.property(recipeArb, userFavoritesArb, cookStatsArb, (recipe, userFavorites, cookStats) => {
        const result = recipeCardData(recipe, userFavorites, cookStats);
        const photos = recipe.recipe_photos || [];
        const firstPhoto = photos.find(p => p.sort_order === 0);

        if (firstPhoto) {
          expect(result.thumbnailUrl).toBe(firstPhoto.url);
        } else {
          expect(result.thumbnailUrl).toBe(null);
        }
      }),
      { numRuns: 100 }
    );
  });
});
