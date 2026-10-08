/**
 * Privacy-safe product analytics (brief §21). Events carry codes and counts
 * only, never answers, names, numbers or email addresses. Each event has an
 * allow-list of parameters; anything else is dropped, and any value that
 * could be personal data is refused before it reaches the data layer.
 */

export const eventParams = {
  assessment_started: ["source", "goal_preset"],
  assessment_step_viewed: ["step_id", "path_variant"],
  assessment_step_completed: ["step_id", "path_variant", "time_on_stage_ms", "answer_count"],
  assessment_validation_error: ["step_id", "field_id", "error_code"],
  assessment_answer_changed: ["step_id", "field_id"],
  assessment_branch_taken: ["step_id", "path_variant"],
  assessment_hard_gate: ["step_id", "reason_code"],
  assessment_restarted: ["step_id"],
  assessment_submitted: ["path_variant", "channel", "marketing_opt_in"],
  contact_channel_selected: ["channel", "consent_variant"],
  session_recovered: ["recovery_channel", "step_id"],
  // Part 5: handoff and processing (brief §9, M1)
  handoff_viewed: ["channel"],
  handoff_attempted: ["channel", "route_origin"],
  fallback_selected: ["from_channel", "to_channel"],
  email_link_requested: ["attempt"],
  email_delivery_status: ["status"],
  new_link_requested: ["reason_code"],
  handoff_resumed: ["channel", "time_since_handoff_bucket"],
  resume_failed: ["reason_code"],
  processing_started: ["path_variant"],
  processing_completed: ["result_status"],
  result_fetch_failed: ["step_id"],
  retry_clicked: ["step_id"],
  // Part 6: results and booking (brief §10)
  result_displayed: ["result_status", "route_count", "engine_version"],
  result_card_opened: ["route_id_safe", "position"],
  call_cta_selected: ["result_status", "cta_location"],
  call_declined: ["result_status"],
  revise_answers: ["result_status"],
  alt_help_clicked: ["resource"],
  notify_opt_in: ["opted_in"],
  booking_opened: ["booking_source", "rescheduling"],
  slot_selected: ["day_offset"],
  booking_failed: ["reason_code"],
  booking_confirmed: ["booking_source", "timezone_bucket", "format"],
  booking_cancelled: ["booking_source"],
  calendar_added: ["booking_source"],
} as const satisfies Record<string, readonly string[]>;

export type EventName = keyof typeof eventParams;
type ParamValue = string | number | boolean;
export type EventParams<E extends EventName> = Partial<Record<(typeof eventParams)[E][number], ParamValue>>;

/** Short codes such as "not-sure" or "ageBand": letters, digits, - and _, no spaces. */
const CODE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;
/** Six or more digits in a row could be a phone, ID or account number. */
const DIGIT_RUN = /\d{6,}/;
const NUMERIC_PARAMS = new Set([
  "time_on_stage_ms",
  "answer_count",
  "attempt",
  "route_count",
  "position",
  "day_offset",
]);

function safeValue(key: string, value: unknown): ParamValue | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    return NUMERIC_PARAMS.has(key) && Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined;
  }
  if (typeof value === "string" && CODE.test(value) && !DIGIT_RUN.test(value)) return value;
  return undefined;
}

/** Returns the event as it would be recorded, or null for an unknown event. Pure, for testing. */
export function sanitizeEvent(event: string, params: Record<string, unknown> = {}): Record<string, ParamValue> | null {
  if (!Object.hasOwn(eventParams, event)) return null;
  const allowed: readonly string[] = eventParams[event as EventName];
  const record: Record<string, ParamValue> = { event };
  for (const key of allowed) {
    const value = safeValue(key, params[key]);
    if (value !== undefined) record[key] = value;
  }
  return record;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Pushes to window.dataLayer for whichever analytics tool is approved later (brief §25). */
export function track<E extends EventName>(event: E, params: EventParams<E> = {}) {
  if (typeof window === "undefined") return;
  const record = sanitizeEvent(event, params);
  if (!record) return;
  window.dataLayer ??= [];
  window.dataLayer.push(record);
}

/** Entry points that may be recorded as the assessment's source. */
const SOURCES = new Set(["hero", "final", "header", "menu", "tile", "footer"]);

/** Coarse buckets, so timings can't identify anyone. */
export function sinceBucket(ms: number): string {
  if (ms < 5 * 60_000) return "lt-5m";
  if (ms < 60 * 60_000) return "5-60m";
  if (ms < 24 * 60 * 60_000) return "1-24h";
  return "gt-24h";
}
export const safeSource = (value: string | null | undefined) => (value && SOURCES.has(value) ? value : "direct");
