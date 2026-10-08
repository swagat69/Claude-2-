/**
 * A calendar file for a booked call (brief C2: "calendar invite link").
 * Times are written in UTC, so every calendar app shows them in its own
 * zone correctly. RFC 5545, with CRLF line endings.
 */

export interface CalendarEvent {
  uid: string;
  start: string;
  minutes: number;
  title: string;
  description: string;
  /** Creation time; injectable for tests. */
  stamp?: Date;
}

const utc = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** Escapes text per RFC 5545 §3.3.11. */
const escapeText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function calendarFile({ uid, start, minutes, title, description, stamp = new Date() }: CalendarEvent): string {
  const begin = new Date(start);
  const end = new Date(begin.getTime() + minutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DFX//Call booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utc(stamp)}`,
    `DTSTART:${utc(begin)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
