import { useSyncExternalStore } from "react";
import { draftStore, type Draft } from "./draft.ts";

const unknownOnServer = () => undefined;

/**
 * The current draft. `undefined` while it can't be known yet (server render
 * and hydration), `null` when there is none.
 */
export function useDraft(): Draft | null | undefined {
  return useSyncExternalStore(draftStore.subscribe, draftStore.getSnapshot, unknownOnServer);
}
