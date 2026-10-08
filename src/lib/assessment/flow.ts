/**
 * Assessment routing and validation (brief §7, §8). Pure functions over the
 * answers, so the same rules can run again on the server (brief §20: the API
 * validates again and returns typed field errors).
 */

import { validateEmail, validateSgPhone } from "../format.ts";
import {
  STEPS,
  fieldId,
  goalOptions,
  questions,
  resolve,
  stepInfo,
  type Answers,
  type GateReason,
  type Option,
  type Question,
  type QuestionId,
  type QuestionStepId,
  type StepId,
} from "./questions.ts";

export const optionsFor = (question: Question, answers: Answers): Option[] =>
  typeof question.options === "function" ? question.options(answers) : question.options;

export const isVisible = (question: Question, answers: Answers) => question.showIf?.(answers) ?? true;

/** Questions asked on a step, given the answers so far, in display order. */
export function visibleQuestions(step: QuestionStepId, answers: Answers): Question[] {
  return questions.filter((q) => q.step === step && isVisible(q, answers));
}

/** An answer that is one of the question's current options. A list keeps only valid entries. */
function validAnswer(question: Question, answers: Answers): string | string[] | undefined {
  const value = answers[question.id];
  const allowed = new Set(optionsFor(question, answers).map((o) => o.value));
  if (question.control === "chips") {
    if (!Array.isArray(value)) return undefined;
    const kept = value.filter((v) => allowed.has(v));
    return kept.length ? kept : undefined;
  }
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

/* -------------------------------------------------------------------------- */
/* Errors and hard gates                                                      */
/* -------------------------------------------------------------------------- */

export type ErrorCode = "required" | "format";

export interface FieldError {
  /** Question or contact field. */
  field: string;
  /** The element the error summary focuses. */
  fieldId: string;
  code: ErrorCode;
  message: string;
}

/** Missing required answers on a question step. Shown on Continue, never before (brief §7). */
export function stepErrors(step: QuestionStepId, answers: Answers): FieldError[] {
  return visibleQuestions(step, answers)
    .filter((q) => !q.optional && validAnswer(q, answers) === undefined)
    .map((q) => ({
      field: q.id,
      fieldId: fieldId(q.id),
      code: "required" as const,
      message: resolve(q.requiredMessage ?? "Answer this question", answers),
    }));
}

export interface Gate {
  reason: GateReason;
  question: QuestionId;
  step: QuestionStepId;
}

/** The first answer, in question order, that stops the assessment (brief §8: verified hard gates only). */
export function hardGate(answers: Answers, step?: QuestionStepId): Gate | null {
  for (const q of questions) {
    if ((step && q.step !== step) || !isVisible(q, answers)) continue;
    const value = validAnswer(q, answers);
    const option = optionsFor(q, answers).find((o) => o.value === value);
    if (option?.gate) return { reason: option.gate, question: q.id, step: q.step };
  }
  return null;
}

/** Hard-gate message for an option, if choosing it would stop the assessment. */
export function gateFor(question: Question, answers: Answers): GateReason | null {
  const value = answers[question.id];
  return optionsFor(question, answers).find((o) => o.value === value)?.gate ?? null;
}

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

const questionSteps = STEPS.filter((s): s is QuestionStepId => s !== "review");

export function isStepComplete(step: QuestionStepId, answers: Answers): boolean {
  return stepErrors(step, answers).length === 0 && hardGate(answers, step) === null;
}

/** Where someone should be: the first step with a missing answer or a hard stop, else the review. */
export function firstIncompleteStep(answers: Answers): StepId {
  return questionSteps.find((step) => !isStepComplete(step, answers)) ?? "review";
}

/** A step can be opened once every step before it is complete (deep links and refreshes). */
export function canVisit(step: StepId, answers: Answers): boolean {
  return STEPS.indexOf(step) <= STEPS.indexOf(firstIncompleteStep(answers));
}

/**
 * Where Continue goes once this step is complete. Before the review has
 * been seen, the next step in order. After it, the first later step still
 * missing an answer, else straight back to the review: "Change" returns to the summary rather than forcing
 * every later step again (brief A4, [R7]).
 */
export function nextStep(step: QuestionStepId, answers: Answers, reviewSeen: boolean): StepId {
  const later = questionSteps.slice(questionSteps.indexOf(step) + 1);
  if (reviewSeen) return later.find((s) => !isStepComplete(s, answers)) ?? "review";
  return later[0] ?? "review";
}

export function previousStep(step: StepId): StepId | null {
  const i = STEPS.indexOf(step);
  return i > 0 ? STEPS[i - 1] : null;
}

/** Continue button text names its destination (brief §17). */
export const continueLabel = (destination: StepId) => stepInfo[destination].next;

/* -------------------------------------------------------------------------- */
/* Changing answers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Keeps only answers to questions still asked, with values still on offer.
 * Answers to questions a new goal no longer asks are removed deliberately,
 * not left to leak into the submission (brief §24 "Select and change goal").
 */
export function pruneAnswers(answers: Answers): Answers {
  const kept: Answers = {};
  for (const q of questions) {
    if (!isVisible(q, answers)) continue;
    const value = validAnswer(q, answers);
    if (value !== undefined) kept[q.id] = value;
  }
  return kept;
}

/** Answers that pruning would remove, so the page can say so before it happens. */
export function answersToRemove(answers: Answers): { id: QuestionId; label: string }[] {
  const kept = pruneAnswers(answers);
  return questions
    .filter((q) => answers[q.id] !== undefined && kept[q.id] === undefined)
    .map((q) => ({ id: q.id, label: resolve(q.reviewLabel, answers) }));
}

/** Question ids whose answer differs between two sets of answers. */
export function changedAnswers(before: Answers, after: Answers): QuestionId[] {
  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  return questions.filter((q) => !same(before[q.id], after[q.id])).map((q) => q.id);
}

/* -------------------------------------------------------------------------- */
/* Review                                                                     */
/* -------------------------------------------------------------------------- */

export function displayAnswer(question: Question, answers: Answers): string | null {
  const value = validAnswer(question, answers);
  if (value === undefined) return null;
  const options = optionsFor(question, answers);
  const label = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  return Array.isArray(value) ? value.map(label).join(", ") : label(value);
}

export interface ReviewGroupData {
  step: QuestionStepId;
  title: string;
  href: string;
  rows: { id: QuestionId; label: string; value: string | null }[];
}

/** The summary shows only questions that were asked; a skipped optional one reads "Not provided", never 0. */
export function reviewGroups(answers: Answers): ReviewGroupData[] {
  return questionSteps.map((step) => ({
    step,
    title: stepInfo[step].name,
    href: stepInfo[step].href,
    rows: visibleQuestions(step, answers).map((q) => ({
      id: q.id,
      label: resolve(q.reviewLabel, answers),
      value: displayAnswer(q, answers),
    })),
  }));
}

/** For analytics: which branch of the questions someone is on (a code, never an answer). */
export function pathVariant(answers: Answers): string {
  const goal = answers.goal;
  return typeof goal === "string" && goalOptions.some((o) => o.value === goal) ? goal : "none";
}

export function answerCount(step: QuestionStepId, answers: Answers): number {
  return visibleQuestions(step, answers).filter((q) => validAnswer(q, answers) !== undefined).length;
}

/* -------------------------------------------------------------------------- */
/* Contact (review step)                                                      */
/* -------------------------------------------------------------------------- */

export type Channel = "whatsapp" | "email";

export interface Contact {
  channel?: Channel;
  firstName?: string;
  mobile?: string;
  email?: string;
}

export const contactFieldIds = {
  channel: "contact-channel",
  firstName: "contact-name",
  mobile: "contact-mobile",
  email: "contact-email",
} as const;

export type ContactField = keyof typeof contactFieldIds;

/** Format problems for one field, for use on blur. Empty fields are left alone until submit. */
export function contactFormatError(field: ContactField, contact: Contact): string | null {
  const value = contact[field]?.trim();
  if (!value) return null;
  if (field === "mobile") return validateSgPhone(value);
  if (field === "email") return validateEmail(value);
  return null;
}

/** Everything wrong with the contact details, for submit. Only the chosen channel's detail is required. */
export function contactErrors(contact: Contact): FieldError[] {
  const errors: FieldError[] = [];
  const add = (field: ContactField, code: ErrorCode, message: string) =>
    errors.push({ field, fieldId: contactFieldIds[field], code, message });

  if (!contact.channel) add("channel", "required", "Select how you’d like to continue");
  if (contact.channel === "whatsapp") {
    const message = validateSgPhone(contact.mobile ?? "");
    if (message) add("mobile", contact.mobile?.trim() ? "format" : "required", message);
  }
  if (contact.channel === "email") {
    const message = validateEmail(contact.email ?? "");
    if (message) add("email", contact.email?.trim() ? "format" : "required", message);
  }
  return errors;
}

/** Contact details actually needed for the chosen channel; the other one is not sent. */
export function contactForSubmission(contact: Contact): Contact {
  const firstName = contact.firstName?.trim() || undefined;
  if (contact.channel === "whatsapp") return { channel: "whatsapp", firstName, mobile: contact.mobile?.trim() };
  if (contact.channel === "email") return { channel: "email", firstName, email: contact.email?.trim() };
  return { firstName };
}
