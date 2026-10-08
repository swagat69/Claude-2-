"use client";

import type { MouseEvent } from "react";

/**
 * "Skip to main content". With Cache Components, pages you have navigated
 * away from stay in the document, hidden, each with its own <main id="main">,
 * so a plain #main link can land on a hidden one. This moves focus to the
 * main that is actually showing; without JavaScript the href still works.
 */
export function SkipLink() {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = Array.from(document.querySelectorAll<HTMLElement>("main")).find((m) => m.getClientRects().length > 0);
    if (!main) return;
    event.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus();
  };
  return (
    <a className="skip-link" href="#main" onClick={skip}>
      Skip to main content
    </a>
  );
}
