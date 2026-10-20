import { describe, expect, it } from 'vitest';
import { formatDateValue, parseDateInput } from '../../src/lib/dates';

// Solano County is Pacific time; the bug only shows west of UTC.
process.env.TZ = 'America/Los_Angeles';

describe('parseDateInput', () => {
  it('treats a YYYY-MM-DD value as a local calendar date', () => {
    const date = parseDateInput('2026-10-20');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(20);
  });

  it('still parses full timestamps as instants', () => {
    const date = parseDateInput('2026-10-19T21:33:00.000Z');
    expect(date?.toISOString()).toBe('2026-10-19T21:33:00.000Z');
  });

  it('returns null for garbage and empty values', () => {
    expect(parseDateInput('not a date')).toBeNull();
    expect(parseDateInput('')).toBeNull();
    expect(parseDateInput(undefined)).toBeNull();
  });
});

describe('formatDateValue', () => {
  it('does not shift a date-only value to the previous day in Pacific time', () => {
    expect(formatDateValue('2026-10-20')).toBe('Oct 20, 2026');
  });

  it('formats timestamps in the viewer zone', () => {
    expect(formatDateValue('2026-10-20T03:30:00.000Z', { dateStyle: 'medium', timeStyle: 'short' })).toBe(
      'Oct 19, 2026, 8:30 PM'
    );
  });

  it('shows a dash for missing values and echoes unparseable ones', () => {
    expect(formatDateValue(undefined)).toBe('—');
    expect(formatDateValue('soon')).toBe('soon');
  });
});
