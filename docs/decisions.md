# Decision log

Decisions taken while designing from the DFX Design Brief v1.0. Each one
records who decided, what, and why, so later parts and reviewers can trace it.

## Confirmed by the product owner (8 Oct 2026)

| Decision | Choice | Notes |
| --- | --- | --- |
| Build format | Next.js + React | Matches brief §23 "React / Next.js + Motion" route; the design is built as real, responsive screens rather than Figma frames. |
| Product | Loan / credit matching | Copy, use-case tiles and assessment questions assume a loan-matching service (like the Lendela reference), never implying approval or rates. |
| Market | Singapore | SGD, +65 phone numbers, `en-SG` locale. Legal footer and disclosures still need local review. |
| Brand | No existing assets | Placeholder "DFX" text wordmark; the brief's proposed palette; Inter + Space Grotesk. |

## Proposed in Part 1: awaiting sign-off (Gate 3)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Primary action colour | Forest `#16372C` with white text for every primary button. Lime is accent and selection, never a button on light pages. | Brief lists Forest as "deep CTA"; white on Forest is 13:1. |
| 2 | Focus ring | Blue `#415EC8` on light surfaces, lime on forest; 2px ring, 2px offset. | Distinct from ink text, ≥3:1 on every surface it appears on. |
| 3 | Progress stepper | Completed = forest + check; current = lime with ink outline; upcoming = line grey. Stage names collapse to "Step N of 4 · Stage" in narrow containers. | Lime alone is 1.2:1 on white, invisible as a state marker. Four stage names don't fit side by side under ~420px. |
| 4 | Button radius | 16px for every button. | Brief §12 radius scale says 16; H0.2 says 18 for the hero CTA. One value keeps the system consistent. |
| 5 | Derived colours | 14 extra values (hover, pressed, field border, feedback text and tints, lime tint). | The brief's palette has no accessible versions of these; `line` (1.3:1) can't be an input border, `green` (2.9:1) can't be success text. |
| 6 | Typefaces | Space Grotesk (Display XL / L only), Inter for everything else. | Brief §12 recommendation; both OFL, free to use. Space Grotesk tops out at 700, so Display XL uses 680 (brief: 650–750). |
| 7 | Glow colours | Saturated base colours (`#F06BA8`, `#4CC26F`, `#FF9A3D`) rendered at the brief's 18–36% opacity. | At that opacity, pastel bases would barely show; these land on soft pastels over paper. |
| 8 | Eyebrow tracking | +0.1em. | §12 type table says 0.1em, H0.2 says 0.12em. |

## Open business questions (brief §25)

These must be answered before the relevant part is finalised. They don't
block Parts 1–2.

- Exact assessment topics, fields and qualification logic (blocks Part 4).
- Are results instant, manually reviewed, or both? What can safely be shown? (blocks Part 6)
- What "right profile" means operationally: hard gates, CRM fit rubric (Parts 4, 6).
- WhatsApp and email: alternatives, sequential or simultaneous? Which WhatsApp account/provider? What consent wording? (Part 5)
- Who books the call: external scheduler, CRM workflow or a representative? Working hours? (Part 6)
- Approved claims, testimonials, partner logos, legal entity and disclosures (Part 3).
- Regulatory status in Singapore and required disclosures for a loan-matching service.
- Analytics, CRM and hosting stack.
