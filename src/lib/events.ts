import type { Event } from './definitions';

/**
 * Pure helpers over the Event list. Events store `date` as a display string
 * ("January 15, 2026") and `time` as free text, so parsing is best-effort.
 */

export function parseEventDate(event: Pick<Event, 'date' | 'time'>): Date | null {
  if (!event.date) return null;
  const base = new Date(event.date);
  if (Number.isNaN(base.getTime())) return null;

  // Try to fold the start time in ("6:00 PM", "6pm", "18:00", "6:00 PM - 8:00 PM").
  const match = event.time?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      base.setHours(hours, minutes, 0, 0);
      return base;
    }
  }
  // No parseable time: treat the event as running through the end of its day.
  base.setHours(23, 59, 59, 999);
  return base;
}

export function isUpcoming(event: Event, now = new Date()): boolean {
  const when = parseEventDate(event);
  return when !== null && when.getTime() >= now.getTime();
}

/** Published events that haven't happened yet, soonest first. */
export function upcomingEvents(events: Event[], now = new Date()): Event[] {
  return events
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => (parseEventDate(a)?.getTime() ?? 0) - (parseEventDate(b)?.getTime() ?? 0));
}

/** Events that already happened, most recent first. */
export function pastEvents(events: Event[], now = new Date()): Event[] {
  return events
    .filter((e) => !isUpcoming(e, now) && parseEventDate(e) !== null)
    .sort((a, b) => (parseEventDate(b)?.getTime() ?? 0) - (parseEventDate(a)?.getTime() ?? 0));
}

/** The event to spotlight: an admin-featured upcoming event, else the soonest one. */
export function pickSpotlightEvent(events: Event[], now = new Date()): Event | undefined {
  const upcoming = upcomingEvents(events, now);
  return upcoming.find((e) => e.featured) ?? upcoming[0];
}

export function splitDate(event: Pick<Event, 'date' | 'time'>): { month: string; day: string; weekday: string } {
  const when = parseEventDate(event);
  if (!when) return { month: '—', day: '—', weekday: '' };
  return {
    month: when.toLocaleDateString('en-US', { month: 'short' }),
    day: when.toLocaleDateString('en-US', { day: 'numeric' }),
    weekday: when.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Google Calendar "add event" link. Returns null when the date can't be parsed. */
export function googleCalendarUrl(event: Event, pageUrl?: string): string | null {
  const start = parseEventDate(event);
  if (!start) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toIcsStamp(start)}/${toIcsStamp(end)}`,
    details: [stripHtml(event.description ?? ''), pageUrl].filter(Boolean).join('\n\n'),
    location: event.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Minimal RFC 5545 payload for an .ics download. Returns null when the date can't be parsed. */
export function buildIcs(event: Event, pageUrl?: string): string | null {
  const start = parseEventDate(event);
  if (!start) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NPHC of Solano County//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@nphcsolano.org`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape([stripHtml(event.description ?? ''), pageUrl].filter(Boolean).join('\n\n'))}`,
    `LOCATION:${icsEscape(event.location ?? '')}`,
    pageUrl ? `URL:${pageUrl}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}
