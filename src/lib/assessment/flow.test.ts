import assert from "node:assert/strict";
import test from "node:test";
import {
  answersToRemove,
  canVisit,
  changedAnswers,
  contactErrors,
  contactForSubmission,
  contactFormatError,
  continueLabel,
  firstIncompleteStep,
  hardGate,
  nextStep,
  pruneAnswers,
  reviewGroups,
  stepErrors,
  visibleQuestions,
} from "./flow.ts";
import { questions, type Answers } from "./questions.ts";

const personal: Answers = {
  goal: "personal",
  residency: "citizen",
  ageBand: "30-39",
  employment: "employed",
  income: "4k-6k",
  timeline: "1-month",
  amount: "5k-20k",
  term: "1-3y",
  priorities: ["monthly"],
};

const business: Answers = {
  goal: "business",
  businessRegistered: "yes",
  tradingTime: "1-3y",
  timeline: "2-weeks",
  amount: "50k-200k",
  term: "lt-1y",
};

const ids = (list: { id: string }[]) => list.map((q) => q.id);

test("every question has a unique id and a required message unless optional", () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  for (const q of questions) assert.ok(q.optional || q.requiredMessage, `${q.id} needs a required message`);
});

test("only questions the goal needs are asked", () => {
  assert.deepEqual(ids(visibleQuestions("goal", { goal: "personal" })), ["goal"]);
  assert.deepEqual(ids(visibleQuestions("goal", { goal: "consolidation" })), ["goal", "debtCount"]);
  assert.deepEqual(ids(visibleQuestions("goal", { goal: "business" })), ["goal", "businessRegistered"]);
  assert.deepEqual(ids(visibleQuestions("situation", { goal: "business" })), ["tradingTime", "revenue", "timeline"]);
  assert.deepEqual(ids(visibleQuestions("situation", { goal: "renovation", employment: "retired" })), [
    "residency",
    "ageBand",
    "employment",
    "propertyType",
    "homeOwnership",
    "timeline",
  ]);
  // Income is asked only of people with an income.
  assert.ok(ids(visibleQuestions("situation", { goal: "personal", employment: "self-employed" })).includes("income"));
});

test("missing required answers produce corrective messages; optional ones don't", () => {
  const errors = stepErrors("situation", { goal: "personal", employment: "employed" });
  assert.deepEqual(
    errors.map((e) => [e.field, e.fieldId, e.code]),
    [
      ["residency", "q-residency", "required"],
      ["ageBand", "q-ageBand", "required"],
      ["timeline", "q-timeline", "required"],
    ],
  );
  assert.equal(errors[0].message, "Select which best describes you");
  assert.deepEqual(stepErrors("situation", personal), []);
  assert.deepEqual(stepErrors("preferences", { ...personal, priorities: undefined }), []);
});

test("messages follow the goal", () => {
  const [amount] = stepErrors("preferences", { goal: "consolidation", term: "1-3y" });
  assert.equal(amount.message, "Select roughly how much you owe");
});

test("an answer that is no longer on offer counts as unanswered", () => {
  // A personal amount band is not a business one.
  assert.deepEqual(
    stepErrors("preferences", { ...business, amount: "5k-20k" }).map((e) => e.field),
    ["amount"],
  );
});

test("hard gates stop at the first gating answer and name a reason", () => {
  assert.equal(hardGate(personal), null);
  assert.deepEqual(hardGate({ ...personal, residency: "overseas" }), {
    reason: "residency",
    question: "residency",
    step: "situation",
  });
  assert.deepEqual(hardGate({ ...personal, ageBand: "under-21" }), {
    reason: "age",
    question: "ageBand",
    step: "situation",
  });
  assert.deepEqual(hardGate({ ...business, businessRegistered: "outside" }), {
    reason: "business-jurisdiction",
    question: "businessRegistered",
    step: "goal",
  });
  // A gating answer to a question no longer asked doesn't count.
  assert.equal(hardGate({ ...business, residency: "overseas" }), null);
  assert.equal(hardGate({ ...personal, residency: "overseas" }, "goal"), null);
});

test("routing: first incomplete step, deep links and the hard gate", () => {
  assert.equal(firstIncompleteStep({}), "goal");
  assert.equal(firstIncompleteStep({ goal: "personal" }), "situation");
  assert.equal(firstIncompleteStep(personal), "review");
  assert.equal(firstIncompleteStep({ ...personal, ageBand: "under-21" }), "situation");
  assert.ok(canVisit("goal", {}));
  assert.ok(!canVisit("preferences", { goal: "personal" }));
  assert.ok(canVisit("review", personal));
  assert.ok(!canVisit("preferences", { ...personal, residency: "overseas" }));
});

test("Continue goes forward in order, then straight back to review once it has been seen", () => {
  assert.equal(nextStep("goal", personal, false), "situation");
  assert.equal(nextStep("goal", personal, true), "review");
  // Changing goal from review: new questions are asked before returning.
  const switched = { ...personal, goal: "business", businessRegistered: "yes" };
  assert.equal(nextStep("goal", switched, true), "situation");
  // The step being left is never its own destination.
  assert.equal(nextStep("situation", { ...personal, ageBand: undefined }, true), "review");
  assert.equal(nextStep("preferences", personal, false), "review");
  assert.equal(continueLabel("situation"), "Continue to your situation");
  assert.equal(continueLabel("review"), "Review my answers");
});

test("changing goal removes answers that no longer apply, and says which", () => {
  const switched: Answers = { ...business, goal: "personal" };
  assert.deepEqual(
    answersToRemove(switched).map((a) => a.id),
    ["businessRegistered", "tradingTime", "amount"],
  );
  const pruned = pruneAnswers(switched);
  assert.deepEqual(pruned, { goal: "personal", timeline: "2-weeks", term: "lt-1y" });
  assert.deepEqual(answersToRemove(personal), []);
  assert.deepEqual(pruneAnswers(personal), personal);
});

test("chips keep only options still on offer", () => {
  assert.deepEqual(pruneAnswers({ ...personal, priorities: ["monthly", "made-up"] }).priorities, ["monthly"]);
  assert.equal(pruneAnswers({ ...personal, priorities: ["made-up"] }).priorities, undefined);
});

test("changed answers are listed by id", () => {
  assert.deepEqual(changedAnswers(personal, { ...personal, term: "3-5y", priorities: ["monthly"] }), ["term"]);
  assert.deepEqual(changedAnswers(personal, { ...personal, priorities: ["speed"] }), ["priorities"]);
});

test("review groups show asked questions only, with skipped optional answers as null", () => {
  const groups = reviewGroups({ ...personal, income: undefined, priorities: undefined });
  assert.deepEqual(
    groups.map((g) => [g.step, g.title, g.href]),
    [
      ["goal", "Your goals", "/assessment/goal"],
      ["situation", "Your situation", "/assessment/situation"],
      ["preferences", "Preferences", "/assessment/preferences"],
    ],
  );
  assert.deepEqual(groups[0].rows, [{ id: "goal", label: "Help with", value: "Personal loan" }]);
  const income = groups[1].rows.find((r) => r.id === "income");
  assert.deepEqual(income, { id: "income", label: "Monthly income", value: null });
  assert.equal(groups[2].rows.find((r) => r.id === "amount")?.value, "S$5,000 to S$19,999");
  const chips = reviewGroups(personal)[2].rows.find((r) => r.id === "priorities");
  assert.equal(chips?.value, "Lowest monthly repayment");
});

test("contact: only the chosen channel's detail is required", () => {
  assert.deepEqual(
    contactErrors({}).map((e) => e.fieldId),
    ["contact-channel"],
  );
  assert.deepEqual(
    contactErrors({ channel: "whatsapp" }).map((e) => [e.field, e.code, e.message]),
    [["mobile", "required", "Enter your mobile number"]],
  );
  assert.deepEqual(
    contactErrors({ channel: "email", email: "ana@" }).map((e) => [e.field, e.code]),
    [["email", "format"]],
  );
  assert.deepEqual(contactErrors({ channel: "whatsapp", mobile: "9123 4567", email: "not checked" }), []);
});

test("contact: blur only reports format problems in something typed", () => {
  assert.equal(contactFormatError("email", {}), null);
  assert.equal(contactFormatError("email", { email: "  " }), null);
  assert.equal(contactFormatError("email", { email: "ana" }), "Enter your email in the format name@example.com");
  assert.equal(
    contactFormatError("mobile", { mobile: "6123 4567" }),
    "Enter a Singapore mobile number starting with 8 or 9",
  );
});

test("contact: the unused channel's detail is not submitted", () => {
  assert.deepEqual(
    contactForSubmission({ channel: "email", email: " ana@example.com ", mobile: "91234567", firstName: " " }),
    {
      channel: "email",
      firstName: undefined,
      email: "ana@example.com",
    },
  );
});
