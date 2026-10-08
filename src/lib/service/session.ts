/**
 * Which assessment this tab may show, after a signed link was opened (brief
 * §9: an authenticated resume). Kept for this tab only; opening a link again
 * restores it. PLACEHOLDER: a real session is a secure, server-set cookie.
 */

import type { Channel } from "../assessment/flow.ts";

export interface Session {
  id: string;
  channel: Channel;
  verifiedAt: number;
  /** When the link was sent, to bucket "time since handoff" for analytics. */
  sentAt?: number;
}

export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const KEY = "dfx.session";

export function createSessionStore(storage: () => SessionStorageLike | null) {
  let cache: Session | null | undefined;
  const listeners = new Set<() => void>();

  const get = (): Session | null => {
    if (cache !== undefined) return cache;
    try {
      const raw = storage()?.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      cache = parsed && typeof parsed.id === "string" ? (parsed as Session) : null;
    } catch {
      cache = null;
    }
    return cache;
  };

  const write = (next: Session | null) => {
    cache = next;
    try {
      if (next) storage()?.setItem(KEY, JSON.stringify(next));
      else storage()?.removeItem(KEY);
    } catch {
      // Memory only.
    }
    listeners.forEach((listener) => listener());
  };

  return {
    get,
    set: (session: Session) => write(session),
    clear: () => write(null),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const sessionStore = createSessionStore(() => (typeof window === "undefined" ? null : window.sessionStorage));
