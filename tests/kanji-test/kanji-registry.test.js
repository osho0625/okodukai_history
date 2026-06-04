/**
 * @vitest-environment jsdom
 */
/**
 * Unit tests for KanjiRegistry — TestRange/KanjiEntry CRUD
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2
 */
import { describe, it, expect, beforeEach } from 'vitest';

const {
  createRange,
  updateRange,
  deleteRange,
  getAllRanges,
  addEntry,
  deleteEntry,
  getEntriesByRange,
  _isBlank,
  _RANGES_KEY,
  _ENTRIES_KEY_PREFIX,
} = require('../../js/kanji-registry.js');

describe('KanjiRegistry: TestRange CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('createRange creates a new range and persists to localStorage', () => {
    const range = createRange('漢字テスト1');
    expect(range).not.toBeNull();
    expect(range.name).toBe('漢字テスト1');
    expect(range.id).toBeTruthy();
    expect(range.createdAt).toBeTruthy();

    // Verify persistence
    const stored = JSON.parse(localStorage.getItem(_RANGES_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('漢字テスト1');
  });

  it('createRange trims whitespace from name', () => {
    const range = createRange('  漢字テスト  ');
    expect(range.name).toBe('漢字テスト');
  });

  it('createRange rejects empty string', () => {
    const result = createRange('');
    expect(result).toBeNull();
    expect(getAllRanges()).toHaveLength(0);
  });

  it('createRange rejects whitespace-only string', () => {
    const result = createRange('   ');
    expect(result).toBeNull();
    expect(getAllRanges()).toHaveLength(0);
  });

  it('updateRange updates the name of an existing range', () => {
    const range = createRange('テスト1');
    const success = updateRange(range.id, 'テスト更新');
    expect(success).toBe(true);

    const ranges = getAllRanges();
    expect(ranges[0].name).toBe('テスト更新');
  });

  it('updateRange rejects empty name', () => {
    const range = createRange('テスト1');
    const success = updateRange(range.id, '');
    expect(success).toBe(false);

    const ranges = getAllRanges();
    expect(ranges[0].name).toBe('テスト1');
  });

  it('updateRange returns false for non-existent id', () => {
    const success = updateRange('non-existent-id', '新しい名前');
    expect(success).toBe(false);
  });

  it('deleteRange removes range and its entries', () => {
    const range = createRange('削除テスト');
    addEntry(range.id, 'よむ', '読');

    const success = deleteRange(range.id);
    expect(success).toBe(true);
    expect(getAllRanges()).toHaveLength(0);
    expect(getEntriesByRange(range.id)).toHaveLength(0);
    expect(localStorage.getItem(_ENTRIES_KEY_PREFIX + range.id)).toBeNull();
  });

  it('deleteRange returns false for non-existent id', () => {
    const success = deleteRange('non-existent-id');
    expect(success).toBe(false);
  });

  it('getAllRanges returns all saved ranges', () => {
    createRange('範囲A');
    createRange('範囲B');
    createRange('範囲C');

    const ranges = getAllRanges();
    expect(ranges).toHaveLength(3);
    expect(ranges.map(r => r.name)).toEqual(['範囲A', '範囲B', '範囲C']);
  });

  it('getAllRanges returns empty array when no ranges exist', () => {
    expect(getAllRanges()).toEqual([]);
  });
});

describe('KanjiRegistry: KanjiEntry CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('addEntry creates an entry in the specified range', () => {
    const range = createRange('テスト範囲');
    const entry = addEntry(range.id, 'よむ', '読');

    expect(entry).not.toBeNull();
    expect(entry.rangeId).toBe(range.id);
    expect(entry.reading).toBe('よむ');
    expect(entry.answer).toBe('読');
    expect(entry.id).toBeTruthy();
  });

  it('addEntry trims whitespace from reading and answer', () => {
    const range = createRange('テスト範囲');
    const entry = addEntry(range.id, '  よむ  ', '  読  ');

    expect(entry.reading).toBe('よむ');
    expect(entry.answer).toBe('読');
  });

  it('addEntry rejects empty reading', () => {
    const range = createRange('テスト範囲');
    const result = addEntry(range.id, '', '読');
    expect(result).toBeNull();
    expect(getEntriesByRange(range.id)).toHaveLength(0);
  });

  it('addEntry rejects empty answer', () => {
    const range = createRange('テスト範囲');
    const result = addEntry(range.id, 'よむ', '');
    expect(result).toBeNull();
    expect(getEntriesByRange(range.id)).toHaveLength(0);
  });

  it('addEntry rejects whitespace-only reading', () => {
    const range = createRange('テスト範囲');
    const result = addEntry(range.id, '   ', '読');
    expect(result).toBeNull();
  });

  it('addEntry rejects whitespace-only answer', () => {
    const range = createRange('テスト範囲');
    const result = addEntry(range.id, 'よむ', '   ');
    expect(result).toBeNull();
  });

  it('addEntry returns null for non-existent rangeId', () => {
    const result = addEntry('non-existent', 'よむ', '読');
    expect(result).toBeNull();
  });

  it('deleteEntry removes the specified entry', () => {
    const range = createRange('テスト範囲');
    const entry1 = addEntry(range.id, 'よむ', '読');
    const entry2 = addEntry(range.id, 'かく', '書');

    const success = deleteEntry(range.id, entry1.id);
    expect(success).toBe(true);

    const entries = getEntriesByRange(range.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(entry2.id);
  });

  it('deleteEntry returns false for non-existent entryId', () => {
    const range = createRange('テスト範囲');
    const success = deleteEntry(range.id, 'non-existent');
    expect(success).toBe(false);
  });

  it('getEntriesByRange returns all entries for a range', () => {
    const range = createRange('テスト範囲');
    addEntry(range.id, 'よむ', '読');
    addEntry(range.id, 'かく', '書');
    addEntry(range.id, 'はなす', '話');

    const entries = getEntriesByRange(range.id);
    expect(entries).toHaveLength(3);
    expect(entries.map(e => e.reading)).toEqual(['よむ', 'かく', 'はなす']);
  });

  it('getEntriesByRange returns empty array for non-existent range', () => {
    expect(getEntriesByRange('non-existent')).toEqual([]);
  });

  it('entries are stored per-range in separate localStorage keys', () => {
    const range1 = createRange('範囲A');
    const range2 = createRange('範囲B');

    addEntry(range1.id, 'よむ', '読');
    addEntry(range2.id, 'かく', '書');

    const key1 = _ENTRIES_KEY_PREFIX + range1.id;
    const key2 = _ENTRIES_KEY_PREFIX + range2.id;

    const stored1 = JSON.parse(localStorage.getItem(key1));
    const stored2 = JSON.parse(localStorage.getItem(key2));

    expect(stored1).toHaveLength(1);
    expect(stored1[0].reading).toBe('よむ');
    expect(stored2).toHaveLength(1);
    expect(stored2[0].reading).toBe('かく');
  });
});

describe('KanjiRegistry: Validation helper', () => {
  it('isBlank returns true for empty string', () => {
    expect(_isBlank('')).toBe(true);
  });

  it('isBlank returns true for whitespace-only', () => {
    expect(_isBlank('   ')).toBe(true);
    expect(_isBlank('\t\n')).toBe(true);
  });

  it('isBlank returns true for non-string types', () => {
    expect(_isBlank(null)).toBe(true);
    expect(_isBlank(undefined)).toBe(true);
    expect(_isBlank(123)).toBe(true);
  });

  it('isBlank returns false for non-empty string', () => {
    expect(_isBlank('hello')).toBe(false);
    expect(_isBlank(' a ')).toBe(false);
  });
});
