/**
 * Indicative results engine. Brief §20 wants a real engine to return the
 * status, an explanation code and verified facts, so the UI never invents
 * fit. Until DFX's lending partners' own criteria are connected, these rules
 * follow public eligibility norms for Singapore banks (researched October
 * 2026; sources in docs/decisions.md). It suggests kinds of loan, never a
 * specific lender, score or rank. Anything the rules can't settle goes to a
 * person.
 */

import type { Answers } from "../assessment/questions.ts";

export const ENGINE_VERSION = "indicative-2026-10";

export type ResultKind = "fit" | "review" | "no-match";

export interface Route {
  /** Safe for analytics: a code, never an answer. */
  id: string;
  title: string;
  /** One or two reasons, from answers but never repeating sensitive detail (brief §10 card anatomy). */
  reasons: string[];
  summary: string;
  /** Typical market terms, dated by FACTS_AS_OF. The lender sets the actual terms. */
  facts: { label: string; value: string }[];
  smallPrint: string;
}

export interface Result {
  kind: ResultKind;
  /** Explanation code, e.g. "goal-unclear". Shown as words, recorded as the code. */
  reason: string;
  /** Why a route someone might expect isn't shown, e.g. the Debt Consolidation Plan for a work pass holder. */
  note?: string;
  routes: Route[];
  engineVersion: string;
}

export const FACTS_AS_OF = "Typical in Singapore, October 2026. Your lender sets the actual terms.";

const one = (answers: Answers, id: keyof Answers) => {
  const value = answers[id];
  return typeof value === "string" ? value : undefined;
};

const rate = { label: "Interest rate", value: "Set by the lender after review" };
const creditCheck = "The lender decides on approval, rates and terms, and will check your credit report if you apply.";

const routes: Record<string, Route> = {
  "personal-instalment": {
    id: "personal-instalment",
    title: "Personal instalment loan",
    reasons: [],
    summary: "A fixed amount repaid in equal monthly instalments over an agreed period.",
    facts: [
      { label: "Tenure", value: "Usually 1 to 5 years" },
      { label: "Who can apply", value: "Usually 21 to 65, with a regular income" },
      rate,
    ],
    smallPrint: creditCheck,
  },
  "credit-line": {
    id: "credit-line",
    title: "Personal credit line",
    reasons: [],
    summary: "A limit you can draw from when you need it, paying interest only on what you use.",
    facts: [{ label: "Repayment", value: "A minimum each month, interest only on what you use" }, rate],
    smallPrint: creditCheck,
  },
  "consolidation-plan": {
    id: "consolidation-plan",
    title: "Debt Consolidation Plan",
    reasons: [],
    summary:
      "An industry scheme run by participating banks: one loan pays off your card and credit-line balances, leaving a single monthly repayment.",
    facts: [
      { label: "Tenure", value: "Usually 1 to 10 years" },
      {
        label: "Who it’s for",
        value:
          "Citizens and PRs earning S$20,000 to S$119,999 a year, with card and credit-line debt above 12 times their monthly income",
      },
      rate,
    ],
    smallPrint:
      "Some banks set a higher income minimum. Secured, renovation, education and business loans aren’t included. " +
      creditCheck,
  },
  "balance-transfer": {
    id: "balance-transfer",
    title: "Balance transfer",
    reasons: [],
    summary: "Moves card balances to one account with a low or zero rate for a fixed period.",
    facts: [
      { label: "Low-rate period", value: "Usually 3, 6 or 12 months" },
      { label: "Fee", value: "A one-off fee, often about 1.5% to 5% of the amount" },
      { label: "Afterwards", value: "Any balance left returns to the card’s usual rate" },
    ],
    smallPrint: "Compare the total cost, not just the 0% rate. " + creditCheck,
  },
  "renovation-loan": {
    id: "renovation-loan",
    title: "Renovation loan",
    reasons: [],
    summary: "A loan for works on your home, usually paid to the contractor against a quotation.",
    facts: [
      { label: "How much", value: "Up to 6 times your monthly income or S$30,000, whichever is lower" },
      { label: "Tenure", value: "Usually 1 to 5 years" },
      rate,
    ],
    smallPrint: "Lenders usually ask for a quotation or contract, and lend to owners and their family. " + creditCheck,
  },
  "education-loan": {
    id: "education-loan",
    title: "Education loan",
    reasons: [],
    summary: "A loan for course fees, local or overseas, often paid directly to the school.",
    facts: [
      { label: "Tenure", value: "Usually up to 8 to 10 years" },
      { label: "Guarantor", value: "Often needed if the student is under 21 or studying overseas" },
      rate,
    ],
    smallPrint: "Lenders may ask for the offer letter and fee schedule. " + creditCheck,
  },
  "business-term": {
    id: "business-term",
    title: "Business term loan",
    reasons: [],
    summary: "A lump sum for the business, repaid in fixed instalments.",
    facts: [
      { label: "Tenure", value: "Usually 1 to 5 years" },
      { label: "Documents", value: "Recent financial statements and bank statements" },
      rate,
    ],
    smallPrint: "Lenders often ask directors for a personal guarantee.",
  },
  "working-capital": {
    id: "working-capital",
    title: "Working capital loan",
    reasons: [],
    summary:
      "Funding for day-to-day costs such as payroll and suppliers. Enterprise Singapore’s Enterprise Financing Scheme supports these loans through participating lenders.",
    facts: [
      { label: "Government-supported (EFS)", value: "Up to S$500,000, for up to 5 years" },
      { label: "Who it’s for", value: "Businesses registered and operating in Singapore" },
      rate,
    ],
    smallPrint:
      "EFS eligibility, such as local shareholding, is set by Enterprise Singapore and checked by the lender.",
  },
};

const pick = (...ids: string[]) => ids.map((id) => routes[id]);

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

const local = (answers: Answers) => ["citizen", "pr"].includes(one(answers, "residency") ?? "");

/**
 * Who can't be matched automatically, and why. Soft rules: they send the
 * person to a specialist, never stop them (brief §8: only verified hard
 * gates stop the flow).
 */
function needsPerson(answers: Answers): string | null {
  const goal = one(answers, "goal");
  if (!goal || goal === "not-sure") return "goal-unclear";
  if (goal === "business") {
    if (one(answers, "businessRegistered") === "in-progress") return "registration-pending";
    if (one(answers, "tradingTime") === "lt-6m") return "trading-young";
    return null;
  }
  if (one(answers, "ageBand") === "65-plus") return "age-upper";
  const work = one(answers, "employment");
  if (work === "not-working" || work === "retired") return "income-check";
  const income = one(answers, "income");
  if (income === "lt-2k") return "income-low";
  if (one(answers, "residency") === "pass-holder" && (income === "2k-4k" || income === "lt-2k"))
    return "income-foreigner";
  return null;
}

/** The routes for a goal, with a note when a route people often expect doesn't apply. */
function routesFor(answers: Answers): { list: Route[]; note?: string } {
  const goal = one(answers, "goal");
  if (goal === "personal") return { list: pick("personal-instalment", "credit-line") };
  if (goal === "education") return { list: pick("education-loan") };
  if (goal === "business") return { list: pick("business-term", "working-capital") };
  if (goal === "renovation") {
    if (one(answers, "homeOwnership") === "rent") {
      return {
        list: pick("personal-instalment"),
        note: "Renovation loans are for homeowners and their families, so a personal loan is the usual route for works on a rented home.",
      };
    }
    return { list: pick("renovation-loan") };
  }
  if (goal === "consolidation") {
    if (!local(answers)) {
      return {
        list: pick("balance-transfer", "personal-instalment"),
        note: "The Debt Consolidation Plan is only for Singapore citizens and PRs, so it isn’t shown.",
      };
    }
    // The plan needs debt above 12 times monthly income; below S$20,000 owed that can't apply.
    const owed = one(answers, "amount");
    const highIncome = one(answers, "income") === "10k-plus";
    if (owed === "lt-5k" || owed === "5k-20k" || highIncome) {
      return {
        list: pick("balance-transfer", "personal-instalment"),
        note: highIncome
          ? "The Debt Consolidation Plan is for incomes under S$120,000 a year, so it isn’t shown."
          : "The Debt Consolidation Plan is for debt above 12 times monthly income, so it isn’t likely to apply.",
      };
    }
    return { list: pick("consolidation-plan", "balance-transfer") };
  }
  return { list: [] };
}

export function stubResult(answers: Answers): Result {
  const base = { engineVersion: ENGINE_VERSION };
  const person = needsPerson(answers);
  if (person) return { ...base, kind: "review", reason: person, routes: [] };
  const { list, note } = routesFor(answers);
  if (!list.length) return { ...base, kind: "review", reason: "goal-unclear", routes: [] };
  const reasons = reasonsFor(answers);
  return { ...base, kind: "fit", reason: "routes-found", note, routes: list.map((route) => ({ ...route, reasons })) };
}

/** The same answers with a forced outcome, for the prototype controls. */
export function forcedResult(answers: Answers, kind: ResultKind): Result {
  if (kind === "no-match") return { kind, reason: "amount-out-of-range", routes: [], engineVersion: ENGINE_VERSION };
  if (kind === "review") return { kind, reason: "more-detail-needed", routes: [], engineVersion: ENGINE_VERSION };
  const result = stubResult(answers);
  return result.kind === "fit"
    ? result
    : stubResult({
        goal: "personal",
        residency: "citizen",
        ageBand: "30-39",
        employment: "employed",
        term: answers.term,
      });
}

/** Words for each explanation code (brief R2, R3: the real reason, at a sensible level of detail). */
export const reasonCopy: Record<string, { known: string; missing?: string }> = {
  "goal-unclear": {
    known: "You’d like help but aren’t sure which kind of loan fits yet.",
    missing: "What the money is for, so we can point you to the right kind of loan.",
  },
  "registration-pending": {
    known: "Your business registration is still in progress, and lenders need a registered business (with a UEN).",
    missing: "When registration completes, and the business’s plans for the money.",
  },
  "trading-young": {
    known: "Most business lenders look for at least 6 to 12 months of trading.",
    missing: "How the business is funded today, and what the money is for.",
  },
  "age-upper": {
    known: "Many lenders have an upper age limit for new loans, often 65.",
    missing: "Whether a shorter loan or a joint application could work for you.",
  },
  "income-check": {
    known: "Lenders usually need a regular income to approve a loan.",
    missing: "Any income you do have, such as a pension, rental income or part-time work.",
  },
  "income-low": {
    known: "Many banks ask for a yearly income of at least S$20,000 to S$30,000 for a personal loan.",
    missing: "Your full income, and whether a joint application could help.",
  },
  "income-foreigner": {
    known: "Banks usually ask work pass holders for a higher yearly income, often S$40,000 to S$60,000 or more.",
    missing: "Your full income and your type of pass.",
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
