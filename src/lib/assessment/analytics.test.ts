import assert from "node:assert/strict";
import test from "node:test";
import { safeSource, sanitizeEvent } from "./analytics.ts";

test("known events keep only their allowed parameters", () => {
  assert.deepEqual(
    sanitizeEvent("assessment_step_completed", {
      step_id: "situation",
      path_variant: "personal",
      time_on_stage_ms: 15234.6,
      answer_count: 4,
      income: "4k-6k",
    }),
    {
      event: "assessment_step_completed",
      step_id: "situation",
      path_variant: "personal",
      time_on_stage_ms: 15235,
      answer_count: 4,
    },
  );
  assert.equal(sanitizeEvent("made_up_event", { step_id: "goal" }), null);
});

test("values that could be personal data are refused", () => {
  const record = sanitizeEvent("assessment_validation_error", {
    step_id: "review",
    field_id: "ana@example.com",
    error_code: "91234567",
  });
  assert.deepEqual(record, { event: "assessment_validation_error", step_id: "review" });
  assert.deepEqual(sanitizeEvent("assessment_started", { source: "Hero Banner", goal_preset: "renovation" }), {
    event: "assessment_started",
    goal_preset: "renovation",
  });
  // Numbers are only allowed where a count or duration is expected.
  assert.deepEqual(sanitizeEvent("assessment_answer_changed", { step_id: "goal", field_id: 91234567 }), {
    event: "assessment_answer_changed",
    step_id: "goal",
  });
});

test("booleans pass through", () => {
  assert.deepEqual(sanitizeEvent("assessment_submitted", { channel: "email", marketing_opt_in: false }), {
    event: "assessment_submitted",
    channel: "email",
    marketing_opt_in: false,
  });
});

test("only known entry points are recorded as a source", () => {
  assert.equal(safeSource("hero"), "hero");
  assert.equal(safeSource("https://evil.example"), "direct");
  assert.equal(safeSource(null), "direct");
});
