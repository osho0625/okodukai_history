/**
 * Property Tests: 調理回数・最終日時集計 / よく作る・最近作ったセクション順序
 *
 * **Property 13: 調理回数・最終日時集計**
 * **Validates: Requirements 5.6**
 *
 * **Property 14: よく作る/最近作ったセクション順序**
 * **Validates: Requirements 5.7, 9.5, 9.6**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const { computeCookStats, getTopRecipes } = require('../js/recipe-utils.js');

// Generator: cook history record
const historyRecordArb = fc.record({
  recipe_id: fc.uuid(),
  user_name: fc.string({ minLength: 1, maxLength: 10 }),
  created_at: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
});

describe('Property 13: 調理回数・最終日時集計', () => {
  it('count equals number of records, lastCookedAt equals MAX created_at', () => {
    fc.assert(
      fc.property(
        fc.array(historyRecordArb, { minLength: 0, maxLength: 50 }),
        (records) => {
          const result = computeCookStats(records);

          // count equals the number of records
          expect(result.count).toBe(records.length);

          if (records.length === 0) {
            // empty → null
            expect(result.lastCookedAt).toBe(null);
          } else {
            // lastCookedAt equals the MAX of created_at
            const maxDate = records.reduce((max, r) => {
              return r.created_at > max ? r.created_at : max;
            }, records[0].created_at);
            expect(result.lastCookedAt).toBe(maxDate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns {count: 0, lastCookedAt: null} for empty array', () => {
    const result = computeCookStats([]);
    expect(result).toEqual({ count: 0, lastCookedAt: null });
  });

  it('returns {count: 0, lastCookedAt: null} for null/undefined input', () => {
    expect(computeCookStats(null)).toEqual({ count: 0, lastCookedAt: null });
    expect(computeCookStats(undefined)).toEqual({ count: 0, lastCookedAt: null });
  });
});

// Generators for getTopRecipes
const recipeArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
});

const statsEntryArb = fc.record({
  count: fc.integer({ min: 0, max: 100 }),
  lastCookedAt: fc.oneof(
    fc.constant(null),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString())
  ),
});

describe('Property 14: よく作る/最近作ったセクション順序', () => {
  it('"popular" mode returns recipes sorted by count DESC, limited to top N', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (recipes, limit) => {
          // Generate statsMap that covers all recipe ids
          const statsMap = {};
          for (const r of recipes) {
            statsMap[r.id] = {
              count: Math.floor(Math.random() * 50),
              lastCookedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
            };
          }

          const result = getTopRecipes(recipes, statsMap, 'popular', limit);

          // Result length must be <= limit and <= recipes.length
          expect(result.length).toBeLessThanOrEqual(limit);
          expect(result.length).toBeLessThanOrEqual(recipes.length);

          // Sorted by count DESC
          for (let i = 0; i < result.length - 1; i++) {
            const countA = (statsMap[result[i].id] || { count: 0 }).count;
            const countB = (statsMap[result[i + 1].id] || { count: 0 }).count;
            expect(countA).toBeGreaterThanOrEqual(countB);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('"recent" mode returns recipes sorted by lastCookedAt DESC, limited to top N', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (recipes, limit) => {
          // Generate statsMap with non-null lastCookedAt for all
          const statsMap = {};
          for (const r of recipes) {
            statsMap[r.id] = {
              count: Math.floor(Math.random() * 50),
              lastCookedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
            };
          }

          const result = getTopRecipes(recipes, statsMap, 'recent', limit);

          // Result length must be <= limit and <= recipes.length
          expect(result.length).toBeLessThanOrEqual(limit);
          expect(result.length).toBeLessThanOrEqual(recipes.length);

          // Sorted by lastCookedAt DESC
          for (let i = 0; i < result.length - 1; i++) {
            const dateA = (statsMap[result[i].id] || { lastCookedAt: '' }).lastCookedAt || '';
            const dateB = (statsMap[result[i + 1].id] || { lastCookedAt: '' }).lastCookedAt || '';
            expect(dateA >= dateB).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('default limit is 5 when not specified', () => {
    const recipes = Array.from({ length: 10 }, (_, i) => ({ id: `id-${i}`, title: `Recipe ${i}` }));
    const statsMap = {};
    recipes.forEach((r, i) => {
      statsMap[r.id] = { count: i, lastCookedAt: new Date(2024, 0, i + 1).toISOString() };
    });

    const result = getTopRecipes(recipes, statsMap, 'popular');
    expect(result.length).toBe(5);
  });

  it('returns empty array when recipes array is empty', () => {
    const result = getTopRecipes([], {}, 'popular', 5);
    expect(result).toEqual([]);
  });

  it('handles recipes with no stats (treats as count=0, lastCookedAt=null)', () => {
    const recipes = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ];
    const statsMap = { 'a': { count: 3, lastCookedAt: '2024-01-01T00:00:00Z' } };

    const popular = getTopRecipes(recipes, statsMap, 'popular', 5);
    expect(popular[0].id).toBe('a');

    const recent = getTopRecipes(recipes, statsMap, 'recent', 5);
    expect(recent[0].id).toBe('a');
  });
});
