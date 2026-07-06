/**
 * Property Tests: タグ関連ロジック
 *
 * **Property 16: タグ正規化**
 * **Validates: Requirements 6.6**
 *
 * **Property 21: アレルギータグ分離**
 * **Validates: Requirements 13.4, 13.6**
 *
 * **Property 15: タグフィルタ正確性**
 * **Validates: Requirements 6.3**
 *
 * **Property 22: アレルギー除外フィルタ**
 * **Validates: Requirements 13.3**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { normalizeTag, isAllergyTag, filterAllergyTags, filterGeneralTags } from '../js/recipe-utils.js';
import { filterByTag, filterExcludeAllergy } from '../js/recipe-search.js';

// --- Generators ---

const tagArb = fc.string({ minLength: 1, maxLength: 30 });

const allergyTagArb = fc.string({ minLength: 1, maxLength: 20 }).map(s => 'allergy:' + s);

const mixedTagsArb = fc.array(
  fc.oneof(tagArb, allergyTagArb),
  { minLength: 0, maxLength: 10 }
);

const recipeWithTagsArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  recipe_tags: fc.array(
    fc.oneof(
      fc.record({ tag: tagArb }),
      fc.record({ tag: allergyTagArb })
    ),
    { minLength: 0, maxLength: 5 }
  )
});

// --- Property 16: タグ正規化 ---

describe('Property 16: タグ正規化', () => {
  it('normalize(" Abc ") === "abc"', () => {
    expect(normalizeTag(' Abc ')).toBe('abc');
  });

  it('for any string, result has no leading/trailing whitespace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (tag) => {
          const result = normalizeTag(tag);
          expect(result).toBe(result.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any string, result is lowercase', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (tag) => {
          const result = normalizeTag(tag);
          expect(result).toBe(result.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('normalizeTag is idempotent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (tag) => {
          const once = normalizeTag(tag);
          const twice = normalizeTag(once);
          expect(once).toBe(twice);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 21: アレルギータグ分離 ---

describe('Property 21: アレルギータグ分離', () => {
  it('filterAllergyTags only returns tags starting with "allergy:"', () => {
    fc.assert(
      fc.property(
        mixedTagsArb,
        (tags) => {
          const result = filterAllergyTags(tags);
          for (const t of result) {
            expect(t.startsWith('allergy:')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('filterGeneralTags never returns tags starting with "allergy:"', () => {
    fc.assert(
      fc.property(
        mixedTagsArb,
        (tags) => {
          const result = filterGeneralTags(tags);
          for (const t of result) {
            expect(t.startsWith('allergy:')).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('combined filterAllergyTags + filterGeneralTags covers all original tags', () => {
    fc.assert(
      fc.property(
        mixedTagsArb,
        (tags) => {
          const allergy = filterAllergyTags(tags);
          const general = filterGeneralTags(tags);
          expect(allergy.length + general.length).toBe(tags.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 15: タグフィルタ正確性 ---

describe('Property 15: タグフィルタ正確性', () => {
  it('all recipes in result have the specified tag', () => {
    fc.assert(
      fc.property(
        fc.array(recipeWithTagsArb, { minLength: 1, maxLength: 15 }),
        tagArb,
        (recipes, tag) => {
          const result = filterByTag(recipes, tag);
          for (const r of result) {
            const tags = r.recipe_tags.map(t => typeof t === 'string' ? t : t.tag);
            expect(tags.includes(tag)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all recipes with the specified tag appear in result', () => {
    fc.assert(
      fc.property(
        fc.array(recipeWithTagsArb, { minLength: 1, maxLength: 15 }),
        (recipes) => {
          // Pick a tag from existing recipes to ensure non-empty matches
          const allTags = recipes.flatMap(r => r.recipe_tags.map(t => t.tag));
          if (allTags.length === 0) return;
          const tag = allTags[0];

          const result = filterByTag(recipes, tag);
          const recipesWithTag = recipes.filter(r =>
            r.recipe_tags.map(t => t.tag).includes(tag)
          );
          for (const r of recipesWithTag) {
            expect(result.some(res => res.id === r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 22: アレルギー除外フィルタ ---

describe('Property 22: アレルギー除外フィルタ', () => {
  it('no recipe in result has "allergy:{allergen}" tag', () => {
    fc.assert(
      fc.property(
        fc.array(recipeWithTagsArb, { minLength: 1, maxLength: 15 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, allergen) => {
          const result = filterExcludeAllergy(recipes, allergen);
          const allergyTag = 'allergy:' + allergen;
          for (const r of result) {
            const tags = r.recipe_tags.map(t => typeof t === 'string' ? t : t.tag);
            expect(tags.includes(allergyTag)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('recipes without the allergen tag are preserved', () => {
    fc.assert(
      fc.property(
        fc.array(recipeWithTagsArb, { minLength: 1, maxLength: 15 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (recipes, allergen) => {
          const allergyTag = 'allergy:' + allergen;
          const result = filterExcludeAllergy(recipes, allergen);
          const expected = recipes.filter(r => {
            const tags = r.recipe_tags.map(t => typeof t === 'string' ? t : t.tag);
            return !tags.includes(allergyTag);
          });
          expect(result.length).toBe(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
