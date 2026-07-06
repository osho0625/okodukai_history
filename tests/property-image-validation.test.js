/**
 * Property Tests: 画像アップロードバリデーション & 画像リサイズ制約
 *
 * **Property 9: 画像アップロードバリデーション**
 * **Validates: Requirements 4.2, 4.3**
 *
 * **Property 10: 画像リサイズ制約**
 * **Validates: Requirements 4.4**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const { validateImageFile, computeResizeDimensions } = require('../js/recipe-utils.js');

// Constants
const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

// Generators
const validMimeTypeArb = fc.constantFrom(...VALID_MIME_TYPES);
const invalidMimeTypeArb = fc.string({ minLength: 1, maxLength: 30 }).filter(
  s => !VALID_MIME_TYPES.includes(s)
);
const validSizeArb = fc.integer({ min: 1, max: MAX_SIZE });
const invalidSizeArb = fc.integer({ min: MAX_SIZE + 1, max: MAX_SIZE * 10 });
const fileNameArb = fc.string({ minLength: 1, maxLength: 50 });

describe('Property 9: 画像アップロードバリデーション', () => {
  it('invalid MIME type → valid=false', () => {
    fc.assert(
      fc.property(
        invalidMimeTypeArb,
        validSizeArb,
        fileNameArb,
        (type, size, name) => {
          const result = validateImageFile({ type, size, name });
          expect(result.valid).toBe(false);
          expect(result.error).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('size > 3MB → valid=false', () => {
    fc.assert(
      fc.property(
        validMimeTypeArb,
        invalidSizeArb,
        fileNameArb,
        (type, size, name) => {
          const result = validateImageFile({ type, size, name });
          expect(result.valid).toBe(false);
          expect(result.error).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid MIME type AND size <= 3MB → valid=true', () => {
    fc.assert(
      fc.property(
        validMimeTypeArb,
        validSizeArb,
        fileNameArb,
        (type, size, name) => {
          const result = validateImageFile({ type, size, name });
          expect(result.valid).toBe(true);
          expect(result.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 10: 画像リサイズ制約', () => {
  it('width > maxWidth → output width === maxWidth and aspect ratio preserved', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1201, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        (width, height) => {
          const maxWidth = 1200;
          const result = computeResizeDimensions(width, height, maxWidth);
          expect(result.width).toBe(maxWidth);
          // Aspect ratio: result.height / result.width should be close to height / width
          const expectedHeight = Math.round(height * (maxWidth / width));
          expect(result.height).toBe(expectedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('width <= maxWidth → output === input dimensions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1200 }),
        fc.integer({ min: 1, max: 10000 }),
        (width, height) => {
          const maxWidth = 1200;
          const result = computeResizeDimensions(width, height, maxWidth);
          expect(result.width).toBe(width);
          expect(result.height).toBe(height);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('custom maxWidth: width > maxWidth → output width === maxWidth', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 1, max: 10000 }),
        (maxWidth, height) => {
          const width = maxWidth + fc.sample(fc.integer({ min: 1, max: 5000 }), 1)[0];
          const result = computeResizeDimensions(width, height, maxWidth);
          expect(result.width).toBe(maxWidth);
          const expectedHeight = Math.round(height * (maxWidth / width));
          expect(result.height).toBe(expectedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });
});
