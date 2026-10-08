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
} as const satisfies Record<string, readonly string[]>;

export type EventName = keyof typeof eventParams;
type ParamValue = string | number | boolean;
export type EventParams<E extends EventName> = Partial<Record<(typeof eventParams)[E][number], ParamValue>>;

/** Short codes such as "not-sure" or "ageBand": letters, digits, - and _, no spaces. */
const CODE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;
/** Six or more digits in a row could be a phone, ID or account number. */
const DIGIT_RUN = /\d{6,}/;
const NUMERIC_PARAMS = new Set(["time_on_stage_ms", "answer_count"]);

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
export const safeSource = (value: string | null | undefined) => (value && SOURCES.has(value) ? value : "direct");
