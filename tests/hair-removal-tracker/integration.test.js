/**
 * Integration Tests - E2E動作確認
 * 
 * Task 15.1: 全コンポーネントのE2E動作確認
 * - Flow 1: 全タブ間の遷移
 * - Flow 2: レコード追加→ヒートマップ更新→統計反映→履歴表示のフロー
 * - Flow 3: エクスポート→インポートのラウンドトリップ
 * - Flow 4: 設定の永続化と要施術ゾーン計算への反映
 * 
 * Requirements: 全体
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Full HTML structure matching pages/hair-removal-tracker.html
 */
const FULL_HTML = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body>
<div class="tab-bar">
  <button class="active" data-tab="map">マップ</button>
  <button data-tab="history">履歴</button>
  <button data-tab="stats">統計</button>
  <button data-tab="settings">設定</button>
</div>

<div id="tab-map" class="tab-content active">
  <div class="body-map-toggle">
    <button id="side-toggle-btn" class="side-toggle-btn" data-side="front">前面 / 背面</button>
  </div>
  <div id="body-map-container" class="body-map-container"></div>
  <div id="body-map-tooltip" class="body-map-tooltip"></div>
</div>

<div id="tab-history" class="tab-content"></div>
<div id="tab-stats" class="tab-content"></div>
<div id="tab-settings" class="tab-content"></div>

<div id="treatment-modal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header"><span id="modal-zone-name"></span></div>
    <div class="modal-body">
      <input type="date" id="modal-date">
      <div class="intensity-selector" id="modal-intensity">
        <label class="intensity-option"><input type="radio" name="intensity" value="1"><span class="intensity-label">1</span></label>
        <label class="intensity-option"><input type="radio" name="intensity" value="2"><span class="intensity-label">2</span></label>
        <label class="intensity-option"><input type="radio" name="intensity" value="3" checked><span class="intensity-label">3</span></label>
        <label class="intensity-option"><input type="radio" name="intensity" value="4"><span class="intensity-label">4</span></label>
        <label class="intensity-option"><input type="radio" name="intensity" value="5"><span class="intensity-label">5</span></label>
      </div>
      <textarea id="modal-memo"></textarea>
      <div class="photo-attachment-section">
        <input type="file" id="modal-photo-input" accept="image/*" style="display:none;">
        <button type="button" id="modal-photo-btn" class="photo-attach-btn">📷 写真を添付</button>
        <div id="modal-photo-preview" class="photo-preview" style="display:none;">
          <img id="modal-photo-thumb" class="photo-thumbnail" alt="添付写真">
          <button type="button" id="modal-photo-remove" class="photo-remove-btn">写真を削除</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button id="modal-cancel">キャンセル</button>
      <button id="modal-confirm">保存</button>
    </div>
  </div>
</div>

<div id="multi-select-bar" class="multi-select-bar" style="display:none;">
  <button id="multi-select-deselect" class="multi-select-btn deselect">選択解除</button>
  <button id="multi-select-save" class="multi-select-btn save">記録する (<span id="multi-select-count">0</span>件)</button>
</div>

<div class="toast" id="toast"></div>
</body>
</html>`;

/**
 * Minimal BODY_MAP_DATA stub with a few zones for testing
 */
const BODY_MAP_DATA_STUB = {
  front: [
    { id: 'front_face_01', name: '額', svgPath: 'M150,50 L250,50 L250,80 L150,80 Z', side: 'front', group: '顔' },
    { id: 'front_face_02', name: '右頬', svgPath: 'M130,80 L170,80 L170,120 L130,120 Z', side: 'front', group: '顔' },
    { id: 'front_chest_01', name: '胸中央', svgPath: 'M160,200 L240,200 L240,280 L160,280 Z', side: 'front', group: '胸' },
    { id: 'front_arm_r_01', name: '右上腕', svgPath: 'M100,200 L130,200 L130,300 L100,300 Z', side: 'front', group: '右腕' },
    { id: 'front_arm_l_01', name: '左上腕', svgPath: 'M270,200 L300,200 L300,300 L270,300 Z', side: 'front', group: '左腕' },
  ],
  back: [
    { id: 'back_upper_01', name: '背中上部', svgPath: 'M150,150 L250,150 L250,250 L150,250 Z', side: 'back', group: '背中上部' },
    { id: 'back_lower_01', name: '背中下部', svgPath: 'M150,250 L250,250 L250,350 L150,350 Z', side: 'back', group: '背中下部' },
  ]
};

function createTestEnv() {
  const dom = new JSDOM(FULL_HTML, {
    url: 'http://localhost/#map',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });
  const window = dom.window;

  // Stub BODY_MAP_DATA
  window.BODY_MAP_DATA = BODY_MAP_DATA_STUB;

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

describe('Integration: Flow 1 - Tab Navigation', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('switchTab to "map" activates the map tab content', () => {
    api.switchTab('map');
    const mapTab = window.document.getElementById('tab-map');
    expect(mapTab.classList.contains('active')).toBe(true);

    const histTab = window.document.getElementById('tab-history');
    expect(histTab.classList.contains('active')).toBe(false);
  });

  it('switchTab to "history" activates the history tab', () => {
    api.switchTab('history');
    const histTab = window.document.getElementById('tab-history');
    expect(histTab.classList.contains('active')).toBe(true);

    const mapTab = window.document.getElementById('tab-map');
    expect(mapTab.classList.contains('active')).toBe(false);
  });

  it('switchTab to "stats" activates the stats tab', () => {
    api.switchTab('stats');
    const statsTab = window.document.getElementById('tab-stats');
    expect(statsTab.classList.contains('active')).toBe(true);
  });

  it('switchTab to "settings" activates the settings tab', () => {
    api.switchTab('settings');
    const settingsTab = window.document.getElementById('tab-settings');
    expect(settingsTab.classList.contains('active')).toBe(true);
  });

  it('switching through all tabs in sequence updates active state correctly', () => {
    const tabs = ['map', 'history', 'stats', 'settings', 'map'];
    for (const tab of tabs) {
      api.switchTab(tab);
      const activeContent = window.document.querySelector('.tab-content.active');
      expect(activeContent.id).toBe('tab-' + tab);
    }
  });

  it('tab buttons get active class on switch', () => {
    api.switchTab('stats');
    const buttons = window.document.querySelectorAll('.tab-bar button');
    const activeBtn = Array.from(buttons).find(b => b.classList.contains('active'));
    expect(activeBtn.dataset.tab).toBe('stats');
  });
});

describe('Integration: Flow 2 - Record Lifecycle', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('starts with empty records', () => {
    const records = api.StorageManager.getRecords();
    expect(records).toEqual([]);
  });

  it('save a record → appears in getRecords', () => {
    const record = {
      id: 'rec-1',
      zone_id: 'front_face_01',
      date: '2025-03-15',
      intensity: 3,
      memo: 'テスト記録',
      photo: null,
      created_at: '2025-03-15T10:00:00Z',
    };
    const result = api.StorageManager.saveRecord(record);
    expect(result.success).toBe(true);

    const records = api.StorageManager.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('rec-1');
    expect(records[0].zone_id).toBe('front_face_01');
  });

  it('saved record appears in history tab rendering', () => {
    api.StorageManager.saveRecord({
      id: 'rec-hist-1',
      zone_id: 'front_face_01',
      date: '2025-03-15',
      intensity: 4,
      memo: '履歴確認',
      photo: null,
      created_at: '2025-03-15T10:00:00Z',
    });

    // Switch to history tab to trigger rendering
    api.switchTab('history');

    const historyTab = window.document.getElementById('tab-history');
    const html = historyTab.innerHTML;
    // The history tab should contain the record date and zone info
    expect(html).toContain('2025-03-15');
  });

  it('saved record reflects in statistics tab', () => {
    api.StorageManager.saveRecord({
      id: 'rec-stats-1',
      zone_id: 'front_face_01',
      date: '2025-03-15',
      intensity: 4,
      memo: null,
      photo: null,
      created_at: '2025-03-15T10:00:00Z',
    });
    api.StorageManager.saveRecord({
      id: 'rec-stats-2',
      zone_id: 'front_chest_01',
      date: '2025-03-20',
      intensity: 2,
      memo: null,
      photo: null,
      created_at: '2025-03-20T10:00:00Z',
    });

    // Invalidate cache and check stats
    api.invalidateStatsCache();

    // Verify statistics calculations
    const records = api.StorageManager.getRecords();
    const monthlyStats = api.getMonthlyStats(records);
    expect(monthlyStats.get('2025-03')).toBe(2);

    const avgIntensity = api.getAverageIntensity(records);
    expect(avgIntensity).toBe(3); // (4+2)/2

    const coverage = api.getCoverageRate(records, 7); // 7 total zones in stub
    // 2 unique zones out of 7
    expect(coverage).toBeCloseTo(28.57, 1);
  });

  it('delete record → record is gone from storage', () => {
    api.StorageManager.saveRecord({
      id: 'rec-del-1',
      zone_id: 'front_face_01',
      date: '2025-04-01',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-04-01T10:00:00Z',
    });
    expect(api.StorageManager.getRecords()).toHaveLength(1);

    const delResult = api.StorageManager.deleteRecord('rec-del-1');
    expect(delResult.success).toBe(true);
    expect(api.StorageManager.getRecords()).toHaveLength(0);
  });

  it('delete record → history tab shows empty state', () => {
    api.StorageManager.saveRecord({
      id: 'rec-del-2',
      zone_id: 'front_face_01',
      date: '2025-04-01',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-04-01T10:00:00Z',
    });

    api.StorageManager.deleteRecord('rec-del-2');

    // Render history tab
    api.switchTab('history');
    const historyTab = window.document.getElementById('tab-history');
    const html = historyTab.innerHTML;
    // With no records, history shows empty state
    expect(html).toContain('施術履歴はまだありません');
  });
});

describe('Integration: Flow 3 - Export → Import Roundtrip', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('export → resetAll → import (replace) restores all records', () => {
    // Add several records
    const records = [
      { id: 'exp-1', zone_id: 'front_face_01', date: '2025-01-10', intensity: 2, memo: 'memo1', photo: null, created_at: '2025-01-10T08:00:00Z' },
      { id: 'exp-2', zone_id: 'front_chest_01', date: '2025-02-15', intensity: 4, memo: null, photo: null, created_at: '2025-02-15T09:00:00Z' },
      { id: 'exp-3', zone_id: 'front_arm_r_01', date: '2025-03-20', intensity: 5, memo: 'strong', photo: null, created_at: '2025-03-20T10:00:00Z' },
    ];
    for (const rec of records) {
      api.StorageManager.saveRecord(rec);
    }
    expect(api.StorageManager.getRecords()).toHaveLength(3);

    // Export all data
    const exportedJson = api.exportAll();
    expect(exportedJson).toBeTruthy();

    // Parse and verify export structure
    const exported = JSON.parse(exportedJson);
    expect(exported.records).toHaveLength(3);
    expect(exported.settings).toBeDefined();
    expect(exported.version).toBe('1.0');

    // Reset all data
    api.resetAll();
    expect(api.StorageManager.getRecords()).toHaveLength(0);

    // Import with mode='replace'
    const importResult = api.importData(exportedJson, 'replace');
    expect(importResult.success).toBe(true);
    expect(importResult.count).toBe(3);

    // Verify all records are restored
    const restored = api.StorageManager.getRecords();
    expect(restored).toHaveLength(3);
    expect(restored.map(r => r.id).sort()).toEqual(['exp-1', 'exp-2', 'exp-3']);

    // Verify record fields
    const rec1 = restored.find(r => r.id === 'exp-1');
    expect(rec1.zone_id).toBe('front_face_01');
    expect(rec1.date).toBe('2025-01-10');
    expect(rec1.intensity).toBe(2);
    expect(rec1.memo).toBe('memo1');
  });

  it('import with mode="merge" combines records correctly', () => {
    // Pre-existing records
    api.StorageManager.saveRecord({
      id: 'existing-1', zone_id: 'front_face_01', date: '2025-01-01', intensity: 1, memo: null, photo: null, created_at: '2025-01-01T00:00:00Z',
    });
    api.StorageManager.saveRecord({
      id: 'shared-id', zone_id: 'front_face_02', date: '2025-01-05', intensity: 2, memo: 'old', photo: null, created_at: '2025-01-05T00:00:00Z',
    });

    // Import data with overlapping id and new records
    const importData = {
      version: '1.0',
      exported_at: '2025-06-01T00:00:00Z',
      records: [
        // Same id but newer created_at → should replace
        { id: 'shared-id', zone_id: 'front_face_02', date: '2025-01-05', intensity: 3, memo: 'new', photo: null, created_at: '2025-02-01T00:00:00Z' },
        // New record
        { id: 'imported-1', zone_id: 'front_chest_01', date: '2025-03-01', intensity: 5, memo: null, photo: null, created_at: '2025-03-01T00:00:00Z' },
      ],
      settings: { default_cycle_days: 30, color_threshold_days: 30, zone_cycles: {}, group_cycles: {} },
    };

    const importResult = api.importData(JSON.stringify(importData), 'merge');
    expect(importResult.success).toBe(true);

    const merged = api.StorageManager.getRecords();
    // existing-1 + shared-id (updated) + imported-1 = 3 records
    expect(merged).toHaveLength(3);

    // shared-id should have new memo
    const sharedRec = merged.find(r => r.id === 'shared-id');
    expect(sharedRec.memo).toBe('new');
    expect(sharedRec.intensity).toBe(3);
    expect(sharedRec.created_at).toBe('2025-02-01T00:00:00Z');

    // existing-1 still there
    expect(merged.find(r => r.id === 'existing-1')).toBeDefined();

    // imported-1 added
    expect(merged.find(r => r.id === 'imported-1')).toBeDefined();
  });

  it('import with invalid JSON does not corrupt existing data', () => {
    api.StorageManager.saveRecord({
      id: 'safe-1', zone_id: 'front_face_01', date: '2025-01-01', intensity: 1, memo: null, photo: null, created_at: '2025-01-01T00:00:00Z',
    });

    const importResult = api.importData('{ invalid json !!!', 'replace');
    expect(importResult.success).toBe(false);

    // Existing data is untouched
    expect(api.StorageManager.getRecords()).toHaveLength(1);
    expect(api.StorageManager.getRecords()[0].id).toBe('safe-1');
  });
});

describe('Integration: Flow 4 - Settings Persistence', () => {
  let dom, window, api;

  beforeEach(() => {
    ({ dom, window, api } = createTestEnv());
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    dom.window.close();
  });

  it('default settings are correct on first load', () => {
    const settings = api.StorageManager.getSettings();
    expect(settings.default_cycle_days).toBe(30);
    expect(settings.color_threshold_days).toBe(30);
    expect(settings.zone_cycles).toEqual({});
    expect(settings.group_cycles).toEqual({});
  });

  it('custom settings persist after save and re-read', () => {
    const customSettings = {
      default_cycle_days: 45,
      color_threshold_days: 60,
      zone_cycles: { front_face_01: 14, front_chest_01: 21 },
      group_cycles: { '顔': 14 },
    };

    const result = api.StorageManager.saveSettings(customSettings);
    expect(result.success).toBe(true);

    // Re-read
    const loaded = api.StorageManager.getSettings();
    expect(loaded.default_cycle_days).toBe(45);
    expect(loaded.color_threshold_days).toBe(60);
    expect(loaded.zone_cycles.front_face_01).toBe(14);
    expect(loaded.zone_cycles.front_chest_01).toBe(21);
    expect(loaded.group_cycles['顔']).toBe(14);
  });

  it('overdue zones calculation respects custom cycle settings', () => {
    // Set custom cycle for front_face_01 to 10 days
    api.StorageManager.saveSettings({
      default_cycle_days: 30,
      color_threshold_days: 30,
      zone_cycles: { front_face_01: 10 },
      group_cycles: {},
    });

    // Add a record 15 days ago for front_face_01 (overdue with 10-day cycle)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const dateStr = fifteenDaysAgo.toISOString().slice(0, 10);

    api.StorageManager.saveRecord({
      id: 'overdue-test-1',
      zone_id: 'front_face_01',
      date: dateStr,
      intensity: 3,
      memo: null,
      photo: null,
      created_at: fifteenDaysAgo.toISOString(),
    });

    // Add a record 15 days ago for front_chest_01 (NOT overdue with 30-day default)
    api.StorageManager.saveRecord({
      id: 'overdue-test-2',
      zone_id: 'front_chest_01',
      date: dateStr,
      intensity: 3,
      memo: null,
      photo: null,
      created_at: fifteenDaysAgo.toISOString(),
    });

    const settings = api.StorageManager.getSettings();
    const records = api.StorageManager.getRecords();
    const allZones = [...BODY_MAP_DATA_STUB.front, ...BODY_MAP_DATA_STUB.back];

    const overdueZones = api.getOverdueZones(allZones, records, settings);

    // front_face_01 should be overdue (15 days > 10 day cycle)
    const faceOverdue = overdueZones.find(z => z.zone.id === 'front_face_01');
    expect(faceOverdue).toBeDefined();
    expect(faceOverdue.overdueDays).toBeGreaterThan(0);

    // front_chest_01 should NOT be overdue (15 days < 30 day default cycle)
    const chestOverdue = overdueZones.find(z => z.zone.id === 'front_chest_01');
    expect(chestOverdue).toBeUndefined();
  });

  it('group cycle setting is respected when zone-specific is not set', () => {
    // Set group cycle for '顔' to 10 days, no zone-specific override
    api.StorageManager.saveSettings({
      default_cycle_days: 30,
      color_threshold_days: 30,
      zone_cycles: {},
      group_cycles: { '顔': 10 },
    });

    // Add a record 15 days ago for front_face_02 (group=顔, should be overdue)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const dateStr = fifteenDaysAgo.toISOString().slice(0, 10);

    api.StorageManager.saveRecord({
      id: 'grp-test-1',
      zone_id: 'front_face_02',
      date: dateStr,
      intensity: 2,
      memo: null,
      photo: null,
      created_at: fifteenDaysAgo.toISOString(),
    });

    const settings = api.StorageManager.getSettings();
    const records = api.StorageManager.getRecords();
    const allZones = [...BODY_MAP_DATA_STUB.front, ...BODY_MAP_DATA_STUB.back];

    const overdueZones = api.getOverdueZones(allZones, records, settings);

    // front_face_02 (group=顔) should be overdue (15 > 10)
    const faceOverdue = overdueZones.find(z => z.zone.id === 'front_face_02');
    expect(faceOverdue).toBeDefined();
  });
});
