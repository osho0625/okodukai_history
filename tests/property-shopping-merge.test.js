/**
 * Property Tests: 買い物リスト数量合算ロジック
 *
 * **Property 18: parseQuantity 解析正確性**
 * **Validates: Requirements 7.6, 7.7**
 *
 * **Property 17: 買い物リスト数量合算ルール**
 * **Validates: Requirements 7.6, 7.7**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseQuantity, mergeQuantities } from '../js/recipe-utils.js';

// --- Generators ---

// Generates a positive number (integer or simple decimal)
const positiveNumArb = fc.integer({ min: 1, max: 9999 }).map(n => n / 10);

// Common unit strings used in Japanese cooking
const unitArb = fc.constantFrom('g', 'kg', 'ml', 'L', '個', '本', '枚', 'カップ', '大さじ', '小さじ', 'cc');

// Non-numeric quantity strings
const nonNumericArb = fc.constantFrom('適量', '少々', 'お好みで', 'ひとつまみ', 'たっぷり');

// --- Property 18: parseQuantity 解析正確性 ---

describe('Property 18: parseQuantity 解析正確性', () => {
  it('"300g" → {value: 300, unit: "g"}', () => {
    const result = parseQuantity('300g');
    expect(result.value).toBe(300);
    expect(result.unit).toBe('g');
  });

  it('"1.5kg" → {value: 1.5, unit: "kg"}', () => {
    const result = parseQuantity('1.5kg');
    expect(result.value).toBe(1.5);
    expect(result.unit).toBe('kg');
  });

  it('"1/2個" → {value: 0.5, unit: "個"}', () => {
    const result = parseQuantity('1/2個');
    expect(result.value).toBe(0.5);
    expect(result.unit).toBe('個');
  });

  it('"適量" → {value: null, unit: null, raw: "適量"}', () => {
    const result = parseQuantity('適量');
    expect(result.value).toBeNull();
    expect(result.unit).toBeNull();
    expect(result.raw).toBe('適量');
  });

  it('for any positive number + unit, value is a number and unit is a string', () => {
    fc.assert(
      fc.property(
        positiveNumArb,
        unitArb,
        (num, unit) => {
          const str = num + unit;
          const result = parseQuantity(str);
          expect(typeof result.value).toBe('number');
          expect(result.value).toBeCloseTo(num, 1);
          expect(result.unit).toBe(unit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any fraction numerator/denominator + unit, value equals numerator/denominator', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9 }),
        fc.integer({ min: 1, max: 9 }),
        unitArb,
        (num, denom, unit) => {
          const str = num + '/' + denom + unit;
          const result = parseQuantity(str);
          expect(result.value).toBeCloseTo(num / denom, 10);
          expect(result.unit).toBe(unit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any non-numeric string, value is null and unit is null', () => {
    fc.assert(
      fc.property(
        nonNumericArb,
        (str) => {
          const result = parseQuantity(str);
          expect(result.value).toBeNull();
          expect(result.unit).toBeNull();
          expect(result.raw).toBe(str);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty string returns value null, unit null', () => {
    const result = parseQuantity('');
    expect(result.value).toBeNull();
    expect(result.unit).toBeNull();
  });

  it('null/undefined returns value null, unit null', () => {
    expect(parseQuantity(null).value).toBeNull();
    expect(parseQuantity(undefined).value).toBeNull();
  });
});

// --- Property 17: 買い物リスト数量合算ルール ---

describe('Property 17: 買い物リスト数量合算ルール', () => {
  it('items with same name + numeric qty + same unit → merged into 1 item with summed value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        positiveNumArb,
        positiveNumArb,
        unitArb,
        (name, qty1, qty2, unit) => {
          const items = [
            { ingredient_name: name, quantity: qty1 + unit },
            { ingredient_name: name, quantity: qty2 + unit }
          ];
          const result = mergeQuantities(items);

          // Should merge into 1 item
          expect(result.length).toBe(1);
          expect(result[0].ingredient_name).toBe(name);
          expect(result[0].merged).toBe(true);

          // Verify sum
          const parsed = parseQuantity(result[0].quantity);
          expect(parsed.value).toBeCloseTo(qty1 + qty2, 1);
          expect(parsed.unit).toBe(unit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('items with same name but different units → NOT merged (separate items)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        positiveNumArb,
        positiveNumArb,
        fc.constantFrom('g', 'ml', '個', '本', '枚'),
        (name, qty1, qty2, unit1) => {
          // Use a different unit
          const unit2 = unit1 === 'g' ? 'ml' : 'g';
          const items = [
            { ingredient_name: name, quantity: qty1 + unit1 },
            { ingredient_name: name, quantity: qty2 + unit2 }
          ];
          const result = mergeQuantities(items);

          // Should NOT merge - separate items
          expect(result.length).toBe(2);
          expect(result.every(r => r.merged === false)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('items with same name but non-numeric qty → NOT merged', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        positiveNumArb,
        unitArb,
        nonNumericArb,
        (name, qty1, unit, nonNumeric) => {
          const items = [
            { ingredient_name: name, quantity: qty1 + unit },
            { ingredient_name: name, quantity: nonNumeric }
          ];
          const result = mergeQuantities(items);

          // Should NOT merge
          expect(result.length).toBe(2);
          expect(result.every(r => r.merged === false)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('items with different names are kept separate regardless of quantities', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        positiveNumArb,
        positiveNumArb,
        unitArb,
        (name1, name2, qty1, qty2, unit) => {
          // Ensure names are different
          fc.pre(name1 !== name2);
          const items = [
            { ingredient_name: name1, quantity: qty1 + unit },
            { ingredient_name: name2, quantity: qty2 + unit }
          ];
          const result = mergeQuantities(items);

          expect(result.length).toBe(2);
          expect(result[0].ingredient_name).toBe(name1);
          expect(result[1].ingredient_name).toBe(name2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty array returns empty array', () => {
    expect(mergeQuantities([])).toEqual([]);
  });

  it('single item returns single item with merged=false', () => {
    const items = [{ ingredient_name: '豚肉', quantity: '300g' }];
    const result = mergeQuantities(items);
    expect(result.length).toBe(1);
    expect(result[0].merged).toBe(false);
  });

  it('example: 豚肉 300g + 豚肉 200g → 豚肉 500g', () => {
    const items = [
      { ingredient_name: '豚肉', quantity: '300g' },
      { ingredient_name: '豚肉', quantity: '200g' }
    ];
    const result = mergeQuantities(items);
    expect(result.length).toBe(1);
    expect(result[0].ingredient_name).toBe('豚肉');
    expect(result[0].quantity).toBe('500g');
    expect(result[0].merged).toBe(true);
  });

  it('example: 豚肉 300g + 豚肉 適量 → separate items', () => {
    const items = [
      { ingredient_name: '豚肉', quantity: '300g' },
      { ingredient_name: '豚肉', quantity: '適量' }
    ];
    const result = mergeQuantities(items);
    expect(result.length).toBe(2);
    expect(result[0].merged).toBe(false);
    expect(result[1].merged).toBe(false);
  });
});
