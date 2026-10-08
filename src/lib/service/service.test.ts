import assert from "node:assert/strict";
import test from "node:test";
import { calendarFile } from "../ics.ts";
import { suggestEmail } from "../format.ts";
import { SINGAPORE, formatTime, localDateKey } from "../time.ts";
import type { Draft } from "../assessment/draft.ts";
import { MAX_SENDS, RESEND_COOLDOWN_MS, ServiceError, createApi, reference, type StorageLike } from "./api.ts";
import { forcedResult, reasonCopy, stubResult } from "./engine.ts";
import { STATUSES, canTransition, transition } from "./lifecycle.ts";
import { availableSlots } from "./slots.ts";

/* Lifecycle ----------------------------------------------------------------- */

test("the lifecycle allows only brief §20's transitions", () => {
  assert.ok(canTransition("submitted", "awaiting_contact"));
  assert.ok(canTransition("awaiting_contact", "verified"));
  assert.ok(canTransition("processing", "failed"));
  assert.ok(canTransition("failed", "processing"));
  assert.ok(canTransition("booking_started", "booking_confirmed"));
  assert.ok(!canTransition("submitted", "result_ready"), "no result without verification");
  assert.ok(!canTransition("no_match", "booking_started"), "no sales funnel after no match");
  assert.ok(!canTransition("result_ready", "booking_confirmed"), "booking starts before it is confirmed");
  assert.throws(() => transition("expired", "processing"), /Cannot move/);
  for (const status of STATUSES) assert.equal(typeof canTransition(status, "closed"), "boolean");
});

/* Results stub ------------------------------------------------------------------ */

test("the stub results never rank or score, and reasons avoid sensitive answers", () => {
  const result = stubResult({
    goal: "consolidation",
    debtCount: "3-4",
    residency: "citizen",
    ageBand: "30-39",
    income: "4k-6k",
    term: "1-3y",
    priorities: ["monthly"],
  });
  assert.equal(result.kind, "fit");
  assert.deepEqual(
    result.routes.map((r) => r.id),
    ["consolidation-plan", "balance-transfer"],
  );
  assert.deepEqual(result.routes[0].reasons, [
    "You’d like a lower monthly repayment",
    "You’d like to repay over 1 to 3 years",
  ]);
  const text = JSON.stringify(result);
  for (const sensitive of ["citizen", "30", "4,000", "income", "%"]) assert.ok(!text.includes(sensitive), sensitive);
});

test("unclear goals and pending registrations go to a person; every reason has words", () => {
  assert.equal(stubResult({ goal: "not-sure" }).kind, "review");
  assert.equal(stubResult({ goal: "business", businessRegistered: "in-progress" }).reason, "registration-pending");
  for (const kind of ["fit", "review", "no-match"] as const) {
    const result = forcedResult({ goal: "not-sure" }, kind);
    assert.equal(result.kind, kind);
    if (kind === "fit") assert.ok(result.routes.length > 0);
    else assert.ok(reasonCopy[result.reason], result.reason);
  }
});

/* Slots ---------------------------------------------------------------------------- */

test("slots are Singapore working days from tomorrow, at Singapore office times", () => {
  // Friday 9 Oct 2026, 11pm Singapore time.
  const slots = availableSlots(new Date("2026-10-09T15:00:00Z"));
  const days = [...new Set(slots.map((s) => localDateKey(s.start, SINGAPORE)))];
  assert.deepEqual(days, ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
  assert.deepEqual(
    slots.filter((s) => localDateKey(s.start, SINGAPORE) === "2026-10-12").map((s) => formatTime(s.start, SINGAPORE)),
    ["9:00 am", "10:30 am", "1:00 pm", "2:30 pm", "4:00 pm", "5:30 pm"],
  );
  assert.ok(slots.some((s) => !s.available) && slots.some((s) => s.available));
  // Stable: the same moment gives the same availability.
  assert.deepEqual(availableSlots(new Date("2026-10-09T15:00:00Z")), slots);
});

/* Calendar file -------------------------------------------------------------------- */

test("the calendar file uses UTC times, CRLF endings and escaped text", () => {
  const ics = calendarFile({
    uid: "abc@dfx",
    start: "2026-10-12T02:30:00Z",
    minutes: 15,
    title: "Call with DFX",
    description: "Reference DFX-1A2B3C; we'll call you, as agreed",
    stamp: new Date("2026-10-08T10:00:00Z"),
  });
  assert.ok(ics.includes("DTSTART:20261012T023000Z\r\n"));
  assert.ok(ics.includes("DTEND:20261012T024500Z\r\n"));
  assert.ok(ics.includes("DESCRIPTION:Reference DFX-1A2B3C\\; we'll call you\\, as agreed\r\n"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

/* Email typo suggestion ------------------------------------------------------------- */

test("likely email domain typos get a suggestion, real domains don't", () => {
  assert.equal(suggestEmail("ana@gmial.com"), "ana@gmail.com");
  assert.equal(suggestEmail("Ana.Tan@hotmial.com"), "Ana.Tan@hotmail.com");
  assert.equal(suggestEmail("ana@yahoo.com.sq"), "ana@yahoo.com.sg");
  assert.equal(suggestEmail("ana@gmail.com"), null);
  assert.equal(suggestEmail("ana@dfx.com.sg"), null);
  assert.equal(suggestEmail("not an email"), null);
});

/* Mock API -------------------------------------------------------------------------- */

function memory(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function setup() {
  let time = Date.parse("2026-10-08T02:00:00Z");
  let n = 0;
  const storage = memory();
  const service = createApi({
    storage: () => storage,
    now: () => time,
    delay: async () => {},
    newId: () => `id-${++n}`,
  });
  const advance = (ms: number) => (time += ms);
  const draft: Draft = {
    schemaVersion: 1,
    id: "draft-1",
    status: "submitted",
    answers: { goal: "personal", term: "1-3y", priorities: ["monthly"] },
    contact: { channel: "email", email: "ana@example.com", firstName: "Ana" },
    marketing: { email: false, whatsapp: false },
    source: "direct",
    createdAt: time,
    updatedAt: time,
  };
  return { service, advance, draft, storage };
}

test("submit is idempotent and starts the lifecycle at submitted", async () => {
  const { service, draft } = setup();
  const first = await service.submit(draft);
  const second = await service.submit(draft);
  assert.equal(first, second);
  assert.equal(first.status, "submitted");
});

test("email links: real delivery states, cooldown, a send limit and single-use tokens", async () => {
  const { service, advance, draft } = setup();
  await service.submit(draft);
  await service.requestEmailLink(draft.id, "ana@example.com");
  const record = () => service.getRecord(draft.id)!;
  assert.equal(record().status, "awaiting_contact");
  assert.equal(service.emailStatus(record()), "queued");
  advance(2000);
  assert.equal(service.emailStatus(record()), "sent");
  advance(3000);
  assert.equal(service.emailStatus(record()), "delivered");

  await assert.rejects(
    service.requestEmailLink(draft.id, "ana@example.com"),
    (e: ServiceError) => e.code === "cooldown",
  );
  for (let i = 1; i < MAX_SENDS; i++) {
    advance(RESEND_COOLDOWN_MS);
    await service.requestEmailLink(draft.id, "ana@example.com");
  }
  advance(RESEND_COOLDOWN_MS);
  await assert.rejects(
    service.requestEmailLink(draft.id, "ana@example.com"),
    (e: ServiceError) => e.code === "rate-limited",
  );

  const { token } = service.outbox().at(-1)!;
  const opened = await service.resume(token);
  assert.equal(opened.id, draft.id);
  assert.equal(record().status, "verified");
  await assert.rejects(service.resume(token), (e: ServiceError) => e.code === "used");
  await assert.rejects(service.resume("nope"), (e: ServiceError) => e.code === "invalid");
});

test("expired links and bounced emails are reported as such", async () => {
  const { service, advance, draft } = setup();
  await service.submit(draft);
  service.setSettings({ email: "bounce" });
  await service.requestEmailLink(draft.id, "ana@exmaple.com");
  advance(5000);
  assert.equal(service.emailStatus(service.getRecord(draft.id)!), "bounced");
  const { token } = service.outbox().at(-1)!;
  advance(25 * 60 * 60 * 1000);
  await assert.rejects(service.resume(token), (e: ServiceError) => e.code === "expired");
});

test("asking for a new link never reveals whether the email is known", async () => {
  const { service, draft } = setup();
  await service.submit(draft);
  await service.requestNewLink("someone@else.com");
  assert.equal(service.outbox().length, 0);
  await service.requestNewLink("ANA@example.com");
  assert.equal(service.outbox().length, 1);
});

test("processing settles into the result, and an error recovers on retry", async () => {
  const { service, advance, draft } = setup();
  await service.submit(draft);
  service.simulateWhatsAppReply(draft.id);
  await service.resume(service.outbox().at(-1)!.token);
  service.setSettings({ outcome: "error" });
  service.startProcessing(draft.id);
  const record = () => service.getRecord(draft.id)!;
  assert.deepEqual(
    service.processingSteps(record()).map((s) => s.state),
    ["done", "current", "pending"],
  );
  advance(5000);
  service.refresh(draft.id);
  assert.equal(record().status, "failed");
  service.startProcessing(draft.id);
  advance(5000);
  service.refresh(draft.id);
  assert.equal(record().status, "result_ready");
  assert.equal(record().result?.kind, "fit");
});

test("booking rechecks the slot at confirm time; cancelling returns to the result", async () => {
  const { service, advance, draft } = setup();
  await service.submit(draft);
  service.simulateWhatsAppReply(draft.id);
  await service.resume(service.outbox().at(-1)!.token);
  service.startProcessing(draft.id);
  advance(5000);
  service.refresh(draft.id);
  service.setSettings({ booking: "conflict" });
  service.startBooking(draft.id);
  const slot = service.slots().find((s) => s.available)!;
  await assert.rejects(service.book(draft.id, slot.start, "phone"), (e: ServiceError) => e.code === "taken");
  assert.equal(service.slots().find((s) => s.start === slot.start)?.available, false);
  const other = service.slots().find((s) => s.available)!;
  const booking = await service.book(draft.id, other.start, "video");
  assert.equal(booking.status, "confirmed");
  assert.equal(service.getRecord(draft.id)!.status, "booking_confirmed");
  await service.cancelBooking(draft.id);
  assert.equal(service.getRecord(draft.id)!.status, "result_ready");
  assert.equal(service.getRecord(draft.id)!.booking?.status, "cancelled");
});

test("the reference is short and carries no personal data", () => {
  assert.equal(reference("1a2b3c4d-0000-4000-8000-000000000000"), "DFX-1A2B3C");
});
