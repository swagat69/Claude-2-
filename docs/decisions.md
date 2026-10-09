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

## Part 5 handoff and processing: proposed (owner asked to finish all parts)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Stand-in services | Until DFX's assessment API, messaging and scheduler exist, one prototype module (`src/lib/service/api.ts`) plays their part, with realistic delays, in this browser's localStorage so links work across tabs. Dashed "Prototype only" panels show what WhatsApp or the inbox would receive and let reviewers trigger every state. The hub has "Jump to a state" shortcuts. All of it is removed when the real services connect. | Brief §22 asks for clickable happy, no-match, link-expiry, form-error and channel-failure routes. |
| 2 | Lifecycle | The brief's §20 states as a small state machine with only the allowed transitions (unit tested): submitted → awaiting contact → verified → processing → result / human review / no match / failed → booking. | Brief §20: prevents "submitted", "messaged", "result ready" and "call booked" getting mixed up. |
| 3 | WhatsApp (W1) | Click-to-chat preview: the named business account, the exact prefilled message (a short reference, never answers), "Nothing is sent until you press send". After opening: "Waiting for your message", plus help if WhatsApp didn't open (retry, copy the message, switch to email). The business number is a Placeholder, so the prototype simulates the chat. | Brief W1, §19 WhatsApp guardrails, §8 "launch fails". |
| 4 | Email (E1) | Email prefilled and editable, with a typo hint ("Did you mean ana@gmail.com?"). Status shows what the email service actually reported: sending → sent → delivered, or bounced with "Change the address". 60-second resend wait, 3 sends per 15 minutes (Placeholders). | Brief E1: never claim delivery because a request was queued; rate-limit resend. |
| 5 | Resume links | `/resume?token=…`: single use, 24 hours (Placeholder). Expired, used and broken links each say so plainly and offer "Send me a new link", which always answers the same way so it never reveals whether an email has an assessment. The tab that opened the link gets a session; the result never appears in a URL. | Brief §8, §9 "what the handoff must preserve", §24 "Email typo/expiration/resend". |
| 6 | Processing (M1) | Under a second: straight to the result. Longer: the three real steps from the service's own state, no percentage, a live status for screen readers, and focus moves to the result when it arrives. | Brief M1. |

## Part 6 results and booking: proposed (owner asked to finish all parts)

| # | Topic | Proposal | Reason |
| --- | --- | --- | --- |
| 1 | Results engine | A stand-in (`src/lib/service/engine.ts`) with Placeholder routes per goal and reasons taken from answers but never repeating income, age or residency. "Not sure yet" and pending business registration go to a person. The real engine replaces it; the page never scores or ranks. | Brief §20: the UI must not invent fit. |
| 2 | Routes found (R1) | Status card, then 1–2 "Suggested route" cards "in no particular order" with reasons, dated example facts and small print, then "Answers you sent". Call panel beside it (8/4) from 1024px; on phones after the explanation, plus a bottom call button only after the first route has been read and never over the panel. "No thanks, keep my results" keeps everything on screen. | Brief R1, results-card anatomy, C1. |
| 3 | A person needs to look (R2) | What we know, what's missing, why a call helps; "Talk it through" or "Continue later". No failure framing or urgency. | Brief R2. |
| 4 | No match (R3) | The reason, "Check and change my answers" (a new check with everything filled in), other places to get help (Placeholder list), and a separate, unticked "tell me if something comes up". No call invitation, and the booking page redirects away. | Brief R3: dignity, correction, no unrelated sales funnel. |
| 5 | Error (R4) | "We couldn't load your result just now", answers safe, Try again, Get help. Automatic retries with backoff happen in the data layer before this screen appears. Never shown as "no match". | Brief R4. |
| 6 | Booking (C1) | Phone or video, the agenda and length beside the form, Singapore time always labelled with the device's zone offered, nothing preselected, unavailable times visible but disabled. Confirm rechecks the slot; if it was just taken, the slot is marked unavailable and every other choice is kept. Rescheduling keeps the old booking until the new one is confirmed. | Brief C1, §20 "check availability at confirm time", §24 "Booking slot conflict". |
| 7 | Confirmation (C2) | Only after the scheduler confirms: date, time and zone (and the device's time if different), how and with whom, what to have ready, an add-to-calendar file (.ics, UTC), change time, and cancel with a confirmation. | Brief C2, §24 "Timezone and daylight saving". |
| 8 | Analytics | The brief §21 events for Parts 5–6 (handoff, resume, processing, result, card opened, call CTA, booking) through the same allow-list: codes, counts and coarse time buckets only. | Brief §21. |

## Answers decided on the owner's instruction (9 Oct 2026)

The owner asked me to research the 17 open questions and decide them myself.
Each answer below is applied in the code; where it replaces a Part 5 or 6
Placeholder above, this table wins. Business facts live in one file,
`src/config/business.ts`, so any of them is a one-line change. The rules
follow public Singapore norms, not any lender's private criteria, and should
be checked against DFX's actual lending partners once they're signed.

| Q | Topic | Decision | Why, and sources |
| --- | --- | --- | --- |
| 1 | Company and licence | DFX is a **loan-matching service, not a lender**, introducing people only to **banks and financial institutions regulated by MAS**. It doesn't work with licensed moneylenders. Footer, terms and gate pages say so. Legal entity and UEN stay Placeholders. | Since 1 April 2025, licensed moneylenders may advertise only in directories, on their own websites and at their premises, which rules out a third-party matching site ([Registrar's advertising directions](https://rom.mlaw.gov.sg/files/Directions_Moneylendersadvertisements.pdf)). Introducing borrowers to banks for loans isn't a regulated financial advisory service (loans aren't investment products), but the wording needs a Singapore lawyer before launch. |
| 2 | Loan types | Keep all six: personal, debt consolidation, renovation, business, education, not sure. "Not sure" always goes to a person. | Each is a mainstream bank product in Singapore with public eligibility norms (sources in Q4). |
| 3 | Partners and proof | No lender names, logos or testimonials until DFX has written permission. The trust strip keeps the three promises that are true by design. | Brief H0.3; MAS-regulated banks control the use of their marks. |
| 4 | Assessment questions | Kept as built, plus one: **who owns the home** (own / family / rent) for renovation, because renovation loans are for owners and their families. The results engine (`src/lib/service/engine.ts`) now suggests real kinds of loan with typical October 2026 terms: personal instalment loan, credit line, Debt Consolidation Plan, balance transfer, renovation loan, education loan, business term loan, and working capital (EFS). | DCP: Singapore citizens and PRs earning S$20,000 to S$119,999, unsecured debt over 12× monthly income ([Credit Counselling Singapore](https://ccs.org.sg/debt-consolidation-plan/)); renovation: up to 6× monthly income or S$30,000 ([SingSaver](https://www.singsaver.com.sg/personal-loan/blog/how-much-renovation-loan-can-i-get)); EFS working capital up to S$500,000 over 5 years ([Enterprise Singapore](https://enterprisesg.gov.sg/financial-support/enterprise-financing-scheme---sme-working-capital)); balance transfer fees and periods ([MoneySmart](https://moneysmart.sg/personal-loan/balance-transfer-singapore-ms)). |
| 5 | Hard stops | **Real**: lives in Singapore, aged 21 or over, business registered in Singapore with a UEN. **Soft** (sends the person to a specialist, never stops them): 65 or over; not working or retired; income under S$2,000 a month; work pass holder earning under S$4,000; business trading under 6 months; registration in progress; goal not sure. The DCP is shown only to citizens and PRs who owe S$20,000 or more and earn under S$10,000 a month; otherwise balance transfer and a personal loan, with a note saying why. Renters asking about renovation get a personal loan, with a note. | Bank minimums are about S$20,000 to S$30,000 a year for locals and S$40,000 to S$60,000 or more for foreigners ([MoneySmart](https://www.moneysmart.sg/personal-loan/can-foreigners-get-personal-loans-in-singapore-ms), [SingSaver](https://www.singsaver.com.sg/personal-loan/comparison/best-personal-loans-for-foreigners-in-singapore)); most cap age at 65. Brief §8: only verified gates may stop someone. |
| 6 | Saving answers | Unsent answers stay **in this tab only, for 1 hour** after the last change. No resume on another device before sending; after sending, the secure link resumes. | Answers include income and residency; on a shared device, the tab should forget them. Once sent, the server copy and the link cover "carry on later". |
| 7 | WhatsApp | **WhatsApp Business Platform (Cloud API) through a provider**, not the Business app. Click-to-chat from the site; replies inside the free 24-hour customer service window. Display name "DFX"; the number is DFX's to supply. | The API gives delivery status, templates, CRM logging and several agents; the app doesn't. Messages inside the customer service window are free ([Meta pricing updates](https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing)). |
| 8 | Email | **Postmark** for transactional email (delivery and bounce webhooks drive the "delivered / bounced" states). Links are **single use, 15 minutes**; resend after 60 seconds, at most 3 per 15 minutes. The sender address waits on DFX's domain. | Short-lived, single-use tokens are standard practice for emailed sign-in links ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)); 24 hours was longer than needed when a new link takes seconds. |
| 9 | Who sees the data | **HubSpot** CRM for answers and contact details; WhatsApp (Meta) and Postmark get only the number or email and a reference; Google Analytics gets codes and counts. **Lenders get nothing** unless the person agrees, on a call or in writing, to a named lender. Retention: **30 days after last activity**; a record of any introduction kept 5 years. | PDPA consent, purpose, retention and transfer obligations ([PDPC](https://www.pdpc.gov.sg/)); marketing only with the unticked per-channel boxes, which also satisfies the Do Not Call rules ([PDPC DNC](https://www.pdpc.gov.sg/overview-of-pdpa/do-not-call-registry/individual/do-not-call-registry-and-you)); 5 years matches the Companies Act record-keeping period. |
| 10 | Results | **Instant**, from the rules above; anything the rules can't settle goes to a specialist **within one working day**. Results are kept 30 days after the last activity. | People expect an answer on screen; the review covers the cases a rule shouldn't decide alone. |
| 11 | Route facts | Typical terms only (tenure, who it's for, fees), labelled "Typical in Singapore, October 2026. Your lender sets the actual terms." **No interest rates**: "Set by the lender after review". | Rates change often and depend on the person; a stale or average rate would be an invented claim (brief §19). Sources as in Q4. |
| 12 | Other help | Yes: **MoneySense**, **Credit Counselling Singapore**, **Credit Bureau Singapore**, and **Enterprise Singapore** for businesses. Contact page adds **FIDReC** for disputes with a bank. | All free, public or independent ([MoneySense](https://www.moneysense.gov.sg/), [CCS](https://www.ccs.org.sg/), [Credit Bureau Singapore](https://www.creditbureau.com.sg/), [FIDReC](https://www.fidrec.com.sg/)). |
| 13 | The call | **Free, about 15 minutes**, by phone or **Google Meet** video (opens in a browser, no install), with "a DFX loan specialist": a role, no names or photos until DFX supplies them. | Short and free keeps it low-pressure (brief C1: a call is never required). |
| 14 | Booking | **HubSpot Meetings** (same system as the CRM). **Monday to Friday, 9am to 6pm Singapore time**; calls start 9:00 to 17:30; **Singapore public holidays skipped** (2026 and 2027 lists in `src/lib/service/slots.ts`). Confirmation by the chosen channel plus a calendar invite, and a reminder the day before. | One system for contacts and meetings; holiday dates from the gazetted lists ([MOM](https://www.mom.gov.sg/employment-practices/public-holidays)). |
| 15 | Support | **WhatsApp and email**, Monday to Friday 9am to 6pm except public holidays, reply **within one working day**, by "loan specialists based in Singapore". The number and address wait on DFX. | Matches the booking hours, so promises are consistent. |
| 16 | Brand | **Keep the text wordmark** until DFX commissions a logo. | No brand assets exist; a made-up logo would need replacing. |
| 17 | Going live | **Google Analytics 4 through Google Tag Manager** (the site already pushes an allow-listed `dataLayer`), **Vercel** hosting in its Singapore region. A live preview needs DFX's own Vercel account. | GTM reads `dataLayer` as built; Vercel is made by the Next.js team and has a Singapore region. |

The info pages are now real: privacy notice (written to the PDPA obligations),
terms of use, contact and an accessibility statement. Privacy and terms carry
one Placeholder each: review by a Singapore lawyer before launch.

## Still needed from DFX

Only DFX can supply these. Each is a Placeholder tag on the site.

- Registered company name, UEN and address (footer, privacy notice, terms).
- WhatsApp Business display name approval and number (handoff, contact page).
- Email domain and sending address (contact page, email handoff).
- Data Protection Officer contact (privacy notice, contact page).
- A Singapore lawyer's review of the privacy notice, terms and the regulatory line.
- A Vercel account, if you'd like a live preview link.
- Later: lending partners' own criteria (to replace the indicative rules), names or photos of the people who take calls, and any lender logos or customer quotes you have permission to use.
