/**
 * validateImportData Unit Tests
 * Feature: hair-removal-tracker
 *
 * **Validates: Requirements 7.4, 7.5**
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('validateImportData', () => {
  let dom;
  let window;
  let validateImportData;

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

    validateImportData = window._HairRemovalTracker.validateImportData;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  it('rejects invalid JSON with appropriate error', () => {
    const result = validateImportData('not valid json {{{');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('JSONの形式が正しくありません');
  });

  it('accepts valid export format (object with records array)', () => {
    const data = {
      version: '1.0',
      records: [
        { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 3, memo: null, photo: null, created_at: '2025-01-15T10:30:00Z' }
      ],
      settings: {}
    };
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].id).toBe('abc');
  });

  it('accepts valid bare array format', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 3, memo: null, photo: null, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(true);
    expect(result.records).toHaveLength(1);
  });

  it('rejects data that is neither array nor object with records', () => {
    const result = validateImportData(JSON.stringify({ foo: 'bar' }));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects record with missing id', () => {
    const data = [
      { zone_id: 'front_chest_01', date: '2025-01-15', intensity: 3, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('id'))).toBe(true);
  });

  it('rejects record with empty id', () => {
    const data = [
      { id: '', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 3, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('id'))).toBe(true);
  });

  it('rejects record with missing zone_id', () => {
    const data = [
      { id: 'abc', date: '2025-01-15', intensity: 3, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('zone_id'))).toBe(true);
  });

  it('rejects record with invalid date format', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '15-01-2025', intensity: 3, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('date'))).toBe(true);
  });

  it('rejects record with intensity out of range', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 0, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('intensity'))).toBe(true);

    const data2 = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 6, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result2 = validateImportData(JSON.stringify(data2));
    expect(result2.valid).toBe(false);
    expect(result2.errors.some(e => e.includes('intensity'))).toBe(true);
  });

  it('rejects record with non-integer intensity', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 2.5, created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('intensity'))).toBe(true);
  });

  it('rejects record with missing created_at', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 3 }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('created_at'))).toBe(true);
  });

  it('collects multiple errors for multiple invalid records', () => {
    const data = [
      { id: '', zone_id: '', date: 'bad', intensity: 0, created_at: '' },
      { id: 'ok', zone_id: 'ok', date: '2025-01-01', intensity: 3, created_at: '2025-01-01T00:00:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(false);
    // First record has 5 errors (id, zone_id, date, intensity, created_at)
    expect(result.errors.length).toBe(5);
  });

  it('accepts valid records with optional fields (memo, photo)', () => {
    const data = [
      { id: 'abc', zone_id: 'front_chest_01', date: '2025-01-15', intensity: 5, memo: 'test', photo: 'data:image/jpeg;base64,...', created_at: '2025-01-15T10:30:00Z' }
    ];
    const result = validateImportData(JSON.stringify(data));
    expect(result.valid).toBe(true);
  });

  it('accepts empty records array', () => {
    const result = validateImportData(JSON.stringify([]));
    expect(result.valid).toBe(true);
    expect(result.records).toHaveLength(0);
  });

  it('is accessible via StorageManager.validateImportData', () => {
    const sm = window._HairRemovalTracker.StorageManager;
    const result = sm.validateImportData(JSON.stringify([]));
    expect(result.valid).toBe(true);
  });
});


/**
 * Property 12: インポートバリデーション
 *
 * For any JSON string, validateImportData(json) should accept it if and only if it conforms
 * to the expected schema (array of objects with required fields: id, zone_id, date, intensity, created_at).
 * Invalid JSON should be rejected and existing data should remain unchanged.
 *
 * Feature: hair-removal-tracker, Property 12: インポートバリデーション
 *
 * **Validates: Requirements 7.4, 7.5**
 */
import fc from 'fast-check';

describe('Feature: hair-removal-tracker, Property 12: インポートバリデーション', () => {
  let dom;
  let window;
  let validateImportData;

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

    validateImportData = window._HairRemovalTracker.validateImportData;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  // Generator for valid Treatment_Record
  const validRecordArb = fc.record({
    id: fc.uuid(),
    zone_id: fc.stringOf(fc.constantFrom('a','b','c','d','e','f','g','_','0','1','2','3'), { minLength: 3, maxLength: 20 }),
    date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().slice(0, 10)),
    intensity: fc.integer({ min: 1, max: 5 }),
    memo: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
    photo: fc.constant(null),
    created_at: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
  });

  it('valid records array → validateImportData returns valid=true', () => {
    fc.assert(
      fc.property(
        fc.array(validRecordArb, { minLength: 0, maxLength: 10 }),
        (records) => {
          const json = JSON.stringify(records);
          const result = validateImportData(json);
          expect(result.valid).toBe(true);
          expect(result.records).toHaveLength(records.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid records in export format ({ records: [...] }) → validateImportData returns valid=true', () => {
    fc.assert(
      fc.property(
        fc.array(validRecordArb, { minLength: 1, maxLength: 10 }),
        (records) => {
          const exportData = { version: '1.0', records, settings: {} };
          const json = JSON.stringify(exportData);
          const result = validateImportData(json);
          expect(result.valid).toBe(true);
          expect(result.records).toHaveLength(records.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invalid JSON strings → validateImportData returns valid=false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
          try { JSON.parse(s); return false; } catch { return true; }
        }),
        (invalidJson) => {
          const result = validateImportData(invalidJson);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('records with random field invalidation → validateImportData returns valid=false', () => {
    // Strategy: take a valid record and randomly remove or invalidate one required field
    const invalidFieldArb = fc.oneof(
      // Missing id
      validRecordArb.map(r => { const { id, ...rest } = r; return rest; }),
      // Empty id
      validRecordArb.map(r => ({ ...r, id: '' })),
      // Missing zone_id
      validRecordArb.map(r => { const { zone_id, ...rest } = r; return rest; }),
      // Empty zone_id
      validRecordArb.map(r => ({ ...r, zone_id: '' })),
      // Invalid date format
      validRecordArb.map(r => ({ ...r, date: '15-01-2025' })),
      // Intensity out of range (0)
      validRecordArb.map(r => ({ ...r, intensity: 0 })),
      // Intensity out of range (6)
      validRecordArb.map(r => ({ ...r, intensity: 6 })),
      // Non-integer intensity
      validRecordArb.map(r => ({ ...r, intensity: 2.5 })),
      // Missing created_at
      validRecordArb.map(r => { const { created_at, ...rest } = r; return rest; }),
      // Empty created_at
      validRecordArb.map(r => ({ ...r, created_at: '' }))
    );

    fc.assert(
      fc.property(
        fc.array(invalidFieldArb, { minLength: 1, maxLength: 1 }),
        (records) => {
          const json = JSON.stringify(records);
          const result = validateImportData(json);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
