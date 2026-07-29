/**
 * mergeRecords Unit Tests
 * Feature: hair-removal-tracker
 *
 * **Validates: Requirements 7.7**
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('mergeRecords', () => {
  let dom;
  let window;
  let mergeRecords;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });
    window = dom.window;

    // Mock BODY_MAP_DATA
    window.BODY_MAP_DATA = { front: [], back: [] };

    // Load the script
    const fs = require('fs');
    const scriptContent = fs.readFileSync('js/hair-removal-tracker.js', 'utf-8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.document.body.appendChild(scriptEl);

    mergeRecords = window._HairRemovalTracker.mergeRecords;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  it('preserves all unique records from both arrays', () => {
    const existing = [
      { id: 'a', zone_id: 'z1', date: '2025-01-01', intensity: 3, memo: null, photo: null, created_at: '2025-01-01T10:00:00Z' },
      { id: 'b', zone_id: 'z2', date: '2025-01-02', intensity: 2, memo: null, photo: null, created_at: '2025-01-02T10:00:00Z' }
    ];
    const imported = [
      { id: 'c', zone_id: 'z3', date: '2025-01-03', intensity: 4, memo: null, photo: null, created_at: '2025-01-03T10:00:00Z' },
      { id: 'd', zone_id: 'z4', date: '2025-01-04', intensity: 5, memo: null, photo: null, created_at: '2025-01-04T10:00:00Z' }
    ];

    const result = mergeRecords(existing, imported);

    expect(result).toHaveLength(4);
    const ids = result.map(r => r.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
    expect(ids).toContain('d');
  });

  it('keeps the newer record (later created_at) for same id', () => {
    const existing = [
      { id: 'same-id', zone_id: 'z1', date: '2025-01-01', intensity: 3, memo: 'old', photo: null, created_at: '2025-01-01T10:00:00Z' }
    ];
    const imported = [
      { id: 'same-id', zone_id: 'z1', date: '2025-01-05', intensity: 4, memo: 'new', photo: null, created_at: '2025-01-05T12:00:00Z' }
    ];

    const result = mergeRecords(existing, imported);

    expect(result).toHaveLength(1);
    expect(result[0].memo).toBe('new');
    expect(result[0].created_at).toBe('2025-01-05T12:00:00Z');
  });

  it('keeps existing record when it has a later created_at than imported', () => {
    const existing = [
      { id: 'same-id', zone_id: 'z1', date: '2025-02-01', intensity: 5, memo: 'newer existing', photo: null, created_at: '2025-02-01T15:00:00Z' }
    ];
    const imported = [
      { id: 'same-id', zone_id: 'z1', date: '2025-01-01', intensity: 2, memo: 'older import', photo: null, created_at: '2025-01-01T08:00:00Z' }
    ];

    const result = mergeRecords(existing, imported);

    expect(result).toHaveLength(1);
    expect(result[0].memo).toBe('newer existing');
    expect(result[0].created_at).toBe('2025-02-01T15:00:00Z');
  });

  it('produces no duplicate ids in result', () => {
    const existing = [
      { id: 'a', zone_id: 'z1', date: '2025-01-01', intensity: 1, memo: null, photo: null, created_at: '2025-01-01T10:00:00Z' },
      { id: 'b', zone_id: 'z2', date: '2025-01-02', intensity: 2, memo: null, photo: null, created_at: '2025-01-02T10:00:00Z' },
      { id: 'c', zone_id: 'z3', date: '2025-01-03', intensity: 3, memo: null, photo: null, created_at: '2025-01-03T10:00:00Z' }
    ];
    const imported = [
      { id: 'b', zone_id: 'z2', date: '2025-01-10', intensity: 4, memo: 'updated', photo: null, created_at: '2025-01-10T10:00:00Z' },
      { id: 'c', zone_id: 'z3', date: '2025-01-03', intensity: 3, memo: null, photo: null, created_at: '2025-01-01T05:00:00Z' },
      { id: 'd', zone_id: 'z4', date: '2025-01-04', intensity: 5, memo: null, photo: null, created_at: '2025-01-04T10:00:00Z' }
    ];

    const result = mergeRecords(existing, imported);

    const ids = result.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    expect(result).toHaveLength(4); // a, b(updated), c(existing kept), d(new)
  });

  it('handles empty existing array', () => {
    const existing = [];
    const imported = [
      { id: 'x', zone_id: 'z1', date: '2025-01-01', intensity: 3, memo: null, photo: null, created_at: '2025-01-01T10:00:00Z' }
    ];

    const result = mergeRecords(existing, imported);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('x');
  });

  it('handles empty imported array', () => {
    const existing = [
      { id: 'x', zone_id: 'z1', date: '2025-01-01', intensity: 3, memo: null, photo: null, created_at: '2025-01-01T10:00:00Z' }
    ];
    const imported = [];

    const result = mergeRecords(existing, imported);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('x');
  });

  it('handles both arrays empty', () => {
    const result = mergeRecords([], []);
    expect(result).toHaveLength(0);
  });

  it('is also accessible via StorageManager.mergeRecords', () => {
    const sm = window._HairRemovalTracker.StorageManager;
    expect(typeof sm.mergeRecords).toBe('function');

    const existing = [
      { id: 'a', zone_id: 'z1', date: '2025-01-01', intensity: 1, memo: null, photo: null, created_at: '2025-01-01T10:00:00Z' }
    ];
    const imported = [
      { id: 'b', zone_id: 'z2', date: '2025-02-01', intensity: 2, memo: null, photo: null, created_at: '2025-02-01T10:00:00Z' }
    ];

    const result = sm.mergeRecords(existing, imported);
    expect(result).toHaveLength(2);
  });
});


/**
 * Property 13: マージアルゴリズムの正確性
 *
 * For any two arrays of Treatment_Records (existing and imported), mergeRecords(existing, imported) should:
 * - For records with the same id: keep the one with the later created_at
 * - For records with unique ids: include all of them
 * - The result should contain no duplicate ids
 *
 * Feature: hair-removal-tracker, Property 13: マージアルゴリズムの正確性
 *
 * **Validates: Requirements 7.7**
 */
import fc from 'fast-check';

describe('Feature: hair-removal-tracker, Property 13: マージアルゴリズムの正確性', () => {
  let dom;
  let window;
  let mergeRecords;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });
    window = dom.window;

    // Mock BODY_MAP_DATA
    window.BODY_MAP_DATA = { front: [], back: [] };

    // Load the script
    const fs = require('fs');
    const scriptContent = fs.readFileSync('js/hair-removal-tracker.js', 'utf-8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.document.body.appendChild(scriptEl);

    mergeRecords = window._HairRemovalTracker.mergeRecords;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  // Generator for valid Treatment_Record with a specific id
  const recordWithIdArb = (id) => fc.record({
    id: fc.constant(id),
    zone_id: fc.stringOf(fc.constantFrom('a','b','c','_','0','1','2'), { minLength: 3, maxLength: 15 }),
    date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().slice(0, 10)),
    intensity: fc.integer({ min: 1, max: 5 }),
    memo: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 30 })),
    photo: fc.constant(null),
    created_at: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
  });

  // Generator for valid Treatment_Record with random id
  const validRecordArb = fc.uuid().chain(id => recordWithIdArb(id));

  it('result has no duplicate ids for any two record arrays', () => {
    fc.assert(
      fc.property(
        fc.array(validRecordArb, { minLength: 0, maxLength: 10 }),
        fc.array(validRecordArb, { minLength: 0, maxLength: 10 }),
        (existing, imported) => {
          const result = mergeRecords(existing, imported);
          const ids = result.map(r => r.id);
          const uniqueIds = new Set(ids);
          expect(ids.length).toBe(uniqueIds.size);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for same-id records, the one with later created_at is kept', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2025-06-01') }),
        fc.date({ min: new Date('2025-07-01'), max: new Date('2030-12-31') }),
        (id, earlierDate, laterDate) => {
          const olderRecord = {
            id,
            zone_id: 'zone_test',
            date: '2025-01-01',
            intensity: 3,
            memo: 'older',
            photo: null,
            created_at: earlierDate.toISOString(),
          };
          const newerRecord = {
            id,
            zone_id: 'zone_test',
            date: '2025-06-01',
            intensity: 4,
            memo: 'newer',
            photo: null,
            created_at: laterDate.toISOString(),
          };

          // Test both orderings: newer in existing vs newer in imported
          const result1 = mergeRecords([olderRecord], [newerRecord]);
          expect(result1).toHaveLength(1);
          expect(result1[0].created_at).toBe(newerRecord.created_at);

          const result2 = mergeRecords([newerRecord], [olderRecord]);
          expect(result2).toHaveLength(1);
          expect(result2[0].created_at).toBe(newerRecord.created_at);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for unique-id records, all are preserved', () => {
    fc.assert(
      fc.property(
        fc.array(validRecordArb, { minLength: 0, maxLength: 8 }),
        fc.array(validRecordArb, { minLength: 0, maxLength: 8 }),
        (existing, imported) => {
          // Deduplicate within each array first by id (keep last occurrence)
          const dedupById = (arr) => {
            const map = new Map();
            arr.forEach(r => map.set(r.id, r));
            return [...map.values()];
          };
          const dedupExisting = dedupById(existing);
          const dedupImported = dedupById(imported);

          // Find ids unique to each array
          const existingIds = new Set(dedupExisting.map(r => r.id));
          const importedIds = new Set(dedupImported.map(r => r.id));
          const uniqueToExisting = dedupExisting.filter(r => !importedIds.has(r.id));
          const uniqueToImported = dedupImported.filter(r => !existingIds.has(r.id));

          const result = mergeRecords(existing, imported);
          const resultIds = new Set(result.map(r => r.id));

          // All unique ids must be present in the result
          for (const r of uniqueToExisting) {
            expect(resultIds.has(r.id)).toBe(true);
          }
          for (const r of uniqueToImported) {
            expect(resultIds.has(r.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result length is <= existing.length + imported.length', () => {
    fc.assert(
      fc.property(
        fc.array(validRecordArb, { minLength: 0, maxLength: 10 }),
        fc.array(validRecordArb, { minLength: 0, maxLength: 10 }),
        (existing, imported) => {
          const result = mergeRecords(existing, imported);
          expect(result.length).toBeLessThanOrEqual(existing.length + imported.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
