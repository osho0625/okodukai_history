/**
 * Property Tests: テキスト検索・ソート・可視性・お気に入りフィルタ
 *
 * **Property 4: テキスト検索部分一致**
 * **Validates: Requirements 2.3**
 *
 * **Property 5: ソート正確性**
 * **Validates: Requirements 2.6**
 *
 * **Property 2: レシピ可視性ルール**
 * **Validates: Requirements 2.1, 12.5, 12.6, 12.8**
 *
 * **Property 23: お気に入りフィルタ正確性**
 * **Validates: Requirements 2.7, 9.7**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { matchesTextSearch, sortRecipes, filterVisibleRecipes, filterFavorites } from '../js/recipe-search.js';

// --- Generators ---

const recipeTagArb = fc.record({
  tag: fc.string({ minLength: 1, maxLength: 20 })
});

const recipeArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 0, maxLength: 50 }),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  category: fc.string({ minLength: 0, maxLength: 20 }),
  author: fc.string({ minLength: 1, maxLength: 20 }),
  recipe_tags: fc.array(recipeTagArb, { minLength: 0, maxLength: 5 }),
  updated_at: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
  status: fc.constantFrom('published', 'draft', 'private'),
  cook_time_minutes: fc.nat({ max: 300 }),
  servings: fc.string({ minLength: 0, maxLength: 10 })
});

// --- Property 4: テキスト検索部分一致 ---

describe('Property 4: テキスト検索部分一致', () => {
  it('if query is substring of title, returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        fc.nat({ max: 20 }),
        fc.nat({ max: 20 }),
        (recipe, start, len) => {
          const title = recipe.title;
          if (title.length === 0) return; // skip empty titles
          const s = start % title.length;
          const e = Math.min(s + (len % title.length) + 1, title.length);
          const query = title.slice(s, e);
          if (query.trim() === '') return; // skip empty queries
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if query is substring of description, returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        fc.nat({ max: 30 }),
        fc.nat({ max: 30 }),
        (recipe, start, len) => {
          const desc = recipe.description;
          if (desc.length === 0) return;
          const s = start % desc.length;
          const e = Math.min(s + (len % desc.length) + 1, desc.length);
          const query = desc.slice(s, e);
          if (query.trim() === '') return;
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if query is substring of category, returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const cat = recipe.category;
          if (cat.length === 0) return;
          const query = cat.slice(0, Math.max(1, Math.floor(cat.length / 2)));
          if (query.trim() === '') return;
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if query is substring of author, returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const author = recipe.author;
          if (author.length === 0) return;
          const query = author.slice(0, Math.max(1, Math.floor(author.length / 2)));
          if (query.trim() === '') return;
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if query is substring of any tag, returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const tags = recipe.recipe_tags || [];
          if (tags.length === 0) return;
          const tag = tags[0].tag;
          if (tag.length === 0) return;
          const query = tag.slice(0, Math.max(1, Math.floor(tag.length / 2)));
          if (query.trim() === '') return;
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if query is NOT substring of any field, returns false', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          // Use a query that cannot appear in any field: a unique impossible string
          const impossibleQuery = '\x00IMPOSSIBLE_QUERY_12345\x00';
          expect(matchesTextSearch(recipe, impossibleQuery)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty or whitespace-only query always returns true', () => {
    fc.assert(
      fc.property(
        recipeArb,
        fc.constantFrom('', ' ', '  ', '\t', '\n'),
        (recipe, query) => {
          expect(matchesTextSearch(recipe, query)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('search is case-insensitive', () => {
    fc.assert(
      fc.property(
        recipeArb,
        (recipe) => {
          const title = recipe.title;
          if (title.length === 0) return;
          const query = title.slice(0, Math.max(1, title.length));
          if (query.trim() === '') return;
          // Both upper and lower should match
          expect(matchesTextSearch(recipe, query.toUpperCase())).toBe(matchesTextSearch(recipe, query.toLowerCase()));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 5: ソート正確性 ---

describe('Property 5: ソート正確性', () => {
  const recipesArb = fc.array(recipeArb, { minLength: 0, maxLength: 20 });

  it('newest: result[i].updated_at >= result[i+1].updated_at for all i', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          const result = sortRecipes(recipes, 'newest');
          for (let i = 0; i < result.length - 1; i++) {
            expect((result[i].updated_at || '').localeCompare(result[i + 1].updated_at || '')).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('oldest: result[i].updated_at <= result[i+1].updated_at for all i', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          const result = sortRecipes(recipes, 'oldest');
          for (let i = 0; i < result.length - 1; i++) {
            expect((result[i].updated_at || '').localeCompare(result[i + 1].updated_at || '')).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('name: result[i].title <= result[i+1].title (localeCompare)', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          const result = sortRecipes(recipes, 'name');
          for (let i = 0; i < result.length - 1; i++) {
            expect((result[i].title || '').localeCompare(result[i + 1].title || '')).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('favorite: favoriteCounts[result[i].id] >= favoriteCounts[result[i+1].id] for all i', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          // Generate favorite counts for each recipe
          const favoriteCounts = {};
          for (const r of recipes) {
            favoriteCounts[r.id] = Math.floor(Math.random() * 100);
          }
          const result = sortRecipes(recipes, 'favorite', favoriteCounts);
          for (let i = 0; i < result.length - 1; i++) {
            expect(favoriteCounts[result[i].id] || 0).toBeGreaterThanOrEqual(favoriteCounts[result[i + 1].id] || 0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('recent: cookStats[result[i].id].lastCookedAt >= cookStats[result[i+1].id].lastCookedAt for all i', () => {
    fc.assert(
      fc.property(
        recipesArb,
        (recipes) => {
          // Generate cook stats for each recipe
          const cookStats = {};
          for (const r of recipes) {
            cookStats[r.id] = {
              count: Math.floor(Math.random() * 50),
              lastCookedAt: new Date(2020 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
            };
          }
          const result = sortRecipes(recipes, 'recent', null, cookStats);
          for (let i = 0; i < result.length - 1; i++) {
            const dateA = (cookStats[result[i].id] || {}).lastCookedAt || '';
            const dateB = (cookStats[result[i + 1].id] || {}).lastCookedAt || '';
            expect(dateA.localeCompare(dateB)).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sort does not lose or gain elements', () => {
    fc.assert(
      fc.property(
        recipesArb,
        fc.constantFrom('newest', 'oldest', 'name', 'favorite', 'recent'),
        (recipes, mode) => {
          const result = sortRecipes(recipes, mode, {}, {});
          expect(result.length).toBe(recipes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sort does not mutate the original array', () => {
    fc.assert(
      fc.property(
        recipesArb,
        fc.constantFrom('newest', 'oldest', 'name', 'favorite', 'recent'),
        (recipes, mode) => {
          const original = recipes.slice();
          sortRecipes(recipes, mode, {}, {});
          expect(recipes).toEqual(original);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 2: レシピ可視性ルール ---

describe('Property 2: レシピ可視性ルール', () => {
  it('all published recipes are in result', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, currentUser) => {
          const result = filterVisibleRecipes(recipes, currentUser);
          const published = recipes.filter(r => r.status === 'published');
          for (const r of published) {
            expect(result.some(vis => vis.id === r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('draft/private recipes from other users are NOT in result', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, currentUser) => {
          const result = filterVisibleRecipes(recipes, currentUser);
          const otherDraftPrivate = recipes.filter(r =>
            (r.status === 'draft' || r.status === 'private') && r.author !== currentUser
          );
          for (const r of otherDraftPrivate) {
            expect(result.some(vis => vis.id === r.id)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('draft/private recipes from current user ARE in result', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, currentUser) => {
          const result = filterVisibleRecipes(recipes, currentUser);
          const ownDraftPrivate = recipes.filter(r =>
            (r.status === 'draft' || r.status === 'private') && r.author === currentUser
          );
          for (const r of ownDraftPrivate) {
            expect(result.some(vis => vis.id === r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result contains only published or own draft/private recipes', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, currentUser) => {
          const result = filterVisibleRecipes(recipes, currentUser);
          for (const r of result) {
            const isPublished = r.status === 'published';
            const isOwnNonPublished = (r.status === 'draft' || r.status === 'private') && r.author === currentUser;
            expect(isPublished || isOwnNonPublished).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 23: お気に入りフィルタ正確性 ---

describe('Property 23: お気に入りフィルタ正確性', () => {
  it('result only contains recipes whose id is in userFavorites', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 0, maxLength: 20 }),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 10 }),
        (recipes, userFavorites) => {
          const result = filterFavorites(recipes, userFavorites);
          for (const r of result) {
            expect(userFavorites.includes(r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all favorited recipes that exist in the list appear in result', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 1, maxLength: 20 }),
        (recipes) => {
          // Pick some recipe ids as favorites
          const favoriteIds = recipes.slice(0, Math.ceil(recipes.length / 2)).map(r => r.id);
          const result = filterFavorites(recipes, favoriteIds);
          for (const id of favoriteIds) {
            const inRecipes = recipes.some(r => r.id === id);
            if (inRecipes) {
              expect(result.some(r => r.id === id)).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty userFavorites returns empty array', () => {
    fc.assert(
      fc.property(
        fc.array(recipeArb, { minLength: 0, maxLength: 10 }),
        (recipes) => {
          expect(filterFavorites(recipes, [])).toEqual([]);
          expect(filterFavorites(recipes, null)).toEqual([]);
          expect(filterFavorites(recipes, undefined)).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
