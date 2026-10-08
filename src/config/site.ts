/** Site-wide navigation and footer links (brief H0.1, H0.9). */

export const assessmentHref = "/assessment";

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#who-its-for", label: "Who it’s for" },
  { href: "/#faqs", label: "FAQs" },
];

export const navCta = { href: assessmentHref, label: "Start assessment", shortLabel: "Start" };

export const footerGroups = [
  {
    title: "DFX",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#who-its-for", label: "Who it’s for" },
      { href: "/#faqs", label: "FAQs" },
      { href: assessmentHref, label: "Start assessment" },
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
