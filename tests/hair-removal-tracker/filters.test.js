/**
 * Property 4, 5, 6, 7: フィルタ・ソート・ゾーン統計のプロパティテスト
 * 
 * Property 4: sortRecordsByDate('desc') → each date >= next date
 * Property 5: filterByZone returns only matching zone_id records, includes all of them
 * Property 6: filterByDateRange returns only records in [start, end], includes all of them
 * Property 7: For sorted records of one zone, average interval = sum(date[i+1]-date[i]) / (count-1)
 * 
 * **Validates: Requirements 4.2, 4.4, 4.5, 4.7**
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

let sortRecordsByDate;
let filterByZone;
let filterByDateRange;
let getZoneAverageInterval;
let getZoneTreatmentCount;

beforeAll(async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div><div id="treatment-modal" class="modal-overlay"><div class="modal-content"><div class="modal-header"><span id="modal-zone-name"></span></div><div class="modal-body"><input type="date" id="modal-date"><div id="modal-intensity"></div><textarea id="modal-memo"></textarea></div><div class="modal-footer"><button id="modal-cancel"></button><button id="modal-confirm"></button></div></div></div><div id="multi-select-bar" style="display:none;"><button id="multi-select-deselect"></button><button id="multi-select-save"><span id="multi-select-count">0</span></button></div><div id="toast"></div><div class="tab-bar"><button data-tab="map">マップ</button><button data-tab="history">履歴</button></div><div id="tab-map" class="tab-content active"></div><div id="tab-history" class="tab-content"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  });
  const window = dom.window;

  // Define BODY_MAP_DATA stub
  window.BODY_MAP_DATA = { front: [], back: [] };

  // Mock crypto.randomUUID using Object.defineProperty
  let uuidCounter = 0;
  Object.defineProperty(window, 'crypto', {
    value: { randomUUID: () => 'test-uuid-' + (++uuidCounter), getRandomValues: (arr) => arr },
    writable: true,
    configurable: true,
  });

  // Execute the module in jsdom
  const fs = await import('fs');
  const path = await import('path');
  const scriptPath = path.resolve('js/hair-removal-tracker.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = scriptContent;
  window.document.body.appendChild(scriptEl);

  // Get exported functions
  sortRecordsByDate = window._HairRemovalTracker.sortRecordsByDate;
  filterByZone = window._HairRemovalTracker.filterByZone;
  filterByDateRange = window._HairRemovalTracker.filterByDateRange;
  getZoneAverageInterval = window._HairRemovalTracker.getZoneAverageInterval;
  getZoneTreatmentCount = window._HairRemovalTracker.getZoneTreatmentCount;
});

/**
 * Arbitrary: 有効なYYYY-MM-DD日付文字列を生成する
 */
const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31')
}).map(d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
});

/**
 * Arbitrary: 有効なゾーンIDを生成する
 */
const zoneIdArb = fc.constantFrom(
  'front_face_01', 'front_face_02', 'front_chest_01', 'front_chest_02',
  'front_abdomen_01', 'back_upper_01', 'back_lower_01', 'front_left_arm_01'
);

/**
 * Arbitrary: TreatmentRecordを生成する
 */
const recordArb = fc.record({
  id: fc.uuid(),
  zone_id: zoneIdArb,
  date: dateArb,
  intensity: fc.integer({ min: 1, max: 5 }),
  memo: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 20 })),
  photo: fc.constant(null),
  created_at: fc.constant('2025-01-01T00:00:00Z')
});

const recordsArb = fc.array(recordArb, { minLength: 0, maxLength: 30 });

describe('Feature: hair-removal-tracker, Property 4: 履歴ソート順の正確性', () => {
  it('sortRecordsByDate("desc") → each date >= next date', () => {
    fc.assert(
      fc.property(recordsArb, (records) => {
        const sorted = sortRecordsByDate(records, 'desc');

        // 結果の長さは入力と同じ
        expect(sorted.length).toBe(records.length);

        // 各要素のdateは次の要素のdate以上
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].date >= sorted[i + 1].date).toBe(true);
        }
      }),
      { numRuns: 150 }
    );
  });

  it('sortRecordsByDate("asc") → each date <= next date', () => {
    fc.assert(
      fc.property(recordsArb, (records) => {
        const sorted = sortRecordsByDate(records, 'asc');

        expect(sorted.length).toBe(records.length);

        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].date <= sorted[i + 1].date).toBe(true);
        }
      }),
      { numRuns: 150 }
    );
  });

  it('sortRecordsByDate does not mutate input array', () => {
    fc.assert(
      fc.property(recordsArb, (records) => {
        const original = records.slice();
        sortRecordsByDate(records, 'desc');
        expect(records).toEqual(original);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: hair-removal-tracker, Property 5: ゾーンフィルタの正確性', () => {
  it('filterByZone returns only records with matching zone_id', () => {
    fc.assert(
      fc.property(recordsArb, zoneIdArb, (records, zoneId) => {
        const filtered = filterByZone(records, zoneId);

        // 全結果のzone_idが指定と一致する
        for (let i = 0; i < filtered.length; i++) {
          expect(filtered[i].zone_id).toBe(zoneId);
        }
      }),
      { numRuns: 150 }
    );
  });

  it('filterByZone includes all matching records from input', () => {
    fc.assert(
      fc.property(recordsArb, zoneIdArb, (records, zoneId) => {
        const filtered = filterByZone(records, zoneId);
        const expected = records.filter(r => r.zone_id === zoneId);

        expect(filtered.length).toBe(expected.length);
        // 全ての該当レコードが含まれる
        for (let i = 0; i < expected.length; i++) {
          expect(filtered).toContainEqual(expected[i]);
        }
      }),
      { numRuns: 150 }
    );
  });
});

describe('Feature: hair-removal-tracker, Property 6: 日付範囲フィルタの正確性', () => {
  it('filterByDateRange returns only records within [startDate, endDate]', () => {
    fc.assert(
      fc.property(
        recordsArb,
        dateArb,
        dateArb,
        (records, date1, date2) => {
          const startDate = date1 < date2 ? date1 : date2;
          const endDate = date1 < date2 ? date2 : date1;

          const filtered = filterByDateRange(records, startDate, endDate);

          // 全結果のdateが範囲内
          for (let i = 0; i < filtered.length; i++) {
            expect(filtered[i].date >= startDate).toBe(true);
            expect(filtered[i].date <= endDate).toBe(true);
          }
        }
      ),
      { numRuns: 150 }
    );
  });

  it('filterByDateRange includes all matching records from input', () => {
    fc.assert(
      fc.property(
        recordsArb,
        dateArb,
        dateArb,
        (records, date1, date2) => {
          const startDate = date1 < date2 ? date1 : date2;
          const endDate = date1 < date2 ? date2 : date1;

          const filtered = filterByDateRange(records, startDate, endDate);
          const expected = records.filter(r => r.date >= startDate && r.date <= endDate);

          expect(filtered.length).toBe(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(filtered).toContainEqual(expected[i]);
          }
        }
      ),
      { numRuns: 150 }
    );
  });
});

describe('Feature: hair-removal-tracker, Property 7: ゾーン統計の正確性', () => {
  /**
   * Arbitrary: 同一ゾーンの複数レコードを生成する
   */
  const singleZoneRecordsArb = fc.tuple(zoneIdArb, fc.array(dateArb, { minLength: 0, maxLength: 20 }))
    .map(([zoneId, dates]) => {
      return dates.map((date, i) => ({
        id: 'rec-' + i,
        zone_id: zoneId,
        date: date,
        intensity: 3,
        memo: null,
        photo: null,
        created_at: '2025-01-01T00:00:00Z'
      }));
    });

  it('getZoneTreatmentCount returns records.length', () => {
    fc.assert(
      fc.property(singleZoneRecordsArb, (records) => {
        expect(getZoneTreatmentCount(records)).toBe(records.length);
      }),
      { numRuns: 150 }
    );
  });

  it('getZoneAverageInterval returns null when count <= 1', () => {
    fc.assert(
      fc.property(
        zoneIdArb,
        fc.oneof(
          fc.constant([]),
          dateArb.map(d => [{ id: '1', zone_id: 'z', date: d, intensity: 3, memo: null, photo: null, created_at: '2025-01-01T00:00:00Z' }])
        ),
        (zoneId, records) => {
          expect(getZoneAverageInterval(records)).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getZoneAverageInterval = mean of consecutive date differences for count > 1', () => {
    // Generate records with at least 2 entries
    const multiRecordsArb = fc.tuple(
      zoneIdArb,
      fc.array(dateArb, { minLength: 2, maxLength: 15 })
    ).map(([zoneId, dates]) => {
      return dates.map((date, i) => ({
        id: 'rec-' + i,
        zone_id: zoneId,
        date: date,
        intensity: 3,
        memo: null,
        photo: null,
        created_at: '2025-01-01T00:00:00Z'
      }));
    });

    fc.assert(
      fc.property(multiRecordsArb, (records) => {
        const result = getZoneAverageInterval(records);

        // Manually compute expected average interval
        const sortedDates = records.map(r => r.date).sort();
        let totalDiff = 0;
        for (let i = 1; i < sortedDates.length; i++) {
          totalDiff += (Date.parse(sortedDates[i]) - Date.parse(sortedDates[i - 1])) / 86400000;
        }
        const expected = totalDiff / (sortedDates.length - 1);

        expect(result).toBeCloseTo(expected, 5);
      }),
      { numRuns: 150 }
    );
  });
});
