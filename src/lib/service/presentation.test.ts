import test from "node:test";
import assert from "node:assert/strict";
import { explainRoute, priorityChecks } from "./presentation.ts";

test("cost, timing and early repayment preferences remain explicitly unconfirmed", () => {
  const checks = priorityChecks({ priorities: ["total-cost", "monthly", "speed", "early-repayment", "talk", "unknown", "__proto__"] });
  assert.equal(checks.length, 5);
  assert.match(checks[0].note, /Not yet comparable/);
  assert.match(checks[1].note, /increasing total cost/);
  assert.match(checks[2].note, /not a promised decision date/);
  assert.match(checks[3].note, /No fee-free early repayment is guaranteed/);
  assert.deepEqual(priorityChecks({}), []);
});

test("routes explain distinct structures and tradeoffs without a rank", () => {
  const ids = ["personal-instalment", "credit-line", "consolidation-plan", "balance-transfer", "renovation-loan", "education-loan", "business-term", "working-capital"];
  assert.equal(new Set(ids.map(id => explainRoute(id).reason)).size, ids.length);
  for (const id of ids) assert.ok(explainRoute(id).tradeoff.length > 20);
  assert.match(explainRoute("unknown").tradeoff, /need lender confirmation/);
});
