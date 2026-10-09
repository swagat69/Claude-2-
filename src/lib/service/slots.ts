/**
 * PLACEHOLDER availability. Real slots come from the scheduler and are
 * checked again at confirm time (brief §20). This generates the next five
 * Singapore working days from `now`, skipping public holidays, at fixed
 * Singapore times (calls start 9:00 to 17:30, within 9am to 6pm working
 * hours), with some already taken, so the booking screen behaves like the
 * real thing.
 */

import type { Slot } from "../time.ts";

/**
 * Singapore public holidays on weekdays, including Mondays in lieu (MOM
 * gazetted lists for 2026 and 2027). Hari Raya dates are subject to
 * confirmation each year; update this list when MOM publishes the next year.
 */
export const SG_PUBLIC_HOLIDAYS = new Set([
  "2026-01-01",
  "2026-02-17",
  "2026-02-18",
  "2026-04-03",
  "2026-05-01",
  "2026-05-27",
  "2026-06-01",
  "2026-08-10",
  "2026-11-09",
  "2026-12-25",
  "2027-01-01",
  "2027-02-08",
  "2027-03-10",
  "2027-03-26",
  "2027-05-17",
  "2027-05-20",
  "2027-08-09",
  "2027-10-28",
]);

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
    if (SG_PUBLIC_HOLIDAYS.has(date.toISOString().slice(0, 10))) continue;
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
