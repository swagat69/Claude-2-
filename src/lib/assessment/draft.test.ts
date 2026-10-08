import assert from "node:assert/strict";
import test from "node:test";
import { DRAFT_KEY, DRAFT_TTL_MS, createDraftStore, parseDraft, type StorageLike } from "./draft.ts";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

test("start, update and clear write through to storage and notify", () => {
  const storage = memoryStorage();
  let time = 1_000;
  const store = createDraftStore({ storage: () => storage, now: () => time, newId: () => "id-1" });
  let calls = 0;
  store.subscribe(() => calls++);

  assert.equal(store.getSnapshot(), null);
  store.start({ answers: { goal: "renovation" }, source: "tile" });
  assert.equal(calls, 1);
  const started = store.getSnapshot();
  assert.equal(started?.id, "id-1");
  assert.equal(started?.status, "in_progress");
  assert.deepEqual(started?.answers, { goal: "renovation" });
  // Same object until something changes, as useSyncExternalStore requires.
  assert.equal(store.getSnapshot(), started);

  time = 2_000;
  store.update((d) => ({ ...d, answers: { ...d.answers, timeline: "exploring" } }));
  assert.equal(store.getSnapshot()?.updatedAt, 2_000);
  assert.deepEqual(JSON.parse(storage.data.get(DRAFT_KEY) ?? "{}").answers, {
    goal: "renovation",
    timeline: "exploring",
  });

  store.clear();
  assert.equal(store.getSnapshot(), null);
  assert.equal(storage.data.has(DRAFT_KEY), false);
  assert.equal(calls, 3);
});

test("a stored draft is restored, and an expired one is not", () => {
  const storage = memoryStorage();
  const first = createDraftStore({ storage: () => storage, now: () => 0, newId: () => "abc" });
  first.start({ answers: { goal: "personal" } });

  const reloaded = createDraftStore({ storage: () => storage, now: () => DRAFT_TTL_MS - 1 });
  assert.equal(reloaded.getSnapshot()?.id, "abc");

  const later = createDraftStore({ storage: () => storage, now: () => DRAFT_TTL_MS + 1 });
  assert.equal(later.getSnapshot(), null);
});

test("blocked storage still works from memory", () => {
  const throwing: StorageLike = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  const store = createDraftStore({ storage: () => throwing, newId: () => "mem" });
  assert.equal(store.getSnapshot(), null);
  store.start();
  assert.equal(store.getSnapshot()?.id, "mem");
});

test("update without a draft does nothing", () => {
  const store = createDraftStore({ storage: () => memoryStorage() });
  store.update((d) => ({ ...d, status: "review" }));
  assert.equal(store.getSnapshot(), null);
});

test("malformed or tampered drafts are cleaned or dropped", () => {
  assert.equal(parseDraft("not json", 0), null);
  assert.equal(parseDraft(JSON.stringify({ schemaVersion: 2, id: "x", updatedAt: 0 }), 0), null);
  const parsed = parseDraft(
    JSON.stringify({
      schemaVersion: 1,
      id: "x",
      updatedAt: 0,
      status: "hacked",
      answers: { goal: "personal", unknown: "x", priorities: ["a", 1], timeline: 3 },
      contact: { channel: "fax", email: "a@b.co" },
      marketing: { email: "yes" },
    }),
    0,
  );
  assert.equal(parsed?.status, "in_progress");
  assert.deepEqual(parsed?.answers, { goal: "personal" });
  assert.deepEqual(parsed?.contact, { channel: undefined, firstName: undefined, mobile: undefined, email: "a@b.co" });
  assert.deepEqual(parsed?.marketing, { whatsapp: false, email: false });
});
