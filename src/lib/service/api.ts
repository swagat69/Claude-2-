/**
 * PROTOTYPE ONLY. Stands in for the assessment API, the messaging service
 * and the scheduler (brief §20) until the real ones exist, so every state of
 * Parts 5 and 6 can be clicked through and tested. Data lives in this
 * browser's localStorage, so a link opened in another tab works the way it
 * would with a real server. Each call waits a little, like a network would.
 *
 * Replace this module with real endpoints; the screens only use the
 * functions exported here.
 */

import type { Answers } from "../assessment/questions.ts";
import type { Channel, Contact } from "../assessment/flow.ts";
import type { ConsentRecord, Draft } from "../assessment/draft.ts";
import { forcedResult, stubResult, type Result } from "./engine.ts";
import { canTransition, type Status } from "./lifecycle.ts";
import { availableSlots } from "./slots.ts";
import { business } from "../../config/business.ts";
import type { Slot } from "../time.ts";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EmailStatus = "queued" | "sent" | "delivered" | "bounced";
export type CallFormat = "phone" | "video";

export interface Booking {
  id: string;
  start: string;
  format: CallFormat;
  phone?: string;
  status: "confirmed" | "cancelled";
  confirmedAt: number;
}

export interface ServerRecord {
  id: string;
  status: Status;
  answers: Answers;
  contact: Contact;
  channel: Channel;
  marketing: Record<Channel, boolean>;
  consent: ConsentRecord[];
  createdAt: number;
  updatedAt: number;
  whatsappOpenedAt?: number;
  email?: { address: string; requestedAt: number; sends: number[]; outcome: "deliver" | "bounce" };
  processing?: { startedAt: number; failedOnce?: boolean };
  result?: Result;
  booking?: Booking;
  notifyWhenAvailable?: boolean;
}

export interface Message {
  id: string;
  assessmentId: string;
  channel: Channel;
  to: string;
  token: string;
  sentAt: number;
}

interface Token {
  assessmentId: string;
  channel: Channel;
  expiresAt: number;
  usedAt?: number;
}

interface Db {
  records: Record<string, ServerRecord>;
  tokens: Record<string, Token>;
  outbox: Message[];
  /** Slots someone else has taken since they were listed (booking conflict). */
  taken: string[];
  /** Public "send me a new link" requests, by email, for rate limiting. */
  linkRequests: Record<string, number[]>;
}

export interface PrototypeSettings {
  speed: "normal" | "fast";
  outcome: "auto" | "fit" | "review" | "no-match" | "error";
  email: "deliver" | "bounce";
  link: "ok" | "expired";
  booking: "ok" | "conflict";
}

export const defaultSettings: PrototypeSettings = {
  speed: "normal",
  outcome: "auto",
  email: "deliver",
  link: "ok",
  booking: "ok",
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/* -------------------------------------------------------------------------- */
/* Policy placeholders (brief §25)                                            */
/* -------------------------------------------------------------------------- */

/** How long a link works: single use, 15 minutes (see business.linkMinutes). */
export const LINK_TTL_MS = business.linkMinutes * 60 * 1000;
/** Wait between email sends, and the most sends in a window (common practice; docs/decisions.md). */
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_SENDS = 3;
export const SEND_WINDOW_MS = 15 * 60 * 1000;
/** DFX's WhatsApp Business Platform number isn't known yet, so the prototype simulates the chat. */
export const WHATSAPP_BUSINESS = { name: "DFX", number: null as string | null };

const DB_KEY = "dfx.mock-server";
const SETTINGS_KEY = "dfx.prototype";

/** Processing milestones in ms (normal speed): checking until 2.2s, preparing until 4s. */
const PROCESSING_STEPS = [2200, 4000];
/** Email delivery milestones in ms: sent at 1.5s, delivered or bounced at 4s. */
const EMAIL_STEPS = [1500, 4000];

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

const emptyDb = (): Db => ({ records: {}, tokens: {}, outbox: [], taken: [], linkRequests: {} });

export type ApiError = "rate-limited" | "cooldown" | "not-found" | "taken" | "invalid" | "expired" | "used";

export class ServiceError extends Error {
  readonly code: ApiError;
  constructor(code: ApiError) {
    super(code);
    this.code = code;
  }
}

interface ApiOptions {
  storage: () => StorageLike | null;
  now?: () => number;
  /** Simulated network time. Tests pass a no-op. */
  delay?: (ms: number) => Promise<void>;
  newId?: () => string;
}

export function createApi({
  storage,
  now = Date.now,
  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  newId = () => crypto.randomUUID(),
}: ApiOptions) {
  let cache: Db | undefined;
  let settingsCache: PrototypeSettings | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const read = <T>(key: string, fallback: () => T): T => {
    try {
      const raw = storage()?.getItem(key);
      return raw ? { ...fallback(), ...JSON.parse(raw) } : fallback();
    } catch {
      return fallback();
    }
  };

  const db = (): Db => (cache ??= read(DB_KEY, emptyDb));

  const save = (next: Db) => {
    cache = next;
    try {
      storage()?.setItem(DB_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the prototype keeps working for this page only.
    }
    notify();
  };

  const settings = (): PrototypeSettings => (settingsCache ??= read(SETTINGS_KEY, () => ({ ...defaultSettings })));
  const scale = (ms: number) => (settings().speed === "fast" ? Math.round(ms / 10) : ms);
  const wait = (ms: number) => delay(scale(ms));

  const record = (id: string): ServerRecord => {
    const found = db().records[id];
    if (!found) throw new ServiceError("not-found");
    return found;
  };

  const update = (id: string, change: (r: ServerRecord) => ServerRecord, extra?: (d: Db) => Partial<Db>) => {
    const current = db();
    const next = { ...change(record(id)), updatedAt: now() };
    save({ ...current, ...extra?.(current), records: { ...current.records, [id]: next } });
    return next;
  };

  /** Moves the lifecycle on, but only along allowed transitions (brief §20). */
  const move = (r: ServerRecord, to: Status): ServerRecord => (canTransition(r.status, to) ? { ...r, status: to } : r);

  const issueToken = (r: ServerRecord, channel: Channel, to: string): Partial<Db> => {
    const token = newId().replace(/-/g, "");
    const current = db();
    return {
      tokens: { ...current.tokens, [token]: { assessmentId: r.id, channel, expiresAt: now() + LINK_TTL_MS } },
      outbox: [...current.outbox, { id: newId(), assessmentId: r.id, channel, to, token, sentAt: now() }],
    };
  };

  /** Turns finished processing into a result. Called when the page polls. */
  const settle = (id: string) => {
    const r = db().records[id];
    if (!r || r.status !== "processing" || !r.processing) return;
    if (now() - r.processing.startedAt < scale(PROCESSING_STEPS[1])) return;
    const outcome = settings().outcome;
    if (outcome === "error" && !r.processing.failedOnce) {
      update(id, (x) => ({ ...move(x, "failed"), processing: { ...x.processing!, failedOnce: true } }));
      return;
    }
    const result = outcome === "auto" || outcome === "error" ? stubResult(r.answers) : forcedResult(r.answers, outcome);
    const to: Status = result.kind === "fit" ? "result_ready" : result.kind === "review" ? "human_review" : "no_match";
    update(id, (x) => ({ ...move(x, to), result }));
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === DB_KEY) cache = undefined;
        if (event.key === SETTINGS_KEY) settingsCache = undefined;
        if (event.key === DB_KEY || event.key === SETTINGS_KEY) listener();
      };
      if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },

    /** Same object until it changes, for useSyncExternalStore. */
    getRecord: (id: string | null | undefined): ServerRecord | null => (id ? (db().records[id] ?? null) : null),
    outbox: (): Message[] => db().outbox,
    settings,

    /* Submission and handoff (brief §9) ------------------------------------ */

    /** Accepts the assessment and its consent audit. Idempotent: sending the same draft twice is one assessment. */
    async submit(draft: Draft): Promise<ServerRecord> {
      await wait(700);
      const existing = db().records[draft.id];
      if (existing) return existing;
      const channel = draft.contact.channel ?? "email";
      const r: ServerRecord = {
        id: draft.id,
        status: "submitted",
        answers: draft.answers,
        contact: draft.contact,
        channel,
        marketing: draft.marketing,
        consent: draft.consent ?? [],
        createdAt: now(),
        updatedAt: now(),
      };
      const current = db();
      save({ ...current, records: { ...current.records, [r.id]: r } });
      return r;
    },

    /** The person switches channel after sending (brief §8: fallback). */
    setChannel(id: string, channel: Channel) {
      return update(id, (r) => ({ ...move(r, "awaiting_contact"), channel }));
    },

    /** Records that the person chose to open WhatsApp. Not proof of a message (brief W1). */
    openWhatsApp(id: string) {
      return update(id, (r) => ({ ...move(r, "awaiting_contact"), whatsappOpenedAt: now() }));
    },

    /** PROTOTYPE: what DFX's WhatsApp account would reply once the person sends the message. */
    simulateWhatsAppReply(id: string) {
      const r = record(id);
      update(
        id,
        (x) => move(x, "awaiting_contact"),
        () => issueToken(r, "whatsapp", r.contact.mobile ?? "WhatsApp"),
      );
    },

    async requestEmailLink(id: string, address: string): Promise<void> {
      await wait(600);
      const r = record(id);
      const time = now();
      const recent = (r.email?.sends ?? []).filter((t) => time - t < SEND_WINDOW_MS);
      const last = recent.at(-1);
      if (last !== undefined && time - last < RESEND_COOLDOWN_MS) throw new ServiceError("cooldown");
      if (recent.length >= MAX_SENDS) throw new ServiceError("rate-limited");
      update(
        id,
        (x) => ({
          ...move(x, "awaiting_contact"),
          channel: "email",
          contact: { ...x.contact, email: address },
          email: { address, requestedAt: time, sends: [...recent, time], outcome: settings().email },
        }),
        () => issueToken(r, "email", address),
      );
    },

    /** What the email service has actually reported, by elapsed time. Never "delivered" just because it was queued. */
    emailStatus(r: ServerRecord, at = now()): EmailStatus | null {
      if (!r.email) return null;
      const elapsed = at - r.email.requestedAt;
      if (elapsed < scale(EMAIL_STEPS[0])) return "queued";
      if (elapsed < scale(EMAIL_STEPS[1])) return "sent";
      return r.email.outcome === "bounce" ? "bounced" : "delivered";
    },

    /**
     * Public "send me a new link" (brief §8: never reveal whether an account
     * exists). Always resolves the same way; sends only if there is a match.
     */
    async requestNewLink(address: string): Promise<void> {
      await wait(600);
      const key = address.trim().toLowerCase();
      const time = now();
      const current = db();
      const recent = (current.linkRequests[key] ?? []).filter((t) => time - t < SEND_WINDOW_MS);
      if (recent.length >= MAX_SENDS) throw new ServiceError("rate-limited");
      const match = Object.values(current.records)
        .filter((r) => r.contact.email?.toLowerCase() === key)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      const extra = match ? issueToken(match, "email", address.trim()) : {};
      save({ ...current, ...extra, linkRequests: { ...current.linkRequests, [key]: [...recent, time] } });
    },

    /** Opens a signed resume link: single use, short-lived (brief E1, §20). */
    async resume(token: string): Promise<{ id: string; channel: Channel; sentAt?: number }> {
      await wait(500);
      const current = db();
      const found = current.tokens[token];
      if (!found) throw new ServiceError("invalid");
      if (found.usedAt) throw new ServiceError("used");
      if (now() > found.expiresAt || settings().link === "expired") throw new ServiceError("expired");
      const r = record(found.assessmentId);
      const sentAt = current.outbox.find((m) => m.token === token)?.sentAt;
      save({
        ...current,
        tokens: { ...current.tokens, [token]: { ...found, usedAt: now() } },
        records: { ...current.records, [r.id]: { ...move(move(r, "awaiting_contact"), "verified"), updatedAt: now() } },
      });
      return { id: r.id, channel: found.channel, sentAt };
    },

    /* Processing and results (brief M1, R1–R4) ----------------------------- */

    startProcessing(id: string) {
      const r = record(id);
      if (r.status !== "verified" && r.status !== "failed") return r;
      return update(id, (x) => ({ ...move(x, "processing"), processing: { ...x.processing, startedAt: now() } }));
    },

    /** Real steps from the service's own state; never a timer or a percentage (brief M1). */
    processingSteps(r: ServerRecord, at = now()) {
      const elapsed = r.processing ? at - r.processing.startedAt : 0;
      const state = (from: number, to: number): "done" | "current" | "pending" =>
        elapsed >= scale(to) ? "done" : elapsed >= scale(from) ? "current" : "pending";
      return [
        { label: "Answers received", state: "done" as const },
        { label: "Checking which routes fit", state: state(0, PROCESSING_STEPS[0]) },
        { label: "Preparing your result", state: state(PROCESSING_STEPS[0], PROCESSING_STEPS[1]) },
      ];
    },

    refresh: settle,

    setNotify(id: string, value: boolean) {
      return update(id, (r) => ({ ...r, notifyWhenAvailable: value }));
    },

    /* Booking (brief C1, C2) ------------------------------------------------ */

    startBooking(id: string) {
      return update(id, (r) => (r.status === "booking_confirmed" ? r : move(r, "booking_started")));
    },

    slots: (): Slot[] => slotsFrom(db(), now()),

    /**
     * Checks the slot again at confirm time (brief §20). With the prototype's
     * "conflict" setting, the first attempt finds the slot just taken.
     */
    async book(id: string, start: string, format: CallFormat, phone?: string): Promise<Booking> {
      await wait(900);
      const current = db();
      const slot = slotsFrom(current, now()).find((s) => s.start === start);
      if (!slot?.available) throw new ServiceError("taken");
      if (settings().booking === "conflict" && !current.taken.length) {
        save({ ...current, taken: [...current.taken, start] });
        throw new ServiceError("taken");
      }
      const booking: Booking = { id: newId(), start, format, phone, status: "confirmed", confirmedAt: now() };
      update(id, (r) => ({ ...move(move(r, "booking_started"), "booking_confirmed"), booking }));
      return booking;
    },

    async cancelBooking(id: string): Promise<void> {
      await wait(600);
      update(id, (r) => {
        const back: Status = r.result?.kind === "review" ? "human_review" : "result_ready";
        return { ...move(r, back), booking: r.booking ? { ...r.booking, status: "cancelled" } : undefined };
      });
    },

    /* Prototype controls ----------------------------------------------------- */

    setSettings(change: Partial<PrototypeSettings>) {
      settingsCache = { ...settings(), ...change };
      try {
        storage()?.setItem(SETTINGS_KEY, JSON.stringify(settingsCache));
      } catch {
        // Keep in memory.
      }
      notify();
    },

    reset() {
      cache = emptyDb();
      settingsCache = { ...defaultSettings };
      try {
        storage()?.removeItem(DB_KEY);
        storage()?.removeItem(SETTINGS_KEY);
      } catch {
        // Nothing stored.
      }
      notify();
    },

    /** PROTOTYPE: runs the check again with the current settings. Skips the lifecycle on purpose. */
    rerun(id: string) {
      update(id, (r) => ({ ...r, status: "verified", result: undefined, processing: undefined, booking: undefined }));
    },

    /**
     * PROTOTYPE: creates a verified example assessment, to jump straight to a
     * state. With `withResult`, the check has already run.
     */
    seed(answers: Answers, contact: Contact, withResult?: "fit" | "review" | "no-match"): string {
      const id = newId();
      const result = withResult ? forcedResult(answers, withResult) : undefined;
      const status: Status = !result
        ? "verified"
        : result.kind === "fit"
          ? "result_ready"
          : result.kind === "review"
            ? "human_review"
            : "no_match";
      const r: ServerRecord = {
        id,
        status,
        result,
        answers,
        contact,
        channel: contact.channel ?? "email",
        marketing: { whatsapp: false, email: false },
        consent: [],
        createdAt: now(),
        updatedAt: now(),
      };
      const current = db();
      save({ ...current, records: { ...current.records, [id]: r } });
      return id;
    },
  };
}

function slotsFrom(current: Db, at: number): Slot[] {
  const taken = new Set(current.taken);
  return availableSlots(new Date(at)).map((s) => (taken.has(s.start) ? { ...s, available: false } : s));
}

export type Api = ReturnType<typeof createApi>;

export const api = createApi({ storage: () => (typeof window === "undefined" ? null : window.localStorage) });

/** A short, non-sensitive reference for messages and support (brief §19). */
export const reference = (id: string) => `DFX-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
