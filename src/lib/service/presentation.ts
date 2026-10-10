import type { Answers } from "../assessment/questions.ts";

/** Explanations describe structure, never imply that a price or preference is guaranteed. */
const differences: Record<string, { reason: string; tradeoff: string }> = {
  "personal-instalment": { reason: "A set borrowing amount with a defined repayment schedule", tradeoff: "A fixed schedule offers structure. Early settlement fees still need checking." },
  "credit-line": { reason: "Access to a reusable limit rather than a single lump sum", tradeoff: "Flexible borrowing needs an active repayment plan. Minimum payments do not show the total cost." },
  "consolidation-plan": { reason: "Combines eligible existing debts into one repayment", tradeoff: "Only certain debts and applicants qualify. Eligibility and total cost need lender confirmation." },
  "balance-transfer": { reason: "Moves existing card balances for a limited repayment period", tradeoff: "Check the transfer fee and the rate that applies if a balance remains after the promotional period." },
  "renovation-loan": { reason: "Designed for home works rather than general spending", tradeoff: "The lender may restrict the work covered and how funds are paid to the contractor." },
  "education-loan": { reason: "Designed for course fees rather than general spending", tradeoff: "Course eligibility, payment arrangements and any guarantor requirement need checking." },
  "business-term": { reason: "A lump sum for a business with scheduled repayments", tradeoff: "Check the repayment commitment, supporting documents and any personal guarantee." },
  "working-capital": { reason: "Funding intended for day-to-day business costs", tradeoff: "Scheme eligibility and the lender’s requirements still need checking." },
};

export function explainRoute(id: string) {
  return differences[id] ?? { reason: "A possible route for your stated purpose", tradeoff: "Eligibility, costs and repayment terms need lender confirmation." };
}

const priorities: Record<string, { label: string; note: string }> = {
  "total-cost": { label: "Lowest total cost", note: "Not yet comparable. Ask for the interest, all fees and total amount repayable." },
  monthly: { label: "Lowest monthly repayment", note: "Not yet comparable. A longer term may reduce each payment while increasing total cost." },
  speed: { label: "A quick decision", note: "Needs lender confirmation. Your preferred timing is not a promised decision date." },
  "early-repayment": { label: "Paying off early without a fee", note: "Needs lender confirmation. No fee-free early repayment is guaranteed." },
  talk: { label: "Talking it through", note: "An optional call is available after your result. You choose whether to book." },
};

export function priorityChecks(answers: Answers) {
  return (Array.isArray(answers.priorities) ? answers.priorities : []).filter(id => Object.hasOwn(priorities, id)).map(id => ({ id, ...priorities[id] }));
}
