import assert from "node:assert/strict";
import test from "node:test";
import { SINGAPORE, formatDay, formatTime, groupSlotsByDay, localDateKey, timeZoneLabel } from "./time.ts";

test("times show in Singapore time by default", () => {
  assert.equal(formatTime("2026-10-12T02:30:00Z", SINGAPORE), "10:30 am");
  assert.equal(formatDay("2026-10-12T02:30:00Z", SINGAPORE), "Mon, 12 Oct");
  assert.equal(timeZoneLabel(SINGAPORE, new Date("2026-10-12T02:30:00Z")), "Singapore time (GMT+8)");
});

test("the same instant follows daylight saving in another zone", () => {
  // Sydney moves to daylight time on 4 Oct 2026.
  assert.equal(formatTime("2026-10-01T02:30:00Z", "Australia/Sydney"), "12:30 pm");
  assert.equal(formatTime("2026-10-12T02:30:00Z", "Australia/Sydney"), "1:30 pm");
  assert.equal(timeZoneLabel("Australia/Sydney", new Date("2026-10-12T02:30:00Z")), "Australian Eastern Daylight Time (GMT+11)");
});

test("a slot can fall on a different calendar day elsewhere", () => {
  // 6:30 am Monday in Singapore is still 11:30 pm Sunday in London.
  assert.equal(localDateKey("2026-10-11T22:30:00Z", SINGAPORE), "2026-10-12");
  assert.equal(localDateKey("2026-10-11T22:30:00Z", "Europe/London"), "2026-10-11");
});

test("slots group by local day, in time order", () => {
  const days = groupSlotsByDay(
    [
      { start: "2026-10-13T06:00:00Z", available: true },
      { start: "2026-10-12T02:30:00Z", available: false },
      { start: "2026-10-12T01:00:00Z", available: true },
    ],
    SINGAPORE,
  );
  assert.deepEqual(
    days.map((d) => [d.key, d.label, d.slots.map((s) => formatTime(s.start, SINGAPORE))]),
    [
      ["2026-10-12", "Mon, 12 Oct", ["9:00 am", "10:30 am"]],
      ["2026-10-13", "Tue, 13 Oct", ["2:00 pm"]],
    ],
  );
});
