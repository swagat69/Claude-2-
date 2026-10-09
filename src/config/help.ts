/**
 * Independent places to get help, for people DFX can't match (brief §8, R3).
 * Chosen on 9 Oct 2026: free, impartial or public services in Singapore.
 */

export interface HelpResource {
  name: string;
  text: string;
  href?: string;
}

export const help = {
  moneySense: {
    name: "MoneySense",
    text: "Free, impartial guides on borrowing and managing debt, from the Singapore government.",
    href: "https://www.moneysense.gov.sg/",
  },
  creditCounselling: {
    name: "Credit Counselling Singapore",
    text: "Free, confidential help if repayments are getting hard to manage, including debt management plans.",
    href: "https://www.ccs.org.sg/",
  },
  creditBureau: {
    name: "Credit Bureau Singapore",
    text: "See your own credit report, which lenders check when you apply.",
    href: "https://www.creditbureau.com.sg/",
  },
  enterpriseSingapore: {
    name: "Enterprise Singapore",
    text: "Government-supported financing for businesses registered in Singapore.",
    href: "https://www.enterprisesg.gov.sg/",
  },
  localLender: {
    name: "A bank where you live",
    text: "They can tell you what you’re eligible for locally.",
  },
  localBusinessLender: {
    name: "A bank where the business is registered",
    text: "They can tell you what the business is eligible for.",
  },
} satisfies Record<string, HelpResource>;
