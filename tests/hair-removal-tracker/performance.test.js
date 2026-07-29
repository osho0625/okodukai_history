/**
 * Task 14.1: Body_Map初期ロードパフォーマンスを確認・最適化する
 * Task 14.2: タブ切替パフォーマンスを確認・最適化する
 * 
 * 14.1: 200ゾーン以上のSVG描画が2秒以内に完了することを検証する。
 * 14.2: 5,000レコード・200ゾーンでのタブ切替500ms以内を検証する。
 * 
 * **Validates: Requirements 9.7, 9.9, 9.10**
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

let BodyMapRenderer;
let window;

beforeAll(async () => {
  // Set up jsdom environment
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  });
  window = dom.window;

  // Define BODY_MAP_DATA stub (empty initially, tests will provide their own zones)
  window.BODY_MAP_DATA = { front: [], back: [] };

  // Execute the module in jsdom
  const fs = await import('fs');
  const path = await import('path');
  const scriptPath = path.resolve('js/hair-removal-tracker.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = scriptContent;
  window.document.body.appendChild(scriptEl);

  // Get exported BodyMapRenderer
  BodyMapRenderer = window._HairRemovalTracker.BodyMapRenderer;
});

/**
 * Generate N mock zones with valid SVG path data
 */
function generateMockZones(count) {
  var zones = [];
  for (var i = 0; i < count; i++) {
    var x = 50 + (i % 20) * 15;
    var y = 10 + Math.floor(i / 20) * 30;
    zones.push({
      id: 'perf_zone_' + i,
      name: 'テストゾーン' + i,
      svgPath: 'M' + x + ',' + y + ' L' + (x + 12) + ',' + y + ' L' + (x + 12) + ',' + (y + 25) + ' L' + x + ',' + (y + 25) + ' Z',
      side: 'front',
      group: 'テスト'
    });
  }
  return zones;
}

describe('Body Map Performance - Requirement 9.7', () => {
  it('should render 200+ zones within 2000ms', () => {
    // Generate 210 mock zones (exceeds the 200 threshold)
    var mockZones = generateMockZones(210);

    // Ensure BodyMapRenderer is initialized
    BodyMapRenderer.init('body-map-container', 'front');

    // Measure render time
    var start = Date.now();
    BodyMapRenderer.render(mockZones, null);
    var elapsed = Date.now() - start;

    // Assert rendering completed within 2 seconds
    expect(elapsed).toBeLessThan(2000);

    // Verify all zones were actually rendered
    var svg = window.document.querySelector('#body-map-container svg');
    var paths = svg.querySelectorAll('path[data-zone-id]');
    expect(paths.length).toBe(210);
  });

  it('should render 200+ zones with color map within 2000ms', () => {
    var mockZones = generateMockZones(210);
    var colorMap = {};
    for (var i = 0; i < mockZones.length; i++) {
      colorMap[mockZones[i].id] = 'hsl(' + (i % 120) + ', 60%, 50%)';
    }

    BodyMapRenderer.init('body-map-container', 'front');

    var start = Date.now();
    BodyMapRenderer.render(mockZones, colorMap);
    var elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);

    // Verify colors were applied
    var svg = window.document.querySelector('#body-map-container svg');
    var firstPath = svg.querySelector('path[data-zone-id="perf_zone_0"]');
    expect(firstPath.getAttribute('fill')).toBe('hsl(0, 60%, 50%)');
  });

  it('should complete full init + render cycle within 2000ms', () => {
    // Set BODY_MAP_DATA to 210 zones for init's _renderCurrentSide
    var mockZones = generateMockZones(210);
    window.BODY_MAP_DATA = { front: mockZones, back: [] };

    var start = Date.now();
    BodyMapRenderer.init('body-map-container', 'front');
    var elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);

    // Verify zones rendered
    var svg = window.document.querySelector('#body-map-container svg');
    var paths = svg.querySelectorAll('path[data-zone-id]');
    expect(paths.length).toBe(210);

    // Reset BODY_MAP_DATA
    window.BODY_MAP_DATA = { front: [], back: [] };
  });
});


// =========================================================================
// Task 14.2: タブ切替パフォーマンス (5,000レコード・200ゾーン)
// Validates: Requirements 9.9, 9.10
// =========================================================================

describe('Tab Switching Performance - Requirements 9.9, 9.10', () => {
  let tabWindow;
  let HairRemovalTracker;

  /**
   * Generate 200+ mock zones spread across multiple groups
   */
  function generateMockZones(count) {
    const groups = ['頭部', '顔', '首', '胸', '腹', '左腕', '右腕', '左手', '右手', '左脚', '右脚', '左足', '右足', '背中上部', '背中下部', '臀部'];
    const zones = [];
    for (let i = 0; i < count; i++) {
      const x = 50 + (i % 20) * 15;
      const y = 10 + Math.floor(i / 20) * 30;
      zones.push({
        id: 'perf_tab_zone_' + i,
        name: 'テストゾーン' + i,
        svgPath: 'M' + x + ',' + y + ' L' + (x + 12) + ',' + y + ' L' + (x + 12) + ',' + (y + 25) + ' L' + x + ',' + (y + 25) + ' Z',
        side: i < count / 2 ? 'front' : 'back',
        group: groups[i % groups.length]
      });
    }
    return zones;
  }

  /**
   * Generate 5,000 mock records spread across zones and various dates
   */
  function generateMockRecords(count, zones) {
    const records = [];
    const baseDate = new Date('2024-01-01');
    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor(i / 10); // spread over ~500 days
      const date = new Date(baseDate.getTime() + dayOffset * 86400000);
      const zoneIndex = i % zones.length;
      records.push({
        id: 'perf_record_' + i,
        zone_id: zones[zoneIndex].id,
        date: date.toISOString().split('T')[0],
        intensity: (i % 5) + 1,
        memo: i % 10 === 0 ? 'テストメモ' + i : null,
        photo: null,
        created_at: date.toISOString()
      });
    }
    return records;
  }

  beforeAll(async () => {
    // Set up jsdom with full tab structure
    const html = `<!DOCTYPE html><html><body>
      <div class="tab-bar">
        <button class="active" data-tab="map">マップ</button>
        <button data-tab="history">履歴</button>
        <button data-tab="stats">統計</button>
        <button data-tab="settings">設定</button>
      </div>
      <div id="tab-map" class="tab-content active">
        <div id="body-map-container"></div>
        <div id="body-map-tooltip"></div>
        <div id="overdue-list"></div>
        <div id="summary-dashboard"></div>
        <button id="side-toggle-btn" data-side="front">前面 / 背面</button>
      </div>
      <div id="tab-history" class="tab-content"></div>
      <div id="tab-stats" class="tab-content"></div>
      <div id="tab-settings" class="tab-content"></div>
      <div id="treatment-modal" class="modal">
        <div id="modal-zone-name"></div>
        <input id="modal-date" type="date">
        <div id="modal-intensity"></div>
        <textarea id="modal-memo"></textarea>
        <button id="modal-confirm">確定</button>
        <button id="modal-cancel">キャンセル</button>
        <input id="modal-photo-input" type="file">
        <button id="modal-photo-btn">写真</button>
        <div id="modal-photo-preview"><img id="modal-photo-thumb"></div>
        <button id="modal-photo-remove">削除</button>
      </div>
      <div id="toast-container"></div>
      <div id="confirm-dialog" class="modal"></div>
      <div id="import-mode-dialog" class="modal"></div>
      <div id="photo-viewer-modal" class="modal"></div>
      <button id="multi-select-deselect" style="display:none">選択解除</button>
      <button id="multi-select-confirm" style="display:none">まとめて記録</button>
      <div id="multi-select-count" style="display:none"></div>
    </body></html>`;

    const dom = new JSDOM(html, {
      url: 'http://localhost/pages/hair-removal-tracker.html#map',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
    });
    tabWindow = dom.window;

    // Generate 200 zones
    const mockZones = generateMockZones(200);
    const frontZones = mockZones.filter(z => z.side === 'front');
    const backZones = mockZones.filter(z => z.side === 'back');

    tabWindow.BODY_MAP_DATA = { front: frontZones, back: backZones };
    tabWindow.BODY_GROUPS = ['頭部', '顔', '首', '胸', '腹', '左腕', '右腕', '左手', '右手', '左脚', '右脚', '左足', '右足', '背中上部', '背中下部', '臀部'];

    // Generate and store 5,000 records
    const mockRecords = generateMockRecords(5000, mockZones);
    tabWindow.localStorage.setItem('hair_removal_records', JSON.stringify(mockRecords));
    tabWindow.localStorage.setItem('hair_removal_settings', JSON.stringify({
      default_cycle_days: 30,
      color_threshold_days: 30,
      zone_cycles: {},
      group_cycles: {}
    }));

    // Load the main script
    const fs = await import('fs');
    const path = await import('path');
    const scriptPath = path.resolve('js/hair-removal-tracker.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    const scriptEl = tabWindow.document.createElement('script');
    scriptEl.textContent = scriptContent;
    tabWindow.document.body.appendChild(scriptEl);

    HairRemovalTracker = tabWindow._HairRemovalTracker;
  });

  it('renderHistoryTab with 5,000 records completes within 500ms', () => {
    const start = performance.now();
    HairRemovalTracker.renderHistoryTab();
    const elapsed = performance.now() - start;

    console.log(`[Performance] renderHistoryTab with 5000 records: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(500);

    // Verify records were actually rendered
    const container = tabWindow.document.getElementById('tab-history');
    expect(container.innerHTML).toContain('history-item');
  });

  it('renderStatsTab with 5,000 records completes within 500ms', () => {
    // Invalidate cache first to measure full computation + render
    HairRemovalTracker.invalidateStatsCache();

    const start = performance.now();
    HairRemovalTracker.renderStatsTab();
    const elapsed = performance.now() - start;

    console.log(`[Performance] renderStatsTab (cache miss) with 5000 records: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(500);

    // Verify stats were actually rendered
    const container = tabWindow.document.getElementById('tab-stats');
    expect(container.innerHTML).toContain('stats-section');
  });

  it('renderSettingsTab completes within 500ms', () => {
    const start = performance.now();
    HairRemovalTracker.renderSettingsTab();
    const elapsed = performance.now() - start;

    console.log(`[Performance] renderSettingsTab: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(500);

    // Verify settings were rendered
    const container = tabWindow.document.getElementById('tab-settings');
    expect(container.innerHTML).toContain('settings-section');
  });

  it('stats cache hit: second renderStatsTab call also completes within 500ms', () => {
    // First call (cache miss) - populates the cache
    HairRemovalTracker.invalidateStatsCache();
    HairRemovalTracker.renderStatsTab();

    // Second call (cache hit) - stats computation is skipped
    const start = performance.now();
    HairRemovalTracker.renderStatsTab();
    const elapsed = performance.now() - start;

    console.log(`[Performance] Stats cache hit render: ${elapsed.toFixed(2)}ms`);

    // Cache hit render should still be under 500ms
    expect(elapsed).toBeLessThan(500);
  });

  it('switchTab to all tabs completes within 500ms each', () => {
    const tabs = ['history', 'stats', 'settings', 'map'];

    // Invalidate stats cache to test worst-case for stats tab
    HairRemovalTracker.invalidateStatsCache();

    for (const tabName of tabs) {
      const start = performance.now();
      HairRemovalTracker.switchTab(tabName);
      const elapsed = performance.now() - start;

      console.log(`[Performance] switchTab('${tabName}'): ${elapsed.toFixed(2)}ms`);
      expect(elapsed).toBeLessThan(500);
    }
  });
});
