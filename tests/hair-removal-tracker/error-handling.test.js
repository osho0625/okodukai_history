/**
 * Error Handling Tests - エラーハンドリング動作確認
 * 
 * Task 15.2: エラーハンドリング動作確認
 * - localStorage QuotaExceeded シミュレーション
 * - インポートバリデーションエラー
 * - 写真ストレージ制限
 * - 削除操作のエッジケース
 * - 設定のエッジケース
 * 
 * Requirements: 全体
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

function createTestEnv() {
  const dom = new JSDOM(`<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body>
<div id="body-map-container"></div>
<div id="body-map-tooltip"></div>
<div class="toast" id="toast"></div>
</body>
</html>`, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });
  const window = dom.window;

  // Stub BODY_MAP_DATA
  window.BODY_MAP_DATA = { front: [], back: [] };

  // Mock crypto.randomUUID
  let uuidCounter = 0;
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: () => 'uuid-' + (++uuidCounter),
      getRandomValues: (arr) => arr,
    },
    writable: true,
    configurable: true,
  });

  // Load the main script
  const fs = require('fs');
  const scriptContent = fs.readFileSync('js/hair-removal-tracker.js', 'utf-8');
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = scriptContent;
  window.document.body.appendChild(scriptEl);

  return { dom, window, api: window._HairRemovalTracker };
}

describe('Error Handling: localStorage QuotaExceeded', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('saveRecord returns { success: false } when localStorage throws QuotaExceededError', () => {
    // Override Storage.prototype.setItem to throw QuotaExceededError
    const originalSetItem = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function(key, value) {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    };

    const record = {
      id: 'quota-test-1',
      zone_id: 'front_face_01',
      date: '2025-03-15',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-03-15T10:00:00Z',
    };

    const result = api.StorageManager.saveRecord(record);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ストレージ容量');

    // Restore
    window.Storage.prototype.setItem = originalSetItem;
  });

  it('saveSettings returns { success: false } when localStorage throws QuotaExceededError', () => {
    const originalSetItem = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function(key, value) {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    };

    const result = api.StorageManager.saveSettings({
      default_cycle_days: 45,
      color_threshold_days: 60,
      zone_cycles: {},
      group_cycles: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('ストレージ容量');

    // Restore
    window.Storage.prototype.setItem = originalSetItem;
  });

  it('deleteRecord returns { success: false } when localStorage throws QuotaExceededError', () => {
    // First save a record normally
    const record = {
      id: 'quota-del-1',
      zone_id: 'front_face_01',
      date: '2025-03-15',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-03-15T10:00:00Z',
    };
    api.StorageManager.saveRecord(record);

    // Now mock setItem to throw
    const originalSetItem = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function(key, value) {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    };

    const result = api.StorageManager.deleteRecord('quota-del-1');
    expect(result.success).toBe(false);

    // Restore
    window.Storage.prototype.setItem = originalSetItem;
  });
});

describe('Error Handling: Import Validation Errors', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('importData with invalid JSON returns { success: false }', () => {
    const result = api.importData('{ invalid json !!!', 'replace');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('importData with empty string returns { success: false }', () => {
    const result = api.importData('', 'replace');
    expect(result.success).toBe(false);
  });

  it('importData with invalid records (missing required fields) returns { success: false }', () => {
    const invalidData = {
      version: '1.0',
      exported_at: '2025-01-01T00:00:00Z',
      records: [
        { id: 'rec-1' }, // missing zone_id, date, intensity, created_at
      ],
      settings: { default_cycle_days: 30, color_threshold_days: 30, zone_cycles: {}, group_cycles: {} },
    };
    const result = api.importData(JSON.stringify(invalidData), 'replace');
    expect(result.success).toBe(false);
  });

  it('importData with invalid intensity (out of 1-5 range) returns { success: false }', () => {
    const invalidData = {
      version: '1.0',
      exported_at: '2025-01-01T00:00:00Z',
      records: [
        { id: 'rec-1', zone_id: 'front_face_01', date: '2025-01-01', intensity: 10, created_at: '2025-01-01T00:00:00Z' },
      ],
      settings: { default_cycle_days: 30, color_threshold_days: 30, zone_cycles: {}, group_cycles: {} },
    };
    const result = api.importData(JSON.stringify(invalidData), 'replace');
    expect(result.success).toBe(false);
  });

  it('importData with invalid date format returns { success: false }', () => {
    const invalidData = {
      version: '1.0',
      exported_at: '2025-01-01T00:00:00Z',
      records: [
        { id: 'rec-1', zone_id: 'front_face_01', date: 'not-a-date', intensity: 3, created_at: '2025-01-01T00:00:00Z' },
      ],
      settings: { default_cycle_days: 30, color_threshold_days: 30, zone_cycles: {}, group_cycles: {} },
    };
    const result = api.importData(JSON.stringify(invalidData), 'replace');
    expect(result.success).toBe(false);
  });

  it('importData with non-object data (number) returns { success: false }', () => {
    const result = api.importData('42', 'replace');
    expect(result.success).toBe(false);
  });

  it('existing data remains intact after failed import', () => {
    // Save a record first
    api.StorageManager.saveRecord({
      id: 'safe-1',
      zone_id: 'front_face_01',
      date: '2025-01-01',
      intensity: 2,
      memo: null,
      photo: null,
      created_at: '2025-01-01T00:00:00Z',
    });

    // Attempt invalid import
    api.importData('not valid json', 'replace');

    // Verify existing data is still there
    const records = api.StorageManager.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('safe-1');
  });
});

describe('Error Handling: Photo Storage Limit', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('PhotoCompressor.getBase64Size returns correct byte size', () => {
    // A simple base64 string: "aGVsbG8=" decodes to "hello" (5 bytes)
    const result = api.PhotoCompressor.getBase64Size('data:image/jpeg;base64,aGVsbG8=');
    expect(result).toBe(5);
  });

  it('PhotoCompressor.getBase64Size returns 0 for empty/null input', () => {
    expect(api.PhotoCompressor.getBase64Size(null)).toBe(0);
    expect(api.PhotoCompressor.getBase64Size('')).toBe(0);
  });

  it('getPhotoStorageUsage sums up all photo sizes in records', () => {
    // Create fake base64 photo data (small strings for testing)
    const fakePhoto1 = 'data:image/jpeg;base64,aGVsbG8='; // 5 bytes
    const fakePhoto2 = 'data:image/jpeg;base64,d29ybGQ='; // 5 bytes

    api.StorageManager.saveRecord({
      id: 'photo-1',
      zone_id: 'front_face_01',
      date: '2025-01-01',
      intensity: 3,
      memo: null,
      photo: fakePhoto1,
      created_at: '2025-01-01T00:00:00Z',
    });
    api.StorageManager.saveRecord({
      id: 'photo-2',
      zone_id: 'front_face_02',
      date: '2025-01-02',
      intensity: 3,
      memo: null,
      photo: fakePhoto2,
      created_at: '2025-01-02T00:00:00Z',
    });

    const usage = api.StorageManager.getPhotoStorageUsage();
    expect(usage).toBe(10); // 5 + 5
  });

  it('getPhotoStorageUsage returns 0 when no photos exist', () => {
    api.StorageManager.saveRecord({
      id: 'no-photo-1',
      zone_id: 'front_face_01',
      date: '2025-01-01',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-01-01T00:00:00Z',
    });

    const usage = api.StorageManager.getPhotoStorageUsage();
    expect(usage).toBe(0);
  });
});

describe('Error Handling: Delete Non-Existent Record', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('deleteRecord with non-existent ID does not throw and returns success', () => {
    // Deleting an ID that doesn't exist should not crash
    const result = api.StorageManager.deleteRecord('non-existent-id');
    // The filter simply produces the same array (empty), and safeSave succeeds
    expect(result.success).toBe(true);
  });

  it('deleteRecord with non-existent ID does not affect other records', () => {
    api.StorageManager.saveRecord({
      id: 'existing-1',
      zone_id: 'front_face_01',
      date: '2025-01-01',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-01-01T00:00:00Z',
    });

    const result = api.StorageManager.deleteRecord('non-existent-id');
    expect(result.success).toBe(true);

    const records = api.StorageManager.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('existing-1');
  });
});

describe('Error Handling: Settings Edge Cases', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('getSettings returns defaults when localStorage is empty', () => {
    const settings = api.StorageManager.getSettings();
    expect(settings.default_cycle_days).toBe(30);
    expect(settings.color_threshold_days).toBe(30);
    expect(settings.zone_cycles).toEqual({});
    expect(settings.group_cycles).toEqual({});
  });

  it('getSettings handles corrupted JSON in localStorage gracefully', () => {
    // Write corrupted data directly to localStorage
    window.localStorage.setItem('hair_removal_settings', '{corrupted json!!!');

    // getSettings should return defaults without throwing
    const settings = api.StorageManager.getSettings();
    expect(settings.default_cycle_days).toBe(30);
    expect(settings.color_threshold_days).toBe(30);
    expect(settings.zone_cycles).toEqual({});
    expect(settings.group_cycles).toEqual({});
  });

  it('getRecords handles corrupted JSON in localStorage gracefully', () => {
    // Write corrupted data directly to localStorage
    window.localStorage.setItem('hair_removal_records', 'not-valid-json');

    // getRecords should return empty array without throwing
    const records = api.StorageManager.getRecords();
    expect(records).toEqual([]);
  });

  it('getSettings fills in missing fields with defaults', () => {
    // Save partial settings (missing some fields)
    window.localStorage.setItem('hair_removal_settings', JSON.stringify({
      default_cycle_days: 45,
      // missing color_threshold_days, zone_cycles, group_cycles
    }));

    const settings = api.StorageManager.getSettings();
    expect(settings.default_cycle_days).toBe(45);
    expect(settings.color_threshold_days).toBe(30); // default
    expect(settings.zone_cycles).toEqual({}); // default
    expect(settings.group_cycles).toEqual({}); // default
  });
});
