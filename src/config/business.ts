/**
 * Business facts and policies, in one place (brief §17: one source of truth
 * for wording). Decided on 9 Oct 2026 on the owner's instruction, from
 * research into Singapore rules and common practice; the reasoning and
 * sources are in docs/decisions.md. Values set to null are facts only DFX
 * can supply; the pages show a Placeholder tag where they are needed.
 */

export const business = {
  /** Registered name and UEN: only DFX knows these. */
  legalName: null as string | null,
  uen: null as string | null,
  /** Domain for email and the privacy contact: not chosen yet. */
  emailDomain: null as string | null,

  /**
   * DFX matches people with banks and financial institutions regulated by
   * MAS, and does not work with licensed moneylenders, whose advertising is
   * limited to directories, their own websites and premises (Registrar's
   * Advertising and Marketing Directions, 1 April 2025).
   */
  lenders: "banks and financial institutions regulated by the Monetary Authority of Singapore",
  regulatoryLine:
    "DFX is a loan-matching service, not a lender. We introduce you to banks and financial institutions regulated by the Monetary Authority of Singapore; they decide on approval, rates and terms.",
  feeLine:
    "Our service is free for you. A lender may pay us a fee if your loan is approved; it never changes what you pay.",

  support: {
    hours: "Monday to Friday, 9am to 6pm Singapore time, except public holidays",
    channels: "WhatsApp and email",
    replyTime: "within one working day",
    team: "Loan specialists based in Singapore",
  },

  call: {
    who: "A DFX loan specialist",
    whoInSentence: "a DFX loan specialist",
    minutes: 15,
    free: true,
    videoTool: "Google Meet",
  },

  /** Date of the privacy notice and terms, recorded with every consent. Change it whenever their wording changes. */
  policyVersion: "2026-10-09",
  policyDate: "9 October 2026",

  /** Answers before sending: this browser tab only, cleared after an hour unused. */
  draftHours: 1,
  /** Results and contact details are deleted this long after the last activity, unless the person goes ahead with a lender. */
  retentionDays: 30,
  /** Secure links: single use, short-lived (common practice for emailed sign-in links is 5 to 15 minutes). */
  linkMinutes: 15,
  /** A specialist looks at anything the automatic check can't decide, within this time. */
  reviewTime: "within one working day",

  /** Who receives what (brief A4, §19). Processors act on DFX's instructions under contract. */
  processors: {
    crm: "HubSpot",
    email: "Postmark",
    whatsapp: "WhatsApp (Meta)",
    analytics: "Google Analytics",
  },
} as const;
