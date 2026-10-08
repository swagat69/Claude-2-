import type { Slot } from "@/lib/time";

/**
 * Example availability, Mon 12 – Fri 16 Oct 2026, stored as UTC instants.
 * Singapore times: 9:00, 10:30, 13:00, 14:30, 16:00 and 17:30. Fixed dates so
 * the page renders the same everywhere; real slots come from the scheduler.
 */
const days = ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];
const utcTimes = ["01:00", "02:30", "05:00", "06:30", "08:00", "09:30"];
const taken = new Set([
  "2026-10-12T02:30",
  "2026-10-12T06:30",
  "2026-10-13T01:00",
  "2026-10-15T05:00",
  "2026-10-15T08:00",
  "2026-10-16T09:30",
]);
const fullDay = "2026-10-14";

export const sampleSlots: Slot[] = days.flatMap((day) =>
  utcTimes.map((time) => ({
    start: `${day}T${time}:00Z`,
    available: day !== fullDay && !taken.has(`${day}T${time}`),
  })),
);
