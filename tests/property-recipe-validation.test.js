/**
 * Property Tests: レシピフォームバリデーション
 *
 * **Property 1: レシピフォームバリデーション**
 * **Validates: Requirements 1.5, 12.2**
 *
 * For published status, empty/whitespace title OR 0 ingredients → valid=false.
 * For draft, empty title is allowed.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const { validateRecipeForm } = require('../js/recipe-utils.js');

// Generators
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const whitespaceStringArb = fc.stringOf(fc.constantFrom(' ', '\t', '\n', '　'), { minLength: 0, maxLength: 10 });
const ingredientArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 30 }),
  quantity: fc.string({ minLength: 0, maxLength: 20 }),
  memo: fc.string({ minLength: 0, maxLength: 30 }),
});

describe('Property 1: レシピフォームバリデーション', () => {
  it('published: empty/whitespace title → valid=false', () => {
    fc.assert(
      fc.property(
        whitespaceStringArb,
        fc.array(ingredientArb, { minLength: 1, maxLength: 10 }),
        (title, ingredients) => {
          const result = validateRecipeForm({ title, ingredients }, 'published');
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('published: 0 ingredients → valid=false', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArb,
        (title) => {
          const result = validateRecipeForm({ title, ingredients: [] }, 'published');
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('published: valid title AND >= 1 ingredients → valid=true', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArb,
        fc.array(ingredientArb, { minLength: 1, maxLength: 10 }),
        (title, ingredients) => {
          const result = validateRecipeForm({ title, ingredients }, 'published');
          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('draft: empty title is allowed', () => {
    fc.assert(
      fc.property(
        whitespaceStringArb,
        fc.array(ingredientArb, { minLength: 0, maxLength: 5 }),
        (title, ingredients) => {
          const result = validateRecipeForm({ title, ingredients }, 'draft');
          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('draft: empty ingredients is allowed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 30 }),
        (title) => {
          const result = validateRecipeForm({ title, ingredients: [] }, 'draft');
          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('private: empty/whitespace title → valid=false', () => {
    fc.assert(
      fc.property(
        whitespaceStringArb,
        fc.array(ingredientArb, { minLength: 1, maxLength: 10 }),
        (title, ingredients) => {
          const result = validateRecipeForm({ title, ingredients }, 'private');
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('private: 0 ingredients → valid=false', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArb,
        (title) => {
          const result = validateRecipeForm({ title, ingredients: [] }, 'private');
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('private: valid title AND >= 1 ingredients → valid=true', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArb,
        fc.array(ingredientArb, { minLength: 1, maxLength: 10 }),
        (title, ingredients) => {
          const result = validateRecipeForm({ title, ingredients }, 'private');
          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
