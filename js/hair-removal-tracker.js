/**
 * 脱毛周期管理アプリ (Hair Removal Tracker)
 * メインアプリケーションロジック
 */
(function() {
  'use strict';

  // タブとハッシュの対応
  const TAB_HASH_MAP = {
    'map': '#map',
    'history': '#history',
    'stats': '#stats',
    'settings': '#settings'
  };

  const HASH_TAB_MAP = {
    '#map': 'map',
    '#history': 'history',
    '#stats': 'stats',
    '#settings': 'settings'
  };

  // =========================================================
  // Color Calculator - ヒートマップ色計算（純粋関数）
  // =========================================================

  /**
   * 経過日数と閾値日数からHSLヒートマップ色を計算する
   * @param {number} elapsedDays - 最終施術からの経過日数
   * @param {number} thresholdDays - 色変化の閾値日数
   * @returns {string} HSL色文字列
   */
  function calculateHeatColor(elapsedDays, thresholdDays) {
    // 未施術（null/undefined）の場合はグレー - この関数は呼び出し元で判定
    if (elapsedDays <= 0) {
      return 'hsl(120, 60%, 50%)';
    }
    if (!thresholdDays || thresholdDays <= 0 || elapsedDays >= thresholdDays) {
      return 'hsl(0, 60%, 50%)';
    }
    // 線形補間: hue = 120 * (1 - elapsedDays / thresholdDays)
    var hue = Math.round(120 * (1 - elapsedDays / thresholdDays));
    // clamp to [0, 120]
    hue = Math.max(0, Math.min(120, hue));
    return 'hsl(' + hue + ', 60%, 50%)';
  }

  /**
   * 全ゾーンの色マップを生成する
   * @param {Array} zones - Body_Zone配列
   * @param {Array} records - Treatment_Record配列
   * @param {number} thresholdDays - 色変化の閾値日数
   * @returns {Object} {zoneId: hslColorString}
   */
  function buildColorMap(zones, records, thresholdDays) {
    var colorMap = {};
    var now = Date.now();

    // ゾーンごとの最新レコードを見つけるためにrecordsをzoneIdでグループ化
    var latestByZone = {};
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      if (!latestByZone[rec.zone_id] || rec.date > latestByZone[rec.zone_id]) {
        latestByZone[rec.zone_id] = rec.date;
      }
    }

    for (var j = 0; j < zones.length; j++) {
      var zone = zones[j];
      var lastDate = latestByZone[zone.id];
      if (!lastDate) {
        // 記録なし → グレー
        colorMap[zone.id] = 'hsl(0, 0%, 80%)';
      } else {
        var elapsed = Math.floor((now - Date.parse(lastDate)) / 86400000);
        colorMap[zone.id] = calculateHeatColor(elapsed, thresholdDays);
      }
    }

    return colorMap;
  }

  /**
   * 周期超過判定
   * @param {number} elapsedDays - 経過日数
   * @param {number} cyclePeriod - 周期日数
   * @returns {boolean} 超過していればtrue
   */
  function isOverdue(elapsedDays, cyclePeriod) {
    return elapsedDays > cyclePeriod;
  }

  // =========================================================
  // Storage Manager - localStorage永続化管理
  // =========================================================

  var STORAGE_KEYS = {
    RECORDS: 'hair_removal_records',
    SETTINGS: 'hair_removal_settings'
  };

  var DEFAULT_SETTINGS = {
    default_cycle_days: 30,
    color_threshold_days: 30,
    zone_cycles: {},
    group_cycles: {}
  };

  /**
   * localStorage書き込みのラッパー（QuotaExceededError対策）
   * @param {string} key - localStorageキー
   * @param {*} data - 保存するデータ
   * @returns {{ success: boolean, error?: string }}
   */
  function safeSave(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        return { success: false, error: 'ストレージ容量が不足しています' };
      }
      throw e;
    }
  }

  var StorageManager = {
    /**
     * 全レコードを取得する
     * @returns {Array} TreatmentRecord配列
     */
    getRecords: function() {
      try {
        var stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        // パースエラー時は空配列を返す
      }
      return [];
    },

    /**
     * レコードを保存する（既存レコード配列に追加）
     * @param {Object} record - TreatmentRecordオブジェクト
     * @returns {{ success: boolean, error?: string }}
     */
    saveRecord: function(record) {
      var records = this.getRecords();
      records.push(record);
      invalidateStatsCache();
      return safeSave(STORAGE_KEYS.RECORDS, records);
    },

    /**
     * レコードをIDで削除する
     * @param {string} id - レコードID
     * @returns {{ success: boolean, error?: string }}
     */
    deleteRecord: function(id) {
      var records = this.getRecords();
      var filtered = records.filter(function(r) { return r.id !== id; });
      invalidateStatsCache();
      return safeSave(STORAGE_KEYS.RECORDS, filtered);
    },

    /**
     * 指定ゾーンIDのレコードを取得する
     * @param {string} zoneId - Body_ZoneのID
     * @returns {Array} TreatmentRecord配列
     */
    getRecordsByZone: function(zoneId) {
      var records = this.getRecords();
      return records.filter(function(r) { return r.zone_id === zoneId; });
    },

    /**
     * 指定日付範囲内のレコードを取得する（inclusive）
     * @param {string} start - 開始日 "YYYY-MM-DD"
     * @param {string} end - 終了日 "YYYY-MM-DD"
     * @returns {Array} TreatmentRecord配列
     */
    getRecordsByDateRange: function(start, end) {
      var records = this.getRecords();
      return records.filter(function(r) {
        return r.date >= start && r.date <= end;
      });
    },

    /**
     * 設定を取得する（未設定時はデフォルト値を返す）
     * @returns {Object} Settingsオブジェクト
     */
    getSettings: function() {
      try {
        var stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
          var parsed = JSON.parse(stored);
          // デフォルト値でマージ（欠損フィールド補完）
          return {
            default_cycle_days: parsed.default_cycle_days !== undefined ? parsed.default_cycle_days : DEFAULT_SETTINGS.default_cycle_days,
            color_threshold_days: parsed.color_threshold_days !== undefined ? parsed.color_threshold_days : DEFAULT_SETTINGS.color_threshold_days,
            zone_cycles: parsed.zone_cycles || DEFAULT_SETTINGS.zone_cycles,
            group_cycles: parsed.group_cycles || DEFAULT_SETTINGS.group_cycles
          };
        }
      } catch (e) {
        // パースエラー時はデフォルトを返す
      }
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    },

    /**
     * 設定を保存する
     * @param {Object} settings - Settingsオブジェクト
     * @returns {{ success: boolean, error?: string }}
     */
    saveSettings: function(settings) {
      return safeSave(STORAGE_KEYS.SETTINGS, settings);
    },

    /**
     * 全データ（records + settings）をJSON文字列としてエクスポートする
     * @returns {string} JSON文字列
     */
    exportAll: function() {
      var data = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        records: this.getRecords(),
        settings: this.getSettings()
      };
      return JSON.stringify(data, null, 2);
    },

    /**
     * インポートデータのバリデーションを行う
     * @param {string} json - JSON文字列
     * @returns {{ valid: boolean, records?: Array, errors?: string[] }}
     */
    validateImportData: function(json) {
      var parsed;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        return { valid: false, errors: ['JSONの形式が正しくありません'] };
      }

      // レコード配列を抽出（エクスポート形式 or 生配列）
      var records;
      if (parsed && Array.isArray(parsed.records)) {
        records = parsed.records;
      } else if (Array.isArray(parsed)) {
        records = parsed;
      } else {
        return { valid: false, errors: ['データ形式が正しくありません。records配列またはレコード配列が必要です'] };
      }

      var errors = [];
      var datePattern = /^\d{4}-\d{2}-\d{2}$/;

      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var prefix = 'レコード[' + i + ']: ';

        if (!record || typeof record !== 'object') {
          errors.push(prefix + 'オブジェクトではありません');
          continue;
        }

        // id検証
        if (typeof record.id !== 'string' || record.id === '') {
          errors.push(prefix + 'idが不正です（文字列で必須）');
        }

        // zone_id検証
        if (typeof record.zone_id !== 'string' || record.zone_id === '') {
          errors.push(prefix + 'zone_idが不正です（文字列で必須）');
        }

        // date検証
        if (typeof record.date !== 'string' || !datePattern.test(record.date)) {
          errors.push(prefix + 'dateが不正です（YYYY-MM-DD形式で必須）');
        }

        // intensity検証
        if (typeof record.intensity !== 'number' || record.intensity < 1 || record.intensity > 5 || Math.floor(record.intensity) !== record.intensity) {
          errors.push(prefix + 'intensityが不正です（1-5の整数で必須）');
        }

        // created_at検証
        if (typeof record.created_at !== 'string' || record.created_at === '') {
          errors.push(prefix + 'created_atが不正です（文字列で必須）');
        }
      }

      if (errors.length > 0) {
        return { valid: false, errors: errors };
      }

      return { valid: true, records: records };
    },

    /**
     * 既存レコードとインポートレコードをマージする（純粋関数）
     * - Map<id>でO(n+m)マージ
     * - 同一idはcreated_at比較で新しい方（後のISO文字列）を採用
     * - ユニークidは全件残る
     * @param {Array} existing - 既存TreatmentRecord配列
     * @param {Array} imported - インポートTreatmentRecord配列
     * @returns {Array} マージ済みTreatmentRecord配列（重複idなし）
     */
    mergeRecords: function(existing, imported) {
      return mergeRecords(existing, imported);
    },

    /**
     * 全データをリセットする（records + settings を削除）
     */
    resetAll: function() {
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    },

    /**
     * データをインポートする
     * @param {string} json - JSON文字列
     * @param {'merge'|'replace'} mode - マージ or 置換
     * @returns {{ success: boolean, error?: string, count?: number }}
     */
    importData: function(json, mode) {
      var validation = this.validateImportData(json);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }

      var importedRecords = validation.records;

      if (mode === 'merge') {
        var existing = this.getRecords();
        var merged = mergeRecords(existing, importedRecords);
        var result = safeSave(STORAGE_KEYS.RECORDS, merged);
        if (!result.success) {
          return { success: false, error: result.error || 'ストレージ保存に失敗しました' };
        }
        invalidateStatsCache();
        return { success: true, count: merged.length };
      } else if (mode === 'replace') {
        var result2 = safeSave(STORAGE_KEYS.RECORDS, importedRecords);
        if (!result2.success) {
          return { success: false, error: result2.error || 'ストレージ保存に失敗しました' };
        }
        invalidateStatsCache();
        return { success: true, count: importedRecords.length };
      } else {
        return { success: false, error: '不正なモードです: ' + mode };
      }
    },

    /**
     * 写真ストレージの使用量（バイト数）を計算する
     * 全レコードのphotoフィールドのbase64サイズ合計を返す
     * @returns {number} バイト数
     */
    getPhotoStorageUsage: function() {
      var records = this.getRecords();
      var totalBytes = 0;
      for (var i = 0; i < records.length; i++) {
        if (records[i].photo) {
          totalBytes += PhotoCompressor.getBase64Size(records[i].photo);
        }
      }
      return totalBytes;
    }
  };

  /**
   * 2つのレコード配列をマージする純粋関数
   * - Map<id>でO(n+m)マージ
   * - 同一idはcreated_at比較で新しい方（後のISO文字列）を採用
   * - ユニークidは全件残る
   * @param {Array} existing - 既存TreatmentRecord配列
   * @param {Array} imported - インポートTreatmentRecord配列
   * @returns {Array} マージ済みTreatmentRecord配列（重複idなし）
   */
  function mergeRecords(existing, imported) {
    var map = new Map();

    // 既存レコードをMapに登録
    for (var i = 0; i < existing.length; i++) {
      map.set(existing[i].id, existing[i]);
    }

    // インポートレコードを処理: 同一idならcreated_at比較
    for (var j = 0; j < imported.length; j++) {
      var importedRecord = imported[j];
      var existingRecord = map.get(importedRecord.id);

      if (existingRecord) {
        // 同一id: created_atが新しい方を採用
        if (importedRecord.created_at > existingRecord.created_at) {
          map.set(importedRecord.id, importedRecord);
        }
      } else {
        // ユニークid: そのまま追加
        map.set(importedRecord.id, importedRecord);
      }
    }

    // Mapの値を配列として返す
    var result = [];
    map.forEach(function(record) {
      result.push(record);
    });
    return result;
  }

  // =========================================================
  // Export - データエクスポート
  // =========================================================

  /**
   * JSON文字列をファイルとしてダウンロードする
   * @param {string} jsonString - ダウンロードするJSON文字列
   * @param {string} filename - ファイル名
   */
  function downloadJSON(jsonString, filename) {
    var blob = new Blob([jsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * エクスポートを実行する（ボタンクリック時に呼ばれる）
   */
  function handleExport() {
    var jsonString = StorageManager.exportAll();
    var today = getTodayString();
    var filename = 'hair-removal-backup-' + today + '.json';
    downloadJSON(jsonString, filename);
    showToast('データをエクスポートしました', 'success');
  }

  // =========================================================
  // Import - データインポート
  // =========================================================

  /**
   * インポートモーダルを表示する
   * @param {Function} onSelect - 選択結果コールバック('merge' | 'replace' | null)
   */
  function showImportModeDialog(onSelect) {
    // モーダルオーバーレイ作成
    var overlay = document.createElement('div');
    overlay.className = 'import-modal-overlay show';
    overlay.id = 'import-mode-dialog';

    var content = document.createElement('div');
    content.className = 'import-modal-content';

    content.innerHTML =
      '<div class="import-modal-header">' +
        '<h3>インポート方法を選択</h3>' +
      '</div>' +
      '<div class="import-modal-body">' +
        '<p>データのインポート方法を選択してください。</p>' +
        '<button id="import-mode-merge" class="import-mode-btn import-mode-merge">' +
          '<span class="import-mode-icon">🔀</span>' +
          '<span class="import-mode-label">マージ</span>' +
          '<span class="import-mode-desc">既存データを保持し、インポートデータを統合</span>' +
        '</button>' +
        '<button id="import-mode-replace" class="import-mode-btn import-mode-replace">' +
          '<span class="import-mode-icon">🔄</span>' +
          '<span class="import-mode-label">置換</span>' +
          '<span class="import-mode-desc">既存データを削除し、インポートデータで上書き</span>' +
        '</button>' +
      '</div>' +
      '<div class="import-modal-footer">' +
        '<button id="import-mode-cancel" class="import-mode-cancel-btn">キャンセル</button>' +
      '</div>';

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // イベントリスナー
    document.getElementById('import-mode-merge').addEventListener('click', function() {
      closeImportModeDialog();
      onSelect('merge');
    });
    document.getElementById('import-mode-replace').addEventListener('click', function() {
      closeImportModeDialog();
      onSelect('replace');
    });
    document.getElementById('import-mode-cancel').addEventListener('click', function() {
      closeImportModeDialog();
      onSelect(null);
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeImportModeDialog();
        onSelect(null);
      }
    });
  }

  /**
   * インポートモーダルを閉じる
   */
  function closeImportModeDialog() {
    var dialog = document.getElementById('import-mode-dialog');
    if (dialog) {
      dialog.parentNode.removeChild(dialog);
    }
  }

  /**
   * インポートを実行する（ボタンクリック時に呼ばれる）
   * ファイル選択 → バリデーション → マージ/置換選択 → 適用
   */
  function handleImport() {
    var fileInput = document.getElementById('import-file-input');
    if (!fileInput) {
      // hidden file inputを動的に作成
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'import-file-input';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    // ファイル選択イベント
    fileInput.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function(ev) {
        var json = ev.target.result;

        // バリデーション
        var validation = StorageManager.validateImportData(json);
        if (!validation.valid) {
          showToast(validation.errors[0], 'error');
          fileInput.value = '';
          return;
        }

        // マージ/置換選択ダイアログを表示
        showImportModeDialog(function(mode) {
          if (!mode) {
            // キャンセル
            fileInput.value = '';
            return;
          }

          var result = StorageManager.importData(json, mode);
          if (result.success) {
            invalidateStatsCache();
            refreshColors();
            showToast(result.count + '件のデータをインポートしました', 'success');
          } else {
            showToast(result.error || 'インポートに失敗しました', 'error');
          }
          fileInput.value = '';
        });
      };

      reader.onerror = function() {
        showToast('ファイルを読み込めませんでした', 'error');
        fileInput.value = '';
      };

      reader.readAsText(file);
    };

    // ファイル選択ダイアログを開く
    fileInput.value = '';
    fileInput.click();
  }

  // =========================================================
  // Reset - データリセット
  // =========================================================

  /**
   * データリセットを実行する
   * 確認ダイアログ表示後、全データを削除してBody Mapをリフレッシュする
   */
  function handleReset() {
    var confirmed = confirm('本当にすべてのデータを削除しますか？\nこの操作は元に戻せません。');
    if (!confirmed) {
      return;
    }
    StorageManager.resetAll();
    invalidateStatsCache();
    refreshColors();
    showToast('すべてのデータを削除しました', 'success');
  }

  // =========================================================
  // Filter / Sort - フィルタ・ソート純粋関数
  // =========================================================

  /**
   * レコードを日付順でソートする（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @param {string} order - 'desc' or 'asc'
   * @returns {Array} ソート済みの新しい配列
   */
  function sortRecordsByDate(records, order) {
    order = order || 'desc';
    var sorted = records.slice();
    sorted.sort(function(a, b) {
      if (a.date < b.date) return order === 'desc' ? 1 : -1;
      if (a.date > b.date) return order === 'desc' ? -1 : 1;
      return 0;
    });
    return sorted;
  }

  /**
   * ゾーンIDでレコードをフィルタする（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @param {string} zoneId - フィルタするゾーンID
   * @returns {Array} マッチするレコードの新しい配列
   */
  function filterByZone(records, zoneId) {
    return records.filter(function(r) {
      return r.zone_id === zoneId;
    });
  }

  /**
   * 日付範囲でレコードをフィルタする（純粋関数、inclusive）
   * @param {Array} records - TreatmentRecord配列
   * @param {string} startDate - 開始日 "YYYY-MM-DD"
   * @param {string} endDate - 終了日 "YYYY-MM-DD"
   * @returns {Array} 範囲内レコードの新しい配列
   */
  function filterByDateRange(records, startDate, endDate) {
    return records.filter(function(r) {
      return r.date >= startDate && r.date <= endDate;
    });
  }

  /**
   * 要施術ゾーンリストを生成する（純粋関数）
   * 各ゾーンについて最終施術日からの経過日数が周期を超えている場合に含める
   * @param {Array} zones - Body_Zone配列 [{id, name, group}]
   * @param {Array} records - TreatmentRecord配列
   * @param {Object} settings - Settings {default_cycle_days, zone_cycles, group_cycles}
   * @returns {Array} [{zone, overdueDays, nextDate}] overdueDays降順ソート
   */
  function getOverdueZones(zones, records, settings) {
    var now = Date.now();
    var result = [];

    // ゾーンごとの最新施術日を計算
    var latestByZone = {};
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      if (!latestByZone[rec.zone_id] || rec.date > latestByZone[rec.zone_id]) {
        latestByZone[rec.zone_id] = rec.date;
      }
    }

    for (var j = 0; j < zones.length; j++) {
      var zone = zones[j];
      var lastDate = latestByZone[zone.id];
      if (!lastDate) continue; // 施術記録なしはスキップ

      var elapsed = Math.floor((now - Date.parse(lastDate)) / 86400000);

      // 周期決定: zone_cycles > group_cycles > default_cycle_days
      var cycleDays = settings.default_cycle_days || 30;
      if (settings.group_cycles && settings.group_cycles[zone.group]) {
        cycleDays = settings.group_cycles[zone.group];
      }
      if (settings.zone_cycles && settings.zone_cycles[zone.id]) {
        cycleDays = settings.zone_cycles[zone.id];
      }

      if (elapsed > cycleDays) {
        var overdueDays = elapsed - cycleDays;
        var nextDate = getNextTreatmentDate(lastDate, cycleDays);
        result.push({ zone: zone, overdueDays: overdueDays, nextDate: nextDate });
      }
    }

    // overdueDays降順ソート
    result.sort(function(a, b) { return b.overdueDays - a.overdueDays; });
    return result;
  }

  /**
   * 次回施術推奨日を計算する（純粋関数）
   * @param {string} lastDate - 最終施術日 "YYYY-MM-DD"
   * @param {number} cycleDays - 周期日数
   * @returns {string} 次回施術日 "YYYY-MM-DD"
   */
  function getNextTreatmentDate(lastDate, cycleDays) {
    var d = new Date(Date.parse(lastDate));
    d.setDate(d.getDate() + cycleDays);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  /**
   * ゾーンの施術回数を返す（純粋関数）
   * @param {Array} records - 対象ゾーンのTreatmentRecord配列
   * @returns {number} レコード数
   */
  function getZoneTreatmentCount(records) {
    return records.length;
  }

  /**
   * ゾーンの平均施術間隔（日数）を計算する（純粋関数）
   * 連続する日付差分の平均を返す。レコードが1件以下の場合はnullを返す。
   * @param {Array} records - 対象ゾーンのTreatmentRecord配列（ソート不問、内部でasc sort）
   * @returns {number|null} 平均間隔（日数）、またはnull
   */
  function getZoneAverageInterval(records) {
    if (records.length <= 1) return null;
    // 日付昇順ソート
    var sorted = records.slice().sort(function(a, b) {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
    var totalDays = 0;
    for (var i = 1; i < sorted.length; i++) {
      var diff = (Date.parse(sorted[i].date) - Date.parse(sorted[i - 1].date)) / 86400000;
      totalDays += diff;
    }
    return totalDays / (sorted.length - 1);
  }

  // =========================================================
  // Statistics Engine - 統計計算純粋関数
  // =========================================================

  /**
   * 月別施術数を集計する（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @returns {Map<string, number>} yearMonth ("YYYY-MM") → 施術数
   */
  function getMonthlyStats(records) {
    var map = new Map();
    for (var i = 0; i < records.length; i++) {
      var date = records[i].date;
      var yearMonth = date.substring(0, 7); // "YYYY-MM"
      map.set(yearMonth, (map.get(yearMonth) || 0) + 1);
    }
    return map;
  }

  /**
   * 頻出ゾーンTop N を取得する（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @param {number} limit - 取得上限（デフォルト5）
   * @returns {Array<{zoneId: string, count: number}>} 施術回数降順
   */
  function getTopZones(records, limit) {
    if (typeof limit === 'undefined') limit = 5;
    var countMap = {};
    for (var i = 0; i < records.length; i++) {
      var zoneId = records[i].zone_id;
      countMap[zoneId] = (countMap[zoneId] || 0) + 1;
    }
    var entries = [];
    for (var key in countMap) {
      if (countMap.hasOwnProperty(key)) {
        entries.push({ zoneId: key, count: countMap[key] });
      }
    }
    entries.sort(function(a, b) {
      return b.count - a.count;
    });
    return entries.slice(0, limit);
  }

  /**
   * 全レコードの平均強度を計算する（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @returns {number} 平均強度（レコード0件の場合は0）
   */
  function getAverageIntensity(records) {
    if (records.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < records.length; i++) {
      sum += records[i].intensity;
    }
    return sum / records.length;
  }

  /**
   * カバー率を計算する（純粋関数）
   * treated zones / total zones * 100
   * @param {Array} records - TreatmentRecord配列
   * @param {number} totalZoneCount - 全ゾーン数
   * @returns {number} カバー率（%）
   */
  function getCoverageRate(records, totalZoneCount) {
    if (totalZoneCount === 0) return 0;
    var uniqueZones = {};
    for (var i = 0; i < records.length; i++) {
      uniqueZones[records[i].zone_id] = true;
    }
    var uniqueCount = Object.keys(uniqueZones).length;
    return (uniqueCount / totalZoneCount) * 100;
  }

  /**
   * 強度分布を集計する（純粋関数）
   * @param {Array} records - TreatmentRecord配列
   * @returns {Map<number, number>} intensity → count
   */
  function getIntensityDistribution(records) {
    var map = new Map();
    for (var i = 0; i < records.length; i++) {
      var intensity = records[i].intensity;
      map.set(intensity, (map.get(intensity) || 0) + 1);
    }
    return map;
  }

  // =========================================================
  // Statistics Tab - 統計タブ描画管理
  // =========================================================

  /** 統計キャッシュ - レコード変更時にnull化 */
  var _statsCache = null;

  /** 統計キャッシュを破棄する */
  function invalidateStatsCache() {
    _statsCache = null;
  }

  /**
   * 統計タブを描画する
   */
  function renderStatsTab() {
    var DEBUG_PERF = typeof window !== 'undefined' && window._HAIR_REMOVAL_DEBUG;
    if (DEBUG_PERF) console.time('[HairRemovalTracker] renderStatsTab total');

    var container = document.getElementById('tab-stats');
    if (!container) return;

    var records = StorageManager.getRecords();

    // レコードがない場合は空状態表示
    if (records.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="emoji">📊</div><div>統計データはまだありません</div></div>';
      if (DEBUG_PERF) console.timeEnd('[HairRemovalTracker] renderStatsTab total');
      return;
    }

    // キャッシュチェック
    if (!_statsCache) {
      if (DEBUG_PERF) console.time('[HairRemovalTracker] stats computation (cache miss)');
      var totalZoneCount = 0;
      if (typeof BODY_MAP_DATA !== 'undefined') {
        totalZoneCount = (BODY_MAP_DATA.front || []).length + (BODY_MAP_DATA.back || []).length;
      }
      _statsCache = {
        monthly: getMonthlyStats(records),
        topZones: getTopZones(records, 5),
        avgIntensity: getAverageIntensity(records),
        coverageRate: getCoverageRate(records, totalZoneCount),
        intensityDist: getIntensityDistribution(records)
      };
      if (DEBUG_PERF) console.timeEnd('[HairRemovalTracker] stats computation (cache miss)');
    } else {
      if (DEBUG_PERF) console.log('[HairRemovalTracker] stats cache hit');
    }

    var stats = _statsCache;
    var html = '<div class="stats-section">';

    // === 概要カード ===
    html += '<div class="stats-overview">';
    html += '<div class="stats-overview-grid">';
    html += '<div class="stats-overview-card">';
    html += '<div class="stats-overview-value">' + records.length + '</div>';
    html += '<div class="stats-overview-label">総施術数</div>';
    html += '</div>';
    html += '<div class="stats-overview-card">';
    html += '<div class="stats-overview-value">' + stats.avgIntensity.toFixed(1) + '</div>';
    html += '<div class="stats-overview-label">平均強度</div>';
    html += '</div>';
    html += '<div class="stats-overview-card">';
    html += '<div class="stats-overview-value">' + stats.coverageRate.toFixed(1) + '%</div>';
    html += '<div class="stats-overview-label">カバー率</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // === 月別施術数バーチャート (SVG) ===
    html += '<div class="stats-card">';
    html += '<div class="stats-card-title">📅 月別施術数</div>';
    html += buildMonthlyBarChartSVG(stats.monthly);
    html += '</div>';

    // === 強度分布チャート (SVG) ===
    html += '<div class="stats-card">';
    html += '<div class="stats-card-title">📊 強度分布</div>';
    html += buildIntensityDistChartSVG(stats.intensityDist);
    html += '</div>';

    // === 頻出ゾーンTop5 ===
    html += '<div class="stats-card">';
    html += '<div class="stats-card-title">🏆 頻出ゾーン Top 5</div>';
    html += buildTopZonesList(stats.topZones);
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
    if (DEBUG_PERF) console.timeEnd('[HairRemovalTracker] renderStatsTab total');
  }

  /**
   * 月別施術数のSVGバーチャートを生成する
   * @param {Map<string, number>} monthlyData - yearMonth → count
   * @returns {string} SVG HTML文字列
   */
  function buildMonthlyBarChartSVG(monthlyData) {
    if (!monthlyData || monthlyData.size === 0) {
      return '<div class="stats-no-data">データなし</div>';
    }

    // 月を時系列でソート（最新6ヶ月のみ表示）
    var entries = [];
    monthlyData.forEach(function(count, yearMonth) {
      entries.push({ yearMonth: yearMonth, count: count });
    });
    entries.sort(function(a, b) { return a.yearMonth.localeCompare(b.yearMonth); });
    // 最新6ヶ月に制限
    if (entries.length > 6) {
      entries = entries.slice(entries.length - 6);
    }

    var maxCount = 0;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].count > maxCount) maxCount = entries[i].count;
    }
    if (maxCount === 0) maxCount = 1;

    var chartWidth = 320;
    var chartHeight = 160;
    var barWidth = Math.floor((chartWidth - 40) / entries.length) - 8;
    var barMaxHeight = chartHeight - 40;

    var svg = '<svg class="stats-chart" viewBox="0 0 ' + chartWidth + ' ' + chartHeight + '" role="img" aria-label="月別施術数バーチャート">';

    // Y軸のガイドライン
    svg += '<line x1="35" y1="10" x2="35" y2="' + (chartHeight - 28) + '" stroke="#ddd" stroke-width="1"/>';

    for (var i = 0; i < entries.length; i++) {
      var barHeight = Math.round((entries[i].count / maxCount) * barMaxHeight);
      if (barHeight < 2) barHeight = 2;
      var x = 40 + i * (barWidth + 8);
      var y = chartHeight - 28 - barHeight;

      // バー
      svg += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" rx="3" fill="#7b1fa2" opacity="0.85"/>';

      // 数値ラベル
      svg += '<text x="' + (x + barWidth / 2) + '" y="' + (y - 4) + '" text-anchor="middle" class="stats-chart-value">' + entries[i].count + '</text>';

      // 月ラベル（"MM"のみ表示）
      var monthLabel = entries[i].yearMonth.substring(5); // "MM"
      svg += '<text x="' + (x + barWidth / 2) + '" y="' + (chartHeight - 8) + '" text-anchor="middle" class="stats-chart-label">' + monthLabel + '月</text>';
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * 強度分布のSVGバーチャートを生成する
   * @param {Map<number, number>} intensityDist - intensity → count
   * @returns {string} SVG HTML文字列
   */
  function buildIntensityDistChartSVG(intensityDist) {
    if (!intensityDist || intensityDist.size === 0) {
      return '<div class="stats-no-data">データなし</div>';
    }

    var chartWidth = 320;
    var chartHeight = 130;
    var barWidth = 40;
    var barMaxHeight = chartHeight - 40;

    // 最大値を取得
    var maxCount = 0;
    for (var lvl = 1; lvl <= 5; lvl++) {
      var c = intensityDist.get(lvl) || 0;
      if (c > maxCount) maxCount = c;
    }
    if (maxCount === 0) maxCount = 1;

    var svg = '<svg class="stats-chart" viewBox="0 0 ' + chartWidth + ' ' + chartHeight + '" role="img" aria-label="強度分布チャート">';

    var intensityColors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'];

    for (var lvl = 1; lvl <= 5; lvl++) {
      var count = intensityDist.get(lvl) || 0;
      var barHeight = Math.round((count / maxCount) * barMaxHeight);
      if (barHeight < 2 && count > 0) barHeight = 2;
      var x = 30 + (lvl - 1) * (barWidth + 16);
      var y = chartHeight - 28 - barHeight;

      // バー
      svg += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" rx="3" fill="' + intensityColors[lvl - 1] + '" opacity="0.85"/>';

      // 数値ラベル
      if (count > 0) {
        svg += '<text x="' + (x + barWidth / 2) + '" y="' + (y - 4) + '" text-anchor="middle" class="stats-chart-value">' + count + '</text>';
      }

      // 強度ラベル
      svg += '<text x="' + (x + barWidth / 2) + '" y="' + (chartHeight - 8) + '" text-anchor="middle" class="stats-chart-label">Lv.' + lvl + '</text>';
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * 頻出ゾーンTop5リストのHTMLを生成する
   * @param {Array<{zoneId: string, count: number}>} topZones
   * @returns {string} HTML文字列
   */
  function buildTopZonesList(topZones) {
    if (!topZones || topZones.length === 0) {
      return '<div class="stats-no-data">データなし</div>';
    }

    var maxCount = topZones[0].count;
    var html = '<div class="stats-top-zones">';
    for (var i = 0; i < topZones.length; i++) {
      var zoneName = getZoneNameById(topZones[i].zoneId);
      var count = topZones[i].count;
      var barWidth = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      var rank = i + 1;

      html += '<div class="stats-top-zone-item">';
      html += '<span class="stats-top-zone-rank">' + rank + '</span>';
      html += '<div class="stats-top-zone-info">';
      html += '<div class="stats-top-zone-name">' + zoneName + '</div>';
      html += '<div class="stats-top-zone-bar-wrap">';
      html += '<div class="stats-top-zone-bar" style="width:' + barWidth + '%"></div>';
      html += '</div>';
      html += '</div>';
      html += '<span class="stats-top-zone-count">' + count + '回</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // =========================================================
  // History Renderer - 履歴タブ描画管理
  // =========================================================

  /**
   * ゾーンIDからゾーン名を取得するヘルパー
   * @param {string} zoneId
   * @returns {string} ゾーン名（見つからない場合はzoneIdそのもの）
   */
  function getZoneNameById(zoneId) {
    if (typeof BODY_MAP_DATA === 'undefined') return zoneId;
    var sides = ['front', 'back'];
    for (var s = 0; s < sides.length; s++) {
      var zones = BODY_MAP_DATA[sides[s]] || [];
      for (var i = 0; i < zones.length; i++) {
        if (zones[i].id === zoneId) return zones[i].name;
      }
    }
    return zoneId;
  }

  /**
   * 全ゾーンリストを取得する（フィルタ用）
   * @returns {Array} [{id, name, group}]
   */
  function getAllZones() {
    if (typeof BODY_MAP_DATA === 'undefined') return [];
    var result = [];
    var sides = ['front', 'back'];
    for (var s = 0; s < sides.length; s++) {
      var zones = BODY_MAP_DATA[sides[s]] || [];
      for (var i = 0; i < zones.length; i++) {
        result.push({ id: zones[i].id, name: zones[i].name, group: zones[i].group });
      }
    }
    return result;
  }

  /**
   * 履歴タブを描画する
   */
  /** 履歴表示のページサイズ */
  var HISTORY_PAGE_SIZE = 100;
  /** 現在の履歴表示ページ */
  var _historyCurrentPage = 0;

  function renderHistoryTab() {
    var container = document.getElementById('tab-history');
    if (!container) return;

    var records = StorageManager.getRecords();

    // フィルタ適用
    var filteredRecords = records;
    var zoneFilter = document.getElementById('history-filter-zone');
    var startFilter = document.getElementById('history-filter-start');
    var endFilter = document.getElementById('history-filter-end');

    if (zoneFilter && zoneFilter.value) {
      filteredRecords = filterByZone(filteredRecords, zoneFilter.value);
    }
    if (startFilter && startFilter.value && endFilter && endFilter.value) {
      filteredRecords = filterByDateRange(filteredRecords, startFilter.value, endFilter.value);
    } else if (startFilter && startFilter.value) {
      filteredRecords = filterByDateRange(filteredRecords, startFilter.value, '9999-12-31');
    } else if (endFilter && endFilter.value) {
      filteredRecords = filterByDateRange(filteredRecords, '0000-01-01', endFilter.value);
    }

    // 日付降順ソート
    var sorted = sortRecordsByDate(filteredRecords, 'desc');

    // ページネーション適用
    var totalRecords = sorted.length;
    var totalPages = Math.ceil(totalRecords / HISTORY_PAGE_SIZE);
    if (_historyCurrentPage >= totalPages) _historyCurrentPage = Math.max(0, totalPages - 1);
    var startIdx = _historyCurrentPage * HISTORY_PAGE_SIZE;
    var endIdx = Math.min(startIdx + HISTORY_PAGE_SIZE, totalRecords);
    var pageRecords = sorted.slice(startIdx, endIdx);

    // フィルタUIを先に生成
    var html = buildHistoryFilterHTML();

    if (sorted.length === 0) {
      html += '<div class="empty-state"><div class="emoji">📋</div><div>施術履歴はまだありません</div></div>';
    } else {
      // ページ情報表示
      if (totalPages > 1) {
        html += '<div class="history-pagination-info">' + totalRecords + '件中 ' + (startIdx + 1) + '〜' + endIdx + '件を表示</div>';
      }
      html += '<div class="history-list">';
      for (var i = 0; i < pageRecords.length; i++) {
        var rec = pageRecords[i];
        var zoneName = getZoneNameById(rec.zone_id);
        var memoIcon = rec.memo ? ' 📝' : '';
        html += '<div class="history-item" data-record-id="' + rec.id + '">';
        if (rec.photo) {
          html += '<img class="history-photo-thumb" src="' + rec.photo + '" alt="施術写真" data-photo="' + rec.id + '">';
        }
        html += '<div class="history-item-main">';
        html += '<span class="history-date">' + rec.date + '</span>';
        html += '<span class="history-zone">' + zoneName + '</span>';
        html += '<span class="history-intensity">強度: ' + rec.intensity + '</span>';
        html += '<span class="history-memo-icon">' + memoIcon + '</span>';
        html += '</div>';
        html += '<button class="history-delete-btn" data-record-id="' + rec.id + '" title="削除">🗑️</button>';
        html += '</div>';
      }
      html += '</div>';

      // ページネーションコントロール
      if (totalPages > 1) {
        html += '<div class="history-pagination">';
        html += '<button class="history-page-btn" id="history-page-prev"' + (_historyCurrentPage === 0 ? ' disabled' : '') + '>← 前へ</button>';
        html += '<span class="history-page-indicator">' + (_historyCurrentPage + 1) + ' / ' + totalPages + '</span>';
        html += '<button class="history-page-btn" id="history-page-next"' + (_historyCurrentPage >= totalPages - 1 ? ' disabled' : '') + '>次へ →</button>';
        html += '</div>';
      }
    }

    container.innerHTML = html;

    // フィルタイベント再バインド
    bindHistoryFilterEvents();
    // 削除ボタンイベントバインド
    bindHistoryDeleteEvents();
    // 写真サムネイルタップイベントバインド
    bindHistoryPhotoEvents();
    // ページネーションイベントバインド
    bindHistoryPaginationEvents();
  }

  /**
   * 履歴フィルタUIのHTMLを生成する
   * @returns {string} HTML文字列
   */
  function buildHistoryFilterHTML() {
    var zones = getAllZones();
    // ゾーンフィルタ現在値
    var currentZone = '';
    var currentStart = '';
    var currentEnd = '';
    var zoneFilter = document.getElementById('history-filter-zone');
    var startFilter = document.getElementById('history-filter-start');
    var endFilter = document.getElementById('history-filter-end');
    if (zoneFilter) currentZone = zoneFilter.value || '';
    if (startFilter) currentStart = startFilter.value || '';
    if (endFilter) currentEnd = endFilter.value || '';

    var html = '<div class="history-filters">';
    html += '<div class="filter-row">';
    html += '<select id="history-filter-zone" class="filter-select">';
    html += '<option value="">全部位</option>';

    // グループ別にゾーンをまとめる
    var groups = {};
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (!groups[z.group]) groups[z.group] = [];
      groups[z.group].push(z);
    }
    var groupNames = Object.keys(groups);
    for (var g = 0; g < groupNames.length; g++) {
      var groupName = groupNames[g];
      html += '<optgroup label="' + groupName + '">';
      var groupZones = groups[groupName];
      for (var j = 0; j < groupZones.length; j++) {
        var selected = (groupZones[j].id === currentZone) ? ' selected' : '';
        html += '<option value="' + groupZones[j].id + '"' + selected + '>' + groupZones[j].name + '</option>';
      }
      html += '</optgroup>';
    }
    html += '</select>';
    html += '</div>';

    html += '<div class="filter-row">';
    html += '<input type="date" id="history-filter-start" class="filter-date" value="' + currentStart + '" placeholder="開始日">';
    html += '<span class="filter-separator">〜</span>';
    html += '<input type="date" id="history-filter-end" class="filter-date" value="' + currentEnd + '" placeholder="終了日">';
    html += '<button id="history-filter-clear" class="filter-clear-btn">クリア</button>';
    html += '</div>';
    html += '</div>';

    return html;
  }

  /**
   * 履歴フィルタのイベントをバインドする
   */
  function bindHistoryFilterEvents() {
    var zoneFilter = document.getElementById('history-filter-zone');
    var startFilter = document.getElementById('history-filter-start');
    var endFilter = document.getElementById('history-filter-end');
    var clearBtn = document.getElementById('history-filter-clear');

    if (zoneFilter) {
      zoneFilter.addEventListener('change', function() { _historyCurrentPage = 0; renderHistoryTab(); });
    }
    if (startFilter) {
      startFilter.addEventListener('change', function() { _historyCurrentPage = 0; renderHistoryTab(); });
    }
    if (endFilter) {
      endFilter.addEventListener('change', function() { _historyCurrentPage = 0; renderHistoryTab(); });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        if (zoneFilter) zoneFilter.value = '';
        if (startFilter) startFilter.value = '';
        if (endFilter) endFilter.value = '';
        _historyCurrentPage = 0;
        renderHistoryTab();
      });
    }
  }

  /**
   * 履歴削除ボタンのイベントをバインドする
   */
  function bindHistoryDeleteEvents() {
    var deleteButtons = document.querySelectorAll('.history-delete-btn');
    deleteButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var recordId = btn.getAttribute('data-record-id');
        if (confirm('この記録を削除しますか？')) {
          var result = StorageManager.deleteRecord(recordId);
          if (result.success) {
            refreshColors();
            renderHistoryTab();
            showToast('記録を削除しました', 'success');
          } else {
            showToast('削除に失敗しました', 'error');
          }
        }
      });
    });
  }

  /**
   * 履歴写真サムネイルのタップイベントをバインドする
   */
  function bindHistoryPhotoEvents() {
    var thumbs = document.querySelectorAll('.history-photo-thumb');
    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function(e) {
        e.stopPropagation();
        var src = thumb.getAttribute('src');
        if (src) {
          openPhotoViewer(src);
        }
      });
    });
  }

  /**
   * 履歴ページネーションのイベントをバインドする
   */
  function bindHistoryPaginationEvents() {
    var prevBtn = document.getElementById('history-page-prev');
    var nextBtn = document.getElementById('history-page-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (_historyCurrentPage > 0) {
          _historyCurrentPage--;
          renderHistoryTab();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        _historyCurrentPage++;
        renderHistoryTab();
      });
    }
  }

  /**
   * 写真拡大ビューアーを表示する
   * @param {string} photoSrc - base64 data URI
   */
  function openPhotoViewer(photoSrc) {
    // Validate that photoSrc is a data URI to prevent XSS
    if (!photoSrc || !photoSrc.startsWith('data:image/')) {
      return;
    }
    var overlay = document.createElement('div');
    overlay.className = 'photo-viewer-overlay';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'photo-viewer-close';
    closeBtn.setAttribute('aria-label', '閉じる');
    closeBtn.textContent = '×';

    var img = document.createElement('img');
    img.className = 'photo-viewer-img';
    img.src = photoSrc;
    img.alt = '施術写真';

    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // 閉じるボタンクリック
    overlay.querySelector('.photo-viewer-close').addEventListener('click', function() {
      closePhotoViewer(overlay);
    });
    // オーバーレイクリック（画像以外）
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePhotoViewer(overlay);
      }
    });
  }

  /**
   * 写真拡大ビューアーを閉じる
   * @param {HTMLElement} overlay
   */
  function closePhotoViewer(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  /**
   * ゾーン別の履歴情報を取得する（モーダル表示用）
   * @param {string} zoneId
   * @returns {{ recentRecords: Array, count: number, avgInterval: number|null }}
   */
  function getZoneHistoryInfo(zoneId) {
    var records = StorageManager.getRecordsByZone(zoneId);
    var sorted = sortRecordsByDate(records, 'desc');
    var recent = sorted.slice(0, 5);
    var count = getZoneTreatmentCount(records);
    var avgInterval = getZoneAverageInterval(records);
    return {
      recentRecords: recent,
      count: count,
      avgInterval: avgInterval
    };
  }

  // =========================================================
  // Settings Tab - 設定タブ描画管理
  // =========================================================

  /**
   * 設定タブを描画する
   */
  function renderSettingsTab() {
    var container = document.getElementById('tab-settings');
    if (!container) return;

    var settings = StorageManager.getSettings();
    var groups = (typeof BODY_GROUPS !== 'undefined') ? BODY_GROUPS : [];

    var html = '<div class="settings-section">';
    html += '<h2 class="settings-heading">周期設定</h2>';

    // デフォルト周期
    html += '<div class="settings-field">';
    html += '<label for="settings-default-cycle">デフォルト周期（日）</label>';
    html += '<input type="number" id="settings-default-cycle" class="settings-input" min="1" value="' + (settings.default_cycle_days || 30) + '">';
    html += '</div>';

    // 色閾値
    html += '<div class="settings-field">';
    html += '<label for="settings-color-threshold">色変化閾値（日）</label>';
    html += '<input type="number" id="settings-color-threshold" class="settings-input" min="1" value="' + (settings.color_threshold_days || 30) + '">';
    html += '</div>';

    // グループ別周期
    html += '<h3 class="settings-subheading">グループ別周期（日）</h3>';
    html += '<p class="settings-note">空欄の場合はデフォルト周期が適用されます</p>';
    html += '<div class="settings-group-list">';
    for (var i = 0; i < groups.length; i++) {
      var groupName = groups[i];
      var groupValue = (settings.group_cycles && settings.group_cycles[groupName]) ? settings.group_cycles[groupName] : '';
      html += '<div class="settings-group-item">';
      html += '<label class="settings-group-label">' + groupName + '</label>';
      html += '<input type="number" class="settings-group-input" data-group="' + groupName + '" min="1" value="' + groupValue + '" placeholder="' + (settings.default_cycle_days || 30) + '">';
      html += '</div>';
    }
    html += '</div>';

    // ゾーン別注記
    html += '<p class="settings-note settings-zone-note">ゾーン設定がグループ設定を上書きします</p>';

    // 保存ボタン
    html += '<button id="settings-save-btn" class="settings-save-btn">設定を保存</button>';
    html += '</div>';

    // 写真ストレージ使用量セクション
    html += '<div class="settings-section">';
    html += '<h2 class="settings-heading">📷 写真ストレージ使用量</h2>';
    html += '<div class="photo-storage-section" id="photo-storage-section">';
    html += '<div class="photo-storage-bar-wrap"><div class="photo-storage-bar level-green" id="photo-storage-bar" style="width:0%"></div></div>';
    html += '<div class="photo-storage-text" id="photo-storage-text">0.0MB / 4.0MB</div>';
    html += '</div>';
    html += '</div>';

    // データ管理セクション
    html += '<div class="settings-section">';
    html += '<h2 class="settings-heading">データ管理</h2>';
    html += '<div class="settings-field">';
    html += '<button id="export-data-btn" class="settings-export-btn">データをエクスポート（JSON）</button>';
    html += '</div>';
    html += '<div class="settings-field">';
    html += '<button id="import-data-btn" class="settings-import-btn">データをインポート（JSON）</button>';
    html += '</div>';
    html += '<div class="settings-field">';
    html += '<button id="reset-data-btn" class="settings-danger-btn">データリセット</button>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // 保存ボタンイベント
    var saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        saveSettingsFromUI();
      });
    }

    // エクスポートボタンイベント
    var exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        handleExport();
      });
    }

    // インポートボタンイベント
    var importBtn = document.getElementById('import-data-btn');
    if (importBtn) {
      importBtn.addEventListener('click', function() {
        handleImport();
      });
    }

    // リセットボタンイベント
    var resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        handleReset();
      });
    }

    // 写真ストレージ使用量を更新
    renderPhotoStorageUsage();
  }

  /**
   * 写真ストレージ使用量バーを更新する
   */
  function renderPhotoStorageUsage() {
    var bar = document.getElementById('photo-storage-bar');
    var text = document.getElementById('photo-storage-text');
    if (!bar || !text) return;

    var usage = StorageManager.getPhotoStorageUsage();
    var maxBytes = 4 * 1024 * 1024;
    var usageMB = (usage / (1024 * 1024)).toFixed(1);
    var percentage = Math.min((usage / maxBytes) * 100, 100);

    bar.style.width = percentage + '%';

    // Color coding: green < 50%, yellow 50-80%, red > 80%
    bar.className = 'photo-storage-bar';
    if (percentage > 80) {
      bar.classList.add('level-red');
    } else if (percentage >= 50) {
      bar.classList.add('level-yellow');
    } else {
      bar.classList.add('level-green');
    }

    text.textContent = usageMB + 'MB / 4.0MB';
  }

  /**
   * 設定UIの入力値からSettingsオブジェクトを構築して保存する
   */
  function saveSettingsFromUI() {
    var defaultCycleEl = document.getElementById('settings-default-cycle');
    var colorThresholdEl = document.getElementById('settings-color-threshold');

    var defaultCycle = parseInt(defaultCycleEl.value) || 30;
    var colorThreshold = parseInt(colorThresholdEl.value) || 30;

    // グループ別周期を収集
    var groupCycles = {};
    var groupInputs = document.querySelectorAll('.settings-group-input');
    groupInputs.forEach(function(input) {
      var groupName = input.getAttribute('data-group');
      var val = parseInt(input.value);
      if (groupName && val && val > 0) {
        groupCycles[groupName] = val;
      }
    });

    // 既存のzone_cyclesを保持
    var currentSettings = StorageManager.getSettings();

    var newSettings = {
      default_cycle_days: defaultCycle,
      color_threshold_days: colorThreshold,
      zone_cycles: currentSettings.zone_cycles || {},
      group_cycles: groupCycles
    };

    var result = StorageManager.saveSettings(newSettings);
    if (result.success) {
      showToast('設定を保存しました', 'success');
      refreshColors();
      renderOverdueList();
      renderSummaryDashboard();
    } else {
      showToast('設定の保存に失敗しました', 'error');
    }
  }

  // =========================================================
  // BodyMapRenderer - SVG Body Map描画・インタラクション管理
  // =========================================================
  const BodyMapRenderer = {
    _containerId: null,
    _svgEl: null,
    _currentSide: 'front',
    _tapCallback: null,
    _longPressCallback: null,
    _longPressDuration: 500,
    _longPressTimer: null,
    _longPressTriggered: false,
    _tooltipEl: null,
    _zones: [],

    /**
     * SVGコンテナ初期化・viewBox設定
     * @param {string} containerId - SVGを挿入するコンテナのID
     * @param {string} side - 初期表示面 ('front' or 'back')
     */
    init: function(containerId, side) {
      var DEBUG_PERF = typeof window !== 'undefined' && window._HAIR_REMOVAL_DEBUG;
      if (DEBUG_PERF) console.time('[BodyMapRenderer] init total');

      side = side || 'front';
      this._containerId = containerId;
      this._currentSide = side;

      var container = document.getElementById(containerId);
      if (!container) {
        console.warn('BodyMapRenderer: container not found:', containerId);
        return;
      }

      // SVG要素を生成
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 800');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Body Map');
      container.innerHTML = '';
      container.appendChild(svg);
      this._svgEl = svg;

      // ツールチップ要素を取得
      this._tooltipEl = document.getElementById('body-map-tooltip');

      // 初回描画
      this._renderCurrentSide();

      if (DEBUG_PERF) console.timeEnd('[BodyMapRenderer] init total');

      // トグルボタンにイベント登録
      var toggleBtn = document.getElementById('side-toggle-btn');
      if (toggleBtn) {
        var self = this;
        toggleBtn.addEventListener('click', function() {
          var newSide = self._currentSide === 'front' ? 'back' : 'front';
          self.switchSide(newSide);
        });
      }
    },

    /**
     * 全ゾーンのSVGパス生成・描画
     * @param {Array} zones - ゾーンデータ配列
     * @param {Object} colorMap - {zoneId: colorString} (オプション)
     */
    render: function(zones, colorMap) {
      var DEBUG_PERF = typeof window !== 'undefined' && window._HAIR_REMOVAL_DEBUG;
      if (DEBUG_PERF) console.time('[BodyMapRenderer] render (' + (zones ? zones.length : 0) + ' zones)');

      if (!this._svgEl) return;
      this._zones = zones || [];
      this._svgEl.innerHTML = '';

      var self = this;
      this._zones.forEach(function(zone) {
        if (!zone.svgPath) {
          console.warn('BodyMapRenderer: invalid svgPath for zone:', zone.id);
          return;
        }
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', zone.svgPath);
        path.setAttribute('data-zone-id', zone.id);
        path.setAttribute('data-zone-name', zone.name);

        // 色適用
        var color = (colorMap && colorMap[zone.id]) ? colorMap[zone.id] : '#ccc';
        path.setAttribute('fill', color);

        self._svgEl.appendChild(path);
      });

      // イベントバインディング
      this._bindEvents();

      if (DEBUG_PERF) console.timeEnd('[BodyMapRenderer] render (' + (zones ? zones.length : 0) + ' zones)');
    },

    /**
     * 色のみ差分更新
     * @param {Object} colorMap - {zoneId: colorString}
     */
    updateColors: function(colorMap) {
      if (!this._svgEl || !colorMap) return;
      var paths = this._svgEl.querySelectorAll('path[data-zone-id]');
      paths.forEach(function(path) {
        var zoneId = path.getAttribute('data-zone-id');
        if (colorMap[zoneId]) {
          path.setAttribute('fill', colorMap[zoneId]);
        }
      });
    },

    /**
     * 前面/背面切替
     * @param {string} side - 'front' or 'back'
     */
    switchSide: function(side) {
      if (side !== 'front' && side !== 'back') return;
      this._currentSide = side;
      this._renderCurrentSide();

      // トグルボタンの表示更新
      var toggleBtn = document.getElementById('side-toggle-btn');
      if (toggleBtn) {
        toggleBtn.dataset.side = side;
      }
    },

    /**
     * 現在面のゾーンを描画
     */
    _renderCurrentSide: function() {
      if (typeof BODY_MAP_DATA === 'undefined') {
        console.warn('BodyMapRenderer: BODY_MAP_DATA not found');
        return;
      }
      var zones = BODY_MAP_DATA[this._currentSide] || [];
      this.render(zones, null);
    },

    /**
     * タップイベント登録
     * @param {Function} callback - function(zoneId, zoneName)
     */
    onZoneTap: function(callback) {
      this._tapCallback = callback;
    },

    /**
     * 長押しイベント登録
     * @param {Function} callback - function(zoneId, zoneName)
     * @param {number} duration - 長押し判定時間(ms)、デフォルト500
     */
    onZoneLongPress: function(callback, duration) {
      this._longPressCallback = callback;
      this._longPressDuration = duration || 500;
    },

    /**
     * ツールチップ表示
     * @param {string} zoneId - ゾーンID
     * @param {Object} position - {x, y} 画面座標
     */
    showTooltip: function(zoneId, position) {
      if (!this._tooltipEl) return;
      var zone = this._findZone(zoneId);
      var name = zone ? zone.name : zoneId;
      this._tooltipEl.textContent = name;
      this._tooltipEl.style.left = position.x + 'px';
      this._tooltipEl.style.top = position.y + 'px';
      this._tooltipEl.classList.add('show');
    },

    /**
     * ツールチップ非表示
     */
    hideTooltip: function() {
      if (!this._tooltipEl) return;
      this._tooltipEl.classList.remove('show');
    },

    _multiSelectMode: false,
    _selectedZones: [], // [{id, name}]

    /**
     * 複数選択モード切替
     * @param {boolean} enabled
     */
    setMultiSelectMode: function(enabled) {
      this._multiSelectMode = !!enabled;
      if (!enabled) {
        // 選択解除: ハイライトを全て削除
        this._clearSelection();
      }
    },

    /**
     * 選択中ゾーン取得
     * @returns {Array} [{id, name}]
     */
    getSelectedZones: function() {
      return this._selectedZones.slice();
    },

    /**
     * ゾーンを選択に追加/除外トグル
     * @param {string} zoneId
     * @param {string} zoneName
     * @returns {boolean} true if added, false if removed
     */
    toggleZoneSelection: function(zoneId, zoneName) {
      var idx = -1;
      for (var i = 0; i < this._selectedZones.length; i++) {
        if (this._selectedZones[i].id === zoneId) { idx = i; break; }
      }
      if (idx >= 0) {
        this._selectedZones.splice(idx, 1);
        this._removeHighlight(zoneId);
        return false;
      } else {
        this._selectedZones.push({ id: zoneId, name: zoneName });
        this._addHighlight(zoneId);
        return true;
      }
    },

    /**
     * ハイライトを追加
     */
    _addHighlight: function(zoneId) {
      if (!this._svgEl) return;
      var path = this._svgEl.querySelector('path[data-zone-id="' + zoneId + '"]');
      if (path) path.classList.add('body-zone-selected');
    },

    /**
     * ハイライトを除去
     */
    _removeHighlight: function(zoneId) {
      if (!this._svgEl) return;
      var path = this._svgEl.querySelector('path[data-zone-id="' + zoneId + '"]');
      if (path) path.classList.remove('body-zone-selected');
    },

    /**
     * 全選択をクリア
     */
    _clearSelection: function() {
      if (this._svgEl) {
        var paths = this._svgEl.querySelectorAll('path.body-zone-selected');
        paths.forEach(function(p) { p.classList.remove('body-zone-selected'); });
      }
      this._selectedZones = [];
    },

    /**
     * イベントバインディング（タップ・長押し・ツールチップ）
     */
    _bindEvents: function() {
      if (!this._svgEl) return;
      var self = this;

      // --- タッチイベント ---
      this._svgEl.addEventListener('touchstart', function(e) {
        var path = self._getZonePath(e.target);
        if (!path) return;

        self._longPressTriggered = false;
        var zoneId = path.getAttribute('data-zone-id');
        var zoneName = path.getAttribute('data-zone-name');

        // ツールチップ表示
        var touch = e.touches[0];
        self.showTooltip(zoneId, { x: touch.clientX, y: touch.clientY });

        // 長押しタイマー開始
        self._longPressTimer = setTimeout(function() {
          self._longPressTriggered = true;
          if (self._longPressCallback) {
            self._longPressCallback(zoneId, zoneName);
          }
        }, self._longPressDuration);
      }, { passive: true });

      this._svgEl.addEventListener('touchend', function(e) {
        var path = self._getZonePath(e.target);

        // ツールチップ非表示
        self.hideTooltip();

        // 長押しタイマークリア
        if (self._longPressTimer) {
          clearTimeout(self._longPressTimer);
          self._longPressTimer = null;
        }

        // 長押しでなければタップとして処理
        if (!self._longPressTriggered && path) {
          var zoneId = path.getAttribute('data-zone-id');
          var zoneName = path.getAttribute('data-zone-name');
          if (self._tapCallback) {
            self._tapCallback(zoneId, zoneName);
          }
        }
      }, { passive: true });

      this._svgEl.addEventListener('touchmove', function(e) {
        // 指が動いたら長押しキャンセル
        if (self._longPressTimer) {
          clearTimeout(self._longPressTimer);
          self._longPressTimer = null;
        }
        self.hideTooltip();
      }, { passive: true });

      this._svgEl.addEventListener('touchcancel', function() {
        if (self._longPressTimer) {
          clearTimeout(self._longPressTimer);
          self._longPressTimer = null;
        }
        self.hideTooltip();
      }, { passive: true });

      // --- マウスイベント（PC対応） ---
      this._svgEl.addEventListener('click', function(e) {
        var path = self._getZonePath(e.target);
        if (!path) return;
        var zoneId = path.getAttribute('data-zone-id');
        var zoneName = path.getAttribute('data-zone-name');
        if (self._tapCallback) {
          self._tapCallback(zoneId, zoneName);
        }
      });

      this._svgEl.addEventListener('mouseenter', function(e) {
        var path = self._getZonePath(e.target);
        if (!path) return;
        var zoneId = path.getAttribute('data-zone-id');
        self.showTooltip(zoneId, { x: e.clientX, y: e.clientY });
      }, true);

      this._svgEl.addEventListener('mouseover', function(e) {
        var path = self._getZonePath(e.target);
        if (!path) return;
        var zoneId = path.getAttribute('data-zone-id');
        self.showTooltip(zoneId, { x: e.clientX, y: e.clientY });
      });

      this._svgEl.addEventListener('mouseout', function(e) {
        var path = self._getZonePath(e.target);
        if (path) {
          self.hideTooltip();
        }
      });
    },

    /**
     * イベントターゲットからzone pathを取得
     */
    _getZonePath: function(target) {
      if (!target) return null;
      if (target.tagName === 'path' && target.hasAttribute('data-zone-id')) {
        return target;
      }
      return null;
    },

    /**
     * ゾーンIDからゾーンデータを検索
     */
    _findZone: function(zoneId) {
      for (var i = 0; i < this._zones.length; i++) {
        if (this._zones[i].id === zoneId) return this._zones[i];
      }
      return null;
    }
  };

  /**
   * タブ切替処理
   * @param {string} tabName - タブ名（map, history, stats, settings）
   */
  function switchTab(tabName) {
    var DEBUG_PERF = typeof window !== 'undefined' && window._HAIR_REMOVAL_DEBUG;
    if (DEBUG_PERF) console.time('[HairRemovalTracker] switchTab(' + tabName + ')');

    // タブボタンのactive切替
    const buttons = document.querySelectorAll('.tab-bar button');
    buttons.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // タブコンテンツのactive切替
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(function(content) {
      var contentId = content.id.replace('tab-', '');
      content.classList.toggle('active', contentId === tabName);
    });

    // URLハッシュ更新（pushStateを使わず直接変更）
    var newHash = TAB_HASH_MAP[tabName] || '#map';
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }

    // 履歴タブ切替時に描画
    if (tabName === 'history') {
      renderHistoryTab();
    }
    // 統計タブ切替時に描画
    if (tabName === 'stats') {
      renderStatsTab();
    }
    // 設定タブ切替時に描画
    if (tabName === 'settings') {
      renderSettingsTab();
    }

    if (DEBUG_PERF) console.timeEnd('[HairRemovalTracker] switchTab(' + tabName + ')');
  }

  /**
   * URLハッシュからタブを判定して切替
   */
  function handleHashChange() {
    var hash = window.location.hash || '#map';
    var tabName = HASH_TAB_MAP[hash] || 'map';
    switchTab(tabName);
  }

  /**
   * ヒートマップ色を再計算してBody Mapに適用する
   */
  var BodyMapRendererBack = null;

  var refreshColors = function() {
    // レコードを取得
    var records = [];
    try {
      var stored = localStorage.getItem('hair_removal_records');
      if (stored) {
        records = JSON.parse(stored);
      }
    } catch (e) {
      records = [];
    }

    // 設定を取得
    var settings = { color_threshold_days: 30 };
    try {
      var storedSettings = localStorage.getItem('hair_removal_settings');
      if (storedSettings) {
        var parsed = JSON.parse(storedSettings);
        if (parsed.color_threshold_days) {
          settings.color_threshold_days = parsed.color_threshold_days;
        }
      }
    } catch (e) {
      // デフォルト設定を使用
    }

    // 前面ゾーンの色適用
    if (typeof BODY_MAP_DATA !== 'undefined') {
      var frontZones = BODY_MAP_DATA.front || [];
      var frontColorMap = buildColorMap(frontZones, records, settings.color_threshold_days);
      BodyMapRenderer.updateColors(frontColorMap);

      // 背面ゾーンの色適用
      if (BodyMapRendererBack) {
        var backZones = BODY_MAP_DATA.back || [];
        var backColorMap = buildColorMap(backZones, records, settings.color_threshold_days);
        BodyMapRendererBack.updateColors(backColorMap);
      }
    }

    // 要施術リスト・サマリー更新
    renderOverdueList();
    renderSummaryDashboard();
  };

  // =========================================================
  // Swipe Selection - なぞり選択
  // =========================================================

  var _swipeSelecting = false;
  var _swipeSelectedZones = []; // [{id, name}]

  function initSwipeSelection() {
    var containers = [
      document.getElementById('body-map-container-front'),
      document.getElementById('body-map-container-back')
    ];

    containers.forEach(function(container) {
      if (!container) return;
      var svg = container.querySelector('svg');
      if (!svg) return;

      var _swipeMoved = false;
      var _swipeStartZoneId = null;

      // Touch events for swipe selection
      svg.addEventListener('touchstart', function(e) {
        _swipeSelecting = true;
        _swipeMoved = false;
        var path = getZonePathFromPoint(svg, e.touches[0]);
        _swipeStartZoneId = path ? path.getAttribute('data-zone-id') : null;
        if (path) addToSwipeSelection(path);
      }, { passive: false });

      svg.addEventListener('touchmove', function(e) {
        if (!_swipeSelecting) return;
        e.preventDefault(); // スクロール防止
        var path = getZonePathFromPoint(svg, e.touches[0]);
        if (path) {
          var moveZoneId = path.getAttribute('data-zone-id');
          if (moveZoneId !== _swipeStartZoneId) _swipeMoved = true;
          addToSwipeSelection(path);
        }
      }, { passive: false });

      svg.addEventListener('touchend', function(e) {
        // タップ判定: 移動なしで同じゾーンで終了 → トグル（解除）
        if (!_swipeMoved && _swipeStartZoneId) {
          toggleSwipeSelection(_swipeStartZoneId);
        }
        _swipeSelecting = false;
        _swipeStartZoneId = null;
        updateSwipeSelectBar();
      });

      svg.addEventListener('touchcancel', function() {
        _swipeSelecting = false;
        _swipeStartZoneId = null;
      });

      // Mouse events for desktop
      var _mouseSwipeMoved = false;
      var _mouseStartZoneId = null;

      svg.addEventListener('mousedown', function(e) {
        _swipeSelecting = true;
        _mouseSwipeMoved = false;
        var path = getZonePathFromMouse(e);
        _mouseStartZoneId = path ? path.getAttribute('data-zone-id') : null;
        if (path) addToSwipeSelection(path);
      });

      svg.addEventListener('mousemove', function(e) {
        if (!_swipeSelecting) return;
        var path = getZonePathFromMouse(e);
        if (path) {
          var moveZoneId = path.getAttribute('data-zone-id');
          if (moveZoneId !== _mouseStartZoneId) _mouseSwipeMoved = true;
          addToSwipeSelection(path);
        }
      });

      svg.addEventListener('mouseup', function(e) {
        // タップ判定: 移動なしで同じゾーンで終了 → トグル（解除）
        if (!_mouseSwipeMoved && _mouseStartZoneId) {
          toggleSwipeSelection(_mouseStartZoneId);
        }
        _swipeSelecting = false;
        _mouseStartZoneId = null;
        updateSwipeSelectBar();
      });

      svg.addEventListener('mouseleave', function() {
        if (_swipeSelecting) {
          _swipeSelecting = false;
          _mouseStartZoneId = null;
          updateSwipeSelectBar();
        }
      });
    });

    // 選択バーのイベント
    var clearBtn = document.getElementById('swipe-select-clear');
    var recordBtn = document.getElementById('swipe-select-record');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() { clearSwipeSelection(); });
    }
    if (recordBtn) {
      recordBtn.addEventListener('click', function() { openRecordFromSwipeSelection(); });
    }
  }

  function getZonePathFromPoint(svg, touch) {
    var rect = svg.getBoundingClientRect();
    var x = touch.clientX - rect.left;
    var y = touch.clientY - rect.top;
    // SVG座標に変換
    var svgX = x * (400 / rect.width);
    var svgY = y * (800 / rect.height);
    // elementsFromPoint を使用
    var elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].tagName === 'path' && elements[i].hasAttribute('data-zone-id')) {
        return elements[i];
      }
    }
    return null;
  }

  function getZonePathFromMouse(e) {
    if (e.target && e.target.tagName === 'path' && e.target.hasAttribute('data-zone-id')) {
      return e.target;
    }
    return null;
  }

  function addToSwipeSelection(pathEl) {
    var zoneId = pathEl.getAttribute('data-zone-id');
    var zoneName = pathEl.getAttribute('data-zone-name');
    // 既に選択済みならスキップ（なぞり中は追加のみ）
    for (var i = 0; i < _swipeSelectedZones.length; i++) {
      if (_swipeSelectedZones[i].id === zoneId) return;
    }
    _swipeSelectedZones.push({ id: zoneId, name: zoneName });
    pathEl.classList.add('body-zone-selected');
    updateSwipeSelectBar();
  }

  /**
   * タップでゾーン選択をトグル（選択済みなら解除）
   */
  function toggleSwipeSelection(zoneId) {
    var idx = -1;
    for (var i = 0; i < _swipeSelectedZones.length; i++) {
      if (_swipeSelectedZones[i].id === zoneId) { idx = i; break; }
    }
    if (idx >= 0) {
      // 選択解除
      _swipeSelectedZones.splice(idx, 1);
      var path = document.querySelector('.body-map-container svg path[data-zone-id="' + zoneId + '"]');
      if (path) path.classList.remove('body-zone-selected');
    }
    // 未選択の場合は addToSwipeSelection で既に追加済みなので何もしない
  }

  function updateSwipeSelectBar() {
    var bar = document.getElementById('swipe-select-bar');
    var count = document.getElementById('swipe-select-count');
    if (!bar) return;
    if (_swipeSelectedZones.length > 0) {
      bar.style.display = 'flex';
      if (count) count.textContent = _swipeSelectedZones.length;
    } else {
      bar.style.display = 'none';
    }
  }

  function clearSwipeSelection() {
    // 全SVGから選択ハイライトを除去
    var paths = document.querySelectorAll('.body-map-container svg path.body-zone-selected');
    paths.forEach(function(p) { p.classList.remove('body-zone-selected'); });
    _swipeSelectedZones = [];
    updateSwipeSelectBar();
  }

  function openRecordFromSwipeSelection() {
    if (_swipeSelectedZones.length === 0) return;
    if (_swipeSelectedZones.length === 1) {
      TreatmentModal.open(_swipeSelectedZones[0].id, _swipeSelectedZones[0].name);
    } else {
      TreatmentModal.openBatch(_swipeSelectedZones);
    }
  }

  // =========================================================
  // Treatment Modal - 施術記録モーダル管理
  // =========================================================

  var TreatmentModal = {
    _modalEl: null,
    _zoneNameEl: null,
    _dateEl: null,
    _intensityEl: null,
    _memoEl: null,
    _confirmBtn: null,
    _cancelBtn: null,
    _onConfirmCallback: null,
    _currentZoneId: null,
    _currentZoneName: null,
    _isBatchMode: false,
    _photoBase64: null,
    _photoInputEl: null,
    _photoBtn: null,
    _photoPreview: null,
    _photoThumb: null,
    _photoRemoveBtn: null,

    /**
     * モーダル初期化
     */
    init: function() {
      this._modalEl = document.getElementById('treatment-modal');
      this._zoneNameEl = document.getElementById('modal-zone-name');
      this._dateEl = document.getElementById('modal-date');
      this._intensityEl = document.getElementById('modal-intensity');
      this._memoEl = document.getElementById('modal-memo');
      this._confirmBtn = document.getElementById('modal-confirm');
      this._cancelBtn = document.getElementById('modal-cancel');
      this._photoInputEl = document.getElementById('modal-photo-input');
      this._photoBtn = document.getElementById('modal-photo-btn');
      this._photoPreview = document.getElementById('modal-photo-preview');
      this._photoThumb = document.getElementById('modal-photo-thumb');
      this._photoRemoveBtn = document.getElementById('modal-photo-remove');

      if (!this._modalEl) return;

      var self = this;

      // 確定ボタン
      this._confirmBtn.addEventListener('click', function() {
        self._handleConfirm();
      });

      // キャンセルボタン
      this._cancelBtn.addEventListener('click', function() {
        self.close();
      });

      // オーバーレイクリックで閉じる
      this._modalEl.addEventListener('click', function(e) {
        if (e.target === self._modalEl) {
          self.close();
        }
      });

      // 写真添付ボタン → ファイル入力をトリガー
      if (this._photoBtn) {
        this._photoBtn.addEventListener('click', function() {
          if (self._photoInputEl) {
            self._photoInputEl.value = '';
            self._photoInputEl.click();
          }
        });
      }

      // ファイル選択イベント
      if (this._photoInputEl) {
        this._photoInputEl.addEventListener('change', function(e) {
          var file = e.target.files && e.target.files[0];
          if (!file) return;
          self._handlePhotoSelect(file);
        });
      }

      // 写真削除ボタン
      if (this._photoRemoveBtn) {
        this._photoRemoveBtn.addEventListener('click', function() {
          self._clearPhoto();
        });
      }
    },

    /**
     * 単一ゾーン用にモーダルを開く
     * @param {string} zoneId
     * @param {string} zoneName
     */
    open: function(zoneId, zoneName) {
      this._currentZoneId = zoneId;
      this._currentZoneName = zoneName;
      this._isBatchMode = false;

      this._zoneNameEl.textContent = zoneName;
      this._dateEl.value = getTodayString();
      this._setIntensity(3);
      this._memoEl.value = '';
      this._clearPhoto();

      // ゾーン別履歴情報を表示
      this._renderZoneHistory(zoneId);

      this._modalEl.classList.add('show');
    },

    /**
     * 複数ゾーン用にモーダルを開く
     * @param {Array} zones - [{id, name}]
     */
    openBatch: function(zones) {
      this._isBatchMode = true;
      this._currentZoneId = null;
      this._currentZoneName = null;

      var names = zones.map(function(z) { return z.name; });
      this._zoneNameEl.textContent = names.join('、') + '（' + zones.length + '件）';
      this._dateEl.value = getTodayString();
      this._setIntensity(3);
      this._memoEl.value = '';
      this._clearPhoto();

      // バッチモードではゾーン履歴を非表示
      var existingHistory = document.getElementById('modal-zone-history');
      if (existingHistory) existingHistory.remove();

      this._modalEl.classList.add('show');
    },

    /**
     * モーダルを閉じる
     */
    close: function() {
      if (this._modalEl) {
        this._modalEl.classList.remove('show');
      }
      this._clearPhoto();
    },

    /**
     * 確定時コールバック登録
     * @param {Function} callback - function({date, intensity, memo})
     */
    onConfirm: function(callback) {
      this._onConfirmCallback = callback;
    },

    /**
     * ゾーン別履歴情報をモーダル内に表示する
     * @param {string} zoneId
     */
    _renderZoneHistory: function(zoneId) {
      // 既存のゾーン履歴セクションを削除
      var existing = document.getElementById('modal-zone-history');
      if (existing) existing.remove();

      var info = getZoneHistoryInfo(zoneId);
      if (info.count === 0) return;

      var section = document.createElement('div');
      section.id = 'modal-zone-history';
      section.className = 'modal-zone-history';

      var html = '<div class="zone-history-header">施術履歴</div>';
      html += '<div class="zone-history-stats">';
      html += '<span>施術回数: ' + info.count + '回</span>';
      if (info.avgInterval !== null) {
        html += '<span>平均間隔: ' + Math.round(info.avgInterval) + '日</span>';
      }
      html += '</div>';

      if (info.recentRecords.length > 0) {
        html += '<div class="zone-history-list">';
        for (var i = 0; i < info.recentRecords.length; i++) {
          var rec = info.recentRecords[i];
          html += '<div class="zone-history-item">';
          html += '<span>' + rec.date + '</span>';
          html += '<span>強度: ' + rec.intensity + '</span>';
          html += '</div>';
        }
        html += '</div>';
      }

      section.innerHTML = html;

      // モーダルbody内の先頭に挿入
      var modalBody = document.querySelector('#treatment-modal .modal-body');
      if (modalBody) {
        modalBody.insertBefore(section, modalBody.firstChild);
      }
    },

    /**
     * 確定ハンドラ
     */
    _handleConfirm: function() {
      var date = this._dateEl.value;
      var intensity = this._getIntensity();
      var memo = this._memoEl.value.trim() || null;

      if (!date) {
        showToast('日付を入力してください', 'error');
        return;
      }

      // 写真のストレージ制限チェック（4MB = 4 * 1024 * 1024 bytes）
      var photo = this._photoBase64;
      if (photo) {
        var currentUsage = StorageManager.getPhotoStorageUsage();
        var newPhotoSize = PhotoCompressor.getBase64Size(photo);
        var MAX_PHOTO_STORAGE = 4 * 1024 * 1024;
        if (currentUsage + newPhotoSize > MAX_PHOTO_STORAGE) {
          showToast('写真の保存容量に達しました（4MB制限）', 'error');
          photo = null;
        }
      }

      if (this._onConfirmCallback) {
        this._onConfirmCallback({
          date: date,
          intensity: intensity,
          memo: memo,
          photo: photo,
          zoneId: this._currentZoneId,
          zoneName: this._currentZoneName,
          isBatchMode: this._isBatchMode
        });
      }

      this.close();
    },

    /**
     * 強度を設定する
     * @param {number} value - 1-5
     */
    _setIntensity: function(value) {
      var radios = this._intensityEl.querySelectorAll('input[name="intensity"]');
      radios.forEach(function(r) {
        r.checked = (parseInt(r.value) === value);
      });
    },

    /**
     * 選択中の強度を取得する
     * @returns {number} 1-5
     */
    _getIntensity: function() {
      var radios = this._intensityEl.querySelectorAll('input[name="intensity"]');
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return parseInt(radios[i].value);
      }
      return 3; // デフォルト
    },

    /**
     * 写真選択ハンドラ
     * @param {File} file - 選択された画像ファイル
     */
    _handlePhotoSelect: function(file) {
      var self = this;
      PhotoCompressor.compress(file, 800, 500, 0.8).then(function(base64) {
        if (base64 === null) {
          showToast('写真のサイズが大きすぎます（500KB以下にしてください）', 'error');
          return;
        }
        self._photoBase64 = base64;
        if (self._photoThumb) {
          self._photoThumb.src = base64;
        }
        if (self._photoPreview) {
          self._photoPreview.style.display = 'flex';
        }
      });
    },

    /**
     * 写真状態をクリアする
     */
    _clearPhoto: function() {
      this._photoBase64 = null;
      if (this._photoThumb) {
        this._photoThumb.src = '';
      }
      if (this._photoPreview) {
        this._photoPreview.style.display = 'none';
      }
      if (this._photoInputEl) {
        this._photoInputEl.value = '';
      }
    }
  };

  // =========================================================
  // Multi-Select Mode - 複数選択モード管理
  // =========================================================

  var MultiSelectManager = {
    _active: false,
    _barEl: null,
    _countEl: null,
    _deselectBtn: null,
    _saveBtn: null,

    init: function() {
      this._barEl = document.getElementById('multi-select-bar');
      this._countEl = document.getElementById('multi-select-count');
      this._deselectBtn = document.getElementById('multi-select-deselect');
      this._saveBtn = document.getElementById('multi-select-save');

      if (!this._barEl) return;

      var self = this;

      this._deselectBtn.addEventListener('click', function() {
        self.deactivate();
      });

      this._saveBtn.addEventListener('click', function() {
        self._handleSave();
      });
    },

    /**
     * 複数選択モードを開始する
     */
    activate: function() {
      this._active = true;
      BodyMapRenderer.setMultiSelectMode(true);
      this._barEl.style.display = 'flex';
      this._updateCount();
    },

    /**
     * 複数選択モードを終了する
     */
    deactivate: function() {
      this._active = false;
      BodyMapRenderer.setMultiSelectMode(false);
      this._barEl.style.display = 'none';
      this._updateCount();
    },

    /**
     * モードがアクティブかチェック
     */
    isActive: function() {
      return this._active;
    },

    /**
     * ゾーン選択トグル
     */
    toggleZone: function(zoneId, zoneName) {
      BodyMapRenderer.toggleZoneSelection(zoneId, zoneName);
      this._updateCount();
    },

    /**
     * 件数表示更新
     */
    _updateCount: function() {
      var count = BodyMapRenderer.getSelectedZones().length;
      if (this._countEl) {
        this._countEl.textContent = count;
      }
    },

    /**
     * 一括保存ハンドラ
     */
    _handleSave: function() {
      var selected = BodyMapRenderer.getSelectedZones();
      if (selected.length === 0) {
        showToast('ゾーンが選択されていません', 'error');
        return;
      }
      // バッチモードでモーダルを開く
      TreatmentModal.openBatch(selected);
    }
  };

  // =========================================================
  // Overdue List - 要施術リスト（マップタブ内）
  // =========================================================

  /**
   * 要施術リストを描画する（マップタブ内、Body Map下部）
   */
  function renderOverdueList() {
    var container = document.getElementById('overdue-list-section');
    if (!container) {
      // セクションが無ければ作成してBody Map下に挿入
      var mapTab = document.getElementById('tab-map');
      if (!mapTab) return;
      container = document.createElement('div');
      container.id = 'overdue-list-section';
      container.className = 'overdue-list-section';
      mapTab.appendChild(container);
    }

    var zones = getAllZones();
    var records = StorageManager.getRecords();
    var settings = StorageManager.getSettings();
    var overdueZones = getOverdueZones(zones, records, settings);

    if (overdueZones.length === 0) {
      container.innerHTML = '<div class="overdue-header" id="overdue-toggle"><span class="overdue-toggle-icon">▶</span> 要施術リスト（0件）</div>';
      // overdue indicators on map を削除
      updateOverdueIndicators([]);
      return;
    }

    var html = '<div class="overdue-header" id="overdue-toggle"><span class="overdue-toggle-icon" id="overdue-toggle-icon">▼</span> 要施術リスト（' + overdueZones.length + '件）</div>';
    html += '<div class="overdue-body" id="overdue-body">';
    for (var i = 0; i < overdueZones.length; i++) {
      var item = overdueZones[i];
      html += '<div class="overdue-item">';
      html += '<span class="overdue-zone-name">⚠️ ' + item.zone.name + '</span>';
      html += '<span class="overdue-days">' + item.overdueDays + '日超過</span>';
      html += '<span class="overdue-next">次回: ' + item.nextDate + '</span>';
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;

    // 折りたたみトグル
    var toggleEl = document.getElementById('overdue-toggle');
    if (toggleEl) {
      toggleEl.addEventListener('click', function() {
        var body = document.getElementById('overdue-body');
        var icon = document.getElementById('overdue-toggle-icon');
        if (body && icon) {
          var isHidden = body.style.display === 'none';
          body.style.display = isHidden ? 'block' : 'none';
          icon.textContent = isHidden ? '▼' : '▶';
        }
      });
    }

    // Body Map上にoverdue indicatorを更新
    updateOverdueIndicators(overdueZones);
  }

  /**
   * Body Map SVG上のoverdueインジケータを更新する
   * @param {Array} overdueZones - getOverdueZones()の結果
   */
  function updateOverdueIndicators(overdueZones) {
    // 両方のSVGから既存のoverdue classを全て削除
    var allPaths = document.querySelectorAll('.body-map-container svg path.body-zone-overdue');
    allPaths.forEach(function(p) { p.classList.remove('body-zone-overdue'); });

    // overdueゾーンにclassを追加（両方のSVGを検索）
    for (var i = 0; i < overdueZones.length; i++) {
      var zoneId = overdueZones[i].zone.id;
      var path = document.querySelector('.body-map-container svg path[data-zone-id="' + zoneId + '"]');
      if (path) {
        path.classList.add('body-zone-overdue');
      }
    }
  }

  // =========================================================
  // Summary Dashboard - サマリーダッシュボード（マップタブ内）
  // =========================================================

  /**
   * サマリーダッシュボードを描画する（マップタブ上部）
   */
  function renderSummaryDashboard() {
    var container = document.getElementById('summary-dashboard');
    if (!container) {
      // セクションが無ければ作成してBody Map toggle前に挿入
      var mapTab = document.getElementById('tab-map');
      if (!mapTab) return;
      container = document.createElement('div');
      container.id = 'summary-dashboard';
      container.className = 'summary-dashboard';
      var toggleSection = document.querySelector('.body-map-toggle');
      if (toggleSection) {
        mapTab.insertBefore(container, toggleSection);
      } else {
        mapTab.insertBefore(container, mapTab.firstChild);
      }
    }

    var zones = getAllZones();
    var records = StorageManager.getRecords();
    var settings = StorageManager.getSettings();

    var totalZoneCount = zones.length;

    // 施術済ゾーン数（1回以上記録があるゾーン）
    var treatedZoneIds = {};
    for (var i = 0; i < records.length; i++) {
      treatedZoneIds[records[i].zone_id] = true;
    }
    var treatedCount = Object.keys(treatedZoneIds).length;

    // 要施術ゾーン
    var overdueZones = getOverdueZones(zones, records, settings);
    var overdueCount = overdueZones.length;

    // スケジュール内（施術済かつoverdueでない）
    var overdueIds = {};
    for (var j = 0; j < overdueZones.length; j++) {
      overdueIds[overdueZones[j].zone.id] = true;
    }
    var onScheduleCount = 0;
    var treatedKeys = Object.keys(treatedZoneIds);
    for (var k = 0; k < treatedKeys.length; k++) {
      if (!overdueIds[treatedKeys[k]]) {
        onScheduleCount++;
      }
    }

    // 平均施術間隔（全ゾーンの間隔の平均）
    var totalIntervals = 0;
    var intervalCount = 0;
    for (var z = 0; z < zones.length; z++) {
      var zoneRecords = filterByZone(records, zones[z].id);
      var avgInterval = getZoneAverageInterval(zoneRecords);
      if (avgInterval !== null) {
        totalIntervals += avgInterval;
        intervalCount++;
      }
    }
    var overallAvgInterval = intervalCount > 0 ? Math.round(totalIntervals / intervalCount) : null;

    var html = '<div class="summary-grid">';
    html += '<div class="summary-card"><div class="summary-value">' + treatedCount + '/' + totalZoneCount + '</div><div class="summary-label">施術済</div></div>';
    html += '<div class="summary-card overdue"><div class="summary-value">' + overdueCount + '</div><div class="summary-label">要施術</div></div>';
    html += '<div class="summary-card"><div class="summary-value">' + onScheduleCount + '</div><div class="summary-label">スケジュール内</div></div>';
    html += '<div class="summary-card"><div class="summary-value">' + (overallAvgInterval !== null ? overallAvgInterval + '日' : '-') + '</div><div class="summary-label">平均間隔</div></div>';
    html += '</div>';

    container.innerHTML = html;
  }

  // =========================================================
  // Batch Save - 一括保存ロジック
  // =========================================================

  /**
   * 複数ゾーンに対して一括でレコードを保存する
   * @param {string[]} zoneIds - 保存対象ゾーンID配列
   * @param {string} date - 施術日 YYYY-MM-DD
   * @param {number} intensity - 強度 1-5
   * @param {string|null} memo - メモ
   * @returns {{ success: boolean, records: Array }}
   */
  function batchSaveRecords(zoneIds, date, intensity, memo, photo) {
    var records = [];
    for (var i = 0; i < zoneIds.length; i++) {
      var record = {
        id: crypto.randomUUID(),
        zone_id: zoneIds[i],
        date: date,
        intensity: intensity,
        memo: memo,
        photo: photo || null,
        created_at: new Date().toISOString()
      };
      records.push(record);
    }

    // 既存レコードを取得して追加
    var existing = StorageManager.getRecords();
    var allRecords = existing.concat(records);
    var result = safeSave(STORAGE_KEYS.RECORDS, allRecords);

    if (result.success) {
      invalidateStatsCache();
      return { success: true, records: records };
    } else {
      return { success: false, records: [] };
    }
  }

  // =========================================================
  // Photo Compressor - 写真圧縮
  // =========================================================

  var PhotoCompressor = {
    /**
     * 画像ファイルをリサイズ・圧縮する
     * @param {File} file - 画像ファイル
     * @param {number} maxWidth - 最大幅（デフォルト800）
     * @param {number} maxSizeKB - 最大サイズKB（デフォルト500）
     * @param {number} quality - JPEG品質（デフォルト0.8）
     * @returns {Promise<string|null>} base64 data URI or null if size exceeds limit
     */
    compress: function(file, maxWidth, maxSizeKB, quality) {
      if (typeof maxWidth === 'undefined') maxWidth = 800;
      if (typeof maxSizeKB === 'undefined') maxSizeKB = 500;
      if (typeof quality === 'undefined') quality = 0.8;

      return new Promise(function(resolve) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.onload = function() {
            // Calculate new dimensions
            var width = img.width;
            var height = img.height;
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }

            // Draw to canvas
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64
            var dataUrl = canvas.toDataURL('image/jpeg', quality);

            // Check size using same logic as getBase64Size
            var base64Data = dataUrl.split(',')[1] || '';
            var padding = 0;
            if (base64Data.endsWith('==')) padding = 2;
            else if (base64Data.endsWith('=')) padding = 1;
            var sizeBytes = Math.ceil(base64Data.length * 3 / 4) - padding;
            var sizeKB = sizeBytes / 1024;

            if (sizeKB > maxSizeKB) {
              resolve(null);
            } else {
              resolve(dataUrl);
            }
          };
          img.onerror = function() {
            resolve(null);
          };
          img.src = e.target.result;
        };
        reader.onerror = function() {
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    },

    /**
     * Base64文字列の実際のバイトサイズを計算する
     * @param {string} base64String - base64 data URI文字列
     * @returns {number} バイト数
     */
    getBase64Size: function(base64String) {
      if (!base64String) return 0;
      // Remove data URI prefix if present
      var base64Data = base64String;
      var commaIndex = base64String.indexOf(',');
      if (commaIndex !== -1) {
        base64Data = base64String.substring(commaIndex + 1);
      }
      if (base64Data.length === 0) return 0;
      // Calculate padding
      var padding = 0;
      if (base64Data.endsWith('==')) padding = 2;
      else if (base64Data.endsWith('=')) padding = 1;
      return Math.ceil(base64Data.length * 3 / 4) - padding;
    }
  };

  // =========================================================
  // Helper Functions
  // =========================================================

  /**
   * 今日の日付をYYYY-MM-DD形式で返す
   */
  function getTodayString() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  /**
   * トースト通知を表示
   * @param {string} message
   * @param {string} type - 'success', 'error', 'info'
   */
  function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * 初期化
   */
  function init() {
    // タブバーのクリックイベント
    var tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
      tabBar.addEventListener('click', function(e) {
        var button = e.target.closest('button[data-tab]');
        if (button) {
          var tabName = button.dataset.tab;
          window.location.hash = TAB_HASH_MAP[tabName] || '#map';
        }
      });
    }

    // ハッシュ変更イベント
    window.addEventListener('hashchange', handleHashChange);

    // 初期表示
    handleHashChange();

    // Body Map初期化 - 前面・背面同時表示
    BodyMapRenderer.init('body-map-container-front', 'front');
    BodyMapRendererBack = Object.create(BodyMapRenderer);
    BodyMapRendererBack._containerId = null;
    BodyMapRendererBack._svgEl = null;
    BodyMapRendererBack._zones = [];
    BodyMapRendererBack._selectedZones = [];
    BodyMapRendererBack._multiSelectMode = false;
    BodyMapRendererBack.init('body-map-container-back', 'back');

    // スワイプ選択の初期化
    initSwipeSelection();

    // モーダル初期化
    TreatmentModal.init();

    // 複数選択マネージャ初期化
    MultiSelectManager.init();

    // タップコールバック: 単一ゾーンタップ → モーダル表示 or 複数選択トグル
    BodyMapRenderer.onZoneTap(function(zoneId, zoneName) {
      if (MultiSelectManager.isActive()) {
        // 複数選択モードならゾーンをトグル
        MultiSelectManager.toggleZone(zoneId, zoneName);
      } else {
        // 単一ゾーンタップ → モーダル表示
        TreatmentModal.open(zoneId, zoneName);
      }
    });

    // 長押しコールバック: 複数選択モード開始
    BodyMapRenderer.onZoneLongPress(function(zoneId, zoneName) {
      if (!MultiSelectManager.isActive()) {
        MultiSelectManager.activate();
        // 長押しされたゾーンを最初の選択に追加
        MultiSelectManager.toggleZone(zoneId, zoneName);
      }
    });

    // モーダル確定コールバック
    TreatmentModal.onConfirm(function(data) {
      if (data.isBatchMode) {
        // 一括保存 - スワイプ選択からゾーンIDを取得
        var zoneIds = _swipeSelectedZones.map(function(z) { return z.id; });
        if (zoneIds.length === 0) {
          var selectedZones = BodyMapRenderer.getSelectedZones();
          zoneIds = selectedZones.map(function(z) { return z.id; });
        }
        var result = batchSaveRecords(zoneIds, data.date, data.intensity, data.memo, data.photo || null);
        if (result.success) {
          showToast(result.records.length + '件の施術記録を保存しました', 'success');
          clearSwipeSelection();
          MultiSelectManager.deactivate();
          refreshColors();
        } else {
          showToast('保存に失敗しました', 'error');
        }
      } else {
        // 単一ゾーン保存
        var record = {
          id: crypto.randomUUID(),
          zone_id: data.zoneId,
          date: data.date,
          intensity: data.intensity,
          memo: data.memo,
          photo: data.photo || null,
          created_at: new Date().toISOString()
        };
        var saveResult = StorageManager.saveRecord(record);
        if (saveResult.success) {
          showToast('施術記録を保存しました', 'success');
          clearSwipeSelection();
          refreshColors();
        } else {
          showToast('保存に失敗しました: ' + (saveResult.error || ''), 'error');
        }
      }
    });

    // ヒートマップ色を適用
    refreshColors();
  }

  // DOM読み込み完了後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // テスト用にエクスポート
  if (typeof window !== 'undefined') {
    window._HairRemovalTracker = {
      calculateHeatColor: calculateHeatColor,
      buildColorMap: buildColorMap,
      isOverdue: isOverdue,
      refreshColors: refreshColors,
      StorageManager: StorageManager,
      BodyMapRenderer: BodyMapRenderer,
      batchSaveRecords: batchSaveRecords,
      sortRecordsByDate: sortRecordsByDate,
      filterByZone: filterByZone,
      filterByDateRange: filterByDateRange,
      getZoneTreatmentCount: getZoneTreatmentCount,
      getZoneAverageInterval: getZoneAverageInterval,
      getZoneNameById: getZoneNameById,
      renderHistoryTab: renderHistoryTab,
      getZoneHistoryInfo: getZoneHistoryInfo,
      getOverdueZones: getOverdueZones,
      getNextTreatmentDate: getNextTreatmentDate,
      getMonthlyStats: getMonthlyStats,
      getTopZones: getTopZones,
      getAverageIntensity: getAverageIntensity,
      getCoverageRate: getCoverageRate,
      getIntensityDistribution: getIntensityDistribution,
      renderStatsTab: renderStatsTab,
      invalidateStatsCache: invalidateStatsCache,
      exportAll: function() { return StorageManager.exportAll(); },
      validateImportData: function(json) { return StorageManager.validateImportData(json); },
      mergeRecords: mergeRecords,
      handleExport: handleExport,
      importData: function(json, mode) { return StorageManager.importData(json, mode); },
      handleImport: handleImport,
      resetAll: function() { return StorageManager.resetAll(); },
      handleReset: handleReset,
      PhotoCompressor: PhotoCompressor,
      renderPhotoStorageUsage: renderPhotoStorageUsage,
      renderSettingsTab: renderSettingsTab,
      switchTab: switchTab
    };
  }
})();
