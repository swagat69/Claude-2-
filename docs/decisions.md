# Decision log

Decisions taken while designing from the DFX Design Brief v1.0. Each one
records who decided, what, and why, so later parts and reviewers can trace it.

## Confirmed by the product owner (8 Oct 2026)

| Decision | Choice | Notes |
| --- | --- | --- |
| Build format | Next.js + React | Matches brief §23 "React / Next.js + Motion" route; the design is built as real, responsive screens rather than Figma frames. |
| Product | Loan / credit matching | Copy, use-case tiles and assessment questions assume a loan-matching service (like the Lendela reference), never implying approval or rates. |
| Market | Singapore | SGD, +65 phone numbers, `en-SG` locale. Legal footer and disclosures still need local review. |
| Brand | No existing assets | Placeholder "DFX" text wordmark and the brief's proposed palette. |

## Part 1 foundations: approved by the product owner (Gate 3, 8 Oct 2026)

All proposals below were approved as written except the headline typeface,
which was changed after review (row 6).

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Primary action colour | Forest `#16372C` with white text for every primary button. Lime is accent and selection, never a button on light pages. | Brief lists Forest as "deep CTA"; white on Forest is 13:1. |
| 2 | Focus ring | Blue `#415EC8` on light surfaces, lime on forest; 2px ring, 2px offset. | Distinct from ink text, ≥3:1 on every surface it appears on. |
| 3 | Progress stepper | Completed = forest + check; current = lime with ink outline; upcoming = line grey. Stage names collapse to "Step N of 4 · Stage" in narrow containers. | Lime alone is 1.2:1 on white, invisible as a state marker. Four stage names don't fit side by side under ~420px. |
| 4 | Button radius | 16px for every button. | Brief §12 radius scale says 16; H0.2 says 18 for the hero CTA. One value keeps the system consistent. |
| 5 | Derived colours | 14 extra values (hover, pressed, field border, feedback text and tints, lime tint). | The brief's palette has no accessible versions of these; `line` (1.3:1) can't be an input border, `green` (2.9:1) can't be success text. |
| 6 | Typefaces | Plus Jakarta Sans for Display XL / L (720 / −0.03em and 680 / −0.025em), Inter for everything else. Simplified Chinese and Tamil system fonts as fallbacks. | Replaced Space Grotesk after review: its monospace-derived shapes read as crypto / developer tooling, not a trusted money decision. Plus Jakarta Sans is warm and premium, fits the hero in two lines on a 390px phone and reaches 800 weight. Inter stays for its screen legibility and tabular figures. Tracking is looser than the brief's −0.045em because Plus Jakarta Sans collides at that setting. Fallbacks cover Chinese and Tamil names typed into forms. All fonts are OFL. |
| 7 | Glow colours | Saturated base colours (`#F06BA8`, `#4CC26F`, `#FF9A3D`) rendered at the brief's 18–36% opacity. | At that opacity, pastel bases would barely show; these land on soft pastels over paper. |
| 8 | Eyebrow tracking | +0.1em. | §12 type table says 0.1em, H0.2 says 0.12em. |

## Part 2a form components: approved by the product owner (8 Oct 2026)

Approved as written.

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Error position | Error message between label and field, plus an error summary at the top after a failed submit. | Brief §13 says "error below field", but §16 says the keyboard must never cover an error; below the field, an open keyboard hides it. GOV.UK pattern, which the brief cites [R8]. |
| 2 | Validation timing | Format errors appear on blur; missing answers on submit. Errors clear, and the summary changes, only on the next submit. | Clearing on blur moved the button just as people pressed it, losing the press (caught by the browser tests; brief §14 forbids moving a target while it's tapped). |
| 3 | "Not sure" | Shown apart, under an "or" divider (cards) or dashed (chips). | Reads as a legitimate answer, not one more option to compare. |
| 4 | Busy buttons | `aria-busy` + `aria-disabled`, ignoring repeat presses, instead of `disabled`. | Keeps keyboard focus; still prevents duplicate submissions. |
| 5 | Select | Native select; a searchable combobox only for lists of ~15+ options; ≤5 options use choice cards. | Most reliable on phones and with screen readers. |
| 6 | Marketing consent | One unticked checkbox per channel (email, WhatsApp), separate from the required processing notice. | Brief §17 and §19; Singapore's PDPA Do Not Call rules cover marketing to phone numbers. Wording needs legal review. |

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
