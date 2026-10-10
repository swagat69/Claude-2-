# DFX design update

The update follows the supplied **Design Brief De-AI-ing claude-2-delta.docx**, with interaction improvements from **DFX-UX-design-audit.pdf**. The Claude artifact URL returned “Page not found”; it was not used as verified visual evidence.

## What changed

- Schibsted Grotesk replaces the two previous font families. Paper, dark green ink, lime selection and warm rules replace the decorative colour system. Existing token names remain compatible, with old accent names mapped to neutral colours.
- The six loan purposes are real entry links in the hero. A new assessment opens at the selected purpose. Existing answers are preserved through the resume/restart screen.
- One process section replaces the repeated product story. Its image is a browser capture of the actual review screen using example answers, not a fabricated interface.
- All four FAQ answers are visible. The support and closing sections use simple text and rules. Lender logos are hidden until at least three approved assets exist; missing team photos produce no silhouette.
- The assessment keeps the same main-column width across steps. Mobile Continue actions stick to the bottom. Review groups use rules, error summaries take focus and link to fields, and contact actions state that answers will be saved before the channel handoff.
- Results explain the different structures and tradeoffs of routes. Unconfirmed costs, speed and repayment preferences are explicit. Route actions have equal emphasis. A selected route is retained in booking confirmation and the calendar download. Users can restore their result answers to the review screen.
- Contact, policies and the 404 use the shared shell. Policy pages have a desktop contents list. Placeholder company identifiers and public placeholder badges were removed.

## Configuration

Set these build-time public environment values only with DFX's real details:

| Variable | Content |
| --- | --- |
| `NEXT_PUBLIC_DFX_LEGAL_NAME` | Registered company name |
| `NEXT_PUBLIC_DFX_UEN` | Registered UEN |
| `NEXT_PUBLIC_DFX_SUPPORT_EMAIL` | Support email |
| `NEXT_PUBLIC_DFX_PRIVACY_EMAIL` | Privacy/DPO email |
| `NEXT_PUBLIC_DFX_WHATSAPP_NUMBER` | International WhatsApp number, including country code |
| `SITE_URL` | Canonical deployed URL for sharing metadata |

Approved media belongs in `public/media`, with entries in `src/config/media.ts`. No lender names, team identities, contact details or completion-time claims were invented.

## Existing prototype boundary

The existing assessment service, email/WhatsApp handoff and booking backend remain browser-based simulations. Prototype controls still allow these states to be reviewed. This design change does not connect a live lender, messaging provider, scheduler or customer database. Legal review notes remain because no signed-off policies were supplied.

## Validation

Run `npm ci`, `npm run build`, `npm test`, `npm run lint`, and `npm run typecheck`.

The Playwright suite covers desktop and mobile assessment paths, draft recovery, consent, link recovery, result states, booking, keyboard focus, overflow and automated accessibility. See `design-qa.md` for the final evidence and test result.

To run the browser suite with the bundled Playwright browser: `npx playwright install chromium`, then `npm run test:e2e`. The checks for this handoff used installed Chrome and a local production build because this Windows environment does not include Playwright's downloaded Chromium.

## Design choices retained deliberately

- Input outlines are darker than the decorative rule colour so controls meet the 3:1 contrast requirement.
- Existing outline icons are retained; no new icon dependency or fabricated people imagery was introduced.
- The optional paper-grain effect is omitted. A flat paper surface keeps small financial and legal text crisp.
- The existing service and consent sequence stays intact. The hero and review text explain the required contact handoff rather than claiming an immediate anonymous result.

This update prepares source code for review. It does not merge to the deployment branch or release the live site.
