# DFX website

Design and build of the DFX loan-matching funnel: homepage → 3–4 assessment
steps → WhatsApp or email handoff → results → a qualified call. It follows
the **DFX Design Brief v1.0** (8 October 2026) and is designed in six parts,
each reviewed before the next starts.

| Part | Scope | Brief | Status |
| --- | --- | --- | --- |
| 1 | Foundations: colour, type, space, radius, elevation, grid, motion tokens | §11–§16 | Approved 8 Oct 2026 |
| 2 | Component library (20 families, all states), in three batches: 2a form controls, 2b feedback and overlays, 2c cards and booking | §13 | 2a in review |
| 3 | Homepage with scroll motion | §6, §15 | Planned |
| 4 | Assessment A0–A4 with branching | §7, §8 | Planned |
| 5 | WhatsApp / email handoff and processing | §9 | Planned |
| 6 | Results, no-match, manual review, booking | §10 | Planned |

Decisions made so far, and the brief's open questions, are logged in
[`docs/decisions.md`](docs/decisions.md).

## Running it

Requires Node 22.18 or newer (scripts run TypeScript directly).

```bash
npm install
npm run dev        # http://localhost:3000; design system at /design-system (+ /forms, /feedback, /cards)
```

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js; both `dev` and `build` regenerate tokens first |
| `npm run tokens` | Regenerates token files from `src/design/tokens.ts` |
| `npm test` | Unit tests: contrast audit (every allowed colour pair meets WCAG 2.2 AA), fluid type maths, generated files up to date, Singapore phone / S$ amount / email rules |
| `npm run test:e2e` | Browser tests on a production build: axe WCAG 2.2 AA scan of every page, no sideways scroll at 320px, keyboard and error flows. Desktop and mobile Chromium |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Generates Next route types, then `tsc --noEmit` |

## Design tokens

`src/design/tokens.ts` is the single source of truth. `npm run tokens` writes:

- `src/styles/tokens.css`: CSS custom properties plus one `.type-*` class per type style
- `public/tokens/dfx.tokens.json`: W3C DTCG tokens for Figma Variables (via Tokens Studio or a DTCG importer)

Never edit the generated files by hand; `npm test` fails when they drift.

Naming follows brief §13. A token path such as `color.semantic.text.primary`
becomes `--color-text-primary`; palette primitives are `--palette-*`;
`space.6` is `--space-6` (24px, the multiple of 4); motion is
`--motion-duration-*`, `--motion-easing-*`, `--motion-distance-*`. Components
use semantic tokens only, never palette hex values.

Reduced motion: every duration, distance and scale token has a reduced
value, applied automatically under `prefers-reduced-motion: reduce` or on any
element with `data-motion="reduced"`.

## Structure

```
src/
  app/
    page.tsx               build hub (becomes the homepage in Part 3)
    design-system/         Part 1 foundations and Part 2 components documentation
  components/              button, form (fields, choices, select, consent, error summary),
                           progress, question, review, icon, brand
  design/                  tokens, generators and the contrast audit
  lib/format.ts            Singapore phone, S$ amount and email formatting and validation
  styles/tokens.css        generated
e2e/                       Playwright + axe browser tests
scripts/build-tokens.ts    writes the generated token files
docs/decisions.md          decision log and open business questions
```

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, CSS
Modules on top of the token custom properties. Fonts are Inter (UI) and Plus
Jakarta Sans (headlines) via `next/font` (self-hosted, Open Font License),
with Simplified Chinese and Tamil system-font fallbacks.
