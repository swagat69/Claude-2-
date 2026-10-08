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

## Part 2b feedback and overlays: proposed (owner asked me to proceed on my calls)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Toasts | Only for confirmations that already worked; never errors. 6s, paused on hover/focus, max three, always closable. | A toast disappears; brief §13 says a critical error must persist until the person can act. |
| 2 | Dialogs | Native `<dialog>`: bottom sheet on phones, centred from 768px; backdrop closes unless that would lose work; destructive confirmations focus the safe choice. | Thumb reach on phones; native focus handling and inert background. |
| 3 | Waiting | Processing lists real backend steps with a static marker; no spinner, percentage or fake delay; says you can leave. | Brief M1 and R4. |
| 4 | "No match" tone | Peach, distinct from orange (system problem) and red (form error). | Brief R3: dignity, "no red panic screen". |
| 5 | Help tips | Toggletips opened by click/tap, never hover-only; text announced via a live region. | Brief §13 family 14: touch, mouse and keyboard. |
| 6 | FAQ | Native `<details>`, optional single-open mode; nothing opens by itself. | Brief H0.7 and family 15. |

## Part 2c cards, booking and navigation: proposed (owner asked me to proceed on my calls)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Result cards | "Suggested route", never "Top pick" or a match %; facts only when verified, with their date; placeholders labelled. | Brief §10 results-card anatomy and §19 trust cues. |
| 2 | Result layout | Result 8 columns, call invitation 4 on wide screens; call panel after the explanation on phones; declining keeps results. | Brief R1 and C1. |
| 3 | Lime button | Only on the forest advisor panel. | Keeps Part 1 decision 1; the invitation stands out without competing with the result. |
| 4 | Booking | Singapore time with UTC offset always shown; device zone offered when different; full/taken slots visible but disabled; single-column times on phones; choosing ≠ booking. | Brief C1, C2 and §24 timezone/DST scenario. |
| 5 | Header | Sticky and compressing 78→64px from 768px; on phones a plain 64px row that scrolls away; menu as a bottom sheet; layout switches by the header's own width. | Brief H0.1 and §16 ("no large sticky nav" on mobile). |
| 6 | Orbs | Decorative only: aria-hidden, no pointer events, ≤16px drift with a mouse and motion allowed, hidden under reduced transparency. | Brief §11, §14 and family 17. |

## Part 3 homepage: proposed (owner asked me to start building)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Copy | Brief's example headline kept; loan-specific supporting line; every business fact (loan categories, support hours/channels/team, reply time, legal entity, regulatory line, who contacts users) wrapped in a visible Placeholder tag. | Brief: "Replace with category-specific approved copy before launch"; never imply claims the product can't substantiate. |
| 2 | Proof | Trust strip uses three promises that are true by how the product works (review before sending; you choose the channel, no marketing without consent; a call only if it helps). No partner logos or testimonials. | Brief H0.3: logos only if authorised, testimonials only with permission. |
| 3 | People | Brand-owned illustration in the support section; no stock or AI-generated people. Swap in real team photos when available. | Brief H0.8. |
| 4 | Previews | Hero and "A look inside" use token-built illustrations of the real components, labelled "Illustrative preview", hidden from screen readers and keyboard, with no invented figures. | Brief H0.2 and H0.6. |
| 5 | Motion | IntersectionObserver + CSS only, no animation library. Enter-once reveals; nothing hidden without JavaScript, with reduced motion, or above the fold. The preview is told by normal scrolling past a sticky panel (from 1024px only); no scroll-jacking. Hero orbs drift ≤16px with a mouse only. | Brief §14–15: one animation system, content visible with JS off, no scroll-jacking. |
| 6 | Categories | Six tiles, including Education loan, each linking to `/assessment?goal=…` so the first question can be preselected. | Brief H0.5: 4–6 tiles; categories pending product confirmation. |
| 7 | Routes | Build hub moved to `/hub`; placeholder pages for privacy, terms, accessibility and contact so no link 404s; a real 404 page. | A link that fails looks broken in review and in production. |
| 8 | Headline punctuation | Display headlines tuck `, . ? !` in by 0.06em (`DisplayText`). | Plus Jakarta Sans sets a visible gap before punctuation at 56–72px. |

## Part 4 assessment: proposed (owner said "next"; placeholder questions)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Questions | Realistic Singapore placeholders kept in one file (`src/lib/assessment/questions.ts`): goal (+ debts to combine, or business registration); situation by goal (residency, age range, work, income range, home type, or trading time and revenue range; timing); preferences (amount range, repayment period, priorities). Money is asked as ranges with "Not sure" or "I'd rather not say"; income and revenue are optional. | Brief §7: "Product, operations and legal must approve every question." One source of truth makes swapping them a one-file change (§17). |
| 2 | Hard stops | Three example gates, all tagged Placeholder: not living in Singapore, under 21, business registered outside Singapore. The reason shows next to the answer as soon as it is chosen; Continue leads to a stop page with the plain reason, "Change my answer", contact, and other places to get help. Nothing is sent. | Brief §8: verified hard gates only, state the real policy, never "you failed", always a way back. |
| 3 | Pages and state | One URL per step, so browser Back works. Answers save as they change, in `sessionStorage` for this tab only: they survive refresh and Back, are cleared when the tab closes or after 1 hour unused (Placeholder), and "Start again" clears them after a confirmation. | Brief §7 "Back preserves values", "defined expiry and revocation route"; §24 "resume after tab closed … otherwise explains safe restart". |
| 4 | Branching | Only questions the goal needs are asked. Changing goal names the answers that will be removed before Continue, then removes them; after the review has been seen, Continue skips straight back to it unless a new question needs answering. | Brief §8, A4 "Change returns to summary", §24 "Select and change goal". |
| 5 | Validation | Missing answers only on Continue; format problems (mobile, email) on blur; errors clear only on the next Continue. Error summary above the heading, inline errors by each field. | Part 2a rule, brief §7 field spec and §18. |
| 6 | Focus and progress | Focus moves to the step's heading after each in-app move, never on first load. Named stages ("Step 2 of 4 · Your situation"), no percentage. | Brief §7 "focus returns to heading", "show stage names not fake 75%". |
| 7 | Layout | Focused shell (logo, "Get help", slim footer) instead of the marketing header. One 720px column; situation adds a 280px "What to expect" rail and the review a 300px "What happens next" rail from 1024px. Phones get a one-line trust note instead of the situation rail, and full-width buttons. | Brief A0–A4 responsive rules. |
| 8 | Review and consent | Summary with a Change link per group; channel choice (WhatsApp or email) asks only for that channel's detail; first name optional; "Who sees what" before anything is sent; required-processing notice plus separate, unticked marketing boxes per channel; consent recorded with purpose, channel, wording version and time. The button names the channel: "Continue with WhatsApp". | Brief A4, §17, §19. |
| 9 | Analytics | Brief §21 events pushed to `window.dataLayer` through an allow-list: codes and counts only. Values with spaces, @ or long digit runs are refused. Homepage buttons add `?from=hero` etc., so starts are attributed without changing where they lead. | Brief §21, §24 "Analytics privacy", "Start from hero & final CTA". |
| 10 | Without JavaScript | The start screen still explains everything; a notice says the questions need JavaScript and links to contact; the Begin button is hidden rather than dead. | Answers live in the browser until a backend exists; an honest fallback beats a broken form. |
| 11 | After submit | `/assessment/continue` is a stub until Part 5 designs the WhatsApp/email handoff. Going Back to a step after sending shows a notice instead of the form, without trapping Back. | Brief §20 states: nothing is editable after "submitted". |

Fixed along the way: the skip link now targets the visible `main` (Next 16 keeps recent pages in the DOM, hidden, each with its own `#main`); smooth scrolling is limited to marketing and docs pages and turned off during page changes (`data-scroll-behavior`); clicking the drawn checkbox square now ticks it (it used to swallow the click).

## Open business questions (brief §25)

These must be answered before the relevant part is finalised. They don't
block Parts 1–2.

- Exact assessment topics, fields and qualification logic (Part 4 runs on placeholders until then).
- Which hard stops are real policy, and their wording (Part 4).
- How long answers may be kept in the browser, and whether a saved draft may be resumed later (Part 4).
- Are results instant, manually reviewed, or both? What can safely be shown? (blocks Part 6)
- What "right profile" means operationally: hard gates, CRM fit rubric (Parts 4, 6).
- WhatsApp and email: alternatives, sequential or simultaneous? Which WhatsApp account/provider? What consent wording? (Part 5)
- Who books the call: external scheduler, CRM workflow or a representative? Working hours? (Part 6)
- Approved claims, testimonials, partner logos, legal entity and disclosures (Part 3).
- Regulatory status in Singapore and required disclosures for a loan-matching service.
- Analytics, CRM and hosting stack.
