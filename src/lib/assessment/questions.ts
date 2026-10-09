/**
 * The assessment's questions, in one place (brief §17: one source of truth
 * for labels and messages). Brief §7 says product, operations and legal must
 * approve every question. On the owner's instruction (9 Oct 2026) these were
 * set from research into Singapore bank eligibility: the three hard stops
 * (living in Singapore, aged 21 or over, a business registered in
 * Singapore) match what Singapore banks require; everything else only
 * tailors the result or sends it to a person. Sources: docs/decisions.md.
 */

import type { IconName } from "@/components/icon/Icon";

export const STEPS = ["goal", "situation", "preferences", "review"] as const;
export type StepId = (typeof STEPS)[number];
export type QuestionStepId = Exclude<StepId, "review">;

export const stepInfo: Record<StepId, { name: string; href: string; next: string }> = {
  goal: { name: "Your goals", href: "/assessment/goal", next: "Continue to your goals" },
  situation: { name: "Your situation", href: "/assessment/situation", next: "Continue to your situation" },
  preferences: { name: "Preferences", href: "/assessment/preferences", next: "Continue to your preferences" },
  review: { name: "Review", href: "/assessment/review", next: "Review my answers" },
};

export const stageNames = STEPS.map((step) => stepInfo[step].name);

/** Why the service can't continue. Shown to the person in plain words, recorded as a code (brief §8). */
export type GateReason = "residency" | "age" | "business-jurisdiction";

export interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
  /** A legitimate "Not sure" answer (brief A3), shown apart from the others. */
  notSure?: boolean;
  /** Choosing this stops the assessment, for this reason. */
  gate?: GateReason;
}

export const QUESTION_IDS = [
  "goal",
  "debtCount",
  "businessRegistered",
  "residency",
  "ageBand",
  "employment",
  "income",
  "propertyType",
  "homeOwnership",
  "tradingTime",
  "revenue",
  "timeline",
  "amount",
  "term",
  "priorities",
] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

/** A single answer is a string; a multi-select answer is a list. Unanswered is absent, never 0 or "". */
export type Answers = Partial<Record<QuestionId, string | string[]>>;

type Text = string | ((answers: Answers) => string);

/** Panels group related questions on the situation step (brief A2: one topic per panel). */
export type PanelId = "you" | "work" | "home" | "business" | "timing";
export const panelTitles: Record<PanelId, string> = {
  you: "About you",
  work: "Work and income",
  home: "About the home",
  business: "About the business",
  timing: "Timing",
};

export interface Question {
  id: QuestionId;
  step: QuestionStepId;
  panel?: PanelId;
  control: "cards" | "select" | "chips";
  label: Text;
  /** Short label for the review summary. */
  reviewLabel: Text;
  hint?: Text;
  /** Just-in-time reason for a sensitive question (brief §7, §17: "We ask this to check …"). */
  why?: string;
  optional?: boolean;
  columns?: 1 | 2;
  options: Option[] | ((answers: Answers) => Option[]);
  /** Asked only when this returns true (brief §8: ask only what the goal needs). */
  showIf?: (answers: Answers) => boolean;
  /** Says what to do, not what went wrong (brief §17). */
  requiredMessage?: Text;
}

export const resolve = (text: Text, answers: Answers) => (typeof text === "function" ? text(answers) : text);

const single = (answers: Answers, id: QuestionId) => {
  const value = answers[id];
  return typeof value === "string" ? value : undefined;
};

export const isBusiness = (answers: Answers) => single(answers, "goal") === "business";
const isPersonal = (answers: Answers) => single(answers, "goal") !== undefined && !isBusiness(answers);
const hasIncome = (answers: Answers) =>
  ["employed", "contract", "self-employed"].includes(single(answers, "employment") ?? "");

export const goalOptions: Option[] = [
  {
    value: "personal",
    label: "Personal loan",
    description: "For everyday costs, travel or a big purchase.",
    icon: "wallet",
  },
  {
    value: "consolidation",
    label: "Debt consolidation",
    description: "Bring several debts into one monthly repayment.",
    icon: "layers",
  },
  { value: "renovation", label: "Home renovation", description: "For works on a home you own or rent.", icon: "home" },
  {
    value: "business",
    label: "Business loan",
    description: "Working capital or equipment for your business.",
    icon: "briefcase",
  },
  {
    value: "education",
    label: "Education loan",
    description: "Course fees for you or someone in your family.",
    icon: "document",
  },
  {
    value: "not-sure",
    label: "Not sure yet",
    description: "We’ll ask a few general questions and suggest where to start.",
    icon: "help",
    notSure: true,
  },
];

const notSure = (label = "Not sure"): Option => ({ value: "not-sure", label, notSure: true });

export const questions: Question[] = [
  /* A1 ---------------------------------------------------------------- */
  {
    id: "goal",
    step: "goal",
    control: "cards",
    columns: 2,
    label: "What would you like help with?",
    reviewLabel: "Help with",
    hint: "Select the option closest to your goal. You can change it later.",
    options: goalOptions,
    requiredMessage: "Select what you’d like help with",
  },
  {
    id: "debtCount",
    step: "goal",
    control: "cards",
    columns: 2,
    label: "How many debts would you like to combine?",
    reviewLabel: "Debts to combine",
    hint: "Count credit cards, credit lines and loans.",
    options: [
      { value: "2", label: "2" },
      { value: "3-4", label: "3 or 4" },
      { value: "5-plus", label: "5 or more" },
      notSure(),
    ],
    showIf: (a) => single(a, "goal") === "consolidation",
    requiredMessage: "Select how many debts you’d like to combine",
  },
  {
    id: "businessRegistered",
    step: "goal",
    control: "cards",
    label: "Is the business registered in Singapore?",
    reviewLabel: "Registered in Singapore",
    why: "Lenders we work with can only lend to businesses registered in Singapore.",
    options: [
      { value: "yes", label: "Yes, it has a UEN" },
      { value: "in-progress", label: "Registration is in progress" },
      { value: "outside", label: "No, it’s registered outside Singapore", gate: "business-jurisdiction" },
    ],
    showIf: isBusiness,
    requiredMessage: "Select whether the business is registered in Singapore",
  },

  /* A2 ---------------------------------------------------------------- */
  {
    id: "residency",
    step: "situation",
    panel: "you",
    control: "cards",
    label: "Which best describes you?",
    reviewLabel: "Residency",
    why: "Lenders we work with can only lend to people who live in Singapore, and some routes depend on residency.",
    options: [
      { value: "citizen", label: "Singapore citizen" },
      { value: "pr", label: "Singapore permanent resident" },
      {
        value: "pass-holder",
        label: "Living in Singapore on a work pass",
        description: "For example, an Employment Pass or S Pass.",
      },
      { value: "overseas", label: "I don’t live in Singapore", gate: "residency" },
    ],
    showIf: isPersonal,
    requiredMessage: "Select which best describes you",
  },
  {
    id: "ageBand",
    step: "situation",
    panel: "you",
    control: "select",
    label: "How old are you?",
    reviewLabel: "Age",
    why: "Lenders must check you’re old enough to borrow. We only ask for a range.",
    options: [
      { value: "under-21", label: "Under 21", gate: "age" },
      { value: "21-29", label: "21 to 29" },
      { value: "30-39", label: "30 to 39" },
      { value: "40-54", label: "40 to 54" },
      { value: "55-64", label: "55 to 64" },
      { value: "65-plus", label: "65 or over" },
    ],
    showIf: isPersonal,
    requiredMessage: "Select your age range",
  },
  {
    id: "employment",
    step: "situation",
    panel: "work",
    control: "cards",
    label: "What’s your work situation?",
    reviewLabel: "Work",
    options: [
      { value: "employed", label: "Employed full-time" },
      { value: "contract", label: "Part-time or on contract" },
      { value: "self-employed", label: "Self-employed" },
      { value: "not-working", label: "Not working at the moment" },
      { value: "retired", label: "Retired" },
    ],
    showIf: isPersonal,
    requiredMessage: "Select your work situation",
  },
  {
    id: "income",
    step: "situation",
    panel: "work",
    control: "select",
    optional: true,
    label: "Roughly what is your monthly income before tax?",
    reviewLabel: "Monthly income",
    why: "Lenders set limits based on income, so a range helps us suggest routes that may fit. We never ask for an exact figure.",
    options: [
      { value: "lt-2k", label: "Under S$2,000" },
      { value: "2k-4k", label: "S$2,000 to S$3,999" },
      { value: "4k-6k", label: "S$4,000 to S$5,999" },
      { value: "6k-10k", label: "S$6,000 to S$9,999" },
      { value: "10k-plus", label: "S$10,000 or more" },
      { value: "prefer-not", label: "I’d rather not say" },
    ],
    showIf: (a) => isPersonal(a) && hasIncome(a),
  },
  {
    id: "propertyType",
    step: "situation",
    panel: "home",
    control: "cards",
    columns: 2,
    label: "What kind of home is it?",
    reviewLabel: "Home",
    options: [
      { value: "hdb", label: "HDB flat" },
      { value: "condo", label: "Condominium or apartment" },
      { value: "landed", label: "Landed property" },
      notSure(),
    ],
    showIf: (a) => single(a, "goal") === "renovation",
    requiredMessage: "Select what kind of home it is",
  },
  {
    id: "homeOwnership",
    step: "situation",
    panel: "home",
    control: "cards",
    label: "Who owns the home?",
    reviewLabel: "Owner",
    why: "Renovation loans are for homeowners and their families. If you rent, a different kind of loan is usually the route.",
    options: [
      { value: "own", label: "I own it, alone or jointly" },
      { value: "family", label: "A family member owns it" },
      { value: "rent", label: "I rent it" },
    ],
    showIf: (a) => single(a, "goal") === "renovation",
    requiredMessage: "Select who owns the home",
  },
  {
    id: "tradingTime",
    step: "situation",
    panel: "business",
    control: "cards",
    columns: 2,
    label: "How long has the business been trading?",
    reviewLabel: "Trading for",
    options: [
      { value: "lt-6m", label: "Less than 6 months" },
      { value: "6-12m", label: "6 to 12 months" },
      { value: "1-3y", label: "1 to 3 years" },
      { value: "3y-plus", label: "More than 3 years" },
    ],
    showIf: isBusiness,
    requiredMessage: "Select how long the business has been trading",
  },
  {
    id: "revenue",
    step: "situation",
    panel: "business",
    control: "select",
    optional: true,
    label: "Roughly what is the business’s yearly revenue?",
    reviewLabel: "Yearly revenue",
    why: "Business lenders look at revenue to decide what they can offer. A range is enough.",
    options: [
      { value: "lt-100k", label: "Under S$100,000" },
      { value: "100k-500k", label: "S$100,000 to S$499,999" },
      { value: "500k-1m", label: "S$500,000 to S$999,999" },
      { value: "1m-plus", label: "S$1 million or more" },
      { value: "not-sure", label: "Not sure" },
    ],
    showIf: isBusiness,
  },
  {
    id: "timeline",
    step: "situation",
    panel: "timing",
    control: "cards",
    columns: 2,
    label: "When do you need the money?",
    reviewLabel: "Needed",
    options: [
      { value: "2-weeks", label: "Within 2 weeks" },
      { value: "1-month", label: "Within a month" },
      { value: "1-3-months", label: "In 1 to 3 months" },
      { value: "exploring", label: "I’m just exploring" },
    ],
    showIf: (a) => single(a, "goal") !== undefined,
    requiredMessage: "Select when you need the money",
  },

  /* A3 ---------------------------------------------------------------- */
  {
    id: "amount",
    step: "preferences",
    control: "cards",
    columns: 2,
    label: (a) =>
      single(a, "goal") === "consolidation" ? "Roughly how much do you owe in total?" : "Roughly how much do you need?",
    reviewLabel: (a) => (single(a, "goal") === "consolidation" ? "Total owed" : "Amount"),
    hint: "A rough range is fine.",
    options: (a) =>
      isBusiness(a)
        ? [
            { value: "lt-50k", label: "Under S$50,000" },
            { value: "50k-200k", label: "S$50,000 to S$199,999" },
            { value: "200k-500k", label: "S$200,000 to S$499,999" },
            { value: "500k-plus", label: "S$500,000 or more" },
            notSure("Not sure yet"),
          ]
        : [
            { value: "lt-5k", label: "Under S$5,000" },
            { value: "5k-20k", label: "S$5,000 to S$19,999" },
            { value: "20k-50k", label: "S$20,000 to S$49,999" },
            { value: "50k-plus", label: "S$50,000 or more" },
            notSure("Not sure yet"),
          ],
    requiredMessage: (a) =>
      single(a, "goal") === "consolidation" ? "Select roughly how much you owe" : "Select roughly how much you need",
  },
  {
    id: "term",
    step: "preferences",
    control: "cards",
    columns: 2,
    label: "How long would you like to repay over?",
    reviewLabel: "Repay over",
    options: [
      { value: "lt-1y", label: "Up to 1 year" },
      { value: "1-3y", label: "1 to 3 years" },
      { value: "3-5y", label: "3 to 5 years" },
      notSure(),
    ],
    requiredMessage: "Select how long you’d like to repay over",
  },
  {
    id: "priorities",
    step: "preferences",
    control: "chips",
    optional: true,
    label: "Which of these are important to you?",
    reviewLabel: "Important to you",
    hint: "Choose any that apply.",
    options: [
      { value: "total-cost", label: "Lowest total cost" },
      { value: "monthly", label: "Lowest monthly repayment" },
      { value: "speed", label: "A quick decision" },
      { value: "early-repayment", label: "Paying off early without a fee" },
      { value: "talk", label: "Talking it through with someone" },
    ],
  },
];

export const questionById = Object.fromEntries(questions.map((q) => [q.id, q])) as Record<QuestionId, Question>;

/** Field id used for focus from the error summary: the select, or a group's first radio. */
export const fieldId = (id: string) => `q-${id}`;
