/**
 * Date helpers that respect the difference between a calendar date and an
 * instant. A native `<input type="date">` yields `YYYY-MM-DD`; `new Date()` on
 * that string parses it as midnight UTC, which in Pacific time displays as the
 * previous day. Parse date-only strings as local calendar dates instead.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value);
}

/** Parses an ISO date-only or date-time string. Date-only values are local calendar dates. */
export function parseDateInput(value: string | undefined | null): Date | null {
  if (!value) return null;
  const match = value.match(DATE_ONLY);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a stored date for display. Date-only values never shift by timezone;
 * date-time values format in the viewer's zone.
 */
export function formatDateValue(
  value: string | undefined | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'en-US'
): string {
  if (!value) return '—';
  const date = parseDateInput(value);
  if (!date) return value;
  return date.toLocaleString(locale, options);
}
