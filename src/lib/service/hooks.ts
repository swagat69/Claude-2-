import { useEffect, useState, useSyncExternalStore } from "react";
import { api, type ServerRecord } from "./api.ts";
import { sessionStore, type Session } from "./session.ts";

const unknown = () => undefined;

/** The tab's verified session: `undefined` until known (server render), `null` when there is none. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, unknown);
}

/** A server record, live across tabs. `undefined` until known. */
export function useRecord(id: string | null | undefined): ServerRecord | null | undefined {
  return useSyncExternalStore(api.subscribe, () => api.getRecord(id), unknown);
}

/** Prototype settings, live. */
export function usePrototypeSettings() {
  return useSyncExternalStore(api.subscribe, api.settings, () => undefined);
}

/**
 * The current time, updated every `ms` while `active`, for states that change
 * as the service works. Null until mounted: reading the clock during render
 * would bake one moment into the prerendered page.
 */
export function useNow(ms: number, active: boolean): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    if (!active) return () => window.clearTimeout(first);
    const timer = window.setInterval(tick, ms);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [ms, active]);
  return now;
}
