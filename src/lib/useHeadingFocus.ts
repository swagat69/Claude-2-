import { useEffect, useRef, type RefObject } from "react";

let navigated = false;

/**
 * True once the person has moved between pages in this document. The page
 * they first load keeps the browser's normal focus (top of the page, skip
 * link first); every later page moves focus to its heading (brief §7).
 */
function hasNavigated() {
  const first = performance.getEntriesByType("navigation")[0]?.name;
  if (first && first !== window.location.href) navigated = true;
  return navigated;
}

/**
 * Moves focus to the first h1 inside `container` after an in-app navigation,
 * and again whenever `state` changes on the same page (for example, when a
 * result replaces the processing status). Runs again when a preserved page
 * is shown.
 */
export function useHeadingFocus(container: RefObject<HTMLElement | null>, ready: boolean, state = "") {
  const firstShow = useRef(true);
  useEffect(() => {
    if (!ready) return;
    const initial = firstShow.current;
    firstShow.current = false;
    if (initial && !hasNavigated()) return;
    container.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [container, ready, state]);
}
