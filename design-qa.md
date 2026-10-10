# Design QA: DFX paper-and-ink update

Date: 10 October 2026

## Source truth and comparison method

- Design specification: `C:/Users/swaga/Downloads/Design Brief De-AI-ing claude-2-delta.docx`.
- Interaction audit and before-state evidence: `C:/Users/swaga/Downloads/DFX-UX-design-audit.pdf`. Rendered audit pages 27 and 30 are 745 × 1053 pixels at `../audit-page-27.png` and `../audit-page-30.png` in this task workspace.
- The linked Claude artifact returned “Page not found”. It was not treated as an inspected design.
- The Word document is a written redesign specification, not a pixel mockup. The PDF screenshots document the old site. This review therefore checks the written hierarchy, palette, typography and behavior, rather than declaring a pixel match to the old page. The old marketing mockups are intentionally removed.

## Browser evidence

Final implementation ran from a Next.js production build in Chrome. Full-page screenshots use 1 device pixel per CSS pixel, with no density scaling or image stretching.

| Evidence | Viewport / state | Screenshot pixels |
| --- | --- | --- |
| `docs/qa/home-desktop.png` | 1280 × 900, homepage, full document | 1280 × 3434 |
| `docs/qa/home-mobile.png` | 375 × 900, homepage, full document | 375 × 5513 |
| `docs/qa/assessment-mobile.png` | 375 × 900, personal purpose selected | 375 × 900 |
| `docs/qa/route-comparison.png` | 1280 × 900, two route explanations, focused region | 758 × 1266 |
| `public/images/review-screen.png` | Actual review screen, fictional test answers, cropped to heading and first two groups | 720 × 554 |

Additional task deliverables include the 768px homepage, validation, policies and full results screenshots. Full-page evidence establishes ordering, density and whitespace. Focused assessment and result captures establish control states, typography, comparison text and action hierarchy.

## Required visual surfaces

1. **Fonts and typography:** browser computed styles show Schibsted Grotesk loaded at 375, 768 and 1280px, followed by the retained CJK and Tamil fallbacks. Headlines wrap without clipping; body text is 17px, with smaller supporting labels. Only one font family is downloaded.
2. **Spacing and layout:** the homepage uses two columns on wider screens and one on phones. The six purposes are ruled, tappable rows. FAQs are open. Assessment steps share a 720px desktop main column and 16px mobile side margins. At 375 × 900, Continue is a 343 × 48px control at y=840, within thumb reach. No horizontal overflow was measured at 375, 768 or 1280px; automated checks also cover 320px.
3. **Colours and tokens:** the page background is exactly `rgb(246,245,241)`. Green ink, warm rules, lime selection and restrained red errors replace the prior accent palette. Legacy colour keys are neutral aliases, and glow opacity is zero. Allowed foreground/background pairs pass contrast tests. Darker input outlines and the ink inner focus ring deliberately preserve accessible contrast.
4. **Image quality:** the only new visual asset is a lossless screenshot captured from the running review screen. Its aspect ratio is preserved. The caption identifies example answers. There are no fabricated lender logos, stock people, silhouettes or reconstructed interface illustrations. Missing approved media is omitted.
5. **Copy and content:** the hero describes the outcome and states that a contact channel is required at review. Unverified completion times and fake company identifiers are absent. Results distinguish route structures and tradeoffs, without ranking or promising rates, approval, timing or fee-free repayment. Missing business contacts remain explicit. Policy review notes remain because review has not been supplied.

## Interaction and accessibility checks

- Hero links select the intended goal, including a fresh-tab deep link. A saved draft is preserved until the user explicitly restarts.
- Personal and business branches, changing goals, changing answers from review, required-field errors, browser Back/Forward, refresh recovery and consent submission work on desktop and mobile.
- Error summaries receive focus and link to the affected field. Skip links, the mobile navigation dialog and reduced-motion behavior pass.
- Result-link recovery, all result outcomes, booking conflict, confirmation, calendar download and cancellation pass. A route-specific booking retains the selected option. Updating result answers restores the review data.
- Automated WCAG 2.2 AA checks pass for public pages, component documentation and the tested assessment, handoff, result and booking states. Browser console-error checks pass on the scanned routes. Manual capture recorded zero page errors.

## Comparison and repair history

- **P1, homepage hierarchy:** the old floating previews and repeated story were removed. The live purpose list, one process section and open FAQs now follow the supplied document. Evidence: full desktop and mobile captures.
- **P1, result usefulness:** repeated preference-based reasons previously implied differentiation. Route-specific structural explanations, explicit tradeoffs and unconfirmed preference statuses now make the distinction visible. Evidence: focused route comparison and result tests.
- **P2, visual consistency:** old form sidebars changed column width, policy pages lacked contents, and public pages showed placeholder badges. The shared layout, fixed main-column width, contents lists and conditional real business fields resolve these mismatches.
- **P2, legacy swatch contrast:** two internal design-system swatches failed after the ink update. Legacy accent values were mapped to the new neutral palette. Both desktop and mobile accessibility scans now pass.
- Initial test failures for old CTA labels were updated to the new visible copy. Two route-booking assertions targeted a hidden, cached result heading; they now assert the visible booking context. The corrected tests pass on desktop and mobile.

## Validation result

- Production build: passed.
- ESLint and TypeScript: passed.
- Unit tests: 59 passed.
- Browser scenarios: 161 passed across the complete four-suite run and targeted rerun; one phone-only scenario is intentionally skipped on desktop. The broad run passed 159 scenarios; a final six-test rerun passed the two corrected booking assertions and rechecked desktop/mobile submission and validation after the help-link styling change.
- `git diff --check`: passed.

## Expected limits and follow-up polish

- The existing handoff and booking service remains a browser-based prototype. No production backend or policy sign-off is claimed. Real contact details, company registration, approved lender assets and real team photography remain DFX inputs, as specified in the brief.
- The existing outline icon set remains consistent but is not replaced by Phosphor. The optional paper texture is omitted. These are P3 refinements; neither blocks the implemented flows or paper-and-ink direction.
- Manual testing with VoiceOver, NVDA and TalkBack, and browser coverage in Safari/Firefox, remains outstanding. Automated accessibility checks are not a claim of full conformance.
- GitHub publishing and live deployment are outside this local QA result. The saved GitHub sign-in must be refreshed before publishing the prepared branch.

## Implementation checklist

- [x] Apply the supplied visual system and reduce repeated marketing content.
- [x] Preserve and test the assessment and recovery flows.
- [x] Improve route comparison and retain booking context.
- [x] Inspect full-page and focused desktop/mobile screenshots.
- [x] Pass build, code checks and the scoped browser tests.

Final result: passed
