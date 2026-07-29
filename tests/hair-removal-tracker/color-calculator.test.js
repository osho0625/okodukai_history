/**
 * Property 1: ヒートマップ色計算の正確性
 * 
 * For any non-negative integer of elapsed days and any positive color threshold,
 * calculateHeatColor(elapsedDays, thresholdDays) should return correct HSL values.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

let calculateHeatColor;
let buildColorMap;
let isOverdue;

beforeAll(async () => {
  // Set up jsdom environment
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  });
  const window = dom.window;

  // Define BODY_MAP_DATA stub before loading the script
  window.BODY_MAP_DATA = { front: [], back: [] };

  // Execute the module in jsdom
  const fs = await import('fs');
  const path = await import('path');
  const scriptPath = path.resolve('js/hair-removal-tracker.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = scriptContent;
  window.document.body.appendChild(scriptEl);

  // Get exported functions
  calculateHeatColor = window._HairRemovalTracker.calculateHeatColor;
  buildColorMap = window._HairRemovalTracker.buildColorMap;
  isOverdue = window._HairRemovalTracker.isOverdue;
});

/**
 * HSL文字列からhue値を抽出するヘルパー
 */
function extractHue(hslString) {
  const match = hslString.match(/hsl\((\d+),?\s*/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * HSL文字列からsaturation値を抽出するヘルパー
 */
function extractSaturation(hslString) {
  const match = hslString.match(/hsl\(\d+,?\s*(\d+)%/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * HSL文字列からlightness値を抽出するヘルパー
 */
function extractLightness(hslString) {
  const match = hslString.match(/hsl\(\d+,?\s*\d+%,?\s*(\d+)%/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

describe('Feature: hair-removal-tracker, Property 1: ヒートマップ色計算の正確性', () => {

  it('hue is always in [0, 120] for any non-negative elapsedDays and positive thresholdDays', () => {
    fc.assert(
      fc.property(
        fc.nat(10000),           // elapsedDays: 0 ~ 10000
        fc.integer({ min: 1, max: 10000 }),  // thresholdDays: 1 ~ 10000
        (elapsedDays, thresholdDays) => {
          const result = calculateHeatColor(elapsedDays, thresholdDays);
          const hue = extractHue(result);
          expect(hue).toBeGreaterThanOrEqual(0);
          expect(hue).toBeLessThanOrEqual(120);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('elapsedDays=0 → hue=120 (green)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // thresholdDays: 1 ~ 10000
        (thresholdDays) => {
          const result = calculateHeatColor(0, thresholdDays);
          const hue = extractHue(result);
          expect(hue).toBe(120);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('elapsedDays >= thresholdDays → hue=0 (red)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // thresholdDays
        fc.nat(5000),                         // extra days beyond threshold
        (thresholdDays, extra) => {
          const elapsedDays = thresholdDays + extra;
          const result = calculateHeatColor(elapsedDays, thresholdDays);
          const hue = extractHue(result);
          expect(hue).toBe(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('hue decreases monotonically as elapsedDays increases (within threshold)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 10000 }),  // thresholdDays (min 3 to allow two distinct days)
        (thresholdDays) => {
          // Pick two elapsed days: day1 < day2, both within (0, threshold)
          const day1 = Math.max(1, Math.floor(thresholdDays * 0.25));
          const day2 = Math.max(day1 + 1, Math.floor(thresholdDays * 0.75));
          
          if (day2 >= thresholdDays) return; // skip edge case
          
          const hue1 = extractHue(calculateHeatColor(day1, thresholdDays));
          const hue2 = extractHue(calculateHeatColor(day2, thresholdDays));
          
          expect(hue1).toBeGreaterThanOrEqual(hue2);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('saturation is always 60% and lightness is always 50%', () => {
    fc.assert(
      fc.property(
        fc.nat(10000),
        fc.integer({ min: 1, max: 10000 }),
        (elapsedDays, thresholdDays) => {
          const result = calculateHeatColor(elapsedDays, thresholdDays);
          const sat = extractSaturation(result);
          const light = extractLightness(result);
          expect(sat).toBe(60);
          expect(light).toBe(50);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('negative elapsedDays also returns hue=120 (green)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000, max: -1 }),
        fc.integer({ min: 1, max: 10000 }),
        (elapsedDays, thresholdDays) => {
          const result = calculateHeatColor(elapsedDays, thresholdDays);
          const hue = extractHue(result);
          expect(hue).toBe(120);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('buildColorMap', () => {
  it('returns a color for every zone', () => {
    const zones = [
      { id: 'zone_a', name: 'A', svgPath: 'M0,0', side: 'front', group: 'G1' },
      { id: 'zone_b', name: 'B', svgPath: 'M1,1', side: 'front', group: 'G1' },
      { id: 'zone_c', name: 'C', svgPath: 'M2,2', side: 'front', group: 'G2' },
    ];
    const records = [
      { zone_id: 'zone_a', date: new Date().toISOString().slice(0, 10) },
    ];
    const colorMap = buildColorMap(zones, records, 30);
    
    expect(Object.keys(colorMap)).toHaveLength(3);
    expect(colorMap['zone_a']).toBeDefined();
    expect(colorMap['zone_b']).toBeDefined();
    expect(colorMap['zone_c']).toBeDefined();
  });

  it('zones with no records get gray color', () => {
    const zones = [
      { id: 'zone_x', name: 'X', svgPath: 'M0,0', side: 'front', group: 'G1' },
    ];
    const records = [];
    const colorMap = buildColorMap(zones, records, 30);
    
    expect(colorMap['zone_x']).toBe('hsl(0, 0%, 80%)');
  });

  it('zone with recent treatment gets green-ish color', () => {
    const zones = [
      { id: 'zone_a', name: 'A', svgPath: 'M0,0', side: 'front', group: 'G1' },
    ];
    const today = new Date().toISOString().slice(0, 10);
    const records = [
      { zone_id: 'zone_a', date: today },
    ];
    const colorMap = buildColorMap(zones, records, 30);
    const hue = extractHue(colorMap['zone_a']);
    
    // Today's treatment → elapsed ~0 days → hue should be 120 or very close
    expect(hue).toBeGreaterThanOrEqual(116); // allowing for time-of-day rounding
  });
});

describe('isOverdue', () => {
  it('returns true when elapsedDays > cyclePeriod', () => {
    expect(isOverdue(31, 30)).toBe(true);
    expect(isOverdue(100, 14)).toBe(true);
  });

  it('returns false when elapsedDays <= cyclePeriod', () => {
    expect(isOverdue(30, 30)).toBe(false);
    expect(isOverdue(0, 30)).toBe(false);
    expect(isOverdue(14, 14)).toBe(false);
  });

  it('property: isOverdue(elapsed, cycle) === (elapsed > cycle)', () => {
    fc.assert(
      fc.property(
        fc.nat(10000),
        fc.integer({ min: 1, max: 10000 }),
        (elapsed, cycle) => {
          expect(isOverdue(elapsed, cycle)).toBe(elapsed > cycle);
        }
      ),
      { numRuns: 200 }
    );
  });
});
