/**
 * The assessment draft, kept in sessionStorage: it survives a refresh and
 * the browser's Back button, and is gone when the tab closes (brief §24
 * "Resume after tab closed": we explain a safe restart instead). It expires
 * after an hour without changes and can be cleared at any time with "Start
 * again" (brief §7: a defined expiry and revocation route). Nothing here is
 * sent anywhere until the review step is submitted.
 */

import { QUESTION_IDS, type Answers } from "./questions.ts";
import type { Channel, Contact } from "./flow.ts";

/** Placeholder policy: product and legal to confirm how long a draft may be kept (brief §25). */
export const DRAFT_TTL_MS = 60 * 60 * 1000;
export const DRAFT_KEY = "dfx.assessment";
/** Placeholder: the version of the consent wording shown on the review step (brief §19). */
export const CONSENT_VERSION = "2026-10-08-draft";

/** Brief §20 lifecycle, as far as the website goes before the handoff. */
export type DraftStatus = "in_progress" | "review" | "submitted";

export interface ConsentRecord {
  purpose: "service" | "marketing";
  channel: Channel;
  granted: boolean;
  version: string;
  timestamp: string;
}

export interface Draft {
  schemaVersion: 1;
  /** Opaque id (brief §20 assessment_id); carries no personal data. */
  id: string;
  status: DraftStatus;
  answers: Answers;
  contact: Contact;
  marketing: Record<Channel, boolean>;
  /** Where the person started, as a code (e.g. "hero"); never a URL. */
  source: string;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  consent?: ConsentRecord[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Accepts only known question ids with string or string-list values. */
function cleanAnswers(value: unknown): Answers {
  const answers: Answers = {};
  if (!isRecord(value)) return answers;
  for (const id of QUESTION_IDS) {
    const answer = value[id];
    if (typeof answer === "string") answers[id] = answer;
    else if (Array.isArray(answer) && answer.every((v) => typeof v === "string")) answers[id] = answer;
  }
  return answers;
}

function cleanContact(value: unknown): Contact {
  if (!isRecord(value)) return {};
  const text = (v: unknown) => (typeof v === "string" ? v : undefined);
  const channel = value.channel === "whatsapp" || value.channel === "email" ? value.channel : undefined;
  return { channel, firstName: text(value.firstName), mobile: text(value.mobile), email: text(value.email) };
}

/** Reads a stored draft defensively: anything malformed or expired is treated as no draft. */
export function parseDraft(raw: string | null, now: number): Draft | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.schemaVersion !== 1 || typeof data.id !== "string") return null;
  const updatedAt = typeof data.updatedAt === "number" ? data.updatedAt : 0;
  if (now - updatedAt > DRAFT_TTL_MS) return null;
  const status: DraftStatus = data.status === "review" || data.status === "submitted" ? data.status : "in_progress";
  const marketing = isRecord(data.marketing) ? data.marketing : {};
  return {
    schemaVersion: 1,
    id: data.id,
    status,
    answers: cleanAnswers(data.answers),
    contact: cleanContact(data.contact),
    marketing: { whatsapp: marketing.whatsapp === true, email: marketing.email === true },
    source: typeof data.source === "string" ? data.source : "direct",
    createdAt: typeof data.createdAt === "number" ? data.createdAt : updatedAt,
    updatedAt,
    submittedAt: typeof data.submittedAt === "number" ? data.submittedAt : undefined,
    consent: Array.isArray(data.consent) ? (data.consent as ConsentRecord[]) : undefined,
  };
}

interface StoreOptions {
  /** Returns null where storage is unavailable (server, or blocked by the browser). */
  storage: () => StorageLike | null;
  now?: () => number;
  newId?: () => string;
}

/**
 * A tiny external store for useSyncExternalStore. The snapshot is cached so
 * React sees the same object until something changes. If storage is
 * blocked, the draft still lives in memory for this page.
 */
export function createDraftStore({ storage, now = Date.now, newId = () => crypto.randomUUID() }: StoreOptions) {
  let cache: Draft | null | undefined;
  const listeners = new Set<() => void>();

  const read = (): Draft | null => {
    try {
      return parseDraft(storage()?.getItem(DRAFT_KEY) ?? null, now());
    } catch {
      return null;
    }
  };

  const write = (next: Draft | null) => {
    cache = next;
    try {
      const store = storage();
      if (next) store?.setItem(DRAFT_KEY, JSON.stringify(next));
      else store?.removeItem(DRAFT_KEY);
    } catch {
      // Private browsing or full storage: keep working from memory.
    }
    for (const listener of listeners) listener();
  };

  const getSnapshot = (): Draft | null => {
    if (cache === undefined) cache = read();
    return cache;
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    /** Starts a fresh draft, replacing any existing one. */
    start({ answers = {}, source = "direct" }: { answers?: Answers; source?: string } = {}): Draft {
      const time = now();
      const draft: Draft = {
        schemaVersion: 1,
        id: newId(),
        status: "in_progress",
        answers,
        contact: {},
        marketing: { whatsapp: false, email: false },
        source,
        createdAt: time,
        updatedAt: time,
      };
      write(draft);
      return draft;
    },
    /** Applies a change to the current draft. Does nothing if there is none. */
    update(change: (draft: Draft) => Draft) {
      const current = getSnapshot();
      if (!current) return;
      write({ ...change(current), updatedAt: now() });
    },
    clear() {
      write(null);
    },
  };
}

export type DraftStore = ReturnType<typeof createDraftStore>;

export const draftStore = createDraftStore({
  storage: () => (typeof window === "undefined" ? null : window.sessionStorage),
});
