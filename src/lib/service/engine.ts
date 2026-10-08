/**
 * PLACEHOLDER results engine. Brief §20: "Results engine returns explicit
 * status, explanation code, verified offer/service facts … UI must not
 * calculate fit by made-up front-end scoring." This stub only stands in for
 * that service so every result state can be designed and tested. Its rules
 * and route descriptions are invented examples, to be replaced by the real
 * engine's response. The page never shows a score or a rank.
 */

import type { Answers } from "../assessment/questions.ts";

export const ENGINE_VERSION = "stub-1";

export type ResultKind = "fit" | "review" | "no-match";

export interface Route {
  /** Safe for analytics: a code, never an answer. */
  id: string;
  title: string;
  /** One or two reasons, from answers but never repeating sensitive detail (brief §10 card anatomy). */
  reasons: string[];
  summary: string;
  /** Example facts only; real ones come verified and dated from the engine. */
  facts: { label: string; value: string }[];
  smallPrint: string;
}

export interface Result {
  kind: ResultKind;
  /** Explanation code, e.g. "goal-unclear". Shown as words, recorded as the code. */
  reason: string;
  routes: Route[];
  engineVersion: string;
}

const one = (answers: Answers, id: keyof Answers) => {
  const value = answers[id];
  return typeof value === "string" ? value : undefined;
};

const lenderDecision = { label: "Lender decision", value: "Usually 1–3 working days" };
const rateSetBy = { label: "Interest rate", value: "Set by the lender after review" };
const creditCheck = "The lender decides on approval and rates. Applying may involve a credit check by the lender.";

const catalogue: Record<string, Route[]> = {
  personal: [
    {
      id: "personal-instalment",
      title: "Personal instalment loan",
      reasons: [],
      summary: "A fixed amount repaid in equal monthly instalments over an agreed period.",
      facts: [{ label: "Typical tenure", value: "1 to 5 years" }, lenderDecision, rateSetBy],
      smallPrint: creditCheck,
    },
    {
      id: "credit-line",
      title: "Personal credit line",
      reasons: [],
      summary: "A limit you can draw from when you need it, paying interest only on what you use.",
      facts: [{ label: "Repayment", value: "Flexible, with a minimum each month" }, rateSetBy],
      smallPrint: creditCheck,
    },
  ],
  consolidation: [
    {
      id: "consolidation-plan",
      title: "Debt consolidation plan",
      reasons: [],
      summary: "One loan that pays off several unsecured debts, leaving a single monthly repayment.",
      facts: [{ label: "Typical tenure", value: "Up to 10 years" }, lenderDecision, rateSetBy],
      smallPrint: "Eligibility depends on the lender’s criteria and your total unsecured debt. " + creditCheck,
    },
    {
      id: "balance-transfer",
      title: "Balance transfer",
      reasons: [],
      summary: "Moves card balances to one account, often with a lower rate for a fixed period.",
      facts: [{ label: "Promotional period", value: "Set by the lender" }, rateSetBy],
      smallPrint: "A one-off fee usually applies. " + creditCheck,
    },
  ],
  renovation: [
    {
      id: "renovation-loan",
      title: "Renovation loan",
      reasons: [],
      summary: "A loan for works on your home, usually paid to the contractor or against quotations.",
      facts: [{ label: "Typical tenure", value: "1 to 5 years" }, lenderDecision, rateSetBy],
      smallPrint: "Lenders may ask for a quotation or contract. " + creditCheck,
    },
  ],
  business: [
    {
      id: "business-term",
      title: "Business term loan",
      reasons: [],
      summary: "A lump sum for the business, repaid in fixed instalments.",
      facts: [{ label: "Typical tenure", value: "1 to 5 years" }, lenderDecision, rateSetBy],
      smallPrint: "Lenders usually ask for recent financial statements and may ask directors for a guarantee.",
    },
    {
      id: "working-capital",
      title: "Working capital line",
      reasons: [],
      summary: "A revolving limit to smooth cash flow, drawn and repaid as you need.",
      facts: [{ label: "Repayment", value: "Flexible, with a minimum each month" }, rateSetBy],
      smallPrint: "Lenders usually ask for recent bank statements.",
    },
  ],
  education: [
    {
      id: "education-loan",
      title: "Education loan",
      reasons: [],
      summary: "A loan for course fees, often paid directly to the school.",
      facts: [{ label: "Typical tenure", value: "Up to 10 years" }, lenderDecision, rateSetBy],
      smallPrint: "Lenders may ask for the offer letter and fee schedule. " + creditCheck,
    },
  ],
};

/** Plain reasons from the answers. Never income, age or residency (brief §10: avoid revealing sensitive detail). */
function reasonsFor(answers: Answers): string[] {
  const reasons: string[] = [];
  const priorities = Array.isArray(answers.priorities) ? answers.priorities : [];
  if (priorities.includes("monthly")) reasons.push("You’d like a lower monthly repayment");
  else if (priorities.includes("total-cost")) reasons.push("You’d like to keep the total cost down");
  else if (priorities.includes("speed")) reasons.push("You’d like a quick decision");
  const term = one(answers, "term");
  if (term === "1-3y") reasons.push("You’d like to repay over 1 to 3 years");
  else if (term === "3-5y") reasons.push("You’d like to repay over 3 to 5 years");
  else if (term === "lt-1y") reasons.push("You’d like to repay within a year");
  if (reasons.length < 2 && one(answers, "timeline") === "2-weeks") reasons.push("You need the money within 2 weeks");
  if (reasons.length === 0) reasons.push("It matches the kind of help you asked for");
  return reasons.slice(0, 2);
}

/**
 * Placeholder rules: "Not sure yet" needs a person; a business still
 * registering needs a person; otherwise the goal's routes. "No match" has
 * no automatic rule here; the prototype controls can show it.
 */
export function stubResult(answers: Answers): Result {
  const goal = one(answers, "goal");
  const base = { engineVersion: ENGINE_VERSION };
  if (!goal || goal === "not-sure") return { ...base, kind: "review", reason: "goal-unclear", routes: [] };
  if (goal === "business" && one(answers, "businessRegistered") === "in-progress") {
    return { ...base, kind: "review", reason: "registration-pending", routes: [] };
  }
  const reasons = reasonsFor(answers);
  const routes = (catalogue[goal] ?? []).map((route) => ({ ...route, reasons }));
  if (!routes.length) return { ...base, kind: "review", reason: "goal-unclear", routes: [] };
  return { ...base, kind: "fit", reason: "routes-found", routes };
}

/** The same answers with a forced outcome, for the prototype controls. */
export function forcedResult(answers: Answers, kind: ResultKind): Result {
  if (kind === "no-match") return { kind, reason: "amount-out-of-range", routes: [], engineVersion: ENGINE_VERSION };
  if (kind === "review") return { kind, reason: "more-detail-needed", routes: [], engineVersion: ENGINE_VERSION };
  const result = stubResult({ ...answers, goal: one(answers, "goal") === "not-sure" ? "personal" : answers.goal });
  return result.kind === "fit" ? result : stubResult({ ...answers, goal: "personal" });
}

/** Words for each explanation code (brief R2, R3: the real reason, at a sensible level of detail). */
export const reasonCopy: Record<string, { known: string; missing?: string }> = {
  "goal-unclear": {
    known: "You’d like help but aren’t sure which kind of loan fits yet.",
    missing: "What the money is for, so we can point you to the right kind of loan.",
  },
  "registration-pending": {
    known: "Your business registration is still in progress.",
    missing: "When registration completes, and the business’s plans for the money.",
  },
  "more-detail-needed": {
    known: "Your answers fit more than one route.",
    missing: "A little more about your current repayments, to recommend the better route.",
  },
  "amount-out-of-range": {
    known:
      "The amount you need is outside what the lenders we work with offer for this kind of loan, given the other answers you shared.",
  },
};
