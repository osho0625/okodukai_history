/**
 * Property 3: 一括登録のレコード数不変量
 * 
 * For any set of N selected Body_Zones (N ≥ 1) with a single date, intensity, and memo,
 * batch saving should create exactly N new Treatment_Records, each with a distinct zone_id
 * matching one of the selected zones, and all sharing the same date, intensity, and memo.
 * 
 * **Validates: Requirements 3.11**
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

let batchSaveRecords;
let StorageManager;

beforeAll(async () => {
  // Set up jsdom environment
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div><div id="toast"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const window = dom.window;
  const document = window.document;

  // Set up globals
  global.window = window;
  global.document = document;
  global.localStorage = window.localStorage;

  // crypto.randomUUID should already be available in Node.js 19+
  // If not available on the JSDOM window, define it there
  if (!window.crypto || !window.crypto.randomUUID) {
    Object.defineProperty(window, 'crypto', {
      value: {
        randomUUID: () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
      },
      writable: true,
      configurable: true
    });
  }

  // Mock BODY_MAP_DATA
  window.BODY_MAP_DATA = {
    front: [],
    back: []
  };

  // Load the main script
  const fs = await import('fs');
  const path = await import('path');
  const scriptPath = path.resolve('js/hair-removal-tracker.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  
  const scriptEl = document.createElement('script');
  scriptEl.textContent = scriptContent;
  document.body.appendChild(scriptEl);

  // Get exported functions
  batchSaveRecords = window._HairRemovalTracker.batchSaveRecords;
  StorageManager = window._HairRemovalTracker.StorageManager;
});

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

// Custom arbitraries
const zoneIdArb = fc.stringOf(
  fc.oneof(fc.char(), fc.constant('_')),
  { minLength: 3, maxLength: 20 }
).filter(s => s.length >= 3 && /^[a-zA-Z_]/.test(s));

const uniqueZoneIdsArb = (minLength, maxLength) =>
  fc.uniqueArray(
    fc.stringOf(fc.oneof(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), fc.constant('_')), { minLength: 5, maxLength: 15 }),
    { minLength, maxLength, comparator: (a, b) => a === b }
  ).filter(arr => arr.length >= minLength);

const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31')
}).map(d => d.toISOString().slice(0, 10));

const intensityArb = fc.integer({ min: 1, max: 5 });

const memoArb = fc.oneof(
  fc.constant(null),
  fc.string({ minLength: 1, maxLength: 50 })
);

describe('Property 3: 一括登録のレコード数不変量', () => {
  it('should create exactly N records for N zones with unique ids and correct data', () => {
    fc.assert(
      fc.property(
        uniqueZoneIdsArb(1, 20),
        dateArb,
        intensityArb,
        memoArb,
        (zoneIds, date, intensity, memo) => {
          // Clear before test
          localStorage.clear();

          const result = batchSaveRecords(zoneIds, date, intensity, memo);

          // 1. Must succeed
          expect(result.success).toBe(true);

          // 2. Exactly N records returned
          expect(result.records.length).toBe(zoneIds.length);

          // 3. Each record has a unique id
          const ids = result.records.map(r => r.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(zoneIds.length);

          // 4. Each record's zone_id matches one of the input zoneIds
          const recordZoneIds = result.records.map(r => r.zone_id);
          const sortedInput = [...zoneIds].sort();
          const sortedOutput = [...recordZoneIds].sort();
          expect(sortedOutput).toEqual(sortedInput);

          // 5. All records share the same date, intensity, and memo
          for (const record of result.records) {
            expect(record.date).toBe(date);
            expect(record.intensity).toBe(intensity);
            expect(record.memo).toBe(memo);
          }

          // 6. Records are persisted in localStorage
          const stored = StorageManager.getRecords();
          expect(stored.length).toBe(zoneIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should append to existing records without overwriting', () => {
    fc.assert(
      fc.property(
        uniqueZoneIdsArb(1, 10),
        uniqueZoneIdsArb(1, 10),
        dateArb,
        dateArb,
        intensityArb,
        intensityArb,
        (zoneIds1, zoneIds2, date1, date2, intensity1, intensity2) => {
          localStorage.clear();

          // First batch save
          const result1 = batchSaveRecords(zoneIds1, date1, intensity1, null);
          expect(result1.success).toBe(true);

          // Second batch save
          const result2 = batchSaveRecords(zoneIds2, date2, intensity2, null);
          expect(result2.success).toBe(true);

          // Total records in storage = sum of both batches
          const stored = StorageManager.getRecords();
          expect(stored.length).toBe(zoneIds1.length + zoneIds2.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
