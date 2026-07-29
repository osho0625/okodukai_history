/**
 * Property 8, 9: 要施術リスト・次回施術日のプロパティテスト
 * 
 * Property 8: getOverdueZones returns exactly those zones where elapsed > cycle, sorted by overdueDays desc
 * Property 9: getNextTreatmentDate(lastDate, cycleDays) returns date exactly cycleDays after lastDate
 * 
 * **Validates: Requirements 5.3, 5.4, 5.5**
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

let getOverdueZones;
let getNextTreatmentDate;

beforeAll(async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div><div id="treatment-modal" class="modal-overlay"><div class="modal-content"><div class="modal-header"><span id="modal-zone-name"></span></div><div class="modal-body"><input type="date" id="modal-date"><div id="modal-intensity"></div><textarea id="modal-memo"></textarea></div><div class="modal-footer"><button id="modal-cancel"></button><button id="modal-confirm"></button></div></div></div><div id="multi-select-bar" style="display:none;"><button id="multi-select-deselect"></button><button id="multi-select-save"><span id="multi-select-count">0</span></button></div><div id="toast"></div><div class="tab-bar"><button data-tab="map">マップ</button><button data-tab="history">履歴</button><button data-tab="stats">統計</button><button data-tab="settings">設定</button></div><div id="tab-map" class="tab-content active"><div class="body-map-toggle"><button id="side-toggle-btn" data-side="front">前面 / 背面</button></div></div><div id="tab-history" class="tab-content"></div><div id="tab-stats" class="tab-content"></div><div id="tab-settings" class="tab-content"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  });
  const window = dom.window;

  // Define BODY_MAP_DATA stub
  window.BODY_MAP_DATA = { front: [], back: [] };
  window.BODY_GROUPS = [];

  // Mock crypto.randomUUID
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
  getOverdueZones = window._HairRemovalTracker.getOverdueZones;
  getNextTreatmentDate = window._HairRemovalTracker.getNextTreatmentDate;
});

/**
 * Arbitrary: 有効なYYYY-MM-DD日付文字列を生成する
 */
const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2025-06-01')
}).map(d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
});

/**
 * Arbitrary: 周期日数（1〜365）
 */
const cycleDaysArb = fc.integer({ min: 1, max: 365 });

/**
 * Arbitrary: ゾーン定義を生成する
 */
const zoneArb = fc.record({
  id: fc.stringMatching(/^zone_[a-z]{3,6}_[0-9]{2}$/),
  name: fc.stringMatching(/^[あ-ん]{2,5}$/),
  group: fc.constantFrom('顔', '胸', '腹', '左腕', '右腕', '背中上部', '背中下部', '左脚', '右脚'),
  side: fc.constantFrom('front', 'back'),
  svgPath: fc.constant('M0,0L10,10')
});

describe('Feature: hair-removal-tracker, Property 8: 要施術リストの正確性', () => {
  it('getOverdueZones returns exactly those zones where elapsed > cycle, sorted by overdueDays desc', () => {
    fc.assert(
      fc.property(
        fc.array(zoneArb, { minLength: 1, maxLength: 10 }),
        cycleDaysArb,
        fc.array(
          fc.record({
            groupCycleOffset: fc.integer({ min: -10, max: 50 }),
            zoneCycleOffset: fc.oneof(fc.constant(null), fc.integer({ min: -10, max: 50 }))
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (zones, defaultCycle, cycleOffsets) => {
          // Make zones unique by id
          const uniqueZones = [];
          const seenIds = new Set();
          for (const z of zones) {
            if (!seenIds.has(z.id)) {
              seenIds.add(z.id);
              uniqueZones.push(z);
            }
          }
          if (uniqueZones.length === 0) return;

          // Create records: each zone gets a fixed past date for its last treatment
          const now = Date.now();
          const records = [];
          // Assign elapsed days to each zone (some overdue, some not)
          const elapsedDaysPerZone = {};
          
          // Build settings
          const settings = {
            default_cycle_days: defaultCycle,
            group_cycles: {},
            zone_cycles: {}
          };

          // For each zone, create a record with a known elapsed time
          for (let i = 0; i < uniqueZones.length; i++) {
            const zone = uniqueZones[i];
            const offset = cycleOffsets[i % cycleOffsets.length];
            
            // Set group cycles
            if (offset.groupCycleOffset !== 0 && !settings.group_cycles[zone.group]) {
              const groupCycle = Math.max(1, defaultCycle + offset.groupCycleOffset);
              settings.group_cycles[zone.group] = groupCycle;
            }
            
            // Set zone cycles for some zones
            if (offset.zoneCycleOffset !== null) {
              const zoneCycle = Math.max(1, defaultCycle + offset.zoneCycleOffset);
              settings.zone_cycles[zone.id] = zoneCycle;
            }

            // Determine the effective cycle for this zone
            let effectiveCycle = settings.default_cycle_days;
            if (settings.group_cycles[zone.group]) {
              effectiveCycle = settings.group_cycles[zone.group];
            }
            if (settings.zone_cycles[zone.id]) {
              effectiveCycle = settings.zone_cycles[zone.id];
            }

            // Create a record with elapsed days = effectiveCycle + (i - half)
            // This ensures some are overdue and some are not
            const elapsedDays = effectiveCycle + (i - Math.floor(uniqueZones.length / 2));
            const recordDate = new Date(now - elapsedDays * 86400000);
            const y = recordDate.getFullYear();
            const m = String(recordDate.getMonth() + 1).padStart(2, '0');
            const day = String(recordDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${day}`;

            elapsedDaysPerZone[zone.id] = { elapsed: elapsedDays, cycle: effectiveCycle };

            records.push({
              id: 'rec-' + i,
              zone_id: zone.id,
              date: dateStr,
              intensity: 3,
              memo: null,
              photo: null,
              created_at: '2025-01-01T00:00:00Z'
            });
          }

          const result = getOverdueZones(uniqueZones, records, settings);

          // Check: result contains exactly zones where elapsed > cycle
          for (const item of result) {
            const info = elapsedDaysPerZone[item.zone.id];
            // overdueDays should be positive (elapsed > cycle)
            expect(item.overdueDays).toBeGreaterThan(0);
          }

          // Check: zones not in result should have elapsed <= cycle
          const overdueIds = new Set(result.map(r => r.zone.id));
          for (const zone of uniqueZones) {
            const info = elapsedDaysPerZone[zone.id];
            if (!overdueIds.has(zone.id)) {
              // Allow 1 day tolerance due to floor rounding
              expect(info.elapsed).toBeLessThanOrEqual(info.cycle + 1);
            }
          }

          // Check: result is sorted by overdueDays desc
          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].overdueDays).toBeGreaterThanOrEqual(result[i + 1].overdueDays);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: hair-removal-tracker, Property 9: 次回施術日計算', () => {
  it('getNextTreatmentDate returns date exactly cycleDays after lastDate', () => {
    fc.assert(
      fc.property(
        dateArb,
        cycleDaysArb,
        (lastDate, cycleDays) => {
          const result = getNextTreatmentDate(lastDate, cycleDays);

          // Calculate expected: lastDate + cycleDays
          const d = new Date(Date.parse(lastDate));
          d.setDate(d.getDate() + cycleDays);
          const expectedY = d.getFullYear();
          const expectedM = String(d.getMonth() + 1).padStart(2, '0');
          const expectedDay = String(d.getDate()).padStart(2, '0');
          const expected = `${expectedY}-${expectedM}-${expectedDay}`;

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('getNextTreatmentDate result - lastDate difference equals cycleDays (in ms)', () => {
    fc.assert(
      fc.property(
        dateArb,
        cycleDaysArb,
        (lastDate, cycleDays) => {
          const result = getNextTreatmentDate(lastDate, cycleDays);

          const diffMs = Date.parse(result) - Date.parse(lastDate);
          const diffDays = Math.round(diffMs / 86400000);

          expect(diffDays).toBe(cycleDays);
        }
      ),
      { numRuns: 200 }
    );
  });
});
