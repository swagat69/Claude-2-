"use client";

import { useLayoutEffect } from "react";

/**
 * Turns on smooth scrolling for in-page links ("How it works", "FAQs") while
 * a marketing page is showing. Task pages such as the assessment keep
 * instant scrolling, so jumps to an error or a new step never animate. The
 * attribute is React-owned and removed when the page is hidden.
 */
export function SmoothScroll() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset.smoothScroll = "";
    return () => {
      delete html.dataset.smoothScroll;
    };
  }, []);
  return null;
}
