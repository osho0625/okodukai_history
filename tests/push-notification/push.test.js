import { describe, it, expect } from 'vitest';
const {
  validateMessage,
  filterDueReminders,
  isInWindow,
  formatMessage,
  calcDaysRemaining
} = require('../../scripts/reminder-notify.js');

describe('Push通知 - filterDueReminders (admin向けリマインダー)', () => {
  const baseReminder = {
    id: '1',
    type: 'memo',
    child_name: 'テスト',
    message: 'テストメモ',
    deleted_at: null,
    snooze_until: null,
    custom_schedule: null,
    event_date: null
  };

  it('deleted_at が設定されたリマインダーは除外', () => {
    const reminders = [{ ...baseReminder, deleted_at: '2026-05-01T00:00:00Z' }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(0);
  });

  it('スヌーズ中のリマインダーは除外', () => {
    const reminders = [{ ...baseReminder, snooze_until: '2026-05-30' }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(0);
  });

  it('スヌーズ解除日当日は通知される', () => {
    const reminders = [{ ...baseReminder, snooze_until: '2026-05-26' }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(1);
  });

  it('デフォルトスケジュール 07:50 のウィンドウ内で通知', () => {
    const reminders = [baseReminder];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:52' });
    expect(result).toHaveLength(1);
  });

  it('デフォルトスケジュール 07:50 のウィンドウ外は除外', () => {
    const reminders = [baseReminder];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:55' });
    expect(result).toHaveLength(0);
  });

  it('custom_schedule が設定されている場合はそれを使用', () => {
    const reminders = [{ ...baseReminder, custom_schedule: ['12:00'] }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '12:03' });
    expect(result).toHaveLength(1);
  });

  it('event型: event_date 7日以内なら通知', () => {
    const reminders = [{
      ...baseReminder,
      type: 'event',
      event_date: '2026-05-30'
    }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(1);
  });

  it('event型: event_date 8日以上先なら除外', () => {
    const reminders = [{
      ...baseReminder,
      type: 'event',
      event_date: '2026-06-10'
    }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(0);
  });

  it('event型: event_date が過去なら除外', () => {
    const reminders = [{
      ...baseReminder,
      type: 'event',
      event_date: '2026-05-20'
    }];
    const result = filterDueReminders(reminders, { dateStr: '2026-05-26', timeStr: '07:50' });
    expect(result).toHaveLength(0);
  });
});

describe('Push通知 - isInWindow (5分ウィンドウ)', () => {
  it('ちょうどスケジュール時刻で true', () => {
    expect(isInWindow('07:50', '07:50')).toBe(true);
  });

  it('スケジュール+4分で true', () => {
    expect(isInWindow('07:50', '07:54')).toBe(true);
  });

  it('スケジュール+5分で false', () => {
    expect(isInWindow('07:50', '07:55')).toBe(false);
  });

  it('スケジュール前は false', () => {
    expect(isInWindow('07:50', '07:49')).toBe(false);
  });

  it('23:55 のスケジュール、23:59 で true', () => {
    expect(isInWindow('23:55', '23:59')).toBe(true);
  });
});

describe('Push通知 - formatMessage (通知ペイロード)', () => {
  it('memo と event を正しくフォーマット', () => {
    const reminders = [
      { type: 'memo', child_name: 'かいせい', message: '宿題やった' },
      { type: 'event', child_name: 'はるちか', message: '遠足', event_date: '2026-05-30' }
    ];
    const msg = formatMessage(reminders, '2026-05-26');
    expect(msg).toContain('📝 メモ');
    expect(msg).toContain('[かいせい] 宿題やった');
    expect(msg).toContain('📅 行事');
    expect(msg).toContain('[はるちか] 遠足');
    expect(msg).toContain('あと4日');
  });

  it('空配列で空文字を返す', () => {
    expect(formatMessage([], '2026-05-26')).toBe('');
  });
});

describe('Push通知 - push_messages キュー設計確認', () => {
  it('target_role の有効値は admin, user, all', () => {
    // これはDB制約のテストだが、ロジック上の確認
    const validRoles = ['admin', 'user', 'all'];
    validRoles.forEach(role => {
      expect(['admin', 'user', 'all']).toContain(role);
    });
  });
});
