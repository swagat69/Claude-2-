# DFX website

Design and build of the DFX loan-matching funnel: homepage → 3–4 assessment
steps → WhatsApp or email handoff → results → a qualified call. It follows
the **DFX Design Brief v1.0** (8 October 2026) and is designed in six parts,
each reviewed before the next starts.

| Part | Scope | Brief | Status |
| --- | --- | --- | --- |
| 1 | Foundations: colour, type, space, radius, elevation, grid, motion tokens | §11–§16 | Approved 8 Oct 2026 |
| 2 | Component library (all 20 families, every state), in three batches: 2a form controls, 2b feedback and overlays, 2c cards, booking and navigation | §13 | 2a approved; 2b and 2c in review |
| 3 | Homepage with scroll motion | §6, §15 | In review |
| 4 | Assessment A0–A4 with branching | §7, §8 | In review |
| 5 | WhatsApp / email handoff and processing | §9 | In review |
| 6 | Results, no-match, manual review, booking | §10 | In review |

Decisions made so far, with sources, and the few facts only DFX can supply,
are logged in [`docs/decisions.md`](docs/decisions.md). Business facts and
policies (regulatory line, fees, hours, retention, link lifetime, call
details) live in one file, `src/config/business.ts`.

Parts 5 and 6 run on a stand-in for DFX's systems, WhatsApp and email
(`src/lib/service/api.ts`), so every state can be clicked through before the
real services exist. The build hub (`/hub`) has "Jump to a state" shortcuts,
and dashed "Prototype only" panels on those pages trigger the other states.

## Running it

Requires Node 22.18 or newer (scripts run TypeScript directly).

```bash
npm install
npm run dev        # http://localhost:3000: homepage at /, assessment at /assessment, build hub at /hub, design system at /design-system
```

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js; both `dev` and `build` regenerate tokens first |
| `npm run tokens` | Regenerates token files from `src/design/tokens.ts` |
| `npm test` | Unit tests: contrast audit (every allowed colour pair meets WCAG 2.2 AA), fluid type maths, generated files up to date, Singapore phone / S$ amount / email rules, booking time zones and daylight saving, assessment routing, validation, hard stops and pruning, saved-answer storage, analytics privacy filter, lifecycle transitions, results rules (soft referrals, Debt Consolidation Plan eligibility), booking times and public holidays, calendar file, email typo hints, link expiry and rate limits |
| `npm run test:e2e` | Browser tests on a production build: axe WCAG 2.2 AA scan and console-error check of every page, no sideways scroll at 320px, keyboard, dialog, error and booking flows, and the assessment's QA scenarios from brief §24 (branching, change from review, hard stop, refresh and Back, deep links, start again, no PII in analytics), and Parts 5–6 (WhatsApp and email handoff, expired and used links, every result state, booking conflict, calendar file, cancel). Desktop and mobile Chromium |
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
    (site)/                public site: homepage (/), privacy, terms, contact and
                           accessibility, sharing SiteHeader + SiteFooter
    (flow)/assessment/     Part 4: start screen, goal, situation, preferences, review and
                           hard stop; Part 5 handoff at /assessment/continue
    (flow)/resume/         Part 5: opening a WhatsApp or email link
    (flow)/results/        Part 6: processing, results, booking and confirmation
    (flow)/_prototype/     "Prototype only" panels that stand in for WhatsApp, email and DFX's systems
    hub/                   build hub listing the six parts
    design-system/         Part 1 foundations and Part 2 components documentation
    not-found.tsx          404 page
  components/              button, form (fields, choices, select, consent, error summary),
                           progress, question, review, feedback (notice, toast, empty
                           state), overlay (dialog/sheet), status, help (info tip), faq,
                           result (route card), advisor, booking (slot picker),
                           category (ticket tile, pictograms), photo (real photo or placeholder), decor (ambient orb), nav (header,
                           back link), icon, brand
  config/                  business facts and policies, independent help services, photo and
                           logo slots (media.ts)
  design/                  tokens, generators and the contrast audit
  lib/format.ts            Singapore phone, S$ amount and email formatting and validation
  lib/time.ts              booking times: Singapore time by default, any zone, DST-safe
  lib/assessment/          questions (one file), routing and validation,
                           saved draft (sessionStorage), privacy-safe analytics
  lib/service/             PROTOTYPE stand-in for the assessment API, messaging and scheduler,
                           lifecycle state machine, indicative results engine, booking times
  lib/ics.ts               calendar file for a booked call
  styles/tokens.css        generated
e2e/                       Playwright + axe browser tests
scripts/build-tokens.ts    writes the generated token files
scripts/render-brand.mjs   renders the favicon, app icons and share image from scripts/brand/
docs/decisions.md          decision log, sources, and what DFX still needs to supply
```

Facts only DFX can supply (legal entity and UEN, WhatsApp number, email
address, Data Protection Officer contact, team photos, lender logos) and the
pending legal review are wrapped in
`<Placeholder>`: it renders a visible "Placeholder" tag and a
`data-placeholder` attribute. Before launch, `grep -rn "<Placeholder" src`
must return nothing.

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, CSS
Modules on top of the token custom properties. Fonts are Inter (UI) and Plus
Jakarta Sans (headlines) via `next/font` (self-hosted, Open Font License),
with Simplified Chinese and Tamil system-font fallbacks.
