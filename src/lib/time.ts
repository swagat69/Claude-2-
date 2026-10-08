/**
 * Booking times (brief §10 C1, §24 "Timezone and daylight saving"). Slots are
 * stored as instants (ISO strings in UTC) and only turned into a local day
 * and time for display, so daylight-saving changes are handled by Intl.
 */

export const SINGAPORE = "Asia/Singapore";

export interface Slot {
  /** ISO 8601 instant, e.g. "2026-10-12T02:30:00Z". */
  start: string;
  available: boolean;
}

export interface SlotDay {
  /** Local calendar date in the chosen zone, YYYY-MM-DD. */
  key: string;
  /** e.g. "Mon, 12 Oct". */
  label: string;
  slots: Slot[];
}

const LOCALE = "en-SG";

/** Local calendar date (YYYY-MM-DD) of an instant in a time zone. */
export function localDateKey(iso: string, timeZone: string): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export function formatDay(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** Groups slots by their local day in `timeZone`, in time order. */
export function groupSlotsByDay(slots: Slot[], timeZone: string): SlotDay[] {
  const days = new Map<string, SlotDay>();
  for (const slot of [...slots].sort((a, b) => a.start.localeCompare(b.start))) {
    const key = localDateKey(slot.start, timeZone);
    const day = days.get(key) ?? { key, label: formatDay(slot.start, timeZone), slots: [] };
    day.slots.push(slot);
    days.set(key, day);
  }
  return [...days.values()];
}

function zoneName(timeZone: string, at: Date, style: "long" | "shortOffset"): string {
  return (
    new Intl.DateTimeFormat(LOCALE, { timeZone, timeZoneName: style }).formatToParts(at).find((p) => p.type === "timeZoneName")
      ?.value ?? timeZone
  );
}

/**
 * Always-visible label for the zone times are shown in, e.g.
 * "Singapore time (GMT+8)". Uses the offset at `at`, so it is right on both
 * sides of a daylight-saving change.
 */
export function timeZoneLabel(timeZone: string, at: Date): string {
  const offset = zoneName(timeZone, at, "shortOffset");
  const name = timeZone === SINGAPORE ? "Singapore time" : zoneName(timeZone, at, "long");
  return `${name} (${offset})`;
}
