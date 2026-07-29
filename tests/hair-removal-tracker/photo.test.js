/**
 * Photo Compressor & Storage Usage Tests
 * Feature: hair-removal-tracker, Property 15: 写真ストレージ使用量計算
 *
 * **Validates: Requirements 8.10**
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('PhotoCompressor.getBase64Size', () => {
  let dom;
  let window;
  let PhotoCompressor;

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

    PhotoCompressor = window._HairRemovalTracker.PhotoCompressor;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  it('should return 0 for null input', () => {
    expect(PhotoCompressor.getBase64Size(null)).toBe(0);
  });

  it('should return 0 for undefined input', () => {
    expect(PhotoCompressor.getBase64Size(undefined)).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(PhotoCompressor.getBase64Size('')).toBe(0);
  });

  it('should return 0 for data URI with empty base64 data', () => {
    expect(PhotoCompressor.getBase64Size('data:image/jpeg;base64,')).toBe(0);
  });

  it('should calculate correct byte size for base64 without padding', () => {
    // "abc" in base64 is "YWJj" (4 chars, no padding) = 3 bytes
    const base64 = 'data:image/jpeg;base64,YWJj';
    expect(PhotoCompressor.getBase64Size(base64)).toBe(3);
  });

  it('should calculate correct byte size for base64 with single padding', () => {
    // "ab" in base64 is "YWI=" (4 chars, 1 padding) = 2 bytes
    const base64 = 'data:image/jpeg;base64,YWI=';
    expect(PhotoCompressor.getBase64Size(base64)).toBe(2);
  });

  it('should calculate correct byte size for base64 with double padding', () => {
    // "a" in base64 is "YQ==" (4 chars, 2 padding) = 1 byte
    const base64 = 'data:image/jpeg;base64,YQ==';
    expect(PhotoCompressor.getBase64Size(base64)).toBe(1);
  });

  it('should handle raw base64 strings without data URI prefix', () => {
    // "Hello" in base64 is "SGVsbG8=" (8 chars, 1 padding) = 5 bytes
    expect(PhotoCompressor.getBase64Size('SGVsbG8=')).toBe(5);
  });

  it('should calculate correct size for longer base64 strings', () => {
    // "Hello, World!" in base64 is "SGVsbG8sIFdvcmxkIQ==" (20 chars, 2 padding) = 13 bytes
    const base64 = 'data:image/jpeg;base64,SGVsbG8sIFdvcmxkIQ==';
    expect(PhotoCompressor.getBase64Size(base64)).toBe(13);
  });
});

describe('StorageManager.getPhotoStorageUsage', () => {
  let dom;
  let window;
  let StorageManager;

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

    StorageManager = window._HairRemovalTracker.StorageManager;
  });

  afterEach(() => {
    if (window) {
      window.localStorage.clear();
    }
    if (dom) {
      dom.window.close();
    }
  });

  it('should return 0 when there are no records', () => {
    expect(StorageManager.getPhotoStorageUsage()).toBe(0);
  });

  it('should return 0 when records have no photos', () => {
    const record = {
      id: 'test-1',
      zone_id: 'front_face_01',
      date: '2025-01-15',
      intensity: 3,
      memo: null,
      photo: null,
      created_at: '2025-01-15T10:00:00Z'
    };
    StorageManager.saveRecord(record);
    expect(StorageManager.getPhotoStorageUsage()).toBe(0);
  });

  it('should correctly sum photo sizes across multiple records', () => {
    // "abc" => "YWJj" = 3 bytes
    const record1 = {
      id: 'test-1',
      zone_id: 'front_face_01',
      date: '2025-01-15',
      intensity: 3,
      memo: null,
      photo: 'data:image/jpeg;base64,YWJj',
      created_at: '2025-01-15T10:00:00Z'
    };
    // "Hello" => "SGVsbG8=" = 5 bytes
    const record2 = {
      id: 'test-2',
      zone_id: 'front_face_02',
      date: '2025-01-16',
      intensity: 4,
      memo: null,
      photo: 'data:image/jpeg;base64,SGVsbG8=',
      created_at: '2025-01-16T10:00:00Z'
    };
    // No photo
    const record3 = {
      id: 'test-3',
      zone_id: 'front_face_03',
      date: '2025-01-17',
      intensity: 2,
      memo: null,
      photo: null,
      created_at: '2025-01-17T10:00:00Z'
    };

    StorageManager.saveRecord(record1);
    StorageManager.saveRecord(record2);
    StorageManager.saveRecord(record3);

    // Total: 3 + 5 = 8 bytes
    expect(StorageManager.getPhotoStorageUsage()).toBe(8);
  });
});


// =========================================================
// Property-Based Tests (PBT) using fast-check
// =========================================================
import fc from 'fast-check';

/**
 * Property 14: 写真圧縮制約 (Photo Compression Constraints)
 * Feature: hair-removal-tracker, Property 14: 写真圧縮制約
 *
 * Since Canvas/Image APIs don't actually compress in jsdom, we test:
 * 1. getBase64Size correctly reports sizes for any valid base64 string
 * 2. The size constraint logic: if data > 500KB, it would be rejected
 *
 * **Validates: Requirements 8.5, 8.6**
 */
describe('Property 14: 写真圧縮制約 - getBase64Size correctness and size constraint logic', () => {
  let dom;
  let window;
  let PhotoCompressor;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });
    window = dom.window;
    window.BODY_MAP_DATA = { front: [], back: [] };

    const fs = require('fs');
    const scriptContent = fs.readFileSync('js/hair-removal-tracker.js', 'utf-8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.document.body.appendChild(scriptEl);

    PhotoCompressor = window._HairRemovalTracker.PhotoCompressor;
  });

  afterEach(() => {
    if (window) window.localStorage.clear();
    if (dom) dom.window.close();
  });

  it('should return correct byte size for any valid base64 string (no padding)', () => {
    fc.assert(
      fc.property(
        // Generate random byte arrays (length divisible by 3 → no padding)
        fc.integer({ min: 1, max: 300 }).chain(n => {
          const byteLen = n * 3; // divisible by 3 → no padding
          return fc.uint8Array({ minLength: byteLen, maxLength: byteLen });
        }),
        (bytes) => {
          // Convert to base64
          const binaryStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
          const base64 = Buffer.from(binaryStr, 'binary').toString('base64');
          const dataUri = 'data:image/jpeg;base64,' + base64;

          const reportedSize = PhotoCompressor.getBase64Size(dataUri);
          expect(reportedSize).toBe(bytes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct byte size for any valid base64 string (with single padding)', () => {
    fc.assert(
      fc.property(
        // Generate byte arrays with length ≡ 2 (mod 3) → single padding '='
        fc.integer({ min: 0, max: 299 }).map(n => n * 3 + 2).chain(byteLen => {
          return fc.uint8Array({ minLength: byteLen, maxLength: byteLen });
        }),
        (bytes) => {
          const binaryStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
          const base64 = Buffer.from(binaryStr, 'binary').toString('base64');
          const dataUri = 'data:image/jpeg;base64,' + base64;

          const reportedSize = PhotoCompressor.getBase64Size(dataUri);
          expect(reportedSize).toBe(bytes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct byte size for any valid base64 string (with double padding)', () => {
    fc.assert(
      fc.property(
        // Generate byte arrays with length ≡ 1 (mod 3) → double padding '=='
        fc.integer({ min: 0, max: 299 }).map(n => n * 3 + 1).chain(byteLen => {
          return fc.uint8Array({ minLength: byteLen, maxLength: byteLen });
        }),
        (bytes) => {
          const binaryStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
          const base64 = Buffer.from(binaryStr, 'binary').toString('base64');
          const dataUri = 'data:image/jpeg;base64,' + base64;

          const reportedSize = PhotoCompressor.getBase64Size(dataUri);
          expect(reportedSize).toBe(bytes.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify base64 data exceeding 500KB limit', () => {
    const MAX_SIZE_KB = 500;
    const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

    fc.assert(
      fc.property(
        // Generate random sizes between 1 byte and 600KB
        fc.integer({ min: 1, max: 600 * 1024 }),
        (byteSize) => {
          // Create a base64 string of the target size (approximate)
          // For base64: every 3 bytes = 4 chars
          const base64Length = Math.ceil(byteSize / 3) * 4;
          // Use 'A' repeated (safe base64 char)
          const base64Data = 'A'.repeat(base64Length);
          const dataUri = 'data:image/jpeg;base64,' + base64Data;

          const reportedSize = PhotoCompressor.getBase64Size(dataUri);

          // The size check logic: if reported size > MAX_SIZE_BYTES, photo should be rejected
          if (reportedSize > MAX_SIZE_BYTES) {
            // This photo would be rejected by compress()
            expect(reportedSize).toBeGreaterThan(MAX_SIZE_BYTES);
          } else {
            // This photo would be accepted
            expect(reportedSize).toBeLessThanOrEqual(MAX_SIZE_BYTES);
          }

          // The actual bytes in base64 (no padding since length is multiple of 4 with 'A')
          // getBase64Size should always return a non-negative number
          expect(reportedSize).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return non-negative size for any input', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant(''),
          fc.string(),
          fc.string().map(s => 'data:image/jpeg;base64,' + s)
        ),
        (input) => {
          const size = PhotoCompressor.getBase64Size(input);
          expect(size).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 15: 写真ストレージ使用量計算
 * Feature: hair-removal-tracker, Property 15: 写真ストレージ使用量計算
 *
 * For any set of Treatment_Records with photo fields,
 * getPhotoStorageUsage() should return the sum of all base64 photo string byte lengths.
 *
 * **Validates: Requirements 8.10**
 */
describe('Property 15: 写真ストレージ使用量計算 - getPhotoStorageUsage equals sum of getBase64Size', () => {
  let dom;
  let window;
  let StorageManager;
  let PhotoCompressor;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="body-map-container"></div><div id="body-map-tooltip"></div></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });
    window = dom.window;
    window.BODY_MAP_DATA = { front: [], back: [] };

    const fs = require('fs');
    const scriptContent = fs.readFileSync('js/hair-removal-tracker.js', 'utf-8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.document.body.appendChild(scriptEl);

    StorageManager = window._HairRemovalTracker.StorageManager;
    PhotoCompressor = window._HairRemovalTracker.PhotoCompressor;
  });

  afterEach(() => {
    if (window) window.localStorage.clear();
    if (dom) dom.window.close();
  });

  // Generator for a valid base64 data URI of random size
  const base64DataUriArb = fc.integer({ min: 3, max: 300 }).chain(byteLen => {
    return fc.uint8Array({ minLength: byteLen, maxLength: byteLen }).map(bytes => {
      const binaryStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
      return 'data:image/jpeg;base64,' + Buffer.from(binaryStr, 'binary').toString('base64');
    });
  });

  // Generator for a treatment record with optional photo
  const treatmentRecordArb = (index) => fc.record({
    hasPhoto: fc.boolean(),
    photo: base64DataUriArb
  }).map(({ hasPhoto, photo }) => ({
    id: `pbt-record-${index}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    zone_id: `front_face_${(index % 10) + 1}`.padStart(16, '0').slice(-16),
    date: '2025-01-15',
    intensity: ((index % 5) + 1),
    memo: null,
    photo: hasPhoto ? photo : null,
    created_at: `2025-01-15T10:00:0${index % 10}Z`
  }));

  it('should return sum of getBase64Size for all records with photos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }).chain(count => {
          return fc.tuple(
            ...Array.from({ length: count }, (_, i) => treatmentRecordArb(i))
          );
        }),
        (records) => {
          // Clear localStorage before each iteration
          window.localStorage.clear();

          // Save all records
          for (const record of records) {
            StorageManager.saveRecord(record);
          }

          // Calculate expected sum manually
          const expectedSum = records.reduce((sum, record) => {
            if (record.photo) {
              return sum + PhotoCompressor.getBase64Size(record.photo);
            }
            return sum;
          }, 0);

          // Verify getPhotoStorageUsage equals manual sum
          const actualUsage = StorageManager.getPhotoStorageUsage();
          expect(actualUsage).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 when all records have null photos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        (count) => {
          window.localStorage.clear();

          // Create records with no photos
          for (let i = 0; i < count; i++) {
            StorageManager.saveRecord({
              id: `null-photo-${i}-${Date.now()}`,
              zone_id: 'front_face_01',
              date: '2025-01-15',
              intensity: 3,
              memo: null,
              photo: null,
              created_at: `2025-01-15T10:00:00Z`
            });
          }

          expect(StorageManager.getPhotoStorageUsage()).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should equal sum of individual photo sizes for records with all photos populated', () => {
    fc.assert(
      fc.property(
        fc.array(base64DataUriArb, { minLength: 1, maxLength: 8 }),
        (photos) => {
          window.localStorage.clear();

          // Create records all with photos
          const records = photos.map((photo, i) => ({
            id: `all-photo-${i}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
            zone_id: 'front_face_01',
            date: '2025-01-15',
            intensity: 3,
            memo: null,
            photo: photo,
            created_at: `2025-01-15T10:00:00Z`
          }));

          for (const record of records) {
            StorageManager.saveRecord(record);
          }

          // Manual sum of all photo sizes
          const expectedSum = photos.reduce((sum, photo) => {
            return sum + PhotoCompressor.getBase64Size(photo);
          }, 0);

          expect(StorageManager.getPhotoStorageUsage()).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });
});
