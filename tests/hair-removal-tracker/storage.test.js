/**
 * Storage Manager Property-Based Tests
 * Feature: hair-removal-tracker, Property 2: 施術記録の保存・読込ラウンドトリップ
 *
 * **Validates: Requirements 3.6**
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Feature: hair-removal-tracker, Property 2: 施術記録の保存・読込ラウンドトリップ', () => {
  let dom;
  let window;

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
  const treatmentRecordArb = fc.record({
    id: fc.uuid(),
    zone_id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_0123456789'.split('')), { minLength: 3, maxLength: 30 }),
    date: fc.date({
      min: new Date('2020-01-01'),
      max: new Date('2030-12-31')
    }).map(d => d.toISOString().slice(0, 10)),
    intensity: fc.integer({ min: 1, max: 5 }),
    memo: fc.oneof(fc.constant(null), fc.string({ minLength: 0, maxLength: 100 })),
    photo: fc.constant(null),
    created_at: fc.date({
      min: new Date('2020-01-01'),
      max: new Date('2030-12-31')
    }).map(d => d.toISOString())
  });

  it('Property 2: For any valid Treatment_Record, saveRecord then getRecords should contain the saved record with identical fields', () => {
    fc.assert(
      fc.property(treatmentRecordArb, (record) => {
        // Clear storage before each iteration
        window.localStorage.clear();

        const sm = window._HairRemovalTracker.StorageManager;

        // Save the record
        const result = sm.saveRecord(record);
        expect(result.success).toBe(true);

        // Read back records
        const records = sm.getRecords();

        // Find the saved record by id
        const found = records.find(r => r.id === record.id);
        expect(found).toBeDefined();

        // Verify all fields are identical
        expect(found.id).toBe(record.id);
        expect(found.zone_id).toBe(record.zone_id);
        expect(found.date).toBe(record.date);
        expect(found.intensity).toBe(record.intensity);
        expect(found.memo).toBe(record.memo);
        expect(found.photo).toBe(record.photo);
        expect(found.created_at).toBe(record.created_at);
      }),
      { numRuns: 100 }
    );
  });

  it('saveRecord/getRecords/deleteRecord basic CRUD works', () => {
    const sm = window._HairRemovalTracker.StorageManager;

    // Initially empty
    expect(sm.getRecords()).toEqual([]);

    // Save a record
    const record = {
      id: 'test-id-1',
      zone_id: 'front_chest_01',
      date: '2025-01-15',
      intensity: 3,
      memo: 'テストメモ',
      photo: null,
      created_at: '2025-01-15T10:30:00Z'
    };
    const saveResult = sm.saveRecord(record);
    expect(saveResult.success).toBe(true);

    // Get records
    const records = sm.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(record);

    // Delete the record
    const deleteResult = sm.deleteRecord('test-id-1');
    expect(deleteResult.success).toBe(true);
    expect(sm.getRecords()).toHaveLength(0);
  });

  it('getSettings returns defaults on first call', () => {
    const sm = window._HairRemovalTracker.StorageManager;
    const settings = sm.getSettings();
    expect(settings.default_cycle_days).toBe(30);
    expect(settings.color_threshold_days).toBe(30);
    expect(settings.zone_cycles).toEqual({});
    expect(settings.group_cycles).toEqual({});
  });

  it('saveSettings persists and getSettings retrieves correctly', () => {
    const sm = window._HairRemovalTracker.StorageManager;
    const newSettings = {
      default_cycle_days: 45,
      color_threshold_days: 60,
      zone_cycles: { front_face_01: 14 },
      group_cycles: { '顔': 14 }
    };
    const result = sm.saveSettings(newSettings);
    expect(result.success).toBe(true);

    const loaded = sm.getSettings();
    expect(loaded.default_cycle_days).toBe(45);
    expect(loaded.color_threshold_days).toBe(60);
    expect(loaded.zone_cycles).toEqual({ front_face_01: 14 });
    expect(loaded.group_cycles).toEqual({ '顔': 14 });
  });

  it('getRecordsByZone returns only records for the specified zone', () => {
    const sm = window._HairRemovalTracker.StorageManager;

    sm.saveRecord({ id: '1', zone_id: 'zone_a', date: '2025-01-01', intensity: 1, memo: null, photo: null, created_at: '2025-01-01T00:00:00Z' });
    sm.saveRecord({ id: '2', zone_id: 'zone_b', date: '2025-01-02', intensity: 2, memo: null, photo: null, created_at: '2025-01-02T00:00:00Z' });
    sm.saveRecord({ id: '3', zone_id: 'zone_a', date: '2025-01-03', intensity: 3, memo: null, photo: null, created_at: '2025-01-03T00:00:00Z' });

    const zoneARecords = sm.getRecordsByZone('zone_a');
    expect(zoneARecords).toHaveLength(2);
    expect(zoneARecords.every(r => r.zone_id === 'zone_a')).toBe(true);

    const zoneBRecords = sm.getRecordsByZone('zone_b');
    expect(zoneBRecords).toHaveLength(1);
    expect(zoneBRecords[0].zone_id).toBe('zone_b');

    const zoneCRecords = sm.getRecordsByZone('zone_c');
    expect(zoneCRecords).toHaveLength(0);
  });

  it('getRecordsByDateRange returns only records within the date range (inclusive)', () => {
    const sm = window._HairRemovalTracker.StorageManager;

    sm.saveRecord({ id: '1', zone_id: 'z1', date: '2025-01-10', intensity: 1, memo: null, photo: null, created_at: '2025-01-10T00:00:00Z' });
    sm.saveRecord({ id: '2', zone_id: 'z2', date: '2025-01-15', intensity: 2, memo: null, photo: null, created_at: '2025-01-15T00:00:00Z' });
    sm.saveRecord({ id: '3', zone_id: 'z3', date: '2025-01-20', intensity: 3, memo: null, photo: null, created_at: '2025-01-20T00:00:00Z' });
    sm.saveRecord({ id: '4', zone_id: 'z4', date: '2025-01-25', intensity: 4, memo: null, photo: null, created_at: '2025-01-25T00:00:00Z' });

    // Inclusive boundaries
    const rangeRecords = sm.getRecordsByDateRange('2025-01-15', '2025-01-20');
    expect(rangeRecords).toHaveLength(2);
    expect(rangeRecords.map(r => r.id).sort()).toEqual(['2', '3']);

    // All records
    const allRecords = sm.getRecordsByDateRange('2025-01-01', '2025-12-31');
    expect(allRecords).toHaveLength(4);

    // No records
    const noRecords = sm.getRecordsByDateRange('2024-01-01', '2024-12-31');
    expect(noRecords).toHaveLength(0);
  });

  it('safeSave returns error on QuotaExceededError', () => {
    const sm = window._HairRemovalTracker.StorageManager;

    // Override Storage.prototype.setItem to throw QuotaExceededError
    const script = window.document.createElement('script');
    script.textContent = `
      (function() {
        var proto = Object.getPrototypeOf(localStorage);
        window.__origSetItem = proto.setItem;
        proto.setItem = function(key, value) {
          var err = new DOMException('QuotaExceededError', 'QuotaExceededError');
          throw err;
        };
      })();
    `;
    window.document.body.appendChild(script);

    const result = sm.saveRecord({
      id: 'test-quota',
      zone_id: 'zone_a',
      date: '2025-01-01',
      intensity: 1,
      memo: null,
      photo: null,
      created_at: '2025-01-01T00:00:00Z'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('ストレージ容量が不足しています');

    // Restore
    const restoreScript = window.document.createElement('script');
    restoreScript.textContent = `
      (function() {
        var proto = Object.getPrototypeOf(localStorage);
        proto.setItem = window.__origSetItem;
      })();
    `;
    window.document.body.appendChild(restoreScript);
  });
});
