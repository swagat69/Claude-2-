/**
 * PLACEHOLDER availability. Real slots come from the scheduler and are
 * checked again at confirm time (brief §20). This generates the next five
 * Singapore working days from `now`, at fixed Singapore times, with some
 * already taken, so the booking screen behaves like the real thing.
 * Public holidays are not excluded yet.
 */

import type { Slot } from "../time.ts";

/** Singapore has no daylight saving: always UTC+8. */
const SGT_OFFSET_HOURS = 8;
const TIMES_SGT = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

/** Singapore calendar date of an instant, as [year, month (0-based), day, weekday]. */
function sgDate(at: Date): [number, number, number, number] {
  const shifted = new Date(at.getTime() + SGT_OFFSET_HOURS * 3_600_000);
  return [shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), shifted.getUTCDay()];
}

/** A stable pseudo-random "taken" pattern, so the same day looks the same on every load. */
function isTaken(key: string): boolean {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 10 < 3;
}

export function availableSlots(now: Date, days = 5): Slot[] {
  const slots: Slot[] = [];
  const [year, month, day] = sgDate(now);
  // Start tomorrow (Singapore date), so there is always time to prepare.
  for (let offset = 1, found = 0; found < days && offset < 14; offset++) {
    const date = new Date(Date.UTC(year, month, day + offset));
    const weekday = date.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    found++;
    for (const time of TIMES_SGT) {
      const [hours, minutes] = time.split(":").map(Number);
      const start = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours - SGT_OFFSET_HOURS, minutes),
      );
      const iso = start.toISOString().replace(".000Z", "Z");
      slots.push({ start: iso, available: !isTaken(iso) });
    }
  }
  return slots;
}

export const CALL_MINUTES = 15;
