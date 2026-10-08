/** Site-wide navigation and footer links (brief H0.1, H0.9). */

export const assessmentHref = "/assessment";

/**
 * Link into the assessment. `from` records which button was used, as a code
 * (brief §24: every entry point reaches the same start screen; only the
 * tracking differs). `goal` preselects the first answer.
 */
export function startHref(from: "hero" | "final" | "header" | "tile" | "footer", goal?: string) {
  const params = new URLSearchParams(goal ? { goal, from } : { from });
  return `${assessmentHref}?${params}`;
}

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#who-its-for", label: "Who it’s for" },
  { href: "/#faqs", label: "FAQs" },
];

export const navCta = { href: startHref("header"), label: "Start assessment", shortLabel: "Start" };

export const footerGroups = [
  {
    title: "DFX",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#who-its-for", label: "Who it’s for" },
      { href: "/#faqs", label: "FAQs" },
      { href: startHref("footer"), label: "Start assessment" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];
